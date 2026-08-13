'use strict';

const {
  addToWhitelist,
  removeFromWhitelist,
  getWhitelist,
} = require('../services/DataService');
const { createModuleLogger } = require('../utils/logger');
const { sleep } = require('../utils/retry');

const log = createModuleLogger('WhitelistCommand');

/**
 * !whitelist <sub-command> [player]
 *
 * Sub-commands:
 *   !whitelist add <player>    → Tambah player ke whitelist
 *   !whitelist remove <player> → Hapus player dari whitelist
 *   !whitelist list            → Tampilkan semua player di whitelist
 */
const WhitelistCommand = {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} _botManager
   * @param {string[]} args
   * @param {string} sender
   */
  async handle(bot, _botManager, args, sender) {
    const subCmd = (args[0] || '').toLowerCase();
    const target = args[1];

    switch (subCmd) {
      case 'add':
        await handleAdd(bot, target, sender);
        break;
      case 'remove':
      case 'del':
      case 'delete':
        await handleRemove(bot, target, sender);
        break;
      case 'list':
      case 'ls':
        await handleList(bot);
        break;
      default:
        botManager.getModules().chatQueue.send('Usage: !whitelist add/remove/list <player>');
    }
  },
};

async function handleAdd(bot, target, sender) {
  if (!target) {
    botManager.getModules().chatQueue.send('Usage: !whitelist add <player>');
    return;
  }

  const added = await addToWhitelist(target);
  if (added) {
    botManager.getModules().chatQueue.send(`${target} ditambahkan ke whitelist`);
    log.success(`${sender} menambahkan '${target}' ke whitelist`);
  } else {
    botManager.getModules().chatQueue.send(`${target} sudah ada di whitelist`);
  }
}

async function handleRemove(bot, target, sender) {
  if (!target) {
    botManager.getModules().chatQueue.send('Usage: !whitelist remove <player>');
    return;
  }

  const removed = await removeFromWhitelist(target);
  if (removed) {
    botManager.getModules().chatQueue.send(`${target} dihapus dari whitelist`);
    log.info(`${sender} menghapus '${target}' dari whitelist`);
  } else {
    botManager.getModules().chatQueue.send(`${target} tidak ada di whitelist`);
  }
}

async function handleList(bot) {
  const players = await getWhitelist();

  if (players.length === 0) {
    botManager.getModules().chatQueue.send('Whitelist kosong (semua player bisa command)');
    return;
  }

  botManager.getModules().chatQueue.send(`=== Whitelist (${players.length}) ===`);
  await sleep(200);
  botManager.getModules().chatQueue.send(players.join(', '));
}

module.exports = WhitelistCommand;
