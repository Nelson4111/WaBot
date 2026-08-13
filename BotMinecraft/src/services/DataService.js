'use strict';

const path = require('path');
const fse = require('fs-extra');
const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('DataService');

// ── Konstanta ────────────────────────────────────────────────────────────────
const DATA_DIR = path.resolve(process.cwd(), 'data');

/** Nilai default untuk setiap file data */
const DEFAULT_DATA = {
  'whitelist.json': { players: [] },
  'waypoints.json': { waypoints: {} },
  'inventory.json': { lastUpdated: null, items: [] },
  'stats.json': {
    startedAt: null,
    totalDeaths: 0,
    totalLogins: 0,
    totalReconnects: 0,
    lastPosition: null,
    lastSeen: null,
    farmCycles: 0,
    totalItemsLooted: 0,
  },
  'bot_roles.json': {
    roles: {
      'Bot-Nenel12': { role: 'primary', autoFarm: 'farm2', autoGuard: true, description: 'Bot Utama (AI Chat & Mob Farm2)' },
      'Bot-Nenel11': { role: 'worker', autoFarm: 'farm1', autoGuard: true, description: 'Bot Worker (Crop Farm1 Tanaman)' },
      'Bot-Nenel13': { role: 'worker', autoFarm: 'farm3', autoGuard: false, description: 'Bot Worker (Stone Farm3 AFK Miner)' }
    }
  },
  'chests.json': { chests: [] }
};

// ── Inisialisasi Direktori dan File Default ──────────────────────────────────

/**
 * Pastikan direktori data/ dan semua file JSON default sudah ada.
 * Dipanggil satu kali saat aplikasi pertama kali start.
 */
async function initDataDir() {
  await fse.ensureDir(DATA_DIR);

  for (const [filename, defaultValue] of Object.entries(DEFAULT_DATA)) {
    const filePath = path.join(DATA_DIR, filename);
    const exists = await fse.pathExists(filePath);

    if (!exists) {
      await fse.writeJson(filePath, defaultValue, { spaces: 2 });
      log.info(`File data dibuat: ${filename}`);
    }
  }
}

// ── CRUD Operations ──────────────────────────────────────────────────────────

/**
 * Baca file JSON dari direktori data/.
 * Jika file corrupt, akan di-reset ke nilai default.
 *
 * @param {string} filename - Nama file (misal: 'whitelist.json')
 * @returns {Promise<object>} Data yang dibaca
 */
async function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const exists = await fse.pathExists(filePath);
    if (!exists) {
      const defaultValue = DEFAULT_DATA[filename] || {};
      await writeData(filename, defaultValue);
      return defaultValue;
    }

    const stat = await fse.stat(filePath);
    if (stat.size === 0) {
      const defaultValue = DEFAULT_DATA[filename] || {};
      await writeData(filename, defaultValue);
      return defaultValue;
    }

    try {
      const data = await fse.readJson(filePath);
      return data;
    } catch (_e) {
      await new Promise((res) => setTimeout(res, 120));
      const data = await fse.readJson(filePath);
      return data;
    }
  } catch (err) {
    log.warn(`File ${filename} corrupt atau tidak valid: ${err.message}`);
    log.warn(`Mereset ${filename} ke nilai default...`);

    const defaultValue = DEFAULT_DATA[filename] || {};
    await writeData(filename, defaultValue);
    return defaultValue;
  }
}

// ── Lock & Queue untuk mencegah race condition / file lock di Windows ────────
const fileLocks = new Map();

/**
 * Jalankan operasi file secara sekuensial berdasarkan nama file.
 * @param {string} filename 
 * @param {Function} fn 
 */
function withLock(filename, fn) {
  if (!fileLocks.has(filename)) {
    fileLocks.set(filename, Promise.resolve());
  }
  const previous = fileLocks.get(filename);
  const next = previous.then(() => fn()).catch((err) => {
    log.error(`Operation failed for ${filename}: ${err.message}`);
  });
  fileLocks.set(filename, next);
  return next;
}

/**
 * Tulis data ke file JSON menggunakan atomic write aman dengan retry (Windows-safe).
 *
 * @param {string} filename - Nama file (misal: 'whitelist.json')
 * @param {object} data - Data yang akan ditulis
 * @returns {Promise<void>}
 */
async function writeData(filename, data) {
  return withLock(filename, async () => {
    await fse.ensureDir(DATA_DIR);
    const filePath = path.join(DATA_DIR, filename);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        await fse.outputJson(filePath, data, { spaces: 2 });
        return; // Success
      } catch (err) {
        if (attempts >= maxAttempts) {
          log.error(`Gagal menyimpan ${filename} setelah ${maxAttempts} percobaan: ${err.message}`);
          throw err;
        }
        await new Promise((res) => setTimeout(res, 100 * attempts));
      }
    }
  });
}

/**
 * Update sebagian data dalam file JSON (partial update / merge).
 *
 * @param {string} filename - Nama file
 * @param {object} updates - Object yang akan di-merge
 * @returns {Promise<object>} Data setelah update
 */
async function updateData(filename, updates) {
  return withLock(filename, async () => {
    const current = await readData(filename);
    const updated = { ...current, ...updates };
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = `${filePath}.tmp`;
    
    try {
      await fse.writeJson(tempPath, updated, { spaces: 2 });
      await fse.move(tempPath, filePath, { overwrite: true });
    } catch (err) {
      await fse.remove(tempPath).catch(() => {});
    }
    return updated;
  });
}

// ── Whitelist Operations ─────────────────────────────────────────────────────

/**
 * Dapatkan daftar player yang ada di whitelist.
 *
 * @returns {Promise<string[]>} Array username
 */
async function getWhitelist() {
  const data = await readData('whitelist.json');
  return data.players || [];
}

/**
 * Tambahkan player ke whitelist.
 *
 * @param {string} username - Username Minecraft (case-insensitive check)
 * @returns {Promise<boolean>} true jika berhasil ditambah, false jika sudah ada
 */
async function addToWhitelist(username) {
  const data = await readData('whitelist.json');
  const lowerUsername = username.toLowerCase();
  const existing = data.players.map((p) => p.toLowerCase());

  if (existing.includes(lowerUsername)) {
    return false;
  }

  data.players.push(username);
  await writeData('whitelist.json', data);
  return true;
}

/**
 * Hapus player dari whitelist.
 *
 * @param {string} username - Username Minecraft
 * @returns {Promise<boolean>} true jika berhasil dihapus, false jika tidak ada
 */
async function removeFromWhitelist(username) {
  const data = await readData('whitelist.json');
  const lowerUsername = username.toLowerCase();
  const initialLength = data.players.length;

  data.players = data.players.filter((p) => p.toLowerCase() !== lowerUsername);

  if (data.players.length === initialLength) {
    return false;
  }

  await writeData('whitelist.json', data);
  return true;
}

/**
 * Cek apakah player ada di whitelist.
 *
 * @param {string} username - Username Minecraft
 * @returns {Promise<boolean>}
 */
async function isWhitelisted(username) {
  const players = await getWhitelist();
  return players.some((p) => p.toLowerCase() === username.toLowerCase());
}

// ── Waypoint Operations ──────────────────────────────────────────────────────

/**
 * Dapatkan semua waypoint yang tersimpan.
 *
 * @returns {Promise<object>} Map nama → {x, y, z}
 */
async function getWaypoints() {
  const data = await readData('waypoints.json');
  return data.waypoints || {};
}

/**
 * Simpan waypoint baru.
 *
 * @param {string} name - Nama waypoint
 * @param {object} position - Posisi {x, y, z}
 * @returns {Promise<void>}
 */
async function saveWaypoint(name, position) {
  const data = await readData('waypoints.json');
  data.waypoints[name.toLowerCase()] = {
    x: Math.floor(position.x),
    y: Math.floor(position.y),
    z: Math.floor(position.z),
    savedAt: new Date().toISOString(),
  };
  await writeData('waypoints.json', data);
}

/**
 * Dapatkan satu waypoint berdasarkan nama.
 *
 * @param {string} name - Nama waypoint
 * @returns {Promise<object|null>} Posisi {x, y, z} atau null jika tidak ada
 */
async function getWaypoint(name) {
  const waypoints = await getWaypoints();
  return waypoints[name.toLowerCase()] || null;
}

/**
 * Hapus waypoint.
 *
 * @param {string} name - Nama waypoint
 * @returns {Promise<boolean>} true jika berhasil dihapus
 */
async function deleteWaypoint(name) {
  const data = await readData('waypoints.json');
  const key = name.toLowerCase();

  if (!data.waypoints[key]) return false;

  delete data.waypoints[key];
  await writeData('waypoints.json', data);
  return true;
}

// ── Stats Operations ─────────────────────────────────────────────────────────

/**
 * Dapatkan statistik bot.
 *
 * @returns {Promise<object>}
 */
async function getStats() {
  return readData('stats.json');
}

/**
 * Update statistik bot.
 *
 * @param {object} updates - Field yang akan diupdate
 * @returns {Promise<object>}
 */
async function updateStats(updates) {
  return updateData('stats.json', updates);
}

/**
 * Increment counter statistik.
 *
 * @param {string} field - Nama field counter
 * @returns {Promise<void>}
 */
async function incrementStat(field) {
  const stats = await getStats();
  stats[field] = (stats[field] || 0) + 1;
  await writeData('stats.json', stats);
}

async function getBotRoles() {
  const data = await readData('bot_roles.json');
  return data.roles || {};
}

async function getBotRole(botName) {
  const roles = await getBotRoles();
  return roles[botName] || { role: 'worker', autoFarm: 'none', autoGuard: false, description: 'Default Worker' };
}

async function setBotRole(botName, roleUpdates) {
  const data = await readData('bot_roles.json');
  if (!data.roles) data.roles = {};

  const current = data.roles[botName] || { role: 'worker', autoFarm: 'none', autoGuard: false };
  data.roles[botName] = { ...current, ...roleUpdates };

  await writeData('bot_roles.json', data);
  return data.roles[botName];
}

async function getSavedChests() {
  const data = await readData('chests.json');
  return data.chests || [];
}

async function saveChestLocation(pos) {
  if (!pos) return false;
  const data = await readData('chests.json');
  if (!data.chests) data.chests = [];

  const exists = data.chests.some(c => c.x === pos.x && c.y === pos.y && c.z === pos.z);
  if (!exists) {
    data.chests.push({ x: pos.x, y: pos.y, z: pos.z });
    await writeData('chests.json', data);
    return true;
  }
  return false;
}

module.exports = {
  initDataDir,
  readData,
  writeData,
  updateData,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  isWhitelisted,
  getWaypoints,
  saveWaypoint,
  getWaypoint,
  deleteWaypoint,
  getStats,
  updateStats,
  incrementStat,
  getBotRoles,
  getBotRole,
  setBotRole,
  getSavedChests,
  saveChestLocation,
};
