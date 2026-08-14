import { loadDB, saveDB } from '../../lib/waifuHelper.js'

const MAX = 100

/* ===== MAKANAN BIASA ===== */
const FOOD = {
  1: { name: '🍗 Ayam Goreng', price: 15000, feed: 30, mood: 0, afk: 0 },
  2: { name: '🐟 Ikan Goreng', price: 20000, feed: 40, mood: 0, afk: 0 },
  3: { name: '🍛 Nasi Padang', price: 50000, feed: 80, mood: 5, afk: 0 }
}

/* ===== MAKANAN SPESIAL ===== */
const SPECIAL = {
  101: {
    name: '🍣 Sushi Premium',
    price: 120000,
    feed: 100,
    mood: 20,
    afk: 10,
    desc: 'Makanan khas Jepang'
  },
  102: {
    name: '🍰 Strawberry Cake',
    price: 90000,
    feed: 50,
    mood: 30,
    afk: 15,
    desc: 'Makanan manis favorit waifu'
  },
  103: {
    name: '🍱 Bento',
    price: 150000,
    feed: 80,
    mood: 25,
    afk: 30,
    desc: 'Dibuat penuh cinta'
  }
}

const rupiah = n => 'Rp' + n.toLocaleString('id-ID')
const clamp = v => Math.max(0, Math.min(MAX, v || 0))

let handler = async (m, { args }) => {
  const db = loadDB()
  const money = db.money[m.sender] || 0

  if (!db.status[m.sender]) {
    db.status[m.sender] = { mood: 50, lapar: 50, afinitas: 0 }
  }

  const ALL = { ...FOOD, ...SPECIAL }

  /* ===== TAMPILKAN MENU ===== */
  if (!args[0] || !ALL[args[0]]) {
    let txt = '*DAFTAR MAKANAN*\n\n'

    txt += '*Makanan Biasa*\n'
    for (const i in FOOD) {
      const f = FOOD[i]
      txt +=
        `${i}. ${f.name}\n` +
        `   Harga: ${rupiah(f.price)} | Lapar +${f.feed}\n\n`
    }

    txt += '*Makanan Spesial*\n'
    for (const i in SPECIAL) {
      const f = SPECIAL[i]
      txt +=
        `${i}. ${f.name}\n` +
        `   Harga: ${rupiah(f.price)}\n` +
        `   Lapar +${f.feed} | Mood +${f.mood} | Afinitas +${f.afk}\n` +
        `   ${f.desc}\n\n`
    }

    txt += '_Gunakan: .belifood <nomor>_'
    return m.reply(txt)
  }

  /* ===== PROSES BELI ===== */
  const f = ALL[args[0]]

  if (money < f.price)
    return m.reply(
      `Uang tidak cukup\nSaldo kamu: ${rupiah(money)}`
    )

  db.money[m.sender] -= f.price
  db.status[m.sender].lapar = clamp(db.status[m.sender].lapar + (f.feed || 0))
  db.status[m.sender].mood = clamp(db.status[m.sender].mood + (f.mood || 0))
  db.status[m.sender].afinitas += f.afk || 0

  saveDB(db)

  m.reply(
    `*${f.name} telah dikonsumsi*\n` +
    `Lapar +${f.feed || 0}\n` +
    (f.mood ? `Mood +${f.mood}\n` : '') +
    (f.afk ? `Afinitas +${f.afk}\n` : '') +
    `Sisa uang: ${rupiah(db.money[m.sender])}`
  )
}

handler.command = ['belifood']
handler.tags = ['waifu']
handler.help = ['belifood']
handler.register = true

export default handler