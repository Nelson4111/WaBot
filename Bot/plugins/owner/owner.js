let handler = async (m, { conn }) => {
  let ownNum = (global.nomorown || '6281241100804').replace(/[^0-9]/g, '')
  let ownName = global.author || 'Nenel'

  await conn.sendMessage(m.chat, { react: { text: "👑", key: m.key } })

  let caption = `👑 *DEVELOPER / OWNER BOT*

• *Nama:* ${ownName}
• *Nomor:* +${ownNum}
• *WhatsApp:* https://wa.me/${ownNum}

_Silakan hubungi owner jika ada kendala atau keperluan penting._`.trim()

  let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;${ownName};;;\nFN:${ownName}\nORG:${global.namebot || 'NelBot-MD'}\nTITLE:Owner & Developer\nTEL;type=CELL;type=VOICE;waid=${ownNum}:+${ownNum}\nEND:VCARD`

  // Kirim vCard Kontak Owner
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: ownName,
      contacts: [{ displayName: ownName, vcard }]
    }
  }, { quoted: m })

  // Kirim Pesan Detail
  await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
}

handler.help = ['owner', 'creator']
handler.tags = ['info', 'owner']
handler.command = /^(owner|creator|listowner)$/i

export default handler