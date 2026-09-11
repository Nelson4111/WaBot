import { toSmallNum } from '../../lib/style.js'
import { getPasanganHiddenNotice, isPasanganHidden } from '../../lib/pasanganHelper.js'

/**
 * Perceraian Pasangan Plugin
 * Mengakhiri ikatan pernikahan secara sepihak dan membersihkan data hubungan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const senderNum = sender.split('@')[0].replace(/\D/g, '')
  const senderPasangan = users[sender]?.pasangan || []

  if (isPasanganHidden(users[sender] || {})) {
    return m.reply(getPasanganHiddenNotice(senderNum, true))
  }

  if (senderPasangan.length === 0) {
    return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu saat ini berstatus single (tidak memiliki ikatan pernikahan).\n*╰───────────────*')
  }

  let target = m.mentionedJid?.[0]
  if (!target) {
    if (senderPasangan.length === 1) {
      target = senderPasangan[0].jid
    } else {
      const listP = senderPasangan.map((p, i) => `*┆*   ${toSmallNum(i + 1)}. @${p.jid.split('@')[0].replace(/\D/g, '')}`).join('\n')
      return conn.sendMessage(m.chat, {
        text: `*╭  〔 ◈ ᴘ ɪ ʟ ɪ ʜ  ᴘ ᴀ ꜱ ᴀ ɴ ɢ ᴀ ɴ 〕*\n> Tandai pasangan yang ingin kamu ceraikan:\n${listP}\n*╰───────────────*`,
        mentions: senderPasangan.map(p => p.jid)
      }, { quoted: m })
    }
  }

  const pIndex = senderPasangan.findIndex(p => p.jid === target)
  const targetNum = target.split('@')[0].replace(/\D/g, '')

  if (pIndex === -1) {
    return conn.sendMessage(m.chat, {
      text: `*╭  〔 ◈ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> @${targetNum} bukan merupakan pasangan sahmu.\n*╰───────────────*`,
      mentions: [target]
    }, { quoted: m })
  }

  // Hapus ikatan pernikahan dari kedua belah pihak
  users[sender].pasangan.splice(pIndex, 1)
  if (users[target] && users[target].pasangan) {
    const tIndex = users[target].pasangan.findIndex(p => p.jid === sender)
    if (tIndex > -1) users[target].pasangan.splice(tIndex, 1)
  }

  const txt = `*──  ୨୧ ✧ AKTA PERCERAIAN RESMI ✧ ୨୧  ──*

*╭  〔 ◈ ᴘ ᴇ ʀ ᴄ ᴇ ʀ ᴀ ɪ ᴀ ɴ 〕*
*┆* ⟡ ᴘɪʜᴀᴋ 𝟷 : @${senderNum}
*┆* ✧ ᴘɪʜᴀᴋ 𝟸 : @${targetNum}
*┆* ✦ ꜱᴛᴀᴛᴜꜱ  : Ikatan pernikahan telah resmi berakhir
*╰───────────────*

> Setiap perpisahan membawa pelajaran hidup untuk masa depan yang lebih baik ♡`.trim()

  return conn.sendMessage(m.chat, {
    text: txt,
    mentions: [sender, target]
  }, { quoted: m })
}

handler.help = ['cerai [@user]']
handler.tags = ['pasangan']
handler.command = /^(cerai)$/i

export default handler
