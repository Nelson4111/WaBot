import { createHash } from 'crypto'
let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
    user.registered = true
    user.name = user.name || m.name
    user.regTime = user.regTime > 0 ? user.regTime : +new Date()
    let sn = createHash('md5').update(m.sender).digest('hex')
    return conn.reply(m.chat, `✅ Akun kamu sudah aktif otomatis.\n\nDaftar manual tidak wajib lagi.\nSN: ${sn}`, m)
}

handler.help = ['@verify']
handler.tags = ['main']
handler.customPrefix = /^(@verify)$/i
handler.command = new RegExp

export default handler
