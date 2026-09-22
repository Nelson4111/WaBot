import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

const MAX = 100

/* ===== MAKANAN BIASA ===== */
const FOOD = {
  1: { name: 'Ayam Goreng 🍗', price: 15000, feed: 30, mood: 0, afk: 0 },
  2: { name: 'Ikan Goreng 🐟', price: 20000, feed: 40, mood: 0, afk: 0 },
  3: { name: 'Nasi Padang 🍛', price: 50000, feed: 80, mood: 5, afk: 0 }
}

/* ===== MAKANAN SPESIAL ===== */
const SPECIAL = {
  101: {
    name: 'Sushi Premium 🍣',
    price: 120000,
    feed: 100,
    mood: 20,
    afk: 10,
    desc: 'Hidangan segar khas Jepang favorit waifu'
  },
  102: {
    name: 'Strawberry Cake 🍰',
    price: 90000,
    feed: 50,
    mood: 30,
    afk: 15,
    desc: 'Kue manis lembut penambah suasana hati'
  },
  103: {
    name: 'Bento Spesial 🍱',
    price: 150000,
    feed: 80,
    mood: 25,
    afk: 30,
    desc: 'Bekal makan siang buatan penuh cinta'
  }
}

const rupiah = n => 'Rp ' + Number(n).toLocaleString('id-ID')
const clamp = v => Math.max(0, Math.min(MAX, v || 0))

let handler = async (m, { args, usedPrefix, command }) => {
  const db = loadDB()

  if (!db.couples || !db.couples[m.sender]) {
    return m.reply(
      status.warning(`Kamu belum memiliki waifu!\n> Lamar karakter: *${usedPrefix}waifulamar <nama>*`)
    )
  }

  const money = db.money[m.sender] || 0

  if (!db.status) db.status = {}
  if (!db.status[m.sender]) {
    db.status[m.sender] = { mood: 50, lapar: 50, afinitas: 0 }
  }

  const ALL = { ...FOOD, ...SPECIAL }

  /* ===== TAMPILKAN MENU ===== */
  if (!args[0] || !ALL[args[0]]) {
    let txt = `*──  ୨୧ ✧ MENU KAFE WAIFU ✧ ୨୧  ──*\n\n`

    txt += '*╭  〔 🍱 ᴍ ᴀ ᴋ ᴀ ɴ ᴀ ɴ  ʙ ɪ ᴀ ꜱ ᴀ 〕*\n'
    for (const i in FOOD) {
      const f = FOOD[i]
      txt +=
        `*┆* ${toSmallNum(i)}. ⟡ ${f.name}\n` +
        `*┆*    ◈ ʜᴀʀɢᴀ: *${toSmallNum(rupiah(f.price))}* | ✧ ʟᴀᴘᴀʀ: *+${toSmallNum(f.feed)}*\n`
    }
    txt += '*╰───────────────*\n\n'

    txt += '*╭  〔 🍣 ᴍ ᴀ ᴋ ᴀ ɴ ᴀ ɴ  ꜱ ᴘ ᴇ ꜱ ɪ ᴀ ʟ 〕*\n'
    for (const i in SPECIAL) {
      const f = SPECIAL[i]
      txt +=
        `*┆* ${toSmallNum(i)}. ✦ ${f.name}\n` +
        `*┆*    ◈ ʜᴀʀɢᴀ: *${toSmallNum(rupiah(f.price))}*\n` +
        `*┆*    ✧ ʟᴀᴘᴀʀ: *+${toSmallNum(f.feed)}* | ⟡ ᴍᴏᴏᴅ: *+${toSmallNum(f.mood)}* | ᰔ ᴀꜰɪɴɪᴛᴀꜱ: *+${toSmallNum(f.afk)}*\n` +
        `> _${f.desc}_\n`
    }
    txt += '*╰───────────────*\n\n'
    txt += `> ｡˚ ⊹ *Gunakan: ${usedPrefix + command} <nomor>* ⊹ ˚ ｡\n> Contoh: *${usedPrefix + command} 1*`
    return m.reply(txt)
  }

  /* ===== PROSES BELI ===== */
  decayWaifuStatus(m.sender)
  const f = ALL[args[0]]

  if (money < f.price) {
    return m.reply(
      status.error(`Saldo uang tidak cukup!\n> Harga: ${toSmallNum(rupiah(f.price))}\n> Saldo kamu: ${toSmallNum(rupiah(money))}`)
    )
  }

  // Cek jika waifu sudah kenyang penuh untuk makanan biasa
  if ((db.status[m.sender].lapar || 0) >= MAX && !f.mood && !f.afk) {
    return m.reply(
      status.warning(`Waifumu sudah sangat kenyang!\n> Tingkat kenyang: *${toSmallNum(MAX)}/${toSmallNum(MAX)}*\n> Biarkan waifumu beraktivitas atau bekerja terlebih dahulu sebelum disuap lagi.`)
    )
  }

  db.money[m.sender] -= f.price
  db.status[m.sender].lapar = clamp((db.status[m.sender].lapar || 50) + (f.feed || 0))
  db.status[m.sender].mood = clamp((db.status[m.sender].mood || 50) + (f.mood || 0))
  db.status[m.sender].afinitas = (db.status[m.sender].afinitas || 0) + (f.afk || 0)

  saveDB(db)

  m.reply(
    `*──  ୨୧ ✧ MAKANAN WAIFU ✧ ୨୧  ──*\n\n` +
    `*╭  〔 🍱 ꜱ ᴜ ᴀ ᴘ  ᴍ ᴀ ᴋ ᴀ ɴ 〕*\n` +
    `> ${f.name} berhasil disuapkan ke waifumu!\n` +
    `*┆* 🍱 ᴋᴇɴʏᴀɴɢ  : *${toSmallNum(db.status[m.sender].lapar)}/${toSmallNum(MAX)}* (+${toSmallNum(f.feed || 0)})\n` +
    (f.mood ? `*┆* ⟡ ᴍᴏᴏᴅ     : *+${toSmallNum(f.mood)}*\n` : '') +
    (f.afk ? `*┆* ᰔ ᴀꜰɪɴɪᴛᴀꜱ : *+${toSmallNum(f.afk)} Poin*\n` : '') +
    `*┆* ⌬ ꜱɪꜱᴀ ᴜᴀɴɢ : *${toSmallNum(rupiah(db.money[m.sender]))}*\n` +
    `*╰───────────────*`
  )
}

handler.command = /^(waifufood|waifumakan|belifood)$/i
handler.tags = ['waifu']
handler.help = ['waifufood [nomor]']
handler.register = true

export default handler