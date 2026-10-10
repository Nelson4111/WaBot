import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  INTERSTELLAR_ITEMS,
  INTERSTELLAR_PLANETS
} from '../../lib/rpg-exploreData.js'
import { filterRpgPanelUsers, isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import {
  filterLeaderboardUsers,
  getLeaderboardUserIdentity
} from '../../lib/leaderboardPrivacy.js'
import { isRpgEventActive } from '../../lib/rpgEvents.js'

const normalize = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[\s-]+/g, '_')

function getOwnedItems(rpg) {
  return INTERSTELLAR_ITEMS
    .map(item => ({ ...item, quantity: Math.max(0, Number(rpg.inventory?.[item.id]) || 0) }))
    .filter(item => item.quantity > 0)
}

function formatInventory(items, prefix) {
  if (!items.length) {
    return `╭─❏「 🎒 INTERSTELLAR INVENTORY 」❏\n` +
      `│ Inventory antarbintangmu masih kosong.\n` +
      `│ Gunakan *${prefix}explore* untuk mencari item.\n` +
      `╰─━━━━━━━━━━━━━━─`
  }

  return `╭─❏「 🎒 INTERSTELLAR INVENTORY 」❏\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    items.map((item, index) =>
      `> ${index + 1}. ${item.name}`
    ).join('\n\n') +
    `\n\n💡 Jual dengan *${prefix}int sell <all/nomor/nama item>*.`
}

let handler = async (m, { conn, groupMetadata, text = '', usedPrefix, command }) => {
  const db = loadDB()
  const prefix = usedPrefix || '.'
  const root = String(command || '').toLowerCase()
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const mode = root === 'invst' ? 'inventory' : String(args.shift() || '').toLowerCase()

  if (mode === 'guide') {
    return m.reply(
      `╭─❏「 📖 INTERSTELLAR GUIDE 」❏\n` +
      `│ 📖 *PANDUAN ANTARBINTANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Gunakan *${prefix}explore* untuk mengunjungi planet dan menemukan item antarbintang.\n` +
      `> ↳ Item temuan masuk ke inventory Interstellar dan bisa ditukar menjadi Stellar Credit.\n` +
      `> ↳ Planet yang dikunjungi mendapat nomor dimensi acak; daftar planet tidak menampilkan dimensi.\n\n` +
      `📌 *COMMAND*\n` +
      `> ↳ *${prefix}int* — pusat Interstellar\n` +
      `> ↳ *${prefix}invst* — cek inventory antarbintang\n` +
      `> ↳ *${prefix}int sell <all/nomor/nama item>* — jual item\n` +
      `> ↳ *${prefix}int planet* — daftar planet\n` +
      `> ↳ *${prefix}int top* — leaderboard Stellar Credit\n` +
      `> ↳ *${prefix}int command* — daftar command\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'command') {
    return m.reply(
      `╭─❏「 📋 INTERSTELLAR COMMAND 」❏\n` +
      `│ 📋 *DAFTAR COMMAND*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${prefix}explore* — jelajahi planet dan cari item\n` +
      `> ↳ *${prefix}invst* — lihat inventory item Interstellar\n` +
      `> ↳ *${prefix}int sell all* — jual semua item\n` +
      `> ↳ *${prefix}int sell <nomor/nama item>* — jual item tertentu\n` +
      `> ↳ *${prefix}int planet* — lihat daftar planet\n` +
      `> ↳ *${prefix}int top* — lihat pemilik Stellar Credit terbanyak\n` +
      `> ↳ *${prefix}int guide* — panduan Interstellar\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'planet') {
    return m.reply(
      `╭─❏「 🪐 INTERSTELLAR PLANETS 」❏\n` +
      `│ 🪐 *DAFTAR PLANET (${INTERSTELLAR_PLANETS.length})*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      INTERSTELLAR_PLANETS.map((planet, index) => `> ${index + 1}. ${planet}`).join('\n') +
      `\n\nℹ️ Nomor dimensi hanya muncul saat planet dikunjungi.\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'top') {
    const userIds = filterLeaderboardUsers(
      filterRpgPanelUsers(Object.keys(global.db?.data?.users || {})),
      conn
    ).filter(isValidRpgUserId)
    const topUsers = userIds
      .map(id => ({ id, rpg: global.db.data.users[id]?.rpg }))
      .filter(user => user.rpg && Number(user.rpg.stellarCredit) > 0)
      .sort((a, b) => (Number(b.rpg.stellarCredit) || 0) - (Number(a.rpg.stellarCredit) || 0))
      .slice(0, 10)

    const leaderboard = topUsers.length
      ? topUsers.map(({ id, rpg }, index) => {
        const identity = getLeaderboardUserIdentity(id, {
          conn,
          groupMetadata,
          name: conn?.getName?.(id)
        })
        return `> *${index + 1}. ${identity.display}*\n` +
          `> ↳ 💠 ${Number(rpg.stellarCredit) || 0} Stellar Credit`
      }).join('\n\n')
      : 'Belum ada data pemain Interstellar.'

    return m.reply(
      `╭─❏「 🏆 STELLAR CREDIT TOP 」❏\n` +
      `│ 🏆 *TOP 10 STELLAR CREDIT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${leaderboard}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!['', 'inventory', 'sell'].includes(mode)) {
    return m.reply(`Subcommand tidak dikenal. Ketik *${prefix}int command* untuk melihat panduan.`)
  }

  if (!mode) {
    return m.reply(
      `╭─❏「 🌌 INTERSTELLAR 」❏\n` +
      `│ 🌌 *PUSAT ANTARBINTANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Jelajahi planet, kumpulkan item, lalu tukarkan item menjadi Stellar Credit.\n` +
      `> ↳ Gunakan *${prefix}explore* untuk memulai penjelajahan.\n\n` +
      `📌 *MENU*\n` +
      `> ↳ *${prefix}invst* — inventory antarbintang\n` +
      `> ↳ *${prefix}int sell <all/nomor/nama>* — jual item\n` +
      `> ↳ *${prefix}int planet* — daftar planet\n` +
      `> ↳ *${prefix}int top* — leaderboard Stellar Credit\n` +
      `> ↳ *${prefix}int guide* / *${prefix}int command* — panduan\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) {
    return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')
  }

  const rpg = account.rpg
  rpg.inventory = rpg.inventory && typeof rpg.inventory === 'object' ? rpg.inventory : {}
  const items = getOwnedItems(rpg)
  const stellarCredit = Number(rpg.stellarCredit) || 0

  if (mode === 'inventory') {
    return m.reply(formatInventory(items, prefix))
  }

  const target = args.join(' ').trim()
  if (!target) {
    return m.reply(`Cara menjual: *${prefix}int sell <all/nomor/nama item>*`)
  }
  if (!items.length) {
    return m.reply('❌ Inventory Interstellar kamu kosong, belum ada item yang bisa dijual.')
  }

  let selectedItems
  if (normalize(target) === 'all') {
    selectedItems = items
  } else {
    const key = normalize(target)
    const item = /^\d+$/.test(key)
      ? items[Number(key) - 1]
      : items.find(entry => normalize(entry.id) === key || normalize(entry.name) === key) ||
        items.find(entry => normalize(entry.name).includes(key))
    if (!item) {
      return m.reply(`❌ Item tidak ditemukan di inventory. Cek daftar dengan *${prefix}invst*.`)
    }
    selectedItems = [item]
  }

  const soldQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const legendaryDiscovery = isRpgEventActive('legendary_discovery')
  const earned = selectedItems.reduce((sum, item) => {
    const isRareDiscovery = ['RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'SECRET'].includes(item.tier)
    const rewardMultiplier = legendaryDiscovery && isRareDiscovery ? 1.45 : 1
    return sum + Math.floor(item.quantity * item.sellPrice * rewardMultiplier)
  }, 0)
  for (const item of selectedItems) {
    rpg.inventory[item.id] = 0
  }
  rpg.stellarCredit = stellarCredit + earned
  await saveDB(db)

  return m.reply(
    `╭─❏「 💠 INTERSTELLAR SALE 」❏\n` +
    `│ 💠 *PENJUALAN BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> 📦 Item terjual: ${soldQuantity}\n` +
    `> 💰 Stellar Credit didapat: +${earned}\n` +
    `> 💠 Total Stellar Credit: ${rpg.stellarCredit}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['interstellar', 'int', 'invst']
handler.tags = ['rpg']
handler.command = /^(interstellar|int|invst)$/i
handler.group = true

export default handler
