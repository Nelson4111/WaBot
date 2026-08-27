// DATABASE DEVIL HUNTER RPG

export const CSM_PICTURES = {
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

export const EXCLUSIVE_PICTURES = [
  ['Reze, Makima, dan Power', CSM_PICTURES.exclusive[0]],
  ['Four Horsemen', CSM_PICTURES.exclusive[1]],
  ['Partner Portrait', CSM_PICTURES.exclusive[2]],
  ['Reze Arc Wallpaper', CSM_PICTURES.exclusive[3]],
  ['Full Character', CSM_PICTURES.exclusive[4]]
]
export const PARTNER_PICTURES = [
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

export const GALLERY_PICTURES = [
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

// === E RANK - KETAKUTAN SEHARI-HARI (LEMAH) ===
export const DEVIL_LIST = [
  { nama: 'Tomato Devil',    rank: 'E', tipe: 'Devil', hp: 45,  dmg: 12, exp: 25,  blood: 90,  emoji: '🍅', runBlood: 10, desc: 'Target buruan paling pertama, lahir dari ketakutan sepele manusia akan buah merah berair.' },
  { nama: 'Chicken Devil',   rank: 'E', tipe: 'Devil', hp: 30,  dmg: 5,  exp: 15,  blood: 50,  emoji: '🐔', runBlood: 5,  desc: 'Bucky, maskot kelas tak berbahaya yang ketakutannya hanya berkisar seputar paruh dan bulu unggas.' },
  { nama: 'Mosquito Devil',  rank: 'E', tipe: 'Devil', hp: 55,  dmg: 16, exp: 35,  blood: 110, emoji: '🦟', runBlood: 15, desc: 'Ancaman minor di gang gelap, mewakili gangguan gigitan serangga penghisap darah di malam hari.' },
  { nama: 'Cockroach Devil', rank: 'E', tipe: 'Devil', hp: 60,  dmg: 17, exp: 40,  blood: 120, emoji: '🪳', runBlood: 10, desc: 'Perwujudan dari rasa jijik masif manusia terhadap serangga kotor yang mendiami sudut-sudut rumah.' },
  { nama: 'Coffee Devil',    rank: 'E', tipe: 'Devil', hp: 70,  dmg: 20, exp: 50,  blood: 150, emoji: '☕', runBlood: 50, desc: 'Iblis kafein, manifestasi dari kecemasan para pekerja yakusa akan rasa pahit dan insomnia akut.' },
  { nama: 'Pillbug Fiend',   rank: 'E', tipe: 'Fiend', hp: 55,  dmg: 14, exp: 32,  blood: 105, emoji: '🐛', runBlood: 10, desc: 'Mayat siswa yang diambil alih iblis kutu kayu, lemah dan hanya bisa meringkuk saat terancam.' },
  { nama: 'Fly Fiend',       rank: 'E', tipe: 'Fiend', hp: 45,  dmg: 11, exp: 26,  blood: 85,  emoji: '🪰', runBlood: 5,  desc: 'Bangkai manusia yang membusuk dan digerakkan oleh insting hama lalat penular wabah penyakit.' },
  { nama: 'Worm Fiend',      rank: 'E', tipe: 'Fiend', hp: 58,  dmg: 12, exp: 31,  blood: 110, emoji: '🪱', runBlood: 0,  desc: 'Inang manusia dengan gerakan melungkur lambat, merepresentasikan rasa geli terhadap cacing tanah.' },

  // === D RANK - TEROR PERKOTAAN & MEDIS ===
  { nama: 'Zombie Devil',       rank: 'D', tipe: 'Devil', hp: 100, dmg: 45, exp: 80,  blood: 300, emoji: '🧟', runBlood: 30, desc: 'Iblis licik pembuat kontrak dengan Yakuza, memperbudak manusia menjadi bangkai hidup tak berakal.' },
  { nama: 'Bat Devil',          rank: 'D', tipe: 'Devil', hp: 130, dmg: 55, exp: 95,  blood: 380, emoji: '🦇', runBlood: 40, desc: 'Makhluk malam bersayap membran raksasa yang gemar menghisap darah segar demi menyembuhkan lukanya.' },
  { nama: 'Leech Devil',        rank: 'D', tipe: 'Devil', hp: 140, dmg: 60, exp: 100, blood: 400, emoji: '🪱', runBlood: 50, desc: 'Monster pencerna jaringan tubuh manusia, kekasih dari Bat Devil yang bersarang di area saluran air.' },
  { nama: 'Internet Devil',     rank: 'D', tipe: 'Devil', hp: 85,  dmg: 38, exp: 65,  blood: 220, emoji: '📶', runBlood: 40, desc: 'Lahir dari ketakutan modern akan terputusnya koneksi dan hilangnya validitas di dunia maya.' },
  { nama: 'Truck Devil',        rank: 'D', tipe: 'Devil', hp: 120, dmg: 65, exp: 100, blood: 350, emoji: '🚚', runBlood: 0,  desc: 'Monster beroda besi, manifestasi dari trauma kecelakaan lalu lintas parah di jalan raya Tokyo.' },
  { nama: 'Door Devil',         rank: 'D', tipe: 'Devil', hp: 88,  dmg: 30, exp: 68,  blood: 230, emoji: '🚪', runBlood: 0,  desc: 'Iblis konseptual pembatas ruang, mewakili trauma psikologis Denji atas rahasia di balik pintu masa lalunya.' },
  { nama: 'Needle Devil',       rank: 'D', tipe: 'Devil', hp: 96,  dmg: 48, exp: 76,  blood: 260, emoji: '🪡', runBlood: 30, desc: 'Iblis instrumen medis, mewakili ketakutan mendasar manusia terhadap tusukan benda tajam di rumah sakit.' },
  { nama: 'Mold Devil',         rank: 'D', tipe: 'Devil', hp: 98,  dmg: 42, exp: 78,  blood: 280, emoji: '🍄', runBlood: 0,  desc: 'Spora pembusuk berjalan, menyebarkan aroma kapang dan jamur merusak yang merogoh paru-paru.' },
  { nama: 'Lizard Fiend',       rank: 'D', tipe: 'Fiend', hp: 92,  dmg: 32, exp: 74,  blood: 240, emoji: '🦎', runBlood: 30, desc: 'Pemburu liar yang tubuh mayatnya memunculkan sisik reptil hijau, bergerak gesit di atas dinding.' },
  { nama: 'Frog Fiend',         rank: 'D', tipe: 'Fiend', hp: 86,  dmg: 28, exp: 68,  blood: 220, emoji: '🐸', runBlood: 25, desc: 'Fiend dengan bola mata menonjol yang mengeluarkan suara parau, melompat di gang sempit Kanda.' },
  { nama: 'Mole Fiend',         rank: 'D', tipe: 'Fiend', hp: 98,  dmg: 34, exp: 76,  blood: 260, emoji: '🦦', runBlood: 20, desc: 'Inang manusia dengan cakar penggali tanah, gemar bersembunyi di bawah lantai beton bangunan tua.' },
  { nama: 'Owl Fiend',          rank: 'D', tipe: 'Fiend', hp: 96,  dmg: 31, exp: 78,  blood: 250, emoji: '🦉', runBlood: 35, desc: 'Kepala mayatnya bisa berputar 180 derajat, memiliki penglihatan tajam di kegelapan malam pinggiran kota.' },
  { nama: 'Crab Fiend',         rank: 'D', tipe: 'Fiend', hp: 114, dmg: 38, exp: 88,  blood: 315, emoji: '🦀', runBlood: 0,  desc: 'Mayat berlapis cangkang keras dengan capit manusia yang cacat, merangkak miring mencari mangsa.' },
  { nama: 'Scorpion Fiend',     rank: 'D', tipe: 'Fiend', hp: 108, dmg: 41, exp: 85,  blood: 305, emoji: '🦂', runBlood: 15, desc: 'Memiliki ekor tulang beracun yang tumbuh dari tulang belakang inangnya, sangat agresif saat terpojok.' },
  { nama: 'Weasel Fiend',       rank: 'D', tipe: 'Fiend', hp: 94,  dmg: 33, exp: 72,  blood: 230, emoji: '🦡', runBlood: 45, desc: 'Fiend berwujud kurus kering yang licik, ahli mencuri perbekalan darah pemburu iblis pemula.' },
  { nama: 'Rat Devil',          rank: 'D', tipe: 'Devil', hp: 75,  dmg: 35, exp: 55,  blood: 180, emoji: '🐀', runBlood: 20, desc: 'Koloni pengerat selokan Tokyo, manifestasi ketakutan akan penyebaran sampar dan kehancuran ladang.' },
  { nama: 'Pigeon Devil',       rank: 'D', tipe: 'Devil', hp: 80,  dmg: 32, exp: 60,  blood: 190, emoji: '🕊️', runBlood: 30, desc: 'Iblis kepakan sayap, merepresentasikan fobia perkotaan akan kawanan unggas liar pembawa parasit.' },
  { nama: 'Dog Devil',          rank: 'D', tipe: 'Devil', hp: 110, dmg: 38, exp: 90,  blood: 320, emoji: '🐕', runBlood: 40, desc: 'Manifestasi ketakutan manusia akan gigitan anjing rabies liar dan teror gonggongan di kegelapan.' },
  { nama: 'Cat Devil',          rank: 'D', tipe: 'Devil', hp: 105, dmg: 36, exp: 85,  blood: 310, emoji: '🐈', runBlood: 35, desc: 'Lahir dari takhayul sial peliharaan mistis, mencakar ingatan manusia melalui tatapan matanya yang tajam.' },
  { nama: 'Crow Devil',         rank: 'D', tipe: 'Devil', hp: 95,  dmg: 32, exp: 75,  blood: 270, emoji: '🐦', runBlood: 25, desc: 'Burung pembawa pesan kematian, mengonsumsi rasa cemas manusia akan nasib buruk dan pemakaman.' },

  // === C RANK - ANOMALI SUPRANATURAL KEAMANAN PUBLIK ===
  { nama: 'Ghost Devil',        rank: 'C', tipe: 'Devil', hp: 250, dmg: 120, exp: 160, blood: 650, emoji: '👻', runBlood: 0,  desc: 'Entitas transparan bertangan seribu, bergerak murni berdasarkan ketakutan yang dirasakan oleh korbannya.' },
  { nama: 'Fox Devil',          rank: 'C', tipe: 'Devil', hp: 300, dmg: 150, exp: 180, blood: 800, emoji: '🦊', runBlood: 100, desc: 'Iblis raksasa yang menyukai pemuda tampan Keamanan Publik, memotong mangsanya dengan rahang vertikal masif.' },
  { nama: 'Eternity Devil',     rank: 'C', tipe: 'Devil', hp: 450, dmg: 180, exp: 220, blood: 950, emoji: '♾️', runBlood: 0,  desc: 'Anomali pelipat ruang dan waktu, menjebak target dalam koridor lantai hotel tanpa ujung demi keputusasaan.' },
  { nama: 'Shark Devil',        rank: 'C', tipe: 'Devil', hp: 350, dmg: 140, exp: 170, blood: 750, emoji: '🦈', runBlood: 80, desc: 'Penguasa lautan yang mampu berenang menembus benda padat seperti dinding beton dan aspal perkotaan.' },
  { nama: 'Octopus Devil',      rank: 'C', tipe: 'Devil', hp: 320, dmg: 130, exp: 165, blood: 700, emoji: '🐙', runBlood: 60, desc: 'Tentakel raksasa hitam yang terikat kontrak dengan Yoshida, ahli melilit, membungkam, dan membutakan musuh.' },
  { nama: 'Doll Devil',         rank: 'C', tipe: 'Devil', hp: 280, dmg: 110, exp: 150, blood: 600, emoji: '🎎', runBlood: 0,  desc: 'Pemicu kutukan boneka global, merubah kesadaran manusia menjadi manekin mati yang bergerak di bawah perintah.' },
  { nama: 'Gravity Devil',      rank: 'C', tipe: 'Devil', hp: 380, dmg: 160, exp: 195, blood: 850, emoji: '🌌', runBlood: 0,  desc: 'Iblis konseptual fisika, memanipulasi bobot tubuh dan membuat target merasa hancur tertekan oleh tanah.' },
  { nama: 'Silence Devil',      rank: 'C', tipe: 'Devil', hp: 290, dmg: 115, exp: 155, blood: 620, emoji: '🤫', runBlood: 0,  desc: 'Ketakutan akan kesunyian mutlak, meredam seluruh suara dan menyiksa mental target dalam keheningan pekat.' },
  { nama: 'Ear Devil',          rank: 'C', tipe: 'Devil', hp: 200, dmg: 75,  exp: 110, blood: 450, emoji: '👂', runBlood: 50, desc: 'Iblis panca indra berwujud humanoid telinga besar, sempat viral karena konsepnya terhapus sesaat oleh Chainsaw Man.' },
  { nama: 'Mouth Devil',        rank: 'C', tipe: 'Devil', hp: 210, dmg: 80,  exp: 115, blood: 480, emoji: '👄', runBlood: 40, desc: 'Manifestasi fobia kegagalan komunikasi, sempat melenyapkan mulut dari seluruh ras manusia saat tertelan.' },
  { nama: 'Muscle Devil',       rank: 'C', tipe: 'Devil', hp: 260, dmg: 125, exp: 145, blood: 580, emoji: '💪', runBlood: 0,  desc: 'Iblis serat daging manipulator, mampu mengendalikan otot pemburu amatir untuk saling meremukkan tubuh.' },
  { nama: 'Stone Devil',        rank: 'C', tipe: 'Devil', hp: 270, dmg: 130, exp: 140, blood: 560, emoji: '🪨', runBlood: 0,  desc: 'Iblis kerak bumi, merubah targetnya menjadi patung batu rapuh yang akan hancur lebur berkeping-keping.' },
  { nama: 'Nail Fiend',         rank: 'C', tipe: 'Fiend', hp: 220, dmg: 110, exp: 125, blood: 500, emoji: '📍', runBlood: 50, desc: 'Inang manusia bermata paku besi tajam, bertarung brutal menggunakan palu paku untuk merusak saraf lawan.' },
  { nama: 'Guillotine Fiend',   rank: 'C', tipe: 'Fiend', hp: 240, dmg: 135, exp: 135, blood: 540, emoji: '📐', runBlood: 0,  desc: 'Kepalanya berupa pisau eksekusi pancung karat, mengincar leher kriminal dengan insting jagal hukum.' },
  { nama: 'Mantis Fiend Elite', rank: 'C', tipe: 'Fiend', hp: 230, dmg: 120, exp: 130, blood: 520, emoji: '🦗', runBlood: 40, desc: 'Sabetan lengan sabit mayat inang yang digerakkan iblis belalang sembah, mengincar urat nadi target.' },
  { nama: 'Fox Fiend Spawn',    rank: 'C', tipe: 'Fiend', hp: 250, dmg: 125, exp: 140, blood: 550, emoji: '🦊', runBlood: 80, desc: 'Wujud Fiend sisa keturunan Fox Devil yang gagal berevolusi, memiliki taring panjang mencuat dari rahang.' },
  { nama: 'Centipede Fiend',    rank: 'C', tipe: 'Fiend', hp: 215, dmg: 105, exp: 120, blood: 490, emoji: '🐛', runBlood: 30, desc: 'Inang manusia dengan barisan puluhan kaki serangga merayap di sepanjang punggung, bergerak mengerikan.' },
  { nama: 'Spider Fiend Ward',  rank: 'C', tipe: 'Fiend', hp: 245, dmg: 130, exp: 145, blood: 570, emoji: '🕷️', runBlood: 60, desc: 'Fiend pelayan buatan bawah arahan Princi, merangkak cepat di plafon menyergap mangsa dari kegelapan.' },
  { nama: 'Leech Fiend Elite',  rank: 'C', tipe: 'Fiend', hp: 235, dmg: 115, exp: 132, blood: 510, emoji: '🪱', runBlood: 0,  desc: 'Inang basah berlendir yang organ mulutnya digantikan lubang pengisap darah anorganik, mengerikan.' },
  { nama: 'Shadow Fiend',       rank: 'C', tipe: 'Fiend', hp: 205, dmg: 95,  exp: 115, blood: 460, emoji: '👤', runBlood: 90, desc: 'Kondisi mayat hitam tanpa fitur wajah, menyelinap di bawah bayangan kaki pemburu iblis sipil.' },
  { nama: 'Dagger Fiend',       rank: 'C', tipe: 'Fiend', hp: 225, dmg: 118, exp: 128, blood: 530, emoji: '🗡️', runBlood: 40, desc: 'Lengan inang digantikan oleh pisau belati berkarat, menusuk tanpa henti seperti boneka rusak.' },
  { nama: 'Axe Fiend',          rank: 'C', tipe: 'Fiend', hp: 238, dmg: 128, exp: 134, blood: 545, emoji: '🪓', runBlood: 20, desc: 'Iblis kapak penebang pohon merasuki mayat kekar, mengayunkan tebasan vertikal pembelah tulang.' },
  { nama: 'Spear Rookie Fiend', rank: 'C', tipe: 'Fiend', hp: 222, dmg: 112, exp: 126, blood: 525, emoji: '🔱', runBlood: 35, desc: 'Mayat yang membawa replika tombak tulang dari sisa lengan kirinya, menyerang dengan menusuk ulu hati.' },

  // === B RANK - ANOMALI TINGKAT MENENGAH (ANCAMAN PROVINSI) ===
  { nama: 'Snake Devil',        rank: 'B', tipe: 'Devil', hp: 600, dmg: 350, exp: 380, blood: 1800, emoji: '🐍', runBlood: 0,  desc: 'Iblis ular raksasa pemakan bayaran tumbal kuku, mampu menelan musuh utuh dan memuntahkannya kembali.' },
  { nama: 'Future Devil',       rank: 'B', tipe: 'Devil', hp: 750, dmg: 400, exp: 450, blood: 2200, emoji: '🔮', runBlood: 0,  desc: 'Entitas nyentrik penghuni sel bawah tanah, bertransaksi masa depan tragis demi meminjamkan indra penglihatan.' },
  { nama: 'Curse Devil',        rank: 'B', tipe: 'Devil', hp: 800, dmg: 480, exp: 480, blood: 2500, emoji: '📍', runBlood: 200, desc: 'Manifestasi kutukan tengkorak berkepala dua, mengeksekusi instan musuh setelah jarum pedang paku ditusuk 4 kali.' },
  { nama: 'Money Devil',        rank: 'B', tipe: 'Devil', hp: 680, dmg: 320, exp: 410, blood: 2000, emoji: '💰', runBlood: 500, desc: 'Lahir dari ketakutan manusia akan jeratan utang, kemiskinan, dan hilangnya kekuasaan finansial di Tokyo.' },
  { nama: 'Lightning Devil',    rank: 'B', tipe: 'Devil', hp: 700, dmg: 390, exp: 430, blood: 2100, emoji: '⚡', runBlood: 150, desc: 'Guntur berjalan, manifestasi kilatan petir destruktif yang memanggang sistem saraf makluk hidup sesaat.' },
  { nama: 'Ice Devil',          rank: 'B', tipe: 'Devil', hp: 720, dmg: 360, exp: 420, blood: 2150, emoji: '🧊', runBlood: 100, desc: 'Fobia badai salju dan kematian karena hipotermia, membekukan aliran darah dalam radius jarak dekat.' },
  { nama: 'Fire Devil',         rank: 'B', tipe: 'Devil', hp: 850, dmg: 440, exp: 460, blood: 2400, emoji: '🔥', runBlood: 0,  desc: 'Api kemarahan masif, memperbanyak pengikutnya di Part 2 dengan menyamarkan kontrak palsu berbentuk keadilan.' },
  { nama: 'Mirror Devil',       rank: 'B', tipe: 'Devil', hp: 660, dmg: 310, exp: 390, blood: 1900, emoji: '🪞', runBlood: 0,  desc: 'Trauma psikologis pantulan diri dan kegilaan identitas, membalikkan arah serangan balik ke pemilik aslinya.' },
  { nama: 'Void Devil',         rank: 'B', tipe: 'Devil', hp: 710, dmg: 380, exp: 440, blood: 2300, emoji: '🕳️', runBlood: 0,  desc: 'Ketakutan akan jatuh ke dalam lubang tak berdasar, melenyapkan area pijakan tanah medan tempur.' },
  { nama: 'Poison Devil',       rank: 'B', tipe: 'Devil', hp: 690, dmg: 410, exp: 425, blood: 2250, emoji: '☠️', runBlood: 250, desc: 'Asap racun berbau belerang menyengat, melelehkan jaringan paru-paru pemburu iblis dalam hitungan detik.' },
  { nama: 'Punishment Devil',   rank: 'B', tipe: 'Devil', hp: 900, dmg: 520, exp: 500, blood: 2700, emoji: '⚖️', runBlood: 0,  desc: 'Iblis hukuman mati milik Makima, turun dari langit sebagai gumpalan senjata tajam dengan tumbal nyawa manusia.' },
  { nama: 'Shark Fiend',        rank: 'B', tipe: 'Fiend', hp: 450, dmg: 190, exp: 280, blood: 1200, emoji: '🦈', runBlood: 100, desc: 'Wujud Fiend dari Beam, gila dan mengidolakan Chainsaw Man, menyelam menembus lantai demi menyergap.' },
  { nama: 'Violence Fiend',     rank: 'B', tipe: 'Fiend', hp: 550, dmg: 250, exp: 320, blood: 1400, emoji: '👊', runBlood: 0,  desc: 'Galgali, menggunakan topeng gas penahan kekuatan murni iblisnya agar tubuh mayat manusianya tidak meledak.' },
  { nama: 'Princi Spider',      rank: 'B', tipe: 'Fiend', hp: 480, dmg: 210, exp: 300, blood: 1300, emoji: '🕷️', runBlood: 150, desc: 'Princi dalam penyamaran humanoid setengah laba-laba, patuh pada Makima dan ahli merayap memotong target.' },
  { nama: 'Pingtsi Fiend',      rank: 'B', tipe: 'Fiend', hp: 400, dmg: 160, exp: 250, blood: 1100, emoji: '👹', runBlood: 120, desc: 'Fiend peliharaan Quanxi yang gemar membeberkan informasi acak, menyerang musuh menggunakan rambut kuncirnya.' },
  { nama: 'Cosmo Fiend',        rank: 'B', tipe: 'Fiend', hp: 420, dmg: 150, exp: 260, blood: 1150, emoji: '🌌', runBlood: 0,  desc: 'Iblis Kosmos yang otaknya meluber keluar, melumpuhkan kesadaran musuh dengan paksaan pengetahuan total semesta.' },
  { nama: 'Long Dragon Fiend',  rank: 'B', tipe: 'Fiend', hp: 520, dmg: 240, exp: 310, blood: 1350, emoji: '🐉', runBlood: 0,  desc: 'Fiend bertanduk naga yang hanya bisa mengeluarkan suara raungan, menyemburkan api dari sisa paru-parunya.' },
  { nama: 'Tsugihagi Fiend',    rank: 'B', tipe: 'Fiend', hp: 410, dmg: 140, exp: 240, blood: 1050, emoji: '🧵', runBlood: 200, desc: 'Fiend pendiam dengan jahitan di sekujur mayat kulit tubuhnya, bertindak sebagai tabib penyembuh faksi China.' },
  { nama: 'Seraphim Insect',    rank: 'B', tipe: 'Fiend', hp: 460, dmg: 180, exp: 275, blood: 1220, emoji: '🪰', runBlood: 0,  desc: 'Pengikut setia Chainsaw Man berkepala serangga bersayap, menyerang dengan gigitan hama pembawa parasit.' },
  { nama: 'Dominion Beast',     rank: 'B', tipe: 'Fiend', hp: 490, dmg: 200, exp: 290, blood: 1280, emoji: '🦁', runBlood: 0,  desc: 'Humanoid bertelinga mamalia besar sekte Makima, mengandalkan insting cakar buas pelindung tuannya.' },
  { nama: 'Virtue Headless',    rank: 'B', tipe: 'Fiend', hp: 500, dmg: 205, exp: 295, blood: 1300, emoji: '👤', runBlood: 0,  desc: 'Makhluk tanpa kepala pelayan Chainsaw Man lama, menyerang membabi buta menggunakan pancaran aura gelap.' },
  { nama: 'Claw Fiend',         rank: 'B', tipe: 'Fiend', hp: 440, dmg: 175, exp: 265, blood: 1120, emoji: '🦅', runBlood: 100, desc: 'Mayat inang dengan jari-jemari tangan yang mengeras menyerupai kuku elang pemburu, mencabik urat saraf.' },
  { nama: 'Fang Fiend',         rank: 'B', tipe: 'Fiend', hp: 445, dmg: 180, exp: 270, blood: 1140, emoji: '🐺', runBlood: 80,  desc: 'Gigi taring monster serigala memenuhi rongga mulut mayat inangnya, merobek daging mangsa dengan brutal.' },
  { nama: 'Blade Fiend Elite',  rank: 'B', tipe: 'Fiend', hp: 470, dmg: 195, exp: 285, blood: 1250, emoji: '🗡️', runBlood: 0,  desc: 'Sisa pemburu liar yang gagal bertransformasi penuh, menggunakan bilah besi pendek untuk perkelahian jarak dekat.' },
  { nama: 'Laser Fiend Prototype', rank: 'B', tipe: 'Fiend', hp: 430, dmg: 185, exp: 260, blood: 1100, emoji: '🔮', runBlood: 500, desc: 'Eksperimen gagal pasar hitam, menembakkan kilatan energi fobia radiasi dari rongga mata mayatnya.' },

  // === A RANK - ANOMALI TINGKAT TINGGI (ANCAMAN BENCANA NASIONAL) ===
  { nama: 'Katana Man',         rank: 'A', tipe: 'Devil', hp: 1500, dmg: 650, exp: 900, blood: 4000, emoji: '🗡️', runBlood: 0,   desc: 'Bentuk murni dari esensi pedang Yakuza, menebas realitas dengan kecepatan mencabut pedang yang fatal.' },
  { nama: 'Crossbow Devil',     rank: 'A', tipe: 'Devil', hp: 1400, dmg: 600, exp: 850, blood: 3800, emoji: '🏹', runBlood: 300,  desc: 'Wujud murni panah legendaris, mampu memuntahkan ratusan anak panah badai yang menembus lapis baja perkotaan.' },
  { nama: 'Justice Devil',      rank: 'A', tipe: 'Devil', hp: 1600, dmg: 700, exp: 950, blood: 4200, emoji: '⚖️', runBlood: 0,   desc: 'Wujud raksasa pemicu kontrak sekolah, menghakimi target berdasarkan definisi keadilan yang menyimpang.' },
  { nama: 'Plague Devil',       rank: 'A', tipe: 'Devil', hp: 1350, dmg: 580, exp: 800, blood: 3500, emoji: '☣️', runBlood: 0,   desc: 'Ketakutan global akan wabah mematikan masa lalu, menyebarkan patogen pembusuk sel dalam radius masif.' },
  { nama: 'Miri Longsword',     rank: 'A', tipe: 'Fiend', hp: 950,  dmg: 380, exp: 550, blood: 2500, emoji: '⚔️', runBlood: 0,   desc: 'Wujud manusia dari Longsword Hybrid, bertarung mengandalkan kelincahan pedang ganda dari kedua lengannya.' },
  { nama: 'Whip Hybrid Fiend',  rank: 'A', tipe: 'Fiend', hp: 900,  dmg: 360, exp: 520, blood: 2400, emoji: '⛓️', runBlood: 0,   desc: 'Wujud manusia dari Whip Hybrid, mencambuk mangsa dari jarak menengah dengan tali cambuk daging berapi.' },
  { nama: 'Spear Hybrid Fiend', rank: 'A', tipe: 'Fiend', hp: 980,  dmg: 410, exp: 580, blood: 2650, emoji: '🔱', runBlood: 350,  desc: 'Wujud manusia dari Spear Hybrid, melempar tombak tulang berkecepatan tinggi yang merusak organ dalam.' },
  { nama: 'Gun Fiend Aki',      rank: 'A', tipe: 'Fiend', hp: 1200, dmg: 480, exp: 700, blood: 3200, emoji: '⛄', runBlood: 0,   desc: 'Wujud tragis Aki Hayakawa saat diambil alih Gun Devil, menembak membabi buta sembari berhalusinasi bola salju.' },
  { nama: 'Armor Fiend',        rank: 'A', tipe: 'Fiend', hp: 1100, dmg: 310, exp: 500, blood: 2200, emoji: '🛡️', runBlood: 0,   desc: 'Mayat dengan kerangka besi pelindung tebal di sekujur kulitnya, bertindak sebagai tameng barisan depan.' },
  { nama: 'Scythe Fiend',       rank: 'A', tipe: 'Fiend', hp: 880,  dmg: 390, exp: 540, blood: 2350, emoji: '🪝', runBlood: 400,  desc: 'Lengan inangnya bertransformasi menjadi sabit pemanen padi raksasa, mengincar kepala pemburu sipil.' },
  { nama: 'Tornado Fiend',      rank: 'A', tipe: 'Fiend', hp: 920,  dmg: 370, exp: 530, blood: 2400, emoji: '🌪️', runBlood: 0,   desc: 'Mayat yang memutar sisa organ tubuhnya untuk menciptakan pusaran angin kencang pembawa puing kaca.' },

  // === S RANK - ENTIAS TRANSENDENTAL (ANCAMAN BENCANA GLOBAL / KATASTROFE) ===
  { nama: 'Cosmos Devil',       rank: 'S', tipe: 'Devil', hp: 4000, dmg: 1100, exp: 2000, blood: 12000, emoji: '🌌', runBlood: 0,  desc: 'Wujud murni Iblis Kosmos, menjejalkan miliaran berkas ingatan alam semesta hingga otak target terbakar.' },
  { nama: 'Hell Devil',         rank: 'S', tipe: 'Devil', hp: 5500, dmg: 1400, exp: 2800, blood: 16000, emoji: '🔥', runBlood: 0,  desc: 'Penguasa gerbang neraka tanpa wajah, memanggil tangan raksasa dari langit untuk menyeret target ke jurang maut.' },
  { nama: 'Prison Devil',       rank: 'S', tipe: 'Devil', hp: 6000, dmg: 1500, exp: 3000, blood: 18000, emoji: '🔗', runBlood: 0,  desc: 'Manifestasi ketakutan akan kurungan bawah tanah dan hilangnya kebebasan, merantai pergerakan target total.' },
  { nama: 'Falling Devil',      rank: 'S', tipe: 'Devil', hp: 5000, dmg: 1300, exp: 2500, blood: 15000, emoji: '🪽', runBlood: 0,  desc: 'Iblis Kejatuhan tingkat Primal, membalikkan gravitasi bumi berdasarkan tingkat trauma dan lubang batin target.' },
  { nama: 'Nightmare Devil',    rank: 'S', tipe: 'Devil', hp: 5200, dmg: 1350, exp: 2600, blood: 15500, emoji: '😱', runBlood: 0,  desc: 'Manifestasi kelumpuhan tidur (sleep paralysis), memproyeksikan ilusi ketakutan bawah sadar paling mematikan.' },
  { nama: 'Regret Devil',       rank: 'S', tipe: 'Devil', hp: 4800, dmg: 1200, exp: 2400, blood: 14000, emoji: '😭', runBlood: 0,  desc: 'Lahir dari keputusasaan atas keputusan masa lalu yang salah, melemahkan mental bertarung musuh hingga nol.' },
  { nama: 'Witch Devil',        rank: 'S', tipe: 'Devil', hp: 5100, dmg: 1280, exp: 2450, blood: 14800, emoji: '🧙', runBlood: 0,  desc: 'Manifestasi kutukan sihir hitam abad pertengahan, memanipulasi boneka jerami tumbal organ dalam dari jauh.' },
  { nama: 'Tyranny Devil',      rank: 'S', tipe: 'Devil', hp: 5800, dmg: 1450, exp: 2900, blood: 17000, emoji: '👑', runBlood: 0,  desc: 'Lahir dari ketakutan akan rezim diktator yang kejam, menekan kesadaran lawan dengan aura penundukan paksa.' },
  { nama: 'Barem Bridge',      rank: 'S', tipe: 'Fiend', hp: 1800, dmg: 490,  exp: 1100, blood: 5000,  emoji: '🔥', runBlood: 0,  desc: 'Wujud manusia dari Flamethrower Hybrid, membakar area sekitar dengan gas belerang dan kompor pemantik api.' },
  { nama: 'Evolved Blood Fiend',rank: 'S', tipe: 'Fiend', hp: 1650, dmg: 470,  exp: 1000, blood: 4800,  emoji: '🩸', runBlood: 0,  desc: 'Wujud Power yang bangkit setelah meminum darah Chainsaw Man, mengendalikan senjata darah tajam berskala besar.' },
  { nama: 'Inferno Fiend',      rank: 'S', tipe: 'Fiend', hp: 1900, dmg: 495,  exp: 1150, blood: 5200,  emoji: '🔥', runBlood: 0,  desc: 'Inang mayat yang diselimuti api berkobar terus-menerus, merubah medan tempur menjadi abu vulkanik pekat.' },
  { nama: 'Glacier Fiend',      rank: 'S', tipe: 'Fiend', hp: 1950, dmg: 460,  exp: 1080, blood: 5100,  emoji: '🧊', runBlood: 0,  desc: 'Mayat beku dengan lapisan es abadi pelindung dada, menurunkan suhu tubuh pemburu iblis di sekitarnya.' },
  { nama: 'Phantom Fiend Alpha',   rank: 'S',  tipe: 'Fiend', hp: 1550, dmg: 440,  exp: 980,  blood: 4500,  emoji: '👻', runBlood: 450, desc: 'Inang transparan setengah gaib, mengaburkan pandangan visual tim aktif sebelum meluncurkan terkaman fisik.' },
  { nama: 'Chainsaw Fiend Clone',  rank: 'S',  tipe: 'Fiend', hp: 2000, dmg: 500,  exp: 1200, blood: 6000,  emoji: '⛓️', runBlood: 0,   desc: 'Klona buatan pengikut gereja yang meniru wujud gergaji mesin Denji, brutal namun terbatas pada ketahanan mayat inangnya.' },

  // === SS RANK - PRIMAL FEAR DEVILS & PURE WEAPON AWAKENING (BENCANA GLOBAL MUTLAK) ===
  { nama: 'Darkness Devil',     rank: 'SS', tipe: 'Devil', hp: 12000, dmg: 3500, exp: 6000, blood: 35000, emoji: '🌑', runBlood: 0,   desc: 'Iblis tingkat Primal Fear, mewakili ketakutan mendasar makhluk hidup sejak awal waktu terhadap kegelapan pekat abadi.' },
  { nama: 'Oblivion Devil',     rank: 'SS', tipe: 'Devil', hp: 11000, dmg: 3200, exp: 5800, blood: 32000, emoji: '👁️', runBlood: 0,   desc: 'Eksistensi ketakutan akan dilupakan sepenuhnya, melumpuhkan kesadaran musuh dengan kehampaan eksistensial yang mutlak.' },
  { nama: 'Sword Devil',        rank: 'SS', tipe: 'Devil', hp: 10000, dmg: 2800, exp: 5500, blood: 30000, emoji: '⚔️', runBlood: 500, desc: 'Wujud murni perwujudan pedang pusaka kuno abad pertengahan, membelah lapis baja dalam radius tebasan global.' },
  { nama: 'Thunder Devil',      rank: 'SS', tipe: 'Devil', hp: 11500, dmg: 3300, exp: 5900, blood: 33000, emoji: '🌩️', runBlood: 0,   desc: 'Ketakutan badai petir purba pemutus rantai kehidupan, memanipulasi voltase energi kilat raksasa dari langit neraka.' },
  { nama: 'Abyss Devil',        rank: 'SS', tipe: 'Devil', hp: 12500, dmg: 3600, exp: 6200, blood: 36000, emoji: '🌊', runBlood: 0,   desc: 'Perwujudan fobia kedalaman laut terdalam (Thalassophobia), meremukkan struktur tubuh target dengan tekanan air masif.' },
  { nama: 'Love Devil',         rank: 'SS', tipe: 'Devil', hp: 9500,  dmg: 2500, exp: 5200, blood: 28000, emoji: '💘', runBlood: 0,   desc: 'Manipulator emosional psikologis manusia, menyiksa batin musuh melalui fobia penolakan, patah hati, dan obsesi gila.' },
  { nama: 'Katana Devil',       rank: 'SS', tipe: 'Devil', hp: 9800,  dmg: 2700, exp: 5400, blood: 29000, emoji: '🗡️', runBlood: 0,   desc: 'Wujud Iblis murni seutuhnya dari Katana Man tanpa wadah manusia, memotong dimensi ruang dengan ketajaman absolut.' },
  { nama: 'Crossbow Devil',     rank: 'SS', tipe: 'Devil', hp: 9200,  dmg: 2600, exp: 5300, blood: 28500, emoji: '🏹', runBlood: 300, desc: 'Wujud asal Crossbow Hybrid milik Quanxi, memuntahkan ratusan anak panah berujung tulang yang menghancurkan satu blok kota.' },
  { nama: 'Bomb Devil',         rank: 'SS', tipe: 'Devil', hp: 10500, dmg: 3000, exp: 5700, blood: 31000, emoji: '💣', runBlood: 0,   desc: 'Esensi murni dari ledakan taktis mesiu Soviet, memicu reaksi berantai misil hulu ledak yang meratakan medan pertempuran.' },
  { nama: 'Flame Devil',        rank: 'SS', tipe: 'Devil', hp: 10200, dmg: 2900, exp: 5600, blood: 30500, emoji: '🔥', runBlood: 0,   desc: 'Wujud Iblis sejati penyembur api faksi gereja, membakar habis seluruh karbon makluk hidup dalam hitungan milidetik.' },
  { nama: 'Whip Devil',         rank: 'SS', tipe: 'Devil', hp: 9000,  dmg: 2400, exp: 5000, blood: 27000, emoji: '⛓️', runBlood: 0,   desc: 'Sabetan cambuk konseptual berkecepatan suara, merobek kulit dan memotong pertahanan benteng terkuat Keamanan Publik.' },
  { nama: 'Spear Devil',        rank: 'SS', tipe: 'Devil', hp: 9400,  dmg: 2650, exp: 5150, blood: 27500, emoji: '🔱', runBlood: 350, desc: 'Tombak takdir pembembus realitas fisik, dilemparkan dari kegelapan neraka untuk menyula jantung mangsanya.' },
  { nama: 'Reze Bomb Hybrid',   rank: 'SS', tipe: 'Fiend', hp: 3500,  dmg: 495,  exp: 2800, blood: 12000, emoji: '💣', runBlood: 0,   desc: 'Wujud Hybrid taktis milik Reze dalam batasan fisik manusia, meledakkan sisa organ tubuhnya sebagai taktik ofensif.' },
  { nama: 'Quanxi',             rank: 'SS', tipe: 'Fiend', hp: 3600,  dmg: 500,  exp: 2900, blood: 12500, emoji: '🏹', runBlood: 0,   desc: 'Kombinasi kecepatan bertarung assassins China berkecepatan puncak, dibatasi ketahanan wadah mayat manusia.' },
  { nama: 'Katana Fiend Master', rank: 'SS', tipe: 'Fiend', hp: 3200,  dmg: 480,  exp: 2600, blood: 11000, emoji: '🗡️', runBlood: 300, desc: 'Pembalasan dendam berdarah keturunan Yakuza, menebas dengan ayunan pedang silang yang mematikan saraf pemburu.' },
  { nama: 'Abyss Fiend Sovereign', rank: 'SS', tipe: 'Fiend', hp: 3800, dmg: 490,  exp: 3000, blood: 13000, emoji: '🌊', runBlood: 0,   desc: 'Inang manusia pembawa kutukan pasang air laut, memuntahkan cairan asin pekat yang menenggelamkan ruangan taktis.' },
  { nama: 'Thunder Fiend Monarch', rank: 'SS', tipe: 'Fiend', hp: 3700, dmg: 485,  exp: 2950, blood: 12800, emoji: '🌩️', runBlood: 0,   desc: 'Mayat hangus yang digerakkan oleh sisa lonjakan daya listrik statis, menyetrum musuh yang menyentuhnya langsung.' },
  { nama: 'Sovereign Fiend Lord', rank: 'SS', tipe: 'Fiend', hp: 3900, dmg: 500,  exp: 3100, blood: 13500, emoji: '👑', runBlood: 0,   desc: 'Evolusi mayat inang bangsawan penyembah kegelapan neraka, memancarkan dominasi aura dingin pembatas ruang gerak.' },
  { nama: 'Glacier Overlord',    rank: 'SS', tipe: 'Fiend', hp: 4000, dmg: 475,  exp: 3050, blood: 13200, emoji: '🧊', runBlood: 0,   desc: 'Tubuh inang yang membeku total menjadi kristal es hitam, mematahkan bilah pedang paku pemburu iblis veteran.' },
  { nama: 'Inferno Archfiend',    rank: 'SS', tipe: 'Fiend', hp: 4100, dmg: 500,  exp: 3200, blood: 14000, emoji: '🔥', runBlood: 0,   desc: 'Kepala mayatnya meleleh menjadi magma membara, memicu ledakan gelombang panas dalam koridor pertempuran.' },
  { nama: 'Nightmare Stalker',   rank: 'SS', tipe: 'Fiend', hp: 3400, dmg: 460,  exp: 2500, blood: 10500, emoji: '😱', runBlood: 450, desc: 'Inang kurus kering manipulator mimpi buruk bawah sadar, menyerang dari sudut buta ruangan interogasi publik.' },
  { nama: 'Plague Fiend Overlord', rank: 'SS',  tipe: 'Fiend', hp: 4200,  dmg: 490,  exp: 3300,  blood: 14500, emoji: '☣️', runBlood: 0,    desc: 'Wadah inang pembawa spora patogen mematikan, merusak pertahanan stat armor tim aktif dalam hitungan detik.' },
  { nama: 'Scythe Fiend Executioner', rank: 'SS', tipe: 'Fiend', hp: 3600,  dmg: 495,  exp: 2700,  blood: 11500, emoji: '🪝', runBlood: 300,  desc: 'Petarung liar bermutasi dengan lengan sabit besar, mengeksekusi sisa pemburu iblis regional tanpa ampun.' },

  // === SSS RANK - THE FOUR HORSEMEN, PRIMAL FEARS & HERO OF HELL (BENCANA KOSMIK ABSOLUT) ===
  { nama: 'Chainsaw Devil',     rank: 'SSS', tipe: 'Devil', hp: 20000, dmg: 8500, exp: 9000,  blood: 65000, emoji: '⛓️', runBlood: 2000, desc: 'Pochita seutuhnya. Hero of Hell yang ditakuti seluruh iblis karena mampu melenyapkan konsep eksistensi dari ingatan dunia.' },
  { nama: 'Death Devil',         rank: 'SSS', tipe: 'Devil', hp: 25000, dmg: 10000,exp: 10000, blood: 80000, emoji: '💀', runBlood: 0,    desc: 'Anak tertua Four Horsemen, Raja Teror pembawa kiamat akhir zaman yang mewakili ketakutan mutlak makhluk hidup akan kematian.' },
  { nama: 'Darkness Devil Pure', rank: 'SSS', tipe: 'Devil', hp: 18000, dmg: 7500, exp: 8000,  blood: 55000, emoji: '🌑', runBlood: 0,    desc: 'Wujud purba tak tersentuh dari ketakutan kegelapan mendalam, memotong lengan dan kesadaran musuh hanya lewat tatapan mata.' },
  { nama: 'Control Devil',       rank: 'SSS', tipe: 'Devil', hp: 12000, dmg: 5500, exp: 6000,  blood: 40000, emoji: '⛓️', runBlood: 1500, desc: 'Makima dalam esensi konseptual murni, mengendalikan rantai takdir makluk hidup dan mengorbankan nyawa warga negara demi kontraknya.' },
  { nama: 'War Devil',           rank: 'SSS', tipe: 'Devil', hp: 11000, dmg: 5000, exp: 5500,  blood: 35000, emoji: '⚔️', runBlood: 1200, desc: 'Yoru dalam kapasitas militer penuh, merubah setiap jengkal zat, ingatan, dan benda kepemilikan menjadi senjata pemusnah massal.' },
  { nama: 'Famine Devil',        rank: 'SSS', tipe: 'Devil', hp: 14000, dmg: 6000, exp: 7000,  blood: 48000, emoji: '🍖', runBlood: 0,    desc: 'Fami, sang kelaparan dunia. Mampu memperbudak dan mengendalikan entitas apa pun yang memiliki rasa lapar atau lubang batin yang kosong.' },
  { nama: 'Gun Devil',            rank: 'SSS', tipe: 'Devil', hp: 15000, dmg: 7000, exp: 7500,  blood: 50000, emoji: '🔫', runBlood: 0,    desc: 'Manifestasi ketakutan global senjata api, bergerak secepat kilat melintasi benua dan membantai jutaan jiwa dalam hitungan menit.' },
  { nama: 'Falling Devil Primal', rank: 'SSS', tipe: 'Devil', hp: 16000, dmg: 6500, exp: 7200,  blood: 46000, emoji: '🪽', runBlood: 0,    desc: 'Wujud Primal Fear seutuhnya dari Iblis Kejatuhan, bertindak sebagai koki neraka yang menjatuhkan musuh ke langit kosong tanpa ujung.' },
  { nama: 'Aging Devil',         rank: 'SSS', tipe: 'Devil', hp: 17000, dmg: 6800, exp: 7600,  blood: 49000, emoji: '🧓', runBlood: 0,    desc: 'Ketakutan purba akan penuaan, waktu yang mengikis fisik, dan kelapukan eksistensi yang tidak bisa dihindari oleh apa pun.' },
  { nama: 'Hell Devil Overlord', rank: 'SSS', tipe: 'Devil', hp: 15500, dmg: 6200, exp: 6800,  blood: 44000, emoji: '🔥', runBlood: 0,    desc: 'Perwujudan api neraka lapis terdalam, membuka portal transdimensi raksasa untuk membuang seluruh pasukan musuh ke dimensi maut.' },
  { nama: 'Infinity Devil',     rank: 'SSS', tipe: 'Devil', hp: 13000, dmg: 5200, exp: 5800,  blood: 38000, emoji: '♾️', runBlood: 0,    desc: 'Konsep keabadian mutlak, mengunci musuh dalam dimensi ruang berputar yang tidak memiliki celah keluar untuk selamanya.' },
  { nama: 'Chaos Devil',         rank: 'SSS', tipe: 'Devil', hp: 19000, dmg: 7800, exp: 8500,  blood: 58000, emoji: '🌀', runBlood: 0,    desc: 'Lahir dari fobia manusia akan ketidakpastian hancurnya keteraturan sosial, mengacak-acak status taktis medan tempur.' },
  { nama: 'Control Fiend Core',  rank: 'SSS', tipe: 'Fiend', hp: 6200,  dmg: 480,  exp: 4200,  blood: 22000, emoji: '⛓️', runBlood: 800,  desc: 'Wadah manusia (Nayuta) yang membawa warisan rantai kendali Control Devil, mampu membelenggu kesadaran lawan dalam satu giliran.' },
  { nama: 'War Fiend Catalyst',   rank: 'SSS', tipe: 'Fiend', hp: 5800,  dmg: 460,  exp: 3800,  blood: 19000, emoji: '⚔️', runBlood: 500,  desc: 'Wadah gabungan Asa dan Yoru, menempa senjata legendaris berkekuatan destruktif tinggi dari rasa bersalah yang mendalam.' },
  { nama: 'Famine Fiend Vessel',  rank: 'SSS', tipe: 'Fiend', hp: 6500,  dmg: 490,  exp: 4500,  blood: 24000, emoji: '🍖', runBlood: 0,    desc: 'Inkarnasi Fami dalam wujud siswi sekolah, memanggil koloni monster raksasa dari balik bayangan pakaian hitamnya.' },
  { nama: 'Death Fiend Herald',   rank: 'SSS', tipe: 'Fiend', hp: 8000,  dmg: 500,  exp: 5500,  blood: 35000, emoji: '💀', runBlood: 0,    desc: 'Wadah taktis manusia dari Kematian, membawa hawa dingin lubang kubur yang langsung melumpuhkan mental bertarung tim aktif.' },
  { nama: 'Chainsaw Fiend Pinnacle', rank: 'SSS', tipe: 'Fiend', hp: 7500, dmg: 500,  exp: 5000,  blood: 30000, emoji: '⛓️', runBlood: 1000, desc: 'Denji dalam wujud armor gergaji hitam penuh, mengabaikan rasa sakit demi terus menggergaji jantung musuh.' },
  { nama: 'Conquest Fiend Scion', rank: 'SSS', tipe: 'Fiend', hp: 6000,  dmg: 470,  exp: 4000,  blood: 21000, emoji: '🏇', runBlood: 400,  desc: 'Wadah keturunan sekte penunggang kuda pertama, memaksakan perintah mutlak tunduk pada barisan lini depan lawan.' },
  { nama: 'Pestilence Fiend Host', rank: 'SSS', tipe: 'Fiend', hp: 6100,  dmg: 475,  exp: 4100,  blood: 21500, emoji: '🦠', runBlood: 0,    desc: 'Inang biologis penyebar wabah akhir zaman, merusak regenerasi HP tim aktif secara permanen selama pertempuran.' },
  { nama: 'Time Fiend Warden',    rank: 'SSS', tipe: 'Fiend', hp: 6800,  dmg: 485,  exp: 4800,  blood: 26000, emoji: '⏰', runBlood: 0,    desc: 'Wadah manusia manipulator distorsi waktu singkat, memperlambat giliran memukul musuh melalui jerat kronologis.' },
  { nama: 'Infinity Fiend Nexus', rank: 'SSS', tipe: 'Fiend', hp: 7200,  dmg: 495,  exp: 5100,  blood: 28000, emoji: '♾️', runBlood: 0,    desc: 'Inang terjebak yang menjadi jangkar anomali ruang tanpa ujung, menyerap energi serangan fisik musuh menjadi HP.' },
  { nama: 'God Fiend Avatar',     rank: 'SSS', tipe: 'Fiend', hp: 9000,  dmg: 500,  exp: 7000,  blood: 45000, emoji: '👑', runBlood: 1500, desc: 'Manifestasi boneka daging pemuja dogma ketakutan akan dewa, menahan segala jenis debuff status efek (CC Resist).' },
  { nama: 'Chaos Fiend Overdrive', rank: 'SSS', tipe: 'Fiend', hp: 8500,  dmg: 500,  exp: 6500,  blood: 40000, emoji: '🌀', runBlood: 0,    desc: 'Wadah kehancuran total tak terkendali, memicu badai tebasan acak yang memukul seluruh musuh secara beruntun.' }
];

export const CONTRACT_PRICE = {
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

export function getContractMeta(entity) {
  if (!entity) return { types: [], canHost: false, canDoll: false };
  return {
    types: entity.contractTypes || (entity.tipe === 'Devil' ? ['devil'] : ['fiend', 'hybrid']),
    canHost: Boolean(entity.canHost),
    canDoll: Boolean(entity.canDoll)
  };
}

export const CHARACTER_LIST = [
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
export const WEAPON_LIST = [
  {nama: 'Fist', jenis: 'Melee', tier: 'E', dmg: 0, harga: 0, emoji: '👊', dur: 999, user: 'Semua Orang', material: 'Tangan Kosong', desc: 'Senjata dasar. Ga ada damage tapi ga akan pernah rusak.'},
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
export const STORY_LIST = [
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

export const MAIN_LOCATION_LIST = [
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

export const SIDE_LOCATION_LIST = [
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

export const MAIN_JOB_LIST = [
    { job: "Public Safety Devil Hunter", desc: "Pemburu iblis resmi pemerintah di bawah kepolisian dengan risiko kematian yang sangat ekstrem." },
    { job: "Private Devil Hunter", desc: "Pemburu iblis swasta yang bekerja sendiri demi mendapatkan komisi hadiah uang dari klien sipil." },
    { job: "Devil Hunter High School Student", desc: "Murid SMA yang aktif di klub pemburu iblis sekolah dan diawasi oleh agen keamanan publik." },
    { job: "Yakuza / Mafia Member", desc: "Anggota sindikat kriminal bawah tanah yang kerap melakukan kontrak ilegal dengan iblis untuk kuasai wilayah." },
    { job: "International Assassin", desc: "Pembunuh bayaran elit lintas negara yang disewa khusus untuk mengincar jantung hibrida Chainsaw Man." },
    { job: "Government Agent", desc: "Agen rahasia atau birokrat negara yang mengurus kontrak politik rahasia dengan para iblis tingkat tinggi." },
    { job: "Chainsaw Man Church Leader", desc: "Petinggi kultus yang memanipulasi ribuan pengikut demi agenda terselubung menggunakan nama Chainsaw Man." },
    { job: "Fiend / Hybrid Combatant", desc: "Iblis yang merasuki mayat (Fiend) atau manusia yang menyatu dengan jantung iblis (Hybrid) untuk bertarung." }
];

export const SIDE_JOB_LIST = [
    { job: "Civilian Devil Hunter", desc: "Warga biasa terdaftar legal untuk memburu iblis kelas teri tanpa ikatan komando taktis militer." },
    { job: "Police Officer", desc: "Petugas polisi konvensional yang mengamankan TKP dan kriminal biasa sebelum pemburu iblis tiba di lokasi." },
    { job: "Fast Food Restaurant Server", desc: "Pelayan restoran cepat saji yang sering kali terjebak kepanikan massa saat area pertokoan diserang iblis." },
    { job: "Cafe Barista / Part-Timer", desc: "Pekerja paruh waktu di kafe yang menjadi samaran sempurna bagi mata-mata atau pembunuh bayaran asing." },
    { job: "TV News Journalist / Reporter", desc: "Wartawan media massa yang menantang bahaya demi menyiarkan berita terkini seputar serangan fatal iblis." },
    { job: "Black Market Organ Dealer", desc: "Pedagang ilegal yang memutilasi dan memperjualbelikan potongan tubuh iblis di pasar gelap untuk eksperimen." },
    { job: "Debt Collector / Loan Shark", desc: "Penagih hutang kejam yang menyiksa targetnya dengan memanfaatkan jasa preman lokal atau iblis kroco." },
    { job: "High School Student (Ordinary)", desc: "Murid sekolah biasa yang tidak tahu tentang perang rahasia iblis dan hanya fokus pada kehidupan remaja." },
    { job: "Private Investigator / Detective", desc: "Detektif swasta yang dibayar untuk melacak orang hilang yang diduga telah diculik atau dimakan iblis." },
    { job: "High-Ranking Politician / Minister", desc: "Pejabat tinggi negara yang memegang kendali atas regulasi iblis dan menyembunyikan kebenaran dari publik." },
    { job: "Underground Medical Doctor", desc: "Dokter tanpa izin resmi yang mengobati luka tembak atau cakaran iblis milik para penjahat bawah tanah." },
    { job: "Chainsaw Man Church Devotee", desc: "Pengikut biasa atau jemaat kultus yang fanatik dan rela demo ekstrem demi membela Chainsaw Man." }
];

export const EVENT_LIST = [
  { name: 'Erasure Effect', command: '.csm event erasure', description: 'Pochita menghapus story, kontrak, Blood, dan inventory. Pilih menerima penghapusan atau mengikat perlindungan Horsemen, Fiend, atau Hybrid.' },
  { name: 'Makima Call', command: '.csm event makimacall', description: 'Makima memanggil Hunter untuk menjalankan perintah berbahaya. Terima untuk menantang target dan mendapat hadiah, atau tolak dengan membayar Blood.' },
  { name: "The Devil's Bargain", command: '.csm event devilsbargain', description: 'Tawaran Devil misterius memberi keuntungan besar sementara dengan konsekuensi yang baru terlihat kemudian.' },
  { name: 'Eyes of Control', command: '.csm event eyesofcontrol', description: 'Makima mulai mengawasi perjalananmu. Tunjukkan loyalitas untuk menerima perlindungan, atau tolak pengawasan dan tanggung risiko kecurigaan.' },
  { name: 'Blood Frenzy', command: '.csm event bloodfrenzy', description: 'Haus darah membuka Blood Gain x2 dan Terror tanpa cooldown untuk waktu terbatas, tetapi dapat menguras HP dan membawa efek samping.' }
];

export const COMMAND_SECTIONS = [
  {
    title: '🏠 DASAR',
    commands: [
      ['start', 'Mulai permainan'],
      ['profile', 'Menu utama'],
      ['stats', 'Detail status & buff'],
      ['about', 'Tentang game & statistik'],
      ['nickname <nama>', 'Set nama hunter'],
      ['gender <pria/wanita>', 'Set gender'],
      ['rest', 'Istirahat +40% HP [CD 5 menit]'],
      ['cooldown', 'Lihat status cooldown'],
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
      ['revive <nomor>', 'Hidupkan partner 5000 Darah']
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
      ['equip <nomor/nama>', 'Pasang senjata'],
      ['repair <nomor/nama>', 'Perbaiki durability senjata'],
      ['sell <nomor>', 'Jual item dari inventory'],

      ['blood', 'Lihat Blood & saldo Bank'],
      ['blood convert <jumlah>', 'Buat konversi Bank → Blood'],
      ['blood deal', 'Konfirmasi konversi Blood'],
      ['blood cancel', 'Batalkan konversi Blood'],

      ['gift', 'Lihat cara gift'],
      ['gift bank/darah @tag <jumlah>', 'Gift ke player'],
      ['gift partner blood/money <nomor> <jumlah>', 'Gift ke partner']
    ]
  },

  {
    title: '📖 STORY',
    commands: [
      ['story', 'Jalankan arc berikutnya'],
      ['story replay <angka>', 'Ulang arc [CD 1 jam]'],
      ['storylist', 'Lihat daftar arc'],
      ['ending <1-7>', 'Pilih ending [Arc 15]'],
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
      ['event eyesofcontrol', 'Info pengawasan Makima'],
      ['event bloodfrenzy', 'Info mode haus darah'],
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
      ['view character', 'Database karakter'],
      ['view database', 'Database Devil']
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

export const BOSS_LIST = [
    { nama: 'Bat Devil', hp: 2000, exp: 500, blood: 2000, emoji: '🦇', story: ['Gedung ini berbau darah.','Bat Devil menggantung di langit-langit.','Dia membuka mulutnya... lebar sekali.','Denji maju tanpa rasa takut. "Pochita, giliran kita."'] },
    { nama: 'Eternity Devil', hp: 10000, exp: 2000, blood: 10000, emoji: '♾️', story: ['Pintu hotel tidak bisa dibuka.','Hari ke 10. Makanan habis.','Ada yang mulai makan temannya.','Denji tersenyum. "Kalau gitu... kita potong hotelnya saja."'] },
    { nama: 'Katana Man', hp: 15000, exp: 3000, blood: 15000, emoji: '🗡️', story: ['Peti mati terbuka.','Darah menyembur dari dalam.','Katana Man berdiri dengan katana di tangannya.','Dia berbisik: "Ini untuk Yakuza."'] },
    { nama: 'Bomb Girl Reze', hp: 18000, exp: 4000, blood: 20000, emoji: '💣', story: ['Reze tersenyum padamu.','Jantungmu berdetak kencang.','Tiba-tiba dia meledak.','Cinta dan kehancuran adalah hal yang sama.'] },
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
    
export const ACHIEVEMENT_LIST = [
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
  { id: 'collector_all_75', nama: 'The Hero Of Hell Absolute Omnipotence', desc: 'Rekrut seluruh 75 karakter tanpa terkecuali', emoji: '👑', reward: { blood: 1000000, exp: 5000 }, setBonus: { allStats: 50 }, check: (csm) => csm.partners.length >= 75 }
];

export function checkAchievements(csm) {
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
export const ITEM_LIST = [
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
  { nama: "Tiket Kontrak Neraka (Hell Pass)", jenis: "Quest Item", tier: "SSS", jual: 7200000, emoji: "🎫", user: "Devil Hunter Elit", material: "Media transit dimensi", desc: "Item legendaris untuk membuka portal menuju dimensi Neraka (Hell Map) guna memburu iblis boss tingkat tinggi." },
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

export const TITLE_LIST = [
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

export function getTitle(lvl){
  return TITLE_LIST.find(([minimumLevel]) => lvl >= minimumLevel)?.[1] || '📝 Applicant';
}

export function getTitleBackstory(lvl){
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

export function parseBonus(bonusStr, target) {
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

export function bar(val, len = 10) {
  val = Math.max(0, Math.min(100, val));
  return '█'.repeat(Math.floor(val / (100 / len))) + '░'.repeat(len - Math.floor(val / (100 / len)));
}

export function calcSetBonus(csm) {
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
export function calcBonus(csm) {
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
    if (ch) parseBonus(ch.bonus, b)
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

  return b
}

export const BUFF_LIST = Object.keys(calcBonus({ partners: [] }));
