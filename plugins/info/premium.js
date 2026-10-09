import {
  DONATION_TITLE_TIERS,
  getDonationTitle,
  getPremiumProtectionRemaining,
  isPremiumAccount,
  PREMIUM_PROTECTION_ACTIONS,
  PREMIUM_DAILY_MIN_DONATION,
  PREMIUM_DAILY_REWARD
} from '../../lib/rpgPremium.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { claimPremiumDailyLimit, getJakartaDate } from '../../lib/userLimit.js'

function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return [hours && `${hours}j`, minutes && `${minutes}m`, remainingSeconds && `${remainingSeconds}d`].filter(Boolean).join(' ') || '0d'
}

function getCooldownStatus(timestamp, duration, now) {
  const remaining = Math.max(0, (Number(timestamp) || 0) + duration - now)
  return remaining ? `⏳ ${formatRemaining(remaining)}` : '✅ Siap'
}

function getJakartaMidnightMs(now) {
  const jakartaDate = new Date(now + 7 * 60 * 60 * 1000)
  const nextMidnight = Date.UTC(
    jakartaDate.getUTCFullYear(),
    jakartaDate.getUTCMonth(),
    jakartaDate.getUTCDate() + 1
  )
  return nextMidnight - 7 * 60 * 60 * 1000
}

let handler = async (m, { conn, text = '', usedPrefix }) => {
  const [action = ''] = text.trim().toLowerCase().split(/\s+/)
  const users = global.db?.data?.users || {}
  const user = users[m.sender] || {}
  const now = Date.now()
  const isPremium = isPremiumAccount(user, now)
  const rpg = user.rpg || {}
  rpg.premium = isPremium

  if (action === 'daily') {
  if (!isPremium) {
    return m.reply(
      `╭─❏「 👑 PREMIUM DAILY 」❏\n` +
      `│ ❌ *AKSES DITOLAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Fitur ini khusus pengguna Premium.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const donationAmount = Number(user.totalDonasi) || 0

  if (donationAmount < PREMIUM_DAILY_MIN_DONATION) {
    return m.reply(
      `╭─❏「 👑 PREMIUM DAILY 」❏\n` +
      `│ 🎁 *PREMIUM DAILY*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Premium daily tersedia mulai title *Donatur Setia*.\n` +
      `> ↳ Total donasi: Rp ${PREMIUM_DAILY_MIN_DONATION.toLocaleString('id-ID')}\n` +
      `> ↳ Title kamu: *${getDonationTitle(donationAmount)}*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!global.db?.data?.users || typeof global.db.write !== 'function') {
    return m.reply(
      `╭─❏「 ❌ DATABASE 」❏\n` +
      `│ ❌ *DATABASE BELUM SIAP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Database belum siap menyimpan limit.\n` +
      `> ↳ Coba lagi nanti.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const legacyClaimDate = Number(user.premiumDailyAt) > 0
    ? getJakartaDate(Number(user.premiumDailyAt))
    : null
  if ((user.premiumDailyDate || legacyClaimDate) === getJakartaDate(now)) {
    const remaining = getJakartaMidnightMs(now) - now
    return m.reply(
      `╭─❏「 ⏳ PREMIUM DAILY 」❏\n` +
      `│ ⏳ *BELUM BISA DIKLAIM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Premium daily bisa diklaim lagi setelah pergantian hari (*${formatRemaining(remaining)}*).\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const reward = claimPremiumDailyLimit(user, now, PREMIUM_DAILY_REWARD)
  const limit = reward.limit
  users[m.sender] = user
  await global.db.write()

  return m.reply(
    `╭─❏「 🎁 PREMIUM DAILY 」❏\n` +
    `│ ✅ *PREMIUM DAILY BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Limit diterima: *+${PREMIUM_DAILY_REWARD} limit*\n` +
    `> ↳ Limit sekarang: *${limit}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'title' || action === 'titles') {
  const titleList = DONATION_TITLE_TIERS.map(({ minimum, title }) =>
    `> Rp ${minimum.toLocaleString('id-ID')} total donasi — *${title}*`
  ).join('\n')

  return m.reply(
    `╭─❏「 🏷️ TITLE DONATUR 」❏\n` +
    `│ 🏷️ *DAFTAR TITLE DONATUR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${titleList}\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Nominal adalah akumulasi donasi yang sudah diverifikasi.\n` +
    `> ↳ Cek hadiah dengan ${usedPrefix}prem reward.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'reward' || action === 'rewards') {
  const rewardList = DONATION_TITLE_TIERS.map(({ minimum, title }) => {
    const rewards = minimum === 0
      ? `title awal *${title}*`
      : `title *${title}*`

    const dailyReward = minimum >= PREMIUM_DAILY_MIN_DONATION
      ? ` + *${PREMIUM_DAILY_REWARD} limit* setiap hari`
      : ''

    return `> Total donasi Rp ${minimum.toLocaleString('id-ID')}: ${rewards}${dailyReward}`
  }).join('\n')

  return m.reply(
    `╭─❏「 🎁 HADIAH DONATUR 」❏\n` +
    `│ 🎁 *HADIAH DONATUR PREMIUM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Setiap donasi berapa pun yang sudah diverifikasi memberi *Premium permanen* dan title sesuai akumulasi donasi.\n\n` +
    `${rewardList}\n\n` +
    `📌 *PREMIUM DAILY*\n` +
    `> ↳ Premium dari donasi berlaku permanen untuk saat ini.\n` +
    `> ↳ Premium daily mulai terbuka di title *Donatur Setia*.\n` +
    `> ↳ Kebutuhan total donasi: Rp ${PREMIUM_DAILY_MIN_DONATION.toLocaleString('id-ID')}\n` +
    `> ↳ Limit daily reset setiap pergantian hari.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'price' || action === 'pricelist' || action === 'harga') {
  return m.reply(
    `╭─❏「 👑 HARGA PREMIUM 」❏\n` +
    `│ 👑 *HARGA PREMIUM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `💰 *HARGA*\n` +
    `> ↳ Harga: *seikhlasnya*\n` +
    `> ↳ Donasi nominal berapa pun diterima (di atas Rp 0).\n` +
    `> ↳ Tanpa minimum.\n\n` +
    `⏳ *MASA AKTIF*\n` +
    `> ↳ Masa aktif: *permanen* untuk saat ini.\n` +
    `> ↳ Setiap donasi yang diverifikasi Owner otomatis mendapat Premium permanen.\n` +
    `> ↳ Berlaku juga untuk user baru yang dicatat lewat adddonasi.\n\n` +
    `📌 *CARA BERDONASI*\n` +
    `> 1. Ketik *${usedPrefix}donasi* untuk melihat QRIS dan petunjuk.\n` +
    `> 2. Kirim bukti transfer dengan *${usedPrefix}konfirmasidonasi nominal | nama*.\n` +
    `> 3. Tunggu verifikasi Owner.\n\n` +
    `📖 *MENU*\n` +
    `> ↳ Manfaat: ${usedPrefix}prem benefits\n` +
    `> ↳ Hadiah: ${usedPrefix}prem reward\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'top' || action === 'toppremium') {
  const topDonors = Object.entries(users)
    .filter(([, donor]) => Number(donor.totalDonasi) > 0 && isPremiumAccount(donor, now))
    .sort(([, first], [, second]) => Number(second.totalDonasi) - Number(first.totalDonasi))
    .slice(0, 10)

  if (!topDonors.length) {
    return m.reply(
      `╭─❏「 👑 TOP PREMIUM 」❏\n` +
      `│ 👑 *TOP 10 PREMIUM DONATUR*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Belum ada pengguna Premium yang tercatat sebagai donatur.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const mentions = []

  const donorList = topDonors.map(([jid, donor], index) => {
    const name = donor.namaDonasi
      ? `*${donor.namaDonasi}*`
      : `@${jid.split('@')[0]}`

    if (!donor.namaDonasi) mentions.push(jid)

    const total = Number(donor.totalDonasi) || 0

    return `> ${index + 1}. ${name}\n` +
      `> ↳ Rp ${total.toLocaleString('id-ID')} · *${getDonationTitle(total)}*`
  }).join('\n')

  return m.reply(
    `╭─❏「 👑 TOP PREMIUM 」❏\n` +
    `│ 👑 *TOP 10 PREMIUM DONATUR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${donorList}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions }
  )
}

if (action === 'protection') {
  if (!isPremium) {
    return m.reply(
      `╭─❏「 🛡️ PREMIUM PROTECTION 」❏\n` +
      `│ ❌ *AKSES DITOLAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Premium protection khusus pengguna Premium.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const protectionStatus = PREMIUM_PROTECTION_ACTIONS.map(({ id, label }) => {
    const remaining = getPremiumProtectionRemaining(user, id, now)
    return `> ${label}: ${remaining ? `⏳ Cooldown ${formatRemaining(remaining)}` : '✅ Siap'}`
  }).join('\n')

  return m.reply(
    `╭─❏「 🛡️ PREMIUM PROTECTION 」❏\n` +
    `│ 🛡️ *PREMIUM PROTECTION*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Setiap perlindungan memiliki cooldown terpisah selama *5 jam*.\n\n` +
    `🛡️ *STATUS PROTECTION*\n` +
    `${protectionStatus}\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Protection aktif otomatis saat aksi kriminal (termasuk jarah dan culik) menargetkanmu atau saat dungeon akan membuatmu mati.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'cd' || action === 'cooldown') {
  if (!isPremium) {
    return m.reply(
      `╭─❏「 ⏰ PREMIUM COOLDOWN 」❏\n` +
      `│ ❌ *AKSES DITOLAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Premium cooldown hanya tersedia untuk pengguna Premium.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const protectionStatuses = PREMIUM_PROTECTION_ACTIONS.map(({ id, label }) => {
    const remaining = getPremiumProtectionRemaining(user, id, now)
    return `> Protection ${label}: ${remaining ? `⏳ ${formatRemaining(remaining)}` : '✅ Siap'}`
  }).join('\n')

  const lastDailyDate = user.premiumDailyDate || (
    Number(user.premiumDailyAt) > 0 ? getJakartaDate(Number(user.premiumDailyAt)) : null
  )
  const dailyRemaining = lastDailyDate === getJakartaDate(now)
    ? getJakartaMidnightMs(now) - now
    : 0

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
    `╭─❏「 ⏰ PREMIUM COOLDOWN 」❏\n` +
    `│ ⏰ *PREMIUM COOLDOWN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🎮 *COOLDOWN RPG*\n` +
    `${cooldownList}\n\n` +
    `🎁 *PREMIUM DAILY*\n` +
    `> ↳ ${dailyRemaining ? `⏳ ${formatRemaining(dailyRemaining)}` : '✅ Siap'}\n\n` +
    `🛡️ *PREMIUM PROTECTION*\n` +
    `${protectionStatuses}\n\n` +
    `📌 *COOLDOWN LAINNYA*\n` +
    `> ↳ *.cd*\n` +
    `> ↳ *.pet cd*\n` +
    `> ↳ *.kawin*\n` +
    `> ↳ *.panen*\n` +
    `> ↳ *.casino cd*\n` +
    `> ↳ *.rship cd*\n` +
    `> ↳ *.rh cd*\n` +
    `> ↳ *.penjara cd*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  if (action === 'profile' || action === 'profil') {
    const target = conn.decodeJid(m.mentionedJid?.[0] || m.quoted?.sender || m.sender)
    const profileUser = global.db?.data?.users?.[target] || {}
    const donationAmount = Number(profileUser.totalDonasi) || 0
    const isProfilePremium = isPremiumAccount(profileUser, now)
    const premiumTime = Number(profileUser.premiumTime) || 0
    const sender = conn.decodeJid(m.sender)
    const name = profileUser.namaDonasi || profileUser.name ||
      (target === sender ? m.pushName || m.name : `@${target.split('@')[0]}`) || 'Pengguna'
    const premiumStatus = isProfilePremium
      ? premiumTime >= 9999999999999
        ? 'Premium permanen'
        : `Premium aktif${premiumTime > now ? ` sampai ${new Date(premiumTime).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}` : ''}`
      : 'Bukan Premium'
    const donors = Object.entries(global.db?.data?.users || {})
      .filter(([, donor]) => Number(donor.totalDonasi) > 0)
      .sort(([, first], [, second]) => Number(second.totalDonasi) - Number(first.totalDonasi))
    const donationRank = donors.findIndex(([jid]) => conn.decodeJid(jid) === target)
    return m.reply(
      `╭─❏「 👑 PREMIUM PROFILE 」❏\n` +
      `│ 👤 Nama: *${name}*\n` +
      `│ 📱 Nomor: +${target.split('@')[0]}\n` +
      `│ 👑 Status: *${premiumStatus}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `💝 *DONASI & TITLE*\n` +
      `> Total donasi: *Rp ${donationAmount.toLocaleString('id-ID')}*\n` +
      `> Title: *${getDonationTitle(donationAmount)}*\n\n` +
      `> Peringkat donasi: *${donationRank < 0 ? 'Belum masuk peringkat' : `#${donationRank + 1}`}*\n\n` +
      `🎟️ Limit: *${Number(profileUser.limit) || 0}*\n` +
      `📌 Cek manfaat Premium: *${usedPrefix}prem benefits*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

if (/^(benefits?|manfaat)$/.test(action)) {
  return m.reply(
    `╭─❏「 👑 MANFAAT PREMIUM 」❏\n` +
    `│ 👑 *MANFAAT PREMIUM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *KEUNTUNGAN UMUM*\n` +
    `> ↳ Batas casino : *50 permainan per hari* (user biasa 25).\n` +
    `> ↳ Diskon beli *20%* dan bonus harga jual *10%* di toko RPG yang mendukung Premium.\n` +
    `> ↳ Kapasitas rumah bertambah *5 furniture* dan biaya upgrade rumah diskon *20%*.\n` +
    `> ↳ Diskon *20%* untuk semua biaya uang pada *.upgrade* dan diskon *25%* upgrade kartu bank.\n` +
    `> ↳ Biaya admin transfer bank lebih murah *50%*.\n` +
    `> ↳ Cooldown berbagai aktivitas RPG *20% lebih singkat*; cek *.prem cd*.\n` +
    `> ↳ Command berlimit, termasuk sticker, maker, dan downloader, tetap memakai limit untuk pengguna Premium.\n` +
    `> ↳ Mulai title *Donatur Setia* (total donasi Rp ${PREMIUM_DAILY_MIN_DONATION.toLocaleString('id-ID')}), klaim *${usedPrefix}prem daily* setiap hari untuk mendapat *${PREMIUM_DAILY_REWARD} limit*.\n` +
    `> ↳ Premium Protection memiliki cooldown terpisah 5 jam untuk tiap aksi (copet, rampok, begal, jarah, culik, bunuh, fitnah, dan dungeon); cek statusnya dengan *${usedPrefix}prem cd*.\n` +
    `> ↳ Cooldown Muncak lebih singkat : *2 jam* (user biasa 5 jam). Contoh : *${usedPrefix}mt start*.\n` +
    `> ↳ Cooldown interaksi pasangan lebih singkat : *30 detik* (user biasa 60 detik). Contoh : *${usedPrefix}act*.\n\n` +

    `🌱 *LADANG*\n` +
    `> ↳ Bisa upgrade hingga *20 slot ladang* (user biasa maksimal 10).\n` +
    `> ↳ Contoh : *${usedPrefix}buyladang* untuk upgrade, *${usedPrefix}tanam list* untuk melihat bibit.\n\n` +

    `🐾 *PET*\n` +
    `> ↳ Kapasitas pet bertambah menjadi *15 slot* (user biasa 10).\n` +
    `> ↳ *${usedPrefix}pet care* memberi feed, rest, dan clean ke semua pet; cooldown 30 menit.\n` +
    `> ↳ Setelah care, *${usedPrefix}pet all* menjalankan train, walk, play, hunt, dan dispatch untuk semua pet; cooldown 30 menit.\n` +
    `> ↳ Contoh : *${usedPrefix}pet care*, lalu *${usedPrefix}pet all*.\n\n` +

    `💕 *RELATIONSHIP*\n` +
    `> ↳ *${usedPrefix}rship all <no pasangan>* menjalankan semua aktivitas yang siap untuk pasangan tersebut; cooldown all 30 menit.\n` +
    `> ↳ Contoh : *${usedPrefix}rship all 1*.\n\n` +

    `🕊️ *REHABILITASI*\n` +
    `> ↳ *${usedPrefix}rh all* menjalankan semua aktivitas rehabilitasi yang cooldown-nya siap.\n` +
    `> ↳ Contoh : *${usedPrefix}rh all*; cek waktu aktivitas dengan *${usedPrefix}rh cd*.\n\n` +

    `🍱 *MBG*\n` +
    `> ↳ Dapat mengambil hingga *2 pasangan menu per hari* dan memilih dari *5 menu* saat menukar.\n` +
    `> ↳ Contoh : *${usedPrefix}mbg tukar*, pilih dengan *${usedPrefix}mbg tukar 1–5*, lalu klaim dengan *${usedPrefix}mbg ambil 1 2*.\n\n` +

    `📌 *INFORMASI*\n` +
    `> ↳ Profil donasi/title : *${usedPrefix}premium profile*; cek cooldown dengan *${usedPrefix}prem cd*.\n` +
    `> ↳ Daftar title, reward, harga, dan top donatur : *${usedPrefix}prem title*, *${usedPrefix}prem reward*, *${usedPrefix}prem price*, *${usedPrefix}prem top*.\n` +
    `> ↳ Lihat status dan cara mendapatkan Premium : *${usedPrefix}premium*\n\n` +

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
    `> ↳ Harga donasi seikhlasnya; Premium yang sudah diverifikasi berlaku permanen untuk saat ini.\n` +
    `> ↳ Kebijakan ini dapat berubah; ke depannya Premium mungkin memiliki batas waktu.\n\n` +

    `💰 *CARA MENDAPATKAN*\n` +
    `> ↳ 1. Ketik *${usedPrefix}prem price* untuk arahan harga atau *${usedPrefix}donasi* untuk QRIS.\n` +
    `> ↳ 2. Kirim foto bukti transfer dengan *${usedPrefix}konfirmasidonasi nominal | nama*.\n` +
    `> ↳ 3. Tunggu verifikasi Owner. Cek hadiah dengan *${usedPrefix}prem reward*.\n\n` +

    `📌 *PERTANYAAN*\n` +
    `> ↳ Ketik *${usedPrefix}owner* untuk pertanyaan lebih lanjut.\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = [
  'premium',
  'premium benefits',
  'premium profile',
  'prem profile',
  'premium protection',
  'prem daily',
  'prem cd',
  'prem benefits',
  'prem title',
  'prem reward',
  'prem price',
  'prem pricelist',
  'prem top'
]
handler.tags = ['info']
handler.command = /^(premium|prem)$/i

export default handler
