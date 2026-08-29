/**
 * CommandExecutor.js — NelBot-MD Memory System v2 (AI Tool Use)
 *
 * Menjembatani aksi AI ke eksekusi plugin Baileys:
 *   - Whitelist validation (hanya command terdaftar di executable_commands.json)
 *   - Strict safety (blokir seluruh command owner, rowner, admin)
 *   - Dynamic plugin matching dari global.plugins
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CommandExecutor {
    constructor() {
        this.whitelist = new Map(); // command/alias -> canonical command name
        this.loadWhitelist();
    }

    loadWhitelist() {
        try {
            const filePath = path.join(__dirname, '../knowledge/executable_commands.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            for (const cmd of (data.commands || [])) {
                this.whitelist.set(cmd.name.toLowerCase(), cmd.name.toLowerCase());
                if (Array.isArray(cmd.aliases)) {
                    for (const alias of cmd.aliases) {
                        this.whitelist.set(alias.toLowerCase(), cmd.name.toLowerCase());
                    }
                }
            }
        } catch (e) {
            console.error('[CommandExecutor] Failed to load executable_commands.json:', e.message);
        }
    }

    /**
     * Mengeksekusi command plugin secara aman.
     *
     * @param {object} conn - Baileys connection instance
     * @param {object} m - Message object
     * @param {string} commandName - Nama command
     * @param {string} argsText - Argumen teks
     */
    async execute(conn, m, commandName, argsText = '') {
        if (!commandName) return { success: false, reason: 'empty_command' };

        const targetCmd = commandName.toLowerCase().trim();

        // 1. Whitelist Check
        if (!this.whitelist.has(targetCmd)) {
            console.warn(`[CommandExecutor] BLOCKED: '${targetCmd}' is not in executable whitelist.`);
            return { success: false, reason: 'not_whitelisted' };
        }

        const canonicalName = this.whitelist.get(targetCmd);

        // 2. Cari plugin di global.plugins
        if (!global.plugins) {
            return { success: false, reason: 'no_plugins_loaded' };
        }

        let targetPlugin = null;
        let pluginKey = null;

        for (const [key, plugin] of Object.entries(global.plugins)) {
            if (!plugin || plugin.disabled) continue;

            const cmd = plugin.command;
            let isMatch = false;

            if (cmd instanceof RegExp) {
                isMatch = cmd.test(canonicalName) || cmd.test(targetCmd);
            } else if (Array.isArray(cmd)) {
                isMatch = cmd.some(c => c instanceof RegExp ? (c.test(canonicalName) || c.test(targetCmd)) : (c === canonicalName || c === targetCmd));
            } else if (typeof cmd === 'string') {
                isMatch = (cmd === canonicalName || cmd === targetCmd);
            }

            if (isMatch) {
                targetPlugin = plugin;
                pluginKey = key;
                break;
            }
        }

        const handlerFn = typeof targetPlugin === 'function' 
            ? targetPlugin 
            : (targetPlugin?.default || (typeof targetPlugin?.call === 'function' ? targetPlugin.call : null));

        if (!targetPlugin || !handlerFn) {
            console.warn(`[CommandExecutor] Plugin handler for '${canonicalName}' not found in global.plugins.`);
            return { success: false, reason: 'plugin_not_found' };
        }

        // 3. Strict Safety Check (Dilarang mengeksekusi fitur Owner / Admin)
        if (targetPlugin.owner || targetPlugin.rowner) {
            console.warn(`[CommandExecutor] SECURITY BLOCK: '${canonicalName}' is an owner-only command.`);
            return { success: false, reason: 'owner_blocked' };
        }

        if (targetPlugin.admin) {
            console.warn(`[CommandExecutor] SECURITY BLOCK: '${canonicalName}' is an admin-only command.`);
            return { success: false, reason: 'admin_blocked' };
        }

        // 4. Bangun payload eksekusi
        const text = argsText ? argsText.trim() : '';
        const args = text.split(/\s+/).filter(Boolean);

        const extra = {
            match: null,
            usedPrefix: '.',
            noPrefix: `${canonicalName} ${text}`.trim(),
            _args: args,
            args: args,
            command: canonicalName,
            text: text,
            conn: conn,
            participants: [],
            groupMetadata: {},
            user: global.db?.data?.users?.[m.sender] || {},
            bot: {},
            isROwner: false,
            isOwner: false,
            isRAdmin: false,
            isAdmin: false,
            isBotAdmin: false,
            isPrems: global.db?.data?.users?.[m.sender]?.premiumTime > 0 || false,
            chatUpdate: {}
        };

        // 5. Eksekusi plugin
        try {
            console.log(`[CommandExecutor] Executing .${canonicalName} with args: "${text}" for ${m.sender}`);
            if (typeof targetPlugin === 'function') {
                await targetPlugin.call(conn, m, extra);
            } else if (typeof targetPlugin.call === 'function') {
                await targetPlugin.call(conn, m, extra);
            }
            return { success: true };
        } catch (error) {
            console.error(`[CommandExecutor] Error executing .${canonicalName}:`, error);
            return { success: false, reason: 'execution_error', error: error.message };
        }
    }
}
