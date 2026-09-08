import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, args, isBotAdmin, isAdmin, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Fitur ini hanya dapat digunakan di dalam grup!\n*╰───────────────*')
  }
  if (!isAdmin) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
  }
  if (!isBotAdmin) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Bot harus menjadi Administrator terlebih dahulu.\n*╰───────────────*')
  }

  let time = parseInt(args[0])
  let unit = (args[1] || '').toLowerCase()

  if (!time || !unit) {
    return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*
*┆* › *${usedPrefix + command} 10 second*
*┆* › *${usedPrefix + command} 30 minute*
*┆* › *${usedPrefix + command} 2 hour*
*┆* › *${usedPrefix + command} 1 day*
*╰───────────────*`)
  }

  let timer
  let unitName
  switch (unit) {
    case 's':
    case 'second':
    case 'detik':
      timer = time * 1000
      unitName = 'Detik'
      break
    case 'm':
    case 'minute':
    case 'menit':
      timer = time * 60000
      unitName = 'Menit'
      break
    case 'h':
    case 'hour':
    case 'jam':
      timer = time * 3600000
      unitName = 'Jam'
      break
    case 'd':
    case 'day':
    case 'hari':
      timer = time * 86400000
      unitName = 'Hari'
      break
    default:
      return m.reply('*╭  〔 ◈ ᴏ ᴘ ꜱ ɪ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴠ ᴀ ʟ ɪ ᴅ 〕*\n> Pilihan unit waktu: second, minute, hour, atau day.\n*╰───────────────*')
  }

  const startTxt = `*──  ୨୧ ✧ HITUNG MUNDUR BUKA GRUP ✧ ୨୧  ──*

*╭  〔 ⧗ ᴘ ᴇ ɴ ᴊ ᴀ ᴅ ᴡ ᴀ ʟ ᴀ ɴ 〕*
*┆* ⟡ ᴛɪɴᴅᴀᴋᴀɴ : *Membuka Gerbang Grup*
*┆* ✧ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(time)} ${unitName}*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *Menghitung Mundur*
*╰───────────────*`

  m.reply(startTxt)

  setTimeout(async () => {
    try {
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      const doneTxt = `*──  ୨୧ ✧ GERBANG GRUP DIBUKA ✧ ୨୧  ──*

> Hitung mundur telah berakhir ✦
> Gerbang percakapan grup resmi dibuka kembali. Seluruh anggota dapat mengirim pesan.`
      await conn.sendMessage(m.chat, { text: doneTxt })
    } catch (e) {
      console.error('Error in opentime:', e)
    }
  }, timer)
}

handler.help = ['opentime <angka> <unit>']
handler.tags = ['group']
handler.command = /^opentime$/i
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler