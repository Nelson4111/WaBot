import fetch from 'node-fetch';

export class PollinationsProvider {
    constructor() {
        this.name = 'Pollinations';
    }

    /**
     * Menghasilkan respon AI menggunakan Pollinations free text API.
     * Menggunakan GET endpoint dengan prompt ringkas & fast timeout (5s).
     */
    async generateResponse(messages, maxTokens = 300) {
        try {
            const userMsg = messages.filter(m => m.role === 'user').pop()?.content || 'halo';
            const cleanUserText = userMsg.replace(/<bot_context>[^<]*<\/bot_context>/gi, '').trim().slice(0, 180);

            // Format prompt ringkas dengan instruksi karakter bot
            const promptText = `Karakter: Kamu bot WhatsApp '${global.namebot || 'NelBot-MD'}', bahasa Indonesia gaul & santai (wkwk, btw). Jawab 1-3 kalimat ringkas. User: ${cleanUserText}`;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000); // 6s fast timeout

            const url = `https://text.pollinations.ai/${encodeURIComponent(promptText)}?seed=${Math.floor(Math.random() * 1000)}`;

            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                signal: controller.signal
            }).finally(() => clearTimeout(timeout));

            if (res.ok) {
                const text = await res.text();
                if (text && text.trim() && !text.includes('502 Bad Gateway') && !text.includes('Payment Required') && !text.includes('Queue full')) {
                    return text.trim();
                }
            }

            throw new Error(`Pollinations returned status ${res.status}`);
        } catch (e) {
            console.error('[PollinationsProvider] Error:', e.message);
            throw new Error('Pollinations provider failed');
        }
    }
}
