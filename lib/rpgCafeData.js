import {
  hargaBeli as RESTAURANT_PRICES,
  masakanResep,
  minumanMasakan
} from './rpg-masakanData.js'

export const CAFE_SETUP_COST = 5000000
export const CAFE_DEFAULT_CAPACITY = 6
export const CAFE_SHIFT_MS = 60 * 60 * 1000
export const CAFE_OPERATING_COST_PER_SHIFT = 5000
export const CAFE_MENU_PRICE_MIN_BPS = 5000
export const CAFE_MENU_PRICE_MAX_BPS = 30000
export const CAFE_MENU_PAGE_SIZE = 15
export const CAFE_INGREDIENT_PAGE_SIZE = 20

export const CAFE_STARTER_MENU = [
  'kopi_hitams',
  'boba_milktea',
  'es_teh_jumbo',
  'matcha_latte',
  'air_mineral',
  'nasi_goreng',
  'ayam_goreng',
  'bakso'
]

export const CAFE_MENU_CATALOG = Object.freeze(Object.fromEntries(
  Object.entries(masakanResep)
    .filter(([id]) => RESTAURANT_PRICES[id])
    .map(([id, recipe]) => [id, Object.freeze({
      id,
      emoji: recipe.emoji || RESTAURANT_PRICES[id].emoji || '🍽️',
      name: id.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
      category: minumanMasakan.includes(id) ? 'minuman' : 'makanan',
      basePrice: RESTAURANT_PRICES[id].harga,
      ingredients: Object.freeze({ ...(recipe.bahan || {}) })
    })])
))

const ingredientCostOverrides = Object.freeze({
  air: 500,
  beras: 3000,
  butter: 4000,
  cabai: 2000,
  coklat: 5000,
  daging: 10000,
  gula: 1500,
  ikan: 8000,
  kopi: 4000,
  matcha: 7000,
  susu: 4000,
  teh: 2500,
  telur: 2500,
  tepung: 2000
})

const ingredientIds = [...new Set(
  Object.values(CAFE_MENU_CATALOG).flatMap(menu => Object.keys(menu.ingredients))
)].sort((left, right) => left.localeCompare(right, 'id'))

export const CAFE_INGREDIENT_CATALOG = Object.freeze(Object.fromEntries(
  ingredientIds.map(id => [id, Object.freeze({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
    unitPrice: ingredientCostOverrides[id] || 3000
  })])
))

export const CAFE_NPCS = Object.freeze([
  Object.freeze({
    id: 'mika',
    name: 'Mika',
    preference: 'minuman',
    greeting: 'Aroma kopinya harum sekali.',
    order: 'Aku pesan {menu}, ya.',
    thanks: 'Pas sekali buat menemani hari ini!'
  }),
  Object.freeze({
    id: 'raka',
    name: 'Raka',
    preference: 'makanan',
    greeting: 'Aku lapar setelah berkeliling Avelia.',
    order: 'Ada {menu}? Satu porsi, ya.',
    thanks: 'Enak sekali, nanti aku mampir lagi.'
  }),
  Object.freeze({
    id: 'nara',
    name: 'Nara',
    preference: 'minuman',
    greeting: 'Suasananya nyaman dan menenangkan.',
    order: 'Aku ingin mencoba {menu}.',
    thanks: 'Terima kasih, rasanya menyegarkan!'
  }),
  Object.freeze({
    id: 'bima',
    name: 'Bima',
    preference: 'makanan',
    greeting: 'Semoga ada makanan favoritku.',
    order: 'Tolong siapkan {menu} untukku.',
    thanks: 'Porsinya pas, terima kasih!'
  }),
  Object.freeze({
    id: 'sora',
    name: 'Sora',
    preference: 'bebas',
    greeting: 'Aku baru pertama kali berkunjung.',
    order: 'Rekomendasikan {menu} untukku.',
    thanks: 'Aku suka tempat ini!'
  }),
  Object.freeze({
    id: 'dimas',
    name: 'Dimas',
    preference: 'bebas',
    greeting: 'Hai! Ada menu spesial hari ini?',
    order: 'Aku pesan {menu}.',
    thanks: 'Pelayanannya ramah, pasti kembali.'
  })
])

export const CAFE_DIALOGUE = Object.freeze({
  soldOut: 'Wah, stoknya sedang habis. Aku akan kembali lain kali.',
  closed: 'Sepertinya cafe sedang tutup. Sampai jumpa nanti!',
  noMenu: 'Belum ada menu yang tersedia. Semoga segera dibuka!'
})

export const CAFE_STAFF = Object.freeze({
  cashier: Object.freeze({ name: 'Kasir', salary: 15000, hiringCost: 50000, capacityBonus: 1 }),
  barista: Object.freeze({ name: 'Barista', salary: 18000, hiringCost: 75000, capacityBonus: 2 }),
  chef: Object.freeze({ name: 'Koki', salary: 20000, hiringCost: 100000, capacityBonus: 2 }),
  waiter: Object.freeze({ name: 'Pelayan', salary: 12000, hiringCost: 40000, capacityBonus: 2 }),
  cleaner: Object.freeze({ name: 'Petugas Kebersihan', salary: 10000, hiringCost: 30000, capacityBonus: 0 })
})

export const CAFE_UPGRADES = Object.freeze({
  capacity: Object.freeze({ name: 'Kapasitas', basePrice: 1000000, capacityBonus: 4 }),
  kitchen: Object.freeze({ name: 'Dapur', basePrice: 1500000, capacityBonus: 1 }),
  service: Object.freeze({ name: 'Pelayanan', basePrice: 1200000, reputationBonus: 5 })
})

export const CAFE_THEMES = Object.freeze({
  classic: Object.freeze({ name: 'Classic', price: 0 }),
  garden: Object.freeze({ name: 'Garden', price: 500000 }),
  modern: Object.freeze({ name: 'Modern', price: 1000000 }),
  starlight: Object.freeze({ name: 'Starlight', price: 2500000 })
})
