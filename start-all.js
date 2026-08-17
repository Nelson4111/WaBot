/**
 * start-all.js
 * Launcher All-in-One: Menjalankan Lavalink (Server Musik), Bot WA, dan Bot Discord secara bersamaan.
 * Setiap proses terisolasi: jika salah satu restart/crash, yang lain TETAP JALAN.
 *
 * Cara pakai:
 *   node start-all.js
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, createWriteStream } from 'fs';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// Konstanta Warna Terminal
// ─────────────────────────────────────────────
const RESET   = '\x1b[0m';
const RED     = '\x1b[31m';
const GREEN   = '\x1b[32m';
const YELLOW  = '\x1b[33m';
const BLUE    = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN    = '\x1b[36m';

// ─────────────────────────────────────────────
// Helper: Download File dengan Redirect Support
// ─────────────────────────────────────────────
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(dest);
        const handleRequest = (reqUrl) => {
            https.get(reqUrl, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    return handleRequest(res.headers.location);
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`Server merespons dengan status code: ${res.statusCode}`));
                }
                res.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve(true));
                });
            }).on('error', (err) => {
                file.close();
                reject(err);
            });
        };
        handleRequest(url);
    });
}

// ─────────────────────────────────────────────
// Helper: Cek Keberadaan Java
// ─────────────────────────────────────────────
function getJavaCommand() {
    const candidates = [
        'java',
        join(__dirname, 'jre', 'bin', 'java'),
        join(__dirname, 'jdk', 'bin', 'java')
    ];

    for (const cmd of candidates) {
        try {
            execSync(`${cmd} -version`, { stdio: 'ignore' });
            return cmd;
        } catch {
            // Lanjut cari kandidat berikutnya
        }
    }
    return null;
}

// ─────────────────────────────────────────────
// Auto-Setup Lavalink & Bot Dependencies
// ─────────────────────────────────────────────
async function prepareEnvironment() {
    // 1. Auto-install dependencies bot-discord
    const dcPackageJson = join(__dirname, 'bot-discord', 'package.json');
    if (existsSync(dcPackageJson)) {
        console.log(`${BLUE}[BOT-DC]${RESET} 📦 Memeriksa dependencies bot-discord...`);
        try {
            execSync('npm install', {
                cwd: join(__dirname, 'bot-discord'),
                stdio: 'inherit',
            });
            console.log(`${BLUE}[BOT-DC]${RESET} ✅ Dependencies siap.`);
        } catch (e) {
            console.error(`${RED}[BOT-DC][ERR]${RESET} Gagal install dependencies: ${e.message}`);
        }
    }

    // 2. Cek & Auto-download Lavalink.jar jika Java tersedia
    const javaCmd = getJavaCommand();
    const lavalinkJarPath = join(__dirname, 'Lavalink.jar');

    if (javaCmd) {
        if (!existsSync(lavalinkJarPath)) {
            console.log(`${MAGENTA}[LAVALINK]${RESET} 📥 Mengunduh Lavalink.jar resmi (v4.0.8)...`);
            try {
                const downloadUrl = 'https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar';
                await downloadFile(downloadUrl, lavalinkJarPath);
                console.log(`${MAGENTA}[LAVALINK]${RESET} ✅ Lavalink.jar berhasil diunduh.`);
            } catch (err) {
                console.error(`${RED}[LAVALINK][ERR]${RESET} Gagal mengunduh Lavalink.jar: ${err.message}`);
            }
        }
    } else {
        console.log(`${YELLOW}[LAVALINK]${RESET} ℹ️ Java tidak terdeteksi di sistem. Lavalink lokal dilewati (Bot akan memakai Public Nodes).`);
    }

    return javaCmd;
}

// ─────────────────────────────────────────────
// Fungsi Spawn & Monitor tiap Proses
// ─────────────────────────────────────────────
function startProcess(bot, retries = 0) {
    if (!bot.enabled) {
        console.log(`${YELLOW}[LAUNCHER]${RESET} ${bot.name} dilewati — ${bot.skipReason || 'fitur dinonaktifkan'}`);
        return;
    }

    const MAX_RETRIES   = 10;
    const RETRY_DELAY_MS = 5000;

    const prefix = `${bot.color}[${bot.name}]${RESET}`;
    console.log(`${prefix} 🚀 Menyalakan...`);

    const child = spawn(bot.command, bot.args, {
        cwd: bot.cwd,
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env },
    });

    // Forward stdout
    child.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => console.log(`${prefix} ${line}`));
    });

    // Forward stderr
    child.stderr?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => console.error(`${RED}[${bot.name}][ERR]${RESET} ${line}`));
    });

    child.on('exit', (code, signal) => {
        if (code === 0) {
            console.log(`${prefix} ✅ Berhenti bersih (kode 0). Tidak di-restart.`);
            return;
        }

        const reason = signal ? `sinyal: ${signal}` : `kode: ${code ?? 'null'}`;
        console.error(`${RED}[${bot.name}][CRASH]${RESET} Crash! (${reason}) — Percobaan restart ke-${retries + 1}/${MAX_RETRIES}`);

        if (retries >= MAX_RETRIES) {
            console.error(
                `${RED}[${bot.name}][STOP]${RESET} Sudah crash ${MAX_RETRIES}x berturut-turut. ` +
                `Layanan ini dihentikan agar tidak membebani server.`
            );
            return;
        }

        console.log(`${YELLOW}[${bot.name}]${RESET} Restart dalam ${RETRY_DELAY_MS / 1000} detik...`);
        setTimeout(() => startProcess(bot, retries + 1), RETRY_DELAY_MS);
    });

    child.on('error', (err) => {
        console.error(`${RED}[${bot.name}][ERR]${RESET} Gagal spawn proses: ${err.message}`);
    });
}

// ─────────────────────────────────────────────
// Eksekusi Utama (Main Entry)
// ─────────────────────────────────────────────
async function main() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('        NelBot All-In-One Launcher (v4.0)          ');
    console.log('═══════════════════════════════════════════════════');

    const javaCmd = await prepareEnvironment();
    const lavalinkJarExists = existsSync(join(__dirname, 'Lavalink.jar'));

    const SERVICES = [
        {
            name: 'LAVALINK',
            color: MAGENTA,
            command: javaCmd || 'java',
            args: ['-Xmx512M', '-jar', join(__dirname, 'Lavalink.jar')],
            cwd: __dirname,
            enabled: Boolean(javaCmd && lavalinkJarExists),
            skipReason: !javaCmd ? 'Java tidak terdeteksi' : 'Lavalink.jar tidak ditemukan',
            delayAfterStart: 4000
        },
        {
            name: 'BOT-WA',
            color: GREEN,
            command: process.execPath,
            args: [join(__dirname, 'index.js')],
            cwd: __dirname,
            enabled: existsSync(join(__dirname, 'index.js')),
            skipReason: 'index.js tidak ditemukan'
        },
        {
            name: 'BOT-DC',
            color: BLUE,
            command: process.execPath,
            args: [join(__dirname, 'bot-discord', 'index.js')],
            cwd: join(__dirname, 'bot-discord'),
            enabled: existsSync(join(__dirname, 'bot-discord', 'index.js')),
            skipReason: 'bot-discord/index.js tidak ditemukan'
        }
    ];

    console.log('\n📋 Daftar Layanan:');
    SERVICES.forEach(s => {
        const status = s.enabled
            ? `${s.color}✅ Aktif (Akan Dijalankan)${RESET}`
            : `${YELLOW}⏭️  Dilewati (${s.skipReason})${RESET}`;
        console.log(`  ${s.color}${s.name.padEnd(10)}${RESET}: ${status}`);
    });
    console.log('═══════════════════════════════════════════════════\n');

    for (const service of SERVICES) {
        if (service.enabled) {
            startProcess(service);
            if (service.delayAfterStart) {
                await new Promise(r => setTimeout(r, service.delayAfterStart));
            }
        }
    }
}

main().catch(err => {
    console.error(`${RED}[LAUNCHER FATAL]${RESET}`, err);
});
