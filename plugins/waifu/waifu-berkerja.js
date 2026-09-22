import { loadDB, saveDB, decayWaifuStatus } from '../../lib/waifuHelper.js'
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
      status.warning(`Kamu belum memiliki waifu untuk disuruh bekerja!\n> Lamar karakter: *${usedPrefix}waifulamar <nama|uid>*`)
    )
  }

  const waifuName = db.couples[m.sender].charName

  // ===== CEK COOLDOWN TERPUSAT =====
  if (!db.cooldown) db.cooldown = { act: {}, kerja: {} }
  if (!db.cooldown.kerja) db.cooldown.kerja = {}

  const last = db.cooldown.kerja[m.sender] || 0
  const now = Date.now()
  if (now - last < COOLDOWN) {
    const sisa = Math.ceil((COOLDOWN - (now - last)) / 1000)
    return m.reply(
      status.wait(`Waifumu sedang beristirahat setelah bekerja.\n> Silakan tunggu *${toSmallNum(sisa)} detik* sebelum bekerja lagi.`)
    )
  }

  // ===== CEK STATUS FISIK / LAPAR WAIFU =====
  decayWaifuStatus(m.sender)
  if (!db.status) db.status = {}
  if (!db.status[m.sender]) {
    db.status[m.sender] = { mood: 50, lapar: 50, afinitas: 0 }
  }
  const st = db.status[m.sender]

  if ((st.lapar || 0) < 20) {
    return m.reply(
      status.warning(
        `Waifumu (*${waifuName}*) terlalu lemas dan kelaparan untuk bekerja!\n` +
        `> Energi Kenyang : *${toSmallNum(st.lapar || 0)}/𝟷𝟶𝟶*\n` +
        `> Silakan beri makan terlebih dahulu dengan *${usedPrefix}waifufood* agar tenaganya pulih.`
      )
    )
  }

  const job = JOBS[Math.floor(Math.random() * JOBS.length)]
  const isFail = Math.random() < FAIL_CHANCE

  // UPDATE WAKTU COOLDOWN & KONSUMSI ENERGI
  db.cooldown.kerja[m.sender] = now
  st.lapar = Math.max(0, (st.lapar || 50) - 15)

  // ===== GAGAL (HYBRID CARD) =====
  if (isFail) {
    saveDB(db)
    return m.reply(
      `*──  ୨୧ ✧ KENDALA PEKERJAAN ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⚠ ᴋ ᴇ ɴ ᴅ ᴀ ʟ ᴀ  ᴋ ᴇ ʀ ᴊ ᴀ 〕*\n` +
      `*┆* 𝜚 ᴡᴀɪꜰᴜ     : *${waifuName}*\n` +
      `*┆* ◈ ᴘᴇᴋᴇʀᴊᴀᴀɴ : *${job.name}*\n` +
      `*┆* 🍱 ᴇɴᴇʀɢɪ   : *${toSmallNum(st.lapar)}/𝟷𝟶𝟶* (-𝟷𝟻)\n` +
      `> ✦ ᴋᴇɴᴅᴀʟᴀ : ${job.fail}\n` +
      `*╰───────────────*\n` +
      `> _${waifuName} kelelahan dan tidak mendapatkan upah kali ini._`
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
    `*┆* 🍱 ꜱɪꜱᴀ ᴇɴᴇʀɢɪ: *${toSmallNum(st.lapar)}/𝟷𝟶𝟶* (-𝟷𝟻)\n` +
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