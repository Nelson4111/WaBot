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
        // Parse GROQ keys from environment
        const groqKeys = [];
        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GROQ_KEY_${i}`];
            if (key) groqKeys.push(key);
        }

        const models = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'];

        if (groqKeys.length > 0) {
            this.providers.push(new GroqProvider(groqKeys, models));
        }

        // Always push Pollinations as a fallback
        this.providers.push(new PollinationsProvider());
    }

    async generate(messages, maxTokens = 300) {
        let lastError = null;
        for (const provider of this.providers) {
            try {
                // Try to generate response using the current provider
                const response = await provider.generateResponse(messages, maxTokens);
                if (response) return response;
            } catch (e) {
                lastError = e;
                console.log(`[ModelManager] ${provider.name} failed, falling back to next provider...`);
                continue;
            }
        }
        
        console.error('[ModelManager] All providers failed. Last error:', lastError);
        return "Aduh maaf Kak, otakku lagi ngeblank dikit nih. Coba tanya lagi ya hehe 🙏";
    }
}
