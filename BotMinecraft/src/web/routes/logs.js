'use strict';

const express = require('express');
const { logBuffer } = require('../../utils/logger');
const { createModuleLogger } = require('../../utils/logger');

const log = createModuleLogger('LogsRoute');

/** Set semua SSE client yang aktif */
const sseClients = new Set();

/**
 * Log SSE (Server-Sent Events) routes.
 *
 * GET /api/logs/stream  → SSE stream log real-time
 * GET /api/logs/history → Ambil log buffer yang sudah ada
 *
 * Menggunakan SSE daripada WebSocket karena:
 * - Unidirectional (server → client) cukup untuk use case ini
 * - Tidak butuh library tambahan
 * - Auto-reconnect built-in di browser
 *
 * @returns {express.Router}
 */
function logsRoutes() {
  const router = express.Router();

  // GET /api/logs/stream — SSE endpoint
  router.get('/stream', (req, res) => {
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Penting untuk Nginx proxy
    res.flushHeaders();

    // Kirim log yang sudah ada di buffer (history)
    const recentLogs = logBuffer.slice(-50); // 50 log terakhir
    for (const entry of recentLogs) {
      sendSseEvent(res, 'log', entry);
    }

    // Tambahkan client ke set
    sseClients.add(res);
    log.debug(`SSE client terhubung. Total: ${sseClients.size}`);

    // Heartbeat setiap 30 detik untuk mencegah timeout
    const heartbeat = setInterval(() => {
      res.write('data: {"type":"ping"}\n\n');
    }, 30_000);

    // Bersihkan saat client disconnect
    req.on('close', () => {
      sseClients.delete(res);
      clearInterval(heartbeat);
      log.debug(`SSE client disconnect. Total: ${sseClients.size}`);
    });
  });

  // GET /api/logs/history — Ambil log history (JSON, bukan SSE)
  router.get('/history', (req, res) => {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = logBuffer.slice(-limit);
    res.json({ success: true, data: logs, total: logs.length });
  });

  return router;
}

/**
 * Kirim SSE event ke satu response stream.
 *
 * @param {express.Response} res
 * @param {string} event - Nama event
 * @param {object} data - Data yang akan dikirim
 */
function sendSseEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Broadcast log entry ke semua SSE client yang terhubung.
 * Dipanggil dari logger.js saat ada log baru.
 *
 * @param {object} logEntry - Entry log { timestamp, level, message }
 */
function broadcastLog(logEntry) {
  for (const client of sseClients) {
    try {
      sendSseEvent(client, 'log', logEntry);
    } catch (_err) {
      sseClients.delete(client);
    }
  }
}

module.exports = logsRoutes;
module.exports.broadcastLog = broadcastLog;
