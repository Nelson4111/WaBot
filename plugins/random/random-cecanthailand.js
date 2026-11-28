let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/thailand'
    await conn.sendFile(m.chat, url, 'cecan-thai.jpg', '', m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal ambil gambar cecan Thailand.\n${e}`)
  }
}

handler.help = ['cecanthai']
handler.tags = ['random']
handler.command = /^cecanthai$/i
handler.limit = true

handler.desc = 'Menjalankan perintah cecanthai untuk layanan cecanthailand.'
handler.tutorial = [
  '.cecanthai'
]

export default handler