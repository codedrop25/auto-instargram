import 'dotenv/config';
import cron from 'node-cron';
import logger from '../config/logger.js';
import Photo from '../models/Photo.js';
// 파일 경로의 대소문자를 수정합니다. (InstagramService.js -> instagramService.js)
import InstagramService from '../services/instagramService.js';
import ClaudeService from '../services/claudeService.js';
import path from 'path';
import db from '../config/database.js';

class CronScheduler {
  constructor() {
    this.claudeService = ClaudeService;
  }

  start() {
    logger.info('✅ 운영 스케줄러가 시작되었습니다.');
    // ecosystem.config.cjs의 cron_restart 설정에 따라 실행됩니다.
    this.runUploadJob('스케줄 실행');
  }

  async runUploadJob(jobName) {
    logger.info(`[${jobName}] 작업 시작...`);

    const loginResult = await InstagramService.login();
    if (!loginResult.success) {
      logger.error('인스타그램 로그인에 실패하여 작업을 중단합니다. 세션 파일을 갱신해야 할 수 있습니다.');
      // 로그인 실패 시, PM2가 자동으로 재시작하지 않도록 정상 종료 코드를 반환할 수 있습니다.
      // 또는 에러를 발생시켜 PM2가 재시도하게 할 수도 있습니다. 여기서는 일단 중단합니다.
      process.exit(1);
      return;
    }
    logger.info('✅ 인스타그램 로그인 성공.');

    const photo = await Photo.findOneUnused();
    if (!photo) {
      logger.warn('업로드할 사진이 없습니다. 다음 스케줄까지 대기합니다.');
      process.exit(0);
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
    
    logger.info('작업 완료. 다음 스케줄까지 대기합니다.');
    process.exit(0);
  }
}

const scheduler = new CronScheduler();
scheduler.start();

process.on('SIGINT', async () => {
    logger.info('스케줄러를 종료합니다.');
    await db.close();
    process.exit(0);
});