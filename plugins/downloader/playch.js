import yts from 'yt-search'
import { downloadYouTubeMedia } from '../../lib/youtube.js'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { status, toSmallNum } from '../../lib/style.js'

let isSending = false

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const channelId = global.ch?.includes('@newsletter') ? global.ch : '120363407318005025@newsletter'
  if (isSending) return m.reply(status.wait('Sedang ada antrean pengiriman audio ke saluran...'))
  if (!text) {
    return m.reply(status.warning(`Masukkan judul lagu yang ingin dikirim ke saluran!\n> Contoh: *${usedPrefix + command} dj 30 detik*`))
  }

  isSending = true
  await m.reply(status.wait('Sedang memproses audio dan konversi suara untuk saluran...'))

  const tmpDir = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const timestamp = Date.now()
  const inputPath = path.join(tmpDir, `input_${timestamp}.mp3`)
  const outputPath = path.join(tmpDir, `output_${timestamp}.opus`)

  try {
    const search = await yts(text)
    const videos = search.videos || []
    if (!videos.length) throw new Error(`Lagu dengan judul "${text}" tidak ditemukan.`)

    const video = videos[0]
    const { title, author, timestamp: duration, thumbnail, url } = video

    const mp3 = await downloadYouTubeMedia(url, 'mp3')
    fs.writeFileSync(inputPath, mp3.buffer)

    // Convert ke format VN (Ogg Opus)
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:a', 'libopus',
        '-b:a', '192k',
        '-ar', '48000',
        '-ac', '2',
        '-vbr', 'on',
        '-compression_level', '10',
        '-application', 'audio',
        '-f', 'opus',
        '-y', outputPath
      ])

      let stderr = ''
      ffmpeg.stderr.on('data', data => (stderr += data.toString()))
      ffmpeg.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error(`ffmpeg gagal konversi opus: ${stderr}`))
      })
    })

    const opusBuffer = fs.readFileSync(outputPath)

    await conn.sendMessage(channelId, {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title,
          body: author?.name || 'YouTube Music',
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { ephemeralExpiration: 0, quoted: null })

    const captionSuccess = `*──  ୨୧ ✧ SALURAN VOICE NOTE ✧ ୨୧  ──*

*╭  〔 ✦ ʟ ᴀ ɢ ᴜ  ᴛ ᴇ ʀ ᴋ ɪ ʀ ɪ ᴍ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${title}*
*┆* ✧ ᴀᴜᴛʜᴏʀ   : *${author?.name || '-'}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(duration)}*
*╰───────────────*

> _Lagu berhasil dikirimkan ke saluran WhatsApp sebagai Voice Note!_`.trim()

    await m.reply(captionSuccess)
  } catch (e) {
    console.error('❌ playch PTT Error:', e)
    m.reply(status.error(`Gagal mengirimkan audio ke saluran.\n> ${e?.message || e}`))
  } finally {
    if (fs.existsSync(inputPath)) try { fs.unlinkSync(inputPath) } catch {}
    if (fs.existsSync(outputPath)) try { fs.unlinkSync(outputPath) } catch {}
    isSending = false
  }
}

handler.help = ['playch <judul>']
handler.tags = ['downloader']
handler.command = /^playch$/i
handler.limit = false
handler.owner = true

export default handler