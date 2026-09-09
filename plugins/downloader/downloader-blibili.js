import axios from 'axios'
import * as cheerio from 'cheerio'
import { exec } from 'child_process'
import fs from 'fs/promises'
import { promisify } from 'util'
import path from 'path'
import { tmpdir } from 'os'
import { status, toSmallNum } from '../../lib/style.js'

const execPromise = promisify(exec)

async function bilibilidl(url, quality = '480P') {
  try {
    let aid = /\/video\/(\d+)/.exec(url)?.[1]
    if (!aid) throw new Error('ID Video Bilibili tidak ditemukan.')

    const appInfo = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    }).then(res => res.data)

    const $ = cheerio.load(appInfo)
    const title = $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() || 'Bilibili Video'
    const description = $('meta[property="og:description"]').attr('content') || ''
    const cover = $('meta[property="og:image"]').attr('content') || ''
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
        'tf': '0',
        'spm_id': 'bstar-web.ugc-video-detail.0.0',
        'from_spm_id': 'bstar-web.homepage.trending.all',
        'fnval': '16',
        'fnver': '0',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    }).then(res => res.data)

    const selectedVideo = response.data?.playurl?.video?.find(v => v.stream_info?.desc_words === quality) || response.data?.playurl?.video?.[0]
    if (!selectedVideo) throw new Error('Video tidak ditemukan dengan kualitas tersebut.')

    const videoUrl = selectedVideo.video_resource?.url || selectedVideo.video_resource?.backup_url?.[0]
    const audioUrl = response.data?.playurl?.audio_resource?.[0]?.url || response.data?.playurl?.audio_resource?.[0]?.backup_url?.[0]

    async function downloadBuffer(targetUrl) {
      let buffers = []
      let start = 0
      let end = 5 * 1024 * 1024
      let fileSize = 0

      while (true) {
        const range = `bytes=${start}-${end}`
        const res = await axios.get(targetUrl, {
          headers: {
            'DNT': '1',
            'Origin': 'https://www.bilibili.tv',
            'Referer': 'https://www.bilibili.tv/video/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Range: range
          },
          responseType: 'arraybuffer',
          timeout: 30000
        })

        if (fileSize === 0) {
          const contentRange = res.headers['content-range']
          if (contentRange) fileSize = parseInt(contentRange.split('/')[1])
        }

        buffers.push(Buffer.from(res.data))
        if (end >= fileSize - 1 || fileSize === 0) break

        start = end + 1
        end = Math.min(start + 5 * 1024 * 1024 - 1, fileSize - 1)
      }

      return Buffer.concat(buffers)
    }

    const videoBuffer = await downloadBuffer(videoUrl)
    const audioBuffer = audioUrl ? await downloadBuffer(audioUrl) : null

    if (!audioBuffer) return { title, description, cover, views, like, videoBuffer }

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

    return { title, description, cover, views, like, videoBuffer: mergedBuffer }
  } catch (error) {
    throw new Error(error.message)
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(status.warning(`Masukkan URL Bilibili yang valid!\n> Contoh: *${usedPrefix + command} https://www.bilibili.tv/video/4793817472438784*`))
  }

  await m.reply(status.wait('Sedang mengambil video dari Bilibili...'))

  try {
    let result = await bilibilidl(args[0], '480P')

    const caption = `*──  ୨୧ ✧ BILIBILI DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${result.title}*
*┆* ◈ ᴛᴀʏᴀɴɢᴀɴ : *${toSmallNum(result.views)}*
*┆* ᰔ ʟɪᴋᴇ     : *${toSmallNum(result.like)}*
*╰───────────────*

> _Video berhasil diunduh_`.trim()

    await conn.sendMessage(m.chat, {
      video: result.videoBuffer,
      caption
    }, { quoted: m })
  } catch (e) {
    m.reply(status.error(`Gagal memproses video Bilibili:\n> ${e.message || e}`))
  }
}

handler.help = ['blibli <url>', 'bilibili <url>']
handler.tags = ['downloader']
handler.command = /^(bili|blibli|bilibili)$/i
handler.limit = true

export default handler