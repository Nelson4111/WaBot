'use strict';

/**
 * Utility untuk exponential backoff retry.
 * Digunakan oleh Connector.js untuk logika reconnect.
 */

/**
 * Hitung delay berikutnya menggunakan exponential backoff dengan jitter.
 * Formula: min(initialDelay * multiplier^attempt, maxDelay) + random jitter
 *
 * @param {number} attempt - Nomor percobaan (dimulai dari 0)
 * @param {object} options - Opsi konfigurasi
 * @param {number} options.initialDelayMs - Delay awal dalam milidetik
 * @param {number} options.maxDelayMs - Delay maksimum dalam milidetik
 * @param {number} options.multiplier - Faktor pengali (default: 2)
 * @param {number} options.jitterMs - Maksimum random jitter (default: 1000ms)
 * @returns {number} Delay dalam milidetik
 *
 * @example
 * // attempt=0: ~5000ms, attempt=1: ~10000ms, attempt=2: ~20000ms, dst.
 * const delay = calculateBackoff(attempt, { initialDelayMs: 5000, maxDelayMs: 300000, multiplier: 2 });
 */
function calculateBackoff(attempt, options = {}) {
  const { initialDelayMs = 5000, maxDelayMs = 300000, multiplier = 2, jitterMs = 1000 } = options;

  const exponentialDelay = initialDelayMs * Math.pow(multiplier, attempt);
  const clampedDelay = Math.min(exponentialDelay, maxDelayMs);
  const jitter = Math.random() * jitterMs;

  return Math.floor(clampedDelay + jitter);
}

/**
 * Bungkus fungsi async dengan logika retry menggunakan exponential backoff.
 *
 * @param {Function} fn - Fungsi async yang akan di-retry
 * @param {object} options - Opsi
 * @param {number} options.maxAttempts - Maksimum percobaan (default: Infinity)
 * @param {object} options.backoff - Opsi backoff (lihat calculateBackoff)
 * @param {Function} options.onRetry - Callback dipanggil sebelum tiap retry
 * @returns {Promise<any>} Hasil dari fn
 */
async function retryWithBackoff(fn, options = {}) {
  const { maxAttempts = Infinity, backoff = {}, onRetry = null } = options;

  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      attempt++;

      if (attempt >= maxAttempts) {
        throw err;
      }

      const delay = calculateBackoff(attempt - 1, backoff);

      if (typeof onRetry === 'function') {
        onRetry({ attempt, delay, error: err });
      }

      await sleep(delay);
    }
  }
}

/**
 * Tunggu sejumlah milidetik.
 *
 * @param {number} ms - Durasi tunggu dalam milidetik
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { calculateBackoff, retryWithBackoff, sleep };
