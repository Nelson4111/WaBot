import { loadDB, saveDB, getUserRPG, getEquipmentName } from '../../lib/waifuHelper.js'
import { MALL_CATEGORIES } from '../../lib/rpgMallData.js'
import {
  CHARACTER_DEFAULT_OUTFIT,
  CHARACTER_OUTFIT_SLOTS,
  MALL_FASHION_SLOTS,
  getDefaultArmorOutfit
} from '../../lib/rpgCharacterData.js'

const fashion = MALL_CATEGORIES.fashion.items
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
const formatItem = item => item ? `${item.emoji} ${item.name}` : '-'

function findFashion(query) {
  const key = normalize(query)
  if (!key) return null
  return fashion.find(item => normalize(item.id) === key || normalize(item.name) === key)
    || fashion.find(item => normalize(item.name).includes(key))
}

let handler = async (m, { text = '', usedPrefix = '.' }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('Kamu belum memiliki data RPG. Mulailah dengan .adventure.')
  const rpg = account.rpg
  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}
  if (!rpg.character || typeof rpg.character !== 'object') rpg.character = {}

  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const outfit = rpg.character.outfit || (rpg.character.outfit = {})
  const accessories = Array.isArray(outfit.accessories) ? outfit.accessories : (outfit.accessories = [])
  const prefix = usedPrefix || '.'
  const armorLevel = Number(rpg.armor) || 0
  const defaultOutfit = getDefaultArmorOutfit(armorLevel, getEquipmentName('armor', armorLevel))
  const currentOutfit = { ...defaultOutfit, ...outfit, accessories }
  const owned = fashion.filter(item => Number(rpg.mallInventory[item.id]) > 0)

  if (mode === 'pakai' || mode === 'equip' || mode === 'wear') {
    const item = findFashion(tokens.slice(1).join(' '))
    if (!item) return m.reply(`Barang fashion tidak ditemukan. Lihat ${prefix}mall fashion list.`)
    if ((Number(rpg.mallInventory[item.id]) || 0) < 1) return m.reply(`Kamu belum memiliki ${item.name}. Beli dahulu melalui ${prefix}mall fashion beli ${item.id}.`)
    const slot = MALL_FASHION_SLOTS[item.id]
    if (!slot) return m.reply(`Slot untuk ${item.name} belum tersedia.`)
    if (slot === 'accessories') {
      if (accessories.includes(item.id)) return m.reply(`${item.name} sudah dipakai.`)
      if (accessories.length >= 4) return m.reply('Slot aksesori sudah penuh (maksimal 4). Lepas aksesori terlebih dahulu.')
      accessories.push(item.id)
    } else {
      currentOutfit[slot] = item.id
      outfit[slot] = item.id
    }
    await saveDB(db)
    return m.reply(`✅ ${formatItem(item)} dipakai di slot ${CHARACTER_OUTFIT_SLOTS.find(value => value.id === slot).label}.`)
  }

  if (mode === 'lepas' || mode === 'remove' || mode === 'unequip') {
    const target = tokens.slice(1).join(' ')
    if (!target) return m.reply(`Contoh: ${prefix}wardrobe lepas kepala atau ${prefix}wardrobe lepas <nama item>.`)
    const slot = CHARACTER_OUTFIT_SLOTS.find(value => value.aliases.includes(normalize(target)))
    if (slot?.id === 'accessories') {
      if (!accessories.length) return m.reply('Tidak ada aksesori yang sedang dipakai.')
      outfit.accessories = []
      await saveDB(db)
      return m.reply('Semua aksesori dilepas.')
    }
    if (slot) {
      if (!MALL_FASHION_SLOTS[currentOutfit[slot.id]]) return m.reply(`Slot ${slot.label} sedang memakai outfit bawaan, bukan fashion Mall.`)
      delete outfit[slot.id]
      await saveDB(db)
      return m.reply(`Slot ${slot.label} dilepas dan kembali mengikuti armor saat ini.`)
    }

    const accessoryIndex = /^aksesori(?:s)?\s+([1-4])$/i.exec(target)
    if (accessoryIndex) {
      const index = Number(accessoryIndex[1]) - 1
      if (!accessories[index]) return m.reply(`Aksesori nomor ${index + 1} tidak ditemukan.`)
      const [removed] = accessories.splice(index, 1)
      await saveDB(db)
      return m.reply(`${formatItem(findFashion(removed))} dilepas.`)
    }

    const item = findFashion(target)
    if (!item) return m.reply('Slot atau fashion tidak ditemukan.')
    if (MALL_FASHION_SLOTS[item.id] === 'accessories') {
      const index = accessories.indexOf(item.id)
      if (index < 0) return m.reply(`${item.name} tidak sedang dipakai.`)
      accessories.splice(index, 1)
    } else if (currentOutfit[MALL_FASHION_SLOTS[item.id]] === item.id) {
      delete outfit[MALL_FASHION_SLOTS[item.id]]
    } else {
      return m.reply(`${item.name} tidak sedang dipakai.`)
    }
    await saveDB(db)
    return m.reply(`${formatItem(item)} dilepas; slot kembali mengikuti armor saat ini.`)
  }

  const itemInSlot = slot => {
    const id = currentOutfit[slot]
    const item = fashion.find(value => value.id === id)
    return item ? formatItem(item) : id || CHARACTER_DEFAULT_OUTFIT[slot] || '-'
  }
  const outfitText = [
    `> 🧢 Kepala: ${itemInSlot('head')}`,
    `> 👕 Atasan: ${itemInSlot('top')}`,
    `> 👖 Bawahan: ${itemInSlot('bottom')}`,
    `> 👟 Kaki: ${itemInSlot('feet')}`,
    `> ✨ Aksesori: ${accessories.length ? accessories.map(id => formatItem(fashion.find(item => item.id === id))).join(', ') : '-'}`
  ].join('\n')
  const inventoryText = owned.length
    ? owned.map(item => `• ${formatItem(item)} ×${rpg.mallInventory[item.id]} — ${MALL_FASHION_SLOTS[item.id] || 'slot belum tersedia'}`).join('\n')
    : 'Belum ada fashion Mall. Beli melalui .mall fashion list.'

  if (mode === 'list' || mode === 'koleksi') {
    return m.reply(`👗 *ISI LEMARI* (${owned.reduce((sum, item) => sum + Number(rpg.mallInventory[item.id] || 0), 0)} item)\n\n${inventoryText}\n\nPakai: ${prefix}wardrobe pakai <nama>\nLepas: ${prefix}wardrobe lepas <slot/nama>`)
  }
  if (!mode || mode === 'info') {
    return m.reply(
      `👗 *WARDROBE / LEMARI*\n` +
      `Fashion yang dibeli di ${prefix}mall fashion dapat dipakai atau dilepas di sini.\n\n` +
      `*Outfit saat ini*\n${outfitText}\n\n` +
      `Fashion dimiliki: ${owned.reduce((sum, item) => sum + Number(rpg.mallInventory[item.id] || 0), 0)} item\n` +
      `Command: ${prefix}wardrobe list | pakai <nama> | lepas <slot/nama>\n` +
      `Aksesori maksimal 4; slot lainnya masing-masing 1. Outfit bawaan mengikuti level armor.`
    )
  }
  return m.reply(`Gunakan ${prefix}wardrobe list, ${prefix}wardrobe pakai <nama>, atau ${prefix}wardrobe lepas <slot/nama>.`)
}

handler.help = ['wardrobe', 'wardrobe list', 'wardrobe pakai <nama>', 'wardrobe lepas <slot/nama>', 'lemari']
handler.tags = ['rpg']
handler.command = /^(wardrobe|lemari)$/i
handler.group = true

export default handler
