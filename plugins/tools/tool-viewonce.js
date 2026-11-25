import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const quoted = m.quoted
  const mediaType = quoted?.mediaType
  const mediaMessage = mediaType ? quoted.mediaMessage?.[mediaType] : null
  const isImage = mediaType === 'imageMessage'
  const isVideo = mediaType === 'videoMessage'

  // 1. KASUS A: Pengguna mengirim atau membalas teks untuk View-Once Text
  const hasTextParam = !!(text && text.trim())
  const hasQuotedText = !!(quoted && quoted.text && !isImage && !isVideo)

  if (hasTextParam || hasQuotedText) {
    const rawSecret = (hasTextParam ? text.trim() : quoted.text).trim()

    const formattedSecret = `*──  ୨୧ ✧ PESAN SEKALI LIHAT ✧ ୨୧  ──*\n\n` +
      `*╭  〔 🔒 ʀ ᴀ ʜ ᴀ ꜱ ɪ ᴀ 〕*\n` +
      `> ${rawSecret}\n` +
      `*╰───────────────*\n\n` +
      `> 🛡️ _Pesan rahasia ini terenkripsi dan otomatis hancur setelah dibaca._`

    try {
      // Buat pesan viewOnceMessage tingkat rendah (Protobuf) dengan extendedTextMessage
      const viewOnceMsg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            extendedTextMessage: {
              text: formattedSecret
            }
          }
        }
      }, { userJid: conn.user?.id || m.sender })

      await conn.relayMessage(m.chat, viewOnceMsg.message, { messageId: viewOnceMsg.key.id })

      // Jika di dalam grup, hapus pesan perintah pengguna agar teks rahasia tidak tertinggal di riwayat chat
      if (m.isGroup) {
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
      }

      await m.react('🔒').catch(() => {})
      return
    } catch (errText) {
      console.error('[ViewOnce Text Error]:', errText)
      return m.reply(status.error(`Gagal mengirim pesan teks sekali lihat:\n> ${errText?.message || errText}`))
    }
  }

  // 2. KASUS B: Pengguna membalas Media Foto atau Video
  if (quoted && (isImage || isVideo)) {
    await m.react('⏳').catch(() => {})

    try {
      const buffer = await quoted.download()
      if (!buffer?.length) throw new Error('Media tidak berhasil diunduh.')

      const caption = text?.trim() || mediaMessage?.caption || ''
      await conn.sendMessage(m.chat, isImage ? {
        image: buffer,
        mimetype: mediaMessage?.mimetype || 'image/jpeg',
        caption,
        viewOnce: true
      } : {
        video: buffer,
        mimetype: mediaMessage?.mimetype || 'video/mp4',
        caption,
        viewOnce: true
      }, { quoted: m })

      await m.react('✅').catch(() => {})
      return
    } catch (e) {
      await m.react('❌').catch(() => {})
      console.error('[ViewOnce Media Error]:', e)
      return m.reply(status.error(`Gagal mengirim media sebagai sekali lihat:\n> ${e?.message || e}`))
    }
  }

  // 3. Panduan Penggunaan jika tidak ada input yang cocok
  const helpText = `*──  ୨୧ ✧ PESAN SEKALI LIHAT ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ✦ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* ⟡ ᴛᴇᴋꜱ ꜱᴇᴋᴀʟɪ ʟɪʜᴀᴛ :\n` +
    `*┆* › *${usedPrefix + command}* <pesan rahasia>\n` +
    `*┆* ⟡ ᴍᴇᴅɪᴀ ꜱᴇᴋᴀʟɪ ʟɪʜᴀᴛ :\n` +
    `*┆* › Balas foto atau video dengan *${usedPrefix + command}*\n` +
    `*╰───────────────*\n\n` +
    `> 🔒 _Pesan teks di grup akan otomatis dihapus demi menjaga privasi._`

  return m.reply(helpText)
}

handler.help = ['vo <teks/media>', 'votext <teks>', 'viewonce']
handler.tags = ['tools']
handler.command = /^(vo|viewonce|votext|sekalilihat)$/i
handler.limit = true
handler.register = true

export default handler
