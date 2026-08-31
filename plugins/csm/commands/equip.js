/**
 * CSM Equip & Repair Command Handlers
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { WEAPON_LIST, ITEM_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header } from '../lib/utils.js'
import { equipFist } from '../lib/state.js'

export async function handleEquip(ctx) {
  const { m, csm, wdb, args } = ctx

  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  const input = args.slice(1).join(' ').trim()

  if (['unequip', 'lepas', 'fist'].includes(input.toLowerCase())) {
    equipFist(csm)
    saveDB(wdb)
    return m.reply(header('SENJATA DILEPAS') + `Kamu melepas senjata dan kembali bertarung dengan Fist.\n⚔️ DMG Fist: 2\n━━━━━━━━━━━`)
  }

  if (!input) {
    return m.reply(header('PENGGUNAAN') + `.csm equip <nomor/nama senjata>\n━━━━━━━━━━━`)
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
  let entry = null

  if (!isNaN(input)) {
    const nomor = parseInt(input, 10)
    if (nomor < 1 || nomor > entries.length) {
      return m.reply(header('NOMOR SALAH') + `Nomor inventory tidak ditemukan.\n━━━━━━━━━━━`)
    }

    entry = entries[nomor - 1]
    if (!entry || !WEAPON_LIST.some(w => w.nama === entry.data.nama)) {
      return m.reply(header('BUKAN SENJATA') + `Nomor tersebut bukan weapon.\n━━━━━━━━━━━`)
    }
  } else {
    const dataWeapon = WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())
    if (!dataWeapon) return m.reply(header('SENJATA TIDAK ADA') + `━━━━━━━━━━━`)

    const inventoryIndex = csm.inventory.findIndex(w => w.nama === dataWeapon.nama)
    if (inventoryIndex < 0) return m.reply(header('KAMU TIDAK PUNYA') + `━━━━━━━━━━━`)

    entry = {
      inv: csm.inventory[inventoryIndex],
      inventoryIndex,
      data: dataWeapon
    }
  }

  const dataItem = entry.data
  const invIndex = entry.inventoryIndex

  if (dataItem.nama === 'Fist') {
    return m.reply(header('TIDAK BISA') + `Fist tidak perlu di-equip.\n━━━━━━━━━━━`)
  }

  if (Number(dataItem.dmg) <= 0) dataItem.dmg = 1

  const item = csm.inventory.splice(invIndex, 1)[0]
  if (typeof item.dur !== 'number' || item.dur < 0) {
    item.dur = dataItem.dur
  }

  csm.inventory.unshift(item)
  csm.weapon = { nama: item.nama, dur: item.dur }
  saveDB(wdb)

  return m.reply(
    header('SENJATA DIPASANG') +
    `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\n` +
    `DMG: ${Math.max(1, dataItem.dmg)}\n` +
    `DUR: ${item.dur}/${dataItem.dur}\n` +
    `━━━━━━━━━━━`
  )
}

export async function handleRepair(ctx) {
  const { m, csm, wdb, userRPG, args } = ctx

  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  if (!csm.weapon || !csm.weapon.nama) {
    csm.weapon = { nama: 'Fist', dur: 999 }
  }

  const input = args.slice(1).join(' ').trim()
  if (!input) {
    return m.reply(header('PENGGUNAAN') + `.csm repair <nomor/nama senjata>\n━━━━━━━━━━━`)
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
  let entry = null

  if (!isNaN(input)) {
    const nomor = parseInt(input, 10)
    if (nomor < 1 || nomor > entries.length) {
      return m.reply(header('NOMOR SALAH') + `Nomor inventory tidak ditemukan.\n━━━━━━━━━━━`)
    }

    entry = entries[nomor - 1]
    if (!entry || !WEAPON_LIST.some(w => w.nama === entry.data.nama)) {
      return m.reply(header('BUKAN SENJATA') + `Nomor tersebut bukan weapon.\n━━━━━━━━━━━`)
    }
  } else {
    const dataWeapon = WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())
    if (!dataWeapon) return m.reply(header('SENJATA TIDAK ADA') + `━━━━━━━━━━━`)

    const inventoryIndex = csm.inventory.findIndex(x => x.nama === dataWeapon.nama)
    if (inventoryIndex < 0) return m.reply(header('WEAPON TIDAK ADA') + `━━━━━━━━━━━`)

    entry = {
      inv: csm.inventory[inventoryIndex],
      inventoryIndex,
      data: dataWeapon
    }
  }

  const itemInv = entry.inv
  const dataItem = entry.data

  if (dataItem.nama === 'Fist') {
    return m.reply(header('TIDAK BISA') + `Fist tidak perlu di-repair.\n━━━━━━━━━━━`)
  }

  if (dataItem.dur === 1 || dataItem.dur === 999) {
    return m.reply(header('TIDAK BISA') + `${dataItem.emoji} *${dataItem.nama}* tidak bisa di-repair.\n━━━━━━━━━━━`)
  }

  if (!itemInv) return m.reply(header('WEAPON TIDAK ADA') + `━━━━━━━━━━━`)

  if (typeof itemInv.dur !== 'number' || itemInv.dur < 0) {
    itemInv.dur = dataItem.dur
  }

  if (itemInv.dur >= dataItem.dur) {
    return m.reply(header('SUDAH FULL') + `Durability sudah penuh.\n━━━━━━━━━━━`)
  }

  let persen = 0.3
  if (dataItem.tier === 'D') persen = 0.4
  if (dataItem.tier === 'C') persen = 0.45
  if (dataItem.tier === 'B') persen = 0.5
  if (dataItem.tier === 'A') persen = 0.6
  if (dataItem.tier === 'S') persen = 0.7
  if (dataItem.tier === 'SS') persen = 0.8
  if (dataItem.tier === 'SSS') persen = 0.9

  const biaya = Math.floor((dataItem.harga || 0) * persen)

  if (userRPG.bank < biaya) {
    return m.reply(header('DUIT KURANG') + `Butuh Rp ${biaya.toLocaleString()}\nSaldo: Rp ${userRPG.bank.toLocaleString()}\n━━━━━━━━━━━`)
  }

  userRPG.bank -= biaya
  itemInv.dur = dataItem.dur

  if (csm.weapon && csm.weapon.nama === dataItem.nama) {
    csm.weapon.dur = dataItem.dur
  }

  saveDB(wdb)

  return m.reply(
    header('BERHASIL DI-REPAIR') +
    `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\n` +
    `Durability: FULL\n` +
    `Biaya: ${persen * 100}% = Rp ${biaya.toLocaleString()}\n` +
    `━━━━━━━━━━━`
  )
}
