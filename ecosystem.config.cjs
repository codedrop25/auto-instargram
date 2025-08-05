const path = require('path');

// CommonJS 방식에서는 __dirname을 바로 사용할 수 있습니다.
module.exports = {
  apps: [
    {
      name: 'instagram-scheduler',
      // path.join을 사용하여 스크립트의 절대 경로를 동적으로 생성합니다.
      script: path.join(__dirname, 'src/scheduler/cron-scheduler.js'),
      cwd: __dirname, // cwd도 동적으로 설정하여 일관성을 유지합니다.
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 12,17 * * *',
      autorestart: false,
      watch: false,
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'instagram-web',
      script: path.join(__dirname, 'src/web/server.js'),
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        WEB_PORT: 3000,
      },
    },
  ],
};
