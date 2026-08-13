'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const config = require('../../config');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp: ts, botName, module, ...meta }) => {
  const bot = botName ? `[${botName}]` : '';
  const mod = module ? `[${module}]` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} ${level} ${bot}${mod} ${message}${metaStr}`;
});

const fileTransport = new transports.DailyRotateFile({
  dirname: path.resolve(config.monitor.logDir),
  filename: 'bot-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: `${config.monitor.maxLogFileSizeMb}m`,
  maxFiles: config.monitor.maxLogFiles,
  format: combine(timestamp(), errors({ stack: true }), logFormat),
});

const consoleTransport = new transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
});

const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [consoleTransport, fileTransport],
  exitOnError: false,
});

/**
 * Buat logger terstruktur dengan konteks botName & module.
 * Semua modul WAJIB menggunakan ini, bukan console.log.
 */
function createModuleLogger(botName, moduleName) {
  return {
    debug: (msg, meta = {}) => winstonLogger.debug(msg, { botName, module: moduleName, ...meta }),
    info: (msg, meta = {}) => winstonLogger.info(msg, { botName, module: moduleName, ...meta }),
    warn: (msg, meta = {}) => winstonLogger.warn(msg, { botName, module: moduleName, ...meta }),
    error: (msg, meta = {}) => winstonLogger.error(msg, { botName, module: moduleName, ...meta }),
  };
}

module.exports = { createModuleLogger, winstonLogger };
