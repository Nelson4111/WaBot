import { sticker, addExif } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import { Sticker } from 'wa-sticker-formatter'

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
      console.error('❌ Gagal kirim reaction:', e)
    }
  }

  try {
    await react('🕒') // reaction mulai

    const mediaList = getStickerMediaList(conn, m)
    if (!mediaList.length) {
      await react('❌')
      return m.reply(`Balas gambar atau video dengan command *${usedPrefix + command}*`)
    }

    let [packname, ...authorArr] = args.join` `.split`|`
    packname = packname || global.stickpack
    let author = authorArr.join`|` || global.stickauth
    let sent = 0

    for (const media of mediaList) {
      if (/video/g.test(media.mime) && media.seconds > 10) continue

      const img = await media.download?.()
      if (!img) continue

      const stiker = await createStickerFromMedia(img, media.mime, packname, author)
      if (!stiker) continue

      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      sent++
    }

    if (!sent) {
      await react('❌')
      return m.reply('Media tidak bisa dibuat menjadi stiker. Video maksimal 10 detik.')
    }

    await react('✨')
  } catch (e) {
    console.error(e)
    await react('❌')
    m.reply('❌ Terjadi kesalahan')
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
