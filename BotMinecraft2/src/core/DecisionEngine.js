'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const {
  scoreDistance,
  scoreDensity,
  scoreRisk,
  scoreTimeSince,
  scoreHistorical,
  scoreItemValue,
  computeUtility,
  scoresClose,
} = require('../utils/UtilityScorer');
const { probabilisticSelect } = require('../utils/Humanizer');

/**
 * DecisionEngine.js — Layer 4: HSM + Utility AI untuk pemilihan goal.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.world.model, BB.stats, BB.inventory, BB.recovery, BB.tasks
 *   Tulis: BB.tasks.current (goal terpilih)
 *
 * Macro-states HSM:
 *   Idle | Farming | Depositing | Selling | Enchanting | Recovering | Fleeing
 *
 * Utility AI:
 *   Setiap goal kandidat di-score dari kombinasi faktor dengan noise.
 *   Pemilihan probabilistik saat skor berdekatan.
 */

const MACRO_STATE = Object.freeze({
  IDLE: 'Idle',
  FARMING: 'Farming',
  DEPOSITING: 'Depositing',
  SELLING: 'Selling',
  ENCHANTING: 'Enchanting',
  RECOVERING: 'Recovering',
  FLEEING: 'Fleeing',
});

class DecisionEngine {
  constructor(bot, blackboard, inventoryManager) {
    this.bot = bot;
    this.bb = blackboard;
    this.inv = inventoryManager;
    this.log = createModuleLogger(blackboard.botName, 'DecisionEngine');

    this._macroState = MACRO_STATE.IDLE;
    this._goalRegistry = new Map(); // goalId → { scorer, enabled }
    this._lastDecisionTime = 0;
    this._decisionCooldownMs = 2000; // Re-evaluate setiap 2 detik
  }

  /**
   * Daftarkan goal kandidat dengan fungsi scorer-nya.
   * Farm modules memanggil ini saat diinisialisasi.
   * @param {string} goalId
   * @param {function} scorerFn - (bb, inv) => number (0-1)
   * @param {object} opts - { macroState, enabled }
   */
  registerGoal(goalId, scorerFn, opts = {}) {
    this._goalRegistry.set(goalId, {
      scorer: scorerFn,
      macroState: opts.macroState || MACRO_STATE.FARMING,
      enabled: opts.enabled !== false,
    });
    this.log.debug('Goal registered with DecisionEngine', { goalId });
  }

  /**
   * Evaluasi dan pilih goal. Dipanggil tiap beberapa tick.
   * @returns {{ changed: boolean, newGoal?: object }}
   */
  evaluate() {
    const now = Date.now();
    if (now - this._lastDecisionTime < this._decisionCooldownMs) {
      return { changed: false };
    }
    this._lastDecisionTime = now;

    // Jika dalam recovery, biarkan Recovery mode
    if (this.bb.recovery.isInRecovery) {
      this._transitionTo(MACRO_STATE.RECOVERING);
      return { changed: false };
    }

    // Jika task aktif masih valid (belum selesai), lanjutkan
    if (this.bb.tasks.current && this.bb.tasks.plan.length > 0 &&
        this.bb.tasks.currentStep < this.bb.tasks.plan.length) {
      return { changed: false };
    }

    // Evaluasi semua goal kandidat
    const candidates = this._scoreAllGoals();
    if (candidates.length === 0) {
      this._transitionTo(MACRO_STATE.IDLE);
      this.bb.tasks.current = null;
      return { changed: true, newGoal: null };
    }

    // Pilih goal: probabilistik jika skor berdekatan, deterministik jika tidak
    let selected;
    const top = candidates[0];
    const second = candidates[1];
    if (second && scoresClose(top.score, second.score, 0.12)) {
      selected = probabilisticSelect([top, second]);
    } else {
      selected = top;
    }

    // Cek apakah goal berubah atau plan sebelumnya sudah selesai
    const prevGoalId = this.bb.tasks.current?.goalId;
    const planFinished = !this.bb.tasks.plan || this.bb.tasks.currentStep >= this.bb.tasks.plan.length;

    if (selected.id === prevGoalId && !planFinished) return { changed: false };

    // Set goal baru
    const newGoal = {
      goalId: selected.id,
      priority: selected.score,
      params: selected.params || {},
      startTime: Date.now(),
    };

    this.bb.tasks.current = newGoal;
    this._transitionTo(selected.macroState);

    this.log.info('New goal selected', {
      goalId: selected.id,
      score: selected.score.toFixed(3),
      macroState: this._macroState,
    });

    return { changed: true, newGoal };
  }

  /**
   * Hitung score semua goal yang terdaftar dan aktif.
   */
  _scoreAllGoals() {
    const candidates = [];

    for (const [goalId, goalDef] of this._goalRegistry) {
      if (!goalDef.enabled) continue;

      try {
        const score = goalDef.scorer(this.bb, this.inv);
        if (score > 0) {
          candidates.push({
            id: goalId,
            score,
            macroState: goalDef.macroState,
          });
        }
      } catch (err) {
        this.log.warn('Scorer error', { goalId, error: err.message });
      }
    }

    // PRIORITAS ABSOLUT: Depositing & Selling override farming jika threshold tercapai
    this._applyPriorityOverrides(candidates);

    // Sort descending
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  /**
   * Terapkan override prioritas untuk depositing dan selling.
   * Ini bukan if-else datar — ini constraint modifier di atas scoring.
   */
  _applyPriorityOverrides(candidates) {
    const invFull = this.inv.shouldDeposit();
    const shouldSell = this.inv.shouldSell();

    for (const c of candidates) {
      if (c.id === 'chest_deposit' && invFull) {
        c.score = Math.min(1, c.score + 0.4); // boost besar tapi tidak memaksa
      }
      if (c.id === 'auto_sell' && shouldSell) {
        c.score = Math.min(1, c.score + 0.3);
      }
    }
  }

  /**
   * Transisi ke macro-state baru.
   */
  _transitionTo(state) {
    if (this._macroState !== state) {
      this.log.debug('HSM transition', { from: this._macroState, to: state });
      this._macroState = state;
    }
  }

  /**
   * Enable/disable goal tertentu.
   */
  setGoalEnabled(goalId, enabled) {
    const def = this._goalRegistry.get(goalId);
    if (def) def.enabled = enabled;
  }

  get macroState() {
    return this._macroState;
  }

  /**
   * Paksa re-evaluate pada tick berikutnya.
   */
  forceRevaluate() {
    this._lastDecisionTime = 0;
  }
}

module.exports = { DecisionEngine, MACRO_STATE };
