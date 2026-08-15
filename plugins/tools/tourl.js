import crypto from "crypto"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"
import axios from "axios"

import pkg from "@whiskeysockets/baileys"
const { proto, generateWAMessageFromContent } = pkg

const API_KEY = "AIzaBj7z2z3xBjsk"

const handler = async (m, { conn }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ""
  if (!mime) return m.reply("❌ Tidak ada media yang ditemukan!")

  await conn.sendMessage(m.chat, { react: { text: "⏰", key: m.key } })

  const media = await q.download()
  if (media.length > 10 * 1024 * 1024)
    return m.reply("❌ File terlalu besar! Maks 10MB")

  const ft = (await fileTypeFromBuffer(media)) || {
    ext: "bin",
    mime: "application/octet-stream",
  }

  // --- Proses Upload Semua ---
  const [deline, termai, quax, cloudku] = await Promise.all([
    uploadDeline(media, ft.ext, ft.mime).catch(() => "Gagal"),
    uploadTermai(media, ft.mime).catch(() => "Gagal"),
    uploadQuax(media, ft.ext).catch(() => "Gagal"),
    uploadCloudku(media, ft.ext, ft.mime).catch(() => "Gagal")
  ])

  const caption = `📤 *T O U R L - ZETA*

📦 *Size:* ${formatBytes(media.length)}
📁 *Type:* ${ft.mime}

*Deline:* ${deline}
*Termai:* ${termai}
*Quax:* ${quax}
*Cloudku:* ${cloudku}`

  // Hapus tombol interaktif karena sudah tidak disupport WA standar
  await m.reply(caption)
  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ["tourl"]
handler.help = ["tourl"]
handler.tags = ["tools"]

export default handler

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