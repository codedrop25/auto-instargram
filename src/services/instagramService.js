import { IgApiClient } from 'instagram-private-api';
import 'dotenv/config';
import logger from '../config/logger.js';
import fs from 'fs-extra';
import path from 'path';

// 서버 환경에서는 data/session.json 파일이 반드시 존재해야 합니다.
const SESSION_FILE = path.join('data', 'session.json');

class InstagramService {
  constructor() {
    this.ig = new IgApiClient();
    this.ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
  }

  async login() {
    logger.info('인스타그램 로그인 절차 시작...');

    if (!await fs.pathExists(SESSION_FILE)) {
      logger.error('❌ 로그인 세션 파일(data/session.json)이 없습니다!');
      logger.error('로컬 PC에서 node create-session.js를 실행하여 세션 파일을 생성한 후 서버에 업로드해주세요.');
      return { success: false, reason: 'session_file_not_found' };
    }

    try {
      logger.info('기존 세션 파일을 불러옵니다...');
      await this.ig.state.deserialize(await fs.readJson(SESSION_FILE));
      logger.info('✅ 세션 불러오기 성공. 로그인을 건너뜁니다.');
      return { success: true };
    } catch (e) {
      logger.error('세션 파일을 불러오는 데 실패했습니다. 세션이 만료되었거나 손상된 것 같습니다.', e);
      logger.error('로컬 PC에서 node create-session.js를 다시 실행하여 세션 파일을 갱신해주세요.');
      return { success: false, reason: 'session_deserialize_failed' };
    }
  }

  async uploadPhoto(photoPath, caption) {
    try {
      logger.info(`사진 업로드 시도: ${photoPath}`);
      const imageBuffer = await fs.readFile(photoPath);
      const publishResult = await this.ig.publish.photo({
        file: imageBuffer,
        caption: caption,
      });
      logger.info('✅ 사진 업로드 성공');
      // 업로드 후 세션을 저장할 필요가 없습니다. 세션은 고정입니다.
      return { success: true, media: publishResult.media };
    } catch (error) {
      // 여기서 challenge가 발생하면, 세션이 만료된 것이므로, 사용자는 새 세션을 만들어야 합니다.
      if (error.name === 'IgCheckpointError') {
        logger.error('🔥 업로드 중 보안 인증이 필요합니다. 세션이 만료된 것 같습니다.');
        logger.error('로컬 PC에서 node create-session.js를 다시 실행하여 세션 파일을 갱신해주세요.');
      }
      logger.error('❌ 사진 업로드 실패:', error);
      return { success: false, error };
    }
  }
}

export default new InstagramService();