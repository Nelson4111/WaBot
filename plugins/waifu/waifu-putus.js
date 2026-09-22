import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { status } from '../../lib/style.js'

let handler = async (m) => {
  const db = loadDB()
  const c = db.couples?.[m.sender]
  if (!c) {
    return status.warning(m, 'Kamu belum memiliki pasangan waifu untuk dilepaskan.')
  }

  const charName = c.charName

  delete db.chars?.[c.charId]
  delete db.couples[m.sender]
  delete db.status?.[m.sender]
  delete db.lastMoodTick?.[m.sender]
  if (db.cooldown?.act) delete db.cooldown.act[m.sender]
  if (db.cooldown?.kerja) delete db.cooldown.kerja[m.sender]

  saveDB(db)

  const caption = `*──  ୨୧ ✧ PUTUS HUBUNGAN ✧ ୨୧  ──*

*╭  〔 💔 ᴘ ᴜ ᴛ ᴜ ꜱ 〕*
*┆* ⟡ ᴍᴀɴᴛᴀɴ ᴡᴀɪꜰᴜ : *${charName}*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ       : *Telah Berpisah*
*╰───────────────*

> ｡˚ ⊹ *Kamu telah melepaskan ikatan dengan ${charName}. Karakter ini sekarang bebas dan dapat dilamar kembali.* ⊹ ˚ ｡`.trim()

  await m.reply(caption)
}

handler.command = /^(waifuputus|wputus|putuswaifu)$/i
handler.tags = ['waifu']
handler.help = ['waifuputus']
handler.register = true

export default handler