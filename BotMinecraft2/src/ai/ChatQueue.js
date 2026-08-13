'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { sleep, randBetween } = require('../utils/Humanizer');

/**
 * ChatQueue.js — Antrian pengiriman pesan chat yang humanized.
 *
 * Fitur:
 *   - Kirim pesan satu per satu (tidak serentak)
 *   - Delay minimum 1.7 detik antar pesan (konfigurabel)
 *   - Pesan panjang dikirim berurutan dengan jeda antar segmen
 *   - Antrian per bot (tidak bentrok dengan bot lain)
 *   - Anti-spam: tolak pesan duplikat yang berdekatan
 */
class ChatQueue {
  constructor(bot, blackboard) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'ChatQueue');

    this._queue = []; // { segments: string[], targetPlayer?: string, priority: number }
    this._processing = false;
    this._lastSentTime = 0;
    this._lastMessage = '';
  }

  /**
   * Tambahkan respons AI ke antrian (private message ke player).
   * @param {string[]} segments - Array segmen pesan
   * @param {string} [targetPlayer] - Jika diisi, kirim via /msg
   * @param {number} [priority=0] - Prioritas antrian (lebih besar = lebih depan)
   */
  enqueue(segments, targetPlayer = null, priority = 0) {
    if (!segments || segments.length === 0) return;

    // Anti-duplikat: jangan tambah pesan yang persis sama dalam 5 detik
    const combined = segments.join('|');
    if (combined === this._lastMessage && Date.now() - this._lastSentTime < 5000) {
      this.log.debug('Duplicate message suppressed');
      return;
    }

    this._queue.push({ segments, targetPlayer, priority, addedAt: Date.now() });
    this._queue.sort((a, b) => b.priority - a.priority);

    if (!this._processing) {
      this._processQueue();
    }
  }

  /**
   * Tambahkan pesan sistem (command, chat biasa).
   * @param {string} message
   */
  enqueueRaw(message, priority = 0) {
    this.enqueue([message], null, priority);
  }

  /**
   * Proses antrian — satu per satu.
   */
  async _processQueue() {
    if (this._processing) return;
    this._processing = true;

    while (this._queue.length > 0) {
      const item = this._queue.shift();
      try {
        await this._sendItem(item);
      } catch (err) {
        this.log.warn('ChatQueue send error', { error: err.message });
      }

      // Jeda antar item antrian (berbeda dari jeda antar segmen)
      const itemDelay = randBetween(
        config.chat.sendDelayMinMs,
        config.chat.sendDelayMaxMs,
      );
      await sleep(itemDelay);
    }

    this._processing = false;
  }

  /**
   * Kirim satu item antrian (mungkin multi-segmen).
   */
  async _sendItem(item) {
    const { segments, targetPlayer } = item;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment || segment.trim() === '') continue;

      // Pastikan delay minimum sejak pesan terakhir
      const now = Date.now();
      const sinceLast = now - this._lastSentTime;
      if (sinceLast < config.chat.sendDelayMinMs) {
        await sleep(config.chat.sendDelayMinMs - sinceLast);
      }

      try {
        if (targetPlayer) {
          // Kirim private message
          const cmd = `${config.chat.privateMessageCommand} ${targetPlayer} ${segment}`;
          this.bot.chat(cmd);
        } else {
          this.bot.chat(segment);
        }

        this._lastSentTime = Date.now();
        this._lastMessage = segments.join('|');

        this.log.debug('Chat sent', {
          to: targetPlayer || 'public',
          segment: i + 1,
          total: segments.length,
          length: segment.length,
        });

        // Jeda antar segmen pesan panjang
        if (i < segments.length - 1) {
          const segmentDelay = randBetween(
            config.chat.segmentDelayMs * 0.8,
            config.chat.segmentDelayMs * 1.3,
          );
          await sleep(segmentDelay);
        }
      } catch (err) {
        this.log.warn('Failed to send chat segment', { error: err.message, segment });
      }
    }
  }

  /**
   * Kosongkan antrian (saat bot disconnecting).
   */
  clear() {
    this._queue = [];
    this._processing = false;
  }

  get queueLength() {
    return this._queue.length;
  }
}

module.exports = ChatQueue;
