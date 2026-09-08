import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
  global.db.data.caps = global.db.data.caps || {}
  let db = global.db.data.caps

  if (command === 'cap') {
    if (!isOwner && !isAdmin) {
      return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator atau Owner.\n*╰───────────────*')
    }
    
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

    if (!who) {
      return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai user, balas pesan, atau ketik nomornya!\n> Contoh: *${usedPrefix + command} @user Pemalas*\n*╰───────────────*`)
    }

    let capText
    if (m.quoted) {
      capText = text ? text.trim() : ''
    } else {
      capText = text.replace(/@[\d]+/g, '').replace(/[0-9]{10,15}/, '').trim()
    }

    if (!capText) {
      return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Teks julukan / cap tidak boleh kosong!\n*╰───────────────*')
    }

    who = conn.decodeJid(who)
    db[who] = { text: capText, lastSeen: 0 }
    const whoNum = who.split('@')[0].replace(/\D/g, '')

    const txt = `*──  ୨୧ ✧ PENETAPAN STATUS JULUKAN ✧ ୨୧  ──*

*╭  〔 ◈ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ᴄ ᴀ ᴘ 〕*
*┆* ⟡ ᴛᴀʀɢᴇᴛ   : @${whoNum}
*┆* ✧ ᴊᴜʟᴜᴋᴀɴ  : *${capText}*
*╰───────────────*`

    return conn.sendMessage(m.chat, { text: txt, mentions: [who] }, { quoted: m })
  }

  if (command === 'uncap') {
    if (!isOwner && !isAdmin) {
      return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator atau Owner.\n*╰───────────────*')
    }
    
    let who
    if (m.quoted) {
      who = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid[0]) {
      who = m.mentionedJid[0]
    } else if (text) {
      let mnd = text.replace(/[^0-9]/g, '')
      who = mnd + '@s.whatsapp.net'
    }

    who = conn.decodeJid(who || '')
    if (!who || !db[who]) {
      return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Pengguna tidak ditemukan di dalam daftar julukan.\n*╰───────────────*')
    }
    
    delete db[who]
    const whoNum = who.split('@')[0].replace(/\D/g, '')
    return conn.sendMessage(m.chat, {
      text: `*╭  〔 ❖ ʜ ᴀ ᴘ ᴜ ꜱ  ᴄ ᴀ ᴘ 〕*\n> Berhasil menghapus julukan dari @${whoNum} ✦\n*╰───────────────*`,
      mentions: [who]
    }, { quoted: m })
  }

  if (command === 'listcap') {
    let list = Object.keys(db)
    if (list.length === 0) {
      return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Belum ada daftar anggota yang diberi julukan.\n*╰───────────────*')
    }

    let lines = list.map((v, i) => {
      const num = v.split('@')[0].replace(/\D/g, '')
      return `*┆*   ${toSmallNum(i + 1)}. @${num} › _"${db[v].text}"_`
    })

    const txt = `*──  ୨୧ ✧ DAFTAR JULUKAN ANGGOTA ✧ ୨୧  ──*

*╭  〔 ◈ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴄ ᴀ ᴘ 〕*
${lines.join('\n')}
*╰───────────────*`
    
    return conn.sendMessage(m.chat, { text: txt, mentions: list }, { quoted: m })
  }
}

handler.help = ['cap @user <teks>', 'uncap @user', 'listcap']
handler.tags = ['group']
handler.command = /^(cap|uncap|listcap)$/i
handler.group = true

export default handler