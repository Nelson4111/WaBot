'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');

const log = createModuleLogger('AutoEat');

/**
 * AutoEat adalah wrapper konfigurasi untuk plugin mineflayer-auto-eat.
 * Plugin ini otomatis memakan makanan terbaik saat food level rendah.
 *
 * Mendukung dua API:
 * - v4.x API: bot.autoEat.options, bot.autoEat.enable(), bot.autoEat.disable()
 * - v5.x API: bot.autoEat.setOpts(), bot.autoEat.enableAuto(), bot.autoEat.disableAuto()
 *
 * Deteksi otomatis versi yang digunakan.
 */
class AutoEat {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  constructor(bot) {
    this.bot = bot;
    this.isActive = false;
    /** @type {'v4'|'v5'|null} Versi API yang digunakan */
    this._apiVersion = null;
  }

  /**
   * Deteksi versi API auto-eat yang tersedia.
   *
   * @returns {'v4'|'v5'|null}
   * @private
   */
  _detectApiVersion() {
    if (!this.bot.autoEat) return null;
    if (typeof this.bot.autoEat.enableAuto === 'function') return 'v5';
    if (typeof this.bot.autoEat.enable === 'function') return 'v4';
    return null;
  }

  /**
   * Konfigurasi dan aktifkan plugin auto-eat.
   *
   * @returns {void}
   */
  start() {
    // Pastikan plugin sudah di-load
    if (!this.bot.autoEat) {
      log.warn('Plugin mineflayer-auto-eat belum di-load. AutoEat tidak aktif.');
      return;
    }

    this._apiVersion = this._detectApiVersion();

    if (!this._apiVersion) {
      log.warn('Versi mineflayer-auto-eat tidak dikenali. AutoEat tidak aktif.');
      return;
    }

    log.debug(`Menggunakan mineflayer-auto-eat API ${this._apiVersion}`);

    if (this._apiVersion === 'v5') {
      // v5.x API
      this.bot.autoEat.setOpts({
        priority: config.autoEat.priority,
        minHunger: 20 - config.autoEat.startAt, // v5 uses minHunger (points below max)
        bannedFood: config.autoEat.bannedFood,
      });
      this.bot.autoEat.enableAuto();

      this.bot.autoEat.on('eatStart', (opts) => {
        this.bot.isEating = true;
        if (opts?.food?.name) log.info(`AutoEat: mulai makan ${opts.food.name}`);
      });
      this.bot.autoEat.on('eatStop', () => {
        this.bot.isEating = false;
        log.debug('AutoEat: selesai makan');
      });
      this.bot.autoEat.on('error', (err) => {
        this.bot.isEating = false;
        log.warn(`AutoEat error: ${err.message}`);
        this._notifyFoodEmpty();
      });
      this.bot.on('autoeat_error', (err) => {
        this.bot.isEating = false;
        log.warn(`AutoEat error: ${err.message}`);
        this._notifyFoodEmpty();
      });
    } else {
      // v4.x API
      this.bot.autoEat.options = {
        priority: config.autoEat.priority,
        startAt: config.autoEat.startAt,
        bannedFood: config.autoEat.bannedFood,
        checkOnItemPickup: config.autoEat.checkOnItemPickup,
      };
      this.bot.autoEat.enable();

      this.bot.on('autoeat_started', (item) => {
        this.bot.isEating = true;
        log.info(`AutoEat: mulai makan ${item.name}`);
      });
      this.bot.on('autoeat_stopped', () => {
        this.bot.isEating = false;
        log.debug('AutoEat: selesai makan');
      });
      this.bot.on('autoeat_error', (err) => {
        this.bot.isEating = false;
        log.warn(`AutoEat error: ${err.message}`);
        this._notifyFoodEmpty();
      });
    }

    // Dengarkan perubahan darah (health) & lapar (food) untuk makan otomatis saat darah berkurang
    this.bot.on('health', async () => {
      if (!this.isActive || this.bot.isEating) return;
      // Jika darah bot kurang dari 18 ATAU makanan kurang dari 15, paksa makan untuk regenerasi darah!
      if ((this.bot.health !== undefined && this.bot.health <= 18) || (this.bot.food !== undefined && this.bot.food <= 15)) {
        await this.forceEat().catch(() => {});
      }
    });

    this.isActive = true;
    log.success(`AutoEat aktif (API ${this._apiVersion}) — makan saat food ≤ ${config.autoEat.startAt}/20 atau HP ≤ 18/20`);
  }

  /**
   * Paksa bot makan sekarang (digunakan oleh command !eat).
   *
   * @returns {Promise<void>}
   */
  async forceEat() {
    if (!this.bot.autoEat) {
      log.warn('AutoEat plugin tidak tersedia');
      return;
    }

    // Coba API v5 manual eat
    if (this._apiVersion === 'v5' && typeof this.bot.autoEat.eat === 'function') {
      try {
        await this.bot.autoEat.eat();
        log.info('Makan secara manual (v5 API)');
        return;
      } catch (err) {
        log.warn(`Gagal makan via v5 API: ${err.message}`);
      }
    }

    // Fallback: cari makanan terbaik di inventory dan makan manual
    const items = this.bot.inventory.items();
    const priorities = config.inventory?.foodPriority || [];
    
    const FOOD_NAMES = [
      'cooked_beef', 'steak', 'cooked_porkchop', 'cooked_chicken', 'cooked_mutton',
      'cooked_rabbit', 'cooked_cod', 'cooked_salmon', 'bread', 'baked_potato',
      'golden_apple', 'apple', 'golden_carrot', 'carrot', 'melon_slice', 'sweet_berries',
      'glow_berries', 'cookie', 'pumpkin_pie', 'mushroom_stew', 'beetroot_soup'
    ];

    let food = null;
    let bestScore = -1;

    for (const item of items) {
      if (!item || !item.name) continue;
      const n = item.name.toLowerCase();
      const isFood = (item.foodPoints !== undefined && item.foodPoints > 0) ||
                     FOOD_NAMES.includes(n) ||
                     n.includes('cooked') || n.includes('bread') || n.includes('apple') ||
                     n.includes('pie') || n.includes('stew') || n.includes('soup') || n.includes('carrot');

      if (isFood) {
        const index = priorities.indexOf(n);
        const score = index !== -1 ? (priorities.length - index) * 100 : (item.foodPoints || 10);
        if (score > bestScore) {
          bestScore = score;
          food = item;
        }
      }
    }

    if (!food) {
      log.info('Tidak ada makanan di inventory');
      this._notifyFoodEmpty();
      return;
    }

    try {
      this.bot.isEating = true;
      await this.bot.equip(food, 'hand');
      await this.bot.consume();
      log.info(`Makan ${food.name} secara manual`);
    } catch (err) {
      if (!err.message || !err.message.includes('Food is full')) {
        log.warn(`Gagal makan: ${err.message}`);
      }
    } finally {
      this.bot.isEating = false;
    }
  }

  /**
   * Kirim pesan PM ke owner (Nelson41111) saat makanan bot habis.
   * Cooldown 3 menit agar tidak spam.
   * @private
   */
  _notifyFoodEmpty() {
    const now = Date.now();
    if (!this._lastFoodNotice) this._lastFoodNotice = 0;

    if (now - this._lastFoodNotice > 180000) {
      this._lastFoodNotice = now;
      const owner = config.chat?.ownerUsername || 'Nelson41111';
      const pmCmd = config.chat?.privateMessageCommand || '/msg';
      log.warn(`Makanan habis! Mengirim PM ke ${owner}...`);
      this.bot.chat(`${pmCmd} ${owner} Makanan aku habis nih! Minta makan dong bro 🍖`);
    }
  }

  /**
   * Hentikan auto-eat.
   *
   * @returns {void}
   */
  stop() {
    if (!this.bot.autoEat) {
      this.isActive = false;
      return;
    }

    if (this._apiVersion === 'v5') {
      if (typeof this.bot.autoEat.disableAuto === 'function') {
        this.bot.autoEat.disableAuto();
      }
    } else if (this._apiVersion === 'v4') {
      if (typeof this.bot.autoEat.disable === 'function') {
        this.bot.autoEat.disable();
      }
    }

    this.isActive = false;
    log.info('AutoEat dihentikan');
  }
}

module.exports = AutoEat;
