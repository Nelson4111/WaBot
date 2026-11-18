import { status, toSmallNum } from '../../lib/style.js'
import { downloadAio } from './downloader-aio.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (text || (m.quoted ? m.quoted.text : ''))?.trim()
  const match = input?.match(/https?:\/\/[^\s]+/i)
  if (!match) {
    return m.reply(
      status.warning(
        `Masukkan tautan media!\n` +
        `> Contoh: *${usedPrefix + command} https://www.tiktok.com/...*`
      )
    )
  }

  const url = match[0]
  await m.react('⏳')

  try {
    const result = await downloadAio(url)
    const cleanTitle = (result.title || 'Media').trim().slice(0, 180)
    const media = result.medias
      .map(item => {
        const mediaUrl = typeof item?.url === 'string' ? item.url : ''
        const hint = [
          item?.type,
          item?.mimetype,
          item?.extension,
          mediaUrl
        ].join(' ').toLowerCase()
        const isVideo = /video|mp4|mov|webm|m4v/.test(hint)
        const isImage = /image|photo|picture|jpe?g|png|webp|gif|avif/.test(hint)

        if (!mediaUrl || (!isVideo && !isImage)) return null
        return { url: mediaUrl, isVideo }
      })
      .filter(Boolean)

    if (!media.length) {
      throw new Error('Tautan ini tidak menghasilkan foto/video yang bisa dikirim sebagai view-once.')
    }

    const unsupportedCount = result.medias.length - media.length
    await conn.sendMessage(m.chat, {
      text: `🔗 Link sumber: ${url}${unsupportedCount ? `\n\n_${toSmallNum(unsupportedCount)} media audio/file lain tidak dikirim karena WhatsApp view-once hanya mendukung foto dan video._` : ''}`
    }, { quoted: m })

    for (const [position, item] of media.entries()) {
      const caption = `*──  ୨୧ ✧ VIEW-ONCE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
> ⟡ ᴊᴜᴅᴜʟ : *${cleanTitle || 'Media'}*
> ◈ ᴍᴇᴅɪᴀ : *${toSmallNum(position + 1)} / ${toSmallNum(media.length)}*
> ⌬ ᴛɪᴘᴇ  : *${item.isVideo ? 'Video' : 'Foto / Gambar'}*
*╰───────────────*

> _Pesan ini hanya dapat dilihat sekali. Link sumber ada di pesan sebelumnya._`

      await conn.sendMessage(m.chat, item.isVideo ? {
        video: { url: item.url },
        caption,
        mimetype: 'video/mp4',
        viewOnce: true
      } : {
        image: { url: item.url },
        caption,
        viewOnce: true
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('[AIO ViewOnce Handler Error]:', e)
    m.reply(status.error(`Gagal mengirim media view-once:\n> ${e?.message || e}`))
  }
}

handler.help = ['aiovo <url>']
handler.tags = ['downloader']
handler.command = /^aiovo$/i
handler.limit = true
handler.register = true

export default handler
