import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mendapatkan direktori default Hermes Agent secara cross-platform
 */
function resolveDefaultHermesDir() {
    if (process.env.HERMES_DIR) {
        return path.resolve(process.env.HERMES_DIR);
    }
    // Coba path relatif sejajar dengan folder bot
    const siblingPath = path.resolve(__dirname, '../../../../hermes-agent');
    if (fs.existsSync(siblingPath)) {
        return siblingPath;
    }
    // Coba path Windows lokal jika ada
    if (process.platform === 'win32') {
        const winPath = 'c:/Users/aqana/Documents/Projects/hermes-agent';
        if (fs.existsSync(winPath)) return path.resolve(winPath);
    }
    // Coba path Linux container jika ada
    const linuxPath = '/home/container/hermes-agent';
    if (fs.existsSync(linuxPath)) return path.resolve(linuxPath);

    return siblingPath;
}

/**
 * Mendapatkan executable Python secara cross-platform
 */
function resolveDefaultPythonBin(hermesDir) {
    if (process.env.HERMES_PYTHON_BIN) {
        return process.env.HERMES_PYTHON_BIN;
    }

    const isWin = process.platform === 'win32';
    const venvScript = isWin
        ? path.join(hermesDir, '.venv/Scripts/python.exe')
        : path.join(hermesDir, '.venv/bin/python');

    if (fs.existsSync(venvScript)) {
        return venvScript;
    }

    const altVenv = isWin
        ? path.join(hermesDir, 'venv/Scripts/python.exe')
        : path.join(hermesDir, 'venv/bin/python');

    if (fs.existsSync(altVenv)) {
        return altVenv;
    }

    return isWin ? 'python' : 'python3';
}

/**
 * HermesProcessManager.js — Daemon & Process Orchestrator for Hermes Agent (Cross-Platform)
 * 
 * Mengelola lifecycle proses background Hermes Agent Python Gateway secara otomatis:
 * - Memeriksa ketersediaan gateway pada port 8642
 * - Otomatis menyalakan `python -m gateway.run` jika gateway belum aktif dan file tersedia
 * - Memantau health endpoint hingga online
 * - Menangani shutdown bersih (graceful cleanup) saat NelBot berhenti
 * - Tahan terhadap error spawn / file tidak ditemukan di lingkungan VPS/Linux (auto fallback tanpa crash)
 */
export class HermesProcessManager {
    constructor(options = {}) {
        this.endpoint = options.endpoint || process.env.HERMES_API_ENDPOINT || 'http://127.0.0.1:8642';
        this.hermesDir = options.hermesDir || resolveDefaultHermesDir();
        this.pythonBin = options.pythonBin || resolveDefaultPythonBin(this.hermesDir);
        this.childProcess = null;
        this.isStarting = false;
        this.cleanupRegistered = false;
    }

    /**
     * Memeriksa apakah Hermes Gateway sedang aktif dan sehat
     */
    async isHealthy() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${this.endpoint}/health`, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                return data.status === 'ok' && data.platform === 'hermes-agent';
            }
        } catch (e) {}
        return false;
    }

    /**
     * Memulai Hermes Gateway jika belum aktif
     */
    async ensureRunning(maxWaitMs = 15000) {
        if (await this.isHealthy()) {
            console.log(`[HermesProcessManager] Hermes Gateway is already running and healthy at ${this.endpoint}`);
            return true;
        }

        if (this.isStarting) {
            return false;
        }
        this.isStarting = true;

        // Pre-flight check: Pastikan direktori hermes dan binary Python ada sebelum spawn
        if (!fs.existsSync(this.hermesDir)) {
            console.warn(`[HermesProcessManager] Hermes directory tidak ditemukan di '${this.hermesDir}'. Dilewati (akan fallback ke Groq/Pollinations).`);
            this.isStarting = false;
            return false;
        }

        const isCustomPath = this.pythonBin.includes('/') || this.pythonBin.includes('\\');
        if (isCustomPath && !fs.existsSync(this.pythonBin)) {
            console.warn(`[HermesProcessManager] Python executable tidak ditemukan di '${this.pythonBin}'. Dilewati (akan fallback ke Groq/Pollinations).`);
            this.isStarting = false;
            return false;
        }

        console.log(`[HermesProcessManager] Spawning Hermes Gateway from ${this.hermesDir}...`);

        try {
            this.childProcess = spawn(this.pythonBin, ['-m', 'gateway.run'], {
                cwd: this.hermesDir,
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            // Tangani event error agar tidak throw unhandled exception jika spawn gagal
            this.childProcess.on('error', (err) => {
                console.warn(`[HermesProcessManager] Gagal menjalankan proses Hermes: ${err.message}. NelBot akan menggunakan fallback AI.`);
                this.childProcess = null;
            });

            this.childProcess.stdout?.on('data', (d) => {
                // Optional output
            });

            this.childProcess.stderr?.on('data', (d) => {
                // Ignore harmless sqlite / warning logs
            });

            this.childProcess.on('exit', (code, signal) => {
                console.log(`[HermesProcessManager] Hermes process exited (code=${code}, signal=${signal})`);
                this.childProcess = null;
            });

            this.registerGracefulShutdown();

            // Poll health endpoint
            const startTime = Date.now();
            while (Date.now() - startTime < maxWaitMs) {
                await new Promise(r => setTimeout(r, 800));
                if (await this.isHealthy()) {
                    console.log(`[HermesProcessManager] Hermes Gateway successfully started and healthy in ${Date.now() - startTime}ms!`);
                    this.isStarting = false;
                    return true;
                }
                // Jika child process sudah mati saat polling, stop menunggu
                if (!this.childProcess) {
                    break;
                }
            }

            console.warn(`[HermesProcessManager] Hermes Gateway belum siap dalam ${maxWaitMs}ms. Melanjutkan dengan fallback provider.`);
            this.isStarting = false;
            return false;
        } catch (err) {
            console.warn(`[HermesProcessManager] Exception saat spawn Hermes Gateway: ${err.message}`);
            this.isStarting = false;
            return false;
        }
    }

    /**
     * Mendaftarkan handler untuk mematikan child process saat aplikasi utama berhenti
     */
    registerGracefulShutdown() {
        if (this.cleanupRegistered) return;
        this.cleanupRegistered = true;

        const cleanup = () => {
            if (this.childProcess) {
                console.log('[HermesProcessManager] Stopping Hermes child process...');
                try {
                    this.childProcess.kill('SIGTERM');
                } catch (e) {}
                this.childProcess = null;
            }
        };

        process.on('SIGINT', () => { cleanup(); process.exit(0); });
        process.on('SIGTERM', () => { cleanup(); process.exit(0); });
        process.on('exit', cleanup);
    }

    /**
     * Mematikan Hermes Gateway
     */
    stop() {
        if (this.childProcess) {
            this.childProcess.kill('SIGTERM');
            this.childProcess = null;
            return true;
        }
        return false;
    }
}
