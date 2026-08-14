import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = getUserRPG(m.sender)
  let guildName = Object.keys(wdb.guilds || {}).find(name => wdb.guilds[name].members.includes(m.sender))
  if (!guildName) return m.reply('❌ Kamu belum bergabung dengan Guild.')

  let guild = wdb.guilds[guildName]
  if (guild.leader === m.sender) {
    delete wdb.guilds[guildName]
    saveDB(wdb)
    return m.reply(`⚠️ Guild *${guildName}* telah dibubarkan karena Leader keluar.`)
  }

  let index = guild.members.indexOf(m.sender)
  guild.members.splice(index, 1)
  delete guild.contribution[m.sender]

  // COOLDOWN 24 JAM
  user.lastGuildCooldown = Date.now()
  user.lastGuildCooldownType = 'leave'

  saveDB(wdb)

  return sendRpgMsg(conn, m, `✅ Kamu berhasil keluar dari Guild *${guildName}*.\n⏰ Cooldown 24 jam sebelum bisa join/create guild lagi.`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
}

handler.help = ['leaveguild']
handler.tags = ['rpg']
handler.command = ['leaveguild']
export default handler
