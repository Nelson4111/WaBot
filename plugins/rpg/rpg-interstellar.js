import {
  sendRpgButtons,
  sendRpgConfirmButtons,
  sendRpgRegistrationPrompt
} from '../../lib/rpgActionButtons.js'
import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { formatRpgMoney, parseRpgMoneyAmount } from '../../lib/rpgMoney.js'
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

const STELLAR_EXCHANGE_RATE = 500_000_000_000_000
const STELLAR_EXCHANGE_CONFIRMATION_TTL = 2 * 60 * 1000

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

function formatInventory(items, prefix, stellarCredit) {
  if (!items.length) {
    return `╭─❏「 🎒 INTERSTELLAR INVENTORY 」❏\n` +
      `│ 💠 Stellar Credit: ${stellarCredit.toLocaleString()}\n` +
      `│ Inventory antarbintangmu masih kosong.\n` +
      `│ Gunakan *${prefix}explore* untuk mencari item.\n` +
      `╰─━━━━━━━━━━━━━━─`
  }

  return `╭─❏「 🎒 INTERSTELLAR INVENTORY 」❏\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `💠 Stellar Credit: ${stellarCredit.toLocaleString()}\n\n` +
    items.map((item, index) =>
      `> ${index + 1}. ${item.name} ×${item.quantity}`
    ).join('\n\n') +
    `\n\n💡 Jual dengan *${prefix}int sell <all/nomor/nama item>*.`
}

let handler = async (m, { conn, groupMetadata, text = '', usedPrefix, command }) => {
  const db = loadDB()
  const prefix = usedPrefix || '.'
  const root = String(command || '').toLowerCase()
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const mode = root === 'invst'
    ? 'inventory'
    : ['intercred', 'isc', 'interstellarcredit'].includes(root)
      ? 'credit'
      : String(args.shift() || '').toLowerCase()

  if (mode === 'guide') {
    return m.reply(
      `╭─❏「 📖 INTERSTELLAR GUIDE 」❏\n` +
      `│ 📖 *PANDUAN ANTARBINTANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Gunakan *${prefix}explore* untuk mengunjungi planet dan menemukan item antarbintang.\n` +
      `> ↳ Item temuan masuk ke inventory Interstellar dan bisa ditukar menjadi Stellar Credit.\n` +
      `> ↳ Planet yang dikunjungi mendapat nomor dimensi acak; daftar planet tidak menampilkan dimensi.\n\n` +
      `> ↳ Cek saldo: *${prefix}intercred* / *${prefix}isc* / *${prefix}interstellarcredit*.\n` +
      `> ↳ Gift: tag dengan *${prefix}int gift sc @tag <nominal>* atau reply dengan *${prefix}int gift sc <nominal>*.\n\n` +
      `> ↳ Tukar uang saku: *${prefix}int exchange <nominal/all>*; format sufiks mengikuti uang RPG, misalnya *500T* = *1 Stellar Credit*.\n` +
      `> ↳ Opsi *all* hanya memakai uang saku yang tersedia; saldo bank tidak ikut dihitung. Pertukaran selalu perlu konfirmasi.\n` +
      `> ↳ Stellar Credit tidak dapat ditukar kembali menjadi uang RPG.\n\n` +
      `📌 *COMMAND*\n` +
      `> ↳ *${prefix}int* — pusat Interstellar\n` +
      `> ↳ *${prefix}invst* — cek inventory antarbintang\n` +
      `> ↳ *${prefix}intercred* — cek saldo Stellar Credit\n` +
      `> ↳ *${prefix}int gift sc/stellar/credit <tag/reply> <nominal>* — kirim Stellar Credit\n` +
      `> ↳ *${prefix}int exchange/tukar <nominal/all>* — tukar uang saku menjadi Stellar Credit\n` +
      `> ↳ *${prefix}int exchange confirm/cancel* — konfirmasi atau batalkan pertukaran\n` +
      `> ↳ *${prefix}int sell <all/nomor/nama item>* — jual item\n` +
      `> ↳ *${prefix}int planet* — daftar planet\n` +
      `> ↳ *${prefix}int top* — leaderboard Stellar Credit\n` +
      `> ↳ *${prefix}int command* — daftar command\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'command') {
    const fallbackText =
      `╭─❏「 📋 INTERSTELLAR COMMAND 」❏\n` +
      `│ 📋 *DAFTAR COMMAND*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${prefix}explore* — jelajahi planet dan cari item\n` +
      `> ↳ *${prefix}invst* — lihat inventory item Interstellar\n` +
      `> ↳ *${prefix}intercred* — cek saldo Stellar Credit\n` +
      `> ↳ *${prefix}int gift sc/stellar/credit <tag/reply> <nominal>* — kirim Stellar Credit\n` +
      `> ↳ *${prefix}int exchange/tukar <nominal/all>* — tukar uang saku menjadi Stellar Credit\n` +
      `> ↳ *${prefix}int exchange confirm/cancel* — konfirmasi atau batalkan pertukaran\n` +
      `> ↳ *${prefix}int sell all* — jual semua item\n` +
      `> ↳ *${prefix}int sell <nomor/nama item>* — jual item tertentu\n` +
      `> ↳ *${prefix}int planet* — lihat daftar planet\n` +
      `> ↳ *${prefix}int top* — lihat pemilik Stellar Credit terbanyak\n` +
      `> ↳ *${prefix}int guide* — panduan Interstellar\n\n` +
      `─━━━━━━━━━━━━━━─`
    const rows = [
      { title: '🌌 Jelajahi planet', description: 'Temukan planet, item, dan petualangan baru', id: `${prefix}explore` },
      { title: '🎒 Tas antarbintang', description: 'Lihat item yang berhasil kamu kumpulkan', id: `${prefix}invst` },
      { title: '💠 Saldo Stellar Credit', description: 'Periksa mata uang antarbintangmu', id: `${prefix}intercred` },
      { title: '🎁 Kirim Stellar Credit', description: 'Berbagi saldo dengan pemain lain', id: `${prefix}int gift sc` },
      { title: '💱 Tukar uang saku', description: 'Konversi uang RPG menjadi Stellar Credit', id: `${prefix}int exchange` },
      { title: '💰 Jual semua item', description: 'Tukar seluruh hasil jelajah menjadi kredit', id: `${prefix}int sell all` },
      { title: '🪐 Daftar planet', description: 'Pilih dunia yang ingin kamu kenali', id: `${prefix}int planet` },
      { title: '🏆 Peringkat kredit', description: 'Lihat penjelajah dengan saldo tertinggi', id: `${prefix}int top` },
      { title: '📖 Panduan antarbintang', description: 'Pelajari sistem Interstellar', id: `${prefix}int guide` }
    ]
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: '🌌 INTERSTELLAR',
      subtitle: 'Pilih perjalananmu di antara bintang',
      text: 'Jelajahi dunia baru, kumpulkan relik, dan bangun kekayaan Stellar Credit.',
      buttonText: '🌌 BUKA MENU ANTARBINTANG',
      sections: [{ title: 'Ekspedisi antarbintang', rows }],
      fallbackText
    })
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

  if (!['', 'inventory', 'sell', 'credit', 'gift', 'exchange', 'tukar'].includes(mode)) {
    return m.reply(`Subcommand tidak dikenal. Ketik *${prefix}int command* untuk melihat panduan.`)
  }

  if (!mode) {
    return m.reply(
      `╭─❏「 🌌 INTERSTELLAR 」❏\n` +
      `│ 🌌 *PUSAT ANTARBINTANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Jelajahi planet, kumpulkan item, lalu tukarkan item menjadi Stellar Credit.\n` +
      `> ↳ Gunakan *${prefix}explore* untuk memulai penjelajahan.\n\n` +
      `> ↳ Tukar uang saku dengan *${prefix}int exchange <nominal/all>* — setiap *500T* menjadi *1 Stellar Credit*.\n\n` +
      `📌 *MENU*\n` +
      `> ↳ *${prefix}invst* — inventory antarbintang\n` +
      `> ↳ *${prefix}intercred* — cek saldo Stellar Credit\n` +
      `> ↳ *${prefix}int gift sc/stellar/credit <tag/reply> <nominal>* — kirim Stellar Credit\n` +
      `> ↳ *${prefix}int sell <all/nomor/nama>* — jual item\n` +
      `> ↳ *${prefix}int planet* — daftar planet\n` +
      `> ↳ *${prefix}int top* — leaderboard Stellar Credit\n` +
      `> ↳ *${prefix}int guide* / *${prefix}int command* — panduan\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) {
    return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')
  }

  const rpg = account.rpg
  rpg.inventory = rpg.inventory && typeof rpg.inventory === 'object' ? rpg.inventory : {}
  const items = getOwnedItems(rpg)
  const stellarCredit = Number(rpg.stellarCredit) || 0

if (mode === 'exchange' || mode === 'tukar') {
    const exchangeAction = String(args[0] || '').toLowerCase()
    const pending = rpg.pendingStellarExchange

    if (['confirm', 'konfirmasi', 'ya'].includes(exchangeAction)) {
      if (!pending || !Number.isFinite(Number(pending.expiresAt)) ||
        Number(pending.expiresAt) <= Date.now()) {
        delete rpg.pendingStellarExchange
        await saveDB(db)
        return m.reply(
          `╭─❏「 ⏳ KONFIRMASI PERTUKARAN 」❏\n` +
          `│ 💱 Tidak ada pertukaran yang menunggu persetujuan.\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `📝 *AJUKAN PERTUKARAN*\n` +
          `> ↳ ${prefix}int exchange <nominal/all>`
        )
      }

      const wallet = Number(db.money[m.sender]) || 0
      if (!Number.isInteger(pending.moneyAmount) || !Number.isInteger(pending.creditAmount) ||
        pending.moneyAmount <= 0 || pending.creditAmount <= 0 ||
        wallet < pending.moneyAmount) {
        delete rpg.pendingStellarExchange
        await saveDB(db)
        return m.reply(
          `╭─❏「 ❌ SALDO BERUBAH 」❏\n` +
          `│ 💰 Uang saku yang tersedia tidak lagi cukup untuk pertukaran ini.\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `💵 *Saldo Uang Saku:* ${formatRpgMoney(wallet)}\n\n` +
          `📝 *AJUKAN PERTUKARAN BARU*\n` +
          `> ↳ ${prefix}int exchange <nominal/all>`
        )
      }

      delete rpg.pendingStellarExchange
      db.money[m.sender] = wallet - pending.moneyAmount
      rpg.stellarCredit = (Number(rpg.stellarCredit) || 0) + pending.creditAmount
      await saveDB(db)
      return m.reply(
        `╭─❏「 💱 PERTUKARAN BERHASIL 」❏\n` +
        `│ 💠 STELLAR CREDIT EXCHANGE\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `💵 *Uang Saku Ditukar:* ${formatRpgMoney(pending.moneyAmount)}\n` +
        `💠 *Stellar Credit Didapat:* +${pending.creditAmount.toLocaleString()} SC\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `💰 *Sisa Uang Saku:* ${formatRpgMoney(wallet - pending.moneyAmount)}\n` +
        `💠 *Saldo Stellar Credit:* ${rpg.stellarCredit.toLocaleString()} SC`
      )
    }

    if (['batal', 'cancel', 'tidak'].includes(exchangeAction)) {
      if (!pending) {
        return m.reply(
          `╭─❏「 ↩️ PERTUKARAN DIBATALKAN 」❏\n` +
          `│ Tidak ada pertukaran yang menunggu konfirmasi.\n` +
          `╰─━━━━━━━━━━━━━━─`
        )
      }
      delete rpg.pendingStellarExchange
      await saveDB(db)
      return m.reply(
        `╭─❏「 ↩️ PERTUKARAN DIBATALKAN 」❏\n` +
        `│ 💱 Pertukaran berhasil dibatalkan.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Saldo uang saku dan Stellar Credit tidak berubah.`
      )
    }

    const amountInput = args[0]
    const wallet = Number(db.money[m.sender]) || 0
    let requestedAmount
    if (String(amountInput || '').toLowerCase() === 'all') {
      requestedAmount = Math.floor(wallet / STELLAR_EXCHANGE_RATE) * STELLAR_EXCHANGE_RATE
    } else {
      requestedAmount = parseRpgMoneyAmount(amountInput)
      if (requestedAmount === null) {
        return m.reply(
          `╭─❏「 💱 PERTUKARAN STELLAR CREDIT 」❏\n` +
          `│ 💠 Tukarkan uang saku menjadi Stellar Credit.\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `📝 *FORMAT PENGGUNAAN*\n` +
          `> ↳ ${prefix}int exchange <nominal/all>\n\n` +
          `📌 *CONTOH*\n` +
          `> ↳ ${prefix}int exchange 1Qa\n` +
          `> ↳ ${prefix}int tukar all\n\n` +
          `💱 *NILAI TUKAR*\n` +
          `> ↳ Setiap 500T uang saku menjadi 1 Stellar Credit.`
        )
      }
      if (requestedAmount > wallet) {
        return m.reply(
          `╭─❏「 ❌ SALDO TIDAK CUKUP 」❏\n` +
          `│ 💰 Uang saku tidak mencukupi untuk pertukaran.\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `💵 *Saldo Tersedia:* ${formatRpgMoney(wallet)}`
        )
      }
    }

    const creditAmount = Math.floor(requestedAmount / STELLAR_EXCHANGE_RATE)
    const moneyAmount = creditAmount * STELLAR_EXCHANGE_RATE
    if (!Number.isInteger(moneyAmount) || !Number.isInteger(creditAmount) || creditAmount < 1) {
      return m.reply(
        `╭─❏「 ❌ NOMINAL TIDAK VALID 」❏\n` +
        `│ 💱 Nominal pertukaran belum memenuhi batas minimum.\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *MINIMUM PERTUKARAN*\n` +
        `> ↳ ${formatRpgMoney(STELLAR_EXCHANGE_RATE)} untuk 1 Stellar Credit.\n\n` +
        `💰 *Saldo Uang Saku:* ${formatRpgMoney(wallet)}`
      )
    }

    rpg.pendingStellarExchange = {
      moneyAmount,
      creditAmount,
      expiresAt: Date.now() + STELLAR_EXCHANGE_CONFIRMATION_TTL
    }
    await saveDB(db)
    return sendRpgConfirmButtons(conn, m, {
      text:
        `╭─❏「 💱 KONFIRMASI PERTUKARAN 」❏\n` +
        `│ 💠 PERTUKARAN UANG SAKU KE STELLAR CREDIT\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `💵 *Uang Saku Ditukar:* ${formatRpgMoney(moneyAmount)}\n` +
        `💠 *Stellar Credit Diterima:* ${creditAmount.toLocaleString()} SC\n` +
        `💱 *Nilai Tukar:* ${formatRpgMoney(STELLAR_EXCHANGE_RATE)} = 1 SC\n` +
        `💰 *Sisa Uang Saku:* ${formatRpgMoney(wallet - moneyAmount)}\n\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `📌 *INFORMASI*\n` +
        `> ↳ Saldo bank tidak ikut ditukar.\n` +
        `> ↳ Persetujuan berlaku selama 2 menit.`,
      title: '💱 PERTUKARAN ANTARBINTANG',
      subtitle: 'Pastikan nominal sebelum menukar uang saku',
      acceptText: '💠 Tukar Sekarang',
      acceptCommand: `${prefix}int exchange confirm`,
      cancelText: '↩️ Batalkan',
      cancelCommand: `${prefix}int exchange cancel`,
      noThumbnail: true
    })
  }

  if (mode === 'inventory') {
    return m.reply(formatInventory(items, prefix, stellarCredit))
  }

  if (mode === 'credit') {
    return m.reply(`💠 Stellar Credit kamu: *${stellarCredit.toLocaleString()}*`)
  }

  if (mode === 'gift') {
    const giftArgs = args.map(arg => arg.trim())
    const creditAliases = ['sc', 'stellar', 'credit']
    if (!creditAliases.includes(String(giftArgs[0] || '').toLowerCase())) {
      return m.reply(`Format: *${prefix}int gift <sc/stellar/credit> <tag/reply> <nominal>*`)
    }

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    const amountInput = m.mentionedJid?.length
      ? giftArgs.slice(2).find(arg => !arg.startsWith('@'))
      : m.quoted
        ? giftArgs[1]
        : giftArgs[2]
    const amount = Number(amountInput)
    if (!target || !Number.isSafeInteger(amount) || amount < 1) {
      return m.reply(
        `Format:\n` +
        `> Tag: *${prefix}int gift sc @tag <nominal>*\n` +
        `> Reply: *${prefix}int gift sc <nominal>*`
      )
    }
    if (target === m.sender) return m.reply('❌ Tidak bisa mengirim Stellar Credit ke diri sendiri.')
    const targetAccount = getUserRPG(db, target)
    if (!targetAccount?.rpg) return m.reply('❌ Target belum memiliki data RPG.')
    if (stellarCredit < amount) return m.reply('❌ Stellar Credit kamu tidak cukup.')

    rpg.stellarCredit = stellarCredit - amount
    targetAccount.rpg.stellarCredit = (Number(targetAccount.rpg.stellarCredit) || 0) + amount
    await saveDB(db)
    return m.reply(
      `╭─❏「 💠 STELLAR CREDIT GIFT 」❏\n` +
      `│ Berhasil mengirim *${amount.toLocaleString()} Stellar Credit* ke @${target.split('@')[0]}.\n` +
      `│ Saldo kamu: ${rpg.stellarCredit.toLocaleString()} 💠\n` +
      `╰─━━━━━━━━━━━━━━─`,
      null,
      { mentions: [target] }
    )
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

handler.help = [
  'interstellar',
  'int',
  'int exchange <nominal/all>',
  'int exchange confirm',
  'int exchange cancel',
  'invst',
  'intercred',
  'isc',
  'interstellarcredit'
]
handler.tags = ['rpg']
handler.command = /^(interstellar|int|invst|intercred|isc|interstellarcredit)$/i
handler.group = true

export default handler
