import { loadDB, saveDB, sendRpgMsg, getUserRPG } from '../../lib/waifuHelper.js'

export const BANK_TIERS = {
 0: { name: 'Basic Card', limit: 10_000_000, bunga: 0.002, price: 0, biayaBulanan: 0, color: '⬜', keamanan: 1, asuransi: 0, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa'] },
 1: { name: 'Bronze Card', limit: 25_000_000, bunga: 0.003, price: 5_000_000, biayaBulanan: 250_000, color: '🟫', keamanan: 2, asuransi: 0, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS'] },
 2: { name: 'Red Card', limit: 50_000_000, bunga: 0.004, price: 12_500_000, biayaBulanan: 625_000, color: '🟥', keamanan: 3, asuransi: 0, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Riwayat Transaksi'] },
 3: { name: 'Orange Card', limit: 100_000_000, bunga: 0.005, price: 25_000_000, biayaBulanan: 1_250_000, color: '🟧', keamanan: 4, asuransi: 0.1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Riwayat Transaksi', 'Asuransi 10%'] },
 4: { name: 'Yellow Card', limit: 250_000_000, bunga: 0.006, price: 50_000_000, biayaBulanan: 2_500_000, color: '🟨', keamanan: 5, asuransi: 0.2, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 20%'] },
 5: { name: 'Green Card', limit: 500_000_000, bunga: 0.007, price: 125_000_000, biayaBulanan: 6_250_000, color: '🟩', keamanan: 6, asuransi: 0.3, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 30%', 'Transfer Bank', 'Fast Track', 'Digital Access'] },
 6: { name: 'Blue Card', limit: 1_000_000_000, bunga: 0.008, price: 250_000_000, biayaBulanan: 12_500_000, color: '🟦', keamanan: 7, asuransi: 0.4, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv1', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 40%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access'] },
 7: { name: 'Purple Card', limit: 5_000_000_000, bunga: 0.009, price: 500_000_000, biayaBulanan: 25_000_000, color: '🟪', keamanan: 8, asuransi: 0.5, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv2', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 50%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP'] },
 8: { name: 'Black Card', limit: 10_000_000_000, bunga: 0.01, price: 2_500_000_000, biayaBulanan: 125_000_000, color: '⬛', keamanan: 9, asuransi: 0.6, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv3', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 60%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi'] },
 9: { name: 'Platinum Card', limit: 25_000_000_000, bunga: 0.012, price: 5_000_000_000, biayaBulanan: 250_000_000, color: '🔲', keamanan: 12, asuransi: 0.9, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv4', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 90%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi'] },
 10: { name: 'Premium Card', limit: 50_000_000_000, bunga: 0.014, price: 12_500_000_000, biayaBulanan: 625_000_000, color: '🔳', keamanan: 11, asuransi: 0.8, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv5', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 80%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif'] },
 11: { name: 'Royal Card', limit: 100_000_000_000, bunga: 0.016, price: 25_000_000_000, biayaBulanan: 1_250_000_000, color: '👑', keamanan: 10, asuransi: 0.7, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Polisi', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 70%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan'] },
 12: { name: 'Spiral Card', limit: 250_000_000_000, bunga: 0.018, price: 50_000_000_000, biayaBulanan: 2_500_000_000, color: '🌀', keamanan: 13, asuransi: 1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Tentara', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 100%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi', 'Kendaraan Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank'] },
 13: { name: 'Crystal Card', limit: 500_000_000_000, bunga: 0.02, price: 125_000_000_000, biayaBulanan: 6_250_000_000, color: '💠', keamanan: 14, asuransi: 1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Pasukan Khusus', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 100%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi', 'Kendaraan Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal'] },
 14: { name: 'Cosmic Card', limit: 1_000_000_000_000, bunga: 0.02, price: 250_000_000_000, biayaBulanan: 12_500_000_000, color: '🌐', keamanan: 15, asuransi: 1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 100%', 'Transfer Bank', 'Pinjaman Bank', 'Fast Track', 'Digital Access', 'Lounge VIP', 'Vault Pribadi', 'Kendaraan Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik'] }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let userRPG = getUserRPG(wdb, m.sender).rpg
  if (!userRPG) return m.reply('❌ Kamu belum memiliki data RPG.')

  // Init
  if (userRPG.bank === undefined) userRPG.bank = 0
  if (userRPG.bankTier === undefined) userRPG.bankTier = 0
  if (userRPG.lastBunga === undefined) userRPG.lastBunga = 0
  if (userRPG.totalBunga === undefined) userRPG.totalBunga = 0
  if (userRPG.riwayat === undefined) userRPG.riwayat = []
  if (userRPG.pinjaman === undefined) userRPG.pinjaman = { jumlah: 0, waktu: 0 }
  if (userRPG.lastMembership === undefined) userRPG.lastMembership = Date.now()
  if (userRPG.kartuBeku === undefined) userRPG.kartuBeku = false
  if (userRPG.lastDendaHarian === undefined) userRPG.lastDendaHarian = Date.now()

  let tier = BANK_TIERS[userRPG.bankTier]
  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  let amount = parseInt(args[1])
  let now = Date.now()
  let satuHari = 86400000

  // SISTEM DENDA HARIAN SAAT TELAT 30 HARI
  if(now - userRPG.lastMembership > 2592000000 && tier.biayaBulanan > 0){
    let hariTerakhirDenda = Math.floor((now - userRPG.lastDendaHarian) / satuHari)
    if(hariTerakhirDenda >= 1){
      let potongPerHari = Math.floor(tier.biayaBulanan / 30)
      let totalPotong = potongPerHari * hariTerakhirDenda
      if(userRPG.bank >= totalPotong){
        userRPG.bank -= totalPotong
        userRPG.riwayat.unshift(`-Rp ${totalPotong.toLocaleString()} Denda Harian Membership`)
      } else {
        userRPG.bank = 0
        userRPG.kartuBeku = true
      }
      userRPG.lastDendaHarian = now
    }
  }

  // CEK PEMBAYARAN MEMBERSHIP OTOMATIS
  if(now - userRPG.lastMembership > 2592000000 && tier.biayaBulanan > 0 && userRPG.bank >= tier.biayaBulanan){
    userRPG.bank -= tier.biayaBulanan
    userRPG.lastMembership = now
    userRPG.kartuBeku = false
    userRPG.riwayat.unshift(`-Rp ${tier.biayaBulanan.toLocaleString()} Biaya Membership`)
  }

  // BUNGA MINGGUAN
  let cdBunga = 604800000
  if(now - userRPG.lastBunga >= cdBunga && userRPG.bank > 0 &&!userRPG.kartuBeku){
    let bunga = Math.floor(userRPG.bank * tier.bunga)
    userRPG.bank += bunga; userRPG.totalBunga += bunga; userRPG.lastBunga = now
    userRPG.riwayat.unshift(`+Rp ${bunga.toLocaleString()} Bunga Mingguan`)
    if(userRPG.riwayat.length > 20) userRPG.riwayat.pop()
    conn.reply(m.chat, `💸 *BUNGA MINGGUAN MASUK!*\n+Rp ${bunga.toLocaleString()}\n${tier.color} *${tier.name}* ${(tier.bunga*100).toFixed(2)}%/minggu`, m)
  }

  // MENU UTAMA
  if (!action) {
    let sisaHari = Math.max(0, Math.ceil((cdBunga - (now - userRPG.lastBunga)) / satuHari))
    let sisaMembership = Math.max(0, Math.ceil((2592000000 - (now - userRPG.lastMembership)) / satuHari))

    let cap = `─━━ 🏦 RPG BANK CENTER ━━─\n\n`
    if(tier.fasilitas.includes('Lounge VIP')) cap += `✧ Selamat Datang di Lounge VIP ✧\n Nikmati kenyamanan eksklusif anda\n`
    cap += `◈ ${tier.color} ${tier.name.toUpperCase()} ${userRPG.kartuBeku? '❌ BEKU':''} ◈\n`
    cap += `◆ Saldo Bank : Rp ${userRPG.bank.toLocaleString()}\n`
    cap += `◆ Uang Saku : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `◆ Limit Kartu : Rp ${tier.limit.toLocaleString()}\n\n`
    cap += `◈ INFO KARTU ◈\n`
    cap += ` ◦ Bunga : ${(tier.bunga*100).toFixed(2)}% / minggu\n`
    cap += ` ◦ Asuransi : ${(tier.asuransi*100).toFixed(0)}%\n`
    cap += ` ◦ Keamanan : ${tier.fasilitas.find(f=>f.includes('Penjaga')) || 'Standar'}\n`
    cap += ` ◦ Membership : ${sisaMembership} hari lagi ${sisaMembership <= 0? '❌' : '✅'}\n`
    cap += ` ◦ Bunga : ${sisaHari} hari lagi\n`
    if(tier.fasilitas.length > 0) {
      cap += `◈ FASILITAS EKSKLUSIF ◈\n`
      if(tier.fasilitas.includes('Digital Access')) cap += ` ✦ Digital Access\n`
      if(tier.fasilitas.includes('Lounge VIP')) cap += ` ✦ Lounge VIP\n`
      if(tier.fasilitas.includes('Mahkota Kehormatan')) cap += ` ✦ Mahkota Kehormatan\n`
      if(tier.fasilitas.includes('Gratis Makanan & Minuman')) cap += ` ✦ Gratis Makanan & Minuman\n`
      cap += `\n`
    }
    cap += `◈ Total Bunga : Rp ${userRPG.totalBunga.toLocaleString()} ◈\n\n`
    if(userRPG.kartuBeku) cap += `🚨 AKSI DIBUTUHKAN\n Isi saldo Rp ${tier.biayaBulanan.toLocaleString()} untuk \n mengaktifkan kartu otomatis\n\n❌ FITUR NONAKTIF\n Bunga • Transfer • Pinjaman • Heal Bank\n`
    if(userRPG.pinjaman.jumlah > 0) cap += `📌 Pinjaman Aktif : Rp ${userRPG.pinjaman.jumlah.toLocaleString()}\n\n`
    cap += `─━━━━━━━━━─\n📌.bank simpan | tarik | tf | pinjam | bayar | riwayat | card | kartu`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i187/11piK9')
  }

  if(userRPG.kartuBeku && action!== 'tarik') return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ Kartu kamu sedang BEKU\nIsi saldo untuk aktif otomatis\n─━━━━━━━━━─`)

  let userMoney = wdb.money[m.sender] || 0

  // LIST KARTU - FASILITAS KE BAWAH
  if (action === 'card' || action === 'kartu') {
    let cap = `─━━ 🏦 RPG BANK CENTER ━━─\n\n◈ DAFTAR KARTU BANK ◈\n`
    for(let i in BANK_TIERS){
      let t = BANK_TIERS[i]
      let punya = userRPG.bankTier == i? '✅ KAMU' : ''

      cap += `${t.color} *Lv.${i} ${t.name}* ${punya}\n`
      cap += `◆ Limit : Rp ${t.limit.toLocaleString()}\n`
      cap += `◆ Bunga : ${(t.bunga*100).toFixed(2)}%/minggu\n`
      cap += `◆ Harga Upgrade : Rp ${t.price.toLocaleString()}\n`
      cap += `◆ Biaya Bulanan : Rp ${t.biayaBulanan.toLocaleString()}\n`
      cap += `◆ Asuransi : ${(t.asuransi*100).toFixed(0)}%\n`
      cap += `◆ Fasilitas:\n`
      t.fasilitas.forEach(f => {
        cap += ` • ${f}\n`
      })
      cap += `\n`
    }
    cap += `Cara upgrade : *.upgradebank beli* / *.upgradebank 5*\n`
    cap += `─━━━━━━━━━─`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i187/11piK9')
  }

  // SIMPAN
  if (action === 'simpan') {
    if (args[1] === 'all') amount = userMoney
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (userMoney < amount) return m.reply('❌ Uang saku tidak cukup')
    if (userRPG.bank + amount > tier.limit) return m.reply(`❌ Melebihi limit. Sisa: Rp ${(tier.limit - userRPG.bank).toLocaleString()}`)
    wdb.money[m.sender] -= amount; userRPG.bank += amount
    userRPG.riwayat.unshift(`-Rp ${amount.toLocaleString()} Simpan`)
    saveDB(wdb);
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ TRANSAKSI BERHASIL\n◈ SETOR TUNAI ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Saldo Baru : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  // TARIK
  if (action === 'tarik') {
    if (args[1] === 'all') amount = userRPG.bank
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (userRPG.bank < amount) return m.reply('❌ Saldo bank tidak cukup')
    userRPG.bank -= amount; wdb.money[m.sender] += amount
    userRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} Tarik`)
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ TRANSAKSI BERHASIL\n◈ PENARIKAN TUNAI ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Saldo Tersisa : Rp ${userRPG.bank.toLocaleString()}\n`
    if(tier.fasilitas.includes('Kendaraan Pribadi')) msg += `◆ Kurir : Kendaraan Pribadi\n`
    msg += `\n─━━━━━━━━━─`
    saveDB(wdb); return m.reply(msg)
  }

  // TF
  if (action === 'tf') {
    if (!tier.fasilitas.includes('Transfer Bank')) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ ${tier.name} belum bisa transfer\n─━━━━━━━━━─`)
    let who = m.mentionedJid[0]; if (!who) return m.reply('❌ Tag target')
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (userRPG.bank < amount) return m.reply('❌ Saldo bank tidak cukup')
    let targetRPG = getUserRPG(wdb, who).rpg; if (!targetRPG) return m.reply('❌ Target belum punya data RPG')
    userRPG.bank -= amount; targetRPG.bank += amount
    userRPG.riwayat.unshift(`-Rp ${amount.toLocaleString()} TF ke @${who.split('@')[0]}`)
    targetRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} TF dari @${m.sender.split('@')[0]}`)
    saveDB(wdb);
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ TRANSFER BERHASIL\n\n◈ TRANSFER BANK ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Ke : @${who.split('@')[0]}\n◆ Saldo Tersisa : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg, null, { mentions: [who] })
  }

  // PINJAM
  if (action === 'pinjam') {
    if (!tier.fasilitas.includes('Pinjaman Bank')) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ ${tier.name} belum bisa pinjam\n─━━━━━━━━━─`)
    if (userRPG.pinjaman.jumlah > 0) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ Masih punya pinjaman aktif\nLunasi dulu\n─━━━━━━━━━─`)
    if (!amount || amount <= 0) return m.reply('❌ Jumlah tidak valid')
    if (amount > tier.limit * 0.5) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ Maksimal pinjam 50% limit\nMaks: Rp ${(tier.limit * 0.5).toLocaleString()}\n\n─━━━━━━━━━─`)
    userRPG.pinjaman = { jumlah: amount, waktu: now }; userRPG.bank += amount
    userRPG.riwayat.unshift(`+Rp ${amount.toLocaleString()} Pinjaman`)
    saveDB(wdb);
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ PINJAMAN CAIR\n◈ PENGAJUAN PINJAMAN ◈\n◆ Jumlah : Rp ${amount.toLocaleString()}\n◆ Bunga : 10%\n◆ Total Bayar : Rp ${Math.floor(amount * 1.1).toLocaleString()}\n◆ Jangka Waktu : 7 Hari\n◆ Saldo Baru : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  // BAYAR
  if (action === 'bayar') {
    if (userRPG.pinjaman.jumlah === 0) return m.reply('❌ Tidak punya pinjaman')
    let totalBayar = Math.floor(userRPG.pinjaman.jumlah * 1.1)
    if (userRPG.bank < totalBayar) return m.reply(`❌ Saldo bank tidak cukup`)
    userRPG.bank -= totalBayar; userRPG.riwayat.unshift(`-Rp ${totalBayar.toLocaleString()} Bayar Pinjaman`)
    userRPG.pinjaman = { jumlah: 0, waktu: 0 }; saveDB(wdb)
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n✅ PEMBAYARAN BERHASIL\n◈ PELUNASAN PINJAMAN ◈\n◆ Jumlah Bayar : Rp ${totalBayar.toLocaleString()}\n◆ Status : LUNAS\n◆ Saldo Tersisa : Rp ${userRPG.bank.toLocaleString()}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  // RIWAYAT
  if (action === 'riwayat') {
    if (!tier.fasilitas.includes('Riwayat Transaksi')) return m.reply(`─━━ 🏦 RPG BANK CENTER ━━─\n\n❌ ${tier.name} belum bisa lihat riwayat\n─━━━━━━━━━─`)
    if (userRPG.riwayat.length === 0) return m.reply('❌ Belum ada riwayat')
    let riwayat = userRPG.riwayat.slice(0, 10).map((r,i)=>` ${i+1}. ${r}`).join('\n')
    let msg = `─━━ 🏦 RPG BANK CENTER ━━─\n\n◈ RIWAYAT TRANSAKSI ◈\n\n${riwayat}\n\n─━━━━━━━━━─`
    return m.reply(msg)
  }

  saveDB(wdb)
}
handler.command = ['bank', 'tabung'];
handler.tags = ['rpg']
handler.help = ['bank', 'bank simpan', 'bank tarik', 'bank tf', 'bank pinjam', 'bank bayar', 'bank riwayat', 'bank card', 'bank kartu']
handler.group = false
export default handler