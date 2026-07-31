import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh: *${usedPrefix + command}* Berharap Tak Berpisah`)

  await m.reply('🔍 Sedang mencari lirik...')

  try {
    let apiUrl = `https://api-faa.my.id/faa/lyrics?q=${encodeURIComponent(text)}`
    let { data } = await axios.get(apiUrl)

    if (!data.status) {
      return m.reply('❌ Lirik tidak ditemukan.')
    }

    let { title, artist, lyrics, image } = data.result
    
    let cap = `🎤 *LIRIK LAGU*\n\n`
    cap += `🪷 *Judul:* ${title}\n`
    cap += `🎀 *Artis:* ${artist}\n`
    cap += `───···\n\n`
    cap += lyrics

    if (image) {
      await conn.sendMessage(m.chat, { image: { url: image }, caption: cap }, { quoted: m })
    } else {
      await m.reply(cap)
    }

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Gagal:* Terjadi kesalahan saat mengambil lirik.`)
  }
}

handler.help = ['lirik']
handler.tags = ['search']
handler.command = /^(lirik|lyrics)$/i

export default handler