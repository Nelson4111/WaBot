import { searchMALCharacter, loadDB } from '../../lib/waifuHelper.js'

let handler = async (m, { args, conn }) => {
  const q = args.join(' ')
  if (!q) {
    return m.reply(
      '❌ Masukkan *nama karakter* atau *UID MAL*\n\nContoh:\n• .char rem\n• .char 118763'
    )
  }

  const c = await searchMALCharacter(q)
  if (!c) return m.reply('❌ Karakter tidak ditemukan di MyAnimeList')

  const db = loadDB()
  if (!db.chars) db.chars = {}

  const status = db.chars[c.id]
    ? '❌ Sudah dilamar orang lain'
    : '✅ Tersedia'

  const caption = `
🧩 *${c.nama}*
━━━━━━━━━━━━━━
🆔 UID MAL : ${c.id}
📌 Status  : ${status}

📖 *Sumber*
MyAnimeList (MAL)

💬 Gunakan:
• *.lamar ${c.id}*
untuk melamar karakter ini
`.trim()

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

handler.command = /^(char)$/i
handler.tags = ['waifu']
handler.help = ['char <nama|uid>']
handler.register = true

export default handler