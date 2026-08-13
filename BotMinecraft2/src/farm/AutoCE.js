'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const TaskPlanner = require('../core/TaskPlanner');
const { MACRO_STATE } = require('../core/DecisionEngine');
const { sleep } = require('../utils/Humanizer');

/**
 * AutoCE.js — Modul Auto CrazyEnchantments.
 *
 * ARSITEKTUR KHUSUS:
 *   - Memakai task context stack: PUSH semua context aktif ke BB sebelum enchanting.
 *   - Macro-state: Enchanting (terpisah dari Farming).
 *   - Mendukung interupsi bertumpuk (SafetySystem bisa interupsi AutoCE).
 *   - POP & pulihkan context persis setelah enchanting selesai atau recovery.
 *
 * ASUMSI & BATASAN:
 *   - Posisi enchanting station/GUI diset via !setenchantpos.
 *   - Verifikasi hasil dari inventory aktual (bukan hanya GUI tertutup).
 */
class AutoCE {
  constructor(bot, blackboard, decisionEngine, taskPlanner, inventoryManager) {
    this.bot = bot;
    this.bb = blackboard;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.inv = inventoryManager;
    this.log = createModuleLogger(blackboard.botName, 'AutoCE');

    this.GOAL_ID = 'auto_ce';
    this._enchantPos = null;
    this._register();
  }

  _register() {
    // AutoCE hanya di-trigger saat item perlu enchant (skor rendah kecuali kondisi terpenuhi)
    this.decision.registerGoal(
      this.GOAL_ID,
      (bb, inv) => this._score(bb, inv),
      { macroState: MACRO_STATE.ENCHANTING },
    );
    this.planner.registerGoal(
      this.GOAL_ID,
      (params, bb, bot, inv) => this._buildPlan(params, bb, bot, inv),
    );
    this.log.info('AutoCE registered');
  }

  setEnchantPos(pos) {
    this._enchantPos = pos;
    this.log.info('Enchant position set', { pos });
  }

  _score(bb, inv) {
    if (!this._enchantPos) return 0;
    if (bb.farm.enchant.active) return 0; // Sudah enchanting

    // Cek apakah ada item yang perlu dienchant
    const needsEnchant = this._itemsNeedingEnchant(bb);
    if (needsEnchant.length === 0) return 0;

    // Cek apakah ada token/resource cukup
    const tokenCount = bb.inventory.counts[config.autoCE.currencyItem] || 0;
    if (tokenCount < config.autoCE.minTokens) return 0;

    // Skor rendah — enchanting tidak terlalu sering
    return 0.3 + (needsEnchant.length / 10) * 0.3;
  }

  _itemsNeedingEnchant(bb) {
    return config.autoCE.enchantTargets.filter((target) => {
      const count = bb.inventory.counts[target] || 0;
      return count > 0;
    });
  }

  _buildPlan(params, bb, bot, inv) {
    if (!this._enchantPos) return [];

    const steps = [
      // PUSH context sebelum enchanting
      { type: 'PUSH_CONTEXT', contextType: 'auto_ce' },

      // Menuju ke enchant station
      TaskPlanner.stepMoveTo(this._enchantPos, { range: 3 }),
      TaskPlanner.stepLookAt(this._enchantPos),
      TaskPlanner.stepWait(300),

      // Buka GUI enchanting
      { type: 'OPEN_CHEST', pos: this._enchantPos }, // atau GUI interaksi lain

      // Enchant items
      { type: 'ENCHANT_ITEMS', targets: config.autoCE.enchantTargets },

      TaskPlanner.stepWait(1000),
      TaskPlanner.stepCloseContainer(),

      // Verifikasi dari inventory aktual
      { type: 'VERIFY_ENCHANT' },

      // POP context — kembali ke task sebelumnya
      { type: 'POP_CONTEXT' },
    ];

    bb.farm.enchant.active = true;
    return steps;
  }

  /**
   * Selesaikan enchanting dan pulihkan context.
   */
  async completeEnchanting(success) {
    this.bb.farm.enchant.active = false;
    this.bb.farm.enchant.lastEnchantTime = Date.now();

    if (success) {
      this.log.info('AutoCE completed successfully');
      this.bb.recordSuccess(this.GOAL_ID);
    } else {
      this.log.warn('AutoCE failed — restoring context');
      this.bb.recordFailure(this.GOAL_ID);
    }

    // Context akan di-pop via step POP_CONTEXT di plan
  }
}

module.exports = AutoCE;
