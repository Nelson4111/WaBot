import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.guilds) wdb.guilds = {}
  
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Untuk bermain rpg ketik .adventure')

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  if (!action) {
    let myGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
    if (!myGuild) return m.reply(`Kamu belum punya Guild. Ketik *${usedPrefix}${command} create [nama]*`)

    // Validasi & Inisialisasi Data agar tidak null
    myGuild.level = myGuild.level || 1
    myGuild.exp = myGuild.exp || 0
    if (!myGuild.contribution) myGuild.contribution = {}

    let nextExp = (myGuild.level * 1000) || 1000
    
    let cap = `*───「 GUILD INFO: ${myGuild.name} 」───*\n\n`
    cap += `👑 *Leader:* @${(myGuild.leader || '').split('@')[0]}\n`
    cap += `🌟 *Level:* ${myGuild.level}\n`
    cap += `✨ *Exp:* ${(myGuild.exp).toLocaleString()} / ${nextExp.toLocaleString()}\n`
    cap += `👥 *Member:* ${(myGuild.members || []).length} / 10\n\n`
    cap += `*📊 KONTRIBUSI MEMBER:*\n`
    
    let members = myGuild.members || []
    let sortedMembers = [...members].sort((a, b) => (myGuild.contribution[b] || 0) - (myGuild.contribution[a] || 0))
    
    sortedMembers.forEach((v, i) => {
      let contrib = myGuild.contribution[v] || 0
      cap += `${i + 1}. @${v.split('@')[0]} [ ${contrib.toLocaleString()} Pts ]\n`
    })

    return conn.sendMessage(m.chat, { 
      text: cap, 
      contextInfo: { 
        mentionedJid: members,
        externalAdReply: {
          title: `GUILD: ${myGuild.name}`,
          body: `Level: ${myGuild.level} | Exp: ${myGuild.exp.toLocaleString()}`,
          thumbnailUrl: 'https://c.termai.cc/i142/XU7iEW',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      } 
    }, { quoted: m })
  }

  if (action === 'create') {
    let name = args.slice(1).join(' ')
    if (!name || name.length > 15) return m.reply('Nama guild tidak valid (Max 15 huruf).')
    
    if (wdb.guilds[name]) return m.reply('❌ Nama Guild tersebut sudah ada.')
    
    let hasGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
    if (hasGuild) return m.reply('❌ Kamu sudah berada di dalam sebuah Guild.')

    let price = 500000
    let moneySaku = wdb.money[m.sender] || 0
    if (moneySaku < price) return m.reply(`Uang kurang! Butuh Rp ${price.toLocaleString()}`)

    wdb.money[m.sender] -= price
    wdb.guilds[name] = {
      name: name, 
      leader: m.sender, 
      members: [m.sender],
      contribution: { [m.sender]: 0 }, 
      level: 1, 
      exp: 0, 
      lastMission: 0
    }
    saveDB(wdb)
    m.reply(`🎉 Guild *${name}* berhasil dibentuk!`)
  }
}

handler.help = ['guild']
handler.tags = ['rpg']
handler.command = ['guild']
export default handler