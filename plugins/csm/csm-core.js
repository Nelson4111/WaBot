/**
 * CSM RPG - Chainsaw Man Adventure Bot
 * Modular core controller and routing entry point
 */

import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { calcBonus } from '../../lib/rpg-libmyCSM.js'
import {
  normalizeCsmAction, resolveJid, headerUnavailable, header
} from './lib/utils.js'
import { initCsmUser } from './lib/state.js'
import { recordActivity, ensureDailyQuests } from './lib/quest.js'

// Command Handlers
import { handlePanel } from './commands/panel.js'
import { handleStart, handleNickname, handleGender } from './commands/setup.js'
import { handleDaily } from './commands/daily.js'
import { handleQuest } from './commands/quest-cmd.js'
import { handleCooldown } from './commands/cooldown.js'
import { handleAbout, handleCommand, handleTutorial } from './commands/about.js'
import { handleProfile, handleStats, handleView } from './commands/profile.js'
import { handleLocation } from './commands/location.js'
import { handleVisit } from './commands/visit.js'
import { handleExplore } from './commands/explore.js'
import { handleTerror } from './commands/terror.js'
import { handleMission } from './commands/mission.js'
import { handleRescue } from './commands/rescue.js'
import { handleContract } from './commands/contract.js'
import { handleBlood } from './commands/blood.js'
import { handleStory, handleStoryList } from './commands/story.js'
import { handleEnding } from './commands/ending.js'
import { handleReset } from './commands/reset.js'
import { handleShop, handleSell } from './commands/shop.js'
import { handleEquip, handleRepair } from './commands/equip.js'
import { handleInventory } from './commands/inventory.js'
import { handleJob, handleWork } from './commands/job.js'
import { handlePartner } from './commands/partner.js'
import { handleHospital, handleRevive } from './commands/hospital.js'
import { handleChar } from './commands/char.js'
import { handleDuel } from './commands/duel.js'
import { handleGift } from './commands/gift.js'
import { handleRest, handleHeal } from './commands/rest.js'
import {
  handleEvent, handleDevilsBargain, handleEyesOfControl,
  handleBloodFrenzy, handleHungerFeast, handleDeathSentence,
  handleChildWish, handleWeaponization, handleDollContract,
  handleErasure, handleMakimaCall
} from './commands/events.js'
import { handleGallery } from './commands/gallery.js'
import { handleRaid } from './commands/raid.js'

const ACTION_ROUTER = {
  panel: handlePanel,
  start: handleStart,
  nickname: handleNickname,
  gender: handleGender,
  kelamin: handleGender,
  hourly: handleDaily,
  daily: handleDaily,
  weekly: handleDaily,
  monthly: handleDaily,
  quest: handleQuest,
  cooldown: handleCooldown,
  cd: handleCooldown,
  about: handleAbout,
  command: handleCommand,
  tutorial: handleTutorial,
  profile: handleProfile,
  stats: handleStats,
  view: handleView,
  location: handleLocation,
  visit: handleVisit,
  explore: handleExplore,
  terror: handleTerror,
  mission: handleMission,
  rescue: handleRescue,
  contract: handleContract,
  blood: handleBlood,
  story: handleStory,
  storylist: handleStoryList,
  ending: handleEnding,
  reset: handleReset,
  shop: handleShop,
  store: handleShop,
  toko: handleShop,
  jual: handleSell,
  sell: handleSell,
  equip: handleEquip,
  repair: handleRepair,
  inv: handleInventory,
  inventory: handleInventory,
  use: handleInventory,
  job: handleJob,
  work: handleWork,
  partner: handlePartner,
  hospital: handleHospital,
  revive: handleRevive,
  char: handleChar,
  duel: handleDuel,
  gift: handleGift,
  rest: handleRest,
  heal: handleHeal,
  event: handleEvent,
  devilsbargain: handleDevilsBargain,
  eyesofcontrol: handleEyesOfControl,
  bloodfrenzy: handleBloodFrenzy,
  hungerfeast: handleHungerFeast,
  deathsentence: handleDeathSentence,
  childwish: handleChildWish,
  weaponization: handleWeaponization,
  dollcontract: handleDollContract,
  erasure: handleErasure,
  makimacall: handleMakimaCall,
  picture: handleGallery,
  gallery: handleGallery,
  pict: handleGallery,
  raid: handleRaid
}

let handler = async (message, { conn, text, usedPrefix, command }) => {
  const m = Object.create(message)
  const wdb = loadDB()

  const normalizeMessage = msg => typeof msg === 'string' ? msg + `\n\n` : msg
  const originalReply = message.reply.bind(message)
  Object.defineProperty(m, 'reply', {
    value: replyMessage => originalReply(normalizeMessage(replyMessage)),
    writable: true,
    configurable: true
  })

  const senderJid = resolveJid(m.sender, wdb)
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

  // Routing context builder helper
  const createContext = (currentAction, currentArgs) => ({
    m,
    conn,
    csm: null, // will be assigned below
    user: null,
    userRPG: null,
    wdb,
    args: currentArgs,
    text,
    usedPrefix,
    command,
    rawArgs,
    action: currentAction,
    isPrivileged,
    senderJid,
    senderNumber,
    resolvedSenderNumber,
    today: new Date().toISOString().split('T')[0],
    helpPrefix: usedPrefix
  })

  // === ADMIN PANEL ===
  if (rawAction === 'panel') {
    if (!isPrivileged) return m.reply(headerUnavailable('PANEL'))
    const ctx = createContext('panel', rawArgs)
    return handlePanel(ctx)
  }

  const dbJid = resolveJid(m.sender, wdb)
  let user = wdb.users[dbJid]?.rpg || wdb.users[m.sender]?.rpg
  if (!user) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Ketik *.adventure* dulu buat daftar RPG.\n━━━━━━━━━━━`)

  let userRPG = getUserRPG(wdb, dbJid)?.rpg || getUserRPG(wdb, m.sender)?.rpg
  if (!userRPG) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Data RPG bank tidak ditemukan.\n━━━━━━━━━━━`)
  const bankBalance = Number(userRPG.bank)
  userRPG.bank = Number.isFinite(bankBalance) && bankBalance >= 0 ? bankBalance : 0

  // State initialization & schema normalization
  let csm = initCsmUser(user, wdb)

  let today = new Date().toISOString().split('T')[0]
  let args = text ? text.trim().split(/ +/) : []
  let action = normalizeCsmAction((args[0] || '').toLowerCase())

  // Daily quests and activity recording
  ensureDailyQuests(csm, today, wdb)
  recordActivity(csm, action, m, wdb)

  const currentBonus = calcBonus(csm)

  // Devil's Bargain expiration check
  if (csm.devilBargain && csm.devilBargain.expiresAt <= Date.now()) {
    csm.health = Math.max(1, csm.health - 10)
    csm.devilBargain = null
    saveDB(wdb)
  }

  // Event sub-command re-routing
  if (rawAction === 'erasure' || rawAction === 'makimacall') {
    return m.reply(header('EVENT TERKUNCI') + `Gunakan *.csm event ${rawAction}* untuk mengakses event ini.\n━━━━━━━━━━━`)
  }

  if (action === 'event' && ['erasure', 'makimacall', 'devilsbargain', 'eyesofcontrol', 'bloodfrenzy', 'weaponization', 'hungerfeast', 'deathsentence', 'childwish', 'dollcontract'].includes(args[1]?.toLowerCase())) {
    action = args[1].toLowerCase()
    args = [action, ...args.slice(2)]
  }

  if (['erasure', 'makimacall', 'devilsbargain', 'eyesofcontrol', 'bloodfrenzy', 'weaponization', 'hungerfeast', 'deathsentence', 'childwish', 'dollcontract'].includes(action) && args[1] && csm.pendingRandomEvent === action) {
    csm.pendingRandomEvent = null
    saveDB(wdb)
  }

  if (action === 'event' && args[1]?.toLowerCase() === 'history') {
    const history = Array.isArray(wdb.csmEventHistory) ? wdb.csmEventHistory.slice(-30).reverse() : []
    const labels = {
      makimacall: 'Makima Call', devilsbargain: "The Devil's Bargain", eyesofcontrol: 'Eyes of Control',
      bloodfrenzy: 'Blood Frenzy', weaponization: 'Weaponization', hungerfeast: "Hunger's Feast",
      deathsentence: 'Death Sentence', childwish: 'A Child Wish', dollcontract: 'Doll Contract', erasure: 'Erasure Effect'
    }
    const lines = history.map((entry, index) => {
      const date = new Date(entry.date).toLocaleString('id-ID')
      return `${index + 1}. ${entry.nickname || 'Hunter'} - ${labels[entry.event] || entry.event} (${date})`
    })
    return m.reply(header('RIWAYAT EVENT') + `Event terpicu: ${history.length}/30\n\n${lines.length ? lines.join('\n') : 'Belum ada event yang terpicu.'}\n━━━━━━━━━━━`)
  }

  // Peace ending restriction check
  if (currentBonus.noFight && ((action === 'mission' && args[1] === 'fight') || (action === 'visit' && args[1] === 'fight'))) {
    return m.reply(header('PEACE ENDING') + `Bonus Peace mencegah pertarungan.\n━━━━━━━━━━━`)
  }

  // Route context
  const ctx = {
    m,
    conn,
    csm,
    user,
    userRPG,
    wdb,
    args,
    text,
    usedPrefix,
    command,
    rawArgs,
    action,
    isPrivileged,
    senderJid,
    senderNumber,
    resolvedSenderNumber,
    today,
    helpPrefix: usedPrefix
  }

  const routeHandler = ACTION_ROUTER[action]
  if (typeof routeHandler === 'function') {
    return routeHandler(ctx)
  }

  // Default: display about
  return handleAbout(ctx)
}

handler.command = ['csm', 'chainsaw']
handler.help = ['csm']
handler.tags = ['csm']
handler.limit = true

export default handler
