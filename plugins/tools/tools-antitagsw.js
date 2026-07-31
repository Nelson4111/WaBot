/*
# Fitur : Anti Tag Status WhatsApp (SW) + Auto Delete
# Type  : Plugins ESM
*/

let handler = async (m, { args, isBotAdmin }) => {
  if (!isBotAdmin) return m.reply('❌ Bot harus jadi admin!')

  let chat = global.db.data.chats[m.chat]
  if (!chat.antitagsw)
    chat.antitagsw = { status: false, count: {} }

  let type = (args[0] || '').toLowerCase()
  if (type === 'on') {
    chat.antitagsw.status = true
    chat.antitagsw.count = {}
    return m.reply('✅ Anti Tag Status + Auto Delete *AKTIF*')
  }
  if (type === 'off') {
    chat.antitagsw.status = false
    chat.antitagsw.count = {}
    return m.reply('❌ Anti Tag Status *NONAKTIF*')
  }

  m.reply(`Contoh:\n.antitagsw on\n.antitagsw off`)
}

handler.all = async function (m) {
  if (!m.isGroup) return
  if (!m.message?.groupStatusMentionMessage) return

  let chat = global.db.data.chats[m.chat]
  let data = chat?.antitagsw
  if (!data?.status) return

  let sender = m.sender
  if (m.isAdmin || m.isOwner) return
  try {
    await this.sendMessage(m.chat, {
      delete: m.key
    })
  } catch {}

  // Hitung pelanggaran
  if (!data.count[sender]) data.count[sender] = 1
  else data.count[sender]++

  // 🚫 Jika 3x → kick
  if (data.count[sender] >= 3) {
    await this.sendMessage(m.chat, {
      text: `🚫 @${sender.split('@')[0]} melanggar Anti Tag Status (3x)\nKamu dikeluarkan.`,
      mentions: [sender]
    })
    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')
    delete data.count[sender]
  } else {
    await this.sendMessage(m.chat, {
      text: `⚠️ @${sender.split('@')[0]}\nDilarang mention Status WhatsApp!\nPeringatan: ${data.count[sender]}/3`,
      mentions: [sender]
    })
  }
}

handler.command = /^antitagsw$/i
handler.help = ['antitagsw on/off']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler