'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');

/**
 * SafetySystem.js — Sistem keamanan paralel, prioritas tertinggi.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.self, BB.world.model, BB.inventory
 *   Tulis: BB.tasks.contextStack (push saat interupsi)
 *          BB.tasks.current (override ke task safety)
 *
 * Dicek SETIAP TICK sebelum pipeline normal.
 * Override semua layer lain saat terpicu.
 */

const SAFETY_STATE = Object.freeze({
  SAFE: 'SAFE',
  HP_CRITICAL: 'HP_CRITICAL',
  FOOD_CRITICAL: 'FOOD_CRITICAL',
  FALL_DANGER: 'FALL_DANGER',
  LAVA_DANGER: 'LAVA_DANGER',
  HOSTILE_PLAYER: 'HOSTILE_PLAYER',
  TOOL_CRITICAL: 'TOOL_CRITICAL',
  ARMOR_CRITICAL: 'ARMOR_CRITICAL',
});

class SafetySystem {
  constructor(bot, blackboard) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'Safety');
    this._currentThreat = SAFETY_STATE.SAFE;
    this._threatStartTime = null;
    this._safetyActionActive = false;
  }

  /**
   * Cek semua kondisi safety. Dipanggil PERTAMA setiap tick.
   * @returns {{ isSafe: boolean, threat: string, action: string|null }}
   */
  check() {
    const threats = this._detectThreats();

    if (threats.length === 0) {
      if (this._safetyActionActive) {
        this.log.info('Threats resolved, resuming normal operation');
        this._safetyActionActive = false;
        this._currentThreat = SAFETY_STATE.SAFE;
      }
      return { isSafe: true, threat: SAFETY_STATE.SAFE, action: null };
    }

    // Prioritaskan ancaman terparah
    const primaryThreat = threats[0];

    if (this._currentThreat !== primaryThreat.type) {
      this.log.warn('Safety threat detected', { threat: primaryThreat.type, details: primaryThreat.details });
      this._currentThreat = primaryThreat.type;
      this._threatStartTime = Date.now();

      // Interupsi task aktif — push ke context stack
      if (this.bb.tasks.current && !this._safetyActionActive) {
        this.bb.pushContext({
          type: 'safety_interrupt',
          task: { ...this.bb.tasks.current },
          plan: [...(this.bb.tasks.plan || [])],
          step: this.bb.tasks.currentStep,
        });
        this._safetyActionActive = true;
      }
    }

    return {
      isSafe: false,
      threat: primaryThreat.type,
      action: primaryThreat.action,
      details: primaryThreat.details,
    };
  }

  /**
   * Deteksi semua ancaman aktif, diurutkan berdasarkan prioritas.
   */
  _detectThreats() {
    const threats = [];
    const self = this.bb.self;
    const model = this.bb.world.model;

    // 1. HP Kritis
    if (self.hp <= config.safety.hpCritical) {
      threats.push({
        type: SAFETY_STATE.HP_CRITICAL,
        priority: 100,
        action: 'FLEE_OR_HEAL',
        details: { hp: self.hp },
      });
    }

    // 2. Lava/Bahaya langsung
    if (model.dangerZones && model.dangerZones.length > 0 && self.pos) {
      const nearestDanger = model.dangerZones.find(
        (dz) => dz.distanceTo(self.pos) < 3,
      );
      if (nearestDanger) {
        threats.push({
          type: SAFETY_STATE.LAVA_DANGER,
          priority: 95,
          action: 'ESCAPE_DANGER',
          details: { dangerPos: nearestDanger },
        });
      }
    }

    // 3. Player bermusuhan sangat dekat
    const hostilePlayer = model.players?.find(
      (p) => p.isHostile && p.distance < config.safety.hostilePlayerRadius,
    );
    if (hostilePlayer) {
      threats.push({
        type: SAFETY_STATE.HOSTILE_PLAYER,
        priority: 90,
        action: 'FLEE_PLAYER',
        details: { player: hostilePlayer.name, distance: hostilePlayer.distance },
      });
    }

    // 4. Fall danger (bot di tepi cliff)
    if (this._isFallDanger()) {
      threats.push({
        type: SAFETY_STATE.FALL_DANGER,
        priority: 85,
        action: 'AVOID_FALL',
        details: {},
      });
    }

    // 5. Food kritis
    if (self.food <= config.safety.foodCritical) {
      threats.push({
        type: SAFETY_STATE.FOOD_CRITICAL,
        priority: 70,
        action: 'EAT_FOOD',
        details: { food: self.food },
      });
    }

    // 6. Durability tool kritis
    if (self.toolDurability <= config.safety.armorDurabilityMin) {
      threats.push({
        type: SAFETY_STATE.TOOL_CRITICAL,
        priority: 40,
        action: 'PAUSE_FARMING',
        details: { durability: self.toolDurability },
      });
    }

    // Urutkan berdasarkan prioritas
    threats.sort((a, b) => b.priority - a.priority);
    return threats;
  }

  /**
   * Cek apakah posisi di bawah bot ada void/cliff.
   */
  _isFallDanger() {
    if (!this.bot.entity || !this.bb.self.pos) return false;
    try {
      const pos = this.bb.self.pos;
      // Jika dalam 2 blok di bawah kaki ada tanah/blok padat, bukan cliff/fall danger!
      const block1 = this.bot.blockAt(pos.offset(0, -1, 0));
      const block2 = this.bot.blockAt(pos.offset(0, -2, 0));
      if (block1 && block1.name !== 'air' && block1.name !== 'cave_air') return false;
      if (block2 && block2.name !== 'air' && block2.name !== 'cave_air') return false;

      let fallBlocks = 0;
      for (let dy = 1; dy <= config.safety.fallDangerBlocks + 2; dy++) {
        const below = this.bot.blockAt(pos.offset(0, -dy, 0));
        if (!below || below.name === 'air' || below.name === 'cave_air') {
          fallBlocks++;
        } else {
          break;
        }
      }
      return fallBlocks >= config.safety.fallDangerBlocks;
    } catch (_) {
      return false;
    }
  }

  /**
   * Eksekusi respons terhadap ancaman aktif.
   * Dipanggil dari ActionExecutor saat safety tidak aman.
   * @param {string} action
   */
  async executeResponse(action) {
    if (!this.bot || !this.bot.entity) return;

    try {
      switch (action) {
        case 'EAT_FOOD':
          await this._forceEat();
          break;

        case 'FLEE_OR_HEAL':
          await this._forceEat();
          break;

        case 'ESCAPE_DANGER':
          await this._escapeDanger();
          break;

        case 'FLEE_PLAYER':
          await this._fleePlayer();
          break;

        case 'AVOID_FALL':
          this.bot.clearControlStates();
          break;

        case 'PAUSE_FARMING':
          this.bot.clearControlStates();
          break;

        default:
          break;
      }
    } catch (err) {
      this.log.warn('Safety response error', { action, error: err.message });
    }
  }

  /**
   * Paksa makan dari inventory.
   */
  async _forceEat() {
    if (!this.bot || !this.bot.inventory) return;
    const foodPriority = config.inventory.foodPriority;
    for (const foodName of foodPriority) {
      const foodItem = this.bot.inventory.items().find((i) => i && i.name.includes(foodName));
      if (foodItem) {
        try {
          await this.bot.equip(foodItem, 'hand');
          this.bot.activateItem();
          await new Promise((r) => setTimeout(r, 1600));
          this.bot.deactivateItem();
          this.log.info('Force ate food for safety/healing', { food: foodItem.name });
          return;
        } catch (_) { /* try next */ }
      }
    }
    this.log.warn('No food available for emergency eating');
  }

  /**
   * Lari ke posisi aman.
   */
  async _fleeSafe() {
    this.bot.clearControlStates();
    await this._forceEat();
  }

  /**
   * Keluar dari blok berbahaya (lava/fire) — loncat dan mundur.
   */
  async _escapeDanger() {
    this.bot.clearControlStates();
    this.bot.setControlState('jump', true);
    this.bot.setControlState('back', true);
    setTimeout(() => {
      try {
        this.bot.clearControlStates();
      } catch (_) {}
    }, 1000);
  }

  /**
   * Lari dari player bermusuhan.
   */
  async _fleePlayer() {
    const hostile = this.bb.world.model.players.find((p) => p.isHostile);
    if (!hostile || !hostile.pos || !this.bb.self.pos) return;

    // Arah lari = arah berlawanan dari player
    const dx = this.bb.self.pos.x - hostile.pos.x;
    const dz = this.bb.self.pos.z - hostile.pos.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const fleeYaw = Math.atan2(-dx / len, -dz / len);

    try {
      this.bot.look(fleeYaw, 0, true);
      this.bot.setControlState('forward', true);
      this.bot.setControlState('sprint', true);
      setTimeout(() => {
        try { this.bot.clearControlStates(); } catch (_) {}
      }, 3000);
    } catch (_) { /* ignore */ }
  }

  /**
   * Pop context safety interrupt dan kembalikan ke task sebelumnya.
   * Dipanggil saat ancaman sudah teratasi.
   */
  restoreInterruptedContext() {
    const ctx = this.bb.popContext();
    if (ctx && ctx.type === 'safety_interrupt') {
      this.bb.tasks.current = ctx.task;
      this.bb.tasks.plan = ctx.plan;
      this.bb.tasks.currentStep = ctx.step;
      this.log.info('Restored interrupted task after safety resolved', {
        goalId: ctx.task?.goalId,
      });
    }
  }

  get currentThreat() {
    return this._currentThreat;
  }
}

module.exports = { SafetySystem, SAFETY_STATE };
