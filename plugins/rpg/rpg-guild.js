import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.guilds) wdb.guilds = {}

  let user = getUserRPG(m.sender)
  if (!user) return m.reply('📖 Untuk bermain rpg ketik *.adventure*')

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  if (!action) {
    let myGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
    if (!myGuild) return m.reply(`🏰 Kamu belum punya Guild.\nKetik *${usedPrefix}${command} create [nama]*`)

    myGuild.level = myGuild.level || 1
    myGuild.exp = myGuild.exp || 0
    if (!myGuild.contribution) myGuild.contribution = {}
    if (!myGuild.buffAttack) myGuild.buffAttack = 0
    if (!myGuild.buffDefense) myGuild.buffDefense = 0
    if (!myGuild.buffLuck) myGuild.buffLuck = 0
    if (!myGuild.buffSpeed) myGuild.buffSpeed = 0
    if (!myGuild.buffHeal) myGuild.buffHeal = 0
    if (!myGuild.buffMagic) myGuild.buffMagic = 0
    if (!myGuild.buffMulti) myGuild.buffMulti = 0
    if (!myGuild.warCooldown) myGuild.warCooldown = 0
    if (!myGuild.lastParty) myGuild.lastParty = 0
    if (!myGuild.lastTrain) myGuild.lastTrain = 0

    let nextExp = myGuild.level * 1000
    let maxMembers = 10 + ((myGuild.level || 1) - 1) * 2

    let cooldown = user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    let cdText = ''
    if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
        let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        cdText = `│ ⏰ *CD Join/Create:* ${jam}j ${menit}m\n`
    }

    let cap = `╭──「 🏰 GUILD INFO 」──╮\n`
    cap += `│ 📛 *Nama:* ${myGuild.name}\n`
    cap += `│ 👑 *Leader:* @${(myGuild.leader || '').split('@')[0]}\n`
    cap += cdText
    cap += `│ 🌟 *Level:* ${myGuild.level}\n`
    cap += `│ ✨ *Exp:* ${(myGuild.exp).toLocaleString()} / ${nextExp.toLocaleString()}\n`
    cap += `│ 👥 *Member:* ${(myGuild.members || []).length} / ${maxMembers}\n`
    if(Date.now() < myGuild.warCooldown) cap += `│ ⚠️ *War CD:* Aktif\n`
    cap += `╰───────────────────╯\n\n`

    cap += `╭──「 📊 KONTRIBUSI 」──╮\n`
    let members = myGuild.members || []
    let sortedMembers = [...members].sort((a, b) => (myGuild.contribution[b] || 0) - (myGuild.contribution[a] || 0))
    sortedMembers.forEach((v, i) => {
      let contrib = myGuild.contribution[v] || 0
      cap += `│ ${i + 1}. @${v.split('@')[0]} [${contrib.toLocaleString()}]\n`
    })
    cap += `╰───────────────────╯\n\n`

    cap += `╭──「 ⚡ BUFF AKTIF 」──╮\n`
    if(Date.now() < myGuild.buffAttack) cap += `│ ⚔️ Attack +200\n`
    if(Date.now() < myGuild.buffDefense) cap += `│ 🛡️ Defense +200\n`
    if(Date.now() < myGuild.buffMagic) cap += `│ 🔮 Magic +200\n`
    if(Date.now() < myGuild.buffLuck) cap += `│ 🍀 Luck +50%\n`
    if(Date.now() < myGuild.buffSpeed) cap += `│ ⚡ Speed -50%\n`
    if(Date.now() < myGuild.buffHeal) cap += `│ 💊 Heal +30% HP\n`
    if(Date.now() < myGuild.buffMulti) cap += `│ 📈 Multiplier +50% Exp\n`
    if(Date.now() > myGuild.buffAttack && Date.now() > myGuild.buffDefense && Date.now() > myGuild.buffMagic && Date.now() > myGuild.buffLuck && Date.now() > myGuild.buffSpeed && Date.now() > myGuild.buffHeal && Date.now() > myGuild.buffMulti) cap += `│ - Tidak ada\n`
    cap += `╰───────────────────╯\n`

    cap += `╭──「 📜 COMMAND 」──╮\n`
    cap += `│ ${usedPrefix}guildshop\n`
    cap += `│ ${usedPrefix}misiguild\n`
    cap += `│ ${usedPrefix}pestaguild\n`
    cap += `│ ${usedPrefix}latihanguild\n`
    cap += `│ ${usedPrefix}guild donate [jumlah]\n`
    cap += `│ ${usedPrefix}guildwar @tag | acak\n`
    cap += `╰───────────────────╯`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i142/XU7iEW', { contextInfo: { mentionedJid: members } })
  }

  if (action === 'create') {
    let cooldown = user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
        let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        return m.reply(`⏰ Kamu masih cooldown!\nTunggu *${jam} jam ${menit} menit* lagi untuk create guild.`)
    }

    let name = args.slice(1).join(' ')
    if (!name || name.length > 15) return m.reply('❌ Nama guild tidak valid (Max 15 huruf).')
    if (wdb.guilds[name]) return m.reply('❌ Nama Guild tersebut sudah ada.')
    let hasGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
    if (hasGuild) return m.reply('❌ Kamu sudah berada di dalam sebuah Guild.')

    let price = 500000
    let moneySaku = wdb.money[m.sender] || 0
    if (moneySaku < price) return m.reply(`💸 Uang kurang! Butuh Rp ${price.toLocaleString()}`)

    wdb.money[m.sender] -= price
    wdb.guilds[name] = {
      name: name, leader: m.sender, members: [m.sender],
      contribution: { [m.sender]: 0 }, level: 1, exp: 0, lastMission: 0, warCooldown: 0,
      lastParty: 0, lastTrain: 0,
      buffAttack: 0, buffDefense: 0, buffLuck: 0, buffSpeed: 0, buffHeal: 0, buffMagic: 0, buffMulti: 0
    }
    saveDB(wdb)
    m.reply(`🎉 Guild *${name}* berhasil dibentuk!\n💸 -Rp ${price.toLocaleString()}`)
  }

  if (action === 'donate') {
    let myGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
    if (!myGuild) return m.reply('❌ Kamu tidak punya guild')
    let jumlah = parseInt(args[1])
    if(!jumlah || jumlah < 1000) return m.reply('❌ Minimal donate Rp 1.000')
    let total = jumlah * myGuild.members.length
    if((wdb.money[m.sender] || 0) < total) return m.reply(`💸 Uang kamu kurang! Butuh Rp ${total.toLocaleString()}`)

    wdb.money[m.sender] -= total
    myGuild.members.forEach(jid => {
      wdb.money[jid] = (wdb.money[jid] || 0) + jumlah
    })
    saveDB(wdb)
    m.reply(`💰 *DONASI GUILD*\nBerhasil membagikan Rp ${jumlah.toLocaleString()} ke ${myGuild.members.length} anggota\nTotal: Rp ${total.toLocaleString()}`)
  }
}

handler.help = ['guild']
handler.tags = ['rpg']
handler.command = ['guild']
export default handler
