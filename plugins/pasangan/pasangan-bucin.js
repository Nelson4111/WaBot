/**
 * Kata-Kata Bucin Harian Plugin
 * Koleksi kutipan romantis harian
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

const kataBucin = [
  "Aku tidak pernah meminta banyak dalam doa, cukup namamu yang selalu membersamai setiap langkahku.",
  "Bukan karena tidak ada pilihan lain di dunia, melainkan karena hatiku hanya berlabuh padamu seorang.",
  "Mengenalmu adalah takdir terindah, mencintaimu adalah pilihan yang tidak pernah kusesali.",
  "Kehadiranmu ibarat embun pagi yang menyejukkan, selalu memberi ketenangan di tengah hiruk pikuk dunia.",
  "Di antara miliaran bintang di angkasa, binar matamu adalah lentera yang paling menuntunku pulang.",
  "Rasa ini sederhana: melihat senyummu sudah cukup untuk menyempurnakan seluruh hariku.",
  "Cinta bukan tentang mencari sosok yang sempurna, melainkan belajar melihat ketidaksempurnaan dengan penuh keindahan.",
  "Jika aku diberi kesempatan mengulang waktu, aku akan tetap memilih jalan yang membawaku bertemu denganmu.",
  "Kamu adalah alasan mengapa hal-hal sederhana terasa begitu istimewa dan hari-hari biasa menjadi penuh makna.",
  "Aku tidak butuh dunia yang selalu berpihak padaku, selama kamu tetap memilih untuk berada di sisiku.",
  "Namamu mungkin hanya terdiri dari beberapa huruf, tetapi maknanya memenuhi seluruh ruang di hatiku.",
  "Aku ingin menjadi tempatmu bercerita ketika dunia terasa terlalu bising dan tempatmu beristirahat ketika lelah melanda.",
  "Bersamamu, aku belajar bahwa bahagia tidak harus selalu megah, terkadang cukup dengan duduk berdua tanpa banyak bicara.",
  "Andai rindu bisa dikirim dalam bentuk pelukan, mungkin setiap hari kamu akan menerima jutaan dariku.",
  "Aku tidak tahu bagaimana masa depan akan berjalan, tetapi aku tahu siapa yang ingin kugenggam sepanjang perjalanan.",
  "Kamu tidak perlu menjadi matahari yang selalu bersinar, bagiku kamu tetap berharga bahkan ketika sedang redup.",
  "Ada banyak hal yang tidak bisa kujelaskan dengan kata-kata, tetapi semuanya terasa masuk akal ketika menyangkut dirimu.",
  "Aku menyukai caramu menjadi dirimu sendiri, tanpa perlu berpura-pura menjadi seseorang yang bukan dirimu.",
  "Kalau mencintaimu adalah sebuah perjalanan, aku tidak keberatan berjalan perlahan selama kita masih searah.",
  "Kamu adalah bagian favorit dari hari-hariku, bahkan ketika kita hanya bertukar pesan singkat.",
  "Aku ingin mengenalmu berkali-kali, jatuh cinta kepadamu berkali-kali, dan memilihmu berkali-kali.",
  "Tidak semua pertemuan meninggalkan kesan, tetapi pertemuanku denganmu mengubah banyak hal dalam hidupku.",
  "Kamu mungkin tidak sadar, tetapi kehadiranmu sering kali menjadi alasan aku kembali tersenyum setelah hari yang berat.",
  "Aku ingin mencintaimu dengan cara yang membuatmu merasa aman, bukan dengan cara yang membuatmu takut kehilangan.",
  "Seandainya waktu bisa berhenti, aku ingin menghentikannya sebentar ketika kita sedang tertawa bersama.",
  "Aku tidak menjanjikan hidup tanpa masalah, tetapi aku ingin menjadi seseorang yang tetap menggenggam tanganmu saat masalah datang.",
  "Di antara semua hal yang ingin kucapai, membangun masa depan bersamamu adalah salah satu impian yang paling kujaga.",
  "Kamu adalah pesan yang selalu ingin kubaca, suara yang selalu ingin kudengar, dan seseorang yang selalu ingin kutemui.",
  "Aku tidak pernah bosan menemukan alasan baru untuk jatuh cinta kepada orang yang sama, yaitu kamu.",
  "Jika hatiku adalah sebuah rumah, aku ingin namamu tertulis di pintu dan tawamu tinggal di setiap sudutnya.",
  "Aku ingin mengenal semua versimu, termasuk yang paling diam, paling lelah, dan paling sulit untuk dimengerti.",
  "Bukan seberapa sering kita bertemu yang membuatku yakin, melainkan bagaimana hatiku tetap memilihmu meski sedang berjauhan.",
  "Kamu membuatku percaya bahwa seseorang bisa terasa seperti rumah, meski awalnya hanya orang asing yang baru dikenal.",
  "Aku ingin menjadi kabar baik yang kamu tunggu dan seseorang yang membuatmu merasa bahwa harimu tidak dijalani sendirian.",
  "Cintaku mungkin tidak selalu pandai diucapkan, tetapi aku ingin membuktikannya melalui hal-hal kecil yang kulakukan setiap hari.",
  "Aku tidak membutuhkan alasan besar untuk merindukanmu, sebab memikirkanmu saja sudah cukup membuat jarak terasa panjang.",
  "Kalau suatu hari rambut kita memutih dan langkah kita melambat, aku berharap tangan yang kugenggam tetap tanganmu.",
  "Aku ingin mendengar cerita yang sama darimu berkali-kali, sebab hal yang kamu sukai selalu punya tempat di hatiku.",
  "Kamu bukan sekadar seseorang yang ingin kumiliki, tetapi seseorang yang ingin kulihat tumbuh dan bahagia.",
  "Aku ingin mencintaimu tanpa membuatmu kehilangan dirimu sendiri, sebab kebahagiaanmu juga bagian dari kebahagiaanku.",
  "Kadang aku tersenyum sendiri hanya karena mengingat percakapan kecil yang mungkin sudah kamu lupakan.",
  "Kamu mengajarkanku bahwa rindu tidak selalu menyakitkan, terkadang ia menjadi bukti bahwa seseorang begitu berarti.",
  "Jika dunia memberiku seribu alasan untuk menyerah, aku berharap kita masih punya satu alasan untuk mencoba lagi bersama.",
  "Aku tidak ingin menjadi cinta paling sempurna dalam hidupmu, aku hanya ingin menjadi cinta yang tulus dan terus bertumbuh.",
  "Kamu adalah seseorang yang ingin kuceritakan kepada masa depanku ketika mereka bertanya tentang kebahagiaan masa mudaku.",
  "Aku suka bagaimana satu pesan darimu mampu mengubah suasana hatiku tanpa perlu melakukan sesuatu yang luar biasa.",
  "Mencintaimu membuatku mengerti bahwa kesetiaan bukan tentang tidak memiliki pilihan, melainkan mengetahui pilihan mana yang ingin dijaga.",
  "Aku ingin menjadi orang pertama yang kamu cari ketika bahagia dan orang yang tetap kamu percaya ketika sedang terluka.",
  "Tidak perlu setiap hari menjadi istimewa, sebab hari biasa bersamamu pun sudah memiliki arti tersendiri.",
  "Jika rindu memiliki alamat, aku yakin semua surat di hatiku akan menuju tempat yang sama, yaitu kamu.",
  "Aku ingin menghabiskan waktu bersamamu, bukan karena takut kehilangan waktu, melainkan karena setiap detiknya terasa berharga.",
  "Ada ketenangan yang tidak bisa kutemukan di mana pun, tetapi selalu hadir ketika aku tahu kamu baik-baik saja.",
  "Aku tidak bisa menjanjikan semua mimpimu akan terwujud, tetapi aku ingin menjadi seseorang yang mendukungmu mengejarnya.",
  "Kamu membuatku ingin menjadi pribadi yang lebih baik, bukan karena kamu menuntutnya, melainkan karena aku ingin tumbuh bersamamu.",
  "Aku ingin tetap mengenal hal-hal kecil tentangmu, seperti makanan favoritmu, kebiasaan anehmu, dan hal sederhana yang membuatmu bahagia.",
  "Jika suatu hari kita berbeda pendapat, aku ingin kita tetap mengingat bahwa kita berada di sisi yang sama, bukan saling berhadapan.",
  "Aku tidak ingin hanya hadir ketika semuanya mudah, aku ingin belajar bertahan ketika hidup tidak berjalan sesuai rencana.",
  "Kamu adalah nama yang muncul di pikiranku ketika mendengar lagu cinta dan wajah yang terbayang ketika membaca kata rindu.",
  "Aku ingin menjadi alasan kamu percaya bahwa dicintai tidak harus selalu terasa melelahkan.",
  "Bersamamu, aku tidak harus selalu punya jawaban, sebab terkadang cukup dengan saling mendengarkan sudah membuat segalanya lebih ringan.",
  "Kalau cinta adalah seni memahami, aku ingin terus belajar membaca hatimu tanpa merasa paling tahu tentang dirimu.",
  "Aku ingin melihatmu mencapai semua yang kamu impikan, bahkan jika perjalanan menuju ke sana membuat kita harus belajar banyak hal.",
  "Kamu tidak harus selalu kuat di depanku, sebab aku ingin mengenalmu juga dalam keadaan paling rapuh sekalipun.",
  "Aku menyimpan banyak doa untukmu, termasuk doa agar kamu selalu menemukan alasan untuk bahagia meski aku tidak sedang di dekatmu.",
  "Jarak mungkin membuat kita tidak bisa bertemu setiap saat, tetapi tidak pernah membuatmu kehilangan tempat di pikiranku.",
  "Aku ingin menjadi seseorang yang kehadirannya tidak menambah beban hidupmu, melainkan membantu membuatnya terasa lebih ringan.",
  "Dari sekian banyak hal yang bisa berubah, aku berharap cara kita saling menghargai tidak pernah ikut menghilang.",
  "Kamu adalah kejutan indah yang tidak pernah kurencanakan, tetapi kini menjadi bagian yang tidak ingin kulewatkan.",
  "Aku ingin merayakan keberhasilanmu seolah itu keberhasilanku sendiri dan menemanimu bangkit tanpa membuatmu merasa kecil.",
  "Bukan hadiah mahal atau kata-kata indah yang paling kuharapkan, melainkan kesempatan untuk terus mengenalmu dengan lebih dalam.",
  "Aku ingin kita punya banyak cerita untuk dikenang, mulai dari petualangan besar sampai percakapan tidak penting sebelum tidur.",
  "Ada banyak tempat indah di dunia, tetapi aku ingin mengunjunginya bersama seseorang yang membuat perjalanan terasa lebih berarti, yaitu kamu.",
  "Aku tidak pernah tahu bahwa sebuah notifikasi bisa membuatku tersenyum selebar ini sampai pesanmu menjadi bagian dari hariku.",
  "Aku ingin mencintaimu dengan kesabaran, menghargaimu dengan ketulusan, dan menjagamu tanpa pernah merasa berhak mengatur hidupmu.",
  "Kalau nanti kita menua, aku ingin tetap mendengar tawamu dan menemukan kebahagiaan dalam kebiasaan-kebiasaan kecil kita.",
  "Aku tidak ingin kamu tinggal karena merasa berutang atas cintaku, aku ingin kamu tinggal karena kita sama-sama ingin bertahan.",
  "Kamu membuat kata pulang memiliki arti yang berbeda, sebab sekarang aku tahu bahwa rumah juga bisa berupa seseorang.",
  "Aku ingin mengenalmu lebih dari sekadar cerita yang kamu bagikan, tetapi juga memahami hal-hal yang masih sulit kamu ungkapkan.",
  "Tidak masalah jika langkah kita sesekali melambat, selama kita masih mau saling menunggu dan tidak meninggalkan satu sama lain.",
  "Aku suka membayangkan masa depan yang sederhana bersamamu, dengan obrolan panjang, makanan kesukaan, dan tawa yang tidak dibuat-buat.",
  "Jika aku bisa menitipkan satu hal kepada waktu, aku ingin menitipkan lebih banyak kesempatan untuk membuatmu merasa dicintai.",
  "Kamu tidak harus selalu membuatku bahagia, sebab aku mencintaimu sebagai manusia, bukan sebagai sumber kebahagiaan semata.",
  "Aku ingin menjadi seseorang yang bisa kamu ajak membicarakan mimpi paling tinggi sekaligus kekhawatiran paling sederhana.",
  "Ada banyak hal yang belum kumengerti tentang cinta, tetapi aku ingin mempelajarinya dengan seseorang yang juga mau belajar bersamaku.",
  "Aku berharap setiap kali kamu meragukan dirimu sendiri, kamu ingat bahwa ada seseorang yang melihat begitu banyak hal baik dalam dirimu.",
  "Aku tidak ingin hubungan kita hanya dipenuhi janji, aku ingin ada usaha kecil yang membuat janji itu perlahan menjadi nyata.",
  "Kamu adalah bagian dari harapan-harapan kecilku, dari pesan selamat pagi sampai doa sederhana sebelum memejamkan mata.",
  "Aku ingin tetap memilihmu bahkan setelah kita mengetahui kekurangan masing-masing, sebab cinta yang dewasa tidak berhenti pada kekaguman.",
  "Mungkin aku tidak selalu bisa berada di sampingmu, tetapi aku ingin kamu tahu bahwa perasaan tulus tidak harus selalu ditunjukkan dengan jarak yang dekat.",
  "Aku ingin menjadi pendengar bagi cerita yang sudah kamu ulang seratus kali dan tetap tertawa di bagian yang sama.",
  "Kamu membuatku memahami bahwa dicintai bukan hanya tentang didengar, tetapi juga tentang dipahami tanpa harus menjelaskan segalanya dengan sempurna.",
  "Aku ingin kita saling memberi ruang untuk tumbuh, tanpa kehilangan alasan untuk kembali saling menggenggam.",
  "Kalau hidup adalah buku yang panjang, aku berharap namamu tidak hanya muncul di satu bab, tetapi menjadi bagian dari banyak halaman berikutnya.",
  "Aku tidak tahu berapa banyak hari yang akan kita miliki bersama, tetapi aku ingin mengisi hari-hari itu dengan ketulusan.",
  "Aku ingin kamu tetap punya dunia sendiri, teman-temanmu, impianmu, dan kebahagiaanmu, sambil tahu bahwa aku senang menjadi bagian darinya.",
  "Bila suatu hari kamu merasa tidak cukup baik, ingatlah bahwa kamu tidak harus sempurna untuk layak menerima cinta yang tulus.",
  "Aku mencintai hal-hal besar tentangmu, tetapi entah mengapa hal-hal kecil yang kamu lakukan justru sering membuatku semakin jatuh hati.",
  "Aku ingin hubungan kita menjadi tempat untuk bertumbuh, bukan perlombaan untuk membuktikan siapa yang paling banyak berkorban.",
  "Sejauh apa pun perjalanan hidup membawaku, aku berharap selalu ada kesempatan untuk kembali duduk di sampingmu dan bertukar cerita.",
  "Aku tidak bisa menghentikan waktu agar kita tidak berubah, tetapi aku ingin tetap mengenal versi baru dirimu di setiap musim kehidupan.",
  "Pada akhirnya, aku tidak meminta kisah cinta yang sempurna, aku hanya berharap kita terus menemukan alasan untuk saling memilih dengan tulus."
]

let handler = async (m) => {
  const kata = kataBucin[Math.floor(Math.random() * kataBucin.length)]

  const txt = `*──  ୨୧ ✧ KUTIPAN ROMANSA HARIAN ✧ ୨୧  ──*

> "${kata}"

*╭  〔 ᰔ ʀ ᴏ ᴍ ᴀ ɴ ꜱ ᴀ 〕*
*┆* ⟡ ꜱᴜᴍʙᴇʀ  : *Koleksi Mutiara Cinta Avelia*
*┆* ✧ ᴘᴇꜱᴀɴ   : *Ungkapkan perasaan tulusmu hari ini ♡*
*╰───────────────*`.trim()

  return m.reply(txt)
}

handler.help = ['bucin']
handler.tags = ['pasangan']
handler.command = /^(bucin)$/i

export default handler
