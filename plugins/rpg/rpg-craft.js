import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
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
  let listHarga = `╭─❏「 🛠️ CRAFTING RECIPE 」❏\n`
  listHarga += `│ Resep equipment dan bahan yang dibutuhkan.\n`
  listHarga += `╰─━━━━━━━━━━━━━━─\n\n`

  for (let i in resep) {
    let r = resep[i]

    listHarga += `🛠️ *${i.toUpperCase()}*\n`
    listHarga += `> ⛓️ Iron: ${r.iron}\n`
    listHarga += `> 🪵 Wood: ${r.wood}\n`
    listHarga += `> 🪨 Stone: ${r.stone}\n`
    listHarga += `> 🪙 Gold: ${r.gold}\n`
    listHarga += `> 💰 Biaya: Rp ${r.money.toLocaleString()}\n`
    listHarga += `> 🌟 Efek: ${r.desc}\n`
    listHarga += `\n─━━━━━━━━━━━━━━─\n`
  }

  listHarga += `\n📌 *CONTOH*\n`
  listHarga += `> ↳ *.craft sword*`

  return sendRpgMsg(
    conn,
    m,
    listHarga,
    'https://files.cloudkuimages.guru/images/45c908fe1f71.jpeg'
  )
}

if (user[choice] && user[choice] > 0) {
  return m.reply(
    `╭─❏「 ❌ CRAFTING 」❏\n` +
    `│ 🛠️ Kamu sudah memiliki ${choice.toUpperCase()}!\n` +
    `│ ↳ Gunakan *.upgrade ${choice}* untuk memperkuatnya.\n` +
    `╰─━━━━━━━━━━━━━━─`
  )
}

  let item = resep[choice]
  for (const material of ['iron', 'wood', 'stone', 'gold']) {
    if ((item[material] || 0) > 0 && getMaterialCount(user, material) < item[material]) {
      return m.reply(`❌ ${material.charAt(0).toUpperCase() + material.slice(1)} tidak cukup! Butuh ${item[material]}.`)
    }
  }
  if ((wdb.money[m.sender] || 0) < item.money) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${item.money.toLocaleString()}.`)

  for (const material of ['iron', 'wood', 'stone', 'gold']) {
    if (item[material]) consumeMaterial(user, material, item[material])
  }
  wdb.money[m.sender] -= item.money
  user[choice] = 1

  saveDB(wdb)

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  return sendRpgMsg(conn, m, `╭─❏「 ✅ CRAFTING SUCCESS 」❏\n├[ 🛠️ Equipment ] ${choice.toUpperCase()} Lv.1\n├ Item bisa ditingkatkan di menu .upgrade.\n╰─━━━━━━━━━━━━━━─`, 'https://files.cloudkuimages.guru/images/45c908fe1f71.jpeg')
}

handler.help = ['craft <item>']
handler.tags = ['rpg']
handler.command = ['craft']

export default handler
