import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { findGuildByMember, getGuildMemberCap, isGuildMember } from '../../lib/rpgGuild.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.guilds) wdb.guilds = {} // FIX: init guild biar ga undefined
  if (!wdb.users) wdb.users = {}

  let user = getUserRPG(wdb, m.sender)
  if (!user) return m.reply('📖 Untuk bermain rpg ketik *.adventure*')

  if (!text) return m.reply(`Masukkan nama guild! Contoh: ${usedPrefix}${command} AVELIA`)

  let guildName = text.trim()
  let guild = wdb.guilds[guildName]
  if (!guild) return m.reply('❌ Guild tidak ditemukan.')
  if (isGuildMember(guild, m.sender, conn)) return m.reply('❌ Kamu sudah ada di guild ini.')

  // INISIALISASI BIAR GA ERROR
  guild.members = guild.members || []
  guild.contribution = guild.contribution || {}
  guild.level = guild.level || 1

  // CEK COOLDOWN
  let cooldown = scaleDifficultyCooldown(user.rpg || user, user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
  if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
    let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    return m.reply(`⏰ Kamu masih cooldown!\nTunggu *${jam} jam ${menit} menit* lagi untuk join/create guild.`)
  }

  let maxMembers = getGuildMemberCap(guild.level)
  if (guild.members.length >= maxMembers) return m.reply(`❌ Guild sudah penuh (Max ${maxMembers}).`)

  let hasGuild = findGuildByMember(wdb.guilds, m.sender, conn)
  if (hasGuild) return m.reply('❌ Keluar dari guild lamamu dulu!')

  guild.members.push(m.sender)
  guild.contribution[m.sender] = 0
  user.rpg.lastGuildMissionAt = Date.now()
  saveDB(wdb)

  return sendRpgMsg(conn, m, `╭─❏「 🏰 JOIN GUILD 」❏\n│ 🏰 Guild: ${guildName}\n├─ STATUS ─\n│ Berhasil bergabung. Selamat datang!\n╰─━━━━━━━━━━━━━━─`, 'https://files.cloudkuimages.guru/images/bbc63933dd81.jpeg')
}

handler.help = ['joinguild']
handler.tags = ['rpg']
handler.command = ['joinguild']
handler.group = true
export default handler