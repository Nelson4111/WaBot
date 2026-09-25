const TAROT_CARDS = [
  ['The Fool', 'Awal baru, keberanian mencoba, dan langkah spontan. Percayalah pada perjalanan, tetapi tetap perhatikan arah.'],
  ['The Magician', 'Kamu memiliki alat dan kemampuan untuk mengubah niat menjadi tindakan nyata. Fokuskan energimu.'],
  ['The High Priestess', 'Jawaban sedang tumbuh dalam keheningan. Dengarkan intuisi dan jangan buru-buru membuka semua rahasia.'],
  ['The Empress', 'Masa subur untuk merawat, mencipta, dan menerima kelimpahan. Biarkan sesuatu berkembang secara alami.'],
  ['The Emperor', 'Struktur, batas, dan kepemimpinan diperlukan. Tegaslah tanpa kehilangan kehangatan.'],
  ['The Hierophant', 'Pelajaran dari tradisi, mentor, atau nilai yang kamu pegang sedang relevan. Cari kebijaksanaan yang teruji.'],
  ['The Lovers', 'Pilihan penting meminta keselarasan antara hati, nilai, dan tindakan. Kejujuran adalah kuncinya.'],
  ['The Chariot', 'Kemajuan datang saat dua dorongan yang berlawanan diarahkan pada tujuan yang sama. Pegang kendali.'],
  ['Strength', 'Kelembutan dan keberanian batin lebih kuat daripada paksaan. Hadapi ketakutan dengan sabar.'],
  ['The Hermit', 'Ambil jarak untuk menemukan jawabanmu sendiri. Kesendirian yang sehat dapat menerangi langkah berikutnya.'],
  ['Wheel of Fortune', 'Siklus sedang berputar. Sambut perubahan dan manfaatkan peluang tanpa menggantungkan diri pada keberuntungan.'],
  ['Justice', 'Kebenaran, tanggung jawab, dan konsekuensi perlu dilihat dengan jernih. Ambil keputusan yang seimbang.'],
  ['The Hanged Man', 'Tunda reaksi dan lihat situasi dari sudut yang berbeda. Pelepasan dapat membuka pemahaman baru.'],
  ['Death', 'Satu fase sedang berakhir agar ruang baru terbuka. Perubahan ini menuntut keberanian untuk melepaskan.'],
  ['Temperance', 'Keseimbangan lahir dari proses mencampur hal-hal yang berbeda secara perlahan. Pilih ritme yang berkelanjutan.'],
  ['The Devil', 'Perhatikan keterikatan, kebiasaan, atau rasa takut yang membatasi pilihanmu. Kesadaran adalah pintu kebebasan.'],
  ['The Tower', 'Struktur yang rapuh dapat runtuh agar kebenaran terlihat. Jangan mempertahankan sesuatu hanya karena sudah lama.'],
  ['The Star', 'Harapan, pemulihan, dan arah yang lebih jernih hadir setelah masa berat. Rawat keyakinanmu.'],
  ['The Moon', 'Tidak semua hal terlihat jelas. Periksa asumsi, mimpi, dan kecemasan sebelum mengambil kesimpulan.'],
  ['The Sun', 'Kejelasan, kegembiraan, dan energi terbuka mendukungmu. Berani tampil apa adanya.'],
  ['Judgement', 'Saatnya menilai masa lalu dengan jujur lalu menjawab panggilan yang lebih sesuai dengan dirimu.'],
  ['The World', 'Sebuah siklus mendekati penyelesaian. Rayakan pencapaian dan bersiap memasuki bab berikutnya.'],
  ['Ace of Wands', 'Percikan ide dan semangat baru muncul. Mulailah sebelum antusiasme itu padam.'],
  ['Two of Wands', 'Rencana mulai melebar. Bandingkan pilihan dan tentukan cakrawala yang benar-benar ingin kamu tuju.'],
  ['Three of Wands', 'Usaha yang telah ditanam mulai menunjukkan arah. Bersabarlah sambil memperluas jangkauan.'],
  ['Four of Wands', 'Ada alasan untuk merayakan stabilitas, rumah, atau dukungan dari orang-orang terdekat.'],
  ['Five of Wands', 'Perbedaan pendapat memunculkan gesekan. Gunakan kompetisi untuk bertumbuh, bukan untuk saling menjatuhkan.'],
  ['Six of Wands', 'Pengakuan dan kemenangan kecil terlihat. Terima apresiasi tanpa melupakan orang yang membantumu.'],
  ['Seven of Wands', 'Pertahankan posisi dan batasmu. Kamu tidak harus menjelaskan diri kepada semua orang.'],
  ['Eight of Wands', 'Berita, gerak, atau perkembangan cepat segera datang. Siapkan respons yang jelas.'],
  ['Nine of Wands', 'Kamu lelah tetapi hampir sampai. Lindungi energimu dan lanjutkan dengan strategi, bukan keras kepala.'],
  ['Ten of Wands', 'Beban terlalu banyak dipikul sendiri. Delegasikan, sederhanakan, dan lepaskan kewajiban yang bukan milikmu.'],
  ['Page of Wands', 'Rasa ingin tahu membawa pesan atau kesempatan baru. Belajarlah sambil bergerak.'],
  ['Knight of Wands', 'Keberanian dan dorongan kuat mendorong aksi cepat. Jaga agar spontanitas tidak berubah menjadi ceroboh.'],
  ['Queen of Wands', 'Karismamu sedang kuat. Percaya diri, hangat, dan izinkan kreativitasmu terlihat.'],
  ['King of Wands', 'Visi besar membutuhkan kepemimpinan dan keberanian mengambil keputusan. Nyalakan semangat orang lain.'],
  ['Ace of Cups', 'Hati membuka ruang bagi kasih, pemulihan, dan hubungan emosional yang lebih tulus.'],
  ['Two of Cups', 'Pertemuan yang seimbang dan saling menghargai berpotensi menguat. Bicara dari hati ke hati.'],
  ['Three of Cups', 'Dukungan pertemanan dan kegembiraan bersama menjadi sumber tenaga. Jangan menjalani semuanya sendirian.'],
  ['Four of Cups', 'Rasa jenuh dapat membuatmu melewatkan tawaran yang sebenarnya berarti. Lihat kembali apa yang ada di depanmu.'],
  ['Five of Cups', 'Kekecewaan sedang terasa nyata, tetapi belum semuanya hilang. Beri ruang untuk duka lalu lihat sisa harapan.'],
  ['Six of Cups', 'Masa lalu membawa kenangan, pelajaran, atau seseorang yang kembali muncul. Ambil kehangatannya tanpa terjebak di sana.'],
  ['Seven of Cups', 'Banyak pilihan tampak menarik. Bedakan intuisi dari fantasi dan pilih yang dapat diwujudkan.'],
  ['Eight of Cups', 'Ada hal yang perlu ditinggalkan demi pencarian yang lebih bermakna. Pergi bukan berarti gagal.'],
  ['Nine of Cups', 'Keinginan mulai mendekati kenyataan. Nikmati hasilnya, sambil tetap menjaga rasa syukur.'],
  ['Ten of Cups', 'Kebahagiaan emosional dan rasa memiliki dapat dibangun melalui kejujuran serta kehadiran.'],
  ['Page of Cups', 'Pesan lembut, inspirasi, atau perasaan baru muncul. Terima kerentanan sebagai sumber kreativitas.'],
  ['Knight of Cups', 'Ajakan romantis atau gerakan penuh perasaan datang. Pastikan tindakan mengikuti kata-kata.'],
  ['Queen of Cups', 'Empati dan intuisi menjadi kompas. Rawat orang lain tanpa mengabaikan batas emosionalmu.'],
  ['King of Cups', 'Kematangan emosi membantu menghadapi situasi rumit. Rasakan semuanya, tetapi biarkan kebijaksanaan memimpin.'],
  ['Ace of Swords', 'Kebenaran dan ide yang tajam memotong kebingungan. Sampaikan pikiranmu dengan jujur dan bertanggung jawab.'],
  ['Two of Swords', 'Keputusan tertahan karena informasi atau keberanian belum lengkap. Buka mata dan tentukan batas waktu.'],
  ['Three of Swords', 'Luka, perpisahan, atau kebenaran pahit perlu diakui agar proses pulih dapat dimulai.'],
  ['Four of Swords', 'Istirahat bukan kemunduran. Pulihkan pikiran sebelum kembali menghadapi masalah.'],
  ['Five of Swords', 'Kemenangan yang menyisakan kerusakan mungkin tidak layak dikejar. Pilih konflik yang benar-benar penting.'],
  ['Six of Swords', 'Perpindahan perlahan membawamu menjauh dari kekacauan. Bawa pelajaran, bukan seluruh beban lama.'],
  ['Seven of Swords', 'Strategi diperlukan, tetapi jangan mengorbankan integritas. Periksa hal yang disembunyikan, termasuk oleh dirimu sendiri.'],
  ['Eight of Swords', 'Rasa terjebak mungkin lebih kuat daripada batas sebenarnya. Satu langkah kecil dapat mengembalikan pilihanmu.'],
  ['Nine of Swords', 'Kekhawatiran membesar dalam pikiran saat malam. Cari dukungan dan pisahkan fakta dari skenario terburuk.'],
  ['Ten of Swords', 'Akhir yang menyakitkan menutup siklus lama. Pemulihan dimulai setelah kamu berhenti menghidupkan kembali luka itu.'],
  ['Page of Swords', 'Rasa ingin tahu dan berita baru menuntut verifikasi. Bertanyalah, tetapi jangan terburu menyebarkan asumsi.'],
  ['Knight of Swords', 'Dorongan untuk bergerak sangat kuat. Gabungkan keberanian dengan pertimbangan agar tidak melukai diri sendiri atau orang lain.'],
  ['Queen of Swords', 'Kejernihan, batas, dan standar yang sehat membantumu melihat siapa serta apa yang benar-benar layak.'],
  ['King of Swords', 'Logika dan keputusan objektif diperlukan. Bangun argumen dari fakta, bukan dari tekanan sesaat.'],
  ['Ace of Pentacles', 'Benih kesempatan praktis mulai tersedia. Rawat dengan konsistensi agar menjadi hasil yang nyata.'],
  ['Two of Pentacles', 'Banyak hal perlu diseimbangkan. Atur prioritas dan jangan menjanjikan kapasitas yang tidak kamu punya.'],
  ['Three of Pentacles', 'Kerja sama dan keahlian yang dihargai membuka kemajuan. Minta masukan dari orang yang tepat.'],
  ['Four of Pentacles', 'Keamanan penting, tetapi keterikatan berlebihan dapat menghentikan pertumbuhan. Sisakan ruang untuk berbagi dan berubah.'],
  ['Five of Pentacles', 'Masa sulit tidak harus dihadapi sendirian. Bantuan ada, tetapi kamu perlu berani memintanya.'],
  ['Six of Pentacles', 'Pertukaran yang adil menjadi tema utama. Periksa apakah memberi dan menerima sudah seimbang.'],
  ['Seven of Pentacles', 'Hasil membutuhkan waktu. Evaluasi investasi tenaga dan ubah cara, bukan buru-buru mencabut semuanya.'],
  ['Eight of Pentacles', 'Latihan tekun dan perhatian pada detail akan meningkatkan kemampuanmu. Kemajuan kecil tetap berarti.'],
  ['Nine of Pentacles', 'Kemandirian dan hasil kerja keras mulai terasa. Nikmati ruang yang kamu bangun dengan tangan sendiri.'],
  ['Ten of Pentacles', 'Stabilitas jangka panjang, keluarga, atau warisan nilai menjadi fondasi penting bagi keputusanmu.'],
  ['Page of Pentacles', 'Pelajaran atau peluang baru yang praktis datang. Mulai dari dasar dan jadikan rasa ingin tahu sebagai keterampilan.'],
  ['Knight of Pentacles', 'Kemajuan lambat tetapi dapat diandalkan. Konsistensi lebih berharga daripada gebrakan sesaat.'],
  ['Queen of Pentacles', 'Kesejahteraan dibangun lewat kepedulian yang membumi. Urus tubuh, rumah, dan sumber dayamu.'],
  ['King of Pentacles', 'Pengalaman dan pengelolaan sumber daya mendukung kemakmuran. Gunakan keberhasilan dengan bijaksana.']
]

const ORACLE_CARDS = [
  ['Kompas Batin', 'Jawaban terdekat ada di dalam dirimu. Tenangkan suara luar sebelum memilih arah.'],
  ['Pintu Terbuka', 'Kesempatan baru sedang muncul. Masuklah dengan kesiapan, bukan sekadar rasa penasaran.'],
  ['Akar', 'Kembali ke dasar dan nilai yang membuatmu kokoh. Pertumbuhan yang sehat dimulai dari fondasi.'],
  ['Arus', 'Berhenti melawan semua perubahan. Ikuti gerak yang mendukungmu sambil tetap menjaga tujuan.'],
  ['Cermin', 'Situasi ini memantulkan sesuatu tentang dirimu. Amati tanpa menghakimi agar pola lama terlihat.'],
  ['Benih', 'Niat kecil dapat menjadi sesuatu yang besar bila dirawat rutin. Jangan tuntut hasil sebelum waktunya.'],
  ['Mercusuar', 'Kejelasanmu dapat membantu orang lain, tetapi kamu tidak perlu menyelamatkan semua kapal.'],
  ['Jeda Suci', 'Berhenti sejenak adalah bagian dari perjalanan. Tubuh dan pikiranmu sedang meminta ruang.'],
  ['Simpul', 'Masalah terasa rumit karena beberapa hal terikat bersamaan. Lepaskan satu ikatan pada satu waktu.'],
  ['Fajar', 'Masa berat mulai memberi celah bagi harapan. Ambil langkah pertama saat cahaya kecil itu muncul.'],
  ['Batas', 'Kasih sayang tidak mengharuskanmu selalu tersedia. Katakan tidak pada hal yang mengurasmu.'],
  ['Jembatan', 'Hubungan atau komunikasi dapat menyatukan dua sisi. Mulailah dari kesamaan yang masih ada.'],
  ['Hujan', 'Emosi yang keluar sedang membersihkan ruang batin. Izinkan dirimu merasa tanpa tinggal selamanya di sana.'],
  ['Api Kecil', 'Semangat belum padam. Lindungi energi yang tersisa dan beri bahan bakar yang benar.'],
  ['Cangkang', 'Perlindunganmu pernah berguna, tetapi mungkin kini terlalu rapat. Buka diri secara bertahap.'],
  ['Panen', 'Usaha masa lalu mulai menghasilkan sesuatu. Terima hasilnya dan gunakan dengan penuh kesadaran.'],
  ['Burung Pulang', 'Rasa memiliki sedang dipulihkan. Hubungi orang atau tempat yang membuatmu dapat menjadi diri sendiri.'],
  ['Kunci', 'Solusi tersedia, tetapi membutuhkan keberanian atau informasi yang belum kamu gunakan.'],
  ['Gunung', 'Tantangan ini besar namun dapat didaki dengan tahap yang jelas. Jangan ukur seluruh perjalanan sekaligus.'],
  ['Lembah', 'Masa rendah memberi perspektif yang tidak terlihat dari puncak. Pulihkan diri sebelum mendaki kembali.'],
  ['Mata Air', 'Sumber energi baru hadir melalui hal sederhana yang menyegarkan hati. Kembali ke sana secara rutin.'],
  ['Benang Merah', 'Beberapa kejadian terhubung lebih erat daripada yang tampak. Perhatikan pola, bukan hanya kebetulan.'],
  ['Penenun', 'Kamu ikut menciptakan masa depan melalui pilihan berulang. Pilih benang yang ingin dibawa lebih jauh.'],
  ['Panggilan', 'Ada dorongan yang terus kembali. Dengarkan, lalu ubah inspirasi itu menjadi satu tindakan konkret.'],
  ['Ruang Kosong', 'Tidak semua kekosongan harus segera diisi. Biarkan ruang baru menampung sesuatu yang lebih sesuai.'],
  ['Bintang Utara', 'Pegang prinsip sebagai arah ketika detail perjalanan belum jelas. Tujuan yang baik memberi ketenangan.'],
  ['Kawanan', 'Dukungan komunitas memperkuat langkahmu. Berbagi beban bukan tanda kelemahan.'],
  ['Penjaga', 'Lindungi waktu, kesehatan, dan nilai yang penting bagimu. Kewaspadaan tidak harus berubah menjadi ketakutan.'],
  ['Cahaya Hijau', 'Jalan di depan cukup aman untuk dicoba. Bergeraklah sambil tetap memperhatikan tanda-tanda nyata.'],
  ['Lampu Kuning', 'Perlambat laju dan periksa kembali detail penting. Bukan penolakan, hanya ajakan untuk lebih siap.'],
  ['Lepas', 'Sesuatu selesai karena memang waktunya. Bebaskan tanganmu agar dapat menerima kemungkinan baru.'],
  ['Undangan', 'Percakapan atau pengalaman baru dapat memperluas duniamu. Datanglah dengan pikiran terbuka.'],
  ['Keseimbangan', 'Kebutuhanmu dan kebutuhan orang lain sama-sama layak didengar. Cari pengaturan yang adil.'],
  ['Keheningan', 'Informasi penting belum muncul melalui kata-kata. Amati tindakan, jeda, dan perasaanmu.'],
  ['Puncak', 'Pencapaian dekat, tetapi jangan biarkan tujuan membuatmu lupa menikmati langkah yang sudah ditempuh.'],
  ['Pasang Surut', 'Perasaan dan keadaan berubah secara alami. Jangan membuat keputusan permanen dari emosi sementara.'],
  ['Keberanian Lembut', 'Kamu boleh tegas tanpa menjadi keras. Ketulusan yang tenang dapat mengubah percakapan.'],
  ['Peta Lama', 'Pengalaman terdahulu memberi petunjuk, bukan hukuman. Gunakan pelajaran tanpa mengulang batasannya.'],
  ['Tangan Terbuka', 'Terima bantuan, kasih, atau peluang yang datang tanpa merasa harus membalas semuanya segera.'],
  ['Perayaan', 'Rayakan kemajuan kecil bersama orang yang mendukungmu. Kegembiraan juga bagian dari proses.'],
  ['Langit Luas', 'Kemungkinanmu lebih besar daripada cerita lama tentang dirimu. Izinkan cita-cita mengambil tempat.'],
  ['Malam Berbintang', 'Jawaban mungkin datang dalam mimpi, intuisi, atau refleksi. Catat kesan yang terus berulang.'],
  ['Kembali ke Diri', 'Sebelum mencari kepastian dari luar, pastikan kebutuhan dan keinginanmu sendiri sudah kamu dengar.'],
  ['Musim Baru', 'Perubahan keadaan membawa kesempatan untuk memulai dengan cara yang lebih selaras dengan dirimu.']
]

const MAJOR_ARCANA_INDONESIAN = {
  'The Fool': 'Si Bodoh', 'The Magician': 'Sang Pesulap', 'The High Priestess': 'Pendeta Agung', 'The Empress': 'Sang Permaisuri', 'The Emperor': 'Sang Kaisar', 'The Hierophant': 'Sang Hierophant', 'The Lovers': 'Para Kekasih', 'The Chariot': 'Kereta Perang', Strength: 'Kekuatan', 'The Hermit': 'Sang Pertapa', 'Wheel of Fortune': 'Roda Keberuntungan', Justice: 'Keadilan', 'The Hanged Man': 'Pria Tergantung', Death: 'Kematian', Temperance: 'Kesederhanaan', 'The Devil': 'Sang Iblis', 'The Tower': 'Menara', 'The Star': 'Bintang', 'The Moon': 'Bulan', 'The Sun': 'Matahari', Judgement: 'Penghakiman', 'The World': 'Dunia'
}
const TAROT_RANK_INDONESIAN = { Ace: 'As', Two: 'Dua', Three: 'Tiga', Four: 'Empat', Five: 'Lima', Six: 'Enam', Seven: 'Tujuh', Eight: 'Delapan', Nine: 'Sembilan', Ten: 'Sepuluh', Page: 'Page', Knight: 'Kesatria', Queen: 'Ratu', King: 'Raja' }
const TAROT_SUIT_INDONESIAN = { Wands: 'Tongkat', Cups: 'Cawan', Swords: 'Pedang', Pentacles: 'Pentakel' }
const TAROT_MAJOR_EMOJIS = { 'The Fool': '🧳', 'The Magician': '🎩', 'The High Priestess': '🌙', 'The Empress': '👑', 'The Emperor': '🏛️', 'The Hierophant': '📜', 'The Lovers': '💞', 'The Chariot': '🏇', Strength: '🦁', 'The Hermit': '🏮', 'Wheel of Fortune': '🎡', Justice: '⚖️', 'The Hanged Man': '🙃', Death: '🦋', Temperance: '⚗️', 'The Devil': '⛓️', 'The Tower': '⚡', 'The Star': '🌟', 'The Moon': '🌕', 'The Sun': '☀️', Judgement: '📯', 'The World': '🌍' }
const ORACLE_ENGLISH_NAMES = ['Inner Compass', 'Open Door', 'Roots', 'The Current', 'Mirror', 'The Seed', 'Lighthouse', 'Sacred Pause', 'The Knot', 'Dawn', 'Boundaries', 'Bridge', 'Rain', 'Little Flame', 'The Shell', 'Harvest', 'The Returning Bird', 'The Key', 'Mountain', 'Valley', 'Spring', 'Red Thread', 'The Weaver', 'The Calling', 'Empty Space', 'North Star', 'The Flock', 'The Guardian', 'Green Light', 'Yellow Light', 'Release', 'Invitation', 'Balance', 'Silence', 'The Summit', 'Tides', 'Gentle Courage', 'The Old Map', 'Open Hands', 'Celebration', 'Open Sky', 'Starry Night', 'Return to Self', 'New Season']
const ORACLE_EMOJIS = ['🧭', '🚪', '🌱', '🌊', '🪞', '🌰', '🗼', '🕯️', '🪢', '🌅', '🛡️', '🌉', '🌧️', '🔥', '🐚', '🌾', '🕊️', '🗝️', '⛰️', '🏞️', '💧', '🧵', '🧶', '📣', '⭕', '⭐', '🐦', '🔐', '🟢', '🟡', '🕊️', '💌', '☯️', '🤫', '🏔️', '🌊', '🌷', '🗺️', '🤲', '🎉', '🌌', '✨', '🪷', '🌤️']
const MAJOR_REVERSED = {
  'The Fool': 'Keraguan atau langkah ceroboh tanpa persiapan.', 'The Magician': 'Potensi belum diarahkan atau kemampuan disalahgunakan.', 'The High Priestess': 'Intuisi tertutup oleh kebisingan dan rahasia.', 'The Empress': 'Kelelahan merawat orang lain atau kreativitas tertahan.', 'The Emperor': 'Kontrol berlebihan atau kepemimpinan yang menekan.', 'The Hierophant': 'Merasa terkungkung oleh aturan dan pendapat orang lain.', 'The Lovers': 'Ketidakselarasan atau pilihan yang tidak jujur.', 'The Chariot': 'Kehilangan arah dan kendali atas dorongan yang bertentangan.', Strength: 'Keraguan diri atau emosi yang belum tenang.', 'The Hermit': 'Mengisolasi diri terlalu lama dan menolak bantuan.', 'Wheel of Fortune': 'Melawan perubahan atau mengulang siklus lama.', Justice: 'Keputusan tidak seimbang atau konsekuensi yang dihindari.', 'The Hanged Man': 'Menunda tanpa tujuan dan sulit melepaskan sudut pandang lama.', Death: 'Berpegang pada fase yang sudah selesai.', Temperance: 'Ketidaksabaran dan ritme hidup yang tidak seimbang.', 'The Devil': 'Mulai melihat belenggu dan peluang untuk membebaskan diri.', 'The Tower': 'Menahan perubahan atau menghindari kebenaran besar.', 'The Star': 'Harapan meredup; pemulihan membutuhkan perhatian.', 'The Moon': 'Kabut mulai terurai, tetapi ketakutan lama masih memengaruhi.', 'The Sun': 'Kegembiraan atau keberhasilan tertunda.', Judgement: 'Menolak panggilan perubahan atau terus menghukum diri.', 'The World': 'Siklus belum ditutup atau pencapaian terasa belum lengkap.'
}

function tarotIndonesianName(name) {
  if (MAJOR_ARCANA_INDONESIAN[name]) return MAJOR_ARCANA_INDONESIAN[name]
  const [rank, suit] = name.split(' of ')
  return `${TAROT_RANK_INDONESIAN[rank] || rank} ${TAROT_SUIT_INDONESIAN[suit] || suit}`
}

function tarotEmoji(name) {
  if (TAROT_MAJOR_EMOJIS[name]) return TAROT_MAJOR_EMOJIS[name]
  if (name.includes('Wands')) return '🔥'
  if (name.includes('Cups')) return '🏆'
  if (name.includes('Swords')) return '⚔️'
  return '🪙'
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

function guide(usedPrefix, command) {
  return `╭─❏「 🔮 ${command.toUpperCase()} 」❏\n` +
    `│ 🔮 *PANDUAN ${command.toUpperCase()}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `${command === 'tarot'
      ? '🃏 Tarot memakai 78 kartu untuk membaca tema, tantangan, dan arah.'
      : '✨ Oracle memakai kartu pesan intuitif untuk refleksi dan arahan harian.'}\n` +
    `> ↳ Hasil ini untuk hiburan dan refleksi, bukan kepastian masa depan.\n\n` +

    `📌 *CARA PAKAI*\n` +
    `> ↳ ${usedPrefix}${command} <pertanyaanmu>\n` +
    `> ↳ ${usedPrefix}${command} card\n` +
    `> ↳ ${usedPrefix}${command} card <nomor/nama>\n\n` +

    `✨ *CONTOH*\n` +
    `> ↳ ${usedPrefix}${command} Bagaimana arah hubungan ini?\n` +
    `> ↳ ${usedPrefix}${command} Apa yang perlu kupahami tentang pekerjaan?\n` +
    `> ↳ ${usedPrefix}${command} card 1\n\n` +

    `💡 Tulis pertanyaan yang spesifik agar pembacaannya terasa lebih relevan.\n\n` +

    `─━━━━━━━━━━━━━━─`
}

function cardInfo(deckName, card, index) {
  const [name, meaning] = card
  const isTarot = deckName === 'tarot'
  const indonesianName = isTarot ? tarotIndonesianName(name) : name
  const reversed = isTarot
    ? (MAJOR_REVERSED[name] || `Energi ${indonesianName.toLowerCase()} sedang tertahan. Tinjau ulang cara, tempo, dan prioritasmu.`)
    : `Pesan ${name.toLowerCase()} sedang tertahan. Periksa kembali apa yang kamu hindari dan lihat situasinya dari arah berbeda.`
  return { number: index + 1, emoji: isTarot ? tarotEmoji(name) : ORACLE_EMOJIS[index], englishName: isTarot ? name : ORACLE_ENGLISH_NAMES[index], indonesianName, upright: meaning, reversed }
}

function cardCollection(deckName) {
  return (deckName === 'tarot' ? TAROT_CARDS : ORACLE_CARDS).map((card, index) => cardInfo(deckName, card, index))
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[“”'`]/g, '').trim()
}

function findCard(deckName, query) {
  const cards = cardCollection(deckName)
  const value = normalize(query)
  if (/^\d+$/.test(value)) return cards[Number(value) - 1]
  return cards.find(card => normalize(card.englishName) === value || normalize(card.indonesianName) === value)
}

function listCards(deckName, usedPrefix) {
  const cards = cardCollection(deckName)
  const lines = cards.map(card => `${String(card.number).padStart(2, '0')}. ${card.emoji} *${card.englishName}* — ${card.indonesianName}`)

  return `╭─❏「 🃏 DAFTAR KARTU ${deckName.toUpperCase()} 」❏\n` +
    `│ 🃏 *DAFTAR KARTU*\n` +
    `│ Total : *${cards.length} kartu*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `${lines.map(line => `${line}\n`).join('')}\n` +

    `─━━━━━━━━━━━━━━─\n\n` +
    `📌 *DETAIL KARTU*\n` +
    `> ↳ *${usedPrefix}${deckName} card <nomor/nama>*`
}

function cardDetail(deckName, card, usedPrefix) {
  return `╭─❏「 ${card.emoji} ${deckName.toUpperCase()} CARD 」❏\n` +
    `│ ${card.emoji} *${card.number}. ${card.englishName}*\n` +
    `│ 🇮🇩 ${card.indonesianName}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `⬆️ *UPRIGHT / TEGAK*\n` +
    `> ↳ ${card.upright}\n\n` +

    `🔄 *REVERSED / TERBALIK*\n` +
    `> ↳ ${card.reversed}\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +
    `📌 *KARTU LAIN*\n` +
    `> ↳ *${usedPrefix}${deckName} card*`
}

function pickCard(cards, question) {
  const seed = Array.from(`${question}|${Date.now()}|${Math.random()}`)
    .reduce((total, character) => total + character.charCodeAt(0), 0)
  return cards[seed % cards.length]
}

let handler = async (m, { text, usedPrefix, command }) => {
  const deckName = command.toLowerCase()
  const deck = deckName === 'tarot' ? TAROT_CARDS : ORACLE_CARDS
  const question = String(text || '').trim()
  const cardCommand = question.match(/^(?:card|kartu)(?:\s+(.+))?$/i)

  if (cardCommand) {
    const cardQuery = cardCommand[1]?.trim()
    if (!cardQuery) return m.reply(listCards(deckName, usedPrefix))
    const card = findCard(deckName, cardQuery)
    if (!card) return m.reply(
      `╭─❏「 ❌ KARTU TIDAK DITEMUKAN 」❏\n` +
      `│ ❌ *Kartu tidak ditemukan.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *DAFTAR KARTU*\n` +
      `> ↳ Gunakan *${usedPrefix}${deckName} card* untuk melihat nomor dan nama kartu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
    return m.reply(cardDetail(deckName, card, usedPrefix))
  }

  if (!question) return m.reply(guide(usedPrefix, deckName))

  await m.reply(
    `╭─❏「 🔮 AVELIA READING 」❏\n` +
    `│ 🔮 *MENATA ENERGI PERTANYAAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Avelia sedang menata energi pertanyaanmu...\n` +
    `> ↳ ✨ Menyelaraskan pesan yang paling relevan untukmu.`
  )
  await wait(1800)

  await m.reply(
    `╭─❏「 🌙 AVELIA READING 」❏\n` +
    `│ 🌙 *MENYINGKAP PESAN KARTU*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Avelia sedang menyingkap pesan dari kartu...\n` +
    `> ↳ ⏳ Sebentar, hasilnya hampir siap.`
  )
  await wait(1800)

  const selectedCard = pickCard(deck, question)
  const card = cardInfo(deckName, selectedCard, deck.indexOf(selectedCard))
  const isReversed = Math.random() < 0.35
  const position = isReversed ? '🔄 Reversed / Terbalik' : '⬆️ Upright / Tegak'
  const meaning = isReversed ? card.reversed : card.upright

  return m.reply(
    `╭─❏「 🔮 ${deckName.toUpperCase()} READING 」❏\n` +
    `│ 🔮 *HASIL READING*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `❓ *PERTANYAAN*\n` +
    `> ↳ ${question}\n\n` +

    `🃏 *KARTU YANG DIDAPAT*\n` +
    `> ↳ ${card.emoji} *${card.englishName}*\n` +
    `> ↳ 🇮🇩 ${card.indonesianName}\n\n` +

    `🧭 *POSISI*\n` +
    `> ↳ ${position}\n\n` +

    `📖 *PESAN KARTU*\n` +
    `> ↳ ${meaning}\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +
    `💡 Jadikan pesan ini sebagai bahan refleksi. Pilihan dan langkahmu tetap berada di tanganmu.`
  )
}

handler.help = ['tarot <pertanyaan>', 'oracle <pertanyaan>']
handler.tags = ['fun']
handler.command = /^(tarot|oracle)$/i
handler.limit = false

export default handler
