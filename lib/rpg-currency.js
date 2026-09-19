export function migrateRpgCurrencies(user) {
  user.inventory = user.inventory || {}
  user.guildLoot = user.guildLoot || {}
  let changed = false

  const dungeonGold = Number(user.dungeonGold) || 0
  if (dungeonGold > 0) {
    user.inventory.coin = (Number(user.inventory.coin) || 0) + dungeonGold
    user.dungeonGold = 0
    changed = true
  }

  // Legacy guild missions wrote the same reward to both fields; prefer the source-specific field.
  const legacyGuildEmerald = Number(user.guildLoot.emerald) || 0
  const legacyEmerald = legacyGuildEmerald > 0 ? legacyGuildEmerald : (Number(user.emerald) || 0)
  if (legacyEmerald > 0) {
    user.inventory.gemstone = (Number(user.inventory.gemstone) || 0) + legacyEmerald
    user.emerald = 0
    user.guildLoot.emerald = 0
    changed = true
  }

  user.diamond = Number(user.diamond) || 0
  user.limit = Number(user.limit) || 0
  return changed
}
