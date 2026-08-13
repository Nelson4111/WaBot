'use strict';

require('dotenv').config({ override: true });

const path = require('path');
const fs = require('fs');
const { configSchema } = require('./schema');

// ── Load dan Validasi Config ────────────────────────────────────────────────

/**
 * Memuat konfigurasi dari config.json dan memvalidasinya menggunakan schema Joi.
 * Jika ada field yang tidak valid atau file tidak ditemukan, proses akan berhenti
 * dengan pesan error yang jelas.
 *
 * @returns {object} Konfigurasi yang sudah tervalidasi
 * @throws {Error} Jika file tidak ada atau validasi gagal
 */
function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(
      '[CONFIG] FATAL: config.json tidak ditemukan di root project!'
    );
    console.error('[CONFIG] Pastikan file config.json ada dan sudah diisi.');
    process.exit(1);
  }

  let rawConfig;
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    rawConfig = JSON.parse(fileContent);
  } catch (err) {
    console.error(`[CONFIG] FATAL: config.json tidak bisa di-parse: ${err.message}`);
    console.error('[CONFIG] Pastikan format JSON valid (gunakan jsonlint.com untuk cek).');
    process.exit(1);
  }

  const { error, value: validatedConfig } = configSchema.validate(rawConfig, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });

  if (error) {
    console.error('[CONFIG] FATAL: config.json memiliki nilai yang tidak valid:');
    error.details.forEach((detail) => {
      console.error(`  ✗ ${detail.path.join('.')} — ${detail.message}`);
    });
    process.exit(1);
  }

  return validatedConfig;
}

/**
 * Memvalidasi variabel environment yang wajib ada.
 * Dipanggil setelah dotenv.config() di awal aplikasi.
 */
function validateEnv() {
  const required = ['BOT_USERNAME', 'SERVER_HOST'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('[CONFIG] FATAL: Variabel environment berikut wajib diisi di .env:');
    missing.forEach((key) => console.error(`  ✗ ${key}`));
    console.error('[CONFIG] Salin .env.example menjadi .env dan isi nilainya.');
    process.exit(1);
  }
}

// ── Validasi environment saat module pertama kali di-load ──────────────────
validateEnv();

/** Singleton config yang dipakai di seluruh aplikasi */
const config = loadConfig();

/**
 * Konfigurasi gabungan antara config.json dan .env.
 * Satu titik akses tunggal untuk semua konfigurasi.
 *
 * @type {object}
 */
const appConfig = {
  // Dari .env (sensitif)
  env: {
    botUsername: process.env.BOT_USERNAME,
    botPassword: process.env.BOT_PASSWORD || '',
    serverHost: process.env.SERVER_HOST,
    serverPort: parseInt(process.env.SERVER_PORT || '25565', 10),
    webPort: parseInt(process.env.WEB_PORT || '3000', 10),
    webEnabled: process.env.WEB_ENABLED ? process.env.WEB_ENABLED === 'true' : config.web.enabled,
    nodeEnv: process.env.NODE_ENV || 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  },
  // Dari config.json (non-sensitif)
  ...config,
};

module.exports = appConfig;
