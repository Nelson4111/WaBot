export const BANK_TIERS = {
  0: { name: 'Basic Card', limit: 10_000_000, bunga: 0.002, price: 0, biayaBulanan: 0, color: '🔰', keamanan: 1, asuransi: 0, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa'] },
  1: { name: 'Classic Card', limit: 15_000_000, bunga: 0.0025, price: 2_500_000, biayaBulanan: 125_000, color: '🏷️', keamanan: 2, asuransi: 0.01, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Asuransi 1%'] },
  2: { name: 'White Card', limit: 20_000_000, bunga: 0.0028, price: 3_500_000, biayaBulanan: 175_000, color: '⬜', keamanan: 3, asuransi: 0.03, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Asuransi 3%'] },
  3: { name: 'Brown Card', limit: 25_000_000, bunga: 0.003, price: 5_000_000, biayaBulanan: 250_000, color: '🟫', keamanan: 4, asuransi: 0.05, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Asuransi 5%', 'Digital Access'] },
  4: { name: 'Red Card', limit: 50_000_000, bunga: 0.004, price: 12_500_000, biayaBulanan: 625_000, color: '🟥', keamanan: 5, asuransi: 0.1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Biasa', 'Chat CS', 'Riwayat Transaksi', 'Asuransi 10%', 'Digital Access'] },
  5: { name: 'Orange Card', limit: 100_000_000, bunga: 0.005, price: 25_000_000, biayaBulanan: 1_250_000, color: '🟧', keamanan: 6, asuransi: 0.15, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Riwayat Transaksi', 'Asuransi 15%', 'Digital Access', 'Transfer Bank'] },
  6: { name: 'Yellow Card', limit: 250_000_000, bunga: 0.006, price: 50_000_000, biayaBulanan: 2_500_000, color: '🟨', keamanan: 7, asuransi: 0.2, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 20%', 'Digital Access', 'Transfer Bank'] },
  7: { name: 'Green Card', limit: 500_000_000, bunga: 0.007, price: 125_000_000, biayaBulanan: 6_250_000, color: '🟩', keamanan: 8, asuransi: 0.3, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Keamanan', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 30%', 'Digital Access', 'Transfer Bank', 'Fast Track'] },
  8: { name: 'Blue Card', limit: 1_000_000_000, bunga: 0.008, price: 250_000_000, biayaBulanan: 12_500_000, color: '🟦', keamanan: 9, asuransi: 0.4, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv1', 'Chat CS', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 40%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank'] },
  9: { name: 'Purple Card', limit: 5_000_000_000, bunga: 0.009, price: 500_000_000, biayaBulanan: 25_000_000, color: '🟪', keamanan: 10, asuransi: 0.5, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv2', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 50%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP'] },
  10: { name: 'Black Card', limit: 10_000_000_000, bunga: 0.01, price: 2_500_000_000, biayaBulanan: 125_000_000, color: '⬛', keamanan: 11, asuransi: 0.6, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv3', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 60%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi'] },
  11: { name: 'Pink Card', limit: 25_000_000_000, bunga: 0.012, price: 5_000_000_000, biayaBulanan: 250_000_000, color: '🩷', keamanan: 12, asuransi: 0.7, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv4', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 70%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi'] },
  12: { name: 'Cyan Card', limit: 50_000_000_000, bunga: 0.014, price: 12_500_000_000, biayaBulanan: 625_000_000, color: '🩵', keamanan: 13, asuransi: 0.8, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Robot Lv5', 'Chat CS 24jam', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 80%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif'] },
  13: { name: 'Royal Card', limit: 100_000_000_000, bunga: 0.016, price: 25_000_000_000, biayaBulanan: 1_250_000_000, color: '👑', keamanan: 14, asuransi: 0.85, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Polisi', 'Chat CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 85%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan'] },
  14: { name: 'Star Card', limit: 250_000_000_000, bunga: 0.018, price: 50_000_000_000, biayaBulanan: 2_500_000_000, color: '⭐', keamanan: 15, asuransi: 0.9, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Tentara', 'Chat CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 90%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank'] },
  15: { name: 'Crystal Card', limit: 500_000_000_000, bunga: 0.02, price: 125_000_000_000, biayaBulanan: 6_250_000_000, color: '💠', keamanan: 16, asuransi: 0.95, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Pasukan Khusus', 'Chat CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 95%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal'] },
  16: { name: 'Spiral Card', limit: 1_000_000_000_000, bunga: 0.02, price: 250_000_000_000, biayaBulanan: 12_500_000_000, color: '🌀', keamanan: 17, asuransi: 0.96, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 96%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik'] },
  17: { name: 'Cosmic Card', limit: 2_500_000_000_000, bunga: 0.022, price: 500_000_000_000, biayaBulanan: 25_000_000_000, color: '🌐', keamanan: 18, asuransi: 0.97, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 97%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik', 'Auction Pass'] },
  18: { name: 'Stellar Card', limit: 5_000_000_000_000, bunga: 0.024, price: 1_000_000_000_000, biayaBulanan: 50_000_000_000, color: '💫', keamanan: 19, asuransi: 0.98, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 98%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik', 'Auction Pass', 'Interstellar Gateway'] },
  19: { name: 'Eternal Card', limit: null, bunga: 0.026, price: 5_000_000_000_000, biayaBulanan: 2_500_000_000_000, color: '♾️', keamanan: 20, asuransi: 1, fasilitas: ['Penyimpanan Uang', 'Tarik Tunai', 'Penjaga Dewa', 'Premium CS AI', 'Gratis Makanan & Minuman', 'Riwayat Transaksi', 'Asuransi 100%', 'Digital Access', 'Transfer Bank', 'Fast Track', 'Pinjaman Bank', 'Lounge VIP', 'Vault Pribadi', 'Asisten Pribadi', 'Akses Eksklusif', 'Mahkota Kehormatan', 'Portal Bank', 'Benteng Kristal', 'Brankas Kosmik', 'Auction Pass', 'Interstellar Gateway', 'Evonexus'] }
}

export const BANK_FNB_REWARDS = {
  6: { nasi_uduk: 1, es_teh_jumbo: 1 },
  7: { ayam_goreng: 1, boba_milktea: 1, es_jeruk: 1 },
  8: { rendang: 1, matcha_latte: 1, onigiri: 1 },
  9: { sate_kambing: 1, takoyaki: 1, melon_soda_float: 1, dorayaki: 1 },
  10: { lobster_bakar: 1, sushi: 1, steak_emas: 1, stellar_jade_smoothie: 1 },
  11: { diamond_cake: 1, steak_makima: 1, trailblaze_burger: 1, pom_pom_parfait: 1 },
  12: { sup_leviathan: 1, naga_laut_bakar: 1, ramen_ichiraku: 1, stellar_champagne: 1 },
  13: { steak_godzilla: 1, raja_ubur_jelly: 1, sea_dragon_grill: 1, drink_another_world: 1 },
  14: { paus_putih_steak: 1, kura_titan_soup: 1, hydra_stew: 1, soma: 1 },
  15: { healing_tears: 1, stewed_matsutake: 1, mondstadt_hash_brown: 1, sashimi: 1 },
  16: { taco_ikan: 1, udang_goreng: 1, cumi_goreng: 1, heavenly_brew: 1 },
  17: { sup_ikan: 1, salad_buah: 1, penyu_panggang: 1, frozen_memories: 1 },
  18: { sup_susu_sapi: 1, sate_ikan: 1, pari_bakar: 1, silent_escapism: 1 },
  19: { sop_kraken: 1, sate_megalodon: 1, sweet_madame: 1, tacetite_cake: 1 }
}

export const BANK_CS_SERVICES = {
  'Chat CS': 'Informasi dasar mengenai rekening dan fasilitas bank.',
  'Chat CS 24jam': 'Informasi dan bantuan layanan dasar kapan saja.',
  'Chat CS AI': 'Analisis serta informasi terbatas mengenai fasilitas bank lainnya.',
  'Premium CS AI': 'Analisis lebih luas, akses informasi fasilitas lain, layanan prioritas, dan kontrol terbatas atas layanan tertentu.'
}

export const BANK_COMING_SOON_FACILITIES = new Set()
export const BANK_TRANSACTION_LOCATIONS = {
  standard: 'Loket Bank Umum',
  vip: 'Lounge VIP'
}

export const BANK_NEW_FACILITIES = {
  1: ['Asuransi 1%'],
  2: ['Chat CS'],
  3: ['Digital Access'],
  4: ['Riwayat Transaksi'],
  5: ['Transfer Bank'],
  6: ['Gratis Makanan & Minuman'],
  7: ['Fast Track'],
  8: ['Pinjaman Bank'],
  9: ['Lounge VIP'],
  10: ['Vault Pribadi'],
  11: ['Asisten Pribadi'],
  12: ['Akses Eksklusif'],
  13: ['Mahkota Kehormatan'],
  14: ['Portal Bank'],
  15: ['Benteng Kristal'],
  16: ['Brankas Kosmik'],
  17: ['Auction Pass'],
  18: ['Interstellar Gateway'],
  19: ['Evonexus']
}

export const BANK_FACILITY_DESCRIPTIONS = {
  'Penyimpanan Uang': 'Simpan uang saku di rekening bank.',
  'Tarik Tunai': 'Pindahkan saldo rekening ke uang saku.',
  'Penjaga Biasa': 'Penjaga dasar untuk melindungi rekening.',
  'Penjaga Keamanan': 'Penjaga terlatih mengurangi risiko kehilangan saldo.',
  'Penjaga Robot Lv1': 'Robot keamanan memperkuat perlindungan rekening.',
  'Penjaga Robot Lv2': 'Robot keamanan tingkat lanjut memperkuat perlindungan rekening.',
  'Penjaga Robot Lv3': 'Robot keamanan premium menjaga rekening.',
  'Penjaga Robot Lv4': 'Robot keamanan elite menjaga rekening.',
  'Penjaga Robot Lv5': 'Robot keamanan kelas tertinggi menjaga rekening.',
  'Penjaga Polisi': 'Penjagaan polisi memberi perlindungan rekening yang kuat.',
  'Penjaga Tentara': 'Penjagaan militer mengurangi risiko pembobolan rekening.',
  'Pasukan Khusus': 'Pasukan khusus memberi perlindungan rekening tingkat lanjut.',
  'Penjaga Dewa': 'Penjagaan tertinggi melindungi saldo rekening.',
  'Asuransi 1%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 1%.',
  'Asuransi 3%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 3%.',
  'Asuransi 5%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 5%.',
  'Asuransi 10%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 10%.',
  'Asuransi 15%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 15%.',
  'Asuransi 20%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 20%.',
  'Asuransi 30%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 30%.',
  'Asuransi 40%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 40%.',
  'Asuransi 50%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 50%.',
  'Asuransi 60%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 60%.',
  'Asuransi 70%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 70%.',
  'Asuransi 80%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 80%.',
  'Asuransi 85%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 85%.',
  'Asuransi 90%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 90%.',
  'Asuransi 95%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 95%.',
  'Asuransi 96%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 96%.',
  'Asuransi 97%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 97%.',
  'Asuransi 98%': 'Mengurangi kerugian saldo akibat penjarahan bank sebesar 98%.',
  'Asuransi 100%': 'Menanggung seluruh kerugian saldo akibat penjarahan bank.',
  'Chat CS': 'Hubungi layanan pelanggan untuk informasi rekening dan fasilitas bank.',
  'Chat CS 24jam': 'Dapatkan bantuan layanan pelanggan tanpa batas waktu.',
  'Chat CS AI': 'Dapatkan analisis otomatis mengenai rekening dan fasilitas bank.',
  'Premium CS AI': 'Akses analisis AI lanjutan, informasi fasilitas, dan layanan prioritas.',
  'Riwayat Transaksi': 'Lihat catatan transaksi rekening yang tersimpan.',
  'Digital Access': 'Akses saldo digital melalui perintah .money dan .uang.',
  'Transfer Bank': 'Kirim saldo bank ke rekening pemain lain.',
  'Gratis Makanan & Minuman': 'Klaim paket makanan dan minuman sesuai tier setiap 12 jam.',
  'Fast Track': 'Setor seluruh uang saku ke rekening sekaligus.',
  'Pinjaman Bank': 'Ajukan pinjaman menggunakan saldo rekening.',
  'Lounge VIP': 'Ruang tunggu eksklusif untuk transaksi setor dan tarik tunai.',
  'Vault Pribadi': 'Simpan barang Mall dengan aman agar tidak dapat dijarah pemain lain.',
  'Asisten Pribadi': 'Kelola target tabungan, auto-setor, dan pengingat rekening.',
  'Akses Eksklusif': 'Tetap gunakan fitur RPG non-aktivitas saat sedang dipenjara.',
  'Mahkota Kehormatan': 'Mahkota eksklusif Royal Card, dapat dipakai sebagai koleksi atau disimpan di Vault.',
  'Portal Bank': 'Hilangkan cooldown setor dan tarik tunai.',
  'Benteng Kristal': 'Menambah lima level keamanan rekening.',
  'Brankas Kosmik': 'Menambah lima level keamanan rekening.',
  'Auction Pass': 'Membuka akses ke lelang item langka dan item unik.',
  'Interstellar Gateway': 'Membuka penjelajahan dunia antarbintang melalui .explore.',
  'Evonexus': 'Membuka statistik dan pengembangan karakter antarbintang melalui .evx.',
  'Kendaraan Pribadi': 'Kurir pribadi membantu pengantaran transaksi bank.'
}

export const BANK_SPECIAL_ITEMS = [
  {
    id: 'crown_of_fortune',
    name: 'Crown of Fortune',
    emoji: '👑',
    category: 'koleksi',
    price: 0,
    sellPrice: 0,
    description: 'Mahkota kehormatan yang diberikan sekali saat mencapai Royal Card.'
  }
]

export function applyBankTierRewards(rpg) {
  if (Number(rpg?.bankTier) < 13 || rpg.bankCrownClaimed) return false
  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}
  rpg.mallInventory.mahkota_kerajaan = Math.max(1, Number(rpg.mallInventory.mahkota_kerajaan) || 0)
  rpg.bankCrownClaimed = true
  return true
}
