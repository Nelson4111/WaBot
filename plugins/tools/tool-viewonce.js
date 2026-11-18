import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const quoted = m.quoted
  if (!quoted) {
    return m.reply(status.warning(`Balas foto atau video dengan *${usedPrefix + command}*.`))
  }

  const mediaType = quoted.mediaType
  const mediaMessage = mediaType ? quoted.mediaMessage?.[mediaType] : null
  const isImage = mediaType === 'imageMessage'
  const isVideo = mediaType === 'videoMessage'

  if (!mediaMessage || (!isImage && !isVideo)) {
    return m.reply(status.warning('Pesan yang dibalas harus berupa foto atau video.'))
  }

  await m.react('⏳')

  try {
    const buffer = await quoted.download()
    if (!buffer?.length) throw new Error('Media tidak berhasil diunduh.')

    const caption = text?.trim() || mediaMessage.caption || ''
    await conn.sendMessage(m.chat, isImage ? {
      image: buffer,
      mimetype: mediaMessage.mimetype || 'image/jpeg',
      caption,
      viewOnce: true
    } : {
      video: buffer,
      mimetype: mediaMessage.mimetype || 'video/mp4',
      caption,
      viewOnce: true
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('[ViewOnce Resend Error]:', e)
    m.reply(status.error(`Gagal mengirim media sebagai sekali lihat:\n> ${e?.message || e}`))
  }
}

handler.help = ['vo', 'viewonce']
handler.tags = ['tools']
handler.command = /^(vo|viewonce)$/i
handler.limit = true
handler.register = true

export default handler
