import { loadDB, saveDB } from '../../lib/waifuHelper.js'

const JOBS = [
  {
    name: 'Programmer',
    success: 'ngoding dengan lancar dan bug berhasil diperbaiki',
    fail: 'salah satu baris kode error dan program crash',
    min: 15000,
    max: 30000
  },
  {
    name: 'Penjual Makanan',
    success: 'jualan ramai sampai dagangan habis',
    fail: 'lupa kasih bumbu, pelanggan komplain',
    min: 12000,
    max: 25000
  },
  {
    name: 'Kurir',
    success: 'mengantar paket tepat waktu',
    fail: 'salah alamat dan paket dikembalikan',
    min: 14000,
    max: 26000
  },
  {
    name: 'Petugas Kebersihan',
    success: 'membersihkan area dengan rapi',
    fail: 'terpeleset karena lantai licin',
    min: 10000,
    max: 20000
  },
  {
    name: 'Streamer Game',
    success: 'stream ramai dan banyak donasi',
    fail: 'koneksi internet putus saat live',
    min: 20000,
    max: 40000
  }
]

const rupiah = n => 'Rp' + n.toLocaleString('id-ID')
const FAIL_CHANCE = 0.08 // 8% chance gagal
const COOLDOWN = 2 * 60 * 1000 // 2 menit dalam milidetik

let handler = async (m) => {
  const db = loadDB()

  // ===== CEK COOLDOWN =====
  if (!db.cooldown) db.cooldown = {}
  const last = db.cooldown[m.sender] || 0
  const now = Date.now()
  if (now - last < COOLDOWN) {
    const sisa = Math.ceil((COOLDOWN - (now - last)) / 1000)
    return m.reply(`⏳ Tunggu ${sisa} detik sebelum bekerja lagi`)
  }

  const job = JOBS[Math.floor(Math.random() * JOBS.length)]
  const isFail = Math.random() < FAIL_CHANCE

  // UPDATE WAKTU COOLDOWN
  db.cooldown[m.sender] = now

  // ===== GAGAL =====
  if (isFail) {
    return m.reply(
      `❌ KESALAHAN KERJA!\n\n` +
      `Pekerjaan: ${job.name}\n` +
      `⚠️ ${job.fail}\n\n` +
      `💸 Kamu tidak mendapatkan gaji hari ini`
    )
  }

  // ===== BERHASIL =====
  const earn =
    Math.floor(Math.random() * (job.max - job.min + 1)) + job.min

  db.money[m.sender] = (db.money[m.sender] || 0) + earn
  saveDB(db)

  m.reply(
    `✅ KERJA BERHASIL!\n\n` +
    `Pekerjaan: ${job.name}\n` +
    `✨ ${job.success}\n\n` +
    `💰 Pendapatan: ${rupiah(earn)}\n` +
    `💳 Saldo sekarang: ${rupiah(db.money[m.sender])}`
  )
}

handler.command = ['berkerja']
handler.tags = ['waifu']
handler.help = ['berkerja']
handler.register = true

export default handler