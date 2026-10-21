import { randomUUID } from 'node:crypto'
import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { setAfk } from '../../lib/afkHelper.js'
import { normalizeFishKey } from '../../lib/rpg-fishCatalog.js'
import { hewanList, getHewan, getHewanKey, prosesKawin } from '../../lib/rpg-libternakData.js'
import { BANK_TIERS } from './rpg-bank.js'
import { bibit } from './rpg-panen.js'
import { CINCIN_SHOP, normalizeRingName } from '../../lib/pasanganHelper.js'
import { filterRpgPanelUsers, isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import { isDifficultyRanked, normalizeDifficulty, recordDifficultyChange, RPG_DIFFICULTIES } from '../../lib/rpgDifficulty.js'
import { setUserLimit, syncUserLimit } from '../../lib/userLimit.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { EVONEXUS_ABILITIES, getEvonexusAbilityTier, normalizeEvonexusValue } from '../../lib/rpg-evonexusData.js'
import { MALL_CATEGORIES } from '../../lib/rpgMallData.js'
import { AUCTION_ITEMS } from '../../lib/rpg-auctionData.js'
import { finishAuctionNow } from './rpg-auction.js'
import { BANK_SPECIAL_ITEMS } from '../../lib/rpg-bankData.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'
import {
  getHomeLevel,
  HOME_MAX_UPGRADES,
  HOME_BASE_FURNITURE_CAPACITY,
  HOME_UPGRADE_FURNITURE_CAPACITY,
  HOME_PREMIUM_FURNITURE_BONUS,
  clampHomeStat
} from '../../lib/rpgHomeData.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import { computeCrimeScore, getActiveCrimeScore, setActiveCrimeScore, setCrimeCount } from '../../lib/crimeHelper.js'
import { createRpgCrimeRecord, RPG_CRIME_TYPES } from '../../lib/rpgCrimeAction.js'
import { forceCompleteRehabilitation } from '../../lib/rehabilitationHelper.js'
import { parseRpgMoneyAmount } from '../../lib/rpgMoney.js'
import { getRpgWibDateKey } from '../../lib/rpgTime.js'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { generateWAMessageContent } from '@whiskeysockets/baileys'
import { JOBS, JOB_MAX_APPLIED, getJobByIdentifier, getJobTitleByPoints } from '../../lib/rpgJobData.js'
import { sendRpgButtons, sendRpgConfirmButtons } from '../../lib/rpgActionButtons.js'

import fs from 'fs'

const MAX_BANK_TIER = Math.max(...Object.keys(BANK_TIERS).map(Number))
const PANEL_MALL_ITEMS = Object.entries(MALL_CATEGORIES)
  .flatMap(([category, data]) => data.items.map(item => ({ ...item, category })))
  .concat(
    AUCTION_ITEMS.map(item => ({ ...item, category: 'koleksi' })),
    BANK_SPECIAL_ITEMS.map(item => ({ ...item, category: 'koleksi' }))
  )

function findPanelMallItem(input) {
  const key = normalizeEvonexusValue(input)
  if (!key) return null
  return PANEL_MALL_ITEMS.find(item =>
    normalizeEvonexusValue(item.id) === key ||
    normalizeEvonexusValue(item.name) === key
  ) || null
}

function formatPanelEvonexus(rpg) {
  const evonexus = rpg.evonexus || {}
  const installed = Object.entries(rpg.evonexus?.installed || {})
    .map(([type, id]) => EVONEXUS_ABILITIES.find(ability => ability.id === id && ability.type === type))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'id'))
  const body = installed.length
    ? installed.map(ability => `> ${ability.name} (${ability.type.toUpperCase()} / ${getEvonexusAbilityTier(ability).name})`).join('\n')
    : '> Tidak ada SC Core terpasang.'
  return `Rank: ${evonexus.rank || 'Awak Baru'} · Level: ${Number(evonexus.level) || 1}\n` +
    `Eksplorasi: ${Number(rpg.interstellarExplores) || 0} · Resonansi: ${Number(evonexus.resonance) || 0}\n` +
    `Stat points: ${Number(evonexus.statPoints) || 0}\n` +
    `Stellar Credit: ${Number(rpg.stellarCredit) || 0} 💠\nSC Core terpasang: ${installed.length}\n${body}`
}

function getJakartaDate(timestamp) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// TAMBAHIN INI DI BAWAHNYA
function getAdvTitle(lvl){
  if(lvl >= 250) return '👑 DEWA PENJELAJAH'
  if(lvl >= 200) return '🌌 MITOS HIDUP'
  if(lvl >= 150) return '⚔️ LEGENDA'
  if(lvl >= 100) return '💎 EPIC HERO'
  if(lvl >= 50) return '✨ PENJELAJAH ULUNG'
  if(lvl >= 25) return '💙 PETUALANG'
  if(lvl >= 10) return '🤍 PEMULA'
  return '🗑️ PENGEMBARA'
}

function normalizeRpgPanelCategory(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

const RPG_PANEL_CATEGORIES = Object.freeze([
  { title: 'GLOBAL', marker: '📊 *GLOBAL*', aliases: ['global'] },
  { title: 'USER STAT', marker: '👤 *USER STAT*', aliases: ['user', 'userstat', 'user-stat', 'stat'] },
  { title: 'LEADERBOARD', marker: '🏆 *LEADERBOARD*', aliases: ['leaderboard', 'top'] },
  { title: 'INVENTORY', marker: '🎒 *INVENTORY*', aliases: ['inventory', 'inv'] },
  { title: 'GUDANG', marker: '📦 *GUDANG*', aliases: ['gudang', 'storage'] },
  { title: 'TERNAK', marker: '🐄 *TERNAK*', aliases: ['ternak', 'peternakan'] },
  { title: 'PERTANIAN', marker: '🌾 *PERTANIAN*', aliases: ['pertanian', 'panen'] },
  { title: 'ADVENTURE', marker: '🗺️ *ADVENTURE*', aliases: ['adventure', 'adv'] },
  { title: 'BANK', marker: '🏦 *BANK*', aliases: ['bank'] },
  { title: 'EVONEXUS', marker: '🧬 *EVONEXUS*', aliases: ['evx', 'evonexus'] },
  { title: 'MALL', marker: '🛍️ *MALL*', aliases: ['mall'] },
  { title: 'HOME', marker: '🏠 *HOME*', aliases: ['home', 'rumah'] },
  { title: 'AUCTION', marker: '🔨 *AUCTION*', aliases: ['auction', 'lelang'] },
  { title: 'RSHIP', marker: '💕 *RSHIP*', aliases: ['rship', 'relationship'] },
  { title: 'CSM PANEL', marker: '⛓️ *CSM PANEL*', aliases: ['csm'] },
  { title: 'MODERASI & RESET', marker: '💊 *MODERASI & RESET*', aliases: ['lainnya', 'moderasi', 'reset'] },
  { title: 'UPDATE RPG', marker: '🧬 *UPDATE RPG*', aliases: ['update', 'updates', 'fitur'] },
  { title: 'ADMIN', marker: '🛠️ *ADMIN*', aliases: ['admin', 'owner', 'limit', 'news', 'admincommands', 'ownercommands'] },
  { title: 'RPG COMMANDS', marker: '📜 *RPG COMMANDS*', aliases: ['commands', 'command', 'perintah', 'rpg'] }
])

function getRpgPanelSection(panelText, category) {
  const start = panelText.indexOf(category.marker)
  if (start < 0) return ''
  const nextStart = RPG_PANEL_CATEGORIES
    .map(({ marker }) => panelText.indexOf(marker))
    .filter(index => index > start)
    .sort((a, b) => a - b)[0] ?? panelText.length
  return panelText.slice(start, nextStart).replace(/\n+─━━━━━━━━━━━━━━─\s*$/, '').trim()
}

function getPluginCommandLines(tag, usedPrefix) {
  const helpEntries = Object.values(global.plugins || {})
    .filter(plugin => !plugin?.disabled && Array.isArray(plugin?.tags) && plugin.tags.includes(tag))
    .flatMap(plugin => Array.isArray(plugin.help)
      ? plugin.help
      : typeof plugin.help === 'string' ? [plugin.help] : [])
    .filter(entry => typeof entry === 'string' && entry.trim())
    .map(entry => entry.trim().replace(/^\./, ''))
  const uniqueEntries = [...new Set(helpEntries)]
  return uniqueEntries.length
    ? uniqueEntries.map(entry => `> ↳ ${usedPrefix}${entry}`).join('\n')
    : '> ↳ Belum ada command yang terdaftar.'
}

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  isOwner,
  groupMetadata,
  command,
  _rpgPanelConfirmedToken
}) => {
  const sourceMessage = m
  const originalReply = m.reply.bind(m)
  const isPrivateRpgPanel = String(command || '').toLowerCase() === 'rp' &&
    (m.isGroup || m.chat?.endsWith('@g.us'))
  const responseChat = m.chat
  if (isPrivateRpgPanel && sourceMessage.key) {
    try {
      await conn.sendMessage(responseChat, { delete: sourceMessage.key })
    } catch (error) {
      console.warn('[RPG-PANEL-PRIVACY] Gagal menghapus command .rp dari grup:', error?.message || error)
    }
  }

  const sendPanelResponse = async (content, options = {}) => {
    if (!isPrivateRpgPanel) {
      return conn.sendMessage(responseChat, content, { quoted: sourceMessage, ...options })
    }

    const playerJid = conn.decodeJid ? conn.decodeJid(sourceMessage.sender) : sourceMessage.sender
    const payload = typeof content === 'string' ? { text: content } : { ...content }
    const mentions = [...new Set([
      ...(Array.isArray(payload.mentions) ? payload.mentions : []),
      ...(Array.isArray(options.mentions) ? options.mentions : [])
    ])]
    delete payload.mentions

    let playerMessage
    if (typeof payload.text === 'string' && !payload.image && !payload.video && !payload.document && !payload.sticker) {
      const contextInfo = {
        ...(payload.contextInfo || {}),
        ...(options.contextInfo || {}),
        ...(mentions.length ? { mentionedJid: mentions } : {})
      }
      playerMessage = {
        extendedTextMessage: {
          text: payload.text,
          ...(Object.keys(contextInfo).length ? { contextInfo } : {})
        }
      }
    } else {
      if (mentions.length) {
        payload.contextInfo = {
          ...(payload.contextInfo || {}),
          ...(options.contextInfo || {}),
          mentionedJid: mentions
        }
      }
      playerMessage = await generateWAMessageContent(payload, { upload: conn.waUploadToServer })
    }

    const playerNumber = String(playerJid || '').split('@')[0]
    try {
      return await sendDualGroupMessage(
        conn,
        responseChat,
        playerJid,
        playerMessage,
        `> 🔒 Balasan RPG khusus untuk @${playerNumber}.`,
        { contextInfo: { mentionedJid: [playerJid] } }
      )
    } catch (error) {
      console.error('[RPG-PANEL-PRIVACY] Gagal mengirim balasan khusus di grup:', error?.message || error)
      return conn.sendMessage(responseChat, {
        text: `> 🔒 Balasan RPG khusus untuk @${playerNumber} tidak dapat dikirim.`,
        mentions: [playerJid]
      }, { quoted: sourceMessage })
    }
  }

  m = Object.create(m)
  Object.defineProperty(m, 'reply', {
    value: (...args) => {
      if (!isPrivateRpgPanel) return originalReply(...args)
      const [content, chatIdOrOptions, replyOptions] = args
      const options = replyOptions ??
        (chatIdOrOptions && typeof chatIdOrOptions === 'object' ? chatIdOrOptions : {})
      return sendPanelResponse(content, options)
    }
  })

  if (!isOwner) return m.reply('❌ Fitur khusus Owner')

  const wdb = loadDB()
  wdb.guilds = wdb.guilds || {}
  wdb.crime = wdb.crime || {}
  wdb.users = wdb.users || {}
  wdb.money = wdb.money || {}

  let rawArgs = (text || '').trim().split(/\s+/).filter(Boolean)
  let aksi = rawArgs[0]?.toLowerCase()
  let remaining = rawArgs.slice(1)
  const panelConfirmations = wdb.data.rpgPanelConfirmations || (wdb.data.rpgPanelConfirmations = {})

  const now = Date.now()
  for (const [token, pending] of Object.entries(panelConfirmations)) {
    if (!pending || now - Number(pending.createdAt) > RPG_CONFIRMATION_TTL) {
      delete panelConfirmations[token]
    }
  }

  if (aksi === 'confirm') {
    const token = String(rawArgs[1] || '')
    const decision = String(rawArgs[2] || '').toLowerCase()
    const pending = panelConfirmations[token]
    if (!pending) {
      return m.reply('⌛ Konfirmasi panel sudah tidak berlaku. Jalankan kembali perintah RPG Panel.')
    }
    if (pending.owner !== m.sender || pending.chat !== m.chat) {
      return m.reply('🔒 Tombol konfirmasi ini hanya dapat digunakan oleh pemilik permintaan di chat asal.')
    }
    if (now - Number(pending.createdAt) > RPG_CONFIRMATION_TTL) {
      delete panelConfirmations[token]
      await saveDB(wdb)
      return m.reply('⌛ Konfirmasi panel sudah tidak berlaku. Jalankan kembali perintah RPG Panel.')
    }
    if (!['ya', 'yes', 'confirm', 'tidak', 'no', 'batal', 'cancel'].includes(decision)) {
      return m.reply(`Pilih tombol konfirmasi atau pembatalan untuk melanjutkan.`)
    }
    delete panelConfirmations[token]
    await saveDB(wdb)
    if (['tidak', 'no', 'batal', 'cancel'].includes(decision)) {
      return m.reply('✅ Aksi RPG Panel dibatalkan; data tidak diubah.')
    }
    if (pending.operation === 'asuhanak') {
      const validated = pending.validated
      const ownerData = validated && wdb.users[validated.ownerJid]
      const guardianData = validated && wdb.users[validated.guardianJid]
      const owner = ownerData?.rpg || ownerData
      const guardian = guardianData?.rpg || guardianData
      const sourceList = validated?.shelterSource ? owner?.shelterKids : owner?.kids
      const child = sourceList?.[validated?.childIndex]
      if (
        !owner || ownerData?.isDummy || !guardian || guardianData?.isDummy ||
        !child || child.nama !== validated.childName ||
        child.facility || child.pendingTransferId || child.custody?.type === 'foster' ||
        validated.ownerJid === validated.guardianJid
      ) {
        await saveDB(wdb)
        return m.reply('❌ Data anak atau pengasuh berubah setelah pemeriksaan. Tidak ada perubahan yang diterapkan; jalankan ulang perintah Panel.')
      }

      if (validated.shelterSource) {
        child.originalOwnerLocation = 'shelterKids'
        child.originalShelterStatus = child.shelterStatus ? { ...child.shelterStatus } : null
        delete child.shelterStatus
      } else {
        child.originalOwnerLocation = 'kids'
        if (child.custody) child.originalCustody = { ...child.custody }
      }
      child.originalOwnerJid = validated.ownerJid
      child.custody = { type: 'foster', guardianJid: validated.guardianJid }
      if (!Array.isArray(guardian.kids)) guardian.kids = []
      sourceList.splice(validated.childIndex, 1)
      guardian.kids.push(child)
      await saveDB(wdb)
      return m.reply(
        `✅ Anak *${child.nama}* sekarang berada dalam pengasuhan @${validated.guardianJid.split('@')[0]}.\n` +
        `> ↳ Asal: ${validated.shelterSource ? 'shelter' : 'keluarga'} @${validated.ownerJid.split('@')[0]}.\n` +
        `> ↳ Kembalikan melalui *${usedPrefix}rpgpanel kembalianak @pengasuh <no-anak-asuh>*.`,
        null,
        { mentions: [validated.ownerJid, validated.guardianJid] }
      )
    }
    if (pending.operation === 'pindahanak') {
      const validated = pending.validated
      const account = validated && wdb.users[validated.userJid]
      const targetUser = account?.rpg || account
      const sourceList = validated?.shelterSource ? targetUser?.shelterKids : targetUser?.kids
      const child = sourceList?.[validated?.childIndex]
      if (
        !targetUser || account?.isDummy || !child ||
        JSON.stringify(child) !== validated.childSnapshot ||
        child.facility || child.pendingTransferId || child.custody?.type === 'foster'
      ) {
        return m.reply('❌ Data anak berubah atau sudah tidak bisa dipindahkan sejak pemeriksaan. Tidak ada perubahan; jalankan ulang perintah Panel.')
      }
      sourceList.splice(validated.childIndex, 1)
      if (validated.shelterSource) {
        delete child.shelterStatus
        child.lastCaredAt = Date.now()
        child.lastNeglectCheckAt = Date.now()
        if (!Array.isArray(targetUser.kids)) targetUser.kids = []
        targetUser.kids.push(child)
      } else {
        child.shelterStatus = { reason: 'lost', enteredAt: Date.now() }
        if (!Array.isArray(targetUser.shelterKids)) targetUser.shelterKids = []
        targetUser.shelterKids.push(child)
      }
      await saveDB(wdb)
      return m.reply(
        `✅ Anak *${child.nama}* dipindahkan ${validated.shelterSource ? 'dari shelter ke keluarga' : 'dari keluarga ke shelter'} @${validated.userJid.split('@')[0]}.`,
        null,
        { mentions: [validated.userJid] }
      )
    }
    if (pending.operation === 'setanak-owner') {
      const validated = pending.validated
      const guardianData = validated && wdb.users[validated.guardianJid]
      const ownerData = validated && wdb.users[validated.ownerJid]
      const guardian = guardianData?.rpg || guardianData
      const owner = ownerData?.rpg || ownerData
      const sourceKids = guardian?.kids
      const child = sourceKids?.[validated?.childIndex]
      if (
        !guardian || guardianData?.isDummy || !owner || ownerData?.isDummy || !child ||
        child.nama !== validated.childName || child.facility || child.pendingTransferId ||
        (child.custody?.type || null) !== (validated.previousCustody?.type || null) ||
        (child.originalOwnerJid || null) !== validated.previousOwnerJid
      ) {
        return m.reply('❌ Data anak atau akun berubah setelah pemeriksaan. Tidak ada perubahan; jalankan ulang perintah Panel.')
      }
      if (validated.guardianJid === validated.ownerJid) {
        delete child.custody
        delete child.originalCustody
        delete child.originalOwnerJid
        delete child.originalOwnerLocation
        delete child.originalShelterStatus
        await saveDB(wdb)
        return m.reply(
          `✅ Anak *${child.nama}* sekarang tercatat sebagai anak sendiri @${validated.ownerJid.split('@')[0]}.\n` +
          `> ↳ Status pengasuhan sudah dihapus; anak tetap di daftar keluarga user tersebut.`,
          null,
          { mentions: [validated.ownerJid] }
        )
      }
      if (child.custody?.type !== 'foster') {
        if (child.custody) child.originalCustody = { ...child.custody }
      }
      child.originalOwnerJid = validated.ownerJid
      child.originalOwnerLocation ||= 'kids'
      child.custody = { type: 'foster', guardianJid: validated.guardianJid }
      await saveDB(wdb)
      return m.reply(
        `✅ Anak *${child.nama}* sekarang tercatat sebagai anak @${validated.ownerJid.split('@')[0]}.\n` +
        `> ↳ Anak tetap berada di daftar keluarga @${validated.guardianJid.split('@')[0]} sebagai pengasuh.\n` +
        `> ↳ Untuk mengembalikan anak ke keluarga pemilik: *${usedPrefix}rpgpanel kembalianak @pengasuh ${validated.childIndex + 1}*.`,
        null,
        { mentions: [validated.ownerJid, validated.guardianJid] }
      )
    }
    const replayMessage = Object.create(m)
    Object.defineProperty(replayMessage, 'mentionedJid', {
      value: pending.mentionedJid || [],
      configurable: true
    })
    if (pending.quotedSender) {
      Object.defineProperty(replayMessage, 'quoted', {
        value: { sender: pending.quotedSender },
        configurable: true
      })
    }
    return handler(replayMessage, {
      conn,
      text: pending.text,
      usedPrefix,
      isOwner,
      groupMetadata,
      command,
      _rpgPanelConfirmedToken: token
    })
  }

  const panelReadOnlyActions = new Set([
    'command', 'commands', 'cmd', 'all', 'kategori', 'categories',
    'toprpg', 'rpgstat', 'topyt', 'evx', 'mall', 'home', 'anak',
    'cekcsm', 'inv', 'gudang', 'cek', 'list', 'lihat', 'show', 'help',
    ...RPG_PANEL_CATEGORIES.flatMap(({ title, aliases }) => [title, ...aliases])
  ])
  const requestedCategory = normalizeRpgPanelCategory(rawArgs.join(' '))
  const autoLevelOptions = ['on', 'off', 'enable', 'disable', '1', '0', 'true', 'false', 'aktif', 'mati']
  const isAutoLevelStatusQuery = aksi === 'autolevelup' && !autoLevelOptions.includes(String(remaining[0] || '').toLowerCase())
  const isPanelReadOnlyAction = panelReadOnlyActions.has(aksi) ||
    !aksi ||
    isAutoLevelStatusQuery ||
    /^(cek|check|lihat|show|list)/.test(aksi || '') ||
    RPG_PANEL_CATEGORIES.some(({ title, aliases }) =>
      aliases.some(alias => normalizeRpgPanelCategory(alias) === requestedCategory) ||
      normalizeRpgPanelCategory(title) === requestedCategory
    )

  let validatedFosterChild = null
  let validatedFosterOwner = null
  let validatedChildMove = null
  if (aksi === 'pindahanak' && !_rpgPanelConfirmedToken) {
    const commandArgs = rawArgs.slice(1)
    const userToken = commandArgs[0] || ''
    const shelterSource = commandArgs[1]?.toLowerCase() === 'shelter'
    const childNumber = Number(commandArgs[shelterSource ? 2 : 1])
    const destination = String(commandArgs[shelterSource ? 3 : 2] || '').toLowerCase()
    const mentions = [...new Set((sourceMessage.mentionedJid || []).map(jid => {
      let normalized = String(jid)
      if (conn?.decodeJid) normalized = conn.decodeJid(normalized)
      if (normalized.endsWith('@lid')) {
        normalized = global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || wdb.lids?.[normalized] || normalized
      }
      return normalized
    }))]
    let userJid = /^@me$/i.test(userToken)
      ? (conn?.decodeJid ? conn.decodeJid(sourceMessage.sender) : sourceMessage.sender)
      : null
    if (!userJid && (userToken.includes('@s.whatsapp.net') || userToken.includes('@lid'))) {
      userJid = conn?.decodeJid ? conn.decodeJid(userToken) : userToken
    }
    if (!userJid && userToken) {
      const digits = userToken.replace(/\D/g, '')
      if (digits.length >= 8 && digits.length <= 16) {
        const matched = Object.entries(wdb.users).find(([jid, account]) =>
          jid.split('@')[0].replace(/\D/g, '') === digits ||
          String(account?.lid || '').split('@')[0].replace(/\D/g, '') === digits
        )
        userJid = matched?.[0] || `${digits}@s.whatsapp.net`
      }
    }
    if (!userJid && mentions.length) userJid = mentions[0]
    if (userJid?.endsWith('@lid')) {
      userJid = global.lids?.[userJid] || global.db?.data?.lids?.[userJid] || wdb.lids?.[userJid] || userJid
    }
    if (userJid) {
      const digits = userJid.split('@')[0].replace(/\D/g, '')
      const matched = Object.entries(wdb.users).find(([jid, account]) =>
        jid.split('@')[0].replace(/\D/g, '') === digits ||
        String(account?.lid || '').split('@')[0].replace(/\D/g, '') === digits
      )
      if (matched) userJid = matched[0]
    }
    const account = userJid && wdb.users[userJid]
    const targetUser = account?.rpg || account
    const sourceList = shelterSource ? targetUser?.shelterKids : targetUser?.kids
    const child = Number.isInteger(childNumber) && childNumber > 0
      ? sourceList?.[childNumber - 1]
      : null
    const validDestination = shelterSource
      ? ['keluarga', 'family', 'anak'].includes(destination)
      : destination === 'shelter'
    if (!userJid || !targetUser || account?.isDummy || !child || !validDestination ||
      child.facility || child.pendingTransferId || child.custody?.type === 'foster') {
      return m.reply(
        `❌ Target, nomor anak, atau tujuan pemindahan tidak valid.\n` +
        `> ↳ Keluarga ke shelter: *${usedPrefix}rpgpanel pindahanak @user <no-anak> shelter*\n` +
        `> ↳ Shelter ke keluarga: *${usedPrefix}rpgpanel pindahanak @user shelter <no-anak> keluarga*\n` +
        `> ↳ Gunakan *@me* untuk akunmu sendiri. Anak di fasilitas, menunggu transfer, atau berstatus asuh tidak bisa dipindahkan.`
      )
    }
    validatedChildMove = {
      userJid,
      shelterSource,
      childIndex: childNumber - 1,
      childSnapshot: JSON.stringify(child)
    }
  }
  if (aksi === 'asuhanak' && !_rpgPanelConfirmedToken) {
    const normalizeTargetJid = jid => {
      let normalized = String(jid || '')
      if (conn?.decodeJid) normalized = conn.decodeJid(normalized)
      if (normalized.endsWith('@lid')) {
        normalized = global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || wdb.lids?.[normalized] || normalized
      }
      if (!normalized.includes('@')) {
        let digits = normalized.replace(/\D/g, '')
        if (digits.startsWith('08')) digits = `628${digits.slice(2)}`
        normalized = `${digits}@s.whatsapp.net`
      }
      const digits = normalized.split('@')[0].replace(/\D/g, '')
      const match = Object.entries(wdb.users).find(([jid, account]) => {
        const jidDigits = jid.split('@')[0].replace(/\D/g, '')
        const lidDigits = String(account?.lid || '').split('@')[0].replace(/\D/g, '')
        return jidDigits === digits || lidDigits === digits
      })
      return match?.[0] || normalized
    }
    const mentions = [...new Set((sourceMessage.mentionedJid || []).map(normalizeTargetJid))]
    const actorJid = normalizeTargetJid(sourceMessage.sender)
    const nonSelfMentions = mentions.filter(jid => jid !== actorJid)
    const commandArgs = rawArgs.slice(1)
    const shelterArgIndex = commandArgs.findIndex(arg => arg.toLowerCase() === 'shelter')
    const shelterSource = shelterArgIndex !== -1
    const ownerToken = commandArgs[0] || ''
    const hasOwnerToken = /^@me$/i.test(ownerToken) ||
      /^@?\d{8,16}$/.test(ownerToken) ||
      ownerToken.includes('@')
    const ownerArgIndex = hasOwnerToken ? 0 : -1
    const childArgIndex = shelterSource
      ? shelterArgIndex + 1
      : ownerArgIndex === 0 ? 1 : 0
    const childNumber = Number(commandArgs[childArgIndex])
    const ownerRequestedSelf = ownerArgIndex === 0 && /^@me$/i.test(ownerToken)
    const guardianToken = commandArgs[childArgIndex + 1]
    const guardianRequestedSelf = /^@me$/i.test(guardianToken || '')
    const quotedJid = sourceMessage.quoted?.sender
      ? normalizeTargetJid(sourceMessage.quoted.sender)
      : null
    const numericOwnerJid = ownerArgIndex === 0 && /^@?\d{8,16}$/.test(ownerToken)
      ? normalizeTargetJid(ownerToken.replace(/^@/, ''))
      : null
    const explicitOwnerJid = ownerArgIndex === 0 &&
      (ownerToken.includes('@s.whatsapp.net') || ownerToken.includes('@lid'))
      ? normalizeTargetJid(ownerToken)
      : null
    const numericGuardianJid = guardianToken && /^@?\d{8,16}$/.test(guardianToken)
      ? normalizeTargetJid(guardianToken.replace(/^@/, ''))
      : null
    const explicitGuardianJid = guardianToken &&
      (guardianToken.includes('@s.whatsapp.net') || guardianToken.includes('@lid'))
      ? normalizeTargetJid(guardianToken)
      : null
    let ownerJid = ownerRequestedSelf
      ? actorJid
      : numericOwnerJid || explicitOwnerJid || (ownerArgIndex === 0 ? nonSelfMentions[0] : null)
    let guardianJid = guardianRequestedSelf
      ? actorJid
      : numericGuardianJid || explicitGuardianJid || nonSelfMentions.find(jid => jid !== ownerJid) || null
    const hasChild = jid => {
      const account = wdb.users[jid]
      const targetUser = account?.rpg || account
      const list = shelterSource ? targetUser?.shelterKids : targetUser?.kids
      return Number.isInteger(childNumber) && childNumber > 0 && Boolean(list?.[childNumber - 1])
    }

    if (!ownerJid && quotedJid && hasChild(quotedJid)) {
      ownerJid = quotedJid
      if (!guardianJid && nonSelfMentions.length) guardianJid = nonSelfMentions[0]
    } else if (!ownerJid && quotedJid) {
      ownerJid = quotedJid
    }
    if (!guardianJid && quotedJid && quotedJid !== ownerJid) guardianJid = quotedJid

    const ownerData = ownerJid && wdb.users[ownerJid]
    const owner = ownerData?.rpg || ownerData
    const childList = shelterSource ? owner?.shelterKids : owner?.kids
    const child = Number.isInteger(childNumber) && childNumber > 0
      ? childList?.[childNumber - 1]
      : null
    const guardianData = guardianJid && wdb.users[guardianJid]
    const guardian = guardianData?.rpg || guardianData
    const invalidReason = !ownerJid
      ? `Tag atau reply ke pemilik anak.`
      : !owner || ownerData?.isDummy
        ? `Pemilik @${ownerJid.split('@')[0]} belum memiliki akun RPG aktif.`
        : !child
          ? `Anak nomor ${Number.isInteger(childNumber) ? childNumber : '?'} tidak ditemukan di ${shelterSource ? 'shelter' : 'keluarga'} @${ownerJid.split('@')[0]}.`
          : child.facility
            ? `Anak *${child.nama}* sedang berada di fasilitas dan tidak bisa dipindahkan ke pengasuhan.`
            : child.pendingTransferId
              ? `Anak *${child.nama}* sedang menunggu proses pengasuhan lain.`
              : child.custody?.type === 'foster'
                ? `Anak *${child.nama}* sudah berada dalam pengasuhan user lain.`
                : !guardianJid
                  ? `Tag pengasuh atau tulis *@me* untuk menjadikan dirimu pengasuh.`
                  : !guardian || guardianData?.isDummy
                    ? `Pengasuh @${guardianJid.split('@')[0]} belum memiliki akun RPG aktif.`
                    : guardianJid === ownerJid
                      ? `Pemilik dan pengasuh harus user yang berbeda.`
                      : null

    if (invalidReason) {
      return m.reply(`❌ ${invalidReason}\n\n> ↳ Contoh: *${usedPrefix}rpgpanel asuhanak @pemilik shelter 1 @me*`)
    }
    validatedFosterChild = {
      ownerJid,
      guardianJid,
      shelterSource,
      childIndex: childNumber - 1,
      childName: child.nama
    }
  }
  if (aksi === 'setanak' && !_rpgPanelConfirmedToken) {
    const commandArgs = rawArgs.slice(1)
    const fieldIndex = commandArgs.findIndex(arg => ['pemilik', 'owner', 'originalowner'].includes(arg.toLowerCase()))
    if (fieldIndex !== -1) {
      const sourceToken = commandArgs[0] || ''
      const ownerToken = commandArgs[fieldIndex + 1] || ''
      const mentionCandidates = [...new Set((sourceMessage.mentionedJid || []).map(jid => {
        let normalized = String(jid)
        if (conn?.decodeJid) normalized = conn.decodeJid(normalized)
        if (normalized.endsWith('@lid')) {
          normalized = global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || wdb.lids?.[normalized] || normalized
        }
        return normalized
      }))]
      const usedMentions = new Set()
      const normalizePanelTarget = (token, role) => {
        let directTarget = /^@me$/i.test(token) ? sourceMessage.sender : ''
        if (!directTarget && (token.includes('@s.whatsapp.net') || token.includes('@lid'))) {
          directTarget = conn?.decodeJid ? conn.decodeJid(token) : token
        } else if (!directTarget) {
          const digits = token.replace(/\D/g, '')
          if (digits.length >= 8 && digits.length <= 16) {
            const matched = Object.entries(wdb.users).find(([jid, account]) =>
              jid.split('@')[0].replace(/\D/g, '') === digits ||
              String(account?.lid || '').split('@')[0].replace(/\D/g, '') === digits
            )
            directTarget = matched?.[0] || `${digits}@s.whatsapp.net`
          }
        }
        if (directTarget.endsWith('@lid')) {
          directTarget = global.lids?.[directTarget] || global.db?.data?.lids?.[directTarget] || wdb.lids?.[directTarget] || directTarget
        }
        if (directTarget) {
          const digits = directTarget.split('@')[0].replace(/\D/g, '')
          const matched = Object.entries(wdb.users).find(([jid, account]) =>
            jid.split('@')[0].replace(/\D/g, '') === digits ||
            String(account?.lid || '').split('@')[0].replace(/\D/g, '') === digits
          )
          return matched?.[0] || directTarget
        }
        const tokenDigits = token.replace(/\D/g, '')
        const exactMention = tokenDigits && mentionCandidates.find(jid =>
          !usedMentions.has(jid) && jid.split('@')[0].replace(/\D/g, '') === tokenDigits
        )
        const fallbackMention = mentionCandidates.find(jid =>
          !usedMentions.has(jid) && jid !== sourceMessage.sender
        )
        const selected = exactMention || fallbackMention || (role === 'source' ? sourceMessage.quoted?.sender : null)
        if (selected) usedMentions.add(selected)
        return selected || null
      }

      const guardianJid = normalizePanelTarget(sourceToken, 'source')
      const ownerJid = normalizePanelTarget(ownerToken, 'owner')
      const childNumber = Number(commandArgs[1])
      const childIndex = childNumber - 1
      const guardianData = guardianJid && wdb.users[guardianJid]
      const guardian = guardianData?.rpg || guardianData
      const child = Number.isInteger(childNumber) && childNumber > 0
        ? guardian?.kids?.[childIndex]
        : null
      const ownerData = ownerJid && wdb.users[ownerJid]
      const owner = ownerData?.rpg || ownerData
      if (
        !ownerJid || !owner || ownerData?.isDummy || !guardianJid || !guardian || guardianData?.isDummy ||
        !child || child.facility || child.pendingTransferId
      ) {
        return m.reply(
          `❌ Pemilik, pengasuh, atau anak tidak valid. Anak harus ada di daftar keluarga pengasuh dan tidak sedang di fasilitas/menunggu transfer.\n` +
          `> ↳ Format: *${usedPrefix}rpgpanel setanak @pengasuh <no-anak> pemilik @pemilik*\n` +
          `> ↳ Gunakan *@me* untuk pengasuh atau pemilik yang menjalankan perintah.`
        )
      }
      validatedFosterOwner = {
        guardianJid,
        ownerJid,
        childIndex,
        childName: child.nama,
        previousCustody: child.custody ? { ...child.custody } : null,
        previousOwnerJid: child.originalOwnerJid || null
      }
    }
  }

  if (!isPanelReadOnlyAction && !_rpgPanelConfirmedToken) {
    const token = randomUUID()
    const requestedCommand = rawArgs.join(' ')
    panelConfirmations[token] = {
      owner: m.sender,
      chat: m.chat,
      text,
      mentionedJid: [...(sourceMessage.mentionedJid || [])],
      quotedSender: sourceMessage.quoted?.sender || null,
      ...(validatedFosterChild
        ? { operation: 'asuhanak', validated: validatedFosterChild }
        : {}),
      ...(validatedFosterOwner
        ? { operation: 'setanak-owner', validated: validatedFosterOwner }
        : {}),
      ...(validatedChildMove
        ? { operation: 'pindahanak', validated: validatedChildMove }
        : {}),
      createdAt: now
    }
    await saveDB(wdb)

    const confirmationText =
      `╭─❏「 ⚠️ KONFIRMASI RPG PANEL 」❏\n` +
      `│ PERIKSA AKSI SEBELUM DATA DIUBAH\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> Perintah: *${requestedCommand.slice(0, 300)}${requestedCommand.length > 300 ? '…' : ''}*\n` +
      `> Konfirmasi ini berlaku selama 5 menit.\n` +
      `> Tidak ada data yang berubah sebelum kamu memilih *Konfirmasi*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    const acceptCommand = `${usedPrefix}${command || 'rpgpanel'} confirm ${token} ya`
    const cancelCommand = `${usedPrefix}${command || 'rpgpanel'} confirm ${token} tidak`
    if (isPrivateRpgPanel) {
      const playerJid = conn.decodeJid
        ? conn.decodeJid(sourceMessage.sender)
        : sourceMessage.sender
      const playerNumber = String(playerJid || '').split('@')[0]
      const rows = [{
        title: '⚠️ Konfirmasi perubahan',
        rows: [
          { title: '✅ Konfirmasi', description: 'Jalankan perubahan RPG Panel', id: acceptCommand },
          { title: '↩️ Batalkan', description: 'Biarkan data tetap seperti semula', id: cancelCommand }
        ]
      }]
      return sendRpgButtons(conn, {
        chat: responseChat,
        message: sourceMessage,
        quoted: sourceMessage,
        title: '⚠️ KONFIRMASI PANEL RPG',
        subtitle: 'Data hanya berubah setelah dikonfirmasi',
        text: confirmationText,
        buttonText: '🔐 PILIH TINDAKAN',
        sections: rows,
        fallbackText: `${confirmationText}\n> ↳ Konfirmasi: ${acceptCommand}\n> ↳ Batalkan: ${cancelCommand}`,
        noThumbnail: true,
        reply: fallbackText => m.reply(fallbackText),
        sendInteractive: async playerMessage => {
          return sendDualGroupMessage(
            conn,
            responseChat,
            playerJid,
            playerMessage,
            `> 🔒 Konfirmasi RPG Panel khusus untuk @${playerNumber}.`,
            { contextInfo: { mentionedJid: [playerJid] } }
          )
        }
      })
    }
    return sendRpgConfirmButtons(conn, m, {
      text: confirmationText,
      title: '⚠️ KONFIRMASI PANEL RPG',
      subtitle: 'Data hanya berubah setelah dikonfirmasi',
      acceptText: '✅ Konfirmasi',
      acceptCommand,
      cancelText: '↩️ Batalkan',
      cancelCommand,
      noThumbnail: true,
      footer: 'AVELIA • OWNER PANEL'
    })
  }

 let panelText = (
  `╭─❏「 👑 RPG PANEL OWNER 」❏\n` +
  `│ 👑 *FITUR ADMIN RPG AVELIA*\n` +
  `╰─━━━━━━━━━━━━━━─\n` +
  `> 🔐 Semua perubahan data meminta konfirmasi sebelum diterapkan.\n\n` +

  `📊 *GLOBAL*\n` +
  `> ↳ *${usedPrefix}rpgpanel rpgstat* - Ringkasan statistik seluruh RPG\n` +
  `> ↳ *${usedPrefix}rpgpanel setlottery <hadiah>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setautolevelup <level>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setgroupnotiflevel <level>*\n` +
  `> ↳ *${usedPrefix}rpgpanel autolevelup on/off*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🏆 *LEADERBOARD*\n` +
  `> ↳ *${usedPrefix}rpgpanel toprpg* - Peringkat level, kekayaan, dan diamond\n` +
  `> ↳ *${usedPrefix}rpgpanel topyt* - Peringkat YouTuber RPG\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `👤 *USER STAT*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del money @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setjob @tag <nama pekerjaan>* - Ganti nama pekerjaan yang tampil saat bekerja\n` +
  `> ↳ *${usedPrefix}rpgpanel firejob @tag [nomor/nama job]* - Pecat user dari pekerjaan\n` +
  `> ↳ *${usedPrefix}rpgpanel applyjob @tag <nomor/nama job>* - Lamar/angkat user ke pekerjaan tertentu\n` +
  `> ↳ *${usedPrefix}rpgpanel setuserlevel @tag <lvl>*\n` +
  `> ↳ *${usedPrefix}rpgpanel difficulty @tag <mode>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setcasinoprogress @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setrhprogress @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setburonan @tag <poin>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setcrime @tag <jenis> <jumlah>* - Atur jumlah tiap jenis kriminal (poin dihitung otomatis)\n` +
  `> ↳ Jenis: *${RPG_CRIME_TYPES.map(({ label }) => label.toLowerCase()).join('|')}*\n` +
  `> ↳ *${usedPrefix}rpgpanel selesairh @tag* - Paksa selesaikan rehabilitasi\n` +
  `> ↳ *${usedPrefix}rpgpanel setcasinoprofit @tag <profit>*\n` +
  `> ↳ *${usedPrefix}rpgpanel cshistoryrefund @tag <nomor-riwayat>* - Kembalikan uang/profit dari ronde rugi di .cs history\n` +
  `> ↳ *${usedPrefix}rpgpanel setbot @tag <level|xp|limit> <nilai>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setbotlevel @tag <lvl>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setbotxp @tag <xp>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del level @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del exp @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del darah @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del diamond @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del gold @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del iron @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del wood @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del stone @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del cont @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set maxhp @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel set sword/armor/pickaxe/fishingrod @tag <lvl>*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🎒 *INVENTORY*\n` +
  `> ↳ *${usedPrefix}rpgpanel inv @tag* - Ringkasan status dan perlengkapan\n` +
  `> ↳ *${usedPrefix}rpgpanel gudang @tag* - Isi penyimpanan pemain\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🧬 *EVONEXUS*\n` +
  `> ↳ *${usedPrefix}rpgpanel evx @tag* - Lihat Stellar Credit dan SC Core terpasang\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del stellarcredit @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setevx @tag <tipe> <nama SC Core>* - Pasang SC Core via panel\n` +
  `> ↳ *${usedPrefix}rpgpanel setevxstat @tag <rank|level|resonance|statpoints|explores> <nilai>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delevx @tag <nama SC Core> ya/tidak* - Konfirmasi pelepasan SC Core\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🛍️ *MALL*\n` +
  `> ↳ *${usedPrefix}rpgpanel mall @tag* - Lihat inventaris Mall\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del mallitem @tag <item> <jml>*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🏠 *HOME*\n` +
  `> ↳ *${usedPrefix}rpgpanel home @tag* - Lihat data rumah\n` +
  `> ↳ *${usedPrefix}rpgpanel sethome @tag <level|harmony|hygiene|aesthetics|visitcount|public> <nilai>*\n` +
  `> ↳ *${usedPrefix}rpgpanel homeadd/homedel @tag <item Mall>* - Kelola furnitur rumah\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `📦 *GUDANG*\n` +
  `> ↳ *${usedPrefix}rpgpanel add @tag <item> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel del @tag <item> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addikan @tag <nama_ikan> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delikan @tag <nama_ikan> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addore @tag <nama_ore> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delore @tag <nama_ore> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addmasak @tag <nama_masakan> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delmasak @tag <nama_masakan> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel wipe @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel cek @tag*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🐄 *TERNAK*\n` +
  `> ↳ *${usedPrefix}rpgpanel addternak @tag <hewan> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delternak @tag <hewan> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel kawinforce @tag <h1> <h2>*\n` +
  `> ↳ *${usedPrefix}rpgpanel icuforce @tag*\n` +
  `> ↳ *${usedPrefix}kawin <h1> <h2> [asuransi]*\n` +
  `> ↳ *${usedPrefix}kawin proses / batal / guide*\n` +
  `> ↳ *${usedPrefix}ternak / ${usedPrefix}kandang*\n` +
  `> ↳ *${usedPrefix}ternak list / beli / ambil / sembelih / jual*\n` +
  `> ↳ *${usedPrefix}hybrid* atau *${usedPrefix}ternak hybrid*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🌾 *PERTANIAN*\n` +
  `> ↳ *${usedPrefix}rpgpanel setstreak @tag <angka>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addstreak @tag <angka>*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetstreak @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel skippanen @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel skipmasak @tag*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🗺️ *ADVENTURE*\n` +
  `> ↳ *${usedPrefix}rpgpanel additem @tag <item> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delitem @tag <item> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setadvlevel @tag <lvl>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addadvlevel @tag <jml>*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🏦 *BANK*\n` +
  `> ↳ *${usedPrefix}rpgpanel setbank @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addbank/delbank @tag <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setbanktier @tag <0-${MAX_BANK_TIER}>*\n` +
  `> ↳ *${usedPrefix}rpgpanel freezebank @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel unfreezebank @tag*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🔨 *AUCTION*\n` +
  `> ↳ *${usedPrefix}rpgpanel giveauction @tag <item lelang> <jml>* - Masukkan hadiah ke Auction Vault user\n` +
  `> ↳ *${usedPrefix}rpgpanel endauction* - Selesaikan lelang aktif dan mulai sesi berikutnya\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `💕 *RSHIP*\n` +
  `> ↳ *${usedPrefix}rpgpanel set/add/del jadian @tag/reply <pasangan/all> <tanggal/durasi/poin/tingkat/status/cincin> <nilai>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setcincin @tag/reply <pasangan ke berapa/all> <key/nama cincin>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addharem @tag <nama> <cowok/cewek>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delharem @tag <no>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setharem @tag <no> <name/gender/level/love/exp/nikah/title> <val>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addanak @tag <nama_anak>* / *addanak @tag shelter <nama_anak>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setanak @tag <no-anak> ortu <no/nama-pasangan>* - Atur anak dari pasangan tertentu\n` +
  `> ↳ Contoh: *${usedPrefix}rpgpanel setanak @tag 1 ortu 2*; nomor pasangan lihat lewat *${usedPrefix}rpgpanel anak @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel setanak @tag <no-anak> <nama/gender/umur/carecount/love/biologicalparents> <nilai>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setanak @pengasuh/@me <no-anak> pemilik @pemilik/@me* - Atur pemilik anak; pengasuh tetap target pertama\n` +
  `> ↳ Jika pemilik dan pengasuh sama, status asuh dihapus dan anak menjadi anak sendiri\n` +
  `> ↳ *${usedPrefix}rpgpanel anak @tag* - Lihat anak, shelter, dan nomor pasangan pemilik\n` +
  `> ↳ *${usedPrefix}rpgpanel delanak @tag <no_anak>*\n` +
  `> ↳ *${usedPrefix}rpgpanel pindahanak @user/@me <no> shelter* - Pindahkan anak keluarga ke shelter\n` +
  `> ↳ *${usedPrefix}rpgpanel pindahanak @user/@me shelter <no> keluarga* - Keluarkan anak shelter ke keluarga\n` +
  `> ↳ *${usedPrefix}rpgpanel asuhanak @tag [shelter] <no> @pengasuh* / *kembalianak @pengasuh <no>*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetnamaanak @pengasuh <no>* - Pulihkan nama sebelum rename jika tersimpan\n` +
  `> ↳ Tag pemilik/pengasuh dapat diisi dengan reply jika salah satu mention dikosongkan.\n` +
  `> ↳ Anak shelter: *setanak @tag shelter <no> ortu <no/nama-pasangan>* untuk atur asal pasangan saat masuk keluarga.\n` +
  `> ↳ Field lain anak shelter: *setanak @tag shelter <no> <nama/gender/umur/carecount/love/biologicalparents> <nilai>* / *delanak @tag shelter <no>*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `⛓️ *CSM PANEL*\n` +
  `> ↳ *${usedPrefix}rpgpanel cekcsm @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel setcsm @tag <stat> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel addcsm @tag <stat> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delcsm @tag <stat> <jml>*\n` +
  `> ↳ *${usedPrefix}rpgpanel setcontract @tag <nama>*\n` +
  `> ↳ *${usedPrefix}rpgpanel delcontract @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel giveending @tag <ending>*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetcsm @tag*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `💊 *MODERASI & RESET*\n` +
  `> ↳ *${usedPrefix}rpgpanel blockcasino @tag/reply*\n` +
  `> ↳ *${usedPrefix}rpgpanel unblockcasino @tag/reply*\n` +
  `> ↳ *${usedPrefix}rpgpanel afk @tag <alasan>*\n` +
  `> ↳ *${usedPrefix}rpgpanel heal @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetlevel @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetlevel all* - Reset level dan XP semua akun RPG\n` +
  `> ↳ *${usedPrefix}rpgpanel resetpokemon all* - Reset level koleksi Pokémon semua user\n` +
  `> ↳ *${usedPrefix}rpgpanel resetghost all* - Reset level koleksi Ghost Hunter semua user\n` +
  `> ↳ *${usedPrefix}rpgpanel resetmoney @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel clearmoneykey <key>*\n` +
  `> ↳ Contoh hapus akun salah transfer: *${usedPrefix}rpgpanel clearmoneykey @*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetdiamond @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel resetcd @tag*\n` +
  `> ↳ *${usedPrefix}rpgpanel setpenjaraprogress @tag <routine> <talk>*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🧬 *UPDATE RPG*\n` +
  `> ↳ Karakter/Bloodline: *${usedPrefix}mychar*, *${usedPrefix}bl list/info/ubah*\n` +
  `> ↳ Wardrobe: *${usedPrefix}wardrobe* / *${usedPrefix}lemari*\n` +
  `> ↳ Koleksi: *${usedPrefix}cl* / *${usedPrefix}collection*\n` +
  `> ↳ Limit: *${usedPrefix}limit*, *${usedPrefix}limit buy/price/guide/command*\n` +
  `> ↳ Rincian update: *${usedPrefix}news RPG*\n\n` +

  `─━━━━━━━━━━━━━━─\n\n` +

  `🛠️ *ADMIN*\n` +
  `> ↳ Tambah limit: *${usedPrefix}addlimit @tag <jumlah>*\n` +
  `> ↳ Kurangi limit: *${usedPrefix}dellimit @tag <jumlah>*\n` +
  `> ↳ Reset limit harian: *${usedPrefix}resetlimit*\n` +
  `> ↳ News: *${usedPrefix}news info/all/guide*\n` +
  `> ↳ Kelola news (owner): *${usedPrefix}news add/del <bagian/nomor>*\n\n` +
  `> ↳ *Perintah owner lainnya:*\n`
)

  panelText +=
    `${getPluginCommandLines('owner', usedPrefix)}` +
    `\n\n─━━━━━━━━━━━━━━─\n\n` +
    `📜 *RPG COMMANDS*\n` +
    `${getPluginCommandLines('rpg', usedPrefix)}\n\n` +
    `─━━━━━━━━━━━━━━─`

  const panelCategoryDescriptions = {
    GLOBAL: 'Pantau kondisi dunia RPG dan ringkasan aktivitas.',
    'USER STAT': 'Tinjau profil, status, dan perkembangan pemain.',
    LEADERBOARD: 'Temukan pemain teratas dan pencapaian terbesar.',
    INVENTORY: 'Kelola isi tas dan kepemilikan item pemain.',
    GUDANG: 'Atur stok, material, dan ruang penyimpanan.',
    TERNAK: 'Tinjau kandang dan koleksi hewan pemain.',
    PERTANIAN: 'Pantau kebun, panen, dan hasil pertanian.',
    ADVENTURE: 'Kelola perjalanan, dungeon, dan eksplorasi.',
    BANK: 'Atur saldo, kartu, dan transaksi perbankan.',
    EVONEXUS: 'Tinjau sistem SC Core dan progres antarbintang.',
    MALL: 'Kelola barang, kategori, dan penawaran toko.',
    HOME: 'Atur rumah, penghuni, dekorasi, dan kunjungan.',
    AUCTION: 'Pantau lelang, bid, dan hadiah pemain.',
    RSHIP: 'Kelola pasangan, keluarga, serta aktivitas sosial.',
    'CSM PANEL': 'Atur data dan progres dunia Chainsawman.',
    'MODERASI & RESET': 'Tinjau tindakan moderasi dan pengelolaan data.',
    'UPDATE RPG': 'Lihat pembaruan dan fitur terbaru RPG.',
    ADMIN: 'Kelola akses, limit, dan pengumuman bot.',
    'RPG COMMANDS': 'Jelajahi daftar fitur RPG yang tersedia.'
  }
  const panelCategoryRows = RPG_PANEL_CATEGORIES.map(({ title, aliases }) => ({
    title: title.length > 24 ? title.slice(0, 24) : title,
    description: panelCategoryDescriptions[title],
    id: `${usedPrefix}${command || 'rpgpanel'} ${aliases[0]}`
  }))
  const panelCategorySections = Array.from(
    { length: Math.ceil(panelCategoryRows.length / 10) },
    (_, index) => ({
      title: `Kategori RPG ${index + 1}`,
      rows: panelCategoryRows.slice(index * 10, (index + 1) * 10)
    })
  )
  const panelCategoryFallback =
    `╭─❏「 👑 KATEGORI RPG PANEL 」❏\n` +
    `│ Gunakan *${usedPrefix}rp <kategori>* atau *${usedPrefix}rp all*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    RPG_PANEL_CATEGORIES.map(({ title, aliases }) =>
      `> ↳ *${title}* — ${usedPrefix}rp ${aliases[0]}`
    ).join('\n') +
    `\n\n> ↳ Semua kategori: ${usedPrefix}rp all`

  const sendPanelCategoryMenu = async () => {
    let result
    try {
      result = await sendRpgButtons(conn, {
        chat: responseChat,
        message: sourceMessage,
        quoted: sourceMessage,
        title: '👑 KATEGORI RPG PANEL',
        subtitle: 'Pilih kategori panel owner',
        text: 'Setiap fitur panel sudah dirapikan ke dalam kategori.',
        buttonText: '👑 JELAJAHI KATEGORI',
        sections: panelCategorySections,
        fallbackText: panelCategoryFallback,
        reply: text => m.reply(text),
        ...(isPrivateRpgPanel ? {
          sendInteractive: playerMessage => {
            const playerJid = conn.decodeJid
              ? conn.decodeJid(sourceMessage.sender)
              : sourceMessage.sender
            const playerNumber = String(playerJid || '').split('@')[0]
            return sendDualGroupMessage(
              conn,
              responseChat,
              playerJid,
              playerMessage,
              `> 🔒 Balasan RPG khusus untuk @${playerNumber}.`,
              { contextInfo: { mentionedJid: [playerJid] } }
            )
          }
        } : {})
      })
    } catch (error) {
      console.error('[RPG-PANEL] Gagal mengirim menu kategori:', error?.message || error)
      return m.reply('⚠️ Menu RPG Panel gagal dikirim. Coba lagi sebentar.')
    }
    return result
  }

  if (['command', 'commands', 'cmd'].includes(aksi)) {
    return sendPanelCategoryMenu()
  }

  if (!aksi || ['kategori', 'categories'].includes(aksi)) {
    return sendPanelCategoryMenu()
  }

  if (aksi === 'all' && rawArgs.length === 1) return m.reply(panelText)

  const selectedCategory = RPG_PANEL_CATEGORIES.find(({ title, aliases }) =>
    aliases.some(alias => normalizeRpgPanelCategory(alias) === requestedCategory) ||
    normalizeRpgPanelCategory(title) === requestedCategory
  )
  if (selectedCategory) {
    return m.reply(
      `╭─❏「 👑 RPG PANEL • ${selectedCategory.title} 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${getRpgPanelSection(panelText, selectedCategory)}\n\n` +
      `> ↳ Kategori lain: ${usedPrefix}rp`
    )
  }

  if (['afk', 'forceafk', 'setafk'].includes(aksi)) {
    if (!isOwner) return m.reply('❌ Fitur AFK paksa hanya untuk owner.')
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    const reason = remaining.join(' ') || 'Diperintah oleh Owner'
    if (!target) return m.reply('❌ Tag atau reply target yang mau di-AFK-kan.')

    wdb.users[target] = wdb.users[target] || {}
    setAfk(wdb.users[target], reason)
    saveDB(wdb)
    return m.reply(`✅ Status AFK berhasil dipaksa aktif untuk @${target.split('@')[0]} dengan alasan: *${reason}*`, null, { mentions: [target] })
  }

  // ========== GLOBAL MENU DARI RPGB ==========
  if(aksi === 'toprpg'){
    let users = filterLeaderboardUsers(
      filterRpgPanelUsers(Object.keys(wdb.users).filter(id => wdb.users[id]?.rpg)),
      conn
    )
      .filter(isValidRpgUserId)
      .filter(id => isDifficultyRanked(wdb.users[id]?.rpg))
    const formatUser = (id) => {
      return getLeaderboardUserIdentity(id, {
        conn,
        groupMetadata,
        name: conn.getName(id)
      })
    }
    let topLevel = [...users].sort((a,b) => (wdb.users[b].rpg.level || 0) - (wdb.users[a].rpg.level || 0)).slice(0, 10)
    let topMoney = [...users]
      .sort((a,b) => (wdb.money[b] || 0) - (wdb.money[a] || 0))
      .slice(0, 10)
    let topDiamond = [...users].sort((a,b) => (wdb.users[b].rpg.diamond || 0) - (wdb.users[a].rpg.diamond || 0)).slice(0, 10)

    let text = `*───「 AVELIA RPG LEADERBOARD 」───*\n\n`
    text += `🆙 *TOP 10 LEVEL*\n`
    const mentions = []
    const addUserLine = (id, rank, score) => {
      const identity = formatUser(id)
      if (identity.mention) mentions.push(identity.mention)
      text += `${rank}. ${identity.display}\n └─ *${score}*\n`
    }
    topLevel.forEach((id, i) => addUserLine(id, i + 1, `Level ${wdb.users[id].rpg.level}`))
    text += `\n💰 *TOP 10 KEKAYAAN*\n`
    topMoney.forEach((id, i) => addUserLine(id, i + 1, `Rp ${(wdb.money[id] || 0).toLocaleString()}`))
    text += `\n💎 *TOP 10 COLLECTOR*\n`
    topDiamond.forEach((id, i) => addUserLine(id, i + 1, `${wdb.users[id].rpg.diamond || 0} Diamond`))
    return sendPanelResponse({ 
      image: { url: 'https://files.cloudkuimages.guru/images/e0684787315c.jpeg' }, 
      caption: text,
      mentions: [...new Set(mentions)]
    })
  }

  if(aksi === 'rpgstat'){
    let users = Object.entries(wdb.users).filter(([_,d]) => d.rpg)
    let totalUsers = users.length
    let totalMoney = Object.values(wdb.money || {}).reduce((a,b) => a+b, 0)
    let totalDiamond = 0, totalIron = 0, totalGold = 0
    users.forEach(([, data]) => {
      const rpg = data.rpg
      totalDiamond += (rpg.diamond || 0) + (rpg.inventory?.diamond || 0) + (rpg.ores?.diamond || 0)
      totalIron += (rpg.iron || 0) + (rpg.inventory?.iron || 0) + (rpg.ores?.iron || 0)
      totalGold += (rpg.gold || 0) + (rpg.inventory?.gold || 0) + (rpg.ores?.gold || 0)
    })
    const chats = global.db?.data?.chats || {}
    const totalGroups = Object.keys(chats).filter(id => id.endsWith('@g.us')).length
    let cap = `*───「 RPG GLOBAL STATS 」───*\n\n👥 *Groupchat:* ${totalGroups.toLocaleString()}\n👤 *Pemain:* ${totalUsers.toLocaleString()}\n💰 *Uang:* Rp ${totalMoney.toLocaleString()}\n💎 *Diamond:* ${totalDiamond.toLocaleString()}\n⛓️ *Iron:* ${totalIron.toLocaleString()}\n✨ *Gold:* ${totalGold.toLocaleString()}`
    return sendPanelResponse({ 
      image: { url: 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg' }, 
      caption: cap 
    })
  } 
  
  if(aksi === 'topyt'){
    let topYoutuber = filterLeaderboardUsers(
      Object.entries(wdb.users).filter(([_, u]) => u.youtube),
      conn,
      ([jid]) => jid
    ).map(([_, u]) => ({ name: u.youtube.name, subs: u.youtube.subs })).sort((a, b) => b.subs - a.subs)
    if (topYoutuber.length === 0) return m.reply('Belum ada YouTuber')
    let caption = `*───「 TOP YOUTUBER 」───*\n\n`
    topYoutuber.slice(0, 10).forEach((u, i) => { caption += `${i + 1}. ${u.name}\n *Subs*: ${u.subs.toLocaleString()}\n\n` })
    return sendPanelResponse({ 
      image: { url: 'https://c.termai.cc/i174/Uwc' }, 
      caption: caption.trim() 
    })
  }

  // 2. Normalisasi 2-kata aksi (misal: "set money", "add diamond", "del wood")
  const statAliases = [
    'money', 'level', 'exp', 'darah', 'diamond', 'iron', 'gold', 'stone', 'wood', 'cont',
    'maxhp', 'armor', 'sword', 'pickaxe', 'fishingrod', 'limit', 'bank', 'banktier',
    'stellarcredit', 'mallitem',
    'advlevel', 'csm', 'contract', 'harem', 'anak', 'ikan', 'ore', 'masak', 'ternak', 'item', 'jadian'
  ];

  if (['set', 'add', 'del', 'tambah', 'kurang', 'reset'].includes(aksi) && remaining.length > 0) {
    let nextWord = remaining[0].toLowerCase();
    if (statAliases.includes(nextWord)) {
      let prefixAksi = aksi === 'tambah' ? 'add' : (aksi === 'kurang' ? 'del' : aksi);
      aksi = prefixAksi + nextWord;
      remaining = remaining.slice(1);
    }
  }

  if (aksi === 'resetlevel' && ['all', 'semua'].includes(String(remaining[0] || '').toLowerCase())) {
    let resetCount = 0
    for (const account of Object.values(wdb.users)) {
      const rpg = account?.rpg
      if (!rpg || typeof rpg !== 'object') continue
      rpg.level = 1
      rpg.exp = 0
      resetCount++
    }
    await saveDB(wdb)
    return m.reply(
      `🔄 Reset level massal selesai.\n> ↳ Akun RPG direset: *${resetCount}*\n> ↳ Semua level menjadi 1 dan XP menjadi 0.`
    )
  }

  if (['resetpokemon', 'resetpokemonlevel', 'resetghost', 'resetghostlevel'].includes(aksi)) {
    if (!['all', 'semua'].includes(String(remaining[0] || '').toLowerCase())) {
      return m.reply(
        `❌ Pilih cakupan semua user:\n` +
        `> ↳ *${usedPrefix}rpgpanel ${aksi.startsWith('resetpokemon') ? 'resetpokemon' : 'resetghost'} all*`
      )
    }
    const creatureField = aksi.startsWith('resetpokemon') ? 'pokemonCreatures' : 'ghostCreatures'
    const label = creatureField === 'pokemonCreatures' ? 'Pokémon' : 'Ghost Hunter'
    let resetUsers = 0
    let resetCreatures = 0
    for (const account of Object.values(wdb.users)) {
      const creatures = account?.rpg?.[creatureField]
      if (!Array.isArray(creatures) || !creatures.length) continue
      let userWasReset = false
      for (const creature of creatures) {
        if (!creature || typeof creature !== 'object') continue
        creature.level = 1
        creature.xp = 0
        resetCreatures++
        userWasReset = true
      }
      if (userWasReset) resetUsers++
    }
    await saveDB(wdb)
    return m.reply(
      `🔄 Reset level ${label} selesai.\n` +
      `> ↳ User terdampak: *${resetUsers}*\n` +
      `> ↳ Koleksi direset: *${resetCreatures}*\n` +
      `> ↳ Semua level menjadi 1 dan XP latihan menjadi 0.`
    )
  }

  if (aksi === 'clearmoneykey') {
    const rawKey = remaining.join(' ').trim()
    if (!rawKey) return m.reply(`❌ Masukkan key akun yang salah. Contoh: ${usedPrefix}rpgpanel clearmoneykey @`)
    const candidates = new Set([rawKey])
    if (rawKey.startsWith('@')) candidates.add(`${rawKey.slice(1)}@s.whatsapp.net`)
    else if (!rawKey.includes('@')) candidates.add(`${rawKey}@s.whatsapp.net`)
    let removed = 0
    let found = false
    for (const key of candidates) {
      const record = wdb.users[key] || global.db?.data?.users?.[key]
      if (record) {
        found = true
        removed += Number(record.money) || 0
        delete wdb.users[key]
        if (global.db?.data?.users) delete global.db.data.users[key]
      }
    }
    await saveDB(wdb)
    return m.reply(found
      ? `✅ Data akun salah *${rawKey}* dihapus dari RPG dan leaderboard.\n💰 Saldo yang dibersihkan: Rp ${removed.toLocaleString()}`
      : `ℹ️ Key *${rawKey}* tidak ditemukan di database.`)
  }


  if (aksi === 'setlottery' || aksi === 'lotteryset') {
    const prize = Number(remaining[0])
    if (!Number.isSafeInteger(prize) || prize <= 0) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setlottery <jumlah hadiah>*\nContoh: *${usedPrefix}rpgpanel setlottery 500000*`)
    }
    global.db.data.lottery = global.db.data.lottery || {}
    global.db.data.lottery.basePrize = prize
    global.db.data.lottery.jackpot = prize
    await saveDB(global.db)
    return m.reply(`✅ Hadiah dasar lottery diatur menjadi *Rp ${prize.toLocaleString()}*.`)
  }

  if (['endauction', 'finishauction'].includes(aksi)) {
    const { alreadyEnded, results, nextSession } = await finishAuctionNow()
    const resultText = results.length
      ? results.map(entry =>
        `> ${entry.emoji} *${entry.itemName}* — ${entry.winnerName} (Rp ${Number(entry.amount).toLocaleString('id-ID')})`
      ).join('\n')
      : '> Tidak ada bid yang menang pada sesi tersebut.'
    const nextItems = nextSession.itemIds
      .map(id => AUCTION_ITEMS.find(item => item.id === id))
      .filter(Boolean)
      .map(item => `> ${item.emoji} ${item.name}`)
      .join('\n')
    return m.reply(
      `${alreadyEnded ? 'ℹ️ Lelang aktif ternyata sudah selesai.' : '✅ Lelang aktif berhasil diselesaikan.'}\n\n` +
      `🏁 *HASIL LELANG*\n${resultText}\n\n` +
      `🔨 *SESI BERIKUTNYA DIMULAI*\n${nextItems}`
    )
  }

  if (['autolevelup', 'notiflevel', 'setnotiflevel', 'setlevelnotif', 'groupnotiflevel', 'setgroupnotiflevel'].includes(aksi)) {
    const chatData = global.db?.data?.chats?.[m.chat] || (global.db.data.chats[m.chat] = {})
    const action = (remaining[0] || '').toLowerCase()
    if (!['on', 'off', 'enable', 'disable', '1', '0', 'true', 'false', 'aktif', 'mati'].includes(action)) {
      const current = chatData.autolevelup === false ? 'OFF' : 'ON'
      return m.reply(`⚙️ Status auto level-up grup: *${current}*\nContoh: *${usedPrefix}rpgpanel autolevelup off*\n> Ini beda dari *${usedPrefix}rpgpanel setuserlevel @tag <lvl>* (level karakter user).`)
    }
    chatData.autolevelup = ['on', 'enable', '1', 'true', 'aktif'].includes(action)
    saveDB(global.db)
    return m.reply(`✅ Auto level-up grup diubah menjadi *${chatData.autolevelup ? 'ON' : 'OFF'}*.`)
  }

  if (['setautolevelup', 'setnotiflevel', 'setlevelnotif', 'setgroupnotiflevel', 'groupnotiflevel'].includes(aksi)) {
    const level = Number(remaining[0])
    const chatData = global.db?.data?.chats?.[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!Number.isInteger(level) || level < 0) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setautolevelup <level>*\nContoh: *${usedPrefix}rpgpanel setautolevelup 25*\n> Bedakan dengan *${usedPrefix}rpgpanel setuserlevel @tag <lvl>* (level karakter user).`)
    }
    chatData.autolevelupLevel = level
    if (level === 0) chatData.autolevelup = chatData.autolevelup ?? true
    saveDB(global.db)
    return m.reply(`✅ Notifikasi level-up grup akan mulai dari level *${level}*.`)
  }

  if (aksi === 'heal' && remaining.some(arg => arg.toLowerCase() === 'all')) {
    const targets = Object.entries(global.db.data.users || {}).filter(([, account]) => account?.rpg)
    let healed = 0
    for (const [, account] of targets) {
      const user = account.rpg
      user.maxDarahBonus = Number(user.maxDarahBonus) || 0
      if (user.darah == null || Number.isNaN(Number(user.darah))) user.darah = 100
      else user.darah = Number(user.darah)
      user.maxDarah = 100 + ((Number(user.armor) || 0) * 20) + user.maxDarahBonus
      if (user.darah < user.maxDarah) healed++
      user.darah = user.maxDarah
    }
    saveDB(wdb)
    return m.reply(`✅ Heal instan selesai untuk ${targets.length} akun RPG. ${healed} akun dipulihkan.`)
  }

  // 3. Resolusi Target User (Mendukung: @me, Tag, Reply, Nomor HP, JID, LID)
  let who = null;
  let targetArgIndex = -1;
  const selfTargetIndex = remaining.findIndex(arg => /^@me$/i.test(arg))
  const explicitTargetIndex = remaining.findIndex(arg =>
    arg.includes('@s.whatsapp.net') ||
    arg.includes('@lid') ||
    /^@\d{8,16}$/.test(arg) ||
    (!m.quoted && !m.mentionedJid?.length && /^\d{8,16}$/.test(arg))
  )

  if (selfTargetIndex !== -1) {
    who = m.sender
    targetArgIndex = selfTargetIndex
  }
  // Prefer explicit numeric/JID targets over the quoted sender.
  else if (explicitTargetIndex !== -1) {
    const rawTarget = remaining[explicitTargetIndex].trim()
    const cleanTarget = rawTarget.replace(/^@/, '')
    if (cleanTarget.includes('@s.whatsapp.net') || cleanTarget.includes('@lid')) {
      who = cleanTarget
    } else {
      let digits = cleanTarget.replace(/\D/g, '')
      if (digits.startsWith('08')) digits = `628${digits.slice(2)}`
      who = `${digits}@s.whatsapp.net`
    }
    targetArgIndex = explicitTargetIndex
  }
  // A. Cek dari Mention / Tag (@user)
  else if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].startsWith('@') || remaining[i].includes('@s.whatsapp.net') || remaining[i].includes('@lid')) {
        targetArgIndex = i;
        break;
      }
    }
  }
  // B. Cek dari Quoted / Reply pesan user
  else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender;
  }

  if (targetArgIndex !== -1) {
    remaining.splice(targetArgIndex, 1);
  }

  // 4. Konversi dan Standarisasi format JID / LID ke Database User Key
  if (who) {
    try {
      if (conn && typeof conn.decodeJid === 'function') {
        who = conn.decodeJid(who);
      }
    } catch (_) {}

    // Konversi LID (@lid) ke nomor HP (@s.whatsapp.net) asli jika tersedia
    if (who.endsWith('@lid')) {
      const resolvedLid = global.lids?.[who] || 
                          global.db?.data?.lids?.[who] || 
                          (wdb?.lids && wdb.lids[who]);
      if (resolvedLid) {
        who = resolvedLid;
      } else if (global.db?.data?.users) {
        for (const [realJid, uData] of Object.entries(global.db.data.users)) {
          if (uData.lid === who || realJid.split('@')[0] === who.split('@')[0]) {
            who = realJid;
            break;
          }
        }
      }
    }

    if (!who.includes('@')) {
      who = who + '@s.whatsapp.net';
    } else if (!who.endsWith('@s.whatsapp.net') && !who.endsWith('@lid')) {
      who = who.split('@')[0] + '@s.whatsapp.net';
    }

    const targetDigits = who.split('@')[0].replace(/\D/g, '')
    if (targetDigits) {
      if (targetDigits.startsWith('08')) {
        const normalizedDigits = `628${targetDigits.slice(2)}`
        who = `${normalizedDigits}@s.whatsapp.net`
      }
      const matchingUser = Object.entries(wdb.users).find(([jid, account]) => {
        const jidDigits = jid.split('@')[0].replace(/\D/g, '')
        const lidDigits = String(account?.lid || '').split('@')[0].replace(/\D/g, '')
        return jidDigits === targetDigits || jidDigits === who.split('@')[0] ||
          lidDigits === targetDigits || lidDigits === who.split('@')[0]
      })
      if (matchingUser) who = matchingUser[0]
    }

    if (who === '@s.whatsapp.net' || who.startsWith('NaN') || who === 'undefined@s.whatsapp.net') {
      who = null;
    }
  }

  // ========== EDIT USER HARUS ADA TARGET ==========
  if (!who) return m.reply('❌ Tag / reply / masukkan nomor target dulu untuk edit user!')
  if (isPanelReadOnlyAction && !wdb.users[who]) {
    return m.reply(`❌ @${who.split('@')[0]} belum memiliki data RPG.`, null, { mentions: [who] })
  }

  // INISIALISASI WAJIB BIAR GA RESET
  if (!wdb.users[who]) wdb.users[who] = {}
  if (!wdb.users[who].rpg && !isPanelReadOnlyAction) wdb.users[who].rpg = {}
  if (wdb.money[who] === undefined && !isPanelReadOnlyAction) wdb.money[who] = 0

  const account = wdb.users[who]
  let user = account.rpg || {}
  if (isPanelReadOnlyAction) user = { ...user }
  if (isPanelReadOnlyAction) {
    syncUserLimit({ ...account, rpg: user, limitHistory: [...(account.limitHistory || [])] })
  } else {
    syncUserLimit(account)
  }

  if (aksi === 'firejob') {
    const jobInput = remaining.join(' ').trim()
    const job = jobInput
      ? getJobByIdentifier(jobInput, Number(user.level) || 1)
      : JOBS.find(entry => entry.job === user.currentJobName)
    if (!job) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel firejob @tag [nomor/nama job]*\nContoh: *${usedPrefix}rpgpanel firejob @tag 50*`)
    }
    if (job.lv === 1) return m.reply(`❌ Pekerjaan level 1 (*${job.job}*) tidak bisa dipecat.`)
    const appliedJobs = Array.isArray(user.appliedJobs) ? user.appliedJobs : []
    if (!appliedJobs.includes(job.job) && user.currentJobName !== job.job) {
      return m.reply(`❌ @${who.split('@')[0]} tidak sedang bekerja atau melamar di *${job.job}*.`, null, { mentions: [who] })
    }

    user.appliedJobs = appliedJobs.filter(jobName => jobName !== job.job)
    user.firedJobs = user.firedJobs && typeof user.firedJobs === 'object' ? user.firedJobs : {}
    const firedAt = Date.now()
    user.firedJobs[job.job] = firedAt
    user.firedJobName = job.job
    user.firedAt = firedAt
    if (user.currentJobName === job.job) {
      user.currentJobName = null
      user.lastkerja = 0
      user.promotionPoints = 0
      user.jobTitle = getJobTitleByPoints(0, '')
    }
    saveDB(wdb)

    const jobIndex = JOBS.findIndex(entry => entry.job === job.job)
    const nextJobNumber = jobIndex
    let notified = false
    if (jobIndex > 0) {
      const notice = `⚠️ Kamu dipecat dari pekerjaan *${job.job}* oleh admin.\n\n⬇️ Coba lamar pekerjaan sebelumnya dengan menekan tombol berikut.`
      const button = [['⬇️ Lamar Job Sebelumnya', `${usedPrefix}job apply ${nextJobNumber}`]]
      try {
        await sendRpgButtons(conn, {
          chat: who,
          text: notice,
          footer: 'AVELIA • JOB CENTER',
          buttons: button
        })
        notified = true
      } catch (error) {
        console.error('[RPG-PANEL firejob notification failed]:', error?.message || error)
      }
    }

    let firingResult = `✅ @${who.split('@')[0]} dipecat dari pekerjaan *${job.job}*.`
    if (jobIndex > 0) {
      if (notified) {
        firingResult += ` Tombol untuk mencoba *${JOBS[jobIndex - 1].job}* sudah dikirim secara pribadi.`
      } else {
        firingResult += ' Notifikasi pribadi gagal dikirim; periksa koneksi bot.'
      }
    }
    return m.reply(firingResult, null, { mentions: [who] })
  }

  if (aksi === 'applyjob') {
    const jobInput = remaining.join(' ').trim()
    const job = getJobByIdentifier(jobInput, Number(user.level) || 1)
    if (!job) {
      return m.reply(`❌ Pekerjaan tidak ditemukan.\nFormat: *${usedPrefix}rpgpanel applyjob @tag <nomor/nama job>*\nCek daftar pekerjaan dengan *${usedPrefix}job list*.`)
    }
    if (job.lv > (Number(user.level) || 1)) {
      return m.reply(`❌ Level @${who.split('@')[0]} belum cukup untuk *${job.job}* (minimal Lv.${job.lv}; level saat ini Lv.${Number(user.level) || 1}).`, null, { mentions: [who] })
    }
    const appliedJobs = Array.isArray(user.appliedJobs) ? user.appliedJobs : []
    if (!appliedJobs.includes(job.job) && appliedJobs.length >= JOB_MAX_APPLIED) {
      return m.reply(`❌ @${who.split('@')[0]} sudah mencapai batas lamaran (${JOB_MAX_APPLIED} pekerjaan).`, null, { mentions: [who] })
    }

    user.appliedJobs = appliedJobs
    if (!user.appliedJobs.includes(job.job)) user.appliedJobs.push(job.job)
    user.jobProgress = user.jobProgress && typeof user.jobProgress === 'object' ? user.jobProgress : {}
    if (!user.jobProgress[job.job] || typeof user.jobProgress[job.job] !== 'object') {
      user.jobProgress[job.job] = { promotionPoints: 0, works: 0, talks: 0 }
    }
    user.jobProgress[job.job].promotionPoints = Number(user.jobProgress[job.job].promotionPoints) || 0
    user.jobProgress[job.job].works = Number(user.jobProgress[job.job].works) || 0
    user.jobProgress[job.job].talks = Number(user.jobProgress[job.job].talks) || 0
    user.currentJobName = job.job
    user.jobHistory = Array.from(new Set([...(Array.isArray(user.jobHistory) ? user.jobHistory : []), job.job]))
    user.firedJobs = user.firedJobs && typeof user.firedJobs === 'object' ? user.firedJobs : {}
    delete user.firedJobs[job.job]
    user.promotionPoints = user.jobProgress[job.job].promotionPoints
    user.jobTitle = getJobTitleByPoints(user.promotionPoints, job.job)
    saveDB(wdb)
    return m.reply(`✅ @${who.split('@')[0]} berhasil diterima/ditugaskan ke pekerjaan *${job.job}* (urutan ${JOBS.findIndex(entry => entry.job === job.job) + 1}).`, null, { mentions: [who] })
  }

  if (aksi === 'setjob') {
    const newJobName = remaining.join(' ').trim()
    if (!newJobName) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setjob @tag <nama pekerjaan>*`)
    }
    if (newJobName.length > 40) {
      return m.reply('❌ Nama pekerjaan maksimal 40 karakter.')
    }

    user.customJob = newJobName
    saveDB(wdb)
    return m.reply(
      `✅ Nama pekerjaan @${who.split('@')[0]} diubah menjadi *${newJobName}*.`,
      null,
      { mentions: [who] }
    )
  }

  if (aksi === 'evx') {
    return m.reply(`╭─❏「 🌌 EVONEXUS PANEL 」❏\n@${who.split('@')[0]}\n\n${formatPanelEvonexus(user)}`, null, { mentions: [who] })
  }

  if (aksi === 'mall') {
    const inventory = Object.entries(user.mallInventory || {})
      .filter(([, count]) => Number(count) > 0)
      .sort(([idA], [idB]) => idA.localeCompare(idB))
    const items = inventory.length
      ? inventory.map(([id, count]) => {
        const known = PANEL_MALL_ITEMS.find(item => item.id === id)
        return `> ${known?.name || formatNama(id)} ×${Number(count).toLocaleString()}`
      }).join('\n')
      : '> Inventaris Mall kosong.'
    return m.reply(`╭─❏「 🛍️ MALL PANEL 」❏\n@${who.split('@')[0]}\n\n${items}`, null, { mentions: [who] })
  }

  if (aksi === 'home') {
    const home = user.home || {}
    const level = Math.max(0, Math.min(HOME_MAX_UPGRADES, Math.floor(Number(home.level) || 0)))
    return m.reply(
      `╭─❏「 🏠 HOME PANEL 」❏\n@${who.split('@')[0]}\n\n` +
      `> Rumah : ${getHomeLevel(level).name}\n` +
      `> Level : ${level}/${HOME_MAX_UPGRADES}\n` +
      `> Harmony : ${Number(home.harmony) || 0}/100\n` +
      `> Hygiene : ${Number(home.hygiene) || 0}/100\n` +
      `> Aesthetics : ${Number(home.aesthetics) || 0}/100\n` +
      `> Public : ${home.public ? 'Ya' : 'Tidak'}\n` +
      `> Kunjungan : ${Number(home.visitCount) || 0}\n` +
      `> Furniture : ${(home.furniture || []).length}\n` +
      `> Trophies : ${(home.trophies || []).length}\n` +
      `> Staff : ${(home.staff || []).length}`,
      null,
      { mentions: [who] }
    )
  }

  if (aksi === 'anak') {
    const children = Array.isArray(user.kids) ? user.kids : []
    const shelterChildren = Array.isArray(user.shelterKids) ? user.shelterKids : []
    const partners = Array.isArray(user.harem) ? user.harem : []
    if (!children.length && !shelterChildren.length) {
      return m.reply(`👶 @${who.split('@')[0]} belum memiliki anak atau anak di shelter.`, null, { mentions: [who] })
    }
    const entries = children.map((child, index) => {
      const custody = child.custody?.type ? ` • Hak asuh: ${child.custody.type}` : ''
      const facility = child.facility?.type ? ` • Fasilitas: ${child.facility.type}` : ''
      const partnerIndex = partners.findIndex(partner => partner.name === child.ortu)
      const parent = partnerIndex >= 0
        ? `Pasangan ${partnerIndex + 1}: ${child.ortu}`
        : child.ortu || 'tidak diketahui'
      const parents = Array.isArray(child.biologicalParents) && child.biologicalParents.length
        ? ` • Ortu kandung: ${child.biologicalParents.join(' & ')}`
        : ''
      return `> ${index + 1}. *${child.nama || 'Tanpa nama'}* (${child.jenis || 'jenis tidak diketahui'}, umur ${Number(child.umur) || 0})\n` +
        `> ↳ Ortu: ${parent}${custody}${facility}${parents}`
    })
    const shelterEntries = shelterChildren.map((child, index) => {
      const parents = Array.isArray(child.biologicalParents) && child.biologicalParents.length
        ? ` • Ortu kandung: ${child.biologicalParents.join(' & ')}`
        : ''
      const reason = child.shelterStatus?.reason === 'runaway' ? 'Kabur' : 'Hilang'
      return `> Shelter ${index + 1}. *${child.nama || 'Tanpa nama'}* (${child.jenis || 'jenis tidak diketahui'}, umur ${Number(child.umur) || 0})\n` +
        `> ↳ Status: ${reason} • Care: ${Number(child.careCount) || 0} • Love: ${Number(child.love) || 0}${parents}`
    })
    return m.reply(
      `╭─❏「 👶 ANAK PANEL 」❏\n@${who.split('@')[0]}\n\n` +
      `👨‍👩‍👧‍👦 *KELUARGA*\n${entries.join('\n') || '> Tidak ada anak di keluarga.'}\n\n` +
      `🛟 *SHELTER*\n${shelterEntries.join('\n') || '> Tidak ada anak di shelter.'}\n\n` +
      `💕 *PASANGAN PEMILIK*\n${partners.map((partner, index) => `> ↳ ${index + 1}. ${partner.name}`).join('\n') || '> Tidak ada pasangan.'}\n\n` +
      `> Atur anak shelter: *setanak @tag shelter <no> <nama|gender|umur|carecount|love|ortu|biologicalparents> <nilai>*\n` +
      `> Hapus anak shelter: *delanak @tag shelter <no>*.`,
      null,
      { mentions: [who] }
    )
  }

  if (aksi === 'setevx') {
    const type = normalizeEvonexusValue(remaining[0])
    const ability = EVONEXUS_ABILITIES.find(item =>
      item.type === type &&
      (normalizeEvonexusValue(item.id) === normalizeEvonexusValue(remaining.slice(1).join(' ')) ||
        normalizeEvonexusValue(item.name) === normalizeEvonexusValue(remaining.slice(1).join(' ')))
    )
    if (!ability) return m.reply(`❌ SC Core tidak ditemukan. Format: *${usedPrefix}rpgpanel setevx @tag <tipe> <nama SC Core>*`)
    user.evonexus ||= {}
    user.evonexus.installed ||= {}
    user.evonexus.destroyedAbilities ||= []
    if (user.evonexus.destroyedAbilities.includes(ability.id)) return m.reply('❌ SC Core ini sudah dihancurkan dan tidak dapat dipasang kembali.')
    if (user.evonexus.installed[type]) return m.reply(`❌ Slot ${type.toUpperCase()} sudah terisi.`)
    user.evonexus.installed[type] = ability.id
    await saveDB(wdb)
    return m.reply(`✅ *${ability.name}* dipasang ke tubuh @${who.split('@')[0]} melalui panel Owner.`, null, { mentions: [who] })
  }

  if (aksi === 'delevx') {
    const installed = Object.entries(user.evonexus?.installed || {})
      .map(([type, id]) => EVONEXUS_ABILITIES.find(ability => ability.id === id && ability.type === type))
      .filter(Boolean)
    const key = normalizeEvonexusValue(remaining.join(' '))
    const ability = installed.find(item =>
      normalizeEvonexusValue(item.id) === key ||
      normalizeEvonexusValue(item.name) === key
    )
    if (!ability) return m.reply(`❌ SC Core tidak terpasang. Lihat dengan *${usedPrefix}rpgpanel evx @tag*.`)
    user.evonexus ||= {}
    delete user.evonexus.installed[ability.type]
    user.evonexus.destroyedAbilities ||= []
    if (!user.evonexus.destroyedAbilities.includes(ability.id)) user.evonexus.destroyedAbilities.push(ability.id)
    delete user.evonexus.pendingPanelUninstall
    await saveDB(wdb)
    return m.reply(`🛠️ *${ability.name}* dilepas dan dihancurkan permanen dari tubuh @${who.split('@')[0]}.`, null, { mentions: [who] })
  }

  if (aksi === 'setevxstat') {
    const field = normalizeEvonexusValue(remaining[0])
    const value = remaining.slice(1).join(' ').trim()
    const fieldMap = {
      level: 'level',
      resonance: 'resonance',
      statpoints: 'statPoints'
    }
    if (field === 'rank') {
      if (!value) return m.reply('❌ Masukkan nama rank Evonexus.')
      user.evonexus ||= {}
      user.evonexus.rank = value
    } else if (field === 'explores') {
      const amount = Number(value)
      if (!Number.isInteger(amount) || amount < 0) return m.reply('❌ Eksplorasi harus berupa bilangan bulat nonnegatif.')
      user.interstellarExplores = amount
    } else if (fieldMap[field]) {
      const amount = Number(value)
      if (!Number.isInteger(amount) || amount < 0) return m.reply('❌ Nilai harus berupa bilangan bulat nonnegatif.')
      user.evonexus ||= {}
      user.evonexus[fieldMap[field]] = amount
    } else {
      return m.reply(`❌ Field harus rank, level, resonance, statpoints, atau explores.`)
    }
    await saveDB(wdb)
    return m.reply(`✅ Data Evonexus *${field}* @${who.split('@')[0]} berhasil diatur.`, null, { mentions: [who] })
  }

  if (aksi === 'sethome') {
    const [fieldInput, value] = remaining
    const normalizedField = normalizeEvonexusValue(fieldInput)
    const field = normalizedField === 'visits' ? 'visitcount' : normalizedField
    if (!['level', 'harmony', 'hygiene', 'aesthetics', 'visitcount', 'public'].includes(field) || value === undefined) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel sethome @tag <level|harmony|hygiene|aesthetics|visitcount|public> <nilai>*`)
    }
    user.home ||= { level: 0, public: false, access: [], blocked: [], visitors: [], visitCount: 0, likes: [], furniture: [], trophies: [], staff: [] }
    if (field === 'public') {
      if (!['on', 'off', 'true', 'false', 'ya', 'tidak'].includes(String(value).toLowerCase())) return m.reply('❌ Nilai public harus on/off.')
      user.home.public = ['on', 'true', 'ya'].includes(String(value).toLowerCase())
    } else if (field === 'visitcount') {
      const amount = Number(value)
      if (!Number.isInteger(amount) || amount < 0) return m.reply('❌ Visit count harus berupa bilangan bulat nonnegatif.')
      user.home.visitCount = amount
    } else {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount < 0) return m.reply('❌ Nilai harus berupa angka positif.')
      if (field === 'level') {
        if (!Number.isInteger(amount) || amount > HOME_MAX_UPGRADES) return m.reply(`❌ Level rumah harus 0-${HOME_MAX_UPGRADES}.`)
        user.home.level = amount
        user.home.security = getHomeLevel(amount).security
      } else {
        user.home[field] = clampHomeStat(amount)
      }
    }
    await saveDB(wdb)
    return m.reply(`✅ Data rumah ${field} @${who.split('@')[0]} berhasil diatur.`, null, { mentions: [who] })
  }

  if (aksi === 'homeadd' || aksi === 'homedel') {
    const selectedItem = findPanelMallItem(remaining.join(' '))
    if (!selectedItem || !['furniture', 'koleksi'].includes(selectedItem.category)) return m.reply('❌ Pilih furniture atau koleksi dari katalog Mall.')
    user.home ||= { level: 0, public: false, access: [], blocked: [], visitors: [], visitCount: 0, likes: [], furniture: [], trophies: [], staff: [] }
    user.home.furniture ||= []
    user.home.trophies ||= []
    user.mallInventory ||= {}
    const installedItems = selectedItem.category === 'koleksi' ? user.home.trophies : user.home.furniture
    if (aksi === 'homeadd') {
      const capacity = selectedItem.category === 'koleksi'
        ? Infinity
        : HOME_BASE_FURNITURE_CAPACITY +
          (Number(user.home.level) || 0) * HOME_UPGRADE_FURNITURE_CAPACITY +
          (isPremiumAccount(account) ? HOME_PREMIUM_FURNITURE_BONUS : 0)
      if (installedItems.length >= capacity) return m.reply(`❌ Kapasitas furniture rumah penuh (${capacity}).`)
      if ((Number(user.mallInventory[selectedItem.id]) || 0) < 1) return m.reply(`❌ @${who.split('@')[0]} tidak memiliki *${selectedItem.name}* di Mall.`, null, { mentions: [who] })
      user.mallInventory[selectedItem.id]--
      if (!user.mallInventory[selectedItem.id]) delete user.mallInventory[selectedItem.id]
      installedItems.push(selectedItem.id)
    } else {
      const index = installedItems.indexOf(selectedItem.id)
      if (index < 0) return m.reply(`❌ *${selectedItem.name}* tidak sedang terpasang di rumah.`)
      installedItems.splice(index, 1)
      user.mallInventory[selectedItem.id] = (Number(user.mallInventory[selectedItem.id]) || 0) + 1
    }
    await saveDB(wdb)
    return m.reply(`✅ *${selectedItem.name}* ${aksi === 'homeadd' ? 'dipasang di' : 'dilepas dari'} rumah @${who.split('@')[0]}.`, null, { mentions: [who] })
  }

  if (aksi === 'difficulty' || aksi === 'setdifficulty') {
    const difficulty = normalizeDifficulty(remaining[0])
    if (!difficulty) {
      return m.reply(`❌ Pilih mode: ${Object.keys(RPG_DIFFICULTIES).join(', ')}.\nContoh: *${usedPrefix}rpgpanel difficulty @tag nightmare*`)
    }
    user.difficulty = difficulty
    recordDifficultyChange(user)
    await saveDB(wdb)
    return m.reply(`✅ Difficulty @${who.split('@')[0]} diatur ke *${RPG_DIFFICULTIES[difficulty].name}*.`, null, { mentions: [who] })
  }

  if (!isPanelReadOnlyAction) account.inventory = account.inventory || {}
  user.inventory = user.inventory || {}
  user.ikan = user.ikan || {}
  user.ores = user.ores || {}
  user.items = user.items || {}
  user.masakan = user.masakan || {}
  user.pets = user.pets || []
  user.ternak = user.ternak || {}
  user.dapur = user.dapur || {slot:1, antrian:[]}
  user.bank = user.bank || 0
  user.bankTier = user.bankTier || 0
  user.riwayat = user.riwayat || []
  user.pinjaman = user.pinjaman || {jumlah:0,waktu:0}
  user.kartuBeku = user.kartuBeku || false
  user.lastkerja = user.lastkerja || 0
  user.maxDarahBonus = user.maxDarahBonus || 0
  user.darah = user.darah || 100
  user.level = user.level || 1
  user.exp = user.exp || 0
  user.gold = user.gold || 0
  user.diamond = user.diamond || 0
  user.iron = user.iron || 0
  user.stone = user.stone || 0
  user.wood = user.wood || 0
  user.limit = user.limit || 0
  user.armor = user.armor || 0
  user.sword = user.sword || 0
  user.pickaxe = user.pickaxe || 0
  user.fishingrod = user.fishingrod || 0

  if (['setcasinoprogress', 'setcasino', 'casinoprogress'].includes(aksi)) {
    const gamesPlayed = Number(remaining[0])
    if (!Number.isInteger(gamesPlayed) || gamesPlayed < 0) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setcasinoprogress @tag <jumlah>*\nContoh: *${usedPrefix}rpgpanel setcasinoprogress @tag 10*`)
    }
    user.casinoStats = user.casinoStats || { wins: 0, games: 0, profit: 0, byGame: {} }
    user.casinoStats.dailyDate = getRpgWibDateKey()
    user.casinoStats.dailyGames = gamesPlayed
    saveDB(wdb)
    return m.reply(`✅ Progress casino @${who.split('@')[0]} berhasil diatur menjadi *${gamesPlayed}x* hari ini.`, null, { mentions: [who] })
  }

  if (['cshistoryrefund', 'refundcshistory', 'refundcasinohistory'].includes(aksi)) {
    const historyNumber = Number(remaining[0])
    const stats = user.casinoStats
    const history = Array.isArray(stats?.dailyHistory) ? stats.dailyHistory : []
    const round = Number.isInteger(historyNumber) && historyNumber > 0
      ? [...history].reverse()[historyNumber - 1]
      : null
    if (!round) {
      return m.reply(`❌ Nomor riwayat tidak valid atau ronde sudah tidak ada. Cek *${usedPrefix}cs history* user tersebut, lalu gunakan: *${usedPrefix}rpgpanel cshistoryrefund @tag <nomor>*`)
    }
    if (round.panelRefundedAt) return m.reply('ℹ️ Ronde ini sudah pernah dikembalikan.')

    let moneyChange = Number(round.moneyChange)
    let blackoutRecord = null
    if (!Number.isFinite(moneyChange)) {
      if (round.outcome === '🌑 Blackout') {
        blackoutRecord = (Array.isArray(user.casinoBlackouts) ? user.casinoBlackouts : [])
          .filter(entry => Math.abs(Number(entry.createdAt) - Number(round.at)) <= 60_000)
          .sort((a, b) => Math.abs(Number(a.createdAt) - Number(round.at)) - Math.abs(Number(b.createdAt) - Number(round.at)))[0]
        const recovered = Number(blackoutRecord?.guardRecovered || 0) +
          Number(blackoutRecord?.insuredRecovered || 0) +
          Number(blackoutRecord?.panelRefunded || 0)
        moneyChange = blackoutRecord
          ? -(Math.max(0, Number(blackoutRecord.amount) - recovered))
          : NaN
      } else {
        moneyChange = Number(round.profit)
      }
    } else if (round.outcome === '🌑 Blackout') {
      blackoutRecord = (Array.isArray(user.casinoBlackouts) ? user.casinoBlackouts : [])
        .find(entry => Math.abs(Number(entry.createdAt) - Number(round.at)) <= 60_000)
    }

    if (round.outcome === '🌑 Blackout' && blackoutRecord) {
      const recovered = Number(blackoutRecord.guardRecovered || 0) +
        Number(blackoutRecord.insuredRecovered || 0) +
        Number(blackoutRecord.panelRefunded || 0)
      moneyChange = -Math.max(0, Math.min(-moneyChange, Number(blackoutRecord.amount) - recovered))
    }

    if (!Number.isFinite(moneyChange) || moneyChange >= 0) {
      return m.reply('❌ Ronde ini tidak memiliki kerugian uang yang dapat dikembalikan.')
    }

    const refundMoney = -moneyChange
    const profitLoss = Math.min(0, Number(round.profit) || 0)
    wdb.money[who] = (Number(wdb.money[who]) || 0) + refundMoney
    stats.profit = (Number(stats.profit) || 0) - profitLoss
    const gameStats = stats.byGame?.[round.game]
    if (gameStats) gameStats.profit = (Number(gameStats.profit) || 0) - profitLoss
    round.panelRefundedAt = Date.now()
    round.moneyChange = moneyChange
    if (blackoutRecord) blackoutRecord.panelRefunded = (Number(blackoutRecord.panelRefunded) || 0) + refundMoney
    await saveDB(wdb)
    return m.reply(
      `✅ Kerugian ronde #${historyNumber} ${round.game} @${who.split('@')[0]} dikembalikan.\n` +
      `> ↳ Uang kembali: Rp ${refundMoney.toLocaleString('id-ID')}\n` +
      `> ↳ Profit casino dipulihkan: Rp ${(-profitLoss).toLocaleString('id-ID')}\n` +
      `> ↳ Saldo sekarang: Rp ${(Number(wdb.money[who]) || 0).toLocaleString('id-ID')}`,
      null,
      { mentions: [who] }
    )
  }

  if (['setcasinoprofit', 'casinoprofit'].includes(aksi)) {
    const profit = Number(remaining[0])
    if (!Number.isFinite(profit) || remaining[0] === undefined) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setcasinoprofit @tag <profit>*\nContoh: *${usedPrefix}rpgpanel setcasinoprofit @tag -5000*`)
    }
    user.casinoStats = user.casinoStats || { wins: 0, games: 0, profit: 0, byGame: {} }
    user.casinoStats.profit = profit
    saveDB(wdb)
    return m.reply(`✅ Profit casino @${who.split('@')[0]} berhasil diatur menjadi *${profit}*.`, null, { mentions: [who] })
  }

  if (['setrhprogress', 'setrehabprogress', 'setrehabilitasiprogress'].includes(aksi)) {
    const progress = Number(remaining[0])
    if (!Number.isInteger(progress) || progress < 0) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setrhprogress @tag <progress>*\nContoh: *${usedPrefix}rpgpanel setrhprogress @tag 10*`)
    }
    if (user.rehabilitation?.status !== 'active') {
      return m.reply(`❌ @${who.split('@')[0]} tidak sedang menjalani rehabilitasi aktif.`, null, { mentions: [who] })
    }
    user.rehabilitation.progress = progress
    await saveDB(wdb)
    return m.reply(
      `✅ Progress rehabilitasi @${who.split('@')[0]} diatur menjadi *${progress}/${Number(user.rehabilitation.requiredProgress) || 0} poin*.`,
      null,
      { mentions: [who] }
    )
  }

  if (['setburonan', 'setwanted', 'setwantedscore'].includes(aksi)) {
    const score = Number(remaining[0])
    if (!Number.isSafeInteger(score) || score < 0) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setburonan @tag <poin>*\nContoh: *${usedPrefix}rpgpanel setburonan @tag 10*`)
    }
    wdb.crime[who] = createRpgCrimeRecord(wdb.crime[who] || {})
    setActiveCrimeScore(wdb.crime[who], score)
    wdb.crime[who].total = computeCrimeScore(wdb.crime[who])
    await saveDB(wdb)
    return m.reply(
      `✅ Poin buronan aktif @${who.split('@')[0]} diatur menjadi *${score} poin*. Total riwayat kriminal: *${computeCrimeScore(wdb.crime[who])} poin*.`,
      null,
      { mentions: [who] }
    )
  }

  if (['setcrime', 'setcriminal', 'setjeniskriminal'].includes(aksi)) {
    const crimeType = remaining[0]
    const count = Number(remaining[1])
    if (remaining.length !== 2 || !Number.isSafeInteger(count) || count < 0) {
      return m.reply(
        `❌ Format: *${usedPrefix}rpgpanel setcrime @tag <jenis> <jumlah>*\n` +
        `Jenis: *${RPG_CRIME_TYPES.map(({ label }) => label.toLowerCase()).join('|')}*\n` +
        `Contoh: *${usedPrefix}rpgpanel setcrime @tag aniaya 2*`
      )
    }
    const selectedCrime = RPG_CRIME_TYPES.find(({ key, label }) =>
      key === crimeType.toLowerCase() || label.toLowerCase() === crimeType.toLowerCase()
    )
    if (!selectedCrime) {
      return m.reply(
        `❌ Jenis kriminal tidak dikenal. Pilih: *${RPG_CRIME_TYPES.map(({ label }) => label.toLowerCase()).join('|')}*`
      )
    }

    const crimeData = createRpgCrimeRecord(wdb.crime[who] || {})
    setCrimeCount(crimeData, selectedCrime.key, count)
    wdb.crime[who] = crimeData
    await saveDB(wdb)
    return m.reply(
      `✅ Kriminal *${selectedCrime.label}* @${who.split('@')[0]} diatur menjadi *${count}x*.\n` +
      `Poin jenis ini: *${count * selectedCrime.score} poin* · ` +
      `Total riwayat: *${computeCrimeScore(wdb.crime[who])} poin* · ` +
      `Poin aktif: *${getActiveCrimeScore(wdb.crime[who])} poin*.`,
      null,
      { mentions: [who] }
    )
  }

  if (['selesairh', 'finishrh', 'finishrehab', 'forcerh'].includes(aksi)) {
    if (user.rehabilitation?.status !== 'active') {
      return m.reply(`❌ @${who.split('@')[0]} tidak sedang menjalani rehabilitasi aktif.`, null, { mentions: [who] })
    }
    wdb.crime[who] = createRpgCrimeRecord(wdb.crime[who] || {})
    if (!forceCompleteRehabilitation(user, wdb.crime[who])) {
      return m.reply(`❌ Rehabilitasi @${who.split('@')[0]} gagal diselesaikan.`, null, { mentions: [who] })
    }
    await saveDB(wdb)
    return m.reply(
      `✅ Rehabilitasi @${who.split('@')[0]} dipaksa selesai melalui panel. Poin buronan aktif sekarang *0 poin*; riwayat kriminal tetap tersimpan (*${computeCrimeScore(wdb.crime[who])} poin*).`,
      null,
      { mentions: [who] }
    )
  }

  if (['setpenjaraprogress', 'setprisonprogress', 'setpenjara'].includes(aksi)) {
    const routine = Number(remaining[0])
    const talk = Number(remaining[1])
    if (!Number.isInteger(routine) || routine < 0 || !Number.isInteger(talk) || talk < 0) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setpenjaraprogress @tag <routine> <talk>*\nContoh: *${usedPrefix}rpgpanel setpenjaraprogress @tag 25 25*`)
    }
    wdb.prisonStats[who] = wdb.prisonStats[who] || { routine: 0, talk: 0 }
    wdb.prisonStats[who].routine = routine
    wdb.prisonStats[who].talk = talk
    saveDB(wdb)
    return m.reply(`✅ *PROGRESS PENJARA DIATUR*\n@${who.split('@')[0]}\n𖥔 Routine: ${routine}x\n𖥔 Talk: ${talk}x`, null, { mentions: [who] })
  }

  // ========== ADMIN EDIT DATA JADIAN ==========
  if (['setjadian', 'addjadian', 'deljadian'].includes(aksi)) {
    const mode = aksi.replace('jadian', '')
    const pasanganList = Array.isArray(account.pasangan) ? account.pasangan : []
    if (!pasanganList.length) return m.reply(`❌ @${who.split('@')[0]} belum memiliki pasangan.`, null, { mentions: [who] })

    const pairSelector = String(remaining[0] || '').toLowerCase()
    const field = String(remaining[1] || '').toLowerCase()
    const value = remaining.slice(2).join(' ').trim()
    const validFields = ['tanggal', 'date', 'durasi', 'duration', 'poin', 'point', 'tingkat', 'level', 'status', 'menikah', 'nikah', 'cincin', 'ring']
    if (!['all', 'semua'].includes(pairSelector) && (!/^\d+$/.test(pairSelector) || Number(pairSelector) < 1)) {
      return m.reply(`❌ Pilih pasangan dengan nomor atau all. Contoh: *${usedPrefix}rpgpanel setjadian @tag 1 poin 100*`)
    }
    if (!validFields.includes(field)) {
      return m.reply(`❌ Field tidak valid. Pilih: tanggal, durasi, poin, tingkat, atau cincin.`)
    }
    if (!value) return m.reply(`❌ Nilai wajib diisi.`)

    const selected = ['all', 'semua'].includes(pairSelector)
      ? pasanganList
      : [pasanganList[Number(pairSelector) - 1]].filter(Boolean)
    if (!selected.length) return m.reply(`❌ Nomor pasangan tidak tersedia. Total pasangan: ${pasanganList.length}`)

    const parseDate = input => {
      if (/^\d{10,13}$/.test(input)) {
        const number = Number(input)
        return input.length === 10 ? number * 1000 : number
      }
      const parsed = Date.parse(input)
      return Number.isFinite(parsed) ? parsed : NaN
    }
    const parseDuration = input => {
      const match = String(input).toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(detik|second|s|menit|minute|m|jam|hour|h|hari|day|d|minggu|week|w)$/)
      if (!match) return NaN
      const units = { detik: 1000, second: 1000, s: 1000, menit: 60000, minute: 60000, m: 60000, jam: 3600000, hour: 3600000, h: 3600000, hari: 86400000, day: 86400000, d: 86400000, minggu: 604800000, week: 604800000, w: 604800000 }
      return Number(match[1]) * units[match[2]]
    }
    const rankThresholds = [0, 50, 75, 100, 150, 200, 350, 500, 750, 1000]

    for (const pasangan of selected) {
      pasangan.nikahTime = Number(pasangan.nikahTime) || Date.now()
      pasangan.poinBucin = Number(pasangan.poinBucin) || 0
      if (['tanggal', 'date'].includes(field)) {
        const date = parseDate(value)
        if (!Number.isFinite(date)) return m.reply('❌ Format tanggal tidak valid. Gunakan YYYY-MM-DD atau timestamp.')
        pasangan.nikahTime = mode === 'set' ? date : mode === 'add' ? pasangan.nikahTime + date : pasangan.nikahTime - date
      } else if (['durasi', 'duration'].includes(field)) {
        const duration = parseDuration(value)
        if (!Number.isFinite(duration) || duration < 0) return m.reply('❌ Durasi tidak valid. Contoh: 30d, 12h, 45m.')
        pasangan.nikahTime = mode === 'set' ? Date.now() - duration : mode === 'add' ? pasangan.nikahTime - duration : pasangan.nikahTime + duration
      } else if (['poin', 'point'].includes(field)) {
        const points = Number(value)
        if (!Number.isFinite(points) || points < 0 || (mode !== 'set' && !Number.isInteger(points))) return m.reply('❌ Poin harus berupa angka yang valid.')
        pasangan.poinBucin = mode === 'set' ? points : mode === 'add' ? pasangan.poinBucin + points : Math.max(0, pasangan.poinBucin - points)
      } else if (['tingkat', 'level'].includes(field)) {
        const level = Number(value)
        if (!Number.isInteger(level) || level < 1 || level > rankThresholds.length) return m.reply(`❌ Tingkat harus 1-${rankThresholds.length}.`)
        const currentLevel = rankThresholds.filter(threshold => pasangan.poinBucin >= threshold).length
        const nextLevel = mode === 'set' ? level : mode === 'add' ? currentLevel + level : currentLevel - level
        const boundedLevel = Math.max(1, Math.min(rankThresholds.length, nextLevel))
        pasangan.poinBucin = rankThresholds[boundedLevel - 1]
      } else if (['status', 'menikah', 'nikah'].includes(field)) {
        const normalized = String(value).trim().toLowerCase()
        const statusMap = {
          'menikah': true,
          'nikah': true,
          'single': false,
          'jomblo': false,
          'true': true,
          'false': false,
          '1': true,
          '0': false,
          'ya': true,
          'tidak': false
        }
        const nextStatus = Object.prototype.hasOwnProperty.call(statusMap, normalized) ? statusMap[normalized] : null
        if (nextStatus === null) return m.reply('❌ Status hanya bisa berupa menikah/single/true/false/ya/tidak.')
        pasangan.status = nextStatus ? 'menikah' : 'single'
        pasangan.menikah = nextStatus
        if (mode === 'set' && nextStatus) pasangan.nikahTime = pasangan.nikahTime || Date.now()
      } else {
        const ringKey = value.toLowerCase().replace(/\s+/g, '')
        const ring = CINCIN_SHOP[ringKey]?.name || normalizeRingName(value)
        const validRing = Object.values(CINCIN_SHOP).some(item => item.name.toLowerCase() === ring.toLowerCase())
        if (!validRing) return m.reply(`❌ Cincin tidak dikenal. Gunakan nama dari katalog cincin.`)
        if (mode !== 'set') return m.reply('❌ Cincin hanya bisa memakai aksi set.')
        pasangan.cincin = ring
      }

      const partner = wdb.users[pasangan.jid]
      const partnerPair = partner?.pasangan?.find(item => item.jid === who)
      if (partnerPair) {
        partnerPair.nikahTime = pasangan.nikahTime
        partnerPair.poinBucin = pasangan.poinBucin
        partnerPair.cincin = pasangan.cincin
      }
    }

    saveDB(wdb)
    return m.reply(`✅ Data jadian @${who.split('@')[0]} berhasil diubah.\nPasangan: ${pairSelector}\nField: ${field}\nAksi: ${mode}`, null, { mentions: [who] })
  }

  if (aksi === 'setcincin') {
    const pairSelector = String(remaining[0] || '').toLowerCase()
    const ringInput = remaining.slice(1).join(' ').trim().toLowerCase()
    const ringEntry = Object.entries(CINCIN_SHOP).find(([key, item]) =>
      key === ringInput || item.name.toLowerCase() === ringInput
    )
    if (!ringEntry) {
      return m.reply(`❌ Cincin tidak dikenal. Pilih: ${Object.keys(CINCIN_SHOP).join(', ')}`)
    }

    const ringName = ringEntry[1].name
    const pasanganList = Array.isArray(account.pasangan) ? account.pasangan : []
    if (!pasanganList.length) return m.reply(`❌ @${who.split('@')[0]} belum memiliki pasangan.`, null, { mentions: [who] })
    const selectedPairs = ['all', 'semua'].includes(pairSelector)
      ? pasanganList
      : /^\d+$/.test(pairSelector) && Number(pairSelector) > 0
        ? [pasanganList[Number(pairSelector) - 1]].filter(Boolean)
        : []
    if (!selectedPairs.length) {
      return m.reply(`❌ Pasangan tidak valid. Gunakan nomor 1-${pasanganList.length} atau *all*.`)
    }

    for (const pasangan of selectedPairs) {
      pasangan.cincin = ringName
      const partner = wdb.users[pasangan.jid]
      const partnerPair = partner?.pasangan?.find(item => item.jid === who)
      if (partnerPair) partnerPair.cincin = ringName
    }

    saveDB(wdb)
    return m.reply(`✅ Cincin pasangan nomor *${pairSelector}* milik @${who.split('@')[0]} diubah menjadi *${ringName}*.`, null, { mentions: [who] })
  }

  if (aksi === 'skippanen') {
    user.ladang = user.ladang || {}
    let skipped = 0
    for (const ladang of Object.values(user.ladang)) {
      const dataBibit = bibit[ladang?.jenis]
      if (!dataBibit) continue
      ladang.waktuTanam = Date.now() - dataBibit.waktu
      skipped++
    }
    saveDB(wdb)
    return m.reply(`✅ Waktu panen @${who.split('@')[0]} berhasil dilewati.\n🌱 Slot siap dipanen: ${skipped}`, null, { mentions: [who] })
  }

  if (aksi === 'skipmasak') {
    user.dapur = user.dapur || { slot: 1, antrian: [] }
    user.dapur.antrian = user.dapur.antrian || []
    const skipped = user.dapur.antrian.length
    user.dapur.antrian.forEach(item => { item.selesai = Date.now() })
    saveDB(wdb)
    return m.reply(`✅ Waktu masak @${who.split('@')[0]} berhasil dilewati.\n🍳 Masakan siap diambil: ${skipped}`, null, { mentions: [who] })
  }

  if (aksi === 'blockcasino') {
    user.casinoBlocked = true
    saveDB(wdb)
    return m.reply(`🚫 Akses casino @${who.split('@')[0]} berhasil diblokir tanpa batas waktu.`, null, { mentions: [who] })
  }

  if (aksi === 'unblockcasino') {
    if (!user.casinoBlocked) return m.reply(`ℹ️ Akses casino @${who.split('@')[0]} tidak sedang diblokir.`, null, { mentions: [who] })
    user.casinoBlocked = false
    saveDB(wdb)
    return m.reply(`✅ Akses casino @${who.split('@')[0]} berhasil dibuka kembali.`, null, { mentions: [who] })
  }
  user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus

  let args = remaining
  let jumlah = parseInt(remaining.find(a => !isNaN(parseInt(a)))) || 0
  if (['setmoney', 'addmoney', 'delmoney'].includes(aksi)) {
    const moneyText = remaining.at(-1)
    const parsedMoney = moneyText === '0' ? 0 : parseRpgMoneyAmount(moneyText)
    if (parsedMoney === null) return m.reply('❌ Nominal uang tidak valid. Contoh: 1T.')
    jumlah = parsedMoney
  }
  let itemInput = remaining.find(a => isNaN(parseInt(a)))
  let item = normalizeFishKey(itemInput?.toLowerCase().replace(/ /g, '_'))

  if (aksi === 'giveauction') {
    let amountIndex = -1
    for (let index = remaining.length - 1; index >= 0; index--) {
      if (/^\d+$/.test(remaining[index])) {
        amountIndex = index
        break
      }
    }
    const amount = amountIndex < 0 ? 0 : Number(remaining[amountIndex])
    const query = normalizeEvonexusValue(remaining
      .filter((_, index) => index !== amountIndex)
      .join(' '))
    const selectedItem = AUCTION_ITEMS.find(entry =>
      normalizeEvonexusValue(entry.id) === query ||
      normalizeEvonexusValue(entry.name) === query
    )
    if (!selectedItem || !Number.isSafeInteger(amount) || amount < 1) {
      return m.reply(`Contoh: *${usedPrefix}rpgpanel giveauction @tag Stormbreaker 1*`)
    }
    user.auctionVault ||= {}
    user.auctionVault[selectedItem.id] = (Number(user.auctionVault[selectedItem.id]) || 0) + amount
    await global.db.write()
    return m.reply(
      `✅ ${selectedItem.emoji} *${selectedItem.name}* ×${amount} ditambahkan ke Auction Vault @${who.split('@')[0]}.\n` +
      `> User dapat mengambilnya dengan *.ah claim ${selectedItem.id}*.`,
      null,
      { mentions: [who] }
    )
  }

  if (['setmallitem', 'addmallitem', 'delmallitem'].includes(aksi)) {
    const amountIndex = remaining.findIndex(value => /^\d+$/.test(value))
    if (amountIndex < 0) return m.reply(`❌ Format: *${usedPrefix}rpgpanel ${aksi.replace('mallitem', ' mallitem')} @tag <item> <jumlah>*`)
    const amount = Number(remaining[amountIndex])
    const selectedItem = findPanelMallItem(remaining.filter((_, index) => index !== amountIndex).join(' '))
    if (!selectedItem) return m.reply('❌ Item tidak ditemukan di katalog Mall.')
    user.mallInventory ||= {}
    const current = Number(user.mallInventory[selectedItem.id]) || 0
    const next = aksi === 'setmallitem'
      ? amount
      : aksi === 'addmallitem'
        ? current + amount
        : Math.max(0, current - amount)
    if (next > 0) user.mallInventory[selectedItem.id] = next
    else delete user.mallInventory[selectedItem.id]
    await saveDB(wdb)
    return m.reply(`✅ Inventaris Mall @${who.split('@')[0]} — *${selectedItem.name}*: ${next.toLocaleString()}.`, null, { mentions: [who] })
  }

  if (['setcont', 'addcont', 'delcont'].includes(aksi)) {
    if (jumlah < 0 || (aksi !== 'setcont' && jumlah < 1)) return m.reply('❌ Jumlah kontribusi tidak valid')
    const guild = Object.values(wdb.guilds).find(g => g.members?.includes(who))
    if (!guild) return m.reply('❌ Target belum bergabung dengan Guild.')
    guild.contribution = guild.contribution || {}
    const current = Number(guild.contribution[who] || 0)
    guild.contribution[who] = aksi === 'setcont' ? jumlah : aksi === 'addcont' ? current + jumlah : Math.max(0, current - jumlah)
    saveDB(wdb)
    return m.reply(`✅ *${aksi.toUpperCase()} CONTRIBUTION*\n@${who.split('@')[0]} = ${guild.contribution[who].toLocaleString()} Pts`, null, { mentions: [who] })
  }

  if (['setbot', 'addbot', 'delbot'].includes(aksi)) {
    const field = String(remaining[0] || '').toLowerCase()
    const fieldMap = { level: 'level', lvl: 'level', xp: 'exp', exp: 'exp', limit: 'limit' }
    const key = fieldMap[field]
    if (!key || remaining.length < 2) {
      return m.reply(`❌ Format: *${usedPrefix}rpgpanel setbot @tag <level|xp|limit> <nilai>*\nContoh: *${usedPrefix}rpgpanel setbot @tag level 26*`)
    }

    const targetValue = Number(remaining[1])
    if (!Number.isFinite(targetValue) || targetValue < 0) return m.reply('❌ Nilai tidak valid.')

    if (aksi === 'setbot') {
      if (key === 'limit') setUserLimit(account, targetValue)
      else account[key] = targetValue
    } else {
      const currentValue = Number(account[key] ?? user[key] ?? 0)
      const nextValue = aksi === 'addbot' ? currentValue + targetValue : Math.max(0, currentValue - targetValue)
      if (key === 'limit') setUserLimit(account, nextValue)
      else account[key] = nextValue
    }

    saveDB(wdb)
    return m.reply(`✅ *${aksi.toUpperCase()} BOT ${key.toUpperCase()}*\n@${who.split('@')[0]} = ${(account[key] ?? user[key] ?? 0).toLocaleString()}`, null, {mentions: [who]})
  }

  // 1. SET STAT
  if(['setmoney','setstellarcredit','setlevel','setuserlevel','setexp','setdarah','setdiamond','setiron','setgold','setstone','setwood','setmaxhp','setarmor','setsword','setpickaxe','setfishingrod','setbotlevel','setbotxp','setbotlimit'].includes(aksi)){
    if(jumlah < 0) return m.reply('❌ Jumlah tidak boleh minus')

    if(aksi === 'setmoney') wdb.money[who] = jumlah
    else if(aksi === 'setstellarcredit') user.stellarCredit = jumlah
    else if(aksi === 'setmaxhp') user.maxDarahBonus = jumlah
    else if (aksi === 'setuserlevel') {
      user.level = jumlah
    } else if (aksi === 'setbotlevel') {
      account.level = jumlah
    } else if (aksi === 'setexp') {
      user.exp = jumlah
    } else if (aksi === 'setbotxp') {
      account.exp = jumlah
    } else if (aksi === 'setbotlimit') {
      setUserLimit(account, jumlah)
    } else {
      user[aksi.replace('set','')] = jumlah
    }

    if(['setlevel','setuserlevel','setarmor','setmaxhp','setsword','setpickaxe','setfishingrod'].includes(aksi)){
      user.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = user.maxDarah
    }
    saveDB(wdb)
    return m.reply(`✅ *SET ${aksi.toUpperCase().replace('SET','')}*\n@${who.split('@')[0]} = ${jumlah.toLocaleString()}`, null, {mentions: [who]})
  }

  // 2. ADD STAT
  if(['addmoney','addstellarcredit','addlevel','adduserlevel','addexp','adddarah','adddiamond','addiron','addgold','addstone','addwood','addsword','addarmor','addpickaxe','addfishingrod','addbotlevel','addbotxp','addbotlimit'].includes(aksi)){
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    if(aksi === 'addmoney') wdb.money[who] += jumlah
    else if(aksi === 'addstellarcredit') user.stellarCredit = (Number(user.stellarCredit) || 0) + jumlah
    else if(aksi === 'adddarah') user.darah = Math.min(user.maxDarah, user.darah + jumlah)
    else if(['addlevel','adduserlevel','addbotlevel'].includes(aksi)){
      account.level = (Number(account.level) || 0) + jumlah
      user.level += jumlah
      user.exp = 0
      account.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = user.maxDarah
    }
    else if(['addexp','addbotxp'].includes(aksi)){
      account.exp = (Number(account.exp) || 0) + jumlah
      user.exp += jumlah
      while(user.exp >= user.level * 500){
        user.exp -= user.level * 500
        user.level++
        user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
        user.darah = user.maxDarah
      }
    }
    else if(aksi === 'addbotlimit'){
      setUserLimit(account, (Number(account.limit) || 0) + jumlah)
    }
    else user[aksi.replace('add','')] += jumlah

    saveDB(wdb)
    const total = aksi === 'addmoney' ? wdb.money[who]
      : aksi === 'addstellarcredit' ? user.stellarCredit
        : aksi === 'addbotlimit' ? account.limit
          : user[aksi.replace('add','')]
    return m.reply(`✅ *TAMBAH ${aksi.toUpperCase().replace('ADD','')}*\n@${who.split('@')[0]} +${jumlah.toLocaleString()}\nTotal: ${total.toLocaleString()}`, null, {mentions: [who]})
  }

  // 3. DEL STAT
  if(['delmoney','delstellarcredit','dellevel','deluserlevel','delexp','deldarah','deldiamond','deliron','delgold','delstone','delwood','delsword','delarmor','delpickaxe','delfishingrod','delbotlevel','delbotxp','delbotlimit'].includes(aksi)){
    if(jumlah < 1) return m.reply('❌ Jumlah minimal 1')

    if(aksi === 'delmoney') wdb.money[who] = Math.max(0, wdb.money[who] - jumlah)
    else if(aksi === 'delstellarcredit') user.stellarCredit = Math.max(0, (Number(user.stellarCredit) || 0) - jumlah)
    else if(aksi === 'deldarah') user.darah = Math.max(0, user.darah - jumlah)
    else if(['dellevel','deluserlevel','delbotlevel'].includes(aksi)){
      account.level = Math.max(0, (Number(account.level) || 0) - jumlah)
      user.level = Math.max(1, user.level - jumlah)
      user.exp = 0
      account.exp = 0
      user.maxDarah = 100 + (user.armor * 20) + user.maxDarahBonus
      user.darah = Math.min(user.darah, user.maxDarah)
    }
    else if(['delexp','delbotxp'].includes(aksi)){
      account.exp = Math.max(0, (Number(account.exp) || 0) - jumlah)
      user.exp = Math.max(0, user.exp - jumlah)
    }
    else if(aksi === 'delbotlimit'){
      setUserLimit(account, Math.max(0, (Number(account.limit) || 0) - jumlah))
    }
    else {
      let stat = aksi.replace('del','')
      user[stat] = Math.max(0, user[stat] - jumlah)
    }

    saveDB(wdb)
    const total = aksi === 'delmoney' ? wdb.money[who]
      : aksi === 'delstellarcredit' ? user.stellarCredit
        : aksi === 'delbotlimit' ? account.limit
          : user[aksi.replace('del','')]
    return m.reply(`✅ *KURANGI ${aksi.toUpperCase().replace('DEL','')}*\n@${who.split('@')[0]} -${jumlah.toLocaleString()}\nTotal: ${total.toLocaleString()}`, null, {mentions: [who]})
  }

  // 4. GUDANG
  if(['add','del','wipe','cek'].includes(aksi)){
    if(aksi === 'add'){
      if(!itemInput || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel add @user diamond 5*`)
      let kat = 'inventory'
      if(user.ikan[item]!== undefined) kat = 'ikan'
      else if(user.ores[item]!== undefined) kat = 'ores'
      else if(user.items[item]!== undefined) kat = 'items'
      else if(user.masakan[item]!== undefined) kat = 'masakan'

      user[kat][item] = (user[kat][item] || 0) + jumlah
      saveDB(wdb)
      return m.reply(`✅ *TAMBAH ITEM*\n@${who.split('@')[0]}\n${formatNama(item)} +${jumlah}\nTotal: ${user[kat][item]}`, null, {mentions: [who]})
    }
    if(aksi === 'del'){
      if(!itemInput || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel del @user diamond 5*`)
      let kat = 'inventory'
      if(user.ikan[item]!== undefined) kat = 'ikan'
      else if(user.ores[item]!== undefined) kat = 'ores'
      else if(user.items[item]!== undefined) kat = 'items'
      else if(user.masakan[item]!== undefined) kat = 'masakan'
      if(!user[kat][item]) return m.reply(`❌ Tidak punya ${formatNama(item)}`, null, {mentions: [who]})
      user[kat][item] = Math.max(0, user[kat][item] - jumlah)
      if(user[kat][item] <= 0) delete user[kat][item]
      saveDB(wdb)
      return m.reply(`✅ *HAPUS ITEM*\n@${who.split('@')[0]}\n${formatNama(item)} -${jumlah}`, null, {mentions: [who]})
    }
    if(aksi === 'wipe'){ user.inventory = {}; user.ikan = {}; user.ores = {}; user.items = {}; user.masakan = {}; saveDB(wdb); return m.reply(`🧹 *WIPE GUDANG*\n@${who.split('@')[0]}`, null, {mentions: [who]}) }
    if(aksi === 'cek'){ let allItems = {...user.inventory,...user.ikan,...user.ores,...user.items,...user.masakan}; if(Object.keys(allItems).length === 0) return m.reply(`🏚️ Gudang kosong`, null, {mentions: [who]}); let sorted = Object.entries(allItems).sort((a,b) => b[1] - a[1]); let cap = `*───「 📦 GUDANG @${who.split('@')[0]} 」───*\n`; sorted.forEach(([n,j]) => cap += `├ ${formatNama(n)} x${j.toLocaleString()}\n`); return sendPanelResponse({ text: cap, mentions: [who] }) }
  }
  
  // 4.5 IKAN
  if(['addikan','delikan'].includes(aksi)){
    if(!itemInput || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel addikan @user kraken 5*`)
    let ikan = normalizeFishKey(itemInput.toLowerCase().replace(/ /g, '_'))

    if(aksi === 'addikan'){
      user.ikan[ikan] = (user.ikan[ikan] || 0) + jumlah
      saveDB(wdb)
      return m.reply(`✅ *TAMBAH IKAN*\n@${who.split('@')[0]}\n${formatNama(ikan)} +${jumlah}\nTotal: ${user.ikan[ikan]}`, null, {mentions: [who]})
    }
    if(aksi === 'delikan'){
      if(!user.ikan[ikan]) return m.reply(`❌ Tidak punya ${formatNama(ikan)}`, null, {mentions: [who]})
      user.ikan[ikan] = Math.max(0, user.ikan[ikan] - jumlah)
      if(user.ikan[ikan] <= 0) delete user.ikan[ikan]
      saveDB(wdb)
      return m.reply(`✅ *HAPUS IKAN*\n@${who.split('@')[0]}\n${formatNama(ikan)} -${jumlah}`, null, {mentions: [who]})
    }
  }
  
  // 4.6 ORE
  if(aksi === 'addore'){
    let ore = itemInput.toLowerCase().replace(/ /g, '_')
    user.ores[ore] = (user.ores[ore] || 0) + jumlah
    saveDB(wdb)
    return m.reply(`✅ Ditambah ${formatNama(ore)} x${jumlah} ke @${who.split('@')[0]}`, null, {mentions: [who]})
  }
  if(aksi === 'delore'){
    let ore = itemInput.toLowerCase().replace(/ /g, '_')
    user.ores[ore] = Math.max(0, (user.ores[ore] || 0) - jumlah)
    if(user.ores[ore] <= 0) delete user.ores[ore]
    saveDB(wdb)
    return m.reply(`✅ Dikurangi ${formatNama(ore)} x${jumlah} dari @${who.split('@')[0]}`, null, {mentions: [who]})
  }
  
  if(aksi === 'addmasak'){
  let masak = itemInput.toLowerCase().replace(/ /g, '_')
  user.masakan[masak] = (user.masakan[masak] || 0) + jumlah
  saveDB(wdb)
  return m.reply(`✅ Ditambah ${formatNama(masak)} x${jumlah}`, null, {mentions: [who]})
}
if(aksi === 'delmasak'){
  let masak = itemInput.toLowerCase().replace(/ /g, '_')
  user.masakan[masak] = Math.max(0, (user.masakan[masak] || 0) - jumlah)
  if(user.masakan[masak] <= 0) delete user.masakan[masak]
  saveDB(wdb)
  return m.reply(`✅ Dikurangi ${formatNama(masak)} x${jumlah}`, null, {mentions: [who]})
}

// 4.7 TERNAK
  if(['addternak','delternak'].includes(aksi)){
    user.ternak = user.ternak || {}
    let hewan = itemInput.toLowerCase().replace(/ /g, '_') // biar sama kayak di file ternak.js

    if(aksi === 'addternak'){
      if(!hewan || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel addternak @tag sapi 5*`)
      user.ternak[hewan] = (user.ternak[hewan] || 0) + jumlah
      saveDB(wdb)
      return m.reply(`✅ Ditambah ${formatNama(hewan)} x${jumlah} ke kandang @${who.split('@')[0]}`, null, {mentions: [who]})
    }
    if(aksi === 'delternak'){
      if(!user.ternak[hewan]) return m.reply(`❌ @${who.split('@')[0]} tidak punya ${formatNama(hewan)}`, null, {mentions: [who]})
      user.ternak[hewan] = Math.max(0, user.ternak[hewan] - jumlah)
      if(user.ternak[hewan] <= 0) delete user.ternak[hewan]
      saveDB(wdb)
      return m.reply(`✅ Dikurangi ${formatNama(hewan)} x${jumlah} dari kandang @${who.split('@')[0]}`, null, {mentions: [who]})
    }
  }
  
  // 4.8 KAWIN FORCE - LANGSUNG HASIL
  if(aksi === 'kawinforce'){
    user.ternak = user.ternak || {}
    let h1 = getHewanKey(args[0]) || args[0]?.toLowerCase()
    let h2 = getHewanKey(args[1]) || args[1]?.toLowerCase()
    if(!h1 ||!h2) return m.reply(`Contoh: *${usedPrefix}rpgpanel kawinforce @tag sapi ayam*`)

    let d1 = getHewan(h1)
    let d2 = getHewan(h2)
    if(!d1 ||!d2) return m.reply(`❌ Hewan tidak ada di database`)

    let hasil = prosesKawin(h1,h2)
    if(!hasil?.hasil || !hasil.data) return m.reply(`❌ Hasil kawin gagal dibuat`, null, {mentions: [who]})
    let keyHasil = hasil.hasil.toLowerCase()
    user.ternak[keyHasil] = (user.ternak[keyHasil] || 0) + 1
    saveDB(wdb)
    return m.reply(`✅ Langsung lahir: ${hasil.data.emoji} ${hasil.data.nama} [E${hasil.data.evolusi}] ke @${who.split('@')[0]}`, null, {mentions: [who]})
  }

// 4.9 ICU FORCE - SELAMATIN HEWAN SEKARAT
  if(aksi === 'icuforce'){
    if(!global.icuTernak[who]) return m.reply(`❌ @${who.split('@')[0]} tidak ada hewan di ICU`, null, {mentions: [who]})

    let data = global.icuTernak[who]
    let keyHasil = getHewanKey(data.d1.nama) || data.h1.toLowerCase()
    user.ternak[keyHasil] = (user.ternak[keyHasil] || 0) + 1 // balikin 1 induk. Mau 2 juga boleh
    delete global.icuTernak[who]
    saveDB(wdb)
    return m.reply(`✅ Diselamatkan dari ICU: ${data.d1.emoji} ${data.d1.nama} ke @${who.split('@')[0]}`, null, {mentions: [who]})
  }
  
  // 4.9 ADVENTURE ITEM
  if(['additem','delitem'].includes(aksi)){
    user.inventory = user.inventory || {}
    let item = itemInput.toLowerCase().replace(/ /g, '_')

    if(aksi === 'additem'){
      if(!item || jumlah < 1) return m.reply(`Contoh: *${usedPrefix}rpgpanel additem @tag pedang_legendaris 1*`)
      user.inventory[item] = (user.inventory[item] || 0) + jumlah

      // sinkronin ke stat juga biar muncul di.inv
      if(item === 'diamond') user.diamond = (user.diamond || 0) + jumlah
      if(item === 'kayu') user.wood = (user.wood || 0) + jumlah
      if(item === 'iron') user.iron = (user.iron || 0) + jumlah

      saveDB(wdb)
      return m.reply(`✅ Ditambah ${formatNama(item)} x${jumlah} ke tas @${who.split('@')[0]}`, null, {mentions: [who]})
    }
    if(aksi === 'delitem'){
      if(!user.inventory[item]) return m.reply(`❌ @${who.split('@')[0]} tidak punya ${formatNama(item)}`, null, {mentions: [who]})
      user.inventory[item] = Math.max(0, user.inventory[item] - jumlah)
      if(user.inventory[item] <= 0) delete user.inventory[item]

      // sinkronin ke stat juga
      if(item === 'diamond') user.diamond = Math.max(0, (user.diamond || 0) - jumlah)
      if(item === 'kayu') user.wood = Math.max(0, (user.wood || 0) - jumlah)
      if(item === 'iron') user.iron = Math.max(0, (user.iron || 0) - jumlah)

      saveDB(wdb)
      return m.reply(`✅ Dikurangi ${formatNama(item)} x${jumlah} dari tas @${who.split('@')[0]}`, null, {mentions: [who]})
    }
  }

// 4.10 ADVENTURE LEVEL
  if(['setadvlevel','addadvlevel'].includes(aksi)){
    let val = parseInt(args[0])
    if(isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel setadvlevel @tag 100*`)

    if(aksi === 'setadvlevel') user.adventureLevel = val
    if(aksi === 'addadvlevel') user.adventureLevel = (user.adventureLevel || 1) + val

    saveDB(wdb)
    return m.reply(`✅ Adventure Level @${who.split('@')[0]} = ${user.adventureLevel}\nTitle: ${getAdvTitle(user.adventureLevel)}`, null, {mentions: [who]})
  }
  
if(!who) return m.reply('❌ Tag target dulu untuk cek inv')
  // 5. INVENTORY CEK
  if(aksi === 'inv' || aksi === 'gudang'){
    let threshold = user.level * 500
    let cap = `*───「 INVENTORY @${who.split('@')[0]} 」───*\n\n`
    cap += `🆙 *Level:* ${user.level} (${user.exp}/${threshold} XP)\n`
    cap += `❤️ *Darah:* ${user.darah}/${user.maxDarah}\n`
    cap += `💰 *Uang Saku:* Rp ${(Number(wdb.money[who]) || 0).toLocaleString()}\n`
    cap += `🏦 *Saldo Bank:* Rp ${(Number(user.bank) || 0).toLocaleString()}\n\n`
    cap += `*EQUIPMENT*\n🗡️ Sword: Lv.${user.sword}\n🛡️ Armor: Lv.${user.armor}\n⛏️ Pickaxe: Lv.${user.pickaxe}\n🎣 Fishingrod: Lv.${user.fishingrod}\n\n`
    cap += `*STORAGE RPG*\n💎 Diamond: ${Number(user.diamond) || 0}\n⛓️ Iron: ${Number(user.iron) || 0}\n✨ Gold: ${Number(user.gold) || 0}\n🪵 Wood: ${Number(user.wood) || 0}\n🪨 Stone: ${Number(user.stone) || 0}\n\n`

    const gudang = [
      ['HASIL PANEN', user.inventory],
      ['IKAN', user.ikan],
      ['MATERIAL TAMBAHAN', user.ores],
      ['ITEM', user.items],
      ['MASAKAN', user.masakan]
    ]
    for (const [label, storage] of gudang) {
      const entries = Object.entries(storage || {}).filter(([, jumlah]) => Number(jumlah) > 0)
      if (!entries.length) continue
      cap += `*${label}*\n`
      cap += entries.map(([nama, jumlah]) => `• ${formatNama(nama)} x${Number(jumlah).toLocaleString()}`).join('\n') + '\n\n'
    }
    cap += `📦 *Catatan:* Data gudang tersimpan di database RPG.`
    return sendPanelResponse({ text: cap, mentions: [who] })
  }

  // 6. HEAL
  if(aksi === 'heal'){
    let butuhHP = user.maxDarah - user.darah
    if(butuhHP <= 0) return m.reply(`❤️ Darah sudah penuh!`, null, {mentions: [who]})
    user.darah = user.maxDarah
    saveDB(wdb)
    return m.reply(`*───「 HEAL SUCCESS 」───*\n\n@${who.split('@')[0]}\n🏥 HP: ${user.darah}/${user.maxDarah}`, null, {mentions: [who]})
  }

  // 7. RESET
  if(aksi === 'resetlevel'){ user.level = 1; user.exp = 0; saveDB(wdb); return m.reply(`🔄 Reset level @${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'resetmoney'){ wdb.money[who] = 0; saveDB(wdb); return m.reply(`🔄 Reset money @${who.split('@')[0]}`, null, {mentions: [who]}) }
  if(aksi === 'resetdiamond'){ user.diamond = 0; saveDB(wdb); return m.reply(`🔄 Reset diamond @${who.split('@')[0]}`, null, {mentions: [who]}) }

  if(aksi === 'resetcd' || aksi === 'resetcooldown' || aksi === 'clearcd'){
    const resetCooldownFields = (store) => {
      for (const key of Object.keys(store || {})) {
        const normalizedKey = key.toLowerCase()
        if (!normalizedKey.includes('cooldown') && !normalizedKey.startsWith('last')) continue
        store[key] = store[key] && typeof store[key] === 'object' && !Array.isArray(store[key]) ? {} : 0
      }
    }
    resetCooldownFields(user)
    resetCooldownFields(account)

    for (const [key, store] of Object.entries(wdb)) {
      if (!key.toLowerCase().includes('cooldown') || !store || typeof store !== 'object') continue
      delete store[who]
    }

    user.cooldown = {}
    account.cooldown = {}
    user.casinoCooldowns = {}
    account.casinoCooldowns = {}
    user.lastcasino = 0
    account.lastcasino = 0
    user.lastkerja = 0
    account.lastkerja = 0
    user.lastWork = 0
    account.lastWork = 0
    user.lastRest = 0
    account.lastRest = 0
    user.lastGacha = 0
    account.lastGacha = 0
    user.lastVisit = 0
    account.lastVisit = 0
    user.lastLoveHeal = 0
    account.lastLoveHeal = 0

    const previousDayMs = Date.now() - 24 * 60 * 60 * 1000
    const previousDayDate = getJakartaDate(previousDayMs)
    user.lastDaily = previousDayMs
    account.lastDaily = previousDayMs
    user.dailyDate = previousDayDate
    account.dailyDate = previousDayDate
    user.dailySavedAt = previousDayMs
    account.dailySavedAt = previousDayMs
    user.lastAdventure = 0
    account.lastAdventure = 0
    user.lastMining = 0
    account.lastMining = 0
    user.lastDungeon = 0
    account.lastDungeon = 0
    user.lastFishing = 0
    account.lastFishing = 0
    user.lastMancing = 0
    account.lastMancing = 0
    user.pinjaman = user.pinjaman || { jumlah: 0, waktu: 0 }
    account.pinjaman = account.pinjaman || { jumlah: 0, waktu: 0 }
    user.pinjaman.waktu = 0
    account.pinjaman.waktu = 0
    if (wdb.temp?.kawin) delete wdb.temp.kawin[who]
    for (const key of ['fitnah', 'fitnahHukuman']) {
      if (wdb[key]) delete wdb[key][who]
    }
    saveDB(wdb)
    return m.reply(`🔄 Semua cooldown RPG telah direset untuk @${who.split('@')[0]}`, null, {mentions: [who]})
  }

  if(aksi === 'resetstreak'){
    const previousDayMs = Date.now() - 24 * 60 * 60 * 1000
    const previousDayDate = getJakartaDate(previousDayMs)
    user.dailyStreak = 0
    account.dailyStreak = 0
    user.lastDaily = previousDayMs
    account.lastDaily = previousDayMs
    user.dailyDate = previousDayDate
    account.dailyDate = previousDayDate
    user.dailySavedAt = previousDayMs
    account.dailySavedAt = previousDayMs
    delete user.dailyBrokenStreak
    delete account.dailyBrokenStreak
    delete user.dailyRestreakDate
    delete account.dailyRestreakDate
    saveDB(wdb)
    return m.reply(`🔄 Daily streak @${who.split('@')[0]} berhasil direset ke 0.`, null, {mentions: [who]})
  }

  if(['setstreak', 'addstreak'].includes(aksi)){
    let val = parseInt(args[0])
    if(isNaN(val) || val < 0) return m.reply(`Contoh: *${usedPrefix}rpgpanel ${aksi} @tag 15*`)
    let oldStreak = Number(account.dailyStreak) || Number(user.dailyStreak) || 0
    let newStreak = aksi === 'setstreak' ? val : oldStreak + val
    user.dailyStreak = newStreak
    account.dailyStreak = newStreak
    delete user.dailyBrokenStreak
    delete account.dailyBrokenStreak
    delete user.dailyRestreakDate
    delete account.dailyRestreakDate
    saveDB(wdb)
    return m.reply(`✅ Daily streak @${who.split('@')[0]} berhasil diubah dari *${oldStreak}* menjadi *${newStreak}* hari.`, null, {mentions: [who]})
  }
  
    // 8 BANK PANEL
  if(['setbank','addbank','delbank','setbanktier','freezebank','unfreezebank'].includes(aksi)){
    user.bank = user.bank || 0
    user.bankTier = user.bankTier || 0
    user.kartuBeku = user.kartuBeku || false

    if(['setbank', 'addbank', 'delbank'].includes(aksi)){
      const amount = args[0] === '0' ? 0 : parseRpgMoneyAmount(args[0])
      if (!Number.isInteger(amount) || (aksi !== 'setbank' && amount < 1)) {
        return m.reply(`Contoh: *${usedPrefix}rpgpanel ${aksi} @tag ${aksi === 'setbank' ? '100000000' : '1000000'}*`)
      }
      const currentBank = Number(user.bank) || 0
      user.bank = aksi === 'setbank'
        ? Math.max(0, amount)
        : aksi === 'addbank'
          ? currentBank + amount
          : Math.max(0, currentBank - amount)
      saveDB(wdb)
      return m.reply(`✅ Saldo bank @${who.split('@')[0]} ${aksi === 'setbank' ? 'di set' : aksi === 'addbank' ? 'ditambah' : 'dikurangi'} jadi Rp ${user.bank.toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'setbanktier'){
      const tier = Number(args[0])
      if (!Number.isInteger(tier) || !BANK_TIERS[tier]) return m.reply(`Contoh: *${usedPrefix}rpgpanel setbanktier @tag ${MAX_BANK_TIER}*\nList: 0-${MAX_BANK_TIER}`)
      user.bankTier = tier
      saveDB(wdb)
      return m.reply(`✅ Tier bank @${who.split('@')[0]} di set jadi ${BANK_TIERS[tier].color} ${BANK_TIERS[tier].name}`, null, {mentions: [who]})
    }

    if(aksi === 'freezebank'){
      user.kartuBeku = true
      saveDB(wdb)
      return m.reply(`✅ Kartu bank @${who.split('@')[0]} dibekukan`, null, {mentions: [who]})
    }

    if(aksi === 'unfreezebank'){
      user.kartuBeku = false
      user.lastMembership = Date.now() // reset biar ga langsung kena denda lagi
      saveDB(wdb)
      return m.reply(`✅ Kartu bank @${who.split('@')[0]} diaktifkan`, null, {mentions: [who]})
    }
  }

// 9. RSHIP HAREM
  if(['addharem','delharem','setharem','editharem'].includes(aksi)){
    user.harem = user.harem || []
    let no = parseInt(args[0]) - 1 // nomor pasangan
    let nama = args[0]
    let gender = args[1]?.toLowerCase()

    if(aksi === 'addharem'){
      if(!nama ||!gender) return m.reply(`Contoh: *${usedPrefix}rpgpanel addharem @tag Rem cewek*`)
      user.harem.push({ name: nama, gender, love: 50, exp: 0, level: 1, menikah: false, cincin: null })
      saveDB(wdb)
      return m.reply(`✅ Tambah pasangan *${nama}* ke @${who.split('@')[0]}`, null, {mentions: [who]})
    }

    if(aksi === 'delharem'){
      if(isNaN(no) ||!user.harem[no]) return m.reply(`❌ Nomor salah. Cek pake .rship harem`)
      let namaH = user.harem[no].name
      user.harem.splice(no, 1)
      saveDB(wdb)
      return m.reply(`✅ Hapus pasangan *${namaH}* dari @${who.split('@')[0]}`, null, {mentions: [who]})
    }

    if(aksi === 'setharem'){
      let noH = parseInt(args[0]) - 1
      let tipe = args[1]?.toLowerCase()
      let val = args.slice(2).join(' ').trim()
      const pasangan = user.harem[noH]
      if(!Number.isInteger(noH) || !pasangan || !tipe || !val) return m.reply(`Contoh: *${usedPrefix}rpgpanel setharem @tag 1 level 100*`)
      if (tipe === 'name' || tipe === 'nama') {
        pasangan.name = val
      } else if (tipe === 'gender' || tipe === 'jenis') {
        const gender = val.toLowerCase()
        if (!['cowok', 'cewek'].includes(gender)) return m.reply('❌ Gender pasangan harus cowok atau cewek.')
        pasangan.gender = gender
      } else if (tipe === 'nikah' || tipe === 'menikah') {
        const status = val.toLowerCase()
        if (!['true', 'false', '1', '0', 'ya', 'tidak', 'on', 'off'].includes(status)) return m.reply('❌ Status menikah harus ya/tidak.')
        pasangan.menikah = ['true', '1', 'ya', 'on'].includes(status)
      } else if (tipe === 'title' || tipe === 'customtitle') {
        if (val.length > 40) return m.reply('❌ Title pasangan maksimal 40 karakter.')
        if (['hapus', 'reset', 'default'].includes(val.toLowerCase())) delete pasangan.customTitle
        else pasangan.customTitle = val
      } else if (['level', 'love', 'exp'].includes(tipe)) {
        const amount = Number(val)
        if (!Number.isInteger(amount) || amount < 0 || (tipe === 'level' && amount < 1) || (tipe === 'love' && amount > 100)) {
          return m.reply(tipe === 'love'
            ? '❌ Love harus berupa bilangan bulat 0-100.'
            : `❌ ${tipe} harus berupa bilangan bulat nonnegatif${tipe === 'level' ? ' dan minimal 1' : ''}.`)
        }
        pasangan[tipe] = amount
      } else {
        return m.reply('❌ Field pasangan: name, gender, level, love, exp, nikah, atau title. Cincin gunakan setcincin.')
      }
      saveDB(wdb)
      return m.reply(`✅ Set ${tipe} *${pasangan.name}* berhasil.`, null, {mentions: [who]})
    }
  }

// 5.2 RSHIP ANAK
  if(['addanak','delanak','setanak','pindahanak','asuhanak','kembalianak','resetnamaanak'].includes(aksi)){
    if (!Array.isArray(user.kids)) user.kids = []
    if (!Array.isArray(user.shelterKids)) user.shelterKids = []
    if (aksi === 'pindahanak') {
      const shelterSource = remaining[0]?.toLowerCase() === 'shelter'
      const sourceList = shelterSource ? user.shelterKids : user.kids
      const childNumber = Number(shelterSource ? remaining[1] : remaining[0])
      const destination = String(remaining[shelterSource ? 2 : 1] || '').toLowerCase()
      const child = Number.isInteger(childNumber) && childNumber > 0 ? sourceList[childNumber - 1] : null
      const validDestination = shelterSource
        ? ['keluarga', 'family', 'anak'].includes(destination)
        : ['shelter'].includes(destination)
      if (!child || !validDestination || child.facility || child.pendingTransferId || child.custody?.type === 'foster') {
        return m.reply(
          `❌ Format:\n` +
          `> Keluarga ke shelter: *${usedPrefix}rpgpanel pindahanak @tag <no-anak> shelter*\n` +
          `> Shelter ke keluarga: *${usedPrefix}rpgpanel pindahanak @tag shelter <no-anak> keluarga*`
        )
      }
      sourceList.splice(childNumber - 1, 1)
      if (shelterSource) {
        delete child.shelterStatus
        child.lastCaredAt = Date.now()
        child.lastNeglectCheckAt = Date.now()
        user.kids.push(child)
      } else {
        child.shelterStatus = { reason: 'lost', enteredAt: Date.now() }
        user.shelterKids.push(child)
      }
      await saveDB(wdb)
      return m.reply(
        `✅ Anak *${child.nama}* dipindahkan ${shelterSource ? 'dari shelter ke daftar keluarga' : 'dari keluarga ke shelter'} @${who.split('@')[0]}.`,
        null,
        { mentions: [who] }
      )
    }
    if (aksi === 'asuhanak') {
      const shelterSource = remaining[0]?.toLowerCase() === 'shelter'
      const childNumber = Number(remaining[shelterSource ? 1 : 0])
      const mentions = m.mentionedJid || []
      let ownerJid = who
      let owner = user
      const guardianToken = remaining.find(value =>
        value.includes('@s.whatsapp.net') ||
        value.includes('@lid') ||
        /^@\d{8,16}$/.test(value)
      )
      let guardianJid = mentions[1] ||
        (mentions.length && m.quoted?.sender && m.quoted.sender !== who ? m.quoted.sender : null) ||
        (guardianToken ? guardianToken.replace(/^@/, '') : null)
      const normalizeTargetJid = jid => {
        let normalized = conn?.decodeJid ? conn.decodeJid(jid) : jid
        if (normalized?.endsWith('@lid')) {
          normalized = global.lids?.[normalized] || global.db?.data?.lids?.[normalized] || wdb.lids?.[normalized] || normalized
        }
        return normalized
      }
      if (mentions.length === 1 && m.quoted?.sender && m.quoted.sender !== who) {
        const mentionedJid = normalizeTargetJid(mentions[0])
        const quotedJid = normalizeTargetJid(m.quoted.sender)
        const mentionedAccount = wdb.users[mentionedJid]
        const quotedAccount = wdb.users[quotedJid]
        const mentionedOwner = mentionedAccount?.rpg || mentionedAccount
        const quotedOwner = quotedAccount?.rpg || quotedAccount
        const mentionedList = shelterSource ? mentionedOwner?.shelterKids : mentionedOwner?.kids
        const quotedList = shelterSource ? quotedOwner?.shelterKids : quotedOwner?.kids
        const mentionedHasChild = Number.isInteger(childNumber) && childNumber > 0 && Boolean(mentionedList?.[childNumber - 1])
        const quotedHasChild = Number.isInteger(childNumber) && childNumber > 0 && Boolean(quotedList?.[childNumber - 1])
        if (mentionedHasChild === quotedHasChild) {
          return m.reply(
            `❌ Tidak bisa menentukan mana pemilik anak dan mana pengasuh dari mention/reply.\n` +
            `> ↳ Tag pemilik terlebih dahulu lalu tag pengasuh.\n` +
            `> ↳ Format: *${usedPrefix}rpgpanel asuhanak @pemilik ${shelterSource ? 'shelter ' : ''}<no-anak> @pengasuh*`
          )
        }
        if (quotedHasChild) {
          ownerJid = quotedJid
          owner = quotedOwner
          guardianJid = mentionedJid
        } else {
          ownerJid = mentionedJid
          owner = mentionedOwner
          guardianJid = quotedJid
        }
      } else if (!mentions.length && m.quoted?.sender && m.quoted.sender !== who) {
        const explicitJid = normalizeTargetJid(who)
        const quotedJid = normalizeTargetJid(m.quoted.sender)
        const explicitAccount = wdb.users[explicitJid]
        const quotedAccount = wdb.users[quotedJid]
        const explicitOwner = explicitAccount?.rpg || explicitAccount
        const quotedOwner = quotedAccount?.rpg || quotedAccount
        const explicitList = shelterSource ? explicitOwner?.shelterKids : explicitOwner?.kids
        const quotedList = shelterSource ? quotedOwner?.shelterKids : quotedOwner?.kids
        const explicitHasChild = Number.isInteger(childNumber) && childNumber > 0 && Boolean(explicitList?.[childNumber - 1])
        const quotedHasChild = Number.isInteger(childNumber) && childNumber > 0 && Boolean(quotedList?.[childNumber - 1])
        if (explicitHasChild !== quotedHasChild) {
          if (quotedHasChild) {
            ownerJid = quotedJid
            owner = quotedOwner
            guardianJid = explicitJid
          } else {
            ownerJid = explicitJid
            owner = explicitOwner
            guardianJid = quotedJid
          }
        }
      }
      const sourceList = shelterSource
        ? (Array.isArray(owner?.shelterKids) ? owner.shelterKids : [])
        : (Array.isArray(owner?.kids) ? owner.kids : [])
      const child = Number.isInteger(childNumber) && childNumber > 0 ? sourceList[childNumber - 1] : null
      guardianJid = guardianJid ? normalizeTargetJid(guardianJid) : null
      if (!child || !guardianJid || child.facility || child.pendingTransferId || child.custody?.type === 'foster') {
        return m.reply(
          `❌ Format:\n` +
          `> Anak keluarga: *${usedPrefix}rpgpanel asuhanak @pemilik <no-anak> @pengasuh*\n` +
          `> Anak shelter: *${usedPrefix}rpgpanel asuhanak @pemilik shelter <no-anak> @pengasuh*\n` +
          `> Jika salah satu tag dikosongkan, reply pesan pemilik/pengasuh.`
        )
      }
      const guardianData = wdb.users[guardianJid]
      const guardian = guardianData?.rpg || guardianData
      if (!guardian || guardianData?.isDummy || guardianJid === ownerJid) {
        return m.reply('❌ Pengasuh harus user RPG lain yang sudah terdaftar.')
      }
      sourceList.splice(childNumber - 1, 1)
      if (shelterSource) {
        child.originalOwnerLocation = 'shelterKids'
        child.originalShelterStatus = child.shelterStatus
        delete child.shelterStatus
      } else {
        child.originalOwnerLocation = 'kids'
      }
      if (child.custody) child.originalCustody = child.custody
      child.originalOwnerJid = ownerJid
      child.custody = { type: 'foster', guardianJid }
      if (!Array.isArray(guardian.kids)) guardian.kids = []
      guardian.kids.push(child)
      await saveDB(wdb)
      return m.reply(
        `✅ Anak *${child.nama}* sekarang berada dalam pengasuhan @${guardianJid.split('@')[0]}.\n` +
        `> ↳ Asal: ${shelterSource ? 'shelter' : 'keluarga'} @${ownerJid.split('@')[0]}.\n` +
        `> ↳ Pengasuh dapat mengembalikannya lewat Panel: *${usedPrefix}rpgpanel kembalianak @pengasuh <no-anak-asuh>*.`,
        null,
        { mentions: [ownerJid, guardianJid] }
      )
    }
    if (aksi === 'kembalianak') {
      const childNumber = Number(remaining[0])
      const child = Number.isInteger(childNumber) && childNumber > 0 ? user.kids[childNumber - 1] : null
      const ownerJid = child?.originalOwnerJid
      const ownerData = ownerJid && wdb.users[ownerJid]
      const owner = ownerData?.rpg || ownerData
      if (!child || child.custody?.type !== 'foster' || !owner || ownerData?.isDummy) {
        return m.reply(`❌ Format: *${usedPrefix}rpgpanel kembalianak @pengasuh <no-anak-asuh>*\nAnak harus memiliki pemilik asal yang masih terdaftar.`)
      }
      const returningToShelter = child.originalOwnerLocation === 'shelterKids'
      user.kids.splice(childNumber - 1, 1)
      if (child.originalCustody) {
        child.custody = child.originalCustody
        delete child.originalCustody
      } else {
        delete child.custody
      }
      delete child.originalOwnerJid
      delete child.pendingTransferId
      if (returningToShelter) {
        if (!Array.isArray(owner.shelterKids)) owner.shelterKids = []
        child.shelterStatus = child.originalShelterStatus || { reason: 'lost', enteredAt: Date.now() }
        delete child.originalShelterStatus
        owner.shelterKids.push(child)
      } else {
        if (!Array.isArray(owner.kids)) owner.kids = []
        owner.kids.push(child)
      }
      delete child.originalOwnerLocation
      delete child.originalShelterStatus
      await saveDB(wdb)
      return m.reply(
        `✅ Anak *${child.nama}* dikembalikan ke ${returningToShelter ? 'shelter' : 'keluarga'} @${ownerJid.split('@')[0]}.`,
        null,
        { mentions: [who, ownerJid] }
      )
    }
    if (aksi === 'resetnamaanak') {
      const childNumber = Number(remaining[0])
      const child = Number.isInteger(childNumber) && childNumber > 0
        ? user.kids[childNumber - 1]
        : null
      if (!child || child.custody?.type !== 'foster' || !child.originalName) {
        return m.reply(
          `❌ Nama asli yang tersimpan tidak ditemukan untuk anak asuh tersebut.\n` +
          `> ↳ Format: *${usedPrefix}rpgpanel resetnamaanak @pengasuh <no-anak-asuh>*\n` +
          `> ↳ Jika nama diganti sebelum fitur pencatatan tersedia, atur manual: *${usedPrefix}rpgpanel setanak @pengasuh <no> nama <nama-asli>*.`
        )
      }
      const previousName = child.nama
      child.nama = child.originalName
      delete child.originalName
      await saveDB(wdb)
      return m.reply(
        `✅ Nama anak asuh dipulihkan.\n> ↳ Sebelumnya: *${previousName}*\n> ↳ Nama asli: *${child.nama}*`,
        null,
        { mentions: [who] }
      )
    }
    if(aksi === 'addanak'){
      const shelterTarget = args[0]?.toLowerCase() === 'shelter'
      const nama = args.slice(shelterTarget ? 1 : 0).join(' ').trim()
      if(!nama) return m.reply(
        `Contoh:\n` +
        `> *${usedPrefix}rpgpanel addanak @tag Bayi Avelia*\n` +
        `> *${usedPrefix}rpgpanel addanak @tag shelter Anak Shelter*`
      )
      if (nama.length > 60) return m.reply('❌ Nama anak maksimal 60 karakter.')
      const now = Date.now()
      const child = {
        nama,
        jenis: 'Laki-laki',
        umur: 0,
        careCount: 0,
        love: 0,
        ortu: shelterTarget ? 'Shelter' : 'Admin',
        biologicalParents: [],
        activityCooldowns: {},
        lastCaredAt: now,
        lastKidActivityAt: 0,
        lastNeglectCheckAt: now
      }
      if (shelterTarget) {
        if (!Array.isArray(user.shelterKids)) user.shelterKids = []
        child.shelterStatus = { reason: 'lost', enteredAt: now }
        user.shelterKids.push(child)
      } else {
        user.kids.push(child)
      }
      saveDB(wdb)
      return m.reply(
        `✅ Tambah anak *${nama}* ${shelterTarget ? 'ke shelter' : 'ke keluarga'} @${who.split('@')[0]}`,
        null,
        { mentions: [who] }
      )
    }
    const shelterTarget = args[0]?.toLowerCase() === 'shelter'
    const childList = shelterTarget
      ? (Array.isArray(user.shelterKids) ? user.shelterKids : (user.shelterKids = []))
      : user.kids
    const index = Number(shelterTarget ? args[1] : args[0]) - 1
    if(aksi === 'delanak'){
      if (!Number.isInteger(index) || index < 0 || !childList[index]) {
        return m.reply(shelterTarget
          ? `Contoh: *${usedPrefix}rpgpanel delanak @tag shelter 1*`
          : `Contoh: *${usedPrefix}rpgpanel delanak @tag 1*`)
      }
      if (childList[index].pendingTransferId) {
        return m.reply('❌ Anak sedang menunggu persetujuan pengasuhan. Selesaikan atau batalkan tawarannya terlebih dahulu.')
      }
      const namaA = childList[index].nama
      childList.splice(index, 1)
      saveDB(wdb)
      return m.reply(`✅ Hapus anak *${namaA}*${shelterTarget ? ' dari shelter' : ''} milik @${who.split('@')[0]}`, null, {mentions: [who]})
    }
    if (aksi === 'setanak') {
      const argumentOffset = shelterTarget ? 1 : 0
      const child = childList[index]
      const fieldInput = args[argumentOffset + 1]?.toLowerCase()
      const value = args.slice(argumentOffset + 2).join(' ').trim()
      const fieldAliases = {
        name: 'nama',
        gender: 'jenis',
        age: 'umur',
        care: 'carecount',
        love: 'love',
        parent: 'ortu',
        parents: 'biologicalparents',
        biologicalparent: 'biologicalparents'
      }
      const field = fieldAliases[fieldInput] || fieldInput
      const validFields = ['nama', 'jenis', 'umur', 'carecount', 'love', 'ortu', 'biologicalparents']
      if (!Number.isInteger(index) || index < 0 || !child || !validFields.includes(field) || !value) {
        return m.reply(shelterTarget
          ? `❌ Format: *${usedPrefix}rpgpanel setanak @tag shelter <no-anak> <nama|gender|umur|carecount|love|ortu|biologicalparents> <nilai>*`
          : `❌ Format: *${usedPrefix}rpgpanel setanak @tag <no-anak> <nama|gender|umur|carecount|love|ortu|biologicalparents> <nilai>*`)
      }
      if (field === 'nama') {
        if (value.length > 60) return m.reply('❌ Nama maksimal 60 karakter.')
        child.originalName ||= child.nama
        child[field] = value
      } else if (field === 'ortu') {
        const isPartnerNumber = /^\d+$/.test(value)
        const partnerIndex = isPartnerNumber ? Number(value) - 1 : -1
        const partner = isPartnerNumber
          ? user.harem?.[partnerIndex]
          : user.harem?.find(entry => String(entry.name).trim().toLowerCase() === value.toLowerCase())
        if (partner) {
          child.ortu = partner.name
        } else if (isPartnerNumber) {
          return m.reply(`❌ Pasangan nomor ${value} tidak ditemukan. Cek daftar pasangan terlebih dahulu.`)
        } else {
          if (value.length > 60) return m.reply('❌ Nama orang tua maksimal 60 karakter.')
          child.ortu = value
        }
      } else if (field === 'jenis') {
        const gender = value.toLowerCase()
        if (!['laki-laki', 'perempuan', 'cowok', 'cewek'].includes(gender)) return m.reply('❌ Jenis kelamin anak harus laki-laki atau perempuan.')
        child.jenis = ['laki-laki', 'cowok'].includes(gender) ? 'Laki-laki' : 'Perempuan'
      } else if (field === 'umur') {
        const age = Number(value)
        if (!Number.isFinite(age) || age < 0) return m.reply('❌ Umur harus berupa angka nonnegatif.')
        child.umur = age
        child.careCount = Math.round(age * 10)
      } else if (field === 'carecount' || field === 'love') {
        const amount = Number(value)
        const max = field === 'love' ? 100 : Infinity
        if (!Number.isInteger(amount) || amount < 0 || amount > max) {
          return m.reply(field === 'love' ? '❌ Love anak harus berupa bilangan bulat 0-100.' : '❌ Care count harus berupa bilangan bulat nonnegatif.')
        }
        child[field === 'carecount' ? 'careCount' : 'love'] = amount
        if (field === 'carecount') child.umur = amount / 10
      } else {
        const parents = value.toLowerCase() === 'hapus'
          ? []
          : [...new Set(value.split(',').map(parent => parent.trim()).filter(Boolean))].slice(0, 2)
        if (value.toLowerCase() !== 'hapus' && !parents.length) return m.reply('❌ Masukkan nama orang tua kandung dipisahkan koma, atau ketik hapus.')
        child.biologicalParents = parents
      }
      await saveDB(wdb)
      return m.reply(
        `✅ Data anak *${child.nama}* (${field}) berhasil diatur${field === 'ortu' ? ` ke pasangan *${child.ortu}*` : ''}.`,
        null,
        { mentions: [who] }
      )
    }
  }
  
  // 10. CSM PANEL - ATUR SEMUA CHAINSWAMAN
  if(['setcsm','addcsm','delcsm','setcontract','delcontract','resetcsm','giveending'].includes(aksi)){
    user.csm = user.csm || {
      nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Rookie Hunter',
      devilContract: null, contractHistory: [], isTransform: false,
      devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Headquarters',
      weapon: {nama: 'Fist', dur: 999}, inventory: [{nama: 'Fist', dur: 999}],
      lastRest: 0, lastGacha: 0, lastVisit: 0, encounter: null,
      relations: {}, pendingBlood: 0, lastWork: 0, pendingDuel: null,
      contractExpire: 0, contractSide: null, ending: null, lastLoveHeal: null
    }

    if(aksi === 'setcsm'){
      let stat = args[0] // blood, level, story, maxHealth, health, devilsKilled
      let val = parseInt(args[1])
      if(!stat || isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel setcsm @tag blood 999999*`)
      if(!user.csm.hasOwnProperty(stat)) return m.reply(`❌ Stat tidak ada. List: blood, level, exp, story, health, maxHealth, devilsKilled`)

      user.csm[stat] = val
      if(stat === 'maxHealth') user.csm.health = Math.min(user.csm.health, val)
      saveDB(wdb)
      return m.reply(`✅ *SET CSM*\n@${who.split('@')[0]}\n${stat} = ${val.toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'addcsm'){
      let stat = args[0]
      let val = parseInt(args[1])
      if(!stat || isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel addcsm @tag blood 50000*`)
      if(!user.csm.hasOwnProperty(stat)) return m.reply(`❌ Stat tidak ada`)

      user.csm[stat] += val
      saveDB(wdb)
      return m.reply(`✅ *TAMBAH CSM*\n@${who.split('@')[0]}\n${stat} +${val.toLocaleString()}\nTotal: ${user.csm[stat].toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'delcsm'){
      let stat = args[0]
      let val = parseInt(args[1])
      if(!stat || isNaN(val)) return m.reply(`Contoh: *${usedPrefix}rpgpanel delcsm @tag blood 10000*`)
      if(!user.csm.hasOwnProperty(stat)) return m.reply(`❌ Stat tidak ada`)

      user.csm[stat] = Math.max(0, user.csm[stat] - val)
      saveDB(wdb)
      return m.reply(`✅ *KURANGI CSM*\n@${who.split('@')[0]}\n${stat} -${val.toLocaleString()}\nTotal: ${user.csm[stat].toLocaleString()}`, null, {mentions: [who]})
    }

    if(aksi === 'setcontract'){
      let namaKontrak = args.join(' ')
      if(!namaKontrak) return m.reply(`Contoh: *${usedPrefix}rpgpanel setcontract @tag Chainsaw*`)

      user.csm.devilContract = namaKontrak
      user.csm.contractExpire = 0 // 0 = permanen
      user.csm.contractSide = `-15 MaxHP` // efek samping default
      user.csm.maxHealth -= 15
      if(user.csm.health > user.csm.maxHealth) user.csm.health = user.csm.maxHealth
      saveDB(wdb)
      return m.reply(`✅ *KONTRAK DEAL*\n@${who.split('@')[0]}\nKontrak: ${namaKontrak} [Permanen]\nEfek Samping: -15 MaxHP`, null, {mentions: [who]})
    }

    if(aksi === 'delcontract'){
      user.csm.devilContract = null
      user.csm.contractExpire = 0
      user.csm.contractSide = null
      saveDB(wdb)
      return m.reply(`✅ *KONTRAK DIBATALKAN*\n@${who.split('@')[0]} sekarang bebas`, null, {mentions: [who]})
    }

    if(aksi === 'giveending'){
      //.rpgpanel giveending @tag Love
      let end = args[1]
      let listEnding = ['Freedom','Apocalypse','Control','Sacrifice','Love','Revenge','Peace']
      if(!end ||!listEnding.includes(end)) return m.reply(`Contoh: *${usedPrefix}rpgpanel giveending @tag Love*\nList: ${listEnding.join(', ')}`)

      user.csm.ending = end
      user.csm.story = 14 // langsung unlock
      // kasih bonus sesuai ending
      if(end === 'Freedom'){ user.csm.blood += 50000; user.csm.title = 'Chainsaw Man' }
      if(end === 'Apocalypse'){ user.csm.devilsKilled += 100; user.csm.title = 'Horseman of Fear' }
      if(end === 'Control'){ wdb.money[who] += 1000000; user.csm.title = 'Public Safety Dog' }
      if(end === 'Sacrifice'){ user.csm.maxHealth -= 50; user.csm.title = 'Guardian Devil' }
      if(end === 'Love'){ user.csm.blood = 0; user.csm.title = 'Beloved Devil' }
      if(end === 'Revenge'){ user.csm.blood += 100000; user.csm.maxHealth += 50; user.csm.title = 'Vengeance Devil' }
      if(end === 'Peace'){ user.csm.blood = 0; user.csm.devilContract = null; user.csm.title = 'Peaceful Devil' }

      saveDB(wdb)
      return m.reply(`✅ *ENDING DIBERIKAN*\n@${who.split('@')[0]}\nEnding: *${end}*\nTitle: ${user.csm.title}`, null, {mentions: [who]})
    }

    if(aksi === 'resetcsm'){
      //.rpgpanel resetcsm @tag
      user.csm = null
      saveDB(wdb)
      return m.reply(`✅ *RESET CSM*\n@${who.split('@')[0]} data CSM dihapus total`, null, {mentions: [who]})
    }
  } 

  m.reply(`❌ Command tidak ada.\n\n*Global:*\n.toprpg.rpgstat.topyt\n\n*Edit:*\n.setlevel.addlevel.dellevel\n.setmoney.addmoney.delmoney\n.add @user diamond 5`)
  

}



handler.help = ['rpgpanel']
handler.tags = ['owner']
handler.command = /^(rpgpanel|rpgowner|rp)$/i
handler.owner = true
handler.group = true
export default handler