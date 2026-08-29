/**
 * LongTermMemory.js — NelBot-MD Memory System v2
 *
 * Prinsip: STORE MORE, SEND LESS.
 *   - Simpan fakta penting per user (global.db.data.users[m.sender].aiMemory)
 *   - Kategori: preference > context > interest > topic
 *   - Confidence score: hanya simpan fakta >= 0.60
 *   - Status: active / superseded (untuk preferensi yang berubah)
 *   - Deduplikasi cerdas (update timestamp alih-alih duplikasi)
 *   - Heuristic extraction (zero API cost / tanpa LLM call tambahan)
 *   - Max 20 facts per user dengan prioritas pruning
 *   - Backward compatible migration dari aiProfile lama
 */

const MAX_FACTS_PER_USER = 20;

export class LongTermMemory {

    // ─── Memory Store Access & Migration ─────────────────────────────────────

    getMemory(m) {
        const sender = m.sender;
        const db = global.db?.data;
        if (!db) return { facts: [], lastExtraction: Date.now() };

        if (!db.users) db.users = {};
        if (!db.users[sender]) db.users[sender] = {};

        const user = db.users[sender];

        // Inisialisasi atau migrasi dari versi lama
        if (!user.aiMemory) {
            user.aiMemory = this._migrateOldProfile(user);
        }

        // Pastikan array facts selalu tersedia
        if (!Array.isArray(user.aiMemory.facts)) {
            user.aiMemory.facts = [];
        }

        return user.aiMemory;
    }

    _migrateOldProfile(user) {
        const now = Date.now();
        const initialMemory = {
            facts: [],
            lastExtraction: now,
            version: 2
        };

        const oldProfile = user.aiProfile;
        if (oldProfile) {
            // Migrasi nama jika bukan default 'Teman'
            if (oldProfile.nickname && oldProfile.nickname !== 'Teman' && oldProfile.nickname !== user.name) {
                initialMemory.facts.push({
                    text: `User lebih suka dipanggil '${oldProfile.nickname}'`,
                    category: 'preference',
                    confidence: 0.95,
                    status: 'active',
                    ts: now
                });
            }

            // Migrasi preferences lama jika ada
            if (Array.isArray(oldProfile.preferences)) {
                for (const pref of oldProfile.preferences) {
                    if (pref && typeof pref === 'string') {
                        initialMemory.facts.push({
                            text: pref.trim(),
                            category: 'preference',
                            confidence: 0.85,
                            status: 'active',
                            ts: now
                        });
                    }
                }
            }

            delete user.aiProfile; // Bersihkan profile lama
            console.log(`[LongTermMemory] Migrated aiProfile to aiMemory v2 for user ${user.name || 'User'}`);
        }

        return initialMemory;
    }

    // ─── Fact Management ──────────────────────────────────────────────────────

    /**
     * Tambah fakta baru dengan validasi confidence, deduplikasi, dan status update.
     */
    addFact(m, { text, category = 'topic', confidence = 0.80, status = 'active' }) {
        if (!text || confidence < 0.60) return false;

        const memory = this.getMemory(m);
        const cleanText = text.trim();
        const now = Date.now();

        // 1. Cek apakah fakta sudah ada (Deduplikasi)
        const existingExact = memory.facts.find(f => 
            f.text.toLowerCase() === cleanText.toLowerCase() && f.status === 'active'
        );

        if (existingExact) {
            existingExact.ts = now;
            existingExact.confidence = Math.max(existingExact.confidence, confidence);
            return true;
        }

        // 2. Cek apakah ini preferensi baru yang menggantikan preferensi lama (Superseding)
        if (category === 'preference') {
            this._handleSupersedingPreference(memory.facts, cleanText);
        }

        // 3. Tambahkan fakta baru
        memory.facts.push({
            text: cleanText,
            category,
            confidence: Math.min(1.0, confidence),
            status,
            ts: now
        });

        // 4. Pruning jika melebihi batas
        if (memory.facts.length > MAX_FACTS_PER_USER) {
            this._pruneFacts(memory.facts);
        }

        return true;
    }

    /**
     * Jika ada preferensi baru seperti panggilan nama, tandai yang lama sebagai superseded
     */
    _handleSupersedingPreference(facts, newText) {
        const lowerNew = newText.toLowerCase();

        // Kasus perubahan panggilan nama: "panggil aku X" / "lebih suka dipanggil X"
        if (lowerNew.includes('dipanggil') || lowerNew.includes('panggilan')) {
            for (const fact of facts) {
                if (fact.category === 'preference' && 
                    (fact.text.toLowerCase().includes('dipanggil') || fact.text.toLowerCase().includes('panggilan'))) {
                    fact.status = 'superseded';
                }
            }
        }
    }

    /**
     * Pruning fakta jika melebihi MAX_FACTS_PER_USER (20).
     * Urutan prioritas penghapusan:
     * 1. Status 'superseded' (dihapus pertama)
     * 2. Kategori 'topic'
     * 3. Kategori 'interest'
     * 4. Kategori 'context'
     * 5. Kategori 'preference' (paling dipertahankan)
     */
    _pruneFacts(facts) {
        // Hapus superseded dulu
        const supersededIdx = facts.findIndex(f => f.status === 'superseded');
        if (supersededIdx !== -1) {
            facts.splice(supersededIdx, 1);
            return;
        }

        const categoryPriority = {
            topic: 1,
            interest: 2,
            context: 3,
            preference: 4
        };

        // Urutkan berdasarkan priority terendah lalu timestamp terlama
        facts.sort((a, b) => {
            const prioA = categoryPriority[a.category] || 1;
            const prioB = categoryPriority[b.category] || 1;
            if (prioA !== prioB) return prioA - prioB;
            return a.ts - b.ts;
        });

        // Hapus yang paling tidak prioritas (elemen pertama)
        facts.shift();
    }

    // ─── Heuristic Fact Extraction (Zero API Call) ───────────────────────────

    /**
     * Ekstrak fakta secara otomatis dari pesan user dan assistant.
     * Dijalankan secara berkala atau ketika pesan mengandung trigger kata kunci.
     */
    extractFromInteraction(m, userText, assistantText) {
        if (!userText || typeof userText !== 'string') return;

        const lower = userText.toLowerCase().trim();

        // 1. Trigger: Nama panggilan ("panggil aku X", "panggil saya X", "namaku X", "nama saya X")
        const callMatch = lower.match(/(?:panggil(?:\s+aku|\s+saya)?|namaku|nama\s+saya)\s+([a-zA-Z0-9_\s]{2,15})/i);
        if (callMatch && !lower.includes('siapa') && !lower.includes('apa')) {
            const name = callMatch[1].trim().split(/\s+/)[0]; // Ambil 1 kata nama pertama
            if (name && name.length >= 2 && !['bot', 'kamu', 'lu', 'gw', 'dia'].includes(name.toLowerCase())) {
                const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
                this.addFact(m, {
                    text: `User lebih suka dipanggil '${capitalized}'`,
                    category: 'preference',
                    confidence: 0.98
                });
            }
        }

        // 2. Trigger: Hobi / Minat / Musik ("aku suka X", "saya suka dengar X", "lagi suka X")
        if (lower.includes('suka dengar lagu') || lower.includes('suka musik') || lower.includes('hobi musik') || lower.includes('suka nyanyi')) {
            this.addFact(m, {
                text: 'User suka mendengarkan musik',
                category: 'interest',
                confidence: 0.85
            });
        }

        if (lower.includes('suka main game') || lower.includes('hobi main game') || lower.includes('suka ngegame')) {
            this.addFact(m, {
                text: 'User suka bermain game',
                category: 'interest',
                confidence: 0.85
            });
        }

        // 3. Trigger: Pekerjaan / Proyek / Coding ("lagi bikin bot", "lagi develop", "sedang kuliah")
        if (lower.includes('bikin bot') || lower.includes('develop bot') || lower.includes('proyek bot') || lower.includes('coding')) {
            this.addFact(m, {
                text: 'User sedang mengembangkan bot WhatsApp / coding',
                category: 'context',
                confidence: 0.80
            });
        }

        // 4. Trigger: Bahasa / Style ("jangan kaku", "santai aja", "pake bahasa gaul")
        if (lower.includes('jangan kaku') || lower.includes('santai aja ngomongnya') || lower.includes('pake bahasa gaul')) {
            this.addFact(m, {
                text: 'User lebih suka gaya bahasa santai dan gaul',
                category: 'preference',
                confidence: 0.90
            });
        }

        // Update timestamp ekstraksi
        const memory = this.getMemory(m);
        memory.lastExtraction = Date.now();
    }

    // ─── Retrieval for Prompt ────────────────────────────────────────────────

    /**
     * Ambil fakta yang aktif. (Filtering relevansi akan dilakukan oleh ContextBuilder)
     */
    getActiveFacts(m) {
        const memory = this.getMemory(m);
        return (memory.facts || []).filter(f => f.status === 'active');
    }
}
