let handler = async (m, { conn, args, command }) => {
	let group = m.chat
        await m.reply('Sayonara , , ! (≧ω≦)ゞ', m.chat) 
        await  conn.groupLeave(group)
        }
handler.help = ['leavegc', 'out']
handler.tags = ['owner']
handler.command = /^(out|leavegc)$/i

handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur leavegc.'
handler.tutorial = [
  '.out',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler