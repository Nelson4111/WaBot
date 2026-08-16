/**
 * start-all.js
 * Launcher utama yang menjalankan Bot WA dan Bot Discord secara bersamaan.
 * Jika salah satu crash, yang lain TETAP JALAN dan auto-restart sendiri.
 *
 * Cara pakai:
 *   node start-all.js
 *
 * Untuk mengubah startup command di panel:
 *   Dari: node index.js
 *   Ke  : node start-all.js
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// Auto-install dependencies bot-discord (Selalu cek setiap start)
// ─────────────────────────────────────────────
const dcPackageJson = join(__dirname, 'bot-discord', 'package.json')

if (existsSync(dcPackageJson)) {
    console.log(`${'\x1b[34m'}[BOT-DC]${'\x1b[0m'} 📦 Menginstall dependencies bot-discord...`)
    try {
        execSync('npm install', {
            cwd: join(__dirname, 'bot-discord'),
            stdio: 'inherit',
        })
        console.log(`${'\x1b[34m'}[BOT-DC]${'\x1b[0m'} ✅ Dependencies siap.`)
    } catch (e) {
        console.error(`${'\x1b[31m'}[BOT-DC][ERR]${'\x1b[0m'} Gagal install dependencies: ${e.message}`)
    }
}

// ─────────────────────────────────────────────
// Konfigurasi Bot
// Tambah atau hapus entri di sini sesuai kebutuhan
// ─────────────────────────────────────────────
const BOTS = [
    {
        name: 'BOT-WA',
        color: '\x1b[32m',   // Hijau
        script: join(__dirname, 'index.js'),
        enabled: true,
    },
    {
        name: 'BOT-DC',
        color: '\x1b[34m',   // Biru
        // Hanya aktif jika folder bot-discord sudah ada
        script: join(__dirname, 'bot-discord', 'index.js'),
        enabled: existsSync(join(__dirname, 'bot-discord', 'index.js')),
    },
];

// ─────────────────────────────────────────────
// Konstanta warna terminal
// ─────────────────────────────────────────────
const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';

// ─────────────────────────────────────────────
// Fungsi Utama: Spawn & Monitor tiap Bot
// ─────────────────────────────────────────────
function startBot(bot, retries = 0) {
    if (!bot.enabled) {
        console.log(`${YELLOW}[LAUNCHER]${RESET} ${bot.name} dilewati — file belum ada: ${bot.script}`);
        return;
    }

    const MAX_RETRIES   = 10;   // Maks crash berturut-turut sebelum berhenti
    const RETRY_DELAY_MS = 5000; // Jeda 5 detik sebelum restart

    const prefix = `${bot.color}[${bot.name}]${RESET}`;
    console.log(`${prefix} 🚀 Menyalakan...`);

    const child = spawn(process.execPath, [bot.script], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env },
    });

    // Forward stdout dengan prefix nama bot
    child.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => console.log(`${prefix} ${line}`));
    });

    // Forward stderr dengan warna merah + prefix nama bot
    child.stderr?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => console.error(`${RED}[${bot.name}][ERR]${RESET} ${line}`));
    });

    child.on('exit', (code, signal) => {
        // Exit kode 0 = shutdown bersih (misal proses dihentikan manual)
        if (code === 0) {
            console.log(`${prefix} ✅ Berhenti bersih (kode 0). Tidak di-restart.`);
            return;
        }

        const reason = signal ? `sinyal: ${signal}` : `kode: ${code ?? 'null'}`;
        console.error(`${RED}[${bot.name}][CRASH]${RESET} Crash! (${reason}) — Percobaan restart ke-${retries + 1}/${MAX_RETRIES}`);

        if (retries >= MAX_RETRIES) {
            console.error(
                `${RED}[${bot.name}][STOP]${RESET} Sudah crash ${MAX_RETRIES}x berturut-turut. ` +
                `Bot ini dihentikan agar tidak membebani panel. Cek log di atas untuk penyebabnya.`
            );
            return;
        }

        console.log(`${YELLOW}[${bot.name}]${RESET} Restart dalam ${RETRY_DELAY_MS / 1000} detik...`);
        setTimeout(() => startBot(bot, retries + 1), RETRY_DELAY_MS);
    });

    child.on('error', (err) => {
        console.error(`${RED}[${bot.name}][ERR]${RESET} Gagal spawn proses: ${err.message}`);
    });
}

// ─────────────────────────────────────────────
// Banner Startup
// ─────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════');
console.log('        NelBot Launcher — start-all.js      ');
console.log('═══════════════════════════════════════════');
BOTS.forEach(bot => {
    const status = bot.enabled
        ? `${bot.color}✅ Akan dijalankan${RESET}`
        : `${YELLOW}⏭️  Dilewati (file belum ada)${RESET}`;
    console.log(`  ${bot.color}${bot.name}${RESET}: ${status}`);
});
console.log('═══════════════════════════════════════════\n');

// ─────────────────────────────────────────────
// Jalankan Semua Bot yang enabled
// ─────────────────────────────────────────────
BOTS.forEach(bot => startBot(bot));
