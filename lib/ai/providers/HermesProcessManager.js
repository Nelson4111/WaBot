import { spawn } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HermesProcessManager.js — Daemon & Process Orchestrator for Hermes Agent (Phase E)
 * 
 * Mengelola lifecycle proses background Hermes Agent Python Gateway secara otomatis:
 * - Memeriksa ketersediaan gateway pada port 8642
 * - Otomatis menyalakan `python -m gateway.run` jika gateway belum aktif
 * - Memantau health endpoint hingga online
 * - Menangani shutdown bersih (graceful cleanup) saat NelBot berhenti
 */
export class HermesProcessManager {
    constructor(options = {}) {
        this.endpoint = options.endpoint || process.env.HERMES_API_ENDPOINT || 'http://127.0.0.1:8642';
        this.hermesDir = options.hermesDir || path.resolve('c:/Users/aqana/Documents/Projects/hermes-agent');
        this.pythonBin = options.pythonBin || path.join(this.hermesDir, '.venv/Scripts/python.exe');
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

        console.log(`[HermesProcessManager] Spawning Hermes Gateway from ${this.hermesDir}...`);

        try {
            this.childProcess = spawn(this.pythonBin, ['-m', 'gateway.run'], {
                cwd: this.hermesDir,
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            this.childProcess.stdout.on('data', (d) => {
                const text = d.toString();
                if (text.includes('INFO') || text.includes('Uvicorn running')) {
                    // Optional debug logging
                }
            });

            this.childProcess.stderr.on('data', (d) => {
                // Ignore harmless python sqlite warnings
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
            }

            console.warn(`[HermesProcessManager] Hermes Gateway did not become healthy within ${maxWaitMs}ms.`);
            this.isStarting = false;
            return false;
        } catch (err) {
            console.error(`[HermesProcessManager] Failed to spawn Hermes Gateway:`, err.message);
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
