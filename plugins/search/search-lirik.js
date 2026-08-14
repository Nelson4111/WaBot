import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh: *${usedPrefix + command}* Komang`)

  await m.reply('🔍 Sedang mencari lirik...')

  try {
    let apiUrl = `https://api.ryzumi.net/api/search/lyrics?query=${encodeURIComponent(text)}`
    let { data } = await axios.get(apiUrl, { timeout: 15000 })

    if (!Array.isArray(data) || data.length === 0) {
      return m.reply('❌ Lirik tidak ditemukan.')
    }

    // Cari item yang paling cocok atau gunakan item pertama
    let qLower = text.toLowerCase()
    let item = data.find(i => 
      (i.trackName && i.trackName.toLowerCase().includes(qLower)) || 
      (i.name && i.name.toLowerCase().includes(qLower))
    ) || data[0]

    let lyrics = item.plainLyrics || item.syncedLyrics || ''
    if (!lyrics) {
      return m.reply('❌ Lirik tidak ditemukan.')
    }

    let title = item.name || item.trackName || text
    let artist = item.artistName || '-'
    let album = item.albumName || '-'

    let cap = `🎤 *LIRIK LAGU*\n\n`
    cap += `🪷 *Judul:* ${title}\n`
    cap += `🎀 *Artis:* ${artist}\n`
    if (album && album !== '-') cap += `💿 *Album:* ${album}\n`
    cap += `───···\n\n`
    cap += lyrics.trim()

    await m.reply(cap)

  } catch (e) {
    console.error('Lyrics Error:', e)
    m.reply(`❌ *Gagal:* Terjadi kesalahan saat mengambil lirik.`)
  }
}

handler.help = ['lirik <judul>']
handler.tags = ['search']
handler.command = /^(lirik|lyrics)$/i

export default handler