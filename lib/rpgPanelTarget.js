export function resolveRpgPanelTarget(args, message, conn, users) {
  const consumedIndexes = []
  let target = null
  const decodeJid = jid => {
    let decoded = String(jid || '')
    if (conn?.decodeJid) decoded = conn.decodeJid(decoded)
    if (decoded.endsWith('@lid')) {
      decoded = global.lids?.[decoded] || global.db?.data?.lids?.[decoded] || decoded
    }
    return decoded
  }
  const accountMatch = digits => Object.entries(users).find(([jid, account]) => {
    const jidDigits = jid.split('@')[0].replace(/\D/g, '')
    const lidDigits = String(account?.lid || '').split('@')[0].replace(/\D/g, '')
    return jidDigits === digits || lidDigits === digits
  })?.[0]
  const normalizePhone = value => {
    let digits = String(value || '').replace(/\D/g, '')
    if (digits.startsWith('00')) digits = digits.slice(2)
    if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
    else if (digits.startsWith('8')) digits = `62${digits}`
    return digits
  }

  const selfIndex = args.findIndex(arg => /^@me$/i.test(arg))
  const jidIndex = args.findIndex(arg => /@(?:s\.whatsapp\.net|lid)$/i.test(arg))
  let phoneIndexes = []
  if (jidIndex === -1 && selfIndex === -1) {
    for (let index = 0; index < args.length - 1; index++) {
      if (/^\+?62$/.test(args[index])) {
        const localDigits = args[index + 1].replace(/\D/g, '')
        if (/^8\d{7,13}$/.test(localDigits)) {
          phoneIndexes = [index, index + 1]
          break
        }
      }
    }
    if (!phoneIndexes.length) {
      const phoneIndex = args.findIndex((arg, index) => {
        if (index === args.length - 1 && args.length > 1) return false
        const digits = arg.replace(/\D/g, '')
        return digits.length >= 8 && digits.length <= 16
      })
      if (phoneIndex !== -1) phoneIndexes = [phoneIndex]
    }
  }

  if (selfIndex !== -1) {
    target = message.sender
    consumedIndexes.push(selfIndex)
  } else if (jidIndex !== -1) {
    target = args[jidIndex]
    consumedIndexes.push(jidIndex)
  } else if (phoneIndexes.length) {
    const phone = normalizePhone(phoneIndexes.map(index => args[index]).join(''))
    if (phone.length >= 8 && phone.length <= 16) {
      target = `${phone}@s.whatsapp.net`
      consumedIndexes.push(...phoneIndexes)
    }
  } else if (message.mentionedJid?.length) {
    target = message.mentionedJid[0]
    const mentionIndex = args.findIndex(arg => arg.startsWith('@'))
    if (mentionIndex !== -1) consumedIndexes.push(mentionIndex)
  } else if (message.quoted?.sender) {
    target = message.quoted.sender
  }

  if (target) {
    target = decodeJid(target) || String(target)
    if (!target.includes('@')) target = `${normalizePhone(target)}@s.whatsapp.net`
    const targetDigits = target.split('@')[0].replace(/\D/g, '')
    const normalizedDigits = normalizePhone(targetDigits)
    target = accountMatch(targetDigits) ||
      accountMatch(normalizedDigits) ||
      (target.endsWith('@lid') ? target : `${normalizedDigits}@s.whatsapp.net`)
  }

  return { target, consumedIndexes }
}
