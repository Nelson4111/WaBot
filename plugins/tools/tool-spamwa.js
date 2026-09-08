let handler = async (m) => {
    return m.reply('*╭  〔 ✕ ꜰɪᴛᴜʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ 〕*\n> Fitur spam pesan telah dimatikan secara permanen demi keselamatan nomor bot dari sistem Anti-Abuse WhatsApp.\n*╰───────────────*')
}

handler.help = ['spamwa']
handler.tags = ['tools']
handler.command = /^spam(wa)?$/i
handler.owner = true
handler.disabled = true

export default handler

