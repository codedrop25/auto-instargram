export default {
  apps: [
    {
      name: 'instagram-scheduler',
      script: 'src/scheduler/cron-scheduler.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 12,17 * * *', // 매일 12시와 17시에 재시작하여 스케줄 실행
      autorestart: false, // cron으로만 재시작
      watch: false,
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'instagram-web',
      script: 'src/web/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        WEB_PORT: 3000, // 서버에서 사용할 포트
      },
    },
  ],
};