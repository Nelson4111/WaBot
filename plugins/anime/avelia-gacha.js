import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { AVELIA_GACHA_POOL, AVELIA_GACHA_FILTERS } from '../../lib/aveliaGachaData.js'

const GACHA_COOLDOWN = 30 * 60 * 1000
const GACHA_RESULTS = 5
const GACHA_IMAGE = 'https://c.termai.cc/i191/5mcZ5.jpg'
const MANSION_IMAGE = 'https://c.termai.cc/i142/7ZSyq.jpg'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
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
    user.gacha.lastRollAt = 0
    user.gacha.lastRoll = []
    user.gacha.rolls = 0
    user.gacha.claimCooldownUntil = 0
  }

  user.gacha.claimed = Array.isArray(user.gacha.claimed) ? user.gacha.claimed : []
  user.gacha.claimedMap = user.gacha.claimedMap || {}
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
  lines += `> ↳ ${usedPrefix}avg c <angka atau nama>\n`
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
      return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' })
    })

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
    sliced.forEach((entry, index) => {
      const actualIndex = start + index + 1
      const star = favorites.has(entry.id) ? '⭐ ' : ''
      const seriesText = entry.series ? ` (${entry.series})` : ''
      cap += `> *${actualIndex}. ${star}${entry.name}${seriesText}*\n`
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

let handler = async (m, { conn, args, usedPrefix, command, isROwner, isOwner }) => {
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

  if (first === 'guide') {
    const guide = `╭─❏「 📘 AVELIA GACHA GUIDE 」❏\n` +
      `│ Roll gratis, cooldown 30 menit, lalu claim hanya berlaku 1 menit.\n` +
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
      `> ↳ ${usedPrefix}avg c\n\n` +
      `🏰 *MANSION*\n` +
      `> ↳ ${usedPrefix}avg mansion\n` +
      `> ↳ ${usedPrefix}avg m 2\n` +
      `> ↳ ${usedPrefix}avg m fav\n` +
      `> ↳ ${usedPrefix}avg m fav add 1\n\n` +
      `🏆 *TOP CLAIMERS*\n` +
      `> ↳ ${usedPrefix}avg top 1\n\n` +
      `🧹 *REMOVE/DIVORCE*\n` +
      `> ↳ ${usedPrefix}avg remove 1\n` +
      `> ↳ ${usedPrefix}avg divorce 2\n\n` +
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
      `> ↳ Roll: 30 menit\n` +
      `> ↳ Claim: 1 menit setelah roll\n` +
      `─━━━━━━━━━━━━━━─`

    return sendRpgMsg(conn, m, guide, GACHA_IMAGE)
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

    return sendRpgMsg(conn, m, buildListText(wdb, page, usedPrefix, {
      sortField,
      filterField,
      filterValue
    }), GACHA_IMAGE)
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

    return sendRpgMsg(conn, m, buildCharacterInfoText(character, usedPrefix), GACHA_IMAGE)
  }

  if (first === 'mansion' || first === 'm') {
    const mansionArgs = args.slice(1)
    let page = 1
    let favoriteOnly = false
    let filterField = ''
    let filterValue = ''
    let action = ''
    let target = ''
    let idx = 0

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
      action = normalizeFlag(mansionArgs[idx])
      target = mansionArgs.slice(idx + 1).join(' ').trim()
    }

    if (action) {
      if (!target) {
        return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Format: *${usedPrefix}avg m fav add <angka atau nama>*\n╰─━━━━━━━━━━━━━━─`)
      }

      const favorites = new Set(Array.isArray(gacha.favoriteIds) ? gacha.favoriteIds : [])
      const owned = Array.isArray(gacha.claimed) ? gacha.claimed : []
      const targetCandidates = findOwnedCharacterCandidates(owned, target)
      const targetEntry = targetCandidates.find((entry, index) => {
        if (normalizeFlag(index + 1) === normalizeFlag(target)) return true
        return false
      }) || targetCandidates[0]

      if (targetCandidates.length > 1 && !/^\d+$/.test(String(target || '').trim())) {
        return m.reply(buildAmbiguousSearchText(target, targetCandidates, usedPrefix, `avg m ${action}`))
      }

      if (!targetEntry) {
        return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Karakter *${target}* tidak ada di mansion kamu.\n╰─━━━━━━━━━━━━━━─`)
      }

      if (action === 'add') {
        favorites.add(targetEntry.id)
        gacha.favoriteIds = [...favorites]
        saveDB(wdb)
        return m.reply(`╭─❏「 ⭐ AVELIA GACHA 」❏\n│ ${targetEntry.name} ditambahkan ke favorite.\n╰─━━━━━━━━━━━━━━─`)
      }

      favorites.delete(targetEntry.id)
      gacha.favoriteIds = [...favorites]
      saveDB(wdb)
      return m.reply(`╭─❏「 ✅ AVELIA GACHA 」❏\n│ ${targetEntry.name} dihapus dari favorite.\n╰─━━━━━━━━━━━━━━─`)
    }

    return sendRpgMsg(conn, m, buildMansionText(user.rpg, page, usedPrefix, {
      filterField,
      filterValue,
      favoriteOnly
    }), MANSION_IMAGE)
  }

  if (first === 'top') {
    const topPage = Number(args[1] || 1)
    return sendRpgMsg(conn, m, buildTopText(wdb, topPage, usedPrefix), GACHA_IMAGE)
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

    saveDB(wdb)

    return conn.reply(
      m.chat,
      `╭─❏「 ✅ CLAIM BERHASIL 」❏\n` +
      `│ ✅ *${chosen.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📋 *DETAIL KARAKTER*\n` +
      `> ↳ Rarity : ${chosen.rarity}\n` +
      `> ↳ Source : ${chosen.source}\n` +
      `> ↳ ${chosen.name} masuk ke mansion kamu.\n\n` +
      `─━━━━━━━━━━━━━━─`,
      m,
      { mentions: [m.sender] }
    )
  }

  if (first === 'remove' || first === 'divorce') {
    const targetIndex = Number(second || 0)
    if (!targetIndex || targetIndex < 1) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Pilih angka yang ada di mansion.\n╰─━━━━━━━━━━━━━━─`)
    }

    const owned = Array.isArray(gacha.claimed) ? gacha.claimed : []
    if (!owned[targetIndex - 1]) {
      return m.reply(`╭─❏「 ❌ AVELIA GACHA 」❏\n│ Tidak ada karakter di posisi ${targetIndex}.\n╰─━━━━━━━━━━━━━━─`)
    }

    const removed = owned.splice(targetIndex - 1, 1)[0]
    delete gacha.claimedMap[removed.id]
    saveDB(wdb)

    return m.reply(`╭─❏「 ✅ DIHAPUS 」❏\n│ ${removed.name} berhasil di keluarkan dari mansion.\n╰─━━━━━━━━━━━━━━─`)
  }

  if (!raw || first === 'roll' || first === 'gacha' || first === 'avg' || AVELIA_GACHA_FILTERS[first]) {
    const filter = AVELIA_GACHA_FILTERS[first] ? first : (third || second || '')
    const normalizedFilter = normalizeFlag(filter)

    const now = Date.now()
    const elapsed = now - (gacha.lastRollAt || 0)
    if (elapsed < GACHA_COOLDOWN) {
      const remaining = GACHA_COOLDOWN - elapsed
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      return m.reply(`╭─❏「 ⏳ AVELIA GACHA 」❏\n│ Cooldown masih aktif.\n│ Tunggu ${minutes}m ${seconds}d lagi.\n╰─━━━━━━━━━━━━━━─`)
    }

    const pool = filterCharacters(normalizedFilter)
    const results = []
    while (results.length < GACHA_RESULTS) {
      const picked = pickRandom(pool)
      if (!picked) continue
      const clone = { ...picked }
      results.push(clone)
    }

    gacha.lastRollAt = now
    gacha.lastRoll = results
    gacha.claimCooldownUntil = now + 60 * 1000
    gacha.lastRollDate = todayKey()
    gacha.rolls += 1
    user.rpg.gacha = gacha

    saveDB(wdb)

    const text = buildRollText(results, usedPrefix, normalizedFilter || 'all')

    await conn.sendMessage(m.chat, {
      image: { url: GACHA_IMAGE },
      caption: text
    }, { quoted: m })

    return
  }

  const menu = `╭─❏「 🎲 AVELIA GACHA 」❏\n` +
    `│ 5 karakter acak per-roll\n` +
    `│ Roll cooldown: 30 menit\n` +
    `│ Claim cooldown: 1 menit\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *Contoh:*\n` +
    `> ↳ ${usedPrefix}avg\n` +
    `> ↳ ${usedPrefix}avg w\n` +
    `> ↳ ${usedPrefix}avg g\n` +
    `> ↳ ${usedPrefix}avg claim 1\n` +
    `> ↳ ${usedPrefix}avg mansion\n\n` +
    `💡 Gunakan ${usedPrefix}avg guide untuk detail lengkap.\n` +
    `─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, menu, GACHA_IMAGE)
}

handler.help = ['avg', 'avg view', 'avg w', 'avg g', 'avg guide', 'avg mansion', 'avg top', 'avg claim <angka atau nama>']
handler.tags = ['anime']
handler.command = ['avg', 'avelia', 'avelia-gacha']
handler.alias = ['avg', 'avelia']
handler.group = true

export default handler
