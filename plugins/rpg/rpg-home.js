import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  HOME_BASE_CAPACITY,
  HOME_MAX_UPGRADES,
  HOME_PREMIUM_CAPACITY_BONUS,
  HOME_PREMIUM_UPGRADE_DISCOUNT,
  HOME_UPGRADE_BASE_COST,
  HOME_UPGRADE_CAPACITY,
  MALL_CATEGORIES
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

  if (!mode || mode === 'info') {
    await saveDB(db)
    return m.reply(`🏠 *RUMAH ${m.pushName || 'Pemain'}*\nStatus: ${home.public ? 'Publik' : 'Pribadi'}\nUpgrade: ${home.level}/${HOME_MAX_UPGRADES}\nKapasitas furniture: ${home.furniture.length}/${capacity}\nLike: ${home.likes.length} · Kunjungan: ${home.visitCount}\n\nPremium mendapat ${HOME_PREMIUM_CAPACITY_BONUS} kapasitas ekstra dan diskon upgrade 20%.\nGunakan ${prefix}home untuk daftar perintah.`)
  }

  if (mode === 'furniture') {
    const placed = home.furniture.map(id => findItem(id)).filter(Boolean)
    return m.reply(`🛋️ *FURNITURE RUMAH* (${placed.length}/${capacity})\n${placed.length ? placed.map(item => `• ${displayName(item)}`).join('\n') : 'Belum ada furniture terpasang.'}\n\nPasang: ${prefix}home pasang <item> · Lepas: ${prefix}home lepas <item>`)
  }

  if (mode === 'pasang' || mode === 'lepas') {
    const item = findItem(tokens.slice(1).join(' '), 'furniture')
    if (!item) return m.reply('Furniture tidak ditemukan. Lihat .mall furniture list.')
    const index = home.furniture.indexOf(item.id)
    if (mode === 'pasang') {
      if (index !== -1) return m.reply('Furniture itu sudah terpasang.')
      if (home.furniture.length >= capacity) return m.reply(`Kapasitas penuh (${capacity}). Upgrade rumah atau Premium untuk kapasitas ekstra.`)
      if ((Number(furnitureInventory[item.id]) || 0) < 1) return m.reply(`Kamu belum memiliki ${item.name}.`)
      furnitureInventory[item.id]--
      if (!furnitureInventory[item.id]) delete furnitureInventory[item.id]
      home.furniture.push(item.id)
    } else {
      if (index === -1) return m.reply('Furniture itu tidak sedang terpasang.')
      home.furniture.splice(index, 1)
      furnitureInventory[item.id] = (Number(furnitureInventory[item.id]) || 0) + 1
    }
    await saveDB(db)
    return m.reply(`✅ ${mode === 'pasang' ? 'Memasang' : 'Melepas'} ${displayName(item)} ${mode === 'lepas' ? 'dan mengembalikannya ke inventori' : 'di rumah'}.`)
  }

  if (mode === 'upgrade') {
    const level = Number(home.level) || 0
    if (level >= HOME_MAX_UPGRADES) return m.reply('Rumah sudah mencapai level upgrade maksimum.')
    const cost = Math.floor(HOME_UPGRADE_BASE_COST * (level + 1) * (premium ? 1 - HOME_PREMIUM_UPGRADE_DISCOUNT : 1))
    if (wallet() < cost) return m.reply(`Uang tidak cukup. Biaya upgrade ${money(cost)}.`)
    setWallet(wallet() - cost)
    home.level = level + 1
    await saveDB(db)
    return m.reply(`⬆️ Rumah berhasil di-upgrade ke level ${home.level}. Kapasitas sekarang ${HOME_BASE_CAPACITY + home.level * HOME_UPGRADE_CAPACITY + (premium ? HOME_PREMIUM_CAPACITY_BONUS : 0)} furniture.`)
  }

  if (mode === 'public' || mode === 'private') {
    home.public = mode === 'public'
    await saveDB(db)
    return m.reply(`🏠 Rumah sekarang ${home.public ? 'terbuka untuk umum' : 'pribadi'}.`)
  }

  if (mode === 'masuk') {
    leaveVisitedHome()
    home.visitors = [sender, ...home.visitors.filter(jid => jid !== sender)].slice(0, 20)
    await saveDB(db)
    return m.reply(`🏠 Kamu berada di rumah sendiri.\nFurniture: ${home.furniture.length}/${capacity}\n${home.furniture.length ? home.furniture.map(id => `• ${findItem(id)?.name || id}`).join('\n') : 'Rumahmu masih kosong.'}`)
  }

  if (mode === 'keluar') {
    leaveVisitedHome()
    home.visitors = home.visitors.filter(jid => jid !== sender)
    await saveDB(db)
    return m.reply('🚪 Kamu sudah keluar dari rumah.')
  }

  if (mode === 'invite' || mode === 'kick' || mode === 'visit' || mode === 'favorite') {
    const { target } = mentionsOrReply(m, tokens.slice(1))
    if (!target) return m.reply(`Tag atau reply pemain. Contoh: ${prefix}home ${mode} @user`)
    if (target === sender) return m.reply('Pilih pemain lain, bukan diri sendiri.')
    const targetAccount = getUser(db, target)
    if (!targetAccount?.rpg) return m.reply('Pemain tersebut belum memiliki data RPG.')
    const targetHome = getHome(targetAccount.rpg)

    if (mode === 'invite') {
      if (home.access.includes(target) && !home.blocked?.includes(target)) return m.reply('Pemain ini sudah memiliki akses rumah.')
      home.blocked = (home.blocked || []).filter(jid => jid !== target)
      home.access.push(target)
      await saveDB(db)
      return m.reply(`✅ @${target.split('@')[0]} diundang ke rumahmu.`, null, { mentions: [target] })
    }

    if (mode === 'kick') {
      if (!home.access.includes(target) && !home.visitors.includes(target)) return m.reply('Pemain tersebut tidak sedang berkunjung atau memiliki akses.')
      home.access = home.access.filter(jid => jid !== target)
      home.visitors = home.visitors.filter(jid => jid !== target)
      const kickedUser = getUser(db, target)
      if (kickedUser?.rpg?.lastVisitedHome === sender) delete kickedUser.rpg.lastVisitedHome
      if (!Array.isArray(home.blocked)) home.blocked = []
      if (!home.blocked.includes(target)) home.blocked.push(target)
      await saveDB(db)
      return m.reply(`🚫 Akses @${target.split('@')[0]} ke rumahmu dicabut.`, null, { mentions: [target] })
    }

    if (mode === 'favorite') {
      if (!Array.isArray(rpg.favoriteHomes)) rpg.favoriteHomes = []
      if (!rpg.favoriteHomes.includes(target)) rpg.favoriteHomes.push(target)
      await saveDB(db)
      return m.reply(`⭐ Rumah @${target.split('@')[0]} ditambahkan ke favorit.`, null, { mentions: [target] })
    }

    if (targetHome.blocked?.includes(sender)) return m.reply('Pemilik rumah telah mencabut akses kunjunganmu.')
    if (!targetHome.public && !targetHome.access.includes(sender)) return m.reply('Rumah ini pribadi. Minta pemilik mengundangmu terlebih dahulu.')
    if (rpg.lastVisitedHome && rpg.lastVisitedHome !== target) leaveVisitedHome()
    targetHome.visitors = [sender, ...targetHome.visitors.filter(jid => jid !== sender)].slice(0, 20)
    targetHome.visitCount++
    rpg.lastVisitedHome = target
    await saveDB(db)
    const placed = targetHome.furniture.map(id => findItem(id)).filter(Boolean)
    return m.reply(`🏠 Kamu mengunjungi rumah @${target.split('@')[0]}.\nFurniture: ${placed.length ? placed.map(item => displayName(item)).join(', ') : 'belum ada'}\nGunakan .home like untuk memberi like.`, null, { mentions: [target] })
  }

  if (mode === 'tamu') {
    return m.reply(`👥 *TAMU TERBARU*\n${home.visitors.length ? home.visitors.map(jid => `• @${jid.split('@')[0]}`).join('\n') : 'Belum ada tamu.'}`, null, { mentions: home.visitors })
  }

  if (mode === 'like') {
    const target = rpg.lastVisitedHome
    if (!target) return m.reply('Kunjungi rumah pemain lain terlebih dahulu dengan .home visit @user.')
    const owner = getUser(db, target)
    if (!owner?.rpg) return m.reply('Rumah pemain tersebut sudah tidak tersedia.')
    const targetHome = getHome(owner.rpg)
    if (target === sender) return m.reply('Kamu tidak dapat memberi like pada rumah sendiri.')
    if (!targetHome.visitors.includes(sender)) return m.reply('Kunjungi rumah tersebut terlebih dahulu dengan .home visit @user.')
    if (targetHome.likes.includes(sender)) return m.reply('Kamu sudah memberi like pada rumah ini.')
    targetHome.likes.push(sender)
    await saveDB(db)
    return m.reply(`❤️ Like berhasil diberikan ke rumah @${target.split('@')[0]}.`, null, { mentions: [target] })
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
      return m.reply(`🏆 *RUMAH TERPOPULER*\n${homes.slice(0, 10).map((entry, index) =>
        `${index + 1}. ${entry.name} — ❤️ ${entry.home.likes.length} · 👣 ${entry.home.visitCount}`
      ).join('\n') || 'Belum ada rumah.'}`)
    }

    if (mode === 'list') {
      const favorites = new Set(rpg.favoriteHomes || [])
      homes.sort((a, b) => Number(favorites.has(b.jid)) - Number(favorites.has(a.jid)))
    }

    return m.reply(`🏘️ *RUMAH ${mode === 'explore' ? 'PUBLIK' : 'YANG DAPAT DIKUNJUNGI'}*\n${homes.slice(0, 15).map(entry =>
      `• ${entry.name} ${entry.home.public || entry.home.access.includes(sender) ? '🟢' : '🔒'} — ❤️ ${entry.home.likes.length} · gunakan ${prefix}home visit @${entry.jid.split('@')[0]}`
    ).join('\n') || 'Belum ada rumah terbuka untuk dikunjungi.'}`)
  }

  return m.reply(
    `🏠 *MENU HOME*\n${prefix}home info · furniture · pasang <item> · lepas <item>\n` +
    `${prefix}home upgrade · masuk · invite @user · kick @user · tamu\n` +
    `${prefix}home keluar · visit @user · public · private · list · favorite @user\n` +
    `${prefix}home explore · like · top`
  )
}

handler.help = ['home', 'rumah']
handler.alias = ['rumah']
handler.tags = ['rpg']
handler.command = /^(home|rumah)$/i

export default handler
