import axios from 'axios'

let timeout = 120000
let poin = 4999
let limit = 5

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebaklagu = conn.tebaklagu || {}
  let id = m.chat
  if (id in conn.tebaklagu)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebaklagu[id][0])

  try {
    let res = await axios.get('https://api.siputzx.my.id/api/games/tebaklagu')
    let json = res.data
    
    if (!json.status || !json.data.lagu) throw 'Gagal mengambil data dari API'

    let caption = `
Apa judul lagu ini?
*Artis:* ${json.data.artis}

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hlagu untuk bantuan
Bonus: ${poin} XP & ${limit} Limit

*Note: Balas/Reply pesan ini untuk menjawab!*
`.trim()

    let msg = await conn.reply(m.chat, caption, m)

    await conn.sendMessage(
      m.chat,
      { audio: { url: json.data.lagu }, fileName: 'tebaklagu.mp3', mimetype: 'audio/mpeg' },
      { quoted: msg }
    )

    conn.tebaklagu[id] = [
      msg,
      {
        jawaban: json.data.judul.toLowerCase().trim(),
        real: json.data.judul,
        hint: false
      },
      poin,
      setTimeout(async () => {
        if (conn.tebaklagu[id]) {
          await conn.reply(
            m.chat,
            `Waktu habis!\nJawabannya adalah *${json.data.judul}*`,
            conn.tebaklagu[id][0]
          )
          delete conn.tebaklagu[id]
        }
      }, timeout)
    ]
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil soal. Pastikan API sedang aktif.')
  }
}

handler.help = ['tebaklagu']
handler.tags = ['game']
handler.command = /^tebaklagu$/i
handler.register = true

export default handler