import { sendRpgButtons } from '../../lib/rpgActionButtons.js'

let handler = async (m, { conn } = {}) => {
  const botName = global.namebot || 'Avelia'
  const text =
    `╭─❏「 *A V E L I A* 」❏\n` +
    `│ 🤖 *Avelia WA Companion*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `👋 *Halo Semuanya!!*\n` +
    `> ↳ Aku ${botName}, bot asisten aktif milik *'Owner Nenel dan Co-Owner Eza*.\n\n` +
    `> ↳ Ketik *.menu* untuk melihat semua daftar fitur yang tersedia ✨\n\n` +
    `> ↳ Chat *.owner* jika ingin Avelia ada di grup kamu juga ✨\n\n` +
    `👇 *Tekan tombol di bawah untuk membuka menu atau menghubungi owner.*\n\n` +
    `─━━━━━━━━━━━━━━─`

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