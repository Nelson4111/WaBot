'use strict';
const config = require('../../config');

/**
 * Humanizer — membungkus semua output Action Executor & Movement Planner.
 * Semua nilai waktu dan variasi diambil dari config.humanization, BUKAN hardcode.
 */

/**
 * Kembalikan angka acak dalam rentang [min, max].
 */
function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Delay acak dari distribusi normal-ish (bukan uniform) untuk terasa natural.
 * Gunakan ini sebagai jeda antar-aksi.
 */
function actionDelay() {
  const h = config.humanization;
  // Box-Muller transform untuk distribusi lebih natural
  const u1 = Math.random();
  const u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const mid = (h.actionDelayMinMs + h.actionDelayMaxMs) / 2;
  const sigma = (h.actionDelayMaxMs - h.actionDelayMinMs) / 4;
  const raw = mid + normal * sigma;
  return Math.max(h.actionDelayMinMs, Math.min(h.actionDelayMaxMs, raw));
}

/**
 * Tunggu N millisecond (Promise-based).
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Tunggu dengan delay humanized sebelum aksi berikutnya.
 */
async function waitHumanized() {
  await sleep(actionDelay());
}

/**
 * Interpolasi rotasi kamera menuju target yaw/pitch secara bertahap.
 * Menggunakan lerp + sedikit overshoot lalu koreksi.
 * @param {object} bot - Mineflayer bot instance
 * @param {number} targetYaw - Target yaw (radians)
 * @param {number} targetPitch - Target pitch (radians)
 * @param {function} [onStep] - Callback setiap langkah (opsional)
 */
async function lookHumanized(bot, targetYaw, targetPitch, onStep) {
  const h = config.humanization;
  const steps = Math.floor(randBetween(6, 14));
  let currentYaw = bot.entity.yaw;
  let currentPitch = bot.entity.pitch;

  // Normalisasi delta yaw ke rentang [-PI, PI]
  let dyaw = targetYaw - currentYaw;
  while (dyaw > Math.PI) dyaw -= 2 * Math.PI;
  while (dyaw < -Math.PI) dyaw += 2 * Math.PI;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // Ease-in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Overshoot kecil di tengah, koreksi di akhir
    const overshoot = i < steps ? h.rotationOvershoot * Math.sin(Math.PI * t) : 0;

    const yaw = currentYaw + dyaw * ease + overshoot * (Math.random() - 0.5);
    const pitch = currentPitch + (targetPitch - currentPitch) * ease;

    try {
      bot.look(yaw, pitch, true);
    } catch (_) { /* ignore */ }

    if (onStep) onStep(i, steps);
    await sleep(randBetween(25, 60));
  }

  // Final snap ke target tepat
  try {
    bot.look(targetYaw, targetPitch, true);
  } catch (_) { /* ignore */ }
}

/**
 * Hadapkan bot ke sebuah entity atau blok secara humanized.
 * @param {object} bot
 * @param {Vec3} targetPos - Posisi target
 */
async function facePositionHumanized(bot, targetPos) {
  const dx = targetPos.x - bot.entity.position.x;
  const dy = targetPos.y - bot.entity.position.y + 0.5; // eye height offset
  const dz = targetPos.z - bot.entity.position.z;
  const yaw = Math.atan2(-dx, -dz);
  const groundDist = Math.sqrt(dx * dx + dz * dz);
  const pitch = Math.atan2(-dy, groundDist);
  await lookHumanized(bot, yaw, pitch);
}

/**
 * Tambahkan variasi noise pada nilai utility score.
 * @param {number} score - Score asli
 * @returns {number} - Score dengan noise kecil
 */
function addUtilityNoise(score) {
  const noisePct = config.humanization.utilityScoreNoisePct / 100;
  const noise = (Math.random() * 2 - 1) * noisePct * score;
  return Math.max(0, score + noise);
}

/**
 * Tambahkan variasi pada cost pathfinding.
 * @param {number} baseCost
 * @returns {number}
 */
function pathCostVariation(baseCost) {
  const variancePct = config.humanization.pathCostVariancePct / 100;
  const variance = (Math.random() * 2 - 1) * variancePct * baseCost;
  return Math.max(0.1, baseCost + variance);
}

/**
 * Cek apakah tick ini adalah momen idle (probabilistik).
 * Dipanggil tiap 100 tick.
 * @returns {boolean}
 */
function shouldInsertIdle() {
  return Math.random() * 100 < config.humanization.idleChancePer100Ticks;
}

/**
 * Pilih dari array options secara probabilistik berbobot (softmax-like).
 * Dipakai saat utility scores berdekatan agar tidak selalu deterministik.
 * @param {Array<{id: string, score: number}>} candidates
 * @returns {object} - candidate terpilih
 */
function probabilisticSelect(candidates) {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Softmax temperature-scaled
  const temp = 0.3;
  const maxScore = Math.max(...candidates.map((c) => c.score));
  const weights = candidates.map((c) => Math.exp((c.score - maxScore) / temp));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    random -= weights[i];
    if (random <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Durasi task dengan variasi kecil agar tidak selalu identik.
 * @param {number} baseDurationMs
 * @returns {number}
 */
function taskDurationWithVariance(baseDurationMs) {
  const variancePct = config.humanization.taskDurationVariancePct / 100;
  const variance = (Math.random() * 2 - 1) * variancePct * baseDurationMs;
  return Math.max(100, baseDurationMs + variance);
}

module.exports = {
  sleep,
  actionDelay,
  waitHumanized,
  lookHumanized,
  facePositionHumanized,
  addUtilityNoise,
  pathCostVariation,
  shouldInsertIdle,
  probabilisticSelect,
  taskDurationWithVariance,
  randBetween,
};
