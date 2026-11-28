/* 
• Random Blue Archive
• API : https://api.siputzx.my.id
*/

import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {
  try {
    const res = await fetch('https://api.siputzx.my.id/api/r/blue-archive')
    const buffer = await res.buffer()

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `🎀 ᴡᴀɪғᴜ ʀᴀɴᴅᴏᴍ ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ\n\nKlik tombol di bawah buat waifu baru 🔁`,
      buttons: [
        {
          buttonId: `.${command}`,
          buttonText: { displayText: '🔁 Next Waifu' },
          type: 1
        }
      ]
    }, { quoted: m })
    
  } catch (err) {
    console.error('❌ Gagal ambil waifu:', err)
    m.reply('❌ Gagal memuat waifu! Coba lagi nanti.')
  }
}

handler.help = ['bluearchive']
handler.tags = ['anime', 'random']
handler.command = /^bluearchive$/i
handler.limit = true

handler.desc = 'Menampilkan informasi, gambar karakter, atau media anime bluearchive.'
handler.tutorial = [
  '.bluearchive'
]

export default handler