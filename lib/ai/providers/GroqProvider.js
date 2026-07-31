import fetch from 'node-fetch';

export class GroqProvider {
    constructor(keys, models) {
        this.keys = keys || [];
        this.models = models || ['llama-3.1-8b-instant'];
        this.name = 'Groq';
    }

    async generateResponse(messages, maxTokens = 300) {
        if (!this.keys.length) throw new Error('No Groq API keys available in .env');

        for (let apiKey of this.keys) {
            for (let model of this.models) {
                try {
                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messages,
                            temperature: 0.75,
                            max_tokens: maxTokens
                        })
                    });

                    if (res.ok) {
                        const json = await res.json();
                        const text = json.choices?.[0]?.message?.content?.trim();
                        if (text) return text;
                    }
                } catch (e) {
                    console.error(`Groq error on key ${apiKey.substring(0,8)}... model ${model}:`, e.message);
                }
            }
        }
        
        throw new Error('All Groq keys/models failed');
    }
}
