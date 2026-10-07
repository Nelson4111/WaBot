import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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

export function getMonthlyNews(news, now = new Date()) {
  const current = getJakartaDateParts(now)
  const dailyCounts = new Map()

  return news
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      if (!entry || !Number.isFinite(Number(entry.createdAt))) return false
      const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
      return date.year === current.year && date.month === current.month
    })
    .sort((a, b) => Number(a.entry.createdAt) - Number(b.entry.createdAt) || a.index - b.index)
    .map(({ entry, index }) => {
      const date = getJakartaDateParts(new Date(Number(entry.createdAt)))
      const day = Number(date.day)
      const sequence = dailyCounts.get(day) || 0
      dailyCounts.set(day, sequence + 1)
      return { ...entry, id: `${day}.${sequence}`, sourceIndex: index }
    })
}

function formatNewsDate(timestamp) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(Number(timestamp)))
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
  const body = entries.map(entry =>
    `*${entry.id}* · ${entry.title || `${entry.section} Update`}`
  ).join('\n')

  return `╭─「 📰 NEWS ALL 」\n│ Total: *${entries.length} news*\n│ Periode: *${monthName}*\n╰──────────────\n\n${body}`
}

export function formatNewsDetail(entry) {
  const entryTitle = entry.title || `${entry.section} Update`
  const author = entry.author || 'Eza'
  return `╭─「 ${getSectionEmoji(entry.section)} NEWS ${entry.id} 」\n│ ${formatNewsDate(entry.createdAt)}\n╰──────────────\n\n*${entryTitle}*\n${getSectionEmoji(entry.section)} ${entry.section} · Oleh: ${author}\n\n${entry.content}`
}

export async function getNewsInfoText(targetId) {
  const entry = getMonthlyNews(await loadNews()).find(item => item.id === targetId)
  return entry
    ? formatNewsDetail(entry)
    : `Nomor *${targetId}* tidak ditemukan di news bulan ini.`
}

function formatNewsPage(entries, { page, pageCount, monthName, section }) {
  const title = section ? `NEWS • ${section.toUpperCase()}` : `NEWS UPDATE • ${monthName}`
  const pageEntries = entries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const body = pageEntries.map(entry => {
    const entryTitle = entry.title || `${entry.section} Update`
    const author = entry.author || 'Eza'
    return `*${entry.id}* | ${formatNewsDate(entry.createdAt)}\n*${entryTitle}*\n${getSectionEmoji(entry.section)} ${entry.section} • Oleh: ${author}\n${entry.content}`
  }).join('\n\n')

  return `*${title}*\n\n${body}\n\nHalaman ${page}/${pageCount}`
}

let handler = async (m, { text = '', usedPrefix, isOwner }) => {
  const [action = '', ...params] = text.trim().split(/\s+/).filter(Boolean)
  const normalizedAction = action.toLowerCase()

  if (normalizedAction === 'info') {
    const allNews = await loadNews()
    const monthlyCount = getMonthlyNews(allNews).length
    return m.reply(`╭─❏「 📰 NEWS INFO 」❏\nTotal update tersimpan: *${allNews.length}*\nUpdate bulan ini: *${monthlyCount}*\n\nPerintah: ${usedPrefix}news | ${usedPrefix}news <halaman> | ${usedPrefix}news <bagian> [halaman]\nSemua judul: ${usedPrefix}news all\nDetail: ${usedPrefix}news list info <nomor>\nGuide: ${usedPrefix}news guide\n╰─━━━━━━━━━━━━━━─`)
  }

  if (normalizedAction === 'guide') {
    return m.reply(`╭─❏「 📖 NEWS GUIDE 」❏\n${usedPrefix}news\n${usedPrefix}news <halaman>\n${usedPrefix}news <bagian> [halaman]\n${usedPrefix}news all\n${usedPrefix}news list info <nomor>\n${usedPrefix}news info\n\nOwner: ${usedPrefix}news add <bagian> <isi>\nOwner: ${usedPrefix}news del <nomor>\n╰─━━━━━━━━━━━━━━─`)
  }

  if (normalizedAction === 'list') {
    if (params[0]?.toLowerCase() !== 'info' || params.length !== 2) {
      return m.reply(`Format: ${usedPrefix}news list info <nomor>\nContoh: ${usedPrefix}news list info 1.0`)
    }
    return m.reply(await getNewsInfoText(params[1]))
  }

  if (normalizedAction === 'all') {
    if (params.length) return m.reply(`Format: ${usedPrefix}news all`)
    const now = new Date()
    const monthName = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      month: 'long',
      year: 'numeric'
    }).format(now)
    const entries = getMonthlyNews(await loadNews())
    if (!entries.length) return m.reply(`Belum ada news untuk bulan ${monthName}.`)
    return m.reply(formatNewsAll(entries, monthName))
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

    const id = await updateNews(news => {
      const entry = { section: pluginSection, content, createdAt: Date.now() }
      news.push(entry)
      return getMonthlyNews(news, new Date(entry.createdAt))
        .find(item => item.sourceIndex === news.length - 1)?.id
    })
    return m.reply(`✅ News *${id}* untuk bagian *${pluginSection}* berhasil ditambahkan.`)
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

    return m.reply(`✅ News *${targetId}* berhasil dihapus. Nomor entri setelahnya otomatis dirapatkan.`)
  }

  const now = new Date()
  const monthName = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    month: 'long',
    year: 'numeric'
  }).format(now)
  const monthlyEntries = getMonthlyNews(await loadNews())

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

handler.help = ['news [halaman]', 'news <bagian> [halaman]', 'news all', 'news list info <nomor>', 'news info', 'news guide', 'news add <bagian> <isi>', 'news del <nomor>']
handler.tags = ['info']
handler.command = /^news$/i
export default handler