import { loadDB, saveDB, searchMALCharacter } from '../../lib/waifuHelper.js'

let handler = async (m, { args, usedPrefix, command }) => {
  const db = loadDB()
  if (db.couples[m.sender]) return m.reply(`❌ Kamu sudah punya waifu (${db.couples[m.sender].charName}).\n> Gunakan *${usedPrefix}waifuputus* terlebih dahulu jika ingin berganti.`)

  const q = args.join(' ')
  if (!q) return m.reply(`Masukkan nama karakter atau UID!\n> Contoh: *${usedPrefix + command} rem*`)

  const c = await searchMALCharacter(q)
  if (!c) return m.reply('❌ Karakter tidak ditemukan. Coba periksa ejaan nama anime atau gunakan UID.')
  if (db.chars[c.id]) return m.reply(`❌ Karakter *${c.nama}* sudah dilamar oleh orang lain.`)

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
  m.reply(`💍 *Kamu berhasil melamar waifu ${c.nama}!*\n\n> Gunakan *${usedPrefix}mywaifu* untuk melihat profil & status.\n> Gunakan *${usedPrefix}waifuact* untuk berinteraksi.\n> Gunakan *${usedPrefix}waifufood* untuk memberi makan.`)
}

/* ===== META ===== */
handler.command = /^(waifulamar|wlamar|claimwaifu)$/i
handler.tags = ['waifu']
handler.help = ['waifulamar <nama|uid>']

handler.register = true

export default handler