'use strict';

const { saveWaypoint, getWaypoint, getWaypoints, deleteWaypoint } = require('../services/DataService');
const { formatPosition } = require('../utils/formatter');
const { createModuleLogger } = require('../utils/logger');
const { sleep } = require('../utils/retry');

const log = createModuleLogger('WaypointCommand');

/**
 * !waypoint <sub-command> [nama]
 *
 * Sub-commands:
 *   !waypoint add <nama>    → Simpan posisi bot saat ini sebagai waypoint
 *   !waypoint go <nama>     → Navigasi ke waypoint
 *   !waypoint list          → Tampilkan semua waypoint
 *   !waypoint delete <nama> → Hapus waypoint
 */
const WaypointCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   * @param {string[]} args
   */
  async handle(bot, botManager, args) {
    const subCmd = (args[0] || '').toLowerCase();
    const name = args[1];

    switch (subCmd) {
      case 'add':
      case 'save':
        await handleAdd(bot, botManager, name);
        break;
      case 'go':
      case 'goto':
        await handleGo(bot, botManager, name);
        break;
      case 'list':
      case 'ls':
        await handleList(bot, botManager);
        break;
      case 'delete':
      case 'del':
      case 'remove':
        await handleDelete(bot, botManager, name);
        break;
      default:
        botManager.getModules().chatQueue.send('Usage: !waypoint add/go/list/delete <nama>');
    }
  },
};

async function handleAdd(bot, botManager, name) {
  if (!name) {
    botManager.getModules().chatQueue.send('Usage: !waypoint add <nama>');
    return;
  }

  if (!bot.entity?.position) {
    botManager.getModules().chatQueue.send('Posisi bot tidak tersedia saat ini');
    return;
  }

  await saveWaypoint(name, bot.entity.position);
  const pos = formatPosition(bot.entity.position);
  botManager.getModules().chatQueue.send(`Waypoint '${name}' disimpan di ${pos}`);
  log.success(`Waypoint '${name}' disimpan di ${pos}`);
}

async function handleGo(bot, botManager, name) {
  if (!name) {
    botManager.getModules().chatQueue.send('Usage: !waypoint go <nama>');
    return;
  }

  const waypoint = await getWaypoint(name);
  if (!waypoint) {
    botManager.getModules().chatQueue.send(`Waypoint '${name}' tidak ditemukan. Gunakan !waypoint list untuk melihat daftar.`);
    return;
  }

  const { pathfinder } = botManager.getModules();
  if (!pathfinder) {
    botManager.getModules().chatQueue.send('Pathfinder tidak tersedia');
    return;
  }

  botManager.getModules().chatQueue.send(`Menuju waypoint '${name}'...`);

  try {
    await pathfinder.goto(waypoint.x, waypoint.z, waypoint.y);
    botManager.getModules().chatQueue.send(`Sampai di waypoint '${name}'!`);
  } catch (err) {
    botManager.getModules().chatQueue.send(`Gagal: ${err.message}`);
  }
}

async function handleList(bot, botManager) {
  const waypoints = await getWaypoints();
  const entries = Object.entries(waypoints);

  if (entries.length === 0) {
    botManager.getModules().chatQueue.send('Belum ada waypoint yang disimpan');
    return;
  }

  botManager.getModules().chatQueue.send(`=== Waypoints (${entries.length}) ===`);
  await sleep(200);

  for (const [wpName, pos] of entries) {
    botManager.getModules().chatQueue.send(`${wpName}: X:${pos.x} Y:${pos.y} Z:${pos.z}`);
    await sleep(150);
  }
}

async function handleDelete(bot, botManager, name) {
  if (!name) {
    botManager.getModules().chatQueue.send('Usage: !waypoint delete <nama>');
    return;
  }

  const deleted = await deleteWaypoint(name);
  if (deleted) {
    botManager.getModules().chatQueue.send(`Waypoint '${name}' dihapus`);
  } else {
    botManager.getModules().chatQueue.send(`Waypoint '${name}' tidak ditemukan`);
  }
}

module.exports = WaypointCommand;
