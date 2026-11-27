import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as Elaina from '@rexxhayanasi/elaina-baileys'
import * as Baileys from '@whiskeysockets/baileys'
import pb from 'protobufjs/minimal.js'
import { sticker as createSticker } from './sticker.js'
import { ensureAudioStickerProto } from './audioSticker.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_REACT_WEBP_PATH = path.resolve(__dirname, '../media/avelia_react.webp')
const DEFAULT_REACT_IMG_PATH = path.resolve(__dirname, '../media/avelia.jpg')

// Sinkronisasi seluruh instance proto (Baileys.proto, Baileys.WAProto, pb.roots.default.proto, Elaina.proto)
// agar encodeWAMessage milik @whiskeysockets/baileys tidak membuang botForwardedMessage / richResponseMessage / associatedChildMessage
export function ensureAIRichProto() {
  if (Elaina?.proto) {
    ensureAudioStickerProto(Elaina.proto)
    if (pb?.roots?.default?.proto) {
      Object.assign(pb.roots.default.proto, Elaina.proto)
      ensureAudioStickerProto(pb.roots.default.proto)
    }
    if (Baileys?.proto) {
      Object.assign(Baileys.proto, Elaina.proto)
      ensureAudioStickerProto(Baileys.proto)
    }
    if (Baileys?.WAProto) {
      Object.assign(Baileys.WAProto, Elaina.proto)
      ensureAudioStickerProto(Baileys.WAProto)
    }
    if (Baileys?.default?.proto) {
      Object.assign(Baileys.default.proto, Elaina.proto)
      ensureAudioStickerProto(Baileys.default.proto)
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
 * Menyimpan stiker reaksi kustom milik user (atau global default jika sender = 'default')
 * @param {string} sender
 * @param {Buffer} mediaBuffer
 */
export async function setUserReactionSticker(sender, mediaBuffer, {
  packname = global.stickpack || 'Avelia Reaction',
  author = global.stickauth || 'Avelia'
} = {}) {
  if (!Buffer.isBuffer(mediaBuffer) || mediaBuffer.length < 16) {
    throw new Error('Media stiker tidak valid.')
  }
  let webpBuffer = mediaBuffer
  const isWebP =
    mediaBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    mediaBuffer.toString('ascii', 8, 12) === 'WEBP'

  if (!isWebP) {
    webpBuffer = await createSticker(mediaBuffer, false, packname, author)
  }
  if (!global.userStickerReact) global.userStickerReact = {}
  if (sender) {
    global.userStickerReact[sender] = webpBuffer
  }
  global.__aveliaLastReactSticker = webpBuffer
  return webpBuffer
}

/**
 * Mengambil stiker reaksi untuk user (prioritas: stiker pilihan user -> stiker default Avelia)
 * sehingga user TIDAK PERLU me-reply 2 pesan sekaligus saat memakai .sreact!
 * @param {string} [sender]
 * @returns {Promise<Buffer>}
 */
export async function getDefaultReactionSticker(sender = '') {
  if (sender && global.userStickerReact?.[sender]) {
    return global.userStickerReact[sender]
  }
  if (global.__aveliaDefaultReactSticker && Buffer.isBuffer(global.__aveliaDefaultReactSticker)) {
    return global.__aveliaDefaultReactSticker
  }
  try {
    if (fs.existsSync(DEFAULT_REACT_WEBP_PATH)) {
      const cached = await fs.promises.readFile(DEFAULT_REACT_WEBP_PATH)
      if (cached.length > 64) {
        global.__aveliaDefaultReactSticker = cached
        return cached
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
        return webpBuf
      }
    }
  } catch (err) {
    console.warn('[Default Reaction Sticker Init Warning]:', err?.message || err)
  }
  if (global.__aveliaLastReactSticker) {
    return global.__aveliaLastReactSticker
  }
  throw new Error('Belum ada stiker reaksi default. Balas sebuah stiker dengan .sreact terlebih dahulu.')
}

/**
 * Mengecek apakah sebuah teks sebaiknya dirender menggunakan AIRichResponseMessage
 * (memiliki heading #, code block ```, tabel markdown, atau teks panjang > 550 karakter
 * agar tidak terpotong tombol "Baca selengkapnya / Read more").
 *
 * @param {string} text
 * @returns {boolean}
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
 * Mem-parsing teks Markdown menjadi blok-blok komponen native AIRichResponseMessage:
 * - text (mendukung # Heading 1, ## Heading 2, ### Heading 3, bold, list, tanpa "Baca selengkapnya")
 * - code (kotak kode dengan syntax highlighting, tombol Salin, dan layar Full Preview)
 * - table (tabel grid asli WhatsApp)
 *
 * @param {string} markdown
 * @returns {Array<{ type: 'text'|'code'|'table', content?: string, language?: string, rows?: string[][] }>}
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

/**
 * Memisahkan tabel Markdown dari segmen teks biasa.
 * Catatan: tidak menggunakan GenAIDividerPrimitive agar 100% kompatibel dengan WhatsApp Android & Desktop.
 * @param {string} segment
 */
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

    // Deteksi Tabel Markdown: baris mengandung | dan diikuti baris separator |---|---|
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

    // Lewati garis pemisah horizontal mandiri (---) agar section teks tetap bersih seperti output native AI
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

/**
 * Membersihkan objek pesan quoted agar tidak membawa senderKeyDistributionMessage atau nested contextInfo
 * yang dapat merusak contextInfo pada richResponseMessage.
 */
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
 * Mengirim pesan dengan tampilan Native AI Rich Response ala ChatGPT / Gemini:
 * - Mendukung ukuran font Heading (#, ##, ###)
 * - Kotak Kode dengan Syntax Highlighting, tombol Salin, & layar Full Preview
 * - Tabel Grid Native
 * - Tanpa terpotong tombol "Baca selengkapnya / Read more"
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
 *
 * Jika mediaBuffer tidak diberikan, otomatis memakai stiker reaksi milik user atau stiker default Avelia!
 *
 * @param {object} conn - Socket Baileys
 * @param {string} jid - Chat JID
 * @param {object} targetMessage - Objek pesan target (m.quoted atau m)
 * @param {Buffer|null} [mediaBuffer] - Buffer stiker WebP atau gambar (opsional)
 * @param {object} [options]
 */
export async function sendStickerReaction(conn, jid, targetMessage, mediaBuffer = null, {
  sender = '',
  packname = global.stickpack || 'Avelia Reaction',
  author = global.stickauth || 'Avelia'
} = {}) {
  if (!conn || !jid || !targetMessage) {
    throw new Error('Parameter conn, jid, dan targetMessage wajib valid.')
  }

  ensureAIRichProto()

  let webpBuffer = mediaBuffer
  if (!Buffer.isBuffer(webpBuffer)) {
    webpBuffer = await getDefaultReactionSticker(sender || targetMessage.sender || '')
  } else {
    const isWebP =
      webpBuffer.length > 12 &&
      webpBuffer.toString('ascii', 0, 4) === 'RIFF' &&
      webpBuffer.toString('ascii', 8, 12) === 'WEBP'
    if (!isWebP) {
      webpBuffer = await createSticker(webpBuffer, false, packname, author)
    }
  }

  const isAnimated = Buffer.isBuffer(webpBuffer) && webpBuffer.includes('ANIM')
  const uploaded = await prepareWAMessageMedia(
    { sticker: webpBuffer, isAnimated },
    { upload: conn.waUploadToServer }
  )

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

  const rawPayload = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageSecret: crypto.randomBytes(32),
      messageAssociation
    },
    associatedChildMessage: {
      message: {
        stickerMessage: {
          ...uploaded.stickerMessage,
          isAnimated
        }
      }
    }
  }

  const waMsg = generateWAMessageFromContent(jid, rawPayload, {
    userJid: conn.user?.id || conn.user?.jid
  })

  // Pastikan messageContextInfo.messageAssociation & messageSecret tetap utuh setelah generateWAMessageFromContent
  waMsg.message.messageContextInfo = {
    ...(waMsg.message.messageContextInfo || {}),
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
    messageSecret: waMsg.message.messageContextInfo?.messageSecret || crypto.randomBytes(32),
    messageAssociation
  }

  // Trick kompatibilitas @whiskeysockets/baileys:
  // getMediaType(message) mengecek message.stickerMessage (lewat prototype chain),
  // sedangkan proto.Message.encode mengecek Object.hasOwnProperty.call(m, 'stickerMessage').
  // Dengan menaruh getter stickerMessage di prototype, <enc> mendapat mediatype="sticker"
  // sementara wire protobuf murni mengirimkan associatedChildMessage + messageAssociation(11)!
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
