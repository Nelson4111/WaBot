import { setUserLimit, syncUserLimit } from '../../lib/userLimit.js'

let handler = async m => {
    resetLimit()
    await global.db.write()
    return m.reply('Sukses reset limit semua user ke 100.')
}

handler.help = ['resetlimit']
handler.tags = ['owner']
handler.command = /^(resetlimit)$/i
handler.owner = true

function resetLimit() {
    const minimumLimit = 100
    for (const data of Object.values(global.db.data.users)) {
        setUserLimit(data, Math.max(minimumLimit, syncUserLimit(data)))
    }
}

export default handler
