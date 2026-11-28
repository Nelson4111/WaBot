/*
• fitur : Sticker.ly to WA Sticker (Delay 3 detik)
• type : plugins esm
• API : https://api.nekolabs.my.id
• author : hilman
*/

import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Contoh penggunaan:\n${usedPrefix}${command} <link Sticker.ly>`)

  try {
    const urlSticker = encodeURIComponent(args[0])
    const delaySec = 3

    const res = await fetch(`https://api.nekolabs.my.id/discovery/stickerly/detail?url=${urlSticker}`)
    const json = await res.json()
    if (!json.status || !json.result) throw '⚠️ Gagal mengambil data sticker'

    const pack = json.result
    const author = pack.author
    const stickers = pack.stickers.slice(0, 10) // maksimal 10 stiker
    let info = `📦 Nama Pack: ${pack.name}\n👤 Author: ${author.name}\n🌟 Followers: ${author.followers}\n🔗 Link: ${pack.url}\n🖼 Jumlah Stiker: ${pack.stickerCount}\n⏱ Delay antar stiker: ${delaySec} detik`
    await m.reply(info)
   
    for (let s of stickers) {
      const sticker = new Sticker(s.imageUrl, {
        pack: pack.name,
        author: 'By Hilman',
        type: 'full',
        categories: ['😏'],
      })
      const buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
   
      await new Promise(r => setTimeout(r, delaySec * 1000))
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error saat memproses stiker')
  }
}

handler.help = ['stickerly <link>']
handler.tags = ['sticker']
handler.command = /^(stickerly|stickerdownload)$/i
handler.limit = 2

handler.desc = 'Fitur pengolah stiker WhatsApp untuk stickerly.'
handler.tutorial = [
  '.stickerly (balas stiker/media)',
  'Kirim perintah .stickerly dengan membalas stiker atau gambar target'
]

export default handler