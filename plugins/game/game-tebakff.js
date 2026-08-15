import axios from 'axios'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakff = conn.tebakff || {}
  let id = m.chat
  if (id in conn.tebakff)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakff[id][0])

  try {
    let res = await axios.get('https://api.deline.web.id/game/tebakff')
    let json = res.data
    
    if (!json.status || !json.result) throw 'Gagal mengambil data dari API'

    let { img, jawaban, deskripsi } = json.result

    let caption = `
Apa nama item/karakter pada gambar ini?
🏮 *Petunjuk:* ${deskripsi}

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hff untuk bantuan
Bonus: ${poin} XP

*Note: Balas/Reply pesan ini untuk menjawab!*
`.trim()

    conn.tebakff[id] = [
      await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption },
        { quoted: m }
      ),
      {
        jawaban: jawaban.toLowerCase().trim(),
        hint: false
      },
      poin,
      setTimeout(async () => {
        if (conn.tebakff[id]) {
          await conn.reply(
            m.chat,
            `Waktu habis!\nJawabannya adalah *${jawaban}*`,
            conn.tebakff[id][0]
          )
          delete conn.tebakff[id]
        }
      }, timeout)
    ]
  } catch (e) {
    m.reply('❌ Gagal mengambil soal. Pastikan API sedang aktif.')
  }
}

handler.help = ['tebakff']
handler.tags = ['game']
handler.command = /^tebakff/i
handler.register = true

export default handler