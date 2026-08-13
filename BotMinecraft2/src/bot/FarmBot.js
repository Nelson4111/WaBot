'use strict';
const mineflayer = require('mineflayer');
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { formatKickReason } = require('../utils/KickFormatter');

// Core layers minimal untuk farm bot
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
const ChatQueue = require('../ai/ChatQueue');

// Farm modules (farm bot bisa menjalankan subset)
const MobFarm = require('../farm/MobFarm');
const ChestDeposit = require('../farm/ChestDeposit');

/**
 * FarmBot.js — Bot farm pasif (Bot-Nenel2+).
 *
 * Pipeline lengkap (Safety, Recovery, dll) TETAP berjalan untuk keamanan.
 * Tidak ada AI chat atau Decision Engine kompleks.
 * Hanya menjalankan tugas farm yang di-assign via !settask.
 *
 * Menerima command via /msg <botname> !command
 */
class FarmBot {
  constructor(botConfig) {
    this.botConfig = botConfig;
    this.log = createModuleLogger(botConfig.username, 'FarmBot');
    this.bot = null;
    this.bb = null;
    this._modules = {};
    this._reconnectAttempts = 0;
    this._reconnectTimer = null;
    this._assignedTask = null; // 'mob' | 'crop' | null
  }

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
      this.log.info('FarmBot connecting', { host: config.server.host });
    } catch (err) {
      this.log.error('Failed to create FarmBot', { error: err.message });
      this._scheduleReconnect();
    }
  }

  _setupEventHandlers() {
    this.bot.on('spawn', () => this._onSpawn());
    this.bot.on('death', () => this._onDeath());
    this.bot.on('kicked', (r) => this._onKicked(r));
    this.bot.on('error', (e) => this.log.error('Bot error', { error: e.message }));
    this.bot.on('end', (r) => this._onEnd(r));
    this.bot.on('message', (msg) => this._onMessage(msg));
    this.bot.on('whisper', (u, m) => this._onWhisper(u, m));
    this.bot.on('message', (msg) => this._handleAuthMessage(msg));
  }

  _onSpawn() {
    this.log.info('FarmBot spawned');
    this._reconnectAttempts = 0;

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
    const chatQueue = new ChatQueue(this.bot, this.bb);

    movement.init();
    recovery.onFatal(() => this._scheduleReconnect());

    // Farm modules
    const mobFarm = new MobFarm(this.bot, this.bb, decision, taskPlanner, inv);
    const chestDeposit = new ChestDeposit(this.bot, this.bb, decision, taskPlanner, inv);

    const scheduler = new TickScheduler({
      bot: this.bot, blackboard: this.bb,
      safetySystem: safety, inventoryManager: inv,
      worldScanner: scanner, environmentAnalyzer: analyzer,
      decisionEngine: decision, taskPlanner, actionExecutor: executor,
      monitor, recoverySystem: recovery, movementPlanner: movement,
    });

    scheduler.start();
    monitor.start();

    this._modules = {
      recovery, safety, inv, scanner, decision, taskPlanner,
      scheduler, monitor, chatQueue, mobFarm, chestDeposit, movement,
    };

    this.log.info('FarmBot modules initialized');
  }

  /**
   * Tangani whisper command untuk farm bot.
   */
  async _onWhisper(username, message) {
    await this._handleCommand(username, message);
  }

  _onMessage(jsonMsg) {
    try {
      const text = jsonMsg.toString();
      const patterns = [
        /^\[([^\]]+) -> \w+\] (.+)$/,
        /^(\w+) whispers(?: to you)?: (.+)$/,
      ];
      for (const p of patterns) {
        const m = text.match(p);
        if (m) {
          this._handleCommand(m[1], m[2] || m[3]).catch(() => {});
          return;
        }
      }
    } catch (_) {}
  }

  async _handleCommand(username, rawMessage) {
    const prefix = config.chat.commandPrefix;
    const message = rawMessage.trim();
    if (!message.startsWith(prefix)) return;

    const parts = message.slice(prefix.length).split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    const { chatQueue, decision, autoSell } = this._modules;
    const reply = (text) => chatQueue.enqueue([text], username, 10);

    switch (cmd) {
      case 'setzone': {
        const type = args[0];
        const radius = parseFloat(args[1]) || 20;
        if (!['mob', 'crop', 'chest'].includes(type)) {
          return reply('Usage: !setzone <mob|crop|chest> [radius]');
        }
        const pos = this.bb.self.pos;
        if (!pos) return reply('Posisi bot belum tersedia.');
        this.bb.setZone(type, pos.clone(), radius);
        reply(`Zona ${type} set di ${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)} r=${radius}`);
        break;
      }
      case 'setsellpoint': {
        const pos = this.bb.self.pos;
        if (!pos) return reply('Posisi tidak tersedia.');
        this._modules.autoSell?.setSellPoint(pos.clone());
        reply(`Sell point set`);
        break;
      }
      case 'status': {
        const pos = this.bb.self.pos;
        const goal = this.bb.tasks.current?.goalId || 'idle';
        reply(`HP:${this.bb.self.hp} Food:${this.bb.self.food} Slots:${this.bb.inventory.freeSlots} Goal:${goal}`);
        break;
      }
      case 'stop': {
        this._modules.scheduler?.stop();
        this._modules.movement?.stopMovement();
        this.bb.tasks.current = null;
        reply('FarmBot dihentikan.');
        break;
      }
      case 'resume': {
        this._modules.scheduler?.start();
        decision?.forceRevaluate();
        reply('FarmBot dilanjutkan.');
        break;
      }
      case 'say': {
        const sayText = args.join(' ');
        if (!sayText) return reply('Usage: !say <teks>');
        chatQueue.enqueue([sayText], null, 10);
        break;
      }
      default:
        reply(`Cmd tidak dikenal: ${cmd}`);
    }
  }

  _handleAuthMessage(jsonMsg) {
    if (!config.auth.enabled) return;
    const text = jsonMsg.toString().toLowerCase();
    if (!config.auth.loginTriggerWords.some((w) => text.includes(w.toLowerCase()))) return;
    const pw = this.botConfig.password;
    if (!pw) return;
    setTimeout(() => {
      try { this.bot.chat(`${config.auth.loginCommand} ${pw}`); } catch (_) {}
    }, config.auth.loginDelayMs);
  }

  _onDeath() {
    this.bb.self.isDead = true;
    try { this.bot.respawn(); } catch (_) {}
  }

  _onKicked(reason) {
    this.log.warn('FarmBot kicked', { reason: formatKickReason(reason) });
    this._cleanup();
    this._scheduleReconnect();
  }

  _onEnd(reason) {
    this.log.warn('FarmBot disconnected', { reason });
    this._cleanup();
    if (config.reconnect.enabled) this._scheduleReconnect();
  }

  _cleanup() {
    try {
      this._modules.scheduler?.stop();
      this._modules.monitor?.stop();
    } catch (_) {}
  }

  _scheduleReconnect() {
    if (!config.reconnect.enabled || this._reconnectTimer) return;
    this._reconnectAttempts++;
    const delay = Math.min(
      config.reconnect.initialDelayMs * Math.pow(config.reconnect.multiplier, this._reconnectAttempts - 1),
      config.reconnect.maxDelayMs,
    );
    this.log.info(`FarmBot reconnecting in ${delay}ms`);
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

module.exports = FarmBot;
