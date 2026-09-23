import { searchMALCharacter, loadDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { args, conn, usedPrefix, command }) => {
  const q = args.join(' ')
  if (!q) {
    return status.warning(
      m,
      `Masukkan *nama karakter* atau *UID MAL*`,
      `Contoh: *${usedPrefix + command} 220209* atau *${usedPrefix + command} rem*`
    )
  }

  const c = await searchMALCharacter(q)
  if (!c) return status.error(m, 'Karakter tidak ditemukan di MyAnimeList. Periksa ejaan nama atau gunakan UID.')

  const db = loadDB()
  if (!db.chars) db.chars = {}

  const isMine = db.chars[c.id] === m.sender
  const isTaken = !isMine && !!db.chars[c.id]

  let statusText = 'Tersedia ㋡'
  let footerHint = `Ketik *${usedPrefix}waifulamar ${c.id}* untuk melamar karakter ini`
  if (isMine) {
    statusText = 'Pasanganmu ♡'
    footerHint = `Ketik *${usedPrefix}mywaifu* untuk berinteraksi dengan pasanganmu`
  } else if (isTaken) {
    statusText = 'Sudah Dimiliki Ⓛ'
    footerHint = 'Karakter ini sudah memiliki ikatan suci dengan pengembara lain'
  }

  const animeLine = c.anime ? `\n*┆* ❀ ᴀɴɪᴍᴇ  : *${c.anime}*` : ''

  const caption = `*──  ୨୧ ✧ DETAIL WAIFU ✧ ୨୧  ──*

*╭  〔 𝜚 ᴄ ʜ ᴀ ʀ ᴀ ᴄ ᴛ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${c.nama}*${animeLine}
*┆* ◈ ᴜɪᴅ    : *#${toSmallNum(c.id)}*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ : *${statusText}*
*╰───────────────*

> ｡˚ ⊹ *${footerHint}* ⊹ ˚ ｡`.trim()

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

handler.command = /^(waifuchar|wchar|char|husbuchar|hchar)$/i
handler.tags = ['waifu', 'husbu']
handler.help = ['waifuchar <nama|uid>', 'husbuchar <nama|uid>']
handler.register = true

export default handler
