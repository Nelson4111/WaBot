import axios from 'axios'

let timeout = 120000
let poin = 4999
let limit = 5

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebaksurah = conn.tebaksurah || {}
  let id = m.chat
  if (id in conn.tebaksurah)
    return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebaksurah[id][0])

  try {
    let res = await axios.get('https://api.deline.web.id/game/tebaksurah')
    let json = res.data
    
    if (!json.status || !json.result) throw 'Gagal mengambil data dari API'

    let { audio, surah } = json.result

    let caption = `
Surah apakah ini?
 *Tipe:* ${surah.revelationType}

Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik ${usedPrefix}hsurah untuk bantuan
Bonus: ${poin} XP & ${limit} Limit

*Note: Balas/Reply pesan ini untuk menjawab!*
`.trim()

    let msg = await conn.reply(m.chat, caption, m)

    await conn.sendMessage(
      m.chat,
      { audio: { url: audio }, fileName: 'tebaksurah.mp3', mimetype: 'audio/mpeg' },
      { quoted: msg }
    )

    conn.tebaksurah[id] = [
      msg,
      {
        jawaban: surah.englishName.toLowerCase().trim(),
        real: surah.englishName,
        hint: false
      },
      poin,
      setTimeout(async () => {
        if (conn.tebaksurah[id]) {
          await conn.reply(
            m.chat,
            `Waktu habis!\nJawabannya adalah *${surah.englishName}*`,
            conn.tebaksurah[id][0]
          )
          delete conn.tebaksurah[id]
        }
      }, timeout)
    ]
  } catch (e) {
    m.reply('❌ Gagal mengambil soal. Pastikan API sedang aktif.')
  }
}

handler.help = ['tebaksurah']
handler.tags = ['game']
handler.command = /^tebaksurah$/i
handler.register = true

export default handler