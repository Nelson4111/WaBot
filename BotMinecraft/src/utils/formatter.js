'use strict';

/**
 * Utility untuk memformat output pesan yang dikirim ke in-game chat
 * dan untuk memformat data inventory, koordinat, dsb.
 */

/**
 * Daftar nama mob hostile dalam format Minecraft → nama ramah
 */
const MOB_DISPLAY_NAMES = {
  zombie: 'Zombie',
  skeleton: 'Skeleton',
  creeper: 'Creeper',
  spider: 'Spider',
  cave_spider: 'Cave Spider',
  enderman: 'Enderman',
  witch: 'Witch',
  pillager: 'Pillager',
  vindicator: 'Vindicator',
  phantom: 'Phantom',
  drowned: 'Drowned',
  husk: 'Husk',
  stray: 'Stray',
  blaze: 'Blaze',
  ghast: 'Ghast',
  slime: 'Slime',
  magma_cube: 'Magma Cube',
};

/**
 * Format posisi bot menjadi string yang mudah dibaca.
 *
 * @param {object} position - Objek posisi Mineflayer {x, y, z}
 * @returns {string} Format "X:123 Y:64 Z:-456"
 */
function formatPosition(position) {
  if (!position) return 'Unknown';
  return `X:${Math.floor(position.x)} Y:${Math.floor(position.y)} Z:${Math.floor(position.z)}`;
}

/**
 * Format health dan food menjadi bar visual.
 *
 * @param {number} value - Nilai saat ini
 * @param {number} max - Nilai maksimum
 * @param {number} barLength - Panjang bar (default: 10)
 * @returns {string} Bar visual "████░░░░░░"
 */
function formatBar(value, max, barLength = 10) {
  const filled = Math.round((value / max) * barLength);
  const empty = barLength - filled;
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));
}

/**
 * Format inventory items menjadi list yang bisa dikirim ke chat.
 * Minecraft chat memiliki batas karakter, jadi output dipadatkan.
 *
 * @param {Array} items - Array item Mineflayer
 * @returns {string[]} Array baris chat yang bisa dikirim
 */
function formatInventory(items) {
  if (!items || items.length === 0) {
    return ['Inventory kosong.'];
  }

  const lines = [];
  const itemMap = {};

  // Gabungkan item yang sama
  for (const item of items) {
    if (!item) continue;
    const key = item.name;
    if (itemMap[key]) {
      itemMap[key] += item.count;
    } else {
      itemMap[key] = item.count;
    }
  }

  const entries = Object.entries(itemMap);
  // Kelompokkan per baris (maks 3 item per baris agar tidak terlalu panjang)
  const ITEMS_PER_LINE = 3;
  for (let i = 0; i < entries.length; i += ITEMS_PER_LINE) {
    const chunk = entries.slice(i, i + ITEMS_PER_LINE);
    const line = chunk.map(([name, count]) => `${name}x${count}`).join(', ');
    lines.push(line);
  }

  return lines;
}

/**
 * Format nama item Minecraft menjadi nama yang lebih ramah.
 * Contoh: "diamond_sword" → "Diamond Sword"
 *
 * @param {string} itemName - Nama item dalam format Minecraft
 * @returns {string} Nama item yang diformat
 */
function formatItemName(itemName) {
  if (!itemName) return 'Unknown';
  return itemName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format nama mob untuk tampilan.
 *
 * @param {string} mobName - Nama mob dalam format Minecraft
 * @returns {string} Nama mob yang ramah
 */
function formatMobName(mobName) {
  return MOB_DISPLAY_NAMES[mobName] || formatItemName(mobName);
}

/**
 * Truncate string jika melebihi panjang tertentu.
 *
 * @param {string} str - String yang akan di-truncate
 * @param {number} maxLength - Panjang maksimum
 * @returns {string} String yang sudah di-truncate
 */
function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}

module.exports = {
  formatPosition,
  formatBar,
  formatInventory,
  formatItemName,
  formatMobName,
  truncate,
};
