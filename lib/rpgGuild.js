export const GUILD_MEMBER_INACTIVE_MS = 4 * 24 * 60 * 60 * 1000

function getGuildJidAliases(jid, conn) {
  const aliases = new Set()
  const pending = [jid]
  const visited = new Set()

  while (pending.length) {
    const current = pending.pop()
    if (typeof current !== 'string' || !current || visited.has(current)) continue
    visited.add(current)
    aliases.add(current)

    const atIndex = current.lastIndexOf('@')
    if (atIndex > 0) {
      aliases.add(`${current.slice(0, atIndex).split(':')[0]}${current.slice(atIndex)}`)
    } else if (/^\d+$/.test(current)) {
      aliases.add(`${current}@s.whatsapp.net`)
    }

    if (typeof conn?.decodeJid === 'function') {
      const decoded = conn.decodeJid(current)
      if (decoded && !visited.has(decoded)) pending.push(decoded)
    }

    if (current.endsWith('@lid')) {
      const cleanLid = `${current.split(':')[0].split('@')[0]}@lid`
      const resolved = global.lids?.[current] ||
        global.lids?.[cleanLid] ||
        global.db?.data?.lids?.[current] ||
        global.db?.data?.lids?.[cleanLid]
      if (resolved && !visited.has(resolved)) pending.push(resolved)
    }
  }

  return aliases
}

export function findGuildMemberId(guild, jid, conn) {
  if (!Array.isArray(guild?.members)) return null
  const aliases = getGuildJidAliases(jid, conn)
  return guild.members.find(member =>
    [...getGuildJidAliases(member, conn)].some(alias => aliases.has(alias))
  ) || null
}

export function isGuildMember(guild, jid, conn) {
  return findGuildMemberId(guild, jid, conn) !== null
}

export function areGuildJidsSame(first, second, conn) {
  const aliases = getGuildJidAliases(first, conn)
  return [...getGuildJidAliases(second, conn)].some(alias => aliases.has(alias))
}

export function findGuildByMember(guilds, jid, conn) {
  return Object.values(guilds || {}).find(guild => isGuildMember(guild, jid, conn)) || null
}

export function getGuildMemberCap(level = 1) {
  const guildLevel = Math.max(1, Math.floor(Number(level) || 1))
  return 10 + Math.min(10, Math.floor((guildLevel - 1) / 10))
}

export function getGuildLootCaps(level = 1) {
  const guildLevel = Math.max(1, Math.floor(Number(level) || 1))
  const milestones = Math.min(10, Math.floor((guildLevel - 1) / 10))
  return {
    money: 1_000_000 + milestones * 250_000,
    iron: 50 + milestones * 10,
    gold: 50 + milestones * 10,
    stone: 50 + milestones * 10,
    diamond: 50 + milestones * 10,
    gemstone: 50 + milestones * 10
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

export function normalizeGuildPendingLoot(guild, conn) {
  let changed = !guild.pendingLoot || typeof guild.pendingLoot !== 'object' || Array.isArray(guild.pendingLoot)
  const pendingLoot = guild.pendingLoot && typeof guild.pendingLoot === 'object' && !Array.isArray(guild.pendingLoot)
    ? guild.pendingLoot
    : {}
  guild.pendingLoot = pendingLoot
  const normalized = {}
  for (const [jid, storedPending] of Object.entries(pendingLoot)) {
    const pending = storedPending && typeof storedPending === 'object' && !Array.isArray(storedPending)
      ? storedPending
      : {}
    if (pending !== storedPending) changed = true
    const memberId = findGuildMemberId(guild, jid, conn) || jid
    if (memberId !== jid || normalized[memberId]) changed = true
    if (Object.hasOwn(pending, 'emerald')) changed = true
    pending.gemstone = (Number(pending.gemstone) || 0) + (Number(pending.emerald) || 0)
    delete pending.emerald
    if (!normalized[memberId]) normalized[memberId] = pending
    else {
      for (const [item, amount] of Object.entries(pending)) {
        normalized[memberId][item] = (Number(normalized[memberId][item]) || 0) + (Number(amount) || 0)
      }
    }
  }
  guild.pendingLoot = normalized
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
  const oldMembers = getGuildMemberCap(oldLevel)
  const newMembers = getGuildMemberCap(guild.level)
  const benefitLines = []
  if (newMembers > oldMembers) {
    benefitLines.push(`> 👥 Kapasitas anggota: ${oldMembers} → ${newMembers}`)
  }
  if (newCaps.money > oldCaps.money) {
    benefitLines.push(`> 💰 Batas loot Money: Rp ${oldCaps.money.toLocaleString('id-ID')} → Rp ${newCaps.money.toLocaleString('id-ID')}`)
  }
  if (newCaps.iron > oldCaps.iron) {
    benefitLines.push(`> 📦 Batas tiap loot lain: ${oldCaps.iron} → ${newCaps.iron}`)
  }
  const leader = guild.leader
  const mention = leader ? `@${leader.split('@')[0]}` : 'Leader'
  const notification =
    `╭─❏「 🎊 GUILD LEVEL UP 」❏\n` +
    `│ 🏰 *Guild:* ${guild.name}\n` +
    `│ 🌟 *Level:* Lv.${oldLevel} → Lv.${guild.level}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `👑 *Leader:* ${mention}\n\n` +
    `${benefitLines.length ? `🎁 *BENEFIT BERTAMBAH*\n${benefitLines.join('\n')}\n` : ''}` +
    `╰─━━━━━━━━━━━━━━─`
  conn.reply(message.chat, notification, message, { mentions: leader ? [leader] : [] })
  return true
}
