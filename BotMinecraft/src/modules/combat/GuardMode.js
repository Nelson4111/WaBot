'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');
const { formatMobName } = require('../../utils/formatter');

const log = createModuleLogger('GuardMode');

/** Set nama mob hostile yang dikenali */
const HOSTILE_MOB_SET = new Set(config.guard.hostileMobs);

/**
 * GuardMode memindai entity dalam radius tertentu dan menyerang
 * mob hostile menggunakan plugin mineflayer-pvp.
 *
 * Fitur:
 * - Scan entity setiap N ms (configurable)
 * - Filter hanya mob hostile dari daftar di config.json
 * - Toggle on/off via command !guard
 * - Stop otomatis saat bot mati
 */
class GuardMode {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('./Pathfinder')} pathfinder
   * @param {import('../../core/BotManager')} botManager
   */
  constructor(bot, pathfinder, botManager = null) {
    this.bot = bot;
    this.pathfinder = pathfinder;
    this.botManager = botManager;
    this.isActive = false;
    this._scanInterval = null;
  }

  /**
   * Aktifkan guard mode.
   *
   * @returns {void}
   */
  start() {
    if (this.isActive) {
      log.warn('Guard mode sudah aktif');
      return;
    }

    if (!this.bot.pvp) {
      log.warn('Plugin mineflayer-pvp tidak tersedia. Guard mode tidak bisa diaktifkan.');
      return;
    }

    this.isActive = true;
    this._startScan();
    log.success(`Guard mode aktif — radius: ${config.guard.radius} blok`);
  }

  /**
   * Nonaktifkan guard mode.
   *
   * @returns {void}
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    this._stopScan();

    // Hentikan serangan yang sedang berlangsung
    if (this.bot.pvp) {
      this.bot.pvp.stop();
    }

    log.info('Guard mode nonaktif');
  }

  /**
   * Toggle guard mode.
   *
   * @returns {boolean} Status baru (true = aktif)
   */
  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
    return this.isActive;
  }

  /**
   * Mulai scan periodik untuk mencari mob hostile.
   *
   * @private
   */
  _startScan() {
    this._scanInterval = setInterval(() => {
      this._scanAndAttack();
    }, config.guard.attackInterval);
  }

  /**
   * Hentikan scan periodik.
   *
   * @private
   */
  _stopScan() {
    if (this._scanInterval) {
      clearInterval(this._scanInterval);
      this._scanInterval = null;
    }
  }

  /**
   * Scan entity di sekitar bot dan serang mob hostile terdekat.
   *
   * @private
   */
  async _scanAndAttack() {
    if (!this.isActive || !this.bot.entity) return;
    if (this.botManager && this.botManager.isBusy) return;

    // Jeda antar pukulan minimal 1.2 detik (1200ms)
    const now = Date.now();
    if (!this._lastAttackTime) this._lastAttackTime = 0;
    if (now - this._lastAttackTime < 1200) return;

    // Timeout safety untuk state isEating (max 8s)
    if (this.bot.isEating) {
      if (!this._isEatingStartTime) this._isEatingStartTime = now;
      if (now - this._isEatingStartTime > 8000) {
        log.warn('State isEating tersangkut > 8s. Mereset state isEating...');
        this.bot.isEating = false;
        this._isEatingStartTime = 0;
      } else {
        return;
      }
    } else {
      this._isEatingStartTime = 0;
    }

    const target = this._findNearestHostile();

    if (target) {
      // 1. Auto equip pedang terbaik jika belum dipegang
      await this._equipBestWeapon().catch(() => {});

      // Re-check eating after equip async call
      if (this.bot.isEating) return;

      const dist = target.position ? target.position.distanceTo(this.bot.entity.position) : 99;

      // 2. Serang langsung jika dalam jangkauan farm (<= 4.5 block)
      if (dist <= 4.5) {
        try {
          // Arahkan pandangan ke target (dada/tubuh)
          const targetEyePos = target.position.offset(0, target.height ? target.height * 0.7 : 1, 0);
          await this.bot.lookAt(targetEyePos, true).catch(() => {});
          this.bot.attack(target);
          this._lastAttackTime = Date.now();
          log.debug(`Memukul ${formatMobName(target.name || target.displayName)} (${Math.round(dist * 10) / 10}m)`);
        } catch (_err) {
          // Silent
        }
      } else if (this.bot.pvp && !this.bot.pvp.target) {
        log.debug(`Menyerang ${formatMobName(target.name || target.displayName)} (${target.id}) via PVP pathfinding`);
        this.bot.pvp.attack(target);
        this._lastAttackTime = Date.now();
      }
    }
  }

  /**
   * Cari pedang/senjata terbaik di inventory dan equip ke tangan utama.
   *
   * @private
   */
  async _equipBestWeapon() {
    if (!this.bot.inventory) return;
    if (this.bot.isEating || (typeof this.bot.usingItem === 'boolean' && this.bot.usingItem)) return;

    // Pastikan pedang tidak tersangkut di tangan kiri (off-hand)
    const offHandItem = this.bot.inventory.slots[45];
    if (offHandItem && offHandItem.name.toLowerCase().includes('sword')) {
      try {
        await this.bot.unequip('off-hand');
      } catch (_e) {}
    }

    const items = this.bot.inventory.items();
    const weaponKeywords = ['sword', 'axe'];

    const weapons = items.filter((item) =>
      item && weaponKeywords.some((kw) => item.name.toLowerCase().includes(kw))
    );

    if (weapons.length === 0) return;

    const getScore = (name) => {
      const n = name.toLowerCase();
      if (n.includes('netherite')) return 6;
      if (n.includes('diamond')) return 5;
      if (n.includes('iron')) return 4;
      if (n.includes('stone')) return 3;
      if (n.includes('golden')) return 2;
      if (n.includes('wooden')) return 1;
      return 0;
    };

    weapons.sort((a, b) => getScore(b.name) - getScore(a.name));
    const bestWeapon = weapons[0];

    const heldItem = this.bot.heldItem;
    if (!heldItem || heldItem.name !== bestWeapon.name) {
      try {
        await this.bot.equip(bestWeapon, 'hand');
        log.info(`Equip senjata: ${bestWeapon.name}`);
      } catch (_err) {
        // Silent
      }
    }
  }

  /**
   * Temukan mob hostile terdekat dalam radius yang dikonfigurasi.
   *
   * @returns {import('prismarine-entity').Entity|null}
   * @private
   */
  _findNearestHostile() {
    const entities = Object.values(this.bot.entities);
    let nearest = null;
    let nearestDistance = config.guard.radius || 16;

    for (const entity of entities) {
      if (!entity || !entity.position) continue;
      if (entity.isValid === false) continue;

      const mobName = (entity.name || entity.displayName || '').toLowerCase();
      const isMobType = entity.type === 'mob' || entity.type === 'hostile' || entity.type === 'monster';
      const isHostileName = HOSTILE_MOB_SET.has(mobName) || mobName.includes('enderman') || mobName.includes('zombie') || mobName.includes('skeleton') || mobName.includes('creeper');

      if (!isMobType && !isHostileName) continue;

      // Skip entitas yang mati
      if (entity.metadata?.[8] === 1 || (entity.health !== undefined && entity.health <= 0)) continue;

      const distance = entity.position.distanceTo(this.bot.entity.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = entity;
      }
    }

    return nearest;
  }
}

module.exports = GuardMode;
