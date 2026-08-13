'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('ChatQueue');

/**
 * ChatQueue mengelola antrean pesan keluar untuk mencegah spam
 * dan memastikan semua pesan dikirim sebagai Private Message ke owner.
 */
class ChatQueue {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  constructor(bot) {
    this.bot = bot;
    this.queue = [];
    this.isProcessing = false;
    this.owner = config.chat.ownerUsername;
    this.usePM = config.chat.usePrivateMessage;
    this.pmCommand = config.chat.privateMessageCommand || '/msg';
    
    // Konfigurasi delay
    this.delayMin = config.chat.delayMinMs || 3200;
    this.delayMax = config.chat.delayMaxMs || 5500;
  }

  /**
   * Tambahkan pesan ke dalam antrean.
   * Hanya pesan berstatus URGENT (misal: hazard, sekarat, mati, error) yang dikirim ke game chat.
   * Seluruh pesan biasa tetap dialirkan 100% ke Web Dashboard & Terminal Log.
   *
   * @param {string} message - Pesan yang akan dikirim
   * @param {boolean} [isUrgent=false] - Flag jika pesan sangat mendesak
   */
  send(message, isUrgent = false) {
    if (!message || typeof message !== 'string') return;
    
    const trimmed = message.trim();
    if (!trimmed) return;

    // Selalu catat log status ke Console Terminal & Web Dashboard
    log.info(`[System Status] ${trimmed}`);
    
    // Cek otomatis kata kunci urgent (mendesak/bahaya)
    const lower = trimmed.toLowerCase();
    const isAutoUrgent = isUrgent || 
      lower.includes('mati') || 
      lower.includes('sekarat') || 
      lower.includes('kritis') || 
      lower.includes('bahaya') || 
      lower.includes('diserang') || 
      lower.includes('error') || 
      lower.includes('terbunuh');

    // HANYA kirim ke chat game jika statusnya URGENT
    if (this.usePM && isAutoUrgent) {
      this.queue.push(trimmed);
      this._processQueue();
    }
  }

  /**
   * Kirim pesan langsung ke chat global server (bebas dari redirect PM owner).
   * @param {string} text 
   */
  sendGlobal(text) {
    if (!text || typeof text !== 'string') return;
    const trimmed = text.trim();
    if (!trimmed) return;

    this.queue.push({ type: 'global', text: trimmed });
    this._processQueue();
  }

  /**
   * Kirim pesan PM ke player spesifik.
   * @param {string} player 
   * @param {string} text 
   */
  sendToPlayer(player, text) {
    if (!text || typeof text !== 'string' || !player) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    this.queue.push({ type: 'pm', target: player, text: trimmed });
    this._processQueue();
  }

  /**
   * Mengosongkan antrean pesan (misal saat disconnect).
   */
  clear() {
    this.queue = [];
    this.isProcessing = false;
    log.debug('Antrean pesan dikosongkan.');
  }

  /**
   * Proses antrean pesan secara asynchronous.
   *
   * @private
   */
  async _processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      if (!this.bot || !this.bot.entity) {
        // Jika bot disconnect, berhenti proses tapi biarkan pesan di queue
        log.warn('Bot tidak siap, menghentikan proses antrean chat.');
        break;
      }

      const item = this.queue.shift();
      const text = typeof item === 'string' ? item : item.text;
      const targetType = typeof item === 'object' ? item.type : null;
      const targetPlayer = typeof item === 'object' ? item.target : null;
      
      try {
        if (targetType === 'global') {
          this.bot.chat(text);
          log.info(`[CHAT OUT] Global: "${text}"`);
        } else {
          // Default (send / sendToPlayer): Kirim via PM ke owner / recipient
          const recipient = targetPlayer || this.owner || 'Nelson41111';
          const pmMsg = text.startsWith('/') ? text : `${this.pmCommand} ${recipient} ${text}`;
          this.bot.chat(pmMsg);
          log.info(`[CHAT OUT] PM ke ${recipient}: "${text}"`);
        }
      } catch (err) {
        log.error(`Gagal mengirim pesan: ${err.message}`);
        this.queue.unshift(item);
        break;
      }

      // Tunggu delay acak sebelum mengirim pesan berikutnya (Rate Limiter / Anti-Spam)
      if (this.queue.length > 0) {
        const delay = Math.floor(Math.random() * (this.delayMax - this.delayMin + 1)) + this.delayMin;
        await sleep(delay);
      }
    }

    this.isProcessing = false;
  }
}

module.exports = ChatQueue;
