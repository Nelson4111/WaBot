'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { shouldInsertIdle } = require('../utils/Humanizer');

/**
 * TickScheduler.js — Layer 11: Loop utama dengan tick budget.
 *
 * KONTRAK: Menjalankan seluruh pipeline dengan budget waktu per modul.
 * Pekerjaan berat wajib bisa dipecah / di-defer — tidak boleh blokir event loop.
 *
 * Urutan per tick:
 *   1. SafetySystem (priority override)
 *   2. InventoryManager (sync update)
 *   3. WorldScanner (defer heavy work)
 *   4. EnvironmentAnalyzer
 *   5. DecisionEngine (evaluate)
 *   6. TaskPlanner (build plan jika goal baru)
 *   7. ActionExecutor (execute step)
 *   8. Monitor (anomaly check)
 */
class TickScheduler {
  constructor(components) {
    const {
      bot, blackboard, safetySystem, inventoryManager, worldScanner,
      environmentAnalyzer, decisionEngine, taskPlanner, actionExecutor,
      monitor, recoverySystem, movementPlanner,
    } = components;

    this.bot = bot;
    this.bb = blackboard;
    this.safety = safetySystem;
    this.inv = inventoryManager;
    this.scanner = worldScanner;
    this.analyzer = environmentAnalyzer;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.executor = actionExecutor;
    this.monitor = monitor;
    this.recovery = recoverySystem;
    this.movement = movementPlanner;

    this.log = createModuleLogger(blackboard.botName, 'TickScheduler');
    this._running = false;
    this._timer = null;
    this._tickCount = 0;
    this._executorBusy = false;
  }

  /**
   * Mulai loop tick.
   */
  start() {
    if (this._running) return;
    this._running = true;

    const scheduleNext = () => {
      if (!this._running) return;
      this._timer = setTimeout(async () => {
        const start = Date.now();
        await this._tick();
        const elapsed = Date.now() - start;
        const delay = Math.max(0, config.tick.intervalMs - elapsed);
        if (this._running) {
          this._timer = setTimeout(scheduleNext, delay);
        }
      }, config.tick.intervalMs);
    };

    scheduleNext();
    this.log.info('TickScheduler started');
  }

  /**
   * Hentikan loop tick.
   */
  stop() {
    this._running = false;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this.log.info('TickScheduler stopped');
  }

  /**
   * Satu siklus tick — dijalankan tiap 50ms.
   */
  async _tick() {
    if (!this._running) return;
    this._tickCount++;

    const budget = config.tick.budget;
    let t = Date.now();

    try {
      // Perbarui self state dari bot
      this.bb.updateSelf(this.bot);

      // ─── 1. SAFETY SYSTEM (override semua) ─────────────────────────────
      const safety = this.safety.check();
      if (!safety.isSafe) {
        await this.safety.executeResponse(safety.action);
        return; // skip pipeline normal saat ada ancaman
      } else if (this.bb.tasks.contextStack.some((c) => c.type === 'safety_interrupt')) {
        // Safety baru saja selesai — restore context
        this.safety.restoreInterruptedContext();
      }

      this._checkBudget(t, budget.safetySystem, 'SafetySystem');
      t = Date.now();

      // ─── 2. INVENTORY MANAGER ───────────────────────────────────────────
      this.inv.tick();
      this._checkBudget(t, budget.safetySystem, 'InventoryManager');
      t = Date.now();

      // ─── 3. WORLD SCANNER (deferred) ────────────────────────────────────
      this.scanner.tick(budget.worldScanner);
      this._checkBudget(t, budget.worldScanner, 'WorldScanner');
      t = Date.now();

      // ─── 4. ENVIRONMENT ANALYZER ────────────────────────────────────────
      this.analyzer.tick();
      this._checkBudget(t, budget.environmentAnalyzer, 'EnvAnalyzer');
      t = Date.now();

      // ─── 5. DECISION ENGINE ─────────────────────────────────────────────
      const decision = this.decision.evaluate();
      if (decision.changed && decision.newGoal) {
        // Goal baru — reset plan
        this.planner.resetPlan();
        this._executorBusy = false;
      }
      this._checkBudget(t, budget.decisionEngine, 'DecisionEngine');
      t = Date.now();

      // ─── 6. TASK PLANNER ────────────────────────────────────────────────
      if (this.bb.tasks.current && this.planner.isPlanComplete()) {
        const planResult = this.planner.buildPlan();
        if (!planResult.success) {
          // Plan build failed — trigger recovery
          await this.recovery.handle(new Error(planResult.error), {
            source: 'TaskPlanner',
            goalId: this.bb.tasks.current?.goalId,
            taskId: `plan_${this.bb.tasks.current?.goalId}`,
          });
        }
      }
      this._checkBudget(t, budget.taskPlanner, 'TaskPlanner');
      t = Date.now();

      // ─── 7. ACTION EXECUTOR ─────────────────────────────────────────────
      if (this.bb.tasks.current && !this.planner.isPlanComplete() && !this._executorBusy) {
        // Idle behavior inject (humanization)
        if (this._tickCount % 100 === 0 && shouldInsertIdle()) {
          this.bb.tasks.plan.splice(this.bb.tasks.currentStep, 0, { type: 'IDLE_BEHAVIOR' });
        }

        this._executorBusy = true;
        this.executor.executePlanStep().then((result) => {
          this._executorBusy = false;
          if (result.status === 'FAILED') {
            this.log.debug('Step failed, advancing without recovery delay', { error: result.error });
            if (this.planner.isPlanComplete()) {
              this.decision.forceRevaluate();
            }
          }
          if (result.status === 'DONE' && this.planner.isPlanComplete()) {
            const goalId = this.bb.tasks.current?.goalId;
            if (goalId) this.bb.recordSuccess(goalId);
            this.decision.forceRevaluate();
          }
        }).catch((_) => { this._executorBusy = false; });
      }
      this._checkBudget(t, budget.actionExecutor, 'ActionExecutor');

      // ─── 8. MONITOR ─────────────────────────────────────────────────────
      this.monitor.tick(this.bb.self.pos);

    } catch (err) {
      this.log.warn('Tick error (caught)', { error: err.message });
    }
  }

  /**
   * Log peringatan jika budget terlampaui.
   */
  _checkBudget(startTime, budgetMs, moduleName) {
    const elapsed = Date.now() - startTime;
    if (elapsed > budgetMs * 2) {
      this.log.debug(`Budget exceeded: ${moduleName} took ${elapsed}ms (budget: ${budgetMs}ms)`);
    }
  }
}

module.exports = TickScheduler;
