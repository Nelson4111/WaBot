import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.guilds) wdb.guilds = {}
  if (!wdb.money) wdb.money = {}

  let user = getUserRPG(wdb, m.sender)
  if (!user) return m.reply('📖 Untuk bermain rpg ketik *.adventure*')

  if (wdb.money[m.sender] === undefined && user.money !== undefined) {
    wdb.money[m.sender] = user.money || 0
  }

  let args = text ? text.trim().split(/\s+/) : []
  let action = args[0]?.toLowerCase()
  const resourceNames = { money: 'Money', iron: 'Iron', gold: 'Gold', stone: 'Stone', diamond: 'Diamond', emerald: 'Emerald' }
  const normalizeResource = value => ({ uang: 'money', gemstone: 'emerald' }[String(value || '').toLowerCase()] || String(value || '').toLowerCase())
  const readResource = (jid, rpg, item) => item === 'money'
    ? Number(wdb.money[jid]) || 0
    : item === 'emerald'
      ? Number(rpg.inventory?.gemstone) || 0
      : Number(rpg[item]) || 0
  const changeResource = (jid, rpg, item, amount) => {
    if (item === 'money') wdb.money[jid] = (Number(wdb.money[jid]) || 0) + amount
    else if (item === 'emerald') {
      rpg.inventory = rpg.inventory || {}
      rpg.inventory.gemstone = (Number(rpg.inventory.gemstone) || 0) + amount
    } else rpg[item] = (Number(rpg[item]) || 0) + amount
  }
  const formatResources = loot => Object.entries(resourceNames)
    .filter(([item]) => Number(loot?.[item]) > 0)
    .map(([item, name]) => `${name}: ${Number(loot[item]).toLocaleString('id-ID')}`)
    .join(', ')

  if (action === 'guide') {
    const guide = `╭─❏「 📖 GUILD GUIDE 」❏
│ Tutorial Guild Avelia
╰─━━━━━━━━━━━━━━─

📌 *1. Buat Guild Baru*
> ${usedPrefix}guild create <nama>
> Contoh: ${usedPrefix}guild create Avelia
> Biaya pembuatan: Rp 500.000

📌 *2. Lihat Guild yang Tersedia*
> ${usedPrefix}guild list
> ${usedPrefix}guild top

📌 *3. Bergabung ke Guild*
> ${usedPrefix}joinguild <nama guild>
> Contoh: ${usedPrefix}joinguild Avelia

📌 *4. Cek Status Guild Kamu*
> ${usedPrefix}guild

📌 *5. Naikkan Level Guild*
> ${usedPrefix}misiguild
> ${usedPrefix}misiguild <nomor misi>
> Selesaikan misi untuk mendapatkan kontribusi dan EXP Guild.

📌 *6. Aktivitas Guild*
> ${usedPrefix}latihanguild
> ${usedPrefix}pestaguild
> ${usedPrefix}guild donate <jumlah>
> Donasi dibagikan ke seluruh anggota guild.

📌 *7. Gunakan Poin Guild*
> ${usedPrefix}guildshop
> Beli buff menggunakan poin kontribusi pribadi.

📌 *8. Ambil Loot Guild*
> ${usedPrefix}guild loot
> ${usedPrefix}guild loot take
> ${usedPrefix}guild loot list (leader)
> ${usedPrefix}guild loot collect (leader)

📌 *9. Guild Storage*
> ${usedPrefix}guild storage
> ${usedPrefix}guild storage add <item> <jumlah>
> ${usedPrefix}guild storage take <item> <jumlah> (semua anggota)

📌 *10. Guild War*
> ${usedPrefix}guildwar @tag
> ${usedPrefix}guildwar acak
> Tantang guild lain dan ikuti instruksi penerimaan war.

📌 *11. Keluar dari Guild*
> ${usedPrefix}leaveguild
> Setelah keluar, ada cooldown sebelum bisa join/create lagi.

⚠️ *Catatan:* Satu user hanya bisa berada di satu guild dan beberapa aktivitas memiliki cooldown.`
    return m.reply(guide)
  }

  if (action === 'loot') {
    const myGuild = Object.values(wdb.guilds).find(g => g.members && g.members.includes(m.sender))
    if (!myGuild) return m.reply('❌ Kamu belum bergabung dengan Guild.')
    myGuild.pendingLoot = myGuild.pendingLoot || {}
    const lootAction = args[1]?.toLowerCase()
    if (lootAction === 'list') {
      if (myGuild.leader !== m.sender) return m.reply('❌ Daftar loot semua anggota hanya bisa dilihat leader guild.')
      const entries = myGuild.members
        .map(jid => ({ jid, loot: myGuild.pendingLoot[jid] || {} }))
        .filter(({ loot }) => Object.values(loot).some(amount => Number(amount) > 0))
      if (!entries.length) return m.reply('🎁 Belum ada loot misi yang menunggu diambil.')
      const list = entries.map(({ jid, loot }) => `> @${jid.split('@')[0]}: ${formatResources(loot)}`).join('\n')
      return m.reply(`╭─❏「 🎁 PENDING GUILD LOOT 」❏\n${list}\n╰─━━━━━━━━━━━━━━─`, null, { mentions: entries.map(entry => entry.jid) })
    }

    if (lootAction === 'take' || lootAction === 'collect') {
      const isCollect = lootAction === 'collect'
      if (isCollect && myGuild.leader !== m.sender) return m.reply('❌ Hanya leader yang bisa mengumpulkan loot semua anggota.')
      const recipients = isCollect ? myGuild.members : [m.sender]
      const total = Object.fromEntries(Object.keys(resourceNames).map(item => [item, 0]))
      for (const jid of recipients) {
        const pending = myGuild.pendingLoot[jid] || {}
        for (const item of Object.keys(total)) {
          total[item] += Math.max(0, Number(pending[item]) || 0)
          pending[item] = 0
        }
        myGuild.pendingLoot[jid] = pending
      }
      if (!Object.values(total).some(amount => amount > 0)) return m.reply('🎁 Tidak ada loot misi yang bisa diambil.')
      for (const [item, amount] of Object.entries(total)) {
        if (!amount) continue
        const target = getUserRPG(wdb, m.sender).rpg
        changeResource(m.sender, target, item, amount)
        if (item === 'diamond') {
          target.guildLoot = target.guildLoot || { diamond: 0, emerald: 0 }
          target.guildLoot.diamond += amount
        }
        if (item === 'emerald') {
          target.guildLoot = target.guildLoot || { diamond: 0, emerald: 0 }
          target.guildLoot.emerald += amount
        }
      }
      saveDB(wdb)
      return m.reply(`✅ ${isCollect ? 'Leader mengumpulkan semua loot pending' : 'Loot guild berhasil diambil'}:\n${formatResources(total)}`)
    }

    const pending = myGuild.pendingLoot[m.sender] || {}
    const cap = `╭─❏「 🎁 GUILD LOOT 」❏\n├[ 🏰 Guild ] ${myGuild.name}\n├[ 💎 Diamond dimiliki ] ${(Number(user.rpg.diamond) || 0).toLocaleString()}\n├[ 💚 Emerald dimiliki ] ${(Number(user.rpg.inventory?.gemstone) || 0).toLocaleString()}\n├[ ⏳ Loot pending ] ${formatResources(pending) || 'Kosong'}\n╰─━━━━━━━━━━━━━━─\nKetik *${usedPrefix}guild loot take* untuk mengambil loot milikmu.`
    return m.reply(cap)
  }

  if (action === 'storage') {
    const myGuild = Object.values(wdb.guilds).find(g => g.members?.includes(m.sender))
    if (!myGuild) return m.reply('❌ Kamu belum bergabung dengan Guild.')
    myGuild.storage = myGuild.storage || {}
    const operation = args[1]?.toLowerCase()
    if (!operation) {
      const summary = formatResources(myGuild.storage) || 'Kosong'
      return m.reply(`╭─❏「 🏦 GUILD STORAGE 」❏\n🏰 ${myGuild.name}\n${summary}\n╰─━━━━━━━━━━━━━━─`)
    }
    const item = normalizeResource(args[2])
    const amount = Number(args[3])
    if (!['add', 'take'].includes(operation) || !resourceNames[item] || !Number.isSafeInteger(amount) || amount <= 0) {
      return m.reply(`Format: ${usedPrefix}guild storage <add/take> <money/iron/gold/stone/diamond/emerald> <jumlah>`)
    }
    const rpg = getUserRPG(wdb, m.sender).rpg
    if (operation === 'add') {
      if (readResource(m.sender, rpg, item) < amount) return m.reply(`❌ ${resourceNames[item]} kamu tidak cukup.`)
      changeResource(m.sender, rpg, item, -amount)
      myGuild.storage[item] = (Number(myGuild.storage[item]) || 0) + amount
    } else {
      if ((Number(myGuild.storage[item]) || 0) < amount) return m.reply(`❌ Stok ${resourceNames[item]} di storage tidak cukup.`)
      myGuild.storage[item] -= amount
      changeResource(m.sender, rpg, item, amount)
    }
    saveDB(wdb)
    return m.reply(`✅ ${operation === 'add' ? 'Ditambahkan ke' : 'Diambil dari'} guild storage: ${amount.toLocaleString('id-ID')} ${resourceNames[item]}.`)
  }

  if (action === 'list' || action === 'top') {
    const guilds = Object.values(wdb.guilds)
    if (!guilds.length) return m.reply('❌ Belum ada Guild yang terdaftar.')
    if (action === 'top') guilds.sort((a, b) => (b.level || 1) - (a.level || 1) || (b.exp || 0) - (a.exp || 0))
    const title = action === 'top' ? '🏆 TOP GUILD' : '🏰 DAFTAR GUILD'
    const lines = (action === 'top' ? guilds.slice(0, 10) : guilds).map((guild, index) =>
      `${index + 1}. *${guild.name}* | Lv.${guild.level || 1} (${Number(guild.exp) || 0} EXP) | ${guild.members?.length || 0} member`
    )
    return m.reply(`╭─❏「 ${title} 」❏\n${lines.join('\n')}\n╰─━━━━━━━━━━━━━━─`)
  }

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

    let cooldown = scaleDifficultyCooldown(user.rpg || user, user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    let cdText = ''
    if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
        let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        cdText = `│ ⏰ *CD Join/Create:* ${jam}j ${menit}m\n`
    }

    let cap = `╭─❏「 🏰 GUILD INFO 」❏\n`
    cap += `│ 📛 *Nama:* ${myGuild.name}\n`
    cap += `│ 👑 *Leader:* @${(myGuild.leader || '').split('@')[0]}\n`
    cap += cdText
    cap += `│ 🌟 *Level:* ${myGuild.level}\n`
    cap += `│ ✨ *Exp:* ${(myGuild.exp).toLocaleString()} / ${nextExp.toLocaleString()}\n`
    cap += `│ 👥 *Member:* ${(myGuild.members || []).length} / ${maxMembers}\n`
    if(Date.now() < myGuild.warCooldown) cap += `│ ⚠️ *War CD:* Aktif\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `╭─❏「 📊 KONTRIBUSI 」❏\n`
    let members = myGuild.members || []
    let sortedMembers = [...members].sort((a, b) => (myGuild.contribution[b] || 0) - (myGuild.contribution[a] || 0))
    sortedMembers.forEach((v, i) => {
      let contrib = myGuild.contribution[v] || 0
      cap += `│ ${i + 1}. @${v.split('@')[0]} [${contrib.toLocaleString()}]\n`
    })
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `╭─❏「 ⚡ BUFF AKTIF 」❏\n`
    if(Date.now() < myGuild.buffAttack) cap += `│ ⚔️ Attack +200\n`
    if(Date.now() < myGuild.buffDefense) cap += `│ 🛡️ Defense +200\n`
    if(Date.now() < myGuild.buffMagic) cap += `│ 🔮 Magic +200\n`
    if(Date.now() < myGuild.buffLuck) cap += `│ 🍀 Luck +50%\n`
    if(Date.now() < myGuild.buffSpeed) cap += `│ ⚡ Speed -50%\n`
    if(Date.now() < myGuild.buffHeal) cap += `│ 💊 Heal +30% HP\n`
    if(Date.now() < myGuild.buffMulti) cap += `│ 📈 Multiplier +50% Exp\n`
    if(Date.now() > myGuild.buffAttack && Date.now() > myGuild.buffDefense && Date.now() > myGuild.buffMagic && Date.now() > myGuild.buffLuck && Date.now() > myGuild.buffSpeed && Date.now() > myGuild.buffHeal && Date.now() > myGuild.buffMulti) cap += `│ - Tidak ada\n`
    cap += `╰─━━━━━━━━━━━━━━─\n`

    cap += `╭─❏「 📜 COMMAND 」❏\n`
    cap += `│ ${usedPrefix}guildshop\n`
    cap += `│ ${usedPrefix}misiguild\n`
    cap += `│ ${usedPrefix}pestaguild\n`
    cap += `│ ${usedPrefix}latihanguild\n`
    cap += `│ ${usedPrefix}guild donate [jumlah]\n`
    cap += `│ ${usedPrefix}guild loot\n`
    cap += `│ ${usedPrefix}guild loot take | list | collect\n`
    cap += `│ ${usedPrefix}guild storage [add/take item jumlah]\n`
    cap += `│ ${usedPrefix}guild list | top\n`
    cap += `│ ${usedPrefix}guildwar @tag | acak\n`
    cap += `╰─━━━━━━━━━━━━━━─`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i142/XU7iEW', { contextInfo: { mentionedJid: members } })
  }

  if (action === 'create') {
    let cooldown = scaleDifficultyCooldown(user.rpg || user, user.lastGuildCooldownType === 'kick'? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
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

handler.help = ['guild', 'guild list', 'guild top', 'guild loot', 'guild storage']
handler.tags = ['rpg']
handler.command = ['guild']
export default handler
