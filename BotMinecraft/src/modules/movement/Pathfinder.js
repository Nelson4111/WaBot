'use strict';

const { Movements, goals } = require('mineflayer-pathfinder');
const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');

const log = createModuleLogger('Pathfinder');

/** Timeout untuk mendeteksi bot yang stuck (tidak bergerak) */
const STUCK_CHECK_INTERVAL_MS = 5000;

/**
 * PathfinderModule adalah wrapper high-level di atas mineflayer-pathfinder.
 * Menyediakan API yang lebih sederhana untuk navigasi ke koordinat atau waypoint.
 *
 * Fitur:
 * - Goto koordinat (x, y, z) atau (x, z) dengan auto y
 * - Timeout otomatis jika stuck
 * - Cancel path yang sedang berjalan
 */
class PathfinderModule {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  constructor(bot) {
    this.bot = bot;
    this.isMoving = false;
    this._stuckTimer = null;
    this._lastPosition = null;
  }

  /**
   * Navigasikan bot ke koordinat target.
   *
   * @param {number} x - Target X
   * @param {number} z - Target Z
   * @param {number} [y] - Target Y (opsional, jika tidak diisi bot akan cari sendiri)
   * @param {number} [range=2] - Toleransi jarak dari target (blok)
   * @returns {Promise<void>}
   * @throws {Error} Jika pathfinding gagal atau timeout
   */
  async goto(x, z, y = null, range = 2) {
    if (!this.bot.pathfinder) {
      throw new Error('Plugin pathfinder belum di-load');
    }

    // Dukung input berformat Vec3: goto(vec3Pos, range)
    if (typeof x === 'object' && x !== null) {
      const pos = x;
      range = typeof z === 'number' ? z : 2;
      x = pos.x;
      y = pos.y !== undefined ? pos.y : null;
      z = pos.z;
    }

    if (this.isMoving) {
      log.debug('Bot sudah sedang bergerak. Membatalkan path sebelumnya...');
      this.stop();
    }

    if (typeof this.bot.setMaxListeners === 'function') {
      this.bot.setMaxListeners(50);
    }

    this.isMoving = true;
    this._startStuckDetection();

    log.debug(`Bergerak ke X:${x} Y:${y ?? 'auto'} Z:${z} (range: ${range})`);

    return new Promise((resolve, reject) => {
      // Set movements: Dilarang menghancurkan/menggali blok saat navigasi
      const defaultMove = new Movements(this.bot);
      defaultMove.canDig = false;
      defaultMove.allow1by1towers = false;
      this.bot.pathfinder.setMovements(defaultMove);

      // Set goal dengan range tolerance (GoalNear lebih fleksibel)
      const goalWithRange = new goals.GoalNear(
        Math.floor(x),
        y !== null ? Math.floor(y) : Math.floor(this.bot.entity.position.y),
        Math.floor(z),
        range
      );

      let stuckTimeout = null;

      const cleanupListeners = () => {
        if (stuckTimeout) clearTimeout(stuckTimeout);
        this.bot.removeListener('goal_reached', onGoalReached);
        this.bot.removeListener('path_update', onPathUpdate);
        this._cleanup();
      };

      const onGoalReached = () => {
        cleanupListeners();
        log.debug(`Berhasil sampai di X:${x} Z:${z}`);
        resolve();
      };

      const onPathUpdate = (result) => {
        if (result && result.status === 'noPath') {
          cleanupListeners();
          reject(new Error(`Tidak ada path ke X:${x} Z:${z}`));
        }
      };

      // Timeout anti-stuck
      stuckTimeout = setTimeout(() => {
        cleanupListeners();
        reject(new Error(`Timeout: bot stuck saat menuju X:${x} Z:${z}`));
      }, config.farm.stuckTimeoutMs);

      this.bot.once('goal_reached', onGoalReached);
      this.bot.on('path_update', onPathUpdate);
      this.bot.pathfinder.setGoal(goalWithRange, false);
    });
  }

  /**
   * Hentikan pergerakan bot.
   *
   * @returns {void}
   */
  stop() {
    if (this.bot.pathfinder) {
      this.bot.pathfinder.stop();
    }
    this._cleanup();
    log.debug('Pathfinder dihentikan');
  }

  /**
   * Mulai deteksi stuck: cek apakah bot tidak bergerak sama sekali.
   *
   * @private
   */
  _startStuckDetection() {
    this._lastPosition = this.bot.entity?.position
      ? { ...this.bot.entity.position }
      : null;

    this._stuckTimer = setInterval(() => {
      const pos = this.bot.entity?.position;
      if (!pos || !this._lastPosition) return;

      const moved =
        Math.abs(pos.x - this._lastPosition.x) > 0.1 ||
        Math.abs(pos.z - this._lastPosition.z) > 0.1;

      if (!moved) {
        log.debug('Bot terdeteksi tidak bergerak...');
      }

      this._lastPosition = { ...pos };
    }, STUCK_CHECK_INTERVAL_MS);
  }

  /**
   * Bersihkan state setelah navigasi selesai atau gagal.
   *
   * @private
   */
  _cleanup() {
    this.isMoving = false;
    if (this._stuckTimer) {
      clearInterval(this._stuckTimer);
      this._stuckTimer = null;
    }
    this._lastPosition = null;
  }
}

module.exports = PathfinderModule;
