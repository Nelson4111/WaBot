import {
  hargaBeli as RESTAURANT_PRICES,
  masakanResep,
  minumanMasakan
} from './rpg-masakanData.js'

export const CAFE_SETUP_COST = 5000000
export const CAFE_DEFAULT_CAPACITY = 6
export const CAFE_MAX_CUSTOMERS_PER_SHIFT = 50
export const CAFE_MAX_STAFF_SALARY_MULTIPLIER = 100
export const CAFE_SHIFT_MS = 60 * 60 * 1000
export const CAFE_OPERATING_COST_PER_SHIFT = 5000
export const CAFE_MENU_PRICE_MIN_BPS = 5000
export const CAFE_MENU_PRICE_MAX_BPS = 30000
export const CAFE_MENU_PAGE_SIZE = 15
export const CAFE_INGREDIENT_PAGE_SIZE = 20
export const CAFE_VISITOR_STAY_MS = 30 * 60 * 1000
export const CAFE_VISIT_COOLDOWN_MS = 10 * 60 * 1000
export const CAFE_MAX_VISITORS = 5

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
    thanks: 'Pas sekali buat menemani hari ini!',
    talk: Object.freeze([
      'Aku suka mampir ke sini setelah menyelesaikan urusan di pusat kota.',
      'Kalau suasananya setenang ini, rasanya ingin duduk lebih lama.'
    ])
  }),
  Object.freeze({
    id: 'raka',
    name: 'Raka',
    preference: 'makanan',
    greeting: 'Aku lapar setelah berkeliling Avelia.',
    order: 'Ada {menu}? Satu porsi, ya.',
    thanks: 'Enak sekali, nanti aku mampir lagi.',
    talk: Object.freeze([
      'Aku sedang mencari tempat makan favorit baru. Sepertinya ketemu!',
      'Porsi dan suasananya pas sekali untuk istirahat.'
    ])
  }),
  Object.freeze({
    id: 'nara',
    name: 'Nara',
    preference: 'minuman',
    greeting: 'Suasananya nyaman dan menenangkan.',
    order: 'Aku ingin mencoba {menu}.',
    thanks: 'Terima kasih, rasanya menyegarkan!',
    talk: Object.freeze([
      'Aku suka mencoba minuman baru. Menu di sini menarik sekali.',
      'Perjalanan keliling Avelia jadi lebih menyenangkan setelah istirahat.'
    ])
  }),
  Object.freeze({
    id: 'bima',
    name: 'Bima',
    preference: 'makanan',
    greeting: 'Semoga ada makanan favoritku.',
    order: 'Tolong siapkan {menu} untukku.',
    thanks: 'Porsinya pas, terima kasih!',
    talk: Object.freeze([
      'Aroma masakannya membuatku penasaran sejak dari luar.',
      'Aku mungkin akan mengajak teman-temanku ke sini besok.'
    ])
  }),
  Object.freeze({
    id: 'sora',
    name: 'Sora',
    preference: 'bebas',
    greeting: 'Aku baru pertama kali berkunjung.',
    order: 'Rekomendasikan {menu} untukku.',
    thanks: 'Aku suka tempat ini!',
    talk: Object.freeze([
      'Ini kunjungan pertamaku, tapi sepertinya bukan yang terakhir.',
      'Ada sudut yang nyaman untuk membaca sambil menikmati pesanan.'
    ])
  }),
  Object.freeze({
    id: 'dimas',
    name: 'Dimas',
    preference: 'bebas',
    greeting: 'Hai! Ada menu spesial hari ini?',
    order: 'Aku pesan {menu}.',
    thanks: 'Pelayanannya ramah, pasti kembali.',
    talk: Object.freeze([
      'Aku sering mencari cafe yang punya suasana hangat seperti ini.',
      'Jangan lupa mencoba menu andalan mereka!'
    ])
  }),
  Object.freeze({
    id: 'keira',
    name: 'Keira',
    preference: 'minuman',
    greeting: 'Aku penasaran dengan minuman racikan di sini.',
    order: 'Boleh rekomendasikan {menu}?',
    thanks: 'Racikannya unik dan enak!',
    talk: Object.freeze([
      'Aku suka melihat barista membuat minuman dengan teliti.',
      'Kalau ada menu musiman, kabari aku ya!'
    ])
  }),
  Object.freeze({
    id: 'juno',
    name: 'Juno',
    preference: 'makanan',
    greeting: 'Wah, dari luar saja aromanya sudah menggoda.',
    order: 'Aku mau coba {menu}.',
    thanks: 'Rasanya cocok sekali!',
    talk: Object.freeze([
      'Aku baru selesai latihan, jadi butuh makanan yang mengenyangkan.',
      'Tempatnya nyaman, pelayanannya juga cepat.'
    ])
  }),
  Object.freeze({
    id: 'lila',
    name: 'Lila',
    preference: 'bebas',
    greeting: 'Tempatnya terlihat cantik dan nyaman.',
    order: 'Aku ikut rekomendasi cafe untuk {menu}.',
    thanks: 'Pilihan yang tepat, terima kasih!',
    talk: Object.freeze([
      'Aku sedang mencari inspirasi untuk menggambar interior cafe.',
      'Warna dan dekorasinya membuat suasananya terasa hidup.'
    ])
  }),
  Object.freeze({
    id: 'fajar',
    name: 'Fajar',
    preference: 'bebas',
    greeting: 'Halo! Aku mampir sebentar sebelum melanjutkan perjalanan.',
    order: 'Sepertinya aku akan pesan {menu}.',
    thanks: 'Waktunya istirahat jadi lebih menyenangkan.',
    talk: Object.freeze([
      'Aku sedang berkeliling Avelia dan senang menemukan tempat ini.',
      'Semoga cafe ini makin ramai dan sukses!'
    ])
  })
])

export const CAFE_DIALOGUE = Object.freeze({
  soldOut: 'Wah, stoknya sedang habis. Aku akan kembali lain kali.',
  closed: 'Sepertinya cafe sedang tutup. Sampai jumpa nanti!',
  noMenu: 'Belum ada menu yang tersedia. Semoga segera dibuka!',
  npcTalkPrompt: 'Hai {name}, bagaimana suasana cafe hari ini?',
  staffTalkPrompt: 'Hai {name}, bagaimana shift-mu hari ini?'
})

export const CAFE_STAFF = Object.freeze({
  cashier: Object.freeze({ name: 'Kasir', salary: 15000, hiringCost: 50000, serviceBonus: 1 }),
  barista: Object.freeze({ name: 'Barista', salary: 18000, hiringCost: 75000, serviceBonus: 2 }),
  chef: Object.freeze({ name: 'Koki', salary: 20000, hiringCost: 100000, serviceBonus: 2 }),
  waiter: Object.freeze({ name: 'Pelayan', salary: 12000, hiringCost: 40000, serviceBonus: 2 }),
  cleaner: Object.freeze({ name: 'Petugas Kebersihan', salary: 10000, hiringCost: 30000, serviceBonus: 0 })
})

export const CAFE_STAFF_NAMES = Object.freeze({
  cashier: Object.freeze(['Alya', 'Niko', 'Tara', 'Rafi']),
  barista: Object.freeze(['Mika', 'Dara', 'Kei', 'Reno']),
  chef: Object.freeze(['Sinta', 'Arga', 'Luna', 'Bima']),
  waiter: Object.freeze(['Nara', 'Dio', 'Sora', 'Fina']),
  cleaner: Object.freeze(['Yuna', 'Raka', 'Cleo', 'Iman'])
})

export const CAFE_STAFF_DIALOGUE = Object.freeze({
  cashier: Object.freeze([
    'Semua transaksi shift ini sudah kucatat rapi. Terima kasih sudah menjaga modal bisnis.',
    'Kalau ingin mengecek pemasukan, laporan Cafe selalu siap dibuka.'
  ]),
  barista: Object.freeze([
    'Aku sedang meracik menu minuman favorit pengunjung. Pastikan stok bahan selalu tersedia, ya.',
    'Kalau upahku ditingkatkan, aku bisa melayani dengan lebih bersemangat!'
  ]),
  chef: Object.freeze([
    'Dapur siap bekerja! Tambahkan menu dan bahan baku agar lebih banyak pesanan bisa disajikan.',
    'Aku akan menjaga kualitas masakan. Coba cek stok sebelum shift berikutnya.'
  ]),
  waiter: Object.freeze([
    'Aku siap mengantar pesanan. Cafe yang nyaman bikin pengunjung betah.',
    'Semakin baik pelayanan tim, semakin besar peluang pengunjung kembali.'
  ]),
  cleaner: Object.freeze([
    'Area Cafe sudah kurapikan agar semua pengunjung merasa nyaman.',
    'Suasana bersih dan menu yang tersedia membuat pengalaman pelanggan makin baik.'
  ])
})

export const CAFE_CCTV_STORIES = Object.freeze([
  Object.freeze({
    title: 'Jam Sibuk',
    story: 'Suasana ramai. Para pengunjung memenuhi meja, sementara staf bergerak cepat melayani pesanan.'
  }),
  Object.freeze({
    title: 'Barista Beraksi',
    story: 'Aroma kopi tercium dari area bar. Barista meracik minuman dengan cekatan dan pelanggan terlihat puas.'
  }),
  Object.freeze({
    title: 'Dapur Produktif',
    story: 'Dari dapur terdengar aktivitas memasak. Koki menyiapkan pesanan, sementara pelayan mengantar hidangan.'
  }),
  Object.freeze({
    title: 'Suasana Santai',
    story: 'Cafe terasa tenang dan nyaman. Beberapa pengunjung berbincang santai sambil menikmati menu.'
  }),
  Object.freeze({
    title: 'Inspeksi Kebersihan',
    story: 'Area meja dan layanan terpantau rapi. Staf memastikan cafe tetap bersih dan siap menerima pengunjung.'
  })
])

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
