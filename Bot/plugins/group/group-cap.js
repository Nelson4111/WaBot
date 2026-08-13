import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
    global.db.data.caps = global.db.data.caps || {}
    let db = global.db.data.caps

    if (command === 'cap') {
        if (!isOwner && !isAdmin) return conn.sendMessage(m.chat, { text: '❌ Hanya owner/admin yang bisa menggunakan ini!' }, { quoted: m })
        
        let who
        if (m.quoted) {
            who = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            who = m.mentionedJid[0]
        } else if (text) {
            let mnd = text.split(' ')[0].replace(/[^0-9]/g, '')
            if (mnd.length > 5) {
                who = mnd + '@s.whatsapp.net'
            }
        }

        if (!who) return conn.sendMessage(m.chat, { text: `❌ Tag user, reply pesan, atau ketik nomornya!\nContoh: ${usedPrefix + command} 628xxx si beban` }, { quoted: m })

        let capText
        if (m.quoted) {
            capText = text
        } else {
            capText = text.replace(/@[\d]+/g, '').replace(/[0-9]{10,15}/, '').trim()
        }

        if (!capText) return conn.sendMessage(m.chat, { text: '❌ Teks cap tidak boleh kosong!' }, { quoted: m })

        db[who] = { text: capText, lastSeen: 0 }
        
        conn.sendMessage(m.chat, { 
            text: `✅ Berhasil mencap @${who.split('@')[0]} sebagai:\n"${capText}"`, 
            mentions: [who] 
        }, { quoted: m })
    }

    if (command === 'uncap') {
        if (!isOwner && !isAdmin) return conn.sendMessage(m.chat, { text: '❌ Hanya owner/admin yang bisa menggunakan ini!' }, { quoted: m })
        
        let who
        if (m.quoted) {
            who = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            who = m.mentionedJid[0]
        } else if (text) {
            let mnd = text.replace(/[^0-9]/g, '')
            who = mnd + '@s.whatsapp.net'
        }

        if (!who || !db[who]) return conn.sendMessage(m.chat, { text: '❌ User tidak ditemukan di daftar cap.' }, { quoted: m })
        
        delete db[who]
        conn.sendMessage(m.chat, { text: `✅ Berhasil menghapus cap dari @${who.split('@')[0]}` }, { quoted: m })
    }

    if (command === 'listcap') {
        let list = Object.keys(db)
        if (list.length === 0) return conn.sendMessage(m.chat, { text: '📂 Belum ada daftar orang yang dicap.' }, { quoted: m })

        let txt = `📋 *DAFTAR ORANG DICAP*\n\n`
        list.forEach((v, i) => {
            txt += `${i + 1}. @${v.split('@')[0]} : _${db[v].text}_\n`
        })
        
        conn.sendMessage(m.chat, { text: txt, mentions: list }, { quoted: m })
    }
}

handler.help = ['cap', 'uncap', 'listcap']
handler.tags = ['owner','group']
handler.command = /^(cap|uncap|listcap)$/i
handler.group = true

export default handler