import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const resepEmoji = {
  // ========== MAKAN ==========
  // BASIC
  'roti_tawar': '🍞','mie_goreng': '🍜','sate_ikan': '🍢','salad_buah': '🥗','sup_ikan': '🍲','taco_ikan': '🌮',
  'udang_goreng': '🍤','cumi_goreng': '🦑','kepiting_rebus': '🦀','sushi': '🍣','sashimi': '🍣','lobster_bakar': '🦞',
  'tuna_panggang': '🐟','salmon_asap': '🐟','steak_hiu': '🦈','pari_bakar': '🛸','penyu_panggang': '🐢','steak_emas': '🥩',
  'diamond_cake': '🎂','sop_kraken': '🦑','sate_megalodon': '🦈','sup_leviathan': '🐉','sea_dragon_grill': '🐲',
  'hydra_stew': '🐍','kura_titan_soup': '🐢','paus_putih_steak': '🐋','naga_laut_bakar': '🐉','raja_ubur_jelly': '🪼',
  'steak_godzilla': '🦖',
  
  // ANIME + GAME
  'steak_makima': '😈','hati_pochita': '❤️','pancake_polites': '🥞','jari_sukuna': '🖐️','ramen_ichiraku': '🍜',
  'onigiri': '🍙','omurice': '🍳','taiyaki': '🐟','dango': '🍡','dorayaki': '🥞','takoyaki': '🐙','sel_bersel': '🧬',
  'rambut_all_might': '💪','cairan_tulang_belakang_titan': '🧪','chakra_fruit': '🍎','elixir_of_life': '✨',
  'sakura_mochi': '🌸','mondstadt_hash_brown': '🍟','sweet_madame': '🍗','stewed_matsutake': '🍄','jade_parcel': '🥟',
  'mora_meat': '🥩','interastral_peace': '🍰','stellar_jade_smoothie': '💎','pom_pom_parfait': '🍨','trailblaze_burger': '🍔',
  'tacetite_cake': '🟣','echo_pudding': '👻','resonant_soup': '🍲',

  // ONE PIECE DEVIL FRUIT
  'gomu_gomu_no_mi': '🍎','gura_gura_no_mi': '🌍','ope_ope_no_mi': '💚','mochi_mochi_no_mi': '🍡','hana_hana_no_mi': '🌸',
  'ito_ito_no_mi': '🕸️','sube_sube_no_mi': '🧼','nikyu_nikyu_no_mi': '🐾','doku_doku_no_mi': '☠️','soru_soru_no_mi': '👻',
  'uo_uo_no_mi': '🐉','tori_tori_no_mi': '🦅','hito_hito_no_mi': '🧍','inu_inu_no_mi': '🐶','neko_neko_no_mi': '🐱',
  'zou_zou_no_mi': '🐘','ryu_ryu_no_mi': '🦖','hebi_hebi_no_mi': '🐍','yami_yami_no_mi': '🌑','goro_goro_no_mi': '⚡',
  'mera_mera_no_mi': '🔥','magu_magu_no_mi': '🌋','hie_hie_no_mi': '🧊','pika_pika_no_mi': '✨','suna_suna_no_mi': '🏜️',
  'moku_moku_no_mi': '💨','yuki_yuki_no_mi': '❄️','gasu_gasu_no_mi': '☁️',

  // INDO + KEMERDEKAAN
  'seblak': '🌶️','tahu_telur': '🍳','nasi_uduk': '🍛','bubur_ayam': '🥣','sate_ayam': '🍢','rendang': '🥘',
  'gado_gado': '🥗','nasi_tumpeng': '🎉','sate_kambing': '🍢','ayam_goreng': '🍗','kerupuk_merdeka': '🇮🇩',

  // ========== MINUMAN ==========
  'boba_milktea': '🧋','matcha_latte': '🍵','es_jeruk': '🍊','soda_gula': '🥤','kopi_hitams': '☕','susu_stroberi': '🍓',
  'jus_durian': '🥛','wine': '🍷','es_teh_jumbo': '🧊','teh_manis': '🍵','es_teh_tawar': '🧊','es_kelapa': '🥥',
  'es_cendol': '🍧','es_dawet': '🍧','es_bubur_sum_sum': '🍮','jus_alpukat': '🥑','jus_mangga': '🥭','jus_semangka': '🍉',
  'jus_naga': '🐉','jus_stroberi': '🍓','jus_anggur': '🍇','es_coklat': '🍫','hot_chocolate': '☕','green_tea': '🍵',
  'black_tea': '🫖','red_tea': '🍷','milk_tea': '🧋','tarik_tea': '🥛','red_bull': '⚡','energy_drink': '🔋',
  'cola': '🥤','fanta': '🟠','sprite': '⚪','air_mineral': '💧','air_kelapa': '🥥','susu_coklat': '🍫',
  'susu_murni': '🥛','yogurt': '🍶','smoothie_berry': '🫐',
  
  // SOLO LEVELING + ONE PIECE + ANIME
'purified_blood_demon_king': '🩸','holy_water_life': '💧','kasaka_venom': '☠️','binks_sake': '🏴‍☠️',
'melon_soda_float': '🍈','ramune': '🍶','susu_kotak_strawberry': '🍓','oolong_tea': '🍵',
'teh_cairan_tubuh_echidna': '🧪','dr_pepper': '🥤','wisteria_poison': '☠️','super_holy_water_db': '✨',
'holy_knight_blood': '🩸','ramuan_transformasi': '🧪','earl_grey': '🫖','apple_cider': '🍎',
'healing_tears': '💧','soma': '🍶','soulglad': '🟡','ice_soulglad': '🧊','stellar_champagne': '🥂',
'soothing_soda': '🥤','rejuvenating_soda': '✨','puffergoat_milk': '🐐','odd_concoction': '🧪',
'liquid_dusk': '🌙','dream_jam': '🍯','ultimate_syrup': '🍯','practitioner_pepper': '🌶️',
'redsunset_sauce': '🌅','sweet_milk_cream': '🥛','imagined_sunrise': '🌄','prolonged_past': '⏳',
'glorious_hour': '⏰','wintry_garden': '❄️','silent_escapism': '🫧','heavenly_brew': '☁️',
'drink_another_world': '🌌','frozen_memories': '🧊','its_literal_trash': '🗑️',

// INDO
'pocari_sweat': '💧','jamu': '🥤','wedang_jahe': '☕','stmj': '🥛','kopi_luwak': '☕',
'es_susu_putih': '🥛','freshmilk': '🥛','yakult': '🍶',

// BEER
'budweiser': '🍺','heineken': '🍺','corona_extra': '🍺','guinness': '🍺','asahi_super_dry': '🍺',
'sapporo': '🍺','stella_artois': '🍺','carlsberg': '🍺','blue_moon': '🍺','hoegaarden': '🍺',
'san_miguel': '🍺','bir_bintang': '🍺','anker_beer': '🍺','bali_hai': '🍺','prost_beer': '🍺'
}

const deskripsiMakanan = {
  // ========== MAKANAN ==========
  // BASIC
  'roti_tawar': 'Roti tawar polos. Cocok buat ganjel perut sebelum berburu bos.',
  'mie_goreng': 'Mie goreng dengan bumbu rahasia. +5 semangat bertarung.',
  'sate_ikan': 'Sate tusuk isi ikan segar. Baunya bikin lapar.',
  'salad_buah': 'Campuran buah segar. Sehat dan mengenyangkan.',
  'sup_ikan': 'Sup hangat dengan potongan ikan. Menghangatkan badan.',
  'taco_ikan': 'Tortilla isi ikan dan sayur. Meksiko x Lautan.',
  'udang_goreng': 'Udang krispi garing. Dibalut tepung terbaik.',
  'cumi_goreng': 'Cumi goreng tepung. Gurih dan renyah.',
  'kepiting_rebus': 'Kepiting rebus dengan saus mentega. Dagingnya tebal.',
  'sushi': 'Sushi salmon premium. Langsung dari Jepang.',
  'sashimi': 'Irisan ikan mentah grade S. Kesegaran nomor 1.',
  'lobster_bakar': 'Lobster bakar dengan saus garlic butter. Menu sultan.',
  'tuna_panggang': 'Daging tuna panggang. Protein tinggi untuk koki.',
  'salmon_asap': 'Salmon asap khas Skandinavia. Rasanya smoky.',
  'steak_hiu': 'Steak dari daging hiu. Teksturnya unik dan kenyal.',
  'pari_bakar': 'Ikan pari bakar bumbu kecap. Pedas manis.',
  'penyu_panggang': 'Masakan langka dari daging penyu. Dagingnya lembut.',
  'steak_emas': 'Steak dilapisi emas 24k. Makanan orang kaya.',
  'diamond_cake': 'Kue yang dihias berlian. Rasanya semahal harganya.',
  'sop_kraken': 'Sup dari tentakel kraken. Rasanya... aneh tapi enak.',
  'sate_megalodon': 'Sate dari daging megalodon purba. 1 tusuk = 1 ton daging.',
  'sup_leviathan': 'Sup dari monster laut leviathan. Bisa bikin awet muda.',
  'sea_dragon_grill': 'Daging naga laut yang dipanggang. Mengandung mana.',
  'hydra_stew': 'Semur kepala hydra. 1 kepala tumbuh 2 kepala baru.',
  'kura_titan_soup': 'Sup dari kura-kura setinggi gunung. Kaldu nya kental.',
  'paus_putih_steak': 'Steak dari paus putih legendaris. Dagingnya sebesar kapal.',
  'naga_laut_bakar': 'Naga laut utuh dipanggang. Butuh 10 koki untuk masak.',
  'raja_ubur_jelly': 'Jelly dari raja ubur-ubur. Bercahaya di kegelapan.',
  'steak_godzilla': 'Steak dari daging godzilla. 1 gigitan = kenyang 1 tahun.',

  // ANIME + GAME
  'steak_makima': 'Steak daging iblis pengendali. Rasanya... bikin ketagihan dan nurut.',
  'hati_pochita': 'Hati dari iblis gergaji mesin. Memberikan kekuatan dan stamina tak terbatas.',
  'pancake_polites': 'Pancake lembut buatan Polites. Topping nya sirup maple.',
  'jari_sukuna': '1 dari 20 jari Raja Kutukan. Energi kutukan nya sangat kuat. DILARANG DIMAKAN!',
  'ramen_ichiraku': 'Ramen legendaris dari Ichiraku. Kaldu babi + chashu tebal. Favorit Naruto.',
  'onigiri': 'Bola nasi dengan isian tuna mayo. Bekal ninja yang praktis.',
  'omurice': 'Nasi goreng dibungkus telur dadar. Ditulis "I Love You" pakai saus.',
  'taiyaki': 'Kue berbentuk ikan isi kacang merah. Jajanan pasar Jepang.',
  'dango': '3 bola mochi di tusuk. Manis dan kenyal.',
  'dorayaki': 'Roti panggang isi kacang merah. Makanan favorit Doraemon.',
  'takoyaki': 'Bola-bola gurita. Ditabur bonito dan mayo.',
  'sel_bersel': 'Sel dari Saiyan. Memakan ini = potensi kekuatan naik.',
  'rambut_all_might': 'Sehelai rambut All Might. Katanya bisa transfer "One For All".',
  'cairan_tulang_belakang_titan': 'Cairan misterius dari tulang belakang Titan. Mengubah manusia jadi Titan.',
  'chakra_fruit': 'Buah dari Pohon Dewa. Memakan ini = dapat chakra tingkat dewa.',
  'elixir_of_life': 'Ramuan kehidupan. Menyembuhkan semua luka dan menambah 100 tahun umur.',
  'sakura_mochi': 'Mochi rasa bunga sakura. Lembut dan wangi.',
  'mondstadt_hash_brown': 'Hash brown renyah khas Mondstadt. Sarapan para ksatria.',
  'sweet_madame': 'Ayam panggang dengan madu. Masakan rumahan Xiangling.',
  'stewed_matsutake': 'Jamur matsutake yang disemur. Aroma hutan yang kuat.',
  'jade_parcel': 'Pangsit giok isi daging. Hidangan khas Liyue.',
  'mora_meat': 'Daging panggang dilumuri mora. Rasanya... kaya.',
  'interastral_peace': 'Kue perayaan antar galaksi. Rasanya damai.',
  'stellar_jade_smoothie': 'Smoothie dengan bubuk Stellar Jade. Bikin energi penuh.',
  'pom_pom_parfait': 'Parfait 3 lapis dari Pom-Pom. Manis dan lucu.',
  'trailblaze_burger': 'Burger ukuran raksasa untuk para Trailblazer.',
  'tacetite_cake': 'Kue dengan kristal Tacetite. Bercahaya ungu.',
  'echo_pudding': 'Puding yang bisa meniru rasa makanan lain. Aneh.',
  'resonant_soup': 'Sup yang beresonansi dengan tubuh. Menyembuhkan luka dalam.',

  // ONE PIECE - 28 DEVIL FRUIT
  'gomu_gomu_no_mi': 'Buah Karet Paramecia. Membuat tubuh pengguna lentur seperti karet. Kelemahan: Air Laut & Batu Laut.',
  'gura_gura_no_mi': 'Buah Gempa Paramecia. Mampu menciptakan getaran/gempa yang bisa menghancurkan dunia.',
  'ope_ope_no_mi': 'Buah Operasi Paramecia. Dapat menciptakan "Room" untuk teleportasi dan operasi abadi. Harga: Nyawa.',
  'mochi_mochi_no_mi': 'Buah Mochi Paramecia. Mengubah tubuh jadi mochi yang lengket dan elastis.',
  'hana_hana_no_mi': 'Buah Mekar Paramecia. Bisa menumbuhkan bagian tubuh dimana saja.',
  'ito_ito_no_mi': 'Buah Benang Paramecia. Mengendalikan benang tajam untuk memotong dan mengendalikan orang.',
  'sube_sube_no_mi': 'Buah Licin Paramecia. Membuat tubuh sehalus sutra dan memantulkan serangan.',
  'nikyu_nikyu_no_mi': 'Buah Telapak Paramecia. Bisa memantulkan rasa sakit, lelah, dan bahkan orang.',
  'doku_doku_no_mi': 'Buah Racun Paramecia. Menghasilkan racun mematikan dari tubuh.',
  'soru_soru_no_mi': 'Buah Jiwa Paramecia. Bisa memanipulasi jiwa dan umur orang lain.',
  'uo_uo_no_mi': 'Buah Ikan Model: Naga Biru Zoan Mythical. Berubah jadi naga biru yang mengendalikan cuaca.',
  'tori_tori_no_mi': 'Buah Burung Zoan. Berubah jadi berbagai jenis burung.',
  'hito_hito_no_mi': 'Buah Manusia Zoan. Hewan yang memakannya bisa berubah jadi manusia.',
  'inu_inu_no_mi': 'Buah Anjing Zoan. Berubah jadi anjing atau serigala.',
  'neko_neko_no_mi': 'Buah Kucing Zoan. Berubah jadi kucing atau macan tutul.',
  'zou_zou_no_mi': 'Buah Gajah Zoan. Berubah jadi gajah raksasa.',
  'ryu_ryu_no_mi': 'Buah Dinosaurus Zoan Kuno. Berubah jadi berbagai jenis dinosaurus.',
  'hebi_hebi_no_mi': 'Buah Ular Zoan. Berubah jadi ular berbisa atau naga.',
  'yami_yami_no_mi': 'Buah Kegelapan Logia. Bisa menyerap semua kekuatan buah iblis lain dan gravitasi.',
  'goro_goro_no_mi': 'Buah Petir Logia. Tubuh menjadi petir dan bergerak secepat kilat.',
  'mera_mera_no_mi': 'Buah Api Logia. Mengubah tubuh jadi api dan mengendalikan api.',
  'magu_magu_no_mi': 'Buah Magma Logia. Menghasilkan magma yang lebih panas dari api.',
  'hie_hie_no_mi': 'Buah Es Logia. Membekukan apapun dan mengubah tubuh jadi es.',
  'pika_pika_no_mi': 'Buah Cahaya Logia. Bergerak dan menyerang secepat cahaya.',
  'suna_suna_no_mi': 'Buah Pasir Logia. Mengubah tubuh jadi pasir dan mengendalikan gurun.',
  'moku_moku_no_mi': 'Buah Asap Logia. Tubuh menjadi asap.',
  'yuki_yuki_no_mi': 'Buah Salju Logia. Mengendalikan salju dan badai salju.',
  'gasu_gasu_no_mi': 'Buah Gas Logia. Mengubah tubuh jadi gas beracun.',

  // INDO + KEMERDEKAAN
  'seblak': 'Makanan pedas dari Bandung. Kerupuk + ceker + sosis kuah pedas.',
  'tahu_telur': 'Tahu dan telur dengan bumbu kacang pedas manis. Khas Surabaya.',
  'nasi_uduk': 'Nasi gurih dimasak dengan santan. Lauknya komplit.',
  'bubur_ayam': 'Bubur ayam hangat dengan suwiran ayam dan kerupuk.',
  'sate_ayam': 'Sate ayam bumbu kacang. 10 tusuk tidak cukup.',
  'rendang': 'Daging sapi dimasak 8 jam dengan rempah. Juara dunia.',
  'gado_gado': 'Sayur rebus dengan bumbu kacang. Sehat dan enak.',
  'nasi_tumpeng': 'Makanan wajib 17 Agustus. Melambangkan syukur, keberagaman, dan gotong royong. Puncaknya menghadap Tuhan.',
  'sate_kambing': 'Sate kambing bakar arang. Aroma asapnya khas perayaan.',
  'ayam_goreng': 'Ayam goreng kremes. Lauk sejuta umat Indonesia.',
  'kerupuk_merdeka': 'Kerupuk merah putih. Wajib ada pas lomba makan kerupuk 17an. +100 semangat nasionalisme.',

  // ========== MINUMAN ==========
  'boba_milktea': 'Teh susu dengan boba kenyal. Minuman sejuta umat.',
  'matcha_latte': 'Latte dengan bubuk matcha premium dari Kyoto.',
  'es_jeruk': 'Es jeruk segar. Pemadam haus paling ampuh.',
  'soda_gula': 'Soda manis bersoda. Meledak di mulut.',
  'kopi_hitams': 'Kopi hitam tanpa gula. Untuk begadang grind.',
  'susu_stroberi': 'Susu segar rasa stroberi. Favorit anak-anak.',
  'jus_durian': 'Jus durian kental. Baunya menyengat, rasanya nagih.',
  'wine': 'Anggur merah kelas atas. Untuk perayaan kemenangan.',
  'es_teh_jumbo': 'Es teh manis segelas jumbo. Teman setia makan.',
  'teh_manis': 'Teh manis anget. Paling enak diminum pas hujan.',
  'es_teh_tawar': 'Es teh tawar. Penetral rasa paling ampuh.',
  'es_kelapa': 'Air kelapa muda segar. Isotonik alami.',
  'es_cendol': 'Cendol santan gula merah. Manis dan seger.',
  'es_dawet': 'Dawet ayu Banjarnegara. Isinya kenyal-kenyal.',
  'es_bubur_sum_sum': 'Bubur sumsum kuah santan. Lembut di mulut.',
  'jus_alpukat': 'Jus alpukat kental + susu coklat. Menu sultan.',
  'jus_mangga': 'Jus mangga harum manis. Vitamin C tinggi.',
  'jus_semangka': 'Jus semangka merah. 90% air, seger banget.',
  'jus_naga': 'Jus buah naga. Warnanya ungu cantik.',
  'jus_stroberi': 'Jus stroberi asam manis. Favorit cewek.',
  'jus_anggur': 'Jus anggur merah. Rasanya premium.',
  'es_coklat': 'Es coklat kental. Topping keju leleh.',
  'hot_chocolate': 'Coklat panas. Penghangat di malam dingin.',
  'green_tea': 'Teh hijau tawar. Antioksidan tinggi.',
  'black_tea': 'Teh hitam klasik. Bisa panas bisa dingin.',
  'red_tea': 'Teh merah rosella. Asam seger.',
  'milk_tea': 'Teh susu biasa. Versi murah boba.',
  'tarik_tea': 'Teh tarik Malaysia. Berbusa dan creamy.',
  'red_bull': 'Energy drink. +50 stamina langsung.',
  'energy_drink': 'Minuman berenergi. Buat grind semalaman.',
  'cola': 'Cola bersoda. Meledak di tenggorokan.',
  'fanta': 'Soda rasa jeruk. Manis dan seger.',
  'sprite': 'Soda bening rasa lemon. Bikin lega.',
  'air_mineral': 'Air putih 600ml. Penyelamat saat haus.',
  'air_kelapa': 'Air kelapa ijo. Bagus buat kesehatan.',
  'susu_coklat': 'Susu rasa coklat. Favorit anak 90an.',
  'susu_murni': 'Susu sapi murni. Tinggi kalsium.',
  'yogurt': 'Yogurt plain. Baik untuk pencernaan.',
  'smoothie_berry': 'Smoothie campur berry. Asam manis segar.',
  
  'purified_blood_demon_king': 'Darah Raja Iblis yang dimurnikan. Memberikan kekuatan kegelapan sementara.',
'holy_water_life': 'Air suci dari Solo Leveling. Menyembuhkan semua luka dan racun.',
'kasaka_venom': 'Racun Kasaka. 1 tetes bisa melumpuhkan naga. HATI-HATI!',
'binks_sake': 'Sake legendaris dari bajak laut Roger. Rasanya kebebasan.',
'melon_soda_float': 'Soda melon dengan es krim float. Manis dan seger.',
'ramune': 'Soda jepang dengan kelereng. Minumnya harus "poc".',
'susu_kotak_strawberry': 'Susu kotak rasa stroberi. Nostalgia SD.',
'oolong_tea': 'Teh oolong tawar. Melancarkan pencernaan.',
'teh_cairan_tubuh_echidna': 'Teh yang diseduh dari cairan tubuh penyihir. Rasanya... pahit manis.',
'dr_pepper': 'Soda rasa 23 buah. Unik dan nagih.',
'wisteria_poison': 'Racun bunga wisteria. Satu-satunya yang bisa melukai iblis.',
'super_holy_water_db': 'Air suci Super Dragonball. Bisa menghidupkan kembali.',
'holy_knight_blood': 'Darah kesatria suci. Memberikan buff pertahanan.',
'ramuan_transformasi': 'Minum ini bisa berubah jadi bentuk lain selama 1 jam.',
'earl_grey': 'Teh hitam Earl Grey klasik. Wangi bergamot.',
'apple_cider': 'Sari apel fermentasi. Manis asam segar.',
'healing_tears': 'Air mata malaikat. Menyembuhkan luka batin dan fisik.',
'soma': 'Minuman para dewa Nordik. Memberikan kebijaksanaan.',
'soulglad': 'Minuman kuning dari HSR. Rasanya seperti harapan.',
'ice_soulglad': 'SoulGlad versi dingin. +10 mood.',
'stellar_champagne': 'Champagne antar bintang. Untuk merayakan kemenangan.',
'soothing_soda': 'Soda penenang. Menurunkan stres 50%.',
'rejuvenating_soda': 'Soda peremajaan. Mengembalikan stamina penuh.',
'puffergoat_milk': 'Susu kambing duri dari Teyvat. Rasanya... aneh.',
'odd_concoction': 'Ramuan aneh. Efeknya random tiap minum.',
'liquid_dusk': 'Cairan senja. Rasanya seperti melihat sunset.',
'dream_jam': 'Selai mimpi. Manis dan bikin ngantuk.',
'ultimate_syrup': 'Sirup pamungkas. Bisa dicampur ke minuman apapun.',
'practitioner_pepper': 'Lada praktisi. Pedasnya nembus jiwa.',
'redsunset_sauce': 'Saus rasa sunset merah. Asam manis.',
'sweet_milk_cream': 'Krim susu manis. Topping terbaik.',
'imagined_sunrise': 'Rasanya seperti matahari terbit pertama kali.',
'prolonged_past': 'Minuman yang rasanya seperti nostalgia.',
'glorious_hour': '1 jam terasa seperti paling mulia saat meminum ini.',
'wintry_garden': 'Rasa taman musim dingin. Dingin dan segar.',
'silent_escapism': 'Minuman untuk melarikan diri dari kebisingan.',
'heavenly_brew': 'Seduhan surga. Rasanya damai.',
'drink_another_world': 'Minuman dari dunia lain. Rasanya tidak bisa dijelaskan.',
'frozen_memories': 'Es yang membekukan kenangan. Dingin tapi hangat.',
'its_literal_trash': 'Ini beneran sampah cair. Jangan diminum... tapi laku.',

'pocari_sweat': 'Minuman isotonik. Pengganti ion tubuh setelah bertarung.',
'jamu': 'Jamu tradisional. Pahit tapi menyehatkan.',
'wedang_jahe': 'Wedang jahe hangat. Menghangatkan badan saat hujan.',
'stmj': 'Susu Telur Madu Jahe. +20 stamina langsung.',
'kopi_luwak': 'Kopi paling mahal di dunia. Rasanya... tai luwak.',
'es_susu_putih': 'Es susu putih murni. Creamy banget.',
'freshmilk': 'Susu segar langsung dari peternakan.',
'yakult': 'Minuman probiotik kecil. Baik untuk pencernaan.',

'budweiser': 'Bir Amerika klasik. Ringan dan gampang diminum.',
'heineken': 'Bir Belanda premium. Botol hijaunya ikonik.',
'corona_extra': 'Bir Meksiko. Paling enak + jeruk nipis.',
'guinness': 'Stout hitam dari Irlandia. Rasanya pahit creamy.',
'asahi_super_dry': 'Bir Jepang kering. Teman setia ramen.',
'sapporo': 'Bir Jepang klasik. Busanya tebal.',
'stella_artois': 'Bir Belgia. Rasanya elegan.',
'carlsberg': 'Bir Denmark. "Probably the best beer in the world".',
'blue_moon': 'Bir gandum Belgia. Ada rasa jeruknya.',
'hoegaarden': 'Bir putih Belgia. Seger dan fruity.',
'san_miguel': 'Bir Filipina. Kuat dan murah.',
'bir_bintang': 'Bir kebanggaan Indonesia. Paling laku.',
'anker_beer': 'Bir Indonesia lawas. Rasanya klasik.',
'bali_hai': 'Bir Bali. Ringan cocok buat pantai.',
'prost_beer': 'Bir lokal Indonesia. Banyak variannya.'
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}
  if(!user.paketKonfirmasi) user.paketKonfirmasi = {}

  // MIGRASI
  let isChanged = false
  let masakanBaru = {}
  for(let nama in user.masakan){
    let keyBaru = nama.replace(/ /g, '_')
    if(user.masakan[nama] > 0){
      masakanBaru[keyBaru] = (masakanBaru[keyBaru] || 0) + user.masakan[nama]
      if(keyBaru!== nama) isChanged = true
    }
  }
  if(isChanged){ user.masakan = masakanBaru; saveDB(wdb) }

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1
  const buyDiskon = isPrem? 0.8 : 1

// RESEP LAMA + BARU + DEVIL FRUIT + 17AN
  const hargaBeliMakanan = {
   // BASIC
    'roti_tawar': { emoji: '🍞', harga: 12000 }, 'mie_goreng': { emoji: '🍜', harga: 27000 }, 'sate_ikan': { emoji: '🍢', harga: 52500 },
    'salad_buah': { emoji: '🥗', harga: 60000 }, 'sup_ikan': { emoji: '🍲', harga: 60000 }, 'taco_ikan': { emoji: '🌮', harga: 67500 },
    'udang_goreng': { emoji: '🍤', harga: 135000 }, 'cumi_goreng': { emoji: '🦑', harga: 165000 }, 'kepiting_rebus': { emoji: '🦀', harga: 180000 },
    'sushi': { emoji: '🍣', harga: 600000 }, 'sashimi': { emoji: '🍣', harga: 750000 }, 'lobster_bakar': { emoji: '🦞', harga: 900000 },
    'tuna_panggang': { emoji: '🐟', harga: 900000 }, 'salmon_asap': { emoji: '🐟', harga: 900000 }, 'steak_hiu': { emoji: '🦈', harga: 1350000 },
    'pari_bakar': { emoji: '🛸', harga: 1500000 }, 'penyu_panggang': { emoji: '🐢', harga: 1800000 }, 'steak_emas': { emoji: '🥩', harga: 2250000 },
    'diamond_cake': { emoji: '🎂', harga: 4500000 }, 'sop_kraken': { emoji: '🦑', harga: 3000000 }, 'sate_megalodon': { emoji: '🦈', harga: 3750000 },
    'sup_leviathan': { emoji: '🐉', harga: 4500000 }, 'sea_dragon_grill': { emoji: '🐲', harga: 5250000 }, 'hydra_stew': { emoji: '🐍', harga: 6750000 },
    'kura_titan_soup': { emoji: '🐢', harga: 7500000 }, 'paus_putih_steak': { emoji: '🐋', harga: 9000000 }, 'naga_laut_bakar': { emoji: '🐉', harga: 12000000 },
    'raja_ubur_jelly': { emoji: '🪼', harga: 13500000 }, 'steak_godzilla': { emoji: '🦖', harga: 22500000 },

    // ANIME + GAME
    'ramen_ichiraku': { emoji: '🍜', harga: 50000 }, 'onigiri': { emoji: '🍙', harga: 25000 }, 'steak_makima': { emoji: '😈', harga: 5000000 },
    'hati_pochita': { emoji: '❤️', harga: 7500000 }, 'jari_sukuna': { emoji: '🖐️', harga: 10000000 }, 'elixir_of_life': { emoji: '✨', harga: 200000 },
    'sakura_mochi': { emoji: '🌸', harga: 100000 }, 'interastral_peace': { emoji: '🍰', harga: 250000 },

    // INDO
    'seblak': { emoji: '🌶️', harga: 20000 }, 'nasi_uduk': { emoji: '🍛', harga: 25000 }, 'rendang': { emoji: '🥘', harga: 50000 },
    'nasi_tumpeng': { emoji: '🎉', harga: 100000 }, 'sate_kambing': { emoji: '🍢', harga: 60000 }, 'ayam_goreng': { emoji: '🍗', harga: 35000 },
    'kerupuk_merdeka': { emoji: '🇮🇩', harga: 5000 },

// 28 DEVIL FRUIT - TIER HARGA
    // TIER 1: LOGIA - PALING MAHAL & LANGKA
    'yami_yami_no_mi': { emoji: '🌑', harga: 999999999 }, // Kegelapan - Bisa hapus DF lain
    'magu_magu_no_mi': { emoji: '🌋', harga: 850000000 }, // Magma - Serangan tertinggi
    'pika_pika_no_mi': { emoji: '✨', harga: 800000000 }, // Cahaya - Kecepatan cahaya
    'goro_goro_no_mi': { emoji: '⚡', harga: 750000000 }, // Petir - Logia terkuat setelah Yami/Magu
    'hie_hie_no_mi': { emoji: '🧊', harga: 700000000 }, // Es - Admiral level
    'mera_mera_no_mi': { emoji: '🔥', harga: 650000000 }, // Api - Populer
    'suna_suna_no_mi': { emoji: '🏜️', harga: 500000000 }, // Pasir - Crocodile
    'moku_moku_no_mi': { emoji: '💨', harga: 450000000 }, // Asap - Smoker
    'yuki_yuki_no_mi': { emoji: '❄️', harga: 400000000 }, // Salju - Monet
    'gasu_gasu_no_mi': { emoji: '☁️', harga: 380000000 }, // Gas - Caesar

    // TIER 2: MYTHICAL ZOAN
    'uo_uo_no_mi': { emoji: '🐉', harga: 600000000 }, // Naga Kaido

    // TIER 3: ANCIENT ZOAN
    'ryu_ryu_no_mi': { emoji: '🦖', harga: 250000000 }, // Dinosaurus - Semua model

    // TIER 4: PARAMECIA KUAT / HAKSUS
    'ope_ope_no_mi': { emoji: '💚', harga: 500000000 }, // Operasi - Bisa awet muda
    'gura_gura_no_mi': { emoji: '🌍', harga: 480000000 }, // Gempa - Bisa hancurkan dunia
    'soru_soru_no_mi': { emoji: '👻', harga: 350000000 }, // Jiwa - Big Mom
    'ito_ito_no_mi': { emoji: '🕸️', harga: 300000000 }, // Benang - Doflamingo
    'doku_doku_no_mi': { emoji: '☠️', harga: 280000000 }, // Racun - Magellan

    // TIER 5: PARAMECIA SEDANG
    'nikyu_nikyu_no_mi': { emoji: '🐾', harga: 200000000 }, // Telapak - Kuma
    'mochi_mochi_no_mi': { emoji: '🍡', harga: 180000000 }, // Mochi - Katakuri
    'gomu_gomu_no_mi': { emoji: '🍎', harga: 150000000 }, // Karet - Luffy, tapi populer
    'hana_hana_no_mi': { emoji: '🌸', harga: 120000000 }, // Mekar - Robin

    // TIER 6: PARAMECIA BIASA / TROLL
    'sube_sube_no_mi': { emoji: '🧼', harga: 80000000 }, // Licin - Alvida
    'hebi_hebi_no_mi': { emoji: '🐍', harga: 70000000 }, // Ular - Hancock

    // TIER 7: ZOAN BIASA
    'zou_zou_no_mi': { emoji: '🐘', harga: 60000000 }, // Gajah - Funkfreed
    'tori_tori_no_mi': { emoji: '🦅', harga: 50000000 }, // Burung - Semua model
    'inu_inu_no_mi': { emoji: '🐶', harga: 45000000 }, // Anjing - Semua model
    'neko_neko_no_mi': { emoji: '🐱', harga: 45000000 }, // Kucing - Semua model
    'hito_hito_no_mi': { emoji: '🧍', harga: 40000000 }
  }

  const hargaBeliMinuman = {
   // MINUMAN LAMA
   'boba_milktea': { emoji: '🧋', harga: 25000 }, 'matcha_latte': { emoji: '🍵', harga: 35000 }, 'es_jeruk': { emoji: '🍊', harga: 15000 },
   'soda_gula': { emoji: '🥤', harga: 20000 }, 'kopi_hitams': { emoji: '☕', harga: 18000 }, 'susu_stroberi': { emoji: '🍓', harga: 30000 },
   'jus_durian': { emoji: '🥛', harga: 150000 }, 'wine': { emoji: '🍷', harga: 180000 }, 'es_teh_jumbo': { emoji: '🧊', harga: 10000 },

   // TAMBAHAN 30 MINUMAN BARU
    'teh_manis': { emoji: '🍵', harga: 8000 }, 'es_teh_tawar': { emoji: '🧊', harga: 5000 }, 'es_kelapa': { emoji: '🥥', harga: 15000 },
    'es_cendol': { emoji: '🍧', harga: 12000 }, 'es_dawet': { emoji: '🍧', harga: 12000 }, 'es_bubur_sum_sum': { emoji: '🍮', harga: 10000 },
    'jus_alpukat': { emoji: '🥑', harga: 18000 }, 'jus_mangga': { emoji: '🥭', harga: 15000 }, 'jus_semangka': { emoji: '🍉', harga: 12000 },
    'jus_naga': { emoji: '🐉', harga: 20000 }, 'jus_stroberi': { emoji: '🍓', harga: 17000 }, 'jus_anggur': { emoji: '🍇', harga: 17000 },
    'es_coklat': { emoji: '🍫', harga: 16000 }, 'hot_chocolate': { emoji: '☕', harga: 20000 }, 'green_tea': { emoji: '🍵', harga: 15000 },
    'black_tea': { emoji: '🫖', harga: 12000 }, 'red_tea': { emoji: '🍷', harga: 25000 }, 'milk_tea': { emoji: '🧋', harga: 22000 },
    'tarik_tea': { emoji: '🥛', harga: 14000 }, 'red_bull': { emoji: '⚡', harga: 25000 }, 'energy_drink': { emoji: '🔋', harga: 20000 },
    'cola': { emoji: '🥤', harga: 10000 }, 'fanta': { emoji: '🟠', harga: 10000 }, 'sprite': { emoji: '⚪', harga: 10000 },
    'air_mineral': { emoji: '💧', harga: 3000 }, 'air_kelapa': { emoji: '🥥', harga: 12000 }, 'susu_coklat': { emoji: '🍫', harga: 15000 },
    'susu_murni': { emoji: '🥛', harga: 13000 }, 'yogurt': { emoji: '🍶', harga: 18000 }, 'smoothie_berry': { emoji: '🫐', harga: 23000 },
    
    // ANIME + GAME + FANTASY
'purified_blood_demon_king': { emoji: '🩸', harga: 250000 }, 'holy_water_life': { emoji: '💧', harga: 500000 },
'kasaka_venom': { emoji: '☠️', harga: 100000 }, 'binks_sake': { emoji: '🏴‍☠️', harga: 300000 },
'melon_soda_float': { emoji: '🍈', harga: 22000 }, 'ramune': { emoji: '🍶', harga: 18000 },
'susu_kotak_strawberry': { emoji: '🍓', harga: 7000 }, 'oolong_tea': { emoji: '🍵', harga: 12000 },
'teh_cairan_tubuh_echidna': { emoji: '🧪', harga: 150000 }, 'dr_pepper': { emoji: '🥤', harga: 13000 },
'wisteria_poison': { emoji: '☠️', harga: 200000 }, 'super_holy_water_db': { emoji: '✨', harga: 1000000 },
'holy_knight_blood': { emoji: '🩸', harga: 180000 }, 'ramuan_transformasi': { emoji: '🧪', harga: 350000 },
'earl_grey': { emoji: '🫖', harga: 20000 }, 'apple_cider': { emoji: '🍎', harga: 25000 },
'healing_tears': { emoji: '💧', harga: 400000 }, 'soma': { emoji: '🍶', harga: 600000 },
'soulglad': { emoji: '🟡', harga: 15000 }, 'ice_soulglad': { emoji: '🧊', harga: 17000 },
'stellar_champagne': { emoji: '🥂', harga: 800000 }, 'soothing_soda': { emoji: '🥤', harga: 20000 },
'rejuvenating_soda': { emoji: '✨', harga: 50000 }, 'puffergoat_milk': { emoji: '🐐', harga: 30000 },
'odd_concoction': { emoji: '🧪', harga: 100000 }, 'liquid_dusk': { emoji: '🌙', harga: 120000 },
'dream_jam': { emoji: '🍯', harga: 90000 }, 'ultimate_syrup': { emoji: '🍯', harga: 150000 },
'practitioner_pepper': { emoji: '🌶️', harga: 25000 }, 'redsunset_sauce': { emoji: '🌅', harga: 40000 },
'sweet_milk_cream': { emoji: '🥛', harga: 35000 }, 'imagined_sunrise': { emoji: '🌄', harga: 200000 },
'prolonged_past': { emoji: '⏳', harga: 180000 }, 'glorious_hour': { emoji: '⏰', harga: 220000 },
'wintry_garden': { emoji: '❄️', harga: 160000 }, 'silent_escapism': { emoji: '🫧', harga: 140000 },
'heavenly_brew': { emoji: '☁️', harga: 300000 }, 'drink_another_world': { emoji: '🌌', harga: 500000 },
'frozen_memories': { emoji: '🧊', harga: 170000 }, 'its_literal_trash': { emoji: '🗑️', harga: 100 },

// INDO
'pocari_sweat': { emoji: '💧', harga: 10000 }, 'jamu': { emoji: '🥤', harga: 8000 },
'wedang_jahe': { emoji: '☕', harga: 10000 }, 'stmj': { emoji: '🥛', harga: 18000 },
'kopi_luwak': { emoji: '☕', harga: 100000 }, 'es_susu_putih': { emoji: '🥛', harga: 15000 },
'freshmilk': { emoji: '🥛', harga: 20000 }, 'yakult': { emoji: '🍶', harga: 5000 },

// BEER
'budweiser': { emoji: '🍺', harga: 35000 }, 'heineken': { emoji: '🍺', harga: 40000 },
'corona_extra': { emoji: '🍺', harga: 45000 }, 'guinness': { emoji: '🍺', harga: 50000 },
'asahi_super_dry': { emoji: '🍺', harga: 42000 }, 'sapporo': { emoji: '🍺', harga: 40000 },
'stella_artois': { emoji: '🍺', harga: 55000 }, 'carlsberg': { emoji: '🍺', harga: 38000 },
'blue_moon': { emoji: '🍺', harga: 60000 }, 'hoegaarden': { emoji: '🍺', harga: 65000 },
'san_miguel': { emoji: '🍺', harga: 30000 }, 'bir_bintang': { emoji: '🍺', harga: 25000 },
'anker_beer': { emoji: '🍺', harga: 20000 }, 'bali_hai': { emoji: '🍺', harga: 22000 },
'prost_beer': { emoji: '🍺', harga: 28000 }
  }

  const hargaBeli = {...hargaBeliMakanan,...hargaBeliMinuman} // GABUNG PAKE SPREAD
  const hargaJual = {}
  for(let k in hargaBeli){ hargaJual[k] = Math.floor(hargaBeli[k].harga * 0.7) }

// 25 PAKET - SEMUA MENU MASUK
  const paket = {
    'gratis': { nama: 'Paket Gratis', diskon: 1, isi: { 'roti_tawar': 3, 'kerupuk_merdeka': 10, 'es_teh_jumbo': 3 } },
    
    'anak': { nama: 'Paket Anak', diskon: 0.25, isi: { 'roti_tawar': 5, 'susu_stroberi': 3, 'diamond_cake': 1, 'taiyaki': 2, 'dango': 3, 'dorayaki': 2 } },
    'pemula': { nama: 'Paket Pemula', diskon: 0.15, isi: { 'roti_tawar': 10, 'mie_goreng': 5, 'seblak': 3, 'boba_milktea': 3, 'onigiri': 5, 'es_jeruk': 5 } },
    'hemat': { nama: 'Paket Hemat', diskon: 0.12, isi: { 'nasi_uduk': 5, 'bubur_ayam': 5, 'tahu_telur': 5, 'ayam_goreng': 3, 'gado_gado': 3 } },

    'merdeka': { nama: 'Paket Kemerdekaan', diskon: 0.17, isi: { 'nasi_tumpeng': 1, 'sate_kambing': 3, 'ayam_goreng': 3, 'rendang': 2, 'kerupuk_merdeka': 20, 'es_teh_jumbo': 10, 'sate_ayam': 5 } },
    'indo': { nama: 'Paket Nusantara', diskon: 0.15, isi: { 'rendang': 3, 'sate_ayam': 5, 'gado_gado': 3, 'es_jeruk': 5, 'seblak': 3, 'tahu_telur': 3 } },

    'jepang': { nama: 'Paket Jepang', diskon: 0.08, isi: { 'ramen_ichiraku': 5, 'onigiri': 10, 'dango': 10, 'matcha_latte': 5, 'sushi': 3, 'sashimi': 2, 'takoyaki': 5, 'dorayaki': 3 } },
    'anime': { nama: 'Paket Anime Lover', diskon: 0.12, isi: { 'steak_makima': 1, 'pancake_polites': 2, 'jari_sukuna': 1, 'omurice': 3, 'hati_pochita': 1, 'ramen_ichiraku': 3 } },
    'shonen': { nama: 'Paket Shonen OP', diskon: 0.07, isi: { 'rambut_all_might': 1, 'chakra_fruit': 3, 'cairan_tulang_belakang_titan': 1, 'sel_bersel': 1, 'elixir_of_life': 2 } },

    'genshin': { nama: 'Paket Genshin', diskon: 0.10, isi: { 'sakura_mochi': 5, 'jade_parcel': 5, 'sweet_madame': 3, 'mora_meat': 2, 'stewed_matsutake': 3, 'mondstadt_hash_brown': 3 } },
    'hsr': { nama: 'Paket Honkai Star Rail', diskon: 0.10, isi: { 'interastral_peace': 3, 'stellar_jade_smoothie': 3, 'trailblaze_burger': 3, 'pom_pom_parfait': 2, 'soulglad': 5, 'ice_soulglad': 3 } },
    'wuwa': { nama: 'Paket Wuthering Waves', diskon: 0.10, isi: { 'tacetite_cake': 3, 'echo_pudding': 3, 'resonant_soup': 2 } },

    'seafood': { nama: 'Paket Seafood', diskon: 0.10, isi: { 'sushi': 5, 'takoyaki': 10, 'sate_ikan': 5, 'kepiting_rebus': 3, 'udang_goreng': 5, 'cumi_goreng': 3, 'lobster_bakar': 2, 'tuna_panggang': 2, 'salmon_asap': 2 } },
    'monster': { nama: 'Paket Monster Laut', diskon: 0.06, isi: { 'sop_kraken': 2, 'sate_megalodon': 2, 'sup_leviathan': 1, 'sea_dragon_grill': 1, 'hydra_stew': 1, 'kura_titan_soup': 1, 'paus_putih_steak': 1, 'naga_laut_bakar': 1, 'raja_ubur_jelly': 1, 'steak_godzilla': 1, 'steak_hiu': 2, 'pari_bakar': 2, 'penyu_panggang': 1 } },

    'paramecia': { nama: 'Paket Paramecia', diskon: 0.08, isi: { 'gomu_gomu_no_mi': 1, 'gura_gura_no_mi': 1, 'ope_ope_no_mi': 1, 'mochi_mochi_no_mi': 1, 'hana_hana_no_mi': 1, 'ito_ito_no_mi': 1, 'sube_sube_no_mi': 1, 'nikyu_nikyu_no_mi': 1, 'doku_doku_no_mi': 1, 'soru_soru_no_mi': 1 } },
    'zoan': { nama: 'Paket Zoan', diskon: 0.08, isi: { 'uo_uo_no_mi': 1, 'tori_tori_no_mi': 1, 'hito_hito_no_mi': 1, 'inu_inu_no_mi': 1, 'neko_neko_no_mi': 1, 'zou_zou_no_mi': 1, 'ryu_ryu_no_mi': 1, 'hebi_hebi_no_mi': 1 } },
    'logia': { nama: 'Paket Logia', diskon: 0.06, isi: { 'yami_yami_no_mi': 1, 'goro_goro_no_mi': 1, 'mera_mera_no_mi': 1, 'magu_magu_no_mi': 1, 'hie_hie_no_mi': 1, 'pika_pika_no_mi': 1, 'suna_suna_no_mi': 1, 'moku_moku_no_mi': 1, 'yuki_yuki_no_mi': 1, 'gasu_gasu_no_mi': 1 } },
    'devil_fruit': { nama: 'Paket Buah Iblis Langka', diskon: 0.05, isi: { 'gomu_gomu_no_mi': 1, 'mera_mera_no_mi': 1, 'ope_ope_no_mi': 1, 'yami_yami_no_mi': 1, 'gura_gura_no_mi': 1, 'magu_magu_no_mi': 1 } },

    // INI PAKET BARU UDAH GW UPDATE + BUFF
    'minuman': { nama: 'Paket Minuman Lengkap', diskon: 0.18, isi: { 
        'boba_milktea': 5, 'matcha_latte': 3, 'es_jeruk': 5, 'soda_gula': 3, 'kopi_hitams': 3, 'susu_stroberi': 3, 'jus_durian': 2,
        'teh_manis': 5, 'es_teh_tawar': 5, 'es_kelapa': 3, 'es_cendol': 3, 'es_dawet': 3, 'es_bubur_sum_sum': 2,
        'jus_alpukat': 2, 'jus_mangga': 2, 'jus_semangka': 2, 'jus_naga': 2, 'jus_stroberi': 2, 'jus_anggur': 2,
        'es_coklat': 2, 'hot_chocolate': 2, 'green_tea': 2, 'black_tea': 2, 'red_tea': 2, 'milk_tea': 2, 'tarik_tea': 2,
        'red_bull': 3, 'energy_drink': 3, 'cola': 3, 'fanta': 3, 'sprite': 3, 'air_mineral': 10, 'air_kelapa': 3,
        'susu_coklat': 3, 'susu_murni': 3, 'yogurt': 2, 'smoothie_berry': 2,
        // TAMBAHAN BARU
        'melon_soda_float': 3, 'ramune': 3, 'susu_kotak_strawberry': 5, 'oolong_tea': 3, 'earl_grey': 2, 'apple_cider': 2,
        'pocari_sweat': 5, 'jamu': 3, 'wedang_jahe': 3, 'stmj': 2, 'es_susu_putih': 3, 'freshmilk': 3, 'yakult': 5,
        'soulglad': 3, 'ice_soulglad': 3
    } },
    'sultan': { nama: 'Paket Sultan', diskon: 0.05, isi: { 'steak_emas': 5, 'diamond_cake': 3, 'steak_godzilla': 2, 'paus_putih_steak': 2, 'naga_laut_bakar': 2, 'lobster_bakar': 5 } }, // buff + hapus item yg ke-block
    'event_halloween': { nama: 'Paket Halloween', diskon: 0.25, isi: { 'jari_sukuna': 5, 'hati_pochita': 3, 'doku_doku_no_mi': 2, 'soru_soru_no_mi': 2 } }, // buff

    'super_borong': { nama: 'Paket Super Borong', diskon: 0.22, isi: Object.fromEntries(Object.keys(hargaBeli).map(k => [k, 2])) }
}

  // PISAH NOMOR MENU MAKAN + MINUMAN
  const makananKeys = Object.keys(hargaBeliMakanan).sort((a, b) => hargaBeliMakanan[a].harga - hargaBeliMakanan[b].harga)
  const minumanKeys = Object.keys(hargaBeliMinuman).sort((a, b) => hargaBeliMinuman[a].harga - hargaBeliMinuman[b].harga)
  const beliKeys = [...makananKeys,...minumanKeys]
  const nomorKeItemBeli = {}
  beliKeys.forEach((k, i) => nomorKeItemBeli[i+1] = k)

  let args = text? text.toLowerCase().split(' ').filter(v => v) : []
  let tipe = args[0] // <-- TAMBAHIN INI

  // MENU UTAMA
  if (!text) {
    let cap = `┌───❏「 🍽️ RESTORAN ZETA 」❏\n`
    cap += `│ Makanan: ${makananKeys.length} | Minuman: ${minumanKeys.length}\n` // <-- GANTI INI
    cap += `│ Total Paket: ${Object.keys(paket).length}\n` // <-- TAMBAH INI BIAR PAKET TETEP MUNCUL
    cap += `└───────────────────\n\n📌 *COMMAND:*\n`
    cap += `├ *${usedPrefix}restoran menu* → Lihat semua menu\n`
    cap += `├ *${usedPrefix}restoran info <no/nama>* → Detail makanan\n`
    cap += `├ *${usedPrefix}restoran paket list* → Lihat paket\n`
    cap += `└ *${usedPrefix}restoran beli <no>* → Beli\n`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  // INFO DETAIL MAKAN
  if (tipe === 'info') {
    let itemInput = args[1]
    if(!itemInput) return m.reply(`❌ Contoh: *${usedPrefix}restoran info 45*`)
    let item =!isNaN(itemInput)? nomorKeItemBeli[parseInt(itemInput)] : itemInput.replace(/ /g, '_')
    if(!hargaBeli[item]) return m.reply('❌ Menu tidak ada.')
    let hBeli = Math.floor(hargaBeli[item].harga * buyDiskon)
    let hJual = Math.floor(hargaJual[item] * sellBonus)
    let desc = deskripsiMakanan[item] || `Makanan lezat dari Restoran Zeta. Bisa dijual ke restoran.`
    let cap = `┌───❏「 📖 DETAIL MENU 」❏\n`
    cap += `│ ${hargaBeli[item].emoji} *${formatNama(item)}*\n`
    cap += `│ Harga Beli : Rp ${hBeli.toLocaleString()}\n`
    cap += `│ Harga Jual : Rp ${hJual.toLocaleString()}\n`
    cap += `└───────────────────\n\n📝 *Deskripsi:*\n${desc}`
    return m.reply(cap)
  }

// MENU SEMUA
  if (tipe === 'menu') {
    let cap = `┌───❏「 📋 DAFTAR MENU ${beliKeys.length} 」❏\n`
    cap += `│ Cara cek detail: *${usedPrefix}restoran info <no/nama>*\n`
    cap += `└───────────────────\n\n🍖 *MAKANAN ${makananKeys.length}*\n`

    makananKeys.forEach((k, i) => {
      let hBeli = Math.floor(hargaBeli[k].harga * buyDiskon)
      cap += `│ [${i+1}] ${hargaBeli[k].emoji} ${formatNama(k).padEnd(22)} Rp ${hBeli.toLocaleString()}\n`
    })

    cap += `└───────────────────\n\n🥤 *MINUMAN ${minumanKeys.length}*\n`
    minumanKeys.forEach((k, i) => {
      let hBeli = Math.floor(hargaBeli[k].harga * buyDiskon)
      let no = makananKeys.length + i + 1
      cap += `│ [${no}] ${hargaBeli[k].emoji} ${formatNama(k).padEnd(22)} Rp ${hBeli.toLocaleString()}\n`
    })
    cap += `└───────────────────`
    return m.reply(cap)
  }

  // LIST PAKET
  if(tipe === 'paket' && args[1] === 'list'){
    let cap = `┌───❏「 🎁 DAFTAR ${Object.keys(paket).length} PAKET 」❏\n`
    for(let p in paket){
      let dataPaket = paket[p]
      let totalNormal = 0
      for(let item in dataPaket.isi){ totalNormal += hargaBeli[item].harga * dataPaket.isi[item] }
      let hargaPaket = Math.floor(totalNormal * (1 - dataPaket.diskon) * buyDiskon)
      let hemat = totalNormal - hargaPaket
      cap += `│\n│ 🎁 *${dataPaket.nama}* [${p}]\n`
      cap += `│ 💰 Rp ${hargaPaket.toLocaleString()} | Hemat Rp ${hemat.toLocaleString()}\n`
    }
    cap += `└───────────────────`
    return m.reply(cap)
  }

  // KONFIRMASI PAKET
  if(tipe === 'paket'){
    let namaPaket = args[1]
    if(args[1] === 'ya'){
      let dataKonfirmasi = user.paketKonfirmasi[m.sender]
      if(!dataKonfirmasi) return m.reply('❌ Tidak ada paket yang menunggu konfirmasi.')
      let dataPaket = paket[dataKonfirmasi.paket]
      if((wdb.money[m.sender] || 0) < dataKonfirmasi.harga) return m.reply(`❌ Uang tidak cukup!`)
      wdb.money[m.sender] -= dataKonfirmasi.harga
      let listDapat = []
      for(let item in dataPaket.isi){
        let jumlah = dataPaket.isi[item]
        user.masakan[item] = (user.masakan[item] || 0) + jumlah
        listDapat.push(`${resepEmoji[item]} ${formatNama(item)} x${jumlah}`)
      }
      delete user.paketKonfirmasi[m.sender]; saveDB(wdb)
      let cap = `┌───❏「 🛍️ TRANSAKSI SUKSES 」❏\n│ Paket : ${dataPaket.nama}\n│ Bayar : -Rp ${dataKonfirmasi.harga.toLocaleString()}\n└───────────────────\n\n📦 *${listDapat.length} Item:*\n${listDapat.slice(0,10).join('\n')}\n\nSelamat menikmati! 😋\n💵 Sisa: Rp ${wdb.money[m.sender].toLocaleString()}`
      return m.reply(cap)
    }
    if(!namaPaket ||!paket[namaPaket]) return m.reply(`❌ Paket tidak ada.\nLihat: *${usedPrefix}restoran paket list*`)
    let dataPaket = paket[namaPaket]
    let totalNormal = 0
    for(let item in dataPaket.isi){ totalNormal += hargaBeli[item].harga * dataPaket.isi[item] }
    let hargaPaket = Math.floor(totalNormal * (1 - dataPaket.diskon) * buyDiskon)
    let hemat = totalNormal - hargaPaket
    user.paketKonfirmasi[m.sender] = { paket: namaPaket, harga: hargaPaket }; saveDB(wdb)
    let listIsi = []
    for(let item in dataPaket.isi){ listIsi.push(`${resepEmoji[item]} ${formatNama(item)} x${dataPaket.isi[item]}`) }
    let cap = `┌───❏「 🎁 DETAIL PAKET 」❏\n│ Nama : ${dataPaket.nama}\n│ Harga Normal : Rp ${totalNormal.toLocaleString()}\n│ Harga Paket : Rp ${hargaPaket.toLocaleString()}\n│ Hemat : Rp ${hemat.toLocaleString()} ✨\n└───────────────────\n\n📦 *Isi Paket:*\n${listIsi.join('\n')}\n\n⚠️ INPO: Lebih murah Rp ${hemat.toLocaleString()}!\n\nKetik *${usedPrefix}restoran paket ya* untuk beli`
    return m.reply(cap)
  }

  // SISTEM BELI
  if(tipe === 'beli'){
    let itemInput = args[1]
    let jumlah = parseInt(args[2]) || 1
    if(!itemInput) return m.reply(`❌ Contoh: *${usedPrefix}restoran beli 1 10*`)
    let item =!isNaN(itemInput)? nomorKeItemBeli[parseInt(itemInput)] : itemInput.replace(/ /g, '_')
    if(!hargaBeli[item]) return m.reply('❌ Menu tidak ada.')
    let hargaSatuan = Math.floor(hargaBeli[item].harga * buyDiskon)
    let totalHarga = hargaSatuan * jumlah
    if((wdb.money[m.sender] || 0) < totalHarga) return m.reply(`❌ Uang tidak cukup! Butuh: Rp ${totalHarga.toLocaleString()}`)
    wdb.money[m.sender] -= totalHarga
    user.masakan[item] = (user.masakan[item] || 0) + jumlah
    saveDB(wdb)
    let cap = `┌───❏「 🛍️ TRANSAKSI SUKSES 」❏\n│ Item : ${hargaBeli[item].emoji} ${formatNama(item)}\n│ Jumlah : ${jumlah}\n│ Bayar : -Rp ${totalHarga.toLocaleString()}\n└───────────────────\n\nSilakan dinikmati! 😋\n💵 Sisa: Rp ${wdb.money[m.sender].toLocaleString()}`
    return m.reply(cap)
  }

  // SISTEM JUAL
  if(tipe === 'jual'){
    if(args[1] === 'all'){
      let totalHasil = 0, listJual = []
      for(let item in user.masakan){
        if(hargaJual[item] && user.masakan[item] > 0){
          let jumlah = user.masakan[item]
          let hasil = Math.floor(hargaJual[item] * sellBonus) * jumlah
          totalHasil += hasil
          listJual.push(`${resepEmoji[item] || '🍽️'} ${formatNama(item)} x${jumlah}`)
          delete user.masakan[item]
        }
      }
      if(totalHasil === 0) return m.reply('❌ Dapur kosong!')
      wdb.money[m.sender] += totalHasil; saveDB(wdb)
      let cap = `┌───❏「 💼 PENYETORAN KE RESTORAN 」❏\n│ Koki : ${m.pushName}\n└───────────────────\n\n📤 *${listJual.length} Masakan Disetor*\n\n💰 +Rp ${totalHasil.toLocaleString()}\n💵 Total: Rp ${wdb.money[m.sender].toLocaleString()}\n\n_“Terima kasih sudah memasak untuk pelanggan!”_`
      return m.reply(cap)
    }
    let itemInput = args[1]
    let amount = args[2] === 'all'? 'all' : (parseInt(args[2]) || 1)
    let item =!isNaN(itemInput)? nomorKeItemBeli[parseInt(itemInput)] : itemInput.replace(/ /g, '_')
    let stok = user.masakan[item] || 0
    if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(item)}`)
    let jual = amount === 'all'? stok : amount
    if (jual > stok) return m.reply(`❌ Stok tidak cukup! Punya: ${stok}`)
    let hasil = Math.floor(hargaJual[item] * sellBonus) * jual
    user.masakan[item] -= jual; if(user.masakan[item] <= 0) delete user.masakan[item]
    wdb.money[m.sender] += hasil; saveDB(wdb)
    let cap = `┌───❏「 💼 PENYETORAN KE RESTORAN 」❏\n│ Menu : ${resepEmoji[item]} ${formatNama(item)}\n│ Jumlah : ${jual}\n└───────────────────\n\n💰 +Rp ${hasil.toLocaleString()}\n💵 Total: Rp ${wdb.money[m.sender].toLocaleString()}`
    return m.reply(cap)
  }
}

handler.help = ['restoran', 'restoran menu', 'restoran info <no/nama>', 'restoran beli <no/nama> <jml>', 'restoran paket <nama>', 'restoran paket list', 'restoran jual <no/nama> <jml/all>']
handler.tags = ['rpg']
handler.command = /^(restoran|tokomasak)$/i
handler.group = true
export default handler