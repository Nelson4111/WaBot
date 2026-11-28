const SAFE_FIELDS = new Set([
  'mimetype',
  'mimeType',
  'fileLength',
  'seconds',
  'duration',
  'width',
  'height',
  'isAnimated',
  'isLottie',
  'isAvatar',
  'gifPlayback',
  'isViewOnce'
])

const HIDDEN_FIELDS = new Set([
  'mediaKey',
  'fileSha256',
  'fileEncSha256',
  'directPath',
  'url',
  'jpegThumbnail',
  'thumbnailDirectPath',
  'thumbnailSha256',
  'thumbnailEncSha256'
])

function isBinary(value) {
  return Buffer.isBuffer(value) || value instanceof Uint8Array || value instanceof ArrayBuffer
}

function safeScalar(value) {
  if (value === null || ['string', 'number', 'boolean', 'bigint'].includes(typeof value)) {
    if (typeof value === 'string') return value.slice(0, 120)
    return typeof value === 'bigint' ? value.toString() : value
  }
  if (typeof value?.toString === 'function') return value.toString().slice(0, 120)
  return '[value omitted]'
}

function inspectShape(value, state = { fields: 0 }, depth = 0) {
  if (isBinary(value)) return '[binary omitted]'
  if (Array.isArray(value)) return { type: 'array', length: value.length }
  if (!value || typeof value !== 'object') return '[value omitted]'
  if (depth >= 6 || state.fields >= 250) return '[shape truncated]'

  const entries = Object.entries(value)
  const shape = {}
  for (const [key, child] of entries.slice(0, 60)) {
    if (state.fields >= 250) break
    state.fields += 1
    if (HIDDEN_FIELDS.has(key)) {
      shape[`has_${key}`] = child != null
    } else if (SAFE_FIELDS.has(key) && child != null) {
      shape[key] = safeScalar(child)
    } else if (child && typeof child === 'object') {
      shape[key] = inspectShape(child, state, depth + 1)
    } else {
      shape[key] = '[value omitted]'
    }
  }
  if (entries.length > 60) shape.omittedFieldCount = entries.length - 60
  return shape
}

let handler = async (m, { usedPrefix, command }) => {
  const quoted = m.quoted
  if (!quoted) {
    return m.reply(`Balas sticker yang ingin diperiksa dengan *${usedPrefix + command}*.`)
  }

  const rawMessage = quoted.message || quoted.vM?.message || quoted.msg || quoted.messages || null
  const messageType = quoted.mtype || quoted.mediaType ||
    (rawMessage && Object.keys(rawMessage)[0]) || 'unknown'

  const report = {
    purpose: 'Struktur pesan yang diterima bot; bukan source code pembuat sticker.',
    messageType,
    mimeType: quoted.mimetype || quoted.msg?.mimetype || null,
    downloadable: typeof quoted.download === 'function',
    payloadShape: inspectShape(rawMessage)
  }

  return m.reply(`*╭  〔 ⚙ ɪ ɴ ꜱ ᴘ ᴇ ᴋ ꜱ ɪ ꜱ ᴛ ɪ ᴄ ᴋ ᴇ ʀ 〕*\n> JSON ini hanya menampilkan struktur dan metadata aman; nilai key/path media serta data biner disembunyikan.\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`\n*╰───────────────*`)
}

handler.help = ['ceksticker (reply sticker)']
handler.tags = ['owner']
handler.command = /^(ceksticker|debugsticker|inspectsticker)$/i
handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur debugsticker.'
handler.tutorial = [
  '.ceksticker',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler
