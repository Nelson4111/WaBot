import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  if (!nama || typeof nama !== 'string') return ''
  return nama
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data?.rpg || {}

  initLadang(user)
  if (!user.inventory) user.inventory = {}
  if (!user.ikan) user.ikan = {}
  if (!user.ores) user.ores = {}
  if (!user.masakan) user.masakan = {}

  const isPrem = global.db?.data?.users?.[m.sender]?.premium === true
  const sellBonus = isPrem ? 1.1 : 1
  const buyDiskon = isPrem ? 0.8 : 1

  const fishRenameMap = {
    poseidon: 'poseidon', flying_dutchman: 'flying_dutchman', aquaman: 'aquaman', godzilla: 'godzilla', zeus_laut: 'thunderfish', atlas_laut: 'atlas', kitsune_laut: 'rubah_laut', leviathan_primordial: 'leviathan_primordial', davy_jones: 'davy_jones', caylpso: 'ikan_paradise', worm_fish: 'worm_fish', zombie_shark: 'zombie_shark', skeleton_shark: 'skeleton_shark', ariel_little_mermaid: 'putri_laut', treasure_chest: 'peti_harta', ancient_relic: 'artefak_laut', pirate_gold: 'emas_pirate', mermaid_tear: 'air_mata_putri',
    kraken: 'kraken', megladon: 'megalodon', leviathan: 'leviathan', sea_dragon: 'naga_laut', phoenix_laut: 'ikan_phoenix', hydra_laut: 'hydra', cerberus_laut: 'cerberus', titan_kura: 'kura_raksasa', paus_putih: 'paus_putih', ikan_dewa: 'dewa_laut', naga_laut: 'naga_laut_biru', raja_ubur: 'ubur_utama', penjaga_karang: 'penjaga_karang', putri_duyung: 'putri_duyung', dewa_katak: 'katak_berkilau', kuda_laut_kristal: 'kuda_kristal', peti_karun: 'peti_karun', koin_emas_kuno: 'koin_emas_kuno', mutiara_raja: 'mutiara_raja', mahkota_karang: 'mahkota_karang',
    hiu_putih: 'hiu_putih', hiu_harimau: 'hiu_macan', hiu_martil: 'hiu_palu', paus_orca: 'paus_orca', paus_biru: 'paus_biru', penyu_raksasa: 'penyu_raksasa', ikan_pari_manta: 'pari_manta', ikan_napoleon: 'napoleon', kerapu_raksasa: 'kerapu_raksasa', marlin: 'marlin', tuna_sirip_biru: 'tuna_biru', pedang_laut: 'pedang_laut', ikan_koi_emas: 'koi_emas', lobster_raja: 'lobster_raja', kepiting_raksasa: 'kepiting_raksasa', gurita_raksasa: 'gurita_raksasa', sotong_raksasa: 'sotong_raksasa', lionfish: 'lionfish', ikan_badut: 'ikan_badut', ikan_kupu: 'ikan_kupu', ikan_malaikat: 'ikan_malaikat', ikan_diskus: 'ikan_diskus', ikan_arwana: 'ikan_arwana', ikan_arapaima: 'ikan_arapaima', piranha: 'piranha', belut_listrik: 'belut_listrik', ikan_duyung: 'ikan_duyung', ubur_ubur_bulan: 'ubur_bulan', bintang_laut: 'bintang_laut', anemon_laut: 'anemon', karang_indah: 'karang_indah', kerang_mutia: 'kerang_mutia', siput_laut: 'siput_laut', landak_laut: 'landak_laut', peti_besi: 'peti_besi', koin_emas: 'koin_emas', mutiara_hitam: 'mutiara_hitam', trisula_patah: 'trisula_patah',
    hiu_hitam: 'hiu_hitam', hiu_biru: 'hiu_biru', lumba_lumba: 'lumba_lumba', paus_pembunuh: 'paus_pembunuh', penyu_hijau: 'penyu_hijau', ikan_pari: 'pari', kerapu: 'kerapu', tuna: 'tuna', salmon: 'salmon', barakuda: 'barakuda', ikan_todak: 'ikan_todak', ikan_terbang: 'ikan_terbang', ubur_ubur: 'ubur_ubur', ubur_ubur_listrik: 'ubur_listrik', bintang_laut_ungu: 'bintang_ungu', karang_keras: 'karang_keras', kerang: 'kerang', peti_kayu: 'peti_kayu', koin_perak: 'koin_perak', mutiara_biasa: 'mutiara_biasa', karang_antik: 'karang_antik', kaiju: 'kaiju', kadita: 'kadita'
  }

  const unsafeEmojiPattern = /🪨|🪵|🪙|🪢|🪡|🛞|🪼|🪸|🌊|🌙|✨|🫐|🫒|🧄|🧅/u
  function safeEmoji(value, fallback = '❓') {
    if (typeof value !== 'string') return fallback
    return unsafeEmojiPattern.test(value) ? fallback : (value || fallback)
  }

  function normalizeFishKey(name) {
    const key = String(name || '').trim().toLowerCase().replace(/\s+/g, '_')
    const normalized = fishRenameMap[key] || key
    const keepIkanPrefix = new Set(['ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'ikan_todak', 'ikan_terbang', 'ikan_duyung', 'ikan_paradise'])
    return keepIkanPrefix.has(normalized) ? normalized : normalized.replace(/^ikan_/, '')
  }

  function migrateLegacyFishInventory(obj = {}) {
    const migrated = {}
    for (const key in obj) {
      const targetKey = normalizeFishKey(key)
      migrated[targetKey] = (migrated[targetKey] || 0) + Number(obj[key] || 0)
    }
    return migrated
  }

  user.ikan = migrateLegacyFishInventory(user.ikan)
  saveDB(wdb)

  const hargaBeli = {
    iron: { emoji: '⛓️', harga: 10000 },
    gold: { emoji: '✨', harga: 100000 },
    stone: { emoji: '🪨', harga: 5000 },
    wood: { emoji: '🪵', harga: 8000 },
    diamond: { emoji: '💎', harga: 500000 }
  }

  const raw = typeof text === 'string' ? text.trim() : ''
  const args = raw ? raw.toLowerCase().split(/\s+/).filter(Boolean) : []
  const mode = args[0] || 'shop'
  const arg0 = args[0] || ''
  const arg1 = args[1] || ''

  const isBeli = mode === 'beli'
  const isJualAll = mode === 'jual' && arg1 === 'all'
  const isJualYa = mode === 'jual' && (arg1 === 'ya' || arg1 === 'yes')
  const isJualTidak = mode === 'jual' && (arg1 === 'tidak' || arg1 === 'batal' || arg1 === 'no')

  function getAllItems() {
    const semuaItem = {}
    for (const item in user.inventory) if ((user.inventory[item] || 0) > 0) semuaItem[item] = (semuaItem[item] || 0) + user.inventory[item]
    for (const item in user.ikan) if ((user.ikan[item] || 0) > 0) semuaItem[item] = (semuaItem[item] || 0) + user.ikan[item]
    for (const item in user.ores) if ((user.ores[item] || 0) > 0) semuaItem[item] = (semuaItem[item] || 0) + user.ores[item]
    for (const item in user.masakan) if ((user.masakan[item] || 0) > 0) semuaItem[item] = (semuaItem[item] || 0) + user.masakan[item]
    return semuaItem
  }

  if (isBeli) {
    const item = args[1]
    const jumlah = parseInt(args[2]) || 1

    if (!item) {
      let cap = `╭─❏「 🛒 TOKO TERBATAS 」❏\n`
      cap += `│ 👑 Diskon: ${isPrem ? '20%' : '0%'}\n`
      cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
      cap += `╰─━━━━━━━━━━━━━━─\n\n`
      cap += `📦 *ITEM TERSEDIA*\n`
      Object.entries(hargaBeli).forEach(([key, value], index) => {
        const harga = Math.floor(value.harga * buyDiskon)
        cap += `${index + 1}. ${value.emoji} ${formatNama(key)} - Rp ${harga.toLocaleString()}\n`
      })
      cap += `\n📝 *Cara:* ${usedPrefix || '.'}beli [item] [jumlah]\n`
      cap += `💡 *Contoh:* ${usedPrefix || '.'}beli iron 3`
      return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
    }

    const itemName = hargaBeli[item] ? item : null
    if (!itemName) return m.reply('❌ Item ini tidak dijual di toko.')

    const hargaSatuan = Math.floor(hargaBeli[item].harga * buyDiskon)
    const totalHarga = hargaSatuan * jumlah

    if ((wdb.money[m.sender] || 0) < totalHarga) {
      return m.reply(`❌ Uang kamu tidak cukup!\nButuh: Rp ${totalHarga.toLocaleString()}\nPunya: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}`)
    }

    wdb.money[m.sender] -= totalHarga
    user.inventory[item] = (user.inventory[item] || 0) + jumlah
    saveDB(wdb)
    return m.reply(`✅ *BERHASIL BELI!*\n\n${hargaBeli[item].emoji} ${formatNama(item)} x${jumlah}\n💸 -Rp ${totalHarga.toLocaleString()}`)
  }

  if (mode === 'jual' && (arg0 === 'tidak' || arg0 === 'batal' || arg0 === 'no')) {
    if (user.jualAllConfirm) {
      delete user.jualAllConfirm
      saveDB(wdb)
      return m.reply('✅ Penjualan semua item dibatalkan.')
    }
    return m.reply('❌ Tidak ada konfirmasi jual yang aktif.')
  }

  if (isJualAll) {
    const semuaItem = getAllItems()
    if (Object.keys(semuaItem).length === 0) return m.reply('❌ Kamu tidak punya item yang bisa dijual.')

    let cap = `╭─❏「 ⚠️ JUAL SEMUA 」❏\n`
    cap += `│ Total item: ${Object.keys(semuaItem).length}\n`
    cap += `╰─━━━━━━━━━━━━━━───╯\n\n`
    Object.keys(semuaItem).forEach(nama => {
      cap += `• ${formatNama(nama)} x${semuaItem[nama].toLocaleString()}\n`
    })
    cap += `\nBonus premium: ${isPrem ? '+10%' : '0%'}\n`
    cap += `✅ Ketik *${usedPrefix || '.'}jual ya* untuk konfirmasi\n`
    cap += `❌ Ketik *${usedPrefix || '.'}jual tidak* untuk batal`

    user.jualAllConfirm = { items: semuaItem, time: Date.now() }
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  if (isJualYa) {
    if (!user.jualAllConfirm || Date.now() - user.jualAllConfirm.time > 60000) {
      return m.reply('❌ Konfirmasi kadaluarsa. Ketik *' + (usedPrefix || '.') + 'jual all* lagi')
    }

    const hargaGabung = {
      iron: 5000, gold: 50000, stone: 2500, wood: 4000, diamond: 250000,
      grass: 400, sand_stone: 600, graphite: 700, pumice: 800, sulfur: 900,
      poopite: 1000, copper: 1200, tin: 1500, cardboardite: 2000,
      silver: 5000, bananite: 5000, cuprite: 3500, mushroomite: 4000, platinum: 25000,
      cobalt: 30000, obsidian: 35000, titanium: 40000, rivalite: 45000, fillium: 60000,
      lightite: 70000, demonite: 80000, darkryte: 90000, uranium: 100000,
      snowite: 120000, iore: 135000, aite: 150000, blue_crystal: 180000,
      orange_crystal: 200000, green_crystal: 225000, purple_crystal: 250000,
      red_crystal: 300000, arcane_crystal: 400000, tungsten: 450000,
      massacerit: 500000, valtry: 600000, sanctis: 750000, ethereal_light: 900000,
      aetherite: 1200000, voidar: 1500000, galaxy: 2500000,
      kacang: 6500, bawang_putih: 7500, padi: 7500, bawang_merah: 8000,
      wortel: 9000, timun: 10000, selada: 12000, kentang: 12500,
      tomat: 13500, ubi: 13500, jagung: 15000, brokoli: 15000,
      terong: 16500, semangka: 18000, lemon: 18000, cabai: 19500,
      paprika: 19000, stroberi: 21000, jeruk: 22500, bluberi: 22500,
      ceri: 24000, kastanye: 25000, zaitun: 25500, pisang: 27000,
      nanas: 28500, kiwi: 28500, pir: 30000, persik: 30000,
      melon: 31500, anggur: 33000, mangga: 34500, apel_hijau: 36000,
      alpukat: 36000, apel_merah: 37500, kelapa: 37500, exp: 50000,
      durian: 75000, uang: 75000, koin: 90000, emas: 300000, berlian: 350000,
      sampah_plastik: 5000, ban_bekas: 5000, botol_kaca: 5000, kaleng: 5000,
      kayu_hanyut: 5000, jaring_rusak: 5000, sepatu: 5000, botol: 5000,
      kantong_plastik: 5000, duri: 5000, batu: 5000, rumput: 5000,
      lumpur: 5000, daun: 5000, ranting: 5000, tali: 5000,
      kawat: 5000, pecahan_kaca: 5000, kaos_kaki: 5000, mie_instan: 5000, pakaian_dalam: 5000,
      ikan_teri: 8000, ikan_pepetek: 8000, ikan_layang: 8000, ikan_kembung_kecil: 8000,
      ikan_selar: 8000, ikan_tembang: 8000, ikan_julung: 8000,
      ikan_mas: 25000, ikan_nila: 25000, ikan_lele: 25000, ikan_patin: 25000,
      ikan_gurame: 25000, ikan_mujair: 25000, ikan_gabus: 25000, ikan_wader: 25000, ikan_seluang: 25000,
      kakap: 60000, kerapu_kecil: 60000, sarden: 60000, makarel: 60000, kembung: 60000,
      tongkol: 60000, cumi: 60000, gurita_kecil: 60000, udang: 60000, kepiting: 60000,
      lobster: 60000, kerang_hijau: 60000, kerang_darah: 60000, siput: 60000,
      landak_laut_kecil: 60000, anemon: 60000, rumput_laut: 60000, karang: 60000,
      peti_karat: 60000, koin_tembaga: 60000, mutiara_retak: 60000, cangkir_pecah: 60000,
      hiu_hitam: 125000, hiu_biru: 125000, lumba_lumba: 125000, paus_pembunuh: 125000,
      penyu_hijau: 125000, ikan_pari: 125000, kerapu: 125000, tuna: 125000, salmon: 125000,
      barakuda: 125000, ikan_todak: 125000, ikan_terbang: 125000, ubur_ubur: 125000,
      ubur_ubur_listrik: 125000, bintang_laut_ungu: 125000, karang_keras: 125000, kerang: 125000,
      peti_kayu: 125000, koin_perak: 125000, mutiara_biasa: 125000, karang_antik: 125000,
      hiu_putih: 250000, hiu_harimau: 250000, hiu_martil: 250000, paus_orca: 250000,
      paus_biru: 250000, penyu_raksasa: 250000, ikan_pari_manta: 250000, ikan_napoleon: 250000,
      kerapu_raksasa: 250000, marlin: 250000, tuna_sirip_biru: 250000, pedang_laut: 250000,
      ikan_koi_emas: 250000, lobster_raja: 250000, kepiting_raksasa: 250000, gurita_raksasa: 250000,
      sotong_raksasa: 250000, lionfish: 250000, ikan_badut: 250000, ikan_kupu: 250000,
      ikan_malaikat: 250000, ikan_diskus: 250000, ikan_arwana: 250000, ikan_arapaima: 250000,
      piranha: 250000, belut_listrik: 250000, ikan_duyung: 250000, ubur_ubur_bulan: 250000,
      bintang_laut: 250000, anemon_laut: 250000, karang_indah: 250000, kerang_mutia: 250000,
      siput_laut: 250000, landak_laut: 250000, peti_besi: 250000, koin_emas: 250000,
      mutiara_hitam: 250000, trisula_patah: 250000,
      roti_tawar: 8000, mie_goreng: 18000, sate_ikan: 35000, salad_buah: 40000,
      sup_ikan: 40000, taco_ikan: 45000, udang_goreng: 90000, cumi_goreng: 110000,
      kepiting_rebus: 120000, jus_durian: 100000, wine: 120000, sushi: 400000,
      sashimi: 500000, lobster_bakar: 600000, tuna_panggang: 600000, salmon_asap: 600000,
      steak_hiu: 900000, pari_bakar: 1000000, penyu_panggang: 1200000, steak_emas: 1500000,
      diamond_cake: 3000000, sop_kraken: 2000000, sate_megalodon: 2500000, sup_leviathan: 3000000,
      sea_dragon_grill: 3500000, hydra_stew: 4500000, kura_titan_soup: 5000000,
      paus_putih_steak: 6000000, naga_laut_bakar: 8000000, raja_ubur_jelly: 9000000, steak_godzilla: 15000000
    }

    const hargaGabungNorm = Object.fromEntries(Object.entries(hargaGabung).map(([key, value]) => [normalizeFishKey(key), value]))

    let totalDapat = 0
    let terjual = 0
    for (const nama in user.jualAllConfirm.items) {
      const cleanNama = normalizeFishKey(nama)
      const jumlah = user.jualAllConfirm.items[nama]
      const hrgSatuan = hargaGabungNorm[cleanNama] || hargaGabung[nama] || 1000
      if (hrgSatuan > 0) {
        totalDapat += Math.floor(hrgSatuan * sellBonus) * jumlah
        terjual++
      }
      if (user.inventory) delete user.inventory[nama]
      if (user.ikan) delete user.ikan[cleanNama]
      if (user.ores) delete user.ores[nama]
      if (user.masakan) delete user.masakan[nama]
    }

    wdb.money[m.sender] = (wdb.money[m.sender] || 0) + totalDapat
    user.jualAllConfirm = null
    saveDB(wdb)
    return m.reply(`✅ *BERHASIL JUAL ${terjual} JENIS ITEM!*\n\n💰 Mendapatkan: Rp ${totalDapat.toLocaleString()}`)
  }

  const cap = `╭─❏「 🏪 AVELIA MARKET 」❏\n` +
    `│ 👤 ${isPrem ? 'Premium +10% jual, -20% beli' : 'User biasa'}\n` +
    `│ 💰 Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *MENU SHOP*\n` +
    `> ↳ 1. ${usedPrefix || '.'}pabrik - ⛏️ Material\n` +
    `> ↳ 2. ${usedPrefix || '.'}koperasi - 🌾 Panen\n` +
    `> ↳ 3. ${usedPrefix || '.'}pasar - 🎣 Ikan\n` +
    `> ↳ 4. ${usedPrefix || '.'}restoran - 🍽️ Masakan\n\n` +
    `🛒 *TRANSAKSI*\n` +
    `> ↳ ${usedPrefix || '.'}jual all - Jual Semua Item\n` +
    `> ↳ ${usedPrefix || '.'}beli - Beli Item\n` +
    `> ↳ ${usedPrefix || '.'}gudang - Lihat Gudang\n\n` +
    `─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['shop', 'market', 'toko', 'jual all', 'beli [item] [jumlah]']
handler.tags = ['rpg']
handler.command = /^(shop|market|toko|jual|beli)$/i
handler.alias = ['toko', 'shop', 'market']
handler.group = true
export default handler
