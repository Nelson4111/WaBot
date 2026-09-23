import axios from 'axios'
import * as cheerio from 'cheerio'
import { exec } from 'child_process'
import fs from 'fs/promises'
import { promisify } from 'util'
import path from 'path'
import { tmpdir } from 'os'
import { status, toSmallNum } from '../../lib/style.js'

const execPromise = promisify(exec)

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function getBilibiliViaRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/bilibili?url=${encodeURIComponent(url)}`,
    {
      timeout: 25000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.status || !data?.data) {
    throw new Error('Gagal mengambil data dari server Ryzumi')
  }

  const d = data.data
  const videoItem = d.mediaList?.videoList?.[0]
  if (!videoItem?.url) throw new Error('URL video Bilibili tidak ditemukan')

  return {
    title: (d.title || 'Bilibili Video').trim(),
    views: d.views || '-',
    like: d.like || '-',
    videoUrl: videoItem.url
  }
}

// ─── Scraper Fallback ───────────────────────────────────────────────────────
async function bilibilidlFallback(url, quality = '480P') {
  let aid = /\/video\/(\d+)/.exec(url)?.[1]
  if (!aid) throw new Error('ID Video Bilibili tidak ditemukan.')

  const appInfo = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000
  }).then(res => res.data)

  const $ = cheerio.load(appInfo)
  const title = $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() || 'Bilibili Video'
  const like = $('.interactive__btn.interactive__like .interactive__text').text().trim() || '-'
  const views = $('.bstar-meta__tips-left .bstar-meta-text').first().text().replace(' Ditonton', '').trim() || '-'

  const response = await axios.get('https://api.bilibili.tv/intl/gateway/web/playurl', {
    params: {
      's_locale': 'id_ID',
      'platform': 'web',
      'aid': aid,
      'qn': '64',
      'type': '0',
      'device': 'wap',
      'tf': '0'
    },
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000
  }).then(res => res.data)

  const selectedVideo = response.data?.playurl?.video?.find(v => v.stream_info?.desc_words === quality) || response.data?.playurl?.video?.[0]
  if (!selectedVideo) throw new Error('Video tidak ditemukan.')

  const videoUrl = selectedVideo.video_resource?.url || selectedVideo.video_resource?.backup_url?.[0]
  const audioUrl = response.data?.playurl?.audio_resource?.[0]?.url || response.data?.playurl?.audio_resource?.[0]?.backup_url?.[0]

  async function downloadBuffer(targetUrl) {
    const res = await axios.get(targetUrl, {
      headers: {
        'Origin': 'https://www.bilibili.tv',
        'Referer': 'https://www.bilibili.tv/video/',
        'User-Agent': 'Mozilla/5.0'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    })
    return Buffer.from(res.data)
  }

  const videoBuffer = await downloadBuffer(videoUrl)
  const audioBuffer = audioUrl ? await downloadBuffer(audioUrl) : null
  if (!audioBuffer) return { title, views, like, videoBuffer }

  const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6)
  const tempVideoPath = path.join(tmpdir(), `bili_vid_${id}.mp4`)
  const tempAudioPath = path.join(tmpdir(), `bili_aud_${id}.mp3`)
  const tempOutputPath = path.join(tmpdir(), `bili_out_${id}.mp4`)

  await fs.writeFile(tempVideoPath, videoBuffer)
  await fs.writeFile(tempAudioPath, audioBuffer)

  await execPromise(`ffmpeg -i "${tempVideoPath}" -i "${tempAudioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -f mp4 -y "${tempOutputPath}"`)
  const mergedBuffer = await fs.readFile(tempOutputPath)

  await Promise.all([
    fs.unlink(tempVideoPath).catch(() => {}),
    fs.unlink(tempAudioPath).catch(() => {}),
    fs.unlink(tempOutputPath).catch(() => {})
  ])

  return { title, views, like, videoBuffer: mergedBuffer }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      status.warning(
        `Masukkan URL Bilibili yang valid!\n` +
        `> Contoh: *${usedPrefix + command} https://www.bilibili.tv/video/4793817472438784*`
      )
    )
  }

  await m.react('⏳')

  try {
    let result = null
    try {
      result = await getBilibiliViaRyzumi(args[0])
    } catch (e) {
      console.warn('[Bilibili Ryzumi failed]:', e.message)
      result = await bilibilidlFallback(args[0], '480P')
    }

    let cleanTitle = result.title || ''
    if (cleanTitle.length > 180) {
      cleanTitle = cleanTitle.substring(0, 177) + '...'
    }

    const caption = `*──  ୨୧ ✧ BILIBILI DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${cleanTitle}*
*┆* ◈ ᴛᴀʏᴀɴɢᴀɴ : *${toSmallNum(result.views)}*
*┆* ᰔ ʟɪᴋᴇ     : *${toSmallNum(result.like)}*
*╰───────────────*

> _Video berhasil diunduh_`.trim()

    if (result.videoBuffer) {
      await conn.sendMessage(m.chat, {
        video: result.videoBuffer,
        caption,
        mimetype: 'video/mp4'
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: result.videoUrl },
        caption,
        mimetype: 'video/mp4'
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal memproses video Bilibili:\n> ${e.message || e}`))
  }
}

handler.help = ['blibli <url>', 'bilibili <url>']
handler.tags = ['downloader']
handler.command = /^(bili|blibli|bilibili)$/i
handler.limit = true

export default handler