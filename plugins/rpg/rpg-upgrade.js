import { loadDB, saveDB, getUserRPG, sendRpgMsg, getEquipmentName } from '../../lib/waifuHelper.js'
import { getMaterialCount, consumeMaterial } from '../../lib/rpg-libternakData.js'

const unsafeEmojiPattern = /🪨|🪵|🪙|🪢|🪡|🛞|🪼|🪸|🌊|🌙|✨|🫐|🫒|🧄|🧅/u
function safeEmoji(value, fallback = '❓') {
  if (typeof value !== 'string') return fallback
  return unsafeEmojiPattern.test(value) ? fallback : (value || fallback)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')

  const upgradeable = ['sword', 'armor', 'pickaxe', 'fishingrod']
  let item = text ? text.toLowerCase() : ''

  const basePrice = {
    sword: { money: 50000, iron: 10, stone: 5, wood: 0, gold: 5 },
    armor: { money: 40000, iron: 15, stone: 10, wood: 0, gold: 9, kulit: 2, sisik: 1 },
    pickaxe: { money: 30000, iron: 10, stone: 0, wood: 15, gold: 3 },
    fishingrod: { money: 35000, iron: 5, stone: 0, wood: 20, gold: 4 }
  }

  function advancedMaterialCost(itemName, level) {
    const base = basePrice[itemName]
    if (itemName !== 'armor') return { kulit: 0 }
    const multiplier = Math.max(1, Math.ceil(level / 10))
    return {
      kulit: level >= 10 ? (base.kulit || 0) * multiplier : 0,
      sisik: level >= 20 ? (base.sisik || 0) * Math.max(1, Math.ceil(level / 20)) : 0
    }
  }

 if (item === 'guide' || item === 'panduan') {
  return m.reply(
    `╭─❏「 📖 UPGRADE GUIDE 」❏\n` +
    `│ 📌 *SUMBER BAHAN UPGRADE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `💰 *Money*\n` +
    `> ↳ Didapat dari kerja, daily, adventure, toko, dan aktivitas RPG.\n\n` +
    `⛓️ *Iron*\n` +
    `> ↳ Didapat dari *.mining* dan adventure.\n\n` +
    `🪨 *Stone*\n` +
    `> ↳ Didapat dari *.mining* dan adventure.\n\n` +
    `🪵 *Wood*\n` +
    `> ↳ Didapat dari adventure dan aktivitas kebun.\n\n` +
    `✨ *Gold*\n` +
    `> ↳ Didapat dari mining, dungeon, dan aktivitas RPG tertentu.\n\n` +
    `💎 *Diamond*\n` +
    `> ↳ Digunakan mulai upgrade level 7. Didapat dari dungeon, mining, dan reward tertentu.\n\n` +
    `👜 *Kulit*\n` +
    `> ↳ Hanya dipakai untuk upgrade armor mulai level 10. Diperoleh dari hasil ternak/produk kulit seperti kulit iguana, biawak, kadal, salamander, zebra, dan hewan sejenis.\n\n` +
    `🐉 *Sisik*\n` +
    `> ↳ Hanya dipakai untuk upgrade armor mulai level 20. Diperoleh dari hasil ternak hybrid/naga seperti Sisik Astaroth, Sisik Wyrm, dan Sisik Elder.\n\n` +
    `📌 Sword, pickaxe, dan fishing rod tidak membutuhkan kulit maupun sisik.\n` +
    `> ↳ Contoh: *.upgrade armor* untuk melihat biaya berikutnya.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
 }

 if (!item || !upgradeable.includes(item)) {
  let listUpgrade = `╭─❏「 ⚙️ AVELIA UPGRADE CENTER 」❏\n`
  listUpgrade += `│ Lv.7+ membutuhkan Diamond untuk evolusi.\n`
  listUpgrade += `╰─━━━━━━━━━━━━━━─\n\n`

  listUpgrade += `📌 *PILIH EQUIPMENT UNTUK MELIHAT BIAYA UPGRADE*\n\n`

  for (let i of upgradeable) {
    let lvl = user[i] || 0
    let mul = Math.pow(2, Math.max(0, lvl - 1))
    let advanced = advancedMaterialCost(i, lvl)
    let icon = i === 'sword' ? '⚔️' : i === 'armor' ? '🛡️' : i === 'pickaxe' ? '⛏️' : '🎣'
    let currentName = lvl > 0 ? getEquipmentName(i, lvl) : 'Belum Dimiliki'
    let nextName = getEquipmentName(i, lvl + 1)

    let detailBonus = ""
    if (i === 'sword') detailBonus = `Dmg: +${(lvl * 100)} ➔ +${((lvl + 1) * 100)}`
    if (i === 'armor') detailBonus = `MaxHP: +${(lvl * 20)} ➔ +${((lvl + 1) * 20)}`
    if (i === 'pickaxe') detailBonus = `Gold: +${lvl * 10}% ➔ +${(lvl + 1) * 10}%`
    if (i === 'fishingrod') detailBonus = `Rarity: +${lvl * 5}% ➔ +${(lvl + 1) * 5}%`

    listUpgrade += `${icon} *${currentName}*\n`

    if (lvl === 0) {
      listUpgrade += `> ↳ Status : Belum dimiliki (.craft ${i})\n\n`
    } else {
      listUpgrade += `> ↳ Next : ${nextName}\n`
      listUpgrade += `> ↳ Efek : ${detailBonus}\n`
      listUpgrade += `> ↳ Biaya : Rp ${(basePrice[i].money * mul).toLocaleString()}\n`
      listUpgrade += `> ↳ Bahan : ${basePrice[i].iron * mul} Iron, ${basePrice[i].gold * mul} Gold`
      if (advanced.kulit) listUpgrade += `, ${advanced.kulit} Kulit`
      if (advanced.sisik) listUpgrade += `, ${advanced.sisik} Sisik`
      if (lvl >= 7) listUpgrade += `, ${lvl - 5} Diamond`
      listUpgrade += `\n\n`
    }
  }

  listUpgrade += `📌 *Contoh:* Ketik ${usedPrefix}${command} guide atau ${usedPrefix}${command} sword\n\n`
  listUpgrade += `─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, listUpgrade, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
}

if (!user[item] || user[item] < 1) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *EQUIPMENT BELUM DIMILIKI*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Kamu belum memiliki ${item.toUpperCase()}!\n` +
    `> ↳ Ketik .craft ${item} dulu.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

let lvl = user[item]
let oldName = getEquipmentName(item, lvl)
let multiplier = Math.pow(2, lvl - 1)
let totalMoney = basePrice[item].money * multiplier
let totalIron = basePrice[item].iron * multiplier
let totalStone = basePrice[item].stone * multiplier
let totalWood = basePrice[item].wood * multiplier
let totalGold = (basePrice[item].gold || 0) * multiplier
let advanced = advancedMaterialCost(item, lvl)
let totalKulit = advanced.kulit
let totalSisik = advanced.sisik
let totalDiamond = lvl >= 7 ? (lvl - 5) : 0

if ((wdb.money[m.sender] || 0) < totalMoney) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *UANG TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh Rp ${totalMoney.toLocaleString()}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (getMaterialCount(user, 'iron') < totalIron) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *IRON TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh ${totalIron} Iron\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (getMaterialCount(user, 'stone') < totalStone) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *STONE TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh ${totalStone} Stone\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (getMaterialCount(user, 'wood') < totalWood) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *WOOD TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh ${totalWood} Wood\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (getMaterialCount(user, 'gold') < totalGold) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *GOLD TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh ${totalGold} Gold\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (getMaterialCount(user, 'kulit') < totalKulit) {
  return m.reply(`❌ Kulit tidak cukup! Butuh ${totalKulit} Kulit.`)
}

if (getMaterialCount(user, 'sisik') < totalSisik) {
  return m.reply(`❌ Sisik tidak cukup! Butuh ${totalSisik} Sisik.`)
}

if (getMaterialCount(user, 'diamond') < totalDiamond) {
  return m.reply(
    `╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n` +
    `│ ❌ *DIAMOND TIDAK CUKUP*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Butuh 💎${totalDiamond} Diamond\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

wdb.money[m.sender] = Math.max(0, (wdb.money[m.sender] || 0) - totalMoney)
consumeMaterial(user, 'iron', totalIron)
consumeMaterial(user, 'stone', totalStone)
consumeMaterial(user, 'wood', totalWood)
consumeMaterial(user, 'gold', totalGold)
consumeMaterial(user, 'kulit', totalKulit)
consumeMaterial(user, 'sisik', totalSisik)
consumeMaterial(user, 'diamond', totalDiamond)

user[item] += 1
let newName = getEquipmentName(item, user[item])

if (item === 'armor') {
  if (!user.maxDarahBonus) user.maxDarahBonus = 0
  user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
  user.darah = user.maxDarah
}

saveDB(wdb)

let bonusMsg = ""
if (item === 'sword') bonusMsg = `Damage kamu meningkat tajam!`
if (item === 'armor') bonusMsg = `Max HP kamu kini menjadi ${user.maxDarah}!`
if (item === 'pickaxe') bonusMsg = `Hasil mining Gold akan lebih banyak!`
if (item === 'fishingrod') bonusMsg = `Peluang dapat Ikan Langka meningkat!`

let capSuccess = `╭─❏「 ✨ UPGRADE SUCCESS 」❏\n`
capSuccess += `│ 🔥 *${oldName}* ➜ *${newName}* 🌟\n`
capSuccess += `│ 📝 ${bonusMsg}\n`
capSuccess += `╰─━━━━━━━━━━━━━━─\n\n`
capSuccess += `📌 *RINCIAN BIAYA TERPAKAI*\n`
capSuccess += `> ↳ 💰 Money : Rp ${totalMoney.toLocaleString()}\n`
capSuccess += `> ↳ ⛓️ Iron : ${totalIron}\n`
capSuccess += `> ↳ ✨ Gold : ${totalGold}\n`
if (totalKulit > 0) capSuccess += `> ↳ 👜 Kulit : ${totalKulit}\n`
if (totalSisik > 0) capSuccess += `> ↳ 🐉 Sisik : ${totalSisik}\n`
if (totalDiamond > 0) capSuccess += `> ↳ 💎 Diamond : ${totalDiamond}\n`
capSuccess += `\n─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, capSuccess, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
}

handler.help = ['upgrade <item>', 'upgrade guide']
handler.tags = ['rpg']
handler.command = ['upgrade']

export default handler

