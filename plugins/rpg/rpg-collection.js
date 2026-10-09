import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import {
  COLLECTION_SHOWCASE_LIMIT,
  MALL_CATEGORIES,
  MALL_PREMIUM_DISCOUNT
} from '../../lib/rpgMallData.js'
import { AUCTION_ITEMS } from '../../lib/rpg-auctionData.js'
import { BANK_SPECIAL_ITEMS } from '../../lib/rpg-bankData.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

const money = value => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
const displayName = item => `${item.emoji} ${item.name}`
const collectionItems = [...MALL_CATEGORIES.koleksi.items, ...AUCTION_ITEMS, ...BANK_SPECIAL_ITEMS]
const allItems = Object.entries(MALL_CATEGORIES).flatMap(([category, data]) =>
  data.items.map(item => ({ ...item, category }))
).concat(AUCTION_ITEMS, BANK_SPECIAL_ITEMS)

function findItem(input, category) {
  const key = normalize(input)
  if (!key) return null
  const candidates = category
    ? (category === 'koleksi' ? collectionItems : MALL_CATEGORIES[category]?.items || []).map(item => ({ ...item, category }))
    : allItems
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

let handler = async (m, { conn, text = '', usedPrefix, command, groupMetadata }) => {
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

if (!mode) {
  const totalOwned = collectionItems.reduce((sum, item) =>
    sum + (Number(inventory[item.id]) || 0), 0
  )

  return m.reply(
    `╭─❏「 📚 COLLECTION / KOLEKSI 」❏\n` +
    `│ 📚 *COLLECTION / KOLEKSI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Lihat, pamerkan, hadiahkan, atau tukarkan item koleksi.\n` +
    `> ↳ Kamu memiliki *${totalOwned} koleksi*.\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ *${prefix}cl guide*\n` +
    `> ↳ *${prefix}cl command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'guide') {
  return m.reply(
    `╭─❏「 📖 COLLECTION GUIDE 」❏\n` +
    `│ 📖 *PANDUAN KOLEKSI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Koleksi dapat dibeli melalui Mall, ditandai sebagai favorit, dipamerkan di profil, dilihat milik pemain lain, atau dipertukarkan/dihadiahkan.\n` +
    `> ↳ Premium mendapat diskon 20% saat membeli koleksi di Mall.\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Lihat daftar perintah : *${prefix}cl command*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'command') {
  return m.reply(
    `╭─❏「 📋 COLLECTION COMMAND 」❏\n` +
    `│ 📋 *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📚 *KOLEKSI*\n` +
    `> ↳ ${prefix}cl list — daftar koleksimu\n` +
    `> ↳ ${prefix}cl info <item> — detail koleksi\n` +
    `> ↳ ${prefix}cl kategori — daftar item koleksi\n` +
    `> ↳ ${prefix}cl top — top kolektor\n` +
    `> ↳ ${prefix}cl favorite <item> — tandai favorit\n` +
    `> ↳ ${prefix}cl showcase [item] — lihat/tambah pameran\n` +
    `> ↳ ${prefix}cl unshowcase <item> — hapus dari pameran\n\n` +
    `👥 *INTERAKSI*\n` +
    `> ↳ ${prefix}cl @user — lihat koleksi pemain\n` +
    `> ↳ ${prefix}cl hadiah @user <item> — hadiahkan koleksi\n` +
    `> ↳ ${prefix}cl tukar @user <koleksimu> <koleksinya> — ajukan tukar\n` +
    `> ↳ ${prefix}cl terima — jawab permintaan tukar\n` +
    `> ↳ ${prefix}cl tolak — tolak permintaan tukar\n\n` +
    `🛒 *PEMBELIAN*\n` +
    `> ↳ Beli koleksi : ${prefix}mall koleksi list\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'kategori') {
  return m.reply(
    `╭─❏「 🗂️ KATEGORI KOLEKSI 」❏\n` +
    `│ 🗂️ *DAFTAR ITEM KOLEKSI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${collectionItems.map(item =>
      `📚 *${displayName(item)}*\n` +
      `> ↳ Harga : ${money(item.price)}`
    ).join('\n\n')}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'info') {
  const item = findItem(tokens.slice(1).join(' '), 'koleksi')

  if (!item) {
    return m.reply(
      `╭─❏「 🔎 INFO KOLEKSI 」❏\n` +
      `│ ❌ *ITEM TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Item koleksi tidak ditemukan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 🔎 INFO KOLEKSI 」❏\n` +
    `│ 🔎 *${displayName(item)}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Harga Mall : ${money(Math.floor(item.price * (premium ? 1 - MALL_PREMIUM_DISCOUNT : 1)))}\n` +
    `> ↳ Harga jual : ${money(item.sellPrice)}\n` +
    `> ↳ Dimiliki : ${inventory[item.id] || 0}\n` +
    `> ↳ Favorit : ${(rpg.collectionFavorites || []).includes(item.id) ? 'Ya' : 'Tidak'}\n` +
    `> ↳ Dipamerkan : ${(rpg.collectionShowcase || []).includes(item.id) ? 'Ya' : 'Tidak'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'list') {
  const ownedCollections = collectionItems.filter(item => Number(inventory[item.id]) > 0)

  return m.reply(
    `╭─❏「 📚 KOLEKSI DIMILIKI 」❏\n` +
    `│ 📚 *KOLEKSI MILIKMU*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${ownedCollections.length ? ownedCollections.map(item =>
      `📚 *${displayName(item)}* x${inventory[item.id]}` +
      `${(rpg.collectionFavorites || []).includes(item.id) ? ' ⭐' : ''}` +
      `${(rpg.collectionShowcase || []).includes(item.id) ? ' 🖼️' : ''}`
    ).join('\n') : '> ↳ Belum ada item koleksi.'}\n\n` +
    `📌 *INFORMASI*\n` +
    `> ↳ Beli koleksi di *${prefix}mall koleksi list*.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'top') {
  const ranked = filterLeaderboardUsers(Object.entries(db.users || {}), conn, ([jid]) => jid)
    .filter(([, user]) => user?.rpg)
    .map(([jid, user]) => {
      const bag = user.rpg.mallInventory || {}
      return {
        jid,
        name: user.name || '',
        count: collectionItems.reduce((sum, item) =>
          sum + (Number(bag[item.id]) || 0), 0
        )
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const mentions = []
  const rows = ranked.map((entry, index) => {
    const identity = getLeaderboardUserIdentity(entry.jid, {
      conn,
      groupMetadata,
      name: entry.name
    })
    if (identity.mention) mentions.push(identity.mention)
    return `🏆 *${index + 1}. ${identity.display}*\n> ↳ Koleksi : ${entry.count}`
  }).join('\n\n')

  return m.reply(
    `╭─❏「 🏆 TOP KOLEKTOR 」❏\n` +
    `│ 🏆 *TOP KOLEKTOR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${rows || '> ↳ Belum ada kolektor.'}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    { mentions }
  )
}

if (mode === 'favorite') {
  const item = findItem(tokens.slice(1).join(' '), 'koleksi')

  if (!item) {
    return m.reply(
      `╭─❏「 ⭐ FAVORIT KOLEKSI 」❏\n` +
      `│ ❌ *ITEM TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Item koleksi tidak ditemukan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if ((Number(inventory[item.id]) || 0) < 1) {
    return m.reply(
      `╭─❏「 ⭐ FAVORIT KOLEKSI 」❏\n` +
      `│ ❌ *KOLEKSI TIDAK DIMILIKI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu hanya bisa memfavoritkan koleksi yang dimiliki.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!rpg.collectionFavorites.includes(item.id)) rpg.collectionFavorites.push(item.id)

  await saveDB(db)

  return m.reply(
    `╭─❏「 ⭐ FAVORIT KOLEKSI 」❏\n` +
    `│ ⭐ *DITANDAI SEBAGAI FAVORIT*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${item.name} ditandai sebagai favorit.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'showcase' || mode === 'unshowcase') {
  const itemInput = tokens.slice(1).join(' ')

  if (!itemInput) {
    return m.reply(
      `╭─❏「 🖼️ KOLEKSI PAMERAN 」❏\n` +
      `│ 🖼️ *KOLEKSI YANG DIPAMERKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${rpg.collectionShowcase.length ? rpg.collectionShowcase.map(id =>
        `🖼️ *${findItem(id)?.name || id}*`
      ).join('\n') : '> ↳ Belum ada item dipamerkan.'}\n\n` +
      `📌 *CARA MENAMBAHKAN*\n` +
      `> ↳ ${prefix}cl showcase <item>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const item = findItem(itemInput, 'koleksi')

  if (!item) {
    return m.reply(
      `╭─❏「 🖼️ KOLEKSI PAMERAN 」❏\n` +
      `│ ❌ *ITEM TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Item koleksi tidak ditemukan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'showcase') {
    if ((Number(inventory[item.id]) || 0) < 1) {
      return m.reply(
        `╭─❏「 🖼️ KOLEKSI PAMERAN 」❏\n` +
        `│ ❌ *KOLEKSI TIDAK DIMILIKI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu hanya bisa memamerkan koleksi yang dimiliki.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (!rpg.collectionShowcase.includes(item.id) && rpg.collectionShowcase.length >= COLLECTION_SHOWCASE_LIMIT) {
      return m.reply(
        `╭─❏「 🖼️ KOLEKSI PAMERAN 」❏\n` +
        `│ ❌ *PAMERAN PENUH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Batas pameran : ${COLLECTION_SHOWCASE_LIMIT} item.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (!rpg.collectionShowcase.includes(item.id)) rpg.collectionShowcase.push(item.id)
  } else {
    rpg.collectionShowcase = rpg.collectionShowcase.filter(id => id !== item.id)
  }

  await saveDB(db)

  return m.reply(
    `╭─❏「 🖼️ KOLEKSI PAMERAN 」❏\n` +
    `│ ✅ *${mode === 'showcase' ? 'DITAMBAHKAN KE PAMERAN' : 'DIHAPUS DARI PAMERAN'}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${item.name} ${mode === 'showcase' ? 'ditambahkan ke' : 'dihapus dari'} pameran.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'hadiah' || mode === 'tukar') {
  const { target, args } = mentionsOrReply(m, tokens.slice(1))

  if (!target || target === sender) {
    return m.reply(
      `╭─❏「 🎁 INTERAKSI KOLEKSI 」❏\n` +
      `│ ❌ *TARGET TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tag pemain lain.\n` +
      `> ↳ Contoh : *${prefix}cl ${mode} @user <item>*\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const targetUser = getUserRPG(db, target)

  if (!targetUser?.rpg) {
    return m.reply(
      `╭─❏「 🎁 INTERAKSI KOLEKSI 」❏\n` +
      `│ ❌ *DATA RPG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Target belum memiliki data RPG.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const receiverBag = getCollection(targetUser.rpg)

  if (mode === 'hadiah') {
    const item = findItem(args.join(' '), 'koleksi')

    if (!item) {
      return m.reply(
        `╭─❏「 🎁 HADIAH KOLEKSI 」❏\n` +
        `│ ❌ *ITEM TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Sebutkan item koleksi yang valid.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if ((Number(inventory[item.id]) || 0) < 1) {
      return m.reply(
        `╭─❏「 🎁 HADIAH KOLEKSI 」❏\n` +
        `│ ❌ *KOLEKSI TIDAK DIMILIKI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu tidak memiliki ${item.name}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    inventory[item.id]--
    if (!inventory[item.id]) delete inventory[item.id]

    clearCollectionFlagsWhenUnowned(rpg, item.id)

    receiverBag[item.id] = (Number(receiverBag[item.id]) || 0) + 1

    await saveDB(db)

    return m.reply(
      `╭─❏「 🎁 HADIAH KOLEKSI 」❏\n` +
      `│ 🎁 *HADIAH BERHASIL DIKIRIM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Item : ${item.name}\n` +
      `> ↳ Penerima : @${target.split('@')[0]}\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
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

  if (!requested) {
    return m.reply(
      `╭─❏「 🔄 TUKAR KOLEKSI 」❏\n` +
      `│ ❌ *FORMAT TUKAR TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Format : ${prefix}cl tukar @user <koleksi-kamu> <koleksi-yang-diminta>.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if ((Number(inventory[offered.id]) || 0) < 1) {
    return m.reply(
      `╭─❏「 🔄 TUKAR KOLEKSI 」❏\n` +
      `│ ❌ *KOLEKSI TIDAK DIMILIKI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu tidak memiliki ${offered.name}.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if ((Number(receiverBag[requested.id]) || 0) < 1) {
    return m.reply(
      `╭─❏「 🔄 TUKAR KOLEKSI 」❏\n` +
      `│ ❌ *KOLEKSI TARGET TIDAK TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Target tidak memiliki ${requested.name}.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (targetUser.rpg.collectionTrade) {
    return m.reply(
      `╭─❏「 🔄 TUKAR KOLEKSI 」❏\n` +
      `│ ⚠️ *MASIH ADA PERMINTAAN AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Target masih memiliki permintaan tukar yang belum dijawab.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  targetUser.rpg.collectionTrade = {
    from: sender,
    offered: offered.id,
    requested: requested.id,
    createdAt: Date.now()
  }

  await saveDB(db)

  return m.reply(
    `╭─❏「 🔄 TUKAR KOLEKSI 」❏\n` +
    `│ 🔄 *PERMINTAAN TUKAR DIKIRIM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${offered.name} ↔ ${requested.name}\n` +
    `> ↳ @${target.split('@')[0]} dapat memakai *${prefix}cl terima* atau *${prefix}cl tolak*.\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [target] }
  )
}

if (mode === 'terima' || mode === 'tolak') {
  const trade = rpg.collectionTrade

  if (!trade || Date.now() - trade.createdAt > 600000) {
    delete rpg.collectionTrade
    await saveDB(db)

    return m.reply(
      `╭─❏「 🔄 PERMINTAAN TUKAR 」❏\n` +
      `│ ❌ *PERMINTAAN TIDAK AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ada permintaan tukar aktif.\n` +
      `> ↳ Permintaan berlaku selama 10 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const senderUser = getUserRPG(db, trade.from)

  if (mode === 'tolak') {
    delete rpg.collectionTrade
    await saveDB(db)

    return m.reply(
      `╭─❏「 🔄 PERMINTAAN TUKAR 」❏\n` +
      `│ ❌ *PERTUKARAN DITOLAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Permintaan tukar ditolak.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const senderBag = getCollection(senderUser?.rpg || {})

  if (!senderUser?.rpg ||
      (Number(senderBag[trade.offered]) || 0) < 1 ||
      (Number(inventory[trade.requested]) || 0) < 1) {
    delete rpg.collectionTrade
    await saveDB(db)

    return m.reply(
      `╭─❏「 🔄 PERTUKARAN GAGAL 」❏\n` +
      `│ ❌ *STOK ITEM BERUBAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pertukaran dibatalkan karena stok salah satu item sudah berubah.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  senderBag[trade.offered]--
  clearCollectionFlagsWhenUnowned(senderUser.rpg, trade.offered)

  inventory[trade.offered] = (Number(inventory[trade.offered]) || 0) + 1

  inventory[trade.requested]--
  clearCollectionFlagsWhenUnowned(rpg, trade.requested)

  senderBag[trade.requested] = (Number(senderBag[trade.requested]) || 0) + 1

  delete rpg.collectionTrade

  await saveDB(db)

  return m.reply(
    `╭─❏「 🔄 PERTUKARAN BERHASIL 」❏\n` +
    `│ ✅ *PERTUKARAN BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${findItem(trade.offered)?.name} ↔ ${findItem(trade.requested)?.name}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const target = normalizeJid(m.mentionedJid?.[0] || m.quoted?.sender)

if (target) {
  const other = getUserRPG(db, target)
  const bag = other?.rpg?.mallInventory || {}
  const display = collectionItems.filter(item => Number(bag[item.id]) > 0)
  const showcase = other?.rpg?.collectionShowcase || []

  return m.reply(
    `╭─❏「 📚 KOLEKSI PEMAIN 」❏\n` +
    `│ 📚 *KOLEKSI @${target.split('@')[0]}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${display.length ? display.map(item =>
      `📚 *${displayName(item)}* x${bag[item.id]}${showcase.includes(item.id) ? ' 🖼️' : ''}`
    ).join('\n') : '> ↳ Belum ada koleksi.'}\n\n` +
    `─━━━━━━━━━━━━━━─`,
    null,
    { mentions: [target] }
  )
}

return m.reply(
  `╭─❏「 📚 COLLECTION 」❏\n` +
  `│ ❌ *COMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Gunakan *${prefix}cl guide* untuk panduan.\n` +
  `> ↳ Gunakan *${prefix}cl command* untuk daftar command.\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['cl', 'collection', 'koleksi']
handler.alias = ['collection', 'koleksi']
handler.tags = ['rpg']
handler.command = /^(cl|collection|koleksi)$/i

export default handler
