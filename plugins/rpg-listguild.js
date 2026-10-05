import { loadDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { getGuildMemberCap } from '../../lib/rpgGuild.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = getUserRPG(m.sender)

  if (!wdb.guilds || Object.keys(wdb.guilds).length === 0) return m.reply('❌ Belum ada Guild yang terdaftar.')

  // CEK COOLDOWN USER
  let cooldownStatus = ''
  let cooldown = scaleDifficultyCooldown(user.rpg || user, user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
  if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
    let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    cooldownStatus = `⏰ *Cooldown:* ${jam}j ${menit}m lagi\n`
  } else {
    cooldownStatus = `✅ *Status:* Bisa Join/Create Guild\n`
  }

  let list = `╭─❏「 🏰 AVELIA GUILD LIST 」❏\n`
list += `│ 📊 ${cooldownStatus.trim()}\n`
list += `╰─━━━━━━━━━━━━━━─\n\n`

let index = 1
const guildEntries = Object.entries(wdb.guilds)
for (let position = 0; position < guildEntries.length; position++) {
  const [name, g] = guildEntries[position]
  let maxMembers = getGuildMemberCap(g.level)
  list += `│ 🏰 *${index++}. ${g.name || name}*\n`
  list += `│ 👑 Leader: ${conn.getName(g.leader)}\n`
  list += `│ 🌟 Level: Lv.${g.level || 1}  •  👥 Member: ${(g.members || []).length}/${maxMembers}\n`
  if (position < guildEntries.length - 1) list += `├─━━━━━━━━━━━━━━─\n`
}

list += `├─━━━━━━━━━━━━━━─\n`
list += `│ 📌 Join: ${usedPrefix}guild join <nama>\n`
list += `╰─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, list, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')}

handler.help = ['listguild']
handler.tags = ['rpg']
handler.command = ['listguild']
export default handler
