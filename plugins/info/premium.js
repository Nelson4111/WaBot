let handler = async (m, { text = '', usedPrefix }) => {
  const action = text.trim().toLowerCase()

  if (/^(benefits?|manfaat)$/.test(action)) {
    return m.reply(
      `╭─❏「 👑 MANFAAT PREMIUM 」❏\n` +
      `│ 👑 *MANFAAT PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📌 *KEUNTUNGAN*\n` +
      `> ↳ Bisa menggunakan fitur yang ditandai khusus Premium (Ⓟ).\n` +
      `> ↳ Batas casino harian lebih besar: 50 permainan (user biasa 25).\n` +
      `> ↳ Diskon 25% dari harga normal di RPG Shop.\n` +
      `> ↳ Praktis menjalankan aktivitas batch seperti perawatan/aktivitas semua pet, aktivitas semua rship, dan semua aktivitas rehabilitasi yang siap.\n\n` +

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