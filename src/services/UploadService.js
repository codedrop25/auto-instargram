import Photo from '../models/Photo.js';
import InstagramService from './InstagramService.js';
import logger from '../config/logger.js';
import path from 'path';

class UploadService {
  constructor() {}

  async processUpload() {
    try {
      logger.info('🔄 자동 업로드 프로세스 시작');

      // 1. 미사용 사진 중 가장 오래된 것 가져오기
      const photo = await Photo.getOldestUnused();
      
      if (!photo) {
        logger.warn('업로드할 미사용 사진이 없습니다.');
        return {
          success: false,
          message: '업로드할 미사용 사진이 없습니다.',
          userMessage: '업로드 대기 중인 사진이 없습니다. 웹 콘솔에서 새 사진을 업로드해주세요.'
        };
      }

      logger.info(`선택된 사진: ${photo.filename} (ID: ${photo.id})`);

      // 2. 사진 파일 경로 생성
      const photoPath = path.join(process.env.UPLOAD_PATH || 'uploads/', photo.filename);

      // 3. Instagram 업로드 실행
      const uploadResult = await InstagramService.uploadPhoto(photoPath, photo.comment);
      
      if (!uploadResult.success) {
        logger.error('Instagram 업로드 실패:', uploadResult.error);
        return {
          success: false,
          message: uploadResult.error,
          userMessage: uploadResult.userMessage || '인스타그램 업로드에 실패했습니다.'
        };
      }

      // 4. 업로드 성공 시 사진 상태를 '사용됨'으로 변경
      await Photo.markAsUsed(photo.id);

      logger.info(`✅ 자동 업로드 완료: ${photo.filename}`);
      
      return {
        success: true,
        photo: {
          id: photo.id,
          filename: photo.filename,
          comment: photo.comment
        },
        instagram: {
          mediaId: uploadResult.mediaId,
          mediaUrl: uploadResult.mediaUrl
        },
        message: '사진이 성공적으로 업로드되었습니다.'
      };
    } catch (error) {
      logger.error('자동 업로드 프로세스 실패:', error);
      return {
        success: false,
        message: error.message,
        userMessage: '업로드 중 오류가 발생했습니다.'
      };
    }
  }

  async testUpload() {
    try {
      logger.info('🧪 업로드 테스트 시작');

      // 미사용 사진 확인
      const photo = await Photo.getOldestUnused();
      
      if (!photo) {
        return {
          success: false,
          message: '테스트할 미사용 사진이 없습니다.',
          userMessage: '업로드 대기 중인 사진이 없습니다.'
        };
      }

      // Instagram 로그인 상태만 확인
      const loginCheck = await InstagramService.checkLoginStatus();
      
      if (!loginCheck.success) {
        return {
          success: false,
          message: 'Instagram 로그인 실패',
          userMessage: loginCheck.userMessage || 'Instagram 로그인에 실패했습니다.'
        };
      }

      logger.info(`✅ 업로드 테스트 완료 - 다음 사진이 업로드 예정: ${photo.filename}`);
      
      return {
        success: true,
        photo: {
          id: photo.id,
          filename: photo.filename,
          comment: photo.comment,
          created_at: photo.created_at
        },
        message: '테스트 완료 - 업로드 준비 상태입니다.'
      };
    } catch (error) {
      logger.error('업로드 테스트 실패:', error);
      return {
        success: false,
        message: error.message,
        userMessage: '테스트 중 오류가 발생했습니다.'
      };
    }
  }

  async getUploadStats() {
    try {
      const stats = await Photo.getStats();
      
      return {
        success: true,
        stats: {
          total: stats.total,
          pending: stats.not_used || 0,
          completed: stats.used || 0
        }
      };
    } catch (error) {
      logger.error('업로드 통계 조회 실패:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new UploadService();
