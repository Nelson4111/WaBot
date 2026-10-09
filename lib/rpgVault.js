import { saveDB } from './waifuHelper.js'
import { AUCTION_ITEMS } from './rpg-auctionData.js'
import { MALL_CATEGORIES } from './rpgMallData.js'
import { BANK_SPECIAL_ITEMS } from './rpg-bankData.js'

const VAULT_ITEMS = Object.entries(MALL_CATEGORIES).flatMap(([category, data]) =>
  data.items.map(item => ({ ...item, category }))
).concat(AUCTION_ITEMS, BANK_SPECIAL_ITEMS)

const normalize = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[\s-]+/g, '_')

function findVaultItem(input) {
  const query = normalize(input)
  if (!query) return null

  return VAULT_ITEMS.find(item => item.id === query || normalize(item.name) === query)
    || VAULT_ITEMS.find(item => normalize(item.name).includes(query))
}

export async function runRpgVault({ m, db, rpg, tier, args = [], usedPrefix = '.' }) {
  if (!tier.fasilitas.includes('Vault Pribadi')) {
    return m.reply(
      `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
      `│ 🔒 *AKSES VAULT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Vault Pribadi tersedia mulai *Black Card*.\n` +
      `> ↳ Upgrade kartu bank untuk membuka fasilitas penyimpanan barang dengan aman.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!rpg.bankVault || typeof rpg.bankVault !== 'object') rpg.bankVault = {}

  const action = String(args[0] || '').toLowerCase()

  if (!action || ['list', 'info'].includes(action)) {
    const contents = Object.entries(rpg.bankVault)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([itemId, quantity]) => {
        const item = VAULT_ITEMS.find(entry => entry.id === itemId)
        return `> • ${item ? `${item.emoji} ${item.name}` : itemId} ×${quantity}`
      })

    return m.reply(
      `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
      `│ ${tier.color} *${tier.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📦 *ISI VAULT*\n` +
      `${contents.length ? contents.join('\n') : '> ↳ Vault masih kosong.'}\n\n` +
      `🛡️ *FUNGSI VAULT*\n` +
      `> ↳ Barang yang disimpan aman dari penjarahan.\n` +
      `> ↳ Ambil kembali barang untuk dipasang di rumah atau dipajang sebagai koleksi.\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ ${usedPrefix}vault simpan <item> [jumlah]\n` +
      `> ↳ ${usedPrefix}vault ambil <item> [jumlah]\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!['simpan', 'deposit', 'ambil', 'tarik'].includes(action)) {
    return m.reply(
      `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
      `│ 📖 *PANDUAN PERINTAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📦 *PENYIMPANAN BARANG*\n` +
      `> ↳ ${usedPrefix}vault list\n` +
      `> ↳ ${usedPrefix}vault simpan <item> [jumlah]\n` +
      `> ↳ ${usedPrefix}vault ambil <item> [jumlah]\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const itemTokens = args.slice(1)
  const quantityToken = /^\d+$/.test(itemTokens[itemTokens.length - 1] || '') ? itemTokens.pop() : null
  const item = findVaultItem(itemTokens.join(' '))

  if (!item) {
    return m.reply(
      `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
      `│ ❌ *BARANG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Barang tidak ditemukan dalam daftar item Vault.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const quantity = quantityToken ? Number(quantityToken) : 1

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    return m.reply(
      `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
      `│ ❌ *JUMLAH TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Masukkan jumlah barang berupa bilangan bulat positif.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (item.category === 'furniture' && (rpg.home?.furniture || []).includes(item.id)) {
    return m.reply(
      `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
      `│ ❌ *FURNITURE SEDANG TERPASANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${item.emoji} ${item.name} sedang terpasang di rumah.\n` +
      `> ↳ Lepaskan terlebih dahulu menggunakan perintah:\n` +
      `> ↳ ${usedPrefix}home lepas <item>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!rpg.mallInventory || typeof rpg.mallInventory !== 'object') rpg.mallInventory = {}

  const isDeposit = ['simpan', 'deposit'].includes(action)

  if (isDeposit) {
    const owned = Number(rpg.mallInventory[item.id]) || 0

    if (owned < quantity) {
      return m.reply(
        `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
        `│ ❌ *STOK BARANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📦 *INFORMASI BARANG*\n` +
        `> ↳ Barang: ${item.emoji} ${item.name}\n` +
        `> ↳ Jumlah diminta: ${quantity}\n` +
        `> ↳ Jumlah dimiliki: ${owned}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    rpg.mallInventory[item.id] = owned - quantity
    rpg.bankVault[item.id] = (Number(rpg.bankVault[item.id]) || 0) + quantity
  } else {
    const stored = Number(rpg.bankVault[item.id]) || 0

    if (stored < quantity) {
      return m.reply(
        `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
        `│ ❌ *STOK VAULT TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📦 *INFORMASI BARANG*\n` +
        `> ↳ Barang: ${item.emoji} ${item.name}\n` +
        `> ↳ Jumlah diminta: ${quantity}\n` +
        `> ↳ Jumlah tersimpan: ${stored}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    rpg.bankVault[item.id] = stored - quantity
    rpg.mallInventory[item.id] = (Number(rpg.mallInventory[item.id]) || 0) + quantity
  }

  await saveDB(db)

  return m.reply(
    `╭─❏「 🔐 VAULT PRIBADI 」❏\n` +
    `│ ${isDeposit ? '📥 *BARANG BERHASIL DISIMPAN*' : '📤 *BARANG BERHASIL DIAMBIL*'}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📦 *DETAIL TRANSAKSI*\n` +
    `> ↳ Barang: ${item.emoji} ${item.name}\n` +
    `> ↳ Jumlah: ${quantity}×\n` +
    `> ↳ Status: ${isDeposit ? 'Disimpan ke Vault Pribadi' : 'Diambil dari Vault Pribadi'}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}