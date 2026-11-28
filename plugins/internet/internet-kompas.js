/*
Berita Kompas 
Type : Plugins ESM 
API : https://zenz.biz.id
*/
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch(`https://zenz.biz.id/berita/kompas`)
    const json = await res.json()

    if (!json.status || !json.result) throw 'Gagal mengambil berita'

    const beritaList = json.result.filter(v => v.title && v.url).slice(0, 10)
    let teks = '📢 *Berita Kompas Terbaru:*\n\n' + beritaList.map((v, i) => {
      return `*${i + 1}. ${v.title}*\n🔗 ${v.url}`
    }).join('\n\n')

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil berita. Coba lagi nanti.')
  }
}

handler.help = ['kompas']
handler.tags = ['internet']
handler.command = /^kompas$/i
handler.limit = true

handler.desc = 'Mengambil dan menampilkan informasi dari internet mengenai kompas.'
handler.tutorial = [
  '.kompas <pencarian>'
]

export default handler