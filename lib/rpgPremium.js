export const PREMIUM_PROTECTION_COOLDOWN = 2 * 60 * 60 * 1000
export const PREMIUM_DAILY_REWARD = 10

export function isPremiumAccount(account, now = Date.now()) {
  return account?.premium === true || Number(account?.premiumTime || 0) > now
}

export function getPremiumProtectionRemaining(account, now = Date.now()) {
  const protectedAt = Number(account?.premiumProtectionAt) || 0
  return Math.max(0, protectedAt + PREMIUM_PROTECTION_COOLDOWN - now)
}

export function tryPremiumProtection(jid, now = Date.now()) {
  const users = global.db?.data?.users
  const resolvedJid = jid?.endsWith('@lid')
    ? global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    : jid
  const normalizedJid = resolvedJid?.includes('@')
    ? resolvedJid.split('@')[0].split(':')[0] + (resolvedJid.includes('@lid') ? '@lid' : '@s.whatsapp.net')
    : resolvedJid
  const account = users?.[normalizedJid] || users?.[jid]
  if (!isPremiumAccount(account, now) || getPremiumProtectionRemaining(account, now) > 0) return false

  account.premiumProtectionAt = now
  return true
}
