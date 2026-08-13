'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const TaskPlanner = require('../core/TaskPlanner');
const { MACRO_STATE } = require('../core/DecisionEngine');
const {
  scoreDistance, scoreHistorical, computeUtility,
} = require('../utils/UtilityScorer');

/**
 * ChestDeposit.js — Modul Deposit Chest Cerdas.
 *
 * ASUMSI & BATASAN:
 *   - Chest database dibangun dari scan runtime, bukan koordinat hardcode.
 *   - Skor keandalan chest diperbarui setelah tiap sukses/gagal.
 *   - Scan ulang penuh hanya sebagai fallback terakhir.
 *   - Validasi hasil deposit dengan mengecek inventory setelahnya.
 */
class ChestDeposit {
  constructor(bot, blackboard, decisionEngine, taskPlanner, inventoryManager) {
    this.bot = bot;
    this.bb = blackboard;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.inv = inventoryManager;
    this.log = createModuleLogger(blackboard.botName, 'ChestDeposit');

    this.GOAL_ID = 'chest_deposit';
    this._register();
  }

  _register() {
    this.decision.registerGoal(
      this.GOAL_ID,
      (bb, inv) => this._score(bb, inv),
      { macroState: MACRO_STATE.DEPOSITING },
    );
    this.planner.registerGoal(
      this.GOAL_ID,
      (params, bb, bot, inv) => this._buildPlan(params, bb, bot, inv),
    );
    this.log.info('ChestDeposit registered');
  }

  _score(bb, inv) {
    // HANYA aktif jika zona chest ditentukan secara khusus (misal via !setchest / !setzone chest)
    const zone = bb.getZone('chest');
    if (!zone) return 0;

    // Jika zona chest di-set, utamakan menyetor hasil ke chest
    const usedPercent = inv.getUsedPercent();
    if (inv.shouldDeposit() || usedPercent >= 0.45) {
      return 0.96; // Prioritas sangat tinggi (0.96)
    }

    return 0;
  }

  _buildPlan(params, bb, bot, inv) {
    const chest = this._selectBestChest(bb);
    if (!chest) {
      this.log.warn('No suitable chest found for deposit');
      return [];
    }

    const steps = [
      TaskPlanner.stepMoveTo(chest.pos, { range: 2.5, timeoutMs: 3000 }),
      TaskPlanner.stepLookAt(chest.pos),
      TaskPlanner.stepOpenChest(chest.pos),
      // Deposit semua item non-protected
      { type: 'DEPOSIT_ALL_NON_PROTECTED', chestPos: chest.pos },
      TaskPlanner.stepWait(300),
      TaskPlanner.stepCloseContainer(),
    ];

    bb.farm.chest.depositTarget = chest;
    bb.farm.chest.lastDepositTime = Date.now();
    return steps;
  }

  /**
   * Pilih chest terbaik berdasarkan zona yang di-set.
   */
  _selectBestChest(bb) {
    const zone = bb.getZone('chest');
    if (zone && zone.center) {
      const pos = zone.center;
      const block = this.bot.blockAt(pos);
      return {
        pos: pos.clone(),
        key: `${pos.x},${pos.y},${pos.z}`,
        reliability: 1.0,
        type: block ? block.name : 'chest',
      };
    }

    const chestDB = bb.world.model.chestDB;
    const threshold = config.chestDeposit.reliabilityThreshold;

    let bestChest = null;
    let bestScore = -1;

    for (const [key, chest] of Object.entries(chestDB)) {
      if (chest.reliability < threshold) continue;

      const dist = bb.self.pos && chest.pos
        ? chest.pos.distanceTo(bb.self.pos)
        : 999;

      const score = computeUtility([
        { score: scoreDistance(dist, 60), weight: 0.40 },
        { score: chest.reliability, weight: 0.35 },
        { score: Math.min(1, (chest.capacity || 27) / 54), weight: 0.15 },
        { score: scoreHistorical(chest.successCount || 0, (chest.successCount || 0) + (chest.failCount || 0)), weight: 0.10 },
      ]);

      if (score > bestScore) {
        bestScore = score;
        bestChest = { ...chest, key };
      }
    }

    return bestChest;
  }

  /**
   * Deposit semua item non-protected ke chest yang terbuka.
   * Dipanggil dari ActionExecutor via custom step DEPOSIT_ALL_NON_PROTECTED.
   */
  async depositAll(container) {
    if (!container) return { success: false, error: 'No container' };

    const items = this.bot.inventory.items();
    let deposited = 0;

    for (const item of items) {
      if (this.inv.isProtected(item.name)) continue;
      try {
        await container.deposit(item.type, null, item.count);
        deposited += item.count;
        this.bb.stats.depositsMade++;
      } catch (err) {
        this.log.warn('Failed to deposit item', { item: item.name, error: err.message });
        // Turunkan reliability chest jika gagal deposit
        if (this.bb.farm.chest.depositTarget) {
          this.bb.penalizeChest(this.bb.farm.chest.depositTarget.key, 0.05);
        }
      }
    }

    // Update chest DB setelah berhasil
    if (deposited > 0 && this.bb.farm.chest.depositTarget) {
      const key = this.bb.farm.chest.depositTarget.key;
      this.bb.updateChestDB(key, {
        reliability: Math.min(1, (this.bb.world.model.chestDB[key]?.reliability || 0.8) + 0.02),
        lastVisited: Date.now(),
        successCount: (this.bb.world.model.chestDB[key]?.successCount || 0) + 1,
      });
      this.log.info('Deposit complete', { itemCount: deposited });
    }

    return { success: deposited > 0, deposited };
  }
}

module.exports = ChestDeposit;
