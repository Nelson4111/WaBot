'use strict';

const { createModuleLogger } = require('../utils/logger');
const config = require('../config');
const { isWhitelisted, getWhitelist } = require('../services/DataService');
const { sleep } = require('../utils/retry');

// Import semua command handler
const StatusCommand = require('./StatusCommand');
const GotoCommand = require('./GotoCommand');
const StopCommand = require('./StopCommand');
const FarmCommand = require('./FarmCommand');
const GuardCommand = require('./GuardCommand');
const EatCommand = require('./EatCommand');
const InventoryCommand = require('./InventoryCommand');
const WaypointCommand = require('./WaypointCommand');
const WhitelistCommand = require('./WhitelistCommand');
const SayCommand = require('./SayCommand');
const AfkCommand = require('./AfkCommand');
const DropCommand = require('./DropCommand');
const GiveCommand = require('./GiveCommand');
const FollowCommand = require('./FollowCommand');
const ComeCommand = require('./ComeCommand');
const StorageCommand = require('./StorageCommand');
const PauseCommand = require('./PauseCommand');
const ResumeCommand = require('./ResumeCommand');
const AddChestCommand = require('./AddChestCommand');
const RoleCommand = require('./RoleCommand');
const SquadCommand = require('./SquadCommand');

const log = createModuleLogger('CommandRegistry');

/**
 * Map nama command → handler function.
 * Semua command harus memiliki signature:
 *   async handler(bot, botManager, args, sender) → void
 */
const COMMAND_MAP = {
  status: StatusCommand.handle,
  goto: GotoCommand.handle,
  stop: StopCommand.handle,
  farm: FarmCommand.handle,
  addchest: AddChestCommand.handle,
  guard: GuardCommand.handle,
  eat: EatCommand.handle,
  inventory: InventoryCommand.handle,
  inv: InventoryCommand.handle, // Alias
  waypoint: WaypointCommand.handle,
  wp: WaypointCommand.handle, // Alias
  drop: DropCommand.handle,
  give: GiveCommand.handle,
  kasih: GiveCommand.handle,
  empty: GiveCommand.handleEmpty,
  dump: GiveCommand.handleEmpty,
  kosongkan: GiveCommand.handleEmpty,
  minta: GiveCommand.handleMinta,
  follow: FollowCommand.handle,
  come: ComeCommand.handle,
  storage: StorageCommand.handle,
  pause: PauseCommand.handle,
  resume: ResumeCommand.handle,
  whitelist: WhitelistCommand.handle,
  wl: WhitelistCommand.handle, // Alias
  say: SayCommand.handle,
  afk: AfkCommand.handle,
  role: RoleCommand.handle,
  job: RoleCommand.handleJob,
  squad: SquadCommand.handle,
  help: handleHelp,
};

/** Semua command yang tersedia untuk ditampilkan di !help */
const COMMAND_LIST = [
  '!status', '!goto <x> <z>', '!stop', '!farm', '!guard',
  '!eat', '!inventory', '!waypoint add/go/list <nama>',
  '!whitelist add/remove/list <player>', '!say <pesan>', '!afk', '!help',
];

/**
 * Handler untuk command !help — tampilkan daftar command yang tersedia.
 *
 * @param {import('mineflayer').Bot} bot
 * @param {object} _botManager
 * @param {string[]} _args
 * @param {string} _sender
 */
async function handleHelp(bot, botManager, _args, _sender) {
  const helpText = `Command Bot: ${COMMAND_LIST.join(' | ')}`;
  botManager.getModules().chatQueue.send(helpText);
}

/**
 * CommandRegistry adalah dispatcher utama untuk semua command in-game.
 *
 * Alur:
 * 1. Cek apakah pesan dimulai dengan prefix (default: '!')
 * 2. Parse nama command dan argumen
 * 3. Validasi whitelist
 * 4. Dispatch ke handler yang sesuai
 */
const CommandRegistry = {
  /**
   * Proses pesan chat/whisper dan jalankan command jika valid.
   *
   * @param {import('mineflayer').Bot} bot
   * @param {import('../core/BotManager')} botManager
   * @param {string} sender - Username pengirim pesan
   * @param {string} message - Isi pesan
   * @param {boolean} [isWhisper=false] - Apakah pesan via whisper
   * @returns {Promise<void>}
   */
  async handleMessage(bot, botManager, sender, message, isWhisper = false) {
    const prefix = config.commands.prefix.toLowerCase();
    const lowerMsg = message.toLowerCase().trim();

    // Tidak dimulai dengan prefix
    if (!lowerMsg.startsWith(prefix)) return;

    // Parse command dan args
    const withoutPrefix = message.slice(prefix.length).trim();
    const parts = withoutPrefix.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Cari handler
    const handler = COMMAND_MAP[commandName];
    if (!handler) {
      log.debug(`Command tidak dikenal: ${commandName} dari ${sender}`);
      return;
    }

    // Validasi whitelist
    const whitelist = await getWhitelist();
    const configWhitelist = config.commands.whitelist || [];
    const allWhitelisted = [...new Set([...whitelist, ...configWhitelist])];

    // Dashboard selalu diizinkan (sudah aman karena LAN/VPN only)
    const isDashboard = sender === '__dashboard__';

    // Jika whitelist kosong, semua player bisa command
    if (!isDashboard && allWhitelisted.length > 0) {
      const allowed = allWhitelisted.some(
        (p) => p.toLowerCase() === sender.toLowerCase()
      );
      if (!allowed) {
        log.debug(`Command ditolak dari ${sender} (bukan whitelist): !${commandName}`);
        return;
      }
    }

    log.info(`Command '!${commandName}' dari ${sender}${isWhisper ? ' (whisper)' : ''}`);

    // Jalankan handler
    try {
      await handler(bot, botManager, args, sender);
    } catch (err) {
      log.error(`Error eksekusi command !${commandName}: ${err.message}`);
      try {
        botManager.getModules().chatQueue.send(`Error: ${err.message}`);
      } catch (_chatErr) {
        // Bot mungkin sudah disconnect
      }
    }
  },

  getAllCommands() {
    return Object.keys(COMMAND_MAP);
  }
};

module.exports = CommandRegistry;
