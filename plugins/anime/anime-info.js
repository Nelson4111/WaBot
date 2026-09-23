import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const isManga = /^(mangainfo|manga)$/i.test(command)

  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan judul ${isManga ? 'manga' : 'anime'}:
> › *${usedPrefix + command}* <judul>
>
> Contoh:
> › *${usedPrefix + command} Frieren Beyond Journey's End*
> › *${usedPrefix + command} One Piece*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let data = null
    // 1. Primary: Ryzumi Weebs API
    try {
      const ep = isManga ? 'manga-info' : 'anime-info'
      const res = await axios.get(`https://api.ryzumi.net/api/weebs/${ep}?query=${encodeURIComponent(text.trim())}`, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      data = res.data?.data || res.data
    } catch (e1) {}

    // 2. Fallback: Jikan Moe API
    if (!data || data.error) {
      const jikanType = isManga ? 'manga' : 'anime'
      const jikanRes = await axios.get(`https://api.jikan.moe/v4/${jikanType}?q=${encodeURIComponent(text.trim())}`, {
        timeout: 15000
      })
      data = jikanRes.data?.data?.[0]
    }

    if (!data || (!data.title && !data.title_japanese)) {
      throw new Error(`Informasi ${isManga ? 'manga' : 'anime'} "${text}" tidak ditemukan.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const title = data.title || data.title_english || data.title_japanese || text
    const jpTitle = data.title_japanese ? ` (${data.title_japanese})` : ''
    const type = data.type || (isManga ? 'Manga' : 'TV Anime')
    const score = data.score ? `★ ${toSmallNum(data.score)}` : 'N/A'
    const status = data.status || 'Finished'
    const genres = Array.isArray(data.genres) ? data.genres.map(g => g.name || g).join(', ') : (data.genre || 'Action / Fantasy')
    const episodes = data.episodes ? `${toSmallNum(data.episodes)} Episode` : (data.chapters ? `${toSmallNum(data.chapters)} Chapter` : '-')
    const synopsis = (data.synopsis || data.description || 'Tidak ada sinopsis tersedia.').replace(/\r?\n+/g, ' ').slice(0, 450)
    const imgUrl = data.images?.jpg?.large_image_url || data.images?.jpg?.image_url || data.image || data.gambar

    const caption = `*──  ୨୧ ✧ ${isManga ? 'ɪɴꜰᴏ ᴍᴀɴɢᴀ' : 'ɪɴꜰᴏ ᴀɴɪᴍᴇ'} ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${title}${jpTitle}*
*┆* ◈ ᴛɪᴘᴇ     : *${type}*
*┆* ❖ ꜱᴋᴏʀ     : *${score}*
*┆* ⏱ ꜱᴛᴀᴛᴜꜱ   : *${status}*
*┆* ✦ ᴛᴏᴛᴀʟ    : *${episodes}*
*┆* ⚙ ɢᴇɴʀᴇ    : *${genres}*
> ✦ ꜱɪɴᴏᴘꜱɪꜱ : ${synopsis}...
*╰───────────────*

> › 🔗 *${data.url || `https://myanimelist.net`}*`.trim()

    if (imgUrl) {
      return conn.sendMessage(m.chat, {
        image: { url: imgUrl },
        caption
      }, { quoted: m })
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memuat info anime/manga: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['animeinfo <judul>', 'mangainfo <judul>']
handler.tags = ['anime']
handler.command = /^(animeinfo|mangainfo|anime|manga)$/i
handler.limit = true

export default handler
