let handler = async (m) => {
    return m.reply('*╭  〔 ✕ ꜰɪᴛᴜʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ 〕*\n> Fitur spam pesan telah dimatikan secara permanen demi keselamatan nomor bot dari sistem Anti-Abuse WhatsApp.\n*╰───────────────*')
}

handler.help = ['spamwa']
handler.tags = ['tools']
handler.command = /^spam(wa)?$/i
handler.owner = true
handler.disabled = true

handler.desc = 'Alat utilitas praktis untuk memproses spamwa.'
handler.tutorial = [
  '.spamwa <input>',
  'Ketik .spamwa diikuti input yang diperlukan atau balas pesan target'
]

export default handler

