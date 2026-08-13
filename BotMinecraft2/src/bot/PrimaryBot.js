'use strict';
const mineflayer = require('mineflayer');
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { formatKickReason } = require('../utils/KickFormatter');

// Core layers
const Blackboard = require('../core/Blackboard');
const WorldScanner = require('../core/WorldScanner');
const { EnvironmentAnalyzer } = require('../core/EnvironmentAnalyzer');
const { RecoverySystem } = require('../core/RecoverySystem');
const { SafetySystem } = require('../core/SafetySystem');
const InventoryManager = require('../core/InventoryManager');
const ActionExecutor = require('../core/ActionExecutor');
const MovementPlanner = require('../core/MovementPlanner');
const TaskPlanner = require('../core/TaskPlanner');
const { DecisionEngine } = require('../core/DecisionEngine');
const Monitor = require('../core/Monitor');
const TickScheduler = require('../core/TickScheduler');

// Farm modules
const MobFarm = require('../farm/MobFarm');
const CropFarm = require('../farm/CropFarm');
const ChestDeposit = require('../farm/ChestDeposit');
const AutoSell = require('../farm/AutoSell');
const AutoCE = require('../farm/AutoCE');
const GiveItem = require('../farm/GiveItem');

// AI
const ChatAI = require('../ai/ChatAI');
const ChatQueue = require('../ai/ChatQueue');

/**
 * PrimaryBot.js — Bot utama (Bot-Nenel1).
 *
 * Menjalankan SELURUH pipeline 11 lapisan + 6 modul farm + AI chat.
 * Menerima command via /msg Bot-Nenel1 !command
 */
class PrimaryBot {
  constructor(botConfig) {
    this.botConfig = botConfig;
    this.log = createModuleLogger(botConfig.username, 'PrimaryBot');
    this.bot = null;
    this.bb = null;
    this._modules = {};
    this._reconnectAttempts = 0;
    this._reconnectTimer = null;
  }

  /**
   * Buat dan connect bot ke server.
   */
  connect() {
    try {
      this.bot = mineflayer.createBot({
        host: config.server.host,
        port: config.server.port,
        username: this.botConfig.username,
        password: this.botConfig.password || '',
        auth: config.server.auth,
        version: config.server.version,
        hideErrors: false,
        checkTimeoutInterval: 30000,
      });

      this.bot.setMaxListeners(50);
      this._setupEventHandlers();
      this.log.info('Connecting to server', { host: config.server.host });
    } catch (err) {
      this.log.error('Failed to create bot', { error: err.message });
      this._scheduleReconnect();
    }
  }

  /**
   * Setup event handlers Mineflayer.
   */
  _setupEventHandlers() {
    this.bot.on('spawn', () => this._onSpawn());
    this.bot.on('death', () => this._onDeath());
    this.bot.on('kicked', (reason) => this._onKicked(reason));
    this.bot.on('error', (err) => this._onError(err));
    this.bot.on('end', (reason) => this._onEnd(reason));
    this.bot.on('chat', (username, message) => this._onChat(username, message));
    this.bot.on('whisper', (username, message) => this._onWhisper(username, message));
    this.bot.on('message', (msg) => this._onMessage(msg));

    // Auto-login jika server minta
    this.bot.on('message', (msg) => this._handleAuthMessage(msg));
  }

  /**
   * Inisialisasi semua layer dan modul setelah bot spawn.
   */
  _onSpawn() {
    this.log.info('Bot spawned — initializing modules');
    this._reconnectAttempts = 0;

    // ─── Inisialisasi layer ─────────────────────────────────────────────────
    this.bb = new Blackboard(this.botConfig.username);
    this.bb.self.isConnected = true;

    const recovery = new RecoverySystem(this.bot, this.bb);
    const safety = new SafetySystem(this.bot, this.bb);
    const inv = new InventoryManager(this.bot, this.bb);
    const scanner = new WorldScanner(this.bot, this.bb);
    const analyzer = new EnvironmentAnalyzer(this.bot, this.bb);
    const movement = new MovementPlanner(this.bot, this.bb);
    const executor = new ActionExecutor(this.bot, this.bb, recovery);
    const taskPlanner = new TaskPlanner(this.bot, this.bb, inv);
    const decision = new DecisionEngine(this.bot, this.bb, inv);
    const monitor = new Monitor(this.bb);

    // Init pathfinder
    movement.init();

    // ─── Register farm modules (self-register ke DE & TP) ──────────────────
    const mobFarm = new MobFarm(this.bot, this.bb, decision, taskPlanner, inv);
    const cropFarm = new CropFarm(this.bot, this.bb, decision, taskPlanner, inv, scanner, analyzer);
    const chestDeposit = new ChestDeposit(this.bot, this.bb, decision, taskPlanner, inv);
    const autoSell = new AutoSell(this.bot, this.bb, decision, taskPlanner, inv);
    const autoCE = new AutoCE(this.bot, this.bb, decision, taskPlanner, inv);
    const giveItem = new GiveItem(this.bot, this.bb, decision, taskPlanner);

    // ─── AI Chat ───────────────────────────────────────────────────────────
    const chatAI = new ChatAI(this.bb);
    const chatQueue = new ChatQueue(this.bot, this.bb);

    // ─── Recovery fatal callback ────────────────────────────────────────────
    recovery.onFatal(() => this._scheduleReconnect());

    // ─── Tick Scheduler ─────────────────────────────────────────────────────
    const scheduler = new TickScheduler({
      bot: this.bot,
      blackboard: this.bb,
      safetySystem: safety,
      inventoryManager: inv,
      worldScanner: scanner,
      environmentAnalyzer: analyzer,
      decisionEngine: decision,
      taskPlanner: taskPlanner,
      actionExecutor: executor,
      monitor,
      recoverySystem: recovery,
      movementPlanner: movement,
    });

    scheduler.start();
    monitor.start();

    // Simpan referensi untuk cleanup
    this._modules = {
      recovery, safety, inv, scanner, analyzer, movement,
      executor, taskPlanner, decision, monitor, scheduler,
      mobFarm, cropFarm, chestDeposit, autoSell, autoCE, giveItem,
      chatAI, chatQueue,
    };

    this.log.info('All modules initialized');

    // Extend ActionExecutor untuk custom steps
    this._extendActionExecutor(executor, chestDeposit, autoSell, autoCE, giveItem);
  }

  /**
   * Extend ActionExecutor untuk menangani custom step types dari farm modules.
   */
  _extendActionExecutor(executor, chestDeposit, autoSell, autoCE, giveItem) {
    const originalDispatch = executor._dispatch.bind(executor);
    executor._dispatch = async (action) => {
      switch (action.type) {
        case 'DEPOSIT_ALL_NON_PROTECTED': {
          const container = this.bb._openContainer;
          if (!container) return { status: 'FAILED', error: 'No container open' };
          const result = await chestDeposit.depositAll(container);
          return result.success ? { status: 'DONE' } : { status: 'FAILED', error: result.error };
        }
        case 'HANDLE_SELL_GUI':
          await autoSell.handleSellGui();
          return { status: 'DONE' };
        case 'VERIFY_SELL':
          await autoSell.verifySell();
          return { status: 'DONE' };
        case 'PUSH_CONTEXT': {
          this.bb.pushContext({
            type: action.contextType,
            task: { ...this.bb.tasks.current },
            plan: [...(this.bb.tasks.plan || [])],
            step: this.bb.tasks.currentStep,
          });
          return { status: 'DONE' };
        }
        case 'POP_CONTEXT': {
          const ctx = this.bb.popContext();
          if (ctx && ctx.type !== 'safety_interrupt') {
            this.bb.tasks.current = ctx.task;
            this.bb.tasks.plan = ctx.plan;
            this.bb.tasks.currentStep = ctx.step;
          }
          return { status: 'DONE' };
        }
        case 'FIND_PLAYER': {
          const player = Object.values(this.bot.entities)
            .find((e) => e.type === 'player' && e.username === action.targetPlayer);
          return player ? { status: 'DONE', entity: player } : { status: 'FAILED', error: 'Player not found' };
        }
        case 'APPROACH_PLAYER': {
          const player = Object.values(this.bot.entities)
            .find((e) => e.type === 'player' && e.username === action.targetPlayer);
          if (!player) return { status: 'FAILED', error: 'Player not found' };
          return await executor.moveTo(player.position, { range: action.range || 3 });
        }
        case 'FACE_PLAYER': {
          const player = Object.values(this.bot.entities)
            .find((e) => e.type === 'player' && e.username === action.targetPlayer);
          if (!player) return { status: 'DONE' };
          return await executor.lookAt(player.position);
        }
        case 'TOSS_TO_PLAYER': {
          const item = this.bot.inventory.items().find((i) => i.name === action.itemName);
          if (!item) return { status: 'FAILED', error: `Item not found: ${action.itemName}` };
          return await executor.tossItem(item, action.count);
        }
        case 'VERIFY_ITEM_TAKEN': {
          const taken = await giveItem.verifyItemTaken(
            action.targetPlayer, action.itemName, action.count, action.timeoutMs);
          giveItem.clearRequest();
          return taken ? { status: 'DONE' } : { status: 'DONE' }; // Non-blocking
        }
        case 'TRIGGER_GOAL': {
          // Force re-evaluate ke goal lain
          this._modules.decision.forceRevaluate();
          return { status: 'DONE' };
        }
        default:
          return await originalDispatch(action);
      }
    };
  }

  /**
   * Handle chat publik — trigger AI jika disebut.
   */
  async _onChat(username, message) {
    if (username === this.botConfig.username) return;
    if (!ChatAI.isTrigger(message)) return;

    this.log.debug('AI trigger detected', { username, message });
    const { chatAI, chatQueue } = this._modules;
    if (!chatAI || !chatQueue) return;

    const responses = await chatAI.generateResponse(username, message);
    if (responses && responses.length > 0) {
      // Kirim ke chat publik sebagai respons
      chatQueue.enqueue(responses, null, 5);
    }
  }

  /**
   * Handle private message (/msg) — command handler.
   */
  async _onWhisper(username, message) {
    this.log.debug('Whisper received', { username, message });
    await this._handleCommand(username, message);
  }

  /**
   * Handle message event (untuk mendeteksi format /msg dari berbagai plugin).
   */
  _onMessage(jsonMsg) {
    try {
      const text = jsonMsg.toString();
      // Beberapa server format: "[username -> me] message" atau "username whispers: message"
      const whisperPatterns = [
        /^\[([^\]]+) -> \w+\] (.+)$/,
        /^(\w+) whispers(?: to you)?: (.+)$/,
        /^(\w+) -> \w+: (.+)$/,
      ];

      for (const pattern of whisperPatterns) {
        const match = text.match(pattern);
        if (match) {
          const username = match[1];
          const message = match[2] || match[3] || match[match.length - 1];
          if (username !== this.botConfig.username) {
            this._handleCommand(username, message).catch(() => {});
          }
          return;
        }
      }
    } catch (_) { /* ignore */ }
  }

  /**
   * Parse dan eksekusi command dari player.
   * Format: !command [args...]
   */
  async _handleCommand(username, rawMessage) {
    const prefix = config.chat.commandPrefix;
    const message = rawMessage.trim();
    if (!message.startsWith(prefix)) return;

    const parts = message.slice(prefix.length).split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    const { chatQueue, chatAI, autoSell, autoCE, giveItem, mobFarm } = this._modules;
    const reply = (text) => chatQueue.enqueue([text], username, 10);

    switch (cmd) {
      // ─── Zone commands ───────────────────────────────────────────────────
      case 'setzone': {
        // !setzone mob [radius] — set posisi saat ini sebagai pusat zona
        const type = args[0]; // mob | crop | chest
        const radius = parseFloat(args[1]) || config.farm[`default${type?.charAt(0).toUpperCase() + type?.slice(1)}ZoneRadius`] || 20;
        if (!['mob', 'crop', 'chest'].includes(type)) {
          return reply('Usage: !setzone <mob|crop|chest> [radius]');
        }
        const pos = this.bb.self.pos;
        if (!pos) return reply('Posisi bot belum tersedia.');
        this.bb.setZone(type, pos.clone(), radius);
        reply(`Zona ${type} set di ${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)} radius ${radius} blok.`);
        break;
      }

      case 'mobfarm': {
        const arg = (args[0] || '').toLowerCase();
        if (arg === 'on') this.bb.farm.mobEnabled = true;
        else if (arg === 'off') this.bb.farm.mobEnabled = false;
        else this.bb.farm.mobEnabled = !this.bb.farm.mobEnabled;
        reply(`MobFarm status: ${this.bb.farm.mobEnabled ? 'ENABLED (Aktif)' : 'DISABLED (Mati)'}`);
        break;
      }

      case 'cropfarm': {
        const arg = (args[0] || '').toLowerCase();
        if (arg === 'on') this.bb.farm.cropEnabled = true;
        else if (arg === 'off') this.bb.farm.cropEnabled = false;
        else this.bb.farm.cropEnabled = !this.bb.farm.cropEnabled;
        reply(`CropFarm status: ${this.bb.farm.cropEnabled ? 'ENABLED (Aktif)' : 'DISABLED (Mati)'}`);
        break;
      }

      case 'mode': {
        const mode = (args[0] || '').toLowerCase();
        if (mode === 'mob') {
          this.bb.farm.mobEnabled = true;
          this.bb.farm.cropEnabled = false;
          reply('Mode diubah: HANYA Mob Farm (CropFarm dimatikan)');
        } else if (mode === 'crop') {
          this.bb.farm.mobEnabled = false;
          this.bb.farm.cropEnabled = true;
          reply('Mode diubah: HANYA Crop Farm (MobFarm dimatikan)');
        } else if (mode === 'auto' || mode === 'both') {
          this.bb.farm.mobEnabled = true;
          this.bb.farm.cropEnabled = true;
          reply('Mode diubah: AUTO (Mob & Crop Farm aktif keduanya)');
        } else {
          reply('Usage: !mode <mob|crop|auto>');
        }
        break;
      }

      case 'setchest': {
        const pos = this.bb.self.pos;
        if (!pos) return reply('Posisi bot belum tersedia.');
        this.bb.setZone('chest', pos.clone(), 5);
        this.bb.farm.useChestDeposit = true;
        reply(`Chest penyimpan di-set di ${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}. Hasil farm akan disetor ke chest ini (tidak dijual).`);
        break;
      }

      case 'getzone': {
        const type = args[0] || 'mob';
        const zone = this.bb.getZone(type);
        if (!zone) return reply(`Zona ${type} belum di-set. Gunakan !setzone ${type}`);
        const c = zone.center;
        reply(`Zona ${type}: ${Math.round(c.x)},${Math.round(c.y)},${Math.round(c.z)} r=${zone.radius}`);
        break;
      }

      // ─── Sell point ──────────────────────────────────────────────────────
      case 'setsellpoint': {
        const pos = this.bb.self.pos;
        if (!pos) return reply('Posisi tidak tersedia.');
        autoSell.setSellPoint(pos.clone());
        reply(`Sell point set di ${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}`);
        break;
      }

      // ─── Enchant pos ─────────────────────────────────────────────────────
      case 'setenchantpos': {
        const pos = this.bb.self.pos;
        if (!pos) return reply('Posisi tidak tersedia.');
        autoCE.setEnchantPos(pos.clone());
        reply(`Enchant pos set di ${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}`);
        break;
      }

      // ─── Give item ───────────────────────────────────────────────────────
      case 'give': {
        // !give <player> <item> <count>
        const [targetPlayer, itemName, countStr] = args;
        if (!targetPlayer || !itemName) return reply('Usage: !give <player> <item> [count]');
        giveItem.setRequest(targetPlayer, itemName, parseInt(countStr) || 1);
        reply(`Akan memberikan ${countStr || 1}x ${itemName} ke ${targetPlayer}`);
        break;
      }

      // ─── Status ──────────────────────────────────────────────────────────
      case 'status': {
        const pos = this.bb.self.pos;
        const hp = this.bb.self.hp;
        const food = this.bb.self.food;
        const freeSlots = this.bb.inventory.freeSlots;
        const goal = this.bb.tasks.current?.goalId || 'idle';
        reply(`HP:${hp} Food:${food} Slots:${freeSlots}/36 Goal:${goal} Pos:${pos ? `${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}` : 'N/A'}`);
        break;
      }

      // ─── Stop / Resume ───────────────────────────────────────────────────
      case 'stop': {
        this._modules.scheduler?.stop();
        this._modules.movement?.stopMovement();
        this.bb.tasks.current = null;
        reply('Bot dihentikan. Gunakan !resume untuk melanjutkan.');
        break;
      }

      case 'resume': {
        this._modules.scheduler?.start();
        this._modules.decision?.forceRevaluate();
        reply('Bot dilanjutkan.');
        break;
      }

      // ─── AI Chat (manual trigger) ─────────────────────────────────────────
      case 'ask': {
        const question = args.join(' ');
        if (!question) return reply('Usage: !ask <pertanyaan>');
        const responses = await chatAI?.generateResponse(username, question);
        if (responses) chatQueue.enqueue(responses, username, 8);
        break;
      }

      // ─── Scan force ──────────────────────────────────────────────────────
      case 'scan': {
        this._modules.scanner?.forceFullScan();
        const chestCount = Object.keys(this.bb.world.model.chestDB).length;
        const mobCount = this.bb.world.model.mobs?.length || 0;
        reply(`Scan selesai. Chest: ${chestCount}, Mob: ${mobCount}`);
        break;
      }

      // ─── Public Say ───────────────────────────────────────────────────────
      case 'say': {
        const sayText = args.join(' ');
        if (!sayText) return reply('Usage: !say <teks>');
        chatQueue.enqueue([sayText], null, 10);
        break;
      }

      default:
        reply(`Perintah tidak dikenal: ${cmd}. Coba: status, setzone, setsellpoint, stop, resume, give, ask, scan, say`);
    }
  }

  /**
   * Handle auto-login.
   */
  _handleAuthMessage(jsonMsg) {
    if (!config.auth.enabled) return;
    const text = jsonMsg.toString().toLowerCase();
    const triggered = config.auth.loginTriggerWords.some((w) => text.includes(w.toLowerCase()));
    if (!triggered) return;

    const password = this.botConfig.password;
    if (!password) return;

    setTimeout(() => {
      try {
        this.bot.chat(`${config.auth.loginCommand} ${password}`);
        this.log.info('Auto-login sent');
      } catch (_) {}
    }, config.auth.loginDelayMs);
  }

  _onDeath() {
    this.log.warn('Bot died — respawning');
    this.bb.self.isDead = true;
    // Bot Mineflayer otomatis respawn jika tidak di-disable
    try { this.bot.respawn(); } catch (_) {}
  }

  _onKicked(reason) {
    this.log.warn('Bot kicked', { reason: formatKickReason(reason) });
    this._cleanup();
    this._scheduleReconnect();
  }

  _onError(err) {
    this.log.error('Bot error', { error: err.message });
  }

  _onEnd(reason) {
    this.log.warn('Bot disconnected', { reason });
    this._cleanup();
    if (config.reconnect.enabled) {
      this._scheduleReconnect();
    }
  }

  _cleanup() {
    try {
      this._modules.scheduler?.stop();
      this._modules.monitor?.stop();
      this._modules.chatQueue?.clear();
    } catch (_) {}
  }

  _scheduleReconnect() {
    if (!config.reconnect.enabled) return;
    if (this._reconnectTimer) return;

    this._reconnectAttempts++;
    const delay = Math.min(
      config.reconnect.initialDelayMs * Math.pow(config.reconnect.multiplier, this._reconnectAttempts - 1),
      config.reconnect.maxDelayMs,
    );

    this.log.info(`Reconnecting in ${delay}ms (attempt ${this._reconnectAttempts})`);
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

module.exports = PrimaryBot;
