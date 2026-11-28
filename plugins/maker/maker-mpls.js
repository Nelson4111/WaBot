/**
  お · ─ Plugin By Ryo Yamada
  ｜ ⦿ Name: MPLS Maker
  ｜ ⦿ Type: ESM Plugins
  ｜ ⦿ Desc: Ubah foto jadi gaya MPLS 😆
  お · ─────────────
*/

import fetch from "node-fetch"
import FormData from "form-data"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('🖼️ Kirim atau reply gambar dengan caption *.mpls*')

  await m.reply('🍭 Tunggu bentar...')
  try {
    let img = await q.download?.()
    let form = new FormData()
    form.append("file", img, { filename: "mpls.jpg" })

    let res = await fetch("https://api.zenzxz.my.id/api/maker/mpls", { method: "POST", body: form })
    let hasil = await res.arrayBuffer()

    await conn.sendFile(m.chat, Buffer.from(hasil), "mpls.jpg", "✨ Jadi anak MPLS 😆", m)
  } catch {
    await m.reply('❌ Gagal proses gambar.')
  }
}

handler.help = ['mpls']
handler.tags = ['maker']
handler.command = /^mpls$/i
handler.limit = true

handler.desc = 'Membuat gambar grafis kustom efek mpls.'
handler.tutorial = [
  '.mpls <teks>',
  'Kirim perintah .mpls disertai teks atau balas gambar yang diinginkan'
]

export default handler