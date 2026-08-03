import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import ffmpeg from 'fluent-ffmpeg'

const DB_FILE = path.join(process.cwd(), 'waifu_db.json')

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

export function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: {},
      money: {},
      couples: {},
      chars: {},
      status: {},
      pendingPP: {},
      profilePP: {},
      lastMoodTick: {}
    }, null, 2))
  }
  return JSON.parse(fs.readFileSync(DB_FILE))
}

export function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export function getUserRPG(db, jid) {
  if (!db.users) db.users = {}
  if (!db.money) db.money = {}

  if (!db.users[jid]) db.users[jid] = {}

  if (!db.users[jid].rpg) {
    db.users[jid].rpg = {
      level: 1,
      exp: 0,
      darah: 100,
      lastAdventure: 0,
      lastMining: 0,
      lastDungeon: 0,
      diamond: 0,
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

  if (typeof db.money[jid] === 'undefined') {
    db.money[jid] = 1000
  }

  return {
    rpg: db.users[jid].rpg,
    money: db.money[jid]
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


