'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const TaskPlanner = require('../core/TaskPlanner');
const { MACRO_STATE } = require('../core/DecisionEngine');
const {
  scoreDistance, scoreDensity, scoreRisk, scoreTimeSince,
  scoreHistorical, computeUtility,
} = require('../utils/UtilityScorer');

/**
 * MobFarm.js — Modul Farm Mob.
 *
 * ASUMSI & BATASAN:
 *   - "Zona farm" direpresentasikan sebagai { center: Vec3, radius: number }
 *     disimpan di BB.world.model.zoneMap.mob. Bukan waypoint tetap.
 *   - Bot tidak menyerang mob milik pemain lain (bersenjata/pet/named).
 *   - Trigger deposit prediktif: sebelum inventory penuh, bukan setelahnya.
 *   - Kegagalan sebagian (target hilang, path terblokir) tidak menghentikan bot —
 *     Recovery System dipanggil dan scoring ulang dilakukan.
 *
 * SELF-REGISTER ke DecisionEngine & TaskPlanner.
 */
class MobFarm {
  constructor(bot, blackboard, decisionEngine, taskPlanner, inventoryManager) {
    this.bot = bot;
    this.bb = blackboard;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.inv = inventoryManager;
    this.log = createModuleLogger(blackboard.botName, 'MobFarm');

    this.GOAL_ID = 'mob_farm';
    this._register();
  }

  /**
   * Register goal ke DecisionEngine dan TaskPlanner.
   */
  _register() {
    // Register scorer ke DecisionEngine
    this.decision.registerGoal(
      this.GOAL_ID,
      (bb, inv) => this._score(bb, inv),
      { macroState: MACRO_STATE.FARMING },
    );

    // Register plan builder ke TaskPlanner
    this.planner.registerGoal(
      this.GOAL_ID,
      (params, bb, bot, inv) => this._buildPlan(params, bb, bot, inv),
    );

    this.log.info('MobFarm registered');
  }

  _getEffectiveZone(bb) {
    const zone = bb.getZone('mob');
    if (zone) return zone;
    if (bb.self.pos) {
      return { center: bb.self.pos.clone(), radius: config.farm.defaultMobZoneRadius || 20 };
    }
    return null;
  }

  /**
   * Utility scorer — dipanggil oleh DecisionEngine.
   */
  _score(bb, inv) {
    if (bb.farm.mobEnabled === false) return 0;
    // Jika zona crop di-set secara eksplisit dan zona mob belum di-set, utamakan crop 100%!
    if (bb.getZone('crop') && !bb.getZone('mob')) return 0;

    const zone = this._getEffectiveZone(bb);
    if (!zone) return 0;

    // Hitung mob di sekitar
    const mobs = bb.world.model.mobs || [];
    const mobsInZone = mobs.filter((m) =>
      zone.center && m.pos.distanceTo(zone.center) <= zone.radius,
    );

    if (mobsInZone.length === 0) return 0;

    const distToZone = bb.self.pos && zone.center
      ? bb.self.pos.distanceTo(zone.center)
      : 999;

    const riskLevel = mobsInZone.reduce((max, m) => Math.max(max, m.riskLevel), 0);
    const lastVisit = Date.now() - (bb.farm.mob.lastKillTime || 0);

    return computeUtility([
      { score: scoreDensity(mobsInZone.length, 10), weight: 0.35 },
      { score: scoreDistance(distToZone, 60), weight: 0.25 },
      { score: scoreRisk(riskLevel), weight: 0.20 },
      { score: scoreTimeSince(lastVisit, 120000), weight: 0.12 },
      { score: scoreHistorical(0, 0), weight: 0.08 },
    ]);
  }

  /**
   * Plan builder — dipanggil oleh TaskPlanner.
   */
  _buildPlan(params, bb, bot, inv) {
    const mobs = bb.world.model.mobs || [];
    const zone = this._getEffectiveZone(bb);
    if (!zone || mobs.length === 0) return [];

    // Filter mob dalam zona, urutkan searah (tidak bolak-balik)
    const mobsInZone = mobs
      .filter((m) => zone.center && m.pos.distanceTo(zone.center) <= zone.radius)
      .sort((a, b) => {
        // Urutkan berdasarkan jarak dari posisi bot saat ini untuk rute searah
        const distA = bb.self.pos ? a.pos.distanceTo(bb.self.pos) : 999;
        const distB = bb.self.pos ? b.pos.distanceTo(bb.self.pos) : 999;
        return distA - distB;
      });

    if (mobsInZone.length === 0) return [];

    const steps = [];

    // Equip weapon terbaik dulu
    const weapon = inv.getBestWeapon();
    if (weapon) {
      steps.push(TaskPlanner.stepEquip(weapon, 'hand'));
    }

    // Serangan terhadap beberapa mob teratas
    const maxTargets = Math.min(5, mobsInZone.length);
    for (let i = 0; i < maxTargets; i++) {
      const mob = mobsInZone[i];
      const entity = Object.values(bot.entities).find((e) => e.id === mob.id);
      if (!entity) continue;

      const dist = bb.self.pos ? mob.pos.distanceTo(bb.self.pos) : 999;
      const reach = config.mobFarm.attackRange || 4.0;

      // HANYA jalan jika mob berada di luar jangkauan serang (tetapi masih di dekat bot)
      if (dist > reach && dist <= 8) {
        steps.push(TaskPlanner.stepMoveTo(mob.pos, { range: reach, timeoutMs: 1500 }));
      }
      steps.push(TaskPlanner.stepLookAt(mob.pos));
      steps.push(TaskPlanner.stepAttack(entity));
    }

    // Jika inventory hampir penuh → tambah step deposit di akhir
    if (inv.shouldDeposit()) {
      steps.push({ type: 'TRIGGER_GOAL', goalId: 'chest_deposit' });
    }

    return steps;
  }

  /**
   * Dipanggil setelah kill berhasil.
   */
  onKill() {
    this.bb.farm.mob.lastKillTime = Date.now();
    this.bb.farm.mob.killCount++;
    this.bb.stats.successByType[this.GOAL_ID] =
      (this.bb.stats.successByType[this.GOAL_ID] || 0) + 1;
  }
}

module.exports = MobFarm;
