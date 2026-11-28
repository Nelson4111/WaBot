let handler = async (m, { conn, text, participants, isAdmin, isOwner }) => {
    let users = participants.map(u => u.id).filter(v => v !== conn.user.jid)
    m.reply(`${text ? `${text}\n` : ''}┌─「 Tag All 」\n` + users.map(v => '│◦❒ @' + v.replace(/@.+/, '')).join`\n` + '\n└────', null, {
        mentions: users
    })
}

handler.help = ['o-tagall']
handler.tags = ['owner']
handler.command = ['o-tagall']
handler.owner = true
handler.group = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur tagall.'
handler.tutorial = [
  '.o-tagall',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler
