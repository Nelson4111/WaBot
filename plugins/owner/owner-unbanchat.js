let handler = async (m) => {
    global.db.data.chats[m.chat].isBanned = false
    m.reply('Done!')
}
handler.help = ['unbanchat']
handler.tags = ['owner']
handler.command = /^(unbanchat|ubnc)$/i
handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur unbanchat.'
handler.tutorial = [
  '.unbanchat',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler