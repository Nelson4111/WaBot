let handler = async (m, { conn, text, usedPrefix, command }) => {
  const args = (text || '').split('\n').map(arg => arg.trim())
  const name = args[0]
  const values = args.slice(1).filter(Boolean)

  if (!name) {
    return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴘ ᴏ ʟ ʟ ɪ ɴ ɢ 〕*
> Gunakan baris baru (enter) untuk memisahkan pertanyaan dan opsi pilihan:

*┆* *${usedPrefix + command} Game Favorit*
*┆* Mobile Legends
*┆* Free Fire
*┆* PUBG Mobile
*╰───────────────*`)
  }

  if (values.length < 2) {
    return m.reply(`*╭  〔 ◈ ᴍ ɪ ɴ ɪ ᴍ ᴀ ʟ  ᴏ ᴘ ꜱ ɪ 〕*\n> Berikan minimal 𝟸 pilihan opsi polling!\n> Pisahkan pertanyaan dan tiap opsi dengan baris baru (enter).\n*╰───────────────*`)
  }

  const poll = {
    name: name,
    values: values,
    selectableCount: true
  }

  await conn.sendMessage(m.chat, { poll })
}

handler.help = ['poll <pertanyaan> \\n <opsi1> \\n <opsi2>']
handler.tags = ['group']
handler.command = /^(poll|polling)$/i
handler.group = true

export default handler