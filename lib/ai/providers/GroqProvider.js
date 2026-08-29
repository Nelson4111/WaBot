import fetch from 'node-fetch';

/**
 * Utility untuk menyamarkan API key agar tidak bocor di logs/console.
 * Contoh: gsk_1234567890abcdef1234 -> gsk_...1234
 */
export function maskApiKey(key) {
    if (!key || typeof key !== 'string') return "missing";
    if (key.length <= 8) return "***";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export class GroqProvider {
    constructor(keys = [], models = []) {
        this.name = 'Groq';
        this.models = models.length ? models : ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound-mini', 'qwen/qwen3.6-27b'];
        
        // Inisialisasi Key Pool dengan status tracking
        const uniqueKeys = [...new Set(keys.map(k => (typeof k === 'string' ? k.trim() : '')).filter(Boolean))];
        this.keyPool = uniqueKeys.map(k => ({
            key: k,
            masked: maskApiKey(k),
            status: 'ACTIVE', // 'ACTIVE' | 'RATE_LIMITED' | 'INVALID' | 'DISABLED'
            cooldownUntil: 0,
            failCount: 0,
            successCount: 0
        }));
    }

    /**
     * Mengambil daftar key yang siap digunakan.
     * Otomatis mengembalikan key RATE_LIMITED ke ACTIVE jika masa cooldown sudah lewat.
     */
    getEligibleKeys() {
        const now = Date.now();
        
        for (const item of this.keyPool) {
            if (item.status === 'RATE_LIMITED' && now >= item.cooldownUntil) {
                item.status = 'ACTIVE';
                item.cooldownUntil = 0;
                console.log(`[GroqProvider] Cooldown expired for key ${item.masked}. Status reset to ACTIVE.`);
            }
        }

        // Ambil key yang berstatus ACTIVE
        const activeKeys = this.keyPool.filter(k => k.status === 'ACTIVE');
        if (activeKeys.length > 0) return activeKeys;

        // Jika semua key sedang RATE_LIMITED, cari yang cooldown-nya paling cepat selesai
        const rateLimitedKeys = this.keyPool.filter(k => k.status === 'RATE_LIMITED');
        if (rateLimitedKeys.length > 0) {
            rateLimitedKeys.sort((a, b) => a.cooldownUntil - b.cooldownUntil);
            return [rateLimitedKeys[0]]; // Coba yang paling cepat pulih
        }

        return [];
    }

    async generateResponse(messages, maxTokens = 300) {
        if (!this.keyPool.length) {
            throw new Error('No Groq API keys configured');
        }

        const eligibleKeys = this.getEligibleKeys();
        if (!eligibleKeys.length) {
            console.warn('[GroqProvider] All Groq keys are currently INVALID or DISABLED.');
            throw new Error('No eligible Groq keys available');
        }

        // Iterasi: Utamakan model tercepat di semua eligible key
        for (const model of this.models) {
            for (const keyItem of eligibleKeys) {
                // Skip jika status key berubah saat loop berlangsung
                if (keyItem.status === 'INVALID' || keyItem.status === 'DISABLED') continue;

                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${keyItem.key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messages,
                            temperature: 0.7,
                            max_tokens: maxTokens
                        }),
                        signal: controller.signal
                    }).finally(() => clearTimeout(timeout));

                    // ── 1. Success (200 OK) ──
                    if (res.ok) {
                        const json = await res.json();
                        const text = json.choices?.[0]?.message?.content?.trim();
                        if (text) {
                            keyItem.status = 'ACTIVE';
                            keyItem.failCount = 0;
                            keyItem.successCount++;
                            return text;
                        }
                    }

                    // ── 2. Error Classification ──
                    const status = res.status;

                    if (status === 401) {
                        // 401 Unauthorized -> Key Revoked / Invalid
                        keyItem.status = 'INVALID';
                        keyItem.failCount++;
                        console.error(`[GroqProvider] Key ${keyItem.masked} is INVALID / REVOKED (401 Unauthorized). Disabling key.`);
                        continue; // Pindah ke key berikutnya
                    }

                    if (status === 403) {
                        // 403 Forbidden -> Access Denied / Disabled
                        keyItem.status = 'DISABLED';
                        keyItem.failCount++;
                        console.error(`[GroqProvider] Key ${keyItem.masked} is DISABLED (403 Forbidden). Disabling key.`);
                        continue; // Pindah ke key berikutnya
                    }

                    if (status === 429) {
                        // 429 Too Many Requests -> Rate Limited
                        // Cek header Retry-After jika ada
                        const retryAfterHeader = res.headers.get('retry-after');
                        let cooldownSeconds = 60; // Default cooldown 60 detik
                        if (retryAfterHeader && !isNaN(parseInt(retryAfterHeader))) {
                            cooldownSeconds = Math.min(300, parseInt(retryAfterHeader));
                        }

                        keyItem.status = 'RATE_LIMITED';
                        keyItem.cooldownUntil = Date.now() + (cooldownSeconds * 1000);
                        keyItem.failCount++;
                        console.warn(`[GroqProvider] Key ${keyItem.masked} hit RATE LIMIT (429). Cooldown for ${cooldownSeconds}s. Switching to backup key...`);
                        continue; // Pindah ke key berikutnya
                    }

                    if (status >= 500) {
                        // 5xx Server Error -> Provider issue
                        console.warn(`[GroqProvider] Groq Server Error (${status}) on key ${keyItem.masked}, model ${model}.`);
                        continue;
                    }

                    if (status === 400) {
                        // 400 Bad Request -> Request payload/format problem, jangan nonaktifkan key
                        const errBody = await res.text().catch(() => '');
                        console.warn(`[GroqProvider] Bad Request (400) on model ${model}: ${errBody.slice(0, 150)}`);
                        continue;
                    }

                } catch (err) {
                    if (err.name === 'AbortError') {
                        console.warn(`[GroqProvider] Request TIMEOUT (8s) on key ${keyItem.masked}, model ${model}.`);
                    } else {
                        console.warn(`[GroqProvider] Network Error on key ${keyItem.masked}: ${err.message}`);
                    }
                    continue;
                }
            }
        }

        throw new Error('All eligible Groq keys and models failed');
    }

    /**
     * Mendapatkan status ringkas key pool untuk monitoring/debug
     */
    getPoolStatus() {
        const now = Date.now();
        return this.keyPool.map(k => ({
            masked: k.masked,
            status: k.status,
            cooldownRemainingSec: k.cooldownUntil > now ? Math.ceil((k.cooldownUntil - now) / 1000) : 0,
            successCount: k.successCount,
            failCount: k.failCount
        }));
    }
}
