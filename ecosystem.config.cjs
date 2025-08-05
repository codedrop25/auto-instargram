const path = require('path');

module.exports = {
  apps: [
    {
      name: 'scheduler-tuesday',
      script: path.join(__dirname, 'src/scheduler/cron-scheduler.js'),
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      // 화요일 12시에 실행
      cron_restart: '0 12 * * 2',
      autorestart: false,
      watch: false,
      max_memory_restart: '200M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'scheduler-friday',
      script: path.join(__dirname, 'src/scheduler/cron-scheduler.js'),
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      // 금요일 17시에 실행
      cron_restart: '0 17 * * 5',
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
