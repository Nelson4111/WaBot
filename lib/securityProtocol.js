import { saveDB } from './waifuHelper.js'

function normalizeJid(jid, conn) {
  if (!jid) return ''
  const decoded = typeof conn?.decodeJid === 'function' ? conn.decodeJid(jid) : jid
  const digits = String(decoded).split('@')[0].split(':')[0].replace(/\D/g, '')
  return digits ? `${digits}@s.whatsapp.net` : String(decoded)
}

export function getSecurityState(chatId) {
  const chats = global.db.data.chats
  const chat = chats[chatId] || (chats[chatId] = {})
  const security = chat.security || (chat.security = {})
  if (!Array.isArray(security.unverified)) security.unverified = []
  if (!Array.isArray(security.blacklist)) security.blacklist = []
  if (typeof security.active !== 'boolean') security.active = false
  return security
}

function addUnique(list, jid) {
  if (!list.includes(jid)) list.push(jid)
}

export async function trackSecurityJoin(chatId, participants, conn) {
  const state = getSecurityState(chatId)
  if (!state.active) return false
  let changed = false
  for (const participant of participants || []) {
    const jid = normalizeJid(participant, conn)
    if (!jid || state.unverified.includes(jid) || state.blacklist.includes(jid)) continue
    addUnique(state.unverified, jid)
    changed = true
  }
  if (changed) await saveDB()
  return changed
}

export async function trackSecurityLeave(chatId, participants, conn) {
  const state = getSecurityState(chatId)
  let changed = false
  for (const participant of participants || []) {
    const jid = normalizeJid(participant, conn)
    const index = state.unverified.indexOf(jid)
    if (index < 0) continue
    state.unverified.splice(index, 1)
    addUnique(state.blacklist, jid)
    changed = true
  }
  if (changed) await saveDB()
  return changed
}

export function isSecurityUnverified(chatId, jid, conn) {
  return getSecurityState(chatId).unverified.includes(normalizeJid(jid, conn))
}

export function isSecurityBlacklisted(chatId, jid, conn) {
  return getSecurityState(chatId).blacklist.includes(normalizeJid(jid, conn))
}

export async function addSecurityBlacklist(chatId, jid, conn) {
  const state = getSecurityState(chatId)
  const target = normalizeJid(jid, conn)
  if (!target || state.blacklist.includes(target)) return false
  state.unverified = state.unverified.filter(item => item !== target)
  state.blacklist.push(target)
  await saveDB()
  return true
}

export async function addSecurityReview(chatId, jid, conn) {
  const state = getSecurityState(chatId)
  const target = normalizeJid(jid, conn)
  if (!target || state.unverified.includes(target)) return false
  state.blacklist = state.blacklist.filter(item => item !== target)
  state.unverified.push(target)
  await saveDB()
  return true
}

export async function verifySecurityMember(chatId, jid, conn) {
  const state = getSecurityState(chatId)
  const target = normalizeJid(jid, conn)
  const index = state.unverified.indexOf(target)
  if (index < 0) return false
  state.unverified.splice(index, 1)
  await saveDB()
  return true
}

export function securityJid(jid, conn) {
  return normalizeJid(jid, conn)
}

export async function getSecurityAdminJids(chatId, conn) {
  const metadata = typeof conn?.groupMetadata === 'function'
    ? await conn.groupMetadata(chatId).catch(() => null)
    : null
  return [...new Set((metadata?.participants || [])
    .filter(participant => participant.admin)
    .map(participant => securityJid(participant.id || participant.jid || participant.lid, conn))
    .filter(Boolean))]
}