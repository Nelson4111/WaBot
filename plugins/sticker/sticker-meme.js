/*
Name : Smeme 
Type : Plugins Esm
Sumber : https://whatsapp.com/channel/0029Vam3S2kB4hdRByB6XH3V
*/

import { Sticker } from 'wa-sticker-formatter'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent } from '@whiskeysockets/baileys'

async function uguu(filePath) {
  try {
    const form = new FormData()
    form.append('files[]', fs.createReadStream(filePath))
    const { data } = await axios.post('https://uguu.se/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    })
    return data.files[0].url
  } catch (err) {
    throw new Error(err.message)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [atas, bawah] = text.split`|`
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""
  if (!mime)
    throw `Balas media dengan perintah\n\n${usedPrefix + command} <teks atas>|<teks bawah>`
  
  m.react("🕒")
  let mediaBuffer = await q.download()
  if (!mediaBuffer) throw 'Gagal mengunduh media.'

  // 1. Fitur Privasi Grup (Dual-Visibility ala tesbutton 7):
  // Hapus pesan command pengguna & pesan foto asli dari grup agar privasi terjaga
  const targetJid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
  const cleanTargetJid = (targetJid && targetJid.endsWith('@s.whatsapp.net'))
    ? targetJid
    : (m.sender && m.sender.endsWith('@s.whatsapp.net') ? m.sender : targetJid)
  const phoneDigits = cleanTargetJid.split('@')[0].split(':')[0].replace(/\D/g, '')

  const userTag = phoneDigits || (cleanTargetJid ? cleanTargetJid.split('@')[0] : 'user')

  if (m.isGroup) {
    // 1. Hapus pesan command pengguna dari grup
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (errDelKey) {
      console.warn('[PRIVASI SMEME] Gagal menghapus command di grup:', errDelKey?.message)
    }

    // 2. Jika user me-reply foto, hapus juga pesan foto yang di-reply
    if (m.quoted) {
      try {
        const qKey = m.quoted.vM?.key || {
          remoteJid: m.chat,
          fromMe: m.quoted.fromMe || false,
          id: m.quoted.id,
          participant: m.quoted.sender || m.quoted.participant
        }
        await conn.sendMessage(m.chat, { delete: qKey })
      } catch (errDelQ) {
        console.warn('[PRIVASI SMEME] Gagal menghapus quoted foto di grup:', errDelQ?.message)
      }
    }

    // 3. Pesan 1 (Loading & Informasi Privasi Dual-Visibility):
    // - Pemohon melihat info privasi & proses khusus untuknya
    // - Penonton melihat pengumuman bahwa foto asli telah dihapus demi privasi
    const loadingPlayerText = `*──  ୨୧ ✧ PRIVASI MEME STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Foto kamu telah dihapus dari grup demi privasi.*
> ⏳ *Sedang memproses stiker meme kamu...*
> 🛡️ _Pemberitahuan: Stiker di bawah hanya dapat dilihat oleh kamu sendiri (anggota lain hanya melihat status terkunci)._`.trim()

    const loadingSpectatorText = `*──  ୨୧ ✧ PRIVASI MEME STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Stiker meme telah dibuat secara privat untuk @${userTag}.*
> 🛡️ _Foto asli dan pesan telah dihapus dari grup demi menjaga privasi._`.trim()

    const mentions = cleanTargetJid.endsWith('@s.whatsapp.net') ? [cleanTargetJid] : []

    try {
      await sendDualGroupMessage(
        conn,
        m.chat,
        targetJid,
        { extendedTextMessage: { text: loadingPlayerText } },
        loadingSpectatorText,
        { contextInfo: { mentionedJid: mentions } }
      )
    } catch (errNotice) {
      console.warn('[PRIVASI SMEME] Gagal kirim notice loading dual:', errNotice?.message)
    }
  }

  let ext = mime.split('/')[1] || "png"
  let tempFile = path.join(process.cwd(), `temp_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, mediaBuffer)
  
  try {
    let url = await uguu(tempFile)
    let stiker = null

    if (mime.startsWith("image/")) {
      let meme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas || " ")}/${encodeURIComponent(bawah || " ")}.png?background=${url}`
      stiker = await createSticker(meme, false, "", "")
    } else {
      stiker = await createSticker(url, false, "", "")
    }

    // 4. Pesan 2: Konversi dan kirim stiker dengan mekanisme Dual-Visibility (ala tesbutton 7)
    // Muncul tepat di bawah Pesan 1, sehingga di layar pemohon tampak menyatu padahal 2 pesan terpisah!
    if (m.isGroup) {
      const stickerSpectatorText = `> 🔒 _[Stiker Terkunci - Khusus @${userTag}]_`
      const mentions = cleanTargetJid.endsWith('@s.whatsapp.net') ? [cleanTargetJid] : []

      try {
        const playerMessage = await generateWAMessageContent({ sticker: stiker }, { upload: conn.waUploadToServer })
        await sendDualGroupMessage(conn, m.chat, targetJid, playerMessage, stickerSpectatorText, {
          contextInfo: {
            mentionedJid: mentions
          }
        })
      } catch (errDual) {
        console.warn('[DUAL SMEME ERROR, FALLBACK]:', errDual?.message)
        await conn.sendMessage(m.chat, { text: stickerSpectatorText, mentions })
        try {
          await conn.sendFile(targetJid, stiker, 'meme.webp', '', null)
        } catch {
          await conn.sendFile(m.chat, stiker, 'meme.webp', '', null)
        }
      }
    } else {
      await conn.sendFile(m.chat, stiker, 'meme.webp', '', m)
    }

    m.react("✨")
  } catch (err) {
    console.error(err)
    m.react("❌")
    m.reply(`❌ Gagal membuat stiker meme: ${err.message}`)
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
  }
}

handler.help = ["smeme <teks atas>|<teks bawah>"]
handler.tags = ["sticker"]
handler.command = /^(smeme)$/i
handler.limit = true
export default handler

async function createSticker(img, url, packName, authorName, quality) {
  let stickerMetadata = {
    type: "full",
    pack: global.namebot || "Avelia",
    author: global.author || "Nenel",
    quality: quality || 100
  }
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}