import fs from 'fs/promises';
import path from 'path';

async function clean() {
  console.log('🧹 프로젝트 정리 중...');
  console.log('====================');

  try {
    // 로그 파일 정리
    const logDir = 'logs';
    try {
      const files = await fs.readdir(logDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          await fs.unlink(path.join(logDir, file));
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ 로그 파일 ${deletedCount}개 정리 완료`);
      } else {
        console.log('📝 정리할 로그 파일이 없습니다');
      }
    } catch (error) {
      console.log('⚠️  logs 디렉토리가 없습니다');
    }

    // 임시 데이터 파일 정리
    const dataDir = 'data';
    try {
      const files = await fs.readdir(dataDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.startsWith('temp_') || file.endsWith('.tmp')) {
          await fs.unlink(path.join(dataDir, file));
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ 임시 파일 ${deletedCount}개 정리 완료`);
      } else {
        console.log('📁 정리할 임시 파일이 없습니다');
      }
    } catch (error) {
      console.log('⚠️  data 디렉토리가 없습니다');
    }

    // 임시 이미지 파일 정리
    const imageDir = 'images';
    try {
      const files = await fs.readdir(imageDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.startsWith('temp_') || file.endsWith('.tmp')) {
          await fs.unlink(path.join(imageDir, file));
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ 임시 이미지 ${deletedCount}개 정리 완료`);
      } else {
        console.log('🖼️  정리할 임시 이미지가 없습니다');
      }
    } catch (error) {
      console.log('⚠️  images 디렉토리가 없습니다');
    }

    console.log('\n✅ 정리 완료!');

  } catch (error) {
    console.error('❌ 정리 중 오류 발생:', error.message);
    process.exit(1);
  }
}

clean();
