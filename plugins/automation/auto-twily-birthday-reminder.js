import moment from 'moment-timezone'

import { TWILY_BIRTHDAYS } from '../../lib/twilyGenData.js'

let started = false

const TIME_ZONE = 'Asia/Makassar'
const REMINDER_HOUR = 18
const REMINDER_MINUTE = 0

const MONTH_NAMES = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember'
}

function birthdayDate(value) {
  const [day, month] = String(value.date || value).split('-').map(Number)
  return { day, month }
}

function eligibleGroupIds() {
  return Object.entries(global.db?.data?.chats || {})
    .filter(([id, chat]) => {
      if (!id.endsWith('@g.us')) return false
      if (!chat || chat.isBanned) return false
      return chat.twilyReminder === true
    })
    .map(([id]) => id)
}

function gatherTomorrowBirthdays() {
  const today = moment().tz(TIME_ZONE)
  const tomorrow = today.clone().add(1, 'day')
  return Object.values(TWILY_BIRTHDAYS)
    .filter(value => {
      const { day, month } = birthdayDate(value)
      return month === tomorrow.month() + 1 && day === tomorrow.date()
    })
    .sort((left, right) => String(left.name).localeCompare(String(right.name), 'id'))
}

async function sendOneReminder(conn, groupId, names, dateText) {
  const metadata = await conn.groupMetadata(groupId).catch(() => null)
  const participants = metadata?.participants || []
  const adminJids = participants
    .filter(participant => {
      const role = String(participant?.admin || '').toLowerCase()
      return role === 'admin' || role === 'superadmin'
    })
    .map(participant => participant.id)
    .filter(Boolean)

  if (!adminJids.length) return false

  const text = `⚠️ *Reminder Ultah TWILY*
Besok tanggal *${dateText}* ada birthday:
• ${names.map(name => name).join('\n• ')}

@admin, tolong siapin ucapan ya 🙌`

  await conn.sendMessage(groupId, { text, mentions: adminJids })
  return true
}

export async function sendTwilyBirthdayReminder(conn) {
  if (!conn || !global.db?.data) return

  const now = moment().tz(TIME_ZONE)
  if (now.hour() !== REMINDER_HOUR || now.minute() !== REMINDER_MINUTE) return

  const targetDate = now.clone().add(1, 'day')
  const birthdays = gatherTomorrowBirthdays()
  if (!birthdays.length) return

  const dateText = `${targetDate.date()} ${MONTH_NAMES[targetDate.month() + 1] || targetDate.format('MMMM')}`
  const botId = conn.user?.jid || 'bot'
  global.db.data.settings = global.db.data.settings || {}
  const settings = (global.db.data.settings[botId] = global.db.data.settings[botId] || {})
  settings.twilyBirthdayReminderSent = settings.twilyBirthdayReminderSent || {}
  const sentKey = targetDate.format('YYYY-MM-DD')

  let changed = false
  for (const groupId of eligibleGroupIds()) {
    if (settings.twilyBirthdayReminderSent[groupId] === sentKey) continue

    const sent = await sendOneReminder(conn, groupId, birthdays.map(item => item.name), dateText).catch(() => false)
    if (!sent) continue

    settings.twilyBirthdayReminderSent[groupId] = sentKey
    changed = true
  }

  if (changed && typeof global.db.write === 'function') {
    await global.db.write().catch(() => {})
  }
}

export const disabled = false

export async function before() {
  if (started) return
  started = true

  setTimeout(() => sendTwilyBirthdayReminder(this).catch(() => {}), 5000)
  setInterval(() => sendTwilyBirthdayReminder(this).catch(() => {}), 60 * 1000)
}
