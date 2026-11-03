import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// News copy should be concise, plain Indonesian for regular users, and explain only what changed or is new.
const ITEMS_PER_PAGE = 5
const NEWS_FILE = fileURLToPath(new URL('../../lib/news.json', import.meta.url))
const TEMP_FILE = `${NEWS_FILE}.tmp`
const PLUGINS_DIRECTORY = fileURLToPath(new URL('../', import.meta.url))
const JAKARTA_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})
let writeQueue = Promise.resolve()
let pluginSectionsPromise

async function loadNews() {
  try {
    const news = JSON.parse(await readFile(NEWS_FILE, 'utf8'))
    if (!Array.isArray(news)) throw new TypeError('News data must be an array')
    return news
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(dirname(NEWS_FILE), { recursive: true })
    await writeFile(NEWS_FILE, '[]\n', 'utf8')
    return []
  }
}

async function saveNews(news) {
  await writeFile(TEMP_FILE, `${JSON.stringify(news, null, 2)}\n`, 'utf8')
  await rename(TEMP_FILE, NEWS_FILE)
}

function updateNews(update) {
  const operation = writeQueue.then(async () => {
    const news = await loadNews()
    const result = update(news)
    await saveNews(news)
    return result
  })
  writeQueue = operation.catch(() => {})
  return operation
}

function getPluginSections() {
  pluginSectionsPromise ||= readdir(PLUGINS_DIRECTORY, { withFileTypes: true })
    .then(entries => entries.filter(entry => entry.isDirectory()).map(entry => entry.name))
  return pluginSectionsPromise
}

function findPluginSection(value, sections) {
  return sections.find(section => section.toLowerCase() === value.toLowerCase())
}

function getJakartaDateParts(date) {
  return Object.fromEntries(JAKARTA_DATE.formatToParts(date)
    .filter(part => part.type !== 'literal')
    .map(part => [part.type, part.value]))
}

function isSameJakartaDate(first, second) {
  const firstDate = getJakartaDateParts(new Date(Number(first)))
  const secondDate = getJakartaDateParts(new Date(Number(second)))
  return firstDate.year === secondDate.year &&
    firstDate.month === secondDate.month &&
    firstDate.day === secondDate.day
}

export function getMonthlyNews(news, now = new Date()) {
  const current = getJakartaDateParts(now)
  const datedEntries = news
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      if (!entry || !Number.isFinite(Number(entry.createdAt))) return false
      const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
      return date.year === current.year && date.month === current.month
    })
    .sort((a, b) => Number(a.entry.createdAt) - Number(b.entry.createdAt) || a.index - b.index)
  const reservedIds = new Map()

  for (const { entry } of datedEntries) {
    const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
    const day = Number(date.day)
    const match = typeof entry.id === 'string' && entry.id.match(/^(\d+)\.(\d+)$/)
    if (!match || Number(match[1]) !== day) continue
    if (!reservedIds.has(day)) reservedIds.set(day, new Set())
    reservedIds.get(day).add(entry.id)
  }
  const assignedIds = new Map()

  return datedEntries.map(({ entry, index }) => {
    const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
    const day = Number(date.day)
    const match = typeof entry.id === 'string' && entry.id.match(/^(\d+)\.(\d+)$/)
    const assigned = assignedIds.get(day) || new Set()
    let id = match && Number(match[1]) === day && !assigned.has(entry.id) ? entry.id : ''
    if (!id) {
      const reserved = reservedIds.get(day) || new Set()
      let sequence = 0
      while (reserved.has(`${day}.${sequence}`) || assigned.has(`${day}.${sequence}`)) sequence++
      id = `${day}.${sequence}`
    }
    if (!assignedIds.has(day)) assignedIds.set(day, new Set())
    assignedIds.get(day).add(id)
    return { ...entry, id, sourceIndex: index }
  })
}

export function getAllNews(news) {
  const groups = new Map()
  for (const [sourceIndex, entry] of news.entries()) {
    if (!entry || !Number.isFinite(Number(entry.createdAt))) continue
    const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
    const key = `${date.year}-${date.month}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ entry, sourceIndex })
  }

  return [...groups.values()].flatMap(group => {
    const normalized = getMonthlyNews(group.map(item => item.entry), new Date(Number(group[0].entry.createdAt)))
    return normalized.map((entry, index) => ({ ...entry, sourceIndex: group[index].sourceIndex }))
  }).sort((a, b) => Number(a.createdAt) - Number(b.createdAt) || a.sourceIndex - b.sourceIndex)
}

function getNextNewsId(news, now) {
  const date = getJakartaDateParts(now)
  const day = Number(date.day)
  const existingIds = getMonthlyNews(news, now)
    .map(entry => entry.id.match(/^(\d+)\.(\d+)$/))
    .filter(match => match && Number(match[1]) === day)
    .map(match => Number(match[2]))
  return `${day}.${Math.max(-1, ...existingIds) + 1}`
}

function formatNewsDate(timestamp) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(Number(timestamp)))
}

function formatNewsMonth(timestamp) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    month: 'long',
    year: 'numeric'
  }).format(new Date(Number(timestamp)))
}

function parseNewsMonth(value) {
  if (/^\d{1,2}$/.test(value)) {
    const month = Number(value)
    return month >= 1 && month <= 12 ? month : null
  }
  const normalized = value.toLocaleLowerCase('id-ID')
  for (let month = 1; month <= 12; month++) {
    const date = new Date(Date.UTC(2026, month - 1, 15))
    const names = [
      new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' }).format(date),
      new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'UTC' }).format(date),
      new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(date),
      new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date)
    ]
    if (names.some(name => name.toLocaleLowerCase('id-ID').replace(/\.$/, '') === normalized.replace(/\.$/, ''))) {
      return month
    }
  }
  return null
}

function getSectionEmoji(section) {
  const emojis = {
    RPG: '🎮',
    INFO: '📰',
    GROUP: '👥',
    FUN: '🎉',
    GAME: '🎲',
    OWNER: '👑',
    TOOLS: '🛠️'
  }
  return emojis[String(section).toUpperCase()] || '📌'
}

export function formatNewsAll(entries, monthName) {
  const orderedEntries = [...entries].sort((a, b) =>
    Number(b.createdAt || 0) - Number(a.createdAt || 0)
  )
  const body = orderedEntries.map(entry => {
    const label = Number.isFinite(Number(entry.createdAt))
      ? formatNewsMonth(entry.createdAt)
      : monthName || 'Tanggal tidak tersedia'
    return `*${entry.id}* · ${label} — ${entry.title || `${entry.section} Update`}`
  }).join('\n')

  return `╭─「 📰 DAFTAR NEWS 」\n╰──────────────\n\n${body}`
}

export function formatNewsLog(entries) {
  const body = [...entries]
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map(entry => `*${entry.id}* · ${formatNewsMonth(entry.createdAt)} · ${entry.title || `${entry.section} Update`}`)
    .join('\n')
  return `╭─「 🧾 LOG ID NEWS 」\n│ Total: *${entries.length} perubahan*\n╰──────────────\n\n${body}`
}

export function formatNewsDetail(entry) {
  const entryTitle = entry.title || `${entry.section} Update`
  const author = entry.author || 'Eza'
  return `╭─「 ${getSectionEmoji(entry.section)} NEWS ${entry.id} 」\n│ ${formatNewsDate(entry.createdAt)}\n╰──────────────\n\n*${entryTitle}*\n${getSectionEmoji(entry.section)} ${entry.section} · Oleh: ${author}\n\n${entry.content}`
}

export function findNewsMatches(news, targetId, month = null, year = null) {
  return getAllNews(news).filter(entry => {
    if (entry.id !== targetId) return false
    const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
    return (month === null || Number(date.month) === Number(month)) &&
      (year === null || Number(date.year) === Number(year))
  })
}

export async function getNewsInfoText(targetId, month = null, year = null, usedPrefix = '.') {
  const matches = findNewsMatches(await loadNews(), targetId, month, year)
  if (matches.length === 1) return formatNewsDetail(matches[0])
  if (!matches.length) {
    return month === null
      ? `ID *${targetId}* tidak ditemukan. Cek daftar dengan ${usedPrefix}news.`
      : `ID *${targetId}* tidak ditemukan pada bulan ${month}${year === null ? '' : ` tahun ${year}`}.`
  }

  const choices = matches.map(entry => {
    const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
    const monthName = formatNewsMonth(entry.createdAt)
    return `• ${monthName} — ${usedPrefix}news detail ${targetId} ${date.month} ${date.year}`
  })
  return `ID *${targetId}* ada di beberapa bulan. Pilih yang ingin dilihat:\n${choices.join('\n')}`
}

function formatNewsPage(entries, { page, pageCount, monthName, section }) {
  const title = section ? `NEWS • ${section.toUpperCase()}` : `NEWS UPDATE • ${monthName}`
  const pageEntries = entries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const body = pageEntries.map(entry =>
    `*${entry.id}* · ${entry.title || `${entry.section} Update`} — ${formatNewsMonth(entry.createdAt)}`
  ).join('\n')

  return `*${title}*\n\n${body}\n\nHalaman ${page}/${pageCount}`
}

let handler = async (m, { text = '', usedPrefix, isOwner }) => {
  const [action = '', ...params] = text.trim().split(/\s+/).filter(Boolean)
  const normalizedAction = action.toLowerCase()

  if (!normalizedAction) {
    return m.reply(formatNewsAll(getAllNews(await loadNews())))
  }

  if (normalizedAction === 'info') {
    const allNews = getAllNews(await loadNews())
    return m.reply(`╭─❏「 📰 NEWS INFO 」❏\nTotal update tersimpan: *${allNews.length}*\n\nDaftar: ${usedPrefix}news\nDetail: ${usedPrefix}news detail <id> [bulan] [tahun]\nCari author: ${usedPrefix}news author <nama>\nLog ID: ${usedPrefix}news log [id]\nPanduan: ${usedPrefix}news guide\n╰─━━━━━━━━━━━━━━─`)
  }

  if (normalizedAction === 'guide') {
    return m.reply(`╭─❏「 📖 NEWS GUIDE 」❏\n${usedPrefix}news — daftar ID dan judul\n${usedPrefix}news detail <id> [bulan] [tahun]\n${usedPrefix}news author <nama>\n${usedPrefix}news log [id]\n${usedPrefix}news list <bulan> [tahun]\n${usedPrefix}news info\n\nContoh detail: ${usedPrefix}news detail 2.1 November 2026\nOwner: ${usedPrefix}news add <bagian> <isi>\nOwner: ${usedPrefix}news del <id>\n╰─━━━━━━━━━━━━━━─`)
  }

  if (normalizedAction === 'detail') {
    if (params.length < 1 || params.length > 3) {
      return m.reply(`Format: ${usedPrefix}news detail <id> [bulan] [tahun]\nContoh: ${usedPrefix}news detail 2.1 November 2026`)
    }
    const [targetId, monthInput, yearInput] = params
    const month = monthInput ? parseNewsMonth(monthInput) : null
    const year = yearInput ? Number(yearInput) : null
    if ((monthInput && !month) || (yearInput && (!/^\d{4}$/.test(yearInput) || !Number.isSafeInteger(year) || year < 1))) {
      return m.reply(`Bulan atau tahun tidak valid. Contoh: ${usedPrefix}news detail 2.1 November 2026`)
    }
    return m.reply(await getNewsInfoText(targetId, month, year, usedPrefix))
  }

  if (normalizedAction === 'author') {
    const authorQuery = params.join(' ').trim().toLocaleLowerCase('id-ID')
    if (!authorQuery) return m.reply(`Format: ${usedPrefix}news author <nama>\nContoh: ${usedPrefix}news author Eza`)
    const entries = getAllNews(await loadNews()).filter(entry =>
      String(entry.author || '').toLocaleLowerCase('id-ID').includes(authorQuery)
    )
    if (!entries.length) return m.reply(`News dari author *${params.join(' ')}* tidak ditemukan.`)
    return m.reply(formatNewsAll(entries))
  }

  if (normalizedAction === 'log') {
    if (params.length > 1) return m.reply(`Format: ${usedPrefix}news log [id]`)
    const entries = getAllNews(await loadNews())
    const filtered = params[0] ? entries.filter(entry => entry.id === params[0]) : entries
    if (!filtered.length) return m.reply(`Log untuk ID *${params[0]}* tidak ditemukan.`)
    return m.reply(formatNewsLog(filtered))
  }

  if (normalizedAction === 'list') {
    if (params[0]?.toLowerCase() === 'info') {
      if (params.length !== 2) {
        return m.reply(`Format: ${usedPrefix}news list info <id>\nContoh: ${usedPrefix}news list info 2.1`)
      }
      return m.reply(await getNewsInfoText(params[1], null, null, usedPrefix))
    }

    if (params.length > 2) return m.reply(`Format: ${usedPrefix}news list [bulan] [tahun]`)
    let entries = getAllNews(await loadNews()).reverse()
    let monthName = 'Semua bulan'
    if (params.length && !/^\d+$/.test(params[0])) {
      const month = parseNewsMonth(params[0])
      const year = params[1] ? Number(params[1]) : null
      if (!month || (params[1] && (!/^\d{4}$/.test(params[1]) || !Number.isSafeInteger(year) || year < 1))) {
        return m.reply(`Bulan atau tahun tidak valid. Contoh: ${usedPrefix}news list November 2026`)
      }
      entries = entries.filter(entry => {
        const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
        return Number(date.month) === month && (year === null || Number(date.year) === year)
      })
      monthName = params[1]
        ? formatNewsMonth(new Date(Date.UTC(year, month - 1, 15, 12)))
        : new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month - 1, 15)))
    }
    if (!entries.length) return m.reply(`Belum ada news untuk ${monthName}.`)
    if (params.length === 1 && /^\d+$/.test(params[0])) {
      const page = Number(params[0])
      const pageCount = Math.ceil(entries.length / ITEMS_PER_PAGE)
      if (!Number.isSafeInteger(page) || page < 1 || page > pageCount) {
        return m.reply(`Halaman tidak tersedia. News maksimal ${pageCount} halaman.`)
      }
      return m.reply(formatNewsPage(entries, { page, pageCount, monthName, section: '' }))
    }
    return m.reply(formatNewsAll(entries, monthName))
  }

  if (normalizedAction === 'month') {
    if (params.length < 1 || params.length > 2) {
      return m.reply(`Format: ${usedPrefix}news month <bulan> [tahun]`)
    }
    const month = parseNewsMonth(params[0])
    const year = params[1] ? Number(params[1]) : null
    if (!month || (params[1] && (!/^\d{4}$/.test(params[1]) || !Number.isSafeInteger(year) || year < 1))) {
      return m.reply(`Bulan atau tahun tidak valid. Contoh: ${usedPrefix}news month November 2026`)
    }
    const entries = getAllNews(await loadNews()).filter(entry => {
      const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
      return Number(date.month) === month && (year === null || Number(date.year) === year)
    })
    if (!entries.length) return m.reply('News untuk bulan tersebut tidak ditemukan.')
    return m.reply(formatNewsAll(entries))
  }

  if (normalizedAction === 'all') {
    if (params.length) return m.reply(`Format: ${usedPrefix}news all`)
    const entries = getAllNews(await loadNews())
    if (!entries.length) return m.reply('Belum ada news yang tersimpan.')
    return m.reply(formatNewsAll(entries))
  }

  if (normalizedAction === 'add') {
    if (!isOwner) return m.reply('❌ Perintah tambah news khusus untuk owner.')

    const [section, ...contentParts] = params
    const content = contentParts.join(' ').trim()
    if (!section || !content) {
      return m.reply(`Format: ${usedPrefix}news add <bagian> <isi>\nContoh: ${usedPrefix}news add RPG Perbaikan sistem memancing.`)
    }
    const pluginSections = await getPluginSections()
    const pluginSection = findPluginSection(section, pluginSections)
    if (!pluginSection) {
      return m.reply(`Bagian harus sesuai nama folder plugins. Pilihan: ${pluginSections.join(', ')}`)
    }

    const result = await updateNews(news => {
      const latestTimestamp = news.reduce((latest, entry) =>
        Number.isFinite(Number(entry?.createdAt))
          ? Math.max(latest, Number(entry.createdAt))
          : latest, 0)
      const now = Math.max(Date.now(), latestTimestamp + 60_000)
      const existing = news
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) =>
          entry?.section?.toLowerCase() === pluginSection.toLowerCase() &&
          Number.isFinite(Number(entry.createdAt)) &&
          isSameJakartaDate(entry.createdAt, now)
        )
        .sort((a, b) => Number(b.entry.createdAt) - Number(a.entry.createdAt))[0]

      if (existing) {
        const existingNews = getMonthlyNews(news, new Date(now))
          .find(item => item.sourceIndex === existing.index)
        if (!existing.entry.id) existing.entry.id = existingNews?.id
        existing.entry.content = `${existing.entry.content || ''}\n${content}`
        return { id: existing.entry.id, merged: true }
      }

      const entry = { id: getNextNewsId(news, new Date(now)), section: pluginSection, content, createdAt: now }
      news.push(entry)
      return { id: entry.id, merged: false }
    })
    return m.reply(
      result.merged
        ? `✅ Update berhasil digabung ke news *${result.id}* untuk bagian *${pluginSection}* hari ini.`
        : `✅ News *${result.id}* untuk bagian *${pluginSection}* berhasil ditambahkan.`
    )
  }

  if (normalizedAction === 'del' || normalizedAction === 'delete') {
    if (!isOwner) return m.reply('❌ Perintah hapus news khusus untuk owner.')

    const targetId = params[0]
    if (!targetId || params.length !== 1) {
      return m.reply(`Format: ${usedPrefix}news del <nomor>\nContoh: ${usedPrefix}news del 1.0`)
    }

    const deleted = await updateNews(news => {
      const target = getMonthlyNews(news).find(entry => entry.id === targetId)
      if (!target) return false
      news.splice(target.sourceIndex, 1)
      return true
    })
    if (!deleted) return m.reply(`Nomor *${targetId}* tidak ditemukan di news bulan ini.`)

    return m.reply(`✅ News *${targetId}* berhasil dihapus. ID news lainnya tetap.`)
  }

  const now = new Date()
  const monthName = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    month: 'long',
    year: 'numeric'
  }).format(now)
  const monthlyEntries = getAllNews(await loadNews())

  let section = ''
  let page = 1
  if (normalizedAction && /^\d+$/.test(normalizedAction)) {
    page = Number(normalizedAction)
  } else if (normalizedAction) {
    section = action
    if (params.length > 1 || (params.length === 1 && !/^\d+$/.test(params[0]))) {
      return m.reply(`Format: ${usedPrefix}news [halaman]\nFilter: ${usedPrefix}news <bagian> [halaman]`)
    }
    if (params[0]) page = Number(params[0])
  }

  if (!Number.isInteger(page) || page < 1) return m.reply('Nomor halaman harus berupa angka mulai dari 1.')
  if (section) {
    const pluginSections = await getPluginSections()
    const pluginSection = findPluginSection(section, pluginSections)
    if (!pluginSection) {
      return m.reply(`Bagian harus sesuai nama folder plugins. Pilihan: ${pluginSections.join(', ')}`)
    }
    section = pluginSection
  }

  const entries = monthlyEntries
    .filter(entry => !section || entry.section.toLowerCase() === section.toLowerCase())
    .reverse()
  if (!entries.length) {
    return m.reply(section
      ? `Belum ada news bagian *${section}* pada bulan ${monthName}.`
      : `Belum ada news untuk bulan ${monthName}.`)
  }

  const pageCount = Math.ceil(entries.length / ITEMS_PER_PAGE)
  if (page > pageCount) return m.reply(`Halaman tidak tersedia. News ${section ? `bagian *${section}* ` : ''}maksimal ${pageCount} halaman.`)

  return m.reply(formatNewsPage(entries, { page, pageCount, monthName, section }))
}

handler.help = ['news', 'news list [bulan] [tahun]', 'news detail <id> [bulan] [tahun]', 'news author <nama>', 'news log [id]', 'news month <bulan> [tahun]', 'news info', 'news guide', 'news add <bagian> <isi>', 'news del <id>']
handler.tags = ['info']
handler.command = /^news$/i
export default handler