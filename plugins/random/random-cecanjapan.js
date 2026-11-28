let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/japan'
    let caption = `🇯🇵 *Random Cecan Jepang*\nManisnya bikin pengen liburan ke Tokyo 😳`

    await conn.sendFile(m.chat, url, 'cecan-japan.jpg', caption, m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal ambil gambar cecan Jepang.\n${e}`)
  }
}

handler.help = ['cecanjapan']
handler.tags = ['random']
handler.command = /^cecanjapan$/i
handler.limit = true

handler.desc = 'Menjalankan perintah cecanjapan untuk layanan cecanjapan.'
handler.tutorial = [
  '.cecanjapan'
]

export default handler