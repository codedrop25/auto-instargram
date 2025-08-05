import fs from 'fs/promises';
import path from 'path';

async function setup() {
  console.log('🧸 Instagram Auto Post - 초기 설정');
  console.log('================================');

  try {
    // 필수 디렉토리 생성
    const directories = ['logs', 'data', 'images'];
    
    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ 디렉토리 생성: ${dir}/`);
      } catch (error) {
        console.log(`⚠️  디렉토리 이미 존재: ${dir}/`);
      }
    }

    // .env 파일 확인
    try {
      await fs.access('.env');
      console.log('✅ .env 파일이 존재합니다.');
    } catch (error) {
      console.log('⚠️  .env 파일이 없습니다. .env.example을 참고하여 생성해주세요.');
    }

    // package.json 확인
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    console.log(`✅ 프로젝트: ${packageJson.name} v${packageJson.version}`);

    console.log('\n📋 다음 단계:');
    console.log('1. .env 파일 설정 (API 키, Instagram 계정 등)');
    console.log('2. npm test - 테스트 실행');
    console.log('3. pm2 start ecosystem.config.js - PM2로 운영 시작');
    console.log('\n✅ 초기 설정 완료!');

  } catch (error) {
    console.error('❌ 설정 중 오류 발생:', error.message);
    process.exit(1);
  }
}

setup();
