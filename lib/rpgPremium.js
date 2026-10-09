export const PREMIUM_PROTECTION_COOLDOWN = 5 * 60 * 60 * 1000
export const PREMIUM_PROTECTION_ACTIONS = [
  { id: 'copet', label: 'Copet' },
  { id: 'rampok', label: 'Rampok' },
  { id: 'begal', label: 'Begal' },
  { id: 'jarah', label: 'Jarah' },
  { id: 'culik', label: 'Culik' },
  { id: 'bunuh', label: 'Bunuh' },
  { id: 'fitnah', label: 'Fitnah' },
  { id: 'death', label: 'Kematian' }
]
export const PREMIUM_DAILY_REWARD = 50
export const PREMIUM_DAILY_MIN_DONATION = 10000

export const DONATION_TITLE_TIERS = [
  { minimum: 0, title: 'Pendukung Baru' },
  { minimum: 1000, title: 'Orang Baik' },
  { minimum: 2000, title: 'Kenalan Avelia' },
  { minimum: 5000, title: 'Donatur Baru' },
  { minimum: PREMIUM_DAILY_MIN_DONATION, title: 'Donatur Setia' },
  { minimum: 20000, title: 'Teman Avelia' },
  { minimum: 40000, title: 'Pendukung Avelia' },
  { minimum: 50000, title: 'Sahabat Avelia' },
  { minimum: 70000, title: 'Sahabat Istimewa' },
  { minimum: 90000, title: 'Gebetan Avelia' },
  { minimum: 100000, title: 'Donatur Avelia' },
  { minimum: 150000, title: 'Pendukung Setia' },
  { minimum: 200000, title: 'Pelindung Avelia' },
  { minimum: 250000, title: 'Pendukung VIP' },
  { minimum: 300000, title: 'Donatur Favorit' },
  { minimum: 350000, title: 'Sang Filantropis' },
  { minimum: 400000, title: 'Pilar Komunitas' },
  { minimum: 450000, title: 'Bintang Kedermawanan' },
  { minimum: 500000, title: 'Donatur Utama' },
  { minimum: 550000, title: 'Donatur VIP' },
  { minimum: 600000, title: 'Legenda Kebaikan' },
  { minimum: 650000, title: 'Dermawan Muda' },
  { minimum: 700000, title: 'Donatur Istimewa' },
  { minimum: 750000, title: 'Pahlawan Komunitas' },
  { minimum: 800000, title: 'Pendukung Favorit' },
  { minimum: 850000, title: 'Pendukung Istimewa' },
  { minimum: 900000, title: 'Kekasih Avelia' },
  { minimum: 950000, title: 'Kesayangan Komunitas' },
  { minimum: 1000000, title: 'Donatur Abadi' }
]

export function getDonationTitle(amount) {
  const total = Number(amount) || 0
  const tier = DONATION_TITLE_TIERS.filter(({ minimum }) => total >= minimum).at(-1)
  return tier.title
}

export function isPremiumAccount(account, now = Date.now()) {
  const premiumTime = Number(account?.premiumTime) || 0
  return premiumTime > 0 ? premiumTime > now : account?.premium === true
}

export function getPremiumProtectionRemaining(account, action, now = Date.now()) {
  if (!PREMIUM_PROTECTION_ACTIONS.some(({ id }) => id === action)) {
    throw new Error(`Unknown Premium Protection action: ${action}`)
  }
  const cooldowns = account?.premiumProtectionCooldowns
  const protectedAt = Number(
    cooldowns && typeof cooldowns === 'object'
      ? cooldowns[action] ?? (action === 'death' ? cooldowns.dungeon : undefined)
      : account?.premiumProtectionAt
  ) || 0
  return Math.max(0, protectedAt + PREMIUM_PROTECTION_COOLDOWN - now)
}

export function tryPremiumProtection(jid, action, now = Date.now(), opponentJid = null) {
  const users = global.db?.data?.users
  if (!PREMIUM_PROTECTION_ACTIONS.some(({ id }) => id === action)) {
    throw new Error(`Unknown Premium Protection action: ${action}`)
  }
  const resolvedJid = jid?.endsWith('@lid')
    ? global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    : jid
  const normalizedJid = resolvedJid?.includes('@')
    ? resolvedJid.split('@')[0].split(':')[0] + (resolvedJid.includes('@lid') ? '@lid' : '@s.whatsapp.net')
    : resolvedJid
  const account = users?.[normalizedJid] || users?.[jid]
  if (!isPremiumAccount(account, now) || getPremiumProtectionRemaining(account, action, now) > 0) return false
  if (opponentJid) {
    const resolvedOpponent = opponentJid?.endsWith('@lid')
      ? global.lids?.[opponentJid] || global.db?.data?.lids?.[opponentJid] || opponentJid
      : opponentJid
    const normalizedOpponent = resolvedOpponent?.includes('@')
      ? resolvedOpponent.split('@')[0].split(':')[0] + (resolvedOpponent.includes('@lid') ? '@lid' : '@s.whatsapp.net')
      : resolvedOpponent
    const opponent = users?.[normalizedOpponent] || users?.[opponentJid]
    if (isPremiumAccount(opponent, now) && Math.random() < 0.5) return false
  }

  if (!account.premiumProtectionCooldowns || typeof account.premiumProtectionCooldowns !== 'object') {
    account.premiumProtectionCooldowns = {}
  }
  account.premiumProtectionCooldowns[action] = now
  return true
}
