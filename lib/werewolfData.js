export const GAME_CATEGORIES = Object.freeze({
    ww: {
        id: 'werewolf',
        name: 'Werewolf',
        antagonist: 'werewolf',
        antagonistName: 'Werewolf',
        antagonistEmoji: '🐺',
        aliases: ['ww', 'werewolf'],
        protagonistName: 'Warga',
        location: 'desa',
        description: 'Permainan deduksi sosial berlatar desa yang diteror Werewolf. Warga menjalankan peran rahasia, berdiskusi, dan melakukan voting untuk menemukan Werewolf sebelum jumlah mereka menguasai desa.'
    },
    mafia: {
        id: 'mafia',
        name: 'Mafia',
        antagonist: 'mafia',
        antagonistName: 'Mafia',
        antagonistEmoji: '🕴️',
        aliases: ['mafia'],
        protagonistName: 'Warga',
        location: 'kota',
        description: 'Permainan deduksi sosial berlatar kota yang disusupi Mafia. Warga menggunakan petunjuk dan kemampuan role untuk membongkar anggota Mafia melalui diskusi dan voting.'
    },
    killer: {
        id: 'killer',
        name: 'Killer',
        antagonist: 'killer',
        antagonistName: 'Killer',
        antagonistEmoji: '🔪',
        aliases: ['killer'],
        protagonistName: 'Warga',
        location: 'kota',
        description: 'Permainan deduksi sosial tentang warga yang berusaha mengungkap Killer misterius. Setiap malam membawa ancaman baru, sementara diskusi dan voting menentukan siapa yang dicurigai.'
    },
    assassin: {
        id: 'assassin',
        name: 'Assassin',
        antagonist: 'assassin',
        antagonistName: 'Assassin',
        antagonistEmoji: '🥷',
        aliases: ['assassin', 'assasin', 'assasins'],
        protagonistName: 'Warga',
        location: 'kota',
        description: 'Permainan deduksi sosial tentang warga yang mencari Assassin tersembunyi. Para pemain memakai kemampuan role, mengumpulkan petunjuk, dan memilih tersangka dalam voting.'
    },
    impostor: {
        id: 'impostor',
        name: 'Impostor',
        antagonist: 'impostor',
        antagonistName: 'Impostor',
        antagonistEmoji: '🚨',
        aliases: ['impostor', 'imposter'],
        protagonistName: 'Crew',
        location: 'pesawat',
        description: 'Permainan deduksi sosial di dalam pesawat yang dipenuhi Crew dan seorang Impostor. Crew harus menemukan penyusup lewat petunjuk, diskusi, dan voting sebelum terlambat.'
    },
    alien: {
        id: 'alien',
        name: 'Alien',
        antagonist: 'alien',
        antagonistName: 'Alien',
        antagonistEmoji: '👽',
        aliases: ['alien'],
        protagonistName: 'Warga',
        location: 'bumi',
        description: 'Permainan deduksi sosial tentang warga yang berusaha menemukan Alien penyusup sebelum ia menguasai keadaan.'
    },
    parasite: {
        id: 'parasite',
        name: 'Parasite',
        antagonist: 'parasite',
        antagonistName: 'Parasite',
        antagonistEmoji: '🦠',
        aliases: ['parasite'],
        protagonistName: 'Warga',
        location: 'desa',
        description: 'Permainan deduksi sosial tentang makhluk parasit yang menyusup ke tubuh warga dan memangsa desa dari dalam.'
    },
    custom: {
        id: 'custom',
        name: 'Custom Role',
        antagonist: 'custom',
        antagonistName: 'Antagonis',
        antagonistEmoji: '🎭',
        aliases: ['custom'],
        protagonistName: 'Protagonis',
        location: 'arena',
        description: 'Mode simulasi Game Roles: pemain mendapat role yang ditentukan manual untuk latihan dan pengujian command.'
    }
});

export const ROLE_DATA = Object.freeze({
    warga: { emoji: '👱‍♂️', title: 'Warga', description: 'Penduduk biasa yang mengandalkan pengamatan dan diskusi untuk menjaga desanya dari ancaman tersembunyi.', effect: 'Tidak memiliki aksi malam khusus; ikut voting untuk mengeksekusi tersangka.' },
    seer: { emoji: '👳', title: 'Seer', description: 'Peramal yang membaca identitas seseorang lewat penglihatan yang tak dimiliki warga lain.', effect: 'Sekali selama permainan, periksa role satu pemain pada malam hari.' },
    guardian: { emoji: '👼', title: 'Guardian', description: 'Pelindung desa yang berjaga di balik bayang-bayang untuk menyelamatkan satu orang dari bahaya.', effect: 'Sekali selama permainan, lindungi satu pemain—termasuk diri sendiri—dari serangan malam dan eksekusi voting.' },
    sorcerer: { emoji: '🔮', title: 'Sorcerer', description: 'Peramu sihir yang menguasai ramuan berbahaya sekaligus rahasia untuk memanggil orang mati kembali.', effect: 'Pilih satu target untuk diracuni atau satu pemain mati untuk dibangkitkan. Jika ada antagonis lain, racun menjadikannya antagonis dan revive menjadikannya warga; tanpa antagonis lain, ia tetap netral.' },
    werewolf: { emoji: '🐺', title: 'Werewolf', description: 'Manusia serigala yang menyamar sebagai warga pada siang hari dan berburu bersama kawanannya saat malam.', effect: 'Bersama Werewolf lain, pilih satu pemain untuk diserang setiap malam.' },
    mafia: { emoji: '🕴️', title: 'Mafia', description: 'Anggota sindikat yang menyusup ke tengah warga dan menjalankan perburuan secara terorganisasi.', effect: 'Bersama Mafia lain, pilih satu pemain untuk diserang setiap malam.' },
    killer: { emoji: '🔪', title: 'Killer', description: 'Pembunuh bayaran yang bergerak sendiri, mengincar warga tanpa meninggalkan jejak.', effect: 'Pilih satu pemain untuk diserang setiap malam.' },
    assassin: { emoji: '🥷', title: 'Assassin', description: 'Pembunuh tersembunyi yang mengincar target dengan presisi sebelum identitasnya terbongkar.', effect: 'Pilih satu pemain untuk dieliminasi setiap malam.' },
    impostor: { emoji: '🚨', title: 'Impostor', description: 'Penyusup yang berpura-pura menjadi bagian dari kru sambil diam-diam menyingkirkan mereka.', effect: 'Pilih satu kru untuk diserang setiap malam.' },
    alien: { emoji: '👽', title: 'Alien', description: 'Makhluk asing yang menyamar di antara manusia dan berusaha menguasai tempat yang disusupinya.', effect: 'Pilih satu pemain untuk diserang setiap malam.' },
    hunter: { emoji: '🏹', title: 'Hunter', description: 'Pemburu yang tetap siap melawan bahkan ketika dirinya sendiri telah tumbang.', effect: 'Saat gugur, dapat memilih satu pemain hidup untuk ditembak sebelum fase berlanjut.' },
    mayor: { emoji: '👑', title: 'Mayor', description: 'Pemimpin desa yang suaranya memiliki pengaruh lebih besar dalam menentukan keputusan bersama.', effect: 'Suara dalam voting bernilai dua.' },
    jester: { emoji: '🃏', title: 'Jester', description: 'Pengacau yang ingin membuat warga salah menilai dirinya hingga mereka sendiri menjatuhkan hukuman.', effect: 'Menang sendiri jika dieksekusi melalui voting warga.' },
    warden: { emoji: '⚒️', title: 'Warden', description: 'Penjaga tangguh yang mengenakan pelindung khusus untuk bertahan dari satu serangan mematikan.', effect: 'Armor sekali pakai menahan serangan malam, racun, tembakan Hunter, atau eksekusi voting.' },
    cipher: { emoji: '🔢', title: 'Cipher', description: 'Pemecah sandi yang mengumpulkan rahasia para antagonis, tetapi memilih bertahan hidup daripada berpihak.', effect: 'Menang bersama warga atau antagonis jika masih hidup saat permainan berakhir. Pesan biasa wajib mengandung angka dan tidak boleh memuat A, I, E, O, B, L, S, Q, atau G; pesan yang melanggar dihapus. Kartu pertama menunjukkan siapa antagonisnya.' },
    parasite: { emoji: '🦠', title: 'Parasite', description: 'Makhluk parasit yang bersembunyi di balik tubuh inangnya, menyebarkan teror, dan memburu desa tanpa menunjukkan wujud aslinya.', effect: 'Pilih satu pemain untuk diserang setiap malam; menang sebagai antagonis dengan menghabisi atau mengungguli warga.' },
    fixer: { emoji: '🕵️', title: 'Fixer', description: 'Perantara bawah tanah yang menerima urusan rahasia dan mengatur agar targetnya tersingkir, tanpa harus turun tangan sendiri.', effect: 'Di awal permainan mendapat satu target kontrak. Menang sendiri jika target mati karena sebab apa pun selama Fixer masih hidup; boleh memanfaatkan voting, meyakinkan pemain lain, atau membiarkan antagonis membunuh target.' }
});

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
    'parasite'
]);

export const validateCustomRoles = (roles = [], { requireAntagonist = false } = {}) => {
    const assignedRoles = roles.filter(Boolean);
    const invalidRole = assignedRoles.find((role) => !Object.hasOwn(ROLE_DATA, role));
    if (invalidRole) return { valid: false, reason: 'invalid-role', role: invalidRole };

    const antagonistRoles = new Set(assignedRoles.filter((role) => CUSTOM_ANTAGONIST_ROLES.includes(role)));
    if (antagonistRoles.size > 1) return { valid: false, reason: 'multiple-antagonists' };
    if (requireAntagonist && antagonistRoles.size === 0) return { valid: false, reason: 'missing-antagonist' };

    const roleCounts = assignedRoles.reduce((counts, role) => {
        counts[role] = (counts[role] || 0) + 1;
        return counts;
    }, {});
    const duplicateRole = Object.entries(roleCounts).find(([role, count]) =>
        count > 1 && role !== 'warga' && !CUSTOM_ANTAGONIST_ROLES.includes(role)
    );
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
    if (game.id === 'custom') {
        return CUSTOM_ANTAGONIST_ROLES.includes(role);
    }
    return role === game.antagonist;
};

export const isNeutralRole = (role) => role === 'jester' || role === 'cipher' || role === 'fixer';

export const getSorcererFaction = (action, hasOtherAntagonist) => {
    if (!hasOtherAntagonist) return 'neutral';
    if (action === 'poison') return 'antagonist';
    if (action === 'revive') return 'protagonist';
    return 'neutral';
};
