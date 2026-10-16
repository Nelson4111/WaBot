import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'
import { AVELIA_GACHA_POOL, AVELIA_GACHA_FILTERS } from '../../lib/aveliaGachaData.js'

const GACHA_COOLDOWN = 30 * 60 * 1000
const GACHA_RESULTS = 5
const CLAIM_DURATION = 60 * 1000
const GACHA_TITLE_MILESTONES = [
  { count: 0, title: '🌱 Penghuni Baru' },
  { count: 5, title: '✨ Kolektor Pemula' },
  { count: 20, title: '🏰 Penghuni Mansion' },
  { count: 50, title: '💎 Kolektor Elit' },
  { count: 100, title: '👑 Legenda Avelia' }
]
const GACHA_STORIES = {
  roll: [
    'Kristal gacha berpendar dan membuka lima kemungkinan baru.',
    'Kartu-kartu berputar di udara sebelum mendarat dengan cahaya lembut.',
    'Sebuah portal kecil terbuka; lima karakter melangkah keluar.',
    'Bintang-bintang berkumpul di atas meja gacha, membawa kandidat pilihan.',
    'Mesin gacha berdenting riang—siapa yang akan menjadi penghuni mansion berikutnya?'
  ],
  claim: [
    'Karakter itu menerima undangan dan melangkah masuk ke mansion.',
    'Pintu mansion terbuka lebar untuk menyambut penghuni baru.',
    'Sebuah ikatan baru terbentuk saat karakter memilih tinggal bersamamu.',
    'Lencana mansion berkilau, menandai datangnya teman baru.',
    'Koleksi bertambah satu cerita baru yang siap dikenang.'
  ],
  release: [
    'Karakter berpamitan hangat, lalu melanjutkan perjalanannya.',
    'Gerbang mansion terbuka dan mengantar karakter kembali ke dunianya.',
    'Sebuah cahaya lembut mengiringi perpisahan yang penuh kenangan.',
    'Karakter melambaikan tangan sebelum menghilang di balik portal.',
    'Perjalanan baru menanti karakter itu di luar mansion.'
  ]
}

function randomGachaStory(event) {
  const stories = GACHA_STORIES[event] || []
  return stories[Math.floor(Math.random() * stories.length)] || ''
}

function todayKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function getGachaTitle(count) {
  return GACHA_TITLE_MILESTONES.reduce(
    (current, milestone) => count >= milestone.count ? milestone : current,
    GACHA_TITLE_MILESTONES[0]
  )
}

function formatRemaining(ms) {
  const remaining = Math.max(0, ms)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.ceil((remaining % 60000) / 1000)
  return `${minutes} menit ${seconds} detik`
}

function sendGachaText(conn, m, text, options = {}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    text,
    title: options.title || '🏰 AVELIA GACHA',
    subtitle: options.subtitle || 'Temukan karakter favoritmu',
    buttonText: options.buttonText || '✨ PILIH AKSI',
    sections: options.sections,
    buttons: options.buttons,
    mentions: options.mentions || [],
    fallbackText: options.fallbackText || text,
    noThumbnail: true
  })
}

function getClaimedCharacters(gacha) {
  return Array.isArray(gacha?.claimed) ? gacha.claimed : []
}

function getSortedMansion(gacha) {
  const favorites = new Set(Array.isArray(gacha?.favoriteIds) ? gacha.favoriteIds : [])
  return getClaimedCharacters(gacha).slice().sort((a, b) => {
    const aFav = favorites.has(a.id)
    const bFav = favorites.has(b.id)
    if (aFav !== bFav) return aFav ? -1 : 1
    return String(a.nickname || a.name || '').localeCompare(
      String(b.nickname || b.name || ''),
      undefined,
      { numeric: true, sensitivity: 'base' }
    )
  })
}

function normalizeClaimedState(gacha) {
  gacha.claimed = getClaimedCharacters(gacha)
  gacha.claimedMap = gacha.claimedMap && typeof gacha.claimedMap === 'object'
    ? gacha.claimedMap
    : {}
  for (const character of gacha.claimed) {
    if (character?.id) gacha.claimedMap[character.id] = true
  }
  return gacha
}

function normalizeFlag(flag = '') {
  return String(flag || '').toLowerCase().trim()
}

function normalizeSearchText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function matchesSearchValue(value, query) {
  const normalizedValue = normalizeSearchText(value)
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) return true
  return normalizedValue === normalizedQuery || normalizedValue.includes(normalizedQuery)
}

function extractMentionOrReplyTarget(m, args = []) {
  const mentioned = Array.isArray(m.mentionedJid) && m.mentionedJid.length ? m.mentionedJid[0] : null
  const replied = m.quoted?.sender || null

  if (mentioned) return { targetJid: mentioned, nameArgs: args.slice(0, -1) }
  if (replied) return { targetJid: replied, nameArgs: args }
  return { targetJid: m.sender, nameArgs: args }
}

function getUserGacha(user) {
  user.gacha = user.gacha || {
    lastRollAt: 0,
    lastRoll: [],
    rolls: 0,
    claimed: [],
    claimedMap: {},
    lastRollDate: '',
    favoriteIds: [],
    claimCooldownUntil: 0
  }

  if (user.gacha.lastRollDate !== todayKey()) {
    user.gacha.lastRollDate = todayKey()
    user.gacha.lastRoll = []
    user.gacha.rolls = 0
    user.gacha.claimCooldownUntil = 0
  }

  normalizeClaimedState(user.gacha)
  user.gacha.lastRoll = Array.isArray(user.gacha.lastRoll) ? user.gacha.lastRoll : []
  user.gacha.favoriteIds = Array.isArray(user.gacha.favoriteIds) ? user.gacha.favoriteIds : []
  user.gacha.claimCooldownUntil = Number(user.gacha.claimCooldownUntil || 0)

  return user.gacha
}

function dedupeCharacters(characters) {
  const seen = new Map()

  characters.forEach(character => {
    const key = `${(character.name || '').trim()}|${(character.series || '').trim()}`
    if (!seen.has(key)) {
      seen.set(key, character)
    }
  })

  return [...seen.values()]
}

function ensureMinimumSeriesSize(characters) {
  const grouped = new Map()

  characters.forEach(character => {
    const series = String(character.series || 'Custom').trim() || 'Custom'
    if (!grouped.has(series)) {
      grouped.set(series, [])
    }

    grouped.get(series).push(character)
  })

  const padded = [...characters]

  grouped.forEach((entries, series) => {
    if (entries.length >= 10) return

    const source = entries[0]?.source || 'anime'
    const roles = entries.map(entry => entry.role).filter(Boolean)
    const genders = entries.map(entry => entry.gender).filter(Boolean)
    const required = 10 - entries.length

    for (let i = 0; i < required; i++) {
      const fallbackRole = roles[i % roles.length] || 'waifu'
      const fallbackGender = genders[i % genders.length] || 'female'
      const slot = entries.length + i + 1
      const slug = String(series).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'custom'

      padded.push({
        id: `placeholder-${slug}-${slot}`,
        name: `${series} Character ${slot}`,
        rarity: 'R',
        source,
        role: fallbackRole,
        gender: fallbackGender,
        series
      })
    }
  })

  return dedupeCharacters(padded)
}

function getAllCharacters(wdb = {}) {
  const custom = Array.isArray(wdb.gachaCustom) ? wdb.gachaCustom : []
  const base = dedupeCharacters([...AVELIA_GACHA_POOL, ...custom])
  return ensureMinimumSeriesSize(base)
}

function sortCharacters(characters, field = 'name') {
  const list = [...characters]
  const sortableField = ['name', 'rarity', 'source', 'role', 'gender', 'series'].includes(field) ? field : 'name'

  list.sort((a, b) => {
    const aStartsWithNumber = /^\d/.test(String(a.name || '').trim())
    const bStartsWithNumber = /^\d/.test(String(b.name || '').trim())

    if (aStartsWithNumber !== bStartsWithNumber) {
      return aStartsWithNumber ? -1 : 1
    }

    const primaryA = String((sortableField === 'name' ? a.name : a[sortableField]) || '').trim().toLowerCase()
    const primaryB = String((sortableField === 'name' ? b.name : b[sortableField]) || '').trim().toLowerCase()

    const primaryResult = primaryA.localeCompare(primaryB, undefined, { numeric: true, sensitivity: 'base' })
    if (primaryResult !== 0) return primaryResult

    return String(a.name || '').trim().localeCompare(String(b.name || '').trim(), undefined, { numeric: true, sensitivity: 'base' })
  })

  return list
}

function filterCharacters(filter, wdb = {}) {
  const normalized = normalizeFlag(filter)
  const pool = getAllCharacters(wdb)
  if (!normalized || normalized === 'all') return pool

  const filterData = AVELIA_GACHA_FILTERS[normalized]
  if (!filterData) return pool

  return pool.filter(item => {
    if (filterData.role && item.role !== filterData.role) return false
    if (filterData.source && item.source !== filterData.source) return false
    if (filterData.gender && item.gender !== filterData.gender) return false
    return true
  })
}

function buildRollText(characters, usedPrefix, filter) {
  let lines = `╭─❏「 🎲 AVELIA GACHA 」❏\n`
  lines += `│ 🔎 Filter: ${filter || 'all'}\n`
  lines += `│ 🎁 Pilih salah satu karakter\n`
  lines += `╰─━━━━━━━━━━━━━━─\n\n`

  characters.forEach((character, index) => {
    const seriesText = character.series ? ` (${character.series})` : ''
    lines += `> *${index + 1}. ${character.name}${seriesText}*\n`
  })

  lines += `\n📌 *Cara claim:*\n`
  lines += `> ↳ ${usedPrefix}avg claim <angka atau nama>\n`
  lines += `> ↳ Pilih tombol karakter di bawah untuk claim cepat.\n`
  lines += `─━━━━━━━━━━━━━━─`

  return lines
}

function buildMansionText(user, page, usedPrefix, options = {}) {
  const owned = Array.isArray(user.gacha?.claimed) ? user.gacha.claimed : []
  const favorites = new Set(Array.isArray(user.gacha?.favoriteIds) ? user.gacha.favoriteIds : [])
  const {
    filterField = '',
    filterValue = '',
    favoriteOnly = false
  } = options

  const filtered = owned
    .filter(entry => {
      if (favoriteOnly && !favorites.has(entry.id)) return false
      if (!filterField || !filterValue) return true
      return matchesSearchValue(entry[filterField] || '', filterValue)
    })
    .sort((a, b) => {
      const aFav = favorites.has(a.id)
      const bFav = favorites.has(b.id)
      if (aFav !== bFav) return aFav ? -1 : 1
      return String(a.nickname || a.name || '').localeCompare(String(b.nickname || b.name || ''), undefined, { numeric: true, sensitivity: 'base' })
    })
  const mansionIndex = new Map(getSortedMansion(user.gacha).map((entry, index) => [entry.id, index + 1]))

  const totalPages = Math.max(1, Math.ceil(filtered.length / 5))
  const safePage = Math.max(1, Number(page) || 1)
  const start = (safePage - 1) * 5
  const sliced = filtered.slice(start, start + 5)

  let cap = `╭─❏「 🏰 AVELIA MANSION 」❏\n`
  cap += `│ 🏰 *DAFTAR KARAKTER*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `📊 *INFORMASI*\n`
  cap += `> ↳ Total claim : ${filtered.length}\n`
  cap += `> ↳ Halaman : ${safePage}/${totalPages}\n`

  if (favoriteOnly) {
    cap += `> ↳ Mode : Favorite only\n`
  }

  if (filterField && filterValue) {
    cap += `> ↳ Filter : ${filterField}=${filterValue}\n`
  }

cap += `\n─━━━━━━━━━━━━━━─\n`

  if (!filtered.length) {
    cap += `📭 Tidak ada karakter yang cocok.\n\n`
  } else {
    sliced.forEach(entry => {
      const actualIndex = mansionIndex.get(entry.id) || 0
      const star = favorites.has(entry.id) ? '⭐ ' : ''
      const seriesText = entry.series ? ` (${entry.series})` : ''
      cap += `> *${actualIndex}. ${star}${entry.nickname || entry.name}${entry.nickname ? ` (${entry.name})` : ''}${seriesText}*\n`
    })
  }

  cap += `\n📄 *Halaman:*\n`
  for (let i = 1; i <= totalPages; i++) {
    let command = `${usedPrefix}avg m ${i}`
    if (favoriteOnly) command = `${usedPrefix}avg m fav ${i}`
    if (filterField && filterValue) command += ` ${filterField} ${filterValue}`
    cap += `> ↳ ${command}\n`
  }

  cap += `─━━━━━━━━━━━━━━─`
  return cap
}

function buildListText(wdb, page, usedPrefix, options = {}) {
  const {
    sortField = 'name',
    filterField = '',
    filterValue = ''
  } = options

  const normalizedFilterField = normalizeFlag(filterField)
  const normalizedFilterValue = normalizeSearchText(filterValue)

  const allCharacters = sortCharacters(getAllCharacters(wdb), sortField)
  const filteredCharacters = allCharacters.filter(character => {
    if (!normalizedFilterField || !normalizedFilterValue) return true

    return matchesSearchValue(character[normalizedFilterField] || '', filterValue)
  })

  const totalPages = Math.max(1, Math.ceil(filteredCharacters.length / 10))
  const safePage = Math.max(1, Number(page) || 1)
  const start = (safePage - 1) * 10
  const sliced = filteredCharacters.slice(start, start + 10)

  let text = `╭─❏「 📚 AVELIA VIEW 」❏\n`
text += `│ 📚 *DAFTAR KARAKTER*\n`
text += `╰─━━━━━━━━━━━━━━─\n\n`

text += `📊 *INFORMASI*\n`
text += `> ↳ Total karakter : ${filteredCharacters.length}\n`
text += `> ↳ Halaman : ${safePage}/${totalPages}\n`
text += `> ↳ Sort : ${sortField}\n`

if (normalizedFilterField && normalizedFilterValue) {
  text += `> ↳ Filter : ${normalizedFilterField}=${normalizedFilterValue}\n`
}

text += `\n─━━━━━━━━━━━━━━─`

  sliced.forEach((character, index) => {
    const listNumber = start + index + 1
    text += `> *${listNumber}. ${character.name}*\n`
    text += `> ↳ ${character.rarity} • ${character.role} • ${character.source} • ${character.series}\n\n`
  })

  text += `📌 *Detail:*\n`
  text += `> ↳ ${usedPrefix}avg info <nama atau nomor>\n\n`
  text += `📄 *Halaman:*\n`
  for (let i = 1; i <= totalPages; i++) {
    let command = `${usedPrefix}avg view ${i}`

    if (sortField !== 'name') {
      command += ` ${sortField}`
    }

    if (normalizedFilterField && normalizedFilterValue) {
      command += ` ${normalizedFilterField} ${filterValue}`
    }

    text += `> ↳ ${command}\n`
  }

  text += `─━━━━━━━━━━━━━━─`
  return text
}

function buildCharacterInfoText(character, usedPrefix) {
  let text = `╭─❏「 ℹ️ AVELIA DETAIL 」❏\n`
  text += `│ ℹ️ *${character.name}*\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  text += `📊 *INFORMASI KARAKTER*\n`
  text += `> ↳ Nama : ${character.name}\n`
  text += `> ↳ ID : ${character.id}\n`
  text += `> ↳ Rarity : ${character.rarity}\n`
  text += `> ↳ Role : ${character.role}\n`
  text += `> ↳ Source : ${character.source}\n`
  text += `> ↳ Gender : ${character.gender}\n`
  text += `> ↳ Series : ${character.series}\n\n`

  text += `📌 *CEK LAGI*\n`
  text += `> ↳ ${usedPrefix}avg info ${character.name}\n`
  text += `> ↳ ${usedPrefix}avg view\n\n`

  text += `─━━━━━━━━━━━━━━─`
  return text
}

function buildTopText(wdb, page, usedPrefix) {
  const rankings = Object.entries(wdb.users || {})
    .map(([jid, userData]) => {
      const user = userData || {}
      const targetUser = user.rpg || {}
      const gacha = getUserGacha(targetUser)
      const owned = Array.isArray(gacha.claimed) ? gacha.claimed : []
      return {
        jid,
        name: user.name || user.pushName || jid.split('@')[0],
        total: owned.length
      }
    })
    .filter(entry => entry.total > 0)
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total
      return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' })
    })

  const totalPages = Math.max(1, Math.ceil(rankings.length / 10))
  const safePage = Math.max(1, Number(page) || 1)
  const start = (safePage - 1) * 10
  const sliced = rankings.slice(start, start + 10)

  let text = `╭─❏「 🏆 AVELIA TOP CLAIMERS 」❏\n`
  text += `│ 📊 Top Gacha Claim\n`
  text += `│ Halaman: ${safePage}/${totalPages}\n`
  text += `╰─━━━━━━━━━━━━━━─\n\n`

  if (!rankings.length) {
    text += `📭 Belum ada pengguna yang punya mansion.\n\n`
  } else {
    sliced.forEach((entry, index) => {
      const listNumber = start + index + 1
      text += `> *${listNumber}. ${entry.name}*\n`
      text += `> ↳ ${entry.total} karakter di mansion\n\n`
    })
  }

  text += `📄 *Halaman:*\n`
  for (let i = 1; i <= totalPages; i++) {
    text += `> ↳ ${usedPrefix}avg top ${i}\n`
  }

  text += `─━━━━━━━━━━━━━━─`
  return text
}

function parseCharacterQuery(query = '') {
  const raw = String(query || '').trim()
  if (!raw) return { nameQuery: '', seriesQuery: '' }

  const match = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (match) {
    return {
      nameQuery: match[1].trim(),
      seriesQuery: match[2].trim()
    }
  }

  return { nameQuery: raw, seriesQuery: '' }
}

function findCharacterCandidates(wdb, query) {
  const chars = getAllCharacters(wdb)
  const raw = String(query || '').trim()
  if (!raw) return []

  const { nameQuery, seriesQuery } = parseCharacterQuery(raw)
  const queryValue = normalizeSearchText(nameQuery || raw)
  const seriesValue = normalizeSearchText(seriesQuery)

  if (/^\d+$/.test(String(nameQuery || raw).trim())) {
    const index = Number(String(nameQuery || raw).trim())
    if (index >= 1 && index <= chars.length) return [chars[index - 1]]
    return []
  }

  return chars.filter(character => {
    const nameMatches = matchesSearchValue(character.name, nameQuery || raw)
      || matchesSearchValue(character.id, nameQuery || raw)
      || matchesSearchValue(character.series, nameQuery || raw)
      || matchesSearchValue(character.role, nameQuery || raw)
      || matchesSearchValue(character.gender, nameQuery || raw)
      || matchesSearchValue(character.source, nameQuery || raw)

    if (!seriesValue) return nameMatches

    return nameMatches && (
      matchesSearchValue(character.series, seriesQuery)
      || matchesSearchValue(character.name, seriesQuery)
    )
  }).sort((a, b) => {
    const aKey = String(a.name || '').trim().toLowerCase()
    const bKey = String(b.name || '').trim().toLowerCase()
    return aKey.localeCompare(bKey, undefined, { numeric: true, sensitivity: 'base' })
  })
}

function findCharacterByQuery(wdb, query) {
  const candidates = findCharacterCandidates(wdb, query)
  return candidates.length === 1 ? candidates[0] : null
}

function findOwnedCharacterCandidates(owned = [], query = '') {
  const raw = String(query || '').trim()
  if (!raw) return []

  const { nameQuery, seriesQuery } = parseCharacterQuery(raw)
  const seriesValue = normalizeSearchText(seriesQuery)

  return owned.filter(entry => {
    const nameMatches = matchesSearchValue(entry.name, nameQuery || raw)
      || matchesSearchValue(entry.id, nameQuery || raw)
      || matchesSearchValue(entry.series, nameQuery || raw)

    if (!seriesValue) return nameMatches

    return nameMatches && (
      matchesSearchValue(entry.series, seriesQuery)
      || matchesSearchValue(entry.name, seriesQuery)
    )
  }).sort((a, b) => {
    const aKey = String(a.name || '').trim().toLowerCase()
    const bKey = String(b.name || '').trim().toLowerCase()
    return aKey.localeCompare(bKey, undefined, { numeric: true, sensitivity: 'base' })
  })
}

function buildAmbiguousSearchText(query, candidates, usedPrefix, commandName = 'avg info') {
  let text = `╭─❏「 ❌ AVELIA GACHA 」❏\n`
  text += `│ Query *${query}* ditemukan lebih dari satu hasil.\n`
  text += `│ Pilih spesifik dengan format berikut:\n`
  candidates.slice(0, 10).forEach((entry, index) => {
    text += `> ↳ ${index + 1}. ${entry.name} (${entry.series})\n`
  })
  text += `\n📌 *Contoh:*\n`
  text += `> ↳ ${usedPrefix}${commandName} ${candidates[0].name} (${candidates[0].series})\n`
  text += `─━━━━━━━━━━━━━━─`
  return text
}

function findRollCandidates(rolledCharacters = [], query = '') {
  const raw = String(query || '').trim()
  if (!raw) return []

  if (/^\d+$/.test(raw)) {
    const index = Number(raw)
    if (index >= 1 && index <= rolledCharacters.length) {
      return [rolledCharacters[index - 1]]
    }
    return []
  }

  const { nameQuery, seriesQuery } = parseCharacterQuery(raw)
  const seriesValue = normalizeSearchText(seriesQuery)

  return rolledCharacters.filter(entry => {
    const nameMatches = matchesSearchValue(entry.name, nameQuery || raw)
      || matchesSearchValue(entry.series, nameQuery || raw)

    if (!seriesValue) return nameMatches

    return nameMatches && (
      matchesSearchValue(entry.series, seriesQuery)
      || matchesSearchValue(entry.name, seriesQuery)
    )
  })
}

function normalizeMansionPaging(input) {
  const raw = normalizeFlag(input)
  if (!raw || raw === 'm') return 1
  if (/^\d+$/.test(raw)) return Number(raw)
  return 1
}

let handler = async (m, { conn, args = [], usedPrefix = '.', command = 'avg', isROwner, isOwner }) => {
  const wdb = loadDB()
  const user = wdb.users?.[m.sender]
  if (!user) {
    return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Kamu belum punya data pengguna.\n│ ↳ Mulai dengan *.adventure*\n╰─━━━━━━━━━━━━━━─`)
  }

  user.rpg = user.rpg || {}
  const gacha = getUserGacha(user.rpg)

  const raw = (args.join(' ') || '').trim()
  const first = normalizeFlag(args[0] || '')
  const second = normalizeFlag(args[1] || '')
  const third = normalizeFlag(args[2] || '')

  if (['menu', 'command', 'commands', 'cmd'].includes(first)) {
    const rows = [
      { title: '🎲 Roll karakter', description: 'Lihat lima karakter pilihan', id: `${usedPrefix}avg` },
      { title: '📚 Daftar pool', description: 'Jelajahi karakter anime dan game', id: `${usedPrefix}avg view` },
      { title: '🔎 Detail karakter', description: 'Cari karakter berdasarkan nama/nomor', id: `${usedPrefix}avg info` },
      { title: '🏰 Mansion-ku', description: 'Lihat dan kelola karakter milikmu', id: `${usedPrefix}avg mansion` },
      { title: '🌟 Profil & title', description: 'Lihat progress koleksi dan title', id: `${usedPrefix}avg profile` },
      { title: '🏆 Leaderboard', description: 'Peringkat kolektor Avelia', id: `${usedPrefix}avg top` },
      { title: '⏳ Cooldown', description: 'Cek kapan roll berikutnya siap', id: `${usedPrefix}avg cd` },
      { title: '📖 Panduan', description: 'Cara bermain dan command lengkap', id: `${usedPrefix}avg guide` }
    ]
    return sendGachaText(conn, m,
      `╭─❏「 ✨ AVELIA GACHA MENU 」❏\n│ Bangun mansion, kumpulkan karakter favoritmu\n╰─━━━━━━━━━━━━━━─\n\n` +
      `🎲 Lima kandidat dalam satu roll · 🏰 koleksi permanen · ⭐ tandai karakter andalan\n\nPilih perjalananmu dari daftar tombol di bawah.`,
      {
        title: '🏰 AVELIA GACHA',
        subtitle: 'Satu roll, lima kesempatan baru',
        sections: [{ title: 'Pusat Gacha', rows }]
      }
    )
  }

  if (['cd', 'cooldown'].includes(first)) {
    const now = Date.now()
    const rollRemaining = Math.max(0, GACHA_COOLDOWN - (now - Number(gacha.lastRollAt || 0)))
    const claimRemaining = Math.max(0, Number(gacha.claimCooldownUntil || 0) - now)
    return sendGachaText(conn, m,
      `╭─❏「 ⏳ AVELIA GACHA COOLDOWN 」❏\n│ JADWAL PULL BERIKUTNYA\n╰─━━━━━━━━━━━━━━─\n\n` +
      `🎲 Roll: *${rollRemaining ? `siap dalam ${formatRemaining(rollRemaining)}` : 'siap digunakan'}*\n` +
      `🎁 Claim: *${claimRemaining ? `${formatRemaining(claimRemaining)} tersisa` : 'tidak ada claim tertunda'}*\n\n` +
      `> ↳ Cooldown roll: 30 menit.\n> ↳ Hasil roll hanya dapat diklaim selama 1 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      { title: '⏳ COOLDOWN GACHA', subtitle: 'Atur waktu sebelum menarik lagi' }
    )
  }

  if (['profile', 'title'].includes(first)) {
    const total = gacha.claimed.length
    const currentTitle = getGachaTitle(total)
    const nextTitle = GACHA_TITLE_MILESTONES.find(milestone => milestone.count > total)
    const seriesCount = new Set(gacha.claimed.map(character => character.series).filter(Boolean)).size
    const details = first === 'title'
      ? `📜 *JALUR TITLE*\n${GACHA_TITLE_MILESTONES.map(milestone => `> ${total >= milestone.count ? '✅' : '🔒'} ${milestone.title} · ${milestone.count} karakter`).join('\n')}`
      : `📚 *PROGRESS MANSION*\n> ↳ Koleksi: ${total} karakter\n> ↳ Series terwakili: ${seriesCount}\n> ↳ Roll hari ini: ${gacha.rolls || 0}\n> ↳ Favorit: ${gacha.favoriteIds.length}`
    return sendGachaText(conn, m,
      `╭─❏「 ${first === 'title' ? '🏅 AVELIA TITLE' : '🌟 PROFIL KOLEKTOR'} 」❏\n│ ${m.pushName || user.name || 'Petualang'}\n╰─━━━━━━━━━━━━━━─\n\n` +
      `✨ Title saat ini: *${currentTitle.title}*\n> ↳ Total claim: ${total}\n` +
      `${nextTitle ? `> ↳ Berikutnya: ${nextTitle.title} · ${nextTitle.count} karakter\n\n` : '\n'}` +
      `${details}\n\n─━━━━━━━━━━━━━━─`,
      {
        title: '🌟 PROFIL AVELIA',
        subtitle: 'Koleksi dan pencapaian mansion',
        sections: [{
          title: 'Jelajahi mansion',
          rows: [
            { title: '🏰 Lihat koleksi', description: 'Buka mansion pribadi', id: `${usedPrefix}avg mansion` },
            { title: '🏅 Tingkatan title', description: 'Lihat seluruh milestone', id: `${usedPrefix}avg title` },
            { title: '🏆 Leaderboard', description: 'Bandingkan koleksi dengan pemain', id: `${usedPrefix}avg top` }
          ]
        }]
      }
    )
  }

  if (first === 'guide') {
    const guide = `╭─❏「 📘 AVELIA GACHA GUIDE 」❏\n` +
      `│ Roll cooldown 30 menit; kesempatan claim berlaku 1 menit.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🎲 *CARA MAIN*\n` +
      `> ↳ ${usedPrefix}avg\n` +
      `> ↳ ${usedPrefix}avg w\n` +
      `> ↳ ${usedPrefix}avg g\n` +
      `> ↳ ${usedPrefix}avg a\n` +
      `> ↳ ${usedPrefix}avg view\n\n` +
      `📚 *LIST & INFO*\n` +
      `> ↳ ${usedPrefix}avg view 1\n` +
      `> ↳ ${usedPrefix}avg info saber\n` +
      `> ↳ ${usedPrefix}avg info 42\n\n` +
      `📌 *CLAIM*\n` +
      `> ↳ ${usedPrefix}avg claim 1\n` +
      `> ↳ ${usedPrefix}avg claim <angka atau nama>\n\n` +
      `🏰 *MANSION*\n` +
      `> ↳ ${usedPrefix}avg mansion\n` +
      `> ↳ ${usedPrefix}avg m 2\n` +
      `> ↳ ${usedPrefix}avg m fav\n` +
      `> ↳ ${usedPrefix}avg m fav add 1\n` +
      `> ↳ ${usedPrefix}avg m rename 1 Nama Baru\n` +
      `> ↳ ${usedPrefix}avg m release 1 (lalu konfirmasi)\n` +
      `> ↳ ${usedPrefix}avg m give 1 @tag\n\n` +
      `🏆 *TOP CLAIMERS*\n` +
      `> ↳ ${usedPrefix}avg top 1\n\n` +
      `🧹 *REMOVE/DIVORCE*\n` +
      `> ↳ ${usedPrefix}avg remove 1 (lalu konfirmasi)\n` +
      `> ↳ ${usedPrefix}avg divorce 2 (lalu konfirmasi)\n\n` +
      `⚙️ *FILTER*\n` +
      `> ↳ w = waifu\n` +
      `> ↳ h = husbando\n` +
      `> ↳ wh = waifu husbu\n` +
      `> ↳ g/wg/hg = game waifu/husbu\n` +
      `> ↳ a/wa/ha = anime waifu/husbu\n` +
      `> ↳ m/wm/hm = male waifu/husbu\n` +
      `> ↳ w/wf/hf = female waifu/husbu\n\n` +
      `🔧 *ADMIN ONLY*\n` +
      `> ↳ ${usedPrefix}avg add <nama karakter> [@user]\n\n` +
      `⚠️ *COOLDOWN*\n` +
      `> ↳ Roll: 30 menit (cek: ${usedPrefix}avg cd)\n` +
      `> ↳ Claim: 1 menit setelah roll\n` +
      `─━━━━━━━━━━━━━━─`

    return sendGachaText(conn, m, guide, {
      title: '📘 PANDUAN AVELIA GACHA',
      subtitle: 'Semua langkah untuk membangun mansion',
      sections: [{
        title: 'Mulai petualangan',
        rows: [
          { title: '🎲 Roll karakter', description: 'Tarik lima kandidat sekaligus', id: `${usedPrefix}avg` },
          { title: '🏰 Mansion', description: 'Lihat dan kelola karakter milikmu', id: `${usedPrefix}avg mansion` },
          { title: '📚 Daftar karakter', description: 'Jelajahi pool karakter', id: `${usedPrefix}avg view` },
          { title: '⏳ Cooldown', description: 'Cek waktu roll berikutnya', id: `${usedPrefix}avg cd` }
        ]
      }]
    })
  }

  if (first === 'add') {
    if (!(isROwner || isOwner)) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Khusus akses RPG panel.\n╰─━━━━━━━━━━━━━━─`)
    }

    const { targetJid, nameArgs } = extractMentionOrReplyTarget(m, args.slice(1))
    const input = nameArgs.join(' ').trim()

    if (!input) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Format: *${usedPrefix}avg add <nama karakter> [@user]*\n╰─━━━━━━━━━━━━━━─`)
    }

    const candidates = findCharacterCandidates(wdb, input)
    if (candidates.length > 1) {
      return m.reply(buildAmbiguousSearchText(input, candidates, usedPrefix, 'avg add'))
    }

    const character = candidates[0]
    if (!character) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Karakter *${input}* tidak ditemukan di pool.\n╰─━━━━━━━━━━━━━━─`)
    }

    const targetUser = wdb.users?.[targetJid] || { rpg: {} }
    targetUser.rpg = targetUser.rpg || {}
    const targetGacha = getUserGacha(targetUser.rpg)

    if (targetGacha.claimedMap[character.id]) {
      return m.reply(`╭─❏「 ⚠️ AVELIA GACHA 」❏\n│ ${character.name} sudah ada di mansion *${targetUser.name || targetJid.split('@')[0]}*.\n╰─━━━━━━━━━━━━━━─`)
    }

    targetGacha.claimedMap[character.id] = true
    targetGacha.claimed.push({ ...character })

    if (!wdb.users?.[targetJid]) {
      wdb.users = wdb.users || {}
      wdb.users[targetJid] = targetUser
    }

    saveDB(wdb)

    return m.reply(`╭─❏「 ✅ AVELIA GACHA 」❏\n│ ${character.name} berhasil ditambahkan ke mansion *${targetUser.name || targetJid.split('@')[0]}*.\n│ ID: ${character.id}\n╰─━━━━━━━━━━━━━━─`)
  }

  if (first === 'list' || first === 'view') {
    const viewArgs = args.slice(1)
    let page = 1
    let sortField = 'name'
    let filterField = ''
    let filterValue = ''

    if (viewArgs[0] && /^\d+$/.test(normalizeFlag(viewArgs[0]))) {
      page = Number(viewArgs.shift())
    }

    if (viewArgs[0] && ['name', 'rarity', 'source', 'role', 'gender', 'series'].includes(normalizeFlag(viewArgs[0]))) {
      sortField = normalizeFlag(viewArgs.shift())
    }

    if (viewArgs.length) {
      filterField = sortField
      filterValue = viewArgs.join(' ')
    }

    return sendGachaText(conn, m, buildListText(wdb, page, usedPrefix, {
      sortField,
      filterField,
      filterValue
    }), {
      title: '📚 AVELIA CHARACTER LIBRARY',
      subtitle: 'Jelajahi dunia anime dan game'
    })
  }

  if (first === 'info' || first === 'detail') {
    const query = args.slice(1).join(' ').trim()
    if (!query) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Format: *${usedPrefix}avg info <nama atau nomor>*\n╰─━━━━━━━━━━━━━━─`)
    }

    const candidates = findCharacterCandidates(wdb, query)
    if (candidates.length > 1) {
      return m.reply(buildAmbiguousSearchText(query, candidates, usedPrefix, 'avg info'))
    }

    const character = candidates[0]
    if (!character) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Karakter dengan query *${query}* tidak ditemukan.\n╰─━━━━━━━━━━━━━━─`)
    }

    return sendGachaText(conn, m, buildCharacterInfoText(character, usedPrefix), {
      title: `✨ ${character.name.toUpperCase()}`,
      subtitle: `${character.rarity} · ${character.series}`,
      sections: [{
        title: 'Lanjutkan eksplorasi',
        rows: [
          { title: '📚 Daftar karakter', description: 'Kembali ke library', id: `${usedPrefix}avg view` },
          { title: '🎲 Roll karakter', description: 'Tarik lima kandidat', id: `${usedPrefix}avg` }
        ]
      }]
    })
  }

  if (['mansion', 'm', 'inv', 'inventory', 'collection'].includes(first)) {
    const mansionArgs = args.slice(1)
    let page = 1
    let favoriteOnly = false
    let filterField = ''
    let filterValue = ''
    let action = ''
    let target = ''
    let idx = 0

    if (['rename', 'release', 'remove', 'divorce', 'give', 'transfer', 'info', 'detail', 'favorite'].includes(normalizeFlag(mansionArgs[0]))) {
      action = normalizeFlag(mansionArgs[0])
      target = mansionArgs.slice(1).join(' ').trim()
      idx = mansionArgs.length
    }

    if (mansionArgs[idx] && /^\d+$/.test(normalizeFlag(mansionArgs[idx]))) {
      page = Number(mansionArgs[idx])
      idx += 1
    }

    if (mansionArgs[idx] && ['fav', 'favorite', 'star'].includes(normalizeFlag(mansionArgs[idx]))) {
      favoriteOnly = true
      idx += 1
    }

    if (mansionArgs[idx] && /^\d+$/.test(normalizeFlag(mansionArgs[idx]))) {
      page = Number(mansionArgs[idx])
      idx += 1
    }

    if (mansionArgs[idx] && ['name', 'rarity', 'source', 'role', 'gender', 'series'].includes(normalizeFlag(mansionArgs[idx]))) {
      filterField = normalizeFlag(mansionArgs[idx])
      filterValue = mansionArgs.slice(idx + 1).join(' ').trim()
      idx = mansionArgs.length
    }

    if (mansionArgs[idx] && ['add', 'remove'].includes(normalizeFlag(mansionArgs[idx]))) {
      const favoriteAction = normalizeFlag(mansionArgs[idx])
      action = favoriteOnly && favoriteAction === 'remove' ? 'removeFavorite' : favoriteAction
      target = mansionArgs.slice(idx + 1).join(' ').trim()
    }

    if (action) {
      const favorites = new Set(Array.isArray(gacha.favoriteIds) ? gacha.favoriteIds : [])
      const owned = Array.isArray(gacha.claimed) ? gacha.claimed : []
      const sortedOwned = getSortedMansion(gacha)
      const targetQuery = action === 'rename' ? normalizeFlag(mansionArgs[1] || '') : target
      const targetCandidates = findOwnedCharacterCandidates(owned, targetQuery)
      const releaseDecision = action === 'release' || action === 'remove' || action === 'divorce'
        ? normalizeFlag(['confirm', 'yes', 'ya', 'cancel', 'no', 'batal'].includes(normalizeFlag(mansionArgs[1] || ''))
          ? mansionArgs[1]
          : mansionArgs[2] || '')
        : ''
      const releasePending = wdb.data.aveliaGachaReleases?.[conn.decodeJid(m.sender)]
      const targetEntry = ['confirm', 'yes', 'ya'].includes(releaseDecision) && releasePending
        ? owned.find(character => character.id === releasePending.characterId)
        : /^\d+$/.test(targetQuery)
          ? sortedOwned[Number(targetQuery) - 1]
          : targetCandidates.length === 1 ? targetCandidates[0] : null

      if (action === 'give' || action === 'transfer') {
        const decision = normalizeFlag(mansionArgs[1] || '')
        if (['accept', 'terima', 'reject', 'tolak'].includes(decision)) {
          const transfers = wdb.data.aveliaGachaTransfers || (wdb.data.aveliaGachaTransfers = {})
          const recipientId = conn.decodeJid(m.sender)
          const pending = transfers[recipientId]
          if (!pending || pending.expiresAt <= Date.now()) {
            delete transfers[recipientId]
            await saveDB(wdb)
            return m.reply('📭 Tidak ada karakter yang menunggu keputusanmu.')
          }
          if (pending.chat !== m.chat) return m.reply('🔒 Hadiah hanya dapat diproses di grup tempat permintaan dikirim.')
          if (decision === 'reject' || decision === 'tolak') {
            delete transfers[recipientId]
            await saveDB(wdb)
            return m.reply('↩️ Hadiah ditolak. Karakter tetap berada di mansion pengirim.')
          }
          const sender = wdb.users?.[pending.from]
          const senderGacha = sender?.rpg?.gacha
          const senderIndex = getClaimedCharacters(senderGacha).findIndex(character => character.id === pending.characterId)
          if (senderIndex < 0) {
            delete transfers[recipientId]
            await saveDB(wdb)
            return m.reply('❌ Hadiah batal karena karakter sudah tidak dimiliki pengirim.')
          }
          normalizeClaimedState(senderGacha)
          senderGacha.favoriteIds = Array.isArray(senderGacha.favoriteIds) ? senderGacha.favoriteIds : []
          const receiverGacha = getUserGacha(user.rpg)
          if (receiverGacha.claimedMap[pending.characterId]) {
            delete transfers[recipientId]
            await saveDB(wdb)
            return m.reply('Karakter tersebut sudah ada di mansion-mu; hadiah tidak dapat diterima dua kali.')
          }
          const [gifted] = senderGacha.claimed.splice(senderIndex, 1)
          delete senderGacha.claimedMap[pending.characterId]
          senderGacha.favoriteIds = senderGacha.favoriteIds.filter(id => id !== pending.characterId)
          receiverGacha.claimed.push(gifted)
          receiverGacha.claimedMap[gifted.id] = true
          delete transfers[recipientId]
          await saveDB(wdb)
          return sendGachaText(conn, m,
            `╭─❏「 🎁 KARAKTER DITERIMA 」❏\n│ ${gifted.nickname || gifted.name} resmi bergabung ke mansion-mu\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Nama, rarity, dan series ikut tersimpan.\n> ↳ Koleksi sekarang: ${receiverGacha.claimed.length} karakter.\n\n─━━━━━━━━━━━━━━─`,
            { title: '🎁 HADIAH DITERIMA', subtitle: 'Mansion-mu bertambah istimewa' }
          )
        }

        const recipient = m.mentionedJid?.[0] || m.quoted?.sender
        const giftIndex = Number(mansionArgs[1]) - 1
        const giftCharacter = Number.isInteger(giftIndex) ? sortedOwned[giftIndex] : null
        if (!giftCharacter || !recipient) {
          return m.reply(`╭─❏「 🎁 BERIKAN KARAKTER 」❏\n│ Bagikan koleksi mansionmu\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Format: *${usedPrefix}avg m give <nomor mansion> @tag*\n> ↳ Bisa juga reply pesan penerima.\n> ↳ Penerima mengonfirmasi dengan *${usedPrefix}avg m give accept* atau *reject*.\n\n─━━━━━━━━━━━━━━─`)
        }
        const recipientId = conn.decodeJid(recipient)
        if (recipientId === conn.decodeJid(m.sender)) return m.reply('🎁 Kamu tidak bisa mengirim hadiah ke dirimu sendiri.')
        const recipientUser = wdb.users?.[recipientId]
        if (!recipientUser?.rpg) return m.reply('Penerima belum memiliki karakter RPG terdaftar.')
        const transfers = wdb.data.aveliaGachaTransfers || (wdb.data.aveliaGachaTransfers = {})
        if (transfers[recipientId]?.expiresAt > Date.now()) return m.reply('Penerima masih memiliki hadiah Avelia yang menunggu keputusan.')
        transfers[recipientId] = {
          from: conn.decodeJid(m.sender),
          characterId: giftCharacter.id,
          chat: m.chat,
          expiresAt: Date.now() + 5 * 60 * 1000
        }
        await saveDB(wdb)
        const giftText = `╭─❏「 🎁 HADIAH AVELIA MENUNGGU 」❏\n│ ${m.pushName || user.name || 'Kolektor'} ingin berbagi\n╰─━━━━━━━━━━━━━━─\n\n` +
          `✨ *${giftCharacter.nickname || giftCharacter.name}* · ${giftCharacter.rarity}\n> ↳ Series: ${giftCharacter.series}\n` +
          `> ↳ Penerima: @${recipientId.split('@')[0]}\n> ↳ Berlaku 5 menit; karakter berpindah setelah diterima.\n\n─━━━━━━━━━━━━━━─`
        return sendGachaText(conn, m, giftText, {
          title: '🎁 HADIAH AVELIA',
          subtitle: 'Pilih terima atau tolak',
          buttons: [
            ['✅ Terima karakter', `${usedPrefix}avg m give accept`],
            ['↩️ Tolak hadiah', `${usedPrefix}avg m give reject`]
          ],
          mentions: [recipientId],
          fallbackText: `${giftText}\n> ↳ Terima: *${usedPrefix}avg m give accept*\n> ↳ Tolak: *${usedPrefix}avg m give reject*`
        })
      }

      if (['release', 'remove', 'divorce'].includes(action) && ['cancel', 'no', 'batal'].includes(releaseDecision)) {
        const releases = wdb.data.aveliaGachaReleases || {}
        delete releases[conn.decodeJid(m.sender)]
        await saveDB(wdb)
        return m.reply('✅ Pelepasan dibatalkan. Karakter tetap aman di mansion.')
      }

      if (!target && ['add', 'remove'].includes(action)) {
        return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Format: *${usedPrefix}avg m fav add <angka atau nama>*\n╰─━━━━━━━━━━━━━━─`)
      }
      if (!targetEntry && ['rename', 'release', 'remove', 'divorce', 'info', 'detail', 'favorite', 'removeFavorite'].includes(action)) {
        const usage = action === 'rename'
          ? `${usedPrefix}avg m rename <nomor mansion> <nama baru>`
          : `${usedPrefix}avg m ${action} <nomor mansion>`
        return m.reply(`Pilih karakter dari mansion terlebih dahulu.\n> ↳ Format: *${usage}*`)
      }

      if (targetCandidates.length > 1 && !/^\d+$/.test(String(target || '').trim())) {
        return m.reply(buildAmbiguousSearchText(target, targetCandidates, usedPrefix, `avg m ${action}`))
      }

      if (!targetEntry) {
        return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Karakter *${target}* tidak ada di mansion kamu.\n╰─━━━━━━━━━━━━━━─`)
      }

      if (action === 'rename') {
        const nickname = mansionArgs.slice(2).join(' ').trim().replace(/[\u0000-\u001f\u007f]/g, '')
        if (!nickname) return m.reply(`Format: *${usedPrefix}avg m rename <nomor mansion> <nama baru>* (maks. 24 karakter).`)
        if (nickname.length > 24) return m.reply('Nama panggilan maksimal 24 karakter.')
        targetEntry.nickname = nickname
        await saveDB(wdb)
        return m.reply(`🏷️ Nama karakter diperbarui menjadi *${nickname}* (${targetEntry.name}).`)
      }

      if (action === 'info' || action === 'detail') {
        return sendGachaText(conn, m, buildCharacterInfoText(targetEntry, usedPrefix), {
          title: `✨ ${targetEntry.nickname || targetEntry.name}`,
          subtitle: `${targetEntry.rarity} · ${targetEntry.series}`
        })
      }

      if (action === 'favorite' || action === 'fav') {
        if (favorites.has(targetEntry.id)) favorites.delete(targetEntry.id)
        else favorites.add(targetEntry.id)
        gacha.favoriteIds = [...favorites]
        await saveDB(wdb)
        return m.reply(`${favorites.has(targetEntry.id) ? '⭐ Ditambahkan ke' : '☆ Dihapus dari'} favorit: *${targetEntry.nickname || targetEntry.name}*.`)
      }

      if (action === 'release' || action === 'remove' || action === 'divorce') {
        const decision = releaseDecision
        const releaseKey = conn.decodeJid(m.sender)
        const releases = wdb.data.aveliaGachaReleases || (wdb.data.aveliaGachaReleases = {})
        const pending = releases[releaseKey]
        if (['confirm', 'yes', 'ya'].includes(decision)) {
          if (!pending || pending.expiresAt <= Date.now()) return m.reply('⌛ Konfirmasi pelepasan tidak ada atau sudah kedaluwarsa.')
          const removeIndex = owned.findIndex(character => character.id === pending.characterId)
          if (removeIndex < 0) return m.reply('Karakter sudah tidak ditemukan di mansion-mu.')
          const [removed] = owned.splice(removeIndex, 1)
          delete gacha.claimedMap[removed.id]
          gacha.favoriteIds = gacha.favoriteIds.filter(id => id !== removed.id)
          delete releases[releaseKey]
          await saveDB(wdb)
          return sendGachaText(conn, m,
            `╭─❏「 🕊️ KARAKTER DILEPAS 」❏\n│ ${removed.nickname || removed.name} kembali ke dunianya\n╰─━━━━━━━━━━━━━━─\n\n` +
            `📖 ${randomGachaStory('release')}\n> ↳ Koleksi tersisa: ${owned.length} karakter.\n\n─━━━━━━━━━━━━━━─`,
            {
              title: '🕊️ PERJALANAN BARU',
              subtitle: 'Kenangan tetap tinggal di mansion',
              sections: [{
                title: 'Lanjutkan',
                rows: [{ title: '🏰 Buka mansion', description: 'Kelola sisa koleksimu', id: `${usedPrefix}avg mansion` }]
              }]
            }
          )
        }
        if (['cancel', 'no', 'batal'].includes(decision)) {
          delete releases[releaseKey]
          await saveDB(wdb)
          return m.reply('✅ Pelepasan dibatalkan. Karakter tetap aman di mansion.')
        }
        releases[releaseKey] = { characterId: targetEntry.id, expiresAt: Date.now() + 2 * 60 * 1000 }
        await saveDB(wdb)
        const releaseText = `╭─❏「 🕊️ KONFIRMASI PELEPASAN 」❏\n│ ${targetEntry.nickname || targetEntry.name} · ${targetEntry.rarity}\n╰─━━━━━━━━━━━━━━─\n\nKarakter ini akan dihapus dari mansion. Konfirmasi berlaku 2 menit.\n\n─━━━━━━━━━━━━━━─`
        return sendGachaText(conn, m, releaseText, {
          title: '🕊️ LEPAS KARAKTER',
          subtitle: 'Pastikan pilihanmu sebelum melanjutkan',
          buttons: [
            ['🕊️ Ya, lepaskan', `${usedPrefix}avg m release confirm`],
            ['↩️ Batalkan', `${usedPrefix}avg m release cancel`]
          ]
        })
      }

      if (action === 'add') {
        favorites.add(targetEntry.id)
        gacha.favoriteIds = [...favorites]
        await saveDB(wdb)
        return m.reply(`╭─❏「 ⭐ AVELIA GACHA 」❏\n│ ${targetEntry.nickname || targetEntry.name} ditambahkan ke favorite.\n╰─━━━━━━━━━━━━━━─`)
      }

      favorites.delete(targetEntry.id)
      gacha.favoriteIds = [...favorites]
      await saveDB(wdb)
      return m.reply(`╭─❏「 ✅ AVELIA GACHA 」❏\n│ ${targetEntry.nickname || targetEntry.name} dihapus dari favorite.\n╰─━━━━━━━━━━━━━━─`)
    }

    const mansionText = buildMansionText(user.rpg, page, usedPrefix, {
      filterField,
      filterValue,
      favoriteOnly
    })
    return sendGachaText(conn, m, mansionText, {
      title: '🏰 AVELIA MANSION',
      subtitle: 'Koleksi karakter dan favoritmu',
      sections: [{
        title: 'Kelola mansion',
        rows: [
          { title: '🌟 Profil', description: 'Lihat progress dan title kolektor', id: `${usedPrefix}avg profile` },
          { title: '⭐ Favorit', description: 'Tampilkan favorit saja', id: `${usedPrefix}avg m fav` },
          { title: '🏷️ Ganti nama', description: 'Beri nama panggilan karakter', id: `${usedPrefix}avg m rename` },
          { title: '🎁 Berikan karakter', description: 'Kirim hadiah ke pemain lain', id: `${usedPrefix}avg m give` },
          { title: '🕊️ Lepaskan karakter', description: 'Kelola karakter dalam mansion', id: `${usedPrefix}avg m release` }
        ]
      }]
    })
  }

  if (first === 'top' || first === 'lb' || first === 'leaderboard') {
    const topPage = Number(args[1] || 1)
    return sendGachaText(conn, m, buildTopText(wdb, topPage, usedPrefix), {
      title: '🏆 AVELIA TOP CLAIMERS',
      subtitle: 'Kolektor mansion terhebat'
    })
  }

  if (first === 'claim' || first === 'c') {
    const targetQuery = args.slice(1).join(' ').trim()
    if (!targetQuery) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Format: *${usedPrefix}avg claim <angka atau nama>*\n╰─━━━━━━━━━━━━━━─`)
    }

    const now = Date.now()
    const claimDeadline = Number(gacha.claimCooldownUntil || 0)
    if (now > claimDeadline) {
      return m.reply(`╭─❏「 ⏳ AVELIA GACHA 」❏\n│ Waktu claim sudah habis.\n│ Roll baru dibutuhkan untuk claim lagi.\n╰─━━━━━━━━━━━━━━─`)
    }

    const lastRoll = Array.isArray(user.rpg.gacha?.lastRoll) ? user.rpg.gacha.lastRoll : []
    const claimCandidates = findRollCandidates(lastRoll, targetQuery)

    if (claimCandidates.length > 1) {
      return m.reply(buildAmbiguousSearchText(targetQuery, claimCandidates, usedPrefix, 'avg claim'))
    }

    const chosen = claimCandidates[0]

    if (!chosen) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Tidak ada karakter *${targetQuery}* di roll terakhir kamu.\n│ ↳ Ketik *.avg* dulu atau pilih angka 1-5.\n╰─━━━━━━━━━━━━━━─`)
    }

    if (gacha.claimedMap[chosen.id]) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ ${chosen.name} sudah ada di mansion kamu.\n╰─━━━━━━━━━━━━━━─`)
    }

    gacha.claimedMap[chosen.id] = true
    gacha.claimed.push(chosen)
    gacha.claimCooldownUntil = 0
    gacha.lastRoll = []

    await saveDB(wdb)

    return sendGachaText(conn, m,
      `╭─❏「 ✅ CLAIM BERHASIL 」❏\n` +
      `│ ✨ *${chosen.name}* bergabung ke mansion\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📋 *DETAIL KARAKTER*\n` +
      `> ↳ Rarity: ${chosen.rarity}\n> ↳ Series: ${chosen.series}\n> ↳ Source: ${chosen.source}\n\n` +
      `📖 ${randomGachaStory('claim')}\n> ↳ Total koleksi: ${gacha.claimed.length} karakter.\n\n─━━━━━━━━━━━━━━─`,
      {
        title: '✨ KARAKTER BERHASIL DI-CLAIM',
        subtitle: `${chosen.rarity} · ${chosen.series}`,
        sections: [{
          title: 'Langkah berikutnya',
          rows: [
            { title: '🏰 Buka mansion', description: 'Lihat karakter yang sudah diklaim', id: `${usedPrefix}avg mansion` },
            { title: '🌟 Profil kolektor', description: 'Cek title dan progress-mu', id: `${usedPrefix}avg profile` }
          ]
        }]
      }
    )
  }

  if (first === 'remove' || first === 'divorce') {
    const targetIndex = Number(second || 0)
    if (!targetIndex || targetIndex < 1) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Pilih angka yang ada di mansion.\n╰─━━━━━━━━━━━━━━─`)
    }

    const targetEntry = getSortedMansion(gacha)[targetIndex - 1]
    if (!targetEntry) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Tidak ada karakter di posisi ${targetIndex}.\n╰─━━━━━━━━━━━━━━─`)
    }

    const releases = wdb.data.aveliaGachaReleases || (wdb.data.aveliaGachaReleases = {})
    releases[conn.decodeJid(m.sender)] = { characterId: targetEntry.id, expiresAt: Date.now() + 2 * 60 * 1000 }
    await saveDB(wdb)
    const releaseText = `╭─❏「 🕊️ KONFIRMASI PELEPASAN 」❏\n│ ${targetEntry.nickname || targetEntry.name} · ${targetEntry.rarity}\n╰─━━━━━━━━━━━━━━─\n\nKarakter ini akan dihapus dari mansion. Konfirmasi berlaku 2 menit.\n\n─━━━━━━━━━━━━━━─`
    return sendGachaText(conn, m, releaseText, {
      title: '🕊️ LEPAS KARAKTER',
      subtitle: 'Pastikan pilihanmu sebelum melanjutkan',
      buttons: [
        ['🕊️ Ya, lepaskan', `${usedPrefix}avg m release confirm`],
        ['↩️ Batalkan', `${usedPrefix}avg m release cancel`]
      ]
    })
  }

  if (!raw || first === 'roll' || first === 'gacha' || first === 'avg' || Object.hasOwn(AVELIA_GACHA_FILTERS, first)) {
    const filter = Object.hasOwn(AVELIA_GACHA_FILTERS, first) ? first : (third || second || '')
    const normalizedFilter = normalizeFlag(filter)

    const now = Date.now()
    const elapsed = now - (gacha.lastRollAt || 0)
    if (elapsed < GACHA_COOLDOWN) {
      const remaining = GACHA_COOLDOWN - elapsed
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      return sendGachaText(conn, m,
        `╭─❏「 ⏳ AVELIA GACHA 」❏\n│ GERBANG GACHA SEDANG MENGISI\n╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Siap kembali dalam *${minutes} menit ${seconds} detik*.\n> ↳ Lihat status dengan *${usedPrefix}avg cd*.\n\n─━━━━━━━━━━━━━━─`,
        { title: '⏳ COOLDOWN AVELIA', subtitle: 'Kesempatan berikutnya segera tiba' }
      )
    }

    const ownedIds = new Set(gacha.claimed.map(character => character.id))
    const pool = filterCharacters(normalizedFilter, wdb)
      .filter(character => !ownedIds.has(character.id))
    if (!pool.length) {
      return m.reply(`✨ Semua karakter dalam filter *${normalizedFilter || 'all'}* sudah ada di mansion-mu. Coba filter lain dengan *${usedPrefix}avg view*.`)
    }
    const candidates = pool.slice()
    const results = []
    while (results.length < Math.min(GACHA_RESULTS, candidates.length)) {
      const index = Math.floor(Math.random() * candidates.length)
      results.push({ ...candidates.splice(index, 1)[0] })
    }

    gacha.lastRollAt = now
    gacha.lastRoll = results
    gacha.claimCooldownUntil = now + CLAIM_DURATION
    gacha.lastRollDate = todayKey()
    gacha.rolls += 1
    user.rpg.gacha = gacha

    saveDB(wdb)

    const text = `${buildRollText(results, usedPrefix, normalizedFilter || 'all')}\n\n📖 ${randomGachaStory('roll')}`
    return sendGachaText(conn, m, text, {
      title: '🎲 AVELIA CHARACTER ROLL',
      subtitle: `${results.length} kandidat menantimu`,
      buttons: results.map((character, index) => [
        `🎁 Claim ${index + 1}. ${character.name}`,
        `${usedPrefix}avg claim ${index + 1}`
      ]),
      fallbackText: `${text}\n\nPilih: ${results.map((character, index) => `*${usedPrefix}avg claim ${index + 1}* · ${character.name}`).join('\n')}`
    })
  }

  const menu = `╭─❏「 🎲 AVELIA GACHA 」❏\n` +
    `│ 5 karakter acak per-roll\n` +
    `│ Roll cooldown: 30 menit\n` +
    `│ Claim window: 1 menit\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *Contoh:*\n` +
    `> ↳ ${usedPrefix}avg\n` +
    `> ↳ ${usedPrefix}avg w\n` +
    `> ↳ ${usedPrefix}avg g\n` +
    `> ↳ ${usedPrefix}avg claim 1\n` +
    `> ↳ ${usedPrefix}avg mansion\n` +
    `> ↳ ${usedPrefix}avg profile\n` +
    `> ↳ ${usedPrefix}avg cd\n\n` +
    `💡 Gunakan ${usedPrefix}avg guide untuk detail lengkap.\n` +
    `─━━━━━━━━━━━━━━─`

  return sendGachaText(conn, m, menu, {
    title: '🏰 AVELIA GACHA',
    subtitle: 'Lima kandidat, satu penghuni mansion',
    sections: [{
      title: 'Pusat Gacha',
      rows: [
        { title: '🎲 Mulai roll', description: 'Tarik lima kandidat karakter', id: `${usedPrefix}avg` },
        { title: '🏰 Mansion', description: 'Lihat dan kelola koleksi', id: `${usedPrefix}avg mansion` },
        { title: '🌟 Profile', description: 'Lihat title dan progress', id: `${usedPrefix}avg profile` },
        { title: '📚 Character list', description: 'Jelajahi seluruh pool', id: `${usedPrefix}avg view` },
        { title: '⏳ Cooldown', description: 'Cek status roll dan claim', id: `${usedPrefix}avg cd` },
        { title: '📖 Guide', description: 'Baca semua command', id: `${usedPrefix}avg guide` }
      ]
    }]
  })
}

handler.help = [
  'avg', 'avg menu', 'avg command', 'avg guide', 'avg roll', 'avg claim <angka atau nama>',
  'avg cd', 'avg cooldown', 'avg profile', 'avg title', 'avg view', 'avg info',
  'avg mansion', 'avg inventory', 'avg inv', 'avg m fav', 'avg m rename', 'avg m release', 'avg m give',
  'avg top', 'avg lb'
]
handler.tags = ['anime']
handler.command = ['avg', 'avelia', 'avelia-gacha']
handler.alias = ['avg', 'avelia']
handler.group = true

export default handler
