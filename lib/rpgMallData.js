export const MALL_PREMIUM_DISCOUNT = 0.2
export const MALL_PREMIUM_SELL_BONUS = 0.1
export const HOME_UPGRADE_BASE_COST = 250000
export const HOME_BASE_CAPACITY = 5
export const HOME_PREMIUM_CAPACITY_BONUS = 5
export const HOME_UPGRADE_CAPACITY = 3
export const HOME_MAX_UPGRADES = 5
export const HOME_PREMIUM_UPGRADE_DISCOUNT = 0.2
export const COLLECTION_SHOWCASE_LIMIT = 3
export const MALL_DAILY_DISCOUNT = 0.15

export const MALL_CATEGORIES = {
  furniture: {
    label: 'Furniture',
    emoji: '🛋️',
    items: [
      { id: 'sofa_minimalis', name: 'Sofa Minimalis', emoji: '🛋️', price: 180000, sellPrice: 90000 },
      { id: 'lampu_lantai', name: 'Lampu Lantai', emoji: '🛋️', price: 75000, sellPrice: 37500 },
      { id: 'rak_buku', name: 'Rak Buku', emoji: '📚', price: 120000, sellPrice: 60000 },
      { id: 'meja_kopi', name: 'Meja Kopi', emoji: '🪑', price: 95000, sellPrice: 47500 },
      { id: 'tempat_tidur_king', name: 'Tempat Tidur King', emoji: '🛏️', price: 350000, sellPrice: 175000 }
    ]
  },
  koleksi: {
    label: 'Koleksi',
    emoji: '📚',
    items: [
      { id: 'kartu_naga', name: 'Kartu Naga', emoji: '🐉', price: 85000, sellPrice: 42500 },
      { id: 'patung_kucing', name: 'Patung Kucing', emoji: '🐈', price: 65000, sellPrice: 32500 },
      { id: 'koin_antik', name: 'Koin Antik', emoji: '🪙', price: 150000, sellPrice: 75000 },
      { id: 'kristal_bintang', name: 'Kristal Bintang', emoji: '💎', price: 240000, sellPrice: 120000 },
      { id: 'boneka_aventurine', name: 'Boneka Aventurine', emoji: '🧸', price: 110000, sellPrice: 55000 }
    ]
  },
  kendaraan: {
    label: 'Kendaraan',
    emoji: '🚗',
    items: [
      { id: 'sepeda_kota', name: 'Sepeda Kota', emoji: '🚲', price: 220000, sellPrice: 110000 },
      { id: 'skuter_listrik', name: 'Skuter Listrik', emoji: '🛴', price: 850000, sellPrice: 425000 },
      { id: 'motor_klasik', name: 'Motor Klasik', emoji: '🏍️', price: 1800000, sellPrice: 900000 },
      { id: 'mobil_hatchback', name: 'Mobil Hatchback', emoji: '🚙', price: 8500000, sellPrice: 4250000 }
    ]
  },
  fashion: {
    label: 'Fashion',
    emoji: '👕',
    items: [
      { id: 'hoodie_avelia', name: 'Hoodie Avelia', emoji: '🧥', price: 125000, sellPrice: 62500 },
      { id: 'sneakers_urban', name: 'Sneakers Urban', emoji: '👟', price: 190000, sellPrice: 95000 },
      { id: 'topi_kolektor', name: 'Topi Kolektor', emoji: '🧢', price: 70000, sellPrice: 35000 },
      { id: 'jam_tangan', name: 'Jam Tangan', emoji: '⌚', price: 420000, sellPrice: 210000 }
    ]
  },
  elektronik: {
    label: 'Elektronik',
    emoji: '💻',
    items: [
      { id: 'headphone_nirkabel', name: 'Headphone Nirkabel', emoji: '🎧', price: 350000, sellPrice: 175000 },
      { id: 'kamera_saku', name: 'Kamera Saku', emoji: '📷', price: 725000, sellPrice: 362500 },
      { id: 'tablet_gaming', name: 'Tablet Gaming', emoji: '📱', price: 2200000, sellPrice: 1100000 },
      { id: 'laptop_ultra', name: 'Laptop Ultra', emoji: '💻', price: 6500000, sellPrice: 3250000 }
    ]
  },
  peralatan: {
    label: 'Peralatan',
    emoji: '🍳',
    items: [
      { id: 'panci_premium', name: 'Panci Premium', emoji: '🍳', price: 95000, sellPrice: 47500 },
      { id: 'set_pisau', name: 'Set Pisau', emoji: '🔪', price: 140000, sellPrice: 70000 },
      { id: 'bor_portabel', name: 'Bor Portabel', emoji: '🛠️', price: 275000, sellPrice: 137500 },
      { id: 'kotak_perkakas', name: 'Kotak Perkakas', emoji: '🧰', price: 185000, sellPrice: 92500 }
    ]
  },
  hadiah: {
    label: 'Hadiah',
    emoji: '🎁',
    items: [
      { id: 'buket_bunga', name: 'Buket Bunga', emoji: '💐', price: 55000, sellPrice: 27500 },
      { id: 'cokelat_kotak', name: 'Cokelat Kotak', emoji: '🍫', price: 45000, sellPrice: 22500 },
      { id: 'kotak_musik', name: 'Kotak Musik', emoji: '🎶', price: 175000, sellPrice: 87500 },
      { id: 'boneka_hati', name: 'Boneka Hati', emoji: '💝', price: 90000, sellPrice: 45000 }
    ]
  }
}

export const MALL_CATEGORY_ALIASES = {
  furniture: 'furniture',
  furnitur: 'furniture',
  koleksi: 'koleksi',
  collection: 'koleksi',
  kendaraan: 'kendaraan',
  vehicle: 'kendaraan',
  fashion: 'fashion',
  elektronik: 'elektronik',
  electronic: 'elektronik',
  peralatan: 'peralatan',
  alat: 'peralatan',
  hadiah: 'hadiah',
  gift: 'hadiah'
}
