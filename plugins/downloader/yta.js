/**
 * YTMP3 & YTMP4 Downloader
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * source scrape : https://whatsapp.com/channel/0029Vb7t6q7A89MjyGEBG41y/158
 */

import axios from 'axios'
import { spawn } from 'child_process'
import { fileTypeFromBuffer } from 'file-type'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'

const qualityvideo = ['144','240','360','720','1080']
const qualityaudio = ['128','320']

const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': '*/*',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': 'https://iframe.y2meta-uk.com',
  'Referer': 'https://iframe.y2meta-uk.com/'
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function safeFileName(name, ext) {
  const base = String(name || 'youtube')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  return `${base || 'youtube'}.${ext}`
}

async function downloadMedia(url, expected) {
  let lastError = 'File hasil download tidak dikenali.'

  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await axios.get(url, {
      responseType: 'arraybuffer',
      maxRedirects: 5,
      headers: {
        'User-Agent': headers['User-Agent'],
        'Accept': '*/*'
      }
    })

    const buffer = Buffer.from(r.data)
    const type = await fileTypeFromBuffer(buffer)
    const contentType = r.headers?.['content-type'] || 'unknown'

    if (expected === 'mp4' && type?.mime === 'video/mp4') return { buffer, type }
    if (expected === 'mp3' && type?.mime?.startsWith('audio/')) return { buffer, type }

    lastError = type?.mime
      ? `File hasil converter tidak sesuai (${type.mime}).`
      : `File hasil converter belum berupa media (${contentType}).`

    if (attempt < 3) await sleep(1500 * attempt)
  }

  throw `${lastError} Coba ulang beberapa detik lagi atau pakai kualitas lain.`
}

async function toWhatsAppMp4(buffer) {
  const dir = await mkdtemp(join(tmpdir(), 'ytmp4-'))
  const id = randomUUID()
  const input = join(dir, `${id}-in.mp4`)
  const output = join(dir, `${id}-wa.mp4`)

  try {
    await writeFile(input, buffer)
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y',
        '-i', input,
        '-map', '0:v:0',
        '-map', '0:a?',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v', 'libx264',
        '-profile:v', 'baseline',
        '-pix_fmt', 'yuv420p',
        '-preset', 'veryfast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        output
      ])

      let stderr = ''
      ff.stderr.on('data', chunk => { stderr += chunk.toString() })
      ff.on('error', reject)
      ff.on('close', code => {
        if (code === 0) resolve()
        else {
          const tail = stderr.trim().split('\n').slice(-8).join('\n')
          reject(new Error(tail || `ffmpeg keluar dengan kode ${code}`))
        }
      })
    })

    const out = await readFile(output)
    const type = await fileTypeFromBuffer(out)
    if (type?.mime !== 'video/mp4') throw new Error('Hasil ffmpeg bukan MP4.')
    return out
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

function ekstrakid(url) {
  const p = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /watch\?v=([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /live\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/
  ]
  for (const r of p) {
    const m = url.match(r)
    if (m) return m[1]
  }
  throw 'URL YouTube tidak valid'
}

async function search(query) {
  const r = await axios.get(`https://api.ryzumi.net/api/search/yt?query=${encodeURIComponent(query)}`, {
    headers: { 'accept': 'application/json' }
  })
  if (!r.data?.videos?.length) throw 'Lagu tidak ditemukan'
  return r.data.videos[0].id
}

async function y2mate(input, format='mp3', quality=null) {
  const isUrl = /youtu\.be|youtube\.com/.test(input)
  let url = input
  if (!isUrl) {
    const id = await search(input)
    url = `https://youtu.be/${id}`
  }

  const endpoint = format === 'mp4' ? 'ytmp4' : 'ytmp3'
  const r = await axios.get(`https://api.ryzumi.net/api/downloader/v2/${endpoint}?url=${encodeURIComponent(url)}`, {
    headers: { 'accept': 'application/json' }
  })
  
  if (!r.data?.url) throw 'Gagal mendapatkan link dari server.'
  
  return {
    title: r.data.title,
    author: r.data.author,
    thumbnail: r.data.thumbnail,
    quality: r.data.quality || (format === 'mp4' ? '720p' : '128kbps'),
    download: r.data.url,
    format: format
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('Masukkan judul atau URL YouTube')
  await m.react('⏳')
  try {
    const isVideo = /ytv|mp4/i.test(command)
    const format = isVideo ? 'mp4' : 'mp3'
    let args = text.split(' ')
    let last = args[args.length - 1]
    let quality = /^\d+$/.test(last) ? last : null
    if (quality) args.pop()
    const query = args.join(' ')
    const res = await y2mate(query, format, quality)
    if (!res?.download) throw 'Link download tidak tersedia dari converter.'

    const caption = `✅ *YT Downloader Success*\n\n` +
                    `📝 *Title:* ${res.title}\n` +
                    `👤 *Author:* ${res.author}\n` +
                    `⚙️ *Quality:* ${res.quality || (format === 'mp3' ? '320kbps' : '720p')}\n` +
                    `📂 *Format:* ${format.toUpperCase()}`

    const media = await downloadMedia(res.download, format)

    if (format === 'mp3') {
      await conn.sendMessage(m.chat, {
        audio: media.buffer,
        mimetype: media.type.mime || 'audio/mpeg',
        fileName: safeFileName(res.title, media.type.ext || 'mp3')
      }, { quoted: m })
    } else {
      const playableVideo = await toWhatsAppMp4(media.buffer)
      await conn.sendMessage(m.chat, {
        video: playableVideo,
        mimetype: 'video/mp4',
        fileName: safeFileName(res.title, 'mp4'),
        caption: caption
      }, { quoted: m })
    }
    await m.react('✅')
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal: ' + (e?.message || e))
  }
}

handler.help = ['yta','ytmp3','ytv','ytmp4']
handler.tags = ['downloader']
handler.command = /^(yta|ytmp3|ytv|ytmp4)$/i
handler.limit = true

export default handler
