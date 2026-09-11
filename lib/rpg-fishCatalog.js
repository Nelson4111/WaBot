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
