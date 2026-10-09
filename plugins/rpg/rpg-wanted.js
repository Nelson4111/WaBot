import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { computeCrimeScore, ensurePatrolReleaseProtection, getActiveCrimeScore, getPatrolCaptureChance, getPatrolCapturePenalty, getPatrolProtectionRemaining, syncAllEscapeCrimeCounts } from '../../lib/crimeHelper.js'
import { getPatrolCaptureStory, hasRpgPanelAccess } from '../../lib/patrolHelper.js'
import { registerPrisoner } from '../../lib/prisonHelper.js'
import { RPG_CRIME_TYPES } from '../../lib/rpgCrimeData.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

function getWantedList(db, conn) {
  return filterLeaderboardUsers(Object.entries(db.crime || {}), conn, ([jid]) => jid)
    .filter(([, data]) => data && getActiveCrimeScore(data) > 0)
    .sort((a, b) => getActiveCrimeScore(b[1]) - getActiveCrimeScore(a[1]))
}

function findWantedByJid(crimeList, jid) {
  if (!jid) return -1
  const mappedJid = global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
  const digits = String(mappedJid).split('@')[0].split(':')[0].replace(/\D/g, '')
  return crimeList.findIndex(([entryJid]) => {
    const entryMappedJid = global.lids?.[entryJid] || global.db?.data?.lids?.[entryJid] || entryJid
    return entryJid === jid || entryMappedJid === mappedJid ||
      (digits && String(entryMappedJid).split('@')[0].split(':')[0].replace(/\D/g, '') === digits)
  })
}

let handler = async (m, { conn, args, isOwner, groupMetadata }) => {
  const wdb = loadDB()
  if (!wdb.crime) wdb.crime = {}

  if (args[0]?.toLowerCase() === 'reset') {
    if (!isOwner) return m.reply('❌ Khusus Owner')
    wdb.crime = {}
    await saveDB(wdb)
    return m.reply('✅ Data buronan berhasil di-reset')
  }

  const action = args[0]?.toLowerCase()
  if (action === 'tangkap' && !hasRpgPanelAccess(m.sender, isOwner)) {
    return m.reply('❌ Command ini khusus pengguna dengan akses panel RPG.')
  }

  syncAllEscapeCrimeCounts(wdb)
  await saveDB(wdb)
  const crimeList = getWantedList(wdb, conn)

  if (action === 'tangkap') {
    const rawTarget = m.mentionedJid?.[0] || m.quoted?.sender
    if (!rawTarget) return m.reply('❌ Tag atau reply pesan buronan yang ingin ditangkap.')

    const targetJid = conn.decodeJid?.(rawTarget) ||
      global.lids?.[rawTarget] ||
      global.db?.data?.lids?.[rawTarget] ||
      rawTarget
    const wantedIndex = findWantedByJid(crimeList, targetJid)
    if (wantedIndex < 0) return m.reply('❌ Target tidak ditemukan dalam daftar buronan aktif.')

    const [wantedJid, wantedData] = crimeList[wantedIndex]
    const userRPG = global.db?.data?.users?.[wantedJid]?.rpg || wdb.users?.[wantedJid]?.rpg
    if (!userRPG) return m.reply('❌ Data RPG buronan tidak ditemukan.')
    if (userRPG.rehabilitation?.status === 'active') {
      return m.reply('🕊️ Buronan tersebut sedang menjalani rehabilitasi dan tidak bisa ditangkap patroli.')
    }

    const now = Date.now()
    ensurePatrolReleaseProtection(userRPG, now)
    if (userRPG.penjara && now - userRPG.penjara < (Number(userRPG.lamaPenjara) || 0)) {
      return m.reply('🚔 Buronan tersebut sudah berada di penjara.')
    }
    if (getPatrolProtectionRemaining(userRPG, 'capture', now) > 0) {
      return m.reply('🛡️ Buronan tersebut masih memiliki perlindungan dari cidukan patroli.')
    }
    if (getPatrolProtectionRemaining(userRPG, 'prison', now) > 0) {
      return m.reply('🛡️ Perlindungan mantan napi mencegah buronan tersebut masuk penjara.')
    }

    const score = getActiveCrimeScore(wantedData)
    const penalty = getPatrolCapturePenalty(score)
    userRPG.penjara = now
    userRPG.lamaPenjara = penalty.durationMs
    userRPG.tebusan = penalty.ransom
    userRPG.kasus = '👮 Patroli buronan'
    userRPG.sel = registerPrisoner(wdb, wantedJid)
    if (!userRPG.sel) {
      userRPG.penjara = null
      userRPG.lamaPenjara = 0
      userRPG.tebusan = 0
      userRPG.kasus = null
      return m.reply('🛡️ Perlindungan mantan napi mencegah buronan tersebut masuk penjara.')
    }
    userRPG.patrolCaughtAt = now
    wantedData.ditangkap = (Number(wantedData.ditangkap) || 0) + 1
    await saveDB(wdb)

    const durationMinutes = Math.ceil(penalty.durationMs / (60 * 1000))
    const durationHours = Math.floor(durationMinutes / 60)
    const remainingMinutes = durationMinutes % 60
    const durationText = durationHours
      ? `${durationHours} jam${remainingMinutes ? ` ${remainingMinutes} menit` : ''}`
      : `${remainingMinutes} menit`
    const text =
      `╭─❏「 🚔 TERTANGKAP PATROLI 」❏\n` +
      `│ 👤 Buronan: @${wantedJid.split('@')[0]}\n` +
      `│ 💀 Poin buronan: *${score} poin*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${getPatrolCaptureStory()}\n\n` +
      `Kamu masuk di *SEL ${userRPG.sel}*\n` +
      `Ditahan selama *${durationText}*.\n` +
      `Tebusan: *Rp ${penalty.ransom.toLocaleString('id-ID')}*.`
    return conn.reply(m.chat, text, m, { mentions: [wantedJid] })
  }

  if (!action) {
    return m.reply(
      `🚨 *DATA BURONAN KOTA AVELIA*\n` +
      `Saat ini ada *${crimeList.length} orang* berstatus buronan.\n\n` +
      `Ketik *.buronan list* untuk melihat daftar buronan.`
    )
  }

  if (action === 'command' || action === 'commands' || action === 'cmd') {
    return m.reply(
      `╭─❏「 📋 COMMAND BURONAN 」❏\n` +
      `│ *.buronan* - Jumlah buronan aktif\n` +
      `│ *.buronan list [halaman]* - Daftar buronan, 10 orang/halaman\n` +
      `│ *.buronan detail <nomor/tag/reply>* - Detail buronan\n` +
      `│ *.buronan info* - Penjelasan poin dan patroli\n` +
      (isOwner ? `│ *.buronan reset* - Reset data kriminal\n` : '') +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'info') {
    return m.reply(
      `╭─❏「 📖 INFO BURONAN 」❏\n` +
      `│ *SISTEM PATROLI KANTOR POLISI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Pelaku kejahatan dan tahanan yang berhasil kabur akan masuk daftar buronan. Saat buronan melakukan aktivitas RPG, patroli dapat mencurigai dan menangkapnya—termasuk casino, panen, kerja, dan aktivitas lainnya.\n\n` +
      `🚨 *PELUANG TERTANGKAP*\n` +
      `> ↳ Peluang dasar patroli sangat kecil: *0,1% + 0,05% per poin* dan maksimal *5% setiap aktivitas RPG*.\n` +
      `> ↳ Contoh: *10 poin* = peluang tertangkap *0,6%* per aktivitas; poin yang lebih tinggi menaikkan peluang secara bertahap.\n` +
      `> ↳ Setiap aktivitas adalah pemeriksaan terpisah, jadi buronan tidak selalu tertangkap.\n` +
      `> ↳ Hukuman dasar: *30 menit + 5 menit per poin* dan tebusan *Rp 500.000 + Rp 100.000 per poin*.\n` +
      `> ↳ Contoh: *10 poin* = *1 jam 20 menit* tahanan dan *Rp 1.500.000* tebusan.\n\n` +
      `🕊️ *STATUS MANTAN NAPI*\n` +
      `> ↳ Anti-kejahatan: *15 menit* setelah bebas dari cidukan patroli.\n` +
      `> ↳ Anti-masuk penjara: *30 menit* setelah bebas dari cidukan patroli.\n` +
      `> ↳ Anti-ciduk patroli: *2 jam* setelah bebas dari cidukan patroli.\n\n` +
      `💀 *BOBOT POIN KEJAHATAN*\n` +
      `> 🕵️ Rampok: *+4 poin* per aksi\n` +
      `> 🏚️ Jarah: *+4 poin* per aksi\n` +
      `> 🕶️ Culik: *+3 poin* per aksi\n` +
      `> 🔪 Bunuh: *+3 poin* per aksi\n` +
      `> 🏴‍☠️ Begal: *+2 poin* per aksi\n` +
      `> 🤏 Copet: *+1 poin* per aksi\n` +
      `> 🏃 Kabur sendiri dari penjara: *+5 poin*\n` +
      `> 🧱 Kabur lewat breakout bersama: *+5 poin* untuk setiap peserta\n` +
      `> Jumlah kabur di detail buronan disinkronkan dengan catatan *.penjara escord*.\n\n` +
      `🏅 *ARTI IKON*\n` +
      `> 👑 / 🥈 / 🥉 - Peringkat 1, 2, dan 3\n` +
      `> 💀 - Total poin buronan\n` +
      `> Ikon kejahatan di atas menunjukkan jumlah tiap aksi; poinnya mengikuti bobot masing-masing.\n\n` +
      `Poin buronan aktif mengikuti kejahatan sejak rehabilitasi terakhir. Poin dan jumlah kejahatan lama tetap tersimpan sebagai riwayat seumur hidup. Gunakan *.buronan list* untuk daftar dan *.buronan detail <nomor/tag/reply>* untuk profil buronan aktif.`
    )
  }

  if (action === 'list') {
    if (!crimeList.length) return m.reply('📋 Belum ada buronan di kota ini.')
    const requestedPage = Number.parseInt(args[1], 10)
    const totalPages = Math.ceil(crimeList.length / 10)
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    if (page > totalPages) return m.reply(`❌ Halaman tidak tersedia. Total halaman: *${totalPages}*.`)

    const start = (page - 1) * 10
    const entries = crimeList.slice(start, start + 10)
    const mentions = []
    let text = `╭─❏「 🚨 MOST WANTED 」❏\n`
    text += `│ *DAFTAR BURONAN • HALAMAN ${page}/${totalPages}*\n`
    text += `╰─━━━━━━━━━━━━━━─\n\n`

    entries.forEach(([jid, data], index) => {
      const rank = start + index + 1
      const medal = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
      const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata })
      if (identity.mention) mentions.push(identity.mention)
      text += `${medal} ${identity.display} • *${getActiveCrimeScore(data)} poin*\n`
      const crimeCounts = RPG_CRIME_TYPES.map(({ key, emoji }) =>
        `${emoji}${String(Number(data[key]) || 0).padStart(2, '0')}`
      )
      text += `> ${crimeCounts.slice(0, 4).join('  ')}\n`
      text += `> ${crimeCounts.slice(4).join('  ')}\n`
    })

    text += `\n─━━━━━━━━━━━━━━─\n`
    text += `Halaman berikutnya: *.buronan list ${Math.min(page + 1, totalPages)}*`
    return conn.reply(m.chat, text, m, { mentions })
  }

  if (action === 'detail') {
    if (!crimeList.length) return m.reply('📋 Belum ada buronan di kota ini.')
    const taggedJid = m.mentionedJid?.[0] || m.quoted?.sender
    const targetArg = args[1]
    const index = taggedJid
      ? findWantedByJid(crimeList, taggedJid)
      : /^\d+$/.test(targetArg || '')
        ? Number(targetArg) - 1
        : findWantedByJid(crimeList, targetArg)

    if (!Number.isInteger(index) || index < 0 || index >= crimeList.length) {
      return m.reply('❌ Buronan tidak ditemukan. Gunakan nomor peringkat, tag, atau reply pesan buronan dari *.buronan list*.')
    }

    const [jid, data] = crimeList[index]
    const score = getActiveCrimeScore(data)
    const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata })
    let text = `╭─❏「 🔎 DETAIL BURONAN 」❏\n`
    text += `│ 🏅 Peringkat: *#${index + 1}*\n`
    text += `│ 👤 Nama: ${identity.display}\n`
    text += `│ 💀 Total: *${score} poin*\n`
    if ((Number(data.pardonedScore) || 0) > 0) {
      text += `│ 📜 Poin riwayat yang telah direhabilitasi: *${Number(data.pardonedScore)} poin*\n`
      text += `│ 🧾 Total poin kriminal seumur hidup: *${computeCrimeScore(data)} poin*\n`
    }
    text += `│ 🚨 Peluang tertangkap: *${(getPatrolCaptureChance(score) * 100).toFixed(1)}% per aktivitas RPG*\n`
    text += `╰─━━━━━━━━━━━━━━─\n\n`
    for (const { key, label, emoji, score } of RPG_CRIME_TYPES) {
      text += `${emoji} ${label}: *${Number(data[key]) || 0}x* (${(Number(data[key]) || 0) * score} poin)\n`
    }
    text += `\nGunakan *.buronan info* untuk memahami perhitungan poin dan patroli.`
    return conn.reply(m.chat, text, m, { mentions: identity.mention ? [identity.mention] : [] })
  }

  return m.reply('❌ Subcommand tidak dikenal. Ketik *.buronan command* untuk melihat semua command.')
}

handler.help = ['buronan', 'buronan list', 'buronan detail', 'buronan info', 'buronan command']
handler.tags = ['rpg']
handler.command = /^(buronan|mostwanted|topkriminal|dpo)$/i
handler.group = true
export default handler
