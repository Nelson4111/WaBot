export const STELLAR_CREDIT = {
  id: 'stellar_credit',
  name: 'Stellar Credit',
  emoji: '💠',
  tier: 'CURRENCY',
  sellPrice: 1,
  description: 'Kredit antarbintang yang ditemukan selama penjelajahan.'
}

export const INTERSTELLAR_ITEMS = [
  { id: 'nebula_dust', name: 'Debu Nebula', emoji: '🌫️', tier: 'COMMON', weight: 28, sellPrice: 10, description: 'Debu berkilau dari awan gas antarbintang.' },
  { id: 'lunar_alloy', name: 'Paduan Lunar', emoji: '🌙', tier: 'COMMON', weight: 24, sellPrice: 15, description: 'Logam ringan yang terbentuk di permukaan bulan jauh.' },
  { id: 'comet_ice', name: 'Es Komet', emoji: '🧊', tier: 'COMMON', weight: 22, sellPrice: 18, description: 'Es purba yang membeku di ekor sebuah komet.' },
  { id: 'starwood', name: 'Kayu Bintang', emoji: '🪵', tier: 'COMMON', weight: 18, sellPrice: 20, description: 'Serat kayu berpendar dari hutan planet asing.' },
  { id: 'ion_crystal', name: 'Kristal Ion', emoji: '🔹', tier: 'RARE', weight: 17, sellPrice: 35, description: 'Kristal bermuatan yang menyimpan energi atmosfer.' },
  { id: 'meteor_pearl', name: 'Mutiara Meteor', emoji: '🫧', tier: 'RARE', weight: 13, sellPrice: 45, description: 'Butiran mineral yang mengeras di dalam meteor.' },
  { id: 'orbiting_seed', name: 'Benih Orbit', emoji: '🌱', tier: 'RARE', weight: 10, sellPrice: 55, description: 'Benih tanaman yang mampu tumbuh tanpa gravitasi.' },
  { id: 'void_silk', name: 'Sutra Hampa', emoji: '🕸️', tier: 'EPIC', weight: 9, sellPrice: 75, description: 'Benang tipis yang dipintal dari energi ruang hampa.' },
  { id: 'stellar_compass', name: 'Kompas Stellar', emoji: '🧭', tier: 'EPIC', weight: 7, sellPrice: 95, description: 'Kompas yang menunjuk ke rasi bintang terdekat.' },
  { id: 'aurora_fragment', name: 'Fragmen Aurora', emoji: '🌈', tier: 'EPIC', weight: 5, sellPrice: 120, description: 'Serpihan cahaya aurora yang membeku menjadi kristal.' },
  { id: 'ancient_satellite', name: 'Satelit Kuno', emoji: '🛰️', tier: 'LEGENDARY', weight: 3, sellPrice: 180, description: 'Perangkat komunikasi peninggalan peradaban yang hilang.' },
  { id: 'pulsar_heart', name: 'Jantung Pulsar', emoji: '💜', tier: 'MYTHIC', weight: 1, sellPrice: 260, description: 'Inti energi berdenyut dari bintang neutron.' },

  // COMMON — Material dan temuan planet
  { id: 'mars_iron_ore', name: 'Bijih Besi Mars', emoji: '🪨', tier: 'COMMON', weight: 26, sellPrice: 12, description: 'Bijih kemerahan yang ditambang dari kawah Mars.' },
  { id: 'lunar_regolith', name: 'Regolit Bulan', emoji: '🌑', tier: 'COMMON', weight: 25, sellPrice: 13, description: 'Lapisan debu dan pecahan batu dari permukaan bulan asing.' },
  { id: 'frozen_ammonia', name: 'Amonia Beku', emoji: '🧊', tier: 'COMMON', weight: 24, sellPrice: 14, description: 'Senyawa beku yang ditemukan di dataran es planet dingin.' },
  { id: 'asteroid_gravel', name: 'Kerikil Asteroid', emoji: '🪨', tier: 'COMMON', weight: 23, sellPrice: 14, description: 'Pecahan batu kecil yang terkumpul di sabuk asteroid.' },
  { id: 'cosmic_salt', name: 'Garam Kosmik', emoji: '🧂', tier: 'COMMON', weight: 22, sellPrice: 16, description: 'Kristal mineral yang terbentuk di danau kering planet asing.' },
  { id: 'crater_glass', name: 'Kaca Kawah', emoji: '🔹', tier: 'COMMON', weight: 21, sellPrice: 17, description: 'Kaca alami hasil tumbukan meteor berenergi tinggi.' },
  { id: 'venusian_sulfur', name: 'Belerang Venus', emoji: '🟡', tier: 'COMMON', weight: 20, sellPrice: 18, description: 'Endapan belerang kuning dari dataran vulkanik Venus.' },
  { id: 'ice_moon_shard', name: 'Serpihan Bulan Es', emoji: '❄️', tier: 'COMMON', weight: 19, sellPrice: 19, description: 'Pecahan es purba yang diambil dari bulan bersalju.' },
  { id: 'red_dwarf_dust', name: 'Debu Katai Merah', emoji: '🔴', tier: 'COMMON', weight: 18, sellPrice: 20, description: 'Partikel mineral yang ditemukan di orbit bintang katai merah.' },
  { id: 'space_moss', name: 'Lumut Antariksa', emoji: '🌿', tier: 'COMMON', weight: 17, sellPrice: 21, description: 'Organisme kecil yang tumbuh di celah batu tanpa atmosfer.' },
  { id: 'alien_pollen', name: 'Serbuk Sari Alien', emoji: '🌼', tier: 'COMMON', weight: 16, sellPrice: 22, description: 'Serbuk tanaman asing yang mengambang di udara planet.' },
  { id: 'silicate_shell', name: 'Cangkang Silikat', emoji: '🐚', tier: 'COMMON', weight: 15, sellPrice: 23, description: 'Cangkang organisme kecil dengan lapisan mineral keras.' },
  { id: 'crystal_sand', name: 'Pasir Kristal', emoji: '✨', tier: 'COMMON', weight: 14, sellPrice: 24, description: 'Butiran transparan dari gurun planet yang memantulkan cahaya.' },
  { id: 'meteorite_nickel', name: 'Nikel Meteorit', emoji: '⚙️', tier: 'COMMON', weight: 13, sellPrice: 25, description: 'Logam tahan lama yang diambil dari batuan luar angkasa.' },
  { id: 'blue_planet_clay', name: 'Tanah Liat Planet Biru', emoji: '🫐', tier: 'COMMON', weight: 12, sellPrice: 26, description: 'Tanah mineral berwarna biru dari lembah planet samudra.' },
  { id: 'comet_tail_snow', name: 'Salju Ekor Komet', emoji: '❄️', tier: 'COMMON', weight: 11, sellPrice: 27, description: 'Kristal es halus yang tertinggal di jalur sebuah komet.' },
  { id: 'basalt_moonstone', name: 'Basalt Bulan', emoji: '🌑', tier: 'COMMON', weight: 10, sellPrice: 28, description: 'Batu vulkanik gelap yang membentuk dataran bulan.' },
  { id: 'orbital_fungus', name: 'Jamur Orbital', emoji: '🍄', tier: 'COMMON', weight: 9, sellPrice: 29, description: 'Jamur mungil yang tumbuh di rongga asteroid lembap.' },
  { id: 'stellar_crystal_dust', name: 'Serbuk Kristal Stellar', emoji: '💠', tier: 'COMMON', weight: 8, sellPrice: 30, description: 'Partikel kristal dari cincin debu di sekitar bintang muda.' },
  { id: 'alien_seed_pod', name: 'Polong Benih Alien', emoji: '🫘', tier: 'COMMON', weight: 7, sellPrice: 32, description: 'Polong tanaman asing yang ditemukan di dataran tandus.' },

  // RARE — Mineral langka dan organisme asing
  { id: 'titanium_asteroid', name: 'Titanium Asteroid', emoji: '⚙️', tier: 'RARE', weight: 16, sellPrice: 38, description: 'Logam kuat dari inti asteroid yang kaya titanium.' },
  { id: 'plasma_residue', name: 'Residu Plasma', emoji: '🔵', tier: 'RARE', weight: 15, sellPrice: 42, description: 'Endapan energi yang membeku setelah badai plasma berlalu.' },
  { id: 'cryo_gel', name: 'Gel Kriogenik', emoji: '🧪', tier: 'RARE', weight: 14, sellPrice: 46, description: 'Gel dingin yang ditemukan di laboratorium stasiun terbengkalai.' },
  { id: 'xenon_gas_capsule', name: 'Kapsul Gas Xenon', emoji: '🫧', tier: 'RARE', weight: 13, sellPrice: 50, description: 'Tabung kecil berisi gas langka yang dikumpulkan dari atmosfer planet.' },
  { id: 'alien_chitin', name: 'Kitin Alien', emoji: '🪲', tier: 'RARE', weight: 12, sellPrice: 54, description: 'Lapisan pelindung keras dari serangga raksasa planet asing.' },
  { id: 'moonstone_opal', name: 'Opal Bulan', emoji: '🌙', tier: 'RARE', weight: 11, sellPrice: 58, description: 'Batu opal yang memantulkan warna berbeda di bawah cahaya bintang.' },
  { id: 'magnetic_ore', name: 'Bijih Magnetik', emoji: '🧲', tier: 'RARE', weight: 10, sellPrice: 62, description: 'Mineral asing yang menghasilkan medan magnet tidak biasa.' },
  { id: 'quantum_sand', name: 'Pasir Kuantum', emoji: '⏳', tier: 'RARE', weight: 9, sellPrice: 66, description: 'Butiran halus yang bergetar tidak menentu ketika disentuh.' },
  { id: 'bioluminescent_spore', name: 'Spora Bioluminesen', emoji: '🍄', tier: 'RARE', weight: 8, sellPrice: 70, description: 'Spora bercahaya dari hutan jamur di planet bawah tanah.' },
  { id: 'alien_coral', name: 'Koral Antarbintang', emoji: '🪸', tier: 'RARE', weight: 7, sellPrice: 74, description: 'Koral keras dari samudra planet yang memiliki dua matahari.' },
  { id: 'meteor_opal', name: 'Opal Meteorit', emoji: '💎', tier: 'RARE', weight: 6, sellPrice: 78, description: 'Permata berwarna-warni yang ditemukan di dalam meteor langka.' },
  { id: 'gravity_stone', name: 'Batu Gravitasi', emoji: '🪨', tier: 'RARE', weight: 5, sellPrice: 82, description: 'Mineral yang terasa lebih ringan atau berat bergantung pada posisinya.' },
  { id: 'alien_spore_sack', name: 'Kantung Spora Alien', emoji: '🫧', tier: 'RARE', weight: 4, sellPrice: 86, description: 'Kantung organisme yang berisi spora tahan kondisi ekstrem.' },
  { id: 'meteor_core_fragment', name: 'Fragmen Inti Meteor', emoji: '☄️', tier: 'RARE', weight: 3, sellPrice: 90, description: 'Potongan inti meteor yang tetap hangat meski berada di ruang hampa.' },
  { id: 'luminous_fossil', name: 'Fosil Bercahaya', emoji: '🦴', tier: 'RARE', weight: 2, sellPrice: 95, description: 'Fosil organisme asing yang masih memancarkan cahaya redup.' },
  { id: 'nebula_flower', name: 'Bunga Nebula', emoji: '🌸', tier: 'RARE', weight: 1, sellPrice: 100, description: 'Bunga eksotis yang kelopaknya menyerap cahaya bintang.' },

  // EPIC — Teknologi alien dan temuan anomali
  { id: 'alien_data_chip', name: 'Chip Data Alien', emoji: '💾', tier: 'EPIC', weight: 9, sellPrice: 110, description: 'Keping data dari wahana asing dengan simbol yang belum diterjemahkan.' },
  { id: 'warp_cell', name: 'Sel Warp', emoji: '🔋', tier: 'EPIC', weight: 8, sellPrice: 125, description: 'Sumber daya kecil yang dirancang untuk menstabilkan mesin warp.' },
  { id: 'antimatter_canister', name: 'Tabung Antimateri', emoji: '🧪', tier: 'EPIC', weight: 7, sellPrice: 140, description: 'Wadah pengaman untuk partikel antimateri hasil eksperimen antariksa.' },
  { id: 'alien_holo_projector', name: 'Proyektor Hologram Alien', emoji: '📽️', tier: 'EPIC', weight: 6, sellPrice: 155, description: 'Perangkat rusak yang masih mampu memancarkan peta holografis.' },
  { id: 'gravity_drive_coil', name: 'Kumparan Penggerak Gravitasi', emoji: '🌀', tier: 'EPIC', weight: 5, sellPrice: 170, description: 'Komponen mesin alien yang dapat mengubah distribusi medan gravitasi.' },
  { id: 'stasis_pod_fragment', name: 'Fragmen Pod Stasis', emoji: '🧊', tier: 'EPIC', weight: 4, sellPrice: 185, description: 'Pecahan kapsul penyimpanan yang ditemukan di kapal terlantar.' },
  { id: 'alien_translator', name: 'Penerjemah Universal', emoji: '🎛️', tier: 'EPIC', weight: 3, sellPrice: 200, description: 'Perangkat komunikasi yang mengenali pola bahasa sejumlah spesies asing.' },
  { id: 'dimensional_battery', name: 'Baterai Dimensi', emoji: '🔋', tier: 'EPIC', weight: 2, sellPrice: 220, description: 'Baterai anomali yang menyimpan energi dari celah antardimensi.' },
  { id: 'portal_residue', name: 'Residu Portal', emoji: '🌀', tier: 'EPIC', weight: 1, sellPrice: 240, description: 'Partikel berwarna yang tertinggal setelah portal antarbintang menutup.' },

  // LEGENDARY — Artefak kosmik dan teknologi ikonik
  { id: 'mind_stone', name: 'Mind Stone', emoji: '💛', tier: 'LEGENDARY', weight: 3, sellPrice: 300, description: 'Batu kosmik kuning yang dikaitkan dengan pikiran dan kesadaran dalam semesta Marvel.' },
  { id: 'reality_stone', name: 'Reality Stone', emoji: '🔴', tier: 'LEGENDARY', weight: 3, sellPrice: 320, description: 'Batu kosmik merah yang dapat memanipulasi realitas dalam kisah Marvel.' },
  { id: 'power_stone', name: 'Power Stone', emoji: '🟣', tier: 'LEGENDARY', weight: 3, sellPrice: 340, description: 'Batu kosmik ungu yang melambangkan energi dan daya hancur luar biasa.' },
  { id: 'space_stone', name: 'Space Stone', emoji: '🔵', tier: 'LEGENDARY', weight: 3, sellPrice: 360, description: 'Batu kosmik biru yang berkaitan dengan perjalanan melintasi ruang.' },
  { id: 'time_stone', name: 'Time Stone', emoji: '🟢', tier: 'LEGENDARY', weight: 3, sellPrice: 380, description: 'Batu kosmik hijau yang berkaitan dengan manipulasi waktu.' },
  { id: 'soul_stone', name: 'Soul Stone', emoji: '🟠', tier: 'LEGENDARY', weight: 2, sellPrice: 400, description: 'Batu kosmik jingga yang memiliki hubungan misterius dengan jiwa.' },
  { id: 'chitauri_power_cell', name: 'Sel Energi Chitauri', emoji: '🔋', tier: 'LEGENDARY', weight: 2, sellPrice: 420, description: 'Sumber daya alien yang ditemukan di reruntuhan pangkalan tempur.' },
  { id: 'kree_data_core', name: 'Inti Data Kree', emoji: '💠', tier: 'LEGENDARY', weight: 2, sellPrice: 440, description: 'Inti penyimpanan berteknologi Kree dengan catatan navigasi antarbintang.' },
  { id: 'skrull_morph_sample', name: 'Sampel Biologi Skrull', emoji: '🧬', tier: 'LEGENDARY', weight: 2, sellPrice: 460, description: 'Sampel jaringan alien yang berkaitan dengan kemampuan perubahan bentuk.' },
  { id: 'nova_corps_beacon', name: 'Suar Nova Corps', emoji: '📡', tier: 'LEGENDARY', weight: 2, sellPrice: 480, description: 'Pemancar sinyal yang ditemukan dari reruntuhan pos penjaga galaksi.' },
  { id: 'celestial_bone', name: 'Fragmen Tulang Celestial', emoji: '🦴', tier: 'LEGENDARY', weight: 1, sellPrice: 520, description: 'Material purba raksasa yang ditemukan mengambang di dekat planet mati.' },
  { id: 'cosmic_cube_shard', name: 'Pecahan Kubus Kosmik', emoji: '🧊', tier: 'LEGENDARY', weight: 1, sellPrice: 560, description: 'Pecahan artefak biru yang masih mengeluarkan gelombang energi.' },
  { id: 'vibranium_meteorite', name: 'Meteorit Vibranium', emoji: '⚙️', tier: 'LEGENDARY', weight: 1, sellPrice: 600, description: 'Fragmen logam luar angkasa yang dikaitkan dengan vibranium.' },
  { id: 'quantum_realm_crystal', name: 'Kristal Quantum Realm', emoji: '💎', tier: 'LEGENDARY', weight: 1, sellPrice: 650, description: 'Kristal asing yang ditemukan di wilayah dengan hukum fisika tidak biasa.' },

  // LEGENDARY — Temuan dari galaksi Star Wars
  { id: 'kyber_crystal_blue', name: 'Kristal Kyber Biru', emoji: '🔷', tier: 'LEGENDARY', weight: 3, sellPrice: 310, description: 'Kristal alami yang biasa dikaitkan dengan lightsaber biru.' },
  { id: 'kyber_crystal_red', name: 'Kristal Kyber Merah', emoji: '🔴', tier: 'LEGENDARY', weight: 2, sellPrice: 350, description: 'Kristal merah yang melambangkan sisi gelap dalam kisah Star Wars.' },
  { id: 'beskar_ingot', name: 'Batangan Beskar', emoji: '🪙', tier: 'LEGENDARY', weight: 3, sellPrice: 370, description: 'Logam Mandalorian yang terkenal akan ketahanan dan nilai budayanya.' },
  { id: 'tibanna_gas', name: 'Tabung Gas Tibanna', emoji: '🫧', tier: 'LEGENDARY', weight: 3, sellPrice: 390, description: 'Gas bertekanan yang digunakan dalam teknologi senjata energi Star Wars.' },
  { id: 'sith_holocron', name: 'Holocron Sith', emoji: '🔺', tier: 'LEGENDARY', weight: 2, sellPrice: 430, description: 'Artefak berbentuk geometris yang menyimpan pengetahuan sisi gelap.' },
  { id: 'jedi_holocron', name: 'Holocron Jedi', emoji: '🔷', tier: 'LEGENDARY', weight: 2, sellPrice: 450, description: 'Perangkat penyimpanan pengetahuan para Jedi yang ditemukan di reruntuhan kuil.' },
  { id: 'death_star_circuit', name: 'Sirkuit Death Star', emoji: '🔌', tier: 'LEGENDARY', weight: 2, sellPrice: 470, description: 'Komponen elektronik yang diduga berasal dari fasilitas Kekaisaran.' },
  { id: 'mandalorian_beskar_scrap', name: 'Pecahan Beskar Mandalorian', emoji: '🛡️', tier: 'LEGENDARY', weight: 2, sellPrice: 490, description: 'Potongan beskar dengan ukiran khas prajurit Mandalorian.' },
  { id: 'droid_memory_core', name: 'Inti Memori Droid', emoji: '🤖', tier: 'LEGENDARY', weight: 2, sellPrice: 510, description: 'Modul memori droid yang menyimpan fragmen koordinat bintang.' },
  { id: 'hyperspace_navigation_chip', name: 'Chip Navigasi Hyperspace', emoji: '💾', tier: 'LEGENDARY', weight: 1, sellPrice: 550, description: 'Chip navigasi untuk menghitung rute perjalanan hyperspace.' },
  { id: 'sarlacc_tooth', name: 'Gigi Sarlacc', emoji: '🦷', tier: 'LEGENDARY', weight: 1, sellPrice: 580, description: 'Fosil gigi makhluk gurun yang ditemukan di planet berpasir.' },
  { id: 'mystery_star_map', name: 'Peta Bintang Kuno', emoji: '🗺️', tier: 'LEGENDARY', weight: 1, sellPrice: 620, description: 'Peta holografis yang menunjuk pada sistem bintang yang terlupakan.' },

  // EPIC — Teknologi dan barang aneh ala Rick and Morty
  { id: 'portal_gun_component', name: 'Komponen Portal Gun', emoji: '🌀', tier: 'EPIC', weight: 6, sellPrice: 160, description: 'Komponen bercahaya yang ditemukan di reruntuhan laboratorium antardimensi.' },
  { id: 'microverse_battery', name: 'Baterai Microverse', emoji: '🔋', tier: 'EPIC', weight: 5, sellPrice: 190, description: 'Sumber energi eksperimental yang terinspirasi dari teknologi Microverse.' },
  { id: 'plumbus_resin', name: 'Resin Plumbus', emoji: '🧴', tier: 'EPIC', weight: 5, sellPrice: 175, description: 'Bahan organik aneh dari peralatan rumah tangga alien yang sangat serbaguna.' },
  { id: 'meeseeks_box', name: 'Meeseeks Box', emoji: '📦', tier: 'LEGENDARY', weight: 2, sellPrice: 450, description: 'Kotak pemanggil makhluk biru yang terinspirasi dari Rick and Morty.' },
  { id: 'rick_portal_fluid', name: 'Cairan Portal Hijau', emoji: '🧪', tier: 'EPIC', weight: 4, sellPrice: 210, description: 'Cairan neon yang ditemukan dalam tabung laboratorium interdimensi.' },
  { id: 'interdimensional_cable', name: 'Kabel Interdimensi', emoji: '📺', tier: 'RARE', weight: 8, sellPrice: 90, description: 'Kabel aneh yang menangkap siaran dari realitas alternatif.' },
  { id: 'galactic_federation_badge', name: 'Lencana Federasi Galaksi', emoji: '🎖️', tier: 'RARE', weight: 7, sellPrice: 85, description: 'Lencana logam yang ditemukan di pos pemeriksaan luar angkasa.' },
  { id: 'alien_gun_crystal', name: 'Kristal Senjata Alien', emoji: '💠', tier: 'EPIC', weight: 4, sellPrice: 205, description: 'Kristal energi yang menjadi inti senjata genggam dari peradaban asing.' },
  { id: 'memory_parasite_sample', name: 'Sampel Parasit Memori', emoji: '🧬', tier: 'EPIC', weight: 3, sellPrice: 230, description: 'Organisme kecil yang dapat memengaruhi ingatan makhluk di sekitarnya.' },
  { id: 'butter_robot_core', name: 'Inti Robot Mentega', emoji: '🤖', tier: 'RARE', weight: 6, sellPrice: 100, description: 'Modul kendali robot kecil dengan fungsi tunggal yang sangat spesifik.' },
  { id: 'space_cruiser_fuel_cell', name: 'Sel Bahan Bakar Cruiser', emoji: '⛽', tier: 'RARE', weight: 6, sellPrice: 115, description: 'Sel bahan bakar yang diambil dari bangkai pesawat antarbintang.' },
  { id: 'alien_currency_chip', name: 'Kredit Galaksi', emoji: '🪙', tier: 'RARE', weight: 7, sellPrice: 80, description: 'Keping pembayaran elektronik yang ditemukan di pasar planet asing.' },
  { id: 'dimension_hopper_chip', name: 'Chip Pelompat Dimensi', emoji: '💾', tier: 'EPIC', weight: 3, sellPrice: 250, description: 'Chip rusak yang berasal dari perangkat perpindahan antarrealitas.' },
  { id: 'sentient_robot_eye', name: 'Mata Robot Sadar', emoji: '👁️', tier: 'EPIC', weight: 3, sellPrice: 225, description: 'Sensor optik yang masih bergerak setelah terlepas dari tubuh robot.' },
  { id: 'alien_food_capsule', name: 'Kapsul Makanan Alien', emoji: '🍬', tier: 'COMMON', weight: 12, sellPrice: 28, description: 'Makanan padat berbentuk kapsul yang dibawa kru kapal asing.' },

  // EPIC — Perangkat eksplorasi dan komponen pesawat
  { id: 'warp_drive_fragment', name: 'Fragmen Warp Drive', emoji: '⚙️', tier: 'EPIC', weight: 4, sellPrice: 215, description: 'Komponen mesin warp yang ditemukan di reruntuhan kapal penjelajah.' },
  { id: 'hyperdrive_regulator', name: 'Regulator Hyperdrive', emoji: '🔧', tier: 'EPIC', weight: 4, sellPrice: 220, description: 'Pengatur aliran energi dari sistem penggerak kapal antarbintang.' },
  { id: 'starship_black_box', name: 'Kotak Hitam Starship', emoji: '📦', tier: 'RARE', weight: 8, sellPrice: 105, description: 'Perekam penerbangan dari pesawat yang hilang di orbit.' },
  { id: 'alien_navigation_orb', name: 'Bola Navigasi Alien', emoji: '🔮', tier: 'EPIC', weight: 3, sellPrice: 235, description: 'Bola proyeksi yang menampilkan rute menuju planet yang belum dipetakan.' },
  { id: 'holographic_star_chart', name: 'Peta Bintang Holografis', emoji: '🌌', tier: 'EPIC', weight: 4, sellPrice: 200, description: 'Peta tiga dimensi yang memuat jalur aman melewati sabuk asteroid.' },
  { id: 'cryo_chamber_key', name: 'Kunci Kamar Kriogenik', emoji: '🗝️', tier: 'RARE', weight: 8, sellPrice: 95, description: 'Kunci akses dari ruang tidur beku sebuah kapal ekspedisi.' },
  { id: 'starship_oxygen_filter', name: 'Filter Oksigen Starship', emoji: '🌬️', tier: 'COMMON', weight: 14, sellPrice: 25, description: 'Filter udara yang masih dapat digunakan dari modul pesawat tua.' },
  { id: 'radiation_scrubber', name: 'Penyaring Radiasi', emoji: '☢️', tier: 'RARE', weight: 7, sellPrice: 110, description: 'Komponen pelindung yang menyerap partikel berbahaya dari ruang angkasa.' },
  { id: 'drone_repair_arm', name: 'Lengan Reparasi Drone', emoji: '🦾', tier: 'RARE', weight: 9, sellPrice: 88, description: 'Lengan mekanis kecil yang digunakan drone pemeliharaan kapal.' },
  { id: 'asteroid_mining_laser', name: 'Laser Penambang Asteroid', emoji: '🔦', tier: 'EPIC', weight: 3, sellPrice: 245, description: 'Pemancar laser yang dirancang untuk memotong lapisan mineral asteroid.' },
  { id: 'solar_sail_fragment', name: 'Fragmen Layar Surya', emoji: '☀️', tier: 'RARE', weight: 8, sellPrice: 92, description: 'Bahan reflektif dari layar pesawat yang memanfaatkan tekanan cahaya.' },
  { id: 'emergency_beacon', name: 'Suar Darurat Antariksa', emoji: '🚨', tier: 'COMMON', weight: 15, sellPrice: 24, description: 'Pemancar kecil yang mengirim sinyal bantuan ke stasiun terdekat.' },
  { id: 'alien_engine_nozzle', name: 'Nosel Mesin Alien', emoji: '🚀', tier: 'EPIC', weight: 4, sellPrice: 230, description: 'Komponen pendorong dengan lapisan logam yang tidak dikenal.' },
  { id: 'orbital_docking_clamp', name: 'Pengunci Docking Orbital', emoji: '🔩', tier: 'RARE', weight: 9, sellPrice: 87, description: 'Pengunci mekanis yang digunakan untuk menyambungkan modul pesawat.' },
  { id: 'starship_ai_module', name: 'Modul AI Starship', emoji: '🧠', tier: 'LEGENDARY', weight: 2, sellPrice: 490, description: 'Modul kecerdasan buatan dari kapal yang ditinggalkan awaknya.' },
  { id: 'plasma_thruster_core', name: 'Inti Pendorong Plasma', emoji: '🔥', tier: 'EPIC', weight: 3, sellPrice: 260, description: 'Komponen mesin yang mengubah plasma menjadi daya dorong.' },
  { id: 'quantum_navigation_key', name: 'Kunci Navigasi Kuantum', emoji: '🗝️', tier: 'LEGENDARY', weight: 2, sellPrice: 520, description: 'Perangkat autentikasi untuk sistem navigasi antarbintang tingkat tinggi.' },
  { id: 'alien_signal_recorder', name: 'Perekam Sinyal Alien', emoji: '📡', tier: 'RARE', weight: 8, sellPrice: 115, description: 'Alat penerima yang menyimpan pola transmisi dari sumber tak dikenal.' },
  { id: 'deep_space_sonar', name: 'Sonar Ruang Dalam', emoji: '📶', tier: 'RARE', weight: 7, sellPrice: 125, description: 'Perangkat pemetaan yang mendeteksi objek di balik awan debu kosmik.' },
  { id: 'stardrive_fuel_crystal', name: 'Kristal Bahan Bakar Stardrive', emoji: '💎', tier: 'EPIC', weight: 3, sellPrice: 275, description: 'Kristal padat yang digunakan sebagai sumber energi mesin antarbintang.' },

  // MYTHIC — Temuan kosmik superlangka
  { id: 'living_nebula_core', name: 'Inti Nebula Hidup', emoji: '🌌', tier: 'MYTHIC', weight: 1, sellPrice: 800, description: 'Inti gas kosmik yang bergerak seolah memiliki kesadaran sendiri.' },
  { id: 'singularity_seed', name: 'Benih Singularitas', emoji: '⚫', tier: 'MYTHIC', weight: 1, sellPrice: 900, description: 'Anomali mini yang melengkungkan cahaya di sekelilingnya.' },
  { id: 'ancient_galactic_archive', name: 'Arsip Galaksi Purba', emoji: '📚', tier: 'MYTHIC', weight: 1, sellPrice: 950, description: 'Penyimpan data kuno berisi jejak peradaban yang telah punah.' },
  { id: 'stellar_phoenix_egg', name: 'Telur Phoenix Stellar', emoji: '🥚', tier: 'MYTHIC', weight: 1, sellPrice: 1_000, description: 'Cangkang bercahaya yang ditemukan di dekat bintang yang sekarat.' },
  { id: 'cosmic_tree_seed', name: 'Benih Pohon Kosmik', emoji: '🌱', tier: 'MYTHIC', weight: 1, sellPrice: 1_050, description: 'Benih misterius yang diduga mampu tumbuh di ruang hampa.' },
  { id: 'dark_matter_crystal', name: 'Kristal Materi Gelap', emoji: '🖤', tier: 'MYTHIC', weight: 1, sellPrice: 1_100, description: 'Kristal yang nyaris tak terlihat dan hanya terdeteksi melalui efek gravitasinya.' },
  { id: 'cosmic_string_fragment', name: 'Fragmen Tali Kosmik', emoji: '🪢', tier: 'MYTHIC', weight: 1, sellPrice: 1_150, description: 'Serpihan anomali ruang-waktu yang ditemukan di wilayah galaksi terpencil.' },
  { id: 'galaxy_heart', name: 'Jantung Galaksi', emoji: '💜', tier: 'MYTHIC', weight: 1, sellPrice: 1_200, description: 'Bola energi purba yang memancarkan cahaya menyerupai pusaran galaksi.' },
  { id: 'primordial_star_fragment', name: 'Fragmen Bintang Primordial', emoji: '🌟', tier: 'MYTHIC', weight: 1, sellPrice: 1_250, description: 'Material dari generasi bintang pertama di alam semesta.' },
  { id: 'eternal_supernova_core', name: 'Inti Supernova Abadi', emoji: '💥', tier: 'MYTHIC', weight: 1, sellPrice: 1_300, description: 'Inti energi yang tetap berdenyut setelah ledakan bintang purba.' },
  { id: 'multiverse_anchor', name: 'Jangkar Multisemesta', emoji: '⚓', tier: 'MYTHIC', weight: 1, sellPrice: 1_400, description: 'Artefak asing yang diduga menstabilkan hubungan antardimensi.' },
  { id: 'primordial_void_egg', name: 'Telur Void Purba', emoji: '🥚', tier: 'MYTHIC', weight: 1, sellPrice: 1_500, description: 'Objek hitam misterius yang ditemukan di wilayah tanpa cahaya bintang.' },
  { id: 'celestial_engine_core', name: 'Inti Mesin Celestial', emoji: '⚙️', tier: 'MYTHIC', weight: 1, sellPrice: 1_600, description: 'Mesin mini yang diduga dibuat oleh peradaban kosmik berusia miliaran tahun.' },
  { id: 'reality_fracture_shard', name: 'Pecahan Retakan Realitas', emoji: '💠', tier: 'MYTHIC', weight: 1, sellPrice: 1_700, description: 'Fragmen ruang yang memperlihatkan pemandangan dari tempat berbeda.' },
  { id: 'time_loop_crystal', name: 'Kristal Lingkar Waktu', emoji: '⌛', tier: 'MYTHIC', weight: 1, sellPrice: 1_800, description: 'Kristal yang mengulang kilatan cahaya dalam pola waktu yang sama.' },
  { id: 'cosmic_consciousness_seed', name: 'Benih Kesadaran Kosmik', emoji: '🧠', tier: 'MYTHIC', weight: 1, sellPrice: 1_900, description: 'Benih bercahaya yang bereaksi terhadap pikiran makhluk di sekitarnya.' },
  { id: 'black_hole_pearl', name: 'Mutiara Lubang Hitam', emoji: '⚫', tier: 'MYTHIC', weight: 1, sellPrice: 2_000, description: 'Bola hitam padat yang memengaruhi cahaya di dekat permukaannya.' },
  { id: 'universe_origin_relic', name: 'Relik Asal Semesta', emoji: '🌌', tier: 'MYTHIC', weight: 1, sellPrice: 2_200, description: 'Artefak misterius yang diduga berasal dari era awal pembentukan kosmos.' },
  { id: 'primordial_energy_vessel', name: 'Wadah Energi Primordial', emoji: '🏺', tier: 'MYTHIC', weight: 1, sellPrice: 2_400, description: 'Wadah kuno yang menahan energi dengan pola yang belum dipahami.' },
  { id: 'last_star_fragment', name: 'Fragmen Bintang Terakhir', emoji: '✨', tier: 'MYTHIC', weight: 1, sellPrice: 2_600, description: 'Pecahan cahaya dari bintang yang diyakini menjadi salah satu yang terakhir di wilayahnya.' },
  { id: 'cosmic_origin_matrix', name: 'Matriks Asal Kosmik', emoji: '🔷', tier: 'MYTHIC', weight: 1, sellPrice: 2_800, description: 'Struktur kristal rumit yang menyimpan pola energi antarbintang.' },
  { id: 'ancient_creator_relic', name: 'Relik Sang Pencipta', emoji: '🪐', tier: 'MYTHIC', weight: 1, sellPrice: 3_000, description: 'Benda purba yang ditemukan di planet tanpa bintang dan tanpa kehidupan.' },
  { id: 'dimension_origin_core', name: 'Inti Asal Dimensi', emoji: '🌀', tier: 'MYTHIC', weight: 1, sellPrice: 3_200, description: 'Inti anomali yang memancarkan gelombang dari ruang yang tidak dikenal.' },
  { id: 'eternal_cosmos_fragment', name: 'Fragmen Kosmos Abadi', emoji: '💎', tier: 'MYTHIC', weight: 1, sellPrice: 3_500, description: 'Kristal langka yang mempertahankan cahaya meski terpisah dari sumber energinya.' },
  { id: 'forgotten_god_essence', name: 'Esensi Dewa Bintang', emoji: '🌠', tier: 'MYTHIC', weight: 1, sellPrice: 4_000, description: 'Jejak energi makhluk kosmik yang ditemukan di orbit planet mati.' },
  { id: 'infinite_star_map', name: 'Peta Bintang Tak Berujung', emoji: '🗺️', tier: 'MYTHIC', weight: 1, sellPrice: 4_500, description: 'Peta yang terus membentuk rute baru menuju sistem bintang yang belum dikenal.' },
  { id: 'cosmic_genesis_shard', name: 'Serpihan Genesis Kosmik', emoji: '🌟', tier: 'MYTHIC', weight: 1, sellPrice: 5_000, description: 'Serpihan bercahaya yang diduga berasal dari peristiwa penciptaan sebuah dunia.' }
]

export const INTERSTELLAR_ITEM_BY_ID = new Map(
  [STELLAR_CREDIT, ...INTERSTELLAR_ITEMS].map(item => [item.id, item])
)

export function rollInterstellarItem(random = Math.random) {
  const totalWeight = INTERSTELLAR_ITEMS.reduce((sum, item) => sum + item.weight, 0)
  let roll = random() * totalWeight
  for (const item of INTERSTELLAR_ITEMS) {
    roll -= item.weight
    if (roll < 0) return item
  }
  return INTERSTELLAR_ITEMS[0]
}
