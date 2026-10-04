export const GUILD_MEMBER_INACTIVE_MS = 4 * 24 * 60 * 60 * 1000

export function getGuildLootCaps(level = 1) {
  const guildLevel = Math.max(1, Math.floor(Number(level) || 1))
  return {
    money: 1_000_000 * guildLevel,
    iron: 50 * guildLevel,
    gold: 50 * guildLevel,
    stone: 50 * guildLevel,
    diamond: 50 * guildLevel,
    gemstone: 50 * guildLevel
  }
}

export function normalizeGuildLoot(user) {
  user.guildLoot = user.guildLoot || {}
  user.guildLoot.gemstone = (Number(user.guildLoot.gemstone) || 0) + (Number(user.guildLoot.emerald) || 0)
  delete user.guildLoot.emerald
  for (const item of Object.keys(getGuildLootCaps())) {
    user.guildLoot[item] = Math.max(0, Number(user.guildLoot[item]) || 0)
  }
  return user.guildLoot
}

export function normalizeGuildPendingLoot(guild) {
  guild.pendingLoot = guild.pendingLoot || {}
  let changed = false
  for (const pending of Object.values(guild.pendingLoot)) {
    if (Object.hasOwn(pending, 'emerald')) changed = true
    pending.gemstone = (Number(pending.gemstone) || 0) + (Number(pending.emerald) || 0)
    delete pending.emerald
  }
  return changed
}

export function getGuildLootPending(guild, jid, item) {
  const pending = guild.pendingLoot?.[jid] || {}
  const legacyGemstone = item === 'gemstone' ? Number(pending.emerald) || 0 : 0
  return Math.max(0, (Number(pending[item]) || 0) + legacyGemstone)
}

export function addGuildLootReward(guild, user, jid, item, amount, { pending = false } = {}) {
  const caps = getGuildLootCaps(guild.level)
  const loot = normalizeGuildLoot(user)
  const pendingAmount = pending ? getGuildLootPending(guild, jid, item) : 0
  const available = Math.max(0, caps[item] - loot[item] - pendingAmount)
  return Math.min(Math.max(0, Math.floor(Number(amount) || 0)), available)
}

export function advanceGuildLevel(guild, conn, message) {
  guild.level = Math.max(1, Math.floor(Number(guild.level) || 1))
  guild.exp = Math.max(0, Number(guild.exp) || 0)

  const oldLevel = guild.level
  while (guild.exp >= guild.level * 1000) {
    guild.exp -= guild.level * 1000
    guild.level += 1
  }
  if (guild.level === oldLevel) return false

  const oldCaps = getGuildLootCaps(oldLevel)
  const newCaps = getGuildLootCaps(guild.level)
  const oldMembers = 10 + (oldLevel - 1) * 2
  const newMembers = 10 + (guild.level - 1) * 2
  const leader = guild.leader
  const mention = leader ? `@${leader.split('@')[0]}` : 'Leader'
  const notification =
    `╭─❏「 🎊 GUILD LEVEL UP 」❏\n` +
    `│ 🏰 *Guild:* ${guild.name}\n` +
    `│ 🌟 *Level:* Lv.${oldLevel} → Lv.${guild.level}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `👑 *Leader:* ${mention}\n\n` +
    `🎁 *BENEFIT SEBELUM → SESUDAH*\n` +
    `> 👥 Kapasitas anggota: ${oldMembers} → ${newMembers}\n` +
    `> 💰 Batas loot Money: Rp ${oldCaps.money.toLocaleString('id-ID')} → Rp ${newCaps.money.toLocaleString('id-ID')}\n` +
    `> 📦 Batas tiap loot lain: ${oldCaps.iron} → ${newCaps.iron}\n` +
    `╰─━━━━━━━━━━━━━━─`
  conn.reply(message.chat, notification, message, { mentions: leader ? [leader] : [] })
  return true
}
