import { sendRpgButtons, sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  canReceiveRareActivityRewards,
  getDifficultyCooldownRemaining,
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

function getGuide() {
  return `🌿 *PEACEFUL*\n` +
    `> ↳ Income, EXP & Drop Rate x0.2\n` +
    `> ↳ Cooldown x0.2, regen 1 HP/menit\n` +
    `> ↳ Tidak mendapat hadiah tertentu dari misi Guild/Dungeon.\n` +
    `> ↳ Damage keluar 150%, masuk 50%\n` +
    `> ↳ Uang hilang saat jadi target 15%\n` +
    `> ↳ Gagal aktivitas x0.15\n` +
    `> ↳ Tidak masuk kriminal atau top.\n\n` +
    `🍃 *EASY*\n` +
    `> ↳ Income, EXP & Drop Rate x0.5\n` +
    `> ↳ Cooldown x0.5\n` +
    `> ↳ Tidak mendapat hadiah tertentu dari misi Guild/Dungeon.\n` +
    `> ↳ Damage keluar 120%, masuk 75%\n` +
    `> ↳ Uang hilang saat jadi target 50%\n` +
    `> ↳ Gagal aktivitas x0.5.\n\n` +
    `⚔️ *NORMAL*\n` +
    `> ↳ Income, EXP, Drop Rate, cooldown, damage, kehilangan uang, dan risiko gagal standar.\n\n` +
    `🔥 *HARDCORE*\n` +
    `> ↳ Income, EXP & Drop Rate x1, cooldown x1.5\n` +
    `> ↳ Damage keluar 50%, masuk 150%\n` +
    `> ↳ Uang hilang saat jadi target 200%\n` +
    `> ↳ Gagal aktivitas x2\n` +
    `> ↳ Cooldown heal 30 menit.\n\n` +
    `💀 *NIGHTMARE*\n` +
    `> ↳ Income, EXP & Drop Rate x1.5, cooldown x2.5\n` +
    `> ↳ Damage keluar 20%, masuk 200%\n` +
    `> ↳ Uang hilang saat jadi target 500%\n` +
    `> ↳ Gagal aktivitas x5\n` +
    `> ↳ Cooldown heal 2 jam.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `💡 *SEBELUM MEMILIH*\n` +
    `> ↳ Income memengaruhi uang dan jumlah hadiah.\n` +
    `> ↳ Drop Rate memengaruhi peluang mendapat item rarity lebih tinggi.\n` +
    `> ↳ Non-Premium dapat mengganti mode setiap 7 hari; Premium mendapat 2 kali perubahan per minggu dan kuota reset setiap Senin.\n\n` +
    `Pilih mode di tombol berikut untuk menerapkannya.`
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
    if (normalizedAction === 'list') {
      return m.reply(`🎚️ *DAFTAR DIFFICULTY*\n${Object.values(RPG_DIFFICULTIES).map(item => `> ${item.name}`).join('\n')}\n\nLihat efek lengkap: *${usedPrefix}difficulty guide*`)
    }
    const difficulties = [
      { key: 'peaceful', emoji: '🌿', description: 'Santai, risiko rendah, tanpa leaderboard' },
      { key: 'easy', emoji: '🍃', description: 'Tantangan ringan dengan hadiah yang lebih kecil' },
      { key: 'normal', emoji: '⚔️', description: 'Pengalaman seimbang dengan aturan standar' },
      { key: 'hardcore', emoji: '🔥', description: 'Tantangan berat dengan risiko dan cooldown lebih tinggi' },
      { key: 'nightmare', emoji: '💀', description: 'Mode ekstrem dengan hadiah dan risiko tertinggi' }
    ]
    const rows = difficulties.map(({ key, emoji, description }) => ({
      title: `${emoji} ${RPG_DIFFICULTIES[key].name}`,
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
      footer: 'AVELIA • RPG DIFFICULTY',
      buttonText: '⚔️ PILIH MODE',
      sections: [{ title: 'Pilih tingkat kesulitan', rows }],
      fallbackText
    })
  }

  if (normalizedAction === 'set') {
    const next = normalizeDifficulty(rawDifficulty)
    if (!next) return m.reply(`❌ Pilih difficulty yang valid: ${Object.keys(RPG_DIFFICULTIES).join(', ')}.`)
    if (next === current) return m.reply(`ℹ️ Difficulty kamu sudah *${profile.name}*.`)

    const now = Date.now()
    const premium = isPremiumAccount(data, now)
    if (premium) {
      const changesRemaining = getPremiumDifficultyChangesRemaining(user, now)
      if (changesRemaining < 1) {
        return m.reply('⏳ Kuota perubahan difficulty Premium minggu ini sudah habis. Kuota akan reset setiap Senin.')
      }
    } else {
      const remaining = getDifficultyCooldownRemaining(user, now)
      if (remaining > 0) {
        return m.reply(`⏳ Kamu baru bisa mengganti difficulty lagi dalam *${formatDuration(remaining)}*.`)
      }
    }

    user.difficulty = next
    recordDifficultyChange(user, now)
    await saveDB(wdb)
    return m.reply(premium
      ? `✅ Difficulty diubah menjadi *${RPG_DIFFICULTIES[next].name}*.\nSisa perubahan minggu ini: *${getPremiumDifficultyChangesRemaining(user, now)}/2* (reset setiap Senin).`
      : `✅ Difficulty diubah menjadi *${RPG_DIFFICULTIES[next].name}*.\nCooldown ganti mode: *7 hari*.`)
  }

  if (!['info', ''].includes(normalizedAction)) {
    return m.reply(`❌ Subcommand tidak dikenal. Gunakan *${usedPrefix}difficulty command*.`)
  }

  const premium = isPremiumAccount(data)
  const remaining = premium
    ? getPremiumDifficultyChangesRemaining(user)
    : getDifficultyCooldownRemaining(user)
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
    `> 🔄 Ganti mode: ${premium
      ? `${remaining}/2 perubahan tersisa minggu ini (reset Senin)`
      : remaining ? `tersedia dalam ${formatDuration(remaining)}` : 'tersedia'}\n\n` +
    `Pelajari efek setiap mode sebelum memilih tantangan baru.`
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    text: infoText,
    title: '🎚️ PROFIL DIFFICULTY',
    subtitle: 'Status dan pengaturan tantangan RPG-mu',
    noHeader: true,
    footer: 'AVELIA • RPG DIFFICULTY',
    buttons: [[`📖 LIHAT PANDUAN MODE`, `${usedPrefix}difficulty guide`]],
    reply: fallbackText => m.reply(fallbackText)
  })
}

handler.help = ['difficulty <list/set/info/guide/command>']
handler.tags = ['rpg']
handler.command = /^difficulty$/i

export default handler