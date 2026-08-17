/*• Nama Fitur : Pinterest Search
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbB8WYS4CrfhJCelw33j
• Author : Agas
*/

import axios from 'axios'

async function pinterestApi(query) {
  const { data } = await axios.get(
    `https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(query)}`
  )
  const arr = Array.isArray(data?.data) ? data.data : []
  return arr.map((it, idx) => ({
    title: it.caption && it.caption.trim() ? it.caption : `Gambar - ${idx + 1}`,
    url: it.image,
    source: it.source || ''
  }))
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Mau cari apa?\nContoh: .pin2 anime wallpaper')
  await m.reply('🔍 Mencari gambar...')

  try {
    let results = await pinterestApi(text)
    let selected = results.slice(0, 3)

    if (!selected.length) return m.reply('❌ Gambar tidak ditemukan.')

    for (let i = 0; i < selected.length; i++) {
      let item = selected[i]
      let caption = `📌 *Pinterest Search: ${text}* (${i + 1}/${selected.length})\n📝 ${item.title}`
      await conn.sendMessage(m.chat, {
        image: { url: item.url },
        caption
      }, { quoted: m })
    }
  } catch (e) {
    m.reply('❌ Gagal mengambil hasil Pinterest.')
  }
}

handler.command = ['pin2', 'pinterest2']
handler.help = ['pin2']
handler.tags = ['internet']
handler.register = true
handler.limit = true

export default handler