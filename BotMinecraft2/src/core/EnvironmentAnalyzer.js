'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');

/**
 * EnvironmentAnalyzer.js — Layer 2: Mengubah data mentah menjadi model dunia bermakna.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.world.rawScan
 *   Tulis: BB.world.model (mobs, crops, players, dangerZones)
 */

// Klasifikasi crop berdasarkan block properties
const CROP_STATUS = Object.freeze({
  MATURE: 'MATURE',
  GROWING: 'GROWING',
  EMPTY: 'EMPTY',
});

// Kategori chest
const CHEST_CATEGORY = Object.freeze({
  STORAGE: 'STORAGE',
  SELL_POINT: 'SELL_POINT',
  UNKNOWN: 'UNKNOWN',
});

// Klasifikasi zona
const ZONE_RISK = Object.freeze({
  SAFE: 'SAFE',
  RISKY: 'RISKY',
  DANGER: 'DANGER',
});

class EnvironmentAnalyzer {
  constructor(bot, blackboard) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'EnvAnalyzer');

    // Set mob yang valid sebagai target (dari config)
    this._targetMobSet = new Set(config.mobFarm.targetMobs);
    this._excludedMobSet = new Set(config.mobFarm.excludedMobs);
    // Set blok berbahaya
    this._dangerBlockSet = new Set(config.safety.dangerBlocks);

    // Ambil max age tiap crop dari config
    this._cropMaxAge = {};
    for (const [cropName, cropDef] of Object.entries(config.cropFarm.crops)) {
      if (cropDef.matureAge !== null) {
        this._cropMaxAge[cropName] = cropDef.matureAge;
      }
    }
  }

  /**
   * Dipanggil tiap tick oleh TickScheduler setelah WorldScanner.
   */
  tick() {
    try {
      this._analyzeMobs();
      this._analyzePlayers();
      this._analyzeChestDB();
      this._analyzeDangerZones();
      this.bb.world.model.lastModelTime = Date.now();
    } catch (err) {
      this.log.warn('Analyzer tick error', { error: err.message });
    }
  }

  /**
   * Klasifikasi entity menjadi mob valid / tidak valid.
   */
  _analyzeMobs() {
    const rawEntities = this.bb.world.rawScan.entities;
    const mobs = [];

    for (const e of rawEntities) {
      // Skip player
      if (e.type === 'player') continue;
      // Skip jika tidak ada nama entity type
      if (!e.name) continue;

      const name = e.name.toLowerCase();

      // Skip jika excluded
      if (this._excludedMobSet.has(name)) continue;
      // Skip jika bukan mob valid
      if (!this._targetMobSet.has(name)) continue;
      // Skip mob bernama custom (pet/named) jika dikonfigurasi
      if (config.mobFarm.skipNamedMobs && this._hasCustomName(e)) continue;

      const riskLevel = this._assessMobRisk(e);

      mobs.push({
        id: e.id,
        name,
        pos: e.pos,
        riskLevel,
        distance: this.bb.self.pos ? e.pos.distanceTo(this.bb.self.pos) : Infinity,
        classification: 'VALID_TARGET',
      });
    }

    this.bb.world.model.mobs = mobs;
  }

  /**
   * Cek apakah entity punya custom name (tanda pet/named mob).
   */
  _hasCustomName(entity) {
    // Metadata[2] biasanya custom name di Minecraft protocol
    // Metadata[3] adalah "isCustomNameVisible"
    if (entity.metadata) {
      const customName = entity.metadata[2];
      if (customName && typeof customName === 'string' && customName.length > 0) {
        return true;
      }
      // Format object (JSON component)
      if (customName && typeof customName === 'object') {
        return true;
      }
    }
    return false;
  }

  /**
   * Nilai risiko mob: ada di tepi (potensi fall damage), dll.
   */
  _assessMobRisk(entity) {
    let risk = 0;
    // Creeper = risiko tinggi
    if (entity.name === 'creeper') risk += 0.5;
    // Ghast = risiko jarak jauh
    if (entity.name === 'ghast') risk += 0.4;
    // Player lain di sekitar (dihitung terpisah di _analyzePlayers)
    return Math.min(1, risk);
  }

  /**
   * Klasifikasi player (bukan bot sendiri).
   */
  _analyzePlayers() {
    const rawEntities = this.bb.world.rawScan.entities;
    const players = [];

    for (const e of rawEntities) {
      if (e.type !== 'player') continue;
      if (e.name === this.bb.botName) continue; // skip diri sendiri

      const distance = this.bb.self.pos ? e.pos.distanceTo(this.bb.self.pos) : Infinity;
      // Heuristic: player bersenjata + sangat dekat = potensi hostile
      const isHostile = distance < config.safety.hostilePlayerRadius && this._hasWeapon(e);

      players.push({
        id: e.id,
        name: e.name,
        pos: e.pos,
        distance,
        isHostile,
        equipment: e.equipment,
      });
    }

    this.bb.world.model.players = players;
  }

  /**
   * Cek apakah player memegang weapon (heuristic).
   */
  _hasWeapon(entity) {
    const mainHand = entity.equipment?.[0];
    if (!mainHand) return false;
    const name = mainHand.name || '';
    return name.includes('sword') || name.includes('axe') || name.includes('bow');
  }

  /**
   * Perbarui chest DB dari scan terbaru.
   * Chest yang sudah ada di DB tidak di-override, hanya ditambah yang baru.
   */
  _analyzeChestDB() {
    const newChests = this.bb.world.rawScan.chestPositions;
    for (const chest of newChests) {
      const key = `${Math.floor(chest.pos.x)},${Math.floor(chest.pos.y)},${Math.floor(chest.pos.z)}`;
      if (!this.bb.world.model.chestDB[key]) {
        this.bb.updateChestDB(key, {
          pos: chest.pos,
          category: CHEST_CATEGORY.UNKNOWN,
          capacity: 27,
          reliability: 0.8,
          lastVisited: 0,
          successCount: 0,
          failCount: 0,
        });
      }
    }
  }

  /**
   * Identifikasi zona berbahaya di sekitar bot.
   */
  _analyzeDangerZones() {
    if (!this.bot.entity) return;

    try {
      const dangerPos = this.bot.findBlocks({
        matching: (b) => b && this._dangerBlockSet.has(b.name),
        maxDistance: 5,
        count: 10,
      });
      this.bb.world.model.dangerZones = dangerPos.map((pos) => pos.clone());
    } catch (_) {
      this.bb.world.model.dangerZones = [];
    }
  }

  /**
   * Klasifikasi status crop dari block data.
   * @param {object} blockData - { pos, block }
   * @returns {'MATURE'|'GROWING'|'EMPTY'}
   */
  classifyCropStatus(blockData) {
    const block = blockData.block;
    if (!block) return CROP_STATUS.EMPTY;

    const name = block.name;
    const maxAge = this._cropMaxAge[name];

    if (maxAge !== undefined) {
      const props = block._properties || (block.getProperties ? block.getProperties() : {});
      const age = props.age ?? block.metadata;
      if (age === undefined || age === null) return CROP_STATUS.MATURE; // Fallback jika age tidak terbaca
      return parseInt(age) >= maxAge ? CROP_STATUS.MATURE : CROP_STATUS.GROWING;
    }

    if (name === 'melon' || name === 'pumpkin') return CROP_STATUS.MATURE;
    if (name === 'farmland') return CROP_STATUS.EMPTY;

    return CROP_STATUS.MATURE;
  }

  /**
   * Hitung zone risk di posisi tertentu.
   * @param {Vec3} pos
   * @returns {'SAFE'|'RISKY'|'DANGER'}
   */
  getZoneRisk(pos) {
    if (!pos) return ZONE_RISK.SAFE;
    const dangerNearby = this.bb.world.model.dangerZones.some(
      (dz) => dz.distanceTo(pos) < 4,
    );
    if (dangerNearby) return ZONE_RISK.DANGER;
    const hostilesNearby = this.bb.world.model.players.some(
      (p) => p.isHostile && p.pos.distanceTo(pos) < config.safety.hostilePlayerRadius,
    );
    if (hostilesNearby) return ZONE_RISK.RISKY;
    return ZONE_RISK.SAFE;
  }
}

module.exports = { EnvironmentAnalyzer, CROP_STATUS, CHEST_CATEGORY, ZONE_RISK };
