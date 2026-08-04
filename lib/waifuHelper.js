import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import ffmpeg from 'fluent-ffmpeg'

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
  if (!global.db.data.guilds) global.db.data.guilds = {}

  // Proxy untuk db.money agar db.money[jid] terhubung 100% langsung ke global.db.data.users[jid].money
  const moneyProxy = new Proxy({}, {
    get(target, prop) {
      if (typeof prop !== 'string') return 0
      const user = global.db.data.users[prop]
      return user ? (user.money || 0) : 0
    },
    set(target, prop, value) {
      if (typeof prop !== 'string') return false
      if (!global.db.data.users[prop]) global.db.data.users[prop] = {}
      global.db.data.users[prop].money = Number(value) || 0
      return true
    }
  })

  return {
    users: global.db.data.users,
    money: moneyProxy,
    couples: global.db.data.couples,
    chars: global.db.data.chars,
    status: global.db.data.status,
    pendingPP: global.db.data.pendingPP,
    profilePP: global.db.data.profilePP,
    lastMoodTick: global.db.data.lastMoodTick,
    guilds: global.db.data.guilds
  }
}

export function saveDB(db) {
  if (global.db && typeof global.db.write === 'function') {
    global.db.write().catch(() => {})
  }
}

export function getUserRPG(db, jid) {
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
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

  if (typeof user.money === 'undefined') {
    user.money = 1000
  }

  return {
    rpg: user.rpg,
    money: user.money
  }
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

export async function searchMALCharacter(q) {
  try {
    const url = /^\d+$/.test(q)
      ? `https://api.jikan.moe/v4/characters/${q}`
      : `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q)}&limit=1`

    const { data } = await axios.get(url)
    const c = /^\d+$/.test(q) ? data.data : data.data?.[0]
    if (!c) return null

    return {
      id: c.mal_id,
      nama: c.name,
      image: c.images?.jpg?.image_url
    }
  } catch {
    return null
  }
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
        const res = await fetch(imageUrl)
        if (res.ok) {
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

  if (imageBuffer && imageBuffer.length) {
    return conn.sendFile(m.chat, imageBuffer, 'rpg.jpg', text, m, false, options)
  } else {
    return m.reply(text)
  }
}
