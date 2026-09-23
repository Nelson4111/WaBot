import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function ytStalkRyzumi(username) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/stalk/youtube?username=${encodeURIComponent(username)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  const meta = data?.channelMetadata
  if (!meta || (!meta.username && !meta.channelUrl)) {
    throw new Error('Data channel YouTube tidak ditemukan di Ryzumi')
  }

  const videos = (data.videoDataList || []).map(v => v.title).filter(Boolean).slice(0, 3)

  return {
    name: meta.username || username,
    subscribers: meta.subscriberCount || '-',
    videoCount: meta.videoCount || '-',
    channelUrl: meta.channelUrl || `https://www.youtube.com/@${username}`,
    avatar: meta.avatarUrl || null,
    description: meta.description || '-',
    latestVideos: videos
  }
}

// ─── Scraper Fallback ───────────────────────────────────────────────────────
async function ytStalkScraper(username) {
  const handle = username.startsWith('@') ? username : '@' + username
  const res = await axios.get(`https://m.youtube.com/${handle}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000
  })
  const html = res.data
  const $ = cheerio.load(html)
  const name = $('meta[property="og:title"]').attr('content') || ''
  if (!name || name === 'YouTube') throw new Error('Channel tidak ditemukan.')

  const description = $('meta[property="og:description"]').attr('content') || '-'
  const image = $('meta[property="og:image"]').attr('content') || null
  const url = $('link[rel="canonical"]').attr('href') || `https://www.youtube.com/${handle}`

  const subsMatch = html.match(/(\d[\d.,]*\s*subscribers|\d[\d.,]*[MK]?\s*subscribers)/i)
  const subscribers = subsMatch ? subsMatch[1] : '-'

  return {
    name,
    subscribers,
    videoCount: '-',
    channelUrl: url,
    avatar: image,
    description,
    latestVideos: []
  }
}

async function getYouTubeProfile(username) {
  try {
    return await ytStalkRyzumi(username)
  } catch (e) {
    console.warn('[YouTube Stalk Ryzumi failed]:', e.message)
    return await ytStalkScraper(username)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = text?.trim()
  if (!input) {
    return m.reply(
      status.warning(
        `Masukkan username / handle YouTube!\n` +
        `> Contoh: *${usedPrefix + command} mrbeast*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await getYouTubeProfile(input)

    let cleanDesc = res.description || '-'
    if (cleanDesc.length > 200) {
      cleanDesc = cleanDesc.substring(0, 197) + '...'
    }

    let caption = `*──  ୨୧ ✧ YOUTUBE STALKER ✧ ୨୧  ──*

*╭  〔 📺 ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴄ ʜ ᴀ ɴ ɴ ᴇ ʟ 〕*
*┆* ⟡ ɴᴀᴍᴀ      : *${res.name}*
*┆* ◈ ꜱᴜʙꜱᴄʀɪʙᴇ : *${toSmallNum(res.subscribers)}*
*┆* ✧ ᴛᴏᴛᴀʟ ᴠɪᴅ : *${toSmallNum(res.videoCount)}*
*┆* ❖ ᴛᴀᴜᴛᴀɴ    : *${res.channelUrl}*
*╰───────────────*

${cleanDesc !== '-' ? `*╭  〔 📝 ᴅ ᴇ ꜱ ᴋ ʀ ɪ ᴘ ꜱ ɪ 〕*\n> ${cleanDesc}\n*╰───────────────*\n\n` : ''}`

    if (res.latestVideos && res.latestVideos.length) {
      caption += `*╭  〔 🎬 ᴠ ɪ ᴅ ᴇ ᴏ  ᴛ ᴇ ʀ ʙ ᴀ ʀ ᴜ 〕*\n`
      for (let i = 0; i < res.latestVideos.length; i++) {
        caption += `*┆* ${toSmallNum(i + 1)}. ${res.latestVideos[i]}\n`
      }
      caption += `*╰───────────────*\n\n`
    }

    caption += `> _Data YouTube berhasil diambil_`

    if (res.avatar) {
      await conn.sendMessage(m.chat, {
        image: { url: res.avatar },
        caption: caption.trim()
      }, { quoted: m })
    } else {
      await m.reply(caption.trim())
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('[YouTube Stalk Error]:', e)
    m.reply(status.error(`Gagal mendapatkan info channel YouTube:\n> ${e?.message || e}`))
  }
}

handler.help = ['ytstalk <username>']
handler.tags = ['stalk']
handler.command = /^stalkyt|ytstalk$/i
handler.limit = true

export default handler