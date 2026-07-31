import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  
  // Ambil semua data user
  let users = Object.entries(wdb.users)
  let totalUsers = users.length
  
  // Variabel penampung statistik
  let totalMoney = 0
  let totalIron = 0
  let totalGold = 0
  let totalLevel = 0
  let highestLevel = 0
  let topPlayer = 'Tidak ada'

  // Hitung saldo global dari wdb.money
  for (let jid in wdb.money) {
    totalMoney += wdb.money[jid]
  }

  // Hitung statistik material dan level
  users.forEach(([jid, data]) => {
    if (data.rpg) {
      totalIron += (data.rpg.iron || 0)
      totalGold += (data.rpg.gold || 0)
      totalLevel += (data.rpg.level || 1)
      
      if (data.rpg.level > highestLevel) {
        highestLevel = data.rpg.level
        topPlayer = data.name || jid.split('@')[0]
      }
    }
  })

  let avgLevel = (totalLevel / totalUsers).toFixed(1)
  let pp = await conn.profilePictureUrl(conn.user.jid, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  let cap = `*───「 RPG GLOBAL STATS 」───*\n\n`
  cap += `📊 *Populasi Pemain:* ${totalUsers} User\n`
  cap += `💰 *Total Uang Beredar:* Rp ${totalMoney.toLocaleString()}\n`
  cap += `⛏️ *Total Iron Terkumpul:* ${totalIron.toLocaleString()}\n`
  cap += `✨ *Total Gold Terkumpul:* ${totalGold.toLocaleString()}\n\n`
  
  cap += `*───「 WORLD RECORD 」───*\n`
  cap += `🏆 *Pemain Terkuat:* ${topPlayer}\n`
  cap += `📈 *Level Tertinggi:* Lv.${highestLevel}\n`
  cap += `📚 *Rata-rata Level:* Lv.${avgLevel}\n\n`
  cap += `_Statistik ini diambil langsung dari database pusat ZETA RPG._`

  conn.sendMessage(m.chat, {
    text: cap,
    contextInfo: {
      externalAdReply: {
        title: "ZETA RPG ANALYTICS",
        body: "Data Statistik Global",
        thumbnailUrl: pp,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['rpgstat']
handler.tags = ['rpg']
handler.command = ['rpgstat', 'rpgstats']

export default handler