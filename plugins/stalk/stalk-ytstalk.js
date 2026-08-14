import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

async function getYouTubeProfile(username) {
  const res = await fetch(`https://m.youtube.com/${username.startsWith('@') ? username : '@' + username}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = await res.text()
  const $ = cheerio.load(html)
  const name = $('meta[property="og:title"]').attr('content') || ''
  const description = $('meta[property="og:description"]').attr('content') || ''
  const image = $('meta[property="og:image"]').attr('content') || ''
  const url = $('link[rel="canonical"]').attr('href') || ''
  const bannerMatch = html.match(/https:\/\/yt3\.googleusercontent\.com\/[^\s"']+?=w\d+-fcrop64=[^"']+/i)
  const banner = bannerMatch ? bannerMatch[0] : ''
  const subsMatch = html.match(/(\d[\d.,]*)\s+subscribers/i)
  let subscribers = subsMatch ? subsMatch[1] : null

  if (!subscribers) {
    const altRes = await fetch(`https://www.youtube.com/${username.startsWith('@') ? username : '@' + username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const altHtml = await altRes.text()
    const altMatch = altHtml.match(/"text"\s*:\s*\{\s*"content"\s*:\s*"(\d[\d.,]*[MK]?)\s*subscribers"/)
    subscribers = altMatch ? altMatch[1] : null
  }

  const videoMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)]
  const videoSet = new Set()
  const videos = []
  for (const match of videoMatches) {
    const videoId = match[1]
    if (!videoSet.has(videoId)) {
      videoSet.add(videoId)
      videos.push(`https://www.youtube.com/watch?v=${videoId}`)
      if (videos.length === 5) break
    }
  }

  const idMatch = url.match(/\/channel\/(UC[\w-]+)/)
  const channelId = idMatch ? idMatch[1] : null

  return {
    name,
    username,
    description,
    image,
    banner,
    subscribers,
    url,
    channelId,
    videos
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) {
    let caption = `*Format Salah!*\n\nContoh penggunaan:\n.${command} mrbeast`
    return m.reply(caption)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const profile = await getYouTubeProfile(text)
    if (!profile?.name || profile.name === 'YouTube') {
       await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
       return m.reply('❌ Profil tidak ditemukan. Pastikan username/handle benar.')
    }

    const caption = `📤 *Y O U T U B E - S T A L K*

📛 *Channel*: ${profile.name}
🔗 *Link*: ${profile.url}
🆔 *ID*: ${profile.channelId || '-'}
👥 *Subscribers*: ${profile.subscribers || '-'}

📝 *Deskripsi*: 
${profile.description || '-'}

🎬 *Video Terbaru*:
${profile.videos.length > 0 ? profile.videos.join('\n') : '-'}
    `.trim()

    await conn.sendFile(m.chat, profile.banner || profile.image, 'yt.jpg', caption, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ Terjadi kesalahan saat mengambil data.')
  }
}

handler.help = ['ytstalk <username>']
handler.tags = ['stalk']
handler.command = /^stalkyt|ytstalk$/i

export default handler