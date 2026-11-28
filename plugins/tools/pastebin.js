/*
📌 Nama Fitur: Get pastebin
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N
🔗 Api : https://fastrestapis.fasturl.cloud
✍️ Convert By ZenzXD

gatau lagi upload apa🗿
*/

import axios from 'axios';

const handler = async (m, { text }) => {
  if (!text) {
    return m.reply('*Format salah Contoh:* .pastebin https://pastebin.com/xxxxxxxx');
  }

  try {
    const apiUrl = `https://fastrestapis.fasturl.cloud/downup/pastebindown?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data || !data.status || !data.result || !data.result.content) {
      return m.reply('Gagal mengambil code nya nih pastikan link bener ama link pastebin nya ga private');
    }

    const pastebinContent = data.result.content.trim();
    if (!pastebinContent) {
      return m.reply('Data Pastebin kosong.');
    }

    m.reply(`📋 *Isi Pastebin:*\n\n${pastebinContent}`);
  } catch (error) {
    console.error(error);
    m.reply('❌ Terjadi kesalahan saat mengambil data.');
  }
};

handler.help = ['pastebin <url>'];
handler.tags = ['internet'];
handler.command = ['pastebin'];

handler.desc = 'Alat utilitas praktis untuk memproses pastebin.'
handler.tutorial = [
  '.pastebin <input>',
  'Ketik .pastebin diikuti input yang diperlukan atau balas pesan target'
]

export default handler;