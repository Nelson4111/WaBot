import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { hewanList, dapatkanHasil, migrateHasilTernakInventory } from '../../lib/rpg-libternakData.js'
import { masakanResep, normalizeMasakanKey, formatMasakanNama, resepEmoji, deskripsiMakanan } from '../../lib/rpg-masakanData.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan.adventure')
  if(!user.ikan) user.ikan = {}
  if(!user.inventory) user.inventory = {}
  if(!user.dapur) user.dapur = { slot: 1, antrian: [] }

  const inventoryMigration = migrateHasilTernakInventory(user.inventory)
  user.inventory = inventoryMigration.inventory
  if (inventoryMigration.changed) saveDB(wdb)

  const resep = masakanResep

  for (const [animalKey, animal] of Object.entries(hewanList)) {
    const result = dapatkanHasil(animal).ambil
    const recipeKey = `olahan_${animalKey}`
    if (!resep[recipeKey]) {
      resep[recipeKey] = {
        emoji: '🍲',
        jual: Math.max(10000, Math.floor(animal.hargaJual * 0.8)),
        bahan: { [result]: 1 },
        biaya: 0,
        waktu: 180000,
        exp: Math.max(25, Math.floor(animal.exp * 1.5))
      }
    }
  }

  // MIGRASI TANDA
  if(!user.migrasi_dapur_v1){
    user.migrasi_dapur_v1 = true
    saveDB(wdb)
  }

  // HELPER
  const daftarResep = Object.keys(resep)
  const nomorKeResep = {}
  daftarResep.forEach((k, i) => nomorKeResep[i+1] = k)

  function formatNamaItem(nama){
    return formatMasakanNama(nama)
  }
  function getItemCount(nama){
    nama = nama.replace(/ /g, '_')
    return user.inventory[nama] || user.ikan[nama] || 0
  }
  function kurangiItem(nama, jumlah){
    nama = nama.replace(/ /g, '_')
    if(user.ikan[nama]!== undefined) user.ikan[nama] -= jumlah
    else user.inventory[nama] -= jumlah
  }
  function punyaBahan(bahan) {
    for(let item in bahan) {
      if(getItemCount(item) < bahan[item]) return false
    }
    return true
  }
  function ambilBahan(bahan) {
    for(let item in bahan) {
      kurangiItem(item, bahan[item])
    }
  }
  function formatWaktu(ms) {
    let jam = Math.floor(ms / 3600000)
    let menit = Math.floor((ms % 3600000) / 60000)
    let detik = Math.floor((ms % 60000) / 1000)
    if(jam > 0) return `${jam}j ${menit}m`
    if(menit > 0) return `${menit}m ${detik}d`
    return `${detik}d`
  }

  let args = text ? text.split(' ').filter(Boolean) : []
  let action = args[0]?.toLowerCase()
  let masakan = args.slice(1).join(' ').toLowerCase()
  const isDapurCommand = command === 'dapur'

  if (action === 'recipe') action = 'resep'
  if (action === 'buku' && masakan === 'masak') {
    action = 'resep'
    masakan = ''
  }

  // MENU UTAMA DAPUR
 if (!text && isDapurCommand) {
  let cap = `╭─❏「 👨‍🍳 AVELIA KITCHEN 」❏\n`
  cap += `│ 🍳 *DAPUR PRIBADI*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `⏰ *STATUS DAPUR*\n`
  cap += `> ↳ Slot: ${user.dapur.antrian.length}/${user.dapur.slot}\n`
  cap += `> ↳ Ambil maksimal 5 jam setelah matang\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  if(user.dapur.antrian.length === 0) {
    cap += `✨ *DAPUR KOSONG*\n`
    cap += `> ↳ Masak sesuatu yuk!\n`
  } else {
    cap += `🍳 *ANTRIAN MASAKAN*\n`
    cap += `> ↳ Status masakan yang sedang diproses atau siap diambil.\n\n`

    user.dapur.antrian.forEach((item, i) => {
      let sisa = item.selesai - Date.now()
      let status = sisa > 0
        ? `⏳ ${formatWaktu(sisa)} lagi`
        : sisa > -18000000
          ? `✅ Siap diambil!`
          : `🔥 Gosong ${formatWaktu(Math.abs(sisa))} lalu`

      cap += `*${i + 1}. ${formatNamaItem(item.nama)} ${item.emoji}*\n`
      cap += `> ↳ Status: ${status}\n\n`
    })

    cap += `📦 *AMBIL HASIL*\n`
    cap += `> ↳ *${usedPrefix}ambilmasak*\n`
  }

  cap += `\n─━━━━━━━━━━━━━━─\n\n`

  cap += `📌 *MENU DAPUR*\n`
  cap += `> ↳ *${usedPrefix}dapur resep*\n`
  cap += `> ↳ *${usedPrefix}dapur buku masak*\n`
  cap += `> ↳ *${usedPrefix}dapur resep <no/nama>*\n`
  cap += `> ↳ *${usedPrefix}masak <no/nama>*\n`

  cap += `\n─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i175/LdcwE3Z.jpg')
}

if (!text && !isDapurCommand) {
  return m.reply(
    `╭─❏「 👨‍🍳 MASAK 」❏\n` +
    `│ 🍳 *PERINTAH MEMASAK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CARA MENGGUNAKAN*\n` +
    `> ↳ Gunakan nama atau nomor resep untuk memasak.\n\n` +
    `💡 *CONTOH*\n` +
    `> ↳ *${usedPrefix}masak sushi*\n` +
    `> ↳ *${usedPrefix}dapur resep*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (isDapurCommand && action === 'masak') {
  return m.reply(
    `╭─❏「 👨‍🍳 MASAK 」❏\n` +
    `│ 🍳 *PERINTAH MEMASAK*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `❌ Masak memakai command terpisah.\n\n` +
    `📌 *GUNAKAN*\n` +
    `> ↳ *${usedPrefix}masak <no/nama>*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  // LIAT SEMUA RESEP
  if(isDapurCommand && action === 'resep' && !masakan){
  return m.reply(`╭─❏「 📖 AVELIA RECIPE BOOK 」❏\n│ Pilih kategori resep:\n╰─━━━━━━━━━━━━━━─\n\n> *${usedPrefix}dapur resep murah*\n> *${usedPrefix}dapur resep mahal*\n> *${usedPrefix}dapur resep legend*\n> *${usedPrefix}dapur resep all*`)
}

  if(isDapurCommand && action === 'resep' && ['murah', 'mahal', 'legend', 'all'].includes(masakan)){
  let cap = `╭─❏「 📖 AVELIA RECIPE BOOK 」❏\n`
  cap += `│ 📖 *DAFTAR RESEP MASAKAN*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `📌 *PANDUAN*\n`
  cap += `> ↳ Detail: *${usedPrefix}dapur resep <no/nama>*\n`
  cap += `> ↳ Masak: *${usedPrefix}masak <no/nama>*\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  let no = 1

  cap += `🟢 *MAKANAN MURAH*\n`
  cap += `> ↳ Harga jual di bawah Rp 100.000\n\n`

  const kategori = masakan
  const daftar = kategori === 'murah' ? Object.entries(resep).filter(([, v]) => v.jual < 100000) : kategori === 'mahal' ? Object.entries(resep).filter(([, v]) => v.jual >= 100000 && v.jual < 1000000) : kategori === 'legend' ? Object.entries(resep).filter(([, v]) => v.jual >= 1000000) : Object.entries(resep)
  daftar.forEach(([k,v]) => {
    cap += `*${no++}. ${formatNamaItem(k)} ${v.emoji}*\n`
    cap += `> ↳ Sell: Rp ${v.jual.toLocaleString()}\n`
    cap += `> ↳ Masak: ${formatWaktu(v.waktu)}\n`
    cap += `> ↳ XP: +${v.exp}\n\n`
  })

  cap += `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}

  // LIAT DETAIL 1 RESEP
 if(isDapurCommand && action === 'resep' && masakan){
  let key =!isNaN(masakan)? nomorKeResep[parseInt(masakan)] : masakan.replace(/ /g, '_')
  if(!resep[key]) return m.reply(
    `╭─❏「 📖 DETAIL RESEP 」❏\n` +
    `│ ❌ *RESEP TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Resep ${masakan} tidak ada\n` +
    `> ↳ Lihat daftar: *${usedPrefix}dapur resep*\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  let r = resep[key]
  let cap = `╭─❏「 📖 DETAIL RESEP 」❏\n`
  cap += `│ 📖 *${formatNamaItem(key).toUpperCase()} ${r.emoji}*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `📋 *INFORMASI RESEP*\n`
  cap += `> ↳ 💰 Harga Jual: Rp ${r.jual.toLocaleString()}\n`
  cap += `> ↳ 💸 Biaya Masak: Rp ${r.biaya.toLocaleString()}\n`
  cap += `> ↳ ⏰ Waktu Masak: ${formatWaktu(r.waktu)}\n`
  cap += `> ↳ 📈 EXP: +${r.exp}\n\n`

  cap += `─━━━━━━━━━━━━━━─\n\n`

  cap += `📦 *BAHAN-BAHAN*\n`
  Object.entries(r.bahan).forEach(([b,j]) => {
    let punya = getItemCount(b)
    let status = punya >= j? '✅' : '❌'
    cap += `${status} *${formatNamaItem(b)}*\n`
    cap += `> ↳ Butuh: ${j}x | Punya: ${punya}\n`
  })

  cap += `\n╰─━━━━━━━━━━━━━━─`
  return m.reply(cap)
}

// PROSES MASAK
let keyMasak =!isNaN(action)? nomorKeResep[parseInt(action)] : normalizeMasakanKey(action)
if(!resep[keyMasak]) return m.reply(
  `╭─❏「 👨‍🍳 MASAK 」❏\n` +
  `│ ❌ *MASAKAN TIDAK DITEMUKAN*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Masakan ${action} tidak ada\n` +
  `> ↳ Lihat daftar resep: *${usedPrefix}dapur resep*\n\n` +
  `╰─━━━━━━━━━━━━━━─`
)

let r = resep[keyMasak]

if(user.dapur.antrian.length >= user.dapur.slot) return m.reply(
  `╭─❏「 👨‍🍳 MASAK 」❏\n` +
  `│ ⚠️ *DAPUR PENUH*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Slot: ${user.dapur.antrian.length}/${user.dapur.slot}\n` +
  `> ↳ Upgrade dapur dulu dengan *${usedPrefix}upgradedapur*\n\n` +
  `╰─━━━━━━━━━━━━━━─`
)

if(!punyaBahan(r.bahan)) {
  let kurang = []
  for(let item in r.bahan) {
    let punya = getItemCount(item)
    if(punya < r.bahan[item]) kurang.push(`${r.bahan[item] - punya}x ${formatNamaItem(item)}`)
  }

  return m.reply(
    `╭─❏「 👨‍🍳 MASAK 」❏\n` +
    `│ ❌ *BAHAN KURANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📦 *BAHAN DIBUTUHKAN*\n` +
    `> ↳ ${Object.entries(r.bahan).map(([b,j]) => `${j}x ${formatNamaItem(b)}`).join(', ')}\n\n` +
    `❌ *BAHAN YANG KURANG*\n` +
    `> ↳ ${kurang.join(', ')}\n\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

let userMoney = wdb.money[m.sender] || 0
if(userMoney < r.biaya) return m.reply(
  `╭─❏「 👨‍🍳 MASAK 」❏\n` +
  `│ 💸 *UANG TIDAK CUKUP*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Butuh biaya tambahan Rp ${r.biaya.toLocaleString()}\n\n` +
  `╰─━━━━━━━━━━━━━━─`
)

ambilBahan(r.bahan)
wdb.money[m.sender] -= r.biaya
user.dapur.antrian.push({
  nama: keyMasak,
  emoji: r.emoji,
  selesai: Date.now() + r.waktu,
  exp: r.exp,
  harga: r.jual
})
saveDB(wdb)

return m.reply(
  `╭─❏「 👨‍🍳 MASAK BERHASIL 」❏\n` +
  `│ 🍳 *${formatNamaItem(keyMasak).toUpperCase()} ${r.emoji}*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `📋 *STATUS MASAKAN*\n` +
  `> ↳ ⏰ Selesai: ${formatWaktu(r.waktu)}\n` +
  `> ↳ 📦 Slot: ${user.dapur.antrian.length}/${user.dapur.slot}\n` +
  `> ↳ ⚠️ Ambil dalam 5 jam\n\n` +
  `╰─━━━━━━━━━━━━━━─`
)
}

handler.help = ['dapur', 'dapur resep', 'dapur recipe', 'dapur buku masak', 'masak <nama/no>']
handler.tags = ['rpg']
handler.command = /^(masak|dapur)$/i
handler.alias = ['dapur', 'masak']
handler.group = true
export default handler