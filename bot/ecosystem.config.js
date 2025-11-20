// PM2 конфигурация для IES CRM Bot
export default {
  apps: [{
    name: 'ies-crm-bot',
    script: 'index.js',
    interpreter: 'node',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    // Автоматически перезапускать при сбоях
    min_uptime: '10s',
    max_restarts: 10
  }]
};

