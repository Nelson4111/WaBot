import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

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

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  conn.sendMessage(m.chat, {
    text: `*───「 FISHING 」───*\n\n🎣 Kamu mendapatkan: *1 ${ikan.toUpperCase()}*\n✨ XP: +${exp}\n\nLevel Pancingan: ${rodLvl}`,
    contextInfo: { externalAdReply: { title: "ZETA FISHING", body: `Angler: ${m.pushName}`, thumbnailUrl: pp, mediaType: 1, renderLargerThumbnail: true }}
  }, { quoted: m })
}

handler.help = ['mancing']
handler.tags = ['rpg']
handler.command = ['mancing', 'fishing']
export default handler