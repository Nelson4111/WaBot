let handler = async (m, { conn, usedPrefix, command }) => {
  let who = m.quoted?.sender || m.mentionedJid?.[0] || m.sender;
  let name = await conn.getName(who);

  const levelGila = [
    { max: 15, title: 'Waras Banget 😇', desc: 'Masih aman, otaknya masih berfungsional normal 100%.' },
    { max: 35, title: 'Agak Miring 🤪', desc: 'Kalo diajak ngobrol kadang suka nyambung kadang kumat halunya.' },
    { max: 55, title: 'Gila Lucu 🤣', desc: 'Suka ketawa sendiri tanpa alasan di pojokan kamar.' },
    { max: 75, title: 'Gila Akut Level V ⚠️', desc: 'Sering ngajak ngobrol tembok dan kucing tetangga.' },
    { max: 95, title: 'Psikopat Tertawa 🧠⚡', desc: 'Tingkat bahaya tinggi! Jangan biarkan dia sendirian tanpa pengawasan!' },
    { max: 100, title: 'Raja Gila / Sepuh RSJ 👑💀', desc: 'Dah ga bisa diselamatkan lagi, obat dokter pun dah nyerah.' }
  ];

  let percent = Math.floor(Math.random() * 100) + 1;
  let res = levelGila.find(l => percent <= l.max) || levelGila[levelGila.length - 1];

  let caption = `
🧠 *ANALISIS TINGKAT KEGILAIN* 🧠

• *Target:* @${who.split('@')[0]}
• *Tingkat Gila:* *${percent}%*
• *Diagnosa:* *${res.title}*
• *Keterangan:* _${res.desc}_
`.trim();

  if (global.ftoko) {
    await conn.sendMessage(m.chat, { text: caption, mentions: [who] }, { quoted: global.ftoko });
  } else {
    await conn.sendMessage(m.chat, { text: caption, mentions: [who] }, { quoted: m });
  }
};

handler.help = ['cekgila'];
handler.tags = ['fun'];
handler.command = /^(cekgila|gilacek)$/i;

export default handler;
