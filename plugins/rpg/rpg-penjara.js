import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { ensurePrisonCell, getRandomPrisonCell } from '../../lib/prisonHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'

/* =========================================================
   DIALOG VISIT 20x20
========================================================= */

const dialogVisitNapi = [
    '“Akhirnya ada juga yang datang menjengukku...”','“Kau datang jauh-jauh cuma buat lihat aku di balik jeruji?”','“Aku baik-baik saja... cuma bosan dengan tembok ini.”','“Jangan khawatir. Aku masih kuat bertahan di sini.”','“Kunjunganmu benar-benar membuat waktuku terasa lebih cepat.”',
    '“Aku nggak menyangka masih ada yang mau datang menjenguk.”','“Di sini dingin dan sepi. Lumayan ada teman ngobrol.”','“Kalau kau punya kabar dari luar, ceritakan semuanya.”','“Aku sudah mulai hafal bentuk setiap sudut ruangan ini.”','“Terima kasih sudah datang. Setidaknya hari ini tidak terasa terlalu panjang.”',
    '“Bang tolong dong... kasih makan 😭”','“Aku dijebak bang, sumpah demi Tuhan”','“Udah 3 hari makan roti doang”','“Besok aku bebas kan bang? Tolong ya”','“Makasih udah mau nengok... sepi banget disini”',
    '“Lu juga hati2 bang, polisi lagi nyari2”','“Titip salam buat keluarga ya bang”','“Aku kapok bang, ga bakal ngulang lagi”','“Ada rokok ga bang? Bosen banget”','“Doain aku cepet bebas ya bang 🙏”',
    '“Bang, ada kabar terbaru dari luar nggak?”','“Hari ini rasanya lama banget berlalu.”','“Aku kangen suasana di luar sana.”','“Kalau bisa, bawain sesuatu buat dimakan ya.”','“Di sini tiap hari rasanya sama aja.”',
    '“Aku masih nggak percaya bisa berakhir di tempat kayak gini.”','“Ada yang nanyain aku di luar nggak?”','“Tolong jangan lupain aku selama aku di sini.”','“Aku cuma pengen cepat selesaiin masa tahanan ini.”','“Bang, kalau ketemu teman-teman, bilang aku baik-baik aja.”',
    '“Tidur di sini nggak pernah benar-benar nyenyak.”','“Aku mulai bosan lihat wajah yang itu-itu aja.”','“Kalau punya cerita lucu dari luar, ceritain dong.”','“Aku bakal lebih hati-hati setelah keluar nanti.”','“Rasanya aneh lihat dunia luar cuma dari balik jeruji.”',
    '“Bang, jangan sering-sering bikin aku iri sama kehidupan luar 😭”','“Aku masih punya harapan buat mulai hidup lagi setelah bebas.”','“Makasih udah nyempetin waktu buat datang.”','“Jangan lupa datang lagi kalau ada kesempatan.”','“Semoga kunjungan berikutnya aku sudah nggak ada di sini.”'
]

const dialogVisitPengunjung = [
    '“Aku datang menjengukmu. Gimana keadaanmu di sini?”','“Ternyata benar-benar dikurung di sini, ya...”','“Aku cuma mau memastikan kamu masih baik-baik saja.”','“Sabar ya. Semoga masa tahanannya cepat selesai.”','“Aku bawa kabar dari luar. Kota masih ramai seperti biasa.”',
    '“Jangan terlalu dipikirkan. Anggap saja ini liburan yang salah tempat.”','“Aku penasaran, bagaimana rasanya menghabiskan waktu di sini?”','“Kalau butuh sesuatu, bilang saja selama masih bisa dibantu.”','“Aku sempat khawatir setelah dengar kamu masuk penjara.”','“Aku pamit dulu. Semoga kita ketemu lagi di luar jeruji.”',
    '“Sabar ya, ini ada uang buat jajan”','“Gimana ceritanya bisa masuk sini?”','“Tenang, lawyer udah gue urus”','“Jangan ngulangin lagi ya, malu”','“Mau nitip apa? Gue beliin”',
    '“Keluarga nungguin lu di luar”','“Udah tobat belum di dalem?”','“Ini selnya dingin banget sih”','“Kuat2 ya, bentar lagi juga keluar”','“Hati2 sama napi lain, jangan berantem”',
    '“Gue bawain makanan, siapa tahu lu lapar.”','“Ada yang mau gue sampaikan dari keluarga.”','“Lu jangan kepikiran yang aneh-aneh dulu.”','“Di luar semuanya masih aman, jadi lu tenang aja.”','“Gue usahain sering-sering nengok lu.”',
    '“Teman-teman lu pada nanyain kabar.”','“Kalau ada yang perlu dibantu, bilang aja.”','“Gue nggak nyangka akhirnya harus nengok lu di penjara.”','“Yang penting sekarang lu jaga diri baik-baik.”','“Nanti kalau udah keluar, jangan bikin masalah lagi.”',
    '“Gue bawain baju sekalian, siapa tahu yang lama udah nggak nyaman.”','“Lu masih kuat kan? Jangan sampai drop.”','“Ada kabar baik, semuanya masih nunggu lu pulang.”','“Jangan malu buat minta bantuan kalau memang perlu.”','“Gue lihat lu masih sehat, syukurlah.”',
    '“Kalau bosen, ngobrol aja sama orang yang ada di sini.”','“Gue cuma bisa bantu sebisanya dari luar.”','“Sabar sedikit lagi, semua ini pasti ada akhirnya.”','“Titip pesan apa buat keluarga?”','“Semoga kunjungan berikutnya kita ngobrolnya bukan di balik jeruji lagi.”'
]

/* =========================================================
   STORY KABUR 20 VARIASI - PELUANG 1%
========================================================= */

const storyKabur = [
    { sukses: `🪟 Kamu congkel jeruji pakai sendok semalaman. Pas sipir lengah, langsung loncat keluar!`, gagal: `🪟 Sendoknya patah ditengah jalan. Ketahuan sipir dan dihajar.` },
    { sukses: `🚽 Kamu kabur lewat saluran pembuangan. Becek, bau, tapi bebas!`, gagal: `🚽 Nyangkut di pipa. Malah disemprot air kotoran.` },
    { sukses: `🎭 Kamu tukar baju sama pengunjung. Jalan keluar santai sambil lambaikan tangan.`, gagal: `🎭 Sipir ngeh ada 2 orang kembaran. Langsung diborgol lagi.` },
    { sukses: `🍰 Kamu sembunyi di dalam kue ultah kiriman. Truk sampah buang kamu ke luar.`, gagal: `🍰 Kuenya kemakan duluan sama sipir rakus. Kamu ketahuan.` },
    { sukses: `💣 Kamu buat ledakan kecil dari bedak + korek. Pas rame, kamu kabur!`, gagal: `💣 Koreknya basah. Malah kamu yg kena ledakan.` },
    { sukses: `👨‍⚕️ Pura2 sakit jantung. Pas di RS penjara kamu kabur lewat jendela.`, gagal: `👨‍⚕️ Dokternya curiga. Kamu malah diikat di ranjang.` },
    { sukses: `📦 Kamu masukin diri ke kardus pengiriman makanan. Lolos!`, gagal: `📦 Kardusnya ketiban 10 kardus lain. Pingsan 3 jam.` },
    { sukses: `🕳️ Gali terowongan 2 minggu pakai sendok. Akhirnya tembus ke selokan!`, gagal: `🕳️ Nemu pipa air. 1 penjara banjir, kamu kena hukuman.` },
    { sukses: `🚁 Tiba2 ada heli nyelametin. Tali diturunin, kamu naik!`, gagal: `🚁 Helinya salah alamat. Malah nembak ke bawah.` },
    { sukses: `🔑 Duplikat kunci dari sabun. Pintu kebuka pelan2.`, gagal: `🔑 Sabunnya meleleh. Kunci patah di dalem.` },
    { sukses: `🧹 Nyamar jadi petugas kebersihan. Dorong gerobak keluar aja.`, gagal: `🧹 Ditanya ID. Pas dicek, fotonya beda.` },
    { sukses: `⚡ Matiin sekring. Pas gelap kamu panjat tembok.`, gagal: `⚡ Genset nyala 3 detik kemudian. Ketahuan.` },
    { sukses: `🐀 Ikutin tikus yg sering keluar masuk. Ternyata ada lubang.`, gagal: `🐀 Tikusnya balik lagi ke sel. Kamu kejebak.` },
    { sukses: `🚛 Sembunyi di kolong truk sampah. Dibuang ke TPA.`, gagal: `🚛 Kepergok di TPA. Ditangkap ulang.` },
    { sukses: `🎂 Suap sipir pake kue + uang. Dia pura2 tidur.`, gagal: `🎂 Sipirnya lapor. Kue + uang disita.` },
    { sukses: `📞 Hack telepon penjara. Buka pintu elektronik dari dalem.`, gagal: `📞 Malah nyambung ke kantor polisi.` },
    { sukses: `🧨 Ledakin tembok belakang pas jam olahraga rame2.`, gagal: `🧨 Sumbu nya basah. Ga nyala2.` },
    { sukses: `👔 Tukar identitas sama napi yg mau bebas besok.`, gagal: `👔 Sidik jarinya ga cocok. Ketahuan.` },
    { sukses: `🌧️ Pas hujan badai + mati lampu. Panjat tembok ga ada yg liat.`, gagal: `🌧️ Licin. Jatuh. Kaki patah.` },
    { sukses: `🤡 Tipu sipir baru yg masih magang. Bilang disuruh atasannya.`, gagal: `🤡 Ternyata dia intel. Langsung diborgol.` }
]

const storyBreakout = {
    sukses: [
        `🧱 Kalian merobohkan dinding tua bersama-sama dan menyelinap keluar sebelum sipir datang.`,
        `🚨 Alarm berbunyi saat pergantian jaga. Kalian memanfaatkan kekacauan untuk lolos bersama.`,
        `🪢 Dengan tali dari kain seprai, kalian turun melewati tembok dan berhasil mencapai luar.`,
        `🚚 Kalian bersembunyi di kendaraan pengangkut logistik dan lolos dari gerbang penjara.`,
        `🌧️ Hujan deras menutupi suara langkah kalian. Satu per satu berhasil melewati pagar penjara.`
    ],
    gagal: [
        `🔦 Sipir memergoki kalian di lorong. Rencana buyar dan semuanya tertangkap kembali.`,
        `🚪 Pintu darurat terkunci rapat. Alarm menyala sebelum kalian sempat menemukan jalan lain.`,
        `🪢 Tali kain yang kalian buat putus di tengah jalan. Sipir segera mengepung kalian.`,
        `🚧 Gerbang luar mendadak ditutup saat kalian hampir mencapainya. Kalian tertangkap di halaman.`,
        `📣 Salah satu penjaga mendengar keributan dan memanggil bantuan. Seluruh tim gagal kabur.`
    ]
}

/* =========================================================
   STORY ROUTINE 50 VARIASI
========================================================= */

const storyRoutine = [
    `📖 *Hari ini:* Bangun jam 5, sholat di pojokan sel. Makan roti keras + air putih. Siangnya nyapu 1 jam. Malam baca koran bekas sampe ketiduran.`,
    `📖 *Hari ini:* Ikut kerja bakti bersihin halaman penjara. Keringetan banget. Dapet bonus es teh. Tidur di kasur tipis sambil mikir keluarga.`,
    `📖 *Hari ini:* Bertengkar sama napi sebelah gara-gara rebutan sabun. Didamaikan sipir. Sorenya olahraga lari 3x keliling lapangan.`,
    `📖 *Hari ini:* Diajarin tukang kayu bikin kursi. Jari ketusuk paku. Tapi lumayan dapet skill baru.`,
    `📖 *Hari ini:* Kirim surat ke rumah. Nunggu 2 jam buat dapet giliran nelpon. Cuma 5 menit, tapi rasanya berharga banget.`,
    `📖 *Hari ini:* Ikut pengajian. Ustadnya ceramah tentang tobat. Banyak yang diam merenung, termasuk gue.`,
    `📖 *Hari ini:* Masak nasi buat 50 orang. Ketumpahan. Akhirnya disuruh cuci piring seharian.`,
    `📖 *Hari ini:* Sakit perut. Ke klinik, dikasih obat. Setelah itu cuma tiduran seharian di sel.`,
    `📖 *Hari ini:* Main catur sama napi seumur. Kalah 5x berturut-turut. Harga diri anjlok.`,
    `📖 *Hari ini:* Dapet kiriman dari rumah: baju, mie, dan beberapa makanan. Sebagian gue bagi ke teman satu sel.`,
    `📖 *Hari ini:* Disuruh cat tembok. Catnya kena muka. Teman-teman malah ketawa karena katanya mirip badut.`,
    `📖 *Hari ini:* Hujan deras, air masuk ke sel. Tidur sambil mindahin barang-barang biar nggak basah.`,
    `📖 *Hari ini:* Nonton TV bareng. Cuma ada sinetron. Ujung-ujungnya malah ribut rebutan remote.`,
    `📖 *Hari ini:* Dipanggil kepala penjara. Dikasih nasihat hampir satu jam. Panjang banget, tapi ada beberapa yang masuk akal.`,
    `📖 *Hari ini:* Ikut lomba kebersihan antar sel. Cuma juara 3, tapi dapet sabun tambahan.`,
    `📖 *Hari ini:* Mimpi kabur semalam. Begitu bangun, masih lihat jeruji. Cuma bisa narik napas panjang.`,
    `📖 *Hari ini:* Belajar baca tulis sama relawan. Dulu susah nulis nama sendiri, sekarang sudah mulai lancar.`,
    `📖 *Hari ini:* Berantem kecil di dapur. Piring pecah dan semua langsung kena omel sipir.`,
    `📖 *Hari ini:* Duduk di pojokan sambil ngitung hari. Rasanya angka di kalender jalan lebih lambat dari biasanya.`,
    `📖 *Hari ini:* Sepi banget. Akhirnya ngobrol sama tembok. Temboknya tentu aja diem.`,
    `📖 *Hari ini:* Dapet giliran bersihin kamar mandi. Bau banget, tapi setidaknya waktu jadi terasa lebih cepat.`,
    `📖 *Hari ini:* Pagi-pagi ikut senam. Niatnya cuma gerak sedikit, malah pegal seharian.`,
    `📖 *Hari ini:* Ada napi baru masuk. Semua orang penasaran sama ceritanya, tapi gue memilih diam.`,
    `📖 *Hari ini:* Dapet jatah buah. Pisangnya kecil banget, tapi tetap habis dalam hitungan detik.`,
    `📖 *Hari ini:* Bantu napi sebelah benerin sandal. Ternyata cuma putus talinya. Lumayan bisa merasa berguna.`,
    `📖 *Hari ini:* Seharian panas banget. Kipas cuma muter pelan, jadi lebih banyak duduk di dekat jendela.`,
    `📖 *Hari ini:* Denger suara kendaraan dari luar. Sebentar aja, tapi langsung bikin kangen suasana jalanan.`,
    `📖 *Hari ini:* Dapet kesempatan baca buku lama dari perpustakaan. Sampai lupa kalau sedang ada di penjara.`,
    `📖 *Hari ini:* Bantu masak makan siang. Kali ini nggak tumpah dan nggak gosong. Kemajuan besar.`,
    `📖 *Hari ini:* Ada yang ulang tahun di blok sebelah. Cuma dirayain sederhana, tapi semua ikut senang.`,
    `📖 *Hari ini:* Bangun kesiangan dan hampir kelewatan jadwal makan. Untung teman satu sel bangunin.`,
    `📖 *Hari ini:* Dikasih tugas lipat pakaian. Kelihatannya gampang, ternyata satu tumpuk penuh.`,
    `📖 *Hari ini:* Main kartu sampai sore. Nggak ada taruhan, cuma buat bunuh waktu.`,
    `📖 *Hari ini:* Denger kabar kalau salah satu teman sebentar lagi bebas. Ikut senang sekaligus iri sedikit.`,
    `📖 *Hari ini:* Dapat surat balasan dari rumah. Cuma beberapa kalimat, tapi gue baca berkali-kali.`,
    `📖 *Hari ini:* Ada pemeriksaan mendadak. Semua langsung buru-buru merapikan barang masing-masing.`,
    `📖 *Hari ini:* Belajar bikin kerajinan tangan dari kertas bekas. Hasilnya jelek, tapi lumayan buat mengisi waktu.`,
    `📖 *Hari ini:* Duduk di halaman saat matahari sore. Jarang banget bisa menikmati udara luar walau cuma sebentar.`,
    `📖 *Hari ini:* Salah ambil sandal punya orang. Baru sadar setelah dipakai jalan beberapa meter.`,
    `📖 *Hari ini:* Napi sebelah cerita tentang keluarganya sampai malam. Gue cuma dengerin dan sesekali ikut menanggapi.`,
    `📖 *Hari ini:* Bangun karena suara hujan. Untuk beberapa menit suasana terasa tenang banget.`,
    `📖 *Hari ini:* Dapet jatah tambahan nasi. Hari ini rasanya sedikit lebih beruntung.`,
    `📖 *Hari ini:* Bantu bersihin halaman setelah hujan. Lumpur di mana-mana, sepatu jadi berat.`,
    `📖 *Hari ini:* Ada pertandingan olahraga kecil. Gue ikut main dan pulang dengan badan pegal semua.`,
    `📖 *Hari ini:* Seharian kepikiran rumah. Nggak banyak aktivitas, cuma duduk dan menunggu waktu berjalan.`,
    `📖 *Hari ini:* Ketemu napi lama yang sudah hafal semua rutinitas di sini. Banyak cerita yang dia kasih.`,
    `📖 *Hari ini:* Dapat kesempatan telepon keluarga. Waktunya singkat, tapi cukup buat bikin hati sedikit tenang.`,
    `📖 *Hari ini:* Bantu merapikan rak buku. Nemunya beberapa buku lama yang ternyata masih menarik dibaca.`,
    `📖 *Hari ini:* Malam ini lebih tenang dari biasanya. Setelah semua kegiatan selesai, gue cuma rebahan sambil menatap langit-langit.`
]

/* =========================================================
   STORY TALK 50 VARIASI
========================================================= */

const storyTalk = [
    `💬 Kamu: 'Gimana cara cepet keluar?'\n👤 Napi A: 'Tunggu aja bang, waktunya pasti lewat. Sabar.'`,
    `💬 Kamu: 'Lu kasus apa?'\n👤 Napi B: 'Copet bang. Gue nyesel sekarang.'\n> Kamu: 'Semoga setelah keluar nggak diulang lagi.'`,
    `💬 Kamu: 'Bosen ga?'\n👤 Napi C: 'Bosen lah. Makanya gue bikin permainan sendiri dari barang bekas.'`,
    `💬 Kamu: 'Sipir galak ga?'\n👤 Napi D: 'Ada yang tegas, ada yang santai. Tergantung situasi.'`,
    `💬 Kamu: 'Pernah kepikiran kabur?'\n👤 Napi E: 'Pernah kepikiran. Tapi konsekuensinya lebih panjang.'`,
    `💬 Kamu: 'Makanan enak ga?'\n👤 Napi F: 'Lumayan kalau lagi lapar. Kalau dibanding masakan rumah, ya beda.'`,
    `💬 Kamu: 'Kangen rumah?'\n👤 Napi G: 'Banget. Apalagi kalau ingat keluarga.'`,
    `💬 Kamu: 'Ada wifi ga?'\n👤 Napi H: 'Nggak ada. Yang ada cuma koneksi sama sesama napi.'`,
    `💬 Kamu: 'Lu nyesel?'\n👤 Napi I: 'Nyesel. Kalau bisa muter waktu, gue pasti mikir dua kali.'`,
    `💬 Kamu: 'Gimana biar ga gila?'\n👤 Napi J: 'Ngobrol, olahraga, baca. Jangan diem terus.'`,
    `💬 Kamu: 'Ada yang serem di sini?'\n👤 Napi K: 'Yang paling serem itu kalau waktu terasa nggak jalan.'`,
    `💬 Kamu: 'Tidur nyenyak ga?'\n👤 Napi L: 'Kadang nyenyak, kadang kebangun karena suara dari luar.'`,
    `💬 Kamu: 'Kapan terakhir dijenguk?'\n👤 Napi M: 'Sudah lama. Keluarga jauh dan susah datang.'`,
    `💬 Kamu: 'Kerja apa di sini?'\n👤 Napi N: 'Bantu bersihin dan kadang kerja di dapur.'`,
    `💬 Kamu: 'Takut ga?'\n👤 Napi O: 'Awal-awal iya. Lama-lama belajar beradaptasi.'`,
    `💬 Kamu: 'Ada yang baik ga di sini?'\n👤 Napi P: 'Banyak. Cuma nggak semuanya gampang percaya sama orang baru.'`,
    `💬 Kamu: 'Rencana abis keluar?'\n👤 Napi Q: 'Cari kerja dan mulai hidup dari awal.'`,
    `💬 Kamu: 'Pernah berantem?'\n👤 Napi R: 'Pernah ribut kecil. Sekarang lebih pilih menghindar.'`,
    `💬 Kamu: 'Doain gue ya.'\n👤 Napi S: 'Aamiin. Semoga urusan lu juga cepat selesai.'`,
    `💬 Kamu: 'Ini penjara atau hotel?'\n👤 Napi T: 'Hotel bintang nol. Bedanya di sini checkout-nya nggak bisa sesuka hati.'`,
    `💬 Kamu: 'Lu udah berapa lama di sini?'\n👤 Napi U: 'Lumayan lama. Sampai hafal suara langkah sipir.'`,
    `💬 Kamu: 'Kalau malam biasanya ngapain?'\n👤 Napi V: 'Baca, ngobrol pelan, atau langsung tidur.'`,
    `💬 Kamu: 'Ada yang bisa bikin ketawa di sini?'\n👤 Napi W: 'Ada. Tinggal denger cerita orang-orang di blok ini.'`,
    `💬 Kamu: 'Lu masih sering kepikiran kejadian dulu?'\n👤 Napi X: 'Sering. Tapi sekarang lebih banyak mikirin apa yang harus gue lakukan setelah keluar.'`,
    `💬 Kamu: 'Kalau dapat kesempatan belajar, mau?'\n👤 Napi Y: 'Mau banget. Biar waktu di sini nggak sia-sia.'`,
    `💬 Kamu: 'Paling susah di sini apa?'\n👤 Napi Z: 'Nahan rindu sama orang rumah.'`,
    `💬 Kamu: 'Lu punya teman dekat di sini?'\n👤 Napi A: 'Ada beberapa. Kalau susah, biasanya saling bantu.'`,
    `💬 Kamu: 'Kalau lagi sedih biasanya ngapain?'\n👤 Napi B: 'Diam sebentar, terus cari teman buat ngobrol.'`,
    `💬 Kamu: 'Pernah dapat kiriman dari rumah?'\n👤 Napi C: 'Sering. Makanan sederhana pun rasanya beda kalau dari rumah.'`,
    `💬 Kamu: 'Apa yang paling lu kangenin?'\n👤 Napi D: 'Suasana pagi di rumah. Kedengarannya sepele, tapi gue kangen.'`,
    `💬 Kamu: 'Di sini ada olahraga?'\n👤 Napi E: 'Ada. Biasanya lari, senam, atau olahraga ringan.'`,
    `💬 Kamu: 'Lu masih punya cita-cita?'\n👤 Napi F: 'Masih. Penjara bukan berarti hidup berhenti selamanya.'`,
    `💬 Kamu: 'Kalau dikasih satu makanan dari luar, mau apa?'\n👤 Napi G: 'Masakan ibu. Apa aja, yang penting buatan rumah.'`,
    `💬 Kamu: 'Pernah nangis di sini?'\n👤 Napi H: 'Pernah. Nggak ada yang perlu malu soal itu.'`,
    `💬 Kamu: 'Lu punya buku favorit?'\n👤 Napi I: 'Ada satu novel lama. Udah gue baca sampai beberapa kali.'`,
    `💬 Kamu: 'Hal paling lucu yang pernah terjadi di sini apa?'\n👤 Napi J: 'Teman gue salah pakai sandal orang sampai setengah hari.'`,
    `💬 Kamu: 'Kalau waktu bisa dipercepat, mau?'\n👤 Napi K: 'Siapa yang nggak mau? Tapi tetap harus dijalani.'`,
    `💬 Kamu: 'Lu pernah bantu napi lain?'\n👤 Napi L: 'Pernah. Kadang hal kecil aja sudah cukup membantu.'`,
    `💬 Kamu: 'Kalau ada yang baru masuk, biasanya gimana?'\n👤 Napi M: 'Dikasih tahu aturan dan dibantu adaptasi.'`,
    `💬 Kamu: 'Apa yang paling berubah dari diri lu?'\n👤 Napi N: 'Gue jadi lebih menghargai waktu dan keluarga.'`,
    `💬 Kamu: 'Kalau keluar nanti mau langsung pulang?'\n👤 Napi O: 'Pasti. Rumah adalah tempat pertama yang mau gue datangi.'`,
    `💬 Kamu: 'Pernah dapat kabar baik dari luar?'\n👤 Napi P: 'Pernah. Kabar kecil aja bisa bikin satu hari terasa lebih ringan.'`,
    `💬 Kamu: 'Kalau lagi marah gimana?'\n👤 Napi Q: 'Biasanya gue diam dulu daripada bikin masalah baru.'`,
    `💬 Kamu: 'Ada yang ngajarin keterampilan di sini?'\n👤 Napi R: 'Ada. Gue pernah diajarin bikin kerajinan dari kayu.'`,
    `💬 Kamu: 'Lu masih sering ketawa?'\n👤 Napi S: 'Masih dong. Kalau berhenti ketawa, hari-hari di sini makin berat.'`,
    `💬 Kamu: 'Kalau dikasih kesempatan ngomong sama keluarga sekarang, mau bilang apa?'\n👤 Napi T: 'Gue baik-baik aja dan minta mereka jangan terlalu khawatir.'`,
    `💬 Kamu: 'Apa yang paling bikin lu kuat?'\n👤 Napi U: 'Pikiran kalau suatu hari nanti gue bakal keluar dan mulai lagi.'`,
    `💬 Kamu: 'Pernah merasa waktu nggak bergerak?'\n👤 Napi V: 'Sering. Tapi begitu ada kegiatan, tiba-tiba hari sudah malam.'`,
    `💬 Kamu: 'Kalau bisa kasih nasihat ke diri lu yang dulu, apa?'\n👤 Napi W: 'Jangan ambil keputusan saat emosi.'`,
    `💬 Kamu: 'Besok mau ngapain?'\n👤 Napi X: 'Sama seperti biasa. Bangun, makan, kerja, ngobrol, lalu tidur.'`,
    `💬 Kamu: 'Lu masih berharap semuanya bisa diperbaiki?'\n👤 Napi Y: 'Masih. Selama masih hidup, selalu ada kesempatan buat berubah.'`
]

const randomItem = (list) => list[Math.floor(Math.random() * list.length)]
const BREAKOUT_ROOM_TTL = 30 * 60 * 1000

function cleanupExpiredBreakouts(wdb, now = Date.now()) {
    let removed = false
    wdb.prisonBreakouts = wdb.prisonBreakouts || {}
    for (const [chat, room] of Object.entries(wdb.prisonBreakouts)) {
        if (now - Number(room.createdAt || 0) < BREAKOUT_ROOM_TTL) continue
        delete wdb.prisonBreakouts[chat]
        removed = true
    }
    return removed
}

const breakoutCleanupTimer = setInterval(() => {
    const wdb = loadDB()
    if (cleanupExpiredBreakouts(wdb)) void saveDB(wdb)
}, 60 * 1000)
breakoutCleanupTimer.unref?.()

const formatTime = (ms) => {
    ms = Math.max(0, ms)
    const jam = Math.floor(ms / 3600000)
    const menit = Math.floor((ms % 3600000) / 60000)
    const detik = Math.floor((ms % 60000) / 1000)
    if(jam > 0) return `${jam}j ${menit}m`
    if(menit > 0) return `${menit}m ${detik}d`
    return `${detik}d`
}

let handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {

    const wdb = loadDB()
    if (!wdb.penjara) wdb.penjara = []
    if (!wdb.money) wdb.money = {}
    if (!wdb.visitCooldown) wdb.visitCooldown = {}
    if (!wdb.kaburCooldown) wdb.kaburCooldown = {}
    if (!wdb.routineCooldown) wdb.routineCooldown = wdb.dailyCooldown || {}
    if (!wdb.talkCooldown) wdb.talkCooldown = {}
    if (!wdb.prisonStats) wdb.prisonStats = {}
    if (!wdb.prisonVisits) wdb.prisonVisits = {}
    if (!wdb.prisonBreakouts) wdb.prisonBreakouts = {}
    if (!wdb.breakoutCooldown) wdb.breakoutCooldown = {}
    if (cleanupExpiredBreakouts(wdb)) saveDB(wdb)

    if (!global.db?.data?.users) return m.reply('❌ Database utama belum siap')

    /* =====================================================
       HELPER
    ===================================================== */

    const resolveJid = (jid) => {
        if (!jid) return null
        jid = String(jid)
        if (jid.endsWith('@s.whatsapp.net')) return jid
        if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
        if (/^\d+$/.test(jid)) return jid + '@s.whatsapp.net'
        return jid
    }
    const getUser = (jid) => { jid = resolveJid(jid); if (!jid) return null; return global.db.data.users?.[jid] || null }
    const getRPG = (jid) => { const user = getUser(jid); if (!user) return null; return user.rpg || null }
    const getTarget = (raw) => { let jid = m.mentionedJid?.[0] || m.quoted?.sender; if (!jid && raw) { let num = String(raw).replace(/[^0-9]/g, ''); if (num.startsWith('08')) num = '62' + num.slice(1); if (num.length >= 8) jid = num + '@s.whatsapp.net' } return resolveJid(jid) }
    const kasus = (rpg) => rpg?.kasus || ((Number(rpg?.tebusan) || 0) === 1000000 ? '🤏 Copet' : (Number(rpg?.tebusan) || 0) === 2000000 ? '🏴‍☠️ Begal / 🔪 Bunuh' : (Number(rpg?.tebusan) || 0) === 4000000 ? '🕵️ Rampok' : '👑 Owner Jail')
    const sisaWaktu = (rpg) => { if (!rpg) return 0; return Number(rpg.lamaPenjara || 0) - (Date.now() - Number(rpg.penjara || 0)) }
    const sisaTungguTebus = (rpg) => Math.max(0, 5 * 60 * 1000 - (Date.now() - Number(rpg?.penjara || 0)))
    const formatSisa = (ms) => { ms = Math.max(0, ms); const jam = Math.floor(ms / 3600000); const menit = Math.floor((ms % 3600000) / 60000); return `${jam}j ${menit}m` }
    const isDiPenjara = (jid) => { jid = resolveJid(jid); return wdb.penjara.some(x => resolveJid(x) === jid) }
    const findPrisonerByCell = (value) => {
        const requested = String(value || '').toUpperCase()
        const prisoner = wdb.penjara.find(jid => String(getRPG(resolveJid(jid))?.sel || '').toUpperCase() === requested)
        if (prisoner) return resolveJid(prisoner)
        if (/^\d+$/.test(requested)) return resolveJid(wdb.penjara[Number(requested) - 1])
        return null
    }
    const removeFromBreakouts = (jid) => {
        jid = resolveJid(jid)
        let changed = false
        for (const [chat, room] of Object.entries(wdb.prisonBreakouts)) {
            const players = Array.isArray(room.players) ? room.players : []
            const remaining = players.filter(player => resolveJid(player) !== jid)
            if (remaining.length === players.length) continue
            changed = true
            if (!remaining.length) {
                delete wdb.prisonBreakouts[chat]
                continue
            }
            room.players = remaining
            if (resolveJid(room.creator) === jid) room.creator = remaining[0]
        }
        return changed
    }
    const removeFromPrison = (jid) => {
        jid = resolveJid(jid)
        for (let i = wdb.penjara.length - 1; i >= 0; i--) {
            if (resolveJid(wdb.penjara[i]) === jid) wdb.penjara.splice(i, 1)
        }
        removeFromBreakouts(jid)
    }
    const getStats = (jid) => {
        jid = resolveJid(jid)
        if (!wdb.prisonStats[jid]) wdb.prisonStats[jid] = {routine: 0, talk: 0}
        if (wdb.prisonStats[jid].routine === undefined) {
            wdb.prisonStats[jid].routine = Number(wdb.prisonStats[jid].daily) || 0
            delete wdb.prisonStats[jid].daily
        }
        if (wdb.prisonStats[jid].escapeCount === undefined) wdb.prisonStats[jid].escapeCount = wdb.prisonStats[jid].escaped ? 1 : 0
        return wdb.prisonStats[jid]
    }
    const getPrisonTitle = (stats) => {
        const progress = (Number(stats?.routine) || 0) + (Number(stats?.talk) || 0)
        if (progress >= 200) return '👑 RAJA PENJARA'
        if (progress >= 100) return '🏆 LEGENDA JERUJI'
        if (progress >= 50) return '⚔️ VETERAN PENJARA'
        if (progress >= 25) return '🔥 NAPI TERLATIH'
        if (progress >= 10) return '🛡️ NAPI PEMULA'
        return '🔒 TAHANAN BARU'
    }

    const breakoutAction = command === 'penjara' && args[0]?.toLowerCase() === 'breakout'
    if (breakoutAction) {
        const action = args[1]?.toLowerCase()
        const room = wdb.prisonBreakouts[m.chat]
        const mentionName = jid => `@${resolveJid(jid).split('@')[0]}`

        if (action === 'create') {
            if (room) return m.reply(`❌ Room breakout sudah ada. Gunakan *${usedPrefix}penjara breakout info*.`)
            if (!isDiPenjara(m.sender)) return m.reply('❌ Hanya tahanan yang bisa membuat room breakout.')
            wdb.prisonBreakouts[m.chat] = { creator: resolveJid(m.sender), players: [resolveJid(m.sender)], createdAt: Date.now() }
            saveDB(wdb)
            return conn.reply(m.chat, `🚨 *ROOM BREAKOUT DIBUAT*\n\n${mentionName(m.sender)} otomatis bergabung. Tahanan lain bisa ikut dengan *${usedPrefix}penjara breakout join*.\n\nRoom akan otomatis dihapus jika tidak dimulai dalam 30 menit.\n\nLihat peserta: *${usedPrefix}penjara breakout info*\nMulai: *${usedPrefix}penjara breakout start*`, m, { mentions: [m.sender] })
        }

        if (action === 'guide') {
            return m.reply(
                `📖 *PANDUAN PENJARA BREAKOUT*\n\n` +
                `1. Tahanan membuat room: *${usedPrefix}penjara breakout create*\n` +
                `2. Tahanan lain bergabung: *${usedPrefix}penjara breakout join*\n` +
                `3. Cek peserta: *${usedPrefix}penjara breakout info*\n` +
                `4. Keluar dari room: *${usedPrefix}penjara breakout leave*\n` +
                `5. Pembuat room memulai: *${usedPrefix}penjara breakout start*\n\n` +
                `Minimal 2 tahanan untuk mulai. Room dihapus otomatis jika tidak dimulai dalam 30 menit. Jika gagal, semua peserta mendapat tambahan masa tahanan 2 jam.`
            )
        }

        if (action === 'join') {
            if (!room) return m.reply(`❌ Belum ada room. Buat dengan *${usedPrefix}penjara breakout create*.`)
            if (!isDiPenjara(m.sender)) return m.reply('❌ Hanya tahanan yang bisa bergabung ke breakout.')
            const jid = resolveJid(m.sender)
            if (room.players.some(player => resolveJid(player) === jid)) return m.reply('Kamu sudah bergabung di room breakout ini.')
            room.players.push(jid)
            saveDB(wdb)
            return conn.reply(m.chat, `✅ ${mentionName(jid)} bergabung ke breakout. Total peserta: *${room.players.length}*.`, m, { mentions: [jid] })
        }

        if (action === 'info') {
            if (!room) return m.reply(`❌ Belum ada room. Buat dengan *${usedPrefix}penjara breakout create*.`)
            const mentions = room.players.map(resolveJid)
            const players = mentions.map((jid, index) => `> ${index + 1}. ${mentionName(jid)}${jid === resolveJid(room.creator) ? ' (pembuat)' : ''}`).join('\n')
            return conn.reply(m.chat, `🚨 *INFO ROOM BREAKOUT*\nPembuat: ${mentionName(room.creator)}\nPeserta (${mentions.length}):\n${players}\n\nGunakan *${usedPrefix}penjara breakout leave* untuk keluar.`, m, { mentions })
        }

        if (action === 'leave') {
            if (!room) return m.reply('❌ Belum ada room breakout.')
            const jid = resolveJid(m.sender)
            const index = room.players.findIndex(player => resolveJid(player) === jid)
            if (index < 0) return m.reply('❌ Kamu tidak bergabung di room ini.')
            room.players.splice(index, 1)
            if (!room.players.length) {
                delete wdb.prisonBreakouts[m.chat]
            } else if (resolveJid(room.creator) === jid) {
                room.creator = room.players[0]
            }
            saveDB(wdb)
            return m.reply(room.players.length ? `✅ Kamu keluar dari room breakout. Pembuat room: ${mentionName(room.creator)}.` : '✅ Kamu keluar. Room breakout dibubarkan karena tidak ada peserta.')
        }

        if (action === 'start') {
            if (!room) return m.reply(`❌ Belum ada room. Buat dengan *${usedPrefix}penjara breakout create*.`)
            if (resolveJid(room.creator) !== resolveJid(m.sender)) return m.reply('❌ Hanya pembuat room yang bisa memulai breakout.')
            if (room.players.length < 2) return m.reply('❌ Breakout membutuhkan minimal 2 tahanan.')

            const now = Date.now()
            const cooldown = room.players.map(resolveJid).find(jid => now - (Number(wdb.breakoutCooldown[jid]) || 0) < 30 * 60 * 1000)
            if (cooldown) return m.reply(`⏳ ${mentionName(cooldown)} masih cooldown breakout selama *${formatTime(30 * 60 * 1000 - (now - Number(wdb.breakoutCooldown[cooldown] || 0)))}*.`)

            const players = room.players.map(resolveJid).filter((jid, index, list) => jid && list.indexOf(jid) === index)
            const invalid = players.filter(jid => !isDiPenjara(jid) || !getRPG(jid))
            if (invalid.length) return conn.reply(m.chat, `❌ Peserta berikut sudah tidak berada di penjara: ${invalid.map(mentionName).join(', ')}. Mereka harus leave sebelum breakout dimulai.`, m, { mentions: invalid })

            const chance = 0.5
            const success = Math.random() < chance
            const story = randomItem(storyBreakout[success ? 'sukses' : 'gagal'])
            const mentions = players
            const names = players.map(mentionName).join(', ')

            for (const jid of players) wdb.breakoutCooldown[jid] = now
            delete wdb.prisonBreakouts[m.chat]
            if (success) {
                for (const jid of players) {
                    const rpg = getRPG(jid)
                    rpg.penjara = null
                    rpg.lamaPenjara = 0
                    rpg.tebusan = 0
                    rpg.sel = 0
                    rpg.gagalCopet = 0
                    const stats = getStats(jid)
                    stats.escaped = true
                    stats.escapeCount = Number(stats.escapeCount) + 1
                    removeFromPrison(jid)
                }
                saveDB(wdb)
                return conn.reply(m.chat, `🚨 *BREAKOUT BERHASIL!*\n\n${story}\n\nSemua peserta berhasil kabur: ${names}`, m, { mentions })
            }

            for (const jid of players) getRPG(jid).lamaPenjara += 2 * 60 * 60 * 1000
            saveDB(wdb)
            return conn.reply(m.chat, `🚨 *BREAKOUT GAGAL*\n\n${story}\n\nSemua peserta mendapat tambahan hukuman 2 jam: ${names}`, m, { mentions })
        }

        return m.reply(`📌 Command breakout: *${usedPrefix}penjara breakout create/join/info/leave/start*\nPanduan: *${usedPrefix}penjara guide*`)
    }

    if (command === 'penjara' && ['guide', 'note'].includes(args[0]?.toLowerCase())) {
        return m.reply(
            `📖 *PANDUAN PENJARA*\n\n` +
            `• Cek status dan progres: *${usedPrefix}penjara info*\n` +
            `• Lihat daftar tahanan: *${usedPrefix}penjara list* atau *${usedPrefix}penjara sel <blok>*\n` +
            `• Lihat cooldown semua tahanan: *${usedPrefix}penjara cd*\n` +
            `• Lihat catatan kabur berhasil: *${usedPrefix}penjara escord*\n` +
            `• Tahanan mengisi progres lewat *${usedPrefix}penjara routine* dan *${usedPrefix}penjara talk*; masing-masing punya cooldown.\n` +
            `• Coba kabur sendiri: *${usedPrefix}penjara kabur*. Kegagalan menambah hukuman 30 menit.\n` +
            `• Breakout bersama: pembuat room gunakan *${usedPrefix}penjara breakout create*, tahanan lain *join*, lalu pembuat *start*. Gunakan *info* dan *leave* untuk mengelola room.\n` +
            `• Kunjungi tahanan: *${usedPrefix}penjara visit sel <kode>*\n` +
            `• Tebus tahanan: *${usedPrefix}tebus sel <kode>* atau *${usedPrefix}tebus all*.`
        )
    }

    if (command === 'penjara' && args[0]?.toLowerCase() === 'command') {
        return m.reply(
            `📌 *COMMAND PENJARA*\n` +
            `• ${usedPrefix}penjara\n` +
            `• ${usedPrefix}penjara info\n` +
            `• ${usedPrefix}penjara sel <blok>\n` +
            `• ${usedPrefix}penjara list\n` +
            `• ${usedPrefix}penjara cd\n` +
            `• ${usedPrefix}penjara escord\n` +
            `• ${usedPrefix}penjara routine\n` +
            `• ${usedPrefix}penjara talk\n` +
            `• ${usedPrefix}penjara kabur\n` +
            `• ${usedPrefix}penjara visit <sel/tag>\n` +
            `• ${usedPrefix}penjara breakout <create/join/info/leave/start>\n` +
            `• ${usedPrefix}penjara note\n` +
            `• ${usedPrefix}penjara guide\n` +
            `• ${usedPrefix}tebus <sel/tag/all>`
        )
    }

    /* =====================================================
       REBUILD LIST PENJARA DARI DATA USER
    ===================================================== */

    let rebuild = false
    for(let jid in global.db.data.users){
        let rpg = global.db.data.users[jid].rpg
        if(rpg?.penjara && Number(rpg.lamaPenjara) > 0){
            let sisa = Number(rpg.lamaPenjara) - (Date.now() - Number(rpg.penjara))
            if(sisa > 0){
                if(!wdb.penjara.some(x => resolveJid(x) === resolveJid(jid))){
                    wdb.penjara.push(jid)
                    rebuild = true
                }
            }
        }
    }
    if(rebuild) saveDB(wdb)

    /* =====================================================
       BERSIHKAN PENJARA + AUTO BEBAS + URUTIN SEL
    ===================================================== */

    let changed = false
    let valid = []
    let seenPrisoners = new Set()
    for (let i = wdb.penjara.length - 1; i >= 0; i--) {
        const jid = resolveJid(wdb.penjara[i])
        if (!jid || seenPrisoners.has(jid)) { changed = true; continue }
        seenPrisoners.add(jid)
        const rpg = getRPG(jid)
        if (!rpg ||!rpg.penjara) {
            if (removeFromBreakouts(jid)) changed = true
            wdb.penjara.splice(i, 1); changed = true; continue
        }
        if (sisaWaktu(rpg) <= 0) {
            rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0
            if (removeFromBreakouts(jid)) changed = true
            wdb.penjara.splice(i, 1); changed = true
        } else { valid.unshift(jid) }
    }
    wdb.penjara = valid
    wdb.penjara.forEach((jid) => {
        let rpg = getRPG(jid)
        if (rpg) {
            const previousCell = rpg.sel
            ensurePrisonCell(wdb, jid)
            if (rpg.sel !== previousCell) changed = true
        }
    })
    if (changed) saveDB(wdb)

    if (command === 'penjara' && args[0]?.toLowerCase() === 'cd') {
        const now = Date.now()
        const activePrisoners = wdb.penjara
            .map(jid => resolveJid(jid))
            .filter((jid, index, list) => jid && list.indexOf(jid) === index)
            .map(jid => ({ jid, rpg: getRPG(jid) }))
            .filter(({ rpg }) => rpg?.penjara && sisaWaktu(rpg) > 0)

        if (!activePrisoners.length) return m.reply('🏛️ Tidak ada tahanan yang sedang aktif.')

        const cooldownRemaining = (map, jid, duration) => Math.max(0, duration - (now - (Number(map[jid]) || 0)))
        const mentions = activePrisoners.map(({ jid }) => jid)
        const list = activePrisoners.map(({ jid, rpg }, index) => {
            const routine = cooldownRemaining(wdb.routineCooldown, jid, scaleDifficultyCooldown(rpg, 2 * 60 * 1000))
            const talk = cooldownRemaining(wdb.talkCooldown, jid, scaleDifficultyCooldown(rpg, 2 * 60 * 1000))
            const escape = cooldownRemaining(wdb.kaburCooldown, jid, scaleDifficultyCooldown(rpg, 5 * 60 * 1000))
            const visit = cooldownRemaining(wdb.visitCooldown, jid, scaleDifficultyCooldown(rpg, 5 * 60 * 1000))
            const breakout = cooldownRemaining(wdb.breakoutCooldown, jid, 30 * 60 * 1000)
            return `> ${index + 1}. SEL ${rpg.sel || '-'}\n` +
                `>    Routine: ${routine ? formatTime(routine) : 'Siap'} • Talk: ${talk ? formatTime(talk) : 'Siap'}\n` +
                `>    Kabur: ${escape ? formatTime(escape) : 'Siap'} • Kunjungan: ${visit ? formatTime(visit) : 'Siap'}\n` +
                `>    Breakout: ${breakout ? formatTime(breakout) : 'Siap'}\n` +
                `>    @${jid.split('@')[0]}`
        }).join('\n\n')

        return conn.reply(m.chat, `╭─❏「 ⏳ COOLDOWN TAHANAN 」❏\n│ Total: ${activePrisoners.length} tahanan\n╰─━━━━━━━━━━━━━━─\n\n${list}`, m, { mentions })
    }

    if (command === 'penjara' && args[0]?.toLowerCase() === 'escord') {
        const records = Object.entries(wdb.prisonStats)
            .map(([jid, stats]) => ({ jid: resolveJid(jid), count: Number(stats?.escapeCount) || (stats?.escaped ? 1 : 0) }))
            .filter(({ jid, count }) => jid && count > 0)
            .sort((a, b) => b.count - a.count)

        if (!records.length) return m.reply('📭 Belum ada catatan tahanan yang berhasil kabur.')

        const mentions = records.map(({ jid }) => jid)
        const list = records.map(({ jid, count }, index) => `> ${index + 1}. ${count}x berhasil kabur\n> @${jid.split('@')[0]}`).join('\n')
        return conn.reply(m.chat, `╭─❏「 🚨 ESCAPE RECORD 」❏\n│ Total: ${records.length} orang\n╰─━━━━━━━━━━━━━━─\n\n${list}`, m, { mentions })
    }

    /* =====================================================
       BLOKIR COMMAND BUAT YG DIPENJARA
       CUMA BOLEH: penjara, penjara kabur
    ===================================================== */

    if (isDiPenjara(m.sender) && command!== 'penjara') {
        let rpg = getRPG(m.sender)
        let stats = getStats(m.sender)
        let sisa = formatSisa(sisaWaktu(rpg))
        return m.reply(`[ 🚔 ]───[ *_DI PENJARA_* ]───✦\n\nKamu di SEL ${rpg.sel}\n🏷️ Title: ${getPrisonTitle(stats)}\n⏳ Sisa: ${sisa}\n\nCommand:\n•${usedPrefix}penjara\n•${usedPrefix}penjara info\n•${usedPrefix}penjara routine\n•${usedPrefix}penjara talk\n•${usedPrefix}penjara kabur`)
    }

if (command === 'penjara' && args[0]?.toLowerCase() === 'info') {
    const target = resolveJid(m.mentionedJid?.[0] || m.quoted?.sender || (args[1] ? getTarget(args[1]) : m.sender))
    if (!target) return m.reply(
        `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
        `│ ❌ *Format perintah tidak valid.*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *CONTOH*\n` +
        `> ↳ ${usedPrefix}penjara info\n` +
        `> ↳ ${usedPrefix}penjara info @tag/reply\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    const stats = wdb.prisonStats[target] || { routine: 0, talk: 0 }
    const rpg = getRPG(target)
    const visits = Array.isArray(wdb.prisonVisits[target]) ? wdb.prisonVisits[target] : []
    const recentVisits = visits.slice(-10).reverse()
    const mentions = [target, ...recentVisits.map(entry => resolveJid(entry.visitor)).filter(Boolean)]
    const visitText = recentVisits.length
        ? recentVisits.map((entry, index) => `> ↳ ${index + 1}. @${resolveJid(entry.visitor).split('@')[0]} — ${new Date(entry.at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`).join('\n')
        : `> ↳ Belum ada yang mengunjungi.`

    const prisonStatus = rpg?.penjara && sisaWaktu(rpg) > 0
        ? `Di penjara • SEL ${rpg.sel} • Sisa ${formatSisa(sisaWaktu(rpg))}`
        : 'Tidak sedang dipenjara'

    return conn.reply(
        m.chat,
        `╭─❏「 🚔 INFO PENJARA 」❏\n` +
        `│ 👤 *@${target.split('@')[0]}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +

        `📋 *INFORMASI PENJARA*\n` +
        `> ↳ 🏷️ Title : ${getPrisonTitle(stats)}\n` +
        `> ↳ 📖 Routine : ${Number(stats.routine) || 0}x\n` +
        `> ↳ 💬 Talk : ${Number(stats.talk) || 0}x\n` +
        `> ↳ 🚪 Status : ${prisonStatus}\n\n` +

        `👥 *RIWAYAT KUNJUNGAN* (${visits.length})\n` +
        `${visitText}\n\n` +

        `─━━━━━━━━━━━━━━─`,
        m,
        { mentions: [...new Set(mentions)] }
    )
}

   if (command === 'penjara' && args[0]?.toLowerCase() === 'routine') {
    if (!isDiPenjara(m.sender)) return m.reply('❌ Kamu tidak di penjara.')
    let last = Number(wdb.routineCooldown[m.sender]) || 0
    let now = Date.now()
    let CD = scaleDifficultyCooldown(getRPG(m.sender), 2 * 60 * 1000)
    if (now - last < CD) return m.reply(`⏳ Tunggu *${formatTime(CD - (now - last))}* buat routine lagi`)

    wdb.routineCooldown[m.sender] = now
    let stats = getStats(m.sender)
    stats.routine = Number(stats.routine) + (stats.escaped ? 2 : 1)
    saveDB(wdb)

    let story = randomItem(storyRoutine)

    return m.reply(
`[ 📖 ]───[ *_ROUTINE PENJARA_* ]───✦

> ${story}

╭──「 STAT 」─✦
│ 🏷️ Title: ${getPrisonTitle(stats)}
│ 𖥔 Routine: ${stats.routine}x
│ 𖥔 Talk: ${stats.talk}x
╰─━━━━━━━━━━━━━━─`
    )
}


/* =====================================================
   PENJARA TALK - CD 2 MENIT
   ===================================================== */

if (command === 'penjara' && args[0]?.toLowerCase() === 'talk') {
    if (!isDiPenjara(m.sender)) return m.reply('❌ Kamu tidak di penjara.')
    let last = Number(wdb.talkCooldown[m.sender]) || 0
    let now = Date.now()
    let CD = scaleDifficultyCooldown(getRPG(m.sender), 2 * 60 * 1000)
    if (now - last < CD) return m.reply(`⏳ Tunggu *${formatTime(CD - (now - last))}* buat ngobrol lagi`)

    wdb.talkCooldown[m.sender] = now
    let stats = getStats(m.sender)
    stats.talk = Number(stats.talk) + (stats.escaped ? 2 : 1)
    saveDB(wdb)

    let story = randomItem(storyTalk).replace(/\n/g, '\n> ')

    return m.reply(
`[ 💬 ]───[ *_NGOBROL DI PENJARA_* ]───✦

> ${story}

╭──「 STAT 」─✦
│ 🏷️ Title: ${getPrisonTitle(stats)}
│ 𖥔 Routine: ${stats.routine}x
│ 𖥔 Talk: ${stats.talk}x
╰─━━━━━━━━━━━━━━─`
    )
}

    /* =====================================================
       KABUR DARI PENJARA -.penjara kabur
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'kabur') {
        if (!isDiPenjara(m.sender)) return m.reply('❌ Kamu tidak di penjara.')
        let last = Number(wdb.kaburCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = scaleDifficultyCooldown(getRPG(m.sender), 5 * 60 * 1000)
        if (now - last < CD) return m.reply(`⏳ *COOLDOWN KABUR*\n\nTunggu *${formatTime(CD - (now - last))}* lagi`)
        wdb.kaburCooldown[m.sender] = now

        let stats = getStats(m.sender)
        let peluang = 0.01
        const routine = Number(stats.routine) || 0
        const talk = Number(stats.talk) || 0
        const guaranteedEscape = routine >= 25 && talk >= 25 && !stats.guaranteedEscapeUsed
        if (isOwner) {
            peluang = 0.9
        } else if (guaranteedEscape) {
            peluang = 1
            stats.guaranteedEscapeUsed = true
        } else if (routine >= 100 && talk >= 100) {
            peluang = 1
        } else if (routine >= 50 && talk >= 50) {
            peluang = 0.5
        } else if (Number(stats.routine) >= 20 && Number(stats.talk) >= 20) {
            peluang = 0.1
        }

        saveDB(wdb)
        let story = randomItem(storyKabur)
        let berhasil = Math.random() < peluang
        let rpg = getRPG(m.sender)
        let selLama = rpg.sel

        if (berhasil) {
            rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0
            stats.escaped = true
            stats.escapeCount = Number(stats.escapeCount) + 1
            removeFromPrison(m.sender)
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚨 ]───[ *_KABUR BERHASIL_* ]───✦\n\n${story.sukses}\n\n╭──「 🎉 BEBAS 」─✦\n│ 𖥔 Nama : @${m.sender.split('@')[0]}\n│ 𖥔 Dari : SEL ${selLama}\n╰ 𖥔 Selamat! Kamu buronan sekarang.`, m, { mentions: [m.sender] })
        } else {
            rpg.lamaPenjara += 30 * 60 * 1000
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚨 ]───[ *_KABUR GAGAL_* ]───✦\n\n${story.gagal}\n\n╭──「 💥 GAGAL 」─✦\n│ 𖥔 Nama : @${m.sender.split('@')[0]}\n│ 𖥔 SEL : ${selLama}\n╰ 𖥔 Hukuman +30 menit!`, m, { mentions: [m.sender] })
        }
    }

    /* =====================================================
       PENJARA - VISIT
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'visit') {
        let last = Number(wdb.visitCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = scaleDifficultyCooldown(getRPG(m.sender), 5 * 60 * 1000)
        if (now - last < CD) return m.reply(`⏳ *COOLDOWN KUNJUNGAN*\n\nTunggu *${formatTime(CD - (now - last))}* lagi`)
        let who = null
        if (args[1]?.toLowerCase() === 'sel' && args[2]) {
            who = findPrisonerByCell(args[2]); if (!who) return m.reply(`❌ Sel ${args[2].toUpperCase()} kosong`)
        } else if (/^[A-Z]+[1-9]$/i.test(args[1] || '')) {
            who = findPrisonerByCell(args[1]); if (!who) return m.reply(`❌ Sel ${args[1].toUpperCase()} kosong`)
        } else if (args[1] && /^\d+$/.test(args[1])) {
            who = findPrisonerByCell(args[1]); if (!who) return m.reply(`❌ Sel ${args[1]} kosong`)
        } else { who = getTarget(args[1]); if (!who) return m.reply(`[ 🚔 ]───[ *_KUNJUNGAN PENJARA_* ]───✦\n\nFormat:\n${usedPrefix}penjara visit @tag\n${usedPrefix}penjara visit 2`) }
        if (who === resolveJid(m.sender)) return m.reply('❌ Kamu tidak bisa mengunjungi dirimu sendiri.')
        let index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)
        if (index === -1) return m.reply('❌ Orang tersebut tidak di penjara.')
        const rpg = getRPG(who)
        if (!rpg ||!rpg.penjara) { wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); removeFromBreakouts(who); saveDB(wdb); return m.reply('❌ Data tahanan tidak valid.') }
        if (sisaWaktu(rpg) <= 0) { const selLama = rpg.sel || index + 1; rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); removeFromBreakouts(who); saveDB(wdb); return m.reply(`🚔 @${who.split('@')[0]} sudah bebas.\n\n╭ 𖥔 SEL : ${selLama}\n╰ 𖥔 Masa tahanan telah habis`, { mentions: [who] }) }
            if (sisaWaktu(rpg) <= 0) { const selLama = rpg.sel || index + 1; rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); removeFromBreakouts(who); saveDB(wdb); return m.reply(`🚔 @${who.split('@')[0]} sudah bebas.\n\n╭ 𖥔 SEL : ${selLama}\n╰ 𖥔 Masa tahanan telah habis`, { mentions: [who] }) }
        wdb.visitCooldown[m.sender] = now
        wdb.prisonVisits[who] = Array.isArray(wdb.prisonVisits[who]) ? wdb.prisonVisits[who] : []
        wdb.prisonVisits[who].push({ visitor: resolveJid(m.sender), at: now })
        if (wdb.prisonVisits[who].length > 50) wdb.prisonVisits[who].splice(0, wdb.prisonVisits[who].length - 50)
        saveDB(wdb)
        const sisa = sisaWaktu(rpg); const tebusan = Number(rpg.tebusan) || 0
        let cap = `[ 🚔 ]───[ *_RUANG KUNJUNGAN_* ]───✦\n╭──[ SEL ${rpg.sel || index + 1} ]──✦\n│ 𖥔 Nama : @${who.split('@')[0]}\n│ 𖥔 Sisa : ${formatSisa(sisa)}\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰───────────\n\n*─── PERCAKAPAN ───*\n> 👤 Kamu : "${randomItem(dialogVisitPengunjung)}"\n> 🚓 Tahanan : "${randomItem(dialogVisitNapi)}"\n\n╭──「 *INFO* 」─✦\n│ 𖥔 CD Kunjung: 5 menit\n│ 𖥔 ${usedPrefix}penjara routine / talk / kabur`
        return conn.reply(m.chat, cap, m, { mentions: [m.sender, who] })
    }

    /* =====================================================
       OWNER - PENJARAIN
    ===================================================== */

    if (command === 'penjarain') {
        if (!isOwner) return m.reply('❌ Khusus Owner')
        let who, menit, tebusan
        if (m.quoted || m.mentionedJid?.[0]) { who = getTarget(); menit = parseInt(args[0]); tebusan = parseInt(args[1]) }
        else { who = getTarget(args[0]); menit = parseInt(args[1]); tebusan = parseInt(args[2]) }
        if (!who) return m.reply(`*Format:*\n${usedPrefix}penjarain @tag <menit> <tebusan>`)
        if (isNaN(menit) || menit < 1) menit = 30
        if (isNaN(tebusan) || tebusan < 0) tebusan = 1000000
        let user = getUser(who); if (!user) return m.reply('❌ Data user target tidak ditemukan'); if (!user.rpg) user.rpg = {}
        let rpg = user.rpg
        if (rpg.penjara && sisaWaktu(rpg) > 0) return m.reply(`❌ Orang ini sudah di penjara.\n\n🚔 SEL : ${rpg.sel || 0}\n⏳ SISA : ${formatSisa(sisaWaktu(rpg))}`)
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
        wdb.penjara.push(who)
        rpg.penjara = Date.now(); rpg.lamaPenjara = menit * 60000; rpg.tebusan = tebusan; rpg.kasus = '👑 Owner Jail'; rpg.sel = getRandomPrisonCell(wdb, who); rpg.gagalCopet = 0
        saveDB(wdb)
        return conn.reply(m.chat, `[ 🚔 ]───[ *_OWNER JAIL_* ]───✦\n╭ 𖥔 Target : @${who.split('@')[0]}\n│ 𖥔 SEL : ${rpg.sel}\n│ 𖥔 Durasi : ${menit} menit\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Dipenjara oleh Owner`, m, { mentions: [who] })
    }

    /* =====================================================
       OWNER - BEBASIN
    ===================================================== */

    if (command === 'bebasin') {
        if (!isOwner) return m.reply('❌ Khusus Owner')
        if (args[0] === 'all') {
            if (wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let bebas = []
            for (const jidRaw of wdb.penjara) { const jid = resolveJid(jidRaw); const rpg = getRPG(jid); if (!rpg) continue; rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; removeFromBreakouts(jid); bebas.push(jid) }
            wdb.penjara = []; saveDB(wdb)
            const names = bebas.length? bebas.map(jid => `@${jid.split('@')[0]}`).join(', ') : '-'
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Bebas : ${names}\n╰ 𖥔 Oleh Owner`, m, { mentions: bebas })
        }
        let who = null
        if (args[0] === 'sel' && args[1]) { who = findPrisonerByCell(args[1]); if (!who) return m.reply(`❌ Sel ${args[1].toUpperCase()} kosong`) }
        else if (m.quoted || m.mentionedJid?.[0]) { who = getTarget() }
        else if (args[0]) { who = getTarget(args[0]) }
        else { who = resolveJid(m.sender) }
        if (!who) return m.reply('❌ Target tidak ditemukan')
        const rpg = getRPG(who); const index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)
        if ((!rpg ||!rpg.penjara) && index === -1) return m.reply('❌ Orang ini tidak di penjara')
        const selLama = rpg?.sel || (index >= 0? index + 1 : 0)
        if (rpg) { rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0 }
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); removeFromBreakouts(who); saveDB(wdb)
        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Owner : @${m.sender.split('@')[0]}\n│ 𖥔 Target : @${who.split('@')[0]}\n╰ 𖥔 Bebas dari SEL ${selLama}!`, m, { mentions: [m.sender, who] })
    }

    /* =====================================================
       TEBUS
    ===================================================== */

    if (command === 'tebus') {
        if (args[0] === 'all') {
            if (wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let total = 0; let targets = []; let waiting = []
            for (const jidRaw of wdb.penjara) {
                const jid = resolveJid(jidRaw)
                if (jid === resolveJid(m.sender)) continue
                const rpg = getRPG(jid)
                if (rpg && rpg.penjara && Number(rpg.tebusan) > 0) {
                    const remaining = sisaTungguTebus(rpg)
                    if (remaining > 0) {
                        waiting.push(remaining)
                        continue
                    }
                    total += Number(rpg.tebusan)
                    targets.push({ jid, rpg })
                }
            }
            if (targets.length === 0) {
                if (waiting.length) return m.reply(`❌ Tahanan baru bisa ditebus setelah 5 menit di penjara.\n⏳ Coba lagi dalam *${formatTime(Math.min(...waiting))}*.`)
                return m.reply('❌ Tidak ada orang lain di penjara')
            }
            const uang = Number(wdb.money[m.sender]) || 0
            if (uang < total) return m.reply(`❌ Uang tidak cukup.\n\n💰 Uang kamu : Rp ${uang.toLocaleString('id-ID')}\n💸 Dibutuhkan : Rp ${total.toLocaleString('id-ID')}`)
            wdb.money[m.sender] = uang - total
            const bebas = []
            for (const data of targets) {
                data.rpg.penjara = null
                data.rpg.lamaPenjara = 0
                data.rpg.tebusan = 0
                data.rpg.sel = 0
                data.rpg.gagalCopet = 0
                removeFromBreakouts(data.jid)
                bebas.push(data.jid)
            }
            wdb.penjara = wdb.penjara.filter(jid =>!targets.some(target => resolveJid(target.jid) === resolveJid(jid)))
            saveDB(wdb)
            const waitingInfo = waiting.length ? `\n│ 𖥔 ${waiting.length} tahanan belum 5 menit di penjara` : ''
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN MASSAL_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Biaya : Rp ${total.toLocaleString('id-ID')}\n│ 𖥔 Bebas : ${bebas.map(jid => `@${jid.split('@')[0]}`).join(', ')}${waitingInfo}\n╰ 𖥔 Berhasil`, m, { mentions: bebas })
        }

        let who = null
        if (args[0] === 'sel' && args[1]) {
            who = findPrisonerByCell(args[1])
            if (!who) return m.reply(`❌ Sel ${args[1].toUpperCase()} kosong`)
        } else if (m.quoted || m.mentionedJid?.[0]) {
            who = getTarget()
        } else if (args[0]) {
            who = getTarget(args[0])
        } else {
            return m.reply(`*Format:*\n\n${usedPrefix}tebus @tag\n${usedPrefix}tebus sel 2\n${usedPrefix}tebus all`)
        }

        if (!who) return m.reply('❌ Target tidak ditemukan')
        who = resolveJid(who)
        if (who === resolveJid(m.sender)) return m.reply(`[ 🚔 ]───[ *_GAGAL_* ]───✦\n╭ 𖥔 Kamu tidak bisa tebus diri sendiri\n╰ 𖥔 Tunggu masa tahanan habis`)

        const rpg = getRPG(who)
        if (!rpg ||!rpg.penjara) {
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
            removeFromBreakouts(who)
            saveDB(wdb)
            return m.reply('❌ Orang ini tidak di penjara')
        }

        if (sisaWaktu(rpg) <= 0) {
            const selLama = rpg.sel || 0
            rpg.penjara = null
            rpg.lamaPenjara = 0
            rpg.tebusan = 0
            rpg.sel = 0
            rpg.gagalCopet = 0
                rpg.penjara = null
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
                removeFromBreakouts(who)
            saveDB(wdb)
            return m.reply(`🚔 Masa tahanan @${who.split('@')[0]} sudah habis.\n\n╭ 𖥔 SEL : ${selLama}\n╰ 𖥔 Target sudah bebas otomatis`, { mentions: [who] })
        }

        const sisaTunggu = sisaTungguTebus(rpg)
        if (sisaTunggu > 0) return m.reply(`[ 🚔 ]───[ *_BELUM BISA DITEBUS_* ]───✦\n╭ 𖥔 Tahanan baru bisa ditebus setelah 5 menit di penjara\n╰ 𖥔 Tunggu *${formatTime(sisaTunggu)}* lagi`)

        const tebusan = Number(rpg.tebusan) || 1000000
        const uang = Number(wdb.money[m.sender]) || 0
        if (uang < tebusan) return m.reply(`❌ Uang tidak cukup.\n\n💰 Uang kamu : Rp ${uang.toLocaleString('id-ID')}\n💸 Dibutuhkan : Rp ${tebusan.toLocaleString('id-ID')}`)

        wdb.money[m.sender] = uang - tebusan
        const selLama = rpg.sel || 0
        rpg.penjara = null
        rpg.lamaPenjara = 0
        rpg.tebusan = 0
        rpg.sel = 0
        rpg.gagalCopet = 0
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
        removeFromBreakouts(who)
        saveDB(wdb)

        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN_* ]───✦\n╭ 𖥔 Dari : @${m.sender.split('@')[0]}\n│ 𖥔 Untuk : @${who.split('@')[0]}\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Bebas dari SEL ${selLama}!`, m, { mentions: [m.sender, who] })
    }

    /* =====================================================
       PENJARA - PENJELASAN DAN DAFTAR SEL
    ===================================================== */

    if (command === 'penjara' && ['list', 'active'].includes(args[0]?.toLowerCase())) {
        const activePrisoners = wdb.penjara
            .map(jid => resolveJid(jid))
            .filter((jid, index, list) => jid && list.indexOf(jid) === index)
            .map(jid => ({ jid, rpg: getRPG(jid) }))
            .filter(({ rpg }) => rpg?.penjara && sisaWaktu(rpg) > 0)

        if (!activePrisoners.length) return m.reply('🏛️ Tidak ada sel yang sedang aktif.')

        const mentions = activePrisoners.map(({ jid }) => jid)
        const list = activePrisoners
            .map(({ jid, rpg }, index) => `> ${index + 1}. SEL ${rpg.sel || '-'} • Sisa ${formatTime(sisaWaktu(rpg))}\n> ↳ @${jid.split('@')[0]}`)
            .join('\n\n')

        return conn.reply(
            m.chat,
            `╭─❏「 🚔 SEL AKTIF 」❏\n` +
            `│ Total: ${activePrisoners.length} tahanan\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            list,
            m,
            { mentions }
        )
    }

    const prisonMode = (args[0] || '').toLowerCase()
    if (prisonMode !== 'sel') {
  return sendRpgMsg(conn, m,
    `╭─❏「 🚔 PENJARA 」❏\n` +
    `│ 🚔 *SISTEM PENJARA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📋 *INFORMASI*\n` +
    `> ↳ Penjara berisi pemain yang gagal melakukan kejahatan atau terkena hukuman Owner.\n` +
    `> ↳ Kasus mengikuti penyebab masuk penjara: copet, begal, bunuh, rampok, fitnah, atau Owner Jail.\n` +
    `> ↳ Routine dan talk menambah progres kabur.\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +

    `📌 *MENU PENJARA*\n` +
    `> ↳ Lihat blok sel: *${usedPrefix}penjara sel A*\n` +
    `> ↳ Lihat sel aktif: *${usedPrefix}penjara list*\n` +
    `> ↳ Kunjungi napi: *${usedPrefix}penjara visit sel A4*\n` +
    `> ↳ Routine: *${usedPrefix}penjara routine*\n` +
    `> ↳ Talk: *${usedPrefix}penjara talk*\n` +
    `> ↳ Kabur: *${usedPrefix}penjara kabur*\n` +
    `> ↳ Breakout bersama: *${usedPrefix}penjara breakout create*\n` +
    `> ↳ Panduan: *${usedPrefix}penjara guide*\n` +
    `> ↳ Tebus: *${usedPrefix}tebus sel A4*\n\n` +

    `─━━━━━━━━━━━━━━─`,
    'https://c.termai.cc/i106/p1Vn.jpg')
}

if (!args[1]) {
  let summary = `╭─❏「 🚔 BLOK PENJARA 」❏\n`
  summary += `│ 🚔 *DAFTAR BLOK SEL*\n`
  summary += `╰─━━━━━━━━━━━━━━─\n\n`

  summary += `📋 *INFORMASI*\n`
    summary += `> ↳ Blok dikelompokkan berdasarkan huruf sel.\n`
  summary += `> ↳ Pilih blok untuk melihat isinya.\n\n`

  summary += `─━━━━━━━━━━━━━━─\n\n`

  for (let index = 0; index < 26; index++) {
    const letter = String.fromCharCode(65 + index)
    const count = wdb.penjara.filter(jid => String(getRPG(jid)?.sel || '').startsWith(letter)).length
    summary += `*${letter}. BLOK SEL*\n`
    summary += `> ↳ Tahanan: ${count} orang\n\n`
  }

  summary += `─━━━━━━━━━━━━━━─\n\n`
  summary += `📌 *CONTOH*\n`
  summary += `> ↳ *${usedPrefix}penjara sel A*\n\n`
  summary += `─━━━━━━━━━━━━━━─`

  return m.reply(summary)
}

const prisonPage = args[1].toUpperCase()

if (!/^[A-Z]$/.test(prisonPage)) {
  return m.reply(
    `╭─❏「 🚔 PENJARA 」❏\n` +
    `│ ❌ *BLOK SEL TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Gunakan huruf sel A sampai Z.\n` +
    `> ↳ Contoh: *${usedPrefix}penjara sel A*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const entries = wdb.penjara.filter(jid => String(getRPG(jid)?.sel || '').startsWith(prisonPage))
const totalPages = Math.max(1, new Set(wdb.penjara.map(jid => String(getRPG(jid)?.sel || '')[0]).filter(Boolean)).size)

if (entries.length === 0) {
  return m.reply(
    `╭─❏「 🚔 SEL ${prisonPage} 」❏\n` +
    `│ 📭 *BLOK SEL KOSONG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tidak ada tahanan pada blok sel ini.\n` +
    `> ↳ Total blok terisi: ${totalPages}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

let pageText = `╭─❏「 🚔 BLOK SEL ${prisonPage} 」❏\n`
pageText += `│ 🚔 *DAFTAR TAHANAN*\n`
pageText += `╰─━━━━━━━━━━━━━━─\n\n`

pageText += `📋 *INFORMASI SEL*\n`
pageText += `> ↳ Setiap sel memiliki kode unik.\n\n`

pageText += `─━━━━━━━━━━━━━━─\n\n`

const pageMentions = []

entries.forEach((jid, offset) => {
  const rpg = getRPG(jid)
  if (!rpg) return

    const cell = rpg.sel || `${prisonPage}${offset + 1}`
  const tebusan = Number(rpg.tebusan) || 0

  pageMentions.push(jid)

        pageText += `*🧍 SEL ${cell} • Sisa: ${formatSisa(sisaWaktu(rpg))}*\n`
    pageText += `> ↳ @${jid.split('@')[0]}\n`
  pageText += `> ↳ 💸 Tebus: Rp ${tebusan.toLocaleString('id-ID')}\n`
  pageText += `> ↳ ⚖️ Kasus: ${kasus(rpg)}\n\n`
})

pageText += `─━━━━━━━━━━━━━━─\n\n`

pageText += `─━━━━━━━━━━━━━━─`

return conn.reply(m.chat, pageText, m, { mentions: pageMentions })

if (wdb.penjara.length === 0) return m.reply(
  `╭─❏「 🚔 PENJARA KOTA 」❏\n` +
  `│ 📭 *PENJARA KOSONG*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Kota aman dan damai.\n\n` +
  `─━━━━━━━━━━━━━━─`
)

let cap = `╭─❏「 🚔 DAFTAR NARAPIDANA 」❏\n`
cap += `│ 🚔 *DAFTAR NARAPIDANA*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📊 *TOTAL TAHANAN*\n`
cap += `> ↳ ${wdb.penjara.length} orang\n\n`

cap += `─━━━━━━━━━━━━━━─\n\n`

const mentioned = []

for (let i = 0; i < wdb.penjara.length; i++) {
  const jid = wdb.penjara[i]
  const rpg = getRPG(jid)
  if (!rpg) continue

  mentioned.push(jid)

  const sisa = sisaWaktu(rpg)
  const tebusan = Number(rpg.tebusan) || 0

  cap += `*${i + 1}. 🧍 SEL ${i + 1} — @${jid.split('@')[0]}*\n`
  cap += `> ↳ ⏳ Sisa: ${formatSisa(sisa)}\n`
  cap += `> ↳ 💸 Tebus: Rp ${tebusan.toLocaleString('id-ID')}\n`
  cap += `> ↳ ⚖️ Kasus: ${kasus(tebusan)}\n\n`
}

cap += `─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *INFO UMUM*\n`
cap += `> ↳ ${usedPrefix}penjara visit 2\n`
cap += `> ↳ ${usedPrefix}penjara routine — CD 2m\n`
cap += `> ↳ ${usedPrefix}penjara talk — CD 2m\n`
cap += `> ↳ ${usedPrefix}penjara kabur — 1% / 10%\n`
cap += `> ↳ ${usedPrefix}tebus @tag\n`
cap += `> ↳ ${usedPrefix}tebus sel 2\n`
cap += `> ↳ Lakukan routine + talk untuk meningkatkan peluang kabur\n`

if (isOwner) {
  cap += `\n─━━━━━━━━━━━━━━─\n\n`

  cap += `👑 *INFO OWNER*\n`
  cap += `> ↳ ${usedPrefix}penjarain @tag menit tebusan\n`
  cap += `> ↳ ${usedPrefix}bebasin @tag\n`
  cap += `> ↳ ${usedPrefix}bebasin sel 2\n`
  cap += `> ↳ ${usedPrefix}bebasin all\n`
  cap += `> ↳ Khusus Owner\n`
}

cap += `\n─━━━━━━━━━━━━━━─`

    saveDB(wdb)
    return conn.reply(m.chat, cap, m, { mentions: mentioned })
}

/* =========================================================
   COMMAND CONFIG
========================================================= */

handler.help = ['penjara', 'penjara sel <A-Z>', 'penjara visit <sel/@tag>', 'penjara routine', 'penjara talk', 'penjara kabur', 'penjara breakout create/join/info/leave/start', 'penjara guide', 'tebus', 'penjarain', 'bebasin']
handler.tags = ['rpg']
handler.command = /^(penjara|tebus|penjarain|bebasin)$/i
handler.group = true

export default handler