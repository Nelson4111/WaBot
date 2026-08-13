'use strict';
const { addUtilityNoise } = require('./Humanizer');

/**
 * UtilityScorer.js — Helper untuk Utility AI scoring di DecisionEngine.
 *
 * Setiap goal kandidat mendapat score final dari kombinasi faktor terbobot.
 * Noise kecil ditambahkan via Humanizer agar tidak selalu deterministik.
 */

/**
 * Hitung skor jarak terbalik: semakin dekat semakin tinggi.
 * @param {number} distance - Jarak dalam blok
 * @param {number} maxRange - Jarak referensi maksimum
 * @returns {number} 0-1
 */
function scoreDistance(distance, maxRange = 50) {
  if (distance <= 0) return 1;
  return Math.max(0, 1 - distance / maxRange);
}

/**
 * Hitung skor kepadatan resource: lebih banyak target → skor lebih tinggi.
 * @param {number} count - Jumlah target dalam zona
 * @param {number} maxCount - Referensi "sangat banyak"
 * @returns {number} 0-1
 */
function scoreDensity(count, maxCount = 20) {
  return Math.min(1, count / maxCount);
}

/**
 * Hitung skor risiko terbalik: risiko tinggi → skor rendah.
 * @param {number} riskLevel - 0 (aman) s.d. 1 (berbahaya)
 * @returns {number} 0-1
 */
function scoreRisk(riskLevel) {
  return Math.max(0, 1 - riskLevel);
}

/**
 * Hitung skor waktu-sejak-terakhir: lebih lama tidak dikunjungi → skor lebih tinggi.
 * @param {number} msAgo - Millisecond sejak terakhir dikunjungi (0 = baru saja)
 * @param {number} halfLifeMs - Waktu di mana skor mencapai 0.5
 * @returns {number} 0-1
 */
function scoreTimeSince(msAgo, halfLifeMs = 120000) {
  return 1 - Math.exp((-msAgo * Math.LN2) / halfLifeMs);
}

/**
 * Hitung skor historis keberhasilan.
 * @param {number} successCount
 * @param {number} totalCount
 * @returns {number} 0-1
 */
function scoreHistorical(successCount, totalCount) {
  if (totalCount === 0) return 0.5; // prior netral
  return successCount / totalCount;
}

/**
 * Hitung skor nilai item (untuk AutoSell).
 * @param {number} value - Nilai per item
 * @param {number} count - Jumlah item
 * @param {number} maxValue - Nilai referensi tertinggi
 * @returns {number} 0-1
 */
function scoreItemValue(value, count, maxValue = 1000) {
  return Math.min(1, (value * count) / maxValue);
}

/**
 * Gabungkan beberapa faktor skor dengan bobot masing-masing.
 * @param {Array<{score: number, weight: number}>} factors
 * @returns {number} Weighted average 0-1
 */
function combineScores(factors) {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  return weighted / totalWeight;
}

/**
 * Hitung utilty score final dengan noise humanization.
 * @param {Array<{score: number, weight: number}>} factors
 * @returns {number}
 */
function computeUtility(factors) {
  const base = combineScores(factors);
  return addUtilityNoise(base);
}

/**
 * Bandingkan dua skor — apakah mereka "berdekatan" (selisih kecil).
 * Dipakai untuk probabilistic selection vs deterministic.
 * @param {number} a
 * @param {number} b
 * @param {number} threshold - Default 0.1
 * @returns {boolean}
 */
function scoresClose(a, b, threshold = 0.1) {
  return Math.abs(a - b) <= threshold;
}

module.exports = {
  scoreDistance,
  scoreDensity,
  scoreRisk,
  scoreTimeSince,
  scoreHistorical,
  scoreItemValue,
  combineScores,
  computeUtility,
  scoresClose,
};
