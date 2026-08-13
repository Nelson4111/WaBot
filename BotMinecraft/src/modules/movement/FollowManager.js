'use strict';

const { goals } = require('mineflayer-pathfinder');
const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');

const log = createModuleLogger('FollowManager');

/**
 * FollowManager memungkinkan bot mengikuti player secara dinamis
 * atau berjalan mendekati player (Come).
 */
class FollowManager {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('./Pathfinder')} pathfinder
   * @param {import('../chat/ChatQueue')} chatQueue
   */
  constructor(bot, pathfinder, chatQueue) {
    this.bot = bot;
    this.pathfinder = pathfinder;
    this.chatQueue = chatQueue;
    this.isFollowing = false;
    this.targetUsername = null;
  }

  /**
   * Mulai mengikuti seorang player.
   *
   * @param {string} username 
   * @returns {boolean}
   */
  startFollow(username) {
    const targetEntity = this._findPlayer(username);

    if (!targetEntity) {
      log.warn(`Player ${username} tidak ditemukan.`);
      if (this.chatQueue) this.chatQueue.send(`Gagal mengikuti: Player ${username} tidak ditemukan (offline/terlalu jauh).`);
      return false;
    }

    this.isFollowing = true;
    this.targetUsername = username;
    
    // Stop aktivitas pergerakan lain
    if (this.pathfinder.isMoving) {
        this.pathfinder.stop();
    }

    const distance = config.movement.followDistance || 3;
    const goal = new goals.GoalFollow(targetEntity, distance);
    
    // Set dynamic goal (GoalFollow allows target moving)
    this.bot.pathfinder.setGoal(goal, true);
    
    log.info(`Mengikuti player ${username}`);
    if (this.chatQueue) this.chatQueue.send(`Aku sekarang mengikutimu.`);
    return true;
  }

  /**
   * Hentikan mengikuti.
   */
  stopFollow() {
    if (this.isFollowing) {
      this.isFollowing = false;
      this.targetUsername = null;
      if (this.bot.pathfinder) {
        this.bot.pathfinder.setGoal(null); // Stop moving immediately
      }
      log.info('Berhenti mengikuti player');
      if (this.chatQueue) this.chatQueue.send(`Berhenti.`);
    }
  }

  /**
   * Mendatangi player ke posisinya saat ini (tidak mengikuti jika dia pindah).
   * 
   * @param {string} username 
   */
  async comeTo(username) {
    const targetEntity = this._findPlayer(username);

    if (!targetEntity) {
      log.warn(`Player ${username} tidak ditemukan.`);
      if (this.chatQueue) this.chatQueue.send(`Tidak bisa datang: Player ${username} tidak ditemukan.`);
      return false;
    }

    if (this.isFollowing) this.stopFollow();

    if (this.chatQueue) this.chatQueue.send(`Menuju lokasimu...`);

    try {
        const p = targetEntity.position;
        // Jarak toleransi 2 block
        await this.pathfinder.goto(p.x, p.z, p.y, 2);
        if (this.chatQueue) this.chatQueue.send(`Aku sudah sampai.`);
        return true;
    } catch (err) {
        log.warn(`Gagal come: ${err.message}`);
        if (this.chatQueue) this.chatQueue.send(`Gagal mendekat: ${err.message}`);
        return false;
    }
  }

  /**
   * Cari entity player berdasarkan nama.
   * @private
   */
  _findPlayer(username) {
    return this.bot.players[username]?.entity;
  }
}

module.exports = FollowManager;
