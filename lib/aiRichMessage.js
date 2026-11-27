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

// Sinkronisasi seluruh instance proto (Baileys.proto, Baileys.WAProto, pb.roots.default.proto, Elaina.proto)
// sekaligus memasang patch decode/encode/fromObject/toObject untuk audioMessage pada StickerMessage
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

if (!global.userStickerReact) {
  global.userStickerReact = {}
}

/**
 * Mencari data audio (audioMessage / opusBuffer) yang menempel pada sebuah Sound Sticker
 * dari berbagai sumber (quoted stanza, memoryStore, conn.chats, db.data.msgs, dan global.audioStickerCache).
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

  // 1. Cek langsung dari objek pesan / quoted stanza
  pickFromStickerObj(targetMsg)
  pickFromStickerObj(targetMsg?.msg)
  pickFromMessageWrapper(targetMsg?.vM?.message)
  pickFromMessageWrapper(targetMsg?.messages)
  pickFromMessageWrapper(targetMsg?.message)
  pickFromMessageWrapper(m?.msg?.contextInfo?.quotedMessage)
  pickFromMessageWrapper(m?.message?.extendedTextMessage?.contextInfo?.quotedMessage)

  // 2. Cek dari pesan asli (unflattened) di memoryStore, conn.chats, dan global.db.data.msgs
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

  // 3. Cek dari global.audioStickerCache (berdasarkan msgId, fileSha256, atau SHA-256 buffer WebP)
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

  // 4. Jika ditemukan audioMessage dari WhatsApp namun belum ada opusBuffer di RAM, unduh buffer audionya
  if (foundAudioMsg && !foundOpusBuf && conn && typeof conn.downloadM === 'function') {
    try {
      // Normalisasi field base64 jika berasal dari JSON.parse(JSON.stringify(q))
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
 * Menyimpan stiker reaksi kustom milik user (mendukung stiker biasa maupun Stiker Bersuara / Sound Sticker!)
 * @param {string} sender
 * @param {Buffer|null} mediaBuffer - Buffer stiker WebP atau gambar/video (jika null, mempertahankan WebP lama & hanya memperbarui suara)
 * @param {object} [options]
 */
export async function setUserReactionSticker(sender, mediaBuffer, {
  audioBuffer = null,
  audioData = null,
  emojis = '',
  packname = global.stickpack || 'Avelia Reaction',
  author = global.stickauth || 'Avelia'
} = {}) {
  if (!global.userStickerReact) global.userStickerReact = {}
  const existing = sender ? global.userStickerReact[sender] : null
  const existingWebp = Buffer.isBuffer(existing) ? existing : existing?.webpBuffer

  let webpBuffer = mediaBuffer
  if (!Buffer.isBuffer(webpBuffer) || webpBuffer.length < 16) {
    webpBuffer = existingWebp || await getDefaultReactionSticker(sender)
  } else {
    const isWebP =
      webpBuffer.toString('ascii', 0, 4) === 'RIFF' &&
      webpBuffer.toString('ascii', 8, 12) === 'WEBP'

    if (!isWebP) {
      webpBuffer = await createSticker(webpBuffer, false, packname, author)
    }
  }

  let resolvedAudioData = audioData
  if (Buffer.isBuffer(audioBuffer) && audioBuffer.length > 32) {
    const prepared = await prepareOpusAudioPayload(audioBuffer)
    resolvedAudioData = {
      opusBuffer: prepared.opusBuffer,
      audioMessage: audioData?.audioMessage || null,
      emojis: emojis || audioData?.emojis || '',
      seconds: prepared.seconds,
      waveform: prepared.waveform
    }
  }

  const entry = {
    webpBuffer,
    opusBuffer: resolvedAudioData?.opusBuffer || null,
    audioMessage: resolvedAudioData?.audioMessage || null,
    emojis: emojis || resolvedAudioData?.emojis || '',
    seconds: resolvedAudioData?.seconds || 4,
    waveform: resolvedAudioData?.waveform,
    hasAudio: Boolean(resolvedAudioData?.opusBuffer || resolvedAudioData?.audioMessage)
  }

  if (sender) {
    global.userStickerReact[sender] = entry
  }
  global.__aveliaLastReactSticker = entry

  if (entry.hasAudio && Buffer.isBuffer(webpBuffer)) {
    const webpHash = crypto.createHash('sha256').update(webpBuffer).digest('base64')
    rememberAudioSticker([webpHash], entry)
  }

  return entry
}

/**
 * Mengambil stiker reaksi untuk user (prioritas: stiker pilihan user -> stiker default Avelia)
 * @param {string} [sender]
 * @returns {Promise<{ webpBuffer: Buffer, opusBuffer?: Buffer|null, audioMessage?: object|null, emojis?: string, seconds?: number, waveform?: Uint8Array, hasAudio?: boolean }>}
 */
export async function getDefaultReactionSticker(sender = '') {
  if (sender && global.userStickerReact?.[sender]) {
    const saved = global.userStickerReact[sender]
    return Buffer.isBuffer(saved) ? { webpBuffer: saved, hasAudio: false } : saved
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
  if (global.__aveliaLastReactSticker) {
    const last = global.__aveliaLastReactSticker
    return Buffer.isBuffer(last) ? { webpBuffer: last, hasAudio: false } : last
  }
  throw new Error('Belum ada stiker reaksi default. Balas sebuah stiker dengan .sreact terlebih dahulu.')
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

/**
 * Mem-parsing teks Markdown menjadi blok-blok komponen native AIRichResponseMessage
 */
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

/**
 * Mengirim pesan dengan tampilan Native AI Rich Response ala ChatGPT / Gemini
 */
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
 * associatedChildMessage + MessageAssociation.AssociationType.STICKER_ANNOTATION (11).
 * Mendukung penuh Stiker Biasa maupun Stiker Bersuara (Sound Sticker dengan audioMessage)!
 */
export async function sendStickerReaction(conn, jid, targetMessage, mediaInput = null, {
  sender = '',
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
    reactEntry = await getDefaultReactionSticker(sender || targetMessage.sender || '')
  }

  const webpBuffer = reactEntry.webpBuffer
  const isAnimated = Buffer.isBuffer(webpBuffer) && webpBuffer.includes('ANIM')

  // Upload WebP sticker & Audio (jika stiker bersuara) secara paralel
  let uploadedSticker = null
  let audioMsgPayload = null

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
    associatedChildMessage: {
      message: {
        stickerMessage: innerStickerPayload,
        ...(audioMsgPayload ? {
          audioStickerMessage: {
            message: {
              stickerMessage: innerStickerPayload
            }
          }
        } : {})
      }
    }
  }

  const waMsg = generateWAMessageFromContent(jid, rawPayload, {
    userJid: conn.user?.id || conn.user?.jid
  })

  // Pastikan messageContextInfo.messageAssociation & audioMessage pada associatedChildMessage tetap utuh
  waMsg.message.messageContextInfo = {
    ...(waMsg.message.messageContextInfo || {}),
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
    messageSecret: waMsg.message.messageContextInfo?.messageSecret || crypto.randomBytes(32),
    messageAssociation
  }

  if (audioMsgPayload && waMsg.message?.associatedChildMessage?.message?.stickerMessage) {
    waMsg.message.associatedChildMessage.message.stickerMessage.audioMessage = audioMsgPayload
    waMsg.message.associatedChildMessage.message.stickerMessage.emojis = reactEntry.emojis || ''
    waMsg.message.associatedChildMessage.message.audioStickerMessage = {
      message: {
        stickerMessage: waMsg.message.associatedChildMessage.message.stickerMessage
      }
    }
  }

  // Prototype getter stickerMessage agar @whiskeysockets/baileys getMediaType() mengenali mediatype="sticker"
  const protoWithStickerHint = Object.create(Object.getPrototypeOf(waMsg.message), {
    stickerMessage: {
      get() {
        return this.associatedChildMessage?.message?.stickerMessage
      }
    }
  })
  Object.setPrototypeOf(waMsg.message, protoWithStickerHint)

  await conn.relayMessage(jid, waMsg.message, {
    messageId: waMsg.key.id
  })

  return waMsg
}

export { decodeAIRich }
