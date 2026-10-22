export const fishRenameMap = {
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

export function normalizeFishKey(name) {
  const key = String(name || '').trim().toLowerCase().replace(/\s+/g, '_')
  const normalized = fishRenameMap[key] || key
  const keepIkanPrefix = new Set([
    'ikan_badut','ikan_kupu','ikan_malaikat','ikan_diskus','ikan_arwana',
    'ikan_arapaima','ikan_todak','ikan_terbang','ikan_duyung','ikan_paradise'
  ])
  return keepIkanPrefix.has(normalized) ? normalized : normalized.replace(/^ikan_/, '')
}

export function migrateLegacyFishInventory(ikanObj = {}) {
  const migrated = {}
  for (const key in ikanObj) {
    const rawKey = String(key || '').trim().toLowerCase()
    const targetKey = normalizeFishKey(rawKey.replace(/\s+/g, '_'))
    migrated[targetKey] = (migrated[targetKey] || 0) + Number(ikanObj[key] || 0)
  }
  return migrated
}

export const ikanEmoji = {
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
  ikan_nila: '🐟', ikan_lele: '🐟', ikan_patin: '🐟', ikan_gurame: '🐟', ikan_mujair: '🐟', ikan_gabus: '🐟', ikan_wader: '🐟', ikan_seluang: '🐟', ikan_teri: '🐟', ikan_pepetek: '🐟',
  ikan_layang: '🐟', ikan_kembung_kecil: '🐟', ikan_selar: '🐟', ikan_tembang: '🐟', ikan_julung: '🐟', sampah_plastik: '🗑️', ban_bekas: '🛞', botol_kaca: '🍶', kaleng: '🥫', kayu_hanyut: '🪵',
  jaring_rusak: '🕸️', sepatu: '👟', botol: '🍶', kantong_plastik: '🛍️', duri: '🌵', batu: '🪨', rumput: '🌿', lumpur: '🟤', daun: '🍃', ranting: '🌿',
  tali: '🪢', kawat: '🔩', pecahan_kaca: '💔', kaos_kaki: '🧦', mie_instan: '🍜', pakaian_dalam: '🩲'
}

export const RPG_FISH_TIERS = Object.freeze([
  { name: 'SECRET', icon: '🔮', fish: ['poseidon', 'flying_dutchman', 'aquaman', 'godzilla', 'zeus_laut', 'atlas_laut', 'kitsune_laut', 'leviathan_primordial', 'davy_jones', 'caylpso', 'ariel_little_mermaid', 'treasure_chest', 'ancient_relic', 'pirate_gold', 'mermaid_tear', 'ikan_aurora', 'ikan_kapal_hantu', 'ikan_pahlawan', 'ikan_kaiju', 'ikan_petir', 'ikan_puncak', 'ikan_rubah_laut', 'ikan_kapten_hitam', 'ikan_laut_biru', 'ikan_putri_laut', 'peti_harta', 'artefak_laut', 'emas_pirate', 'air_mata_putri'] },
  { name: 'MYTHIC', icon: '🌌', fish: ['kraken', 'megladon', 'leviathan', 'sea_dragon', 'phoenix_laut', 'hydra_laut', 'cerberus_laut', 'titan_kura', 'paus_putih', 'ikan_dewa', 'naga_laut', 'raja_ubur', 'penjaga_karang', 'putri_duyung', 'dewa_katak', 'kuda_kristal', 'peti_karun', 'koin_emas_kuno', 'mutiara_raja', 'mahkota_karang'] },
  { name: 'LEGENDARY', icon: '👑', fish: ['hiu_putih', 'hiu_harimau', 'hiu_martil', 'paus_orca', 'paus_biru', 'penyu_raksasa', 'ikan_pari_manta', 'ikan_napoleon', 'kerapu_raksasa', 'marlin', 'tuna_sirip_biru', 'pedang_laut', 'ikan_koi_emas', 'lobster_raja', 'kepiting_raksasa', 'gurita_raksasa', 'sotong_raksasa', 'lionfish', 'ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'piranha', 'belut_listrik', 'ikan_duyung', 'ubur_ubur_bulan', 'bintang_laut', 'anemon_laut', 'karang_indah', 'kerang_mutia', 'siput_laut', 'landak_laut', 'peti_besi', 'koin_emas', 'mutiara_hitam', 'trisula_patah'] },
  { name: 'EPIC', icon: '💎', fish: ['hiu_hitam', 'hiu_biru', 'lumba_lumba', 'paus_pembunuh', 'penyu_hijau', 'ikan_pari', 'kerapu', 'tuna', 'salmon', 'barakuda', 'ikan_todak', 'ikan_terbang', 'ubur_ubur', 'ubur_ubur_listrik', 'bintang_laut_ungu', 'karang_keras', 'kerang', 'peti_kayu', 'koin_perak', 'mutiara_biasa', 'karang_antik'] },
  { name: 'RARE', icon: '✨', fish: ['kakap', 'kerapu_kecil', 'sarden', 'makarel', 'kembung', 'tongkol', 'cumi', 'gurita_kecil', 'udang', 'kepiting', 'lobster', 'kerang_hijau', 'kerang_darah', 'siput', 'landak_laut_kecil', 'anemon', 'rumput_laut', 'karang', 'peti_karat', 'koin_tembaga', 'mutiara_retak', 'cangkir_pecah'] },
  { name: 'UNCOMMON', icon: '💙', fish: ['ikan_mas', 'ikan_nila', 'ikan_lele', 'ikan_patin', 'ikan_gurame', 'ikan_mujair', 'ikan_gabus', 'ikan_wader', 'ikan_seluang'] },
  { name: 'COMMON', icon: '🤍', fish: ['ikan_teri', 'ikan_pepetek', 'ikan_layang', 'ikan_kembung_kecil', 'ikan_selar', 'ikan_tembang', 'ikan_julung'] },
  { name: 'TRASH', icon: '🗑️', fish: ['sampah_plastik', 'ban_bekas', 'botol_kaca', 'kaleng', 'kayu_hanyut', 'jaring_rusak', 'sepatu', 'botol', 'kantong_plastik', 'duri', 'batu', 'rumput', 'lumpur', 'daun', 'ranting', 'tali', 'kawat', 'pecahan_kaca', 'kaos_kaki', 'mie_instan', 'pakaian_dalam', 'gelas_plastik', 'sedotan', 'sumpit', 'piring', 'stik_es', 'serabut', 'cangkang', 'sandal', 'kapal_mainan', 'sisir_kayu', 'topi', 'tutup_botol'] }
])

export const RPG_FISH_TIER_BY_NAME = new Map(
  RPG_FISH_TIERS.flatMap(tier => tier.fish.map(name => [normalizeFishKey(name), tier.name]))
)

export const RPG_FISH_BAITS = Object.freeze([
  // ═══════════════════ BASIC ═══════════════════
  { id: 'normal', name: 'Normal Bait', price: 5000, emoji: '🪱', description: 'Umpan standar untuk memancing biasa.', effects: { extraCatchChance: 0.1 } },
  { id: 'silver', name: 'Silver Bait', price: 25000, emoji: '🪙', description: 'Meningkatkan peluang tangkapan tambahan.', effects: { extraCatchChance: 0.35 } },
  { id: 'golden', name: 'Golden Bait', price: 100000, emoji: '🌟', description: 'Meningkatkan peluang tangkapan tambahan secara signifikan.', effects: { extraCatchChance: 0.6 } },
  { id: 'double', name: 'Double Bait', price: 300000, emoji: '🎣', description: 'Meningkatkan peluang tangkapan tambahan dan ikan langka.', effects: { extraCatchChance: 0.5, rareChance: 1.15 } },
  { id: 'swarm', name: 'Swarm Bait', price: 750000, emoji: '🐠', description: 'Memberikan satu tangkapan tambahan.', effects: { extraCatch: 1 } },

  // ═══════════════════ RARE ═══════════════════
  { id: 'lucky', name: 'Lucky Bait', price: 150000, emoji: '🍀', description: 'Meningkatkan peluang mendapatkan ikan tier tinggi.', effects: { rareChance: 1.2 } },
  { id: 'rare', name: 'Rare Bait', price: 500000, emoji: '💎', description: 'Meningkatkan peluang mendapatkan ikan langka.', effects: { rareChance: 1.45 } },
  { id: 'epic', name: 'Epic Bait', price: 2000000, emoji: '🔮', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { rareChance: 1.6, extraCatchChance: 0.2 } },
  { id: 'legendary', name: 'Legendary Bait', price: 10000000, emoji: '👑', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { rareChance: 2, extraCatchChance: 0.25 } },
  { id: 'mythic', name: 'Mythic Bait', price: 50000000, emoji: '💠', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan secara signifikan.', effects: { rareChance: 2.5, extraCatchChance: 0.4 } },

  // ═══════════════════ SIZE ═══════════════════
  { id: 'big', name: 'Big Bait', price: 250000, emoji: '🐟', description: 'Ikan non-Giant yang tertangkap selalu berukuran Big.', effects: { forcedSize: 'big' } },
  { id: 'heavy', name: 'Heavy Bait', price: 750000, emoji: '⚓', description: 'Memastikan ikan berukuran Big dan meningkatkan peluang ikan langka.', effects: { forcedSize: 'big', rareChance: 1.15 } },
  { id: 'giant', name: 'Giant Bait', price: 2500000, emoji: '🐋', description: 'Meningkatkan peluang Giant saat event aktif dan menarik ikan Big di luar event.', effects: { giantChanceMultiplier: 4, forcedSize: 'big' } },
  { id: 'large', name: 'Large Bait', price: 15000000, emoji: '🦈', description: 'Meningkatkan peluang Giant saat event aktif dan peluang ikan langka.', effects: { giantChanceMultiplier: 6, forcedSize: 'big', rareChance: 1.3 } },
  { id: 'massive', name: 'Massive Bait', price: 75000000, emoji: '🌊', description: 'Meningkatkan peluang Giant saat event aktif serta peluang ikan langka.', effects: { giantChanceMultiplier: 10, forcedSize: 'big', rareChance: 1.5 } },

  // ═══════════════════ SAFETY ═══════════════════
  { id: 'steady', name: 'Steady Bait', price: 80000, emoji: '🪝', description: 'Mencegah kegagalan memancing akibat umpan terlepas.', effects: { preventFailure: true } },
  { id: 'secure', name: 'Secure Bait', price: 300000, emoji: '🔗', description: 'Mencegah kegagalan memancing dan meningkatkan peluang tangkapan tambahan.', effects: { preventFailure: true, extraCatchChance: 0.15 } },
  { id: 'strong', name: 'Strong Bait', price: 1000000, emoji: '🛡️', description: 'Mencegah kegagalan memancing dan meningkatkan peluang ikan langka.', effects: { preventFailure: true, rareChance: 1.2 } },
  { id: 'precise', name: 'Precise Bait', price: 5000000, emoji: '🎯', description: 'Mencegah kegagalan memancing serta meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { preventFailure: true, rareChance: 1.3, extraCatchChance: 0.2 } },
  { id: 'expert', name: 'Expert Bait', price: 20000000, emoji: '🏅', description: 'Mencegah kegagalan memancing dan meningkatkan peluang ikan langka serta tangkapan tambahan.', effects: { preventFailure: true, rareChance: 1.6, extraCatchChance: 0.35 } },

  // ═══════════════════ ANTI-TRASH ═══════════════════
  { id: 'anti-trash', name: 'Antitrash Bait', price: 125000, emoji: '✨', description: 'Mengurangi peluang sampah dan meningkatkan peluang tangkapan tambahan.', effects: { trashChanceMultiplier: 0.15, extraCatchChance: 0.2 } },
  { id: 'clean', name: 'Clean Bait', price: 400000, emoji: '💧', description: 'Mengurangi peluang sampah dan meningkatkan peluang ikan langka.', effects: { trashChanceMultiplier: 0.1, rareChance: 1.15 } },
  { id: 'ocean', name: 'Ocean Bait', price: 1500000, emoji: '🪸', description: 'Mengurangi peluang sampah serta meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { trashChanceMultiplier: 0.05, rareChance: 1.3, extraCatchChance: 0.2 } },
  { id: 'clear', name: 'Clear Bait', price: 7000000, emoji: '🫧', description: 'Sangat mengurangi peluang sampah serta meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { trashChanceMultiplier: 0.02, rareChance: 1.5, extraCatchChance: 0.3 } },
  { id: 'pure', name: 'Pure Bait', price: 30000000, emoji: '💠', description: 'Mengurangi peluang sampah secara drastis dan meningkatkan peluang ikan langka serta tangkapan tambahan.', effects: { trashChanceMultiplier: 0.01, rareChance: 1.8, extraCatchChance: 0.4 } },

  // ═══════════════════ EXTRA CATCH ═══════════════════
  { id: 'extra', name: 'Extra Bait', price: 500000, emoji: '🐟', description: 'Meningkatkan peluang memperoleh tangkapan tambahan.', effects: { extraCatchChance: 0.75 } },
  { id: 'schooling', name: 'Schooling Bait', price: 2000000, emoji: '🐠', description: 'Meningkatkan peluang tangkapan tambahan dan ikan langka.', effects: { extraCatchChance: 0.6, rareChance: 1.2 } },
  { id: 'triple', name: 'Triple Bait', price: 5000000, emoji: '🧺', description: 'Memberikan satu tangkapan tambahan dan meningkatkan peluang ikan langka.', effects: { extraCatch: 1, rareChance: 1.25 } },
  { id: 'multi', name: 'Multi Bait', price: 25000000, emoji: '🌊', description: 'Memberikan satu tangkapan tambahan serta meningkatkan peluang tangkapan ekstra dan ikan langka.', effects: { extraCatch: 1, extraCatchChance: 0.5, rareChance: 1.35 } },
  { id: 'maximum', name: 'Maximum Bait', price: 100000000, emoji: '♾️', description: 'Memberikan satu tangkapan tambahan serta meningkatkan peluang tangkapan ekstra dan ikan langka.', effects: { extraCatch: 1, extraCatchChance: 0.75, rareChance: 1.6 } },

  // ═══════════════════ TIME & WEATHER ═══════════════════
  { id: 'night', name: 'Night Bait', price: 1000000, emoji: '🌙', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { rareChance: 1.2, extraCatchChance: 0.2 } },
  { id: 'storm', name: 'Storm Bait', price: 3000000, emoji: '⛈️', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mengurangi peluang sampah.', effects: { rareChance: 1.3, extraCatchChance: 0.25, trashChanceMultiplier: 0.5 } },
  { id: 'warm', name: 'Warm Bait', price: 10000000, emoji: '🌋', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mencegah kegagalan memancing.', effects: { rareChance: 1.4, extraCatchChance: 0.3, preventFailure: true } },
  { id: 'cold', name: 'Cold Bait', price: 25000000, emoji: '🧊', description: 'Meningkatkan peluang ikan langka, mengurangi peluang sampah, dan meningkatkan tangkapan tambahan.', effects: { rareChance: 1.5, trashChanceMultiplier: 0.1, extraCatchChance: 0.3 } },
  { id: 'deep', name: 'Deep Bait', price: 100000000, emoji: '🌑', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mengurangi peluang sampah.', effects: { rareChance: 1.8, extraCatchChance: 0.4, trashChanceMultiplier: 0.05 } },

  // ═══════════════════ EVENT ═══════════════════
  { id: 'event', name: 'Event Bait', price: 5000000, emoji: '🎊', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan.', effects: { rareChance: 1.25, extraCatchChance: 0.25 } },
  { id: 'hunter', name: 'Hunter Bait', price: 20000000, emoji: '🐳', description: 'Meningkatkan peluang Giant saat event aktif dan memastikan ikan non-Giant berukuran Big.', effects: { giantChanceMultiplier: 5, forcedSize: 'big' } },
  { id: 'catcher', name: 'Catcher Bait', price: 75000000, emoji: '🦑', description: 'Meningkatkan peluang Giant saat event aktif serta peluang ikan langka dan tangkapan tambahan.', effects: { giantChanceMultiplier: 8, forcedSize: 'big', rareChance: 1.4, extraCatchChance: 0.25 } },
  { id: 'king', name: 'King Bait', price: 250000000, emoji: '👑', description: 'Meningkatkan peluang Giant saat event aktif serta peluang ikan langka dan tangkapan tambahan.', effects: { giantChanceMultiplier: 10, forcedSize: 'big', rareChance: 1.6, extraCatchChance: 0.4 } },
  { id: 'pro', name: 'Pro Bait', price: 1000000000, emoji: '🎣', description: 'Meningkatkan peluang Giant saat event aktif, ikan langka, dan tangkapan tambahan.', effects: { giantChanceMultiplier: 15, forcedSize: 'big', rareChance: 2, extraCatchChance: 0.5 } },

  // ═══════════════════ PREMIUM ═══════════════════
  { id: 'royal', name: 'Royal Bait', price: 500000000, emoji: '💎', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mengurangi peluang sampah.', effects: { rareChance: 2, extraCatchChance: 0.5, trashChanceMultiplier: 0.1 } },
  { id: 'ultimate', name: 'Ultimate Bait', price: 1500000000, emoji: '🌠', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mencegah kegagalan memancing.', effects: { rareChance: 2.2, extraCatchChance: 0.6, preventFailure: true } },
  { id: 'premium', name: 'Premium Bait', price: 5000000000, emoji: '✨', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mengurangi peluang sampah.', effects: { rareChance: 2.5, extraCatchChance: 0.75, trashChanceMultiplier: 0.02 } },
  { id: 'master', name: 'Master Bait', price: 15000000000, emoji: '🐲', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mencegah kegagalan memancing.', effects: { rareChance: 3, extraCatchChance: 1, preventFailure: true } },

  // ═══════════════════ HIGH-GRADE ═══════════════════
  { id: 'fortune', name: 'Fortune Bait', price: 25000000000, emoji: '🍀', description: 'Meningkatkan peluang ikan langka dan tangkapan tambahan serta mengurangi peluang sampah.', effects: { rareChance: 3, extraCatchChance: 0.8, trashChanceMultiplier: 0.05 } },
  { id: 'seadeep', name: 'Seadeep Bait', price: 50000000000, emoji: '🌊', description: 'Meningkatkan peluang ikan langka, memberikan satu tangkapan tambahan, dan mencegah kegagalan memancing.', effects: { rareChance: 3.2, extraCatch: 1, preventFailure: true } },
  { id: 'perfect', name: 'Perfect Bait', price: 100000000000, emoji: '♾️', description: 'Meningkatkan peluang ikan langka, memberikan satu tangkapan tambahan, mengurangi peluang sampah, dan mencegah kegagalan.', effects: { rareChance: 3.5, extraCatch: 1, trashChanceMultiplier: 0.01, preventFailure: true } },
  { id: 'champion', name: 'Champion Bait', price: 250000000000, emoji: '🌍', description: 'Meningkatkan peluang ikan langka, memberikan tangkapan tambahan, dan mencegah kegagalan memancing.', effects: { rareChance: 4, extraCatch: 1, extraCatchChance: 0.75, preventFailure: true } },
  { id: 'supreme', name: 'Supreme Bait', price: 1000000000000, emoji: '🏆', description: 'Umpan paling premium dengan peluang ikan langka tinggi, tangkapan tambahan, peluang sampah rendah, dan perlindungan dari kegagalan.', effects: { rareChance: 5, extraCatch: 1, extraCatchChance: 1, trashChanceMultiplier: 0.01, preventFailure: true } }
])

export function findRpgFishBait(input) {
  const key = String(input || '').trim().toLocaleLowerCase('id-ID')
  if (!key) return null
  return RPG_FISH_BAITS.find(bait =>
    bait.id === key || bait.name.toLocaleLowerCase('id-ID') === key
  ) || null
}

export function grantDailyNormalBait(user, now = Date.now()) {
  if (!user || typeof user !== 'object') return 0
  user.fishBaits ||= {}
  const dateKey = new Date(now + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (user.lastFreeNormalBaitDate === dateKey) return 0
  const normalCount = Math.max(0, Math.floor(Number(user.fishBaits.normal) || 0))
  user.lastFreeNormalBaitDate = dateKey
  if (normalCount >= 25) return 0
  user.fishBaits.normal = normalCount + 25
  return 25
}
