import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🍭 *Contoh penggunaan: ${usedPrefix + command} everything u are*`)

  await m.react('🍢')

  try {
    let search = await yts(text)
    let videos = search.videos
    if (!Array.isArray(videos) || videos.length === 0) 
      return m.reply(`🍰 *Maaf, tidak dapat menemukan lagu dengan kata "${text}"*`)

    let video = videos[0]

    let title = video.title || '-'
    let duration = video.timestamp || '-'
    let views = video.views ? formatNumber(video.views) : '-'
    let channel = video.author?.name || '-'
    let verified = video.author?.verified ? ' 🥇' : ''
    let uploaded = video.ago || '-'
    let thumbnail = video.thumbnail || ''

    let detail = `
🍙 *Judul: ${title}*
🍜 *Durasi: ${duration}*
🍡 *Views: ${views}*
🍰 *Channel: ${channel}${verified}*
🍵 *Upload: ${uploaded}*
`.trim()

    // Tombol standar
    let buttons = [
      { buttonId: `.ytmp3 ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
      { buttonId: `.ytmp4 ${video.url}`, buttonText: { displayText: '🎬 Video' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: detail,
      buttons: buttons,
      headerType: 4
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('🍰 *Terjadi kesalahan saat memproses.*')
  }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = /^(play)$/i
handler.limit = false
handler.register = false

export default handler

function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}