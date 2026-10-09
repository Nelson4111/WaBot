function canonicalJid(value, conn) {
  let jid = String(value || '').trim().toLowerCase()
  if (!jid) return ''
  if (typeof conn?.decodeJid === 'function') jid = String(conn.decodeJid(jid) || jid).toLowerCase()
  const [user, server] = jid.split('@')
  if (!user || !server) return ''
  return `${user.split(':')[0]}@${server}`
}

function getPhoneDigits(value) {
  const jid = String(value || '').trim().toLowerCase()
  const [user, server] = jid.split('@')
  if (server && !['s.whatsapp.net', 'c.us'].includes(server)) return ''
  const digits = (user || jid).replace(/\D/g, '')
  return digits.length >= 7 ? digits : ''
}

function addIdentity(keys, value, conn) {
  const jid = canonicalJid(value, conn)
  if (jid) keys.add(`jid:${jid}`)
  const digits = getPhoneDigits(value)
  if (digits) keys.add(`phone:${digits}`)
}

function getBotIdentityKeys(conn) {
  const keys = new Set()
  addIdentity(keys, conn?.user?.id, conn)
  addIdentity(keys, conn?.user?.phoneNumber, conn)
  addIdentity(keys, conn?.user?.lid, conn)
  addIdentity(keys, global.conn?.user?.id, global.conn)
  addIdentity(keys, global.conn?.user?.phoneNumber, global.conn)
  addIdentity(keys, global.conn?.user?.lid, global.conn)

  if (global.jadibots instanceof Map) {
    for (const [phone, record] of global.jadibots) {
      addIdentity(keys, phone, null)
      addIdentity(keys, record?.sock?.user?.id, record?.sock)
      addIdentity(keys, record?.sock?.user?.phoneNumber, record?.sock)
      addIdentity(keys, record?.sock?.user?.lid, record?.sock)
    }
  }

  return keys
}

export function isLeaderboardBot(jid, conn) {
  const keys = new Set()
  addIdentity(keys, jid, conn)
  const botKeys = getBotIdentityKeys(conn)
  return [...keys].some(key => botKeys.has(key))
}

export function filterLeaderboardUsers(users, conn, getId = user => user) {
  const botKeys = getBotIdentityKeys(conn)
  return users.filter(user => {
    const keys = new Set()
    addIdentity(keys, getId(user), conn)
    return ![...keys].some(key => botKeys.has(key))
  })
}

function maskPhoneNumber(jid) {
  const digits = getPhoneDigits(jid)
  if (!digits) return '@pengguna'
  if (digits.startsWith('62') && digits.length > 7) {
    const localNumber = digits.slice(2)
    return `@+62 ${localNumber.slice(0, 3)}xxx${localNumber.slice(-2)}`
  }
  return `@+${digits.slice(0, 2)} ${digits.slice(2, 5)}xxx${digits.slice(-2)}`
}

function getGroupMemberKeys(groupMetadata, conn) {
  const keys = new Set()
  for (const participant of groupMetadata?.participants || []) {
    addIdentity(keys, participant?.id || participant?.jid, conn)
    if (participant?.phoneNumber) addIdentity(keys, participant.phoneNumber, null)
  }
  return keys
}

export function getLeaderboardUserIdentity(jid, { conn, groupMetadata, name } = {}) {
  const userKeys = new Set()
  addIdentity(userKeys, jid, conn)
  const memberKeys = getGroupMemberKeys(groupMetadata, conn)
  const isGroupMember = [...userKeys].some(key => memberKeys.has(key))

  if (!isGroupMember) {
    return { isGroupMember: false, display: maskPhoneNumber(jid), mention: null }
  }

  const normalizedJid = canonicalJid(jid, conn)
  const number = normalizedJid.split('@')[0]
  return {
    isGroupMember: true,
    display: name ? `${name} (@${number})` : `@${number}`,
    mention: normalizedJid
  }
}
