'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const TaskPlanner = require('../core/TaskPlanner');
const { facePositionHumanized, sleep, randBetween } = require('../utils/Humanizer');

/**
 * GiveItem.js — Modul Give Item ke Player.
 *
 * ARSITEKTUR: Behavior Tree penuh.
 * Alur:
 *   1. Cari player tujuan & validasi online/dalam jangkauan
 *   2. Rute mendekati ke jarak aman
 *   3. Hadapkan ke player secara humanized (bukan snap)
 *   4. Cek jarak & line of sight, re-plan jika terhalang
 *   5. Lempar item bertahap sesuai jumlah
 *   6. Verifikasi item diambil (monitor item entity + timeout)
 *   7. Kembalikan context via POP_CONTEXT
 *
 * ASUMSI: Dipicu via command !give <player> <item> <count>
 */
class GiveItem {
  constructor(bot, blackboard, decisionEngine, taskPlanner) {
    this.bot = bot;
    this.bb = blackboard;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.log = createModuleLogger(blackboard.botName, 'GiveItem');

    this.GOAL_ID = 'give_item';
    this._pendingGive = null; // { targetPlayer, itemName, count }
    this._register();
  }

  _register() {
    // GiveItem hanya aktif saat ada permintaan pending
    this.decision.registerGoal(
      this.GOAL_ID,
      (bb) => this._score(bb),
      { macroState: 'Farming', enabled: true },
    );
    this.planner.registerGoal(
      this.GOAL_ID,
      (params, bb, bot) => this._buildPlan(params, bb, bot),
    );
    this.log.info('GiveItem registered');
  }

  /**
   * Set request give item baru (dari command handler).
   */
  setRequest(targetPlayer, itemName, count) {
    this._pendingGive = { targetPlayer, itemName, count: parseInt(count) || 1 };
    this.decision.forceRevaluate();
    this.log.info('Give request queued', { targetPlayer, itemName, count });
  }

  _score(bb) {
    if (!this._pendingGive) return 0;
    return 0.9; // Prioritas tinggi saat ada request
  }

  _buildPlan(params, bb, bot) {
    if (!this._pendingGive) return [];
    const { targetPlayer, itemName, count } = this._pendingGive;

    const steps = [
      // Push context sebelum give
      { type: 'PUSH_CONTEXT', contextType: 'give_item' },

      // Cari & validasi player target
      { type: 'FIND_PLAYER', targetPlayer },

      // Mendekat ke player (jarak aman = 3-4 blok)
      { type: 'APPROACH_PLAYER', targetPlayer, range: 3 },

      // Hadap player secara humanized
      { type: 'FACE_PLAYER', targetPlayer },

      // Cek LoS, re-plan jika terhalang
      { type: 'CHECK_LOS', targetPlayer },

      // Lempar item bertahap
      { type: 'TOSS_TO_PLAYER', targetPlayer, itemName, count },

      // Verifikasi item diambil (timeout 10 detik)
      { type: 'VERIFY_ITEM_TAKEN', targetPlayer, itemName, count, timeoutMs: 10000 },

      // Kembalikan context
      { type: 'POP_CONTEXT' },
    ];

    return steps;
  }

  /**
   * Verifikasi apakah item sudah diambil player.
   * Monitor entity item di dekat player.
   */
  async verifyItemTaken(targetPlayer, itemName, count, timeoutMs) {
    const startInvCounts = { ...this.bb.inventory.counts };
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const player = Object.values(this.bot.entities)
        .find((e) => e.type === 'player' && e.username === targetPlayer);

      if (!player) {
        this.log.warn('Target player disappeared during give');
        return false;
      }

      // Cek apakah item drop sudah hilang dari area
      const nearbyItems = Object.values(this.bot.entities).filter((e) => {
        if (e.name !== 'item') return false;
        return player.position.distanceTo(e.position) < 5;
      });

      if (nearbyItems.length === 0) {
        this.log.info('Item appears to have been picked up', { targetPlayer, itemName });
        return true;
      }

      await sleep(500);
    }

    this.log.warn('Item verification timeout — item may not have been taken', {
      targetPlayer, itemName,
    });
    return false;
  }

  /**
   * Periksa line of sight ke player.
   * @returns {boolean}
   */
  hasLineOfSight(targetPlayer) {
    const player = Object.values(this.bot.entities)
      .find((e) => e.type === 'player' && e.username === targetPlayer);
    if (!player || !this.bb.self.pos) return false;

    const dist = player.position.distanceTo(this.bb.self.pos);
    if (dist > 8) return false;

    // Simple LoS: cek beberapa titik antara bot dan player
    const steps = Math.ceil(dist);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkPos = {
        x: this.bb.self.pos.x + (player.position.x - this.bb.self.pos.x) * t,
        y: this.bb.self.pos.y + (player.position.y - this.bb.self.pos.y) * t,
        z: this.bb.self.pos.z + (player.position.z - this.bb.self.pos.z) * t,
      };
      try {
        const block = this.bot.blockAt(checkPos);
        if (block && block.boundingBox !== 'empty' && block.name !== 'air') return false;
      } catch (_) { continue; }
    }
    return true;
  }

  /**
   * Selesai — clear request.
   */
  clearRequest() {
    this._pendingGive = null;
  }
}

module.exports = GiveItem;
