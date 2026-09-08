import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = getUserRPG(m.sender)

  if (!wdb.guilds || Object.keys(wdb.guilds).length === 0) return m.reply('❌ Belum ada Guild yang terdaftar.')

  // CEK COOLDOWN USER
  let cooldownStatus = ''
  let cooldown = user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
    let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    cooldownStatus = `⏰ *Cooldown:* ${jam}j ${menit}m lagi\n`
  } else {
    cooldownStatus = `✅ *Status:* Bisa Join/Create Guild\n`
  }

  let list = `╭─❏「 🏰 AVELIA GUILD LIST 」❏\n`
list += `│ [ Status ] ${cooldownStatus.trim()}\n`
list += `╰─━━━━━━━━━━━━━━─\n\n`

let index = 1
for (let name in wdb.guilds) {
  let g = wdb.guilds[name]
  let maxMembers = 10 + ((g.level || 1) - 1) * 2
  list += `🏰 *${index++}. ${g.name}*\n`
  list += `> 👑 Leader: ${conn.getName(g.leader)}\n`
  list += `> 🌟 Level: Lv.${g.level || 1} - 👥 Member: ${g.members.length}/${maxMembers}\n\n`
}

list += `─━━━━━━━━━━━━━━─\n`
list += `📌 *Join Guild*\n`
list += `> ↳ *.joinguild <nama>*\n`
list += `╰─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, list, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')}

handler.help = ['listguild']
handler.tags = ['rpg']
handler.command = ['listguild']
export default handler
