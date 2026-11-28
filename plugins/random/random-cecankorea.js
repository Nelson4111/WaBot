let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/korea'
    let caption = `📸 *Random Cecan korea*\nSenyumnya bikin semangat 😳`

    await conn.sendFile(m.chat, url, 'cecan.jpg', caption, m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal ambil gambar cecan.\n${e}`)
  }
}

handler.help = ['cecankorea']
handler.tags = ['random']
handler.command = /^cecankorea$/i
handler.limit = true

handler.desc = 'Menjalankan perintah cecankorea untuk layanan cecankorea.'
handler.tutorial = [
  '.cecankorea'
]

export default handler