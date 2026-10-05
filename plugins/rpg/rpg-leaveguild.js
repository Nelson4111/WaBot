import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { areGuildJidsSame, findGuildByMember, findGuildMemberId } from '../../lib/rpgGuild.js'
let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = getUserRPG(m.sender)
  let guild = findGuildByMember(wdb.guilds, m.sender, conn)
  if (!guild) return m.reply('❌ Kamu belum bergabung dengan Guild.')
  let guildName = Object.keys(wdb.guilds).find(name => wdb.guilds[name] === guild)
  let memberId = findGuildMemberId(guild, m.sender, conn)
  if (areGuildJidsSame(guild.leader, m.sender, conn)) {
    delete wdb.guilds[guildName]
    saveDB(wdb)
    return m.reply(`╭─❏「 🏰 GUILD DIBUBARKAN 」❏\n│ 🏰 Guild: ${guildName}\n├─ STATUS ─\n│ Leader keluar dan Guild dibubarkan.\n╰─━━━━━━━━━━━━━━─`)
  }

  let index = guild.members.indexOf(memberId)
  guild.members.splice(index, 1)
  delete guild.contribution[memberId]

  // COOLDOWN 24 JAM
  user.lastGuildCooldown = Date.now()
  user.lastGuildCooldownType = 'leave'

  saveDB(wdb)

  return sendRpgMsg(conn, m, `╭─❏「 🏰 LEAVE GUILD 」❏\n│ 🏰 Guild: ${guildName}\n├─ STATUS ─\n│ Berhasil keluar.\n│ ⏰ Cooldown: 24 jam sebelum join/create lagi.\n╰─━━━━━━━━━━━━━━─`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
}

handler.help = ['leaveguild']
handler.tags = ['rpg']
handler.command = ['leaveguild']
export default handler
