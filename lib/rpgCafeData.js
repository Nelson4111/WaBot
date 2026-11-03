import {
  hargaBeli as RESTAURANT_PRICES,
  formatMasakanNama,
  masakanResep,
  minumanMasakan
} from './rpg-masakanData.js'

export const CAFE_SETUP_COST = 5000000
export const CAFE_DEFAULT_CAPACITY = 6
export const CAFE_MAX_CUSTOMERS_PER_SHIFT = 50
export const CAFE_MAX_STAFF_SALARY_MULTIPLIER = 100
export const CAFE_BASE_MENU_LIMIT = 8
export const CAFE_MENU_LIMIT_PER_LEVEL = 2
export const CAFE_SHIFT_MS = 12 * 60 * 60 * 1000
export const CAFE_OPERATING_COST_PER_SHIFT = 5000
export const CAFE_MENU_PRICE_MIN_BPS = 5000
export const CAFE_MENU_PRICE_MAX_BPS = 30000
export const CAFE_MENU_PAGE_SIZE = 10
export const CAFE_INGREDIENT_PAGE_SIZE = 20
export const CAFE_THEME_PAGE_SIZE = 7
export const CAFE_VISITOR_STAY_MS = 30 * 60 * 1000
export const CAFE_VISIT_COOLDOWN_MS = 10 * 60 * 1000
export const CAFE_CCTV_COOLDOWN_MS = 5 * 60 * 1000
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

const restaurantMenuEntries = Object.entries(RESTAURANT_PRICES)
  .filter(([id]) => masakanResep[id])
  .sort(([leftId, left], [rightId, right]) => {
    const leftDrink = minumanMasakan.includes(leftId)
    const rightDrink = minumanMasakan.includes(rightId)
    return Number(leftDrink) - Number(rightDrink) || left.harga - right.harga || leftId.localeCompare(rightId, 'id')
  })

export const CAFE_MENU_CATALOG = Object.freeze(Object.fromEntries(
  restaurantMenuEntries.map(([id, price]) => {
    const recipe = masakanResep[id]
    return [id, Object.freeze({
      id,
      emoji: recipe.emoji || price.emoji || '🍽️',
      name: formatMasakanNama(id),
      category: minumanMasakan.includes(id) ? 'minuman' : 'makanan',
      basePrice: price.harga,
      ingredients: Object.freeze({ ...(recipe.bahan || {}) })
    })]
  })
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
  Object.freeze({ id: 'mika', name: 'Mika', preference: 'minuman', greeting: 'Aroma kopinya harum sekali.', order: 'Aku pesan {menu}, ya.', thanks: 'Pas sekali buat menemani hari ini!', talk: Object.freeze(['Aku suka mampir ke sini setelah menyelesaikan urusan di pusat kota.', 'Kalau suasananya setenang ini, rasanya ingin duduk lebih lama.']) }),
  Object.freeze({ id: 'raka', name: 'Raka', preference: 'makanan', greeting: 'Aku lapar setelah berkeliling Avelia.', order: 'Ada {menu}? Satu porsi, ya.', thanks: 'Enak sekali, nanti aku mampir lagi.', talk: Object.freeze(['Aku sedang mencari tempat makan favorit baru. Sepertinya ketemu!', 'Porsi dan suasananya pas sekali untuk istirahat.']) }),
  Object.freeze({ id: 'nara', name: 'Nara', preference: 'minuman', greeting: 'Suasananya nyaman dan menenangkan.', order: 'Aku ingin mencoba {menu}.', thanks: 'Terima kasih, rasanya menyegarkan!', talk: Object.freeze(['Aku suka mencoba minuman baru. Menu di sini menarik sekali.', 'Perjalanan keliling Avelia jadi lebih menyenangkan setelah istirahat.']) }),
  Object.freeze({ id: 'bima', name: 'Bima', preference: 'makanan', greeting: 'Semoga ada makanan favoritku.', order: 'Tolong siapkan {menu} untukku.', thanks: 'Porsinya pas, terima kasih!', talk: Object.freeze(['Aroma masakannya membuatku penasaran sejak dari luar.', 'Aku mungkin akan mengajak teman-temanku ke sini besok.']) }),
  Object.freeze({ id: 'sora', name: 'Sora', preference: 'bebas', greeting: 'Aku baru pertama kali berkunjung.', order: 'Rekomendasikan {menu} untukku.', thanks: 'Aku suka tempat ini!', talk: Object.freeze(['Ini kunjungan pertamaku, tapi sepertinya bukan yang terakhir.', 'Ada sudut yang nyaman untuk membaca sambil menikmati pesanan.']) }),
  Object.freeze({ id: 'dimas', name: 'Dimas', preference: 'bebas', greeting: 'Hai! Ada menu spesial hari ini?', order: 'Aku pesan {menu}.', thanks: 'Pelayanannya ramah, pasti kembali.', talk: Object.freeze(['Aku sering mencari cafe yang punya suasana hangat seperti ini.', 'Jangan lupa mencoba menu andalan mereka!']) }),
  Object.freeze({ id: 'keira', name: 'Keira', preference: 'minuman', greeting: 'Aku penasaran dengan minuman racikan di sini.', order: 'Boleh rekomendasikan {menu}?', thanks: 'Racikannya unik dan enak!', talk: Object.freeze(['Aku suka melihat barista membuat minuman dengan teliti.', 'Kalau ada menu musiman, kabari aku ya!']) }),
  Object.freeze({ id: 'juno', name: 'Juno', preference: 'makanan', greeting: 'Wah, dari luar saja aromanya sudah menggoda.', order: 'Aku mau coba {menu}.', thanks: 'Rasanya cocok sekali!', talk: Object.freeze(['Aku baru selesai latihan, jadi butuh makanan yang mengenyangkan.', 'Tempatnya nyaman, pelayanannya juga cepat.']) }),
  Object.freeze({ id: 'lila', name: 'Lila', preference: 'bebas', greeting: 'Tempatnya terlihat cantik dan nyaman.', order: 'Aku ikut rekomendasi cafe untuk {menu}.', thanks: 'Pilihan yang tepat, terima kasih!', talk: Object.freeze(['Aku sedang mencari inspirasi untuk menggambar interior cafe.', 'Warna dan dekorasinya membuat suasananya terasa hidup.']) }),
  Object.freeze({ id: 'fajar', name: 'Fajar', preference: 'bebas', greeting: 'Halo! Aku mampir sebentar sebelum melanjutkan perjalanan.', order: 'Sepertinya aku akan pesan {menu}.', thanks: 'Waktunya istirahat jadi lebih menyenangkan.', talk: Object.freeze(['Aku sedang berkeliling Avelia dan senang menemukan tempat ini.', 'Semoga cafe ini makin ramai dan sukses!']) }),
  Object.freeze({ id: 'alena', name: 'Alena', preference: 'minuman', greeting: 'Hari ini cocok untuk menikmati sesuatu yang dingin.', order: 'Aku mau {menu}, sepertinya menarik.', thanks: 'Segar sekali, persis yang kubutuhkan!', talk: Object.freeze(['Aku suka duduk dekat jendela sambil melihat suasana jalan.', 'Kadang hal sederhana seperti secangkir minuman bisa memperbaiki suasana hati.']) }),
  Object.freeze({ id: 'kenzo', name: 'Kenzo', preference: 'makanan', greeting: 'Wah, pilihan makanannya cukup banyak.', order: 'Aku ambil {menu} satu, ya.', thanks: 'Mantap! Rasanya memuaskan.', talk: Object.freeze(['Aku biasanya makan terburu-buru, tapi hari ini ingin bersantai.', 'Tempat seperti ini cocok untuk melepas penat.']) }),
  Object.freeze({ id: 'yuna', name: 'Yuna', preference: 'minuman', greeting: 'Aku butuh minuman manis untuk hari ini.', order: 'Bisa buatkan {menu}?', thanks: 'Manisnya pas, aku suka!', talk: Object.freeze(['Aku selalu penasaran dengan kombinasi rasa yang tidak biasa.', 'Mungkin lain kali aku akan mengajak sahabatku kemari.']) }),
  Object.freeze({ id: 'ardian', name: 'Ardian', preference: 'makanan', greeting: 'Perutku sudah berbunyi sejak tadi.', order: 'Aku pesan {menu} yang satu itu.', thanks: 'Akhirnya bisa makan dengan tenang!', talk: Object.freeze(['Seharian ini aku sibuk mengurus banyak hal.', 'Makanan enak memang bisa membuat hari terasa lebih baik.']) }),
  Object.freeze({ id: 'celine', name: 'Celine', preference: 'bebas', greeting: 'Aku suka sekali dekorasi tempat ini.', order: 'Sepertinya {menu} cocok untukku.', thanks: 'Semuanya terasa menyenangkan di sini.', talk: Object.freeze(['Aku senang menemukan tempat baru dengan desain menarik.', 'Suasananya cocok untuk menghabiskan waktu luang.']) }),
  Object.freeze({ id: 'rio', name: 'Rio', preference: 'bebas', greeting: 'Ada tempat kosong? Aku ingin istirahat.', order: 'Aku pesan {menu} saja.', thanks: 'Terima kasih, pelayanannya cepat.', talk: Object.freeze(['Aku baru saja menyelesaikan pekerjaan hari ini.', 'Rasanya menyenangkan bisa duduk tanpa terburu-buru.']) }),
  Object.freeze({ id: 'kiara', name: 'Kiara', preference: 'minuman', greeting: 'Aku ingin mencoba sesuatu yang belum pernah kuminum.', order: 'Bagaimana kalau aku mencoba {menu}?', thanks: 'Wah, ternyata seenak ini!', talk: Object.freeze(['Aku suka mengoleksi pengalaman dari tempat-tempat baru.', 'Setiap cafe biasanya punya minuman andalannya sendiri.']) }),
  Object.freeze({ id: 'elvan', name: 'Elvan', preference: 'makanan', greeting: 'Aroma dari dapur benar-benar menggoda.', order: 'Tolong buatkan {menu}.', thanks: 'Rasanya luar biasa, terima kasih!', talk: Object.freeze(['Aku suka makanan yang dibuat dengan bahan segar.', 'Sepertinya chef di sini tahu cara memasak dengan baik.']) }),
  Object.freeze({ id: 'freya', name: 'Freya', preference: 'bebas', greeting: 'Akhirnya menemukan cafe yang ingin kukunjungi.', order: 'Aku tertarik dengan {menu}.', thanks: 'Pengalaman yang menyenangkan!', talk: Object.freeze(['Aku sedang mencari tempat untuk menghabiskan akhir pekan.', 'Mungkin cafe ini akan masuk daftar favoritku.']) }),
  Object.freeze({ id: 'galih', name: 'Galih', preference: 'makanan', greeting: 'Semoga makanannya bisa mengisi energiku.', order: 'Aku mau {menu} dengan porsi biasa.', thanks: 'Nah, sekarang tenagaku kembali!', talk: Object.freeze(['Aku banyak berjalan hari ini sampai merasa lapar.', 'Makan dulu sebelum melanjutkan aktivitas.']) }),
  Object.freeze({ id: 'hana', name: 'Hana', preference: 'minuman', greeting: 'Cuacanya membuatku ingin minum sesuatu.', order: 'Aku ingin menikmati {menu}.', thanks: 'Rasanya lembut dan menyenangkan.', talk: Object.freeze(['Aku suka suasana cafe saat tidak terlalu ramai.', 'Suara percakapan kecil justru membuat tempat ini terasa hidup.']) }),
  Object.freeze({ id: 'ivan', name: 'Ivan', preference: 'bebas', greeting: 'Halo, tempat ini terlihat menjanjikan.', order: 'Aku coba {menu} hari ini.', thanks: 'Tidak mengecewakan sama sekali!', talk: Object.freeze(['Aku sering mengunjungi tempat berbeda setiap minggu.', 'Selalu menarik menemukan cafe dengan ciri khas sendiri.']) }),
  Object.freeze({ id: 'jasmine', name: 'Jasmine', preference: 'minuman', greeting: 'Aku sedang ingin menikmati minuman favorit.', order: 'Boleh siapkan {menu} untukku?', thanks: 'Rasanya membuatku ingin memesan lagi.', talk: Object.freeze(['Aku suka menikmati minuman sambil mendengarkan musik.', 'Hari yang sibuk terasa lebih ringan setelah beristirahat.']) }),
  Object.freeze({ id: 'kael', name: 'Kael', preference: 'makanan', greeting: 'Wah, banyak pilihan yang terlihat lezat.', order: 'Aku pilih {menu}.', thanks: 'Ini benar-benar memuaskan!', talk: Object.freeze(['Aku tidak terlalu pilih-pilih makanan selama rasanya enak.', 'Tempat ini punya potensi menjadi langgananku.']) }),
  Object.freeze({ id: 'luna', name: 'Luna', preference: 'bebas', greeting: 'Suasana di sini terasa damai.', order: 'Aku ingin memesan {menu}.', thanks: 'Terima kasih, semuanya sempurna.', talk: Object.freeze(['Aku suka menghabiskan waktu dengan membaca buku.', 'Cafe yang tenang seperti ini selalu membuatku nyaman.']) }),
  Object.freeze({ id: 'mahes', name: 'Mahes', preference: 'makanan', greeting: 'Aku mencium aroma makanan dari luar.', order: 'Boleh pesan {menu} satu?', thanks: 'Enak sekali, porsinya juga pas.', talk: Object.freeze(['Aku sedang mencari tempat makan yang tidak terlalu bising.', 'Sepertinya aku akan merekomendasikan tempat ini kepada keluarga.']) }),
  Object.freeze({ id: 'niko', name: 'Niko', preference: 'minuman', greeting: 'Aku butuh kopi untuk melanjutkan pekerjaan.', order: 'Satu {menu} untuk menemani pekerjaanku.', thanks: 'Kopinya pas, terima kasih.', talk: Object.freeze(['Aku kadang bekerja dari cafe agar tidak bosan di rumah.', 'Wi-Fi dan minuman enak adalah kombinasi terbaik.']) }),
  Object.freeze({ id: 'olivia', name: 'Olivia', preference: 'bebas', greeting: 'Tempat ini punya suasana yang menarik.', order: 'Aku ingin mencoba {menu}.', thanks: 'Aku sangat menikmati kunjungan ini.', talk: Object.freeze(['Aku suka memperhatikan detail kecil dari sebuah tempat.', 'Dekorasi sederhana terkadang justru terlihat paling menarik.']) }),
  Object.freeze({ id: 'putra', name: 'Putra', preference: 'makanan', greeting: 'Aku belum sempat makan sejak pagi.', order: 'Aku pesan {menu} sekarang, ya.', thanks: 'Akhirnya kenyang juga!', talk: Object.freeze(['Hari ini jadwalku padat sekali.', 'Aku harus kembali bekerja setelah mengisi perut.']) }),
  Object.freeze({ id: 'qiana', name: 'Qiana', preference: 'minuman', greeting: 'Aku ingin sesuatu yang menyegarkan.', order: 'Buatkan aku {menu}, ya.', thanks: 'Wah, rasanya menyegarkan sekali!', talk: Object.freeze(['Aku suka mencoba minuman dengan topping berbeda.', 'Tampilan minumannya juga cantik sekali.']) }),
  Object.freeze({ id: 'rafi', name: 'Rafi', preference: 'bebas', greeting: 'Hai! Aku sedang mencari tempat untuk bersantai.', order: 'Aku tertarik memesan {menu}.', thanks: 'Tempat yang bagus, aku suka.', talk: Object.freeze(['Aku biasanya menghabiskan waktu bersama teman-teman.', 'Sesekali datang sendiri juga terasa menyenangkan.']) }),
  Object.freeze({ id: 'selena', name: 'Selena', preference: 'makanan', greeting: 'Aku penasaran dengan hidangan andalan di sini.', order: 'Aku mau mencoba {menu}.', thanks: 'Presentasinya cantik, rasanya juga enak!', talk: Object.freeze(['Aku suka makanan yang disajikan dengan menarik.', 'Rasanya ingin memotret semua menu di sini.']) }),
  Object.freeze({ id: 'tama', name: 'Tama', preference: 'makanan', greeting: 'Setelah beraktivitas, aku butuh makanan.', order: 'Satu {menu} untukku.', thanks: 'Cocok sekali untuk mengisi tenaga.', talk: Object.freeze(['Aku baru selesai membantu temanku pindahan.', 'Sepertinya aku akan beristirahat cukup lama di sini.']) }),
  Object.freeze({ id: 'una', name: 'Una', preference: 'minuman', greeting: 'Aku ingin duduk sambil menikmati minuman.', order: 'Aku pesan {menu}, boleh?', thanks: 'Rasanya menyenangkan sekali.', talk: Object.freeze(['Aku suka mengamati orang-orang yang berlalu lalang.', 'Tempat ini punya suasana yang sulit ditemukan di tempat lain.']) }),
  Object.freeze({ id: 'vito', name: 'Vito', preference: 'bebas', greeting: 'Halo! Aku sedang menjelajahi Avelia.', order: 'Rekomendasikan {menu} yang paling menarik.', thanks: 'Pilihan yang bagus, terima kasih!', talk: Object.freeze(['Aku suka menjelajahi berbagai sudut kota.', 'Menemukan cafe baru selalu menjadi bagian menyenangkan dari perjalanan.']) }),
  Object.freeze({ id: 'wulan', name: 'Wulan', preference: 'minuman', greeting: 'Aku sedang ingin menikmati minuman hangat.', order: 'Boleh buatkan {menu} hangat?', thanks: 'Hangatnya pas sekali.', talk: Object.freeze(['Aku paling suka suasana sore di cafe.', 'Rasanya cocok untuk mengobrol santai bersama teman.']) }),
  Object.freeze({ id: 'xavier', name: 'Xavier', preference: 'makanan', greeting: 'Aku datang karena mencium aroma masakan yang lezat.', order: 'Aku ingin satu porsi {menu}.', thanks: 'Kualitasnya bagus sekali!', talk: Object.freeze(['Aku cukup memperhatikan rasa dan kualitas makanan.', 'Sepertinya bahan-bahan yang digunakan masih segar.']) }),
  Object.freeze({ id: 'yuki', name: 'Yuki', preference: 'minuman', greeting: 'Aku senang mencoba menu minuman yang unik.', order: 'Aku mau {menu}, sepertinya menarik.', thanks: 'Aku suka rasa dan aromanya!', talk: Object.freeze(['Aku suka minuman dengan aroma yang khas.', 'Lain kali aku ingin mencoba menu lainnya.']) }),
  Object.freeze({ id: 'zayn', name: 'Zayn', preference: 'bebas', greeting: 'Akhirnya ada waktu untuk bersantai.', order: 'Aku pesan {menu} saja.', thanks: 'Pelayanannya memuaskan.', talk: Object.freeze(['Beberapa hari ini aku cukup sibuk.', 'Istirahat sebentar ternyata bisa membuat pikiran lebih segar.']) }),
  Object.freeze({ id: 'adira', name: 'Adira', preference: 'makanan', greeting: 'Aku sedang ingin makan sesuatu yang lezat.', order: 'Tolong rekomendasikan {menu}.', thanks: 'Terima kasih, aku puas sekali!', talk: Object.freeze(['Aku senang mencoba resep dan makanan baru.', 'Mungkin aku bisa mendapat inspirasi memasak dari tempat ini.']) }),
  Object.freeze({ id: 'bastian', name: 'Bastian', preference: 'minuman', greeting: 'Ada minuman yang cocok untuk menemani sore?', order: 'Aku pesan {menu}, ya.', thanks: 'Pas sekali untuk sore hari.', talk: Object.freeze(['Aku sering mampir setelah pulang kerja.', 'Perjalanan pulang terasa lebih menyenangkan setelah istirahat.']) }),
  Object.freeze({ id: 'clarissa', name: 'Clarissa', preference: 'bebas', greeting: 'Aku suka suasana cafe yang ramai tapi nyaman.', order: 'Sepertinya {menu} pilihan yang tepat.', thanks: 'Aku menikmati semuanya!', talk: Object.freeze(['Aku senang mendengar musik yang diputar di sini.', 'Playlist-nya cocok sekali dengan suasana cafe.']) }),
  Object.freeze({ id: 'daniel', name: 'Daniel', preference: 'makanan', greeting: 'Aku sedang mencari makanan untuk mengganjal perut.', order: 'Aku pesan {menu} satu.', thanks: 'Enak dan mengenyangkan!', talk: Object.freeze(['Aku belum sempat makan siang tadi.', 'Untung saja menemukan cafe ini sebelum terlalu malam.']) }),
  Object.freeze({ id: 'evelyn', name: 'Evelyn', preference: 'minuman', greeting: 'Aku ingin menikmati sesuatu yang istimewa.', order: 'Aku tertarik dengan {menu}.', thanks: 'Rasanya unik, aku menyukainya!', talk: Object.freeze(['Aku senang mencoba racikan yang berbeda dari biasanya.', 'Setiap rasa punya cerita tersendiri.']) }),
  Object.freeze({ id: 'farrel', name: 'Farrel', preference: 'bebas', greeting: 'Hai! Sepertinya tempat ini cocok untuk nongkrong.', order: 'Aku ikut rekomendasi untuk {menu}.', thanks: 'Mantap, aku pasti kembali!', talk: Object.freeze(['Aku sedang mencari tempat nongkrong baru bersama teman.', 'Tempat ini sepertinya cocok untuk berkumpul.']) }),
  Object.freeze({ id: 'grace', name: 'Grace', preference: 'makanan', greeting: 'Aku tertarik melihat pilihan makanan di sini.', order: 'Aku ingin mencoba {menu}.', thanks: 'Rasanya sesuai harapanku!', talk: Object.freeze(['Aku suka tempat yang memperhatikan kualitas penyajian.', 'Makanan yang enak selalu membuat suasana hati lebih baik.']) }),
  Object.freeze({ id: 'hafiz', name: 'Hafiz', preference: 'bebas', greeting: 'Aku mampir setelah menyelesaikan urusan di kota.', order: 'Boleh siapkan {menu}?', thanks: 'Terima kasih atas pelayanannya.', talk: Object.freeze(['Hari ini cukup melelahkan, tapi semuanya berjalan lancar.', 'Aku senang bisa menemukan tempat untuk beristirahat.']) }),
  Object.freeze({ id: 'indira', name: 'Indira', preference: 'minuman', greeting: 'Aku suka aroma minuman yang baru dibuat.', order: 'Aku mau mencoba {menu}.', thanks: 'Aromanya enak, rasanya juga!', talk: Object.freeze(['Aku suka memperhatikan proses pembuatan minuman.', 'Hal kecil seperti ini membuat kunjungan terasa spesial.']) }),
  Object.freeze({ id: 'javier', name: 'Javier', preference: 'makanan', greeting: 'Aku datang dengan perut kosong.', order: 'Satu {menu}, tolong.', thanks: 'Nah, ini baru makanan yang kucari!', talk: Object.freeze(['Aku selalu mencari porsi yang pas dengan harga yang wajar.', 'Tempat ini layak untuk dikunjungi lagi.']) }),
  Object.freeze({ id: 'kamila', name: 'Kamila', preference: 'bebas', greeting: 'Aku ingin menghabiskan waktu luang di sini.', order: 'Aku pilih {menu} untuk hari ini.', thanks: 'Pengalaman yang menyenangkan, terima kasih!', talk: Object.freeze(['Aku sedang menikmati waktu liburku.', 'Tidak ada yang lebih menyenangkan daripada bersantai tanpa terburu-buru.']) }),
  Object.freeze({ id: 'leo', name: 'Leo', preference: 'minuman', greeting: 'Aku butuh sesuatu untuk menyegarkan pikiran.', order: 'Satu {menu} untukku.', thanks: 'Segar dan nikmat!', talk: Object.freeze(['Aku sedang menyusun rencana untuk perjalanan berikutnya.', 'Minuman enak membuatku lebih bersemangat.']) }),
  Object.freeze({ id: 'melody', name: 'Melody', preference: 'bebas', greeting: 'Musik di sini enak didengar.', order: 'Aku ingin memesan {menu}.', thanks: 'Semuanya terasa pas!', talk: Object.freeze(['Aku suka cafe yang punya pilihan musik bagus.', 'Rasanya ingin duduk di sini sambil menikmati lagu favorit.']) })
]);

export const CAFE_DIALOGUE = Object.freeze({
  soldOut: Object.freeze([
    'Wah, stoknya sedang habis. Aku akan kembali lain kali.',
    'Sepertinya menu itu sudah habis terjual hari ini.',
    'Yah, sayang sekali. Aku datang sedikit terlambat.',
    'Tidak apa-apa, mungkin besok aku bisa mendapatkannya.',
    'Sepertinya banyak pelanggan menyukai menu itu.',
    'Wah, aku kehabisan kesempatan mencobanya hari ini.',
    'Baiklah, aku akan mencoba menu lain saat berkunjung lagi.',
    'Sayang sekali, padahal aku sudah menantikannya.',
    'Sepertinya aku harus datang lebih awal lain kali.',
    'Tidak masalah, semoga stoknya tersedia kembali besok.'
  ]),

  closed: Object.freeze([
    'Sepertinya cafe sedang tutup. Sampai jumpa nanti!',
    'Yah, aku datang di waktu yang kurang tepat.',
    'Pintunya masih tertutup. Aku akan kembali nanti.',
    'Sepertinya belum waktunya cafe ini beroperasi.',
    'Baiklah, mungkin aku bisa mampir besok.',
    'Sayang sekali, aku sudah ingin menikmati suasananya.',
    'Sepertinya semua pegawai sedang beristirahat.',
    'Cafe ini sedang tidak menerima pelanggan. Sampai nanti!',
    'Aku akan kembali saat cafe sudah dibuka.',
    'Semoga besok aku bisa menikmati menu favoritku di sini.'
  ]),

  noMenu: Object.freeze([
    'Belum ada menu yang tersedia. Semoga segera dibuka!',
    'Sepertinya pemilik cafe belum menambahkan menu.',
    'Wah, aku belum menemukan sesuatu untuk dipesan.',
    'Aku penasaran dengan menu yang akan disediakan nanti.',
    'Semoga cafe ini segera memiliki pilihan makanan dan minuman.',
    'Belum ada yang bisa kupesan. Aku akan menunggu.',
    'Sepertinya daftar menunya masih kosong.',
    'Aku akan kembali setelah ada menu baru.',
    'Cafe ini terlihat menarik, semoga menunya segera tersedia.',
    'Aku tidak sabar melihat hidangan apa saja yang akan ditawarkan.'
  ]),

  npcTalkPrompt: Object.freeze([
    'Hai {name}, bagaimana suasana cafe hari ini?',
    'Halo {name}! Apa ada sesuatu yang menarik hari ini?',
    'Hai {name}, sudah lama tidak melihatmu. Bagaimana kabarmu?',
    '{name}, apa kamu menikmati waktu di cafe ini?',
    'Halo! Bagaimana pengalamanmu berkunjung ke sini?',
    'Hai {name}, apakah ada menu yang menjadi favoritmu?',
    '{name}, menurutmu apa yang membuat cafe ini menarik?',
    'Halo {name}! Sedang menikmati waktu luang?',
    'Hai, bagaimana harimu sejauh ini, {name}?',
    '{name}, apakah kamu sering berkunjung ke cafe ini?',
    'Halo! Ada cerita menarik yang ingin kamu bagikan, {name}?',
    'Hai {name}, apa pendapatmu tentang pelayanan cafe ini?',
    '{name}, apakah kamu punya rekomendasi menu untukku?',
    'Bagaimana suasana hatimu hari ini, {name}?',
    'Hai! Apa yang membuatmu mampir ke sini hari ini?',
    '{name}, apakah kamu menemukan sesuatu yang menarik di Avelia?',
    'Halo {name}, bagaimana kesan pertamamu terhadap cafe ini?',
    'Hai, apakah kamu sedang menunggu seseorang, {name}?',
    '{name}, apa kamu punya rencana setelah dari sini?',
    'Menurutmu, waktu terbaik untuk mengunjungi cafe ini kapan, {name}?',
    'Hai {name}! Sudah mencoba menu andalan cafe ini?',
    'Apa kamu punya tempat favorit untuk duduk di sini, {name}?',
    '{name}, bagaimana pendapatmu tentang dekorasi cafe ini?',
    'Halo! Apa hari ini berjalan sesuai rencanamu, {name}?',
    'Hai {name}, sedang menikmati minuman atau makanan favoritmu?',
    'Apa ada tempat lain di Avelia yang menarik untuk dikunjungi, {name}?',
    '{name}, kalau bisa memilih, menu apa yang ingin kamu tambahkan di sini?',
    'Hai! Apakah kamu lebih suka suasana cafe yang ramai atau tenang, {name}?',
    'Apa kamu datang sendiri hari ini, {name}?',
    'Halo {name}! Ada pengalaman menyenangkan belakangan ini?',
    'Hai, apakah kamu punya cerita tentang perjalananmu hari ini, {name}?',
    '{name}, apa yang biasanya kamu lakukan saat sedang bersantai?',
    'Menurutmu, apa yang perlu ditingkatkan dari cafe ini, {name}?',
    'Hai {name}, apakah kamu suka mencoba tempat baru?',
    'Apa kamu punya kenangan menyenangkan di cafe ini, {name}?',
    'Halo! Bagaimana cuaca hari ini menurutmu, {name}?',
    '{name}, apakah kamu lebih suka kopi atau minuman lainnya?',
    'Hai! Kalau mengajak teman, siapa yang ingin kamu bawa ke sini, {name}?',
    'Apa kamu sedang mencari inspirasi hari ini, {name}?',
    '{name}, sudah berapa lama kamu mengenal tempat ini?',
    'Halo {name}! Apa hal sederhana yang membuatmu bahagia hari ini?',
    'Hai, apakah kamu punya aktivitas menarik untuk akhir pekan, {name}?',
    '{name}, bagaimana menurutmu kualitas makanan di sini?',
    'Apa kamu suka mendengarkan musik sambil bersantai, {name}?',
    'Hai! Apakah ada menu yang ingin kamu coba berikutnya, {name}?',
    'Halo {name}, kalau punya waktu luang, biasanya kamu pergi ke mana?',
    '{name}, apakah kamu lebih suka datang pagi atau sore hari?',
    'Hai! Apa kamu punya rekomendasi tempat menarik di sekitar sini, {name}?',
    'Bagaimana perjalananmu sampai ke cafe ini, {name}?',
    'Halo {name}! Semoga harimu menyenangkan. Ada kabar baru?'
  ]),

  staffTalkPrompt: Object.freeze([
    'Hai {name}, bagaimana shift-mu hari ini?',
    'Halo {name}! Apakah pekerjaan hari ini berjalan lancar?',
    '{name}, bagaimana keadaan cafe selama kamu bertugas?',
    'Hai, apakah hari ini banyak pelanggan yang datang?',
    'Halo {name}, ada kesulitan selama bekerja hari ini?',
    'Bagaimana suasana kerja hari ini, {name}?',
    '{name}, apakah semua pesanan pelanggan bisa ditangani dengan baik?',
    'Hai! Sudah sempat beristirahat, {name}?',
    'Halo {name}, bagaimana kondisi stok bahan hari ini?',
    'Apakah ada menu yang paling banyak dipesan hari ini, {name}?',
    '{name}, apakah kamu menikmati pekerjaanmu di sini?',
    'Hai, bagaimana kerja sama tim selama shift berlangsung?',
    'Halo! Apakah ada pelanggan yang memberikan masukan hari ini, {name}?',
    '{name}, apakah peralatan cafe berfungsi dengan baik?',
    'Bagaimana perkembangan pekerjaanmu hari ini, {name}?',
    'Hai! Apakah cafe cukup ramai selama shift-mu?',
    '{name}, apakah ada masalah yang perlu segera diperbaiki?',
    'Halo, bagaimana pelayanan kepada pelanggan hari ini?',
    'Apakah kamu merasa nyaman dengan jadwal kerjamu, {name}?',
    '{name}, apakah ada bahan makanan yang mulai menipis?',
    'Hai! Apa tugas yang paling menyibukkanmu hari ini?',
    'Halo {name}, apakah semua area cafe sudah dibersihkan?',
    '{name}, bagaimana pendapatmu tentang menu baru cafe?',
    'Apakah ada pelanggan yang memberikan pujian hari ini?',
    'Hai, bagaimana hubunganmu dengan rekan kerja lainnya, {name}?',
    '{name}, apakah kamu menemukan cara untuk bekerja lebih efisien?',
    'Halo! Apakah ada pesanan yang cukup sulit ditangani hari ini?',
    'Bagaimana kondisi kasir selama shift-mu, {name}?',
    'Hai {name}, apakah pelayanan hari ini berjalan sesuai standar?',
    'Apakah kamu membutuhkan perlengkapan tambahan untuk bekerja, {name}?',
    '{name}, bagaimana pendapatmu tentang kondisi cafe saat ini?',
    'Halo! Apa ada kejadian menarik selama kamu bertugas?',
    'Hai, apakah kamu sempat menghadapi pelanggan yang cukup sulit, {name}?',
    'Bagaimana pembagian tugas hari ini, {name}?',
    '{name}, apakah kamu punya saran untuk meningkatkan pelayanan cafe?',
    'Halo! Apakah target pekerjaan hari ini berhasil tercapai?',
    'Hai {name}, bagaimana kondisi dapur selama shift berlangsung?',
    'Apakah semua pesanan berhasil disajikan tepat waktu, {name}?',
    '{name}, apa bagian pekerjaan yang paling kamu sukai?',
    'Halo! Apakah ada hal baru yang kamu pelajari hari ini, {name}?',
    'Hai, apakah suasana kerja hari ini cukup menyenangkan?',
    '{name}, bagaimana respons pelanggan terhadap pelayananmu?',
    'Apakah kamu merasa beban kerjamu hari ini cukup seimbang, {name}?',
    'Halo {name}, apakah ada bahan yang perlu segera dipesan kembali?',
    'Hai! Bagaimana kondisi kebersihan seluruh area cafe?',
    '{name}, apakah kamu punya ide untuk membuat pelanggan lebih nyaman?',
    'Apakah ada kendala saat menyiapkan makanan atau minuman hari ini, {name}?',
    'Halo! Bagaimana semangatmu menjalani pekerjaan hari ini, {name}?',
    '{name}, apakah kamu sudah menyelesaikan semua tanggung jawab shift-mu?',
    'Terima kasih atas kerja kerasmu hari ini, {name}. Bagaimana perasaanmu?'
  ])
});

export const CAFE_STAFF = Object.freeze({
  cashier: Object.freeze({ name: 'Kasir', salary: 75000, hiringCost: 225000, serviceBonus: 1 }),
  barista: Object.freeze({ name: 'Barista', salary: 90000, hiringCost: 270000, serviceBonus: 2 }),
  chef: Object.freeze({ name: 'Koki', salary: 100000, hiringCost: 300000, serviceBonus: 2 }),
  waiter: Object.freeze({ name: 'Pelayan', salary: 70000, hiringCost: 210000, serviceBonus: 2 }),
  cleaner: Object.freeze({ name: 'Petugas Kebersihan', salary: 60000, hiringCost: 180000, serviceBonus: 0 })
})

export const CAFE_STAFF_NAMES = Object.freeze({
  cashier: Object.freeze(['Alya', 'Niko', 'Tara', 'Rafi', 'Keira', 'Dimas', 'Nadine', 'Elvan', 'Celine', 'Ardan', 'Kiara', 'Farel', 'Hana', 'Javier', 'Livia', 'Rizky', 'Amara', 'Kenzo', 'Selena', 'Bastian']),
  barista: Object.freeze(['Mika', 'Dara', 'Kei', 'Reno', 'Yuna', 'Kael', 'Freya', 'Ivan', 'Nara', 'Zayn', 'Alena', 'Juno', 'Viona', 'Raka', 'Evelyn', 'Hafiz', 'Qiana', 'Leon', 'Clarissa', 'Tama']),
  chef: Object.freeze(['Sinta', 'Arga', 'Luna', 'Bima', 'Adira', 'Darren', 'Olivia', 'Mahes', 'Jasmine', 'Galih', 'Indira', 'Xavier', 'Melody', 'Gavin', 'Anya', 'Daniel', 'Kamila', 'Vito', 'Grace', 'Putra']),
  waiter: Object.freeze(['Dio', 'Sora', 'Fina', 'Rania', 'Elio', 'Citra', 'Rian', 'Naomi', 'Tio', 'Bella', 'Alden', 'Zahra', 'Fajar', 'Laila', 'Ruben', 'Aurelia', 'Hendra', 'Maya', 'Theo', 'Shania']),
  cleaner: Object.freeze(['Cleo', 'Iman', 'Nayla', 'Davin', 'Aisha', 'Reyhan', 'Giselle', 'Rendra', 'Kirana', 'Dylan', 'Vanya', 'Adrian', 'Melissa', 'Rafael', 'Natasya', 'Ethan', 'Saskia', 'Rangga', 'Talitha', 'Bram'])
});

export const CAFE_STAFF_DIALOGUE = Object.freeze({
  cashier: Object.freeze([
    'Semua transaksi shift ini sudah kucatat rapi. Terima kasih sudah menjaga modal bisnis.',
    'Kalau ingin mengecek pemasukan, laporan Cafe selalu siap dibuka.',
    'Hari ini transaksi cukup ramai. Pastikan saldo bisnis selalu terpantau, ya.',
    'Aku sudah memeriksa setiap pembayaran agar tidak ada transaksi yang terlewat.',
    'Pencatatan keuangan yang rapi akan membantu perkembangan cafe.',
    'Jangan lupa mengecek laporan penjualan setelah operasional selesai.',
    'Semua pembayaran pelanggan sudah diproses dengan baik.',
    'Aku akan memastikan setiap pemasukan tercatat sesuai jumlahnya.',
    'Pengelolaan uang yang baik adalah salah satu kunci bisnis yang sukses.',
    'Terima kasih sudah mempercayakan urusan transaksi cafe kepadaku!',
    'Beberapa pelanggan membayar dengan nominal besar hari ini.',
    'Aku selalu memastikan uang kembalian diberikan dengan tepat.',
    'Laporan penjualan bisa menjadi bahan evaluasi untuk hari berikutnya.',
    'Jangan lupa periksa modal kasir sebelum cafe mulai beroperasi.',
    'Semua catatan transaksi tersimpan dengan aman.',
    'Aku senang ketika antrean pembayaran berjalan lancar.',
    'Promosi menarik bisa membantu meningkatkan jumlah transaksi.',
    'Setiap pemasukan kecil tetap penting bagi perkembangan bisnis.',
    'Aku akan menjaga agar proses pembayaran tetap cepat dan nyaman.',
    'Semoga pendapatan cafe terus meningkat setiap harinya!'
  ]),

  barista: Object.freeze([
    'Aku sedang meracik menu minuman favorit pengunjung. Pastikan stok bahan selalu tersedia, ya.',
    'Kalau upahku ditingkatkan, aku bisa melayani dengan lebih bersemangat!',
    'Aroma kopi yang baru digiling selalu membuat suasana cafe terasa istimewa.',
    'Aku ingin mencoba racikan baru agar pengunjung punya lebih banyak pilihan.',
    'Pastikan bahan minuman tidak kehabisan saat cafe sedang ramai.',
    'Setiap minuman harus dibuat dengan takaran yang tepat agar rasanya konsisten.',
    'Aku senang melihat pelanggan menikmati minuman racikanku.',
    'Peralatan barista harus selalu dijaga supaya proses pembuatan minuman lancar.',
    'Menu minuman yang bervariasi bisa membuat pelanggan semakin tertarik.',
    'Aku akan memberikan racikan terbaik untuk setiap pesanan yang masuk!',
    'Es batu dan susu adalah beberapa bahan yang harus selalu tersedia.',
    'Aku suka bereksperimen dengan perpaduan rasa baru.',
    'Minuman dengan tampilan menarik biasanya membuat pelanggan penasaran.',
    'Pastikan mesin kopi dibersihkan setelah digunakan.',
    'Aku akan menjaga kualitas setiap racikan agar pelanggan tidak kecewa.',
    'Suasana cafe terasa lebih hangat dengan aroma kopi segar.',
    'Jangan lupa memperbarui daftar minuman jika ada menu baru.',
    'Aku selalu berusaha menyelesaikan pesanan tanpa mengurangi kualitas.',
    'Bahan berkualitas akan menghasilkan minuman yang lebih nikmat.',
    'Semoga racikan hari ini menjadi favorit banyak pengunjung!'
  ]),

  chef: Object.freeze([
    'Dapur siap bekerja! Tambahkan menu dan bahan baku agar lebih banyak pesanan bisa disajikan.',
    'Aku akan menjaga kualitas masakan. Coba cek stok sebelum shift berikutnya.',
    'Bahan-bahan segar adalah rahasia makanan yang lezat.',
    'Aku punya beberapa ide resep baru yang mungkin cocok untuk cafe ini.',
    'Pastikan persediaan bahan makanan cukup sebelum jam sibuk.',
    'Setiap hidangan harus disiapkan dengan teliti agar pelanggan puas.',
    'Dapur hari ini cukup sibuk, tetapi semua pesanan berhasil kutangani.',
    'Variasi menu makanan bisa membuat cafe semakin menarik.',
    'Aku akan memastikan setiap hidangan memiliki rasa dan penyajian terbaik.',
    'Terima kasih sudah menyediakan perlengkapan dapur yang memadai!',
    'Bumbu yang tepat bisa membuat makanan sederhana terasa istimewa.',
    'Aku selalu memeriksa kualitas bahan sebelum mulai memasak.',
    'Menu baru bisa menjadi alasan pelanggan untuk kembali berkunjung.',
    'Pastikan peralatan memasak tersedia dan berfungsi dengan baik.',
    'Aku senang ketika pelanggan menyukai masakan yang kubuat.',
    'Persiapan bahan sebelum jam ramai sangat membantu pekerjaan dapur.',
    'Setiap resep membutuhkan perhatian agar hasilnya konsisten.',
    'Jangan sampai bahan utama habis ketika pesanan sedang banyak.',
    'Aku akan terus meningkatkan kualitas hidangan cafe ini.',
    'Semoga semua pelanggan puas dengan makanan yang disajikan!'
  ]),

  waiter: Object.freeze([
    'Aku siap mengantar pesanan. Cafe yang nyaman bikin pengunjung betah.',
    'Semakin baik pelayanan tim, semakin besar peluang pengunjung kembali.',
    'Semua meja sudah siap menerima pelanggan berikutnya.',
    'Aku akan memastikan setiap pesanan sampai ke meja yang tepat.',
    'Keramahan kecil bisa membuat pengalaman pelanggan jauh lebih menyenangkan.',
    'Jangan biarkan pengunjung menunggu terlalu lama untuk pesanan mereka.',
    'Hari ini banyak pelanggan datang bersama teman dan keluarga.',
    'Aku selalu berusaha memberikan pelayanan terbaik kepada setiap pengunjung.',
    'Cafe yang ramai membutuhkan kerja sama tim yang baik.',
    'Semoga semua pelanggan pulang dengan pengalaman yang menyenangkan!',
    'Aku akan menyambut setiap pengunjung dengan senyuman.',
    'Pastikan nomor meja tidak tertukar saat mengantar pesanan.',
    'Pelanggan yang merasa nyaman biasanya akan datang kembali.',
    'Aku siap membantu jika ada pengunjung yang membutuhkan sesuatu.',
    'Meja yang sudah kosong sebaiknya segera disiapkan kembali.',
    'Mendengarkan permintaan pelanggan adalah bagian penting dari pelayanan.',
    'Kerja sama dengan dapur membuat pesanan lebih cepat sampai.',
    'Aku senang melihat pengunjung menikmati waktu mereka di sini.',
    'Jangan lupa memastikan pesanan sesuai dengan permintaan pelanggan.',
    'Semoga cafe ini semakin ramai berkat pelayanan yang baik!'
  ]),

  cleaner: Object.freeze([
    'Area Cafe sudah kurapikan agar semua pengunjung merasa nyaman.',
    'Suasana bersih dan menu yang tersedia membuat pengalaman pelanggan makin baik.',
    'Semua meja dan kursi sudah kubersihkan sebelum pelanggan datang.',
    'Kebersihan cafe harus selalu dijaga, bahkan saat sedang ramai.',
    'Aku akan memastikan lantai tetap bersih dan tidak licin.',
    'Tempat sampah perlu diperiksa secara berkala agar cafe tetap rapi.',
    'Area dapur dan ruang pelanggan sama-sama membutuhkan perhatian.',
    'Cafe yang bersih memberikan kesan baik bagi setiap pengunjung.',
    'Aku sudah merapikan perlengkapan agar semuanya berada di tempatnya.',
    'Lingkungan yang nyaman dimulai dari kebersihan yang selalu terjaga!',
    'Jendela dan permukaan meja juga perlu dibersihkan secara rutin.',
    'Aku selalu memastikan tidak ada sampah yang tertinggal.',
    'Toilet cafe harus tetap bersih agar pengunjung merasa nyaman.',
    'Peralatan kebersihan harus disimpan kembali setelah digunakan.',
    'Aku akan memeriksa setiap sudut cafe sebelum shift berakhir.',
    'Area makan yang rapi membuat pelanggan lebih betah.',
    'Kebersihan dapur juga penting untuk menjaga kualitas makanan.',
    'Jangan lupa membersihkan tumpahan minuman agar lantai tetap aman.',
    'Aku senang melihat cafe selalu terlihat bersih dan terawat.',
    'Semoga pengunjung selalu merasa nyaman selama berada di sini!'
  ])
});

export const CAFE_CCTV_STORIES = Object.freeze([
  Object.freeze({ title: 'Jam Sibuk', story: 'Suasana ramai. Para pengunjung memenuhi meja, sementara staf bergerak cepat melayani pesanan.' }),
  Object.freeze({ title: 'Barista Beraksi', story: 'Aroma kopi tercium dari area bar. Barista meracik minuman dengan cekatan dan pelanggan terlihat puas.' }),
  Object.freeze({ title: 'Dapur Produktif', story: 'Dari dapur terdengar aktivitas memasak. Koki menyiapkan pesanan, sementara pelayan mengantar hidangan.' }),
  Object.freeze({ title: 'Suasana Santai', story: 'Cafe terasa tenang dan nyaman. Beberapa pengunjung berbincang santai sambil menikmati menu.' }),
  Object.freeze({ title: 'Inspeksi Kebersihan', story: 'Area meja dan layanan terpantau rapi. Staf memastikan cafe tetap bersih dan siap menerima pengunjung.' }),
  Object.freeze({ title: 'Antrean Kasir', story: 'Beberapa pelanggan mengantre di meja kasir. Kasir melayani pembayaran satu per satu dengan tertib.' }),
  Object.freeze({ title: 'Pesanan Bertumpuk', story: 'Beberapa pesanan masuk hampir bersamaan. Tim dapur dan barista bekerja sama menyelesaikannya.' }),
  Object.freeze({ title: 'Pelanggan Pertama', story: 'Seorang pengunjung memasuki cafe dan disambut ramah oleh waiter sebelum memilih tempat duduk.' }),
  Object.freeze({ title: 'Waktu Istirahat', story: 'Beberapa pengunjung terlihat menikmati waktu istirahat sambil berbincang dan menyantap pesanan mereka.' }),
  Object.freeze({ title: 'Persiapan Operasional', story: 'Para staf mulai menyiapkan perlengkapan, memeriksa area kerja, dan memastikan cafe siap dibuka.' }),
  Object.freeze({ title: 'Meja Favorit', story: 'Beberapa pelanggan memilih duduk dekat jendela. Mereka menikmati pemandangan luar sambil menyantap pesanan.' }),
  Object.freeze({ title: 'Pelayanan Cepat', story: 'Waiter terlihat sigap mengantarkan beberapa hidangan. Pesanan sampai ke meja pelanggan tanpa menunggu lama.' }),
  Object.freeze({ title: 'Racikan Spesial', story: 'Barista sedang mencoba perpaduan bahan baru di area bar. Seorang rekan kerja memperhatikan proses racikannya.' }),
  Object.freeze({ title: 'Evaluasi Dapur', story: 'Chef memeriksa persediaan bahan dan mengevaluasi hidangan sebelum melanjutkan aktivitas memasak.' }),
  Object.freeze({ title: 'Pengunjung Baru', story: 'Sekelompok pengunjung datang untuk pertama kalinya. Mereka terlihat memperhatikan dekorasi dan daftar menu cafe.' }),
  Object.freeze({ title: 'Obrolan Hangat', story: 'Dua pelanggan duduk berhadapan sambil berbincang akrab. Sesekali mereka tertawa menikmati suasana.' }),
  Object.freeze({ title: 'Pembersihan Meja', story: 'Cleaner segera merapikan meja yang baru ditinggalkan pelanggan agar siap digunakan pengunjung berikutnya.' }),
  Object.freeze({ title: 'Pesanan Takeaway', story: 'Seorang pelanggan mengambil pesanan untuk dibawa pulang. Kasir memastikan pembayaran dan pesanan sudah sesuai.' }),
  Object.freeze({ title: 'Menu Terlaris', story: 'Beberapa pelanggan terlihat memesan hidangan yang sama. Dapur mulai menyiapkan tambahan bahan untuk menu tersebut.' }),
  Object.freeze({ title: 'Suasana Sore', story: 'Cahaya sore masuk melalui jendela. Pengunjung menikmati minuman sambil bersantai setelah beraktivitas.' }),
  Object.freeze({ title: 'Pemeriksaan Stok', story: 'Seorang staf memeriksa bahan baku di area penyimpanan dan mencatat beberapa persediaan yang mulai menipis.' }),
  Object.freeze({ title: 'Kerja Sama Tim', story: 'Kasir, barista, chef, dan waiter terlihat saling berkoordinasi untuk memastikan seluruh pesanan terselesaikan.' }),
  Object.freeze({ title: 'Kunjungan Keluarga', story: 'Sebuah keluarga datang bersama anak-anak. Waiter membantu mereka memilih meja yang cukup luas.' }),
  Object.freeze({ title: 'Pelanggan Sendirian', story: 'Seorang pengunjung duduk sendiri sambil membaca sesuatu. Sesekali ia berhenti untuk menikmati minumannya.' }),
  Object.freeze({ title: 'Area Bar Ramai', story: 'Beberapa pesanan minuman datang berurutan. Barista sibuk menyiapkan gelas dan meracik setiap pesanan.' }),
  Object.freeze({ title: 'Pengantaran Hidangan', story: 'Waiter membawa beberapa piring dari dapur menuju area pelanggan dengan hati-hati.' }),
  Object.freeze({ title: 'Dekorasi Cafe', story: 'Seorang pengunjung terlihat mengambil foto dekorasi dan sudut ruangan sebelum kembali menikmati pesanannya.' }),
  Object.freeze({ title: 'Pelanggan Berulang', story: 'Seorang pelanggan yang tampaknya sudah familiar datang kembali dan langsung memilih tempat duduk favoritnya.' }),
  Object.freeze({ title: 'Pergantian Shift', story: 'Staf yang baru datang menerima informasi pekerjaan dari rekan sebelumnya sebelum mulai bertugas.' }),
  Object.freeze({ title: 'Jam Makan Siang', story: 'Pengunjung mulai berdatangan untuk makan siang. Aktivitas dapur meningkat dan waiter sibuk melayani meja.' }),
  Object.freeze({ title: 'Minuman Tumpah', story: 'Sebuah gelas tidak sengaja tersenggol hingga isinya tumpah. Cleaner segera membersihkan area tersebut.' }),
  Object.freeze({ title: 'Diskusi Menu', story: 'Chef dan pemilik cafe terlihat berdiskusi mengenai hidangan baru yang mungkin akan ditambahkan ke daftar menu.' }),
  Object.freeze({ title: 'Pelanggan Menunggu', story: 'Seorang pelanggan menunggu pesanannya sambil melihat aktivitas barista dari tempat duduknya.' }),
  Object.freeze({ title: 'Suasana Akhir Pekan', story: 'Cafe terlihat lebih ramai dari biasanya. Banyak pengunjung datang bersama teman untuk menghabiskan waktu libur.' }),
  Object.freeze({ title: 'Pemeriksaan Peralatan', story: 'Barista memeriksa mesin kopi dan perlengkapan lainnya sebelum melanjutkan pembuatan minuman.' }),
  Object.freeze({ title: 'Momen Foto', story: 'Beberapa pelanggan bergantian mengambil foto makanan dan minuman sebelum mulai menikmatinya.' }),
  Object.freeze({ title: 'Area Dapur Sibuk', story: 'Chef dan staf dapur bergerak aktif menyiapkan berbagai hidangan. Suasana dapur terlihat sangat produktif.' }),
  Object.freeze({ title: 'Pelanggan Terburu-buru', story: 'Seorang pengunjung mengambil pesanan dengan cepat karena terlihat sedang mengejar waktu.' }),
  Object.freeze({ title: 'Kunjungan Teman', story: 'Sekelompok teman berkumpul di satu meja. Mereka bercanda dan menikmati berbagai menu yang dipesan.' }),
  Object.freeze({ title: 'Pengecekan Kebersihan', story: 'Cleaner memeriksa lantai, meja, dan area pelayanan untuk memastikan seluruh bagian cafe tetap terawat.' }),
  Object.freeze({ title: 'Pesanan Spesial', story: 'Chef terlihat memberikan perhatian ekstra pada sebuah hidangan sebelum waiter membawanya ke pelanggan.' }),
  Object.freeze({ title: 'Kasir Tetap Sibuk', story: 'Transaksi terus berlangsung di meja kasir. Staf memastikan setiap pembayaran tercatat dengan benar.' }),
  Object.freeze({ title: 'Suasana Menjelang Tutup', story: 'Jumlah pengunjung mulai berkurang. Beberapa staf mulai merapikan area kerja sambil menyelesaikan pelayanan.' }),
  Object.freeze({ title: 'Pengunjung Terakhir', story: 'Seorang pelanggan masih menikmati pesanannya ketika sebagian besar meja lainnya sudah kosong.' }),
  Object.freeze({ title: 'Pembersihan Dapur', story: 'Setelah pesanan selesai, staf dapur mulai membersihkan peralatan memasak dan merapikan area kerja.' }),
  Object.freeze({ title: 'Evaluasi Pelayanan', story: 'Pemilik cafe terlihat berbincang dengan beberapa staf untuk membahas aktivitas operasional hari ini.' }),
  Object.freeze({ title: 'Cafe Mulai Sepi', story: 'Suasana cafe perlahan menjadi tenang. Staf menggunakan waktu luang untuk merapikan perlengkapan.' }),
  Object.freeze({ title: 'Persiapan Penutupan', story: 'Para staf memastikan meja, kasir, dapur, dan area pelayanan sudah dalam kondisi rapi sebelum cafe ditutup.' }),
  Object.freeze({ title: 'Operasional Berakhir', story: 'Seluruh pelanggan telah meninggalkan cafe. Staf menyelesaikan pekerjaan terakhir sebelum mengakhiri shift.' }),
  Object.freeze({ title: 'Hari yang Produktif', story: 'Aktivitas cafe berjalan lancar sepanjang hari. Para staf bekerja sama melayani pengunjung hingga operasional selesai.' })
]);

export const CAFE_UPGRADES = Object.freeze({
  capacity: Object.freeze({ name: 'Kapasitas', basePrice: 1000000, capacityBonus: 4 }),
  kitchen: Object.freeze({ name: 'Dapur', basePrice: 1500000, capacityBonus: 1 }),
  service: Object.freeze({ name: 'Pelayanan', basePrice: 1200000, reputationBonus: 5 })
})

export const CAFE_THEMES = Object.freeze({
  classic: Object.freeze({ name: 'Klasik Hangat', price: 0n, revenueBps: 10000, demandBonus: 0, operatingCostBps: 10000, benefit: 'Biaya operasional standar', drawback: 'Tidak memiliki bonus penjualan' }),
  garden: Object.freeze({ name: 'Taman Bunga', price: 500000n * 5n ** 1n, revenueBps: 10100, demandBonus: 0, operatingCostBps: 10100, benefit: 'Suasana taman menarik pelanggan', drawback: 'Tanaman membutuhkan perawatan rutin' }),
  modern: Object.freeze({ name: 'Modern Minimalis', price: 500000n * 5n ** 2n, revenueBps: 10200, demandBonus: 1, operatingCostBps: 10200, benefit: 'Interior modern meningkatkan daya tarik', drawback: 'Perabot modern membutuhkan perawatan' }),
  rustic: Object.freeze({ name: 'Rustik Kayu', price: 500000n * 5n ** 3n, revenueBps: 10300, demandBonus: 1, operatingCostBps: 10300, benefit: 'Suasana kayu memberikan kesan nyaman', drawback: 'Material kayu perlu dirawat berkala' }),
  vintage: Object.freeze({ name: 'Vintage', price: 500000n * 5n ** 4n, revenueBps: 10400, demandBonus: 1, operatingCostBps: 10400, benefit: 'Dekorasi klasik menarik pengunjung', drawback: 'Perabot antik cukup mahal dirawat' }),
  industrial: Object.freeze({ name: 'Industrial', price: 500000n * 5n ** 5n, revenueBps: 10500, demandBonus: 1, operatingCostBps: 10500, benefit: 'Interior unik meningkatkan minat pelanggan', drawback: 'Material bangunan membutuhkan perawatan' }),
  minimalist: Object.freeze({ name: 'Minimalis', price: 500000n * 5n ** 6n, revenueBps: 10600, demandBonus: 1, operatingCostBps: 10600, benefit: 'Tampilan sederhana dan bersih', drawback: 'Dekorasi tidak terlalu mencolok' }),
  tropical: Object.freeze({ name: 'Tropis', price: 500000n * 5n ** 7n, revenueBps: 10700, demandBonus: 1, operatingCostBps: 10700, benefit: 'Suasana tropis membuat cafe lebih menarik', drawback: 'Tanaman dan dekorasi perlu dirawat' }),
  coastal: Object.freeze({ name: 'Pantai', price: 500000n * 5n ** 8n, revenueBps: 10800, demandBonus: 2, operatingCostBps: 10800, benefit: 'Nuansa pantai menarik pengunjung', drawback: 'Dekorasi pantai membutuhkan perawatan' }),
  sakura: Object.freeze({ name: 'Sakura Jepang', price: 500000n * 5n ** 9n, revenueBps: 10900, demandBonus: 2, operatingCostBps: 10900, benefit: 'Ornamen sakura memberikan suasana khas Jepang', drawback: 'Dekorasi bunga perlu diperbarui' }),
  japanese: Object.freeze({ name: 'Tradisional Jepang', price: 500000n * 5n ** 10n, revenueBps: 11000, demandBonus: 2, operatingCostBps: 11000, benefit: 'Interior tradisional menarik pengunjung', drawback: 'Perabot dan ornamen khusus cukup mahal' }),
  korean: Object.freeze({ name: 'Korean Cafe', price: 500000n * 5n ** 11n, revenueBps: 11100, demandBonus: 2, operatingCostBps: 11100, benefit: 'Desain populer menarik pelanggan muda', drawback: 'Dekorasi perlu mengikuti konsep cafe' }),
  parisian: Object.freeze({ name: 'Parisian', price: 500000n * 5n ** 12n, revenueBps: 11200, demandBonus: 2, operatingCostBps: 11200, benefit: 'Suasana cafe Paris meningkatkan daya tarik', drawback: 'Perabot elegan membutuhkan biaya' }),
  mediterranean: Object.freeze({ name: 'Mediterania', price: 500000n * 5n ** 13n, revenueBps: 11300, demandBonus: 2, operatingCostBps: 11300, benefit: 'Warna dan interior khas Mediterania menarik pelanggan', drawback: 'Material dekorasi cukup mahal' }),
  bohemian: Object.freeze({ name: 'Bohemian', price: 500000n * 5n ** 14n, revenueBps: 11400, demandBonus: 2, operatingCostBps: 11400, benefit: 'Dekorasi artistik menciptakan suasana berbeda', drawback: 'Banyak ornamen perlu dirawat' }),
  scandinavian: Object.freeze({ name: 'Skandinavia', price: 500000n * 5n ** 15n, revenueBps: 11500, demandBonus: 2, operatingCostBps: 11500, benefit: 'Interior nyaman dan terang menarik pelanggan', drawback: 'Perabot berkualitas membutuhkan biaya' }),
  monochrome: Object.freeze({ name: 'Monokrom', price: 500000n * 5n ** 16n, revenueBps: 11600, demandBonus: 2, operatingCostBps: 11600, benefit: 'Perpaduan hitam putih memberikan kesan elegan', drawback: 'Tampilan warna terbatas' }),
  lavender: Object.freeze({ name: 'Lavender Garden', price: 500000n * 5n ** 17n, revenueBps: 11700, demandBonus: 3, operatingCostBps: 11700, benefit: 'Nuansa bunga lavender menarik pengunjung', drawback: 'Tanaman dan dekorasi membutuhkan perawatan' }),
  rainforest: Object.freeze({ name: 'Hutan Hujan', price: 500000n * 5n ** 18n, revenueBps: 11800, demandBonus: 3, operatingCostBps: 11800, benefit: 'Suasana hijau memberikan pengalaman berbeda', drawback: 'Perawatan tanaman cukup tinggi' }),
  countryside: Object.freeze({ name: 'Pedesaan', price: 500000n * 5n ** 19n, revenueBps: 11900, demandBonus: 3, operatingCostBps: 11900, benefit: 'Suasana pedesaan terasa hangat dan nyaman', drawback: 'Dekorasi tradisional perlu dijaga' }),
  horror: Object.freeze({ name: 'Horor', price: 500000n * 5n ** 20n, revenueBps: 12000, demandBonus: 3, operatingCostBps: 12000, benefit: 'Konsep menyeramkan menjadi daya tarik tersendiri', drawback: 'Properti dan efek khusus membutuhkan biaya' }),
  halloween: Object.freeze({ name: 'Halloween', price: 500000n * 5n ** 21n, revenueBps: 12100, demandBonus: 3, operatingCostBps: 12100, benefit: 'Dekorasi Halloween menarik pengunjung', drawback: 'Dekorasi tematik perlu sering diperbarui' }),
  gothic: Object.freeze({ name: 'Gothic', price: 500000n * 5n ** 22n, revenueBps: 12200, demandBonus: 3, operatingCostBps: 12200, benefit: 'Interior gelap memberikan identitas kuat', drawback: 'Perabot dan ornamen khusus cukup mahal' }),
  vampire: Object.freeze({ name: 'Vampir', price: 500000n * 5n ** 23n, revenueBps: 12300, demandBonus: 3, operatingCostBps: 12300, benefit: 'Suasana kastil vampir menarik penggemar horor', drawback: 'Dekorasi gelap membutuhkan perawatan' }),
  zombie: Object.freeze({ name: 'Zombie Apocalypse', price: 500000n * 5n ** 24n, revenueBps: 12400, demandBonus: 3, operatingCostBps: 12400, benefit: 'Konsep kiamat zombie memberikan pengalaman unik', drawback: 'Properti dan dekorasi khusus mahal' }),
  witch: Object.freeze({ name: 'Penyihir', price: 500000n * 5n ** 25n, revenueBps: 12500, demandBonus: 3, operatingCostBps: 12500, benefit: 'Dekorasi ramuan dan sihir menarik pelanggan', drawback: 'Banyak ornamen kecil perlu dirawat' }),
  fantasy: Object.freeze({ name: 'Fantasi', price: 500000n * 5n ** 26n, revenueBps: 12600, demandBonus: 4, operatingCostBps: 12600, benefit: 'Suasana dunia fantasi menarik pengunjung', drawback: 'Dekorasi tematik membutuhkan biaya besar' }),
  fairytale: Object.freeze({ name: 'Dongeng', price: 500000n * 5n ** 27n, revenueBps: 12700, demandBonus: 4, operatingCostBps: 12700, benefit: 'Nuansa negeri dongeng menarik keluarga', drawback: 'Properti dekoratif perlu dirawat' }),
  medieval: Object.freeze({ name: 'Abad Pertengahan', price: 500000n * 5n ** 28n, revenueBps: 12800, demandBonus: 4, operatingCostBps: 12800, benefit: 'Interior kastil memberikan pengalaman berbeda', drawback: 'Perabot kayu dan besi cukup mahal' }),
  castle: Object.freeze({ name: 'Kastil', price: 500000n * 5n ** 29n, revenueBps: 12900, demandBonus: 4, operatingCostBps: 12900, benefit: 'Bangunan bergaya kastil menarik pengunjung', drawback: 'Dekorasi megah membutuhkan biaya perawatan' }),
  royal: Object.freeze({ name: 'Kerajaan', price: 500000n * 5n ** 30n, revenueBps: 13000, demandBonus: 4, operatingCostBps: 13000, benefit: 'Interior kerajaan meningkatkan kesan mewah', drawback: 'Perabot mewah membutuhkan biaya besar' }),
  anime: Object.freeze({ name: 'Anime', price: 500000n * 5n ** 31n, revenueBps: 13100, demandBonus: 4, operatingCostBps: 13100, benefit: 'Dekorasi anime menarik penggemar animasi Jepang', drawback: 'Koleksi dekorasi dan pajangan cukup mahal' }),
  manga: Object.freeze({ name: 'Manga', price: 500000n * 5n ** 32n, revenueBps: 13200, demandBonus: 4, operatingCostBps: 13200, benefit: 'Interior komik Jepang menarik pengunjung', drawback: 'Koleksi manga perlu dijaga' }),
  cartoon: Object.freeze({ name: 'Kartun', price: 500000n * 5n ** 33n, revenueBps: 13300, demandBonus: 4, operatingCostBps: 13300, benefit: 'Warna cerah menarik pelanggan segala usia', drawback: 'Dekorasi karakter membutuhkan perawatan' }),
  comic: Object.freeze({ name: 'Komik', price: 500000n * 5n ** 34n, revenueBps: 13400, demandBonus: 4, operatingCostBps: 13400, benefit: 'Nuansa komik memberikan pengalaman unik', drawback: 'Pajangan dan dekorasi perlu diperbarui' }),
  pixel: Object.freeze({ name: 'Pixel Art', price: 500000n * 5n ** 35n, revenueBps: 13500, demandBonus: 4, operatingCostBps: 13500, benefit: 'Desain pixel menarik penggemar game klasik', drawback: 'Pencahayaan dan layar membutuhkan listrik' }),
  gaming: Object.freeze({ name: 'Gaming Cafe', price: 500000n * 5n ** 36n, revenueBps: 13600, demandBonus: 5, operatingCostBps: 13600, benefit: 'Fasilitas gaming menarik komunitas pemain', drawback: 'Perangkat elektronik membutuhkan biaya tinggi' }),
  arcade: Object.freeze({ name: 'Arcade', price: 500000n * 5n ** 37n, revenueBps: 13700, demandBonus: 5, operatingCostBps: 13700, benefit: 'Mesin permainan menjadi hiburan pelanggan', drawback: 'Mesin arcade membutuhkan perawatan' }),
  retro: Object.freeze({ name: 'Retro 80-an', price: 500000n * 5n ** 38n, revenueBps: 13800, demandBonus: 5, operatingCostBps: 13800, benefit: 'Suasana retro menarik penggemar nostalgia', drawback: 'Peralatan klasik perlu dirawat' }),
  disco: Object.freeze({ name: 'Disco', price: 500000n * 5n ** 39n, revenueBps: 13900, demandBonus: 5, operatingCostBps: 13900, benefit: 'Lampu dan musik membuat cafe lebih hidup', drawback: 'Sistem suara dan lampu membutuhkan listrik' }),
  cyberpunk: Object.freeze({ name: 'Cyberpunk', price: 500000n * 5n ** 40n, revenueBps: 14000, demandBonus: 5, operatingCostBps: 14000, benefit: 'Interior futuristik menarik pelanggan', drawback: 'Teknologi dan pencahayaan cukup mahal' }),
  futuristic: Object.freeze({ name: 'Futuristik', price: 500000n * 5n ** 41n, revenueBps: 14100, demandBonus: 5, operatingCostBps: 14100, benefit: 'Desain modern memberikan pengalaman berbeda', drawback: 'Perangkat canggih membutuhkan perawatan' }),
  space: Object.freeze({ name: 'Luar Angkasa', price: 500000n * 5n ** 42n, revenueBps: 14200, demandBonus: 5, operatingCostBps: 14200, benefit: 'Dekorasi antariksa menarik pengunjung', drawback: 'Efek pencahayaan membutuhkan listrik' }),
  astronaut: Object.freeze({ name: 'Astronaut', price: 500000n * 5n ** 43n, revenueBps: 14300, demandBonus: 5, operatingCostBps: 14300, benefit: 'Konsep perjalanan luar angkasa menarik pelanggan', drawback: 'Properti dan dekorasi khusus cukup mahal' }),
  underwater: Object.freeze({ name: 'Bawah Laut', price: 500000n * 5n ** 44n, revenueBps: 14400, demandBonus: 5, operatingCostBps: 14400, benefit: 'Pemandangan bawah laut menjadi daya tarik', drawback: 'Akuarium dan instalasi air membutuhkan biaya' }),
  aquarium: Object.freeze({ name: 'Akuarium', price: 500000n * 5n ** 45n, revenueBps: 14500, demandBonus: 5, operatingCostBps: 14500, benefit: 'Koleksi ikan mempercantik suasana cafe', drawback: 'Akuarium harus dibersihkan dan dirawat' }),
  safari: Object.freeze({ name: 'Safari', price: 500000n * 5n ** 46n, revenueBps: 14600, demandBonus: 6, operatingCostBps: 14600, benefit: 'Dekorasi satwa liar menarik keluarga', drawback: 'Ornamen dan tanaman membutuhkan perawatan' }),
  jungle: Object.freeze({ name: 'Hutan Tropis', price: 500000n * 5n ** 47n, revenueBps: 14700, demandBonus: 6, operatingCostBps: 14700, benefit: 'Suasana hutan memberikan pengalaman alami', drawback: 'Tanaman dan dekorasi membutuhkan biaya' }),
  dinosaur: Object.freeze({ name: 'Dinosaurus', price: 500000n * 5n ** 48n, revenueBps: 14800, demandBonus: 6, operatingCostBps: 14800, benefit: 'Replika dinosaurus menarik pengunjung', drawback: 'Properti berukuran besar membutuhkan perawatan' }),
  farm: Object.freeze({ name: 'Peternakan', price: 500000n * 5n ** 49n, revenueBps: 14900, demandBonus: 6, operatingCostBps: 14900, benefit: 'Suasana peternakan terasa santai', drawback: 'Dekorasi dan tanaman perlu dirawat' }),
  camping: Object.freeze({ name: 'Camping', price: 500000n * 5n ** 50n, revenueBps: 15000, demandBonus: 6, operatingCostBps: 15000, benefit: 'Konsep berkemah menarik pencinta alam', drawback: 'Perlengkapan outdoor membutuhkan perawatan' }),
  mountain: Object.freeze({ name: 'Pegunungan', price: 500000n * 5n ** 51n, revenueBps: 15100, demandBonus: 6, operatingCostBps: 15100, benefit: 'Suasana pegunungan memberikan kesan sejuk', drawback: 'Dekorasi alam membutuhkan perawatan' }),
  winter: Object.freeze({ name: 'Musim Dingin', price: 500000n * 5n ** 52n, revenueBps: 15200, demandBonus: 6, operatingCostBps: 15200, benefit: 'Dekorasi salju menarik pengunjung', drawback: 'Efek dingin dan dekorasi membutuhkan biaya' }),
  christmas: Object.freeze({ name: 'Natal', price: 500000n * 5n ** 53n, revenueBps: 15300, demandBonus: 6, operatingCostBps: 15300, benefit: 'Dekorasi Natal menciptakan suasana meriah', drawback: 'Dekorasi musiman perlu diperbarui' }),
  spring: Object.freeze({ name: 'Musim Semi', price: 500000n * 5n ** 54n, revenueBps: 15400, demandBonus: 6, operatingCostBps: 15400, benefit: 'Bunga dan warna cerah menarik pelanggan', drawback: 'Tanaman dan ornamen perlu dirawat' }),
  autumn: Object.freeze({ name: 'Musim Gugur', price: 500000n * 5n ** 55n, revenueBps: 15500, demandBonus: 6, operatingCostBps: 15500, benefit: 'Warna musim gugur menciptakan suasana hangat', drawback: 'Dekorasi daun perlu diganti berkala' }),
  summer: Object.freeze({ name: 'Musim Panas', price: 500000n * 5n ** 56n, revenueBps: 15600, demandBonus: 7, operatingCostBps: 15600, benefit: 'Suasana cerah menarik pengunjung', drawback: 'Fasilitas pendingin membutuhkan biaya' }),
  rainy: Object.freeze({ name: 'Musim Hujan', price: 500000n * 5n ** 57n, revenueBps: 15700, demandBonus: 7, operatingCostBps: 15700, benefit: 'Suasana hujan memberikan kesan nyaman', drawback: 'Perawatan area dan perlengkapan hujan diperlukan' }),
  flower: Object.freeze({ name: 'Taman Bunga', price: 500000n * 5n ** 58n, revenueBps: 15800, demandBonus: 7, operatingCostBps: 15800, benefit: 'Beragam bunga mempercantik interior', drawback: 'Bunga segar membutuhkan penggantian rutin' }),
  butterfly: Object.freeze({ name: 'Kupu-Kupu', price: 500000n * 5n ** 59n, revenueBps: 15900, demandBonus: 7, operatingCostBps: 15900, benefit: 'Dekorasi kupu-kupu memberikan kesan ceria', drawback: 'Ornamen dekoratif perlu dirawat' }),
  cloud: Object.freeze({ name: 'Awan', price: 500000n * 5n ** 60n, revenueBps: 16000, demandBonus: 7, operatingCostBps: 16000, benefit: 'Interior lembut dan terang menarik pelanggan', drawback: 'Pencahayaan dekoratif menambah biaya' }),
  rainbow: Object.freeze({ name: 'Pelangi', price: 500000n * 5n ** 61n, revenueBps: 16100, demandBonus: 7, operatingCostBps: 16100, benefit: 'Warna-warni cerah menarik berbagai kalangan', drawback: 'Dekorasi warna-warni perlu dirawat' }),
  candy: Object.freeze({ name: 'Permen', price: 500000n * 5n ** 62n, revenueBps: 16200, demandBonus: 7, operatingCostBps: 16200, benefit: 'Dekorasi manis menarik keluarga dan anak-anak', drawback: 'Properti dekoratif membutuhkan biaya' }),
  chocolate: Object.freeze({ name: 'Cokelat', price: 500000n * 5n ** 63n, revenueBps: 16300, demandBonus: 7, operatingCostBps: 16300, benefit: 'Nuansa cokelat memberikan kesan hangat', drawback: 'Material dan dekorasi khusus cukup mahal' }),
  bakery: Object.freeze({ name: 'Toko Roti', price: 500000n * 5n ** 64n, revenueBps: 16400, demandBonus: 7, operatingCostBps: 16400, benefit: 'Konsep bakery menarik pencinta makanan', drawback: 'Peralatan dapur membutuhkan perawatan' }),
  paris: Object.freeze({ name: 'Paris', price: 500000n * 5n ** 65n, revenueBps: 16500, demandBonus: 7, operatingCostBps: 16500, benefit: 'Nuansa kota Paris memberikan kesan romantis', drawback: 'Dekorasi khas kota membutuhkan biaya' }),
  newYork: Object.freeze({ name: 'New York', price: 500000n * 5n ** 66n, revenueBps: 16600, demandBonus: 8, operatingCostBps: 16600, benefit: 'Suasana perkotaan menarik pelanggan', drawback: 'Interior bergaya kota besar cukup mahal' }),
  london: Object.freeze({ name: 'London', price: 500000n * 5n ** 67n, revenueBps: 16700, demandBonus: 8, operatingCostBps: 16700, benefit: 'Nuansa Inggris memberikan identitas khas', drawback: 'Perabot dan ornamen klasik perlu dirawat' }),
  italian: Object.freeze({ name: 'Italia', price: 500000n * 5n ** 68n, revenueBps: 16800, demandBonus: 8, operatingCostBps: 16800, benefit: 'Suasana Italia menarik pencinta kuliner', drawback: 'Dekorasi dan perabot membutuhkan biaya' }),
  greek: Object.freeze({ name: 'Yunani', price: 500000n * 5n ** 69n, revenueBps: 16900, demandBonus: 8, operatingCostBps: 16900, benefit: 'Interior putih biru memberikan kesan khas', drawback: 'Material dekorasi perlu dirawat' }),
  arabian: Object.freeze({ name: 'Arabian Nights', price: 500000n * 5n ** 70n, revenueBps: 17000, demandBonus: 8, operatingCostBps: 17000, benefit: 'Ornamen Timur Tengah menarik pengunjung', drawback: 'Dekorasi detail membutuhkan perawatan' }),
  indian: Object.freeze({ name: 'India', price: 500000n * 5n ** 71n, revenueBps: 17100, demandBonus: 8, operatingCostBps: 17100, benefit: 'Warna dan ornamen khas India memberikan suasana unik', drawback: 'Dekorasi penuh detail membutuhkan biaya' }),
  chinese: Object.freeze({ name: 'Tiongkok', price: 500000n * 5n ** 72n, revenueBps: 17200, demandBonus: 8, operatingCostBps: 17200, benefit: 'Ornamen tradisional Tiongkok menarik pelanggan', drawback: 'Pajangan dan dekorasi perlu dirawat' }),
  thai: Object.freeze({ name: 'Thailand', price: 500000n * 5n ** 73n, revenueBps: 17300, demandBonus: 8, operatingCostBps: 17300, benefit: 'Nuansa Thailand memberikan pengalaman berbeda', drawback: 'Ornamen khas membutuhkan perawatan' }),
  bali: Object.freeze({ name: 'Bali', price: 500000n * 5n ** 74n, revenueBps: 17400, demandBonus: 8, operatingCostBps: 17400, benefit: 'Suasana Bali menarik wisatawan', drawback: 'Tanaman dan ornamen tradisional perlu dirawat' }),
  indonesia: Object.freeze({ name: 'Nusantara', price: 500000n * 5n ** 75n, revenueBps: 17500, demandBonus: 8, operatingCostBps: 17500, benefit: 'Keberagaman budaya Indonesia menjadi daya tarik', drawback: 'Berbagai ornamen daerah membutuhkan perawatan' }),
  beachClub: Object.freeze({ name: 'Beach Club', price: 500000n * 5n ** 76n, revenueBps: 17600, demandBonus: 9, operatingCostBps: 17600, benefit: 'Suasana liburan menarik lebih banyak pengunjung', drawback: 'Fasilitas outdoor membutuhkan biaya tinggi' }),
  resort: Object.freeze({ name: 'Resort', price: 500000n * 5n ** 77n, revenueBps: 17700, demandBonus: 9, operatingCostBps: 17700, benefit: 'Konsep resort memberikan pengalaman premium', drawback: 'Fasilitas dan dekorasi mahal dirawat' }),
  hotel: Object.freeze({ name: 'Hotel Mewah', price: 500000n * 5n ** 78n, revenueBps: 17800, demandBonus: 9, operatingCostBps: 17800, benefit: 'Interior hotel meningkatkan kesan eksklusif', drawback: 'Perabot dan fasilitas membutuhkan biaya besar' }),
  ballroom: Object.freeze({ name: 'Ballroom', price: 500000n * 5n ** 79n, revenueBps: 17900, demandBonus: 9, operatingCostBps: 17900, benefit: 'Ruangan luas cocok untuk acara dan pertemuan', drawback: 'Perawatan ruangan besar membutuhkan biaya' }),
  wedding: Object.freeze({ name: 'Pernikahan', price: 500000n * 5n ** 80n, revenueBps: 18000, demandBonus: 9, operatingCostBps: 18000, benefit: 'Dekorasi romantis menarik pelanggan', drawback: 'Bunga dan dekorasi perlu diperbarui' }),
  romantic: Object.freeze({ name: 'Romantis', price: 500000n * 5n ** 81n, revenueBps: 18100, demandBonus: 9, operatingCostBps: 18100, benefit: 'Suasana romantis menarik pasangan', drawback: 'Pencahayaan dan dekorasi menambah biaya' }),
  music: Object.freeze({ name: 'Musik', price: 500000n * 5n ** 82n, revenueBps: 18200, demandBonus: 9, operatingCostBps: 18200, benefit: 'Musik menjadi hiburan bagi pelanggan', drawback: 'Peralatan audio membutuhkan perawatan' }),
  jazz: Object.freeze({ name: 'Jazz Club', price: 500000n * 5n ** 83n, revenueBps: 18300, demandBonus: 9, operatingCostBps: 18300, benefit: 'Suasana jazz menarik pencinta musik', drawback: 'Peralatan musik dan audio cukup mahal' }),
  library: Object.freeze({ name: 'Perpustakaan', price: 500000n * 5n ** 84n, revenueBps: 18400, demandBonus: 9, operatingCostBps: 18400, benefit: 'Buku dan ruang baca menarik pengunjung', drawback: 'Koleksi buku perlu dirawat' }),
  bookstore: Object.freeze({ name: 'Toko Buku', price: 500000n * 5n ** 85n, revenueBps: 18500, demandBonus: 9, operatingCostBps: 18500, benefit: 'Konsep toko buku memberikan pengalaman santai', drawback: 'Rak dan koleksi buku membutuhkan perawatan' }),
  cinema: Object.freeze({ name: 'Bioskop', price: 500000n * 5n ** 86n, revenueBps: 18600, demandBonus: 10, operatingCostBps: 18600, benefit: 'Layar film menjadi hiburan tambahan', drawback: 'Peralatan layar dan suara membutuhkan biaya tinggi' }),
  theater: Object.freeze({ name: 'Teater', price: 500000n * 5n ** 87n, revenueBps: 18700, demandBonus: 10, operatingCostBps: 18700, benefit: 'Konsep panggung menarik pengunjung', drawback: 'Peralatan panggung perlu dirawat' }),
  museum: Object.freeze({ name: 'Museum', price: 500000n * 5n ** 88n, revenueBps: 18800, demandBonus: 10, operatingCostBps: 18800, benefit: 'Koleksi pajangan memberikan pengalaman unik', drawback: 'Pajangan dan koleksi membutuhkan perawatan khusus' }),
  artGallery: Object.freeze({ name: 'Galeri Seni', price: 500000n * 5n ** 89n, revenueBps: 18900, demandBonus: 10, operatingCostBps: 18900, benefit: 'Karya seni menarik pengunjung dan komunitas kreatif', drawback: 'Koleksi seni membutuhkan perlindungan' }),
  fashion: Object.freeze({ name: 'Fashion', price: 500000n * 5n ** 90n, revenueBps: 19000, demandBonus: 10, operatingCostBps: 19000, benefit: 'Interior bergaya butik menarik pelanggan', drawback: 'Dekorasi dan pajangan perlu diperbarui' }),
  luxury: Object.freeze({ name: 'Luxury', price: 500000n * 5n ** 91n, revenueBps: 19100, demandBonus: 10, operatingCostBps: 19100, benefit: 'Material dan perabot mewah meningkatkan nilai cafe', drawback: 'Perawatan fasilitas membutuhkan biaya besar' }),
  penthouse: Object.freeze({ name: 'Penthouse', price: 500000n * 5n ** 92n, revenueBps: 19200, demandBonus: 10, operatingCostBps: 19200, benefit: 'Suasana eksklusif menarik pelanggan kelas atas', drawback: 'Fasilitas premium membutuhkan biaya tinggi' }),
  skyscraper: Object.freeze({ name: 'Gedung Pencakar Langit', price: 500000n * 5n ** 93n, revenueBps: 19300, demandBonus: 10, operatingCostBps: 19300, benefit: 'Pemandangan kota menjadi daya tarik utama', drawback: 'Pengelolaan fasilitas gedung sangat mahal' }),
  underwaterPalace: Object.freeze({ name: 'Istana Bawah Laut', price: 500000n * 5n ** 94n, revenueBps: 19400, demandBonus: 10, operatingCostBps: 19400, benefit: 'Pemandangan laut memberikan pengalaman istimewa', drawback: 'Instalasi air dan kaca membutuhkan perawatan mahal' }),
  treehouse: Object.freeze({ name: 'Rumah Pohon', price: 500000n * 5n ** 95n, revenueBps: 19500, demandBonus: 10, operatingCostBps: 19500, benefit: 'Konsep rumah pohon menarik pencinta alam', drawback: 'Struktur kayu dan tanaman perlu dirawat' }),
  greenhouse: Object.freeze({ name: 'Rumah Kaca', price: 500000n * 5n ** 96n, revenueBps: 19600, demandBonus: 10, operatingCostBps: 19600, benefit: 'Tanaman dalam ruangan mempercantik cafe', drawback: 'Kaca dan sistem perawatan tanaman membutuhkan biaya' }),
  observatory: Object.freeze({ name: 'Observatorium', price: 500000n * 5n ** 97n, revenueBps: 19700, demandBonus: 10, operatingCostBps: 19700, benefit: 'Pemandangan langit dan bintang menjadi daya tarik', drawback: 'Peralatan pengamatan membutuhkan perawatan mahal' }),
  aquariumTunnel: Object.freeze({ name: 'Terowongan Akuarium', price: 500000n * 5n ** 98n, revenueBps: 19800, demandBonus: 10, operatingCostBps: 19800, benefit: 'Terowongan bawah laut memberikan pengalaman istimewa', drawback: 'Instalasi akuarium berskala besar sangat mahal' }),
  grandPalace: Object.freeze({ name: 'Istana Megah', price: 500000n * 5n ** 99n, revenueBps: 19900, demandBonus: 11, operatingCostBps: 19900, benefit: 'Interior istana memberikan pengalaman cafe paling mewah', drawback: 'Seluruh fasilitas membutuhkan biaya pemeliharaan sangat besar' })
});
