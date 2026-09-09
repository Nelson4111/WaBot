import axios from 'axios'
import * as cheerio from 'cheerio'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

async function getSnappinToken() {
  let { headers, data } = await axios.get('https://snappin.app/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 10000
  })
  let cookies = headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || ''
  let $ = cheerio.load(data)
  let csrfToken = $('meta[name="csrf-token"]').attr('content')
  return { csrfToken, cookies }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(status.warning(`Masukkan link Pinterest!\n> Contoh: *${usedPrefix + command} https://pin.it/...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan Pinterest (Snappin)...'))

  try {
    let pinterestUrl = args[0]
    let { csrfToken, cookies } = await getSnappinToken()

    let { data } = await axios.post('https://snappin.app/', { url: pinterestUrl }, {
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: cookies,
        Referer: 'https://snappin.app',
        Origin: 'https://snappin.app',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    })

    let $ = cheerio.load(data)
    let downloadLinks = $('a.button.is-success').map((_, el) => $(el).attr('href')).get()

    let mediaUrl = null
    for (let link of downloadLinks) {
      let fullLink = link.startsWith('http') ? link : 'https://snappin.app' + link
      let head = await axios.head(fullLink, { timeout: 8000 }).catch(() => null)
      let contentType = head?.headers?.['content-type'] || ''

      if (contentType.includes('video')) {
        mediaUrl = { url: fullLink, type: 'video' }
        break
      } else if (contentType.includes('image')) {
        mediaUrl = { url: fullLink, type: 'image' }
      }
    }

    if (!mediaUrl) throw new Error('Tidak ada media yang dapat diunduh dari tautan ini.')

    const caption = `*──  ୨୧ ✧ PINTEREST DOWNLOADER 2 ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
*┆* ◈ ᴛɪᴘᴇ    : *${mediaUrl.type === 'video' ? 'Video MP4' : 'Gambar / Foto'}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    if (mediaUrl.type === 'video') {
      await conn.sendMessage(m.chat, { video: { url: mediaUrl.url }, caption }, { quoted: m })
    } else {
      // Tombol fallback ke .menu jika ada image
      await conn.sendButtonV2(m.chat, {
        title: '⛩️ PINTEREST MEDIA',
        subtitle: 'Avelia • Snappin Service',
        text: caption,
        footer,
        buffer: mediaUrl.url,
        buttons: [
          ['📜 Menu Utama', `${usedPrefix}menu`]
        ]
      }, m)
    }

  } catch (e) {
    m.reply(status.error(`Gagal mengunduh Pinterest:\n> ${e.message || e}`))
  }
}

handler.help = ['pindl2 <url>']
handler.command = ['pindl2']
handler.tags = ['downloader']
handler.limit = true

export default handler