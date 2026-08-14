import fetch from 'node-fetch';

export class PollinationsProvider {
    constructor() {
        this.name = 'Pollinations';
    }

    async generateResponse(messages) {
        try {
            const userMsg = messages.filter(m => m.role === 'user').pop()?.content || 'halo';
            const cleanText = userMsg.slice(0, 300);

            const randomUa = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20 + 105)}.0.0.0 Safari/537.36`;

            const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(cleanText)}`, {
                headers: {
                    'User-Agent': randomUa,
                    'Referer': 'https://pollinations.ai/',
                    'Accept': '*/*'
                }
            });

            if (res.ok) {
                const text = await res.text();
                if (text && text.trim() && !text.includes('502 Bad Gateway') && !text.includes('Payment Required')) {
                    return text.trim();
                }
            }
            throw new Error(`Pollinations HTTP Error: ${res.status}`);
        } catch (e) {
            console.error('Pollinations error:', e.message);
            throw new Error('Pollinations provider failed');
        }
    }
}
