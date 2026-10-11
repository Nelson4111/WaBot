export const EVENT_SCHEDULE = Object.freeze([
  {
    label: 'Senin',
    ids: [
      'cashback_hour', 'lucky_catch', 'mineral_rush', 'pet_festival',
      'love_season', 'industrial_boom', 'member_prosperity', 'market_surge'
    ]
  },
  {
    label: 'Selasa',
    ids: [
      'double_catch', 'dimensional_rift', 'breeding_season', 'bountiful_harvest',
      'legendary_discovery', 'culinary_festival', 'treasure_hunt',
      'bbq_season', 'security_loophole'
    ]
  },
  {
    label: 'Rabu',
    ids: [
      'giant_fish', 'cave_collapse', 'dangerous_expedition', 'cold_war',
      'price_surge', 'livestock_disease', 'crop_blight', 'void_corruption',
      'machinery_breakdown'
    ]
  },
  {
    label: 'Kamis',
    ids: [
      'secret_awakening', 'capital_withdrawal', 'ingredient_shortage',
      'oversupply_crisis', 'lost_expedition', 'power_outage',
      'criminal_underworld', 'rising_demand', 'trending_wave', 'bullish_momentum'
    ]
  },
  {
    label: 'Jumat',
    ids: [
      'murky_waters', 'empty_mall', 'livestock_prosperity', 'disease_outbreak',
      'stellar_blessing', 'consumer_spending_decline', 'guild_conflict',
      'holiday_season', 'maximum_security', 'crackdown_operation'
    ]
  },
  {
    label: 'Sabtu',
    ids: [
      'golden_hour', 'safety_net', 'low_stakes', 'natural_disaster',
      'pandemic_outbreak', 'trade_embargo', 'grand_tournament',
      'economic_slowdown', 'platform_disruption', 'bearish_pressure',
      'cosmic_turbulence'
    ]
  },
  {
    label: 'Minggu',
    ids: [
      'casino_shutdown', 'grand_sale', 'midnight_sale', 'grand_shopping_festival'
    ]
  }
])

export function getRpgEventScheduleForDayIndex(dayIndex) {
  const normalizedIndex = ((Number(dayIndex) || 0) + 7) % 7
  return Array.isArray(EVENT_SCHEDULE[normalizedIndex]?.ids) ? [...EVENT_SCHEDULE[normalizedIndex].ids] : []
}

const normalizeDayLabel = value => String(value || '').trim().toLocaleLowerCase('id-ID')

export function findRpgEventScheduleDay(value) {
  const key = normalizeDayLabel(value)
  const aliases = {
    monday: 'senin',
    tuesday: 'selasa',
    wednesday: 'rabu',
    thursday: 'kamis',
    friday: 'jumat',
    saturday: 'sabtu',
    sunday: 'minggu'
  }
  const normalizedKey = aliases[key] || key
  return EVENT_SCHEDULE.find(day => normalizeDayLabel(day.label) === normalizedKey) || null
}

export function getRpgEventScheduleForNow(now = Date.now()) {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'short' })
  const dayName = formatter.format(new Date(now)).toLowerCase()
  const indexMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 }
  return getRpgEventScheduleForDayIndex(indexMap[dayName] ?? 0)
}

export function getRpgEventScheduleDayForNow(now = Date.now()) {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'short' })
  const dayName = formatter.format(new Date(now)).toLowerCase()
  const indexMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 }
  return EVENT_SCHEDULE[indexMap[dayName] ?? 0] || null
}

const createEvent = (id, name, category, emoji, description, effects) => ({
  id,
  name,
  category,
  emoji,
  description,
  effects: Array.isArray(effects) ? effects : [effects]
})

const EVENT_CATEGORY_DATA = Object.freeze([
  {
    key: 'casino',
    label: 'Casino',
    events: [
      createEvent('golden_hour', 'Golden Hour', 'Casino', '🎉', 'Bonus kemenangan selama event aktif.', ['Bonus kemenangan +20%.', 'Peluang dasar permainan tetap sama.']),
      createEvent('safety_net', 'Safety Net', 'Casino', '🛡️', 'Anti-kalah total: taruhan yang kalah dikembalikan.', ['Pengembalian taruhan kalah 100%.', 'Peluang kemenangan -50%.']),
      createEvent('casino_shutdown', 'Casino Shutdown', 'Casino', '🚫', 'Seluruh permainan Casino ditutup sementara.', ['Semua command permainan ditutup.', 'Saldo dan inventori tetap aman.', 'Informasi dan riwayat tetap dapat diakses.']),
      createEvent('cashback_hour', 'Cashback Hour', 'Casino', '💰', 'Pengembalian sebagian kerugian bersih setelah sesi permainan.', ['Cashback 25% dari kerugian bersih.', 'Maksimum Rp 1.000.000 per pemain selama event.']),
      createEvent('low_stakes', 'Low Stakes', 'Casino', '📉', 'Pengurangan hadiah kemenangan selama event aktif.', ['Bonus kemenangan -50%.', 'Nominal taruhan dan peluang dasar tetap.'])
    ]
  },
  {
    key: 'fishing',
    label: 'Fishing',
    events: [
      createEvent('lucky_catch', 'Lucky Catch', 'Fishing', '🍀', 'Peluang ikan Rare ke atas meningkat.', ['Peluang ikan Rare ke atas +50% secara relatif.', 'Jumlah hasil tangkapan tetap.']),
      createEvent('double_catch', 'Double Catch', 'Fishing', '🐟', 'Aktivitas memancing berpeluang menghasilkan tangkapan tambahan.', ['Peluang tangkapan tambahan 25%.', 'Tangkapan mengikuti aturan normal.', 'EXP tangkapan tambahan tidak digandakan.']),
      createEvent('giant_fish', 'Giant Fish', 'Fishing', '🐋', 'Peluang mendapatkan ikan berukuran besar meningkat.', ['Peluang ikan besar +50% secara relatif.', 'Berat memengaruhi nilai jual jika didukung sistem.']),
      createEvent('secret_awakening', 'Secret Awakening', 'Fishing', '🍀', 'Secret Fish lebih sering muncul, tetapi lebih sulit ditangkap.', ['Peluang Secret Fish muncul +100% secara relatif.', 'Peluang berhasil menangkap Secret Fish -40%.']),
      createEvent('murky_waters', 'Murky Waters', 'Fishing', '🌫️', 'Air keruh menyulitkan pemancingan.', ['Peluang ikan Rare ke atas -40%.', 'Waktu tunggu gigitan meningkat.', 'Secret Fish mengikuti aturan event khususnya.'])
    ]
  },
  {
    key: 'mining',
    label: 'Mining',
    events: [
      createEvent('mineral_rush', 'Mineral Rush', 'Mining', '💎', 'Tambang menghasilkan mineral berharga lebih banyak.', ['Peluang mineral Rare ke atas +50% secara relatif.', 'Peluang mineral tambahan 25%.']),
      createEvent('cave_collapse', 'Cave Collapse', 'Mining', '🪨', 'Runtuhan menghambat aktivitas pertambangan.', ['Efisiensi mining -30%.', 'Peluang mineral Rare ke atas -25%.', 'Waktu penambangan meningkat.'])
    ]
  },
  {
    key: 'adventure',
    label: 'Adventure',
    events: [
      createEvent('dimensional_rift', 'Dimensional Rift', 'Adventure', '🌌', 'Retakan dimensi membuka encounter dan hadiah dari dimensi lain.', ['Peluang encounter dimensional meningkat.', 'Peluang item eksklusif meningkat.']),
      createEvent('dangerous_expedition', 'Dangerous Expedition', 'Adventure', '🌪️', 'Wilayah petualangan lebih berbahaya.', ['Tingkat kesulitan dan risiko kegagalan meningkat.', 'Peluang hadiah bonus -25%.'])
    ]
  },
  {
    key: 'pet',
    label: 'Pet',
    events: [
      createEvent('pet_festival', 'Pet Festival', 'Pet', '🐾', 'Festival membuat hewan peliharaan lebih aktif.', ['EXP pet +50%.', 'Efektivitas aktivitas pet +25%.'])
    ]
  },
  {
    key: 'rship',
    label: 'Rship',
    events: [
      createEvent('love_season', 'Love Season', 'Rship', '💖', 'Aktivitas bersama pasangan memberi perkembangan lebih besar.', ['Relationship EXP +50%.', 'Poin kedekatan aktivitas bersama +25%.', 'Hadiah tetap mengikuti aturan normal.']),
      createEvent('cold_war', 'Cold War', 'Rship', '💔', 'Hubungan pasangan lebih sulit berkembang.', ['Relationship EXP -30%.', 'Poin kedekatan aktivitas bersama -25%.', 'Biaya aktivitas tetap normal.'])
    ]
  },
  {
    key: 'mall',
    label: 'Mall',
    events: [
      createEvent('grand_sale', 'Grand Sale', 'Mall', '🛍️', 'Diskon besar untuk barang promo mall.', ['Diskon 30% untuk item yang ditandai promo.', 'Kuota item terbatas tetap berlaku.']),
      createEvent('price_surge', 'Price Surge', 'Mall', '📈', 'Permintaan meningkatkan harga barang yang terdampak.', ['Harga item terdampak +30%.', 'Harga jual kembali tetap normal.']),
      createEvent('midnight_sale', 'Midnight Sale', 'Mall', '🛍️', 'Program diskon besar menarik pengunjung untuk berbelanja di berbagai tenant.', ['Pendapatan mall meningkat.']),
      createEvent('empty_mall', 'Empty Mall', 'Mall', '🚶', 'Jumlah pengunjung menurun sehingga aktivitas belanja menjadi lebih sepi.', ['Pendapatan mall berkurang.'])
    ]
  },
  {
    key: 'ternak',
    label: 'Ternak',
    events: [
      createEvent('breeding_season', 'Breeding Season', 'Ternak', '🌱', 'Kondisi peternakan mendukung perkembangbiakan.', ['Peluang breeding berhasil +30% secara relatif.', 'Waktu berkembang biak -25%.']),
      createEvent('livestock_disease', 'Livestock Disease', 'Ternak', '🦠', 'Penyakit mengganggu produktivitas hewan ternak.', ['Produktivitas ternak -30%.', 'Waktu pemulihan atau produksi meningkat.', 'Hewan tidak mati atau hilang akibat event.']),
      createEvent('livestock_prosperity', 'Livestock Prosperity', 'Ternak', '🌱', 'Kondisi peternakan membaik dan hewan tumbuh dengan sehat.', ['Hasil peternakan meningkat.']),
      createEvent('disease_outbreak', 'Disease Outbreak', 'Ternak', '🦠', 'Gangguan kesehatan menyebar dan berdampak pada kondisi hewan ternak.', ['Hasil peternakan berkurang.'])
    ]
  },
  {
    key: 'panen',
    label: 'Panen',
    events: [
      createEvent('bountiful_harvest', 'Bountiful Harvest', 'Panen', '☀️', 'Kondisi pertanian ideal meningkatkan hasil panen.', ['Hasil panen +50%.', 'Peluang hasil panen bonus +25%.', 'Kualitas tanaman tetap normal.']),
      createEvent('crop_blight', 'Crop Blight', 'Panen', '🥀', 'Penyakit tanaman menghambat pertumbuhan dan hasil panen.', ['Hasil panen -30%.', 'Waktu pertumbuhan meningkat.', 'Tanaman tidak langsung hilang atau gagal panen seluruhnya.'])
    ]
  },
  {
    key: 'interstellar',
    label: 'Interstellar',
    events: [
      createEvent('legendary_discovery', 'Legendary Discovery', 'Interstellar', '👑', 'Aktivitas kosmik membuka peluang penemuan langka.', ['Peluang objek legendaris +50% secara relatif.', 'Hadiah penemuan langka +45%.']),
      createEvent('void_corruption', 'Void Corruption', 'Interstellar', '🕳️', 'Energi Void mengganggu kestabilan eksplorasi.', ['Efisiensi eksplorasi -45%.']),
      createEvent('stellar_blessing', 'Stellar Blessing', 'Interstellar', '✨', 'Energi bintang membantu penjelajah menemukan objek antariksa.', ['Peluang menemukan objek langka +30% secara relatif.']),
      createEvent('cosmic_turbulence', 'Cosmic Turbulence', 'Interstellar', '☄️', 'Gelombang energi kosmik mengganggu navigasi.', ['Risiko kegagalan eksplorasi meningkat.'])
    ]
  },
  {
    key: 'pabrik',
    label: 'Pabrik',
    events: [
      createEvent('industrial_boom', 'Industrial Boom', 'Pabrik', '⚙️', 'Aktivitas industri meningkat dan proses produksi berjalan lebih efisien.', ['Hasil produksi meningkat.']),
      createEvent('machinery_breakdown', 'Machinery Breakdown', 'Pabrik', '🔩', 'Kerusakan mesin menghambat proses produksi di pabrik.', ['Hasil produksi berkurang.'])
    ]
  },
  {
    key: 'koperasi',
    label: 'Koperasi',
    events: [
      createEvent('member_prosperity', 'Member Prosperity', 'Koperasi', '💰', 'Kepercayaan anggota meningkat sehingga aktivitas koperasi semakin ramai.', ['Bonus keuntungan koperasi meningkat.']),
      createEvent('capital_withdrawal', 'Capital Withdrawal', 'Koperasi', '📉', 'Sejumlah anggota menarik modal sehingga aktivitas koperasi melambat.', ['Keuntungan koperasi berkurang.'])
    ]
  },
  {
    key: 'restoran',
    label: 'Restoran',
    events: [
      createEvent('culinary_festival', 'Culinary Festival', 'Restoran', '👨‍🍳', 'Festival kuliner menarik banyak pelanggan untuk menikmati hidangan restoran.', ['Pendapatan restoran meningkat.']),
      createEvent('ingredient_shortage', 'Ingredient Shortage', 'Restoran', '🥬', 'Pasokan bahan makanan terganggu sehingga operasional restoran menjadi lebih sulit.', ['Keuntungan restoran berkurang.'])
    ]
  },
  {
    key: 'pasar',
    label: 'Pasar',
    events: [
      createEvent('market_surge', 'Market Surge', 'Pasar', '📈', 'Permintaan barang meningkat dan aktivitas jual beli semakin ramai.', ['Pendapatan penjualan pasar meningkat.']),
      createEvent('oversupply_crisis', 'Oversupply Crisis', 'Pasar', '📦', 'Barang dagangan menumpuk karena pasokan melebihi permintaan konsumen.', ['Pendapatan penjualan pasar berkurang.'])
    ]
  },
  {
    key: 'shop',
    label: 'Shop',
    events: [
      createEvent('grand_shopping_festival', 'Grand Shopping Festival', 'Shop', '🎊', 'Festival belanja besar meningkatkan aktivitas bisnis di seluruh sektor shop.', ['Pendapatan seluruh shop meningkat.']),
      createEvent('consumer_spending_decline', 'Consumer Spending Decline', 'Shop', '📉', 'Konsumen mengurangi pengeluaran sehingga aktivitas jual beli melemah di berbagai shop.', ['Pendapatan seluruh shop berkurang.'])
    ]
  },
  {
    key: 'guild',
    label: 'Guild',
    events: [
      createEvent('treasure_hunt', 'Treasure Hunt', 'Guild', '💎', 'Harta karun tersebar di berbagai wilayah, membuat seluruh guild berlomba memburunya.', ['Hadiah dan pemasukan semua guild meningkat.']),
      createEvent('guild_conflict', 'Guild Conflict', 'Guild', '⚔️', 'Perselisihan antarguild memicu ketegangan dan menghambat kerja sama.', ['Pemasukan dan efektivitas aktivitas semua guild menurun.']),
      createEvent('lost_expedition', 'Lost Expedition', 'Guild', '🗺️', 'Peta ekspedisi kuno ditemukan dan membuka peluang penjelajahan bagi semua guild.', ['Hadiah ekspedisi meningkat.']),
      createEvent('trade_embargo', 'Trade Embargo', 'Guild', '🚫', 'Pembatasan perdagangan menghambat pertukaran barang dan sumber daya antarguild.', ['Biaya perdagangan meningkat.']),
      createEvent('grand_tournament', 'Grand Tournament', 'Guild', '🏆', 'Turnamen besar mempertemukan guild-guild untuk memperebutkan hadiah bergengsi.', ['Hadiah aktivitas guild meningkat.'])
    ]
  },
  {
    key: 'home',
    label: 'Home',
    events: [
      createEvent('bbq_season', 'BBQ Season', 'Home', '🍖', 'Musim barbeku tiba dan hampir setiap rumah mengadakan pesta bersama keluarga maupun teman.', ['Popularitas dan kebahagiaan seluruh rumah meningkat.']),
      createEvent('power_outage', 'Power Outage', 'Home', '⚡', 'Pemadaman listrik meluas dan mengganggu fasilitas serta aktivitas rumah tangga.', ['Kenyamanan seluruh rumah menurun.']),
      createEvent('holiday_season', 'Holiday Season', 'Home', '🎄', 'Musim liburan membuat penghuni rumah lebih sering berkumpul dan mengadakan acara.', ['Kebahagiaan seluruh rumah meningkat.']),
      createEvent('natural_disaster', 'Natural Disaster', 'Home', '🌪️', 'Bencana alam melanda berbagai wilayah dan menyebabkan kerusakan bangunan.', ['Biaya perawatan seluruh rumah meningkat.']),
      createEvent('pandemic_outbreak', 'Pandemic Outbreak', 'Home', '🦠', 'Wabah penyakit menyebar dan membatasi kegiatan sosial serta pertemuan di rumah.', ['Popularitas dan kebahagiaan seluruh rumah menurun.'])
    ]
  },
  {
    key: 'penjara',
    label: 'Penjara',
    events: [
      createEvent('security_loophole', 'Security Loophole', 'Penjara', '🕊️', 'Kelengahan dalam pengawasan menciptakan celah bagi para napi.', ['Peluang keberhasilan kabur meningkat.']),
      createEvent('maximum_security', 'Maximum Security', 'Penjara', '🚨', 'Penjagaan diperketat setelah terjadi insiden keamanan di dalam penjara.', ['Peluang keberhasilan kabur menurun.'])
    ]
  },
  {
    key: 'kriminal',
    label: 'Kriminal',
    events: [
      createEvent('criminal_underworld', 'Criminal Underworld', 'Kriminal', '🌑', 'Jaringan kriminal mengalami peningkatan aktivitas dan peluang operasi.', ['Hasil kegiatan kriminal meningkat.']),
      createEvent('crackdown_operation', 'Crackdown Operation', 'Kriminal', '🚔', 'Aparat meningkatkan pengawasan dan melakukan operasi penindakan besar-besaran.', ['Risiko tertangkap meningkat.'])
    ]
  },
  {
    key: 'kerja',
    label: 'Kerja',
    events: [
      createEvent('rising_demand', 'Rising Demand', 'Kerja', '📈', 'Kebutuhan tenaga kerja meningkat dan peluang mendapatkan penghasilan bertambah.', ['Pendapatan kerja meningkat.']),
      createEvent('economic_slowdown', 'Economic Slowdown', 'Kerja', '📉', 'Perlambatan aktivitas ekonomi mengurangi produktivitas dan peluang memperoleh penghasilan.', ['Pendapatan kerja berkurang.'])
    ]
  },
  {
    key: 'live-youtube',
    label: 'Live YouTube',
    events: [
      createEvent('trending_wave', 'Trending Wave', 'Live YouTube', '🔥', 'Aktivitas platform meningkat dan konten mendapatkan jangkauan yang lebih luas.', ['Penonton dan pendapatan live meningkat.']),
      createEvent('platform_disruption', 'Platform Disruption', 'Live YouTube', '📡', 'Gangguan platform menghambat jangkauan konten dan aktivitas siaran langsung.', ['Penonton dan pendapatan live berkurang.'])
    ]
  },
  {
    key: 'invest',
    label: 'Invest',
    events: [
      createEvent('bullish_momentum', 'Bullish Momentum', 'Invest', '🚀', 'Sentimen pasar menguat dan pergerakan harga cenderung menguntungkan pemegang aset.', ['Nilai aset meningkat.']),
      createEvent('bearish_pressure', 'Bearish Pressure', 'Invest', '📉', 'Sentimen pasar melemah dan tekanan jual mendorong penurunan harga aset.', ['Nilai aset menurun.'])
    ]
  },
  {
    key: 'double-date-events',
    label: 'Double Date Events',
    events: [
      createEvent('new_year_celebration', 'New Year Celebration', 'Double Date Events', '🎆', 'Perayaan tahun baru membuka awal perjalanan dengan semangat dan harapan baru.', ['Bonus uang dan EXP meningkat.']),
      createEvent('double_happiness', 'Double Happiness', 'Double Date Events', '💕', 'Hari penuh kebahagiaan mendorong interaksi dan kedekatan antarpemain.', ['Bonus aktivitas sosial meningkat.']),
      createEvent('triple_fortune', 'Triple Fortune', 'Double Date Events', '🍀', 'Keberuntungan menyertai berbagai aktivitas dan peluang mendapatkan hadiah.', ['Peluang hadiah bonus meningkat.']),
      createEvent('lucky_deals', 'Lucky Deals', 'Double Date Events', '💰', 'Penawaran menarik bermunculan di berbagai toko dan pusat perdagangan.', ['Diskon belanja meningkat.']),
      createEvent('mega_gift_day', 'Mega Gift Day', 'Double Date Events', '🎁', 'Perayaan hadiah memberikan kesempatan memperoleh berbagai bonus spesial.', ['Hadiah login meningkat.']),
      createEvent('midyear_shopping', 'Midyear Shopping', 'Double Date Events', '🛍️', 'Promo pertengahan tahun berlangsung di berbagai pusat perbelanjaan.', ['Harga barang toko berkurang.']),
      createEvent('lucky_seven', 'Lucky Seven', 'Double Date Events', '✨', 'Angka keberuntungan menjadi simbol perayaan dengan hadiah menarik.', ['Bonus hadiah aktivitas meningkat.']),
      createEvent('wealth_festival', 'Wealth Festival', 'Double Date Events', '💎', 'Perayaan kemakmuran membawa peluang mendapatkan penghasilan tambahan.', ['Pendapatan aktivitas meningkat.']),
      createEvent('double_rewards', 'Double Rewards', 'Double Date Events', '🎮', 'Perayaan tanggal kembar memberikan kesempatan memperoleh hadiah tambahan.', ['Hadiah aktivitas RPG meningkat.']),
      createEvent('perfect_ten', 'Perfect Ten', 'Double Date Events', '🔟', 'Perayaan angka sempurna memberikan bonus untuk berbagai aktivitas.', ['Bonus uang dan EXP meningkat.']),
      createEvent('grand_shopping_festival_1111', 'Grand Shopping Festival', 'Double Date Events', '🛒', 'Festival belanja besar menghadirkan berbagai penawaran menarik.', ['Diskon toko meningkat.']),
      createEvent('year_end_carnival', 'Year-End Carnival', 'Double Date Events', '🎉', 'Karnaval akhir tahun menghadirkan berbagai hadiah dan perayaan spesial.', ['Bonus global dan hadiah meningkat.'])
    ]
  },
  {
    key: 'special-day-events',
    label: 'Special Day Events',
    events: [
      createEvent('new_years_day', "New Year's Day", 'Special Day Events', '🎆', 'Perayaan tahun baru membuka awal perjalanan dengan harapan dan semangat baru.', ['Bonus uang dan EXP meningkat.']),
      createEvent('lunar_new_year', 'Lunar New Year', 'Special Day Events', '🧧', 'Tahun baru lunar dirayakan dengan tradisi, kebersamaan, dan keberuntungan.', ['Hadiah login dan bonus uang.']),
      createEvent('isra_mi_raj', 'Isra and Mi\'raj', 'Special Day Events', '🕌', 'Peringatan perjalanan spiritual Nabi Muhammad menjadi momen refleksi dan ketenangan.', ['Hadiah peringatan spesial.']),
      createEvent('ramadan', 'Ramadan', 'Special Day Events', '🌙', 'Bulan puasa membawa suasana kebersamaan, berbagi, dan berbagai kegiatan Ramadan.', ['Bonus aktivitas sosial dan hadiah login Ramadan.']),
      createEvent('ramadan_bazaar', 'Ramadan Bazaar', 'Special Day Events', '🛍️', 'Bazar Ramadan menghadirkan berbagai makanan, kebutuhan, dan penawaran menarik.', ['Diskon toko meningkat.']),
      createEvent('eid_al_fitr', 'Eid al-Fitr', 'Special Day Events', '🌙', 'Perayaan berakhirnya bulan puasa menjadi momen silaturahmi dan berbagi hadiah.', ['Bonus uang dan hadiah Lebaran.']),
      createEvent('nyepi', 'Nyepi', 'Special Day Events', '🪔', 'Hari keheningan Bali menjadi momen refleksi, ketenangan, dan keseimbangan.', ['Bonus aktivitas relaksasi.']),
      createEvent('good_friday', 'Good Friday', 'Special Day Events', '✝️', 'Peringatan Jumat Agung menjadi momen refleksi bagi umat Kristen.', ['Hadiah peringatan spesial.']),
      createEvent('easter_sunday', 'Easter Sunday', 'Special Day Events', '🐣', 'Perayaan Paskah membawa simbol harapan, pembaruan, dan kebersamaan.', ['Hadiah login dan bonus EXP.']),
      createEvent('international_womens_day', "International Women's Day", 'Special Day Events', '🌷', 'Perayaan untuk menghargai kontribusi perempuan di berbagai bidang.', ['Hadiah login spesial.']),
      createEvent('april_fools_day', "April Fools' Day", 'Special Day Events', '🤡', 'Kejutan dan kejadian tak terduga mewarnai berbagai aktivitas pemain.', ['Hadiah acak spesial.']),
      createEvent('earth_day', 'Earth Day', 'Special Day Events', '🌍', 'Kampanye kepedulian lingkungan mendorong aktivitas yang berhubungan dengan alam.', ['Bonus Farming meningkat.']),
      createEvent('international_labour_day', 'International Labour Day', 'Special Day Events', '💼', 'Perayaan pekerja membawa apresiasi terhadap usaha dan produktivitas.', ['Pendapatan kerja meningkat.']),
      createEvent('ascension_day', 'Ascension Day', 'Special Day Events', '✝️', 'Peringatan Kenaikan Yesus Kristus menjadi momen refleksi bagi umat Kristen.', ['Hadiah peringatan spesial.']),
      createEvent('eid_al_adha', 'Eid al-Adha', 'Special Day Events', '🐐', 'Perayaan Iduladha membawa semangat berkurban, berbagi, dan kepedulian sosial.', ['Bonus Ternak dan hadiah spesial.']),
      createEvent('vesak_day', 'Vesak Day', 'Special Day Events', '🪷', 'Perayaan Waisak menjadi momen refleksi dan penyebaran nilai kedamaian.', ['Hadiah login spesial.']),
      createEvent('world_environment_day', 'World Environment Day', 'Special Day Events', '🌱', 'Perayaan lingkungan mendorong kepedulian terhadap alam dan ekosistem.', ['Bonus Farming dan Ternak meningkat.']),
      createEvent('islamic_new_year', 'Islamic New Year', 'Special Day Events', '☪️', 'Tahun baru Hijriah menjadi momen refleksi dan awal perjalanan baru.', ['Bonus EXP dan hadiah spesial.']),
      createEvent('indonesian_independence_day', 'Indonesian Independence Day', 'Special Day Events', '🇮🇩', 'Perayaan kemerdekaan menghadirkan kompetisi, kebersamaan, dan hadiah spesial.', ['Bonus event dan hadiah meningkat.']),
      createEvent('mawlid_al_nabi', 'Mawlid al-Nabi', 'Special Day Events', '🕌', 'Peringatan kelahiran Nabi Muhammad menjadi momen mengenang keteladanan beliau.', ['Hadiah peringatan spesial.']),
      createEvent('world_mental_health_day', 'World Mental Health Day', 'Special Day Events', '🧠', 'Kampanye kesadaran kesehatan mental mendorong keseimbangan dan kepedulian.', ['Bonus aktivitas sosial.']),
      createEvent('diwali', 'Diwali', 'Special Day Events', '🪔', 'Festival cahaya melambangkan kemenangan kebaikan dan harapan baru.', ['Bonus uang dan hadiah spesial.']),
      createEvent('halloween', 'Halloween', 'Special Day Events', '🎃', 'Suasana horor memenuhi dunia dengan kejutan, monster, dan hadiah misterius.', ['Hadiah event dan item spesial.']),
      createEvent('day_of_the_dead', 'Day of the Dead', 'Special Day Events', '💀', 'Tradisi mengenang orang yang telah meninggal dirayakan melalui berbagai kebudayaan.', ['Hadiah koleksi bertema spesial.']),
      createEvent('black_friday', 'Black Friday', 'Special Day Events', '🛍️', 'Diskon besar hadir di berbagai toko menjelang musim belanja akhir tahun.', ['Diskon toko meningkat.']),
      createEvent('cyber_monday', 'Cyber Monday', 'Special Day Events', '💻', 'Promo belanja digital menghadirkan penawaran menarik untuk berbagai barang.', ['Diskon belanja online meningkat.']),
      createEvent('hanukkah', 'Hanukkah', 'Special Day Events', '🕎', 'Festival cahaya Yahudi dirayakan melalui tradisi keluarga dan penyalaan menorah.', ['Hadiah login spesial.']),
      createEvent('christmas_eve', 'Christmas Eve', 'Special Day Events', '🕯️', 'Malam menjelang Natal membawa suasana kebersamaan dan persiapan perayaan.', ['Bonus aktivitas sosial.']),
      createEvent('christmas_day', 'Christmas Day', 'Special Day Events', '🎄', 'Perayaan Natal membawa suasana hangat dan kesempatan berbagi hadiah.', ['Hadiah login dan bonus spesial.']),
      createEvent('new_years_eve', "New Year's Eve", 'Special Day Events', '🥂', 'Perayaan malam tahun baru menjadi penutup perjalanan selama setahun.', ['Hadiah akhir tahun dan bonus uang.']),
      createEvent('valentines_day', "Valentine's Day", 'Special Day Events', '💘', 'Hari kasih sayang mendorong pemain berbagi hadiah dan mempererat hubungan.', ['Bonus aktivitas RSHIP meningkat.']),
      createEvent('saint_patricks_day', "Saint Patrick's Day", 'Special Day Events', '🍀', 'Perayaan budaya Irlandia menghadirkan suasana meriah dan simbol keberuntungan.', ['Peluang hadiah bonus meningkat.']),
      createEvent('holi_festival', 'Holi Festival', 'Special Day Events', '🎨', 'Festival warna merayakan kebahagiaan, persahabatan, dan datangnya musim semi.', ['Bonus aktivitas sosial meningkat.']),
      createEvent('nowruz', 'Nowruz', 'Special Day Events', '🌸', 'Perayaan tahun baru Persia menandai pembaruan dan datangnya musim semi.', ['Bonus EXP dan uang meningkat.']),
      createEvent('songkran_festival', 'Songkran Festival', 'Special Day Events', '💦', 'Festival air Thailand merayakan tahun baru dengan permainan dan kebersamaan.', ['Bonus aktivitas sosial meningkat.']),
      createEvent('kartini_day', 'Kartini Day', 'Special Day Events', '🌹', 'Peringatan perjuangan R.A. Kartini menjadi simbol pendidikan dan pemberdayaan perempuan.', ['Hadiah login spesial.']),
      createEvent('childrens_day', "Children's Day", 'Special Day Events', '🎈', 'Perayaan anak-anak menghadirkan kegiatan menyenangkan dan hadiah untuk pemain.', ['Bonus hadiah aktivitas meningkat.']),
      createEvent('world_music_day', 'World Music Day', 'Special Day Events', '🎵', 'Perayaan musik mendorong kreativitas dan hiburan di berbagai komunitas.', ['Bonus aktivitas hiburan meningkat.']),
      createEvent('international_friendship_day', 'International Friendship Day', 'Special Day Events', '🤝', 'Hari persahabatan mendorong pemain mempererat hubungan dan bekerja sama.', ['Bonus interaksi sosial meningkat.']),
      createEvent('pride_month', 'Pride Month', 'Special Day Events', '🏳️‍🌈', 'Perayaan keberagaman dan kesetaraan mengangkat pesan penerimaan dan kebersamaan.', ['Hadiah event spesial.']),
      createEvent('pancasila_day', 'Pancasila Day', 'Special Day Events', '🇮🇩', 'Peringatan lahirnya Pancasila menjadi momen mengenang dasar negara Indonesia.', ['Bonus event nasional.']),
      createEvent('national_batik_day', 'National Batik Day', 'Special Day Events', '🇮🇩', 'Perayaan batik mengangkat warisan budaya dan karya tradisional Indonesia.', ['Hadiah koleksi bertema budaya.']),
      createEvent('youth_pledge_day', 'Youth Pledge Day', 'Special Day Events', '🇮🇩', 'Peringatan Sumpah Pemuda mengangkat semangat persatuan dan kebersamaan.', ['Bonus aktivitas komunitas.']),
      createEvent('heroes_day', "Heroes' Day", 'Special Day Events', '🇮🇩', 'Peringatan Hari Pahlawan mengenang perjuangan para pahlawan Indonesia.', ['Hadiah login spesial.']),
      createEvent('thanksgiving', 'Thanksgiving', 'Special Day Events', '🦃', 'Perayaan rasa syukur mendorong keluarga dan komunitas berkumpul bersama.', ['Bonus hadiah dan uang.']),
      createEvent('mid_autumn_festival', 'Mid-Autumn Festival', 'Special Day Events', '🥮', 'Festival pertengahan musim gugur dirayakan dengan lentera dan kue bulan.', ['Hadiah koleksi spesial.']),
      createEvent('dragon_boat_festival', 'Dragon Boat Festival', 'Special Day Events', '🐉', 'Festival budaya Tiongkok dirayakan melalui perlombaan perahu naga dan tradisi kuliner.', ['Bonus aktivitas dan hadiah.']),
      createEvent('oktoberfest', 'Oktoberfest', 'Special Day Events', '🍻', 'Festival rakyat Jerman menghadirkan hiburan, makanan, dan perayaan budaya.', ['Bonus aktivitas hiburan.']),
      createEvent('boxing_day', 'Boxing Day', 'Special Day Events', '🎁', 'Hari setelah Natal identik dengan diskon, belanja, dan berbagai penawaran.', ['Diskon toko meningkat.']),
      createEvent('kwanzaa', 'Kwanzaa', 'Special Day Events', '🎊', 'Perayaan budaya Afrika-Amerika mengangkat persatuan, keluarga, dan warisan budaya.', ['Hadiah login dan bonus sosial.'])
    ]
  }
])

export const RPG_EVENTS = EVENT_CATEGORY_DATA.flatMap(category => category.events)

export function getRpgEventCategories() {
  return EVENT_CATEGORY_DATA.map(category => ({
    key: category.key,
    label: category.label,
    count: category.events.length
  }))
}

export function findRpgEventCategory(value) {
  const key = normalize(value)
  return EVENT_CATEGORY_DATA.find(category => normalize(category.key) === key || normalize(category.label) === key) || null
}

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
