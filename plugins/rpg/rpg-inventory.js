import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg, getEquipmentName, getEquipmentNameList } from '../../lib/waifuHelper.js'
import { migrateRpgCurrencies } from '../../lib/rpg-currency.js'
import { sendRpgButtons, sendRpgConfirmButtons } from '../../lib/rpgActionButtons.js'
import { compareRpgMoney, normalizeRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  getStorageCapacity,
  getStorageCount,
  getStorageDefinitions,
  getStorageEntries,
  getStorageLevel,
  getRequiredStorageLevel,
  getStorageUpgradeCost,
  normalizeStorageType
} from '../../lib/rpg-storage.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, command, text = '', usedPrefix = '.' }) => {
  command = String(command || '').toLowerCase()
  const args = String(text).trim().toLowerCase().split(/\s+/).filter(Boolean)
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg

  if (['rpglevel', 'blood', 'darah', 'equipment', 'equip'].includes(command)) {
  if (['equipment', 'equip'].includes(command) && args[0] === 'list') {
    const labels = {
      sword: '🗡️ Sword',
      armor: '🛡️ Armor',
      pickaxe: '⛏️ Pickaxe',
      fishingrod: '🎣 Fishing Rod'
    }

    const requestedType = args[1]

    if (!requestedType) {
      return m.reply(
        `╭─❏「 📖 DAFTAR EQUIPMENT 」❏\n` +
        `│ 📖 *DAFTAR EQUIPMENT*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *PILIH JENIS EQUIPMENT*\n` +
        `> 🗡️ Sword\n` +
        `> 🛡️ Armor\n` +
        `> ⛏️ Pickaxe\n` +
        `> 🎣 Fishing Rod\n\n` +
        `💡 *CONTOH*\n` +
        `> ↳ ${usedPrefix}equipment list armor\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const types = [requestedType]

    if (types.some(type => !labels[type])) {
      return m.reply(
        `╭─❏「 ❌ EQUIPMENT 」❏\n` +
        `│ ❌ *JENIS EQUIPMENT TIDAK DIKENAL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilih: ${Object.keys(labels).join(', ')}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const sections = types.map(type =>
      `${labels[type]}\n${getEquipmentNameList(type).map((name, index) => `> ${index + 1}. ${name}`).join('\n')}`
    )

    return m.reply(
      `╭─❏「 📖 DAFTAR EQUIPMENT 」❏\n` +
      `│ 📖 *DAFTAR EQUIPMENT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${sections.join('\n\n')}\n\n` +
      `💡 *CONTOH*\n` +
      `> ↳ ${usedPrefix}equipment list armor\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
    const armorLvl = Number(user.armor) || 0
const maxHP = 100 + (armorLvl * 20) + (Number(user.maxDarahBonus) || 0)
if (typeof user.darah === 'undefined') user.darah = maxHP

if (command === 'rpglevel') {
  return m.reply(
    `╭─❏「 🆙 LEVEL RPG 」❏\n` +
    `│ 🆙 *LEVEL RPG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Level: *${user.level}*\n` +
    `> ↳ EXP: ${user.exp}/${(Number(user.level) || 1) * 500}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (['blood', 'darah'].includes(command)) {
  return m.reply(
    `╭─❏「 ❤️ DARAH 」❏\n` +
    `│ ❤️ *DARAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ HP: *${user.darah}/${maxHP}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

return m.reply(
  `╭─❏「 🛡️ EQUIPMENT 」❏\n` +
  `│ 🛡️ *EQUIPMENT*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `🗡️ *PERALATAN*\n` +
  `> ↳ Weapon: ${user.sword ? getEquipmentName('sword', user.sword) : 'None'}\n` +
  `> ↳ Armor: ${user.armor ? getEquipmentName('armor', user.armor) : 'None'}\n` +
  `> ↳ Pickaxe: ${user.pickaxe ? getEquipmentName('pickaxe', user.pickaxe) : 'None'}\n` +
  `> ↳ Fishing Rod: ${user.fishingrod ? getEquipmentName('fishingrod', user.fishingrod) : 'None'}\n\n` +
  `🐾 *PET*\n` +
  `> ↳ Pet: ${user.pet?.tipe && user.pet.tipe !== 'none' ? `${user.pet.tipe.toUpperCase()} (Lv.${user.pet.level || 0})` : 'Tidak Ada'}\n\n` +
  `📌 *MENU*\n` +
  `> ↳ Lihat daftar nama equipment: ${usedPrefix}equipment list\n\n` +
  `─━━━━━━━━━━━━━━─`
)
  }

  if (migrateRpgCurrencies(user)) saveDB(wdb)
  initLadang(user)
  if(!user.inventory) user.inventory = {}

  const materialAlias = { kayu: 'wood', batu: 'stone', emas: 'gold', berlian: 'diamond' }
  function normalizeMaterialKey(key) {
    const raw = String(key || '').trim().toLowerCase().replace(/\s+/g, '_')
    return materialAlias[raw] || raw
  }
  function normalizeUserMaterial(obj = {}) {
    const out = {}
    for (const key in obj) {
      const target = normalizeMaterialKey(key)
      out[target] = (out[target] || 0) + Number(obj[key] || 0)
    }
    return out
  }

  user.inventory = normalizeUserMaterial(user.inventory)
  user.ores = normalizeUserMaterial(user.ores || {})
  user.items = normalizeUserMaterial(user.items || {})

  let isChanged = false

  // MIGRASI DATA LAMA: hasilKebun -> inventory biar sinkron sama kebun.js
  const itemKebun = ['padi','jagung','semangka','jeruk','mangga','apel_merah','apel_hijau','apel','durian','emas','berlian','diamond']
  if(user.hasilKebun){
    for(let item in user.hasilKebun){
      if(user.hasilKebun[item] > 0){
        let key = item.replace(/ /g, '_')
        if(key === 'apel') key = 'apel_merah' // apel lama = apel_merah
        if(key === 'diamond') key = 'berlian' // diamond kebun lama = berlian
        if(itemKebun.includes(key)){
          user.inventory[key] = (user.inventory[key] || 0) + user.hasilKebun[item]
          isChanged = true
        }
      }
    }
    delete user.hasilKebun // hapus biar gak dobel
  }

  // Migrasi khusus item panen diamond di inventory menjadi berlian
  if(user.inventory.diamond && user.inventory.diamond > 0) {
    user.inventory.berlian = (user.inventory.berlian || 0) + user.inventory.diamond
    delete user.inventory.diamond
    isChanged = true
  }

  if(isChanged) saveDB(wdb)

  if (command === 'inv') {
    const storageTypes = getStorageDefinitions()
    const prefix = usedPrefix || '.'
    const level = getStorageLevel(user)
    const capacity = getStorageCapacity(user)
    const moneyNow = normalizeRpgMoney(wdb.money[m.sender] || 0)
    const premium = isPremiumAccount(wdb.users[m.sender])
    const formatMoney = amount => amount.toLocaleString('id-ID')
    const formatNamaItem = nama => formatNama(String(nama))
    const countByType = Object.fromEntries(
      Object.keys(storageTypes).map(type => [type, getStorageCount(user, type)])
    )

    const renderStorageOverview = async () => {
      let text =
        `╭─❏「 🎒 INVENTORY CENTER 」❏\n` +
        `│ 🆙 Level kapasitas: ${level}\n` +
        `│ 📦 Kapasitas tiap penyimpanan: ${capacity.toLocaleString()} slot\n` +
        `│ 💰 Upgrade berikutnya: Rp ${formatMoney(getStorageUpgradeCost(user.level, level, level + 1))}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n`
      for (const [type, storage] of Object.entries(storageTypes)) {
        text += `> ${storage.icon} ${storage.label}: *${countByType[type].toLocaleString()}/${capacity.toLocaleString()} item*\n`
      }
      text +=
        `\n💡 Lihat: *.inv fish / ore / item / stellar / food / drink*\n` +
        `> Kebun: *.inv kebun* · Ringkasan tas: *.inv bag* · Gudang lain: *.inv gudang*\n` +
        `> Level: *.inv level* · Upgrade: *.inv up*`
      return sendRpgButtons(conn, {
        chat: m.chat,
        message: m,
        title: '🎒 INVENTORY CENTER',
        text,
        footer: 'AVELIA • RPG STORAGE',
        buttons: [
          ['🎒 Buka Bag', `${prefix}inv bag`],
          ['🆙 Upgrade Slot', `${prefix}inv up`]
        ],
        quoted: m,
        reply: fallbackText => m.reply(fallbackText)
      })
    }

    const renderStorage = async type => {
      const selectedTypes = type === 'bag'
        ? ['ore', 'item', 'stellar']
        : type === 'kulkas'
          ? ['food', 'drink']
          : [type]
      let total = 0
      let totalCapacity = 0
      let text = `╭─❏「 🎒 INVENTORY ${type.toUpperCase()} 」❏\n`
      text += `│ 🆙 Level: ${level}\n`
      for (const selectedType of selectedTypes) {
        const storage = storageTypes[selectedType]
        const entries = getStorageEntries(user, selectedType)
        const itemCount = Object.values(entries).reduce((sum, amount) => sum + amount, 0)
        total += itemCount
        totalCapacity += capacity
        text += `│ ${storage.icon} ${storage.label}: ${itemCount.toLocaleString()}/${capacity.toLocaleString()} item\n`
      }
      text += `│ 📦 Total: ${total.toLocaleString()}/${totalCapacity.toLocaleString()} item\n`
      text += `╰─━━━━━━━━━━━━━━─\n\n`

      for (const selectedType of selectedTypes) {
        const storage = storageTypes[selectedType]
        const entries = Object.entries(getStorageEntries(user, selectedType))
          .sort((a, b) => b[1] - a[1])
        text += `${storage.icon} *${storage.label.toUpperCase()}*\n`
        if (!entries.length) {
          text += `> Belum ada item tersimpan.\n`
        } else {
          for (const [name, amount] of entries) {
            text += `> ${formatNamaItem(name)} ×${amount.toLocaleString()}\n`
          }
        }
        text += '\n'
      }
      text += `🆙 Upgrade kapasitas: *${prefix}inv up*`
      return m.reply(text)
    }

    const sendUpgradePrompt = async (targetLevel, isMaxUpgrade) => {
      const cost = getStorageUpgradeCost(user.level, level, targetLevel)
      const accountBalance = moneyNow
      if (compareRpgMoney(accountBalance, cost) < 0) {
        return m.reply(
          `╭─❏「 💸 UPGRADE INVENTORY 」❏\n` +
          `│ ❌ Uang tidak cukup untuk upgrade.\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Level: ${level} → ${targetLevel}\n` +
          `> ↳ Biaya: Rp ${formatMoney(cost)}\n` +
          `> ↳ Saldo: Rp ${formatMoney(accountBalance)}`
        )
      }

      user.inventoryUpgradePending = {
        fromLevel: level,
        targetLevel,
        cost: String(cost),
        isMaxUpgrade,
        expiresAt: Date.now() + 10 * 60 * 1000
      }
      await saveDB(wdb)

      let text =
        `╭─❏「 🆙 KONFIRMASI UPGRADE INVENTORY 」❏\n` +
        `│ ${isMaxUpgrade ? '👑 Upgrade otomatis Premium' : '📦 Upgrade semua penyimpanan'}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Level: *${level} → ${targetLevel}*\n` +
        `> ↳ Biaya: *Rp ${formatMoney(cost)}*\n` +
        `> ↳ Saldo sekarang: Rp ${formatMoney(accountBalance)}\n\n` +
        `📊 *KAPASITAS SEBELUM → SESUDAH*\n`
      for (const [type, storage] of Object.entries(storageTypes)) {
        text += `> ${storage.icon} ${storage.label}: ${countByType[type].toLocaleString()}/${capacity.toLocaleString()} → ${countByType[type].toLocaleString()}/${(100 + targetLevel * 50).toLocaleString()}\n`
      }
      text += `\nKonfirmasi upgrade? Biaya dibayar dari uang saku.`
      return sendRpgConfirmButtons(conn, m, {
        title: '🆙 KONFIRMASI UPGRADE INVENTORY',
        text,
        acceptText: '✅ Ya, Upgrade!',
        acceptCommand: `${prefix}inv up ya`,
        cancelText: '❌ Batalkan',
        cancelCommand: `${prefix}inv up batal`,
        footer: 'AVELIA • RPG STORAGE'
      })
    }

    const args = String(text).trim().toLowerCase().split(/\s+/).filter(Boolean)
    const action = args[0] || ''

    if (action === 'up' || action === 'upgrade') {
      const confirmation = args[1] || ''
      if (['batal', 'no', 'tidak', 'cancel', 'tolak'].includes(confirmation)) {
        delete user.inventoryUpgradePending
        await saveDB(wdb)
        return m.reply('❌ Upgrade kapasitas dibatalkan.')
      }
      if (['ya', 'yes', 'ok', 'confirm'].includes(confirmation)) {
        const pending = user.inventoryUpgradePending
        if (!pending || pending.expiresAt < Date.now()) {
          delete user.inventoryUpgradePending
          await saveDB(wdb)
          return m.reply(`❌ Konfirmasi upgrade tidak ditemukan atau sudah kedaluwarsa. Mulai lagi dengan *${prefix}inv up*.`)
        }
        if (getStorageLevel(user) !== pending.fromLevel) {
          delete user.inventoryUpgradePending
          await saveDB(wdb)
          return m.reply('❌ Level kapasitas berubah. Periksa kembali status dengan *.inv level* lalu ajukan upgrade baru.')
        }
        const currentMax = Math.max(...Object.keys(storageTypes).map(type => getStorageCount(user, type)))
        if (pending.isMaxUpgrade && pending.targetLevel * 50 + 100 <= currentMax) {
          delete user.inventoryUpgradePending
          await saveDB(wdb)
          return m.reply(`❌ Stok sudah berubah dan kapasitas belum cukup. Ajukan kembali dengan *${prefix}inv up max*.`)
        }
        const cost = BigInt(pending.cost)
        if (compareRpgMoney(wdb.money[m.sender] || 0, cost) < 0) {
          delete user.inventoryUpgradePending
          await saveDB(wdb)
          return m.reply(`❌ Saldo berubah dan tidak cukup. Biaya upgrade: Rp ${formatMoney(cost)}.`)
        }
        wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender] || 0, cost)
        user.inventoryLevel = pending.targetLevel
        delete user.inventoryUpgradePending
        await saveDB(wdb)
        const newCapacity = getStorageCapacity(user)
        const successText =
          `╭─❏「 🎉 UPGRADE INVENTORY BERHASIL 」❏\n` +
          `│ 🆙 Level: ${pending.fromLevel} → ${pending.targetLevel}\n` +
          `│ 📦 Kapasitas: ${capacity.toLocaleString()} → ${newCapacity.toLocaleString()} slot per penyimpanan\n` +
          `│ 💸 Terpakai: Rp ${formatMoney(cost)}\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `Semua penyimpanan sudah mendapat kapasitas baru.`
        return sendRpgButtons(conn, {
          chat: m.chat,
          message: m,
          text: successText,
          title: '🎉 UPGRADE BERHASIL',
          footer: 'AVELIA • RPG STORAGE',
          buttons: [
            ['🆙 Upgrade Lagi', `${prefix}inv up`],
            ['📦 Lihat Inventory', `${prefix}inv`]
          ],
          quoted: m,
          reply: fallbackText => m.reply(fallbackText)
        })
      }

      let targetLevel = level + 1
      let isMaxUpgrade = false
      if (confirmation === 'max') {
        if (!premium) return m.reply('👑 Upgrade otomatis *max* hanya tersedia untuk pengguna Premium.')
        const maxCount = Math.max(...Object.values(countByType))
        targetLevel = getRequiredStorageLevel(maxCount, level)
        if (targetLevel === level) {
          return m.reply(`✅ Semua penyimpanan masih aman di bawah kapasitas ${capacity}. Upgrade *max* belum diperlukan.`)
        }
        isMaxUpgrade = true
      } else if (confirmation) {
        return m.reply(`Gunakan *${prefix}inv up*, *${prefix}inv up max* (Premium), atau *${prefix}inv up batal*.`)
      }
      return sendUpgradePrompt(targetLevel, isMaxUpgrade)
    }

    if (action === 'level' || !action || action === 'all') return renderStorageOverview()

    const selectedType = normalizeStorageType(action)
    if (!selectedType) {
      return m.reply(`Kategori tidak dikenal. Pilih: *fish, ore, item, stellar, food, drink, kebun, gudang,* atau *bag*.`)
    }
    if (selectedType === 'level' || selectedType === 'all') return renderStorageOverview()
    return renderStorage(selectedType)
  }

  let threshold = user.level * 500
  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20) + (user.maxDarahBonus || 0)
  if (typeof user.darah === 'undefined') user.darah = maxHP

  // cari pet level tertinggi
  let petTertinggi = null
  if(user.pets && user.pets.length > 0){
    petTertinggi = user.pets.sort((a,b) => b.level - a.level)[0]
  } else if(user.pet && user.pet.tipe!== 'none'){
    petTertinggi = user.pet
  }

  // Hitung total material gabungan dari berbagai key
  let totalDiamond = (user.diamond || 0) + (user.inventory?.diamond || 0) + (user.ores?.diamond || 0)
  let totalIron = (user.iron || 0) + (user.inventory?.iron || 0) + (user.ores?.iron || 0)
  let totalGold = (user.gold || 0) + (user.inventory?.gold || 0) + (user.ores?.gold || 0)
  let totalWood = (user.wood || 0) + (user.inventory?.wood || 0) + (user.ores?.wood || 0)
  let totalStone = (user.stone || 0) + (user.inventory?.stone || 0) + (user.ores?.stone || 0)
  let totalCoin = Number(user.inventory?.coin || 0)
  let totalGemstone = Number(user.inventory?.gemstone || 0)

  let cap = `╭─❏「 🎒 RPG INVENTORY 」❏\n`
cap += `│ 👤 Pemain: ${m.pushName || 'Player'}\n`
cap += `│ 🆙 Level: ${user.level} (${user.exp}/${threshold} XP)\n`
cap += `│ ❤️ Darah: ${user.darah}/${maxHP}\n`
cap += `│ 💰 Saldo: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `🛡️ *EQUIPMENT*\n`
cap += `> 🗡️ Weapon: ${user.sword ? getEquipmentName('sword', user.sword) : 'None'}\n`
cap += `> 🛡️ Armor: ${user.armor ? getEquipmentName('armor', user.armor) : 'None'}\n`
cap += `> ⛏️ Pickaxe: ${user.pickaxe ? getEquipmentName('pickaxe', user.pickaxe) : 'None'}\n`
cap += `> 🎣 Fishing Rod: ${user.fishingrod ? getEquipmentName('fishingrod', user.fishingrod) : 'None'}\n`
cap += `> 🐾 Pet: ${petTertinggi ? `${petTertinggi.tipe.toUpperCase()} (Lv.${petTertinggi.level})` : 'Tidak Ada'}\n`

cap += `\n─━━━━━━━━━━━━━━─\n`
cap += `📦 *STORAGE*\n`
cap += `> 💎 Diamond: ${totalDiamond.toLocaleString()}\n`
cap += `> 🪙 Coin: ${totalCoin.toLocaleString()}\n`
cap += `> 💚 Gemstone: ${totalGemstone.toLocaleString()}\n`
cap += `> ⛓️ Iron: ${totalIron.toLocaleString()}\n`
cap += `> ✨ Gold: ${totalGold.toLocaleString()}\n`
cap += `> 🪵 Wood: ${totalWood.toLocaleString()}\n`
cap += `> 🪨 Stone: ${totalStone.toLocaleString()}\n`
cap += `> ↳ Lihat lengkap: *.bag*\n`

if (user.ikan) {
  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `🐟 *FISH TANK*\n`
  cap += `> 🐟 Lele: ${user.ikan.lele || 0}\n`
  cap += `> 🐠 Nila: ${user.ikan.nila || 0}\n`
  cap += `> 🦈 Hiu: ${user.ikan.hiu || 0}\n`
  cap += `> 🐡 Bawal: ${user.ikan.bawal || 0}\n`
  cap += `> ↳ Lihat lengkap: *.aquarium*\n`
}

// GARDEN HARVEST
let totalKebun = 0

const cek = {
  padi: user.inventory.padi || 0,
  jagung: user.inventory.jagung || 0,
  semangka: user.inventory.semangka || 0,
  jeruk: user.inventory.jeruk || 0,
  mangga: user.inventory.mangga || 0,
  apel: (user.inventory.apel_merah || 0) + (user.inventory.apel_hijau || 0),
  durian: user.inventory.durian || 0,
  sawit: user.inventory.sawit || 0,
  emas: user.inventory.emas || 0,
  berlian: user.inventory.berlian || 0
}

for (let i in cek) {
  totalKebun += cek[i]
}

if (totalKebun > 0) {
  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `🌾 *GARDEN HARVEST*\n`
  cap += `> 🌾 Padi: ${cek.padi.toLocaleString()}\n`
  cap += `> 🌽 Jagung: ${cek.jagung.toLocaleString()}\n`
  cap += `> 🍉 Semangka: ${cek.semangka.toLocaleString()}\n`
  cap += `> 🍊 Jeruk: ${cek.jeruk.toLocaleString()}\n`
  cap += `> 🥭 Mangga: ${cek.mangga.toLocaleString()}\n`
  cap += `> 🍎 Apel: ${cek.apel.toLocaleString()}\n`
  cap += `> 🌳 Durian: ${cek.durian.toLocaleString()}\n`
  cap += `> 🌴 Sawit: ${cek.sawit.toLocaleString()}\n`
  cap += `> ⚜️ Emas: ${cek.emas.toLocaleString()}\n`

  if (cek.berlian > 0) {
    cap += `> 💠 Berlian: ${cek.berlian.toLocaleString()}\n`
  }

  cap += `> ↳ Lihat lengkap: *.kebun*\n`
}

cap += `\n─━━━━━━━━━━━━━━─\n`
cap += `📚 *INVENTORY LAINNYA*\n`
cap += `> 📦 Cek kapasitas & kategori: *.inv*\n`
cap += `> 📦 Cek Semua: *.gudang*\n`
cap += `> 🎒 Cek Material: *.bag*\n`
cap += `> 🍖 Cek Makanan: *.kulkas*\n`
cap += `> 🐾 Cek Peliharaan: *.pet*\n`
cap += `> 🐠 Cek Aquarium: *.aquarium*\n`
cap += `> 🌾 Cek Kebun: *.kebun*\n`
cap += `─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap)
}

handler.help = ['inv', 'inv <kategori>', 'inv level', 'inv up [max]', 'inventory', 'equipment list']
handler.tags = ['rpg']
handler.command = /^(inv|inventory|rpglevel|equipment|equip|blood|darah)$/i
handler.alias = ['inv', 'inventory']

export default handler