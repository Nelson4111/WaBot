'use strict';

/**
 * PM2 Ecosystem Config
 *
 * Cara penggunaan:
 *   pm2 start ecosystem.config.js       → Start bot
 *   pm2 stop minecraft-bot              → Stop bot
 *   pm2 restart minecraft-bot           → Restart bot
 *   pm2 reload minecraft-bot            → Graceful reload
 *   pm2 logs minecraft-bot              → Lihat log
 *   pm2 monit                           → Monitor semua proses
 *   pm2 save                            → Simpan konfigurasi untuk auto-start
 *   pm2 startup                         → Aktifkan auto-start saat reboot VPS
 */
module.exports = {
  apps: [
    {
      name: 'minecraft-bot',
      script: './index.js',

      // Jangan watch file changes (production)
      watch: false,

      // Restart otomatis jika crash
      autorestart: true,

      // Delay sebelum restart (ms)
      restart_delay: 5000,

      // Maksimum restart sebelum PM2 menyerah (0 = unlimited)
      max_restarts: 0,

      // Batas memory sebelum PM2 restart proses (misal: 512mb)
      max_memory_restart: '512M',

      // Log file
      output: './logs/pm2-out.log',
      error: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Merge logs (tidak pisah per instance)
      merge_logs: true,

      // Environment variables untuk production
      env: {
        NODE_ENV: 'production',
      },

      // Environment variables untuk development
      env_development: {
        NODE_ENV: 'development',
      },

      // Graceful shutdown timeout (ms)
      kill_timeout: 10000,

      // Restart saat OOM
      node_args: '--max-old-space-size=512',

      // Instance hanya 1 (tidak perlu cluster untuk bot)
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
