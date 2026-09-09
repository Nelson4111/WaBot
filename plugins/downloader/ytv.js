import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { status, toSmallNum } from '../../lib/style.js'

const yt = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br, zstd',
      'origin': 'https://frame.y2meta-uk.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  }),
  resolveConverterPayload(link, f = '128k') {
    const a = ['128k', '320k', '144p', '240p', '360p', '720p', '1080p']
    if (!a.includes(f)) throw new Error(`Format tidak valid. Pilihan yang tersedia: ${a.join(', ')}`)
    const t = f.endsWith('k') ? 'mp3' : 'mp4'
    const b = t === 'mp3' ? parseInt(f) + '' : '128'
    const v = t === 'mp4' ? parseInt(f) + '' : '720'
    return { link, format: t, audioBitrate: b, videoQuality: v, filenameStyle: 'pretty', vCodec: 'h264' }
  },
  sanitizeFileName(n) {
    const e = n.match(/\.[^.]+$/)?.[0] || '.mp4'
    const f = n.replace(new RegExp(`\\${e}$`), '').replaceAll(/[^A-Za-z0-9]/g, '_').replace(/_+/g, '_').toLowerCase()
    return f + e
  },
  async getBuffer(u) {
    const h = structuredClone(this.static.headers)
    h.referer = 'https://v6.www-y2mate.com/'
    h.range = 'bytes=0-'
    delete h.origin
    const r = await fetch(u, { headers: h })
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    const ab = await r.arrayBuffer()
    return Buffer.from(ab)
  },
  async getKey(id = '') {
    const url = id ? `${this.static.baseUrl}/v2/sanity/key?id=${id}` : `${this.static.baseUrl}/v2/sanity/key`
    const r = await fetch(url, { headers: this.static.headers })
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    return await r.json()
  },
  async convert(u, f) {
    const idMatch = u.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
    const id = idMatch ? idMatch[1] : ''
    const { key } = await this.getKey(id)
    const p = this.resolveConverterPayload(u, f)
    const h = { key, ...this.static.headers }
    const r = await fetch(this.static.baseUrl + '/v2/converter', { headers: h, method: 'post', body: new URLSearchParams(p) })
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    return await r.json()
  },
  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { fileName: this.sanitizeFileName(filename), buffer }
  }
}

async function convertToFast(buffer) {
  const uid = Date.now() + '_' + Math.random().toString(36).slice(2, 6)
  const tempIn = path.join(tmpdir(), `yt_temp_in_${uid}.mp4`)
  const tempOut = path.join(tmpdir(), `yt_temp_out_${uid}.mp4`)
  fs.writeFileSync(tempIn, buffer)
  try {
    await new Promise((res, rej) => {
      const ff = spawn('ffmpeg', ['-i', tempIn, '-c', 'copy', '-movflags', 'faststart', '-y', tempOut])
      ff.on('close', code => code === 0 ? res() : rej(new Error('ffmpeg convert error')))
    })
    return fs.readFileSync(tempOut)
  } finally {
    if (fs.existsSync(tempIn)) try { fs.unlinkSync(tempIn) } catch {}
    if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut) } catch {}
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(status.warning(`Masukkan tautan YouTube!\n> Contoh: *${usedPrefix + command} https://youtu.be/...*`))
  }

  await m.reply(status.wait('Sedang memproses konversi YouTube v2...'))

  try {
    switch (command) {
      case 'ytv2': {
        let f = args[1] || '720p'
        let { buffer, fileName } = await yt.download(args[0], f)
        buffer = await convertToFast(buffer)

        const caption = `*──  ୨୧ ✧ YOUTUBE VIDEO V2 ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${fileName}*
*┆* ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *${toSmallNum(f)}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName, caption }, { quoted: m })
        break
      }
      case 'yta2': {
        let f = args[1] || '128k'
        let { buffer, fileName } = await yt.download(args[0], f)
        await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName }, { quoted: m })
        break
      }
    }
  } catch (e) {
    m.reply(status.error(`Gagal memproses media:\n> ${e.message || e}`))
  }
}

handler.help = ['ytv2 <url> [quality]', 'yta2 <url> [quality]']
handler.tags = ['downloader']
handler.command = ['ytv2', 'yta2']
handler.limit = true

export default handler