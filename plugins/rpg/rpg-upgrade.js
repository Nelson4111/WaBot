import { loadDB, saveDB, getUserRPG, sendRpgMsg, getEquipmentName } from '../../lib/waifuHelper.js'
import { getMaterialCount, consumeMaterial } from '../../lib/rpg-libternakData.js'

const UPGRADE_IMAGE = 'https://c.termai.cc/i108/l3q'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')

  const upgradeable = ['sword', 'armor', 'pickaxe', 'fishingrod']
  let [item = '', confirmArg = ''] = text ? text.trim().toLowerCase().split(/\s+/) : []
  const confirmYes = ['yes', 'ya', 'ok', 'confirm'].includes(confirmArg)
  const confirmNo = ['no', 'tidak', 'batal', 'cancel', 'tolak'].includes(confirmArg)

  const basePrice = {
    sword: { money: 50000, iron: 10, stone: 5, wood: 0, gold: 5 },
    armor: { money: 40000, iron: 15, stone: 10, wood: 0, gold: 9, kulit: 2, sisik: 1 },
    pickaxe: { money: 30000, iron: 10, stone: 0, wood: 15, gold: 3 },
    fishingrod: { money: 35000, iron: 5, stone: 0, wood: 20, gold: 4 }
  }

  function advancedMaterialCost(itemName, level) {
    const base = basePrice[itemName]
    if (itemName !== 'armor') return { kulit: 0, sisik: 0 }
    const multiplier = Math.max(1, Math.ceil(level / 10))
    return {
      kulit: level >= 10 ? (base.kulit || 0) * multiplier : 0,
      sisik: level >= 20 ? (base.sisik || 0) * Math.max(1, Math.ceil(level / 20)) : 0
    }
  }

  function getUpgradeCost(itemName, level) {
    const multiplier = Math.pow(2, Math.max(0, level - 1))
    const advanced = advancedMaterialCost(itemName, level)
    return {
      money: basePrice[itemName].money * multiplier,
      iron: basePrice[itemName].iron * multiplier,
      stone: basePrice[itemName].stone * multiplier,
      wood: basePrice[itemName].wood * multiplier,
      gold: (basePrice[itemName].gold || 0) * multiplier,
      kulit: advanced.kulit,
      sisik: advanced.sisik,
      diamond: level >= 7 ? level - 5 : 0
    }
  }

  function formatUpgradeCost(cost) {
    return `> ↳ 💰 Money : Rp ${cost.money.toLocaleString()}\n` +
      `> ↳ ⛓️ Iron : ${cost.iron}\n` +
      `> ↳ 🪨 Stone : ${cost.stone}${cost.stone ? '' : ' (tidak digunakan)'}\n` +
      `> ↳ 🪵 Wood : ${cost.wood}${cost.wood ? '' : ' (tidak digunakan)'}\n` +
      `> ↳ ✨ Gold : ${cost.gold}${cost.gold ? '' : ' (tidak digunakan)'}\n` +
      `> ↳ 👜 Kulit : ${cost.kulit}${cost.kulit ? '' : ' (tidak digunakan)'}\n` +
      `> ↳ 🐉 Sisik : ${cost.sisik}${cost.sisik ? '' : ' (tidak digunakan)'}\n` +
      `> ↳ 💎 Diamond : ${cost.diamond}${cost.diamond ? '' : ' (tidak digunakan)'}\n`
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
    let cost = getUpgradeCost(i, lvl)
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
      listUpgrade += formatUpgradeCost(cost) + `\n`
    }
  }

  listUpgrade += `📌 *Contoh:* Ketik ${usedPrefix}${command} guide atau ${usedPrefix}${command} sword\n\n`
  listUpgrade += `─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, listUpgrade, UPGRADE_IMAGE)
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

let lvl = Number(user[item])
let oldName = getEquipmentName(item, lvl)
let cost = getUpgradeCost(item, lvl)
let { money: totalMoney, iron: totalIron, stone: totalStone, wood: totalWood, gold: totalGold, kulit: totalKulit, sisik: totalSisik, diamond: totalDiamond } = cost
const pendingUpgrade = user.pendingUpgrade

if (confirmNo) {
  if (pendingUpgrade?.item === item) delete user.pendingUpgrade
  await saveDB(wdb)
  return m.reply(`╭─❏「 ⚙️ AVELIA UPGRADE 」❏\n│ ❌ *UPGRADE DIBATALKAN*\n╰─━━━━━━━━━━━━━━─`)
}

if (confirmYes && (!pendingUpgrade || pendingUpgrade.item !== item || Date.now() - pendingUpgrade.time > 60000)) {
  delete user.pendingUpgrade
  await saveDB(wdb)
  return m.reply(`❌ Konfirmasi upgrade tidak ada atau kedaluwarsa. Jalankan perintah upgrade lagi untuk melihat biaya terbaru.`)
}

if (confirmYes && pendingUpgrade.level !== lvl) {
  delete user.pendingUpgrade
  await saveDB(wdb)
  return m.reply(`❌ Level equipment sudah berubah. Jalankan perintah upgrade lagi untuk melihat biaya terbaru.`)
}

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

if (!confirmYes) {
  user.pendingUpgrade = { item, level: lvl, time: Date.now() }
  await saveDB(wdb)
  return m.reply(
    `╭─❏「 ⚙️ KONFIRMASI UPGRADE 」❏\n` +
    `│ ${oldName} ➜ ${getEquipmentName(item, lvl + 1)}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *RINCIAN BIAYA*\n` +
    formatUpgradeCost(cost) + `\n` +
    `Ketik *${usedPrefix}${command} ${item} yes* untuk lanjut.\n` +
    `Ketik *${usedPrefix}${command} ${item} no* untuk batal.\n` +
    `Konfirmasi berlaku 60 detik.\n\n─━━━━━━━━━━━━━━─`
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

user[item] = lvl + 1
delete user.pendingUpgrade
let newName = getEquipmentName(item, user[item])

if (item === 'armor') {
  if (!user.maxDarahBonus) user.maxDarahBonus = 0
  user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
  user.darah = user.maxDarah
}

await saveDB(wdb)

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
capSuccess += formatUpgradeCost(cost)
capSuccess += `\n─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, capSuccess, UPGRADE_IMAGE)
}

handler.help = ['upgrade <item>', 'upgrade guide']
handler.tags = ['rpg']
handler.command = ['upgrade']

export default handler

