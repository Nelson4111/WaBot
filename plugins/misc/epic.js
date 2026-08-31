import { loadDB, saveDB } from '../../lib/waifuHelper.js'

const EPIC_SAGAS = [
  { id: 'troy', name: 'The Troy Saga', detail: 'Perjalanan awal Odysseus dimulai dari perang Troya, tempat strategi, keberanian, dan pengorbanan diuji. Kemenangan yang diraih membawa konsekuensi besar, membuka jalan bagi perjalanan panjang penuh luka, kehilangan, dan keputusan yang akan menentukan nasibnya.' },
  { id: 'cyclops', name: 'The Cyclops Saga', detail: 'Odysseus dan krunya menghadapi Polyphemus, Cyclops bermata satu yang menjadi salah satu rintangan terbesar mereka. Sebuah pertemuan singkat berubah menjadi konflik besar yang membawa kemarahan para dewa dan mengubah arah perjalanan pulang.' },
  { id: 'ocean', name: 'The Ocean Saga', detail: 'Laut luas menjadi tempat penuh bahaya, badai, dan godaan yang menguji kemampuan Odysseus sebagai pemimpin. Setiap gelombang membawa ancaman baru, membuat kru harus memilih antara keberanian, kepercayaan, dan bertahan hidup.' },
  { id: 'circe', name: 'The Circe Saga', detail: 'Di pulau penuh sihir, Odysseus bertemu Circe dan menghadapi ujian yang tidak hanya mengandalkan kekuatan. Pilihan antara kenyamanan, kebenaran, dan tujuan utama menjadi tantangan yang harus ia hadapi.' },
  { id: 'underworld', name: 'The Underworld Saga', detail: 'Perjalanan menuju dunia bawah membawa Odysseus melihat masa lalu, kehilangan, dan kebenaran tersembunyi. Di antara dunia hidup dan mati, ia menemukan jawaban yang membantu menentukan langkah berikutnya.' },
  { id: 'thunder', name: 'The Thunder Saga', detail: 'Kekuatan para dewa mulai turun tangan ketika badai besar menghadang perjalanan Odysseus. Dengan ancaman dari langit dan keputusan yang berat, ia harus membayar harga untuk tetap melanjutkan perjalanan.' },
  { id: 'wisdom', name: 'The Wisdom Saga', detail: 'Ketika kekuatan tidak lagi cukup, kecerdikan menjadi senjata utama Odysseus. Strategi, pengalaman, dan kebijaksanaan diuji dalam menghadapi musuh serta tantangan yang semakin sulit.' },
  { id: 'vengeance', name: 'The Vengeance Saga', detail: 'Rasa kehilangan dan penderitaan yang terkumpul berubah menjadi keinginan untuk membalas. Namun jalan balas dendam membawa pertanyaan besar tentang harga kemenangan dan siapa dirinya sebenarnya.' },
  { id: 'ithaca', name: 'The Ithaca Saga', detail: 'Setelah bertahun-tahun melewati perang, monster, dan badai, Odysseus akhirnya kembali mendekati rumahnya. Namun Ithaca membawa ujian terakhir berupa masa lalu, keluarga, dan keputusan yang menentukan akhir perjalanannya.' }
]

const EPIC_SONGS = [
  { id: 'the-horse-and-the-infant', name: 'The Horse and the Infant', saga: 'The Troy Saga', detail: 'Awal perjalanan Odysseus setelah perang Troya, ketika kemenangan besar masih dibayangi oleh keputusan berat, rasa bersalah, dan kenyataan bahwa setiap tindakan di medan perang memiliki konsekuensi yang panjang.' },
  { id: 'just-a-man', name: 'Just a Man', saga: 'The Troy Saga', detail: 'Odysseus menghadapi konflik batin sebagai manusia biasa yang harus mengambil keputusan mustahil. Di antara kewajiban, belas kasih, dan keinginan untuk tetap menjadi dirinya sendiri, ia mulai memahami harga dari kepemimpinan.' },
  { id: 'full-speed-ahead', name: 'Full Speed Ahead', saga: 'The Cyclops Saga', detail: 'Perjalanan meninggalkan medan perang dimulai ketika Odysseus dan krunya berlayar menuju rumah yang mereka rindukan. Namun di balik semangat untuk pulang, tersembunyi ketakutan terhadap bahaya yang belum mereka kenal.' },
  { id: 'open-arms', name: 'Open Arms', saga: 'The Cyclops Saga', detail: 'Polites mengingatkan bahwa tidak semua masalah harus diselesaikan dengan kekerasan. Sebuah pandangan tentang harapan, kebaikan hati, dan bagaimana empati dapat menjadi kekuatan di tengah dunia yang kejam.' },
  { id: 'warrior-of-the-mind', name: 'Warrior of the Mind', saga: 'The Wisdom Saga', detail: 'Hubungan antara Athena dan Odysseus menunjukkan bahwa kemenangan tidak selalu berasal dari kekuatan fisik. Kecerdikan, strategi, dan kemampuan membaca situasi menjadi senjata utama seorang pahlawan.' },
  { id: 'polyphemus', name: 'Polyphemus', saga: 'The Cyclops Saga', detail: 'Pertemuan dengan Cyclops bermata satu membawa Odysseus dan kru ke dalam situasi penuh bahaya. Sebuah kesalahan kecil berubah menjadi konflik besar yang mengundang kemarahan dan kutukan.' },
  { id: 'survive', name: 'Survive', saga: 'The Cyclops Saga', detail: 'Saat menghadapi musuh yang jauh lebih kuat, Odysseus dan krunya hanya memiliki satu tujuan: bertahan hidup. Lagu ini menggambarkan perjuangan, ketakutan, dan keputusan cepat di tengah ancaman.' },
  { id: 'remember-them', name: 'Remember Them', saga: 'The Cyclops Saga', detail: 'Sebuah pengingat bahwa perjalanan pulang tidak hanya tentang mencapai tujuan, tetapi juga tentang mengingat mereka yang telah berkorban dan kehilangan nyawa di sepanjang jalan.' },
  { id: 'my-goodbye', name: 'My Goodbye', saga: 'The Cyclops Saga', detail: 'Perpisahan yang membawa perubahan besar dalam hubungan Athena dan Odysseus. Sebuah momen ketika perbedaan pandangan membuat keduanya harus berjalan melalui jalan masing-masing.' },
  { id: 'storm', name: 'Storm', saga: 'The Ocean Saga', detail: 'Laut menunjukkan sisi paling kejamnya ketika badai menghadang perjalanan Odysseus. Setiap gelombang menjadi ujian baru bagi kemampuan pemimpin dalam menjaga krunya tetap bertahan.' },
  { id: 'luck-runs-out', name: 'Luck Runs Out', saga: 'The Ocean Saga', detail: 'Ketika keberuntungan mulai meninggalkan mereka, kru mulai mempertanyakan keputusan yang telah dibuat. Rasa takut, keraguan, dan tekanan perlahan menguji kepercayaan satu sama lain.' },
  { id: 'keep-your-friends-close', name: 'Keep Your Friends Close', saga: 'The Ocean Saga', detail: 'Perjalanan di laut membuat hubungan antar kru semakin diuji. Kepercayaan menjadi hal yang sulit dipertahankan ketika setiap keputusan membawa risiko kehilangan segalanya.' },
  { id: 'ruthlessness', name: 'Ruthlessness', saga: 'The Ocean Saga', detail: 'Poseidon menunjukkan bahwa belas kasihan bukan selalu pilihan dalam dunia para dewa. Sebuah gambaran tentang kemarahan, balas dendam, dan konsekuensi dari tindakan manusia.' },
  { id: 'puppeteer', name: 'Puppeteer', saga: 'The Circe Saga', detail: 'Odysseus menghadapi Circe, seorang penyihir yang mampu mengubah manusia menjadi sesuatu yang lain. Pertarungan ini bukan hanya tentang kekuatan, tetapi juga kehendak untuk menyelamatkan orang lain.' },
  { id: 'wouldnt-you-like', name: "Wouldn't You Like", saga: 'The Circe Saga', detail: 'Hermes muncul membawa bantuan dan kesempatan bagi Odysseus untuk menghadapi ancaman Circe. Sebuah pertemuan yang penuh trik, keberanian, dan sedikit keberuntungan.' },
  { id: 'done-for', name: 'Done For', saga: 'The Circe Saga', detail: 'Pertarungan antara Odysseus dan Circe menjadi bentrokan dua kehendak yang kuat. Tidak ada pihak yang ingin menyerah, membuat konflik berubah menjadi permainan strategi dan tekad.' },
  { id: 'there-are-other-ways', name: 'There Are Other Ways', saga: 'The Circe Saga', detail: 'Sebuah pendekatan berbeda yang menunjukkan bahwa kemenangan tidak selalu harus diraih melalui kekerasan. Terkadang solusi terbaik datang dari memahami lawan.' },
  { id: 'the-underworld', name: 'The Underworld', saga: 'The Underworld Saga', detail: 'Odysseus memasuki dunia orang mati untuk mencari jawaban yang tidak dapat ditemukan di dunia manusia. Di sana ia bertemu masa lalu, kehilangan, dan kebenaran yang tersembunyi.' },
  { id: 'no-longer-you', name: 'No Longer You', saga: 'The Underworld Saga', detail: 'Sebuah ramalan yang memperlihatkan perubahan besar dalam diri Odysseus. Perjalanan panjang telah mengubah dirinya menjadi seseorang yang berbeda dari sebelumnya.' },
  { id: 'monster', name: 'Monster', saga: 'The Underworld Saga', detail: 'Odysseus mulai mempertanyakan batas antara pahlawan dan monster. Semua keputusan yang telah ia buat membawa pertanyaan tentang siapa dirinya sebenarnya.' },
  { id: 'suffering', name: 'Suffering', saga: 'The Thunder Saga', detail: 'Rasa sakit dan kehilangan menjadi bagian dari perjalanan ketika Odysseus menghadapi kenyataan pahit. Namun di tengah penderitaan, masih ada alasan untuk terus bertahan.' },
  { id: 'different-beast', name: 'Different Beast', saga: 'The Thunder Saga', detail: 'Odysseus menyadari bahwa terkadang monster terbesar bukan berasal dari luar, melainkan perubahan dalam dirinya sendiri setelah melewati banyak tragedi.' },
  { id: 'scylla', name: 'Scylla', saga: 'The Thunder Saga', detail: 'Menghadapi monster laut Scylla, Odysseus harus membuat keputusan yang menyakitkan demi menyelamatkan perjalanan. Sebuah ujian tentang pengorbanan dan harga seorang pemimpin.' },
  { id: 'love-in-paradise', name: 'Love in Paradise', saga: 'The Wisdom Saga', detail: 'Sebuah kisah tentang godaan tempat yang indah namun membuat seseorang terjebak. Odysseus harus memilih antara kenyamanan sementara dan tujuan yang selalu ia perjuangkan.' },
  { id: 'god-games', name: 'God Games', saga: 'The Wisdom Saga', detail: 'Athena menghadapi para dewa Olympus dalam sebuah ujian besar untuk membuktikan nilai, keyakinan, dan alasan mengapa Odysseus pantas mendapatkan kesempatan pulang.' },
  { id: 'not-sorry-for-loving-you', name: 'Not Sorry For Loving You', saga: 'The Vengeance Saga', detail: 'Sebuah gambaran tentang cinta yang tetap bertahan meski dipisahkan oleh waktu, jarak, dan penderitaan. Perasaan yang tulus menjadi pengingat bahwa ada hal yang tidak dapat dihancurkan oleh perjalanan panjang.' },
  { id: 'dangerous', name: 'Dangerous', saga: 'The Vengeance Saga', detail: 'Odysseus kembali menghadapi ancaman yang tidak dapat diprediksi. Setiap langkah menjadi lebih berbahaya ketika musuh, keadaan, dan keputusan masa lalu mulai mengejar dirinya.' },
  { id: 'charybdis', name: 'Charybdis', saga: 'The Vengeance Saga', detail: 'Menghadapi pusaran laut yang mematikan, Odysseus harus memilih antara risiko besar atau kehilangan segalanya. Sebuah ujian tentang keberanian, ketahanan, dan kemampuan menghadapi keadaan tanpa jalan keluar.' },
  { id: 'get-in-the-water', name: 'Get in the Water', saga: 'The Vengeance Saga', detail: 'Sebuah momen ketika ancaman datang secara langsung dan tidak ada lagi tempat untuk bersembunyi. Odysseus dipaksa menghadapi kenyataan bahwa beberapa pertarungan tidak dapat dihindari.' },
  { id: 'six-hundred-strike', name: 'Six Hundred Strike', saga: 'The Vengeance Saga', detail: 'Ledakan emosi dari perjalanan panjang yang dipenuhi kehilangan dan kemarahan. Semua luka yang terkumpul berubah menjadi kekuatan untuk menghadapi musuh terakhir yang menghalangi jalan pulang.' },
  { id: 'mutiny', name: 'Mutiny', saga: 'The Thunder Saga', detail: 'Kepercayaan dalam kru mulai runtuh ketika rasa takut dan keputusan sulit menciptakan perpecahan. Sebuah konflik internal yang menguji kepemimpinan Odysseus dan kesetiaan orang-orang di sekitarnya.' },
  { id: 'thunder-bringer', name: 'Thunder Bringer', saga: 'The Thunder Saga', detail: 'Zeus memberikan keputusan terakhir dengan kekuatan petirnya. Sebuah penghakiman dari langit yang menentukan nasib para pelaut dan memperlihatkan betapa kecilnya manusia di hadapan para dewa.' },
  { id: 'legendary', name: 'Legendary', saga: 'The Wisdom Saga', detail: 'Telemachus mulai menemukan keberanian dan identitasnya sendiri. Di tengah bayang-bayang nama besar ayahnya, ia berusaha membuktikan bahwa dirinya juga mampu berdiri sebagai pahlawan.' },
  { id: 'little-wolf', name: 'Little Wolf', saga: 'The Wisdom Saga', detail: 'Sebuah perjalanan kedewasaan bagi Telemachus yang harus menghadapi ancaman sebelum waktunya. Keberanian kecil perlahan tumbuh menjadi kekuatan untuk melindungi apa yang ia cintai.' },
  { id: 'well-be-fine', name: "We'll Be Fine", saga: 'The Wisdom Saga', detail: 'Harapan tetap bertahan meski keluarga terpisah oleh keadaan. Sebuah pengingat bahwa ikatan dan kepercayaan dapat menjadi cahaya ketika semuanya terasa tidak pasti.' },
  { id: 'would-you-fall-in-love-with-me-again', name: 'Would You Fall in Love with Me Again', saga: 'The Ithaca Saga', detail: 'Sebuah pertanyaan tentang apakah cinta masih dapat bertahan setelah seseorang berubah karena perjalanan panjang. Penelope dan Odysseus menghadapi kenyataan bahwa waktu telah mengubah banyak hal.' },
  { id: 'the-challenge', name: 'The Challenge', saga: 'The Ithaca Saga', detail: 'Odysseus akhirnya kembali ke tanah kelahirannya dan menghadapi ujian terakhir. Sebuah tantangan yang menentukan apakah ia masih memiliki tempat di rumah yang selama ini ia perjuangkan.' },
  { id: 'hold-them-down', name: 'Hold Them Down', saga: 'The Ithaca Saga', detail: 'Konflik di istana mencapai puncaknya ketika masa lalu bertemu dengan masa kini. Pertarungan terakhir menentukan nasib Ithaca dan siapa yang berhak memegang kendali.' },
  { id: 'odysseus-song', name: 'Odysseus', saga: 'The Ithaca Saga', detail: 'Sebuah penegasan tentang perjalanan panjang seorang manusia yang melewati perang, monster, dewa, dan kehilangan. Odysseus akhirnya berdiri sebagai sosok yang dibentuk oleh semua pengalaman yang ia lalui.' },
  { id: 'wonder', name: "I Can't Help But Wonder", saga: 'The Ithaca Saga', detail: 'Sebuah momen refleksi setelah seluruh perjalanan berakhir. Pertanyaan tentang pilihan, kehilangan, cinta, dan arti sebuah rumah menjadi penutup dari kisah panjang Odysseus.' }
]

const EPIC_QUIZZES = [
  { question: 'Siapa raja Ithaca yang menjadi tokoh utama dalam EPIC?', options: ['Achilles', 'Odysseus', 'Hector', 'Perseus'], answer: 2, detail: 'Odysseus adalah raja Ithaca yang melakukan perjalanan panjang setelah Perang Troya.' },
  { question: 'Siapa dewi kebijaksanaan yang membantu Odysseus?', options: ['Athena', 'Hera', 'Aphrodite', 'Artemis'], answer: 1, detail: 'Athena dikenal sebagai dewi kebijaksanaan dan strategi perang.' },
  { question: 'Siapa dewa laut yang menjadi musuh besar Odysseus?', options: ['Zeus', 'Apollo', 'Poseidon', 'Ares'], answer: 3, detail: 'Poseidon menyimpan dendam kepada Odysseus setelah kejadian dengan Polyphemus.' },
  { question: 'Siapa putra Odysseus dan Penelope?', options: ['Telemachus', 'Orpheus', 'Achilles', 'Paris'], answer: 1, detail: 'Telemachus adalah anak Odysseus yang menunggu kepulangan ayahnya.' },
  { question: 'Siapa istri Odysseus yang setia menunggunya?', options: ['Circe', 'Calypso', 'Penelope', 'Helen'], answer: 3, detail: 'Penelope menunggu Odysseus selama dua puluh tahun.' },
  { question: 'Siapa Cyclops yang ditemui Odysseus?', options: ['Polyphemus', 'Minotaur', 'Cerberus', 'Scylla'], answer: 1, detail: 'Polyphemus adalah Cyclops bermata satu yang menjadi anak Poseidon.' },
  { question: 'Siapa penyihir yang mengubah kru Odysseus?', options: ['Circe', 'Hera', 'Nyx', 'Eris'], answer: 1, detail: 'Circe menggunakan sihir untuk mengubah kru Odysseus menjadi hewan.' },
  { question: 'Siapa dewa pembawa pesan yang membantu Odysseus?', options: ['Hermes', 'Hades', 'Ares', 'Helios'], answer: 1, detail: 'Hermes adalah utusan para dewa dalam mitologi Yunani.' },
  { question: 'Siapa penguasa dunia bawah dalam mitologi Yunani?', options: ['Hades', 'Zeus', 'Poseidon', 'Apollo'], answer: 1, detail: 'Hades menguasai dunia bawah dan para jiwa yang telah meninggal.' },
  { question: 'Siapa ratu dunia bawah yang menjadi pasangan Hades?', options: ['Persephone', 'Demeter', 'Hestia', 'Hera'], answer: 1, detail: 'Persephone adalah ratu dunia bawah dalam mitologi Yunani.' },

  { question: 'Siapa raja para dewa Olympus?', options: ['Poseidon', 'Zeus', 'Ares', 'Hermes'], answer: 2, detail: 'Zeus adalah pemimpin para dewa Olympus.' },
  { question: 'Siapa dewi cinta dan kecantikan?', options: ['Athena', 'Artemis', 'Aphrodite', 'Hera'], answer: 3, detail: 'Aphrodite dikenal sebagai dewi cinta dan kecantikan.' },
  { question: 'Siapa dewa perang dalam mitologi Yunani?', options: ['Ares', 'Apollo', 'Hermes', 'Dionysus'], answer: 1, detail: 'Ares melambangkan sisi brutal dari peperangan.' },
  { question: 'Siapa dewa cahaya dan musik?', options: ['Apollo', 'Helios', 'Hades', 'Hephaestus'], answer: 1, detail: 'Apollo dikenal sebagai dewa musik, cahaya, dan ramalan.' },
  { question: 'Siapa dewa pandai besi Olympus?', options: ['Hephaestus', 'Hermes', 'Ares', 'Pan'], answer: 1, detail: 'Hephaestus adalah pembuat senjata dan benda ilahi.' },
  { question: 'Siapa dewi pernikahan dan ratu Olympus?', options: ['Hera', 'Athena', 'Nike', 'Iris'], answer: 1, detail: 'Hera adalah istri Zeus dan ratu para dewa.' },
  { question: 'Siapa dewi yang dikenal sebagai simbol perselisihan?', options: ['Eris', 'Hestia', 'Selene', 'Themis'], answer: 1, detail: 'Eris adalah dewi perselisihan dan kekacauan.' },
  { question: 'Siapa monster penjaga gerbang dunia bawah?', options: ['Scylla', 'Cerberus', 'Hydra', 'Cyclops'], answer: 2, detail: 'Cerberus adalah anjing berkepala tiga penjaga dunia bawah.' },
  { question: 'Siapa monster laut berkepala enam yang dihadapi Odysseus?', options: ['Charybdis', 'Scylla', 'Medusa', 'Siren'], answer: 2, detail: 'Scylla adalah monster laut yang menghadang kapal Odysseus.' },
  { question: 'Siapa makhluk laut berupa pusaran besar?', options: ['Charybdis', 'Scylla', 'Kraken', 'Hydra'], answer: 1, detail: 'Charybdis dikenal sebagai pusaran laut mematikan.' },

  { question: 'Siapa dewi yang membawa musim semi?', options: ['Persephone', 'Athena', 'Artemis', 'Hera'], answer: 1, detail: 'Persephone memiliki hubungan dengan siklus musim.' },
  { question: 'Siapa dewa matahari dalam mitologi Yunani?', options: ['Apollo', 'Helios', 'Zeus', 'Eros'], answer: 2, detail: 'Helios adalah personifikasi matahari.' },
  { question: 'Siapa dewi berburu?', options: ['Artemis', 'Aphrodite', 'Demeter', 'Hera'], answer: 1, detail: 'Artemis adalah dewi berburu dan bulan.' },
  { question: 'Siapa dewi pertanian dan panen?', options: ['Demeter', 'Athena', 'Nyx', 'Hestia'], answer: 1, detail: 'Demeter menguasai pertanian dan kesuburan bumi.' },
  { question: 'Siapa dewi rumah dan perapian?', options: ['Hestia', 'Hera', 'Nike', 'Iris'], answer: 1, detail: 'Hestia adalah dewi perapian dan rumah.' },
  { question: 'Siapa dewa tidur?', options: ['Hypnos', 'Thanatos', 'Morpheus', 'Pan'], answer: 1, detail: 'Hypnos adalah personifikasi tidur dalam mitologi Yunani.' },
  { question: 'Siapa dewa kematian yang damai?', options: ['Thanatos', 'Hades', 'Ares', 'Erebus'], answer: 1, detail: 'Thanatos melambangkan kematian yang tenang.' },
  { question: 'Siapa dewa mimpi?', options: ['Morpheus', 'Apollo', 'Hypnos', 'Hermes'], answer: 1, detail: 'Morpheus dikenal sebagai dewa mimpi.' },
  { question: 'Siapa dewi kemenangan?', options: ['Nike', 'Eris', 'Iris', 'Tyche'], answer: 1, detail: 'Nike adalah personifikasi kemenangan.' },
  { question: 'Siapa dewi pelangi dan pembawa pesan?', options: ['Iris', 'Athena', 'Hera', 'Selene'], answer: 1, detail: 'Iris adalah pembawa pesan para dewa dalam beberapa mitos.' },
  { question: 'Siapa pahlawan Yunani yang terkenal dalam Perang Troya?', options: ['Achilles', 'Odysseus', 'Theseus', 'Heracles'], answer: 1, detail: 'Achilles adalah salah satu pejuang terkuat Yunani dalam Perang Troya.' },
  { question: 'Siapa pangeran Troya yang menjadi penyebab awal Perang Troya?', options: ['Hector', 'Paris', 'Priam', 'Aeneas'], answer: 2, detail: 'Paris membawa Helen ke Troya yang memicu perang besar antara Yunani dan Troya.' },
  { question: 'Siapa prajurit Troya yang merupakan kakak Paris?', options: ['Hector', 'Ajax', 'Menelaus', 'Agamemnon'], answer: 1, detail: 'Hector adalah pahlawan besar Troya dan putra Raja Priam.' },
  { question: 'Siapa raja Mycenae yang memimpin pasukan Yunani dalam Perang Troya?', options: ['Agamemnon', 'Menelaus', 'Odysseus', 'Nestor'], answer: 1, detail: 'Agamemnon menjadi pemimpin utama pasukan Yunani dalam perang Troya.' },
  { question: 'Siapa suami Helen yang meminta bantuan untuk merebut kembali istrinya?', options: ['Menelaus', 'Paris', 'Achilles', 'Hector'], answer: 1, detail: 'Menelaus adalah raja Sparta dan suami Helen.' },
  { question: 'Siapa dewi yang memberikan kutukan kepada kapal Odysseus?', options: ['Poseidon', 'Athena', 'Hera', 'Artemis'], answer: 1, detail: 'Dalam perjalanan, Poseidon menjadi salah satu penghalang terbesar Odysseus.' },
  { question: 'Siapa makhluk yang menggoda pelaut dengan nyanyian mematikan?', options: ['Sirens', 'Cyclops', 'Sphinx', 'Harpy'], answer: 1, detail: 'Sirens dikenal karena suara mereka yang mampu membuat pelaut kehilangan arah.' },
  { question: 'Siapa makhluk setengah manusia setengah burung dalam mitologi Yunani?', options: ['Harpy', 'Siren', 'Nymph', 'Gorgon'], answer: 1, detail: 'Harpy adalah makhluk bersayap dengan wujud campuran manusia dan burung.' },
  { question: 'Siapa monster dengan rambut ular yang tatapannya dapat mengubah orang menjadi batu?', options: ['Medusa', 'Scylla', 'Circe', 'Sphinx'], answer: 1, detail: 'Medusa adalah Gorgon yang memiliki kemampuan mengubah manusia menjadi batu.' },
  { question: 'Siapa monster berkepala banyak yang terkenal dalam mitologi Yunani?', options: ['Hydra', 'Cyclops', 'Minotaur', 'Cerberus'], answer: 1, detail: 'Hydra adalah monster ular berkepala banyak yang terkenal dalam kisah Heracles.' },

  { question: 'Siapa makhluk setengah manusia setengah banteng?', options: ['Minotaur', 'Cyclops', 'Centaur', 'Satyr'], answer: 1, detail: 'Minotaur adalah monster yang tinggal di labirin Kreta.' },
  { question: 'Siapa makhluk setengah manusia setengah kuda?', options: ['Centaur', 'Satyr', 'Minotaur', 'Harpy'], answer: 1, detail: 'Centaur memiliki tubuh manusia dengan bagian bawah seperti kuda.' },
  { question: 'Siapa makhluk hutan dengan kaki kambing dalam mitologi Yunani?', options: ['Satyr', 'Nymph', 'Centaur', 'Siren'], answer: 1, detail: 'Satyr adalah makhluk alam yang sering dikaitkan dengan musik dan pesta.' },
  { question: 'Siapa dewa angin yang sering dikaitkan dengan badai?', options: ['Aeolus', 'Helios', 'Apollo', 'Hermes'], answer: 1, detail: 'Aeolus dikenal sebagai penjaga atau penguasa angin dalam kisah Odyssey.' },
  { question: 'Siapa nimfa yang menahan Odysseus di pulaunya?', options: ['Calypso', 'Circe', 'Nausicaa', 'Penelope'], answer: 1, detail: 'Calypso menahan Odysseus selama bertahun-tahun di pulaunya.' },
  { question: 'Siapa putri Raja Alcinous yang membantu Odysseus?', options: ['Nausicaa', 'Helen', 'Ariadne', 'Andromache'], answer: 1, detail: 'Nausicaa membantu Odysseus setelah ia terdampar di tanah Phaeacians.' },
  { question: 'Siapa raja Phaeacians yang membantu Odysseus?', options: ['Alcinous', 'Priam', 'Nestor', 'Laertes'], answer: 1, detail: 'Alcinous memberikan bantuan kepada Odysseus untuk kembali pulang.' },
  { question: 'Siapa ayah Odysseus?', options: ['Laertes', 'Priam', 'Zeus', 'Nestor'], answer: 1, detail: 'Laertes adalah ayah Odysseus dalam mitologi Yunani.' },
  { question: 'Siapa ibu Odysseus?', options: ['Anticlea', 'Penelope', 'Athena', 'Hera'], answer: 1, detail: 'Anticlea adalah ibu Odysseus.' },
  { question: 'Siapa dewi malam dalam mitologi Yunani?', options: ['Nyx', 'Selene', 'Eris', 'Hecate'], answer: 1, detail: 'Nyx adalah personifikasi malam dan salah satu dewa primordial Yunani.' }
]

const EPIC_GUESSES = [
  // === ANSWER 0 (1-25) ===

  { prompt: 'Siapakah tokoh utama dalam EPIC: The Musical?', options: ['Odysseus', 'Achilles'], answer: 0 },
  { prompt: 'Tujuan utama perjalanan panjang Odysseus adalah kembali ke...', options: ['Ithaca', 'Olympus'], answer: 0 },
  { prompt: 'Dewi yang menjadi mentor Odysseus sejak muda adalah...', options: ['Athena', 'Hera'], answer: 0 },
  { prompt: 'Nama anak Odysseus dan Penelope adalah...', options: ['Telemachus', 'Perseus'], answer: 0 },
  { prompt: 'Monster bermata satu yang dilawan Odysseus adalah...', options: ['Polyphemus', 'Cerberus'], answer: 0 },

  { prompt: 'Dewa yang menguasai lautan dalam cerita EPIC adalah...', options: ['Poseidon', 'Apollo'], answer: 0 },
  { prompt: 'Makhluk yang menggunakan suara indah untuk menarik pelaut disebut...', options: ['Sirens', 'Titans'], answer: 0 },
  { prompt: 'Penyihir yang ditemui Odysseus dalam perjalanan adalah...', options: ['Circe', 'Aphrodite'], answer: 0 },
  { prompt: 'Nama kapal Odysseus secara umum dikenal sebagai kapal menuju...', options: ['Ithaca', 'Atlantis'], answer: 0 },
  { prompt: 'Perang besar sebelum perjalanan Odysseus adalah...', options: ['Perang Troya', 'Perang Titan'], answer: 0 },

  { prompt: 'Kekuatan terbesar Odysseus yang sering ditonjolkan adalah...', options: ['Kecerdikan', 'Kekuatan fisik'], answer: 0 },
  { prompt: 'Istri Odysseus yang menunggunya pulang adalah...', options: ['Penelope', 'Calypso'], answer: 0 },
  { prompt: 'Dewa pembawa pesan yang membantu Odysseus adalah...', options: ['Hermes', 'Ares'], answer: 0 },
  { prompt: 'Raja para dewa Olympus adalah...', options: ['Zeus', 'Hades'], answer: 0 },
  { prompt: 'Makhluk berkepala tiga penjaga dunia bawah adalah...', options: ['Cerberus', 'Minotaur'], answer: 0 },

  { prompt: 'Saga yang menceritakan awal perjalanan Odysseus setelah perang adalah...', options: ['Troy Saga', 'Ithaca Saga'], answer: 0 },
  { prompt: 'Pertemuan dengan Polyphemus terjadi pada...', options: ['Cyclops Saga', 'Thunder Saga'], answer: 0 },
  { prompt: 'Konflik dengan Circe berada dalam...', options: ['Circe Saga', 'Wisdom Saga'], answer: 0 },
  { prompt: 'Cerita tentang dunia bawah terdapat dalam...', options: ['Underworld Saga', 'Ocean Saga'], answer: 0 },
  { prompt: 'Tokoh yang menjadi pusat konflik God Games adalah...', options: ['Athena', 'Poseidon'], answer: 0 },

  { prompt: 'Jumlah lagu dalam EPIC: The Musical adalah...', options: ['40 lagu', '30 lagu'], answer: 0 },
  { prompt: 'Pencipta EPIC: The Musical adalah...', options: ['Jorge Rivera-Herrans', 'Andrew Lloyd Webber'], answer: 0 },
  { prompt: 'Tema utama perjalanan Odysseus adalah...', options: ['Pulang ke rumah', 'Menjadi dewa baru'], answer: 0 },
  { prompt: 'Scylla dikenal sebagai...', options: ['Monster laut', 'Dewi perang'], answer: 0 },
  { prompt: 'Dalam fan-made story, karakter baru biasanya berfungsi sebagai...', options: ['Sekutu atau musuh baru', 'Penghapus semua konflik'], answer: 0 },


  // === ANSWER 1 (26-50) ===

  { prompt: 'Siapakah yang menjadi lawan besar Odysseus setelah kejadian Cyclops?', options: ['Zeus', 'Poseidon'], answer: 1 },
  { prompt: 'Siapakah pasangan Odysseus yang setia menunggu di Ithaca?', options: ['Circe', 'Penelope'], answer: 1 },
  { prompt: 'Makhluk yang dikenal sebagai penjaga dunia bawah adalah...', options: ['Hydra', 'Cerberus'], answer: 1 },
  { prompt: 'Siapakah pencipta EPIC: The Musical?', options: ['Lin-Manuel Miranda', 'Jorge Rivera-Herrans'], answer: 1 },
  { prompt: 'Siapa putra Odysseus dalam cerita?', options: ['Achilles', 'Telemachus'], answer: 1 },

  { prompt: 'Dewa yang menguasai lautan adalah...', options: ['Apollo', 'Poseidon'], answer: 1 },
  { prompt: 'Siapa dewi kebijaksanaan yang membantu Odysseus?', options: ['Aphrodite', 'Athena'], answer: 1 },
  { prompt: 'Musuh bermata satu yang muncul dalam perjalanan adalah...', options: ['Minotaur', 'Polyphemus'], answer: 1 },
  { prompt: 'Kelompok makhluk dengan suara memikat pelaut disebut...', options: ['Titans', 'Sirens'], answer: 1 },
  { prompt: 'Rumah Odysseus berada di pulau bernama...', options: ['Troy', 'Ithaca'], answer: 1 },

  { prompt: 'Saga yang berhubungan dengan kepulangan Odysseus adalah...', options: ['Ocean Saga', 'Ithaca Saga'], answer: 1 },
  { prompt: 'Tokoh yang dikenal sebagai dewa pembawa pesan adalah...', options: ['Ares', 'Hermes'], answer: 1 },
  { prompt: 'Monster laut dengan beberapa kepala dalam mitologi adalah...', options: ['Pegasus', 'Hydra'], answer: 1 },
  { prompt: 'Tokoh yang mengubah kru Odysseus menjadi hewan adalah...', options: ['Scylla', 'Circe'], answer: 1 },
  { prompt: 'Raja Olympus dalam mitologi Yunani adalah...', options: ['Hades', 'Zeus'], answer: 1 },

  { prompt: 'Karya kuno yang menjadi inspirasi utama EPIC adalah...', options: ['The Aeneid', 'The Odyssey'], answer: 1 },
  { prompt: 'Tokoh yang membawa konsep strategi dan kebijaksanaan adalah...', options: ['Poseidon', 'Athena'], answer: 1 },
  { prompt: 'Tujuan terbesar Odysseus dalam cerita adalah...', options: ['Menguasai Olympus', 'Bertemu keluarganya'], answer: 1 },
  { prompt: 'Karakter yang menjadi ratu Ithaca adalah...', options: ['Calypso', 'Penelope'], answer: 1 },
  { prompt: 'Makhluk berkepala banteng dalam mitologi Yunani adalah...', options: ['Phoenix', 'Minotaur'], answer: 1 },

  { prompt: 'Dewa yang berkaitan dengan petir adalah...', options: ['Hermes', 'Zeus'], answer: 1 },
  { prompt: 'Pahlawan yang menggunakan strategi Kuda Troya adalah...', options: ['Hector', 'Odysseus'], answer: 1 },
  { prompt: 'Dalam cerita fan-made, ending rahasia biasanya didapat melalui...', options: ['Pilihan acak', 'Syarat tertentu'], answer: 1 },
  { prompt: 'Nilai yang sering diuji dalam perjalanan Odysseus adalah...', options: ['Kemewahan', 'Ketahanan dan harapan'], answer: 1 },
  { prompt: 'Pesan utama kisah Odysseus adalah...', options: ['Menghindari semua tantangan', 'Terus maju menghadapi rintangan'], answer: 1 },

  { prompt: 'Lagu "Full Speed Ahead" menggambarkan awal perjalanan Odysseus bersama...', options: ['Kru kapalnya', 'Pasukan Olympus'], answer: 0 },
  { prompt: 'Dalam lagu "Just a Man", konflik utama Odysseus berkaitan dengan...', options: ['Beban keputusan sebagai manusia', 'Keinginannya menjadi dewa'], answer: 0 },
  { prompt: 'Lagu "Open Arms" memperlihatkan nilai yang dibawa oleh...', options: ['Polites', 'Poseidon'], answer: 0 },
  { prompt: 'Dalam "Warrior of the Mind", hubungan utama yang ditampilkan adalah...', options: ['Athena dan Odysseus', 'Zeus dan Hades'], answer: 0 },
  { prompt: 'Lagu "My Goodbye" berfokus pada konflik antara...', options: ['Athena dan Odysseus', 'Circe dan Hermes'], answer: 0 },

  { prompt: 'Dalam "The Horse and the Infant", Odysseus menghadapi keputusan sulit terkait...', options: ['Perang dan masa depan', 'Mencari harta karun'], answer: 0 },
  { prompt: 'Lagu "Survive" menggambarkan perjuangan menghadapi...', options: ['Ancaman Cyclops', 'Para dewa Olympus'], answer: 0 },
  { prompt: 'Dalam "Remember Them", tema yang kuat adalah...', options: ['Kenangan dan pengorbanan', 'Kemenangan tanpa kehilangan'], answer: 0 },
  { prompt: 'Lagu "Luck Runs Out" berhubungan dengan...', options: ['Kepercayaan dan keberuntungan kru', 'Pesta para dewa'], answer: 0 },
  { prompt: 'Dalam "Keep Your Friends Close", masalah utama berkaitan dengan...', options: ['Kepercayaan dalam perjalanan', 'Pertandingan antar dewa'], answer: 0 },

  { prompt: 'Lagu "Ruthlessness" menonjolkan karakter...', options: ['Poseidon', 'Athena'], answer: 0 },
  { prompt: 'Dalam "Puppeteer", sosok yang memiliki kemampuan sihir adalah...', options: ['Circe', 'Penelope'], answer: 0 },
  { prompt: 'Lagu "Wouldn’t You Like" memperkenalkan bantuan dari...', options: ['Hermes', 'Ares'], answer: 0 },
  { prompt: 'Dalam "Done For", konflik utama terjadi antara...', options: ['Odysseus dan Circe', 'Odysseus dan Zeus'], answer: 0 },
  { prompt: 'Lagu "There Are Other Ways" memperlihatkan pendekatan yang lebih...', options: ['Diplomatis dan penuh pertimbangan', 'Kasar tanpa rencana'], answer: 0 },

  { prompt: 'Dalam "The Underworld", Odysseus menghadapi...', options: ['Masa lalu dan kehilangan', 'Perjalanan ke Olympus'], answer: 0 },
  { prompt: 'Lagu "No Longer You" berkaitan dengan...', options: ['Ramalan dan perubahan diri', 'Pertarungan melawan Cyclops'], answer: 0 },
  { prompt: 'Dalam "Monster", Odysseus mulai mempertanyakan...', options: ['Dirinya setelah berbagai keputusan', 'Cara membuat kapal baru'], answer: 0 },
  { prompt: 'Lagu "Suffering" menampilkan konflik dengan...', options: ['Sirens', 'Minotaur'], answer: 0 },
  { prompt: 'Dalam "Different Beast", Odysseus digambarkan sebagai seseorang yang...', options: ['Berubah karena pengalaman', 'Tidak pernah berubah'], answer: 0 },

  { prompt: 'Lagu "Scylla" berhubungan dengan ancaman berupa...', options: ['Monster laut', 'Pasukan Troya'], answer: 0 },
  { prompt: 'Dalam "Thunder Bringer", tokoh utama yang memberikan hukuman adalah...', options: ['Zeus', 'Hermes'], answer: 0 },
  { prompt: 'Lagu "Legendary" berfokus pada sudut pandang...', options: ['Telemachus', 'Poseidon'], answer: 0 },
  { prompt: 'Dalam "Little Wolf", konflik utama terjadi di...', options: ['Ithaca', 'Dunia bawah'], answer: 0 },
  { prompt: 'Lagu "God Games" memperlihatkan Athena menghadapi...', options: ['Para dewa Olympus', 'Pasukan Cyclops'], answer: 0 },

  { prompt: 'Lagu yang menggambarkan keberangkatan awal Odysseus adalah...', options: ['God Games', 'Full Speed Ahead'], answer: 1 },
  { prompt: 'Lagu yang menampilkan sisi manusiawi Odysseus setelah keputusan sulit adalah...', options: ['Monster', 'Just a Man'], answer: 1 },
  { prompt: 'Tokoh yang mengajarkan Odysseus tentang strategi dalam "Warrior of the Mind" adalah...', options: ['Penelope', 'Athena'], answer: 1 },
  { prompt: 'Lagu yang berhubungan dengan perpisahan Athena dan Odysseus adalah...', options: ['Ruthlessness', 'My Goodbye'], answer: 1 },
  { prompt: 'Konflik dengan Cyclops banyak dibahas dalam lagu...', options: ['There Are Other Ways', 'Survive'], answer: 1 },

  { prompt: 'Lagu yang berhubungan dengan membuka kantong angin Aeolus adalah...', options: ['The Underworld', 'Keep Your Friends Close'], answer: 1 },
  { prompt: 'Tokoh yang dikenal dengan sikap penuh kasih dalam "Open Arms" adalah...', options: ['Polites', 'Eurylochus'], answer: 0 },
  { prompt: 'Lagu yang memperlihatkan sisi gelap Poseidon adalah...', options: ['Warrior of the Mind', 'Ruthlessness'], answer: 1 },
  { prompt: 'Pertemuan dengan Circe digambarkan melalui lagu...', options: ['Puppeteer', 'Legendary'], answer: 0 },
  { prompt: 'Lagu yang memperlihatkan bantuan Hermes adalah...', options: ['Wouldn’t You Like', 'No Longer You'], answer: 0 },

  { prompt: 'Lagu yang berhubungan dengan dunia bawah adalah...', options: ['The Underworld', 'Full Speed Ahead'], answer: 0 },
  { prompt: 'Perubahan pandangan Odysseus sebagai pemimpin paling terasa dalam...', options: ['Monster', 'Open Arms'], answer: 0 },
  { prompt: 'Lagu yang menghadirkan ramalan tentang masa depan adalah...', options: ['No Longer You', 'Luck Runs Out'], answer: 0 },
  { prompt: 'Ancaman utama dalam lagu "Scylla" berasal dari...', options: ['Monster laut', 'Dewa petir'], answer: 0 },
  { prompt: 'Konflik besar yang melibatkan Zeus terjadi dalam lagu...', options: ['Thunder Bringer', 'Remember Them'], answer: 0 },

  { prompt: 'Lagu "Mutiny" berfokus pada konflik antara Odysseus dan...', options: ['Para dewa Olympus', 'Kru kapalnya'], answer: 1 },
  { prompt: 'Dalam "Thunder Bringer", Zeus memberikan pilihan yang berkaitan dengan...', options: ['Kehidupan dan pengorbanan', 'Mencari rumah baru'], answer: 0 },
  { prompt: 'Lagu "Charybdis" menggambarkan rintangan berupa...', options: ['Monster darat', 'Bahaya laut besar'], answer: 1 },
  { prompt: 'Dalam "The Challenge", Penelope berhubungan dengan...', options: ['Ujian untuk para pelamar', 'Perjalanan menuju Troya'], answer: 0 },
  { prompt: 'Lagu "Hold Them Down" berkaitan dengan ancaman dari...', options: ['Para pelamar di Ithaca', 'Pasukan Cyclops'], answer: 0 },

  { prompt: 'Lagu "Would You Fall in Love With Me Again" berfokus pada hubungan antara...', options: ['Odysseus dan Penelope', 'Athena dan Zeus'], answer: 0 },
  { prompt: 'Dalam "Six Hundred Strike", angka tersebut mengacu kepada...', options: ['Jumlah kru Odysseus', 'Jumlah dewa Olympus'], answer: 0 },
  { prompt: 'Lagu "Different Beast" menunjukkan bahwa Odysseus telah...', options: ['Berubah akibat perjalanan', 'Menjadi makhluk mitologi'], answer: 0 },
  { prompt: 'Dalam "Love in Paradise", karakter yang berhubungan dengan pulau terpencil adalah...', options: ['Calypso', 'Scylla'], answer: 0 },
  { prompt: 'Lagu yang menampilkan perjuangan Odysseus menghadapi masa lalu adalah...', options: ['The Underworld', 'Full Speed Ahead'], answer: 0 },

  { prompt: 'Dalam lagu "The Challenge", sosok yang menunggu kepulangan Odysseus adalah...', options: ['Penelope', 'Circe'], answer: 0 },
  { prompt: 'Lagu "Little Wolf" menggambarkan konflik Telemachus dengan...', options: ['Para suitors', 'Para Cyclops'], answer: 0 },
  { prompt: 'Dalam "Legendary", Telemachus digambarkan sebagai seseorang yang...', options: ['Mencari jati dirinya', 'Menjadi dewa laut'], answer: 0 },
  { prompt: 'Lagu "Love in Paradise" lebih berhubungan dengan tema...', options: ['Kesepian dan hubungan', 'Perang Troya'], answer: 0 },
  { prompt: 'Dalam "Charybdis", Odysseus kembali diuji oleh...', options: ['Bahaya perjalanan laut', 'Permainan para dewa'], answer: 0 },

  { prompt: 'Lagu yang menunjukkan pertemuan kembali Odysseus dengan Penelope adalah...', options: ['Would You Fall in Love With Me Again', 'Ruthlessness'], answer: 0 },
  { prompt: 'Dalam akhir perjalanan EPIC, konflik utama berada di...', options: ['Ithaca', 'Troy'], answer: 0 },
  { prompt: 'Lagu "Hold Them Down" menggambarkan situasi yang mengancam...', options: ['Keluarga Odysseus', 'Para dewa Olympus'], answer: 0 },
  { prompt: 'Dalam "Six Hundred Strike", tema yang kuat adalah...', options: ['Perlawanan terakhir', 'Awal perang Troya'], answer: 0 },
  { prompt: 'Lagu "Mutiny" memperlihatkan masalah akibat...', options: ['Perbedaan keputusan dalam kru', 'Kehadiran Athena'], answer: 0 },

  { prompt: 'Lagu yang menggambarkan hubungan romantis Odysseus dan Penelope adalah...', options: ['Monster', 'Would You Fall in Love With Me Again'], answer: 1 },
  { prompt: 'Ancaman utama dalam "Hold Them Down" berasal dari...', options: ['Sirens', 'Para suitors'], answer: 1 },
  { prompt: 'Tokoh utama dalam lagu "Legendary" adalah...', options: ['Odysseus', 'Telemachus'], answer: 1 },
  { prompt: 'Dalam "Love in Paradise", sosok yang berada di pulau tersebut adalah...', options: ['Calypso', 'Athena'], answer: 0 },
  { prompt: 'Lagu yang menggambarkan konflik internal Odysseus adalah...', options: ['Monster', 'Full Speed Ahead'], answer: 0 },

  { prompt: 'Dalam "Mutiny", anggota kru yang memiliki konflik besar dengan Odysseus adalah...', options: ['Eurylochus', 'Hermes'], answer: 0 },
  { prompt: 'Lagu yang berhubungan dengan tantangan Penelope kepada para pelamar adalah...', options: ['The Challenge', 'Ruthlessness'], answer: 0 },
  { prompt: 'Lagu yang menunjukkan perubahan Odysseus menjadi lebih keras adalah...', options: ['Different Beast', 'Open Arms'], answer: 0 },
  { prompt: 'Rintangan utama dalam "Charybdis" adalah...', options: ['Bahaya laut', 'Perang darat'], answer: 0 },
  { prompt: 'Dalam "Six Hundred Strike", Odysseus menghadapi...', options: ['Pertarungan besar terakhir', 'Pelatihan Athena'], answer: 0 },

  { prompt: 'Lagu "The Challenge" berhubungan dengan siapa yang mencari pasangan?', options: ['Penelope', 'Athena'], answer: 0 },
  { prompt: 'Lagu yang menggambarkan ancaman terhadap Ithaca adalah...', options: ['Hold Them Down', 'Survive'], answer: 0 },
  { prompt: 'Dalam "Would You Fall in Love With Me Again", tema utamanya adalah...', options: ['Cinta dan kesempatan kedua', 'Balas dendam kepada Poseidon'], answer: 0 },
  { prompt: 'Karakter yang paling berkaitan dengan konsep rumah dalam EPIC adalah...', options: ['Penelope', 'Scylla'], answer: 0 },
  { prompt: 'Lagu penutup perjalanan Odysseus berhubungan dengan...', options: ['Kepulangan dan reuni', 'Awal perang Troya'], answer: 0 }

]

const EPIC_ALL_QUIZZES = [
  ...EPIC_QUIZZES,
  ...EPIC_GUESSES.map(guess => ({
    question: guess.prompt,
    options: guess.options,
    answer: guess.answer + 1,
    detail: 'Jawaban ini membuka satu bagian kecil dari kisah EPIC: The Musical.'
  }))
]

const EPIC_QUOTES = {
  athena: {
    name: 'Athena',
    quotes: [
      'Kecerdikan adalah senjata yang tetap tajam ketika kekuatan mulai runtuh.',
      'Pedang dapat memenangkan satu pertarungan, tetapi pikiran dapat memenangkan sebuah perang.',
      'Musuh terbesar bukanlah mereka yang kuat, tetapi mereka yang tidak mau belajar.',
      'Strategi terbaik adalah mengetahui kapan harus menyerang dan kapan harus menunggu.',
      'Kemenangan sejati lahir dari keputusan yang dibuat ketika semuanya terasa mustahil.',
      'Kebijaksanaan tidak menghapus rasa takut, tetapi mengajarkan cara menghadapinya.',
      'Seorang pemimpin harus melihat lebih jauh daripada sekadar kemenangan hari ini.',
      'Kekuatan tanpa arah hanya akan membawa kehancuran.',
      'Masa depan berubah ketika seseorang berani mengambil pilihan sulit.',
      'Pikiran yang tenang dapat mengalahkan kekuatan yang membabi buta.',
      'Tidak semua perang dimenangkan dengan pedang; beberapa dimenangkan dengan ide.',
      'Orang yang memahami dirinya sendiri akan lebih sulit dikalahkan.'
    ]
  },

  zeus: {
    name: 'Zeus',
    quotes: [
      'Petirku dapat membuka langit, tetapi keputusanmulah yang menentukan arah.',
      'Takhta membawa kekuasaan, tetapi juga membawa beban yang besar.',
      'Langit mengingat setiap sumpah yang pernah diucapkan.',
      'Kekuatan sejati terlihat dari bagaimana seseorang menggunakannya.',
      'Badai datang untuk menguji siapa yang mampu tetap berdiri.',
      'Seorang raja tidak hanya memerintah, ia juga bertanggung jawab.',
      'Bahkan para dewa harus menghadapi akibat dari pilihan mereka.',
      'Petir adalah suara langit ketika kata-kata tidak lagi cukup.',
      'Kekuasaan tanpa kebijaksanaan hanya menciptakan kehancuran.',
      'Mereka yang menantang langit harus siap menghadapi guntur.',
      'Tidak ada makhluk yang dapat sepenuhnya melarikan diri dari takdir.',
      'Mahkota bukan tanda kebebasan, melainkan tanda tanggung jawab.'
    ]
  },

  poseidon: {
    name: 'Poseidon',
    quotes: [
      'Laut tidak pernah lupa pada kesombongan yang dilemparkan ke dalamnya.',
      'Gelombang kecil dapat berubah menjadi badai yang menghancurkan.',
      'Samudra menyimpan rahasia yang tidak pernah diketahui manusia.',
      'Mereka yang meremehkan laut akan belajar menghormati kedalamannya.',
      'Kesabaran ombak panjang, tetapi amarahnya tidak terbatas.',
      'Tidak ada kapal yang benar-benar bebas dari ujian lautan.',
      'Laut memberikan perjalanan, tetapi juga menentukan akhirnya.',
      'Kedalaman samudra menyimpan kemarahan yang tidak terlihat.',
      'Badai tidak datang tanpa alasan, ia membawa pesan dari alam.',
      'Setiap arus memiliki tujuan meskipun manusia tidak memahaminya.',
      'Mereka yang melawan laut harus siap kehilangan arah.',
      'Samudra tidak membutuhkan pengakuan untuk menunjukkan kekuatannya.'
    ]
  },

  hermes: {
    name: 'Hermes',
    quotes: [
      'Jalan keluar sering datang lebih cepat kepada mereka yang mau bergerak.',
      'Kecepatan bukan hanya tentang kaki, tetapi tentang pikiran.',
      'Sebuah pesan kecil dapat mengubah nasib dunia.',
      'Mereka yang ragu akan tertinggal oleh mereka yang mencoba.',
      'Keberuntungan sering berpihak kepada mereka yang mengambil kesempatan.',
      'Tidak semua kemenangan membutuhkan pedang.',
      'Perjalanan panjang selalu dimulai dari langkah pertama.',
      'Rahasia terbaik adalah rahasia yang tahu kapan harus muncul.',
      'Tidak ada jalan buntu bagi mereka yang terus mencari.',
      'Senyuman dan kecerdikan dapat menjadi senjata paling berbahaya.',
      'Bahkan jalan tersulit memiliki celah untuk mereka yang pintar.',
      'Bergeraklah sebelum dunia memutuskan langkahmu.'
    ]
  },

    hera: {
    name: 'Hera',
    quotes: [
      'Janji yang diuji waktu akan menunjukkan siapa yang benar-benar setia.',
      'Kesetiaan tidak terlihat saat semuanya mudah, tetapi saat semuanya runtuh.',
      'Sebuah ikatan kuat dibangun dari kepercayaan yang dijaga.',
      'Kehormatan membutuhkan waktu untuk dibangun dan hanya sesaat untuk dihancurkan.',
      'Mereka yang mengkhianati kepercayaan akan kehilangan lebih dari yang mereka ambil.',
      'Keluarga dapat menjadi kekuatan terbesar sekaligus kelemahan terbesar.',
      'Kesabaran seorang ratu bukan berarti ia melupakan luka.',
      'Mahkota tidak berarti tanpa rasa hormat dari mereka yang berada di bawahnya.',
      'Waktu selalu mengungkap siapa yang tetap berdiri.',
      'Kesetiaan adalah kekuatan yang tidak terlihat oleh mata.',
      'Sebuah sumpah memiliki nilai hanya jika seseorang bersedia menepatinya.',
      'Hati yang terluka tetap dapat mengingat janji yang pernah dibuat.'
    ]
  },

  ares: {
    name: 'Ares',
    quotes: [
      'Keberanian tanpa kendali hanya akan menjadi perang yang tidak berakhir.',
      'Amarah dapat memenangkan pertempuran, tetapi tidak selalu kemenangan.',
      'Prajurit sejati tahu kapan harus menyerang dan kapan harus berhenti.',
      'Perang menguji kekuatan tubuh dan keteguhan jiwa.',
      'Ketakutan adalah musuh pertama yang harus dikalahkan.',
      'Pedang terkuat tetap tidak berguna tanpa tangan yang mampu mengendalikannya.',
      'Tidak semua kemenangan membutuhkan kehancuran.',
      'Seorang pejuang harus mampu mengalahkan badai dalam dirinya sendiri.',
      'Kekuatan tanpa tujuan hanya akan meninggalkan kehampaan.',
      'Medan perang menunjukkan siapa yang bertahan sampai akhir.',
      'Keberanian bukan berarti tidak takut, tetapi tetap maju meski takut.',
      'Bahkan perang terbesar dimulai dari satu keputusan kecil.'
    ]
  },

  aphrodite: {
    name: 'Aphrodite',
    quotes: [
      'Cinta dapat menjadi pelabuhan, tetapi juga badai paling dalam.',
      'Hati manusia sering lebih sulit ditaklukkan daripada sebuah kerajaan.',
      'Cinta bukan kelemahan, terkadang ia adalah alasan untuk bertahan.',
      'Keindahan tidak hanya terlihat dari mata, tetapi juga dari jiwa.',
      'Tidak ada senjata yang lebih kuat daripada hati yang tulus.',
      'Seseorang dapat melawan pedang, tetapi sulit melawan perasaan.',
      'Kasih sayang dapat menyembuhkan luka yang tidak terlihat.',
      'Mereka yang takut mencintai juga takut merasakan kehidupan.',
      'Hati yang terbuka memiliki keberanian yang tidak dimiliki semua orang.',
      'Badai terbesar terkadang datang dari perasaan sendiri.',
      'Cinta dapat mengubah musuh menjadi seseorang yang memahami.',
      'Perasaan yang jujur mampu mengubah jalan takdir.'
    ]
  },

  hephaestus: {
    name: 'Hephaestus',
    quotes: [
      'Sesuatu yang ditempa oleh luka dapat menjadi lebih kuat daripada emas.',
      'Api tidak hanya menghancurkan, tetapi juga menciptakan.',
      'Setiap retakan memiliki cerita tentang bagaimana sesuatu bertahan.',
      'Karya terbaik lahir dari kesabaran dan ketekunan.',
      'Logam kuat terbentuk melalui panas dan tekanan.',
      'Kelemahan yang diterima dapat berubah menjadi kekuatan.',
      'Tangan yang terluka tetap mampu menciptakan keajaiban.',
      'Sebuah senjata hebat selalu dimulai dari bahan sederhana.',
      'Kesempurnaan bukan berarti tanpa cacat, tetapi mampu bertahan.',
      'Api menempa benda, pengalaman menempa jiwa.',
      'Mereka yang pernah jatuh sering menciptakan sesuatu yang luar biasa.',
      'Sesuatu yang rusak tidak selalu harus dibuang; terkadang dapat diperbaiki menjadi lebih kuat.'
    ]
  },
  
    apollo: {
    name: 'Apollo',
    quotes: [
      'Cahaya tidak menghapus bayangan; ia mengajarimu cara melihatnya.',
      'Kebenaran seperti matahari, cepat atau lambat akan terlihat.',
      'Musik dapat menyampaikan hal yang tidak mampu diucapkan kata-kata.',
      'Ramalan bukan untuk mengubah masa depan, tetapi memahami kemungkinan.',
      'Cahaya terbesar sering muncul setelah malam yang paling panjang.',
      'Pengetahuan adalah sinar yang membimbing manusia melewati kegelapan.',
      'Sebuah lagu dapat menyimpan kenangan yang tidak akan mati.',
      'Mereka yang mencari kebenaran harus siap menerima jawabannya.',
      'Masa depan mungkin tidak pasti, tetapi harapan selalu memiliki tempat.',
      'Seni dan kebijaksanaan adalah cahaya bagi dunia yang kacau.',
      'Bahkan matahari harus tenggelam agar esok dapat kembali bersinar.',
      'Setiap fajar membawa kesempatan baru bagi mereka yang masih percaya.'
    ]
  },

  hades: {
    name: 'Hades',
    quotes: [
      'Tidak semua yang mati hilang, dan tidak semua yang hidup benar-benar pulang.',
      'Dunia bawah bukan akhir, hanya bagian lain dari perjalanan.',
      'Setiap jiwa membawa cerita yang berbeda ketika meninggalkan dunia.',
      'Kematian bukan musuh kehidupan, melainkan bagian darinya.',
      'Tidak ada rahasia yang dapat bersembunyi selamanya dari waktu.',
      'Mereka yang takut pada akhir sering lupa menghargai perjalanan.',
      'Bayangan bukan berarti kejahatan, terkadang ia hanya kesunyian.',
      'Kerajaan yang sunyi tetap memiliki aturan dan keseimbangannya.',
      'Semua makhluk akhirnya akan bertemu dengan takdirnya.',
      'Diam bukan berarti lemah, terkadang diam menyimpan kekuatan.',
      'Akhir perjalanan bukan selalu berarti kehilangan.',
      'Bahkan dalam kegelapan, masih ada sesuatu yang dapat ditemukan.'
    ]
  },

  persephone: {
    name: 'Persephone',
    quotes: [
      'Setiap musim berakhir agar sesuatu yang baru dapat tumbuh.',
      'Kehidupan selalu menemukan jalan untuk kembali setelah kehilangan.',
      'Bahkan tanah yang mati dapat melahirkan bunga baru.',
      'Perubahan bukan akhir, melainkan bagian dari pertumbuhan.',
      'Tidak ada musim dingin yang berlangsung selamanya.',
      'Harapan dapat tumbuh bahkan di tempat paling gelap.',
      'Siklus kehidupan mengajarkan bahwa semua hal memiliki waktunya.',
      'Sesuatu yang hilang mungkin kembali dalam bentuk yang berbeda.',
      'Kesedihan dan kebahagiaan adalah bagian dari perjalanan yang sama.',
      'Alam mengingat bahwa tidak ada akhir yang benar-benar permanen.',
      'Setiap kebangkitan dimulai dari masa istirahat yang panjang.',
      'Bahkan dunia yang dingin dapat kembali dipenuhi kehidupan.'
    ]
  },

  helios: {
    name: 'Helios',
    quotes: [
      'Tidak ada rahasia yang dapat bersembunyi selamanya dari cahaya.',
      'Matahari menyaksikan semua perjalanan yang terjadi di bawah langit.',
      'Cahaya tidak memilih siapa yang pantas mendapatkannya.',
      'Hari baru selalu datang setelah malam yang panjang.',
      'Kebenaran mungkin tertutup awan, tetapi tidak akan hilang.',
      'Mereka yang berjalan dalam gelap tetap dapat menemukan arah.',
      'Sinar pertama pagi membawa kesempatan kedua.',
      'Langit berubah setiap hari, tetapi cahaya selalu kembali.',
      'Tidak ada bayangan tanpa adanya sesuatu yang bersinar.',
      'Matahari tidak terburu-buru, tetapi selalu mencapai tujuannya.',
      'Harapan adalah cahaya yang tidak dapat dipadamkan oleh badai.',
      'Selama matahari terbit, masih ada kesempatan untuk memulai kembali.'
    ]
  }
};

const EPIC_CHARACTERS = [
  { id: 'odysseus', name: 'Odysseus', category: 'Humans & Ithaca', role: 'Raja Ithaca dan tokoh utama yang menuntun perjalanan.', isMonster: false },
  { id: 'eurylochus', name: 'Eurylochus', category: 'Humans & Ithaca', role: 'Sahabat sejati yang tetap realistis di setiap keputusan sulit.', isMonster: false },
  { id: 'polites', name: 'Polites', category: 'Humans & Ithaca', role: 'Teman dekat Odysseus, pembawa hati dan ketenangan.', isMonster: false },
  { id: 'penelope', name: 'Penelope', category: 'Humans & Ithaca', role: 'Istri setia Odysseus yang menunggu pulang dengan kesabaran.', isMonster: false },
  { id: 'telemachus', name: 'Telemachus', category: 'Humans & Ithaca', role: 'Anak Odysseus yang tumbuh kuat di tengah pasang surut.', isMonster: false },
  { id: 'anticlea', name: 'Anticlea', category: 'Humans & Ithaca', role: 'Ibu Odysseus yang muncul dalam bayangan dunia bawah.', isMonster: false },
  { id: 'elpenor', name: 'Elpenor', category: 'Humans & Ithaca', role: 'Kru yang mengingatkan bahwa hidup bisa hilang cepat.', isMonster: false },
  { id: 'perimedes', name: 'Perimedes', category: 'Humans & Ithaca', role: 'Kru yang berani, keras, dan sadar akan konsekuensi.', isMonster: false },
  { id: 'odysseus_crew', name: 'Odysseus Crew', category: 'Humans & Ithaca', role: 'Kelompok kru yang menyertai setiap petualangan berat.', isMonster: false },
  { id: 'athena', name: 'Athena', category: 'Gods', role: 'Dewi kebijaksanaan yang membimbing jalan yang paling cerdas.', isMonster: false },
  { id: 'zeus', name: 'Zeus', category: 'Gods', role: 'Raja para dewa, penguasa petir dan keputusan besar.', isMonster: false },
  { id: 'poseidon', name: 'Poseidon', category: 'Gods', role: 'Dewa laut yang menjaga balas dendam dan kekuatan badai.', isMonster: false },
  { id: 'hermes', name: 'Hermes', category: 'Gods', role: 'Dewa utusan yang membawa jalan keluar dan cepat tanggap.', isMonster: false },
  { id: 'hera', name: 'Hera', category: 'Gods', role: 'Dewi kemarahan yang menilai hubungan dengan tajam.', isMonster: false },
  { id: 'ares', name: 'Ares', category: 'Gods', role: 'Dewi perang yang suka menegangkan situasi.', isMonster: false },
  { id: 'aphrodite', name: 'Aphrodite', category: 'Gods', role: 'Dewi cinta yang mengubah pilihan menjadi emosi.', isMonster: false },
  { id: 'hephaestus', name: 'Hephaestus', category: 'Gods', role: 'Dewa besi dan kerja keras yang menghargai tekad.', isMonster: false },
  { id: 'apollo', name: 'Apollo', category: 'Gods', role: 'Dewa musik dan cahaya, pemilik harmoni yang tenang.', isMonster: false },
  { id: 'aeolus', name: 'Aeolus', category: 'Magical Beings', role: 'Penjaga angin yang memberi pilihan tak terduga.', isMonster: false },
  { id: 'circe', name: 'Circe', category: 'Magical Beings', role: 'Penyihir yang mengubah tindakan jadi ujian besar.', isMonster: false },
  { id: 'tiresias', name: 'Tiresias', category: 'Magical Beings', role: 'Peramal buta yang melihat masa depan di balik bayang.', isMonster: false },
  { id: 'calypso', name: 'Calypso', category: 'Magical Beings', role: 'Nymph yang menahan hati dan menunggu keputusan besar.', isMonster: false },
  { id: 'antinous', name: 'Antinous', category: 'Suitors', role: 'Pelamar paling kejam dan paling agresif di Ithaca.', isMonster: false },
  { id: 'eurymachus', name: 'Eurymachus', category: 'Suitors', role: 'Pelamar licik yang memanfaatkan ketidakpastian.', isMonster: false },
  { id: 'amphinomus', name: 'Amphinomus', category: 'Suitors', role: 'Pelamar bangsawan yang mengakui kekacauan di rumah.', isMonster: false },
  { id: 'melanthius', name: 'Melanthius', category: 'Suitors', role: 'Gembala kambing yang berpihak pada kekacauan.', isMonster: false }
]

const EXTRA_CHARACTERS = [
  // ===== ANIMALS =====
  { id: 'argos', name: 'Argos', category: 'Animals', role: 'Anjing setia yang menunggu tuannya pulang.', isMonster: false },
  { id: 'holy_cattle', name: 'The Holy Cattle', category: 'Animals', role: 'Lembu suci yang mengingatkan pada harga keserakahan.', isMonster: false },
  { id: 'circe_pigs', name: 'The Transformed Pigs', category: 'Animals', role: 'Kru yang tak lagi bisa membedakan diri sendiri dari kutukan.', isMonster: false },

  // ===== TROJAN WAR CHARACTERS =====
  { id: 'astyanax', name: 'Astyanax', category: 'Trojan War', role: 'Bayi dari Troya yang membawa luka masa lalu.', isMonster: false },
  { id: 'hector', name: 'Hector', category: 'Trojan War', role: 'Pahlawan Troya yang mengingatkan pada kebanggaan dan luka.', isMonster: false },
  { id: 'helen', name: 'Helen', category: 'Trojan War', role: 'Penyebab perang yang menebar rasa bersalah dan cinta.', isMonster: false },
  { id: 'menelaus', name: 'Menelaus', category: 'Trojan War', role: 'Raja Sparta yang kehilangan sepotong hati dalam pertempuran.', isMonster: false },
  { id: 'diomedes', name: 'Diomedes', category: 'Trojan War', role: 'Pahlawan Yunani yang menahan luka dengan marah.', isMonster: false },
  { id: 'ajax', name: 'Ajax', category: 'Trojan War', role: 'Prajurit besar yang tak gentar menatap kekalahan.', isMonster: false },
  { id: 'trojan_crews', name: 'Trojan Crews', category: 'Trojan War', role: 'Pasukan troya yang berdiri di pintu awal dan akhir.', isMonster: false },

  // ===== UNDERWORLD SOULS =====
  { id: 'achilles', name: 'Achilles', category: 'Underworld Souls', role: 'Arwah pahlawan yang menunggu luka terakhir dibuka.', isMonster: false },
  { id: 'patroclus', name: 'Patroclus', category: 'Underworld Souls', role: 'Hati yang mengikat luka dengan kesetiaan sejati.', isMonster: false },
  { id: 'agamemnon', name: 'Agamemnon', category: 'Underworld Souls', role: 'Raja yang menerima luka akibat keputusan keliru.', isMonster: false },
  { id: 'orpheus', name: 'Orpheus', category: 'Underworld Souls', role: 'Penyair yang turun ke dunia bawah demi membawa Eurydice pulang.', isMonster: false },
  { id: 'eurydice', name: 'Eurydice', category: 'Underworld Souls', role: 'Arwah yang menunggu Orpheus di ambang hidup dan mati.', isMonster: false },
  { id: 'charon', name: 'Charon', category: 'Underworld Souls', role: 'Pendayung sungai Styx yang membawa jiwa menuju dunia bawah.', isMonster: false },
 

  // ===== EXTRA SUITORS =====
  { id: 'agelaus', name: 'Agelaus', category: 'Extra Suitors', role: 'Salah satu pelamar tambahan yang ikut mengotori rumah.', isMonster: false },
  { id: 'leiodes', name: 'Leiodes', category: 'Extra Suitors', role: 'Pelamar yang memilih menjauh dari kekacauan.', isMonster: false },
  { id: 'ctesippus', name: 'Ctesippus', category: 'Extra Suitors', role: 'Pelamar kasar yang menciptakan konflik baru.', isMonster: false },
  { id: 'peisander', name: 'Peisander', category: 'Extra Suitors', role: 'Pelamar yang suka memanfaatkan kegaduhan.', isMonster: false },
  { id: 'polybus', name: 'Polybus', category: 'Extra Suitors', role: 'Pelamar tambahan yang menderita akibat keputusan buruk.', isMonster: false },
  { id: 'demoptolemus', name: 'Demoptolemus', category: 'Extra Suitors', role: 'Pelamar yang tak bisa menahan keberanian saat berhadapan.', isMonster: false },

  // ===== TWELVE OLYMPIANS (tidak ada di EPIC_CHARACTERS) =====
  { id: 'dionysus', name: 'Dionysus', category: 'Twelve Olympians', role: 'Dewa anggur, pesta, teater yang merayakan kehidupan.', isMonster: false },
  { id: 'hestia', name: 'Hestia', category: 'Twelve Olympians', role: 'Dewi perapian rumah dan keluarga yang tak terlihat tapi selalu ada.', isMonster: false },

  // ===== OLYMPIAN GODS (Underworld & Extended) =====
  { id: 'hades', name: 'Hades', category: 'Olympian Gods', role: 'Raja dunia bawah yang menunggu masa lalu untuk dibuka.', isMonster: false },
  { id: 'persephone', name: 'Persephone', category: 'Olympian Gods', role: 'Ratu dunia bawah yang menjaga ambang hidup dan mati.', isMonster: false },
  { id: 'eris', name: 'Eris', category: 'Olympian Gods', role: 'Dewi perselisihan yang membuka konflik tak terduga.', isMonster: false },
  { id: 'demeter', name: 'Demeter', category: 'Olympian Gods', role: 'Dewi bumi dan ketahanan yang menunggu masa depan tumbuh.', isMonster: false },
  { id: 'artemis', name: 'Artemis', category: 'Olympian Gods', role: 'Dewi berburu yang menjaga batasan dan prinsip.', isMonster: false },

  // ===== UNDERWORLD & MAJOR GODS =====
  { id: 'hecate', name: 'Hecate', category: 'Underworld Gods', role: 'Dewi sihir dan persimpangan jalan yang tahu rahasia gelap.', isMonster: false },
  { id: 'thanatos', name: 'Thanatos', category: 'Underworld Gods', role: 'Personifikasi kematian damai yang menunggu dengan tenang.', isMonster: false },
  { id: 'hypnos', name: 'Hypnos', category: 'Underworld Gods', role: 'Dewa tidur yang membuka alam bawah sadar.', isMonster: false },
  { id: 'morpheus', name: 'Morpheus', category: 'Underworld Gods', role: 'Dewa mimpi yang menyamar dalam bentuk manusia.', isMonster: false },
  { id: 'helios', name: 'Helios', category: 'Underworld Gods', role: 'Dewa matahari kuno yang melihat segalanya dan meminta pertanggungjawaban.', isMonster: false },

  // ===== NATURE & MINOR GODS =====
  { id: 'pan', name: 'Pan', category: 'Nature Gods', role: 'Dewa hutan dan gembala yang main seruling di alam liar.', isMonster: false },
  { id: 'asclepius', name: 'Asclepius', category: 'Nature Gods', role: 'Dewa kedokteran yang menyembuhkan apa yang rusak.', isMonster: false },
  { id: 'hebe', name: 'Hebe', category: 'Nature Gods', role: 'Dewi masa muda dan pelayan cangkir Olimpus.', isMonster: false },
  { id: 'iris', name: 'Iris', category: 'Nature Gods', role: 'Dewi pelangi yang membawa pesan antar dewa dan manusia.', isMonster: false },

  // ===== PRIMORDIAL DEITIES (Awal Ciptaan) =====
  { id: 'chaos', name: 'Chaos', category: 'Primordial Deities', role: 'Kekosongan awal yang mengandung segala kemungkinan alam semesta.', isMonster: false },
  { id: 'gaia', name: 'Gaia', category: 'Primordial Deities', role: 'Ibu Pertiwi yang melahirkan segala kehidupan.', isMonster: false },
  { id: 'uranus', name: 'Uranus', category: 'Primordial Deities', role: 'Ayah Langit yang mengatur keseimbangan kosmik.', isMonster: false },
  { id: 'tartarus', name: 'Tartarus', category: 'Primordial Deities', role: 'Jurang terdalam dunia bawah tempat dewa ditanam.', isMonster: false },
  { id: 'nyx', name: 'Nyx', category: 'Primordial Deities', role: 'Dewi malam gelap yang menutupi semua dengan bayangan.', isMonster: false },
  { id: 'erebus', name: 'Erebus', category: 'Primordial Deities', role: 'Kegelapan dunia bawah yang menyertai setiap langkah.', isMonster: false },
  { id: 'hemera', name: 'Hemera', category: 'Primordial Deities', role: 'Dewi siang hari yang membawa cahaya setiap pagi.', isMonster: false },
  { id: 'aether', name: 'Aether', category: 'Primordial Deities', role: 'Atmosfer atas udara murni tempat dewa tinggal.', isMonster: false },
  { id: 'pontus', name: 'Pontus', category: 'Primordial Deities', role: 'Lautan kuno pertama yang melahirkan makhluk laut.', isMonster: false },
  { id: 'thalassa', name: 'Thalassa', category: 'Primordial Deities', role: 'Permukaan laut yang gelombang dan berombang.', isMonster: false },
  { id: 'chronos', name: 'Chronos', category: 'Primordial Deities', role: 'Waktu kosmik yang abadi dan tak terukur.', isMonster: false },
  { id: 'ananke', name: 'Ananke', category: 'Primordial Deities', role: 'Keniscayaan yang membuat takdir tak terhindarkan.', isMonster: false },

  // ===== TITANS (Penguasa Sebelum Olimpian) =====
  { id: 'cronus', name: 'Cronus', category: 'Titans', role: 'Pemimpin Titan yang memerintah waktu dan pertanian.', isMonster: false },
  { id: 'rhea', name: 'Rhea', category: 'Titans', role: 'Ibu para dewa Olimpian yang lahir dari kesuburan.', isMonster: false },
  { id: 'oceanus', name: 'Oceanus', category: 'Titans', role: 'Samudra luas yang mengelilingi bumi dengan tenang.', isMonster: false },
  { id: 'tethys', name: 'Tethys', category: 'Titans', role: 'Ibu para sungai dan air tawar bumi.', isMonster: false },
  { id: 'hyperion', name: 'Hyperion', category: 'Titans', role: 'Cahaya surgawi yang menerangi jagat raya.', isMonster: false },
  { id: 'theia', name: 'Theia', category: 'Titans', role: 'Dewi emas, perak, permata, dan penglihatan.', isMonster: false },
  { id: 'mnemosyne', name: 'Mnemosyne', category: 'Titans', role: 'Ibu ingatan yang melahirkan para Muses seni.', isMonster: false },
  { id: 'themis', name: 'Themis', category: 'Titans', role: 'Dewi keadilan alami dan ketertiban ilahi.', isMonster: false },
  { id: 'iapetus', name: 'Iapetus', category: 'Titans', role: 'Poros barat yang mewakili mortalitas manusia.', isMonster: false },
  { id: 'coeus', name: 'Coeus', category: 'Titans', role: 'Kecerdasan dan poros utara dari jagat raya.', isMonster: false },
  { id: 'phoebe', name: 'Phoebe', category: 'Titans', role: 'Kecerdasan nubuat dan bulan dari zaman kuno.', isMonster: false },
  { id: 'crius', name: 'Crius', category: 'Titans', role: 'Rasi bintang dan poros selatan langit.', isMonster: false },
  { id: 'prometheus', name: 'Prometheus', category: 'Titans', role: 'Pikiran masa depan yang mencuri api untuk manusia.', isMonster: false },
  { id: 'epimetheus', name: 'Epimetheus', category: 'Titans', role: 'Pikiran masa lalu dengan alasan yang tak sempurna.', isMonster: false },
  { id: 'atlas', name: 'Atlas', category: 'Titans', role: 'Astronot kuat yang memegang langit di pundaknya.', isMonster: false },
  { id: 'selene', name: 'Selene', category: 'Titans', role: 'Dewi bulan yang berkeliling setiap malam.', isMonster: false },
  { id: 'eos', name: 'Eos', category: 'Titans', role: 'Dewi fajar yang membuka pintu pagi hari.', isMonster: false },

  // ===== MINOR & ABSTRACT GODS =====
  { id: 'eros', name: 'Eros', category: 'Minor Gods', role: 'Dewa nafsu dan cinta seksual, anak Aphrodite.', isMonster: false },
  { id: 'nike', name: 'Nike', category: 'Minor Gods', role: 'Dewi kemenangan yang merayakan setiap keberhasilan.', isMonster: false },
  { id: 'nemesis', name: 'Nemesis', category: 'Minor Gods', role: 'Dewi pembalasan yang menyeimbangkan keadilan.', isMonster: false },
  { id: 'tyche', name: 'Tyche', category: 'Minor Gods', role: 'Dewi keberuntungan dan nasib baik yang berlaku.', isMonster: false },
  { id: 'khione', name: 'Khione', category: 'Minor Gods', role: 'Dewi salju dan musim dingin yang membeku.', isMonster: false },
  { id: 'boreas', name: 'Boreas', category: 'Minor Gods', role: 'Angin utara yang membawa musim dingin dingin.', isMonster: false },
  { id: 'zephyrus', name: 'Zephyrus', category: 'Minor Gods', role: 'Angin barat yang membawa musim semi hangat.', isMonster: false },
  { id: 'notus', name: 'Notus', category: 'Minor Gods', role: 'Angin selatan yang membawa musim gugur basah.', isMonster: false },
  { id: 'eurus', name: 'Eurus', category: 'Minor Gods', role: 'Angin timur dari arah fajar.', isMonster: false },
  { id: 'phobos', name: 'Phobos', category: 'Minor Gods', role: 'Rasa takut yang memendam, anak Ares.', isMonster: false },
  { id: 'deimos', name: 'Deimos', category: 'Minor Gods', role: 'Rasa teror dan kepanikan, anak Ares.', isMonster: false },
  { id: 'harmonia', name: 'Harmonia', category: 'Minor Gods', role: 'Harmoni dan kerukunan yang menyatukan semua.', isMonster: false },
  { id: 'hygieia', name: 'Hygieia', category: 'Minor Gods', role: 'Kebersihan dan kesehatan fisik yang terjaga.', isMonster: false },
  { id: 'plutus', name: 'Plutus', category: 'Minor Gods', role: 'Kekayaan materi dan kelimpahan yang berlipat.', isMonster: false },
  { id: 'momus', name: 'Momus', category: 'Minor Gods', role: 'Kritik dan satir yang mengejek segala hal.', isMonster: false },
  { id: 'enyo', name: 'Enyo', category: 'Minor Gods', role: 'Kehancuran perang, pendamping Ares dalam pertempuran.', isMonster: false },
  { id: 'ganymede', name: 'Ganymede', category: 'Minor Gods', role: 'Pembawa cangkir dewa yang diangkat menjadi dewa.', isMonster: false },

  // ===== MONSTERS =====
  { id: 'cyclops', name: 'The Cyclopes', category: 'Monsters', role: 'Raksasa mata satu yang mengingatkan bahwa kekuatan bisa berubah jadi monster.', isMonster: true },
  { id: 'polyphemus', name: 'Polyphemus', category: 'Monsters', role: 'Makhluk paling menakutkan dari pulau terpencil.', isMonster: true },
  { id: 'sirens', name: 'The Sirens', category: 'Monsters', role: 'Makhluk laut yang memikat lewat suara, lalu menghilangkan arah.', isMonster: true },
  { id: 'scylla', name: 'Scylla', category: 'Monsters', role: 'Monster berkepala banyak yang menuntut keputusan sulit.', isMonster: true },
  { id: 'charybdis', name: 'Charybdis', category: 'Monsters', role: 'Pusaran laut yang menelan semua yang tak siap.', isMonster: true },
  { id: 'laestrygonians', name: 'Laestrygonians', category: 'Monsters', role: 'Raksasa pemakan manusia yang tak mengenal belas kasihan.', isMonster: true },
  { id: 'lotus_eaters', name: 'Lotus Eaters', category: 'Monsters', role: 'Penduduk yang membuat orang lupa tujuan hidupnya.', isMonster: true },
  { id: 'winions', name: 'Winions', category: 'Monsters', role: 'Makhluk angin yang mengelilingi keputusan yang tak pasti.', isMonster: true },
  { id: 'princess_winion', name: 'Princess Winion', category: 'Monsters', role: 'Varian kuat dari angin yang suka menebarkan rasa penasaran.', isMonster: true },
  { id: 'cerberus', name: 'Cerberus', category: 'Underworld Monsters', role: 'Anjing berkepala tiga yang menjaga gerbang dunia bawah.', isMonster: true },
  { id: 'medusa', name: 'Medusa', category: 'Monsters', role: 'Gorgon dengan tatapan yang mengubah siapa pun menjadi batu.', isMonster: true },
  { id: 'minotaur', name: 'Minotaur', category: 'Monsters', role: 'Makhluk bertubuh manusia dan kepala banteng yang terperangkap di labirin.', isMonster: true },
  { id: 'hydra', name: 'Hydra', category: 'Monsters', role: 'Ular berkepala banyak yang menumbuhkan ancaman baru setiap kali dilukai.', isMonster: true },
  { id: 'kraken', name: 'Kraken', category: 'Monsters', role: 'Raksasa laut yang mampu menarik kapal ke dasar samudra.', isMonster: true },
  { id: 'chimera', name: 'Chimera', category: 'Monsters', role: 'Makhluk gabungan singa, kambing, dan ular yang menyemburkan api.', isMonster: true },
  { id: 'manticore', name: 'Manticore', category: 'Monsters', role: 'Pemangsa bersayap dengan ekor berduri dan wajah yang mengerikan.', isMonster: true },
  { id: 'nemean_lion', name: 'Nemean Lion', category: 'Monsters', role: 'Singa berkulit kebal yang tidak dapat dikalahkan oleh senjata biasa.', isMonster: true },
  { id: 'erinyes', name: 'The Erinyes', category: 'Underworld Monsters', role: 'Tiga roh pembalas yang mengejar pelanggar sumpah dan keadilan.', isMonster: true },
  { id: 'empusa', name: 'Empusa', category: 'Underworld Monsters', role: 'Roh penggoda malam yang menghisap tenaga para pengembara.', isMonster: true },
  { id: 'lamia', name: 'Lamia', category: 'Underworld Monsters', role: 'Monster malam yang bersembunyi di antara mimpi dan dunia orang mati.', isMonster: true }
]

const ALL_CHARACTERS = [...EPIC_CHARACTERS, ...EXTRA_CHARACTERS]
const GODS = Array.from(new Set([
  ...EPIC_CHARACTERS.filter(x => x.category === 'Gods').map(x => x.name),
  ...EXTRA_CHARACTERS.filter(x => ['Gods', 'Gods Mentioned', 'Olympian Gods', 'Twelve Olympians', 'Underworld Gods', 'Nature Gods', 'Primordial Deities', 'Titans', 'Minor Gods'].includes(x.category)).map(x => x.name)
]))

if (!global.epicVoice) global.epicVoice = {}

const random = arr => arr[Math.floor(Math.random() * arr.length)]
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
const normalizeList = value => [...new Set(String(value || '').split(',').map(x => x.trim()).filter(Boolean))]
const cleanNumber = value => Number(String(value).replace(/[^\d.-]/g, '')) || 0
const prettyTime = ms => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${hours}h ${minutes}m ${seconds}s`
}
const firstName = jid => {
  if (!jid) return 'kamu'
  const out = String(jid).split('@')[0]
  return out || 'kamu'
}
const listText = (title, items) => `🎭 *EPIC MUSICAL*\n\n*${title}*\n\n${items.map((x, i) => `${i + 1}. ${x}`).join('\n')}`

const getEpic = db => {
  if (!db.epic) db.epic = {}
  if (!db.epic.profile) db.epic.profile = {}
  if (!db.epic.leaderboard) db.epic.leaderboard = []
}

const getProfile = (db, id) => {
  getEpic(db)
  if (!db.epic.profile[id]) {
    db.epic.profile[id] = {
      name: 'Belum diatur',
      saga: 'Belum dipilih',
      song: 'Belum dipilih',
      favoriteCharacters: [],
      favoriteGods: [],
      favoriteMonsters: [],
      chapters: [],
      divePoints: 0,
      diveCooldownAt: 0,
      quizCurrent: null,
      story: null,
      storyWins: 0,
      storyLosses: 0,
      bestStoryRun: 'Belum ada'
    }
  }
  const profile = db.epic.profile[id]
  profile.favoriteCharacters = Array.isArray(profile.favoriteCharacters) ? profile.favoriteCharacters : []
  profile.favoriteGods = Array.isArray(profile.favoriteGods) ? profile.favoriteGods : []
  profile.favoriteMonsters = Array.isArray(profile.favoriteMonsters) ? profile.favoriteMonsters : []
  profile.chapters = Array.isArray(profile.chapters) ? profile.chapters : []
  profile.divePoints = Math.max(0, Number(profile.divePoints || 0))
  profile.diveCooldownAt = Number(profile.diveCooldownAt || 0)
  profile.quizCurrent = profile.quizCurrent ?? null
  return profile
}

const isEpicAdmin = ctx => Boolean(ctx.isOwner)

const findSaga = input => {
  const n = Number(input)
  if (!Number.isNaN(n) && n > 0 && n <= EPIC_SAGAS.length) return EPIC_SAGAS[n - 1]
  const s = String(input || '').trim().toLowerCase()
  return EPIC_SAGAS.find(x => x.name.toLowerCase() === s || x.id.toLowerCase() === s) || null
}

const findSong = input => {
  const n = Number(input)
  if (!Number.isNaN(n) && n > 0 && n <= EPIC_SONGS.length) return EPIC_SONGS[n - 1]
  const s = String(input || '').trim().toLowerCase()
  return EPIC_SONGS.find(x => x.name.toLowerCase() === s || x.id.toLowerCase() === s) || null
}

const findCharacter = input => {
  const n = Number(input)
  if (!Number.isNaN(n) && n > 0 && n <= ALL_CHARACTERS.length) return ALL_CHARACTERS[n - 1]
  const s = String(input || '').trim().toLowerCase()
  return ALL_CHARACTERS.find(x => x.name.toLowerCase() === s || x.id.toLowerCase() === s) || null
}
const findCharactersByType = (value, type) => normalizeList(value).map(input => findCharacter(input)).filter(character => {
  if (!character) return false
  if (type === 'monster') return character.isMonster
  if (type === 'god') return GODS.includes(character.name)
  return ['Humans & Ithaca', 'Trojan War', 'Underworld Souls', 'Extra Suitors', 'Suitors'].includes(character.category)
})

const sagaListText = () => listText('EPIC SAGAS', EPIC_SAGAS.map(x => x.name))
const songListText = () => `🎭 *EPIC MUSICAL*\n\n*EPIC SONGS BY SAGA*\n\n${EPIC_SAGAS.map(saga => `${saga.name}\n${EPIC_SONGS.filter(song => song.saga === saga.name).map((song, i) => `${i + 1}. ${song.name}`).join('\n')}`).join('\n\n')}`
const characterListText = (type = 'all') => {
  if (type === 'only') {
    const main = EPIC_CHARACTERS.map((ch, i) => `${i + 1}. ${ch.name}`).join('\n')
    return `🎭 *EPIC MUSICAL - MAIN CHARACTERS*\n\n${main}`
  }
  if (type === 'extra') {
    const extra = EXTRA_CHARACTERS.map((ch, i) => `${i + 1}. ${ch.name}`).join('\n')
    return `🎭 *EPIC MUSICAL - EXTRA CHARACTERS*\n\n${extra}`
  }
  const main = EPIC_CHARACTERS.map((ch, i) => `${i + 1}. ${ch.name}`).join('\n')
  const extra = EXTRA_CHARACTERS.map((ch, i) => `${EPIC_CHARACTERS.length + i + 1}. ${ch.name}`).join('\n')
  return `🎭 *EPIC MUSICAL - ALL CHARACTERS*\n\n*MAIN CHARACTERS*\n\n${main}\n\n*EXTRA CHARACTERS*\n\n${extra}`
}
const charDetailText = ch => `⚔️ *${ch.name}*\n\n🧭 Kategori: ${ch.category}\n📌 Role: ${ch.role}\n${ch.isMonster ? '☠️ Status: Monster' : '✨ Status: Character'}`

const epicCreateQueue = members => {
  const songs = shuffle(EPIC_SONGS.map(x => x.name))
  return shuffle(members).map((user, i) => ({ user, song: songs[i % songs.length] }))
}

const epicVoiceStatus = room => {
  const memberText = room.members.map(u => `${room.finished.includes(u) ? '✅' : room.skipped && room.skipped.includes(u) ? '⏭️' : '⏳'} @${u.split('@')[0]}`).join('\n')
  let text = `🎤 *EPIC VOICE LOBBY*\n\n👑 Host: @${room.host.split('@')[0]}\n👥 Member: ${room.members.length}\n\n${memberText}`
  if (room.started) {
    text += `\n\n🎶 Progress: ${room.finished.length}/${room.members.length}`
    if (room.current) text += `\n\n🎤 Sekarang: @${room.current.user.split('@')[0]}\n🎵 Lagu: ${room.current.song}`
  } else {
    text += '\n\n⚪ Status: Menunggu start'
  }
  return text
}

const getWhatIfTarget = (m, args = []) => {
  const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo || m.contextInfo || {}
  const mentioned = m.mentionedJid || m.mentionedJids || contextInfo.mentionedJid || []
  const normalizeJid = value => {
    if (!value) return null
    const jid = String(value)
    if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid')) return jid
    if (/^\d+$/.test(jid)) return `${jid}@s.whatsapp.net`
    return jid
  }
  if (mentioned.length) return normalizeJid(mentioned[0])
  if (m.quoted?.sender) return normalizeJid(m.quoted.sender)
  if (contextInfo.participant) return normalizeJid(contextInfo.participant)
  const rawTarget = args.find(value => !/^\d+$/.test(String(value)) && String(value).toLowerCase() !== 'set')
  if (rawTarget) {
    const digits = String(rawTarget).replace(/\D/g, '')
    if (digits.length >= 8) return normalizeJid(digits)
  }
  return m.sender
}

const whatIfText = (target, ch) => {
  const person = firstName(target)
  const lines = [
  `What if ${person} became a character in *EPIC MUSICAL*?\n\nThey'd fit as *${ch.name}* because their vibe matches *${ch.category}* and their destiny is: *${ch.role}*.`,
  
  `If ${person} entered the EPIC world, they'd be *${ch.name}* — *${ch.role.toLowerCase()}* feels like a role made specifically for them.`,
  
  `A wild thought: ${person} in the EPIC timeline.\n\nThe perfect match is *${ch.name}* — carrying *${ch.category}* energy with a *${ch.role}* aura.`,
  
  `If ${person} joined the story, they'd absolutely become *${ch.name}*.\n\nTheir personality fits the path of *${ch.category}* and the destiny of *${ch.role}*.`,
  
  `What if ${person} became part of the myth?\n\nThey'd be *${ch.name}* — a perfect representation of *${ch.category}* with the fate of *${ch.role}*.`,
  
  `${person} just entered the world of *EPIC MUSICAL*.\n\nThe gods would see them as *${ch.name}*, someone born with *${ch.category}* and destined for *${ch.role}*.`,
  
  `Imagine ${person} sailing through the EPIC universe.\n\nTheir role? Definitely *${ch.name}* — carrying the spirit of *${ch.category}* and becoming *${ch.role}*.`,
  
  `The prophecy has changed...\n\n${person} would take the place of *${ch.name}*, bringing *${ch.category}* energy into the story as *${ch.role}*.`,
  
  `If the Muses wrote a new chapter about ${person}, the character would be *${ch.name}*.\n\nA perfect blend of *${ch.category}* and *${ch.role}*.`,
  
  `A new legend appears in the EPIC universe.\n\n${person} becomes *${ch.name}* — a character defined by *${ch.category}* and the destiny of *${ch.role}*.`,
  
  `The halls of Olympus whisper a new name: ${person}.\n\nTheir closest match is *${ch.name}*, carrying the power of *${ch.category}* and the fate of *${ch.role}*.`,
  
  `If ${person} had a song in *EPIC MUSICAL*, it would tell the story of *${ch.name}*.\n\nA journey shaped by *${ch.category}* and the role of *${ch.role}*.`,
  
  `Breaking news from the ancient world:\n\n${person} has been chosen as *${ch.name}* — a perfect match for *${ch.category}* with a destiny called *${ch.role}*.`,
  
  `The oracle reveals a strange possibility...\n\n${person} was meant to become *${ch.name}*, following the path of *${ch.category}* and embracing *${ch.role}*.`,
  
  `A forgotten tale from the EPIC universe:\n\n${person} appears as *${ch.name}*, a figure representing *${ch.category}* and carrying the role of *${ch.role}*.`,
  
  `The story needs a new hero, and it chooses ${person}.\n\nTheir identity becomes *${ch.name}* — matching the essence of *${ch.category}* and the destiny of *${ch.role}*.`,
  
  `From mortal to legend...\n\n${person}'s EPIC transformation would be *${ch.name}*, a character powered by *${ch.category}* and known as *${ch.role}*.`,
  
  `The songs of the ancient world change their lyrics when ${person} arrives.\n\nThey become *${ch.name}*, representing *${ch.category}* and the fate of *${ch.role}*.`,
  
  `What role would fate give ${person} in *EPIC MUSICAL*?\n\nThe answer is *${ch.name}* — someone who embodies *${ch.category}* and lives as *${ch.role}*.`,
  
  `A new myth is written today.\n\n${person} takes the identity of *${ch.name}*, walking a path filled with *${ch.category}* and becoming *${ch.role}*.`
]
  return random(lines)
}

const monsterRevealText = (ch, target) => { 
  const person = firstName(target)
  const lines = [
  `🩸 *WUJUD ASLI ${person.toUpperCase()}*\n\n${person} bukan sekadar manusia biasa. Mereka sebenarnya adalah *${ch.name}* — *${ch.category}* yang menyamar sempurna.\n\n✨ Sifat asli: ${ch.role}`,

  `🌑 *MONSTER REVEALED: ${person.toUpperCase()}*\n\nSelama ini mereka menyembunyikan identitas sebenarnya. Di balik wajah manusia, mereka adalah *${ch.name}*, sang *${ch.category}*.\n\n⚔️ Tujuan tersembunyi: *${ch.role}*`,

  `🕯️ *RAHASIA TERBUKA*\n\nTidak ada yang menyangka bahwa ${person} adalah bagian dari dunia monster.\n\nMereka adalah *${ch.name}* — *${ch.category}* dengan takdir: *${ch.role}*.`,

  `💀 *IDENTITAS SEBENARNYA*\n\nTopeng manusia akhirnya runtuh.\n\n${person} ternyata adalah *${ch.name}*, makhluk *${ch.category}* yang memiliki sifat: *${ch.role}*.`,

  `⚠️ *MONSTER REVEAL*\n\nJangan tertipu oleh penampilannya.\n\n${person} bukan manusia biasa, melainkan *${ch.name}* — *${ch.category}* yang bergerak dalam bayangan.`,

  `🩶 *FILE RAHASIA DITEMUKAN*\n\nNama: ${person}\nStatus: *${ch.name}*\nJenis: *${ch.category}*\n\nKemampuan utama: *${ch.role}*`,

  `🔮 *RAMALAN TERUNGKAP*\n\nPara peramal telah melihat kebenarannya.\n\n${person} akan dikenal sebagai *${ch.name}*, sosok *${ch.category}* dengan peran: *${ch.role}*.`,

  `🌘 *JANGAN PERCAYA WAJAHNYA*\n\n${person} terlihat seperti manusia biasa, tetapi kenyataannya mereka adalah *${ch.name}*.\n\nSebuah *${ch.category}* yang membawa sifat: *${ch.role}*.`,

  `🔥 *TRANSFORMASI DIMULAI*\n\nSaat wujud aslinya muncul, semua orang menyadari bahwa ${person} adalah *${ch.name}*.\n\nMakhluk *${ch.category}* dengan kekuatan: *${ch.role}*.`,

  `👁️ *MATA DUNIA MONSTER TERBUKA*\n\nIdentitas ${person} akhirnya diketahui.\n\nMereka adalah *${ch.name}* — *${ch.category}* yang memiliki misi besar: *${ch.role}*.`,

  `🩸 *SUBJEK TERIDENTIFIKASI*\n\nPenyelidikan selesai.\n\n${person} dikonfirmasi sebagai *${ch.name}*, sebuah entitas *${ch.category}* dengan karakteristik *${ch.role}*.`,

  `🌙 *DARI BAYANGAN MUNCUL KEBENARAN*\n\nSelama ini ${person} bersembunyi sebagai manusia.\n\nNamun wujud aslinya adalah *${ch.name}* — *${ch.category}* yang dikenal karena *${ch.role}*.`,

  `☠️ *ALARM MONSTER AKTIF*\n\nAda sesuatu yang berbeda dari ${person}.\n\nMereka bukan manusia biasa, tetapi *${ch.name}*, sang *${ch.category}* dengan tujuan *${ch.role}*.`,

  `🖤 *CATATAN TERLARANG*\n\nJangan pernah membuka rahasia ini.\n\n${person} sebenarnya adalah *${ch.name}* — makhluk *${ch.category}* yang menyimpan sifat: *${ch.role}*.`,

  `⚔️ *LEGEND OF ${person.toUpperCase()}*\n\nSebuah legenda baru muncul.\n\n${person} dikenal sebagai *${ch.name}*, sosok *${ch.category}* yang membawa takdir *${ch.role}*.`,

  `🕸️ *PERINGATAN: IDENTITAS TERUNGKAP*\n\nSistem mendeteksi bahwa ${person} memiliki wujud asli sebagai *${ch.name}*.\n\nKategori: *${ch.category}*\nSifat: *${ch.role}*`,

  `🌌 *DUNIA LAIN MEMANGGIL*\n\n${person} akhirnya kembali ke bentuk sebenarnya.\n\nMereka adalah *${ch.name}*, entitas *${ch.category}* dengan tujuan *${ch.role}*.`,

  `🩸 *THE TRUTH BEHIND ${person.toUpperCase()}*\n\nManusia hanyalah penyamaran.\n\nDi baliknya terdapat *${ch.name}*, makhluk *${ch.category}* yang ditakdirkan untuk *${ch.role}*.`,

  `💠 *HASIL INVESTIGASI MONSTER*\n\nNama target: ${person}\nWujud asli: *${ch.name}*\nKategori: *${ch.category}*\nKarakteristik: *${ch.role}*`,

  `🚨 *RAHASIA TERBESAR TERUNGKAP*\n\nSemua orang salah menilai ${person}.\n\nKarena sebenarnya mereka adalah *${ch.name}* — *${ch.category}* yang memiliki tujuan: *${ch.role}*.`
]
  return random(lines)
}

const EPIC_STORY_EVENTS = [
  { title: '🐴 The Horse and the Infant', prompt: 'Perang Troya akhirnya mencapai titik terakhir setelah sepuluh tahun pertempuran panjang. Athena memberikan sebuah rencana berbahaya: membuat kuda kayu raksasa sebagai hadiah palsu untuk Troya, sementara pasukan Yunani bersembunyi di dalamnya. Namun keputusan ini bukan hanya tentang kemenangan, tetapi juga tentang beban moral yang akan kamu bawa setelah melihat akibat perang.', choices: [
    { label: 'Mengikuti strategi Athena dan menggunakan kuda kayu untuk mengakhiri perang Troya', success: true },
    { label: 'Menolak rencana tipu daya dan memilih menghadapi Troya melalui pertempuran terbuka', success: false }
  ]},

  { title: '⚔️ Just a Man', prompt: 'Troya telah jatuh dan kemenangan akhirnya berada di tanganmu. Namun di antara reruntuhan kota, kamu melihat bahwa kemenangan juga membawa penderitaan besar. Sebagai seorang manusia, kamu harus menerima bahwa keputusan seorang pemimpin dapat menyelamatkan banyak orang sekaligus menghancurkan banyak kehidupan.', choices: [
    { label: 'Menerima rasa bersalah sebagai manusia dan tetap melanjutkan perjalanan pulang', success: true },
    { label: 'Mengabaikan semua penderitaan dan hanya menikmati kemenangan yang telah diraih', success: false }
  ]},

  { title: '⛵ Full Speed Ahead', prompt: 'Setelah meninggalkan Troya, kapal-kapal Yunani mulai berlayar menuju Ithaca. Kru yang sudah lama meninggalkan rumah hanya ingin melihat keluarga mereka kembali. Namun laut yang luas menyimpan bahaya, dan setiap keputusan perjalanan dapat menentukan siapa yang akan berhasil pulang.', choices: [
    { label: 'Memimpin perjalanan dengan hati-hati sambil menjaga keselamatan seluruh kru', success: true },
    { label: 'Memaksa kapal bergerak cepat tanpa memikirkan kemungkinan bahaya di depan', success: false }
  ]},

  { title: '🌿 Open Arms', prompt: 'Sebuah pulau terlihat damai setelah perjalanan panjang. Polites percaya bahwa tidak semua hal yang tidak dikenal harus dianggap sebagai ancaman. Ia mengingatkan bahwa setelah bertahun-tahun perang, mungkin masih ada kebaikan yang bisa ditemukan.', choices: [
    { label: 'Membuka hati kepada dunia baru dan mencoba mempercayai orang lain', success: true },
    { label: 'Menutup diri sepenuhnya karena takut kebaikan tersebut hanyalah jebakan', success: false }
  ]},

  { title: '🦉 Warrior of the Mind', prompt: 'Athena menguji kemampuanmu sebagai seorang pemimpin. Baginya, seorang pejuang sejati bukan hanya seseorang yang kuat dalam bertarung, tetapi seseorang yang mampu berpikir ketika semua jalan terlihat mustahil.', choices: [
    { label: 'Menggunakan kecerdikan dan strategi untuk mengatasi setiap rintangan perjalanan', success: true },
    { label: 'Mengandalkan kekuatan dan keberanian tanpa memikirkan rencana berikutnya', success: false }
  ]},

  { title: '👁️ Polyphemus', prompt: 'Di sebuah gua besar, kamu menemukan sumber makanan yang dapat membantu perjalanan. Namun tempat itu ternyata milik Polyphemus, seorang Cyclops yang tidak mengenal belas kasihan. Kesalahan kecil dapat mengubah perjalanan pulang menjadi mimpi buruk.', choices: [
    { label: 'Menyusun rencana cerdas untuk menipu Polyphemus dan menyelamatkan kru', success: true },
    { label: 'Mencoba menghadapi Polyphemus secara langsung tanpa strategi yang matang', success: false }
  ]},

  { title: '🩸 Survive', prompt: 'Setelah menghadapi Cyclops, keadaan kapal menjadi kacau. Kru kehilangan rasa aman dan mulai mempertanyakan apakah mereka masih bisa bertahan. Sebagai pemimpin, kamu harus memilih antara mengejar kemenangan atau memastikan semua orang tetap hidup.', choices: [
    { label: 'Memprioritaskan keselamatan kru dan mencari jalan keluar dari bahaya ini', success: true },
    { label: 'Memaksa kemenangan terakhir meskipun risiko kehilangan lebih banyak nyawa', success: false }
  ]},

  { title: '🕯️ Remember Them', prompt: 'Tidak semua anggota perjalanan berhasil melanjutkan langkah bersama kalian. Nama mereka akan selalu menjadi bagian dari perjalanan ini. Saat rasa kehilangan mulai terasa berat, kamu harus menentukan bagaimana membawa kenangan mereka.', choices: [
    { label: 'Mengingat mereka yang gugur dan menjadikan pengorbanan mereka sebagai alasan untuk terus maju', success: true },
    { label: 'Meninggalkan semua kenangan agar rasa sakit tidak menghambat perjalanan', success: false }
  ]},

  { title: '🌙 My Goodbye', prompt: 'Hubunganmu dengan Athena mengalami perubahan setelah banyak keputusan sulit. Sang dewi kebijaksanaan melihat bahwa perjalanan ini telah mengubahmu menjadi seseorang yang berbeda. Kini kamu harus berjalan tanpa selalu bergantung pada bimbingannya.', choices: [
    { label: 'Menerima perpisahan dengan Athena dan melanjutkan perjalanan dengan kemampuan sendiri', success: true },
    { label: 'Memaksa Athena tetap berada di sisimu karena takut menghadapi perjalanan sendirian', success: false }
  ]},

  { title: '🌊 Storm', prompt: 'Laut mulai menunjukkan kekuatannya. Badai besar menghantam kapal dan membuat seluruh kru kehilangan arah. Dalam situasi seperti ini, kepemimpinanmu menjadi satu-satunya harapan yang tersisa.', choices: [
    { label: 'Tetap berdiri sebagai pemimpin dan membawa kru melewati badai yang mengamuk', success: true },
    { label: 'Menyerah pada kepanikan dan membiarkan badai menentukan nasib perjalanan', success: false }
  ]},

  { title: '🍀 Luck Runs Out', prompt: 'Setelah begitu banyak kejadian buruk, keberuntungan mulai terasa meninggalkan kalian. Kru mulai ragu apakah perjalanan pulang masih mungkin dilakukan. Kepercayaan menjadi sesuatu yang lebih sulit daripada sekadar bertahan hidup.', choices: [
    { label: 'Tetap percaya pada tujuan awal dan menjaga harapan kru agar tidak hilang', success: true },
    { label: 'Membiarkan ketakutan menguasai keputusan dan kehilangan arah perjalanan', success: false }
  ]},

  { title: '🗝️ Keep Your Friends Close', prompt: 'Perjalanan panjang mulai menguji hubungan antara kamu dan kru. Ketakutan, kelelahan, dan kehilangan membuat beberapa orang mulai mempertanyakan keputusanmu sebagai pemimpin.', choices: [
    { label: 'Mendengarkan kru dan memperkuat hubungan agar tetap berjalan bersama', success: true },
    { label: 'Mengabaikan perasaan kru dan hanya fokus pada tujuan pribadi untuk pulang', success: false }
  ]},

  { title: '🌊 Ruthlessness', prompt: 'Poseidon akhirnya menunjukkan kemarahannya setelah kejadian dengan Polyphemus. Laut yang seharusnya menjadi jalan pulang berubah menjadi tempat hukuman yang tidak mengenal ampun.', choices: [
    { label: 'Menerima ancaman Poseidon dan menggunakan kebijaksanaan untuk bertahan hidup', success: true },
    { label: 'Melawan kemarahan dewa secara langsung tanpa memikirkan akibatnya', success: false }
  ]},

  { title: '🪄 Puppeteer', prompt: 'Kapal tiba di pulau misterius yang dipenuhi kabut. Di dalamnya tinggal Circe, penyihir yang mampu mengubah manusia menjadi sesuatu yang lain. Kini kru membutuhkanmu untuk menyelamatkan mereka.', choices: [
    { label: 'Memasuki istana Circe dan mencari cara membebaskan kru dari sihirnya', success: true },
    { label: 'Meninggalkan pulau tersebut karena takut terkena sihir Circe juga', success: false }
  ]},

  { title: '✨ Wouldn’t You Like', prompt: 'Hermes muncul dengan tawaran bantuan. Ia memberikan kesempatan agar kamu dapat menghadapi Circe tanpa kehilangan kendali atas dirimu sendiri. Namun menerima bantuan dewa juga berarti mempercayai kekuatan di luar dirimu.', choices: [
    { label: 'Menerima bantuan Hermes dan menggunakan kesempatan untuk menyelamatkan kru', success: true },
    { label: 'Menolak bantuan ilahi dan menghadapi Circe hanya dengan kemampuan sendiri', success: false }
  ]},

  { title: '⚔️ Done For', prompt: 'Pertarungan antara Odysseus dan Circe dimulai. Keduanya memiliki kekuatan dan kehendak yang besar. Namun tujuanmu bukan sekadar menang, melainkan membawa kembali orang-orang yang telah hilang.', choices: [
    { label: 'Menggunakan kecerdikan untuk mengalahkan Circe tanpa menghancurkan segalanya', success: true },
    { label: 'Membiarkan amarah mengambil alih dan menyerang tanpa mempertimbangkan akibat', success: false }
  ]},

  { title: '🕊️ There Are Other Ways', prompt: 'Setelah pertarungan, muncul kesempatan untuk memilih jalan berbeda. Tidak semua konflik harus berakhir dengan kehancuran. Kadang memahami musuh dapat membuka solusi yang tidak pernah terpikirkan.', choices: [
    { label: 'Mencari jalan damai yang dapat menyelamatkan semua pihak yang tersisa', success: true },
    { label: 'Tetap memilih kehancuran karena percaya kekuatan adalah satu-satunya jawaban', success: false }
  ]},

  { title: '💀 The Underworld', prompt: 'Untuk menemukan jawaban tentang perjalananmu, kamu harus memasuki dunia bawah. Tempat ini menyimpan jiwa orang yang telah pergi, kenangan menyakitkan, dan kebenaran yang mungkin tidak ingin kamu dengar.', choices: [
    { label: 'Menghadapi masa lalu dan mencari jawaban dari jiwa yang telah pergi', success: true },
    { label: 'Menolak melihat masa lalu karena takut kehilangan kekuatan untuk melanjutkan', success: false }
  ]},

  { title: '🔮 No Longer You', prompt: 'Di dunia bawah, kamu melihat bayangan tentang siapa dirimu di masa depan. Perjalanan panjang telah mengubahmu sedikit demi sedikit. Kini pertanyaannya bukan hanya apakah kamu akan pulang, tetapi apakah dirimu masih sama seperti sebelumnya.', choices: [
    { label: 'Menerima perubahan dalam diri dan belajar dari semua pengalaman perjalanan', success: true },
    { label: 'Menolak perubahan dan berusaha tetap menjadi dirimu yang dulu', success: false }
  ]},

  { title: '👹 Monster', prompt: 'Setelah semua kehilangan dan keputusan sulit, kamu mulai bertanya apakah dirimu masih seorang pahlawan atau telah berubah menjadi monster. Perjalanan ini telah meninggalkan luka yang tidak mudah hilang.', choices: [
    { label: 'Mengakui sisi gelap dalam diri dan tetap berusaha menemukan jalan yang benar', success: true },
    { label: 'Menerima sisi monster sepenuhnya dan membuang semua rasa kemanusiaan', success: false }
  ]},

{ title: '⚡ Suffering', prompt: 'Perjalanan Odysseus semakin berat setelah semua kehilangan yang terjadi. Setiap keputusan membawa luka baru, dan rasa bersalah mulai menghantui pikiran. Namun perjalanan belum berakhir, dan kamu harus menentukan apakah penderitaan akan menghancurkanmu atau membuatmu lebih kuat.', choices: [
{ label: 'Menggunakan semua rasa sakit sebagai alasan untuk terus bertahan dan pulang', success: true },
{ label: 'Membiarkan penderitaan menguasai pikiran hingga kehilangan tujuan awal', success: false }
]},

{ title: '🐺 Different Beast', prompt: 'Setelah melewati banyak tragedi, kamu mulai menyadari bahwa monster tidak selalu memiliki bentuk yang mengerikan. Terkadang keputusan manusia sendiri dapat menciptakan sisi gelap yang lebih berbahaya dari makhluk mana pun.', choices: [
{ label: 'Tetap menjaga sisi manusia meskipun perjalanan telah mengubah dirimu', success: true },
{ label: 'Menerima sisi gelap sepenuhnya dan menjadi sosok tanpa belas kasihan', success: false }
]},

{ title: '🦂 Scylla', prompt: 'Kapalmu memasuki wilayah berbahaya tempat Scylla menunggu di antara batuan laut. Tidak ada pilihan yang sempurna, dan sebagai pemimpin kamu harus memilih keputusan yang paling sedikit membawa kehancuran.', choices: [
{ label: 'Mengambil keputusan sulit demi menyelamatkan sebanyak mungkin kru yang tersisa', success: true },
{ label: 'Mencoba menghindari semuanya tanpa rencana dan membahayakan seluruh perjalanan', success: false }
]},

{ title: '🔥 Mutiny', prompt: 'Ketakutan dan kehilangan membuat kru mulai kehilangan kepercayaan. Mereka mempertanyakan keputusanmu sebagai pemimpin dan pemberontakan mulai muncul di kapal.', choices: [
{ label: 'Mendengarkan keresahan kru dan mencoba memperbaiki hubungan yang rusak', success: true },
{ label: 'Mengabaikan perasaan mereka dan memaksa semua orang tetap mengikuti perintah', success: false }
]},

{ title: '⚡ Thunder Bringer', prompt: 'Kesalahan besar membawa perhatian Zeus. Sang raja para dewa memberikan hukuman dengan petirnya, dan perjalanan yang panjang terancam berakhir dalam satu malam.', choices: [
{ label: 'Menerima akibat keputusan yang terjadi dan berusaha menyelamatkan yang tersisa', success: true },
{ label: 'Menantang keputusan Zeus dan melawan kekuatan Olympus secara langsung', success: false }
]},

{ title: '🏹 Legendary', prompt: 'Di Ithaca, Telemachus tumbuh tanpa ayahnya. Ia hidup di bawah bayangan nama besar Odysseus dan harus menemukan keberaniannya sendiri.', choices: [
{ label: 'Membantu Telemachus menemukan kekuatan dan identitasnya sendiri', success: true },
{ label: 'Membiarkannya menghadapi semuanya sendirian tanpa bantuan', success: false }
]},

{ title: '🐺 Little Wolf', prompt: 'Telemachus menghadapi para pelamar yang meremehkannya. Meski masih muda, ia harus berdiri mempertahankan rumah dan nama keluarganya.', choices: [
{ label: 'Mengajarkan Telemachus untuk melawan dengan keberanian dan kecerdikan', success: true },
{ label: 'Menyuruhnya mundur agar konflik tidak semakin besar', success: false }
]},

{ title: '🌱 We’ll Be Fine', prompt: 'Walaupun keluarga terpisah dan keadaan terasa berat, masih ada harapan kecil bahwa semuanya akan kembali seperti dulu.', choices: [
{ label: 'Tetap menjaga harapan bahwa keluarga akan bersatu kembali suatu hari nanti', success: true },
{ label: 'Menerima keadaan dan berhenti berharap pada masa lalu', success: false }
]},

{ title: '🏝️ Love in Paradise', prompt: 'Odysseus terjebak di Ogygia bersama Calypso. Pulau itu indah dan menawarkan kehidupan tanpa penderitaan, tetapi bukan rumah yang selama ini ia cari.', choices: [
{ label: 'Tetap mengingat Penelope dan memilih kesempatan untuk kembali pulang', success: true },
{ label: 'Menerima kehidupan nyaman bersama Calypso dan melupakan Ithaca', success: false }
]},

{ title: '⚖️ God Games', prompt: 'Athena membawa masalah Odysseus ke hadapan para dewa Olympus. Setiap dewa memiliki pandangan berbeda tentang apakah manusia yang penuh kesalahan masih pantas mendapatkan kesempatan kedua.', choices: [
{ label: 'Mempercayai Athena untuk memperjuangkan kesempatan Odysseus pulang', success: true },
{ label: 'Menyerah pada keputusan para dewa tanpa memperjuangkan nasibnya', success: false }
]},

{ title: '💔 Not Sorry For Loving You', prompt: 'Calypso mengungkapkan perasaannya setelah bertahun-tahun bersama Odysseus. Namun hati Odysseus tetap tertuju pada seseorang yang menunggunya jauh di rumah.', choices: [
{ label: 'Menghargai perasaan Calypso tetapi tetap memilih cinta dan rumahnya', success: true },
{ label: 'Melupakan masa lalu dan menerima kehidupan baru di pulau tersebut', success: false }
]},

{ title: '⚔️ Dangerous', prompt: 'Perjalanan terakhir menuju Ithaca dimulai. Setiap langkah penuh risiko karena musuh, laut, dan masa lalu masih mengejar.', choices: [
{ label: 'Bergerak dengan hati-hati sambil mempersiapkan diri menghadapi bahaya terakhir', success: true },
{ label: 'Bergegas tanpa persiapan karena terlalu ingin segera sampai rumah', success: false }
]},

{ title: '🌀 Charybdis', prompt: 'Pusaran laut raksasa menghadang perjalanan. Tidak ada jalan aman, hanya keputusan sulit yang harus dibuat oleh seorang pemimpin.', choices: [
{ label: 'Memilih jalur yang paling memungkinkan untuk bertahan hidup', success: true },
{ label: 'Memaksa melewati semuanya tanpa mempertimbangkan risiko', success: false }
]},

{ title: '🌊 Get in the Water', prompt: 'Ancaman terakhir memaksamu menghadapi ketakutan terdalam. Tidak ada tempat untuk bersembunyi dan hanya keberanian yang tersisa.', choices: [
{ label: 'Menghadapi bahaya secara langsung dan percaya pada kemampuan bertahan', success: true },
{ label: 'Menyerah pada ketakutan dan membiarkan keadaan menentukan nasib', success: false }
]},

{ title: '⚔️ Six Hundred Strike', prompt: 'Semua luka selama perjalanan berubah menjadi tekad terakhir. Enam ratus alasan, kenangan, dan pengorbanan menjadi kekuatan untuk menghadapi akhir.', choices: [
{ label: 'Menggunakan seluruh pengalaman perjalanan untuk menyelesaikan perjuangan terakhir', success: true },
{ label: 'Membiarkan kemarahan menguasai diri hingga kehilangan kendali', success: false }
]},

{ title: '🏹 The Challenge', prompt: 'Odysseus akhirnya kembali ke Ithaca dengan identitas tersembunyi. Penelope memberikan tantangan busur yang hanya bisa dilakukan oleh orang yang benar-benar ia kenal.', choices: [
{ label: 'Mengikuti tantangan dan membuktikan identitas dengan cara yang tepat', success: true },
{ label: 'Mengungkapkan diri terlalu cepat dan menghadapi semuanya tanpa rencana', success: false }
]},

{ title: '🩸 Hold Them Down', prompt: 'Rahasia akhirnya terbuka dan istana berubah menjadi medan pertarungan. Para pelamar harus menghadapi akibat dari tindakan mereka selama Odysseus pergi.', choices: [
{ label: 'Mengambil kembali rumahnya dengan strategi dan kendali penuh', success: true },
{ label: 'Menyerang tanpa perhitungan karena dikuasai amarah', success: false }
]},

{ title: '👑 Odysseus', prompt: 'Setelah dua puluh tahun perjalanan, nama Odysseus akhirnya kembali terdengar di Ithaca. Namun kemenangan terbesar bukan hanya mengalahkan musuh, melainkan menemukan kembali dirinya sendiri.', choices: [
{ label: 'Menerima masa lalu dan menjadi raja yang lebih bijaksana', success: true },
{ label: 'Tetap hidup dalam kemarahan dan membiarkan luka lama menguasai diri', success: false }
]},

{ title: '✨ I Can’t Help But Wonder', prompt: 'Setelah semuanya selesai, Odysseus melihat kembali perjalanan panjang yang telah mengubah hidupnya. Ia bertanya apakah semua kehilangan dan penderitaan memiliki arti.', choices: [
{ label: 'Mengingat semua orang yang membantunya dan menghargai perjalanan itu', success: true },
{ label: 'Melupakan masa lalu dan hanya fokus pada akhir cerita', success: false }
]},

{ title: '❤️ Would You Fall in Love with Me Again', prompt: 'Akhirnya Odysseus berdiri di hadapan Penelope setelah puluhan tahun terpisah. Waktu telah mengubah mereka berdua, dan pertanyaan terbesar bukan apakah mereka bertemu lagi, tetapi apakah cinta mereka masih sama.', choices: [
{ label: 'Membuka hati dan membangun kembali cinta yang bertahan selama dua puluh tahun', success: true },
{ label: 'Menerima bahwa waktu telah mengubah segalanya dan memilih berjalan sendiri', success: false }
]}

]

const createStoryState = () => ({ active: true, step: 0, dead: false, finished: false, result: null, history: [] })
const updateLeaderboard = (db, user, profile) => {
  getEpic(db)
  const entry = (db.epic.leaderboard || []).find(x => x.user === user)
  const payload = { user, wins: Number(profile.storyWins || 0), losses: Number(profile.storyLosses || 0), best: profile.bestStoryRun || 'Belum ada' }
  if (entry) {
    Object.assign(entry, payload)
  } else {
    db.epic.leaderboard.push(payload)
  }
  db.epic.leaderboard.sort((a, b) => b.wins - a.wins || a.losses - b.losses)
}

const getDiveBonus = profile => {
  const dives = Number(profile.divePoints || 0)
  if (dives >= 1000) return 0.4
  if (dives >= 100) return 0.2
  return dives > 0 ? 0.05 : 0
}
const getStoryChance = profile => Math.min(0.95, 0.5 + getDiveBonus(profile))
const diveNarration = profile => {
  const god = random(ALL_CHARACTERS.filter(character => !character.isMonster && GODS.includes(character.name)))
  return random([
  `Kamu menengadah ke langit dan memohon kepada *${god.name}*: bukakan jalan untuk perjalanan ini.`,

  `Doamu mencapai Olympus dan dunia bawah. *${god.name}*, berikan satu kesempatan lagi sebelum semuanya berakhir.`,

  `Dengan penuh harapan, kamu meminta pertolongan kepada *${god.name}*. Semoga takdir memilih jalan yang menguntungkanmu.`,

  `Di tengah perjalanan yang penuh bahaya, kamu menyebut nama *${god.name}* dan memohon perlindungan ilahi.`,

  `Kekuatan *${god.name}* menjadi harapan terakhir sebelum nasib berikutnya ditentukan.`,

  `Kamu mengangkat tangan ke arah langit dan meminta *${god.name}* mendengar permohonanmu.`,

  `Sebuah doa kecil dikirimkan kepada *${god.name}*. Mungkin kali ini para dewa akan berpihak padamu.`,

  `Dalam keadaan penuh ketidakpastian, kamu memanggil nama *${god.name}* dan berharap keajaiban terjadi.`,

  `Takdir berada di ujung keputusan. Kamu meminta *${god.name}* memberikan sedikit keberuntungan untuk langkah berikutnya.`,

  `Sebelum nasib menentukan hasil akhir, kamu memberikan persembahan doa kepada *${god.name}* dan menunggu jawaban dari para dewa.`
])
}

EPIC_STORY_EVENTS.forEach(event => {
  const successChoice = event.choices.find(choice => choice.success)
  const failureChoice = event.choices.find(choice => !choice.success)
  event.success = successChoice ? successChoice.label.replace(/^✅\s*/, '') : 'Kamu berhasil melewati ujian ini.'
  event.failure = failureChoice ? failureChoice.label.replace(/^❌\s*/, '') : 'Nasib buruk menghentikan perjalananmu.'
  delete event.choices
})
const storyNarration = () => random([
  'Suara laut membisikkan pilihan yang tak bisa dihindari.',
  'Setiap langkah di EPIC MUSICAL terasa seperti ujian yang menunggu keputusanmu.',
  'Kamu bukan lagi penonton. Kamu adalah Odysseus yang harus memilih jalan.',
  'Satu keputusan bisa membawa pulang; satu keputusan bisa mengubah segalanya.',
  'Di tengah badai dan ilusi, tak ada jalan yang benar-benar aman.',
  'Para dewa sedang menonton. Setiap tindakanmu penting.',
  'Rumah menunggu di ujung perjalanan. Tetapi harganya... mahal.',
  'Ingat Polites. Ingat keputusan yang tidak bisa diambil kembali.',
  'Kemenangan dan kehancuran hanya terpilah oleh satu pilihan.',
  'Ithaca menunggu. Penelope menunggu. Tetapi pertama, kamu harus bertahan.',
  'Laut itu tidak peduli siapa dirimu. Hanya pilihan yang peduli.',
  'Athena membisikkan kebijaksanaan. Poseidon menggemuruh kemarahan. Pilih dengan bijak.',
  'Tidak ada cerita tentang perjalanan pulang jika kamu tidak bertahan untuk pulang.',
  'Setiap karakter yang Anda temui adalah cerminan dari pilihan Anda sendiri.'
])
const HADES_REVIVAL_TEXT = [
  'Hades menatapmu dari singgasana hitam. "Satu jiwa meminta kembali hidup? Menarik... tapi belum waktunya namamu tinggal di sini."',

  'Kabut Styx bergerak perlahan. Hades berkata, "Kamu datang lebih cepat dari yang seharusnya. Aku memberimu satu kesempatan untuk kembali."',

  'Hades melihat catatan jiwa di tangannya. "Perjalananmu belum selesai. Ada sesuatu yang masih mengejarmu di dunia atas."',

  'Tongkat Hades menyentuh tanah. "Bangkitlah. Jangan membuat Underworld menjadi tempat akhir ceritamu."',

  'Para arwah terdiam ketika Hades berkata, "Kamu memiliki tekad yang berbeda dari jiwa lain yang datang ke sini."',

  'Hades mulai memperhatikanmu lebih lama. "Masih memaksakan diri berjalan? Bahkan kematian belum mampu menghentikanmu."',

  'Kabut Styx terbuka sekali lagi. Hades berkata, "Kamu kembali meminta jalan keluar... tampaknya takdirmu memang keras kepala."',

  'Hades menghela napas kecil. "Berapa kali lagi kamu akan berdiri setelah jatuh? Rupanya perjalanan ini lebih panjang dari perkiraanku."',

  'Singgasana hitam bergema. "Kamu bukan sekadar mencari kehidupan kedua. Kamu mengejar sesuatu yang belum bisa kamu lepaskan."',

  'Hades menatap bayangan ingatanmu. "Ada nama, janji, dan rumah yang terus menarikmu kembali."',

  'Hades mulai mengenali langkahmu. "Kamu datang lagi dengan luka baru, tetapi alasan yang sama: masih ada tujuan yang belum tercapai."',

  'Dunia bawah menjadi sunyi. Hades berkata, "Aku mulai memahami kenapa kamu terus menolak tinggal di sini."',

  'Hades melihat perjalananmu dari awal hingga sekarang. "Setiap kehilangan membentukmu, tetapi kamu masih memilih untuk maju."',

  'Para arwah memperhatikan saat Hades berkata, "Tidak banyak manusia yang membuat Underworld mengingat namanya."',

  'Hades berdiri dari singgasananya. "Kamu kembali lagi... bukan karena takut mati, tetapi karena masih memiliki sesuatu untuk dilindungi."',

  'Kabut Styx berputar mengelilingimu. Hades berkata, "Aku mulai melihat alasan para dewa masih memperhatikan perjalananmu."',

  'Hades memegang catatan takdirmu. "Menarik... bahkan setelah semua yang terjadi, kamu masih memilih jalan pulang."',

  'Hades tersenyum tipis. "Biasanya manusia memohon kehidupan karena takut kehilangan. Kamu memohon karena masih punya janji."',

  'Underworld terasa lebih tenang. Hades berkata, "Cerita tentangmu mulai terdengar bahkan sampai dunia orang mati."',

  'Hades menatapmu seperti seseorang yang sudah lama mengenalmu. "Kamu sudah melewati terlalu banyak hal untuk berhenti sekarang."',

  'Hades melihat kembali keputusan-keputusanmu. "Aku tahu perjalananmu tidak mudah. Laut, monster, dan para dewa telah mengujimu."',

  'Hades berkata pelan. "Dulu aku hanya melihatmu sebagai jiwa yang meminta kembali. Sekarang aku melihat seseorang yang menolak menyerah."',

  'Para arwah mundur ketika Hades berkata, "Kamu membawa terlalu banyak nama dan kenangan untuk berakhir di sini."',

  'Hades menyentuh sungai Styx. "Setiap kali kamu kembali, alasanmu tetap sama. Kamu masih mencari rumah."',

  'Hades mengingat semua permintaanmu sebelumnya. "Aku sudah memberimu banyak kesempatan. Jangan sia-siakan yang berikutnya."',

  'Hades menatap jauh ke dunia atas. "Bahkan aku mulai penasaran bagaimana akhir perjalananmu akan tertulis."',

  'Singgasana hitam berguncang. "Kamu telah kehilangan banyak hal, tetapi masih mempertahankan satu hal: harapan."',

  'Hades berkata, "Tidak banyak manusia yang membuatku membuka pintu Underworld berkali-kali. Kamu benar-benar berbeda."',

  'Dewa kematian itu terdiam sebelum berkata, "Aku tidak lagi hanya mengembalikanmu. Aku ingin melihat bagaimana kisahmu berakhir."',

  'Hades memberikan jalan keluar sekali lagi. "Pergilah. Masih ada seseorang yang menunggumu di dunia atas."',

  'Hades melihat bayangan perjalananmu. "Dari semua jiwa yang pernah datang, hanya sedikit yang membawa tekad sebesar ini."',

  'Kabut kematian terbuka perlahan. "Kamu sudah melewati perang, kehilangan, dan pengkhianatan. Jangan biarkan semuanya berakhir sekarang."',

  'Hades berkata dengan nada lebih lembut. "Aku mengingat namamu sekarang. Bukan sebagai jiwa yang datang kemari, tetapi sebagai seseorang yang terus kembali."',

  'Para arwah berbisik ketika Hades berkata, "Bahkan dunia bawah tahu bahwa perjalananmu belum selesai."',

  'Hades berdiri dan membuka gerbang terakhir. "Aku tidak memberikanmu kehidupan baru. Aku hanya mengembalikan kesempatan yang masih kamu perjuangkan."',

  'Hades menatapmu lama. "Kamu telah membuktikan bahwa manusia dapat melawan takdir, bahkan ketika para dewa meragukannya."',

  'Dunia bawah menjadi sunyi. Hades berkata, "Pergilah sekali lagi. Bawa semua luka dan pelajaranmu kembali ke dunia yang menunggumu."',

  'Hades tersenyum kecil. "Aku tidak pernah menyangka akan mengenali seorang manusia seperti dirimu. Jangan buat aku menyesal memberimu kesempatan ini."',

  'Hades membuka gerbang Styx untuk terakhir kalinya. "Setelah semua yang kamu lalui, bahkan kematian tidak mampu menghentikan langkahmu."',

  'Hades menatapmu sebagai seorang pengelana, bukan sekadar jiwa. "Pergilah. Akhiri perjalananmu. Dunia atas masih menunggu cerita terakhir darimu."'
]


const hadesRevivalText = (count = 0) => {
  const index = Math.min(count, HADES_REVIVAL_TEXT.length - 1)
  return HADES_REVIVAL_TEXT[index]
}

const epicHomeText = () => `╭❖─ EPIC: THE MUSICAL ─❖╮

🌊 *A FAN-EPIC MUSICAL COMPANION*

*EPIC: The Musical* adalah  
concept album musikal oleh  
*Jorge Rivera-Herrans* yang  
menceritakan ulang kisah  
*Odyssey* karya Homer.

Ikuti perjalanan *Odysseus*,  
Raja Ithaca, selama 10 tahun.  
Melewati perang, lautan berbahaya,  
campur tangan para dewa,  
dan ujian untuk bisa pulang.

╰❖─ *EXPLORE THE MYTH* ─❖╯

⚔️ *THE WORLD AWAITS*
🏛️ Saga: ${EPIC_SAGAS.length}
🎵 Songs: 40
👥 Characters: ${ALL_CHARACTERS.length}

✨ *WHAT LIES WITHIN*
📜 *The Sagas* - 9 bab perjalanan
🎶 *The Songs* - 40 lagu legendaris
📝 *The Lyrics* - Makna tiap bait
🎭 *Gods & Monsters* - Kawan & Lawan
🎲 *Your Fate* - Pilihanmu sendiri

🌐 *Official Site*
https://epicthemusical.com

🎧 *Hear the Music*
.spotify Would You Fall in Love with Me Again

📜 *Read the Words*  
.lirik Not Sorry For Loving You

═━━❖━ *CREDITS* ━❖━━═
⚔️ *Created by:* Eza
📞 *Dev:* wa.me/6282228638623  
🌟 *Supported by:* Nelson

❝ *Begins your journey* ❞

Ketik *.epic command* untuk memulai.`

const storyStatusText = (profile, event) => {
  const step = Math.min(Number(profile.story?.step || 0) + 1, EPIC_STORY_EVENTS.length)
  return `╭❖─ EPIC JOURNEY ─❖╮

⚔️ *${event.title}*

${event.prompt}

─── *STATUS* ───
🧭 Progress: ${step}/${EPIC_STORY_EVENTS.length}
📌 ${profile.story?.dead ? '❌ Run Berakhir' : '⏳ Menunggu Pilihan'}

❝ *Set sail.* ❞
Ketik *.epic journey 1* atau *.epic journey 2*`
}

const storyResultText = (event, success) => success
  ? `╭❖─ YOU SURVIVED ─❖╮

⚔️ *${event.title}*

Kamu bertahan ketika laut, sihir,  
dan rasa takut menutup semua jalan.  
Dengan napas tersisa, kamu melewati  
ujian ini. Kru melihatmu bukan  
sebagai raja yang tak terkalahkan,  
tetapi manusia yang tetap berjalan.

${event.success}

Keberhasilan tidak menghapus luka.  
Ia hanya memberi satu halaman baru.

╰❖─ *LANJUTKAN PERJALAN* ─❖╯`

  : `╭❖─ YOU DIED ─❖╮

⚔️ *${event.title}*

Kali ini keberuntungan meninggalkanmu.  
Kabut menutup pandangan, suara para  
dewa menjauh. Ujian ini mengambil  
lebih banyak dari yang bisa kau tahan.

${event.failure}

Perjalananmu berhenti di sini.  
Bukan karena kisahmu tak berarti,  
tetapi karena laut tak pernah  
menjanjikan semua pahlawan pulang.

╰❖─ *GUNAKAN .epic journey restart* ─❖╯`
}

const epicCommandText = () => `╭❖─ EPIC COMMAND GUIDE ─❖╮

🎭 *EPIC: THE MUSICAL*

Concept album oleh *Jorge Rivera-Herrans*  
yang menceritakan ulang *Odyssey*.  
Proyek fan-made dimulai 2021.

─── *📚 INFO* ───
.epic saga [nomor/nama]
.epic song [nomor/nama]
.epic char [only/extra] [nama]

─── *🧭 JOURNEY* ───
.epic journey
.epic journey next
.epic journey leaderboard

─── *🧠 QUIZ* ───
.epic quiz
.epic quote <dewa> - Quote dari dewa

─── *👤 PROFILE* ───
.epic profile
.epic set nama|saga|song|char|god|monster <nilai>
.epic dive - Divine Intervention

─── *✨ FUN & VOICE* ───
.epic random
.epic whatif [tag/reply]
.epic reveal [tag/reply]
.epic voice create
.epic voice join
.epic voice lobby
.epic voice start
.epic voice next
.epic voice skip
.epic voice repeat
.epic voice leave
.epic voice finish

🌐 *Official Site*
https://epicthemusical.com

🎧 *Try This*
.spotify Would You Fall in Love with Me Again
📜 .lirik Not Sorry For Loving You

❝ *Full Spead Ahead!!.* ❞`
const findQuote = input => {
  const key = String(input || '').trim().toLowerCase().replace(/\s+/g, '-')
  return Object.values(EPIC_QUOTES).find(quote => quote.name.toLowerCase() === String(input || '').trim().toLowerCase() || quote.name.toLowerCase().replace(/\s+/g, '-') === key) || null
}

const handler = async (m, ctx = {}) => {
  const db = ctx.db || global.db || {}
  const user = ctx.user || m.sender
  let args = Array.isArray(ctx.args) ? ctx.args.slice() : []
  let cmd = (ctx.cmd || '').toLowerCase()

  if (!cmd) {
    const text = (m.body || m.text || '').trim()
    if (text.toLowerCase().startsWith('.epic')) {
      const parts = text.slice(5).trim().split(/\s+/).filter(Boolean)
      cmd = (parts.shift() || 'home').toLowerCase()
      args = parts
    }
  }

if (!cmd) cmd = 'home'

if (cmd === 'home') {
  return m.reply(epicHomeText().trim())
}

if (cmd === 'quiz') {
  const p = getProfile(db, user)
  const answer = Number(args[0])

  if (args[0] && (!Number.isInteger(answer) || answer < 1 || answer > 4))
    return m.reply(`╭❖─ *ERROR* ─❖╮\n\n⚠️ Jawab dengan angka 1-4\n╰❖─ *COBA LAGI* ─❖╯`)

  if (args[0]) {
    if (p.quizCurrent === null || p.quizCurrent === undefined)
      return m.reply(`╭❖─ *QUIZ* ─❖╮\n\n❌ Belum ada quiz aktif.\nKetik *.epic quiz* dulu.\n\n╰❖─ *MULAI* ─❖╯`)

    const quiz = EPIC_ALL_QUIZZES[p.quizCurrent]
    const isCorrect = answer === quiz.answer
    p.quizCurrent = null
    saveDB(db)

    return isCorrect
     ? m.reply(`╭❖─ *BENAR!* ─❖╮

✅ Jawabanmu tepat!

${quiz.detail}

❝ *The gods are pleased.* ❞
╰❖─ *EPIC QUIZ* ─❖╯`)

      : m.reply(`╭❖─ *SALAH* ─❖╮

❌ Jawaban benar: *${quiz.answer}. ${quiz.options[quiz.answer - 1]}*

${quiz.detail}

❝ *Learn from this.* ❞
╰❖─ *EPIC QUIZ* ─❖╯`)
  }

  const index = Math.floor(Math.random() * EPIC_ALL_QUIZZES.length)
  const quiz = EPIC_ALL_QUIZZES[index]
  p.quizCurrent = index
  saveDB(db)

  return m.reply(`╭❖─ *EPIC QUIZ* ─❖╮

🧠 *${quiz.question}*

${quiz.options.map((option, i) => `${i + 1}. ${option}`).join('\n')}

─── *CARA JAWAB* ───
Ketik *.epic quiz 1* / *2* / *3* / *4*

❝ *Choose wisely.* ❞
╰❖─ *GOOD LUCK* ─❖╯`)
}

if (cmd === 'quote') {
  const quote = findQuote(args.join(' '))
  if (!quote) return m.reply(`╭❖─ *DEWA TIDAK DITEMUKAN* ─❖╮

❌ Dewa itu tidak ada dalam catatan Olympus.
Pilih salah satu dari ini:

${Object.values(EPIC_QUOTES).map(item => `• ${item.name}`).join('\n')}

─── *CARA PAKAI* ───
.epic quote athena

╰❖─ *DENGARKAN MEREKA* ─❖╯`)

  return m.reply(`╭─  *GULUNGAN KUNO*  ─╮

 👑 *${quote.name.toUpperCase()}*

 “${quote.quote}”

╰─ *Para dewa berbicara...* ─╯`)
}

if (cmd === 'help' || cmd === 'command' || cmd === 'menu') {
  return m.reply(epicCommandText().trim())
}

  if (cmd === 'profile') {
  if (String(args[0] || '').toLowerCase() === 'reset') {
    delete db.epic.profile[user]
    getProfile(db, user)
    saveDB(db)
    return m.reply(`╭❖─ *PROFILE RESET* ─❖╮

♻️ Profile @${firstName(user)} sudah dikembalikan ke awal.
Semua progress dimulai lagi dari nol.

❝ *Lahir kembali.* ❞
╰❖─ *MULAI PETUALANGAN* ─❖╯`, { mentions: [user] })
  }

  const p = getProfile(db, user)
  const chars = (p.favoriteCharacters || []).length? p.favoriteCharacters.join(', ') : 'Belum dipilih'
  const gods = (p.favoriteGods || []).length? p.favoriteGods.join(', ') : 'Belum dipilih'
  const monsters = (p.favoriteMonsters || []).length? p.favoriteMonsters.join(', ') : 'Belum dipilih'
  const divePoints = Number(p.divePoints || 0)
  const profileName = p.name === 'Belum diatur'? `@${firstName(user)}` : p.name

  return m.reply(`╭❖─ *EPIC PROFILE* ─❖╮

👤 *Name*: ${profileName}
✨ *Dive Point*: ${divePoints}
📚 *Saga Progress*: ${p.chapters.length? p.chapters.join(', ') : 'Belum ada'}

─── *FAVORIT* ───
💙 *Characters*: ${chars}
👑 *Gods*: ${gods}
👹 *Monsters*: ${monsters}

─── *CATATAN PERJALAN* ───
🏆 *Story Wins*: ${p.storyWins || 0}
💀 *Story Losses*: ${p.storyLosses || 0}
📖 *Best Run*: ${p.bestStoryRun || 0} tahap

╭❖─ *CREDITS* ─❖╮

⚔️ *Developer*: Eza
📞 *Contact*: wa.me/6282228638623
🤝 *Supported by*: Nelson

╰❖─ *FAN-MADE* ─❖╯`, { mentions: [user] })
}

if (cmd === 'set') {
  const p = getProfile(db, user)
  const raw = args.join(' ').trim()

  if (!raw) {
    return m.reply(`╭❖─ *CARA SET PROFIL* ─❖╮

⚠️ Format:
.epic set nama Odysseus
.epic set saga Ithaca song Troy char Odysseus, Penelope

*BISA SET SEKALIGUS*
Pisahkan field dengan spasi nama field

╰❖─ *UKIR NAMAMU* ─❖╯`)
  }

  const errors = []
  const success = []

  // pecah per field: nama|name|saga|song|char|character|god|monster
  const regex = /(nama|name|saga|song|char|character|god|monster)\s+([^]+?)(?=\s+(?:nama|name|saga|song|char|character|god|monster)\s+|$)/gi
  const matches = [...raw.matchAll(regex)]

  if (!matches.length) {
    return m.reply(`╭❖─ *FORMAT SALAH* ─❖╮\n\n⚠️ Contoh:.epic set nama Telemachus saga Troy\n╰❖─ *COBA LAGI* ─❖╯`)
  }

  for (const m of matches) {
    const field = m[1].toLowerCase()
    const value = m[2].trim()

    if (field === 'nama' || field === 'name') {
      p.name = value
      success.push(`👤 Nama: ${value}`)
    }
    else if (field === 'saga') {
      const saga = findSaga(value)
      if (!saga) errors.push(`Saga: ${value}`)
      else { p.saga = saga.name; success.push(`📚 Saga: ${saga.name}`) }
    }
    else if (field === 'song') {
      const song = findSong(value)
      if (!song) errors.push(`Song: ${value}`)
      else { p.song = song.name; success.push(`🎵 Song: ${song.name}`) }
    }
    else if (field === 'char' || field === 'character') {
      const list = normalizeList(value)
      const characters = findCharactersByType(value, 'character')
      if (characters.length!== list.length) errors.push(`Char: ${value}`)
      else { p.favoriteCharacters = characters.map(c => c.name); success.push(`💙 Char: ${characters.map(c => c.name).join(', ')}`) }
    }
    else if (field === 'god') {
      const list = normalizeList(value)
      const gods = findCharactersByType(value, 'god')
      if (gods.length!== list.length) errors.push(`God: ${value}`)
      else { p.favoriteGods = gods.map(c => c.name); success.push(`👑 God: ${gods.map(c => c.name).join(', ')}`) }
    }
    else if (field === 'monster') {
      const list = normalizeList(value)
      const monsters = findCharactersByType(value, 'monster')
      if (monsters.length!== list.length) errors.push(`Monster: ${value}`)
      else { p.favoriteMonsters = monsters.map(c => c.name); success.push(`👹 Monster: ${monsters.map(c => c.name).join(', ')}`) }
    }
  }

  saveDB(db)

  let text = `╭❖─ *PROFIL DIUPDATE* ─❖╮\n\n`
  if (success.length) text += `✅ *BERHASIL:*\n${success.map(s => `• ${s}`).join('\n')}\n\n`
  if (errors.length) text += `❌ *GAGAL:* \n${errors.map(e => `• ${e} tidak ditemukan`).join('\n')}\n\n`
  text += `❝ *Destiny awaits.* ❞\n╰❖─ *EPIC PROFILE* ─❖╯`

  return m.reply(text, { mentions: [user] })
}

if (cmd === 'random') {
  const saga = random(EPIC_SAGAS)
  const song = random(EPIC_SONGS)
  const god = random(GODS)
  return m.reply(`╭❖─ *YOUR EPIC DESTINY* ─❖╮

🌊 *Saga*: ${saga.name}
🎵 *Song*: ${song.name}
👑 *Divine Favor*: ${god}

Kamu sedang siap melangkah ke bab
yang paling berani dalam kisah ini.

❝ *Fate is calling.* ❞
╰❖─ *THE GODS CHOOSE* ─❖╯`)
}

if (cmd === 'whatif') {
  const target = getWhatIfTarget(m, args)
  const ch = random([...EPIC_CHARACTERS,...EXTRA_CHARACTERS])
  return m.reply(`╭❖─ *WHAT IF...* ─❖╮

${whatIfText(target, ch).replace(/^\n/, '')}

❝ *Bagaimana jika...* ❞
╰❖─ *ALTERNATE TALE* ─❖╯`, { mentions: [target] })
}

if (cmd === 'greet') {
  const target = getWhatIfTarget(m, args)
  const name = firstName(target)
  const greeting = random([
    `🌊 Selamat datang, *${name}*. Kapal EPIC sudah menunggumu di pelabuhan Ithaca.`,
    `🎭 *${name}*, para dewa sudah mendengar langkahmu. Semoga perjalananmu menjadi legenda.`,
    `⚔️ Salam untuk *${name}*, pejuang baru di lautan EPIC. Jangan biarkan takdir menulis semuanya untukmu.`,
    `✨ Bangkitlah, *${name}*. Bahkan ombak paling gelap tetap punya jalan pulang.`,
    `🏛️ *${name}*, Olympus dan Underworld sedang memperhatikanmu. Selamat datang di kisahmu sendiri.`
  ])
  return m.reply(`╭❖─ *SALAM DARI OLYMPUS* ─❖╮

${greeting}

╰❖─ *WELCOME ABOARD* ─❖╯`, { mentions: [target] })
}

if (cmd === 'card') {
  const p = getProfile(db, user)
  const profileName = p.name === 'Belum diatur'? `@${firstName(user)}` : p.name
  const favoriteGod = p.favoriteGods?.[0] || 'Belum dipilih'
  const favoriteMonster = p.favoriteMonsters?.[0] || 'Belum dipilih'
  return m.reply(`╭❖─ *EPIC FAN CARD* ─❖╮

👤 *${profileName}*
🌊 *Saga*: ${p.saga || 'Belum dipilih'}
🎵 *Song*: ${p.song || 'Belum dipilih'}
👑 *Divine Favor*: ${favoriteGod}
👹 *Monster Form*: ${favoriteMonster}

─── *STAT* ───
✨ *Dive Point*: ${Number(p.divePoints || 0)}
🏆 *Journey Wins*: ${Number(p.storyWins || 0)}

Fan-made EPIC companion card
❝ *Write your own myth.* ❞
╰❖─ *IDENTITY* ─❖╯`, { mentions: [user] })
}

if (cmd === 'reveal') {
  const target = getWhatIfTarget(m, args)
  const monster = random(ALL_CHARACTERS.filter(x => x.isMonster))
  return m.reply(`╭❖─ *WUJUD ASLI TERUNGKAP* ─❖╮

${monsterRevealText(monster, target).replace(/^\n/, '')}

❝ *Kau bukan yang terlihat.* ❞
╰❖─ *MONSTER REVEAL* ─❖╯`, { mentions: [target] })
}

if (cmd === 'dive') {
  const p = getProfile(db, user)

  if (String(args[0] || '').toLowerCase() === 'set') {
    if (!isEpicAdmin(ctx)) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya owner yang bisa mengatur Dive Point.\n╰❖─ *OLYMPUS* ─❖╯`)

    const target = getWhatIfTarget(m, args)
    const targetArgs = args.slice(1)
    const targetArg = targetArgs.find(value => !/^\d+$/.test(String(value)))
    const valueArg = targetArg ? targetArgs[targetArgs.indexOf(targetArg) + 1] : args[1]
    const value = Number(valueArg)
    if (!Number.isFinite(value) || value < 0) return m.reply(`╭❖─ *FORMAT SALAH* ─❖╮\n\n⚠️ Format:.epic dive set <jumlah>\n╰❖─ *COBA LAGI* ─❖╯`)

    const targetProfile = getProfile(db, target)
    targetProfile.divePoints = Math.floor(value)
    saveDB(db)
    return m.reply(`╭❖─ *DIVE POINT DIATUR* ─❖╮

👤 *Target*: @${firstName(target)}
✨ *Dive Point*: ${targetProfile.divePoints}
📈 *Bonus Story*: +${(getDiveBonus(targetProfile) * 100).toFixed(0)}%

❝ *The gods grant you favor.* ❞
╰❖─ *OLYMPUS* ─❖╯`, { mentions: [target] })
  }

  const now = Date.now()
  if (p.diveCooldownAt && now < p.diveCooldownAt) {
    return m.reply(`╭❖─ *COOLDOWN* ─❖╮

⏳ *DIVINE INTERVENTION COOLDOWN*
${prettyTime(p.diveCooldownAt - now)} lagi sebelum kamu bisa meminta bantuan dewa.

╰❖─ *SABAR* ─❖╯`)
  }

  p.divePoints = Math.max(0, Number(p.divePoints || 0)) + 1
  p.diveCooldownAt = now + 3600000
  saveDB(db)
  return m.reply(`╭❖─ *DIVINE INTERVENTION* ─❖╮

${diveNarration(p)}

✨ *Dive Point*: ${p.divePoints}
🎲 *Bonus Journey*: +${(getDiveBonus(p) * 100).toFixed(0)}%

Ketik.epic journey next untuk mencoba keberuntunganmu.

❝ *A god watches over you.* ❞
╰❖─ *OLYMPUS* ─❖╯`)
}

if (cmd === 'delete') {
  if (!isEpicAdmin(ctx)) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya owner yang bisa menghapus data Epic.\n╰❖─ *OLYMPUS* ─❖╯`)

  const target = getWhatIfTarget(m, args)
  delete db.epic.profile[target]
  if (Array.isArray(db.epic.leaderboard)) db.epic.leaderboard = db.epic.leaderboard.filter(entry => entry.user!== target)
  saveDB(db)
  return m.reply(`╭❖─ *DATA DIHAPUS* ─❖╮

🗑️ Semua data Epic @${firstName(target)} telah dihapus.
Dia bisa memulai kisah baru dari nol.

❝ *Wiped from history.* ❞
╰❖─ *OLYMPUS* ─❖╯`, { mentions: [target] })
}

if (cmd === 'journey' || cmd === 'story' || cmd === 'stories') {
  const p = getProfile(db, user)
  const sub = String(args[0] || '').toLowerCase()

  if (sub === 'restart') {
    p.story = createStoryState()
    const event = EPIC_STORY_EVENTS[0]
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY RESTART* ─❖╮

🔁 Kisahmu berputar kembali ke halaman pertama.
Semua langkah sebelumnya tenggelam bersama ombak.

${storyStatusText(p, event)}

${storyNarration()}

❝ *From the beginning.* ❞
╰❖─ *ODYSSEY* ─❖╯`)
  }

  if (sub === 'continue') {
    if (!p.story ||!p.story.dead) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Tidak ada run yang mati untuk dilanjutkan.\n╰❖─ *CEK STATUS* ─❖╯`)
    p.story = {...p.story, dead: false, active: true, finished: false, result: null }
    const event = EPIC_STORY_EVENTS[p.story.step] || EPIC_STORY_EVENTS[0]
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY CONTINUE* ─❖╮

🩹 Di batas dunia bawah, Hades mendengar namamu.
Ia membuka kembali jalan dari kematian.

${storyStatusText(p, event)}

${storyNarration()}

❝ *Second chance.* ❞
╰❖─ *UNDERWORLD* ─❖╯`)
  }

  if (sub === 'leaderboard' || sub === 'lb') {
    const board = (db.epic.leaderboard || []).slice(0, 5)
    if (!board.length) return m.reply(`╭❖─ *LEADERBOARD KOSONG* ─❖╮\n\n📊 Belum ada pemain yang menamatkan run.\n╰❖─ *JADI YANG PERTAMA* ─❖╯`)
    return m.reply(`╭❖─ *EPIC LEADERBOARD* ─❖╮

${board.map((x, i) => `${i + 1}. @${firstName(x.user)} — Win ${x.wins} | Lose ${x.losses}`).join('\n')}

❝ *Legends are made here.* ❞
╰❖─ *TOP 5* ─❖╯`, { mentions: board.map(x => x.user) })
  }

  if (!p.story ||!p.story.active) {
    p.story = createStoryState()
    saveDB(db)
    const event = EPIC_STORY_EVENTS[0]
    return m.reply(`╭❖─ *JOURNEY DIMULAI* ─❖╮

🗺️ Kapalmu menunggu di pelabuhan.
Jalan menuju Ithaca terbuka di hadapanmu.

${storyStatusText(p, event)}

${storyNarration()}

❝ *Set sail.* ❞
╰❖─ *ODYSSEY* ─❖╯`)
  }

  if (p.story.dead) return m.reply(`╭❖─ *KAMU TELAH GUGUR* ─❖╮\n\n💀 Gunakan.epic journey continue atau.epic journey restart.\n╰❖─ *PILIH JALANMU* ─❖╯`)

  if (sub!== 'next') {
    const currentEvent = EPIC_STORY_EVENTS[Number(p.story.step || 0)] || EPIC_STORY_EVENTS[0]
    return m.reply(storyStatusText(p, currentEvent))
  }

  const idx = Number(p.story.step || 0)
  const event = EPIC_STORY_EVENTS[idx]
  if (!event) {
    p.story.finished = true
    p.story.active = false
    p.story.result = 'success'
    p.storyWins = Number(p.storyWins || 0) + 1
    p.bestStoryRun = 'Sukses'
    updateLeaderboard(db, user, p)
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY SELESAI* ─❖╮

🏆 Kamu bertahan sampai akhir.
Kamu menuntaskan perjalanan Odysseus.

📊 *Statistik*: ${p.storyWins} menang, ${p.storyLosses} gagal

Gunakan.epic journey restart untuk main lagi.

❝ *You made it home.* ❞
╰❖─ *VICTORY* ─❖╯`)
  }

  const chance = getStoryChance(p)
  const alive = Math.random() < chance

  if (!alive) {
    p.story.dead = true
    p.story.active = false
    p.story.result = 'dead'
    p.storyLosses = Number(p.storyLosses || 0) + 1
    p.bestStoryRun = p.bestStoryRun === 'Belum ada'? 'Gagal' : p.bestStoryRun
    updateLeaderboard(db, user, p)
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY GAGAL* ─❖╮

💀 *${event.title}*

${storyResultText(event, false)}

🎲 *Peluang berhasil*: ${(chance * 100).toFixed(0)}%

Gunakan.epic journey continue atau.epic journey restart.

❝ *Not yet.* ❞
╰❖─ *DEFEAT* ─❖╯`)
  }

  p.story.history.push({ event: event.title, result: 'success' })
  p.story.step += 1

  if (p.story.step >= EPIC_STORY_EVENTS.length) {
    p.story.finished = true
    p.story.active = false
    p.story.result = 'success'
    p.storyWins = Number(p.storyWins || 0) + 1
    p.bestStoryRun = 'Sukses'
    updateLeaderboard(db, user, p)
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY SELESAI* ─❖╮

🏆 Kamu bertahan sampai akhir.
Kamu menuntaskan perjalanan Odysseus.

📊 *Statistik*: ${p.storyWins} menang, ${p.storyLosses} gagal

Gunakan.epic journey restart untuk main lagi.

❝ *You made it home.* ❞
╰❖─ *VICTORY* ─❖╯`)
  }

  const nextEvent = EPIC_STORY_EVENTS[p.story.step]
  saveDB(db)
  return m.reply(`╭❖─ *JOURNEY BERHASIL* ─❖╮

✅ *${event.title}*

${storyResultText(event, true)}

🎲 *Peluang berhasil*: ${(chance * 100).toFixed(0)}%
🧭 *Next*: ${nextEvent.title}

${nextEvent.prompt}

${storyNarration()}

Ketik.epic journey next saat siap melanjutkan.

❝ *Onward.* ❞
╰❖─ *ODYSSEY* ─❖╯`)
}

if (cmd === 'voice') {
  const sub = (args[0] || '').toLowerCase()

  if (!sub || sub === 'lobby') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Belum ada EPIC Voice Lobby di grup ini.\n\nBuat dengan:.epic voice create\n╰❖─ *BUAT SEKARANG* ─❖╯`)
    return m.reply(`╭❖─ *EPIC VOICE LOBBY* ─❖╮\n\n${epicVoiceStatus(room)}\n\n❝ *The stage awaits.* ❞\n╰❖─ *SIAP BERAKSI* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'create') {
    if (global.epicVoice[m.chat]) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Sudah ada EPIC Voice Lobby di grup ini.\n╰❖─ *PAKE YG ADA* ─❖╯`)
    global.epicVoice[m.chat] = { host: m.sender, members: [m.sender], started: false, finished: [], skipped: [], queue: [], current: null }
    return m.reply(`╭❖─ *LOBBY DIBUAT* ─❖╮

👑 *Host*: @${firstName(m.sender)}

Member bisa join:.epic voice join
Mulai:.epic voice start

❝ *Siapa yang akan bernyanyi?* ❞
╰❖─ *EPIC VOICE* ─❖╯`, { mentions: [m.sender] })
  }

  if (sub === 'join') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Belum ada EPIC Voice Lobby.\n╰❖─ *BUAT DULU* ─❖╯`)
    if (room.started) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Voice sudah dimulai.\n╰❖─ *TUNGGU ROUND BARU* ─❖╯`)
    if (room.members.includes(m.sender)) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Kamu sudah masuk lobby.\n╰❖─ *SANTAI* ─❖╯`)
    if (room.members.length >= EPIC_SONGS.length) return m.reply(`╭❖─ *LOBBY PENUH* ─❖╮\n\n❌ Maksimal: ${EPIC_SONGS.length} orang\nKarena setiap orang harus dapat lagu berbeda.\n╰❖─ *PENUH* ─❖╯`)
    room.members.push(m.sender)
    return m.reply(`╭❖─ *BERHASIL JOIN* ─❖╮\n\n✅ Kamu masuk EPIC Voice!\n\n${epicVoiceStatus(room)}\n\n╰❖─ *WELCOME* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'leave') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Tidak ada lobby.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host === m.sender) {
      delete global.epicVoice[m.chat]
      return m.reply(`╭❖─ *LOBBY DIBUBARKAN* ─❖╮\n\n👑 Host keluar.\nLobby EPIC Voice telah ditutup.\n╰❖─ *SELESAI* ─❖╯`)
    }
    room.members = room.members.filter(x => x!== m.sender)
    room.finished = room.finished.filter(x => x!== m.sender)
    room.skipped = (room.skipped || []).filter(x => x!== m.sender)
    return m.reply(`╭❖─ *BERHASIL KELUAR* ─❖╮\n\n🚪 Kamu keluar dari EPIC Voice.\n\n${epicVoiceStatus(room)}\n\n╰❖─ *SEE YOU* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'start') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Belum ada lobby.\n╰❖─ *BUAT DULU* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host yang bisa start.\n╰❖─ *OLYMPUS* ─❖╯`)
    if (room.members.length < 2) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Minimal 2 orang untuk mulai voice.\n╰❖─ *AJAK TEMAN* ─❖╯`)
    room.started = true
    room.finished = []
    room.skipped = []
    room.queue = epicCreateQueue(room.members)
    room.current = room.queue[0]
    return m.reply(`╭❖─ *VOICE DIMULAI* ─❖╮

🎤 *Penyanyi Pertama*: @${firstName(room.current.user)}
🎵 *Lagu*: ${room.current.song}

${epicVoiceStatus(room)}

❝ *Let the music begin.* ❞
╰❖─ *EPIC VOICE* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'next' || sub === 'skip') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Tidak ada lobby.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host yang bisa lanjutkan / skip.\n╰❖─ *OLYMPUS* ─❖╯`)
    if (!room.started) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Voice belum dimulai.\n╰❖─ *START DULU* ─❖╯`)
    if (!room.current) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Belum ada giliran aktif.\n╰❖─ *CEK LAGI* ─❖╯`)

    if (sub === 'skip') {
      room.skipped = room.skipped || []
      room.skipped.push(room.current.user)
    } else {
      room.finished.push(room.current.user)
    }

    const next = room.queue.find(x =>!room.finished.includes(x.user) &&!(room.skipped || []).includes(x.user))
    if (!next) {
      room.skipped = []
      const retry = room.queue.find(x =>!room.finished.includes(x.user))
      if (!retry) {
        room.finished = []
        room.current = null
        return m.reply(`╭❖─ *SELESAI 1 ROUND* ─❖╮

🎉 Semua member sudah bernyanyi!

Pilihan:
.epic voice repeat
.epic voice finish

❝ *Encore?* ❞
╰❖─ *EPIC VOICE* ─❖╯`, { mentions: room.members })
      }
      room.current = retry
      return m.reply(`╭❖─ *GILIRAN BERIKUTNYA* ─❖╮

🎤 *@${firstName(retry.user)}*
🎵 *Lagu*: ${retry.song}

${epicVoiceStatus(room)}

╰❖─ *BERNYANYI* ─❖╯`, { mentions: room.members })
    }

    room.current = next
    return m.reply(`╭❖─ *GILIRAN BERIKUTNYA* ─❖╮

🎤 *@${firstName(next.user)}*
🎵 *Lagu*: ${next.song}

${epicVoiceStatus(room)}

╰❖─ *BERNYANYI* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'repeat') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Tidak ada lobby.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host.\n╰❖─ *OLYMPUS* ─❖╯`)
    room.finished = []
    room.skipped = []
    room.queue = epicCreateQueue(room.members)
    room.current = room.queue[0]
    return m.reply(`╭❖─ *VOICE DIULANG* ─❖╮

🔄 Urutan sudah diacak ulang

🎤 *Penyanyi Pertama*: @${firstName(room.current.user)}
🎵 *Lagu*: ${room.current.song}

❝ *From the top.* ❞
╰❖─ *ENCORE* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'finish' || sub === 'delete') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA LOBBY* ─❖╮\n\n❌ Tidak ada lobby.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host.\n╰❖─ *OLYMPUS* ─❖╯`)
    delete global.epicVoice[m.chat]
    return m.reply(`╭❖─ *VOICE SELESAI* ─❖╮

🗑️ EPIC VOICE telah ditutup.
Terima kasih sudah bernyanyi bersama 🎶

❝ *The curtain falls.* ❞
╰❖─ *THE END* ─❖╯`)
  }

  return m.reply(`╭❖─ *EPIC VOICE COMMANDS* ─❖╮

.epic voice create
.epic voice join
.epic voice lobby
.epic voice start
.epic voice next
.epic voice skip
.epic voice repeat
.epic voice leave
.epic voice finish

❝ *Take the stage.* ❞
╰❖─ *COMMAND LIST* ─❖╯`)
}

function legacyEpicCommandText() {
  return `╭❖─ *EPIC MUSICAL - COMMANDS* ─❖╮

─── *📖 INFO* ───
.saga [nomor/nama] - Info saga
.song [nomor/nama] - Info lagu
.char [only/extra] [nomor/nama] - Info karakter
.random - Random saga, lagu, dewa

─── *👤 PROFILE* ───
.profile - Lihat profil
.set <field> <value> - Atur profil
Contoh:.set nama Odysseus saga Troy
Bisa multi:.set char Odys,Penelope god Zeus

─── *🎲 GAMES* ───
.story [restart/continue/lb] - Main story auto-gacha
.dive - Divine Intervention +1 Dive Point
.whatif [@user] - Jadi karakter random
.reveal [@user] - Reveal monster ke orang
.quote [nama dewa] - Dengarkan sabda dewa

─── *🎤 VOICE* ───
.voice create - Buat lobby
.voice join - Join lobby
.voice lobby - Lihat status
.voice start - Mulai bernyanyi
.voice next - Lanjut giliran
.voice skip - Skip giliran
.voice repeat - Ulang round
.voice leave - Keluar
.voice finish - Tutup lobby

─── *⚙️ CARA MAIN* ───
1. Set profil:.epic set nama|Troy|Just A Man
2. Main story:.epic story 
3. Tambah Dive:.epic dive
4. Cek top player:.epic story lb
5. Voice bareng:.epic voice create

─── *✨ TIPS* ───
▫️ Story ditentukan gacha + Dive Point
▫️ Bonus: 5% | 20% | 40%
▫️ Voice: tiap member dapat lagu beda
▫️ Char filter:.epic char only / extra

❝ *Write your own journey.* ❞
╰❖─ *EPIC BOT* ─❖╯`
}

if (cmd === 'command' || cmd === 'commands' || cmd === 'cmd' || cmd === 'help' || cmd === 'menu') {
  return m.reply(epicCommandText())
}

return m.reply(`╭❖─ *EPIC MUSICAL* ─❖╮

📖 *INFO*
.epic command - Daftar lengkap command
.epic saga - Lihat 9 saga
.epic song - Lihat 40 lagu  
.epic char - Daftar karakter

👤 *PROFILE*
.epic profile - Lihat profil
.epic set - Edit profil

🎲 *GAMES*
.epic story - Main story auto-gacha
.epic dive - Divine Intervention
.epic random - Random destiny
.epic whatif - What if jadi karakter
.epic reveal - Reveal monster

🎤 *VOICE*
.epic voice - Voice lobby

❝ *Dengarkan para dewa.* ❞
╰❖─ *KETIK .EPIC COMMAND* ─❖╯`)
}

handler.help = ['epic']
handler.tags = ['misc']
handler.command = /^epic$/i

export default handler