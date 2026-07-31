import fetch from 'node-fetch';

export class PollinationsProvider {
    constructor() {
        this.name = 'Pollinations';
    }

    async generateResponse(messages) {
        try {
            // Pollinations text endpoint doesn't support structured messages perfectly yet
            // So we format the chat history into a single prompt string
            const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
            const history = messages.filter(m => m.role !== 'system')
                                    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                                    .join('\n');
            
            const fullPrompt = `${systemPrompt}\n\n${history}\nAssistant:`;

            const res = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?model=openai&system=${encodeURIComponent(systemPrompt)}`);
            if (res.ok) {
                const text = await res.text();
                return text.trim();
            }
            throw new Error(`Pollinations HTTP Error: ${res.status}`);
        } catch (e) {
            console.error('Pollinations error:', e.message);
            throw new Error('Pollinations provider failed');
        }
    }
}
