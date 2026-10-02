import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  getDifficultyCooldownRemaining,
  getDifficulty,
  getDifficultyProfile,
  normalizeDifficulty,
  RPG_DIFFICULTIES
} from '../../lib/rpgDifficulty.js'

function formatDuration(ms) {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  return `${days} hari ${hours} jam`
}

function getGuide(prefix) {
  return `╭─❏「 🎚️ RPG DIFFICULTY 」❏\n` +
    `│ Peaceful: pendapatan & cooldown -70%, damage masuk 50%, tanpa kriminal/top.\n` +
    `│ Easy: pendapatan & cooldown -50%, damage masuk 75%, kriminal lebih mudah.\n` +
    `│ Normal: pendapatan, cooldown, dan damage standar.\n` +
    `│ Hardcore: pendapatan & cooldown +50%, damage masuk 150%, damage keluar 110%.\n` +
    `│ Nightmare: pendapatan & cooldown +70%, damage masuk 200%, damage keluar 125%.\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Multiplier pendapatan berlaku untuk XP dan hadiah uang dari aktivitas RPG.\n` +
    `Ganti mode hanya bisa setiap 7 hari.\n\n` +
    `> ${prefix}difficulty set <peaceful|easy|normal|hardcore|nightmare>`
}

let handler = async (m, { text, usedPrefix }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const [action = 'info', rawDifficulty] = String(text || '').trim().split(/\s+/)
  const normalizedAction = action.toLowerCase()
  const current = getDifficulty(user)
  const profile = getDifficultyProfile(user)

  if (['list', 'guide', 'command', 'help'].includes(normalizedAction)) {
    if (normalizedAction === 'list') {
      return m.reply(`🎚️ *DAFTAR DIFFICULTY*\n${Object.values(RPG_DIFFICULTIES).map(item => `> ${item.name}`).join('\n')}\n\nLihat efek lengkap: *${usedPrefix}difficulty guide*`)
    }
    return m.reply(getGuide(usedPrefix))
  }

  if (normalizedAction === 'set') {
    const next = normalizeDifficulty(rawDifficulty)
    if (!next) return m.reply(`❌ Pilih difficulty yang valid: ${Object.keys(RPG_DIFFICULTIES).join(', ')}.`)
    if (next === current) return m.reply(`ℹ️ Difficulty kamu sudah *${profile.name}*.`)

    const now = Date.now()
    const remaining = getDifficultyCooldownRemaining(user, now)
    if (remaining > 0) {
      return m.reply(`⏳ Kamu baru bisa mengganti difficulty lagi dalam *${formatDuration(remaining)}*.`)
    }

    user.difficulty = next
    user.difficultyChangedAt = now
    await saveDB(wdb)
    return m.reply(`✅ Difficulty diubah menjadi *${RPG_DIFFICULTIES[next].name}*.\nCooldown ganti mode: *7 hari*.`)
  }

  if (!['info', ''].includes(normalizedAction)) {
    return m.reply(`❌ Subcommand tidak dikenal. Gunakan *${usedPrefix}difficulty command*.`)
  }

  const remaining = getDifficultyCooldownRemaining(user)
  const crimeModifier = current === 'peaceful'
    ? 'Nonaktif'
    : profile.crimeSuccess === 0
      ? 'Normal'
      : `${profile.crimeSuccess > 0 ? '+' : ''}${profile.crimeSuccess * 100} poin peluang sukses`
  return m.reply(`🎚️ *DIFFICULTY KAMU: ${profile.name}*\n> Pendapatan: x${profile.income}\n> Cooldown aksi: x${profile.cooldown}\n> Damage keluar: x${profile.damageDealt}\n> Damage diterima: x${profile.damageReceived}\n> Peluang kriminal: ${crimeModifier}\n> Leaderboard: ${profile.leaderboard ? 'Ya' : 'Tidak'}\n> Ganti mode: ${remaining ? `dalam ${formatDuration(remaining)}` : 'tersedia'}`)
}

handler.help = ['difficulty <list/set/info/guide/command>']
handler.tags = ['rpg']
handler.command = /^difficulty$/i

export default handler