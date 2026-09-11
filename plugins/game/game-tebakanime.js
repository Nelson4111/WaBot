import axios from 'axios'

let timeout = 120000
let poin = 4999
let limit = 5

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakanime = conn.tebakanime || {}
  let id = m.chat

  if (id in conn.tebakanime)
    return conn.reply(
      m.chat,
      `╭─❏「 🎌 TEBAK ANIME 」❏\n` +
      `│ ⏳ *Masih ada soal belum terjawab di chat ini.*\n` +
      `╰─━━━━━━━━━━━━━━─`,
      conn.tebakanime[id][0]
    )

  try {
    let res = await axios.get('https://api.deline.web.id/game/tebakanime')
    let json = res.data

    if (!json.status || !json.result) throw 'Gagal mengambil data dari API'

    let { soal, jawaban } = json.result

    let caption = `╭─❏「 🎌 TEBAK ANIME 」❏\n`
    caption += `│ 🎌 *APA JUDUL ANIME NYA?*\n`
    caption += `╰─━━━━━━━━━━━━━━─\n\n`

    caption += `📋 *INFORMASI PERMAINAN*\n`
    caption += `> ↳ ⏱️ Timeout : *${(timeout / 1000).toFixed(2)} detik*\n`
    caption += `> ↳ 💡 Ketik *${usedPrefix}hanime* untuk bantuan\n`
    caption += `> ↳ ⭐ Bonus : ${poin} XP & ${limit} Limit\n\n`

    caption += `📌 *Note:* Balas/Reply pesan ini untuk menjawab!\n\n`
    caption += `─━━━━━━━━━━━━━━─`

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
            `╭─❏「 ⏰ TEBAK ANIME 」❏\n` +
            `│ ⏰ *Waktu habis!*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `📋 *JAWABAN*\n` +
            `> ↳ *${jawaban}*\n\n` +
            `─━━━━━━━━━━━━━━─`,
            conn.tebakanime[id][0]
          )
          delete conn.tebakanime[id]
        }
      }, timeout)
    ]
  } catch (e) {
    m.reply(
      `╭─❏「 ❌ TEBAK ANIME 」❏\n` +
      `│ ❌ *Gagal mengambil soal.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pastikan API sedang aktif.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
}

handler.help = ['tebakanime']
handler.tags = ['game']
handler.command = /^tebakanime$/i
handler.register = true

export default handler