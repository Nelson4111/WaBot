let handler = async (m, { conn }) => {
  if (!global.owner || global.owner.length === 0) return m.reply('❌ Belum ada owner terdaftar.');
  
  await conn.sendMessage(m.chat, { react: { text: "👑", key: m.key } });

  let contacts = [];
  let caption = `👑 *DEVELOPER / OWNER LIST*\n\nBerikut adalah kontak owner bot yang resmi:\n\n`;

  for (let [number, name, isDev] of global.owner) {
    let cleanNumber = number.replace(/[^0-9]/g, '');
    let jid = cleanNumber + '@s.whatsapp.net';
    let ownerName = name || global.author || 'Owner';

    caption += `• *Nama:* ${ownerName}\n`;
    caption += `• *Nomor:* +${cleanNumber}\n`;
    caption += `• *Role:* ${isDev ? 'Developer Utama' : 'Admin Owner'}\n`;
    caption += `• *Wa:* https://wa.me/${cleanNumber}\n\n`;

    contacts.push({
      displayName: ownerName,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${ownerName};;;\nFN:${ownerName}\nORG:${global.namebot || 'NelBot-MD'}\nTITLE:Developer\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`
    });
  }

  caption += `_Silakan hubungi owner jika ada kendala atau keperluan penting._`;

  // Kirim vCard Kontak
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: `${contacts.length} Owner`,
      contacts: contacts
    }
  }, { quoted: m });

  // Kirim Pesan Detail
  if (global.ftoko) {
    await conn.sendMessage(m.chat, { text: caption }, { quoted: global.ftoko });
  } else {
    await conn.reply(m.chat, caption, m);
  }
};

handler.help = ['listowner', 'owner'];
handler.tags = ['owner'];
handler.command = /^(listowner|owner)$/i;

export default handler;