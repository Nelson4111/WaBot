'use strict';

/**
 * Utility untuk format waktu dan kalkulasi uptime.
 */

/**
 * Format durasi dalam milidetik menjadi string yang mudah dibaca.
 *
 * @param {number} ms - Durasi dalam milidetik
 * @returns {string} Format "Xh Ym Zs"
 *
 * @example
 * formatDuration(3661000) // "1h 1m 1s"
 * formatDuration(61000)   // "0h 1m 1s"
 */
function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0) return '0h 0m 0s';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Hitung uptime dari timestamp start hingga sekarang.
 *
 * @param {number} startTimestamp - Unix timestamp (ms) saat bot mulai
 * @returns {string} Durasi yang sudah diformat
 */
function getUptime(startTimestamp) {
  if (!startTimestamp) return '0h 0m 0s';
  return formatDuration(Date.now() - startTimestamp);
}

/**
 * Format timestamp Unix menjadi string lokal.
 *
 * @param {number} timestamp - Unix timestamp dalam milidetik
 * @returns {string} Format tanggal/waktu lokal
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Dapatkan timestamp ISO 8601 saat ini.
 *
 * @returns {string} ISO 8601 string
 */
function now() {
  return new Date().toISOString();
}

module.exports = { formatDuration, getUptime, formatTimestamp, now };
