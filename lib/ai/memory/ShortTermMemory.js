export class ShortTermMemory {
    constructor(maxTokens = 1500) {
        this.maxTokens = maxTokens;
    }

    // Sangat kasar: 1 kata ~ 1.3 token
    estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.split(/\s+/).length * 1.3);
    }

    getHistory(m) {
        let sessionStore = m.isGroup 
            ? (global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}) 
            : (global.db.data.users[m.sender] = global.db.data.users[m.sender] || {});
        
        if (!sessionStore.aiHistory) sessionStore.aiHistory = [];
        return sessionStore.aiHistory;
    }

    addMessage(m, role, content) {
        let history = this.getHistory(m);
        history.push({ role, content });

        // Optimize: Hitung token dari belakang
        let totalTokens = 0;
        let keepCount = 0;

        for (let i = history.length - 1; i >= 0; i--) {
            totalTokens += this.estimateTokens(history[i].content);
            if (totalTokens > this.maxTokens) break;
            keepCount++;
        }

        // Kalau melebih batas token, potong history yang tertua
        // Batasi juga max 10 pesan untuk jaga-jaga
        if (keepCount < history.length) {
            history.splice(0, history.length - keepCount);
        }
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
    }
}
