export const JOB_ATTENDANCE_MAX_NO_WORK_DAYS = 7
export const JOB_ABSENT_INCOME_MULTIPLIER_1 = 0.75
export const JOB_ABSENT_INCOME_MULTIPLIER_2 = 0.5
export const JOB_LEAVE_COOLDOWN_MS = 12 * 60 * 60 * 1000
export const JOB_APPLY_COOLDOWN_MS = 60 * 60 * 1000
export const JOB_TALK_COOLDOWN_MS = 30 * 60 * 1000
export const JOB_MAX_APPLIED = 5

export const JOB_TITLES = Object.freeze([
  { title: 'Anak Magang', points: 0, multiplier: 0.7 },
  { title: 'Anak Baru', points: 10, multiplier: 0.8 },
  { title: 'Asisten Baru', points: 25, multiplier: 0.9 },
  { title: 'Karyawan Junior', points: 45, multiplier: 1.0 },
  { title: 'Karyawan Tetap', points: 70, multiplier: 1.1 },
  { title: 'Karyawan Senior', points: 100, multiplier: 1.2 },
  { title: 'Assistant', points: 140, multiplier: 1.3 },
  { title: 'Staff Ahli', points: 190, multiplier: 1.4 },
  { title: 'Supervisor', points: 250, multiplier: 1.5 },
  { title: 'Team Leader', points: 470, multiplier: 1.6 },
  { title: 'Assistant Manager', points: 590, multiplier: 1.8 },
  { title: 'Manager', points: 700, multiplier: 2.0 },
  { title: 'Senior Manager', points: 950, multiplier: 2.2 },
  { title: 'General Manager', points: 1200, multiplier: 2.4 },
  { title: 'Head of Department', points: 1450, multiplier: 2.6 },
  { title: 'Director', points: 1700, multiplier: 2.8 },
  { title: 'Senior Director', points: 2000, multiplier: 3.0 },
  { title: 'Vice President', points: 2500, multiplier: 3.3 },
  { title: 'Senior Vice President', points: 4000, multiplier: 3.6 },
  { title: 'Executive Director', points: 5500, multiplier: 3.9 },
  { title: 'Chief Officer', points: 7000, multiplier: 4.2 },
  { title: 'Spesialis', points: 9200, multiplier: 4.6 },
  { title: 'Managing Partner', points: 15700, multiplier: 5.0 },
  { title: 'Co-Owner', points: 20000, multiplier: 5.5 },
  { title: 'Owner', points: 100000, multiplier: 9.0 }
])

export const INDIVIDUAL_JOB_TITLES = Object.freeze([
  { title: 'Pemula', points: 0, multiplier: 0.7 },
  { title: 'Pendatang Baru', points: 10, multiplier: 0.8 },
  { title: 'Amatir', points: 25, multiplier: 0.9 },
  { title: 'Pekerja Terampil', points: 45, multiplier: 1.0 },
  { title: 'Profesional Junior', points: 70, multiplier: 1.1 },
  { title: 'Profesional', points: 100, multiplier: 1.2 },
  { title: 'Profesional Senior', points: 140, multiplier: 1.3 },
  { title: 'Spesialis', points: 190, multiplier: 1.4 },
  { title: 'Spesialis Senior', points: 250, multiplier: 1.5 },
  { title: 'Ahli', points: 470, multiplier: 1.6 },
  { title: 'Ahli Madya', points: 590, multiplier: 1.8 },
  { title: 'Ahli Senior', points: 700, multiplier: 2.0 },
  { title: 'Pakar', points: 950, multiplier: 2.2 },
  { title: 'Pakar Senior', points: 1200, multiplier: 2.4 },
  { title: 'Pakar Utama', points: 1450, multiplier: 2.6 },
  { title: 'Master', points: 1700, multiplier: 2.8 },
  { title: 'Senior Master', points: 2000, multiplier: 3.0 },
  { title: 'Expert', points: 2500, multiplier: 3.3 },
  { title: 'Senior Expert', points: 4000, multiplier: 3.6 },
  { title: 'Grand Expert', points: 5500, multiplier: 3.9 },
  { title: 'Grandmaster', points: 7000, multiplier: 4.2 },
  { title: 'Masterclass', points: 9200, multiplier: 4.6 },
  { title: 'Virtuoso', points: 15700, multiplier: 5.0 },
  { title: 'Maestro', points: 20000, multiplier: 5.5 },
  { title: 'Living Legend', points: 100000, multiplier: 9.0 }
])

export const INDIVIDUAL_JOBS = Object.freeze([
  'Pemulung',
  'Pengamen',
  'Tukang Parkir Liar',
  'Penjual Tissue',
  'Kurir',
  'Driver Ojol',
  'Badut',
  'Tukang Cukur',
  'Penjual Mainan',
  'Tukang Jahit Kostum',
  'Tukang Parkir',
  'Penjual Pop Ice',
  'Pedagang Kaki Lima',
  'Promotor Produk',
  'Promotor Judol',
  'Stuntman',
  'Penari Club',
  'Penghibur',
  'Guru Les Privat',
  'DJ Club',
  'Desainer Grafis',
  'Video Editor',
  'Content Creator',
  'Streamer',
  'Cosplayer',
  'VTuber',
  'Penari Profesional',
  'Model Busana',
  'Konsultan',
  'Web Developer',
  'Selebgram',
  'Youtuber',
  'Gamer Profesional'
])

export const JOB_MULTI_APPLY_MIN_POINTS = JOB_TITLES.find(entry => entry.title === 'Karyawan Tetap')?.points ?? 70


export function isIndividualJob(jobName = '') {
  const normalizedJobName = String(typeof jobName === 'object' ? jobName?.job || '' : jobName)
    .trim()
    .toLowerCase()
  return INDIVIDUAL_JOBS.some(job => job.toLowerCase() === normalizedJobName)
}

function getJobTitleTable(jobName = '') {
  return isIndividualJob(jobName) ? INDIVIDUAL_JOB_TITLES : JOB_TITLES
}

export function getJobTitleByPoints(points = 0, jobName = '') {
  const totalPoints = Number(points) || 0
  const titles = getJobTitleTable(jobName)
  const title = [...titles].reverse().find(entry => totalPoints >= Number(entry.points))
  return title?.title || titles[0].title
}

export function getJobTitleMultiplier(points = 0, jobName = '') {
  const totalPoints = Number(points) || 0
  const titles = getJobTitleTable(jobName)
  const title = [...titles].reverse().find(entry => totalPoints >= Number(entry.points))
  return Number(title?.multiplier ?? titles[0].multiplier ?? 1)
}

export const JOB_WORK_STORIES = Object.freeze([
  'Kamu datang tepat waktu, menyusun prioritas pekerjaan, dan menyelesaikan tugas harian dengan hasil memuaskan.',
  'Beberapa tugas terasa cukup berat hari ini, tetapi kamu tetap tenang dan berhasil menyelesaikannya satu per satu.',
  'Kamu bekerja dengan cekatan dan memastikan setiap tanggung jawab selesai sesuai target yang ditentukan.',
  'Hari kerja dimulai dengan jadwal yang padat, tetapi kamu mampu mengatur waktu dan menyelesaikan semuanya dengan baik.',
  'Kamu membantu rekan kerja menyelesaikan tugas yang tertunda, sehingga pekerjaan tim berjalan lebih lancar.',
  'Atasan memberikan tugas tambahan kepadamu, dan kamu berhasil menyelesaikannya tanpa mengabaikan tanggung jawab utama.',
  'Kamu memeriksa kembali hasil pekerjaan sebelum menyerahkannya untuk memastikan tidak ada kesalahan.',
  'Suasana kantor cukup sibuk, tetapi kamu tetap fokus dan tidak membiarkan pekerjaan menumpuk.',
  'Kamu berhasil mencapai target harian lebih cepat dari perkiraan dan menggunakan waktu tersisa untuk merapikan pekerjaan.',
  'Sebuah kendala muncul di tengah pekerjaan, tetapi kamu menemukan solusi dan melanjutkan tugas dengan lancar.',
  'Kamu berinisiatif membantu anggota tim yang kesulitan, membuat suasana kerja menjadi lebih produktif.',
  'Hari ini kamu mempelajari cara baru untuk menyelesaikan pekerjaan dengan lebih cepat dan efisien.',
  'Kamu membagi waktu dengan baik antara rapat, tugas utama, dan pekerjaan tambahan hingga semuanya terselesaikan.',
  'Meskipun merasa lelah, kamu tetap menjaga kualitas kerja dan menyelesaikan tanggung jawab sampai tuntas.',
  'Kamu menerima masukan dari atasan dan langsung memperbaiki bagian pekerjaan yang masih kurang tepat.',
  'Beberapa pekerjaan mendadak datang bersamaan, tetapi kamu berhasil menentukan prioritas dan menanganinya dengan baik.',
  'Kamu bekerja sama dengan rekan satu tim untuk menyelesaikan proyek yang hampir melewati batas waktu.',
  'Hari ini kemampuanmu dalam mengatur pekerjaan semakin baik, sehingga tugas terasa lebih terarah.',
  'Kamu menyelesaikan pekerjaan dengan teliti dan mendapatkan apresiasi atas hasil yang kamu berikan.',
  'Kamu memastikan seluruh dokumen dan laporan tersusun rapi sebelum mengakhiri jam kerja.',
  'Salah satu rekan kerja membutuhkan bantuan, dan kamu meluangkan waktu untuk membantunya tanpa mengabaikan tugas sendiri.',
  'Kamu menghadapi pekerjaan yang belum pernah dilakukan sebelumnya dan berhasil menyelesaikannya setelah mempelajari prosedurnya.',
  'Kamu menjaga konsistensi sepanjang hari dan berhasil memenuhi seluruh target yang diberikan.',
  'Setelah mengevaluasi hasil kerja kemarin, kamu menerapkan cara yang lebih efektif dan mendapatkan hasil yang lebih baik.',
  'Jam kerja berakhir dengan semua tugas utama terselesaikan. Kamu pulang dengan puas karena telah memberikan usaha terbaik.'
])

export const JOB_APPLY_STORIES = Object.freeze([
  'Kamu mengirimkan lamaran dengan CV yang sudah diperbarui dan berharap mendapatkan kesempatan untuk bergabung.',
  'Setelah menemukan lowongan yang sesuai, kamu menyiapkan dokumen persyaratan dan mengajukan lamaran.',
  'Kamu menyesuaikan portofolio dengan posisi yang dituju agar kemampuanmu lebih mudah dinilai oleh perekrut.',
  'Lamaranmu berhasil dikirim melalui situs rekrutmen perusahaan dan kini menunggu proses seleksi.',
  'Kamu membaca persyaratan pekerjaan dengan teliti sebelum memutuskan untuk mengajukan lamaran.',
  'Dengan penuh percaya diri, kamu mengirimkan CV dan surat lamaran kepada tim rekrutmen.',
  'Kamu melengkapi formulir pendaftaran kerja dan memastikan seluruh informasi yang diberikan sudah benar.',
  'Setelah mencari beberapa lowongan, kamu menemukan posisi yang cocok dengan pengalaman dan kemampuanmu.',
  'Kamu menyusun surat lamaran yang menjelaskan keahlian serta alasanmu tertarik bekerja di perusahaan tersebut.',
  'Lamaranmu telah diterima oleh sistem perusahaan dan masuk ke dalam daftar kandidat yang akan ditinjau.',
  'Kamu memperbarui riwayat pengalaman kerja agar perekrut mendapatkan gambaran yang lebih jelas tentang kemampuanmu.',
  'Sebelum mengirim lamaran, kamu memeriksa kembali seluruh dokumen agar tidak ada informasi penting yang terlewat.',
  'Kamu menemukan informasi lowongan dari situs karier dan segera menyiapkan persyaratan yang dibutuhkan.',
  'Kamu mengajukan lamaran untuk posisi yang menawarkan peluang pengembangan karier sesuai dengan tujuanmu.',
  'Portofolio yang telah kamu susun akhirnya dikirim bersama surat lamaran kepada perusahaan pilihanmu.',
  'Kamu mengisi data kandidat dengan lengkap dan menyelesaikan proses pendaftaran tanpa kendala.',
  'Setelah mempertimbangkan tanggung jawab serta kualifikasi pekerjaan, kamu memutuskan untuk mencoba melamar.',
  'Kamu menonjolkan pengalaman yang relevan dalam CV agar lamaranmu lebih sesuai dengan kebutuhan perusahaan.',
  'Tim rekrutmen menerima berkas lamaranmu dan akan melakukan peninjauan sesuai prosedur seleksi.',
  'Kamu mencari tahu profil perusahaan terlebih dahulu sebelum mengirimkan lamaran secara resmi.',
  'Dengan persiapan yang matang, kamu mengajukan diri untuk mengisi posisi yang sedang dibutuhkan perusahaan.',
  'Kamu menyertakan sertifikat keahlian dan pengalaman relevan sebagai pendukung berkas lamaran.',
  'Lowongan yang kamu incar masih dibuka, sehingga kamu segera mengirimkan dokumen sebelum batas pendaftaran berakhir.',
  'Kamu menyelesaikan proses pengajuan lamaran dan mulai mempersiapkan diri untuk kemungkinan mengikuti wawancara.',
  'Lamaran kerja berhasil terkirim. Kini kamu menunggu kabar dari perusahaan sambil mencari peluang lain yang menjanjikan.'
])

export const JOB_APPLY_REJECT_STORIES = Object.freeze([
  'Lamaranmu belum berhasil lolos seleksi. Perekrut memilih kandidat yang pengalamannya lebih sesuai dengan kebutuhan posisi.',
  'Perusahaan memutuskan untuk melanjutkan proses bersama kandidat lain. Kamu bisa memperbaiki CV sebelum mencoba kembali.',
  'Setelah meninjau berkasmu, tim rekrutmen menilai beberapa kualifikasi masih belum sesuai dengan persyaratan pekerjaan.',
  'Lamaranmu tidak dilanjutkan ke tahap berikutnya karena posisi tersebut membutuhkan pengalaman yang lebih spesifik.',
  'Kamu menerima pemberitahuan bahwa perusahaan belum dapat menawarkan posisi tersebut kepadamu.',
  'Persaingan kandidat cukup ketat, dan kali ini lamaranmu belum terpilih untuk melanjutkan proses seleksi.',
  'Perekrut menilai keterampilan yang dibutuhkan belum sepenuhnya tercantum dalam CV yang kamu kirimkan.',
  'Lamaranmu ditolak karena perusahaan mencari kandidat dengan latar belakang yang lebih sesuai dengan bidang pekerjaan.',
  'Posisi yang kamu inginkan akhirnya diberikan kepada kandidat lain yang lebih memenuhi kriteria seleksi.',
  'Tim rekrutmen menyampaikan bahwa pengalamanmu belum cukup untuk memenuhi kebutuhan posisi yang sedang dibuka.',
  'Kamu belum berhasil melewati seleksi administrasi karena terdapat persyaratan yang belum terpenuhi.',
  'Perusahaan memutuskan untuk menunda perekrutan posisi tersebut, sehingga lamaranmu tidak dapat diproses lebih lanjut.',
  'Setelah mengevaluasi seluruh kandidat, perekrut memilih pelamar lain yang dinilai lebih sesuai dengan tanggung jawab pekerjaan.',
  'Lamaranmu belum mendapatkan hasil yang diharapkan. Mungkin sudah waktunya memperkuat portofolio dan menambah pengalaman.',
  'Pihak perusahaan menginformasikan bahwa kualifikasi yang kamu miliki belum sesuai dengan kebutuhan tim saat ini.',
  'Kamu tidak terpilih untuk posisi tersebut karena perusahaan membutuhkan kemampuan teknis yang lebih mendalam.',
  'Seleksi awal belum berpihak kepadamu. Kamu dapat menjadikan pengalaman ini sebagai bahan evaluasi untuk lamaran berikutnya.',
  'Lamaranmu tidak dilanjutkan karena dokumen pendukung yang dibutuhkan belum lengkap saat proses pemeriksaan.',
  'Perusahaan mencari kandidat yang memiliki pengalaman lebih relevan dengan proyek yang akan segera dikerjakan.',
  'Kamu menerima kabar penolakan setelah proses peninjauan berkas selesai. Jangan berhenti mencari peluang yang sesuai.',
  'Perekrut menilai posisi yang kamu pilih belum sepenuhnya cocok dengan pengalaman dan keterampilan yang tercantum.',
  'Jumlah pelamar yang memenuhi syarat cukup banyak, dan perusahaan akhirnya memilih kandidat lain untuk posisi tersebut.',
  'Lamaranmu belum lolos karena beberapa kriteria utama pekerjaan belum terpenuhi. Kamu masih bisa meningkatkan kompetensi.',
  'Perusahaan mengubah kebutuhan rekrutmen dan memprioritaskan kandidat dengan spesialisasi yang berbeda.',
  'Kamu belum mendapatkan pekerjaan kali ini, tetapi evaluasi terhadap CV, portofolio, dan persiapanmu dapat membantu pada kesempatan berikutnya.'
])

export const JOB_TALK_STORIES = Object.freeze([
  '> Kamu: "Ada yang tahu prioritas pekerjaan kita hari ini?"\n> Rekan 1: "Kita selesaikan laporan dulu sebelum mengerjakan yang lain."\n> Rekan 2: "Aku sudah menyiapkan datanya, nanti bisa langsung kita periksa."\n> Kamu: "Oke, aku bantu merapikan laporannya supaya cepat selesai."',
  '> Kamu: "Bagian ini sepertinya butuh waktu lebih lama dari perkiraan."\n> Rekan 1: "Kalau dibagi, mungkin pekerjaan kita jadi lebih ringan."\n> Rekan 2: "Aku bisa mengambil bagian pemeriksaan datanya."\n> Kamu: "Terima kasih, aku lanjut mengerjakan bagian utamanya."',
  '> Kamu: "Aku ingin belajar lebih banyak tentang alur kerja tim ini."\n> Rekan 1: "Nanti aku tunjukkan prosedur yang biasa kita gunakan."\n> Rekan 2: "Kalau ada yang belum jelas, tanyakan saja."\n> Kamu: "Siap, aku akan mencatat langkah-langkah pentingnya."',
  '> Kamu: "Bagaimana perkembangan proyek yang sedang kita kerjakan?"\n> Rekan 1: "Sebagian besar sudah selesai, tinggal beberapa bagian lagi."\n> Rekan 2: "Aku sedang mengecek hasilnya sebelum diserahkan."\n> Kamu: "Baik, aku bantu menyelesaikan bagian yang masih tertunda."',
  '> Kamu: "Ada tugas yang bisa kubantu hari ini?"\n> Rekan 1: "Coba bantu periksa dokumen yang baru masuk."\n> Rekan 2: "Setelah itu, kita bisa menyusun laporan bersama."\n> Kamu: "Oke, aku kerjakan pemeriksaannya sekarang."',
  '> Kamu: "Sepertinya jadwal hari ini cukup padat."\n> Rekan 1: "Kita harus mengutamakan pekerjaan yang tenggatnya paling dekat."\n> Rekan 2: "Aku sudah menyusun daftar tugas berdasarkan prioritas."\n> Kamu: "Bagus, kita ikuti daftar itu agar tidak ada yang terlewat."',
  '> Kamu: "Aku menemukan kesalahan kecil dalam laporan ini."\n> Rekan 1: "Bagus kamu menyadarinya sebelum laporan dikirim."\n> Rekan 2: "Aku bantu periksa bagian lainnya supaya lebih aman."\n> Kamu: "Terima kasih, kita pastikan semuanya sudah benar."',
  '> Kamu: "Bagaimana cara paling efisien menyelesaikan tugas ini?"\n> Rekan 1: "Kita bisa menggunakan format laporan yang sudah tersedia."\n> Rekan 2: "Aku punya contoh dari pekerjaan sebelumnya."\n> Kamu: "Wah, itu membantu. Aku akan menggunakan contoh tersebut."',
  '> Kamu: "Besok kita harus menyerahkan hasil proyek ini."\n> Rekan 1: "Berarti hari ini kita perlu menyelesaikan bagian yang tersisa."\n> Rekan 2: "Aku akan membantu pemeriksaan akhir."\n> Kamu: "Aku fokus pada penyelesaian tugas agar semuanya tepat waktu."',
  '> Kamu: "Aku masih belum terbiasa dengan sistem kerja yang baru."\n> Rekan 1: "Tidak apa-apa, nanti kamu akan semakin terbiasa."\n> Rekan 2: "Aku bisa menjelaskan fitur yang sering kita gunakan."\n> Kamu: "Terima kasih, aku akan mencoba mempelajarinya."',
  '> Kamu: "Menurut kalian, apa yang bisa kita tingkatkan dari pekerjaan kemarin?"\n> Rekan 1: "Mungkin pembagian tugasnya bisa dibuat lebih jelas."\n> Rekan 2: "Kita juga bisa mengurangi waktu pemeriksaan dengan format standar."\n> Kamu: "Ide bagus, kita coba terapkan pada pekerjaan berikutnya."',
  '> Kamu: "Aku baru saja menyelesaikan bagian tugasku."\n> Rekan 1: "Bagus, sekarang kita bisa melanjutkan ke tahap berikutnya."\n> Rekan 2: "Aku akan mengecek apakah semua data sudah sesuai."\n> Kamu: "Silakan, aku siap membantu jika ada yang perlu diperbaiki."',
  '> Kamu: "Ada perubahan instruksi dari atasan tadi pagi."\n> Rekan 1: "Iya, beberapa bagian perlu disesuaikan dengan arahan baru."\n> Rekan 2: "Aku sudah memperbarui daftar pekerjaan kita."\n> Kamu: "Baik, aku akan menyesuaikan bagianku sesuai instruksi tersebut."',
  '> Kamu: "Aku ingin meminta masukan tentang hasil pekerjaanku."\n> Rekan 1: "Secara keseluruhan sudah baik, tinggal dirapikan sedikit."\n> Rekan 2: "Bagian penjelasannya bisa dibuat lebih jelas."\n> Kamu: "Terima kasih, aku akan memperbaikinya sekarang."',
  '> Kamu: "Rapat tadi menghasilkan beberapa tugas tambahan."\n> Rekan 1: "Kita perlu menentukan siapa yang bertanggung jawab untuk setiap tugas."\n> Rekan 2: "Aku bisa menangani dokumentasi hasil rapat."\n> Kamu: "Kalau begitu, aku akan mengurus tindak lanjut proyeknya."',
  '> Kamu: "Pekerjaan hari ini terasa lebih lancar dari biasanya."\n> Rekan 1: "Karena pembagian tugas kita sudah semakin teratur."\n> Rekan 2: "Komunikasi yang jelas juga sangat membantu."\n> Kamu: "Setuju, semoga kita bisa mempertahankan cara kerja ini."',
  '> Kamu: "Aku mendapat tugas baru yang belum pernah kukerjakan."\n> Rekan 1: "Kita pelajari instruksinya bersama sebelum mulai."\n> Rekan 2: "Aku akan membantu menjelaskan bagian yang lebih rumit."\n> Kamu: "Terima kasih, aku akan berusaha menyelesaikannya dengan baik."',
  '> Kamu: "Apakah semua kebutuhan proyek sudah tersedia?"\n> Rekan 1: "Sebagian besar sudah siap, tinggal menunggu beberapa dokumen."\n> Rekan 2: "Aku akan menghubungi bagian terkait untuk memastikannya."\n> Kamu: "Oke, sementara itu aku lanjut mengerjakan bagian yang tersedia."',
  '> Kamu: "Bagaimana kalau kita membuat daftar tugas bersama?"\n> Rekan 1: "Ide bagus, jadi setiap orang tahu tanggung jawabnya."\n> Rekan 2: "Kita juga bisa menambahkan batas waktu untuk tiap tugas."\n> Kamu: "Setuju, dengan begitu progres kita akan lebih mudah dipantau."',
  '> Kamu: "Aku merasa masih bisa meningkatkan produktivitas kerja."\n> Rekan 1: "Coba mulai dengan mengurangi gangguan saat mengerjakan tugas."\n> Rekan 2: "Membuat target kecil juga bisa membantu menjaga fokus."\n> Kamu: "Aku akan mencobanya mulai hari ini."',
  '> Kamu: "Apakah ada yang perlu diperbaiki sebelum laporan dikirim?"\n> Rekan 1: "Bagian kesimpulannya bisa dibuat lebih ringkas."\n> Rekan 2: "Angka-angkanya sudah sesuai dengan data terakhir."\n> Kamu: "Baik, aku rapikan kesimpulannya sebelum kita kirim."',
  '> Kamu: "Terima kasih sudah membantu menyelesaikan tugas tadi."\n> Rekan 1: "Sama-sama, kita memang perlu saling mendukung."\n> Rekan 2: "Kerja tim jadi lebih mudah kalau kita saling membantu."\n> Kamu: "Benar, semoga proyek selanjutnya juga berjalan lancar."',
  '> Kamu: "Aku ingin mencoba mengambil tanggung jawab yang lebih besar."\n> Rekan 1: "Mulailah dengan menunjukkan konsistensi pada tugas yang ada."\n> Rekan 2: "Kamu juga bisa menawarkan diri untuk membantu proyek baru."\n> Kamu: "Masuk akal, aku akan membuktikan kemampuanku secara bertahap."',
  '> Kamu: "Sepertinya ada perbedaan pendapat tentang cara mengerjakan tugas ini."\n> Rekan 1: "Mari kita bandingkan kelebihan setiap pendekatan."\n> Rekan 2: "Yang terpenting, kita pilih cara yang paling efektif."\n> Kamu: "Setuju, kita cari solusi terbaik tanpa memperpanjang masalah."',
  '> Kamu: "Akhirnya semua tugas utama hari ini selesai."\n> Rekan 1: "Kerja bagus, hasilnya juga sesuai dengan target."\n> Rekan 2: "Besok kita tinggal melanjutkan bagian berikutnya."\n> Kamu: "Mantap, terima kasih atas kerja sama kalian hari ini."'
])

export const JOB_PROMOTION_STORIES = Object.freeze([
  'Setelah berbulan-bulan menunjukkan kinerja yang konsisten, kamu mendapatkan pengakuan dari atasan dan dipercaya menduduki jabatan yang lebih tinggi.',
  'Kamu berhasil mencapai berbagai target penting dan melewati evaluasi dengan hasil memuaskan. Perusahaan akhirnya memberikan promosi.',
  'Kemampuanmu dalam menyelesaikan masalah membuat pekerjaan tim semakin efektif. Kontribusi tersebut menjadi salah satu alasan kenaikan jabatanmu.',
  'Atasan melihat perkembangan keterampilan dan kedisiplinanmu sejak pertama kali bergabung. Kini, tanggung jawab yang lebih besar menantimu.',
  'Ketekunanmu dalam menghadapi berbagai tantangan membuahkan hasil. Kamu resmi mendapatkan kesempatan untuk berkembang ke posisi berikutnya.',
  'Setelah berhasil memimpin beberapa tugas penting, kamu dinilai siap mengambil tanggung jawab yang lebih luas di perusahaan.',
  'Hasil evaluasi menunjukkan peningkatan kinerja yang signifikan. Perusahaan pun memberikan kepercayaan untuk menduduki jabatan baru.',
  'Kamu berhasil menyelesaikan proyek penting dengan hasil yang memuaskan dan mendapatkan promosi sebagai bentuk apresiasi atas kontribusimu.',
  'Rekan kerja dan atasan mengakui kemampuanmu dalam bekerja sama serta menjaga produktivitas. Kesempatan promosi akhirnya datang.',
  'Kedisiplinanmu dalam memenuhi tenggat waktu membuat atasan semakin percaya kepadamu. Hari ini, jabatanmu resmi meningkat.',
  'Kamu menunjukkan inisiatif dalam memperbaiki alur kerja tim. Usaha tersebut mendapat perhatian dan membawamu ke posisi yang lebih tinggi.',
  'Setelah melalui proses penilaian internal, perusahaan menetapkanmu sebagai kandidat yang layak menerima promosi jabatan.',
  'Pengalaman yang terus bertambah membuatmu semakin mampu menangani pekerjaan kompleks. Atasan pun mempercayakan posisi baru kepadamu.',
  'Kamu berhasil mempertahankan performa yang baik dalam berbagai situasi kerja. Konsistensi tersebut membuka jalan menuju jenjang karier berikutnya.',
  'Kontribusimu dalam membantu rekan kerja dan menyelesaikan target tim dinilai sangat positif. Kamu mendapatkan promosi yang telah lama diharapkan.',
  'Perusahaan sedang membutuhkan seseorang untuk mengisi posisi dengan tanggung jawab lebih besar, dan namamu menjadi pilihan yang tepat.',
  'Kamu berhasil melewati masa evaluasi dengan catatan kerja yang baik dan kini resmi naik ke tingkat jabatan selanjutnya.',
  'Keahlianmu dalam mengatur waktu, menyusun prioritas, dan menyelesaikan tugas membuat atasan yakin dengan kemampuanmu memegang posisi baru.',
  'Setelah menunjukkan perkembangan yang konsisten, kamu dipercaya untuk membantu mengoordinasikan pekerjaan dan mengambil keputusan yang lebih penting.',
  'Sebuah proyek yang kamu tangani berhasil mencapai hasil di atas harapan. Pencapaian itu memperkuat peluangmu untuk mendapatkan promosi.',
  'Kamu menerima apresiasi atas kemampuan beradaptasi dan kesediaan mempelajari keterampilan baru. Kini, kariermu melangkah ke tingkat berikutnya.',
  'Atasan menilai kamu telah siap menghadapi tantangan yang lebih besar setelah berhasil menyelesaikan sejumlah tanggung jawab tambahan.',
  'Kamu berhasil membangun komunikasi yang baik dengan berbagai tim dan meningkatkan kelancaran pekerjaan. Perusahaan menghargai kontribusi tersebut melalui promosi.',
  'Berkat pengalaman, kedisiplinan, dan hasil kerja yang terus membaik, kamu mendapatkan kesempatan untuk menempati posisi yang lebih strategis.',
  'Perjalanan kariermu mencapai tonggak baru. Kerja keras yang kamu tunjukkan selama ini akhirnya membawamu pada kenaikan jabatan.'
])

export const JOBS = Object.freeze([
  { job: 'Pemulung', lv: 1, gaji: 5000 },
  { job: 'Pengamen', lv: 2, gaji: 8000 },
  { job: 'Pembersih Jalan', lv: 3, gaji: 12000 },
  { job: 'Tukang Parkir Liar', lv: 4, gaji: 18000 },
  { job: 'Penjual Tissue', lv: 5, gaji: 25000 },
  { job: 'Karyawan Toko', lv: 6, gaji: 45000 },
  { job: 'Kasir Minimarket', lv: 7, gaji: 75000 },
  { job: 'Kurir', lv: 8, gaji: 112000 },
  { job: 'Driver Ojol', lv: 9, gaji: 157000 },
  { job: 'Satpam', lv: 10, gaji: 210000 },
  { job: 'Barista', lv: 11, gaji: 270000 },
  { job: 'Mekanik Bengkel', lv: 12, gaji: 337000 },
  { job: 'Badut', lv: 13, gaji: 412000 },
  { job: 'Koki', lv: 14, gaji: 495000 },
  { job: 'Tukang Cukur', lv: 15, gaji: 585000 },
  { job: 'Sales Promotion', lv: 16, gaji: 682000 },
  { job: 'Waiter Restoran', lv: 17, gaji: 787000 },
  { job: 'Operator Online Shop', lv: 18, gaji: 900000 },
  { job: 'Penjual Mainan', lv: 19, gaji: 950000 },
  { job: 'Tukang Jahit Kostum', lv: 19, gaji: 1020000 },
  { job: 'Tukang Parkir', lv: 20, gaji: 1147000 },
  { job: 'McD Crew', lv: 22, gaji: 1280000 },
  { job: 'Penjual Pop Ice', lv: 23, gaji: 1320000 },
  { job: 'Starbucks Barista', lv: 24, gaji: 1385000 },
  { job: 'Pedagang Kaki Lima', lv: 26, gaji: 1460000 },
  { job: 'Promotor Produk', lv: 27, gaji: 1500000 },
  { job: 'Promotor Judol', lv: 28, gaji: 1550000 },
  { job: 'Stuntman', lv: 29, gaji: 1600000 },
  { job: 'Operator Pabrik', lv: 30, gaji: 1650000 },
  { job: 'Penari Club', lv: 31, gaji: 1720000 },
  { job: 'Penghibur', lv: 32, gaji: 1770000 },
  { job: 'Guru Les Privat', lv: 33, gaji: 1800000 },
  { job: 'DJ Club', lv: 34, gaji: 1850000 },
  { job: 'Petugas Pemadam Kebakaran', lv: 35, gaji: 1900000 },
  { job: 'Rechesee Crew', lv: 38, gaji: 2100000 },
  { job: 'Ilmuwan', lv: 39, gaji: 2180000 },
  { job: 'Petugas Gudang', lv: 40, gaji: 2250000 },
  { job: 'Teller Bank', lv: 45, gaji: 2480000 },
  { job: 'Operator Kantor', lv: 50, gaji: 2700000 },
  { job: 'Pembawa Berita', lv: 55, gaji: 2900000 },
  { job: 'Desainer Grafis', lv: 60, gaji: 3150000 },
  { job: 'Video Editor', lv: 65, gaji: 3400000 },
  { job: 'Marketing', lv: 70, gaji: 3700000 },
  { job: 'Customer Service', lv: 75, gaji: 4000000 },
  { job: 'Guru', lv: 80, gaji: 4300000 },
  { job: 'Content Creator', lv: 85, gaji: 4600000 },
  { job: 'Streamer', lv: 87, gaji: 4900000 },
  { job: 'Cosplayer', lv: 88, gaji: 5100000 },
  { job: 'VTuber', lv: 89, gaji: 5300000 },
  { job: 'Recruiter', lv: 90, gaji: 5500000 },
  { job: 'Digital Marketing', lv: 95, gaji: 5900000 },
  { job: 'Supervisor', lv: 100, gaji: 6300000 },
  { job: 'Perawat', lv: 110, gaji: 6800000 },
  { job: 'Akuntan Junior', lv: 120, gaji: 7300000 },
  { job: 'Social Media Specialist', lv: 130, gaji: 7900000 },
  { job: 'UI/UX Designer', lv: 140, gaji: 8600000 },
  { job: 'Door Man Club', lv: 145, gaji: 9000000 },
  { job: 'Bartender', lv: 150, gaji: 9800000 },
  { job: 'Polisi', lv: 155, gaji: 10500000 },
  { job: 'Dosen', lv: 160, gaji: 11200000 },
  { job: 'Apoteker', lv: 170, gaji: 12000000 },
  { job: 'Web Developer', lv: 180, gaji: 13000000 },
  { job: 'Project Manager', lv: 190, gaji: 14200000 },
  { job: 'Tentara', lv: 200, gaji: 15500000 },
  { job: 'Dokter Umum', lv: 220, gaji: 17000000 },
  { job: 'Arsitek', lv: 240, gaji: 18800000 },
  { job: 'Event Organizer', lv: 260, gaji: 20600000 },
  { job: 'Akuntan', lv: 280, gaji: 22500000 },
  { job: 'Manager', lv: 300, gaji: 24500000 },
  { job: 'Pengacara', lv: 330, gaji: 27000000 },
  { job: 'Programmer Senior', lv: 360, gaji: 29600000 },
  { job: 'Penari Profesional', lv: 390, gaji: 32300000 },
  { job: 'Programmer', lv: 420, gaji: 35000000 },
  { job: 'Model Busana', lv: 450, gaji: 38000000 },
  { job: 'Konsultan', lv: 480, gaji: 41000000 },
  { job: 'Direktur', lv: 520, gaji: 45000000 },
  { job: 'Dokter Spesialis', lv: 550, gaji: 49000000 },
  { job: 'Pilot', lv: 600, gaji: 53500000 },
  { job: 'Hakim', lv: 650, gaji: 58000000 },
  { job: 'Selebgram', lv: 700, gaji: 63000000 },
  { job: 'Wirausaha UMKM', lv: 800, gaji: 70000000 },
  { job: 'Youtuber', lv: 900, gaji: 78000000 },
  { job: 'Gamer Profesional', lv: 1000, gaji: 86000000 },
  { job: 'Pemilik Franchise', lv: 1200, gaji: 95000000 },
  { job: 'Pengusaha Pabrik', lv: 1400, gaji: 104000000 },
  { job: 'Pengusaha Perusahaan', lv: 1600, gaji: 112000000 },
  { job: 'Selebriti TV', lv: 1800, gaji: 120000000 },
  { job: 'Gubernur', lv: 2000, gaji: 128000000 },
  { job: 'Menteri', lv: 2250, gaji: 136000000 },
  { job: 'Pengusaha', lv: 2500, gaji: 145000000 }
])

export function withJobExp(jobs = JOBS) {
  return jobs.map(job => ({ ...job, exp: Math.floor(job.gaji / 1000) }))
}

export function getUnlockedJobs(level = 1) {
  return withJobExp().filter(job => Number(level) >= Number(job.lv))
}

export function getJobByIdentifier(input, level = 1) {
  const text = String(input || '').trim()
  if (!text) return getUnlockedJobs(level).at(-1) || null
  const numericIndex = /^\d+$/.test(text) ? Number(text) - 1 : -1
  if (numericIndex >= 0) return withJobExp()[numericIndex] || null

  const normalized = text.toLowerCase()
  const legacyId = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return withJobExp().find(job => {
    const jobId = job.job.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return job.job.toLowerCase() === normalized || jobId === legacyId
  }) || null
}

export const JOB_GUIDE = Object.freeze([
  '.job -> lihat panduan sistem job',
  '.job guide -> lihat daftar command job',
  '.job list -> daftar pekerjaan dan syarat level',
  '.job info -> lihat pekerjaan aktif dan daftar yang tersedia',
  '.job profile -> lihat profil pekerjaan dan income',
  '.job performance -> lihat statistik kerja, absensi, talk, promosi',
  '.job work -> absen masuk kerja dan dapat gaji',
  '.job apply <nama/nomor> -> ajukan lamaran pekerjaan',
  'Untuk melamar pekerjaan tambahan, semua pekerjaan yang sudah dilamar harus mencapai jabatan Karyawan Tetap.',
  'Maksimal 5 pekerjaan berbeda; poin promosi dan jabatan dihitung terpisah untuk setiap pekerjaan.',
  'Jabatan memakai jalur JOB_TITLES untuk pekerjaan tim dan INDIVIDUAL_JOB_TITLES untuk pekerjaan individu.',
  '.job salary <nama/nomor> -> lihat gaji dan syarat level',
  '.job talk -> meningkatkan peluang promosi',
  '.job leave / cuti -> ambil cuti, gaji berhenti selama cuti',
  '.job return -> kembali dari cuti',
  '.job resign -> keluar dari pekerjaan saat ini',
  '.work -> alias kerja harian'
])
