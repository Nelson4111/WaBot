const { loadDB, saveDB, getUserRPG, sendRpgMsg } = require('../../lib/waifuHelper.js')
const {
  DEVIL_LIST, CHARACTER_LIST, WEAPON_LIST, ITEM_LIST, STORY_LIST,
  MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, MAIN_JOB_LIST, SIDE_JOB_LIST,
  BOSS_LIST, ACHIEVEMENT_LIST, calcBonus, getTitle, getTitleBackstory, bar,
  calcSetBonus, checkAchievements, CONTRACT_PRICE, getContractMeta,
  EVENT_LIST, COMMAND_SECTIONS, TITLE_LIST, BUFF_LIST,
  CSM_PICTURES, EXCLUSIVE_PICTURES, PARTNER_PICTURES, GALLERY_PICTURES, QUEST_LIST,
  CSM_CONTENT_TOTALS, RAID_RANK_WEIGHTS, JOB_WORK_STORIES, ERASURE_BACKSTORIES,
  ITEM_COMMENTS, PARTNER_REACTIONS, TERROR_SUCCESS_STORIES, TERROR_DEATH_STORIES,
  CONTRACT_SCENES, PARTNER_MISSION_DIALOGS, EXPLORE_STORIES, MISSION_STORIES,
  RESCUE_STORIES, RESCUE_RESULTS, CITIZEN_RESPONSES,
  MAKIMA_WIN_DIALOGS, MAKIMA_LOSE_DIALOGS, MAKIMA_HELL_DIALOGS,
  VISIT_PARTNER_DIALOGS, RAID_PARTNER_DIALOGS, GIFT_REACTIONS_BLOOD,
  GIFT_REACTIONS_MONEY, SHORT_PARTNER_RESPONSES
} = require('../../lib/rpg-libmyCSM.js')

const pickNamedPicture = pictures => {
  const [name, picture] = pictures[Math.floor(Math.random() * pictures.length)]
  return { name, picture }
}

const pickPicture = pictures => Array.isArray(pictures)
  ? pictures[Math.floor(Math.random() * pictures.length)]
  : pictures

const getCommandCount = () => new Set([
  ...COMMAND_SECTIONS.flatMap(section => section.commands.map(([command]) => command)),
  ...EVENT_LIST.map(event => event.command.replace(/^\.csm\s*/, ''))
]).size

const JOB_LIST = [...MAIN_JOB_LIST, ...SIDE_JOB_LIST]

const formatPartnerReactionBlock = (partnerName, reactionText) => {
  const cleanName = String(partnerName || 'Partner').trim()
  const cleanReaction = String(reactionText || '...').trim()
  return `${cleanName}\n> ${cleanReaction}`
}

const findItemEntryByInput = (input) => {
  const raw = String(input || '').trim()
  if (!raw) return null
  const candidates = [...ITEM_LIST, ...WEAPON_LIST]
  if (/^\d+$/.test(raw)) {
    const index = Number(raw)
    return candidates[index - 1] || null
  }
  const key = raw.toLowerCase()
  return candidates.find(entry => {
    const name = String(entry.nama || '').toLowerCase()
    return name === key || name.includes(key)
  }) || null
}

const resetLegacyViewData = (csm) => {
  const staleViewArrays = [
    'seenContractScenes', 'seenExploreStories', 'seenMissionStories',
    'seenRescueStories', 'seenRescueResults', 'buffHistory',
    'terrorStory', 'workStories', 'partnerReactionHistory'
  ]
  staleViewArrays.forEach(key => {
    if (!Array.isArray(csm[key])) csm[key] = []
  })
  if (!csm.lastSeenChars || typeof csm.lastSeenChars !== 'object') csm.lastSeenChars = {}
  if (!csm.lastSeenDevils || typeof csm.lastSeenDevils !== 'object') csm.lastSeenDevils = {}
  if (!csm.relations || typeof csm.relations !== 'object') csm.relations = {}
}

const pickRaidDevil = () => {
  const pool = DEVIL_LIST.filter(devil => devil.tipe === 'Devil')
  const totalWeight = pool.reduce((total, devil) => total + (RAID_RANK_WEIGHTS[devil.rank] || 1), 0)
  let roll = Math.random() * totalWeight
  return pool.find(devil => (roll -= RAID_RANK_WEIGHTS[devil.rank] || 1) <= 0) || pool[pool.length - 1]
}

const normalizeCsmAction = (value) => {
  const aliasMap = {
    kontrak: 'contract',
    contrack: 'contract',
    'kontrak-trial': 'contract',
    'kontrak-deal': 'contract',
    'kontrak trial': 'contract',
    'kontrak deal': 'contract',
    'contract trial': 'contract',
    'contract deal': 'contract',
    'makima-call': 'makimacall',
    'makimacall': 'makimacall',
    'makima call': 'makimacall',
    'blood-convert': 'blood',
    'bloodconvert': 'blood',
    'team': 'partner',
    'cd' : 'cooldown',
    'berhenti': 'cancel',
    accept: 'terima',
    reject: 'tolak',
    gacha: 'contract',
    yes: 'yes',
    no: 'no',
    terima: 'terima',
    tolak: 'tolak'
  }
  return aliasMap[String(value || '').toLowerCase()] || String(value || '').toLowerCase()
}

const getInventoryEntryByInput = (csm, input, allowWeapons = false) => {
  if (!Array.isArray(csm.inventory)) csm.inventory = [{ nama: 'Fist', dur: 999 }]

  const entries = []
  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon ? ITEM_LIST.find(i => i.nama === inv.nama) : null

    if (weapon && allowWeapons) {
      entries.push({ inv, inventoryIndex, data: weapon })
    } else if (item) {
      entries.push({ inv, inventoryIndex, data: item })
    }
  })

  if (!input) return null
  const normalized = String(input).trim()
  if (!normalized) return null

  if (!isNaN(normalized)) {
    const nomor = Number(normalized)
    return entries[nomor - 1] || null
  }

  const key = normalized.toLowerCase()
  return entries.find(entry => {
    const name = String(entry.data.nama || '').toLowerCase()
    return name === key || name.includes(key)
  }) || null
}

function getJobData(csm, jobName) {
  if (!csm.jobs) csm.jobs = {}
  if (!csm.jobs[jobName]) csm.jobs[jobName] = { level: 1, exp: 0 }
  return csm.jobs[jobName]
}

function addJobExp(csm, jobName, exp) {
  let jobData = getJobData(csm, jobName)
  jobData.exp += exp
  let leveled = false

  while (true) {
    let expButuh = Math.floor(100 * Math.pow(jobData.level, 1.5)) // 100, 282, 519, 800...
    if (jobData.exp >= expButuh) {
      jobData.exp -= expButuh
      jobData.level++
      leveled = true
    } else break
  }
  return { leveled, level: jobData.level }
}

function getJobDesc(jobName) {
  let f = JOB_LIST.find(j => j.job === jobName)
  return f ? f.desc : 'Deskripsi tidak ditemukan.'
}

let handler = async (message, { conn, text, usedPrefix, command }) => {
  const m = Object.create(message)
  const wdb = loadDB()
  const normalizeMessage = message => typeof message === 'string'
    ? message + `\n\n`
    : message
  const originalReply = message.reply.bind(message)
  Object.defineProperty(m, 'reply', {
    value: replyMessage => originalReply(normalizeMessage(replyMessage)),
    writable: true,
    configurable: true
  })
  const headerUnavailable = commandName => `╭──「 PERINTAH TERKUNCI 」──╮\n│ ${commandName}\n━━━━━━━━━━━\n\nPerintah ini tidak tersedia untuk akunmu.\nGunakan *.csm command* untuk melihat daftar perintah yang bisa digunakan.\n━━━━━━━━━━━`

  const resolveJid = (jid) => {
    if (!jid) return jid
    if (jid.endsWith('@lid')) {
      return global.lids?.[jid] ||
             global.db?.data?.lids?.[jid] ||
             (wdb?.lids && wdb.lids[jid]) ||
             jid
    }
    return jid
  }

  const senderJid = resolveJid(m.sender)
  const ownerList = Array.isArray(global.owner) ? global.owner : []
  const ownerNumbers = ownerList.flatMap(owner => Array.isArray(owner) ? owner[0] : owner)
    .map(owner => String(owner).replace(/\D/g, ''))
    .filter(Boolean)
  const senderNumber = String(m.sender || '').replace(/\D/g, '')
  const resolvedSenderNumber = String(senderJid || '').replace(/\D/g, '')
  const csmAdminNumbers = new Set([...ownerNumbers, '6282228638623'])
  const isPrivileged = Boolean(
    m.isOwner ||
    m.isROwner ||
    m.fromMe ||
    csmAdminNumbers.has(senderNumber) ||
    csmAdminNumbers.has(resolvedSenderNumber)
  )

  const rawArgs = text ? text.trim().split(/\s+/) : []
  const rawAction = (rawArgs[0] || '').toLowerCase()
  if (rawAction === 'panel') {
    if (!isPrivileged) return m.reply(headerUnavailable('PANEL'))

    const panelHeader = title => `╭──「 CSM ADMIN PANEL 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`
    const panelArgs = rawArgs.slice(1)
    const panelTargetInput = panelArgs.find(arg => arg.startsWith('@')) || (m.quoted && m.quoted.sender) || (panelArgs.find(arg => /^\d{7,}$/.test(arg)) ? `${panelArgs.find(arg => /^\d{7,}$/.test(arg))}@s.whatsapp.net` : m.sender)
    const findUserKey = input => {
      if (!input) return null
      const resolved = resolveJid(input)
      if (wdb.users[resolved]) return resolved
      if (wdb.users[input]) return input
      return Object.keys(wdb.users).find(key => resolveJid(key) === resolved) || null
    }
    const targetKey = findUserKey(panelTargetInput)
    const targetRecord = targetKey ? wdb.users[targetKey] : null
    const targetRPG = targetRecord?.rpg
    const targetCSM = targetRPG?.csm
    const targetName = targetKey ? (conn.getName(targetKey) || targetKey.split('@')[0]) : 'tidak ditemukan'
    const help = panelHeader('COMMAND ADMIN') +
      `Khusus owner/admin.\n\n` +
      `*DATA PLAYER*\n` +
      `> .csm panel view @user\n` +
      `> .csm panel fix @user\n` +
      `> .csm panel add/del <field> <jumlah> @user\n` +
      `> .csm panel set <field> <nilai> @user\n` +
      `> .csm panel reset [field] @user confirm\n` +
      `> .csm panel cooldown reset @user confirm\n\n` +
      `*KONTRAK & BUFF*\n` +
      `> .csm panel contract set <nama> @user\n` +
      `> .csm panel contract clear @user\n` +
      `> .csm panel buff list @user\n` +
      `> .csm panel buff clear <id> @user\n\n` +
      `*EVENT & RAID*\n` +
      `> .csm panel event list\n` +
      `> .csm panel event clear erasure @user\n` +
      `> .csm panel event clear makimacall @user\n` +
      `> .csm panel event clear bloodfrenzy @user\n` +
      `> .csm panel event clear devilsbargain @user\n` +
      `> .csm panel event clear eyesofcontrol @user\n` +
      `> .csm panel event force erasure @user\n` +
      `> .csm panel event force makimacall @user\n` +
      `> .csm panel event force bloodfrenzy @user\n` +
      `> .csm panel event force devilsbargain @user\n` +
      `> .csm panel event force eyesofcontrol @user\n` +
      `> .csm panel raid force @user\n` +
      `> .csm panel raid unforce @user\n\n` +
      `*PARTNER & PENGATURAN*\n` +
      `> .csm panel partner add <nama> @user\n` +
      `> .csm panel partner del <nama> @user\n` +
      `> .csm panel partner set <nama> <field> <nilai> @user\n` +
      `> .csm panel inventory clear @user\n` +
      `> .csm panel about setdev <nomor>\n` +
      `> .csm panel about setsup <nama/nomor>\n` +
      `> .csm panel about cleardev\n` +
      `> .csm panel about clearsup\n` +
      `> .csm panel picture enable/disable\n` +
      `\nFIELD: blood, health, maxhealth, exp, level, resetcount, story.\n` +
      `@user: tag atau nomor WhatsApp target.\n` +
      `━━━━━━━━━━━`

    if (!panelArgs.length || ['list', 'help', 'commands'].includes(panelArgs[0].toLowerCase())) return m.reply(help)
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
      if (!['enable', 'disable'].includes(pictureAction)) return m.reply(panelHeader('PICTURE PANEL') + `Gunakan:\n> .csm panel picture enable\n> .csm panel picture disable\n━━━━━━━━━━━`)
      wdb.csmPicturesEnabled = pictureAction === 'enable'
      saveDB(wdb)
      return m.reply(panelHeader('CSM PICTURE DIUBAH') + `${pictureAction === 'enable' ? '✅ Pengiriman gambar diaktifkan.' : '🚫 Pengiriman gambar dinonaktifkan.'}\n━━━━━━━━━━━`)
    }
    if (['cooldown', 'cd'].includes(panelArgs[0].toLowerCase())) {
      if (!targetCSM) return m.reply(panelHeader('DATA TIDAK DITEMUKAN') + `Target belum memiliki data CSM RPG.\n━━━━━━━━━━━`)
      if (panelArgs[1]?.toLowerCase() !== 'reset') return m.reply(panelHeader('COOLDOWN PANEL') + `Gunakan:\n> .csm panel cooldown reset @user confirm\n━━━━━━━━━━━`)
      if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm') return m.reply(panelHeader('KONFIRMASI RESET CD') + `Ketik *.csm panel cooldown reset @user confirm* untuk menghapus semua cooldown target.\n━━━━━━━━━━━`)
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
      if (!numericFields.has(field) || !Number.isFinite(amount) || amount < 0 || !targetCSM) return m.reply(panelHeader('FORMAT SALAH') + `Resource atau jumlah tidak valid.\n${help}`)
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
      if (!numericFields.has(field) || !Number.isFinite(value) || value < 0 || !targetCSM) return m.reply(panelHeader('FORMAT SALAH') + `Field atau nilai tidak valid.\n${help}`)
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
      if (!rawItem) return m.reply(panelHeader('FORMAT SALAH') + `Gunakan: .csm panel inventory add <nomor/nama> @user\n.csm panel inventory del <nomor/nama> @user\n━━━━━━━━━━━`)
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
        if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm') return m.reply(panelHeader('KONFIRMASI RESET FIELD') + `Ketik *.csm panel reset ${resetField} @user confirm*.\n━━━━━━━━━━━`)
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
      if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm' || !targetCSM) return m.reply(panelHeader('KONFIRMASI RESET ADMIN') + `Reset panel menghapus seluruh data CSM: level, EXP, partner, achievement, reward, inventory, kontrak, dan semua riwayat.\nReset otomatis dari ending berbeda: hanya mengulang perjalanan dan memberikan reward ending.\nKetik *.csm panel reset @user confirm*\n━━━━━━━━━━━`)
      const resetCount = (Number(targetCSM.resetCount) || 0) + 1
      targetRecord.rpg.csm = { started: false, nickname: '', gender: 'None', health: 100, maxHealth: 100, level: 1, exp: 0, title: getTitle(1), blood: 0, story: 1, location: 'Markas Public Safety', devilContract: null, contractType: null, contractHistory: [], isTransform: false, inventory: [{ nama: 'Fist', dur: 999 }], weapon: { nama: 'Fist', dur: 999 }, erasureProtection: null, erasurePending: null, dollContract: false, contractExpire: 0, contractSide: null, contractPending: null, pendingEnding: null, ending: null, endingReward: [], endingHistory: [], endingBuffs: {}, resetCount, partners: [], relations: {}, achievements: [], terrorStory: [], hospital: [], jobs: {}, job: null, encounter: null, tempMission: null, pendingDuel: null, pendingBlood: 0, partnerGachaPending: null, storyCooldown: {}, seenContractScenes: [], seenExploreStories: [], seenMissionStories: [], seenRescueStories: [], seenRescueResults: [], buffHistory: [], lastTerror: 0, lastStory: 0, lastRest: 0, lastExplore: 0, lastMission: 0, lastVisit: 0, lastWork: 0, lastJob: 0, lastJobLeave: 0, lastPartnerGacha: 0, lastRevengeHeal: 0, lastRaid: '', lastSeenChars: {}, endings: [] }
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
      if (!partner || !['level', 'love', 'needlove', 'hp', 'status'].includes(field)) return m.reply(panelHeader('FORMAT PARTNER SALAH') + `Gunakan *.csm panel partner set <nama> <level|love|needlove|hp|status> <nilai> @user*.\n━━━━━━━━━━━`)
      if (field === 'status') {
        if (!['active', 'reserve'].includes(value.toLowerCase())) return m.reply(panelHeader('STATUS SALAH') + `Status hanya active atau reserve.\n━━━━━━━━━━━`)
        partner.status = value.toLowerCase()
      } else {
        const numericValue = Number(value)
        if (!Number.isFinite(numericValue) || numericValue < 0) return m.reply(panelHeader('NILAI SALAH') + `Nilai partner harus angka positif.\n━━━━━━━━━━━`)
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

  const dbJid = resolveJid(m.sender)
let user = wdb.users[dbJid]?.rpg || wdb.users[m.sender]?.rpg
  if (!user) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Ketik *.adventure* dulu buat daftar RPG.\n━━━━━━━━━━━`)

let userRPG = getUserRPG(wdb, dbJid)?.rpg || getUserRPG(wdb, m.sender)?.rpg
  if (!userRPG) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Data RPG bank tidak ditemukan.\n━━━━━━━━━━━`)
  const bankBalance = Number(userRPG.bank)
  userRPG.bank = Number.isFinite(bankBalance) && bankBalance >= 0 ? bankBalance : 0

if (!user.csm) user.csm = {
  started: false,
    nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant',
    devilContract: null, contractType: null, contractHistory: [], isTransform: false,
    erasureProtection: null, erasurePending: null, dollContract: false,
    lastTerror: 0, terrorStory: [], lastStory: 0,
  devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', gender: 'None',
    weapon: {nama: 'Fist', dur: 999},
    inventory: [{nama: 'Fist', dur: 999}], 
    lastRest: 0, lastGacha: 0, lastVisit: 0, lastExplore: 0, lastMission: 0,
    encounter: null, tempMission: null,
    relations: {}, pendingBlood: 0,
    lastWork: 0, pendingDuel: null,
    contractExpire: 0, contractSide: null, ending: null,
    partnerGachaPending: null, lastPartnerGacha: 0, lastRevengeHeal: 0,
    hospital: [], job: null, lastJob: 0, lastRaid: '', endings: [],
    achievements: [], lastSeenChars: {},
    storyCooldown: {},
    contractPending: null,
    dailyQuests: [], questDate: '', partnerReactionHistory: []
  }

  let csm = user.csm
  csm.title = getTitle(csm.level)
  if (csm.contractType === undefined) csm.contractType = csm.devilContract ? 'devil' : null
  if (csm.erasureProtection === undefined) csm.erasureProtection = null
  if (csm.erasurePending === undefined) csm.erasurePending = null
  if (csm.dollContract === undefined) csm.dollContract = false
  if (csm.lastTerror === undefined) csm.lastTerror = 0
  if (!Array.isArray(csm.terrorStory)) csm.terrorStory = []
  if (csm.lastStory === undefined) csm.lastStory = 0
  if (typeof csm.started !== 'boolean') {
    csm.started = false
    csm.gender = 'None'
    saveDB(wdb)
  }
  if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) csm.inventory = [{ nama: 'Fist', dur: 999 }]
  csm.inventory.filter(item => item.nama === 'Fist').forEach(item => { item.dur = Infinity })
  if (!Array.isArray(csm.foundItems)) csm.foundItems = []
  for (const item of csm.inventory) {
    if (ITEM_LIST.some(entry => entry.nama === item.nama) && !csm.foundItems.includes(item.nama)) csm.foundItems.push(item.nama)
  }
  const fist = () => ({ nama: 'Fist', dur: 999 })
  const equipFist = () => {
    const fistIndex = csm.inventory.findIndex(item => item.nama === 'Fist')
    if (fistIndex >= 0) csm.inventory.splice(fistIndex, 1)
    csm.inventory.unshift(fist())
    csm.weapon = fist()
  }
  if (!csm.weapon || !csm.weapon.nama) csm.weapon = fist()
  if (csm.weapon.nama === 'Fist') csm.weapon.dur = Infinity
  if (csm.weapon.nama !== 'Fist' && !csm.inventory.some(item => item.nama === csm.weapon.nama)) equipFist()
  if (csm.weapon.nama !== 'Fist' && csm.inventory[0]?.nama !== csm.weapon.nama) {
    const equippedIndex = csm.inventory.findIndex(item => item.nama === csm.weapon.nama)
    if (equippedIndex >= 0) csm.inventory.unshift(csm.inventory.splice(equippedIndex, 1)[0])
  }
  if (!Array.isArray(csm.partners)) csm.partners = []
  if (typeof csm.lastRandomEvent !== 'number') csm.lastRandomEvent = 0
  if (typeof csm.lastRaidTime !== 'number') csm.lastRaidTime = 0
  if (typeof csm.pendingRandomEvent !== 'string') csm.pendingRandomEvent = null
  if (!csm.relations || typeof csm.relations !== 'object') csm.relations = {}
  if (!csm.lastSeenChars || typeof csm.lastSeenChars !== 'object') csm.lastSeenChars = {}
  if (!csm.lastSeenDevils || typeof csm.lastSeenDevils !== 'object') csm.lastSeenDevils = {}
  if (!Array.isArray(csm.contractHistory)) csm.contractHistory = []
  if (!Array.isArray(csm.hospital)) csm.hospital = []
  if (!Array.isArray(csm.endings)) csm.endings = []
  if (!Array.isArray(csm.achievements)) csm.achievements = []
  if (!csm.storyCooldown || typeof csm.storyCooldown !== 'object') csm.storyCooldown = {}
  if (!Array.isArray(csm.dailyQuests)) csm.dailyQuests = []
  if (!Array.isArray(csm.partnerReactionHistory)) csm.partnerReactionHistory = []
  if (!Array.isArray(csm.workStories)) csm.workStories = []
  resetLegacyViewData(csm)
  if (!Array.isArray(csm.seenContractScenes)) csm.seenContractScenes = []
  if (!Array.isArray(csm.seenExploreStories)) csm.seenExploreStories = []
  if (!Array.isArray(csm.seenMissionStories)) csm.seenMissionStories = []
  if (!Array.isArray(csm.seenRescueStories)) csm.seenRescueStories = []
  if (!Array.isArray(csm.seenRescueResults)) csm.seenRescueResults = []
  if (!Array.isArray(csm.buffHistory)) csm.buffHistory = []
  const rememberSeen = (key, value) => {
    if (!value || csm[key].includes(value)) return
    csm[key].push(value)
  }
  if (!csm.partnerGachaPending || typeof csm.partnerGachaPending !== 'object') csm.partnerGachaPending = null
  if (typeof csm.lastPartnerGacha !== 'number') csm.lastPartnerGacha = 0
  if (typeof csm.lastRevengeHeal !== 'number') csm.lastRevengeHeal = 0
  if (typeof csm.lastRescue !== 'number') csm.lastRescue = Number(csm.lastRescue) || 0
  const getPartnerLevel = (partner) => {
    const character = CHARACTER_LIST.find(item => item.nama === partner.name)
    const love = Number(csm.relations?.[partner.name] || 0)
    const level = Math.max(1, Math.floor(love / Math.max(1, partner.needLove || character?.needLove || 1)) + 1)
    partner.level = level
    return level
  }
  const getLoveProgress = (love, needLove) => Number(love || 0) % Math.max(1, Number(needLove) || 1)
  csm.partners.forEach(partner => { getPartnerLevel(partner) })
  const getPartnerDamage = (partner) => {
    const level = getPartnerLevel(partner)
    return Math.max(10, level * 10) * (calcBonus(csm).partnerDmgMultiplier || 1)
  }
  const addPartnerExp = (targetCsm, amount) => {
    if (!targetCsm || !Array.isArray(targetCsm.partners)) return
    if (!targetCsm.relations || typeof targetCsm.relations !== 'object') targetCsm.relations = {}
    targetCsm.partners.filter(partner => partner.status === 'active').forEach(partner => {
      const character = CHARACTER_LIST.find(item => item.nama === partner.name)
      const needLove = Math.max(1, Number(partner.needLove || character?.needLove) || 1)
      targetCsm.relations[partner.name] = Number(targetCsm.relations[partner.name] || 0) + amount
      partner.level = Math.max(1, Math.floor(targetCsm.relations[partner.name] / needLove) + 1)
    })
  }
  const recordPartnerDialog = (partnerName, reactionText, outcome = 'neutral', extra = {}) => {
    const cleanName = String(partnerName || '').trim()
    const cleanText = String(reactionText || '...').trim()
    if (!cleanName || !cleanText) return ''
    const character = CHARACTER_LIST.find(item => item.nama === cleanName)
    const entry = {
      partner: cleanName,
      emoji: character?.emoji || '🤝',
      reaction: cleanText,
      outcome,
      source: extra.source || 'dialog',
      level: extra.level ?? getPartnerLevel(csm.partners.find(p => p.name === cleanName) || { name: cleanName, needLove: character?.needLove || 1 }),
      at: Date.now()
    }
    csm.partnerReactionHistory = Array.isArray(csm.partnerReactionHistory) ? csm.partnerReactionHistory : []
    csm.partnerReactionHistory.push(entry)
    return `\n\n${character?.emoji || '🤝'} *${cleanName}*\n> "${cleanText}"`
  }
  const injurePartners = (damage, outcome = 'hurt') => {
    if (!Array.isArray(csm.hospital)) csm.hospital = []
    const injured = []
    csm.partners.filter(partner => partner.status === 'active').forEach(partner => {
      partner.hp = Math.max(0, Number(partner.hp ?? 100) - Math.max(1, Math.floor(damage * 0.35)))
      if (partner.hp <= 0) {
        partner.status = 'hospital'
        csm.hospital.push(partner)
        injured.push(partner)
      }
    })
    if (!injured.length) return ''
    return `\n🏥 ${injured.map(partner => {
      const character = CHARACTER_LIST.find(item => item.nama === partner.name)
      const line = outcome === 'lose' ? 'Aku tidak bisa berdiri lagi... selamatkan yang lain.' : 'Lukaku parah, tapi aku masih percaya padamu.'
      recordPartnerDialog(partner.name, line, outcome, { source: 'injure' })
      return `${character?.emoji || '🏥'} *${partner.name}*: "${line}"`
    }).join('\n')}\nPartner dibawa ke hospital. Gunakan *.csm hospital* untuk memulihkan mereka.`
  }
  const partnerReaction = (outcome = 'neutral', grantExp = true) => {
    const activePartners = csm.partners.filter(partner => partner.status === 'active')
    if (!activePartners.length) return ''
    const partnerExp = Math.floor(Math.random() * 3) + 1
    if (grantExp) addPartnerExp(csm, partnerExp)
    const lines = PARTNER_REACTIONS[outcome] || PARTNER_REACTIONS.neutral
    const reactionText = activePartners.map(partner => {
      const character = CHARACTER_LIST.find(item => item.nama === partner.name)
      if (!character) return ''
      const line = lines[Math.floor(Math.random() * lines.length)] || PARTNER_REACTIONS.neutral[0]
      return recordPartnerDialog(character.nama, line, outcome, { source: 'reaction', level: getPartnerLevel(partner) })
    }).filter(Boolean).join('')
    return `\n\n💌 Partner EXP: +${partnerExp}${reactionText}\n\n`
  }
  let today = new Date().toISOString().split('T')[0]
  let args = text ? text.trim().split(/ +/) : []
let action = normalizeCsmAction((args[0] || '').toLowerCase())
  const header = (title) => `╭──「 ⛓️ DEVIL HUNTER RPG 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`

  const awardQuestReward = (quest, source = 'manual') => {
    if (!quest || quest.claimed) return false
    quest.claimed = true
    csm.blood += Number(quest.blood || 0)
    csm.exp += Number(quest.exp || 0)
    let leveled = false
    while (csm.exp >= csm.level * 300) {
      csm.exp -= csm.level * 300
      csm.level++
      csm.maxHealth += 25
      csm.health = csm.maxHealth
      leveled = true
    }
    csm.title = getTitle(csm.level)
    quest.autoRewardedAt = Date.now()
    quest.completedSource = source
    saveDB(wdb)
    const sourceText = source === 'activity'
      ? '📌 Selesai otomatis dari aktivitas'
      : source === 'skip'
        ? '⚡ Selesai via skip quest'
        : source === 'claim'
          ? '✅ Klaim manual quest'
          : '🏆 Quest selesai'
    const message = header('QUEST SELESAI') +
      `${quest.name}\n\n` +
      `${sourceText}\n\n` +
      `> 🩸 +${Number(quest.blood || 0).toLocaleString()} Blood\n` +
      `> 📈 +${Number(quest.exp || 0).toLocaleString()} EXP` +
      `${leveled ? `\n> 🎉 LEVEL UP! Lv.${csm.level}` : ''}\n` +
      `|━━━━━━━━━━━`
    if (typeof m.reply === 'function') m.reply(message)
    return true
  }

  const recordActivity = activity => {
    if (!Array.isArray(csm.dailyQuests)) return
    csm.dailyQuests.forEach(quest => {
      if (quest.type !== activity || quest.claimed) return
      quest.progress = Math.min(quest.target, Number(quest.progress || 0) + 1)
      if (quest.progress >= quest.target) {
        awardQuestReward(quest, 'activity')
      }
    })
  }
  const ensureDailyQuests = () => {
    if (csm.questDate === today && Array.isArray(csm.dailyQuests) && csm.dailyQuests.length === 2) {
      csm.dailyQuests = csm.dailyQuests.map(quest => ({
        ...quest,
        progress: Number(quest.progress || 0),
        claimed: Boolean(quest.claimed),
        target: Number(quest.target || 1),
        blood: Number(quest.blood || 0),
        exp: Number(quest.exp || 0)
      }))
      return
    }
    const pool = [...QUEST_LIST]
    const dailyQuests = []
    while (dailyQuests.length < 2 && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length)
      dailyQuests.push({ ...pool.splice(index, 1)[0], progress: 0, claimed: false })
    }
    csm.questDate = today
    csm.dailyQuests = dailyQuests
    saveDB(wdb)
  }
  ensureDailyQuests()
  recordActivity(action)

// --- BAGIAN 2: LOGIKA COMMAND (DAILY 4 WAKTU: HOURLY, DAILY, WEEKLY, MONTHLY & QUEST) ---

if (['daily', 'weekly', 'monthly', 'hourly'].includes(action)) {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay

  let claimKey = ''
  let streakKey = ''
  let rewardBlood = 0
  let headerTitle = ''
  let cooldownTime = 0

  if (action === 'hourly') {
    claimKey = 'hourlyDate'
    streakKey = 'hourlyStreak'
    rewardBlood = 1500
    headerTitle = 'HOURLY REWARD (JAM-AN)'
    cooldownTime = oneHour
  } else if (action === 'daily') {
    claimKey = 'dailyDate'
    streakKey = 'dailyStreak'
    rewardBlood = 10000
    headerTitle = 'DAILY REWARD (HARIAN)'
    cooldownTime = oneDay
  } else if (action === 'weekly') {
    claimKey = 'weeklyDate'
    streakKey = 'weeklyStreak'
    rewardBlood = 75000
    headerTitle = 'WEEKLY REWARD (MINGGUAN)'
    cooldownTime = oneWeek
  } else if (action === 'monthly') {
    claimKey = 'monthlyDate'
    streakKey = 'monthlyStreak'
    rewardBlood = 350000
    headerTitle = 'MONTHLY REWARD (BULANAN)'
    cooldownTime = oneMonth
  }

  const lastClaim = Number(csm[claimKey] || 0)
  const timeLeft = cooldownTime - (now - lastClaim)

  if (timeLeft > 0) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    let tim... (319 KB left)