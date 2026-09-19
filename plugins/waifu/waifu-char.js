import { searchMALCharacter, loadDB } from '../../lib/waifuHelper.js'

let handler = async (m, { args, conn, usedPrefix, command }) => {
  const q = args.join(' ')
  if (!q) {
    return m.reply(
      `❌ Masukkan *nama karakter* atau *UID MAL*\n\nContoh:\n• ${usedPrefix + command} rem\n• ${usedPrefix + command} 118763`
    )
  }

  const c = await searchMALCharacter(q)
  if (!c) return m.reply('❌ Karakter tidak ditemukan. Coba periksa ejaan nama anime atau gunakan UID.')

  const db = loadDB()
  if (!db.chars) db.chars = {}

  const status = db.chars[c.id]
    ? '❌ Sudah dilamar orang lain'
    : '✅ Tersedia'

  const caption = `
🧩 *${c.nama}*
━━━━━━━━━━━━━━
🆔 UID     : ${c.id}
📌 Status  : ${status}

📖 *Sumber*
AniList / MyAnimeList

💬 Gunakan:
• *${usedPrefix}waifulamar ${c.id}*
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

handler.command = /^(waifuchar|wchar|char)$/i
handler.tags = ['waifu']
handler.help = ['waifuchar <nama|uid>']
handler.register = true

export default handler