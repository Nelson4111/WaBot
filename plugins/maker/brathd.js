import { Sticker } from 'wa-sticker-formatter'
import axios from 'axios'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const content = text || m.quoted?.text
  if (!content) return m.reply(`Gunakan *${usedPrefix + command} <teks>* atau balas pesan teks.`)

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  let targetJid
  let userTag
  let mentions = []

  if (m.isGroup) {
    targetJid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const targetDigits = targetJid.split('@')[0].split(':')[0].replace(/\D/g, '')
    userTag = targetDigits || targetJid.split('@')[0]
    mentions = targetJid.endsWith('@s.whatsapp.net') ? [targetJid] : []

    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (error) {
      console.warn('[PRIVASI STIKER BRATHD] Gagal menghapus perintah:', error?.message)
    }

    if (m.quoted) {
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
      } catch (error) {
        console.warn('[PRIVASI STIKER BRATHD] Gagal menghapus pesan sumber:', error?.message)
      }
    }

    const loadingPlayerText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Pesan dan perintah kamu telah dihapus dari grup demi privasi.*
> ⏳ *Sedang memproses stiker Brat HD kamu...*
> 🛡️ _Pemberitahuan: Stiker di bawah hanya dapat dilihat oleh kamu sendiri (anggota lain hanya melihat status terkunci)._`.trim()

    const loadingSpectatorText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴍᴀɴ!)
> 🔒 *Stiker Brat HD sedang dibuat secara privat untuk @${userTag}.*
> 🛡️ _Pesan sumber dan perintah telah dihapus dari grup demi menjaga privasi._`.trim()

    try {
      await sendDualGroupMessage(
        conn,
        m.chat,
        targetJid,
        { extendedTextMessage: { text: loadingPlayerText } },
        loadingSpectatorText,
        { contextInfo: { mentionedJid: mentions } }
      )
    } catch (error) {
      console.warn('[PRIVASI STIKER BRATHD] Gagal mengirim pemberitahuan privasi:', error?.message)
      await conn.sendMessage(m.chat, { text: loadingSpectatorText, mentions })
      await conn.sendMessage(targetJid, { text: loadingPlayerText })
    }
  }

  try {
    let imageBuffer
    try {
      const response = await axios.get(`https://api.ryzumi.net/api/image/brat?text=${encodeURIComponent(content.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      imageBuffer = Buffer.from(response.data)
    } catch {
      const response = await axios.get(`https://aqul-brat.hf.space?text=${encodeURIComponent(content.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      imageBuffer = Buffer.from(response.data)
    }

    if (!imageBuffer?.length) throw new Error('API Brat tidak menghasilkan gambar.')

    const stickerBuffer = await createSticker(
      imageBuffer,
      null,
      global.stickpack || global.namebot || 'Avelia Pack',
      global.stickauth || global.author || 'Nenel',
      90
    )

    if (!stickerBuffer) throw new Error('Gagal mengonversi gambar Brat HD menjadi stiker.')

    if (m.isGroup) {
      const spectatorText = `> 🔒 _[Stiker Brat HD terkunci - khusus @${userTag}]_`
      try {
        const playerMessage = await generateWAMessageContent(
          { sticker: stickerBuffer },
          { upload: conn.waUploadToServer }
        )
        await sendDualGroupMessage(
          conn,
          m.chat,
          targetJid,
          playerMessage,
          spectatorText,
          { contextInfo: { mentionedJid: mentions } }
        )
      } catch (error) {
        console.warn('[PRIVASI STIKER BRATHD] Gagal mengirim pesan dual-visibility:', error?.message)
        await conn.sendMessage(m.chat, { text: spectatorText, mentions })
        await conn.sendFile(targetJid, stickerBuffer, 'brathd.webp', '', null)
      }
    } else {
      await conn.sendFile(m.chat, stickerBuffer, 'brathd.webp', '', m)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`Gagal membuat stiker Brat HD: ${error.message}`)
  }
}

handler.help = ['brathd <teks>']
handler.tags = ['sticker']
handler.command = /^(brathd)$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler

async function createSticker(img, url, packName, authorName, quality) {
  const stickerMetadata = {
    type: 'crop',
    pack: packName,
    author: authorName,
    quality
  }
  return (new Sticker(img || url, stickerMetadata)).toBuffer()
}
