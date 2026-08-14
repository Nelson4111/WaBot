import axios from 'axios'

async function searchSpotifyTrack(query) {
  // 1. Coba Ryzumi Search API
  try {
    const res = await axios.get(`https://api.ryzumi.net/api/search/spotify?query=${encodeURIComponent(query)}`, { timeout: 8000 })
    if (res.data) {
      let list = Array.isArray(res.data) ? res.data : (res.data.results || res.data.data)
      if (Array.isArray(list) && list.length > 0) {
        return list.map(item => ({
          title: item.title || item.name || query,
          artist: item.artists || item.artist || 'Spotify Artist',
          album: item.album || '-',
          cover: item.cover || item.coverUrl || '',
          spotifyUrl: item.link || item.url || item.external_urls?.spotify
        }))
      }
    }
  } catch (e) {}

  // 2. Fallback: DuckDuckGo search untuk Spotify track link
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=site%3Aopen.spotify.com%2Ftrack+${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    })
    const match = res.data.match(/https%3A%2F%2Fopen\.spotify\.com%2Ftrack%2F[a-zA-Z0-9]+/)
    if (match) {
      const trackUrl = decodeURIComponent(match[0])
      try {
        const oe = await axios.get(`https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`, { timeout: 5000 })
        if (oe.data) {
          return [{
            title: oe.data.title || query,
            artist: oe.data.author_name || 'Spotify Artist',
            album: '-',
            cover: oe.data.thumbnail_url || '',
            spotifyUrl: trackUrl
          }]
        }
      } catch (e) {}
      return [{
        title: query,
        artist: 'Spotify Artist',
        album: '-',
        cover: '',
        spotifyUrl: trackUrl
      }]
    }
  } catch (e) {}

  // 3. Fallback: Deezer Search API
  try {
    const dz = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, { timeout: 8000 })
    if (dz.data?.data?.length > 0) {
      return dz.data.data.map(item => ({
        title: item.title,
        artist: item.artist?.name || 'Artist',
        album: item.album?.title || '-',
        cover: item.album?.cover_big || item.album?.cover_medium || '',
        spotifyUrl: item.link,
        preview: item.preview
      }))
    }
  } catch (e) {}

  return []
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🎧 *Contoh Penggunaan:*\n• ${usedPrefix + command} Komang`)

  await m.react('🔍')

  try {
    let results = await searchSpotifyTrack(text)

    if (!results || results.length === 0) {
      return m.reply(`❌ *Lagu "${text}" tidak ditemukan.*`)
    }

    let track = results[0]
    let caption = `🎧 *SPOTIFY SEARCH*\n\n`
    caption += `📌 *Judul:* ${track.title}\n`
    caption += `👤 *Artis:* ${track.artist}\n`
    caption += `💽 *Album:* ${track.album}\n`
    caption += `🔗 *Link:* ${track.spotifyUrl || '-'}\n`

    if (track.cover) {
      await conn.sendMessage(m.chat, {
        image: { url: track.cover },
        caption: caption
      }, { quoted: m })
    } else {
      await m.reply(caption)
    }

    if (track.preview) {
      await conn.sendMessage(m.chat, {
        audio: { url: track.preview },
        mimetype: 'audio/mp4'
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error('Spotify Search Error:', e)
    await m.react('❌')
    m.reply('❌ *Terjadi kesalahan saat mencari lagu:* ' + (e.message || e))
  }
}

handler.help = ['spotifys <query>']
handler.tags = ['search']
handler.command = /^(spotifys|spotifysearch)$/i

export default handler