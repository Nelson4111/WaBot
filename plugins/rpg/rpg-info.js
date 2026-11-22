import { sendRpgButtons } from '../../lib/rpgActionButtons.js'

const CORE_COMMANDS = [
  ['.adventure', 'Profil dan aktivitas petualangan'],
  ['.explore', 'Menjelajahi antarbintang dengan Interstellar Gateway'],
  ['.evx', 'Menu Evonexus; lihat data dengan .evx info'],
  ['.evx core', 'Cari, lihat detail, dan pasang SC Core dengan Stellar Credit'],
  ['.evx body', 'Melihat SC Core Evonexus yang terpasang'],
  ['.lelang / .auctionhouse / .ah', 'Lelang 5 item acak setiap 5 jam dan lihat top kolektor dengan .ah top'],
  ['.rpgstat', 'Melihat statistik RPG'],
  ['.mychar / .bloodline / .wardrobe', 'Melihat karakter, mengatur bloodline, dan outfit'],
  ['.cooldown', 'Melihat cooldown RPG'],
  ['.inv', 'Melihat inventory dan equipment'],
  ['.gudang', 'Melihat stok item'],
  ['.mining', 'Mencari ore'],
  ['.diving / .nyelam', 'Menyelam untuk mencari harta bawah laut'],
  ['.logging / .nebang', 'Menebang pohon untuk mendapatkan kayu dan material'],
  ['.farm / .farm guide / .farming', 'Daftar command, panduan, dan panen kebun serta hasil ternak'],
  ['.dungeon', 'Melawan monster dungeon'],
  ['.arena', 'Menantang pemain lain'],
  ['.kerja', 'Bekerja dan mendapatkan penghasilan'],
  ['.daily', 'Mengambil hadiah harian'],
  ['.shop', 'Membeli item dan equipment'],
  ['.mall', 'Membeli dan menjual barang di Mall'],
  ['.home', 'Mengatur dan mengunjungi rumah pemain'],
  ['.cl', 'Mengelola koleksi dan showcase'],
  ['.jarah / .culik', 'Melakukan aksi kriminal dengan risiko poin kriminal dan penjara'],
  ['.lottery', 'Menu lottery harian'],
  ['.lottery command', 'Melihat command lottery'],
  ['.lottery guide', 'Panduan lottery'],
  ['.craft', 'Membuat item'],
  ['.forge', 'Melebur atau meningkatkan material'],
  ['.ternak', 'Mengelola peternakan'],
  ['.kawin', 'Mengawinkan hewan ternak'],
  ['.kebun', 'Mengelola kebun dan tanaman'],
  ['.dapur', 'Melihat resep dan antrian masakan'],
  ['.makan', 'Memakan masakan dari kulkas'],
  ['.rship', 'Mengelola relationship'],
  ['.guild', 'Mengelola guild'],
  ['.guildwar', 'Mengikuti perang guild'],
  ['.room', 'Mengelola room/channel YouTube'],
  ['.buatyt', 'Membuat channel YouTube baru'],
  ['.akunyt', 'Melihat detail akun/channel YouTube'],
  ['.liveyt', 'Mulai live streaming channel'],
  ['.topyt', 'Melihat ranking channel YouTube'],
  ['.kolab', 'Kolaborasi channel YouTube'],
  ['.kriminal', 'Jumlah kriminal aktif, daftar, top riwayat, detail, info, dan patroli kriminal'],
  ['.guide', 'Membuka panduan detail RPG']
]

const RPG_ACTIVITY_SECTIONS = [
  {
    title: '🧭 PETUALANGAN & EKSPLORASI',
    activities: [
      ['Petualangan', 'adventure', 'Mulai dan kembangkan progres petualangan RPG.'],
      ['Pendakian gunung', 'mt', 'Pilih gunung, mendaki solo atau bersama tim.'],
      ['Berburu makhluk', 'pokemon / ghost', 'Berburu dan bertarung melawan Pokémon atau hantu.'],
      ['Jelajah antarbintang', 'explore', 'Jelajahi planet; perlu Interstellar Gateway dari Stellar Card.']
    ]
  },
  {
    title: '🌿 MENGUMPULKAN SUMBER DAYA',
    activities: [
      ['Memancing', 'mancing / fishing / pancing', 'Tangkap ikan dengan beragam ukuran dan tier.'],
      ['Mining', 'mining / tambang', 'Cari ore dan material tambang.'],
      ['Diving', 'diving / nyelam', 'Menyelam untuk mencari harta laut.'],
      ['Logging', 'logging / nebang', 'Tebang pohon untuk mendapatkan kayu dan material.'],
      ['Mulung', 'mulung / scavenge', 'Cari barang dan material.'],
      ['Bertani', 'tanam / panen / farming', 'Tanam tanaman, panen, dan kumpulkan hasil kebun serta ternak.'],
      ['Beternak', 'ternak / peternakan / kawin / icu', 'Kelola dan rawat hewan ternak, lalu kawinkan untuk mendapatkan hybrid.']
    ]
  },
  {
    title: '🛠️ PRODUKSI & KREASI',
    activities: [
      ['Crafting & peleburan', 'craft / forge', 'Buat item atau lebur material untuk kebutuhan crafting.'],
      ['Masak', 'masak / dapur', 'Buat resep dari bahan yang tersedia.']
    ]
  },
  {
    title: '🐾 PET & KARAKTER',
    activities: [
      ['Merawat dan melatih pet', 'pet feed / pet walk / pet play / pet train / pet hunt / pet dispatch / pet battle / pet breed', 'Rawat, latih, ajak berburu, bertarung, atau kembangbiakkan pet.'],
      ['Gym', 'gym', 'Berlatih untuk mendapatkan EXP dan meningkatkan statistik.'],
      ['Aktivitas rumah', 'home act', 'Lakukan aktivitas di rumah dan dapatkan hasil sesuai fasilitas.']
    ]
  },
  {
    title: '⚔️ PERTARUNGAN & KRIMINAL',
    activities: [
      ['Dungeon', 'dungeon', 'Lawan monster dan dapatkan hadiah.'],
      ['Arena & balapan', 'versus / balap / run / drift / jambak / panco / dance / tampar / tinju', 'Tantang pemain lain dalam duel, balapan, dan pertandingan.'],
      ['Aksi kriminal', 'copet / begal / rampok / jarah / culik / bunuh / fitnah', 'Lakukan aksi kriminal dengan risiko dan konsekuensi RPG.'],
      ['Aktivitas penjara', 'penjara routine / penjara talk / kabur', 'Jalani rutinitas penjara atau coba melarikan diri.'],
      ['Rehabilitasi', 'rh mulai / rh kerja / rh sosial / rh ibadah / rh olahraga / rh belajar', 'Ikuti program rehabilitasi untuk memulihkan status kriminal.']
    ]
  },
  {
    title: '💼 PEKERJAAN & EKONOMI',
    activities: [
      ['Bekerja', 'job work', 'Kerjakan pekerjaan untuk mendapatkan penghasilan.'],
      ['Investasi & trading', 'invest / trading', 'Kelola investasi dan aktivitas trading.'],
      ['Casino', 'casino', 'Mainkan beragam permainan casino.'],
      ['Lottery', 'lottery', 'Beli tiket dan ikuti lottery.'],
      ['Koleksi & lelang', 'cl / lelang', 'Kumpulkan item dan ikuti lelang koleksi.'],
      ['Kelola cafe', 'cafe', 'Bangun dan kelola stok, menu, serta staf cafe.'],
      ['Restoran & masakan', 'restoran / dapur / masak', 'Kelola masakan serta transaksi restoran.'],
      ['Simulasi YouTube', 'buatyt / room / liveyt / kolab', 'Buat channel, live streaming, dan kolaborasi.'],
      ['Hadiah harian', 'daily', 'Klaim hadiah dan jaga streak harian.']
    ]
  },
  {
    title: '🤝 SOSIAL & AKTIVITAS TAMBAHAN',
    activities: [
      ['Misi & pesta guild', 'guild misi / guild party / misiguild / pestaguild', 'Jalankan misi dan aktivitas bersama anggota guild.'],
      ['Latihan & perang guild', 'guild latihan / latihanguild / guildwar', 'Latih anggota atau ikuti perang antarguild.'],
      ['Relationship & keluarga', 'rship date / rship kid', 'Jalankan aktivitas pasangan dan pengasuhan anak.'],
      ['Mode RPG Chainsaw Man', 'csm about', 'Buka dunia RPG CSM yang terpisah dari Avelia RPG.']
    ]
  }
]

let handler = async (m, { conn, text, usedPrefix }) => {
  const action = text?.trim().toLowerCase()

  if (['aktivitas', 'activity', 'activities'].includes(action)) {
    let cap = `╭─❏「 🎮 AKTIVITAS RPG 」❏\n`
    cap += `│ Pilih aktivitas untuk mulai bermain.\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    for (const section of RPG_ACTIVITY_SECTIONS) {
      cap += `*${section.title}*\n`
      for (const [title, command, description] of section.activities) {
        const commands = command.split(' / ').map(name => `${usedPrefix}${name}`).join(' / ')
        cap += `> *${title}* — *${commands}*\n`
        cap += `> ↳ ${description}\n`
      }
      cap += `\n`
    }
    cap += `─━━━━━━━━━━━━━━─\n`
    cap += `💡 Sebagian aktivitas perlu akun RPG, item, fasilitas, cooldown, atau syarat grup tertentu.\n`
    cap += `⚠️ Mining, mancing, diving, logging, farming, adventure, dan explore juga memiliki mode *ilegal* dengan risiko.\n`
    cap += `Ketik *${usedPrefix}rpg command* untuk melihat command RPG lainnya.`
    return m.reply(cap)
  }

  if (action === 'info') {
    return m.reply(
      `╭─❏「 📖 RPG AVELIA 」❏\n` +
      `│ *APA ITU RPG?*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `RPG adalah singkatan dari *Role-Playing Game*, yaitu permainan di mana kamu mengembangkan karakter melalui level, statistik, perlengkapan, resource, aktivitas, dan pilihan permainan. RPG Avelia adalah sistem RPG berbasis chat yang menggabungkan petualangan, ekonomi, pertarungan, koleksi, kehidupan sosial, dan pengelolaan aset.\n\n` +
      `🧭 *KARAKTER & PROGRES*\n` +
      `> ↳ Mulai dari *.adventure* untuk membuat dan mengembangkan karakter.\n` +
      `> ↳ Naikkan level, EXP, darah, sword, armor, pickaxe, fishing rod, dan pet.\n` +
      `> ↳ Cek perkembangan lewat *.inv*, *.rpgstat*, dan *.cooldown*.\n\n` +
      `⛏️ *AKTIVITAS & PERTARUNGAN*\n` +
      `> ↳ Cari material dan ore lewat *.mining*.\n` +
      `> ↳ Cari harta laut lewat *.diving* dan kayu lewat *.logging*.\n` +
      `> ↳ Usaha ilegal: *.mining ilegal* (ledakan), *.mancing ilegal* (jaring listrik), *.diving ilegal*, *.logging ilegal* (pembalakan liar/bakar hutan), *.adventure ilegal*, dan *.explore ilegal*.\n` +
      `> ↳ Usaha ilegal memberi hasil ×1,5 dan +1 poin kriminal per percobaan; ada risiko gagal/tertangkap dan cooldown 2× aktivitas biasa.\n` +
      `> ↳ Lawan monster dan dapatkan reward lewat *.dungeon*.\n` +
      `> ↳ Ikuti lima arena: jambak, panco, dance, tampar, dan tinju.\n` +
      `> ↳ Ikuti aktivitas kriminal seperti copet, begal, rampok, jarah, culik, bunuh, fitnah, dan Aniaya dengan risiko poin kriminal serta penjara.\n\n` +
      `💰 *EKONOMI & ITEM*\n` +
      `> ↳ Dapatkan uang dari daily, kerja, adventure, dungeon, toko, dan aktivitas lainnya.\n` +
      `> ↳ Beli atau jual material, equipment, hasil panen, ikan, masakan, dan item adventure.\n` +
      `> ↳ Buat item lewat *.craft*, tingkatkan equipment lewat *.upgrade*, dan kelola stok lewat *.gudang*.\n` +
      `> ↳ Gunakan *.casino* untuk berbagai permainan dengan batas harian dan cooldown per game.\n\n` +
      `🌾 *KEBUN, TERNAK & MASAKAN*\n` +
      `> ↳ Tanam dan panen tanaman lewat *.kebun*, *.tanam*, dan *.panen*.\n` +
      `> ↳ Gunakan *.farm* untuk daftar command, *.farm guide* untuk panduan, atau *.farming* untuk mengambil panen dan hasil ternak sekaligus.\n` +
      `> ↳ *.farming ilegal* memberi hasil ×1,5 dan +1 poin kriminal, dengan risiko gagal atau dipenjara; cooldown 2× lebih lama.\n` +
      `> ↳ Hasil ternak bisa dikumpulkan kembali setiap 2 menit; hewan tetap hidup.\n` +
      `> ↳ Beli dan rawat hewan lewat *.ternak*, lalu ambil hasil atau sembelih.\n` +
      `> ↳ Kawinkan hewan dan temukan hybrid baru lewat *.kawin*.\n` +
      `> ↳ Masak resep lewat *.dapur* dan *.masak*, lalu simpan di *.kulkas* untuk digunakan lewat *.makan*.\n\n` +
      `💕 *SOSIAL & DUNIA RPG*\n` +
      `> ↳ Bangun relationship, pasangan, hadiah, dan keluarga lewat *.rship*.\n` +
      `> ↳ Buat atau bergabung dengan guild lewat *.guild*, ikut misi, dan berperang lewat *.guildwar*.\n` +
      `> ↳ Kembangkan channel YouTube dan lakukan kolaborasi lewat *.buatyt*, *.liveyt*, dan *.kolab*.\n\n` +
      `🪚 *DUNIA TAMBAHAN*\n` +
      `> ↳ RPG Avelia juga memiliki RPG bertemakan Chainsawman.\n` +
      `> ↳ Ketik *.csm about* jika ingin mencoba dunia tersebut.\n\n` +
      `Gunakan *.rpg command* untuk melihat daftar command inti atau *.guide* untuk panduan detail setiap fitur.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'command' || action === 'commands' || action === 'cmd') {
    let cap = `╭─❏「 📋 RPG COMMAND 」❏\n`
    cap += `│ *COMMAND INTI RPG AVELIA*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    for (const [command, description] of CORE_COMMANDS) {
      cap += `> *${command}* - ${description}\n`
    }
    cap += `\n─━━━━━━━━━━━━━━─\n`
    cap += `Ketik *.rpg info* untuk penjelasan tentang RPG.`
    const rows = CORE_COMMANDS.map(([entry, description]) => {
      const commandName = entry.split('/')[0].trim().replace(/^\./, '')
      return {
        title: `✦ ${entry}`,
        description: description.slice(0, 72),
        id: `${usedPrefix}${commandName}`
      }
    })
    const sections = Array.from({ length: Math.ceil(rows.length / 10) }, (_, index) => ({
      title: `Petualangan RPG ${index + 1}`,
      rows: rows.slice(index * 10, (index + 1) * 10)
    }))
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '📜 PETUALANGAN RPG AVELIA',
      subtitle: 'Pilih pintu untuk mulai menjelajah',
      text: cap,
      buttonText: '📜 JELAJAHI COMMAND RPG',
      sections,
      fallbackText: cap,
      noThumbnail: true,
      noHeader: true
    })
  }

  return m.reply(
    `╭─❏「 🎮 RPG AVELIA 」❏\n` +
    `│ Sistem petualangan, resource, combat, dan sosial.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *MULAI*\n` +
    `> *.adventure* - Mulai membuka profil RPG\n` +
    `> *.rpg command* - Lihat list command\n` +
    `> *.rpg info* - Baca penjelasan RPG\n\n` +
    `💡 Ketik *.guide* untuk panduan detail.`
  )
}

handler.help = ['rpg', 'rpg aktivitas', 'rpg activity', 'rpg command', 'rpg info']
handler.tags = ['rpg']
handler.command = /^rpg$/i
handler.group = true

export default handler
