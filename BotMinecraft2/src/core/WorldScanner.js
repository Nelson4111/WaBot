'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');

/**
 * WorldScanner.js — Layer 1: Pengumpul data mentah dunia.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.self.pos
 *   Tulis: BB.world.rawScan (entities, blocks, itemDrops, chestPositions)
 *
 * Pekerjaan berat di-defer dalam deferredQueue agar tidak blokir event loop.
 */
class WorldScanner {
  constructor(bot, blackboard) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'WorldScanner');
    this._deferredQueue = [];
    this._lastFullScan = 0;
    this._scanInProgress = false;
  }

  /**
   * Dipanggil tiap tick oleh TickScheduler.
   * Mengelola kapan full scan vs incremental update.
   */
  tick(budgetMs) {
    const now = Date.now();
    const needFullScan = now - this._lastFullScan >= config.scanner.fullScanIntervalMs;

    if (needFullScan && !this._scanInProgress) {
      this._scheduleFullScan();
    }

    // Proses deferred queue dalam budget
    this._processDeferredQueue(budgetMs);
  }

  /**
   * Jadwalkan full scan sebagai tugas deferred.
   */
  _scheduleFullScan() {
    this._deferredQueue.push(
      () => this._scanEntities(),
      () => this._scanItemDrops(),
      () => this._scanChestPositions(),
    );
    this._lastFullScan = Date.now();
  }

  /**
   * Proses antrian deferred dalam batas waktu.
   */
  _processDeferredQueue(budgetMs) {
    const start = Date.now();
    while (this._deferredQueue.length > 0) {
      if (Date.now() - start >= budgetMs) break;
      const task = this._deferredQueue.shift();
      try {
        task();
      } catch (err) {
        this.log.warn('Deferred scan task error', { error: err.message });
      }
    }
  }

  /**
   * Scan semua entity dalam radius konfigurabel.
   */
  _scanEntities() {
    if (!this.bot.entity) return;
    const radius = config.scanner.entityRadius;
    const botPos = this.bot.entity.position;

    const entities = Object.values(this.bot.entities).filter((e) => {
      if (e === this.bot.entity) return false;
      if (!e.position) return false;
      return e.position.distanceTo(botPos) <= radius;
    });

    this.bb.world.rawScan.entities = entities.map((e) => ({
      id: e.id,
      type: e.type,
      name: e.name || e.username || e.type,
      pos: e.position.clone(),
      metadata: e.metadata,
      displayName: e.displayName,
      entityType: e.entityType,
      equipment: e.equipment || [],
    }));
    this.bb.world.rawScan.lastScanTime = Date.now();
  }

  /**
   * Scan item drop di tanah dalam radius konfigurabel.
   */
  _scanItemDrops() {
    if (!this.bot.entity) return;
    const radius = config.scanner.itemDropRadius;
    const botPos = this.bot.entity.position;

    const drops = Object.values(this.bot.entities).filter((e) => {
      if (e.type !== 'object' && e.name !== 'item') return false;
      if (!e.position) return false;
      return e.position.distanceTo(botPos) <= radius;
    });

    this.bb.world.rawScan.itemDrops = drops.map((e) => ({
      id: e.id,
      pos: e.position.clone(),
      item: e.metadata?.[8] || null,
    }));
  }

  /**
   * Scan posisi chest (blok) dalam radius.
   */
  _scanChestPositions() {
    if (!this.bot.entity) return;
    const radius = Math.min(config.scanner.chestRadius, 24);
    const chestTypes = new Set([
      'chest', 'trapped_chest', 'barrel', 'shulker_box',
      'white_shulker_box', 'orange_shulker_box', 'magenta_shulker_box',
      'light_blue_shulker_box', 'yellow_shulker_box', 'lime_shulker_box',
      'pink_shulker_box', 'gray_shulker_box', 'light_gray_shulker_box',
      'cyan_shulker_box', 'purple_shulker_box', 'blue_shulker_box',
      'brown_shulker_box', 'green_shulker_box', 'red_shulker_box',
      'black_shulker_box',
    ]);

    try {
      const foundPos = this.bot.findBlocks({
        matching: (b) => b && chestTypes.has(b.name),
        maxDistance: radius,
        count: 50,
      });

      const found = foundPos.map((pos) => {
        const block = this.bot.blockAt(pos);
        return { pos: pos.clone(), type: block ? block.name : 'chest' };
      });

      this.bb.world.rawScan.chestPositions = found;
    } catch (err) {
      this.log.warn('Chest scan error', { error: err.message });
    }
  }

  /**
   * Scan blok crop dalam radius (dipakai CropFarm).
   * @param {number} [customRadius]
   */
  scanCrops(customRadius) {
    if (!this.bot.entity) return [];
    const radius = Math.min(customRadius || config.scanner.blockRadius, 32);
    const ids = this._getCropBlockIds();
    if (ids.length === 0) return [];

    try {
      const foundPos = this.bot.findBlocks({
        matching: ids,
        maxDistance: radius,
        count: 100,
      });

      return foundPos.map((pos) => ({
        pos: pos.clone(),
        block: this.bot.blockAt(pos),
      })).filter((item) => item.block !== null);
    } catch (err) {
      this.log.warn('Crop scan error', { error: err.message });
      return [];
    }
  }

  _getCropBlockIds() {
    if (this._cropBlockIds && this._cropBlockIds.length > 0) return this._cropBlockIds;
    if (!this.bot.registry) return [];
    const names = [
      'wheat', 'carrots', 'potatoes', 'beetroots',
      'melon_stem', 'pumpkin_stem', 'melon', 'pumpkin',
      'nether_wart', 'farmland',
    ];
    this._cropBlockIds = names
      .map((name) => this.bot.registry.blocksByName[name]?.id)
      .filter((id) => id !== undefined);
    return this._cropBlockIds;
  }

  /**
   * Paksa full scan sekarang (tidak menunggu interval).
   */
  forceFullScan() {
    this._scanEntities();
    this._scanItemDrops();
    this._scanChestPositions();
    this._lastFullScan = Date.now();
  }
}

module.exports = WorldScanner;
