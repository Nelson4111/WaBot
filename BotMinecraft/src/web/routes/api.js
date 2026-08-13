'use strict';

const express = require('express');
const { createModuleLogger } = require('../../utils/logger');
const { getWaypoints } = require('../../services/DataService');
const CommandRegistry = require('../../commands/CommandRegistry');

const log = createModuleLogger('API');

/**
 * REST API routes untuk web dashboard (Mendukung Multi-Bot).
 *
 * Endpoint:
 *   GET  /api/status    → Status bot (health, food, posisi, mode, uptime)
 *   GET  /api/inventory → Isi inventory bot
 *   GET  /api/waypoints → Daftar waypoint
 *   GET  /api/stats     → Statistik bot
 *   GET  /api/bots      → Daftar bot aktif
 *   GET  /api/commands  → Daftar command terdaftar
 *   POST /api/command   → Eksekusi command dari dashboard (Mendukung targetBot: 'all' atau nama bot)
 *
 * @param {import('../../core/BotManager')|Array} botManagerInput
 * @param {import('../../services/StatsService')|Array} statsServiceInput
 * @returns {express.Router}
 */
function apiRoutes(botManagerInput, statsServiceInput) {
  const router = express.Router();
  const botManagers = Array.isArray(botManagerInput) ? botManagerInput : [botManagerInput];
  const statsServices = Array.isArray(statsServiceInput) ? statsServiceInput : [statsServiceInput];

  const getPrimaryManager = () => botManagers[0];
  const getPrimaryStats = () => statsServices[0];

  const getManagerByTarget = (target) => {
    if (!target || target === 'all') return botManagers;
    const found = botManagers.find(bm => (bm.bot && bm.bot.username.toLowerCase() === target.toLowerCase()) || (bm.username && bm.username.toLowerCase() === target.toLowerCase()));
    return found ? [found] : botManagers;
  };

  // GET /api/bots — Dapatkan daftar bot aktif
  router.get('/bots', (req, res) => {
    try {
      const bots = botManagers.map(bm => ({
        username: bm.bot ? bm.bot.username : (bm.username || 'Bot'),
        active: bm.isConnected
      }));
      res.json({ success: true, data: bots });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/status/all — Dapatkan status seluruh bot sekaligus
  router.get('/status/all', (req, res) => {
    try {
      const data = botManagers.map(bm => ({
        username: bm.bot ? bm.bot.username : (bm.username || 'Bot'),
        status: bm.getStatus()
      }));
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/status (Mendukung ?bot=<name>)
  router.get('/status', (req, res) => {
    try {
      const target = req.query.bot;
      const targetManagers = getManagerByTarget(target);
      const bm = targetManagers[0] || getPrimaryManager();
      const status = bm ? bm.getStatus() : { online: false };
      res.json({ success: true, data: status });
    } catch (err) {
      log.error(`GET /api/status error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/inventory/all — Dapatkan inventory seluruh bot sekaligus
  router.get('/inventory/all', (req, res) => {
    try {
      const data = botManagers.map(bm => {
        const username = bm.bot ? bm.bot.username : (bm.username || 'Bot');
        if (!bm.bot) {
          return { username, items: [], totalSlots: 0 };
        }
        const items = bm.bot.inventory.items().map(item => ({
          name: item.name,
          displayName: item.displayName,
          count: item.count,
          slot: item.slot
        }));
        return { username, items, totalSlots: items.length };
      });
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/inventory (Mendukung ?bot=<name>)
  router.get('/inventory', (req, res) => {
    try {
      const target = req.query.bot;
      const targetManagers = getManagerByTarget(target);
      const bm = targetManagers[0] || getPrimaryManager();
      const bot = bm ? bm.bot : null;
      if (!bot) {
        return res.json({ success: true, data: { items: [], totalSlots: 0 } });
      }

      const items = bot.inventory.items().map((item) => ({
        name: item.name,
        displayName: item.displayName,
        count: item.count,
        slot: item.slot,
      }));

      res.json({ success: true, data: { items, totalSlots: items.length } });
    } catch (err) {
      log.error(`GET /api/inventory error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/waypoints
  router.get('/waypoints', async (req, res) => {
    try {
      const waypoints = await getWaypoints();
      res.json({ success: true, data: waypoints });
    } catch (err) {
      log.error(`GET /api/waypoints error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/stats
  router.get('/stats', async (req, res) => {
    try {
      const statsService = getPrimaryStats();
      const stats = statsService ? await statsService.getFullStats() : {};
      res.json({ success: true, data: stats });
    } catch (err) {
      log.error(`GET /api/stats error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/commands — Dapatkan seluruh command terdaftar
  router.get('/commands', (req, res) => {
    try {
      const commands = CommandRegistry.getAllCommands();
      res.json({ success: true, data: commands });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/roles — Dapatkan peran seluruh bot dari data/bot_roles.json beserta status kesiapan waypoint/chest
  router.get('/roles', async (req, res) => {
    try {
      const { getBotRoles, getWaypoints, getSavedChests } = require('../../services/DataService');
      const roles = await getBotRoles();
      const waypoints = await getWaypoints();
      const chests = await getSavedChests();

      const hasWp2 = Boolean(waypoints['farm2'] || waypoints['farm']);
      const hasChests1 = Boolean(chests.length > 0);

      const rolesWithStatus = {};
      for (const [botName, r] of Object.entries(roles)) {
        const job = r.autoFarm || 'none';
        let ready = true;
        let note = 'Ready';

        if (job === 'farm1') {
          ready = hasChests1;
          note = hasChests1 ? 'Chest Ready ✅' : 'Chest Missing ⚠️';
        } else if (job === 'farm2') {
          ready = hasWp2;
          note = hasWp2 ? 'Waypoint Ready ✅' : 'Waypoint Missing ⚠️';
        }

        rolesWithStatus[botName] = {
          ...r,
          ready,
          note
        };
      }

      res.json({ success: true, data: rolesWithStatus });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/role — Ubah peran bot dari Web Dashboard
  router.post('/role', async (req, res) => {
    try {
      const { botName, autoFarm, autoGuard, role } = req.body;
      const { setBotRole } = require('../../services/DataService');
      if (!botName) return res.status(400).json({ success: false, error: 'botName wajib diisi' });

      const updated = await setBotRole(botName, { autoFarm, autoGuard, role });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/command — Eksekusi command dari dashboard (Support targetBot)
  router.post('/command', async (req, res) => {
    const { command, targetBot } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ success: false, error: 'Field "command" wajib diisi' });
    }

    const targets = getManagerByTarget(targetBot);
    log.info(`Command dari dashboard ("${command}") ditujukan ke target: ${targetBot || 'all'} (${targets.length} bot)`);

    try {
      let executedCount = 0;
      for (const bm of targets) {
        if (bm.bot && bm.isConnected) {
          await CommandRegistry.handleMessage(bm.bot, bm, '__dashboard__', command).catch(() => {});
          executedCount++;
        }
      }
      res.json({ success: true, message: `Command "${command}" dikirim ke ${executedCount} bot` });
    } catch (err) {
      log.error(`Error eksekusi command dashboard: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/health — Simple health check endpoint
  router.get('/health', (req, res) => {
    const bm = getPrimaryManager();
    res.json({
      status: 'ok',
      botOnline: bm ? bm.isConnected : false,
      activeBots: botManagers.filter(b => b.isConnected).length,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = apiRoutes;
