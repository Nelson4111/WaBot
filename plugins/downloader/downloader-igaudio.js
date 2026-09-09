import axios from 'axios'
import qs from 'querystring'
import { status, toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(status.warning(`Masukkan URL audio/reels Instagram!\n> Contoh: *${usedPrefix + command} https://www.instagram.com/reels/audio/...*`))
  }

  let url = args[0]
  if (!/^https?:\/\/(www\.)?instagram\.com\//.test(url)) {
    return m.reply(status.warning('URL audio reels Instagram tidak valid.'))
  }

  await m.reply(status.wait('Sedang memproses audio Instagram...'))

  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    const home = await axios.get('https://saveinsta.to/', { headers, timeout: 10000 })
    const k_token = home.data.match(/k_token\s*=\s*['"]([^'"]+)['"]/)?.[1]
    if (!k_token) throw new Error('Gagal mendapatkan token SaveInsta.')

    const verifyRes = await axios.post('https://saveinsta.to/api/userverify', qs.stringify({ url }), { headers, timeout: 10000 })
    const cftoken = verifyRes.data?.token
    if (!cftoken) throw new Error('Token verifikasi tidak ditemukan.')

    const payload = qs.stringify({
      k_exp: Math.floor(Date.now() / 1000) + 300,
      k_token,
      q: url,
      t: 'media',
      lang: 'en',
      v: 'v2',
      cftoken
    })

    const searchRes = await axios.post('https://saveinsta.to/api/ajaxSearch', payload, { headers, timeout: 15000 })
    const html = searchRes.data?.data
    if (!html) throw new Error('Tidak ada data yang ditemukan untuk audio ini.')

    const rawLink = html.match(/<a href="([^"]+)"[^>]*title="Download Audio"/)?.[1] || html.match(/href="([^"]+)"[^>]*>Download Audio/)?.[1]
    const filename = html.match(/"filename":"([^"]+\.mp4)"/)?.[1] || html.match(/\/([^\/?#]+\.mp4)/)?.[1] || 'Instagram_Audio.mp4'

    if (!rawLink) throw new Error('Link unduhan audio Instagram tidak ditemukan.')

    const mp3Link = rawLink.startsWith('http') ? rawLink : 'https://mp3.videodropper.app/api?url=' + encodeURIComponent(rawLink)

    await conn.sendMessage(m.chat, {
      audio: { url: mp3Link },
      mimetype: 'audio/mp4',
      fileName: filename,
      ptt: false
    }, { quoted: m })

  } catch (e) {
    m.reply(status.error(`Gagal mengunduh audio Instagram:\n> ${e.message || e}`))
  }
}

handler.help = ['igaudio <url>']
handler.tags = ['downloader']
handler.command = /(instaaudio|igaudio|inastagramaudio)$/i
handler.limit = true

export default handler