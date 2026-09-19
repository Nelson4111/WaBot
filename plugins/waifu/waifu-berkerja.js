import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

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

const rupiah = n => 'Rp ' + Number(n).toLocaleString('id-ID')
const FAIL_CHANCE = 0.08 // 8% chance gagal
const COOLDOWN = 2 * 60 * 1000 // 2 menit dalam milidetik

let handler = async (m, { usedPrefix, command }) => {
  const db = loadDB()

  // ===== CEK WAIFU =====
  if (!db.couples || !db.couples[m.sender]) {
    return m.reply(
      status.warning(`Kamu belum memiliki waifu untuk disuruh bekerja!\n> Lamar karakter: *${usedPrefix}waifulamar <nama>*`)
    )
  }

  const waifuName = db.couples[m.sender].charName

  // ===== CEK COOLDOWN =====
  if (!db.cooldown) db.cooldown = {}
  const last = db.cooldown[m.sender] || 0
  const now = Date.now()
  if (now - last < COOLDOWN) {
    const sisa = Math.ceil((COOLDOWN - (now - last)) / 1000)
    return m.reply(
      status.wait(`Waifumu sedang istirahat.\n> Silakan tunggu *${toSmallNum(sisa)} detik* sebelum bekerja lagi.`)
    )
  }

  const job = JOBS[Math.floor(Math.random() * JOBS.length)]
  const isFail = Math.random() < FAIL_CHANCE

  // UPDATE WAKTU COOLDOWN
  db.cooldown[m.sender] = now

  // ===== GAGAL (HYBRID CARD) =====
  if (isFail) {
    return m.reply(
      `*──  ୨୧ ✧ KENDALA PEKERJAAN ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⚠ ᴋ ᴇ ɴ ᴅ ᴀ ʟ ᴀ  ᴋ ᴇ ʀ ᴊ ᴀ 〕*\n` +
      `*┆* 𝜚 ᴡᴀɪꜰᴜ     : *${waifuName}*\n` +
      `*┆* ◈ ᴘᴇᴋᴇʀᴊᴀᴀɴ : *${job.name}*\n` +
      `> ✦ ᴋᴇɴᴅᴀʟᴀ : ${job.fail}\n` +
      `*╰───────────────*\n` +
      `> _${waifuName} tidak mendapatkan upah kali ini._`
    )
  }

  // ===== BERHASIL (HYBRID CARD) =====
  const earn =
    Math.floor(Math.random() * (job.max - job.min + 1)) + job.min

  db.money[m.sender] = (db.money[m.sender] || 0) + earn
  saveDB(db)

  m.reply(
    `*──  ୨୧ ✧ WAIFU PEKERJAAN ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ⚙ ʜ ᴀ ꜱ ɪ ʟ  ᴋ ᴇ ʀ ᴊ ᴀ 〕*\n` +
    `*┆* 𝜚 ᴡᴀɪꜰᴜ      : *${waifuName}*\n` +
    `*┆* ◈ ᴘᴇᴋᴇʀᴊᴀᴀɴ  : *${job.name}*\n` +
    `*┆* ❖ ᴘᴇɴᴅᴀᴘᴀᴛᴀɴ : *+${toSmallNum(rupiah(earn))}*\n` +
    `*┆* ⌬ ꜱᴀʟᴅᴏ      : *${toSmallNum(rupiah(db.money[m.sender]))}*\n` +
    `> ✦ ʜᴀꜱɪʟ : ${job.success}\n` +
    `*╰───────────────*`
  )
}

handler.command = /^(waifukerja|wkerja|berkerja)$/i
handler.tags = ['waifu']
handler.help = ['waifukerja']
handler.register = true

export default handler