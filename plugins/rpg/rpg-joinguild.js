import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!text) return m.reply(`Masukkan nama guild! Contoh: ${usedPrefix}${command} ZETA`)
  
  let guild = wdb.guilds[text]
  if (!guild) return m.reply('❌ Guild tidak ditemukan.')
  if (guild.members.includes(m.sender)) return m.reply('❌ Kamu sudah ada di guild ini.')
  if (guild.members.length >= 10) return m.reply('❌ Guild sudah penuh (Max 10).')

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