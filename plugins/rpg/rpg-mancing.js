import { adjustDifficultyFailureChance, getDifficultyProfile, scaleDifficultyCooldown, scaleDifficultyXP } from '../../lib/rpgDifficulty.js'
import { loadDB, saveDB, addRpgExp } from '../../lib/waifuHelper.js'
import { generateFishingCard } from '../../lib/cardGenerator.js'
import { applyBloodlineBuff, getBloodlineBuff, getBloodlineDrawback } from '../../lib/rpgCharacterData.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { addFishRecord, ensureFishDetails, rollFishSize } from '../../lib/rpg-fishSizes.js'
import { getGroupTotemBuff } from '../../lib/rpg-totemData.js'
import {
  consumeRpgFishBait,
  findRpgFishBait,
  getActiveRpgFishBait,
  grantDailyNormalBait,
  rollRpgFishBaitReward,
  RPG_FISHING_STORIES
} from '../../lib/rpg-fishCatalog.js'

function formatNama(ikan) {
  const key = normalizeFishKey(ikan)
  const words = String(key || '').replace(/_/g, ' ').split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const fishRenameMap = {
  poseidon: 'poseidon', flying_dutchman: 'flying_dutchman', aquaman: 'aquaman', godzilla: 'godzilla', zeus_laut: 'thunderfish', atlas_laut: 'atlas', kitsune_laut: 'rubah_laut', leviathan_primordial: 'leviathan_primordial', davy_jones: 'davy_jones', caylpso: 'ikan_paradise',
  worm_fish: 'worm_fish', zombie_shark: 'zombie_shark', skeleton_shark: 'skeleton_shark', ariel_little_mermaid: 'putri_laut', treasure_chest: 'peti_harta', ancient_relic: 'artefak_laut', pirate_gold: 'emas_pirate', mermaid_tear: 'air_mata_putri', kraken: 'kraken', megladon: 'megalodon',
  leviathan: 'leviathan', sea_dragon: 'naga_laut', phoenix_laut: 'ikan_phoenix', hydra_laut: 'hydra', cerberus_laut: 'cerberus', titan_kura: 'kura_raksasa', paus_putih: 'paus_putih', ikan_dewa: 'dewa_laut', naga_laut: 'naga_laut_biru', raja_ubur: 'ubur_utama',
  penjaga_karang: 'penjaga_karang', putri_duyung: 'putri_duyung', dewa_katak: 'katak_berkilau', kuda_laut_kristal: 'kuda_kristal', peti_karun: 'peti_karun', koin_emas_kuno: 'koin_emas_kuno', mutiara_raja: 'mutiara_raja', mahkota_karang: 'mahkota_karang', hiu_putih: 'hiu_putih', hiu_harimau: 'hiu_macan',
  hiu_martil: 'hiu_palu', paus_orca: 'paus_orca', paus_biru: 'paus_biru', penyu_raksasa: 'penyu_raksasa', ikan_pari_manta: 'pari_manta', ikan_napoleon: 'napoleon', kerapu_raksasa: 'kerapu_raksasa', marlin: 'marlin', tuna_sirip_biru: 'tuna_biru', pedang_laut: 'pedang_laut',
  ikan_koi_emas: 'koi_emas', lobster_raja: 'lobster_raja', kepiting_raksasa: 'kepiting_raksasa', gurita_raksasa: 'gurita_raksasa', sotong_raksasa: 'sotong_raksasa', lionfish: 'lionfish', ikan_badut: 'ikan_badut', ikan_kupu: 'ikan_kupu', ikan_malaikat: 'ikan_malaikat', ikan_diskus: 'ikan_diskus',
  ikan_arwana: 'ikan_arwana', ikan_arapaima: 'ikan_arapaima', piranha: 'piranha', belut_listrik: 'belut_listrik', ikan_duyung: 'ikan_duyung', ubur_ubur_bulan: 'ubur_bulan', bintang_laut: 'bintang_laut', anemon_laut: 'anemon', karang_indah: 'karang_indah', kerang_mutia: 'kerang_mutia',
  siput_laut: 'siput_laut', landak_laut: 'landak_laut', peti_besi: 'peti_besi', koin_emas: 'koin_emas', mutiara_hitam: 'mutiara_hitam', trisula_patah: 'trisula_patah', hiu_hitam: 'hiu_hitam', hiu_biru: 'hiu_biru', lumba_lumba: 'lumba_lumba', paus_pembunuh: 'paus_pembunuh',
  penyu_hijau: 'penyu_hijau', ikan_pari: 'pari', kerapu: 'kerapu', tuna: 'tuna', salmon: 'salmon', barakuda: 'barakuda', ikan_todak: 'ikan_todak', ikan_terbang: 'ikan_terbang', ubur_ubur: 'ubur_ubur', ubur_ubur_listrik: 'ubur_listrik',
  bintang_laut_ungu: 'bintang_ungu', karang_keras: 'karang_keras', kerang: 'kerang', peti_kayu: 'peti_kayu', koin_perak: 'koin_perak', mutiara_biasa: 'mutiara_biasa', karang_antik: 'karang_antik', kaiju: 'kaiju', kadita: 'kadita'
}

function normalizeFishKey(name) {
  const key = String(name || '').trim().toLowerCase().replace(/\s+/g, '_')
  const normalized = fishRenameMap[key] || key
  const keepIkanPrefix = new Set(['ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'ikan_todak', 'ikan_terbang', 'ikan_duyung', 'ikan_paradise'])
  return keepIkanPrefix.has(normalized) ? normalized : normalized.replace(/^ikan_/, '')
}

const fishNameAliases = {
  'rubah_laut': 'rubah laut',
  'kura_raksasa': 'kura raksasa',
  'dewa_laut': 'dewa laut',
  'naga_laut_biru': 'naga laut biru',
  'ubur_utama': 'ubur utama',
  'putri_duyung': 'putri duyung',
  'katak_berkilau': 'katak berkilau',
  'kuda_kristal': 'kuda kristal',
  'koi_emas': 'koi emas',
  'lobster_raja': 'lobster raja',
  'kepiting_raksasa': 'kepiting raksasa',
  'gurita_raksasa': 'gurita raksasa',
  'sotong_raksasa': 'sotong raksasa',
  'tuna_biru': 'tuna biru',
  'koin_emas_kuno': 'koin emas kuno',
  'mutiara_raja': 'mutiara raja',
  'mahkota_karang': 'mahkota karang',
  'lumba_lumba': 'lumba lumba',
  'paus_pembunuh': 'paus pembunuh',
  'bintang_ungu': 'bintang ungu',
  'bintang_laut': 'bintang laut',
  'air_mata_putri': 'air mata putri',
  'koin_emas': 'koin emas',
  'koin_perak': 'koin perak',
  'batu': 'batu',
  'jaring_rusak': 'jaring rusak'
}

function fishDisplayName(key) {
  const raw = String(key || '').trim().toLowerCase().replace(/\s+/g, '_')
  const normalized = normalizeFishKey(raw)
  const label = fishNameAliases[normalized] || normalized.replace(/_/g, ' ')
  const words = label.split(/\s+/).filter(Boolean).slice(0, 2)
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function migrateLegacyFishInventory(ikanObj = {}) {
  const migrated = {}
  for (const key in ikanObj) {
    const rawKey = String(key || '').trim().toLowerCase()
    const targetKey = normalizeFishKey(rawKey.replace(/\s+/g, '_'))
    migrated[targetKey] = (migrated[targetKey] || 0) + Number(ikanObj[key] || 0)
  }
  return migrated
}

const ikanEmoji = {
  ikan_aurora: '🌊', ikan_kapal_hantu: '⚓', ikan_pahlawan: '🛡️', ikan_kaiju: '🐉', ikan_petir: '⚡', ikan_puncak: '🏔️', ikan_rubah_laut: '🦊', ikan_leviathan_primordial: '🐉', ikan_kapten_hitam: '🦑', ikan_laut_biru: '💧',
  ikan_putri_laut: '🌊', peti_harta: '💎', artefak_laut: '🏺', emas_pirate: '💰', air_mata_putri: '💧', ikan_kraken: '🦑', ikan_megalodon: '🦈', ikan_leviathan: '🐉', ikan_leviathan_primordial: '🐉', ikan_naga_laut: '🐲',
  ikan_berapi: '🔥', worm_fish: '🪱', zombie_shark: '🦈', skeleton_shark: '🦴', ikan_hidra: '🐍', ikan_cerberus: '🐺', ikan_kura_raksasa: '🐢', ikan_paus_putih: '🐋', ikan_dewa_laut: '✨', ikan_naga_laut_biru: '🐉',
  ikan_ubur_utama: '👑', ikan_penjaga_karang: '🪸', ikan_putri_duyung: '💎', ikan_katak_berkilau: '🐸', ikan_kuda_kristal: '🐴', peti_karun: '💰', koin_emas_kuno: '🪙', mutiara_raja: '👑', mahkota_karang: '👑', ikan_hiu_putih: '🦈',
  ikan_hiu_macan: '🦈', ikan_hiu_palu: '🦈', ikan_paus_orca: '🐋', ikan_paus_biru: '🐋', ikan_penyu_raksasa: '🐢', ikan_pari_manta: '🪼', ikan_napoleon: '🐟', ikan_kerapu_raksasa: '🐟', ikan_marlin: '🐟', ikan_tuna_biru: '🐟',
  ikan_pedang_laut: '⚔️', ikan_koi_emas: '🐟', lobster_raja: '🦞', kepiting_raksasa: '🦀', gurita_raksasa: '🐙', sotong_raksasa: '🦑', ikan_lionfish: '🐠', ikan_badut: '🐠', ikan_kupu: '🐠', ikan_malaikat: '🐠',
  ikan_diskus: '🐠', ikan_arwana: '🐟', ikan_arapaima: '🐟', ikan_piranha: '🐟', ikan_belut_listrik: '🐍', ikan_ubur_bulan: '🌙', ikan_bintang_laut: '⭐', ikan_anemon: '🌸', karang_indah: '🪸', kerang_mutia: '🐚',
  ikan_siput_laut: '🐌', ikan_landak_laut: '🦔', peti_besi: '📦', koin_emas: '🪙', mutiara_hitam: '⚫', trisula_patah: '🔱', ikan_hiu_hitam: '🦈', ikan_hiu_biru: '🦈', ikan_lumba_lumba: '🐬', ikan_paus_pembunuh: '🐋',
  ikan_penyu_hijau: '🐢', ikan_pari: '🪼', ikan_kerapu: '🐟', ikan_tuna: '🐟', ikan_salmon: '🐟', ikan_barakuda: '🐟', ikan_todak: '🐟', ikan_terbang: '🐟', ikan_ubur: '🪼', ikan_ubur_listrik: '⚡',
  ikan_bintang_ungu: '⭐', karang_keras: '🪸', kerang: '🐚', peti_kayu: '🪵', koin_perak: '🪙', mutiara_biasa: '⚪', karang_antik: '🪸', kakap: '🐟', kerapu_kecil: '🐟', sarden: '🐟',
  makarel: '🐟', kembung: '🐟', tongkol: '🐟', cumi: '🦑', gurita_kecil: '🐙', udang: '🦐', kepiting: '🦀', lobster: '🦞', kerang_hijau: '🐚', kerang_darah: '🐚',
  siput: '🐌', landak_laut_kecil: '🦔', anemon: '🌸', rumput_laut: '🌿', karang: '🪸', peti_karat: '📦', koin_tembaga: '🪙', mutiara_retak: '🐚', cangkir_pecah: '🏺', ikan_mas: '🐟',
  sea_serpent: '🐍',
  ikan_nila: '🐟', ikan_lele: '🐟', ikan_patin: '🐟', ikan_gurame: '🐟', ikan_mujair: '🐟', ikan_gabus: '🐟', ikan_wader: '🐟', ikan_seluang: '🐟', ikan_teri: '🐟', ikan_pepetek: '🐟',
  ikan_layang: '🐟', ikan_kembung_kecil: '🐟', ikan_selar: '🐟', ikan_tembang: '🐟', ikan_julung: '🐟', sampah_plastik: '🗑️', ban_bekas: '🛞', botol_kaca: '🍶', kaleng: '🥫', kayu_hanyut: '🪵',
  jaring_rusak: '🕸️', sepatu: '👟', botol: '🍶', kantong_plastik: '🛍️', duri: '🌵', batu: '🪨', rumput: '🌿', lumpur: '🟤', daun: '🍃', ranting: '🌿',
  tali: '🪢', kawat: '🔩', pecahan_kaca: '💔', kaos_kaki: '🧦', mie_instan: '🍜', pakaian_dalam: '🩲'
}

let secret = ['ikan_aurora', 'ikan_kapal_hantu', 'ikan_pahlawan', 'ikan_kaiju', 'ikan_petir', 'ikan_puncak', 'ikan_rubah_laut', 'ikan_leviathan_primordial', 'ikan_kapten_hitam', 'ikan_laut_biru', 'ikan_putri_laut', 'peti_harta', 'artefak_laut', 'emas_pirate', 'air_mata_putri'];
let mythic = ['ikan_kraken', 'ikan_megalodon', 'ikan_leviathan', 'ikan_naga_laut', 'sea_serpent', 'ikan_berapi', 'ikan_hidra', 'ikan_cerberus', 'ikan_kura_raksasa', 'ikan_paus_putih', 'ikan_dewa_laut', 'ikan_naga_laut_biru', 'ikan_ubur_utama', 'ikan_penjaga_karang', 'ikan_putri_duyung', 'ikan_katak_berkilau', 'ikan_kuda_kristal', 'peti_karun', 'koin_emas_kuno', 'mutiara_raja', 'mahkota_karang'];
let legendary = ['ikan_hiu_putih', 'ikan_hiu_macan', 'ikan_hiu_palu', 'ikan_paus_orca', 'ikan_paus_biru', 'ikan_penyu_raksasa', 'ikan_pari_manta', 'ikan_napoleon', 'ikan_kerapu_raksasa', 'ikan_marlin', 'ikan_tuna_biru', 'ikan_pedang_laut', 'ikan_koi_emas', 'lobster_raja', 'kepiting_raksasa', 'gurita_raksasa', 'sotong_raksasa', 'ikan_lionfish', 'ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'ikan_piranha', 'ikan_belut_listrik', 'ikan_putri_laut', 'ikan_ubur_bulan', 'ikan_bintang_laut', 'ikan_anemon', 'karang_indah', 'kerang_mutia', 'ikan_siput_laut', 'ikan_landak_laut', 'peti_besi', 'koin_emas', 'mutiara_hitam', 'trisula_patah', 'worm_fish', 'zombie_shark', 'skeleton_shark'];
let epic = ['ikan_hiu_hitam', 'ikan_hiu_biru', 'ikan_lumba_lumba', 'ikan_paus_pembunuh', 'ikan_penyu_hijau', 'ikan_pari', 'ikan_kerapu', 'ikan_tuna', 'ikan_salmon', 'ikan_barakuda', 'ikan_todak', 'ikan_terbang', 'ikan_ubur', 'ikan_ubur_listrik', 'ikan_bintang_ungu', 'karang_keras', 'kerang', 'peti_kayu', 'koin_perak', 'mutiara_biasa', 'karang_antik'];
let rare = ['kakap', 'kerapu_kecil', 'sarden', 'makarel', 'kembung', 'tongkol', 'cumi', 'gurita_kecil', 'udang', 'kepiting', 'lobster', 'kerang_hijau', 'kerang_darah', 'siput', 'landak_laut_kecil', 'anemon', 'rumput_laut', 'karang', 'peti_karat', 'koin_tembaga', 'mutiara_retak', 'cangkir_pecah'];
let uncommon = ['ikan_mas', 'ikan_nila', 'ikan_lele', 'ikan_patin', 'ikan_gurame', 'ikan_mujair', 'ikan_gabus', 'ikan_wader', 'ikan_seluang'];
let common = ['ikan_teri', 'ikan_pepetek', 'ikan_layang', 'ikan_kembung_kecil', 'ikan_selar', 'ikan_tembang', 'ikan_julung'];
let trash = ['sampah_plastik', 'ban_bekas', 'botol_kaca', 'kaleng', 'kayu_hanyut', 'jaring_rusak', 'sepatu', 'botol', 'kantong_plastik', 'duri', 'batu', 'rumput', 'lumpur', 'daun', 'ranting', 'tali', 'kawat', 'pecahan_kaca', 'kaos_kaki', 'mie_instan', 'pakaian_dalam', 'gelas_plastik', 'sedotan', 'sumpit', 'piring', 'stik_es', 'serabut', 'cangkang', 'sandal', 'kapal_mainan', 'sisir_kayu', 'topi', 'tutup_botol'];

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')
  if (!user.ikan) user.ikan = {}

  user.ikan = migrateLegacyFishInventory(user.ikan)
  ensureFishDetails(user)
  user.fishBaits ||= {}
  const dailyBait = grantDailyNormalBait(user)
  const activeBait = getActiveRpgFishBait(user)
  if (dailyBait) await saveDB(wdb)

  for (const ikanLama in user.ikan) {
    if (ikanLama.includes(' ')) {
      const ikanBaru = ikanLama.replace(/ /g, '_')
      user.ikan[ikanBaru] = (user.ikan[ikanBaru] || 0) + (user.ikan[ikanLama] || 0)
      delete user.ikan[ikanLama]
    }
  }

  const murkyWaters = isRpgEventActive('murky_waters')
  const luckyCatch = isRpgEventActive('lucky_catch')
  const secretAwakening = isRpgEventActive('secret_awakening')
  const doubleCatch = isRpgEventActive('double_catch')
  const giantFish = isRpgEventActive('giant_fish')
  const cooldownBuff = getGroupTotemBuff(wdb.data, m.chat, 'fishing', 'cooldown')
  const yieldBuff = getGroupTotemBuff(wdb.data, m.chat, 'fishing', 'yield')
  const rareBuff = getGroupTotemBuff(wdb.data, m.chat, 'fishing', 'rareChance')
  const xpBuff = getGroupTotemBuff(wdb.data, m.chat, 'fishing', 'xp')
  let cooldown = Math.floor(scaleDifficultyCooldown(user, 60000) * (murkyWaters ? 1.25 : 1) * cooldownBuff)
  if (!activeBait) {
    return m.reply(`🎣 Umpanmu habis. Beli umpan di *${usedPrefix}pasar bait* lalu pilih lewat *${usedPrefix}fish bait*.`)
  }
  if (Date.now() - (user.lastMancing || 0) < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - user.lastMancing)) / 1000)
    return m.reply(`Sabar, ikan belum makan umpan. Tunggu ${sisa} detik lagi`)
  }

  const baitUseCounts = new Map()
  const consumeBait = () => {
    const bait = consumeRpgFishBait(user)
    if (bait) baitUseCounts.set(bait.id, (baitUseCounts.get(bait.id) || 0) + 1)
    return bait
  }
  const firstBait = activeBait
  const rollCatchSize = effects => {
    const giantChance = giantFish
      ? Math.min(0.05, 0.005 * (Number(effects.giantChanceMultiplier) || 1))
      : 0
    const rolledSize = rollFishSize({ giantAllowed: giantFish, giantChance })
    if (rolledSize === 'giant') return rolledSize
    return effects.forcedSize || rolledSize
  }

  if (!firstBait.effects.preventFailure && Math.random() < adjustDifficultyFailureChance(user, 0.1)) {
    user.lastMancing = Date.now()
    await saveDB(wdb)
    return m.reply(`🎣 Ikan kabur dan tidak ada tangkapan. Umpan tidak berkurang; coba lagi setelah cooldown.`)
  }

  let rodLvl = user.fishingrod || 0
  let bonus = Math.min(rodLvl * 2, 40)

  let pSecret = rodLvl >= 15 ? Math.min(0.2 + (rodLvl - 15) * 0.15, 2.5) : 0
  let pMythic = rodLvl >= 8 ? Math.min(0.8 + (rodLvl - 8) * 0.35, 6.0) : (rodLvl >= 3 ? 0.3 : 0)
  let pLegend = Math.min(2.0 + (rodLvl * 0.8), 15.0)
  let pEpic = Math.min(6.0 + (rodLvl * 1.2), 22.0)
  let pRare = Math.min(15.0 + (rodLvl * 1.2), 30.0)
  let pUncommon = Math.max(15.0, 30.0 - (rodLvl * 0.5))
  let pCommon = Math.max(15.0, 30.0 - (rodLvl * 0.8))
  const baseProbabilities = {
    secret: pSecret,
    mythic: pMythic,
    legendary: pLegend,
    epic: pEpic,
    rare: pRare
  }

  const fishCount = 2 + Math.floor(Math.random() * 3) +
    (Number(firstBait.effects.extraCatch) || 0) +
    (Math.random() < (Number(firstBait.effects.extraCatchChance) || 0) ? 1 : 0) +
    (Math.random() < Math.max(0, yieldBuff - 1) ? 1 : 0)
  const draws = []
  const seen = new Set()
  let fishCaughtCount = 0
  let attempts = 0
  const targetTierPools = {
    SECRET: secret,
    MYTHIC: mythic,
    LEGENDARY: legendary,
    EPIC: epic,
    RARE: rare,
    UNCOMMON: uncommon,
    COMMON: common,
    TRASH: trash
  }
  const tierExp = {
    SECRET: 5000,
    MYTHIC: 1000,
    LEGENDARY: 500,
    EPIC: 250,
    RARE: 120,
    UNCOMMON: 50,
    COMMON: 15,
    TRASH: 5
  }

  const pickFish = effects => {
    const targetTier = effects.targetTier
    if (targetTier && targetTierPools[targetTier]) {
      const pool = targetTierPools[targetTier]
      return {
        ikan: pool[Math.floor(Math.random() * pool.length)],
        exp: tierExp[targetTier],
        tier: targetTier
      }
    }
    const rareChanceFactor = (luckyCatch ? 1.5 : 1) * (murkyWaters ? 0.6 : 1) *
      getDifficultyProfile(user).dropRate * (Number(effects.rareChance) || 1)
    const pSecret = baseProbabilities.secret * (secretAwakening ? 2 : 1) * (luckyCatch ? 1.5 : 1)
    const pMythic = baseProbabilities.mythic * rareChanceFactor * rareBuff
    const pLegend = baseProbabilities.legendary * rareChanceFactor * rareBuff
    const pEpic = baseProbabilities.epic * rareChanceFactor * rareBuff
    const pRare = baseProbabilities.rare * rareChanceFactor * rareBuff
    let roll = Math.random() * 100
    roll = Math.max(0, Math.min(99.999, roll - getBloodlineBuff(user, 'fishingRarity') * 100 + getBloodlineDrawback(user).fishingRarityPenalty * 100))
    let cum = 0

    cum += pSecret
    if (roll <= cum && pSecret > 0) {
      if (secretAwakening && Math.random() >= 0.6) {
        return { ikan: trash[Math.floor(Math.random() * trash.length)], exp: 5, tier: 'TRASH' }
      }
      return { ikan: secret[Math.floor(Math.random() * secret.length)], exp: 5000, tier: 'SECRET' }
    }

    cum += pMythic
    if (roll <= cum && pMythic > 0) return { ikan: mythic[Math.floor(Math.random() * mythic.length)], exp: 1000, tier: 'MYTHIC' }

    cum += pLegend
    if (roll <= cum) return { ikan: legendary[Math.floor(Math.random() * legendary.length)], exp: 500, tier: 'LEGENDARY' }

    cum += pEpic
    if (roll <= cum) return { ikan: epic[Math.floor(Math.random() * epic.length)], exp: 250, tier: 'EPIC' }

    cum += pRare
    if (roll <= cum) return { ikan: rare[Math.floor(Math.random() * rare.length)], exp: 120, tier: 'RARE' }

    cum += pUncommon
    if (roll <= cum) return { ikan: uncommon[Math.floor(Math.random() * uncommon.length)], exp: 50, tier: 'UNCOMMON' }

    cum += pCommon
    if (roll <= cum) return { ikan: common[Math.floor(Math.random() * common.length)], exp: 15, tier: 'COMMON' }

    return { ikan: trash[Math.floor(Math.random() * trash.length)], exp: 5, tier: 'TRASH' }
  }

  const trashChance = Number(firstBait.effects.trashChanceMultiplier ?? 1)
  if (Math.random() < trashChance) {
    const trashFish = trash[Math.floor(Math.random() * trash.length)]
    const bait = consumeBait()
    if (bait) {
      seen.add(trashFish)
      draws.push({ ikan: trashFish, exp: 5, tier: 'TRASH' })
      fishCaughtCount++
    }
  }

  while (fishCaughtCount < fishCount && attempts < 200) {
    const availableBait = getActiveRpgFishBait(user)
    if (!availableBait) break
    attempts++
    const fish = pickFish(availableBait.effects)

    if (seen.has(fish.ikan)) continue

    const bait = consumeBait()
    if (!bait) break
    if (fish.tier !== 'TRASH') fish.size = rollCatchSize(bait.effects)
    seen.add(fish.ikan)
    draws.push(fish)
    fishCaughtCount++
  }

  let missedDoubleCatch = false
  if (doubleCatch && Math.random() < 0.25) {
    let extraFish
    for (let attempt = 0; attempt < 200; attempt++) {
      const availableBait = getActiveRpgFishBait(user)
      if (!availableBait) {
        missedDoubleCatch = true
        break
      }
      const candidate = pickFish(availableBait.effects)
      if (!seen.has(candidate.ikan)) {
        const bait = consumeBait()
        if (!bait) {
          missedDoubleCatch = true
          break
        }
        if (candidate.tier !== 'TRASH') {
          candidate.size = rollCatchSize(bait.effects)
        }
        extraFish = candidate
        break
      }
    }
    if (extraFish) {
      seen.add(extraFish.ikan)
      draws.push({ ...extraFish, exp: 0 })
    }
  }
  const baitEmpty = !getActiveRpgFishBait(user)
  const releasedCount = baitEmpty
    ? Math.max(0, fishCount - fishCaughtCount) + (missedDoubleCatch ? 1 : 0)
    : 0

  const tierOrder = ['TRASH', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SECRET']
  const highest = draws.reduce((best, current) => tierOrder.indexOf(current.tier) > tierOrder.indexOf(best) ? current.tier : best, 'TRASH')
  const totalExp = applyBloodlineBuff(user, 'xp', Math.floor(scaleDifficultyXP(user, draws.reduce((sum, x) => sum + x.exp, 0)) * xpBuff))

  for (const fish of draws) {
    const normalizedKey = normalizeFishKey(fish.ikan)
    if (fish.tier === 'TRASH') {
      user.ikan[normalizedKey] = (user.ikan[normalizedKey] || 0) + 1
    } else {
      fish.record = addFishRecord(
        user,
        normalizedKey,
        fish.size || rollCatchSize(firstBait.effects)
      )
    }
  }
  const baitRewards = new Map()
  for (let index = 0; index < draws.length; index++) {
    const reward = rollRpgFishBaitReward()
    if (!reward) continue
    user.fishBaits[reward.id] = Math.max(0, Math.floor(Number(user.fishBaits[reward.id]) || 0)) + 1
    baitRewards.set(reward.id, (baitRewards.get(reward.id) || 0) + 1)
  }
  getActiveRpgFishBait(user)
  addRpgExp(user, totalExp)
  user.lastMancing = Date.now()
  await saveDB(wdb)

  let tierData = {
    SECRET: { stars: '★★★★★★★', icon: '🔮' },
    MYTHIC: { stars: '★★★★★★☆', icon: '🌌' },
    LEGENDARY: { stars: '★★★★★☆☆', icon: '👑' },
    EPIC: { stars: '★★★★☆☆☆', icon: '💎' },
    RARE: { stars: '★★★☆☆☆☆', icon: '✨' },
    UNCOMMON: { stars: '★★☆☆☆☆☆', icon: '💙' },
    COMMON: { stars: '★☆☆☆☆☆☆', icon: '🤍' },
    TRASH: { stars: '☆☆☆☆☆☆☆', icon: '🗑️' }
  }

  let caption = `╭─❏「 🎣 AVELIA LAKE 」❏\n`
caption += `│ 🐟 *HASIL MEMANCING*\n`
caption += `╰─━━━━━━━━━━━━━━─\n\n`

caption += `> ↳ ${tierData[highest].stars} ${highest} ${tierData[highest].icon}\n\n`

caption += `🏆 *HASIL TANGKAPAN*\n`
const trashCounts = new Map()
for (const item of draws) {
  const fishKey = normalizeFishKey(item.ikan)
  if (item.tier === 'TRASH') {
    trashCounts.set(fishKey, (trashCounts.get(fishKey) || 0) + 1)
    continue
  }
  const fishEmoji = ikanEmoji[fishKey] || ikanEmoji[`ikan_${fishKey}`] || '🐟'
  const sizeCode = ({ small: 'S', medium: 'M', big: 'B', giant: 'G' })[item.record?.size || item.size] || 'M'
  const tierCode = ({
    COMMON: 'C',
    UNCOMMON: 'U',
    RARE: 'R',
    EPIC: 'E',
    LEGENDARY: 'L',
    MYTHIC: 'M',
    SECRET: 'S'
  })[item.tier] || 'R'
  const weight = Number(item.record?.weight)
  caption += `> ↳ ${tierCode}${sizeCode} ${formatNama(fishKey)} (${weight.toFixed(2)} Kg) ${fishEmoji}\n`
}
for (const [fish, quantity] of trashCounts) {
  caption += `> ↳ ${ikanEmoji[fish] || ikanEmoji[`ikan_${fish}`] || '🗑️'} ${formatNama(fish)} ×${quantity}\n`
}
caption += `\n`

caption += `─━━━━━━━━━━━━━━─\n\n`

const story = RPG_FISHING_STORIES[Math.floor(Math.random() * RPG_FISHING_STORIES.length)]
caption += `> ${story}\n\n`
caption += `✨ *HASIL PENGALAMAN*\n`
caption += `> ↳ ✨ XP Didapat: +${totalExp}\n`
caption += `> ↳ 🎣 Level Pancingan: Lv.${rodLvl}\n`
const baitSummary = [...baitUseCounts].map(([id, quantity]) =>
  `${findRpgFishBait(id).name} ×${quantity}`
).join(', ')
caption += `> ↳ 🪱 Umpan: ${baitSummary || firstBait.name}\n`
if (baitRewards.size) {
  const rewardSummary = [...baitRewards].map(([id, quantity]) =>
    `${findRpgFishBait(id).name} ×${quantity}`
  ).join(', ')
  caption += `> ↳ 🎁 Bait didapat: ${rewardSummary}\n`
}
if (releasedCount) caption += `> ↳ 🌊 ${releasedCount} tangkapan lepas karena umpan habis.\n`
if(bonus > 0) caption += `> ↳ 🍀 Bonus Rod: +${bonus.toFixed(1)}%\n`
if(getBloodlineBuff(user, 'fishingRarity') > 0) caption += `> ↳ 🧬 Efek Bloodline: peluang tier tinggi +${getBloodlineBuff(user, 'fishingRarity') * 100}%\n`

caption += `\n─━━━━━━━━━━━━━━─`

  let pp = 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
  try { pp = await conn.profilePictureUrl(m.sender, 'image') } catch {}
  const sendButtons = ({ buffer, thumbnailUrl } = {}) => sendRpgButtons(conn, {
    chat: m.chat,
    text: caption,
    title: '🎣 HASIL MEMANCING',
    subtitle: 'Koleksi ikanmu menunggu untuk dilihat',
    buffer,
    thumbnailUrl,
    buttons: [['🐠 Buka Aquarium', `${usedPrefix || '.'}aquarium`]],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
  try {
    const firstFish = draws[0]?.ikan || ''
    const cardBuf = await generateFishingCard({
      avatarUrl: pp,
      username: conn.getName(m.sender) || m.pushName || 'Player',
      ikan: `${ikanEmoji[firstFish] || '🐟'} ${formatNama(firstFish)}`,
      exp: totalExp,
      rodLevel: rodLvl,
      tier: highest
    })
    if (cardBuf) return sendButtons({ buffer: cardBuf })
  } catch (e) {
    console.error('[FishingCard] Error:', e.message)
  }
  return sendButtons({ thumbnailUrl: pp })
}

handler.help = ['mancing', 'fishing', 'pancing']
handler.tags = ['rpg']
handler.command = /^(mancing|fishing|pancing)$/i
export default handler
