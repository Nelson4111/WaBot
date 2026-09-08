import { loadDB, saveDB } from './waifuHelper.js'

export const hewanList = {
// TIER 0 - DASAR
'kelinci': { emoji: '🐇', nama: 'Kelinci', hargaBibit: 5000, hargaJual: 15000, hasil: 'Daging Kelinci 🥩', exp: 20, tipe: 'daging', evolusi: 0, desc: 'Mamalia kecil yang mudah dipelihara untuk daging.' },
'ayam': { emoji: '🐓', nama: 'Ayam', hargaBibit: 8000, hargaJual: 25000, hasil: 'Telur Ayam 🥚', exp: 25, tipe: 'produk', evolusi: 0, desc: 'Unggas umum yang menghasilkan telur dan daging.' },
'bebek': { emoji: '🦆', nama: 'Bebek', hargaBibit: 12000, hargaJual: 30000, hasil: 'Telur Bebek 🥚', exp: 28, tipe: 'produk', evolusi: 0, desc: 'Unggas air yang populer sebagai penghasil telur.' },
'burung': { emoji: '🐦', nama: 'Burung', hargaBibit: 15000, hargaJual: 40000, hasil: 'Telur Burung 🥚', exp: 30, tipe: 'produk', evolusi: 0, desc: 'Spesies unggas yang mudah dipelihara dalam kandang.' },
'kambing': { emoji: '🐐', nama: 'Kambing', hargaBibit: 25000, hargaJual: 70000, hasil: 'Susu Kambing 🥛', exp: 35, tipe: 'produk', evolusi: 0, desc: 'Mamalia pemamah biak dengan produksi susu yang baik.' },
'angsa': { emoji: '🪿', nama: 'Angsa', hargaBibit: 30000, hargaJual: 85000, hasil: 'Telur Angsa 🥚', exp: 38, tipe: 'produk', evolusi: 0, desc: 'Unggas air besar dengan telur berukuran besar.' },
'merpati': { emoji: '🕊️', nama: 'Merpati', hargaBibit: 35000, hargaJual: 90000, hasil: 'Telur Merpati 🥚', exp: 40, tipe: 'produk', evolusi: 0, desc: 'Burung jinak yang mudah berkembang biak.' },
'kalkun': { emoji: '🦃', nama: 'Kalkun', hargaBibit: 40000, hargaJual: 100000, hasil: 'Daging Kalkun 🥩', exp: 42, tipe: 'daging', evolusi: 0, desc: 'Unggas besar yang memiliki daging cukup melimpah.' },
'puyuh': { emoji: '🐦', nama: 'Puyuh', hargaBibit: 42000, hargaJual: 105000, hasil: 'Telur Puyuh 🥚', exp: 44, tipe: 'produk', evolusi: 0, desc: 'Burung mungil yang terkenal dengan produksi telurnya.' },
'burung_unta': { emoji: '🐦', nama: 'Burung Unta', hargaBibit: 45000, hargaJual: 110000, hasil: 'Telur Burung Unta 🥚', exp: 46, tipe: 'produk', evolusi: 0, desc: 'Unggas darat terbesar dengan telur yang sangat besar.' },
'hamster': { emoji: '🐹', nama: 'Hamster', hargaBibit: 48000, hargaJual: 115000, hasil: 'Daging Hamster 🥩', exp: 48, tipe: 'daging', evolusi: 0, desc: 'Rodensia kecil yang aktif dan mudah dirawat.' },
'marmut': { emoji: '🐹', nama: 'Marmut', hargaBibit: 50000, hargaJual: 120000, hasil: 'Daging Marmut 🥩', exp: 50, tipe: 'daging', evolusi: 0, desc: 'Hewan pengerat jinak yang hidup berkelompok.' },
'tikus': { emoji: '🐀', nama: 'Tikus', hargaBibit: 52000, hargaJual: 125000, hasil: 'Daging Tikus 🥩', exp: 52, tipe: 'daging', evolusi: 0, desc: 'Rodensia kecil yang memiliki perkembangbiakan cepat.' },
'iguana': { emoji: '🦎', nama: 'Iguana', hargaBibit: 55000, hargaJual: 130000, hasil: 'Kulit Iguana 👜', exp: 54, tipe: 'produk', evolusi: 0, desc: 'Reptil herbivor dengan penampilan khas dan menarik.' },
'kura_kura': { emoji: '🐢', nama: 'Kura-Kura', hargaBibit: 60000, hargaJual: 140000, hasil: 'Cangkang Kura-Kura 🐚', exp: 56, tipe: 'produk', evolusi: 0, desc: 'Reptil bercangkang dengan pertumbuhan yang lambat.' },
'katak': { emoji: '🐸', nama: 'Katak', hargaBibit: 62000, hargaJual: 145000, hasil: 'Daging Katak 🥩', exp: 58, tipe: 'daging', evolusi: 0, desc: 'Amfibi yang hidup di lingkungan lembap dan berair.' },
'ikan': { emoji: '🐟', nama: 'Ikan', hargaBibit: 65000, hargaJual: 150000, hasil: 'Daging Ikan 🥩', exp: 60, tipe: 'daging', evolusi: 0, desc: 'Hewan air yang umum dipelihara di kolam.' },
'ikan_tropis': { emoji: '🐠', nama: 'Ikan Tropis', hargaBibit: 70000, hargaJual: 160000, hasil: 'Ikan Hias 🐠', exp: 62, tipe: 'produk', evolusi: 0, desc: 'Ikan berwarna cerah yang bernilai sebagai hiasan.' },
'kepiting': { emoji: '🦀', nama: 'Kepiting', hargaBibit: 75000, hargaJual: 170000, hasil: 'Daging Kepiting 🥩', exp: 64, tipe: 'daging', evolusi: 0, desc: 'Krustasea bercangkang keras yang hidup di perairan.' },
'udang': { emoji: '🦐', nama: 'Udang', hargaBibit: 80000, hargaJual: 180000, hasil: 'Daging Udang 🥩', exp: 66, tipe: 'daging', evolusi: 0, desc: 'Krustasea kecil yang banyak ditemukan di tambak.' },
'biawak': { emoji: '🦎', nama: 'Biawak', hargaBibit: 85000, hargaJual: 190000, hasil: 'Kulit Biawak 👜', exp: 68, tipe: 'produk', evolusi: 0, desc: 'Reptil tangguh dengan kulit yang bernilai.' },
'cacing': { emoji: '🪱', nama: 'Cacing', hargaBibit: 90000, hargaJual: 200000, hasil: 'Cacing 🪱', exp: 70, tipe: 'produk', evolusi: 0, desc: 'Hewan tanah kecil yang berkembang biak dengan cepat.' },
'lebah': { emoji: '🐝', nama: 'Lebah', hargaBibit: 95000, hargaJual: 210000, hasil: 'Madu 🍯', exp: 72, tipe: 'produk', evolusi: 0, desc: 'Serangga sosial yang menghasilkan madu berkualitas.' },
'keong': { emoji: '🐌', nama: 'Keong', hargaBibit: 100000, hargaJual: 220000, hasil: 'Daging Keong 🥩', exp: 74, tipe: 'daging', evolusi: 0, desc: 'Moluska bercangkang yang bergerak dengan lambat.' },
'belut': { emoji: '🐟', nama: 'Belut', hargaBibit: 105000, hargaJual: 230000, hasil: 'Daging Belut 🥩', exp: 76, tipe: 'daging', evolusi: 0, desc: 'Ikan berbentuk panjang yang hidup di perairan berlumpur.' },
'lele': { emoji: '🐟', nama: 'Lele', hargaBibit: 110000, hargaJual: 240000, hasil: 'Daging Lele 🥩', exp: 78, tipe: 'daging', evolusi: 0, desc: 'Ikan air tawar yang kuat dan mudah dibudidayakan.' },
'nila': { emoji: '🐟', nama: 'Nila', hargaBibit: 115000, hargaJual: 250000, hasil: 'Daging Nila 🥩', exp: 80, tipe: 'daging', evolusi: 0, desc: 'Ikan air tawar populer dengan pertumbuhan cepat.' },
'gurame': { emoji: '🐟', nama: 'Gurame', hargaBibit: 120000, hargaJual: 260000, hasil: 'Daging Gurame 🥩', exp: 82, tipe: 'daging', evolusi: 0, desc: 'Ikan air tawar berukuran besar dengan rasa khas.' },
'mas': { emoji: '🐟', nama: 'Mas', hargaBibit: 125000, hargaJual: 270000, hasil: 'Daging Mas 🥩', exp: 84, tipe: 'daging', evolusi: 0, desc: 'Ikan air tawar yang mampu hidup di berbagai kondisi.' },
'patin': { emoji: '🐟', nama: 'Patin', hargaBibit: 130000, hargaJual: 280000, hasil: 'Daging Patin 🥩', exp: 86, tipe: 'daging', evolusi: 0, desc: 'Ikan berkumis yang memiliki daging lembut.' },
'bandeng': { emoji: '🐟', nama: 'Bandeng', hargaBibit: 135000, hargaJual: 290000, hasil: 'Daging Bandeng 🥩', exp: 88, tipe: 'daging', evolusi: 0, desc: 'Ikan perairan payau yang populer sebagai bahan pangan.' },
'teri': { emoji: '🐟', nama: 'Teri', hargaBibit: 140000, hargaJual: 300000, hasil: 'Daging Teri 🥩', exp: 90, tipe: 'daging', evolusi: 0, desc: 'Ikan kecil yang hidup bergerombol dalam jumlah besar.' },
'gurita': { emoji: '🐙', nama: 'Gurita', hargaBibit: 145000, hargaJual: 310000, hasil: 'Daging Gurita 🥩', exp: 92, tipe: 'daging', evolusi: 0, desc: 'Moluska laut bertentakel yang sangat cerdas.' },
'tiram': { emoji: '🦪', nama: 'Tiram', hargaBibit: 150000, hargaJual: 320000, hasil: 'Mutiara 🫧', exp: 94, tipe: 'produk', evolusi: 0, desc: 'Moluska laut yang dapat menghasilkan mutiara.' },
'kerang': { emoji: '🐚', nama: 'Kerang', hargaBibit: 155000, hargaJual: 330000, hasil: 'Daging Kerang 🥩', exp: 96, tipe: 'daging', evolusi: 0, desc: 'Moluska bercangkang yang hidup di dasar perairan.' },
'ikan_mas': { emoji: '🐟', nama: 'Ikan Mas', hargaBibit: 160000, hargaJual: 340000, hasil: 'Ikan Hias 🐠', exp: 98, tipe: 'produk', evolusi: 0, desc: 'Ikan berwarna keemasan yang sering dipelihara.' },
'guppy': { emoji: '🐠', nama: 'Guppy', hargaBibit: 165000, hargaJual: 350000, hasil: 'Ikan Hias 🐠', exp: 100, tipe: 'produk', evolusi: 0, desc: 'Ikan kecil penuh warna yang mudah berkembang biak.' },
'molly': { emoji: '🐠', nama: 'Molly', hargaBibit: 170000, hargaJual: 360000, hasil: 'Ikan Hias 🐠', exp: 102, tipe: 'produk', evolusi: 0, desc: 'Ikan mungil dengan berbagai variasi warna.' },
'koi': { emoji: '🐟', nama: 'Koi', hargaBibit: 175000, hargaJual: 370000, hasil: 'Ikan Hias 🐠', exp: 104, tipe: 'produk', evolusi: 0, desc: 'Ikan hias populer dengan pola warna yang indah.' },
'arwana': { emoji: '🐟', nama: 'Arwana', hargaBibit: 180000, hargaJual: 380000, hasil: 'Ikan Hias 🐠', exp: 106, tipe: 'produk', evolusi: 0, desc: 'Ikan eksotis dengan bentuk tubuh yang elegan.' },
'cupang': { emoji: '🐟', nama: 'Cupang', hargaBibit: 185000, hargaJual: 390000, hasil: 'Ikan Hias 🐠', exp: 108, tipe: 'produk', evolusi: 0, desc: 'Ikan kecil dengan sirip lebar dan warna mencolok.' },
'guinea': { emoji: '🐹', nama: 'Guinea', hargaBibit: 190000, hargaJual: 400000, hasil: 'Daging Guinea 🥩', exp: 110, tipe: 'daging', evolusi: 0, desc: 'Pengerat kecil yang aktif dan mudah dirawat.' },
'kadal': { emoji: '🦎', nama: 'Kadal', hargaBibit: 195000, hargaJual: 410000, hasil: 'Kulit Kadal 👜', exp: 112, tipe: 'produk', evolusi: 0, desc: 'Reptil kecil yang mampu beradaptasi dengan lingkungan.' },
'salamander': { emoji: '🦎', nama: 'Salamander', hargaBibit: 200000, hargaJual: 420000, hasil: 'Kulit Salamander 👜', exp: 114, tipe: 'produk', evolusi: 0, desc: 'Amfibi unik yang menyukai habitat lembap.' },
'axolotl': { emoji: '🦎', nama: 'Axolotl', hargaBibit: 205000, hargaJual: 430000, hasil: 'Telur Axolotl 🥚', exp: 116, tipe: 'produk', evolusi: 0, desc: 'Amfibi air dengan kemampuan regenerasi yang luar biasa.' },
'landak_mini': { emoji: '🦔', nama: 'Landak Mini', hargaBibit: 210000, hargaJual: 440000, hasil: 'Duri Landak 🦔', exp: 118, tipe: 'produk', evolusi: 0, desc: 'Mamalia berduri berukuran kecil yang mudah dipelihara.' },
// TIER 1 - TERNAK
'domba': { emoji: '🐑', nama: 'Domba', hargaBibit: 40000, hargaJual: 100000, hasil: 'Bulu Domba 🧶', exp: 40, tipe: 'produk', evolusi: 0, desc: 'Mamalia berbulu yang menghasilkan serat berkualitas.' },
'babi': { emoji: '🐖', nama: 'Babi', hargaBibit: 60000, hargaJual: 150000, hasil: 'Daging Babi 🥩', exp: 45, tipe: 'daging', evolusi: 0, desc: 'Mamalia besar yang memiliki pertumbuhan cukup cepat.' },
'kuda': { emoji: '🐴', nama: 'Kuda', hargaBibit: 80000, hargaJual: 200000, hasil: 'Susu Kuda 🥛', exp: 50, tipe: 'produk', evolusi: 0, desc: 'Equid kuat yang dikenal sebagai hewan pekerja.' },
'sapi': { emoji: '🐄', nama: 'Sapi', hargaBibit: 90000, hargaJual: 220000, hasil: 'Susu Sapi 🥛', exp: 55, tipe: 'produk', evolusi: 0, desc: 'Ruminansia besar dengan produksi susu melimpah.' },
'unta': { emoji: '🐪', nama: 'Unta', hargaBibit: 110000, hargaJual: 280000, hasil: 'Susu Unta 🥛', exp: 60, tipe: 'produk', evolusi: 0, desc: 'Mamalia gurun yang mampu bertahan tanpa banyak air.' },
'kerbau': { emoji: '🐃', nama: 'Kerbau', hargaBibit: 120000, hargaJual: 300000, hasil: 'Susu Kerbau 🥛', exp: 62, tipe: 'produk', evolusi: 0, desc: 'Bovid kuat yang banyak digunakan untuk pekerjaan berat.' },
'keledai': { emoji: '🫏', nama: 'Keledai', hargaBibit: 130000, hargaJual: 320000, hasil: 'Kulit Keledai 👜', exp: 64, tipe: 'produk', evolusi: 0, desc: 'Equid tangguh yang terkenal tahan terhadap kondisi sulit.' },
'alpaka': { emoji: '🦙', nama: 'Alpaka', hargaBibit: 140000, hargaJual: 350000, hasil: 'Wol Alpaka 🧶', exp: 66, tipe: 'produk', evolusi: 0, desc: 'Camelid berbulu lembut dengan serat bernilai tinggi.' },
'bison': { emoji: '🦬', nama: 'Bison', hargaBibit: 150000, hargaJual: 380000, hasil: 'Daging Bison 🥩', exp: 68, tipe: 'daging', evolusi: 0, desc: 'Bovid besar yang cocok hidup di padang luas.' },
'rusa': { emoji: '🦌', nama: 'Rusa', hargaBibit: 160000, hargaJual: 400000, hasil: 'Tanduk Rusa 🦴', exp: 70, tipe: 'produk', evolusi: 0, desc: 'Mamalia bertanduk yang hidup dengan memakan tumbuhan.' },
'yak': { emoji: '🐂', nama: 'Yak', hargaBibit: 170000, hargaJual: 420000, hasil: 'Wol Yak 🧶', exp: 72, tipe: 'produk', evolusi: 0, desc: 'Bovid berbulu tebal yang tahan terhadap udara dingin.' },
'lama': { emoji: '🦙', nama: 'Llama', hargaBibit: 180000, hargaJual: 450000, hasil: 'Wol Llama 🧶', exp: 74, tipe: 'produk', evolusi: 0, desc: 'Camelid jinak yang menghasilkan serat dan membantu membawa barang.' },
'kuda_nil': { emoji: '🦛', nama: 'Kuda Nil', hargaBibit: 190000, hargaJual: 480000, hasil: 'Daging Kuda Nil 🥩', exp: 76, tipe: 'daging', evolusi: 0, desc: 'Mamalia besar semiakuatik dengan tubuh yang sangat kuat.' },
'keledai_liar': { emoji: '🫏', nama: 'Keledai Liar', hargaBibit: 200000, hargaJual: 500000, hasil: 'Kulit Keledai 👜', exp: 78, tipe: 'produk', evolusi: 0, desc: 'Kerabat keledai yang lebih liar dan tahan terhadap medan kasar.' },
'kijang': { emoji: '🦌', nama: 'Kijang', hargaBibit: 210000, hargaJual: 520000, hasil: 'Tanduk Kijang 🦴', exp: 80, tipe: 'produk', evolusi: 0, desc: 'Herbivor lincah dengan tubuh ringan dan tanduk khas.' },
'moose': { emoji: '🫎', nama: 'Moose', hargaBibit: 220000, hargaJual: 550000, hasil: 'Tanduk Moose 🦴', exp: 82, tipe: 'produk', evolusi: 0, desc: 'Rusa raksasa dengan tanduk lebar dan tubuh kokoh.' },
'kambing_gunung': { emoji: '🐐', nama: 'Kambing Gunung', hargaBibit: 230000, hargaJual: 580000, hasil: 'Bulu Kambing 🧶', exp: 84, tipe: 'produk', evolusi: 0, desc: 'Ungulata pegunungan yang lincah di medan berbatu.' },
'ferret': { emoji: '🦦', nama: 'Ferret', hargaBibit: 240000, hargaJual: 600000, hasil: 'Bulu Ferret 🧶', exp: 86, tipe: 'produk', evolusi: 0, desc: 'Mustelid kecil yang aktif dan memiliki tubuh lentur.' },
'berang_berang': { emoji: '🦫', nama: 'Berang-Berang', hargaBibit: 250000, hargaJual: 630000, hasil: 'Bulu Berang-Berang 🧶', exp: 88, tipe: 'produk', evolusi: 0, desc: 'Mamalia semiakuatik yang pandai berenang dan membangun bendungan.' },
'landak': { emoji: '🦔', nama: 'Landak', hargaBibit: 260000, hargaJual: 650000, hasil: 'Duri Landak 🦔', exp: 90, tipe: 'produk', evolusi: 0, desc: 'Mamalia berduri yang memiliki pertahanan alami.' },
'zebra': { emoji: '🦓', nama: 'Zebra', hargaBibit: 270000, hargaJual: 680000, hasil: 'Kulit Zebra 👜', exp: 92, tipe: 'produk', evolusi: 0, desc: 'Equid bergaris yang hidup dalam kelompok sosial.' },
'jerapah': { emoji: '🦒', nama: 'Jerapah', hargaBibit: 280000, hargaJual: 700000, hasil: 'Kulit Jerapah 👜', exp: 94, tipe: 'produk', evolusi: 0, desc: 'Mamalia tinggi dengan leher panjang dan pola tubuh khas.' },
'tapir': { emoji: '🦣', nama: 'Tapir', hargaBibit: 290000, hargaJual: 720000, hasil: 'Kulit Tapir 👜', exp: 96, tipe: 'produk', evolusi: 0, desc: 'Mamalia herbivor dengan moncong pendek yang unik.' },
'reindeer': { emoji: '🦌', nama: 'Reindeer', hargaBibit: 300000, hargaJual: 740000, hasil: 'Tanduk Reindeer 🦴', exp: 98, tipe: 'produk', evolusi: 0, desc: 'Rusa kutub yang mampu bertahan di wilayah dingin.' },
'guanako': { emoji: '🦙', nama: 'Guanako', hargaBibit: 310000, hargaJual: 760000, hasil: 'Wol Guanako 🧶', exp: 100, tipe: 'produk', evolusi: 0, desc: 'Camelid liar dengan serat lembut dan tubuh tangguh.' },
'ibex': { emoji: '🐐', nama: 'Ibex', hargaBibit: 320000, hargaJual: 780000, hasil: 'Tanduk Ibex 🦴', exp: 102, tipe: 'produk', evolusi: 0, desc: 'Kambing liar yang terkenal mampu memanjat tebing.' },
'eland': { emoji: '🦌', nama: 'Eland', hargaBibit: 330000, hargaJual: 800000, hasil: 'Daging Eland 🥩', exp: 104, tipe: 'daging', evolusi: 0, desc: 'Antelop besar dengan tubuh kuat dan jinak.' },
'merino': { emoji: '🐑', nama: 'Merino', hargaBibit: 340000, hargaJual: 820000, hasil: 'Wol Merino 🧶', exp: 106, tipe: 'produk', evolusi: 0, desc: 'Domba berbulu halus yang terkenal menghasilkan wol berkualitas.' },
'saanen': { emoji: '🐐', nama: 'Saanen', hargaBibit: 350000, hargaJual: 840000, hasil: 'Susu Saanen 🥛', exp: 108, tipe: 'produk', evolusi: 0, desc: 'Kambing perah dengan produksi susu tinggi.' },
'angora': { emoji: '🐇', nama: 'Angora', hargaBibit: 360000, hargaJual: 860000, hasil: 'Wol Angora 🧶', exp: 110, tipe: 'produk', evolusi: 0, desc: 'Hewan berbulu panjang yang menghasilkan serat lembut.' },
'duroc': { emoji: '🐖', nama: 'Duroc', hargaBibit: 370000, hargaJual: 880000, hasil: 'Daging Duroc 🥩', exp: 112, tipe: 'daging', evolusi: 0, desc: 'Babi berwarna kemerahan dengan pertumbuhan yang baik.' },
'charolais': { emoji: '🐄', nama: 'Charolais', hargaBibit: 380000, hargaJual: 900000, hasil: 'Daging Charolais 🥩', exp: 114, tipe: 'daging', evolusi: 0, desc: 'Sapi berwarna putih dengan tubuh besar dan berotot.' },
'merino_hitam': { emoji: '🐑', nama: 'Merino Hitam', hargaBibit: 390000, hargaJual: 920000, hasil: 'Wol Hitam 🧶', exp: 116, tipe: 'produk', evolusi: 0, desc: 'Domba berbulu gelap dengan serat yang bernilai.' },
'waterbuck': { emoji: '🦌', nama: 'Waterbuck', hargaBibit: 400000, hargaJual: 940000, hasil: 'Daging Waterbuck 🥩', exp: 118, tipe: 'daging', evolusi: 0, desc: 'Antelop besar yang dekat dengan lingkungan berair.' },
'okapi': { emoji: '🦓', nama: 'Okapi', hargaBibit: 410000, hargaJual: 960000, hasil: 'Kulit Okapi 👜', exp: 120, tipe: 'produk', evolusi: 0, desc: 'Mamalia unik dengan kaki bergaris seperti zebra.' },
'gnu': { emoji: '🐃', nama: 'Gnu', hargaBibit: 420000, hargaJual: 980000, hasil: 'Daging Gnu 🥩', exp: 122, tipe: 'daging', evolusi: 0, desc: 'Antelop besar yang terkenal melakukan migrasi panjang.' },
'hartebeest': { emoji: '🦌', nama: 'Hartebeest', hargaBibit: 430000, hargaJual: 1000000, hasil: 'Daging Hartebeest 🥩', exp: 124, tipe: 'daging', evolusi: 0, desc: 'Antelop berwajah panjang dengan tubuh atletis.' },
'oryx': { emoji: '🦌', nama: 'Oryx', hargaBibit: 440000, hargaJual: 1020000, hasil: 'Tanduk Oryx 🦴', exp: 126, tipe: 'produk', evolusi: 0, desc: 'Antelop gurun dengan sepasang tanduk panjang.' },
// TIER 2 - LANGKA
'singa': { emoji: '🦁', nama: 'Singa', hargaBibit: 280000, hargaJual: 700000, hasilDaging: 'Daging Singa 🥩', hasil: 'Cakar Singa 🐾', exp: 95, tipe: 'all', evolusi: 0, desc: 'Kucing besar yang membutuhkan area luas dan aman.' },
'harimau': { emoji: '🐅', nama: 'Harimau', hargaBibit: 300000, hargaJual: 750000, hasilDaging: 'Daging Harimau 🥩', hasil: 'Cakar Harimau 🐾', exp: 100, tipe: 'all', evolusi: 0, desc: 'Predator belang dengan kekuatan dan kelincahan tinggi.' },
'gajah': { emoji: '🐘', nama: 'Gajah', hargaBibit: 330000, hargaJual: 850000, hasil: 'Gading Gajah 🦷', exp: 105, tipe: 'produk', evolusi: 0, desc: 'Mamalia darat raksasa dengan kecerdasan tinggi.' },
'badak': { emoji: '🦏', nama: 'Badak', hargaBibit: 350000, hargaJual: 900000, hasil: 'Cula Badak 🦴', exp: 110, tipe: 'produk', evolusi: 0, desc: 'Mamalia bercula dengan tubuh yang sangat kuat.' },
'gorila': { emoji: '🦍', nama: 'Gorila', hargaBibit: 380000, hargaJual: 950000, hasilDaging: 'Daging Gorila 🥩', hasil: 'Taring Gorila 🦷', exp: 115, tipe: 'all', evolusi: 0, desc: 'Primata besar dengan tenaga fisik yang luar biasa.' },
'serigala': { emoji: '🐺', nama: 'Serigala', hargaBibit: 400000, hargaJual: 1000000, hasilDaging: 'Daging Serigala 🥩', hasil: 'Taring Serigala 🦷', exp: 120, tipe: 'all', evolusi: 0, desc: 'Canid liar yang memiliki insting berburu kuat.' },
'beruang': { emoji: '🐻', nama: 'Beruang', hargaBibit: 420000, hargaJual: 1050000, hasilDaging: 'Daging Beruang 🥩', hasil: 'Bulu Beruang 🧶', exp: 125, tipe: 'all', evolusi: 0, desc: 'Mamalia besar dengan cakar dan tenaga mengesankan.' },
'buaya': { emoji: '🐊', nama: 'Buaya', hargaBibit: 440000, hargaJual: 1100000, hasil: 'Kulit Buaya 👜', exp: 130, tipe: 'produk', evolusi: 0, desc: 'Reptil predator yang mampu hidup di air dan darat.' },
'ular': { emoji: '🐍', nama: 'Ular', hargaBibit: 460000, hargaJual: 1150000, hasil: 'Kulit Ular 👜', exp: 135, tipe: 'produk', evolusi: 0, desc: 'Reptil tanpa kaki dengan berbagai jenis dan ukuran.' },
'komodo': { emoji: '🦎', nama: 'Komodo', hargaBibit: 480000, hargaJual: 1200000, hasil: 'Kulit Komodo 👜', exp: 140, tipe: 'produk', evolusi: 0, desc: 'Kadal raksasa dengan gigitan yang sangat kuat.' },
'zebra_langka': { emoji: '🦓', nama: 'Zebra Langka', hargaBibit: 500000, hargaJual: 1250000, hasil: 'Kulit Zebra 👜', exp: 145, tipe: 'produk', evolusi: 0, desc: 'Varian zebra langka dengan pola tubuh yang berbeda.' },
'jerapah_putih': { emoji: '🦒', nama: 'Jerapah Putih', hargaBibit: 520000, hargaJual: 1300000, hasil: 'Kulit Jerapah 👜', exp: 150, tipe: 'produk', evolusi: 0, desc: 'Jerapah berwarna pucat dengan penampilan yang sangat langka.' },
'badak_putih': { emoji: '🦏', nama: 'Badak Putih', hargaBibit: 540000, hargaJual: 1350000, hasil: 'Cula Badak 🦴', exp: 155, tipe: 'produk', evolusi: 0, desc: 'Badak berukuran besar dengan tubuh yang kokoh.' },
'harimau_putih': { emoji: '🐅', nama: 'Harimau Putih', hargaBibit: 560000, hargaJual: 1400000, hasilDaging: 'Daging Harimau 🥩', hasil: 'Cakar Harimau 🐾', exp: 160, tipe: 'all', evolusi: 0, desc: 'Harimau berwarna putih dengan corak hitam yang khas.' },
'singa_putih': { emoji: '🦁', nama: 'Singa Putih', hargaBibit: 580000, hargaJual: 1450000, hasilDaging: 'Daging Singa 🥩', hasil: 'Cakar Singa 🐾', exp: 165, tipe: 'all', evolusi: 0, desc: 'Singa berwarna terang dengan penampilan yang langka.' },
'macan_tutul': { emoji: '🐆', nama: 'Macan Tutul', hargaBibit: 600000, hargaJual: 1500000, hasilDaging: 'Daging Macan 🥩', hasil: 'Cakar Macan 🐾', exp: 170, tipe: 'all', evolusi: 0, desc: 'Kucing besar berbintik yang terkenal sangat lincah.' },
'cheetah': { emoji: '🐆', nama: 'Cheetah', hargaBibit: 620000, hargaJual: 1550000, hasilDaging: 'Daging Cheetah 🥩', hasil: 'Cakar Cheetah 🐾', exp: 175, tipe: 'all', evolusi: 0, desc: 'Kucing tercepat dengan kemampuan berlari luar biasa.' },
'jaguar': { emoji: '🐆', nama: 'Jaguar', hargaBibit: 640000, hargaJual: 1600000, hasilDaging: 'Daging Jaguar 🥩', hasil: 'Cakar Jaguar 🐾', exp: 180, tipe: 'all', evolusi: 0, desc: 'Kucing besar berbintik dengan gigitan sangat kuat.' },
'panda': { emoji: '🐼', nama: 'Panda', hargaBibit: 660000, hargaJual: 1650000, hasil: 'Bulu Panda 🧶', exp: 185, tipe: 'produk', evolusi: 0, desc: 'Mamalia hitam putih yang sangat menyukai bambu.' },
'koala': { emoji: '🐨', nama: 'Koala', hargaBibit: 680000, hargaJual: 1700000, hasil: 'Bulu Koala 🧶', exp: 190, tipe: 'produk', evolusi: 0, desc: 'Marsupial pemakan daun dengan kehidupan yang tenang.' },
'kanguru': { emoji: '🦘', nama: 'Kanguru', hargaBibit: 700000, hargaJual: 1750000, hasil: 'Daging Kanguru 🥩', exp: 195, tipe: 'daging', evolusi: 0, desc: 'Marsupial berkaki kuat yang bergerak dengan melompat.' },
'quokka': { emoji: '🐹', nama: 'Quokka', hargaBibit: 720000, hargaJual: 1800000, hasil: 'Bulu Quokka 🧶', exp: 200, tipe: 'produk', evolusi: 0, desc: 'Marsupial kecil yang terkenal dengan wajah ramah.' },
'platipus': { emoji: '🦫', nama: 'Platipus', hargaBibit: 740000, hargaJual: 1850000, hasil: 'Telur Platipus 🥚', exp: 205, tipe: 'produk', evolusi: 0, desc: 'Mamalia unik yang bertelur dan memiliki paruh khas.' },
'armadillo': { emoji: '🦔', nama: 'Armadillo', hargaBibit: 760000, hargaJual: 1900000, hasil: 'Cangkang Armadillo 🐚', exp: 210, tipe: 'produk', evolusi: 0, desc: 'Mamalia kecil dengan pelindung tubuh keras.' },
'trenggiling': { emoji: '🦔', nama: 'Trenggiling', hargaBibit: 780000, hargaJual: 1950000, hasil: 'Sisik Trenggiling 🦴', exp: 215, tipe: 'produk', evolusi: 0, desc: 'Mamalia bersisik yang menggulung tubuh saat terancam.' },
'flamingo': { emoji: '🦩', nama: 'Flamingo', hargaBibit: 800000, hargaJual: 2000000, hasil: 'Bulu Flamingo 🪶', exp: 220, tipe: 'produk', evolusi: 0, desc: 'Burung berkaki panjang dengan warna merah muda khas.' },
'merak': { emoji: '🦚', nama: 'Merak', hargaBibit: 820000, hargaJual: 2050000, hasil: 'Bulu Merak 🪶', exp: 225, tipe: 'produk', evolusi: 0, desc: 'Burung indah dengan ekor yang dapat mengembang lebar.' },
'kasuari': { emoji: '🐦', nama: 'Kasuari', hargaBibit: 840000, hargaJual: 2100000, hasil: 'Bulu Kasuari 🪶', exp: 230, tipe: 'produk', evolusi: 0, desc: 'Burung besar yang tidak dapat terbang dan memiliki kaki kuat.' },
'kiwi': { emoji: '🐦', nama: 'Kiwi', hargaBibit: 860000, hargaJual: 2150000, hasil: 'Telur Kiwi 🥚', exp: 235, tipe: 'produk', evolusi: 0, desc: 'Burung kecil tanpa kemampuan terbang dengan telur besar.' },
'kakapo': { emoji: '🦜', nama: 'Kakapo', hargaBibit: 880000, hargaJual: 2200000, hasil: 'Bulu Kakapo 🪶', exp: 240, tipe: 'produk', evolusi: 0, desc: 'Burung nokturnal langka yang tidak dapat terbang.' },
'kakatua': { emoji: '🦜', nama: 'Kakatua', hargaBibit: 900000, hargaJual: 2250000, hasil: 'Bulu Kakatua 🪶', exp: 245, tipe: 'produk', evolusi: 0, desc: 'Burung cerdas dengan jambul dan suara khas.' },
'elang': { emoji: '🦅', nama: 'Elang', hargaBibit: 920000, hargaJual: 2300000, hasil: 'Bulu Elang 🪶', exp: 250, tipe: 'produk', evolusi: 0, desc: 'Burung pemangsa dengan penglihatan yang sangat tajam.' },
'burung_hantu': { emoji: '🦉', nama: 'Burung Hantu', hargaBibit: 940000, hargaJual: 2350000, hasil: 'Bulu Hantu 🪶', exp: 255, tipe: 'produk', evolusi: 0, desc: 'Burung malam dengan kemampuan berburu dalam kegelapan.' },
'falcon': { emoji: '🦅', nama: 'Falcon', hargaBibit: 960000, hargaJual: 2400000, hasil: 'Bulu Falcon 🪶', exp: 260, tipe: 'produk', evolusi: 0, desc: 'Burung pemangsa cepat dengan kemampuan terbang tinggi.' },
'condor': { emoji: '🦅', nama: 'Condor', hargaBibit: 980000, hargaJual: 2450000, hasil: 'Bulu Condor 🪶', exp: 265, tipe: 'produk', evolusi: 0, desc: 'Burung besar dengan bentang sayap yang mengesankan.' },
'lama_gurun': { emoji: '🦙', nama: 'Lama Gurun', hargaBibit: 1000000, hargaJual: 2500000, hasil: 'Wol Gurun 🧶', exp: 270, tipe: 'produk', evolusi: 0, desc: 'Camelid langka yang tahan terhadap lingkungan kering.' },
'muskox': { emoji: '🐂', nama: 'Muskox', hargaBibit: 1020000, hargaJual: 2550000, hasil: 'Wol Muskox 🧶', exp: 275, tipe: 'produk', evolusi: 0, desc: 'Bovid berbulu tebal yang berasal dari wilayah Arktik.' },
'ibex_alpen': { emoji: '🐐', nama: 'Ibex Alpen', hargaBibit: 1040000, hargaJual: 2600000, hasil: 'Tanduk Ibex 🦴', exp: 280, tipe: 'produk', evolusi: 0, desc: 'Kambing pegunungan dengan tanduk melengkung panjang.' },
'markhor': { emoji: '🐐', nama: 'Markhor', hargaBibit: 1060000, hargaJual: 2650000, hasil: 'Tanduk Markhor 🦴', exp: 285, tipe: 'produk', evolusi: 0, desc: 'Kambing liar dengan tanduk berbentuk spiral.' },
// TIER 3 - MITOS
'trex': { emoji: '🦖', nama: 'T-Rex', hargaBibit: 450000, hargaJual: 1200000, hasilTelur: 'Telur T-Rex 🥚', hasilDaging: 'Daging T-Rex 🥩', exp: 130, tipe: 'all', evolusi: 1, desc: 'Dinosaurus predator dengan rahang dan tenaga luar biasa.' },
'bronto': { emoji: '🦕', nama: 'Brontosaurus', hargaBibit: 500000, hargaJual: 1400000, hasilTelur: 'Telur Bronto 🥚', hasilDaging: 'Daging Bronto 🥩', exp: 145, tipe: 'all', evolusi: 1, desc: 'Dinosaurus herbivor raksasa dengan leher sangat panjang.' },
'phoenix': { emoji: '🔥', nama: 'Phoenix', hargaBibit: 600000, hargaJual: 1700000, hasilTelur: 'Telur Phoenix 🥚', hasilDaging: 'Bulu Phoenix 🪶', exp: 160, tipe: 'all', evolusi: 1, desc: 'Burung mitologi yang dikenal dapat terlahir kembali dari api.' },
'griffin': { emoji: '🦅', nama: 'Griffin', hargaBibit: 700000, hargaJual: 2000000, hasilTelur: 'Telur Griffin 🥚', hasilDaging: 'Bulu Griffin 🪶', exp: 175, tipe: 'all', evolusi: 1, desc: 'Makhluk bersayap dengan tubuh singa dan kepala elang.' },
'pegasus': { emoji: '🐎', nama: 'Pegasus', hargaBibit: 800000, hargaJual: 2300000, hasilTelur: 'Telur Pegasus 🥚', hasilDaging: 'Bulu Pegasus 🪶', exp: 190, tipe: 'all', evolusi: 1, desc: 'Kuda bersayap yang mampu terbang melintasi langit.' },
'centaur': { emoji: '🐎', nama: 'Centaur', hargaBibit: 850000, hargaJual: 2500000, hasilDaging: 'Daging Centaur 🥩', hasil: 'Rambut Centaur 🧶', exp: 200, tipe: 'all', evolusi: 1, desc: 'Makhluk berkaki kuda dengan tubuh bagian atas menyerupai manusia.' },
'hippogriff': { emoji: '🦅', nama: 'Hippogriff', hargaBibit: 900000, hargaJual: 2700000, hasilTelur: 'Telur Hippogriff 🥚', hasilDaging: 'Bulu Hippogriff 🪶', exp: 210, tipe: 'all', evolusi: 1, desc: 'Makhluk gabungan antara kuda dan burung pemangsa.' },
'minotaur': { emoji: '🐂', nama: 'Minotaur', hargaBibit: 950000, hargaJual: 2900000, hasilDaging: 'Daging Minotaur 🥩', hasil: 'Tanduk Minotaur 🦴', exp: 220, tipe: 'all', evolusi: 1, desc: 'Makhluk bertubuh kuat dengan kepala menyerupai banteng.' },
'cerberus': { emoji: '🐕', nama: 'Cerberus', hargaBibit: 1000000, hargaJual: 3200000, hasilDaging: 'Daging Cerberus 🥩', hasil: 'Taring Cerberus 🦷', exp: 230, tipe: 'all', evolusi: 1, desc: 'Anjing berkepala tiga yang dikenal sebagai penjaga dunia bawah.' },
'cyclops': { emoji: '👁️', nama: 'Cyclops', hargaBibit: 1050000, hargaJual: 3500000, hasilDaging: 'Daging Cyclops 🥩', hasil: 'Taring Cyclops 🦷', exp: 240, tipe: 'all', evolusi: 1, desc: 'Raksasa bermata satu dengan kekuatan fisik besar.' },
'triceratops': { emoji: '🦖', nama: 'Triceratops', hargaBibit: 1100000, hargaJual: 3800000, hasilTelur: 'Telur Triceratops 🥚', hasilDaging: 'Daging Triceratops 🥩', exp: 250, tipe: 'all', evolusi: 1, desc: 'Dinosaurus bertanduk tiga dengan perisai kepala besar.' },
'stegosaurus': { emoji: '🦕', nama: 'Stegosaurus', hargaBibit: 1150000, hargaJual: 4100000, hasilTelur: 'Telur Stegosaurus 🥚', hasilDaging: 'Daging Stegosaurus 🥩', exp: 260, tipe: 'all', evolusi: 1, desc: 'Dinosaurus pemakan tumbuhan dengan lempeng di punggung.' },
'ankylosaurus': { emoji: '🦖', nama: 'Ankylosaurus', hargaBibit: 1200000, hargaJual: 4400000, hasilTelur: 'Telur Ankylosaurus 🥚', hasilDaging: 'Daging Ankylosaurus 🥩', exp: 270, tipe: 'all', evolusi: 1, desc: 'Dinosaurus lapis baja dengan ekor berbentuk gada.' },
'spinosaurus': { emoji: '🦖', nama: 'Spinosaurus', hargaBibit: 1250000, hargaJual: 4700000, hasilTelur: 'Telur Spinosaurus 🥚', hasilDaging: 'Daging Spinosaurus 🥩', exp: 280, tipe: 'all', evolusi: 1, desc: 'Dinosaurus pemangsa dengan sirip punggung yang besar.' },
'allosaurus': { emoji: '🦖', nama: 'Allosaurus', hargaBibit: 1300000, hargaJual: 5000000, hasilTelur: 'Telur Allosaurus 🥚', hasilDaging: 'Daging Allosaurus 🥩', exp: 290, tipe: 'all', evolusi: 1, desc: 'Predator purba berkaki dua dengan rahang kuat.' },
'dilophosaurus': { emoji: '🦖', nama: 'Dilophosaurus', hargaBibit: 1350000, hargaJual: 5300000, hasilTelur: 'Telur Dilophosaurus 🥚', hasilDaging: 'Daging Dilophosaurus 🥩', exp: 300, tipe: 'all', evolusi: 1, desc: 'Dinosaurus pemangsa dengan sepasang jambul kepala.' },
'parasaurolophus': { emoji: '🦕', nama: 'Parasaurolophus', hargaBibit: 1400000, hargaJual: 5600000, hasilTelur: 'Telur Parasaurolophus 🥚', hasilDaging: 'Daging Parasaurolophus 🥩', exp: 310, tipe: 'all', evolusi: 1, desc: 'Dinosaurus herbivor dengan jambul panjang di kepalanya.' },
'iguanodon': { emoji: '🦕', nama: 'Iguanodon', hargaBibit: 1450000, hargaJual: 5900000, hasilTelur: 'Telur Iguanodon 🥚', hasilDaging: 'Daging Iguanodon 🥩', exp: 320, tipe: 'all', evolusi: 1, desc: 'Dinosaurus pemakan tumbuhan dengan ibu jari berduri.' },
'diplodocus': { emoji: '🦕', nama: 'Diplodocus', hargaBibit: 1500000, hargaJual: 6200000, hasilTelur: 'Telur Diplodocus 🥚', hasilDaging: 'Daging Diplodocus 🥩', exp: 330, tipe: 'all', evolusi: 1, desc: 'Sauropoda panjang dengan ekor dan leher menjulang.' },
'stegoceratops': { emoji: '🦖', nama: 'Stegoceratops', hargaBibit: 1550000, hargaJual: 6500000, hasilTelur: 'Telur Stegoceratops 🥚', hasilDaging: 'Daging Stegoceratops 🥩', exp: 340, tipe: 'all', evolusi: 1, desc: 'Dinosaurus hibrida fiksi dengan pelindung tubuh kuat.' },
'dracorex': { emoji: '🐉', nama: 'Dracorex', hargaBibit: 1600000, hargaJual: 6800000, hasilTelur: 'Telur Dracorex 🥚', hasilDaging: 'Daging Dracorex 🥩', exp: 350, tipe: 'all', evolusi: 1, desc: 'Makhluk purba bertanduk dengan bentuk kepala menyerupai naga.' },
'wyrm': { emoji: '🐉', nama: 'Wyrm', hargaBibit: 1650000, hargaJual: 7100000, hasilTelur: 'Telur Wyrm 🥚', hasilDaging: 'Daging Wyrm 🥩', exp: 360, tipe: 'all', evolusi: 1, desc: 'Naga panjang tanpa kaki yang bergerak seperti ular raksasa.' },
'drake': { emoji: '🐉', nama: 'Drake', hargaBibit: 1700000, hargaJual: 7400000, hasilTelur: 'Telur Drake 🥚', hasilDaging: 'Kulit Drake 👜', exp: 370, tipe: 'all', evolusi: 1, desc: 'Naga kecil bersisik yang kuat dan agresif.' },
'wyvern': { emoji: '🐉', nama: 'Wyvern', hargaBibit: 1750000, hargaJual: 7700000, hasilTelur: 'Telur Wyvern 🥚', hasilDaging: 'Kulit Wyvern 👜', exp: 380, tipe: 'all', evolusi: 1, desc: 'Naga bersayap dengan dua kaki dan ekor panjang.' },
'kelpie': { emoji: '🐎', nama: 'Kelpie', hargaBibit: 1800000, hargaJual: 8000000, hasilTelur: 'Telur Kelpie 🥚', hasilDaging: 'Bulu Kelpie 🪶', exp: 390, tipe: 'all', evolusi: 1, desc: 'Kuda air mistis yang hidup di danau dan sungai.' },
'hippocampus': { emoji: '🐴', nama: 'Hippocampus', hargaBibit: 1850000, hargaJual: 8300000, hasilTelur: 'Telur Hippocampus 🥚', hasilDaging: 'Sisik Hippocampus 🐚', exp: 400, tipe: 'all', evolusi: 1, desc: 'Makhluk laut berbentuk perpaduan kuda dan ikan.' },
'kirin': { emoji: '🦌', nama: 'Kirin', hargaBibit: 1900000, hargaJual: 8600000, hasilTelur: 'Telur Kirin 🥚', hasilDaging: 'Sisik Kirin 🐉', exp: 410, tipe: 'all', evolusi: 1, desc: 'Makhluk mitologi bertubuh menyerupai rusa dengan aura suci.' },
'baku': { emoji: '🐘', nama: 'Baku', hargaBibit: 1950000, hargaJual: 8900000, hasilTelur: 'Telur Baku 🥚', hasilDaging: 'Taring Baku 🦷', exp: 420, tipe: 'all', evolusi: 1, desc: 'Makhluk legenda yang dikenal sebagai pemakan mimpi.' },
'tengu': { emoji: '👺', nama: 'Tengu', hargaBibit: 2000000, hargaJual: 9200000, hasilTelur: 'Telur Tengu 🥚', hasilDaging: 'Bulu Tengu 🪶', exp: 430, tipe: 'all', evolusi: 1, desc: 'Makhluk bersayap dari legenda Jepang yang hidup di pegunungan.' },
'kappa': { emoji: '🐢', nama: 'Kappa', hargaBibit: 2050000, hargaJual: 9500000, hasilTelur: 'Telur Kappa 🥚', hasilDaging: 'Cangkang Kappa 🐚', exp: 440, tipe: 'all', evolusi: 1, desc: 'Makhluk air kecil dengan cangkang dan tempurung di kepala.' },
'roc': { emoji: '🦅', nama: 'Roc', hargaBibit: 2100000, hargaJual: 9800000, hasilTelur: 'Telur Roc 🥚', hasilDaging: 'Bulu Roc 🪶', exp: 450, tipe: 'all', evolusi: 1, desc: 'Burung raksasa yang mampu mengangkat hewan besar.' },
'thunderbird': { emoji: '🦅', nama: 'Thunderbird', hargaBibit: 2150000, hargaJual: 10100000, hasilTelur: 'Telur Thunderbird 🥚', hasilDaging: 'Bulu Thunderbird 🪶', exp: 460, tipe: 'all', evolusi: 1, desc: 'Burung legenda yang dikaitkan dengan petir dan badai.' },
'manticore': { emoji: '🦁', nama: 'Manticore', hargaBibit: 2200000, hargaJual: 10400000, hasilTelur: 'Telur Manticore 🥚', hasilDaging: 'Duri Manticore 🦴', exp: 470, tipe: 'all', evolusi: 1, desc: 'Makhluk berkepala singa dengan ekor penuh duri.' },
'chimera': { emoji: '🦁', nama: 'Chimera', hargaBibit: 2250000, hargaJual: 10700000, hasilTelur: 'Telur Chimera 🥚', hasilDaging: 'Daging Chimera 🥩', exp: 480, tipe: 'all', evolusi: 1, desc: 'Makhluk gabungan beberapa hewan dengan kekuatan berbeda.' },
// TIER 4 - LEGENDARY
'naga': { emoji: '🐉', nama: 'Naga', hargaBibit: 900000, hargaJual: 3000000, hasilTelur: 'Telur Naga 🥚', hasilDaging: 'Daging Naga 🥩', exp: 220, tipe: 'all', evolusi: 2, desc: 'Reptil legendaris bersayap dengan kekuatan elemen.' },
'leviathan': { emoji: '🌊', nama: 'Leviathan', hargaBibit: 1000000, hargaJual: 3500000, hasilTelur: 'Telur Leviathan 🥚', hasilDaging: 'Daging Leviathan 🥩', exp: 240, tipe: 'all', evolusi: 2, desc: 'Monster laut raksasa yang menguasai perairan dalam.' },
'kraken': { emoji: '🦑', nama: 'Kraken', hargaBibit: 1100000, hargaJual: 4000000, hasilTelur: 'Telur Kraken 🥚', hasilDaging: 'Tentakel Kraken 🦑', exp: 260, tipe: 'all', evolusi: 2, desc: 'Makhluk laut raksasa dengan tentakel yang sangat kuat.' },
'unicorn': { emoji: '🦄', nama: 'Unicorn', hargaBibit: 1200000, hargaJual: 4500000, hasilTelur: 'Telur Unicorn 🥚', hasil: 'Tanduk Unicorn 🦄', exp: 280, tipe: 'all', evolusi: 2, desc: 'Kuda ajaib bertanduk dengan aura yang menenangkan.' },
'fenrir': { emoji: '🐺', nama: 'Fenrir', hargaBibit: 1300000, hargaJual: 5000000, hasilTelur: 'Telur Fenrir 🥚', hasilDaging: 'Taring Fenrir 🦷', exp: 300, tipe: 'all', evolusi: 2, desc: 'Serigala raksasa yang menjadi simbol kekuatan dan kehancuran.' },
'hydra': { emoji: '🐍', nama: 'Hydra', hargaBibit: 1400000, hargaJual: 5500000, hasilTelur: 'Telur Hydra 🥚', hasilDaging: 'Kulit Hydra 👜', exp: 320, tipe: 'all', evolusi: 2, desc: 'Monster berkepala banyak yang mampu menumbuhkan kepala kembali.' },
'cerberus_leg': { emoji: '🐕', nama: 'Cerberus', hargaBibit: 1500000, hargaJual: 6000000, hasilTelur: 'Telur Cerberus 🥚', hasilDaging: 'Taring Cerberus 🦷', exp: 340, tipe: 'all', evolusi: 2, desc: 'Anjing berkepala tiga dengan naluri penjaga yang kuat.' },
'behemoth': { emoji: '🦏', nama: 'Behemoth', hargaBibit: 1600000, hargaJual: 6500000, hasilDaging: 'Daging Behemoth 🥩', hasil: 'Tanduk Behemoth 🦴', exp: 360, tipe: 'all', evolusi: 2, desc: 'Makhluk darat raksasa dengan tubuh sekuat benteng.' },
'typhon': { emoji: '🐉', nama: 'Typhon', hargaBibit: 1700000, hargaJual: 7000000, hasilTelur: 'Telur Typhon 🥚', hasilDaging: 'Kulit Typhon 👜', exp: 380, tipe: 'all', evolusi: 2, desc: 'Raksasa mitologi dengan kekuatan badai dan api.' },
'quetzalcoatl': { emoji: '🐍', nama: 'Quetzalcoatl', hargaBibit: 1800000, hargaJual: 7500000, hasilTelur: 'Telur Quetzalcoatl 🥚', hasilDaging: 'Bulu Quetzalcoatl 🪶', exp: 400, tipe: 'all', evolusi: 2, desc: 'Ular berbulu legendaris yang menguasai langit dan angin.' },
'jormungandr': { emoji: '🐍', nama: 'Jormungandr', hargaBibit: 1900000, hargaJual: 8000000, hasilTelur: 'Telur Jormungandr 🥚', hasilDaging: 'Kulit Jormungandr 👜', exp: 420, tipe: 'all', evolusi: 2, desc: 'Ular laut raksasa yang ukurannya mampu mengelilingi dunia.' },
'sleipnir': { emoji: '🐎', nama: 'Sleipnir', hargaBibit: 2000000, hargaJual: 8500000, hasilTelur: 'Telur Sleipnir 🥚', hasilDaging: 'Bulu Sleipnir 🪶', exp: 440, tipe: 'all', evolusi: 2, desc: 'Kuda berkaki delapan yang mampu bergerak melampaui batas.' },
'fenrir_alpha': { emoji: '🐺', nama: 'Fenrir Alpha', hargaBibit: 2100000, hargaJual: 9000000, hasilTelur: 'Telur Fenrir 🥚', hasilDaging: 'Taring Fenrir 🦷', exp: 460, tipe: 'all', evolusi: 2, desc: 'Varian serigala raksasa dengan kekuatan jauh lebih besar.' },
'basilisk': { emoji: '🐍', nama: 'Basilisk', hargaBibit: 2200000, hargaJual: 9500000, hasilTelur: 'Telur Basilisk 🥚', hasilDaging: 'Kulit Basilisk 👜', exp: 480, tipe: 'all', evolusi: 2, desc: 'Ular legenda dengan tatapan yang dipercaya mematikan.' },
'cockatrice': { emoji: '🐔', nama: 'Cockatrice', hargaBibit: 2300000, hargaJual: 10000000, hasilTelur: 'Telur Cockatrice 🥚', hasilDaging: 'Bulu Cockatrice 🪶', exp: 500, tipe: 'all', evolusi: 2, desc: 'Makhluk gabungan ayam dan reptil dengan kemampuan berbahaya.' },
'ouroboros': { emoji: '🐍', nama: 'Ouroboros', hargaBibit: 2400000, hargaJual: 10500000, hasilTelur: 'Telur Ouroboros 🥚', hasilDaging: 'Kulit Ouroboros 👜', exp: 520, tipe: 'all', evolusi: 2, desc: 'Ular abadi yang digambarkan membentuk lingkaran tanpa akhir.' },
'astaroth': { emoji: '🐉', nama: 'Astaroth', hargaBibit: 2500000, hargaJual: 11000000, hasilTelur: 'Telur Astaroth 🥚', hasilDaging: 'Sisik Astaroth 🐉', exp: 540, tipe: 'all', evolusi: 2, desc: 'Makhluk mistis bersisik dengan aura yang sangat kuat.' },
'wyrm_ancient': { emoji: '🐉', nama: 'Ancient Wyrm', hargaBibit: 2600000, hargaJual: 11500000, hasilTelur: 'Telur Ancient Wyrm 🥚', hasilDaging: 'Sisik Wyrm 🐉', exp: 560, tipe: 'all', evolusi: 2, desc: 'Naga purba yang telah hidup selama ribuan tahun.' },
'dragon_ice': { emoji: '🐉', nama: 'Dragon Ice', hargaBibit: 2700000, hargaJual: 12000000, hasilTelur: 'Telur Dragon Ice 🥚', hasilDaging: 'Sisik Es 🧊', exp: 580, tipe: 'all', evolusi: 2, desc: 'Naga es yang mampu membekukan area di sekitarnya.' },
'dragon_fire': { emoji: '🐉', nama: 'Dragon Fire', hargaBibit: 2800000, hargaJual: 12500000, hasilTelur: 'Telur Dragon Fire 🥚', hasilDaging: 'Sisik Api 🔥', exp: 600, tipe: 'all', evolusi: 2, desc: 'Naga api yang menyemburkan panas dari dalam tubuhnya.' },
'dragon_storm': { emoji: '🐉', nama: 'Dragon Storm', hargaBibit: 2900000, hargaJual: 13000000, hasilTelur: 'Telur Dragon Storm 🥚', hasilDaging: 'Sisik Badai 🌪️', exp: 620, tipe: 'all', evolusi: 2, desc: 'Naga badai yang mampu mengendalikan angin dan petir.' },
'dragon_shadow': { emoji: '🐉', nama: 'Dragon Shadow', hargaBibit: 3000000, hargaJual: 13500000, hasilTelur: 'Telur Dragon Shadow 🥚', hasilDaging: 'Sisik Bayangan 🌑', exp: 640, tipe: 'all', evolusi: 2, desc: 'Naga gelap yang mampu menyatu dengan bayangan.' },
'dragon_light': { emoji: '🐉', nama: 'Dragon Light', hargaBibit: 3100000, hargaJual: 14000000, hasilTelur: 'Telur Dragon Light 🥚', hasilDaging: 'Sisik Cahaya ✨', exp: 660, tipe: 'all', evolusi: 2, desc: 'Naga cahaya dengan tubuh yang memancarkan energi suci.' },
'astral_dragon': { emoji: '🐉', nama: 'Astral Dragon', hargaBibit: 3200000, hargaJual: 14500000, hasilTelur: 'Telur Astral Dragon 🥚', hasilDaging: 'Sisik Astral ✨', exp: 680, tipe: 'all', evolusi: 2, desc: 'Naga kosmik yang berasal dari wilayah antarbintang.' },
'void_dragon': { emoji: '🐉', nama: 'Void Dragon', hargaBibit: 3300000, hargaJual: 15000000, hasilTelur: 'Telur Void Dragon 🥚', hasilDaging: 'Sisik Void 🌑', exp: 700, tipe: 'all', evolusi: 2, desc: 'Naga kehampaan dengan kekuatan yang sulit dijelaskan.' },
'celestial_beast': { emoji: '🦁', nama: 'Celestial Beast', hargaBibit: 3400000, hargaJual: 15500000, hasilTelur: 'Telur Celestial 🥚', hasilDaging: 'Bulu Celestial 🪶', exp: 720, tipe: 'all', evolusi: 2, desc: 'Makhluk langit yang memiliki energi bercahaya.' },
'divine_wolf': { emoji: '🐺', nama: 'Divine Wolf', hargaBibit: 3500000, hargaJual: 16000000, hasilTelur: 'Telur Divine Wolf 🥚', hasilDaging: 'Taring Divine 🦷', exp: 740, tipe: 'all', evolusi: 2, desc: 'Serigala suci dengan kekuatan yang melampaui hewan biasa.' },
'world_serpent': { emoji: '🐍', nama: 'World Serpent', hargaBibit: 3600000, hargaJual: 16500000, hasilTelur: 'Telur World Serpent 🥚', hasilDaging: 'Kulit Serpent 👜', exp: 760, tipe: 'all', evolusi: 2, desc: 'Ular raksasa yang dipercaya memiliki ukuran seukuran dunia.' },
'elder_dragon': { emoji: '🐉', nama: 'Elder Dragon', hargaBibit: 3700000, hargaJual: 17000000, hasilTelur: 'Telur Elder Dragon 🥚', hasilDaging: 'Sisik Elder 🐉', exp: 780, tipe: 'all', evolusi: 2, desc: 'Naga kuno yang telah menguasai kekuatan elemen selama berabad-abad.' },
'primordial': { emoji: '🐉', nama: 'Primordial', hargaBibit: 3800000, hargaJual: 17500000, hasilTelur: 'Telur Primordial 🥚', hasilDaging: 'Sisik Primordial 🐉', exp: 800, tipe: 'all', evolusi: 2, desc: 'Makhluk purba yang dipercaya muncul sebelum dunia terbentuk.' },
'cosmic_dragon': { emoji: '🐉', nama: 'Cosmic Dragon', hargaBibit: 3900000, hargaJual: 18000000, hasilTelur: 'Telur Cosmic Dragon 🥚', hasilDaging: 'Sisik Kosmik ✨', exp: 820, tipe: 'all', evolusi: 2, desc: 'Naga kosmik dengan energi yang berasal dari bintang.' },
'god_beast': { emoji: '🦁', nama: 'God Beast', hargaBibit: 4000000, hargaJual: 19000000, hasilTelur: 'Telur God Beast 🥚', hasilDaging: 'Bulu God Beast 🪶', exp: 850, tipe: 'all', evolusi: 2, desc: 'Makhluk ilahi yang memiliki kekuatan jauh di atas legenda biasa.' },
'world_eater': { emoji: '🐉', nama: 'World Eater', hargaBibit: 4200000, hargaJual: 20000000, hasilTelur: 'Telur World Eater 🥚', hasilDaging: 'Sisik World Eater 🐉', exp: 880, tipe: 'all', evolusi: 2, desc: 'Monster kolosal yang dikenal mampu melahap apa pun.' },
'eternal_dragon': { emoji: '🐉', nama: 'Eternal Dragon', hargaBibit: 4400000, hargaJual: 22000000, hasilTelur: 'Telur Eternal Dragon 🥚', hasilDaging: 'Sisik Eternal 🐉', exp: 920, tipe: 'all', evolusi: 2, desc: 'Naga abadi yang tidak mengenal usia maupun kematian.' },
'chaos_beast': { emoji: '🐲', nama: 'Chaos Beast', hargaBibit: 4600000, hargaJual: 24000000, hasilTelur: 'Telur Chaos Beast 🥚', hasilDaging: 'Sisik Chaos 🐉', exp: 960, tipe: 'all', evolusi: 2, desc: 'Makhluk kekacauan dengan bentuk dan kekuatan yang tidak stabil.' },
'apocalypse_beast': { emoji: '🐉', nama: 'Apocalypse Beast', hargaBibit: 4800000, hargaJual: 26000000, hasilTelur: 'Telur Apocalypse 🥚', hasilDaging: 'Sisik Apocalypse 🐉', exp: 1000, tipe: 'all', evolusi: 2, desc: 'Makhluk penghancur yang dikaitkan dengan akhir zaman.' },
'origin_beast': { emoji: '🐉', nama: 'Origin Beast', hargaBibit: 5000000, hargaJual: 30000000, hasilTelur: 'Telur Origin Beast 🥚', hasilDaging: 'Sisik Origin 🐉', exp: 1100, tipe: 'all', evolusi: 2, desc: 'Makhluk primordial yang menjadi sumber kehidupan legenda.' },
}

const emojiPattern = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu

export function normalizeHasilKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(emojiPattern, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function getHasilDisplay(value) {
  const key = normalizeHasilKey(value)
  for (const animal of Object.values(hewanList)) {
    for (const result of [animal.hasil, animal.hasilTelur, animal.hasilDaging]) {
      if (normalizeHasilKey(result) === key) {
        return { key, nama: result.replace(emojiPattern, '').trim(), emoji: result.match(emojiPattern)?.[0] || '📦', harga: animal.hargaJual }
      }
    }
  }
  return { key, nama: String(value || '').replace(emojiPattern, '').trim(), emoji: '📦', harga: 1000 }
}

export function isHasilTernakKey(value) {
  const key = normalizeHasilKey(value)
  return Object.values(hewanList).some(animal => [animal.hasil, animal.hasilTelur, animal.hasilDaging].some(result => normalizeHasilKey(result) === key))
}

export function getMaterialCount(user, material) {
  const key = normalizeHasilKey(material)
  const stores = [user.ores, user.inventory, user.items, user]
  return stores.reduce((total, store) => {
    if (!store) return total
    return total + Object.entries(store).reduce((subtotal, [rawKey, amount]) => {
      const itemKey = normalizeHasilKey(rawKey)
      const matches = itemKey === key || (key === 'kulit' && itemKey.startsWith('kulit_')) || (key === 'sisik' && itemKey.startsWith('sisik_'))
      return subtotal + (matches ? Number(amount || 0) : 0)
    }, 0)
  }, 0)
}

export function consumeMaterial(user, material, amount) {
  const key = normalizeHasilKey(material)
  let remaining = amount
  for (const store of [user.ores, user.inventory, user.items, user]) {
    if (!store || remaining <= 0) continue
    for (const rawKey of Object.keys(store)) {
      const itemKey = normalizeHasilKey(rawKey)
      const matches = itemKey === key || (key === 'kulit' && itemKey.startsWith('kulit_')) || (key === 'sisik' && itemKey.startsWith('sisik_'))
      if (!matches || !Number(store[rawKey])) continue
      const used = Math.min(Number(store[rawKey]), remaining)
      store[rawKey] -= used
      remaining -= used
      if (store[rawKey] <= 0) delete store[rawKey]
      if (remaining <= 0) break
    }
  }
  return remaining === 0
}

export function addMaterial(user, material, amount, store = 'items') {
  user[store] = user[store] || {}
  const key = normalizeHasilKey(material)
  user[store][key] = (user[store][key] || 0) + Number(amount || 0)
  return key
}

export function migrateHasilTernakInventory(inventory = {}) {
  const migrated = {}
  let changed = false
  for (const [rawKey, rawAmount] of Object.entries(inventory)) {
    const display = getHasilDisplay(rawKey)
    const key = display.key || normalizeHasilKey(rawKey)
    migrated[key] = (migrated[key] || 0) + Number(rawAmount || 0)
    if (key !== rawKey) changed = true
  }
  return { inventory: migrated, changed }
}

let hybridDatabaseCache = null
function getHybridDB() {
  if(hybridDatabaseCache) return hybridDatabaseCache
  loadDB()
  if(!global.db.data.hybridDatabase) global.db.data.hybridDatabase = {}
  hybridDatabaseCache = global.db.data.hybridDatabase
  return hybridDatabaseCache
}

function saveHybridDB() {
  loadDB()
  global.db.data.hybridDatabase = hybridDatabaseCache
  saveDB()
}

function mixNama(n1, n2) {
  let p1 = n1.slice(0, Math.ceil(n1.length/2))
  let p2 = n2.slice(Math.floor(n2.length/2))
  return (p1 + p2).charAt(0).toUpperCase() + (p1 + p2).slice(1).toLowerCase()
}

function generateHybrid(h1, h2, evo) {
  let id = (h1.nama + '_' + h2.nama + '_' + evo).toLowerCase().replace(/\s/g,'_')
  let nama = mixNama(h1.nama, h2.nama)
  let baseJual = (h1.hargaJual + h2.hargaJual)
  let baseExp = (h1.exp + h2.exp)
  return {
    id,
    emoji: h1.emoji,
    nama,
    hargaBibit: 0,
    hargaJual: Math.floor(baseJual * 1.5 * (evo + 1)),
    hasilTelur: `Telur ${nama}`,
    hasilDaging: `Daging ${nama}`,
    hasil: `Hasil ${nama}`,
    exp: Math.floor(baseExp * (evo + 1) * 1.2),
    tipe: 'all',
    evolusi: evo
  }
}

export function prosesKawin(id1, id2) {
  let hybridDatabase = getHybridDB()
  let h1 = getHewan(id1)
  let h2 = getHewan(id2)
  if(!h1 ||!h2) return null
  if(h1.nama.toLowerCase() === h2.nama.toLowerCase()) return { hasil: h1.nama.toLowerCase(), baru: false, data: h1 }

  let evoBaru = Math.min(Math.max(h1.evolusi, h2.evolusi) + 1, 7)
  let idHybrid = [h1.nama.toLowerCase(), h2.nama.toLowerCase(), evoBaru].sort().join('_')

  let baru = false
  if(!hybridDatabase[idHybrid]) {
    hybridDatabase[idHybrid] = generateHybrid(h1, h2, evoBaru)
    baru = true
    saveHybridDB()
  }
  return { hasil: idHybrid, baru, data: hybridDatabase[idHybrid] }
}

export function dapatkanHasil(h) {
  if(h.tipe === 'all') return { ambil: normalizeHasilKey(h.hasilTelur || h.hasil), sembelih: normalizeHasilKey(h.hasilDaging || h.hasil) }
  return { ambil: normalizeHasilKey(h.hasil), sembelih: normalizeHasilKey(h.hasil) }
}

export function hitungBiayaKawin(h1, h2) {
  let e = Math.max(h1.evolusi, h2.evolusi)
  if(e === 0) return 10000
  if(e === 1) return 100000
  if(e === 2) return 500000
  return 2000000
}

export function hitungBiayaObat(h1, h2) {
  return hitungBiayaKawin(h1, h2) * 8
}

export function peluangGagal(h1, h2) {
  if(h1.evolusi === h2.evolusi) return 0.1
  if(h1.evolusi >= 3 || h2.evolusi >= 3) return 0.6
  return 0.4
}

export function listHybrid() {
  let hybridDatabase = getHybridDB()
  if (Object.keys(hybridDatabase).length === 0)
    return `╭─❏「 🧬 HYBRID KOSONG 」❏\n` +
      `│ 📋 *Belum ada hybrid yang ditemukan.*\n` +
      `╰─━━━━━━━━━━━━━━─`
  let txt = `╭─❏「 🧬 DAFTAR HYBRID 」❏\n`
  txt += `│ 📋 *Hybrid yg berhasil ditemukan.*\n`
  txt += `╰─━━━━━━━━━━━━━━─\n\n`
  for (let k in hybridDatabase) {
    let h = hybridDatabase[k]
    txt += `🧬 *${h.nama} ${h.emoji}*\n`
    txt += `> ↳ Evolusi : E${h.evolusi}\n\n`
  }
  txt += `📦 *Total Hybrid* : ${Object.keys(hybridDatabase).length}`
  txt += `\n\n─━━━━━━━━━━━━━━─`
  return txt
}

export function getHewan(id) {
  if (!id) return null
  let hybridDatabase = getHybridDB()
  id = id.toLowerCase().trim()
  if (hewanList[id]) return hewanList[id]
  if (hybridDatabase[id]) return hybridDatabase[id]
  for (let key in hybridDatabase) {
    let h = hybridDatabase[key]
    if (h && (h.nama.toLowerCase() === id || h.id?.toLowerCase() === id)) {
      return h
    }
  }
  return null
}

export function getHewanKey(id) {
  if (!id) return null
  const input = id.toLowerCase().trim()
  if (hewanList[input]) return input
  for (const key in hewanList) {
    const animal = hewanList[key]
    if (animal.nama.toLowerCase() === input) return key
  }
  const hybridDatabase = getHybridDB()
  if (hybridDatabase[input]) return input
  for (const key in hybridDatabase) {
    const hybrid = hybridDatabase[key]
    if (hybrid && (hybrid.nama.toLowerCase() === input || hybrid.id?.toLowerCase() === input)) return key
  }
  return null
}