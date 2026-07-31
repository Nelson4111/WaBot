import { loadDB, saveDB } from '../../lib/waifuHelper.js'

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

let handler = async (m, { args }) => {
  const db = loadDB()
  const user = m.sender
  const now = Date.now()

  /* ===== CEK PASANGAN ===== */
  if (!db.couples || !db.couples[user]) {
    return m.reply('Kamu belum memiliki pasangan.')
  }

  /* ===== DATA USER ===== */
  if (!db.users) db.users = {}
  if (!db.users[user]) db.users[user] = {}

  const isPremium = db.users[user].premiumTime > 0

  /* ===== INIT STATUS ===== */
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
      `Aksi masih dalam cooldown.\nSilakan tunggu ${detik} detik lagi.`
    )
  }

  const status = db.status[user]

  /* ===== MENU ACT ===== */
  if (!args[0]) {
    let teks = '*AKSI PASANGAN*\n\n'
    for (const i in ACT_LIST) {
      teks += `${i}. ${ACT_LIST[i].nama}\n`
    }
    teks += '\nGunakan perintah:\nact <nomor>\nContoh: act 1'
    return m.reply(teks)
  }

  const act = ACT_LIST[args[0]]
  if (!act) return m.reply('Pilihan tidak valid.')

  /* ===== UPDATE STATUS ===== */
  status.mood = Math.min(100, status.mood + act.mood)
  status.lapar = Math.min(100, status.lapar + act.lapar)
  status.afinitas = Math.min(100, status.afinitas + act.afinitas)

  db.cooldown.act[user] = now
  saveDB(db)

  /* ===== HASIL ===== */
  m.reply(
    `${act.text}\n\n` +
    `Mood     : ${status.mood}/100\n` +
    `Lapar    : ${status.lapar}/100\n` +
    `Afinitas : ${status.afinitas}/100`
  )
}

/* ===== META ===== */
handler.command = /^(act)$/i
handler.tags = ['waifu']
handler.help = ['act', 'act <nomor>']
handler.register = true

export default handler