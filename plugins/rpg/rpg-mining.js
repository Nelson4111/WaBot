import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik *.adventure* dulu.')

  let cooldown = 120000 // 120.000 ms = 2 Menit
  if (Date.now() - (user.lastMining || 0) < cooldown) {
    let sisa = (cooldown - (Date.now() - user.lastMining)) / 1000
    return m.reply(`LELAH: Tunggu ${sisa.toFixed(0)} detik lagi agar energimu pulih.`)
  }

  // Bonus Pickaxe: +1 Gold per 2 level pickaxe
  let bonusPick = Math.floor((user.pickaxe || 0) / 2)
  
  // Perolehan Material Dasar
  let gold = Math.floor(Math.random() * 3) + 1 + bonusPick
  let stone = Math.floor(Math.random() * 10) + 5 
  
  // --- LOGIKA PELUANG DIAMOND 15% ---
  let hanceDiamond = Math.random() * 100
  let diamond = 0
  if (hanceDiamond <= 15) { 
    diamond = 1
  }

  // XP Bonus (Kucing)
  let expDapat = 80 + (user.pet?.tipe === 'kucing' ? 20 : 0)

  // Update Database User
  user.gold = (user.gold || 0) + gold
  user.stone = (user.stone || 0) + stone
  user.diamond = (user.diamond || 0) + diamond
  user.exp += expDapat
  user.lastMining = Date.now()

  // Auto Level Up
  if (user.exp >= user.level * 500) { 
    user.level++
    user.exp = 0 
  }

  saveDB(wdb)
  
  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')

  // Notifikasi khusus jika dapat Diamond
  let statusDiamond = diamond > 0 ? `\n💎 *Diamond: +${diamond}* (Hoki!)` : ''

  conn.sendMessage(m.chat, {
    text: `*───「 MINING 」───*\n\n┌ ✨ Gold: +${gold}\n│ 🪨 Stone: +${stone}${statusDiamond}\n└ 🌟 XP: +${expDapat}\n\nLvl Pickaxe: ${user.pickaxe || 0}`,
    contextInfo: { 
      externalAdReply: { 
        title: "MINING", 
        body: `Miner: ${m.pushName}`, 
        thumbnailUrl: 'https://c.termai.cc/i140/srjE7x6',
        mediaType: 1, 
        renderLargerThumbnail: true 
      } 
    }
  }, { quoted: m })
}

handler.help = ['mining']
handler.tags = ['rpg']
handler.command = ['mining', 'tambang']

export default handler