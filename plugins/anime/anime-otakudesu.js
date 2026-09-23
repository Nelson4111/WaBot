import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const cmd = command.toLowerCase()

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  // 1. Jadwal Anime Ongoing Mingguan
  if (cmd === 'jadwalanime') {
    try {
      const res = await axios.get('https://api.ryzumi.net/api/otakudesu/jadwal', {
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      const list = Array.isArray(res.data) ? res.data : []
      if (list.length === 0) throw new Error('Jadwal anime tidak ditemukan.')

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      const cards = list.map(item => {
        const animeList = (item.anime || []).slice(0, 5).map(a => `*┆* ⟡ ${a.judul}`).join('\n')
        return `*╭  〔 ⏱ ${item.hari.toUpperCase()} 〕*\n${animeList || '*┆* ⟡ Tidak ada jadwal'}\n*╰───────────────*`
      })

      const caption = `*──  ୨୧ ✧ ᴊᴀᴅᴡᴀʟ ʀɪʟɪꜱ ᴀɴɪᴍᴇ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Jadwal rilis episode baru anime ongoing Otakudesu._`.trim()

      return m.reply(caption)
    } catch (err) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal memuat jadwal anime: ${err.message}\n*╰───────────────*`)
    }
  }

  // 2. Daftar Genre Anime
  if (cmd === 'genreanime') {
    try {
      const res = await axios.get('https://api.ryzumi.net/api/otakudesu/genre', {
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      const list = Array.isArray(res.data) ? res.data : []
      if (list.length === 0) throw new Error('Daftar genre tidak ditemukan.')

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      const rows = list.map(g => `*┆* ⟡ *${g.judul}*`).join('\n')
      const caption = `*──  ୨୧ ✧ ɢᴇɴʀᴇ ᴀɴɪᴍᴇ ✧ ୨୧  ──*

*╭  〔 🎭 ᴋ ᴀ ᴛ ᴇ ɢ ᴏ ʀ ɪ  ɢ ᴇ ɴ ʀ ᴇ 〕*
${rows}
*╰───────────────*

> _Koleksi genre anime resmi Otakudesu._`.trim()

      return m.reply(caption)
    } catch (err) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal memuat genre anime: ${err.message}\n*╰───────────────*`)
    }
  }

  // 3. Pencarian Anime Otakudesu
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan judul anime:
> › *${usedPrefix + command}* <judul_anime>
>
> Menu Terkait:
> › *${usedPrefix}jadwalanime* (Jadwal rilis mingguan)
> › *${usedPrefix}genreanime* (Daftar genre)
>
> Contoh:
> › *${usedPrefix + command} Naruto*
> › *${usedPrefix + command} Frieren*
*╰───────────────*`)
  }

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/otakudesu/anime?query=${encodeURIComponent(text.trim())}`, {
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const list = Array.isArray(res.data) ? res.data : []
    if (list.length === 0) {
      throw new Error(`Anime "${text}" tidak ditemukan di Otakudesu.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const maxResults = Math.min(list.length, 5)
    const cards = []

    for (let i = 0; i < maxResults; i++) {
      const it = list[i]
      const eps = Array.isArray(it.eps) ? it.eps.join('').trim() : (it.eps || '-')
      cards.push(`*╭  〔 🎬 ᴀ ɴ ɪ ᴍ ᴇ  [${toSmallNum(i + 1)}] 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${it.judul || '-'}*
*┆* ✧ ᴇᴘɪꜱᴏᴅᴇ : *${toSmallNum(eps)}*
*┆* ◈ ʀᴀᴛɪɴɢ  : *★ ${toSmallNum(it.rate || '-')}*
> › 🔗 *Slug:* \`${it.slug || '-'}\`
*╰───────────────*`)
    }

    const caption = `*──  ୨୧ ✧ ᴏᴛᴀᴋᴜᴅᴇꜱᴜ ᴀɴɪᴍᴇ ✧ ୨୧  ──*

${cards.join('\n\n')}

> _Gunakan slug untuk mencari detail atau download episode._`.trim()

    const firstImage = list[0]?.gambar
    if (firstImage) {
      return conn.sendMessage(m.chat, {
        image: { url: firstImage },
        caption
      }, { quoted: m })
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memproses Otakudesu: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['otakudesu <query>', 'jadwalanime', 'genreanime']
handler.tags = ['anime']
handler.command = /^(otakudesu|jadwalanime|genreanime)$/i
handler.limit = true

export default handler
