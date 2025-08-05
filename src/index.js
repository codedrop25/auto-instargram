import 'dotenv/config';
import logger from './config/logger.js';
import CronScheduler from './scheduler/cron-scheduler.js';
import WebServer from './web/server.js';

logger.info('🚀 애플리케이션을 시작합니다.');

// 스케줄러 시작
CronScheduler.start();

// 웹 서버는 별도로 실행 (npm run web)