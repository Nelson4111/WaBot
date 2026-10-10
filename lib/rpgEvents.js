export const RPG_EVENTS = [
  {
    id: 'golden_hour', name: 'Golden Hour', category: 'Casino', emoji: '🎉',
    description: 'Bonus kemenangan selama event aktif.',
    effects: ['Bonus kemenangan +20%.', 'Peluang dasar permainan tetap sama.']
  },
  {
    id: 'safety_net', name: 'Safety Net', category: 'Casino', emoji: '🛡️',
    description: 'Anti-kalah total: taruhan yang kalah dikembalikan.',
    effects: ['Pengembalian taruhan kalah 100%.', 'Peluang kemenangan -50%.']
  },
  {
    id: 'casino_shutdown', name: 'Casino Shutdown', category: 'Casino', emoji: '🚫',
    description: 'Seluruh permainan Casino ditutup sementara.',
    effects: ['Semua command permainan ditutup.', 'Saldo dan inventori tetap aman.', 'Informasi dan riwayat tetap dapat diakses.']
  },
  {
    id: 'cashback_hour', name: 'Cashback Hour', category: 'Casino', emoji: '💰',
    description: 'Pengembalian sebagian kerugian bersih setelah sesi permainan.',
    effects: ['Cashback 25% dari kerugian bersih.', 'Maksimum Rp 1.000.000 per pemain selama event.']
  },
  {
    id: 'low_stakes', name: 'Low Stakes', category: 'Casino', emoji: '📉',
    description: 'Pengurangan hadiah kemenangan selama event aktif.',
    effects: ['Bonus kemenangan -50%.', 'Nominal taruhan dan peluang dasar tetap.']
  },
  {
    id: 'lucky_catch', name: 'Lucky Catch', category: 'Fishing', emoji: '🍀',
    description: 'Peluang ikan Rare ke atas meningkat.',
    effects: ['Peluang ikan Rare ke atas +50% secara relatif.', 'Jumlah hasil tangkapan tetap.']
  },
  {
    id: 'double_catch', name: 'Double Catch', category: 'Fishing', emoji: '🐟',
    description: 'Aktivitas memancing berpeluang menghasilkan tangkapan tambahan.',
    effects: ['Peluang tangkapan tambahan 25%.', 'Tangkapan mengikuti aturan normal.', 'EXP tangkapan tambahan tidak digandakan.']
  },
  {
    id: 'giant_fish', name: 'Giant Fish', category: 'Fishing', emoji: '🐋',
    description: 'Peluang mendapatkan ikan berukuran besar meningkat.',
    effects: ['Peluang ikan besar +50% secara relatif.', 'Berat memengaruhi nilai jual jika didukung sistem.']
  },
  {
    id: 'secret_awakening', name: 'Secret Awakening', category: 'Fishing', emoji: '🍀',
    description: 'Secret Fish lebih sering muncul, tetapi lebih sulit ditangkap.',
    effects: ['Peluang Secret Fish muncul +100% secara relatif.', 'Peluang berhasil menangkap Secret Fish -40%.']
  },
  {
    id: 'murky_waters', name: 'Murky Waters', category: 'Fishing', emoji: '🌫️',
    description: 'Air keruh menyulitkan pemancingan.',
    effects: ['Peluang ikan Rare ke atas -40%.', 'Waktu tunggu gigitan meningkat.', 'Secret Fish mengikuti aturan event khususnya.']
  },
  {
    id: 'mineral_rush', name: 'Mineral Rush', category: 'Mining', emoji: '💎',
    description: 'Tambang menghasilkan mineral berharga lebih banyak.',
    effects: ['Peluang mineral Rare ke atas +50% secara relatif.', 'Peluang mineral tambahan 25%.']
  },
  {
    id: 'cave_collapse', name: 'Cave Collapse', category: 'Mining', emoji: '🪨',
    description: 'Runtuhan menghambat aktivitas pertambangan.',
    effects: ['Efisiensi mining -30%.', 'Peluang mineral Rare ke atas -25%.', 'Waktu penambangan meningkat.']
  },
  {
    id: 'dimensional_rift', name: 'Dimensional Rift', category: 'Adventure', emoji: '🌌',
    description: 'Retakan dimensi membuka encounter dan hadiah dari dimensi lain.',
    effects: ['Peluang encounter dimensional meningkat.', 'Peluang item eksklusif meningkat.']
  },
  {
    id: 'dangerous_expedition', name: 'Dangerous Expedition', category: 'Adventure', emoji: '🌪️',
    description: 'Wilayah petualangan lebih berbahaya.',
    effects: ['Tingkat kesulitan dan risiko kegagalan meningkat.', 'Peluang hadiah bonus -25%.']
  },
  {
    id: 'pet_festival', name: 'Pet Festival', category: 'Pet', emoji: '🐾',
    description: 'Festival membuat hewan peliharaan lebih aktif.',
    effects: ['EXP pet +50%.', 'Efektivitas aktivitas pet +25%.']
  },
  {
    id: 'love_season', name: 'Love Season', category: 'Rship', emoji: '💖',
    description: 'Aktivitas bersama pasangan memberi perkembangan lebih besar.',
    effects: ['Relationship EXP +50%.', 'Poin kedekatan aktivitas bersama +25%.', 'Hadiah tetap mengikuti aturan normal.']
  },
  {
    id: 'cold_war', name: 'Cold War', category: 'Rship', emoji: '💔',
    description: 'Hubungan pasangan lebih sulit berkembang.',
    effects: ['Relationship EXP -30%.', 'Poin kedekatan aktivitas bersama -25%.', 'Biaya aktivitas tetap normal.']
  },
  {
    id: 'grand_sale', name: 'Grand Sale', category: 'Mall', emoji: '🛍️',
    description: 'Diskon besar untuk barang promo mall.',
    effects: ['Diskon 30% untuk item yang ditandai promo.', 'Kuota item terbatas tetap berlaku.']
  },
  {
    id: 'price_surge', name: 'Price Surge', category: 'Mall', emoji: '📈',
    description: 'Permintaan meningkatkan harga barang yang terdampak.',
    effects: ['Harga item terdampak +30%.', 'Harga jual kembali tetap normal.']
  },
  {
    id: 'breeding_season', name: 'Breeding Season', category: 'Ternak', emoji: '🌱',
    description: 'Kondisi peternakan mendukung perkembangbiakan.',
    effects: ['Peluang breeding berhasil +30% secara relatif.', 'Waktu berkembang biak -25%.']
  },
  {
    id: 'livestock_disease', name: 'Livestock Disease', category: 'Ternak', emoji: '🦠',
    description: 'Penyakit mengganggu produktivitas hewan ternak.',
    effects: ['Produktivitas ternak -30%.', 'Waktu pemulihan atau produksi meningkat.', 'Hewan tidak mati atau hilang akibat event.']
  },
  {
    id: 'bountiful_harvest', name: 'Bountiful Harvest', category: 'Panen', emoji: '☀️',
    description: 'Kondisi pertanian ideal meningkatkan hasil panen.',
    effects: ['Hasil panen +50%.', 'Peluang hasil panen bonus +25%.', 'Kualitas tanaman tetap normal.']
  },
  {
    id: 'crop_blight', name: 'Crop Blight', category: 'Panen', emoji: '🥀',
    description: 'Penyakit tanaman menghambat pertumbuhan dan hasil panen.',
    effects: ['Hasil panen -30%.', 'Waktu pertumbuhan meningkat.', 'Tanaman tidak langsung hilang atau gagal panen seluruhnya.']
  },
  {
    id: 'legendary_discovery', name: 'Legendary Discovery', category: 'Interstellar', emoji: '👑',
    description: 'Aktivitas kosmik membuka peluang penemuan langka.',
    effects: ['Peluang objek legendaris +50% secara relatif.', 'Hadiah penemuan langka +45%.']
  },
  {
    id: 'void_corruption', name: 'Void Corruption', category: 'Interstellar', emoji: '🕳️',
    description: 'Energi Void mengganggu kestabilan eksplorasi.',
    effects: ['Efisiensi eksplorasi -45%.']
  },
  {
    id: 'stellar_blessing', name: 'Stellar Blessing', category: 'Interstellar', emoji: '✨',
    description: 'Energi bintang membantu penjelajah menemukan objek antariksa.',
    effects: ['Peluang menemukan objek langka +30% secara relatif.']
  },
  {
    id: 'cosmic_turbulence', name: 'Cosmic Turbulence', category: 'Interstellar', emoji: '☄️',
    description: 'Gelombang energi kosmik mengganggu navigasi.',
    effects: ['Risiko kegagalan eksplorasi meningkat.']
  }
]

const normalize = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[_\s-]+/g, ' ')

export function findRpgEvent(value) {
  const key = normalize(value)
  return RPG_EVENTS.find(event => normalize(event.id) === key || normalize(event.name) === key) || null
}

export function getActiveRpgEvents(now = Date.now()) {
  const active = global.db?.data?.rpgEvents || {}
  return RPG_EVENTS.filter(event => Number(active[event.id]?.expiresAt) > now)
    .map(event => ({ ...event, ...active[event.id] }))
}

export function isRpgEventActive(id, now = Date.now()) {
  return Number(global.db?.data?.rpgEvents?.[id]?.expiresAt) > now
}
