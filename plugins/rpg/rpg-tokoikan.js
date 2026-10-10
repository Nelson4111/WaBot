import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { fishRenameMap, ikanEmoji, normalizeFishKey, migrateLegacyFishInventory } from '../../lib/rpg-fishCatalog.js'
import { scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { MOUNT_TRASH } from '../../lib/mountData.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'

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

let handler = async (m, { text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if (!user.ikan) user.ikan = {}
  if (!user.inventory) user.inventory = {}

  user.ikan = migrateLegacyFishInventory(user.ikan)
  saveDB(wdb)

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem ? 1.1 : 1

  const harga = Object.fromEntries(Object.entries({
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
    air_mata_putri: { emoji: '💧', harga: 2500000 },
    ...Object.fromEntries(MOUNT_TRASH.map(({ id, emoji, price }) => [id, { emoji, harga: price }]))
  }).map(([key, value]) => [normalizeFishKey(key), value]))

  const keys = Object.keys(harga).sort((a, b) => harga[a].harga - harga[b].harga)
  const nomorKeItem = {}
  keys.forEach((k, i) => nomorKeItem[i + 1] = k)

  function getItemByInput(input) {
    if (input === undefined || input === null || input === '') return null
    if (!isNaN(input)) {
      const idx = parseInt(input, 10)
      return nomorKeItem[idx] || null
    }

    const raw = String(input).trim().toLowerCase()
    const candidateSet = new Set()
    candidateSet.add(raw)
    candidateSet.add(raw.replace(/\s+/g, '_'))
    candidateSet.add(raw.replace(/^ikan\s+/, ''))
    candidateSet.add(raw.replace(/^ikan_/, ''))
    candidateSet.add(raw.replace(/^ikan\s+/, '').replace(/\s+/g, '_'))
    candidateSet.add(raw.replace(/\s+/g, ' ').trim())

    for (const candidate of candidateSet) {
      const normalized = normalizeFishKey(candidate)
      if (harga[normalized]) return normalized

      const labelMatch = Object.keys(harga).find(key => formatNama(key).toLowerCase() === formatNama(normalized).toLowerCase())
      if (labelMatch) return labelMatch
    }

    const fallback = normalizeFishKey(raw)
    return harga[fallback] ? fallback : null
  }

  let args = typeof text === 'string' ? text.trim().toLowerCase().split(/\s+/).filter(Boolean) : []
  let tipe = args[0]

  if (!args.length) {
    const cap = `╭─❏「 🎣 PASAR AVELIA 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Pasar adalah tempat menjual ikan dan barang hasil memancing.\n\n` +
      `> ↳ Lihat daftar command: *${usedPrefix}pasar command*\n` +
      `> ↳ Baca panduan/tutorial: *${usedPrefix}pasar guide*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'command') {
    const cap = `╭─❏「 📋 COMMAND PASAR 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${usedPrefix}pasar list\n` +
      `> ${usedPrefix}pasar jual <no/nama> <jumlah/all>\n` +
      `> ${usedPrefix}pasar jual all\n` +
      `> ${usedPrefix}pasar guide\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'guide') {
    const cap = `╭─❏「 🧭 PANDUAN PASAR 」❏\n` +
      `│ 🎣 Jual ikan, barang hasil memancing, dan sampah pendakian.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat daftar item dan harga: *${usedPrefix}pasar list*\n` +
      `> ↳ Jual item: *${usedPrefix}pasar jual <no/nama> <jumlah/all>*\n` +
      `> ↳ Jual semua ikan dan sampah pendakian: *${usedPrefix}pasar jual all*\n` +
      `> ↳ Mulai memancing: *${usedPrefix}mancing*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe === 'list') {
    let cap = `╭─❏「 🎣 DAFTAR PASAR 」❏\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ 👤 ${isPrem ? 'Premium +10% jual' : 'User biasa'}\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `🐟 *DAFTAR HARGA JUAL*\n`
    cap += `> ↳ Daftar mencakup ikan dan sampah pendakian dari tas.\n\n`
    keys.forEach((k, i) => {
      const hargaJual = Math.floor(harga[k].harga * sellBonus)
      cap += `*${i + 1}. ${formatNama(k)} ${harga[k].emoji}*\n`
      cap += `> Buy : -\n`
      cap += `> Sell : Rp ${hargaJual.toLocaleString()}\n\n`
    })
    cap += `\n─━━━━━━━━━━━━━━─`
    return m.reply(cap)
  }

  if (tipe !== 'jual') return m.reply(`❌ Pakai: *${usedPrefix}pasar jual <no/nama> <jumlah/all>*`)
  args = args.slice(1)

  if (['ya', 'yes', 'batal', 'no'].includes(args[0])) {
    const pending = user.pendingPasarSell
    if (!pending || Date.now() > pending.expiresAt) {
      delete user.pendingPasarSell
      saveDB(wdb)
      return m.reply('❌ Konfirmasi jual pasar tidak ada atau sudah kedaluwarsa. Ulangi perintah jual.')
    }
    if (['batal', 'no'].includes(args[0])) {
      delete user.pendingPasarSell
      saveDB(wdb)
      return m.reply('✅ Penjualan ikan dibatalkan. Stok dan saldo tidak berubah.')
    }
    if (pending.entries.some(entry => {
      const inventory = entry.bucket === 'inventory' ? user.inventory : user.ikan
      return (Number(inventory[entry.item]) || 0) < entry.quantity
    })) {
      delete user.pendingPasarSell
      saveDB(wdb)
      return m.reply('❌ Stok berubah sejak konfirmasi dibuat. Penjualan dibatalkan; buat konfirmasi baru.')
    }
    for (const entry of pending.entries) {
      const inventory = entry.bucket === 'inventory' ? user.inventory : user.ikan
      inventory[entry.item] -= entry.quantity
      if (inventory[entry.item] <= 0) delete inventory[entry.item]
    }
    wdb.money[m.sender] = (Number(wdb.money[m.sender]) || 0) + pending.total
    delete user.pendingPasarSell
    saveDB(wdb)
    return m.reply(
      `╭─❏「 🎣 PENJUALAN PASAR BERHASIL 」❏\n` +
      `│ ✅ ${pending.entries.length} jenis ikan terjual\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ 💰 Diterima: +Rp ${pending.total.toLocaleString()}\n` +
      `> ↳ 💵 Saldo: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (args[0] === 'all') {
    const entries = Object.entries(user.ikan)
      .filter(([item, quantity]) => harga[item] && Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0)
      .map(([item, quantity]) => ({ item, quantity: Number(quantity), bucket: 'ikan' }))
    entries.push(...MOUNT_TRASH
      .filter(({ id }) => harga[id] && Number.isSafeInteger(Number(user.inventory[id])) && Number(user.inventory[id]) > 0)
      .map(({ id }) => ({ item: id, quantity: Number(user.inventory[id]), bucket: 'inventory' })))
    if (!entries.length) return m.reply(`❌ Kamu tidak punya ikan yang bisa dijual.`)

    const baseTotal = entries.reduce((total, entry) => total + Math.floor(harga[entry.item].harga * sellBonus) * entry.quantity, 0)
    const total = scaleDifficultyIncome(user, baseTotal)
    user.pendingPasarSell = { entries, total, expiresAt: Date.now() + RPG_CONFIRMATION_TTL }
    saveDB(wdb)
    const list = entries.map(({ item, quantity }) => `> ↳ ${harga[item].emoji} ${formatNama(item)} x${quantity}`).join('\n')
    return m.reply(
      `╭─❏「 ⚠️ KONFIRMASI JUAL IKAN 」❏\n` +
      `│ 📦 ${entries.length} jenis ikan/sampah akan dijual\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${list}\n\n` +
      `> ↳ Perkiraan diterima: Rp ${total.toLocaleString()}\n\n` +
      `✅ Ketik *${usedPrefix}pasar jual ya* untuk lanjut\n` +
      `❌ Ketik *${usedPrefix}pasar jual batal* untuk membatalkan\n` +
      `⏳ Konfirmasi berlaku 5 menit.\n\n─━━━━━━━━━━━━━━─`
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

  const rawLookup = (args || []).join(' ') || 'yang kamu masukkan'
  if (!itemInput || !harga[itemInput]) return m.reply(`❌ Item "${String(rawLookup).trim()}" tidak ada di list.\nLihat: *${usedPrefix}pasar list*`)

  const bucket = MOUNT_TRASH.some(({ id }) => id === itemInput) ? 'inventory' : 'ikan'
  const itemStock = bucket === 'inventory' ? user.inventory : user.ikan
  let stok = itemStock[itemInput] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(itemInput)}`)

  let jual = amount === 'all' ? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

if (amount === 'all') {
  const total = scaleDifficultyIncome(user, Math.floor(harga[itemInput].harga * sellBonus) * jual)

  user.pendingPasarSell = {
    entries: [{ item: itemInput, quantity: jual, bucket }],
    total,
    expiresAt: Date.now() + RPG_CONFIRMATION_TTL
  }

  saveDB(wdb)

  return m.reply(
    `╭─❏「 🛒 KONFIRMASI JUAL 」❏\n` +
    `│ 🛒 *JUAL DI PASAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Item : ${formatNama(itemInput)}\n` +
    `> ↳ Jumlah : x${jual}\n` +
    `> ↳ Total : Rp ${total.toLocaleString()}\n` +
    `> ↳ Konfirmasi berlaku 5 menit.\n\n` +
    `📌 *KONFIRMASI*\n` +
    `> ↳ Ketik *${usedPrefix}pasar jual ya* untuk lanjut.\n` +
    `> ↳ Ketik *${usedPrefix}pasar jual batal* untuk membatalkan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  let hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
  itemStock[itemInput] -= jual
  if (itemStock[itemInput] <= 0) delete itemStock[itemInput]
  hasil = scaleDifficultyIncome(user, hasil)
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

handler.help = ['pasar', 'pasar command', 'pasar list', 'pasar guide', 'pasar jual <no/nama> <jumlah/all>', 'pasar jual all', 'tokoikan']
handler.tags = ['rpg']
handler.command = /^(pasar|tokoikan|jualikan)$/i
handler.alias = ['pasar', 'tokoikan', 'jualikan']
handler.group = true
export default handler