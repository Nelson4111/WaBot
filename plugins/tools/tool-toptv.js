import { ffmpeg } from '../../lib/converter.js'
import { status } from '../../lib/style.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''
  const isVideo = /video|gif/.test(mime)

  if (!isVideo) {
    return m.reply(
      `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
      `> Balas video pendek dengan perintah untuk dijadikan Video Note (Bulat):\n` +
      `> › *${usedPrefix + command}*\n` +
      `*╰───────────────*`
    )
  }

  let seconds = (quoted.msg || quoted).seconds || 0
  if (seconds > 60) {
    return m.reply(
      `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
      `> Durasi video maksimal untuk Video Note (PTV) adalah *𝟼𝟶 detik*.\n` +
      `*╰───────────────*`
    )
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

  try {
    let videoBuffer = await quoted.download()
    if (!videoBuffer?.length) throw new Error('Video tidak dapat diunduh.')

    // Potong 1:1 persegi sempurna (center crop) agar video note WhatsApp melingkar mulus
    let squareVideo = await ffmpeg(videoBuffer, [
      '-vf', 'crop=w=min(iw\\,ih):h=min(iw\\,ih),scale=480:480',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'faster',
      '-crf', '26',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100'
    ], 'mp4', 'mp4')

    // Kirim pesan video berformat Video Note (PTV)
    await conn.sendMessage(m.chat, {
      video: squareVideo.data,
      ptv: true // Flag resmi WhatsApp Baileys untuk Video Note bulat
    }, { quoted: m })

    squareVideo.delete().catch(() => {})
    await conn.sendMessage(m.chat, { react: { text: '🎥', key: m.key } }).catch(() => {})
  } catch (err) {
    console.error('[TopTV Error]:', err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    m.reply(status.error(`Gagal membuat Video Note:\n> ${err?.message || err}`))
  }
}

handler.help = ['toptv', 'ptv', 'videonote']
handler.tags = ['tools']
handler.command = /^(toptv|ptv|videonote)$/i
handler.limit = true
handler.register = true

handler.desc = 'Alat utilitas praktis untuk memproses toptv.'
handler.tutorial = [
  '.toptv <input>',
  'Ketik .toptv diikuti input yang diperlukan atau balas pesan target'
]

export default handler
