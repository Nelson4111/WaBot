import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (args.length < 2) {
    return m.reply(status.warning(`Format input salah!\n> Contoh: *${usedPrefix + command} tiktok https://vt.tiktok.com/...*\n> Pilihan platform: *instagram*, *tiktok*, *facebook*`))
  }

  const platform = args[0].toLowerCase()
  const inputUrl = args[1]

  if (!['instagram', 'tiktok', 'facebook'].includes(platform)) {
    return m.reply(status.warning('Platform tidak valid! Gunakan: *instagram*, *tiktok*, atau *facebook*'))
  }

  await m.reply(status.wait(`Sedang memproses unduhan ${platform}...`))

  const SITE_URL = 'https://instatiktok.com/'
  const form = new URLSearchParams()
  form.append('url', inputUrl)
  form.append('platform', platform)
  form.append('siteurl', SITE_URL)

  try {
    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': SITE_URL,
        'Referer': SITE_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000
    })

    const html = res?.data?.html
    if (!html || res?.data?.status !== 'success') throw new Error('Gagal mengekstrak data media.')

    const $ = cheerio.load(html)
    const links = []

    $('a.btn[href^="http"]').each((_, el) => {
      const link = $(el).attr('href')
      if (link && !links.includes(link)) links.push(link)
    })

    if (links.length === 0) throw new Error('Link download tidak ditemukan.')

    let download
    if (platform === 'instagram') {
      download = links
    } else if (platform === 'tiktok') {
      download = links.find(link => /hdplay/.test(link)) || links[0]
    } else if (platform === 'facebook') {
      download = links.at(-1)
    }

    if (Array.isArray(download)) {
      for (let i = 0; i < download.length; i++) {
        const caption = `*──  ୨୧ ✧ INSTATIKTOK DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
> ⟡ ᴘʟᴀᴛꜰᴏʀᴍ : *${platform.toUpperCase()}*
> ◈ ꜱʟɪᴅᴇ     : *${toSmallNum(i + 1)} / ${toSmallNum(download.length)}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

        await conn.sendFile(m.chat, download[i], 'media.mp4', caption, m)
      }
    } else {
      const caption = `*──  ୨୧ ✧ INSTATIKTOK DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
> ⟡ ᴘʟᴀᴛꜰᴏʀᴍ : *${platform.toUpperCase()}*
> ◈ ᴛɪᴘᴇ     : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

      await conn.sendFile(m.chat, download, 'media.mp4', caption, m)
    }

  } catch (e) {
    m.reply(status.error(`Gagal mengunduh media:\n> ${e.message || e}`))
  }
}

handler.help = ['dlit <platform> <url>']
handler.tags = ['downloader']
handler.command = /^dlit$/i
handler.limit = true

export default handler