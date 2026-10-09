import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan teks:
> › *${usedPrefix + command}* <teks>
>
> Contoh:
> › *${usedPrefix + command} avelia berjalan*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
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
        console.warn('[PRIVASI STIKER BRATVID] Gagal menghapus perintah:', error?.message)
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
          console.warn('[PRIVASI STIKER BRATVID] Gagal menghapus pesan sumber:', error?.message)
        }
      }

      const loadingPlayerText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Pesan dan perintah kamu telah dihapus dari grup demi privasi.*
> ⏳ *Sedang memproses stiker Brat animasi kamu...*
> 🛡️ _Pemberitahuan: Stiker di bawah hanya dapat dilihat oleh kamu sendiri (anggota lain hanya melihat status terkunci)._`.trim()

      const loadingSpectatorText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Stiker Brat animasi sedang dibuat secara privat untuk @${userTag}.*
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
        console.warn('[PRIVASI STIKER BRATVID] Gagal mengirim pemberitahuan privasi:', error?.message)
        await conn.sendMessage(m.chat, { text: loadingSpectatorText, mentions })
        await conn.sendMessage(targetJid, { text: loadingPlayerText })
      }
    }

    let buffer = null
    // 1. Primary: Ryzumi Animated Brat API
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/image/brat/animated?text=${encodeURIComponent(text.trim())}`, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(res.data)
    } catch (e1) {
      // 2. Fallback: Siputzx Animated Brat
      const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text.trim())}`
      const resFallback = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(resFallback.data)
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal menghasilkan animasi teks Brat.')
    }

    const stickerBuffer = await createSticker(buffer, {
      type: StickerTypes.FULL,
      pack: global.stickpack || global.namebot || 'Avelia Pack',
      author: global.stickauth || global.author || 'Nenel',
      categories: ['✨'],
      id: '.',
      quality: 70,
      background: null
    })

    if (m.isGroup) {
      const spectatorText = `> 🔒 _[Stiker Brat animasi terkunci - khusus @${userTag}]_`
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
        console.warn('[PRIVASI STIKER BRATVID] Gagal mengirim pesan dual-visibility:', error?.message)
        await conn.sendMessage(m.chat, { text: spectatorText, mentions })
        await conn.sendFile(targetJid, stickerBuffer, 'bratvid.webp', '', null)
      }
    } else {
      await conn.sendFile(m.chat, stickerBuffer, 'bratvid.webp', '', m)
    }
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal membuat stiker animasi Brat: ${e.message}
*╰───────────────*`)
  }
}

handler.help = ['bratvid <teks>', 'bratgif <teks>']
handler.tags = ['sticker', 'maker']
handler.command = /^(bratvid|bratgif)$/i
handler.limit = true

export default handler