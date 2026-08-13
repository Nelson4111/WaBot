import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Pastikan database list ada
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.chats[m.chat].list = global.db.data.chats[m.chat].list || {}
  
  if (!text) {
    return m.reply(`Format:\n${usedPrefix + command} <key> | <message>\n\nAtau reply media (gambar/video/audio/sticker) dengan mengetik:\n${usedPrefix + command} <key> [| caption]`)
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
  
  if (!key) return m.reply('❌ Nama command (key) tidak boleh kosong!')
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
    return m.reply(`⚠️ Command *${usedPrefix + key}* adalah command bawaan bot. Silakan gunakan nama command lain agar tidak bentrok.`)
  }
  
  // Cek apakah user reply media
  let q = m.quoted ? m.quoted : null
  let mime = q ? (q.msg || q).mimetype || '' : ''
  
  if (q && mime) {
    m.reply('📥 Sedang mengunduh media, mohon tunggu...')
    let media
    try {
      media = await q.download()
    } catch (e) {
      console.error(e)
      return m.reply('❌ Gagal mengunduh media!')
    }
    
    if (!media) return m.reply('❌ Gagal mengunduh media!')
    
    const dir = './media/list'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    let ext = mime.split('/')[1] || 'bin'
    ext = ext.split(';')[0] // bersihkan codecs
    
    const filename = `${m.chat.split('@')[0]}_${key}.${ext}`
    const filePath = path.join(dir, filename)
    
    // Tulis file ke storage
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
    
    m.reply(`✅ Berhasil menyimpan command kustom *${usedPrefix + key}* dengan media.`)
  } else {
    // Text only
    if (!valText) {
      return m.reply(`Format:\n${usedPrefix + command} <key> | <message>\n\nContoh:\n${usedPrefix + command} pay | Silakan bayar lewat DANA: 08123xxx`)
    }
    
    global.db.data.chats[m.chat].list[key] = {
      type: 'text',
      text: valText
    }
    
    m.reply(`✅ Berhasil menyimpan command kustom *${usedPrefix + key}*.`)
  }
}

handler.help = ['setlist <key> | <message>']
handler.tags = ['group']
handler.command = /^(setlist|addlist|store)$/i
handler.group = true
handler.admin = true

export default handler;
