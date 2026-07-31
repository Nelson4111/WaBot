let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.isBaileys || !m.chat || !m.sender) return 
    
    let db = global.db.data.caps || {}
    
    if (db[m.sender]) {
        let data = db[m.sender]
        let lastResponse = data.lastSeen || 0
        let now = Date.now()
        let cooldown = 30 * 60 * 1000 // 30 Menit

        if (now - lastResponse > cooldown) {
            let label = data.text
            
            await conn.sendMessage(m.chat, { 
                text: `Heh @${m.sender.split('@')[0]}, inget ya kamu itu: *${label}*`,
                mentions: [m.sender]
            }, { quoted: m })

            // Update waktu terakhir bot merespons
            db[m.sender].lastSeen = now
        }
    }
}

export default handler