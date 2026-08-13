'use strict';

const express = require('express');
const path = require('path');
const { createModuleLogger } = require('../utils/logger');
const config = require('../config');
const apiRoutes = require('./routes/api');
const logsRoutes = require('./routes/logs');

const log = createModuleLogger('WebServer');

/**
 * Buat dan konfigurasi Express HTTP server untuk web dashboard.
 *
 * @param {import('../core/BotManager')} botManager
 * @param {import('../services/StatsService')} statsService
 * @returns {object} Express app yang sudah dikonfigurasi
 */
function createWebServer(botManagers, services) {
  const app = express();

  // ── Middleware ───────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Serve static files (dashboard HTML/CSS/JS)
  app.use(express.static(path.join(__dirname, 'public')));

  // Request logging (minimal)
  app.use((req, res, next) => {
    log.debug(`${req.method} ${req.path}`);
    next();
  });

  // ── Routes ───────────────────────────────────────────────────────────────
  app.use('/api', apiRoutes(botManagers, services));
  app.use('/api/logs', logsRoutes());

  // Catch-all: semua route yang tidak dikenal → kirim index.html (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // ── Error Handler ────────────────────────────────────────────────────────
  app.use((err, req, res, _next) => {
    log.error(`Web error: ${err.message}`);
    res.status(500).json({ error: err.message });
  });

  return app;
}

/**
 * Start web server di port yang dikonfigurasi.
 *
 * @param {Array} botManagers
 * @param {Array} services
 * @returns {void}
 */
function startWebServer(botManagers, services) {
  const app = createWebServer(botManagers, services);
  const port = config.env.webPort;

  app.listen(port, '0.0.0.0', () => {
    log.success(`Web dashboard berjalan di http://localhost:${port}`);
  });

  return app;
}

module.exports = { createWebServer, startWebServer };
