import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import guildMissionHandler from './rpg-misiguild.js'
import guildWarHandler from './rpg-guildwar.js'
import guildJoinHandler from './rpg-joinguild.js'
import guildLeaveHandler from './rpg-leaveguild.js'
import guildKickHandler from './rpg-kickguild.js'
import guildShopHandler from './rpg-guildshop.js'
import {
  advanceGuildLevel,
  areGuildJidsSame,
  findGuildByMember,
  findGuildMemberId,
  getGuildMemberCap,
  getGuildLootCaps,
  normalizeGuildLoot,
  normalizeGuildPendingLoot
} from '../../lib/rpgGuild.js'

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
  const guildRoutes = {
    misi: [guildMissionHandler, 'misiguild'],
    mission: [guildMissionHandler, 'misiguild'],
    party: [guildMissionHandler, 'pestaguild'],
    pesta: [guildMissionHandler, 'pestaguild'],
    latihan: [guildMissionHandler, 'latihanguild'],
    training: [guildMissionHandler, 'latihanguild'],
    war: [guildWarHandler, 'guildwar'],
    join: [guildJoinHandler, 'joinguild'],
    leave: [guildLeaveHandler, 'leaveguild'],
    kick: [guildKickHandler, 'kickguild'],
    shop: [guildShopHandler, 'guildshop']
  }
  const route = guildRoutes[action]
  if (route) {
    if ((action === 'join' || action === 'war') && !m.isGroup) {
      return m.reply('❌ Perintah ini hanya bisa digunakan di grup.')
    }
    return route[0](m, {
      conn,
      text: args.slice(1).join(' '),
      usedPrefix,
      command: route[1]
    })
  }
  const resourceNames = { money: 'Money', iron: 'Iron', gold: 'Gold', stone: 'Stone', diamond: 'Diamond', gemstone: 'Gemstone' }
  const normalizeResource = value => ({ uang: 'money' }[String(value || '').toLowerCase()] || String(value || '').toLowerCase())
  const readResource = (jid, rpg, item) => item === 'money'
    ? Number(wdb.money[jid]) || 0
    : item === 'gemstone'
      ? Number(rpg.inventory?.gemstone) || 0
      : Number(rpg[item]) || 0
  const changeResource = (jid, rpg, item, amount) => {
    if (item === 'money') wdb.money[jid] = (Number(wdb.money[jid]) || 0) + amount
    else if (item === 'gemstone') {
      rpg.inventory = rpg.inventory || {}
      rpg.inventory.gemstone = (Number(rpg.inventory.gemstone) || 0) + amount
    } else rpg[item] = (Number(rpg[item]) || 0) + amount
  }
  const normalizePendingLoot = loot => {
    loot.gemstone = (Number(loot.gemstone) || 0) + (Number(loot.emerald) || 0)
    delete loot.emerald
    return loot
  }
  const formatResources = loot => Object.entries(resourceNames)
    .filter(([item]) => Number(loot?.[item]) > 0)
    .map(([item, name]) => `${name}: ${Number(loot[item]).toLocaleString('id-ID')}`)
    .join(', ')

  if (action === 'command') {
    const commands = [
      `${usedPrefix}guild`,
      `${usedPrefix}guild create <nama>`,
      `${usedPrefix}guild list`,
      `${usedPrefix}guild top`,
      `${usedPrefix}guild donate <jumlah>`,
      `${usedPrefix}guild loot`,
      `${usedPrefix}guild loot take`,
      `${usedPrefix}guild loot list`,
      `${usedPrefix}guild loot collect`,
      `${usedPrefix}guild storage`,
      `${usedPrefix}guild storage add/take <item> <jumlah>`,
      `${usedPrefix}guild command`,
      `${usedPrefix}guild guide`,
      `${usedPrefix}guild join <nama>`,
      `${usedPrefix}guild leave`,
      `${usedPrefix}guild kick @member`,
      `${usedPrefix}guild misi [nomor] (atau mission/list)`,
      `${usedPrefix}guild party (atau pesta)`,
      `${usedPrefix}guild latihan (atau training)`,
      `${usedPrefix}guild shop`,
      `${usedPrefix}guild war @tag/acak/terima/tolak`,
      `${usedPrefix}joinguild <nama> (alias lama)`,
      `${usedPrefix}leaveguild (alias lama)`,
      `${usedPrefix}kickguild @member (alias lama)`,
      `${usedPrefix}misiguild [nomor] (alias lama)`,
      `${usedPrefix}pestaguild (alias lama)`,
      `${usedPrefix}latihanguild (alias lama)`,
      `${usedPrefix}guildshop (alias lama)`,
      `${usedPrefix}guildwar @tag/acak (alias lama)`
    ]
    return m.reply(`╭─❏「 📜 GUILD COMMAND 」❏\n${commands.map(value => `│ ${value}`).join('\n')}\n╰─━━━━━━━━━━━━━━─`)
  }

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
> ${usedPrefix}guild join <nama guild>
> Contoh: ${usedPrefix}guild join Avelia

📌 *4. Cek Status Guild Kamu*
> ${usedPrefix}guild

📌 *5. Naikkan Level Guild*
> ${usedPrefix}guild misi
> ${usedPrefix}guild mission <nomor misi>
> Selesaikan misi untuk mendapatkan kontribusi dan EXP Guild.

📌 *6. Aktivitas Guild*
> ${usedPrefix}guild latihan
> ${usedPrefix}guild party
> ${usedPrefix}guild donate <jumlah>
> Donasi dibagikan ke seluruh anggota guild.

📌 *7. Gunakan Poin Guild*
> ${usedPrefix}guild shop
> Beli buff menggunakan poin kontribusi pribadi.

📌 *8. Ambil Loot Guild*
> ${usedPrefix}guild loot
> ${usedPrefix}guild loot take
> ${usedPrefix}guild loot list (leader)
> ${usedPrefix}guild loot collect (leader)
> Loot hanya bertambah untuk anggota yang menjalankan misi Guild dalam 4 hari terakhir. Batas Lv.1: Money Rp1.000.000 dan tiap loot lain 50; kapasitas anggota serta batas loot bertambah tiap 10 level dan batas loot berhenti naik mulai Lv.101.

📌 *9. Guild Storage*
> ${usedPrefix}guild storage
> ${usedPrefix}guild storage add <item> <jumlah>
> ${usedPrefix}guild storage take <item> <jumlah> (semua anggota)

📌 *10. Guild War*
> ${usedPrefix}guild war @tag
> ${usedPrefix}guild war acak
> Tantang guild lain dan ikuti instruksi penerimaan war.

📌 *11. Keluar dari Guild*
> ${usedPrefix}guild leave
> Setelah keluar, ada cooldown sebelum bisa join/create lagi.

⚠️ *Catatan:* Satu user hanya bisa berada di satu guild dan beberapa aktivitas memiliki cooldown.`
    return m.reply(guide)
  }

  if (action === 'loot') {
  const myGuild = findGuildByMember(wdb.guilds, m.sender, conn)

  if (!myGuild) {
    return m.reply(
      `╭─❏「 ❌ GUILD LOOT 」❏\n` +
      `│ ❌ *Kamu belum bergabung dengan Guild.*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  let migratedLegacyLoot = normalizeGuildPendingLoot(myGuild)

  for (const jid of myGuild.members || []) {
    const memberRpg = wdb.users[jid]?.rpg
    if (!memberRpg?.guildLoot) continue
    if (Object.hasOwn(memberRpg.guildLoot, 'emerald')) migratedLegacyLoot = true
    normalizeGuildLoot(memberRpg)
  }

  if (migratedLegacyLoot) saveDB(wdb)

  const memberId = findGuildMemberId(myGuild, m.sender, conn) || m.sender
  const lootAction = args[1]?.toLowerCase()

  if (lootAction === 'list') {
    if (!areGuildJidsSame(myGuild.leader, m.sender, conn)) {
      return m.reply(
        `╭─❏「 ❌ GUILD LOOT 」❏\n` +
        `│ ❌ *AKSES DITOLAK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Daftar loot semua anggota hanya bisa dilihat leader guild.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const entries = myGuild.members
      .map(jid => ({ jid, loot: myGuild.pendingLoot[jid] || {} }))
      .filter(({ loot }) => Object.values(loot).some(amount => Number(amount) > 0))

    if (!entries.length) {
      return m.reply(
        `╭─❏「 🎁 PENDING GUILD LOOT 」❏\n` +
        `│ 🎁 *BELUM ADA LOOT PENDING*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Belum ada loot misi yang menunggu diambil.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const list = entries
      .map(({ jid, loot }) =>
        `👤 *@${jid.split('@')[0]}*\n` +
        `> ↳ ${formatResources(normalizePendingLoot(loot))}`
      )
      .join('\n\n')

    return m.reply(
      `╭─❏「 🎁 PENDING GUILD LOOT 」❏\n` +
      `│ 🎁 *LOOT YANG MENUNGGU DIAMBIL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${list}\n\n` +
      `─━━━━━━━━━━━━━━─`,
      null,
      { mentions: entries.map(entry => entry.jid) }
    )
  }

  if (lootAction === 'take' || lootAction === 'collect') {
    const isCollect = lootAction === 'collect'

    if (isCollect && !areGuildJidsSame(myGuild.leader, m.sender, conn)) {
      return m.reply(
        `╭─❏「 ❌ GUILD LOOT 」❏\n` +
        `│ ❌ *AKSES DITOLAK*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Hanya leader yang bisa mengumpulkan loot semua anggota.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const recipients = isCollect ? myGuild.members : [memberId]
    const target = getUserRPG(wdb, m.sender).rpg
    const loot = normalizeGuildLoot(target)
    const caps = getGuildLootCaps(myGuild.level)
    const total = Object.fromEntries(Object.keys(resourceNames).map(item => [item, 0]))

    for (const item of Object.keys(total)) {
      let remaining = Math.max(0, caps[item] - loot[item])

      for (const jid of recipients) {
        const pending = normalizePendingLoot(myGuild.pendingLoot[jid] || {})
        const accepted = Math.min(
          Math.max(0, Number(pending[item]) || 0),
          remaining
        )

        if (!accepted) continue

        pending[item] -= accepted
        myGuild.pendingLoot[jid] = pending
        total[item] += accepted
        remaining -= accepted
      }

      loot[item] += total[item]

      if (total[item]) {
        changeResource(m.sender, target, item, total[item])
      }
    }

    if (!Object.values(total).some(amount => amount > 0)) {
      return m.reply(
        `╭─❏「 🎁 GUILD LOOT 」❏\n` +
        `│ 🎁 *TIDAK ADA LOOT YANG BISA DIAMBIL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Tidak ada pending loot yang bisa diambil saat ini.\n` +
        `> ↳ Batas loot naik setiap 10 level Guild dan berhenti bertambah mulai Lv.101.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    saveDB(wdb)

    return m.reply(
      `╭─❏「 ✅ GUILD LOOT DIAMBIL 」❏\n` +
      `│ ✅ *${isCollect ? 'Loot pending berhasil dikumpulkan' : 'Loot pending berhasil diambil'}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📦 *HASIL LOOT*\n` +
      `> ↳ ${formatResources(total)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const pending = normalizePendingLoot(myGuild.pendingLoot[memberId] || {})
  const loot = normalizeGuildLoot(user.rpg)
  const caps = getGuildLootCaps(myGuild.level)

  const lootLines = Object.entries(resourceNames)
    .map(([item, name]) =>
      `> ↳ ${name}: ${loot[item].toLocaleString('id-ID')} sudah diambil + ${(Number(pending[item]) || 0).toLocaleString('id-ID')} pending / ${caps[item].toLocaleString('id-ID')}`
    )
    .join('\n')

  const cap =
    `╭─❏「 🎁 GUILD LOOT 」❏\n` +
    `│ 🎁 *${myGuild.name}*\n` +
    `│ 🌟 Guild Lv.${myGuild.level || 1} • batas naik tiap 10 level (maks. Lv.101)\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📦 *LOOT / BATAS*\n` +
    `${lootLines}\n\n` +

    `🎁 *LOOT PENDING*\n` +
    `> ↳ ${formatResources(pending) || 'Kosong'}\n\n` +

    `📌 Pending belum masuk ke saldo/.bag sebelum diklaim.\n` +
    `> ↳ Ketik *${usedPrefix}guild loot take* untuk mengambil pending milikmu.\n\n` +

    `─━━━━━━━━━━━━━━─`

  return m.reply(cap)
}

if (action === 'storage') {
  const myGuild = findGuildByMember(wdb.guilds, m.sender, conn)

  if (!myGuild) {
    return m.reply(
      `╭─❏「 ❌ GUILD STORAGE 」❏\n` +
      `│ ❌ *Kamu belum bergabung dengan Guild.*\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  normalizeGuildPendingLoot(myGuild)
  myGuild.storage = normalizePendingLoot(myGuild.storage || {})

  const operation = args[1]?.toLowerCase()

  if (!operation) {
    const summary = formatResources(myGuild.storage) || 'Kosong'

    return m.reply(
      `╭─❏「 🏦 GUILD STORAGE 」❏\n` +
      `│ 🏰 *${myGuild.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📦 *STOK*\n` +
      `> ↳ ${summary}\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  const item = normalizeResource(args[2])
  const amount = Number(args[3])

  if (
    !['add', 'take'].includes(operation) ||
    !resourceNames[item] ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    return m.reply(
      `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
      `│ ❌ *Format guild storage tidak valid.*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +

      `📌 *FORMAT*\n` +
      `> ↳ ${usedPrefix}guild storage <add/take> <money/iron/gold/stone/diamond/gemstone> <jumlah>\n\n` +

      `─━━━━━━━━━━━━━━─`
    )
  }

  const rpg = getUserRPG(wdb, m.sender).rpg

  if (operation === 'add') {
    if (readResource(m.sender, rpg, item) < amount) {
      return m.reply(
        `╭─❏「 ❌ GUILD STORAGE 」❏\n` +
        `│ ❌ *RESOURCE TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${resourceNames[item]} kamu tidak cukup.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    changeResource(m.sender, rpg, item, -amount)
    myGuild.storage[item] = (Number(myGuild.storage[item]) || 0) + amount
  } else {
    if ((Number(myGuild.storage[item]) || 0) < amount) {
      return m.reply(
        `╭─❏「 ❌ GUILD STORAGE 」❏\n` +
        `│ ❌ *STOK TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Stok ${resourceNames[item]} di storage tidak cukup.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    myGuild.storage[item] -= amount
    changeResource(m.sender, rpg, item, amount)
  }

  saveDB(wdb)

  return m.reply(
    `╭─❏「 ✅ GUILD STORAGE 」❏\n` +
    `│ ✅ *TRANSAKSI BERHASIL*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📦 *DETAIL TRANSAKSI*\n` +
    `> ↳ ${operation === 'add' ? 'Ditambahkan ke' : 'Diambil dari'} guild storage\n` +
    `> ↳ Jumlah : ${amount.toLocaleString('id-ID')} ${resourceNames[item]}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  if (action === 'list' || action === 'top') {
    const guilds = Object.values(wdb.guilds)
    if (!guilds.length) return m.reply(
        `╭─❏「 🏰 GUILD 」❏\n` +
        `│ ❌ *Belum ada Guild yang terdaftar.*\n` +
        `╰─━━━━━━━━━━━━━━─`
    )

    if (action === 'top') guilds.sort((a, b) => (b.level || 1) - (a.level || 1) || (b.exp || 0) - (a.exp || 0))

    const title = action === 'top' ? '🏆 TOP GUILD' : '🏰 DAFTAR GUILD'

    const lines = (action === 'top' ? guilds.slice(0, 10) : guilds).map((guild, index) =>
        `🏰 *${index + 1}. ${guild.name}*\n` +
        `> ↳ Lv.${guild.level || 1} (${Number(guild.exp) || 0} EXP)\n` +
        `> ↳ ${guild.members?.length || 0} member`
    )

    return m.reply(
        `╭─❏「 ${title} 」❏\n` +
        `│ 📋 *DAFTAR GUILD*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${lines.join('\n\n')}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (!action) {
    let myGuild = findGuildByMember(wdb.guilds, m.sender, conn)
    if (!myGuild) return m.reply(
        `╭─❏「 🏰 GUILD 」❏\n` +
        `│ ❌ *Kamu belum bergabung dengan Guild.*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *BANTUAN GUILD*\n` +
        `> ↳ ${usedPrefix}guild command\n` +
        `> ↳ ${usedPrefix}guild guide\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

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
    let maxMembers = getGuildMemberCap(myGuild.level)
    let lootCaps = getGuildLootCaps(myGuild.level)

    let cooldown = scaleDifficultyCooldown(user.rpg || user, user.lastGuildCooldownType === 'kick' ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    let cdText = ''
    if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
        let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        cdText = `│ ⏰ *CD Join/Create:* ${jam}j ${menit}m\n`
    }

    let cap = `╭─❏「 🏰 GUILD INFO 」❏\n`
cap += `│ 🏰 *${myGuild.name}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`
cap += `> ↳ 👑 Leader : @${(myGuild.leader || '').split('@')[0]}\n`
cap += cdText ? `> ↳ ${cdText.replace('│ ', '')}` : ''
cap += `> ↳ 🌟 Level : ${myGuild.level}\n`
cap += `> ↳ ✨ Exp : ${(myGuild.exp).toLocaleString()} / ${nextExp.toLocaleString()}\n`
cap += `> ↳ 👥 Member : ${(myGuild.members || []).length} / ${maxMembers}\n`
cap += `> ↳ 🎁 Batas loot : Rp ${lootCaps.money.toLocaleString('id-ID')} / ${lootCaps.gemstone} tiap loot lain\n`
if (Date.now() < myGuild.warCooldown) cap += `> ↳ ⚠️ War CD : Aktif\n`
cap += `\n─━━━━━━━━━━━━━━─\n\n`

cap += `📊 *KONTRIBUSI MEMBER*\n`
cap += `─━━━━━━━━━━━━━━─\n\n`

let members = myGuild.members || []
let sortedMembers = [...members].sort((a, b) => (myGuild.contribution[b] || 0) - (myGuild.contribution[a] || 0))

sortedMembers.forEach((v, i) => {
    let contrib = myGuild.contribution[v] || 0
    cap += `👤 *${i + 1}. @${v.split('@')[0]}*\n`
    cap += `> ↳ Kontribusi : ${contrib.toLocaleString()}\n\n`
})

cap += `─━━━━━━━━━━━━━━─\n\n`

cap += `⚡ *BUFF AKTIF*\n`
cap += `─━━━━━━━━━━━━━━─\n\n`

if (Date.now() < myGuild.buffAttack) cap += `> ↳ ⚔️ Attack +200\n`
if (Date.now() < myGuild.buffDefense) cap += `> ↳ 🛡️ Defense +200\n`
if (Date.now() < myGuild.buffMagic) cap += `> ↳ 🔮 Magic +200\n`
if (Date.now() < myGuild.buffLuck) cap += `> ↳ 🍀 Luck +50%\n`
if (Date.now() < myGuild.buffSpeed) cap += `> ↳ ⚡ Speed -50%\n`
if (Date.now() < myGuild.buffHeal) cap += `> ↳ 💊 Heal +30% HP\n`
if (Date.now() < myGuild.buffMulti) cap += `> ↳ 📈 Multiplier +50% Exp\n`

if (Date.now() > myGuild.buffAttack &&
    Date.now() > myGuild.buffDefense &&
    Date.now() > myGuild.buffMagic &&
    Date.now() > myGuild.buffLuck &&
    Date.now() > myGuild.buffSpeed &&
    Date.now() > myGuild.buffHeal &&
    Date.now() > myGuild.buffMulti) cap += `> ↳ - Tidak ada\n`

cap += `\n─━━━━━━━━━━━━━━─\n\n`

    cap += `📖 *BANTUAN GUILD*\n`
    cap += `─━━━━━━━━━━━━━━─\n\n`
    cap += `> ↳ ${usedPrefix}guild command\n`
    cap += `> ↳ ${usedPrefix}guild guide\n`
    cap += `\n─━━━━━━━━━━━━━━─`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i142/XU7iEW', { contextInfo: { mentionedJid: members } })
}

if (action === 'create') {
    let cooldown = scaleDifficultyCooldown(user.rpg || user, user.lastGuildCooldownType === 'kick' ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    if (user.lastGuildCooldown && Date.now() - user.lastGuildCooldown < cooldown) {
        let sisa = cooldown - (Date.now() - user.lastGuildCooldown)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        return m.reply(
            `╭─❏「 ⏰ GUILD 」❏\n` +
            `│ ⏰ *MASIH COOLDOWN*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Tunggu *${jam} jam ${menit} menit* lagi untuk create guild.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    let name = args.slice(1).join(' ')
    if (!name || name.length > 15) return m.reply(
        `╭─❏「 ❌ GUILD 」❏\n` +
        `│ ❌ *Nama guild tidak valid.*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Max 15 huruf.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    if (wdb.guilds[name]) return m.reply(
        `╭─❏「 ❌ GUILD 」❏\n` +
        `│ ❌ *NAMA GUILD SUDAH ADA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Nama Guild tersebut sudah ada.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    let hasGuild = findGuildByMember(wdb.guilds, m.sender, conn)
    if (hasGuild) return m.reply(
        `╭─❏「 ❌ GUILD 」❏\n` +
        `│ ❌ *SUDAH MEMILIKI GUILD*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu sudah berada di dalam sebuah Guild.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    let price = 500000
    let moneySaku = wdb.money[m.sender] || 0
    if (moneySaku < price) return m.reply(
        `╭─❏「 💸 GUILD 」❏\n` +
        `│ ❌ *UANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Butuh Rp ${price.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    wdb.money[m.sender] -= price
    wdb.guilds[name] = {
      name: name, leader: m.sender, members: [m.sender],
      contribution: { [m.sender]: 0 }, level: 1, exp: 0, lastMission: 0, warCooldown: 0,
      lastParty: 0, lastTrain: 0,
      buffAttack: 0, buffDefense: 0, buffLuck: 0, buffSpeed: 0, buffHeal: 0, buffMagic: 0, buffMulti: 0
    }
    saveDB(wdb)

    m.reply(
        `╭─❏「 🎉 GUILD DIBENTUK 」❏\n` +
        `│ 🏰 *${name}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 🎉 Guild berhasil dibentuk!\n` +
        `> ↳ 💸 Biaya : -Rp ${price.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'donate') {
    let myGuild = findGuildByMember(wdb.guilds, m.sender, conn)
    if (!myGuild) return m.reply(
        `╭─❏「 🏰 GUILD 」❏\n` +
        `│ ❌ *TIDAK MEMILIKI GUILD*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Kamu tidak punya guild.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    let jumlah = parseInt(args[1])
    if (!jumlah || jumlah < 1000) return m.reply(
        `╭─❏「 ❌ DONASI GUILD 」❏\n` +
        `│ ❌ *JUMLAH TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Minimal donate Rp 1.000\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    let total = jumlah * myGuild.members.length
    if ((wdb.money[m.sender] || 0) < total) return m.reply(
        `╭─❏「 💸 DONASI GUILD 」❏\n` +
        `│ ❌ *UANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Butuh Rp ${total.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    wdb.money[m.sender] -= total
    myGuild.members.forEach(jid => {
      wdb.money[jid] = (wdb.money[jid] || 0) + jumlah
    })
    saveDB(wdb)

    m.reply(
        `╭─❏「 💰 DONASI GUILD 」❏\n` +
        `│ 💰 *DONASI BERHASIL*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Dibagikan : Rp ${jumlah.toLocaleString()} / anggota\n` +
        `> ↳ Anggota : ${myGuild.members.length}\n` +
        `> ↳ Total : Rp ${total.toLocaleString()}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}
}

handler.help = ['guild', 'guild command', 'guild guide', 'guild list', 'guild top', 'guild loot', 'guild storage']
handler.tags = ['rpg']
handler.command = ['guild']
export default handler
