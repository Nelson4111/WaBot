import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.guilds) wdb.guilds = {} // FIX: init guild biar ga undefined
  if (!wdb.users) wdb.users = {}

  let user = getUserRPG(m.sender)
  if (!user) return m.reply('📖 Untuk bermain rpg ketik *.adventure*')

  if (!text) return m.reply(`Masukkan nama guild! Contoh: ${usedPrefix}${command} ZETA`)

  let guildName = text.trim()
  let guild = wdb.guilds[guildName]
  if (!guild) return m.reply('❌ Guild tidak ditemukan.')
  if (guild.members && guild.members.includes(m.sender)) return m.reply('❌ Kamu sudah ada di guild ini.')

  // INISIALISASI BIAR GA ERROR
  guild.members = guild.members || []
  guild.contribution = guild.contribution || {}
  guild.level = guild.level || 1

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

  let hasGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender)) // FIX: cek members dulu
  if (hasGuild) return m.reply('❌ Keluar dari guild lamamu dulu!')

  guild.members.push(m.sender)
  guild.contribution[m.sender] = 0
  saveDB(wdb)

  return sendRpgMsg(conn, m, `✅ Berhasil bergabung dengan Guild *${guildName}*!\nSelamat datang di guild!`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
}

handler.help = ['joinguild']
handler.tags = ['rpg']
handler.command = ['joinguild']
handler.group = true
export default handler