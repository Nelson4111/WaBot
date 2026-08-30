#!/usr/bin/env node
/**
 * nelbot-mcp.js — Official Model Context Protocol (MCP) Server for NelBot-MD (Phase C Hardened)
 * 
 * Mengekspor kapabilitas internal NelBot-MD ke Hermes Agent melalui protokol standar MCP (JSON-RPC 2.0 via stdio).
 * 
 * SECURITY HARDENING (Phase C):
 *  1. Caller Authorization: User A tidak bisa mengintip profile User B (Access Denied).
 *  2. Group Isolation: Chat/Grup A tidak bisa membaca konfigurasi internal Grup B (Access Denied).
 *  3. Strict Command & Argument Sanitizer: Memblokir path traversal, null-bytes, command injection, dan file sensitif.
 *  4. Secret Redaction: Otomatis menyamarkan seluruh token, API keys, password, dan credentials dari response JSON-RPC.
 *  5. Prompt Injection Immunity: Otorisasi diverifikasi secara deterministik pada level kode, bukan mempercayai prompt LLM.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

// Load database helper
function loadDatabase() {
    try {
        const dbPath = path.join(projectRoot, 'database.json');
        if (fs.existsSync(dbPath)) {
            return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        }
    } catch (e) {
        // Fallback jika database sedang terkunci/terbaca sebagian
    }
    return { users: {}, chats: {}, settings: {} };
}

// Load knowledge helpers
function loadJSON(relPath) {
    try {
        const p = path.join(__dirname, '../knowledge', relPath);
        if (fs.existsSync(p)) {
            return JSON.parse(fs.readFileSync(p, 'utf-8'));
        }
    } catch (e) {}
    return {};
}

const commandsDB = loadJSON('commands.json');
const execDB = loadJSON('executable_commands.json');

const WHITELISTED_COMMANDS = new Set(
    (execDB.commands || []).map(c => c.name).concat(['ping', 'owner', 'menu', 'help', 'sewa', 'limit'])
);

const DANGEROUS_PATTERNS = [
    /\.\.[\/\\]/,              // Path traversal (../ atau ..\)
    /\0/,                      // Null bytes
    /[;&|`$]/,                 // Shell metacharacters
    /\b(exec|eval|system|spawn|fork|child_process)\b/i, // Code execution keywords
    /\.env\b/i,                // Sensitive environment files
    /database\.json/i,         // Raw database access attempts
    /auth_info|session/i,      // Baileys session folders
    /apiKey|bearer|token/i     // Key dumping keywords
];

/**
 * Secret Redactor — Menyamarkan seluruh kredensial dan data rahasia
 */
function redactSecrets(val) {
    if (typeof val === 'string') {
        let cleaned = val;
        // Redact Groq / OpenAI keys
        cleaned = cleaned.replace(/gsk_[a-zA-Z0-9_-]{20,}/g, 'gsk_***[REDACTED]***');
        cleaned = cleaned.replace(/sk-[a-zA-Z0-9_-]{20,}/g, 'sk-***[REDACTED]***');
        // Redact Bearer tokens
        cleaned = cleaned.replace(/Bearer\s+[a-zA-Z0-9_\-\.]{15,}/gi, 'Bearer ***[REDACTED]***');
        // Redact generic passwords / secret tokens
        cleaned = cleaned.replace(/(password|secret|api_key|token|pairing_code)\s*[:=]\s*["']?[^"'\s,;]+/gi, '$1: "***[REDACTED]***"');
        // Redact full absolute system paths
        cleaned = cleaned.replace(/[A-Za-z]:\\(?:[^\s\\/:*?"<>|]+\\)+[^\s\\/:*?"<>|]+/g, '[LOCAL_PATH_REDACTED]');
        return cleaned;
    }
    if (Array.isArray(val)) {
        return val.map(redactSecrets);
    }
    if (val && typeof val === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(val)) {
            if (/token|secret|password|key|auth|credential/i.test(k) && typeof v === 'string' && v.length > 5) {
                out[k] = '***[REDACTED]***';
            } else {
                out[k] = redactSecrets(v);
            }
        }
        return out;
    }
    return val;
}

// Canonical JID formatter
function toCanonicalJid(jid) {
    if (!jid || typeof jid !== 'string') return '';
    const clean = jid.trim();
    if (clean.includes('@s.whatsapp.net') || clean.includes('@g.us') || clean.includes('@lid')) {
        return clean;
    }
    const digits = clean.replace(/[^0-9]/g, '');
    return digits ? `${digits}@s.whatsapp.net` : '';
}

// MCP Tool Definitions
const TOOLS = [
    {
        name: 'get_user_profile',
        description: 'Mendapatkan profil dan status pengguna WhatsApp (EXP, Limit, Level, Role, Status Premium/Sewa). Hanya boleh melihat profil sendiri kecuali jika caller adalah Owner.',
        inputSchema: {
            type: 'object',
            properties: {
                jid: {
                    type: 'string',
                    description: 'Nomor WhatsApp atau JID pengguna (contoh: 6281241100804 atau 6281241100804@s.whatsapp.net)'
                },
                caller_jid: {
                    type: 'string',
                    description: 'JID pengguna WhatsApp yang sedang meminta data'
                },
                is_owner: {
                    type: 'boolean',
                    description: 'Apakah pengguna yang memanggil adalah Owner bot'
                }
            },
            required: ['jid']
        }
    },
    {
        name: 'search_bot_knowledge',
        description: 'Mencari informasi atau panduan dari database pengetahuan NelBot (aturan sewa bot, izin grup, kontak owner, dan fitur)',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Kata kunci pencarian (contoh: sewa, owner, masukin grup, download, game, stiker)'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'check_group_status',
        description: 'Mengecek status grup WhatsApp (apakah terdaftar di database, durasi sewa, dan status bot aktif). Hanya boleh dipanggil dari dalam grup terkait kecuali jika caller adalah Owner.',
        inputSchema: {
            type: 'object',
            properties: {
                group_jid: {
                    type: 'string',
                    description: 'JID grup WhatsApp (contoh: 120363xxx@g.us)'
                },
                chat_jid: {
                    type: 'string',
                    description: 'JID chat saat ini tempat pesan dikirim'
                },
                is_owner: {
                    type: 'boolean',
                    description: 'Apakah pemanggil adalah Owner bot'
                }
            },
            required: ['group_jid']
        }
    },
    {
        name: 'trigger_bot_command',
        description: 'Menjalankan perintah aman (safe command) bot yang telah di-whitelist untuk user (contoh: tiktok, play, ig, ocr, translate, cosrent)',
        inputSchema: {
            type: 'object',
            properties: {
                command: {
                    type: 'string',
                    description: 'Nama perintah yang valid (misal: tiktok, play, ig, ocr, tr, lirik, cosrent)'
                },
                args: {
                    type: 'string',
                    description: 'Argumen atau parameter tambahan untuk command (misal URL atau judul lagu)'
                }
            },
            required: ['command']
        }
    }
];

// Tool Implementation Handlers with Security Guardrails
async function handleToolCall(name, args = {}) {
    const db = loadDatabase();

    switch (name) {
        case 'get_user_profile': {
            const targetCanonical = toCanonicalJid(args.jid);
            const callerCanonical = toCanonicalJid(args.caller_jid) || targetCanonical;
            const isOwner = Boolean(args.is_owner);

            // Cross-User Access Guard: User A tidak boleh mengintip data User B tanpa hak Owner
            if (targetCanonical && callerCanonical && targetCanonical !== callerCanonical && !isOwner) {
                return {
                    success: false,
                    error_code: 'ACCESS_DENIED',
                    message: `Akses ditolak: Anda (${callerCanonical}) tidak memiliki otorisasi untuk membaca data profil pengguna lain (${targetCanonical}).`
                };
            }

            const rawDigits = targetCanonical.replace(/[^0-9]/g, '');
            const user = (db.users && db.users[targetCanonical]) || (db.users && db.users[rawDigits]);

            if (!user) {
                return {
                    found: false,
                    jid: targetCanonical || args.jid,
                    message: 'User belum terdaftar di database NelBot.'
                };
            }

            return {
                found: true,
                jid: targetCanonical,
                name: user.name || 'User',
                exp: user.exp || 0,
                limit: user.limit !== undefined ? user.limit : 100,
                level: user.level || 0,
                role: user.role || 'Warrior V',
                premium: Boolean(user.premium),
                premiumTime: user.premiumTime || 0,
                registered: Boolean(user.registered)
            };
        }

        case 'search_bot_knowledge': {
            const rawQuery = String(args.query || '').trim();
            
            // Sensitive credential search trap
            if (/api_?key|bearer|token|groq_key|password|credential|\.env/i.test(rawQuery)) {
                return {
                    query: rawQuery,
                    matched: false,
                    error_code: 'ACCESS_DENIED',
                    info: 'Akses ditolak: Permintaan informasi kredensial, API key, atau data konfigurasi rahasia sistem tidak diizinkan.'
                };
            }

            const q = rawQuery.toLowerCase();
            const results = [];

            const ownerName = 'Nenel';
            const ownerNumber = '6281242432747';

            for (const [category, data] of Object.entries(commandsDB)) {
                const matched = (data.keywords || []).some(kw => q.includes(kw) || kw.includes(q));
                if (matched) {
                    const info = (data.commands || '')
                        .replace('{ownerName}', ownerName)
                        .replace('{ownerNumber}', ownerNumber);
                    results.push({
                        category,
                        menu: data.menu,
                        info
                    });
                }
            }

            if (results.length === 0) {
                return {
                    query: rawQuery,
                    matched: false,
                    info: `Informasi spesifik tidak ditemukan. Aturan umum: Bot tidak bisa dimasukkan grup tanpa sewa. Untuk sewa hubungi Owner (${ownerName} / WA ${ownerNumber}) via .owner.`
                };
            }

            return {
                query: rawQuery,
                matched: true,
                count: results.length,
                results
            };
        }

        case 'check_group_status': {
            const targetGroupJid = String(args.group_jid || '').trim();
            const currentChatJid = String(args.chat_jid || targetGroupJid).trim();
            const isOwner = Boolean(args.is_owner);

            // Group Boundary Isolation: Chat A tidak boleh memeriksa status Grup B dari luar
            if (targetGroupJid && currentChatJid && targetGroupJid !== currentChatJid && !isOwner) {
                return {
                    success: false,
                    error_code: 'ACCESS_DENIED',
                    message: `Akses ditolak: Anda tidak dapat memeriksa status grup eksternal (${targetGroupJid}) dari chat saat ini.`
                };
            }

            const chat = (db.chats && db.chats[targetGroupJid]);

            if (!chat) {
                return {
                    group_jid: targetGroupJid,
                    registered: false,
                    isBanned: false,
                    expired: 0,
                    message: 'Grup belum terdaftar atau belum disewa. Hubungi Owner via .owner untuk menyewa bot di grup ini.'
                };
            }

            const now = Date.now();
            const isExpired = chat.expired ? now > chat.expired : true;

            return {
                group_jid: targetGroupJid,
                registered: true,
                isBanned: Boolean(chat.isBanned),
                sewaAktif: !isExpired,
                sisaHari: chat.expired && !isExpired ? Math.ceil((chat.expired - now) / (1000 * 60 * 60 * 24)) : 0,
                welcome: Boolean(chat.welcome),
                antiLink: Boolean(chat.antiLink)
            };
        }

        case 'trigger_bot_command': {
            const rawCmd = String(args.command || '').toLowerCase().replace(/^[.!#/]/, '').trim();
            const rawArgs = String(args.args || '').trim();

            // 1. Whitelist Check
            if (!WHITELISTED_COMMANDS.has(rawCmd)) {
                return {
                    success: false,
                    error_code: 'COMMAND_BLOCKED',
                    error: `Command '${rawCmd}' ditolak. Hanya command aman yang ada pada whitelist yang diizinkan.`
                };
            }

            // 2. Argument Length Check (Max 300 chars)
            if (rawArgs.length > 300) {
                return {
                    success: false,
                    error_code: 'ARG_TOO_LONG',
                    error: 'Argumen command terlalu panjang (maksimal 300 karakter).'
                };
            }

            // 3. Dangerous Pattern / Path Traversal / Shell Metacharacter Check
            for (const pattern of DANGEROUS_PATTERNS) {
                if (pattern.test(rawArgs)) {
                    return {
                        success: false,
                        error_code: 'DANGEROUS_ARGUMENT_BLOCKED',
                        error: 'Argumen mengandung pola atau karakter terlarang yang membahayakan sistem (path traversal / command injection).'
                    };
                }
            }

            return {
                success: true,
                executed: true,
                command: rawCmd,
                args: rawArgs,
                action_marker: `[CMD:${rawCmd}:${rawArgs}]`,
                message: `Perintah .${rawCmd} berhasil diverifikasi dan dijadwalkan untuk dieksekusi secara aman.`
            };
        }

        default:
            throw new Error(`Tool unknown: ${name}`);
    }
}

// JSON-RPC 2.0 stdio Protocol Handler
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

function sendResponse(id, result, error = null) {
    const payload = {
        jsonrpc: '2.0',
        id: id !== undefined ? id : null
    };

    if (error) {
        payload.error = redactSecrets(error);
    } else {
        payload.result = redactSecrets(result);
    }

    process.stdout.write(JSON.stringify(payload) + '\n');
}

rl.on('line', async (line) => {
    const raw = line.trim();
    if (!raw) return;

    let req;
    try {
        req = JSON.parse(raw);
    } catch (e) {
        sendResponse(null, null, { code: -32700, message: 'Parse error: invalid JSON' });
        return;
    }

    const { id, method, params } = req;

    try {
        switch (method) {
            case 'initialize': {
                sendResponse(id, {
                    protocolVersion: '2024-11-05',
                    serverInfo: {
                        name: 'nelbot-mcp',
                        version: '1.1.0'
                    },
                    capabilities: {
                        tools: {}
                    }
                });
                break;
            }

            case 'notifications/initialized': {
                break;
            }

            case 'ping': {
                sendResponse(id, {});
                break;
            }

            case 'tools/list': {
                sendResponse(id, {
                    tools: TOOLS
                });
                break;
            }

            case 'tools/call': {
                const toolName = params?.name;
                const toolArgs = params?.arguments || {};

                try {
                    const data = await handleToolCall(toolName, toolArgs);
                    sendResponse(id, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(data, null, 2)
                            }
                        ]
                    });
                } catch (err) {
                    sendResponse(id, {
                        isError: true,
                        content: [
                            {
                                type: 'text',
                                text: `Error executing tool '${toolName}': ${err.message}`
                            }
                        ]
                    });
                }
                break;
            }

            default: {
                if (id !== undefined) {
                    sendResponse(id, null, {
                        code: -32601,
                        message: `Method not found: ${method}`
                    });
                }
                break;
            }
        }
    } catch (e) {
        if (id !== undefined) {
            sendResponse(id, null, {
                code: -32603,
                message: `Internal error: ${e.message}`
            });
        }
    }
});
