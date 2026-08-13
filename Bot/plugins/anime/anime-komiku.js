/*• Nama Fitur : komiku support search detail and download
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbBt4432f3ENa8ULoM1J
• Author : Z7
*/
import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { finished } from 'stream/promises'

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
  if (!images.length) throw 'Gambar tidak ditemukan, link salah atau chapter terkunci.'
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
      const manga = {}
      const bgei = $(el).find('.bgei > a')
      manga.href = `https://komiku.id${bgei.attr('href')}`
      manga.thumbnail = bgei.find('img').attr('src')
      const tipeGenreText = bgei.find('.tpe1_inf').text().trim()
      const tipe = bgei.find('b').text().trim()
      const genre = tipeGenreText.replace(tipe, '').trim()
      manga.type = tipe
      manga.genre = genre
      manga.title = $(el).find('.kan > a > h3').text().trim()
      manga.last_update = $(el).find('.kan > p').text().trim()
      mangas.push(manga)
    })
    return mangas
  } catch {
    return []
  }
}

async function getAllEpisodes(comicUrl) {
  const episodes = []
  let pageNum = 1
  let hasMorePages = true

  while (hasMorePages) {
    try {
      const pageUrl = pageNum === 1 ? comicUrl : `${comicUrl}?page=${pageNum}`
      const { data } = await axios.get(pageUrl, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000 
      })
      const $ = cheerio.load(data)
      let foundEpisodes = 0
      const selectors = ['#Daftar_Chapter tbody tr', '.chapter-list tr', '.episode-list .episode', '.list-chapter .chapter']
      
      for (const selector of selectors) {
        if ($(selector).length > 0) {
          $(selector).each((i, el) => {
            if (i === 0 && $(el).find('th').length > 0) return
            const chapterLinkElement = $(el).find('td.judulseries a, .chapter-title a, .episode-title a, a')
            const chapterTitle = chapterLinkElement.find('span').text().trim() || chapterLinkElement.text().trim()
            const relativeChapterLink = chapterLinkElement.attr('href')
            if (chapterTitle && relativeChapterLink) {
              const chapterLink = getAbsoluteUrl(relativeChapterLink)
              const views = $(el).find('td.pembaca i, .views, .reader-count').text().trim()
              const date = $(el).find('td.tanggalseries, .date, .release-date').text().trim()
              if (!episodes.find(ep => ep.link === chapterLink)) {
                episodes.push({ title: chapterTitle, link: chapterLink, views: views || 'N/A', release_date: date || 'N/A' })
                foundEpisodes++
              }
            }
          })
          break
        }
      }
      if (foundEpisodes === 0) hasMorePages = false
      else pageNum++
      if (episodes.length > 500) hasMorePages = false
    } catch (error) {
      hasMorePages = false
    }
  }
  return episodes
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
      else if (label === 'Konsep Cerita') details.metaInfo.concept = value
      else if (label === 'Pengarang') details.metaInfo.author = value
      else if (label === 'Status') details.metaInfo.status = value
      else if (label === 'Umur Pembaca') details.metaInfo.age_rating = value
      else if (label === 'Cara Baca') details.metaInfo.read_direction = value
    })
    details.genres = []
    $('ul.genre li.genre a span[itemprop="genre"]').each((i, el) => {
      details.genres.push($(el).text().trim())
    })
    details.thumbnail_url = $('img[itemprop="image"]').attr('src') || 'N/A'
    details.episodes = await getAllEpisodes(comicUrl)
    details.episodes.sort((a, b) => {
      const aNum = parseFloat(a.title.match(/\d+(\.\d+)?/)?.[0] || 0)
      const bNum = parseFloat(b.title.match(/\d+(\.\d+)?/)?.[0] || 0)
      return bNum - aNum
    })
    return details
  } catch (error) {
    return null
  }
}

let handler = async (m, { args, conn, usedPrefix, command }) => {
  const subcommand = (args[0] || '').toLowerCase()
  switch(subcommand) {
    case 'search': {
      const keyword = args.slice(1).join(' ')
      if (!keyword) return conn.sendMessage(m.chat, { text: `Masukkan judul manga\nContoh: ${usedPrefix}${command} search one piece` }, { quoted: m })
      
      conn.sendMessage(m.chat, { text: 'Mencari...' }, { quoted: m })
      let results = await scrapeKomikuSearch(keyword)
      if (!results.length) return conn.sendMessage(m.chat, { text: 'Tidak ditemukan.' }, { quoted: m })
      
      let teks = `Hasil pencarian untuk *${keyword}*\n\n`
      results.slice(0, 10).forEach((manga, i) => {
        teks += `${i + 1}. *${manga.title}*\n`
        teks += `   Tipe: ${manga.type}\n`
        teks += `   Link: ${manga.href}\n\n`
      })
      teks += `Gunakan *${usedPrefix}${command} detail <url>* untuk melihat detail.`
      
      conn.sendMessage(m.chat, { text: teks }, { quoted: m })
      break
    }
    case 'detail': {
      const url = args[1]
      if (!url) return conn.sendMessage(m.chat, { text: 'Link komik tidak valid!' }, { quoted: m })
      
      conn.sendMessage(m.chat, { text: 'Mengambil detail... mohon tunggu.' }, { quoted: m })
      let data = await getComicDetails(url)
      if (!data) return conn.sendMessage(m.chat, { text: 'Gagal mendapatkan detail komik.' }, { quoted: m })
      
      let teks = `*${data.title}*\n(${data.title_indonesian})\n\n`
      teks += `*Deskripsi:* ${data.short_description}\n`
      teks += `*Genre:* ${data.genres.join(', ')}\n\n`
      Object.entries(data.metaInfo).forEach(([key, val]) => {
        teks += `*${key.replace(/_/g, ' ')}:* ${val}\n`
      })
      teks += `\n*Total Episode:* ${data.episodes.length}\n\n`
      teks += `*DAFTAR EPISODE:*\n`
      
      data.episodes.slice(0, 30).forEach((ep) => {
        teks += `- ${ep.title}\n  URL: ${ep.link}\n`
      })
      
      if (data.episodes.length > 30) teks += `\n... (hanya menampilkan 30 terbaru)\n`
      teks += `\nGunakan *${usedPrefix}${command} download <url>* untuk mengunduh.`
      
      await conn.sendMessage(m.chat, {
        image: { url: data.thumbnail_url },
        caption: teks
      }, { quoted: m })
      break
    }
    case 'download': {
      const url = args[1]
      if (!url || !url.startsWith('http')) return conn.sendMessage(m.chat, { text: `Link ga valid!\nContoh: ${usedPrefix}${command} download <url_chapter>` }, { quoted: m })
      
      conn.sendMessage(m.chat, { text: 'Sedang memproses PDF...' }, { quoted: m })
      const pdfName = `komiku-chapter-${Date.now()}.pdf`
      try {
        const pdfPath = await komikuDownloadChapter(url, pdfName)
        await conn.sendMessage(m.chat, {
          document: { url: pdfPath },
          mimetype: 'application/pdf',
          fileName: pdfName,
          caption: 'Nih PDF-nya. Jangan lupa traktir Z7 ya ☕'
        }, { quoted: m })
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath)
      } catch (e) {
        conn.sendMessage(m.chat, { text: 'Gagal download chapter.' }, { quoted: m })
      }
      break
    }
    default:
      conn.sendMessage(m.chat, { text: `Format salah, gunakan:\n${usedPrefix}${command} search <keyword>\n${usedPrefix}${command} detail <url>\n${usedPrefix}${command} download <url>` }, { quoted: m })
  }
}

handler.command = /^(komiku)$/i
handler.help = ['komiku search', 'komiku detail', 'komiku download']
handler.tags = ['anime']
handler.limit = true
handler.register = true

export default handler