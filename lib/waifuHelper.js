import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import ffmpeg from 'fluent-ffmpeg'
import { resolveLid } from './simple.js'

export function getOwnerJids() {
  if (!global.owner) return []
  return global.owner
    .map(v => Array.isArray(v) ? v[0] : v)
    .map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')
}

export async function sendToOwner(conn, content, options = {}) {
  for (const jid of getOwnerJids()) {
    await conn.sendMessage(jid, content, options).catch(() => {})
  }
}

// Single Source of Truth: global.db.data (database.json)
export function loadDB() {
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.couples) global.db.data.couples = {}
  if (!global.db.data.chars) global.db.data.chars = {}
  if (!global.db.data.status) global.db.data.status = {}
  if (!global.db.data.pendingPP) global.db.data.pendingPP = {}
  if (!global.db.data.profilePP) global.db.data.profilePP = {}
  if (!global.db.data.lastMoodTick) global.db.data.lastMoodTick = {}
  if (!global.db.data.waifuCooldown) global.db.data.waifuCooldown = { act: {}, kerja: {} }
  if (!global.db.data.waifuCooldown.act) global.db.data.waifuCooldown.act = {}
  if (!global.db.data.waifuCooldown.kerja) global.db.data.waifuCooldown.kerja = {}
  if (!global.db.data.guilds) global.db.data.guilds = {}
  if (!global.db.data.crime) global.db.data.crime = {}
  if (!global.db.data.penjara) global.db.data.penjara = []
  if (!global.db.data.visitCooldown) global.db.data.visitCooldown = {}
  if (!global.db.data.kaburCooldown) global.db.data.kaburCooldown = {}
  if (!global.db.data.dailyCooldown) global.db.data.dailyCooldown = {}
  if (!global.db.data.talkCooldown) global.db.data.talkCooldown = {}
  if (!global.db.data.prisonStats) global.db.data.prisonStats = {}
  if (!global.db.data.raid) global.db.data.raid = { boss: null, players: [], date: '', history: [] }
  if (!global.db.data.temp) global.db.data.temp = {}

  function createLidProxy(dbTarget) {
    return new Proxy(dbTarget, {
      get(target, prop) {
        if (typeof prop !== 'string') return target[prop]
        if (prop.endsWith('@lid')) prop = typeof resolveLid === 'function' ? resolveLid(prop) : (global.lids?.[prop] || global.db?.data?.lids?.[prop] || prop)
        if (prop.includes('@s.whatsapp.net')) prop = prop.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        const val = target[prop]
        if (val && typeof val === 'object' && val.rpg) {
          linkBankProperties(val)
        }
        return val
      },
      set(target, prop, value) {
        if (typeof prop !== 'string') { target[prop] = value; return true; }
        if (prop.endsWith('@lid')) prop = typeof resolveLid === 'function' ? resolveLid(prop) : (global.lids?.[prop] || global.db?.data?.lids?.[prop] || prop)
        if (prop.includes('@s.whatsapp.net')) prop = prop.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        target[prop] = value
        return true
      }
    })
  }

  // Proxy untuk db.money agar db.money[jid] terhubung 100% langsung ke global.db.data.users[jid].money
  const moneyProxy = new Proxy({}, {
    get(target, prop) {
      if (typeof prop !== 'string') return 0
      if (prop.endsWith('@lid')) prop = typeof resolveLid === 'function' ? resolveLid(prop) : (global.lids?.[prop] || global.db?.data?.lids?.[prop] || prop)
      if (prop.includes('@s.whatsapp.net')) prop = prop.split('@')[0].split(':')[0] + '@s.whatsapp.net'
      const user = global.db.data.users[prop]
      return user ? (user.money || 0) : 0
    },
    set(target, prop, value) {
      if (typeof prop !== 'string') return false
      if (prop.endsWith('@lid')) prop = typeof resolveLid === 'function' ? resolveLid(prop) : (global.lids?.[prop] || global.db?.data?.lids?.[prop] || prop)
      if (prop.includes('@s.whatsapp.net')) prop = prop.split('@')[0].split(':')[0] + '@s.whatsapp.net'
      if (!global.db.data.users[prop]) global.db.data.users[prop] = {}
      global.db.data.users[prop].money = Math.floor(Math.max(0, Number(value) || 0))
      return true
    }
  })

  return {
    users: createLidProxy(global.db.data.users),
    money: moneyProxy,
    couples: createLidProxy(global.db.data.couples),
    chars: createLidProxy(global.db.data.chars),
    status: createLidProxy(global.db.data.status),
    pendingPP: createLidProxy(global.db.data.pendingPP),
    profilePP: createLidProxy(global.db.data.profilePP),
    lastMoodTick: createLidProxy(global.db.data.lastMoodTick),
    cooldown: {
      act: createLidProxy(global.db.data.waifuCooldown.act),
      kerja: createLidProxy(global.db.data.waifuCooldown.kerja)
    },
    guilds: global.db.data.guilds,
    crime: global.db.data.crime,
    penjara: global.db.data.penjara,
    visitCooldown: global.db.data.visitCooldown,
    kaburCooldown: global.db.data.kaburCooldown,
    dailyCooldown: global.db.data.dailyCooldown,
    talkCooldown: global.db.data.talkCooldown,
    prisonStats: global.db.data.prisonStats,
    raid: global.db.data.raid,
    temp: global.db.data.temp
  }
}

export function saveDB(db) {
  if (global.db && typeof global.db.write === 'function') {
    return global.db.write().catch(() => {})
  }
  return Promise.resolve()
}

/**
 * Memperbarui penurunan (decay) status mood dan lapar waifu secara bertahap seiring berjalannya waktu.
 * @param {string} jid 
 */
export function decayWaifuStatus(jid) {
  if (!jid || !global.db?.data) return null
  if (!global.db.data.couples?.[jid]) return null
  if (!global.db.data.status) global.db.data.status = {}
  if (!global.db.data.status[jid]) {
    global.db.data.status[jid] = { mood: 50, lapar: 50, afinitas: 0 }
  }
  if (!global.db.data.lastMoodTick) global.db.data.lastMoodTick = {}

  const now = Date.now()
  const last = global.db.data.lastMoodTick[jid] || now
  const hoursPassed = (now - last) / (1000 * 60 * 60)

  const st = global.db.data.status[jid]
  if (hoursPassed >= 1) {
    const ticks = Math.floor(hoursPassed)
    // Kurangi lapar (tingkat kenyang) sebanyak 2 poin per jam
    st.lapar = Math.max(0, (st.lapar ?? 50) - (ticks * 2))
    // Jika lapar < 20 (kelaparan), mood turun 2 poin per jam
    if (st.lapar < 20) {
      st.mood = Math.max(0, (st.mood ?? 50) - (ticks * 2))
    } else {
      st.mood = Math.max(0, (st.mood ?? 50) - Math.floor(ticks / 2))
    }
    // Majukan lastMoodTick sebanyak ticks jam agar sisa menit tetap tersimpan
    global.db.data.lastMoodTick[jid] = last + (ticks * 60 * 60 * 1000)
    saveDB()
  }
  return st
}

export function getUserRPG(db, jid) {
  if (!jid && typeof db === 'string') {
    jid = db
    db = global.db
  }
  if (!jid) return null

  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users) global.db.data.users = {}

  jid = jid.split('@')[0].split(':')[0] + (jid.includes('@lid') ? '@lid' : '@s.whatsapp.net')
  if (jid.endsWith('@lid')) {
    const resolved = typeof resolveLid === 'function' ? resolveLid(jid) : (global.lids?.[jid] || global.db?.data?.lids?.[jid])
    if (resolved && resolved.endsWith('@s.whatsapp.net')) jid = resolved
  }

  if (!global.db.data.users[jid]) {
    return {
      isDummy: true,
      name: 'Unregistered',
      registered: false,
      money: 0,
      bank: 0,
      level: 0,
      exp: 0,
      limit: 0,
      rpg: null
    }
  }

  const user = global.db.data.users[jid]

  if (!user.rpg) {
    user.rpg = {
      level: user.level || 1,
      exp: user.exp || 0,
      darah: user.health || 100,
      lastAdventure: 0,
      lastMining: 0,
      lastDungeon: 0,
      diamond: user.diamond || 0,
      gold: 0,
      iron: 0,
      stone: 0,
      wood: 0,
      inventory: {},
      pet: {
        tipe: 'none',
        level: 1,
        exp: 0,
        lastFeed: 0
      }
    }
  }

  if (typeof user.money === 'undefined' || user.money < 0) {
    user.money = Math.max(0, Math.floor(user.money || 0))
  } else {
    user.money = Math.floor(user.money)
  }

  // Sanitasi otomatis jika ada resource RPG bernilai minus & pembulatan integer
  if (user.rpg) {
    const rpgResKeys = ['wood', 'stone', 'iron', 'gold', 'diamond', 'emerald', 'darah', 'exp', 'level', 'sword', 'armor', 'pickaxe', 'fishingrod']
    for (let k of rpgResKeys) {
      if (typeof user.rpg[k] === 'number') {
        user.rpg[k] = Math.floor(Math.max(0, user.rpg[k]))
      }
    }
    linkBankProperties(user)
  }

  return {
    rpg: user.rpg,
    money: user.money
  }
}

export function linkBankProperties(user) {
  if (!user || typeof user !== 'object') return
  if (!user.rpg || typeof user.rpg !== 'object') return

  const desc = Object.getOwnPropertyDescriptor(user.rpg, 'bank')
  if (desc && desc.get) return

  let initialBank = 0
  if (typeof user.rpg.bank === 'number' && typeof user.bank === 'number') {
    initialBank = Math.max(user.rpg.bank, user.bank)
  } else if (typeof user.rpg.bank === 'number') {
    initialBank = user.rpg.bank
  } else if (typeof user.bank === 'number') {
    initialBank = user.bank
  }
  user.bank = Math.floor(Math.max(0, Number(initialBank) || 0))

  let initialTier = 0
  if (typeof user.rpg.bankTier === 'number' && typeof user.bankTier === 'number') {
    initialTier = Math.max(user.rpg.bankTier, user.bankTier)
  } else if (typeof user.rpg.bankTier === 'number') initialTier = user.rpg.bankTier
  else if (typeof user.bankTier === 'number') initialTier = user.bankTier
  user.bankTier = Math.floor(Math.max(0, Number(initialTier) || 0))

  let initialBeku = false
  if (typeof user.rpg.kartuBeku === 'boolean') initialBeku = user.rpg.kartuBeku
  else if (typeof user.kartuBeku === 'boolean') initialBeku = user.kartuBeku
  user.kartuBeku = initialBeku

  try {
    Object.defineProperty(user.rpg, 'bank', {
      get() { return user.bank || 0 },
      set(v) { user.bank = Math.floor(Math.max(0, Number(v) || 0)) },
      enumerable: true,
      configurable: true
    })

    Object.defineProperty(user.rpg, 'bankTier', {
      get() { return user.bankTier || 0 },
      set(v) { user.bankTier = Math.floor(Math.max(0, Number(v) || 0)) },
      enumerable: true,
      configurable: true
    })

    Object.defineProperty(user.rpg, 'kartuBeku', {
      get() { return Boolean(user.kartuBeku) },
      set(v) { user.kartuBeku = Boolean(v) },
      enumerable: true,
      configurable: true
    })
  } catch (_) {}
}

export function initLadang(user) {
  if (!user) return
  if (user.maxLadang === undefined) user.maxLadang = 1
  if (typeof user.ladang !== 'object' || Array.isArray(user.ladang) || user.ladang === null) {
    user.ladang = {} 
  }
  
  if (typeof user.hasilKebun !== 'object' || user.hasilKebun === null) {
    user.hasilKebun = {}
  }
  
  return user
}

export async function uploadCatbox(filePath) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', fs.createReadStream(filePath))
  
  try {
    const { data } = await axios.post(
      'https://catbox.moe/user/api.php',
      form,
      { headers: form.getHeaders() }
    )
    return data || null 
  } catch {
    return null
  }
}

/**
 * Mengambil detail karakter langsung dari halaman resmi MyAnimeList (MAL) menggunakan ID numerik.
 * Menghindari 404 pada AniList akibat perbedaan ID dan mengatasi 504 timeout pada Jikan Moe.
 * @param {string|number} id - UID resmi MyAnimeList
 * @returns {Promise<{id: number, nama: string, image: string|null}|null>}
 */
export async function fetchMALCharacterDirect(id) {
  const cleanId = String(id).trim()
  if (!/^\d+$/.test(cleanId)) return null

  try {
    const res = await axios.get(`https://myanimelist.net/character/${cleanId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 8000
    })
    const html = res.data
    if (!html || html.includes('404 Not Found') || html.includes('No character found')) {
      return null
    }

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const rawTitle = titleMatch ? titleMatch[1].replace('- MyAnimeList.net', '').trim() : ''
    if (!rawTitle) return null

    let charName = rawTitle
    const nameMatch = rawTitle.match(/^([^(]+)\s*\(([^)]+)\)$/)
    if (nameMatch) {
      charName = `${nameMatch[1].trim()} (${nameMatch[2].trim()})`
    }

    const imgMatch = html.match(/https:\/\/cdn\.myanimelist\.net\/images\/characters\/[0-9]+\/[0-9]+\.(?:jpg|jpeg|png|webp)/i)

    return {
      id: parseInt(cleanId),
      nama: charName || `Character #${cleanId}`,
      image: imgMatch ? imgMatch[0] : null
    }
  } catch (err) {
    return null
  }
}

/**
 * Mencari karakter waifu berdasarkan nama atau UID MyAnimeList/AniList.
 * @param {string} q 
 * @returns {Promise<{id: number, nama: string, image: string|null}|null>}
 */
export async function searchMALCharacter(q) {
  if (!q) return null
  const cleanQ = String(q).trim()
  const isId = /^\d+$/.test(cleanQ)

  // 1. JIKA INPUT BERUPA UID ANGKA (Prioritaskan Scraper Resmi MyAnimeList)
  if (isId) {
    const direct = await fetchMALCharacterDirect(cleanQ)
    if (direct) return direct

    // Fallback Jikan Moe API
    try {
      const { data } = await axios.get(`https://api.jikan.moe/v4/characters/${encodeURIComponent(cleanQ)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 5000
      })
      const c = data?.data
      if (c && c.name) {
        return {
          id: c.mal_id,
          nama: c.name,
          image: c.images?.jpg?.image_url || null
        }
      }
    } catch {}

    // Fallback AniList by ID (jika user memasukkan ID internal AniList)
    try {
      const query = `
        query ($id: Int) {
          Character(id: $id) {
            id
            name { full native }
            image { large medium }
          }
        }
      `
      const res = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { id: parseInt(cleanQ) }
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 6000
      })
      const char = res.data?.data?.Character
      if (char) {
        return {
          id: char.id,
          nama: char.name?.full || char.name?.native || `Character #${cleanQ}`,
          image: char.image?.large || char.image?.medium || null
        }
      }
    } catch {}

    return null
  }

  // 2. JIKA INPUT BERUPA NAMA KARAKTER
  // 2a. Coba AniList GraphQL Search (Cepat & database nama sangat lengkap)
  try {
    const query = `
      query ($search: String) {
        Character(search: $search) {
          id
          name { full native }
          image { large medium }
        }
      }
    `
    const res = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: cleanQ }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 7000
    })
    const char = res.data?.data?.Character
    if (char) {
      return {
        id: char.id,
        nama: char.name?.full || char.name?.native || cleanQ,
        image: char.image?.large || char.image?.medium || null
      }
    }
  } catch (e) {
    console.warn('[AniList Search Failed]:', e.message)
  }

  // 2b. Fallback Jikan Moe Character Search
  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(cleanQ)}&limit=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 6000
    })
    const c = data?.data?.[0]
    if (c) {
      return {
        id: c.mal_id,
        nama: c.name,
        image: c.images?.jpg?.image_url || null
      }
    }
  } catch (e) {
    console.warn('[Jikan Search Failed]:', e.message)
  }

  return null
}

export function convertToGif(input, output) {
  return new Promise(resolve => {
    ffmpeg(input)
      .outputOptions(['-vf scale=320:-1', '-r 12'])
      .toFormat('gif')
      .save(output)
      .on('end', () => resolve(output))
      .on('error', () => resolve(null))
  })
}

export async function sendRpgMsg(conn, m, text, imageUrl, options = {}) {
  let thumbBuffer = null
  if (imageUrl) {
    try {
      if (Buffer.isBuffer(imageUrl)) {
        thumbBuffer = imageUrl
      } else if (typeof imageUrl === 'string') {
        const res = await fetch(imageUrl, { signal: AbortSignal.timeout(3000) }).catch(() => null)
        if (res && res.ok) {
          thumbBuffer = Buffer.from(await res.arrayBuffer())
        }
      }
    } catch (e) {}
  }

  let imageBuffer = thumbBuffer
  if (thumbBuffer && thumbBuffer.length) {
    try {
      imageBuffer = await (await import('sharp')).default(thumbBuffer)
        .resize({ width: 720, height: 405, fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()
    } catch (_) {
      imageBuffer = thumbBuffer
    }
  }

  const mentions = options.mentions || options.contextInfo?.mentionedJid || []

  if (imageBuffer && imageBuffer.length) {
    return conn.sendFile(m.chat, imageBuffer, 'rpg.jpg', text, m, false, { mentions, ...options })
  } else {
    return conn.sendMessage(m.chat, { text, mentions: mentions.length ? mentions : undefined }, { quoted: m })
  }
}

export function getEquipmentName(type, level = 0) {
  if (!level || level <= 0) return 'None'
  const names = {
    sword: [
      'Wooden Sword',
      'Stone Sword',
      'Iron Sword',
      'Steel Longsword',
      'Golden Saber',
      'Platinum Blade',
      'Diamond Sword',
      'Obsidian Katana',
      'Titanium Broadsword',
      'Netherite Greatsword',
      'Cobalt Cleaver',
      'Aetherial Rapier',
      'Void Slayer',
      'Celestial Excalibur',
      'Divine God Blade'
    ],
    armor: [
      'Leather Tunic',
      'Wooden Cuirass',
      'Iron Chainmail',
      'Steel Plate Armor',
      'Golden Aegis',
      'Platinum Vest',
      'Diamond Chestplate',
      'Obsidian Bulwark',
      'Titanium Fortress',
      'Netherite Dragon Armor',
      'Cobalt Ward',
      'Aetherial Cloak',
      'Void Aegis',
      'Celestial Divine Armor',
      'Immortal Sovereign Armor'
    ],
    pickaxe: [
      'Wooden Pickaxe',
      'Stone Pickaxe',
      'Iron Pickaxe',
      'Steel Pickaxe',
      'Golden Pickaxe',
      'Platinum Pickaxe',
      'Diamond Pickaxe',
      'Obsidian Drill',
      'Titanium Excavator',
      'Netherite Breaker',
      'Cobalt Core Pickaxe',
      'Aetherial Smasher',
      'Void World Eater',
      'Celestial Galaxy Pickaxe',
      'Cosmic Annihilator'
    ],
    fishingrod: [
      'Bamboo Fishing Rod',
      'Wooden Fishing Rod',
      'Fiberglass Rod',
      'Iron Telescopic Rod',
      'Golden Reel Rod',
      'Platinum Master Rod',
      'Diamond Lure Rod',
      'Obsidian Deep-Sea Rod',
      'Titanium Harpoon Rod',
      'Netherite Kraken Catcher',
      'Cobalt Siren Rod',
      'Aetherial Ocean Rod',
      'Void Leviathan Rod',
      'Celestial Poseidon Trident',
      'God of The Seven Seas'
    ]
  }

  let list = names[type] || []
  let idx = Math.min(level - 1, list.length - 1)
  let baseName = list[idx] || `${type.toUpperCase()} (Lv.${level})`
  return `${baseName} (Lv.${level})`
}

