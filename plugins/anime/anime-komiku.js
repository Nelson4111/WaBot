import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { finished } from 'stream/promises'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

const BASE_URL = "https://komiku.id/"
const TMP_DIR = './tmp'

const getAbsoluteUrl = (relativePath) => {
  try {
    if (!relativePath) return 'N/A'
    if (relativePath.startsWith('http')) return relativePath
    return new URL(relativePath, BASE_URL).href
  } catch {
    return relativePath
  }
}

async function downloadImage(imgUrl, filename) {
  const response = await axios({ url: imgUrl, responseType: 'stream' })
  const writer = fs.createWriteStream(filename)
  response.data.pipe(writer)
  await finished(writer)
}

async function komikuDownloadChapter(chapterUrl, pdfFileName) {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)
  const { data } = await axios.get(chapterUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const $ = cheerio.load(data)
  const images = []
  $('#Baca_Komik img').each((i, el) => {
    let src = $(el).attr('src')
    if (src && src.startsWith('http')) images.push(src)
  })
  if (!images.length) throw new Error('Gambar tidak ditemukan, link salah atau chapter terkunci.')
  const downloadedImages = []
  for (let i = 0; i < images.length; i++) {
    const imgUrl = images[i]
    const ext = path.extname(imgUrl).split('?')[0] || '.jpg'
    const filename = path.join(TMP_DIR, `page-${String(i + 1).padStart(2, '0')}${ext}`)
    await downloadImage(imgUrl, filename)
    downloadedImages.push(filename)
  }
  const outputPdf = path.join(TMP_DIR, pdfFileName)
  const doc = new PDFDocument({ autoFirstPage: false })
  const pdfStream = fs.createWriteStream(outputPdf)
  doc.pipe(pdfStream)
  for (const imgPath of downloadedImages) {
    doc.addPage()
    doc.image(imgPath, 0, 0, { fit: [595, 842], align: 'center', valign: 'center' })
  }
  doc.end()
  await finished(pdfStream)
  for (const imgPath of downloadedImages) {
    fs.unlinkSync(imgPath)
  }
  return outputPdf
}

async function scrapeKomikuSearch(keyword) {
  const url = `https://api.komiku.id/?post_type=manga&s=${encodeURIComponent(keyword)}`
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const mangas = []
    $('.bge').each((i, el) => {
      const bgei = $(el).find('.bgei > a')
      const href = `https://komiku.id${bgei.attr('href')}`
      const thumbnail = bgei.find('img').attr('src')
      const tipeGenreText = bgei.find('.tpe1_inf').text().trim()
      const tipe = bgei.find('b').text().trim()
      const genre = tipeGenreText.replace(tipe, '').trim()
      const title = $(el).find('.kan > a > h3').text().trim()
      mangas.push({ title, href, thumbnail, type: tipe, genre })
    })
    return mangas
  } catch {
    return []
  }
}

async function getComicDetails(comicUrl) {
  try {
    const { data } = await axios.get(comicUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
    const $ = cheerio.load(data)
    const details = {}
    details.title = $('h1 span[itemprop="name"]').text().trim() || 'N/A'
    details.title_indonesian = $('p.j2').text().trim() || 'N/A'
    details.short_description = $('p[itemprop="description"]').text().trim().replace(/^Komik\s.*?\s-\s-\s/, '') || 'Tidak ada deskripsi singkat.'
    details.full_synopsis = $('section#Sinopsis p').first().text().trim() || 'Tidak ada sinopsis lengkap.'
    details.metaInfo = {}
    $('.inftable tr').each((i, el) => {
      const label = $(el).find('td').first().text().trim()
      const value = $(el).find('td').eq(1).text().trim()
      if (label === 'Judul Komik') details.metaInfo.original_title = value
      else if (label === 'Judul Indonesia') details.metaInfo.indonesian_title = value
      else if (label === 'Jenis Komik') details.metaInfo.type = value
      else if (label === 'Pengarang') details.metaInfo.author = value
      else if (label === 'Status') details.metaInfo.status = value
    })
    details.genres = []
    $('ul.genre li.genre a span[itemprop="genre"]').each((i, el) => {
      details.genres.push($(el).text().trim())
    })
    details.thumbnail_url = $('img[itemprop="image"]').attr('src') || ''
    details.episodes = []
    $('#Daftar_Chapter tbody tr').each((i, el) => {
      const a = $(el).find('td.judulseries a')
      const title = a.find('span').text().trim() || a.text().trim()
      const link = a.attr('href')
      if (title && link) {
        details.episodes.push({ title, link: getAbsoluteUrl(link) })
      }
    })
    return details
  } catch {
    return null
  }
}

let handler = async (m, { args, conn, usedPrefix, command }) => {
  const subcommand = (args[0] || '').toLowerCase()

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  switch (subcommand) {
    // 1. Komik Terbaru
    case 'terbaru':
    case 'latest': {
      try {
        const res = await axios.get('https://api.ryzumi.net/api/komiku/terbaru', {
          timeout: 20000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        const comics = res.data?.comics || []
        if (comics.length === 0) throw new Error('Komik terbaru tidak ditemukan.')

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        const maxComics = Math.min(comics.length, 6)
        const cards = []
        for (let i = 0; i < maxComics; i++) {
          const c = comics[i]
          cards.push(`*╭  〔 📚 ᴋ ᴏ ᴍ ɪ ᴋ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ : *${c.title}*
> › 🔗 *Link:* ${c.link}
*╰───────────────*`)
        }

        const caption = `*──  ୨୧ ✧ ᴋᴏᴍɪᴋ ᴛᴇʀʙᴀʀᴜ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Ketik .komiku detail <url> untuk melihat daftar episode._`.trim()

        return m.reply(caption)
      } catch (err) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal memuat komik terbaru: ${err.message}\n*╰───────────────*`)
      }
    }

    // 2. Komik Populer
    case 'populer':
    case 'popular': {
      try {
        const res = await axios.get('https://api.ryzumi.net/api/komiku/populer', {
          timeout: 20000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        const comics = res.data?.comics || []
        if (comics.length === 0) throw new Error('Komik populer tidak ditemukan.')

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        const maxComics = Math.min(comics.length, 6)
        const cards = []
        for (let i = 0; i < maxComics; i++) {
          const c = comics[i]
          cards.push(`*╭  〔 🏆 ᴛ ᴏ ᴘ  ᴋ ᴏ ᴍ ɪ ᴋ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ : *${c.title}*
> › 🔗 *Link:* ${c.link}
*╰───────────────*`)
        }

        const caption = `*──  ୨୧ ✧ ᴋᴏᴍɪᴋ ᴛᴇʀᴘᴏᴘᴜʟᴇʀ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Komik paling banyak dibaca di Komiku._`.trim()

        return m.reply(caption)
      } catch (err) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal memuat komik populer: ${err.message}\n*╰───────────────*`)
      }
    }

    // 3. Cari Komik
    case 'search':
    case 'cari': {
      const keyword = args.slice(1).join(' ')
      if (!keyword) {
        return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Masukkan judul komik!\n> Contoh: *${usedPrefix + command} search One Piece*\n*╰───────────────*`)
      }

      let results = []
      // Primary: Ryzumi Komiku Search
      try {
        const res = await axios.get(`https://api.ryzumi.net/api/komiku/search?q=${encodeURIComponent(keyword)}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const items = res.data?.data || []
        results = items.map(it => ({
          title: it.title,
          type: it.type || 'Manga',
          genre: it.genre || '-',
          href: `https://komiku.id/detail-komik/${it.slug}/`,
          thumbnail: it.thumbnail
        }))
      } catch (e1) {}

      // Fallback: Scrape
      if (results.length === 0) {
        results = await scrapeKomikuSearch(keyword)
      }

      if (results.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Komik "${keyword}" tidak ditemukan.\n*╰───────────────*`)
      }

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      const maxResults = Math.min(results.length, 5)
      const cards = []

      for (let i = 0; i < maxResults; i++) {
        const it = results[i]
        cards.push(`*╭  〔 📖 ᴋ ᴏ ᴍ ɪ ᴋ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ : *${it.title}*
*┆* ◈ ᴛɪᴘᴇ  : *${it.type}*
*┆* ⚙ ɢᴇɴʀᴇ : *${it.genre}*
> › 🔗 *Link:* ${it.href}
*╰───────────────*`)
      }

      const caption = `*──  ୨୧ ✧ ʜᴀꜱɪʟ ᴘᴇɴᴄᴀʀɪᴀɴ ᴋᴏᴍɪᴋ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Gunakan .komiku detail <link> untuk melihat chapter._`.trim()

      return m.reply(caption)
    }

    // 4. Detail Komik
    case 'detail': {
      const url = args[1]
      if (!url) {
        return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Masukkan link detail komik!\n> Contoh: *${usedPrefix + command} detail https://komiku.id/detail-komik/...*\n*╰───────────────*`)
      }

      const data = await getComicDetails(url)
      if (!data) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal mengambil rincian komik.\n*╰───────────────*`)
      }

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      const genres = data.genres.join(', ') || '-'
      const epList = data.episodes.slice(0, 10).map(e => `*┆* ⟡ ${e.title} -> \`${e.link}\``).join('\n')

      const caption = `*──  ୨୧ ✧ ʀɪɴᴄɪᴀɴ ᴋᴏᴍɪᴋ ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${data.title}*
*┆* ◈ ᴛɪᴘᴇ    : *${data.metaInfo?.type || 'Manga'}*
*┆* ⚙ ɢᴇɴʀᴇ   : *${genres}*
*┆* ⏱ ꜱᴛᴀᴛᴜꜱ  : *${data.metaInfo?.status || '-'}*
*┆* ✦ ᴄʜᴀᴘᴛᴇʀ : *${toSmallNum(data.episodes.length)} Episode*
> ✦ ꜱɪɴᴏᴘꜱɪꜱ : ${data.short_description}
*╰───────────────*

*╭  〔 📑 𝟷𝟶 ᴄ ʜ ᴀ ᴘ ᴛ ᴇ ʀ  ᴛ ᴇ ʀ ʙ ᴀ ʀ ᴜ 〕*
${epList || '*┆* ⟡ Tidak ada chapter'}
*╰───────────────*

> _Gunakan .komiku download <url_chapter> untuk mendownload PDF._`.trim()

      if (data.thumbnail_url) {
        return conn.sendMessage(m.chat, { image: { url: data.thumbnail_url }, caption }, { quoted: m })
      }
      return m.reply(caption)
    }

    // 5. Download Chapter to PDF
    case 'download': {
      const url = args[1]
      if (!url || !url.startsWith('http')) {
        return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Masukkan link chapter komik!\n> Contoh: *${usedPrefix + command} download <url_chapter>*\n*╰───────────────*`)
      }

      const pdfName = `komiku-chapter-${Date.now()}.pdf`
      try {
        const pdfPath = await komikuDownloadChapter(url, pdfName)
        await conn.sendMessage(m.chat, {
          document: { url: pdfPath },
          mimetype: 'application/pdf',
          fileName: pdfName,
          caption: `*──  ୨୧ ✧ ᴋᴏᴍɪᴋᴜ ᴄʜᴀᴘᴛᴇʀ ᴘᴅꜰ ✧ ୨୧  ──*\n\n> _Chapter komik berhasil dikonversi menjadi dokumen PDF._`
        }, { quoted: m })

        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal download chapter komik: ${e.message}\n*╰───────────────*`)
      }
      break
    }

    default:
      return m.reply(`*╭  〔 📚 ᴋ ᴏ ᴍ ɪ ᴋ ᴜ  ᴍ ᴇ ɴ ᴜ 〕*
> Panduan Perintah Komiku:
> › *${usedPrefix + command} search <judul>* (Cari komik)
> › *${usedPrefix + command} terbaru* (Daftar rilis baru)
> › *${usedPrefix + command} populer* (Daftar komik top)
> › *${usedPrefix + command} detail <url>* (Info & daftar chapter)
> › *${usedPrefix + command} download <url_chapter>* (Download PDF)
*╰───────────────*`)
  }
}

handler.command = /^(komiku|mangaid)$/i
handler.help = ['komiku search <judul>', 'komiku terbaru', 'komiku populer', 'komiku detail <url>', 'komiku download <url>']
handler.tags = ['anime']
handler.limit = true

export default handler