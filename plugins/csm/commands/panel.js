/**
 * CSM Admin Panel Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  DEVIL_LIST, CHARACTER_LIST, WEAPON_LIST, ITEM_LIST, STORY_LIST,
  getTitle, EVENT_LIST
} from '../../../lib/rpg-libmyCSM.js'
import {
  findItemEntryByInput, headerUnavailable, resolveJid, pickRaidDevil
} from '../lib/utils.js'

export async function handlePanel(ctx) {
  const { m, conn, wdb, rawArgs, isPrivileged, senderNumber, helpPrefix = '.csm' } = ctx

  if (!isPrivileged) return m.reply(headerUnavailable('PANEL'))

  const panelHeader = title => `╭──「 CSM ADMIN PANEL 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`
  const panelArgs = rawArgs.slice(1)
  const panelTargetInput = panelArgs.find(arg => arg.startsWith('@')) ||
    (m.quoted && m.quoted.sender) ||
    (panelArgs.find(arg => /^\d{7,}$/.test(arg)) ? `${panelArgs.find(arg => /^\d{7,}$/.test(arg))}@s.whatsapp.net` : m.sender)

  const findUserKey = input => {
    if (!input) return null
    const resolved = resolveJid(input, wdb)
    if (wdb.users[resolved]) return resolved
    if (wdb.users[input]) return input
    return Object.keys(wdb.users).find(key => resolveJid(key, wdb) === resolved) || null
  }

  const targetKey = findUserKey(panelTargetInput)
  const targetRecord = targetKey ? wdb.users[targetKey] : null
  const targetRPG = targetRecord?.rpg
  const targetCSM = targetRPG?.csm
  const targetName = targetKey ? (conn.getName(targetKey) || targetKey.split('@')[0]) : 'tidak ditemukan'

  const help = panelHeader('COMMAND ADMIN') +
    `Khusus owner/admin.\n\n` +
    `*DATA PLAYER*\n` +
    `> ${helpPrefix} panel view @user\n` +
    `> ${helpPrefix} panel fix @user\n` +
    `> ${helpPrefix} panel add/del <field> <jumlah> @user\n` +
    `> ${helpPrefix} panel set <field> <nilai> @user\n` +
    `> ${helpPrefix} panel reset [field] @user confirm\n` +
    `> ${helpPrefix} panel cooldown reset @user confirm\n\n` +
    `*KONTRAK & BUFF*\n` +
    `> ${helpPrefix} panel contract set <nama> @user\n` +
    `> ${helpPrefix} panel contract clear @user\n` +
    `> ${helpPrefix} panel buff list @user\n` +
    `> ${helpPrefix} panel buff clear <id> @user\n\n` +
    `*EVENT & RAID*\n` +
    `> ${helpPrefix} panel event list\n` +
    `> ${helpPrefix} panel event clear erasure @user\n` +
    `> ${helpPrefix} panel event clear makimacall @user\n` +
    `> ${helpPrefix} panel event clear bloodfrenzy @user\n` +
    `> ${helpPrefix} panel event clear devilsbargain @user\n` +
    `> ${helpPrefix} panel event clear eyesofcontrol @user\n` +
    `> ${helpPrefix} panel event force erasure @user\n` +
    `> ${helpPrefix} panel event force makimacall @user\n` +
    `> ${helpPrefix} panel event force bloodfrenzy @user\n` +
    `> ${helpPrefix} panel event force devilsbargain @user\n` +
    `> ${helpPrefix} panel event force eyesofcontrol @user\n` +
    `> ${helpPrefix} panel raid force @user\n` +
    `> ${helpPrefix} panel raid unforce @user\n\n` +
    `*PARTNER & PENGATURAN*\n` +
    `> ${helpPrefix} panel partner add <nama> @user\n` +
    `> ${helpPrefix} panel partner del <nama> @user\n` +
    `> ${helpPrefix} panel partner set <nama> <field> <nilai> @user\n` +
    `> ${helpPrefix} panel inventory clear @user\n` +
    `> ${helpPrefix} panel about setdev <nomor>\n` +
    `> ${helpPrefix} panel about setsup <nama/nomor>\n` +
    `> ${helpPrefix} panel about cleardev\n` +
    `> ${helpPrefix} panel about clearsup\n` +
    `> ${helpPrefix} panel picture enable/disable\n` +
    `\nFIELD: blood, health, maxhealth, exp, level, resetcount, story.\n` +
    `@user: tag atau nomor WhatsApp target.\n` +
    `━━━━━━━━━━━`

  if (!panelArgs.length || ['list', 'help', 'commands'].includes(panelArgs[0].toLowerCase())) {
    return m.reply(help)
  }

  if (panelArgs[0].toLowerCase() === 'event' && panelArgs[1]?.toLowerCase() === 'list') {
    return m.reply(panelHeader('EVENT CSM') + EVENT_LIST.map((event, index) => `${index + 1}. ${event.name} - ${event.command}`).join('\n') + `\n━━━━━━━━━━━\nGunakan perintah di atas untuk melihat detail event.`)
  }

  if (panelArgs[0].toLowerCase() === 'about') {
    if (!wdb.csmAbout || typeof wdb.csmAbout !== 'object') wdb.csmAbout = {}
    const aboutAction = panelArgs[1]?.toLowerCase()
    const aboutValue = panelArgs.slice(2).join(' ').trim()
    if (aboutAction === 'setdev') {
      const developerNumber = aboutValue.replace(/\D/g, '')
      if (!developerNumber) return m.reply(panelHeader('FORMAT SALAH') + `Gunakan *.csm panel about setdev <nomor>*\n━━━━━━━━━━━`)
      wdb.csmAbout.developer = developerNumber
      saveDB(wdb)
      return m.reply(panelHeader('DEVELOPER ABOUT DIUBAH') + `👤 @${developerNumber}\n━━━━━━━━━━━`)
    }
    if (aboutAction === 'setsup') {
      if (!aboutValue) return m.reply(panelHeader('FORMAT SALAH') + `Gunakan *.csm panel about setsup <nama/nomor>*\n━━━━━━━━━━━`)
      wdb.csmAbout.supported = aboutValue
      saveDB(wdb)
      return m.reply(panelHeader('SUPPORT ABOUT DIUBAH') + `🤝 ${aboutValue}\n━━━━━━━━━━━`)
    }
    if (aboutAction === 'cleardev') {
      wdb.csmAbout.developer = 'Eza'
      saveDB(wdb)
      return m.reply(panelHeader('DEVELOPER DIKEMBALIKAN') + `Eza\n━━━━━━━━━━━`)
    }
    if (aboutAction === 'clearsup') {
      wdb.csmAbout.supported = 'Nelson'
      saveDB(wdb)
      return m.reply(panelHeader('SUPPORTED BY DIKEMBALIKAN') + `Nelson\n━━━━━━━━━━━`)
    }
    return m.reply(panelHeader('ABOUT PANEL') + `Gunakan:\n> .csm panel about setdev <nomor>\n> .csm panel about setsup <nama/nomor>\n━━━━━━━━━━━`)
  }

  if (panelArgs[0].toLowerCase() === 'picture') {
    const pictureAction = panelArgs[1]?.toLowerCase()
    if (!['enable', 'disable'].includes(pictureAction)) {
      return m.reply(panelHeader('PICTURE PANEL') + `Gunakan:\n> .csm panel picture enable\n> .csm panel picture disable\n━━━━━━━━━━━`)
    }
    wdb.csmPicturesEnabled = pictureAction === 'enable'
    saveDB(wdb)
    return m.reply(panelHeader('CSM PICTURE DIUBAH') + `${pictureAction === 'enable' ? '✅ Pengiriman gambar diaktifkan.' : '🚫 Pengiriman gambar dinonaktifkan.'}\n━━━━━━━━━━━`)
  }

  if (['cooldown', 'cd'].includes(panelArgs[0].toLowerCase())) {
    if (!targetCSM) return m.reply(panelHeader('DATA TIDAK DITEMUKAN') + `Target belum memiliki data CSM RPG.\n━━━━━━━━━━━`)
    if (panelArgs[1]?.toLowerCase() !== 'reset') {
      return m.reply(panelHeader('COOLDOWN PANEL') + `Gunakan:\n> .csm panel cooldown reset @user confirm\n━━━━━━━━━━━`)
    }
    if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm') {
      return m.reply(panelHeader('KONFIRMASI RESET CD') + `Ketik *.csm panel cooldown reset @user confirm* untuk menghapus semua cooldown target.\n━━━━━━━━━━━`)
    }
    const cooldownKeys = [
      'lastTerror', 'lastStory', 'lastRest', 'lastExplore', 'lastMission', 'lastVisit',
      'lastWork', 'lastJob', 'lastJobLeave', 'lastPartnerGacha', 'lastRevengeHeal',
      'lastRaid', 'dailyDate', 'hourlyDate', 'weeklyDate', 'monthlyDate', 'questDate',
      'lastInteract', 'lastRandomEvent', 'lastEventCooldown'
    ]
    cooldownKeys.forEach(key => { targetCSM[key] = 0 })
    if (targetCSM.storyCooldown && typeof targetCSM.storyCooldown === 'object') {
      Object.keys(targetCSM.storyCooldown).forEach(key => { targetCSM.storyCooldown[key] = 0 })
    }
    saveDB(wdb)
    return m.reply(panelHeader('COOLDOWN DI-RESET') + `👤 ${targetName}\nSemua cooldown personal telah dihapus.\n━━━━━━━━━━━`)
  }

  if (!targetRecord || !targetRPG) return m.reply(panelHeader('TARGET TIDAK DITEMUKAN') + `Data RPG target tidak ditemukan.\n━━━━━━━━━━━`)

  const panelCommand = panelArgs[0].toLowerCase()
  const numericFields = new Set(['blood', 'health', 'maxhealth', 'level', 'exp', 'resetcount', 'story'])
  const getNumericValue = field => Number(targetCSM?.[field] || 0)
  const setNumericValue = (field, value) => {
    targetCSM[field] = value
  }

  if (panelCommand === 'inventory' && panelArgs[1]?.toLowerCase() === 'clear') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    targetCSM.inventory = [{ nama: 'Fist', dur: 999 }]
    targetCSM.weapon = { nama: 'Fist', dur: 999 }
    saveDB(wdb)
    return m.reply(panelHeader('INVENTORY DIBERSIHKAN') + `👤 ${targetName}\nInventory dikembalikan ke Fist.\n━━━━━━━━━━━`)
  }

  if (['add', 'del'].includes(panelCommand)) {
    const field = panelArgs[1]?.toLowerCase()
    const amount = Number(panelArgs[2])
    if (!numericFields.has(field) || !Number.isFinite(amount) || amount < 0 || !targetCSM) {
      return m.reply(panelHeader('FORMAT SALAH') + `Resource atau jumlah tidak valid.\n${help}`)
    }
    const nextValue = getNumericValue(field) + (panelCommand === 'add' ? amount : -amount)
    setNumericValue(field, Math.max(0, Math.floor(nextValue)))
    if (field === 'level') {
      targetCSM.title = getTitle(targetCSM.level)
      targetCSM.maxHealth = Math.max(100, 100 + (targetCSM.level - 1) * 25)
      targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
    }
    if (field === 'maxhealth') targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
    saveDB(wdb)
    return m.reply(panelHeader('DATA DIUBAH') + `👤 ${targetName}\n📌 ${field}: ${getNumericValue(field).toLocaleString()}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'set') {
    const field = panelArgs[1]?.toLowerCase()
    const value = Number(panelArgs[2])
    if (!numericFields.has(field) || !Number.isFinite(value) || value < 0 || !targetCSM) {
      return m.reply(panelHeader('FORMAT SALAH') + `Field atau nilai tidak valid.\n${help}`)
    }
    setNumericValue(field, Math.floor(value))
    if (field === 'level') {
      targetCSM.title = getTitle(targetCSM.level)
      targetCSM.maxHealth = Math.max(100, 100 + (targetCSM.level - 1) * 25)
      targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
    }
    if (field === 'maxhealth') targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
    saveDB(wdb)
    return m.reply(panelHeader('DATA DISET') + `👤 ${targetName}\n📌 ${field}: ${getNumericValue(field).toLocaleString()}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'inventory' && ['add', 'del'].includes(panelArgs[1]?.toLowerCase())) {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    const action = panelArgs[1].toLowerCase()
    const rawItem = panelArgs.slice(2, -1).join(' ').trim()
    if (!rawItem) {
      return m.reply(panelHeader('FORMAT SALAH') + `Gunakan: .csm panel inventory add <nomor/nama> @user\n.csm panel inventory del <nomor/nama> @user\n━━━━━━━━━━━`)
    }
    const match = findItemEntryByInput(rawItem)
    if (!match) return m.reply(panelHeader('ITEM TIDAK DITEMUKAN') + `Nomor atau nama item tidak valid.\n━━━━━━━━━━━`)
    if (action === 'add') {
      if (!Array.isArray(targetCSM.inventory)) targetCSM.inventory = [{ nama: 'Fist', dur: 999 }]
      if (WEAPON_LIST.some(weapon => weapon.nama === match.nama)) {
        targetCSM.inventory.push({ nama: match.nama, dur: match.dur ?? 999 })
      } else {
        targetCSM.inventory.push({ nama: match.nama, jml: 1 })
        if (ITEM_LIST.some(item => item.nama === match.nama) && !targetCSM.foundItems?.includes(match.nama)) {
          targetCSM.foundItems = Array.isArray(targetCSM.foundItems) ? targetCSM.foundItems : []
          targetCSM.foundItems.push(match.nama)
        }
      }
      saveDB(wdb)
      return m.reply(panelHeader('ITEM DITAMBAHKAN') + `👤 ${targetName}\n${match.emoji || '📦'} ${match.nama}\n━━━━━━━━━━━`)
    }

    const targetIndex = targetCSM.inventory.findIndex(inv => inv?.nama === match.nama)
    if (targetIndex < 0) return m.reply(panelHeader('ITEM TIDAK ADA') + `Target tidak memiliki item tersebut.\n━━━━━━━━━━━`)
    targetCSM.inventory.splice(targetIndex, 1)
    saveDB(wdb)
    return m.reply(panelHeader('ITEM DIHAPUS') + `👤 ${targetName}\n${match.emoji || '📦'} ${match.nama}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'view') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    return m.reply(panelHeader('DATA CSM') + `👤 ${targetName}\n📊 Level: ${targetCSM.level}\n📈 EXP: ${targetCSM.exp}\n❤️ HP: ${targetCSM.health}/${targetCSM.maxHealth}\n🩸 Blood: ${targetCSM.blood}\n📖 Story: ${targetCSM.story}/${STORY_LIST.length}\n👥 Partner: ${targetCSM.partners?.length || 0}\n🔄 Reset: ${targetCSM.resetCount || 0}\n🏆 Ending: ${(targetCSM.endingReward || []).length}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'fix') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    targetCSM.partners = Array.isArray(targetCSM.partners) ? targetCSM.partners : []
    targetCSM.relations = targetCSM.relations && typeof targetCSM.relations === 'object' ? targetCSM.relations : {}
    targetCSM.achievements = Array.isArray(targetCSM.achievements) ? targetCSM.achievements : []
    targetCSM.endingReward = Array.isArray(targetCSM.endingReward) ? targetCSM.endingReward : []
    targetCSM.endingHistory = Array.isArray(targetCSM.endingHistory) ? targetCSM.endingHistory : []
    targetCSM.endingBuffs = targetCSM.endingBuffs && typeof targetCSM.endingBuffs === 'object' ? targetCSM.endingBuffs : {}
    targetCSM.level = Math.max(1, Math.floor(Number(targetCSM.level) || 1))
    targetCSM.exp = Math.max(0, Math.floor(Number(targetCSM.exp) || 0))
    targetCSM.maxHealth = Math.max(100, Math.floor(Number(targetCSM.maxHealth) || 100))
    targetCSM.health = Math.max(1, Math.min(targetCSM.maxHealth, Math.floor(Number(targetCSM.health) || targetCSM.maxHealth)))
    targetCSM.blood = Math.max(0, Math.floor(Number(targetCSM.blood) || 0))
    targetCSM.story = Math.max(1, Math.min(STORY_LIST.length + 1, Math.floor(Number(targetCSM.story) || 1)))
    targetCSM.title = getTitle(targetCSM.level)
    if (!Array.isArray(targetCSM.inventory) || !targetCSM.inventory.length) targetCSM.inventory = [{ nama: 'Fist', dur: 999 }]
    if (!targetCSM.weapon || !targetCSM.weapon.nama) targetCSM.weapon = { nama: 'Fist', dur: 999 }
    saveDB(wdb)
    return m.reply(panelHeader('DATA DIPERBAIKI') + `👤 ${targetName}\nField CSM utama sudah dinormalisasi.\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'contract') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    const contractAction = panelArgs[1]?.toLowerCase()
    if (contractAction === 'clear') {
      targetCSM.devilContract = null
      targetCSM.contractType = null
      targetCSM.contractExpire = 0
      targetCSM.isTransform = false
      targetCSM.contractPending = null
    } else if (contractAction === 'set') {
      const contractName = panelArgs.slice(2).filter(arg => arg !== panelTargetInput).join(' ')
      const devil = DEVIL_LIST.find(item => item.nama.toLowerCase() === contractName.toLowerCase())
      if (!devil) return m.reply(panelHeader('DEVIL TIDAK DITEMUKAN') + `Gunakan nama yang ada di database Devil.\n━━━━━━━━━━━`)
      targetCSM.devilContract = devil.nama
      targetCSM.contractType = devil.tipe === 'Devil' ? 'devil' : 'fiend'
      targetCSM.contractExpire = 0
      targetCSM.isTransform = true
      if (!targetCSM.lastSeenDevils || typeof targetCSM.lastSeenDevils !== 'object') targetCSM.lastSeenDevils = {}
      targetCSM.lastSeenDevils[devil.nama] = Date.now()
    } else return m.reply(help)
    saveDB(wdb)
    return m.reply(panelHeader('KONTRAK DIUBAH') + `👤 ${targetName}\n⛓️ ${targetCSM.devilContract || 'Tidak ada'}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'buff') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    targetCSM.endingBuffs = targetCSM.endingBuffs && typeof targetCSM.endingBuffs === 'object' ? targetCSM.endingBuffs : {}
    targetCSM.endingReward = Array.isArray(targetCSM.endingReward) ? targetCSM.endingReward : []
    const buffAction = panelArgs[1]?.toLowerCase()
    if (buffAction === 'list') {
      const buffs = Object.values(targetCSM.endingBuffs)
      return m.reply(panelHeader('BUFF ENDING') + (buffs.length ? buffs.map(buff => `ID: ${buff.id}\nNama: ${buff.name}\nBonus: ${buff.bonus}`).join('\n\n') : 'Belum ada buff ending.') + `\n\nHapus: .csm panel buff clear <id> @user\n━━━━━━━━━━━`)
    }
    if (buffAction === 'clear') {
      const buffId = panelArgs[2]?.toLowerCase()
      const buffEntry = Object.entries(targetCSM.endingBuffs).find(([name, buff]) => name.toLowerCase() === buffId || buff.id?.toLowerCase() === buffId)
      if (!buffEntry) return m.reply(panelHeader('BUFF TIDAK DITEMUKAN') + `Gunakan *.csm panel buff list @user*.\n━━━━━━━━━━━`)
      delete targetCSM.endingBuffs[buffEntry[0]]
      targetCSM.endingReward = targetCSM.endingReward.filter(reward => reward.id !== buffEntry[1].id)
      saveDB(wdb)
      return m.reply(panelHeader('BUFF DIHAPUS') + `👤 ${targetName}\n🏆 ${buffEntry[1].name}\n━━━━━━━━━━━`)
    }
    return m.reply(help)
  }

  if (panelCommand === 'event' && panelArgs[1]?.toLowerCase() === 'clear') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    const eventName = panelArgs[2]?.toLowerCase()
    if (eventName === 'erasure') targetCSM.erasurePending = null
    else if (eventName === 'makimacall') { targetCSM.pendingDuel = null; targetCSM.pendingDuelTime = null }
    else if (eventName === 'bloodfrenzy') targetCSM.bloodFrenzy = null
    else if (eventName === 'hungerfeast') targetCSM.hungerFeast = null
    else if (eventName === 'deathsentence') targetCSM.deathSentence = null
    else if (eventName === 'dollcontract') { targetCSM.dollContract = false; targetCSM.contractType = null; targetCSM.devilContract = null }
    else if (eventName === 'weaponization' || eventName === 'childwish') targetCSM.pendingRandomEvent = null
    else if (eventName === 'devilsbargain') targetCSM.devilBargain = null
    else if (eventName === 'eyesofcontrol') targetCSM.makimaAttention = 0
    else return m.reply(help)
    saveDB(wdb)
    return m.reply(panelHeader('EVENT DIBERSIHKAN') + `👤 ${targetName}\n🎲 ${eventName}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'event' && panelArgs[1]?.toLowerCase() === 'force') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    const eventName = panelArgs[2]?.toLowerCase()
    if (['erasure', 'makimacall', 'bloodfrenzy', 'devilsbargain', 'eyesofcontrol', 'weaponization', 'hungerfeast', 'deathsentence', 'childwish', 'dollcontract'].includes(eventName)) {
      if (eventName === 'erasure') targetCSM.erasurePending = { type: 'manual_admin', time: Date.now(), forcedBy: senderNumber }
      else if (eventName === 'makimacall') { targetCSM.pendingDuel = 'makima_order'; targetCSM.pendingDuelTime = Date.now() }
      else if (eventName === 'bloodfrenzy') { targetCSM.bloodFrenzy = { expiresAt: Date.now() + 30 * 60 * 1000 } }
      else if (eventName === 'hungerfeast') { targetCSM.hungerFeast = { expiresAt: Date.now() + 30 * 60 * 1000 } }
      else if (eventName === 'deathsentence') { targetCSM.deathSentence = { expiresAt: Date.now() + 30 * 60 * 1000, damageMultiplier: 1.35 } }
      else if (eventName === 'dollcontract') { targetCSM.dollContract = true; targetCSM.contractType = 'doll'; targetCSM.devilContract = 'Doll Devil' }
      else if (eventName === 'weaponization' || eventName === 'childwish') targetCSM.pendingRandomEvent = eventName
      else if (eventName === 'devilsbargain') { targetCSM.devilBargain = { expiresAt: Date.now() + 30 * 60 * 1000, damageMultiplier: 1.25 } }
      else if (eventName === 'eyesofcontrol') { targetCSM.makimaAttention = Math.min(100, (targetCSM.makimaAttention || 0) + 15) }
      saveDB(wdb)
      return m.reply(panelHeader('EVENT DIPAKSA') + `👤 ${targetName}\n🎲 ${eventName}\n━━━━━━━━━━━`)
    }
    return m.reply(help)
  }

  if (panelCommand === 'raid' && ['force', 'unforce'].includes(panelArgs[1]?.toLowerCase())) {
    const raid = wdb.raid && typeof wdb.raid === 'object' ? wdb.raid : (wdb.raid = { boss: null, players: [], date: '', history: [], currentHP: 0, lastAttack: 0 })
    raid.players = Array.isArray(raid.players) ? raid.players : []
    if (!raid.boss || raid.date !== new Date().toISOString().split('T')[0]) {
      raid.boss = pickRaidDevil()
      raid.currentHP = raid.boss.hp
      raid.date = new Date().toISOString().split('T')[0]
      raid.lastAttack = Date.now()
      raid.players = []
    }
    if (panelArgs[1].toLowerCase() === 'force') {
      if (raid.players.includes(targetKey)) return m.reply(panelHeader('SUDAH DI RAID') + `${targetName} sudah ada di lobby raid.\n━━━━━━━━━━━`)
      if (raid.players.length >= 10) return m.reply(panelHeader('RAID PENUH') + `Lobby raid sudah berisi 10 Hunter.\n━━━━━━━━━━━`)
      raid.players.push(targetKey)
    } else {
      raid.players = raid.players.filter(playerId => playerId !== targetKey)
    }
    saveDB(wdb)
    return m.reply(panelHeader(panelArgs[1].toLowerCase() === 'force' ? 'HUNTER DIPAKSA JOIN' : 'HUNTER DIKELUARKAN') + `👤 ${targetName}\n👥 Lobby: ${raid.players.length}/10\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'reset') {
    const resetField = panelArgs[1]?.toLowerCase()
    if (numericFields.has(resetField)) {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm') {
        return m.reply(panelHeader('KONFIRMASI RESET FIELD') + `Ketik *.csm panel reset ${resetField} @user confirm*.\n━━━━━━━━━━━`)
      }
      const resetValues = { blood: 0, health: targetCSM.maxHealth, maxhealth: 100, exp: 0, level: 1, resetcount: 0, story: 1 }
      setNumericValue(resetField, resetValues[resetField])
      if (resetField === 'level') {
        targetCSM.title = getTitle(1)
        targetCSM.maxHealth = 100
        targetCSM.health = 100
      }
      if (resetField === 'maxhealth') targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
      saveDB(wdb)
      return m.reply(panelHeader('FIELD DI-RESET') + `👤 ${targetName}\n📌 ${resetField}: ${getNumericValue(resetField).toLocaleString()}\n━━━━━━━━━━━`)
    }
    if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm' || !targetCSM) {
      return m.reply(panelHeader('KONFIRMASI RESET ADMIN') + `Reset panel menghapus seluruh data CSM: level, EXP, partner, achievement, reward, inventory, kontrak, dan semua riwayat.\nReset otomatis dari ending berbeda: hanya mengulang perjalanan dan memberikan reward ending.\nKetik *.csm panel reset @user confirm*\n━━━━━━━━━━━`)
    }
    const resetCount = (Number(targetCSM.resetCount) || 0) + 1
    targetRecord.rpg.csm = {
      started: false, nickname: '', gender: 'None', health: 100, maxHealth: 100, level: 1, exp: 0, title: getTitle(1), blood: 0, story: 1, location: 'Markas Public Safety', devilContract: null, contractType: null, contractHistory: [], isTransform: false, inventory: [{ nama: 'Fist', dur: 999 }], weapon: { nama: 'Fist', dur: 999 }, erasureProtection: null, erasurePending: null, dollContract: false, contractExpire: 0, contractSide: null, contractPending: null, pendingEnding: null, ending: null, endingReward: [], endingHistory: [], endingBuffs: {}, resetCount, partners: [], relations: {}, achievements: [], terrorStory: [], hospital: [], jobs: {}, job: null, encounter: null, tempMission: null, pendingDuel: null, pendingBlood: 0, partnerGachaPending: null, storyCooldown: {}, seenContractScenes: [], seenExploreStories: [], seenMissionStories: [], seenRescueStories: [], seenRescueResults: [], buffHistory: [], lastTerror: 0, lastStory: 0, lastRest: 0, lastExplore: 0, lastMission: 0, lastVisit: 0, lastWork: 0, lastJob: 0, lastJobLeave: 0, lastPartnerGacha: 0, lastRevengeHeal: 0, lastRaid: '', lastSeenChars: {}, endings: []
    }
    saveDB(wdb)
    return m.reply(panelHeader('RESET ADMIN BERHASIL') + `👤 ${targetName}\nSeluruh data CSM telah dihapus. Player harus memulai kembali dari awal.\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'partner' && ['add', 'del'].includes(panelArgs[1]?.toLowerCase())) {
    const partnerName = panelArgs.slice(2).filter(arg => arg !== panelTargetInput).join(' ')
    const character = CHARACTER_LIST.find(item => item.nama.toLowerCase() === partnerName.toLowerCase())
    if (!character || !targetCSM) return m.reply(panelHeader('PARTNER TIDAK DITEMUKAN') + `Nama partner tidak valid.\n━━━━━━━━━━━`)
    targetCSM.partners = Array.isArray(targetCSM.partners) ? targetCSM.partners : []
    const index = targetCSM.partners.findIndex(partner => partner.name === character.nama)
    if (panelArgs[1].toLowerCase() === 'add') {
      if (index >= 0) return m.reply(panelHeader('SUDAH ADA') + `${character.nama} sudah menjadi partner.\n━━━━━━━━━━━`)
      targetCSM.partners.push({ name: character.nama, hp: 100, status: 'reserve', level: 1 })
      targetCSM.relations = targetCSM.relations || {}
      targetCSM.relations[character.nama] = character.needLove
    } else {
      if (index < 0) return m.reply(panelHeader('TIDAK ADA') + `${character.nama} bukan partner target.\n━━━━━━━━━━━`)
      targetCSM.partners.splice(index, 1)
    }
    saveDB(wdb)
    return m.reply(panelHeader('PARTNER DIUBAH') + `👤 ${targetName}\n👥 ${character.nama}\n━━━━━━━━━━━`)
  }

  if (panelCommand === 'partner' && panelArgs[1]?.toLowerCase() === 'set') {
    if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
    const targetIndex = panelArgs.indexOf(panelTargetInput)
    const endIndex = targetIndex >= 0 ? targetIndex : panelArgs.length
    const field = panelArgs[endIndex - 2]?.toLowerCase()
    const value = panelArgs[endIndex - 1]
    const partnerName = panelArgs.slice(2, endIndex - 2).join(' ')
    const partner = targetCSM.partners?.find(item => item.name.toLowerCase() === partnerName.toLowerCase())
    if (!partner || !['level', 'love', 'needlove', 'hp', 'status'].includes(field)) {
      return m.reply(panelHeader('FORMAT PARTNER SALAH') + `Gunakan *.csm panel partner set <nama> <level|love|needlove|hp|status> <nilai> @user*.\n━━━━━━━━━━━`)
    }
    if (field === 'status') {
      if (!['active', 'reserve'].includes(value.toLowerCase())) {
        return m.reply(panelHeader('STATUS SALAH') + `Status hanya active atau reserve.\n━━━━━━━━━━━`)
      }
      partner.status = value.toLowerCase()
    } else {
      const numericValue = Number(value)
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        return m.reply(panelHeader('NILAI SALAH') + `Nilai partner harus angka positif.\n━━━━━━━━━━━`)
      }
      if (field === 'needlove') partner.needLove = Math.floor(numericValue)
      else if (field === 'love') targetCSM.relations[partner.name] = Math.floor(numericValue)
      else if (field === 'level') targetCSM.relations[partner.name] = Math.floor(numericValue) * Math.max(1, partner.needLove || CHARACTER_LIST.find(item => item.nama === partner.name)?.needLove || 1)
      else partner[field] = Math.floor(numericValue)
    }
    saveDB(wdb)
    return m.reply(panelHeader('PARTNER DISET') + `👤 ${targetName}\n👥 ${partner.name}\n📌 ${field}: ${field === 'love' || field === 'level' ? targetCSM.relations[partner.name] : partner[field]}\n━━━━━━━━━━━`)
  }

  return m.reply(help)
}
