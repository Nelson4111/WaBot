import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  if (!wdb.users[m.sender].rpg) {
    wdb.users[m.sender].rpg = {
      level: 1,
      exp: 0,
      darah: 100,
      lastAdventure: 0,
      lastMining: 0,
      lastDungeon: 0,
      diamond: 0,
      gold: 0,
      iron: 0,
      stone: 0,
      wood: 0,
      inventory: {},
      pet: { tipe: 'none', level: 1, exp: 0, lastFeed: 0 }
    }
    if (wdb.money && typeof wdb.money[m.sender] === 'undefined') {
      wdb.money[m.sender] = 1000
    }
  }

  let user = wdb.users[m.sender].rpg
  let cooldown = 120000 
  if (Date.now() - (user.lastAdventure || 0) < cooldown) {
    let sisa = (cooldown - (Date.now() - user.lastAdventure)) / 1000
    return m.reply(`⏳ Tunggu ${sisa.toFixed(0)} detik lagi.`)
  }

  if (user.darah <= 10) return m.reply('❌ Darah terlalu rendah!')

  let exp = Math.floor(Math.random() * 150) + 50
  let money = Math.floor(Math.random() * 5000) + 1000
  let wood = Math.floor(Math.random() * 10) + 5
  let iron = Math.floor(Math.random() * 5) + 1
  let darahKurang = Math.floor(Math.random() * 15) + 5

  user.exp += exp
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + money
  user.wood = (user.wood || 0) + wood
  user.iron = (user.iron || 0) + iron
  user.darah -= darahKurang
  user.lastAdventure = Date.now()

  if (user.exp >= user.level * 500) { 
    user.level++
    user.exp = 0 
  }

  saveDB(wdb)

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  let cap = `*───「 ADVENTURE 」───*\n\n`
  cap += `🎁 *Hasil:* \n`
  cap += `• 💰 Money: +Rp ${money.toLocaleString()}\n`
  cap += `• 🪵 Wood: +${wood}\n`
  cap += `• ⛓️ Iron: +${iron}\n`
  cap += `• 🌟 XP: +${exp}\n\n`
  cap += `❤️ *Sisa Darah:* ${user.darah}`

  conn.sendMessage(m.chat, {
    text: cap,
    contextInfo: {
      externalAdReply: {
        title: "ZETA EXPLORATION",
        body: `Explorer: ${m.pushName} | Lvl: ${user.level}`,
        thumbnailUrl: 'https://c.termai.cc/i166/r7V1',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['adventure']
handler.tags = ['rpg']
handler.command = ['adventure', 'petualang']

export default handler