/**
 * Mini-Game Selingkuh Rahasia Plugin
 * Simulasi drama asmara rahasia dengan berbagai skenario lucu
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, command }) => {
  const target = m.mentionedJid?.[0]
  if (!target) {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai orang yang ingin diajak bersandiwara selingkuh!\n> Contoh: *${usedPrefix + command} @tag*\n*╰───────────────*`)
  }

  const senderJid = conn.decodeJid(m.sender)
  const senderNum = senderJid.split('@')[0].replace(/\D/g, '')
  const targetNum = target.split('@')[0].replace(/\D/g, '')

  const statusList = [
    'Berhasil menyusun rencana rahasia tanpa dicurigai siapapun.',
    'Tertangkap basah oleh pasangan sah! Terkena teguran keras di tempat.',
    'Sosok yang kamu dekati ternyata kerabat dekat pasangan sahmu! Situasi menjadi canggung.',
    'Rahasia terbongkar seketika dan langsung menerima tuntutan perpisahan.',
    'Rencana gagal total karena kamu justru salah mengirim pesan ke nomor pasangan sahmu sendiri.'
  ]

  const status = statusList[Math.floor(Math.random() * statusList.length)]

  const txt = `*──  ୨୧ ✧ DRAMA ASMARA RAHASIA ✧ ୨୧  ──*

*╭  〔 ◈ ꜱ ᴇ ʟ ɪ ɴ ɢ ᴋ ᴜ ʜ 〕*
*┆* ⟡ ᴘᴇʟᴀᴋᴜ   : @${senderNum}
*┆* ✧ ᴛᴀʀɢᴇᴛ   : @${targetNum}
*┆* ✦ ʜᴀꜱɪʟ    : ${status}
*╰───────────────*

> ｡˚ ⊹ _Kesetiaan adalah mahkota tertinggi dalam sebuah hubungan_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, {
    text: txt,
    mentions: [senderJid, target]
  }, { quoted: m })
}

handler.help = ['selingkuh @user']
handler.tags = ['pasangan']
handler.command = /^(selingkuh)$/i

export default handler
