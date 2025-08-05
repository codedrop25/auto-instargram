// API 키 테스트 스크립트
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

async function testApiKey() {
  console.log('🔑 Anthropic API 키 테스트 중...');
  
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: "안녕하세요! API 연결 테스트입니다. 간단한 인사말을 해주세요."
      }]
    });

    console.log('✅ API 키가 정상적으로 작동합니다!');
    console.log('📝 Claude 응답:', message.content[0].text);
    
    // 사용량 정보
    console.log('\n📊 토큰 사용량:');
    console.log(`입력 토큰: ${message.usage.input_tokens}`);
    console.log(`출력 토큰: ${message.usage.output_tokens}`);
    console.log(`총 토큰: ${message.usage.input_tokens + message.usage.output_tokens}`);
    
  } catch (error) {
    console.error('❌ API 키 테스트 실패:');
    
    if (error.status === 401) {
      console.error('🚫 API 키가 유효하지 않습니다. 키를 다시 확인해주세요.');
    } else if (error.status === 429) {
      console.error('⏱️ 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.status === 400) {
      console.error('📝 요청 형식이 올바르지 않습니다.');
    } else {
      console.error('🔧 기타 오류:', error.message);
    }
  }
}

// 환경 변수 확인
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY가 .env 파일에 설정되지 않았습니다.');
  console.log('💡 .env 파일에 다음과 같이 추가해주세요:');
  console.log('ANTHROPIC_API_KEY=sk-ant-api03-your-key-here');
  process.exit(1);
}

testApiKey();
