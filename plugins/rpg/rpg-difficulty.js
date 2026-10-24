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

function formatDuration(ms) {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return [days && `${days} hari`, hours && `${hours} jam`, minutes && `${minutes} menit`].filter(Boolean).join(' ') || 'kurang dari 1 menit'
}

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
  const crimeModifier = current === 'peaceful'
    ? 'Nonaktif'
    : profile.crimeSuccess === 0
      ? 'Normal'
      : `${profile.crimeSuccess > 0 ? '+' : ''}${profile.crimeSuccess * 100} poin peluang sukses`
  const infoText = `🎚️ *DIFFICULTY SAAT INI: ${profile.name.toUpperCase()}*\n` +
    `Sesuaikan tingkat tantangan RPG dengan gaya bermainmu.\n\n` +
    `> 💰 Income: x${profile.income}\n` +
    `> ✨ EXP: x${profile.xp}\n` +
    `> 💎 Drop rate: x${profile.dropRate}\n` +
    `> ⏱️ Cooldown aksi: x${profile.cooldown}\n` +
    `> ⚔️ Damage keluar: x${profile.damageDealt}\n` +
    `> 🛡️ Damage diterima: x${profile.damageReceived}\n` +
    `> 💸 Uang hilang saat jadi target: x${profile.crimeLoss}\n` +
    `> 🎲 Risiko gagal aktivitas: x${profile.activityFailure}\n` +
    `> ❤️ Regen HP: ${current === 'peaceful' ? '1 HP/menit' : 'Tidak ada'}\n` +
    `> 🩹 Heal setelah mati: ${profile.deathHealCooldown ? formatDuration(profile.deathHealCooldown) : 'Tidak ada cooldown'}\n` +
    `> 🕵️ Peluang kriminal: ${crimeModifier}\n` +
    `> 🎁 Reward langka misi & dungeon: ${canReceiveRareActivityRewards(user) ? 'Tersedia' : 'Tidak tersedia'}\n` +
    `> 🏆 Masuk leaderboard: ${profile.leaderboard ? 'Ya' : 'Tidak'}\n` +
    `> 🔄 Ganti mode: ${remaining}/${weeklyChangeLimit} perubahan tersisa minggu ini (reset Senin)\n\n` +
    `Pelajari efek setiap mode sebelum memilih tantangan baru.`
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