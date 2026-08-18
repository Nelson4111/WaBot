import { sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let sub = (text || '').toLowerCase().trim()

  if (sub === 'pet') {
    let cap = `╭───「 🐾 PANDUAN LENGKAP PET 」───╮\n`
    cap += `│ Sistem hewan peliharaan Zeta RPG.\n`
    cap += `╰─────────────────────────────────╯\n\n`
    cap += `📌 *CARA MENDAPATKAN PET:*\n`
    cap += `• *${usedPrefix}pet shop* : Lihat katalog pet yang dapat diadopsi langsung.\n`
    cap += `• *${usedPrefix}pet adopt <nama>* : Beli pet dari shop.\n`
    cap += `• *${usedPrefix}pet gacha* : Roll gacha pet (Biaya: Rp 2.500.000 / roll, Pity 100 ke Legend).\n\n`
    cap += `📌 *PERAWATAN & LEVELING:*\n`
    cap += `• *${usedPrefix}pet status* : Cek seluruh status, energi, dan mood pet kamu.\n`
    cap += `• *${usedPrefix}pet feed <nomor>* : Beri makan pet agar energinya pulih.\n`
    cap += `• *${usedPrefix}pet play <nomor>* : Ajak main agar mood & kebahagiaan naik.\n`
    cap += `• *${usedPrefix}pet train <nomor>* : Latih pet untuk meningkatkan level & EXP.\n`
    cap += `• *${usedPrefix}pet rest <nomor>* : Istirahatkan pet yang lelah.\n`
    cap += `• *${usedPrefix}pet clean <nomor>* : Mandikan pet yang kotor.\n\n`
    cap += `📌 *INCOME & AKTIVITAS:* \n`
    cap += `• *${usedPrefix}pet claim* : Klaim penghasilan pasif harian dari pet penghasil uang (Kucing Dewa, Numby, Alien, Poop).\n`
    cap += `• *${usedPrefix}pet dispatch <nomor>* : Kirim pet untuk ekspedisi mencari item langka.\n`
    cap += `• *${usedPrefix}pet battle <nomor> @user* : Tantang pet pemain lain bertarung.\n`
    cap += `• *${usedPrefix}pet release / sell* : Lepaskan atau jual pet jika slot penuh.\n`
    cap += `╰─────────────────────────────────╯`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  }

  if (['rship', 'pasangan', 'nikah', 'kawin', 'harem'].includes(sub)) {
    let cap = `╭───「 💕 PANDUAN PASANGAN & NIKAH 」───╮\n`
    cap += `│ Sistem percintaan & pernikahan pemain/NPC.\n`
    cap += `╰─────────────────────────────────────╯\n\n`
    cap += `💍 *PERNIKAHAN ANTAR PEMAIN (P2P):*\n`
    cap += `• *${usedPrefix}lamar @tag* : Mengajukan lamaran pernikahan ke pemain lain.\n`
    cap += `• *${usedPrefix}terima* : Menerima lamaran (reply pesan atau ketik langsung).\n`
    cap += `• *${usedPrefix}tolak* : Menolak lamaran pernikahan.\n`
    cap += `• *${usedPrefix}pasangan* : Cek profil cinta, cincin, dan level bucin bersama pasangan.\n`
    cap += `• *${usedPrefix}kencan* : Ajak pasangan kencan untuk menaikkan poin bucin.\n`
    cap += `• *${usedPrefix}belicincin <tipe>* : Beli cincin pernikahan mewah di toko cincin.\n`
    cap += `• *${usedPrefix}hadiah @tag <jumlah>* : Beri kado romantis ke pasangan.\n`
    cap += `• *${usedPrefix}kartunikah* : Tampilkan Kartu Nikah Digital resmi.\n`
    cap += `• *${usedPrefix}cerai @tag* : Mengajukan perceraian sepihak.\n\n`
    cap += `👑 *SISTEM HAREM & NPC RPG:* \n`
    cap += `• *${usedPrefix}rship* : Menu utama sistem hubungan karakter NPC.\n`
    cap += `• *${usedPrefix}date <nomor>* : Kencan dengan waifu/husbando NPC.\n`
    cap += `• *${usedPrefix}nikahrpg <nomor>* : Menikahi karakter waifu favoritmu.\n`
    cap += `• *${usedPrefix}anak* : Rawat dan besarkan anak dalam game.\n`
    cap += `╰─────────────────────────────────────╯`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  }

  if (['csm', 'chainsaw', 'hunter'].includes(sub)) {
    let cap = `╭───「 ⛓️ PANDUAN DEVIL HUNTER CSM 」───╮\n`
    cap += `│ Sistem Pemburu Iblis Chainsaw Man.\n`
    cap += `╰─────────────────────────────────────╯\n\n`
    cap += `🩸 *FITUR UTAMA:*\n`
    cap += `• *${usedPrefix}csm* : Buka menu profil, level, lokasi & inventaris Hunter.\n`
    cap += `• *${usedPrefix}csm gender <pria/wanita>* : Tentukan gender Hunter kamu.\n`
    cap += `• *${usedPrefix}csm mission* : Lawan iblis liar untuk mengumpulkan Darah & EXP.\n`
    cap += `• *${usedPrefix}csm visit <lokasi>* : Berpindah tempat (Mall, Neraka, Markas, dll).\n`
    cap += `• *${usedPrefix}csm rest* : Istirahat untuk memulihkan 40% HP.\n`
    cap += `• *${usedPrefix}csm blood <jumlah>* : Konversi uang Bank menjadi Darah Iblis.\n\n`
    cap += `👥 *PARTNER & KONTRAK IBLIS:*\n`
    cap += `• *${usedPrefix}csm partner database* : Daftar 62 karakter yang dapat direkrut.\n`
    cap += `• *${usedPrefix}csm partner recruit <nomor>* : Rekrut partner bertarung.\n`
    cap += `• *${usedPrefix}csm contract* : Katalog kontrak kekuatan iblis berkekuatan tinggi.\n`
    cap += `• *${usedPrefix}csm contract <nomor> deal* : Ikat kontrak iblis secara permanen.\n\n`
    cap += `🏆 *PROGRESSI & RAID HARIAN:*\n`
    cap += `• *${usedPrefix}csm story* : Jelajahi 14 Arc kisah epik Chainsaw Man.\n`
    cap += `• *${usedPrefix}csm raid* : Bergabung di Raid Boss harian bersama pemain lain.\n`
    cap += `• *${usedPrefix}csm ending* : Raih salah satu dari 7 takdir akhir perjalananmu.\n`
    cap += `╰─────────────────────────────────────╯`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  }

  if (['kebun', 'tanam', 'panen', 'ternak', 'breeding'].includes(sub)) {
    let cap = `╭───「 🏡 PANDUAN KEBUN & TERNAK 」───╮\n`
    cap += `│ Sistem Agrikultur & Peternakan Silang.\n`
    cap += `╰────────────────────────────────────╯\n\n`
    cap += `🌾 *PERKEBUNAN & PANEN:*\n`
    cap += `• *${usedPrefix}tanam <bibit> <jumlah>* : Menanam tanaman di ladang kamu.\n`
    cap += `• *${usedPrefix}kebun* : Pantau kondisi ladang dan tanaman yang siap panen.\n`
    cap += `• *${usedPrefix}panen* : Panen seluruh hasil kebun dan simpan ke gudang.\n`
    cap += `• *${usedPrefix}jualpanen* : Jual hasil panen ke pasar dengan harga tinggi!\n\n`
    cap += `🐄 *PETERNAKAN & KAWIN SILANG (EVOLUSI):*\n`
    cap += `• *${usedPrefix}ternak* : Lihat seluruh stok hewan ternak yang kamu miliki.\n`
    cap += `• *${usedPrefix}kawin <hewan1> <hewan2>* : Kawinkan 2 hewan untuk evolusi.\n`
    cap += `• *${usedPrefix}kawin <hewan1> <hewan2> asuransi* : Kawin dengan jaminan asuransi ICU bila gagal.\n`
    cap += `• *${usedPrefix}icu* : Rawat dan selamatkan hewan yang sekarat di ICU.\n`
    cap += `╰────────────────────────────────────╯`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  }

  // DEFAULT / DIRECTORY MENU
  let cap = `*╭───「 📖 ZETA RPG GAME GUIDE 」───╮*\n`
  cap += `│ Selamat datang di Pusat Panduan Zeta RPG!\n`
  cap += `│ Pilih kategori untuk melihat tutorial lengkap:\n`
  cap += `*╰────────────────────────────────╯*\n\n`
  cap += `🐾 *1. PANDUAN SISTEM PET*\n`
  cap += ` → Ketik: *${usedPrefix}${command} pet*\n`
  cap += `   _Adopt, Gacha, Training, Battle, & Claim Passive_\n\n`
  cap += `💕 *2. PANDUAN PASANGAN & NIKAH*\n`
  cap += ` → Ketik: *${usedPrefix}${command} pasangan*\n`
  cap += `   _Lamaran, Akad Nikah, Kencan, Cincin, & Harem NPC_\n\n`
  cap += `⛓️ *3. PANDUAN DEVIL HUNTER CSM*\n`
  cap += ` → Ketik: *${usedPrefix}${command} csm*\n`
  cap += `   _Story 14 Arc, Kontrak Iblis, Raid Boss, & Darah_\n\n`
  cap += `🏡 *4. PANDUAN KEBUN & TERNAK*\n`
  cap += ` → Ketik: *${usedPrefix}${command} kebun*\n`
  cap += `   _Tanam, Panen, Kawin Silang Hewan, Asuransi & ICU_\n\n`
  cap += `⚔️ *5. PANDUAN PETUALANGAN LAIN:*\n`
  cap += ` • *${usedPrefix}inv* : Cek status & tas pemain\n`
  cap += ` • *${usedPrefix}dungeon* : Taklukkan bos dungeon\n`
  cap += ` • *${usedPrefix}mancing* : Menangkap ikan langka\n`
  cap += ` • *${usedPrefix}mining* & *${usedPrefix}forge* : Tambang & lebur logam\n`
  cap += ` • *${usedPrefix}upgrade* : Tingkatkan tier senjata & zirah\n`
  cap += ` • *${usedPrefix}shop* : Jual dan beli kebutuhan RPG\n`
  cap += `*╰────────────────────────────────╯*`

  return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
}

handler.help = ['caramain [kategori]', 'guide [kategori]', 'rpghelp [kategori]']
handler.tags = ['rpg']
handler.command = /^(caramain|guide|rpghelp|tutorialrpg|panduanrpg)$/i
export default handler
