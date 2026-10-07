import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  COLLECTION_SHOWCASE_LIMIT,
  MALL_CATEGORIES,
  MALL_PREMIUM_DISCOUNT
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

  const rpg = account.rpg
  const inventory = getCollection(rpg)
  const premium = isPremiumAccount(global.db?.data?.users?.[sender])
  const tokens = String(text || '').trim().split(/\s+/).filter(Boolean)
  const root = String(command || '').toLowerCase()
  const prefix = usedPrefix || '.'

  if (!['cl', 'collection', 'koleksi'].includes(root)) return null
  const mode = String(tokens[0] || '').toLowerCase()

  if (!mode) return m.reply(`📚 *COLLECTION*\n${prefix}cl list · info <item> · kategori · top\n${prefix}cl favorite <item> · showcase [item]\n${prefix}cl unshowcase <item> · ${prefix}cl @user (lihat koleksi)\n${prefix}cl hadiah @user <item> · tukar @user <item-kamu> <item-dia>\n${prefix}cl terima · ${prefix}cl tolak (jawab pertukaran)\nPremium: diskon 20% saat membeli koleksi di ${prefix}mall koleksi.`)
  if (mode === 'kategori') return m.reply(`🗂️ *KATEGORI KOLEKSI*\n${MALL_CATEGORIES.koleksi.items.map(item => `• ${displayName(item)} — ${money(item.price)}`).join('\n')}`)

  if (mode === 'info') {
    const item = findItem(tokens.slice(1).join(' '), 'koleksi')
    if (!item) return m.reply('Item koleksi tidak ditemukan.')
    return m.reply(`🔎 *${displayName(item)}*\nHarga Mall: ${money(Math.floor(item.price * (premium ? 1 - MALL_PREMIUM_DISCOUNT : 1)))}\nHarga jual: ${money(item.sellPrice)}\nDimiliki: ${inventory[item.id] || 0}\nFavorit: ${(rpg.collectionFavorites || []).includes(item.id) ? 'Ya' : 'Tidak'}\nDipamerkan: ${(rpg.collectionShowcase || []).includes(item.id) ? 'Ya' : 'Tidak'}`)
  }

  if (mode === 'list') {
    const ownedCollections = MALL_CATEGORIES.koleksi.items.filter(item => Number(inventory[item.id]) > 0)
    return m.reply(`📚 *KOLEKSI DIMILIKI*\n${ownedCollections.length ? ownedCollections.map(item =>
      `• ${displayName(item)} x${inventory[item.id]}${(rpg.collectionFavorites || []).includes(item.id) ? ' ⭐' : ''}${(rpg.collectionShowcase || []).includes(item.id) ? ' 🖼️' : ''}`
    ).join('\n') : 'Belum ada item koleksi. Beli di .mall koleksi list.'}`)
  }

  if (mode === 'top') {
    const ranked = Object.entries(db.users || {}).filter(([, user]) => user?.rpg).map(([jid, user]) => {
      const bag = user.rpg.mallInventory || {}
      return { jid, name: user.name || 'Pemain', count: MALL_CATEGORIES.koleksi.items.reduce((sum, item) => sum + (Number(bag[item.id]) || 0), 0) }
    }).sort((a, b) => b.count - a.count).slice(0, 10)
    return m.reply(`🏆 *TOP KOLEKTOR*\n${ranked.map((entry, index) => `${index + 1}. ${entry.name} — ${entry.count} koleksi`).join('\n') || 'Belum ada kolektor.'}`)
  }

  if (mode === 'favorite') {
    const item = findItem(tokens.slice(1).join(' '), 'koleksi')
    if (!item) return m.reply('Item koleksi tidak ditemukan.')
    if ((Number(inventory[item.id]) || 0) < 1) return m.reply('Kamu hanya bisa memfavoritkan koleksi yang dimiliki.')
    if (!rpg.collectionFavorites.includes(item.id)) rpg.collectionFavorites.push(item.id)
    await saveDB(db)
    return m.reply(`⭐ ${item.name} ditandai sebagai favorit.`)
  }

  if (mode === 'showcase' || mode === 'unshowcase') {
    const itemInput = tokens.slice(1).join(' ')
    if (!itemInput) return m.reply(`🖼️ *KOLEKSI PAMERAN*\n${rpg.collectionShowcase.length ? rpg.collectionShowcase.map(id => `• ${findItem(id)?.name || id}`).join('\n') : 'Belum ada item dipamerkan.'}\nTambah: ${prefix}cl showcase <item>`)
    const item = findItem(itemInput, 'koleksi')
    if (!item) return m.reply('Item koleksi tidak ditemukan.')
    if (mode === 'showcase') {
      if ((Number(inventory[item.id]) || 0) < 1) return m.reply('Kamu hanya bisa memamerkan koleksi yang dimiliki.')
      if (!rpg.collectionShowcase.includes(item.id) && rpg.collectionShowcase.length >= COLLECTION_SHOWCASE_LIMIT) return m.reply(`Pameran penuh. Batasnya ${COLLECTION_SHOWCASE_LIMIT} item.`)
      if (!rpg.collectionShowcase.includes(item.id)) rpg.collectionShowcase.push(item.id)
    } else {
      rpg.collectionShowcase = rpg.collectionShowcase.filter(id => id !== item.id)
    }
    await saveDB(db)
    return m.reply(`✅ ${item.name} ${mode === 'showcase' ? 'ditambahkan ke' : 'dihapus dari'} pameran.`)
  }

  if (mode === 'hadiah' || mode === 'tukar') {
    const { target, args } = mentionsOrReply(m, tokens.slice(1))
    if (!target || target === sender) return m.reply(`Tag pemain lain. Contoh: ${prefix}cl ${mode} @user <item>`)
    const targetUser = getUserRPG(db, target)
    if (!targetUser?.rpg) return m.reply('Target belum memiliki data RPG.')
    const receiverBag = getCollection(targetUser.rpg)

    if (mode === 'hadiah') {
      const item = findItem(args.join(' '), 'koleksi')
      if (!item) return m.reply('Sebutkan item koleksi yang valid.')
      if ((Number(inventory[item.id]) || 0) < 1) return m.reply(`Kamu tidak memiliki ${item.name}.`)
      inventory[item.id]--
      if (!inventory[item.id]) delete inventory[item.id]
      clearCollectionFlagsWhenUnowned(rpg, item.id)
      receiverBag[item.id] = (Number(receiverBag[item.id]) || 0) + 1
      await saveDB(db)
      return m.reply(`🎁 ${item.name} diberikan kepada @${target.split('@')[0]}.`, null, { mentions: [target] })
    }

    let offered = null
    let requested = null
    for (let split = 1; split < args.length && !requested; split++) {
      const candidateOffered = findItem(args.slice(0, split).join(' '), 'koleksi')
      const candidateRequested = findItem(args.slice(split).join(' '), 'koleksi')
      if (candidateOffered && candidateRequested) {
        offered = candidateOffered
        requested = candidateRequested
      }
    }

    if (!requested) return m.reply(`Format tukar: ${prefix}cl tukar @user <koleksi-kamu> <koleksi-yang-diminta>.`)
    if ((Number(inventory[offered.id]) || 0) < 1) return m.reply(`Kamu tidak memiliki ${offered.name}.`)
    if ((Number(receiverBag[requested.id]) || 0) < 1) return m.reply(`Target tidak memiliki ${requested.name}.`)
    if (targetUser.rpg.collectionTrade) return m.reply('Target masih memiliki permintaan tukar yang belum dijawab.')
    targetUser.rpg.collectionTrade = { from: sender, offered: offered.id, requested: requested.id, createdAt: Date.now() }
    await saveDB(db)
    return m.reply(`🔄 Permintaan tukar dikirim: ${offered.name} ↔ ${requested.name}.\n@${target.split('@')[0]} dapat memakai .cl terima atau .cl tolak.`, null, { mentions: [target] })
  }

  if (mode === 'terima' || mode === 'tolak') {
    const trade = rpg.collectionTrade
    if (!trade || Date.now() - trade.createdAt > 600000) {
      delete rpg.collectionTrade
      await saveDB(db)
      return m.reply('Tidak ada permintaan tukar aktif (berlaku 10 menit).')
    }
    const senderUser = getUserRPG(db, trade.from)
    if (mode === 'tolak') {
      delete rpg.collectionTrade
      await saveDB(db)
      return m.reply('Permintaan tukar ditolak.')
    }
    const senderBag = getCollection(senderUser?.rpg || {})
    if (!senderUser?.rpg || (Number(senderBag[trade.offered]) || 0) < 1 || (Number(inventory[trade.requested]) || 0) < 1) {
      delete rpg.collectionTrade
      await saveDB(db)
      return m.reply('Pertukaran dibatalkan karena stok salah satu item sudah berubah.')
    }
    senderBag[trade.offered]--
    clearCollectionFlagsWhenUnowned(senderUser.rpg, trade.offered)
    inventory[trade.offered] = (Number(inventory[trade.offered]) || 0) + 1
    inventory[trade.requested]--
    clearCollectionFlagsWhenUnowned(rpg, trade.requested)
    senderBag[trade.requested] = (Number(senderBag[trade.requested]) || 0) + 1
    delete rpg.collectionTrade
    await saveDB(db)
    return m.reply(`✅ Pertukaran berhasil: ${findItem(trade.offered)?.name} ↔ ${findItem(trade.requested)?.name}.`)
  }

  const target = normalizeJid(m.mentionedJid?.[0] || m.quoted?.sender)
  if (target) {
    const other = getUserRPG(db, target)
    const bag = other?.rpg?.mallInventory || {}
    const display = MALL_CATEGORIES.koleksi.items.filter(item => Number(bag[item.id]) > 0)
    const showcase = other?.rpg?.collectionShowcase || []
    return m.reply(`📚 *KOLEKSI @${target.split('@')[0]}*\n${display.length ? display.map(item =>
      `• ${displayName(item)} x${bag[item.id]}${showcase.includes(item.id) ? ' 🖼️' : ''}`
    ).join('\n') : 'Belum ada koleksi.'}`, null, { mentions: [target] })
  }

  return m.reply(`Subcommand tidak dikenal. Gunakan ${prefix}cl untuk melihat menu Collection.`)
}

handler.help = ['cl', 'collection', 'koleksi']
handler.alias = ['collection', 'koleksi']
handler.tags = ['rpg']
handler.command = /^(cl|collection|koleksi)$/i

export default handler
