let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) throw '❌ Perintah ini khusus owner!'

  let groups = Object.values(conn.chats)
    .filter(chat => chat.id.endsWith('@g.us'))

  if (!groups.length) throw '❌ Bot belum masuk grup manapun'

  let teks = `📋 *LIST GROUP BOT*\n\n`
  teks += `Total: *${groups.length} grup*\n\n`

  let no = 1
  for (let g of groups) {
    teks += `${no++}. *${g.subject || 'Tanpa Nama'}*\n`
    teks += `   🆔 ${g.id}\n`
    teks += `   👥 Member: ${g.participants?.length || 'Unknown'}\n\n`
  }

  m.reply(teks)
}

handler.help = ['listgc']
handler.tags = ['owner']
handler.command = ['listgc', 'listgroup']
handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur listgc.'
handler.tutorial = [
  '.listgc',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler