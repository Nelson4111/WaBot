import axios from 'axios'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
  conn.game = conn.game || {}
  let id = 'tebakml-' + m.chat

  if (id in conn.game)
    return conn.reply(
      m.chat,
      `╭─❏「 🏮 TEBAK HERO ML 」❏\n` +
      `│ ❗ *Masih ada soal tebak ML yang belum terjawab.*\n` +
      `╰─━━━━━━━━━━━━━━─`,
      conn.game[id][0]
    )

  let res = await axios.get('https://api.deline.web.id/game/tebakheroml')
  let json = res.data
  if (!json.status) return m.reply('❌ Gagal mengambil soal')

  let { img, jawaban, deskripsi, fullimg } = json.result

  let caption = `╭─❏「 🏮 TEBAK HERO ML 」❏\n`
  caption += `│ 🏮 *HERO APAKAH INI?*\n`
  caption += `╰─━━━━━━━━━━━━━━─\n\n`

  caption += `💡 *PETUNJUK*\n`
  caption += `> ↳ ${deskripsi}\n\n`

  caption += `📋 *INFORMASI PERMAINAN*\n`
  caption += `> ↳ ⏳ Waktu : *${(timeout / 1000).toFixed(0)} detik*\n`
  caption += `> ↳ 💡 Bantuan : *${usedPrefix}hgml*\n`
  caption += `> ↳ 🎁 Bonus : *${poin} XP*\n\n`

  caption += `─━━━━━━━━━━━━━━─`

  conn.game[id] = [
    await conn.sendMessage(
      m.chat,
      { image: { url: img }, caption },
      { quoted: m }
    ),
    {
      jawaban: jawaban.toLowerCase(),
      fullimg,
      hint: false
    },
    poin,
    setTimeout(async () => {
      if (conn.game[id]) {
        await conn.reply(
          m.chat,
          `╭─❏「 ⏰ TEBAK HERO ML 」❏\n` +
          `│ ⏰ *Waktu habis!*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `📋 *JAWABAN*\n` +
          `> ↳ *${jawaban}*\n\n` +
          `─━━━━━━━━━━━━━━─`,
          conn.game[id][0]
        )
        delete conn.game[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakml']
handler.tags = ['game']
handler.command = /^tebakml$/i
handler.game = true

export default handler