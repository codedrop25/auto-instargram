import logger from '../config/logger.js';
import ClaudeService from './claudeService.js';
import InstagramService from './instagramService.js';

class SchedulerService {
  constructor() {
    this.claudeService = new ClaudeService();
    this.instagramService = new InstagramService();
    this.isRunning = false;
    this.executionCount = 0;
    this.lastExecution = null;
  }

  async createAndUploadPost(testMode = false) {
    try {
      this.executionCount++;
      logger.info(`📝 게시글 생성 및 업로드 시작 (실행 횟수: ${this.executionCount})`);
      
      // 🔥 중요: Instagram 로그인을 먼저 확인!
      logger.info('🔐 Instagram 로그인 상태 확인 중...');
      
      try {
        // 기존 세션 정리 및 새로운 로그인 시도
        await this.instagramService.clearSession();
        const loginSuccess = await this.instagramService.login();
        
        if (!loginSuccess) {
          throw new Error('Instagram 로그인 실패');
        }
        
        // 로그인 상태 재확인
        const loginStatus = await this.instagramService.checkLoginStatus();
        if (!loginStatus) {
          throw new Error('Instagram 로그인 상태가 유효하지 않음');
        }
        
        logger.info('✅ Instagram 로그인 확인 완료 - 게시글 생성 시작');
        
      } catch (loginError) {
        logger.error('❌ Instagram 로그인 실패 - 게시글 생성 중단');
        logger.error(`로그인 에러: ${loginError.message}`);
        
        // Claude API 호출하지 않고 즉시 에러 반환
        throw new Error(`Instagram 로그인 실패: ${loginError.message}`);
      }

      // Instagram 로그인이 성공했으므로 이제 Claude API로 게시글 생성
      logger.info('🤖 Claude AI로 게시글 생성 중...');
      const postData = await this.claudeService.generatePost();
      
      // 생성된 게시글 검증
      const validation = this.claudeService.validateContent(postData);
      if (!validation.isValid) {
        logger.warn('⚠️ 생성된 게시글에 문제가 있습니다:', validation.issues);
        
        // 문제가 있어도 계속 진행하거나, 심각한 문제면 중단
        const criticalIssues = validation.issues.filter(issue => 
          issue.includes('너무 깁니다') || issue.includes('비어있습니다')
        );
        
        if (criticalIssues.length > 0) {
          throw new Error(`게시글 검증 실패: ${criticalIssues.join(', ')}`);
        }
      }

      logger.info('✅ 게시글 생성 완료', {
        captionLength: postData.caption.length,
        fullTextLength: postData.fullText.length,
        hashtagCount: (postData.hashtags.match(/#/g) || []).length
      });

      // 테스트 모드인 경우 업로드하지 않고 미리보기만
      if (testMode) {
        logger.info('🧪 테스트 모드 - 업로드하지 않음');
        console.log('\n' + '='.repeat(60));
        console.log('📝 생성된 게시글 미리보기');
        console.log('='.repeat(60));
        console.log(postData.fullText);
        console.log('='.repeat(60));
        console.log(`📊 통계: ${postData.fullText.length}자, 해시태그 ${(postData.hashtags.match(/#/g) || []).length}개`);
        console.log('='.repeat(60) + '\n');
        
        return {
          success: true,
          testMode: true,
          postData: postData,
          message: '테스트 모드: 게시글 생성 성공 (업로드하지 않음)'
        };
      }

      // 실제 Instagram 업로드
      logger.info('📱 Instagram에 게시글 업로드 중...');
      const uploadResult = await this.instagramService.uploadPost(postData);

      this.lastExecution = new Date().toISOString();
      
      logger.info('🎉 게시글 업로드 완료!', {
        mediaId: uploadResult.media.id,
        executionCount: this.executionCount,
        timestamp: this.lastExecution
      });

      return {
        success: true,
        testMode: false,
        postData: postData,
        uploadResult: uploadResult,
        executionCount: this.executionCount,
        message: 'Instagram 게시글 업로드 성공'
      };

    } catch (error) {
      logger.error('❌ 게시글 처리 실패:', error.message);
      logger.error('스택:', error.stack);
      
      // 에러 타입별 처리
      let errorCategory = 'UNKNOWN';
      let userMessage = error.message;
      
      if (error.message.includes('Instagram 로그인')) {
        errorCategory = 'INSTAGRAM_LOGIN';
        userMessage = 'Instagram 계정 로그인에 실패했습니다. 계정 정보를 확인해주세요.';
      } else if (error.message.includes('Claude') || error.message.includes('API')) {
        errorCategory = 'CLAUDE_API';
        userMessage = 'AI 게시글 생성에 실패했습니다. API 키를 확인해주세요.';
      } else if (error.message.includes('upload') || error.message.includes('publish')) {
        errorCategory = 'INSTAGRAM_UPLOAD';
        userMessage = 'Instagram 업로드에 실패했습니다. 다시 시도해주세요.';
      }
      
      this.handleError(error);
      
      return {
        success: false,
        error: error.message,
        errorCategory: errorCategory,
        userMessage: userMessage,
        executionCount: this.executionCount,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 테스트 모드로 실행 (실제 업로드하지 않음)
  async createAndTestPost() {
    return await this.createAndUploadPost(true);
  }

  // PM2 환경에서의 스케줄러 시작
  startScheduler(testMode = false) {
    this.isRunning = true;
    
    logger.info('⏰ PM2 기반 스케줄러 시작');
    logger.info(`🔄 시스템이 실행 중입니다... (테스트 모드: ${testMode})`);
    
    // PM2 환경에서는 cron으로 스케줄링하지 않고, 단일 실행으로 동작
    // ecosystem.config.js의 cron_restart로 주기적 실행 관리
    this.runScheduledTask(testMode);
  }

  async runScheduledTask(testMode = false) {
    try {
      // 실행 시간 체크 (지정된 시간에만 실행)
      const now = new Date();
      const hour = now.getHours();
      const targetHour = parseInt(process.env.SCHEDULE_HOUR) || 9;
      
      logger.info(`현재 시간: ${hour}시, 목표 시간: ${targetHour}시`);
      
      // 지정된 시간이거나 강제 실행일 때만 실행
      if (hour === targetHour || process.env.FORCE_RUN === 'true') {
        const result = await this.createAndUploadPost(testMode);
        
        if (!result.success) {
          logger.error('스케줄 실행 실패:', result.userMessage);
        }
      } else {
        logger.info(`⏰ 실행 시간이 아닙니다. ${targetHour}시에 실행됩니다.`);
      }
      
      // PM2 환경에서는 프로세스를 종료하여 다음 스케줄을 기다림
      setTimeout(() => {
        logger.info('📴 작업 완료. PM2가 다음 스케줄에 재시작합니다.');
        process.exit(0);
      }, 5000);
      
    } catch (error) {
      logger.error('스케줄된 작업 실행 실패:', error);
      // 에러 발생 시에도 프로세스 종료하여 PM2가 재시작할 수 있도록
      process.exit(1);
    }
  }

  stopScheduler() {
    this.isRunning = false;
    logger.info('스케줄러가 중지되었습니다.');
  }

  // 즉시 실행 (테스트용)
  async runNow(testMode = true) {
    try {
      return await this.createAndUploadPost(testMode);
    } catch (error) {
      logger.error('즉시 실행 실패:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      executionCount: this.executionCount,
      lastExecution: this.lastExecution,
      schedule: `매일 ${process.env.SCHEDULE_HOUR || 9}시`,
      nextExecution: this.getNextExecutionTime()
    };
  }

  getNextExecutionTime() {
    const now = new Date();
    const targetHour = parseInt(process.env.SCHEDULE_HOUR) || 9;
    const nextExecution = new Date(now);
    
    nextExecution.setHours(targetHour, 0, 0, 0);
    
    // 이미 오늘 실행 시간이 지났으면 내일로
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }
    
    return nextExecution.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  }

  handleError(error) {
    // 에러 처리 로직
    logger.error('시스템 에러 발생:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      executionCount: this.executionCount
    });

    // PM2 환경에서 에러 알림 (선택사항)
    if (process.env.NODE_ENV === 'production') {
      // 여기에 슬랙, 이메일 등 알림 로직 추가 가능
      logger.error('🚨 프로덕션 환경에서 에러 발생 - 관리자 확인 필요');
    }
  }

  // PM2 프로세스 정보 확인
  getPM2Info() {
    return {
      processId: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  // Instagram 로그인 상태만 확인하는 메서드
  async checkInstagramLogin() {
    try {
      logger.info('🔍 Instagram 로그인 상태 확인 중...');
      
      const loginStatus = await this.instagramService.checkLoginStatus();
      
      if (loginStatus) {
        logger.info('✅ Instagram 로그인 상태 정상');
        return { success: true, message: 'Instagram 로그인 상태 정상' };
      } else {
        logger.warn('⚠️ Instagram 로그인 필요');
        
        // 로그인 시도
        try {
          await this.instagramService.clearSession();
          const loginResult = await this.instagramService.login();
          
          if (loginResult) {
            logger.info('✅ Instagram 로그인 성공');
            return { success: true, message: 'Instagram 로그인 성공' };
          } else {
            throw new Error('로그인 실패');
          }
        } catch (loginError) {
          logger.error('❌ Instagram 로그인 실패:', loginError.message);
          return { 
            success: false, 
            message: `Instagram 로그인 실패: ${loginError.message}` 
          };
        }
      }
    } catch (error) {
      logger.error('❌ Instagram 로그인 확인 중 에러:', error.message);
      return { 
        success: false, 
        message: `로그인 확인 실패: ${error.message}` 
      };
    }
  }
}

export default SchedulerService;