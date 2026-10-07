import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  HOME_BASE_CAPACITY,
  HOME_MAX_UPGRADES,
  HOME_PREMIUM_CAPACITY_BONUS,
  HOME_PREMIUM_UPGRADE_DISCOUNT,
  HOME_UPGRADE_BASE_COST,
  HOME_UPGRADE_CAPACITY,
  MALL_CATEGORIES,
  getHomeComfort
} from '../../lib/rpgMallData.js'

const money = value => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
const displayName = item => `${item.emoji} ${item.name}`
const allItems = Object.entries(MALL_CATEGORIES).flatMap(([category, data]) =>
  data.items.map(item => ({ ...item, category }))
)

function findItem(input, category) {
  const key = normalize(input)
  if (!key) return null
  const candidates = category ? (MALL_CATEGORIES[category]?.items.map(item => ({ ...item, category })) || []) : allItems
  return candidates.find(item => normalize(item.id) === key || normalize(item.name) === key)
    || candidates.find(item => normalize(item.name).includes(key))
}

function getHome(rpg) {
  if (!rpg.home || typeof rpg.home !== 'object') {
    rpg.home = { level: 0, public: false, access: [], blocked: [], visitors: [], visitCount: 0, likes: [], furniture: [] }
  }
  const home = rpg.home
  for (const key of ['access', 'blocked', 'visitors', 'likes', 'furniture']) {
    if (!Array.isArray(home[key])) home[key] = []
  }
  home.visitCount = Number(home.visitCount) || 0
  return home
}

function getCollection(rpg) {
  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}
  if (!Array.isArray(rpg.collectionFavorites)) rpg.collectionFavorites = []
  if (!Array.isArray(rpg.collectionShowcase)) rpg.collectionShowcase = []
  return rpg.mallInventory
}

function clearCollectionFlagsWhenUnowned(rpg, itemId) {
  if (Number(rpg.mallInventory?.[itemId]) > 0) return
  rpg.collectionFavorites = (rpg.collectionFavorites || []).filter(id => id !== itemId)
  rpg.collectionShowcase = (rpg.collectionShowcase || []).filter(id => id !== itemId)
}

function getUser(db, jid) {
  return jid ? getUserRPG(db, jid) : null
}

function normalizeJid(jid) {
  if (!jid) return jid
  const resolved = jid.endsWith('@lid')
    ? global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    : jid
  if (!resolved.includes('@')) return resolved
  return `${resolved.split('@')[0].split(':')[0]}${resolved.includes('@lid') ? '@lid' : '@s.whatsapp.net'}`
}

function mentionsOrReply(m, args) {
  const target = normalizeJid(m.mentionedJid?.[0] || m.quoted?.sender)
  return { target, args: args.filter(arg => !/^@/.test(arg)) }
}

let handler = async (m, { text = '', usedPrefix, command }) => {
  const db = loadDB()
  const sender = normalizeJid(m.sender)
  const account = getUserRPG(db, sender)
  if (!account?.rpg) return m.reply('Kamu belum memiliki data RPG.')
  if (!db.money) db.money = {}

  const rpg = account.rpg
  const wallet = () => Number(db.money[sender]) || 0
  const setWallet = value => { db.money[sender] = Math.max(0, Math.floor(value)) }
  const premium = isPremiumAccount(global.db?.data?.users?.[sender])
  const tokens = String(text || '').trim().split(/\s+/).filter(Boolean)
  const root = String(command || '').toLowerCase()
  const prefix = usedPrefix || '.'

  const leaveVisitedHome = () => {
    if (!rpg.lastVisitedHome) return
    const previousHome = getUser(db, rpg.lastVisitedHome)?.rpg?.home
    if (previousHome?.visitors) previousHome.visitors = previousHome.visitors.filter(jid => jid !== sender)
    delete rpg.lastVisitedHome
  }

  if (!['home', 'rumah'].includes(root)) return null
  const mode = String(tokens[0] || '').toLowerCase()
  const home = getHome(rpg)
  const capacity = HOME_BASE_CAPACITY + (Number(home.level) || 0) * HOME_UPGRADE_CAPACITY + (premium ? HOME_PREMIUM_CAPACITY_BONUS : 0)
  const furnitureInventory = getCollection(rpg)
  const comfort = () => getHomeComfort(home, furnitureInventory)

  if (!mode) {
  return m.reply(
    `╭─❏「 🏠 HOME / RUMAH 」❏\n` +
    `│ 🏠 *HOME / RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Fitur untuk mengatur rumah, memasang furniture, dan mengunjungi rumah pemain lain.\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ *${prefix}home guide*\n` +
    `> ↳ *${prefix}home command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'info') {
  const homeComfort = comfort()

  return m.reply(
    `╭─❏「 🏠 RUMAH ${m.pushName || 'PEMAIN'} 」❏\n` +
    `│ 🏠 *INFORMASI RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Status : ${home.public ? 'Publik' : 'Pribadi'}\n` +
    `> ↳ Upgrade : ${home.level}/${HOME_MAX_UPGRADES}\n` +
    `> ↳ Furniture dimiliki : ${homeComfort.furnitureCount}\n` +
    `> ↳ Kenyamanan : *Level ${homeComfort.level}* (${homeComfort.points} poin)\n` +
    `> ↳ Kapasitas pasang : ${home.furniture.length}/${capacity}\n` +
    `> ↳ Like : ${home.likes.length}\n` +
    `> ↳ Kunjungan : ${home.visitCount}\n\n` +
    `📌 *INFORMASI KENYAMANAN*\n` +
    `> ↳ Setiap 5 furniture yang dimiliki atau setiap upgrade rumah menambah 1 level kenyamanan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'guide') {
  return m.reply(
    `╭─❏「 📖 HOME GUIDE 」❏\n` +
    `│ 📖 *PANDUAN HOME*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Atur privasi rumah, pasang furniture dari inventori, undang teman, dan kunjungi rumah pemain lain.\n` +
    `> ↳ Furniture bisa dibeli melalui *${prefix}mall kategori furniture*.\n` +
    `> ↳ Setiap 5 furniture yang dimiliki atau setiap upgrade rumah menaikkan 1 level kenyamanan.\n` +
    `> ↳ Premium mendapat ${HOME_PREMIUM_CAPACITY_BONUS} kapasitas furniture ekstra dan diskon upgrade 20%.\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Lihat daftar perintah : *${prefix}home command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'command') {
  return m.reply(
    `╭─❏「 📋 HOME COMMAND 」❏\n` +
    `│ 📋 *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🏠 *RUMAH*\n` +
    `> ↳ ${prefix}home info — info rumah dan level kenyamanan\n` +
    `> ↳ ${prefix}home furniture — furniture terpasang\n` +
    `> ↳ ${prefix}home pasang <item> — pasang furniture\n` +
    `> ↳ ${prefix}home lepas <item> — lepas furniture\n` +
    `> ↳ ${prefix}home upgrade — tambah kapasitas\n` +
    `> ↳ ${prefix}home public — atur rumah menjadi publik\n` +
    `> ↳ ${prefix}home private — atur rumah menjadi pribadi\n\n` +
    `🚪 *AKSES RUMAH*\n` +
    `> ↳ ${prefix}home masuk — masuk rumah sendiri\n` +
    `> ↳ ${prefix}home keluar — keluar rumah\n` +
    `> ↳ ${prefix}home invite @user — undang pemain\n` +
    `> ↳ ${prefix}home kick @user — cabut akses pemain\n` +
    `> ↳ ${prefix}home visit @user — kunjungi rumah\n` +
    `> ↳ ${prefix}home favorite @user — simpan rumah favorit\n\n` +
    `👥 *INTERAKSI*\n` +
    `> ↳ ${prefix}home tamu — lihat tamu terbaru\n` +
    `> ↳ ${prefix}home like — beri like pada rumah yang dikunjungi\n\n` +
    `🏘️ *JELAJAH RUMAH*\n` +
    `> ↳ ${prefix}home list — lihat rumah yang dapat dikunjungi\n` +
    `> ↳ ${prefix}home explore — lihat rumah publik\n` +
    `> ↳ ${prefix}home top — lihat rumah terpopuler\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'furniture') {
  const placed = home.furniture.map(id => findItem(id)).filter(Boolean)
  const homeComfort = comfort()

  return m.reply(
    `╭─❏「 🛋️ FURNITURE RUMAH 」❏\n` +
    `│ 🛋️ *FURNITURE TERPASANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kapasitas : ${placed.length}/${capacity}\n` +
    `> ↳ Kenyamanan : *Level ${homeComfort.level}* (${homeComfort.points} poin)\n\n` +
    `${placed.length ? placed.map(item => `🛋️ *${displayName(item)}*`).join('\n') : '> ↳ Belum ada furniture terpasang.'}\n\n` +
    `📌 *FURNITURE*\n` +
    `> ↳ Pasang : ${prefix}home pasang <item>\n` +
    `> ↳ Lepas : ${prefix}home lepas <item>\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'pasang' || mode === 'lepas') {
  const item = findItem(tokens.slice(1).join(' '), 'furniture')

  if (!item) {
    return m.reply(
      `╭─❏「 🛋️ FURNITURE 」❏\n` +
      `│ ❌ *FURNITURE TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Lihat daftar furniture melalui *${prefix}mall furniture list*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const index = home.furniture.indexOf(item.id)

  if (mode === 'pasang') {
    if (index !== -1) {
      return m.reply(
        `╭─❏「 🛋️ PASANG FURNITURE 」❏\n` +
        `│ ⚠️ *SUDAH TERPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Furniture itu sudah terpasang di rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (home.furniture.length >= capacity) {
      return m.reply(
        `╭─❏「 🛋️ PASANG FURNITURE 」❏\n` +
        `│ ❌ *KAPASITAS PENUH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kapasitas rumah : ${capacity} furniture.\n` +
        `> ↳ Upgrade rumah atau gunakan Premium untuk kapasitas ekstra.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if ((Number(furnitureInventory[item.id]) || 0) < 1) {
      return m.reply(
        `╭─❏「 🛋️ PASANG FURNITURE 」❏\n` +
        `│ ❌ *FURNITURE TIDAK DIMILIKI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu belum memiliki ${item.name}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    furnitureInventory[item.id]--
    if (!furnitureInventory[item.id]) delete furnitureInventory[item.id]
    home.furniture.push(item.id)
  } else {
    if (index === -1) {
      return m.reply(
        `╭─❏「 🛋️ LEPAS FURNITURE 」❏\n` +
        `│ ❌ *FURNITURE TIDAK TERPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Furniture itu tidak sedang terpasang di rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    home.furniture.splice(index, 1)
    furnitureInventory[item.id] = (Number(furnitureInventory[item.id]) || 0) + 1
  }

  await saveDB(db)

  return m.reply(
    `╭─❏「 🛋️ FURNITURE RUMAH 」❏\n` +
    `│ ✅ *${mode === 'pasang' ? 'FURNITURE DIPASANG' : 'FURNITURE DILEPAS'}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Barang : ${displayName(item)}\n` +
    `> ↳ ${mode === 'pasang' ? 'Furniture berhasil dipasang di rumah.' : 'Furniture dikembalikan ke inventori.'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'upgrade') {
  const level = Number(home.level) || 0

  if (level >= HOME_MAX_UPGRADES) {
    return m.reply(
      `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
      `│ ❌ *LEVEL MAKSIMUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah sudah mencapai level upgrade maksimum.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const cost = Math.floor(HOME_UPGRADE_BASE_COST * (level + 1) * (premium ? 1 - HOME_PREMIUM_UPGRADE_DISCOUNT : 1))

  if (wallet() < cost) {
    return m.reply(
      `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
      `│ ❌ *UANG TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Biaya upgrade : ${money(cost)}\n` +
      `> ↳ Saldo kamu : ${money(wallet())}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  setWallet(wallet() - cost)
  home.level = level + 1

  await saveDB(db)

  const homeComfort = comfort()

  return m.reply(
    `╭─❏「 ⬆️ UPGRADE RUMAH 」❏\n` +
    `│ ✅ *UPGRADE BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Level rumah : ${home.level}\n` +
    `> ↳ Kenyamanan : *Level ${homeComfort.level}* (${homeComfort.points} poin)\n` +
    `> ↳ Kapasitas : ${HOME_BASE_CAPACITY + home.level * HOME_UPGRADE_CAPACITY + (premium ? HOME_PREMIUM_CAPACITY_BONUS : 0)} furniture\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'public' || mode === 'private') {
  home.public = mode === 'public'

  await saveDB(db)

  return m.reply(
    `╭─❏「 🏠 PRIVASI RUMAH 」❏\n` +
    `│ ${home.public ? '🌐' : '🔒'} *PRIVASI DIPERBARUI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Rumah sekarang ${home.public ? 'terbuka untuk umum' : 'pribadi'}.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'masuk') {
  leaveVisitedHome()
  home.visitors = [sender, ...home.visitors.filter(jid => jid !== sender)].slice(0, 20)

  await saveDB(db)

  const homeComfort = comfort()

  return m.reply(
    `╭─❏「 🏠 RUMAH SENDIRI 」❏\n` +
    `│ 🏠 *KAMU BERADA DI RUMAH SENDIRI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kenyamanan : *Level ${homeComfort.level}* (${homeComfort.points} poin)\n` +
    `> ↳ Furniture : ${home.furniture.length}/${capacity}\n\n` +
    `${home.furniture.length ? home.furniture.map(id => `🛋️ *${findItem(id)?.name || id}*`).join('\n') : '> ↳ Rumahmu masih kosong.'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'keluar') {
  leaveVisitedHome()
  home.visitors = home.visitors.filter(jid => jid !== sender)

  await saveDB(db)

  return m.reply(
    `╭─❏「 🚪 KELUAR RUMAH 」❏\n` +
    `│ 🚪 *KAMU SUDAH KELUAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu sudah keluar dari rumah.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'invite' || mode === 'kick' || mode === 'visit' || mode === 'favorite') {
  const { target } = mentionsOrReply(m, tokens.slice(1))

  if (!target) {
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ❌ *TARGET TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tag atau reply pemain.\n` +
      `> ↳ Contoh : *${prefix}home ${mode} @user*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (target === sender) {
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ❌ *TARGET TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pilih pemain lain, bukan diri sendiri.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetAccount = getUser(db, target)

  if (!targetAccount?.rpg) {
    return m.reply(
      `╭─❏「 🏠 AKSES RUMAH 」❏\n` +
      `│ ❌ *DATA RPG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pemain tersebut belum memiliki data RPG.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetHome = getHome(targetAccount.rpg)

  if (mode === 'invite') {
    if (home.access.includes(target) && !home.blocked?.includes(target)) {
      return m.reply(
        `╭─❏「 📩 UNDANG PEMAIN 」❏\n` +
        `│ ⚠️ *SUDAH MEMILIKI AKSES*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pemain ini sudah memiliki akses rumah.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    home.blocked = (home.blocked || []).filter(jid => jid !== target)
    home.access.push(target)

    await saveDB(db)

    return m.reply(
      `╭─❏「 📩 UNDANG PEMAIN 」❏\n` +
      `│ ✅ *UNDANGAN BERHASIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ @${target.split('@')[0]} diundang ke rumahmu.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
  }

  if (mode === 'kick') {
    if (!home.access.includes(target) && !home.visitors.includes(target)) {
      return m.reply(
        `╭─❏「 🚫 CABUT AKSES 」❏\n` +
        `│ ❌ *PEMAIN TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pemain tersebut tidak sedang berkunjung atau memiliki akses.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    home.access = home.access.filter(jid => jid !== target)
    home.visitors = home.visitors.filter(jid => jid !== target)

    const kickedUser = getUser(db, target)
    if (kickedUser?.rpg?.lastVisitedHome === sender) delete kickedUser.rpg.lastVisitedHome

    if (!Array.isArray(home.blocked)) home.blocked = []
    if (!home.blocked.includes(target)) home.blocked.push(target)

    await saveDB(db)

    return m.reply(
      `╭─❏「 🚫 CABUT AKSES 」❏\n` +
      `│ 🚫 *AKSES DICABUT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Akses @${target.split('@')[0]} ke rumahmu dicabut.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
  }

  if (mode === 'favorite') {
    if (!Array.isArray(rpg.favoriteHomes)) rpg.favoriteHomes = []
    if (!rpg.favoriteHomes.includes(target)) rpg.favoriteHomes.push(target)

    await saveDB(db)

    return m.reply(
      `╭─❏「 ⭐ RUMAH FAVORIT 」❏\n` +
      `│ ⭐ *DITAMBAHKAN KE FAVORIT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah @${target.split('@')[0]} ditambahkan ke favorit.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
  }

  if (targetHome.blocked?.includes(sender)) {
    return m.reply(
      `╭─❏「 🚫 KUNJUNGAN DITOLAK 」❏\n` +
      `│ 🚫 *AKSES DICABUT PEMILIK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pemilik rumah telah mencabut akses kunjunganmu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!targetHome.public && !targetHome.access.includes(sender)) {
    return m.reply(
      `╭─❏「 🔒 RUMAH PRIBADI 」❏\n` +
      `│ 🔒 *AKSES TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah ini pribadi. Minta pemilik mengundangmu terlebih dahulu.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (rpg.lastVisitedHome && rpg.lastVisitedHome !== target) leaveVisitedHome()

  targetHome.visitors = [sender, ...targetHome.visitors.filter(jid => jid !== sender)].slice(0, 20)
  targetHome.visitCount++
  rpg.lastVisitedHome = target

  await saveDB(db)

  const placed = targetHome.furniture.map(id => findItem(id)).filter(Boolean)
  const targetComfort = getHomeComfort(targetHome, targetAccount.rpg.mallInventory || {})

  return m.reply(
    `╭─❏「 🏠 KUNJUNGAN RUMAH 」❏\n` +
    `│ 🏠 *MENGUNJUNGI RUMAH @${target.split('@')[0]}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kenyamanan : *Level ${targetComfort.level}* (${targetComfort.points} poin)\n` +
    `> ↳ Furniture terpasang : ${placed.length ? placed.map(item => displayName(item)).join(', ') : 'belum ada'}\n\n` +
    `📌 *INTERAKSI*\n` +
    `> ↳ Gunakan *${prefix}home like* untuk memberi like.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [target] }
  )
}

if (mode === 'tamu') {
  return m.reply(
    `╭─❏「 👥 TAMU TERBARU 」❏\n` +
    `│ 👥 *TAMU TERBARU*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${home.visitors.length ? home.visitors.map(jid => `👤 @${jid.split('@')[0]}`).join('\n') : '> ↳ Belum ada tamu.'}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: home.visitors }
  )
}

if (mode === 'like') {
  const target = rpg.lastVisitedHome

  if (!target) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *BELUM MENGUNJUNGI RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kunjungi rumah pemain lain terlebih dahulu dengan *${prefix}home visit @user*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const owner = getUser(db, target)

  if (!owner?.rpg) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *RUMAH TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Rumah pemain tersebut sudah tidak tersedia.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetHome = getHome(owner.rpg)

  if (target === sender) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *AKSI TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak dapat memberi like pada rumah sendiri.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!targetHome.visitors.includes(sender)) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ❌ *BELUM MENGUNJUNGI RUMAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kunjungi rumah tersebut terlebih dahulu dengan *${prefix}home visit @user*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (targetHome.likes.includes(sender)) {
    return m.reply(
      `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
      `│ ⚠️ *SUDAH MEMBERI LIKE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu sudah memberi like pada rumah ini.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  targetHome.likes.push(sender)
  await saveDB(db)

  return m.reply(
    `╭─❏「 ❤️ LIKE RUMAH 」❏\n` +
    `│ ✅ *LIKE BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Like berhasil diberikan ke rumah @${target.split('@')[0]}.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [target] }
  )
}

if (mode === 'list' || mode === 'explore' || mode === 'top') {
  const homes = Object.entries(db.users || {})
    .filter(([jid, user]) => {
      if (!user?.rpg) return false
      const candidateHome = getHome(user.rpg)
      if (mode === 'top' || candidateHome.public) return true
      return mode === 'list' && (candidateHome.access.includes(sender) || (rpg.favoriteHomes || []).includes(jid))
    })
    .map(([jid, user]) => ({ jid, home: getHome(user.rpg), name: user.name || 'Pemain' }))

  if (mode === 'top') {
    homes.sort((a, b) => b.home.likes.length - a.home.likes.length || b.home.visitCount - a.home.visitCount)

    return m.reply(
      `╭─❏「 🏆 RUMAH TERPOPULER 」❏\n` +
      `│ 🏆 *RUMAH TERPOPULER*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${homes.slice(0, 10).map((entry, index) =>
        `🏆 *${index + 1}. ${entry.name}*\n` +
        `> ↳ ❤️ Like : ${entry.home.likes.length}\n` +
        `> ↳ 👣 Kunjungan : ${entry.home.visitCount}`
      ).join('\n\n') || '> ↳ Belum ada rumah.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'list') {
    const favorites = new Set(rpg.favoriteHomes || [])
    homes.sort((a, b) => Number(favorites.has(b.jid)) - Number(favorites.has(a.jid)))
  }

  return m.reply(
    `╭─❏「 🏘️ RUMAH ${mode === 'explore' ? 'PUBLIK' : 'YANG DAPAT DIKUNJUNGI'} 」❏\n` +
    `│ 🏘️ *DAFTAR RUMAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${homes.slice(0, 15).map(entry =>
      `🏠 *${entry.name}*\n` +
      `> ↳ Status : ${entry.home.public || entry.home.access.includes(sender) ? '🟢 Terbuka' : '🔒 Pribadi'}\n` +
      `> ↳ ❤️ Like : ${entry.home.likes.length}\n` +
      `> ↳ Kunjungi : ${prefix}home visit @${entry.jid.split('@')[0]}`
    ).join('\n\n') || '> ↳ Belum ada rumah terbuka untuk dikunjungi.'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

return m.reply(
  `╭─❏「 🏠 HOME 」❏\n` +
  `│ ❌ *COMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Gunakan *${prefix}home guide* untuk panduan.\n` +
  `> ↳ Gunakan *${prefix}home command* untuk daftar command.\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['home', 'rumah']
handler.alias = ['rumah']
handler.tags = ['rpg']
handler.command = /^(home|rumah)$/i

export default handler
