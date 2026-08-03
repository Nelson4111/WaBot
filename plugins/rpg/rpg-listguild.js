import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

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

  return sendRpgMsg(conn, m, list + `_Gunakan .joinguild <nama> untuk bergabung_`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
}

handler.help = ['listguild']
handler.tags = ['rpg']
handler.command = ['listguild']

export default handler