// 업로드 디버깅 스크립트
import 'dotenv/config';
import InstagramService from './src/services/instagramService.js';
import ClaudeService from './src/services/claudeService.js';
import logger from './src/config/logger.js';

async function debugUpload() {
  console.log('🔍 Instagram 업로드 디버깅 시작...');
  
  try {
    // 1. 환경 변수 확인
    console.log('\n📋 환경 변수 확인:');
    console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ 설정됨' : '❌ 없음');
    console.log('INSTAGRAM_USERNAME:', process.env.INSTAGRAM_USERNAME ? '✅ 설정됨' : '❌ 없음');
    console.log('INSTAGRAM_PASSWORD:', process.env.INSTAGRAM_PASSWORD ? '✅ 설정됨' : '❌ 없음');
    
    if (!process.env.INSTAGRAM_USERNAME || !process.env.INSTAGRAM_PASSWORD) {
      console.error('❌ Instagram 계정 정보가 없습니다!');
      return;
    }

    // 2. Claude 서비스 테스트
    console.log('\n🤖 Claude 서비스 테스트...');
    const claudeService = new ClaudeService();
    const postData = await claudeService.generatePost();
    console.log('✅ 게시글 생성 성공');
    console.log('📝 생성된 게시글:', postData.fullText.substring(0, 100) + '...');

    // 3. Instagram 서비스 초기화
    console.log('\n📱 Instagram 서비스 초기화...');
    const instagramService = new InstagramService();
    
    // 4. Instagram 로그인 테스트
    console.log('🔑 Instagram 로그인 시도...');
    await instagramService.login();
    console.log('✅ Instagram 로그인 성공');

    // 5. 이미지 생성 테스트
    console.log('🖼️ 기본 이미지 생성 중...');
    const imagePath = await instagramService.createDefaultImage();
    console.log('✅ 이미지 생성 성공:', imagePath);

    // 6. 실제 업로드 시도
    console.log('\n🚀 실제 업로드 시도...');
    console.log('⚠️  주의: 실제로 Instagram에 게시됩니다!');
    
    // 사용자 확인
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('계속 진행하시겠습니까? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ 업로드 취소됨');
      return;
    }

    const result = await instagramService.uploadPost(postData, imagePath);
    console.log('🎉 업로드 성공!');
    console.log('📊 결과:', {
      mediaId: result.media.id,
      pk: result.media.pk,
      caption: result.media.caption?.text?.substring(0, 50) + '...'
    });

  } catch (error) {
    console.error('\n❌ 오류 발생:');
    console.error('메시지:', error.message);
    console.error('스택:', error.stack);
    
    // Instagram 관련 특정 오류 처리
    if (error.message.includes('challenge_required')) {
      console.error('\n🚨 Instagram 보안 인증 필요:');
      console.error('- Instagram 앱에서 로그인하여 보안 인증 완료');
      console.error('- 2FA가 활성화된 경우 앱 비밀번호 사용');
      console.error('- VPN 사용 중이면 해제 후 시도');
    } else if (error.message.includes('login_required')) {
      console.error('\n🚨 로그인 실패:');
      console.error('- 사용자명/비밀번호 확인');
      console.error('- 계정이 잠겨있지 않은지 확인');
    } else if (error.message.includes('feedback_required')) {
      console.error('\n🚨 Instagram 제한:');
      console.error('- 너무 많은 요청으로 인한 일시적 제한');
      console.error('- 몇 시간 후 다시 시도');
    }
  }
}

debugUpload();
