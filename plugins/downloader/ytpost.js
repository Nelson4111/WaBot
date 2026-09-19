import axios from 'axios'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan URL postingan YouTube!\n> Contoh: *${usedPrefix + command} https://youtube.com/post/...*`))
  }

  await m.reply(status.wait('Sedang mengambil data postingan YouTube...'))

  try {
    const api = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(text)}`
    const res = await axios.get(api, { timeout: 15000 })
    const json = res.data

    if (!json?.status || !json?.data) throw new Error('Postingan YouTube tidak ditemukan atau tautan salah.')

    const { postId, content, images } = json.data

    const caption = `*──  ୨୧ ✧ YOUTUBE POST ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴘ ᴏ ꜱ ᴛ 〕*
*┆* ⟡ ᴘᴏꜱᴛ ɪᴅ : *${postId || '-'}*
*╰───────────────*

> *Konten:*
${content ? content.split('\n').map(l => `> ${l}`).join('\n') : '> (Tidak ada teks)'}`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    if (images && images.length) {
      await conn.sendMessage(m.chat, {
        image: { url: images[0] },
        caption
      }, { quoted: m })

      // Jika ada gambar berikutnya (slide 2 dst), kirim sisanya
      for (let i = 1; i < images.length; i++) {
        await conn.sendMessage(m.chat, {
          image: { url: images[i] },
          caption: `*Slide ${toSmallNum(i + 1)} / ${toSmallNum(images.length)}*`
        }, { quoted: m })
      }
    } else {
      m.reply(caption)
    }

  } catch (e) {
    m.reply(status.error(`Gagal memproses YouTube Post:\n> ${e.message || e}`))
  }
}

handler.help = ['ytpost <link post YouTube>']
handler.tags = ['downloader']
handler.command = /^ytpost$/i
handler.limit = true

export default handler