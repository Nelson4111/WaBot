import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { ikanEmoji, RPG_FISH_TIERS as fishTiers, RPG_FISH_TIER_BY_NAME as fishTierByName } from '../../lib/rpg-fishCatalog.js'
import { formatRpgNumber } from '../../lib/rpgMoney.js'
import { ensureFishDetails, getAllFishRecords, isTrashFish, migrateAllFishDetails } from '../../lib/rpg-fishSizes.js'

function formatNama(name) {
  return String(name || '')
    .replace(/^ikan[_\s]+/i, '')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getOrderedRecords(user) {
  const records = getAllFishRecords(user)
  const ordered = records.sort((a, b) => {
    const tierA = fishTiers.findIndex(tier => tier.name === (fishTierByName.get(a.name) || 'TRASH'))
    const tierB = fishTiers.findIndex(tier => tier.name === (fishTierByName.get(b.name) || 'TRASH'))
    return tierA - tierB || b.weight - a.weight || a.name.localeCompare(b.name)
  })
  return ordered
}

let handler = async (m, { conn, usedPrefix, text }) => {
  const wdb = loadDB()
  const user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')

  let migrated = false
  if (!wdb.data.fishSizeMigrationV1) {
    migrated = migrateAllFishDetails(wdb)
    wdb.data.fishSizeMigrationV1 = Date.now()
    migrated = true
  } else {
    migrated = ensureFishDetails(user)
  }

  const records = getOrderedRecords(user)
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = String(args[0] || '').toLowerCase()
  if (['favorite', 'fav', 'unfavorite', 'unfav'].includes(action)) {
    const fishNumber = Number(args[1])
    if (!Number.isSafeInteger(fishNumber) || fishNumber < 1 || fishNumber > records.length) {
      if (migrated) await saveDB(wdb)
      return m.reply(`Nomor ikan tidak valid. Buka *${usedPrefix}aquarium* dan pilih nomor yang tampil.`)
    }
    const listedFish = records[fishNumber - 1]
    const fish = (user.fishDetails[listedFish.name] || []).find(record => record.id === listedFish.id)
    if (!fish) {
      if (migrated) await saveDB(wdb)
      return m.reply('Data ikan berubah. Buka aquarium lagi dan ulangi pilihan.')
    }
    const shouldFavorite = ['favorite', 'fav'].includes(action)
    fish.favorite = shouldFavorite
    await saveDB(wdb)
    return m.reply(
      `${shouldFavorite ? '⭐' : '✅'} *${formatNama(fish.name)}* ${shouldFavorite ? 'ditambahkan ke' : 'dikeluarkan dari'} favorit.\n` +
      `> ↳ Ukuran: ${fish.size} · ${fish.weight.toFixed(2)} Kg`
    )
  }
  if (migrated) await saveDB(wdb)

  const trashCount = Object.entries(user.ikan || {})
    .filter(([name]) => isTrashFish(name))
    .reduce((total, [, quantity]) => total + (Number(quantity) || 0), 0)
  const trashItems = Object.entries(user.ikan || {})
    .filter(([name, quantity]) => isTrashFish(name) && Number(quantity) > 0)
    .map(([name, quantity]) => ({ type: 'trash', name, quantity: Number(quantity) }))

  const tierAction = action === 'tier'
  const requestedTier = tierAction ? String(args[1] || '').toUpperCase() : action.toUpperCase()
  const selectedTier = fishTiers.find(tier => tier.name === requestedTier)
  const hasTierFilter = Boolean(selectedTier)
  if ((tierAction || (action && !/^\d+$/.test(action))) && !selectedTier &&
      !['favorite', 'fav', 'unfavorite', 'unfav'].includes(action)) {
    return m.reply(`Tier tidak ditemukan. Gunakan *${usedPrefix}fish list* untuk melihat kategori.`)
  }

  let page = 1
  if (tierAction) {
    page = /^\d+$/.test(args[2] || '') ? Math.max(1, Number(args[2])) : 1
  } else if (hasTierFilter) {
    page = /^\d+$/.test(args[1] || '') ? Math.max(1, Number(args[1])) : 1
  } else {
    page = /^\d+$/.test(args[0] || '') ? Math.max(1, Number(args[0])) : 1
  }

  const filteredRecords = hasTierFilter
    ? records.filter(fish => (fishTierByName.get(fish.name) || 'RARE') === selectedTier.name)
    : records
  const recordNumbers = new Map(records.map((fish, index) => [`${fish.name}\0${fish.id}`, index + 1]))
  const listedRecords = filteredRecords.map(fish => ({
    type: 'fish',
    fish,
    number: recordNumbers.get(`${fish.name}\0${fish.id}`)
  }))
  const entries = hasTierFilter
    ? (selectedTier.name === 'TRASH'
      ? trashItems.map((item, index) => ({ ...item, number: records.length + index + 1 }))
      : listedRecords)
    : [
      ...listedRecords,
      ...trashItems.map((item, index) => ({ ...item, number: records.length + index + 1 }))
    ]
  const pageSize = 25
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  if (page > totalPages) return m.reply(`Halaman tidak tersedia. Aquarium memiliki ${totalPages} halaman.`)

  const totalFish = records.length + trashCount
  const visibleEntries = entries.slice((page - 1) * pageSize, page * pageSize)
  let cap = `╭─❏「 🐠 AQUARIUM 」❏\n`
  cap += `│ 👤 Owner: ${conn.getName(m.sender)}\n`
  cap += `│ 📦 Total: ${formatRpgNumber(totalFish)} ikan\n`
  cap += `│ 🐟 Berukuran: ${formatRpgNumber(records.length)} · 🗑️ Sampah: ${formatRpgNumber(trashCount)}\n`
  if (hasTierFilter) cap += `│ 🔎 Tier: ${selectedTier.name}\n`
  cap += `│ 📄 Halaman: ${page}/${totalPages} · 25 item/halaman\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  if (!entries.length) {
    cap += `Kamu belum punya koleksi ikan.\nKetik *${usedPrefix}mancing* untuk mulai.`
  } else {
    let lastTier
    visibleEntries.forEach(entry => {
      const tier = entry.type === 'trash'
        ? 'TRASH'
        : (fishTierByName.get(entry.fish.name) || 'RARE')
      if (tier !== lastTier) {
        const tierInfo = fishTiers.find(item => item.name === tier)
        cap += `\n${tierInfo?.icon || '🐟'} *${tier}*\n`
        lastTier = tier
      }
      if (entry.type === 'trash') {
        const emoji = ikanEmoji[entry.name] || ikanEmoji[`ikan_${entry.name}`] || '🗑️'
        cap += `> ${entry.number}. ${formatNama(entry.name)} x${formatRpgNumber(entry.quantity)} ${emoji}\n`
      } else {
        const fish = entry.fish
        const emoji = ikanEmoji[fish.name] || ikanEmoji[`ikan_${fish.name}`] || '🐟'
        const marker = fish.favorite ? ' ⭐ Favorit' : ''
        const sizeCode = ({ small: 'S', medium: 'M', big: 'B', giant: 'G' })[fish.size] || 'M'
        cap += `> *${entry.number}. ${sizeCode} ${formatNama(fish.name)} (${fish.weight.toFixed(2)} Kg) ${emoji}${marker}*\n`
      }
    })
    if (!hasTierFilter || selectedTier.name !== 'TRASH') {
      cap += `\n⭐ Favorit: *${usedPrefix}aquarium favorite <nomor>*\n`
      cap += `↩️ Lepas favorit: *${usedPrefix}aquarium unfavorite <nomor>*\n`
      cap += `🔎 Filter tier: *${usedPrefix}aquarium tier <kategori> [halaman]*\n`
    }
    if (totalPages > 1) cap += `📄 Halaman lain: *${usedPrefix}aquarium ${hasTierFilter ? `tier ${selectedTier.name} ` : ''}<nomor halaman>*\n`
    if (!hasTierFilter || selectedTier.name !== 'TRASH') cap += `💡 Ikan favorit tidak dapat dijual sebelum favorit dilepas.`
  }
  return m.reply(cap)
}

handler.help = ['aquarium', 'aq', 'aquarium <halaman>', 'aquarium tier <kategori> [halaman]', 'aquarium favorite <nomor>', 'aquarium unfavorite <nomor>']
handler.tags = ['rpg']
handler.command = /^(aquarium|aq)$/i
handler.group = true
export default handler
