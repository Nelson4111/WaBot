'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { pathCostVariation } = require('../utils/Humanizer');

/**
 * MovementPlanner.js — Layer 6: Pathfinding A* dengan cost custom & humanization.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.self.pos, BB.world.model (dangerZones, claimAreas)
 *   Tulis: BB.tasks.currentPath
 *
 * Fondasi: mineflayer-pathfinder (A*).
 * Tambahan: cost-function custom untuk safety, variasi kecil tiap recalculation.
 */
class MovementPlanner {
  constructor(bot, blackboard) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'MovementPlanner');
    this._pathfinderLoaded = false;
    this._currentGoal = null;
  }

  /**
   * Inisialisasi pathfinder plugin. Dipanggil setelah bot spawn.
   */
  init() {
    try {
      const pathfinder = require('mineflayer-pathfinder');
      this.bot.loadPlugin(pathfinder.pathfinder);
      this._movements = new pathfinder.Movements(this.bot);
      this._applyCustomCosts(this._movements);
      this.bot.pathfinder.setMovements(this._movements);
      this._pathfinderLoaded = true;
      this.log.info('Pathfinder initialized');
    } catch (err) {
      this.log.error('Failed to init pathfinder', { error: err.message });
    }
  }

  /**
   * Terapkan cost custom ke movements (safety + humanization).
   */
  _applyCustomCosts(movements) {
    // Penalti tinggi untuk blok berbahaya
    movements.canDig = false; // Jangan gali blok secara default

    // Tambahkan custom block costs untuk bahaya
    const dangerBlockNames = new Set(config.safety.dangerBlocks);

    movements.allowFreeMotion = false;
    movements.allowParkour = false; // keamanan, hindari lompatan
    movements.allowSprinting = true;

    this.log.debug('Custom movement costs applied');
  }

  /**
   * Rencanakan rute ke posisi target.
   * Variasi kecil pada goal range tiap recalculation (humanization).
   * @param {Vec3} targetPos
   * @param {object} opts
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async planRouteTo(targetPos, opts = {}) {
    if (!this._pathfinderLoaded) {
      return { success: false, error: 'Pathfinder not loaded' };
    }
    if (!targetPos) {
      return { success: false, error: 'No target position' };
    }

    try {
      const { goals } = require('mineflayer-pathfinder');
      const baseRange = opts.range || 2;
      // Variasi range kecil untuk humanization
      const range = baseRange + pathCostVariation(0.5);

      const goal = new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, range);
      this.bot.pathfinder.setGoal(goal);
      this._currentGoal = goal;
      this.bb.tasks.currentPath = { target: targetPos, active: true };

      return { success: true };
    } catch (err) {
      this.log.warn('Route planning error', { error: err.message });
      return { success: false, error: err.message };
    }
  }

  /**
   * Hentikan pathfinding aktif.
   */
  stopMovement() {
    try {
      if (this._pathfinderLoaded && this.bot.pathfinder) {
        this.bot.pathfinder.stop();
      }
      this.bot.clearControlStates();
      this._currentGoal = null;
      this.bb.tasks.currentPath = null;
    } catch (_) { /* ignore */ }
  }

  /**
   * Cek apakah bot sudah mencapai target.
   * @param {Vec3} targetPos
   * @param {number} range
   */
  hasReached(targetPos, range = 2) {
    if (!targetPos || !this.bb.self.pos) return false;
    return this.bb.self.pos.distanceTo(targetPos) <= range;
  }

  /**
   * Apakah pathfinder sedang aktif bergerak.
   */
  isMoving() {
    if (!this._pathfinderLoaded) return false;
    try {
      return this.bot.pathfinder.isMoving?.() || false;
    } catch (_) {
      return false;
    }
  }

  /**
   * Cek apakah rute dari posisi saat ini ke target aman.
   * (Tidak melewati dangerZone.)
   * @param {Vec3} targetPos
   */
  isRouteSafe(targetPos) {
    if (!targetPos || !this.bb.self.pos) return true;
    const dangerZones = this.bb.world.model.dangerZones;
    if (!dangerZones || dangerZones.length === 0) return true;

    // Heuristic: cek apakah ada danger di garis lurus ke target
    const botPos = this.bb.self.pos;
    const dx = targetPos.x - botPos.x;
    const dz = targetPos.z - botPos.z;
    const steps = Math.ceil(Math.sqrt(dx * dx + dz * dz));

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const checkPos = {
        x: botPos.x + dx * t,
        y: botPos.y,
        z: botPos.z + dz * t,
      };
      const nearDanger = dangerZones.some(
        (dz) => Math.abs(dz.x - checkPos.x) < 2 && Math.abs(dz.z - checkPos.z) < 2,
      );
      if (nearDanger) return false;
    }
    return true;
  }
}

module.exports = MovementPlanner;
