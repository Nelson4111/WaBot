import { getPremiumProtectionRemaining, isPremiumAccount, PREMIUM_DAILY_REWARD } from '../../lib/rpgPremium.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000

const DONATION_TITLE_TIERS = [
  { minimum: 0, title: 'Pendukung Baru' },
  { minimum: 1000, title: 'Orang Baik' },
  { minimum: 2000, title: 'Kenalan Avelia' },
  { minimum: 5000, title: 'Donatur Baru' },
  { minimum: 10000, title: 'Donatur Setia' },
  { minimum: 20000, title: 'Teman Avelia' },
  { minimum: 40000, title: 'Pendukung Avelia' },
  { minimum: 50000, title: 'Sahabat Avelia' },
  { minimum: 70000, title: 'Sahabat Istimewa' },
  { minimum: 90000, title: 'Gebetan Avelia' },
  { minimum: 100000, title: 'Donatur Avelia' },
  { minimum: 150000, title: 'Pendukung Setia' },
  { minimum: 200000, title: 'Pelindung Avelia' },
  { minimum: 250000, title: 'Pendukung Istimewa' },
  { minimum: 300000, title: 'Donatur Favorit' },
  { minimum: 350000, title: 'Sang Filantropis' },
  { minimum: 400000, title: 'Pilar Komunitas' },
  { minimum: 450000, title: 'Bintang Kedermawanan' },
  { minimum: 500000, title: 'Donatur Utama' },
  { minimum: 550000, title: 'Donatur Setia' },
  { minimum: 600000, title: 'Legenda Kebaikan' },
  { minimum: 650000, title: 'Dermawan Muda' },
  { minimum: 700000, title: 'Donatur Istimewa' },
  { minimum: 750000, title: 'Pahlawan Komunitas' },
  { minimum: 800000, title: 'Pendukung Favorit' },
  { minimum: 850000, title: 'Sang Visioner' },
  { minimum: 900000, title: 'Kekasih Avelia' },
  { minimum: 950000, title: 'Kesayangan Komunitas' },
  { minimum: 1000000, title: 'Donatur Abadi' }
]

function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return [hours && `${hours}j`, minutes && `${minutes}m`, remainingSeconds && `${remainingSeconds}d`].filter(Boolean).join(' ') || '0d'
}

function getDonationTitle(amount) {
  const tier = DONATION_TITLE_TIERS.filter(tier => amount >= tier.minimum).at(-1) || DONATION_TITLE_TIERS[0]
  return tier.title
}

function getCooldownStatus(timestamp, duration, now) {
  const remaining = Math.max(0, (Number(timestamp) || 0) + duration - now)
  return remaining ? `⏳ ${formatRemaining(remaining)}` : '✅ Siap'
}

let handler = async (m, { text = '', usedPrefix }) => {
  const action = text.trim().toLowerCase()
  const user = global.db?.data?.users?.[m.sender] || {}
  const now = Date.now()
  const isPremium = isPremiumAccount(user, now)
  const rpg = user.rpg || {}
  rpg.premium = isPremium

  if (action === 'daily') {
    if (!isPremium) return m.reply('❌ Fitur ini khusus pengguna Premium.')
    const remaining = (Number(user.premiumDailyAt) || 0) + DAILY_COOLDOWN - now
    if (remaining > 0) return m.reply(`⏳ Premium daily bisa diklaim lagi dalam ${formatRemaining(remaining)}.`)
    user.limit = (Number(user.limit) || 0) + PREMIUM_DAILY_REWARD
    user.premiumDailyAt = now
    if (typeof global.db.write === 'function') await global.db.write()
    return m.reply(`✅ Premium daily berhasil diklaim: *+${PREMIUM_DAILY_REWARD} limit*.\n> ↳ Limit sekarang: *${user.limit}*`)
  }

  if (action === 'protection') {
    if (!isPremium) return m.reply('❌ Premium protection khusus pengguna Premium.')
    const remaining = getPremiumProtectionRemaining(user, now)
    return m.reply(
      `🛡️ *PREMIUM PROTECTION*\n\n` +
      `> Perlindungan aktif otomatis terhadap aksi kriminal yang menargetkanmu dan risiko kematian.\n` +
      `> Cooldown trigger: *2 jam*.\n` +
      `> Status: ${remaining ? `⏳ Siap lagi dalam ${formatRemaining(remaining)}` : '✅ Siap digunakan'}\n\n` +
      `Perlindungan dipakai otomatis saat berhasil mencegah ancaman.`
    )
  }

  if (action === 'cd' || action === 'cooldown') {
    if (!isPremium) return m.reply('❌ Premium cooldown hanya tersedia untuk pengguna Premium.')
    const protectionRemaining = getPremiumProtectionRemaining(user, now)
    const dailyRemaining = Math.max(0, (Number(user.premiumDailyAt) || 0) + DAILY_COOLDOWN - now)
    const cooldownItems = [
      ['Mining', rpg.lastMining, 2 * 60 * 1000],
      ['Dungeon', rpg.lastDungeon, 2 * 60 * 1000],
      ['Mancing', rpg.lastFishing || rpg.lastMancing, 60 * 1000],
      ['Adventure', rpg.lastAdventure, 2 * 60 * 1000],
      ['Kerja RPG', rpg.lastkerja, 2 * 60 * 1000]
    ]
    const cooldownList = cooldownItems.map(([label, timestamp, duration]) =>
      `> ${label}: ${getCooldownStatus(timestamp, scaleDifficultyCooldown(rpg, duration), now)}`
    ).join('\n')
    return m.reply(
      `⏰ *PREMIUM COOLDOWN*\n\n` +
      `${cooldownList}\n` +
      `> Premium daily: ${dailyRemaining ? `⏳ ${formatRemaining(dailyRemaining)}` : '✅ Siap'}\n` +
      `> Protection: ${protectionRemaining ? `⏳ ${formatRemaining(protectionRemaining)}` : '✅ Siap'}\n\n` +
      `Untuk cooldown fitur khusus, cek juga *.cd*, *.pet cd*, *.kawin*, *.panen*, *.casino cd*, *.rship cd*, *.rh cd*, dan *.penjara cd*.`
    )
  }

  if (action === 'profile' || action === 'profil') {
    const donationAmount = Number(user.totalDonasi) || 0
    const name = user.namaDonasi || m.pushName || m.name || 'Pengguna'
    const premiumStatus = isPremium
      ? Number(user.premiumTime) >= 9999999999999
        ? 'Premium permanen'
        : `Premium aktif${user.premiumTime > now ? ` sampai ${new Date(user.premiumTime).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}` : ''}`
      : 'Bukan Premium'
    return m.reply(
      `╭─❏「 👑 PREMIUM PROFILE 」❏\n` +
      `│ 👤 Nama: *${name}*\n` +
      `│ 📱 Nomor: +${m.sender.split('@')[0]}\n` +
      `│ 👑 Status: *${premiumStatus}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `💝 *DONASI & TITLE*\n` +
      `> Total donasi: *Rp ${donationAmount.toLocaleString('id-ID')}*\n` +
      `> Title: *${getDonationTitle(donationAmount)}*\n\n` +
      `🎟️ Limit: *${Number(user.limit) || 0}*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (/^(benefits?|manfaat)$/.test(action)) {
    return m.reply(
      `╭─❏「 👑 MANFAAT PREMIUM 」❏\n` +
      `│ 👑 *MANFAAT PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📌 *KEUNTUNGAN UMUM*\n` +
      `> ↳ Batas casino: *50 permainan per hari* (user biasa 25).\n` +
      `> ↳ Diskon beli *20%* dan bonus harga jual *10%* di toko RPG yang mendukung Premium.\n` +
      `> ↳ Diskon *20%* untuk semua biaya uang pada *.upgrade* dan diskon *25%* upgrade kartu bank.\n` +
      `> ↳ Biaya admin transfer bank lebih murah *50%*.\n` +
      `> ↳ Cooldown berbagai aktivitas RPG *20% lebih singkat*; cek *.prem cd*.\n` +
      `> ↳ Klaim *${usedPrefix}prem daily* setiap 24 jam untuk mendapat *${PREMIUM_DAILY_REWARD} limit*.\n` +
      `> ↳ *.premium protection* otomatis melindungi dari aksi kriminal yang menargetkanmu dan risiko kematian; trigger sekali per 2 jam.\n` +
      `> ↳ Cooldown Muncak lebih singkat: *2 jam* (user biasa 5 jam). Contoh: *${usedPrefix}mt start*.\n` +
      `> ↳ Cooldown interaksi pasangan lebih singkat: *30 detik* (user biasa 60 detik). Contoh: *${usedPrefix}act*.\n\n` +

      `🌱 *LADANG*\n` +
      `> ↳ Bisa upgrade hingga *20 slot ladang* (user biasa maksimal 10).\n` +
      `> ↳ Contoh: *${usedPrefix}buyladang* untuk upgrade, *${usedPrefix}tanam list* untuk melihat bibit.\n\n` +

      `🐾 *PET*\n` +
      `> ↳ Kapasitas pet bertambah menjadi *15 slot* (user biasa 10).\n` +
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
      `> ↳ Profil donasi/title: *${usedPrefix}premium profile*; cek cooldown dengan *${usedPrefix}prem cd*.\n` +
      `> ↳ Lihat status dan cara mendapatkan Premium: *${usedPrefix}premium*\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  const premiumTime = Number(user.premiumTime) || 0

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

handler.help = ['premium', 'premium benefits', 'premium profile', 'premium protection', 'prem daily', 'prem cd', 'prem benefits']
handler.tags = ['info']
handler.command = /^(premium|prem)$/i

export default handler