import * as cheerio from 'cheerio'
import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan kata kunci atau URL Sfile.mobi!\n> Contoh:\n> › *${usedPrefix + command} minecraft*\n> › *${usedPrefix + command} https://sfile.mobi/...*`))
  }

  await m.reply(status.wait('Sedang memproses permintaan Sfile...'))

  try {
    if (text.match(/(https:\/\/sfile\.mobi\/)/gi)) {
      let res = await sfileDl(text)
      if (!res?.download) throw new Error('Link unduhan file tidak ditemukan.')

      const caption = `*──  ୨୧ ✧ SFILE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ꜰ ɪ ʟ ᴇ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${res.filename || 'sfile'}*
*┆* ◈ ᴜᴋᴜʀᴀɴ : *${toSmallNum(res.filesize || '-')}*
*┆* ✧ ᴛɪᴘᴇ   : *${res.mimetype || 'Dokumen'}*
*╰───────────────*

> _Mengirimkan dokumen ke ruang obrolan..._`.trim()

      await conn.sendMessage(m.chat, {
        document: { url: res.download },
        fileName: res.filename || 'sfile_download',
        mimetype: res.mimetype || 'application/octet-stream',
        caption
      }, { quoted: m })
    } else {
      let [query, page] = text.split('|')
      let res = await sfileSearch(query, page || 1)
      if (!res.length) throw new Error(`File dengan kata kunci "${text}" tidak ditemukan.`)

      const listItems = res.slice(0, 7).map((v, i) => `*╭  〔 ✦ ꜰ ɪ ʟ ᴇ  ${toSmallNum(i + 1)} 〕*\n*┆* ⟡ ᴊᴜᴅᴜʟ  : *${v.title}*\n*┆* ◈ ᴜᴋᴜʀᴀɴ : *${toSmallNum(v.size)}*\n*┆* 🔗 ᴛᴀᴜᴛᴀɴ : ${v.link}\n*╰───────────────*`).join('\n\n')

      const header = `*──  ୨୧ ✧ SFILE PENCARIAN ✧ ୨୧  ──*\n\n`
      const footer = `\n\n> _Ketik *${usedPrefix + command} <link>* untuk mengunduh salah satu file di atas._`

      m.reply(header + listItems + footer)
    }
  } catch (e) {
    m.reply(status.error(`Gagal memproses Sfile:\n> ${e.message || e}`))
  }
}

handler.help = ['sfile <query/url>']
handler.tags = ['downloader']
handler.command = /^(sfile)$/i
handler.limit = true
handler.register = true

export default handler

async function sfileSearch(query, page = 1) {
  let res = await axios.get(`https://sfile.mobi/search.php?q=${encodeURIComponent(query)}&page=${page}`, { headers, timeout: 15000 })
  let $ = cheerio.load(res.data)
  let result = []
  $('div.list').each(function () {
    let title = $(this).find('a').text().trim()
    let size = $(this).text().trim().split('(')[1]
    let link = $(this).find('a').attr('href')
    if (link && title) result.push({ title, size: size ? size.replace(')', '').trim() : '-', link })
  })
  return result
}

async function sfileDl(url) {
  let res = await axios.get(url, { headers, timeout: 15000 })
  let $ = cheerio.load(res.data)
  let filename = $('div.w3-row-padding').find('img').attr('alt') || $('h1.page-title').text().trim() || 'sfile'
  let mimetype = $('div.list').text().split(' - ')[1]?.split('\n')[0]?.trim() || 'application/octet-stream'
  let filesize = $('#download').text().replace(/Download File/g, '').replace(/[()]/g, '').trim() || '-'
  let rawDl = $('#download').attr('href')
  let download = rawDl ? (rawDl + '&k=' + Math.floor(Math.random() * (15 - 10 + 1) + 10)) : null
  return { filename, filesize, mimetype, download }
}
