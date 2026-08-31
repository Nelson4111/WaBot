/**
 * CSM Shop & Sell Command Handlers
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { WEAPON_LIST, ITEM_LIST, calcBonus } from '../../../lib/rpg-libmyCSM.js'
import { header } from '../lib/utils.js'

export async function handleShop(ctx) {
  const { m, csm, wdb, userRPG, args } = ctx
  const sub = args[1]?.toLowerCase()
  const b = calcBonus(csm)

  if (sub === 'weapon') {
    const act = args[2]?.toLowerCase()

    if (act === 'beli' || act === 'buy') {
      const input = args.slice(3).join(' ').trim()
      if (!input) {
        return m.reply(header('PENGGUNAAN') + `.csm shop weapon buy <nomor/nama>\n━━━━━━━━━━━`)
      }

      let item = !isNaN(input)
        ? WEAPON_LIST[parseInt(input, 10) - 1]
        : WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())

      if (!item) return m.reply(header('SENJATA TIDAK ADA') + `━━━━━━━━━━━`)
      if (item.harga <= 0 && item.nama !== 'Fist') return m.reply(header('GRATIS') + `━━━━━━━━━━━`)

      const weaponPrice = Math.max(0, Math.floor(item.harga * (1 - b.discount)))

      if (csm.inventory.some(w => w.nama === item.nama)) {
        return m.reply(header('SUDAH PUNYA') + `Kamu sudah punya ${item.nama}\n━━━━━━━━━━━`)
      }

      if (userRPG.bank < weaponPrice) {
        return m.reply(header('SALDO KURANG') + `Butuh Rp ${weaponPrice.toLocaleString()}\nSaldo: Rp ${userRPG.bank.toLocaleString()}\n━━━━━━━━━━━`)
      }

      userRPG.bank -= weaponPrice
      csm.inventory.push({ nama: item.nama, dur: item.dur })
      saveDB(wdb)

      return m.reply(
        header('PEMBELIAN BERHASIL') +
        `${item.emoji} *${item.nama}* [T${item.tier}]\n` +
        `DMG: +${item.dmg}\n` +
        `DUR: ${item.dur}\n` +
        `-Rp ${weaponPrice.toLocaleString()}${b.discount > 0 ? ` [Diskon ${(b.discount * 100).toFixed(0)}%]` : ''}\n` +
        `━━━━━━━━━━━`
      )
    }

    if (act === 'info') {
      const input = args.slice(3).join(' ').trim()
      if (!input) {
        return m.reply(header('PENGGUNAAN') + `.csm shop weapon info <nomor/nama>\n━━━━━━━━━━━`)
      }

      let item = !isNaN(input)
        ? WEAPON_LIST[parseInt(input, 10) - 1]
        : WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())

      if (!item) return m.reply(header('SENJATA TIDAK ADA') + `━━━━━━━━━━━`)

      return m.reply(
        header(item.nama) +
        `${item.emoji} [TIER ${item.tier}]\n` +
        `Jenis: ${item.jenis}\n` +
        `DMG: +${item.dmg}\n` +
        `DUR: ${item.dur}\n` +
        `Harga: Rp ${item.harga.toLocaleString()}\n` +
        `User: ${item.user}\n` +
        `Material: ${item.material}\n\n` +
        `${item.desc}\n` +
        `━━━━━━━━━━━`
      )
    }

    let cap = header('TOKO WEAPON')
    cap += `Kelola senjata untuk meningkatkan kekuatan Devil Hunter.\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `💰 *SALDO*\n`
    cap += `> Bank: Rp ${userRPG.bank.toLocaleString()}\n`
    cap += `> Blood: ${csm.blood.toLocaleString()}\n\n`
    cap += `⚔️ *COMMAND*\n`
    cap += `> .csm shop weapon buy <nomor/nama>\n`
    cap += `> .csm shop weapon info <nomor/nama>\n`
    cap += `|━━━━━━━━━━━\n\n`

    WEAPON_LIST.forEach((w, i) => {
      cap += `*${i + 1}.* ${w.emoji} *${w.nama}* [T${w.tier}]\n`
      cap += `> Harga: Rp ${w.harga.toLocaleString()}\n\n`
    })

    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'item') {
    const act = args[2]?.toLowerCase()

    if (act === 'info') {
      const input = args.slice(3).join(' ').trim()
      if (!input) return m.reply(header('PENGGUNAAN') + `.csm shop item info <nomor/nama>\n━━━━━━━━━━━`)

      let item = !isNaN(input)
        ? ITEM_LIST[parseInt(input, 10) - 1]
        : ITEM_LIST.find(i => i.nama.toLowerCase() === input.toLowerCase())

      if (!item) {
        item = ITEM_LIST.find(i => i.nama.toLowerCase().includes(input.toLowerCase()))
      }

      if (!item) return m.reply(header('ITEM TIDAK ADA') + `━━━━━━━━━━━`)

      return m.reply(
        header(item.nama) +
        `${item.emoji} [TIER ${item.tier}]\n` +
        `Jenis: ${item.jenis}\n` +
        `Nilai Jual: Rp ${item.jual.toLocaleString()}\n` +
        `User: ${item.user}\n` +
        `Material: ${item.material}\n\n` +
        `${item.desc}\n` +
        `━━━━━━━━━━━`
      )
    }

    let cap = header('TOKO ITEM')
    cap += `Daftar item dan nilai jual yang tersedia.\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `💰 *SALDO*\n`
    cap += `> Bank: Rp ${userRPG.bank.toLocaleString()}\n`
    cap += `> Blood: ${csm.blood.toLocaleString()}\n\n`
    cap += `📦 *INFO ITEM*\n`
    cap += `> Item di toko ini tidak dapat dibeli.\n`
    cap += `> Harga yang tertera adalah harga jual.\n\n`
    cap += `🛒 *COMMAND*\n`
    cap += `> .csm shop item info <nomor/nama>\n`
    cap += `> .csm sell <nomor>\n`
    cap += `|━━━━━━━━━━━\n\n`

    ITEM_LIST.forEach((item, i) => {
      cap += `*${i + 1}.* ${item.emoji} *${item.nama}* [T${item.tier}]\n`
      cap += `> Harga Jual: Rp ${item.jual.toLocaleString()}\n\n`
    })

    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  let cap = header('TOKO')
  cap += `Kelola senjata, item, dan inventory Hunter.\n\n`
  cap += `|━━━━━━━━━━━\n`
  cap += `💰 *SALDO*\n`
  cap += `> Bank: Rp ${userRPG.bank.toLocaleString()}\n`
  cap += `> Blood: ${csm.blood.toLocaleString()}\n\n`
  cap += `🛒 *MENU TOKO*\n`
  cap += `> .csm shop weapon\n`
  cap += `> Beli senjata\n\n`
  cap += `> .csm shop item\n`
  cap += `> Lihat daftar item\n\n`
  cap += `> .csm jual/sell <nomor>\n`
  cap += `> Jual item dari inventory\n\n`
  cap += `|━━━━━━━━━━━`

  return m.reply(cap)
}

export async function handleSell(ctx) {
  const { m, csm, wdb, userRPG, args } = ctx

  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  const weaponEntries = []
  const itemEntries = []

  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon ? ITEM_LIST?.find(i => i.nama === inv.nama) : null

    if (weapon) {
      weaponEntries.push({ inv, inventoryIndex, data: weapon })
    } else if (item) {
      itemEntries.push({ inv, inventoryIndex, data: item })
    }
  })

  const entries = [...weaponEntries, ...itemEntries]
  const input = args[1]

  if (input?.toLowerCase() === 'all' && ['yes', 'no'].includes(args[2]?.toLowerCase())) {
    if (args[2].toLowerCase() === 'no') {
      csm.pendingSellAll = null
      saveDB(wdb)
      return m.reply(header('SELL ALL DIBATALKAN') + `Tidak ada item yang dijual.\n━━━━━━━━━━━`)
    }
    if (!csm.pendingSellAll) {
      return m.reply(header('KONFIRMASI KEDALUWARSA') + `Buat daftar penjualan lagi dengan *.csm sell all*.\n━━━━━━━━━━━`)
    }
    const sellable = csm.pendingSellAll.entries
    let total = 0
    sellable.forEach(entry => {
      total += WEAPON_LIST.some(weapon => weapon.nama === entry.data.nama)
        ? Math.floor((entry.data.harga || 0) / 2)
        : entry.data.jual || 0
    })
    const soldIndexes = new Set(sellable.map(entry => entry.inventoryIndex))
    csm.inventory = csm.inventory.filter((_, index) => !soldIndexes.has(index))
    userRPG.bank += total
    csm.pendingSellAll = null
    saveDB(wdb)
    return m.reply(header('SELL ALL BERHASIL') + `Terjual: ${sellable.length} item\nDapat: +Rp ${total.toLocaleString()} ke Bank\nWeapon aktif dan Fist tetap disimpan.\n━━━━━━━━━━━`)
  }

  if (input?.toLowerCase() === 'all') {
    const sellable = entries.filter(entry =>
      entry.data.nama !== 'Fist' && entry.data.nama !== csm.weapon?.nama
    )
    if (!sellable.length) return m.reply(header('INVENTORY TIDAK BISA DIJUAL') + `Tidak ada item atau weapon yang bisa dijual.\n━━━━━━━━━━━`)
    const total = sellable.reduce((sum, entry) => sum + (WEAPON_LIST.some(weapon => weapon.nama === entry.data.nama)
      ? Math.floor((entry.data.harga || 0) / 2)
      : entry.data.jual || 0), 0)
    csm.pendingSellAll = { entries: sellable.map(entry => ({ inventoryIndex: entry.inventoryIndex, data: entry.data })) }
    saveDB(wdb)
    const list = sellable.map((entry, index) => `${index + 1}. ${entry.data.emoji || '📦'} ${entry.data.nama} - Rp ${(WEAPON_LIST.some(weapon => weapon.nama === entry.data.nama) ? Math.floor((entry.data.harga || 0) / 2) : entry.data.jual || 0).toLocaleString()}`).join('\n')
    return m.reply(header('KONFIRMASI SELL ALL') + `Berikut item yang akan dijual:\n${list}\n\nTotal diterima: Rp ${total.toLocaleString()}\n\nKetik *.csm sell all yes* untuk melanjutkan atau *.csm sell all no* untuk membatalkan.\nWeapon aktif dan Fist tidak ikut dijual.\n━━━━━━━━━━━`)
  }

  if (!input) {
    return m.reply(
      header('PENGGUNAAN') +
      `.csm sell <nomor>\n.csm sell all\nLihat nomor di .csm inv\n━━━━━━━━━━━`
    )
  }

  const nomor = parseInt(input, 10)
  if (isNaN(nomor) || nomor < 1 || nomor > entries.length) {
    return m.reply(header('NOMOR SALAH') + `Nomor inventory tidak ditemukan.\n━━━━━━━━━━━`)
  }

  const entry = entries[nomor - 1]
  const dataItem = entry.data
  const inventoryIndex = entry.inventoryIndex

  if (dataItem.nama === 'Fist') {
    return m.reply(header('TIDAK BISA DIJUAL') + `Fist tidak bisa dijual.\n━━━━━━━━━━━`)
  }

  if (
    entry.data === WEAPON_LIST.find(w => w.nama === dataItem.nama) &&
    csm.weapon &&
    csm.weapon.nama === dataItem.nama
  ) {
    return m.reply(header('LEPAS DULU') + `Lepas dulu senjata ini.\n━━━━━━━━━━━`)
  }

  let hargaJual
  const isWeapon = WEAPON_LIST.some(w => w.nama === dataItem.nama)
  if (isWeapon) {
    hargaJual = Math.floor((dataItem.harga || 0) / 2)
  } else {
    hargaJual = dataItem.jual || 0
  }

  if (hargaJual <= 0) {
    return m.reply(header('TIDAK BISA DIJUAL') + `Item ini tidak memiliki harga jual.\n━━━━━━━━━━━`)
  }

  csm.inventory.splice(inventoryIndex, 1)
  userRPG.bank += hargaJual
  saveDB(wdb)

  return m.reply(
    header('PENJUALAN BERHASIL') +
    `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier || '-'}]\n` +
    `Dapat: +Rp ${hargaJual.toLocaleString()} ke Bank` +
    `${isWeapon ? ' [50%]' : ''}\n` +
    `━━━━━━━━━━━`
  )
}
