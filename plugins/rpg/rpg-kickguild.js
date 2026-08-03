import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let myGuild = Object.values(wdb.guilds || {}).find(g => g.leader === m.sender)
  
  if (!myGuild) return m.reply('❌ Hanya Leader Guild yang bisa menendang member.')

  let target
  if (m.quoted) {
    target = m.quoted.sender
  } else if (text) {
    target = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }

  if (!target) return m.reply(`*Format Salah!*\n\n*Reply:* Balas chat member lalu ketik *${usedPrefix}${command}*\n*Nomor:* ${usedPrefix}${command} 628xxx`)

  let index = myGuild.members.indexOf(target)
  if (index === -1) return m.reply('❌ Orang tersebut bukan member guild kamu.')
  if (target === m.sender) return m.reply('❌ Kamu tidak bisa mengeluarkan diri sendiri!')

  myGuild.members.splice(index, 1)
  if (myGuild.contribution) delete myGuild.contribution[target]
  
  saveDB(wdb)

  return sendRpgMsg(conn, m, `✅ Berhasil mengeluarkan @${target.split('@')[0]} dari Guild *${myGuild.name}*`, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg', { contextInfo: { mentionedJid: [target] } })
}

handler.help = ['kickguild <nomor/reply>']
handler.tags = ['rpg']
handler.command = ['kickguild']
export default handler