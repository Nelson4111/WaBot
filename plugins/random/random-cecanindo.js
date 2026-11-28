let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/indonesia'
    let caption = `🇮🇩 *Random Cecan Indonesia*\nAsli lokal, senyumnya bikin adem 😍`

    await conn.sendFile(m.chat, url, 'cecan-indo.jpg', caption, m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal ambil gambar cecan Indonesia.\n${e}`)
  }
}

handler.help = ['cecanindo']
handler.tags = ['random']
handler.command = /^cecanindo$/i
handler.limit = true

handler.desc = 'Menjalankan perintah cecanindo untuk layanan cecanindo.'
handler.tutorial = [
  '.cecanindo'
]

export default handler