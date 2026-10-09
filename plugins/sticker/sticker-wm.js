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

  if (!m.isGroup) {
    const stickerBuffer = isCustomSticker
      ? await sticker(image, false, packname, author)
      : await addExif(image, packname, author)
    return conn.sendFile(m.chat, stickerBuffer, 'wm.webp', '', m, false, { asSticker: true })
  }

  const targetJid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
  const targetDigits = targetJid.split('@')[0].split(':')[0].replace(/\D/g, '')
  const userTag = targetDigits || targetJid.split('@')[0]
  const mentions = targetJid.endsWith('@s.whatsapp.net') ? [targetJid] : []
  const mediaName = isCustomSticker ? 'Foto/video' : 'Stiker sumber'
  const stickerName = isCustomSticker ? 'Stiker custom' : 'Stiker ber-watermark'
  const spectatorText = `> 🔒 _[${stickerName} terkunci - khusus @${userTag}]_`
  const noticePlayerText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *${mediaName} dan perintah kamu telah dihapus dari grup demi privasi.*
> ⏳ *Sedang memproses stiker kamu...*
> 🛡️ _Pemberitahuan: Stiker di bawah hanya dapat dilihat oleh kamu sendiri (anggota lain hanya melihat status terkunci)._`.trim()
  const noticeSpectatorText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *${stickerName} telah dibuat secara privat untuk @${userTag}.*
> 🛡️ _Media sumber dan pesan telah dihapus dari grup demi menjaga privasi._`.trim()

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch (error) {
    console.warn('[PRIVASI STIKER WM] Gagal menghapus perintah:', error?.message)
  }

  try {
    const rawParticipant = m.msg?.contextInfo?.participant ||
      m.message?.[m.mtype]?.contextInfo?.participant ||
      m.quoted.sender ||
      m.quoted.participant ||
      ''
    const storedMessage = (typeof conn.loadMessage === 'function' ? conn.loadMessage(m.quoted.id) : null) ||
      conn.chats?.[m.chat]?.messages?.[m.quoted.id]
    const quotedKey = storedMessage?.key || m.quoted.key || {
      remoteJid: m.chat,
      fromMe: m.quoted.fromMe || false,
      id: m.quoted.id,
      ...(rawParticipant ? { participant: rawParticipant } : {})
    }

    await conn.sendMessage(m.chat, { delete: quotedKey })
    if (m.quoted.sender && m.quoted.sender !== quotedKey.participant) {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.quoted.id,
          participant: m.quoted.sender
        }
      }).catch(error => {
        console.warn('[PRIVASI STIKER WM] Gagal menghapus media dengan sender fallback:', error?.message)
      })
    }
  } catch (error) {
    console.warn('[PRIVASI STIKER WM] Gagal menghapus media sumber:', error?.message)
  }

  try {
    await sendDualGroupMessage(
      conn,
      m.chat,
      targetJid,
      { extendedTextMessage: { text: noticePlayerText } },
      noticeSpectatorText,
      { contextInfo: { mentionedJid: mentions } }
    )
  } catch (error) {
    console.warn('[PRIVASI STIKER WM] Gagal mengirim pemberitahuan privasi:', error?.message)
    await conn.sendMessage(m.chat, { text: noticeSpectatorText, mentions })
    await conn.sendMessage(targetJid, { text: noticePlayerText })
  }

  const stickerBuffer = isCustomSticker
    ? await sticker(image, false, packname, author)
    : await addExif(image, packname, author)

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
