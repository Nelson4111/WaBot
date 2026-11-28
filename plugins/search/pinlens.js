// plugins/pinterestlens.js
// PinterestLens
// API : https://anabot.my.id
// Author : Hilman

import axios from "axios"
import FormData from "form-data"
import fetch from "node-fetch"

async function uploadImageToCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, 'file.jpg')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  const url = await res.text()
  if (!url.startsWith('http')) throw new Error('❌ Gagal upload ke Catbox')
  return url.trim()
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""

  if (!mime || !mime.startsWith("image/")) throw `🍡 Kirim atau reply foto dengan caption *${usedPrefix + command}*`

  try {
    await m.reply('✨ Cihuy otw...')

    let img = await q.download()
    let imageUrl = await uploadImageToCatbox(img)

    let api = `https://anabot.my.id/api/search/pinterestLens?image=${encodeURIComponent(imageUrl)}&apikey=freeApikey`
    let res = await axios.get(api)
    let data = res.data

    if (!data.success || !data.data?.result?.length) {
      throw `🍬 Tidak ada hasil ditemukan.`
    }

    let results = data.data.result
    let teks = `🔎 *Hasil Pencarian Pinterest Lens* 🔎\n\n`
    let medias = []

    for (let x of results) {
      let img = x.images?.["736x"]?.url || x.images?.["236x"]?.url
      let desc = x.auto_alt_text || x.description || "Tidak ada deskripsi"
      teks += `✨ ${desc}\n🍭 By: ${x.pinner?.full_name || "-"} (@${x.pinner?.username || "-"})\n\n`
      if (img) medias.push(img)
    }

    if (medias.length > 0) {
      await conn.sendFile(m.chat, medias[0], "pinterest.jpg", teks, m)
    } else {
      m.reply(teks)
    }

  } catch (e) {
    console.error(e)
    throw `🍬 Terjadi kesalahan, coba lagi nanti.`
  }
}

handler.help = ['pinterestlens (reply foto)', 'pinlens (reply foto)']
handler.tags = ['internet']
handler.command = /^(pinterestlens|pinlens)$/i
handler.limit = true

handler.desc = 'Mencari informasi atau media pinlens berdasarkan kata kunci pencarian.'
handler.tutorial = [
  '.pinterestlens <kata kunci>',
  'Contoh: .pinterestlens pencarian'
]

export default handler