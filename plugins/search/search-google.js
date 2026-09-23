import axios from 'axios'
import cheerio from 'cheerio'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

async function scrapeGoogle(query) {
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('.result').each((i, el) => {
      const title = $(el).find('.result__title a').text().trim()
      const link = $(el).find('.result__url').attr('href') || $(el).find('.result__title a').attr('href')
      const snippet = $(el).find('.result__snippet').text().trim()
      if (title && link) {
        results.push({ title, link: link.startsWith('//') ? 'https:' + link : link, snippet })
      }
    })
    return results
  } catch (e) {
    return []
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan kata kunci pencarian:
> › *${usedPrefix + command}* <kata_kunci>
>
> Contoh:
> › *${usedPrefix + command} Sejarah Kemerdekaan Indonesia*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let list = []
    // 1. Primary: Ryzumi Google API
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/search/google?query=${encodeURIComponent(text.trim())}`, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
    } catch (e1) {}

    // 2. Fallback Scraper
    if (list.length === 0) {
      list = await scrapeGoogle(text.trim())
    }

    if (list.length === 0) {
      throw new Error(`Tidak ditemukan hasil pencarian untuk "${text}".`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxResults = Math.min(list.length, 5)
    const cards = []

    for (let i = 0; i < maxResults; i++) {
      const it = list[i]
      cards.push(`*╭  〔 🌐 ʜ ᴀ ꜱ ɪ ʟ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ : *${it.title || '-'}*
> ✦ ᴅᴇꜱᴋʀɪᴘꜱɪ : ${it.snippet || it.description || 'Tidak ada deskripsi'}
> › 🔗 *${it.link || it.url || '-'}*
*╰───────────────*`)
    }

    const caption = `*──  ୨୧ ✧ ɢᴏᴏɢʟᴇ ꜱᴇᴀʀᴄʜ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Hasil pencarian indeks web global._`.trim()

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal melakukan pencarian Google: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['google <query>', 'gsearch <query>']
handler.tags = ['search']
handler.command = /^(google|gsearch)$/i
handler.limit = true

export default handler
