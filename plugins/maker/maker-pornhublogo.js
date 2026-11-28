/*
📌 Nama Fitur: Pornhub Logo Generator
🏷️ Type : Plugin ESM
🔗 Sumber API: https://apikey.sazxofficial.web.id
✍️  Convert by ZenzXD
*/

import fetch from 'node-fetch'

const handler = async (m, { conn, args, text, command }) => {
  if (!text || !text.includes('|')) {
    return m.reply(`Masukkan dua teks dipisah dengan "|"\nContoh: *.${command} Zenz|XD*`)
  }

  let [text1, text2] = text.split('|').map(t => t.trim())
  if (!text1 || !text2) return m.reply('Kedua teks harus diisi!')

  try {
    const apiUrl = `https://apikey.sazxofficial.web.id/api/imagecreator/pornhub?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status) return m.reply('Gagal mengambil gambar dari API.')

    await conn.sendMessage(m.chat, {
      image: { url: json.result },
      caption: `✅ *Berhasil membuat logo Pornhub*\n\n• *Text1:* ${text1}\n• *Text2:* ${text2}`,
      contextInfo: {
        externalAdReply: {
          title: "Pornhub Logo Generator",
          body: "Powered By Zenzzz AI - MD",
          thumbnailUrl: json.result,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: json.result
        }
      }
    }, { quoted: m })

  } catch (e) {
    m.reply('Terjadi kesalahan saat memproses permintaan.')
    console.error(e)
  }
}

handler.help = ['phlogo <text1>|<text2>']
handler.tags = ['maker']
handler.command = /^phlogo$/i

handler.desc = 'Membuat gambar grafis kustom efek pornhublogo.'
handler.tutorial = [
  '.phlogo <teks>',
  'Kirim perintah .phlogo disertai teks atau balas gambar yang diinginkan'
]

export default handler