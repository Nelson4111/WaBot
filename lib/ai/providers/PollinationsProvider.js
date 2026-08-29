import fetch from 'node-fetch';

export class PollinationsProvider {
    constructor() {
        this.name = 'Pollinations';
    }

    /**
     * Menghasilkan respon AI menggunakan Pollinations.
     * Mengirim system context ringkas agar persona & aturan tetap terjaga saat fallback.
     */
    async generateResponse(messages, maxTokens = 300) {
        try {
            // Filter dan siapkan messages
            const systemMsg = messages.find(m => m.role === 'system')?.content || '';
            const userMsg = messages.filter(m => m.role === 'user').pop()?.content || 'halo';

            // Ambil 4 riwayat percakapan terakhir
            const recentHistory = messages.filter(m => m.role !== 'system').slice(-5);

            // Persona ringkas jika system prompt terlalu panjang
            const compactSystemPrompt = (systemMsg.length > 1500)
                ? `Kamu adalah AI Assistant WhatsApp '${global.namebot || 'NelBot-MD'}'. Santai, ramah, bahasa Indonesia gaul tapi sopan (wkwk, btw). Jawab 2-4 kalimat ringkas. Jika user minta download/stiker/musik, gunakan tag [CMD:command:args] di awal.`
                : systemMsg;

            const payloadMessages = [
                { role: 'system', content: compactSystemPrompt },
                ...recentHistory
            ];

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

            // Coba POST format OpenAI-compatible ke Pollinations
            const res = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                    messages: payloadMessages,
                    model: 'openai',
                    max_tokens: maxTokens,
                    temperature: 0.7
                }),
                signal: controller.signal
            }).finally(() => clearTimeout(timeout));

            if (res.ok) {
                const json = await res.json().catch(() => null);
                const text = json?.choices?.[0]?.message?.content?.trim();
                if (text && !text.includes('502 Bad Gateway') && !text.includes('Payment Required')) {
                    return text;
                }
            }

            // Fallback kedua: GET endpoint dengan prompt ringkas
            const getPrompt = encodeURIComponent(`[Karakter: Santai Indonesia, Bot: ${global.namebot || 'NelBot-MD'}] User: ${userMsg.slice(0, 200)}`);
            const fallbackRes = await fetch(`https://text.pollinations.ai/${getPrompt}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            if (fallbackRes.ok) {
                const rawText = await fallbackRes.text();
                if (rawText && rawText.trim() && !rawText.includes('Bad Gateway')) {
                    return rawText.trim();
                }
            }

            throw new Error(`Pollinations HTTP Error: ${res.status}`);
        } catch (e) {
            console.error('[PollinationsProvider] Error:', e.message);
            throw new Error('Pollinations provider failed');
        }
    }
}
