import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { areGuildJidsSame, findGuildMemberId } from '../../lib/rpgGuild.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let myGuild = Object.values(wdb.guilds || {}).find(g => areGuildJidsSame(g.leader, m.sender, conn))

  if (!myGuild) return m.reply('❌ Hanya Leader Guild yang bisa menendang member.')

  let target
  if (m.quoted) {
    target = m.quoted.sender
  } else if (text) {
    target = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }

  if (!target) return m.reply(`╭─❏「 🦶 KICK GUILD 」❏\n├─ CARA MENGELUARKAN MEMBER ─\n│ Balas chat member lalu ketik *${usedPrefix}${command}*\n│ Atau gunakan: *${usedPrefix}${command} 628xxx*\n╰─━━━━━━━━━━━━━━─`)

  let targetId = findGuildMemberId(myGuild, target, conn)
  let index = myGuild.members.indexOf(targetId)
  if (index === -1) return m.reply('❌ Orang tersebut bukan member guild kamu.')
  if (areGuildJidsSame(targetId, m.sender, conn)) return m.reply('❌ Kamu tidak bisa mengeluarkan diri sendiri!')

  myGuild.members.splice(index, 1)
  if (myGuild.contribution) delete myGuild.contribution[targetId]

  // COOLDOWN 12 JAM UNTUK YANG DI KICK
  let targetUser = getUserRPG(wdb, targetId).rpg
  if (!targetUser) return m.reply('❌ Data RPG member tidak ditemukan.')
  targetUser.lastGuildCooldown = Date.now()
  targetUser.lastGuildCooldownType = 'kick'

  saveDB(wdb)

  return sendRpgMsg(conn, m, `╭─❏「 🦶 KICK GUILD 」❏\n│ 👤 Member: @${target.split('@')[0]}\n│ 🏰 Guild: ${myGuild.name}\n├─ STATUS ─\n│ Berhasil dikeluarkan.\n│ ⏰ Cooldown: 12 jam.\n╰─━━━━━━━━━━━━━━─`, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg', { contextInfo: { mentionedJid: [target] } })
}

handler.help = ['kickguild <nomor/reply>']
handler.tags = ['rpg']
handler.command = ['kickguild']
export default handler
