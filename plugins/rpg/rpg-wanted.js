import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { computeCrimeScore, ensurePatrolReleaseProtection, getActiveCrimeScore, getPatrolCaptureChance, getPatrolCapturePenalty, getPatrolProtectionRemaining, syncAllEscapeCrimeCounts } from '../../lib/crimeHelper.js'
import { getPatrolCaptureStory, hasRpgPanelAccess } from '../../lib/patrolHelper.js'
import { registerPrisoner } from '../../lib/prisonHelper.js'
import { RPG_CRIME_TYPES } from '../../lib/rpgCrimeAction.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

function getWantedList(db, conn) {
  return filterLeaderboardUsers(Object.entries(db.crime || {}), conn, ([jid]) => jid)
    .filter(([, data]) => data && getActiveCrimeScore(data) > 0)
    .sort((a, b) => getActiveCrimeScore(b[1]) - getActiveCrimeScore(a[1]))
}

function getCrimeHistoryList(db, conn) {
  return filterLeaderboardUsers(Object.entries(db.crime || {}), conn, ([jid]) => jid)
    .filter(([, data]) => data && computeCrimeScore(data) > 0)
    .sort((a, b) => computeCrimeScore(b[1]) - computeCrimeScore(a[1]))
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

let handler = async (m, { conn, args, isOwner, groupMetadata, usedPrefix }) => {
  const wdb = loadDB()
  if (!wdb.crime) wdb.crime = {}

  if (args[0]?.toLowerCase() === 'reset') {
    if (!isOwner) return m.reply('❌ Khusus Owner')
    wdb.crime = {}
    await saveDB(wdb)
    return m.reply('✅ Data kriminal berhasil di-reset')
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
    if (!rawTarget) return m.reply('❌ Tag atau reply pesan pelaku kriminal yang ingin ditangkap.')

    const targetJid = conn.decodeJid?.(rawTarget) ||
      global.lids?.[rawTarget] ||
      global.db?.data?.lids?.[rawTarget] ||
      rawTarget
    const wantedIndex = findWantedByJid(crimeList, targetJid)
    if (wantedIndex < 0) return m.reply('❌ Target tidak ditemukan dalam daftar kriminal aktif.')

    const [wantedJid, wantedData] = crimeList[wantedIndex]
    const userRPG = global.db?.data?.users?.[wantedJid]?.rpg || wdb.users?.[wantedJid]?.rpg
    if (!userRPG) return m.reply('❌ Data RPG pelaku kriminal tidak ditemukan.')
    if (userRPG.rehabilitation?.status === 'active') {
      return m.reply('🕊️ Pelaku tersebut sedang menjalani rehabilitasi dan tidak bisa ditangkap patroli.')
    }

    const now = Date.now()
    ensurePatrolReleaseProtection(userRPG, now)
    if (userRPG.penjara && now - userRPG.penjara < (Number(userRPG.lamaPenjara) || 0)) {
      return m.reply('🚔 Pelaku tersebut sudah berada di penjara.')
    }
    if (getPatrolProtectionRemaining(userRPG, 'capture', now) > 0) {
      return m.reply('🛡️ Pelaku tersebut masih memiliki perlindungan dari cidukan patroli.')
    }
    if (getPatrolProtectionRemaining(userRPG, 'prison', now) > 0) {
      return m.reply('🛡️ Perlindungan mantan napi mencegah pelaku tersebut masuk penjara.')
    }

    const score = getActiveCrimeScore(wantedData)
    const penalty = getPatrolCapturePenalty(score)
    userRPG.penjara = now
    userRPG.lamaPenjara = penalty.durationMs
    userRPG.tebusan = penalty.ransom
    userRPG.kasus = '👮 Patroli kriminal'
    userRPG.sel = registerPrisoner(wdb, wantedJid)
    if (!userRPG.sel) {
      userRPG.penjara = null
      userRPG.lamaPenjara = 0
      userRPG.tebusan = 0
      userRPG.kasus = null
      return m.reply('🛡️ Perlindungan mantan napi mencegah pelaku tersebut masuk penjara.')
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
      `│ 👤 Pelaku kriminal: @${wantedJid.split('@')[0]}\n` +
      `│ 💀 Poin kriminal aktif: *${score} poin*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${getPatrolCaptureStory()}\n\n` +
      `Kamu masuk di *SEL ${userRPG.sel}*\n` +
      `Ditahan selama *${durationText}*.\n` +
      `Tebusan: *Rp ${penalty.ransom.toLocaleString('id-ID')}*.`
    return conn.reply(m.chat, text, m, { mentions: [wantedJid] })
  }

  if (!action) {
    const overviewText =
      `╭─❏「 🚨 DATA KRIMINAL AVELIA 」❏\n` +
      `│ Saat ini ada *${crimeList.length} pemain* dengan poin kriminal aktif.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Poin aktif berasal dari aksi kriminal dan kabur dari penjara. Poin yang sudah direhabilitasi tidak masuk daftar aktif, tetapi tetap tersimpan dalam riwayat seumur hidup.\n\n` +
      `Lihat daftar aktif atau telusuri peringkat berdasarkan seluruh riwayat kriminal.`
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '🚨 PUSAT DATA KRIMINAL',
      subtitle: 'Pantau aktivitas dan riwayat kriminal Kota Avelia',
      text: overviewText,
      buttonText: '📋 JELAJAHI DATA KRIMINAL',
      sections: [{
        title: 'Pilih tampilan data',
        rows: [
          { title: '🚨 Kriminal aktif', description: 'Lihat pemain dengan poin kriminal aktif saat ini', id: `${usedPrefix}kriminal list` },
          { title: '🏆 Top riwayat kriminal', description: 'Peringkat total poin, termasuk riwayat yang telah direhabilitasi', id: `${usedPrefix}kriminal top` }
        ]
      }],
      fallbackText: `${overviewText}\n\n📌 *PILIHAN*\n> ↳ Kriminal aktif: *${usedPrefix}kriminal list*\n> ↳ Top riwayat kriminal: *${usedPrefix}kriminal top*`,
      noThumbnail: true
    })
  }

  if (action === 'command' || action === 'commands' || action === 'cmd') {
    const fallbackText =
      `╭─❏「 📋 COMMAND KRIMINAL 」❏\n` +
      `│ *.kriminal* - Ringkasan jumlah kriminal aktif\n` +
      `│ *.kriminal list [halaman]* - Daftar kriminal aktif, 10 orang/halaman\n` +
      `│ *.kriminal top [halaman]* - Peringkat total poin kriminal seumur hidup\n` +
      `│ *.kriminal detail <nomor/tag/reply>* - Detail pemain kriminal aktif\n` +
      `│ *.kriminal data* - Data poin aktif dan riwayat kriminalmu\n` +
      `│ *.kriminal info* - Penjelasan poin dan sistem patroli\n` +
      (isOwner ? `│ *.kriminal reset* - Reset data kriminal\n` : '') +
      `│ *.buronan* tetap tersedia sebagai alias\n` +
      `╰─━━━━━━━━━━━━━━─`
    const rows = [
      { title: '🚨 Ringkasan kriminal', description: 'Lihat jumlah pemain dengan poin kriminal aktif', id: `${usedPrefix}kriminal` },
      { title: '📋 Daftar kriminal aktif', description: 'Telusuri pemain kriminal berdasarkan halaman', id: `${usedPrefix}kriminal list` },
      { title: '🏆 Top riwayat kriminal', description: 'Bandingkan total poin seumur hidup, termasuk poin rehabilitasi', id: `${usedPrefix}kriminal top` },
      { title: '🔎 Detail kriminal', description: 'Periksa status berdasarkan nomor atau pemain', id: `${usedPrefix}kriminal detail` },
      { title: '📊 Data kriminalmu', description: 'Lihat poin aktif dan seluruh riwayat kriminal', id: `${usedPrefix}kriminal data` },
      { title: '📖 Sistem patroli', description: 'Pelajari poin kriminal dan mekanisme patroli', id: `${usedPrefix}kriminal info` },
      ...(isOwner ? [{ title: '🧹 Reset data kriminal', description: 'Atur ulang catatan kriminal pemain', id: `${usedPrefix}kriminal reset` }] : [])
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '🚨 PUSAT DATA KRIMINAL',
      subtitle: 'Pilih informasi kriminal yang ingin kamu telusuri',
      text: 'Pantau aktivitas kriminal, statistik, dan sistem patroli kota.',
      buttonText: '🚨 BUKA DATA KRIMINAL',
      sections: [{ title: 'Informasi kriminal', rows }],
      noThumbnail: true,
      fallbackText
    })
  }

  if (action === 'data') {
    const data = wdb.crime?.[m.sender]
    const activeScore = getActiveCrimeScore(data)
    const lifetimeScore = computeCrimeScore(data)
    const archivedScore = Math.max(0, Number(data?.pardonedScore) || 0)
    const crimeCounts = RPG_CRIME_TYPES.map(({ key, label, emoji, score }) =>
      `> ${emoji} ${label}: *${Number(data?.[key]) || 0}x* (${(Number(data?.[key]) || 0) * score} poin)`
    )
    return m.reply(
      `╭─❏「 📊 DATA KRIMINALMU 」❏\n` +
      `│ 💀 Poin aktif: *${activeScore} poin*\n` +
      `│ 📜 Poin riwayat yang direhabilitasi: *${archivedScore} poin*\n` +
      `│ 🧾 Total poin kriminal: *${lifetimeScore} poin*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${crimeCounts.join('\n')}\n\n` +
      `Poin aktif bertambah dari tindak kriminal baru; riwayat lama tetap tersimpan.`
    )
  }

  if (action === 'info') {
    return m.reply(
      `╭─❏「 📖 INFO KRIMINAL 」❏\n` +
      `│ *SISTEM PATROLI KANTOR POLISI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Pelaku kejahatan dan tahanan yang berhasil kabur akan tercatat sebagai kriminal aktif. Saat pemain kriminal melakukan aktivitas RPG, patroli dapat mencurigai dan menangkapnya—termasuk casino, panen, kerja, dan aktivitas lainnya.\n\n` +
      `🚨 *PELUANG TERTANGKAP*\n` +
      `> ↳ Peluang dasar patroli sangat kecil: *0,1% + 0,05% per poin* dan maksimal *5% setiap aktivitas RPG*.\n` +
      `> ↳ Contoh: *10 poin* = peluang tertangkap *0,6%* per aktivitas; poin yang lebih tinggi menaikkan peluang secara bertahap.\n` +
      `> ↳ Setiap aktivitas adalah pemeriksaan terpisah, jadi pemain kriminal tidak selalu tertangkap.\n` +
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
      `> Jumlah kabur di detail kriminal disinkronkan dengan catatan *.penjara escord*.\n\n` +
      `🏅 *ARTI IKON*\n` +
      `> 👑 / 🥈 / 🥉 - Peringkat 1, 2, dan 3\n` +
      `> 💀 - Total poin kriminal\n` +
      `> Ikon kejahatan di atas menunjukkan jumlah tiap aksi; poinnya mengikuti bobot masing-masing.\n\n` +
      `Poin kriminal aktif mengikuti kejahatan sejak rehabilitasi terakhir. Poin dan jumlah kejahatan lama tetap tersimpan sebagai riwayat seumur hidup. Gunakan *.kriminal list* untuk daftar aktif, *.kriminal top* untuk peringkat riwayat seumur hidup, dan *.kriminal detail <nomor/tag/reply>* untuk profil kriminal aktif.`
    )
  }

  if (action === 'top') {
    const historyList = getCrimeHistoryList(wdb, conn)
    if (!historyList.length) return m.reply('📋 Belum ada riwayat kriminal yang tercatat.')
    const requestedPage = Number.parseInt(args[1], 10)
    const totalPages = Math.ceil(historyList.length / 10)
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    if (page > totalPages) return m.reply(`❌ Halaman tidak tersedia. Total halaman: *${totalPages}*.`)

    const start = (page - 1) * 10
    const entries = historyList.slice(start, start + 10)
    const mentions = []
    let text = `╭─❏「 🏆 TOP RIWAYAT KRIMINAL 」❏\n`
    text += `│ *PERINGKAT SEUMUR HIDUP • HALAMAN ${page}/${totalPages}*\n`
    text += `╰─━━━━━━━━━━━━━━─\n\n`
    text += `Peringkat ini menghitung seluruh poin kriminal yang tercatat, termasuk poin yang sudah direhabilitasi.\n\n`

    entries.forEach(([jid, data], index) => {
      const rank = start + index + 1
      const medal = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
      const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata })
      if (identity.mention) mentions.push(identity.mention)
      text += `${medal} ${identity.display} • *${computeCrimeScore(data)} poin total*\n`
      text += `> Poin aktif: *${getActiveCrimeScore(data)}* • ${getActiveCrimeScore(data) > 0 ? '🚨 Aktif' : '📜 Riwayat'}\n`
    })

    text += `\n─━━━━━━━━━━━━━━─\n`
    text += `Halaman berikutnya: *.kriminal top ${Math.min(page + 1, totalPages)}*`
    return conn.reply(m.chat, text, m, { mentions })
  }

  if (action === 'list') {
    if (!crimeList.length) return m.reply('📋 Belum ada pemain dengan poin kriminal aktif.')
    const requestedPage = Number.parseInt(args[1], 10)
    const totalPages = Math.ceil(crimeList.length / 10)
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    if (page > totalPages) return m.reply(`❌ Halaman tidak tersedia. Total halaman: *${totalPages}*.`)

    const start = (page - 1) * 10
    const entries = crimeList.slice(start, start + 10)
    const mentions = []
    let text = `╭─❏「 🚨 DAFTAR KRIMINAL AKTIF 」❏\n`
    text += `│ *DAFTAR KRIMINAL • HALAMAN ${page}/${totalPages}*\n`
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
    text += `Halaman berikutnya: *.kriminal list ${Math.min(page + 1, totalPages)}*`
    return conn.reply(m.chat, text, m, { mentions })
  }

  if (action === 'detail') {
    if (!crimeList.length) return m.reply('📋 Belum ada pemain dengan poin kriminal aktif.')
    const taggedJid = m.mentionedJid?.[0] || m.quoted?.sender
    const targetArg = args[1]
    const index = taggedJid
      ? findWantedByJid(crimeList, taggedJid)
      : /^\d+$/.test(targetArg || '')
        ? Number(targetArg) - 1
        : findWantedByJid(crimeList, targetArg)

    if (!Number.isInteger(index) || index < 0 || index >= crimeList.length) {
      return m.reply('❌ Pemain tidak ditemukan. Gunakan nomor peringkat, tag, atau reply pesan dari *.kriminal list*.')
    }

    const [jid, data] = crimeList[index]
    const score = getActiveCrimeScore(data)
    const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata })
    let text = `╭─❏「 🔎 DETAIL KRIMINAL 」❏\n`
    text += `│ 🏅 Peringkat: *#${index + 1}*\n`
    text += `│ 👤 Nama: ${identity.display}\n`
    text += `│ 💀 Poin aktif: *${score} poin*\n`
    if ((Number(data.pardonedScore) || 0) > 0) {
      text += `│ 📜 Poin yang telah direhabilitasi: *${Number(data.pardonedScore)} poin*\n`
      text += `│ 🧾 Total riwayat seumur hidup: *${computeCrimeScore(data)} poin*\n`
    }
    text += `│ 🚨 Peluang tertangkap: *${(getPatrolCaptureChance(score) * 100).toFixed(1)}% per aktivitas RPG*\n`
    text += `╰─━━━━━━━━━━━━━━─\n\n`
    for (const { key, label, emoji, score } of RPG_CRIME_TYPES) {
      text += `${emoji} ${label}: *${Number(data[key]) || 0}x* (${(Number(data[key]) || 0) * score} poin)\n`
    }
    text += `\nGunakan *.kriminal info* untuk memahami perhitungan poin dan patroli.`
    return conn.reply(m.chat, text, m, { mentions: identity.mention ? [identity.mention] : [] })
  }

  return m.reply('❌ Subcommand tidak dikenal. Ketik *.kriminal command* untuk melihat semua command.')
}

handler.help = ['kriminal', 'kriminal list', 'kriminal top', 'kriminal detail', 'kriminal data', 'kriminal info', 'kriminal command', 'buronan']
handler.tags = ['rpg']
handler.command = /^(buronan|kriminal|mostwanted|topkriminal|dpo)$/i
handler.group = true
export default handler
