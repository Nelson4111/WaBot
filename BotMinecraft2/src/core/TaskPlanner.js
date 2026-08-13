'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { STATUS, Sequence, Action, Condition, Selector } = require('../utils/BehaviorTree');

/**
 * TaskPlanner.js — Layer 5: Memecah goal menjadi langkah konkret.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.tasks.current (goalId, params), BB.inventory
 *   Tulis: BB.tasks.plan (array action steps), BB.tasks.currentStep
 *
 * Gunakan kombinasi:
 *   - Behavior Tree (urutan micro-step standar: approach→verify→act→verify)
 *   - GOAP-lite (pilih cara berbeda jika cara utama gagal, 2-3 langkah)
 */
class TaskPlanner {
  constructor(bot, blackboard, inventoryManager) {
    this.bot = bot;
    this.bb = blackboard;
    this.inv = inventoryManager;
    this.log = createModuleLogger(blackboard.botName, 'TaskPlanner');

    // Registry goal handler: goalId → planBuilder function
    this._planBuilders = new Map();
  }

  /**
   * Daftarkan plan builder untuk goal.
   * Farm modules memanggil ini saat diinisialisasi.
   */
  registerGoal(goalId, builderFn) {
    this._planBuilders.set(goalId, builderFn);
    this.log.debug('Goal registered', { goalId });
  }

  /**
   * Bangun plan untuk goal aktif.
   * @returns {{ success: boolean, planLength?: number }}
   */
  buildPlan() {
    const current = this.bb.tasks.current;
    if (!current) return { success: false, error: 'No current goal' };

    const builder = this._planBuilders.get(current.goalId);
    if (!builder) {
      this.log.warn('No plan builder for goal', { goalId: current.goalId });
      return { success: false, error: `Unknown goal: ${current.goalId}` };
    }

    try {
      const plan = builder(current.params, this.bb, this.bot, this.inv);
      if (!plan || plan.length === 0) {
        return { success: false, error: 'Empty plan generated' };
      }
      this.bb.tasks.plan = plan;
      this.bb.tasks.currentStep = 0;
      this.log.debug('Plan built', { goalId: current.goalId, steps: plan.length });
      return { success: true, planLength: plan.length };
    } catch (err) {
      this.log.warn('Plan build error', { goalId: current.goalId, error: err.message });
      return { success: false, error: err.message };
    }
  }

  /**
   * Cek apakah plan sudah selesai.
   */
  isPlanComplete() {
    const plan = this.bb.tasks.plan;
    if (!plan || plan.length === 0) return true;
    return this.bb.tasks.currentStep >= plan.length;
  }

  /**
   * Reset plan (biasanya dipanggil saat goal berubah).
   */
  resetPlan() {
    this.bb.tasks.plan = [];
    this.bb.tasks.currentStep = 0;
  }

  // ─── Helper builders untuk micro-step standar ────────────────────────────

  /**
   * Buat langkah MOVE_TO.
   */
  static stepMoveTo(pos, opts = {}) {
    return { type: 'MOVE_TO', pos, opts };
  }

  /**
   * Buat langkah LOOK_AT.
   */
  static stepLookAt(pos) {
    return { type: 'LOOK_AT', pos };
  }

  /**
   * Buat langkah ATTACK.
   */
  static stepAttack(entity) {
    return { type: 'ATTACK', entity };
  }

  /**
   * Buat langkah DIG_BLOCK.
   */
  static stepDig(pos) {
    return { type: 'DIG_BLOCK', pos };
  }

  /**
   * Buat langkah PLACE_BLOCK (untuk replant).
   */
  static stepPlace(pos, item) {
    return { type: 'PLACE_BLOCK', pos, item };
  }

  /**
   * Buat langkah OPEN_CHEST.
   */
  static stepOpenChest(pos) {
    return { type: 'OPEN_CHEST', pos };
  }

  /**
   * Buat langkah CLOSE_CONTAINER.
   */
  static stepCloseContainer() {
    return { type: 'CLOSE_CONTAINER' };
  }

  /**
   * Buat langkah SEND_COMMAND.
   */
  static stepCommand(command) {
    return { type: 'SEND_COMMAND', command };
  }

  /**
   * Buat langkah EQUIP.
   */
  static stepEquip(item, destination = 'hand') {
    return { type: 'EQUIP', item, destination };
  }

  /**
   * Buat langkah WAIT.
   */
  static stepWait(ms) {
    return { type: 'WAIT', ms };
  }

  /**
   * Template micro-step BT: approach → verify → act → verify.
   * @param {Vec3} targetPos
   * @param {object} action - ActionStep
   * @param {object} opts
   */
  static buildApproachActVerify(targetPos, action, opts = {}) {
    const steps = [];
    if (targetPos) {
      steps.push(TaskPlanner.stepMoveTo(targetPos, { range: opts.approachRange || 2 }));
      steps.push(TaskPlanner.stepLookAt(targetPos));
    }
    if (opts.delayBefore) steps.push(TaskPlanner.stepWait(opts.delayBefore));
    steps.push(action);
    if (opts.delayAfter) steps.push(TaskPlanner.stepWait(opts.delayAfter));
    return steps;
  }
}

module.exports = TaskPlanner;
