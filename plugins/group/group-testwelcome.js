let handler = async (m, { conn, command, text, isAdmin, isOwner }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Perintah ini hanya dapat digunakan di dalam ruang grup.\n*╰───────────────*')
  }
  if (!isAdmin && !isOwner) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator atau Owner.\n*╰───────────────*')
  }

  let targetUser = m.mentionedJid?.[0] || m.sender
  let isWelcome = /welcome/i.test(command)
  let chat = global.db?.data?.chats?.[m.chat] || {}

  m.reply(`*╭  〔 ⧗ ꜱ ɪ ᴍ ᴜ ʟ ᴀ ꜱ ɪ 〕*\n> Menjalankan simulasi kartu ${isWelcome ? 'Welcome' : 'Goodbye'}...\n*╰───────────────*`)

  try {
    await conn.participantsUpdate({
      id: m.chat,
      participants: [targetUser],
      action: isWelcome ? 'add' : 'remove'
    })
  } catch (e) {
    console.error('[TestWelcome] Error:', e)
  }

  if (isWelcome && !chat.welcome) {
    m.reply(`*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Fitur welcome grup saat ini berstatus *NONAKTIF*.\n> Ketik *.enable welcome* untuk mengaktifkan sambutan otomatis.\n*╰───────────────*`)
  }
}

handler.help = ['teswelcome [@user]', 'tesbye [@user]']
handler.tags = ['group']
handler.command = /^(tes|test)(welcome|bye|leave|goodbye)$/i
handler.group = true
handler.admin = true

export default handler
