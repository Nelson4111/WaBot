import { GroqProvider } from './GroqProvider.js';
import { PollinationsProvider } from './PollinationsProvider.js';
import dotenv from 'dotenv';
dotenv.config();

export class ModelManager {
    constructor() {
        this.providers = [];
        this.initProviders();
    }

    initProviders() {
        // Kumpulkan semua GROQ keys dari environment dengan berbagai format yang umum
        const rawKeys = [];

        // 1. Format single key: GROQ_API_KEY / GROQ_KEY
        if (process.env.GROQ_API_KEY) rawKeys.push(process.env.GROQ_API_KEY);
        if (process.env.GROQ_KEY) rawKeys.push(process.env.GROQ_KEY);

        // 2. Format multi-key bernomor: GROQ_KEY_1 s/d 10 & GROQ_API_KEY_1 s/d 10
        for (let i = 1; i <= 10; i++) {
            const k1 = process.env[`GROQ_KEY_${i}`];
            const k2 = process.env[`GROQ_API_KEY_${i}`];
            if (k1) rawKeys.push(k1);
            if (k2) rawKeys.push(k2);
        }

        // 3. Format comma-separated: GROQ_KEYS=gsk_xxx,gsk_yyy
        if (process.env.GROQ_KEYS) {
            const splitKeys = process.env.GROQ_KEYS.split(',').map(k => k.trim());
            rawKeys.push(...splitKeys);
        }

        // Deduplikasi dan bersihkan key kosong
        const groqKeys = [...new Set(rawKeys.map(k => (typeof k === 'string' ? k.trim() : '')).filter(Boolean))];

        const models = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

        if (groqKeys.length > 0) {
            const groqProvider = new GroqProvider(groqKeys, models);
            this.providers.push(groqProvider);
            console.log(`[ModelManager] Initialized GroqProvider with ${groqKeys.length} key(s) in pool.`);
        } else {
            console.warn('[ModelManager] No Groq API keys found in .env. Will rely on fallback providers.');
        }

        // Always push Pollinations as a fallback
        this.providers.push(new PollinationsProvider());
    }

    async generate(messages, maxTokens = 300) {
        let lastError = null;
        for (const provider of this.providers) {
            try {
                const response = await provider.generateResponse(messages, maxTokens);
                if (response) return response;
            } catch (e) {
                lastError = e;
                console.log(`[ModelManager] ${provider.name} failed (${e.message}), falling back to next provider...`);
                continue;
            }
        }

        console.error('[ModelManager] All providers failed. Last error:', lastError?.message || lastError);
        return "Aduh maaf banget, server AI-ku lagi agak sibuk nih. Coba tanya lagi ya sebentar lagi 🙏";
    }

    /**
     * Mendapatkan status pool Groq untuk diagnostik
     */
    getGroqStatus() {
        const groq = this.providers.find(p => p.name === 'Groq');
        return groq ? groq.getPoolStatus() : [];
    }
}
