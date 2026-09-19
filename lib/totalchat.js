function getStore() {
    if (global.db?.data) {
        if (!global.db.data.totalchat || typeof global.db.data.totalchat !== 'object' || Array.isArray(global.db.data.totalchat)) {
            global.db.data.totalchat = (global.db.data.aux_totalchat && typeof global.db.data.aux_totalchat === 'object') ? global.db.data.aux_totalchat : {}
        }
        return global.db.data.totalchat
    }
    return {}
}

export function addChat(chatId, senderId) {
    if (!chatId || !chatId.endsWith('@g.us')) return 
    if (!senderId || senderId.includes(':')) return 

    const store = getStore()
    if (!store[chatId]) store[chatId] = {}
    if (!store[chatId][senderId]) store[chatId][senderId] = 0
    
    store[chatId][senderId] += 1
}

export function getChatData() {
    return getStore()
}

export function saveChatData() {
    if (global.db?.data && typeof global.db.write === 'function') {
        global.db.write().catch(e => {
            console.error('Gagal sinkronisasi totalchat ke Supabase:', e?.message || e)
        })
    }
}
