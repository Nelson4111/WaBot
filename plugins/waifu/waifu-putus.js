import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m) => {
  const db = loadDB()
  const c = db.couples[m.sender]
  if (!c) return m.reply('❌ Kamu belum memiliki waifu.')

  const charName = c.charName

  delete db.chars?.[c.charId]   // hapus data karakter jika ada
  delete db.couples[m.sender]   // hapus data pasangan waifu
  delete db.status?.[m.sender]   // reset status mood/lapar
  saveDB(db)

  m.reply(`💔 Kamu telah melepaskan / putus hubungan dengan waifu *${charName}*.\n> Karakter ini sekarang tersedia kembali di MyAnimeList untuk dilamar.`)
}

handler.command = /^(waifuputus|wputus|putuswaifu|putus)$/i
handler.tags = ['waifu']
handler.help = ['waifuputus']

export default handler