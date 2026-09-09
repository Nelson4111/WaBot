import yts from 'yt-search'
import { downloadYouTubeMedia } from '../../lib/youtube.js'
import { status, toSmallNum } from '../../lib/style.js'

function safeFileName(name, ext) {
  const base = String(name || 'youtube')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  return `${base || 'youtube'}.${ext}`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan judul lagu atau tautan YouTube!\n> Contoh: *${usedPrefix + command} Alan Walker Faded*\n> Atau: *${usedPrefix + command} https://youtu.be/...*`))
  }

  await m.react('⏳')
  try {
    const isVideo = /ytv|mp4/i.test(command)
    const format = isVideo ? 'mp4' : 'mp3'
    let args = text.split(' ')
    let last = args[args.length - 1]
    let quality = /^\d+$/.test(last) ? last : null
    if (quality) args.pop()
    const query = args.join(' ')

    let url = query
    let title = ''
    let author = ''

    if (!/youtu\.be|youtube\.com/i.test(query)) {
      const s = await yts(query)
      const v = s.videos?.[0]
      if (!v) throw new Error(`Video tidak ditemukan untuk kata kunci "${query}"`)
      url = v.url
      title = v.title
      author = v.author?.name || '-'
    }

    const media = await downloadYouTubeMedia(url, format, quality)
    const displayTitle = title || media.title || 'YouTube Media'

    const caption = `*──  ୨୧ ✧ YOUTUBE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
> ⟡ ᴊᴜᴅᴜʟ    : *${displayTitle}*
> ✧ ᴀᴜᴛʜᴏʀ   : *${author || '-'}*
> ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *${toSmallNum(quality || (format === 'mp3' ? '128kbps' : '720p'))}*
> ⚙ ꜰᴏʀᴍᴀᴛ   : *${format.toUpperCase()}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    if (format === 'mp3') {
      await conn.sendMessage(m.chat, {
        audio: media.buffer,
        mimetype: 'audio/mpeg',
        fileName: safeFileName(displayTitle, 'mp3')
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: media.buffer,
        mimetype: 'video/mp4',
        fileName: safeFileName(displayTitle, 'mp4'),
        caption
      }, { quoted: m })
    }
    await m.react('✅')
  } catch (e) {
    console.error('[YTA Handler Error]:', e)
    m.reply(status.error(`Gagal memproses YouTube:\n> ${e?.message || e}`))
  }
}

handler.help = ['yta','ytmp3','ytv','ytmp4']
handler.tags = ['downloader']
handler.command = /^(yta|ytmp3|ytv|ytmp4)$/i
handler.limit = true

export default handler
