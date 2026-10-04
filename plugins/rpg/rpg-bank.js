import { loadDB, saveDB, sendRpgMsg, getUserRPG } from '../../lib/waifuHelper.js'
import { hargaBeli as MENU_RESTAURAN, formatMasakanNama } from '../../lib/rpg-masakanData.js'
import { scaleDifficultyCooldown, scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'

export const BANK_TIERS = {
  0: { name: 'Basic Card', limit: 10_000_000, bunga: 0.002, price: 0, biayaBulanan: 0, color: '🔰', keamanan: 1, asuransi: 0, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa'] },
  1: { name: 'Classic Card', limit: 15_000_000, bunga: 0.0025, price: 2_500_000, biayaBulanan: 125_000, color: '🏷️', keamanan: 2, asuransi: 0.01, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Asuransi 1%'] },
  2: { name: 'White Card', limit: 20_000_000, bunga: 0.0028, price: 3_500_000, biayaBulanan: 175_000, color: '⬜', keamanan: 3, asuransi: 0.03, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Asuransi 3%'] },
  3: { name: 'Brown Card', limit: 25_000_000, bunga: 0.003, price: 5_000_000, biayaBulanan: 250_000, color: '🟫', keamanan: 4, asuransi: 0.05, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Asuransi 5%'] },
  4: { name: 'Red Card', limit: 50_000_000, bunga: 0.004, price: 12_500_000, biayaBulanan: 625_000, color: '🟥', keamanan: 5, asuransi: 0.1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Riwayat Transaksi', 'Asuransi 10%'] },
  5: { name: 'Orange Card', limit: 100_000_000, bunga: 0.005, price: 25_000_000, biayaBulanan: 1_250_000, color: '🟧', keamanan: 6, asuransi: 0.15, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Riwayat Transaksi', 'Asuransi 15%'] },
  6: { name: 'Yellow Card', limit: 250_000_000, bunga: 0.006, price: 50_000_000, biayaBulanan: 2_500_000, color: '🟨', keamanan: 7, asuransi: 0.2, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 20%'] },
  7: { name: 'Green Card', limit: 500_000_000, bunga: 0.007, price: 125_000_000, biayaBulanan: 6_250_000, color: '🟩', keamanan: 8, asuransi: 0.3, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 30%', 'Transfer Bank', 'Fast Track', 'Digital Access'] },
  8: { name: 'Blue Card', limit: 1_000_000_000, bunga: 0.008, price: 250_000_000, biayaBulanan: 12_500_000, color: '🟦', keamanan: 9, asuransi: 0.4, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv1', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 40%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi'] },
  9: { name: 'Purple Card', limit: 5_000_000_000, bunga: 0.009, price: 500_000_000, biayaBulanan: 25_000_000, color: '🟪', keamanan: 10, asuransi: 0.5, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv2', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 50%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP'] },
  10: { name: 'Black Card', limit: 10_000_000_000, bunga: 0.01, price: 2_500_000_000, biayaBulanan: 125_000_000, color: '⬛', keamanan: 11, asuransi: 0.6, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv3', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 60%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi'] },
  11: { name: 'Pink Card', limit: 25_000_000_000, bunga: 0.012, price: 5_000_000_000, biayaBulanan: 250_000_000, color: '🩷', keamanan: 12, asuransi: 0.7, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv4', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 70%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi'] },
  12: { name: 'Cyan Card', limit: 50_000_000_000, bunga: 0.014, price: 12_500_000_000, biayaBulanan: 625_000_000, color: '🩵', keamanan: 13, asuransi: 0.8, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv5', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 80%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif'] },
  13: { name: 'Royal Card', limit: 100_000_000_000, bunga: 0.016, price: 25_000_000_000, biayaBulanan: 1_250_000_000, color: '👑', keamanan: 14, asuransi: 0.85, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Polisi', 'Chat CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 85%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan'] },
  14: { name: 'Star Card', limit: 250_000_000_000, bunga: 0.018, price: 50_000_000_000, biayaBulanan: 2_500_000_000, color: '⭐', keamanan: 15, asuransi: 0.9, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Tentara', 'Chat CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 90%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Kendaraan Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank'] },
  15: { name: 'Crystal Card', limit: 500_000_000_000, bunga: 0.02, price: 125_000_000_000, biayaBulanan: 6_250_000_000, color: '💠', keamanan: 16, asuransi: 0.95, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Pasukan Khusus', 'Chat CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 95%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal'] },
  16: { name: 'Spiral Card', limit: 1_000_000_000_000, bunga: 0.02, price: 250_000_000_000, biayaBulanan: 12_500_000_000, color: '🌀', keamanan: 17, asuransi: 0.96, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 96%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Kendaraan Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik'] },
  17: { name: 'Cosmic Card', limit: 2_500_000_000_000, bunga: 0.022, price: 500_000_000_000, biayaBulanan: 25_000_000_000, color: '🌐', keamanan: 18, asuransi: 0.97, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 97%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik'] },
  18: { name: 'Stellar Card', limit: 5_000_000_000_000, bunga: 0.024, price: 1_000_000_000_000, biayaBulanan: 50_000_000_000, color: '💫', keamanan: 19, asuransi: 0.98, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 98%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik'] },
  19: { name: 'Eternal Card', limit: null, bunga: 0.026, price: 2_500_000_000_000, biayaBulanan: 125_000_000_000, color: '♾️', keamanan: 20, asuransi: 1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 100%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Kendaraan Pribadi', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik'] }
}

export const BANK_FNB_REWARDS = {
  6: { nasi_uduk: 1, es_teh_jumbo: 1 },
  7: { ayam_goreng: 1, boba_milktea: 1, es_jeruk: 1 },
  8: { rendang: 1, matcha_latte: 1, onigiri: 1 },
  9: { sate_kambing: 1, takoyaki: 1, melon_soda_float: 1, dorayaki: 1 },
  10: { lobster_bakar: 1, sushi: 1, steak_emas: 1, stellar_jade_smoothie: 1 },
  11: { diamond_cake: 1, steak_makima: 1, trailblaze_burger: 1, pom_pom_parfait: 1 },
  12: { sup_leviathan: 1, naga_laut_bakar: 1, ramen_ichiraku: 1, stellar_champagne: 1 },
  13: { steak_godzilla: 1, raja_ubur_jelly: 1, sea_dragon_grill: 1, drink_another_world: 1 },
  14: { paus_putih_steak: 1, kura_titan_soup: 1, hydra_stew: 1, soma: 1 },
  15: { healing_tears: 1, stewed_matsutake: 1, mondstadt_hash_brown: 1, sashimi: 1 },
  16: { taco_ikan: 1, udang_goreng: 1, cumi_goreng: 1, heavenly_brew: 1 },
  17: { sup_ikan: 1, salad_buah: 1, penyu_panggang: 1, frozen_memories: 1 },
  18: { sup_susu_sapi: 1, sate_ikan: 1, pari_bakar: 1, silent_escapism: 1 },
  19: { sop_kraken: 1, sate_megalodon: 1, sweet_madame: 1, tacetite_cake: 1 }
}

export const BANK_CS_SERVICES = {
  'Chat CS': 'Informasi dasar mengenai rekening dan fasilitas bank.',
  'Chat CS 24jam': 'Informasi dan bantuan layanan dasar kapan saja.',
  'Chat CS AI': 'Analisis serta informasi terbatas mengenai fasilitas bank lainnya.',
  'Premium CS AI': 'Analisis lebih luas, akses informasi fasilitas lain, layanan prioritas, dan kontrol terbatas atas layanan tertentu.'
}

export const BANK_COMING_SOON_FACILITIES = new Set([
  'Lounge VIP',
  'Vault Pribadi',
  'Akses Eksklusif',
  'Mahkota Kehormatan',
  'Benteng Kristal',
  'Brankas Kosmik'
])

export function getBankTransactionCooldown(tier) {
  if (tier.fasilitas.includes('Portal Bank')) return 0
  if (tier.fasilitas.includes('Kendaraan Pribadi')) return 5 * 60 * 1000
  return 15 * 60 * 1000
}

export function canUseBankMoneyCommand(tier) {
  return tier.fasilitas.includes('Digital Access')
}

export function getBankTransactionCooldownRemaining(userRPG, tier, now = Date.now()) {
  const cooldown = scaleDifficultyCooldown(userRPG, getBankTransactionCooldown(tier))
  return cooldown ? Math.max(0, cooldown - (now - Number(userRPG.lastBankTransaction || 0))) : 0
}

export function formatBankFacility(facility) {
  return `${facility}${BANK_COMING_SOON_FACILITIES.has(facility) ? ' (Coming Soon)' : ''}`
}

export function getBankCsService(tier) {
  return [...tier.fasilitas]
    .reverse()
    .find(facility => Object.hasOwn(BANK_CS_SERVICES, facility)) || null
}

export function parseBankAssistantReminder(date, time, title, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !title?.trim()) return null
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const timestamp = new Date(year, month - 1, day, hour, minute).getTime()
  const reminderDate = new Date(timestamp)
  if (reminderDate.getFullYear() !== year || reminderDate.getMonth() !== month - 1 || reminderDate.getDate() !== day || hour > 23 || minute > 59 || timestamp <= now) return null
  return { waktu: timestamp, judul: title.trim() }
}

export function getBankFnbReward(tierLevel) {
  return BANK_FNB_REWARDS[tierLevel] || null
}

export function resolveBankFnbTier(ownedTierLevel, selection = '') {
  const ownedTier = Number(ownedTierLevel)
  if (!Number.isInteger(ownedTier) || !BANK_TIERS[ownedTier]) return null

  const requestedCard = String(selection).trim()
  if (!requestedCard) return ownedTier

  let selectedTier
  if (/^\d+$/.test(requestedCard)) {
    selectedTier = Number(requestedCard)
  } else {
    const normalizedName = requestedCard.toLowerCase().replace(/\s+/g, ' ')
    selectedTier = Number(Object.entries(BANK_TIERS).find(([, card]) => {
      const cardName = card.name.toLowerCase()
      return cardName === normalizedName || cardName.replace(/\s+card$/, '') === normalizedName
    })?.[0])
  }

  if (!Number.isInteger(selectedTier) || !BANK_TIERS[selectedTier] || selectedTier > ownedTier) return null
  return selectedTier
}

export function getBankRobberySuccessChance(tier) {
  return Math.max(0.05, 0.8 - (getBankEffectiveSecurity(tier) * 0.035))
}

export function getBankEffectiveSecurity(tier) {
  const crystalFortressBonus = tier.fasilitas.includes('Benteng Kristal') ? 5 : 0
  return tier.keamanan + crystalFortressBonus
}

export function calculateBankRobberyLoss(bankBalance, percentage, tier) {
  return Math.floor(Math.max(10_000, bankBalance * percentage) * (1 - tier.asuransi))
}

export function canUseBankBulkDeposit(tier) {
  return tier.fasilitas.includes('Fast Track')
}

export function formatBankLimit(limit) {
  return Number.isFinite(limit) ? `Rp ${limit.toLocaleString()}` : 'Tidak Terbatas'
}

export function exceedsBankLimit(bankBalance, amount, tier) {
  return Number.isFinite(tier.limit) && bankBalance + amount > tier.limit
}

export function getBankGuardName(tier) {
  return tier.fasilitas.find(facility => facility.startsWith('Penjaga'))
    || tier.fasilitas.find(facility => facility === 'Pasukan Khusus')
    || 'Penjaga Bank'
}

export function chargeBankMembership(userRPG, monthlyFee, now, description = 'Biaya Membership') {
  if (monthlyFee <= 0) return 'free'
  if (now - Number(userRPG.lastMembership || 0) < 2592000000) return 'not-due'
  if (userRPG.bank < monthlyFee) {
    userRPG.kartuBeku = true
    return 'insufficient'
  }

  userRPG.bank -= monthlyFee
  userRPG.lastMembership = now
  userRPG.kartuBeku = false
  userRPG.riwayat.unshift(`-Rp ${monthlyFee.toLocaleString()} ${description}`)
  return 'paid'
}

export function isPremiumUser(jid, db = global.db) {
  if (!jid) return false
  const user = db?.users?.[jid] || db?.data?.users?.[jid] || global.db?.data?.users?.[jid]
  if (!user) return false
  return user.premium === true || Number(user.premiumTime || 0) > Date.now()
}

export function getBankDiscountRate(jid, db = global.db) {
  return isPremiumUser(jid, db) ? 0.25 : 0
}

export function getBankPrice(basePrice, jid, db = global.db) {
  return Math.floor(basePrice * (1 - getBankDiscountRate(jid, db)))
}

export function getBankMonthlyFee(baseFee, jid, db = global.db) {
  return Math.floor(baseFee * (1 - getBankDiscountRate(jid, db)))
}

function getPlayerCasinoRoom(wdb, jid) {
  if (!wdb?.casinoRooms || !jid) return null
  for (const room of Object.values(wdb.casinoRooms)) {
    if (Array.isArray(room?.players) && room.players.includes(jid)) return room
  }
  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let userRPG = getUserRPG(wdb, m.sender).rpg
  if (!userRPG) return m.reply('❌ Kamu belum memiliki data RPG.')

  // Init
  if (userRPG.bank === undefined) userRPG.bank = 0
  if (userRPG.bankTier === undefined) userRPG.bankTier = 0
  if (userRPG.lastBunga === undefined) userRPG.lastBunga = 0
  if (userRPG.totalBunga === undefined) userRPG.totalBunga = 0
  if (userRPG.riwayat === undefined) userRPG.riwayat = []
  if (userRPG.pinjaman === undefined) userRPG.pinjaman = { jumlah: 0, waktu: 0 }
  if (userRPG.lastMembership === undefined) userRPG.lastMembership = Date.now()
  if (userRPG.kartuBeku === undefined) userRPG.kartuBeku = false

  const isPremium = isPremiumUser(m.sender, wdb)
  const tierBase = BANK_TIERS[userRPG.bankTier] || BANK_TIERS[0]
  const tier = {
    ...tierBase,
    price: getBankPrice(tierBase.price, m.sender, wdb),
    biayaBulanan: getBankMonthlyFee(tierBase.biayaBulanan, m.sender, wdb)
  }
  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  const membershipActions = ['bulanan', 'monthly', 'tagihan']
  let amount = parseInt(args[1])
  let now = Date.now()
  let satuHari = 86400000
  const periodeMembership = 2592000000
  const automaticCharges = []

  // DENDA PINJAMAN TELAT 7 HARI
  if(userRPG.pinjaman.jumlah > 0 && now - userRPG.pinjaman.waktu > 604800000){
    let denda = Math.floor(userRPG.pinjaman.jumlah * 0.05)
    if(userRPG.bank >= denda){
      userRPG.bank -= denda
      userRPG.riwayat.unshift(`-Rp ${denda.toLocaleString()} Denda Pinjaman`)
      automaticCharges.push(`Denda pinjaman: -Rp ${denda.toLocaleString()}`)
      await saveDB(wdb)
    }
  }

  // CEK PEMBAYARAN MEMBERSHIP OTOMATIS
  if (!membershipActions.includes(action) && now - userRPG.lastMembership >= periodeMembership && tier.biayaBulanan > 0 && (!userRPG.kartuBeku || userRPG.bank >= tier.biayaBulanan)) {
    const paymentStatus = chargeBankMembership(userRPG, tier.biayaBulanan, now)
    if (paymentStatus === 'paid') automaticCharges.push(`Biaya membership bulanan dibayar otomatis: -Rp ${tier.biayaBulanan.toLocaleString()}`)
    if (paymentStatus === 'insufficient') automaticCharges.push(`Saldo tidak cukup untuk biaya membership Rp ${tier.biayaBulanan.toLocaleString()}; kartu dibekukan. Tidak ada denda tambahan.`)
    await saveDB(wdb)
  }

  if (automaticCharges.length) {
    await m.reply(`⚠️ *POTONGAN OTOMATIS BANK*\n${automaticCharges.map(charge => `> ${charge}`).join('\n')}\n> Saldo bank sekarang: Rp ${userRPG.bank.toLocaleString()}`)
  }

  // BUNGA MINGGUAN
  let cdBunga = scaleDifficultyCooldown(userRPG, 604800000)
  if(now - userRPG.lastBunga >= cdBunga && userRPG.bank > 0 &&!userRPG.kartuBeku){
    let bunga = scaleDifficultyIncome(userRPG, Math.floor(userRPG.bank * tier.bunga))
    userRPG.bank += bunga; userRPG.totalBunga += bunga; userRPG.lastBunga = now
    userRPG.riwayat.unshift(`+Rp ${bunga.toLocaleString()} Bunga Mingguan`)
    if(userRPG.riwayat.length > 20) userRPG.riwayat.pop()
    await saveDB(wdb)
    conn.reply(m.chat, `💸 *BUNGA MINGGUAN MASUK!*\n+Rp ${bunga.toLocaleString()}\n${tier.color} *${tier.name}* ${(tier.bunga*100).toFixed(2)}%/minggu`, m)
  }

  // === MENU MONEY / UANG ===
  if(command === 'money' || command === 'uang'){
    if (!canUseBankMoneyCommand(tier)) return m.reply(`❌ Perintah *.${command}* membutuhkan fasilitas Digital Access. Upgrade kartu untuk mengakses saldo digital.`)
    let cap = `─━━ 🏦 RPG BANK CENTER ━━─\n\n`
    cap += `◈ INFORMASI SALDO ◈\n`
    cap += `◆ Uang Saku : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `◆ Saldo Bank : Rp ${userRPG.bank.toLocaleString()}\n`
    cap += `◆ Total Aset : Rp ${((wdb.money[m.sender] || 0) + userRPG.bank).toLocaleString()}\n\n`
    cap += `◈ KARTU BANK ◈\n`
    cap += `${tier.color} *${tier.name}* ${userRPG.kartuBeku? '❌ BEKU': '✅ AKTIF'}\n`
    cap += `─━━━━━━━━━─`
    return m.reply(cap)
  }

  // MENU UTAMA BANK
  if (!action) {
  let sisaHari = Math.max(0, Math.ceil((cdBunga - (now - userRPG.lastBunga)) / satuHari))
  let sisaMembership = Math.max(0, Math.ceil((periodeMembership - (now - userRPG.lastMembership)) / satuHari))
  let sisaTransaksi = getBankTransactionCooldownRemaining(userRPG, tier, now)

  let cap = `─━━ 🏦 RPG BANK CENTER ━━─\n\n`

  if (tier.fasilitas.includes('Lounge VIP')) {
    cap += `✧ ${formatBankFacility('Lounge VIP')} ✧\n`
    cap += `Fasilitas lounge segera hadir.\n\n`
  }

  cap += `◈ ${tier.color} ${tier.name.toUpperCase()} ${userRPG.kartuBeku ? '❌ BEKU' : ''} ◈\n`
  cap += `◆ Status : ${isPremium ? '👑 PREMIUM - Diskon 25% dari harga normal' : '👤 USER BIASA'}\n`
  cap += `◆ Saldo Bank : Rp ${userRPG.bank.toLocaleString()}\n`
  cap += `◆ Uang Saku : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
  cap += `◆ Limit Kartu : ${formatBankLimit(tier.limit)}\n\n`

  cap += `◈ INFO KARTU ◈\n`
  cap += ` ◦ Bunga : ${(tier.bunga * 100).toFixed(2)}% / minggu\n`
  cap += ` ◦ Asuransi : ${(tier.asuransi * 100).toFixed(0)}%\n`
  cap += ` ◦ Keamanan : Lv.${tier.keamanan} (${tier.fasilitas.find(f => f.includes('Penjaga')) || 'Standar'})\n`
  cap += ` ◦ Membership : ${sisaMembership > 0 ? `${sisaMembership} hari lagi` : 'Jatuh tempo'} ${sisaMembership <= 0 ? '❌' : '✅'}\n`
  cap += ` ◦ Bunga : ${sisaHari} hari lagi\n`
  cap += ` ◦ Cooldown setor/tarik : ${sisaTransaksi > 0 ? `${Math.ceil(sisaTransaksi / 60000)} menit` : 'Siap'}\n`

  const csService = getBankCsService(tier)
  if (csService) {
    cap += ` ◦ ${csService} : ${BANK_CS_SERVICES[csService]}\n`
  }

  if (tier.fasilitas.length > 0) {
    cap += `\n◈ FASILITAS EKSKLUSIF ◈\n`

    if (tier.fasilitas.includes('Digital Access')) {
      cap += ` ✦ Digital Access\n`
    }

    if (tier.fasilitas.includes('Lounge VIP')) {
      cap += ` ✦ ${formatBankFacility('Lounge VIP')}\n`
    }

    if (tier.fasilitas.includes('Mahkota Kehormatan')) {
      cap += ` ✦ ${formatBankFacility('Mahkota Kehormatan')}\n`
    }

    if (tier.fasilitas.includes('Gratis Makanan & Minuman')) {
      cap += ` ✦ Gratis Makanan & Minuman\n`
    }

    cap += `\n`
  }

  cap += `─━━━━━━━━━─\n`
  cap += `◈ TOTAL BUNGA : Rp ${userRPG.totalBunga.toLocaleString()} ◈\n`

  if (userRPG.kartuBeku) {
    cap += `\n─━━━━━━━━━─\n`
    cap += `🚨 AKSI DIBUTUHKAN\n`
    cap += ` Bayar Rp ${tier.biayaBulanan.toLocaleString()} dengan *.bank bulanan*, *.bank monthly*, atau *.bank tagihan*.\n`
    cap += `\n❌ FITUR NONAKTIF\n`
    cap += ` Bunga • Transfer • Pinjaman • Heal Bank\n`
  }

  cap += `\n─━━━━━━━━━─\n`
  cap += `📌 *CARA PAKAI*\n`
  cap += `> *${usedPrefix}bank simpan <jumlah>*\n`
  cap += `> *${usedPrefix}bank tarik <jumlah>*\n`
  cap += `> *${usedPrefix}bank command*`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i162/PqqrMC.jpg')
}

if (action === 'command' || action === 'commands' || action === 'cmd') {
  return m.reply(`─━━ 📋 DAFTAR COMMAND BANK ━━─

◈ 💳 INFORMASI KARTU ◈
> *.bank* - Lihat saldo dan informasi kartu
> *.bank command* - Tampilkan daftar command ini
> *.bank kartu / card* - Lihat daftar kartu
> *.bank benefit / benefits [list]* - Lihat fasilitas kartu

─━━━━━━━━━─
◈ 💰 TRANSAKSI BANK ◈
> *.bank simpan <angka>* - Setor sejumlah uang
> *.bank all* atau *.bank simpan all* - Setor semua uang saku (wajib Fast Track)
> *.bank tarik <angka|all>* - Tarik uang ke uang saku
> *.bank tf <angka|all>* - Transfer ke pemain (wajib fitur Transfer Bank)
> *.bank pinjam <angka>* - Ajukan pinjaman
> *.bank bayar* - Lunasi pinjaman
> *.bank bulanan / monthly / tagihan* - Bayar tagihan bulanan saat jatuh tempo

─━━━━━━━━━─
◈ 💬 CUSTOMER SERVICE ◈
> *.bank cs bantuan / saldo* - Minta informasi sesuai fasilitas CS kartu
> *.bank cs simpan/tarik <jumlah>* - Bantuan transaksi mulai Chat CS 24jam
> *.bank cs analisis / fasilitas* - Fitur Chat CS AI sesuai tingkat akses
> *.bank cs kontrol auto on/off* - Kontrol terbatas khusus Premium CS AI

─━━━━━━━━━─
◈ 🍽️ FASILITAS ◈
> *.bank fnb [angka/nama kartu]* - Klaim F&B kartu sendiri atau tier di bawahnya (cooldown 12 jam bersama)
> *.bank asisten* - Ringkasan dan pengaturan Personal Banking Manager
> *.bank asisten target <jumlah|off>* - Atur target tabungan
> *.bank asisten auto on [ambang]* atau *.bank asisten auto off* - Atur auto-setor
> *.bank asisten pengingat* - Kelola pengingat

─━━━━━━━━━─
◈ 📊 LAINNYA ◈
> *.bank riwayat* - Lihat riwayat transaksi`)
}

  if (action === 'fnb' && args[1]?.toLowerCase() === 'list') {
    let cap = `🍽️ *DAFTAR F&B BANK*\n> Klaim tersedia setiap 12 jam untuk kartu yang memiliki fasilitas Gratis Makanan & Minuman.\n\n`
    for (const [level, card] of Object.entries(BANK_TIERS)) {
      cap += `${card.color} *Lv.${level} ${card.name}*\n`
      const reward = getBankFnbReward(Number(level))
      if (!card.fasilitas.includes('Gratis Makanan & Minuman') || !reward) {
        cap += '> Belum memiliki akses F&B gratis.\n\n'
        continue
      }
      cap += `> ${Object.entries(reward).map(([item, quantity]) => `${MENU_RESTAURAN[item]?.emoji || '🍽️'} ${formatMasakanNama(item)} ×${quantity}`).join('\n> ')}\n\n`
    }
    return m.reply(cap.trimEnd())
  }

  if (action === 'fnb') {
    if (userRPG.kartuBeku) return m.reply('❌ Kartu bank sedang beku. Aktifkan kartu sebelum mengambil fasilitas F&B.')

    const selectedTierLevel = resolveBankFnbTier(userRPG.bankTier, args.slice(1).join(' '))
    if (selectedTierLevel === null) return m.reply(`❌ Kartu tidak valid atau tier tersebut belum kamu miliki. Gunakan *.bank fnb <angka/nama kartu>* atau *.bank fnb list*.`)
    const selectedTier = BANK_TIERS[selectedTierLevel]
    if (!selectedTier.fasilitas.includes('Gratis Makanan & Minuman')) return m.reply(`❌ ${selectedTier.name} belum memiliki fasilitas Gratis Makanan & Minuman.`)

    const reward = getBankFnbReward(selectedTierLevel)
    if (!reward) return m.reply(`❌ Paket F&B ${selectedTier.name} belum tersedia.`)
    const cooldownFnb = scaleDifficultyCooldown(userRPG, 12 * 60 * 60 * 1000)
    const sisaCooldown = cooldownFnb - (now - Number(userRPG.lastBankFnb || 0))
    if (sisaCooldown > 0) {
      const jam = Math.floor(sisaCooldown / 3600000)
      const menit = Math.ceil((sisaCooldown % 3600000) / 60000)
      return m.reply(`⏳ Fasilitas F&B bisa diklaim lagi dalam ${jam} jam ${menit} menit.`)
    }

    userRPG.masakan = userRPG.masakan || {}
    const klaimItems = Object.entries(reward)
      .map(([item, quantity]) => [item, scaleDifficultyIncome(userRPG, quantity)])
      .filter(([item, quantity]) => MENU_RESTAURAN[item] && quantity > 0)
    if (!klaimItems.length) return m.reply('❌ Isi paket F&B kartu ini belum tersedia di menu restoran.')
    for (const [item, quantity] of klaimItems) {
      userRPG.masakan[item] = (Number(userRPG.masakan[item]) || 0) + quantity
    }
    userRPG.lastBankFnb = now
    await saveDB(wdb)

    const daftarKlaim = klaimItems.map(([item, quantity]) => `${MENU_RESTAURAN[item].emoji} ${formatMasakanNama(item)} ×${quantity}`).join('\n')
    return m.reply(`✅ *FASILITAS F&B BERHASIL DIKLAIM*\n${selectedTier.color} ${selectedTier.name} (Lv.${selectedTierLevel})\n\n${daftarKlaim}\n\nSemua item sudah masuk ke kulkas. Klaim lagi dalam 12 jam untuk semua tier.`)
  }

  if (action === 'cs') {
    const service = getBankCsService(tier)
    if (!service) return m.reply(`❌ ${tier.name} belum memiliki fasilitas Chat CS.`)
    const topic = args[1]?.toLowerCase() || 'bantuan'
    const wallet = Number(wdb.money[m.sender]) || 0

    if (topic === 'bantuan') {
      const options = ['saldo', 'bantuan']
      if (service !== 'Chat CS') options.push('simpan <jumlah>', 'tarik <jumlah>')
      if (['Chat CS AI', 'Premium CS AI'].includes(service)) options.push('analisis', 'fasilitas <level>')
      if (service === 'Premium CS AI') options.push('kontrol auto on/off')
      return m.reply(`💬 *${service}*\n${BANK_CS_SERVICES[service]}\n\nLayanan tersedia: ${options.map(option => `*.bank cs ${option}*`).join(', ')}.`)
    }

    if (topic === 'saldo') {
      return m.reply(`💬 *BANTUAN SALDO BANK*\nKartu: ${tier.color} ${tier.name} (${userRPG.kartuBeku ? 'Beku' : 'Aktif'})\nSaldo bank: Rp ${userRPG.bank.toLocaleString()}\nUang saku: Rp ${wallet.toLocaleString()}\nTotal aset: Rp ${(userRPG.bank + wallet).toLocaleString()}\nLimit: ${formatBankLimit(tier.limit)}\nGunakan *.bank simpan <jumlah>* atau *.bank tarik <jumlah>* untuk mengatur saldo.`)
    }

    if (topic === 'simpan' || topic === 'tarik') {
      if (service === 'Chat CS') return m.reply('❌ Chat CS menyediakan informasi dasar saja. Bantuan setor/tarik tersedia mulai Chat CS 24jam.')
      const amount = Number(args[2])
      if (!Number.isSafeInteger(amount) || amount <= 0) return m.reply(`Gunakan *.bank cs ${topic} <jumlah>* dengan jumlah rupiah positif.`)
      const cooldownRemaining = getBankTransactionCooldownRemaining(userRPG, tier, now)
      if (cooldownRemaining > 0) return m.reply(`⏳ Transaksi setor/tarik masih cooldown. Coba lagi dalam ${Math.ceil(cooldownRemaining / 60000)} menit.`)
      if (topic === 'simpan') {
        if (wallet < amount) return m.reply('❌ Uang saku tidak cukup untuk setor melalui CS.')
        if (exceedsBankLimit(userRPG.bank, amount, tier)) return m.reply(`❌ Setoran melebihi limit kartu. Sisa limit: Rp ${(tier.limit - userRPG.bank).toLocaleString()}.`)
        wdb.money[m.sender] = wallet - amount
        userRPG.bank += amount
        userRPG.riwayat.unshift(`-Rp ${amount.toLocaleString()} Setor melalui CS`)
      } else {
        if (userRPG.bank < amount) return m.reply('❌ Saldo bank tidak cukup untuk penarikan melalui CS.')
        userRPG.bank -= amount
        wdb.money[m.sender] = wallet + amount
        userRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} Tarik melalui CS`)
      }
      userRPG.lastBankTransaction = now
      userRPG.riwayat.length = Math.min(userRPG.riwayat.length, 20)
      await saveDB(wdb)
      return m.reply(`✅ Bantuan ${topic === 'simpan' ? 'setor' : 'tarik'} melalui ${service} berhasil.\nSaldo bank: Rp ${userRPG.bank.toLocaleString()}\nUang saku: Rp ${(Number(wdb.money[m.sender]) || 0).toLocaleString()}`)
    }

    if (topic === 'analisis') {
      if (!['Chat CS AI', 'Premium CS AI'].includes(service)) return m.reply('❌ Analisis hanya tersedia melalui Chat CS AI atau Premium CS AI.')
      const totalAssets = userRPG.bank + wallet
      const bankShare = totalAssets ? Math.floor(userRPG.bank / totalAssets * 100) : 0
      const target = Number(userRPG.asistenBank?.target) || 0
      const analysis = [
        `Total aset tercatat Rp ${totalAssets.toLocaleString()}; ${bankShare}% berada di bank.`,
        userRPG.pinjaman?.jumlah > 0 ? `Pinjaman aktif Rp ${userRPG.pinjaman.jumlah.toLocaleString()}.` : 'Tidak ada pinjaman aktif.',
        target ? `Progres target tabungan: ${Math.min(100, Math.floor(userRPG.bank / target * 100))}% (Rp ${userRPG.bank.toLocaleString()} dari Rp ${target.toLocaleString()}).` : 'Belum ada target tabungan Personal Banking Manager.'
      ]
      return m.reply(`💬 *ANALISIS ${service === 'Premium CS AI' ? 'PRIORITAS' : 'CS AI'}*\n${analysis.map(item => `• ${item}`).join('\n')}`)
    }

    if (topic === 'fasilitas') {
      if (!['Chat CS AI', 'Premium CS AI'].includes(service)) return m.reply('❌ Informasi fasilitas kartu lain hanya tersedia melalui Chat CS AI atau Premium CS AI.')
      const query = args[2]?.toLowerCase()
      const availableLevels = Object.keys(BANK_TIERS).map(Number).filter(level =>
        service === 'Premium CS AI' || level === Number(userRPG.bankTier) || level === Number(userRPG.bankTier) + 1
      )
      const cardEntry = query
        ? Object.entries(BANK_TIERS).find(([level, card]) => availableLevels.includes(Number(level)) && (/^\d+$/.test(query) ? Number(level) === Number(query) : card.name.toLowerCase() === query))
        : null
      if (query && !cardEntry) return m.reply(service === 'Premium CS AI'
        ? 'Kartu tidak ditemukan. Gunakan *.bank card* untuk melihat nama dan level kartu.'
        : 'Chat CS AI hanya dapat melihat fasilitas kartu saat ini dan satu tingkat berikutnya.')
      if (!cardEntry) return m.reply(`💬 *INFORMASI FASILITAS KARTU*\nTingkat akses ${service === 'Premium CS AI' ? 'Premium: semua kartu' : 'CS AI: kartu saat ini dan satu tingkat berikutnya'}\nGunakan *.bank cs fasilitas <level/nama>*.`)
      const [level, card] = cardEntry
      return m.reply(`💳 *${card.color} ${card.name} (Lv.${level})*\nLimit: ${formatBankLimit(card.limit)}\nBunga: ${(card.bunga * 100).toFixed(2)}%/minggu\nFasilitas:\n${card.fasilitas.map(facility => `• ${formatBankFacility(facility)}`).join('\n')}`)
    }

    if (topic === 'kontrol' && args[2]?.toLowerCase() === 'auto') {
      if (service !== 'Premium CS AI') return m.reply('❌ Kontrol layanan melalui CS hanya tersedia untuk Premium CS AI.')
      const state = args[3]?.toLowerCase()
      if (!['on', 'off'].includes(state)) return m.reply('Gunakan *.bank cs kontrol auto on [ambang]* atau *.bank cs kontrol auto off*.')
      const assistant = userRPG.asistenBank ||= { target: 0, autoSetor: { aktif: false, ambang: 1_000_000 }, pengingat: [] }
      assistant.autoSetor ||= { aktif: false, ambang: 1_000_000 }
      if (state === 'off') assistant.autoSetor.aktif = false
      else {
        const threshold = args[4] === undefined ? Number(assistant.autoSetor.ambang) || 1_000_000 : Number(args[4])
        if (!Number.isSafeInteger(threshold) || threshold <= 0) return m.reply('❌ Ambang harus berupa angka rupiah positif.')
        assistant.autoSetor = { aktif: true, ambang: threshold }
      }
      await saveDB(wdb)
      return m.reply(`✅ CS Premium ${state === 'on' ? `mengaktifkan auto-setor mulai Rp ${Number(assistant.autoSetor.ambang).toLocaleString()}` : 'menonaktifkan auto-setor'} untuk akun kamu.`)
    }

    return m.reply('Topik CS tidak dikenali. Gunakan *.bank cs bantuan* untuk melihat layanan yang tersedia.')
  }

  if (action === 'asisten' || action === 'assistant') {
    if (!tier.fasilitas.includes('Asisten Pribadi')) return m.reply(`❌ ${tier.name} belum memiliki fasilitas Asisten Pribadi.`)

    const assistant = userRPG.asistenBank ||= { target: 0, autoSetor: { aktif: false, ambang: 1_000_000 }, pengingat: [] }
    assistant.autoSetor ||= { aktif: false, ambang: 1_000_000 }
    assistant.pengingat ||= []
    const subAction = args[1]?.toLowerCase()

    if (subAction === 'auto') {
      const state = args[2]?.toLowerCase()
      if (!['on', 'off'].includes(state)) return m.reply('Gunakan *.bank asisten auto on [ambang]* atau *.bank asisten auto off*.')
      if (state === 'off') {
        assistant.autoSetor.aktif = false
        await saveDB(wdb)
        return m.reply('✅ Auto-setor Asisten Pribadi dinonaktifkan.')
      }
      const threshold = args[3] === undefined ? Number(assistant.autoSetor.ambang) || 1_000_000 : Number(args[3])
      if (!Number.isSafeInteger(threshold) || threshold <= 0) return m.reply('❌ Ambang harus berupa angka rupiah positif.')
      assistant.autoSetor = { aktif: true, ambang: threshold }
      await saveDB(wdb)
      return m.reply(`✅ Auto-setor aktif. Uang saku akan disimpan saat mencapai Rp ${threshold.toLocaleString()}, selama limit kartu masih tersedia.`)
    }

    if (subAction === 'target') {
      if (args[2]?.toLowerCase() === 'off') {
        assistant.target = 0
        assistant.targetTercapai = false
        await saveDB(wdb)
        return m.reply('✅ Target tabungan dihapus.')
      }
      const target = Number(args[2])
      if (!Number.isSafeInteger(target) || target <= 0) return m.reply('Gunakan *.bank asisten target <jumlah>* atau *.bank asisten target off*.')
      assistant.target = target
      assistant.targetTercapai = false
      await saveDB(wdb)
      return m.reply(`✅ Target tabungan disetel ke Rp ${target.toLocaleString()}.`)
    }

    if (subAction === 'pengingat') {
      const reminderAction = args[2]?.toLowerCase()
      if (reminderAction === 'tambah') {
        const reminder = parseBankAssistantReminder(args[3], args[4], args.slice(5).join(' '))
        if (!reminder) return m.reply('Format: *.bank asisten pengingat tambah YYYY-MM-DD HH:mm <pesan>* (waktu harus di masa depan).')
        if (assistant.pengingat.length >= 10) return m.reply('❌ Maksimal 10 pengingat aktif.')
        assistant.pengingat.push(reminder)
        await saveDB(wdb)
        return m.reply(`✅ Pengingat disimpan untuk ${new Date(reminder.waktu).toLocaleString('id-ID')}.`)
      }
      if (reminderAction === 'hapus') {
        const index = Number(args[3]) - 1
        if (!Number.isInteger(index) || index < 0 || index >= assistant.pengingat.length) return m.reply('Nomor pengingat tidak valid. Lihat dengan *.bank asisten pengingat*.')
        const [removed] = assistant.pengingat.splice(index, 1)
        await saveDB(wdb)
        return m.reply(`✅ Pengingat “${removed.judul}” dihapus.`)
      }
      if (reminderAction === 'list') {
        const reminders = assistant.pengingat.map((item, index) => `${index + 1}. ${new Date(item.waktu).toLocaleString('id-ID')} - ${item.judul}`)
        return m.reply(reminders.length ? `⏰ *PENGINGAT ASISTEN*\n${reminders.join('\n')}` : 'Belum ada pengingat aktif.')
      }
      return m.reply('Gunakan *.bank asisten pengingat tambah YYYY-MM-DD HH:mm <pesan>*, *.bank asisten pengingat list*, atau *.bank asisten pengingat hapus <nomor>*.')
    }

    const wallet = Number(wdb.money[m.sender]) || 0
    const target = Number(assistant.target) || 0
    const reminderList = assistant.pengingat.length
      ? assistant.pengingat.map((item, index) => `${index + 1}. ${new Date(item.waktu).toLocaleString('id-ID')} - ${item.judul}`).join('\n')
      : 'Tidak ada'
    return m.reply(`👤 *PERSONAL BANKING MANAGER*\nSaldo bank: Rp ${userRPG.bank.toLocaleString()}\nUang saku: Rp ${wallet.toLocaleString()}\nTotal aset: Rp ${(userRPG.bank + wallet).toLocaleString()}\nTarget tabungan: ${target ? `Rp ${userRPG.bank.toLocaleString()} / Rp ${target.toLocaleString()} (${Math.min(100, Math.floor(userRPG.bank / target * 100))}%)` : 'Belum diatur'}\nAuto-setor: ${assistant.autoSetor.aktif ? `Aktif mulai Rp ${Number(assistant.autoSetor.ambang).toLocaleString()}` : 'Nonaktif'}\nPengingat:\n${reminderList}\n\nAtur: *.bank asisten target <jumlah>*, *.bank asisten auto on [ambang]*, *.bank asisten auto off*, *.bank asisten pengingat tambah YYYY-MM-DD HH:mm <pesan>*\nAutomasi diperiksa saat akun mengirim pesan ke bot.`)
  }

  if (userRPG.kartuBeku && !['tarik', 'simpan', 'all', ...membershipActions].includes(action)) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ Kartu kamu sedang BEKU\nSetor saldo atau bayar biaya bulanan dengan *.bank bulanan*, *.bank monthly*, atau *.bank tagihan*\n─━━━━━━━━━─`)

  let userMoney = wdb.money[m.sender] || 0

  // LIST KARTU
  if (action === 'card' || action === 'kartu') {
    const cardQuery = args.slice(1).join(' ').trim().toLowerCase()
    if (!cardQuery) {
      let cap = `╭─❏「 🏦 DAFTAR KARTU 」❏\n╰─━━━━━━━━━━━━━━─\n\n`
      for (const [level, card] of Object.entries(BANK_TIERS)) {
        const current = userRPG.bankTier == level ? ' ✅ *KARTU KAMU*' : ''
        cap += `> Lv.${level} ${card.color} *${card.name}*${current}\n`
      }
      cap += `\nLihat detail: *.bank card <angka/nama>*`
      return m.reply(cap)
    }

    const cardEntry = Object.entries(BANK_TIERS).find(([level, card]) =>
      /^\d+$/.test(cardQuery)
        ? Number(level) === Number(cardQuery)
        : card.name.toLowerCase() === cardQuery
    )
    if (!cardEntry) return m.reply('❌ Kartu tidak ditemukan. Gunakan *.bank card* untuk melihat daftar level dan nama kartu.')

    const [level, selectedCard] = cardEntry
    const selectedPrice = getBankPrice(selectedCard.price, m.sender, wdb)
    const selectedMonthlyFee = getBankMonthlyFee(selectedCard.biayaBulanan, m.sender, wdb)
    let cap = `╭─❏「 ${selectedCard.color} ${selectedCard.name.toUpperCase()} 」❏\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `◆ Level : ${level}\n`
    cap += `◆ Limit : ${formatBankLimit(selectedCard.limit)}\n`
    cap += `◆ Bunga : ${(selectedCard.bunga * 100).toFixed(2)}%/minggu\n`
    cap += `◆ Cooldown setor/tarik : ${getBankTransactionCooldown(selectedCard) ? `${getBankTransactionCooldown(selectedCard) / 60000} menit` : 'Tanpa cooldown (Portal Bank)'}\n`
    cap += `◆ Harga Upgrade : Rp ${selectedPrice.toLocaleString()}\n`
    cap += `◆ Biaya Bulanan : Rp ${selectedMonthlyFee.toLocaleString()}\n`
    cap += `◆ Keamanan : Lv.${selectedCard.keamanan}\n`
    cap += `◆ Asuransi : ${(selectedCard.asuransi * 100).toFixed(0)}%\n`
    cap += `◆ Fasilitas :\n> ${selectedCard.fasilitas.map(formatBankFacility).join('\n> ')}`
    const csService = getBankCsService(selectedCard)
    if (csService) cap += `\n\n◆ Layanan ${csService} :\n${BANK_CS_SERVICES[csService]}`
    return m.reply(cap)
  }

  if (action === 'benefit' || action === 'benefits') {
    const showAll = args[1] === 'list' || args[2] === 'list'
    let cap = `─━━ 🏦 RPG BANK CENTER ━━─\n\n`
    if (showAll) {
      cap += `◈ SEMUA BENEFIT BANK ◈\n\n`
      for (let i in BANK_TIERS) {
        const t = BANK_TIERS[i]
        cap += `${t.color} *Lv.${i} ${t.name}*\n`
        cap += `> ${t.fasilitas.map(f => `• ${formatBankFacility(f)}`).join('\n> ')}\n\n`
        const csService = getBankCsService(t)
        if (csService) cap += `> ${csService}: ${BANK_CS_SERVICES[csService]}\n\n`
      }
      cap += `👑 PREMIUM STATUS\n`
      cap += isPremium
        ? `> Diskon 25% untuk upgrade bank dan biaya bulanan.\n`
        : `> Belum premium, diskon bank belum aktif.\n`
    } else {
      cap += `◈ BENEFIT ${tier.color} ${tier.name.toUpperCase()} ◈\n\n`
      cap += `${tier.fasilitas.map(f => `• ${formatBankFacility(f)}`).join('\n')}\n\n`
      const csService = getBankCsService(tier)
      if (csService) cap += `◈ ${csService} ◈\n${BANK_CS_SERVICES[csService]}\n\n`
      cap += `👑 PREMIUM STATUS\n`
      cap += isPremium
        ? `> Kamu mendapat diskon 25% untuk upgrade dan biaya bulanan.\n`
        : `> User biasa, belum mendapat diskon premium.\n`
    }
    cap += `\n─━━━━━━━━━─`
    return m.reply(cap)
  }

  // SIMPAN + ALIAS "all"
  if (action === 'simpan' || action === 'all') {
    if (getPlayerCasinoRoom(wdb, m.sender)) {
      return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ SETOR DIBLOKIR\n◈ KAMU SEDANG DI ROOM CASINO ◈\n◆ Saat ikut room, bank tidak bisa menerima deposit.\n◆ Tarik tunai tetap diperbolehkan.\n\n─━━━━━━━━━─`)
    }
    if (args[1] === 'all' || action === 'all') {
      if (!canUseBankBulkDeposit(tier)) return m.reply('❌ Fitur setor semua hanya tersedia untuk kartu dengan akses Fast Track. Gunakan *.bank simpan <angka>* untuk setor manual.')
      if (userMoney <= 0) return m.reply('💵 Uang saku kamu masih kosong. Isi saldo uang saku dulu sebelum menyimpan ke bank.')
      amount = userMoney
    }
    if (userMoney <= 0) return m.reply('💵 Uang saku kamu masih kosong. Isi saldo uang saku dulu sebelum menyimpan ke bank.')
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (userMoney < amount) return m.reply('❌ Uang saku tidak cukup')
    if (exceedsBankLimit(userRPG.bank, amount, tier)) return m.reply(`❌ Melebihi limit. Sisa: Rp ${(tier.limit - userRPG.bank).toLocaleString()}`)
    const cooldownRemaining = getBankTransactionCooldownRemaining(userRPG, tier, now)
    if (cooldownRemaining > 0) return m.reply(`⏳ Transaksi setor/tarik masih cooldown. Coba lagi dalam ${Math.ceil(cooldownRemaining / 60000)} menit.`)
    wdb.money[m.sender] -= amount; userRPG.bank += amount
    userRPG.lastBankTransaction = now
    userRPG.riwayat.unshift(`-Rp ${amount.toLocaleString()} Simpan`)
    await saveDB(wdb)
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ TRANSAKSI BERHASIL\n◈ SETOR TUNAI ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Saldo Baru : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  // TARIK + ALIAS "all"
  if (action === 'tarik') {
    if (args[1] === 'all') amount = userRPG.bank
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (userRPG.bank < amount) return m.reply('❌ Saldo bank tidak cukup')
    const cooldownRemaining = getBankTransactionCooldownRemaining(userRPG, tier, now)
    if (cooldownRemaining > 0) return m.reply(`⏳ Transaksi setor/tarik masih cooldown. Coba lagi dalam ${Math.ceil(cooldownRemaining / 60000)} menit.`)
    userRPG.bank -= amount; wdb.money[m.sender] += amount
    userRPG.lastBankTransaction = now
    userRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} Tarik`)
    await saveDB(wdb)
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ TRANSAKSI BERHASIL\n◈ PENARIKAN TUNAI ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Saldo Tersisa : Rp ${userRPG.bank.toLocaleString()}\n`
    if(tier.fasilitas.includes('Kendaraan Pribadi')) msg += `◆ Kurir : Kendaraan Pribadi\n`
    msg += `\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  // TF + BIAYA ADMIN 0.5% + SUPPORT REPLY + ALL
  if (action === 'tf') {
    if (!tier.fasilitas.includes('Transfer Bank')) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ ${tier.name} belum bisa transfer\n─━━━━━━━━━─`)
    let who = m.mentionedJid?.[0] || m.quoted?.sender
    if (!who) return m.reply('❌ Tag target atau reply pesan target')
    who = conn.decodeJid(who)
    if (who === m.sender) return m.reply('❌ Gak bisa tf ke diri sendiri')

    if (args[1] === 'all') {
      let biayaAdmin = Math.max(1000, Math.min(500000, Math.floor(userRPG.bank * 0.005)))
      amount = userRPG.bank - biayaAdmin
      if(amount <= 0) return m.reply('❌ Saldo tidak cukup untuk biaya admin')
    }

    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')

    let biayaAdmin = Math.max(1000, Math.min(500000, Math.floor(amount * 0.005)))
    let totalPotong = amount + biayaAdmin

    if (userRPG.bank < totalPotong) return m.reply(`❌ Saldo bank tidak cukup\nButuh: Rp ${totalPotong.toLocaleString()} = Transfer + Admin Rp ${biayaAdmin.toLocaleString()}`)

    let targetData = getUserRPG(wdb, who)
    let targetRPG = targetData?.rpg
    if (!targetRPG || targetData?.isDummy) return m.reply('❌ Target belum punya data RPG')

    if (!Array.isArray(targetRPG.riwayat)) targetRPG.riwayat = []
    if (!Array.isArray(userRPG.riwayat)) userRPG.riwayat = []

    userRPG.bank -= totalPotong; targetRPG.bank += amount
    userRPG.riwayat.unshift(`-Rp ${amount.toLocaleString()} TF ke @${who.split('@')[0]} + Admin Rp ${biayaAdmin.toLocaleString()}`)
    targetRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} TF dari @${m.sender.split('@')[0]}`)
    await saveDB(wdb)

    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ TRANSFER BERHASIL\n◈ TRANSFER BANK ◈\n◆ Jumlah TF : Rp ${amount.toLocaleString()}\n◆ Biaya Admin : Rp ${biayaAdmin.toLocaleString()}\n◆ Total Potong : Rp ${totalPotong.toLocaleString()}\n◆ Ke : @${who.split('@')[0]}\n◆ Saldo Tersisa : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg, null, { mentions: [who] })
  }

  // PINJAM
  if (action === 'pinjam') {
    if (!tier.fasilitas.includes('Pinjaman Bank')) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ ${tier.name} belum bisa pinjam\n─━━━━━━━━━─`)
    if (userRPG.pinjaman.jumlah > 0) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ Masih punya pinjaman aktif\nLunasi dulu\n─━━━━━━━━━─`)
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (Number.isFinite(tier.limit) && amount > tier.limit * 0.5) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ Maksimal pinjam 50% limit\nMaks: Rp ${(tier.limit * 0.5).toLocaleString()}\n\n─━━━━━━━━━─`)
    userRPG.pinjaman = { jumlah: amount, waktu: now }; userRPG.bank += amount
    userRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} Pinjaman`)
    await saveDB(wdb)
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ PINJAMAN CAIR\n◈ PENGAJUAN PINJAMAN ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Bunga : 10%\n◆ Total Bayar : Rp ${Math.floor(amount * 1.1).toLocaleString()}\n◆ Jangka Waktu : 7 Hari\n◆ Saldo Baru : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  // BAYAR
  if (action === 'bayar') {
    if (userRPG.pinjaman.jumlah === 0) return m.reply('❌ Tidak punya pinjaman')
    let totalBayar = Math.floor(userRPG.pinjaman.jumlah * 1.1)
    if (userRPG.bank < totalBayar) return m.reply(`❌ Saldo bank tidak cukup`)
    userRPG.bank -= totalBayar; userRPG.riwayat.unshift(`-Rp ${totalBayar.toLocaleString()} Bayar Pinjaman`)
    userRPG.pinjaman = { jumlah: 0, waktu: 0 }; await saveDB(wdb)
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ PEMBAYARAN BERHASIL\n◈ PELUNASAN PINJAMAN ◈\n◆ Jumlah Bayar : Rp ${totalBayar.toLocaleString()}\n◆ Status : LUNAS\n◆ Saldo Tersisa : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  if (membershipActions.includes(action)) {
    if (tier.biayaBulanan <= 0) return m.reply('✅ Kartu ini tidak memiliki biaya bulanan.')
    if (now - userRPG.lastMembership < periodeMembership) {
      const sisaHari = Math.ceil((periodeMembership - (now - userRPG.lastMembership)) / satuHari)
      return m.reply(`ℹ️ Biaya bulanan belum jatuh tempo. Pembayaran berikutnya dalam ${sisaHari} hari.`)
    }
    const paymentStatus = chargeBankMembership(userRPG, tier.biayaBulanan, now, 'Biaya Membership Manual')
    if (paymentStatus === 'insufficient') {
      await saveDB(wdb)
      return m.reply(`❌ Saldo bank tidak cukup untuk membayar biaya bulanan Rp ${tier.biayaBulanan.toLocaleString()}. Kartu dibekukan sampai tagihan dibayar.`)
    }
    if (paymentStatus !== 'paid') return m.reply('❌ Pembayaran biaya bulanan tidak berhasil. Coba lagi setelah jatuh tempo.')
    await saveDB(wdb)
    return m.reply(`✅ PEMBAYARAN BULANAN BERHASIL\nBiaya: Rp ${tier.biayaBulanan.toLocaleString()}\nSaldo bank: Rp ${userRPG.bank.toLocaleString()}\nKartu: AKTIF`)
  }

  // RIWAYAT
  if (action === 'riwayat') {
    if (!tier.fasilitas.includes('Riwayat Transaksi')) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ ${tier.name} belum bisa lihat riwayat\n─━━━━━━━━━─`)
    if (userRPG.riwayat.length === 0) return m.reply('❌ Belum ada riwayat')
    let riwayat = userRPG.riwayat.slice(0, 10).map((r,i)=>` ${i+1}. ${r}`).join('\n')
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n◈ RIWAYAT TRANSAKSI ◈\n\n${riwayat}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  await saveDB(wdb)
}
handler.command = ['bank', 'tabung', 'money', 'uang'];
handler.tags = ['rpg']
handler.help = ['bank', 'bank command', 'bank all', 'bank simpan <jumlah>', 'bank tarik', 'bank cs', 'bank cs bantuan', 'bank cs saldo', 'bank cs simpan <jumlah>', 'bank cs tarik <jumlah>', 'bank cs analisis', 'bank cs fasilitas <level>', 'bank cs kontrol auto on/off', 'bank tf', 'bank pinjam', 'bank bayar', 'bank bulanan', 'bank monthly', 'bank tagihan', 'bank fnb', 'bank fnb list', 'bank asisten', 'bank asisten target <jumlah|off>', 'bank asisten auto on [ambang]', 'bank asisten auto off', 'bank asisten pengingat', 'bank riwayat', 'bank card', 'bank benefits', 'bank benefits list', 'money', 'uang']
handler.group = false

handler.all = async function (m, { conn }) {
  if (!m.sender) return
  const wdb = loadDB()
  const userRPG = getUserRPG(wdb, m.sender)?.rpg
  const tier = BANK_TIERS[userRPG?.bankTier]
  if (!userRPG || !tier?.fasilitas.includes('Asisten Pribadi')) return

  const assistant = userRPG.asistenBank
  if (!assistant) return

  const notifications = []
  let changed = false
  const messageWords = String(m.text || '').trim().split(/\s+/)
  const messageCommand = (messageWords[0] || '').replace(/^[^a-z0-9]+/i, '').toLowerCase()
  const changingAutoDeposit = messageCommand === 'bank' && (
    (['asisten', 'assistant'].includes(messageWords[1]?.toLowerCase()) && messageWords[2]?.toLowerCase() === 'auto')
    || (messageWords[1]?.toLowerCase() === 'cs' && messageWords[2]?.toLowerCase() === 'kontrol' && messageWords[3]?.toLowerCase() === 'auto')
  )
  const manualBankTransfer = messageCommand === 'bank' && (
    ['simpan', 'tarik', 'all'].includes(messageWords[1]?.toLowerCase())
    || (messageWords[1]?.toLowerCase() === 'cs' && ['simpan', 'tarik'].includes(messageWords[2]?.toLowerCase()))
  )

  if (assistant.autoSetor?.aktif && !changingAutoDeposit && !manualBankTransfer) {
    const wallet = Number(wdb.money[m.sender]) || 0
    const threshold = Math.max(1, Number(assistant.autoSetor.ambang) || 1_000_000)
    const room = tier.limit === null ? wallet : Math.max(0, tier.limit - userRPG.bank)
    const cooldownReady = getBankTransactionCooldownRemaining(userRPG, tier) === 0
    const deposit = wallet >= threshold && cooldownReady ? Math.min(wallet, room) : 0
    if (deposit > 0) {
      wdb.money[m.sender] = wallet - deposit
      userRPG.bank += deposit
      userRPG.lastBankTransaction = Date.now()
      userRPG.riwayat ||= []
      userRPG.riwayat.unshift(`-Rp ${deposit.toLocaleString()} Auto-setor Asisten Pribadi`)
      userRPG.riwayat.length = Math.min(userRPG.riwayat.length, 20)
      notifications.push(`Asisten menyimpan Rp ${deposit.toLocaleString()} dari uang saku ke bank.`)
      if (deposit < wallet) notifications.push(`Sisa uang saku Rp ${(wallet - deposit).toLocaleString()} karena limit kartu.`)
      changed = true
    }
  }

  const target = Number(assistant.target) || 0
  if (target && userRPG.bank >= target && !assistant.targetTercapai) {
    notifications.push(`Target tabungan tercapai: saldo bank Rp ${userRPG.bank.toLocaleString()} dari target Rp ${target.toLocaleString()}.`)
    assistant.targetTercapai = true
    changed = true
  } else if (target && userRPG.bank < target && assistant.targetTercapai) {
    assistant.targetTercapai = false
    changed = true
  }

  const now = Date.now()
  const dueReminders = (assistant.pengingat || []).filter(reminder => Number(reminder.waktu) <= now)
  if (dueReminders.length) {
    notifications.push(...dueReminders.map(reminder => `Pengingat: ${reminder.judul}`))
    assistant.pengingat = assistant.pengingat.filter(reminder => Number(reminder.waktu) > now)
    changed = true
  }

  if (changed) await saveDB(wdb)
  if (notifications.length) {
    await conn.sendMessage(m.sender, { text: `👤 *PERSONAL BANKING MANAGER*\n${notifications.map(item => `• ${item}`).join('\n')}` }).catch(() => {})
  }
}

export default handler