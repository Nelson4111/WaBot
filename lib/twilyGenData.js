/**
 * TWILY Generation & Community Data Module
 * Terhubung langsung ke Supabase Cloud melalui global.db.data.twily
 */

export const TWILY_GENERATIONS = {}
export const TWILY_GEN_DESCRIPTIONS = {}
export const TWILY_ADMINS = []
export const TWILY_EX_ADMINS = []
export const TWILY_PARTNERS = []
export const TWILY_ML = []
export const TWILY_WW = []
export const TWILY_MUSIC = []
export const TWILY_PHOTO = []
export const TWILY_BIRTHDAYS = {}
export const TWILY_PROFILES = {}
export let TWILY_NEW_GEN = 0
export let TWILY_CONCEPT = 'Mafia'
export let TWILY_COMEBACK = ''

/**
 * Sinkronisasi data TWILY dari Supabase Cloud (global.db.data.twily) ke memori aktif
 * @param {boolean} [force=false]
 * @returns {boolean}
 */
export function syncTwilyFromDb(force = false) {
  const source = global.db?.data?.twily
  if (!source || typeof source !== 'object') return false

  // 1. Generasi & Deskripsi
  for (const k of Object.keys(TWILY_GENERATIONS)) delete TWILY_GENERATIONS[k]
  Object.assign(TWILY_GENERATIONS, source.generations || {})

  for (const k of Object.keys(TWILY_GEN_DESCRIPTIONS)) delete TWILY_GEN_DESCRIPTIONS[k]
  Object.assign(TWILY_GEN_DESCRIPTIONS, source.generationDescriptions || {})

  // 2. Daftar Anggota / Tim
  TWILY_ADMINS.length = 0
  TWILY_ADMINS.push(...(Array.isArray(source.admins) ? source.admins : []))

  TWILY_EX_ADMINS.length = 0
  TWILY_EX_ADMINS.push(...(Array.isArray(source.exAdmins) ? source.exAdmins : []))

  TWILY_PARTNERS.length = 0
  TWILY_PARTNERS.push(...(Array.isArray(source.partners) ? source.partners : []))

  TWILY_ML.length = 0
  TWILY_ML.push(...(Array.isArray(source.ml) ? source.ml : []))

  TWILY_WW.length = 0
  TWILY_WW.push(...(Array.isArray(source.ww) ? source.ww : []))

  TWILY_MUSIC.length = 0
  TWILY_MUSIC.push(...(Array.isArray(source.music) ? source.music : []))

  TWILY_PHOTO.length = 0
  TWILY_PHOTO.push(...(Array.isArray(source.photo) ? source.photo : []))

  // 3. Ulang Tahun & Profil
  for (const k of Object.keys(TWILY_BIRTHDAYS)) delete TWILY_BIRTHDAYS[k]
  Object.assign(TWILY_BIRTHDAYS, source.birthdays || {})

  for (const k of Object.keys(TWILY_PROFILES)) delete TWILY_PROFILES[k]
  Object.assign(TWILY_PROFILES, source.profiles || {})

  // 4. Pengaturan Konsep, Comeback, New Gen
  TWILY_NEW_GEN = Number.isInteger(source.newGen) ? source.newGen : 0
  TWILY_CONCEPT = String(source.concept || 'Mafia')
  TWILY_COMEBACK = String(source.comeback || '')

  return true
}

// Inisialisasi awal jika database sudah dimuat di memori
if (typeof global !== 'undefined' && global.db?.data?.twily) {
  syncTwilyFromDb()
}

export function normalizeTwilyGeneration(value = '') {
  const raw = String(value).trim().toUpperCase()
  const numericGenerations = {
    '0': '0',
    '1': 'I',
    '2': 'II',
    '3': 'III',
    '4': 'IV',
    '5': 'V',
    '6': 'VI',
    '7': 'VII',
    '8': 'VIII',
    '9': 'IX',
    '10': 'X'
  }
  if (raw === 'ZERO') return '0'
  if (raw === 'GEN 0') return '0'
  if (Object.prototype.hasOwnProperty.call(numericGenerations, raw)) return numericGenerations[raw]
  const match = raw.match(/^GEN\s+([0-9]+|[IVX]+)$/i)
  return match ? normalizeTwilyGeneration(match[1]) : raw
}

export function parseTwilyBatchInput(args = []) {
  const values = Array.isArray(args) ? args.map(value => String(value).trim()).filter(Boolean) : String(args).split(/\s+/).filter(Boolean)
  if (!values.length) return { names: [], generation: '' }

  let generation = ''
  let parseFrom = values.length

  const lastArg = values.at(-1)
  const normalizedLastArg = normalizeTwilyGeneration(lastArg)
  if (Object.prototype.hasOwnProperty.call(TWILY_GENERATIONS, normalizedLastArg)) {
    generation = normalizedLastArg
    parseFrom = values.length - 1
  } else if (values.length > 1) {
    const secondLastArg = values.at(-2)
    const normalizedSecondLastArg = normalizeTwilyGeneration(secondLastArg)
    if (/^GEN$/i.test(secondLastArg) && Object.prototype.hasOwnProperty.call(TWILY_GENERATIONS, normalizedLastArg)) {
      generation = normalizedLastArg
      parseFrom = values.length - 2
    } else if (/^GEN$/i.test(secondLastArg) && Object.prototype.hasOwnProperty.call(TWILY_GENERATIONS, normalizedSecondLastArg)) {
      generation = normalizedSecondLastArg
      parseFrom = values.length - 2
    }
  }

  const nameInput = values.slice(0, parseFrom).join(' ')
  const names = nameInput
    .split('|')
    .map(name => name.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return { names, generation }
}

export function findTwilyMembers(name = '') {
  const query = String(name).trim().toLowerCase()
  if (!query) return []

  const found = []
  for (const [generation, members] of Object.entries(TWILY_GENERATIONS)) {
    for (const member of members) {
      if (member.toLowerCase() === query) found.push({ name: member, generation })
    }
  }
  return found
}

export function findTwilySuggestions(name = '', limit = 5) {
  const query = String(name).trim().toLowerCase()
  if (!query) return []
  const names = [...new Set(Object.values(TWILY_GENERATIONS).flat())]
  const distance = (left, right) => {
    const row = Array.from({ length: right.length + 1 }, (_, index) => index)
    for (let i = 1; i <= left.length; i++) {
      let previous = row[0]
      row[0] = i
      for (let j = 1; j <= right.length; j++) {
        const current = row[j]
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1))
        previous = current
      }
    }
    return row[right.length]
  }
  return names
    .map(value => ({ value, score: distance(query, value.toLowerCase()) }))
    .sort((a, b) => a.score - b.score || a.value.localeCompare(b.value, 'id'))
    .filter(item => item.score <= Math.max(2, Math.ceil(query.length * 0.45)))
    .slice(0, limit)
    .map(item => item.value)
}

export function formatTwilyGeneration(generation) {
  return generation === '0' ? 'Zero' : generation
}

export function setTwilyNewGen(value) {
  TWILY_NEW_GEN = Math.max(0, Number(value) || 0)
  saveTwilyGenerations()
  return TWILY_NEW_GEN
}

export function setTwilyConcept(value) {
  TWILY_CONCEPT = String(value || '').trim() || 'Mafia'
  saveTwilyGenerations()
  return TWILY_CONCEPT
}

export function setTwilyComeback(value) {
  TWILY_COMEBACK = String(value || '').trim()
  saveTwilyGenerations()
  return TWILY_COMEBACK
}

export function migrateTwilyDuplicateNames() {
  let changed = false

  for (const members of Object.values(TWILY_GENERATIONS)) {
    const usedNames = new Set()
    for (let index = 0; index < members.length; index++) {
      const originalName = String(members[index] || '').trim()
      const baseName = originalName.replace(/\d+$/, '').trim() || originalName
      let candidate = originalName
      let suffix = 1

      while (usedNames.has(candidate.toLowerCase())) {
        candidate = `${baseName}${suffix++}`
      }

      if (candidate !== originalName) {
        members[index] = candidate
        changed = true
      }
      usedNames.add(candidate.toLowerCase())
    }
  }

  return changed
}

export function saveTwilyGenerations() {
  const data = {
    generations: TWILY_GENERATIONS,
    generationDescriptions: TWILY_GEN_DESCRIPTIONS,
    admins: TWILY_ADMINS,
    exAdmins: TWILY_EX_ADMINS,
    partners: TWILY_PARTNERS,
    ml: TWILY_ML,
    ww: TWILY_WW,
    music: TWILY_MUSIC,
    photo: TWILY_PHOTO,
    birthdays: TWILY_BIRTHDAYS,
    profiles: TWILY_PROFILES,
    newGen: TWILY_NEW_GEN,
    concept: TWILY_CONCEPT,
    comeback: TWILY_COMEBACK
  }

  if (global.db?.data) {
    global.db.data.twily = data
    if (typeof global.db.write === 'function') {
      global.db.write().catch(err => {
        console.error('[TWILY] Gagal menyimpan ke Supabase Cloud:', err?.message || err)
      })
    }
  }

  return data
}

