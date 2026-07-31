import moment from 'moment-timezone'

let started = false

const DEFAULT_TIME_ZONE = 'Asia/Makassar'
const DEFAULT_SEND_HOUR = 8
const DEFAULT_SEND_MINUTE = 0
const SEND_END_HOUR = 22

function religiousConfig() {
  const config = global.religiousGreeting || {}
  const sendHour = Number(config.sendHour)
  const sendMinute = Number(config.sendMinute)
  return {
    enabled: config.enabled !== false,
    timeZone: config.timeZone || global.nenelcraft?.timeZone || DEFAULT_TIME_ZONE,
    sendHour: Number.isFinite(sendHour) ? sendHour : DEFAULT_SEND_HOUR,
    sendMinute: Number.isFinite(sendMinute) ? sendMinute : DEFAULT_SEND_MINUTE
  }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function sameDay(a, b) {
  return a.format('YYYY-MM-DD') === b.format('YYYY-MM-DD')
}

function easterSunday(year, timeZone) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return moment.tz(`${year}-${pad(month)}-${pad(day)}`, 'YYYY-MM-DD', timeZone)
}

function hijriParts(now, timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      timeZone
    })
    const parts = formatter.formatToParts(now.toDate())
    const day = Number(parts.find(part => part.type === 'day')?.value)
    const month = Number(parts.find(part => part.type === 'month')?.value)
    return Number.isFinite(day) && Number.isFinite(month) ? { day, month } : null
  } catch {
    return null
  }
}

function christianEvents(now, timeZone) {
  const events = []
  const date = now.format('MM-DD')
  const easter = easterSunday(now.year(), timeZone)

  if (now.day() === 0) {
    events.push({
      id: 'christian-sunday',
      text: 'Selamat hari Minggu bagi saudara Kristiani. Semoga ibadah dan harimu membawa damai serta semangat baru.'
    })
  }

  if (date === '12-25') {
    events.push({
      id: 'christmas',
      text: 'Selamat Natal bagi yang merayakan. Semoga damai, kasih, dan harapan baik menyertai keluarga.'
    })
  }

  if (sameDay(now, easter.clone().subtract(2, 'days'))) {
    events.push({
      id: 'good-friday',
      text: 'Jumat Agung bagi yang memperingati. Semoga hari ini memberi ruang untuk tenang dan merenung.'
    })
  }

  if (sameDay(now, easter)) {
    events.push({
      id: 'easter',
      text: 'Selamat Paskah bagi yang merayakan. Semoga harapan baru dan damai menyertai hari ini.'
    })
  }

  if (sameDay(now, easter.clone().add(39, 'days'))) {
    events.push({
      id: 'ascension',
      text: 'Selamat memperingati Kenaikan Isa Almasih bagi yang merayakan. Semoga damai dan pengharapan menyertai hari ini.'
    })
  }

  return events
}

function islamicEvents(now, timeZone) {
  const events = []
  const hijri = hijriParts(now, timeZone)

  if (now.day() === 5) {
    events.push({
      id: 'islam-friday',
      text: 'Jumat berkah bagi yang menjalankan. Semoga hati tenang dan urusan hari ini dimudahkan.'
    })
  }

  if (!hijri) return events

  const isHijri = (month, day) => hijri.month === month && hijri.day === day

  if (isHijri(1, 1)) {
    events.push({
      id: 'islamic-new-year',
      text: 'Selamat Tahun Baru Hijriah bagi yang merayakan. Semoga langkah baru membawa kebaikan.'
    })
  }

  if (isHijri(3, 12)) {
    events.push({
      id: 'maulid',
      text: 'Selamat memperingati Maulid Nabi bagi yang merayakan. Semoga akhlak baik makin dekat dalam keseharian.'
    })
  }

  if (isHijri(9, 1)) {
    events.push({
      id: 'ramadan-start',
      text: 'Selamat memasuki Ramadan bagi yang menjalankan. Semoga ibadah lancar dan hati terasa lebih lapang.'
    })
  }

  if (isHijri(9, 17)) {
    events.push({
      id: 'nuzulul-quran',
      text: 'Selamat memperingati Nuzulul Quran bagi yang merayakan. Semoga hari ini membawa ketenangan dan hikmah.'
    })
  }

  if (isHijri(10, 1)) {
    events.push({
      id: 'eid-fitr',
      text: 'Selamat Idul Fitri bagi yang merayakan. Mohon maaf lahir batin, semoga damai menyertai hari ini.'
    })
  }

  if (isHijri(12, 10)) {
    events.push({
      id: 'eid-adha',
      text: 'Selamat Idul Adha bagi yang merayakan. Semoga keikhlasan dan kebaikan menguatkan hari ini.'
    })
  }

  return events
}

export function buildReligiousEvents(now = moment(), timeZone = DEFAULT_TIME_ZONE) {
  const localNow = moment.isMoment(now) ? now.clone().tz(timeZone) : moment(now).tz(timeZone)
  return [
    ...islamicEvents(localNow, timeZone),
    ...christianEvents(localNow, timeZone)
  ]
}

function shouldSendNow(now, config) {
  if (now.hour() < config.sendHour) return false
  if (now.hour() === config.sendHour && now.minute() < config.sendMinute) return false
  return now.hour() < SEND_END_HOUR
}

function greetingText(events) {
  if (events.length === 1) return events[0].text
  return [
    'Pengingat singkat hari ini:',
    '',
    ...events.map((event, index) => `${index + 1}. ${event.text}`)
  ].join('\n')
}

function eligibleGroupIds() {
  return Object.entries(global.db?.data?.chats || {})
    .filter(([id, chat]) => id.endsWith('@g.us') && chat && !chat.isBanned && chat.religiousGreeting !== false)
    .map(([id]) => id)
}

async function broadcastReligiousGreeting(conn) {
  const config = religiousConfig()
  if (!config.enabled) return

  const now = moment().tz(config.timeZone)
  if (!shouldSendNow(now, config)) return

  const events = buildReligiousEvents(now, config.timeZone)
  if (!events.length) return

  const botId = conn.user?.jid || 'bot'
  global.db.data.settings = global.db.data.settings || {}
  const settings = global.db.data.settings[botId] = global.db.data.settings[botId] || {}
  settings.religiousGreetings = settings.religiousGreetings || {}

  const sentKey = `${now.format('YYYY-MM-DD')}:${events.map(event => event.id).join('+')}`
  const text = greetingText(events)
  let changed = false

  for (const id of eligibleGroupIds()) {
    if (settings.religiousGreetings[id] === sentKey) continue

    await conn.sendMessage(id, { text }).catch(() => {})
    settings.religiousGreetings[id] = sentKey
    changed = true
    await new Promise(resolve => setTimeout(resolve, 2500))
  }

  if (changed && typeof global.db.write === 'function') {
    await global.db.write().catch(() => {})
  }
}

export async function before() {
  if (started) return
  started = true

  setTimeout(() => broadcastReligiousGreeting(this).catch(() => {}), 5000)
  setInterval(() => broadcastReligiousGreeting(this).catch(() => {}), 30 * 60 * 1000)
}

export const disabled = false
