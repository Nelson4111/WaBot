import { sendRpgButtons } from '../../lib/rpgActionButtons.js'

let handler = async (m, { conn } = {}) => {
  const botName = global.namebot || 'Avelia'
  const text =
    `╭─❏「 ✨ ${botName.toUpperCase()} 」❏\n` +
    `│ 👋 Hai! Aku ${botName}, asisten WhatsApp yang siap membantu.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Pilih tombol di bawah untuk melihat fitur bot atau menghubungi owner.`

  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    text,
    title: `✨ ${botName}`,
    footer: `${botName} • Siap membantu`,
    buttons: [
      ['📋 Buka Menu', '.menu'],
      ['👑 Hubungi Owner', '.owner']
    ],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.customPrefix = /^(tes|avelia|nelbot|test|bot)$/i
handler.command = new RegExp

export default handler