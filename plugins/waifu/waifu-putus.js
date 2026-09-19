import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { status } from '../../lib/style.js'

let handler = async (m) => {
  const db = loadDB()
  const c = db.couples[m.sender]
  if (!c) {
    return status.warning(m, 'Kamu belum memiliki pasangan waifu untuk dilepaskan.')
  }

  const charName = c.charName

  delete db.chars?.[c.charId]   // hapus data karakter jika ada
  delete db.couples[m.sender]   // hapus data pasangan waifu
  delete db.status?.[m.sender]   // reset status mood/lapar
  saveDB(db)

  const caption = `*╭  〔 💔 ᴘ ᴜ ᴛ ᴜ ꜱ  ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ᴍᴀɴᴛᴀɴ ᴡᴀɪꜰᴜ : *${charName}*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Telah Berpisah*
*╰───────────────*
> Kamu telah melepaskan ikatan dengan ${charName}. Karakter ini sekarang bebas dan dapat dilamar kembali oleh pengembara lain.`

  m.reply(caption)
}

handler.command = /^(waifuputus|wputus|putuswaifu|putus)$/i
handler.tags = ['waifu']
handler.help = ['waifuputus']

export default handler