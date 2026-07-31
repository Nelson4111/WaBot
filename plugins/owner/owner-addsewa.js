import fs from 'fs'
import path from 'path'

const dbPath = './lib/database/sewa.json'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Format Salah!\nContoh: *${usedPrefix + command}* https://chat.whatsapp.com/xxx 30d`)
    
    let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
    let match = text.match(linkRegex)
    
    let args = text.trim().split(/\s+/)
    let timeStr = args[args.length - 1] 
    let timeMatch = timeStr.match(/^(\d+)([dhms])$/i)
    
    if (!match) return m.reply('Link grup tidak ditemukan!')
    if (!timeMatch) return m.reply('Durasi tidak valid! Gunakan format angka + d/h/m/s (Contoh: 30d)')

    let inviteCode = match[1]
    let duration = parseMs(timeStr)

    try {
        let dataGrup = await conn.groupGetInviteInfo(inviteCode).catch(() => {
            throw 'Link tidak valid atau bot telah diblokir.'
        })
        
        let id = dataGrup.id
        await conn.groupAcceptInvite(inviteCode).catch(() => {})

        if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true })
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([], null, 2))
        
        let sewa = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
        let now = Date.now()
        let index = sewa.findIndex(s => s.id === id)

        if (index !== -1) {
            let baseTime = sewa[index].expired > now ? sewa[index].expired : now
            sewa[index].expired = baseTime + duration
        } else {
            sewa.push({ id, expired: now + duration })
            index = sewa.length - 1
        }

        fs.writeFileSync(dbPath, JSON.stringify(sewa, null, 2))

        let expiryDate = new Date(sewa[index].expired).toLocaleString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            dateStyle: 'full',
            timeStyle: 'short'
        })
        
        let caption = `✅ *BERHASIL SEWA*\n\n` +
                      `◦ *Group:* ${dataGrup.subject}\n` +
                      `◦ *ID:* ${id}\n` +
                      `◦ *Durasi:* ${timeStr}\n` +
                      `◦ *Expired:* ${expiryDate} WIB`

        await m.reply(caption)

    } catch (err) {
        return m.reply(typeof err === 'string' ? err : 'Terjadi kesalahan sistem.')
    }
}

handler.help = ['addsewa <link> <durasi>']
handler.tags = ['owner']
handler.command = /^addsewa$/i
handler.rowner = true

export default handler

function parseMs(str) {
    let val = parseInt(str)
    let type = str.replace(/\d/g, '').toLowerCase()
    switch (type) {
        case 'd': return val * 86400000
        case 'h': return val * 3600000
        case 'm': return val * 60000
        case 's': return val * 1000
        default: return 0
    }
}