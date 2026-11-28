import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as Elaina from '@rexxhayanasi/elaina-baileys'
import * as Baileys from '@whiskeysockets/baileys'
import pb from 'protobufjs/minimal.js'
import { sticker as createSticker } from './sticker.js'
import { extractWaveform, convertToOpus } from './voice-noteData.js'
import { toPTT } from './converter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_REACT_WEBP_PATH = path.resolve(__dirname, '../media/avelia_react.webp')
const DEFAULT_REACT_IMG_PATH = path.resolve(__dirname, '../media/avelia.jpg')
const REACTION_POOL_DIR = path.resolve(__dirname, '../database/reaction_stickers')
const REACTION_MANIFEST_PATH = path.join(REACTION_POOL_DIR, 'manifest.json')
const CDN_CACHE_TTL_MS = 25 * 60 * 1000 // 25 menit cache upload CDN WhatsApp

if (!global.audioStickerCache) {
  global.audioStickerCache = new Map()
}

export function rememberAudioSticker(keys = [], data = {}) {
  if (!global.audioStickerCache) global.audioStickerCache = new Map()
  for (const k of keys) {
    if (!k || typeof k !== 'string') continue
    global.audioStickerCache.set(k, {
      ...data,
      savedAt: Date.now()
    })
  }
  if (global.audioStickerCache.size > 300) {
    const oldestKey = global.audioStickerCache.keys().next().value
    if (oldestKey) global.audioStickerCache.delete(oldestKey)
  }
}

async function getAudioDuration(buffer) {
  try {
    const mm = await import('music-metadata')
    const meta = await mm.parseBuffer(buffer, undefined, { duration: true })
    if (meta?.format?.duration && meta.format.duration > 0 && !isNaN(meta.format.duration)) {
      return Math.max(1, Math.round(meta.format.duration))
    }
  } catch (_) {}
  return 5
}

export async function prepareOpusAudioPayload(audio) {
  const isAlreadyOggOpus = Buffer.isBuffer(audio) &&
    audio.length > 36 &&
    audio.toString('ascii', 0, 4) === 'OggS' &&
    audio.subarray(0, 64).includes('OpusHead')

  let opusBuffer = audio
  if (!isAlreadyOggOpus) {
    try {
      opusBuffer = await convertToOpus(audio)
    } catch {
      try {
        const pttData = await toPTT(audio, 'mp3')
        opusBuffer = pttData?.data || audio
        if (pttData?.delete) pttData.delete().catch(() => {})
      } catch {
        opusBuffer = audio
      }
    }
  }

  const [seconds, waveform] = await Promise.all([
    getAudioDuration(opusBuffer),
    extractWaveform(opusBuffer).catch(() => null)
  ])

  return {
    opusBuffer,
    seconds: seconds || 4,
    waveform: waveform ? new Uint8Array(waveform) : undefined
  }
}

export function patchAudioStickerProtoFull(p) {
  if (p?.Message?.StickerMessage && !p.Message.StickerMessage.__audioStickerFullPatched) {
    const SM = p.Message.StickerMessage
    SM.prototype.audioMessage = null
    SM.prototype.emojis = null

    if (!SM.__audioStickerEncodePatched) {
      const origStickerEncode = SM.encode
      SM.encode = function encode(message, writer) {
        writer = origStickerEncode.call(this, message, writer)
        if (message.audioMessage != null && Object.hasOwnProperty.call(message, 'audioMessage')) {
          p.Message.AudioMessage.encode(message.audioMessage, writer.uint32(210).fork()).ldelim()
        }
        return writer
      }
      SM.__audioStickerEncodePatched = true
    }

    const origStickerDecode = SM.decode
    SM.decode = function decode(r, l, e, n) {
      if (!(r instanceof pb.Reader)) {
        r = pb.Reader.create(r)
      }
      const startPos = r.pos
      const endPos = l === undefined ? r.len : Math.min(r.len, r.pos + l)
      const subBytes = r.buf ? r.buf.subarray(startPos, endPos) : null

      const m = origStickerDecode.call(this, r, l, e, n)

      if (!m.audioMessage && subBytes && subBytes.length > 0) {
        try {
          const subR = pb.Reader.create(subBytes)
          while (subR.pos < subR.len) {
            const tag = subR.uint32()
            const fieldNo = tag >>> 3
            const wireType = tag & 7
            if (fieldNo === 26 && wireType === 2) {
              m.audioMessage = p.Message.AudioMessage.decode(subR, subR.uint32())
            } else if (fieldNo === 25 && wireType === 2 && !m.emojis) {
              m.emojis = subR.string()
            } else {
              subR.skipType(wireType)
            }
          }
        } catch {}
      }
      return m
    }

    const origStickerFromObject = SM.fromObject
    SM.fromObject = function fromObject(d, n) {
      const m = origStickerFromObject.call(this, d, n)
      if (d && d.audioMessage != null && typeof d.audioMessage === 'object') {
        m.audioMessage = p.Message.AudioMessage.fromObject(d.audioMessage)
      }
      if (d && d.emojis != null) {
        m.emojis = String(d.emojis)
      }
      return m
    }

    const origStickerToObject = SM.toObject
    SM.toObject = function toObject(m, o) {
      const d = origStickerToObject.call(this, m, o)
      if (m && m.audioMessage != null && (Object.hasOwnProperty.call(m, 'audioMessage') || m.audioMessage)) {
        d.audioMessage = p.Message.AudioMessage.toObject(m.audioMessage, o)
        if (o && o.oneofs) d._audioMessage = 'audioMessage'
      }
      if (m && m.emojis != null && (Object.hasOwnProperty.call(m, 'emojis') || m.emojis)) {
        d.emojis = m.emojis
        if (o && o.oneofs) d._emojis = 'emojis'
      }
      return d
    }

    SM.__audioStickerFullPatched = true
  }

  if (p?.Message && !p.Message.__audioStickerMsgFullPatched) {
    const M = p.Message
    M.prototype.audioStickerMessage = null

    if (!M.__audioStickerMsgEncodePatched) {
      const origMsgEncode = M.encode
      M.encode = function encode(message, writer) {
        writer = origMsgEncode.call(this, message, writer)
        if (message.audioStickerMessage != null && Object.hasOwnProperty.call(message, 'audioStickerMessage')) {
          p.Message.FutureProofMessage.encode(message.audioStickerMessage, writer.uint32(1074).fork()).ldelim()
        }
        return writer
      }
      M.__audioStickerMsgEncodePatched = true
    }

    const origMsgDecode = M.decode
    M.decode = function decode(r, l, e, n) {
      if (!(r instanceof pb.Reader)) {
        r = pb.Reader.create(r)
      }
      const startPos = r.pos
      const endPos = l === undefined ? r.len : Math.min(r.len, r.pos + l)
      const subBytes = r.buf ? r.buf.subarray(startPos, endPos) : null

      const m = origMsgDecode.call(this, r, l, e, n)

      if (!m.audioStickerMessage && subBytes && subBytes.length > 0) {
        try {
          const subR = pb.Reader.create(subBytes)
          while (subR.pos < subR.len) {
            const tag = subR.uint32()
            const fieldNo = tag >>> 3
            const wireType = tag & 7
            if (fieldNo === 134 && wireType === 2) {
              m.audioStickerMessage = p.Message.FutureProofMessage.decode(subR, subR.uint32())
            } else {
              subR.skipType(wireType)
            }
          }
        } catch {}
      }
      return m
    }

    const origMsgFromObject = M.fromObject
    M.fromObject = function fromObject(d, n) {
      const m = origMsgFromObject.call(this, d, n)
      if (d && d.audioStickerMessage != null && typeof d.audioStickerMessage === 'object') {
        m.audioStickerMessage = p.Message.FutureProofMessage.fromObject(d.audioStickerMessage)
      }
      return m
    }

    const origMsgToObject = M.toObject
    M.toObject = function toObject(m, o) {
      const d = origMsgToObject.call(this, m, o)
      if (m && m.audioStickerMessage != null && (Object.hasOwnProperty.call(m, 'audioStickerMessage') || m.audioStickerMessage)) {
        d.audioStickerMessage = p.Message.FutureProofMessage.toObject(m.audioStickerMessage, o)
        if (o && o.oneofs) d._audioStickerMessage = 'audioStickerMessage'
      }
      return d
    }

    M.__audioStickerMsgFullPatched = true
  }
}

export function ensureAIRichProto() {
  if (Elaina?.proto) {
    patchAudioStickerProtoFull(Elaina.proto)
    if (pb?.roots?.default?.proto) {
      Object.assign(pb.roots.default.proto, Elaina.proto)
      patchAudioStickerProtoFull(pb.roots.default.proto)
    }
    if (Baileys?.proto) {
      Object.assign(Baileys.proto, Elaina.proto)
      patchAudioStickerProtoFull(Baileys.proto)
    }
    if (Baileys?.WAProto) {
      Object.assign(Baileys.WAProto, Elaina.proto)
      patchAudioStickerProtoFull(Baileys.WAProto)
    }
    if (Baileys?.default?.proto) {
      Object.assign(Baileys.default.proto, Elaina.proto)
      patchAudioStickerProtoFull(Baileys.default.proto)
    }
  }
}

ensureAIRichProto()

const { AIRich, decodeAIRich } = Elaina
const prepareWAMessageMedia = Elaina.prepareWAMessageMedia || Baileys.prepareWAMessageMedia
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent
const normalizeMessageContent = Elaina.normalizeMessageContent || Baileys.normalizeMessageContent
const getContentType = Elaina.getContentType || Baileys.getContentType

// ═══════════════════════════════════════════════════════════════════════════
//  OWNER REACTION STICKER POOL MANAGER (Persistent Disk + RAM Cache)
// ═══════════════════════════════════════════════════════════════════════════

function ensurePoolDir() {
  if (!fs.existsSync(REACTION_POOL_DIR)) {
    fs.mkdirSync(REACTION_POOL_DIR, { recursive: true })
  }
}

function loadReactionPoolManifest() {
  if (global.__aveliaReactionPool && Array.isArray(global.__aveliaReactionPool.items)) {
    return global.__aveliaReactionPool
  }
  ensurePoolDir()
  let pool = null
  let manifestFileExisted = false

  try {
    if (fs.existsSync(REACTION_MANIFEST_PATH)) {
      manifestFileExisted = true
      const raw = fs.readFileSync(REACTION_MANIFEST_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.items)) {
        pool = {
          enabled: parsed.enabled !== false,
          items: parsed.items
        }
      }
    }
  } catch (e) {
    console.warn('[ReactionPool] Gagal membaca manifest.json:', e?.message)
  }

  // Auto-Recovery: Jika file manifest.json hilang atau rusak, pulihkan dari cadangan global.db
  if ((!manifestFileExisted || !pool) && global.db?.data?.settings?.reactionStickers?.items?.length) {
    const backup = global.db.data.settings.reactionStickers
    pool = {
      enabled: backup.enabled !== false,
      items: Array.isArray(backup.items) ? backup.items : []
    }
    try {
      fs.writeFileSync(REACTION_MANIFEST_PATH, JSON.stringify(pool, null, 2), 'utf8')
      console.log(`[ReactionPool] Manifest berhasil di-restore dari global.db (${pool.items.length} stiker)`)
    } catch {}
  }

  if (!pool) {
    pool = {
      enabled: true,
      items: []
    }
  }

  // Sinkronkan ke global.db jika manifest ada isi tapi di global.db belum tercatat
  if (pool.items.length > 0 && global.db?.data?.settings && !global.db.data.settings.reactionStickers) {
    global.db.data.settings.reactionStickers = {
      enabled: pool.enabled !== false,
      items: pool.items
    }
  }

  global.__aveliaReactionPool = pool
  return global.__aveliaReactionPool
}

async function saveReactionPoolManifest() {
  ensurePoolDir()
  const pool = loadReactionPoolManifest()
  const cleanItems = pool.items.map(item => ({
    id: item.id,
    name: item.name,
    webpFile: item.webpFile,
    oggFile: item.oggFile || null,
    hasAudio: Boolean(item.hasAudio && item.oggFile),
    isAnimated: Boolean(item.isAnimated),
    seconds: Number(item.seconds) || 4,
    waveform: Array.isArray(item.waveform)
      ? item.waveform
      : (item.waveform instanceof Uint8Array ? Array.from(item.waveform) : undefined),
    emojis: item.emojis || '',
    webpSha256: item.webpSha256 || '',
    addedBy: item.addedBy || '',
    createdAt: item.createdAt || Date.now()
  }))
  const data = JSON.stringify({
    enabled: pool.enabled !== false,
    items: cleanItems
  }, null, 2)
  await fs.promises.writeFile(REACTION_MANIFEST_PATH, data, 'utf8')

  // Dual-Persistence: Simpan juga ke global.db.data.settings.reactionStickers
  try {
    if (global.db && global.db.data) {
      global.db.data.settings = global.db.data.settings || {}
      global.db.data.settings.reactionStickers = {
        enabled: pool.enabled !== false,
        items: cleanItems
      }
    }
  } catch (err) {
    console.warn('[ReactionPool] Gagal sync ke global.db:', err?.message)
  }
}

export function isAutoReactionEnabled() {
  const pool = loadReactionPoolManifest()
  return pool.enabled !== false
}

export async function setAutoReactionEnabled(enabled) {
  const pool = loadReactionPoolManifest()
  pool.enabled = Boolean(enabled)
  await saveReactionPoolManifest()
  return pool.enabled
}

export function listOwnerReactionStickers() {
  const pool = loadReactionPoolManifest()
  return pool.items
}

/**
 * Memuat Buffer WebP dan Opus dari sebuah item di dalam pool (dengan cache RAM)
 */
async function hydratePoolItem(item) {
  if (!item) return null
  ensurePoolDir()

  let webpBuffer = item._webpBuffer
  if (!Buffer.isBuffer(webpBuffer)) {
    const webpPath = path.join(REACTION_POOL_DIR, item.webpFile)
    if (!fs.existsSync(webpPath)) return null
    webpBuffer = await fs.promises.readFile(webpPath)
    item._webpBuffer = webpBuffer
  }

  let opusBuffer = item._opusBuffer
  if (item.hasAudio && item.oggFile && !Buffer.isBuffer(opusBuffer)) {
    const oggPath = path.join(REACTION_POOL_DIR, item.oggFile)
    if (fs.existsSync(oggPath)) {
      opusBuffer = await fs.promises.readFile(oggPath)
      item._opusBuffer = opusBuffer
    }
  }

  return {
    id: item.id,
    name: item.name,
    webpBuffer,
    opusBuffer: opusBuffer || null,
    audioMessage: item._cachedAudioMsg || null,
    emojis: item.emojis || '',
    seconds: item.seconds || 4,
    waveform: item.waveform ? new Uint8Array(item.waveform) : undefined,
    hasAudio: Boolean(opusBuffer || item._cachedAudioMsg),
    isAnimated: Boolean(item.isAnimated),
    _poolItem: item
  }
}

/**
 * Menambahkan stiker baru (atau mengupdate suara pada stiker yang sudah ada di pool) khusus Owner!
 */
export async function addOwnerReactionSticker(mediaBuffer, {
  name = '',
  audioBuffer = null,
  audioData = null,
  targetIndexOrId = null,
  emojis = '',
  addedBy = '',
  packname = global.stickpack || 'Avelia Reaction',
  author = global.stickauth || 'Avelia'
} = {}) {
  ensurePoolDir()
  const pool = loadReactionPoolManifest()

  // Siapkan data audio jika ada
  let resolvedOpus = audioData?.opusBuffer || null
  let resolvedSeconds = audioData?.seconds || 4
  let resolvedWaveform = audioData?.waveform
  let resolvedAudioMsg = audioData?.audioMessage || null

  if (Buffer.isBuffer(audioBuffer) && audioBuffer.length > 32) {
    const prepared = await prepareOpusAudioPayload(audioBuffer)
    resolvedOpus = prepared.opusBuffer
    resolvedSeconds = prepared.seconds
    resolvedWaveform = prepared.waveform
  }

  // Kasus 1: Owner hanya me-reply Audio / Voice Note untuk menambahkan/mengganti suara pada item di pool
  if (!Buffer.isBuffer(mediaBuffer) || mediaBuffer.length < 16) {
    if (!resolvedOpus) {
      throw new Error('Media stiker atau audio tidak valid.')
    }
    let targetItem = null
    if (targetIndexOrId) {
      const idx = Number(targetIndexOrId) - 1
      targetItem = (!isNaN(idx) && pool.items[idx])
        ? pool.items[idx]
        : pool.items.find(x => x.id === String(targetIndexOrId))
    }
    if (!targetItem && global.__ownerLastAddedReactId) {
      targetItem = pool.items.find(x => x.id === global.__ownerLastAddedReactId)
    }
    if (!targetItem && pool.items.length > 0) {
      targetItem = pool.items[pool.items.length - 1]
    }
    if (!targetItem) {
      throw new Error('Belum ada stiker di dalam daftar koleksi! Tambahkan stiker/video terlebih dahulu.')
    }

    const oggFile = `${targetItem.id}.ogg`
    await fs.promises.writeFile(path.join(REACTION_POOL_DIR, oggFile), resolvedOpus)
    targetItem.oggFile = oggFile
    targetItem.hasAudio = true
    targetItem.seconds = resolvedSeconds
    targetItem.waveform = resolvedWaveform ? Array.from(resolvedWaveform) : undefined
    targetItem._opusBuffer = resolvedOpus
    targetItem._uploadedCache = null // Reset CDN cache agar di-upload ulang dengan suara baru
    if (name) targetItem.name = name

    await saveReactionPoolManifest()
    return await hydratePoolItem(targetItem)
  }

  // Kasus 2: Konversi mediaBuffer menjadi WebP jika belum WebP
  let webpBuffer = mediaBuffer
  const isWebP =
    webpBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    webpBuffer.toString('ascii', 8, 12) === 'WEBP'

  if (!isWebP) {
    webpBuffer = await createSticker(webpBuffer, false, packname, author)
  }

  const webpSha256 = crypto.createHash('sha256').update(webpBuffer).digest('base64')
  const isAnimated = Buffer.isBuffer(webpBuffer) && webpBuffer.includes('ANIM')

  // Cek apakah stiker dengan visual SHA-256 yang sama sudah ada di pool (jika ada, update suaranya/namanya agar tidak duplikat)
  let existingItem = pool.items.find(x => x.webpSha256 && x.webpSha256 === webpSha256)
  const id = existingItem ? existingItem.id : `sr_${Date.now().toString(36)}_${crypto.randomBytes(2).toString('hex')}`
  const webpFile = `${id}.webp`
  await fs.promises.writeFile(path.join(REACTION_POOL_DIR, webpFile), webpBuffer)

  let oggFile = existingItem?.oggFile || null
  if (Buffer.isBuffer(resolvedOpus) && resolvedOpus.length > 32) {
    oggFile = `${id}.ogg`
    await fs.promises.writeFile(path.join(REACTION_POOL_DIR, oggFile), resolvedOpus)
  }

  const itemNumber = existingItem ? (pool.items.indexOf(existingItem) + 1) : (pool.items.length + 1)
  const itemObj = existingItem || { id }

  itemObj.name = name || existingItem?.name || `Stiker Reaksi #${itemNumber}`
  itemObj.webpFile = webpFile
  itemObj.oggFile = oggFile
  itemObj.hasAudio = Boolean(oggFile || resolvedAudioMsg)
  itemObj.isAnimated = isAnimated
  itemObj.seconds = resolvedSeconds || existingItem?.seconds || 4
  itemObj.waveform = resolvedWaveform ? Array.from(resolvedWaveform) : existingItem?.waveform
  itemObj.emojis = emojis || audioData?.emojis || existingItem?.emojis || ''
  itemObj.webpSha256 = webpSha256
  itemObj.addedBy = addedBy || existingItem?.addedBy || ''
  itemObj.createdAt = existingItem?.createdAt || Date.now()
  itemObj._webpBuffer = webpBuffer
  itemObj._opusBuffer = resolvedOpus || existingItem?._opusBuffer || null
  itemObj._cachedAudioMsg = resolvedAudioMsg || existingItem?._cachedAudioMsg || null
  itemObj._uploadedCache = null

  if (!existingItem) {
    pool.items.push(itemObj)
  }

  global.__ownerLastAddedReactId = itemObj.id
  await saveReactionPoolManifest()

  if (itemObj.hasAudio) {
    rememberAudioSticker([webpSha256], {
      opusBuffer: itemObj._opusBuffer,
      audioMessage: itemObj._cachedAudioMsg,
      emojis: itemObj.emojis,
      seconds: itemObj.seconds,
      waveform: itemObj.waveform ? new Uint8Array(itemObj.waveform) : undefined
    })
  }

  return await hydratePoolItem(itemObj)
}

/**
 * Menghapus stiker reaksi dari koleksi Owner berdasarkan nomor urut (1-based), ID, atau 'all'
 */
export async function removeOwnerReactionSticker(indexOrId) {
  const pool = loadReactionPoolManifest()
  if (!pool.items.length) {
    return { removedCount: 0, remaining: 0 }
  }

  const targetStr = String(indexOrId || '').trim().toLowerCase()
  if (targetStr === 'all' || targetStr === 'semua') {
    const count = pool.items.length
    for (const item of pool.items) {
      if (item.webpFile) await fs.promises.unlink(path.join(REACTION_POOL_DIR, item.webpFile)).catch(() => {})
      if (item.oggFile) await fs.promises.unlink(path.join(REACTION_POOL_DIR, item.oggFile)).catch(() => {})
    }
    pool.items = []
    await saveReactionPoolManifest()
    return { removedCount: count, remaining: 0, removedName: 'Semua Stiker' }
  }

  const idx = Number(targetStr) - 1
  let removeIndex = (!isNaN(idx) && idx >= 0 && idx < pool.items.length)
    ? idx
    : pool.items.findIndex(x => x.id.toLowerCase() === targetStr)

  if (removeIndex === -1) {
    return { removedCount: 0, remaining: pool.items.length }
  }

  const [removed] = pool.items.splice(removeIndex, 1)
  if (removed?.webpFile) {
    await fs.promises.unlink(path.join(REACTION_POOL_DIR, removed.webpFile)).catch(() => {})
  }
  if (removed?.oggFile) {
    await fs.promises.unlink(path.join(REACTION_POOL_DIR, removed.oggFile)).catch(() => {})
  }

  await saveReactionPoolManifest()
  return {
    removedCount: 1,
    remaining: pool.items.length,
    removedItem: removed
  }
}

/**
 * Mengambil 1 stiker secara ACAK (Random) dari koleksi Owner (anti-repetisi beruntun jika koleksi > 1).
 * Jika argumen specificIndexOrId diisi, ambil stiker nomor tersebut.
 * Jika koleksi kosong, fallback ke stiker default Avelia.
 */
export async function getRandomOwnerReactionSticker(specificIndexOrId = null) {
  const pool = loadReactionPoolManifest()
  if (pool.items.length > 0) {
    if (specificIndexOrId !== null && specificIndexOrId !== undefined && specificIndexOrId !== '') {
      const idx = Number(specificIndexOrId) - 1
      const target = (!isNaN(idx) && pool.items[idx])
        ? pool.items[idx]
        : pool.items.find(x => x.id.toLowerCase() === String(specificIndexOrId).toLowerCase())
      if (target) {
        const hydrated = await hydratePoolItem(target)
        if (hydrated) return hydrated
      }
    }

    // Pilih secara acak (prioritaskan yang tidak sama dengan pilihan terakhir jika jumlah > 1)
    let candidates = pool.items
    if (pool.items.length > 1 && global.__lastPickedReactionStickerId) {
      const filtered = pool.items.filter(x => x.id !== global.__lastPickedReactionStickerId)
      if (filtered.length > 0) candidates = filtered
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    if (picked) {
      global.__lastPickedReactionStickerId = picked.id
      const hydrated = await hydratePoolItem(picked)
      if (hydrated) return hydrated
    }
  }

  return await getDefaultReactionSticker()
}

// Backward-compatible alias
export async function setUserReactionSticker(sender, mediaBuffer, options = {}) {
  return await addOwnerReactionSticker(mediaBuffer, {
    ...options,
    addedBy: sender
  })
}

export async function getDefaultReactionSticker() {
  const pool = loadReactionPoolManifest()
  if (pool.items.length > 0) {
    const picked = pool.items[Math.floor(Math.random() * pool.items.length)]
    const hydrated = await hydratePoolItem(picked)
    if (hydrated) return hydrated
  }

  if (global.__aveliaDefaultReactSticker && Buffer.isBuffer(global.__aveliaDefaultReactSticker)) {
    return { webpBuffer: global.__aveliaDefaultReactSticker, hasAudio: false }
  }
  try {
    if (fs.existsSync(DEFAULT_REACT_WEBP_PATH)) {
      const cached = await fs.promises.readFile(DEFAULT_REACT_WEBP_PATH)
      if (cached.length > 64) {
        global.__aveliaDefaultReactSticker = cached
        return { webpBuffer: cached, hasAudio: false }
      }
    }
    if (fs.existsSync(DEFAULT_REACT_IMG_PATH)) {
      const imgBuf = await fs.promises.readFile(DEFAULT_REACT_IMG_PATH)
      const webpBuf = await createSticker(
        imgBuf,
        false,
        global.stickpack || 'Avelia Reaction',
        global.stickauth || 'Avelia'
      )
      if (Buffer.isBuffer(webpBuf) && webpBuf.length > 64) {
        global.__aveliaDefaultReactSticker = webpBuf
        await fs.promises.writeFile(DEFAULT_REACT_WEBP_PATH, webpBuf).catch(() => {})
        return { webpBuffer: webpBuf, hasAudio: false }
      }
    }
  } catch (err) {
    console.warn('[Default Reaction Sticker Init Warning]:', err?.message || err)
  }
  throw new Error('Belum ada stiker reaksi di koleksi.')
}

/**
 * Mencari data audio (audioMessage / opusBuffer) yang menempel pada sebuah Sound Sticker
 */
export async function extractStickerAudioData(conn, m, targetMsg, webpBuffer = null) {
  let foundAudioMsg = null
  let foundOpusBuf = null
  let foundEmojis = ''
  let foundSeconds = 0
  let foundWaveform = undefined

  const pickFromStickerObj = (stObj) => {
    if (!stObj || typeof stObj !== 'object') return
    if (!foundAudioMsg && stObj.audioMessage && (stObj.audioMessage.url || stObj.audioMessage.directPath || stObj.audioMessage.mediaKey)) {
      foundAudioMsg = stObj.audioMessage
    }
    if (!foundEmojis && stObj.emojis) {
      foundEmojis = stObj.emojis
    }
  }

  const pickFromMessageWrapper = (msgObj) => {
    if (!msgObj || typeof msgObj !== 'object') return
    pickFromStickerObj(msgObj.stickerMessage)
    pickFromStickerObj(msgObj.audioStickerMessage?.message?.stickerMessage)
    pickFromStickerObj(msgObj.associatedChildMessage?.message?.stickerMessage)
    pickFromStickerObj(msgObj.ephemeralMessage?.message?.stickerMessage)
    pickFromStickerObj(msgObj.viewOnceMessage?.message?.stickerMessage)
  }

  pickFromStickerObj(targetMsg)
  pickFromStickerObj(targetMsg?.msg)
  pickFromMessageWrapper(targetMsg?.vM?.message)
  pickFromMessageWrapper(targetMsg?.messages)
  pickFromMessageWrapper(targetMsg?.message)
  pickFromMessageWrapper(m?.msg?.contextInfo?.quotedMessage)
  pickFromMessageWrapper(m?.message?.extendedTextMessage?.contextInfo?.quotedMessage)

  const chatJid = m?.chat || targetMsg?.chat || targetMsg?.key?.remoteJid
  const msgId = targetMsg?.id || targetMsg?.key?.id || targetMsg?.vM?.key?.id || m?.msg?.contextInfo?.stanzaId

  if (!foundAudioMsg && chatJid && msgId) {
    try {
      const storeChat = global.memoryStore?.messages?.[chatJid]
      if (storeChat) {
        const fromStore = typeof storeChat.get === 'function'
          ? storeChat.get(msgId)
          : (Array.isArray(storeChat.array) ? storeChat.array.find(x => x?.key?.id === msgId) : storeChat[msgId])
        if (fromStore?.message) pickFromMessageWrapper(fromStore.message)
      }
      const fromChats = conn?.chats?.[chatJid]?.messages?.[msgId]
      if (fromChats?.message) pickFromMessageWrapper(fromChats.message)
      const fromDb = global.db?.data?.msgs?.[msgId]
      if (fromDb?.message) pickFromMessageWrapper(fromDb.message)
    } catch {}
  }

  const lookupKeys = []
  if (msgId) lookupKeys.push(msgId)
  const rawFileSha = targetMsg?.fileSha256 || targetMsg?.msg?.fileSha256
  if (rawFileSha) {
    lookupKeys.push(typeof rawFileSha === 'string' ? rawFileSha : Buffer.from(rawFileSha).toString('base64'))
  }
  if (Buffer.isBuffer(webpBuffer) && webpBuffer.length > 16) {
    lookupKeys.push(crypto.createHash('sha256').update(webpBuffer).digest('base64'))
  }

  if (global.audioStickerCache) {
    for (const key of lookupKeys) {
      const cached = global.audioStickerCache.get(key)
      if (cached) {
        if (!foundOpusBuf && Buffer.isBuffer(cached.opusBuffer)) foundOpusBuf = cached.opusBuffer
        if (!foundAudioMsg && cached.audioMessage) foundAudioMsg = cached.audioMessage
        if (!foundEmojis && cached.emojis) foundEmojis = cached.emojis
        if (!foundSeconds && cached.seconds) foundSeconds = cached.seconds
        if (!foundWaveform && cached.waveform) foundWaveform = cached.waveform
        break
      }
    }
  }

  if (foundAudioMsg && !foundOpusBuf && conn && typeof conn.downloadM === 'function') {
    try {
      const dlTarget = { ...foundAudioMsg }
      if (typeof dlTarget.mediaKey === 'string') dlTarget.mediaKey = Buffer.from(dlTarget.mediaKey, 'base64')
      if (typeof dlTarget.fileSha256 === 'string') dlTarget.fileSha256 = Buffer.from(dlTarget.fileSha256, 'base64')
      if (typeof dlTarget.fileEncSha256 === 'string') dlTarget.fileEncSha256 = Buffer.from(dlTarget.fileEncSha256, 'base64')
      if (typeof dlTarget.waveform === 'string') dlTarget.waveform = Buffer.from(dlTarget.waveform, 'base64')
      foundAudioMsg = dlTarget

      const dlBuf = await conn.downloadM(dlTarget, 'audio')
      if (Buffer.isBuffer(dlBuf) && dlBuf.length > 32) {
        foundOpusBuf = dlBuf
      }
    } catch (e) {
      console.warn('[extractStickerAudioData] Gagal unduh stream audioMessage, gunakan metadata langsung:', e?.message)
    }
  }

  if (!foundAudioMsg && !foundOpusBuf) {
    return null
  }

  return {
    opusBuffer: foundOpusBuf,
    audioMessage: foundAudioMsg,
    emojis: foundEmojis,
    seconds: foundSeconds || foundAudioMsg?.seconds || 4,
    waveform: foundWaveform || foundAudioMsg?.waveform
  }
}

/**
 * Mengecek apakah sebuah teks sebaiknya dirender menggunakan AIRichResponseMessage
 */
export function shouldUseAIRich(text) {
  if (!text || typeof text !== 'string') return false
  if (/```[\s\S]+?```/.test(text)) return true
  if (/^#{1,3}\s+\S/m.test(text)) return true
  if (/^\|.+\|\s*\n\|[-:\s|]+\|/m.test(text)) return true
  if (text.length > 550) return true
  return false
}

export function parseMarkdownToAIRichBlocks(markdown) {
  if (!markdown || typeof markdown !== 'string') return []

  const blocks = []
  const codeBlockRegex = /```([a-zA-Z0-9_+#.-]*)\r?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const beforeText = markdown.slice(lastIndex, match.index)
    if (beforeText.trim()) {
      blocks.push(...parseNonCodeSegments(beforeText))
    }

    const rawLang = (match[1] || 'javascript').trim().toLowerCase()
    const normalizedLang = normalizeCodeLanguage(rawLang)
    const codeContent = (match[2] || '').replace(/\s+$/, '')

    if (codeContent) {
      blocks.push({
        type: 'code',
        language: normalizedLang,
        content: codeContent
      })
    }

    lastIndex = match.index + match[0].length
  }

  const remainingText = markdown.slice(lastIndex)
  if (remainingText.trim()) {
    blocks.push(...parseNonCodeSegments(remainingText))
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', content: markdown.trim() }]
}

function parseNonCodeSegments(segment) {
  const lines = segment.split(/\r?\n/)
  const result = []
  let textBuffer = []
  let i = 0

  const flushText = () => {
    const joined = textBuffer.join('\n').trim()
    if (joined) {
      result.push({ type: 'text', content: joined })
    }
    textBuffer = []
  }

  while (i < lines.length) {
    const line = lines[i].trim()

    if (
      line.startsWith('|') &&
      line.endsWith('|') &&
      i + 1 < lines.length &&
      /^\|[\s:-]+\|[\s:|-]*$/.test(lines[i + 1].trim())
    ) {
      flushText()
      const tableRows = []
      tableRows.push(parseTableRow(line))
      i += 2

      while (i < lines.length) {
        const rowLine = lines[i].trim()
        if (rowLine.startsWith('|') && rowLine.includes('|')) {
          tableRows.push(parseTableRow(rowLine))
          i++
        } else {
          break
        }
      }

      if (tableRows.length >= 2) {
        result.push({ type: 'table', rows: tableRows })
      }
      continue
    }

    if (/^(?:---+|===+|\*\*\*+)$/.test(line)) {
      i++
      continue
    }

    textBuffer.push(lines[i])
    i++
  }

  flushText()
  return result
}

function parseTableRow(rowStr) {
  return rowStr
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
}

function normalizeCodeLanguage(lang) {
  const map = {
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    node: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    ps1: 'powershell',
    c: 'c',
    'c++': 'cpp',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'golang',
    rs: 'rust',
    kt: 'kotlin',
    rb: 'ruby',
    yml: 'yaml',
    md: 'markdown'
  }
  return map[lang] || lang || 'javascript'
}

function sanitizeQuotedMessage(conn, jid, quoted) {
  if (!quoted) return { cleanQuoted: undefined, cleanQuotedParticipant: undefined }
  try {
    const rawMsg = quoted.message || quoted.vM?.message
    if (!rawMsg) return { cleanQuoted: undefined, cleanQuotedParticipant: undefined }
    const norm = typeof normalizeMessageContent === 'function' ? normalizeMessageContent(rawMsg) : rawMsg
    const cType = typeof getContentType === 'function' ? getContentType(norm) : Object.keys(norm || {})[0]
    if (!cType || !norm?.[cType]) {
      return { cleanQuoted: undefined, cleanQuotedParticipant: undefined }
    }

    let innerContent = norm[cType]
    if (innerContent && typeof innerContent === 'object') {
      innerContent = { ...innerContent }
      delete innerContent.contextInfo
    }

    const fromMe = Boolean(quoted.key?.fromMe ?? quoted.vM?.key?.fromMe ?? quoted.fromMe)
    const cleanQuotedParticipant = fromMe
      ? (conn.user?.jid || conn.user?.id)
      : (quoted.key?.participant || quoted.vM?.key?.participant || quoted.participant || quoted.sender || quoted.key?.remoteJid || jid)

    const cleanQuoted = {
      key: {
        remoteJid: quoted.chat || quoted.key?.remoteJid || jid,
        fromMe,
        id: quoted.key?.id || quoted.id
      },
      message: {
        [cType]: innerContent
      }
    }

    return { cleanQuoted, cleanQuotedParticipant }
  } catch {
    return { cleanQuoted: undefined, cleanQuotedParticipant: undefined }
  }
}

export async function sendAIRichMessage(conn, jid, markdownText, {
  quoted = null,
  title = '',
  footer = '',
  suggestions = [],
  bypassDownload = true
} = {}) {
  if (!conn || !jid || !markdownText) {
    throw new Error('Parameter conn, jid, dan markdownText wajib diisi.')
  }

  ensureAIRichProto()

  if (typeof AIRich !== 'function') {
    return await conn.sendMessage(jid, { text: markdownText }, quoted ? { quoted } : {})
  }

  try {
    const rich = new AIRich(conn, {
      dynamic: true,
      unsupportedTypeAlert: false
    })

    if (title) {
      rich.setTitle(title)
    }

    const blocks = parseMarkdownToAIRichBlocks(markdownText)

    for (const block of blocks) {
      if (block.type === 'code') {
        rich.addCode(block.language || 'javascript', block.content)
      } else if (block.type === 'table' && Array.isArray(block.rows) && block.rows.length > 0) {
        rich.addTable(block.rows)
      } else if (block.content) {
        rich.addText(block.content)
      }
    }

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      rich.addSuggest(suggestions.slice(0, 5))
    }

    if (footer) {
      rich.setFooter(footer)
    }

    const { cleanQuoted, cleanQuotedParticipant } = sanitizeQuotedMessage(conn, jid, quoted)

    const sent = await rich.send(jid, {
      quoted: cleanQuoted,
      quotedParticipant: cleanQuotedParticipant,
      forwarded: true,
      bypassDownload
    })

    return sent
  } catch (err) {
    console.warn('[AIRich Send Error, fallback to standard message]:', err?.message || err)
    return await conn.sendMessage(jid, { text: markdownText }, quoted ? { quoted } : {})
  }
}

/**
 * Mengirim Reaksi/Anotasi Stiker ("1 stiker ditambahkan") ke sebuah pesan menggunakan jalur protokol internal
 * MessageAssociation.AssociationType.STICKER_ANNOTATION (11) dengan dukungan penuh Audio Sticker & Cache Upload CDN!
 */
export async function sendStickerReaction(conn, jid, targetMessage, mediaInput = null, {
  specificIndexOrId = null,
  packname = global.stickpack || 'Avelia Reaction',
  author = global.stickauth || 'Avelia'
} = {}) {
  if (!conn || !jid || !targetMessage) {
    throw new Error('Parameter conn, jid, dan targetMessage wajib valid.')
  }

  ensureAIRichProto()

  let reactEntry = null
  if (mediaInput && typeof mediaInput === 'object' && !Buffer.isBuffer(mediaInput) && Buffer.isBuffer(mediaInput.webpBuffer)) {
    reactEntry = mediaInput
  } else if (Buffer.isBuffer(mediaInput)) {
    const isWebP =
      mediaInput.length > 12 &&
      mediaInput.toString('ascii', 0, 4) === 'RIFF' &&
      mediaInput.toString('ascii', 8, 12) === 'WEBP'
    const webpBuffer = isWebP ? mediaInput : await createSticker(mediaInput, false, packname, author)
    reactEntry = { webpBuffer, hasAudio: false }
  } else {
    reactEntry = await getRandomOwnerReactionSticker(specificIndexOrId)
  }

  const webpBuffer = reactEntry.webpBuffer
  const isAnimated = Boolean(reactEntry.isAnimated ?? (Buffer.isBuffer(webpBuffer) && webpBuffer.includes('ANIM')))
  const poolItem = reactEntry._poolItem

  // Cek CDN Upload Cache (TTL 25 menit) agar reaksi otomatis berjalan instan < 0.1s tanpa upload berulang!
  let uploadedSticker = null
  let audioMsgPayload = null

  if (
    poolItem?._uploadedCache &&
    poolItem._uploadedCache.expiresAt > Date.now() &&
    poolItem._uploadedCache.uploadedSticker?.stickerMessage
  ) {
    uploadedSticker = poolItem._uploadedCache.uploadedSticker
    audioMsgPayload = poolItem._uploadedCache.audioMsgPayload
  } else {
    if (Buffer.isBuffer(reactEntry.opusBuffer) && reactEntry.opusBuffer.length > 32) {
      const [upSt, upAu] = await Promise.all([
        prepareWAMessageMedia(
          { sticker: webpBuffer, isAnimated },
          { upload: conn.waUploadToServer }
        ),
        prepareWAMessageMedia(
          {
            audio: reactEntry.opusBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            seconds: reactEntry.seconds || 4,
            waveform: reactEntry.waveform ? new Uint8Array(reactEntry.waveform) : undefined
          },
          { upload: conn.waUploadToServer }
        ).catch(() => null)
      ])
      uploadedSticker = upSt
      if (upAu?.audioMessage) {
        audioMsgPayload = {
          ...upAu.audioMessage,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true,
          seconds: reactEntry.seconds || 4,
          waveform: reactEntry.waveform ? new Uint8Array(reactEntry.waveform) : undefined
        }
      }
    } else {
      uploadedSticker = await prepareWAMessageMedia(
        { sticker: webpBuffer, isAnimated },
        { upload: conn.waUploadToServer }
      )
    }

    if (!audioMsgPayload && reactEntry.audioMessage && (reactEntry.audioMessage.url || reactEntry.audioMessage.directPath)) {
      audioMsgPayload = {
        ...reactEntry.audioMessage,
        mimetype: reactEntry.audioMessage.mimetype || 'audio/ogg; codecs=opus',
        ptt: true
      }
    }

    if (poolItem && uploadedSticker?.stickerMessage) {
      poolItem._uploadedCache = {
        uploadedSticker,
        audioMsgPayload,
        expiresAt: Date.now() + CDN_CACHE_TTL_MS
      }
    }
  }

  const remoteJid = targetMessage.chat || targetMessage.vM?.key?.remoteJid || targetMessage.key?.remoteJid || jid
  const isGroup = typeof remoteJid === 'string' && remoteJid.endsWith('@g.us')
  const fromMe = Boolean(targetMessage.vM?.key?.fromMe ?? targetMessage.key?.fromMe ?? targetMessage.fromMe)
  const id = targetMessage.vM?.key?.id || targetMessage.key?.id || targetMessage.id
  const rawParticipant =
    targetMessage.vM?.key?.participant ||
    targetMessage.key?.participant ||
    targetMessage.participant ||
    targetMessage.sender

  const targetKey = {
    remoteJid,
    fromMe,
    id,
    ...(isGroup && !fromMe && rawParticipant ? { participant: rawParticipant } : {})
  }

  const messageAssociation = {
    associationType: 11, // STICKER_ANNOTATION = 11
    parentMessageKey: targetKey
  }

  const innerStickerPayload = {
    ...uploadedSticker.stickerMessage,
    isAnimated,
    emojis: reactEntry.emojis || '',
    ...(audioMsgPayload ? { audioMessage: audioMsgPayload } : {})
  }

  const rawPayload = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageSecret: crypto.randomBytes(32),
      messageAssociation
    },
    stickerMessage: innerStickerPayload
  }

  const waMsg = generateWAMessageFromContent(jid, rawPayload, {
    userJid: conn.user?.id || conn.user?.jid
  })

  waMsg.message.messageContextInfo = {
    ...(waMsg.message.messageContextInfo || {}),
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
    messageSecret: waMsg.message.messageContextInfo?.messageSecret || crypto.randomBytes(32),
    messageAssociation
  }

  if (waMsg.message?.stickerMessage) {
    waMsg.message.stickerMessage.emojis = reactEntry.emojis || ''
    if (audioMsgPayload) {
      waMsg.message.stickerMessage.audioMessage = audioMsgPayload
      waMsg.message.audioStickerMessage = {
        message: {
          stickerMessage: waMsg.message.stickerMessage
        }
      }
    }
  }

  await conn.relayMessage(jid, waMsg.message, {
    messageId: waMsg.key.id
  })

  return waMsg
}

// ═══════════════════════════════════════════════════════════════════════════
//  AUTO-COMPLETION STICKER REACTION ENGINE (Untuk Plugin Proses Berat)
// ═══════════════════════════════════════════════════════════════════════════

if (!global.__completedStickerReactMsgIds) {
  global.__completedStickerReactMsgIds = new Set()
}
if (!global.__activeCommandByChat) {
  global.__activeCommandByChat = new Map()
}
if (!global.__activeCommandById) {
  global.__activeCommandById = new Map()
}

export function registerActiveCommandMessage(m) {
  if (!m || !m.chat || !m.key?.id) return
  let stack = global.__activeCommandByChat.get(m.chat)
  if (!Array.isArray(stack)) {
    stack = []
    global.__activeCommandByChat.set(m.chat, stack)
  }
  if (!stack.includes(m)) stack.push(m)
  global.__activeCommandById.set(m.key.id, m)
}

export function unregisterActiveCommandMessage(m) {
  if (!m) return
  if (m.chat) {
    const stack = global.__activeCommandByChat.get(m.chat)
    if (Array.isArray(stack)) {
      const idx = stack.indexOf(m)
      if (idx !== -1) stack.splice(idx, 1)
      if (stack.length === 0) global.__activeCommandByChat.delete(m.chat)
    } else if (stack === m) {
      global.__activeCommandByChat.delete(m.chat)
    }
  }
  if (m.key?.id) {
    global.__activeCommandById.delete(m.key.id)
  }
}

function getLatestActiveCommandInChat(jid) {
  if (!jid || !global.__activeCommandByChat) return null
  const entry = global.__activeCommandByChat.get(jid)
  if (Array.isArray(entry)) {
    return entry.length > 0 ? entry[entry.length - 1] : null
  }
  return entry || null
}

/**
 * Memasang interceptor ringan pada conn.sendMessage dan conn.relayMessage
 * untuk mendeteksi secara presisi apakah sebuah command benar-benar menghasilkan media output
 * atau reaction loading/sukses/error.
 */
export function installAutoReactionSocketHooks(conn) {
  if (!conn) return
  const baseSend = conn.__origSendForSReact || conn.sendMessage
  const baseRelay = conn.__origRelayForSReact || conn.relayMessage
  conn.__origSendForSReact = baseSend
  conn.__origRelayForSReact = baseRelay

  if (typeof baseSend === 'function') {
    conn.sendMessage = async function (jid, content, options = {}) {
      try {
        const targetId = content?.react?.key?.id || options?.quoted?.key?.id || options?.quoted?.id
        const activeM = (targetId && global.__activeCommandById?.get(targetId)) || getLatestActiveCommandInChat(jid)
        if (activeM && content && typeof content === 'object') {
          if (content.react) {
            const rText = String(content.react.text || '')
            if (/[⏳⏱️🔍⚙️🔄]/u.test(rText)) activeM._reactedLoading = true
            else if (/[✅✨☑️✔️]/u.test(rText)) activeM._reactedSuccess = true
            else if (/[❌⚠️✕🚫]/u.test(rText)) activeM._reactedError = true
          }
          if (content.sticker || content.video || content.image || content.audio || content.document) {
            activeM._sentMediaOutput = true
          }
          if (typeof content.text === 'string') {
            if (content.text.includes('〔 ✕') || content.text.includes('ɢ ᴀ ɢ ᴀ ʟ')) {
              activeM._reactedError = true
            }
          }
        }
      } catch {}
      return await baseSend.call(this, jid, content, options)
    }
  }

  if (typeof baseRelay === 'function') {
    conn.relayMessage = async function (jid, message, options = {}) {
      try {
        const activeM = getLatestActiveCommandInChat(jid)
        if (activeM && message && typeof message === 'object') {
          const assocType = message?.messageContextInfo?.messageAssociation?.associationType
          if (assocType !== 11) {
            if (
              message.stickerMessage ||
              message.audioStickerMessage ||
              message.imageMessage ||
              message.videoMessage ||
              message.audioMessage ||
              message.documentMessage ||
              message.albumMessage ||
              message.botForwardedMessage
            ) {
              activeM._sentMediaOutput = true
            }
          }
        }
      } catch {}
      return await baseRelay.call(this, jid, message, options)
    }
  }

  conn.__sreactSocketHookInstalled = true
}

if (global.conn) {
  installAutoReactionSocketHooks(global.conn)
}

// Kategori plugin pemrosesan yang memakan waktu & menghasilkan output
const HEAVY_PROCESSING_PLUGIN_REGEX = /^(sticker|downloader|maker|audio|ai)\//i
const EXCLUDED_COMMANDS_REGEX = /^(sreact|setsreact|addreact|delreact|listreact|reactlist|autoreact|tesrich|rich|airich|richui|aireset|resetai|cekproto|tes)$/i

/**
 * Memicu pengiriman reaction "✅" + Random Audio-Sticker Reaction dari koleksi Owner
 * ketika sebuah plugin pemrosesan selesai mengeksekusi permintaan user.
 */
export async function triggerCompletionStickerReaction(conn, m, {
  pluginName = '',
  command = '',
  elapsedMs = 0
} = {}) {
  try {
    if (!conn || !m || !m.chat || !m.key?.id) return false
    if (!isAutoReactionEnabled()) return false
    if (m.error || m._reactedError || m._stickerReactDone) return false
    if (EXCLUDED_COMMANDS_REGEX.test(command)) return false

    const msgId = m.key.id
    if (global.__completedStickerReactMsgIds.has(msgId)) return false

    const pName = String(pluginName || m.plugin || '')
    const isHeavyCategory = HEAVY_PROCESSING_PLUGIN_REGEX.test(pName)
    const didProcessWork = Boolean(m._sentMediaOutput || m._reactedSuccess || (m._reactedLoading && elapsedMs >= 600))

    // Hanya kirim jika plugin benar-benar menyelesaikan proses (mengirim media / menyelesaikan loading),
    // BUKAN saat hanya menampilkan pesan panduan cara pakai atau pesan peringatan!
    if (!didProcessWork) return false
    if (!isHeavyCategory && !m._reactedLoading && !m._reactedSuccess) return false

    m._stickerReactDone = true
    global.__completedStickerReactMsgIds.add(msgId)
    if (global.__completedStickerReactMsgIds.size > 500) {
      const first = global.__completedStickerReactMsgIds.values().next().value
      if (first) global.__completedStickerReactMsgIds.delete(first)
    }

    // Jika plugin belum memberi reaction ✅ / ✨, berikan ✅ terlebih dahulu
    if (!m._reactedSuccess && typeof m.react === 'function') {
      await m.react('✅').catch(() => {})
    }

    await sendStickerReaction(conn, m.chat, m)
    return true
  } catch (err) {
    console.warn('[Auto Completion Sticker Reaction Warning]:', err?.message || err)
    return false
  }
}

global.__aveliaRichModule = {
  ensureAIRichProto,
  shouldUseAIRich,
  parseMarkdownToAIRichBlocks,
  sendAIRichMessage,
  sendStickerReaction,
  addOwnerReactionSticker,
  removeOwnerReactionSticker,
  listOwnerReactionStickers,
  getRandomOwnerReactionSticker,
  isAutoReactionEnabled,
  setAutoReactionEnabled,
  extractStickerAudioData,
  registerActiveCommandMessage,
  unregisterActiveCommandMessage,
  installAutoReactionSocketHooks,
  triggerCompletionStickerReaction,
  decodeAIRich
}

export { decodeAIRich }
