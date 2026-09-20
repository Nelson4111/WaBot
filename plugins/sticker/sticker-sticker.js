import { sticker, addExif } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import { Sticker } from 'wa-sticker-formatter'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent, proto } from '@whiskeysockets/baileys'
import { hkdf } from '@whiskeysockets/baileys/lib/Utils/crypto.js'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { PassThrough } from 'stream'
import archiver from 'archiver'
import sharp from 'sharp'

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
    packname = packname || global.stickpack || 'Avelia Pack'
    let author = authorArr.join`|` || global.stickauth || 'Avelia'
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

      // 2. Jika pesan berasal dari Album atau Quoted, hapus seluruh media asli dari grup
      if (mediaList.rawAlbumItems?.length > 1) {
        for (const item of mediaList.rawAlbumItems) {
          const key = item.key || {
            remoteJid: m.chat,
            fromMe: false,
            id: item.id
          }
          await conn.sendMessage(m.chat, { delete: key }).catch(() => {})
        }
      } else if (m.quoted) {
        try {
          const rawPart = m.msg?.contextInfo?.participant ||
            m.message?.[m.mtype]?.contextInfo?.participant ||
            m.quoted.sender ||
            m.quoted.participant ||
            ''

          const stored = (typeof conn.loadMessage === 'function' ? conn.loadMessage(m.quoted.id) : null) ||
            conn.chats?.[m.chat]?.messages?.[m.quoted.id]
          const storedKey = stored?.key

          if (storedKey && storedKey.participant) {
            await conn.sendMessage(m.chat, { delete: storedKey }).catch(() => {})
          } else {
            const qKey = {
              remoteJid: m.chat,
              fromMe: m.quoted.fromMe || false,
              id: m.quoted.id,
              ...(m.isGroup && !m.quoted.fromMe && rawPart ? { participant: rawPart } : {})
            }
            await conn.sendMessage(m.chat, { delete: qKey })

            // Fallback: Jika rawPart adalah LID dan sender adalah JID (atau sebaliknya), coba juga delete dengan sender
            if (m.isGroup && !m.quoted.fromMe && m.quoted.sender && m.quoted.sender !== rawPart) {
              await conn.sendMessage(m.chat, {
                delete: {
                  remoteJid: m.chat,
                  fromMe: false,
                  id: m.quoted.id,
                  participant: m.quoted.sender
                }
              }).catch(() => {})
            }
          }
        } catch (errDelQ) {
          console.warn('[PRIVASI STIKER] Gagal menghapus quoted foto di grup:', errDelQ?.message)
        }
      }

      // 3. Pesan 1 (Loading & Informasi Privasi Dual-Visibility):
      const isPack = downloadedMedia.length > 1
      const loadingPlayerText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *Foto kamu telah dihapus dari grup demi privasi.*
> ⏳ *Sedang memproses ${isPack ? `paket stiker (${downloadedMedia.length} stiker)` : 'stiker'} kamu...*
> 🛡️ _Pemberitahuan: Stiker di bawah hanya dapat dilihat oleh kamu sendiri (anggota lain hanya melihat status terkunci)._`.trim()

      const loadingSpectatorText = `*──  ୨୧ ✧ PRIVASI STIKER ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> 🔒 *${isPack ? `Paket stiker (${downloadedMedia.length} stiker)` : 'Stiker'} telah dibuat secara privat untuk @${userTag}.*
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

    // 4. Jika media lebih dari 1 (Album): Kirim dalam bentuk PAKET STIKER (Sticker Pack)
    // Mencegah spam di grup/chat dan menyatukan seluruh foto menjadi 1 bundle stiker resmi WhatsApp
    if (downloadedMedia.length > 1) {
      try {
        sent = await sendStickerPack(
          conn,
          m,
          downloadedMedia,
          packname,
          author,
          targetJid,
          cleanTargetJid,
          userTag
        )
      } catch (errPack) {
        console.warn('[PAKET STIKER ERROR, FALLBACK SATU PERSATU]:', errPack?.message || errPack)
        // Fallback: Kirim satu per satu jika pengunggahan paket stiker gagal
        sent = await sendIndividualStickers(
          conn,
          m,
          downloadedMedia,
          packname,
          author,
          targetJid,
          cleanTargetJid,
          userTag
        )
      }
    } else {
      // 1 Media: Kirim stiker tunggal seperti biasa
      sent = await sendIndividualStickers(
        conn,
        m,
        downloadedMedia,
        packname,
        author,
        targetJid,
        cleanTargetJid,
        userTag
      )
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

/**
 * Enkripsi buffer sesuai spesifikasi Signal / WhatsApp Media Protocol
 * @param {Buffer} buffer - Plaintext buffer
 * @param {Buffer} mediaKey - 32 bytes master media key
 * @param {string} infoLabel - Label HKDF resmi WhatsApp
 */
async function encryptForWhatsApp(buffer, mediaKey, infoLabel) {
  const expanded = await hkdf(mediaKey, 112, { info: infoLabel })
  const iv = expanded.slice(0, 16)
  const cipherKey = expanded.slice(16, 48)
  const macKey = expanded.slice(48, 80)

  const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv)
  const cipherText = Buffer.concat([cipher.update(buffer), cipher.final()])
  const mac = crypto.createHmac('sha256', macKey).update(iv).update(cipherText).digest().slice(0, 10)

  const encBuffer = Buffer.concat([cipherText, mac])
  const fileSha256 = crypto.createHash('sha256').update(buffer).digest()
  const fileEncSha256 = crypto.createHash('sha256').update(encBuffer).digest()

  return {
    encBuffer,
    fileSha256,
    fileEncSha256,
    fileLength: buffer.length
  }
}

/**
 * Mengirim kumpulan media sebagai satu Paket Stiker WhatsApp (stickerPackMessage)
 */
async function sendStickerPack(conn, m, downloadedMedia, packname, author, targetJid, cleanTargetJid, userTag) {
  const stickerPackId = crypto.randomUUID()
  const stickerEntries = []
  const zipFiles = []
  const stickerBuffers = []
  let totalStickerSize = 0

  for (let i = 0; i < downloadedMedia.length; i++) {
    const item = downloadedMedia[i]
    const stiker = await createStickerFromMedia(item.img, item.mime, packname, author)
    if (!stiker) continue

    const isAnimated = /video/g.test(item.mime) || isWebpAnimated(stiker)
    const sha256B64 = crypto.createHash('sha256').update(stiker).digest('base64')
    const fileName = `${sha256B64}.webp`

    stickerEntries.push({
      fileName,
      isAnimated,
      emojis: ['✨'],
      accessibilityLabel: '',
      isLottie: false,
      mimetype: 'image/webp'
    })

    zipFiles.push({ name: fileName, data: stiker })
    stickerBuffers.push(stiker)
    totalStickerSize += stiker.length
  }

  if (!stickerEntries.length) {
    throw new Error('Tidak ada stiker yang berhasil diproses.')
  }

  // 1. Buat Tray Icon PNG 252x252
  const trayIconFileName = `${stickerPackId}.png`
  const traySource = downloadedMedia[0].img || stickerBuffers[0]
  const trayIconBuffer = await sharp(traySource)
    .resize(252, 252, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  zipFiles.unshift({ name: trayIconFileName, data: trayIconBuffer })

  // 2. Buat file arsip ZIP
  const zipBuffer = await createZipArchive(zipFiles)

  // 3. Buat SATU master mediaKey (32 byte) untuk paket stiker dan thumbnail
  const mediaKey = crypto.randomBytes(32)

  // 4. Enkripsi file ZIP arsip menggunakan info resmi "WhatsApp Sticker Pack Keys"
  const encZip = await encryptForWhatsApp(zipBuffer, mediaKey, 'WhatsApp Sticker Pack Keys')
  const tempZipPath = path.join(os.tmpdir(), `sp-zip-${stickerPackId}.enc`)
  await fs.promises.writeFile(tempZipPath, encZip.encBuffer)

  let zipDirectPath
  try {
    const resZip = await conn.waUploadToServer(tempZipPath, {
      mediaType: 'document',
      fileEncSha256B64: encZip.fileEncSha256.toString('base64')
    })
    zipDirectPath = resZip?.directPath
  } finally {
    fs.promises.unlink(tempZipPath).catch(() => {})
  }

  // 5. Enkripsi Tray Icon menggunakan info resmi "WhatsApp Sticker Pack Thumbnail Keys" dengan mediaKey yang SAMA
  const encThumb = await encryptForWhatsApp(trayIconBuffer, mediaKey, 'WhatsApp Sticker Pack Thumbnail Keys')
  const tempThumbPath = path.join(os.tmpdir(), `sp-thumb-${stickerPackId}.enc`)
  await fs.promises.writeFile(tempThumbPath, encThumb.encBuffer)

  let thumbDirectPath
  try {
    const resThumb = await conn.waUploadToServer(tempThumbPath, {
      mediaType: 'document',
      fileEncSha256B64: encThumb.fileEncSha256.toString('base64')
    })
    thumbDirectPath = resThumb?.directPath
  } finally {
    fs.promises.unlink(tempThumbPath).catch(() => {})
  }

  // 6. Hitung imageDataHash (SHA-256 seluruh buffer stiker digabung, format base64 dari hex)
  const allStickersBuffer = Buffer.concat(stickerBuffers)
  const hexHash = crypto.createHash('sha256').update(allStickersBuffer).digest('hex')
  const imageDataHash = Buffer.from(hexHash, 'utf8').toString('base64')

  // 7. Susun payload stickerPackMessage resmi WhatsApp
  const stickerPackMessage = {
    stickerPackId,
    name: packname || global.stickpack || 'Avelia Pack',
    publisher: author || global.stickauth || 'Avelia',
    stickers: stickerEntries,
    fileLength: encZip.fileLength,
    fileSha256: encZip.fileSha256,
    fileEncSha256: encZip.fileEncSha256,
    mediaKey: mediaKey.toString('base64'),
    directPath: zipDirectPath,
    contextInfo: {
      mediaDomainInfo: {
        mediaKeyDomain: 'MEDIA_KEY_DOMAIN_E2EE',
        e2EeMediaKey: mediaKey.toString('base64')
      }
    },
    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
    trayIconFileName,
    thumbnailDirectPath: thumbDirectPath,
    thumbnailSha256: encThumb.fileSha256,
    thumbnailEncSha256: encThumb.fileEncSha256,
    thumbnailHeight: 252,
    thumbnailWidth: 252,
    imageDataHash,
    stickerPackSize: totalStickerSize,
    stickerPackOrigin: proto.Message.StickerPackMessage.StickerPackOrigin.USER_CREATED
  }

  if (m.isGroup) {
    const stickerSpectatorText = `> 🔒 _[Paket Stiker (${stickerEntries.length}) Terkunci - Khusus @${userTag}]_`
    const mentions = cleanTargetJid.endsWith('@s.whatsapp.net') ? [cleanTargetJid] : []

    try {
      await sendDualGroupMessage(conn, m.chat, targetJid, { stickerPackMessage }, stickerSpectatorText, {
        contextInfo: { mentionedJid: mentions }
      })
    } catch (errDual) {
      console.warn('[DUAL STIKER PACK ERROR, FALLBACK]:', errDual?.message)
      await conn.sendMessage(m.chat, { text: stickerSpectatorText, mentions }).catch(() => {})
      try {
        await conn.relayMessage(targetJid, { stickerPackMessage }, {})
      } catch {
        await conn.relayMessage(m.chat, { stickerPackMessage }, {})
      }
    }
  } else {
    await conn.relayMessage(m.chat, { stickerPackMessage }, { quoted: m })
  }

  return stickerEntries.length
}

/**
 * Mengirim stiker satu per satu (untuk stiker tunggal atau fallback)
 */
async function sendIndividualStickers(conn, m, downloadedMedia, packname, author, targetJid, cleanTargetJid, userTag) {
  let sent = 0
  for (const item of downloadedMedia) {
    const stiker = await createStickerFromMedia(item.img, item.mime, packname, author)
    if (!stiker) continue

    if (m.isGroup) {
      const stickerSpectatorText = `> 🔒 _[Stiker Terkunci - Khusus @${userTag}]_`
      const mentions = cleanTargetJid.endsWith('@s.whatsapp.net') ? [cleanTargetJid] : []

      try {
        const playerMessage = await generateWAMessageContent({ sticker: stiker }, { upload: conn.waUploadToServer })
        await sendDualGroupMessage(conn, m.chat, targetJid, playerMessage, stickerSpectatorText, {
          contextInfo: { mentionedJid: mentions }
        })
      } catch (errDual) {
        console.warn('[DUAL STIKER ERROR, FALLBACK]:', errDual?.message)
        await conn.sendMessage(m.chat, { text: stickerSpectatorText, mentions }).catch(() => {})
        try {
          await conn.sendFile(targetJid, stiker, 'sticker.webp', '', null)
        } catch {
          await conn.sendFile(m.chat, stiker, 'sticker.webp', '', null)
        }
      }
    } else {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    }
    sent++
  }
  return sent
}

/**
 * Membaca media baik dari pesan tunggal maupun dari Album WhatsApp
 */
function getStickerMediaList(conn, m) {
  const q = m.quoted ? m.quoted : m
  let albumItems = []

  if (q?.id) {
    const allAlbumEntries = Object.entries(conn.albumMessages || {})
    // 1. Cari di conn.albumMessages berdasarkan parentId atau id item
    for (const [albumKey, items] of allAlbumEntries) {
      if (
        albumKey.endsWith(`:${q.id}`) ||
        (Array.isArray(items) && items.some(item => item.key?.id === q.id))
      ) {
        albumItems = items
        break
      }
    }

    // 2. Jika belum ketemu, cek parentMessageKey di contextInfo quoted/pesan
    if (!albumItems.length) {
      const parentId = q.msg?.contextInfo?.messageAssociation?.parentMessageKey?.id ||
        q.message?.messageContextInfo?.messageAssociation?.parentMessageKey?.id ||
        q.contextInfo?.messageAssociation?.parentMessageKey?.id
      if (parentId) {
        for (const [albumKey, items] of allAlbumEntries) {
          if (
            albumKey.endsWith(`:${parentId}`) ||
            (Array.isArray(items) && items.some(item => item.key?.id === parentId))
          ) {
            albumItems = items
            break
          }
        }
      }
    }

    // 3. Jika masih belum ada di albumMessages, cari di messages cache
    if (!albumItems.length) {
      const candidateChats = [...new Set([m.chat, q.chat || m.chat, q.key?.remoteJid || m.chat])]
      albumItems = candidateChats
        .flatMap(chat => Object.values(conn.chats?.[chat]?.messages || {}))
        .filter(item => isAlbumChildOf(item, q.id))
    }
  }

  // Jika album ditemukan dan memiliki lebih dari 1 item, gunakan seluruh item album
  if (albumItems.length > 1) {
    const uniqueAlbumItems = [...new Map(albumItems.map(item => [item.key?.id || item.id, item])).values()]
    const list = uniqueAlbumItems
      .map(item => toStickerMedia(conn, item))
      .filter(Boolean)
    if (list.length > 1) {
      list.rawAlbumItems = uniqueAlbumItems
      return list
    }
  }

  // Jika bukan album (atau album hanya 1 item), proses sebagai single media
  const single = toStickerMedia(conn, q)
  if (single) return [single]

  return []
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

  // Jika sudah webp, tambahkan exif langsung
  const isWebp = Buffer.isBuffer(img) && img.length >= 12 && img.toString('utf8', 8, 12) === 'WEBP'
  if (isWebp) {
    try {
      return await addExif(img, packname, author)
    } catch (e) {
      // jika gagal, lanjut ke createSticker
    }
  }

  // Jika foto biasa (jpeg/png/dll), buat via wa-sticker-formatter langsung tanpa error parser node-webpmux
  return await createSticker(img, false, packname, author)
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

/**
 * Helper untuk membuat ZIP archive dari array file { name, data: Buffer }
 */
function createZipArchive(files) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const stream = new PassThrough()
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
    archive.on('error', reject)
    archive.pipe(stream)
    for (const file of files) {
      archive.append(file.data, { name: file.name })
    }
    archive.finalize()
  })
}

/**
 * Memeriksa apakah buffer WebP merupakan stiker animasi
 */
function isWebpAnimated(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 21) return false
  if (buffer.toString('utf8', 0, 4) !== 'RIFF' || buffer.toString('utf8', 8, 12) !== 'WEBP') return false
  if (buffer.toString('utf8', 12, 16) === 'VP8X') {
    return (buffer[20] & 0x02) !== 0
  }
  return false
}
