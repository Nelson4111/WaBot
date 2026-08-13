'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// ── Pastikan direktori logs ada ─────────────────────────────────────────────
const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Custom Log Levels ───────────────────────────────────────────────────────
// Tambah level SUCCESS di antara INFO dan WARN
const CUSTOM_LEVELS = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: 'red bold',
    warn: 'yellow bold',
    success: 'green bold',
    info: 'cyan',
    debug: 'gray',
  },
};

winston.addColors(CUSTOM_LEVELS.colors);

// ── Format: timestamp + level + message ────────────────────────────────────
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat()
);

const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const msg = stack ? `${message}\n${stack}` : message;
    return `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
  })
);

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const msg = stack ? `${message}\n${stack}` : message;
    return `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
  })
);

// ── Transports ──────────────────────────────────────────────────────────────

/** Transport untuk semua log (combined) dengan rotasi harian */
const combinedTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
  level: 'debug',
});

/** Transport khusus error saja */
const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  format: fileFormat,
  level: 'error',
});

/** Transport console dengan warna */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  handleExceptions: true,
});

// ── Buat Logger Instance ────────────────────────────────────────────────────
const logger = winston.createLogger({
  levels: CUSTOM_LEVELS.levels,
  level: 'debug',
  transports: [combinedTransport, errorTransport, consoleTransport],
  exitOnError: false,
});

// ── Helper: log dengan prefix modul ─────────────────────────────────────────
/**
 * Buat child logger dengan prefix nama modul.
 * Digunakan agar log mudah dilacak asalnya dari modul mana.
 *
 * @param {string} moduleName - Nama modul (misal: 'BotManager', 'AutoAuth')
 * @returns {object} Logger dengan method info/warn/error/debug/success
 *
 * @example
 * const log = createModuleLogger('AutoAuth');
 * log.info('Login berhasil');
 * // Output: [INFO] [AutoAuth] Login berhasil
 */
function createModuleLogger(moduleName) {
  return {
    info: (msg, ...args) => logger.info(`[${moduleName}] ${msg}`, ...args),
    warn: (msg, ...args) => logger.warn(`[${moduleName}] ${msg}`, ...args),
    error: (msg, ...args) => logger.error(`[${moduleName}] ${msg}`, ...args),
    debug: (msg, ...args) => logger.debug(`[${moduleName}] ${msg}`, ...args),
    success: (msg, ...args) => logger.success(`[${moduleName}] ${msg}`, ...args),
  };
}

// ── Expose log buffer untuk Web Dashboard ───────────────────────────────────
/** Buffer menyimpan log terbaru untuk di-stream ke dashboard via SSE */
const LOG_BUFFER_MAX = 500;
const logBuffer = [];

/**
 * Custom Winston Transport yang mengisi buffer dan broadcast ke SSE.
 * Di-extend dari winston.Transport untuk kompatibilitas penuh.
 */
class BufferTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.name = 'buffer';
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    const entry = {
      timestamp: info.timestamp || new Date().toISOString(),
      level: info.level,
      message: info.message,
    };

    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_MAX) {
      logBuffer.shift();
    }

    // Broadcast ke SSE clients (lazy require untuk hindari circular dependency)
    setImmediate(() => {
      try {
        const { broadcastLog } = require('../web/routes/logs');
        broadcastLog(entry);
      } catch (_err) {
        // SSE belum siap — abaikan
      }
    });

    if (callback) callback();
  }
}

// Tambahkan buffer transport ke logger
logger.add(new BufferTransport({ level: 'debug' }));

module.exports = {
  logger,
  createModuleLogger,
  logBuffer,
};
