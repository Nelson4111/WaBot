import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  if (!wdb.guilds || Object.keys(wdb.guilds).length === 0) return m.reply('❌ Belum ada Guild yang terdaftar.')

  let list = `*───「 ZETA GUILD LIST 」───*\n\n`
  let index = 1
  for (let name in wdb.guilds) {
    let g = wdb.guilds[name]
    list += `${index++}. 🏰 *${g.name}* (Lv.${g.level || 1})\n`
    list += `   └─ 👑 Leader: ${conn.getName(g.leader)}\n`
    list += `   └─ 👥 Member: ${g.members.length}/10\n\n`
  }

  return conn.sendMessage(m.chat, {
    text: list + `_Gunakan .joinguild <nama> untuk bergabung_`,
    contextInfo: {
      externalAdReply: {
        title: "GUILD REGISTRY",
        body: `Total Guild Terdaftar: ${Object.keys(wdb.guilds).length}`,
        thumbnailUrl: 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['listguild']
handler.tags = ['rpg']
handler.command = ['listguild']

export default handler