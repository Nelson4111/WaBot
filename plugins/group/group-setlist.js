import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.chats[m.chat].list = global.db.data.chats[m.chat].list || {}
  
  if (!text) {
    return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴋ ᴀ ᴛ ᴀ ʟ ᴏ ɢ 〕*
> Simpan pesan teks:
*┆* › *${usedPrefix + command} <kata_kunci> | <pesan>*

> Atau simpan media (gambar/video/audio/stiker):
*┆* Balas media lalu ketik:
*┆* › *${usedPrefix + command} <kata_kunci> [| caption]*
*╰───────────────*`)
  }
  
  let key = ''
  let valText = ''
  if (text.includes('|')) {
    let parts = text.split('|')
    key = parts[0].trim()
    valText = parts.slice(1).join('|').trim()
  } else {
    key = text.trim()
  }
  
  if (!key) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Nama kata kunci (key) tidak boleh kosong!\n*╰───────────────*')
  }
  key = key.toLowerCase()
  
  // Cek apakah key merupakan command bawaan bot
  const allAliases = [...new Set(Object.values(global.plugins || {})
    .filter(plugin => plugin && !plugin.disabled)
    .flatMap(plugin => {
      const aliases = []
      const add = value => {
        if (!value) return
        let cmdName = String(value).trim().split(/\s+/)[0].replace(/^[^\w-]+|[<[\]()>]+$/g, '').toLowerCase()
        if (cmdName && /^[a-z0-9_-]+$/i.test(cmdName)) aliases.push(cmdName)
      }
      if (typeof plugin.command === 'string') add(plugin.command)
      else if (Array.isArray(plugin.command)) {
        for (const cmd of plugin.command) {
          if (cmd instanceof RegExp) {
            let src = cmd.source.replace(/^\^/, '').replace(/\$$/, '')
            src.split('|').forEach(add)
          } else add(cmd)
        }
      } else if (plugin.command instanceof RegExp) {
        let src = plugin.command.source.replace(/^\^/, '').replace(/\$$/, '')
        src.split('|').forEach(add)
      }
      return aliases
    })
  )]
  
  if (allAliases.includes(key)) {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Kata kunci *${usedPrefix + key}* merupakan perintah inti bot.\n> Harap gunakan nama kata kunci lain agar tidak bentrok.\n*╰───────────────*`)
  }
  
  let q = m.quoted ? m.quoted : null
  let mime = q ? (q.msg || q).mimetype || '' : ''
  
  if (q && mime) {
    let media
    try {
      media = await q.download()
    } catch (e) {
      console.error(e)
      return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengunduh media dari pesan yang dibalas.\n*╰───────────────*')
    }
    
    if (!media) return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal membaca berkas media.\n*╰───────────────*')
    
    const dir = './media/list'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    let ext = mime.split('/')[1] || 'bin'
    ext = ext.split(';')[0]
    
    const filename = `${m.chat.split('@')[0]}_${key}.${ext}`
    const filePath = path.join(dir, filename)
    
    fs.writeFileSync(filePath, media)
    
    let isPtt = false
    if (mime.includes('audio')) {
      isPtt = q.ptt || q.msg?.ptt || false
    }
    
    global.db.data.chats[m.chat].list[key] = {
      type: 'media',
      mime: mime,
      filename: filename,
      filePath: `./media/list/${filename}`,
      caption: valText || q.text || '',
      ptt: isPtt
    }
    
    const txt = `*──  ୨୧ ✧ KATALOG BERHASIL DISIMPAN ✧ ୨୧  ──*

*╭  〔 ❖ ʀ ɪ ɴ ᴄ ɪ ᴀ ɴ 〕*
*┆* ⟡ ᴋᴀᴛᴀ ᴋᴜɴᴄɪ : *${usedPrefix + key}*
*┆* ✧ ᴛɪᴘᴇ       : *Media (${mime.split('/')[0]})*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ     : *Tersimpan di Direktori Grup*
*╰───────────────*

> _Ketik *${usedPrefix + key}* untuk menampilkan pesan ini._`.trim()

    return m.reply(txt)
  } else {
    if (!valText) {
      return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴛ ᴇ ᴋ ꜱ 〕*
> Gunakan pemisah vertikal '|' :
> *${usedPrefix + command} ${key} | Teks respon yang ingin disimpan*
*╰───────────────*`)
    }
    
    global.db.data.chats[m.chat].list[key] = {
      type: 'text',
      text: valText
    }
    
    const txt = `*──  ୨୧ ✧ KATALOG BERHASIL DISIMPAN ✧ ୨୧  ──*

*╭  〔 ❖ ʀ ɪ ɴ ᴄ ɪ ᴀ ɴ 〕*
*┆* ⟡ ᴋᴀᴛᴀ ᴋᴜɴᴄɪ : *${usedPrefix + key}*
*┆* ✧ ᴛɪᴘᴇ       : *Teks*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ     : *Tersimpan di Direktori Grup*
*╰───────────────*

> _Ketik *${usedPrefix + key}* untuk menampilkan pesan ini._`.trim()

    return m.reply(txt)
  }
}

handler.help = ['setlist <key> | <message>']
handler.tags = ['group']
handler.command = /^(setlist|addlist|store)$/i
handler.group = true
handler.admin = true

export default handler
