import { sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let sub = (text || '').toLowerCase().trim()

  if (sub === 'pet') {
    let cap = `╭─❏「 🐾 PANDUAN LENGKAP PET 」❏\n`
    cap += `│ Hewan peliharaan Avelia RPG.\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `🐾 *CARA MENDAPATKAN PET*\n`
    cap += `> *${usedPrefix}pet shop*\n`
    cap += `> ↳ Lihat katalog pet yang dapat diadopsi langsung.\n`
    cap += `> *${usedPrefix}pet adopt <nama>*\n`
    cap += `> ↳ Beli pet dari shop.\n`
    cap += `> *${usedPrefix}pet gacha*\n`
    cap += `> ↳ Roll gacha pet dengan biaya Rp 2.500.000 per roll.\n`

    cap += `\n─━━━━━━━━━━━━━━─\n`
    cap += `🛡️ *PERAWATAN & LEVELING*\n`
    cap += `> *${usedPrefix}pet status*\n`
    cap += `> ↳ Cek status, energi, dan mood pet.\n`
    cap += `> *${usedPrefix}pet feed <nomor>*\n`
    cap += `> ↳ Beri makan pet agar energinya pulih.\n`
    cap += `> *${usedPrefix}pet play <nomor>*\n`
    cap += `> ↳ Ajak pet bermain untuk menaikkan mood.\n`
    cap += `> *${usedPrefix}pet train <nomor>*\n`
    cap += `> ↳ Latih pet untuk meningkatkan level dan EXP.\n`
    cap += `> *${usedPrefix}pet rest <nomor>*\n`
    cap += `> ↳ Istirahatkan pet yang lelah.\n`
    cap += `> *${usedPrefix}pet clean <nomor>*\n`
    cap += `> ↳ Mandikan pet yang kotor.\n`

    cap += `\n─━━━━━━━━━━━━━━─\n`
    cap += `💰 *INCOME & AKTIVITAS*\n`
    cap += `> *${usedPrefix}pet claim*\n`
    cap += `> ↳ Klaim penghasilan pasif harian dari pet penghasil uang.\n`
    cap += `> *${usedPrefix}pet dispatch <nomor>*\n`
    cap += `> ↳ Kirim pet mencari item langka.\n`
    cap += `> *${usedPrefix}pet battle <nomor> @user*\n`
    cap += `> ↳ Tantang pet pemain lain bertarung.\n`
    cap += `> *${usedPrefix}pet release / sell*\n`
    cap += `> ↳ Lepaskan atau jual pet saat slot penuh.\n`

    cap += `╰─━━━━━━━━━━━━━━─`

    return sendRpgMsg(
      conn,
      m,
      cap,
      'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
    )
  }

  if (['rship', 'pasangan', 'nikah', 'kawin', 'harem'].includes(sub)) {
    let cap = `╭─❏「 💕 PANDUAN PASANGAN & NIKAH 」❏\n`
    cap += `│ Hubungan percintaan.\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `💍 *PERNIKAHAN ANTAR PEMAIN (P2P)*\n`
    cap += `> *${usedPrefix}lamar @tag*\n`
    cap += `> ↳ Mengajukan lamaran pernikahan.\n`
    cap += `> *${usedPrefix}terima*\n`
    cap += `> ↳ Menerima lamaran.\n`
    cap += `> *${usedPrefix}tolak*\n`
    cap += `> ↳ Menolak lamaran.\n`
    cap += `> *${usedPrefix}pasangan*\n`
    cap += `> ↳ Cek profil cinta dan level bucin.\n`
    cap += `> *${usedPrefix}kencan*\n`
    cap += `> ↳ Menaikkan poin bucin bersama pasangan.\n`
    cap += `> *${usedPrefix}belicincin <tipe>*\n`
    cap += `> ↳ Beli cincin pernikahan.\n`
    cap += `> *${usedPrefix}hadiah @tag <jumlah>*\n`
    cap += `> ↳ Beri kado romantis.\n`
    cap += `> *${usedPrefix}kartunikah*\n`
    cap += `> ↳ Tampilkan Kartu Nikah Digital.\n`
    cap += `> *${usedPrefix}cerai @tag*\n`
    cap += `> ↳ Mengajukan perceraian sepihak.\n`

    cap += `\n─━━━━━━━━━━━━━━─\n`
    cap += `👑 *SISTEM HAREM & NPC RPG*\n`
    cap += `> *${usedPrefix}rship*\n`
    cap += `> ↳ Buka sistem hubungan karakter NPC.\n`
    cap += `> *${usedPrefix}date <nomor>*\n`
    cap += `> ↳ Kencan dengan karakter NPC.\n`
    cap += `> *${usedPrefix}nikahrpg <nomor>*\n`
    cap += `> ↳ Menikahi karakter waifu pilihanmu.\n`
    cap += `> *${usedPrefix}anak*\n`
    cap += `> ↳ Rawat dan besarkan anak dalam game.\n`

    cap += `╰─━━━━━━━━━━━━━━─`

    return sendRpgMsg(
      conn,
      m,
      cap,
      'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
    )
  }

  if (['kebun', 'tanam', 'panen', 'ternak', 'breeding'].includes(sub)) {
    let cap = `╭─❏「 🏡 PANDUAN KEBUN & TERNAK 」❏\n`
    cap += `│ Agrikultur & Peternakan.\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `🌾 *PERKEBUNAN & PANEN*\n`
    cap += `> *${usedPrefix}tanam <bibit> <jumlah>*\n`
    cap += `> ↳ Menanam tanaman di ladang.\n`
    cap += `> *${usedPrefix}kebun*\n`
    cap += `> ↳ Melihat hasil panen yang tersimpan.\n`
    cap += `> *${usedPrefix}panen*\n`
    cap += `> ↳ Melihat status dan memanen hasil kebun.\n`
    cap += `> *${usedPrefix}jualpanen*\n`
    cap += `> ↳ Menjual hasil panen ke koperasi.\n`

    cap += `\n─━━━━━━━━━━━━━━─\n`
    cap += `🐄 *PETERNAKAN & KAWIN SILANG (EVOLUSI)*\n`
    cap += `> *${usedPrefix}ternak*\n`
    cap += `> ↳ Lihat stok hewan ternak.\n`
    cap += `> *${usedPrefix}kawin <hewan1> <hewan2>*\n`
    cap += `> ↳ Kawinkan hewan untuk evolusi.\n`
    cap += `> *${usedPrefix}kawin <hewan1> <hewan2> asuransi*\n`
    cap += `> ↳ Kawin dengan jaminan asuransi ICU.\n`
    cap += `> *${usedPrefix}icu*\n`
    cap += `> ↳ Rawat hewan yang sekarat.\n`

    cap += `╰─━━━━━━━━━━━━━━─`

    return sendRpgMsg(
      conn,
      m,
      cap,
      'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
    )
  }

  // DEFAULT / DIRECTORY MENU
  let cap = `╭─❏「 📖 AVELIA RPG GAME GUIDE 」❏\n`
  cap += `│ Pusat Panduan Avelia RPG!\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `🐾 *1. PANDUAN SISTEM PET*\n`
  cap += `> *${usedPrefix}${command} pet*\n`
  cap += `> ↳ Adopt, gacha, training, battle, dan claim passive.\n`

  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `💕 *2. PANDUAN PASANGAN & NIKAH*\n`
  cap += `> *${usedPrefix}${command} pasangan*\n`
  cap += `> ↳ Lamaran, nikah, kencan, cincin, dan harem NPC.\n`

  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `🏡 *3. PANDUAN KEBUN & TERNAK*\n`
  cap += `> *${usedPrefix}${command} kebun*\n`
  cap += `> ↳ Tanam, panen, ternak, asuransi, dan ICU.\n`

  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `⚔️ *4. PANDUAN PETUALANGAN LAIN*\n`
  cap += `> *${usedPrefix}inv*\n`
  cap += `> ↳ Cek status dan inventory pemain.\n`
  cap += `> *${usedPrefix}bag*\n`
  cap += `> ↳ Cek isi backpack material dan item adventure.\n`
  cap += `> *${usedPrefix}ladang*\n`
  cap += `> ↳ Cek progress tanam dan waktu panen.\n`
  cap += `> *${usedPrefix}dapur*\n`
  cap += `> ↳ Cek antrean masakan dan buku resep.\n`
  cap += `> *${usedPrefix}job*\n`
  cap += `> ↳ Cek status dan daftar pekerjaan.\n`
  cap += `> *${usedPrefix}guild loot*\n`
  cap += `> ↳ Cek diamond dan emerald dari misi guild.\n`
  cap += `> *${usedPrefix}dungeon*\n`
  cap += `> ↳ Taklukkan bos dungeon.\n`
  cap += `> *${usedPrefix}mancing*\n`
  cap += `> ↳ Menangkap ikan langka.\n`
  cap += `> *${usedPrefix}mining* / *${usedPrefix}forge*\n`
  cap += `> ↳ Menambang dan melebur logam.\n`
  cap += `> *${usedPrefix}upgrade*\n`
  cap += `> ↳ Meningkatkan tier senjata dan zirah.\n`
  cap += `> *${usedPrefix}shop*\n`
  cap += `> ↳ Menjual dan membeli kebutuhan RPG.\n`

  cap += `\n╰─━━━━━━━━━━━━━━─`

  return sendRpgMsg(
    conn,
    m,
    cap,
    'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
  )
}

handler.help = ['caramain [kategori]', 'guide [kategori]', 'rpghelp [kategori]']
handler.tags = ['rpg']
handler.command = /^(caramain|guide|rpghelp|tutorialrpg|panduanrpg)$/i

export default handler