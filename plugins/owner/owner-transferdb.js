let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.transferdb = conn.transferdb ? conn.transferdb : {}

    if (!text) return m.reply(`Format: *${usedPrefix + command} nomor_lama|nomor_baru*`)

    let [oldNum, newNum] = text.split('|')
    if (!oldNum || !newNum) return m.reply("Gunakan tanda pemisah |")

    let oldJid = oldNum.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    let newJid = newNum.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    let users = global.db.data.users
    if (!users[oldJid]) return m.reply(`❌ Data nomor *${oldJid.split('@')[0]}* tidak ditemukan.`)

    let d = users[oldJid]
    
    let detail = `
*KONFIRMASI TRANSFER DATABASE*

📝 *Detail User Lama:*
• Nama: ${d.name || 'User'}
• Cash: ${d.money || 0}
• Bank: ${d.bank || 0}
• Limit: ${d.limit || 0}
• Level: ${d.level || 0}
• Premium: ${d.premium ? '✅' : '❌'}

🔄 *Transfer Dari:* @${oldJid.split('@')[0]}
➡️ *Transfer Ke:* @${newJid.split('@')[0]}

Ketik *Y* untuk konfirmasi. Seluruh data user di database utama akan dipindahkan.
`.trim()

    conn.transferdb[m.sender] = {
        oldJid,
        newJid,
        data: { ...users[oldJid] },
        timeout: setTimeout(() => {
            if (conn.transferdb[m.sender]) {
                delete conn.transferdb[m.sender]
                m.reply('Waktu konfirmasi habis.')
            }
        }, 60000)
    }

    conn.reply(m.chat, detail, m, { mentions: [oldJid, newJid] })
}

handler.before = async (m, { conn }) => {
    conn.transferdb = conn.transferdb ? conn.transferdb : {}
    if (!conn.transferdb[m.sender] || !m.text) return
    if (!/^(y|ya|yes)$/i.test(m.text)) return

    let { oldJid, newJid, data, timeout } = conn.transferdb[m.sender]
    
    global.db.data.users[newJid] = data
    delete global.db.data.users[oldJid]
    
    clearTimeout(timeout)
    delete conn.transferdb[m.sender]

    if (global.db && typeof global.db.write === 'function') {
        global.db.write().catch(() => {})
    }

    await m.reply("✅ *Berhasil!* Seluruh database telah dipindahkan.")

    let notif = `*NOTIFIKASI TRANSFER DATABASE*\n\nHalo! Data kamu dari nomor lama (@${oldJid.split('@')[0]}) telah berhasil dipindahkan ke nomor ini.\n\nSilahkan ketik *.me* atau *.profile* untuk memastikan.`
    await conn.sendMessage(newJid, { text: notif, mentions: [oldJid] })
}

handler.help = ['transferdb']
handler.tags = ['owner']
handler.command = /^(transferdb|tfdb|move)$/i
handler.owner = true

export default handler