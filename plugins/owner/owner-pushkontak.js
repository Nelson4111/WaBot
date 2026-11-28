let handler = async (m) => {
    return m.reply('*╭  〔 ✕ ꜰɪᴛᴜʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ 〕*\n> Fitur Push Kontak dimatikan secara permanen untuk mencegah penalti akun (Reachout Timelock, Error 463, dan Banned) akibat pengiriman unsolicited DM ke anggota grup.\n*╰───────────────*')
}

handler.help = ['pushkontak']
handler.tags = ['owner']
handler.command = /^(pushkontak)$/i
handler.owner = true
handler.group = true
handler.disabled = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur pushkontak.'
handler.tutorial = [
  '.pushkontak',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler