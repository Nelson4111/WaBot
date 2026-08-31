let handler = async (m, { conn }) => {
    clearMemory()
    m.reply('🧹 *RAM BERHASIL DIBERSIHKAN* 🧹\n\nCache memori, riwayat chat, dan sampah sistem telah dibuang tanpa perlu restart.')
}

handler.help = ['clearram']
handler.tags = ['owner']
handler.command = /^(clearram)$/i
handler.owner = true

// Auto clear ram setiap 3 jam
handler.all = async function (m) {
    let setting = global.db.data.settings[this.user.jid]
    if (!setting) {
        global.db.data.settings[this.user.jid] = {}
        setting = global.db.data.settings[this.user.jid]
    }
    if (!setting.lastClearRam) setting.lastClearRam = Date.now()
    
    let now = Date.now()
    if (now - setting.lastClearRam > 10800000) { // 3 jam (3 * 60 * 60 * 1000)
        clearMemory()
        setting.lastClearRam = now
        console.log('Success Auto Clear RAM')
    }
}

function clearMemory() {
    // 1. Bersihkan internal MemoryStore Baileys
    if (global.memoryStore) {
        if (global.memoryStore.chats) {
            try { global.memoryStore.chats.clear() } catch (e) { global.memoryStore.chats = {} }
        }
        if (global.memoryStore.messages) {
            for (let jid in global.memoryStore.messages) {
                delete global.memoryStore.messages[jid]
            }
        }
        if (global.memoryStore.contacts) {
            for (let jid in global.memoryStore.contacts) {
                delete global.memoryStore.contacts[jid]
            }
        }
        if (global.memoryStore.presences) {
            for (let jid in global.memoryStore.presences) {
                delete global.memoryStore.presences[jid]
            }
        }
    }

    // 2. Paksa pembersihan RAM tingkat sistem (Node Garbage Collector)
    if (typeof global.gc === 'function') {
        global.gc()
    }
}

export default handler
