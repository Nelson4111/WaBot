import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = getUserRPG(m.sender)

  if (!text) return m.reply(`Masukkan nama guild! Contoh: ${usedPrefix}${command} ZETA`)

  let guild = wdb.guilds[text]
  if (!guild) return m.reply('❌ Guild tidak ditemukan.')
  if (guild.members.includes(m.sender)) return m.reply('❌ Kamu sudah ada di guild ini.')

  // CEK COOLDOWN
  let cooldown = user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
    let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    return m.reply(`⏰ Kamu masih cooldown!\nTunggu *${jam} jam ${menit} menit* lagi untuk join/create guild.`)
  }

  let maxMembers = 10 + ((guild.level || 1) - 1) * 2
  if (guild.members.length >= maxMembers) return m.reply(`❌ Guild sudah penuh (Max ${maxMembers}).`)

  let hasGuild = Object.values(wdb.guilds).find(g => g.members.includes(m.sender))
  if (hasGuild) return m.reply('❌ Keluar dari guild lamamu dulu!')

  guild.members.push(m.sender)
  if (!guild.contribution) guild.contribution = {}
  guild.contribution[m.sender] = 0
  saveDB(wdb)

  return sendRpgMsg(conn, m, `✅ Berhasil bergabung dengan Guild *${text}*!`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
}

handler.help = ['joinguild']
handler.tags = ['rpg']
handler.command = ['joinguild']
export default handler