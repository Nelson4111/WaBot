import { sendRpgButtons, sendRpgConfirmButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG, sendRpgMsg, setRpgFeatureImage } from '../../lib/waifuHelper.js'
import {
  findRpgFishBait,
  fishRenameMap,
  ikanEmoji,
  normalizeFishKey,
  migrateLegacyFishInventory,
  RPG_FISH_BAITS,
  RPG_FISH_TIERS
} from '../../lib/rpg-fishCatalog.js'
import { scaleDifficultyIncome } from '../../lib/rpgDifficulty.js'
import { MOUNT_TRASH } from '../../lib/mountData.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'
import { ensureFishDetails, getFishPriceMultiplier, getFishRecords, isTrashFish, removeFishRecords } from '../../lib/rpg-fishSizes.js'

const PASAR_IMAGE = 'https://c.termai.cc/i113/GBR.jpg'

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

let handler = async (m, { conn, text, usedPrefix }) => {
  m = setRpgFeatureImage(conn, m, PASAR_IMAGE)
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')
  if (!user.ikan) user.ikan = {}
  if (!user.inventory) user.inventory = {}

  user.ikan = migrateLegacyFishInventory(user.ikan)
  if (ensureFishDetails(user)) await saveDB(wdb)

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

  const getFishBasePrice = (item, records, bonus = sellBonus) =>
    records.reduce((total, fish) =>
      total + Math.floor(harga[item].harga * bonus * getFishPriceMultiplier(fish.size)), 0)
  const getAvailableFish = item => getFishRecords(user, item).filter(fish => !fish.favorite)

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

  if (tipe === 'bait' || tipe === 'umpan') {
    user.fishBaits ||= {}
    const action = args[1] || 'list'
    if (['list', 'shop', 'toko'].includes(action)) {
      const rows = RPG_FISH_BAITS.map((bait, index) => ({
        title: bait.name.slice(0, 24),
        description: 'Lihat detail umpan',
        id: `${usedPrefix}pasar bait info ${index + 1}`
      }))
      const names = RPG_FISH_BAITS.map(bait => `> ${bait.name}`).join('\n')
      return sendRpgButtons(conn, {
        chat: m.chat,
        message: m,
        quoted: m,
        title: '🪱 DAFTAR UMPAN',
        subtitle: 'Pilih nama untuk melihat detail',
        text: `Daftar umpan:\n${names}\n\nPilih tombol umpan untuk melihat info dan harga.`,
        buttonText: 'PILIH UMPAN',
        sections: [{ title: 'Umpan tersedia', rows }],
        fallbackText:
          `╭─❏「 🪱 DAFTAR UMPAN 」❏\n` +
          `╰─━━━━━━━━━━━━━━─\n\n${names}\n\n` +
          `Detail: *${usedPrefix}pasar bait info <nomor/nama>*`,
        reply: fallback => m.reply(fallback)
      })
    }

    if (action === 'info') {
      const selection = args.slice(2).join(' ')
      const bait = /^\d+$/.test(selection)
        ? RPG_FISH_BAITS[Number(selection) - 1]
        : findRpgFishBait(selection)
      if (!bait) return m.reply(`Umpan tidak ditemukan. Lihat *${usedPrefix}pasar bait*.`)
      return m.reply(
        `╭─❏「 ${bait.emoji} INFO UMPAN 」❏\n` +
        `│ *${bait.name}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Efek: ${bait.description}\n` +
        `> ↳ Harga: Rp ${bait.price.toLocaleString('id-ID')} / buah\n` +
        `> ↳ Stokmu: ${Math.max(0, Math.floor(Number(user.fishBaits[bait.id]) || 0))}\n\n` +
        `Beli: *${usedPrefix}pasar bait buy ${bait.id} [jumlah]*`
      )
    }

    if (['yes', 'ya', 'no', 'tidak'].includes(action)) {
      const pending = user.pendingBaitPurchase
      if (!pending || Date.now() > pending.expiresAt) {
        delete user.pendingBaitPurchase
        await saveDB(wdb)
        return m.reply('⌛ Konfirmasi pembelian umpan tidak ditemukan atau sudah kedaluwarsa.')
      }
      delete user.pendingBaitPurchase
      if (['no', 'tidak'].includes(action)) {
        await saveDB(wdb)
        return m.reply('✅ Pembelian umpan dibatalkan.')
      }
      const bait = findRpgFishBait(pending.baitId)
      const amount = Number(pending.amount)
      const total = Number(pending.total)
      if (!bait || !Number.isSafeInteger(amount) || amount < 1 ||
        !Number.isSafeInteger(total) || total !== bait.price * amount ||
        (Number(wdb.money[m.sender]) || 0) < total) {
        await saveDB(wdb)
        return m.reply('❌ Saldo atau data pembelian berubah. Ulangi pembelian umpan.')
      }
      wdb.money[m.sender] -= total
      user.fishBaits[bait.id] = Math.max(0, Math.floor(Number(user.fishBaits[bait.id]) || 0)) + amount
      await saveDB(wdb)
      return m.reply(`✅ Berhasil membeli ${amount}x *${bait.name}* seharga Rp ${total.toLocaleString('id-ID')}.`)
    }

    if (action === 'buy' || action === 'beli') {
      const values = args.slice(2)
      let amount = 1
      if (values.length > 1 && /^\d+$/.test(values[values.length - 1])) {
        amount = Number(values.pop())
      }
      const selection = values.join(' ')
      const bait = /^\d+$/.test(selection)
        ? RPG_FISH_BAITS[Number(selection) - 1]
        : findRpgFishBait(selection)
      if (!bait) return m.reply(`Umpan tidak ditemukan. Lihat *${usedPrefix}pasar bait*.`)
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100000) {
        return m.reply('Jumlah pembelian harus 1-100000.')
      }
      const total = bait.price * amount
      if (!Number.isSafeInteger(total)) return m.reply('Total pembelian terlalu besar.')
      if ((Number(wdb.money[m.sender]) || 0) < total) {
        return m.reply(`Saldo tidak cukup. Total pembelian: Rp ${total.toLocaleString('id-ID')}.`)
      }
      user.pendingBaitPurchase = {
        baitId: bait.id,
        amount,
        total,
        expiresAt: Date.now() + RPG_CONFIRMATION_TTL
      }
      await saveDB(wdb)
      return sendRpgConfirmButtons(conn, m, {
        text:
          `🪱 Beli ${amount}x *${bait.name}* seharga Rp ${total.toLocaleString('id-ID')}?\n` +
          `Konfirmasi: *${usedPrefix}pasar bait yes* · Batalkan: *${usedPrefix}pasar bait no*`,
        title: 'KONFIRMASI PEMBELIAN UMPAN',
        subtitle: `${bait.name} ×${amount}`,
        acceptText: '✅ Beli Umpan',
        acceptCommand: `${usedPrefix}pasar bait yes`,
        cancelText: '↩️ Batalkan',
        cancelCommand: `${usedPrefix}pasar bait no`
      })
    }

    return m.reply(`Gunakan *${usedPrefix}pasar bait*, *${usedPrefix}pasar bait info <nomor/nama>*, atau *${usedPrefix}pasar bait buy <nomor/nama> [jumlah]*.`)
  }

  if (!args.length) {
    const cap = `╭─❏「 🎣 PASAR AVELIA 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Pasar adalah tempat menjual ikan dan barang hasil memancing.\n\n` +
      `> ↳ Lihat daftar command: *${usedPrefix}pasar command*\n` +
      `> ↳ Baca panduan/tutorial: *${usedPrefix}pasar guide*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return sendRpgMsg(conn, m, cap, PASAR_IMAGE)
  }

  if (tipe === 'command') {
    const fallbackText = `╭─❏「 📋 COMMAND PASAR 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${usedPrefix}pasar list\n` +
      `> ${usedPrefix}pasar bait\n` +
      `> ${usedPrefix}pasar bait info <nomor/nama>\n` +
      `> ${usedPrefix}pasar bait buy <nomor/nama> [jumlah]\n` +
      `> ${usedPrefix}pasar tier\n` +
      `> ${usedPrefix}pasar jual <no/nama> <jumlah/all>\n` +
      `> ${usedPrefix}pasar jual tier <kategori> [jumlah/all]\n` +
      `> ${usedPrefix}pasar jual all\n` +
      `> ${usedPrefix}pasar guide\n\n` +
      `─━━━━━━━━━━━━━━─`
    const rows = [
      { title: '🐟 Hasil tangkapan', description: 'Lihat ikan, hasil mancing, dan harga jual', id: `${usedPrefix}pasar list` },
      { title: '🪱 Beli umpan', description: 'Lihat umpan untuk memancing', id: `${usedPrefix}pasar bait` },
      { title: '🏷️ Jual berdasarkan tier', description: 'Pilih kategori ikan yang ingin dijual', id: `${usedPrefix}pasar tier` },
      { title: '🎣 Jual hasil mancing', description: 'Pilih item untuk ditukar menjadi uang', id: `${usedPrefix}pasar jual` },
      { title: '📦 Jual seluruh stok', description: 'Jual semua ikan dan sampah pendakian', id: `${usedPrefix}pasar jual all` },
      { title: '🎣 Mulai memancing', description: 'Kumpulkan tangkapan baru untuk dijual', id: `${usedPrefix}mancing` },
      { title: '📖 Panduan pasar', description: 'Pelajari harga dan cara menjual hasil', id: `${usedPrefix}pasar guide` }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat, message: m, quoted: m,
      title: '🐟 PASAR AVELIA',
      subtitle: 'Jual hasil tangkapan dan jelajahi harga',
      text: 'Pilih ikan atau hasil pendakian yang ingin kamu perdagangkan.',
      buttonText: '🐟 BUKA PASAR',
      sections: [{ title: 'Hasil memancing', rows }],
      fallbackText,
      thumbnailUrl: PASAR_IMAGE
    })
  }

  if (tipe === 'guide') {
    const cap = `╭─❏「 🧭 PANDUAN PASAR 」❏\n` +
      `│ 🎣 Jual ikan, barang hasil memancing, dan sampah pendakian.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat daftar item dan harga: *${usedPrefix}pasar list*\n` +
      `> ↳ Beli umpan: *${usedPrefix}pasar bait*\n` +
      `> ↳ Jual item: *${usedPrefix}pasar jual <no/nama> <jumlah/all>*\n` +
      `> ↳ Jual ikan berdasarkan tier: *${usedPrefix}pasar jual tier <kategori> [jumlah/all]*\n` +
      `> ↳ Jual semua ikan dan sampah pendakian: *${usedPrefix}pasar jual all*\n` +
      `> ↳ Daftar tier: *${usedPrefix}pasar tier*\n` +
      `> ↳ Mulai memancing: *${usedPrefix}mancing*\n\n` +
      `─━━━━━━━━━━━━━━─`
    return sendRpgMsg(conn, m, cap, PASAR_IMAGE)
  }

  if (tipe === 'tier') {
    return m.reply(
      `╭─❏「 🐟 TIER PASAR 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      RPG_FISH_TIERS.map(tier =>
        `> ${tier.icon} ${tier.name}`
      ).join('\n') +
      `\n\nJual semua ikan tier: *${usedPrefix}pasar jual tier <kategori>*\n` +
      `Jual sejumlah ikan: *${usedPrefix}pasar jual tier <kategori> <jumlah>*`
    )
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
    return sendRpgMsg(conn, m, cap, PASAR_IMAGE)
  }

  if (tipe !== 'jual') {
    return m.reply(
      `❌ Pakai: *${usedPrefix}pasar jual <no/nama> <jumlah/all>* atau ` +
      `*${usedPrefix}pasar jual tier <kategori> [jumlah/all]*`
    )
  }
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
      if (entry.bucket === 'inventory' || isTrashFish(entry.item)) {
        return (Number(inventory[entry.item]) || 0) < entry.quantity
      }
      const records = getFishRecords(user, entry.item)
      const ids = new Set(records.filter(record => !record.favorite).map(record => record.id))
      return (entry.fishIds || []).some(id => !ids.has(id)) ||
        (!entry.fishIds && ids.size < entry.quantity)
    })) {
      delete user.pendingPasarSell
      saveDB(wdb)
      return m.reply('❌ Stok berubah sejak konfirmasi dibuat. Penjualan dibatalkan; buat konfirmasi baru.')
    }
    for (const entry of pending.entries) {
      if (entry.bucket === 'ikan' && !isTrashFish(entry.item)) {
        removeFishRecords(user, entry.item, entry.quantity, { ids: entry.fishIds })
        continue
      }
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

  if (args[0] === 'tier') {
    const selectedTier = RPG_FISH_TIERS.find(tier => tier.name === String(args[1] || '').toUpperCase())
    if (!selectedTier) {
      return m.reply(`Kategori tier tidak ditemukan. Lihat *${usedPrefix}pasar tier*.`)
    }
    const quantityInput = String(args[2] || 'all').toLowerCase()
    const requestedAmount = quantityInput === 'all' ? Infinity : Number(quantityInput)
    if (requestedAmount !== Infinity && (!Number.isSafeInteger(requestedAmount) || requestedAmount < 1)) {
      return m.reply('Jumlah penjualan harus berupa angka positif atau `all`.')
    }

    const candidates = []
    const seenItems = new Set()
    for (const rawName of selectedTier.fish) {
      const item = normalizeFishKey(rawName)
      if (seenItems.has(item) || !harga[item]) continue
      seenItems.add(item)
      if (isTrashFish(item)) {
        const quantity = Math.max(0, Math.floor(Number(user.ikan[item]) || 0))
        if (quantity) candidates.push({
          item,
          quantity,
          bucket: 'ikan',
          itemTotal: Math.floor(harga[item].harga * sellBonus) * quantity
        })
        continue
      }
      const fish = getAvailableFish(item)
      if (fish.length) candidates.push({
        item,
        quantity: fish.length,
        bucket: 'ikan',
        fishIds: fish.map(record => record.id),
        itemTotal: getFishBasePrice(item, fish)
      })
    }

    const availableAmount = candidates.reduce((total, entry) => total + entry.quantity, 0)
    if (!availableAmount) return m.reply(`Kamu tidak punya ikan tier ${selectedTier.name} yang bisa dijual.`)
    if (requestedAmount !== Infinity && requestedAmount > availableAmount) {
      return m.reply(`Stok tier ${selectedTier.name} tidak cukup. Kamu punya ${availableAmount} ikan yang bisa dijual.`)
    }

    let remaining = requestedAmount
    const entries = candidates.flatMap(candidate => {
      if (remaining <= 0) return []
      const quantity = Math.min(candidate.quantity, remaining)
      remaining -= quantity
      if (quantity === candidate.quantity) return [candidate]
      if (isTrashFish(candidate.item)) {
        return [{
          item: candidate.item,
          quantity,
          bucket: 'ikan',
          itemTotal: Math.floor(harga[candidate.item].harga * sellBonus) * quantity
        }]
      }
      const fishIds = candidate.fishIds.slice(0, quantity)
      const selectedFish = getFishRecords(user, candidate.item)
        .filter(record => fishIds.includes(record.id))
      return [{
        item: candidate.item,
        quantity,
        bucket: 'ikan',
        fishIds,
        itemTotal: getFishBasePrice(candidate.item, selectedFish)
      }]
    })
    const baseTotal = entries.reduce((total, entry) => total + entry.itemTotal, 0)
    const total = scaleDifficultyIncome(user, baseTotal)
    user.pendingPasarSell = {
      entries,
      total,
      expiresAt: Date.now() + RPG_CONFIRMATION_TTL
    }
    await saveDB(wdb)
    const list = entries.map(entry =>
      `> ${harga[entry.item].emoji} ${formatNama(entry.item)} ×${entry.quantity}`
    ).join('\n')
    return sendRpgConfirmButtons(conn, m, {
      text:
        `╭─❏「 ⚠️ KONFIRMASI JUAL TIER 」❏\n` +
        `│ ${selectedTier.icon} Tier ${selectedTier.name}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${list}\n\n` +
        `> ↳ 💰 Perkiraan diterima: Rp ${total.toLocaleString()}\n\n` +
        `Konfirmasi: *${usedPrefix}pasar jual ya* · Batalkan: *${usedPrefix}pasar jual batal*`,
      title: `JUAL TIER ${selectedTier.name}`,
      subtitle: `${availableAmount} ikan tersedia`,
      acceptText: '💰 Jual Tier',
      acceptCommand: `${usedPrefix}pasar jual ya`,
      cancelText: '↩️ Batalkan',
      cancelCommand: `${usedPrefix}pasar jual batal`
    })
  }

  if (args[0] === 'all') {
    const entries = Object.entries(user.ikan)
      .filter(([item, quantity]) => harga[item] && Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0)
      .flatMap(([item, quantity]) => {
        if (isTrashFish(item)) {
          return [{ item, quantity: Number(quantity), bucket: 'ikan', itemTotal: Math.floor(harga[item].harga * sellBonus) * Number(quantity) }]
        }
        const available = getAvailableFish(item)
        if (!available.length) return []
        return [{
          item,
          quantity: available.length,
          bucket: 'ikan',
          fishIds: available.map(fish => fish.id),
          itemTotal: getFishBasePrice(item, available)
        }]
      })
    entries.push(...MOUNT_TRASH
      .filter(({ id }) => harga[id] && Number.isSafeInteger(Number(user.inventory[id])) && Number(user.inventory[id]) > 0)
      .map(({ id }) => ({ item: id, quantity: Number(user.inventory[id]), bucket: 'inventory', itemTotal: Math.floor(harga[id].harga * sellBonus) * Number(user.inventory[id]) })))
    if (!entries.length) return m.reply(`❌ Kamu tidak punya ikan yang bisa dijual.`)

    const baseTotal = entries.reduce((total, entry) => total + entry.itemTotal, 0)
    const total = scaleDifficultyIncome(user, baseTotal)
    user.pendingPasarSell = { entries, total, expiresAt: Date.now() + RPG_CONFIRMATION_TTL }
    saveDB(wdb)
    const list = entries.map(({ item, quantity }) => `> ↳ ${harga[item].emoji} ${formatNama(item)} x${quantity}`).join('\n')
    return sendRpgConfirmButtons(conn, m, {
      text: `╭─❏「 ⚠️ KONFIRMASI JUAL IKAN 」❏\n` +
      `│ 📦 ${entries.length} jenis ikan/sampah akan dijual\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${list}\n\n` +
      `> ↳ Perkiraan diterima: Rp ${total.toLocaleString()}\n\n` +
      `✅ Ketik *${usedPrefix}pasar jual ya* untuk lanjut\n` +
      `❌ Ketik *${usedPrefix}pasar jual batal* untuk membatalkan\n` +
      `⏳ Konfirmasi berlaku 5 menit.\n\n─━━━━━━━━━━━━━━─`,
      title: '🎣 PENAWARAN PASAR',
      subtitle: 'Lepas seluruh ikan dengan satu sentuhan',
      acceptText: '💰 Jual ke Pasar',
      acceptCommand: `${usedPrefix}pasar jual ya`,
      cancelText: '🎣 Simpan Hasil',
      cancelCommand: `${usedPrefix}pasar jual batal`
    })
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
  const fishRecords = bucket === 'ikan' && !isTrashFish(itemInput) ? getAvailableFish(itemInput) : []
  let stok = bucket === 'ikan' && !isTrashFish(itemInput) ? fishRecords.length : itemStock[itemInput] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(itemInput)}`)

  let jual = amount === 'all' ? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

if (amount === 'all') {
  const selectedRecords = fishRecords.slice(0, jual)
  const fishIds = selectedRecords.map(fish => fish.id)
  const baseTotal = bucket === 'ikan' && !isTrashFish(itemInput)
    ? getFishBasePrice(itemInput, selectedRecords)
    : Math.floor(harga[itemInput].harga * sellBonus) * jual
  const total = scaleDifficultyIncome(user, baseTotal)

  user.pendingPasarSell = {
    entries: [{ item: itemInput, quantity: jual, bucket, ...(fishIds.length ? { fishIds } : {}) }],
    total,
    expiresAt: Date.now() + RPG_CONFIRMATION_TTL
  }

  saveDB(wdb)

  return sendRpgConfirmButtons(conn, m, {
    text: `╭─❏「 🛒 KONFIRMASI JUAL 」❏\n` +
    `│ 🛒 *JUAL DI PASAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Item : ${formatNama(itemInput)}\n` +
    `> ↳ Jumlah : x${jual}\n` +
    `> ↳ Total : Rp ${total.toLocaleString()}\n` +
    `> ↳ Konfirmasi berlaku 5 menit.\n\n` +
    `📌 *KONFIRMASI*\n` +
    `> ↳ Ketik *${usedPrefix}pasar jual ya* untuk lanjut.\n` +
    `> ↳ Ketik *${usedPrefix}pasar jual batal* untuk membatalkan.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    title: '🎣 PENAWARAN PASAR',
    subtitle: 'Konfirmasikan penjualan hasil tangkapan',
    acceptText: '💰 Jual ke Pasar',
    acceptCommand: `${usedPrefix}pasar jual ya`,
    cancelText: '🎣 Simpan Hasil',
    cancelCommand: `${usedPrefix}pasar jual batal`
  })
}

  let hasil
  if (bucket === 'ikan' && !isTrashFish(itemInput)) {
    const selectedRecords = fishRecords.slice(0, jual)
    hasil = getFishBasePrice(itemInput, selectedRecords)
    removeFishRecords(user, itemInput, jual, { ids: selectedRecords.map(fish => fish.id) })
  } else {
    hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
    itemStock[itemInput] -= jual
    if (itemStock[itemInput] <= 0) delete itemStock[itemInput]
  }
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

handler.help = ['pasar', 'pasar command', 'pasar list', 'pasar tier', 'pasar guide', 'pasar jual <no/nama> <jumlah/all>', 'pasar jual tier <kategori> [jumlah/all]', 'pasar jual all', 'tokoikan']
handler.tags = ['rpg']
handler.command = /^(pasar|tokoikan|jualikan)$/i
handler.alias = ['pasar', 'tokoikan', 'jualikan']
handler.group = true
export default handler