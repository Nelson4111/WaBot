let handler = async (m) => {
    return m.reply('*╭  〔 ✕ ꜰɪᴛᴜʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ 〕*\n> Fitur Push Kontak dimatikan secara permanen untuk mencegah penalti akun (Reachout Timelock, Error 463, dan Banned) akibat pengiriman unsolicited DM ke anggota grup.\n*╰───────────────*')
}

handler.help = ['pushkontak']
handler.tags = ['owner']
handler.command = /^(pushkontak)$/i
handler.owner = true
handler.group = true
handler.disabled = true

export default handler