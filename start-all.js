#!/usr/bin/env node
/**
 * start-all.js — Unified Startup Orchestrator for NelBot-MD & Hermes Agent (Phase E)
 * 
 * Menyalakan seluruh ekosistem NelBot secara terpadu:
 *  1. Memulai Hermes Agent Gateway (Python) via HermesProcessManager jika HERMES_ENABLED=true.
 *  2. Memulai engine utama NelBot (Baileys / index.js).
 *  3. Menjaga monitoring health dan graceful shutdown untuk kedua proses.
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { HermesProcessManager } from './lib/ai/providers/HermesProcessManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startAll() {
    console.log(chalk.cyan('╔═════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold.magenta('       NELBOT-MD UNIFIED ORCHESTRATOR (HERMES + BAILEYS)        ') + chalk.cyan('║'));
    console.log(chalk.cyan('╚═════════════════════════════════════════════════════════════════╝\n'));

    const hermesEnabled = process.env.HERMES_ENABLED === 'true';
    const hermesManager = new HermesProcessManager();

    if (hermesEnabled) {
        console.log(chalk.yellow('🚀 [1/2] Memeriksa status Hermes Agent Gateway...'));
        const isRunning = await hermesManager.ensureRunning(15000);
        if (isRunning) {
            console.log(chalk.green('✅ [1/2] Hermes Agent Gateway ONLINE di port 8642.'));
        } else {
            console.log(chalk.red('⚠️ [1/2] Hermes Gateway belum siap, NelBot akan menggunakan Fallback Provider (Groq 5-Key Pool).'));
        }
    } else {
        console.log(chalk.gray('ℹ️ [1/2] HERMES_ENABLED=false: Menjalankan NelBot dengan AI Provider bawaan.'));
    }

    console.log(chalk.yellow('\n🤖 [2/2] Memulai Engine Utama NelBot (Baileys WhatsApp)...'));

    const botProcess = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });

    const cleanupAll = () => {
        console.log(chalk.red('\n🛑 Menghentikan seluruh proses NelBot & Hermes...'));
        hermesManager.stop();
        if (botProcess) {
            botProcess.kill('SIGTERM');
        }
        process.exit(0);
    };

    process.on('SIGINT', cleanupAll);
    process.on('SIGTERM', cleanupAll);

    botProcess.on('exit', (code) => {
        console.log(chalk.yellow(`\n[NelBot] Bot process exited with code ${code}`));
        hermesManager.stop();
        process.exit(code || 0);
    });
}

startAll().catch((err) => {
    console.error(chalk.red('Fatal error during startup:'), err);
    process.exit(1);
});
