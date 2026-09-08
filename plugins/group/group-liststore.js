import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { usedPrefix }) => {
  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.list || Object.keys(chat.list).length === 0) {
    return m.reply(`*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Belum ada katalog pesan atau media yang tersimpan di grup ini.\n> Gunakan *${usedPrefix}setlist* untuk membuat katalog baru.\n*╰───────────────*`)
  }
  
  const listKeys = Object.keys(chat.list).sort()
  const lines = listKeys.map((key, index) => {
    const entry = chat.list[key]
    const typeStr = entry.type === 'media' ? `Media (${entry.mime.split('/')[0]})` : 'Teks'
    return `*┆*   ${toSmallNum(index + 1)}. *${usedPrefix + key}* › _[${typeStr}]_`
  })
  
  const txt = `*──  ୨୧ ✧ DIREKTORI KATALOG GRUP ✧ ୨୧  ──*

> *おしらせ!* (ᴅᴀꜰᴛᴀʀ ᴋᴏᴍᴀɴᴅᴏ ᴋᴜꜱᴛᴏᴍ)
> Daftar pesan dan media kustom yang terdaftar di grup ini:

*╭  〔 ❖ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴋ ᴀ ᴛ ᴀ ʟ ᴏ ɢ 〕*
${lines.join('\n')}
*╰───────────────*

> ｡˚ ⊹ _Ketik langsung perintah di atas untuk melihat isi pesan_ ⊹ ˚ ｡`.trim()
  
  return m.reply(txt)
}

handler.help = ['liststore']
handler.tags = ['group']
handler.command = /^(liststore|storelist|listcmd|list)$/i
handler.group = true

export default handler
