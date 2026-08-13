'use strict';

const { createModuleLogger } = require('../utils/logger');
const { getBotRoles, setBotRole } = require('../services/DataService');
const FarmCommand = require('./FarmCommand');

const log = createModuleLogger('RoleCommand');

/**
 * Command !role & !job — Kelola dan ganti pekerjaan bot (farm1: Crop, farm2: Mob, farm3: Stone Generator)
 * Usage:
 *   !job farm1  -> Ganti pekerjaan bot target ke Crop Farm
 *   !job farm2  -> Ganti pekerjaan bot target ke Mob Farm
 *   !job farm3  -> Ganti pekerjaan bot target ke Stone AFK Miner
 *   !job stop   -> Hentikan pekerjaan bot
 */
const RoleCommand = {
  async handle(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules()?.chatQueue;
    const action = (args[0] || 'list').toLowerCase();

    if (action === 'list') {
      const roles = await getBotRoles();
      const entries = Object.entries(roles).map(([name, r]) => `${name}: ${r.autoFarm || 'none'} (${r.role || 'worker'})`);
      const msg = `Peran Bot: ${entries.join(' | ') || 'Belum ada'}`;
      log.info(msg);
      if (chatQueue) chatQueue.send(msg);
      return;
    }

    if (action === 'set') {
      const targetBot = args[1];
      const farmTarget = (args[2] || 'none').toLowerCase();

      if (!targetBot) {
        if (chatQueue) chatQueue.send('Format: !role set <botName> <farm1|farm2|farm3|none>');
        return;
      }

      if (!['farm1', 'farm2', 'farm3', 'none'].includes(farmTarget)) {
        if (chatQueue) chatQueue.send('Farm target harus: farm1, farm2, farm3, atau none');
        return;
      }

      const updated = await setBotRole(targetBot, { autoFarm: farmTarget });
      const msg = `Berhasil ubah peran ${targetBot}: autoFarm=${updated.autoFarm}`;
      log.success(msg);
      if (chatQueue) chatQueue.send(msg);
      return;
    }

    if (chatQueue) chatQueue.send('Gunakan: !role list atau !role set <botName> <farm1|farm2|farm3|none>');
  },

  /**
   * Handler cepat !job [farm1|farm2|farm3|stop]
   */
  async handleJob(bot, botManager, args, sender) {
    const chatQueue = botManager.getModules()?.chatQueue;
    const targetJob = (args[0] || 'status').toLowerCase();

    if (targetJob === 'status' || targetJob === 'list') {
      const roles = await getBotRoles();
      const entries = Object.entries(roles).map(([name, r]) => `${name}: ${r.autoFarm || 'none'}`);
      if (chatQueue) chatQueue.send(`📋 Status Pekerjaan Bot: ${entries.join(' | ')}`);
      return;
    }

    if (['farm1', 'crop', 'tanaman'].includes(targetJob)) {
      await setBotRole(bot.username, { autoFarm: 'farm1' });
      await FarmCommand.handle(bot, botManager, ['farm1'], sender);
      return;
    }

    if (['farm2', 'mob', 'grinder'].includes(targetJob)) {
      await setBotRole(bot.username, { autoFarm: 'farm2' });
      await FarmCommand.handle(bot, botManager, ['farm2'], sender);
      return;
    }

    if (['farm3', 'stone', 'batu', 'cobble'].includes(targetJob)) {
      await setBotRole(bot.username, { autoFarm: 'farm3' });
      await FarmCommand.handle(bot, botManager, ['farm3'], sender);
      return;
    }

    if (['stop', 'off', 'none'].includes(targetJob)) {
      await setBotRole(bot.username, { autoFarm: 'none' });
      await FarmCommand.handle(bot, botManager, ['stop'], sender);
      return;
    }

    if (chatQueue) chatQueue.send(`Gunakan: !job farm1 (crop), !job farm2 (mob), !job farm3 (stone), atau !job stop`);
  }
};

module.exports = RoleCommand;
