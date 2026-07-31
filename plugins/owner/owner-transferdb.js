import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.transferdb = conn.transferdb ? conn.transferdb : {}

    if (!text) return m.reply(`Format: *${usedPrefix + command} nomor_lama|nomor_baru*`)

    let [oldNum, newNum] = text.split('|')
    if (!oldNum || !newNum) return m.reply("Gunakan tanda pemisah |")

    let oldJid = oldNum.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    let newJid = newNum.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    let users = global.db.data.users
    if (!users[oldJid]) return m.reply(`❌ Data nomor *${oldJid.split('@')[0]}* tidak ditemukan.`)

    let waifuPath = './waifu_db.json'
    let waifuDb = { money: {} }
    if (fs.existsSync(waifuPath)) {
        waifuDb = JSON.parse(fs.readFileSync(waifuPath))
    }

    let oldWaifuMoney = waifuDb.money[oldJid] || 0
    let d = users[oldJid]
    
    let detail = `
*KONFIRMASI TRANSFER DATABASE*

📝 *Detail User Lama:*
• Nama: ${d.name || 'User'}
• Balance: ${d.balance || 0}
• Money: ${oldWaifuMoney}
• Limit: ${d.limit || 0}
• Level: ${d.level || 0}
• Premium: ${d.premium ? '✅' : '❌'}

🔄 *Transfer Dari:* @${oldJid.split('@')[0]}
➡️ *Transfer Ke:* @${newJid.split('@')[0]}

Ketik *Y* untuk konfirmasi. Data lama di waifu_db dan database utama akan dipindahkan.
`.trim()

    conn.transferdb[m.sender] = {
        oldJid,
        newJid,
        data: { ...users[oldJid] },
        waifuMoney: oldWaifuMoney,
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

    let { oldJid, newJid, data, waifuMoney, timeout } = conn.transferdb[m.sender]
    
    global.db.data.users[newJid] = data
    delete global.db.data.users[oldJid]
    
    let waifuPath = './waifu_db.json'
    if (fs.existsSync(waifuPath)) {
        let waifuDb = JSON.parse(fs.readFileSync(waifuPath))
        waifuDb.money[newJid] = waifuMoney
        delete waifuDb.money[oldJid]
        fs.writeFileSync(waifuPath, JSON.stringify(waifuDb, null, 2))
    }
    
    clearTimeout(timeout)
    delete conn.transferdb[m.sender]

    await m.reply("✅ *Berhasil!* Seluruh database telah dipindahkan.")

    let notif = `*NOTIFIKASI TRANSFER DATABASE*\n\nHalo! Data kamu dari nomor lama (@${oldJid.split('@')[0]}) telah berhasil dipindahkan ke nomor ini.\n\nSilahkan ketik *.me* atau *.profile* untuk memastikan.`
    await conn.sendMessage(newJid, { text: notif, mentions: [oldJid] })
}

handler.help = ['transferdb']
handler.tags = ['owner']
handler.command = /^(transferdb|tfdb|move)$/i
handler.owner = true

export default handler