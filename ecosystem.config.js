module.exports = {
  apps: [
    {
      name: 'instagram-auto-post',
      script: 'src/index.js',
      args: 'schedule',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      cron_restart: '0 9 * * *', // 매일 오전 9시에 재시작하여 게시글 업로드
      min_uptime: '10s',
      max_restarts: 5,
      exec_mode: 'fork',
      kill_timeout: 5000,
      listen_timeout: 3000,
      restart_delay: 1000
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/instagram-auto-post.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
