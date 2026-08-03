import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { generateFishingCard } from '../../lib/cardGenerator.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')

  let cooldown = 60000 // 1 Menit
  if (Date.now() - (user.lastMancing || 0) < cooldown) return m.reply('Sabar, ikan belum makan umpan.')

  // Bonus Fishingrod: Level tinggi mempermudah dapat Hiu
  let rodLvl = user.fishingrod || 0
  let hance = Math.random() * 100
  let ikan = ''
  let exp = 0

  if (hance > (95 - rodLvl * 2)) { ikan = 'hiu'; exp = 150 }
  else if (hance > 70) { ikan = 'bawal'; exp = 40 }
  else if (hance > 40) { ikan = 'nila'; exp = 20 }
  else { ikan = 'lele'; exp = 10 }

  if (!user.ikan) user.ikan = {}
  user.ikan[ikan] = (user.ikan[ikan] || 0) + 1
  user.exp += exp
  user.lastMancing = Date.now()

  if (user.exp >= user.level * 500) { user.level++; user.exp = 0 }
  saveDB(wdb)

  let pp = 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {}

  let caption = `*───「 FISHING 」───*\n\n🎣 Kamu mendapatkan: *1 ${ikan.toUpperCase()}*\n✨ XP: +${exp}\n\nLevel Pancingan: ${rodLvl}`
  let username = conn.getName(m.sender) || m.pushName || 'Player'

  try {
    let cardBuf = await generateFishingCard({ avatarUrl: pp, username, ikan, exp, rodLevel: rodLvl })
    if (cardBuf) {
      return conn.sendMessage(m.chat, { image: cardBuf, caption, mentions: [m.sender] }, { quoted: m })
    }
  } catch (e) {
    console.error('[FishingCard] Error generating card:', e.message)
  }

  return sendRpgMsg(conn, m, caption, pp)
}

handler.help = ['mancing']
handler.tags = ['rpg']
handler.command = ['mancing', 'fishing']
export default handler