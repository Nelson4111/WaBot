import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data'
import { status, toSmallNum } from '../../lib/style.js'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan tautan Instagram Story!\n> Contoh: *${usedPrefix + command} https://www.instagram.com/stories/...*`))
  }
  if (!/^https:\/\/www\.instagram\.com\/stories\/[a-zA-Z0-9_.]+\/?/.test(text)) {
    return m.reply(status.warning('URL Instagram Story tidak valid! Pastikan format tautan story benar.'))
  }

  await m.reply(status.wait('Sedang mengambil Instagram Story...'))

  try {
    const url = text
    const tokenForm = new FormData()
    tokenForm.append('url', url)
    const { data: tokenData } = await axios.post('https://savevid.net/api/userverify', tokenForm, {
      headers: { ...tokenForm.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    })

    const form = new FormData()
    form.append('q', url)
    form.append('t', 'media')
    form.append('lang', 'en')
    form.append('v', 'v2')
    form.append('cftoken', tokenData.token)

    const { data } = await axios.post('https://v3.savevid.net/api/ajaxSearch', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    })

    const $ = cheerio.load(data.data)
    const links = []

    $('ul.download-box > li').each((_, el) => {
      const dl = $(el).find('.download-items__btn:not(.dl-thumb) a').attr('href')
      if (dl) links.push(dl)
    })

    if (!links.length) throw new Error('Tidak ada media yang ditemukan di story tersebut atau story telah kedaluwarsa.')

    for (let i = 0; i < links.length; i++) {
      const caption = `*──  ୨୧ ✧ INSTAGRAM STORY ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ꜱ ᴛ ᴏ ʀ ʏ 〕*
*┆* ⟡ ꜱᴛᴏʀʏ : *${toSmallNum(i + 1)} / ${toSmallNum(links.length)}*
*╰───────────────*`.trim()

      await conn.sendFile(m.chat, links[i], 'story.mp4', caption, m, { asDocument: true })
      if (i < links.length - 1) await delay(1500)
    }

  } catch (e) {
    m.reply(status.error(`Gagal mengambil Instagram Story:\n> ${e.message || e}`))
  }
}

handler.help = ['igstory <url>', 'igst <url>']
handler.tags = ['downloader']
handler.command = /^(igst|igstory)$/i
handler.limit = true

export default handler