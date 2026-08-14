import axios from 'axios'

let timeout = 120000
let poin = 4999
let limit = 5

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakanime = conn.tebakanime || {}
  let id = m.chat
  if (id in conn.tebakanime)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakanime[id][0])

  try {
    let res = await axios.get('https://api.deline.web.id/game/tebakanime')
    let json = res.data
    
    if (!json.status || !json.result) throw 'Gagal mengambil data dari API'

    let { soal, jawaban } = json.result

    let caption = `
Apa judul anime pada gambar ini?
Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hanime untuk bantuan
Bonus: ${poin} XP & ${limit} Limit

*Note: Balas/Reply pesan ini untuk menjawab!*
`.trim()

    conn.tebakanime[id] = [
      await conn.sendMessage(
        m.chat,
        { image: { url: soal }, caption },
        { quoted: m }
      ),
      {
        jawaban: jawaban.toLowerCase().trim(),
        real: jawaban,
        hint: false
      },
      poin,
      setTimeout(async () => {
        if (conn.tebakanime[id]) {
          await conn.reply(
            m.chat,
            `Waktu habis!\nJawabannya adalah *${jawaban}*`,
            conn.tebakanime[id][0]
          )
          delete conn.tebakanime[id]
        }
      }, timeout)
    ]
  } catch (e) {
    m.reply('❌ Gagal mengambil soal. Pastikan API sedang aktif.')
  }
}

handler.help = ['tebakanime']
handler.tags = ['game']
handler.command = /^tebakanime$/i
handler.register = true

export default handler