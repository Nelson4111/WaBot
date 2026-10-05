import { addExif, sticker } from '../../lib/sticker.js'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  const isCustomSticker = command.toLowerCase() === 'swm'
  if (!m.quoted) {
    return m.reply(isCustomSticker
      ? `Balas gambar atau video dengan *${usedPrefix}${command} [nama paket]|[pembuat]*.`
      : `Balas stiker dengan *${usedPrefix}${command} [nama paket]|[pembuat]*.`)
  }

  const [packnameInput, ...authorParts] = String(text || '').split('|')
  const packname = packnameInput.trim() || global.stickpack || 'Avelia Pack'
  const author = authorParts.join('|').trim() || global.stickauth || 'Avelia'
  const mime = m.quoted.mimetype || ''

  if (isCustomSticker ? !/image|video/i.test(mime) : !/webp/i.test(mime)) {
    return m.reply(isCustomSticker
      ? 'Media yang dibalas harus berupa gambar atau video.'
      : 'Media yang dibalas harus berupa stiker.')
  }
  if (isCustomSticker && /video/i.test(mime) && Number(m.quoted.seconds) > 10) {
    return m.reply('Durasi video maksimal 10 detik.')
  }

  const image = await m.quoted.download()
  if (!image) return m.reply('Media tidak dapat diunduh.')
  const stickerBuffer = isCustomSticker
    ? await sticker(image, false, packname, author)
    : await addExif(image, packname, author)

  if (!m.isGroup) {
    return conn.sendFile(m.chat, stickerBuffer, 'wm.webp', '', m, false, { asSticker: true })
  }

  const targetJid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
  const targetDigits = targetJid.split('@')[0].split(':')[0].replace(/\D/g, '')
  const userTag = targetDigits || targetJid.split('@')[0]
  const mentions = targetJid.endsWith('@s.whatsapp.net') ? [targetJid] : []
  const spectatorText = `> 🔒 _[Stiker ber-watermark terkunci - khusus @${userTag}]_`

  for (const key of [m.key, m.quoted.key].filter(Boolean)) {
    try {
      await conn.sendMessage(m.chat, { delete: key })
    } catch (error) {
      console.warn('[PRIVASI STIKER WM] Gagal menghapus pesan sumber:', error?.message)
    }
  }

  try {
    const playerMessage = await generateWAMessageContent(
      { sticker: stickerBuffer },
      { upload: conn.waUploadToServer }
    )
    return await sendDualGroupMessage(
      conn,
      m.chat,
      targetJid,
      playerMessage,
      spectatorText,
      { contextInfo: { mentionedJid: mentions } }
    )
  } catch (error) {
    console.warn('[PRIVASI STIKER WM] Gagal mengirim pesan dual-visibility:', error?.message)
    await conn.sendMessage(m.chat, { text: spectatorText, mentions })
    return conn.sendFile(targetJid, stickerBuffer, 'wm.webp', '', null, false, { asSticker: true })
  }
}

handler.help = ['wm <packname>|<author>', 'swm <packname>|<author>']
handler.tags = ['sticker']
handler.command = /^(?:wm|swm)$/i
handler.register = true

export default handler
