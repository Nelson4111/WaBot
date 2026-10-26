import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  canReceiveRareActivityRewards,
  DIFFICULTY_CHANGES_PER_WEEK,
  getDifficultyChangesRemaining,
  getPremiumDifficultyChangesRemaining,
  getDifficulty,
  getDifficultyProfile,
  normalizeDifficulty,
  recordDifficultyChange,
  RPG_DIFFICULTIES
} from '../../lib/rpgDifficulty.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'

const DIFFICULTY_CHOICES = [
  { key: 'peaceful', emoji: '🌿', description: 'Santai, regen HP, tanpa kriminal atau leaderboard' },
  { key: 'easy', emoji: '🍃', description: 'Risiko dan cooldown lebih rendah, hadiah lebih kecil' },
  { key: 'normal', emoji: '⚔️', description: 'Tantangan dan hadiah standar' },
  { key: 'hardcore', emoji: '🔥', description: 'Hadiah standar, combat dan risiko lebih berat' },
  { key: 'nightmare', emoji: '💀', description: 'Hadiah lebih besar, risiko dan cooldown ekstrem' }
]

function formatMultiplier(value) {
  return `${Math.round(value * 100)}%`
}

function formatDifficultyTime(ms) {
  if (!ms) return 'Tidak ada cooldown'
  const totalSeconds = Math.ceil(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds} detik`
  const totalMinutes = Math.round(totalSeconds / 60)
  if (totalMinutes < 60) return `${totalMinutes} menit`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours < 24) return `${hours} jam${minutes ? ` ${minutes} menit` : ''}`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days} hari${remainingHours ? ` ${remainingHours} jam` : ''}`
}

function formatCrimeSuccess(profile) {
  if (profile.crimeSuccess === 0) return 'Normal (±0 poin persentase)'
  if (profile.crimeSuccess < 0) return `${profile.crimeSuccess * 100} poin persentase peluang sukses`
  return `+${profile.crimeSuccess * 100} poin persentase peluang sukses`
}

function getDifficultyComparison(key) {
  const profile = RPG_DIFFICULTIES[key]
  const normal = RPG_DIFFICULTIES.normal
  const percent = value => `${Math.round(value * 100)}%`
  const crime = key === 'peaceful'
    ? 'Dinonaktifkan'
    : `${formatCrimeSuccess(normal.crimeSuccess)} → ${formatCrimeSuccess(profile.crimeSuccess)}`
  const regeneration = key === 'peaceful'
    ? 'Tidak ada → 1 HP/menit'
    : 'Tidak ada → Tidak ada'
  const rareRewards = canReceiveRareActivityRewards({ difficulty: key })
    ? 'Tersedia → Tersedia'
    : 'Tersedia → Tidak tersedia'
  const leaderboard = profile.leaderboard
    ? 'Masuk → Masuk'
    : 'Masuk → Tidak masuk'

  return [
    `💰 Penghasilan: x${normal.income} → x${profile.income}`,
    `✨ EXP: x${normal.xp} → x${profile.xp}`,
    `💎 Drop rate: x${normal.dropRate} → x${profile.dropRate}`,
    `⏱️ Cooldown aksi: x${normal.cooldown} → x${profile.cooldown}`,
    `   Contoh cooldown normal 2 menit: ${formatDifficultyTime(2 * 60000)} → ${formatDifficultyTime(2 * 60000 * profile.cooldown)}`,
    `🎁 Reset klaim Daily: Pukul 00.00 WIB → Pukul 00.00 WIB (tidak dipengaruhi difficulty)`,
    `⚔️ Damage yang diberikan: ${percent(normal.damageDealt)} → ${percent(profile.damageDealt)}`,
    `🛡️ Damage yang diterima: ${percent(normal.damageReceived)} → ${percent(profile.damageReceived)}`,
    `💸 Kerugian uang saat jadi target kriminal: x${normal.crimeLoss} → x${profile.crimeLoss}`,
    `🎲 Peluang gagal aktivitas: x${normal.activityFailure} → x${profile.activityFailure}`,
    `🕵️ Peluang sukses kriminal: ${crime}`,
    `🩹 Cooldown heal setelah mati: ${formatDifficultyTime(normal.deathHealCooldown)} → ${formatDifficultyTime(profile.deathHealCooldown)}`,
    `❤️ Regenerasi HP otomatis: ${regeneration}`,
    `🏅 Reward langka Guild/Dungeon: ${rareRewards}`,
    `🏆 Leaderboard RPG: ${leaderboard}`
  ].join('\n')
}

function getGuide() {
  const modeDescriptions = {
    peaceful: 'Pemulihan otomatis 1 HP/menit; kriminal dinonaktifkan dan tidak masuk leaderboard.',
    easy: 'Mode berisiko rendah; reward langka misi Guild/Dungeon tidak tersedia.',
    normal: 'Semua modifier berada di nilai standar.',
    hardcore: 'Kriminal lebih sulit; heal setelah mati memiliki jeda 30 menit.',
    nightmare: 'Kriminal jauh lebih sulit; heal setelah mati memiliki jeda 2 jam.'
  }
  const modes = DIFFICULTY_CHOICES.map(({ key, emoji }) => {
    const profile = RPG_DIFFICULTIES[key]
    const crime = key === 'peaceful'
      ? 'Kriminal: tidak bisa'
      : `Peluang kriminal: ${profile.crimeSuccess < 0 ? `${profile.crimeSuccess * 100} poin` : 'standar'}`
    return `${emoji} *${profile.name.toUpperCase()}*\n` +
      `> 💰 Income / EXP / drop: x${profile.income} / x${profile.xp} / x${profile.dropRate}\n` +
      `> ⏱️ Cooldown: x${profile.cooldown} • ⚔️ Damage keluar/diterima: ${formatMultiplier(profile.damageDealt)} / ${formatMultiplier(profile.damageReceived)}\n` +
      `> 💸 Uang hilang saat jadi target: x${profile.crimeLoss} • 🎲 Risiko gagal: x${profile.activityFailure}\n` +
      `> ${crime} • ${modeDescriptions[key]}`
  })
  return `🎚️ *PANDUAN DIFFICULTY RPG*\n\n` +
    `${modes.join('\n\n')}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `💡 *CARA MEMBACA EFEK*\n` +
    `> ↳ Income memengaruhi uang dan jumlah hadiah; EXP dan drop rate memengaruhi progres dan peluang item.\n` +
    `> ↳ Uang hilang berlaku saat kamu menjadi target kriminal. Risiko gagal dan damage berlaku pada aktivitas/combat yang menerapkan modifier tersebut.\n` +
    `> ↳ Easy dan Peaceful tidak mendapat hadiah langka tertentu dari misi Guild/Dungeon. Hanya Peaceful dikecualikan dari leaderboard.\n` +
    `> ↳ Modifier hanya berlaku pada aksi RPG yang terhubung ke sistem difficulty; tidak semua fitur RPG mengubah hasil berdasarkan mode.\n` +
    `> ↳ Akun biasa mendapat 1 perubahan per minggu; Premium 2 perubahan. Kuota semua akun reset setiap Senin (WIB).`
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data?.rpg
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const [action = 'info', rawDifficulty] = String(text || '').trim().split(/\s+/)
  const normalizedAction = action.toLowerCase()
  const current = getDifficulty(user)
  const profile = getDifficultyProfile(user)

  if (['list', 'guide', 'command', 'help'].includes(normalizedAction)) {
    const rows = DIFFICULTY_CHOICES.map(({ key, emoji, description }) => ({
      title: `${key === current ? '✅ ' : ''}${emoji} ${RPG_DIFFICULTIES[key].name}`,
      description,
      id: `${usedPrefix}difficulty set ${key}`
    }))
    const guideText = getGuide()
    const fallbackText = `${guideText}\n\n🎚️ *PILIH MODE*\n` +
      rows.map(row => `> ${row.title} — ${row.description}\n> Ketik: *${row.id}*`).join('\n')
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      text: guideText,
      title: '🎚️ PANDUAN DIFFICULTY',
      subtitle: 'Pahami risikonya, lalu pilih tantanganmu',
      noHeader: true,
      noThumbnail: true,
      footer: 'AVELIA • RPG DIFFICULTY',
      buttonText: '⚔️ PILIH MODE',
      sections: [{ title: 'Pilih tingkat kesulitan', rows }],
      buttons: [[`📊 LIHAT MODE SAAT INI`, `${usedPrefix}difficulty info`]],
      fallbackText,
      sendInteractive: typeof conn.sendInteractive === 'function'
        ? interactiveMessage => conn.sendInteractive(m.chat, interactiveMessage, { quoted: m })
        : undefined
    })
  }

  if (normalizedAction === 'set') {
    const next = normalizeDifficulty(rawDifficulty)
    if (!next) return m.reply(`❌ Pilih difficulty yang valid: ${Object.keys(RPG_DIFFICULTIES).join(', ')}.`)
    if (next === current) return m.reply(`ℹ️ Difficulty kamu sudah *${profile.name}*.`)
    const now = Date.now()
    const premium = isPremiumAccount(data, now)
    const limit = premium ? 2 : DIFFICULTY_CHANGES_PER_WEEK
    const changesRemaining = premium
      ? getPremiumDifficultyChangesRemaining(user, now)
      : getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, now)
    if (changesRemaining < 1) {
      return m.reply(`⏳ Kuota perubahan difficulty minggu ini sudah habis (${limit} kali per minggu). Kuota reset setiap Senin (WIB).`)
    }

    user.difficulty = next
    recordDifficultyChange(user, now)
    await saveDB(wdb)
    const remaining = premium
      ? getPremiumDifficultyChangesRemaining(user, now)
      : getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK, now)
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      text: `✅ Difficulty diubah menjadi *${RPG_DIFFICULTIES[next].name}*.\n` +
        `Sisa perubahan minggu ini: *${remaining}/${limit}* (reset setiap Senin, WIB).`,
      footer: 'AVELIA • RPG DIFFICULTY',
      buttons: [
        ['📊 Lihat difficulty', `${usedPrefix}difficulty info`],
        ['📖 Panduan semua mode', `${usedPrefix}difficulty guide`]
      ],
      reply: fallbackText => m.reply(fallbackText)
    })
  }

  if (!['info', ''].includes(normalizedAction)) {
    return m.reply(`❌ Subcommand tidak dikenal. Gunakan *${usedPrefix}difficulty command*.`)
  }

  const premium = isPremiumAccount(data)
  const weeklyChangeLimit = premium ? 2 : DIFFICULTY_CHANGES_PER_WEEK
  const remaining = premium
    ? getPremiumDifficultyChangesRemaining(user)
    : getDifficultyChangesRemaining(user, DIFFICULTY_CHANGES_PER_WEEK)
  const infoText = `🎚️ *PANDUAN LENGKAP DIFFICULTY RPG*\n` +
    `Difficulty saat ini: *${profile.name.toUpperCase()}*\n\n` +
    `Setiap bagian membandingkan nilai *Normal → tier tersebut*. Pengali x0,5 berarti separuh nilai Normal; x2 berarti dua kali nilai Normal.\n\n` +
    Object.entries(RPG_DIFFICULTIES)
      .map(([key, tier]) => {
        const choice = DIFFICULTY_CHOICES.find(entry => entry.key === key)
        return `╭─ ${choice.emoji} *${tier.name.toUpperCase()}*${key === current ? ' · AKTIF' : ''}\n${getDifficultyComparison(key)}\n╰───────────────`
      })
      .join('\n\n') +
    `\n\n📌 *CARA MEMBACA*\n` +
    `> Pengali cooldown diterapkan pada durasi dasar aktivitas RPG yang mendukungnya; contoh di atas memakai cooldown dasar 2 menit. Daily selalu reset pukul 00.00 WIB dan tidak dipengaruhi difficulty.\n` +
    `> Pengali peluang gagal mengubah peluang gagal dasar, bukan menambah poin persentase. Peluang kriminal memakai perubahan poin persentase yang ditampilkan.\n` +
    `> Modifier hanya berlaku pada aktivitas yang sudah terhubung ke sistem difficulty; bonus Premium dan Evonexus tetap dapat memodifikasi hasil.\n` +
    `> Akun biasa: ${DIFFICULTY_CHANGES_PER_WEEK} perubahan per minggu. Premium: ${weeklyChangeLimit} perubahan. Reset setiap Senin WIB. Sisa kuota: ${remaining}/${weeklyChangeLimit}.`
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    text: infoText,
    title: '🎚️ PROFIL DIFFICULTY',
    subtitle: 'Status dan pengaturan tantangan RPG-mu',
    noHeader: true,
    noThumbnail: true,
    footer: 'AVELIA • RPG DIFFICULTY',
    sections: [{
      title: '🎚️ Pilih mode difficulty',
      rows: DIFFICULTY_CHOICES.map(({ key, emoji, description }) => ({
        title: `${key === current ? '✅ ' : ''}${emoji} ${RPG_DIFFICULTIES[key].name}`,
        description,
        id: `${usedPrefix}difficulty set ${key}`
      }))
    }],
    buttons: [[`📖 LIHAT PANDUAN MODE`, `${usedPrefix}difficulty guide`]],
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.help = ['difficulty <list/set/info/guide/command>']
handler.tags = ['rpg']
handler.command = /^difficulty$/i

export default handler