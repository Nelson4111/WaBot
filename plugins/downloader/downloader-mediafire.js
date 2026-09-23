import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

async function getMediafireViaRyzumi(url) {
  const rz = await axios.get(
    `https://api.ryzumi.net/api/downloader/mediafire?url=${encodeURIComponent(url)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  const d = rz.data?.data || rz.data
  const downloadUrl = d?.downloadUrl || d?.url
  if (!downloadUrl) throw new Error('Download URL tidak ditemukan di Ryzumi')

  return {
    downloadUrl,
    fileName: d.filename || d.fileName || d.title || 'mediafire_file',
    size: d.filesize || d.size || '-'
  }
}

async function scrapeMediafire(url) {
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
  const sizeRaw = $('#downloadButton').text().match(/\((.*?)\)/)?.[1] || '-'

  if (!downloadUrl) throw new Error('Link unduhan MediaFire tidak ditemukan.')
  return { downloadUrl, fileName, size: sizeRaw }
}

async function getMediafire(url) {
  try {
    return await getMediafireViaRyzumi(url)
  } catch (e) {
    console.warn('[Mediafire Ryzumi failed]:', e.message)
    return await scrapeMediafire(url)
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let url = args[0]
  if (!url || !/^https?:\/\/(www\.)?mediafire\.com/.test(url)) {
    return m.reply(
      status.warning(
        `Masukkan tautan MediaFire yang valid!\n` +
        `> Contoh: *${usedPrefix + command} https://www.mediafire.com/file/...*`
      )
    )
  }

  await m.react('⏳')

  try {
    const data = await getMediafire(url)
    const { downloadUrl, fileName, size } = data

    const caption = `*──  ୨୧ ✧ MEDIAFIRE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ꜰ ɪ ʟ ᴇ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${fileName}*
*┆* ◈ ᴜᴋᴜʀᴀɴ : *${size ? toSmallNum(size) : '-'}*
*╰───────────────*

> _Mengirimkan dokumen ke ruang obrolan..._`.trim()

    await conn.sendFile(m.chat, downloadUrl, fileName, caption, m)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal mengunduh file MediaFire:\n> ${e?.message || e}`))
  }
}

handler.help = ['mediafire <url>', 'mf <url>']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf(dl)?)$/i
handler.limit = true
handler.register = true

export default handler