import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Cari apa?\nContoh: *${usedPrefix + command} Alan Walker Faded*`
  await conn.reply(m.chat, global.wait || '⏳ Sedang mencari...', m)

  let results = await yts(text)
  let videos = results.all.filter(v => v.type === 'video') 
  
  if (videos.length === 0) throw 'Video tidak ditemukan!'

  let video = videos[0] 

  let caption = `
🍙 *YOUTUBE SEARCH*

📌 *Judul:* ${video.title}
🔗 *Link:* ${video.url}
🍜 *Durasi:* ${video.timestamp}
🍡 *Views:* ${video.views ? video.views.toLocaleString('id-ID') : '-'}
🍵 *Uploaded:* ${video.ago}

─────────────────
🔻 *Pilih Format Download:*
🎵 *Audio (MP3):*
${usedPrefix}ytmp3 ${video.url}

🎬 *Video (MP4):*
${usedPrefix}ytmp4 ${video.url}
─────────────────
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption: caption
  }, { quoted: m })
}

handler.help = ['yts <query>']
handler.tags = ['tools', 'downloader']
handler.command = /^yts(earch)?$/i
handler.limit = true

export default handler