import crypto from 'crypto'
import * as Elaina from '@rexxhayanasi/elaina-baileys'
import * as Baileys from '@whiskeysockets/baileys'
import pb from 'protobufjs/minimal.js'
import { sticker as createSticker } from './sticker.js'
import { ensureAudioStickerProto } from './audioSticker.js'

// Sinkronisasi root protobufjs agar @whiskeysockets/baileys tidak menimpa definisi Message terbaru (botForwardedMessage / richResponseMessage) milik @rexxhayanasi/elaina-baileys
export function ensureAIRichProto() {
  if (pb?.roots?.default?.proto && Elaina?.proto) {
    Object.assign(pb.roots.default.proto, Elaina.proto)
    ensureAudioStickerProto(pb.roots.default.proto)
  }
  if (Elaina?.proto) {
    ensureAudioStickerProto(Elaina.proto)
  }
}

ensureAIRichProto()

const { AIRich, decodeAIRich, dividerSection, latexSection } = Elaina
const prepareWAMessageMedia = Elaina.prepareWAMessageMedia || Baileys.prepareWAMessageMedia
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent

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
 * - divider (garis pemisah horizontal)
 *
 * @param {string} markdown
 * @returns {Array<{ type: 'text'|'code'|'table'|'divider', content?: string, language?: string, rows?: string[][] }>}
 */
export function parseMarkdownToAIRichBlocks(markdown) {
  if (!markdown || typeof markdown !== 'string') return []

  const blocks = []
  // 1. Pisahkan blok kode ```lang ... ``` terlebih dahulu
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
 * Memisahkan tabel Markdown dan garis pemisah (---) dari segmen teks biasa
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
      // Header row
      tableRows.push(parseTableRow(line))
      i += 2 // Lewati baris header & baris separator |---|---|

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

    // Deteksi garis pemisah horizontal (--- atau ***)
    if (/^(?:---+|===+|\*\*\*+)$/.test(line)) {
      flushText()
      result.push({ type: 'divider' })
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
 * Mengirim pesan dengan tampilan Native AI Rich Response ala ChatGPT / Gemini:
 * - Mendukung ukuran font Heading (#, ##, ###)
 * - Kotak Kode dengan Syntax Highlighting, tombol Salin, & layar Full Preview
 * - Tabel Grid Native
 * - Tanpa terpotong tombol "Baca selengkapnya / Read more"
 *
 * @param {object} conn - Socket Baileys
 * @param {string} jid - Target chat JID
 * @param {string} markdownText - Isi pesan berformat Markdown
 * @param {object} [options]
 * @param {object} [options.quoted] - Pesan yang di-reply
 * @param {string} [options.title] - Disclaimer / header kecil di atas bubble
 * @param {string} [options.footer] - Teks metadata kecil di bagian bawah (contoh: "🧰 1 langkah • ⏱ 2s • Avelia")
 * @param {string[]} [options.suggestions] - Tombol kapsul saran prompt lanjutan
 * @param {boolean} [options.bypassDownload=true] - Kirim edit sinkronisasi agar unifiedResponse langsung dirender semua klien
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

  if (typeof AIRich !== 'function') {
    return await conn.sendMessage(jid, { text: markdownText }, quoted ? { quoted } : {})
  }

  try {
    ensureAIRichProto()
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
      } else if (block.type === 'divider' && typeof dividerSection === 'function') {
        rich._addContent(dividerSection(), { messageType: 2, messageText: '──────────' })
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

    const sent = await rich.send(jid, {
      quoted: quoted || undefined,
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
 * Mengirim Reaksi/Anotasi Stiker ke sebuah pesan menggunakan jalur protokol internal
 * MessageAssociation.AssociationType.STICKER_ANNOTATION (11).
 *
 * @param {object} conn - Socket Baileys
 * @param {string} jid - Chat JID
 * @param {object} targetMessage - Objek pesan target (m.quoted atau m)
 * @param {Buffer} mediaBuffer - Buffer stiker WebP atau gambar/video yang akan dijadikan stiker reaksi
 * @param {object} [options]
 * @param {string} [options.packname]
 * @param {string} [options.author]
 */
export async function sendStickerReaction(conn, jid, targetMessage, mediaBuffer, {
  packname = global.stickpack || 'Avelia Reaction',
  author = global.stickauth || 'Avelia'
} = {}) {
  if (!conn || !jid || !targetMessage || !Buffer.isBuffer(mediaBuffer)) {
    throw new Error('Parameter conn, jid, targetMessage, dan mediaBuffer wajib valid.')
  }

  let webpBuffer = mediaBuffer
  const isWebP = mediaBuffer.length > 12 &&
    mediaBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    mediaBuffer.toString('ascii', 8, 12) === 'WEBP'

  if (!isWebP) {
    webpBuffer = await createSticker(mediaBuffer, false, packname, author)
  }

  const isAnimated = Buffer.isBuffer(webpBuffer) && webpBuffer.includes('ANIM')
  const uploaded = await prepareWAMessageMedia(
    { sticker: webpBuffer, isAnimated },
    { upload: conn.waUploadToServer }
  )

  const targetKey = {
    remoteJid: targetMessage.chat || targetMessage.key?.remoteJid || jid,
    fromMe: Boolean(targetMessage.fromMe ?? targetMessage.key?.fromMe),
    id: targetMessage.id || targetMessage.key?.id,
    ...(targetMessage.sender || targetMessage.key?.participant
      ? { participant: targetMessage.sender || targetMessage.key?.participant }
      : {})
  }

  const rawPayload = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageAssociation: {
        associationType: 11, // STICKER_ANNOTATION = 11
        parentMessageKey: targetKey
      }
    },
    stickerMessage: {
      ...uploaded.stickerMessage,
      isAnimated,
      contextInfo: {
        stanzaId: targetKey.id,
        participant: targetKey.participant || targetKey.remoteJid,
        remoteJid: targetKey.remoteJid
      }
    }
  }

  const waMsg = generateWAMessageFromContent(jid, rawPayload, {
    userJid: conn.user?.id || conn.user?.jid
  })

  // Pastikan messageAssociation tetap utuh setelah generateWAMessageFromContent
  waMsg.message.messageContextInfo = {
    ...(waMsg.message.messageContextInfo || {}),
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
    messageAssociation: {
      associationType: 11,
      parentMessageKey: targetKey
    }
  }

  await conn.relayMessage(jid, waMsg.message, {
    messageId: waMsg.key.id
  })

  return waMsg
}

export { decodeAIRich }
