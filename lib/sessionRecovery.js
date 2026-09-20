/**
 * Session Recovery Manager for Signal Protocol / Baileys
 * Provides safe, localized session invalidation and auto-healing for Bad MAC errors
 * without touching creds.json or other sessions.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const MAX_ATTEMPTS = 3;
const DEBOUNCE_MS = 10000; // 10 detik antar percobaan untuk address yang sama
const DISABLE_COOLDOWN_MS = 5 * 60 * 1000; // 5 menit jeda jika melebihi batas percobaan

// In-memory circuit breaker state
const recoveryState = new Map();
// In-flight mutex per address
const inFlight = new Set();

/**
 * Validasi apakah identifier aman (tidak mengandung path traversal atau creds)
 * @param {string} identifier
 * @returns {boolean}
 */
export function isSafeIdentifier(identifier) {
    if (!identifier || typeof identifier !== 'string') return false;
    const clean = identifier.trim();
    if (clean.length === 0 || clean.length > 100) return false;
    if (clean.includes('..') || clean.includes('/') || clean.includes('\\')) return false;
    if (clean.toLowerCase().includes('creds')) return false;
    return /^[\w.-]+$/.test(clean);
}

/**
 * Invalidate session secara aman pada memory cache (authKeys) dan disk
 * @param {string} address Signal Protocol Address (misal "59090864717979.0")
 * @param {object} authKeys authState.keys instance
 * @param {string} sessionDir Direktori penyimpanan session
 * @returns {Promise<boolean>}
 */
export async function invalidateSession(address, authKeys, sessionDir = './sessions') {
    if (!isSafeIdentifier(address)) {
        console.warn(chalk.yellow(`[Signal Recovery] Refusing to invalidate invalid address: "${address}"`));
        return false;
    }

    try {
        // 1. Invalidate via authKeys.set (membersihkan memory cache dan disk via useMultiFileAuthState)
        if (authKeys && typeof authKeys.set === 'function') {
            await authKeys.set({
                session: {
                    [address]: null
                }
            }).catch(e => {
                console.warn(chalk.yellow(`[Signal Recovery] authKeys.set error for ${address}: ${e?.message}`));
            });
        }

        // 2. Double-check berkas fisik di disk untuk memastikan file benar-benar terhapus
        const targetFileName = `session-${address}.json`;
        const targetPath = path.resolve(sessionDir, targetFileName);
        
        // Safety guard: pastikan tidak pernah menghapus apapun di luar folder session atau creds.json
        if (targetPath.includes('creds.json')) {
            console.error(chalk.red(`[Signal Recovery] CRITICAL ERROR: Attempted to touch creds.json! Aborting.`));
            return false;
        }

        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }

        return true;
    } catch (err) {
        console.error(chalk.red(`[Signal Recovery] Invalidation failed for ${address}:`), err?.message || err);
        return false;
    }
}

/**
 * Handler otomatis untuk Bad MAC error dengan Circuit Breaker dan Debounce
 * @param {string} address Signal Protocol Address (misal "59090864717979.0")
 * @param {object} auth Baileys authState instance ({ creds, keys })
 * @param {string} sessionDir Direktori session
 * @returns {Promise<boolean>} True jika recovery berhasil dijalankan
 */
export async function handleBadMac(address, auth, sessionDir = './sessions') {
    if (!address || !isSafeIdentifier(address)) return false;

    const now = Date.now();
    let state = recoveryState.get(address);

    if (!state) {
        state = { attempts: 0, lastAttempt: 0, disabledUntil: 0 };
        recoveryState.set(address, state);
    }

    // 1. Cek apakah auto-healing sedang di-disable sementara untuk address ini
    if (state.disabledUntil > now) {
        return false;
    }

    // 2. Debounce: abaikan jika permintaan datang terlalu cepat untuk address yang sama
    if (now - state.lastAttempt < DEBOUNCE_MS) {
        return false;
    }

    // 3. Mutex: abaikan jika sedang dalam proses invalidasi
    if (inFlight.has(address)) {
        return false;
    }

    // 4. Circuit Breaker Check
    state.attempts += 1;
    state.lastAttempt = now;

    if (state.attempts > MAX_ATTEMPTS) {
        state.disabledUntil = now + DISABLE_COOLDOWN_MS;
        console.warn(chalk.red(`[Signal Recovery] Recovery failed for ${address}`));
        console.warn(chalk.red(`[Signal Recovery] Auto-healing disabled temporarily for this identifier`));
        return false;
    }

    inFlight.add(address);

    try {
        console.log(chalk.yellow(`[Signal Recovery] Bad MAC detected`));
        console.log(chalk.yellow(`[Signal Recovery] Address: ${address}`));
        console.log(chalk.yellow(`[Signal Recovery] Attempt: ${state.attempts}/${MAX_ATTEMPTS}`));
        console.log(chalk.cyan(`[Signal Recovery] Invalidating affected session...`));

        const success = await invalidateSession(address, auth?.keys, sessionDir);

        if (success) {
            console.log(chalk.green(`[Signal Recovery] Session recovery requested`));
            console.log(chalk.green(`[Signal Recovery] Waiting for retry...`));
        }

        return success;
    } finally {
        inFlight.delete(address);
    }
}

/**
 * Reset circuit breaker untuk address tertentu (misal setelah user manual fix atau handshake sukses)
 * @param {string} address
 */
export function resetRecoveryState(address) {
    if (recoveryState.has(address)) {
        recoveryState.delete(address);
    }
}

/**
 * Manual deletion helper untuk command owner (.delsesi <identifier>)
 * @param {string} identifier Bisa berupa "59090864717979.0" atau "59090864717979"
 * @param {object} authKeys authState.keys
 * @param {string} sessionDir Direktori session
 * @returns {Promise<{ success: boolean, filesRemoved: string[], error?: string }>}
 */
export async function manualDeleteSession(identifier, authKeys, sessionDir = './sessions') {
    const rawId = (identifier || '').trim();
    if (!rawId) {
        return { success: false, filesRemoved: [], error: 'Identifier tidak boleh kosong' };
    }

    // Bersihkan karakter awalan/akhiran jika ada format session-xxx.json
    let cleanId = rawId.replace(/^session-/, '').replace(/\.json$/, '');
    
    // Jika input mengandung @s.whatsapp.net atau @lid, ekstrak user-nya
    if (cleanId.includes('@')) {
        cleanId = cleanId.split('@')[0].split(':')[0];
    }

    if (!isSafeIdentifier(cleanId)) {
        return { success: false, filesRemoved: [], error: `Identifier tidak aman atau tidak valid: "${rawId}"` };
    }

    if (!fs.existsSync(sessionDir)) {
        return { success: false, filesRemoved: [], error: `Folder ${sessionDir} tidak ditemukan` };
    }

    const files = fs.readdirSync(sessionDir);
    // Cari semua file session yang cocok: session-<cleanId>.json atau session-<cleanId>.*.json
    const matchingFiles = files.filter(file => {
        if (!file.startsWith('session-')) return false;
        if (!file.endsWith('.json')) return false;
        
        // Contoh 1: persis session-59090864717979.0.json
        if (file === `session-${cleanId}.json`) return true;
        
        // Contoh 2: cleanId adalah "59090864717979", cocok dengan session-59090864717979.0.json
        if (file.startsWith(`session-${cleanId}.`)) return true;
        
        return false;
    });

    if (matchingFiles.length === 0) {
        return {
            success: false,
            filesRemoved: [],
            error: `Tidak ditemukan berkas session untuk identifier: "${cleanId}"`
        };
    }

    const removed = [];
    for (const fileName of matchingFiles) {
        // Absolute safety guard
        if (fileName === 'creds.json' || fileName.includes('creds')) continue;

        const sessionKeyId = fileName.replace(/^session-/, '').replace(/\.json$/, '');
        
        // Invalidate via authKeys jika tersedia
        if (authKeys && typeof authKeys.set === 'function') {
            await authKeys.set({
                session: {
                    [sessionKeyId]: null
                }
            }).catch(() => null);
        }

        const filePath = path.join(sessionDir, fileName);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                removed.push(fileName);
            }
        } catch (e) {
            console.error(`[Manual Session Recovery] Gagal menghapus ${fileName}:`, e?.message);
        }

        resetRecoveryState(sessionKeyId);
    }

    return {
        success: removed.length > 0,
        filesRemoved: removed
    };
}
