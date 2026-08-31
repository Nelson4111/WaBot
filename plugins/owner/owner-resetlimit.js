let handler = async (m, { conn }) => {
    resetLimit()
    m.reply('Sukses reset limit semua user ke 100.')
}

handler.all = async function (m) {
    let setting = global.db.data.settings[this.user.jid] || {}
    if (!setting.lastReset) setting.lastReset = Date.now()
    
    let now = Date.now()
    if (now - setting.lastReset > 86400000) { // 24 jam
        resetLimit()
        setting.lastReset = now
        console.log('Success Auto Reset Limit')
    }
}

handler.help = ['resetlimit']
handler.tags = ['owner']
handler.command = /^(resetlimit)$/i
handler.owner = true

function resetLimit() {
    let lim = 100
    let users = Object.entries(global.db.data.users)
    users.forEach(([user, data]) => {
        if (data.limit < lim) {
            data.limit = lim
        }
    })
}

export default handler
