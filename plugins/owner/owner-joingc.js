let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) throw '❌ Perintah ini khusus Owner!'
  if (!text) throw '❌ Masukkan link grup!\n\nContoh:\n.joingc https://chat.whatsapp.com/xxxx'

  let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
  let match = text.match(linkRegex)
  if (!match) throw '❌ Link grup tidak valid!'

  let inviteCode = match[1]

  try {
    await conn.groupAcceptInvite(inviteCode)
    m.reply('✅ Berhasil join ke grup!')
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal join grup!\nPastikan link masih aktif & bot belum ada di grup.')
  }
}

handler.help = ['joingc <link>']
handler.tags = ['owner']
handler.command = /^(joingc)$/i
handler.owner = true

export default handler