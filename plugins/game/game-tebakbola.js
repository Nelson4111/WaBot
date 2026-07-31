import axios from 'axios'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakbola = conn.tebakbola || {}
  let id = m.chat
  if (id in conn.tebakbola)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakbola[id][0])

  try {
    let res = await axios.get('https://api.deline.web.id/game/tebakpemainbola')
    let json = res.data
    
    if (!json.status || !json.result) throw 'Gagal mengambil data dari API'

    let { soal, jawaban, deskripsi } = json.result

    let caption = `
Apa nama pemain bola berdasarkan ini?
_*Soal :*_ 
${soal}

_*Deskripsi:*_
 ${deskripsi}

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hbola untuk bantuan
Bonus: ${poin} XP

*Note: Balas/Reply pesan ini untuk menjawab!*
`.trim()

    conn.tebakbola[id] = [
      await conn.reply(m.chat, caption, m),
      {
        jawaban: jawaban.toLowerCase().trim(),
        hint: false
      },
      poin,
      setTimeout(async () => {
        if (conn.tebakbola[id]) {
          await conn.reply(
            m.chat,
            `Waktu habis!\nJawabannya adalah *${jawaban}*`,
            conn.tebakbola[id][0]
          )
          delete conn.tebakbola[id]
        }
      }, timeout)
    ]
  } catch (e) {
    m.reply('❌ Gagal mengambil soal. Pastikan API sedang aktif.')
  }
}

handler.help = ['tebakbola']
handler.tags = ['game']
handler.command = /^tebakbola$/i
handler.register = true

export default handler