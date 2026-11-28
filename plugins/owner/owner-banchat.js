let handler = async (m, { participants }) => {
    // if (participants.map(v=>v.jid).includes(global.conn.user.jid)) {
    global.db.data.chats[m.chat].isBanned = true
    m.reply('Done!')
    // } else m.reply('Ada nomor host disini...')
}
handler.help = ['banchat']
handler.tags = ['owner']
handler.command = /^(banchat|bnc)$/i

handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur banchat.'
handler.tutorial = [
  '.banchat',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler