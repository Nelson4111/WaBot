module.exports = {
  apps: [
    {
      name: 'botminecraft2',
      script: 'index.js',
      watch: false,
      autorestart: true,
      restart_delay: 10000,
      max_restarts: 50,
      min_uptime: '30s',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
