/**
 * CSM Inventory Command Handler (inv, use, give)
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { ITEM_LIST, WEAPON_LIST, DEVIL_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header, getInventoryEntryByInput, resolveJid } from '../lib/utils.js'
import { addExp } from '../lib/combat.js'

export async function handleInventory(ctx) {
  const { m, conn, csm, wdb, args } = ctx

  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  const invAction = args[1]?.toLowerCase()

  if (invAction === 'use' || ctx.action === 'use') {
    const itemInput = ctx.action === 'use' ? args.slice(1).join(' ').trim() : args.slice(2).join(' ').trim()
    if (!itemInput) {
      return m.reply(header('PENGGUNAAN ITEM') + `.csm inv use <nomor/nama>\n.csm use <nomor/nama>\n━━━━━━━━━━━`)
    }

    const entry = getInventoryEntryByInput(csm, itemInput)
    if (!entry || !entry.data || !ITEM_LIST.some(item => item.nama === entry.data.nama)) {
      return m.reply(header('ITEM TIDAK ADA') + `Nomor atau nama item tidak ada di inventory.\n━━━━━━━━━━━`)
    }

    const itemData = entry.data
    const inventoryIndex = entry.inventoryIndex
    const questItem = itemData.jenis === 'Quest Item'
    const gachaTicket = itemData.jenis === 'Gacha Ticket'

    if (questItem) {
      csm.pendingQuestItem = { inventoryIndex, itemName: itemData.nama }
      saveDB(wdb)
      return m.reply(
        header('SETOR QUEST ITEM') +
        `${itemData.emoji} *${itemData.nama}*\n\n` +
        `Kamu ingin setor item ini sebagai quest item?\n\n` +
        `Ketik *.csm quest item yes* untuk setor.\n` +
        `Ketik *.csm quest item no* untuk batal.\n━━━━━━━━━━━`
      )
    }

    if (gachaTicket) {
      const ticketName = itemData.nama
      const targetInput = ctx.action === 'use' ? args.slice(2).join(' ').trim() : args.slice(3).join(' ').trim()
      const useTicket = () => {
        let pool = []
        if (ticketName === 'Fiend Blood Contract') {
          pool = DEVIL_LIST.filter(d => d.tipe === 'Fiend' && ['S', 'SS'].includes(d.rank))
        } else if (ticketName === 'Fiend Blood Contract (Platinum)') {
          pool = DEVIL_LIST.filter(d => d.tipe === 'Fiend' && d.rank === 'SSS')
        } else if (ticketName === 'Devil Pact Scroll') {
          pool = DEVIL_LIST.filter(d => d.tipe === 'Devil' && ['S', 'SS'].includes(d.rank))
        } else if (ticketName === 'Devil Pact Scroll (Mythic)') {
          pool = DEVIL_LIST.filter(d => d.tipe === 'Devil' && d.rank === 'SSS')
        } else if (ticketName.includes('Hell Pass')) {
          const devil = !targetInput ? null : (!isNaN(targetInput) ? DEVIL_LIST[Number(targetInput) - 1] : DEVIL_LIST.find(d => d.nama.toLowerCase() === targetInput.toLowerCase() || d.nama.toLowerCase().includes(targetInput.toLowerCase())))
          if (!devil) {
            return m.reply(
              header('HELL PASS') +
              `${itemData.emoji} *${itemData.nama}*\n\n` +
              `Pilih Devil target yang ingin kamu ambil:\n` +
              `${DEVIL_LIST.map((d, i) => `${i + 1}. ${d.emoji} ${d.nama} [${d.rank}]`).slice(0, 25).join('\n')}\n\n` +
              `Ketik *.csm inv use ${args[2]} <nomor/nama devil>* untuk pilih devilmuu.\n━━━━━━━━━━━`
            )
          }
          csm.inventory.splice(inventoryIndex, 1)
          csm.contractHistory = Array.isArray(csm.contractHistory) ? csm.contractHistory : []
          csm.contractHistory.push(devil.nama)
          csm.devilContract = devil.nama
          csm.contractType = devil.tipe === 'Devil' ? 'devil' : 'fiend'
          csm.isTransform = true
          csm.contractExpire = 0
          csm.lastSeenDevils = csm.lastSeenDevils || {}
          csm.lastSeenDevils[devil.nama] = Date.now()
          saveDB(wdb)
          return m.reply(
            header('HELL PASS DIPAKAI') +
            `${devil.emoji} *${devil.nama}* [${devil.rank}]\n` +
            `Kamu memilih devil ini secara langsung tanpa biaya.\n` +
            `✅ Kontrak terikat dan transform aktif.\n━━━━━━━━━━━`
          )
        }

        if (!pool.length) {
          pool = DEVIL_LIST.filter(d => ['S', 'SS', 'SSS'].includes(d.rank))
        }
        const reward = pool[Math.floor(Math.random() * pool.length)] || DEVIL_LIST[DEVIL_LIST.length - 1]

        csm.inventory.splice(inventoryIndex, 1)
        csm.contractHistory = Array.isArray(csm.contractHistory) ? csm.contractHistory : []
        csm.contractHistory.push(reward.nama)
        csm.devilContract = reward.nama
        csm.contractType = reward.tipe === 'Devil' ? 'devil' : 'fiend'
        csm.isTransform = true
        csm.contractExpire = 0
        csm.lastSeenDevils = csm.lastSeenDevils || {}
        csm.lastSeenDevils[reward.nama] = Date.now()
        saveDB(wdb)

        return m.reply(
          header('GACHA TICKET DIPAKAI') +
          `${reward.emoji} *${reward.nama}* [${reward.rank}]\n` +
          `Jenis: ${reward.tipe}\n` +
          `Ticket: ${ticketName}\n` +
          `✅ Hasil gacha berkualitas tinggi dan tidak pernah jelek.\n━━━━━━━━━━━`
        )
      }

      return useTicket()
    }

    csm.inventory.splice(inventoryIndex, 1)

    let heal = 0
    let bloodGain = 0
    let expGain = 0
    const name = itemData.nama

    if (name === 'Cigarette (Rokok Easy Revenge)') {
      heal = 12
      bloodGain = 500
      expGain = 5
    } else if (name === 'Perban Medis Gulung') {
      heal = 10
      bloodGain = 400
    } else if (name === 'Darah Botolan Konvensional') {
      heal = 18
      bloodGain = 800
    } else if (name === 'Permen Karet Penenang') {
      heal = 15
      bloodGain = 600
    } else if (name === 'Kantong Darah Donor Publik') {
      heal = 30
      bloodGain = 1200
    } else if (name === 'Botol Alkohol Medis 70%') {
      heal = 20
      bloodGain = 700
    } else if (name === 'Kain Kasa Gulung Besar') {
      heal = 25
      bloodGain = 900
    } else if (name === 'Kapsul Minyak Ikan') {
      heal = 18
      bloodGain = 650
    } else if (name === 'Suntikan Adrenalin Medis') {
      heal = 22
      bloodGain = 1100
    } else if (name === 'Botol Alkohol Medis Steril 95%') {
      heal = 28
      bloodGain = 1300
    } else if (name === 'Tas Medis Lapangan Penuh') {
      heal = csm.maxHealth
      bloodGain = 1800
      expGain = 20
    } else if (name === 'Botol Serum Penenang Mental') {
      heal = 45
      bloodGain = 2200
      expGain = 30
    } else if (name === 'Botol Serum Imunisasi') {
      heal = 40
      bloodGain = 1900
    } else if (name === 'Darah Murni Blood Devil') {
      heal = csm.maxHealth
      bloodGain = 3500
      expGain = 50
    } else if (name === 'Serum Regenerasi Sel Iblis') {
      heal = Math.max(30, Math.floor(csm.maxHealth * 0.8))
      bloodGain = 2500
      expGain = 35
    } else {
      heal = itemData.tier === 'SSS' ? 50 : itemData.tier === 'SS' ? 40 : itemData.tier === 'S' ? 30 : itemData.tier === 'A' ? 25 : itemData.tier === 'B' ? 20 : itemData.tier === 'C' ? 15 : 10
      bloodGain = Math.max(200, (itemData.jual || 0) / 12)
    }

    csm.health = Math.min(csm.maxHealth, (Number(csm.health) || 0) + heal)
    csm.blood = (Number(csm.blood) || 0) + bloodGain
    if (expGain > 0) {
      const leveled = addExp(csm, expGain, m)
      if (leveled) {
        csm.lastStory = Date.now()
      }
    }

    saveDB(wdb)

    return m.reply(
      header('ITEM DIPAKAI') +
      `${itemData.emoji} *${itemData.nama}*\n` +
      `❤️ +${heal.toLocaleString()} HP\n` +
      `🩸 +${Math.floor(bloodGain).toLocaleString()} Blood\n` +
      `${expGain > 0 ? `📈 +${expGain.toLocaleString()} EXP\n` : ''}` +
      `━━━━━━━━━━━`
    )
  }

  if (invAction === 'give') {
    const itemInput = args[2]
    const target = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender) || null
    if (!itemInput) {
      return m.reply(header('GIVE INVENTORY') + `.csm inv give <nomor/nama> @user\n.csm inv give <nomor/nama> (reply user)\n━━━━━━━━━━━`)
    }
    if (!target) {
      return m.reply(header('TARGET BELUM DI-TAG') + `Tag target atau reply pesan target sebelum kirim item.\n━━━━━━━━━━━`)
    }

    const entry = getInventoryEntryByInput(csm, itemInput)
    if (!entry || !entry.data || WEAPON_LIST.some(w => w.nama === entry.data.nama)) {
      return m.reply(header('ITEM TIDAK BISA DIKIRIM') + `Hanya item non-senjata yang bisa dikirim.\n━━━━━━━━━━━`)
    }

    const targetJid = resolveJid(target, wdb)
    const targetUser = wdb.users[targetJid]?.rpg || wdb.users[target]?.rpg
    if (!targetUser || !targetUser.csm) {
      return m.reply(header('TARGET BELUM MAIN') + `Target belum memiliki data RPG.\n━━━━━━━━━━━`)
    }

    const item = csm.inventory.splice(entry.inventoryIndex, 1)[0]
    if (!Array.isArray(targetUser.csm.inventory)) targetUser.csm.inventory = [{ nama: 'Fist', dur: 999 }]
    targetUser.csm.inventory.push(item)
    if (ITEM_LIST.some(i => i.nama === item.nama) && !targetUser.csm.foundItems?.includes(item.nama)) {
      targetUser.csm.foundItems = Array.isArray(targetUser.csm.foundItems) ? targetUser.csm.foundItems : []
      targetUser.csm.foundItems.push(item.nama)
    }
    saveDB(wdb)

    return m.reply(
      header('ITEM TERKIRIM') +
      `${entry.data.emoji} *${entry.data.nama}*\n` +
      `Berhasil dikirim ke ${conn.getName(targetJid) || targetJid.split('@')[0]}.\n━━━━━━━━━━━`
    )
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
  let cap = header('INVENTORY KAMU')

  if (entries.length === 0) {
    cap += `Kosong\n`
  }

  if (weaponEntries.length > 0) {
    cap += `⚔️ *WEAPON*\n`
    weaponEntries.forEach((entry, i) => {
      const w = entry.data
      const inv = entry.inv
      const aktif = csm.weapon && csm.weapon.nama === w.nama ? ' [DIPAKAI]' : ''
      cap += `*${i + 1}.* ${w.emoji} *${w.nama}* [T${w.tier}]${aktif}\n`
      cap += ` └ DMG: ${Math.max(1, Number(w.dmg) || 1)} | DUR: ${inv.dur}/${w.dur}\n`
    })
    cap += `\n`
  }

  if (itemEntries.length > 0) {
    cap += `🎒 *ITEM*\n`
    itemEntries.forEach((entry, i) => {
      const item = entry.data
      const nomor = weaponEntries.length + i + 1
      cap += `*${nomor}.* ${item.emoji} *${item.nama}* [T${item.tier || '-'}]\n`
      cap += ` └ ${item.desc || ''}\n`
    })
    cap += `\n`
  }

  cap += `━━━━━━━━━━━\n`
  cap += `📌.csm equip <nomor/nama>\n`
  cap += `📌.csm sell <nomor>\n`
  cap += `📌.csm repair <nomor/nama>\n`
  cap += `📌.csm inv use <nomor/nama>\n`
  cap += `📌.csm inv give <nomor/nama> @user\n`
  cap += `━━━━━━━━━━━`

  return m.reply(cap)
}
