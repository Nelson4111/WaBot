let handler = async (m) => {
    return m.reply('*╭  〔 ✕ ꜰɪᴛᴜʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ 〕*\n> Fitur Menfess (kirim pesan rahasia ke nomor target) telah dimatikan demi keselamatan nomor bot dari pembatasan Reachout Timelock & Error 463 WhatsApp.\n*╰───────────────*')
}

handler.tags = ['memfess']
handler.help = ['menfess']
handler.command = /^(menfess|menfes|confess|confes)$/i
handler.private = true
handler.disabled = true

handler.desc = 'Alat utilitas praktis untuk memproses menfess.'
handler.tutorial = [
  '.menfess <input>',
  'Ketik .menfess diikuti input yang diperlukan atau balas pesan target'
]

export default handler