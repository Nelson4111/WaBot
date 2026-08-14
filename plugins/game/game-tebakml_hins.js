let handler = async (m, { conn }) => {
  let id = 'tebakml-' + m.chat
  let game = conn.game?.[id]
  if (!game) return m.reply('❌ Tidak ada soal tebak ML')

  if (game[1].hint) return m.reply('❗ sudah digunakan')
  game[1].hint = true

  let jwb = game[1].jawaban
  let hint = jwb
    .split('')
    .map((v, i) => (i < 2 ? v : '_'))
    .join(' ')

  m.reply(`*bantuan*\n\`${hint}\``)
}

handler.limit = true
handler.command = /^hgml$/i
export default handler