import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
let handler = async (m, { conn }) => {
  const wdb = loadDB()
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
  saveDB(wdb)

  return conn.sendMessage(m.chat, {
    text: `✅ Kamu berhasil keluar dari Guild *${guildName}*.`,
    contextInfo: {
      externalAdReply: {
        title: "GUILD DEPARTURE",
        body: `Good luck on your next journey!`,
        thumbnailUrl: 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['leaveguild']
handler.tags = ['rpg']
handler.command = ['leaveguild']
export default handler