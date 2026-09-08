import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  if (!nama) return ''
  return String(nama)
    .replace(/^ikan[_\s]+/i, '')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const fishRenameMap = {
  poseidon: 'poseidon',
  flying_dutchman: 'flying_dutchman',
  aquaman: 'aquaman',
  godzilla: 'godzilla',
  zeus_laut: 'thunderfish',
  atlas_laut: 'atlas',
  kitsune_laut: 'rubah_laut',
  leviathan_primordial: 'leviathan_primordial',
  davy_jones: 'davy_jones',
  caylpso: 'ikan_paradise',
  worm_fish: 'worm_fish',
  zombie_shark: 'zombie_shark',
  skeleton_shark: 'skeleton_shark',
  ariel_little_mermaid: 'putri_laut',
  treasure_chest: 'peti_harta',
  ancient_relic: 'artefak_laut',
  pirate_gold: 'emas_pirate',
  mermaid_tear: 'air_mata_putri',
  kraken: 'kraken',
  megladon: 'megalodon',
  leviathan: 'leviathan',
  sea_dragon: 'naga_laut',
  phoenix_laut: 'ikan_phoenix',
  hydra_laut: 'hydra',
  cerberus_laut: 'cerberus',
  titan_kura: 'kura_raksasa',
  paus_putih: 'paus_putih',
  ikan_dewa: 'dewa_laut',
  naga_laut: 'naga_laut_biru',
  raja_ubur: 'ubur_utama',
  penjaga_karang: 'penjaga_karang',
  putri_duyung: 'putri_duyung',
  dewa_katak: 'katak_berkilau',
  kuda_laut_kristal: 'kuda_kristal',
  peti_karun: 'peti_karun',
  koin_emas_kuno: 'koin_emas_kuno',
  mutiara_raja: 'mutiara_raja',
  mahkota_karang: 'mahkota_karang',
  hiu_putih: 'hiu_putih',
  hiu_harimau: 'hiu_macan',
  hiu_martil: 'hiu_palu',
  paus_orca: 'paus_orca',
  paus_biru: 'paus_biru',
  penyu_raksasa: 'penyu_raksasa',
  ikan_pari_manta: 'pari_manta',
  ikan_napoleon: 'napoleon',
  kerapu_raksasa: 'kerapu_raksasa',
  marlin: 'marlin',
  tuna_sirip_biru: 'tuna_biru',
  pedang_laut: 'pedang_laut',
  ikan_koi_emas: 'koi_emas',
  lobster_raja: 'lobster_raja',
  kepiting_raksasa: 'kepiting_raksasa',
  gurita_raksasa: 'gurita_raksasa',
  sotong_raksasa: 'sotong_raksasa',
  lionfish: 'lionfish',
  ikan_badut: 'ikan_badut',
  ikan_kupu: 'ikan_kupu',
  ikan_malaikat: 'ikan_malaikat',
  ikan_diskus: 'ikan_diskus',
  ikan_arwana: 'ikan_arwana',
  ikan_arapaima: 'ikan_arapaima',
  piranha: 'piranha',
  belut_listrik: 'belut_listrik',
  ikan_duyung: 'ikan_duyung',
  ubur_ubur_bulan: 'ubur_bulan',
  bintang_laut: 'bintang_laut',
  anemon_laut: 'anemon',
  karang_indah: 'karang_indah',
  kerang_mutia: 'kerang_mutia',
  siput_laut: 'siput_laut',
  landak_laut: 'landak_laut',
  peti_besi: 'peti_besi',
  koin_emas: 'koin_emas',
  mutiara_hitam: 'mutiara_hitam',
  trisula_patah: 'trisula_patah',
  hiu_hitam: 'hiu_hitam',
  hiu_biru: 'hiu_biru',
  lumba_lumba: 'lumba_lumba',
  paus_pembunuh: 'paus_pembunuh',
  penyu_hijau: 'penyu_hijau',
  ikan_pari: 'pari',
  kerapu: 'kerapu',
  tuna: 'tuna',
  salmon: 'salmon',
  barakuda: 'barakuda',
  ikan_todak: 'ikan_todak',
  ikan_terbang: 'ikan_terbang',
  ubur_ubur: 'ubur_ubur',
  ubur_ubur_listrik: 'ubur_listrik',
  bintang_laut_ungu: 'bintang_ungu',
  karang_keras: 'karang_keras',
  kerang: 'kerang',
  peti_kayu: 'peti_kayu',
  koin_perak: 'koin_perak',
  mutiara_biasa: 'mutiara_biasa',
  karang_antik: 'karang_antik',
  kaiju: 'kaiju',
  kadita: 'kadita'
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

function migrateLegacyFishInventory(ikanObj = {}) {
  const migrated = {}
  for (const key in ikanObj) {
    const targetKey = normalizeFishKey(key)
    migrated[targetKey] = (migrated[targetKey] || 0) + Number(ikanObj[key] || 0)
  }
  return migrated
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if (!user.ikan) user.ikan = {}

  user.ikan = migrateLegacyFishInventory(user.ikan)
  saveDB(wdb)

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem ? 1.1 : 1

  const harga = {
    sampah_plastik: { emoji: '🗑️', harga: 5000 },
    ban_bekas: { emoji: '🛞', harga: 5000 },
    botol_kaca: { emoji: '🍶', harga: 5000 },
    kaleng: { emoji: '🥫', harga: 5000 },
    kayu_hanyut: { emoji: '🪵', harga: 5000 },
    jaring_rusak: { emoji: '🕸️', harga: 5000 },
    sepatu: { emoji: '👟', harga: 5000 },
    botol: { emoji: '🍶', harga: 5000 },
    kantong_plastik: { emoji: '🛍️', harga: 5000 },
    duri: { emoji: '🌵', harga: 5000 },
    batu: { emoji: '🪨', harga: 5000 },
    rumput: { emoji: '🌿', harga: 5000 },
    lumpur: { emoji: '🟤', harga: 5000 },
    daun: { emoji: '🍃', harga: 5000 },
    ranting: { emoji: '🌿', harga: 5000 },
    tali: { emoji: '🪢', harga: 5000 },
    kawat: { emoji: '🔩', harga: 5000 },
    pecahan_kaca: { emoji: '💔', harga: 5000 },
    kaos_kaki: { emoji: '🧦', harga: 5000 },
    mie_instan: { emoji: '🍜', harga: 5000 },
    pakaian_dalam: { emoji: '🩲', harga: 5000 },
    ikan_teri: { emoji: '🐟', harga: 8000 },
    ikan_pepetek: { emoji: '🐟', harga: 8000 },
    ikan_layang: { emoji: '🐟', harga: 8000 },
    ikan_kembung_kecil: { emoji: '🐟', harga: 8000 },
    ikan_selar: { emoji: '🐟', harga: 8000 },
    ikan_tembang: { emoji: '🐟', harga: 8000 },
    ikan_julung: { emoji: '🐟', harga: 8000 },
    ikan_mas: { emoji: '🐟', harga: 25000 },
    ikan_nila: { emoji: '🐟', harga: 25000 },
    ikan_lele: { emoji: '🐟', harga: 25000 },
    ikan_patin: { emoji: '🐟', harga: 25000 },
    ikan_gurame: { emoji: '🐟', harga: 25000 },
    ikan_mujair: { emoji: '🐟', harga: 25000 },
    ikan_gabus: { emoji: '🐟', harga: 25000 },
    ikan_wader: { emoji: '🐟', harga: 25000 },
    ikan_seluang: { emoji: '🐟', harga: 25000 },
    kakap: { emoji: '🐟', harga: 60000 },
    kerapu_kecil: { emoji: '🐟', harga: 60000 },
    sarden: { emoji: '🐟', harga: 60000 },
    makarel: { emoji: '🐟', harga: 60000 },
    kembung: { emoji: '🐟', harga: 60000 },
    tongkol: { emoji: '🐟', harga: 60000 },
    cumi: { emoji: '🦑', harga: 60000 },
    gurita_kecil: { emoji: '🐙', harga: 60000 },
    udang: { emoji: '🦐', harga: 60000 },
    kepiting: { emoji: '🦀', harga: 60000 },
    lobster: { emoji: '🦞', harga: 60000 },
    kerang_hijau: { emoji: '🐚', harga: 60000 },
    kerang_darah: { emoji: '🐚', harga: 60000 },
    siput: { emoji: '🐌', harga: 60000 },
    landak_laut_kecil: { emoji: '🦔', harga: 60000 },
    anemon: { emoji: '🌸', harga: 60000 },
    rumput_laut: { emoji: '🌿', harga: 60000 },
    karang: { emoji: '🪸', harga: 60000 },
    peti_karat: { emoji: '📦', harga: 60000 },
    koin_tembaga: { emoji: '🪙', harga: 60000 },
    mutiara_retak: { emoji: '🐚', harga: 60000 },
    cangkir_pecah: { emoji: '🏺', harga: 60000 },
    ikan_hiu_hitam: { emoji: '🦈', harga: 125000 },
    ikan_hiu_biru: { emoji: '🦈', harga: 125000 },
    ikan_lumba_lumba: { emoji: '🐬', harga: 125000 },
    ikan_paus_pembunuh: { emoji: '🐋', harga: 125000 },
    ikan_penyu_hijau: { emoji: '🐢', harga: 125000 },
    ikan_pari: { emoji: '🪼', harga: 125000 },
    ikan_kerapu: { emoji: '🐟', harga: 125000 },
    ikan_tuna: { emoji: '🐟', harga: 125000 },
    ikan_salmon: { emoji: '🐟', harga: 125000 },
    ikan_barakuda: { emoji: '🐟', harga: 125000 },
    ikan_todak: { emoji: '🐟', harga: 125000 },
    ikan_terbang: { emoji: '🐟', harga: 125000 },
    ikan_ubur: { emoji: '🪼', harga: 125000 },
    ikan_ubur_listrik: { emoji: '⚡', harga: 125000 },
    ikan_bintang_ungu: { emoji: '⭐', harga: 125000 },
    karang_keras: { emoji: '🪸', harga: 125000 },
    kerang: { emoji: '🐚', harga: 125000 },
    peti_kayu: { emoji: '🪵', harga: 125000 },
    koin_perak: { emoji: '🪙', harga: 125000 },
    mutiara_biasa: { emoji: '⚪', harga: 125000 },
    karang_antik: { emoji: '🪸', harga: 125000 },
    ikan_hiu_putih: { emoji: '🦈', harga: 250000 },
    ikan_hiu_macan: { emoji: '🦈', harga: 250000 },
    ikan_hiu_palu: { emoji: '🦈', harga: 250000 },
    ikan_paus_orca: { emoji: '🐋', harga: 250000 },
    ikan_paus_biru: { emoji: '🐋', harga: 250000 },
    ikan_penyu_raksasa: { emoji: '🐢', harga: 250000 },
    ikan_pari_manta: { emoji: '🪼', harga: 250000 },
    ikan_napoleon: { emoji: '🐟', harga: 250000 },
    ikan_kerapu_raksasa: { emoji: '🐟', harga: 250000 },
    ikan_marlin: { emoji: '🐟', harga: 250000 },
    ikan_tuna_biru: { emoji: '🐟', harga: 250000 },
    ikan_pedang_laut: { emoji: '⚔️', harga: 250000 },
    ikan_koi_emas: { emoji: '🐟', harga: 250000 },
    lobster_raja: { emoji: '🦞', harga: 250000 },
    kepiting_raksasa: { emoji: '🦀', harga: 250000 },
    gurita_raksasa: { emoji: '🐙', harga: 250000 },
    sotong_raksasa: { emoji: '🦑', harga: 250000 },
    ikan_lionfish: { emoji: '🐠', harga: 250000 },
    ikan_badut: { emoji: '🐠', harga: 250000 },
    ikan_kupu: { emoji: '🐠', harga: 250000 },
    ikan_malaikat: { emoji: '🐠', harga: 250000 },
    ikan_diskus: { emoji: '🐠', harga: 250000 },
    ikan_arwana: { emoji: '🐟', harga: 250000 },
    ikan_arapaima: { emoji: '🐟', harga: 250000 },
    ikan_piranha: { emoji: '🐟', harga: 250000 },
    ikan_belut_listrik: { emoji: '🐍', harga: 250000 },
    ikan_putri_laut: { emoji: '🌊', harga: 250000 },
    ikan_ubur_bulan: { emoji: '🌙', harga: 250000 },
    ikan_bintang_laut: { emoji: '⭐', harga: 250000 },
    ikan_anemon: { emoji: '🌸', harga: 250000 },
    karang_indah: { emoji: '🪸', harga: 250000 },
    kerang_mutia: { emoji: '🐚', harga: 250000 },
    ikan_siput_laut: { emoji: '🐌', harga: 250000 },
    ikan_landak_laut: { emoji: '🦔', harga: 250000 },
    peti_besi: { emoji: '📦', harga: 250000 },
    koin_emas: { emoji: '🪙', harga: 250000 },
    mutiara_hitam: { emoji: '⚫', harga: 250000 },
    trisula_patah: { emoji: '🔱', harga: 250000 },
    ikan_kraken: { emoji: '🦑', harga: 500000 },
    ikan_megalodon: { emoji: '🦈', harga: 500000 },
    ikan_leviathan: { emoji: '🐉', harga: 500000 },
    ikan_naga_laut: { emoji: '🐲', harga: 500000 },
    ikan_berapi: { emoji: '🔥', harga: 500000 },
    ikan_hidra: { emoji: '🐍', harga: 500000 },
    ikan_cerberus: { emoji: '🐺', harga: 500000 },
    ikan_kura_raksasa: { emoji: '🐢', harga: 500000 },
    ikan_paus_putih: { emoji: '🐋', harga: 500000 },
    ikan_dewa_laut: { emoji: '✨', harga: 500000 },
    ikan_naga_laut_biru: { emoji: '🐉', harga: 500000 },
    ikan_ubur_utama: { emoji: '👑', harga: 500000 },
    ikan_penjaga_karang: { emoji: '🪸', harga: 500000 },
    ikan_putri_duyung: { emoji: '💎', harga: 500000 },
    ikan_katak_berkilau: { emoji: '🐸', harga: 500000 },
    ikan_kuda_kristal: { emoji: '🐴', harga: 500000 },
    peti_karun: { emoji: '💰', harga: 500000 },
    koin_emas_kuno: { emoji: '🪙', harga: 500000 },
    mutiara_raja: { emoji: '👑', harga: 500000 },
    mahkota_karang: { emoji: '👑', harga: 500000 },
    ikan_aurora: { emoji: '🌊', harga: 2500000 },
    ikan_kapal_hantu: { emoji: '⚓', harga: 2500000 },
    ikan_pahlawan: { emoji: '🛡️', harga: 2500000 },
    ikan_kaiju: { emoji: '🐉', harga: 2500000 },
    ikan_petir: { emoji: '⚡', harga: 2500000 },
    ikan_puncak: { emoji: '🏔️', harga: 2500000 },
    ikan_rubah_laut: { emoji: '🦊', harga: 2500000 },
    ikan_leviathan_primordial: { emoji: '🐉', harga: 2500000 },
    ikan_kapten_hitam: { emoji: '🦑', harga: 2500000 },
    ikan_laut_biru: { emoji: '💧', harga: 2500000 },
    peti_harta: { emoji: '💎', harga: 2500000 },
    artefak_laut: { emoji: '🏺', harga: 2500000 },
    emas_pirate: { emoji: '💰', harga: 2500000 },
    air_mata_putri: { emoji: '💧', harga: 2500000 }
  }

  const keys = Object.keys(harga).sort((a, b) => harga[a].harga - harga[b].harga)
  const nomorKeItem = {}
  keys.forEach((k, i) => nomorKeItem[i + 1] = k)

  function getItemByInput(input) {
    if (!isNaN(input)) return nomorKeItem[parseInt(input)]
    return normalizeFishKey(input)
  }

  if (!text) {
    let cap = `╭─❏「 🎣 PASAR AVELIA 」❏\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ 👤 ${isPrem ? 'Premium +10% jual, -20% beli' : 'User biasa'}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `📌 *MENU JUAL*\n`
    cap += `> ↳ Jual: *${usedPrefix}pasar jual <no/nama> <jumlah/all>*\n`
    cap += `> ↳ Contoh: *${usedPrefix}pasar jual 15 5*\n`
    cap += `> ↳ Jual Semua: *${usedPrefix}pasar jual all*\n\n`

    cap += `📌 *MAU MANCING?*\n`
    cap += `> ↳ Ketik: *${usedPrefix}mancing*\n\n`

    cap += `🐟 *DAFTAR HARGA JUAL*\n`
    cap += `> ↳ Pilih nomor ikan untuk menjualnya. Ikan langka memiliki harga lebih tinggi.\n\n`

    keys.forEach((k, i) => {
      let h = Math.floor(harga[k].harga * sellBonus)
      cap += `${harga[k].emoji} *${i + 1}. ${formatNama(k)}*\n`
      cap += `> ↳ Sell : Rp ${h.toLocaleString()}\n`
    })

    cap += `\n─━━━━━━━━━━━━━━─`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ').filter(v => v)
  let tipe = args[0]

  if (tipe !== 'jual') return m.reply(`❌ Pakai: *${usedPrefix}pasar jual <no/nama> <jumlah/all>*`)
  args = args.slice(1)

  if (args[0] === 'all') {
    let totalHasil = 0, listJual = []
    for (let item in user.ikan) {
      if (harga[item]) {
        let jumlah = user.ikan[item]
        let hasil = Math.floor(harga[item].harga * sellBonus) * jumlah
        totalHasil += hasil
        listJual.push(`${harga[item].emoji} ${formatNama(item)} x${jumlah}`)
        delete user.ikan[item]
      }
    }

    if (totalHasil === 0) return m.reply(`❌ Kamu tidak punya ikan yang bisa dijual.`)

    wdb.money[m.sender] += totalHasil
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🎣 PASAR AVELIA 」❏\n` +
      `│ ✅ *BERHASIL JUAL SEMUA!*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🐟 *DAFTAR IKAN TERJUAL*\n` +
      `${listJual.map(v => `> ↳ ${v}`).join('\n')}\n\n` +
      `💰 *Total:* +Rp ${totalHasil.toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let amount = 1, itemInput = ''
  if (!isNaN(parseInt(args[0]))) {
    if (!isNaN(parseInt(args[1]))) {
      itemInput = getItemByInput(args[0])
      amount = parseInt(args[1])
    }
    else if (args[1] === 'all') {
      itemInput = getItemByInput(args[0])
      amount = 'all'
    }
    else {
      itemInput = getItemByInput(args[0])
      amount = parseInt(args[1]) || 1
    }
  } else if (!isNaN(parseInt(args[args.length - 1]))) {
    amount = parseInt(args[args.length - 1])
    itemInput = getItemByInput(args.slice(0, -1).join(' '))
  } else if (args[args.length - 1] === 'all') {
    amount = 'all'
    itemInput = getItemByInput(args.slice(0, -1).join(' '))
  } else {
    itemInput = getItemByInput(args.join(' '))
  }

  if (!harga[itemInput]) return m.reply(`❌ Ikan "${formatNama(itemInput)}" tidak ada di list.\nLihat: *${usedPrefix}pasar*`)

  let stok = user.ikan[itemInput] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(itemInput)}`)

  let jual = amount === 'all' ? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
  user.ikan[itemInput] -= jual
  if (user.ikan[itemInput] <= 0) delete user.ikan[itemInput]
  wdb.money[m.sender] += hasil
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🎣 PASAR AVELIA 」❏\n` +
    `│ ✅ *BERHASIL JUAL!*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${harga[itemInput].emoji} *${formatNama(itemInput)}* x${jual}\n` +
    `> ↳ 💰 +Rp ${hasil.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['pasar', 'pasar jual <no/nama> <jumlah/all>', 'pasar jual all', 'tokoikan']
handler.tags = ['rpg']
handler.command = /^(pasar|tokoikan|jualikan)$/i
handler.alias = ['pasar', 'tokoikan', 'jualikan']
handler.group = true
export default handler