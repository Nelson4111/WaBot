import axios from 'axios'

let timeout = 120000
let poin = 4999
let limit = 5

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakangka = conn.tebakangka || {}
  let id = m.chat
  if (id in conn.tebakangka)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakangka[id][0])

  try {
    let res = await axios.get('https://api.siputzx.my.id/api/games/tebakwarna')
    let json = res.data
    
    if (!json.status || !json.data.image) throw 'Gagal mengambil data dari API'

    let caption = `
Angka berapakah yang ada di dalam gambar tersebut?

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hangka untuk bantuan
Bonus: ${poin} XP & ${limit} Limit

*Note: Balas/Reply pesan ini untuk menjawab!*
`.trim()

    let msg = await conn.sendMessage(m.chat, { 
      image: { url: json.data.image }, 
      caption: caption 
    }, { quoted: m })

    conn.tebakangka[id] = [
      msg,
      {
        jawaban: json.data.correct.toLowerCase().trim(),
        real: json.data.correct,
        hint: false
      },
      poin,
      setTimeout(async () => {
        if (conn.tebakangka[id]) {
          await conn.reply(
            m.chat,
            `Waktu habis!\nJawabannya adalah *${json.data.correct}*`,
            conn.tebakangka[id][0]
          )
          delete conn.tebakangka[id]
        }
      }, timeout)
    ]
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil soal. Pastikan API sedang aktif.')
  }
}

handler.help = ['tebakangka']
handler.tags = ['game']
handler.command = /^tebakangka$/i
handler.register = true

export default handler