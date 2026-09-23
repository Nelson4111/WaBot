import { loadDB, saveDB, searchMALCharacter } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const isHusbu = /husbu|hlamar/i.test(command)
  const label = isHusbu ? 'Husbu' : 'Waifu'
  const partnerLabel = isHusbu ? 'husbu' : 'waifu'

  const db = loadDB()
  if (db.couples[m.sender]) {
    return status.warning(m, `Kamu sudah memiliki pasangan (${db.couples[m.sender].charName}).`, [
      `Gunakan *${usedPrefix}waifuputus* atau *${usedPrefix}husbuputus* terlebih dahulu jika ingin berpaling.`
    ])
  }

  const q = args.join(' ')
  if (!q) {
    return status.warning(m, `Masukkan nama karakter atau UID MyAnimeList!`, [
      `Contoh Nama: *${usedPrefix + command} ${isHusbu ? 'Levi' : 'Rem'}*`,
      `Contoh UID  : *${usedPrefix + command} 220209*`
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
      `Setiap karakter ${partnerLabel} bersifat eksklusif hanya untuk satu pasangan.`
    ])
  }

  db.couples[m.sender] = {
    charId: c.id,
    charName: c.nama,
    image: c.image || null,
    isHusbu
  }
  db.chars[c.id] = m.sender
  if (c.image && (!db.profilePP || !db.profilePP[c.id])) {
    if (!db.profilePP) db.profilePP = {}
    db.profilePP[c.id] = c.image
  }

  db.status[m.sender] = {
    mood: 50,
    lapar: 50,
    afinitas: 0
  }
  if (!db.lastMoodTick) db.lastMoodTick = {}
  db.lastMoodTick[m.sender] = Date.now()

  saveDB(db)

  const prefixCmd = isHusbu ? 'husbu' : 'waifu'
  const myCmd = isHusbu ? 'myhusbu' : 'mywaifu'

  const caption = `*╭  〔 💍 ${label.toUpperCase()}  ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ  ᴅ ɪ ʟ ᴀ ᴍ ᴀ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ : *${c.nama}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(c.id)}*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Menikah (Resmi)*
*┆* ⟡ ᴛɪᴘᴇ : *${label}*
*┆* ⟡ ᴀꜰɪɴɪᴛᴀꜱ ᴀᴡᴀʟ : *${toSmallNum(0)} Poin*
*┆* ⟡ ᴍᴏᴏᴅ / ʟᴀᴘᴀʀ : *${toSmallNum(50)}% / ${toSmallNum(50)}%*
*╰───────────────*
> Selamat! Rawatlah ${partnerLabel} kesayanganmu dengan penuh perhatian dan kasih sayang.

*╭  〔 ୨୧ ᴘ ᴀ ɴ ᴅ ᴜ ᴀ ɴ  ɪ ɴ ᴛ ᴇ ʀ ᴀ ᴋ ꜱ ɪ 〕*
*┆* ⟡ *${usedPrefix}${myCmd}* : Cek profil & status
*┆* ⟡ *${usedPrefix}${prefixCmd}act* : Berinteraksi harian
*┆* ⟡ *${usedPrefix}${prefixCmd}food* : Beri makan & energi
*┆* ⟡ *${usedPrefix}${prefixCmd}kerja* : Bekerja bersama
*╰───────────────*`

  if (c.image) {
    await conn.sendMessage(m.chat, { image: { url: c.image }, caption }, { quoted: m }).catch(() => m.reply(caption))
  } else {
    m.reply(caption)
  }
}

/* ===== META ===== */
handler.command = /^(waifulamar|wlamar|claimwaifu|husbulamar|hlamar|claimhusbu)$/i
handler.tags = ['waifu', 'husbu']
handler.help = ['waifulamar <nama|uid>', 'husbulamar <nama|uid>']

handler.register = true

export default handler