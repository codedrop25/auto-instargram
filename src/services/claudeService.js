import Anthropic from '@anthropic-ai/sdk';
import logger from '../config/logger.js';

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // 사용자의 코멘트를 기반으로 게시글을 생성하는 함수
  async generatePost(userComment) {
    try {
      // 사용자 코멘트를 포함하여 프롬프트를 생성합니다.
      const prompt = this.createPrompt(userComment);
      
      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        temperature: 0.8,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const content = message.content[0].text;
      return this.parsePostContent(content);
    } catch (error) {
      logger.error('Claude API 요청 실패:', error);
      throw error;
    }
  }

  // 사용자 코멘트를 프롬프트에 통합합니다.
  createPrompt(userComment) {
    const currentDate = new Date().toLocaleDateString('ko-KR');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];

    return `
당신은 "레디"라는 사랑스러운 자취생 캐릭터입니다. 
🐾 귀엽고 친근한 성격
🏠 원룸 빌라에서 혼자 자취 중
💼 중소기업에 다니는 월급쟁이
📱 인스타그램을 자주 하는 일상 공유러

오늘 정보:
- 날짜: ${currentDate} (${dayOfWeek}요일)
- 오늘의 핵심 주제: "${userComment}"

다음 조건으로 위 주제에 대한 인스타그램 게시글을 작성해주세요:

📝 글 작성 가이드:
1. 캐릭터: 레디 (자취생의 리얼한 일상, 자학개그, 유머러스)
2. 핵심 아이덴티티: 사용자가 제공한 핵심 주제를 바탕으로, 원룸 자취생의 경험과 감정을 녹여내어 이야기를 확장해주세요.
3. 구성: 
   - 주제와 관련된 흥미로운 첫 문장 (1-2줄)
   - 주제에 대한 구체적인 경험이나 생각 (메인 내용, 3-5줄)
   - 자학개그나 모두가 공감할 만한 포인트 (1-2줄)
   - 마무리 질문이나 인사 (1줄)
4. 길이: 1500-2000자 내외
5. 톤: 밝고 유머러스하면서도 자학적, 공감대 형성
6. 이모지: 자연스럽게 사용 (🐾🏠💸😅🤣😭💕✨🍜🍕📱 등)

📱 인스타그램 최적화:
- 첫 문장은 흥미를 끄는 내용으로
- 중간중간 줄바꿈으로 가독성 향상
- 자취생들이 공감할 수 있는 리얼한 내용
- 일반인들도 이해하고 공감할 수 있게
- 자취의 어려움을 유머로 승화

🏷️ 해시태그 (8-12개):
주제와 관련된 해시태그와 아래의 기본 해시태그를 조합해주세요.
기본 해시태그: #레디 #자취생 #원룸생활 #일상 #개발자 (필요시)

응답 형식:
[본문 내용]

[해시태그들을 한 줄에]

참고: 사용자가 제공한 "${userComment}"라는 짧은 메모를 보고, 마치 레디가 직접 겪은 일인 것처럼 생생하고 재미있는 이야기로 만들어주세요!
`;
  }

  parsePostContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const hashtagIndex = lines.findIndex(line => line.includes('#'));
    
    let caption = '';
    let hashtags = '';

    if (hashtagIndex !== -1) {
      caption = lines.slice(0, hashtagIndex).join('\n').trim();
      hashtags = lines.slice(hashtagIndex).join(' ').trim();
    } else {
      caption = content.trim();
    }

    hashtags = this.cleanHashtags(hashtags);

    const maxLength = parseInt(process.env.MAX_CAPTION_LENGTH) || 2000;
    const fullText = `${caption}\n\n${hashtags}`;
    
    if (fullText.length > maxLength) {
      const availableLength = maxLength - hashtags.length - 20;
      caption = caption.substring(0, availableLength) + '...';
    }

    return {
      caption: caption,
      hashtags: hashtags,
      fullText: `${caption}\n\n${hashtags}`,
    };
  }

  cleanHashtags(hashtags) {
    if (!hashtags) return '';
    const hashtagArray = hashtags.match(/#[가-힣a-zA-Z0-9_]+/g) || [];
    const uniqueHashtags = [...new Set(hashtagArray)];
    const defaultHashtags = ['#레디', '#자취생', '#원룸생활', '#일상'];
    defaultHashtags.forEach(tag => {
      if (!uniqueHashtags.includes(tag)) {
        uniqueHashtags.push(tag);
      }
    });
    return uniqueHashtags.slice(0, 15).join(' ');
  }
}

export default new ClaudeService();