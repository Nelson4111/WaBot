const CORE_COMMANDS = [
  ['.adventure', 'Profil dan aktivitas petualangan'],
  ['.rpgstat', 'Melihat statistik RPG'],
  ['.cooldown', 'Melihat cooldown RPG'],
  ['.inv', 'Melihat inventory dan equipment'],
  ['.gudang', 'Melihat stok item'],
  ['.mining', 'Mencari ore'],
  ['.dungeon', 'Melawan monster dungeon'],
  ['.arena', 'Menantang pemain lain'],
  ['.kerja', 'Bekerja dan mendapatkan penghasilan'],
  ['.daily', 'Mengambil hadiah harian'],
  ['.shop', 'Membeli item dan equipment'],
  ['.lottery', 'Ikut lotteri harian'],
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
  ['.buronan', 'Melihat daftar buronan'],
  ['.guide', 'Membuka panduan detail RPG']
]

let handler = async (m, { text }) => {
  const action = text?.trim().toLowerCase()

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
      `> ↳ Lawan monster dan dapatkan reward lewat *.dungeon*.\n` +
      `> ↳ Ikuti lima arena: jambak, panco, dance, tampar, dan tinju.\n` +
      `> ↳ Ikuti aktivitas kriminal seperti copet, begal, rampok, bunuh, dan fitnah dengan risiko buronan serta penjara.\n\n` +
      `💰 *EKONOMI & ITEM*\n` +
      `> ↳ Dapatkan uang dari daily, kerja, adventure, dungeon, toko, dan aktivitas lainnya.\n` +
      `> ↳ Beli atau jual material, equipment, hasil panen, ikan, masakan, dan item adventure.\n` +
      `> ↳ Buat item lewat *.craft*, tingkatkan equipment lewat *.upgrade*, dan kelola stok lewat *.gudang*.\n` +
      `> ↳ Gunakan *.casino* untuk berbagai permainan dengan batas harian dan cooldown per game.\n\n` +
      `🌾 *KEBUN, TERNAK & MASAKAN*\n` +
      `> ↳ Tanam dan panen tanaman lewat *.kebun*, *.tanam*, dan *.panen*.\n` +
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
    return m.reply(cap)
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

handler.help = ['rpg', 'rpg command', 'rpg info']
handler.tags = ['rpg']
handler.command = /^rpg$/i
handler.group = true

export default handler
