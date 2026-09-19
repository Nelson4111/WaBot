import { loadDB, saveDB } from '../../lib/waifuHelper.js'
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
    text: 'Pasanganmu terlihat menikmati waktu berjalan bersamamu.'
  },
  2: {
    nama: 'Pelukan',
    mood: 8,
    lapar: 0,
    afinitas: 6,
    text: 'Pasanganmu membalas pelukanmu dan terlihat merasa nyaman.'
  },
  3: {
    nama: 'Cium',
    mood: 12,
    lapar: 0,
    afinitas: 8,
    text: 'Pasanganmu tersenyum pelan setelah menerima perhatian darimu.'
  },
  4: {
    nama: 'Ngobrol santai',
    mood: 6,
    lapar: 0,
    afinitas: 4,
    text: 'Pasanganmu mendengarkan ceritamu dengan penuh perhatian.'
  },
  5: {
    nama: 'Memberi perhatian',
    mood: 7,
    lapar: 0,
    afinitas: 6,
    text: 'Pasanganmu merasa dihargai oleh perhatian yang kamu berikan.'
  },
  6: {
    nama: 'Bercanda',
    mood: 9,
    lapar: 0,
    afinitas: 5,
    text: 'Pasanganmu tertawa kecil dan suasana menjadi lebih hangat.'
  },
  7: {
    nama: 'Menemani diam-diam',
    mood: 5,
    lapar: 0,
    afinitas: 7,
    text: 'Pasanganmu merasa tenang dengan kehadiranmu di sisinya.'
  },
  8: {
    nama: 'Memberi hadiah kecil',
    mood: 10,
    lapar: 0,
    afinitas: 10,
    text: 'Pasanganmu terlihat terkejut dan senang menerima pemberianmu.'
  },
  9: {
    nama: 'Menghibur',
    mood: 12,
    lapar: 0,
    afinitas: 6,
    text: 'Pasanganmu perlahan merasa lebih baik setelah kamu menenangkannya.'
  },
  10: {
    nama: 'Menghabiskan waktu bersama',
    mood: 8,
    lapar: 3,
    afinitas: 8,
    text: 'Pasanganmu menikmati kebersamaan yang terjalin di antara kalian.'
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

  /* ===== CEK WAIFU ===== */
  if (!db.couples || !db.couples[user]) {
    return m.reply(
      statusHelper.warning(`Kamu belum memiliki waifu!\n> Lamar karakter: *${usedPrefix}waifulamar <nama>*`)
    )
  }

  /* ===== INIT STATUS ===== */
  if (!db.status) db.status = {}
  if (!db.status[user]) {
    db.status[user] = { mood: 50, lapar: 50, afinitas: 0 }
  }

  /* ===== INIT COOLDOWN ===== */
  if (!db.cooldown) db.cooldown = {}
  if (!db.cooldown.act) db.cooldown.act = {}

  const cooldownTime = isPremium ? PREMIUM_COOLDOWN : NORMAL_COOLDOWN
  const last = db.cooldown.act[user] || 0
  const sisa = cooldownTime - (now - last)

  if (sisa > 0) {
    const detik = Math.ceil(sisa / 1000)
    return m.reply(
      statusHelper.wait(`Aksi masih dalam cooldown.\n> Silakan tunggu *${toSmallNum(detik)} detik* lagi.`)
    )
  }

  const userStatus = db.status[user]

  /* ===== MENU ACT ===== */
  if (!args[0]) {
    let teks = `*──  ୨୧ ✧ INTERAKSI WAIFU ✧ ୨୧  ──*\n\n`
    teks += '*╭  〔 ᰔ ᴘ ɪ ʟ ɪ ʜ ᴀ ɴ  ᴀ ᴋ ꜱ ɪ 〕*\n'
    for (const i in ACT_LIST) {
      teks += `*┆* ${toSmallNum(i)}. ⟡ ${ACT_LIST[i].nama}\n`
    }
    teks += `*╰───────────────*\n\n> ｡˚ ⊹ *Gunakan: ${usedPrefix + command} <nomor>* ⊹ ˚ ｡\n> Contoh: *${usedPrefix + command} 1*`
    return m.reply(teks)
  }

  const act = ACT_LIST[args[0]]
  if (!act) return m.reply(statusHelper.warning('Pilihan nomor interaksi tidak valid.'))

  /* ===== CEK BATAS STATUS ===== */
  if (userStatus.mood >= 100 && act.mood > 0) {
    return m.reply(statusHelper.warning('Waifumu sudah sangat bahagia! (Mood maksimal)'))
  }

  /* ===== UPDATE STATUS ===== */
  userStatus.mood = Math.min(100, userStatus.mood + act.mood)
  userStatus.lapar = Math.min(100, userStatus.lapar + act.lapar)
  userStatus.afinitas = Math.min(100, userStatus.afinitas + act.afinitas)

  db.cooldown.act[user] = now
  saveDB(db)

  /* ===== HASIL (HYBRID CARD) ===== */
  m.reply(
    `*──  ୨୧ ✧ INTERAKSI WAIFU ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ᰔ ʜ ᴀ ꜱ ɪ ʟ  ᴀ ᴋ ꜱ ɪ 〕*\n` +
    `> ${act.text}\n` +
    `*┆* ⟡ ᴍᴏᴏᴅ     : *+${toSmallNum(act.mood)} (${toSmallNum(userStatus.mood)}/𝟷𝟶𝟶)*\n` +
    `*┆* ✧ ʟᴀᴘᴀʀ    : *+${toSmallNum(act.lapar)} (${toSmallNum(userStatus.lapar)}/𝟷𝟶𝟶)*\n` +
    `*┆* ✦ ᴀꜰɪɴɪᴛᴀꜱ : *+${toSmallNum(act.afinitas)} (${toSmallNum(userStatus.afinitas)}/𝟷𝟶𝟶)*\n` +
    `*╰───────────────*`
  )
}

/* ===== META ===== */
handler.command = /^(waifuact|wact|act)$/i
handler.tags = ['waifu']
handler.help = ['waifuact', 'waifuact <nomor>']
handler.register = true

export default handler