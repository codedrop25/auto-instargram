import 'dotenv/config';
import db from '../src/config/database.js';
import logger from '../src/config/logger.js';

const setupDatabase = async () => {
  try {
    logger.info('🚀 데이터베이스 설정 시작...');
    const connection = await db.getConnection();
    logger.info('✅ 데이터베이스 연결 성공');

    const createPhotosTable = `
      CREATE TABLE IF NOT EXISTS photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        comment TEXT,
        status ENUM('not_used', 'used') NOT NULL DEFAULT 'not_used',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        posted_at TIMESTAMP NULL,
        instagram_media_id VARCHAR(255) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createPhotosTable);
    logger.info('✅ "photos" 테이블 생성 완료');

    connection.release();
    logger.info('🔗 데이터베이스 연결 해제');

    logger.info('🎉 데이터베이스 설정이 성공적으로 완료되었습니다.');
    return { success: true };

  } catch (error) {
    logger.error('❌ 데이터베이스 설정 실패:', error);
    return { success: false, error: error.message };

  } finally {
    await db.close();
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().then(result => {
    if (!result.success) {
      process.exit(1);
    }
    process.exit(0);
  });
}

export default setupDatabase;
