/**
 * ShortTermMemory.js — Compatibility Layer (Redirects to RecentMemory)
 * 
 * Silakan gunakan lib/ai/memory/RecentMemory.js untuk implementasi baru.
 */
import { RecentMemory } from './RecentMemory.js';

export class ShortTermMemory extends RecentMemory {
    constructor(maxTokens = 1500) {
        super();
        this.maxTokens = maxTokens;
    }

    getHistory(m) {
        return this.getHistoryForPrompt(m);
    }
}
