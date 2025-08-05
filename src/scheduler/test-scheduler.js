import 'dotenv/config';
import cron from 'node-cron';
import logger from '../config/logger.js';
import Photo from '../models/Photo.js';
import InstagramService from '../services/InstagramService.js';
import ClaudeService from '../services/claudeService.js';
import path from 'path';
import db from '../config/database.js';

class TestScheduler {
  constructor() {
    this.claudeService = ClaudeService;
  }

  start() {
    logger.info('🧪 서버용 테스트 스케줄러를 시작합니다. (5분 간격)');
    cron.schedule('*/5 * * * *', () => this.runUploadJob('5분 스케줄'), { scheduled: true, timezone: 'Asia/Seoul' });
    logger.info('🚀 첫 작업을 즉시 실행합니다...');
    this.runUploadJob('초기 실행');
  }

  async runUploadJob(jobName) {
    logger.info(`[${jobName}] 작업 시작...`);

    const loginResult = await InstagramService.login();
    if (!loginResult.success) {
      logger.error('인스타그램 로그인에 실패하여 작업을 중단합니다. 로그를 확인해주세요.');
      return;
    }
    logger.info('✅ 인스타그램 로그인 성공.');

    const photo = await Photo.findOneUnused();
    if (!photo) {
      logger.warn('업로드할 사진이 없습니다.');
      return;
    }
    logger.info(`- 게시할 사진: #${photo.id} (${photo.filename})`);

    logger.info(`- 사용자 코멘트: "${photo.comment}"`);
    logger.info('🤖 Claude AI로 게시글 생성 중...');
    const postData = await this.claudeService.generatePost(photo.comment);
    logger.info('✅ AI 게시글 생성 완료.');

    const photoPath = path.join(process.env.UPLOAD_PATH || 'uploads', photo.filename);
    const uploadResult = await InstagramService.uploadPhoto(photoPath, postData.fullText);

    if (uploadResult.success) {
      await Photo.updateStatus(photo.id, 'used', uploadResult.media.id);
      logger.info(`🎉 사진 #${photo.id} 업로드 및 상태 업데이트 완료!`);
    } else {
      logger.error(`🔥 최종적으로 사진 #${photo.id} 업로드에 실패했습니다.`);
    }
  }
}

const scheduler = new TestScheduler();
scheduler.start();

process.on('SIGINT', async () => {
    logger.info('테스트 스케줄러를 종료합니다.');
    await db.close();
    process.exit(0);
});
