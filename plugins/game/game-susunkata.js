import fs from 'fs'

const TIMEOUT = 60 * 1000
const MIN_REWARD = 15000
const MAX_REWARD = 30000
const LIMIT_REWARD = 1

let handler = async (m, { conn, usedPrefix }) => {
  conn.game = conn.game || {}

  const id = 'susunkata-' + m.chat
  if (id in conn.game)
    return m.reply('Masih ada soal yang belum dijawab di chat ini')

  const src = JSON.parse(fs.readFileSync('./json/susunkata.json'))
  const json = src[Math.floor(Math.random() * src.length)]

  const reward =
    Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD

  const caption =
`${json.soal}

Tipe : ${json.tipe}
Waktu : ${TIMEOUT / 1000} detik

Hadiah:
• Rp ${reward.toLocaleString('id-ID')}
• ${LIMIT_REWARD} Limit

Balas pesan ini untuk menjawab`

  const msg = await conn.reply(m.chat, caption.trim(), m)

  const timeout = setTimeout(() => {
    if (conn.game[id]) {
      conn.reply(
        m.chat,
        `Waktu habis!\nJawaban: ${json.jawaban}`,
        msg
      )
      delete conn.game[id]
    }
  }, TIMEOUT)

  conn.game[id] = [
    msg,
    {
      soal: json.soal,
      jawaban: json.jawaban,
      reward,
      limit: LIMIT_REWARD
    },
    timeout
  ]
}

handler.help = ['susunkata']
handler.tags = ['game']
handler.command = /^susunkata|sskata$/i
handler.game = true
handler.group = true
handler.register = true

export default handler