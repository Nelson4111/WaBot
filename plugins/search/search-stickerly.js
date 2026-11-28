/*
stickerly search
plugins esm
sumber : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K

sumber scarape : https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/201
*/

import axios from 'axios'

class StickerLy {
  async search(query) {
    if (!query) throw 'Masukan keyword pencarian stiker!'
    const { data } = await axios.post('https://api.sticker.ly/v4/stickerPack/smartSearch', {
      keyword: query,
      enabledKeywordSearch: true,
      filter: {
        extendSearchResult: false,
        sortBy: 'RECOMMENDED',
        languages: ['ALL'],
        minStickerCount: 5,
        searchBy: 'ALL',
        stickerType: 'ALL'
      }
    }, {
      headers: {
        'user-agent': 'androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)',
        'content-type': 'application/json',
        'accept-encoding': 'gzip'
      }
    })
    return data.result.stickerPacks.map(pack => ({
      name: pack.name,
      author: pack.authorName,
      stickerCount: pack.resourceFiles.length,
      viewCount: pack.viewCount,
      exportCount: pack.exportCount,
      isPaid: pack.isPaid,
      isAnimated: pack.isAnimated,
      thumbnailUrl: `${pack.resourceUrlPrefix}${pack.resourceFiles[pack.trayIndex]}`,
      url: pack.shareUrl
    }))
  }
}

let handler = async (m, { conn, text, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
  try {
    if (!text) throw `Contoh: .${command} anomali`
    const s = new StickerLy()
    const packs = await s.search(text)
    if (!packs.length) throw 'Stiker tidak ditemukan!'
    let hasil = `*Hasil pencarian Sticker.ly: ${text}*\n\n`
    hasil += packs.map((v, i) => `*${i + 1}. ${v.name}*\n👤 *Author:* ${v.author}\n🖼️ *Stiker:* ${v.stickerCount}\n🔥 *Dilihat:* ${v.viewCount}\n🔗 ${v.url}\n`).join('\n')

    await conn.sendMessage(m.chat, {
      image: { url: packs[0].thumbnailUrl },
      caption: hasil
    }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, e.toString(), m)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.help = ['stickerlysearch <keyword>']
handler.tags = ['sticker', 'search']
handler.command = /(stickerlys|stickerlysearch)$/i
handler.limit = true

handler.desc = 'Mencari informasi atau media stickerly berdasarkan kata kunci pencarian.'
handler.tutorial = [
  '.stickerlys <kata kunci>',
  'Contoh: .stickerlys pencarian'
]

export default handler