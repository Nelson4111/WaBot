/*
📌 Nama Fitur: Cekidch pake cta_copy
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
*/

const handler = async (m, { text, command }) => {
  if (!text) return m.reply('Masukkan link channel-nya.');
  if (!text.includes('https://whatsapp.com/channel/')) return m.reply('Link tautan tidak valid.');

  try {
    const id = text.split('https://whatsapp.com/channel/')[1];
    const res = await m.conn.newsletterMetadata("invite", id);

    const infoText = `
[ 📢 ]───[ *_INFO • CHANNEL_* ]───✦
╭ 𖥔  *ID:* \`${res.id}\`
│ 𖥔  *Nama:* ${res.name}
│ 𖥔  *Total Pengikut:* ${res.subscribers}
│ 𖥔  *Status:* ${res.state}
╰ 𖥔  *Verified:* ${res.verification === "VERIFIED" ? "Terverifikasi ✓" : "Tidak"}

💡 _Salin ID dengan menekan teks kode di atas._
    `.trim();

    await m.reply(infoText);
  } catch (e) {
    console.error(e);
    m.reply("Gagal mengambil data channel. Pastikan link benar.");
  }
};

handler.help = ['cekidch2 <link>'];
handler.tags = ['tools'];
handler.command = ['cekidch2', 'idch2']

export default handler;