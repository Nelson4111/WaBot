#!/usr/bin/env node
/**
 * start-all.js — Unified Startup Orchestrator for NelBot-MD, Discord Bot & Hermes Agent
 * 
 * Menyalakan seluruh ekosistem bot secara terpadu dalam 1 VPS:
 *  1. Memeriksa / Menginisialisasi Hermes Agent Gateway (Remote / Local).
 *  2. Memulai Bot Discord (bot-discord/Shard.js).
 *  3. Memulai Engine Utama NelBot (Baileys WhatsApp / index.js).
 *  4. Menjaga monitoring health dan graceful shutdown untuk seluruh proses.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { HermesProcessManager } from './lib/ai/providers/HermesProcessManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startAll() {
    console.log(chalk.cyan('╔═════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold.magenta('       NELBOT-MD UNIFIED ORCHESTRATOR (WA + DISCORD + HERMES)     ') + chalk.cyan('║'));
    console.log(chalk.cyan('╚═════════════════════════════════════════════════════════════════╝\n'));

    const runningProcesses = [];

    // --- 1. HERMES AGENT CHECK ---
    const hermesEnabled = process.env.HERMES_ENABLED === 'true';
    const hermesManager = new HermesProcessManager();

    if (hermesEnabled) {
        console.log(chalk.yellow('🚀 [1/3] Memeriksa status Hermes Agent Gateway...'));
        const isRunning = await hermesManager.ensureRunning(10000);
        if (isRunning) {
            console.log(chalk.green(`✅ [1/3] Hermes Agent Gateway ONLINE di ${hermesManager.endpoint}.`));
        } else {
            console.log(chalk.cyan(`⚡ [1/3] Hermes Agent: Menggunakan fallback AI / Remote Gateway.`));

            // --- NETWORK DIAGNOSTIC: Cari IP yang bisa dipakai ---
            try {
                const { default: dns } = await import('dns');
                const { promisify } = await import('util');
                const lookup = promisify(dns.lookup);
                const lookupAll = promisify(dns.resolve4);

                const endpointUrl = new URL(hermesManager.endpoint);
                const hostname = endpointUrl.hostname;
                const port = endpointUrl.port;

                console.log(chalk.gray(`\n🔍 [NET DIAG] Mencoba resolve hostname: ${hostname}`));

                let ips = [];
                try {
                    ips = await lookupAll(hostname);
                    console.log(chalk.gray(`   DNS resolve → ${ips.join(', ')}`));
                } catch (e) {
                    const single = await lookup(hostname).catch(() => null);
                    if (single) { ips = [single.address]; console.log(chalk.gray(`   DNS lookup → ${single.address}`)); }
                    else { console.log(chalk.red(`   ❌ DNS resolve GAGAL: ${e.message}`)); }
                }

                // Tambahkan IP Internal Pterodactyl (Docker Gateway) karena bot dan hermes ada di host yang sama
                if (!ips.includes('172.18.0.1')) ips.push('172.18.0.1');

                // Coba koneksi langsung ke tiap IP yang ditemukan
                let workingEndpoint = null;
                for (const ip of ips) {
                    const testUrl = `http://${ip}:${port}/health`;
                    try {
                        const ctrl = new AbortController();
                        const t = setTimeout(() => ctrl.abort(), 3000);
                        const res = await fetch(testUrl, { signal: ctrl.signal });
                        clearTimeout(t);
                        if (res.ok) {
                            const data = await res.json().catch(() => ({}));
                            if (data.status === 'ok') {
                                workingEndpoint = testUrl.replace('/health', '');
                                console.log(chalk.green(`   ✅ REACHABLE via IP: http://${ip}:${port}`));
                            }
                        }
                    } catch (_) {
                        console.log(chalk.red(`   ❌ UNREACHABLE: http://${ip}:${port}`));
                    }
                }

                if (workingEndpoint) {
                    console.log(chalk.bold.yellow(`\n💡 [NET DIAG] Ganti HERMES_API_ENDPOINT di .env menjadi:`));
                    console.log(chalk.bold.green(`   HERMES_API_ENDPOINT=${workingEndpoint}`));
                } else {
                    console.log(chalk.red(`\n❌ [NET DIAG] Tidak ada IP yang bisa diakses dari VPS ini.`));
                    console.log(chalk.gray(`   Pastikan port ${port} dibuka di firewall, atau kedua server ada di VPS yang sama.`));
                }
            } catch (diagErr) {
                console.log(chalk.gray(`[NET DIAG] Diagnostic error: ${diagErr.message}`));
            }
            // --- END NETWORK DIAGNOSTIC ---
        }
    } else {
        console.log(chalk.cyan('⚡ [1/3] AI Mode: Menggunakan Groq Key Pool (HERMES_ENABLED=false).'));
    }

    // --- 2. DISCORD BOT SPAWN ---
    const discordDir = path.join(__dirname, 'bot-discord');
    const discordShardFile = path.join(discordDir, 'Shard.js');
    const discordIndexFile = path.join(discordDir, 'index.js');
    const discordEnabled = process.env.DISCORD_ENABLED !== 'false' && fs.existsSync(discordDir);

    if (discordEnabled && (fs.existsSync(discordShardFile) || fs.existsSync(discordIndexFile))) {
        const startScript = fs.existsSync(discordShardFile) ? 'Shard.js' : 'index.js';
        console.log(chalk.yellow(`\n🎧 [2/3] Memulai Discord Music Bot (${startScript})...`));

        const discordProcess = spawn('node', ['--no-warnings', startScript], {
            cwd: discordDir,
            stdio: 'inherit',
            env: { ...process.env }
        });

        runningProcesses.push({ name: 'DiscordBot', proc: discordProcess });

        discordProcess.on('exit', (code, signal) => {
            console.log(chalk.yellow(`\n[DiscordBot] Process exited (code=${code}, signal=${signal})`));
        });

        discordProcess.on('error', (err) => {
            console.error(chalk.red(`[DiscordBot] Failed to spawn: ${err.message}`));
        });
    } else {
        console.log(chalk.gray('\n⏩ [2/3] Discord Bot dilewati (folder bot-discord tidak ditemukan atau dinonaktifkan).'));
    }

    // --- 3. WHATSAPP BOT (BAILEYS) SPAWN ---
    console.log(chalk.yellow('\n🤖 [3/3] Memulai Engine Utama NelBot (Baileys WhatsApp)...'));

    const waProcess = spawn('node', ['--expose-gc', 'index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        env: { ...process.env }
    });

    runningProcesses.push({ name: 'WhatsAppBot', proc: waProcess });

    // --- GRACEFUL SHUTDOWN HANDLER ---
    const cleanupAll = () => {
        console.log(chalk.red('\n🛑 Menghentikan seluruh proses NelBot, Discord & Hermes...'));
        hermesManager.stop();
        for (const { name, proc } of runningProcesses) {
            try {
                if (proc && !proc.killed) {
                    console.log(chalk.gray(`Stopping ${name}...`));
                    proc.kill('SIGTERM');
                }
            } catch (e) {}
        }
        process.exit(0);
    };

    process.on('SIGINT', cleanupAll);
    process.on('SIGTERM', cleanupAll);

    waProcess.on('exit', (code) => {
        console.log(chalk.yellow(`\n[NelBot WA] Bot process exited with code ${code}`));
        cleanupAll();
    });

    waProcess.on('error', (err) => {
        console.error(chalk.red(`[NelBot WA] Failed to spawn: ${err.message}`));
        cleanupAll();
    });
}

startAll().catch((err) => {
    console.error(chalk.red('Fatal error during startup:'), err);
    process.exit(1);
});
