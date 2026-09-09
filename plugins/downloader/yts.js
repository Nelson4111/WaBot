import yts from 'yt-search'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan kata kunci pencarian YouTube!\n> Contoh: *${usedPrefix + command} Alan Walker Faded*`))
  }

  await m.reply(status.wait('Sedang mencari video di YouTube...'))

  try {
    const results = await yts(text)
    const videos = results.all?.filter(v => v.type === 'video') || []
    if (videos.length === 0) throw new Error(`Video tidak ditemukan untuk kata kunci "${text}"`)

    const video = videos[0]
    const thumb = video.thumbnail || await getMenuThumbnail()

    const caption = `*──  ୨୧ ✧ YOUTUBE SEARCH ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
> ⟡ ᴊᴜᴅᴜʟ    : *${video.title}*
> ✧ ᴄʜᴀɴɴᴇʟ  : *${video.author?.name || '-'}*
> ⧗ ᴅᴜʀᴀꜱɪ   : *${toSmallNum(video.timestamp || '0:00')}*
> ◈ ᴠɪᴇᴡꜱ    : *${toSmallNum(video.views ? video.views.toLocaleString('id-ID') : '-')}*
> ⏱ ᴜᴘʟᴏᴀᴅ   : *${video.ago || '-'}*
*╰───────────────*

> *Pilihan Unduh:*
> 🎵 *Audio:* *${usedPrefix}ytmp3 ${video.url}*
> 🎥 *Video:* *${usedPrefix}ytmp4 ${video.url}*`.trim()

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    const buttons = [
      ['📜 Menu Utama', `${usedPrefix}menu`]
    ]

    await conn.sendButtonV2(m.chat, {
      title: '⛩️ YOUTUBE DISCOVERY',
      subtitle: 'Avelia • Video & Audio Discovery',
      text: caption,
      footer,
      buffer: thumb,
      buttons
    }, m)
  } catch (e) {
    m.reply(status.error(`Gagal melakukan pencarian YouTube.\n> ${e?.message || e}`))
  }
}

handler.help = ['yts <query>', 'ytsearch <query>']
handler.tags = ['tools', 'downloader']
handler.command = /^yts(earch)?$/i
handler.limit = true

export default handler