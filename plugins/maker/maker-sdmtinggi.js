/**
 * ✧ ToSdmTinggi (URL) - Maker ✧ ───────────────────────
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
 * • C by   : SXZnightmare 
 * • API    : https://zenzxz.dpdns.org/
 */

let handler = async (m, { args, conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let url = args[0]
    if (!url || !/^https?:\/\//i.test(url)) {
      throw '*📸 Kirim perintah seperti ini:*\n*.tosdmtinggi https://example.com/gambar.jpg*'
    }

    let api = `https://zenzxz.dpdns.org/maker/tosdmtinggi?url=${encodeURIComponent(url)}`
    let res = await fetch(api)
    if (!res.ok) throw '*⚠️ Gagal memproses gambar! Pastikan URL valid dan gambar dapat diakses.*'

    let buffer = await res.arrayBuffer()
    await conn.sendMessage(m.chat, {
      image: Buffer.from(buffer),
      caption: '*✅ Sukses! Gambar lu udah diubah jadi SDM Tinggi* 😎',
      quoted: m
    })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: typeof e === 'string' ? e : '*❌ Terjadi kesalahan internal saat memproses gambar.*',
      quoted: m
    })
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['tosdmtinggi']
handler.tags = ['maker']
handler.command = /^(tosdmtinggi|sdmtinggi)$/i
handler.limit = true
handler.register = true

handler.desc = 'Membuat gambar grafis kustom efek sdmtinggi.'
handler.tutorial = [
  '.tosdmtinggi <teks>',
  'Kirim perintah .tosdmtinggi disertai teks atau balas gambar yang diinginkan'
]

export default handler