import fetch from "node-fetch"

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh penggunaan:\n${usedPrefix + command} Nama Kamu`)

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let api = `https://api.siputzx.my.id/api/canvas/sertifikat-tolol?text=${encodeURIComponent(text)}`
    
    let res = await fetch(api)
    if (!res.ok) throw 'Server API sedang bermasalah.'
    let buffer = await res.buffer()

    await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `✅ *Sertipikat Generated*\n👤 *Nama*: ${text}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply("❌ Terjadi kesalahan.")
  }
}

handler.help = ['sertiftolol']
handler.tags = ['maker']
handler.command = /^sertiftolol|sertifikattolol$/i

export default handler