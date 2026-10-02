function normalizeUserIds(value) {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return []

  const canonical = raw.split('@')[0].split(':')[0]
  const digits = canonical.replace(/\D/g, '')
  return digits && digits !== canonical ? [canonical, digits] : [canonical]
}

function getAccessEntries(value) {
  if (Array.isArray(value)) return value.flatMap(entry => Array.isArray(entry) ? entry.slice(0, 1) : [entry])
  if (value && typeof value === 'object') {
    return Object.entries(value).filter(([, enabled]) => enabled).map(([id]) => id)
  }
  return value ? [value] : []
}

export function filterRpgPanelUsers(users, getId = user => user) {
  const privilegedIds = [
    ...getAccessEntries(global.owner),
    ...getAccessEntries(global.rpgPanelUsers),
    ...getAccessEntries(global.rpgPanelVoiceAccess),
    ...Object.entries(global.db?.data?.users || {})
      .filter(([, user]) => user?.isCoOwner)
      .map(([id]) => id)
  ].flatMap(normalizeUserIds)
  const privileged = new Set(privilegedIds)

  return users.filter(user => !normalizeUserIds(getId(user)).some(id => privileged.has(id)))
}