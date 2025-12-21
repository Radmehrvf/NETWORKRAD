module.exports = {
  apps: [{
    name: 'networkrad-backend',
    script: './server.js',
    cwd: '/var/www/mysite1/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/www/mysite1/backend/logs/error.log',
    out_file: '/var/www/mysite1/backend/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
