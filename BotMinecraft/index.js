'use strict';

/**
 * index.js — Entry point utama aplikasi Minecraft Bot.
 *
 * File ini sengaja dibuat sesederhana mungkin.
 * Semua logika ada di dalam src/core/BotManager.js dan modul-modul lainnya.
 *
 * Tanggung jawab:
 * 1. Handle uncaught exceptions dan unhandled promise rejections
 * 2. Inisialisasi DataService (buat folder dan file default)
 * 3. Start BotManager
 * 4. Start Web Dashboard
 * 5. Start Services (StatsService, HealthCheck)
 * 6. Handle SIGINT/SIGTERM untuk graceful shutdown
 */

// Load config sebelum semua modul lain — ini juga load dotenv
const config = require('./src/config');
const { logger, createModuleLogger } = require('./src/utils/logger');

const log = createModuleLogger('App');

// Silence Mineflayer internal deprecation warning for physicTick -> physicsTick
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('physicTick')) return;
  return originalEmitWarning.call(process, warning, ...args);
};

// ── Catch global errors ───────────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  const msg = err ? err.message : '';
  if (msg.includes('ECONNRESET') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
    logger.warn(`[Network] Socket terputus oleh server (${msg}) — Reconnect akan berjalan...`);
    return;
  }
  logger.error(`[App] Uncaught Exception: ${msg}`, { stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (msg.includes('ECONNRESET') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
    logger.warn(`[Network] Socket terputus oleh server (${msg}) — Reconnect akan berjalan...`);
    return;
  }
  logger.warn(`[App] Unhandled Rejection: ${msg}`);
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function main() {
  log.info('========================================');
  log.info('   Minecraft AFK Bot v1.0.0');
  log.info(`   Env: ${config.env.nodeEnv}`);
  log.info(`   Server: ${config.env.serverHost}:${config.env.serverPort}`);
  log.info(`   Bot: ${config.env.botUsername}`);
  log.info('========================================');

  // Step 1: Inisialisasi folder dan file data
  const DataService = require('./src/services/DataService');
  const { sleep } = require('./src/utils/retry');
  await DataService.initDataDir();
  log.info('DataService: folder dan file data siap');

  // Step 2: Buat dan start BotManager (Mendukung Multi-Bot jika username dipisah koma)
  const BotManager = require('./src/core/BotManager');
  const StatsService = require('./src/services/StatsService');
  const HealthCheck = require('./src/services/HealthCheck');

  const rawUsernames = config.env.botUsername || 'BotNenel1';
  const usernames = rawUsernames.split(',').map((u) => u.trim()).filter(Boolean);

  const botManagers = [];
  const services = [];

  for (let i = 0; i < usernames.length; i++) {
    const name = usernames[i];
    log.info(`Inisialisasi bot #${i + 1}/${usernames.length}: ${name}`);

    const botManager = new BotManager(name);
    botManagers.push(botManager);

    const statsService = new StatsService(botManager);
    const healthCheck = new HealthCheck(botManager);
    statsService.start();
    healthCheck.start();
    services.push(statsService, healthCheck);

    botManager.start();

    if (i < usernames.length - 1) {
      log.info(`Menunggu 15 detik sebelum login bot berikutnya (${usernames[i + 1]}) untuk menghindari Anti-Bot IP rate limit...`);
      await sleep(15000);
    }
  }

  // Step 4: Start Web Dashboard (jika diaktifkan)
  if (config.env.webEnabled && botManagers.length > 0) {
    const { startWebServer } = require('./src/web/server');
    startWebServer(botManagers, services);
  } else {
    log.info('Web Dashboard dinonaktifkan (mode log-only untuk VPS/Panel)');
  }

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  async function shutdown(signal) {
    log.warn(`\nMenerima signal ${signal}. Menghentikan seluruh bot dengan graceful...`);

    services.forEach((s) => s.stop());
    botManagers.forEach((bm) => bm.stop());

    // Beri jeda 1.5 detik agar paket bot.quit() terkirim dan diproses server Minecraft secara sempurna
    await sleep(1500);

    log.info('Semua bot dihentikan secara bersih. Sampai jumpa!');
    process.exit(0);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
  process.on('SIGTERM', () => shutdown('SIGTERM')); // pm2 stop / systemctl stop
}

// Jalankan aplikasi
main().catch((err) => {
  logger.error(`Fatal error saat startup: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
