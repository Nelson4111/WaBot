import { loadDB, saveDB, searchMALCharacter } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { args, usedPrefix, command }) => {
  const db = loadDB()
  if (db.couples[m.sender]) {
    return status.warning(m, `Kamu sudah memiliki waifu (${db.couples[m.sender].charName}).`, [
      `Gunakan *${usedPrefix}waifuputus* terlebih dahulu jika ingin berpaling.`
    ])
  }

  const q = args.join(' ')
  if (!q) {
    return status.warning(m, 'Masukkan nama karakter atau UID MyAnimeList!', [
      `Contoh: *${usedPrefix + command} Rem*`,
      `Contoh UID: *${usedPrefix + command} 118763*`
    ])
  }

  const c = await searchMALCharacter(q)
  if (!c) {
    return status.error(m, 'Karakter tidak ditemukan di MyAnimeList.', [
      'Periksa kembali ejaan nama karakter atau coba gunakan UID MAL.'
    ])
  }

  if (db.chars[c.id]) {
    return status.error(m, `Karakter *${c.nama}* sudah dilamar oleh pengembara lain.`, [
      'Setiap karakter waifu bersifat eksklusif hanya untuk satu pasangan.'
    ])
  }

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

  const caption = `*╭  〔 💍 ᴡ ᴀ ɪ ꜰ ᴜ  ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ  ᴅ ɪ ʟ ᴀ ᴍ ᴀ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ : *${c.nama}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(c.id)}*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Menikah (Resmi)*
*┆* ⟡ ᴀꜰɪɴɪᴛᴀꜱ ᴀᴡᴀʟ : *${toSmallNum(0)}%*
*┆* ⟡ ᴍᴏᴏᴅ / ʟᴀᴘᴀʀ : *${toSmallNum(50)}% / ${toSmallNum(50)}%*
*╰───────────────*
> Selamat! Rawatlah waifu kesayanganmu dengan penuh perhatian dan kasih sayang.

*╭  〔 ୨୧ ᴘ ᴀ ɴ ᴅ ᴜ ᴀ ɴ  ɪ ɴ ᴛ ᴇ ʀ ᴀ ᴋ ꜱ ɪ 〕*
*┆* ⟡ *${usedPrefix}mywaifu* : Cek profil & status
*┆* ⟡ *${usedPrefix}waifuact* : Berinteraksi harian
*┆* ⟡ *${usedPrefix}waifufood* : Beri makan & energi
*┆* ⟡ *${usedPrefix}waifukerja* : Bekerja bersama
*╰───────────────*`

  m.reply(caption)
}

/* ===== META ===== */
handler.command = /^(waifulamar|wlamar|claimwaifu)$/i
handler.tags = ['waifu']
handler.help = ['waifulamar <nama|uid>']

handler.register = true

export default handler