import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url))
export const TWILY_DATA_FILE = path.join(LIB_DIR, '..', 'json', 'twilyData.json')
export const TWILY_GEN_FILE = TWILY_DATA_FILE

function readTwilyData() {
  try {
    return JSON.parse(fs.readFileSync(TWILY_DATA_FILE, 'utf8'))
  } catch (error) {
    console.warn('[twily] Gagal membaca data JSON:', error.message)
    return { generations: {}, generationDescriptions: {}, admins: [], exAdmins: [], partners: [], newGen: 0, concept: 'Mafia', comeback: '' }
  }
}

const twilyData = readTwilyData()

export const TWILY_GENERATIONS = twilyData.generations || {}

export const TWILY_GEN_DESCRIPTIONS = twilyData.generationDescriptions || {}

export const TWILY_ADMINS = twilyData.admins || []
export const TWILY_EX_ADMINS = twilyData.exAdmins || []
export const TWILY_PARTNERS = twilyData.partners || []
export const TWILY_ML = Array.isArray(twilyData.ml) ? twilyData.ml : []
export const TWILY_WW = Array.isArray(twilyData.ww) ? twilyData.ww : []
export const TWILY_MUSIC = Array.isArray(twilyData.music) ? twilyData.music : []
export const TWILY_PHOTO = Array.isArray(twilyData.photo) ? twilyData.photo : []
export const TWILY_BIRTHDAYS = twilyData.birthdays || {}
export const TWILY_PROFILES = twilyData.profiles || {}
export let TWILY_NEW_GEN = Number.isInteger(twilyData.newGen) ? twilyData.newGen : 0
export let TWILY_CONCEPT = String(twilyData.concept || 'Mafia')
export let TWILY_COMEBACK = String(twilyData.comeback || '')

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
  return TWILY_NEW_GEN
}

export function setTwilyConcept(value) {
  TWILY_CONCEPT = String(value || '').trim() || 'Mafia'
  return TWILY_CONCEPT
}

export function setTwilyComeback(value) {
  TWILY_COMEBACK = String(value || '').trim()
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
  fs.writeFileSync(TWILY_DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

if (migrateTwilyDuplicateNames()) saveTwilyGenerations()
