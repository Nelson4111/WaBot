'use strict';

const Connector = require('./Connector');
const { createModuleLogger } = require('../utils/logger');
const { incrementStat, updateStats } = require('../services/DataService');

// Modules
const AutoAuth = require('../modules/utils/AutoAuth');
const AntiAfk = require('../modules/utils/AntiAfk');
const AutoEat = require('../modules/inventory/AutoEat');
const AutoRespawn = require('../modules/utils/AutoRespawn');
const GuardMode = require('../modules/combat/GuardMode');
const MobFarm = require('../modules/combat/MobFarm');
const PathfinderModule = require('../modules/movement/Pathfinder');
const ChatQueue = require('../modules/chat/ChatQueue');
const InventoryManager = require('../modules/inventory/InventoryManager');
const AutoEnchantManager = require('../modules/inventory/AutoEnchantManager');
const FollowManager = require('../modules/movement/FollowManager');
const StorageManager = require('../modules/storage/StorageManager');
const CropFarm = require('../modules/combat/CropFarm');
const StoneFarm = require('../modules/combat/StoneFarm');

// Events
const ChatHandler = require('../events/ChatHandler');
const DeathHandler = require('../events/DeathHandler');
const ErrorHandler = require('../events/ErrorHandler');
const PlayerJoinHandler = require('../events/PlayerJoinHandler');
const RetaliateHandler = require('../events/RetaliateHandler');

const log = createModuleLogger('BotManager');

/**
 * BotManager adalah orchestrator utama.
 * Ia mengelola lifecycle bot, menginisialisasi semua modul,
 * dan mengekspos state bot ke web dashboard.
 *
 * Pola yang digunakan: modul di-inject dengan instance bot
 * setiap kali koneksi baru terbentuk (reconnect = modul fresh).
 */
class BotManager {
  constructor(customUsername = null) {
    this.username = customUsername || config.env.botUsername;

    /** @type {Connector} */
    this.connector = new Connector(this.username);

    /** @type {import('mineflayer').Bot|null} */
    this.bot = null;

    /** @type {number|null} Timestamp saat bot pertama kali start */
    this.startedAt = null;

    /** @type {number|null} Timestamp saat koneksi terakhir berhasil */
    this.connectedAt = null;

    /** @type {boolean} Apakah bot sedang online */
    this.isConnected = false;

    // Module instances (akan di-reset saat reconnect)
    this._modules = {
      chatQueue: null,
      autoAuth: null,
      antiAfk: null,
      autoEat: null,
      autoRespawn: null,
      guardMode: null,
      mobFarm: null,
      pathfinder: null,
      inventoryManager: null,
      followManager: null,
      storageManager: null,
      autoEnchantManager: null,
      cropFarm: null,
    };

    this.activeTask = null;
    this.isBusy = false;

    this._setupConnectorEvents();
  }

  /**
   * Setup listener ke event yang di-emit oleh Connector.
   * Ini adalah satu-satunya tempat di mana kita bereaksi terhadap
   * perubahan status koneksi.
   *
   * @private
   */
  _setupConnectorEvents() {
    this.connector.on('connected', async (bot) => {
      this.bot = bot;
      this.isConnected = true;
      this.connectedAt = Date.now();

      if (!this.startedAt) {
        this.startedAt = Date.now();
        await updateStats({ startedAt: new Date().toISOString() }).catch(() => {});
      }

      await incrementStat('totalLogins').catch(() => {});
      log.success('Bot online dan siap menerima perintah');

      this._initModules(bot);
      this._initEventHandlers(bot);
    });

    this.connector.on('disconnected', async ({ reason }) => {
      this.isConnected = false;
      this.bot = null;

      // Stop semua module agar tidak ada zombie process
      this._stopAllModules();

      log.warn(`Bot offline. Alasan: ${reason}`);
      await updateStats({ lastSeen: new Date().toISOString() }).catch(() => {});
    });

    this.connector.on('reconnecting', async ({ attempt, delayMs }) => {
      await incrementStat('totalReconnects').catch(() => {});
      log.info(`Menunggu reconnect #${attempt} dalam ${Math.round(delayMs / 1000)}s...`);
    });
  }

  /**
   * Inisialisasi semua modul dengan bot instance yang fresh.
   * Dipanggil setiap kali bot berhasil connect/reconnect.
   *
   * @param {import('mineflayer').Bot} bot
   * @private
   */
  _initModules(bot) {
    log.info('Menginisialisasi semua modul...');

    this._modules.chatQueue = new ChatQueue(bot);
    this._modules.pathfinder = new PathfinderModule(bot);
    this._modules.autoAuth = new AutoAuth(bot);
    this._modules.antiAfk = new AntiAfk(bot);
    this._modules.autoEat = new AutoEat(bot);
    this._modules.autoRespawn = new AutoRespawn(bot, this);
    this._modules.guardMode = new GuardMode(bot, this._modules.pathfinder, this);
    this._modules.mobFarm = new MobFarm(bot, this._modules.pathfinder, this._modules.guardMode, this._modules.chatQueue, this);

    this._modules.inventoryManager = new InventoryManager(bot, this._modules.chatQueue, this);
    this._modules.followManager = new FollowManager(bot, this._modules.pathfinder, this._modules.chatQueue);
    this._modules.storageManager = new StorageManager(bot, this._modules.pathfinder, this._modules.chatQueue);
    this._modules.autoEnchantManager = new AutoEnchantManager(bot, this._modules.chatQueue, this);
    this._modules.cropFarm = new CropFarm(bot, this._modules.pathfinder, this._modules.guardMode, this._modules.chatQueue, this);
    this._modules.stoneFarm = new StoneFarm(bot, this._modules.pathfinder, this._modules.chatQueue, this);

    // Start modul yang selalu aktif
    this._modules.inventoryManager.start();
    this._modules.autoAuth.start();
    this._modules.antiAfk.start();
    this._modules.autoEat.start();
    this._modules.autoRespawn.start();
    this._modules.autoEnchantManager.start();

    log.success('Semua modul berhasil diinisialisasi');
  }

  /**
   * Set status sibuk bot untuk mencegah modul latar belakang bentrok
   * @param {boolean} flag
   */
  setBusy(flag) {
    this.isBusy = Boolean(flag);
    log.debug(`BotManager busy state: ${this.isBusy}`);
  }

  /**
   * Set tugas aktif bot (misal 'farm1', 'farm2', atau 'farm3')
   */
  setActiveTask(taskName) {
    this.activeTask = taskName;
    log.info(`Active task bot diset ke: ${taskName}`);
  }

  /**
   * Lanjutkan otomatis tugas aktif setelah bot mati & respawn
   */
  async resumeActiveTask() {
    if (!this.activeTask) return;
    log.info(`Melanjutkan tugas aktif '${this.activeTask}' secara otomatis setelah respawn...`);
    const { sleep } = require('../utils/retry');
    await sleep(2000);

    if ((this.activeTask === 'farm1' || this.activeTask === 'crop') && this._modules.cropFarm) {
      this._modules.cropFarm.start();
    } else if ((this.activeTask === 'farm2' || this.activeTask === 'mob') && this._modules.mobFarm) {
      this._modules.mobFarm.start();
    } else if ((this.activeTask === 'farm3' || this.activeTask === 'stone') && this._modules.stoneFarm) {
      this._modules.stoneFarm.start();
    }
  }

  /**
   * Inisialisasi event handler untuk bot.
   *
   * @param {import('mineflayer').Bot} bot
   * @private
   */
  _initEventHandlers(bot) {
    ChatHandler.attach(bot, this);
    DeathHandler.attach(bot, this);
    ErrorHandler.attach(bot, this);
    PlayerJoinHandler.attach(bot, this);
    RetaliateHandler.attach(bot, this);

    // Otomatis jalankan tugas berdasarkan konfigurasi data/bot_roles.json setelah bot spawn
    bot.once('spawn', () => {
      setTimeout(async () => {
        try {
          const { getBotRole } = require('../services/DataService');
          const roleData = await getBotRole(bot.username);
          log.info(`[Role Engine] ${bot.username} terdeteksi sebagai Peran '${roleData.role}' (${roleData.description || 'Worker'})`);

          if (roleData.autoGuard && this._modules.guardMode && !this._modules.guardMode.isActive) {
            this._modules.guardMode.start();
          }

          if (roleData.autoFarm === 'farm1' && this._modules.cropFarm && !this._modules.cropFarm.isActive) {
            this.setActiveTask('farm1');
            this._modules.cropFarm.start();
          } else if (roleData.autoFarm === 'farm2' && this._modules.mobFarm && !this._modules.mobFarm.isActive) {
            this.setActiveTask('farm2');
            this._modules.mobFarm.start();
          } else if (roleData.autoFarm === 'farm3' && this._modules.stoneFarm && !this._modules.stoneFarm.isActive) {
            this.setActiveTask('farm3');
            this._modules.stoneFarm.start();
          } else if (this.activeTask) {
            log.info(`[Reconnect Auto-Resume] Melanjutkan tugas '${this.activeTask}' secara otomatis...`);
            this.resumeActiveTask();
          }
        } catch (_err) {}
      }, 7000); // Tunggu 7 detik agar auto-login & spawn lokasi stabil
    });
  }

  /**
   * Hentikan semua modul yang aktif.
   * Dipanggil saat disconnect.
   *
   * @private
   */
  _stopAllModules() {
    for (const [name, mod] of Object.entries(this._modules)) {
      if (mod && typeof mod.stop === 'function') {
        try {
          mod.stop();
        } catch (err) {
          log.warn(`Gagal menghentikan modul ${name}: ${err.message}`);
        }
      }
      this._modules[name] = null;
    }
  }

  /**
   * Mulai bot manager — entry point utama.
   *
   * @returns {void}
   */
  start() {
    log.info('BotManager dimulai');
    this.connector.connect();
  }

  /**
   * Hentikan bot manager secara permanen.
   *
   * @returns {void}
   */
  stop() {
    log.info('BotManager dihentikan');
    this._stopAllModules();
    this.connector.stop();
  }

  /**
   * Dapatkan snapshot status bot saat ini untuk dashboard.
   *
   * @returns {object} Status snapshot
   */
  getStatus() {
    if (!this.isConnected || !this.bot) {
      return {
        online: false,
        connectedAt: null,
        startedAt: this.startedAt,
        health: 0,
        food: 0,
        position: null,
        activeModes: [],
      };
    }

    const activeModes = [];
    if (this._modules.antiAfk?.isActive) activeModes.push('anti-afk');
    if (this._modules.guardMode?.isActive) activeModes.push('guard');
    if (this._modules.mobFarm?.isActive) activeModes.push('farm');

    return {
      online: true,
      username: this.bot.username,
      serverHost: this.bot.host || 'unknown',
      connectedAt: this.connectedAt,
      startedAt: this.startedAt,
      health: this.bot.health ?? 0,
      food: this.bot.food ?? 0,
      saturation: this.bot.foodSaturation ?? 0,
      position: this.bot.entity?.position
        ? {
            x: Math.floor(this.bot.entity.position.x),
            y: Math.floor(this.bot.entity.position.y),
            z: Math.floor(this.bot.entity.position.z),
          }
        : null,
      activeModes,
    };
  }

  /**
   * Akses modul-modul bot dari luar (digunakan oleh command handlers).
   *
   * @returns {object} Semua modul yang aktif
   */
  getModules() {
    return this._modules;
  }
}

module.exports = BotManager;
