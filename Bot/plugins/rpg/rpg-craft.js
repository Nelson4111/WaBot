import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Mulailah dengan .adventure')

  const resep = {
    'sword': { 
      iron: 20, wood: 10, stone: 5, gold: 2, money: 10000,
      desc: 'Meningkatkan Damage saat Raid & Dungeon.' 
    },
    'armor': { 
      iron: 30, wood: 5, stone: 20, gold: 5, money: 15000,
      desc: 'Mengurangi Damage yang diterima dari Monster.' 
    },
    'pickaxe': { 
      iron: 15, wood: 20, stone: 10, gold: 1, money: 8000,
      desc: 'Meningkatkan perolehan Gold saat Mining.' 
    },
    'fishingrod': { 
      iron: 10, wood: 30, stone: 0, gold: 1, money: 12000,
      desc: 'Meningkatkan peluang mendapatkan Ikan Hiu.' 
    }
  }

  let choice = text ? text.toLowerCase() : ''

  if (!choice || !resep[choice]) {
    let listHarga = `*───「 CRAFTING RECIPE 」───*\n\n`
    for (let i in resep) {
      let r = resep[i]
      listHarga += `🛠️ *${i.toUpperCase()}*\n`
      listHarga += `  - ⛓️ Iron: ${r.iron} | 🪵 Wood: ${r.wood}\n`
      listHarga += `  - 🪨 Stone: ${r.stone} | 🪙 Gold: ${r.gold}\n`
      listHarga += `  - 💰 Rp ${r.money.toLocaleString()} | 🌟 Efek: _${r.desc}_\n\n`
    }
    listHarga += `*Contoh:* Ketik ${usedPrefix}${command} sword`

    return sendRpgMsg(conn, m, listHarga, 'https://files.cloudkuimages.guru/images/45c908fe1f71.jpeg')
  }

  if (user[choice] && user[choice] > 0) {
    return m.reply(`❌ Kamu sudah memiliki ${choice.toUpperCase()}! Gunakan *.upgrade ${choice}* untuk memperkuatnya.`)
  }

  let item = resep[choice]
  if ((user.iron || 0) < item.iron) return m.reply(`❌ Iron tidak cukup! Butuh ${item.iron}.`)
  if ((user.wood || 0) < item.wood) return m.reply(`❌ Wood tidak cukup! Butuh ${item.wood}.`)
  if ((user.stone || 0) < item.stone) return m.reply(`❌ Stone tidak cukup! Butuh ${item.stone}.`)
  if ((user.gold || 0) < item.gold) return m.reply(`❌ Gold tidak cukup! Butuh ${item.gold}.`)
  if ((wdb.money[m.sender] || 0) < item.money) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${item.money.toLocaleString()}.`)

  user.iron -= item.iron
  user.wood -= item.wood
  user.stone -= item.stone
  user.gold -= item.gold
  wdb.money[m.sender] -= item.money
  user[choice] = 1

  saveDB(wdb)

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  return sendRpgMsg(conn, m, `✅ *CRAFTING SUCCESS!*\n\nSelamat! Kamu telah berhasil menempa *${choice.toUpperCase()}* Lv.1.\nSekarang item ini bisa ditingkatkan di menu .upgrade.`, 'https://files.cloudkuimages.guru/images/45c908fe1f71.jpeg')
}

handler.help = ['craft <item>']
handler.tags = ['rpg']
handler.command = ['craft']

export default handler