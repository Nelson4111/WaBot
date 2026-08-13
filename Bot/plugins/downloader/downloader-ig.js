import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❗ Contoh:\n${usedPrefix + command} https://www.instagram.com/reel/...`)

  try {
    let api = `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(text)}`
    let { data } = await axios.get(api)

    if (!data.status) throw 'Gagal mengambil data dari API'

    let result = data.result
    let urls = result.url
    if (!urls || urls.length === 0) throw 'Media tidak ditemukan!'

    // Caption metadata
    let caption = `👤 *Username:* ${result.metadata.username}
❤️ *Like:* ${result.metadata.like}
💬 *Comment:* ${result.metadata.comment}
📄 *Caption:* ${result.metadata.caption || "-"}`.trim()

    // Kirim satu per satu (foto/video/story/slide)
    for (let url of urls) {
      // Deteksi media berdasarkan extension
      if (url.includes(".mp4")) {
        await conn.sendMessage(m.chat, {
          video: { url },
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          image: { url },
          caption
        }, { quoted: m })
      }
    }

  } catch (e) {
    console.error(e)
    m.reply('❗ Terjadi kesalahan, coba lagi nanti.')
  }
}

handler.help = ['ig', 'igdl']
handler.tags = ['downloader']
handler.command = /^ig(dl)?$/i
handler.limit = true

export default handler