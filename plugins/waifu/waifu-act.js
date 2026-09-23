import { loadDB, saveDB, decayWaifuStatus } from '../../lib/waifuHelper.js'
import { toSmallNum, status as statusHelper } from '../../lib/style.js'

const NORMAL_COOLDOWN = 60 * 1000   // 60 detik
const PREMIUM_COOLDOWN = 30 * 1000  // 30 detik

/* ===== DAFTAR INTERAKSI ===== */
const ACT_LIST = {
  1: {
    nama: 'Ajak jalan-jalan',
    mood: 10,
    lapar: 5,
    afinitas: 5,
    text: 'Pasanganmu terlihat sangat menikmati waktu berjalan bersamamu.'
  },
  2: {
    nama: 'Pelukan hangat',
    mood: 8,
    lapar: 1,
    afinitas: 6,
    text: 'Pasanganmu membalas pelukanmu dan merasa nyaman serta terlindungi.'
  },
  3: {
    nama: 'Kecupan manis',
    mood: 12,
    lapar: 1,
    afinitas: 8,
    text: 'Wajah pasanganmu merona merah dan tersenyum malu-malu kepadamu.'
  },
  4: {
    nama: 'Ngobrol santai',
    mood: 6,
    lapar: 2,
    afinitas: 4,
    text: 'Pasanganmu mendengarkan ceritamu dengan penuh perhatian dan antusias.'
  },
  5: {
    nama: 'Memberi perhatian',
    mood: 7,
    lapar: 1,
    afinitas: 6,
    text: 'Pasanganmu merasa dihargai oleh kasih sayang yang kamu berikan.'
  },
  6: {
    nama: 'Bercanda & tertawa',
    mood: 9,
    lapar: 3,
    afinitas: 5,
    text: 'Pasanganmu tertawa ceria dan suasana menjadi jauh lebih hangat.'
  },
  7: {
    nama: 'Menemani di sisinya',
    mood: 5,
    lapar: 1,
    afinitas: 7,
    text: 'Pasanganmu merasa tenang dan damai dengan kehadiranmu di sampingnya.'
  },
  8: {
    nama: 'Memberi hadiah kecil',
    mood: 12,
    lapar: 1,
    afinitas: 10,
    text: 'Mata pasanganmu berbinar-binar gembira menerima hadiah darimu.'
  },
  9: {
    nama: 'Menghibur & menyemangati',
    mood: 10,
    lapar: 2,
    afinitas: 6,
    text: 'Pasanganmu perlahan merasa lebih bersemangat setelah kamu menenangkannya.'
  },
  10: {
    nama: 'Menghabiskan waktu bersama',
    mood: 8,
    lapar: 4,
    afinitas: 8,
    text: 'Pasanganmu menikmati setiap detik kebersamaan yang terjalin di antara kalian.'
  }
}

let handler = async (m, { args, usedPrefix, command }) => {
  const db = loadDB()
  const user = m.sender
  const now = Date.now()

  /* ===== DATA USER ===== */
  if (!db.users) db.users = {}
  if (!db.users[user]) db.users[user] = {}

  const isPremium = db.users[user].premiumTime > 0

  /* ===== CEK PASANGAN ===== */
  const c = db.couples?.[user]
  const isHusbu = Boolean(c?.isHusbu) || /husbu|hact/i.test(command)
  const label = isHusbu ? 'Husbu' : 'Waifu'
  const partnerLabel = isHusbu ? 'husbu' : 'waifu'
  const prefixCmd = isHusbu ? 'husbu' : 'waifu'

  if (!c) {
    return m.reply(
      statusHelper.warning(`Kamu belum memiliki ${partnerLabel}!\n> Lamar karakter: *${usedPrefix}${prefixCmd}lamar <nama|uid>*`)
    )
  }

  /* ===== MENU ACT (TAMPILKAN DAFTAR TANPA TERHALANG COOLDOWN) ===== */
  if (!args[0]) {
    let teks = `*──  ୨୧ ✧ INTERAKSI ${label.toUpperCase()} ✧ ୨୧  ──*\n\n`
    teks += '*╭  〔 ᰔ ᴘ ɪ ʟ ɪ ʜ ᴀ ɴ  ᴀ ᴋ ꜱ ɪ 〕*\n'
    for (const i in ACT_LIST) {
      teks += `*┆* ${toSmallNum(i)}. ⟡ ${ACT_LIST[i].nama}\n`
    }
    teks += `*╰───────────────*\n\n> ｡˚ ⊹ *Gunakan: ${usedPrefix + command} <nomor>* ⊹ ˚ ｡\n> Contoh: *${usedPrefix + command} 1*`
    return m.reply(teks)
  }

  const act = ACT_LIST[args[0]]
  if (!act) {
    return m.reply(statusHelper.warning(`Pilihan nomor interaksi tidak valid.\n> Ketik *${usedPrefix + command}* untuk melihat daftar nomor aksi.`))
  }

  /* ===== CEK COOLDOWN SAAT MELAKUKAN AKSI ===== */
  const cooldownTime = isPremium ? PREMIUM_COOLDOWN : NORMAL_COOLDOWN
  const last = db.cooldown?.act?.[user] || 0
  const sisa = cooldownTime - (now - last)

  if (sisa > 0) {
    const detik = Math.ceil(sisa / 1000)
    return m.reply(
      statusHelper.wait(`Waifumu masih beristirahat.\n> Silakan tunggu *${toSmallNum(detik)} detik* lagi sebelum berinteraksi kembali.`)
    )
  }

  /* ===== UPDATE STATUS & DECAY ===== */
  decayWaifuStatus(user)
  if (!db.status) db.status = {}
  if (!db.status[user]) {
    db.status[user] = { mood: 50, lapar: 50, afinitas: 0 }
  }

  const userStatus = db.status[user]

  // Berinteraksi meningkatkan mood dan afinitas, serta mengonsumsi sedikit energi (kenyang)
  const oldMood = userStatus.mood || 50
  userStatus.mood = Math.min(100, oldMood + act.mood)
  userStatus.lapar = Math.max(0, (userStatus.lapar || 50) - (act.lapar || 0))
  userStatus.afinitas = (userStatus.afinitas || 0) + act.afinitas

  if (!db.cooldown.act) db.cooldown.act = {}
  db.cooldown.act[user] = now
  saveDB(db)

  /* ===== HASIL (HYBRID CARD) ===== */
  const moodNotice = oldMood >= 100 ? ' (Sudah Maksimal ♡)' : ` (+${toSmallNum(act.mood)})`
  const foodNotice = act.lapar > 0 ? ` (-${toSmallNum(act.lapar)})` : ''

  m.reply(
    `*──  ୨୧ ✧ INTERAKSI ${label.toUpperCase()} ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ᰔ ʜ ᴀ ꜱ ɪ ʟ  ᴀ ᴋ ꜱ ɪ 〕*\n` +
    `> ${act.text}\n` +
    `*┆* ⟡ ᴍᴏᴏᴅ     : *${toSmallNum(userStatus.mood)}/𝟷𝟶𝟶*${moodNotice}\n` +
    `*┆* ✧ ʟᴀᴘᴀʀ    : *${toSmallNum(userStatus.lapar)}/𝟷𝟶𝟶*${foodNotice}\n` +
    `*┆* ✦ ᴀꜰɪɴɪᴛᴀꜱ : *+${toSmallNum(act.afinitas)} (${toSmallNum(userStatus.afinitas)} Poin)*\n` +
    `*╰───────────────*`
  )
}

/* ===== META ===== */
handler.command = /^(waifuact|wact|act|husbuact|hact)$/i
handler.tags = ['waifu', 'husbu']
handler.help = ['waifuact', 'husbuact']
handler.register = true

export default handler