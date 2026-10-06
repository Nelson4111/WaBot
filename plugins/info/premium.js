let handler = async (m, { text = '', usedPrefix }) => {
  const action = text.trim().toLowerCase()

  if (/^(benefits?|manfaat)$/.test(action)) {
    return m.reply(
      `╭─❏「 👑 MANFAAT PREMIUM 」❏\n` +
      `│ 👑 *MANFAAT PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📌 *KEUNTUNGAN UMUM*\n` +
      `> ↳ Batas casino: *50 permainan per hari* (user biasa 25).\n` +
      `> ↳ Diskon beli *20%* dan bonus harga jual *10%* di toko RPG yang mendukung Premium.\n` +
      `> ↳ Diskon *25%* untuk upgrade kartu bank; cek pilihan di *${usedPrefix}upgradebank*.\n` +
      `> ↳ Cooldown Muncak lebih singkat: *2 jam* (user biasa 5 jam). Contoh: *${usedPrefix}mt start*.\n` +
      `> ↳ Cooldown interaksi pasangan lebih singkat: *30 detik* (user biasa 60 detik). Contoh: *${usedPrefix}act*.\n\n` +

      `🌱 *LADANG*\n` +
      `> ↳ Bisa upgrade hingga *20 slot ladang* (user biasa maksimal 10).\n` +
      `> ↳ Contoh: *${usedPrefix}buyladang* untuk upgrade, *${usedPrefix}tanam list* untuk melihat bibit.\n\n` +

      `🐾 *PET*\n` +
      `> ↳ *${usedPrefix}pet care* memberi feed, rest, dan clean ke semua pet; cooldown 30 menit.\n` +
      `> ↳ Setelah care, *${usedPrefix}pet all* menjalankan train, walk, play, hunt, dan dispatch untuk semua pet; cooldown 30 menit.\n` +
      `> ↳ Contoh: *${usedPrefix}pet care*, lalu *${usedPrefix}pet all*.\n\n` +

      `💕 *RELATIONSHIP*\n` +
      `> ↳ *${usedPrefix}rship all <no pasangan>* menjalankan semua aktivitas yang siap untuk pasangan tersebut; cooldown all 30 menit.\n` +
      `> ↳ Contoh: *${usedPrefix}rship all 1*.\n\n` +

      `🕊️ *REHABILITASI*\n` +
      `> ↳ *${usedPrefix}rh all* menjalankan semua aktivitas rehabilitasi yang cooldown-nya siap.\n` +
      `> ↳ Contoh: *${usedPrefix}rh all*; cek waktu aktivitas dengan *${usedPrefix}rh cd*.\n\n` +

      `🍱 *MBG*\n` +
      `> ↳ Dapat mengambil hingga *2 pasangan menu per hari* dan memilih dari *5 menu* saat menukar.\n` +
      `> ↳ Contoh: *${usedPrefix}mbg tukar*, pilih dengan *${usedPrefix}mbg tukar 1–5*, lalu klaim dengan *${usedPrefix}mbg ambil 1 2*.\n\n` +

      `📌 *INFORMASI*\n` +
      `> ↳ Lihat status dan cara mendapatkan Premium: *${usedPrefix}premium*\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  const user = global.db?.data?.users?.[m.sender] || {}
  const premiumTime = Number(user.premiumTime) || 0
  const isPremium = premiumTime > Date.now() || (user.premium === true && premiumTime === 0)

  let status = '❌ Bukan Premium'

  if (isPremium) {
    if (premiumTime >= 9999999999999) {
      status = '✅ Premium permanen'
    } else if (premiumTime > Date.now()) {
      const expiry = new Date(premiumTime).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'long',
        timeStyle: 'short'
      })
      status = `✅ Premium sampai ${expiry} WIB`
    } else {
      status = '✅ Premium aktif'
    }
  }

  return m.reply(
    `╭─❏「 👑 TENTANG PREMIUM 」❏\n` +
    `│ 👑 *STATUS PREMIUM*\n` +
    `│ ${status}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📋 *TENTANG PREMIUM*\n` +
    `> ↳ Premium adalah status khusus yang membuka akses ke fitur bot tertentu dan beberapa keuntungan tambahan.\n` +
    `> ↳ Ketik *${usedPrefix}premium benefits* untuk melihat manfaatnya.\n\n` +

    `📌 *KEBIJAKAN PREMIUM*\n` +
    `> ↳ Saat ini Premium dari donasi diberikan permanen.\n` +
    `> ↳ Kebijakan ini dapat berubah; ke depannya Premium mungkin memiliki batas waktu.\n\n` +

    `💰 *CARA MENDAPATKAN*\n` +
    `> ↳ 1. Ketik *${usedPrefix}donasi* dan lakukan donasi melalui QRIS.\n` +
    `> ↳ 2. Kirim foto bukti transfer dengan *${usedPrefix}konfirmasidonasi nominal | nama*.\n` +
    `> ↳ 3. Tunggu verifikasi Owner.\n\n` +

    `📌 *PERTANYAAN*\n` +
    `> ↳ Ketik *${usedPrefix}owner* untuk pertanyaan lebih lanjut.\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['premium', 'premium benefits', 'prem', 'prem benefits']
handler.tags = ['info']
handler.command = /^(premium|prem)$/i

export default handler