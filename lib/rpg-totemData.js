export const RPG_TOTEMS = Object.freeze([
  // ═══════════════════ FISHING ═══════════════════
  { id: 'tide', name: 'Tide Totem', activity: 'fishing', price: 2500000, emoji: '🌊', effect: 'Hasil tangkapan +10% dan peluang ikan langka +5%.', buffs: { yield: 1.1, rareChance: 1.05 } },
  { id: 'deep-sea', name: 'Deep Sea Totem', activity: 'fishing', price: 7500000, emoji: '🐋', effect: 'Hasil tangkapan +12% dan peluang ikan langka +3%.', buffs: { yield: 1.12, rareChance: 1.03 } },
  { id: 'pearl', name: 'Pearl Totem', activity: 'fishing', price: 15000000, emoji: '🫧', effect: 'Peluang ikan langka +12%.', buffs: { rareChance: 1.12 } },
  { id: 'storm', name: 'Storm Totem', activity: 'fishing', price: 30000000, emoji: '⛈️', effect: 'Pendapatan fishing +15%.', buffs: { income: 1.15 } },
  { id: 'coral', name: 'Coral Totem', activity: 'fishing', price: 60000000, emoji: '🪸', effect: 'EXP fishing +15%.', buffs: { xp: 1.15 } },
  { id: 'moonlight', name: 'Moonlight Totem', activity: 'fishing', price: 125000000, emoji: '🌙', effect: 'Peluang ikan langka +15% dan cooldown fishing 5% lebih cepat.', buffs: { rareChance: 1.15, cooldown: 0.95 } },
  { id: 'angler', name: 'Angler Totem', activity: 'fishing', price: 250000000, emoji: '🎣', effect: 'Hasil tangkapan +20% dan pendapatan fishing +10%.', buffs: { yield: 1.2, income: 1.1 } },

  // ═══════════════════ MINING ═══════════════════
  { id: 'earth', name: 'Earth Totem', activity: 'mining', price: 3000000, emoji: '⛏️', effect: 'Hasil mining +15%.', buffs: { yield: 1.15 } },
  { id: 'iron', name: 'Iron Totem', activity: 'mining', price: 8000000, emoji: '🪨', effect: 'Hasil mining +12%.', buffs: { yield: 1.12 } },
  { id: 'crystal', name: 'Crystal Totem', activity: 'mining', price: 18000000, emoji: '💎', effect: 'Peluang mendapatkan drop langka dari mining +10%.', buffs: { rareChance: 1.1 } },
  { id: 'lava', name: 'Lava Totem', activity: 'mining', price: 35000000, emoji: '🌋', effect: 'Pendapatan mining +15%.', buffs: { income: 1.15 } },
  { id: 'deep-cave', name: 'Deep Cave Totem', activity: 'mining', price: 70000000, emoji: '🕳️', effect: 'EXP mining +15%.', buffs: { xp: 1.15 } },
  { id: 'geode', name: 'Geode Totem', activity: 'mining', price: 150000000, emoji: '🔮', effect: 'Peluang drop langka mining +15% dan hasil mining +5%.', buffs: { rareChance: 1.15, yield: 1.05 } },
  { id: 'excavator', name: 'Excavator Totem', activity: 'mining', price: 300000000, emoji: '🚜', effect: 'Hasil mining +20% dan pendapatan mining +10%.', buffs: { yield: 1.2, income: 1.1 } },

  // ═══════════════════ ADVENTURE ═══════════════════
  { id: 'explorer', name: 'Explorer Totem', activity: 'adventure', price: 4000000, emoji: '🧭', effect: 'Peluang drop adventure +10%.', buffs: { dropRate: 1.1 } },
  { id: 'wilderness', name: 'Wilderness Totem', activity: 'adventure', price: 10000000, emoji: '🏕️', effect: 'Peluang drop adventure +12%.', buffs: { dropRate: 1.12 } },
  { id: 'relic', name: 'Relic Totem', activity: 'adventure', price: 22000000, emoji: '🏺', effect: 'Peluang mendapatkan hadiah langka adventure +10%.', buffs: { rareChance: 1.1 } },
  { id: 'courage', name: 'Courage Totem', activity: 'adventure', price: 45000000, emoji: '🦁', effect: 'EXP adventure +15%.', buffs: { xp: 1.15 } },
  { id: 'trail', name: 'Trail Totem', activity: 'adventure', price: 90000000, emoji: '🥾', effect: 'Cooldown adventure 10% lebih cepat.', buffs: { cooldown: 0.9 } },
  { id: 'summit', name: 'Summit Totem', activity: 'adventure', price: 180000000, emoji: '🏆', effect: 'Peluang drop adventure +15% dan pendapatan +5%.', buffs: { dropRate: 1.15, income: 1.05 } },
  { id: 'survivor', name: 'Survivor Totem', activity: 'adventure', price: 350000000, emoji: '🧗', effect: 'Peluang drop adventure +20% dan EXP +10%.', buffs: { dropRate: 1.2, xp: 1.1 } },

  // ═══════════════════ EXPLORE ═══════════════════
  { id: 'starlight', name: 'Starlight Totem', activity: 'explore', price: 5000000, emoji: '🌌', effect: 'Peluang item langka explore +10%.', buffs: { rareChance: 1.1 } },
  { id: 'compass', name: 'Compass Totem', activity: 'explore', price: 12000000, emoji: '🧭', effect: 'Peluang item langka explore +12%.', buffs: { rareChance: 1.12 } },
  { id: 'nebula', name: 'Nebula Totem', activity: 'explore', price: 25000000, emoji: '🌠', effect: 'Peluang drop explore +12%.', buffs: { dropRate: 1.12 } },
  { id: 'void', name: 'Void Totem', activity: 'explore', price: 50000000, emoji: '🌀', effect: 'Cooldown explore 10% lebih cepat.', buffs: { cooldown: 0.9 } },
  { id: 'stardust', name: 'Stardust Totem', activity: 'explore', price: 100000000, emoji: '✨', effect: 'EXP explore +15%.', buffs: { xp: 1.15 } },
  { id: 'comet', name: 'Comet Totem', activity: 'explore', price: 200000000, emoji: '☄️', effect: 'Peluang item langka explore +15% dan peluang drop +5%.', buffs: { rareChance: 1.15, dropRate: 1.05 } },
  { id: 'satellite', name: 'Satellite Totem', activity: 'explore', price: 400000000, emoji: '🛰️', effect: 'Peluang item langka explore +20% dan EXP +10%.', buffs: { rareChance: 1.2, xp: 1.1 } },

  // ═══════════════════ FARMING ═══════════════════
  { id: 'fertile-soil', name: 'Fertile Soil Totem', activity: 'farming', price: 3000000, emoji: '🌱', effect: 'Hasil panen +15%.', buffs: { yield: 1.15 } },
  { id: 'blossom', name: 'Blossom Totem', activity: 'farming', price: 8000000, emoji: '🌷', effect: 'Hasil panen +12%.', buffs: { yield: 1.12 } },
  { id: 'golden-harvest', name: 'Golden Harvest Totem', activity: 'farming', price: 18000000, emoji: '🌾', effect: 'Pendapatan farming +15%.', buffs: { income: 1.15 } },
  { id: 'rain', name: 'Rain Totem', activity: 'farming', price: 35000000, emoji: '🌧️', effect: 'Cooldown farming 10% lebih cepat.', buffs: { cooldown: 0.9 } },
  { id: 'leaf', name: 'Leaf Totem', activity: 'farming', price: 70000000, emoji: '🍃', effect: 'EXP farming +15%.', buffs: { xp: 1.15 } },
  { id: 'flower', name: 'Flower Totem', activity: 'farming', price: 150000000, emoji: '🌺', effect: 'Hasil panen +15% dan peluang tanaman langka +5%.', buffs: { yield: 1.15, rareChance: 1.05 } },
  { id: 'greenhouse', name: 'Greenhouse Totem', activity: 'farming', price: 300000000, emoji: '🏡', effect: 'Hasil panen +20% dan pendapatan farming +10%.', buffs: { yield: 1.2, income: 1.1 } },

  // ═══════════════════ LIVESTOCK ═══════════════════
  { id: 'herd-keeper', name: 'Herd Keeper Totem', activity: 'livestock', price: 3500000, emoji: '🐄', effect: 'Hasil kegiatan ternak +10%.', buffs: { yield: 1.1 } },
  { id: 'hoof', name: 'Hoof Totem', activity: 'livestock', price: 9000000, emoji: '🐎', effect: 'Hasil ternak +12%.', buffs: { yield: 1.12 } },
  { id: 'pasture', name: 'Pasture Totem', activity: 'livestock', price: 20000000, emoji: '🐑', effect: 'Pendapatan ternak +15%.', buffs: { income: 1.15 } },
  { id: 'pack', name: 'Pack Totem', activity: 'livestock', price: 40000000, emoji: '🐺', effect: 'EXP ternak +15%.', buffs: { xp: 1.15 } },
  { id: 'plenty', name: 'Plenty Totem', activity: 'livestock', price: 80000000, emoji: '🐂', effect: 'Hasil ternak +15%.', buffs: { yield: 1.15 } },
  { id: 'paw', name: 'Paw Totem', activity: 'livestock', price: 160000000, emoji: '🐾', effect: 'Hasil ternak +10% dan peluang produk langka +10%.', buffs: { yield: 1.1, rareChance: 1.1 } },
  { id: 'ranch', name: 'Ranch Totem', activity: 'livestock', price: 350000000, emoji: '🏡', effect: 'Hasil ternak +20% dan pendapatan ternak +10%.', buffs: { yield: 1.2, income: 1.1 } },

  // ═══════════════════ CASINO ═══════════════════
  { id: 'casino-luck', name: 'Casino Luck Totem', activity: 'casino', price: 50000000, emoji: '🎰', effect: 'Pendapatan dari kemenangan casino +10%.', buffs: { income: 1.1 } },
  { id: 'casino-gold', name: 'Casino Gold Totem', activity: 'casino', price: 250000000, emoji: '🪙', effect: 'Pendapatan dari kemenangan casino +15%.', buffs: { income: 1.15 } },
  { id: 'casino-jackpot', name: 'Casino Jackpot Totem', activity: 'casino', price: 1000000000, emoji: '🎲', effect: 'Pendapatan dari kemenangan casino +20%.', buffs: { income: 1.2 } },
  { id: 'casino-fortune', name: 'Casino Fortune Totem', activity: 'casino', price: 5000000000, emoji: '🍀', effect: 'Pendapatan dari kemenangan casino +25%.', buffs: { income: 1.25 } },
  { id: 'casino-royal', name: 'Casino Royal Totem', activity: 'casino', price: 25000000000, emoji: '👑', effect: 'Pendapatan dari kemenangan casino +30%.', buffs: { income: 1.3 } },
  { id: 'casino-vip', name: 'Casino VIP Totem', activity: 'casino', price: 100000000000, emoji: '💎', effect: 'Pendapatan dari kemenangan casino +35%.', buffs: { income: 1.35 } },
  { id: 'casino-elite', name: 'Casino Elite Totem', activity: 'casino', price: 500000000000, emoji: '🏆', effect: 'Pendapatan dari kemenangan casino +40%.', buffs: { income: 1.4 } },

  // ═══════════════════ ALL ACTIVITIES ═══════════════════
  { id: 'energy', name: 'Energy Totem', activity: 'all', price: 20000000, emoji: '⚡', effect: 'Cooldown semua aktivitas 5% lebih cepat.', buffs: { cooldown: 0.95 } },
  { id: 'luck', name: 'Luck Totem', activity: 'all', price: 50000000, emoji: '🍀', effect: 'Peluang mendapatkan hasil langka dari semua aktivitas +3%.', buffs: { rareChance: 1.03 } },
  { id: 'knowledge', name: 'Knowledge Totem', activity: 'all', price: 100000000, emoji: '📜', effect: 'EXP semua aktivitas +10%.', buffs: { xp: 1.1 } },
  { id: 'wealth', name: 'Wealth Totem', activity: 'all', price: 250000000, emoji: '💰', effect: 'Pendapatan semua aktivitas +10%.', buffs: { income: 1.1 } },
  { id: 'gold', name: 'Gold Totem', activity: 'all', price: 500000000, emoji: '🪙', effect: 'Pendapatan semua aktivitas +12%.', buffs: { income: 1.12 } },
  { id: 'flame', name: 'Flame Totem', activity: 'all', price: 1000000000, emoji: '🔥', effect: 'EXP semua aktivitas +12%.', buffs: { xp: 1.12 } },
  { id: 'wind', name: 'Wind Totem', activity: 'all', price: 2000000000, emoji: '💨', effect: 'Cooldown semua aktivitas 8% lebih cepat.', buffs: { cooldown: 0.92 } },
  { id: 'guardian', name: 'Guardian Totem', activity: 'all', price: 5000000000, emoji: '⭐', effect: 'Peluang hadiah langka dari semua aktivitas +5%.', buffs: { rareChance: 1.05 } },
  { id: 'rainbow', name: 'Rainbow Totem', activity: 'all', price: 10000000000, emoji: '🌈', effect: 'Hasil semua aktivitas +8%.', buffs: { yield: 1.08 } },
  { id: 'dragon', name: 'Dragon Totem', activity: 'all', price: 25000000000, emoji: '🐉', effect: 'Pendapatan semua aktivitas +15% dan EXP +5%.', buffs: { income: 1.15, xp: 1.05 } },
  { id: 'phoenix', name: 'Phoenix Totem', activity: 'all', price: 50000000000, emoji: '🦅', effect: 'Hasil semua aktivitas +10% dan cooldown 5% lebih cepat.', buffs: { yield: 1.1, cooldown: 0.95 } },
  { id: 'world-tree', name: 'World Tree Totem', activity: 'all', price: 100000000000, emoji: '🌳', effect: 'EXP semua aktivitas +15% dan peluang hadiah langka +5%.', buffs: { xp: 1.15, rareChance: 1.05 } },
  { id: 'ancient', name: 'Ancient Totem', activity: 'all', price: 250000000000, emoji: '🔱', effect: 'Hasil semua aktivitas +12% dan pendapatan +10%.', buffs: { yield: 1.12, income: 1.1 } },
  { id: 'royal', name: 'Royal Totem', activity: 'all', price: 1000000000000, emoji: '👑', effect: 'Pendapatan semua aktivitas +15%, EXP +10%, dan peluang hadiah langka +5%.', buffs: { income: 1.15, xp: 1.1, rareChance: 1.05 } },

  // ═══════════════════ CURSE ═══════════════════
  { id: 'curse-of-greed', name: 'Greed Curse Totem', activity: 'all', price: 1000000, emoji: '🪙', effect: 'Pendapatan semua aktivitas -10%.', buffs: { income: 0.9 } },
  { id: 'curse-of-wither', name: 'Wither Curse Totem', activity: 'all', price: 2500000, emoji: '🥀', effect: 'Hasil semua aktivitas -10%.', buffs: { yield: 0.9 } },
  { id: 'curse-of-forgetting', name: 'Forgetfulness Curse Totem', activity: 'all', price: 5000000, emoji: '📉', effect: 'EXP semua aktivitas -10%.', buffs: { xp: 0.9 } },
  { id: 'curse-of-misfortune', name: 'Misfortune Curse Totem', activity: 'all', price: 10000000, emoji: '🌑', effect: 'Peluang hasil langka semua aktivitas -10%.', buffs: { rareChance: 0.9 } },
  { id: 'curse-of-sloth', name: 'Sloth Curse Totem', activity: 'all', price: 25000000, emoji: '🐌', effect: 'Cooldown semua aktivitas 10% lebih lama.', buffs: { cooldown: 1.1 } }
])

export const RPG_TOTEM_DURATION = 60 * 60 * 1000

export const RPG_TOTEM_ACTIVITIES = Object.freeze([
  { id: 'fishing', name: 'Fishing' },
  { id: 'mining', name: 'Mining' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'explore', name: 'Explore' },
  { id: 'farming', name: 'Farming' },
  { id: 'livestock', name: 'Livestock' },
  { id: 'casino', name: 'Casino' },
  { id: 'all', name: 'All' }
])

export function findRpgTotem(input) {
  const key = String(input || '').trim().toLocaleLowerCase('id-ID')
  if (!key) return null
  return RPG_TOTEMS.find(totem =>
    totem.id === key ||
    totem.name.toLocaleLowerCase('id-ID') === key
  ) || null
}

export function getActiveGroupTotem(data, groupId) {
  const active = data?.groupTotems?.[groupId]
  if (!active) return null
  const expiresAt = Number(active.expiresAt) ||
    (Number(active.activatedAt) ? Number(active.activatedAt) + RPG_TOTEM_DURATION : 0)
  return expiresAt > Date.now() ? findRpgTotem(active.id) : null
}

export function getActiveGroupTotemExpiry(data, groupId) {
  const active = data?.groupTotems?.[groupId]
  if (!getActiveGroupTotem(data, groupId)) return 0
  return Number(active.expiresAt) ||
    (Number(active.activatedAt) ? Number(active.activatedAt) + RPG_TOTEM_DURATION : 0)
}

export function getGroupTotemBuff(data, groupId, activity, stat) {
  const active = getActiveGroupTotem(data, groupId)
  if (!active || (active.activity !== 'all' && active.activity !== activity)) return 1
  return Number(active.buffs?.[stat]) || 1
}

export function applyGroupTotemBuff(data, groupId, activity, stat, value) {
  return Math.floor((Number(value) || 0) * getGroupTotemBuff(data, groupId, activity, stat))
}
