import { ROLE_IMAGES, SCENE_IMAGES, getRoleImage, getRoleImagePaths, getSceneImage, getSceneImagePaths } from './game-roles-media.js'

export { ROLE_IMAGES, SCENE_IMAGES, getRoleImage, getRoleImagePaths, getSceneImage, getSceneImagePaths }

export const GAME_CATEGORIES = Object.freeze({
    ww: { id: 'werewolf', name: 'Werewolf', antagonist: 'werewolf', antagonistName: 'Werewolf', antagonistEmoji: '🐺', aliases: ['ww', 'werewolf'], protagonistName: 'Warga', location: 'Desa Berkabut', description: 'Permainan deduksi sosial berlatar desa yang diteror Werewolf. Warga menjalankan peran rahasia, berdiskusi, dan melakukan voting untuk menemukan Werewolf sebelum jumlah mereka menguasai desa.' },
    mafia: { id: 'mafia', name: 'Mafia', antagonist: 'mafia', antagonistName: 'Mafia', antagonistEmoji: '🕴️', aliases: ['mafia'], protagonistName: 'Warga', location: 'Distrik Pusat', description: 'Permainan deduksi sosial berlatar kota yang disusupi Mafia. Warga menggunakan petunjuk dan kemampuan role untuk membongkar anggota Mafia melalui diskusi dan voting.' },
    killer: { id: 'killer', name: 'Killer', antagonist: 'killer', antagonistName: 'Killer', antagonistEmoji: '🔪', aliases: ['killer'], protagonistName: 'Warga', location: 'Desa Terpencil', description: 'Permainan deduksi sosial tentang warga yang berusaha mengungkap Killer misterius. Setiap malam membawa ancaman baru, sementara diskusi dan voting menentukan siapa yang dicurigai.' },
    assassin: { id: 'assassin', name: 'Assassin', antagonist: 'assassin', antagonistName: 'Assassin', antagonistEmoji: '🥷', aliases: ['assassin', 'assasin', 'assasins'], protagonistName: 'Warga', location: 'Kota Tua', description: 'Permainan deduksi sosial tentang warga yang mencari Assassin tersembunyi. Para pemain memakai kemampuan role, mengumpulkan petunjuk, dan memilih tersangka dalam voting.' },
    impostor: { id: 'impostor', name: 'Impostor', antagonist: 'impostor', antagonistName: 'Impostor', antagonistEmoji: '🚨', aliases: ['impostor', 'imposter'], protagonistName: 'Crewmate', location: 'Pesawat Luar Angkasa', description: 'Permainan deduksi sosial di dalam pesawat luar angkasa yang dipenuhi Crew dan seorang Impostor. Crew harus menemukan penyusup lewat petunjuk, diskusi, dan voting sebelum terlambat.' },
    alien: { id: 'alien', name: 'Alien', antagonist: 'alien', antagonistName: 'Alien', antagonistEmoji: '👽', aliases: ['alien'], protagonistName: 'Crewmate', location: 'Koloni Mars', description: 'Permainan deduksi sosial tentang warga yang berusaha menemukan Alien penyusup di dalam pesawat luar angkasa sebelum ia menguasai keadaan.' },
    parasite: { id: 'parasite', name: 'Parasite', antagonist: 'parasite', antagonistName: 'Parasite', antagonistEmoji: '🦠', aliases: ['parasite'], protagonistName: 'Warga', location: 'Laboratorium Bawah Tanah', description: 'Permainan deduksi sosial tentang makhluk parasit yang menyusup ke tubuh warga dan memangsa penduduk kota dari dalam.' },
    zombie: { id: 'zombie', name: 'Zombie', antagonist: 'zombie', antagonistName: 'Zombie', antagonistEmoji: '🧟', aliases: ['zombie'], protagonistName: 'Warga', location: 'Kota Mati', description: 'Permainan deduksi sosial di kota mati yang dihantui wabah zombie. Warga harus menemukan dan menyingkirkan para zombie melalui kemampuan role, diskusi, dan voting sebelum jumlah mereka menguasai kota.' },
    vampire: { id: 'vampire', name: 'Vampire', antagonist: 'vampire', antagonistName: 'Vampire', antagonistEmoji: '🧛', aliases: ['vampire'], protagonistName: 'Warga', location: 'Kastil Nosferatu', description: 'Permainan deduksi sosial di wilayah gelap yang dikuasai para vampire. Warga menyelidiki identitas mereka dan melakukan voting untuk menghentikan perburuan malam sebelum vampire menguasai wilayah itu.' },
    vigilante: { id: 'vigilante', name: 'Vigilante', antagonist: 'antagonist', antagonistName: 'Antagonis', antagonistEmoji: '🎯', aliases: ['vigilante'], protagonistName: 'Vigilante', location: 'Markas Rahasia', description: 'Para Vigilante memburu antagonis yang bergerak sendiri. Mereka harus menangkap seluruh antagonis sebelum semuanya menjadi sasaran; antagonis menang jika seluruh Vigilante gugur.' },
    mayhem: { id: 'mayhem', name: 'Mayhem', antagonist: 'mayhem', antagonistName: 'Antagonis', antagonistEmoji: '💥', aliases: ['mayhem'], protagonistName: 'Protagonis', location: 'Kota Tanpa Hukum', description: 'Mode kacau tempat berbagai role dan jenis antagonis dapat muncul bersamaan. Setiap antagonis memburu pilihannya sendiri dan tidak mengetahui siapa antagonis lainnya.' },
    custom: { id: 'custom', name: 'Custom', antagonist: 'custom', antagonistName: 'Antagonis', antagonistEmoji: '🎭', aliases: ['custom'], protagonistName: 'Protagonis', location: 'Arena Simulasi', description: 'Mode simulasi Game Roles: pemain mendapat role yang ditentukan manual untuk latihan dan pengujian command.' }
});

export const ROLE_DATA = Object.freeze({
    warga: { emoji: '👱‍♂️', title: 'Warga', description: 'Penduduk biasa yang mengandalkan pengamatan dan diskusi untuk menjaga desanya dari ancaman tersembunyi.', effect: 'Tidak memiliki aksi malam khusus; ikut voting untuk mengeksekusi tersangka.' },
    seer: { emoji: '👳', title: 'Seer', description: 'Peramal yang membaca identitas seseorang lewat penglihatan yang tak dimiliki warga lain.', effect: 'Sekali selama permainan, periksa role satu pemain pada malam hari.' },
    guardian: { emoji: '👼', title: 'Guardian', description: 'Pelindung desa yang berjaga di balik bayang-bayang untuk menyelamatkan satu orang dari terkaman antagonis.', effect: 'Sekali selama permainan, lindungi satu pemain—termasuk diri sendiri—dari serangan antagonis pada malam hari; perlindungan tidak berlaku untuk voting.' },
    sorcerer: { emoji: '🔮', title: 'Sorcerer', description: 'Peramu sihir yang menguasai ramuan berbahaya sekaligus rahasia untuk memanggil orang mati kembali.', effect: 'Pilih satu target untuk diracuni atau satu pemain mati untuk dibangkitkan. Jika ada antagonis lain, racun menjadikannya antagonis dan revive menjadikannya warga; tanpa antagonis lain, racun membuatnya netral sedangkan revive membuatnya tetap antagonis.' },
    werewolf: { emoji: '🐺', title: 'Werewolf', description: 'Manusia serigala yang menyamar sebagai warga pada siang hari dan berburu saat malam.', effect: 'Bersama Werewolf lain, pilih satu pemain untuk diserang setiap malam.' },
    mafia: { emoji: '🕴️', title: 'Mafia', description: 'Anggota sindikat yang menyusup ke tengah warga dan menjalankan perburuan secara terorganisasi.', effect: 'Bersama Mafia lain, pilih satu pemain untuk diserang setiap malam.' },
    killer: { emoji: '🔪', title: 'Killer', description: 'Pembunuh bayaran yang bergerak sendiri, mengincar warga tanpa meninggalkan jejak.', effect: 'Pilih satu pemain untuk diserang setiap malam.' },
    assassin: { emoji: '🥷', title: 'Assassin', description: 'Pembunuh tersembunyi yang mengincar target dengan presisi sebelum identitasnya terbongkar.', effect: 'Pilih satu pemain untuk dieliminasi setiap malam.' },
    impostor: { emoji: '🚨', title: 'Impostor', description: 'Penyusup yang berpura-pura menjadi bagian dari kru sambil diam-diam menyingkirkan mereka.', effect: 'Pilih satu kru untuk diserang setiap malam.' },
    alien: { emoji: '👽', title: 'Alien', description: 'Makhluk asing yang menyamar di antara manusia dan berusaha menguasai tempat yang disusupinya.', effect: 'Pilih satu pemain untuk diserang setiap malam.' },
    zombie: { emoji: '🧟', title: 'Zombie', description: 'Mayat hidup yang bangkit dari wabah dan berkeliaran menyebarkan infeksi kepada para penyintas.', effect: 'Pada mode Zombie, tularkan satu warga hidup setiap malam. Warga yang tertular tetap hidup dan bisa voting, tetapi hanya dapat bersembunyi saat malam; Zombie menang jika seluruh pemain hidup selain Zombie asli sudah tertular.' },
    vampire: { emoji: '🧛', title: 'Vampire', description: 'Pengisap darah yang bersembunyi di balik kehidupan malam dan menularkan kutukannya kepada warga tanpa diketahui.', effect: 'Pada mode Vampire, tularkan satu warga hidup setiap malam. Warga yang tertular tetap hidup dan bisa voting, tetapi hanya dapat bersembunyi saat malam; Vampire menang jika seluruh pemain hidup selain Vampire asli sudah tertular.' },
    hunter: { emoji: '🏹', title: 'Hunter', description: 'Pemburu yang tetap siap melawan bahkan ketika dirinya sendiri telah tumbang.', effect: 'Saat gugur, dapat memilih satu pemain hidup untuk ditembak sebelum fase berlanjut.' },
    mayor: { emoji: '👑', title: 'Mayor', description: 'Pemimpin yang suaranya memiliki pengaruh lebih besar dalam menentukan keputusan bersama.', effect: 'Suara dalam voting bernilai dua.' },
    jester: { emoji: '🃏', title: 'Jester', description: 'Pengacau yang ingin membuat warga salah menilai dirinya hingga mereka sendiri menjatuhkan hukuman.', effect: 'Menang sendiri jika dieksekusi melalui voting warga.' },
    warden: { emoji: '⚒️', title: 'Warden', description: 'Penjaga tangguh yang mengenakan pelindung khusus untuk bertahan dari satu serangan mematikan.', effect: 'Armor sekali pakai menahan satu serangan antagonis atau satu tembakan Hunter; tidak melindungi dari voting maupun racun.' },
    cipher: { emoji: '🔢', title: 'Cipher', description: 'Pemecah sandi yang mengumpulkan rahasia para antagonis, tetapi memilih bertahan hidup daripada berpihak.', effect: 'Menang bersama warga atau antagonis jika masih hidup saat permainan berakhir. Pesan biasa wajib mengandung angka dan tidak boleh memuat A, I, E, O, B, L, S, Q, atau G; pesan yang melanggar dihapus. Kartu pertama menunjukkan siapa antagonisnya.' },
    parasite: { emoji: '🦠', title: 'Parasite', description: 'Makhluk parasit yang bersembunyi di balik tubuh inangnya, menyebarkan teror, dan memburu kota tanpa menunjukkan wujud aslinya.', effect: 'Pilih satu pemain untuk diserang setiap malam; menang sebagai antagonis dengan menghabisi atau mengungguli warga.' },
    fixer: { emoji: '🕵️', title: 'Fixer', description: 'Perantara bawah tanah yang menerima urusan rahasia dan mengatur agar targetnya tersingkir, tanpa harus turun tangan sendiri.', effect: 'Di awal permainan mendapat satu target kontrak. Menang sendiri jika target mati karena sebab apa pun selama Fixer masih hidup; boleh memanfaatkan voting, meyakinkan pemain lain, atau membiarkan antagonis membunuh target.' },
    vigilante: { emoji: '🎯', title: 'Vigilante', description: 'Penegak yang memburu para pembunuh sebelum mereka menguasai kota, tanpa tahu siapa yang akan menjadi korban berikutnya.', effect: 'Pada mode Vigilante, pilih satu antagonis untuk ditangkap setiap malam. Jumlah Vigilante bertambah sesuai jumlah peserta; menang jika seluruh antagonis tertangkap.' },
    ghost: { emoji: '👻', title: 'Ghost', description: 'Jiwa warga yang mampu berpindah ke tubuh pemain lain saat masih hidup.', effect: 'Sambil hidup, rasuki satu pemain yang belum pernah dirasuki untuk membuatnya tidak dapat voting pada ronde berikutnya; setelah mati, tetap dapat mengirim pesan, tetapi tidak dapat melakukan aksi atau voting.' }
});

export const ROLE_GUIDES = Object.freeze({
    warga: Object.freeze([
        'Peranmu adalah membantu tim protagonis menemukan ancaman. Kamu tidak memiliki aksi malam khusus, jadi informasi dari diskusi, hasil Seer, dan kejadian fajar sangat penting.',
        'Saat siang, baca hasil malam dan dengarkan alasan setiap pemain. Perhatikan perubahan cerita, tuduhan tanpa bukti, dan pemain yang berusaha mengalihkan pembicaraan.',
        'Sebelum voting ditutup, gunakan tombol atau kode voting rahasia yang dikirim khusus kepadamu. Pilih pemain yang paling mencurigakan; jangan mengirim nomor vote secara terbuka.',
        'Jika tidak yakin, kamu dapat memilih opsi lewati voting pada pemungutan suara biasa. Jika terjadi voting ulang karena seri, kamu wajib memilih salah satu kandidat yang seri.',
        'Kamu menang bersama protagonis jika semua antagonis tersingkir. Kamu kalah jika jumlah antagonis yang masih hidup menyamai atau melebihi jumlah pemain protagonis yang masih hidup.'
    ]),
    seer: Object.freeze([
        'Kemampuan menerawang hanya dapat digunakan sekali selama permainan. Gunakan pada malam hari dengan memilih kode yang berisi nama target yang ingin diperiksa.',
        'Pilih pemain hidup yang informasinya paling berguna—misalnya pemain yang paling kuat dituduh atau orang yang mengaku punya informasi penting.',
        'Hasil pemeriksaan dikirim secara pribadi kepadamu. Jangan langsung membagikan hasil mentah jika itu membuatmu mudah menjadi sasaran; sampaikan informasi secara strategis saat diskusi.',
        'Setelah kemampuan terpakai, pada malam berikutnya Seer hanya mendapat pilihan bersembunyi, bukan memeriksa pemain lagi.',
        'Kamu berpihak kepada protagonis. Bantu mereka mengidentifikasi antagonis dan bertahan sampai kondisi kemenangan protagonis tercapai.'
    ]),
    guardian: Object.freeze([
        'Kamu dapat melindungi satu pemain hidup, termasuk dirimu sendiri, pada malam hari. Kemampuan perlindungan hanya dapat digunakan sekali selama permainan.',
        'Pilih kode aksi yang sesuai dengan nama target. Pertimbangkan melindungi pemain yang memiliki informasi penting, pemain yang sedang diincar, atau dirimu jika menjadi sasaran.',
        'Perlindungan menahan serangan antagonis pada malam itu. Perlindungan tidak membatalkan eksekusi voting, racun Sorcerer, atau semua jenis aksi lainnya.',
        'Jika melewati aksi atau kemampuan sudah digunakan, kamu hanya dapat bersembunyi pada malam berikutnya.',
        'Kamu berpihak kepada protagonis. Menjaga Seer atau pemain penting tetap hidup dapat memberi timmu waktu untuk menemukan antagonis.'
    ]),
    sorcerer: Object.freeze([
        'Setiap malam, pilih salah satu kode racun, kebangkitan, atau lewati aksi. Racun menargetkan pemain hidup; kebangkitan menargetkan pemain yang sudah mati.',
        'Racun menghabisi target dan kebangkitan mengembalikan target ke permainan. Pilih dengan hati-hati karena satu keputusan dapat mengubah keseimbangan faksi.',
        'Jika ada antagonis lain, racun membuatmu berpihak kepada antagonis dan kebangkitan membuatmu berpihak kepada protagonis. Jika tidak ada antagonis lain, racun membuatmu netral dan melewati aksi membuatmu tetap netral.',
        'Jika tidak ada antagonis lain, kebangkitan membuatmu tetap berpihak kepada antagonis. Periksa kondisi room dan informasi yang kamu miliki sebelum menentukan pilihan.',
        'Sorcerer netral menang sendiri jika masih hidup setelah seluruh antagonis dan protagonis gugur. Jika sudah berpihak ke salah satu faksi, kamu mengikuti kondisi kemenangan faksi tersebut.',
        'Kode aksi Sorcerer dikirim secara pribadi. Hasil aksinya tercatat pada fase malam; jangan mengira bahwa target yang dipilih pasti berhasil diselamatkan jika ada efek lain yang mengubah hasil.'
    ]),
    werewolf: Object.freeze([
        'Kamu adalah antagonis. Setiap malam, pilih satu pemain hidup untuk diserang menggunakan kode aksi rahasia.',
        'Dalam mode Werewolf biasa, koordinasikan pilihan dengan rekan Werewolf jika ada dan sepakati satu target agar serangan kelompok terarah.',
        'Biasanya target serangan hanya pemain non-antagonis. Hindari memilih rekan sendiri kecuali aturan mode memberi pilihan serangan bebas.',
        'Pada siang hari, berbaur dalam diskusi, jangan mengungkapkan identitas, dan arahkan voting agar protagonis saling mencurigai.',
        'Antagonis menang ketika jumlah antagonis hidup menyamai atau melebihi jumlah protagonis hidup. Kamu menang bersama tim antagonis yang tersisa.',
        'Mode Mayhem dapat memiliki beberapa jenis antagonis yang bertindak sendiri dan tidak otomatis mengetahui identitas satu sama lain; periksa aturan mode sebelum menganggap mereka rekan.'
    ]),
    mafia: Object.freeze([
        'Kamu adalah antagonis. Setiap malam, pilih satu pemain hidup untuk diserang melalui kode aksi rahasia.',
        'Jika ada anggota Mafia lain, sepakati satu target agar serangan kelompok tidak terpecah. Pilihan malam dikirim melalui kode pribadi, bukan lewat chat umum.',
        'Pada siang hari, pertahankan penyamaran dan berpartisipasi dalam diskusi sewajarnya. Hindari membela rekan terlalu kentara karena dapat mengungkap seluruh kelompok.',
        'Perhatikan siapa yang memimpin penyelidikan atau dapat membuka identitas pemain, lalu pertimbangkan apakah mereka perlu menjadi target malam.',
        'Tim antagonis menang ketika jumlah antagonis hidup menyamai atau melebihi jumlah protagonis hidup.',
        'Jika Mafia muncul dalam Mayhem atau Custom, perilaku dan target yang tersedia mengikuti aturan mode itu; periksa pilihan aksi yang ditampilkan pada kartu malam.'
    ]),
    killer: Object.freeze([
        'Kamu adalah antagonis yang menyerang sendiri. Setiap malam, pilih satu pemain hidup melalui kode aksi rahasia.',
        'Gunakan informasi dari diskusi siang untuk menentukan target. Pemain yang dipercaya warga atau memiliki kemampuan investigasi dapat menjadi ancaman bagimu.',
        'Jangan membuka identitas saat berdiskusi. Berikan alasan yang masuk akal ketika voting mengarah kepadamu dan hindari pola tuduhan yang terlalu konsisten.',
        'Dalam mode standar, antagonis menang ketika jumlah antagonis hidup menyamai atau melebihi protagonis hidup. Di Mayhem, kamu dapat memiliki lawan antagonis lain dan pilihan serangan dapat mencakup mereka.',
        'Periksa kartu aksi malam: target yang tersedia ditentukan oleh mode permainan dan tidak semua pemain selalu dapat diserang.'
    ]),
    assassin: Object.freeze([
        'Kamu adalah antagonis yang bergerak sendiri. Setiap malam, pilih satu pemain hidup sebagai target eliminasi menggunakan kode aksi rahasia.',
        'Pilih target berdasarkan ancaman terhadap penyamaranmu: pemain yang berhasil mengumpulkan petunjuk atau mengarahkan voting dapat membahayakanmu.',
        'Saat siang, ikut berdiskusi tanpa terlihat mengendalikan keputusan. Jangan memberi informasi palsu yang mudah dibantah oleh hasil aksi atau pemeriksaan role.',
        'Antagonis menang saat jumlah antagonis hidup menyamai atau melebihi protagonis hidup. Pada Mayhem, jenis antagonis lain dapat menjadi pesaing, bukan rekan.',
        'Gunakan hanya pilihan yang muncul pada kartu malam karena daftar target dapat berubah sesuai mode dan status pemain.'
    ]),
    impostor: Object.freeze([
        'Kamu adalah penyusup antagonis. Pada malam hari, pilih satu pemain hidup untuk diserang lewat kode aksi rahasia.',
        'Pada siang hari, samarkan perilakumu sebagai bagian dari kru. Dengarkan klaim pemain lain dan jangan terlalu cepat mengarahkan tuduhan kepada orang yang sama.',
        'Amati siapa yang memimpin penyelidikan atau mendapat kepercayaan kru; mereka dapat menjadi target penting untuk memperlambat diskusi.',
        'Tim antagonis menang ketika jumlah antagonis hidup menyamai atau melebihi jumlah protagonis hidup.',
        'Target aksi mengikuti daftar pilihan pada kartu malam. Gunakan tombol atau kode pribadi dan jangan mengungkap kode aksi di chat umum.'
    ]),
    alien: Object.freeze([
        'Kamu adalah antagonis yang menyamar. Setiap malam, pilih satu pemain hidup untuk diserang lewat kode aksi rahasia.',
        'Pada siang hari, berbaur dengan pemain lain dan gunakan diskusi untuk memahami siapa yang mulai dicurigai atau memiliki informasi penting.',
        'Jangan membuat klaim yang bertentangan dengan hasil penyelidikan atau kejadian malam. Pertahankan alasan yang konsisten ketika ditanya.',
        'Kamu menang bersama tim antagonis ketika jumlah antagonis hidup menyamai atau melebihi jumlah protagonis hidup.',
        'Dalam mode yang menempatkan beberapa antagonis berbeda, periksa aturan mode dan target yang tersedia sebelum menganggap antagonis lain sebagai sekutu.'
    ]),
    zombie: Object.freeze([
        'Panduan aksi ini berlaku saat kamu menjadi Zombie asli pada mode Zombie. Setiap malam, pilih satu pemain hidup yang belum tertular untuk ditularkan.',
        'Jumlah Zombie asli dibatasi satu atau dua sesuai jumlah pemain. Warga yang tertular bukan Zombie asli dan tidak dapat menularkan pemain lain.',
        'Target yang tertular tetap hidup, tetap dapat berdiskusi dan voting, tetapi kemampuan role lamanya dinonaktifkan dan pada malam berikutnya ia hanya dapat bersembunyi.',
        'Pemain yang tertular ditampilkan sebagai Infected. Ia berpihak kepada wabah, tetapi bukan Zombie asli dan tidak memperoleh kemampuan menularkan pemain lain.',
        'Jangan memilih pemain yang sudah tertular atau antagonis asli; pilihan target yang sah ditampilkan pada kartu malam. Jika tidak ada target yang sesuai, kamu dapat melewati aksi.',
        'Zombie menang jika semua pemain hidup selain Zombie asli sudah tertular. Jumlah mayoritas saja belum cukup untuk menang.',
        'Jika Zombie asli terakhir tersingkir, seluruh pemain yang tertular akan gugur.',
        'Saat diskusi siang, samarkan sumber wabah dan gunakan voting untuk menyingkirkan pemain yang mengancam. Ingat bahwa infeksi tidak langsung membunuh target.'
    ]),
    vampire: Object.freeze([
        'Panduan aksi ini berlaku saat kamu menjadi Vampire asli pada mode Vampire. Setiap malam, pilih satu pemain hidup yang belum tertular untuk ditularkan.',
        'Jumlah Vampire asli dibatasi satu atau dua sesuai jumlah pemain. Warga yang tertular bukan Vampire asli dan tidak dapat menularkan pemain lain.',
        'Target yang tertular tetap hidup, tetap dapat berdiskusi dan voting, tetapi kemampuan role lamanya dinonaktifkan dan pada malam berikutnya ia hanya dapat bersembunyi.',
        'Pemain yang tertular ditampilkan sebagai Infected. Ia berpihak kepada wabah, tetapi bukan Vampire asli dan tidak memperoleh kemampuan menularkan pemain lain.',
        'Jangan memilih pemain yang sudah tertular atau antagonis asli; gunakan daftar target pada kartu malam. Jika tidak ada target yang sesuai, pilih opsi lewati aksi.',
        'Vampire menang jika semua pemain hidup selain Vampire asli sudah tertular. Jumlah mayoritas saja belum cukup untuk menang.',
        'Jika Vampire asli terakhir tersingkir, seluruh pemain yang tertular akan gugur.',
        'Saat siang, samarkan penyebaran kutukan dan perhatikan siapa yang mengarahkan penyelidikan. Infeksi membuat target berpihak kepadamu, tetapi tidak menghilangkan hak voting-nya.'
    ]),
    hunter: Object.freeze([
        'Saat masih hidup, Hunter tidak mempunyai tembakan malam biasa. Kartu malam dapat memberimu pilihan untuk bersembunyi atau berpatroli.',
        'Jika kamu gugur karena voting atau serangan, kamu mendapat satu kesempatan terakhir untuk menembak pemain hidup. Gunakan kode tembakan yang dikirim saat kesempatan itu muncul.',
        'Pilih target berdasarkan bukti dan kecurigaan yang terkumpul. Kamu juga boleh memilih tidak menembak jika belum yakin.',
        'Tembakan Hunter dapat tertahan oleh armor Warden yang masih aktif. Hunter yang terkena tembakan dapat menerima kesempatan balasan sesuai alur permainan.',
        'Kamu berpihak kepada protagonis dan menang jika kondisi kemenangan protagonis tercapai. Jangan menembak pemain hanya karena berbeda pendapat.'
    ]),
    mayor: Object.freeze([
        'Mayor tidak memiliki aksi malam khusus. Pada malam hari kamu hanya dapat bersembunyi seperti role yang tidak mempunyai aksi.',
        'Saat voting siang, satu suaramu bernilai dua poin selama kamu belum tertular. Peranmu dapat menentukan hasil ketika suara pemain lain berimbang.',
        'Gunakan pengaruh suaramu dengan hati-hati: dengarkan penjelasan dan bukti sebelum memilih. Kode voting yang diterima tetap rahasia.',
        'Jika Mayor tertular pada mode Zombie atau Vampire, peran aktifnya menjadi Infected dan bonus suara Mayor tidak berlaku.',
        'Mayor berpihak kepada protagonis dan menang bersama mereka ketika seluruh antagonis tersingkir.'
    ]),
    jester: Object.freeze([
        'Tujuan Jester adalah membuat dirinya dipilih dan dieksekusi melalui voting siang. Jika berhasil, Jester menang sendiri dan permainan langsung berakhir.',
        'Bangun kecurigaan dengan cara yang meyakinkan, tetapi jangan terlalu jelas sehingga warga sengaja menghindari memilihmu.',
        'Kematian karena serangan malam, racun, atau tembakan tidak memenuhi kondisi kemenangan Jester. Yang dihitung hanya eksekusi voting.',
        'Jester tidak memiliki aksi malam khusus; gunakan malam untuk bersembunyi dan siang untuk memengaruhi diskusi.',
        'Jika tertular dalam mode Zombie atau Vampire, status Infected mengambil alih afiliasi dan kemenangan khusus Jester tidak lagi berlaku.'
    ]),
    warden: Object.freeze([
        'Warden memiliki satu armor yang otomatis menahan satu serangan antagonis atau satu tembakan Hunter. Kamu tidak perlu mengaktifkan armor secara manual.',
        'Armor tidak melindungi dari eksekusi voting atau racun Sorcerer. Setelah armor terpakai, serangan berikutnya dapat mengeliminasi kamu seperti biasa.',
        'Warden tidak memiliki kemampuan malam menyerang; pilih salah satu aksi bersembunyi yang tersedia pada kartu malam.',
        'Gunakan diskusi siang untuk membantu protagonis mencari antagonis. Pertimbangkan risiko sebelum mengungkap bahwa armor-mu sudah terpakai.',
        'Jika tertular, kemampuan role lama dinonaktifkan; statusmu menjadi Infected dan perlindungan Warden tidak berlaku.',
        'Warden berpihak kepada protagonis dan menang bersama protagonis.'
    ]),
    cipher: Object.freeze([
        'Cipher tidak berpihak kepada salah satu tim. Kamu menang bersama protagonis atau antagonis jika masih hidup dan tidak tertular saat permainan berakhir.',
        'Setiap pesan biasa yang kamu kirim di grup harus mengandung minimal satu angka dan tidak boleh memuat huruf A, I, E, O, B, L, S, Q, atau G. Aturan berlaku untuk huruf besar maupun kecil.',
        'Pemetaan sandi: A=4, I=1, E=3, O=0, B=8, L=7, S=5, Q=9, dan G=6. Ganti huruf terlarang dengan angka penggantinya sebelum mengirim pesan.',
        'Contoh valid: *K4mu 4m4n?* (Kamu aman?). Angka 4 menggantikan A; hanya huruf pertama pesan yang kapital.',
        'Contoh valid lain: *M4k4n?* (Makan?). Contoh tidak valid: *KAMU 4M4N?* karena masih mengandung huruf A yang dilarang.',
        'Pesan yang tidak memenuhi aturan dapat dihapus. Hindari nama role atau nama pemain yang mengandung huruf terlarang; ubah menjadi angka sandi atau gunakan sebutan lain.',
        'Cipher tidak mendapat aksi malam khusus. Pada malam hari pilih aksi bersembunyi yang tersedia. Kartu pertama dapat menampilkan identitas antagonis; simpan informasi itu dan gunakan dengan bijak.',
        'Jika tertular pada mode Zombie atau Vampire, kamu menjadi Infected dan tidak lagi memenuhi syarat menang netral bersama tim.'
    ]),
    parasite: Object.freeze([
        'Kamu adalah antagonis. Setiap malam, pilih satu pemain hidup untuk diserang menggunakan kode aksi rahasia.',
        'Pada siang hari, pertahankan penyamaran dan gunakan diskusi untuk menghindari kecurigaan. Jangan mengungkap rencana malam kepada pemain lain.',
        'Pilih target yang dapat menghambatmu, seperti pemain yang dipercaya warga atau yang memiliki kemampuan pemeriksaan dan perlindungan.',
        'Dalam mode biasa, antagonis menang ketika jumlah antagonis hidup menyamai atau melebihi protagonis hidup. Dalam Mayhem, antagonis dapat bergerak sendiri.',
        'Gunakan target yang tersedia di kartu fase malam karena aturan Custom atau Mayhem dapat mengubah siapa yang boleh diserang.'
    ]),
    fixer: Object.freeze([
        'Pada awal permainan, kamu menerima satu target kontrak secara pribadi. Periksa pesan rahasia untuk mengetahui nama target; jangan ungkap kontrakmu.',
        'Kamu menang sendiri jika target kontrak gugur karena sebab apa pun sementara kamu masih hidup. Target dapat gugur karena voting, serangan malam, racun, atau aksi lain.',
        'Kamu tidak memiliki aksi malam khusus. Gunakan diskusi dan voting untuk mendorong pemain lain memilih target, atau biarkan faksi lain menyingkirkannya.',
        'Lindungi dirimu dari kecurigaan dan jangan terlalu kentara menargetkan orang yang sama sepanjang permainan.',
        'Jika kamu gugur sebelum target, kontrak gagal. Jika target masih hidup ketika permainan berakhir, kamu tidak memenangkan kondisi Fixer.'
    ]),
    vigilante: Object.freeze([
        'Pada mode Vigilante, kamu berpihak kepada tim Vigilante. Setiap malam pilih satu antagonis hidup untuk ditangkap melalui kode aksi rahasia.',
        'Penangkapan mengeliminasi target dari permainan. Periksa identitas atau informasi yang terkumpul sebelum memilih agar tidak salah menangkap.',
        'Jumlah Vigilante mengikuti jumlah peserta dengan batas maksimal 4: 2 untuk 5–8 pemain, 3 untuk 9–10, dan 4 untuk 11–15 pemain. Semua pemain lain adalah antagonis.',
        'Tim Vigilante menang jika seluruh antagonis tertangkap. Antagonis menang jika seluruh Vigilante gugur.',
        'Pada mode Mayhem, Vigilante tetap berpihak kepada protagonis dan memilih satu pemain yang dicurigai untuk ditangkap; kamu menang jika protagonis menang.',
        'Gunakan hanya target pada kartu malam. Pilihan aksi dapat berbeda antara mode Vigilante dan Mayhem.'
    ]),
    ghost: Object.freeze([
        'Ghost berpihak kepada protagonis. Saat masih hidup, pilih satu pemain untuk dirasuki pada malam hari; pemain itu tidak dapat voting pada voting berikutnya dan tidak dapat dirasuki Ghost yang sama lagi.',
        'Setelah gugur, kamu masih boleh mengirim pesan obrolan di grup. Kamu tidak dapat melakukan aksi malam, menembak, atau memberikan suara.',
        'Gunakan pesan setelah gugur untuk membagikan pengamatan atau informasi yang sudah kamu ketahui tanpa mengaku memiliki aksi yang tidak tersedia.',
        'Jangan samakan hak berbicara dengan hak bermain: pesanmu tetap terlihat, tetapi tidak memengaruhi hasil voting atau pilihan aksi.',
        'Kamu menang bersama protagonis ketika kondisi kemenangan protagonis tercapai.'
    ])
});


export const ZOMBIE_INFECTION_STORIES = Object.freeze([
    'Wabah Zombie menyebar diam-diam di {location}; beberapa warga mulai tertular tanpa menyadarinya.',
    'Satu malam lagi berlalu di {location}, dan infeksi Zombie bertambah tanpa diketahui siapa pun.',
    'Suasana {location} tampak tenang, tetapi wabah Zombie telah menjangkau lebih banyak orang.',
    'Jejak wabah meluas di {location}; para penyintas belum tahu siapa yang telah tertular.',
    'Zombie bergerak dalam gelap di {location}, menyebarkan infeksi tanpa meninggalkan tanda.',
    'Gigitan Zombie yang terjadi sebelumnya mulai menunjukkan dampaknya di {location}.',
    'Satu per satu warga {location} mulai kehilangan kendali setelah terpapar virus Zombie.',
    'Virus Zombie menyusup ke tengah keramaian {location}; tak seorang pun menyadari ancamannya.',
    'Beberapa orang di {location} mulai mengalami perubahan aneh akibat infeksi Zombie.',
    'Malam yang mencekam di {location} menjadi awal penyebaran wabah Zombie yang lebih luas.',
    'Serangan Zombie meninggalkan lebih dari sekadar luka; infeksi mulai menjalar di {location}.',
    'Tanpa suara dan tanpa peringatan, virus Zombie kembali menemukan korban di {location}.',
    'Para penyintas {location} mulai menyadari bahwa wabah belum benar-benar berhenti.',
    'Cairan infeksi dari para Zombie menyebar di {location}, mengancam siapa saja yang terpapar.',
    'Seseorang yang terluka akibat serangan Zombie membawa infeksi kembali ke {location}.',
    'Di balik pintu-pintu tertutup {location}, beberapa warga mulai berubah menjadi Zombie.',
    'Wabah Zombie semakin sulit dikendalikan setelah infeksi menjangkau wilayah {location}.',
    'Suara langkah kaki terdengar di kejauhan {location}, sementara virus terus menyebar.',
    'Beberapa warga {location} mengalami demam tinggi dan gejala awal infeksi Zombie.',
    'Zombie yang berkeliaran di {location} berhasil menularkan virus kepada orang-orang yang lengah.',
    'Kepanikan mulai muncul di {location} setelah kabar mengenai korban infeksi baru tersebar.',
    'Infeksi Zombie berkembang semakin cepat di {location}, bahkan sebelum bantuan tiba.',
    'Salah satu penyintas membawa virus kembali ke {location} tanpa mengetahui dirinya telah terinfeksi.',
    'Jalanan {location} masih terlihat normal, tetapi beberapa penghuninya mulai terjangkit wabah.',
    'Virus Zombie terus bermutasi dan menjangkau lebih banyak korban di {location}.',
    'Gigitan kecil yang diabaikan seseorang menjadi awal infeksi baru di {location}.',
    'Para Zombie meninggalkan jejak darah di {location}; tak lama kemudian, korban baru mulai bermunculan.',
    'Wabah menyelinap melalui tempat persembunyian para penyintas di {location}.',
    'Beberapa warga {location} mulai menunjukkan perilaku agresif akibat virus Zombie.',
    'Infeksi menyebar di antara para penyintas {location}, membuat siapa pun sulit dipercaya.',
    'Seseorang terjatuh setelah diserang Zombie, dan virus mulai mengambil alih tubuhnya.',
    'Kondisi {location} semakin mengkhawatirkan ketika jumlah orang terinfeksi terus bertambah.',
    'Para penyintas terlambat menyadari bahwa salah satu dari mereka telah membawa virus Zombie.',
    'Di tengah kegelapan {location}, serangan Zombie kembali memicu gelombang infeksi.',
    'Virus menyebar melalui luka gigitan dan membuat beberapa penghuni {location} mulai berubah.',
    'Pintu perlindungan {location} tak mampu sepenuhnya menghentikan masuknya wabah Zombie.',
    'Satu korban baru ditemukan di {location}, dengan tanda-tanda infeksi yang mulai terlihat.',
    'Wabah Zombie semakin mendekat; beberapa orang di {location} kini berada dalam tahap awal infeksi.',
    'Keadaan {location} memburuk setelah serangan mendadak menyebabkan penularan baru.',
    'Para Zombie berhasil menyusup ke area persembunyian dan menyebarkan virus di {location}.',
    'Tak semua korban serangan Zombie langsung berubah; beberapa warga {location} masih menyembunyikan infeksinya.',
    'Infeksi yang sebelumnya terkendali kembali menyebar di seluruh penjuru {location}.',
    'Jeritan dari sebuah bangunan di {location} menjadi pertanda munculnya korban infeksi baru.',
    'Sejumlah warga {location} mulai kehilangan kesadaran setelah terpapar virus mematikan.',
    'Zombie yang berkeliaran semakin banyak, dan wabah mulai menguasai {location}.',
    'Sebuah insiden gigitan memicu penyebaran infeksi baru di antara penduduk {location}.',
    'Tak ada yang tahu siapa pembawa virus pertama, tetapi jumlah korban di {location} terus meningkat.',
    'Para penyintas {location} mulai mengisolasi diri setelah menemukan tanda-tanda penularan.',
    'Wabah Zombie menembus pertahanan terakhir dan menjangkiti beberapa penghuni {location}.',
    'Infeksi terus berkembang di {location}; ancaman Zombie kini semakin dekat dengan semua orang.'
]);

export const VAMPIRE_INFECTION_STORIES = Object.freeze([
    'Vampire mengisap darah dalam senyap di {location}; korban tetap tampak biasa, meski kini tertular.',
    'Malam di {location} menyimpan rahasia baru: beberapa warga telah menjadi bagian dari kawanan Vampire.',
    'Tak ada yang melihat serangan Vampire di {location}, tetapi infeksi mereka diam-diam bertambah.',
    'Bayangan Vampire melintas di {location}; wabahnya menyebar tanpa mengungkap siapa korbannya.',
    'Keheningan menyelimuti {location} saat Vampire menularkan kutukannya kepada orang-orang yang tak curiga.',
    'Beberapa warga {location} ditemukan pucat setelah menjadi sasaran Vampire malam itu.',
    'Darah yang tertinggal di sebuah sudut {location} menjadi petunjuk adanya serangan Vampire.',
    'Vampire menyelinap ke rumah-rumah {location} dan memilih korban tanpa membangunkan siapa pun.',
    'Seseorang di {location} mulai merasakan haus darah setelah mengalami serangan misterius.',
    'Kawanan Vampire semakin kuat setelah berhasil merekrut korban baru di {location}.',
    'Tak seorang pun menyadari bahwa salah satu warga {location} kini telah menjadi Vampire.',
    'Serangan Vampire berlangsung singkat, tetapi kutukannya mulai menyebar di {location}.',
    'Beberapa orang di {location} kehilangan darah dalam jumlah besar tanpa mengetahui penyebabnya.',
    'Vampire memanfaatkan kegelapan untuk menularkan kutukan kepada penduduk {location}.',
    'Malam itu, seorang warga {location} menjadi korban gigitan yang mengubah hidupnya selamanya.',
    'Jejak dua lubang gigitan ditemukan di {location}, menandakan Vampire telah mendapatkan korban baru.',
    'Para Vampire mulai memperluas wilayah kekuasaan mereka hingga menjangkau {location}.',
    'Seseorang yang sebelumnya menjadi korban kini bangkit sebagai Vampire baru di {location}.',
    'Rasa haus yang tidak biasa mulai menghantui orang-orang yang tertular di {location}.',
    'Vampire menyusup di antara penduduk {location}, menyembunyikan identitas mereka dengan sempurna.',
    'Beberapa warga {location} mulai menghindari cahaya matahari setelah terjangkit kutukan Vampire.',
    'Serangan diam-diam kembali terjadi, menambah jumlah Vampire yang berkeliaran di {location}.',
    'Darah segar menjadi petunjuk bahwa Vampire telah memilih korban berikutnya di {location}.',
    'Kawanan Vampire meninggalkan korban yang perlahan berubah di tengah malam {location}.',
    'Seorang penduduk {location} menghilang setelah terlihat bersama sosok misterius di malam hari.',
    'Kutukan Vampire mulai menjangkiti orang-orang yang sebelumnya tidak pernah dicurigai.',
    'Vampire menyebarkan kutukannya melalui gigitan, menciptakan pengikut baru di {location}.',
    'Suasana {location} semakin mencekam setelah beberapa korban ditemukan dengan luka gigitan.',
    'Sosok berjubah hitam terlihat meninggalkan sebuah rumah di {location}, tepat sebelum infeksi baru muncul.',
    'Korban Vampire mulai menunjukkan perubahan perilaku dan keinginan untuk mengisap darah.',
    'Tak ada suara perlawanan ketika Vampire menyerang, hanya korban baru yang tertinggal di {location}.',
    'Satu gigitan sudah cukup untuk mengubah seorang warga {location} menjadi bagian dari kawanan Vampire.',
    'Para Vampire kini bersembunyi di tengah masyarakat, menunggu kesempatan mendapatkan korban berikutnya.',
    'Sebuah keluarga di {location} mulai menunjukkan gejala aneh setelah dikunjungi sosok asing.',
    'Kutukan kuno kembali menyebar di {location}, mengubah manusia menjadi makhluk pengisap darah.',
    'Vampire berhasil melewati penjagaan malam dan menularkan kutukannya kepada beberapa orang.',
    'Korban yang kehilangan darah di {location} ternyata telah berubah menjadi Vampire baru.',
    'Kegelapan malam menjadi perlindungan bagi Vampire untuk memperluas pengaruhnya di {location}.',
    'Penduduk {location} mulai curiga setelah beberapa orang tidak lagi terlihat pada siang hari.',
    'Vampire baru bermunculan setelah para korban sebelumnya menyebarkan kutukan yang sama.',
    'Seseorang kembali dari tempat persembunyiannya di {location} dengan tatapan mata yang berbeda.',
    'Gigitan Vampire yang tersembunyi mulai mengubah para korban tanpa diketahui orang terdekatnya.',
    'Kawanan Vampire semakin sulit dibedakan dari manusia biasa di tengah keramaian {location}.',
    'Beberapa penduduk {location} mulai merasakan dorongan aneh untuk mencari darah segar.',
    'Serangan Vampire yang terjadi semalam meninggalkan lebih banyak pengikut di {location}.',
    'Tak ada yang mengetahui berapa banyak Vampire yang telah menyamar sebagai warga {location}.',
    'Kutukan menyebar dari satu korban ke korban lainnya, memperbesar kawanan Vampire di {location}.',
    'Sinar bulan menyaksikan bertambahnya jumlah Vampire yang kini menguasai sudut-sudut {location}.',
    'Para korban mulai kehilangan sisi kemanusiaannya setelah kutukan Vampire mengambil alih tubuh mereka.',
    'Wabah Vampire semakin meluas; beberapa warga {location} kini diam-diam menjadi bagian dari kegelapan.'
]);

export const ZOMBIE_COLLAPSE_STORIES = Object.freeze([
    'Saat Zombie asli terakhir tumbang di {location}, {count} yang tertular ikut roboh tanpa komando wabah.',
    'Wabah kehilangan kendali di {location}; {count} yang tertular pun tumbang bersama pemimpin Zombie.',
    'Tanpa Zombie asli yang memimpin, infeksi di {location} berhenti dan {count} yang tertular ikut jatuh.',
    'Kekalahan pemimpin Zombie memutus kendali wabah di {location}, meruntuhkan {count} yang tertular.',
    'Begitu semua Zombie asli tersingkir, {count} yang tertular di {location} ikut tumbang.'
]);

export const VAMPIRE_COLLAPSE_STORIES = Object.freeze([
    'Saat Vampire asli terakhir tumbang di {location}, {count} yang tertular ikut roboh tanpa tuannya.',
    'Kawanan Vampire kehilangan kendali di {location}; {count} korban kutukan ikut tumbang.',
    'Tanpa Vampire asli yang memimpin, kutukan di {location} terputus dan {count} yang tertular ikut jatuh.',
    'Tersingkirnya Vampire asli memutus ikatan darah di {location}; {count} yang tertular ikut roboh.',
    'Begitu semua Vampire asli dikalahkan, {count} yang tertular di {location} ikut tumbang.'
]);

export const VIGILANTE_CAPTURE_STORIES = Object.freeze([
    '{captors} menyergap dan menangkap {targets} di {location}.',
    'Operasi {captors} berhasil; {targets} tertangkap di {location}.',
    'Jejak para buronan berakhir di {location}, tempat {captors} menangkap {targets}.',
    '{captors} menutup semua jalan keluar dan membawa {targets} ke dalam tahanan.',
    'Setelah pengejaran di {location}, {captors} akhirnya menangkap {targets}.',
    '{targets} tidak sempat melarikan diri ketika {captors} mengepung mereka di {location}.',
    'Penyergapan mendadak dilakukan {captors}, membuat {targets} berhasil diamankan.',
    'Persembunyian {targets} terbongkar. {captors} langsung melakukan penangkapan di {location}.',
    '{captors} berhasil melacak keberadaan {targets} dan mengakhiri pelarian mereka.',
    'Pengejaran panjang berakhir ketika {captors} berhasil membekuk {targets} di {location}.',
    '{targets} terkepung dari segala arah setelah {captors} melancarkan operasi penangkapan.',
    'Dengan strategi yang matang, {captors} berhasil menjebak {targets} di {location}.',
    '{captors} menemukan tempat persembunyian {targets} dan langsung mengamankan mereka.',
    'Upaya pelarian {targets} gagal setelah {captors} menghadang mereka di {location}.',
    '{captors} bergerak cepat dan berhasil melumpuhkan perlawanan {targets}.',
    'Satu per satu jalan keluar ditutup hingga {targets} akhirnya tertangkap oleh {captors}.',
    'Pengintaian {captors} membuahkan hasil setelah menemukan {targets} di {location}.',
    '{targets} berhasil dilacak dan ditangkap dalam operasi yang dipimpin {captors}.',
    'Suara langkah para pengejar terdengar semakin dekat sebelum {captors} menangkap {targets}.',
    '{captors} melancarkan penyergapan saat {targets} lengah di {location}.',
    'Rencana pelarian {targets} berantakan setelah {captors} mengepung lokasi mereka.',
    '{captors} berhasil memojokkan {targets} hingga tidak memiliki kesempatan untuk kabur.',
    'Setelah menemukan petunjuk penting, {captors} berhasil menemukan dan menangkap {targets}.',
    '{targets} tertangkap dalam operasi pengepungan yang dilakukan {captors} di {location}.',
    'Perburuan berakhir dengan keberhasilan {captors} mengamankan {targets}.',
    '{captors} menghadang {targets} sebelum mereka sempat meninggalkan {location}.',
    'Sebuah jebakan berhasil mengurung {targets}, lalu {captors} melakukan penangkapan.',
    '{targets} mencoba melawan, tetapi {captors} berhasil menguasai keadaan dan menangkap mereka.',
    'Informasi dari penyelidikan membawa {captors} langsung menuju persembunyian {targets}.',
    'Gerak-gerik {targets} terpantau sejak awal hingga akhirnya mereka ditangkap oleh {captors}.',
    '{captors} melancarkan serangan mendadak dan berhasil mengamankan seluruh {targets}.',
    'Tidak ada jalan untuk melarikan diri setelah {captors} mengepung {targets} di {location}.',
    'Operasi pengejaran mencapai puncaknya ketika {captors} berhasil membekuk {targets}.',
    '{targets} akhirnya menyerah setelah terkepung oleh {captors} di {location}.',
    '{captors} menemukan celah dalam persembunyian {targets} dan memanfaatkannya untuk menangkap mereka.',
    'Pengepungan berlangsung singkat sebelum {captors} berhasil mengamankan {targets}.',
    'Rute pelarian {targets} telah diketahui. {captors} langsung menghadang mereka di {location}.',
    '{captors} berhasil menghentikan langkah {targets} sebelum mereka kembali beraksi.',
    'Setelah menyisir {location}, {captors} menemukan dan menangkap {targets}.',
    '{targets} tertangkap basah ketika {captors} tiba-tiba muncul di hadapan mereka.',
    'Keberadaan {targets} akhirnya terungkap dan {captors} segera melakukan penangkapan.',
    '{captors} mengepung tempat persembunyian {targets} hingga seluruh buronan berhasil diamankan.',
    'Operasi senyap {captors} sukses membawa {targets} ke dalam tahanan.',
    '{targets} gagal menghindari pengawasan {captors} dan akhirnya tertangkap di {location}.',
    'Dengan bantuan informasi yang terkumpul, {captors} berhasil menjebak {targets}.',
    'Penyergapan berlangsung cepat. Dalam waktu singkat, {captors} berhasil menangkap {targets}.',
    '{captors} memutus jalur pelarian dan memaksa {targets} menyerah di {location}.',
    'Persembunyian yang dianggap aman ternyata telah diketahui {captors}; {targets} pun tertangkap.',
    '{targets} dikejar hingga ke sudut {location} sebelum akhirnya berhasil diamankan oleh {captors}.',
    'Aksi pengepungan {captors} membuahkan hasil dengan tertangkapnya {targets}.',
    'Pelarian {targets} resmi berakhir setelah {captors} berhasil membekuk mereka di {location}.'
]);

export const VIGILANTE_ANTAGONIST_KILL_STORIES = Object.freeze([
    'Kekacauan pecah di antara para antagonis. {attackers} saling menyerang dan {victims} tewas di {location}.',
    'Persaingan antar-antagonis berubah menjadi pertumpahan darah; {attackers} membunuh {victims}.',
    'Di {location}, para antagonis berbalik melawan satu sama lain. {victims} menjadi korban serangan {attackers}.',
    'Aliansi mereka runtuh dalam semalam: {attackers} menyerang sesamanya hingga {victims} tewas.',
    'Para antagonis bertarung memperebutkan kendali di {location}; serangan {attackers} menewaskan {victims}.',
    'Kesepakatan di antara mereka hancur ketika {attackers} mengkhianati dan membunuh {victims}.',
    'Pertikaian internal berakhir tragis setelah {attackers} menghabisi {victims} di {location}.',
    '{attackers} tidak lagi menganggap {victims} sebagai sekutu dan memilih menyerang mereka.',
    'Ketegangan yang terus meningkat akhirnya memicu pertempuran antara {attackers} dan {victims}.',
    'Para antagonis kehilangan kendali. {attackers} menyerang {victims} tanpa ampun.',
    'Perebutan kekuasaan berubah menjadi pembantaian ketika {attackers} menghabisi {victims}.',
    'Di tengah kekacauan {location}, {attackers} melancarkan serangan mematikan terhadap {victims}.',
    'Rencana bersama mereka gagal total setelah {attackers} berbalik menyerang {victims}.',
    'Tidak ada lagi kepercayaan di antara mereka. {attackers} memilih menghabisi {victims}.',
    '{victims} tewas setelah terlibat perselisihan sengit dengan {attackers} di {location}.',
    'Pertemuan para antagonis berubah menjadi pertarungan berdarah yang menewaskan {victims}.',
    '{attackers} memanfaatkan situasi kacau untuk menyerang dan menghabisi {victims}.',
    'Perseteruan lama kembali mencuat hingga {attackers} membunuh {victims} di {location}.',
    'Saling curiga membuat para antagonis bertindak gegabah. {attackers} akhirnya membunuh {victims}.',
    'Serangan mendadak {attackers} membuat {victims} tidak sempat menyelamatkan diri.',
    'Pertarungan sengit terjadi di {location}, berakhir dengan tewasnya {victims} di tangan {attackers}.',
    'Para antagonis mulai saling memangsa. Kali ini, {attackers} menghabisi {victims}.',
    'Ambisi untuk menguasai keadaan membuat {attackers} menyingkirkan {victims} dengan paksa.',
    'Ketika kesepakatan mereka dilanggar, {attackers} langsung menyerang {victims}.',
    'Suasana berubah mencekam ketika {attackers} mengarahkan serangan kepada {victims}.',
    'Konflik antar-antagonis semakin memburuk hingga {attackers} menewaskan {victims}.',
    'Di {location}, perselisihan kecil berkembang menjadi pertarungan yang merenggut nyawa {victims}.',
    '{attackers} menganggap {victims} sebagai ancaman dan memutuskan untuk menghabisi mereka.',
    'Pengkhianatan terjadi di antara kelompok antagonis. {attackers} membunuh {victims} tanpa ragu.',
    'Tidak ada yang mampu menghentikan pertarungan ketika {attackers} menyerang {victims}.',
    'Perebutan pengaruh di antara mereka berakhir dengan kematian {victims} akibat serangan {attackers}.',
    'Sebuah perselisihan berujung fatal setelah {attackers} melancarkan serangan terhadap {victims}.',
    'Para antagonis saling berebut wilayah di {location}, dan {victims} menjadi korban serangan {attackers}.',
    '{attackers} memutuskan untuk mengakhiri persaingan dengan menyingkirkan {victims}.',
    'Pertemanan palsu mereka berakhir ketika {attackers} menyerang {victims} dari belakang.',
    'Kekuasaan menjadi alasan utama pertumpahan darah antara {attackers} dan {victims}.',
    '{victims} terjebak dalam konflik internal yang dipicu oleh serangan {attackers}.',
    'Malam itu dipenuhi kekacauan saat {attackers} memburu {victims} di {location}.',
    'Para antagonis tidak lagi bisa bekerja sama. {attackers} akhirnya menyingkirkan {victims}.',
    'Serangan brutal {attackers} mengakhiri perselisihan dengan tewasnya {victims}.',
    'Ketidakpercayaan di antara mereka berubah menjadi kekerasan. {attackers} membunuh {victims}.',
    'Di {location}, {attackers} melancarkan pengkhianatan yang berujung pada kematian {victims}.',
    'Persaingan semakin tidak terkendali hingga {attackers} menyerang {victims} secara terbuka.',
    '{attackers} melihat kesempatan untuk menyingkirkan pesaingnya dan langsung menghabisi {victims}.',
    'Sebuah pertarungan tak terhindarkan pecah di antara mereka, menewaskan {victims} oleh serangan {attackers}.',
    'Para antagonis saling menjatuhkan demi kepentingan sendiri. {attackers} berhasil membunuh {victims}.',
    'Konflik perebutan kendali di {location} berakhir setelah {attackers} menghabisi {victims}.',
    'Tidak ada tempat untuk bersembunyi ketika {attackers} mulai memburu {victims} di {location}.',
    'Pertikaian yang awalnya hanya berupa ancaman berubah menjadi serangan mematikan dari {attackers} kepada {victims}.',
    'Hubungan antar-antagonis hancur sepenuhnya setelah {attackers} menewaskan {victims}.'
]);

export const VIGILANTE_CAPTURE_SUMMARY_STORIES = Object.freeze([
    'Setelah pengejaran di {location}, {captors} akhirnya menangkap {targets}.',
    'Operasi penangkapan {captors} di {location} berhasil mengamankan {targets}.',
    '{captors} berhasil mengepung dan menangkap {targets} di {location}.',
    'Perburuan di {location} berakhir saat {captors} menangkap {targets}.',
    'Dengan penyergapan di {location}, {captors} berhasil membawa {targets} ke tahanan.',
    '{targets} berhasil dilumpuhkan dan ditangkap oleh {captors} di {location}.',
    'Pengejaran panjang berakhir di {location} setelah {captors} meringkus {targets}.',
    '{captors} menemukan persembunyian {targets} dan langsung melakukan penangkapan di {location}.',
    'Sebuah operasi rahasia di {location} berujung pada tertangkapnya {targets} oleh {captors}.',
    'Upaya pelarian {targets} gagal setelah {captors} mengepung mereka di {location}.',
    '{captors} berhasil menghentikan langkah {targets} dalam sebuah operasi di {location}.',
    'Situasi di {location} berhasil dikendalikan setelah {captors} menangkap {targets}.',
    'Persembunyian {targets} terbongkar, membuat {captors} berhasil meringkus mereka di {location}.',
    'Setelah berhasil melacak keberadaan mereka, {captors} menangkap {targets} di {location}.',
    'Penyergapan mendadak di {location} membuat {targets} tak berkutik menghadapi {captors}.',
    '{captors} menuntaskan misi mereka dengan menangkap {targets} di {location}.',
    'Pelarian {targets} terhenti ketika {captors} berhasil menghadang mereka di {location}.',
    'Tim {captors} berhasil mengamankan {targets} setelah pengepungan di {location}.',
    'Kejar-kejaran di {location} berakhir dengan keberhasilan {captors} menangkap {targets}.',
    '{targets} tak berhasil lolos dari pengejaran {captors} di {location}.',
    'Operasi pengejaran di {location} membuahkan hasil setelah {captors} meringkus {targets}.',
    '{captors} berhasil menemukan, mengepung, dan menangkap {targets} di {location}.',
    'Setelah penyelidikan singkat, {captors} berhasil mengidentifikasi dan menangkap {targets} di {location}.',
    'Kawasan {location} menjadi tempat berakhirnya pelarian {targets} setelah ditangkap {captors}.',
    'Aksi pengejaran {captors} berakhir sukses dengan tertangkapnya {targets} di {location}.',
    '{captors} melancarkan penyergapan terencana dan berhasil membekuk {targets} di {location}.',
    'Tidak ada jalan keluar bagi {targets} setelah {captors} mengepung kawasan {location}.',
    'Penangkapan berlangsung cepat ketika {captors} berhasil menghadang {targets} di {location}.',
    'Misi perburuan di {location} selesai setelah {captors} berhasil membawa {targets} dalam tahanan.',
    '{targets} akhirnya menyerah setelah terkepung oleh {captors} di {location}.',
    'Pergerakan {targets} berhasil dihentikan oleh {captors} melalui penyergapan di {location}.',
    'Sebuah pengepungan di {location} berakhir dengan keberhasilan {captors} mengamankan {targets}.',
    '{captors} berhasil menggagalkan pelarian {targets} dan menangkap mereka di {location}.',
    'Jejak {targets} berhasil dilacak hingga ke {location}, tempat {captors} melakukan penangkapan.',
    'Setelah berhasil mengepung area tersebut, {captors} mengamankan {targets} di {location}.',
    'Aksi {captors} di {location} berhasil mengakhiri pelarian {targets}.',
    '{targets} tertangkap setelah {captors} melakukan pengejaran intensif di {location}.',
    'Pengepungan tak terhindarkan bagi {targets} ketika {captors} tiba di {location}.',
    '{captors} berhasil menyergap {targets} sebelum mereka sempat melarikan diri dari {location}.',
    'Operasi di {location} berjalan lancar dan berakhir dengan tertangkapnya {targets}.',
    'Perburuan {captors} akhirnya membuahkan hasil setelah menemukan {targets} di {location}.',
    '{captors} berhasil mengakhiri pengejaran dengan membekuk {targets} di {location}.',
    'Kedatangan {captors} di {location} membuat {targets} kehilangan kesempatan untuk melarikan diri.',
    'Dalam operasi tersebut, {captors} berhasil menahan {targets} setelah mengepung {location}.',
    '{targets} berhasil diamankan oleh {captors} setelah terjebak dalam penyergapan di {location}.',
    'Pengejaran tanpa henti dari {captors} akhirnya membawa mereka kepada {targets} di {location}.',
    'Rencana pelarian {targets} berantakan setelah {captors} melakukan penangkapan di {location}.',
    'Dengan strategi pengepungan, {captors} berhasil menguasai situasi dan menangkap {targets} di {location}.',
    'Akhir dari perburuan tersebut terjadi di {location}, saat {captors} berhasil meringkus {targets}.',
    '{captors} sukses menjalankan misi penangkapan dan membawa {targets} dari {location}.'
]);

export const VIGILANTE_ATTACK_SUMMARY_STORIES = Object.freeze([
    'Pertarungan sengit terjadi di {location}, berakhir dengan tewasnya {victims} di tangan {attackers}.',
    '{attackers} menyerang di {location} dan menewaskan {victims}.',
    'Serangan {attackers} di {location} merenggut nyawa {victims}.',
    'Kekacauan di {location} berakhir tragis setelah {attackers} membunuh {victims}.',
    'Bentrok malam di {location} menewaskan {victims} akibat serangan {attackers}.',
    '{victims} ditemukan tewas setelah terlibat bentrokan dengan {attackers} di {location}.',
    'Aksi brutal {attackers} di {location} menyebabkan {victims} kehilangan nyawa.',
    'Suasana mencekam menyelimuti {location} setelah {attackers} menghabisi {victims}.',
    'Pertemuan di {location} berubah menjadi tragedi ketika {attackers} menyerang {victims}.',
    '{attackers} melancarkan serangan mendadak yang menewaskan {victims} di {location}.',
    'Insiden berdarah terjadi di {location}, merenggut nyawa {victims} akibat ulah {attackers}.',
    'Serangan tanpa ampun dari {attackers} membuat {victims} tewas di {location}.',
    '{location} menjadi saksi pertarungan terakhir {victims} melawan {attackers}.',
    'Pertempuran di {location} berakhir tragis dengan {victims} sebagai korban serangan {attackers}.',
    '{attackers} berhasil mengalahkan {victims} dalam bentrokan mematikan di {location}.',
    'Suara pertempuran terdengar dari {location} sebelum {victims} akhirnya tewas diserang {attackers}.',
    'Malam kelam di {location} diwarnai serangan {attackers} yang merenggut nyawa {victims}.',
    '{victims} tak berhasil selamat dari serangan {attackers} di {location}.',
    'Serangan mendadak di {location} berujung pada kematian {victims} di tangan {attackers}.',
    'Pertarungan sengit tak terhindarkan hingga {attackers} menewaskan {victims} di {location}.',
    'Tragedi terjadi di {location} setelah {attackers} mengakhiri hidup {victims}.',
    '{attackers} meninggalkan {victims} tak bernyawa setelah bentrokan di {location}.',
    'Sebuah insiden kekerasan di {location} merenggut nyawa {victims} akibat serangan {attackers}.',
    'Keadaan berubah mencekam saat {attackers} melancarkan serangan terhadap {victims} di {location}.',
    '{victims} menjadi korban dalam aksi penyerangan {attackers} yang terjadi di {location}.',
    'Pertempuran berdarah di {location} berakhir setelah {attackers} menumbangkan {victims}.',
    'Tidak ada yang tersisa dari pertarungan itu selain {victims} yang tewas akibat serangan {attackers}.',
    'Kejadian tragis di {location} berakhir dengan tewasnya {victims} setelah diserang {attackers}.',
    '{attackers} menerjang {victims} dalam sebuah serangan mematikan di {location}.',
    'Serangan tersebut berlangsung singkat, tetapi merenggut nyawa {victims} di {location}.',
    '{location} berubah menjadi lokasi tragedi setelah {attackers} menyerang dan membunuh {victims}.',
    'Bentrokan antara {attackers} dan {victims} di {location} berakhir dengan kematian.',
    '{victims} tak mampu bertahan menghadapi serangan {attackers} yang terjadi di {location}.',
    'Sebuah pertarungan berakhir dengan tragis ketika {attackers} menewaskan {victims} di {location}.',
    'Ketenangan {location} pecah akibat serangan {attackers} yang menewaskan {victims}.',
    'Aksi penyerangan {attackers} meninggalkan tragedi di {location} dengan {victims} sebagai korban.',
    'Pertumpahan darah terjadi di {location} setelah {attackers} menyerang {victims}.',
    '{attackers} berhasil melumpuhkan {victims}, tetapi serangan tersebut berakhir fatal di {location}.',
    'Suasana {location} mendadak berubah mencekam setelah {victims} tewas dalam serangan {attackers}.',
    'Pertarungan yang terjadi di {location} meninggalkan {victims} tak bernyawa di tangan {attackers}.',
    'Serangan {attackers} berlangsung brutal dan berakhir dengan tewasnya {victims} di {location}.',
    'Saksi melaporkan bentrokan di {location} yang berujung pada kematian {victims} akibat {attackers}.',
    '{victims} kehilangan nyawa dalam insiden penyerangan yang dilakukan {attackers} di {location}.',
    'Kejadian berdarah di {location} berakhir saat {attackers} berhasil menghabisi {victims}.',
    'Serangan yang dilancarkan {attackers} membuat {location} menjadi saksi tewasnya {victims}.',
    '{attackers} dan {victims} terlibat dalam bentrokan sengit yang berakhir tragis di {location}.',
    'Malam itu menjadi akhir bagi {victims} setelah serangan mematikan {attackers} di {location}.',
    'Pertikaian di {location} berujung maut ketika {attackers} menyerang {victims}.',
    'Insiden penyerangan di {location} meninggalkan {victims} tewas akibat tindakan {attackers}.',
    '{attackers} mengakhiri pertempuran di {location} dengan menewaskan {victims}.'
]);

export const MAYHEM_ATTACK_SUMMARY_STORIES = Object.freeze([
    'Pertarungan sengit terjadi di {location}, berakhir dengan tewasnya {victims} di tangan {attackers}.',
    'Serangan {attackers} mengguncang {location} dan menewaskan {victims}.',
    'Malam kacau di {location} berakhir dengan {victims} tewas akibat serangan {attackers}.',
    '{attackers} melancarkan serangan di {location} hingga {victims} menjadi korban.',
    'Kekacauan pecah di {location}; serangan {attackers} merenggut nyawa {victims}.',
    'Kawasan {location} berubah menjadi medan kekacauan setelah {attackers} menyerang {victims}.',
    'Aksi {attackers} membuat keadaan di {location} tak terkendali dan menewaskan {victims}.',
    'Kerusuhan melanda {location} ketika {attackers} mulai menyerang dan menghabisi {victims}.',
    'Kekacauan besar terjadi di {location}, meninggalkan {victims} tewas akibat ulah {attackers}.',
    '{attackers} mengacaukan situasi di {location} dengan serangan yang merenggut nyawa {victims}.',
    'Suasana mencekam menyelimuti {location} setelah serangan brutal {attackers} menewaskan {victims}.',
    'Kejadian tak terkendali di {location} berakhir tragis dengan tewasnya {victims} akibat {attackers}.',
    '{location} menjadi pusat kekacauan setelah {attackers} melancarkan serangan mematikan.',
    'Serangkaian serangan di {location} membuat {victims} kehilangan nyawa di tangan {attackers}.',
    'Kekacauan menyebar di {location} ketika {attackers} menyerbu dan menewaskan {victims}.',
    'Tidak ada ketenangan di {location} setelah {attackers} menyebabkan kematian {victims}.',
    'Aksi mengerikan {attackers} mengubah {location} menjadi tempat tragedi bagi {victims}.',
    'Keributan berubah menjadi pertumpahan darah saat {attackers} menyerang {victims} di {location}.',
    '{attackers} membuat suasana {location} semakin kacau dengan menewaskan {victims}.',
    'Kawasan tersebut dilanda kepanikan setelah {attackers} menyerang {victims} di {location}.',
    'Sebuah malam penuh kekacauan di {location} berakhir dengan jatuhnya {victims} akibat serangan {attackers}.',
    'Serangan bertubi-tubi {attackers} di {location} membuat {victims} tak berhasil bertahan hidup.',
    'Kekacauan yang dipicu {attackers} di {location} akhirnya merenggut nyawa {victims}.',
    '{victims} menjadi korban dalam kekacauan yang ditimbulkan {attackers} di {location}.',
    'Situasi di {location} semakin memburuk setelah {attackers} menyerang dan membunuh {victims}.',
    'Kepanikan meluas di {location} akibat serangan {attackers} yang menewaskan {victims}.',
    'Kerusuhan di {location} mencapai puncaknya ketika {attackers} menghabisi {victims}.',
    '{attackers} menciptakan kekacauan di {location} dan meninggalkan {victims} tak bernyawa.',
    'Satu malam yang kacau di {location} berakhir dengan tragedi bagi {victims} setelah diserang {attackers}.',
    'Aksi brutal {attackers} membuat {location} dipenuhi kepanikan dan menewaskan {victims}.',
    'Kondisi {location} berubah mencekam saat {attackers} melancarkan serangan terhadap {victims}.',
    'Kekacauan tak terhindarkan setelah {attackers} meneror kawasan {location} hingga {victims} tewas.',
    'Serangan mendadak {attackers} memicu kepanikan di {location} dan merenggut nyawa {victims}.',
    '{location} dilanda kekacauan hebat setelah {attackers} menewaskan {victims}.',
    'Pertumpahan darah di {location} terjadi setelah {attackers} menyerang tanpa ampun.',
    'Kericuhan di {location} berujung tragis ketika {attackers} berhasil membunuh {victims}.',
    'Kejadian mengerikan di {location} meninggalkan {victims} sebagai korban serangan {attackers}.',
    'Kekacauan menyelimuti kawasan itu setelah {attackers} menghabisi {victims} di {location}.',
    'Serangan {attackers} membuat keadaan semakin tidak terkendali hingga {victims} tewas di {location}.',
    'Malam penuh teror di {location} berakhir dengan tewasnya {victims} akibat ulah {attackers}.',
    '{attackers} meneror {location} melalui serangan yang berakhir dengan kematian {victims}.',
    'Kekacauan pecah tanpa peringatan di {location}, menewaskan {victims} akibat serangan {attackers}.',
    'Keadaan semakin buruk ketika {attackers} mengubah keributan di {location} menjadi tragedi berdarah.',
    '{victims} tak luput dari kekacauan yang ditimbulkan {attackers} di kawasan {location}.',
    'Serangan {attackers} memicu kepanikan besar di {location} dan berakhir dengan tewasnya {victims}.',
    'Kawasan {location} menjadi saksi kekacauan yang merenggut nyawa {victims} oleh {attackers}.',
    'Suasana berubah menjadi kacau balau saat {attackers} menyerang {victims} di {location}.',
    'Kejadian berdarah di {location} menjadi puncak kekacauan yang disebabkan oleh {attackers}.',
    'Serangan tanpa kendali dari {attackers} di {location} menyebabkan {victims} tewas.',
    'Kekacauan besar melanda {location} setelah {attackers} mengakhiri hidup {victims}.',
    'Malam di {location} berubah menjadi mimpi buruk setelah serangan {attackers} merenggut nyawa {victims}.'
]);

export const WARGA_AI_MESSAGES = Object.freeze([
    // ── PESAN UMUM ──
    'Ada yang melihat gerak-gerik mencurigakan semalam?',
    'Sebaiknya kita periksa petunjuk sebelum menentukan pilihan.',
    'Aku merasa ada yang belum jujur di antara kita.',
    'Jangan terburu-buru, dengarkan pendapat yang lain dulu.',
    'Kita harus bekerja sama agar desa tetap aman.',

    // ── PESAN DENGAN TARGET ──
    'Menurutku {target} agak mencurigakan sejak malam tadi.',
    'Aku curiga {target} menyembunyikan sesuatu. Ada yang setuju?',
    'Jangan-jangan {target} yang menyerang semalam; gerak-geriknya aneh.',
    'Aku belum yakin, tapi {target} patut kita awasi.',
    'Penjelasan {target} terdengar janggal. Kita perlu lebih teliti.',

    // ── PESAN UMUM ──
    'Kita tidak boleh asal menuduh tanpa bukti yang jelas.',
    'Aku merasa ada sesuatu yang sengaja ditutupi.',
    'Siapa yang punya informasi tentang kejadian semalam?',
    'Jangan sampai pelaku berhasil mengelabui kita semua.',
    'Menurutku, kita perlu mendengarkan semua pendapat terlebih dahulu.',

    // ── PESAN DENGAN TARGET ──
    'Aku merasa {target} terlalu banyak menghindari pertanyaan.',
    'Kenapa {target} terlihat begitu tenang sejak kejadian tadi malam?',
    'Ada yang memperhatikan perilaku {target} akhir-akhir ini?',
    'Sepertinya {target} tahu lebih banyak daripada yang dia katakan.',
    'Aku tidak sepenuhnya percaya dengan perkataan {target}.',

    // ── PESAN UMUM ──
    'Kita harus menemukan pelaku sebelum ada korban berikutnya.',
    'Jangan mudah percaya hanya karena seseorang terlihat baik.',
    'Aku ingin tahu siapa yang terakhir melihat korban.',
    'Sepertinya ada yang mencoba mengalihkan pembicaraan.',
    'Kita harus lebih berhati-hati dalam menentukan pilihan.',

    // ── PESAN DENGAN TARGET ──
    'Menurutku {target} punya alasan untuk menyembunyikan sesuatu.',
    'Aku tidak suka cara {target} menjawab pertanyaan tadi.',
    'Jangan abaikan {target}, dia terlihat cukup mencurigakan.',
    'Aku melihat {target} beberapa kali mengubah pendapatnya.',
    'Bagaimana kalau kita meminta {target} menjelaskan semuanya?',

    // ── PESAN UMUM ──
    'Apakah ada yang menemukan petunjuk baru?',
    'Kita tidak bisa terus berdiam diri seperti ini.',
    'Aku merasa pelaku sedang berada di antara kita.',
    'Jangan biarkan rasa takut menguasai keputusan kita.',
    'Mungkin ada hubungan antara kejadian semalam dan hari ini.',

    // ── PESAN DENGAN TARGET ──
    'Aku curiga {target} sedang berusaha mendapatkan kepercayaan kita.',
    'Kenapa {target} tidak pernah memberikan penjelasan yang jelas?',
    'Menurutku {target} perlu menjelaskan keberadaannya semalam.',
    'Aku merasa {target} sengaja menyembunyikan identitas aslinya.',
    'Ada kemungkinan {target} sedang berpura-pura menjadi warga biasa.',

    // ── PESAN UMUM ──
    'Jangan sampai kita salah memilih dan menguntungkan pelaku.',
    'Aku berharap semua orang bisa berkata jujur hari ini.',
    'Kita perlu mencari tahu siapa yang paling diuntungkan dari kejadian ini.',
    'Semakin lama kita menunggu, semakin besar risikonya.',
    'Aku rasa sudah waktunya kita mengambil keputusan.',

    // ── PESAN DENGAN TARGET ──
    'Aku punya firasat buruk tentang {target}.',
    'Sepertinya {target} sedang berusaha menghindari kecurigaan.',
    'Aku ingin mendengar alasan {target} sebelum memberikan suara.',
    'Jangan-jangan selama ini {target} adalah orang yang kita cari.',
    'Menurutku, kita sebaiknya mengawasi {target} lebih ketat.'
]);

const CIPHER_SUBSTITUTIONS = Object.freeze({
    a: '4',
    i: '1',
    e: '3',
    o: '0',
    b: '8',
    l: '7',
    s: '5',
    q: '9',
    g: '6'
});

export const encodeCipherMessage = (message) => String(message || '')
    .toLowerCase()
    .replace(/[aieoblsqg]/g, (letter) => CIPHER_SUBSTITUTIONS[letter])
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());

const encodeCipherTemplate = (template) => {
    const [beforeTarget, afterTarget] = template.split('{target}');
    if (afterTarget === undefined) return encodeCipherMessage(beforeTarget);
    const encodedPrefix = encodeCipherMessage(beforeTarget);
    const encodedSuffix = encodeCipherMessage(afterTarget)
        .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
    return `${encodedPrefix}{target}${encodedSuffix}`;
};

const CIPHER_AI_MESSAGE_TEMPLATES = Object.freeze({
    general: Object.freeze([
        'Kamu, kita perlu tetap tenang dan mendengar semua pendapat sebelum voting.',
        'Kita jangan terburu-buru menentukan pilihan tanpa membaca alur ceritanya.',
        'Menurutku, petunjuk yang kita perlukan masih bisa muncul dari pembicaraan.',
        'Kalau semua tetap tenang, kita bisa memilih dengan lebih adil.',
        'Kita perlu membandingkan cerita tiap orang sebelum menarik kesimpulan.',
        'Jangan sampai suasana diskusi membuat kita melupakan petunjuk sebelumnya.',
        'Aku rasa kita perlu mengingat kembali kejadian pada malam pertama.',
        'Coba perhatikan siapa yang paling sering mengubah pendapatnya.',
        'Sebaiknya kita tidak langsung percaya pada satu cerita saja.',
        'Setiap pemain punya kesempatan untuk menjelaskan dirinya masing-masing.',
        'Menurut pengamatanku, masih ada beberapa hal yang belum kita bahas.',
        'Kita harus lebih teliti sebelum memutuskan siapa yang akan dipilih.',
        'Jangan biarkan tuduhan tanpa alasan memengaruhi keputusan bersama.',
        'Mungkin jawaban sebenarnya ada pada percakapan yang sebelumnya terlewat.',
        'Coba hubungkan setiap kejadian agar kita tidak salah membaca situasi.',
        'Aku menyarankan kita untuk memeriksa kembali semua informasi yang tersedia.',
        'Tidak semua pemain yang terlihat mencurigakan pasti menjadi pelakunya.',
        'Kita perlu mencari alasan yang masuk akal dari setiap tindakan.',
        'Perhatikan juga pemain yang terlalu diam selama diskusi berlangsung.',
        'Sebaiknya kita memberi kesempatan semua orang untuk menyampaikan pendapat.',
        'Aku merasa masih ada informasi penting yang belum terungkap.',
        'Jangan mengambil keputusan hanya berdasarkan dugaan pribadi.',
        'Kita perlu mencari kesamaan dari beberapa cerita yang sudah disampaikan.',
        'Coba ingat siapa yang pertama kali memberikan tuduhan dalam diskusi.',
        'Menurutku, hasil malam ini bisa menjadi petunjuk untuk voting nanti.',
        'Kita sebaiknya tidak mengabaikan perbedaan kecil dalam setiap cerita.',
        'Pastikan alasan yang digunakan benar-benar sesuai dengan kejadian.',
        'Aku ingin kita mempertimbangkan semua kemungkinan sebelum memilih.',
        'Jangan sampai pemain yang tidak bersalah menjadi korban kesalahan kita.',
        'Cobalah melihat situasi dari sudut pandang pemain lainnya.',
        'Kita masih punya waktu untuk menyusun kesimpulan yang lebih kuat.',
        'Perubahan sikap seseorang bisa menjadi petunjuk yang cukup penting.',
        'Aku rasa diskusi akan lebih berguna jika semua orang ikut berbicara.',
        'Jangan hanya mengikuti pilihan mayoritas tanpa memahami alasannya.',
        'Kita perlu membedakan antara fakta yang ditemukan dan sekadar dugaan.',
        'Sebaiknya semua pemain menjelaskan alasan di balik keputusan mereka.',
        'Aku melihat ada beberapa pendapat yang saling bertentangan.',
        'Coba perhatikan apakah ada pemain yang berusaha mengalihkan pembicaraan.',
        'Kita harus tetap waspada meskipun situasi terlihat aman.',
        'Jangan terlalu cepat menyimpulkan sesuatu dari satu kejadian saja.',
        'Mungkin kita bisa menemukan petunjuk baru dengan membandingkan cerita.',
        'Aku berharap keputusan kali ini didasarkan pada bukti yang jelas.',
        'Setiap informasi kecil bisa membantu kita menemukan jawaban sebenarnya.',
        'Kita perlu memastikan bahwa semua tuduhan memiliki dasar yang kuat.',
        'Coba pikirkan siapa yang paling diuntungkan dari keputusan sebelumnya.',
        'Jangan sampai perdebatan membuat kita kehilangan fokus utama.',
        'Aku menyarankan agar kita mendengarkan penjelasan sebelum memberikan tuduhan.',
        'Masih ada kemungkinan bahwa pelaku sedang berusaha mengalihkan perhatian.',
        'Kita harus lebih berhati-hati dalam mempercayai informasi yang beredar.',
        'Menurutku, kerja sama dan ketelitian akan menentukan hasil permainan ini.'
    ]),
    target: Object.freeze([
        'Menurutku {target} perlu menjelaskan alasannya tentang kejadian malam tadi.',
        'Kalau melihat dari ceritanya, {target} tampak menyimpan sesuatu dari kita.',
        'Aku ingin mendengar pendapat {target} sebelum kita menentukan pilihan.',
        'Sepertinya {target} menghindari bagian penting dari pembicaraan tadi.',
        'Kita sebaiknya meminta {target} menjelaskan perubahan ceritanya.',
        'Menurut pengamatanku, {target} belum memberikan penjelasan yang cukup jelas.',
        'Aku merasa {target} perlu menjelaskan alasan di balik tindakannya.',
        'Coba tanyakan kepada {target} mengapa pendapatnya berubah begitu cepat.',
        'Sepertinya ada bagian dari cerita {target} yang belum sesuai.',
        'Aku ingin tahu bagaimana {target} menjelaskan kejadian sebelumnya.',
        'Menurutku, {target} terlalu cepat memberikan tuduhan kepada pemain lain.',
        'Kita perlu mendengar penjelasan {target} sebelum mengambil keputusan.',
        'Apakah {target} bisa menjelaskan alasan memilih pemain tersebut?',
        'Aku melihat {target} belum menjawab pertanyaan yang diajukan tadi.',
        'Coba perhatikan bagaimana {target} menanggapi tuduhan dari pemain lain.',
        'Menurutku, {target} perlu memberikan alasan yang lebih masuk akal.',
        'Ada beberapa hal dari perkataan {target} yang masih perlu diperiksa.',
        'Aku penasaran mengapa {target} justru menghindari pertanyaan tersebut.',
        'Sebaiknya kita meminta {target} menjelaskan pendapatnya sekali lagi.',
        'Kalau tidak ada yang disembunyikan, {target} seharusnya bisa menjawabnya.',
        'Aku merasa penjelasan {target} masih belum menjawab inti permasalahan.',
        'Coba tanyakan kepada {target} tentang perubahan sikapnya sejak awal.',
        'Menurutku, {target} perlu menjelaskan hubungannya dengan kejadian malam tadi.',
        'Ada kemungkinan {target} mengetahui sesuatu yang belum disampaikan.',
        'Aku ingin mendengar alasan {target} mencurigai pemain tersebut.',
        'Perhatikan apakah jawaban {target} tetap konsisten sampai akhir diskusi.',
        'Sepertinya {target} memiliki alasan tertentu untuk mengalihkan pembicaraan.',
        'Kita belum mendapatkan penjelasan lengkap dari {target}.',
        'Aku menyarankan agar {target} menjelaskan semua informasi yang diketahuinya.',
        'Mengapa {target} justru mengubah pendapat setelah mendengar tuduhan itu?',
        'Menurut pengamatanku, {target} terlihat kurang yakin dengan ceritanya sendiri.',
        'Coba minta {target} menjelaskan bagian yang berbeda dari pernyataan sebelumnya.',
        'Aku rasa {target} perlu menjawab pertanyaan pemain lain terlebih dahulu.',
        'Ada sesuatu yang membuat pernyataan {target} terasa kurang meyakinkan.',
        'Sebaiknya {target} memberikan penjelasan sebelum kita menentukan hasil voting.',
        'Aku ingin mengetahui alasan sebenarnya di balik keputusan {target}.',
        'Jangan abaikan perubahan cerita yang disampaikan oleh {target}.',
        'Menurutku, {target} perlu menjelaskan mengapa dirinya memilih diam tadi.',
        'Coba perhatikan siapa yang paling sering membela {target} selama diskusi.',
        'Aku belum sepenuhnya yakin dengan semua penjelasan yang diberikan {target}.',
        'Apakah {target} memiliki bukti untuk mendukung tuduhannya terhadap pemain lain?',
        'Sepertinya {target} belum menjelaskan alasan dari pilihannya sebelumnya.',
        'Kita perlu memastikan apakah cerita {target} sesuai dengan petunjuk yang ada.',
        'Aku melihat {target} beberapa kali menghindari pembahasan tentang kejadian malam.',
        'Mungkin {target} bisa membantu menjelaskan informasi yang masih belum jelas.',
        'Menurutku, jawaban {target} akan membantu kita memahami situasi sebenarnya.',
        'Coba beri kesempatan kepada {target} untuk menjelaskan semua tuduhan.',
        'Aku ingin tahu apakah {target} masih memiliki pendapat yang sama seperti sebelumnya.',
        'Perhatikan reaksi {target} ketika pemain lain mulai membahas kejadian tersebut.',
        'Ada beberapa alasan yang membuat {target} perlu diperiksa lebih lanjut.',
        'Sebelum voting, sebaiknya kita mendengar penjelasan terakhir dari {target}.'
    ])
});

export const CIPHER_AI_MESSAGES = Object.freeze({
    general: Object.freeze(CIPHER_AI_MESSAGE_TEMPLATES.general.map(encodeCipherMessage)),
    target: Object.freeze(CIPHER_AI_MESSAGE_TEMPLATES.target.map(encodeCipherTemplate))
});

export const GHOST_AI_MESSAGES = Object.freeze({
    general: Object.freeze([
        'Aku masih mengikuti diskusi kalian dari sini, jadi jangan lewatkan petunjuk yang sudah terkumpul.',
        'Walaupun sudah gugur, aku tetap berharap kalian bisa menemukan pelaku dengan tenang.',
        'Coba cocokkan hasil malam dengan cerita yang disampaikan saat diskusi berlangsung.',
        'Aku tidak bisa ikut voting lagi, tetapi menurutku kalian sebaiknya menimbang semua bukti.',
        'Jangan terburu-buru mengambil keputusan; dengarkan penjelasan setiap pemain terlebih dahulu.',
        'Aku masih penasaran dengan siapa yang sebenarnya berada di balik semua kejadian ini.',
        'Meskipun sudah tidak bisa bertindak, aku tetap ingin membantu kalian menemukan pelaku.',
        'Jangan lupakan informasi yang sudah kalian dapatkan sejak awal permainan.',
        'Kurasa kalian perlu memperhatikan kembali semua kejadian yang sudah berlalu.',
        'Aku akan terus mengamati diskusi kalian meskipun sudah berada di dunia arwah.',
        'Cobalah untuk tidak saling menyalahkan tanpa alasan yang benar-benar jelas.',
        'Sepertinya masih ada pemain yang belum menunjukkan identitas sebenarnya.',
        'Aku harap kalian bisa bekerja sama sampai permainan ini benar-benar berakhir.',
        'Jangan biarkan satu tuduhan membuat kalian melupakan petunjuk lainnya.',
        'Aku ingin melihat kalian berhasil menemukan pelaku yang sebenarnya.',
        'Mungkin ada sesuatu dari kejadian sebelumnya yang belum kalian sadari.',
        'Tetap tenang dan jangan biarkan emosi mengambil alih keputusan kalian.',
        'Aku memang sudah gugur, tetapi masih bisa mengikuti perkembangan permainan.',
        'Coba perhatikan siapa yang paling diuntungkan dari setiap keputusan.',
        'Jangan terlalu mudah percaya kepada pemain yang terlihat paling meyakinkan.',
        'Aku harap kalian tidak mengulangi kesalahan yang membuatku gugur.',
        'Semua petunjuk yang sudah ditemukan masih bisa membantu kalian.',
        'Kurasa diskusi kali ini akan menentukan arah permainan selanjutnya.',
        'Jangan sampai kalian kehilangan fokus hanya karena perdebatan kecil.',
        'Aku akan mendukung kalian meskipun tidak bisa ikut menentukan pilihan.',
        'Perhatikan perubahan perilaku pemain dari satu malam ke malam berikutnya.',
        'Aku penasaran siapa yang akan berhasil bertahan sampai akhir.',
        'Ingat bahwa tidak semua informasi yang disampaikan pemain pasti benar.',
        'Kalian harus lebih teliti sebelum mempercayai setiap penjelasan.',
        'Aku masih punya banyak pendapat, tetapi sekarang hanya bisa menjadi penonton.',
        'Semoga semua pemain yang masih bertahan bisa mengambil keputusan terbaik.',
        'Jangan abaikan suara pemain yang selama ini jarang ikut berbicara.',
        'Aku merasa ada sesuatu yang belum terungkap dari seluruh kejadian ini.',
        'Cobalah untuk menghubungkan hasil voting dengan peristiwa sebelumnya.',
        'Meskipun sudah gugur, aku masih berharap bisa melihat kemenangan tim kita.',
        'Jangan biarkan pelaku memanfaatkan kebingungan yang sedang terjadi.',
        'Aku ingin kalian mempertimbangkan semua kemungkinan sebelum mengambil keputusan.',
        'Kurasa masih terlalu awal untuk memastikan siapa yang bisa dipercaya.',
        'Teruslah berdiskusi, mungkin jawaban sebenarnya ada di antara kalian.',
        'Aku tidak bisa memberikan suara, jadi gunakan kesempatan kalian dengan baik.',
        'Jangan sampai pemain yang tidak bersalah kembali menjadi korban.',
        'Aku harap kalian bisa menemukan pola dari kejadian yang sudah berlangsung.',
        'Setiap keputusan memiliki konsekuensi, jadi pikirkan semuanya dengan matang.',
        'Tetap waspada karena permainan belum selesai hanya dengan satu keberhasilan.',
        'Aku ingin tahu apakah dugaan kalian kali ini akan terbukti benar.',
        'Jangan terlalu fokus pada satu pemain sampai melupakan kemungkinan lainnya.',
        'Semoga petunjuk yang sudah terkumpul bisa membawa kalian menuju jawaban.',
        'Aku akan tetap berada di sini sampai pemenang permainan diumumkan.',
        'Percayalah pada bukti yang ada, bukan sekadar perkataan yang terdengar meyakinkan.',
        'Aku sudah tidak bisa kembali, jadi pastikan perjuangan kalian tidak sia-sia.'
    ]),
    target: Object.freeze([
        'Menurut pengamatanku, {target} perlu menjelaskan lagi bagian ceritanya yang berubah.',
        'Aku sudah gugur, tetapi sikap {target} tadi masih terasa mencurigakan bagiku.',
        'Coba tanyakan langsung kepada {target} soal alasan memilih pemain itu.',
        'Dari yang kulihat sebelum gugur, {target} tampak menghindari pertanyaan penting.',
        'Sebaiknya kalian dengarkan penjelasan {target} sebelum menentukan pilihan.',
        'Aku merasa {target} masih menyimpan sesuatu yang belum diceritakan kepada kalian.',
        'Menurutku, {target} perlu menjelaskan alasan di balik tuduhan sebelumnya.',
        'Coba perhatikan bagaimana {target} merespons setiap pertanyaan dari pemain lain.',
        'Ada sesuatu dari perkataan {target} yang membuatku belum merasa yakin.',
        'Aku penasaran mengapa {target} mengubah pendapatnya setelah kejadian tadi.',
        'Sepertinya {target} belum memberikan penjelasan yang benar-benar meyakinkan.',
        'Kalian sebaiknya meminta {target} menjelaskan semua hal yang diketahuinya.',
        'Aku masih ingat bagaimana {target} bersikap sebelum aku gugur.',
        'Coba tanyakan kepada {target} tentang kejadian yang berlangsung semalam.',
        'Menurut pengamatanku, {target} terlalu cepat mengalihkan pembicaraan.',
        'Aku ingin tahu alasan {target} mencurigai pemain yang sebelumnya dibelanya.',
        'Jangan abaikan perubahan sikap {target} selama diskusi berlangsung.',
        'Mungkin {target} memiliki informasi penting yang belum disampaikan.',
        'Aku merasa jawaban {target} masih belum menjawab pertanyaan utama.',
        'Sebaiknya kalian tidak langsung mempercayai semua penjelasan {target}.',
        'Coba perhatikan apakah {target} tetap konsisten dengan pernyataan sebelumnya.',
        'Aku melihat {target} beberapa kali menghindari pembahasan tertentu.',
        'Menurutku, {target} perlu memberikan alasan yang lebih jelas kepada kalian.',
        'Apakah {target} bisa menjelaskan dasar dari tuduhannya terhadap pemain lain?',
        'Aku belum yakin apakah cerita {target} sesuai dengan petunjuk yang ada.',
        'Kalian perlu mendengar penjelasan {target} sebelum mengambil keputusan akhir.',
        'Ada kemungkinan {target} sedang mencoba mengalihkan perhatian kalian.',
        'Aku ingin kalian memperhatikan hubungan antara {target} dan kejadian sebelumnya.',
        'Mengapa {target} terlihat berbeda ketika pembahasan mulai mengarah kepadanya?',
        'Coba minta {target} menjelaskan alasan dirinya memilih untuk diam.',
        'Menurutku, {target} masih perlu diperiksa berdasarkan semua informasi yang tersedia.',
        'Aku merasa ada bagian dari cerita {target} yang belum terungkap.',
        'Perhatikan reaksi {target} ketika pemain lain mulai memberikan tuduhan.',
        'Sebaiknya kalian tanyakan langsung kepada {target} tentang perubahan ceritanya.',
        'Aku tidak bisa memastikan apa pun, tetapi {target} patut mendapat perhatian lebih.',
        'Coba bandingkan pernyataan {target} dengan hasil kejadian malam sebelumnya.',
        'Sepertinya {target} belum menjelaskan alasan sebenarnya dari tindakannya.',
        'Aku ingin tahu apakah {target} memiliki bukti untuk mendukung perkataannya.',
        'Jangan sampai penjelasan {target} membuat kalian melupakan petunjuk lainnya.',
        'Menurut pengamatanku, {target} tampak kurang nyaman saat ditanya tentang kejadian tadi.',
        'Aku menyarankan kalian meminta {target} menjelaskan pilihannya secara langsung.',
        'Ada beberapa hal dari tindakan {target} yang masih belum bisa kupahami.',
        'Coba perhatikan siapa saja yang terus mendukung {target} selama diskusi.',
        'Aku merasa {target} mengetahui sesuatu yang belum dibagikan kepada kalian.',
        'Sebelum voting, sebaiknya kalian mendengar penjelasan terakhir dari {target}.',
        'Menurutku, cerita {target} perlu dibandingkan dengan informasi dari pemain lain.',
        'Aku masih mengingat kejadian sebelum gugur, dan sikap {target} cukup menarik perhatian.',
        'Kalian sebaiknya memastikan apakah alasan {target} benar-benar masuk akal.',
        'Coba tanyakan kepada {target} mengapa dirinya memberikan pendapat yang berbeda.',
        'Aku belum bisa mengabaikan beberapa kejanggalan dari pernyataan {target}.',
        'Mungkin penjelasan {target} bisa membantu kalian menemukan jawaban sebenarnya.'
    ])
});

export const AI_PROTAGONIST_ROLES = Object.freeze([
    'warga',
    'seer',
    'guardian',
    'hunter',
    'mayor',
    'warden',
    'ghost'
]);

export const isValidCipherMessage = (message) => {
    const text = String(message || '');
    return /\d/.test(text) && !/[AIEOBLSQG]/i.test(text);
};

export const CUSTOM_ANTAGONIST_ROLES = Object.freeze([
    'werewolf',
    'mafia',
    'killer',
    'assassin',
    'impostor',
    'alien',
    'parasite',
    'zombie',
    'vampire'
]);

export const validateCustomRoles = (roles = [], { requireAntagonist = false } = {}) => {
    const assignedRoles = roles.filter(Boolean);
    const invalidRole = assignedRoles.find((role) => !Object.hasOwn(ROLE_DATA, role));
    if (invalidRole) return { valid: false, reason: 'invalid-role', role: invalidRole };

    const antagonistRoles = new Set(assignedRoles.filter((role) => CUSTOM_ANTAGONIST_ROLES.includes(role)));
    const unsupportedMultipleAntagonists = antagonistRoles.size > 1 &&
        [...antagonistRoles].some((role) => !['zombie', 'vampire'].includes(role));
    if (antagonistRoles.size > 1 && unsupportedMultipleAntagonists) {
        return { valid: false, reason: 'multiple-antagonists' };
    }
    if (requireAntagonist && antagonistRoles.size === 0) return { valid: false, reason: 'missing-antagonist' };

    const roleCounts = assignedRoles.reduce((counts, role) => {
        counts[role] = (counts[role] || 0) + 1;
        return counts;
    }, {});
    const roleLimits = { hunter: 2, warden: 2, guardian: 2, sorcerer: 2, ghost: 4 };
    const duplicateRole = Object.entries(roleCounts).find(([role, count]) =>
        count > 1 &&
        role !== 'warga' &&
        !CUSTOM_ANTAGONIST_ROLES.includes(role) &&
        !roleLimits[role]
    ) || Object.entries(roleCounts).find(([role, count]) => roleLimits[role] && count > roleLimits[role]);
    if (duplicateRole) return { valid: false, reason: 'duplicate-role', role: duplicateRole[0] };

    return { valid: true, reason: null };
};

export const HIDE_ACTIONS = Object.freeze([
    'Tidur di kamar',
    'Sembunyi di kulkas',
    'Ngumpet di lemari',
    'Diam di loteng',
    'Masuk gudang',
    'Jaga pos ronda',
    'Di balik tirai',
    'Kabur ke hutan',
    'Sembunyi di kolong',
    'Pura-pura jadi patung',

    'Tidur di bawah meja',
    'Sembunyi di balik pintu',
    'Ngumpet di bawah kasur',
    'Diam di ruang bawah tanah',
    'Masuk kamar kosong',
    'Jaga pintu belakang',
    'Di balik sofa',
    'Kabur ke semak-semak',
    'Sembunyi di balik pohon',
    'Pura-pura jadi lampu',

    'Tidur di gudang kosong',
    'Sembunyi di balik gorden',
    'Ngumpet di bawah tangga',
    'Diam di ruang penyimpanan',
    'Masuk ke dalam peti',
    'Jaga lorong gelap',
    'Di balik rak buku',
    'Kabur ke kebun belakang',
    'Sembunyi di balik pagar',
    'Pura-pura jadi kucing',

    'Tidur di ruang arsip',
    'Sembunyi di balik lemari',
    'Ngumpet di kolong ranjang',
    'Diam di balik pintu',
    'Masuk ke ruang rahasia',
    'Jaga lorong gudang',
    'Di balik tumpukan kardus',
    'Kabur ke perkebunan',
    'Sembunyi di semak belukar',
    'Pura-pura jadi pot tanaman',

    'Tidur di kamar loteng',
    'Sembunyi di balik rak',
    'Ngumpet di bawah dipan',
    'Diam di ruang kosong',
    'Masuk ke gudang tua',
    'Jaga pintu samping',
    'Di balik lemari besar',
    'Kabur ke hutan bambu',
    'Sembunyi di balik batu',
    'Pura-pura jadi boneka',

    'Tidur di ruang tamu',
    'Sembunyi di balik sofa',
    'Ngumpet di bawah meja makan',
    'Diam di kamar terkunci',
    'Masuk ke ruang laundry',
    'Jaga pintu gudang',
    'Di balik rak sepatu',
    'Kabur ke kebun bambu',
    'Sembunyi di balik batang pohon',
    'Pura-pura jadi anjing',

    'Tidur di ruang istirahat',
    'Sembunyi di balik tumpukan kain',
    'Ngumpet di dalam lemari pakaian',
    'Diam di ruang kerja',
    'Masuk ke ruang bawah tangga',
    'Jaga pintu loteng',
    'Di balik tumpukan jerami',
    'Kabur ke perkebunan teh',
    'Sembunyi di balik semak tinggi',
    'Pura-pura jadi gantungan baju',

    'Tidur di kamar kosong',
    'Sembunyi di balik rak gudang',
    'Ngumpet di bawah meja kerja',
    'Diam di gudang belakang',
    'Masuk ke ruang penyimpanan',
    'Jaga pintu belakang rumah',
    'Di balik tumpukan karung',
    'Kabur ke kebun luas',
    'Sembunyi di balik reruntuhan',
    'Pura-pura jadi tanaman hias',

    'Tidur di dalam tenda',
    'Sembunyi di balik pohon tumbang',
    'Ngumpet di bawah jembatan',
    'Diam di dalam goa',
    'Masuk ke terowongan',
    'Jaga pintu gua',
    'Di balik bebatuan besar',
    'Kabur ke lembah',
    'Sembunyi di balik akar pohon',
    'Pura-pura jadi burung',

    'Tidur di rumah pohon',
    'Sembunyi di balik kontainer',
    'Ngumpet di dalam peti kayu',
    'Diam di gerbong kosong',
    'Masuk ke ruang rahasia bawah tanah',
    'Jaga lorong tersembunyi',
    'Di balik dinding batu',
    'Kabur ke hutan pinus',
    'Sembunyi di balik rerimbunan',
    'Pura-pura jadi tempat sampah'
]);

export const getRandomHideActions = (usedActions = [], limit = 5) => {
    const used = new Set(usedActions);
    const available = HIDE_ACTIONS.filter((action) => !used.has(action));
    const pool = available.length > 0 ? available : [...HIDE_ACTIONS];
    const count = Math.min(Math.max(0, limit), 5, pool.length);

    for (let index = pool.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
    }

    return {
        actions: pool.slice(0, count),
        reset: available.length === 0
    };
};

export const ANTAGONIST_STORIES = Object.freeze([
    '{antagonist} menerobos {location} dalam kegelapan dan menerkam {target}.',
    'Jejak kaki berlumur darah tertinggal saat {antagonist} menyeret {target} ke dalam bayang-bayang.',
    'Jeritan {target} memecah malam; {antagonist} telah menemukan mangsanya.',
    'Pintu rumah {target} tercabik. {antagonist} menghilang sebelum warga terbangun.',
    'Di bawah cahaya bulan, {antagonist} menyergap {target} tanpa memberi kesempatan melawan.',
    '{antagonist} menyelinap melewati penjagaan dan menemukan {target} yang sedang sendirian.',
    'Suasana {location} mendadak mencekam ketika {antagonist} melancarkan serangan terhadap {target}.',
    'Tak ada yang menyadari kedatangan {antagonist} hingga {target} ditemukan tak bernyawa.',
    'Dari balik kegelapan, {antagonist} muncul dan menyerang {target} secara tiba-tiba.',
    '{target} mencoba melarikan diri, tetapi {antagonist} berhasil mengejarnya di sudut {location}.',
    'Langkah kaki terdengar mendekat sebelum {antagonist} menyergap {target} dalam kesunyian.',
    '{antagonist} memanfaatkan kelengahan warga untuk menghabisi {target} tanpa saksi.',
    'Sebuah bayangan melintas di jendela. Tak lama kemudian, {target} menjadi korban serangan {antagonist}.',
    '{antagonist} menunggu saat yang tepat sebelum menyerang {target} di tempat persembunyiannya.',
    'Malam itu menjadi mimpi buruk bagi {location} setelah {antagonist} menemukan {target}.',
    'Peringatan datang terlambat. {antagonist} telah menyerang {target} sebelum siapa pun sempat membantu.',
    '{target} mendengar suara aneh dari belakang, tetapi semuanya sudah terlambat saat {antagonist} muncul.',
    'Di lorong yang gelap, {antagonist} menghadang {target} dan melancarkan serangan mematikan.',
    '{antagonist} menerobos masuk melalui jendela dan membuat {target} tak sempat meminta pertolongan.',
    'Kesunyian {location} pecah oleh keributan singkat saat {antagonist} menyerang {target}.',
    '{antagonist} mengikuti {target} dari kejauhan sebelum akhirnya melancarkan serangan.',
    'Lampu mendadak padam. Dalam kegelapan itu, {antagonist} menjadikan {target} sebagai korban.',
    '{target} bersembunyi di {location}, tetapi {antagonist} berhasil menemukan tempat persembunyiannya.',
    'Pintu terbuka perlahan, memperlihatkan {antagonist} yang sudah mengincar {target} sejak tadi.',
    '{antagonist} memanfaatkan kabut tebal untuk mendekati dan menyerang {target} tanpa terlihat.',
    'Warga mendengar suara benda jatuh dari rumah {target}, tetapi {antagonist} sudah melarikan diri.',
    '{antagonist} muncul dari balik pepohonan dan menerjang {target} yang sedang melintas.',
    'Tak ada jejak yang jelas selain bekas perkelahian di tempat {antagonist} menyerang {target}.',
    '{target} berusaha melawan, tetapi {antagonist} berhasil menguasai keadaan.',
    'Di tengah hujan deras, {antagonist} menyergap {target} ketika jalanan {location} mulai sepi.',
    '{antagonist} menyusup ke tempat tinggal {target} dan menghilang sebelum bantuan tiba.',
    'Sebuah teriakan terdengar dari kejauhan. Saat warga datang, {antagonist} dan {target} sudah tak terlihat.',
    '{antagonist} menunggu di balik pintu hingga {target} datang, lalu langsung melancarkan serangan.',
    'Kabut malam menyelimuti {location} saat {antagonist} memburu {target} tanpa ampun.',
    '{target} sempat melihat sosok {antagonist} sebelum serangan itu terjadi.',
    '{antagonist} memecahkan keheningan malam dengan menerobos tempat persembunyian {target}.',
    'Di dekat bangunan terbengkalai, {antagonist} berhasil menjebak {target} yang sedang lewat.',
    '{antagonist} meninggalkan kekacauan di {location} setelah menyerang {target} secara brutal.',
    '{target} mengira dirinya aman, sampai {antagonist} muncul dari tempat yang tak terduga.',
    'Suara langkah cepat terdengar di gang sempit sebelum {antagonist} menyergap {target}.',
    '{antagonist} memanfaatkan suasana sepi untuk mendekati {target} tanpa menarik perhatian.',
    'Penjagaan {location} berhasil dilewati oleh {antagonist}, yang kemudian menyerang {target}.',
    '{target} mencoba mencari bantuan, tetapi {antagonist} lebih dahulu menghentikannya.',
    'Sosok misterius menerobos kerumunan dan menyerang {target}; belakangan diketahui bahwa pelakunya adalah {antagonist}.',
    '{antagonist} mengintai dari kejauhan sebelum akhirnya menjadikan {target} sasaran berikutnya.',
    'Tak seorang pun melihat kejadian itu secara langsung ketika {antagonist} menyerang {target}.',
    '{antagonist} memanfaatkan pintu yang tak terkunci untuk menyelinap dan menyerang {target}.',
    'Di tengah suasana mencekam {location}, {antagonist} berhasil melumpuhkan {target} dan melarikan diri.',
    '{target} ditemukan setelah serangan mendadak {antagonist} membuat seluruh warga gempar.',
    'Serangan {antagonist} kembali memakan korban. Kali ini, {target} tak berhasil menyelamatkan diri.'
]);

export const PROTAGONIST_WIN_STORIES = Object.freeze([
    '{protagonist} berhasil mengungkap dan mengusir {antagonist} dari {location}. Kini keadaan kembali aman.',
    'Berkat keberanian dan kerja sama, {protagonist} akhirnya menumbangkan {antagonist}. {location} kembali tenang.',
    'Setelah penyelidikan panjang, {protagonist} menemukan pelaku dan menghentikan ancaman {antagonist}.',
    '{antagonist} tak lagi bisa bersembunyi. {protagonist} bersatu dan berhasil menyelamatkan {location}.',
    'Saat harapan hampir padam, {protagonist} bangkit bersama dan memenangkan pertarungan melawan {antagonist}.',
    '{protagonist} berhasil menjebak {antagonist} dan mengakhiri teror yang menghantui {location}.',
    'Bukti-bukti yang terkumpul akhirnya membuka kedok {antagonist}. {protagonist} berhasil membawa keadilan bagi {location}.',
    'Rencana {antagonist} gagal total setelah {protagonist} berhasil membaca setiap gerakannya.',
    '{protagonist} bekerja sama mengamankan {location} dan memastikan {antagonist} tak bisa menyerang lagi.',
    'Keberanian {protagonist} membuahkan hasil. {antagonist} berhasil dikalahkan dan warga dapat bernapas lega.',
    'Setelah menghadapi berbagai ancaman, {protagonist} akhirnya menghentikan aksi {antagonist}.',
    '{antagonist} mencoba melarikan diri, tetapi {protagonist} berhasil mengepung dan menangkapnya.',
    'Siasat {antagonist} terbongkar berkat kecermatan {protagonist}. Ancaman terhadap {location} pun berakhir.',
    '{protagonist} tidak menyerah meski keadaan sulit. Pada akhirnya, {antagonist} berhasil ditaklukkan.',
    'Warga {location} bersorak setelah {protagonist} berhasil mengakhiri teror {antagonist}.',
    '{protagonist} mengumpulkan petunjuk terakhir dan akhirnya menemukan persembunyian {antagonist}.',
    'Dengan strategi yang matang, {protagonist} berhasil memojokkan {antagonist} hingga tak bisa berkutik.',
    'Ancaman yang selama ini menghantui {location} berakhir ketika {protagonist} berhasil mengalahkan {antagonist}.',
    '{protagonist} berhasil menyelamatkan keadaan setelah menggagalkan serangan terakhir {antagonist}.',
    'Kerja sama {protagonist} membuat {antagonist} kehilangan kesempatan untuk melanjutkan aksinya.',
    '{antagonist} akhirnya tertangkap setelah {protagonist} menemukan bukti yang tak terbantahkan.',
    'Dengan keberanian luar biasa, {protagonist} menghadapi {antagonist} dan keluar sebagai pemenang.',
    '{protagonist} berhasil membongkar penyamaran {antagonist} sebelum korban berikutnya berjatuhan.',
    'Jebakan yang disiapkan {antagonist} justru berbalik merugikannya setelah {protagonist} menyadari rencananya.',
    'Setelah pengejaran menegangkan, {protagonist} berhasil menghentikan {antagonist} di perbatasan {location}.',
    '{protagonist} menyatukan seluruh petunjuk dan mengungkap siapa yang selama ini meneror {location}.',
    'Kecerdikan {protagonist} membuat {antagonist} kehilangan tempat untuk bersembunyi.',
    '{antagonist} akhirnya menyerah setelah seluruh jalan keluarnya ditutup oleh {protagonist}.',
    'Warga yang semula ketakutan kini merasa aman berkat keberhasilan {protagonist} menghentikan {antagonist}.',
    '{protagonist} berhasil menggagalkan rencana jahat {antagonist} tepat sebelum semuanya terlambat.',
    'Pertarungan sengit berakhir dengan kemenangan {protagonist}. {antagonist} tak lagi menjadi ancaman bagi {location}.',
    '{protagonist} menemukan celah dalam pertahanan {antagonist} dan menggunakannya untuk memenangkan pertarungan.',
    'Berkat kesaksian warga dan penyelidikan yang teliti, {protagonist} berhasil mengungkap kejahatan {antagonist}.',
    '{antagonist} kehilangan kendali atas situasi setelah {protagonist} berhasil membalikkan keadaan.',
    '{protagonist} melindungi warga {location} dan memastikan {antagonist} tak dapat melanjutkan terornya.',
    'Rencana pelarian {antagonist} kandas ketika {protagonist} berhasil menghadangnya.',
    'Setelah malam penuh ketegangan, {protagonist} akhirnya membawa {location} menuju keadaan yang lebih aman.',
    '{protagonist} berhasil mengungkap tempat persembunyian {antagonist} dan mengakhiri pengejaran panjang.',
    'Dengan bukti yang kuat, {protagonist} membuat semua orang mengetahui kejahatan {antagonist}.',
    '{antagonist} tak menyangka bahwa {protagonist} telah menyiapkan strategi untuk mengantisipasi serangannya.',
    'Keberhasilan {protagonist} menggagalkan serangan terakhir membuat warga {location} terhindar dari bahaya.',
    '{protagonist} mengejar {antagonist} hingga ke tempat persembunyiannya dan berhasil mengakhiri ancaman.',
    'Kebohongan {antagonist} terbongkar satu per satu. {protagonist} akhirnya berhasil mengungkap kebenaran.',
    '{protagonist} menolak menyerah pada rasa takut dan berhasil membawa {antagonist} ke hadapan hukum.',
    'Setelah menyusun rencana bersama, {protagonist} berhasil mengepung {antagonist} tanpa memberinya jalan keluar.',
    '{location} kembali damai setelah {protagonist} memastikan {antagonist} tak lagi berkeliaran.',
    '{protagonist} berhasil membaca langkah terakhir {antagonist} dan menggagalkan seluruh rencananya.',
    'Ancaman besar akhirnya berakhir. {protagonist} memenangkan pertarungan dan menyelamatkan warga {location}.',
    '{antagonist} kehilangan kesempatan untuk menyerang kembali setelah {protagonist} berhasil melumpuhkannya.',
    'Kemenangan menjadi milik {protagonist}. Teror {antagonist} berakhir dan {location} kembali dipenuhi rasa lega.'
]);

export const HIDE_ANTAGONIST_STORIES = Object.freeze([
    '{target} mencoba menghindari {antagonist} dengan memilih {hideAction}, tetapi persembunyiannya terbongkar.',
    'Meski {target} memilih {hideAction}, {antagonist} menemukan jejaknya dan menyerang.',
    '{antagonist} menggeledah sekitar dan menemukan tempat persembunyian {target}: {hideAction}.',
    'Upaya {target} untuk bersembunyi dengan pilihan {hideAction} hampir berhasil, namun {antagonist} keburu menemukannya.',
    'Tak disangka, {antagonist} mengetahui tempat {target} bersembunyi: {hideAction}; malam itu pun berakhir nahas.',
    '{target} berharap {hideAction} bisa menyelamatkannya, tetapi {antagonist} berhasil menemukan persembunyiannya.',
    'Setelah mencari ke berbagai tempat, {antagonist} akhirnya menemukan {target} yang memilih {hideAction}.',
    '{target} berusaha menghilang dengan {hideAction}, namun {antagonist} tak mudah dikelabui.',
    'Persembunyian {target} yang berada di {hideAction} akhirnya diketahui oleh {antagonist}.',
    '{antagonist} mengikuti petunjuk kecil hingga menemukan {target} yang bersembunyi dengan cara {hideAction}.',
    '{target} memilih {hideAction} untuk menghindari bahaya, tetapi {antagonist} datang lebih cepat dari perkiraan.',
    'Suasana mendadak mencekam saat {antagonist} menemukan {target} di tempat persembunyiannya, yaitu {hideAction}.',
    '{hideAction} menjadi pilihan {target} untuk berlindung, sayangnya {antagonist} berhasil menemukannya.',
    '{antagonist} memeriksa setiap sudut hingga akhirnya menemukan {target} yang sedang {hideAction}.',
    'Rencana {target} untuk bersembunyi dengan {hideAction} gagal setelah {antagonist} melihat keberadaannya.',
    '{target} berusaha tetap diam saat memilih {hideAction}, tetapi suara kecil membuat {antagonist} curiga.',
    '{antagonist} menyadari ada sesuatu yang janggal di sekitar {hideAction} dan akhirnya menemukan {target}.',
    'Meski sudah memilih {hideAction}, {target} tak mampu menghindari pencarian {antagonist}.',
    '{target} mengira {hideAction} adalah tempat yang aman, hingga {antagonist} muncul tepat di hadapannya.',
    'Pencarian {antagonist} berakhir ketika ia menemukan {target} bersembunyi di {hideAction}.',
    '{antagonist} memperhatikan lingkungan sekitar dan menyadari bahwa {target} memilih {hideAction}.',
    '{target} mencoba mengecoh {antagonist} dengan {hideAction}, tetapi siasat itu tidak berhasil.',
    'Tak ada tempat yang cukup aman bagi {target}. Bahkan {hideAction} akhirnya ditemukan oleh {antagonist}.',
    '{antagonist} mendengar suara mencurigakan dari arah {hideAction} dan langsung menemukan {target}.',
    '{target} hampir lolos setelah memilih {hideAction}, tetapi {antagonist} menemukannya pada saat terakhir.',
    'Harapan {target} untuk selamat pupus ketika {antagonist} memeriksa {hideAction} dan menemukannya.',
    '{antagonist} menelusuri jejak yang ditinggalkan {target} hingga tiba di tempat persembunyian {hideAction}.',
    '{target} mencoba menahan napas saat {hideAction}, tetapi {antagonist} tetap berhasil menemukannya.',
    'Keputusan {target} untuk memilih {hideAction} ternyata keliru karena {antagonist} memeriksa tempat itu.',
    '{antagonist} bergerak perlahan mendekati {hideAction}, lalu menemukan {target} yang bersembunyi di sana.',
    '{target} mengandalkan {hideAction} sebagai perlindungan terakhir, namun {antagonist} berhasil membongkar persembunyiannya.',
    'Setelah mengecek tempat-tempat tersembunyi, {antagonist} menemukan {target} yang memilih {hideAction}.',
    '{target} berusaha tidak menarik perhatian saat {hideAction}, tetapi {antagonist} telanjur melihatnya.',
    '{antagonist} mencurigai tempat {hideAction} dan memutuskan untuk memeriksanya. Ternyata {target} ada di sana.',
    'Persembunyian {target} di {hideAction} tak luput dari pengamatan tajam {antagonist}.',
    '{target} mengira berhasil mengelabui {antagonist} dengan {hideAction}, tetapi keberadaannya segera diketahui.',
    '{antagonist} mencari dengan teliti sampai menemukan {target} yang bersembunyi menggunakan cara {hideAction}.',
    'Tempat {hideAction} tidak mampu menyembunyikan {target} dari {antagonist} yang terus memburunya.',
    '{target} memilih {hideAction} untuk menghindari kejaran, tetapi {antagonist} berhasil mengepungnya.',
    'Langkah {antagonist} terhenti di dekat {hideAction}. Setelah memeriksanya, ia menemukan {target}.',
    '{target} berharap {antagonist} melewati tempat {hideAction}, tetapi nasib berkata lain.',
    '{antagonist} menyisir {location} dan akhirnya menemukan {target} yang memilih {hideAction}.',
    'Upaya {target} menghilang dengan {hideAction} gagal ketika {antagonist} menemukan petunjuk keberadaannya.',
    '{antagonist} tak tertipu oleh pilihan {hideAction} dan berhasil menemukan {target} yang bersembunyi.',
    '{target} sudah memilih tempat persembunyian dengan cermat, tetapi {antagonist} tetap menemukannya di {hideAction}.',
    'Saat {target} merasa aman di {hideAction}, {antagonist} tiba-tiba muncul dan membongkar persembunyiannya.',
    '{antagonist} mengikuti petunjuk di sekitar {location} sampai menemukan {target} yang bersembunyi dengan {hideAction}.',
    '{target} mencoba bertahan dengan memilih {hideAction}, tetapi pencarian {antagonist} berakhir dengan penemuan itu.',
    'Tak butuh waktu lama bagi {antagonist} untuk menemukan {target} setelah memeriksa lokasi {hideAction}.',
    '{target} gagal menghindari {antagonist}. Pilihan persembunyian {hideAction} justru membawanya ke dalam bahaya.'
]);

export const ROLE_DEATH_STORIES = Object.freeze({
    guardian: Object.freeze([
        '{target} sibuk melindungi yang lain sebagai Guardian, hingga tak sempat menyelamatkan dirinya sendiri.',
        'Saat Guardian {target} berjaga, {antagonist} menyelinap dan menyerangnya.',
        '{target} memasang perlindungan untuk warga, tetapi serangan {antagonist} datang terlalu cepat.',
        'Guardian {target} berusaha menahan serangan {antagonist}, namun akhirnya tumbang.',
        'Di tengah tugasnya menjaga warga, {target} menjadi sasaran {antagonist}.',
        '{target} berdiri di garis depan untuk melindungi warga, tetapi {antagonist} berhasil menerobos pertahanannya.',
        'Ketika Guardian {target} memeriksa keamanan {location}, {antagonist} melancarkan serangan mendadak.',
        '{target} mengorbankan keselamatannya demi melindungi orang lain dari ancaman {antagonist}.',
        'Perlindungan yang disiapkan Guardian {target} tak cukup kuat untuk menghadapi serangan {antagonist}.',
        '{antagonist} memanfaatkan kelengahan {target} saat Guardian itu sedang menjaga tempat persembunyian warga.',
        '{target} berusaha menghadang {antagonist} agar warga sempat melarikan diri, tetapi nyawanya tak terselamatkan.',
        'Guardian {target} tetap bertahan melindungi warga meski serangan {antagonist} semakin dekat.',
        'Saat memeriksa keadaan sekitar, {target} disergap {antagonist} sebelum sempat mengaktifkan perlindungannya.',
        '{target} menjadi korban ketika berusaha menyelamatkan warga yang terancam oleh {antagonist}.',
        'Tugas Guardian membawa {target} berhadapan langsung dengan {antagonist}, dan pertemuan itu berakhir tragis.',
        '{target} mencoba menutup jalan masuk agar {antagonist} tak bisa mendekati warga, tetapi justru terkena serangan.',
        'Di tengah kekacauan {location}, Guardian {target} tetap melindungi orang lain hingga akhirnya tumbang.',
        '{antagonist} berhasil mengecoh Guardian {target} dan menyerangnya ketika pertahanan sedang terbuka.',
        '{target} terlambat menyadari bahwa {antagonist} telah melewati penjagaannya.',
        'Guardian {target} mengerahkan seluruh kemampuannya untuk bertahan, tetapi serangan {antagonist} terlalu kuat.',
        '{target} menempatkan dirinya di antara warga dan {antagonist}, namun tak berhasil selamat dari serangan itu.',
        'Ketika {antagonist} menerobos {location}, Guardian {target} menjadi orang pertama yang berusaha menghentikannya.',
        '{target} sibuk memastikan semua orang terlindungi hingga tak menyadari {antagonist} sudah berada di dekatnya.',
        'Perjuangan Guardian {target} untuk menjaga keamanan warga berakhir saat {antagonist} melancarkan serangan terakhir.',
        '{target} menjalankan tugasnya sebagai Guardian sampai akhir, tetapi tak mampu bertahan dari serangan {antagonist}.'
    ]),

    seer: Object.freeze([
        'Saat Seer {target} menerawang rahasia malam, {antagonist} menemukannya.',
        '{target} hampir mengungkap identitas {antagonist}, tetapi lebih dulu disergap.',
        'Penglihatan Seer {target} tak sempat menyelamatkannya dari serangan {antagonist}.',
        '{target} sibuk mencari petunjuk sebagai Seer ketika {antagonist} menyerang.',
        'Sebelum sempat membagikan penglihatannya, Seer {target} dibungkam oleh {antagonist}.',
        '{target} memperoleh petunjuk penting tentang {antagonist}, tetapi tak sempat memberitahukannya kepada warga.',
        'Seer {target} sedang menafsirkan penglihatannya ketika {antagonist} datang menyerang.',
        '{target} mencoba menggunakan penglihatannya untuk menghindari bahaya, tetapi {antagonist} menemukannya lebih dahulu.',
        'Rahasia yang diketahui Seer {target} membuatnya menjadi sasaran {antagonist}.',
        '{target} hampir menyampaikan hasil penerawangannya di {location} sebelum serangan {antagonist} terjadi.',
        'Saat berusaha memastikan identitas musuh, Seer {target} justru ditemukan oleh {antagonist}.',
        '{antagonist} menyadari bahwa {target} mengetahui terlalu banyak rahasia dan segera menyerangnya.',
        '{target} sedang menyusun hasil penyelidikan sebagai Seer ketika {antagonist} menyergapnya.',
        'Penglihatan terakhir Seer {target} mengarah pada {antagonist}, tetapi kebenaran itu terkubur bersamanya.',
        '{target} mencoba mencari tahu siapa yang mengancam {location}, namun {antagonist} menghentikan penyelidikannya.',
        'Seer {target} merasakan bahaya mendekat, tetapi tak mampu menghindari serangan {antagonist}.',
        '{target} baru saja menemukan petunjuk tentang {antagonist} ketika persembunyiannya terbongkar.',
        'Di tengah penerawangan, Seer {target} dikejutkan oleh kedatangan {antagonist}.',
        '{target} berusaha menyembunyikan hasil penglihatannya dari {antagonist}, tetapi gagal menyelamatkan diri.',
        'Seer {target} mengetahui adanya ancaman di {location}, tetapi tak menyangka dirinya akan menjadi korban berikutnya.',
        '{antagonist} menyerang {target} sebelum Seer itu sempat mengungkap hasil penyelidikannya kepada warga.',
        '{target} mencoba menghubungkan semua petunjuk sebagai Seer, tetapi {antagonist} lebih dahulu menemukannya.',
        'Penerawangan Seer {target} mengungkap rahasia berbahaya, dan {antagonist} memastikan rahasia itu tak tersebar.',
        '{target} sedang mencari jawaban tentang identitas {antagonist} saat serangan mendadak mengakhiri penyelidikannya.',
        'Seer {target} membawa rahasia penting hingga akhir hayatnya setelah diserang oleh {antagonist}.'
    ])
});

export const normalizeGameCategory = (value = 'ww') => {
    const normalized = String(value).trim().toLowerCase();
    return Object.values(GAME_CATEGORIES).find((category) =>
        category.id === normalized || category.aliases.includes(normalized)
    ) || null;
};

export const getGameCategory = (value = 'ww') => normalizeGameCategory(value) || GAME_CATEGORIES.ww;

export const getGameRole = (category, role) => {
    const game = getGameCategory(category);
    return role === 'werewolf' ? game.antagonist : role;
};

export const isAntagonistRole = (category, role) => {
    const game = getGameCategory(category);
    if (['custom', 'mayhem', 'vigilante'].includes(game.id)) {
        return CUSTOM_ANTAGONIST_ROLES.includes(role);
    }
    return role === game.antagonist;
};

export const isNeutralRole = (role) => role === 'jester' || role === 'cipher' || role === 'fixer';

export const getRoleFaction = (role) => {
    if (CUSTOM_ANTAGONIST_ROLES.includes(role)) return 'antagonist';
    if (isNeutralRole(role) || role === 'sorcerer') return 'neutral';
    return 'protagonist';
};

export const getSorcererFaction = (action, hasOtherAntagonist) => {
    if (!hasOtherAntagonist) return action === 'revive' ? 'antagonist' : 'neutral';
    if (action === 'poison') return 'antagonist';
    if (action === 'revive') return 'protagonist';
    return 'neutral';
};
