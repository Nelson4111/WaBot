let handler = async (m, { conn }) => {
  let ownNum = (global.nomorown || '79223679360').replace(/[^0-9]/g, '')
  let ownName = global.author || 'Nenel (Developer)'
  let coownNum = (global.nomorcoown || '').replace(/[^0-9]/g, '')

  await conn.sendMessage(m.chat, { react: { text: "👑", key: m.key } })

  let caption = `👑 *DEVELOPER / OWNER BOT*

• *Nama:* ${ownName}
• *Nomor:* +${ownNum}
• *WhatsApp:* https://wa.me/${ownNum}${coownNum ? `\n\n🤝 *CO-OWNER / ASISTEN*\n• *Nomor:* +${coownNum}\n• *WhatsApp:* https://wa.me/${coownNum}` : ''}

_Silakan hubungi jika ada kendala atau keperluan penting._`.trim()

  let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;${ownName};;;\nFN:${ownName}\nORG:${global.namebot || 'Avelia'}\nTITLE:Owner & Developer\nTEL;type=CELL;type=VOICE;waid=${ownNum}:+${ownNum}\nEND:VCARD`

  let contacts = [{ displayName: ownName, vcard }]
  if (coownNum) {
    let coVcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Co-Owner;;;\nFN:Co-Owner\nORG:${global.namebot || 'Avelia'}\nTITLE:Co-Owner & Assistant\nTEL;type=CELL;type=VOICE;waid=${coownNum}:+${coownNum}\nEND:VCARD`
    contacts.push({ displayName: 'Co-Owner', vcard: coVcard })
  }

  // Kirim vCard Kontak Owner & Co-Owner
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: ownName,
      contacts
    }
  }, { quoted: m })

  // Kirim Pesan Detail
  await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
}

handler.help = ['owner', 'creator']
handler.tags = ['info', 'owner']
handler.command = /^(owner|creator|listowner)$/i

export default handler