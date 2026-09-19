import { searchMALCharacter, loadDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { args, conn, usedPrefix, command }) => {
  const q = args.join(' ')
  if (!q) {
    return m.reply(
      status.warning(`Masukkan *nama karakter* atau *UID MAL*\n> Contoh: *${usedPrefix + command} rem* atau *${usedPrefix + command} 118763*`)
    )
  }

  const c = await searchMALCharacter(q)
  if (!c) return m.reply(status.error('Karakter tidak ditemukan di MyAnimeList. Periksa ejaan nama atau gunakan UID.'))

  const db = loadDB()
  if (!db.chars) db.chars = {}

  const statusText = db.chars[c.id]
    ? 'Sudah Dilamar Ⓛ'
    : 'Tersedia ㋡'

  const caption = `*──  ୨୧ ✧ DETAIL WAIFU ✧ ୨୧  ──*

*╭  〔 𝜚 ᴄ ʜ ᴀ ʀ ᴀ ᴄ ᴛ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${c.nama}*
*┆* ◈ ᴜɪᴅ    : *${toSmallNum(c.id)}*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ : *${statusText}*
*╰───────────────*

> ｡˚ ⊹ *Ketik ${usedPrefix}waifulamar ${c.id} untuk melamar karakter ini* ⊹ ˚ ｡`.trim()

  if (c.image) {
    await conn.sendMessage(
      m.chat,
      {
        image: { url: c.image },
        caption
      },
      { quoted: m }
    )
  } else {
    await m.reply(caption)
  }
}

handler.command = /^(waifuchar|wchar|char)$/i
handler.tags = ['waifu']
handler.help = ['waifuchar <nama|uid>']
handler.register = true

export default handler