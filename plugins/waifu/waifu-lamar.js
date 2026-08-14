import { loadDB, saveDB, searchMALCharacter } from '../../lib/waifuHelper.js'

let handler = async (m, { args }) => {
  const db = loadDB()
  if (db.couples[m.sender]) return m.reply('❌ Kamu sudah punya pasangan')

  const q = args.join(' ')
  if (!q) return m.reply('Masukkan nama karakter')

  const c = await searchMALCharacter(q)
  if (!c) return m.reply('Karakter tidak ditemukan')
  if (db.chars[c.id]) return m.reply('Karakter sudah diambil')

  db.couples[m.sender] = {
    charId: c.id,
    charName: c.nama
  }
  db.chars[c.id] = m.sender

  db.status[m.sender] = {
    mood: 50,
    lapar: 50,
    afinitas: 0
  }

  saveDB(db)
  m.reply(`💍 Kamu berhasil melamar ${c.nama}`)
}

/* ===== META ===== */
handler.command = /^(lamar)$/i
handler.tags = ['waifu']
handler.help = ['lamar <nama karakter>']

handler.register = true

export default handler