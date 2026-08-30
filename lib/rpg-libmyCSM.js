// DATABASE DEVIL HUNTER RPG

const CSM_PICTURES = {
  about: 'https://c.termai.cc/i115/MmH7Id.jpg',
  familyBurger: 'https://c.termai.cc/i149/AsMzEe0.jpg',
  bombDevil: 'https://c.termai.cc/i165/su8.png',
  congratulations: 'https://c.termai.cc/i128/0cQgT0.jpg',
  contract: 'https://c.termai.cc/i109/9ptxUPT.jpg',
  graveyard: 'https://c.termai.cc/i192/sUzzX1N.jpg',
  city: ['https://c.termai.cc/i110/6zbp8Y.jpg', 'https://c.termai.cc/i176/b8iNVWf.jpg'],
  makimaHell: 'https://c.termai.cc/i115/fHQeLKD.jpg',
  hotelMorin: 'https://c.termai.cc/i111/QAMvK.jpg',
  cafe: 'https://c.termai.cc/i103/szWpjk.jpg',
  rezeDenjiCafe: 'https://c.termai.cc/i146/owm4K.jpg',
  rezeCafe: ['https://c.termai.cc/i107/pNvuJ.png', 'https://c.termai.cc/i171/CfN.png'],
  rezePhonebooth: 'https://c.termai.cc/i124/oAZ0iv.png',
  denjiPhonebooth: 'https://c.termai.cc/i163/NTF8MO7.jpg',
  publicSafety: 'https://c.termai.cc/i163/ppc2R.jpg',
  contractScene: 'https://c.termai.cc/i128/XspE4x.jpg',
  chainsawDevil: 'https://c.termai.cc/i149/kUzyv0i.jpg',
  katanaMan: 'https://c.termai.cc/i176/Yuws.jpg',
  partner: [
    'https://c.termai.cc/i181/GdjDdQL.jpg', 'https://c.termai.cc/i175/2LY.jpg',
    'https://c.termai.cc/i101/C44h5Y.jpg', 'https://c.termai.cc/i145/epH.jpg',
    'https://c.termai.cc/i143/NKqdf.jpg', 'https://c.termai.cc/i123/sYm.jpg',
    'https://c.termai.cc/i122/uYTZt.jpg', 'https://c.termai.cc/i108/ldIt7gg.jpg',
    'https://c.termai.cc/i186/DzE.jpg', 'https://c.termai.cc/i160/YQse.jpg',
    'https://c.termai.cc/i121/ulCHj.jpg', 'https://c.termai.cc/i111/eV4I8Zj.jpg',
    'https://c.termai.cc/i168/MMXu.jpg', 'https://c.termai.cc/i142/pDJ.jpeg',
    'https://c.termai.cc/i165/MFRn.jpeg'
  ],
  exclusive: [
    'https://c.termai.cc/i148/HLuH0br.jpg', 'https://c.termai.cc/i175/LhsvJu.jpg',
    'https://c.termai.cc/i190/vqX.jpg', 'https://c.termai.cc/i171/dNxjsb.jpg',
    'https://c.termai.cc/i196/YXc.jpg'
  ]
}

const EXCLUSIVE_PICTURES = [
  ['Reze, Makima, dan Power', CSM_PICTURES.exclusive[0]],
  ['Four Horsemen', CSM_PICTURES.exclusive[1]],
  ['Partner Portrait', CSM_PICTURES.exclusive[2]],
  ['Reze Arc Wallpaper', CSM_PICTURES.exclusive[3]],
  ['Full Character', CSM_PICTURES.exclusive[4]]
]
const PARTNER_PICTURES = [
  ['Partner Apartment', CSM_PICTURES.partner[0]],
  ['Partner Bakery', CSM_PICTURES.partner[1]],
  ['Partner School 1', CSM_PICTURES.partner[2]],
  ['Partner Girls 1', CSM_PICTURES.partner[3]],
  ['Main Partner 1', CSM_PICTURES.partner[4]],
  ['Partner Girls 2', CSM_PICTURES.partner[5]],
  ['Main Partner 2', CSM_PICTURES.partner[6]],
  ['Main Partner 3', CSM_PICTURES.partner[7]],
  ['Mainside Partner', CSM_PICTURES.partner[8]],
  ['Partner School 2', CSM_PICTURES.partner[9]],
  ['Partner Daily', CSM_PICTURES.partner[10]],
  ['Partner Bar', CSM_PICTURES.partner[11]],
  ['Main Partner 4', CSM_PICTURES.partner[12]],
  ['Partner Ladies', CSM_PICTURES.partner[13]],
  ['Partner Dinner', CSM_PICTURES.partner[14]]
]

const GALLERY_PICTURES = [
  ['Chainsaw Man', CSM_PICTURES.about],
  ['Family Burger', CSM_PICTURES.familyBurger],
  ['Bomb Devil', CSM_PICTURES.bombDevil],
  ['Congratulations', CSM_PICTURES.congratulations],
  ['Devil Contract', CSM_PICTURES.contract],
  ['Graveyard', CSM_PICTURES.graveyard],
  ['City CloseUp', CSM_PICTURES.city[0]],
  ['City', CSM_PICTURES.city[1]],
  ['Makima Hell', CSM_PICTURES.makimaHell],
  ['Hotel Morin', CSM_PICTURES.hotelMorin],
  ['Kafe Crossroads', CSM_PICTURES.cafe],
  ['Reze Denji Cafe', CSM_PICTURES.rezeDenjiCafe],
  ['Reze Phonebooth', CSM_PICTURES.rezePhonebooth],
  ['Denji Phonebooth', CSM_PICTURES.denjiPhonebooth],
  ['Public Safety Headquarters', CSM_PICTURES.publicSafety],
  ['Contract Scene', CSM_PICTURES.contractScene],
  ['Chainsaw Devil', CSM_PICTURES.chainsawDevil],
  ['Katana Man', CSM_PICTURES.katanaMan],
  ...EXCLUSIVE_PICTURES,
  ...PARTNER_PICTURES,
  ['Reze Cafe Smile', CSM_PICTURES.rezeCafe[0]],
  ['Reze Cafe Funny', CSM_PICTURES.rezeCafe[1]]
]

const DEVIL_LIST = [
  // ==========================================
  // === RANK E - KETAKUTAN HARIAN & SEPELE ===
  // ==========================================
  { nama: 'Crumb Fiend', rank: 'E', tipe: 'Fiend', hp: 36, dmg: 6, exp: 11, blood: 65, emoji: '🍪', runBlood: 5, desc: 'Rasa tidak nyaman menginjak remahan makanan kering di atas lantai kasur berselimut.' },
  { nama: 'Lint Devil', rank: 'E', tipe: 'Devil', hp: 37, dmg: 6, exp: 12, blood: 68, emoji: '🧶', runBlood: 5, desc: 'Gumpalan serat mengganggu yang terus menempel dan mengotori pakaian formal.' },
  { nama: 'Dandelion Fiend', rank: 'E', tipe: 'Fiend', hp: 37, dmg: 6, exp: 11, blood: 66, emoji: '🌼', runBlood: 5, desc: 'Penyebaran benih beterbangan yang memicu reaksi asma mendadak bagi anak-anak kecil.' },
  { nama: 'Feather Fiend', rank: 'E', tipe: 'Fiend', hp: 38, dmg: 7, exp: 14, blood: 72, emoji: '🪶', runBlood: 5, desc: 'Sensasi geli berlebihan serta alergi pernapasan akibat pertikel halus yang beterbangan bebas.' },
  { nama: 'Chicken Devil', rank: 'E', tipe: 'Devil', hp: 35, dmg: 8, exp: 15, blood: 70, emoji: '🐔', runBlood: 5, desc: 'Lahir akibat fobia terhadap patukan paruh tajam unggas dan gerakan kepala serangga yang mendadak.' },
  { nama: 'Stain Devil', rank: 'E', tipe: 'Devil', hp: 43, dmg: 8, exp: 16, blood: 78, emoji: '🪣', runBlood: 5, desc: 'Kecemasan akan noda permanen pada pakaian bersih yang merusak penampilan di depan umum.' },
  { nama: 'Chalk Devil', rank: 'E', tipe: 'Devil', hp: 40, dmg: 8, exp: 15, blood: 75, emoji: '🖍️', runBlood: 5, desc: 'Suara decitan memilukan pada papan tulis yang memberikan sensasi ngilu luar biasa pada gigi.' },
  { nama: 'Louse Fiend', rank: 'E', tipe: 'Fiend', hp: 44, dmg: 9, exp: 17, blood: 82, emoji: '🪲', runBlood: 5, desc: 'Rasa gatal di kulit kepala yang sulit dihilangkan membentuk paranoian kecil tentang parasit perkotaan.' },
  { nama: 'Pollen Fiend', rank: 'E', tipe: 'Fiend', hp: 42, dmg: 9, exp: 17, blood: 81, emoji: '🌸', runBlood: 5, desc: 'Penderitaan fisik dari reaksi alergi berat yang menghambat pernapasan di musim semi.' },
  { nama: 'Snot Fiend', rank: 'E', tipe: 'Fiend', hp: 39, dmg: 7, exp: 13, blood: 70, emoji: '🤧', runBlood: 5, desc: 'Rasa jijik atas lendir tubuh berlebih yang melambangkan kondisi fisik tidak sehat.' },
  { nama: 'Sweat Devil', rank: 'E', tipe: 'Devil', hp: 44, dmg: 9, exp: 18, blood: 83, emoji: '💦', runBlood: 8, desc: 'Kecemasan akan bau badan berlebih dan rasa lengket tak nyaman saat berada di keramaian.' },
  { nama: 'Bubble Devil', rank: 'E', tipe: 'Devil', hp: 43, dmg: 9, exp: 17, blood: 81, emoji: '🫧', runBlood: 6, desc: 'Pedih mendadak saat busa sabun memecah dan mengenai selaput mata secara langsung.' },
  { nama: 'Pigeon Fiend', rank: 'E', tipe: 'Fiend', hp: 44, dmg: 9, exp: 18, blood: 84, emoji: '🐦', runBlood: 6, desc: 'Ketakutan kotoran burung jatuh dari udara serta penyakit parasit dari kepakan sayap liar.' },
  { nama: 'Tomato Devil', rank: 'E', tipe: 'Devil', hp: 40, dmg: 10, exp: 20, blood: 80, emoji: '🍅', runBlood: 10, desc: 'Perwujudan ketakutan manusia terhadap tekstur lembek buah berair serta rasa geli dari biji lengketnya.' },
  { nama: 'Moth Devil', rank: 'E', tipe: 'Devil', hp: 42, dmg: 10, exp: 18, blood: 85, emoji: '🦋', runBlood: 8, desc: 'Gerakan liar yang terbang tidak menentu menuju cahaya memicu panik singkat saat berada di kamar tidur.' },
  { nama: 'Paper Fiend', rank: 'E', tipe: 'Fiend', hp: 41, dmg: 10, exp: 19, blood: 80, emoji: '📄', runBlood: 8, desc: 'Rasa perih mengejutkan dari tergores pinggiran kertas tipis secara tidak sengaja.' },
  { nama: 'Onion Devil', rank: 'E', tipe: 'Devil', hp: 45, dmg: 10, exp: 20, blood: 86, emoji: '🧅', runBlood: 8, desc: 'Pedih di mata yang tak tertahankan akibat uap pemotongan bahan makanan dapur.' },
  { nama: 'Sponge Fiend', rank: 'E', tipe: 'Fiend', hp: 46, dmg: 10, exp: 20, blood: 91, emoji: '🧽', runBlood: 8, desc: 'Rasa jijik memegang spons basah berbau yang menyimpan jutaan kuman tersembunyi.' },
  { nama: 'Cicada Fiend', rank: 'E', tipe: 'Fiend', hp: 49, dmg: 10, exp: 21, blood: 92, emoji: '🪲', runBlood: 8, desc: 'Dengungan nyaring tak berhenti di musim panas yang berpotensi merusak ketenangan pikiran.' },
  { nama: 'Fly Fiend', rank: 'E', tipe: 'Fiend', hp: 45, dmg: 11, exp: 22, blood: 90, emoji: '🪰', runBlood: 10, desc: 'Mayat manusia yang dikuasai oleh rasa jijik mendalam terhadap kecerobohan serangga pengerumun bangkai.' },
  { nama: 'Worm Fiend', rank: 'E', tipe: 'Fiend', hp: 48, dmg: 11, exp: 21, blood: 95, emoji: '🪱', runBlood: 8, desc: 'Sensasi geli dan jijik saat melihat tubuh licin tanpa mata meliuk-liuk di dalam tanah lumpur.' },
  { nama: 'Puddle Fiend', rank: 'E', tipe: 'Fiend', hp: 51, dmg: 11, exp: 22, blood: 98, emoji: '🌊', runBlood: 10, desc: 'Ketakutan menginjak genangan air kotor yang menyembunyikan lubang dalam di trotoar jalan raya.' },
  { nama: 'Cricket Devil', rank: 'E', tipe: 'Devil', hp: 49, dmg: 11, exp: 22, blood: 94, emoji: '🦗', runBlood: 8, desc: 'Suara nyaring konsisten di tengah kegelapan yang mengganggu kenyamanan tidur manusia.' },
  { nama: 'Garlic Fiend', rank: 'E', tipe: 'Fiend', hp: 47, dmg: 11, exp: 21, blood: 89, emoji: '🧄', runBlood: 8, desc: 'Bau menyengat permanen yang dianggap mengganggu interaksi sosial di masyarakat.' },
  { nama: 'Ash Fiend', rank: 'E', tipe: 'Fiend', hp: 50, dmg: 11, exp: 23, blood: 96, emoji: '💨', runBlood: 10, desc: 'Debu sisa pembakaran yang mengotori penglihatan dan mengotori pernapasan secara halus.' },
  { nama: 'Rustle Devil', rank: 'E', tipe: 'Devil', hp: 48, dmg: 11, exp: 22, blood: 93, emoji: '🍃', runBlood: 8, desc: 'Suara gesekan dedaunan di luar jendela yang memicu ilusi adanya sosok pengintai.' },
  { nama: 'Gecko Devil', rank: 'E', tipe: 'Devil', hp: 50, dmg: 11, exp: 23, blood: 99, emoji: '🦎', runBlood: 8, desc: 'Reptil dinding yang dapat memutuskan ekornya sendiri, memicu kebingungan psikologis bagi pemula.' },
  { nama: 'Pillbug Fiend', rank: 'E', tipe: 'Fiend', hp: 50, dmg: 12, exp: 25, blood: 100, emoji: '🐛', runBlood: 15, desc: 'Inang bernyawa yang mencerminkan rasa geli manusia ketika melihat makhluk melingkar di kegelapan.' },
  { nama: 'Slug Devil', rank: 'E', tipe: 'Devil', hp: 58, dmg: 12, exp: 27, blood: 115, emoji: '🐌', runBlood: 10, desc: 'Jejak lendir basah yang ditinggalkan di tempat bersih menimbulkan fobia akan kontaminasi zat lengket.' },
  { nama: 'Ant Fiend', rank: 'E', tipe: 'Fiend', hp: 46, dmg: 12, exp: 20, blood: 92, emoji: '🐜', runBlood: 5, desc: 'Gigitan kecil berkelompok yang menjalar di atas kulit menciptakan teror serangga berukuran mikroskopis.' },
  { nama: 'Static Devil', rank: 'E', tipe: 'Devil', hp: 47, dmg: 12, exp: 23, blood: 88, emoji: '⚡', runBlood: 10, desc: 'Kejutan sengatan listrik kecil saat menyentuh gagang pintu menciptakan ketakutan kecelakaan tak terduga.' },
  { nama: 'Weed Devil', rank: 'E', tipe: 'Devil', hp: 56, dmg: 12, exp: 25, blood: 109, emoji: '🌿', runBlood: 10, desc: 'Tanaman berduri yang merusak kerapian taman dan merobek kulit bagi siapa pun yang menyentuhnya.' },
  { nama: 'Cough Fiend', rank: 'E', tipe: 'Fiend', hp: 51, dmg: 12, exp: 24, blood: 97, emoji: '🗣️', runBlood: 10, desc: 'Refleks dorongan paru-paru yang mengganggu saat mencoba bertahan di situasi tenang.' },
  { nama: 'Burr Fiend', rank: 'E', tipe: 'Fiend', hp: 52, dmg: 12, exp: 24, blood: 101, emoji: '🌾', runBlood: 10, desc: 'Biji tanaman berduri yang menempel rapat dan menembus celana kain saat berjalan di padang rumput.' },
  { nama: 'Mud Devil', rank: 'E', tipe: 'Devil', hp: 56, dmg: 12, exp: 26, blood: 107, emoji: '🪨', runBlood: 10, desc: 'Lumpur pekat licin yang menarik kaki ke bawah dan mengotori pakaian bersih dengan noda membandel.' },
  { nama: 'Caterpillar Fiend', rank: 'E', tipe: 'Fiend', hp: 55, dmg: 13, exp: 26, blood: 110, emoji: '🐛', runBlood: 10, desc: 'Ancaman bulu beracun yang merangsang rasa gatal ekstrem memicu ketakutan bawaan manusia sejak kecil.' },
  { nama: 'Dust Devil', rank: 'E', tipe: 'Devil', hp: 50, dmg: 13, exp: 24, blood: 100, emoji: '🧹', runBlood: 15, desc: 'Ketakutan bersin berulang dan sesak napas ringan dari akumulasi kotoran tersembunyi di ruangan.' },
  { nama: 'Lizard Fiend', rank: 'E', tipe: 'Fiend', hp: 54, dmg: 13, exp: 26, blood: 106, emoji: '🦎', runBlood: 10, desc: 'Gerakan merayap cepat di langit-langit kamar yang memicu rasa was-was jatuhnya reptil ke wajah.' },
  { nama: 'Earwig Fiend', rank: 'E', tipe: 'Fiend', hp: 53, dmg: 13, exp: 25, blood: 103, emoji: '🪳', runBlood: 10, desc: 'Mitos serangga yang masuk melata ke dalam lubang telinga saat tidur memicu paranoia mendalam.' },
  { nama: 'Clam Devil', rank: 'E', tipe: 'Devil', hp: 60, dmg: 13, exp: 27, blood: 117, emoji: '🦪', runBlood: 10, desc: 'Jepitan cangkang keras yang kuat saat tangan mencoba memegang organisme pantai.' },
  { nama: 'Mosquito Devil', rank: 'E', tipe: 'Devil', hp: 52, dmg: 14, exp: 28, blood: 105, emoji: '🦟', runBlood: 12, desc: 'Manifestasi dari kecemasan akan gigitan gatal tak terlihat dan dengungan bising di telinga malam hari.' },
  { nama: 'Flea Devil', rank: 'E', tipe: 'Devil', hp: 53, dmg: 14, exp: 29, blood: 108, emoji: '🦗', runBlood: 10, desc: 'Loncatannya yang terlalu cepat untuk ditangkap tangan memicu frustrasi dan rasa geli di seluruh tubuh.' },
  { nama: 'Toad Devil', rank: 'E', tipe: 'Devil', hp: 57, dmg: 14, exp: 28, blood: 112, emoji: '🐸', runBlood: 12, desc: 'Tekstur kulit berbintik basah dan lompatan acak yang memicu kepanikan ringan saat malam hari.' },
  { nama: 'Wax Devil', rank: 'E', tipe: 'Devil', hp: 58, dmg: 14, exp: 28, blood: 113, emoji: '🕯️', runBlood: 12, desc: 'Rasa panas membakar dari tetesan cairan lilin mendidih yang mengenai permukaan kulit.' },
  { nama: 'Barnacle Fiend', rank: 'E', tipe: 'Fiend', hp: 58, dmg: 14, exp: 28, blood: 114, emoji: '🐚', runBlood: 10, desc: 'Kerumunan Cangkang tajam di dermaga kayu yang menyayat kulit kaki dengan mudah.' },
  { nama: 'Cockroach Devil', rank: 'E', tipe: 'Devil', hp: 60, dmg: 15, exp: 30, blood: 120, emoji: '🪳', runBlood: 10, desc: 'Kemunculan serangga berbau menyengat dari celah kotor melahirkan ketakutan refleksif pada pemukiman.' },
  { nama: 'Mold Fiend', rank: 'E', tipe: 'Fiend', hp: 59, dmg: 15, exp: 31, blood: 118, emoji: '🍄', runBlood: 12, desc: 'Bercak hitam membusuk di dinding lembap mencerminkan kecemasan akan kerusakan tempat tinggal.' },
  { nama: 'Splinter Fiend', rank: 'E', tipe: 'Fiend', hp: 53, dmg: 15, exp: 29, blood: 104, emoji: '🪵', runBlood: 12, desc: 'Ketakutan tertusuk serpihan kayu halus yang masuk mendalam di bawah lapisan kuku jari.' },
  { nama: 'Grease Fiend', rank: 'E', tipe: 'Fiend', hp: 60, dmg: 15, exp: 30, blood: 119, emoji: '🧈', runBlood: 14, desc: 'Lapisan minyak tebal yang sulit dibersihkan pada telapak tangan menimbulkan ketakutan higienis.' },
  { nama: 'Leech Fiend', rank: 'E', tipe: 'Fiend', hp: 62, dmg: 16, exp: 32, blood: 125, emoji: '🪱', runBlood: 20, desc: 'Pengisapan darah secara diam-diam di dalam air keruh memicu fobia tubuh kehabisan cairan vital.' },
  { nama: 'Rust Devil', rank: 'E', tipe: 'Devil', hp: 64, dmg: 16, exp: 33, blood: 135, emoji: '⚙️', runBlood: 18, desc: 'Korosi pada logam tua memicu ketakutan terhadap racun besi karat yang memasuki luka terbuka.' },
  { nama: 'Beetle Fiend', rank: 'E', tipe: 'Fiend', hp: 62, dmg: 16, exp: 31, blood: 121, emoji: '🪲', runBlood: 12, desc: 'Cangkang keras bertanduk yang merayap di tempat tidur menciptakan fobia serangga berlapis baja.' },
  { nama: 'Garbage Fiend', rank: 'E', tipe: 'Fiend', hp: 68, dmg: 17, exp: 34, blood: 140, emoji: '🗑️', runBlood: 25, desc: 'Aroma pembusukan sampah rumah tangga melahirkan rasa mual akut dan ketakutan akan penyakit.' },
  { nama: 'Fishbone Devil', rank: 'E', tipe: 'Devil', hp: 59, dmg: 17, exp: 31, blood: 116, emoji: '🐟', runBlood: 15, desc: 'Sensasi tersangkutnya duri tajam di tenggorokan yang memicu rasa tercekik panik.' },
  { nama: 'Seaurchin Devil', rank: 'E', tipe: 'Devil', hp: 61, dmg: 17, exp: 30, blood: 120, emoji: '🪨', runBlood: 12, desc: 'Duri hitam tajam yang tidak sengaja terinjak saat berjalan di atas karang pantai.' },
  { nama: 'Coffee Devil', rank: 'E', tipe: 'Devil', hp: 65, dmg: 18, exp: 35, blood: 130, emoji: '☕', runBlood: 20, desc: 'Kecemasan para pekerja atas rasa pahit pekat serta ketakutan tersembunyi akan insomnia kronis.' },
  { nama: 'Scald Devil', rank: 'E', tipe: 'Devil', hp: 63, dmg: 18, exp: 33, blood: 126, emoji: '☕', runBlood: 16, desc: 'Sensasi terbakar mengejutkan akibat meminum cairan mendidih tanpa memeriksa suhunya terlebih dahulu.' },
  { nama: 'Jellyfish Fiend', rank: 'E', tipe: 'Fiend', hp: 65, dmg: 18, exp: 34, blood: 129, emoji: '🪼', runBlood: 16, desc: 'Sengatan tersembunyi dari benang transparan di dalam air laut yang melumpuhkan gerakan berenang.' },
  { nama: 'Needle Fiend', rank: 'E', tipe: 'Fiend', hp: 61, dmg: 19, exp: 36, blood: 122, emoji: '🪡', runBlood: 20, desc: 'Ketakutan masa kecil yang bertahan hingga dewasa terhadap rasa sakit tajam dari tusukan jarum jahit.' },
  { nama: 'Mantis Devil', rank: 'E', tipe: 'Devil', hp: 66, dmg: 19, exp: 35, blood: 132, emoji: '🦗', runBlood: 15, desc: 'Postur bertarung serangga pemangsa bertangan sabit yang memberikan kesan kejam tak terduga.' },
  { nama: 'Centipede Devil', rank: 'E', tipe: 'Devil', hp: 69, dmg: 20, exp: 37, blood: 138, emoji: '🐛', runBlood: 18, desc: 'Banyaknya kaki beracun yang bergerak bersamaan memicu rasa merinding luar biasa pada manusia.' },
  { nama: 'Wasp Fiend', rank: 'E', tipe: 'Fiend', hp: 67, dmg: 20, exp: 36, blood: 134, emoji: '🐝', runBlood: 15, desc: 'Sengatan agresif tanpa kehilangan sengatnya membuat serangga ini lebih ditakuti dibanding lebah madu.' },
  { nama: 'Hornet Devil', rank: 'E', tipe: 'Devil', hp: 70, dmg: 21, exp: 38, blood: 142, emoji: '🐝', runBlood: 18, desc: 'Ukuran besar dan racun mematikan dari tawon raksasa menciptakan kecemasan serangan fatal di alam terbuka.' },

  // ===============================================
  // === RANK D - TEROR PERKOTAAN, HEWAN, & MEDIS ===
  // ===============================================
  { nama: 'Rooster Devil', rank: 'D', tipe: 'Devil', hp: 70, dmg: 25, exp: 50, blood: 160, emoji: '🐓', runBlood: 10, desc: 'Ketakutan akan suara lengkingan tajam di subuh hari dan serangan tajam bertaji.' },
  { nama: 'Bunny Fiend', rank: 'D', tipe: 'Fiend', hp: 78, dmg: 22, exp: 58, blood: 190, emoji: '🐇', runBlood: 20, desc: 'Gigi pengerat tajam yang disembunyikan di balik penampilan polos tak berbahaya.' },
  { nama: 'Termite Devil', rank: 'D', tipe: 'Devil', hp: 82, dmg: 29, exp: 61, blood: 200, emoji: '🐜', runBlood: 5, desc: 'Kehancuran kayu tersembunyi yang meruntuhkan tempat perlindungan secara mendadak.' },
  { nama: 'Seagull Fiend', rank: 'D', tipe: 'Fiend', hp: 84, dmg: 27, exp: 62, blood: 210, emoji: '🦤', runBlood: 30, desc: 'Serangan kelompok pemakan bangkai pantai yang berebut makanan dengan agresif.' },
  { nama: 'Rat Devil', rank: 'D', tipe: 'Devil', hp: 75, dmg: 35, exp: 55, blood: 180, emoji: '🐀', runBlood: 20, desc: 'Koloni pengerat pembawa wabah kotor yang menggerogoti barang perkotaan di dalam selokan.' },
  { nama: 'Snail Fiend', rank: 'D', tipe: 'Fiend', hp: 95, dmg: 26, exp: 63, blood: 250, emoji: '🐌', runBlood: 0, desc: 'Parasit berbahaya yang bersembunyi dalam cangkang keras dan bergerak perlahan.' },
  { nama: 'Frog Fiend', rank: 'D', tipe: 'Fiend', hp: 86, dmg: 28, exp: 68, blood: 220, emoji: '🐸', runBlood: 25, desc: 'Amfibi dengan mata menonjol dan lidah meluncur cepat yang menangkap mangsa tanpa peringatan.' },
  { nama: 'Door Devil', rank: 'D', tipe: 'Devil', hp: 88, dmg: 30, exp: 68, blood: 230, emoji: '🚪', runBlood: 0, desc: 'Trauma psikologis atas sesuatu yang menakutkan atau rahasia kelam di balik pintu tertutup.' },
  { nama: 'Gecko Fiend', rank: 'D', tipe: 'Fiend', hp: 88, dmg: 30, exp: 65, blood: 220, emoji: '🦎', runBlood: 25, desc: 'Merayap vertikal tanpa suara untuk menyergap kepala manusia dari langit ruangan.' },
  { nama: 'Otter Fiend', rank: 'D', tipe: 'Fiend', hp: 89, dmg: 31, exp: 66, blood: 225, emoji: '🦦', runBlood: 30, desc: 'Kecepatan meluncur di dalam air keruh yang menyenggol kaki pejalan sungai.' },
  { nama: 'Owl Fiend', rank: 'D', tipe: 'Fiend', hp: 96, dmg: 31, exp: 78, blood: 250, emoji: '🦉', runBlood: 35, desc: 'Predator malam berkecepatan sunyi dengan pemutaran kepala tidak wajar yang mengawasi dalam gelap.' },
  { nama: 'Stork Fiend', rank: 'D', tipe: 'Fiend', hp: 93, dmg: 32, exp: 70, blood: 245, emoji: '🦩', runBlood: 25, desc: 'Paruh tajam memanjang yang sanggup menusuk organ vital dalam sekali tancap.' },
  { nama: 'Crow Devil', rank: 'D', tipe: 'Devil', hp: 95, dmg: 32, exp: 75, blood: 270, emoji: '🐦', runBlood: 25, desc: 'Burung pemakan bangkai yang diidentikkan dengan kabar kematian dan aura kesialan.' },
  { nama: 'Weasel Fiend', rank: 'D', tipe: 'Fiend', hp: 94, dmg: 33, exp: 72, blood: 230, emoji: '🦡', runBlood: 45, desc: 'Kelinsetan predator bertubuh ramping yang merayap di lorong sempit untuk mencuri mangsa.' },
  { nama: 'Chameleon Fiend', rank: 'D', tipe: 'Fiend', hp: 91, dmg: 33, exp: 71, blood: 240, emoji: '🦎', runBlood: 40, desc: 'Kemampuan berkamuflase sempurna yang memicu paranoia serangan tak terlihat.' },
  { nama: 'Locust Devil', rank: 'D', tipe: 'Devil', hp: 90, dmg: 33, exp: 67, blood: 230, emoji: '🦗', runBlood: 15, desc: 'Hama serangga perusak panen yang membawa kelaparan lokal pada pedesaan.' },
  { nama: 'Mole Fiend', rank: 'D', tipe: 'Fiend', hp: 98, dmg: 34, exp: 76, blood: 260, emoji: '🦦', runBlood: 20, desc: 'Ancaman penggali dari bawah tanah yang merusak fondasi tempat tinggal dan bersembunyi dalam gelap.' },
  { nama: 'Pelican Fiend', rank: 'D', tipe: 'Fiend', hp: 106, dmg: 34, exp: 76, blood: 280, emoji: '🦤', runBlood: 15, desc: 'Kantung paruh membesar yang mampu menelan bagian tubuh kecil secara bulat-bulat.' },
  { nama: 'Catfish Fiend', rank: 'D', tipe: 'Fiend', hp: 108, dmg: 34, exp: 77, blood: 290, emoji: '🐟', runBlood: 10, desc: 'Patil berduri tajam dan tubuh licin bersungut yang tak menyenangkan dicengkeram.' },
  { nama: 'Vulture Fiend', rank: 'D', tipe: 'Fiend', hp: 97, dmg: 35, exp: 75, blood: 255, emoji: '🦅', runBlood: 20, desc: 'Tatapan lapar burung pemakan daging yang menunggu kepunahan nyawa target.' },
  { nama: 'Cat Devil', rank: 'D', tipe: 'Devil', hp: 105, dmg: 36, exp: 85, blood: 310, emoji: '🐈', runBlood: 35, desc: 'Ketakutan dari cakaran mendadak dan takhayul nasib buruk dari hewan pemeliharaan ghaib.' },
  { nama: 'Beaver Fiend', rank: 'D', tipe: 'Fiend', hp: 107, dmg: 36, exp: 78, blood: 285, emoji: '🦫', runBlood: 10, desc: 'Gigi pengerat pemotong kayu yang sanggup memotong pembuluh darah dalam satu gigitan.' },
  { nama: 'Jellyfish Devil', rank: 'D', tipe: 'Devil', hp: 89, dmg: 36, exp: 69, blood: 235, emoji: '🪼', runBlood: 20, desc: 'Racun sengatan sengatan transparan yang memicu rasa terbakar mendalam.' },
  { nama: 'Chameleon Devil', rank: 'D', tipe: 'Devil', hp: 94, dmg: 36, exp: 73, blood: 245, emoji: '🦎', runBlood: 35, desc: 'Invisibility parsial yang mengejutkan korban dengan juluran lidah perekat.' },
  { nama: 'Pig Fiend', rank: 'D', tipe: 'Fiend', hp: 115, dmg: 37, exp: 82, blood: 310, emoji: '🐖', runBlood: 20, desc: 'Nafsu makan tak terbatas dan kebiasaan kotor yang mencerminkan rasa jijik atas kerakusan.' },
  { nama: 'Iguana Fiend', rank: 'D', tipe: 'Fiend', hp: 103, dmg: 37, exp: 80, blood: 270, emoji: '🦎', runBlood: 20, desc: 'Sabetan ekor keras dan cakar pemanjat yang meninggalkan luka dalam pada kulit.' },
  { nama: 'Anemone Fiend', rank: 'D', tipe: 'Fiend', hp: 100, dmg: 37, exp: 76, blood: 265, emoji: '🪸', runBlood: 10, desc: 'Tentakel beracun lembut yang menjebak dan menyengat kulit penjelajah pantai.' },
  { nama: 'Internet Devil', rank: 'D', tipe: 'Devil', hp: 85, dmg: 38, exp: 65, blood: 220, emoji: '📶', runBlood: 40, desc: 'Kecemasan era modern atas terputusnya koneksi sosial, hilangnya data penting, dan isolasi digital.' },
  { nama: 'Crab Fiend', rank: 'D', tipe: 'Fiend', hp: 114, dmg: 38, exp: 88, blood: 315, emoji: '🦀', runBlood: 0, desc: 'Monster bercangkang keras dengan jepitan tajam yang mampu mematahkan tulang jari manusia.' },
  { nama: 'Dog Devil', rank: 'D', tipe: 'Devil', hp: 110, dmg: 38, exp: 90, blood: 320, emoji: '🐕', runBlood: 40, desc: 'Ancaman gigitan rabies dan sergapan hewan liar berkecepatan tinggi di area minim penerangan.' },
  { nama: 'Badger Fiend', rank: 'D', tipe: 'Fiend', hp: 99, dmg: 38, exp: 74, blood: 260, emoji: '🦡', runBlood: 25, desc: 'Agresivitas alami predator liang yang tidak ragu menyerang musuh berukuran lebih besar.' },
  { nama: 'Goat Fiend', rank: 'D', tipe: 'Fiend', hp: 102, dmg: 39, exp: 79, blood: 280, emoji: '🐐', runBlood: 25, desc: 'Simbol okultisme kuno dengan pupil mata horizontal yang memicu ketakutan ritus sesat.' },
  { nama: 'Eel Fiend', rank: 'D', tipe: 'Fiend', hp: 96, dmg: 39, exp: 76, blood: 260, emoji: '🐟', runBlood: 25, desc: 'Kejutan listrik biologis dari dalam air yang mengejutkan otot hingga kram.' },
  { nama: 'Monkey Fiend', rank: 'D', tipe: 'Fiend', hp: 92, dmg: 40, exp: 77, blood: 250, emoji: '🐒', runBlood: 30, desc: 'Tingkah laku liar tidak terprediksi dengan kekuatan cengkraman tangan yang melebihi manusia.' },
  { nama: 'Squid Fiend', rank: 'D', tipe: 'Fiend', hp: 111, dmg: 40, exp: 85, blood: 300, emoji: '🦑', runBlood: 35, desc: 'Tentakel berilusi dengan penyemprotan tinta hitam yang membutakan pandangan.' },
  { nama: 'Scorpion Fiend', rank: 'D', tipe: 'Fiend', hp: 108, dmg: 41, exp: 85, blood: 305, emoji: '🦂', runBlood: 15, desc: 'Ketakutan sengatan ekor beracun yang mengintai dari celah batuan kering dan pasir hangat.' },
  { nama: 'Crab Devil', rank: 'D', tipe: 'Devil', hp: 120, dmg: 41, exp: 89, blood: 330, emoji: '🦀', runBlood: 10, desc: 'Cangkang keras bertanduk dengan capit ganda yang menghancurkan daging.' },
  { nama: 'Spider Fiend', rank: 'D', tipe: 'Fiend', hp: 102, dmg: 41, exp: 80, blood: 275, emoji: '🕷️', runBlood: 30, desc: 'Inang manusia bermata banyak yang memintal benang tajam penghalang jalan.' },
  { nama: 'Mold Devil', rank: 'D', tipe: 'Devil', hp: 98, dmg: 42, exp: 78, blood: 280, emoji: '🍄', runBlood: 0, desc: 'Spora toksik yang tumbuh diam-diam di tempat tertutup dan merusak saluran pernapasan manusia.' },
  { nama: 'Bat Fiend', rank: 'D', tipe: 'Fiend', hp: 105, dmg: 42, exp: 81, blood: 275, emoji: '🦇', runBlood: 35, desc: 'Inang manusia dengan telinga lebar dan kemampuan navigasi gelombang bersuara menggelegar.' },
  { nama: 'Hornet Fiend', rank: 'D', tipe: 'Fiend', hp: 104, dmg: 42, exp: 82, blood: 270, emoji: '🐝', runBlood: 25, desc: 'Serangga beracun yang menyengat berulang kali dengan agresivitas tinggi.' },
  { nama: 'Falcon Fiend', rank: 'D', tipe: 'Fiend', hp: 101, dmg: 43, exp: 83, blood: 265, emoji: '🦅', runBlood: 40, desc: 'Pekikan nyaring dari udara diikuti cengkeraman cakar pemangsa dari ketinggian.' },
  { nama: 'Piranha Fiend', rank: 'D', tipe: 'Fiend', hp: 87, dmg: 43, exp: 73, blood: 220, emoji: '🐟', runBlood: 30, desc: 'Barisan gigi segitiga tajam yang merobek daging dalam hitungan detik.' },
  { nama: 'Porcupine Devil', rank: 'D', tipe: 'Devil', hp: 112, dmg: 44, exp: 84, blood: 295, emoji: '🦔', runBlood: 15, desc: 'Duri tajam pelindung yang siap menusuk bagian tubuh mana pun saat bersentuhan fisik.' },
  { nama: 'Lobster Fiend', rank: 'D', tipe: 'Fiend', hp: 124, dmg: 44, exp: 91, blood: 345, emoji: '🦞', runBlood: 10, desc: 'Predator laut dalam bertangan capit berat yang memotong benda padat dengan mudah.' },
  { nama: 'Zombie Devil', rank: 'D', tipe: 'Devil', hp: 100, dmg: 45, exp: 80, blood: 300, emoji: '🧟', runBlood: 30, desc: 'Ketakutan akan kehilangan kehendak bebas dan menjadi mayat hidup yang dikendalikan dorongan tak berakal.' },
  { nama: 'Mantis Devil', rank: 'D', tipe: 'Devil', hp: 110, dmg: 45, exp: 85, blood: 300, emoji: '🦗', runBlood: 20, desc: 'Ayunan cepat bilah cakar serangga yang memotong saluran darah target.' },
  { nama: 'Fox Fiend', rank: 'D', tipe: 'Fiend', hp: 109, dmg: 46, exp: 86, blood: 290, emoji: '🦊', runBlood: 40, desc: 'Penipuan licik dan taring tajam predator hutan yang mengintai pemukiman pinggiran kota.' },
  { nama: 'Stingray Fiend', rank: 'D', tipe: 'Fiend', hp: 113, dmg: 46, exp: 87, blood: 310, emoji: '🐟', runBlood: 15, desc: 'Duri ekor beracun di dasar pasir yang menyengat kaki tak berselang bahaya.' },
  { nama: 'Ram Fiend', rank: 'D', tipe: 'Fiend', hp: 119, dmg: 47, exp: 87, blood: 320, emoji: '🐏', runBlood: 15, desc: 'Benturan kepala melengkung keras yang menjatuhkan manusia dari ketinggian.' },
  { nama: 'Spider Devil', rank: 'D', tipe: 'Devil', hp: 118, dmg: 48, exp: 88, blood: 325, emoji: '🕷️', runBlood: 35, desc: 'Jeratan jaring lengket dan kaki berbuku banyak yang mengepung korban tanpa jalan keluar.' },
  { nama: 'Scorpion Devil', rank: 'D', tipe: 'Devil', hp: 126, dmg: 48, exp: 92, blood: 340, emoji: '🦂', runBlood: 20, desc: 'Sengatan ekor melengkung beracun yang melumpuhkan sistem saraf tepi.' },
  { nama: 'Horse Fiend', rank: 'D', tipe: 'Fiend', hp: 128, dmg: 49, exp: 91, blood: 360, emoji: '🐎', runBlood: 20, desc: 'Injakan kuku besi tak terkendali yang sanggup meremukkan dada korban tergeletak.' },
  { nama: 'Snake Devil', rank: 'D', tipe: 'Devil', hp: 125, dmg: 50, exp: 92, blood: 340, emoji: '🐍', runBlood: 30, desc: 'Bisikan mendesis dan gigitan taring beracun dari gerakan meliuk tak bersuara di rumput.' },
  { nama: 'Wolf Fiend', rank: 'D', tipe: 'Fiend', hp: 122, dmg: 52, exp: 93, blood: 330, emoji: '🐺', runBlood: 45, desc: 'Ancaman serangan kelompok kawanan karnivora dengan rahang pembelah daging kuat.' },
  { nama: 'Viper Fiend', rank: 'D', tipe: 'Fiend', hp: 116, dmg: 53, exp: 90, blood: 310, emoji: '🐍', runBlood: 25, desc: 'Racun hemotoksin yang menghancurkan sel darah dan menyebar cepat pasca gigitan.' },
  { nama: 'Python Fiend', rank: 'D', tipe: 'Fiend', hp: 135, dmg: 54, exp: 97, blood: 375, emoji: '🐍', runBlood: 0, desc: 'Lilitan otot masif yang meremukkan tulang rusuk hingga korban kehabisan napas.' },
  { nama: 'Bat Devil', rank: 'D', tipe: 'Devil', hp: 130, dmg: 55, exp: 95, blood: 380, emoji: '🦇', runBlood: 40, desc: 'Makhluk nokturnal bersayap membran yang menyergap kegelapan dan meminum darah segar manusia.' },
  { nama: 'Cobra Fiend', rank: 'D', tipe: 'Fiend', hp: 121, dmg: 56, exp: 94, blood: 335, emoji: '🐍', runBlood: 30, desc: 'Semprotan racun mengincar mata yang mengakibatkan kebutaan permanen sesaat.' },
  { nama: 'Bull Fiend', rank: 'D', tipe: 'Fiend', hp: 138, dmg: 58, exp: 98, blood: 390, emoji: '🐂', runBlood: 0, desc: 'Amukan serudukan tanduk keras yang menghancurkan struktur kayu dan tulang manusia.' },
  { nama: 'Leech Devil', rank: 'D', tipe: 'Devil', hp: 140, dmg: 60, exp: 100, blood: 400, emoji: '🪱', runBlood: 50, desc: 'Bentuk raksasa parasit pemakan daging yang mencerna jaringan tubuh manusia di selokan perkotaan.' },
  { nama: 'Bear Devil', rank: 'D', tipe: 'Devil', hp: 145, dmg: 62, exp: 105, blood: 410, emoji: '🐻', runBlood: 10, desc: 'Cakar raksasa dan tenaga buas tak tertandingi di alam liar yang mampu meremukkan leher.' },
  { nama: 'Truck Devil', rank: 'D', tipe: 'Devil', hp: 120, dmg: 65, exp: 100, blood: 350, emoji: '🚚', runBlood: 0, desc: 'Teror benturan mesin beroda besi berkecepatan tinggi yang meremukkan pejalan kaki di jalan raya.' },

  // ========================================================
  // === RANK C - ANOMALI SUPRANATURAL & ANCAMAN KOTA ===
  // ========================================================
  { nama: 'Ear Devil', rank: 'C', tipe: 'Devil', hp: 200, dmg: 75, exp: 110, blood: 450, emoji: '👂', runBlood: 50, desc: 'Entitas panca indra berwujud telinga yang mencerminkan kecemasan hilangnya pendengaran tubuh.' },
  { nama: 'Mouth Devil', rank: 'C', tipe: 'Devil', hp: 210, dmg: 80, exp: 115, blood: 480, emoji: '👄', runBlood: 40, desc: 'Fobia ketidakmampuan berkomunikasi dan tercekiknya organ pernapasan bawah mulut.' },
  { nama: 'Whistle Fiend', rank: 'C', tipe: 'Fiend', hp: 202, dmg: 99, exp: 112, blood: 455, emoji: '🛞', runBlood: 60, desc: 'Lekukan frekuensi tinggi yang merangsang migrain berat dan pusing mendadak.' },
  { nama: 'Foam Fiend', rank: 'C', tipe: 'Fiend', hp: 204, dmg: 89, exp: 111, blood: 458, emoji: '🫧', runBlood: 50, desc: 'Busa tebal yang menyumbat hidung dan mulut hingga memicu rasa tercekik.' },
  { nama: 'Shadow Fiend', rank: 'C', tipe: 'Fiend', hp: 205, dmg: 95, exp: 115, blood: 460, emoji: '👤', runBlood: 90, desc: 'Pengintai tanpa wajah yang dapat menyelinap di bawah bayangan kaki manusia.' },
  { nama: 'Key Fiend', rank: 'C', tipe: 'Fiend', hp: 206, dmg: 101, exp: 114, blood: 465, emoji: '🔑', runBlood: 50, desc: 'Menusuk titik kunci saraf untuk melumpuhkan kontrol refleks tubuh musuh.' },
  { nama: 'Coin Devil', rank: 'C', tipe: 'Devil', hp: 209, dmg: 97, exp: 113, blood: 472, emoji: '🪙', runBlood: 45, desc: 'Keserakahan materi yang memicu perkelahian dan pengkhianatan di antara manusia.' },
  { nama: 'Dart Fiend', rank: 'C', tipe: 'Fiend', hp: 208, dmg: 106, exp: 116, blood: 470, emoji: '🎯', runBlood: 55, desc: 'Jarum lempar beracun yang mengincar urat nadi dan saraf motorik target.' },
  { nama: 'Paint Devil', rank: 'C', tipe: 'Devil', hp: 211, dmg: 108, exp: 118, blood: 476, emoji: '🎨', runBlood: 40, desc: 'Uap kimia beracun yang mengiritasi mata dan memicu pusing berat.' },
  { nama: 'Bell Devil', rank: 'C', tipe: 'Devil', hp: 213, dmg: 107, exp: 117, blood: 478, emoji: '🔔', runBlood: 40, desc: 'Gelombang suara dentang nyaring yang merusak keseimbangan cairan telinga tengah.' },
  { nama: 'Book Fiend', rank: 'C', tipe: 'Fiend', hp: 216, dmg: 92, exp: 122, blood: 486, emoji: '📖', runBlood: 40, desc: 'Kecemasan akan rahasia pribadi yang terungkap di depan khalayak umum.' },
  { nama: 'Wire Devil', rank: 'C', tipe: 'Devil', hp: 214, dmg: 122, exp: 123, blood: 482, emoji: '🧵', runBlood: 45, desc: 'Kawat halus bertekanan tinggi yang memotong anggota tubuh seperti mentega.' },
  { nama: 'Glass Devil', rank: 'C', tipe: 'Devil', hp: 210, dmg: 138, exp: 132, blood: 475, emoji: '🪟', runBlood: 60, desc: 'Serpihan tajam transparan yang menusuk tanpa terlihat di kegelapan.' },
  { nama: 'Arrow Devil', rank: 'C', tipe: 'Devil', hp: 215, dmg: 115, exp: 120, blood: 485, emoji: '🏹', runBlood: 50, desc: 'Proyektil tajam berkecepatan tinggi yang ditembakkan dari jarak jauh tanpa suara.' },
  { nama: 'Trap Fiend', rank: 'C', tipe: 'Fiend', hp: 217, dmg: 120, exp: 125, blood: 488, emoji: '🪤', runBlood: 50, desc: 'Pemasangan jebakan tersembunyi yang meremukkan pergelangan kaki target.' },
  { nama: 'Glove Fiend', rank: 'C', tipe: 'Fiend', hp: 212, dmg: 102, exp: 118, blood: 490, emoji: '🥊', runBlood: 35, desc: 'Pukulan bertubi-tubi berkecepatan tinggi dengan tinju melapis kerangka padat.' },
  { nama: 'Ink Fiend', rank: 'C', tipe: 'Fiend', hp: 220, dmg: 114, exp: 121, blood: 492, emoji: '✒️', runBlood: 35, desc: 'Cairan hitam pekat yang membutakan penglihatan dan merusak saluran napas.' },
  { nama: 'Razor Fiend', rank: 'C', tipe: 'Fiend', hp: 219, dmg: 121, exp: 124, blood: 495, emoji: '🪒', runBlood: 45, desc: 'Bilah silet tipis yang mengiris lapisan kulit luar tanpa disadari korban.' },
  { nama: 'Mask Devil', rank: 'C', tipe: 'Devil', hp: 221, dmg: 104, exp: 119, blood: 498, emoji: '🎭', runBlood: 40, desc: 'Manipulasi raut wajah yang membingungkan identitas dan memicu rasa ketakutan asing.' },
  { nama: 'Nail Fiend', rank: 'C', tipe: 'Fiend', hp: 220, dmg: 110, exp: 125, blood: 500, emoji: '📍', runBlood: 50, desc: 'Mayat bernyawa dengan mata paku besi tajam yang menyerang saraf menggunakan tusukan masif.' },
  { nama: 'Scale Fiend', rank: 'C', tipe: 'Fiend', hp: 223, dmg: 105, exp: 120, blood: 502, emoji: '⚖️', runBlood: 35, desc: 'Ketidakseimbangan fisik yang membuat musuh terjatuh saat melangkah.' },
  { nama: 'Chain Fiend', rank: 'C', tipe: 'Fiend', hp: 226, dmg: 109, exp: 123, blood: 505, emoji: '⛓️', runBlood: 40, desc: 'Rantai usus mengeras yang melilit leher target untuk menghentikan pasokan oksigen.' },
  { nama: 'Claw Fiend', rank: 'C', tipe: 'Fiend', hp: 218, dmg: 108, exp: 122, blood: 510, emoji: '🦅', runBlood: 45, desc: 'Jari-jemari melengkung tajam seperti elang yang mencabik jaringan otot dalam perkelahian.' },
  { nama: 'Mirror Fiend', rank: 'C', tipe: 'Fiend', hp: 227, dmg: 113, exp: 124, blood: 508, emoji: '🪞', runBlood: 35, desc: 'Ilusi pantulan diri yang memantulkan kembali sebagian efek serangan fisik.' },
  { nama: 'Net Fiend', rank: 'C', tipe: 'Fiend', hp: 224, dmg: 103, exp: 121, blood: 512, emoji: '🕸️', runBlood: 45, desc: 'Jaring melilit ber racun yang membatasi pergerakan di medan pertempuran.' },
  { nama: 'Fang Fiend', rank: 'C', tipe: 'Fiend', hp: 228, dmg: 114, exp: 129, blood: 515, emoji: '🐺', runBlood: 30, desc: 'Barisan taring serigala memanjang di dalam mulut yang merobek arteri leher mangsa.' },
  { nama: 'Glue Devil', rank: 'C', tipe: 'Devil', hp: 228, dmg: 96, exp: 123, blood: 512, emoji: '🧪', runBlood: 30, desc: 'Perekat kimia tebal yang merekatkan pergelangan tangan musuh ke tubuhnya.' },
  { nama: 'Clock Fiend', rank: 'C', tipe: 'Fiend', hp: 231, dmg: 110, exp: 125, blood: 518, emoji: '🕰️', runBlood: 30, desc: 'Kecemasan berjelas akan berjalannya waktu dan berkurangnya sisa usia hidup.' },
  { nama: 'Pincer Fiend', rank: 'C', tipe: 'Fiend', hp: 230, dmg: 116, exp: 127, blood: 520, emoji: '🦂', runBlood: 30, desc: 'Capit ganda dari jaringan tulang rawan yang memotong sendi anggota tubuh musuh.' },
  { nama: 'Spear Fiend', rank: 'C', tipe: 'Fiend', hp: 222, dmg: 112, exp: 126, blood: 525, emoji: '🔱', runBlood: 35, desc: 'Pengguna tombak tulang yang tumbuh dari lengan kiri, menusuk titik vital dengan presisi tinggi.' },
  { nama: 'Dagger Fiend', rank: 'C', tipe: 'Fiend', hp: 225, dmg: 118, exp: 128, blood: 530, emoji: '🗡️', runBlood: 40, desc: 'Lengan yang berubah menjadi bilah pisau belati, menusuk bertubi-tubi tanpa rasa sakit.' },
  { nama: 'Hook Fiend', rank: 'C', tipe: 'Fiend', hp: 229, dmg: 117, exp: 128, blood: 522, emoji: '🪝', runBlood: 35, desc: 'Kait tajam di ujung lengan yang merobek bagian dalam organ saat ditarik paksa.' },
  { nama: 'Rope Devil', rank: 'C', tipe: 'Devil', hp: 233, dmg: 111, exp: 126, blood: 525, emoji: '🪢', runBlood: 35, desc: 'Jeratan tali pernapasan yang mengikat pergerakan tangan dan kaki korban.' },
  { nama: 'Whip Devil', rank: 'C', tipe: 'Devil', hp: 232, dmg: 119, exp: 130, blood: 528, emoji: '🪢', runBlood: 30, desc: 'Sabetan tali berkecepatan tinggi yang menyayat permukaan kulit hingga berdarah.' },
  { nama: 'Blade Fiend', rank: 'C', tipe: 'Fiend', hp: 235, dmg: 122, exp: 131, blood: 535, emoji: '⚔️', runBlood: 25, desc: 'Bilah pedang pendek yang mencuat dari siku, menambah jangkauan tebasan mematikan.' },
  { nama: 'Chain Devil', rank: 'C', tipe: 'Devil', hp: 237, dmg: 117, exp: 129, blood: 532, emoji: '⛓️', runBlood: 25, desc: 'Lilitan besi berat yang menghentikan pergerakan mekanis atau tubuh manusia.' },
  { nama: 'Wax Fiend', rank: 'C', tipe: 'Fiend', hp: 236, dmg: 116, exp: 127, blood: 529, emoji: '🕯️', runBlood: 20, desc: 'Menutup pori-pori kulit dengan cairan lelehan panas yang mengeras cepat.' },
  { nama: 'Axe Fiend', rank: 'C', tipe: 'Fiend', hp: 238, dmg: 128, exp: 134, blood: 545, emoji: '🪓', runBlood: 20, desc: 'Inang kekar dengan kepakan tebasan kapak pemotong kayu yang mampu membelah kerangka dada.' },
  { nama: 'Sickle Devil', rank: 'C', tipe: 'Devil', hp: 239, dmg: 123, exp: 133, blood: 540, emoji: '🌾', runBlood: 25, desc: 'Bilah pemotong melengkung yang memanen organ tubuh korban dengan tebasan memutar.' },
  { nama: 'Guillotine Fiend', rank: 'C', tipe: 'Fiend', hp: 240, dmg: 135, exp: 135, blood: 540, emoji: '📐', runBlood: 0, desc: 'Kepala berwujud pisau eksekusi karat yang mengincar leher target dengan kecepatan pemotong.' },
  { nama: 'Lock Fiend', rank: 'C', tipe: 'Fiend', hp: 250, dmg: 98, exp: 128, blood: 560, emoji: '🔒', runBlood: 0, desc: 'Mengkunci sendi-sendi tubuh target sehingga tidak dapat digerakkan sesaat.' },
  { nama: 'Lance Fiend', rank: 'C', tipe: 'Fiend', hp: 242, dmg: 127, exp: 136, blood: 548, emoji: '🔱', runBlood: 20, desc: 'Tusukan panjang beruntun yang menembus pertahanan benteng terdepan.' },
  { nama: 'Needle Devil', rank: 'C', tipe: 'Devil', hp: 245, dmg: 124, exp: 138, blood: 550, emoji: '🪡', runBlood: 20, desc: 'Tusukan beruntun dari ribuan jarum tipis yang menyiksa jaringan saraf secara perlahan.' },
  { nama: 'Pipe Fiend', rank: 'C', tipe: 'Fiend', hp: 246, dmg: 126, exp: 134, blood: 552, emoji: '🥖', runBlood: 15, desc: 'Hantaman besi berongga yang meremukkan rusuk dada korban.' },
  { nama: 'Saw Fiend', rank: 'C', tipe: 'Fiend', hp: 248, dmg: 132, exp: 139, blood: 555, emoji: '🪚', runBlood: 10, desc: 'Bilah bergerigi yang bergetar cepat memotong lapis kulit dan daging secara kasar.' },
  { nama: 'Stone Devil', rank: 'C', tipe: 'Devil', hp: 270, dmg: 130, exp: 140, blood: 560, emoji: '🪨', runBlood: 0, desc: 'Kekuatan yang membekukan organ jaringan manusia menjadi patung batu rapuh yang mudah hancur.' },
  { nama: 'Muscle Devil', rank: 'C', tipe: 'Devil', hp: 260, dmg: 125, exp: 145, blood: 580, emoji: '💪', runBlood: 0, desc: 'Manipulator serat daging yang dapat mengendalikan pergerakan otot tubuh musuh dari dalam.' },
  { nama: 'Hammer Fiend', rank: 'C', tipe: 'Fiend', hp: 252, dmg: 134, exp: 141, blood: 565, emoji: '🔨', runBlood: 0, desc: 'Kepalan tangan melapis batuan keras yang mampu menghancurkan tulang tempurung kepala.' },
  { nama: 'Horn Devil', rank: 'C', tipe: 'Devil', hp: 255, dmg: 126, exp: 142, blood: 570, emoji: '🦏', runBlood: 15, desc: 'Tanduk tajam masif yang digunakan untuk menembus pertahanan dinding dan tameng besi.' },
  { nama: 'Silence Devil', rank: 'C', tipe: 'Devil', hp: 290, dmg: 115, exp: 155, blood: 620, emoji: '🤫', runBlood: 0, desc: 'Meredam seluruh gelombang suara secara mutlak hingga menciptakan kepanikan hilangnya pendengaran.' },
  { nama: 'Drum Devil', rank: 'C', tipe: 'Devil', hp: 254, dmg: 128, exp: 138, blood: 568, emoji: '🥁', runBlood: 10, desc: 'Getaran frekuensi rendah yang mengganggu detak jantung alami manusia.' },
  { nama: 'Doll Devil', rank: 'C', tipe: 'Devil', hp: 280, dmg: 110, exp: 150, blood: 600, emoji: '🎎', runBlood: 0, desc: 'Pemicu manipulasi kesadaran yang mengubah manusia menjadi manekin mati yang patuh pada perintah.' },
  { nama: 'Club Fiend', rank: 'C', tipe: 'Fiend', hp: 258, dmg: 131, exp: 143, blood: 575, emoji: '🏏', runBlood: 0, desc: 'Hantaman keras dari lengan membesar yang memberikan trauma tumpul pada tubuh.' },
  { nama: 'Spike Devil', rank: 'C', tipe: 'Devil', hp: 262, dmg: 129, exp: 144, blood: 585, emoji: '🦔', runBlood: 15, desc: 'Duri-duri tajam yang meledak dari permukaan tubuh saat diserang dalam jarak dekat.' },
  { nama: 'Brick Fiend', rank: 'C', tipe: 'Fiend', hp: 260, dmg: 125, exp: 140, blood: 580, emoji: '🧱', runBlood: 0, desc: 'Lemparan material bangunan padat yang menghancurkan struktur tulang.' },
  { nama: 'Shield Fiend', rank: 'C', tipe: 'Fiend', hp: 275, dmg: 90, exp: 135, blood: 610, emoji: '🛡️', runBlood: 0, desc: 'Lapisan kerangka dada menebal yang menahan segala bentuk serangan fisik langsung.' },
  { nama: 'Ghost Devil', rank: 'C', tipe: 'Devil', hp: 250, dmg: 120, exp: 160, blood: 650, emoji: '👻', runBlood: 0, desc: 'Entitas tak berwujud berkehendak gaib yang menyerang berdasarkan rasa takut yang terdeteksi pada target.' },
  { nama: 'Cage Devil', rank: 'C', tipe: 'Devil', hp: 268, dmg: 118, exp: 137, blood: 590, emoji: '🪤', runBlood: 0, desc: 'Pengurungan fisik mendadak dalam jeruji besi yang memicu ketakutan klaustrofobia.' },
  { nama: 'Octopus Devil', rank: 'C', tipe: 'Devil', hp: 320, dmg: 130, exp: 165, blood: 700, emoji: '🐙', runBlood: 60, desc: 'Tentakel raksasa berminta hitam yang ahli melilit, membungkam, dan membutakan pertahanan musuh.' },
  { nama: 'Shark Devil', rank: 'C', tipe: 'Devil', hp: 350, dmg: 140, exp: 170, blood: 750, emoji: '🦈', runBlood: 80, desc: 'Predator lautan yang mampu berenang menembus daratan padat seperti beton dan aspal jalanan.' },
  { nama: 'Fox Devil', rank: 'C', tipe: 'Devil', hp: 300, dmg: 150, exp: 180, blood: 800, emoji: '🦊', runBlood: 100, desc: 'Iblis raksasa pemakan daging manusia yang hanya mau dipanggil melalui kontrak pengorbanan tubuh.' },
  { nama: 'Gravity Devil', rank: 'C', tipe: 'Devil', hp: 380, dmg: 160, exp: 195, blood: 850, emoji: '🌌', runBlood: 0, desc: 'Manipulasi bobot fisika yang menekan tubuh korban ke tanah hingga tulang rusuk retak.' },
  { nama: 'Eternity Devil', rank: 'C', tipe: 'Devil', hp: 450, dmg: 180, exp: 220, blood: 950, emoji: '♾️', runBlood: 0, desc: 'Anomali pelipat dimensi yang menjebak korban dalam koridor waktu tanpa akhir demi memicu keputusasaan.' },

  // ==========================================================
  // === RANK B - ANOMALI TINGKAT MENENGAH & ANCAMAN PROVINSI ===
  // ==========================================================
{ nama: 'Stitch Fiend', rank: 'B', tipe: 'Fiend', hp: 410, dmg: 140, exp: 240, blood: 1050, emoji: '🧵', runBlood: 200, desc: 'Inang bertubuh jahitan yang bertindak sebagai penyembuh jaringan luka menggunakan darah.' },
{ nama: 'Mind Fiend', rank: 'B', tipe: 'Fiend', hp: 400, dmg: 160, exp: 250, blood: 1100, emoji: '👹', runBlood: 120, desc: 'Inang berotak sarat informasi yang menyerang menggunakan cambukan kuncir rambut tajam.' },
{ nama: 'Cosmic Fiend', rank: 'B', tipe: 'Fiend', hp: 420, dmg: 150, exp: 260, blood: 1150, emoji: '🌌', runBlood: 0, desc: 'Memaksa pikiran target menyerap seluruh pengetahuan alam semesta hingga mengalami kelumpuhan total.' },
{ nama: 'Blood Fiend', rank: 'B', tipe: 'Fiend', hp: 430, dmg: 170, exp: 255, blood: 1180, emoji: '🩸', runBlood: 100, desc: 'Inang bertanduk merah yang mampu memanipulasi darahnya sendiri menjadi senjata tajam padat.' },
{ nama: 'Shark Fiend', rank: 'B', tipe: 'Fiend', hp: 450, dmg: 190, exp: 280, blood: 1200, emoji: '🦈', runBlood: 100, desc: 'Inang pemangsa yang mampu menyelam dan berenang bebas di dalam padatan struktur bangunan.' },
{ nama: 'Insect Fiend', rank: 'B', tipe: 'Fiend', hp: 460, dmg: 180, exp: 275, blood: 1220, emoji: '🪰', runBlood: 0, desc: 'Pengikut berkepala serangga bersayap yang menyerang menggunakan gigitan hama beracun.' },
{ nama: 'Feline Fiend', rank: 'B', tipe: 'Fiend', hp: 475, dmg: 205, exp: 282, blood: 1240, emoji: '🐆', runBlood: 70, desc: 'Inang bercakar lentur yang mampu melompati rintangan tinggi dengan tenang.' },
{ nama: 'Beast Fiend', rank: 'B', tipe: 'Fiend', hp: 490, dmg: 200, exp: 290, blood: 1280, emoji: '🦁', runBlood: 0, desc: 'Wadah bertelinga binatang buas yang mengandalkan cakar pemotong untuk melindungi wilayahnya.' },
{ nama: 'Pressure Fiend', rank: 'B', tipe: 'Fiend', hp: 500, dmg: 205, exp: 295, blood: 1300, emoji: '👤', runBlood: 0, desc: 'Makhluk tanpa kepala yang memancarkan aura tekanan gelap untuk memecahkan konsentrasi musuh.' },
{ nama: 'Spider Fiend', rank: 'B', tipe: 'Fiend', hp: 480, dmg: 210, exp: 300, blood: 1300, emoji: '🕷️', runBlood: 150, desc: 'Wujud setengah laba-laba yang mampu membuka belahan tubuhnya untuk transportasi rahasia.' },
{ nama: 'Boar Fiend', rank: 'B', tipe: 'Fiend', hp: 510, dmg: 220, exp: 290, blood: 1310, emoji: '🐗', runBlood: 40, desc: 'Inang berwujud babi hutan yang mengamuk tanpa mempedulikan rasa sakit fisik.' },
  { nama: 'Dragon Fiend', rank: 'B', tipe: 'Fiend', hp: 520, dmg: 240, exp: 310, blood: 1350, emoji: '🐉', runBlood: 0, desc: 'Wadah bertanduk mistis yang menyemburkan kobaran api suhu tinggi dari paru-parunya.' },
  { nama: 'Gator Fiend', rank: 'B', tipe: 'Fiend', hp: 530, dmg: 230, exp: 315, blood: 1380, emoji: '🐊', runBlood: 50, desc: 'Cengkraman rahang reptil raksasa yang memutar tubuh korban hingga persendian putus.' },
  { nama: 'Violence Fiend', rank: 'B', tipe: 'Fiend', hp: 550, dmg: 250, exp: 320, blood: 1400, emoji: '👊', runBlood: 0, desc: 'Entitas berkekuatan fisik murni ekstrem yang harus memakai topeng gas penahan racun.' },
  { nama: 'Locust Hybrid', rank: 'B', tipe: 'Hybrid', hp: 565, dmg: 248, exp: 318, blood: 1500, emoji: '🦗', runBlood: 115, desc: 'Lompatan tinggi hibrida belalang yang mengincar leher musuh dari sudut buta.' },
  { nama: 'Vulture Hybrid', rank: 'B', tipe: 'Hybrid', hp: 570, dmg: 250, exp: 325, blood: 1520, emoji: '🦅', runBlood: 100, desc: 'Keahlian bertarung hibrida pemakan bangkai yang mengincar musuh dalam kondisi terluka.' },
  { nama: 'Falcon Hybrid', rank: 'B', tipe: 'Hybrid', hp: 580, dmg: 260, exp: 330, blood: 1550, emoji: '🦅', runBlood: 120, desc: 'Penyergapan udara hibrida elang berkecepatan menukik yang merobek pundak musuh.' },
  { nama: 'Owl Hybrid', rank: 'B', tipe: 'Hybrid', hp: 590, dmg: 265, exp: 340, blood: 1580, emoji: '🦉', runBlood: 95, desc: 'Wujud hibrida berintelegen tinggi dengan indra penglihatan tembus kegelapan total.' },
  { nama: 'Eel Hybrid', rank: 'B', tipe: 'Hybrid', hp: 595, dmg: 272, exp: 342, blood: 1590, emoji: '🐟', runBlood: 110, desc: 'Pelepasan lonjakan tegangan listrik biologis hibrida belut yang mengejutkan lawan.' },
  { nama: 'Bat Hybrid', rank: 'B', tipe: 'Hybrid', hp: 600, dmg: 275, exp: 345, blood: 1600, emoji: '🦇', runBlood: 110, desc: 'Hibrida bersayap membran yang memanfaatkan gelombang sonik untuk memecahkan kaca.' },
  { nama: 'Squid Hybrid', rank: 'B', tipe: 'Hybrid', hp: 605, dmg: 278, exp: 352, blood: 1620, emoji: '🦑', runBlood: 100, desc: 'Lilitan sepuluh tentakel hibrida cumi-cumi yang menarik korban ke dalam air.' },
  { nama: 'Spider Hybrid', rank: 'B', tipe: 'Hybrid', hp: 610, dmg: 270, exp: 350, blood: 1650, emoji: '🕷️', runBlood: 100, desc: 'Manusia hibrida berkaki delapan yang mampu memanjat dinding licin dan menyergap cepat.' },
  { nama: 'Hornet Hybrid', rank: 'B', tipe: 'Hybrid', hp: 618, dmg: 282, exp: 358, blood: 1670, emoji: '🐝', runBlood: 90, desc: 'Serangan sengat bertubi-tubi hibrida tawon yang meninggalkan rasa panas terbakar.' },
  { nama: 'Fox Hybrid', rank: 'B', tipe: 'Hybrid', hp: 615, dmg: 285, exp: 365, blood: 1680, emoji: '🦊', runBlood: 105, desc: 'Kecepatan gerak hibrida rubah yang mengandalkan cakar halus mematikan untuk menyerang.' },
  { nama: 'Mantis Hybrid', rank: 'B', tipe: 'Hybrid', hp: 620, dmg: 280, exp: 360, blood: 1700, emoji: '🦗', runBlood: 80, desc: 'Bentuk hibrida bertangan sabit ganda dengan kecepatan ayunan memotong yang luar biasa.' },
  { nama: 'Cobra Hybrid', rank: 'B', tipe: 'Hybrid', hp: 625, dmg: 295, exp: 370, blood: 1710, emoji: '🐍', runBlood: 85, desc: 'Tusukan taring ganda hibrida ular kobra yang menyuntikkan cairan racun neurotoksin.' },
  { nama: 'Snake Hybrid', rank: 'B', tipe: 'Hybrid', hp: 630, dmg: 290, exp: 370, blood: 1720, emoji: '🐍', runBlood: 85, desc: 'Transformasi hibrida bersisik meliuk yang menyemburkan racun peleleh jaringan kulit.' },
  { nama: 'Shark Hybrid', rank: 'B', tipe: 'Hybrid', hp: 635, dmg: 288, exp: 368, blood: 1730, emoji: '🦈', runBlood: 95, desc: 'Transformasi sirip siram hibrida hiu yang mampu menyelam di dalam pondasi semen.' },
  { nama: 'Panther Hybrid', rank: 'B', tipe: 'Hybrid', hp: 640, dmg: 292, exp: 362, blood: 1740, emoji: '🐆', runBlood: 80, desc: 'Kecepatan siluman hibrida macan tutul hitam yang menyerang tanpa menimbulkan suara.' },
  { nama: 'Scorpion Hybrid', rank: 'B', tipe: 'Hybrid', hp: 640, dmg: 295, exp: 375, blood: 1750, emoji: '🦂', runBlood: 90, desc: 'Prajurit hibrida dengan ekor sengat mekanis beracun yang menembus armor besi.' },
  { nama: 'Centipede Hybrid', rank: 'B', tipe: 'Hybrid', hp: 645, dmg: 298, exp: 378, blood: 1780, emoji: '🐛', runBlood: 80, desc: 'Banyaknya taring melilit hibrida kelabang yang menyuntikkan cairan racun pembusuk.' },
  { nama: 'Wolf Hybrid', rank: 'B', tipe: 'Hybrid', hp: 650, dmg: 300, exp: 385, blood: 1800, emoji: '🐺', runBlood: 75, desc: 'Hibrida serigala dengan insting berburu kelompok dan rahang peremas tulang keras.' },
  { nama: 'Boar Hybrid', rank: 'B', tipe: 'Hybrid', hp: 660, dmg: 302, exp: 372, blood: 1810, emoji: '🐗', runBlood: 55, desc: 'Terjangan liar hibrida babi hutan yang menembus barisan pertahanan musuh.' },
  { nama: 'Python Hybrid', rank: 'B', tipe: 'Hybrid', hp: 660, dmg: 305, exp: 380, blood: 1820, emoji: '🐍', runBlood: 65, desc: 'Lilitan otot hibrida sanca yang memadamkan pernapasan dan mematahkan rusuk.' },
  { nama: 'Anemone Devil', rank: 'B', tipe: 'Devil', hp: 665, dmg: 290, exp: 372, blood: 1840, emoji: '🪸', runBlood: 60, desc: 'Hutan tentakel beracun yang mengikat pergerakan dan melumpuhkan sistem saraf.' },
  { nama: 'Gator Hybrid', rank: 'B', tipe: 'Hybrid', hp: 670, dmg: 315, exp: 390, blood: 1870, emoji: '🐊', runBlood: 70, desc: 'Ketahanan armor sisik hibrida aligator yang sulit ditembus senjata tajam biasa.' },
  { nama: 'Crab Hybrid', rank: 'B', tipe: 'Hybrid', hp: 680, dmg: 310, exp: 388, blood: 1890, emoji: '🦀', runBlood: 40, desc: 'Pertahanan cangkang keras hibrida kepiting dengan dua capit pemotong tebal.' },
  { nama: 'Bull Hybrid', rank: 'B', tipe: 'Hybrid', hp: 675, dmg: 320, exp: 395, blood: 1900, emoji: '🐂', runBlood: 50, desc: 'Serudukan garis lurus hibrida banteng yang melempar kendaraan ke udara.' },
  { nama: 'Urchin Devil', rank: 'B', tipe: 'Devil', hp: 685, dmg: 315, exp: 382, blood: 1910, emoji: '🪨', runBlood: 35, desc: 'Duri-duri tajam beracun yang mencuat dari seluruh permukaan tubuh untuk membalas.' },
  { nama: 'Boar Devil', rank: 'B', tipe: 'Devil', hp: 690, dmg: 318, exp: 388, blood: 1930, emoji: '🐗', runBlood: 30, desc: 'Serudukan taring liar yang merobek bagian paha dan otot kaki korban.' },
  { nama: 'Rhino Devil', rank: 'B', tipe: 'Devil', hp: 670, dmg: 310, exp: 400, blood: 1950, emoji: '🦏', runBlood: 0, desc: 'Serudukan cula berlapis baja keras yang mampu meruntuhkan pilar bangunan beton.' },
  { nama: 'Crocodile Hybrid', rank: 'B', tipe: 'Hybrid', hp: 695, dmg: 325, exp: 405, blood: 1960, emoji: '🐊', runBlood: 45, desc: 'Cengkraman rahang bersisik hibrida buaya yang menyeret korban ke daratan basah.' },
  { nama: 'Bear Hybrid', rank: 'B', tipe: 'Hybrid', hp: 690, dmg: 330, exp: 410, blood: 1980, emoji: '🐻', runBlood: 60, desc: 'Ketahanan fisik luar biasa hibrida beruang dengan ketahanan terhadap tebasan pedang.' },
  { nama: 'Money Devil', rank: 'B', tipe: 'Devil', hp: 680, dmg: 320, exp: 410, blood: 2000, emoji: '💰', runBlood: 500, desc: 'Lahir dari jeratan utang, kemiskinan ekstrem, dan kehancuran finansial masyarakat modern.' },
  { nama: 'Panther Devil', rank: 'B', tipe: 'Devil', hp: 705, dmg: 332, exp: 402, blood: 2010, emoji: '🐆', runBlood: 50, desc: 'Penyergapan kilat bayangan hitam yang mengincar urat leher di kegelapan malam.' },
  { nama: 'Rhino Hybrid', rank: 'B', tipe: 'Hybrid', hp: 700, dmg: 340, exp: 420, blood: 2020, emoji: '🦏', runBlood: 30, desc: 'Terjangan cula keras hibrida badak yang mampu menembus dinding pertahanan.' },
  { nama: 'Crocodile Devil', rank: 'B', tipe: 'Devil', hp: 710, dmg: 335, exp: 415, blood: 2050, emoji: '🐊', runBlood: 40, desc: 'Sisik tebal tak tembus peluru standar dengan putaran kematian saat menggigit.' },
  { nama: 'Lightning Devil', rank: 'B', tipe: 'Devil', hp: 700, dmg: 390, exp: 430, blood: 2100, emoji: '⚡', runBlood: 150, desc: 'Guntur berjalan yang memanggang sistem saraf makhluk hidup melalui kilatan voltase tinggi.' },
  { nama: 'Hippo Hybrid', rank: 'B', tipe: 'Hybrid', hp: 725, dmg: 355, exp: 435, blood: 2120, emoji: '🦛', runBlood: 20, desc: 'Rahang raksasa hibrida kuda nil yang mampu meremukkan leher lawan seketika.' },
  { nama: 'Ice Devil', rank: 'B', tipe: 'Devil', hp: 720, dmg: 360, exp: 420, blood: 2150, emoji: '🧊', runBlood: 100, desc: 'Fobia akan hipotermia dan kematian akibat kaku beku di tengah badai salju abadi.' },
  { nama: 'Hippo Devil', rank: 'B', tipe: 'Devil', hp: 730, dmg: 340, exp: 425, blood: 2180, emoji: '🦛', runBlood: 0, desc: 'Kekuatan gigitan masif area sungai yang sanggup membelah perahu kayu menjadi dua.' },
  { nama: 'Gorilla Hybrid', rank: 'B', tipe: 'Hybrid', hp: 735, dmg: 360, exp: 440, blood: 2190, emoji: '🦍', runBlood: 25, desc: 'Kekuatan pukulan dua tangan hibrida gorilla yang menghancurkan batuan keras.' },
  { nama: 'Future Devil', rank: 'B', tipe: 'Devil', hp: 750, dmg: 400, exp: 450, blood: 2200, emoji: '🔮', runBlood: 0, desc: 'Entitas yang mampu melihat rentetan masa depan tragis dan memperjualbelikan indra penglihatannya.' },
  { nama: 'Gorilla Devil', rank: 'B', tipe: 'Devil', hp: 740, dmg: 350, exp: 430, blood: 2220, emoji: '🦍', runBlood: 0, desc: 'Hantaman dada dan kekuatan lengan tak tertandingi yang menghancurkan struktur tanah.' },
  { nama: 'Poison Devil', rank: 'B', tipe: 'Devil', hp: 690, dmg: 410, exp: 425, blood: 2250, emoji: '☠️', runBlood: 250, desc: 'Asap belerang toksik yang melelehkan paru-paru dan merusak organ dalam hitungan detik.' },
  { nama: 'Void Devil', rank: 'B', tipe: 'Devil', hp: 710, dmg: 380, exp: 440, blood: 2300, emoji: '🕳️', runBlood: 0, desc: 'Ketakutan jatuh ke dalam jurang ruang tak berdasar dan kehilangan pijakan daratan.' },
  { nama: 'Elephant Hybrid', rank: 'B', tipe: 'Hybrid', hp: 760, dmg: 375, exp: 455, blood: 2300, emoji: '🐘', runBlood: 10, desc: 'Daya seruduk masif hibrida gajah yang meratakan barisan musuh terdepan.' },
  { nama: 'Elephant Devil', rank: 'B', tipe: 'Devil', hp: 780, dmg: 370, exp: 445, blood: 2350, emoji: '🐘', runBlood: 0, desc: 'Injakan massa raksasa dan libas belalai berat yang meratakan barisan pertahanan.' },
  { nama: 'Fire Devil', rank: 'B', tipe: 'Devil', hp: 850, dmg: 440, exp: 460, blood: 2400, emoji: '🔥', runBlood: 0, desc: 'Kobaran kemarahan masif yang mengubah bentuk tubuh para pembuat kontraknya menjadi monster.' },
  { nama: 'Whale Hybrid', rank: 'B', tipe: 'Hybrid', hp: 790, dmg: 380, exp: 460, blood: 2450, emoji: '🐳', runBlood: 0, desc: 'Massa tubuh masif hibrida paus yang memberikan benturan area berskala besar.' },
  { nama: 'Curse Devil', rank: 'B', tipe: 'Devil', hp: 800, dmg: 480, exp: 480, blood: 2500, emoji: '📍', runBlood: 200, desc: 'Eksekutor bertengkorak ganda yang mengeksekusi mati target setelah tusukan jarum paku keempat.' },
  { nama: 'Whale Devil', rank: 'B', tipe: 'Devil', hp: 820, dmg: 390, exp: 470, blood: 2600, emoji: '🐳', runBlood: 0, desc: 'Ukuran raksasa pengetuk lautan yang mampu memicu gelombang pasang di pesisir.' },
  { nama: 'Punishment Devil', rank: 'B', tipe: 'Devil', hp: 900, dmg: 520, exp: 500, blood: 2700, emoji: '⚖️', runBlood: 0, desc: 'Manifestasi hukuman mati yang turun dari langit dalam wujud gumpalan senjata pemotong.' },

  // =======================================================
  // === RANK A - ANOMALI TINGKAT TINGGI & BENCANA NASIONAL ===
  // =======================================================
  { nama: 'Vulture Fiend', rank: 'A', tipe: 'Fiend', hp: 805, dmg: 340, exp: 475, blood: 2180, emoji: '🦅', runBlood: 120, desc: 'Mencengkeram luka terbuka musuh untuk mempercepat pendarahan vital.' },
  { nama: 'Falcon Fiend', rank: 'A', tipe: 'Fiend', hp: 815, dmg: 350, exp: 480, blood: 2200, emoji: '🦅', runBlood: 140, desc: 'Penyergapan menukik tajam dari udara dengan cakar pelindung mengincar mata.' },
  { nama: 'Locust Fiend', rank: 'A', tipe: 'Fiend', hp: 800, dmg: 330, exp: 470, blood: 2150, emoji: '🦗', runBlood: 135, desc: 'Lompatan acak berkecepatan tinggi yang membingungkan sasaran sergap.' },
  { nama: 'Owl Fiend', rank: 'A', tipe: 'Fiend', hp: 820, dmg: 345, exp: 485, blood: 2210, emoji: '🦉', runBlood: 115, desc: 'Memutar kepala secara tak wajar untuk memantau pergerakan musuh dari segala arah.' },
  { nama: 'Bat Fiend', rank: 'A', tipe: 'Fiend', hp: 830, dmg: 355, exp: 495, blood: 2250, emoji: '🦇', runBlood: 130, desc: 'Pekikan suara ultrasonik yang memicu pendarahan pada selaput gendang telinga.' },
  { nama: 'Silence Hybrid', rank: 'A', tipe: 'Hybrid', hp: 860, dmg: 330, exp: 490, blood: 2220, emoji: '🤫', runBlood: 0, desc: 'Menghilangkan seluruh gelombang suara sekitar untuk meluncurkan serangan sergap.' },
  { nama: 'Spider Fiend', rank: 'A', tipe: 'Fiend', hp: 840, dmg: 360, exp: 505, blood: 2290, emoji: '🕷️', runBlood: 120, desc: 'Kaki-kaki tajam mencuat dari punggung yang mencabik pertahanan terdekat.' },
  { nama: 'Puppet Hybrid', rank: 'A', tipe: 'Hybrid', hp: 880, dmg: 340, exp: 500, blood: 2280, emoji: '🎎', runBlood: 0, desc: 'Mengendalikan benang manekin untuk memanipulasi pergerakan fisik musuh.' },
  { nama: 'Fox Fiend', rank: 'A', tipe: 'Fiend', hp: 845, dmg: 365, exp: 510, blood: 2295, emoji: '🦊', runBlood: 125, desc: 'Pergerakan lincah yang memanfaatkan rahang tajam untuk mencengkram leher musuh.' },
  { nama: 'Ghost Hybrid', rank: 'A', tipe: 'Hybrid', hp: 890, dmg: 350, exp: 510, blood: 2300, emoji: '👻', runBlood: 150, desc: 'Tubuh hibrida transparan yang mampu menembus serangan fisik musuh tanpa terluka.' },
  { nama: 'Mantis Fiend', rank: 'A', tipe: 'Fiend', hp: 850, dmg: 375, exp: 515, blood: 2320, emoji: '🦗', runBlood: 100, desc: 'Sabetan lengan sabit bertubi-tubi yang memotong pembuluh darah utama.' },
  { nama: 'Scorpion Fiend', rank: 'A', tipe: 'Fiend', hp: 865, dmg: 385, exp: 520, blood: 2360, emoji: '🦂', runBlood: 110, desc: 'Ekor tulang beracun yang menusuk dan menyuntikkan patogen kelumpuhan.' },
  { nama: 'Hornet Fiend', rank: 'A', tipe: 'Fiend', hp: 855, dmg: 370, exp: 518, blood: 2370, emoji: '🐝', runBlood: 110, desc: 'Tusukan sengat berulang kali yang menyuntikkan bisa penyebab pembengkakan.' },
  { nama: 'Poison Hybrid', rank: 'A', tipe: 'Hybrid', hp: 870, dmg: 420, exp: 525, blood: 2380, emoji: '☠️', runBlood: 250, desc: 'Menyemburkan uap kimia beracun yang menggerogoti ketahanan fisik musuh.' },
  { nama: 'Scythe Fiend', rank: 'A', tipe: 'Fiend', hp: 880, dmg: 390, exp: 540, blood: 2350, emoji: '🪝', runBlood: 400, desc: 'Lengan yang berubah menjadi sabit besar pemotong leher pemburu iblis sipil.' },
  { nama: 'Cobra Fiend', rank: 'A', tipe: 'Fiend', hp: 860, dmg: 380, exp: 522, blood: 2390, emoji: '🐍', runBlood: 105, desc: 'Semprotan asam beracun dari jarak menengah yang merusak saluran penglihatan.' },
  { nama: 'Snake Fiend', rank: 'A', tipe: 'Fiend', hp: 875, dmg: 395, exp: 530, blood: 2410, emoji: '🐍', runBlood: 90, desc: 'Meliuk cepat di atas permukaan tanah dan menyemburkan asam lambung pekat.' },
  { nama: 'Tornado Fiend', rank: 'A', tipe: 'Fiend', hp: 920, dmg: 370, exp: 530, blood: 2400, emoji: '🌪️', runBlood: 0, desc: 'Memutar organ tubuhnya untuk memicu pusaran angin kencang pembawa pecahan kaca.' },
  { nama: 'Whip Hybrid', rank: 'A', tipe: 'Hybrid', hp: 900, dmg: 360, exp: 520, blood: 2400, emoji: '⛓️', runBlood: 0, desc: 'Cambukan tali berapi berkecepatan tinggi dari kulit lengan yang mencambuk sasaran jarak jauh.' },
  { nama: 'Wolf Fiend', rank: 'A', tipe: 'Fiend', hp: 880, dmg: 390, exp: 535, blood: 2420, emoji: '🐺', runBlood: 95, desc: 'Gigitan rahang buas yang tidak akan melepaskan cengkramannya sebelum daging robek.' },
  { nama: 'Future Hybrid', rank: 'A', tipe: 'Hybrid', hp: 910, dmg: 370, exp: 535, blood: 2450, emoji: '🔮', runBlood: 100, desc: 'Prediksi gerakan bertarung beberapa detik ke depan untuk menghindari tebasan musuh.' },
  { nama: 'Centipede Fiend', rank: 'A', tipe: 'Fiend', hp: 890, dmg: 385, exp: 538, blood: 2460, emoji: '🐛', runBlood: 95, desc: 'Merayap cepat di atas tubuh korban sembari melukai kulit dengan barisan kaki.' },
  { nama: 'Jaguar Fiend', rank: 'A', tipe: 'Fiend', hp: 895, dmg: 388, exp: 538, blood: 2470, emoji: '🐆', runBlood: 70, desc: 'Inang pemanjat pohon lincah yang menyergap target dari ketinggian cabang.' },
  { nama: 'Longsword Hybrid', rank: 'A', tipe: 'Hybrid', hp: 950, dmg: 380, exp: 550, blood: 2500, emoji: '⚔️', runBlood: 0, desc: 'Transformasi pedang ganda panjang dari lengan yang mengandalkan kecepatan tebasan silang.' },
  { nama: 'Lightning Hybrid', rank: 'A', tipe: 'Hybrid', hp: 920, dmg: 410, exp: 550, blood: 2480, emoji: '⚡', runBlood: 180, desc: 'Kecepatan bergerak secepat kilat dengan efek kejutan listrik pada setiap sabetan.' },
  { nama: 'Ice Hybrid', rank: 'A', tipe: 'Hybrid', hp: 940, dmg: 380, exp: 545, blood: 2520, emoji: '🧊', runBlood: 120, desc: 'Membekukan bagian tubuh musuh yang bersentuhan langsung saat adu pukulan.' },
  { nama: 'Python Fiend', rank: 'A', tipe: 'Fiend', hp: 900, dmg: 390, exp: 540, blood: 2490, emoji: '🐍', runBlood: 85, desc: 'Lilitan otot masif di sekitar dada korban yang memicu kelumpuhan napas.' },
  { nama: 'Panther Hybrid', rank: 'A', tipe: 'Hybrid', hp: 915, dmg: 388, exp: 548, blood: 2510, emoji: '🐆', runBlood: 85, desc: 'Penyergapan kilat bayangan hitam hibrida macan yang mengincar urat leher.' },
  { nama: 'Tiger Fiend', rank: 'A', tipe: 'Fiend', hp: 905, dmg: 395, exp: 545, blood: 2500, emoji: '🐅', runBlood: 65, desc: 'Inang berwujud harimau dengan cakar memanjang yang memotong arteri vital.' },
  { nama: 'Void Hybrid', rank: 'A', tipe: 'Hybrid', hp: 935, dmg: 395, exp: 555, blood: 2540, emoji: '🕳️', runBlood: 0, desc: 'Menyerap energi kinetik benturan musuh ke dalam rongga hampa tubuhnya.' },
  { nama: 'Curse Hybrid', rank: 'A', tipe: 'Hybrid', hp: 930, dmg: 400, exp: 560, blood: 2550, emoji: '📍', runBlood: 200, desc: 'Menusukkan pedang paku ke tubuh musuh untuk memicu eksekusi kutukan kematian.' },
  { nama: 'Lion Fiend', rank: 'A', tipe: 'Fiend', hp: 915, dmg: 400, exp: 550, blood: 2530, emoji: '🦁', runBlood: 60, desc: 'Mayat bernyawa dengan surai lebat yang menerkam tenggorokan sasaran.' },
  { nama: 'Armor Fiend', rank: 'A', tipe: 'Fiend', hp: 1100, dmg: 310, exp: 500, blood: 2200, emoji: '🛡️', runBlood: 0, desc: 'Mayat berlapis kerangka besi pelindung tebal yang berfungsi sebagai tameng lini depan.' },
  { nama: 'Gator Fiend', rank: 'A', tipe: 'Fiend', hp: 925, dmg: 400, exp: 555, blood: 2560, emoji: '🐊', runBlood: 75, desc: 'Seretan rahang bersisik yang menarik korban ke dalam area pertempuran.' },
  { nama: 'Boar Hybrid', rank: 'A', tipe: 'Hybrid', hp: 945, dmg: 405, exp: 565, blood: 2590, emoji: '🐗', runBlood: 55, desc: 'Terjangan taring ganda hibrida babi hutan yang merobek bagian paha musuh.' },
  { nama: 'Gravity Hybrid', rank: 'A', tipe: 'Hybrid', hp: 960, dmg: 390, exp: 570, blood: 2600, emoji: '🌌', runBlood: 0, desc: 'Memperberat tekanan gravitasi di sekitar target untuk memperlambat gerakan.' },
  { nama: 'Spear Hybrid', rank: 'A', tipe: 'Hybrid', hp: 980, dmg: 410, exp: 580, blood: 2650, emoji: '🔱', runBlood: 350, desc: 'Lemparan tombak tulang tajam berkecepatan tinggi yang dapat menembus tubuh target.' },
  { nama: 'Bull Fiend', rank: 'A', tipe: 'Fiend', hp: 950, dmg: 415, exp: 570, blood: 2620, emoji: '🐂', runBlood: 60, desc: 'Terjangan tanduk melengkung yang melempar musuh hingga menembus tembok.' },
  { nama: 'Crocodile Fiend', rank: 'A', tipe: 'Fiend', hp: 935, dmg: 405, exp: 560, blood: 2580, emoji: '🐊', runBlood: 65, desc: 'Gigitan kuat diikuti putaran tubuh mendadak yang mematahkan persendian.' },
  { nama: 'Tiger Hybrid', rank: 'A', tipe: 'Hybrid', hp: 975, dmg: 422, exp: 588, blood: 2690, emoji: '🐅', runBlood: 50, desc: 'Kombinasi kecepatan dan kekuatan cakar hibrida harimau yang sangat agresif.' },
  { nama: 'Stone Hybrid', rank: 'A', tipe: 'Hybrid', hp: 1000, dmg: 420, exp: 590, blood: 2700, emoji: '🪨', runBlood: 0, desc: 'Kulit berlapis batuan keras yang mengurangi dampak benturan serangan tajam.' },
  { nama: 'Bear Fiend', rank: 'A', tipe: 'Fiend', hp: 970, dmg: 425, exp: 580, blood: 2680, emoji: '🐻', runBlood: 70, desc: 'Cakaran dua tangan berat yang sanggup merobek tameng besi pelindung.' },
  { nama: 'Lion Hybrid', rank: 'A', tipe: 'Hybrid', hp: 985, dmg: 428, exp: 592, blood: 2720, emoji: '🦁', runBlood: 45, desc: 'Dominasi pertarungan hibrida singa dengan gigitan rahang peremas tulang.' },
  { nama: 'Rhino Fiend', rank: 'A', tipe: 'Fiend', hp: 960, dmg: 420, exp: 575, blood: 2650, emoji: '🦏', runBlood: 50, desc: 'Cula tebal keras yang menembus pertahanan armor terkuat di lini depan.' },
  { nama: 'Gorilla Fiend', rank: 'A', tipe: 'Fiend', hp: 990, dmg: 435, exp: 595, blood: 2720, emoji: '🦍', runBlood: 40, desc: 'Pukulan ganda dari atas kepala yang meremukkan susunan tulang rusuk.' },
  { nama: 'Hippo Fiend', rank: 'A', tipe: 'Fiend', hp: 980, dmg: 430, exp: 585, blood: 2700, emoji: '🦛', runBlood: 35, desc: 'Bukaan mulut lebar bermata taring yang memotong anggota tubuh seketika.' },
  { nama: 'Muscle Hybrid', rank: 'A', tipe: 'Hybrid', hp: 1020, dmg: 430, exp: 600, blood: 2750, emoji: '💪', runBlood: 0, desc: 'Penguatan massa serat otot tubuh yang meningkatkan kekuatan pukulan murni.' },
  { nama: 'Flamethrower Hybrid', rank: 'A', tipe: 'Hybrid', hp: 1050, dmg: 440, exp: 610, blood: 2800, emoji: '🔥', runBlood: 0, desc: 'Semburan gas napalm panas dari tabung lengan yang membakar area pertempuran menjadi abu.' },
  { nama: 'Elephant Fiend', rank: 'A', tipe: 'Fiend', hp: 1010, dmg: 445, exp: 610, blood: 2820, emoji: '🐘', runBlood: 20, desc: 'Injakan kaki berat yang memicu guncangan tanah lokal di sekitar target.' },
  { nama: 'Eel Devil', rank: 'A', tipe: 'Devil', hp: 1180, dmg: 470, exp: 690, blood: 3150, emoji: '🐟', runBlood: 60, desc: 'Pelepasan lonjakan tegangan listrik biologis masif yang menyengat saraf.' },
  { nama: 'Anemone Devil', rank: 'A', tipe: 'Devil', hp: 1220, dmg: 460, exp: 700, blood: 3200, emoji: '🪸', runBlood: 40, desc: 'Menjerat tubuh sasaran dalam sulur-sulur beracun yang melumpuhkan gerakan.' },
  { nama: 'Gun Fiend', rank: 'A', tipe: 'Fiend', hp: 1200, dmg: 480, exp: 700, blood: 3200, emoji: '⛄', runBlood: 0, desc: 'Inang tragis yang menembakkan peluru membabi buta sembari mengalami halusinasi permainan salju.' },
  { nama: 'Squid Devil', rank: 'A', tipe: 'Devil', hp: 1210, dmg: 480, exp: 710, blood: 3250, emoji: '🦑', runBlood: 70, desc: 'Tentakel masif yang membelenggu pergerakan seluruh tim musuh di area.' },
  { nama: 'Typhoon Devil', rank: 'A', tipe: 'Devil', hp: 1300, dmg: 550, exp: 780, blood: 3300, emoji: '🌀', runBlood: 0, desc: 'Badai pemicu banjir dan angin kencang yang meruntuhkan permukiman kota dalam sekejap.' },
  { nama: 'Shark Devil', rank: 'A', tipe: 'Devil', hp: 1250, dmg: 510, exp: 730, blood: 3400, emoji: '🦈', runBlood: 50, desc: 'Monster pemakan daging bersirip tajam yang berenang bebas di balik tanah.' },
  { nama: 'Urchin Devil', rank: 'A', tipe: 'Devil', hp: 1280, dmg: 500, exp: 725, blood: 3450, emoji: '🪨', runBlood: 20, desc: 'Meledakkan duri-duri hitam tajam dari permukaan tubuhnya ke segala arah.' },
  { nama: 'Crab Devil', rank: 'A', tipe: 'Devil', hp: 1320, dmg: 490, exp: 740, blood: 3550, emoji: '🦀', runBlood: 30, desc: 'Pertahanan cangkang berlapis baja tebal yang sulit dihancurkan serangan biasa.' },
  { nama: 'Jaguar Devil', rank: 'A', tipe: 'Devil', hp: 1360, dmg: 530, exp: 775, blood: 3600, emoji: '🐆', runBlood: 35, desc: 'Kekuatan gigitan menembus tempurung kepala predator Amerika Selatan.' },
  { nama: 'Tiger Devil', rank: 'A', tipe: 'Devil', hp: 1380, dmg: 540, exp: 790, blood: 3650, emoji: '🐅', runBlood: 30, desc: 'Terkaman mematikan dari predator belang raksasa yang meremukkan bahu.' },
  { nama: 'Lion Devil', rank: 'A', tipe: 'Devil', hp: 1400, dmg: 550, exp: 800, blood: 3700, emoji: '🦁', runBlood: 25, desc: 'Raungan menggelegar penguasa rimba yang menghentikan detak jantung musuh.' },
  { nama: 'Whale Devil', rank: 'A', tipe: 'Devil', hp: 1450, dmg: 560, exp: 820, blood: 3850, emoji: '🐳', runBlood: 0, desc: 'Guncangan gelombang suara raksasa dari paru-parunya yang memecahkan otak.' },
  { nama: 'Accident Devil', rank: 'A', tipe: 'Devil', hp: 1500, dmg: 650, exp: 900, blood: 4000, emoji: '⚠️', runBlood: 0, desc: 'Kecemasan mendalam akan kejadian buruk tak terduga yang merenggut nyawa secara instan.' },
  { nama: 'Justice Devil', rank: 'A', tipe: 'Devil', hp: 1600, dmg: 700, exp: 950, blood: 4200, emoji: '⚖️', runBlood: 0, desc: 'Entitas raksasa pemicu kontrak yang menghakimi musuh berdasarkan definisi keadilan menyimpang.' },

  // =============================================================
  // === RANK S - ENTITAS TRANSENDENTAL & ANCAMAN KATASTROFE ===
  // =============================================================
  { nama: 'Crossbow Fiend', rank: 'S', tipe: 'Fiend', hp: 2450, dmg: 580, exp: 1220, blood: 6800, emoji: '🏹', runBlood: 0, desc: 'Wadah pemburu panah berkecepatan tinggi yang menyerang titik lemah musuh.' },
  { nama: 'Claw Fiend', rank: 'S', tipe: 'Fiend', hp: 2400, dmg: 570, exp: 1200, blood: 6600, emoji: '🦅', runBlood: 0, desc: 'Mayat bercakar tajam yang memotong arteri vital sasaran dalam sekali tebas.' },
  { nama: 'Fang Fiend', rank: 'S', tipe: 'Fiend', hp: 2420, dmg: 575, exp: 1210, blood: 6650, emoji: '🐺', runBlood: 0, desc: 'Wadah bertaring monster yang merobek bagian leher dan dada target.' },
  { nama: 'Katana Fiend', rank: 'S', tipe: 'Fiend', hp: 2500, dmg: 590, exp: 1250, blood: 6900, emoji: '🗡️', runBlood: 0, desc: 'Inang ahli pedang yakuza yang melancarkan sabetan mematikan berkecepatan tinggi.' },
  { nama: 'Flame Fiend', rank: 'S', tipe: 'Fiend', hp: 2480, dmg: 595, exp: 1240, blood: 6850, emoji: '🔥', runBlood: 0, desc: 'Inang terbakar yang menyebarkan gelombang panas pekat ke seluruh koridor.' },
  { nama: 'Bomb Fiend', rank: 'S', tipe: 'Fiend', hp: 2520, dmg: 610, exp: 1270, blood: 6950, emoji: '💣', runBlood: 0, desc: 'Wadah agen rahasia yang meledakkan anggota tubuhnya untuk merusak lini pertahanan.' },
  { nama: 'Love Fiend', rank: 'S', tipe: 'Fiend', hp: 2550, dmg: 600, exp: 1280, blood: 7000, emoji: '💘', runBlood: 0, desc: 'Inang berparas menawan yang memikat musuh hingga tidak mampu meluncurkan serangan.' },
  { nama: 'Cosmos Fiend', rank: 'S', tipe: 'Fiend', hp: 2600, dmg: 620, exp: 1300, blood: 7200, emoji: '🌌', runBlood: 0, desc: 'Mayat bertengkorak terbuka yang melumpuhkan kesadaran musuh dengan mantra pengetahuan total.' },
  { nama: 'Regret Fiend', rank: 'S', tipe: 'Fiend', hp: 2650, dmg: 630, exp: 1320, blood: 7300, emoji: '😭', runBlood: 0, desc: 'Wadah penderitaan yang memicu efek kelemahan fisik pada seluruh musuh di sekitar.' },
  { nama: 'Nightmare Fiend', rank: 'S', tipe: 'Fiend', hp: 2700, dmg: 650, exp: 1350, blood: 7400, emoji: '😱', runBlood: 0, desc: 'Inang kurus yang menyebarkan ilusi mematikan langsung ke dalam pikiran korban.' },
  { nama: 'Plague Fiend', rank: 'S', tipe: 'Fiend', hp: 2720, dmg: 655, exp: 1360, blood: 7450, emoji: '☣️', runBlood: 0, desc: 'Wadah pembawa spora beracun yang merusak sistem regenerasi HP tim musuh.' },
  { nama: 'Falling Fiend', rank: 'S', tipe: 'Fiend', hp: 2750, dmg: 660, exp: 1380, blood: 7600, emoji: '🪽', runBlood: 0, desc: 'Wadah manusia berdada terbalik yang membalikkan pergerakan fisik lawan ke udara.' },
  { nama: 'Thunder Fiend', rank: 'S', tipe: 'Fiend', hp: 2820, dmg: 675, exp: 1390, blood: 7750, emoji: '🌩️', runBlood: 0, desc: 'Mayat hangus yang memancarkan energi listrik statis tegangan tinggi saat disentuh.' },
  { nama: 'Hell Fiend', rank: 'S', tipe: 'Fiend', hp: 2800, dmg: 680, exp: 1400, blood: 7800, emoji: '🔥', runBlood: 0, desc: 'Wadah manusia pemanggil portal neraka yang membakar area sekitar dengan api hitam.' },
  { nama: 'Witch Fiend', rank: 'S', tipe: 'Fiend', hp: 2850, dmg: 690, exp: 1420, blood: 7900, emoji: '🧙', runBlood: 0, desc: 'Inang penyihir yang memindahkan kerusakan fisik tubuhnya ke boneka tumbal.' },
  { nama: 'Ocean Fiend', rank: 'S', tipe: 'Fiend', hp: 2880, dmg: 695, exp: 1430, blood: 7950, emoji: '🌊', runBlood: 0, desc: 'Inang air asin yang memuntahkan gelombang asam pekat ke seluruh koridor.' },
  { nama: 'Prison Fiend', rank: 'S', tipe: 'Fiend', hp: 2900, dmg: 700, exp: 1450, blood: 8000, emoji: '🔗', runBlood: 0, desc: 'Inang berantai besi yang membatasi seluruh pergerakan musuh di dalam area pertempuran.' },
  { nama: 'Chaos Fiend', rank: 'S', tipe: 'Fiend', hp: 2920, dmg: 705, exp: 1460, blood: 8100, emoji: '🌀', runBlood: 0, desc: 'Wadah tak terkendali yang memicu gelombang serangan acak beruntun ke seluruh area.' },
  { nama: 'Tyranny Fiend', rank: 'S', tipe: 'Fiend', hp: 2950, dmg: 710, exp: 1480, blood: 8200, emoji: '👑', runBlood: 0, desc: 'Mayat bermahkota yang memaksa musuh berlutut dan mengurangi daya serang mereka.' },
  { nama: 'Oblivion Fiend', rank: 'S', tipe: 'Fiend', hp: 2980, dmg: 720, exp: 1490, blood: 8300, emoji: '👁️', runBlood: 0, desc: 'Inang keheningan yang menghapus ingatan jurus bertarung musuh untuk beberapa saat.' },
  { nama: 'Claw Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3500, dmg: 880, exp: 1750, blood: 9800, emoji: '🦅', runBlood: 0, desc: 'Hibrida bercakar besar yang merobek bagian dada dan menghancurkan kerangka pelindung utama.' },
  { nama: 'Fang Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3550, dmg: 890, exp: 1770, blood: 9900, emoji: '🐺', runBlood: 0, desc: 'Hibrida bertaring tajam yang mencengkeram tenggorokan sasaran dan merobek jaringan vital.' },
  { nama: 'Flame Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3600, dmg: 900, exp: 1800, blood: 10000, emoji: '🔥', runBlood: 0, desc: 'Hibrida penyembur api yang membakar jaringan sel musuh hingga menjadi abu dalam waktu singkat.' },
  { nama: 'Katana Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3700, dmg: 920, exp: 1850, blood: 10500, emoji: '🗡️', runBlood: 0, desc: 'Hibrida pedang silang yang melakukan tebasan tak terlihat berkecepatan suara untuk membelah musuh.' },
  { nama: 'Love Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3650, dmg: 910, exp: 1820, blood: 10200, emoji: '💘', runBlood: 0, desc: 'Hibrida manipulasi kasih sayang yang mengubah rasa cinta menjadi senjata tajam pemotong.' },
  { nama: 'Regret Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3720, dmg: 920, exp: 1840, blood: 10400, emoji: '😭', runBlood: 0, desc: 'Hibrida keputusasaan yang menurunkan daya tahan fisik seluruh lawan di sekitarnya.' },
  { nama: 'Crossbow Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3800, dmg: 950, exp: 1900, blood: 11000, emoji: '🏹', runBlood: 0, desc: 'Hibrida panah bertanduk yang memuntahkan ratusan anak panah berujung tulang dalam hitungan detik.' },
  { nama: 'Cosmos Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3750, dmg: 930, exp: 1870, blood: 10700, emoji: '🌌', runBlood: 0, desc: 'Hibrida pengetahuan semesta yang melumpuhkan transmisi otak musuh secara langsung.' },
  { nama: 'Bomb Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3900, dmg: 980, exp: 1950, blood: 11500, emoji: '💣', runBlood: 0, desc: 'Hibrida mesiu taktis yang memicu reaksi ledakan berantai dari leher dan tangannya untuk meratakan daratan.' },
  { nama: 'Plague Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3780, dmg: 940, exp: 1880, blood: 10800, emoji: '☣️', runBlood: 0, desc: 'Hibrida patogen yang menyebarkan racun biologis pembusuk daging melalui cakar.' },
  { nama: 'Witch Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3820, dmg: 950, exp: 1900, blood: 10900, emoji: '🧙', runBlood: 0, desc: 'Hibrida kutukan kuno yang mengembalikan sebagian kerusakan fisik kepada penyerang.' },
  { nama: 'Falling Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3850, dmg: 960, exp: 1920, blood: 11200, emoji: '🪽', runBlood: 0, desc: 'Hibrida pembalik gravitasi yang melemparkan musuh ke langit-langit sebelum dijatuhkan.' },
  { nama: 'Thunder Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3870, dmg: 965, exp: 1930, blood: 11300, emoji: '🌩️', runBlood: 0, desc: 'Hibrida kilat kilat yang bergerak berkecepatan suara dan memanggang otot musuh.' },
  { nama: 'Nightmare Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3880, dmg: 970, exp: 1940, blood: 11350, emoji: '😱', runBlood: 0, desc: 'Hibrida ilusi mimpi buruk yang memberikan kerusakan mental langsung pada musuh.' },
  { nama: 'Ocean Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3920, dmg: 975, exp: 1960, blood: 11600, emoji: '🌊', runBlood: 0, desc: 'Hibrida tekanan air yang mampu menciptakan ledakan hidrolik dari kepalan tangan.' },
  { nama: 'Chaos Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3980, dmg: 985, exp: 1970, blood: 11700, emoji: '🌀', runBlood: 0, desc: 'Hibrida anomali yang memutarbalikkan posisi dan arah serangan target secara mendadak.' },
  { nama: 'Hell Hybrid', rank: 'S', tipe: 'Hybrid', hp: 3950, dmg: 990, exp: 1980, blood: 11800, emoji: '🔥', runBlood: 0, desc: 'Hibrida gerbang neraka yang memanggil kobaran api hitam dari belahan tanah.' },
  { nama: 'Cosmos Devil', rank: 'S', tipe: 'Devil', hp: 4000, dmg: 1100, exp: 2000, blood: 12000, emoji: '🌌', runBlood: 0, desc: 'Wujud murni Iblis Kosmos yang menjejalkan miliaran berkas ingatan alam semesta hingga otak terbakar.' },
  { nama: 'Love Devil', rank: 'S', tipe: 'Devil', hp: 4200, dmg: 1150, exp: 2100, blood: 12500, emoji: '💘', runBlood: 0, desc: 'Manipulator emosional yang menyiksa batin musuh melalui fobia penolakan, patah hati, dan obsesi gila.' },
  { nama: 'Tyranny Hybrid', rank: 'S', tipe: 'Hybrid', hp: 4000, dmg: 1000, exp: 2000, blood: 12000, emoji: '👑', runBlood: 0, desc: 'Hibrida penundukan paksa yang menekan pertahanan fisik musuh hingga titik terendah.' },
  { nama: 'Oblivion Hybrid', rank: 'S', tipe: 'Hybrid', hp: 4020, dmg: 1010, exp: 2020, blood: 12100, emoji: '👁️', runBlood: 0, desc: 'Hibrida kehampaan yang membuat dirinya tidak dapat ditargetkan oleh serangan berturut-turut.' },
  { nama: 'Prison Hybrid', rank: 'S', tipe: 'Hybrid', hp: 4050, dmg: 1020, exp: 2050, blood: 12200, emoji: '🔗', runBlood: 0, desc: 'Hibrida jeruji rantai yang membelenggu fisik dan menyerap energi tarung sasaran.' },
  { nama: 'Darkness Hybrid', rank: 'S', tipe: 'Hybrid', hp: 4100, dmg: 1030, exp: 2080, blood: 12400, emoji: '🌑', runBlood: 0, desc: 'Hibrida kegelapan yang memotong anggota tubuh musuh dalam jangkauan bayangan pekat.' },
  { nama: 'Ghost Devil', rank: 'S', tipe: 'Devil', hp: 4600, dmg: 1180, exp: 2200, blood: 13000, emoji: '👻', runBlood: 0, desc: 'Wujud entitas bertangan seribu yang tidak bisa disentuh oleh serangan fisik konvensional.' },
  { nama: 'Snake Devil', rank: 'S', tipe: 'Devil', hp: 4700, dmg: 1220, exp: 2250, blood: 13200, emoji: '🐍', runBlood: 0, desc: 'Ular raksasa yang mampu menelan target utuh dan memuntahkannya kembali dalam keadaan hancur.' },
  { nama: 'Blood Devil', rank: 'S', tipe: 'Devil', hp: 4500, dmg: 1250, exp: 2300, blood: 13500, emoji: '🩸', runBlood: 0, desc: 'Wujud iblis murni dari darah yang mampu mengendalikan seluruh aliran cairan darah makhluk hidup dari luar.' },
  { nama: 'Curse Devil', rank: 'S', tipe: 'Devil', hp: 4900, dmg: 1270, exp: 2350, blood: 13800, emoji: '📍', runBlood: 0, desc: 'Tengkorak ganda raksasa yang meremukkan tubuh target yang telah terkena patokan paku.' },
  { nama: 'Regret Devil', rank: 'S', tipe: 'Devil', hp: 4800, dmg: 1200, exp: 2400, blood: 14000, emoji: '😭', runBlood: 0, desc: 'Lahir dari keputusasaan atas keputusan masa lalu yang salah, melemahkan mental bertarung musuh.' },
  { nama: 'Witch Devil', rank: 'S', tipe: 'Devil', hp: 5100, dmg: 1280, exp: 2450, blood: 14800, emoji: '🧙', runBlood: 0, desc: 'Manifestasi kutukan sihir hitam abad pertengahan, memanipulasi boneka jerami tumbal organ dari jauh.' },
  { nama: 'Falling Devil', rank: 'S', tipe: 'Devil', hp: 5000, dmg: 1300, exp: 2500, blood: 15000, emoji: '🪽', runBlood: 0, desc: 'Iblis Kejatuhan yang membalikkan gravitasi bumi berdasarkan tingkat trauma dan lubang batin target.' },
  { nama: 'Plague Devil', rank: 'S', tipe: 'Devil', hp: 5250, dmg: 1310, exp: 2500, blood: 15000, emoji: '☣️', runBlood: 0, desc: 'Ketakutan global akan wabah mematikan yang menyebarkan patogen pembusuk sel.' },
  { nama: 'Nightmare Devil', rank: 'S', tipe: 'Devil', hp: 5200, dmg: 1350, exp: 2600, blood: 15500, emoji: '😱', runBlood: 0, desc: 'Manifestasi sleep paralysis, memproyeksikan ilusi ketakutan bawah sadar paling mematikan.' },
  { nama: 'Punishment Devil', rank: 'S', tipe: 'Devil', hp: 5300, dmg: 1320, exp: 2550, blood: 15200, emoji: '⚖️', runBlood: 0, desc: 'Massa senjata tajam raksasa dari langit yang mengeksekusi musuh berdasarkan pengorbanan nyawa.' },
  { nama: 'Justice Devil', rank: 'S', tipe: 'Devil', hp: 5400, dmg: 1340, exp: 2600, blood: 15400, emoji: '⚖️', runBlood: 0, desc: 'Anomali raksasa bermata banyak yang mengubah bentuk manusia menjadi monster mutan patuh.' },
  { nama: 'Thunder Devil', rank: 'S', tipe: 'Devil', hp: 5450, dmg: 1360, exp: 2650, blood: 15800, emoji: '🌩️', runBlood: 0, desc: 'Badai petir purba pemutus rantai kehidupan yang memanipulasi energi kilat langit.' },
  { nama: 'Hell Devil', rank: 'S', tipe: 'Devil', hp: 5500, dmg: 1400, exp: 2800, blood: 16000, emoji: '🔥', runBlood: 0, desc: 'Penguasa gerbang neraka yang memanggil tangan raksasa dari langit untuk menyeret target ke jurang maut.' },
  { nama: 'Ocean Devil', rank: 'S', tipe: 'Devil', hp: 5600, dmg: 1380, exp: 2700, blood: 16500, emoji: '🌊', runBlood: 0, desc: 'Perwujudan fobia kedalaman laut yang meremukkan target dengan tekanan air raksasa.' },
  { nama: 'Chaos Devil', rank: 'S', tipe: 'Devil', hp: 5700, dmg: 1410, exp: 2750, blood: 16800, emoji: '🌀', runBlood: 0, desc: 'Fobia akan hancurnya keteraturan sosial yang mengacak status taktis pertempuran.' },
  { nama: 'Tyranny Devil', rank: 'S', tipe: 'Devil', hp: 5800, dmg: 1450, exp: 2900, blood: 17000, emoji: '👑', runBlood: 0, desc: 'Lahir dari ketakutan akan rezim diktator kejam, menekan kesadaran lawan dengan aura penundukan paksa.' },
  { nama: 'Prison Devil', rank: 'S', tipe: 'Devil', hp: 6000, dmg: 1500, exp: 3000, blood: 18000, emoji: '🔗', runBlood: 0, desc: 'Manifestasi ketakutan akan kurungan bawah tanah dan hilangnya kebebasan, merantai pergerakan target total.' },
  { nama: 'Oblivion Devil', rank: 'S', tipe: 'Devil', hp: 5900, dmg: 1480, exp: 2850, blood: 17500, emoji: '👁️', runBlood: 0, desc: 'Ketakutan akan dilupakan sepenuhnya yang melumpuhkan kesadaran musuh secara mutlak.' },

  // ======================================================================
  // === RANK SS - PRIMAL FEARS & ANCAMAN BENCANA GLOBAL MUTLAK ===
  // ======================================================================
  { nama: 'Zombie Fiend', rank: 'SS', tipe: 'Fiend', hp: 3100, dmg: 420, exp: 2300, blood: 9500, emoji: '🧟', runBlood: 0, desc: 'Komandan bangkai hidup yang memanggil kerumunan zombie untuk mengeroyok lini depan.' },
  { nama: 'Silence Fiend', rank: 'SS', tipe: 'Fiend', hp: 3200, dmg: 425, exp: 2310, blood: 9700, emoji: '🤫', runBlood: 0, desc: 'Wadah keheningan yang menghentikan penggunaan kemampuan khusus musuh sesaat.' },
  { nama: 'Ghost Fiend', rank: 'SS', tipe: 'Fiend', hp: 3150, dmg: 430, exp: 2320, blood: 9600, emoji: '👻', runBlood: 0, desc: 'Mayat transparan yang menyerang organ dalam musuh secara langsung tanpa menyentuh kulit.' },
  { nama: 'Puppet Fiend', rank: 'SS', tipe: 'Fiend', hp: 3250, dmg: 440, exp: 2350, blood: 9800, emoji: '🎎', runBlood: 0, desc: 'Inang manekin kayu yang mengendalikan tubuh manusia mati untuk dijadikan perisai.' },
  { nama: 'Needle Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3260, dmg: 438, exp: 2360, blood: 9850, emoji: '🪡', runBlood: 0, desc: 'Hibrida jarum medis yang menusuk titik saraf vital musuh untuk mengurangi daya serang.' },
  { nama: 'Mold Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3290, dmg: 442, exp: 2390, blood: 9950, emoji: '🍄', runBlood: 0, desc: 'Hibrida spora jamur yang melemahkan sistem regenerasi darah dan jaringan fisik lawan.' },
  { nama: 'Typhoon Fiend', rank: 'SS', tipe: 'Fiend', hp: 3280, dmg: 435, exp: 2380, blood: 9900, emoji: '🌀', runBlood: 0, desc: 'Inang badai yang menghembuskan angin bertekanan tinggi untuk merusak penglihatan.' },
  { nama: 'Zombie Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3300, dmg: 450, exp: 2400, blood: 10000, emoji: '🧟', runBlood: 0, desc: 'Hibrida mayat yang mampu bangkit secara berulang pasca menerima serangan fatal.' },
  { nama: 'Future Fiend', rank: 'SS', tipe: 'Fiend', hp: 3300, dmg: 445, exp: 2450, blood: 10100, emoji: '🔮', runBlood: 0, desc: 'Inang bermata masa depan yang memiliki tingkat penghindaran serangan fisik sangat tinggi.' },
  { nama: 'Leech Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3350, dmg: 455, exp: 2420, blood: 10200, emoji: '🪱', runBlood: 0, desc: 'Hibrida pengisap darah yang menyerap HP musuh setiap kali meluncurkan serangan fisik.' },
  { nama: 'Void Fiend', rank: 'SS', tipe: 'Fiend', hp: 3370, dmg: 448, exp: 2470, blood: 10300, emoji: '🕳️', runBlood: 0, desc: 'Wadah hampa udara yang menyerap sebagian energi serangan fisik untuk memulihkan HP.' },
  { nama: 'Poison Fiend', rank: 'SS', tipe: 'Fiend', hp: 3360, dmg: 462, exp: 2490, blood: 10350, emoji: '☠️', runBlood: 0, desc: 'Wadah racun pekat yang merusak ketahanan tubuh musuh secara berkala.' },
  { nama: 'Accident Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3380, dmg: 465, exp: 2480, blood: 10400, emoji: '⚠️', runBlood: 0, desc: 'Hibrida kecelakaan yang memicu kehancuran mekanis tak terduga pada perlengkapan lawan.' },
  { nama: 'Lightning Fiend', rank: 'SS', tipe: 'Fiend', hp: 3410, dmg: 466, exp: 2510, blood: 10550, emoji: '⚡', runBlood: 0, desc: 'Mayat teraliri kilat yang memberikan efek sengatan kelumpuhan pada penyerang.' },
  { nama: 'Curse Fiend', rank: 'SS', tipe: 'Fiend', hp: 3400, dmg: 475, exp: 2500, blood: 10600, emoji: '📍', runBlood: 0, desc: 'Mayat berujung jarum paku yang mengumpulkan efek kutukan kematian pada target.' },
  { nama: 'Gravity Fiend', rank: 'SS', tipe: 'Fiend', hp: 3420, dmg: 458, exp: 2520, blood: 10700, emoji: '🌌', runBlood: 0, desc: 'Inang gravitasi yang menekan tubuh musuh ke tanah dan mengurangi daya tahan fisik.' },
  { nama: 'Justice Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3450, dmg: 470, exp: 2550, blood: 10800, emoji: '⚖️', runBlood: 0, desc: 'Hibrida keadilan menyimpang yang mengubah bagian tubuhnya menjadi organ pemukul besar.' },
  { nama: 'Doll Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3480, dmg: 468, exp: 2600, blood: 10900, emoji: '🎎', runBlood: 0, desc: 'Hibrida boneka yang mampu memindahkan kerusakan fisik yang diterimanya ke unit lain.' },
  { nama: 'Ice Fiend', rank: 'SS', tipe: 'Fiend', hp: 3490, dmg: 452, exp: 2580, blood: 10950, emoji: '🧊', runBlood: 0, desc: 'Inang beku yang menurunkan kecepatan giliran bertindak seluruh barisan musuh.' },
  { nama: 'Nightmare Stalker', rank: 'SS', tipe: 'Fiend', hp: 3400, dmg: 460, exp: 2500, blood: 10500, emoji: '😱', runBlood: 450, desc: 'Inang kurus kering manipulator mimpi buruk bawah sadar yang menyerang dari sudut buta ruangan.' },
  { nama: 'Typhoon Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3520, dmg: 480, exp: 2680, blood: 11100, emoji: '🌀', runBlood: 0, desc: 'Hibrida pusaran angin kencang yang melemparkan barisan pertahanan musuh ke udara.' },
  { nama: 'Eternity Fiend', rank: 'SS', tipe: 'Fiend', hp: 3550, dmg: 460, exp: 2650, blood: 11200, emoji: '♾️', runBlood: 0, desc: 'Inang pelipat dimensi yang memperlambat giliran memukul seluruh tim musuh.' },
  { nama: 'Katana Master', rank: 'SS', tipe: 'Fiend', hp: 3200, dmg: 480, exp: 2600, blood: 11000, emoji: '🗡️', runBlood: 300, desc: 'Pembalasan dendam berdarah yang menebas dengan ayunan pedang silang mematikan saraf.' },
  { nama: 'Muscle Fiend', rank: 'SS', tipe: 'Fiend', hp: 3580, dmg: 472, exp: 2690, blood: 11400, emoji: '💪', runBlood: 0, desc: 'Inang berserat otot tebal yang melancarkan pukulan meremukkan tulang rusuk musuh.' },
  { nama: 'Scythe Executioner', rank: 'SS', tipe: 'Fiend', hp: 3600, dmg: 495, exp: 2700, blood: 11500, emoji: '🪝', runBlood: 300, desc: 'Petarung bermutasi dengan lengan sabit besar yang mengeksekusi sisa pemburu iblis regional.' },
  { nama: 'Stone Fiend', rank: 'SS', tipe: 'Fiend', hp: 3620, dmg: 450, exp: 2720, blood: 11600, emoji: '🪨', runBlood: 0, desc: 'Tubuh inang berlapis batuan purba yang memantulkan sebagian serangan jarak dekat.' },
  { nama: 'Punishment Fiend', rank: 'SS', tipe: 'Fiend', hp: 3650, dmg: 485, exp: 2750, blood: 11800, emoji: '⚖️', runBlood: 0, desc: 'Wadah eksekutor yang meluncurkan sabetan ganda dengan mengorbankan sebagian HP miliknya.' },
  { nama: 'Tornado Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3650, dmg: 478, exp: 2780, blood: 11900, emoji: '🌪️', runBlood: 0, desc: 'Hibrida angin pusaran yang mengacak urutan giliran memukul barisan lawan.' },
{ nama: 'Bomb Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3500, dmg: 495, exp: 2800, blood: 12000, emoji: '💣', runBlood: 0, desc: 'Wujud Hybrid taktis Bom dalam batasan fisik manusia yang meledakkan organ tubuhnya demi serangan.' },
{ nama: 'Scythe Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3700, dmg: 492, exp: 2850, blood: 12100, emoji: '🪝', runBlood: 0, desc: 'Hibrida sabit pemanen yang memotong leher dan anggota tubuh musuh dari jarak dekat.' },
{ nama: 'Bow Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 3600, dmg: 500, exp: 2900, blood: 12500, emoji: '🏹', runBlood: 0, desc: 'Kombinasi kecepatan bertarung tingkat tinggi yang menyerang musuh dengan presisi mematikan.' },
{ nama: 'Thunder Fiend', rank: 'SS', tipe: 'Fiend', hp: 3700, dmg: 485, exp: 2950, blood: 12800, emoji: '🌩️', runBlood: 0, desc: 'Mayat hangus yang digerakkan oleh lonjakan daya listrik statis dan menyetrum saat disentuh.' },
  { nama: 'Abyss Fiend', rank: 'SS', tipe: 'Fiend', hp: 3800, dmg: 490, exp: 3000, blood: 13000, emoji: '🌊', runBlood: 0, desc: 'Inang manusia pembawa kutukan pasang air laut yang memuntahkan cairan asin pekat penenggelam.' },
  { nama: 'Glacier Fiend', rank: 'SS', tipe: 'Fiend', hp: 4000, dmg: 475, exp: 3050, blood: 13200, emoji: '🧊', runBlood: 0, desc: 'Tubuh inang yang membeku total menjadi kristal es hitam dan mematahkan bilah pedang musuh.' },
  { nama: 'Sovereign Fiend', rank: 'SS', tipe: 'Fiend', hp: 3900, dmg: 500, exp: 3100, blood: 13500, emoji: '👑', runBlood: 0, desc: 'Evolusi mayat inang bangsawan penyembah kegelapan neraka yang memancarkan dominasi aura dingin.' },
  { nama: 'Inferno Fiend', rank: 'SS', tipe: 'Fiend', hp: 4100, dmg: 500, exp: 3200, blood: 14000, emoji: '🔥', runBlood: 0, desc: 'Kepala mayatnya meleleh menjadi magma membara yang memicu ledakan gelombang panas pekat.' },
  { nama: 'Armor Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 4150, dmg: 485, exp: 3250, blood: 14200, emoji: '🛡️', runBlood: 0, desc: 'Hibrida pelindung besi masif yang menahan seluruh bentuk tebasan senjata tajam.' },
  { nama: 'Necrosis Fiend', rank: 'SS', tipe: 'Fiend', hp: 4200, dmg: 490, exp: 3300, blood: 14500, emoji: '☣️', runBlood: 0, desc: 'Terlahir dari ketakutan manusia terhadap pembusukan tubuh dan kematian yang perlahan menghancurkan kehidupan.' },
  { nama: 'Gun Hybrid', rank: 'SS', tipe: 'Hybrid', hp: 4200, dmg: 510, exp: 3400, blood: 15000, emoji: '🔫', runBlood: 0, desc: 'Transformasi senjata api berkecepatan tembak tinggi yang melubangi armor lini depan.' },
  { nama: 'Whip Devil', rank: 'SS', tipe: 'Devil', hp: 9000, dmg: 2400, exp: 5000, blood: 27000, emoji: '⛓️', runBlood: 0, desc: 'Sabetan cambuk konseptual berkecepatan suara yang merobek kulit dan memotong benteng terkuat.' },
  { nama: 'Bat Devil', rank: 'SS', tipe: 'Devil', hp: 8800, dmg: 2350, exp: 4900, blood: 26200, emoji: '🦇', runBlood: 0, desc: 'Wujud raksasa kelelawar malam peminum darah yang memuntahkan gelombang hancur.' },
  { nama: 'Mantis Devil', rank: 'SS', tipe: 'Devil', hp: 8900, dmg: 2380, exp: 4950, blood: 26500, emoji: '🦗', runBlood: 0, desc: 'Serangga pemangsa berskala raksasa dengan dua cakar sabit pemotong beton.' },
  { nama: 'Spider Devil', rank: 'SS', tipe: 'Devil', hp: 8950, dmg: 2390, exp: 4980, blood: 26700, emoji: '🕷️', runBlood: 0, desc: 'Entitas bercakar banyak yang memintal jerat benang tajam pemotong anggota tubuh.' },
  { nama: 'Scorpion Devil', rank: 'SS', tipe: 'Devil', hp: 9050, dmg: 2420, exp: 5000, blood: 26900, emoji: '🦂', runBlood: 0, desc: 'Monster gurun purba dengan sengat beracun yang menghancurkan susunan sel darah.' },
  { nama: 'Claw Devil', rank: 'SS', tipe: 'Devil', hp: 9100, dmg: 2450, exp: 5050, blood: 27200, emoji: '🦅', runBlood: 0, desc: 'Wujud murni cakar pemangsa raksasa yang merobek bagian dalam pertahanan benteng.' },
  { nama: 'Fang Devil', rank: 'SS', tipe: 'Devil', hp: 9250, dmg: 2500, exp: 5100, blood: 27800, emoji: '🐺', runBlood: 0, desc: 'Entitas taring purba yang menghancurkan struktur kerangka luar musuh seketika.' },
  { nama: 'Spear Devil', rank: 'SS', tipe: 'Devil', hp: 9400, dmg: 2650, exp: 5150, blood: 27500, emoji: '🔱', runBlood: 350, desc: 'Tombak takdir pembebas realitas fisik yang dilemparkan dari kegelapan neraka untuk menyula jantung.' },
  { nama: 'Ghost Devil', rank: 'SS', tipe: 'Devil', hp: 9350, dmg: 2550, exp: 5200, blood: 28000, emoji: '👻', runBlood: 0, desc: 'Perwujudan gaib tak tersentuh bertangan seribu yang bergerak berdasarkan fobia musuh.' },
  { nama: 'Crossbow Devil', rank: 'SS', tipe: 'Devil', hp: 9200, dmg: 2600, exp: 5300, blood: 28500, emoji: '🏹', runBlood: 300, desc: 'Wujud asal Crossbow yang memuntahkan ratusan anak panah berujung tulang menghancurkan kota.' },
  { nama: 'Fox Devil', rank: 'SS', tipe: 'Devil', hp: 9500, dmg: 2620, exp: 5300, blood: 28400, emoji: '🦊', runBlood: 0, desc: 'Rahang vertikal raksasa yang muncul dari dimensi lain untuk menelan musuh utuh.' },
  { nama: 'Snake Devil', rank: 'SS', tipe: 'Devil', hp: 9600, dmg: 2680, exp: 5350, blood: 28800, emoji: '🐍', runBlood: 0, desc: 'Wujud purba ular raksasa pemakan bayaran tumbal yang memuntahkan iblis-iblis mati.' },
  { nama: 'Katana Devil', rank: 'SS', tipe: 'Devil', hp: 9800, dmg: 2700, exp: 5400, blood: 29000, emoji: '🗡️', runBlood: 0, desc: 'Wujud Iblis murni dari Katana tanpa wadah manusia yang memotong dimensi ruang dengan ketajaman absolut.' },
  { nama: 'Flame Devil', rank: 'SS', tipe: 'Devil', hp: 10200, dmg: 2900, exp: 5600, blood: 30500, emoji: '🔥', runBlood: 0, desc: 'Wujud Iblis sejati penyembur api yang membakar habis seluruh karbon makhluk hidup dalam milidetik.' },
  { nama: 'Famine Devil', rank: 'SS', tipe: 'Devil', hp: 10800, dmg: 3000, exp: 5500, blood: 30000, emoji: '🍖', runBlood: 0, desc: 'Penguasa kelaparan yang memperbudak dan mengendalikan entitas yang memiliki kelaparan batin.' },
  { nama: 'Sword Devil', rank: 'SS', tipe: 'Devil', hp: 10000, dmg: 2800, exp: 5500, blood: 30000, emoji: '⚔️', runBlood: 500, desc: 'Wujud murni perwujudan pedang pusaka kuno yang membelah lapis baja dalam radius global.' },
  { nama: 'War Devil', rank: 'SS', tipe: 'Devil', hp: 11000, dmg: 3100, exp: 5600, blood: 31000, emoji: '⚔️', runBlood: 0, desc: 'Manifestasi ketakutan akan konflik militer global yang merubah kepemilikan menjadi senjata pemusnah.' },
  { nama: 'Control Devil', rank: 'SS', tipe: 'Devil', hp: 11200, dmg: 3150, exp: 5700, blood: 31500, emoji: '⛓️', runBlood: 0, desc: 'Iblis Kendali yang menguasai pikiran makhluk lain yang dianggapnya berada di bawah derajatnya.' },
  { nama: 'Oblivion Devil', rank: 'SS', tipe: 'Devil', hp: 11000, dmg: 3200, exp: 5800, blood: 32000, emoji: '👁️', runBlood: 0, desc: 'Eksistensi ketakutan akan dilupakan sepenuhnya, melumpuhkan kesadaran musuh dengan kehampaan.' },
  { nama: 'Thunder Devil', rank: 'SS', tipe: 'Devil', hp: 11500, dmg: 3300, exp: 5900, blood: 33000, emoji: '🌩️', runBlood: 0, desc: 'Ketakutan badai petir purba yang memanipulasi voltase energi kilat raksasa dari langit neraka.' },
  { nama: 'Aging Devil', rank: 'SS', tipe: 'Devil', hp: 11800, dmg: 3400, exp: 5950, blood: 34000, emoji: '🧓', runBlood: 0, desc: 'Ketakutan purba akan penuaan, pengikisan fisik, dan kelapukan eksistensi yang tidak terhindarkan.' },
  { nama: 'Darkness Devil', rank: 'SS', tipe: 'Devil', hp: 12000, dmg: 3500, exp: 6000, blood: 35000, emoji: '🌑', runBlood: 0, desc: 'Iblis Primal Fear yang mewakili ketakutan mendasar makhluk hidup terhadap kegelapan pekat abadi.' },
  { nama: 'Abyss Devil', rank: 'SS', tipe: 'Devil', hp: 12500, dmg: 3600, exp: 6200, blood: 36000, emoji: '🌊', runBlood: 0, desc: 'Perwujudan Thalassophobia yang meremukkan struktur tubuh target dengan tekanan air masif.' },

  // ==============================================================================
  // === RANK SSS - THE FOUR HORSEMEN, PRIMAL FEARS, & ANCAMAN KOSMIK ABSOLUT ===
  // ==============================================================================
  { nama: 'War Fiend', rank: 'SSS', tipe: 'Fiend', hp: 5800, dmg: 460, exp: 3800, blood: 19000, emoji: '⚔️', runBlood: 500, desc: 'Wadah gabungan yang menempa senjata legendaris berkekuatan destruktif dari rasa bersalah.' },
  { nama: 'Conquest Fiend', rank: 'SSS', tipe: 'Fiend', hp: 6000, dmg: 470, exp: 4000, blood: 21000, emoji: '🏇', runBlood: 400, desc: 'Wadah keturunan sekte penunggang kuda pertama yang memaksakan perintah mutlak tunduk.' },
  { nama: 'Pestilence Fiend', rank: 'SSS', tipe: 'Fiend', hp: 6100, dmg: 475, exp: 4100, blood: 21500, emoji: '🦠', runBlood: 0, desc: 'Inang biologis penyebar wabah yang merusak sistem regenerasi HP musuh secara permanen.' },
  { nama: 'Control Fiend', rank: 'SSS', tipe: 'Fiend', hp: 6200, dmg: 480, exp: 4200, blood: 22000, emoji: '⛓️', runBlood: 800, desc: 'Inang manusia yang membawa warisan rantai kendali untuk membelenggu kesadaran lawan.' },
  { nama: 'Famine Fiend', rank: 'SSS', tipe: 'Fiend', hp: 6500, dmg: 490, exp: 4500, blood: 24000, emoji: '🍖', runBlood: 0, desc: 'Inkarnasi kelaparan dalam wujud siswi sekolah yang memanggil monster dari bayangan.' },
  { nama: 'Time Fiend', rank: 'SSS', tipe: 'Fiend', hp: 6800, dmg: 485, exp: 4800, blood: 26000, emoji: '⏰', runBlood: 0, desc: 'Wadah manipulator distorsi waktu yang memperlambat giliran memukul musuh melalui jerat kronologis.' },
  { nama: 'Infinity Fiend', rank: 'SSS', tipe: 'Fiend', hp: 7200, dmg: 495, exp: 5100, blood: 28000, emoji: '♾️', runBlood: 0, desc: 'Inang jangkar anomali ruang tanpa ujung yang menyerap energi serangan fisik musuh menjadi HP.' },
  { nama: 'Silence Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 6950, dmg: 465, exp: 4950, blood: 29500, emoji: '🤫', runBlood: 0, desc: 'Hibrida kesunyian yang mematikan fungsi pendengaran dan koordinasi bertarung musuh.' },
  { nama: 'Future Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7000, dmg: 470, exp: 5000, blood: 30000, emoji: '🔮', runBlood: 0, desc: 'Hibrida masa depan yang menghindari seluruh jenis serangan fisik musuh dalam satu giliran.' },
  { nama: 'Needle Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7050, dmg: 468, exp: 5050, blood: 30200, emoji: '🪡', runBlood: 0, desc: 'Hibrida jarum medis yang merusak sistem penglihatan dan pendengaran musuh.' },
  { nama: 'Mold Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7120, dmg: 471, exp: 5120, blood: 30800, emoji: '🍄', runBlood: 0, desc: 'Hibrida spora membusuk yang merusak organ pernapasan dan ketahanan fisik lawan.' },
  { nama: 'Ghost Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7100, dmg: 475, exp: 5100, blood: 31000, emoji: '👻', runBlood: 0, desc: 'Hibrida gaib bertangan seribu yang mencabut organ dalam musuh secara langsung.' },
  { nama: 'Doll Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7150, dmg: 472, exp: 5150, blood: 31200, emoji: '🎎', runBlood: 0, desc: 'Hibrida manekin global yang memindahkan selurih efek status negatif kepada musuh.' },
  { nama: 'Justice Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7200, dmg: 478, exp: 5200, blood: 31500, emoji: '⚖️', runBlood: 0, desc: 'Hibrida keadilan mutlak yang merubah bentuk fisik musuh menjadi monster lemah.' },
  { nama: 'Poison Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7250, dmg: 476, exp: 5250, blood: 31800, emoji: '☠️', runBlood: 0, desc: 'Hibrida racun belerang yang melelehkan seluruh poin ketahanan armor musuh.' },
  { nama: 'Snake Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7300, dmg: 480, exp: 5300, blood: 32000, emoji: '🐍', runBlood: 0, desc: 'Hibrida ular raksasa yang menelan utuh pertahanan lini depan musuh seketika.' },
  { nama: 'Void Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7320, dmg: 477, exp: 5320, blood: 32200, emoji: '🕳️', runBlood: 0, desc: 'Hibrida hampa udara yang menyerap seluruh serangan jarak jauh musuh menjadi HP.' },
  { nama: 'Typhoon Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7350, dmg: 482, exp: 5350, blood: 32500, emoji: '🌀', runBlood: 0, desc: 'Hibrida badai topan yang menyapu bersih seluruh proyektil dan serangan musuh.' },
  { nama: 'Ice Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7380, dmg: 479, exp: 5380, blood: 32800, emoji: '🧊', runBlood: 0, desc: 'Hibrida salju abadi yang membekukan aliran darah dan gerakan fisik musuh.' },
  { nama: 'Lightning Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7420, dmg: 483, exp: 5420, blood: 33200, emoji: '⚡', runBlood: 0, desc: 'Hibrida kilat petir yang memanggang sistem saraf dan melumpuhkan pergerakan musuh.' },
  { nama: 'Gravity Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7450, dmg: 481, exp: 5450, blood: 33500, emoji: '🌌', runBlood: 0, desc: 'Hibrida gravitasi yang meremukkan tubuh musuh ke atas permukaan daratan.' },
  { nama: 'Chainsaw Fiend', rank: 'SSS', tipe: 'Fiend', hp: 7500, dmg: 500, exp: 5000, blood: 30000, emoji: '⛓️', runBlood: 1000, desc: 'Wujud armor gergaji mesin hitam penuh yang mengabaikan rasa sakit demi menggergaji jantung musuh.' },
  { nama: 'Curse Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7500, dmg: 488, exp: 5500, blood: 34000, emoji: '📍', runBlood: 0, desc: 'Hibrida tengkorak kutukan yang memberikan eksekusi mati instan pasca tiga kali serangan.' },
  { nama: 'Muscle Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7550, dmg: 484, exp: 5550, blood: 34200, emoji: '💪', runBlood: 0, desc: 'Hibrida serat daging yang melipatgandakan poin daya serang fisik secara berturut-turut.' },
  { nama: 'Chainsaw Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 8200, dmg: 500, exp: 6000, blood: 38000, emoji: '⛓️', runBlood: 1000, desc: 'Hibrida gergaji mesin yang terus menggeledah tubuh musuh dan memulihkan HP dari darah.' },
  { nama: 'Dragon Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7600, dmg: 490, exp: 5600, blood: 34500, emoji: '🐉', runBlood: 0, desc: 'Hibrida naga purba yang menyemburkan kobaran api vulkanik pembakar seluruh koridor.' },
  { nama: 'Plague Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7580, dmg: 487, exp: 5580, blood: 34500, emoji: '☣️', runBlood: 0, desc: 'Hibrida wabah mematikan yang menghancurkan susunan jaringan sel tubuh lawan.' },
  { nama: 'Blood Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7400, dmg: 485, exp: 5400, blood: 33000, emoji: '🩸', runBlood: 800, desc: 'Hibrida darah yang menempa tombak dan pedang raksasa dari cairan tubuhnya sendiri.' },
  { nama: 'Scythe Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7680, dmg: 489, exp: 5680, blood: 34800, emoji: '🪝', runBlood: 0, desc: 'Hibrida sabit pemanen yang mengeksekusi mati musuh pasca kondisi HP berada di bawah separuh.' },
  { nama: 'Death Fiend', rank: 'SSS', tipe: 'Fiend', hp: 8000, dmg: 500, exp: 5500, blood: 35000, emoji: '💀', runBlood: 0, desc: 'Wadah taktis manusia dari Kematian yang membawa hawa dingin melumpuhkan mental bertarung.' },
  { nama: 'Stone Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7650, dmg: 486, exp: 5650, blood: 35000, emoji: '🪨', runBlood: 0, desc: 'Hibrida kerak bumi yang mengubah seluruh permukaan tubuh musuh menjadi patung kaku.' },
  { nama: 'Punishment Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7700, dmg: 492, exp: 5700, blood: 35500, emoji: '⚖️', runBlood: 0, desc: 'Hibrida hukuman mati yang menghancurkan barisan pertahanan musuh dengan hujan pedang.' },
  { nama: 'Gun Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7800, dmg: 495, exp: 5800, blood: 36000, emoji: '🔫', runBlood: 0, desc: 'Hibrida senjata api yang menembakkan peluru berkecepatan tinggi menembus pertahanan.' },
  { nama: 'Ocean Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7750, dmg: 493, exp: 5750, blood: 36000, emoji: '🌊', runBlood: 0, desc: 'Hibrida kedalaman laut yang meremukkan susunan kerangka tubuh musuh.' },
  { nama: 'Thunder Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7850, dmg: 496, exp: 5850, blood: 36500, emoji: '🌩️', runBlood: 0, desc: 'Hibrida badai petir purba yang menyetrum seluruh barisan tim musuh secara serentak.' },
  { nama: 'Sword Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 7900, dmg: 498, exp: 5900, blood: 37000, emoji: '⚔️', runBlood: 0, desc: 'Hibrida pedang pusaka kuno yang membelah seluruh lapis baja dalam sekali ayunan.' },
  { nama: 'Armor Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 8000, dmg: 497, exp: 6100, blood: 38500, emoji: '🛡️', runBlood: 0, desc: 'Hibrida pelindung baja purba yang kebal terhadap segala bentuk efek serangan tajam.' },
  { nama: 'War Devil', rank: 'SSS', tipe: 'Devil', hp: 11000, dmg: 5000, exp: 5500, blood: 35000, emoji: '⚔️', runBlood: 1200, desc: 'Kapasitas militer penuh yang merubah setiap jengkal zat, ingatan, dan benda kepemilikan menjadi senjata pemusnah.' },
  { nama: 'Chaos Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 8100, dmg: 499, exp: 6200, blood: 39000, emoji: '🌀', runBlood: 0, desc: 'Hibrida kehancuran sosial yang mengacak seluruh status taktis pertempuran lawan.' },
  { nama: 'Control Devil', rank: 'SSS', tipe: 'Devil', hp: 12000, dmg: 5500, exp: 6000, blood: 40000, emoji: '⛓️', runBlood: 1500, desc: 'Esensi konseptual murni yang mengendalikan rantai takdir makhluk hidup dan mengorbankan nyawa warga demi kontrak.' },
  { nama: 'Chaos Fiend', rank: 'SSS', tipe: 'Fiend', hp: 8500, dmg: 500, exp: 6500, blood: 40000, emoji: '🌀', runBlood: 0, desc: 'Wadah kehancuran total tak terkendali yang memicu badai tebasan acak memukul seluruh musuh.' },
  { nama: 'Oblivion Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 8300, dmg: 500, exp: 6400, blood: 41500, emoji: '👁️', runBlood: 0, desc: 'Hibrida kehampaan mutlak yang melumpuhkan kesadaran dan ingatan bertarung target.' },
  { nama: 'Eternity Devil', rank: 'SSS', tipe: 'Devil', hp: 13000, dmg: 5200, exp: 5800, blood: 38000, emoji: '♾️', runBlood: 0, desc: 'Konsep keabadian mutlak yang mengunci musuh dalam dimensi ruang berputar tanpa celah keluar untuk selamanya.' },
  { nama: 'Love Devil', rank: 'SSS', tipe: 'Devil', hp: 13800, dmg: 5600, exp: 6200, blood: 39500, emoji: '💘', runBlood: 0, desc: 'Manipulasi ikatan emosional yang memaksa musuh saling menyerang rekan satu tim mereka.' },
  { nama: 'God Fiend', rank: 'SSS', tipe: 'Fiend', hp: 9000, dmg: 500, exp: 7000, blood: 45000, emoji: '👑', runBlood: 1500, desc: 'Manifestasi pemuja dogma ketakutan akan dewa yang menahan segala jenis status efek negatif.' },
  { nama: 'Darkness Hybrid', rank: 'SSS', tipe: 'Hybrid', hp: 8800, dmg: 500, exp: 6800, blood: 43500, emoji: '🌑', runBlood: 0, desc: 'Hibrida Primal Fear yang memotong anggota tubuh dan kesadaran musuh dari balik bayangan.' },
  { nama: 'Regret Devil', rank: 'SSS', tipe: 'Devil', hp: 14500, dmg: 5800, exp: 6400, blood: 41000, emoji: '😭', runBlood: 0, desc: 'Keputusasaan mendalam atas penyesalan yang mengikis seluruh poin status fisik musuh hingga nol.' },
  { nama: 'Witch Devil', rank: 'SSS', tipe: 'Devil', hp: 15200, dmg: 6100, exp: 6700, blood: 42500, emoji: '🧙', runBlood: 0, desc: 'Sihir hitam purba yang memindahkan seluruh dampak kerusakan fisik iblis ini kepada penyerangnya.' },
  { nama: 'Famine Devil', rank: 'SSS', tipe: 'Devil', hp: 14000, dmg: 6000, exp: 7000, blood: 48000, emoji: '🍖', runBlood: 0, desc: 'Kelaparan dunia yang mampu memperbudak dan mengendalikan entitas apa pun yang memiliki kelaparan batin.' },
  { nama: 'Prison Devil', rank: 'SSS', tipe: 'Devil', hp: 15800, dmg: 6300, exp: 6900, blood: 43000, emoji: '🔗', runBlood: 0, desc: 'Kurungan dimensi mutlak yang menghapus seluruh akses pergerakan dan jurus bertarung target.' },
  { nama: 'Hell Devil', rank: 'SSS', tipe: 'Devil', hp: 15500, dmg: 6200, exp: 6800, blood: 44000, emoji: '🔥', runBlood: 0, desc: 'Perwujudan api neraka lapis terdalam yang membuka portal transdimensi raksasa untuk membuang musuh ke dimensi maut.' },
  { nama: 'Nightmare Devil', rank: 'SSS', tipe: 'Devil', hp: 16200, dmg: 6400, exp: 7100, blood: 45500, emoji: '😱', runBlood: 0, desc: 'Sleep paralysis tingkat kosmik yang mengunci musuh dalam ilusi ketakutan bawah sadar abadi.' },
  { nama: 'Falling Devil', rank: 'SSS', tipe: 'Devil', hp: 16000, dmg: 6500, exp: 7200, blood: 46000, emoji: '🪽', runBlood: 0, desc: 'Wujud Primal Fear seutuhnya dari Iblis Kejatuhan, bertindak sebagai koki neraka yang menjatuhkan musuh ke langit kosong.' },
  { nama: 'Blood Devil', rank: 'SSS', tipe: 'Devil', hp: 16500, dmg: 6700, exp: 7400, blood: 47000, emoji: '🩸', runBlood: 1500, desc: 'Penguasa cairan vital yang sanggup meledakkan pembuluh darah musuh dari jarak jauh secara mutlak.' },
  { nama: 'Tyranny Devil', rank: 'SSS', tipe: 'Devil', hp: 16800, dmg: 6600, exp: 7300, blood: 48500, emoji: '👑', runBlood: 0, desc: 'Dominasi mutlak penundukan paksa yang memutus keinginan bertarung dan melumpuhkan pertahanan.' },
  { nama: 'Gun Devil', rank: 'SSS', tipe: 'Devil', hp: 15000, dmg: 7000, exp: 7500, blood: 50000, emoji: '🔫', runBlood: 0, desc: 'Manifestasi ketakutan global senjata api yang bergerak cepat melintasi benua dan membantai jutaan jiwa dalam hitungan menit.' },
  { nama: 'Aging Devil', rank: 'SSS', tipe: 'Devil', hp: 17000, dmg: 6800, exp: 7600, blood: 49000, emoji: '🧓', runBlood: 0, desc: 'Ketakutan purba akan penuaan, waktu yang mengikis fisik, dan kelapukan eksistensi yang tidak dapat dihindari.' },
  { nama: 'Bomb Devil', rank: 'SSS', tipe: 'Devil', hp: 17500, dmg: 7200, exp: 7900, blood: 52000, emoji: '💣', runBlood: 0, desc: 'Ancaman ledakan hulu ledak nuklir dan mesiu buatan yang mampu meratakan benua dalam seketika.' },
  { nama: 'Darkness Devil', rank: 'SSS', tipe: 'Devil', hp: 18000, dmg: 7500, exp: 8000, blood: 55000, emoji: '🌑', runBlood: 0, desc: 'Wujud purba tak tersentuh dari ketakutan kegelapan, memotong lengan dan kesadaran musuh hanya lewat tatapan mata.' },
  { nama: 'Cosmos Devil', rank: 'SSS', tipe: 'Devil', hp: 18500, dmg: 7600, exp: 8200, blood: 54000, emoji: '🌌', runBlood: 0, desc: 'Pengetahuan tak terhingga alam semesta yang membakar habis saraf otak musuh dalam sekali tatap.' },
  { nama: 'Chaos Devil', rank: 'SSS', tipe: 'Devil', hp: 19000, dmg: 7800, exp: 8500, blood: 58000, emoji: '🌀', runBlood: 0, desc: 'Lahir dari fobia manusia akan ketidakpastian hancurnya keteraturan sosial yang mengacak taktik medan tempur.' },
  { nama: 'Chainsaw Devil', rank: 'SSS', tipe: 'Devil', hp: 20000, dmg: 8500, exp: 9000, blood: 65000, emoji: '⛓️', runBlood: 2000, desc: 'Pahlawan Neraka yang ditakuti seluruh iblis karena mampu memakan dan melenyapkan konsep eksistensi dari ingatan dunia.' },
  { nama: 'Death Devil', rank: 'SSS', tipe: 'Devil', hp: 25000, dmg: 10000, exp: 10000, blood: 80000, emoji: '💀', runBlood: 0, desc: 'Anak tertua Four Horsemen, Raja Teror pembawa kiamat yang mewakili ketakutan mutlak makhluk hidup akan kematian.' },
];


const CONTRACT_PRICE = {
  host: 5000,
  fiend: 10000,
  hybrid: 50000,
  devil: 100000
};

const NO_HOST_DEVILS = new Set(['Death Devil', 'Darkness Devil Pure', 'Falling Devil Primal', 'Aging Devil']);
const DOLL_DEVILS = new Set(['Doll Devil', 'Control Devil', 'Famine Devil', 'War Devil']);

DEVIL_LIST.forEach(devil => {
  const isDevil = devil.tipe === 'Devil';
  devil.contractTypes = isDevil ? ['devil'] : ['fiend', 'hybrid'];
  devil.canHost = isDevil && !NO_HOST_DEVILS.has(devil.nama);
  devil.canDoll = isDevil && DOLL_DEVILS.has(devil.nama);
});

function getContractMeta(entity) {
  if (!entity) return { types: [], canHost: false, canDoll: false };
  return {
    types: entity.contractTypes || (entity.tipe === 'Devil' ? ['devil'] : ['fiend', 'hybrid']),
    canHost: Boolean(entity.canHost),
    canDoll: Boolean(entity.canDoll)
  };
}

const CHARACTER_LIST = [
    // === KARAKTER UTAMA ===
    {nama: 'Denji', role: 'Main Character', faction: 'Public Safety / Chainsaw Man', status: 'Hybrid', lokasi: ['Apartemen Hayakawa', 'Kafe Crossroads (Trois Bagues Vertes)', 'Distrik Shinjuku', 'SMA Fourth East', 'Kamar Kos Baru Denji'], needLove: 40, emoji: '⛓️', bonus: 'Auto Transform', dialog: ['Mau makan bareng ga?', 'Pochita kangen lu', 'Ayo lawan devil bareng!']},
    {nama: 'Aki Hayakawa', role: 'Main Character', faction: 'Public Safety (Div 2 -> Div 4)', status: 'Human / Gun Fiend', lokasi: ['Apartemen Hayakawa', 'Markas Public Safety', 'Rumah Sakit Tokyo (Hospital)'], needLove: 65, emoji: '🦊', bonus: 'Critical +20%', dialog: ['Jangan gegabah', 'Rokok dulu...', 'Kita harus profesional']},
    {nama: 'Power', role: 'Main Character', faction: 'Public Safety (Div 4)', status: 'Blood Fiend', lokasi: ['Apartemen Hayakawa', 'Atap Gedung Koun (Nerima)'], needLove: 55, emoji: '🩸', bonus: 'Regen 10HP/mission', dialog: ['Bodo! Gua lebih kuat!', 'Kasih gua darah!', 'Meong~']},
    {nama: 'Asa Mitaka', role: 'Main Character (Part 2)', faction: 'Fourth East High', status: 'Human (War Devil Host)', lokasi: ['SMA Fourth East', 'Rumah Kos Asa Mitaka', 'Akuarium Kota'], needLove: 45, emoji: '⚔️', bonus: 'Craft Weapon +1', dialog: ['H-halo...', 'Yoru nyuruh aku...', 'Jangan deket2']},
    {nama: 'Nayuta', role: 'Denji\'s Ward', faction: 'Four Horsemen', status: 'Control Devil (Reincarnation)', lokasi: ['Kamar Kos Baru Denji'], needLove: 90, emoji: '⛓️', bonus: 'Control Enemy 1 turn', dialog: ['Denji...', 'Nurut', 'Jangan nakal']},
    {nama: 'Fami', role: 'Antagonist / Mastermind', faction: 'Four Horsemen / Chainsaw Man Church', status: 'Famine Devil', lokasi: ['Gereja Chainsaw Man'], needLove: 95, emoji: '🍖', bonus: 'Steal 100 Blood', dialog: ['Makan sana', 'Lapar ya?', 'Kurang gizi']},
    {nama: 'Makima', role: 'Main Antagonist (Part 1)', faction: 'Public Safety (Div 4)', status: 'Control Devil', lokasi: ['Markas Public Safety', 'Bioskop Tokyo (Movie Theater)', 'Kuil Omiwa', 'Stasiun Kyoto'], needLove: 100, emoji: '⛓️', bonus: 'Chance instant kill 5%', dialog: ['Anjing yang baik nurut ya', 'Kerja bagus', 'Ikut aku']},
    {nama: 'Yoru', role: 'Main Character (Part 2)', faction: 'Four Horsemen', status: 'War Devil', lokasi: ['SMA Fourth East', 'Rumah Kos Asa Mitaka'], needLove: 70, emoji: '⚔️', bonus: 'Weapon Damage +35', dialog: ['Buat senjata', 'Lemah', 'Ikut perintahku']},

    // === PUBLIC SAFETY TOKYO ===
    {nama: 'Kishibe', role: 'Captain / Mentor', faction: 'Public Safety', status: 'Human', lokasi: ['Markas Public Safety', 'Hutan Tempat Latihan Kishibe (Forest)', 'Kuburan Massal Pemburu Iblis (Graveyard)'], needLove: 75, emoji: '🚬', bonus: 'All Stat +10', dialog: ['Kerja yang bener', 'Masih cupu lu', 'Latihan sana']},
    {nama: 'Himeno', role: 'Senior Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Markas Public Safety', 'Apartemen Himeno'], needLove: 60, emoji: '👻', bonus: 'Dodge +15%', dialog: ['Minum dulu', 'Aki...', 'Hati-hati']},
    {nama: 'Kobeni Higashiyama', role: 'Rookie Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Markas Public Safety', 'Family Burger', 'Halte Bus Distrik Chuo'], needLove: 35, emoji: '🔪', bonus: 'Evasion +25%', dialog: ['Tolong jangan!', 'Aku nyerah', 'Kabur aja']},
    {nama: 'Hirokazu Arai', role: 'Rookie Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 30, emoji: '🔫', bonus: 'Accuracy +15%', dialog: ['Aku takut', 'Semangat!', 'Tembak!']},
    {nama: 'Hirofumi Yoshida', role: 'Private Hunter / Student', faction: 'Public Safety / Unknown Org', status: 'Human', lokasi: ['SMA Fourth East', 'Atap SMA Fourth East'], needLove: 50, emoji: '🐙', bonus: 'CC Resist +20%', dialog: ['Lagi apa?', 'Mau liat gurita?', 'Rahasia ya']},
    {nama: 'Fumiko Mifune', role: 'Bodyguard', faction: 'Public Safety (Div 7)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 70, emoji: '🥷', bonus: 'Defense +15', dialog: ['Lindungi target', 'Jangan lengah', 'Siap']},
    {nama: 'Beam', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Shark Fiend', lokasi: ['Taman Kota Tokyo (Park)'], needLove: 40, emoji: '🦈', bonus: 'Water Damage +25', dialog: ['Master!!', 'Aku Beam', 'Lapar']},
    {nama: 'Galgali', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Violence Fiend', lokasi: ['Markas Public Safety'], needLove: 65, emoji: '👊', bonus: 'Defense +20', dialog: ['...', 'HANCURKAN', 'KUAT']},
    {nama: 'Madoka', role: 'Experienced Hunter', faction: 'Public Safety (Div 4)', status: 'Human (Resigned)', lokasi: ['Markas Public Safety'], needLove: 45, emoji: '📋', bonus: 'Mission Reward +10%', dialog: ['Laporan!', 'Kerja bagus', 'Pensiun']},
    {nama: 'Fushi', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 35, emoji: '🗡️', bonus: 'Bleed +10', dialog: ['Tusuk!', 'Maju!', 'Hati2']},
    {nama: 'Nail Fiend', role: 'Agent', faction: 'Public Safety (Div 7)', status: 'Nail Fiend', lokasi: ['Markas Public Safety'], needLove: 50, emoji: '📍', bonus: 'Pierce +20', dialog: ['Paku!', 'Diam', 'Tusuk']},
    {nama: 'Nomo', role: 'Aki\'s Senior', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 55, emoji: '🚬', bonus: 'EXP +15%', dialog: ['Kerja keras', 'Hati-hati', 'Senior']},
    {nama: 'Kato', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 25, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Tanabe', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 25, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Furuno', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 25, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Takagi', role: 'Agent', faction: 'Public Safety (Div 7)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 30, emoji: '👮', bonus: 'Accuracy +10', dialog: ['Target!', 'Tembak!', 'Clear!']},
    {nama: 'Masaki Ando', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 25, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Nakamura', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 25, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Hiroshi', role: 'Rookie Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Markas Public Safety'], needLove: 28, emoji: '🧢', bonus: 'Stamina +10', dialog: ['Siap kapten!', 'Aku baru', 'Belajar dulu']},
    {nama: 'Sakura', role: 'Medic', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Rumah Sakit Tokyo (Hospital)'], needLove: 32, emoji: '🏥', bonus: 'Heal +15', dialog: ['Luka? Sini', 'Obat dulu', 'Istirahat']},
    {nama: 'Takeshi', role: 'Mechanic', faction: 'Public Safety', status: 'Human', lokasi: ['Gudang Senjata Public Safety'], needLove: 30, emoji: '🔧', bonus: 'Weapon Dur +20', dialog: ['Senjata rusak?', 'Aku benerin', 'Gratis']},

    // === PUBLIC SAFETY REGIONAL ===
    {nama: 'Yutaro Kurose', role: 'Kyoto Hunter', faction: 'Public Safety', status: 'Human', lokasi: ['Stasiun Kyoto', 'Restoran Mewah Tokyo'], needLove: 40, emoji: '🗡️', bonus: 'Speed +10', dialog: ['Kyoto!', 'Maju!', 'Hati2']},
    {nama: 'Michiko Tendo', role: 'Kyoto Hunter', faction: 'Public Safety', status: 'Human', lokasi: ['Stasiun Kyoto', 'Restoran Mewah Tokyo'], needLove: 40, emoji: '🗡️', bonus: 'Speed +10', dialog: ['Kyoto!', 'Maju!', 'Hati2']},
    {nama: 'Subaru', role: 'Kyoto Instructor', faction: 'Public Safety', status: 'Human', lokasi: ['Stasiun Kyoto'], needLove: 55, emoji: '📚', bonus: 'EXP +20%', dialog: ['Latihan!', 'Fokus!', 'Bagus!']},
    {nama: 'Kusakabe', role: 'Miyagi Bodyguard', faction: 'Public Safety', status: 'Human', lokasi: ['Distrik Shinjuku'], needLove: 50, emoji: '🛡️', bonus: 'Defense +15', dialog: ['Lindungi!', 'Jangan!', 'Siap!']},
    {nama: 'Tamaoki', role: 'Miyagi Bodyguard', faction: 'Public Safety', status: 'Human', lokasi: ['Distrik Shinjuku'], needLove: 50, emoji: '🛡️', bonus: 'Defense +15', dialog: ['Lindungi!', 'Jangan!', 'Siap!']},

    // === WEAPON HYBRIDS ===
    {nama: 'Reze', role: 'Antagonist (Part 1)', faction: 'Soviet Union', status: 'Bomb Hybrid', lokasi: ['Kafe Crossroads (Trois Bagues Vertes)', 'Stan Telepon Umum Nishi-Kanda (Phonebooth)', 'Tangga Onnazaka', 'Gereja Kuno (Church)', 'Gudang Pelabuhan (Warehouse)'], needLove: 60, emoji: '💣', bonus: 'AoE Damage +40', dialog: ['Pesananmu udah jadi', 'Mau nongkrong?', 'Hati-hati ya']},
    {nama: 'Katana Man / Samurai Sword', role: 'Antagonist', faction: 'Yakuza / Public Safety (Later)', status: 'Katana Hybrid', lokasi: ['Distrik Shinjuku', 'Rooftop Pusat Perbelanjaan'], needLove: 80, emoji: '🗡️', bonus: 'Crit Damage +40%', dialog: ['Untuk Yakuza', 'Mati!', 'Balas dendam']},
    {nama: 'Quanxi', role: 'International Assassin', faction: 'China / Public Safety (Later)', status: 'Crossbow Hybrid', lokasi: ['Kamar Hotel Quanxi', 'Taman Kota Tokyo (Park)'], needLove: 85, emoji: '🏹', bonus: 'Attack Speed +30%', dialog: ['Lemah', 'Lanjut', 'Masih hidup?']},
    {nama: 'Barem Bridge', role: 'Antagonist (Part 2)', faction: 'Chainsaw Man Church', status: 'Flamethrower Hybrid', lokasi: ['Gereja Chainsaw Man'], needLove: 75, emoji: '🔥', bonus: 'Burn Damage +50', dialog: ['Keadilan!', 'Salah!', 'Hukum!']},
    {nama: 'Miri Sugo', role: 'Student / Member', faction: 'Chainsaw Man Church', status: 'Longsword Hybrid', lokasi: ['Distrik Shinjuku'], needLove: 30, emoji: '⚔️', bonus: 'Blood Gain +15%', dialog: ['Suntik!', 'Sehat!', 'Obat!']},
    {nama: 'Whip Hybrid', role: 'Member', faction: 'Chainsaw Man Church', status: 'Whip Hybrid', lokasi: ['Gereja Chainsaw Man'], needLove: 45, emoji: '⛓️', bonus: 'CC +20%', dialog: ['Cemeti!', 'Sakit!', 'Nurut!']},
    {nama: 'Spear Hybrid', role: 'Member', faction: 'Chainsaw Man Church', status: 'Spear Hybrid', lokasi: ['Gereja Chainsaw Man'], needLove: 45, emoji: '🔱', bonus: 'Pierce +25', dialog: ['Tusuk!', 'Maju!', 'Hancur!']},

    // === ASSASSINS INTERNATIONAL ===
    {nama: 'Akane Sawatari', role: 'Former Civilian Hunter', faction: 'Gun Devil Ally / Yakuza', status: 'Human', lokasi: ['Distrik Shinjuku', 'Gang Sempit Kanda (Alley)'], needLove: 85, emoji: '🐍', bonus: 'Snake Summon', dialog: ['Gun Devil...', 'Kontrak!', 'Bunuh!']},
    {nama: 'Santa Claus', role: 'International Assassin', faction: 'Germany', status: 'Human (Doll Devil Contract)', lokasi: ['Neraka (Hell)', 'Jalan Raya Pinggiran Kota'], needLove: 95, emoji: '🎅', bonus: 'Summon Doll +1', dialog: ['Hoho', 'Boneka!', 'Mati']},
    {nama: 'Tolka', role: 'Santa Claus\' Pupil', faction: 'Soviet Union', status: 'Human / Doll', lokasi: ['Neraka (Hell)'], needLove: 70, emoji: '🎎', bonus: 'Doll Buff +10', dialog: ['Guru!', 'Boneka!', 'Serang!']},
    {nama: 'Aldo', role: 'Assassin Brother', faction: 'USA', status: 'Human', lokasi: ['Toko Suvenir'], needLove: 50, emoji: '🔫', bonus: 'Gun Damage +20', dialog: ['Target!', 'Shoot!', 'Die!']},
    {nama: 'Joey', role: 'Assassin Brother', faction: 'USA', status: 'Human', lokasi: ['Toko Suvenir'], needLove: 50, emoji: '🔫', bonus: 'Gun Damage +20', dialog: ['Target!', 'Shoot!', 'Die!']},
    {nama: 'Kuro', role: 'Assassin Brother', faction: 'USA', status: 'Human', lokasi: ['Toko Suvenir'], needLove: 50, emoji: '🔫', bonus: 'Gun Damage +20', dialog: ['Target!', 'Shoot!', 'Die!']},

    // === FIEND REKAN QUANXI ===
    {nama: 'Pingtsi', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Fiend', lokasi: ['Kamar Hotel Quanxi'], needLove: 45, emoji: '👹', bonus: 'Taunt Enemy', dialog: ['Grrr', 'Lindungi', 'Quanxi']},
    {nama: 'Cosmo', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Cosmos Fiend', lokasi: ['Kamar Hotel Quanxi'], needLove: 55, emoji: '🌌', bonus: 'Stun 1 turn', dialog: ['Halo...', 'Cosmos...', '...']},
    {nama: 'Long', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Dragon Fiend', lokasi: ['Kamar Hotel Quanxi'], needLove: 60, emoji: '🐉', bonus: 'Fire Breath +60', dialog: ['Raung!', 'Naga!', 'Bakar!']},
    {nama: 'Tsugihagi', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Fiend', lokasi: ['Kamar Hotel Quanxi'], needLove: 50, emoji: '🧵', bonus: 'Heal Ally +20', dialog: ['Jahit!', 'Sembuh!', 'Teman']},

    // === SEKOLAH FOURTH EAST HIGH ===
    {nama: 'Yuko', role: 'Asa\'s Best Friend', faction: 'Fourth East High', status: 'Human / Mutated Fiend', lokasi: ['SMA Fourth East'], needLove: 35, emoji: '💀', bonus: 'Self Destruct +100', dialog: ['Asa...', 'Maaf', 'Boom!']},
    {nama: 'Haruka Iseumi', role: 'Devil Hunter Club President', faction: 'Fourth East High', status: 'Human', lokasi: ['SMA Fourth East'], needLove: 20, emoji: '📚', bonus: 'EXP +20%', dialog: ['Belajar yuk', 'PR banyak', 'Ujian!']},
    {nama: 'Nobana Higashiyama', role: 'Club Member', faction: 'Fourth East High', status: 'Human', lokasi: ['SMA Fourth East'], needLove: 20, emoji: '📖', bonus: 'INT +10', dialog: ['Baca!', 'Catat!', 'Paham!']},
    {nama: 'Seigi Akoku', role: 'Club Member', faction: 'Fourth East High', status: 'Human', lokasi: ['SMA Fourth East'], needLove: 20, emoji: '✊', bonus: 'Justice +15%', dialog: ['Benar!', 'Salah!', 'Hukum!']},
    {nama: 'Asami', role: 'Student', faction: 'Fourth East High', status: 'Human', lokasi: ['SMA Fourth East'], needLove: 25, emoji: '👧', bonus: 'School Spirit (EXP +5%)', dialog: ['Kamu liat Asa gak?', 'Ayo ke kantin', 'Sekolah membosankan']},
    {nama: 'Mr. Tanaka', role: 'School Teacher', faction: 'Fourth East High', status: 'Human (Justice Contractor)', lokasi: ['SMA Fourth East'], needLove: 40, emoji: '👓', bonus: 'Dark Contract (ATK +15)', dialog: ['Asa, mari ikut saya...', 'Kamu anak yang penurut', 'Ini demi kebaikan']},
    {nama: 'Jiro', role: 'Janitor', faction: 'SMA Fourth East', status: 'Human', lokasi: ['SMA Fourth East'], needLove: 18, emoji: '🧹', bonus: 'Find Item +10%', dialog: ['Sampah ya', 'Bersih2', 'Hati2 licin']},

    // === PEMERINTAHAN & SIPIL ===
    {nama: 'Kentaro Ishita', role: 'Prime Minister of Japan', faction: 'Japanese Government', status: 'Human', lokasi: ['Tokyo Devil Detention Center'], needLove: 90, emoji: '👔', bonus: 'Political Power', dialog: ['Negara!', 'Perintah!', 'Dana!']},
    {nama: 'Shin Toma', role: 'Minister of Defense', faction: 'Japanese Government', status: 'Human', lokasi: ['Tokyo Devil Detention Center'], needLove: 85, emoji: '🎖️', bonus: 'Army Buff +20', dialog: ['Pasukan!', 'Serang!', 'Lindungi!']},
    {nama: 'Tadashi Hasegawa', role: 'Former Minister of Finance', faction: 'Japanese Government', status: 'Human', lokasi: ['Tokyo Devil Detention Center'], needLove: 80, emoji: '💰', bonus: 'Blood +1000', dialog: ['Anggaran!', 'Pajak!', 'Hemat!']},
    {nama: 'Hadaji Sakagami', role: 'Minister of Internal Affairs', faction: 'Japanese Government', status: 'Human', lokasi: ['Tokyo Devil Detention Center'], needLove: 80, emoji: '🏛️', bonus: 'Law +20%', dialog: ['Hukum!', 'Peraturan!', 'Tertib!']},
    {nama: 'Yuki Tomoda', role: 'Chief Cabinet Secretary', faction: 'Japanese Government', status: 'Human', lokasi: ['Tokyo Devil Detention Center'], needLove: 80, emoji: '📜', bonus: 'Diplomacy +20', dialog: ['Rapat!', 'Keputusan!', 'Laporan!']},
    {nama: 'Miki Takanashi', role: 'Minister of Economy', faction: 'Japanese Government', status: 'Human', lokasi: ['Gereja Chainsaw Man'], needLove: 75, emoji: '📈', bonus: 'Shop Discount 10%', dialog: ['Ekonomi!', 'Jual!', 'Beli!']},
    {nama: 'Minami Nakano', role: 'Civilian', faction: 'None', status: 'Human', lokasi: ['Distrik Shinjuku', 'Pusat Keramaian Shibuya'], needLove: 15, emoji: '👩', bonus: 'None', dialog: ['Tolong!', 'Takut!', 'Lari!']},
    {nama: 'Kenzo', role: 'Yakuza Associate', faction: 'Yakuza', status: 'Human', lokasi: ['Gudang Tua Yakuza', 'Area Kontainer Pelabuhan'], needLove: 60, emoji: '🔪', bonus: 'Crime +20%', dialog: ['Bos!', 'Uang!', 'Bunuh!']},
    {nama: 'Katana Man\'s Grandfather', role: 'Antagonist', faction: 'Yakuza', status: 'Human', lokasi: ['Gudang Tua Yakuza'], needLove: 75, emoji: '👴', bonus: 'Debt Collect (Gold +20%)', dialog: ['Bayar utangmu!', 'Dasar sampah!', 'Uang adalah segalanya']},
    {nama: 'Rina', role: 'Barista', faction: 'None', status: 'Human', lokasi: ['Kafe Crossroads (Trois Bagues Vertes)'], needLove: 22, emoji: '☕', bonus: 'EXP +5%', dialog: ['Kopi panas', 'Mau pesan?', 'Diskon nih']},
    {nama: 'Kenta', role: 'News Reporter', faction: 'None', status: 'Human', lokasi: ['Studio Berita TV Tokyo'], needLove: 38, emoji: '🎤', bonus: 'Info +20%', dialog: ['Breaking news!', 'Wawancara?', 'Foto dulu']},
    {nama: 'Old Man Sato', role: 'Shop Owner', faction: 'None', status: 'Human', lokasi: ['Toko Roti Murah Tokyo'], needLove: 25, emoji: '🍞', bonus: 'Shop Discount 15%', dialog: ['Roti basi', 'Murah aja', 'Dateng lagi ya']},

    // === FIEND & DEVIL ===
    {nama: 'Angel Devil', role: 'Angel Devil', faction: 'Public Safety (Div 4)', status: 'Angel Devil', lokasi: ['Taman Kota Tokyo (Park)', 'Gang Sempit Kanda (Alley)'], needLove: 60, emoji: '😇', bonus: 'Heal 20HP/mission', dialog: ['Aku capek...', 'Jangan berisik', 'Tidur aja']},
    {nama: 'Pochita', role: 'Chainsaw Devil', faction: 'None', status: 'Chainsaw Devil', lokasi: ['Kamar Denji Lama', 'Dimensi Batas Pikiran (Mindscape)'], needLove: 100, emoji: '🐕', bonus: 'Revive 1x', dialog: ['Woof Woof!', 'Guk Guk!', 'Denji..']},
    {nama: 'Princi', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Spider Devil', lokasi: ['Markas Public Safety', 'Neraka (Hell)'], needLove: 60, emoji: '🕷️', bonus: 'Teleport Ally', dialog: ['Makima-sama...', 'Lewat sini', '...']},
    {nama: 'Gun Fiend', role: 'Tragic Boss', faction: 'None', status: 'Gun Fiend', lokasi: ['Jalan Raya Pinggiran Kota', 'Apartemen Hayakawa'], needLove: 95, emoji: '⛄', bonus: 'Snowball Fight', dialog: ['Denji... ayo main bola salju...', 'BANG!', '...']},
    {nama: 'Chainsaw Devil', role: 'Hero of Hell (True Form)', faction: 'None', status: 'Chainsaw Devil', lokasi: ['Dimensi Batas Pikiran (Mindscape)', 'Neraka (Hell)'], needLove: 100, emoji: '⛓️', bonus: 'Concept Erasure (ATK +100)', dialog: ['VANCE!', 'VAVAVA!', '...']},
    {nama: 'Blood Devil', role: 'True Devil Form', faction: 'None', status: 'Blood Devil', lokasi: ['Dimensi Batas Pikiran (Mindscape)', 'Neraka (Hell)'], needLove: 85, emoji: '🩸', bonus: 'Blood Berserk (ATK +50%)', dialog: ['Ini wujud asliku yang keren!', 'Denji, cari aku di Neraka...', 'Hancurlah kau!']},
    {nama: 'Meowy', role: 'Power\'s Cat', faction: 'None', status: 'Cat', lokasi: ['Apartemen Korban Bat Devil', 'Apartemen Hayakawa'], needLove: 10, emoji: '🐱', bonus: 'Luck +5%', dialog: ['Meong~', 'Purrr', 'Makanan?']}
];

// TAHAP 1 (SENJATA 1 - 25: TIER E SAMPAI D | HARGA: 0 - 150.000)
const WEAPON_LIST = [
  {nama: 'Fist', jenis: 'Melee', tier: 'E', dmg: 2, harga: 0, emoji: '👊', dur: Infinity, user: 'Semua Orang', material: 'Tangan Kosong', desc: 'Senjata dasar tanpa durability. Damage stabil dan tidak pernah rusak.'},
  {nama: 'Gunting Medis', jenis: 'Melee', tier: 'E', dmg: 2, harga: 8000, emoji: '✂️', dur: 45, user: 'Dokter Bedah', material: 'Baja medis tipis', desc: 'Gunting fisik konvensional yang muncul di fasilitas medis darurat Keamanan Publik.'},
  {nama: 'Pipa Besi Proyek', jenis: 'Melee', tier: 'E', dmg: 6, harga: 10000, emoji: '🪈', dur: 60, user: 'Korban Zombie', material: 'Besi berkarat', desc: 'Pipa rongsokan bangunan bangunan yang digenggam mayat hidup saat menyerbu gudang awal.'},
  {nama: 'Pisau Bedah Otopsi', jenis: 'Melee', tier: 'E', dmg: 4, harga: 12000, emoji: '🧪', dur: 35, user: 'Tim Forensik Publik', material: 'Baja karbon tipis', desc: 'Pisau kecil super tajam untuk membedah sampel daging mayat iblis.'},
  {nama: 'Knife', jenis: 'Melee', tier: 'E', dmg: 8, harga: 50000, emoji: '🔪', dur: 15, user: 'Kobeni / Arai', material: 'Baja Murah', desc: 'Pisau dapur standar. Tajam tapi gampang tumpul.'},
  {nama: 'Gada Paku Yakuza', jenis: 'Melee', tier: 'E', dmg: 10, harga: 20000, emoji: '🪵', dur: 60, user: 'Preman Anak Buah', material: 'Kayu dan paku beton', desc: 'Senjata pukul jalanan kasar yang digunakan preman saat menyergap Denji di gang.'},
  {nama: 'Gergaji Es / Logam', jenis: 'Melee', tier: 'E', dmg: 9, harga: 25000, emoji: '🪚', dur: 40, user: 'Yakuza Kredit', material: 'Besi cor gerigi', desc: 'Alat industri yang dipakai menyiksa Denji sebelum dirinya menyatu dengan Pochita.'},
  {nama: 'Kapak Genggam Pemburu', jenis: 'Melee', tier: 'E', dmg: 11, harga: 30000, emoji: '🪓', dur: 70, user: 'Pemburu Liar / Sipil', material: 'Besi gagang kayu', desc: 'Dipakai pemburu amatir di pedalaman untuk memotong iblis liar kecil.'},
  {nama: 'Linggis Besi (Crowbar)', jenis: 'Melee', tier: 'D', dmg: 14, harga: 35000, emoji: '🏗️', dur: 150, user: 'Warga Sipil', material: 'Besi cor tebal', desc: 'Alat pencongkel bangunan yang dijadikan senjata darurat saat teror iblis melanda kota.'},
  {nama: 'Pisau Jagal Daging', jenis: 'Melee', tier: 'D', dmg: 15, harga: 45000, emoji: '🥩', dur: 80, user: 'Koki Restoran', material: 'Baja anti karat', desc: 'Pisau besar pemotong daging tebal yang terlihat di dapur restoran sushi.'},
  {nama: 'Pedang Ornaments Pajangan', jenis: 'Melee', tier: 'D', dmg: 13, harga: 50000, emoji: '🖼️', dur: 40, user: 'Pemilik Rumah', material: 'Kuningan replika', desc: 'Pedang hiasan dinding palsu yang dilewati karakter saat pertarungan merusak rumah.'},
  {nama: 'Gergaji Pohon Manual', jenis: 'Melee', tier: 'D', dmg: 16, harga: 55000, emoji: '🪵', dur: 55, user: 'Penebang Hutan', material: 'Pelat baja', desc: 'Gergaji manual penebang pohon milik ayah Denji sebelum era Pochita dimulai.'},
  {nama: 'Baseball Bat', jenis: 'Melee', tier: 'D', dmg: 12, harga: 80000, emoji: '🏏', dur: 20, user: 'Sipil', material: 'Kayu + Aluminium', desc: 'Pemukul baseball. Bagus buat mukul kepala.'},
  {nama: 'Bom Molotov', jenis: 'Api', tier: 'D', dmg: 22, harga: 100000, emoji: '🍾', dur: 1, user: 'Demonstran / Sipil', material: 'Botol kaca & bensin', desc: 'Senjata bakar area darurat yang menyebarkan kobaran api di atas tanah. Sekali pakai.'},
  {nama: 'Granat Asap (Smoke)', jenis: 'Api', tier: 'D', dmg: 0, harga: 120000, emoji: '💨', dur: 1, user: 'Tim Penyergap', material: 'Potasium klorat', desc: 'Katalis gas membutakan pandangan musuh untuk melarikan diri atau menyergap. Sekali pakai.'},
  {nama: 'Pistol Isyarat (Flare Gun)', jenis: 'Api', tier: 'D', dmg: 5, harga: 150000, emoji: '🚨', dur: 1, user: 'Tim Penyelamat', material: 'Plastik & fosfor', desc: 'Menembakkan bola cahaya suar ke langit untuk tanda evakuasi darurat. Sekali pakai.'},
  {nama: 'Katana Pajangan Toko', jenis: 'Melee', tier: 'D', dmg: 16, harga: 180000, emoji: '🗡️', dur: 15, user: 'Sipil / Preman', material: 'Seng / Besi Tipis', desc: 'Pedang murah tidak seimbang yang dibeli warga sipil di toko suvenir untuk perlindungan.'},
  {nama: 'Tongkat Semat Tembaga', jenis: 'Melee', tier: 'D', dmg: 14, harga: 190000, emoji: '🦯', dur: 45, user: 'Petugas Keamanan', material: 'Tembaga murni', desc: 'Tongkat patroli malam konvensional yang dipakai satpam bangunan mall saat invasi.'},
  {nama: 'Katana', jenis: 'Melee', tier: 'C', dmg: 25, harga: 200000, emoji: '🗡️', dur: 25, user: 'Samurai', material: 'Baja Tradisional', desc: 'Katana standar. Tajam dan cepat.'},
  {nama: 'Combat Knife', jenis: 'Melee', tier: 'C', dmg: 18, harga: 250000, emoji: '🔪', dur: 30, user: 'Kishibe', material: 'Baja Militer', desc: 'Pisau fisik taktis yang selalu dibawa Kishibe. Sangat efektif untuk menusuk iblis tanpa kontrak aktif.'},
  {nama: 'Spear', jenis: 'Melee', tier: 'C', dmg: 28, harga: 300000, emoji: '🏹', dur: 22, user: 'Prajurit', material: 'Besi + Kayu', desc: 'Tombak standar. Jangkauan serangan jauh.'},
  {nama: 'Bottle Straw Knife', jenis: 'Yoru Transmutasi', tier: 'C', dmg: 14, harga: 320000, emoji: '🥤', dur: 5, user: 'Yoru', material: 'Sedotan plastik lantai', desc: 'Pisau darurat yang dibuat sekilas oleh Yoru dari sedotan botol bekas di lantai Restoran.'},
  {nama: 'Axe', jenis: 'Melee', tier: 'C', dmg: 35, harga: 350000, emoji: '🪓', dur: 18, user: 'Pemburu', material: 'Baja + Kayu', desc: 'Kapak pembelah. Damage gede tapi berat.'},
  {nama: 'Gun', jenis: 'Api', tier: 'C', dmg: 30, harga: 400000, emoji: '🔫', dur: 30, user: 'Public Safety', material: 'Logam + Mesiu', desc: 'Pistol standar Keamanan Publik. Peluru terbatas.'},
  {nama: 'Hammer', jenis: 'Melee', tier: 'C', dmg: 40, harga: 450000, emoji: '🔨', dur: 25, user: 'Pekerja', material: 'Besi + Kayu', desc: 'Palu godam. Bisa nghancurin tengkorak iblis.'},
// TAHAP 2 (SENJATA 26 - 50: TIER C SAMPAI B | HARGA: 480.000 - 1.450.000)
  {nama: 'Soap Knife', jenis: 'Yoru Transmutasi', tier: 'C', dmg: 22, harga: 480000, emoji: '🧼', dur: 8, user: 'Yoru', material: 'Batang sabun mandi', desc: 'Pisau dari sabun mandi yang dibuat Yoru untuk menguji kekuatan telekinesis objeknya.'},
  {nama: 'Pencil Dagger', jenis: 'Yoru Transmutasi', tier: 'C', dmg: 18, harga: 500000, emoji: '✏️', dur: 6, user: 'Yoru', material: 'Kayu pensil grafit', desc: 'Alat tulis sekolah Asa yang diubah sekilas oleh Yoru menjadi tusukan kecil pembunuh.'},
  {nama: 'Standard Handgun / Rifle', jenis: 'Api', tier: 'B', dmg: 32, harga: 550000, emoji: '🔫', dur: 40, user: 'Public Safety Agents / Polisi', material: 'Logam dan mesiu standar', desc: 'Pistol dan senapan serbu konvensional untuk menghadapi ancaman manusia atau iblis lemah.'},
  {nama: 'Kusarigama', jenis: 'Melee', tier: 'B', dmg: 33, harga: 650000, emoji: '⛓️', dur: 20, user: 'Kusakabe', material: 'Besi dan rantai baja', desc: 'Senjata fisik tradisional berupa sabit yang terikat rantai, digunakan oleh Kusakabe saat bertugas mengawal Denji.'},
  {nama: 'Rifle', jenis: 'Api', tier: 'B', dmg: 45, harga: 700000, emoji: '🎯', dur: 35, user: 'Sniper', material: 'Logam + Optik', desc: 'Senapan laras panjang. Akurasi tinggi dari jarak jauh.'},
  {nama: 'Katana Akane', jenis: 'Melee', tier: 'B', dmg: 35, harga: 800000, emoji: '🗡️', dur: 20, user: 'Akane Sawatari', material: 'Baja standar', desc: 'Pedang fisik yang digunakan Akane sebelum memanggil Snake Devil. Digunakan dalam pertarungan jarak dekat.'},
  {nama: 'Sushi Sword', jenis: 'Yoru Transmutasi', tier: 'B', dmg: 36, harga: 850000, emoji: '🍣', dur: 12, user: 'Yoru', material: 'Sushi hidangan', desc: 'Pedang unik berdaya tahan rendah yang diubah sekilas dari makanan sushi di atas meja restoran.' },
  {nama: 'Assassination Wire', jenis: 'Melee', tier: 'B', dmg: 42, harga: 900000, emoji: '🧵', dur: 15, user: 'Pembunuh Swasta', material: 'Serat baja karbon', desc: 'Kawat tipis tarikan tinggi yang digunakan secara senyap untuk menjerat leher target secara instan.'},
  {nama: 'Grenade', jenis: 'Api', tier: 'B', dmg: 60, harga: 1000000, emoji: '💣', dur: 5, user: 'Tentara', material: 'Peledak + Besi', desc: 'Granat tangan. Sekali pake langsung meledak. AoE damage.'},
  {nama: 'Flesh Hand Grenade', jenis: 'Yoru Transmutasi', tier: 'B', dmg: 68, harga: 1050000, emoji: '💥', dur: 5, user: 'Yoru', material: 'Potongan tangan manusia', desc: 'Granat peledak taktis hasil konversi potongan daging tangan manusia ciptaan Yoru.'},
  {nama: 'Scalpel Sword', jenis: 'Yoru Transmutasi', tier: 'B', dmg: 48, harga: 1100000, emoji: '⚔️', dur: 18, user: 'Yoru', material: 'Pisau bedah medis', desc: 'Pisau bedah medis yang diubah menjadi pedang panjang tajam saat Yoru bertarung melawan Quanxi.'},
  {nama: 'PSG1 Sniper Rifle', jenis: 'Api', tier: 'B', dmg: 55, harga: 1150000, emoji: '🔭', dur: 30, user: 'Pasukan Keamanan Publik', material: 'Baja reinforced', desc: 'Senapan runduk profesional jarak jauh yang digunakan tim penembak jitu pendukung dari atas gedung.'},
  {nama: 'Multiple Katanas', jenis: 'Melee', tier: 'B', dmg: 28, harga: 1200000, emoji: '🗡️', dur: 10, user: 'Quanxi (Wujud Manusia)', material: 'Baja tradisional Jepang', desc: 'Pedang fisik bawaan Quanxi. Sering patah di tengah pertarungan akibat kecepatan tebasannya yang luar biasa.'},
  {nama: 'Tanaka Spinal Cord Sword', jenis: 'Yoru Transmutasi', tier: 'B', dmg: 58, harga: 1250000, emoji: '🦴', dur: 25, user: 'Yoru', material: 'Tulang belakang manusia', desc: 'Pedang ikonik pembuka Part 2 yang diciptakan Yoru dari kepala dan sumsum tulang belakang Pak Tanaka.'},
  {nama: 'Chainsaw Whip', jenis: 'Yoru Transmutasi', tier: 'B', dmg: 62, harga: 1400000, emoji: '🪚', dur: 22, user: 'Yoru', material: 'Rantai gergaji mesin', desc: 'Cambuk modifikasi tajam dari rantai gergaji mesin Denji dengan memanfaatkan kekuatan Accident Devil.'},
  {nama: 'Kuku Jari Kutukan', jenis: 'Manifestasi', tier: 'B', dmg: 25, harga: 1450000, emoji: '💅', dur: 5, user: 'Pengguna Kontrak', material: 'Kuku tumbal kontrak', desc: 'Mengorbankan potongan kuku tangan sebagai tumbal ritual untuk melukai musuh jarak jauh.'},
  {nama: 'Belati Ganda Darah', jenis: 'Manifestasi', tier: 'B', dmg: 38, harga: 1480000, emoji: '⚔️', dur: 110, user: 'Power', material: 'Darah terkompresi', desc: 'Dua buah pisau genggam taktis hasil pengerasan darah untuk perkelahian super lincah.'},
  {nama: 'Pistol Yakuza Glock', jenis: 'Api', tier: 'B', dmg: 34, harga: 1500000, emoji: '🔫', dur: 20, user: 'Komplotan Katana Man', material: 'Baja ringan impor', desc: 'Senjata api selundupan hitam yang dipakai anak buah yakuza untuk melancarkan serangan kejutan.'},
  {nama: 'Chainsaw', jenis: 'Manifestasi', tier: 'A', dmg: 50, harga: 1550000, emoji: '⛓️', dur: 20, user: 'Denji / Chainsaw Man', material: 'Mesin + Besi', desc: 'Gergaji mesin. Senjata utama Denji. Berisik dan brutal.'},
  {nama: 'Revolver Penembak Hotel', jenis: 'Api', tier: 'A', dmg: 44, harga: 1700000, emoji: '🔫', dur: 12, user: 'Pembunuh Hotel Eternity', material: 'Besi berat putar', desc: 'Pistol silinder dengan peluru kaliber tinggi pembuat luka robek parah pada target manusia.'},
  {nama: 'Senapan Serbu Infanteri', jenis: 'Api', tier: 'A', dmg: 52, harga: 1850000, emoji: '🔫', dur: 45, user: 'Militer Negara', material: 'Aluminium taktis militer', desc: 'Senjata otomatis berat yang muncul dalam kilas balik pasukan dunia menghadapi kedatangan Gun Devil.'},
  {nama: 'Blood Hammer & Spears', jenis: 'Manifestasi', tier: 'A', dmg: 55, harga: 2000000, emoji: '🩸', dur: 999, user: 'Power', material: 'Darah padat terkompresi', desc: 'Senjata berwujud palu raksasa atau tombak dari darah cair yang dikeraskan menjadi objek padat keras.'},
  {nama: 'Tombak Darah Lempar', jenis: 'Manifestasi', tier: 'A', dmg: 58, harga: 2200000, emoji: '🔱', dur: 1, user: 'Power', material: 'Sel darah merah mengkristal', desc: 'Proyektil menusuk jarak jauh yang bisa dilemparkan dari udara secara masif. Sekali pakai.'},
  {nama: 'Palu Godam Darah Berat', jenis: 'Manifestasi', tier: 'A', dmg: 64, harga: 2400000, emoji: '🔨', dur: 70, user: 'Power', material: 'Darah padat kristal berat', desc: 'Senjata penghancur tameng baja yang memadatkan darah menjadi gada raksasa pemecah beton.'},
  {nama: 'Uniform Sword', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 65, harga: 2500000, emoji: '⚔️', dur: 15, user: 'Asa Mitaka / Yoru', material: 'Kain seragam sekolah', desc: 'Pedang fisik padat ciptakan Yoru dengan mengubah seragam pemberian ibu Asa menjadi senjata tajam berdaya rusak tinggi.'},
// TAHAP 3 (SENJATA 51 - 75: TIER A | HARGA: 3.000.000 - 5.800.000)
  {nama: 'Curse Nails', jenis: 'Manifestasi', tier: 'A', dmg: 70, harga: 3000000, emoji: '📌', dur: 4, user: 'Sinterklas / Santa Claus', material: 'Zat paku ritual gaib', desc: 'Media paku ritual penumbuh petaka yang mirip milik Aki, dipakai boneka Santa Claus untuk memanggil iblis.'},
  {nama: 'Nail-Shaped Sword', jenis: 'Manifestasi', tier: 'A', dmg: 80, harga: 3500000, emoji: '📍', dur: 999, user: 'Aki Hayakawa', material: 'Besi berbentuk paku besar', desc: 'Pedang berbentuk paku terhubung dengan Curse Devil. Menusuk target 3 kali memicu kematian instan, mengurangi umur.'},
  {nama: 'Room 606 Sword', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 85, harga: 4000000, emoji: '🏠', dur: 1, user: 'Asa Mitaka / Yoru', material: 'Interior kamar kost', desc: 'Pedang masif hasil konversi seluruh isi ruang kamar tempat tinggal Asa. Termasuk kasur, meja, dan lemari.'},
  {nama: 'Notebook Blade', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 48, harga: 4200000, emoji: '📒', dur: 20, user: 'Yoru', material: 'Kertas catatan tebal', desc: 'Buku catatan sekolah Asa yang dimanifestasikan Yoru menjadi bilah belati tipis berpola tajam.'},
  {nama: 'Classroom Desk Shield', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 10, harga: 4500000, emoji: '🪑', dur: 40, user: 'Asa Mitaka', material: 'Kayu meja besi penyangga', desc: 'Meja kelas biasa yang disihir menjadi perisai kayu berlapis baja pelindung dari Falling Devil.'},
  {nama: 'Cell Clear Sword', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 52, harga: 4800000, emoji: '📱', dur: 15, user: 'Yoru', material: 'Komponen HP elektronik', desc: 'Telepon genggam rusak di jalan yang diubah menjadi belati berlistrik mikro.'},
  {nama: 'Aquarium Spear', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 90, harga: 5000000, emoji: '🏛️', dur: 1, user: 'Asa Mitaka / Yoru', material: 'Beton dan kaca akuarium', desc: 'Tombak fisik raksasa yang dibuat dengan memadatkan seluruh material bangunan Akuarium Tokyo menjadi satu senjata.'},
  {nama: 'Nail Knife', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 30, harga: 5200000, emoji: '💅', dur: 5, user: 'Asa Mitaka', material: 'Lapisan kuku jari tubuh', desc: 'Pisau kecil darurat ciptaan Asa dari kuku jarinya sendiri untuk melukai diri demi lepas dari ilusi Falling Devil.'},
  {nama: 'Yuko Leg Sword', jenis: 'Yoru Transmutasi', tier: 'A', dmg: 72, harga: 5500000, emoji: '🦵', dur: 14, user: 'Yoru', material: 'Daging kaki manusia', desc: 'Pedang tajam dan mengerikan yang diubah secara mendadak dari potongan kaki milik sahabatnya, Yuko.'},
  {nama: 'Ekor Ular Akane', jenis: 'Manifestasi', tier: 'A', dmg: 75, harga: 5600000, emoji: '🐍', dur: 35, user: 'Akane Sawatari', material: 'Ekor manifes Snake Devil', desc: 'Ekor ular berkerak pelat keras yang diturunkan untuk menghancurkan pertahanan garis depan.'},
  {nama: 'Jarum Pengubah Jiwa', jenis: 'Manifestasi', tier: 'A', dmg: 40, harga: 5800000, emoji: '🪡', dur: 90, user: 'Doll Devil', material: 'Jarum serat malam gaib', desc: 'Proyektil menusuk halus supernatural yang mengubah manusia biasa menjadi boneka pelayan.'},
  {nama: 'Bulu Keras Penembus', jenis: 'Manifestasi', tier: 'A', dmg: 48, harga: 6000000, emoji: '🪶', dur: 25, user: 'Iblis Terbang', material: 'Bulu berserat kristal', desc: 'Proyektil bulu tajam yang diluncurkan dari udara dengan kecepatan peluru ringan.'},
  {nama: 'Rantai Pengikat Pochita', jenis: 'Manifestasi', tier: 'A', dmg: 66, harga: 6200000, emoji: '⛓️', dur: 150, user: 'Denji / Pochita', material: 'Rantai daging baja internal', desc: 'Rantai internal tubuh yang ditarik keluar secara paksa untuk menjerat gerakan musuh.'},
  {nama: 'Jerat Tali Usus Gaib', jenis: 'Manifestasi', tier: 'A', dmg: 50, harga: 6400000, emoji: '🪢', dur: 80, user: 'Makima', material: 'Jaringan organ dalam supernatural', desc: 'Organ dalam manifes keluar wujud bertindak sebagai cambuk penarik tubuh lawan.'},
  {nama: 'Cakar Cabik Rubah', jenis: 'Manifestasi', tier: 'A', dmg: 82, harga: 6600000, emoji: '🦊', dur: 10, user: 'Aki (Kontrak Fox)', material: 'Cakar fisik Fox Devil', desc: 'Panggilan cakar masif dari portal neraka untuk merobek musuh secara instan.'},
  {nama: 'Lidah Penembus Dada', jenis: 'Manifestasi', tier: 'A', dmg: 68, harga: 6800000, emoji: '👅', dur: 45, user: 'Leech Devil', material: 'Lidah daging berlendir tebal', desc: 'Senjata tusuk jarak menengah organik yang menghancurkan struktur bangunan dan pelindung musuh.'},
  {nama: 'Benang Boneka Tak Terlihat', jenis: 'Manifestasi', tier: 'A', dmg: 10, harga: 7000000, emoji: '🧵', dur: 999, user: 'Puppet Devil', material: 'Serat benang gaib halus', desc: 'Benang tipis pengontrol pergerakan mayat hidup untuk menciptakan gelombang serbu boneka.'},
  {nama: 'Taring Penghancur Bat', jenis: 'Manifestasi', tier: 'A', dmg: 76, harga: 7200000, emoji: '🦇', dur: 50, user: 'Bat Devil', material: 'Struktur gigi kalsium monster', desc: 'Mulut raksasa penghancur benda fisik padat seperti mobil dan pilar beton.' },
  {nama: 'Lengan Bilah Longsword', jenis: 'Hybrid', tier: 'A', dmg: 84, harga: 7500000, emoji: '⚔️', dur: 200, user: 'Miri Sugo', material: 'Bilah logam ksatria eropa', desc: 'Transformasi lengan menjadi sepasang pedang panjang bermata dua untuk memotong formasi musuh.'},
  {nama: 'Tombak Cabut Leher', jenis: 'Hybrid', tier: 'A', dmg: 88, harga: 7800000, emoji: '🔱', dur: 180, user: 'Spear Hybrid', material: 'Batang tombak sumsum tulang', desc: 'Mekanisme mencabut tombak tajam langsung dari sumsum belakang leher untuk senjata lempar jarak menengah.'},
  {nama: 'Pecut Cambuk Bertulang', jenis: 'Hybrid', tier: 'A', dmg: 82, harga: 8000000, emoji: '🪢', dur: 220, user: 'Whip Hybrid', material: 'Daging beruas tulang tajam', desc: 'Lengan yang berubah menjalar menjadi cambuk mematikan untuk menyapu barisan musuh jarak menengah.'},
  {nama: 'Gergaji Tulang Kaki', jenis: 'Hybrid', tier: 'A', dmg: 90, harga: 8200000, emoji: '🪚', dur: 120, user: 'Denji', material: 'Mata gergaji internal kaki', desc: 'Mata gergaji mesin kejutan tak terduga yang sengaja dimunculkan dari tulang kering bawah untuk merobek pertahanan Santa Claus.'},
  {nama: 'Tali Starter Dada', jenis: 'Hybrid', tier: 'A', dmg: 0, harga: 8500000, emoji: '🪢', dur: 999, user: 'Denji / Pochita', material: 'Kabel starter pemicu mesin', desc: 'Kunci pas aktivasi internal di dada Denji untuk memicu seluruh sistem senjata gergaji tubuh.'},
  {nama: 'Gergaji Lengan Utama', jenis: 'Hybrid', tier: 'A', dmg: 94, harga: 8800000, emoji: '🪚', dur: 140, user: 'Denji / Chainsaw Man', material: 'Mata pisau rantai baja gila', desc: 'Sepasang gergaji mesin brutal mencuat dari kedua lengan bawah pembelah iblis.'},
  {nama: 'Gergaji Kepala Vertikal', jenis: 'Hybrid', tier: 'A', dmg: 98, harga: 9000000, emoji: '🪚', dur: 130, user: 'Chainsaw Man', material: 'Mata gergaji batok kepala', desc: 'Bilah gergaji vertikal raksasa di kepala untuk membelah musuh saat melakukan terjangan depan.'},
// TAHAP 4 (SENJATA 76 - 100: TIER S SAMPAI SSS | HARGA: 9.500.000 - 20.000.000+ | TERMASUK ITEM OP)
  {nama: 'Moncong Api Lengan', jenis: 'Hybrid', tier: 'S', dmg: 105, harga: 9500000, emoji: '🔥', dur: 160, user: 'Barem Bridge', material: 'Penyembur api organik tubuh', desc: 'Sistem penyembur api taktis yang terintegrasi di dalam daging lengan setelah memicu gigi palsu.'},
  {nama: 'Lengan Pisau Katana', jenis: 'Hybrid', tier: 'S', dmg: 110, harga: 10000000, emoji: '⚔️', dur: 250, user: 'Katana Man', material: 'Bilah pedang samurai legendaris', desc: 'Bilah pedang katana panjang mencuat dari persendian tangan bawah untuk tebasan kilat.'},
  {nama: 'Busur Panah Silang', jenis: 'Hybrid', tier: 'S', dmg: 115, harga: 10500000, emoji: '🏹', dur: 240, user: 'Quanxi', material: 'Busur mekanis gaib internal', desc: 'Lengan wujud panah massal pelontar puluhan anak panah tajam pembantai musuh.'},
  {nama: 'Kepala Hulu Ledak Bom', jenis: 'Hybrid', tier: 'S', dmg: 125, harga: 11000000, emoji: '💣', dur: 90, user: 'Reze (Bomb Girl)', material: 'Jaringan tubuh peledak aktif', desc: 'Mengubah seluruh kepala dan badan menjadi bom aktif berdaya hancur misil ledakan beruntun.'},
  {nama: 'Pin Granat Leher', jenis: 'Hybrid', tier: 'S', dmg: 0, harga: 11500000, emoji: '🧷', dur: 999, user: 'Reze', material: 'Pin logam pemantik leher', desc: 'Mekanisme penarik pin granat organik di leher untuk memicu transformasi bom masif.'},
  {nama: 'Gigi Pemantik Api', jenis: 'Hybrid', tier: 'S', dmg: 0, harga: 12000000, emoji: '🦷', dur: 999, user: 'Barem Bridge', material: 'Gigi pemantik internal', desc: 'Gigi palsu pemicu katup api internal daging tubuh untuk mengaktifkan wujud pembakar.'},
  {nama: 'Anak Panah Masif', jenis: 'Hybrid', tier: 'S', dmg: 92, harga: 12500000, emoji: '🎯', dur: 300, user: 'Quanxi', material: 'Proyektil tajam supernatural', desc: 'Amunisi panah berkecepatan tinggi hasil transmutasi berburu pembantai ratusan boneka.'},
  {nama: 'Bilah Gergaji Fakesaw', jenis: 'Hybrid', tier: 'S', dmg: 96, harga: 13000000, emoji: '🪚', dur: 150, user: 'Fakesaw Man', material: 'Bilah pisau tiruan bayonet', desc: 'Senjata gergaji mesin replika peniru Denji milik pemburu misterius.'},
  {nama: 'Tanduk Penghisap Cairan', jenis: 'Hybrid', tier: 'S', dmg: 40, harga: 13500000, emoji: '😈', dur: 999, user: 'Power', material: 'Tanduk kalsium pengalir darah', desc: 'Tanduk kepala penyerap cairan merah musuh untuk memicu regenerasi darah instan saat bertarung.'},
  {nama: 'Semburan Napalm Lebur', jenis: 'Hybrid', tier: 'S', dmg: 135, harga: 14000000, emoji: '🔥', dur: 80, user: 'Barem (Wujud Penuh)', material: 'Bahan bakar napalm organik', desc: 'Semburan api bersuhu tinggi peleleh beton dan struktur pertahanan musuh.'},
  {nama: 'College Fund Turrets', jenis: 'Yoru Transmutasi', tier: 'S', dmg: 105, harga: 6000000, emoji: '🗼', dur: 1, user: 'Asa Mitaka / Yoru', material: 'Uang kuliah logam taktis', desc: 'Meriam statis masif yang dipanggil Yoru dengan mengorbankan dan menumbalkan seluruh tabungan masa depan kuliah Asa.'},
  {nama: 'Lifespan Sword (Halo)', jenis: 'Manifestasi', tier: 'S', dmg: 110, harga: 7000000, emoji: '😇', dur: 40, user: 'Angel Devil / Aki', material: 'Akumulasi potongan umur', desc: 'Pedang dari lingkaran halo malaikat hasil konversi umur manusia. Memotong zat gaib/jiwa tanpa merusak fisik luar.'},
  {nama: 'Lifespan Spear (Halo)', jenis: 'Manifestasi', tier: 'S', dmg: 120, harga: 8000000, emoji: '🔱', dur: 1, user: 'Angel Devil (Makima)', material: '100 Tahun umur manusia', desc: 'Tombak besar bermanifestasi halo berkekuatan dahsyat hasil serapan umur panjang yang dilemparkan khusus menusuk Pochita.'},
  {nama: 'Ribuan Tombak Udara Darah', jenis: 'Manifestasi', tier: 'SS', dmg: 145, harga: 14500000, emoji: '🩸', dur: 1, user: 'Power (Blood Devil)', material: 'Darah murni Iblis Darah', desc: 'Hujan ratusan senjata tajam mengambang di langit hasil manipulasi darah neraka untuk mengepung Makima. Sekali pakai.'},
  {nama: 'Lengan Senapan Gun Fiend', jenis: 'Hybrid', tier: 'SS', dmg: 140, harga: 15000000, emoji: '🔫', dur: 350, user: 'Aki (Wujud Gun Fiend)', material: 'Senapan serbu menyatu jaringan tubuh', desc: 'Senapan serbu militer berat yang menggantikan struktur tangan kanan Aki pasca diambil alih.'},
  {nama: 'Pistol Wajah Gun Fiend', jenis: 'Hybrid', tier: 'SS', dmg: 130, harga: 15500000, emoji: '🔫', dur: 280, user: 'Aki (Wujud Gun Fiend)', material: 'Pistol M200 struktur tengkorak', desc: 'Moncong pistol genggam mencuat tepat di tengah wajah hancur pembawa peluru maut kaliber tinggi.'},
  {nama: 'Meriam Dada Tank Devil', jenis: 'Hybrid', tier: 'SS', dmg: 155, harga: 16000000, emoji: '💣', dur: 180, user: 'Wujud Tempur Tank', material: 'Moncong meriam baja depan dada', desc: 'Meriam berat penembak amunisi makro taktis yang melekat di area tubuh depan bawah.'},
  {nama: 'Lengan Gergaji Empat Buah', jenis: 'Hybrid', tier: 'SS', dmg: 160, harga: 17000000, emoji: '🪚', dur: 400, user: 'Pochita (Hero of Hell)', material: 'Baja neraka reinforced', desc: 'Empat buah lengan gergaji mesin penuh berputar gila dalam wujud monster asli neraka.'},
  {nama: 'Senapan Otomatis Punggung', jenis: 'Hybrid', tier: 'SS', dmg: 138, harga: 17500000, emoji: '⛓️', dur: 500, user: 'Gun Devil (Bentuk 20%)', material: 'Deretan laras baja militer', desc: 'Barisan senapan serbu otomatis di area punggung raksasa pelontar ribuan peluru otomatis.'},
  {nama: 'Gatling Gun Lengan', jenis: 'Hybrid', tier: 'SS', dmg: 165, harga: 18000000, emoji: '🔥', dur: 600, user: 'Gun Devil', material: 'Laras putar makro', desc: 'Senapan mesin berputar laras enam pelontar jutaan peluru per detik perontok kota.'},
  {nama: 'Peluru Kendali Makro', jenis: 'Hybrid', tier: 'SS', dmg: 175, harga: 18500000, emoji: '🚀', dur: 1, user: 'Gun Devil (Bentuk Penuh)', material: 'Amunisi nuklir peledak benua', desc: 'Misil balistik raksasa penghancur peradaban dari jarak ribuan kilometer lintas benua. Sekali pakai.'},
  {nama: 'Right Gun Gauntlet', jenis: 'Yoru Transmutasi', tier: 'SS', dmg: 140, harga: 9000000, emoji: '🦾', dur: 50, user: 'Yoru / Asa Mitaka', material: 'Sisa daging Gun Devil', desc: 'Lengan kanan Asa yang bertransformasi menjadi sarung tangan meriam berlaras raksasa pasca pengorbanan Gun Devil.'},
  {nama: 'Left Tank Gauntlet', jenis: 'Yoru Transmutasi', tier: 'SS', dmg: 150, harga: 9500000, emoji: '🛡️', dur: 60, user: 'Yoru / Asa Mitaka', material: 'Sisa baja Tank Devil', desc: 'Lengan kiri Asa hasil pengorbanan Tank Devil menjadi pelindung perisai baja berat penembak taktis brutal.'},
  {nama: 'State of Michigan Greatsword', jenis: 'Yoru Transmutasi', tier: 'SSS', dmg: 180, harga: 12000000, emoji: '🗺️', dur: 1, user: 'Yoru', material: 'Tanah daratan Michigan', desc: 'Pedang berskala kolosal terkuat milik Yoru yang dibentuk dari satu wilayah utuh negara bagian Amerika saat melawan Chainsaw Man.'},
  {nama: 'Gun Devil\'s Flesh Bullets', jenis: 'Api', tier: 'SSS', dmg: 200, harga: 10000000, emoji: '🔫', dur: 1, user: 'Makima / Public Safety', material: 'Serpihan daging Gun Devil berbentuk peluru', desc: 'Proyektil fisik dari sisa tubuh Gun Devil yang bereaksi dan bergerak menuju potongan tubuh utama jika diletakkan berdekatan. Damage paling sakit di game. Sekali pake.'},
  {nama: 'Gergaji Penghapus Konsep', jenis: 'Hybrid', tier: 'SSS', dmg: 250, harga: 20000000, emoji: '🪚', dur: 999, user: 'Pochita', material: 'Mata gergaji penembus realita', desc: 'Senjata pamungkas Chainsaw Man sejati. Menghapus eksistensi, nama, konsep, dan ingatan seluruh iblis yang berhasil ditelan masuk mulutnya.'}
];

  // === STORY LIST QUEST 14 ARC - FULL LORE ===
const STORY_LIST = [
    {no: 1, saga: 'Public Safety Saga', nama: 'Arc 1: Introduction', devil: 'Bat Devil', chapters: '1 - 4', reward: 500, desc: 'Denji, seorang pemburu iblis miskin, hidup bersama Pochita si Chainsaw Devil. Setelah dikhianati Yakuza dan mati, Pochita berkorban dan menyatu dengannya. Denji bangkit sebagai Chainsaw Man. Makima dari Keamanan Publik menemukannya dan menawarinya kehidupan layak asalkan mau bekerja untuknya. Inilah awal dari kontrak berdarah Denji.'},
    {no: 2, saga: 'Public Safety Saga', nama: 'Arc 2: Bat Devil', devil: 'Bat Devil', chapters: '5 - 12', reward: 1000, desc: 'Hari pertama Denji di Divisi 4. Dia dipasangkan dengan Power si Blood Fiend yang berisik. Tugas pertama mereka adalah menyelamatkan Meowy, kucing Power yang diculik Bat Devil. Pertarungan pertama Denji sebagai Chainsaw Man melawan iblis pemakan darah ini sangat brutal. Dari sini persahabatan aneh antara Denji, Power, dan Aki mulai terbentuk.'},
    {no: 3, saga: 'Public Safety Saga', nama: 'Arc 3: Eternity Devil', devil: 'Eternity Devil', chapters: '13 - 21', reward: 2000, desc: 'Seluruh anggota Divisi 4 terjebak di dalam Hotel tanpa jalan keluar. Pelaku nya adalah Eternity Devil yang ingin jantung Denji sebagai persembahan. Hari terus berulang selama berhari-hari. Makanan habis, orang mulai gila. Di tengah keputusasaan, Denji menemukan cara gila untuk menang: memakan dan memotong hotel itu sendiri. Kemenangan ini membuat Denji jadi incaran dunia.'},
    {no: 4, saga: 'Public Safety Saga', nama: 'Arc 4: Katana Man', devil: 'Katana Man', chapters: '22 - 38', reward: 3000, desc: 'Balas dendam Yakuza datang. Katana Man dan Akane Sawatari melancarkan serangan teror ke seluruh Divisi 4. Aki, Himeno, dan lainnya terluka parah. Untuk menghadapi ini, Denji dan Power dikirim ke neraka untuk latihan khusus di bawah Kishibe. Mereka kembali lebih kuat, tapi kehilangan banyak orang terdekat. Darah membasahi jalanan Tokyo dalam perang habis-habisan ini.'},
    {no: 5, saga: 'Public Safety Saga', nama: 'Arc 5: Bomb Devil', devil: 'Bomb Devil', chapters: '39 - 52', reward: 4000, desc: 'Denji bertemu Reze, gadis cantik pekerja kafe yang baik padanya. Untuk pertama kalinya Denji merasakan cinta dan kencan normal. Tapi kebahagiaan itu palsu. Reze adalah mata-mata Soviet dan hibrida Bomb Devil yang dikirim untuk membunuh Denji dan membawa jantungnya. Pertarungan di jembatan itu menghancurkan hati Denji. Cinta pertama = luka pertama.'},
    {no: 6, saga: 'Public Safety Saga', nama: 'Arc 6: International Assassins', devil: 'Quanxi', chapters: '53 - 70', reward: 5000, desc: 'Identitas Chainsaw Man bocor ke seluruh dunia. Negara-negara mengirim pembunuh bayaran terkuat mereka ke Jepang. Quanxi dari China, Santa Claus dari Jerman, dan 3 bersaudara dari AS datang untuk merebut Denji. Tokyo jadi medan perang internasional. Makima mulai menunjukkan sisi aslinya yang mengerikan saat melindungi "anjing" kesayangannya.'},
    {no: 7, saga: 'Public Safety Saga', nama: 'Arc 7: Gun Devil', devil: 'Gun Devil', chapters: '71 - 79', reward: 10000, desc: 'Mimpi buruk semua manusia menjadi nyata. Gun Devil, iblis yang membunuh 1.2 juta orang dalam 5 menit, akhirnya muncul di Jepang. Pecahan tubuhnya dikendalikan banyak orang. Aki membuat kontrak dengan Gun Devil untuk membalas dendam, tapi itu adalah awal dari akhirnya. Arc ini adalah titik balik paling kelam di Part 1.'},
    {no: 8, saga: 'Public Safety Saga', nama: 'Arc 8: Control Devil', devil: 'Control Devil', chapters: '80 - 97', reward: 20000, desc: 'Topeng Makima akhirnya lepas. Dia adalah Control Devil, salah satu Four Horsemen. Semua penderitaan Denji adalah rencananya. Dia ingin menciptakan dunia ideal dengan mengendalikan Chainsaw Man. Denji yang hancur harus bangkit dan bertarung demi kebebasannya. Pertarungan terakhir melawan "ibu" ini menentukan nasib dunia dan diakhiri dengan cara paling Denji: memakannya.'},
    {no: 9, saga: 'Academy Saga', nama: 'Arc 9: Justice Devil', devil: 'Justice Devil', chapters: '98 - 111', reward: 2500, desc: '4 tahun kemudian. Cerita pindah ke Asa Mitaka, siswi canggung yang tubuhnya dirasuki Yoru si War Devil. Mereka dipaksa membentuk klub pemburu iblis di sekolah. Misi pertama mereka adalah melawan Justice Devil yang menghukum "orang jahat". Konflik antara Asa yang ingin hidup normal dan Yoru yang ingin perang dimulai di sini.'},
    {no: 10, saga: 'Academy Saga', nama: 'Arc 10: Aquarium', devil: 'Eternity Devil', chapters: '112 - 120', reward: 3500, desc: 'Yoru memaksa Asa untuk berkencan dengan Denji di akuarium agar bisa mengubahnya jadi senjata. Kencan canggung itu kacau karena kemunculan Eternity Devil versi mini. Denji yang sekarang jadi selebriti sekolah membuat Asa makin frustasi. Hubungan aneh segitiga Denji-Asa-Yoru resmi dimulai di arc komedi tragis ini.'},
    {no: 11, saga: 'Academy Saga', nama: 'Arc 11: Falling Devil', devil: 'Falling Devil', chapters: '121 - 131', reward: 15000, desc: 'Primal Fear pertama muncul di Part 2. Falling Devil, utusan neraka, datang ke bumi. Dia membuat semua orang yang melihatnya jatuh ke dalam keputusasaan tanpa akhir. Targetnya adalah Asa dan Yoru untuk dijadikan hidangan di neraka. Arc ini memperkenalkan konsep ketakutan baru yang lebih abstrak dan mengerikan dari Gun Devil.'},
    {no: 12, saga: 'Academy Saga', nama: 'Arc 12: Chainsaw Church', devil: 'Barem Bridge', chapters: '132 - 155', reward: 18000, desc: 'Sebuah sekte besar bernama Chainsaw Man Church berdiri. Dipimpin Fami si Famine Devil dan Barem Bridge si Flamethrower Hybrid. Tujuan mereka gila: memicu kepunahan massal agar Chainsaw Man muncul dan menghapus ketakutan dari dunia. Mereka menculik Denji dan menyebarkan propaganda. Perang ideologi antara pemuja dan pembenci Chainsaw Man pecah.'},
    {no: 13, saga: 'Academy Saga', nama: 'Arc 13: Prison Break', devil: 'Prison Devil', chapters: '156 - 179', reward: 25000, desc: 'Denji ditangkap Keamanan Publik dan dimutilasi di pusat karantina. Tubuhnya dipotong-potong dan dipenjara. Asa, Nayuta, dan teman-teman melancarkan misi penyelamatan gila. Di titik terendah, Pochita kembali mengambil alih dan mengamuk sebagai Chainsaw Man penuh. Ini adalah kebangkitan Denji yang paling brutal.'},
    {no: 14, saga: 'Academy Saga', nama: 'Arc 14: Aging Devil', devil: 'Aging Devil', chapters: '180+', reward: 50000, desc: 'Ramalan Nostradamus tentang kiamat mendekat. Aging Devil, salah satu ketakutan paling purba manusia, muncul. Dia bisa membuat targetnya menua dan mati seketika. Fami dan Chainsaw Church menjalankan rencana akhir mereka. Semua karakter berkumpul untuk pertarungan terakhir.'},
    {no: 15, saga: 'Final Saga', nama: 'Arc 15: Chainsaw Devil', devil: 'Chainsaw Devil', chapters: 'Finale', reward: 75000, desc: 'Di ambang akhir dunia, Chainsaw Devil bangkit dalam wujud penuhnya. Semua kontrak, kehilangan, dan pilihanmu bertemu di satu pertempuran terakhir. Kamu tidak hanya melawan kekuatan terkuat di Neraka, tetapi juga menentukan apakah dunia akan mengingat, melupakan, atau hidup berdampingan dengan Chainsaw Man.'}
  ]

const MAIN_LOCATION_LIST = [
    { nama: "Kamar Denji Lama", desc: "Gubuk kayu sempit tempat Denji dan Pochita tidur bersama di awal cerita.", rateDevil: 0.15, level: 1, drop: ["Cigarette (Rokok Easy Revenge)", "Uang Koin 100 Yen", "Sedotan Plastik Bekas"], characters: ["Denji", "Pochita"] },
    { nama: "Gudang Tua Yakuza", desc: "Tempat Denji dimutilasi di awal cerita sebelum bangkit menjadi Chainsaw Man.", rateDevil: 0.45, level: 5, drop: ["Brosur Perekrutan Publik", "Koran Berita Tragedi", "Klip Kertas Besi"], characters: ["Katana Man / Samurai Sword", "Katana Man's Grandfather", "Kenzo"] },
    { nama: "Stasiun Nerima", desc: "Area stasiun tempat Denji pertama kali bertemu Makima setelah diselamatkan.", rateDevil: 0.25, level: 3, drop: ["Uang Koin 100 Yen", "Korek Api Gas (Lighter)", "Tali Rafia Gulung"], characters: ["Denji", "Makima"] },
    { nama: "Apartemen Hayakawa", desc: "Tempat tinggal bersama Denji, Aki Hayakawa, dan Power di Tokyo.", rateDevil: 0.10, level: 4, drop: ["Perban Medis Gulung", "Botol Kaca Kosong", "Darah Botolan Konvensional"], characters: ["Denji", "Aki Hayakawa", "Power", "Meowy", "Gun Fiend"] },
    { nama: "Markas Public Safety", desc: "Kantor pusat pemburu iblis divisi 4 tempat Denji dan rekan-rekan bekerja.", rateDevil: 0.20, level: 8, drop: ["Public Safety Badge", "Gunting Medis Publik", "Senter Saku Taktis"], characters: ["Aki Hayakawa", "Kobeni Higashiyama", "Himeno", "Kishibe", "Galgali", "Madoka", "Fushi", "Nail Fiend", "Nomo", "Kato", "Tanabe", "Furuno", "Takagi", "Masaki Ando", "Nakamura", "Hiroshi", "Princi"] },
    { nama: "Hotel Morin", desc: "Lokasi misi melawan Eternity Devil, di mana Divisi 4 terjebak di lantai 8.", rateDevil: 0.65, level: 10, drop: ["Peta Denah Bunker", "Sabun Batang Hotel", "Kain Kasa Gulung Besar"], characters: [] },
    { nama: "Apartemen Himeno", desc: "Rumah pribadi Himeno tempat Denji terbangun di kasurnya setelah pesta penyambutan.", rateDevil: 0.15, level: 7, drop: ["Saputangan Kain Kishibe", "Botol Kaca Kosong", "Permen Karet Penenang"], characters: ["Himeno", "Aki Hayakawa"] },
    { nama: "Stasiun Kyoto", desc: "Stasiun kereta tempat Makima ditumpangi dan ditembak oleh komplotan Katana Man.", rateDevil: 0.40, level: 12, drop: ["Kunci Fiat Kobeni", "Jas Hujan Plastik", "Radio HT Komunikasi"], characters: ["Makima", "Katana Man / Samurai Sword", "Yutaro Kurose", "Michiko Tendo", "Subaru"] },
    { nama: "Kuil Omiwa", desc: "Kuil di Kyoto tempat Makima mengeksekusi tumbal narapidana dari jarak jauh.", rateDevil: 0.30, level: 11, drop: ["Lencana Perunggu Agen Lapangan", "Kantong Darah Donor Publik"], characters: ["Makima"] },
    { nama: "Distrik Shinjuku", desc: "Area jalanan padat tempat terjadinya pertarungan besar klimaks melawan Katana Man.", rateDevil: 0.55, level: 13, drop: ["Korek Api Zippo Kosong", "Dompet Kulit Kosong Korban", "Kacamata Hitam Agen Taktis"], characters: ["Katana Man / Samurai Sword", "Akane Sawatari", "Kusakabe", "Tamaoki", "Miri Sugo", "Minami Nakano"] },
    { nama: "Rumah Sakit Tokyo (Hospital)", desc: "Tempat Aki dirawat setelah arc Katana Man, sekaligus lokasi ia menangisi Himeno.", rateDevil: 0.20, level: 9, drop: ["Kantong Darah Donor Publik", "Botol Alkohol Medis 70%", "Kain Kasa Steril Gulung Lapangan"], characters: ["Aki Hayakawa", "Sakura"] },
    { nama: "Hutan Tempat Latihan Kishibe (Forest)", desc: "Hutan terpencil tempat Denji dan Power disiksa serta dilatih bertarung oleh Kishibe.", rateDevil: 0.35, level: 14, drop: ["Sabun Batang Hotel", "Kabel Tembaga Gardu Induk", "Rantai Besi"], characters: ["Kishibe", "Denji", "Power"] },
    { nama: "Makam Keluarga Hayakawa", desc: "Area pemakaman bersalju di wilayah utara Hokkaido tempat Aki rutin berziarah.", rateDevil: 0.10, level: 6, drop: ["Bunga Plastik", "Lilin", "Buku Catatan"], characters: ["Aki Hayakawa"] },
    { nama: "Kafe Crossroads (Trois Bagues Vertes)", desc: "Tempat Reze bekerja sebagai barista paruh waktu yang sering dikunjungi Denji.", rateDevil: 0.25, level: 15, drop: ["Cangkir Kopi", "Gula", "Permen Karet Penenang"], characters: ["Denji", "Reze", "Rina"] },
    { nama: "Stan Telepon Umum Nishi-Kanda (Phonebooth)", desc: "Tempat ikonik saat Denji berteduh dari hujan dan pertama kali bertemu Reze.", rateDevil: 0.20, level: 15, drop: ["Koin Telepon", "Payung Rusak"], characters: ["Denji", "Reze"] },
    { nama: "Tangga Onnazaka", desc: "Tangga curam ikonik yang menjadi rute jalan dan lokasi kencan Denji bersama Reze.", rateDevil: 0.25, level: 15, drop: ["Payung Rusak", "Jas Hujan Plastik"], characters: ["Denji", "Reze"] },
    { nama: "Gereja Kuno (Church)", desc: "Gedung gereja tua tempat Reze mengurung dan membantai para pemburu iblis.", rateDevil: 0.50, level: 16, drop: ["Salib Kayu", "Alkitab Sobek", "Jerrycan Bensin Penuh"], characters: ["Reze"] },
    { nama: "Gudang Pelabuhan (Warehouse)", desc: "Lokasi pertempuran malam hari saat Denji disergap oleh Reze (Bomb Devil).", rateDevil: 0.60, level: 17, drop: ["Jerrycan Bensin Penuh", "Rantai Besi", "Botol Kaca Kosong"], characters: ["Reze"] },
    { nama: "Kuburan Massal Pemburu Iblis (Graveyard)", desc: "Pemakaman umum tempat Kishibe dan Makima mengobrol tentang rekan yang gugur.", rateDevil: 0.30, level: 18, drop: ["Bunga Kubur", "Lencana Rusak", "Rompi Anti-Peluru Rusak"], characters: ["Kishibe", "Makima"] },
    { nama: "Bioskop Tokyo (Movie Theater)", desc: "Tempat kencan seharian penuh antara Denji and Makima, di mana mereka menonton banyak film.", rateDevil: 0.15, level: 19, drop: ["Tiket Bioskop", "Popcorn", "Kantong Mayat Higienis Medis"], characters: ["Denji", "Makima"] },
    { nama: "Neraka (Hell)", desc: "Dimensi asal para iblis yang digambarkan dengan langit penuh ribuan pintu melayang.", rateDevil: 0.95, level: 20, drop: ["Gun Devil's Flesh Fragment", "Darah Murni Blood Devil", "Pecahan Kaca Hotel Eternity"], characters: ["Santa Claus", "Tolka", "Princi", "Chainsaw Devil", "Blood Devil"] },
    { nama: "Fasilitas Pengolahan Limbah", desc: "Tempat terpencil di mana Makima memanggil seluruh bawahannya untuk menghadapi Gun Devil.", rateDevil: 0.70, level: 20, drop: ["Selongsong Amunisi Meriam Berat", "Gas Masker Filter Ganda"], characters: ["Makima"] },
    { nama: "Kamar Kos Baru Denji", desc: "Tempat tinggal sewaan Denji di Part 2 untuk menghidupi Nayuta dan merawat kumpulan anjing.", rateDevil: 0.25, level: 2, drop: ["Buku Catatan Asa Mitaka", "Pensil Grafit Sekolah", "Makanan Anjing"], characters: ["Denji", "Nayuta"] },
    { nama: "Rumah Kos Asa Mitaka", desc: "Kamar kos sederhana milik Asa Mitaka, tempat ia menyendiri dan berbicara dengan Yoru.", rateDevil: 0.35, level: 5, drop: ["Buku Catatan Pelajaran Sekolah Asa", "Buku Catatan Pelajaran"], characters: ["Asa Mitaka", "Yoru"] },
    { nama: "SMA Fourth East", desc: "Sekolah tempat Asa Mitaka, Denji, Hirofumi Yoshida, dan Haruka Iseumi belajar.", rateDevil: 0.40, level: 4, drop: ["Pensil Grafit Alat Tulis Kelas", "Buku Catatan"], characters: ["Asa Mitaka", "Denji", "Yoshida", "Haruka Iseumi", "Yuko", "Nobana Higashiyama", "Seigi Akoku", "Asami", "Mr. Tanaka", "Jiro"] },
    { nama: "Akuarium Kota", desc: "Tempat kencan Asa Mitaka dan Denji, di mana mereka terjebak Eternity Devil kedua kalinya.", rateDevil: 0.65, level: 12, drop: ["Ikan Hias", "Gelas Plastik", "Kapsul Minyak Ikan"], characters: ["Asa Mitaka", "Denji"] },
    { nama: "Gereja Chainsaw Man", desc: "Markas besar organisasi kultus massal yang dipimpin oleh Fami (Famine Devil).", rateDevil: 0.50, level: 18, drop: ["Buku Panduan Eksplorasi", "Lembar Analisis Kelemahan Boss"], characters: ["Fami", "Barem Bridge", "Whip Hybrid", "Spear Hybrid", "Miki Takanashi"] },
    { nama: "Tokyo Devil Detention Center", desc: "Fasilitas bawah tanah rahasia milik militer untuk menahan iblis dan hibrida.", rateDevil: 0.85, level: 20, drop: ["Gas Masker Filter Ganda", "Tabung Pemadam Api Gedung", "Radio HT Enkripsi Sandi"], characters: ["Kentaro Ishita", "Shin Toma", "Tadashi Hasegawa", "Hadaji Sakagami", "Yuki Tomoda"] }
];

const SIDE_LOCATION_LIST = [
    { nama: "Apartemen Korban Bat Devil", desc: "Kamar sepi tempat Bat Devil menyandera Meowy, kucing kesayangan milik Power.", rateDevil: 0.50, level: 8, drop: ["Bulu Rambut Leech Devil", "Kantong Darah Donor Publik"], characters: ["Power", "Meowy"] },
    { nama: "Toko Roti Murah Tokyo", desc: "Tempat Denji membeli roti sisa atau selai murah dengan sisa uang recehnya di awal cerita.", rateDevil: 0.10, level: 1, drop: ["Roti Basi", "Uang Koin 100 Yen"], characters: ["Old Man Sato"] },
    { nama: "Gang Belakang Apartemen", desc: "Tempat pembuangan sampah di mana Denji menemukan anak anjing terlantar mirip Pochita.", rateDevil: 0.20, level: 1, drop: ["Pochita Mini", "Kardus"], characters: ["Denji", "Pochita"] },
    { nama: "Atap Gedung Koun (Nerima)", desc: "Atap bangunan tempat Power pertama kali pamer kekuatan darah dengan melompat.", rateDevil: 0.35, level: 3, drop: ["Genteng", "Batu"], characters: ["Power"] },
    { nama: "Kedai Ramen Pinggir Jalan", desc: "Tempat makan sekilas tempat Himeno mengobrol santai mengenai masa lalu Aki kepada Denji.", rateDevil: 0.15, level: 6, drop: ["Mangkuk Ramen", "Sumpit"], characters: ["Himeno", "Denji"] },
    { nama: "Toko Pakaian Dalam", desc: "Toko pakaian yang dikunjungi Denji bersama Power untuk membelikan Power bantalan dada.", rateDevil: 0.10, level: 2, drop: ["Bra", "Karet Gelang Ikat Paket"], characters: ["Denji", "Power"] },
    { nama: "Supermarket Tokyo", desc: "Tempat Aki, Denji, and Power berbelanja bahan makanan bulanan sambil bertengkar.", rateDevil: 0.15, level: 4, drop: ["Kantong Plastik", "Sayur"], characters: ["Aki Hayakawa", "Denji", "Power"] },
    { nama: "Rooftop Pusat Perbelanjaan", desc: "Tempat Katana Man dan Sawatari pertama kali menghadang Denji sebelum transformasi.", rateDevil: 0.45, level: 13, drop: ["Bilah Katana Patah Katana Man", "Korek Api Zippo Besi"], characters: ["Katana Man / Samurai Sword", "Akane Sawatari"] },
    { nama: "Kedai Udon & Sushi", desc: "Tempat makan langganan pasca-misi, termasuk tempat Kishibe menguji Denji dan Power.", rateDevil: 0.20, level: 14, drop: ["Sumpit", "Mangkuk"], characters: ["Kishibe", "Denji", "Power"] },
    { nama: "Kamar Hotel Kyoto", desc: "Penginapan tradisional tempat divisi 4 beristirahat sementara selama perjalanan ke Kyoto.", rateDevil: 0.15, level: 11, drop: ["Kunci Kamar", "Sabun Batang Hotel"], characters: ["Devil Hunter"] },
    { nama: "Sungai Bawah Underground Shinjuku", desc: "Saluran air tempat sisa pertarungan melawan Iblis mengalir setelah dibersihkan.", rateDevil: 0.40, level: 13, drop: ["Sampah", "Botol Kaca Kosong"], characters: [] },
    { nama: "Halte Bus Distrik Chuo", desc: "Tempat duduk umum di mana Kobeni merenungi nasib buruknya setelah mobil barunya hancur.", rateDevil: 0.20, level: 8, drop: ["Tiket Bus", "Dompet Kulit Kosong Korban"], characters: ["Kobeni Higashiyama"] },
    { nama: "Toko Buku Jimbocho", desc: "Kawasan toko buku tua yang dilewati dan membangun atmosfer romantis cerita Reze.", rateDevil: 0.15, level: 15, drop: ["Buku Novel", "Pensil Grafit"], characters: ["Reze", "Denji"] },
    { nama: "Aoi Building", desc: "Gedung berarsitektur retro khas era Showa yang dilewati Reze dalam rute perjalanannya.", rateDevil: 0.20, level: 15, drop: ["Brosur", "Kamera"], characters: ["Reze"] },
    { nama: "Gang Sempit Kanda (Alley)", desc: "Gang sunyi di dekat kafe, tempat tragis di mana Makima/Angel Devil mencegat Reze.", rateDevil: 0.45, level: 16, drop: ["Darah Kering", "Pisau"], characters: ["Makima", "Angel Devil", "Reze", "Akane Sawatari"] },
    { nama: "Kamar Hotel Quanxi", desc: "Tempat Quanxi bersantai bersama pacar-pacar fiend-nya sebelum mulai beraksi.", rateDevil: 0.30, level: 17, drop: ["Anak Panah Sisa Quanxi", "Kunci Kamar"], characters: ["Quanxi", "Pingtsi", "Cosmo", "Long", "Tsugihagi"] },
    { nama: "Kamar Sewaan Tiga Bersaudara", desc: "Kamar penginapan murah tempat tiga bersaudara pembunuh bayaran asal Amerika menyusun rencana.", rateDevil: 0.25, level: 16, drop: ["Pistol", "Peluru"], characters: ["Aldo", "Joey", "Kuro"] },
    { nama: "Restoran Mewah Tokyo", desc: "Tempat makan malam mewah di mana Kurose dan Tendo menjamu rekannya sebelum disergap.", rateDevil: 0.35, level: 18, drop: ["Garpu Emas", "Botol Alkohol Medis Steril 95%"], characters: ["Yutaro Kurose", "Michiko Tendo"] },
    { nama: "Jalan Raya Pinggiran Kota", desc: "Lokasi mobil patroli Public Safety diberondong peluru oleh mobil kloningan Santa Claus.", rateDevil: 0.50, level: 19, drop: ["Ban Mobil", "Satu Box Amunisi Inti Tungsten"], characters: ["Santa Claus", "Gun Fiend"] },
    { nama: "Toko Suvenir", desc: "Toko kecil tempat Aldo (pembunuh bayaran) bersembunyi dengan menyamar menggunakan topeng.", rateDevil: 0.15, level: 17, drop: ["Topeng", "Kacamata Hitam Agen Taktis"], characters: ["Aldo", "Joey", "Kuro"] },
    { nama: "Pusat Keramaian Shibuya", desc: "Latar jalanan silang ikonik di mana Denji versi Chainsaw Man dikerumuni oleh warga.", rateDevil: 0.60, level: 20, drop: ["Flyer", "Kamera"], characters: ["Denji", "Chainsaw Devil", "Minami Nakano"] },
    { nama: "Fasilitas Medis Public Safety", desc: "Laboratorium khusus tempat autopsi iblis dan pemulisan hibrida.", rateDevil: 0.25, level: 10, drop: ["Gunting Bedah Otopsi Forensik", "Botol Serum Penenang Mental"], characters: ["Dokter"] },
    { nama: "Pusat Pelatihan Divisi 4", desc: "Ruang olahraga dalam ruangan tempat latihan fisik pemburu iblis.", rateDevil: 0.20, level: 9, drop: ["Sarung Tinju", "Karet Gelang Ikat Paket"], characters: ["Devil Hunter"] },
    { nama: "Atap Bioskop Tokyo", desc: "Tempat Denji dan Makima berdiskusi santai setelah maraton menonton film bersama.", rateDevil: 0.15, level: 19, drop: ["Kursi Bioskop", "Popcorn"], characters: ["Denji", "Makima"] },
    { nama: "Kedai Es Krim Tokyo", desc: "Tempat rekreasi sekilas tempat Power pertama kali mencoba makanan manis manusia.", rateDevil: 0.10, level: 4, drop: ["Cup Es Krim", "Sendok Plastik"], characters: ["Power"] },
    { nama: "Pasar Tradisional Tokyo", desc: "Area keramaian tempat Aki Hayakawa sesekali berbelanja sayur segar untuk menu makan malam.", rateDevil: 0.15, level: 5, drop: ["Sayur", "Kantong Plastik"], characters: ["Aki Hayakawa"] },
    { nama: "Toko Baju Bekas Shinjuku", desc: "Toko murah yang didatangi Denji untuk mencari jaket ganti setelah pakaian lamanya robek.", rateDevil: 0.15, level: 12, drop: ["Jaket Bekas", "Sepatu Lars Militer Bekas"], characters: ["Denji"] },
    { nama: "Ruang Interogasi Public Safety", desc: "Kamar berjeruji besi dengan lampu temaram untuk menginterogasi mata-mata yakuza.", rateDevil: 0.20, level: 10, drop: ["Lampu Meja", "Borgol"], characters: ["Agen Publik"] },
    { nama: "Family Burger", desc: "Restoran cepat saji tempat Kobeni bekerja dan lokasi adegan ikonik burger.", rateDevil: 0.40, level: 8, drop: ["Burger", "Kantong Kertas"], characters: ["Kobeni Higashiyama"] },
    { nama: "Taman Kota Tokyo (Park)", desc: "Taman bermain anak dengan ayunan, tempat Denji merenon setelah kematian Aki.", rateDevil: 0.30, level: 18, drop: ["Bola", "Es Krim"], characters: ["Denji", "Beam", "Quanxi", "Angel Devil"] },
    { nama: "Kamar Rawat Bayi (Nursery Room)", desc: "Fasilitas sekilas yang hancur saat Gun Devil melintasi wilayah Jepang.", rateDevil: 0.75, level: 20, drop: ["Mainan Bayi", "Tabung Gas Oksigen Darurat"], characters: [] },
    { nama: "Gudang Senjata Public Safety", desc: "Ruang penyimpanan pedang khusus milik Aki dan perlengkapan anti-iblis lainnya.", rateDevil: 0.15, level: 11, drop: ["Peluru", "Cairan Pembersih Senjata Api"], characters: ["Aki Hayakawa", "Takeshi"] },
    { nama: "Area Kontainer Pelabuhan", desc: "Latar pelabuhan tempat transaksi ilegal organ iblis oleh para yakuza kelas teri.", rateDevil: 0.45, level: 16, drop: ["Kontainer", "Rantai Besi"], characters: ["Kenzo"] },
    { nama: "Jembatan Penyeberangan Tokyo", desc: "Lokasi sekilas tempat Asa Mitaka berdiri memandang kota sebelum diserang Justice Devil.", rateDevil: 0.35, level: 14, drop: ["Pagar", "Koin"], characters: ["Asa Mitaka"] },
    { nama: "Koridor Gedung Sekolah", desc: "Area loker sepatu tempat Asa Mitaka dijauhi dan dikerjai oleh teman sekelasnya.", rateDevil: 0.25, level: 5, drop: ["Loker", "Buku"], characters: ["Asa Mitaka"] },
    { nama: "Gerbang Utama SMA Fourth East", desc: "Tempat para jurnalis dan pengikut Gereja Chainsaw Man berkumpul untuk demonstrasi.", rateDevil: 0.40, level: 18, drop: ["Spanduk", "Brosur Perekrutan Publik"], characters: ["Fami"] },
    { nama: "Pusat Bowling Tokyo", desc: "Tempat rekreasi sekilas yang dilewati karakter saat suasana kota sedang damai.", rateDevil: 0.15, level: 6, drop: ["Bola Bowling", "Pin"], characters: [] },
    { nama: "Ruang Klub Pemburu Iblis SMA", desc: "Ruang klub sekolah tempat Asa pertama kali didekati oleh anggota OSIS.", rateDevil: 0.30, level: 5, drop: ["Meja Klub", "Buku Catatan"], characters: ["Asa Mitaka"] },
    { nama: "Atap SMA Fourth East", desc: "Lokasi sepi tempat Yoshida sering mengawasi Denji agar identitasnya rahasia.", rateDevil: 0.30, level: 6, drop: ["Pagar Atap", "Teropong"], characters: ["Yoshida", "Denji"] },
    { nama: "Pos Polisi Sektor Tokyo", desc: "Kantor polisi lokal tempat penanganan kasus kriminal biasa sebelum dialihkan ke Public Safety.", rateDevil: 0.20, level: 7, drop: ["Topi Polisi", "Borgol"], characters: ["Polisi"] },
    { nama: "Toko Hewan Peliharaan (Pet Shop)", desc: "Toko tempat Nayuta dan Denji membeli makanan untuk anjing peliharaan mereka.", rateDevil: 0.15, level: 2, drop: ["Makanan Anjing", "Kalung"], characters: ["Denji", "Nayuta"] },
    { nama: "Kantor Detektif Swasta", desc: "Ruang kerja tertutup milik pemburu swasta untuk menerima berkas pesanan warga.", rateDevil: 0.25, level: 10, drop: ["Berkas", "Pulpen"], characters: [] },
    { nama: "Klinik Gelap Pasar Hitam", desc: "Tempat medis ilegal untuk merawat luka hibrida atau memperjualbelikan bagian tubuh iblis.", rateDevil: 0.40, level: 16, drop: ["Jarum Suntik", "Darah Botolan Konvensional"], characters: ["Dokter Gelap"] },
    { nama: "Studio Berita TV Tokyo", desc: "Stasiun penyiaran tempat jurnalis menyebarkan berita kemunculan Chainsaw Man.", rateDevil: 0.30, level: 12, drop: ["Kamera", "Mic"], characters: ["Kenta"] },
    { nama: "Kedai Teh Tradisional (Tea House)", desc: "Tempat tersembunyi para petinggi pemerintah melakukan rapat rahasia.", rateDevil: 0.20, level: 19, drop: ["Teh", "Cangkir"], characters: ["Petinggi"] },
    { nama: "Dimensi Batas Pikiran (Mindscape)", desc: "Ruang bawah sadar dalam mimpi Denji, tempat pintu merah Pochita berada.", rateDevil: 0.50, level: 20, drop: ["Pintu Merah", "Darah Murni Blood Devil"], characters: ["Denji", "Pochita", "Chainsaw Devil", "Blood Devil"] },
    { nama: "Dunia Penuaan (Aging's World)", desc: "Dimensi abstrak surealis milik Aging Devil yang sempat diakses di manga Part 2.", rateDevil: 0.80, level: 20, drop: ["Jam Pasir", "Kaca Retak"], characters: [] },
    { nama: "Rumah Perlindungan Public Safety (Safehouse)", desc: "Rumah rahasia tempat bersembunyi Denji dari kejaran para assassin internasional.", rateDevil: 0.25, level: 17, drop: ["Kasur", "Selimut"], characters: ["Denji"] },
    { nama: "Atap Rumah Sakit Tokyo", desc: "Tempat Kishibe memantau kondisi Aki sekaligus berdiskusi rahasia untuk melawan Makima.", rateDevil: 0.25, level: 18, drop: ["Rokok", "Teropong Bidik Optik Sniper"], characters: ["Kishibe"] },
    { nama: "Lorong Bawah Tanah Penahanan", desc: "Koridor sempit menuju sel penjara khusus tempat para pemburu menaruh jimat pelindung.", rateDevil: 0.70, level: 20, drop: ["Jimat", "Kunci Besi"], characters: ["Tahanan"] },
    { nama: "Kafe Retro Tokyo", desc: "Kafe tempat Denji dan Makima minum kopi dan menangis bersama setelah dari bioskop.", rateDevil: 0.15, level: 19, drop: ["Cangkir", "Gula"], characters: ["Denji", "Makima"] },
    { nama: "Toko Kue Sus (Choux Cream Shop)", desc: "Toko makanan manis tempat Denji membelikan kue sus untuk Asa Mitaka saat mengobrol santai.", rateDevil: 0.10, level: 12, drop: ["Kue Sus", "Kotak Kue"], characters: ["Denji", "Asa Mitaka"] },
    { nama: "Pusat Penyelamatan Publik", desc: "Bunker perlindungan darurat tempat warga berkumpul saat terjadi serangan iblis skala besar.", rateDevil: 0.35, level: 11, drop: ["Selimut", "Air Mineral"], characters: ["Sipil"] },
    { nama: "Halaman Belakang SMA", desc: "Tempat sepi di lingkungan sekolah di mana Yoru pertama kali menguji kekuatan senjatanya.", rateDevil: 0.30, level: 5, drop: ["Batu", "Kayu"], characters: ["Yoru", "Asa Mitaka"] },
    { nama: "Toko Kaset Video", desc: "Toko sekilas tempat Denji melihat-lihat cover film lama sebelum pergi bersama Makima.", rateDevil: 0.10, level: 19, drop: ["Kaset", "DVD"], characters: ["Denji"] },
    { nama: "Atap Gedung Apartemen Tokyo", desc: "Tempat bertarung jangka pendek hibrida lain saat menantang Chainsaw Man.", rateDevil: 0.40, level: 20, drop: ["Genteng", "Batu Bata"], characters: ["Hibrida"] },
    { nama: "Pusat Informasi Kota", desc: "Fasilitas sekilas yang menyediakan peta fisik Tokyo sebelum era smartphone.", rateDevil: 0.15, level: 3, drop: ["Peta Kota", "Brosur"], characters: [] },
    { nama: "Jalan Setapak Sungai", desc: "Area bantaran sungai tempat Asa Mitaka merenungi hidupnya yang penuh kesialan.", rateDevil: 0.20, level: 5, drop: ["Batu Sungai", "Daun"], characters: ["Asa Mitaka"] },
    { nama: "Area Parkir Bawah Tanah", desc: "Tempat persembunyian yakuza kroco dari kejaran divisi Keamanan Publik.", rateDevil: 0.35, level: 13, drop: ["Ban", "Kunci Mobil"], characters: ["Yakuza"] },
    { nama: "Gedung Teater Tua", desc: "Gedung pertunjukan terbengkalai tempat salah satu bawahan iblis menunggu instruksi.", rateDevil: 0.45, level: 16, drop: ["Kursi Teater", "Tirai"], characters: [] },
    { nama: "Stasiun Pengisian Bahan Bakar", desc: "Pom bensin pinggir kota yang dilewati mobil operasional Public Safety saat patroli malam.", rateDevil: 0.20, level: 9, drop: ["Nozzle", "Jerrycan Bensin Penuh"], characters: ["Agen Publik"] },
    { nama: "Toko Elektronik Akihabara", desc: "Toko TV sekilas yang menampilkan siaran langsung amukan Chainsaw Man di jalanan.", rateDevil: 0.15, level: 10, drop: ["Remote TV", "Kabel"], characters: ["Sipil"] }
];

const MAIN_JOB_LIST = [
    { 
        job: "Public Safety Devil Hunter", 
        desc: "Pemburu iblis resmi pemerintah yang bekerja di bawah organisasi keamanan publik. Mereka menerima misi berbahaya, melakukan investigasi serangan iblis, dan bertarung menggunakan pelatihan khusus maupun kontrak dengan iblis. Posisi ini memiliki akses fasilitas negara, tetapi tingkat kematian dan risiko kehilangan anggota sangat ekstrem." 
    },
    { 
        job: "Private Devil Hunter", 
        desc: "Pemburu iblis swasta yang bekerja secara mandiri atau melalui perusahaan kecil untuk mendapatkan bayaran dari klien. Mereka menerima kontrak dari warga, organisasi, atau pihak tertentu yang membutuhkan perlindungan dari ancaman iblis. Kebebasan kerja lebih tinggi, tetapi mereka tidak selalu mendapat bantuan resmi saat menghadapi bahaya." 
    },
    { 
        job: "Devil Hunter High School Student", 
        desc: "Murid sekolah yang bergabung dalam kegiatan pemburu iblis melalui klub atau program khusus. Mereka masih berada dalam pengawasan agen berpengalaman sambil mempelajari dasar pertarungan, strategi bertahan hidup, dan bahaya dunia iblis. Banyak dari mereka terlibat karena rasa penasaran atau ingin membuktikan diri." 
    },
    { 
        job: "Yakuza / Mafia Member", 
        desc: "Anggota organisasi kriminal bawah tanah yang menggunakan kekuatan iblis untuk memperluas pengaruh, menguasai wilayah, atau menjalankan bisnis ilegal. Mereka sering melakukan kontrak tanpa aturan resmi dan tidak peduli dengan konsekuensi selama keuntungan tetap didapatkan." 
    },
    { 
        job: "International Assassin", 
        desc: "Pembunuh bayaran elit yang beroperasi lintas negara dan menerima kontrak tingkat tinggi dari organisasi rahasia. Mereka memiliki kemampuan tempur ekstrem, pengalaman menghadapi target berbahaya, dan sering dikirim untuk memburu individu dengan kekuatan iblis spesial." 
    },
    { 
        job: "Government Agent", 
        desc: "Agen rahasia pemerintah yang menangani operasi tersembunyi berkaitan dengan politik, keamanan nasional, dan kontrak iblis tingkat tinggi. Mereka bekerja di balik layar untuk mengendalikan informasi, mengawasi ancaman besar, dan mengambil keputusan yang tidak diketahui masyarakat umum." 
    },
    { 
        job: "Chainsaw Man Church Leader", 
        desc: "Petinggi organisasi keagamaan yang menggunakan nama Chainsaw Man sebagai simbol kekuasaan dan pengaruh. Mereka memimpin banyak pengikut, menyebarkan propaganda, serta menjalankan agenda tersembunyi yang dapat mengubah keseimbangan antara manusia dan iblis." 
    },
    { 
        job: "Fiend / Hybrid Combatant", 
        desc: "Petarung yang memiliki hubungan langsung dengan iblis, baik melalui tubuh mayat yang dikuasai iblis (Fiend) maupun manusia yang menyatu dengan jantung iblis (Hybrid). Mereka memiliki kemampuan unik dan kekuatan luar biasa, tetapi sering menghadapi konflik antara sisi manusia dan sisi iblis." 
    }
];

const SIDE_JOB_LIST = [
    { 
        job: "Civilian Devil Hunter", 
        desc: "Warga biasa yang mendapatkan izin untuk memburu iblis kelas rendah demi mendapatkan penghasilan tambahan atau melindungi lingkungan sekitar. Mereka biasanya tidak memiliki perlengkapan elit, sehingga harus mengandalkan pengalaman, keberanian, dan strategi sederhana." 
    },
    { 
        job: "Police Officer", 
        desc: "Petugas kepolisian biasa yang menangani kriminalitas umum, mengamankan lokasi kejadian, dan membantu proses evakuasi sebelum pemburu iblis datang. Banyak polisi menjadi saksi pertama dari ancaman iblis yang muncul di masyarakat." 
    },
    { 
        job: "Fast Food Restaurant Server", 
        desc: "Pekerja restoran cepat saji yang menjalani kehidupan normal di tengah dunia penuh ancaman iblis. Mereka sering berada di lokasi ramai yang berpotensi menjadi tempat serangan mendadak dan harus bertahan dalam situasi kacau." 
    },
    { 
        job: "Cafe Barista / Part-Timer", 
        desc: "Pekerja kafe yang terlihat biasa saja, tetapi lingkungan kerjanya sering menjadi tempat bertemu berbagai orang dengan rahasia tersembunyi. Beberapa dapat menjadi sumber informasi, mata-mata, atau bahkan penyamaran bagi pihak berbahaya." 
    },
    { 
        job: "TV News Journalist / Reporter", 
        desc: "Jurnalis yang mencari informasi tentang kejadian iblis untuk disiarkan kepada publik. Mereka sering menghadapi risiko besar ketika mengejar berita eksklusif, terutama saat harus memasuki area yang belum diamankan." 
    },
    { 
        job: "Black Market Organ Dealer", 
        desc: "Pedagang ilegal yang menjalankan bisnis gelap dengan memperjualbelikan bagian tubuh iblis, material langka, atau hasil eksperimen terlarang. Mereka beroperasi jauh dari hukum dan sering berhubungan dengan kelompok kriminal besar." 
    },
    { 
        job: "Debt Collector / Loan Shark", 
        desc: "Penagih hutang yang menggunakan tekanan, ancaman, atau bantuan kelompok kriminal untuk mendapatkan pembayaran. Beberapa menggunakan hubungan dengan iblis atau kontrak ilegal untuk meningkatkan pengaruh mereka." 
    },
    { 
        job: "High School Student (Ordinary)", 
        desc: "Pelajar biasa yang menjalani kehidupan normal tanpa mengetahui konflik besar antara manusia dan iblis. Mereka hanya fokus pada sekolah, pertemanan, dan masalah sehari-hari meskipun dunia di sekitar mereka penuh bahaya." 
    },
    { 
        job: "Private Investigator / Detective", 
        desc: "Detektif swasta yang menangani kasus misterius seperti orang hilang, pencurian, atau kejadian aneh yang terkadang berhubungan dengan aktivitas iblis. Mereka mengandalkan penyelidikan, informasi, dan kemampuan membaca situasi." 
    },
    { 
        job: "High-Ranking Politician / Minister", 
        desc: "Pejabat tinggi yang memiliki pengaruh besar terhadap kebijakan mengenai iblis dan keamanan negara. Mereka dapat mengatur operasi rahasia, menyembunyikan informasi dari masyarakat, atau membuat keputusan yang memengaruhi banyak nyawa." 
    },
    { 
        job: "Underground Medical Doctor", 
        desc: "Dokter ilegal yang bekerja di dunia bawah tanah untuk menangani luka akibat pertarungan, eksperimen, atau serangan iblis. Mereka tidak mengikuti aturan medis resmi dan sering membantu pihak yang tidak bisa mencari pertolongan biasa." 
    },
    { 
        job: "Chainsaw Man Church Devotee", 
        desc: "Pengikut biasa dari kultus Chainsaw Man yang percaya bahwa sosok tersebut adalah simbol keselamatan atau kekuatan baru. Mereka mengikuti ajaran kelompok, menyebarkan keyakinan, dan terkadang terlibat dalam tindakan ekstrem." 
    }
];

const EVENT_LIST = [
  { 
    name: 'Erasure Effect', 
    command: '.csm event erasure', 
    description: 'Pochita muncul dengan kekuatan untuk menghapus sesuatu dari dunia. Story, kontrak, Blood, dan inventory dapat lenyap jika kamu memilih menerima penghapusan. Namun, beberapa entitas menawarkan perlindungan Horsemen, Fiend, atau Hybrid dengan harga tertentu. Pilihanmu akan menentukan apakah kamu kehilangan segalanya atau mempertahankan jejak keberadaanmu.'
  },
  { 
    name: 'Makima Call', 
    command: '.csm event makimacall', 
    description: 'Makima menghubungimu secara langsung dan memberikan perintah khusus dari Public Safety. Terima misi berbahaya untuk memburu target dengan hadiah besar, atau menolak perintah tersebut dengan membayar Blood sebagai bentuk penebusan. Setiap keputusan dapat memengaruhi hubunganmu dengan Makima dan cara dia melihat kemampuanmu.'
  },
  { 
    name: "The Devil's Bargain", 
    command: '.csm event devilsbargain', 
    description: 'Sebuah Devil misterius menawarkan kontrak yang menjanjikan kekuatan besar dalam waktu singkat. Kamu dapat memperoleh keuntungan seperti peningkatan kemampuan, resource tambahan, atau efek khusus, tetapi harga sebenarnya mungkin baru terlihat setelah kontrak berjalan. Pilih dengan hati-hati karena setiap hadiah selalu memiliki bayaran.'
  },
  { 
    name: 'Eyes of Control', 
    command: '.csm event eyesofcontrol', 
    description: 'Tatapan Makima mulai mengikuti perjalananmu. Kamu dapat menunjukkan loyalitas untuk mendapatkan perlindungan, informasi, dan bantuan dari pihaknya. Namun, menerima pengawasan berarti membiarkan kendali perlahan masuk ke dalam hidupmu. Menolak berarti menjaga kebebasan, tetapi membuatmu menjadi lebih mudah dicurigai.'
  },
  { 
    name: 'Blood Frenzy', 
    command: '.csm event bloodfrenzy', 
    description: 'Rasa haus darah mengambil alih tubuhmu dan membuka mode Frenzy. Selama waktu tertentu, Blood Gain meningkat dua kali lipat dan Terror dapat digunakan tanpa cooldown. Namun, kekuatan ini memiliki risiko besar seperti kehilangan HP, efek negatif, dan kemungkinan kehilangan kendali atas dirimu sendiri.'
  },
  { 
    name: 'Doll Contract', 
    command: '.csm event dollcontract', 
    description: 'Doll Devil mengirimkan benang misterius yang mulai mengikat tubuhmu. Kamu dapat menerima kekuatan dari kontrak tersebut atau mencari cara untuk memutus ikatan sebelum semuanya terlambat. Setiap pilihan memiliki konsekuensi, mulai dari perubahan kemampuan hingga ancaman yang terus mengikuti perjalananmu.'
  },
  { 
    name: 'Weaponization', 
    command: '.csm event weaponization', 
    description: 'Sebuah kesempatan muncul untuk mengubah sesuatu yang berharga menjadi senjata khusus. Korbankan Blood, item langka, atau sumber daya penting untuk menciptakan senjata dengan kekuatan unik. Namun, semakin besar kekuatan senjata yang dibuat, semakin besar pula harga yang harus kamu bayarkan.'
  },
  { 
    name: "Hunger's Feast", 
    command: '.csm event hungerfeast', 
    description: 'Fami membuka pesta kelaparan yang memberikan dorongan besar terhadap kemampuanmu. Blood Gain meningkat dan Terror dapat dilakukan lebih sering tanpa batas cooldown. Namun, rasa lapar tersebut harus terus dipenuhi agar efek tetap aktif. Jika gagal mempertahankannya, konsekuensi buruk akan mulai muncul.'
  },
  { 
    name: 'Death Sentence', 
    command: '.csm event deathsentence', 
    description: 'Sebuah keputusan berat muncul ketika kamu menerima vonis kematian yang membawa kekuatan luar biasa. Dengan menerima hukuman tersebut, kamu mendapatkan kemampuan besar dengan risiko kehilangan sesuatu yang penting. Menolak berarti mempertahankan keselamatan sementara, tetapi kesempatan mendapatkan kekuatan itu akan hilang.'
  },
  { 
    name: 'A Child Wish', 
    command: '.csm event childwish', 
    description: 'Seorang anak meminta bantuan sederhana di tengah dunia yang penuh Devil. Membantu memenuhi keinginannya dapat membuka reward, hubungan baru, dan kemungkinan jalan cerita tersembunyi. Namun, mengabaikan permintaannya dapat membawa akibat yang tidak terduga dan mengubah pandangan beberapa karakter terhadapmu.'
  }
];

const COMMAND_SECTIONS = [
  {
    title: '🏠 DASAR',
    commands: [
      ['start', 'Mulai permainan'],
      ['profile', 'Menu utama'],
      ['stats', 'Detail status & buff'],
      ['stats guide', 'Panduan mendapatkan dan memahami buff'],
      ['about', 'Tentang game & statistik'],
      ['nickname <nama>', 'Set nama hunter'],
      ['gender <pria/wanita>', 'Set gender'],
      ['rest', 'Istirahat +40% HP [CD 5 menit]'],
      ['cooldown', 'Lihat status cooldown'],
      ['daily', 'Ambil reward harian Blood'],
      ['quest', 'Lihat 2 quest harian'],
      ['inv', 'Lihat inventory gabungan Weapon + Item'],
      ['picture <nomor>', 'Lihat gambar gallery'],
      ['gallery', 'Lihat semua gambar gallery'],
      ['command', 'Lihat semua command'],
      ['tutorial', 'Panduan pemula']
    ]
  },

  {
    title: '🗺️ EKSPLORASI',
    commands: [
      ['location', 'Lihat daftar lokasi'],
      ['visit <nama/nomor>', 'Kunjungi lokasi'],
      ['explore', 'Explore random [CD 10 menit]'],
      ['mission', 'Terima misi berburu'],
      ['mission fight/run', ''],
      ['rescue', 'Operasi penyelamatan [CD 20m]'],
      ['terror', 'Lihat catatan terror'],
      ['job list', 'Lihat daftar pekerjaan'],
      ['job', 'Lihat riwayat kerja'],
      ['job info', 'Info job yang berjalan'],
      ['job join <nomor/nama>', 'Lamar kerja'],
      ['job leave', 'Resign [CD 1 jam]'],
      ['work', 'Kerja dapat gaji [CD 10 menit]']
    ]
  },

  {
    title: '👥 PARTNER',
    commands: [
      ['partner database', 'Lihat semua karakter'],
      ['partner list', 'Lihat partner kamu'],
      ['partner recruit <nomor/nama>', 'Rekrut'],
      ['partner team', 'Lihat tim aktif'],
      ['partner team add <nomor>', 'Masukkan tim'],
      ['partner team remove <nomor>', 'Cadangkan'],
      ['partner achievement', 'Lihat achievement'],
      ['char <nama>', 'Detail karakter'],
      ['hospital', 'Lihat partner sekarat'],
      ['revive <nomor>', 'Hidupkan partner'],
      ['revive all', 'Pulihkan semua partner']
    ]
  },

  {
    title: '⛓️ KONTRAK',
    commands: [
      ['contract', 'Info kontrak'],
      ['contract host/fiend/hybrid/devil', 'Gacha kontrak'],
      ['contract trial <angka>', 'Sewa Devil 2 hari'],
      ['contract deal <angka>', 'Beli Devil permanen'],
      ['contract list', 'Lihat daftar semua Devil'],
      ['contract list info <angka/nama>', 'Lihat detail Devil'],
      ['contract database', 'Lihat database global'],
      ['contract history <halaman>', 'Lihat riwayat kontrak'],
      ['contract trial yes/no', 'Konfirmasi atau batalkan trial'],
      ['contract deal yes/no', 'Konfirmasi atau batalkan deal']
    ]
  },

  {
    title: '🛒 TOKO',
    commands: [
      ['shop', 'Buka menu toko'],
      ['shop weapon', 'Lihat daftar senjata'],
      ['shop weapon buy <nomor/nama>', 'Beli senjata'],
      ['shop weapon info <nomor/nama>', 'Lihat info senjata'],
      ['shop item', 'Lihat daftar item'],

      ['inv', 'Lihat inventory gabungan Weapon + Item'],
      ['inv use <nomor/nama>', 'Gunakan item consumable'],
      ['inv give <nomor/nama> @user', 'Kirim item ke player lain'],
      ['equip <nomor/nama>', 'Pasang senjata'],
      ['repair <nomor/nama>', 'Perbaiki durability senjata'],
      ['sell <nomor>', 'Jual item dari inventory'],
      ['quest item', 'Setor quest item dengan konfirmasi'],

      ['blood', 'Lihat Blood & saldo Bank'],
      ['blood convert <jumlah>', 'Buat konversi Bank → Blood'],
      ['blood deal', 'Konfirmasi konversi Blood'],
      ['blood cancel', 'Batalkan konversi Blood'],

      ['gift', 'Lihat cara gift'],
      ['gift money/darah @tag <jumlah>', 'Gift ke player'],
      ['gift partner blood/money <nomor> <jumlah>', 'Gift ke partner']
    ]
  },

  {
    title: '📖 STORY',
    commands: [
      ['story', 'Jalankan arc berikutnya'],
      ['story replay <angka>', 'Ulang arc [CD 1 jam]'],
      ['storylist', 'Lihat daftar arc'],
      ['ending <1-10>', 'Pilih ending [Arc 15]'],
    ]
  },

  {
    title: '🎲 EVENT',
    commands: [
      ['event', 'Lihat daftar event aktif'],
      ['event history', 'Lihat riwayat event terpicu'],
      ['event makimacall', 'Info perintah Makima'],
      ['event makimacall terima', 'Terima & lanjut duel'],
      ['event makimacall tolak', 'Tolak -10.000 Darah'],
      ['event devilsbargain', 'Info tawaran kontrak Devil'],
      ['event devilsbargain terima', 'Setujui kontrak Devil'],
      ['event devilsbargain tolak', 'Tolak tawaran Devil'],
      ['event eyesofcontrol', 'Info pengawasan Makima'],
      ['event eyesofcontrol loyal', 'Terima perlindungan Makima'],
      ['event eyesofcontrol tolak', 'Tolak Makima'],
      ['event bloodfrenzy', 'Info mode haus darah'],
      ['event bloodfrenzy ikut', 'Aktifkan mode haus darah'],
      ['event bloodfrenzy tahan', 'Tahan naluri darah'],
      ['event hungerfeast', 'Info Feast Fami'],
      ['event hungerfeast ikut', 'Ikut Feast Fami'],
      ['event hungerfeast tolak', 'Tolak Feast Fami'],
      ['event deathsentence', 'Info Death Sentence'],
      ['event childwish', 'Permintaan anak kecil'],
      ['event weaponization', 'Pengorbanan senjata'],
      ['event dollcontract', 'Kontrak boneka'],
      ['event erasure', 'Info perlindungan'],
      ['event erasure horsemen <1-5 / nama>', 'Perlindungan Horsemen'],
      ['event erasure fiend/hybrid', 'Pilih perlindungan'],
      ['event erasure confirm/cancel', 'Kunci/Pilih ulang'],
      ['event erasure yes/no', 'Terima/Hapus data']
    ]
  },

  {
    title: '⚔️ PVP',
    commands: [
      ['duel @tag <taruhan>', 'Duel antar player'],
      ['view', 'Menu view database'],
      ['view backstory', 'Backstory kamu'],
      ['view title', 'Progress title Hunter'],
      ['view buff', 'Buff didapat dan belum aktif'],
      ['view contract', 'Contract scenes yang sudah terbuka'],
      ['view explore', 'Explore stories yang sudah ditemukan'],
      ['view mission', 'Mission stories yang sudah ditemukan'],
      ['view rescue', 'Rescue stories dan hasil yang ditemukan'],
      ['view reaction', 'Reaksi partner yang pernah muncul'],
      ['view character', 'Database karakter'],
      ['view database', 'Database Devil'],
      ['view terror', 'Catatan terror yang pernah dilalui'],
      ['view work', 'Progress kerja dan job aktif']
    ]
  },

  {
    title: '👹 RAID',
    commands: [
      ['raid', 'Info boss hari ini'],
      ['raid create', 'Buat lobby'],
      ['raid join', 'Gabung lobby'],
      ['raid leave', 'Keluar lobby'],
      ['raid team', 'Lihat anggota lobby'],
      ['raid start', 'Mulai raid [Leader]'],
      ['raid list', 'Lihat boss raid'],
      ['raid delete', 'Bubarkan lobby [Leader]'],
      ['raid history', 'Riwayat raid']
    ]
  }
]

// ============================================================
// === DATABASE BOSS RAID ====================================
  // ============================================================

const BOSS_LIST = [
    { nama: 'Bat Devil', hp: 2000, exp: 500, blood: 2000, emoji: '🦇', story: ['Gedung ini berbau darah.','Bat Devil menggantung di langit-langit.','Dia membuka mulutnya... lebar sekali.','Denji maju tanpa rasa takut. "Pochita, giliran kita."'] },
    { nama: 'Eternity Devil', hp: 10000, exp: 2000, blood: 10000, emoji: '♾️', story: ['Pintu hotel tidak bisa dibuka.','Hari ke 10. Makanan habis.','Ada yang mulai makan temannya.','Denji tersenyum. "Kalau gitu... kita potong hotelnya saja."'] },
    { nama: 'Katana Man', hp: 15000, exp: 3000, blood: 15000, emoji: '🗡️', story: ['Peti mati terbuka.','Darah menyembur dari dalam.','Katana Man berdiri dengan katana di tangannya.','Dia berbisik: "Ini untuk Yakuza."'] },
    { nama: 'Bomb Devil', hp: 18000, exp: 4000, blood: 20000, emoji: '💣', story: ['Senyum itu tampak terlalu tenang untuk medan perang.','Detak jantungmu menyamai suara pemicu yang ditarik.','Ledakan memecah jalan dan menghapus jarak di antara kalian.','Di balik asap, cinta dan kehancuran ternyata memakai wajah yang sama.'] },
    { nama: 'Hell Devil', hp: 30000, exp: 6000, blood: 40000, emoji: '🔥', story: ['Tanah terbelah.','Tangan raksasa dari neraka meraih.','Suhu naik 100 derajat.','Makima berbisik: "Kirim dia pulang."'] },
    { nama: 'Darkness Devil', hp: 120000, exp: 25000, blood: 120000, emoji: '🌑', story: ['Semua lampu mati.','Kau tidak bisa melihat tanganmu sendiri.','Suara bisikan dari segala arah.','Rasa takut merayap ke tulang.'] },
    { nama: 'Gun Devil', hp: 250000, exp: 50000, blood: 250000, emoji: '🔫', story: ['1.2 Juta jiwa hilang dalam 5 menit.','Langit dipenuhi peluru.','Bangunan runtuh seperti kertas.','Ini bukan devil. Ini bencana.'] },
    { nama: 'Control Devil', hp: 200000, exp: 40000, blood: 200000, emoji: '⛓️', story: ['Makima melepas kacamatanya.','Semua orang di sekitarmu berlutut.','Kau merasa ingin nurut.','Kebebasan... apa itu?'] },
    { nama: 'War Devil', hp: 180000, exp: 35000, blood: 180000, emoji: '⚔️', story: ['Yoru mengangkat tangannya ke langit.','Tank jadi palu. Pesawat jadi pedang.','Asa berteriak: "Berhenti!"','Tapi perang sudah dimulai.'] },
    { nama: 'Famine Devil', hp: 220000, exp: 45000, blood: 220000, emoji: '🍖', story: ['Perutmu keroncongan.','Semua makanan di kota menghilang.','Orang-orang mulai memakan diri sendiri.','Kelaparan adalah siksaan terlama.'] },
    { nama: 'Falling Devil', hp: 160000, exp: 30000, blood: 160000, emoji: '🪽', story: ['Lantai menghilang.','Kau jatuh. Terus jatuh.','Tidak ada bawah.','Hanya keputusasaan tanpa akhir.'] },
    { nama: 'Death Devil', hp: 400000, exp: 80000, blood: 400000, emoji: '💀', story: ['Waktu berhenti.','Burung berhenti terbang.','Jantungmu berhenti.','Ini adalah akhir dari semua hal.'] },
    { nama: 'Silence Devil', hp: 140000, exp: 28000, blood: 140000, emoji: '🤫', story: ['Semua suara menghilang.','Kau tidak bisa mendengar teriakan temanmu.','Hanya detak jantungmu sendiri.','Dalam keheningan, kau mati perlahan.'] },
    { nama: 'Mirror Devil', hp: 130000, exp: 26000, blood: 130000, emoji: '🪞', story: ['Semua cermin pecah.','Bayanganmu keluar dari kaca.','Dia tersenyum dengan gigimu.','Lalu dia menusukmu dengan tanganmu sendiri.'] },
    { nama: 'Void Devil', hp: 150000, exp: 32000, blood: 150000, emoji: '🕳️', story: ['Ruang di sekitarmu terdistorsi.','Lenganmu masuk ke dalam kekosongan.','Dan tidak pernah keluar lagi.','Void melahap segalanya. Termasuk ingatan.'] },
    { nama: 'Plague Devil', hp: 145000, exp: 30000, blood: 145000, emoji: '☣️', story: ['Kulitmu melepuh.','Darah hitam keluar dari matamu.','Satu sentuhan dan semua orang terinfeksi.','Ini bukan perang. Ini pemusnahan.'] },
    { nama: 'Nightmare Devil', hp: 135000, exp: 27000, blood: 135000, emoji: '😱', story: ['Kau tertidur.','Tapi kau tidak bisa bangun.','Monster di mimpimu jadi nyata.','Dan dia lapar.'] },
    { nama: 'Gravity Devil', hp: 148000, exp: 31000, blood: 148000, emoji: '🌌', story: ['Tubuhmu remuk.','Tulang patah karena beratnya sendiri.','Langit runtuh ke tanah.','Semua tertarik ke satu titik.'] },
    { nama: 'Regret Devil', hp: 132000, exp: 26500, blood: 132000, emoji: '😭', story: ['Semua kesalahanmu muncul.','Wajah orang yang kau sakiti.','Kau berlutut dan menangis.','Regret menusuk dari belakang.'] },
    { nama: 'Oblivion Devil', hp: 300000, exp: 60000, blood: 300000, emoji: '👁️', story: ['Namamu dilupakan.','Foto-fotomu memudar.','Temanmu tidak ingat siapa kamu.','Oblivion menghapusmu dari dunia.'] },
    { nama: 'Cosmos Devil', hp: 170000, exp: 34000, blood: 170000, emoji: '🌌', story: ['Bintang-bintang jatuh.','Galaksi berputar di matamu.','Otakmu kelebihan informasi.','Cosmos menghancurkan akal.'] },
    { nama: 'Prison Devil', hp: 165000, exp: 33000, blood: 165000, emoji: '🔗', story: ['Jeruji muncul dari tanah.','Kau terkunci selamanya.','Tidak ada jalan keluar.','Hanya keputusasaan di balik besi.'] },
    { nama: 'Witch Devil', hp: 168000, exp: 33500, blood: 168000, emoji: '🧙', story: ['Api ungu menyala.','Mantra terucap dari bibirnya.','Tubuhmu berubah menjadi katak.','Sihir adalah hukum di sini.'] },
    { nama: 'Tyranny Devil', hp: 175000, exp: 35000, blood: 175000, emoji: '👑', story: ['Berlutut.','Itu adalah perintah.','Mahkota berdarah di kepalanya.','Semua harus tunduk.'] },
    { nama: 'Sword Devil', hp: 190000, exp: 38000, blood: 190000, emoji: '⚔️', story: ['1000 pedang melayang.','Satu gerakan dan kau teriris.','Tidak ada yang bisa menghindar.','Ini adalah badai baja.'] },
    { nama: 'Thunder Devil', hp: 185000, exp: 37000, blood: 185000, emoji: '🌩️', story: ['Langit menghitam.','Petir menyambar tanpa henti.','Tubuhmu gosong seketika.','Kemarahan langit turun ke bumi.'] },
    { nama: 'Abyss Devil', hp: 195000, exp: 39000, blood: 195000, emoji: '🌊', story: ['Laut naik ke langit.','Tsunami setinggi gedung.','Kau tenggelam dalam kegelapan.','Tidak ada dasar di sini.'] },
    { nama: 'Love Devil', hp: 182000, exp: 36400, blood: 182000, emoji: '💘', story: ['Dia tersenyum padamu.','Jantungmu berhenti.','Cinta adalah racun paling manis.','Dan kau mati karena itu.'] },
    { nama: 'Bomb Devil', hp: 240000, exp: 48000, blood: 240000, emoji: '💣', story: ['Detik terus berdetak.','3... 2... 1...','Kota ini akan lenyap.','Selamat tinggal.'] },
    { nama: 'Chainsaw Devil', hp: 280000, exp: 56000, blood: 280000, emoji: '⛓️', story: ['Suara chainsaw meraung.','Darah menyembur ke langit.','Pochita tertawa.','Ayo berburu iblis.'] },
    { nama: 'Conquest Devil', hp: 210000, exp: 42000, blood: 210000, emoji: '🏇', story: ['Kuda putih berlari.','Bendera ditancapkan di tanah.','Semua wilayah ditaklukkan.','Tidak ada yang tersisa.'] },
    { nama: 'Pestilence Devil', hp: 215000, exp: 43000, blood: 215000, emoji: '🦠', story: ['Wabah menyebar.','Kulitmu membusuk.','Satu batuk dan semua mati.','Ini akhir dari umat manusia.'] },
    { nama: 'Time Devil', hp: 260000, exp: 52000, blood: 260000, emoji: '⏰', story: ['Waktu berhenti.','Hanya dia yang bisa bergerak.','Kau menua dalam sedetik.','Lalu menjadi debu.'] },
    { nama: 'Infinity Devil', hp: 320000, exp: 64000, blood: 320000, emoji: '♾️', story: ['Tidak ada awal.','Tidak ada akhir.','Kau terjebak dalam lingkaran.','Selamanya.'] },
    { nama: 'God Devil', hp: 500000, exp: 100000, blood: 500000, emoji: '👑', story: ['Dia turun dari langit.','Sayapnya menutupi matahari.','Berlututlah di hadapan Tuhan.','Atau musnah.'] },
    { nama: 'Chaos Devil', hp: 450000, exp: 90000, blood: 450000, emoji: '🌀', story: ['Realita hancur.','Hukum fisika tidak berlaku.','Kau dan aku bertukar tempat.','Ini adalah kekacauan.'] },
    { nama: 'Void King', hp: 420000, exp: 84000, blood: 420000, emoji: '🕳️', story: ['Raja dari kekosongan.','Dia melahap dunia.','Tidak ada cahaya.','Hanya kehampaan.'] },
    { nama: 'Apocalypse Devil', hp: 600000, exp: 120000, blood: 600000, emoji: '☢️', story: ['4 kuda kuda muncul.','Langit terbakar.','Ini adalah kiamat.','Lari selagi bisa.'] },
    { nama: 'End Devil', hp: 750000, exp: 150000, blood: 750000, emoji: '🔚', story: ['Ini adalah akhir.','Dari cerita.','Dari dunia.','Dari segalanya.'] }
  ]
    
const ACHIEVEMENT_LIST = [
  // === SET TIM / FAKSI UTAMA ===
  { id: 'divisi_4', nama: 'Tokyo Special Squad', desc: 'Rekrut Aki, Power, Himeno, dan Kobeni', emoji: '🦊', reward: { blood: 50000, exp: 300 }, setBonus: { dmg: 30, def: 20 }, check: (csm) => ['Aki Hayakawa', 'Power', 'Himeno', 'Kobeni Higashiyama'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'four_horsemen', nama: 'Apocalyptic Sisters', desc: 'Rekrut Makima, Fami, Yoru, dan Nayuta', emoji: '⛓️', reward: { blood: 200000, exp: 1000 }, setBonus: { critChance: 20, instantKill: 3 }, check: (csm) => ['Makima', 'Fami', 'Yoru', 'Nayuta'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'quanxi_team', nama: 'Harem Of The Crossbow', desc: 'Rekrut Quanxi, Pingtsi, Cosmo, Long, dan Tsugihagi', emoji: '🏹', reward: { blood: 150000, exp: 800 }, setBonus: { dmg: 50, evasion: 15 }, check: (csm) => ['Quanxi', 'Pingtsi', 'Cosmo', 'Long', 'Tsugihagi'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'chainsaw_family', nama: 'Hayakawa Household Dynamics', desc: 'Rekrut Denji, Pochita, Power, dan Aki', emoji: '🐕', reward: { blood: 100000, exp: 500 }, setBonus: { autoTransform: true, regen: 20 }, check: (csm) => ['Denji', 'Pochita', 'Power', 'Aki Hayakawa'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'government', nama: 'Imperial Bureaucracy', desc: 'Rekrut Kentaro, Shin, Tadashi, Hadaji, dan Yuki', emoji: '👔', reward: { blood: 120000, exp: 600 }, setBonus: { bloodMult: 0.3, discount: 0.2 }, check: (csm) => ['Kentaro Ishita', 'Shin Toma', 'Tadashi Hasegawa', 'Hadaji Sakagami', 'Yuki Tomoda'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'church', nama: 'Chainsaw Man Zealots', desc: 'Rekrut Fami, Barem, Miri, Whip Hybrid, dan Spear Hybrid', emoji: '⛪', reward: { blood: 130000, exp: 700 }, setBonus: { bloodMult: 0.2, stealBlood: 50 }, check: (csm) => ['Fami', 'Barem Bridge', 'Miri Sugo', 'Whip Hybrid', 'Spear Hybrid'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'usa_assassins', nama: 'Three American Brothers', desc: 'Rekrut Aldo, Joey, dan Kuro', emoji: '🇺🇸', reward: { blood: 60000, exp: 300 }, setBonus: { gunDmg: 35 }, check: (csm) => ['Aldo', 'Joey', 'Kuro'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'kyoto_detachment', nama: 'Kyoto Reinforcement Line', desc: 'Rekrut Yutaro, Michiko, dan Subaru', emoji: '⛩️', reward: { blood: 65000, exp: 320 }, setBonus: { speed: 15, expBoost: 10 }, check: (csm) => ['Yutaro Kurose', 'Michiko Tendo', 'Subaru'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'miyagi_shields', nama: 'Shinjuku Iron Defense', desc: 'Rekrut Kusakabe dan Tamaoki', emoji: '🛡️', reward: { blood: 40000, exp: 200 }, setBonus: { def: 25 }, check: (csm) => ['Kusakabe', 'Tamaoki'].every(n => csm.partners.find(p => p.name === n)) },

  // === COMBINASI HUBUNGAN REKAYASA / LORE ===
  { id: 'denji_reze', nama: 'The Star Crossed Lovers', desc: 'Rekrut Denji dan Reze', emoji: '💣', reward: { blood: 40000, exp: 200 }, setBonus: { dmg: 40 }, check: (csm) => ['Denji', 'Reze'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'denji_makima', nama: 'Leash Of The Control Devil', desc: 'Rekrut Denji dan Makima', emoji: '⛓️', reward: { blood: 50000, exp: 250 }, setBonus: { instantKill: 2 }, check: (csm) => ['Denji', 'Makima'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'denji_asa_yoru', nama: 'The Melancholic Triad', desc: 'Rekrut Denji, Asa Mitaka, dan Yoru', emoji: '⚔️', reward: { blood: 80000, exp: 400 }, setBonus: { dmg: 50, critChance: 10 }, check: (csm) => ['Denji', 'Asa Mitaka', 'Yoru'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'denji_beam', nama: 'Lord Chainsaw Devotee', desc: 'Rekrut Denji dan Beam', emoji: '🦈', reward: { blood: 30000, exp: 150 }, setBonus: { teamHp: 20 }, check: (csm) => ['Denji', 'Beam'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'denji_himeno', nama: 'The Indirect Cigarette Kiss', desc: 'Rekrut Denji dan Himeno', emoji: '👻', reward: { blood: 35000, exp: 180 }, setBonus: { evasion: 15 }, check: (csm) => ['Denji', 'Himeno'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'aki_himeno', nama: 'The Requiem For Revenge', desc: 'Rekrut Aki dan Himeno', emoji: '🚬', reward: { blood: 35000, exp: 180 }, setBonus: { critChance: 15 }, check: (csm) => ['Aki Hayakawa', 'Himeno'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'asa_yoru', nama: 'The Shared Internal Trauma', desc: 'Rekrut Asa Mitaka dan Yoru', emoji: '⚔️', reward: { blood: 45000, exp: 220 }, setBonus: { dmg: 35 }, check: (csm) => ['Asa Mitaka', 'Yoru'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'power_meowy', nama: 'The Blood Feind Humanity', desc: 'Rekrut Power dan Meowy', emoji: '🩸', reward: { blood: 20000, exp: 100 }, setBonus: { regen: 15 }, check: (csm) => ['Power', 'Meowy'].every(n => csm.partners.find(p => p.name === n)) },

  // === FOURTH EAST HIGH RELATIONS ===
  { id: 'asa_yuko', nama: 'The Outcast Alliance', desc: 'Rekrut Asa Mitaka dan Yuko', emoji: '💀', reward: { blood: 40000, exp: 200 }, setBonus: { dmg: 20, speed: 10 }, check: (csm) => ['Asa Mitaka', 'Yuko'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'fourth_east_club', nama: 'The Highschool Vanguard', desc: 'Rekrut Haruka, Nobana, Seigi, dan Asami', emoji: '📚', reward: { blood: 80000, exp: 400 }, setBonus: { expBoost: 15, int: 20 }, check: (csm) => ['Haruka Iseumi', 'Nobana Higashiyama', 'Seigi Akoku', 'Asami'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'tanaka_justice', nama: 'The Forbidden Classroom Pact', desc: 'Rekrut Mr. Tanaka dan Asa Mitaka', emoji: '👓', reward: { blood: 35000, exp: 180 }, setBonus: { critChance: 10 }, check: (csm) => ['Mr. Tanaka', 'Asa Mitaka'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'jiro_janitor_squad', nama: 'School Facility Maintenance', desc: 'Rekrut Jiro dengan Haruka Iseumi', emoji: '🧹', reward: { blood: 25000, exp: 120 }, setBonus: { findItem: 15 }, check: (csm) => ['Jiro', 'Haruka Iseumi'].every(n => csm.partners.find(p => p.name === n)) },

  // === PUBLIC SAFETY SUPPORT LINE ===
  { id: 'public_safety_veterans', nama: 'The Cynical Masterminds', desc: 'Rekrut Kishibe dan Madoka', emoji: '📋', reward: { blood: 50000, exp: 250 }, setBonus: { missionReward: 20 }, check: (csm) => ['Kishibe', 'Madoka'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'public_safety_division_2', nama: 'The Frontline Human Bulwark', desc: 'Rekrut Nomo, Kato, Tanabe, Furuno, Masaki Ando, dan Nakamura', emoji: '👮', reward: { blood: 110000, exp: 550 }, setBonus: { teamHp: 40 }, check: (csm) => ['Nomo', 'Kato', 'Tanabe', 'Furuno', 'Masaki Ando', 'Nakamura'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'public_safety_division_7', nama: 'The Specialized Escort Escadrille', desc: 'Rekrut Fumiko Mifune, Nail Fiend, dan Takagi', emoji: '🥷', reward: { blood: 70000, exp: 350 }, setBonus: { def: 20, pierce: 15 }, check: (csm) => ['Fumiko Mifune', 'Nail Fiend', 'Takagi'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'public_safety_logistics', nama: 'The Strategic Rear Guard', desc: 'Rekrut Hiroshi, Sakura, dan Takeshi', emoji: '🏥', reward: { blood: 60000, exp: 300 }, setBonus: { healBoost: 20, weaponDur: 20 }, check: (csm) => ['Hiroshi', 'Sakura', 'Takeshi'].every(n => csm.partners.find(p => p.name === n)) },
  // === CRIME & UNDERWORLD RELATION ===
  { id: 'yakuza_bloodline', nama: 'The Syndicates Debt Legacy', desc: 'Rekrut Katana Man\'s Grandfather, Katana Man / Samurai Sword, dan Kenzo', emoji: '👴', reward: { blood: 90000, exp: 450 }, setBonus: { goldMult: 30, dmg: 20 }, check: (csm) => ['Katana Man\'s Grandfather', 'Katana Man / Samurai Sword', 'Kenzo'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'gun_devil_conspiracy', nama: 'The Gunrunners Vengeance Pact', desc: 'Rekrut Akane Sawatari dan Katana Man / Samurai Sword', emoji: '🐍', reward: { blood: 50000, exp: 250 }, setBonus: { critDmg: 25 }, check: (csm) => ['Akane Sawatari', 'Katana Man / Samurai Sword'].every(n => csm.partners.find(p => p.name === n)) },

  // === INTERNATIONAL ASSASSINS RELATIONS ===
  { id: 'germany_soviet_dolls', nama: 'The Sovereign Puppeteer Master', desc: 'Rekrut Santa Claus, Tolka, dan Reze', emoji: '🎎', reward: { blood: 100000, exp: 500 }, setBonus: { summonBuff: 20, aoeDmg: 15 }, check: (csm) => ['Santa Claus', 'Tolka', 'Reze'].every(n => csm.partners.find(p => p.name === n)) },

  // === CIVILIAN SOCIETY ===
  { id: 'tokyo_urban_citizens', nama: 'The Civilian Daily Transit', desc: 'Rekrut Minami Nakano, Rina, Kenta, dan Old Man Sato', emoji: '🍞', reward: { blood: 60000, exp: 300 }, setBonus: { discount: 15, infoGain: 10 }, check: (csm) => ['Minami Nakano', 'Rina', 'Kenta', 'Old Man Sato'].every(n => csm.partners.find(p => p.name === n)) },

  // === TRUE DEVILS & ANOMALIES ===
  { id: 'divisi_4_pure_monsters', nama: 'The Supernatural Enforcers', desc: 'Rekrut Angel Devil dan Princi', emoji: '😇', reward: { blood: 70000, exp: 350 }, setBonus: { regen: 10, teleportChance: 15 }, check: (csm) => ['Angel Devil', 'Princi'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'the_tragic_snowball', nama: 'The Fatal Blizzard Illusion', desc: 'Rekrut Gun Fiend dan Aki Hayakawa', emoji: '⛄', reward: { blood: 80000, exp: 400 }, setBonus: { aoePierce: 30 }, check: (csm) => ['Gun Fiend', 'Aki Hayakawa'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'true_primal_awakening', nama: 'The Primordial Bloodbath', desc: 'Rekrut Chainsaw Devil dan Blood Devil', emoji: '🩸', reward: { blood: 250000, exp: 1200 }, setBonus: { atk: 80, rawDmg: 50 }, check: (csm) => ['Chainsaw Devil', 'Blood Devil'].every(n => csm.partners.find(p => p.name === n)) },
  { id: 'fushi_arai_division_4', nama: 'The Unsung Frontline Vanguard', desc: 'Rekrut Fushi dan Hirokazu Arai', emoji: '🗡️', reward: { blood: 40000, exp: 200 }, setBonus: { bleed: 15, accuracy: 10 }, check: (csm) => ['Fushi', 'Hirokazu Arai'].every(n => csm.partners.find(p => p.name === n)) },
  // === ACHIEVEMENT UMUM AKUMULATIF ===
  { id: 'full_team_5', nama: 'The Active Tactical Combatants', desc: 'Bawa 5 partner sekaligus ke dalam tim aktif', emoji: '👥', reward: { blood: 50000, exp: 250 }, setBonus: { teamHp: 25 }, check: (csm) => csm.partners.filter(p => p.status === 'active').length >= 5 },
  { id: 'collector_20', nama: 'The Rising Devil Hunter Syndicate', desc: 'Rekrut 20 karakter', emoji: '📚', reward: { blood: 100000, exp: 500 }, setBonus: {}, check: (csm) => csm.partners.length >= 20 },
  { id: 'collector_50', nama: 'The High Commission Master Archeology', desc: 'Rekrut 50 karakter', emoji: '📖', reward: { blood: 300000, exp: 1500 }, setBonus: {}, check: (csm) => csm.partners.length >= 50 },
  { id: 'collector_all_75', nama: 'The Hero Of Hell Absolute Omnipotence', desc: 'Rekrut seluruh 75 karakter tanpa terkecuali', emoji: '👑', reward: { blood: 1000000, exp: 5000 }, setBonus: { allStats: 50 }, check: (csm) => csm.partners.length >= 75 },
  { id: 'all_endings', nama: 'The Complete Cycle', desc: 'Kumpulkan seluruh ending selain Secret', emoji: '🔐', reward: { blood: 250000, exp: 1500 }, setBonus: {}, check: csm => (csm.endingReward || []).length >= 9 },
  { id: 'final_arc_boss', nama: 'The Last Arc Survivor', desc: 'Kalahkan boss dari arc terakhir', emoji: '🪚', reward: { blood: 150000, exp: 900 }, setBonus: { dmg: 20 }, check: csm => Number(csm.story || 1) > 14 },
  { id: 'boss_hunter_10', nama: 'Raid Initiate', desc: 'Kalahkan 10 boss raid', emoji: '👹', reward: { blood: 50000, exp: 300 }, setBonus: {}, check: csm => Number(csm.bossesDefeated || 0) >= 10 },
  { id: 'boss_hunter_50', nama: 'Raid Veteran', desc: 'Kalahkan 50 boss raid', emoji: '⚔️', reward: { blood: 180000, exp: 1000 }, setBonus: { def: 20 }, check: csm => Number(csm.bossesDefeated || 0) >= 50 },
  { id: 'devil_catalog_50', nama: 'Fifty Names In Blood', desc: 'Catat 50 Devil berbeda', emoji: '📚', reward: { blood: 100000, exp: 600 }, setBonus: {}, check: csm => new Set(csm.contractHistory || []).size >= 50 },
  { id: 'weapon_collector', nama: 'Arsenal Keeper', desc: 'Miliki 20 weapon berbeda', emoji: '🧰', reward: { blood: 80000, exp: 450 }, setBonus: { weaponDur: 15 }, check: csm => (csm.inventory || []).filter(item => item.nama !== 'Fist').length >= 20 },
  { id: 'blood_hoarder', nama: 'Blood Reserve', desc: 'Simpan 100.000 Blood sekaligus', emoji: '🩸', reward: { blood: 30000, exp: 200 }, setBonus: { bloodFlat: 500 }, check: csm => Number(csm.blood || 0) >= 100000 },
  { id: 'story_replayer', nama: 'Echoes Of The Arc', desc: 'Replay story sebanyak 10 kali', emoji: '📖', reward: { blood: 60000, exp: 350 }, setBonus: {}, check: csm => Number(csm.storyReplayCount || 0) >= 10 },
  { id: 'event_survivor', nama: 'Horsemen Witness', desc: 'Selesaikan 10 event penting', emoji: '🎲', reward: { blood: 90000, exp: 500 }, setBonus: { luck: 10 }, check: csm => Number(csm.eventCount || 0) >= 10 },
  { id: 'hospital_rescue', nama: 'No Partner Left Behind', desc: 'Revive 5 partner dari hospital', emoji: '🏥', reward: { blood: 70000, exp: 400 }, setBonus: { teamHp: 15 }, check: csm => Number(csm.partnerReviveCount || 0) >= 5 },
  { id: 'daily_hunter', nama: 'Thirty Days Standing', desc: 'Capai Daily Streak 30 hari', emoji: '📅', reward: { blood: 100000, exp: 600 }, setBonus: { expMult: 0.1 }, check: csm => Number(csm.dailyStreak || 0) >= 30 },
  { id: 'zero_contract', nama: 'Bare Hands Survivor', desc: 'Menang dengan Fist sebagai senjata aktif', emoji: '👊', reward: { blood: 40000, exp: 250 }, setBonus: { dmg: 10 }, check: csm => csm.weapon?.nama === 'Fist' && Number(csm.devilsKilled || 0) >= 1 }
];

function checkAchievements(csm) {
  if (!csm || !Array.isArray(csm.partners)) return [];
  if (!Array.isArray(csm.achievements)) csm.achievements = [];

  const newAchievements = [];
  for (const achievement of ACHIEVEMENT_LIST) {
    if (csm.achievements.includes(achievement.id)) continue;
    if (typeof achievement.check !== 'function' || !achievement.check(csm)) continue;

    csm.achievements.push(achievement.id);
    newAchievements.push(achievement);
  }

  return newAchievements;
}


// === BAGIAN 1 DARI 5: TIER REPRO/E SAMPAI D (ITEM 1 - 30 | VALUE DISKON 40%) ===
const ITEM_LIST = [
  { nama: "Cigarette (Rokok Easy Revenge)", jenis: "Consumable", tier: "E", jual: 300, emoji: "🚬", user: "Aki / Himeno", material: "Tembakau nikotin", desc: "Rokok peninggalan Himeno. Dipakai di zona aman untuk memulihkan stamina/sanitas kecil." },
  { nama: "Uang Koin 100 Yen", jenis: "Loot", tier: "E", jual: 600, emoji: "🪙", user: "Semua Orang", material: "Tembaga biasa", desc: "Uang koin recehan yang sering tertinggal di mesin minuman otomatis jalanan Tokyo." },
  { nama: "Korek Api Gas (Lighter)", jenis: "Utility", tier: "E", jual: 1200, emoji: "🔥", user: "Devil Hunter", material: "Plastik mika", desc: "Korek api saku biasa untuk membakar sumsum sumbu bom molotov atau menyalakan rokok." },
  { nama: "Brosur Perekrutan Publik", jenis: "Loot", tier: "E", jual: 2100, emoji: "📄", user: "Sipil", material: "Kertas cetak", desc: "Selebaran kertas berisi lowongan kerja Keamanan Publik yang berserakan di jalanan kota." },
  { nama: "Koran Berita Tragedi", jenis: "Loot", tier: "E", jual: 3000, emoji: "📰", user: "Sipil", material: "Kertas koran", desc: "Koran harian lama yang memuat info korban serangan iblis. Dijual ke pengepul barang bekas." },
  { nama: "Klip Kertas Besi", jenis: "Material", tier: "E", jual: 3600, emoji: "📎", user: "Sipil", material: "Kawat besi tipis", desc: "Klip kertas kantoran biasa yang tercecer di meja administrasi yang hancur. Loot pelengkap daur ulang." },
  { nama: "Perban Medis Gulung", jenis: "Consumable", tier: "E", jual: 4800, emoji: "🩹", user: "Semua Orang", material: "Kain kasa steril", desc: "Pertolongan pertama untuk menghentikan efek debuff Bleeding (pendarahan ringan) saat penjelajahan." },
  { nama: "Sedotan Plastik Bekas", jenis: "Material", tier: "E", jual: 6000, emoji: "🥤", user: "Yoru", material: "Plastik daur ulang", desc: "Sedotan plastik utuh yang tercecer di lantai restoran. Bahan mentah crafting pisau darurat Yoru." },
  { nama: "Saputangan Kain Kishibe", jenis: "Utility", tier: "E", jual: 7200, emoji: "🧻", user: "Kishibe", material: "Kain katun", desc: "Dipakai menyeka sisa darah agar aroma keberadaan karakter tidak diendus iblis tipe pelacak." },
  { nama: "Botol Kaca Kosong", jenis: "Material", tier: "E", jual: 9000, emoji: "🍾", user: "Sipil", material: "Kaca tebal", desc: "Botol bekas minuman keras di gang sempit. Bahan baku utama untuk merakit bom molotov." },
  { nama: "Darah Botolan Konvensional", jenis: "Consumable", tier: "D", jual: 10800, emoji: "🧪", user: "Fiend / Hybrid", material: "Darah manusia biasa", desc: "Darah manusia dalam tabung laboratorium. Memulihkan sedikit HP khusus ras Fiend atau Hybrid." },
  { nama: "Tali Rafia Gulung", jenis: "Material", tier: "D", jual: 12000, emoji: "🪢", user: "Sipil", material: "Plastik serat", desc: "Gulungan tali plastik biasa yang ditemukan di gudang toko kelontong runtuh. Untuk pengikat darurat." },
  { nama: "Senter Saku Taktis", jenis: "Utility", tier: "D", jual: 13200, emoji: "🔦", user: "Devil Hunter", material: "Aluminium & baterai", desc: "Alat penerang untuk mengeksplorasi area lorong hotel gelap atau ruang bawah tanah berkabut." },
  { nama: "Permen Karet Penenang", jenis: "Consumable", tier: "D", jual: 15000, emoji: "🍬", user: "Aldo / Pembunuh", material: "Gula & perisa", desc: "Dikunyah selama misi untuk menghalau efek debuff halusinasi/panik dari iblis tingkat bawah." },
  { nama: "Gunting Medis Publik", jenis: "Utility", tier: "D", jual: 19200, emoji: "✂️", user: "Tim Medis", material: "Baja medis tajam", desc: "Gunting steril untuk memotong perban dengan cepat atau memotong pakaian korban luka." },
  { nama: "Karet Gelang Ikat Paket", jenis: "Material", tier: "D", jual: 21000, emoji: "🫓", user: "Sipil", material: "Karet mentah elastis", desc: "Sekantong karet gelang elastis pelengkap komponen pegas mekanik darurat tingkat rendah." },
  { nama: "Sikat Sepatu Taktis", jenis: "Loot", tier: "D", jual: 22800, emoji: "🪥", user: "Aki Hayakawa", material: "Gagang plastik bulu", desc: "Alat pembersih sepatu dinas agar selalu rapi. Bisa dijual kembali ke vendor markas Publik." },
  { nama: "Korek Api Zippo Kosong", jenis: "Loot", tier: "D", jual: 24000, emoji: "🔥", user: "Pembunuh Bayaran", material: "Kuningan krom besi", desc: "Korek besi tahan angin klasik milik agen gelap. Kehilangan minyak, berharga sebagai barang loat bernilai jual." },
  { nama: "Kantong Darah Donor Publik", jenis: "Consumable", tier: "D", jual: 27000, emoji: "🩸", user: "Devil Hunter", material: "Darah steril tipe O", desc: "Kantong darah dari ambulans Keamanan Publik. Pemulih HP instan saat terdesak bertarung." },
  { nama: "Buku Catatan Asa Mitaka", jenis: "Material", tier: "D", jual: 30000, emoji: "📒", user: "Yoru / Asa", material: "Kertas & sampul tebal", desc: "Buku tulis sekolah yang tertinggal di kelas. Bahan dasar untuk diubah Yoru menjadi Notebook Blade." },
  { nama: "Sabun Batang Hotel", jenis: "Material", tier: "D", jual: 33000, emoji: "🧼", user: "Yoru", material: "Lemak sabun padat", desc: "Sabun mandi batangan utuh dari toilet hotel. Bahan baku pembuatan Soap Knife milik Yoru." },
  { nama: "Panci Dapur Bekas", jenis: "Loot", tier: "D", jual: 36000, emoji: "🍳", user: "Sipil", material: "Aluminium cetak", desc: "Panci rumah tangga yang tertinggal di apartemen kosong hancur. Masuk kategori loot rongsokan." },
  { nama: "Jas Hujan Plastik", jenis: "Utility", tier: "D", jual: 39000, emoji: "🧥", user: "Devil Hunter", material: "Plastik tipis air", desc: "Dipakai saat patroli cuaca hujan agar baju dinas tidak basah dan pergerakan tetap lincah." },
  { nama: "Kunci Fiat Kobeni", jenis: "Quest Item", tier: "D", jual: 45000, emoji: "🔑", user: "Kobeni / Denji", material: "Kunci besi mobil", desc: "Kunci mobil Fiat milik Kobeni. Digunakan untuk membuka opsi evakuasi kendaraan di peta kota." },
  { nama: "Pensil Grafit Sekolah", jenis: "Material", tier: "D", jual: 48000, emoji: "✏️", user: "Yoru", material: "Kayu & grafit", desc: "Alat tulis kelas yang tertinggal di meja. Bahan baku transmutasi instan untuk membuat Pencil Dagger." },
  { nama: "Lencana Perunggu Agen Lapangan", jenis: "Collectible", tier: "D", jual: 288000, emoji: "🥉", user: "Agen Publik Pemula", material: "Perunggu campuran tembaga baja", desc: "Lencana penanda lulus ujian standard rekrutan operasional penjelajah zona wilayah kota." },
  { nama: "Peta Denah Bunker", jenis: "Quest Item", tier: "D", jual: 840000, emoji: "🗺️", user: "Sipil Pemerintah", material: "Kertas kartografi koordinat rahasia", desc: "Peta penunjuk shelter pelarian bawah tanah dari bencana agresi monster, membuka sub-quest." },
  { nama: "Pensil Grafit Alat Tulis Kelas", jenis: "Material", tier: "D", jual: 630000, emoji: "✏️", user: "Yoru (War Devil)", material: "Kayu lunak pengikat grafit arang karbon murni", desc: "Alat tulis kelas yang ditinggalkan, komponen pemicu pembuatan transmutasi Pencil Dagger." },
  { nama: "Buku Catatan Pelajaran Sekolah Asa", jenis: "Material", tier: "D", jual: 690000, emoji: "📒", user: "Asa Mitaka / Yoru", material: "Kertas berserat sampul karton tebal sekolah", desc: "Buku tulis sisa reruntuhan kelas sekolah, bahan dasar transmutasi bilah Notebook Blade." },
  { nama: "Buku Catatan Pelajaran", jenis: "Material", tier: "D", jual: 690000, emoji: "📒", user: "Asa Mitaka / Yoru", material: "Kertas bersampul karton tebal sekolah", desc: "Buku tulis sisa reruntuhan kelas sekolah, bahan dasar transmutasi bilah Notebook Blade." },
// === BAGIAN 2 DARI 5: TIER C SAMPAI TIER B ATAS (ITEM 31 - 60 | VALUE DISKON 40%) ===
  { nama: "Sabun Mandi Batangan Wangi Toilet", jenis: "Material", tier: "C", jual: 750000, emoji: "🧼", user: "Yoru (War Devil)", material: "Senyawa lemak sabun gliserin", desc: "Sabun batangan sisa kamar mandi hotel, bahan pemicu transmutasi pembuatan Soap Knife." },
  { nama: "Klakson Terompet Bekas", jenis: "Loot", tier: "C", jual: 54000, emoji: "📯", user: "Berandalan Kota", material: "Plastik dan kuningan", desc: "Mainan terompet berisik pembuat polusi suara di sudut jalanan Tokyo. Komponen koleksi sampah." },
  { nama: "Jerrycan Bensin Penuh", jenis: "Material", tier: "C", jual: 60000, emoji: "🛢️", user: "Semua Orang", material: "Cairan bahan bakar", desc: "Jeriken bensin untuk mengisi bahan bakar mobil evakuasi atau merakit molotov skala besar." },
  { nama: "Botol Alkohol Medis 70%", jenis: "Consumable", tier: "C", jual: 72000, emoji: "🧴", user: "Tim Medis Lapangan", material: "Cairan antiseptik etanol", desc: "Digunakan membersihkan sisa infeksi kuman pada luka pertempuran terbuka guna mencegah debuff demam." },
  { nama: "Baterai Kotak 9 Volt", jenis: "Material", tier: "C", jual: 81000, emoji: "🔋", user: "Sipil", material: "Seng karbon alkalin", desc: "Sumber daya listrik portabel untuk menghidupkan HT komunikasi atau rakitan kejutan listrik darurat." },
  { nama: "Radio HT Komunikasi", jenis: "Utility", tier: "C", jual: 90000, emoji: "📻", user: "Devil Hunter Publik", material: "Plastik & frekuensi", desc: "Alat komunikasi radio Keamanan Publik untuk memanggil bantuan tim medis ke lokasi koordinat." },
  { nama: "Kain Kasa Gulung Besar", jenis: "Consumable", tier: "C", jual: 102000, emoji: "🧻", user: "Tim Medis", material: "Serat katun steril", desc: "Pasokan medis tebal pelapis luka pasca operasi darurat di kendaraan evakuasi medan tempur." },
  { nama: "Kapsul Minyak Ikan", jenis: "Consumable", tier: "C", jual: 117000, emoji: "💊", user: "Sipil", material: "Suplemen omega tiga", desc: "Vitamin saku penambah fokus visual pengamatan di zona berkabut tebal. Memberikan buff stat akurasi." },
  { nama: "Kepingan Emas Gigi Yakuza", jenis: "Loot", tier: "C", jual: 132000, emoji: "🦷", user: "Pembunuh Swasta", material: "Emas murni padat", desc: "Gigi emas berharga hasil looting dari mayat komplotan yakuza yang tewas di gang sempit." },
  { nama: "Alat Perekam Pita Kaset", jenis: "Loot", tier: "C", jual: 144000, emoji: "📼", user: "Jurnalis Berita", material: "Plastik pita magnetik", desc: "Perekam suara jurnalis investigasi yang gugur. Menjual kaset ini ke instansi memberi reward info map." },
  { nama: "Public Safety Badge", jenis: "Collectible", tier: "C", jual: 150000, emoji: "🪪", user: "Devil Hunter", material: "Kuningan reinforced", desc: "Lencana resmi agen Publik. Akses membuka pembatas map terlarang dan diskon merchant." },
  { nama: "Topi Dinas Pemburu Publik", jenis: "Loot", tier: "C", jual: 159000, emoji: "🧢", user: "Devil Hunter", material: "Serat kain nilon hitam", desc: "Aksesori pelengkap seragam yang tertinggal di area markas lama, bernilai estetika bagi kolektor seragam." },
  { nama: "Dompet Kulit Kosong Korban", jenis: "Loot", tier: "C", jual: 168000, emoji: "🧳", user: "Sipil", material: "Kulit sintetis cokelat", desc: "Dompet warga sipil yang terjebak reruntuhan bangunan, berharga murni untuk ditukarkan ke mata uang." },
  { nama: "Telepon Genggam Rusak (HP)", jenis: "Material", tier: "C", jual: 180000, emoji: "📱", user: "Yoru", material: "Komponen elektronik", desc: "Handphone hancur di jalanan pasca teror. Bahan baku craft pembuatan Cell Clear Sword." },
  { nama: "Kacamata Hitam Agen Taktis", jenis: "Loot", tier: "C", jual: 192000, emoji: "🕶️", user: "Pengawal Privat", material: "Kaca hitam polikarbonat", desc: "Pelindung mata dari silau kilatan ledakan bom, murni aksesori kosmetik berharga jual menengah." },
  { nama: "Suntikan Adrenalin Medis", jenis: "Consumable", tier: "B", jual: 210000, emoji: "💉", user: "Devil Hunter Publik", material: "Zat kimia stimulan", desc: "Suntikan stimulan militer. Memberikan buff peningkatan kecepatan gerak (Speed) secara drastis." },
  { nama: "Cairan Pembersih Senjata Api", jenis: "Utility", tier: "B", jual: 228000, emoji: "🧴", user: "Sniper Keamanan", material: "Minyak sintetis korosi", desc: "Cairan pelumas khusus laras senapan guna menjaga indikator senjata tipe api tetap prima." },
  { nama: "Rompi Anti-Peluru Rusak", jenis: "Material", tier: "B", jual: 252000, emoji: "🦺", user: "Devil Hunter", material: "Serat kevlar baja", desc: "Rompi anti-peluru sisa pertempuran Divisi 4. Bahan craft untuk memperkuat stat defense armor." },
  { nama: "Sepatu Lars Militer Bekas", jenis: "Loot", tier: "B", jual: 276000, emoji: "🥾", user: "Pasukan Infanteri", material: "Kulit reinforced sol karet", desc: "Perlengkapan gerak infanteri militer yang tertinggal di kamp pengungsian, berharga jual tinggi." },
  { nama: "Panci Masak Aluminium Apartemen", jenis: "Loot", tier: "B", jual: 828000, emoji: "🍳", user: "Warga Korban Evakuasi", material: "Aluminium cetak tebal peralatan masak rumah", desc: "Peralatan dapur apartemen runtuh sisa agresi iblis, murni loat penambah dompet uang game." },
  { nama: "Jas Hujan Lapangan Dinas Tebal", jenis: "Utility", tier: "B", jual: 930000, emoji: "🧥", user: "Devil Hunter Lapangan", material: "Plastik karet vinil tebal tahan air rembesan", desc: "Mantel pelindung cuaca buruk pemburu iblis agar stamina tidak drop diterjang hujan asam." },
  { nama: "Jerrycan Bahan Bakar Bensin Penuh", jenis: "Material", tier: "B", jual: 1470000, emoji: "🛢️", user: "Regu Evakuasi Publik", material: "Cairan bahan bakar oktan tinggi dalam jeriken", desc: "Pasokan bensin cadangan dalam jeriken besi, bahan perakit molotov peledak bakar area." },
  { nama: "Botol Kaca Minuman Keras Kosong", jenis: "Material", tier: "B", jual: 660000, emoji: "🍾", user: "Sipil Berandalan", material: "Kaca tebal silika wadah minuman keras gang", desc: "Botol kosong dari gang kumuh reruntuhan bar, wadah utama perakitan molotov taktis." },
  { nama: "Kunci Kontak MobilFiat Operasional", jenis: "Quest Item", tier: "B", jual: 780000, emoji: "🔑", user: "Kobeni Higashiyama", material: "Kunci besi gerigi mobil karburator tua", desc: "Kunci cadangan mobil Fiat Kobeni yang legendaris, pemicu event lari dari map berkendara." },
  { nama: "Peta Rute Gorong Tokyo Lama", jenis: "Quest Item", tier: "B", jual: 1050000, emoji: "🗺️", user: "Sipil Jalur Bawah", material: "Kertas cetak peta tata ruang bawah tanah", desc: "Denah rahasia gorong-gorong drainase kota, membuka opsi bypass jalan pintas lewati bos kecil." },
  { nama: "Botol Alkohol Medis Steril 95%", jenis: "Consumable", tier: "B", jual: 870000, emoji: "🧴", user: "Dokter Bedah Publik", material: "Cairan antiseptik etanol pekat", desc: "Pembersih kuman luka bakar tingkat lanjut, menangkal mutlak status debuff demam infeksi." },
  { nama: "Kain Kasa Steril Gulung Lapangan", jenis: "Consumable", tier: "B", jual: 810000, emoji: "🧻", user: "Regu Medis Evakuasi", material: "Serat katun steril rajutan anyaman", desc: "Pembalut luka robek pendarahan masif di lapangan pertolongan pertama penjelajahan map." },
  { nama: "Kapsul Suplemen Vitamin", jenis: "Consumable", tier: "B", jual: 900000, emoji: "💊", user: "Agen Intelijen Penyelidik", material: "Suplemen omega tiga konsentrasi ekstrak", desc: "Suplemen peningkat fokus visual durasi panjang, memberikan permanent buff akurasi map." },
  { nama: "Kabel Tembaga Gardu Induk Utama", jenis: "Material", tier: "B", jual: 1290000, emoji: "🔌", user: "Yoru (War Devil)", material: "Tembaga reinforced murni berlapis isolator", desc: "Kabel tebal gardu listrik kota, komponen craft weapon bertipe listrik petir sekunder." },
  { nama: "Roda Gigi Mesin Industri Pabrik", jenis: "Material", tier: "B", jual: 1410000, emoji: "⚙️", user: "Montir Sektor Pabrik", material: "Baja industrial campuran karbon kepadatan tinggi", desc: "Komponen mesin besar pabrik yang hancur, material penguat tingkat batas durability senjata." },
// === BAGIAN 3 DARI 5: TIER B ATAS SAMPAI TIER A (ITEM 61 - 90 | VALUE DISKON 40%) ===
  { nama: "Jam Tangan Mewah Korban", jenis: "Loot", tier: "B", jual: 300000, emoji: "⌚", user: "Semua Orang", material: "Emas & kaca kristal", desc: "Jam tangan merk mahal yang tertinggal di reruntuhan hotel Eternity. Nilai jual tinggi ke vendor." },
  { nama: "Senter Kepala Industri Heavy", jenis: "Utility", tier: "B", jual: 330000, emoji: "🪖", user: "Pekerja Tambang", material: "Baja ringan polimer", desc: "Senter helm berkekuatan sorot tinggi jarak jauh untuk menembus kabut ilusi pekat musuh." },
  { nama: "Bulu Rambut Leech Devil", jenis: "Material", tier: "B", jual: 360000, emoji: "🪺", user: "Kolektor Pasar Gelap", material: "Bulu organik iblis", desc: "Drop-rate material dari Leech Devil. Digunakan sebagai bahan mentah crafting baju pelindung ringan pemburu." },
  { nama: "Kotak Perkakas Mekanik Besi", jenis: "Material", tier: "B", jual: 384000, emoji: "🧰", user: "Montir Kendaraan", material: "Pelat besi cetak tebal baja", desc: "Satu set kunci inggris dan obeng baja industrial untuk memperbaiki kendaraan operasional." },
  { nama: "Lendir Asam Bat Devil", jenis: "Material", tier: "B", jual: 420000, emoji: "🧪", user: "Tim Forensik", material: "Zat kimia korosif", desc: "Cairan asam murni hasil drop Bat Devil. Berguna sebagai bahan upgrade senjata untuk menambah efek pasif Armor Piercing." },
  { nama: "Gunting Bedah Otopsi Forensik", jenis: "Loot", tier: "B", jual: 432000, emoji: "✂️", user: "Tim Forensik", material: "Baja reinforced", desc: "Perangkat khusus laboratorium otopsi iblis. Bisa dijual mahal ke pasar gelap barang medis." },
  { nama: "Helm Taktis Kevlar Publik", jenis: "Loot", tier: "B", jual: 468000, emoji: "🪖", user: "Pasukan Penyerbu", material: "Kevlar komposit militer", desc: "Pelindung kepala standard regu penembak Keamanan Publik yang terjatuh di koridor gedung pertempuran." },
  { nama: "Patahan Gigi Roda Pintu Brankas", jenis: "Material", tier: "B", jual: 492000, emoji: "⚙️", user: "Yoru", material: "Baja cor berat", desc: "Fragmen roda gigi dari gerbang brankas yakuza yang hancur, material pengeras armor tameng." },
  { nama: "Tas Medis Lapangan Penuh", jenis: "Consumable", tier: "B", jual: 510000, emoji: "🎒", user: "Devil Hunter Publik", material: "Paket obat-obatan", desc: "Tas berisi obat gawat darurat lengkap. Sepenuhnya memulihkan HP dan menghapus debuff luka." },
  { nama: "Kantong Mayat Higienis Medis", jenis: "Loot", tier: "B", jual: 540000, emoji: "💼", user: "Forensik Instansi", material: "Karet vinil polimer", desc: "Kantong khusus pembungkus sampel potongan tubuh iblis besar agar aman dari kontaminasi sipil." },
  { nama: "Peta Navigasi Bawah Underground", jenis: "Quest Item", tier: "B", jual: 570000, emoji: "🗺️", user: "Semua Orang", material: "Kertas denah lama", desc: "Peta rute gorong-gorong kota Tokyo. Membuka jalan rahasia untuk berpindah map tanpa ketahuan musuh." },
  { nama: "Kabel Tembaga Gardu Listrik", jenis: "Material", tier: "B", jual: 630000, emoji: "🔌", user: "Yoru", material: "Tembaga reinforced", desc: "Potongan kabel gardu induk jalanan Tokyo, material penghantar listrik pasif senjata rakitan." },
  { nama: "Radio HT Enkripsi Sandi", jenis: "Utility", tier: "A", jual: 1350000, emoji: "📻", user: "Agen Intelijen Makima", material: "Komponen nirkabel sandi frekuensi militer", desc: "Radio pemicu kontak tim evakuasi udara darurat untuk membuka status area escape map khusus." },
  { nama: "Kawat Keamanan Serat Intan", jenis: "Material", tier: "A", jual: 1650000, emoji: "🧵", user: "Agen Pembunuh Swasta", material: "Serat baja jalinan intan komposit", desc: "Kawat tipis tarikan tinggi untuk modifikasi upgrade damage dasar kelompok weapon cambuk pecut." },
  { nama: "Koper Taktis Kedap Aroma", jenis: "Utility", tier: "A", jual: 1680000, emoji: "💼", user: "Agen Pembunuh Internasional", material: "Serat vinil tebal berlapis isolator", desc: "Koper penyimpan item drop-rate iblis agar aroma darah tidak memancing spawn gelombang musuh." },
  { nama: "Kotak Detonator Ranjau Peledak", jenis: "Utility", tier: "A", jual: 1770000, emoji: "🎛️", user: "Komplotan Pembunuh Bom", material: "Komponen sirkuit kabel pemicu ledakan", desc: "Alat pemicu ranjau peledak jarak jauh, membersihkan gerombolan kroco musuh dalam satu tombol." },
  { nama: "Kotak Pemicu Bom Detonator", jenis: "Utility", tier: "A", jual: 1860000, emoji: "🎛️", user: "Pembunuh Bayaran Swasta", material: "Komponen sirkuit nirkabel", desc: "Detonator nirkabel taktis untuk meledakkan ranjau bom atau jebakan area (AoE) di lorong map." },
  { nama: "Pecahan Tameng Baja Kevlar", jenis: "Material", tier: "A", jual: 1980000, emoji: "🛡️", user: "Pasukan Khusus Negara", material: "Serat aramid balistik tebal", desc: "Sisa tameng pelindung berat barisan infanteri militer, material utama crafting armor tingkat tinggi." },
  { nama: "Serpihan Kuku Taktis Kutukan", jenis: "Material", tier: "A", jual: 2040000, emoji: "💅", user: "Pengguna Kontrak Sampingan", material: "Lapisan kuku tumbal ritual terkeraskan", desc: "Drop-rate sisa ritual pemanggilan kutukan paku, pelengkap craft aksesoris critical tambahan." },
  { nama: "Satu Box Amunisi Inti Tungsten", jenis: "Consumable", tier: "A", jual: 2100000, emoji: "📦", user: "Regu Sniper Taktis", material: "Mesiu militer inti baja", desc: "Peti peluru khusus senapan sniper jarak jauh pemicu stat efek Armor Piercing mutlak." },
  { nama: "Teropong Bidik Optik Sniper", jenis: "Utility", tier: "A", jual: 2160000, emoji: "🔍", user: "Sniper Divisi Publik", material: "Lensa kristal kaca polimer", desc: "Optik bidik jarak jauh pemburu iblis, meningkatkan stat critical rate serangan jarak jauh." },
  { nama: "Tabung Gas Oksigen Darurat", jenis: "Consumable", tier: "A", jual: 2280000, emoji: "🟤", user: "Tim Medis Lapangan", material: "Baja silinder kompresi", desc: "Tabung oksigen portabel untuk memulihkan indikator stamina gerak penuh di area hampa udara." },
  { nama: "Pecahan Kaca Ruang Isolasi", jenis: "Collectible", tier: "A", jual: 2520000, emoji: "🔮", user: "Korban Hotel Eternity", material: "Kristal padat dimensi anomali terdistorsi", desc: "Serpihan kaca terinfeksi distorsi ruang waktu hotel Eternity, komoditas tukar pasar gelap." },
  { nama: "Rompi Taktis Kevlar Pelindung", jenis: "Material", tier: "A", jual: 2760000, emoji: "🦺", user: "Pasukan Keamanan Publik", material: "Serat aramid anyaman baja pelat ringan", desc: "Pelindung dada sisa pertempuran taktis pertahanan divisi, bahan penguat defense armor utama." },
  { nama: "Helm Komposit Taktis Publik", jenis: "Loot", tier: "A", jual: 2940000, emoji: "🪖", user: "Regu Penembak Publik", material: "Kevlar komposit baja balistik ringan", desc: "Pelindung kepala penembak jitu yang tertinggal di atap gedung misi, item tukar koin mahal." },
  { nama: "Serpihan Kuku Taktis", jenis: "Material", tier: "A", jual: 2040000, emoji: "💅", user: "Pengguna Kontrak Sampingan", material: "Lapisan kuku tumbal ritual terkeraskan gaib", desc: "Drop-rate sisa ritual pemanggilan kutukan paku, pelengkap craft aksesoris critical tambahan." },
  { nama: "Kawat Baja Karbon Penjerat", jenis: "Material", tier: "A", jual: 1650000, emoji: "🧵", user: "Agen Pembunuh Swasta", material: "Serat baja jalinan intan komposit mikro", desc: "Kawat tipis tarikan tinggi untuk modifikasi upgrade damage dasar kelompok weapon cambuk pecut." },
  { nama: "Satu Box Amunisi Inti", jenis: "Consumable", tier: "A", jual: 2100000, emoji: "📦", user: "Regu Sniper Taktis", material: "Mesiu kompresi militer inti baja tungsten berat", desc: "Peti peluru khusus senapan sniper jarak jauh pemicu stat efek Armor Piercing mutlak." },
  { nama: "Botol Serum Penenang Mental", jenis: "Consumable", tier: "A", jual: 1140000, emoji: "🧪", user: "Tim Medis Markas Pusat", material: "Cairan formula obat penenang saraf", desc: "Obat cair penakluk kegilaan ilusi, memulihkan 100% indikator status stamina dan mental bar." },
  { nama: "Rompi Taktis Kevlar Anti", jenis: "Material", tier: "A", jual: 2760000, emoji: "🦺", user: "Pasukan Keamanan Publik", material: "Serat aramid anyaman baja pelat ringan", desc: "Pelindung dada sisa pertempuran taktis pertahanan divisi, bahan penguat defense armor utama." },
// === BAGIAN 4 DARI 5: KELANJUTAN TIER A SAMPAI TIER S (ITEM 91 - 120 | VALUE DISKON 40%) ===
  { nama: "Helm Komposit Taktis", jenis: "Loot", tier: "A", jual: 2940000, emoji: "🪖", user: "Regu Penembak Publik", material: "Kevlar komposit baja balistik ringan militer", desc: "Pelindung kepala penembak jitu yang tertinggal di atap gedung misi, item tukar koin mahal." },
  { nama: "Kabel Tembaga Gardu Induk", jenis: "Material", tier: "A", jual: 1290000, emoji: "🔌", user: "Yoru (War Devil)", material: "Tembaga reinforced murni berlapis isolator tebal", desc: "Kabel tebal gardu listrik kota, komponen craft weapon bertipe listrik petir sekunder." },
  { nama: "Roda Gigi Mesin Industri", jenis: "Material", tier: "A", jual: 1410000, emoji: "⚙️", user: "Montir Sektor Pabrik", material: "Baja industrial campuran karbon kepadatan tinggi", desc: "Komponen mesin besar pabrik yang hancur, material penguat tingkat batas durability senjata." },
  { nama: "Korek Api Zippo Besi", jenis: "Loot", tier: "A", jual: 1950000, emoji: "🔥", user: "Agen Eksekutor Privat", material: "Kuningan lapis krom ukiran grafir taktis", desc: "Pemantik api branded antik milik mafia yakuza yang tewas, barang loat bernilai jual tinggi." },
  { nama: "Kepingan Emas Murni Gigi", jenis: "Loot", tier: "A", jual: 3150000, emoji: "🦷", user: "Yakuza Elite Komplotan", material: "Logam emas murni padat karat tinggi gigi", desc: "Gigi emas berharga sisa mayat elite yakuza di gang belakang, bernilai jual sangat tinggi." },
  { nama: "Alat Perekam Suara Jurnalis", jenis: "Loot", tier: "A", jual: 2880000, emoji: "📼", user: "Reporter Investigasi", material: "Plastik komponen pita magnetik mikro jadul", desc: "Tape recorder sisa wartawan perang, ditukarkan ke markas untuk membuka tab rahasia lore." },
  { nama: "Sepatu Lars Taktis Militer", jenis: "Loot", tier: "A", jual: 3480000, emoji: "🥾", user: "Pasukan Khusus PBB", material: "Kulit reinforced sol baja anti-slip", desc: "Sepatu lars militer sisa kargo logistik pertahanan, bernilai ekonomi masif di toko loat." },
  { nama: "Helm Taktis Anti-Peluru Baja", jenis: "Loot", tier: "A", jual: 3720000, emoji: "🪖", user: "Pasukan Keamanan Publik", material: "Kevlar komposit serat karbon pelindung", desc: "Pelindung kepala gres sisa drop kotak logistik pertahanan kota, loat berharga tinggi." },
  { nama: "Dompet Kulit Buaya Mewah", jenis: "Loot", tier: "A", jual: 3900000, emoji: "🧳", user: "Warga Kelas Atas", material: "Kulit buaya asli lapis jahit tangan", desc: "Dompet korban hotel Eternity asal kalangan pengusaha, sumber penambah saldo instan merchant." },
  { nama: "Selongsong Amunisi Meriam Berat", jenis: "Loot", tier: "A", jual: 3240000, emoji: "🫙", user: "Artileri Pertahanan", material: "Kuningan padat tempaan cetak artileri", desc: "Sisa selongsong peluru meriam besar pangkalan militer yang ditinggalkan regu pertahanan." },
  { nama: "Selongsong Amunisi Meriam", jenis: "Loot", tier: "A", jual: 3240000, emoji: "🫙", user: "Artileri Pertahanan", material: "Kuningan padat tempaan cetak artileri", desc: "Sisa selongsong peluru meriam besar pangkalan militer yang ditinggalkan regu pertahanan." },
  { nama: "Kunci Kontak Mobil Operasional", jenis: "Quest Item", tier: "A", jual: 780000, emoji: "🔑", user: "Kobeni Higashiyama", material: "Kunci besi gerigi mobil karburator", desc: "Kunci cadangan mobil Fiat Kobeni yang legendaris, pemicu event lari dari map berkendara." },
  { nama: "Peta Rute Gorong Bawah Tanah", jenis: "Quest Item", tier: "A", jual: 1050000, emoji: "🗺️", user: "Sipil Jalur Bawah", material: "Kertas cetak peta tata ruang bawah tanah", desc: "Denah rahasia gorong-gorong drainase kota, membuka opsi bypass jalan pintas lewati bos kecil." },
  { nama: "Botol Alkohol Steril Medis", jenis: "Consumable", tier: "A", jual: 870000, emoji: "🧴", user: "Dokter Bedah Publik", material: "Cairan antiseptik etanol pekat", desc: "Pembersih kuman luka bakar tingkat lanjut, menangkal mutlak status debuff demam infeksi." },
  { nama: "Kain Kasa Steril Evakuasi", jenis: "Consumable", tier: "A", jual: 810000, emoji: "🧻", user: "Regu Medis Evakuasi", material: "Serat katun steril rajutan anyaman", desc: "Pembalut luka robek pendarahan masif di lapangan pertolongan pertama penjelajahan map." },
  { nama: "Kapsul Suplemen Vitamin Kon", jenis: "Consumable", tier: "A", jual: 900000, emoji: "💊", user: "Agen Intelijen Penyelidik", material: "Suplemen omega tiga konsentrasi ekstrak", desc: "Suplemen peningkat fokus visual durasi panjang, memberikan permanent buff akurasi map." },
  { nama: "Patahan Gigi Pintu Brankas", jenis: "Material", tier: "A", jual: 2370000, emoji: "⚙️", user: "Komplotan Pembobol Bank", material: "Baja cor berat komposit anti-bor", desc: "Gigi mekanis baja tebal sisa reruntuhan brankas bank, bahan upgrade kekuatan tameng." },
  { nama: "Kantong Mayat Higienis Steril", jenis: "Loot", tier: "A", jual: 960000, emoji: "💼", user: "Forensik Keamanan Publik", material: "Karet vinil polimer tebal kedap udara", desc: "Kantong isolasi sampel potongan tubuh iblis murni, penambah saldo instan dari merchant medis." },
  { nama: "Tabung Pemadam Api Gedung", jenis: "Utility", tier: "A", jual: 1380000, emoji: "🧯", user: "Petugas Pemadam Kota", material: "Tabung baja gas tekan bubuk kimia", desc: "Alat penakluk jebakan api, memadamkan rintangan kobaran api pembakar di permukaan map." },
  { nama: "Gas Masker Filter Ganda", jenis: "Utility", tier: "A", jual: 2850000, emoji: "🎭", user: "Regu Penyerbu Reaktor", material: "Karet silikon filter aramid karbon", desc: "Topeng pernapasan khusus anti-debuff gas beracun parah sisa agresi serangan monster." },
  { nama: "Klakson Terompet Berandalan", jenis: "Loot", tier: "A", jual: 720000, emoji: "📯", user: "Geng Motor Jalanan", material: "Plastik cetak komposit kuningan", desc: "Mainan klakson modifikasi sisa tawuran jalanan kota Tokyo, loat sampah pengisi kas uang." },
  { nama: "Botol Serum Imunisasi", jenis: "Consumable", tier: "A", jual: 990000, emoji: "💉", user: "Gudang Medis Pusat", material: "Cairan serum penolak kontaminasi sel", desc: "Suntikan anti-infeksi gaib pemberi imunitas status kekebalan debuff Poisoning selama 5 menit." },
  { nama: "Pin Granat Reze Bawaan", jenis: "Collectible", tier: "S", jual: 2400000, emoji: "🧷", user: "Reze", material: "Besi pemicu hulu ledak", desc: "Cincin penarik pin granat leher milik Reze yang tertinggal di lokasi festival. Koleksi bernilai tinggi." },
  { nama: "Kabel Serat Karbon Jerat", jenis: "Material", tier: "S", jual: 2520000, emoji: "🪢", user: "Agen Infiltrasi Asing", material: "Serat karbon komposit tajam", desc: "Kawat tipis tarikan tinggi modifikasi senyap, komponen crafting weapon bertipe jerat cambuk." },
  { nama: "Gigi Pemantik Mekanis Barem", jenis: "Collectible", tier: "S", jual: 2700000, emoji: "🦷", user: "Barem Bridge", material: "Gigi katup pemantik", desc: "Gigi palsu mekanis pemicu api organik tubuh yang terjatuh pasca pertarungan. Sangat dicari pasar gelap." },
  { nama: "Anak Panah Sisa Quanxi", jenis: "Collectible", tier: "S", jual: 3000000, emoji: "🎯", user: "Quanxi", material: "Kayu serat gaib", desc: "Anak panah dari wujud crossbow Quanxi yang tertinggal di reruntuhan bangunan. Memiliki sisa kekuatan magis." },
  { nama: "Peti Suplai Amunisi Berat", jenis: "Consumable", tier: "S", jual: 3120000, emoji: "📦", user: "Regu Sniper Anti-Material", material: "Kotak mesiu kompresi tungsten", desc: "Satu wadah amunisi makro militer penembus tameng armor, memberikan buff damage weapon bertipe api." },
  { nama: "Botol Serum Antitoksin Iblis", jenis: "Consumable", tier: "S", jual: 3300000, emoji: "🧪", user: "Laboratorium Pusat Publik", material: "Formula antitoksin modifikasi", desc: "Serum penetral racun instan tingkat tinggi untuk menghapus status fatal debuff Poisoning parah." },
  { nama: "Pecahan Kaca Hotel Eternity", jenis: "Collectible", tier: "S", jual: 3480000, emoji: "🔮", user: "Semua Orang", material: "Kristal dimensi terdistorsi", desc: "Serpihan kaca dari jendela kamar hotel yang terjebak anomali waktu terisolasi, bernilai sangat tinggi." },
  { nama: "Lembar Analisis Kelemahan Boss", jenis: "Utility", tier: "S", jual: 3720000, emoji: "📄", user: "Intelijen Divisi 4", material: "Kertas laporan taktis lapangan", desc: "Berkas rekaman taktis kelemahan monster tertentu, pemicu peningkatan permanent damage ke boss bersangkutan." },
// === BAGIAN 5 DARI 5: TIER S SAMPAI TIER SSS DEWA (ITEM 121 - 150 | VALUE DISKON 40%) ===
  { nama: "Buku Panduan Eksplorasi", jenis: "Utility", tier: "S", jual: 5280000, emoji: "📕", user: "Devil Hunter Veteran", material: "Kertas kulit tebal tulisan kuno transkrip", desc: "Catatan taktis rute navigasi dimensi bawah, mengurangi damage status efek penjelajahan neraka." },
  { nama: "Bulu Sayap Suci Jatuh", jenis: "Material", tier: "S", jual: 3900000, emoji: "🪶", user: "Angel Devil", material: "Serat bulu supernatural", desc: "Sehelai bulu sayap malaikat yang gugur di medan perang. Bahan craft jubah legendaris anti-sihir kutukan." },
  { nama: "Serum Regenerasi Sel Iblis", jenis: "Consumable", tier: "S", jual: 4320000, emoji: "🧪", user: "Laboratorium Otopsi Elit", material: "Biokimia extraction jaringan aktif", desc: "Serum cair pengaktif pemulihan sel cepat, mengembalikan HP 80% secara berkala meskipun sedang dikepung." },
  { nama: "Bilah Katana Patah Katana Man", jenis: "Material", tier: "S", jual: 15000000, emoji: "⚔️", user: "Katana Man", material: "Baja terkutuk yakuza legendaris", desc: "Patahan bilah pedang legendaris dari lengan Katana Man pasca duel maut. Komponen crafting armor/senjata tier menengah-atas." },
  { nama: "Rantai Pengikat Sel Sisa", jenis: "Material", tier: "SS", jual: 4500000, emoji: "⛓️", user: "Makima", material: "Baja reinforced neraka", desc: "Patahan rantai besi tak terlihat yang dipakai menjerat musuh Publik. Material upgrade armor dewa." },
  { nama: "Patahan Busur Besi Quanxi", jenis: "Material", tier: "SS", jual: 4680000, emoji: "🏹", user: "Quanxi", material: "Campuran logam kuno neraka", desc: "Fragmen busur panah internal tangan Quanxi yang hancur tertebas, material utama upgrade weapon tipe busur." },
  { nama: "Botol Esensi Jiwa Doll", jenis: "Material", tier: "SS", jual: 4740000, emoji: "🧪", user: "Doll Devil (Santa)", material: "Esensi pengikat kesadaran boneka", desc: "Cairan sisa proses transformation boneka Santa Claus, material upgrade stat defense armor dewa." },
  { nama: "Kepingan Hulu Ledak Reze", jenis: "Material", tier: "SS", jual: 4920000, emoji: "🧫", user: "Reze", material: "Mesiu misil kimia blok timur", desc: "Sisa bubuk peledak misil padat pasca transformasi ledakan bom Reze, bahan craft peledak sekunder masif." },
  { nama: "Cairan Asam Lambung Leech", jenis: "Material", tier: "SS", jual: 5100000, emoji: "🧪", user: "Tim Forensik Elit", material: "Zat korosif organik konsentrasi tinggi", desc: "Cairan asam pekat drop sangat langka Leech Devil, bahan upgrade weapon peluluh defense tameng boss." },
  { nama: "Buku Panduan Navigasi Neraka", jenis: "Utility", tier: "SS", jual: 5280000, emoji: "📕", user: "Devil Hunter Veteran", material: "Kertas kulit tebal tulisan kuno", desc: "Catatan taktis rute navigasi dimensi bawah, mengurangi damage status efek penjelajahan neraka." },
  { nama: "Darah Murni Blood Devil", jenis: "Consumable", tier: "SS", jual: 5400000, emoji: "🩸", user: "Power (Wujud Asli)", material: "Darah murni penguasa", desc: "Botol berisi ekstrak darah murni dari wujud asli Blood Devil. Memulihkan 100% HP dan memberikan buff ATK masif." },
  { nama: "Bulu Sayap Suci (Sempurna)", jenis: "Material", tier: "SS", jual: 5700000, emoji: "🪶", user: "Angel Devil", material: "Serat sayap bercahaya utuh", desc: "Bulu sayap malaikat yang gugur tanpa cacat, bahan mutlak perakit jubah pelindung tier dewa." },
  { nama: "Gun Devil's Flesh Fragment", jenis: "Material", tier: "SSS", jual: 6000000, emoji: "🔮", user: "Public Safety / Makima", material: "Daging sisa Gun Devil", desc: "Potongan kecil daging aktif Gun Devil. Bergerak mencari bagian utama. Bahan craft tier tertinggi di game. Lebih superior daripada segala jenis Katana biasa." },
  { nama: "Fiend Blood Contract", jenis: "Gacha Ticket", tier: "SSS", jual: 6900000, emoji: "🧾", user: "Devil Hunter Publik", material: "Dokumen darah rahasia", desc: "Berkas perjanjian suci dengan instansi untuk memanggil/gacha karakter rekan berjenis Fiend (Manusia Iblis) secara acak." },
  { nama: "Tiket Kontrak Neraka (Hell Pass)", jenis: "Gacha Ticket", tier: "SSS", jual: 7200000, emoji: "🎫", user: "Devil Hunter Elit", material: "Media transit dimensi", desc: "Item legendaris untuk membuka portal menuju dimensi Neraka (Hell Map) guna memburu iblis boss tingkat tinggi." },
  { nama: "Fiend Blood Contract (Platinum)", jenis: "Gacha Ticket", tier: "SSS", jual: 7500000, emoji: "🧾", user: "Divisi Keamanan Elit", material: "Dokumen darah segel lapis platinum", desc: "Berkas pemanggilan instansi kelas eksklusif jaminan gacha karakter Fiend bintang tinggi." },
  { nama: "Devil Pact Scroll", jenis: "Gacha Ticket", tier: "SSS", jual: 8100000, emoji: "📜", user: "Devil Hunter Publik", material: "Gulungan segel neraka", desc: "Gulungan bersegel khusus untuk memicu ritual pemanggilan/gacha Iblis murni tingkat tinggi (Devil) untuk dijadikan partner tempur." },
  { nama: "Devil Pact Scroll (Mythic)", jenis: "Gacha Ticket", tier: "SSS", jual: 8400000, emoji: "📜", user: "Divisi Keamanan Elit", material: "Gulungan neraka tinta darah murni kuno", desc: "Gulungan pemanggilan gaib kelas tinggi untuk jaminan kontrak gacha partner Devil tipe mitologi." },
  { nama: "Lencana Emas Istimewa Publik", jenis: "Collectible", tier: "SSS", jual: 9000000, emoji: "🥇", user: "Kishibe / Captain", material: "Emas murni reinforced", desc: "Penghargaan lencana tertinggi divisi Keamanan Publik. Menandakan status pemburu iblis terkuat dalam sejarah." },
  { nama: "Dokumen Rahasia Negara (Top Secret)", jenis: "Quest Item", tier: "SSS", jual: 10800000, emoji: "📁", user: "Makima / Kishibe", material: "Map tebal berkode enkripsi", desc: "Dokumen tingkat tertinggi berisi data intelijen rahasia antar-negara mengenai konspirasi kontrak iblis global. Membuka skenario raid boss akhir." }
];

const LOCATION_LIST = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST];
const characterNames = new Set(CHARACTER_LIST.map(character => character.nama));
const itemNames = new Set(ITEM_LIST.map(item => item.nama));
const tierRank = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6, SS: 7, SSS: 8 };

for (const location of LOCATION_LIST) {
  location.characters = CHARACTER_LIST
    .filter(character => character.lokasi?.includes(location.nama))
    .map(character => character.nama);

  const validDrops = (location.drop || []).filter(itemName => itemNames.has(itemName));
  const maxTier = Math.min(8, Math.max(1, Math.ceil(Number(location.level || 1) / 3)));
  const fallbackDrops = ITEM_LIST.filter(item => tierRank[item.tier] <= maxTier);
  location.drop = validDrops.length > 0
    ? validDrops
    : fallbackDrops.slice(-Math.min(3, fallbackDrops.length)).map(item => item.nama);
}

for (const character of CHARACTER_LIST) {
  character.lokasi = (character.lokasi || []).filter(locationName => LOCATION_LIST.some(location => location.nama === locationName));
}

const TITLE_LIST = [
  [500, '🕳️ Absolute Concept Eraser', 'Kota-kota mulai kehilangan nama untuk ketakutan yang pernah mereka kenal. Setelah menghapus konsep itu dari akar ingatan, kamu dijuluki Absolute Concept Eraser oleh manusia yang masih mampu mengingat jasamu.'],
  [490, '🌌 Primal Fear Hunter Supreme', 'Kamu menembus wilayah yang bahkan Devil purba anggap sebagai rumah terlarang. Para saksi menyebutmu Primal Fear Hunter Supreme karena kamu kembali membawa rahasia dari dasar Neraka.'],
  [480, '💀 Death Devil Executioner', 'Satu keputusanmu memutus rantai korban yang seharusnya tidak berakhir. Sejak itu, Death Devil Executioner menjadi gelar yang dibisikkan oleh mereka yang melihatmu berdiri di ambang kematian.'],
  [470, '⛓️ Hell Division Commander', 'Kamu memimpin regu yang tidak lagi mengandalkan peta, karena setiap jalan di Neraka bisa berubah menjadi mulut Devil. Bawahanmu memanggilmu Hell Division Commander setelah kamu membawa mereka pulang tanpa meninggalkan satu nama pun.'],
  [460, '🩸 Fear Erasure Hunter', 'Kamu belajar membedakan rasa takut yang melindungi manusia dari rasa takut yang memberi makan Devil. Keahlian itu membuatmu mendapatkan gelar Fear Erasure Hunter dan menjadi pemburu yang ditakuti oleh para pemakan kepanikan.'],
  [450, '🔥 Primal Threat Hunter', 'Sebuah ancaman purba pernah berhenti bergerak hanya karena mendengar laporan tentangmu. Public Safety lalu mencatatmu sebagai Primal Threat Hunter, pemburu yang dikirim ketika senjata biasa sudah tidak berguna.'],
  [440, '☠️ Death Response Hunter', 'Kamu datang ke lokasi bencana setelah semua orang lain memilih mundur. Karena selalu menjadi orang pertama yang menghadapi sisa-sisa kematian, kamu dikenal sebagai Death Response Hunter.'],
  [430, '⚔️ Hell Operations Commander', 'Operasi rahasia di antara pintu-pintu Neraka membutuhkan seseorang yang mampu memerintah tanpa kehilangan akal. Kamu memperoleh gelar Hell Operations Commander setelah mengubah misi bunuh diri menjadi jalur evakuasi.'],
  [410, '🔫 Gun Devil Strike Hunter', 'Kamu mampu membaca arah serangan dari suara tembakan yang belum terjadi. Para agen bersenjata memberimu gelar Gun Devil Strike Hunter karena setiap seranganmu selalu tiba sebelum peluru musuh.'],
  [400, '☄️ Apocalypse Response Hunter', 'Ketika ramalan kiamat mulai muncul di siaran dan dinding kota, kamu menjadi nama pertama dalam daftar mobilisasi. Gelar Apocalypse Response Hunter menandai bahwa seluruh distrik menunggu keputusanmu untuk bertahan.'],
  [390, '🌑 Hell Survivalist', 'Kamu menghabiskan waktu di tempat tanpa pagi, menghitung langkah dari satu pintu merah ke pintu berikutnya. Mereka yang melihatmu pulang menjulukimu Hell Survivalist karena tubuhmu membawa bukti hidup dari kegelapan itu.'],
  [380, '⚡ Special Division Captain', 'Kamu tidak lagi hanya menerima perintah; kamu memilih siapa yang dibawa dan siapa yang harus tetap di markas. Special Division Captain menjadi pangkat yang diberikan kepadamu setelah banyak operasi selesai tanpa laporan korban tambahan.'],
  [370, '🩸 Blood Contract Master', 'Kamu hafal setiap harga yang dapat ditagih oleh Devil dan menolak menandatangani kalimat yang tidak kamu pahami. Para negosiator menyebutmu Blood Contract Master karena tidak ada kontrak yang bisa menyembunyikan tipu dayanya darimu.'],
  [360, '👁️ Makima Investigation Chief', 'Kamu menemukan pola perintah, saksi yang hilang, dan jejak kendali di balik laporan resmi. Gelar Makima Investigation Chief muncul dari arsip rahasia yang hanya boleh dibaca oleh orang yang tidak mudah dikendalikan.'],
  [350, '🔥 Devil Suppression Chief', 'Kamu menyusun taktik yang membuat regu manusia mampu menahan serbuan Devil lebih kuat dari mereka. Sebagai Devil Suppression Chief, suaramu menjadi aba-aba terakhir sebelum seluruh pasukan bergerak.'],
  [340, '⛓️ Pochita Witness', 'Di balik pintu yang tidak boleh dibuka, kamu melihat sekilas kebenaran tentang suara gergaji dan hati yang memilih berkorban. Sejak itu, Pochita Witness melekat pada namamu sebagai gelar bagi saksi yang membawa rahasia terlalu besar.'],
  [330, '💣 Bomb Incident Survivor', 'Ledakan meratakan bangunan, memutus komunikasi, dan menghapus jejak banyak orang dari peta. Kamu bertahan di antara puing-puing itu hingga disebut Bomb Incident Survivor oleh regu penyelamat yang menemukanmu.'],
  [320, '🏹 International Assassin Hunter', 'Targetmu berpindah dari hotel Tokyo ke jalur rahasia lintas negara, tetapi kamu selalu menemukan jejaknya. Para pembunuh bayaran memberi julukan International Assassin Hunter karena perburuanmu tidak mengenal perbatasan.'],
  [310, '🗡️ Katana Incident Hunter', 'Kamu mempelajari bahwa dendam bisa diwariskan lebih tajam daripada pedang. Setelah menghentikan rangkaian serangan Yakuza, arsip Public Safety mencatatmu sebagai Katana Incident Hunter.'],
  [300, '🎎 Doll Incident Hunter', 'Kamu memasuki ruangan penuh wajah yang tersenyum tanpa kehendak dan menemukan manusia di balik setiap benangnya. Gelar Doll Incident Hunter diberikan karena kamu mampu mengakhiri wabah boneka tanpa kehilangan nurani.'],
  [290, '😈 Fiend Response Hunter', 'Kamu dipanggil ketika tubuh manusia dan naluri Devil mulai bertarung di jalanan. Pengalaman menghadapi kekacauan itu menjadikanmu Fiend Response Hunter, spesialis yang tidak langsung menarik pelatuk.'],
  [280, '👑 Elite Public Safety Hunter', 'Kamu memperoleh akses ke berkas yang sebelumnya hanya dibuka untuk petinggi negara. Elite Public Safety Hunter bukan sekadar pujian; gelar itu berarti hidupmu kini dihitung sebagai aset strategis.'],
  [270, '⚰️ Death Report Hunter', 'Kamu mengisi laporan untuk rekan-rekan yang tidak pernah pulang, lalu mengenakan perlengkapan mereka pada misi berikutnya. Julukan Death Report Hunter lahir karena kamu mengingat nama korban sebelum memburu pembunuhnya.'],
  [260, '🌊 Disaster Division Hunter', 'Banjir darah dan runtuhan bangunan pernah memisahkan satu kota menjadi pulau-pulau kecil. Kamu menghubungkan kembali jalur evakuasi dan mendapat gelar Disaster Division Hunter dari warga yang berhasil diselamatkan.'],
  [250, '🌪️ Devil Containment Hunter', 'Kamu berhenti mengejar Devil secara membabi buta dan mulai mempelajari cara membatasi ruang geraknya. Sejak berhasil menutup satu distrik tanpa korban massal, kamu disebut Devil Containment Hunter.'],
  [240, '⚔️ Violence Division Hunter', 'Pertarunganmu menjadi cepat, keras, dan terukur, seperti latihan panjang yang akhirnya menemukan sasaran. Rekan satu divisi menjulukimu Violence Division Hunter karena kamu mampu memakai kekuatan tanpa kehilangan kendali.'],
  [230, '🛡️ Senior Public Safety Hunter', 'Hunter baru mulai mencari namamu ketika mereka butuh keputusan di tengah situasi buruk. Gelar Senior Public Safety Hunter tumbuh dari kepercayaan, bukan dari seragam atau pangkat di atas kertas.'],
  [220, '🔥 Special Operations Hunter', 'Kamu menerima pekerjaan yang tidak boleh tercatat: menyusup, mengamati, lalu menghilang sebelum sirene datang. Special Operations Hunter menjadi nama panggilanmu setelah serangkaian misi rahasia berhasil tanpa suara.'],
  [210, '⛓️ Chainsaw Division Hunter', 'Kamu ditempatkan dekat fenomena yang mengubah sejarah Devil dan belajar bahwa kekuatan besar selalu meminta harga pribadi. Sebagai Chainsaw Division Hunter, langkahmu mulai dikaitkan dengan suara mesin yang membuat Neraka bergetar.'],
  [200, '💀 Horsemen Investigation Hunter', 'Kamu menyusun potongan informasi tentang empat sosok yang dapat mengubah arah dunia dari balik wajah biasa. Gelar Horsemen Investigation Hunter diberikan kepada pemburu yang berani menelusuri ancaman tanpa nama.'],
  [190, '🌙 Night Patrol Hunter', 'Saat toko-toko tutup dan lampu kota berubah menjadi bayangan panjang, kamu tetap menyusuri jalan. Warga malam menjulukimu Night Patrol Hunter karena mereka tahu seseorang masih berjaga ketika semua orang tidur.'],
  [180, '🎖️ Veteran Devil Hunter', 'Kamu sudah melihat cukup banyak partner berganti untuk memahami bahwa pengalaman bukan berarti kebal dari rasa kehilangan. Gelar Veteran Devil Hunter menjadi tanda bahwa kamu tetap kembali meski setiap misi membawa kenangan baru.'],
  [170, '📜 Senior Devil Hunter', 'Kamu bisa mengenali pola langkah Devil dari retakan dinding dan bau darah yang tersisa. Para junior menyebutmu Senior Devil Hunter karena nasihatmu sering menyelamatkan mereka sebelum pertempuran dimulai.'],
  [160, '⭐ Experienced Devil Hunter', 'Kamu mulai diberi target yang membutuhkan lebih dari sekadar keberanian dan senjata tajam. Gelar Experienced Devil Hunter menandai saat instingmu mulai sejalan dengan perhitungan yang matang.'],
  [150, '⚡ Elite Devil Hunter', 'Gerakanmu menjadi cukup cepat untuk membuat Devil kehilangan kesempatan kedua. Setelah beberapa operasi bersih tanpa keraguan, namamu dipasang sebagai Elite Devil Hunter dalam daftar agen unggulan.'],
  [140, '🗡️ Advanced Devil Hunter', 'Kamu memahami kapan harus menyerang, kapan harus menunggu, dan kapan harus memutuskan hubungan dengan kontrak. Title Advanced Devil Hunter tumbuh ketika teknikmu mulai menjadi standar latihan bagi rekrutan baru.'],
  [130, '🏹 Skilled Devil Hunter', 'Tanganmu tidak lagi gemetar ketika membidik bagian tubuh Devil yang paling berbahaya. Sebutan Skilled Devil Hunter diberikan setelah serangkaian tembakanmu mengakhiri misi tanpa membahayakan warga.'],
  [120, '👮 Public Safety Hunter', 'Kamu resmi masuk ke dalam sistem yang mengirim manusia melawan makhluk yang tidak tunduk pada hukum. Public Safety Hunter adalah title pertamamu yang membuat masyarakat mengenalmu sebagai pelindung resmi.'],
  [110, '🩹 Blooded Devil Hunter', 'Luka di lengan dan bahumu tidak lagi kamu sembunyikan karena semuanya menjadi catatan dari misi yang berhasil. Rekanmu menyebutmu Blooded Devil Hunter, pemburu yang telah membayar keberaniannya dengan darah sendiri.'],
  [100, '📋 Junior Devil Hunter', 'Kamu mulai menerima berkas dengan tingkat bahaya yang tidak bisa dijelaskan dalam briefing singkat. Sebutan Junior Devil Hunter berarti kamu dipercaya menghadapi ancaman, tetapi masih punya banyak hal untuk dibuktikan.'],
  [90, '🪓 Apprentice Devil Hunter', 'Latihanmu berubah ketika kapak pertama yang kamu pegang benar-benar harus menghentikan Devil. Sebagai Apprentice Devil Hunter, kamu belajar bahwa setiap ayunan membawa tanggung jawab terhadap orang di belakangmu.'],
  [80, '🔪 Devil Hunter Trainee', 'Kamu masih sering mengulang prosedur keselamatan, tetapi kini sudah tahu bahwa prosedur itu dibuat karena banyak orang pernah gagal. Gelar Devil Hunter Trainee membuka pintu pertamamu menuju pekerjaan lapangan.'],
  [70, '🎯 Rookie Devil Hunter', 'Tugas pertamamu tidak berjalan seperti simulasi, dan target kecil pun ternyata mampu membuat seluruh regu panik. Setelah berhasil pulang, kamu mulai dipanggil Rookie Devil Hunter oleh rekan-rekan seangkatan.'],
  [60, '🎒 Devil Hunter Cadet', 'Kamu membawa tas perlengkapan yang terlalu berat dan keberanian yang belum pernah diuji. Title Devil Hunter Cadet menjadi tanda bahwa kamu sudah memilih jalan berbahaya meski belum tahu ujungnya.'],
  [50, '📖 Devil Hunter Initiate', 'Kamu membaca laporan korban satu per satu untuk memahami dunia yang selama ini hanya kamu dengar dari rumor. Sebagai Devil Hunter Initiate, kamu mulai belajar bahwa pengetahuan bisa menjadi senjata pertama.'],
  [40, '🏅 Devil Hunter Recruit', 'Namamu diterima setelah kamu menyelesaikan pemeriksaan dan berjanji untuk mengikuti perintah evakuasi. Gelar Devil Hunter Recruit adalah awal dari identitas baru yang membuat hidupmu tidak lagi biasa.'],
  [30, '📍 Field Hunter', 'Kamu meninggalkan ruang latihan untuk melihat lokasi kejadian dengan mata sendiri. Sejak menemukan jejak Devil pertamamu di lapangan, kamu pantas menyandang title Field Hunter.'],
  [20, '🗂️ Registered Hunter', 'Arsip kota akhirnya memuat namamu, sidik jarimu, dan tanda tangan yang mengizinkanmu membawa perlengkapan pemburu. Registered Hunter adalah bukti bahwa perjalananmu sudah dimulai secara resmi.'],
  [10, '📄 Probationary Hunter', 'Kamu belum dipercaya memegang misi besar, tetapi sudah berani menandatangani masa percobaan. Sebagai Probationary Hunter, kamu berdiri di garis awal antara kehidupan sipil dan dunia Devil.']
];

function getTitle(lvl){
  return TITLE_LIST.find(([minimumLevel]) => lvl >= minimumLevel)?.[1] || '📝 Applicant';
}

function getTitleBackstory(lvl){
  const entry = TITLE_LIST.find(([minimumLevel]) => lvl >= minimumLevel);
  return entry?.[2] || '📝 Kamu baru mulai memasuki dunia pemburu Devil. Belum ada gelar yang melekat pada namamu, dan langkah berikutnya akan menentukan bagaimana dunia mengenalmu.';
}
/*
  if(lvl >= 450) return '🌠 Absolute Annihilator'
  if(lvl >= 440) return '🌌 Primordial Eraser'
  if(lvl >= 430) return '🪚 Concept Destroyer'
  if(lvl >= 420) return '💥 Reality Devourer'
  if(lvl >= 410) return '🔱 Gun Devil Incarnate'
  if(lvl >= 400) return '☄️ Apocalypse Walker'
  if(lvl >= 390) return '🌑 Void Sovereign'
  if(lvl >= 380) return '⚡ Thunder of Hell'
  if(lvl >= 370) return '🩸 Blood Sovereign'
  if(lvl >= 360) return '👁️ The All Seeing'
  if(lvl >= 350) return '🔥 Eternal Flame'
  if(lvl >= 340) return '⛓️ Pochita Vessel'
  if(lvl >= 330) return '💣 Bomb Annihilator'
  if(lvl >= 320) return '🏹 Crossbow Overlord'
  if(lvl >= 310) return '🗡️ Katana Sovereign'
  if(lvl >= 300) return '🎅 Doll Sovereign'
  if(lvl >= 290) return '😈 Fiend Commander'
  if(lvl >= 280) return '👑 Devil King'
  if(lvl >= 270) return '⚰️ Death Harbinger'
  if(lvl >= 260) return '🌊 Calamity Tide'
  if(lvl >= 250) return '🌪️ Disaster Walker'
  if(lvl >= 240) return '⚔️ Blade of Vengeance'
  if(lvl >= 230) return '🛡️ Iron Will Guardian'
  if(lvl >= 220) return '🔥 Crimson Executioner'
  if(lvl >= 210) return '⛓️ Chainsaw Legend'
  if(lvl >= 200) return '💀 Horsemen Slayer'
  if(lvl >= 190) return '🌙 Nightmare Stalker'
  if(lvl >= 180) return '🎖️ Veteran Executioner'
  if(lvl >= 170) return '📜 Senior Reaper'
  if(lvl >= 160) return '⭐ Experienced Slayer'
  if(lvl >= 150) return '⚡ Elite Hunter'
  if(lvl >= 140) return '🗡️ Advanced Slayer'
  if(lvl >= 130) return '🏹 Skilled Fighter'
  if(lvl >= 120) return '👮 Official Operative'
  if(lvl >= 110) return '🩹 Blooded Warrior'
  if(lvl >= 100) return '📋 Junior Operative'
  if(lvl >= 90)  return '🪓 Apprentice Fighter'
  if(lvl >= 80)  return '🔪 Trainee Blade'
  if(lvl >= 70)  return '🎯 Rookie Striker'
  if(lvl >= 60)  return '🎒 Cadet Agent'
  if(lvl >= 50)  return '📖 Initiate Agent'
  if(lvl >= 40)  return '🏅 Recruit Agent'
  if(lvl >= 30)  return '📍 Field Agent'
  if(lvl >= 20)  return '🗂️ Registered Agent'
  if(lvl >= 10)  return '📄 Probation Agent'
  return '📝 Applicant'
}
*/

function parseBonus(bonusStr, target) {
  if (!bonusStr || bonusStr === 'None') return;
  let match = bonusStr.match(/([+-]?\d+\.?\d*)%/) || bonusStr.match(/(\d+)/);
  let val = match ? parseFloat(match[1]) : 0;

  if (bonusStr.includes('Concept Erasure')) { target.conceptErasure = true; target.dmg += val || 100; }
  else if (bonusStr.includes('Auto Transform')) target.autoTransform = true;
  else if (bonusStr.includes('Critical') || bonusStr.includes('critChance')) target.critChance += val;
  else if (bonusStr.includes('Regen') || bonusStr.includes('regen')) target.regen += val;
  else if (bonusStr.includes('Weapon Damage') || bonusStr.includes('Gun Damage') || bonusStr.includes('Dark Contract') || bonusStr.includes('dmg') || bonusStr.includes('atk') || bonusStr.includes('ATK')) target.dmg += val;
  else if (bonusStr.includes('Defense') || bonusStr.includes('def')) target.def += val;
  else if (bonusStr.includes('Evasion') || bonusStr.includes('Dodge') || bonusStr.includes('evasion')) target.evasion += val;
  else if (bonusStr.includes('EXP') || bonusStr.includes('Mission Reward') || bonusStr.includes('expBoost')) target.expMult += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Blood Gain') || bonusStr.includes('bloodMult')) target.bloodMult += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Blood Berserk')) { target.bloodMult += (val > 1 ? val / 100 : val); target.dmg += val; }
  else if (bonusStr.includes('Steal') || bonusStr.includes('stealBlood')) target.stealBlood += val;
  else if (bonusStr.includes('instant kill') || bonusStr.includes('instantKill')) target.instantKill += val;
  else if (bonusStr.includes('All Stat') || bonusStr.includes('allStats')) { target.dmg += val; target.def += val; }
  else if (bonusStr.includes('Heal') || bonusStr.includes('healBoost')) target.heal += val;
  else if (bonusStr.includes('Crit Damage') || bonusStr.includes('critDmg')) target.critDmg += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Revive')) target.revive = true;
  else if (bonusStr.includes('Team HP') || bonusStr.includes('teamHp')) target.teamHp += val;
  else if (bonusStr.includes('Accuracy') || bonusStr.includes('accuracy')) { target.accuracy += val; target.dmg += val; }
  else if (bonusStr.includes('Speed') || bonusStr.includes('Attack Speed') || bonusStr.includes('speed')) { target.speed += val; target.dmg += val; }
  else if (bonusStr.includes('AoE Damage') || bonusStr.includes('aoe') || bonusStr.includes('aoeDmg') || bonusStr.includes('aoePierce')) target.aoe += val;
  else if (bonusStr.includes('Burn') || bonusStr.includes('burn')) target.burn += val;
  else if (bonusStr.includes('Water')) target.water += val;
  else if (bonusStr.includes('Fire')) target.fire += val;
  else if (bonusStr.includes('Pierce') || bonusStr.includes('pierce')) target.pierce += val;
  else if (bonusStr.includes('Bleed') || bonusStr.includes('bleed')) target.bleed += val;
  else if (bonusStr.includes('CC Resist') || bonusStr.includes('ccResist')) { target.ccResist = (target.ccResist || 0) + val; target.def += val; }
  else if (bonusStr.includes('CC') || bonusStr.includes('cc') || bonusStr.includes('Stun')) { target.cc += val || 1; target.dmg += val || 1; }
  else if (bonusStr.includes('Luck')) target.luck += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Shop Discount') || bonusStr.includes('discount')) target.discount += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('goldMult') || bonusStr.includes('Gold')) target.bloodMult += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Money') || bonusStr.includes('Blood +')) target.bloodFlat += val;
  else if (bonusStr.includes('Find Item') || bonusStr.includes('findItem')) target.findItem += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Info') || bonusStr.includes('infoGain')) target.info += (val > 1 ? val / 100 : val);
  else if (bonusStr.includes('Stamina')) target.stamina += val;
  else if (bonusStr.includes('Weapon Dur') || bonusStr.includes('weaponDur')) target.weaponDur += val;
  else if (bonusStr.includes('Craft Weapon')) target.craftWeapon = (target.craftWeapon || 0) + (val || 1);
  else if (bonusStr.includes('Control Enemy') || bonusStr.includes('control')) { target.control = (target.control || 0) + (val || 1); target.dmg += val || 1; }
  else if (bonusStr.includes('Summon Doll') || bonusStr.includes('summon') || bonusStr.includes('summonBuff')) { target.summon = (target.summon || 0) + (val || 1); target.dmg += (val || 1) * 10; }
  else if (bonusStr.includes('Doll Buff') || bonusStr.includes('dollBuff')) { target.dollBuff = (target.dollBuff || 0) + val; target.dmg += val; target.def += val; }
  else if (bonusStr.includes('Self Destruct') || bonusStr.includes('selfDestruct')) target.selfDestruct = (target.selfDestruct || 0) + val;
  else if (bonusStr.includes('Snowball Fight')) { target.dmg += 25; target.def += 10; }
  else if (bonusStr.includes('Political Power') || bonusStr.includes('political')) { target.political = (target.political || 0) + (val || 1); target.dmg += val || 1; }
  else if (bonusStr.includes('Army Buff') || bonusStr.includes('army')) { target.army = (target.army || 0) + val; target.dmg += val; }
  else if (bonusStr.includes('Law') || bonusStr.includes('law')) { target.law = (target.law || 0) + val; target.def += val; }
  else if (bonusStr.includes('Diplomacy') || bonusStr.includes('diplomacy')) { target.diplomacy = (target.diplomacy || 0) + val; target.def += val; }
  else if (bonusStr.includes('Crime') || bonusStr.includes('crime')) { target.crime = (target.crime || 0) + val; target.dmg += val; }
  else if (bonusStr.includes('INT') || bonusStr.includes('int')) { target.int = (target.int || 0) + val; target.dmg += val; }
  else if (bonusStr.includes('Justice') || bonusStr.includes('justice')) { target.justice = (target.justice || 0) + val; target.dmg += val; target.def += val; }
  else if (bonusStr.includes('Taunt') || bonusStr.includes('taunt')) { target.taunt = (target.taunt || 0) + (val || 1); target.def += val || 1; }
  else if (bonusStr.includes('Snake Summon') || bonusStr.includes('snake')) { target.snake = (target.snake || 0) + (val || 1); target.dmg += (val || 1) * 10; }
  else if (bonusStr.includes('Teleport Ally') || bonusStr.includes('teleportChance')) target.teleportChance = (target.teleportChance || 0) + (val || 15);
}

function bar(val, len = 10) {
  val = Math.max(0, Math.min(100, val));
  return '█'.repeat(Math.floor(val / (100 / len))) + '░'.repeat(len - Math.floor(val / (100 / len)));
}

function calcSetBonus(csm) {
  let bonus = {};
  for (let ach of ACHIEVEMENT_LIST) {
    if (ach.setBonus && Object.keys(ach.setBonus).length > 0) {
      if (ach.check(csm)) {
        for (let key in ach.setBonus) {
          bonus[key] = (bonus[key] || 0) + ach.setBonus[key];
        }
      }
    }
  }
  return bonus;
}
function calcBonus(csm) {
  let b = {
    dmg:0, def:0, critChance:20, critDmg:0.5, evasion:0, regen:0, heal:0,
    expMult:1, bloodMult:1, stealBlood:0, instantKill:0, teamHp:0,
    accuracy:0, speed:0, aoe:0, burn:0, water:0, fire:0, pierce:0, bleed:0, cc:0,
    luck:0, discount:0, money:0, findItem:0, info:0, stamina:0, weaponDur:0,
    autoTransform:false, revive:false, teleportChance:0, conceptErasure:false,
    craftWeapon:0, control:0, ccResist:0, summon:0, dollBuff:0, selfDestruct:0,
    political:0, army:0, law:0, diplomacy:0, crime:0, int:0, justice:0, taunt:0, snake:0,
    dmgMultiplier:1, partnerDmgMultiplier:1, bloodFlat:0, gachaBonus:0,
    noHeal:false, noFight:false
  }

  const partners = Array.isArray(csm?.partners) ? csm.partners : []
  let active = partners.filter(p => p.status === 'active')
  for (let p of active) {
    let ch = CHARACTER_LIST.find(c => c.nama === p.name)
    if (ch) {
      const before = {}
      Object.keys(b).forEach(key => { before[key] = b[key] })
      parseBonus(ch.bonus, b)
      const love = Number(csm?.relations?.[p.name] || 0)
      const needLove = Math.max(1, Number(p.needLove || ch.needLove || 1))
      const partnerLevel = Math.max(1, Math.floor(love / needLove) + 1)
      p.level = partnerLevel
      Object.keys(b).forEach(key => {
        if (typeof b[key] === 'number' && typeof before[key] === 'number') {
          const contribution = b[key] - before[key]
          b[key] += contribution * (p.level - 1)
        }
      })
    }
  }
  
  let setBonus = calcSetBonus(csm)
  const setBonusAliases = {
    atk: 'dmg', rawDmg: 'dmg', gunDmg: 'dmg',
    allStats: 'allStats',
    expBoost: 'expMult', missionReward: 'expMult',
    bloodMult: 'bloodMult', goldMult: 'bloodMult',
    findItem: 'findItem', infoGain: 'info', healBoost: 'heal',
    aoeDmg: 'aoe', aoePierce: 'pierce', summonBuff: 'summon'
  }
  for (let key in setBonus) {
    const targetKey = setBonusAliases[key] || key
    let value = setBonus[key]
    if (targetKey === 'expMult' || targetKey === 'bloodMult' || targetKey === 'findItem' || targetKey === 'info' || targetKey === 'discount') {
      value = value > 1 ? value / 100 : value
    }
    if (key === 'allStats') {
      b.dmg += value
      b.def += value
    } else if (typeof b[targetKey] === 'boolean') {
      b[targetKey] = b[targetKey] || !!value
    } else {
      b[targetKey] = (b[targetKey] || 0) + value
      if (targetKey === 'summon') b.dmg += value * 10
      if (targetKey === 'accuracy' || targetKey === 'speed' || targetKey === 'cc' || targetKey === 'control' || targetKey === 'snake') b.dmg += value
      if (targetKey === 'ccResist' || targetKey === 'taunt') b.def += value
    }
  }

  const legacyEndingEffects = {
    freedom: { lowHealthDmg: 1.3 }, apocalypse: { summon: 1 },
    control: { bloodFlat: 50000 }, sacrifice: { revive: true, partnerDmgMultiplier: 1.5 },
    love: { heal: 100, gachaBonus: 1 }, revenge: { dmgMultiplier: 1.5, noHeal: true },
    peace: { regen: 10, noFight: true }
  }
  for (const ending of Object.values(csm?.endingBuffs || {})) {
    const effect = ending.effect || legacyEndingEffects[ending.id] || {}
    for (const [key, value] of Object.entries(effect)) {
      if (typeof b[key] === 'boolean') b[key] = b[key] || Boolean(value)
      else if (typeof value === 'number') {
        if (key.endsWith('Multiplier')) b[key] *= value
        else b[key] += value
      }
    }
    if (effect.lowHealthDmg && Number(csm?.health) / Math.max(1, Number(csm?.maxHealth)) < 0.3) {
      b.dmgMultiplier *= effect.lowHealthDmg
    }
  }

  if (csm?.devilBargain?.expiresAt > Date.now()) {
    b.dmgMultiplier *= Number(csm.devilBargain.damageMultiplier) || 1
  }
  if (csm?.deathSentence?.expiresAt > Date.now()) {
    b.dmgMultiplier *= Number(csm.deathSentence.damageMultiplier) || 1
    b.bloodMult *= 1.25
  }

  return b
}

const BUFF_LIST = Object.keys(calcBonus({ partners: [] }));

// --- BAGIAN 1: DATABASE 200 QUEST BERBEDA & BERVARIASI (MENCAKUP COMMAND INTI SESUAI KETENTUAN) ---

const QUEST_LIST = [
  // KATEGORI: DASAR & PROFIL
  { id: 'csm-quest-1', type: 'profile', name: 'Periksa menu profil utama untuk melihat identitas hunter', target: 1, blood: 1100, exp: 55 },
  { id: 'csm-quest-2', type: 'profile', name: 'Cek ulang statistik kemajuan level pada profil hunter', target: 2, blood: 1300, exp: 65 },
  { id: 'csm-quest-3', type: 'stats', name: 'Periksa detail status kekuatan dan daftar buff yang sedang aktif', target: 1, blood: 1250, exp: 60 },
  { id: 'csm-quest-4', type: 'stats', name: 'Tinjau ulang informasi statistik pertahanan karakter hunter', target: 2, blood: 1600, exp: 80 },
  { id: 'csm-quest-5', type: 'stats guide', name: 'Baca panduan lengkap cara mendapatkan dan memahami buff', target: 1, blood: 1150, exp: 58 },
  { id: 'csm-quest-6', type: 'about', name: 'Baca informasi tentang latar belakang statistik game server', target: 1, blood: 900, exp: 45 },
  { id: 'csm-quest-7', type: 'nickname', name: 'Atur nama panggilan unik untuk identitas karakter hunter', target: 1, blood: 1500, exp: 80 },
  { id: 'csm-quest-8', type: 'gender', name: 'Tentukan pilihan jenis kelamin karakter dalam permainan', target: 1, blood: 1000, exp: 50 },
  { id: 'csm-quest-9', type: 'rest', name: 'Gunakan fitur istirahat untuk memulihkan stamina HP hunter', target: 3, blood: 1400, exp: 75 },
  { id: 'csm-quest-10', type: 'rest', name: 'Ambil jeda pemulihan kesehatan secara intensif di markas', target: 5, blood: 2200, exp: 110 },
  { id: 'csm-quest-11', type: 'cooldown', name: 'Pantau status waktu tunggu command aktif agar efisien', target: 2, blood: 950, exp: 48 },
  { id: 'csm-quest-12', type: 'daily', name: 'Klaim hadiah harian darah secara rutin tanpa terlewat', target: 1, blood: 2000, exp: 100 },
  { id: 'csm-quest-13', type: 'quest', name: 'Buka dan periksa daftar misi quest aktif harian', target: 2, blood: 1600, exp: 85 },
  { id: 'csm-quest-14', type: 'inv', name: 'Cek isi inventory gabungan senjata dan item berharga', target: 3, blood: 1700, exp: 90 },
  { id: 'csm-quest-15', type: 'inv', name: 'Rapikan barang simpanan di dalam tas inventory utama', target: 4, blood: 2100, exp: 105 },
  { id: 'csm-quest-16', type: 'picture', name: 'Lihat koleksi gambar gallery spesial karakter kesayangan', target: 2, blood: 1250, exp: 65 },
  { id: 'csm-quest-17', type: 'gallery', name: 'Jelajahi seluruh arsip galeri visual game secara berkala', target: 1, blood: 1350, exp: 70 },
  { id: 'csm-quest-18', type: 'command', name: 'Pelajari daftar lengkap command game yang tersedia', target: 1, blood: 1150, exp: 60 },
  { id: 'csm-quest-19', type: 'tutorial', name: 'Baca panduan dasar pemula untuk bertahan hidup di kota', target: 1, blood: 1500, exp: 80 },
  { id: 'csm-quest-20', type: 'profile', name: 'Tinjau ulang pencapaian level hunter di menu profil', target: 3, blood: 1800, exp: 95 },

  // KATEGORI: EKSPLORASI & MISI
  { id: 'csm-quest-21', type: 'location', name: 'Cek daftar wilayah peta lokasi berbahaya penuh iblis', target: 2, blood: 1400, exp: 75 },
  { id: 'csm-quest-22', type: 'location', name: 'Pelajari koordinat area penyebaran monster berbahaya', target: 3, blood: 1900, exp: 100 },
  { id: 'csm-quest-23', type: 'visit', name: 'Kunjungi titik lokasi markas Biro Keamanan publik', target: 2, blood: 1650, exp: 85 },
  { id: 'csm-quest-24', type: 'visit', name: 'Datangi pusat perbelanjaan distrik utama kota', target: 3, blood: 2100, exp: 110 },
  { id: 'csm-quest-25', type: 'explore', name: 'Jelajahi area liar secara acak demi temuan item langka', target: 4, blood: 2200, exp: 120 },
  { id: 'csm-quest-26', type: 'explore', name: 'Patroli malam di lorong kota yang terbengkalai', target: 5, blood: 2700, exp: 150 },
  { id: 'csm-quest-27', type: 'mission', name: 'Terima kontrak misi berburu iblis kelas bawah', target: 2, blood: 2500, exp: 140 },
  { id: 'csm-quest-28', type: 'mission', name: 'Selesaikan tugas pembasmian monster pengganggu kota', target: 3, blood: 3200, exp: 180 },
  { id: 'csm-quest-29', type: 'rescue', name: 'Laksanakan operasi penyelamatan warga sipil terjebak', target: 2, blood: 3000, exp: 175 },
  { id: 'csm-quest-30', type: 'rescue', name: 'Evakuasi sandera dari cengkeraman kelompok fiend', target: 1, blood: 2600, exp: 145 },
  { id: 'csm-quest-31', type: 'terror', name: 'Periksa catatan ancaman teror iblis di kota besar', target: 1, blood: 1600, exp: 85 },
  { id: 'csm-quest-32', type: 'terror', name: 'Investigasi laporan teror mencurigakan di stasiun', target: 2, blood: 2400, exp: 130 },
  { id: 'csm-quest-33', type: 'job list', name: 'Lihat papan pengumuman daftar pekerjaan paruh waktu', target: 2, blood: 1500, exp: 80 },
  { id: 'csm-quest-34', type: 'job', name: 'Periksa riwayat pekerjaan paruh waktu hunter', target: 1, blood: 1300, exp: 70 },
  { id: 'csm-quest-35', type: 'job info', name: 'Pelajari detail informasi pekerjaan yang sedang berjalan', target: 1, blood: 1400, exp: 75 },
  { id: 'csm-quest-36', type: 'work', name: 'Bekerja keras mengumpulkan gaji harian hunter', target: 4, blood: 2400, exp: 130 },
  { id: 'csm-quest-37', type: 'work', name: 'Lembur bekerja shift malam demi tambahan dana Blood', target: 3, blood: 2100, exp: 115 },
  { id: 'csm-quest-38', type: 'location', name: 'Cari tahu rute alternatif menuju zona merah berbahaya', target: 2, blood: 1750, exp: 90 },
  { id: 'csm-quest-39', type: 'explore', name: 'Ekspedisi mendalam ke dalam zona karantina iblis', target: 2, blood: 2500, exp: 135 },
  { id: 'csm-quest-40', type: 'mission', name: 'Amankan target buronan kelas B dari kejaran musuh', target: 2, blood: 2800, exp: 160 },

  // KATEGORI: PARTNER & KARAKTER
  { id: 'csm-quest-41', type: 'partner database', name: 'Pelajari database seluruh karakter partner potensial', target: 1, blood: 1500, exp: 80 },
  { id: 'csm-quest-42', type: 'partner database', name: 'Tinjau ulang profil kekuatan seluruh partner tempur', target: 2, blood: 2100, exp: 115 },
  { id: 'csm-quest-43', type: 'partner list', name: 'Periksa daftar partner setia yang sudah direkrut', target: 2, blood: 1600, exp: 85 },
  { id: 'csm-quest-44', type: 'partner list', name: 'Evaluasi kekuatan tempur para partner di markas', target: 3, blood: 2200, exp: 120 },
  { id: 'csm-quest-45', type: 'partner team', name: 'Cek formasi tim tempur aktif yang sedang bertugas', target: 2, blood: 1700, exp: 90 },
  { id: 'csm-quest-46', type: 'partner team', name: 'Optimalisasi susunan anggota tim utama pemburu', target: 3, blood: 2300, exp: 125 },
  { id: 'csm-quest-47', type: 'partner achievement', name: 'Lihat pencapaian khusus yang diraih oleh para partner', target: 1, blood: 1800, exp: 95 },
  { id: 'csm-quest-48', type: 'partner achievement', name: 'Klaim milestone pencapaian ikatan bersama partner', target: 2, blood: 2600, exp: 145 },
  { id: 'csm-quest-49', type: 'char', name: 'Periksa detail latar belakang karakter tertentu', target: 2, blood: 1900, exp: 100 },
  { id: 'csm-quest-50', type: 'char', name: 'Kaji kemampuan bertarung Makima atau Power', target: 2, blood: 2400, exp: 135 },
  { id: 'csm-quest-51', type: 'hospital', name: 'Cek daftar partner yang sekarat di fasilitas medis', target: 1, blood: 1650, exp: 88 },
  { id: 'csm-quest-52', type: 'hospital', name: 'Kunjungi fasilitas rumah sakit tempat pemulihan rekan', target: 2, blood: 1800, exp: 95 },
  { id: 'csm-quest-53', type: 'partner database', name: 'Pelajari kelemahan dan kekuatan spesifik karakter', target: 2, blood: 2000, exp: 110 },
  { id: 'csm-quest-54', type: 'partner list', name: 'Pantau status keaktifan rekan partner di barak', target: 1, blood: 1450, exp: 75 },
  { id: 'csm-quest-55', type: 'partner team', name: 'Tinjau formasi sinergi kelompok tempur lapangan', target: 1, blood: 1550, exp: 80 },
  { id: 'csm-quest-56', type: 'char', name: 'Analisis profil kekuatan tempur Denji dan Aki', target: 2, blood: 2500, exp: 140 },
  { id: 'csm-quest-57', type: 'hospital', name: 'Pantau kondisi medis rekan partner yang terluka', target: 3, blood: 2250, exp: 120 },
  { id: 'csm-quest-58', type: 'partner achievement', name: 'Cek syarat membuka achievement partner baru', target: 1, blood: 1700, exp: 90 },
  { id: 'csm-quest-59', type: 'char', name: 'Pelajari riwayat pertempuran karakter di masa lalu', target: 1, blood: 1600, exp: 85 },
  { id: 'csm-quest-60', type: 'partner list', name: 'Periksa kelengkapan atribut senjata para partner', target: 2, blood: 1850, exp: 98 },

  // KATEGORI: KONTRAK IBLIS
  { id: 'csm-quest-61', type: 'contract', name: 'Buka informasi dasar mengenai sistem kontrak iblis', target: 1, blood: 1500, exp: 80 },
  { id: 'csm-quest-62', type: 'contract', name: 'Konsultasikan aturan pembuatan perjanjian kontrak', target: 2, blood: 2100, exp: 115 },
  { id: 'csm-quest-63', type: 'contract list', name: 'Lihat daftar lengkap seluruh iblis yang tersedia', target: 2, blood: 1800, exp: 95 },
  { id: 'csm-quest-64', type: 'contract list', name: 'Pelajari variasi jenis iblis yang bisa dikontrak', target: 3, blood: 2400, exp: 130 },
  { id: 'csm-quest-65', type: 'contract database', name: 'Akses database global perjanjian kontrak iblis', target: 1, blood: 1750, exp: 92 },
  { id: 'csm-quest-66', type: 'contract database', name: 'Telusuri arsip rahasia perjanjian iblis kuno', target: 2, blood: 2500, exp: 140 },
  { id: 'csm-quest-67', type: 'contract history', name: 'Tinjau riwayat transaksi kontrak masa lalu', target: 1, blood: 1600, exp: 85 },
  { id: 'csm-quest-68', type: 'contract history', name: 'Analisis riwayat perolehan kontrak terdahulu', target: 2, blood: 2300, exp: 125 },
  { id: 'csm-quest-69', type: 'contract list info', name: 'Periksa detail spesifik kekuatan suatu jenis iblis', target: 2, blood: 2000, exp: 110 },
  { id: 'csm-quest-70', type: 'contract list info', name: 'Pelajari syarat dan risiko dari suatu perjanjian kontrak', target: 3, blood: 2800, exp: 155 },
  { id: 'csm-quest-71', type: 'contract', name: 'Tinjau keuntungan memiliki kekuatan dari kontrak', target: 1, blood: 1550, exp: 82 },
  { id: 'csm-quest-72', type: 'contract list', name: 'Cek pembaruan daftar iblis dalam sistem kontrak', target: 1, blood: 1400, exp: 75 },
  { id: 'csm-quest-73', type: 'contract database', name: 'Pelajari tingkat bahaya setiap jenis kontrak iblis', target: 2, blood: 2200, exp: 120 },
  { id: 'csm-quest-74', type: 'contract history', name: 'Periksa catatan sukses perjanjian sebelumnya', target: 1, blood: 1650, exp: 88 },
  { id: 'csm-quest-75', type: 'contract list info', name: 'Bandingkan statistik kekuatan antar iblis kontrak', target: 2, blood: 2150, exp: 118 },
  { id: 'csm-quest-76', type: 'contract', name: 'Kaji ulang batasan penggunaan kekuatan iblis', target: 2, blood: 2350, exp: 128 },
  { id: 'csm-quest-77', type: 'contract database', name: 'Cari referensi kontrak iblis tingkat tinggi di server', target: 1, blood: 1950, exp: 102 },
  { id: 'csm-quest-78', type: 'contract list', name: 'Telusuri daftar iblis elemen kegelapan di kontrak', target: 2, blood: 2050, exp: 108 },
  { id: 'csm-quest-79', type: 'contract history', name: 'Evaluasi dampak kontrak pada status karakter hunter', target: 2, blood: 2450, exp: 135 },
  { id: 'csm-quest-80', type: 'contract list info', name: 'Pelajari kelemahan spesifik dari suatu entitas iblis', target: 1, blood: 1700, exp: 90 },

  // KATEGORI: TOKO & INVENTORY
  { id: 'csm-quest-81', type: 'shop', name: 'Buka menu utama pusat perbelanjaan hunter', target: 1, blood: 1200, exp: 60 },
  { id: 'csm-quest-82', type: 'shop', name: 'Tinjau penawaran spesial di toko perlengkapan harian', target: 2, blood: 1800, exp: 95 },
  { id: 'csm-quest-83', type: 'shop weapon', name: 'Lihat katalog senjata tempur yang tersedia di toko', target: 2, blood: 1600, exp: 85 },
  { id: 'csm-quest-84', type: 'shop weapon', name: 'Cek pembaruan stok gudang senjata toko kota', target: 2, blood: 1750, exp: 92 },
  { id: 'csm-quest-85', type: 'shop weapon info', name: 'Periksa spesifikasi dan statistik senjata toko', target: 2, blood: 1700, exp: 90 },
  { id: 'csm-quest-86', type: 'shop weapon info', name: 'Bandingkan performa berbagai jenis senjata', target: 3, blood: 2100, exp: 115 },
  { id: 'csm-quest-87', type: 'shop item', name: 'Jelajahi daftar item penunjang petualangan hunter', target: 2, blood: 1500, exp: 80 },
  { id: 'csm-quest-88', type: 'shop item', name: 'Cari item kelangkaan tinggi di pasar gelap kota', target: 2, blood: 2200, exp: 120 },
  { id: 'csm-quest-89', type: 'repair', name: 'Perbaiki durability senjata yang mulai aus', target: 2, blood: 2000, exp: 110 },
  { id: 'csm-quest-90', type: 'repair', name: 'Maintenance seluruh arsenal senjata tempur', target: 3, blood: 2900, exp: 160 },
  { id: 'csm-quest-91', type: 'blood', name: 'Cek jumlah Blood dan saldo simpanan bank', target: 2, blood: 1300, exp: 70 },
  { id: 'csm-quest-92', type: 'blood', name: 'Monitor kestabilan finansial kekayaan hunter', target: 3, blood: 1600, exp: 85 },
  { id: 'csm-quest-93', type: 'gift', name: 'Pelajari aturan cara mengirim hadiah (gift)', target: 1, blood: 1100, exp: 55 },
  { id: 'csm-quest-94', type: 'gift', name: 'Bagikan informasi pengiriman hadiah sesama hunter', target: 2, blood: 1900, exp: 100 },
  { id: 'csm-quest-95', type: 'shop', name: 'Cek harga diskon barang perlengkapan di toko', target: 1, blood: 1350, exp: 70 },
  { id: 'csm-quest-96', type: 'shop weapon', name: 'Telusuri koleksi senjata jarak jauh di toko', target: 1, blood: 1450, exp: 75 },
  { id: 'csm-quest-97', type: 'shop item', name: 'Cari persediaan ramuan penambah darah di toko', target: 2, blood: 1650, exp: 88 },
  { id: 'csm-quest-98', type: 'repair', name: 'Cek kondisi ketahanan senjata sebelum berangkat misi', target: 1, blood: 1250, exp: 65 },
  { id: 'csm-quest-99', type: 'blood', name: 'Hitung total pendapatan Blood mingguan hunter', target: 1, blood: 1150, exp: 60 },
  { id: 'csm-quest-100', type: 'gift', name: 'Pelajari batasan pengiriman item antar player', target: 1, blood: 1300, exp: 70 },

  // KATEGORI: STORY & NARASI
  { id: 'csm-quest-101', type: 'story', name: 'Jalankan kelanjutan babak story arc utama game', target: 1, blood: 3000, exp: 180 },
  { id: 'csm-quest-102', type: 'story', name: 'Selesaikan pertempuran dramatis dalam alur story', target: 2, blood: 6500, exp: 380 },
  { id: 'csm-quest-103', type: 'story replay', name: 'Ulangi misi story arc untuk memutar kenangan lama', target: 1, blood: 2500, exp: 140 },
  { id: 'csm-quest-104', type: 'story replay', name: 'Replay chapter lama untuk menguji batas kekuatan', target: 2, blood: 4800, exp: 280 },
  { id: 'csm-quest-105', type: 'storylist', name: 'Lihat daftar lengkap arc cerita yang tersedia', target: 1, blood: 1500, exp: 80 },
  { id: 'csm-quest-106', type: 'storylist', name: 'Telusuri progress pencapaian babak cerita game', target: 2, blood: 2200, exp: 120 },
  { id: 'csm-quest-107', type: 'ending', name: 'Tentukan pilihan ending pada babak akhir arc 15', target: 1, blood: 10000, exp: 800 },
  { id: 'csm-quest-108', type: 'ending', name: 'Eksplorasi jalur alternatif ending cerita utama', target: 1, blood: 8000, exp: 500 },
  { id: 'csm-quest-109', type: 'story', name: 'Hadapi plot twist menegangkan dalam alur cerita', target: 1, blood: 3500, exp: 200 },
  { id: 'csm-quest-110', type: 'storylist', name: 'Cek daftar babak story yang belum diselesaikan', target: 1, blood: 1600, exp: 85 },
  { id: 'csm-quest-111', type: 'story replay', name: 'Putar ulang momen epik pertarungan dalam cerita', target: 3, blood: 7000, exp: 400 },
  { id: 'csm-quest-112', type: 'story', name: 'Lanjutkan petualangan melewati rintangan story arc', target: 3, blood: 9000, exp: 550 },
  { id: 'csm-quest-113', type: 'ending', name: 'Raih pencapaian akhir dari perjalanan narasi game', target: 1, blood: 12000, exp: 1000 },
  { id: 'csm-quest-114', type: 'storylist', name: 'Analisis urutan kronologi alur cerita permainan', target: 2, blood: 2500, exp: 140 },
  { id: 'csm-quest-115', type: 'story replay', name: 'Tinjau kembali sejarah pertarungan naratif game', target: 1, blood: 2400, exp: 130 },
  { id: 'csm-quest-116', type: 'story', name: 'Selidiki latar belakang musuh dalam babak arc', target: 2, blood: 4500, exp: 260 },
  { id: 'csm-quest-117', type: 'storylist', name: 'Periksa status kelulusan tiap chapter cerita arc', target: 1, blood: 1700, exp: 90 },
  { id: 'csm-quest-118', type: 'story replay', name: 'Simulasikan ulang pertempuran masa lalu arc', target: 2, blood: 4200, exp: 240 },
  { id: 'csm-quest-119', type: 'story', name: 'Taklukkan rintangan narasi tingkat lanjut di game', target: 1, blood: 3800, exp: 215 },
  { id: 'csm-quest-120', type: 'storylist', name: 'Cari tahu jumlah total arc cerita dalam permainan', target: 1, blood: 1450, exp: 75 },

  // KATEGORI: EVENT KHUSUS
  { id: 'csm-quest-121', type: 'event', name: 'Periksa daftar event spesial yang sedang aktif', target: 1, blood: 1800, exp: 95 },
  { id: 'csm-quest-122', type: 'event', name: 'Pantau pembaruan event mingguan pada server', target: 2, blood: 2400, exp: 130 },
  { id: 'csm-quest-123', type: 'event history', name: 'Lihat catatan riwayat event yang telah terpicu', target: 1, blood: 1600, exp: 85 },
  { id: 'csm-quest-124', type: 'event history', name: 'Evaluasi dampak event masa lalu pada akun hunter', target: 2, blood: 2200, exp: 120 },
  { id: 'csm-quest-125', type: 'event makimacall', name: 'Akses informasi panggilan khusus dari Makima', target: 1, blood: 2000, exp: 110 },
  { id: 'csm-quest-126', type: 'event makimacall', name: 'Respons panggilan darurat dari karakter Makima', target: 2, blood: 4200, exp: 240 },
  { id: 'csm-quest-127', type: 'event devilsbargain', name: 'Pelajari info tawaran kontrak misterius Devil', target: 1, blood: 2200, exp: 120 },
  { id: 'csm-quest-128', type: 'event devilsbargain', name: 'Analisis penawaran berbahaya dari pihak iblis', target: 2, blood: 4600, exp: 270 },
  { id: 'csm-quest-129', type: 'event eyesofcontrol', name: 'Cek status pengawasan ketat mata Makima', target: 1, blood: 1900, exp: 100 },
  { id: 'csm-quest-130', type: 'event eyesofcontrol', name: 'Hindari pantauan ketat dari pengawasan kontrol', target: 2, blood: 3800, exp: 210 },
  { id: 'csm-quest-131', type: 'event bloodfrenzy', name: 'Pahami mekanisme aktifnya mode haus darah', target: 1, blood: 2100, exp: 115 },
  { id: 'csm-quest-132', type: 'event bloodfrenzy', name: 'Manfaatkan keuntungan mode mengamuk darah', target: 2, blood: 4400, exp: 250 },
  { id: 'csm-quest-133', type: 'event erasure', name: 'Pelajari protokol sistem perlindungan erasure', target: 1, blood: 2300, exp: 125 },
  { id: 'csm-quest-134', type: 'event erasure', name: 'Tinjau kembali opsi pertahanan erasure data', target: 2, blood: 4000, exp: 230 },
  { id: 'csm-quest-135', type: 'event', name: 'Cek durasi sisa waktu event server yang aktif', target: 1, blood: 1550, exp: 80 },
  { id: 'csm-quest-136', type: 'event history', name: 'Telusuri arsip seluruh event server tercatat', target: 3, blood: 3300, exp: 185 },
  { id: 'csm-quest-137', type: 'event makimacall', name: 'Pelajari aturan main dalam panggilan Makima', target: 1, blood: 1950, exp: 102 },
  { id: 'csm-quest-138', type: 'event devilsbargain', name: 'Kaji risiko dan keuntungan dari tawaran iblis', target: 1, blood: 2150, exp: 115 },
  { id: 'csm-quest-139', type: 'event eyesofcontrol', name: 'Pantau radar area jangkauan mata kontrol', target: 1, blood: 1850, exp: 98 },
  { id: 'csm-quest-140', type: 'event bloodfrenzy', name: 'Siasati durasi aktif dari mode haus darah', target: 1, blood: 2050, exp: 110 },

  // KATEGORI: PVP & VIEW DATABASE
  { id: 'csm-quest-141', type: 'duel', name: 'Lakukan duel uji kekuatan tempur melawan player lain', target: 1, blood: 2500, exp: 140 },
  { id: 'csm-quest-142', type: 'duel', name: 'Tantang hunter lain dalam arena duel taruhan', target: 2, blood: 5000, exp: 280 },
  { id: 'csm-quest-143', type: 'view backstory', name: 'Baca kisah latar belakang (backstory) karakter', target: 1, blood: 1600, exp: 85 },
  { id: 'csm-quest-144', type: 'view backstory', name: 'Bedah riwayat asal-usul perjalanan hunter', target: 2, blood: 3200, exp: 180 },
  { id: 'csm-quest-145', type: 'view title', name: 'Periksa progress perolehan gelar (title) hunter', target: 1, blood: 1750, exp: 92 },
  { id: 'csm-quest-146', type: 'view title', name: 'Kejar target pencapaian title elit hunter', target: 2, blood: 3500, exp: 200 },
  { id: 'csm-quest-147', type: 'view buff', name: 'Lihat daftar buff aktif dan yang belum aktif', target: 1, blood: 1850, exp: 98 },
  { id: 'csm-quest-148', type: 'view buff', name: 'Maksimalkan kombinasi buff untuk bertarung', target: 2, blood: 3700, exp: 210 },
  { id: 'csm-quest-149', type: 'view contract', name: 'Tinjau adegan kontrak yang sudah terbuka', target: 1, blood: 2000, exp: 110 },
  { id: 'csm-quest-150', type: 'view contract', name: 'Koleksi seluruh scene kontrak legendaris', target: 2, blood: 4200, exp: 240 },
  { id: 'csm-quest-151', type: 'view explore', name: 'Cek koleksi cerita explore yang ditemukan', target: 1, blood: 1900, exp: 100 },
  { id: 'csm-quest-152', type: 'view explore', name: 'Lengkapi seluruh temuan cerita eksplorasi', target: 2, blood: 3900, exp: 220 },
  { id: 'csm-quest-153', type: 'view mission', name: 'Lihat arsip cerita mission yang telah diraih', target: 1, blood: 2100, exp: 115 },
  { id: 'csm-quest-154', type: 'view rescue', name: 'Periksa kisah penyelamatan rescue tercatat', target: 1, blood: 2200, exp: 120 },
  { id: 'csm-quest-155', type: 'view character', name: 'Buka ensiklopedia database karakter game', target: 1, blood: 2300, exp: 125 },
  { id: 'csm-quest-156', type: 'view character', name: 'Pelajari seluruh profil karakter dalam game', target: 2, blood: 4500, exp: 260 },
  { id: 'csm-quest-157', type: 'view database', name: 'Akses database global ensiklopedia Devil', target: 1, blood: 2400, exp: 130 },
  { id: 'csm-quest-158', type: 'view database', name: 'Telusuri variasi jenis iblis di database', target: 2, blood: 4800, exp: 280 },
  { id: 'csm-quest-159', type: 'view mission', name: 'Evaluasi hasil pencapaian arsip misi hunter', target: 2, blood: 3600, exp: 205 },
  { id: 'csm-quest-160', type: 'view rescue', name: 'Tinjau ulang rekam jejak operasi penyelamatan', target: 2, blood: 3800, exp: 215 },

  // KATEGORI: RAID BOSS
  { id: 'csm-quest-161', type: 'raid', name: 'Periksa informasi boss raid harian yang aktif', target: 1, blood: 2500, exp: 140 },
  { id: 'csm-quest-162', type: 'raid', name: 'Analisis kekuatan boss raid tingkat tinggi', target: 2, blood: 5000, exp: 300 },
  { id: 'csm-quest-163', type: 'raid team', name: 'Lihat daftar anggota skuad dalam lobi raid', target: 1, blood: 2200, exp: 120 },
  { id: 'csm-quest-164', type: 'raid team', name: 'Koordinasi formasi skuad penyerang raid', target: 2, blood: 4500, exp: 260 },
  { id: 'csm-quest-165', type: 'raid list', name: 'Lihat daftar musuh boss raid berbahaya', target: 1, blood: 2400, exp: 130 },
  { id: 'csm-quest-166', type: 'raid list', name: 'Pelajari karakteristik khusus tiap boss raid', target: 2, blood: 4800, exp: 280 },
  { id: 'csm-quest-167', type: 'raid history', name: 'Tinjau riwayat keberhasilan pertempuran raid', target: 1, blood: 2600, exp: 145 },
  { id: 'csm-quest-168', type: 'raid history', name: 'Evaluasi pencapaian rekor damage raid', target: 2, blood: 5200, exp: 310 },
  { id: 'csm-quest-169', type: 'raid', name: 'Pantau rotasi kemunculan boss raid mingguan', target: 2, blood: 4600, exp: 270 },
  { id: 'csm-quest-170', type: 'raid team', name: 'Periksa kesiapan formasi anggota tim raid', target: 1, blood: 2350, exp: 128 },
  { id: 'csm-quest-171', type: 'raid list', name: 'Telusuri daftar boss raid tingkat kesulitan tinggi', target: 1, blood: 2700, exp: 150 },
  { id: 'csm-quest-172', type: 'raid history', name: 'Koleksi catatan prestasi pertempuran raid', target: 2, blood: 4900, exp: 290 },
  { id: 'csm-quest-173', type: 'raid', name: 'Evaluasi total damage pertempuran raid bos', target: 1, blood: 2800, exp: 160 },
  { id: 'csm-quest-174', type: 'raid team', name: 'Sinkronisasi strategi penyerangan bersama tim', target: 1, blood: 2550, exp: 142 },
  { id: 'csm-quest-175', type: 'raid list', name: 'Cek kelemahan elemen dari para boss raid', target: 1, blood: 2450, exp: 135 },
  { id: 'csm-quest-176', type: 'raid history', name: 'Analisis perolehan loot dari riwayat raid', target: 1, blood: 2650, exp: 148 },
  { id: 'csm-quest-177', type: 'raid', name: 'Simulasikan pertempuran melawan boss raid', target: 2, blood: 5100, exp: 305 },
  { id: 'csm-quest-178', type: 'raid team', name: 'Cek daftar kehadiran anggota tim raid', target: 2, blood: 4700, exp: 275 },
  { id: 'csm-quest-179', type: 'raid list', name: 'Pelajari pola serangan boss raid legendaris', target: 2, blood: 5300, exp: 320 },
  { id: 'csm-quest-180', type: 'raid history', name: 'Arsipkan pencapaian rekor tercepat kill raid', target: 1, blood: 2900, exp: 165 },

  // KATEGORI: VARIASI TAMBAHAN COMMAND INTI
  { id: 'csm-quest-181', type: 'profile', name: 'Perbarui informasi status biodata hunter di profil', target: 1, blood: 1150, exp: 58 },
  { id: 'csm-quest-182', type: 'stats', name: 'Cek ulang persentase buff aktif pada menu stats', target: 1, blood: 1300, exp: 65 },
  { id: 'csm-quest-183', type: 'about', name: 'Cek detail pengembang dan statistik server game', target: 1, blood: 920, exp: 46 },
  { id: 'csm-quest-184', type: 'nickname', name: 'Ubah julukan nama hunter agar terlihat elegan', target: 1, blood: 1550, exp: 82 },
  { id: 'csm-quest-185', type: 'cooldown', name: 'Pastikan seluruh command siap digunakan kembali', target: 1, blood: 880, exp: 44 },
  { id: 'csm-quest-186', type: 'gallery', name: 'Tinjau ulang arsip gambar gallery favorit', target: 1, blood: 1380, exp: 72 },
  { id: 'csm-quest-187', type: 'tutorial', name: 'Baca ulang tips dan trik dasar permainan hunter', target: 1, blood: 1480, exp: 78 },
  { id: 'csm-quest-188', type: 'location', name: 'Cari titik lokasi strategis untuk penyergapan', target: 1, blood: 1250, exp: 65 },
  { id: 'csm-quest-189', type: 'job list', name: 'Analisis peluang lowongan pekerjaan harian', target: 1, blood: 1350, exp: 70 },
  { id: 'csm-quest-190', type: 'job', name: 'Tinjau rekam jejak pekerjaan yang sudah diambil', target: 1, blood: 1200, exp: 60 },
  { id: 'csm-quest-191', type: 'job info', name: 'Cek detail ketentuan gaji pekerjaan paruh waktu', target: 1, blood: 1300, exp: 68 },
  { id: 'csm-quest-192', type: 'shop', name: 'Kunjungi etalase utama pusat perbelanjaan toko', target: 1, blood: 1100, exp: 55 },
  { id: 'csm-quest-193', type: 'shop item', name: 'Cek ketersediaan item penunjang bertahan hidup', target: 1, blood: 1250, exp: 65 },
  { id: 'csm-quest-194', type: 'storylist', name: 'Lihat daftar keseluruhan babak kisah cerita arc', target: 1, blood: 1400, exp: 72 },
  { id: 'csm-quest-195', type: 'event', name: 'Pantau jadwal kedatangan event spesial server', target: 1, blood: 1650, exp: 88 },
  { id: 'csm-quest-196', type: 'view', name: 'Akses menu navigasi direktori database player', target: 1, blood: 1320, exp: 68 },
  { id: 'csm-quest-197', type: 'raid', name: 'Cek jadwal kemunculan boss raid harian server', target: 1, blood: 2100, exp: 115 },
  { id: 'csm-quest-198', type: 'command', name: 'Hafalkan daftar command penting dalam permainan', target: 1, blood: 1100, exp: 58 },
  { id: 'csm-quest-199', type: 'inv', name: 'Cek kapasitas ruang penyimpanan barang di tas', target: 2, blood: 1500, exp: 78 },
  { id: 'csm-quest-200', type: 'quest', name: 'Selesaikan rangkaian target quest harian hunter', target: 3, blood: 2500, exp: 140 }
];


const RAID_RANK_WEIGHTS = { E: 1, D: 2, C: 4, B: 7, A: 12, S: 22, SS: 35, SSS: 50 }

const JOB_WORK_STORIES = {
  'Public Safety Devil Hunter': ['Briefing darurat masuk dari HQ.', 'Kamu menyisir TKP sebelum warga dievakuasi.', 'Laporan serangan Devil harus selesai sebelum malam.', 'Regu kamu menjaga perimeter markas.', 'Kamu mengawal barang bukti ke laboratorium.', 'Sirene memanggilmu ke distrik berikutnya.', 'Kamu memeriksa kontrak lama yang disita.', 'Satu regu baru meminta bantuanmu.', 'Kamu membersihkan sisa-sisa pertempuran.', 'HQ mencatat operasi hari ini berhasil.'],
  'Private Devil Hunter': ['Klien anonim mengirim alamat sebuah gudang.', 'Kamu menawar bayaran sebelum menerima pekerjaan.', 'Jejak darah membawa kamu ke gang sempit.', 'Kamu menjaga toko dari Devil kecil.', 'Seorang keluarga meminta pencarian orang hilang.', 'Kamu menjual laporan ke pemburu lain.', 'Peralatanmu diperiksa sebelum berangkat.', 'Kamu mengikuti suara aneh dari atap.', 'Kontrak singkat selesai tanpa korban.', 'Nama kamu mulai dikenal di pasar swasta.'],
  'Devil Hunter High School Student': ['Klub sekolah mengadakan patroli sore.', 'Guru meminta laporan tentang suara dari gudang.', 'Kamu mengamankan ruang klub sebelum pulang.', 'Teman sekelas menemukan jejak aneh di lorong.', 'Latihan klub berubah menjadi misi sungguhan.', 'Kamu menyembunyikan senjata sebelum pelajaran dimulai.', 'Rapat klub membahas Devil di sekitar sekolah.', 'Kamu menolong siswa yang tersesat di gedung lama.', 'Papan pengumuman memuat peringatan baru.', 'Bel pulang berbunyi setelah tugas selesai.'],
  'Yakuza / Mafia Member': ['Bos mengirim kamu menagih utang di distrik bawah.', 'Kamu menjaga transaksi organ Devil.', 'Gudang sindikat perlu dibersihkan malam ini.', 'Seseorang membocorkan rute pengiriman.', 'Kamu mengawal barang berbahaya melewati kota.', 'Anak buah baru meminta arahan.', 'Kamu menyelesaikan perselisihan antar kelompok.', 'Peti kontrak ilegal tiba di pelabuhan.', 'Bos menilai hasil kerja kamu malam ini.', 'Nama sindikat tetap aman berkat tindakanmu.'],
  'International Assassin': ['Kontak asing memberimu foto target.', 'Kamu mengganti identitas sebelum memasuki Tokyo.', 'Hotel menjadi titik temu yang terlalu sunyi.', 'Target berpindah lewat jalur bawah tanah.', 'Kamu memeriksa senjata dan rute pelarian.', 'Seseorang membuntuti kamu sejak stasiun.', 'Bayaran dikirim melalui rekening rahasia.', 'Kamu menyamar sebagai pekerja lokal.', 'Kontrak selesai sebelum polisi tiba.', 'Kamu menghilang dari peta kota.'],
  'Government Agent': ['Rapat rahasia membahas ancaman tingkat tinggi.', 'Kamu menandatangani izin evakuasi satu distrik.', 'Berkas kontrak Devil masuk ke meja kamu.', 'Kamu menghubungi pasukan cadangan.', 'Saksi penting dipindahkan ke lokasi aman.', 'Kamu menyaring laporan yang dirahasiakan.', 'Keputusan politik menentukan nasib para Hunter.', 'Kamu mengamankan dokumen dari markas lama.', 'Perintah baru datang dari kementerian.', 'Krisis hari ini masuk ke arsip negara.'],
  'Chainsaw Man Church Leader': ['Jemaat berkumpul mendengar pidato malam.', 'Kamu membagikan selebaran di pusat kota.', 'Rapat rahasia membahas kemunculan Chainsaw Man.', 'Sumbangan darah masuk ke gudang gereja.', 'Pengikut baru meminta tanda kepercayaan.', 'Kamu mengatur penjagaan di sekitar gereja.', 'Pesan propaganda disebarkan ke sekolah.', 'Seorang saksi membawa kabar dari markas Public Safety.', 'Kamu menenangkan massa setelah serangan Devil.', 'Rencana gereja bergerak ke tahap berikutnya.'],
  'Fiend / Hybrid Combatant': ['Naluri Devil membawamu ke bau darah.', 'Kamu menguji batas tubuh inangmu.', 'Senjata tubuhmu harus dikendalikan di tengah kota.', 'Regu lain meminta bantuan tempur.', 'Kamu memulihkan diri sebelum patroli berikutnya.', 'Kontrak lama berbisik dari dalam tubuhmu.', 'Kamu mengejar Devil yang kabur dari laboratorium.', 'Warga panik saat melihat wujudmu.', 'Pertarungan singkat meninggalkan bekas di jalan.', 'Kamu kembali sebelum naluri mengambil alih.']
}

const ERASURE_BACKSTORIES = {
  makima: '👁️ Rantai kendali Makima mengikat pilihanmu. Setiap perintahnya terdengar seperti suara dari dalam kepalamu.',
  yoru: '⚔️ Yoru menandai namamu sebagai miliknya. Perang menjadikan setiap luka dan senjata bagian dari kekuatanmu.',
  fami: '🍽️ Fami mencatatmu sebagai persediaan hidup. Kelaparan menjadi alasanmu untuk tetap berjalan melewati bencana.',
  nayuta: '🐕 Nayuta mengikatmu dengan janji rumah dan perlindungan. Kamu dipanggil pulang, tetapi tidak pernah benar-benar bebas.',
  death: '💀 Death Devil menuliskan namamu di antara jiwa yang tersesat. Kematian akan selalu mengenalmu.'
}

const ITEM_COMMENTS = [
  '🧰 Kamu memasukkan barang ini ke tas. Mungkin akan berguna nanti.',
  '🧲 Benda ini terlihat biasa, tapi jangan remehkan kegunaannya.',
  '🫧 Kamu membersihkannya sebelum menyimpannya dengan rapi.',
  '🧤 Tidak terlalu spesial, tapi tetap bisa membantu perjalananmu.',
  '🛡️ Kamu menemukan tempat aman untuk menyimpan barang ini.',
  '👃 Aromanya cukup aneh, namun masih layak dibawa.',
  '🔎 Kamu memeriksa barang ini sebelum mengambil keputusan.',
  '🧵 Peralatan lama yang masih memiliki sedikit nilai.',
  '📦 Kamu membungkusnya agar tetap terlindungi dalam perjalanan.',
  '🧭 Barang kecil seperti ini terkadang punya peran besar.',
  '⚙️ Kamu memperbaiki sedikit bagian yang rusak sebelum menyimpannya.',
  '🎒 Kamu menambahkan barang ini ke dalam inventory.',
  '🕵️ Kamu menemukan sesuatu yang mungkin berguna di masa depan.',
  '🪙 Tidak berharga tinggi, tapi tetap bisa dimanfaatkan.',
  '🔥 Kamu menyimpannya karena firasatmu mengatakan itu berguna.',
  '🧪 Kamu tidak tahu kegunaannya, tapi memilih untuk membawanya.',
  '📜 Ada sesuatu yang menarik dari barang ini.',
  '🔦 Kamu membersihkannya dari debu yang menempel.',
  '🧱 Bentuknya sederhana, namun terlihat cukup kuat.',
  '🪛 Kamu menyimpan alat ini untuk keadaan darurat.',
  '🌙 Barang ini terlihat biasa di malam hari.',
  '🗝️ Mungkin benda ini bisa membuka sesuatu nantinya.',
  '🧳 Kamu memasukkannya dengan hati-hati ke dalam tas.',
  '💼 Barang bekas yang masih memiliki fungsi.',
  '🧯 Kamu mengambilnya sebagai persiapan menghadapi bahaya.',
  '📍 Kamu menandai barang ini agar mudah ditemukan lagi.',
  '🧬 Ada sesuatu yang terasa berbeda dari benda ini.',
  '🧶 Kamu merapikan barang ini sebelum menyimpannya.',
  '🪶 Ringan dibawa dan mungkin berguna kapan saja.',
  '🛠️ Kamu melihat potensi tersembunyi dari barang ini.',
  '🧱 Walau terlihat tua, kondisinya masih cukup baik.',
  '📡 Kamu menyimpan benda ini untuk berjaga-jaga.',
  '🧼 Kamu membersihkan kotorannya lalu memasukkannya ke tas.',
  '🧩 Kamu belum tahu kegunaannya, tetapi tetap mengambilnya.',
  '🧲 Barang ini menarik perhatianmu karena bentuknya unik.',
  '📦 Kamu memastikan barang ini tidak hilang selama perjalanan.',
  '🧠 Kamu mencoba memahami fungsi benda yang ditemukan.',
  '🌫️ Barang ini ditemukan di tempat yang tidak biasa.',
  '🔧 Kamu merasa benda ini masih bisa diperbaiki.',
  '🪵 Sederhana, kuat, dan mungkin berguna saat diperlukan.',
  '🛒 Kamu mengambilnya tanpa berpikir terlalu lama.',
  '💡 Sebuah penemuan kecil yang mungkin membawa keuntungan.',
  '🧿 Kamu menyimpan barang ini karena terasa berbeda.',
  '🚪 Mungkin benda ini memiliki kegunaan yang belum diketahui.',
  '🗃️ Kamu menyimpannya bersama barang penting lainnya.',
  '🧭 Perjalanan panjang membutuhkan persiapan seperti ini.',
  '⚠️ Kamu tidak yakin apa fungsinya, tapi tetap membawanya.',
  '🏕️ Barang ini cocok untuk membantu bertahan di perjalanan.',
  '🔍 Kamu menemukan detail kecil yang sebelumnya terlewat.',
  '📋 Kamu mencatat barang ini sebelum memasukkannya ke koleksi.',
  '🎒 Satu barang tambahan tidak akan membuat perjalanan lebih berat.'
]

const PARTNER_REACTIONS = {
win: [
  // 1 kata (5)
  'Menang.', 'Hebat.', 'Mantap.', 'Berhasil.', 'Selesai.',

  // 2 kata (20)
  'Kerja bagus.', 'Musuh kalah.', 'Serangan tepat.', 'Target jatuh.', 'Pertarungan selesai.',
  'Sangat bagus.', 'Bagus sekali.', 'Hasil sempurna.', 'Kita menang.', 'Lawan tumbang.',
  'Akhir bagus.', 'Langkah tepat.', 'Serangan bersih.', 'Kondisi aman.', 'Situasi terkendali.',
  'Misi berhasil.', 'Pertarungan berakhir.', 'Kemenangan mutlak.', 'Kau hebat.', 'Gerakan bagus.',

  // 3 kata (5)
  'Seranganmu sangat bagus.', 'Kerja tim luar biasa.', 'Musuh tidak berkutik.', 'Kemenangan sudah pasti.', 'Pertarungan berjalan lancar.',

  // 4 kata (20)
  'Kita berhasil mengalahkan mereka.', 'Kerja sama kita sangat bagus.', 'Musuh terakhir sudah tumbang.', 'Pertarungan ini berjalan sempurna.',
  'Kau melakukan pekerjaan hebat.', 'Hasil akhirnya sangat memuaskan.', 'Kita keluar sebagai pemenang.',
  'Serangan terakhir sangat menentukan.', 'Semua berjalan sesuai rencana.', 'Tidak ada masalah kali ini.',
  'Kemenangan ini berkat kerja keras.', 'Kita menguasai medan pertarungan.', 'Musuh tidak punya kesempatan lagi.',
  'Pertarungan berat berhasil dilewati.', 'Aku bangga dengan hasil ini.', 'Langkah kita sangat efektif.',
  'Kau menunjukkan kemampuan luar biasa.', 'Semua ancaman sudah berhasil hilang.', 'Ini kemenangan yang pantas diraih.',
  'Perjuangan kita akhirnya membuahkan hasil.'
],

lose: [
  // 1 kata (5)
  'Kalah.', 'Terluka.', 'Gagal.', 'Hancur.', 'Mundur.',

  // 2 kata (20)
  'Belum selesai.', 'Coba lagi.', 'Tetap bertahan.', 'Jangan menyerah.', 'Aku terluka.',
  'Musuh kuat.', 'Masih hidup.', 'Nyaris kalah.', 'Butuh bantuan.', 'Kita mundur.',
  'Belum berakhir.', 'Tetap berdiri.', 'Aku bertahan.', 'Luka parah.', 'Hampir tumbang.',
  'Keadaan buruk.', 'Masih bisa.', 'Jaga diri.', 'Perlu istirahat.', 'Cari kesempatan.',

  // 3 kata (5)
  'Kita belum kalah.', 'Aku masih bertahan.', 'Musuh terlalu kuat.', 'Pertarungan sangat berat.', 'Kesempatan masih ada.',

  // 4 kata (20)
  'Kita harus mencoba lagi.', 'Pertarungan ini belum berakhir.', 'Aku masih bisa bertarung.',
  'Musuh terlalu kuat kali ini.', 'Jangan biarkan harapan hilang.', 'Kita masih punya kesempatan.',
  'Aku akan kembali membantu.', 'Kondisi kita sangat buruk.', 'Luka ini tidak masalah.',
  'Pertahanan kita mulai runtuh.', 'Kita perlu strategi baru.', 'Serangan tadi terlalu berbahaya.',
  'Aku percaya pada kemampuanmu.', 'Jangan menyerah sekarang juga.', 'Masih ada jalan keluar.',
  'Kita harus bertahan lebih lama.', 'Pertarungan berikutnya akan berbeda.',
  'Aku akan tetap bersamamu.', 'Kekalahan ini bukan akhir.', 'Kita bangkit setelah ini.'
],

run: [
  // 1 kata (5)
  'Lari.', 'Cepat.', 'Mundur.', 'Bertahan.', 'Kabur.',

  // 2 kata (20)
  'Cari aman.', 'Jangan berhenti.', 'Terus bergerak.', 'Lewat sini.', 'Pergi sekarang.',
  'Tetap hidup.', 'Jauh dulu.', 'Cepat pergi.', 'Ayo mundur.', 'Hindari mereka.',
  'Sembunyi dulu.', 'Jaga jarak.', 'Cari perlindungan.', 'Belum aman.', 'Tarik diri.',
  'Keluar segera.', 'Ikuti aku.', 'Bergerak cepat.', 'Tetap waspada.', 'Hindari serangan.',

  // 3 kata (5)
  'Kita harus pergi.', 'Jangan lihat belakang.', 'Musuh terlalu dekat.', 'Cari tempat aman.', 'Waktu kita sedikit.',

  // 4 kata (20)
  'Kita harus mundur sekarang.', 'Jangan biarkan mereka mengejar.', 'Pergi sebelum terlambat.',
  'Aku akan menahan mereka.', 'Tetap bergerak jangan berhenti.', 'Kita belum cukup kuat.',
  'Cari jalan keluar lain.', 'Musuh semakin mendekat cepat.', 'Kita butuh waktu tambahan.',
  'Jangan ambil risiko sekarang.', 'Ikuti jalanku dan cepat.',
  'Pertarungan ini terlalu berbahaya.', 'Kita harus selamat dulu.',
  'Aku lindungi bagian belakang.', 'Keluar dari area ini segera.',
  'Jangan kembali sebelum aman.', 'Kita perlu menyusun rencana.',
  'Tetap hidup sampai bantuan datang.', 'Bahaya masih ada di depan.',
  'Lari sebelum semuanya terlambat.'
],

neutral: [
  // 1 kata (5)
  'Siap.', 'Tenang.', 'Baik.', 'Paham.', 'Catat.',

  // 2 kata (20)
  'Aku ikut.', 'Tetap fokus.', 'Aman dulu.', 'Jaga posisi.', 'Aku siap.',
  'Tetap waspada.', 'Lanjut terus.', 'Aku mengawasi.', 'Di sini.', 'Bisa dilakukan.',
  'Aku mengerti.', 'Tetap tenang.', 'Perhatikan sekitar.', 'Jalan perlahan.', 'Aku membantu.',
  'Sudah aman.', 'Tetap maju.', 'Siap bertarung.', 'Aku menunggu.', 'Kita jalan.',

  // 3 kata (5)
  'Aku tetap disini.', 'Kita lanjutkan perjalanan.', 'Tetap jaga keadaan.', 'Aku siap membantu.', 'Semuanya masih terkendali.',

  // 4 kata (20)
  'Aku akan terus mengawasi.', 'Kita tetap harus waspada.', 'Situasi masih dalam kendali.',
  'Aku siap mengikuti langkahmu.', 'Tidak ada masalah sejauh ini.',
  'Kita lanjutkan rencana sebelumnya.', 'Aku berada di sampingmu.',
  'Tetap perhatikan keadaan sekitar.', 'Aku akan membantu sebisaku.',
  'Semuanya berjalan dengan normal.', 'Kita tunggu kesempatan berikutnya.',
  'Aku siap kapan saja.', 'Jangan kehilangan fokus sekarang.',
  'Kita bergerak sesuai rencana.', 'Aku akan tetap mendukungmu.',
  'Perjalanan ini masih panjang.', 'Kondisi terlihat cukup aman.',
  'Kita bisa menghadapi semuanya.', 'Tetap lakukan yang terbaik.',
  'Aku percaya pada keputusanmu.'
]
}

const TERROR_SUCCESS_STORIES = [
  '🌑 Kota terdiam setelah malam panjang. Kontrakmu tumbuh dari ketakutan yang tersisa.',
  '🩸 Tidak ada saksi yang berani bicara. Kamu kembali sebelum matahari terbit.',
  '⛓️ Kekuatan kontrak mengambil alih sesaat. Saat semuanya selesai, hanya kehancuran tersisa.',
  '👁️ Kamu muncul dari bayangan dan membawa rasa takut yang baru.',
  '🏙️ Satu wilayah berubah sunyi setelah kontrakmu menunjukkan kekuatannya.',
  '🔪 Gang sempit menjadi tempat terakhir yang melihat keberanian musuhmu.',
  '🚨 Suara alarm terdengar jauh. Kamu sudah pergi sebelum bantuan tiba.',
  '🩸 Ketakutan memenuhi udara dan berubah menjadi kekuatan dalam tubuhmu.',
  '🌃 Malam itu menjadi legenda buruk yang tidak ingin diingat siapa pun.',
  '😈 Kontrakmu puas. Harga yang dibayar cukup untuk menyelamatkan nyawamu.',
  '🌘 Bayanganmu melewati kota tanpa meninggalkan apa pun selain rasa takut.',
  '💀 Musuh terakhir jatuh, dan kontrakmu kembali diam di dalam tubuhmu.',
  '🔥 Kamu mengaktifkan kekuatan penuh dan mengakhiri perburuan dengan cepat.',
  '🕷️ Rasa panik menyebar lebih cepat daripada langkah kakimu.',
  '⚔️ Pertarungan sengit berakhir dengan kemenangan di pihakmu.',
  '🌫️ Kabut malam menyembunyikan jejak pertempuran yang baru terjadi.',
  '🩸 Darah menjadi bukti bahwa kontrakmu bukan ancaman biasa.',
  '👤 Tidak ada yang tahu bagaimana kamu menang malam ini.',
  '🏚️ Tempat itu kosong ketika kamu meninggalkannya tanpa suara.',
  '🔦 Cahaya terakhir padam saat kekuatanmu mencapai batasnya.',
  '🌙 Malam menjadi saksi ketika kamu menyelesaikan tugas berbahaya.',
  '🗡️ Satu ayunan cukup untuk mengubah seluruh keadaan.',
  '🧟 Ketakutan mereka menjadi makanan bagi kekuatan kontrakmu.',
  '🪦 Nama para korban hanya tersisa sebagai cerita lama.',
  '🕯️ Kota kembali tenang, tapi trauma masih tertinggal.',
  '🌑 Kamu berjalan pulang sementara dunia masih mencoba memahami kejadian itu.',
  '💢 Tekanan besar berubah menjadi kemenangan yang tidak terduga.',
  '👁️ Semua mata tertuju padamu setelah kejadian malam tersebut.',
  '🏃 Mereka mencoba melarikan diri, tetapi terlambat menyadari kekuatanmu.',
  '🔥 Kontrakmu meminta bayaran mahal, namun hasilnya sepadan.',
  '🩶 Jejak pertempuran menghilang, tetapi rasa takut tetap ada.',
  '⚰️ Tempat itu menjadi pengingat kekuatan yang pernah muncul.',
  '🌌 Di bawah langit gelap, kamu menyelesaikan misi tanpa ragu.',
  '🩸 Kemenanganmu meninggalkan cerita yang terus dibicarakan.',
  '🔗 Ikatan dengan kontrak semakin kuat setelah pertarungan itu.',
  '🏙️ Warga hanya menemukan kehancuran setelah semuanya selesai.',
  '🦴 Lawanmu tidak sempat memahami apa yang menyerangnya.',
  '🌪️ Kekuatan kontrak meledak dan mengakhiri perlawanan terakhir.',
  '🧿 Kamu kembali membawa pengalaman yang tidak akan terlupakan.',
  '🕳️ Tempat persembunyian musuh berubah menjadi kuburan sunyi.',
  '⚡ Serangan cepatmu membuat semua rencana lawan runtuh.',
  '🌒 Tidak ada yang menyangka kamu bisa melewati malam itu.',
  '🩹 Luka yang kamu dapatkan menjadi bukti perjuanganmu.',
  '👑 Setelah kejadian itu, namamu mulai dikenal sebagai Hunter berbahaya.',
  '🧨 Ledakan kekuatanmu mengubah jalannya pertarungan dalam sekejap.',
  '🖤 Kontrakmu tersenyum karena berhasil memenuhi kesepakatan.',
  '🌧️ Hujan turun setelah pertempuran besar yang baru berakhir.',
  '🔪 Kamu meninggalkan lokasi tanpa menoleh kembali.',
  '📖 Cerita kemenanganmu mulai menyebar dari mulut ke mulut.',
  '🌑 Kota selamat, tetapi ketakutan baru telah lahir.'
]

const TERROR_DEATH_STORIES = [
  '💀 Seorang Devil Hunter membaca gerakanmu. Pertarungan berakhir sebelum kamu sempat melawan.',
  '🥃 Pemburu berpengalaman menemukan kelemahanmu dan menghentikan langkah terakhirmu.',
  '🚔 Public Safety mengepung lokasi persembunyianmu tanpa memberi kesempatan kabur.',
  '⚔️ Hunter yang kamu hadapi jauh lebih siap. Kontrakmu gagal menyelamatkanmu.',
  '🚨 Suara sirene mendekat. Pasukan pemburu datang sebelum kekuatanmu aktif.',
  '🩸 Kamu memilih musuh yang salah. Harga kesalahan itu dibayar dengan nyawamu.',
  '🔫 Serangan pertama gagal, tetapi serangan berikutnya mengakhiri perlawananmu.',
  '🌧️ Hujan turun ketika tubuhmu akhirnya tidak mampu berdiri lagi.',
  '⛓️ Kontrakmu meminta lebih banyak, tetapi tubuhmu tidak sanggup membayar.',
  '💥 Kamu terjebak dalam pertarungan tanpa jalan keluar sampai semuanya berakhir.',
  '🌑 Bayangan yang melindungimu hilang ketika Hunter menemukan posisimu.',
  '🗡️ Satu kesalahan kecil membuat pertarungan berubah menjadi kekalahan.',
  '👁️ Lawanmu membaca pola seranganmu dan menghancurkan pertahanan terakhir.',
  '🏙️ Kota menjadi saksi jatuhnya seorang pemburu yang terlalu percaya diri.',
  '🔥 Kamu menggunakan seluruh kekuatan, tetapi musuh masih berdiri.',
  '🩶 Luka bertambah parah hingga tubuhmu tidak mampu melanjutkan.',
  '⚰️ Kontrakmu tetap diam saat kehidupan perlahan meninggalkan tubuhmu.',
  '🕷️ Devil yang kamu lawan ternyata jauh lebih mengerikan dari perkiraan.',
  '🚧 Jalan keluar tertutup. Para Hunter datang dari segala arah.',
  '🌫️ Kabut menutupi pandanganmu sebelum serangan terakhir datang.',
  '💢 Keputusan terburu-buru membuatmu kehilangan kesempatan menang.',
  '🔦 Cahaya terakhir terlihat sebelum semuanya menjadi gelap.',
  '🪦 Tempat itu menjadi akhir dari perjalananmu sebagai Hunter.',
  '⚡ Kecepatan musuh terlalu tinggi untuk kamu hindari.',
  '🩸 Kamu bertahan selama mungkin, tetapi tubuhmu akhirnya menyerah.',
  '🏚️ Markas persembunyianmu ditemukan dan dihancurkan oleh pemburu.',
  '🧨 Kekuatan besar yang kamu keluarkan kembali menghancurkan dirimu sendiri.',
  '🌙 Malam itu menjadi saksi kekalahan terakhir yang tidak terlupakan.',
  '👤 Kamu melihat musuh mendekat, tetapi sudah terlambat untuk bergerak.',
  '🖤 Kontrakmu memberikan kekuatan, namun tidak cukup untuk kemenangan.',
  '🔗 Ikatan dengan kontrak melemah saat nyawamu berada di ujung batas.',
  '⚔️ Duel terakhir berlangsung singkat dan berakhir dengan kekalahanmu.',
  '🌧️ Tidak ada yang tersisa selain jejak pertarungan di bawah hujan.',
  '🩹 Luka kecil berubah menjadi akhir karena kamu terus memaksakan diri.',
  '🧟 Kamu meremehkan lawan dan membayar kesalahan itu dengan mahal.',
  '🚪 Pintu terakhir menuju keselamatan tertutup sebelum kamu mencapainya.',
  '💀 Para Hunter menemukanmu sebelum rencana pelarian berhasil.',
  '🔥 Api pertempuran padam bersama harapan untuk bertahan hidup.',
  '🌪️ Kekuatan musuh menghancurkan pertahanan terakhir yang kamu miliki.',
  '🕯️ Cahaya kehidupanmu perlahan hilang di tengah pertarungan.',
  '📍 Lokasimu terbongkar dan pengejaran berakhir tragis.',
  '🗡️ Serangan terakhir musuh menjadi akhir dari perjuanganmu.',
  '🌌 Langit malam melihat bagaimana seorang Hunter akhirnya tumbang.',
  '🩸 Darahmu menjadi bukti bahwa musuh kali ini terlalu kuat.',
  '🏴 Para pemburu mencatat namamu sebagai korban pertarungan.',
  '⚠️ Kamu terlambat menyadari bahwa ini bukan lawan biasa.',
  '🧿 Kontrakmu mencoba membantu, tetapi hasil akhirnya tetap sama.',
  '🚨 Bantuan datang terlambat ketika tubuhmu sudah tidak bergerak.',
  '🕳️ Kamu jatuh dalam kegelapan tanpa kesempatan untuk bangkit.',
  '📖 Kisahmu berakhir sebagai peringatan bagi Hunter lainnya.'
]

const CONTRACT_SCENES = [
  '⛓️ Ruang kontrak terasa sunyi. Kamu membawa Blood sebagai pembayaran untuk mendapatkan kekuatan baru.',
  '⛓️ Pintu besi terbuka perlahan. Dari dalam, suara Devil menunggu keputusan yang akan mengubah hidupmu.',
  '⛓️ Sebuah meja ritual telah disiapkan. Darahmu menjadi bukti bahwa kamu siap menerima konsekuensinya.',
  '⛓️ Penjaga kontrak membaca aturan terakhir sebelum kekuatan asing diberikan kepadamu.',
  '⛓️ Udara menjadi berat saat segel lama mulai terbuka di hadapanmu.',
  '⛓️ Kamu berdiri di depan altar gelap dengan Blood sebagai penawaran terakhir.',
  '⛓️ Dokumen kontrak bergerak sendiri. Sebuah nama baru akan tercatat malam ini.',
  '⛓️ Rantai besar dilepas dari pintu kuno. Sesuatu di baliknya mulai memperhatikanmu.',
  '⛓️ Petugas menyerahkan lembar kontrak. Setiap kekuatan memiliki harga yang tidak bisa dihindari.',
  '⛓️ Suara rendah terdengar dari ruangan gelap. Devil itu akhirnya menerima kehadiranmu.',
  '⛓️ Cahaya merah memenuhi ruangan ketika ritual kontrak mulai berjalan.',
  '⛓️ Kamu menaruh Blood di altar dan menunggu jawaban dari makhluk di hadapanmu.',
  '⛓️ Sebuah segel retak perlahan. Kekuatan lama mulai mencari pemilik baru.',
  '⛓️ Para penjaga menjauh dari ruangan karena kontrak akan segera dimulai.',
  '⛓️ Nama Devil dipanggil dalam ritual. Kini hanya kesepakatan yang tersisa.',
  '⛓️ Lorong gelap membawa kamu menuju tempat para Hunter membuat perjanjian.',
  '⛓️ Kamu memasuki ruangan tanpa cahaya. Hanya kontrak dan Blood yang menemanimu.',
  '⛓️ Tulisan merah muncul di halaman kosong saat tanganmu menyentuh dokumen tersebut.',
  '⛓️ Sebuah suara bertanya tentang harga yang rela kamu bayar demi kekuatan.',
  '⛓️ Pintu ruang kontrak terkunci. Tidak ada jalan kembali setelah pilihan dibuat.',
  '⛓️ Aroma besi memenuhi udara ketika Blood mulai bereaksi dengan segel Devil.',
  '⛓️ Sebuah bayangan muncul di balik kaca. Ia menunggu tawaran yang cukup menarik.',
  '⛓️ Kamu melihat daftar kontrak lama sebelum memilih kekuatan yang akan dipanggil.',
  '⛓️ Ruangan bawah tanah bergetar ketika energi Devil mulai muncul.',
  '⛓️ Penjaga tua memberikan peringatan terakhir sebelum kontrak disahkan.',
  '⛓️ Kamu menekan tangan ke altar. Perjanjian baru mulai terbentuk.',
  '⛓️ Suara rantai bergema saat Devil perlahan keluar dari segel.',
  '⛓️ Blood yang terkumpul akhirnya digunakan untuk membuka kesempatan baru.',
  '⛓️ Kontrak kuno menunggu seseorang yang cukup berani untuk menggunakannya.',
  '⛓️ Kamu berjalan melewati arsip lama tempat nama para Hunter tercatat.',
  '⛓️ Sebuah lingkaran ritual menyala dan menarik perhatian entitas di dalamnya.',
  '⛓️ Devil di balik pintu menawarkan kekuatan dengan senyum yang tidak manusiawi.',
  '⛓️ Kamu membaca isi kontrak dengan hati-hati sebelum memberikan persetujuan.',
  '⛓️ Lampu ruangan berkedip ketika energi asing mulai memenuhi tempat itu.',
  '⛓️ Sebuah suara menggema bahwa semua kekuatan membutuhkan pengorbanan.',
  '⛓️ Meja kontrak dipenuhi simbol tua yang belum pernah kamu lihat sebelumnya.',
  '⛓️ Kamu menyerahkan Blood terakhir dan menunggu apakah kontrak diterima.',
  '⛓️ Segel merah terbuka sedikit, memperlihatkan bayangan kekuatan di dalamnya.',
  '⛓️ Para Hunter hanya melihat dari jauh saat perjanjian baru dibuat.',
  '⛓️ Kamu berdiri sendirian menghadapi Devil yang akan menjadi sumber kekuatanmu.',
  '⛓️ Kontrak lama kembali aktif setelah menemukan pengguna yang cocok.',
  '⛓️ Darah mengalir di atas simbol ritual dan membuat ruangan bergemuruh.',
  '⛓️ Kamu memilih untuk maju meski tahu harga kekuatan ini sangat besar.',
  '⛓️ Sebuah suara bertanya apakah kamu siap kehilangan sesuatu demi kemenangan.',
  '⛓️ Ruang kontrak menjadi saksi lahirnya hubungan antara Hunter dan Devil.',
  '⛓️ Kamu mengulurkan tangan dan menerima kekuatan dari balik kegelapan.',
  '⛓️ Dokumen terakhir ditandatangani. Perjalanan baru sebagai pengguna kontrak dimulai.',
  '⛓️ Energi Devil menyatu dengan Blood dan menciptakan ikatan yang baru.',
  '⛓️ Pintu tertutup setelah kontrak selesai, meninggalkan kekuatan dalam tubuhmu.',
  '⛓️ Malam itu menjadi awal dari perjanjian yang tidak akan pernah terlupakan.'
]

const PARTNER_MISSION_DIALOGS = [
  '⚔️ Jangan maju sendiri. Aku tidak mau mengangkat jasadmu nanti.',
  '🎯 Tetap fokus. Kesempatan menang tidak datang dua kali.',
  '🛡️ Aku tahan serangannya. Cari titik lemahnya sekarang.',
  '😐 Jangan panik. Devil hanya mencoba membuat kita takut.',
  '💀 Kau masih berdiri? Bagus. Berarti lanjutkan pertarungan.',
  '👁️ Aku lihat celahnya. Serang ketika aku memberi tanda.',
  '⚠️ Jaga jarak dulu. Jangan biarkan dia mendekat.',
  '🩸 Kalau kau terluka parah, aku yang repot.',
  '🔥 Kita sudah sampai sejauh ini. Jangan menyerah sekarang.',
  '🗡️ Aku bagian depan. Kau cari posisi terbaik.',
  '⚡ Gerakannya mulai melambat. Ini kesempatan kita.',
  '💢 Jangan buang energi. Simpan untuk serangan terakhir.',
  '🚨 Aku tidak akan menyelamatkanmu dua kali.',
  '🛡️ Tetap di belakangku sampai keadaan aman.',
  '👊 Dia mulai kehilangan kendali. Bersiap menyerang.',
  '👂 Aku dengar langkahnya. Dia mendekat dari kiri.',
  '🐺 Jangan lihat ukurannya. Semua Devil punya kelemahan.',
  '🔪 Kau pegang pertahanan. Aku cari jalan masuk.',
  '🔄 Kalau rencana ini gagal, kita buat rencana baru.',
  '💀 Jangan mati sebelum misi selesai, paham?',
  '🚪 Aku akan membuka jalan. Ikuti setelah itu.',
  '🩸 Kau masih punya Blood? Pastikan jangan habis.',
  '🎯 Serangan berikutnya harus tepat sasaran.',
  '🌑 Aku tahu ini berbahaya, tapi kita tidak punya pilihan.',
  '🏃 Tetap bergerak. Diam hanya membuat kita jadi target.',
  '⛓️ Aku menahan dia sebentar. Gunakan waktunya.',
  '😒 Jangan terlalu percaya diri. Itu kesalahan Hunter pemula.',
  '👁️ Aku melihat polanya. Dia mengulang serangan yang sama.',
  '🩹 Luka itu kecil. Jangan buat ekspresi seperti mau mati.',
  '🏥 Kita keluar hidup-hidup dari sini, mengerti?',
  '🔥 Aku tidak peduli seberapa kuat dia. Kita tetap maju.',
  '💨 Ambil napas. Pertarungan ini belum berakhir.',
  '⚔️ Kau serang saat aku membuatnya lengah.',
  '🧠 Jangan biarkan ketakutan mengendalikan pikiranmu.',
  '💀 Aku pernah menghadapi yang lebih buruk dari ini.',
  '🤝 Tetap bersama tim. Jangan mencoba jadi pahlawan.',
  '🔫 Senjatamu masih berfungsi? Bagus, jangan hilangkan.',
  '⚠️ Aku tidak suka rencananya, tapi ini satu-satunya cara.',
  '👁️ Perhatikan gerakannya sebelum menyerang.',
  '🔥 Kita hampir selesai. Bertahan sedikit lagi.',
  '🚫 Jangan menoleh ke belakang. Fokus pada target.',
  '🤝 Aku percaya padamu, jadi jangan mengecewakan.',
  '🍜 Kalau berhasil, aku traktir makan setelah misi.',
  '⏳ Jangan terlalu lama berpikir. Kesempatan itu singkat.',
  '📢 Aku akan memberi aba-aba. Jangan bergerak dulu.',
  '⚔️ Devil itu kuat, tapi bukan berarti tidak bisa dikalahkan.',
  '❤️ Tetap hidup sampai laporan misi selesai.',
  '🛡️ Aku menjaga sisi ini. Kau ambil sisi lainnya.',
  '⚠️ Jangan ulangi kesalahan yang membuat kita terluka tadi.',
  '😮‍💨 Setelah ini kita istirahat. Kalau tempatnya masih utuh.',
  '📋 Misi selesai dulu, baru kita pikirkan sisanya.'
]

const EXPLORE_STORIES = [
  '🔎 Lampu kota berkedip di ujung jalan. Kamu mengikuti bau besi sebelum jejak itu menghilang.',
  '🔎 Sebuah toko sudah kosong, tetapi suara langkah masih terdengar dari lantai dua.',
  '🔎 Di bawah jembatan, kamu menemukan bekas cakaran dan tetesan darah yang belum mengering.',
  '🔎 Radio rusak memanggil namamu sekali, lalu hanya menyisakan suara statis.',
  '🔎 Hujan turun di atas aspal. Di antara genangan, sesuatu meninggalkan bekas telapak tangan.',
  '🔎 Seorang warga menunjuk gang sempit sebelum berlari. Ada bayangan besar di balik kabut.',
  '🔎 Kamu menemukan lencana Hunter lama di dekat tempat sampah dan menyimpannya sebagai petunjuk.',
  '🔎 Bau makanan dari kejauhan menutupi aroma Devil. Kamu bergerak perlahan agar tidak menarik perhatian.',
  '🔎 Pintu besi terbuka sendiri. Di dalamnya hanya ada kursi patah dan suara napas dari kegelapan.',
  '🔎 Jalanan terlihat aman, tetapi nalurimu mengatakan ada sesuatu yang sedang mengawasimu dari atap.',
  '🔎 Jalanan sepi. Hanya ada poster Orang Hilang yang tertiup angin.',
  '🔎 Lembur selesai. Saat keluar kantor, setengah lampu jalan mendadak mati.',
  '🔎 Kereta terakhir sudah lewat. Kamu terpaksa berjalan melewati gang yang terlalu sunyi.',
  '🔎 Di konbini, televisi menayangkan berita korban Devil. Kasirnya hanya menatap lantai.',
  '🔎 Anjing liar mengikutimu, lalu kabur setelah melihat sesuatu di atas gedung.',
  '🔎 Sirene ambulans lewat. Petugas Public Safety berlari membawa senjata terhunus.',
  '🔎 Kopi kaleng dari vending machine terasa aneh, seolah ada rasa besi di dalamnya.',
  '🔎 Lift kantor macet lima menit. Saat terbuka, koridornya sudah kosong.',
  '🔎 Kamu menemukan dompet di bangku taman. Isinya hanya foto yang disobek.',
  '🔎 Sekolah di seberang gelap, tetapi suara kursi masih terdengar dari dalam.',
  '🔎 Papan iklan berkedip. Wajah pada iklannya tersenyum dengan cara yang salah.',
  '🔎 Kamu melewati TKP lama. Pita polisi sudah pudar, tetapi baunya masih tertinggal.',
  '🔎 Penjual takoyaki menyuruhmu pulang cepat karena ada keributan di blok sebelah.',
  '🔎 Langkah kaki terdengar dari belakang. Saat menoleh, hanya kucing hitam yang pergi.',
  '🔎 Kemacetan berhenti total. Mobil di depan terus melihat spion meski jalan di belakang kosong.',
  '🔎 Tagihan menumpuk. Di amplop terakhir ada bekas telapak tangan kecil.',
  '🔎 Papan jadwal stasiun menampilkan nama kota yang tidak ada di peta mana pun.',
  '🔎 Satpam berkata jam pulang sudah lewat dua jam, padahal matahari baru tenggelam.',
  '🔎 Gagak-gagak di kabel listrik semuanya menghadap ke arah yang sama.',
  '🔎 Di bawah jembatan, bekas darah membentuk panah menuju lorong yang ditutup.',
  '🔎 Kamu mendengar radio darurat menyebut koordinat yang persis berada di kakimu.',
  '🔎 Sebuah payung tertinggal di halte. Bagian dalamnya penuh goresan kuku.',
  '🔎 Dari atap apartemen terdengar suara benda berat diseret perlahan.',
  '🔎 Seorang Hunter tua memberimu perban tanpa menjelaskan dari mana asalnya.',
  '🔎 Lampu penyeberangan berubah merah meski tidak ada kendaraan yang lewat.',
  '🔎 Pintu gudang bergetar dari dalam, tetapi kuncinya masih tergantung di luar.',
  '🔎 Bau bunga pemakaman mengikuti langkahmu sampai ke ujung jalan.',
  '🔎 Kamu melihat bayanganmu terlambat bergerak setengah detik.',
  '🔎 Mesin ATM menyala sendiri dan menampilkan pesan: JANGAN PULANG.',
  '🔎 Hujan berhenti tepat di satu titik jalan, seolah ada atap tak terlihat di atasnya.',
  '🔎 Seseorang meninggalkan bekal di bangku taman. Makanannya masih hangat.',
  '🔎 Papan nama toko berputar sendiri mengarah ke gang sempit.',
  '🔎 Kabel listrik putus dan percikannya membentuk suara seperti bisikan.',
  '🔎 Kamu menemukan jejak sepatu basah menuju gedung yang sudah lama disegel.',
  '🔎 Seorang anak menunjuk ke belakangmu lalu langsung ditarik pergi oleh ibunya.',
  '🔎 Ponselmu menerima panggilan dari nomor yang tidak memiliki angka.',
  '🔎 Di kaca toko, ada pantulan seseorang yang tidak berjalan bersamamu.',
  '🔎 Kamu mendengar pintu rumah dikunci dari dalam, padahal rumah itu sudah kosong.',
  '🔎 Bau tanah basah muncul dari saluran drainase yang tidak terkena hujan.',
  '🔎 Sebuah sepatu tunggal tergeletak di tengah zebra cross.',
  '🔎 Kamu menemukan tanda cakaran baru di tiang beton dekat markas.',
  '🔎 Jalan pulang terasa lebih panjang dari biasanya, tetapi jam tanganmu tidak bergerak.',
  '🔎 Di kejauhan, suara chainsaw meraung singkat lalu lenyap ditelan kota.',
  '🔎 Sebuah gang kecil berubah sunyi setelah lampu terakhir padam.',
  '🔎 Kamu menemukan kamera rusak yang masih merekam sesuatu dari beberapa menit lalu.',
  '🔎 Bayangan besar melintas di antara gedung, tetapi tidak ada siapa pun di sana.',
  '🔎 Sebuah surat lama ditemukan di bawah bangku dengan nama yang tidak dikenal.',
  '🔎 Alarm kebakaran berbunyi dari gedung kosong tanpa tanda api.',
  '🔎 Kamu melihat jejak kaki menuju tembok buntu yang tidak memiliki pintu.',
  '🔎 Seorang pedagang malam menutup tokonya lebih cepat setelah melihatmu datang.',
  '🔎 Angin membawa suara tangisan dari arah taman yang sudah ditutup.',
  '🔎 Kamu menemukan simbol aneh tergambar di aspal dekat lokasi kejadian.',
  '🔎 Seekor burung jatuh dari langit sebelum sesuatu bergerak di balik awan.',
  '🔎 Lampu apartemen lantai atas menyala sendiri satu per satu.',
  '🔎 Kamu menemukan kartu identitas Hunter yang sudah berubah nama.',
  '🔎 Sebuah halte kosong memiliki dua bayangan meski hanya kamu yang berdiri.',
  '🔎 Pintu kamar hotel terbuka sedikit, meninggalkan suara napas dari dalam.',
  '🔎 Kamu mendengar suara langkah mengikuti ritmemu, tetapi tidak ada orang di belakang.',
  '🔎 Sebuah boneka tua ditemukan tersenyum di tengah jalan yang kosong.',
  '🔎 Jalan kota berubah terasa asing meski kamu sudah sering melewatinya.'
]

const MISSION_STORIES = [
  '🏚️ Gudang terbengkalai pinggir kota. Bau darah memenuhi ruangan. Empat pekerja hilang dan hanya tersisa bekas cakaran di dinding.',
  '🏫 Sekolah malam kosong. Kamera keamanan menangkap sosok bermata merah. Seorang guru ditemukan tewas tanpa tahu penyebabnya.',
  '🚇 Gorong-gorong kota. Suara rantai terdengar dari bawah tanah. Tim pencari menemukan jejak kaki yang tidak manusiawi.',
  '🌲 Hutan pinggiran kota. Kabut tebal menutup pandangan. Dua Hunter hilang setelah mengejar suara aneh.',
  '🏥 Rumah sakit lama. Pasien lantai tiga menghilang satu per satu. Tembok penuh bekas serangan tajam.',
  '🚉 Stasiun terakhir. Kereta datang tanpa penumpang. Kursi belakang penuh noda hitam yang tidak dikenal.',
  '🏢 Apartemen nomor 303. Tetangga mendengar suara mengunyah setiap malam. Penghuni terakhir tidak pernah keluar.',
  '⚓ Pelabuhan gelap. Kontainer ditemukan terbuka. Rantai baja putus seperti dihancurkan makhluk besar.',
  '🏠 Rumah mewah kosong. Satu keluarga hilang tanpa jejak. Langit-langit penuh bekas cakar panjang.',
  '🗑️ Tempat pembuangan akhir. Hewan liar ditemukan mati. Lingkaran darah muncul di tengah tumpukan sampah.',
  '⛪ Gereja tua terbengkalai. Salib berubah posisi sendiri. Tulisan aneh ditemukan di lantai menggunakan darah.',
  '🏦 Bank pusat kota. Brankas terbuka tanpa kerusakan. Kamera mati sebelum suara jeritan terdengar.',
  '🎠 Taman kota tengah malam. Mainan anak bergerak sendiri. Tidak ada keluarga yang mengaku kehilangan.',
  '🏭 Pabrik lama. Mesin produksi menyala tanpa listrik. Tiga pekerja ditemukan dalam kondisi mengenaskan.',
  '🚔 Kantor polisi kosong. Semua sel terbuka sendiri. Darah ditemukan sampai memenuhi lorong utama.',
  '🏨 Hotel lantai delapan. Pintu kamar terkunci dari dalam. Tamu tidak terlihat selama dua hari.',
  '🏊 Kolam renang umum. Air berubah merah tiba-tiba. Suara seseorang terdengar dari dasar kolam.',
  '📚 Perpustakaan malam. Buku berjatuhan sendiri. Rak terakhir memiliki bekas gigitan besar.',
  '🚢 Dermaga tua. Kapal nelayan kembali tanpa awak. Jaringnya berisi sesuatu yang bukan ikan.',
  '🏢 Gedung kosong pusat kota. Lampu berkedip terus menerus. Suara tawa anak kecil terdengar.',
  '🎪 Pasar malam terakhir. Pedagang hilang satu per satu. Dagangan mereka masih tersusun rapi.',
  '🏟️ Stadion besar. Lampu mati saat pertandingan berlangsung. Puluhan penonton hilang tanpa suara.',
  '🏛️ Museum tua. Patung berpindah tempat sendiri. Penjaga malam terakhir tidak pernah kembali.',
  '⚰️ Pemakaman lama. Tanah terbuka dari bawah. Semua batu nisan mengalami kerusakan misterius.',
  '🌉 Jembatan kota. Mobil ditemukan kosong di tengah jalan. Kaca penuh bekas tangan berdarah.',
  '☕ Kafe 24 jam. Barista menghilang saat bekerja. Mesin kopi masih menyala tanpa henti.',
  '🧺 Laundry malam. Mesin cuci berputar sendiri. Isi di dalamnya membuat pemilik ketakutan.',
  '🎬 Bioskop tua. Film terus berjalan sendiri. Kursi penonton kosong tetapi suara terdengar.',
  '🏋️ Gym bawah tanah. Alat olahraga rusak parah. Bekas gigitan ditemukan pada besi tebal.',
  '🐕 Toko hewan kota. Semua kandang terbuka. Hewan hilang tanpa meninggalkan jejak.',
  '⛽ Pom bensin sepi. Kasir ditemukan tewas. Kamera merekam bayangan tinggi melewati pintu.',
  '🏫 Ruang kelas kosong. Papan tulis penuh tulisan aneh. Tidak ada murid yang mengaku menulis.',
  '🧠 Rumah sakit jiwa. Pasien berhasil keluar. Dokter yang mengejar justru menghilang.',
  '✈️ Bandara malam. Pesawat mendarat tanpa kru. Bagasi berisi barang yang mencurigakan.',
  '🛒 Mall tengah malam. Eskalator bergerak sendiri. Suara pengumuman terdengar dari lantai kosong.',
  '🏗️ Proyek bangunan. Helm pekerja ditemukan berserakan. Seluruh pekerja hilang dalam satu malam.',
  '📺 Studio televisi. Siaran berhenti mendadak. Kamera hanya menampilkan sepasang mata merah.',
  '🌾 Gudang beras. Karung robek berserakan. Jejak kecil mengelilingi seluruh ruangan penyimpanan.',
  '🏚️ Panti asuhan lama. Anak-anak ditemukan tertidur. Semua boneka mereka menghilang bersamaan.',
  '💉 Klinik kecil. Jarum suntik berantakan. Semua pasien pergi tanpa catatan medis.',
  '🚗 Parkiran bawah tanah. Alarm kendaraan berbunyi bersamaan. Tidak ada pemilik yang datang.',
  '🚻 Toilet umum. Pintu terakhir terkunci rapat. Suara ketukan terdengar dari dalam.',
  '🏡 Rumah tua pinggir kota. Foto keluarga dirusak. Semua wajah dicoret menggunakan kuku.',
  '🌱 Kebun kosong. Tanaman mati membentuk lingkaran. Simbol asing ditemukan di tengahnya.',
  '🛣️ Jalan tol malam. Kecelakaan besar terjadi. Semua pengemudi hilang sebelum bantuan datang.',
  '🐟 Pelabuhan ikan. Kapal kembali penuh muatan. Sebagian isinya bukan berasal dari laut.',
  '🏬 Ruko tiga lantai. Lantai bawah gelap. Suara benda diseret terdengar dari atas.',
  '💻 Warnet malam. Semua komputer aktif sendiri. Pesan misterius muncul dari akun kosong.',
  '🛏️ Hotel kapsul. Satu kapsul tidak bisa dibuka. Bau aneh keluar dari dalam.',
  '🏰 Bangunan tua pinggir kota. Penjaga mendengar langkah kaki. Ruangan tersebut sudah kosong.',
  '🌉 Terowongan bawah tanah. Lampu mati satu per satu. Tim kehilangan komunikasi setelah masuk.',
  '📦 Gudang ekspedisi. Paket bergerak sendiri. Tidak ada pekerja yang berani membuka.',
  '🎡 Taman hiburan terbengkalai. Semua wahana menyala. Tidak ada sumber listrik ditemukan.',
  '🧪 Laboratorium rahasia. Sampel penting hilang. Alarm berbunyi sepanjang malam tanpa berhenti.',
  '🏘️ Desa terpencil. Semua rumah kosong. Warga pergi setelah mendengar suara aneh.',
  '🛳️ Kapal kargo besar. Awak menghilang. Pesan terakhir meminta bantuan segera.',
  '🌋 Tambang tua. Suara pukulan terdengar dari dalam. Area sudah ditutup bertahun-tahun.',
  '🚪 Rumah kontrakan lama. Penyewa pergi mendadak. Barang pribadi masih tertinggal semua.',
  '📻 Menara radio. Sinyal asing muncul. Suara dari siaran tidak berasal dari manusia.',
  '🪦 Kuburan baru. Beberapa makam terbuka. Tanah di sekitarnya masih basah.',
  '🛤️ Jalur kereta lama. Kereta kosong muncul. Tidak ada jadwal perjalanan malam itu.',
  '🧸 Toko mainan kecil. Boneka berubah posisi. Pemilik mulai mendengar suara anak.',
  '🏪 Minimarket malam. Kasir melayani pelanggan tak terlihat. Kamera tidak merekam siapa pun.',
  '🌊 Pantai sepi. Jejak kaki menuju laut ditemukan. Tidak ada yang kembali.',
  '🏢 Kantor perusahaan. Semua pintu terkunci. Karyawan hilang sebelum jam kerja selesai.',
  '🔦 Terowongan kota. Tim pencari kehilangan kontak. Suara aneh terdengar dari dalam.',
  '🖥️ Ruang server. Sistem aktif sendiri. Monitor menampilkan rekaman kejadian masa lalu.',
  '🕯️ Rumah ritual lama. Lilin masih menyala. Simbol kontrak ditemukan di lantai.',
  '🚧 Jalan proyek. Pekerja mendengar suara menggali. Tidak ada mesin yang aktif.',
  '🌙 Distrik lama. Warga melapor melihat bayangan. Sosok itu muncul setiap malam.',
  '🔪 Gang sempit kota. Bau darah muncul. Tidak ada korban ditemukan di lokasi.',
  '🏙️ Pusat kota. Kamera keamanan merekam sosok sama. Tidak ada yang mengenal identitasnya.'
]

const RESCUE_STORIES = [
  '🚑 Gudang tua pinggir kota. Bau darah memenuhi ruangan. 8 pekerja masih hidup dan bersembunyi di balik peti.',
  '🚑 Sekolah malam kosong. Kamera menangkap bayangan merah. 1 guru dan 5 murid terjebak di ruang kelas.',
  '🚑 Gorong-gorong kota. Suara rantai terdengar dari bawah. 7 petugas kebersihan hilang kontak setelah masuk.',
  '🚑 Hutan berkabut. Tim pencari menemukan jejak aneh. 4 Hunter masih bertahan menunggu bantuan datang.',
  '🚑 Rumah sakit lama. Lantai tiga dikuasai Devil. 9 perawat bertahan di ruang operasi terkunci.',
  '🚑 Stasiun terakhir. Kereta berhenti tanpa masinis. 12 penumpang terjebak di gerbong belakang.',
  '🚑 Apartemen nomor 303. Suara aneh terdengar dari dalam. 6 penghuni meminta bantuan dari balkon.',
  '🚑 Pelabuhan gelap. Kontainer terbuka dengan noda darah. 11 buruh masih bersembunyi di antara barang.',
  '🚑 Rumah mewah kosong. Keluarga menghilang. 3 anak kecil ditemukan menangis di bawah meja.',
  '🚑 Tempat pembuangan akhir. Area dipenuhi ancaman. 5 pemulung terjebak tanpa jalan keluar.',
  '🚑 Gereja tua terbengkalai. Tulisan darah muncul di lantai. 9 jemaat masih terkunci di dalam.',
  '🚑 Bank pusat kota. Sistem keamanan gagal. 5 satpam dan 4 nasabah berlindung di bawah tanah.',
  '🚑 Taman kota pukul tiga pagi. Bayangan muncul dari kabut. 7 remaja terjebak di gazebo.',
  '🚑 Pabrik lama. Mesin aktif sendiri. 5 karyawan selamat di atas crane menunggu evakuasi.',
  '🚑 Kantor polisi kosong. Semua pintu terbuka. 3 petugas bersembunyi di ruang arsip.',
  '🚑 Hotel lantai delapan. Koridor dipenuhi suara aneh. 5 tamu dan 2 staf terjebak.',
  '🚑 Kolam renang umum. Air berubah warna. 6 penjaga dan 3 anak berlindung di ruang pompa.',
  '🚑 Perpustakaan malam. Rak runtuh satu per satu. 5 mahasiswa terjebak di lantai atas.',
  '🚑 Dermaga tua. Kapal kembali rusak. 8 nelayan bertahan hidup di dalam palka.',
  '🚑 Gedung kosong pusat kota. Lift berhenti mendadak. 6 petugas terjebak di dalamnya.',
  '🚑 Pasar malam. Lampu mati seluruh area. 9 pedagang bersembunyi di kios tertutup.',
  '🚑 Stadion besar. Suasana berubah kacau. 7 petugas kebersihan masih bertahan di tribun.',
  '🚑 Museum tua. Patung bergerak sendiri. 5 penjaga berlindung di ruang bawah tanah.',
  '🚑 Pemakaman lama. Tanah runtuh tiba-tiba. 4 pekerja makam terjebak di lubang.',
  '🚑 Jembatan kota. Kendaraan berhenti total. 6 pengendara terjebak di dalam mobil.',
  '🚑 Kafe malam. Pintu terkunci otomatis. 5 pengunjung dan 2 kasir menunggu bantuan.',
  '🚑 Laundry kecil. Mesin bergerak sendiri. 4 karyawan terkunci di ruang belakang.',
  '🚑 Bioskop tua. Layar terus menyala. 8 penonton terjebak di studio tiga.',
  '🚑 Gym bawah tanah. Jalan keluar tertutup. 6 anggota masih bertahan di ruang ganti.',
  '🚑 Toko hewan kota. Semua kandang terbuka. 3 karyawan dan 2 pelanggan masih hidup.',
  '🚑 Pom bensin sepi. Serangan terjadi mendadak. 5 pengendara berlindung di minimarket.',
  '🚑 Ruang kelas malam. Suara aneh muncul. 9 siswa les terjebak bersama gurunya.',
  '🚑 Rumah sakit jiwa lama. Pasien kabur. 4 dokter dan 3 perawat meminta bantuan.',
  '🚑 Bandara malam. Sistem berhenti total. 10 petugas bagasi terjebak di area konveyor.',
  '🚑 Mall tengah malam. Semua pintu tertutup. 8 sekuriti bertahan di pos utama.',
  '🚑 Proyek bangunan tinggi. Lantai atas runtuh. 6 pekerja menunggu penyelamatan.',
  '🚑 Studio televisi. Siaran terputus. 5 kru dan 2 presenter terjebak di ruang kontrol.',
  '🚑 Gudang beras besar. Karung jatuh berserakan. 5 pekerja berlindung di antara tumpukan.',
  '🚑 Panti asuhan lama. Suasana berubah gelap. 3 pengurus masih sadar di dapur.',
  '🚑 Klinik kecil. Alarm darurat aktif. 3 dokter dan 5 pasien masih di ruang operasi.',
  '🚑 Parkiran bawah tanah. Lampu mati semua. 5 satpam terkunci di ruang keamanan.',
  '🚑 Toilet umum kota. Pintu terakhir terkunci. 3 orang menunggu bantuan dari dalam.',
  '🚑 Rumah tua pinggir desa. Suara muncul dari kamar. 2 lansia terjebak di dalam.',
  '🚑 Kebun terpencil. Kabut menutup jalan. 4 petani berlindung di gubuk kecil.',
  '🚑 Jalan tol malam. Kecelakaan besar terjadi. 5 sopir truk masih hidup di kabin.',
  '🚑 Pelabuhan ikan. Mesin kapal rusak. 6 ABK terjebak di ruang mesin.',
  '🚑 Ruko tiga lantai. Lantai atas disegel. 4 karyawan toko belum keluar.',
  '🚑 Warnet malam. Semua komputer menyala. 8 pemain masih terjebak di dalam.',
  '🚑 Hotel kapsul. Lorong terkunci otomatis. 3 tamu menunggu di resepsionis.',
  '🚑 Sekolah dasar. Alarm berbunyi tanpa henti. 25 siswa dan guru terjebak di lapangan.',
  '🚑 Stasiun bawah tanah. Kereta berhenti mendadak. 15 penumpang membutuhkan evakuasi.',
  '🚑 Laboratorium rahasia. Sistem keamanan aktif. 6 peneliti terkunci di ruang eksperimen.',
  '🚑 Kapal kargo besar. Mesin mati total. 9 kru menunggu pertolongan di dek.',
  '🚑 Desa terpencil. Warga menghilang satu malam. 12 orang ditemukan bersembunyi di rumah.',
  '🚑 Tambang tua. Terowongan runtuh sebagian. 7 pekerja masih hidup di bawah tanah.',
  '🚑 Taman hiburan kosong. Wahana bergerak sendiri. 10 pengunjung terjebak di area utama.',
  '🚑 Menara radio. Sinyal misterius muncul. 4 teknisi terkunci di ruang kontrol.',
  '🚑 Gedung perkantoran. Semua pintu otomatis tertutup. 13 karyawan menunggu bantuan.',
  '🚑 Apartemen mewah. Lift rusak total. 8 penghuni terjebak di lantai atas.',
  '🚑 Pasar tradisional. Gang utama tertutup. 14 pedagang masih berada di dalam.',
  '🚑 Hotel tua. Kamar bawah tanah terkunci. 5 tamu ditemukan masih bertahan.',
  '🚑 Terowongan kota. Komunikasi terputus. 6 petugas pencari membutuhkan bantuan.',
  '🚑 Gudang senjata lama. Sistem alarm aktif. 7 penjaga terkunci di dalam.',
  '🚑 Museum sejarah. Ruang koleksi tertutup. 6 staf meminta penyelamatan segera.',
  '🚑 Gedung apartemen kosong. Listrik padam. 11 penghuni belum berhasil keluar.',
  '🚑 Terminal bus malam. Kendaraan berhenti semua. 9 penumpang menunggu evakuasi.',
  '🚑 Pusat perbelanjaan lama. Pintu darurat rusak. 12 pengunjung masih terjebak.',
  '🚑 Jalan pegunungan. Kabut tebal turun. 5 pendaki menunggu tim penyelamat.',
  '🚑 Gudang bawah tanah. Suara misterius terdengar. 8 pekerja terjebak tanpa komunikasi.',
  '🚑 Rumah kosong pinggir kota. Sinyal hilang. 4 orang meminta bantuan dari dalam.'
]

const RESCUE_RESULTS = [
  '🚨 Pintu berhasil dibuka paksa. Semua warga diarahkan keluar melalui jalur darurat.',
  '🚨 Ancaman berhasil dialihkan. Tim rescue mengevakuasi korban tanpa hambatan.',
  '🚨 Alarm darurat diaktifkan. Seluruh korban dibawa menuju area aman.',
  '🚨 Jalur alternatif ditemukan. Korban berhasil dipindahkan sebelum bahaya mendekat.',
  '🚨 Tim menarik perhatian ancaman sementara warga keluar dari sisi belakang.',
  '🚨 Sistem ventilasi digunakan. Area berhasil diamankan untuk proses evakuasi.',
  '🚨 Akses atap dibuka. Korban diturunkan satu per satu dengan aman.',
  '🚨 Lokasi berhasil disterilkan. Semua warga keluar mengikuti prosedur darurat.',
  '🚨 Anak-anak diamankan lebih dulu. Evakuasi berjalan tanpa kepanikan besar.',
  '🚨 Korban ditemukan dan dibawa menuju kendaraan penyelamat di luar area.',
  '🚨 Operasi senyap berhasil. Ancaman tidak sempat melakukan serangan tambahan.',
  '🚨 Kerja sama tim menemukan kelemahan ancaman dan membuka jalan keluar.',
  '🚨 Tim medis datang tepat waktu. Semua korban mendapatkan perawatan awal.',
  '🚨 Reruntuhan dibersihkan. Jalur evakuasi kembali bisa digunakan.',
  '🚨 Bantuan HQ tiba. Operasi penyelamatan selesai sesuai rencana.',
  '🚨 Perhatian musuh berhasil dialihkan cukup lama untuk menyelamatkan warga.',
  '🚨 Evakuasi dilakukan dalam gelap agar posisi korban tidak diketahui.',
  '🚨 Barikade darurat dibuat untuk melindungi warga sampai bantuan datang.',
  '🚨 Anak-anak dan lansia berhasil diprioritaskan dalam proses penyelamatan.',
  '🚨 Peralatan seadanya digunakan untuk menyelamatkan banyak korban.',
  '🚨 Jalan keluar ditemukan. Semua orang berhasil meninggalkan lokasi berbahaya.',
  '🚨 Tim rescue masuk kembali untuk mengambil korban yang tertinggal.',
  '🚨 Ancaman berhasil dijauhkan. Area aman untuk proses pemulangan warga.',
  '🚨 Pintu darurat terbuka. Korban keluar secara bertahap dan teratur.',
  '🚨 Komunikasi dipulihkan. Tim berhasil mengatur evakuasi seluruh korban.',
  '🚨 Lampu cadangan dinyalakan. Jalur penyelamatan terlihat kembali.',
  '🚨 Korban yang terluka dibawa keluar menggunakan tandu darurat.',
  '🚨 Serangan berhasil dihentikan. Warga segera dipindahkan ke tempat aman.',
  '🚨 Tim menemukan ruang persembunyian korban dan melakukan penyelamatan.',
  '🚨 Jalur belakang digunakan untuk menghindari konflik dengan ancaman.',
  '🚨 Evakuasi berjalan cepat setelah titik lemah berhasil ditemukan.',
  '🚨 Semua korban berhasil dikumpulkan sebelum area kembali berbahaya.',
  '🚨 Perintah HQ diterima. Operasi penyelamatan dinyatakan berhasil.',
  '🚨 Korban ditemukan masih hidup dan segera dibawa menuju medis.',
  '🚨 Tim membuka penghalang yang menghambat jalan keluar warga.',
  '🚨 Area sekitar diamankan agar korban bisa keluar dengan selamat.',
  '🚨 Ancaman berhasil ditahan sementara proses evakuasi berlangsung.',
  '🚨 Kendaraan rescue tiba dan membawa korban meninggalkan lokasi.',
  '🚨 Semua pintu akses dibuka untuk mempercepat proses penyelamatan.',
  '🚨 Tim medis memberikan bantuan pertama setelah korban berhasil dievakuasi.',
  '🚨 Rute aman ditemukan dan seluruh korban diarahkan menuju pintu keluar.',
  '🚨 Operasi penyelamatan berhasil tanpa kehilangan anggota tim.',
  '🚨 Korban terakhir berhasil ditemukan sebelum bangunan runtuh sepenuhnya.',
  '🚨 Tim menggunakan strategi pengalihan untuk menyelamatkan warga.',
  '🚨 Ancaman dilumpuhkan sementara dan korban berhasil dipindahkan.',
  '🚨 Jalur bawah tanah dibersihkan agar korban dapat keluar.',
  '🚨 Bantuan tambahan datang dan mempercepat proses evakuasi.',
  '🚨 Semua warga berhasil dikumpulkan di zona perlindungan.',
  '🚨 Tim berhasil membuat jalan keluar dari area yang terkunci.',
  '🚨 Korban berhasil diselamatkan sebelum situasi menjadi lebih buruk.',
  '🚨 Sistem keamanan dimatikan agar pintu evakuasi dapat dibuka.',
  '🚨 Tim bergerak cepat dan membawa semua korban menuju tempat aman.',
  '🚨 Ancaman berhenti mengejar setelah tim mengamankan area sekitar.',
  '🚨 Proses evakuasi selesai. Semua korban berhasil kembali dengan selamat.',
  '🚨 Tim rescue membersihkan lokasi setelah seluruh warga berhasil keluar.',
  '🚨 Korban yang terjebak berhasil ditemukan melalui sinyal darurat.',
  '🚨 Jalur komunikasi aktif kembali dan koordinasi berjalan lancar.',
  '🚨 Tim berhasil mengevakuasi korban sebelum ancaman kembali menyerang.',
  '🚨 Area bahaya ditutup setelah semua orang berhasil diamankan.',
  '🚨 Operasi berlangsung cepat dan tidak ada korban tambahan.',
  '🚨 Tim menemukan perlindungan sementara untuk menyelamatkan warga.',
  '🚨 Korban dipindahkan menggunakan jalur aman yang sudah dibersihkan.',
  '🚨 Misi penyelamatan berhasil. Semua target berhasil diamankan.',
  '🚨 Tim kembali setelah memastikan tidak ada korban tertinggal.',
  '🚨 Evakuasi terakhir selesai. Lokasi dinyatakan aman oleh HQ.',
  '🚨 Semua korban berhasil diselamatkan dan dibawa menuju fasilitas medis.',
  '🚨 Laporan akhir diterima. Operasi rescue dinyatakan sukses.'
]

const CITIZEN_RESPONSES = [
  '🚨"Terima kasih, kalian datang tepat waktu."',
  '🆘"Tolong selamatkan orang yang masih di dalam."',
  '😨"Masih ada korban yang belum keluar!"',
  '🙌"Akhirnya ada yang datang membantu kami."',
  '😢"Jangan tinggalkan kami sendirian di sini."',
  '💖"Kalian benar-benar menyelamatkan hidup kami."',
  '🏃‍♂️"Cepat pergi sebelum tempat ini runtuh!"',
  '👏"Terima kasih sudah mempertaruhkan nyawa kalian."',
  '🩹"Tolong bawa yang terluka ke rumah sakit."',
  '🙇"Kami akan mengingat bantuan kalian selamanya."',
  '😢"Saya pikir kami tidak akan selamat."',
  '😰"Dia masih terjebak di ruangan belakang."',
  '👥"Semua orang sudah berhasil keluar belum?"',
  '🌟"Kalian datang seperti pahlawan sungguhan."',
  '💔"Kami kehilangan banyak orang sebelum kalian datang."',
  '🙇"Terima kasih karena tidak menyerah mencari kami."',
  '🚪"Pintu itu masih terkunci dari dalam."',
  '🆘"Tolong bantu keluarga saya terlebih dahulu."',
  '😨"Makhluk itu masih berada di sekitar sini."',
  '🕊️"Kami akhirnya bisa bernapas dengan tenang."',
  '👶"Anak saya masih ada di gedung itu."',
  '📢"Beritahu yang lain kalau kami sudah aman."',
  '😔"Saya tidak tahu harus berterima kasih bagaimana."',
  '🌈"Kami masih hidup berkat bantuan kalian."',
  '🩹"Luka kami tidak penting, selamatkan yang lain."',
  '🧎"Saya mohon jangan biarkan mereka tertinggal."',
  '📱"Saya akan menghubungi keluarga saya sekarang."',
  '🚨"Bahaya belum sepenuhnya pergi dari tempat ini."',
  '💧"Kami sudah menunggu bantuan sejak tadi."',
  '🛡️"Kalian melindungi kami saat kami tidak mampu."',
  '😌"Sekarang kami merasa jauh lebih aman."',
  '🧸"Anak kecil itu masih ketakutan."',
  '👀"Saya melihat sesuatu bergerak di belakang kalian."',
  '🧡"Terima kasih sudah peduli kepada kami."',
  '🪑"Kami bersembunyi di sini sepanjang malam."',
  '🔦"Ada seseorang di ruangan gelap sebelah sana."',
  '🗣️"Tolong dengarkan, masih ada suara dari bawah."',
  '💙"Kalian memberi kami kesempatan kedua."',
  '🧑"Dia membutuhkan perawatan secepatnya."',
  '📍"Kami menemukan tempat aman untuk sementara."',
  '😥"Kami hampir kehilangan harapan sebelum kalian datang."',
  '🧤"Terima kasih sudah menarik kami keluar."',
  '🏢"Kami melihat kalian dari jendela tadi."',
  '⚠️"Hati-hati, ancamannya mungkin belum pergi."',
  '🌙"Kami tidak pernah melupakan malam ini."',
  '🤝"Bantuan kalian sangat berarti bagi kami."',
  '🧳"Kami akan segera meninggalkan tempat ini."',
  '🔔"Saya akan memberi tahu warga lainnya."',
  '🏠"Kami hanya ingin kembali ke rumah dengan selamat."',
  '🩸"Banyak yang terluka, tapi kami masih bertahan."',
  '🌱"Terima kasih karena memberi kami harapan."',
  '🧭"Ikuti jalan ini, masih ada korban lain."',
  '🛑"Jangan masuk lagi, tempat itu terlalu berbahaya."',
  '💡"Kalian membawa cahaya di saat paling gelap."',
  '👨👩👧"Keluarga kami akhirnya bisa berkumpul lagi."',
  '🧡"Kami akan menceritakan keberanian kalian."',
  '🔒"Masih ada pintu yang belum diperiksa."',
  '🦺"Kami tidak pernah menyangka akan diselamatkan."',
  '📦"Barang kami tidak penting, nyawa lebih utama."',
  '🌧️"Kami menunggu dalam ketakutan sepanjang malam."',
  '🕯️"Kami hampir kehilangan semua harapan."',
  '🎒"Terima kasih sudah membawa kami keluar."',
  '💪"Kalian benar-benar pejuang sejati."',
  '🏳️"Kami menyerah sebelum kalian datang membantu."',
  '🌅"Akhirnya malam buruk ini berakhir."',
  '🧡"Saya akan selalu mengingat pertolongan ini."',
  '📖"Kisah kalian akan kami ceritakan kepada semua orang."',
  '🔋"Kami sudah kehabisan tenaga untuk bertahan."',
  '🌍"Terima kasih karena melindungi orang biasa seperti kami."',
  '🕰️"Sedikit lebih lama dan kami mungkin terlambat diselamatkan."',
  '❤️"Kalian adalah alasan kami masih hidup hari ini."'
]

const CSM_CONTENT_TOTALS = {
  contractScenes: CONTRACT_SCENES.length,
  exploreStories: EXPLORE_STORIES.length,
  missionStories: MISSION_STORIES.length,
  rescueStories: RESCUE_STORIES.length,
  rescueResults: RESCUE_RESULTS.length
}

const MAKIMA_WIN_DIALOGS = [
  '⛓️ Ck... Kau berhasil melewati rencanaku kali ini.',
  '👁️ Tidak buruk. Kemampuanmu mulai menarik perhatian.',
  '🩸 Hmph. Aku mengakui hasil pertarungan ini.',
  '⚠️ Jangan terlalu bangga dengan kemenangan kecil ini.',
  '😒 Kau menang karena keadaan berpihak padamu.',
  '🔪 Jangan berpikir semuanya berubah setelah ini.',
  '🌑 Menarik. Ternyata kau masih mampu bertahan.',
  '🚪 Pergilah sebelum aku kehilangan kesabaran.',
  '⛓️ Keberanianmu cukup merepotkan untuk dihadapi.',
  '👁️ Nikmati kemenanganmu selagi masih ada.',
  '🩸 Aku tidak menyangka kau bisa sejauh ini.',
  '⚖️ Hasil ini cukup menarik untuk diamati.',
  '😐 Kau membuatku sedikit penasaran.',
  '🔒 Masih banyak hal yang belum kau ketahui.',
  '🌹 Ada sesuatu yang berbeda darimu.',
  '👁️ Aku akan mengingat pertarungan ini.',
  '⛓️ Kau bukan lawan biasa, itu kuakui.',
  '🌑 Kemenangan ini tidak mengubah tujuan kita.',
  '⚠️ Jangan biarkan hasil ini membuatmu lengah.',
  '🔪 Lain kali, aku tidak akan membiarkanmu menang.'
]

const MAKIMA_LOSE_DIALOGS = [
  '⛓️ Patuhlah. Kau masih belum memahami posisimu.',
  '👁️ Lihat hasilnya. Kau terlalu lemah.',
  '🚪 Kembali ke tempat yang seharusnya.',
  '⚠️ Jangan pernah melawanku lagi.',
  '🩸 Darahmu tidak cukup untuk mengubah apa pun.',
  '😐 Pilihanmu kali ini sangat mengecewakan.',
  '🔪 Aku sudah memberimu kesempatan sebelumnya.',
  '🌑 Berlutut sebelum aku memaksamu.',
  '🚨 Public Safety akan menemukanmu nanti.',
  '⛓️ Kau kalah bahkan sebelum memahami situasinya.',
  '👁️ Aku sudah membaca semua gerakanmu.',
  '🩸 Perlawananmu hanya membuang waktu.',
  '⚠️ Kau terlalu percaya diri menghadapi aku.',
  '😒 Apakah ini yang kau sebut kekuatan?',
  '🔒 Tidak ada jalan keluar dari keputusanmu.',
  '🌑 Kegelapan ini terlalu besar untukmu.',
  '🗡️ Senjatamu tidak berarti di hadapanku.',
  '👁️ Kau masih belum memahami siapa lawanmu.',
  '⛓️ Kontrakmu tidak akan menyelamatkanmu.',
  '🚪 Pergi sebelum aku berubah pikiran.'
]

const MAKIMA_HELL_DIALOGS = [
  '⛓️ Kau seharusnya tidak datang ke tempat ini.',
  '👁️ Neraka bukan tempat untuk manusia biasa.',
  '🌑 Berani sekali kau masuk tanpa izin.',
  '😐 Hmph. Kau masih mengikuti jejakku.',
  '⚠️ Sudah kubilang jangan ikut campur.',
  '🩸 Bau manusia masih melekat padamu.',
  '🚪 Pulang sebelum tempat ini menelanmu.',
  '⛓️ Aku bisa merasakan ketakutanmu.',
  '👁️ Menarik. Kau masih berani menatapku.',
  '💀 Jangan membuatku memanggilmu lagi.',
  '🌑 Bahkan Neraka mengenal namaku.',
  '⛓️ Kau tidak memahami tempat yang kau masuki.',
  '👁️ Setiap langkahmu sudah diperhatikan.',
  '🩸 Darah manusia selalu membawa masalah.',
  '⚠️ Jangan menguji kesabaranku di sini.',
  '🚪 Jalan kembali masih terbuka untukmu.',
  '🌙 Tempat ini tidak memiliki belas kasihan.',
  '🔪 Kau membawa senjata ke tempat yang salah.',
  '💀 Banyak yang datang, sedikit yang kembali.',
  '👁️ Jangan membuatku mengulang perintah.'
]

const VISIT_PARTNER_DIALOGS = [
  '⚔️ Aku bantu dari sisi kiri, cari celah untuk menyerang!',
  '⚠️ Jangan mati di sini, kita belum selesai!',
  '🔪 Aku tahan dia, serang saat pertahanannya terbuka!',
  '🩸 Tekan terus sebelum dia memulihkan diri!',
  '🚨 Mundur kalau situasinya mulai terlalu berbahaya!',
  '👁️ Aku melihat celah kecil di pertahanannya!',
  '💥 Jangan biarkan dia kabur dari area ini!',
  '⛓️ Tetap di belakangku sampai keadaan aman!',
  '🔫 Aku alihkan perhatiannya, manfaatkan kesempatan ini!',
  '🏃 Jangan ragu mundur kalau nyawamu terancam!',
  '🛡️ Aku tahan serangannya, kamu fokus menyerang!',
  '🔥 Jangan berhenti sekarang, dia mulai melemah!',
  '🗡️ Serang bagian yang terbuka sebelum terlambat!',
  '👊 Aku buka jalan, ikuti aku dari belakang!',
  '🌑 Sesuatu terasa aneh, tetap waspada!',
  '🩸 Bau darah makin kuat, jangan lengah!',
  '⚡ Cepat, kesempatan seperti ini tidak datang dua kali!',
  '🎯 Bidik dengan tepat, jangan buang serangan!',
  '🚪 Aku jaga pintu keluar kalau keadaan buruk!',
  '🕷️ Jangan biarkan dia mengepung kita!',
  '🔦 Aku pantau gerakannya, tunggu aba-abaku!',
  '💀 Jangan takut, kita masih punya peluang!',
  '🧤 Aku tangani serangan kecilnya, fokus ke inti!',
  '📢 Beri tahu kalau kau mulai kehabisan tenaga!',
  '🩹 Bertahan sebentar, aku bantu setelah ini!',
  '🦾 Serang sekarang sebelum kekuatannya kembali!',
  '⚔️ Kita habisi bersama sebelum dia bangkit lagi!',
  '👂 Dengarkan langkahnya, dia mencoba mengecoh kita!',
  '🧭 Ikuti arahku, jangan terpisah!',
  '🛑 Berhenti maju, itu jebakan!',
  '🌪️ Aku buat celah, masuk sekarang!',
  '🔒 Jangan beri dia waktu untuk berpikir!',
  '🕶️ Aku awasi bayangannya, kau serang langsung!',
  '💢 Dia mulai panik, terus tekan!',
  '🩸 Luka itu cukup besar, selesaikan sekarang!',
  '⚙️ Gunakan semua yang kau punya!',
  '🚑 Kalau terluka parah, segera mundur!',
  '🔥 Jangan biarkan rasa takut menguasaimu!',
  '👁️ Aku melihat pergerakannya sebelum menyerang!',
  '🔪 Serangan berikutnya harus menentukan!',
  '🛡️ Aku lindungi bagian belakangmu!',
  '⚠️ Ada yang salah, tetap dekat denganku!',
  '💥 Hancurkan pertahanannya sekarang!',
  '🌙 Jangan kehilangan fokus di tengah pertarungan!',
  '🧨 Paksa dia keluar dari persembunyiannya!',
  '🏃 Kalau keadaan memburuk, kita pergi bersama!',
  '🗡️ Satu kesempatan lagi, jangan sia-siakan!',
  '⛓️ Jangan bertindak sendiri, kita satu tim!',
  '🎯 Tunggu momen yang tepat lalu serang!',
  '⚔️ Aku di sini, jangan hadapi dia sendirian!'
]

const RAID_PARTNER_DIALOGS = [
  '⚔️ Siap. Aku ikut menyerang.',
  '🩸 Aku bantu, jangan biarkan dia kabur.',
  '👁️ Ada celah. Manfaatkan sekarang.',
  '🔥 Serang sekarang sebelum dia pulih.',
  '🛡️ Aku lindungi bagian belakangmu.',
  '🔪 Aku buka jalan, masuk saat aman.',
  '⚠️ Tetap waspada, dia belum selesai.',
  '💥 Tekan terus, pertahanannya mulai runtuh.',
  '🎯 Target terbuka. Ini kesempatan kita.',
  '⛓️ Aku tahan dia sebentar lagi.',
  '🚨 Jangan lengah, serangannya berubah.',
  '⚡ Cepat, waktunya tidak banyak.',
  '🗡️ Aku ikut dari sisi kanan.',
  '🌑 Jangan berhenti sampai dia jatuh.',
  '🩹 Kalau terluka, mundur sebentar.',
  '👊 Kita selesaikan bersama.',
  '🔦 Aku pantau gerakannya.',
  '💀 Dia melemah. Akhiri sekarang.',
  '🚪 Jalur aman terbuka. Maju.',
  '⚔️ Tetap bersamaku sampai akhir.'
]

const SHORT_PARTNER_RESPONSES = [
  '⚔️ Siap.',
  '🙏 Makasih.',
  '👍 Baik.',
  '📌 Diterima.',
  '👁️ Dimengerti.',
  '🫡 Aku paham.',
  '🚶 Jalan.',
  '🗡️ Akan kulakukan.',
  '😐 Terserah.',
  '✅ Mengerti.',
  '🔥 Siap bergerak.',
  '🤝 Aku ikut.',
  '🛡️ Aku siap.',
  '⚡ Berangkat.',
  '🎯 Dipahami.',
  '👊 Serahkan padaku.',
  '🌑 Aku mengerti.',
  '📢 Siap laksanakan.',
  '🩸 Akan kuingat.',
  '🚨 Aku dengar.',
  '🔒 Baik, diterima.',
  '⚠️ Aku waspada.',
  '🗡️ Siap bertarung.',
  '💀 Aku jalankan.',
  '🌟 Terima kasih.'
]

const GIFT_REACTIONS_BLOOD = [
  (char, biaya) => `🩸 *"${char.nama}"*: "Blood sebanyak ${biaya.toLocaleString()} ini? Kau benar-benar serius denganku."`,
  (char, biaya) => `⛓️ *"${char.nama}"*: "Kau memberikan ${biaya.toLocaleString()} Blood-mu sendiri. Pengorbanan yang menarik."`,
  (char, biaya) => `💉 *"${char.nama}"*: "*meminum* ${biaya.toLocaleString()} Blood... rasanya cukup."`,
  (char, biaya) => `👁️ *"${char.nama}"*: "Rasa ${biaya.toLocaleString()} Blood-mu berbeda. Aku akan mengingatnya."`,
  (char, biaya) => `🌑 *"${char.nama}"*: "Jangan mati dulu. Aku belum selesai denganmu. ${biaya.toLocaleString()} Blood ini cukup menarik."`,
  (char, biaya) => `🤍 *"${char.nama}"*: "${biaya.toLocaleString()} Blood tidak pernah berbohong seperti manusia."`,
  (char, biaya) => `🔻 *"${char.nama}"*: "Kau rela terluka demi ${biaya.toLocaleString()} Blood ini? Menarik."`,
  (char, biaya) => `🩸 *"${char.nama}"*: "${biaya.toLocaleString()} Blood. Sedikit lagi. Aku hampir merasa puas."`,
  (char, biaya) => `⛓️ *"${char.nama}"*: "Kau memilih kehilangan ${biaya.toLocaleString()} Blood demi mendekatiku."`,
  (char, biaya) => `📜 *"${char.nama}"*: "Pengorbananmu sebesar ${biaya.toLocaleString()} Blood sudah tercatat dalam ingatanku."`,
  (char, biaya) => `👁️ *"${char.nama}"*: "Aku bisa merasakan niatmu dari ${biaya.toLocaleString()} Blood ini."`,
  (char, biaya) => `🩸 *"${char.nama}"*: "Manusia yang rela memberikan ${biaya.toLocaleString()} Blood selalu menarik."`,
  (char, biaya) => `🔮 *"${char.nama}"*: "${biaya.toLocaleString()} Blood ini cukup untuk membuatku memperhatikanmu."`,
  (char, biaya) => `⚠️ *"${char.nama}"*: "Kau semakin berani. ${biaya.toLocaleString()} Blood ini jangan sampai menjadi sia-sia. Jangan mengecewakanku."`,
  (char, biaya) => `🤝 *"${char.nama}"*: "Aku menerima ${biaya.toLocaleString()} Blood pemberianmu. Gunakan kesempatan ini."`,
  (char, biaya) => `🗡️ *"${char.nama}"*: "Darahmu senilai ${biaya.toLocaleString()} Blood itu mahal. Jangan buang nyawamu sembarangan."`,
  (char, biaya) => `💀 *"${char.nama}"*: "Aku tidak menyangka kau membayar ${biaya.toLocaleString()} Blood sebanyak ini."`,
  (char, biaya) => `🩸 *"${char.nama}"*: "${biaya.toLocaleString()} Blood yang bagus. Hubungan ini mulai menarik."`,
  (char, biaya) => `🔥 *"${char.nama}"*: "Teruskan jika kau ingin membuatku terkesan. ${biaya.toLocaleString()} Blood ini cukup untuk awal."`,
  (char, biaya) => `🩹 *"${char.nama}"*: "Aku menerima ${biaya.toLocaleString()} Blood ini dengan senang hati."`,
  (char, biaya) => `⚖️ *"${char.nama}"*: "${biaya.toLocaleString()} Blood adalah harga yang mahal untuk sebuah perhatian."`,
  (char, biaya) => `🤍 *"${char.nama}"*: "Kau memberikan ${biaya.toLocaleString()} Blood sebagai bagian dirimu sendiri. Unik."`,
  (char, biaya) => `⛓️ *"${char.nama}"*: "${biaya.toLocaleString()} Blood ini mengikat hubungan kita sedikit lebih kuat."`,
  (char, biaya) => `🌹 *"${char.nama}"*: "Aku menghargai pengorbanan ${biaya.toLocaleString()} Blood seperti ini."`,
  (char, biaya) => `💀 *"${char.nama}"*: "Jangan mati sebelum aku membalas pemberian ${biaya.toLocaleString()} Blood-mu."`,
  (char, biaya) => `🩸 *"${char.nama}"*: "Darah ${biaya.toLocaleString()} Blood yang kau berikan menunjukkan kesungguhanmu."`,
  (char, biaya) => `🔪 *"${char.nama}"*: "Kau berani membayar harga sebesar ${biaya.toLocaleString()} Blood ini."`,
  (char, biaya) => `🌑 *"${char.nama}"*: "Aku bisa merasakan tekadmu dari ${biaya.toLocaleString()} Blood ini."`,
  (char, biaya) => `👁️ *"${char.nama}"*: "${biaya.toLocaleString()} Blood? Menarik. Manusia memang penuh kejutan."`,
  (char, biaya) => `⛓️ *"${char.nama}"*: "Ikatan ini menjadi semakin kuat dengan ${biaya.toLocaleString()} Blood."`,
  (char, biaya) => `🩸 *"${char.nama}"*: "Aku menerima persembahanmu sebesar ${biaya.toLocaleString()} Blood."`,
  (char, biaya) => `💉 *"${char.nama}"*: "Energi dari ${biaya.toLocaleString()} Blood ini cukup memuaskan."`,
  (char, biaya) => `⚔️ *"${char.nama}"*: "Kau membayar dengan ${biaya.toLocaleString()} Blood, sesuatu yang berharga."`,
  (char, biaya) => `🖤 *"${char.nama}"*: "Aku tidak akan melupakan pemberian ${biaya.toLocaleString()} Blood ini."`,
  (char, biaya) => `🔻 *"${char.nama}"*: "Pengorbanan ${biaya.toLocaleString()} Blood seperti ini jarang kulihat."`,
  (char, biaya) => `🌹 *"${char.nama}"*: "Kau mulai memahami cara membuatku tertarik dengan ${biaya.toLocaleString()} Blood."`,
  (char, biaya) => `💀 *"${char.nama}"*: "Pastikan Blood-mu yang berjumlah ${biaya.toLocaleString()} tidak menjadi yang terakhir."`,
  (char, biaya) => `🤍 *"${char.nama}"*: "Ada harga ${biaya.toLocaleString()} Blood yang harus dibayar untuk kedekatan."`,
  (char, biaya) => `⛓️ *"${char.nama}"*: "Aku menerima kontrak kecil sebesar ${biaya.toLocaleString()} Blood ini darimu."`,
  (char, biaya) => `🩸 *"${char.nama}"*: "Terus berikan alasan untuk mempercayaimu dengan ${biaya.toLocaleString()} Blood ini."`
]

const GIFT_REACTIONS_MONEY = [
  (char, biaya) => `💰 *"${char.nama}"*: "Rp ${biaya.toLocaleString()}? Pilihan yang cukup praktis."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Kau mencoba membeli perhatianku dengan Rp ${biaya.toLocaleString()}. Menarik."`,
  (char, biaya) => `💳 *"${char.nama}"*: "Uang Rp ${biaya.toLocaleString()} memang sederhana. Aku bisa menerimanya."`,
  (char, biaya) => `🤑 *"${char.nama}"*: "Tch. Setidaknya kau tidak pelit. Rp ${biaya.toLocaleString()} juga lumayan."`,
  (char, biaya) => `✨ *"${char.nama}"*: "Lumayan. Rp ${biaya.toLocaleString()} ini cukup. Tapi jangan berhenti di sini."`,
  (char, biaya) => `🏦 *"${char.nama}"*: "Rp ${biaya.toLocaleString()}? Cara yang aman. Cukup masuk akal."`,
  (char, biaya) => `⚠️ *"${char.nama}"*: "Uang Rp ${biaya.toLocaleString()} tidak akan melindungimu selamanya."`,
  (char, biaya) => `📊 *"${char.nama}"*: "Aku sudah mencatat jumlah Rp ${biaya.toLocaleString()} yang kau berikan."`,
  (char, biaya) => `🧤 *"${char.nama}"*: "Setidaknya hadiah Rp ${biaya.toLocaleString()} ini tidak membuat tanganku kotor."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Aku terima Rp ${biaya.toLocaleString()}. Jangan berharap semuanya gratis."`,
  (char, biaya) => `🛒 *"${char.nama}"*: "Kau memilih jalan yang lebih mudah. Rp ${biaya.toLocaleString()}? Menarik."`,
  (char, biaya) => `💎 *"${char.nama}"*: "Rp ${biaya.toLocaleString()} cukup baik. Aku menghargainya."`,
  (char, biaya) => `🎁 *"${char.nama}"*: "Manusia selalu punya cara unik menunjukkan perhatian. Bahkan dengan Rp ${biaya.toLocaleString()}."`,
  (char, biaya) => `💰 *"${char.nama}"*: "Aku tidak menolak sesuatu yang bernilai. Rp ${biaya.toLocaleString()} cukup bernilai."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Rp ${biaya.toLocaleString()}? Pilihan hadiah yang cukup cerdas."`,
  (char, biaya) => `📈 *"${char.nama}"*: "Uang Rp ${biaya.toLocaleString()} ini mungkin berguna untuk sesuatu nanti."`,
  (char, biaya) => `💳 *"${char.nama}"*: "Aku menerima pemberian Rp ${biaya.toLocaleString()}-mu. Jangan terlalu berharap."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Kau rela menghabiskan Rp ${biaya.toLocaleString()} demi hubungan ini."`,
  (char, biaya) => `🌟 *"${char.nama}"*: "Aku akan mengingat kemurahan hatimu sebesar Rp ${biaya.toLocaleString()} ini."`,
  (char, biaya) => `💸 *"${char.nama}"*: "Hadiah Rp ${biaya.toLocaleString()} diterima. Jangan sampai kau bangkrut."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Rp ${biaya.toLocaleString()}? Jumlah yang menarik. Kau cukup serius."`,
  (char, biaya) => `💰 *"${char.nama}"*: "Uang Rp ${biaya.toLocaleString()} bisa menyelesaikan banyak hal, termasuk ini."`,
  (char, biaya) => `🎀 *"${char.nama}"*: "Aku suka orang yang tahu cara memberi Rp ${biaya.toLocaleString()}."`,
  (char, biaya) => `✨ *"${char.nama}"*: "Tidak buruk. Rp ${biaya.toLocaleString()} ini menunjukkan kau mulai memahami caranya."`,
  (char, biaya) => `🎁 *"${char.nama}"*: "Aku terima hadiah Rp ${biaya.toLocaleString()} ini. Jangan membuatku kecewa."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Nilai Rp ${biaya.toLocaleString()} cukup menarik untuk membuatku tersenyum."`,
  (char, biaya) => `🏦 *"${char.nama}"*: "Kau tahu cara menggunakan sumber dayamu. Rp ${biaya.toLocaleString()} cukup membuktikannya."`,
  (char, biaya) => `💎 *"${char.nama}"*: "Hadiah Rp ${biaya.toLocaleString()} yang mahal selalu memiliki daya tarik sendiri."`,
  (char, biaya) => `🤑 *"${char.nama}"*: "Setidaknya kau memahami bahasa uang. Rp ${biaya.toLocaleString()} berbicara cukup jelas."`,
  (char, biaya) => `📦 *"${char.nama}"*: "Aku menerima barang berharga ini senilai Rp ${biaya.toLocaleString()}."`,
  (char, biaya) => `💰 *"${char.nama}"*: "Tidak semua orang mau memberi Rp ${biaya.toLocaleString()} sebanyak ini."`,
  (char, biaya) => `✨ *"${char.nama}"*: "Usahamu cukup terlihat kali ini. Rp ${biaya.toLocaleString()} bukan jumlah kecil."`,
  (char, biaya) => `💳 *"${char.nama}"*: "Transaksi Rp ${biaya.toLocaleString()} yang cukup menguntungkan."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Aku menghargai niat baikmu. Rp ${biaya.toLocaleString()} cukup untuk menunjukkannya."`,
  (char, biaya) => `📈 *"${char.nama}"*: "Investasi Rp ${biaya.toLocaleString()} yang menarik untuk hubungan ini."`,
  (char, biaya) => `💸 *"${char.nama}"*: "Jangan menyesal setelah menghabiskan Rp ${biaya.toLocaleString()} semuanya."`,
  (char, biaya) => `🎁 *"${char.nama}"*: "Hadiahmu sebesar Rp ${biaya.toLocaleString()} diterima dengan baik."`,
  (char, biaya) => `🌟 *"${char.nama}"*: "Kau mulai tahu cara membuatku puas. Rp ${biaya.toLocaleString()} cukup bagus."`,
  (char, biaya) => `💰 *"${char.nama}"*: "Aku ingat orang yang menghargai nilainya. Termasuk Rp ${biaya.toLocaleString()} ini."`,
  (char, biaya) => `💵 *"${char.nama}"*: "Baiklah, kali ini aku menerima Rp ${biaya.toLocaleString()}-mu."`
]

export {
  CSM_PICTURES, EXCLUSIVE_PICTURES, PARTNER_PICTURES, GALLERY_PICTURES, DEVIL_LIST, CONTRACT_PRICE, NO_HOST_DEVILS, DOLL_DEVILS, getContractMeta, CHARACTER_LIST, WEAPON_LIST, STORY_LIST, MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, MAIN_JOB_LIST, SIDE_JOB_LIST, EVENT_LIST, COMMAND_SECTIONS, BOSS_LIST, ACHIEVEMENT_LIST, checkAchievements, ITEM_LIST, LOCATION_LIST, characterNames, itemNames, tierRank, TITLE_LIST, getTitle, getTitleBackstory, parseBonus, bar, calcSetBonus, calcBonus, BUFF_LIST, QUEST_LIST, RAID_RANK_WEIGHTS, JOB_WORK_STORIES, ERASURE_BACKSTORIES, ITEM_COMMENTS, PARTNER_REACTIONS, TERROR_SUCCESS_STORIES, TERROR_DEATH_STORIES, CONTRACT_SCENES, PARTNER_MISSION_DIALOGS, EXPLORE_STORIES, MISSION_STORIES, RESCUE_STORIES, RESCUE_RESULTS, CITIZEN_RESPONSES, CSM_CONTENT_TOTALS, MAKIMA_WIN_DIALOGS, MAKIMA_LOSE_DIALOGS, MAKIMA_HELL_DIALOGS, VISIT_PARTNER_DIALOGS, RAID_PARTNER_DIALOGS, SHORT_PARTNER_RESPONSES, GIFT_REACTIONS_BLOOD, GIFT_REACTIONS_MONEY
}
export default {
  CSM_PICTURES, EXCLUSIVE_PICTURES, PARTNER_PICTURES, GALLERY_PICTURES, DEVIL_LIST, CONTRACT_PRICE, NO_HOST_DEVILS, DOLL_DEVILS, getContractMeta, CHARACTER_LIST, WEAPON_LIST, STORY_LIST, MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, MAIN_JOB_LIST, SIDE_JOB_LIST, EVENT_LIST, COMMAND_SECTIONS, BOSS_LIST, ACHIEVEMENT_LIST, checkAchievements, ITEM_LIST, LOCATION_LIST, characterNames, itemNames, tierRank, TITLE_LIST, getTitle, getTitleBackstory, parseBonus, bar, calcSetBonus, calcBonus, BUFF_LIST, QUEST_LIST, RAID_RANK_WEIGHTS, JOB_WORK_STORIES, ERASURE_BACKSTORIES, ITEM_COMMENTS, PARTNER_REACTIONS, TERROR_SUCCESS_STORIES, TERROR_DEATH_STORIES, CONTRACT_SCENES, PARTNER_MISSION_DIALOGS, EXPLORE_STORIES, MISSION_STORIES, RESCUE_STORIES, RESCUE_RESULTS, CITIZEN_RESPONSES, CSM_CONTENT_TOTALS, MAKIMA_WIN_DIALOGS, MAKIMA_LOSE_DIALOGS, MAKIMA_HELL_DIALOGS, VISIT_PARTNER_DIALOGS, RAID_PARTNER_DIALOGS, SHORT_PARTNER_RESPONSES, GIFT_REACTIONS_BLOOD, GIFT_REACTIONS_MONEY
}
