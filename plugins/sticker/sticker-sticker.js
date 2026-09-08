import { sticker, addExif } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import { Sticker } from 'wa-sticker-formatter'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // function react lokal khusus di plugin ini
  const react = async (emoji) => {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch (e) {
      // abaikan error reaksi
    }
  }

  try {
    const mediaList = getStickerMediaList(conn, m)
    if (!mediaList.length) {
      return m.reply(`Balas gambar atau video dengan command *${usedPrefix + command}*`)
    }

    await react('🕒') // reaction mulai

    let [packname, ...authorArr] = args.join` `.split`|`
    packname = packname || global.stickpack
    let author = authorArr.join`|` || global.stickauth
    let sent = 0

    // 1. Unduh seluruh media terlebih dahulu sebelum pesan dihapus agar buffer aman
    const downloadedMedia = []
    for (const media of mediaList) {
      if (/video/g.test(media.mime) && media.seconds > 10) continue
      const img = await media.download?.()
      if (img) downloadedMedia.push({ img, mime: media.mime })
    }

    if (!downloadedMedia.length) {
      await react('❌')
      return m.reply('Media tidak bisa diunduh atau durasi video melebihi 10 detik.')
    }

    // 2. Fitur Privasi Grup (Dual-Visibility ala tesbutton 7):
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
        console.warn('[PRIVASI STIKER] Gagal menghapus command di grup:', errDelKey?.message)
      }

      // 2. Jika user me-reply foto, hapus juga pesan foto asli yang di-reply
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
          console.warn('[PRIVASI STIKER] Gagal menghapus quoted foto di grup:', errDelQ?.message)
        }
      }

      // 3. Pesan 1 (Loading & Informasi Privasi Dual-Visibility):
      // - Pemohon melihat info privasi & proses khusus untuknya
      // - Penonton melihat pengumuman bahwa foto asli telah dihapus demi privasi
      const loadingPlayerText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Foto kamu telah dihapus dari grup demi privasi.*
> ⏳ *Sedang memproses stiker kamu...*
> 🛡️ _Pemberitahuan: Stiker di bawah hanya dapat dilihat oleh kamu sendiri (anggota lain hanya melihat status terkunci)._`.trim()

      const loadingSpectatorText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Stiker telah dibuat secara privat untuk @${userTag}.*
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
        console.warn('[PRIVASI STIKER] Gagal kirim notice loading dual:', errNotice?.message)
      }
    }

    // 4. Pesan 2: Konversi dan kirim stiker dengan mekanisme Dual-Visibility (ala tesbutton 7)
    // Muncul tepat di bawah Pesan 1, sehingga di layar pemohon tampak menyatu padahal 2 pesan terpisah!
    for (const item of downloadedMedia) {
      const stiker = await createStickerFromMedia(item.img, item.mime, packname, author)
      if (!stiker) continue

      if (m.isGroup) {
        // Teks status terkunci singkat untuk penonton (karena teks pengumuman lengkap sudah ada di Pesan 1)
        const stickerSpectatorText = `> 🔒 _[Stiker Terkunci - Khusus @${userTag}]_`
        const mentions = cleanTargetJid.endsWith('@s.whatsapp.net') ? [cleanTargetJid] : []

        try {
          // Buat objek IMessage stiker untuk pemain target
          const playerMessage = await generateWAMessageContent({ sticker: stiker }, { upload: conn.waUploadToServer })
          
          // Kirim pesan dual-visibility ke room grup (Pemain dapat stiker, penonton dapat status terkunci)
          await sendDualGroupMessage(conn, m.chat, targetJid, playerMessage, stickerSpectatorText, {
            contextInfo: {
              mentionedJid: mentions
            }
          })
        } catch (errDual) {
          console.warn('[DUAL STIKER ERROR, FALLBACK]:', errDual?.message)
          // Fallback tanpa quoted agar gambar tidak bocor
          await conn.sendMessage(m.chat, { text: stickerSpectatorText, mentions })
          try {
            await conn.sendFile(targetJid, stiker, 'sticker.webp', '', null)
          } catch {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', null)
          }
        }
      } else {
        // Obrolan pribadi biasa
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      }
      sent++
    }

    if (!sent) {
      await react('❌')
      return m.reply('❌ Media tidak dapat dikonversi menjadi stiker.')
    }

    await react('✨')
  } catch (e) {
    console.error(e)
    await react('❌')
    m.reply('❌ Terjadi kesalahan saat memproses stiker.')
  }
}

handler.help = ['sticker [packname|author]']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.register = false

export default handler

function getStickerMediaList(conn, m) {
  const q = m.quoted ? m.quoted : m
  const single = toStickerMedia(conn, q)
  if (single) return [single]

  const albumKeys = q?.id ? [...new Set([
    `${m.chat}:${q.id}`,
    `${q.chat || m.chat}:${q.id}`,
    `${q.key?.remoteJid || m.chat}:${q.id}`
  ])] : []
  let albumItems = albumKeys.flatMap(key => conn.albumMessages?.[key] || [])
  albumItems = [...new Map(albumItems.map(item => [item.key?.id, item])).values()]

  if (!albumItems.length && q?.id) {
    const candidateChats = [...new Set([m.chat, q.chat || m.chat, q.key?.remoteJid || m.chat])]
    albumItems = candidateChats
      .flatMap(chat => Object.values(conn.chats?.[chat]?.messages || {}))
      .filter(item => isAlbumChildOf(item, q.id))
  }

  if (!albumItems.length && q?.id && conn.chats) {
    albumItems = Object.values(conn.chats)
      .flatMap(chat => Object.values(chat?.messages || {}))
      .filter(item => isAlbumChildOf(item, q.id))
  }

  return albumItems
    .map(item => toStickerMedia(conn, item))
    .filter(Boolean)
}

function isAlbumChildOf(item, parentId) {
  const type = Object.keys(item?.message || {}).find(key => ['imageMessage', 'videoMessage'].includes(key))
  const parent = item?.message?.messageContextInfo?.messageAssociation?.parentMessageKey ||
    item?.message?.[type]?.contextInfo?.messageAssociation?.parentMessageKey
  return parent?.id === parentId && !!type
}

function toStickerMedia(conn, message) {
  if (!message) return null

  if (message.message) {
    const type = Object.keys(message.message).find(key => ['imageMessage', 'videoMessage'].includes(key))
    if (!type) return null
    const content = message.message[type]
    return {
      mime: content.mimetype || type.replace('Message', ''),
      seconds: content.seconds || 0,
      download: () => conn.downloadM(content, type.replace(/Message/i, ''))
    }
  }

  const mime = (message.msg || message).mimetype || message.mediaType || ''
  if (!/image|video/g.test(mime)) return null
  return {
    mime,
    seconds: (message.msg || message).seconds || 0,
    download: () => message.download?.()
  }
}

async function createStickerFromMedia(img, mime, packname, author) {
  if (/video/g.test(mime)) {
    let stiker = false
    try {
      stiker = await sticker(img, false, global.stickpack, global.stickauth)
    } catch (e) {
      console.error(e)
    } finally {
      if (!stiker) {
        let out = await uploadFile(img)
        stiker = await sticker(false, out, global.stickpack, global.stickauth)
      }
    }
    return stiker
  }

  let stiker = false
  try {
    stiker = await addExif(img, packname, author)
  } catch (e) {
    console.error(e)
  } finally {
    if (!stiker) stiker = await createSticker(img, false, packname, author)
  }
  return stiker
}

// function bikin stiker manual
async function createSticker(img, url, packName, authorName, quality = 70) {
  let stickerMetadata = {
    type: 'full',
    pack: packName,
    author: authorName,
    quality
  }
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}
