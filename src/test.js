import 'dotenv/config';
import ClaudeService from './services/claudeService.js';
import InstagramService from './services/instagramService.js';
import logger from './config/logger.js';

async function testClaudeService() {
  console.log('\n🧪 Claude 서비스 테스트');
  console.log('='.repeat(50));
  
  try {
    const claudeService = new ClaudeService();
    const post = await claudeService.generateTestPost();
    
    console.log('✅ Claude 게시글 생성 성공!');
    console.log('\n📝 생성된 게시글:');
    console.log('-'.repeat(50));
    console.log(post.fullText);
    console.log('-'.repeat(50));
    console.log(`📊 전체 길이: ${post.fullText.length}자`);
    console.log(`📝 본문 길이: ${post.caption.length}자`);
    console.log(`🏷️ 해시태그: ${post.hashtags}`);
    
    return true;
  } catch (error) {
    console.error('❌ Claude 서비스 테스트 실패:', error.message);
    return false;
  }
}

async function testInstagramService() {
  console.log('\n🧪 Instagram 서비스 테스트');
  console.log('='.repeat(50));
  
  try {
    const instagramService = new InstagramService();
    
    // 테스트용 게시글 데이터
    const testPost = {
      caption: '🐾 안녕하세요! 레디입니다!\n\n오늘도 열심히 코딩 중이에요! 💻✨',
      hashtags: '#코딩 #개발자 #프로그래밍 #일상 #레디',
      fullText: '🐾 안녕하세요! 레디입니다!\n\n오늘도 열심히 코딩 중이에요! 💻✨\n\n#코딩 #개발자 #프로그래밍 #일상 #레디'
    };
    
    // 테스트 업로드 (실제 업로드하지 않음)
    await instagramService.uploadPost(testPost);
    
    console.log('✅ Instagram 서비스 테스트 성공!');
    return true;
  } catch (error) {
    console.error('❌ Instagram 서비스 테스트 실패:', error.message);
    return false;
  }
}

async function testImageGeneration() {
  console.log('\n🧪 이미지 생성 테스트');
  console.log('='.repeat(50));
  
  try {
    const instagramService = new InstagramService();
    const imagePath = await instagramService.createDefaultImage();
    
    console.log(`✅ 기본 이미지 생성 성공: ${imagePath}`);
    return true;
  } catch (error) {
    console.error('❌ 이미지 생성 테스트 실패:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n🧪 환경 변수 테스트');
  console.log('='.repeat(50));
  
  const requiredVars = [
    'ANTHROPIC_API_KEY',
    'INSTAGRAM_USERNAME',
    'INSTAGRAM_PASSWORD',
    'SCHEDULE_CRON'
  ];
  
  let allValid = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: 설정됨`);
    } else {
      console.log(`❌ ${varName}: 설정되지 않음`);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log('✅ 모든 환경 변수가 설정되었습니다!');
  } else {
    console.log('❌ 일부 환경 변수가 설정되지 않았습니다.');
  }
  
  return allValid;
}

async function runAllTests() {
  console.log('🐾 Instagram Auto Post 시스템 테스트 시작');
  console.log('='.repeat(60));
  
  const tests = [
    { name: '환경 변수', fn: testEnvironmentVariables },
    { name: 'Claude 서비스', fn: testClaudeService },
    { name: 'Instagram 서비스', fn: testInstagramService },
    { name: '이미지 생성', fn: testImageGeneration }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`테스트 실행 중 오류 발생 (${test.name}):`, error);
      results.push({ name: test.name, success: false });
    }
  }
  
  // 결과 요약
  console.log('\n📊 테스트 결과 요약');
  console.log('='.repeat(60));
  
  let passedTests = 0;
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.success) passedTests++;
  }
  
  console.log('='.repeat(60));
  console.log(`총 ${results.length}개 테스트 중 ${passedTests}개 통과`);
  
  if (passedTests === results.length) {
    console.log('🎉 모든 테스트가 성공했습니다!');
    console.log('다음 명령어로 시스템을 시작할 수 있습니다:');
    console.log('  npm start schedule  - 스케줄러 시작');
    console.log('  npm start test      - 테스트 게시글 생성');
    console.log('  npm start now       - 즉시 게시글 업로드');
  } else {
    console.log('❌ 일부 테스트가 실패했습니다. 설정을 확인해주세요.');
  }
}

// 개별 테스트 실행을 위한 명령행 인터페이스
const args = process.argv.slice(2);
const testName = args[0];

switch (testName) {
  case 'env':
    testEnvironmentVariables();
    break;
  case 'claude':
    testClaudeService();
    break;
  case 'instagram':
    testInstagramService();
    break;
  case 'image':
    testImageGeneration();
    break;
  default:
    runAllTests();
}
