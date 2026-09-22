export function isAfk(user = {}) {
  return Number(user?.afk ?? -1) > -1
}

export function setAfk(user = {}, reason = 'Tanpa Alasan', now = Date.now()) {
  user.afk = now
  user.afkReason = reason || 'Tanpa Alasan'
  user.lastAfk = now
  return user
}

export function clearAfk(user = {}, now = Date.now()) {
  user.afk = -1
  user.afkReason = ''
  user.lastAfk = now
  return user
}
