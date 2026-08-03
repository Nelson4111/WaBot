import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')

  const upgradeable = ['sword', 'armor', 'pickaxe', 'fishingrod']
  let item = text ? text.toLowerCase() : ''
  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  const basePrice = {
    sword: { money: 50000, iron: 10, stone: 5, wood: 0, gold: 5 },
    armor: { money: 40000, iron: 15, stone: 10, wood: 0, gold: 8 },
    pickaxe: { money: 30000, iron: 10, stone: 0, wood: 15, gold: 3 },
    fishingrod: { money: 35000, iron: 5, stone: 0, wood: 20, gold: 4 }
  }

  // TAMPILAN MENU UTAMA DENGAN DETAIL BONUS
  if (!item || !upgradeable.includes(item)) {
    let listUpgrade = `*───「 ZETA UPGRADE CENTER 」───*\n\n`
    listUpgrade += `💎 *Lv.7+ membutuhkan Diamond.*\n\n`
    
    for (let i of upgradeable) {
      let lvl = user[i] || 0
      let mul = Math.pow(2, lvl - 1)
      let name = i.toUpperCase()
      let icon = i === 'sword' ? '⚔️' : i === 'armor' ? '🛡️' : i === 'pickaxe' ? '⛏️' : '🎣'
      
      // LOGIKA DETAIL BONUS
      let detailBonus = ""
      if (i === 'sword') detailBonus = `Dmg: +${(lvl * 100)} ➔ +${((lvl + 1) * 100)}`
      if (i === 'armor') detailBonus = `MaxHP: +${(lvl * 20)} ➔ +${((lvl + 1) * 20)}`
      if (i === 'pickaxe') detailBonus = `Gold: +${lvl * 10}% ➔ +${(lvl + 1) * 10}%`
      if (i === 'fishingrod') detailBonus = `Rarity: +${lvl * 5}% ➔ +${(lvl + 1) * 5}%`

      listUpgrade += `${icon} *${name}* (Lv.${lvl})\n`
      if (lvl === 0) {
        listUpgrade += `   - _Status: Belum dimiliki (.craft ${i})_\n\n`
      } else {
        listUpgrade += `   - ✨ *Efek:* ${detailBonus}\n`
        listUpgrade += `   - 💰 Biaya: Rp ${(basePrice[i].money * mul).toLocaleString()}\n`
        listUpgrade += `   - ⛓️ Bahan: ${basePrice[i].iron * mul} Iron, ${basePrice[i].gold * mul} Gold`
        if (lvl >= 7) listUpgrade += `\n   - 💎 Special: ${lvl - 5} Diamond`
        listUpgrade += `\n\n`
      }
    }
    
    return sendRpgMsg(conn, m, listUpgrade + `*Contoh:* Ketik ${usedPrefix}${command} sword`, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
  }

  if (!user[item] || user[item] < 1) return m.reply(`❌ Kamu belum memiliki ${item.toUpperCase()}! Ketik .craft ${item} dulu.`)

  let lvl = user[item]
  let multiplier = Math.pow(2, lvl - 1)
  let totalMoney = basePrice[item].money * multiplier
  let totalIron = basePrice[item].iron * multiplier
  let totalStone = basePrice[item].stone * multiplier
  let totalWood = basePrice[item].wood * multiplier
  let totalGold = (basePrice[item].gold || 0) * multiplier
  let totalDiamond = lvl >= 7 ? (lvl - 5) : 0 

  // Validasi Bahan
  if ((wdb.money[m.sender] || 0) < totalMoney) return m.reply(`❌ Uang kurang! Butuh Rp ${totalMoney.toLocaleString()}`)
  if ((user.iron || 0) < totalIron) return m.reply(`❌ Iron kurang! Butuh ${totalIron}`)
  if ((user.gold || 0) < totalGold) return m.reply(`❌ Gold kurang! Butuh ${totalGold}`)
  if ((user.diamond || 0) < totalDiamond) return m.reply(`❌ Diamond kurang! Butuh 💎${totalDiamond}`)

  // Eksekusi Potong Bahan
  wdb.money[m.sender] -= totalMoney
  user.iron -= totalIron
  user.stone -= totalStone
  user.wood -= totalWood
  user.gold -= totalGold
  user.diamond -= totalDiamond
  
  // NAIK LEVEL
  user[item] += 1

  // UPDATE MAX DARAH JIKA ARMOR
  if (item === 'armor') {
    user.maxDarah = 100 + (user.armor * 20)
    user.darah = user.maxDarah // Otomatis full HP saat upgrade armor
  }

  saveDB(wdb)
  
  let bonusMsg = ""
  if (item === 'sword') bonusMsg = `Damage kamu meningkat tajam!`
  if (item === 'armor') bonusMsg = `Max HP kamu kini menjadi ${user.maxDarah}!`
  if (item === 'pickaxe') bonusMsg = `Hasil mining Gold akan lebih banyak!`
  if (item === 'fishingrod') bonusMsg = `Peluang dapat Ikan Langka meningkat!`

  let capSuccess = `✅ *UPGRADE SUCCESS!*\n\n`
  capSuccess += `🔥 *${item.toUpperCase()}* naik ke *Lv.${user[item]}*\n`
  capSuccess += `📝 *Bonus:* ${bonusMsg}\n\n`
  capSuccess += `*Rincian Biaya Terpakai:*\n`
  capSuccess += `• 💰 Money: Rp ${totalMoney.toLocaleString()}\n`
  capSuccess += `• ⛓️ Iron: ${totalIron}\n`
  if (totalDiamond > 0) capSuccess += `• 💎 Diamond: ${totalDiamond}\n`

  return sendRpgMsg(conn, m, capSuccess, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
}

handler.help = ['upgrade <item>']
handler.tags = ['rpg']
handler.command = ['upgrade']

export default handler