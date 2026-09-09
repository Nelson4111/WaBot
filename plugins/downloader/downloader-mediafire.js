import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

async function scrapeMediafire(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 15000
    })
    const $ = cheerio.load(res.data)
    const downloadUrl = $('#downloadButton').attr('href') || $('a#download_link').attr('href')
    const fileName = $('.dl-btn-label').attr('title') || $('div.filename').text().trim() || $('div.dl-info > div.intro > div.filename').text().trim() || 'file'
    const sizeRaw = $('#downloadButton').text().match(/\((.*?)\)/)?.[1] || ''

    if (downloadUrl) {
      return { downloadUrl, fileName, size: sizeRaw }
    }
  } catch (e) {
    console.warn('[Mediafire Direct Scrape Failed]:', e.message)
  }

  // Fallback ke Ryzen Mediafire API
  try {
    const rz = await axios.get(`https://api.ryzumi.net/api/downloader/mediafire?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    if (rz.data?.downloadUrl || rz.data?.data?.downloadUrl || rz.data?.url) {
      const d = rz.data?.data || rz.data
      return {
        downloadUrl: d.downloadUrl || d.url,
        fileName: d.fileName || d.filename || d.title || 'mediafire_file',
        size: d.filesize || d.size || ''
      }
    }
  } catch (e) {
    console.warn('[Mediafire Ryzen Fallback Failed]:', e.message)
  }

  throw new Error('Link unduhan MediaFire tidak ditemukan atau file telah dihapus.')
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let url = args[0]
  if (!url || !/^https?:\/\/(www\.)?mediafire\.com/.test(url)) {
    return m.reply(status.warning(`Masukkan tautan MediaFire yang valid!\n> Contoh: *${usedPrefix + command} https://www.mediafire.com/file/...*`))
  }

  await m.reply(status.wait('Sedang memproses tautan MediaFire...'))

  try {
    const data = await scrapeMediafire(url)
    const { downloadUrl, fileName, size } = data

    const caption = `*──  ୨୧ ✧ MEDIAFIRE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ꜰ ɪ ʟ ᴇ 〕*
> ⟡ ɴᴀᴍᴀ     : *${fileName}*
> ◈ ᴜᴋᴜʀᴀɴ   : *${size ? toSmallNum(size) : '-'}*
*╰───────────────*

> _Mengirimkan dokumen ke ruang obrolan..._`.trim()

    await conn.sendFile(m.chat, downloadUrl, fileName, caption, m)
  } catch (e) {
    m.reply(status.error(`Gagal mengunduh file MediaFire.\n> ${e?.message || e}`))
  }
}

handler.help = ['mediafire <url>', 'mf <url>']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf(dl)?)$/i
handler.limit = true
handler.register = true

export default handler