import fetch from 'node-fetch';

/**
 * Utility untuk menyamarkan JID/User ID dalam logs (misal: 6281241100804@s.whatsapp.net -> 62812...0804)
 */
function maskJid(jid) {
    if (!jid || typeof jid !== 'string') return 'anonymous';
    const digits = jid.replace(/[^0-9]/g, '');
    if (digits.length <= 6) return '***';
    return `${digits.slice(0, 5)}...${digits.slice(-4)}`;
}

/**
 * HermesBridge.js — NelBot-MD Official Hermes Agent Bridge (Phase C Hardened)
 * 
 * Jembatan komunikasi HTTP antara NelBot-MD (Node.js/Baileys) dan Hermes Agent resmi (Nous Research).
 * - Berkomunikasi via API Gateway: http://127.0.0.1:8642/v1/chat/completions
 * - Mendukung authentication Bearer token dengan timeout protection
 * - Mendukung multi-tenant session key tagging (X-Hermes-Session-Key) terisolasi per chat/user
 * - Memiliki health check caching agar tidak menghambat flow saat gateway offline
 * - Menyediakan structured safe observability tanpa membocorkan data pribadi atau API key
 */
export class HermesBridge {
    constructor(options = {}) {
        this.name = 'HermesAgent';
        this.endpoint = options.endpoint || process.env.HERMES_API_ENDPOINT || 'http://127.0.0.1:8642';
        this.apiKey = options.apiKey || process.env.HERMES_API_KEY || 'hermes_poc_secret_nelbot_2026';
        this.timeoutMs = options.timeoutMs || 25000;
        
        this.lastHealthCheck = 0;
        this.isOnline = false;
        this.healthCheckInterval = 30000; // 30 detik
    }

    /**
     * Memeriksa kesehatan Hermes Gateway (/health)
     */
    async checkHealth() {
        const now = Date.now();
        if (now - this.lastHealthCheck < this.healthCheckInterval && this.isOnline) {
            return this.isOnline;
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            
            const res = await fetch(`${this.endpoint}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                this.isOnline = (data.status === 'ok' && data.platform === 'hermes-agent');
            } else {
                this.isOnline = false;
            }
        } catch (e) {
            this.isOnline = false;
        }

        this.lastHealthCheck = now;
        return this.isOnline;
    }

    /**
     * Mengirim permintaan chat completion ke Hermes Agent
     * 
     * @param {Array<{role: string, content: string}>} messages
     * @param {number} maxTokens
     * @param {object} options
     * @returns {Promise<string>}
     */
    async generateResponse(messages, maxTokens = 300, options = {}) {
        const isHealthy = await this.checkHealth();
        if (!isHealthy) {
            throw new Error(`Hermes Agent gateway is unreachable or offline at ${this.endpoint}`);
        }

        const t0 = Date.now();
        const callerMask = maskJid(options.sender);
        
        // Scope session key strictly to chat + sender to guarantee 100% multi-tenant session isolation
        const chatScope = options.chat ? options.chat.replace(/[^a-zA-Z0-9_-]/g, '_') : 'global';
        const senderScope = options.sender ? options.sender.replace(/[^0-9]/g, '') : 'anon';
        const sessionKey = options.sessionKey || `session_${chatScope}_${senderScope}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Hermes-Session-Key': sessionKey
        };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const res = await fetch(`${this.endpoint}/v1/chat/completions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: 'hermes-agent',
                    messages: messages.map(m => ({
                        role: m.role || 'user',
                        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
                    })),
                    max_tokens: maxTokens
                }),
                signal: controller.signal
            });

            clearTimeout(timer);
            const elapsedMs = Date.now() - t0;

            if (!res.ok) {
                const errorText = await res.text().catch(() => '');
                console.warn(`[HermesBridge] Request failed for ${callerMask} with HTTP ${res.status} (${elapsedMs}ms)`);
                throw new Error(`Hermes HTTP ${res.status}: ${errorText.slice(0, 200)}`);
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content;

            if (!reply) {
                throw new Error('Hermes returned an empty response choice');
            }

            if (data.hermes?.failed) {
                throw new Error(`Hermes agent error: ${data.hermes.error || 'Unknown error'}`);
            }

            console.log(`[HermesBridge] Completed turn for ${callerMask} in ${elapsedMs}ms (Tokens: prompt=${data.usage?.prompt_tokens || 0}, completion=${data.usage?.completion_tokens || 0})`);
            return reply.trim();
        } catch (err) {
            clearTimeout(timer);
            const elapsedMs = Date.now() - t0;
            if (err.name === 'AbortError') {
                console.warn(`[HermesBridge] Request timeout after ${elapsedMs}ms for ${callerMask}`);
                throw new Error(`Hermes request timed out after ${this.timeoutMs}ms`);
            }
            throw err;
        }
    }
}
