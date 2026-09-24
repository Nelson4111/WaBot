import crypto from "crypto"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"
import axios from "axios"

import pkg from "@whiskeysockets/baileys"
const { proto, generateWAMessageFromContent } = pkg

const API_KEY = "AIzaBj7z2z3xBjsk"
const ALBUM_DELAY = 3000

const handler = async (m, { conn }) => {
  const mediaList = getTourlMediaList(conn, m)
  if (!mediaList.length) return m.reply("❌ Tidak ada media yang ditemukan!")

  await conn.sendMessage(m.chat, { react: { text: "⏰", key: m.key } })

  for (const [index, item] of mediaList.entries()) {
    try {
      const media = await item.download()
      if (!media?.length) throw new Error("Media kosong")
      if (media.length > 10 * 1024 * 1024) {
        await m.reply(`❌ File ${index + 1} terlalu besar! Maks 10MB`)
      } else {
        const ft = (await fileTypeFromBuffer(media)) || {
          ext: "bin",
          mime: item.mime || "application/octet-stream",
        }

        const [deline, termai, quax, cloudku] = await Promise.all([
          uploadDeline(media, ft.ext, ft.mime).catch(() => "Gagal"),
          uploadTermai(media, ft.mime).catch(() => "Gagal"),
          uploadQuax(media, ft.ext).catch(() => "Gagal"),
          uploadCloudku(media, ft.ext, ft.mime).catch(() => "Gagal")
        ])

        const caption = `📤 *T O U R L - A V E L I A*

📦 *Size:* ${formatBytes(media.length)}
📁 *Type:* ${ft.mime}

*Deline:* ${deline}
*Termai:* ${termai}
*Quax:* ${quax}
*Cloudku:* ${cloudku}`

        await m.reply(caption)
      }
    } catch {
      await m.reply(`❌ Gagal memproses file ${index + 1}`)
    }

    if (index < mediaList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, ALBUM_DELAY))
    }
  }

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ["tourl"]
handler.help = ["tourl"]
handler.tags = ["tools"]

export default handler

function getTourlMediaList(conn, m) {
  const quoted = m.quoted || m
  let albumItems = []
  const albumEntries = Object.entries(conn.albumMessages || {})

  if (quoted?.id) {
    for (const [albumKey, items] of albumEntries) {
      if (
        albumKey.endsWith(`:${quoted.id}`) ||
        (Array.isArray(items) && items.some(item => item.key?.id === quoted.id))
      ) {
        albumItems = items
        break
      }
    }

    if (!albumItems.length) {
      const parentId = quoted.msg?.contextInfo?.messageAssociation?.parentMessageKey?.id ||
        quoted.message?.messageContextInfo?.messageAssociation?.parentMessageKey?.id ||
        quoted.contextInfo?.messageAssociation?.parentMessageKey?.id

      if (parentId) {
        for (const [albumKey, items] of albumEntries) {
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

    if (!albumItems.length) {
      const candidateChats = [...new Set([m.chat, quoted.chat || m.chat, quoted.key?.remoteJid || m.chat])]
      albumItems = candidateChats
        .flatMap(chat => Object.values(conn.chats?.[chat]?.messages || {}))
        .filter(item => isTourlAlbumChild(item, quoted.id))
    }
  }

  const uniqueItems = [...new Map(albumItems.map(item => [item.key?.id || item.id, item])).values()]
  if (uniqueItems.length > 1) {
    const list = uniqueItems.map(item => toTourlMedia(conn, item)).filter(Boolean)
    if (list.length) return list
  }

  const single = toTourlMedia(conn, quoted)
  return single ? [single] : []
}

function isTourlAlbumChild(item, parentId) {
  const type = Object.keys(item?.message || {}).find(key => ['imageMessage', 'videoMessage'].includes(key))
  const parent = item?.message?.messageContextInfo?.messageAssociation?.parentMessageKey ||
    item?.message?.[type]?.contextInfo?.messageAssociation?.parentMessageKey
  return parent?.id === parentId && !!type
}

function toTourlMedia(conn, message) {
  if (message?.message) {
    const type = Object.keys(message.message).find(key => ['imageMessage', 'videoMessage'].includes(key))
    if (!type) return null
    const content = message.message[type]
    return {
      mime: content.mimetype || type.replace('Message', ''),
      download: () => conn.downloadM(content, type.replace('Message', ''))
    }
  }

  const content = message?.msg || message
  const mime = content?.mimetype || ''
  return mime ? { mime, download: () => message.download() } : null
}

// --- Fungsi Uploader Termai (Sesuai Permintaan) ---
async function uploadTermai(buffer, mime) {
    const form = new FormData()
    form.append("file", buffer, {
      filename: "file",
      contentType: mime
    })

    const response = await axios.post(
      `https://c.termai.cc/api/upload?key=${API_KEY}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Accept: "application/json, text/plain, */*"
        }
      }
    )

    const res = response.data
    return res.status ? res.path : "Gagal"
}

async function uploadDeline(buffer, ext, mime) {
  const fd = new FormData()
  const name = `${crypto.randomBytes(5).toString("hex")}.${ext}`
  fd.append("file", buffer, { filename: name, contentType: mime })
  const res = await axios.post("https://api.deline.web.id/uploader", fd, {
    headers: fd.getHeaders()
  })
  return res.data?.result?.link || res.data?.url
}

async function uploadQuax(buffer, ext) {
  const fd = new FormData()
  fd.append("files[]", buffer, {
    filename: `${crypto.randomBytes(5).toString("hex")}.${ext}`
  })
  const res = await axios.post("https://qu.ax/upload.php", fd, {
    headers: fd.getHeaders()
  })
  return res.data?.files?.[0]?.url || "Gagal"
}

async function uploadCloudku(buffer, ext, mime) {
  const fd = new FormData()
  const filename = `${crypto.randomBytes(6).toString("hex")}.${ext}`
  fd.append("file", buffer, { filename, contentType: mime })
  try {
    const res = await axios({
      method: "POST",
      url: "https://cloudkuimages.guru/upload.php",
      data: fd,
      headers: { ...fd.getHeaders() }
    })
    return res.data?.url || "❌ Gagal"
  } catch {
    return "❌ Gagal"
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`
}