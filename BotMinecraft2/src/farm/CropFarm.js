'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const TaskPlanner = require('../core/TaskPlanner');
const { MACRO_STATE } = require('../core/DecisionEngine');
const { EnvironmentAnalyzer, CROP_STATUS } = require('../core/EnvironmentAnalyzer');
const {
  scoreDistance, scoreDensity, scoreTimeSince, scoreHistorical, computeUtility,
} = require('../utils/UtilityScorer');

/**
 * CropFarm.js — Modul Farm Tanaman.
 *
 * ASUMSI & BATASAN:
 *   - "Zona crop" = { center: Vec3, radius: number } di BB.world.model.zoneMap.crop
 *   - Crop dikelompokkan jadi cluster (nearest-neighbor, radius konfigurabel)
 *   - Jika bibit kurang: tandai pendingReplants di BB, lanjut ke petak lain
 *   - Mendukung: wheat, carrots, potatoes, beetroots, melon, pumpkin, nether_wart
 */
class CropFarm {
  constructor(bot, blackboard, decisionEngine, taskPlanner, inventoryManager, worldScanner, envAnalyzer) {
    this.bot = bot;
    this.bb = blackboard;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.inv = inventoryManager;
    this.scanner = worldScanner;
    this.analyzer = envAnalyzer;
    this.log = createModuleLogger(blackboard.botName, 'CropFarm');

    this.GOAL_ID = 'crop_farm';
    this._register();
  }

  _register() {
    this.decision.registerGoal(
      this.GOAL_ID,
      (bb, inv) => this._score(bb, inv),
      { macroState: MACRO_STATE.FARMING },
    );
    this.planner.registerGoal(
      this.GOAL_ID,
      (params, bb, bot, inv) => this._buildPlan(params, bb, bot, inv),
    );
    this.log.info('CropFarm registered');
  }

  _getEffectiveZone(bb) {
    const zone = bb.getZone('crop');
    if (zone) return zone;
    if (bb.self.pos) {
      return { center: bb.self.pos.clone(), radius: config.farm.defaultCropZoneRadius || 30 };
    }
    return null;
  }

  _score(bb, inv) {
    if (bb.farm.cropEnabled === false) return 0;
    const zone = this._getEffectiveZone(bb);
    if (!zone) return 0;

    const rawCrops = this.scanner.scanCrops(zone.radius);
    const matureCrops = rawCrops.filter((rc) => this.analyzer.classifyCropStatus(rc) === CROP_STATUS.MATURE);

    const explicitZone = bb.getZone('crop');

    // Jika tidak ada crop matang tetapi zona kebun di-set eksplisit, tetap beri skor 0.30 agar bot tidak idle/stuck
    if (matureCrops.length === 0) {
      return explicitZone ? 0.30 : 0;
    }

    if (explicitZone) return 0.95;

    const distToZone = bb.self.pos && zone.center
      ? bb.self.pos.distanceTo(zone.center)
      : 999;
    const lastHarvest = Date.now() - (bb.farm.crop.lastHarvestTime || 0);

    return computeUtility([
      { score: scoreDensity(matureCrops.length, 10), weight: 0.50 },
      { score: scoreDistance(distToZone, 80), weight: 0.25 },
      { score: scoreTimeSince(lastHarvest, 120000), weight: 0.25 },
    ]);
  }

  _buildPlan(params, bb, bot, inv) {
    const zone = this._getEffectiveZone(bb);
    if (!zone) return [];

    const botPos = bb.self.pos;

    // 1. Scan semua crop matang dalam radius zona
    const rawCrops = this.scanner.scanCrops(zone.radius || 30);
    const classifiedCrops = rawCrops.map((rc) => ({
      ...rc,
      status: this.analyzer.classifyCropStatus(rc),
      cropType: rc.block.name,
    }));

    const matureCrops = classifiedCrops.filter((c) => c.status === CROP_STATUS.MATURE);
    const steps = [];

    // 2. Jika inventaris terisi (>= 40% terpakai atau <= 8 free slots), LANGSUNG DEPOSIT KE CHEST TERDEKAT!
    if (inv.shouldDeposit() || inv.getUsedPercent() >= 0.40) {
      const chestPos = this._getChestPos(bb);
      if (chestPos) {
        this.bb.setZone('chest', chestPos.clone(), 5);
        steps.push(TaskPlanner.stepMoveTo(chestPos, { range: 2.2, timeoutMs: 3000 }));
        steps.push({ type: 'TRIGGER_GOAL', goalId: 'chest_deposit' });
        return steps;
      }
    }

    // 3. Jika belum ada tanaman matang saat ini:
    // Menoleh scan 360 derajat, berjalan mendekati pusat zona kebun jika jauh, lalu tunggu 1.5 detik
    if (matureCrops.length === 0) {
      if (zone.center && botPos && botPos.distanceTo(zone.center) > 4) {
        steps.push(TaskPlanner.stepMoveTo(zone.center, { range: 2.5, timeoutMs: 2500 }));
      } else if (botPos) {
        const scanAngle = (Math.random() - 0.5) * Math.PI * 2;
        steps.push(TaskPlanner.stepLookAt(botPos.offset(Math.cos(scanAngle) * 5, 0, Math.sin(scanAngle) * 5)));
      }
      steps.push(TaskPlanner.stepWait(1500));
      return steps;
    }

    // 4. Urutkan mature crops berdasarkan jarak dari posisi bot saat ini
    matureCrops.sort((a, b) => {
      const da = botPos ? a.pos.distanceTo(botPos) : 999;
      const db = botPos ? b.pos.distanceTo(botPos) : 999;
      return da - db;
    });

    const targetCrops = matureCrops.slice(0, 30);
    const firstCrop = targetCrops[0];

    // 5. Otomatis berjalan cepat mendekati tanaman matang terdekat jika jarak > 2.5 blok
    if (botPos && firstCrop && firstCrop.pos.distanceTo(botPos) > 2.5) {
      steps.push(TaskPlanner.stepMoveTo(firstCrop.pos, { range: 2.0, timeoutMs: 2500 }));
    }

    // 6. Eksekusi panen & replant batch ultra-cepat
    steps.push({
      type: 'FAST_CROP_HARVEST',
      crops: targetCrops,
    });

    // 7. Kumpulkan item drop hasil panen di sekeliling bot
    const itemDrops = bb.world.rawScan.itemDrops || [];
    const nearbyDrops = itemDrops.filter((d) => botPos && d.pos && d.pos.distanceTo(botPos) <= 15);
    if (nearbyDrops.length > 0) {
      for (const drop of nearbyDrops.slice(0, 3)) {
        steps.push(TaskPlanner.stepMoveTo(drop.pos, { range: 0.8, timeoutMs: 1500 }));
      }
    }

    bb.farm.crop.lastHarvestTime = Date.now();
    return steps;
  }

  /**
   * Ambil posisi chest penyimpan terdekat.
   */
  _getChestPos(bb) {
    const zone = bb.getZone('chest');
    if (zone && zone.center) return zone.center;

    const chests = bb.world.rawScan.chestPositions || [];
    if (chests.length > 0 && bb.self.pos) {
      const sorted = [...chests].sort((a, b) => a.pos.distanceTo(bb.self.pos) - b.pos.distanceTo(bb.self.pos));
      return sorted[0].pos;
    }

    return null;
  }

  /**
   * Kelompokkan crop matang menjadi cluster spasial.
   * Algoritma: greedy nearest-neighbor dengan radius cluster.
   */
  _clusterCrops(crops) {
    const clusterRadius = config.cropFarm.clusterRadius;
    const remaining = [...crops];
    const clusters = [];

    while (remaining.length > 0) {
      const seed = remaining.shift();
      const cluster = {
        center: seed.pos.clone(),
        crops: [seed],
      };

      // Cari crop lain dalam radius cluster
      for (let i = remaining.length - 1; i >= 0; i--) {
        if (remaining[i].pos.distanceTo(seed.pos) <= clusterRadius) {
          cluster.crops.push(remaining.splice(i, 1)[0]);
        }
      }

      // Hitung center cluster
      if (cluster.crops.length > 1) {
        const avg = cluster.crops.reduce(
          (acc, c) => ({ x: acc.x + c.pos.x, y: acc.y + c.pos.y, z: acc.z + c.pos.z }),
          { x: 0, y: 0, z: 0 },
        );
        cluster.center = {
          x: avg.x / cluster.crops.length,
          y: avg.y / cluster.crops.length,
          z: avg.z / cluster.crops.length,
          distanceTo: (other) => Math.sqrt(
            Math.pow(cluster.center.x - other.x, 2) +
            Math.pow(cluster.center.z - other.z, 2),
          ),
        };
      }

      clusters.push(cluster);
    }

    return clusters;
  }
}

module.exports = CropFarm;
