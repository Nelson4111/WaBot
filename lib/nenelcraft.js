import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import sharp from 'sharp'
import QRCode from 'qrcode'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const BOT_ROOT = path.resolve(__dirname, '..')
const PROJECT_ROOT = path.resolve(BOT_ROOT, '..')

const ORDER_STATUSES = {
  waitingPayment: 'Menunggu Pembayaran',
  waitingVerification: 'Menunggu Verifikasi',
  paid: 'Lunas',
  rejected: 'Ditolak',
  cancelled: 'Batal'
}

function cleanText(value) {
  return String(value || '').trim()
}

function escapeXml(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const raw = cleanText(value)
  if (!raw) return 0
  const negative = /^-/.test(raw)
  const number = Number(raw.replace(/[^0-9]/g, '')) || 0
  return negative ? -number : number
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(parseAmount(value))
}

function formatDateParts(date = new Date(), timeZone = 'Asia/Makassar') {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value
    return acc
  }, {})

  return {
    day: parts.day,
    month: parts.month,
    year: parts.year,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second
  }
}

function formatInvoiceDate(value, timeZone = 'Asia/Makassar') {
  const d = value ? new Date(value) : new Date()
  const p = formatDateParts(d, timeZone)
  return `${p.day}/${p.month}/20${p.year}`
}

function formatIsoDate(value, timeZone = 'Asia/Makassar') {
  const d = value ? new Date(value) : new Date()
  const p = formatDateParts(d, timeZone)
  return `20${p.year}-${p.month}-${p.day}`
}

function formatDateTime(value, timeZone = 'Asia/Makassar') {
  const d = value ? new Date(value) : new Date()
  return d.toLocaleString('id-ID', { timeZone })
}

function generateInvoiceId(timeZone = 'Asia/Makassar') {
  const p = formatDateParts(new Date(), timeZone)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `INV-${p.year}${p.month}${p.day}-${p.hour}${p.minute}${p.second}-${suffix}`
}

function resolveMaybePath(value) {
  const raw = cleanText(value)
  if (!raw) return ''
  if (path.isAbsolute(raw) && fs.existsSync(raw)) return raw

  const candidates = [
    path.resolve(BOT_ROOT, raw),
    path.resolve(PROJECT_ROOT, raw),
    path.resolve(process.cwd(), raw)
  ]

  return candidates.find(file => fs.existsSync(file)) || ''
}

export function getNenelConfig() {
  const moneytrack = global.moneytrack || {}
  const nenelcraft = global.nenelcraft || {}
  const ownerNumbers = [
    ...(Array.isArray(nenelcraft.ownerNumbers) ? nenelcraft.ownerNumbers : []),
    nenelcraft.ownerNumber,
    '6281241100804',
    ...(global.owner || []).map(([number]) => number)
  ]
    .map(number => cleanText(number).replace(/[^0-9]/g, ''))
    .filter(Boolean)

  return {
    brandName: nenelcraft.brandName || 'NenelCraft Store',
    tagline: nenelcraft.tagline || 'Digital goods, crafted fast.',
    ownerNumber: cleanText(nenelcraft.ownerNumber || ownerNumbers[0] || '6281241100804').replace(/[^0-9]/g, ''),
    ownerNumbers: [...new Set(ownerNumbers)],
    webAppUrl: cleanText(moneytrack.webAppUrl || nenelcraft.webAppUrl || ''),
    spreadsheetId: cleanText(moneytrack.spreadsheetId || nenelcraft.spreadsheetId || ''),
    botApiKey: cleanText(moneytrack.botApiKey || nenelcraft.botApiKey || ''),
    qrisImagePath: resolveMaybePath(nenelcraft.qrisImagePath || '../QR_HitamPutih_Polos.jpeg'),
    qrisPayload: cleanText(nenelcraft.qrisPayload || global.qris || ''),
    defaultPaymentMethod: cleanText(nenelcraft.defaultPaymentMethod || 'QRIS'),
    akunTujuan: cleanText(nenelcraft.akunTujuan || 'QRIS'),
    kategori: cleanText(nenelcraft.kategori || 'Penjualan NenelCraft'),
    timeZone: cleanText(nenelcraft.timeZone || 'Asia/Makassar')
  }
}

export function ensureNenelStore() {
  if (!global.db) return { orders: {}, confirmations: {}, transactions: {}, receiptDrafts: {} }
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.nenelcraft) {
    global.db.data.nenelcraft = { orders: {}, confirmations: {}, transactions: {}, receiptDrafts: {} }
  }
  if (!global.db.data.nenelcraft.orders) global.db.data.nenelcraft.orders = {}
  if (!global.db.data.nenelcraft.confirmations) global.db.data.nenelcraft.confirmations = {}
  if (!global.db.data.nenelcraft.transactions) global.db.data.nenelcraft.transactions = {}
  if (!global.db.data.nenelcraft.receiptDrafts) global.db.data.nenelcraft.receiptDrafts = {}
  if (!global.db.data.nenelcraft.lastTransactionByUser) global.db.data.nenelcraft.lastTransactionByUser = {}
  return global.db.data.nenelcraft
}

export async function persistDb() {
  if (global.db && typeof global.db.write === 'function') {
    await global.db.write().catch(() => {})
  }
}

function stripOptionQuotes(value) {
  return cleanText(value).replace(/^['"]|['"]$/g, '')
}

function extractOrderOptions(text) {
  const options = {}
  let body = cleanText(text)
  body = body.replace(/--(metode|diskon|nama|catatan|nomor|nohp|wa|pembeli)\s+("[^"]+"|'[^']+'|[^\s]+)/gi, (_, key, value) => {
    options[key.toLowerCase()] = stripOptionQuotes(value)
    return ''
  }).trim()
  return { body, options }
}

export function normalizePhone(value) {
  let number = cleanText(value).replace(/[^0-9]/g, '')
  if (number.startsWith('0')) number = `62${number.slice(1)}`
  return number
}

function extractBuyerFromOrderBody(body, options = {}) {
  const optionNumber = options.nomor || options.nohp || options.wa || options.pembeli
  if (optionNumber) {
    return { body: cleanText(body), buyerNumber: normalizePhone(optionNumber) }
  }

  const match = cleanText(body).match(/^(\+?\d[\d\s\-]{7,18})\s*(?:\||;|,)\s*([\s\S]+)$/)
  if (!match) return { body: cleanText(body), buyerNumber: '' }

  return {
    body: cleanText(match[2]),
    buyerNumber: normalizePhone(match[1])
  }
}

function parseItemChunk(chunk) {
  const raw = cleanText(chunk)
  if (!raw) return null

  const delimiter = raw.includes('|') ? '|' : raw.includes(',') ? ',' : null
  if (delimiter) {
    const parts = raw.split(delimiter).map(part => cleanText(part)).filter(Boolean)
    if (parts.length >= 3) {
      return {
        nama: parts[0],
        qty: Math.max(1, parseAmount(parts[1])),
        hargaSatuan: parseAmount(parts[2])
      }
    }
  }

  const match = raw.match(/^(.+?)\s+x(\d+)\s+(.+)$/i)
  if (match) {
    return {
      nama: cleanText(match[1]),
      qty: Math.max(1, parseAmount(match[2])),
      hargaSatuan: parseAmount(match[3])
    }
  }

  return null
}

function normalizeItems(items) {
  return (items || [])
    .map(item => ({
      nama: cleanText(item.nama || item.name || item.item || 'Item'),
      qty: Math.max(1, parseAmount(item.qty || item.quantity || 1)),
      hargaSatuan: Math.max(0, parseAmount(item.hargaSatuan || item.harga || item.price || 0))
    }))
    .filter(item => item.nama && item.hargaSatuan > 0)
    .map(item => ({ ...item, total: item.qty * item.hargaSatuan }))
}

export function parseOrderText(text) {
  const extracted = extractOrderOptions(text)
  const buyer = extractBuyerFromOrderBody(extracted.body, extracted.options)
  const body = buyer.body
  const options = extracted.options
  if (!body) {
    throw new Error(
      'Format order belum lengkap.\nContoh: .order 62812xxxx | Diamond Rank|1|10000; Joki FF|1|20000 --metode QRIS --diskon 0'
    )
  }

  const chunks = body.split(';').map(part => cleanText(part)).filter(Boolean)
  const items = normalizeItems(chunks.map(chunk => parseItemChunk(chunk)).filter(Boolean))
  if (!items.length) {
    throw new Error(
      'Item order tidak terbaca.\nContoh: .order 62812xxxx | Diamond Rank|1|10000 --metode QRIS'
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const diskon = Math.max(0, parseAmount(options.diskon || 0))
  const total = Math.max(0, subtotal - diskon)

  return {
    items,
    subtotal,
    diskon,
    total,
    metodePembayaran: cleanText(options.metode || ''),
    namaUser: cleanText(options.nama || ''),
    nomorPembeli: buyer.buyerNumber,
    catatan: cleanText(options.catatan || '')
  }
}

export function createOrderFromText(text, { m } = {}) {
  const config = getNenelConfig()
  const parsed = parseOrderText(text)
  const senderNumber = normalizePhone(cleanText(m?.sender || '').split('@')[0])
  const buyerNumber = parsed.nomorPembeli || senderNumber
  const now = new Date()
  const order = {
    invoiceId: generateInvoiceId(config.timeZone),
    namaUser: parsed.namaUser || buyerNumber || m?.pushName || m?.name || 'Pelanggan WA',
    nomorWa: buyerNumber,
    nomorPembeliExplicit: Boolean(parsed.nomorPembeli),
    buyerJid: buyerNumber ? `${buyerNumber}@s.whatsapp.net` : m?.sender || '',
    dibuatOlehWa: senderNumber,
    userJid: buyerNumber ? `${buyerNumber}@s.whatsapp.net` : m?.sender || '',
    tanggal: formatIsoDate(now, config.timeZone),
    waktu: now.toISOString(),
    items: parsed.items,
    subtotal: parsed.subtotal,
    diskon: parsed.diskon,
    total: parsed.total,
    metodePembayaran: parsed.metodePembayaran || config.defaultPaymentMethod,
    status: ORDER_STATUSES.waitingPayment,
    catatan: parsed.catatan,
    sumberInput: 'Bot WA',
    kategori: config.kategori,
    akunTujuan: config.akunTujuan
  }
  return order
}

export function saveOrder(order) {
  const store = ensureNenelStore()
  store.orders[order.invoiceId] = {
    ...(store.orders[order.invoiceId] || {}),
    ...order,
    updatedAt: new Date().toISOString()
  }
  if (order.userJid) {
    store.lastOrderByUser = store.lastOrderByUser || {}
    store.lastOrderByUser[order.userJid] = order.invoiceId
  }
  return store.orders[order.invoiceId]
}

export function getOrder(invoiceId) {
  const store = ensureNenelStore()
  const key = cleanText(invoiceId).toUpperCase()
  return store.orders[key] || Object.values(store.orders).find(order => order.invoiceId === key) || null
}

export function getLatestUserOrder(userJid) {
  const store = ensureNenelStore()
  const invoiceId = store.lastOrderByUser && store.lastOrderByUser[userJid]
  return invoiceId ? getOrder(invoiceId) : null
}

export function updateLocalOrderStatus(invoiceId, status, extra = {}) {
  const order = getOrder(invoiceId)
  if (!order) return null
  order.status = status
  order.updatedAt = new Date().toISOString()
  Object.assign(order, extra)
  saveOrder(order)
  return order
}

export function isQrPayment(method) {
  return /^(qr|qris)$/i.test(cleanText(method))
}

async function qrDataUri(order) {
  if (!isQrPayment(order.metodePembayaran)) return ''
  const config = getNenelConfig()

  if (config.qrisImagePath) {
    const buffer = await sharp(config.qrisImagePath)
      .resize(260, 260, { fit: 'contain', background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .png()
      .toBuffer()
    return `data:image/png;base64,${buffer.toString('base64')}`
  }

  const qrText = config.qrisPayload || `${config.brandName} ${order.invoiceId} ${order.total}`
  const buffer = await QRCode.toBuffer(qrText, {
    width: 260,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  })
  return `data:image/png;base64,${buffer.toString('base64')}`
}

function svgTextLines(text, x, y, maxChars, lineHeight, attrs = '') {
  const words = cleanText(text).split(/\s+/)
  const lines = []
  let line = ''
  words.forEach(word => {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines.map((value, index) => (
    `<text x="${x}" y="${y + (index * lineHeight)}" ${attrs}>${escapeXml(value)}</text>`
  )).join('')
}

function voxelMascotSvg(x, y) {
  const blocks = [
    [34, 0, 56, 56, '#46f4ff'],
    [16, 54, 92, 74, '#7c4dff'],
    [0, 68, 28, 46, '#26d9ff'],
    [98, 68, 28, 46, '#b56cff'],
    [34, 128, 26, 54, '#233765'],
    [66, 128, 26, 54, '#233765'],
    [48, 20, 10, 10, '#06111f'],
    [76, 20, 10, 10, '#06111f'],
    [58, 40, 22, 8, '#06111f']
  ]
  return `<g transform="translate(${x} ${y})" opacity="0.92">
    <rect x="20" y="-14" width="88" height="210" rx="24" fill="rgba(0,213,255,0.08)" stroke="rgba(0,213,255,0.24)"/>
    ${blocks.map(([bx, by, bw, bh, fill]) => `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="${fill}" stroke="rgba(255,255,255,0.28)"/>`).join('')}
  </g>`
}

export async function generateInvoiceImage(order) {
  const config = getNenelConfig()
  const qrUri = await qrDataUri(order)
  const rowHeight = 58
  const tableY = 268
  const rows = order.items || []
  const tableHeight = 54 + (rows.length * rowHeight)
  const summaryY = tableY + tableHeight + 30
  const footerY = summaryY + 348
  const height = Math.max(940, footerY + 90)
  const width = 1080
  const status = order.status || ORDER_STATUSES.waitingPayment

  const rowSvg = rows.map((item, index) => {
    const y = tableY + 54 + (index * rowHeight)
    return `<g>
      <rect x="70" y="${y}" width="940" height="${rowHeight}" fill="${index % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,213,255,0.035)'}"/>
      ${svgTextLines(item.nama, 95, y + 32, 33, 18, 'font-size="25" font-weight="700" fill="#f4fbff"')}
      <text x="560" y="${y + 36}" text-anchor="middle" font-size="24" fill="#cde7ff">${item.qty}</text>
      <text x="744" y="${y + 36}" text-anchor="end" font-size="24" fill="#cde7ff">${escapeXml(formatRupiah(item.hargaSatuan))}</text>
      <text x="970" y="${y + 36}" text-anchor="end" font-size="25" font-weight="800" fill="#45f3ff">${escapeXml(formatRupiah(item.total))}</text>
    </g>`
  }).join('')

  const discountSvg = order.diskon > 0
    ? `<text x="500" y="${summaryY + 98}" text-anchor="end" font-size="24" fill="#b8c9e8">Diskon</text>
       <text x="676" y="${summaryY + 98}" text-anchor="end" font-size="24" fill="#ff6b9b">-${escapeXml(formatRupiah(order.diskon))}</text>`
    : ''

  const isPaid = status === ORDER_STATUSES.paid
  const paymentBox = isPaid
    ? `<rect x="704" y="${summaryY}" width="318" height="318" rx="28" fill="rgba(69,243,255,0.10)" stroke="rgba(69,243,255,0.55)" stroke-width="3"/>
       <text x="863" y="${summaryY + 92}" text-anchor="middle" font-size="38" font-weight="900" fill="#45f3ff">LUNAS</text>
       <text x="863" y="${summaryY + 144}" text-anchor="middle" font-size="24" fill="#e9f7ff">${escapeXml(order.metodePembayaran || '-')}</text>
       <line x1="744" y1="${summaryY + 178}" x2="982" y2="${summaryY + 178}" stroke="rgba(255,255,255,0.18)"/>
       <text x="863" y="${summaryY + 220}" text-anchor="middle" font-size="21" fill="#b8c9e8">Terima kasih.</text>
       <text x="863" y="${summaryY + 252}" text-anchor="middle" font-size="21" fill="#b8c9e8">Pembayaran sudah diterima.</text>`
    : qrUri
    ? `<rect x="716" y="${summaryY}" width="294" height="318" rx="22" fill="#ffffff"/>
       <rect x="704" y="${summaryY - 12}" width="318" height="342" rx="30" fill="none" stroke="#45f3ff" stroke-width="3"/>
       <text x="863" y="${summaryY + 34}" text-anchor="middle" font-size="23" font-weight="800" fill="#08111f">Scan QR untuk bayar</text>
       <image href="${qrUri}" x="733" y="${summaryY + 54}" width="260" height="260"/>`
    : `<rect x="704" y="${summaryY}" width="318" height="318" rx="28" fill="rgba(255,255,255,0.055)" stroke="rgba(69,243,255,0.42)" stroke-width="2"/>
       <text x="734" y="${summaryY + 58}" font-size="25" font-weight="800" fill="#45f3ff">Pembayaran Manual</text>
       <text x="734" y="${summaryY + 104}" font-size="23" fill="#e9f7ff">Metode: ${escapeXml(order.metodePembayaran || '-')}</text>
       <text x="734" y="${summaryY + 145}" font-size="21" fill="#9fb4d6">Admin akan memberi detail</text>
       <text x="734" y="${summaryY + 178}" font-size="21" fill="#9fb4d6">rekening / e-wallet.</text>`

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070b19"/>
        <stop offset="48%" stop-color="#0b1230"/>
        <stop offset="100%" stop-color="#180a33"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect x="34" y="34" width="${width - 68}" height="${height - 68}" rx="38" fill="rgba(255,255,255,0.035)" stroke="rgba(69,243,255,0.36)" stroke-width="2"/>
    <g opacity="0.34">
      <rect x="914" y="96" width="34" height="34" rx="7" fill="#45f3ff"/>
      <rect x="960" y="142" width="22" height="22" rx="5" fill="#b56cff"/>
      <rect x="73" y="${height - 158}" width="26" height="26" rx="6" fill="#45f3ff"/>
      <rect x="115" y="${height - 116}" width="18" height="18" rx="5" fill="#8b5cff"/>
    </g>
    ${voxelMascotSvg(806, 74)}

    <text x="72" y="116" font-size="44" font-weight="900" fill="#f4fbff" filter="url(#glow)">${escapeXml(config.brandName)}</text>
    <text x="75" y="154" font-size="22" fill="#8fb7dc">${escapeXml(config.tagline)}</text>
    <text x="72" y="206" font-size="28" font-weight="800" fill="#45f3ff">Invoice: ${escapeXml(order.invoiceId)}</text>
    <text x="72" y="240" font-size="22" fill="#b8c9e8">Tanggal: ${escapeXml(formatInvoiceDate(order.waktu || order.tanggal, config.timeZone))}</text>
    <text x="1010" y="204" text-anchor="end" font-size="22" fill="#b8c9e8">Status</text>
    <text x="1010" y="240" text-anchor="end" font-size="30" font-weight="900" fill="#45f3ff">${escapeXml(status)}</text>

    <rect x="70" y="${tableY}" width="940" height="${tableHeight}" rx="24" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.12)"/>
    <rect x="70" y="${tableY}" width="940" height="54" rx="24" fill="rgba(69,243,255,0.16)"/>
    <text x="95" y="${tableY + 35}" font-size="20" font-weight="900" fill="#dffcff">Nama Item</text>
    <text x="560" y="${tableY + 35}" text-anchor="middle" font-size="20" font-weight="900" fill="#dffcff">Qty</text>
    <text x="744" y="${tableY + 35}" text-anchor="end" font-size="20" font-weight="900" fill="#dffcff">Harga Satuan</text>
    <text x="970" y="${tableY + 35}" text-anchor="end" font-size="20" font-weight="900" fill="#dffcff">Total</text>
    ${rowSvg}

    <rect x="70" y="${summaryY}" width="626" height="318" rx="28" fill="rgba(255,255,255,0.055)" stroke="rgba(181,108,255,0.28)" stroke-width="2"/>
    <text x="104" y="${summaryY + 48}" font-size="28" font-weight="900" fill="#f4fbff">Ringkasan</text>
    <text x="500" y="${summaryY + 62}" text-anchor="end" font-size="24" fill="#b8c9e8">Subtotal</text>
    <text x="676" y="${summaryY + 62}" text-anchor="end" font-size="24" fill="#f4fbff">${escapeXml(formatRupiah(order.subtotal))}</text>
    ${discountSvg}
    <line x1="104" y1="${summaryY + 126}" x2="676" y2="${summaryY + 126}" stroke="rgba(255,255,255,0.16)"/>
    <text x="104" y="${summaryY + 172}" font-size="28" font-weight="900" fill="#45f3ff">Total</text>
    <text x="676" y="${summaryY + 172}" text-anchor="end" font-size="34" font-weight="900" fill="#45f3ff">${escapeXml(formatRupiah(order.total))}</text>
    <text x="104" y="${summaryY + 226}" font-size="23" fill="#b8c9e8">Metode: ${escapeXml(order.metodePembayaran || '-')}</text>
    <text x="104" y="${summaryY + 262}" font-size="23" fill="#b8c9e8">Pelanggan: ${escapeXml(order.namaUser || '-')}</text>

    ${paymentBox}

    <text x="72" y="${height - 92}" font-size="22" fill="#9fb4d6">${isPaid ? 'Nota lunas ini dibuat otomatis oleh bot.' : `Setelah bayar, klik tombol atau kirim .bayar ${escapeXml(order.invoiceId)} untuk konfirmasi pembayaran.`}</text>
    <text x="${width - 72}" y="${height - 58}" text-anchor="end" font-size="18" fill="#617395">${isPaid ? 'Struk/nota pembayaran lunas.' : 'Template statis NenelCraft Store - QR polos dan siap scan.'}</text>
  </svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

export function orderDetailText(order) {
  const items = (order.items || []).map(item => (
    `- ${item.nama} | ${item.qty} | ${formatRupiah(item.hargaSatuan)} | ${formatRupiah(item.total)}`
  )).join('\n')

  return [
    `*Detail Pesanan ${order.invoiceId}*`,
    '',
    items || '-',
    '',
    `Subtotal: ${formatRupiah(order.subtotal)}`,
    order.diskon > 0 ? `Diskon: -${formatRupiah(order.diskon)}` : '',
    `Total: ${formatRupiah(order.total)}`,
    `Metode: ${order.metodePembayaran}`,
    `Status: ${order.status}`,
    `Nama: ${order.namaUser}`,
    `Nomor WA: ${order.nomorWa}`
  ].filter(Boolean).join('\n')
}

export function paymentConfirmationText(order) {
  return [
    'Halo Admin NenelCraft Store',
    'Saya sudah melakukan pembayaran',
    `Invoice: ${order.invoiceId}`,
    `Nama: ${order.namaUser || ''}`,
    `Nomor WA: ${order.nomorWa || ''}`,
    `Total: ${formatRupiah(order.total || 0)}`,
    `Metode Pembayaran: ${order.metodePembayaran || ''}`,
    `Waktu Konfirmasi: ${formatDateTime(new Date(), getNenelConfig().timeZone)}`,
    'Mohon verifikasi pembayaran saya'
  ].join('\n')
}

export function complaintText(order) {
  const items = (order.items || []).map(item => `${item.nama} x${item.qty}`).join(', ')
  return [
    'Halo Admin NenelCraft Store',
    'Saya ingin komplain terkait pesanan saya',
    `Invoice: ${order.invoiceId}`,
    `Nama: ${order.namaUser || ''}`,
    `Isi Pesanan: ${items || '-'}`,
    'Kendala:',
    'Mohon dibantu'
  ].join('\n')
}

export function buildWaMeLink(type, order) {
  const config = getNenelConfig()
  const text = type === 'complaint' ? complaintText(order) : paymentConfirmationText(order)
  return `https://wa.me/${config.ownerNumber}?text=${encodeURIComponent(text)}`
}

export function fallbackActionText(order, usedPrefix = '.') {
  return [
    'Jika tombol tidak muncul:',
    `${usedPrefix}bayar ${order.invoiceId} - konfirmasi bayar`,
    `${usedPrefix}komplain ${order.invoiceId} - komplain pesanan`,
    `${usedPrefix}detailorder ${order.invoiceId} - lihat detail`
  ].join('\n')
}

export async function callMoneyTrack(action, args) {
  const config = getNenelConfig()
  if (!config.webAppUrl) {
    return { status: 'skipped', pesan: 'Konfigurasi MoneyTrack belum lengkap.' }
  }

  const res = await fetch(config.webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, args })
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Respon MoneyTrack tidak valid: ${text.slice(0, 120)}`)
  }
  if (!res.ok || json.status === 'error') {
    let message = json.pesan || `MoneyTrack HTTP ${res.status}`
    if (json.data?.webUrl && !message.includes(json.data.webUrl)) {
      message += `\n${json.data.webUrl}`
    }
    const err = new Error(message)
    err.data = json.data
    err.status = json.status
    throw err
  }
  return json
}

function resolveSpreadsheetId(payload = {}, account = null) {
  const config = getNenelConfig()
  return cleanText(account?.spreadsheetId || payload.spreadsheetId || config.spreadsheetId)
}

export async function resolveMoneyTrackUserByWa(number) {
  const config = getNenelConfig()
  return callMoneyTrack('botCariUserByWa', [normalizePhone(number), config.botApiKey])
}

export async function ensureMoneyTrackAccount(m) {
  const senderNumber = normalizePhone(cleanText(m?.sender || '').split('@')[0])
  const res = await resolveMoneyTrackUserByWa(senderNumber)
  if (res.status !== 'success') {
    const url = res.data?.webUrl ? `\n${res.data.webUrl}` : ''
    throw new Error((res.pesan || 'Nomor WA belum terhubung ke akun MoneyTrack.') + url)
  }
  return res.data
}

export function roleCanUseBusiness(account) {
  return ['Admin', 'UserBisnis', 'UserBisnisPribadi', 'UserPribadiBisnis'].includes(account?.role || '')
}

export function roleCanUsePersonal(account) {
  return ['Admin', 'UserPribadi', 'UserBisnisPribadi', 'UserPribadiBisnis'].includes(account?.role || '')
}

export async function syncOrderToMoneyTrack(order, account = null) {
  const config = getNenelConfig()
  const spreadsheetId = resolveSpreadsheetId(order, account)
  const payload = account?.noWa && !order.dibuatOlehWa
    ? { ...order, dibuatOlehWa: account.noWa }
    : order
  return callMoneyTrack('botUpsertOrder', [spreadsheetId, payload, config.botApiKey])
}

export async function syncConfirmationToMoneyTrack(order, account = null) {
  const config = getNenelConfig()
  const spreadsheetId = resolveSpreadsheetId(order, account)
  const payload = account?.noWa && !order.dibuatOlehWa
    ? { ...order, dibuatOlehWa: account.noWa }
    : order
  return callMoneyTrack('botKonfirmasiPembayaran', [spreadsheetId, payload, config.botApiKey])
}

export async function syncStatusToMoneyTrack(invoiceId, status, reason = '', accountOrSpreadsheetId = null) {
  const config = getNenelConfig()
  const nomorWa = typeof accountOrSpreadsheetId === 'string'
    ? ''
    : normalizePhone(accountOrSpreadsheetId?.noWa || accountOrSpreadsheetId?.dibuatOlehWa || accountOrSpreadsheetId?.adminWa || '')
  const spreadsheetId = typeof accountOrSpreadsheetId === 'string'
    ? accountOrSpreadsheetId
    : resolveSpreadsheetId({}, accountOrSpreadsheetId)
  return callMoneyTrack('botUpdateOrderStatus', [spreadsheetId, invoiceId, status, reason, config.botApiKey, nomorWa])
}

function todayIso(timeZone = 'Asia/Makassar') {
  return formatIsoDate(new Date(), timeZone)
}

function normalizeKey(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function levenshtein(a, b) {
  a = normalizeKey(a)
  b = normalizeKey(b)
  if (!a) return b.length
  if (!b) return a.length
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[a.length][b.length]
}

function bestMatch(input, choices, getName = value => value) {
  const q = normalizeKey(input)
  if (!q || !choices.length) return null
  let best = null
  for (const choice of choices) {
    const name = cleanText(getName(choice))
    const key = normalizeKey(name)
    if (!key) continue
    let score = 0
    if (key === q) score = 1
    else if (key.includes(q) || q.includes(key)) score = 0.86
    else {
      const maxLen = Math.max(key.length, q.length)
      score = maxLen ? 1 - (levenshtein(key, q) / maxLen) : 0
    }
    if (!best || score > best.score) best = { value: choice, name, score }
  }
  return best && best.score >= 0.42 ? best : null
}

function personalTypeAliases(value) {
  const v = normalizeKey(value)
  if (['masuk', 'pemasukan', 'income', 'in'].includes(v)) return 'Pemasukan'
  if (['keluar', 'pengeluaran', 'expense', 'out', 'belanja'].includes(v)) return 'Pengeluaran'
  return ''
}

export function parsePersonalTransactionText(text) {
  const raw = cleanText(text)
  if (!raw) {
    throw new Error('Format belum lengkap.\nContoh: .addtransaksi keluar | makan | 25000 | Cash | beli nasi')
  }

  const parts = raw.includes('|')
    ? raw.split('|').map(part => cleanText(part))
    : raw.split(',').map(part => cleanText(part))

  if (parts.length >= 4) {
    const tipe = personalTypeAliases(parts[0]) || 'Pengeluaran'
    return {
      tipeTransaksi: tipe,
      kategoriInput: parts[1],
      nominal: parseAmount(parts[2]),
      akunInput: parts[3],
      keterangan: parts.slice(4).join(' | ')
    }
  }

  const tokens = raw.split(/\s+/).filter(Boolean)
  const tipeFirst = personalTypeAliases(tokens[0])
  const tipeTransaksi = tipeFirst || 'Pengeluaran'
  const startIndex = tipeFirst ? 1 : 0
  const amountIndex = tokens.findIndex((token, index) => index >= startIndex && parseAmount(token) > 0)
  if (amountIndex === -1) {
    throw new Error('Nominal belum terbaca.\nContoh: .addtransaksi keluar | makan | 25000 | Cash | beli nasi')
  }

  const kategoriInput = tokens.slice(startIndex, amountIndex).join(' ') || (tipeTransaksi === 'Pemasukan' ? 'Pemasukan' : 'Lainnya')
  const rest = tokens.slice(amountIndex + 1)
  return {
    tipeTransaksi,
    kategoriInput,
    nominal: parseAmount(tokens[amountIndex]),
    akunInput: rest[0] || '',
    keterangan: rest.slice(1).join(' ')
  }
}

export async function loadMoneyTrackMaster(account) {
  const res = await callMoneyTrack('getMasterInputTransaksi', [account.spreadsheetId])
  if (res.status !== 'success') throw new Error(res.pesan || 'Gagal memuat master transaksi.')
  return {
    akun: res.data?.akun || [],
    kategori: res.data?.kategori || []
  }
}

export function buildPersonalTransactionPayload(input, master, account) {
  const kategoriAktif = (master.kategori || []).filter(item => !item.Status || item.Status === 'Aktif')
  const kategoriSesuai = kategoriAktif.filter(item => {
    const jenis = cleanText(item.Jenis || item['Jenis'])
    if (input.tipeTransaksi === 'Pemasukan') return ['Pemasukan Pribadi', 'Pemasukan'].includes(jenis)
    return ['Pengeluaran Pribadi', 'Pengeluaran'].includes(jenis)
  })
  const akunAktif = (master.akun || []).filter(item => !item.Status || item.Status === 'Aktif')
  const kategoriMatch = bestMatch(input.kategoriInput, kategoriSesuai, item => item.Nama || item['Nama'])
  const akunMatch = bestMatch(input.akunInput, akunAktif, item => item['Nama Akun'] || item.Nama || item['Nama'])

  if (!input.nominal || input.nominal <= 0) throw new Error('Nominal harus lebih dari 0.')
  if (!akunMatch && akunAktif.length !== 1) {
    const list = akunAktif.map(item => item['Nama Akun'] || item.Nama || item['Nama']).filter(Boolean).slice(0, 8).join(', ')
    throw new Error(`Akun tidak ketemu. Tulis akun lebih jelas.\nAkun tersedia: ${list || '-'}`)
  }

  const akun = akunMatch
    ? akunMatch.name
    : (akunAktif[0] && (akunAktif[0]['Nama Akun'] || akunAktif[0].Nama || akunAktif[0]['Nama'])) || ''

  const kategori = kategoriMatch ? kategoriMatch.name : input.kategoriInput
  const payload = {
    username: account.username,
    role: account.role,
    tanggal: todayIso(getNenelConfig().timeZone),
    jenisKeuangan: 'Pribadi',
    tipeTransaksi: input.tipeTransaksi,
    kategori,
    akunAsal: input.tipeTransaksi === 'Pengeluaran' ? akun : '',
    akunTujuan: input.tipeTransaksi === 'Pemasukan' ? akun : '',
    nominal: input.nominal,
    keterangan: input.keterangan || `Input bot WA: ${input.kategoriInput}`,
    status: 'Lunas',
    sumberInput: 'Bot WA'
  }

  return {
    payload,
    matched: {
      kategoriInput: input.kategoriInput,
      kategori,
      kategoriScore: kategoriMatch ? kategoriMatch.score : 0,
      akunInput: input.akunInput,
      akun,
      akunScore: akunMatch ? akunMatch.score : akunAktif.length === 1 ? 1 : 0
    }
  }
}

function accountNumberForBot(account) {
  return normalizePhone(account?.noWa || account?.senderNumber || account?.dibuatOlehWa || '')
}

export async function syncPersonalTransaction(payload, account) {
  const config = getNenelConfig()
  return callMoneyTrack('botTambahTransaksiPribadi', [accountNumberForBot(account), payload, config.botApiKey])
}

export async function updatePersonalTransaction(transaksiId, payload, account) {
  const config = getNenelConfig()
  return callMoneyTrack('botEditTransaksiPribadi', [accountNumberForBot(account), transaksiId, payload, config.botApiKey])
}

export async function deletePersonalTransaction(transaksiId, account) {
  const config = getNenelConfig()
  return callMoneyTrack('botHapusTransaksiPribadi', [accountNumberForBot(account), transaksiId, config.botApiKey])
}

export function savePersonalTransaction(record) {
  const store = ensureNenelStore()
  const transaksiId = cleanText(record.transaksiId || record.id)
  if (!transaksiId) return null

  store.transactions[transaksiId] = {
    ...(store.transactions[transaksiId] || {}),
    ...record,
    transaksiId,
    updatedAt: new Date().toISOString()
  }
  if (record.senderJid) store.lastTransactionByUser[record.senderJid] = transaksiId
  return store.transactions[transaksiId]
}

export function getPersonalTransaction(transaksiId) {
  const store = ensureNenelStore()
  const key = cleanText(transaksiId)
  return store.transactions[key] || null
}

export function removePersonalTransaction(transaksiId) {
  const store = ensureNenelStore()
  const key = cleanText(transaksiId)
  if (!key || !store.transactions[key]) return false
  delete store.transactions[key]
  Object.keys(store.lastTransactionByUser || {}).forEach(jid => {
    if (store.lastTransactionByUser[jid] === key) delete store.lastTransactionByUser[jid]
  })
  return true
}

export function canAccessPersonalTransaction(record, m, isOwner = false) {
  if (isOwner) return true
  if (!record) return true
  const senderJid = cleanText(m?.sender)
  const senderNumber = normalizePhone(senderJid.split('@')[0])
  return (
    !record.senderJid ||
    record.senderJid === senderJid ||
    normalizePhone(record.senderNumber || '') === senderNumber
  )
}

export async function sendInvoiceWithActions(conn, m, order, imageBuffer, usedPrefix = '.', targetJid = '') {
  const caption = `${orderDetailText(order)}\n\n${fallbackActionText(order, usedPrefix)}`
  const buttons = [
    ['Saya Sudah Bayar', `${usedPrefix}bayar ${order.invoiceId}`],
    ['Komplain Pesanan', `${usedPrefix}komplain ${order.invoiceId}`],
    ['Lihat Detail Pesanan', `${usedPrefix}detailorder ${order.invoiceId}`]
  ]

  if (typeof conn.sendButton === 'function') {
    try {
      await conn.sendButton(targetJid || m.chat, caption, 'NenelCraft Store', imageBuffer, buttons, m)
      return
    } catch (err) {
      console.error('Gagal kirim tombol invoice:', err.message)
    }
  }

  await conn.sendMessage(targetJid || m.chat, { image: imageBuffer, caption }, { quoted: m })
}

export async function notifyOwnerOrder(conn, order, type = 'order') {
  const config = getNenelConfig()
  const ownerText = [
    type === 'confirmation' ? '*Konfirmasi Pembayaran Masuk*' : '*Order Baru NenelCraft Store*',
    '',
    `Invoice: ${order.invoiceId}`,
    `Nama: ${order.namaUser || '-'}`,
    `Nomor WA: ${order.nomorWa || '-'}`,
    `Total: ${formatRupiah(order.total || 0)}`,
    `Metode: ${order.metodePembayaran || '-'}`,
    `Status: ${order.status || '-'}`,
    '',
    orderDetailText(order),
    '',
    `Hubungi user: https://wa.me/${order.nomorWa || ''}`
  ].join('\n')

  const buttons = [
    ['Verifikasi', `.veriforder ${order.invoiceId}`],
    ['Tolak', `.tolakorder ${order.invoiceId}`],
    ['Tandai Lunas', `.lunasorder ${order.invoiceId}`]
  ]

  for (const number of config.ownerNumbers) {
    const jid = `${number}@s.whatsapp.net`
    try {
      if (typeof conn.sendButton === 'function') {
        await conn.sendButton(jid, ownerText, 'Aksi Owner', buttons)
      } else {
        await conn.sendMessage(jid, { text: `${ownerText}\n\nAksi:\n.veriforder ${order.invoiceId}\n.tolakorder ${order.invoiceId} alasan\n.lunasorder ${order.invoiceId}` })
      }
    } catch (err) {
      console.error('Gagal kirim notif owner:', jid, err.message)
    }
  }
}

function splitManualParts(text) {
  const pipeParts = cleanText(text).split('|').map(part => cleanText(part)).filter(Boolean)
  if (pipeParts.length >= 3) return pipeParts
  return cleanText(text).split(',').map(part => cleanText(part)).filter(Boolean)
}

function looksLikePhone(value) {
  const n = normalizePhone(value)
  return n.length >= 9 && n.length <= 16
}

export function createManualConfirmation(text, m) {
  const config = getNenelConfig()
  const extracted = extractOrderOptions(text)
  const buyer = extractBuyerFromOrderBody(extracted.body, extracted.options)
  const data = splitManualParts(buyer.body)
  const senderNumber = normalizePhone(cleanText(m?.sender || '').split('@')[0])

  if (data.length < 3) {
    throw new Error(
      'Format .done belum lengkap.\nContoh: .done 62812xxxx | Nama | 10000 | QRIS | catatan'
    )
  }

  const invoiceId = data[0].toUpperCase().startsWith('INV-') || data[0].toUpperCase().startsWith('CONF-')
    ? data[0].toUpperCase()
    : `CONF-${Date.now().toString(36).toUpperCase()}`

  const hasInvoice = data[0].toUpperCase().startsWith('INV-') || data[0].toUpperCase().startsWith('CONF-')
  let nomorPelanggan = buyer.buyerNumber
  let nama
  let nominal
  let metode
  let catatan

  if (hasInvoice) {
    const secondIsPhone = looksLikePhone(data[1])
    if (!nomorPelanggan && secondIsPhone) nomorPelanggan = normalizePhone(data[1])
    nama = secondIsPhone ? data[2] : data[1]
    nominal = secondIsPhone ? data[3] : data[2]
    metode = secondIsPhone ? data[4] : data[3]
    catatan = (secondIsPhone ? data.slice(5) : data.slice(4)).join(' | ')
  } else {
    const firstIsPhone = looksLikePhone(data[0])
    if (!nomorPelanggan && firstIsPhone) nomorPelanggan = normalizePhone(data[0])
    nama = firstIsPhone ? data[1] : data[0]
    nominal = firstIsPhone ? data[2] : data[1]
    metode = firstIsPhone ? data[3] : data[2]
    catatan = (firstIsPhone ? data.slice(4) : data.slice(3)).join(' | ')
  }

  return {
    invoiceId,
    ticketId: invoiceId,
    namaUser: nama || nomorPelanggan || 'Pelanggan WA',
    nomorWa: nomorPelanggan,
    nomorPembeliExplicit: Boolean(nomorPelanggan),
    dibuatOlehWa: senderNumber,
    userJid: nomorPelanggan ? `${nomorPelanggan}@s.whatsapp.net` : '',
    tanggal: formatIsoDate(new Date(), config.timeZone),
    waktu: new Date().toISOString(),
    items: [],
    subtotal: parseAmount(nominal),
    diskon: 0,
    total: parseAmount(nominal),
    metodePembayaran: metode || 'Manual',
    status: ORDER_STATUSES.paid,
    catatan: catatan || 'Konfirmasi manual .done',
    sumberInput: 'Bot WA',
    kategori: config.kategori,
    akunTujuan: config.akunTujuan
  }
}

function parseReceiptNumber(text) {
  const raw = cleanText(text)
    .replace(/rp/gi, '')
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '')
  if (!raw) return 0
  let normalized = raw
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else {
    normalized = normalized.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(',', '.')
  }
  const n = parseFloat(normalized)
  return Number.isFinite(n) ? Math.round(n) : 0
}

function receiptNominalTokens(line) {
  return String(line || '')
    .replace(/rp/gi, ' ')
    .match(/-?\d{1,3}(?:[.,]\d{3})+(?:,\d{1,2})?|-?\d{4,}(?:,\d{1,2})?/g) || []
}

function receiptNominalCandidates(line) {
  return receiptNominalTokens(line)
    .map(parseReceiptNumber)
    .filter(value => value > 0 && value < 100000000)
}

function lastReceiptNominal(line) {
  const nums = receiptNominalCandidates(line)
  return nums.length ? nums[nums.length - 1] : 0
}

function receiptQtyFromLine(line, nominalTokens = []) {
  const text = String(line || '')
  const xQty = text.match(/\b(\d+(?:[.,]\d+)?)\s*[xX]\b|\b[xX]\s*(\d+(?:[.,]\d+)?)\b/)
  if (xQty) return Number(String(xQty[1] || xQty[2]).replace(',', '.')) || 1
  if (nominalTokens.length >= 2) {
    const unitToken = nominalTokens[nominalTokens.length - 2]
    const unitIdx = text.lastIndexOf(unitToken)
    const beforeUnit = unitIdx > 0 ? text.slice(0, unitIdx).trim() : ''
    const qtyMatch = beforeUnit.match(/(?:^|\s)(\d+(?:[.,]\d+)?)$/)
    if (qtyMatch) return Number(String(qtyMatch[1]).replace(',', '.')) || 1
  }
  return 1
}

function receiptNameFromLine(line, nominalTokens = []) {
  let text = String(line || '').trim()
  const tokens = nominalTokens.length ? nominalTokens : receiptNominalTokens(text)
  if (tokens.length >= 2) {
    const unitToken = tokens[tokens.length - 2]
    const unitIdx = text.lastIndexOf(unitToken)
    if (unitIdx > 0) text = text.slice(0, unitIdx).trim()
  } else if (tokens.length) {
    const lastToken = tokens[tokens.length - 1]
    text = text.slice(0, text.lastIndexOf(lastToken)).trim()
  }
  return text
    .replace(/\b\d+\s*[xX]\s*\d[\d.,]*/g, '')
    .replace(/\s+[xX]\s*\d+(?:[.,]\d+)?$/i, '')
    .replace(/\s+\d+(?:[.,]\d+)?$/, '')
    .replace(/\brp\b/gi, '')
    .replace(/^[^\w]+|[^\w]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isReceiptSummaryLine(line) {
  const lower = String(line || '').toLowerCase()
  return /harga\s*jua?l|subtotal|sub\s*total|grand\s*total|total\s*akhir|total\s*bayar|jumlah\s*bayar|net\s*total|^total\b|tunai|cash|bayar|kembali|change|saldo|anda\s*hemat|pajak|tax|ppn|service|layanan/.test(lower)
}

function isReceiptItemNameValid(name) {
  const s = String(name || '').trim()
  if (!s) return false
  if (/^rp\s*\d/i.test(s) || /^rp$/i.test(s)) return false
  if (isReceiptSummaryLine(s)) return false
  const letters = s.replace(/\brp\b/gi, '').replace(/[^a-zA-Z]/g, '')
  if (letters.length < 3) return false
  const noise = s.replace(/\brp\b/gi, '').replace(/["'`.,:;_\-\s\d]/g, '')
  return noise.length >= 2
}

function normalizeReceiptLine(line) {
  return String(line || '')
    .replace(/[|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseReceiptDate(text) {
  const s = String(text || '')
  let m = s.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/)
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`
  m = s.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/)
  if (m) {
    let year = String(m[3])
    if (year.length === 2) year = `20${year}`
    return `${year}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`
  }
  return todayIso(getNenelConfig().timeZone)
}

function parseReceiptMethod(text) {
  const upper = String(text || '').toUpperCase()
  if (/DANA/.test(upper)) return 'DANA'
  if (/GOPAY|GO-PAY/.test(upper)) return 'GOPAY'
  if (/OVO/.test(upper)) return 'OVO'
  if (/QRIS/.test(upper)) return 'QRIS'
  if (/BCA|BRI|BNI|MANDIRI|DEBIT|KREDIT|CREDIT|KARTU/.test(upper)) return 'Kartu/Bank'
  if (/CASH|TUNAI/.test(upper)) return 'CASH'
  return ''
}

function parseReceiptText(text, fileName = 'Struk') {
  const lines = String(text || '').split(/\r?\n/)
    .map(normalizeReceiptLine)
    .filter(line => line.length >= 2)
  if (!lines.length) throw new Error('Teks struk kosong atau tidak terbaca.')

  const store = lines.find(line => !/(total|subtotal|diskon|voucher|pajak|tax|service|bayar|tunai|cash|kembali|tanggal|date|qty|harga)/i.test(line)) ||
    cleanText(fileName).replace(/\.[^.]+$/, '') ||
    'Struk'

  let subtotal = 0
  let totalAkhir = 0
  let diskon = 0
  let pajak = 0
  let service = 0
  const items = []

  for (const line of lines) {
    const nominal = lastReceiptNominal(line)
    const lower = line.toLowerCase()
    if (!nominal) continue

    if (/grand\s*total|total\s*akhir|total\s*bayar|jumlah\s*bayar|net\s*total|^total\b/.test(lower)) {
      totalAkhir = nominal
      continue
    }
    if (/subtotal|sub\s*total/.test(lower)) {
      subtotal = nominal
      continue
    }
    if (/diskon|disc|voucher|promo|cashback|potongan/.test(lower)) {
      diskon += nominal
      continue
    }
    if (/pajak|tax|ppn/.test(lower)) {
      pajak += nominal
      continue
    }
    if (/service|layanan/.test(lower)) {
      service += nominal
      continue
    }
    if (isReceiptSummaryLine(line) || /total\s*(item|barang|belanja)|jumlah\s*(item|barang)/.test(lower)) continue
    if (/bayar|tunai|cash|kembali|change|saldo|card|debit|kredit|qris|dana|gopay|ovo/.test(lower)) continue

    const nominalTokens = receiptNominalTokens(line)
    const namePart = receiptNameFromLine(line, nominalTokens)
    const qty = receiptQtyFromLine(line, nominalTokens)
    if (isReceiptItemNameValid(namePart)) {
      items.push({
        nama: namePart,
        qty: qty || 1,
        hargaSatuan: qty > 1 ? Math.round(nominal / qty) : nominal,
        subtotal: nominal
      })
    }
  }

  const itemSubtotal = items.reduce((sum, item) => sum + parseAmount(item.subtotal), 0)
  if (!subtotal) subtotal = itemSubtotal
  if (!totalAkhir) totalAkhir = Math.max(0, (subtotal || itemSubtotal) - diskon + pajak + service)
  if (!items.length && totalAkhir) {
    items.push({
      nama: `Belanja ${store}`,
      qty: 1,
      hargaSatuan: totalAkhir,
      subtotal: Math.max(totalAkhir + diskon - pajak - service, totalAkhir)
    })
  }

  return {
    fileName,
    tanggal: parseReceiptDate(text),
    toko: store,
    metodePembayaran: parseReceiptMethod(text),
    items,
    diskon,
    pajak,
    service,
    totalAkhir,
    rawText: text
  }
}

function receiptActiveCategories(master, financeType) {
  const allowedPersonal = ['Pengeluaran Pribadi', 'Pengeluaran']
  const allowedBusiness = ['Pengeluaran Bisnis', 'Operasional Bisnis', 'Bisnis', 'Pengeluaran']
  const allowed = financeType === 'Bisnis' ? allowedBusiness : allowedPersonal
  return (master.kategori || []).filter(item => {
    const status = cleanText(item.Status || item['Status'])
    const jenis = cleanText(item.Jenis || item['Jenis'])
    return (!status || status === 'Aktif') && (!jenis || allowed.includes(jenis))
  })
}

function receiptActiveAccounts(master) {
  return (master.akun || []).filter(item => {
    const status = cleanText(item.Status || item['Status'])
    return !status || status === 'Aktif'
  })
}

function categoryRuleForReceipt(itemName, categories) {
  const lower = cleanText(itemName).toLowerCase()
  const names = categories.map(item => item.Nama || item['Nama']).filter(Boolean)
  const has = name => names.find(item => normalizeKey(item) === normalizeKey(name))
  if (/(makan|minum|nasi|ayam|roti|kopi|air|teh|snack|mie)/i.test(lower) && has('Makan & Minum')) return has('Makan & Minum')
  if (/(bensin|ojek|parkir|tol|transport|grab|gojek)/i.test(lower) && has('Transportasi')) return has('Transportasi')
  if (/(sabun|sampo|shampoo|tisu|deterjen|pewangi)/i.test(lower) && has('Kebutuhan Rumah')) return has('Kebutuhan Rumah')
  if (has('Lainnya')) return has('Lainnya')
  return ''
}

function chooseReceiptCategory(itemName, categories) {
  const byRule = categoryRuleForReceipt(itemName, categories)
  if (byRule) return { kategori: byRule, score: 1, input: itemName }
  const match = bestMatch(itemName, categories, item => item.Nama || item['Nama'])
  return {
    kategori: match ? match.name : ((categories[0] && (categories[0].Nama || categories[0]['Nama'])) || 'Lainnya'),
    score: match ? match.score : 0,
    input: itemName
  }
}

function chooseReceiptAccount(method, master) {
  const accounts = receiptActiveAccounts(master)
  const m = normalizeKey(method)
  let target = ''
  if (/cash|tunai/.test(m)) target = 'cash'
  else if (/dana/.test(m)) target = 'dana'
  else if (/gopay|go pay/.test(m)) target = 'gopay'
  else if (/ovo/.test(m)) target = 'ovo'
  else if (/bank|kartu|debit|credit|kredit|bca|bri|bni|mandiri|qris/.test(m)) target = /qris/.test(m) ? 'qris' : 'bank'

  if (target) {
    const found = accounts.find(item => {
      const nama = normalizeKey(item['Nama Akun'] || item.Nama || item['Nama'])
      const jenis = normalizeKey(item.Jenis || item['Jenis'])
      if (target === 'bank') return /bank|bca|bri|bni|mandiri/.test(`${nama} ${jenis}`)
      return nama.includes(target) || jenis.includes(target)
    })
    if (found) return found['Nama Akun'] || found.Nama || found['Nama']
  }

  return accounts.length === 1
    ? (accounts[0]['Nama Akun'] || accounts[0].Nama || accounts[0]['Nama'])
    : ''
}

function normalizeReceiptItems(items, diskonTotal, totalAkhir) {
  const normalized = (items || []).map(item => {
    const qty = Number(String(item.qty || 1).replace(',', '.')) || 1
    let subtotal = parseAmount(item.subtotal !== undefined ? item.subtotal : qty * parseAmount(item.hargaSatuan))
    const hargaSatuan = parseAmount(item.hargaSatuan) || Math.round(subtotal / Math.max(1, qty))
    subtotal = Math.round(qty * hargaSatuan) || subtotal
    return { ...item, qty, hargaSatuan, subtotal }
  })
  const subtotalAll = normalized.reduce((sum, item) => sum + parseAmount(item.subtotal), 0)
  const targetTotal = totalAkhir !== undefined && totalAkhir !== null
    ? parseAmount(totalAkhir)
    : Math.max(0, subtotalAll - parseAmount(diskonTotal))
  let running = 0
  return normalized.map((item, index) => {
    const nominalAkhir = index === normalized.length - 1
      ? targetTotal - running
      : Math.round((parseAmount(item.subtotal) / Math.max(1, subtotalAll)) * targetTotal)
    running += nominalAkhir
    return {
      ...item,
      nominalAkhir,
      diskonItem: Math.max(0, parseAmount(item.subtotal) - nominalAkhir)
    }
  })
}

function receiptItemNote(item) {
  const qty = Number(item.qty || 1)
  return [
    `${item.nama || 'Item'} | ${qty} x ${formatRupiah(item.hargaSatuan || 0)}`,
    item.diskonItem ? `Diskon: ${formatRupiah(item.diskonItem)}` : ''
  ].filter(Boolean).join(' | ')
}

export function buildReceiptDraft(rawReceipt, master, account, options = {}) {
  const financeType = options.financeType || (
    account.role === 'UserBisnis' ? 'Bisnis' : 'Pribadi'
  )
  const categories = receiptActiveCategories(master, financeType)
  const subtotal = (rawReceipt.items || []).reduce((sum, item) => sum + parseAmount(item.subtotal), 0)
  const diskon = parseAmount(rawReceipt.diskon)
  const pajak = parseAmount(rawReceipt.pajak) + parseAmount(rawReceipt.service)
  const totalAkhir = rawReceipt.totalAkhir !== undefined
    ? parseAmount(rawReceipt.totalAkhir)
    : Math.max(0, subtotal - diskon + pajak)
  const itemTarget = diskon > 0 ? totalAkhir : undefined
  const items = normalizeReceiptItems(rawReceipt.items || [], Math.max(0, diskon - pajak), itemTarget)
    .map(item => {
      const category = chooseReceiptCategory(item.nama, categories)
      return {
        ...item,
        kategori: category.kategori,
        kategoriInput: category.input,
        kategoriScore: category.score,
        keterangan: receiptItemNote(item)
      }
    })

  const akun = options.akun || chooseReceiptAccount(rawReceipt.metodePembayaran, master)
  if (!akun) {
    const list = receiptActiveAccounts(master).map(item => item['Nama Akun'] || item.Nama || item['Nama']).filter(Boolean).slice(0, 8).join(', ')
    throw new Error(`Akun pembayaran belum ketemu. Tulis akun dengan --akun NamaAkun.\nAkun tersedia: ${list || '-'}`)
  }

  return {
    draftId: `STRUK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    financeType,
    tanggal: rawReceipt.tanggal || todayIso(getNenelConfig().timeZone),
    toko: rawReceipt.toko || 'Struk',
    metodePembayaran: rawReceipt.metodePembayaran || '',
    akun,
    subtotal,
    diskon,
    pajak,
    totalAkhir,
    items,
    rawText: rawReceipt.rawText || '',
    accountUsername: account.username,
    accountName: account.nama,
    spreadsheetId: account.spreadsheetId,
    role: account.role,
    createdAt: new Date().toISOString()
  }
}

export function parseReceiptTextToDraft(text, master, account, options = {}) {
  const raw = parseReceiptText(text, options.fileName || 'Struk')
  return buildReceiptDraft(raw, master, account, options)
}

export function saveReceiptDraft(record) {
  const store = ensureNenelStore()
  const draftId = cleanText(record.draftId)
  if (!draftId) return null
  store.receiptDrafts[draftId] = {
    ...(store.receiptDrafts[draftId] || {}),
    ...record,
    updatedAt: new Date().toISOString()
  }
  return store.receiptDrafts[draftId]
}

export function getReceiptDraft(draftId) {
  const store = ensureNenelStore()
  return store.receiptDrafts[cleanText(draftId).toUpperCase()] || store.receiptDrafts[cleanText(draftId)] || null
}

export function removeReceiptDraft(draftId) {
  const store = ensureNenelStore()
  const key = cleanText(draftId).toUpperCase()
  if (store.receiptDrafts[key]) {
    delete store.receiptDrafts[key]
    return true
  }
  const raw = cleanText(draftId)
  if (store.receiptDrafts[raw]) {
    delete store.receiptDrafts[raw]
    return true
  }
  return false
}

export function receiptDraftText(draft, maxItems = 8) {
  const items = (draft.items || []).slice(0, maxItems).map((item, index) => {
    const score = Math.round((Number(item.kategoriScore) || 0) * 100)
    const categoryNote = score && score < 100 ? ` (${score}%)` : ''
    return `${index + 1}. ${item.nama} x${item.qty} - ${formatRupiah(item.nominalAkhir)} -> ${item.kategori}${categoryNote}`
  })
  const hidden = (draft.items || []).length > maxItems ? `\n...dan ${(draft.items || []).length - maxItems} item lain.` : ''
  return [
    `*Preview Struk ${draft.draftId}*`,
    '',
    `Toko: ${draft.toko}`,
    `Tanggal: ${draft.tanggal}`,
    `Jenis: ${draft.financeType}`,
    `Akun: ${draft.akun}`,
    `Metode: ${draft.metodePembayaran || '-'}`,
    `Subtotal: ${formatRupiah(draft.subtotal)}`,
    draft.diskon ? `Diskon: ${formatRupiah(draft.diskon)}` : '',
    draft.pajak ? `Pajak/Biaya: ${formatRupiah(draft.pajak)}` : '',
    `Total: ${formatRupiah(draft.totalAkhir)}`,
    '',
    items.join('\n') + hidden
  ].filter(Boolean).join('\n')
}

export function buildReceiptTransactionPayloads(draft, account) {
  return (draft.items || [])
    .filter(item => parseAmount(item.nominalAkhir) > 0 && cleanText(item.kategori))
    .map(item => {
      const common = {
        username: account.username,
        role: account.role,
        tanggal: draft.tanggal,
        jenisKeuangan: draft.financeType,
        kategori: item.kategori,
        akunAsal: draft.akun,
        akunTujuan: '',
        nominal: parseAmount(item.nominalAkhir),
        keterangan: item.keterangan || receiptItemNote(item),
        status: 'Lunas',
        sumberInput: 'Struk Bot WA'
      }
      if (draft.financeType === 'Bisnis') {
        return {
          ...common,
          tipeTransaksi: '',
          tipePembayaran: 'Operasional Bisnis',
          pelanggan: draft.toko
        }
      }
      return {
        ...common,
        tipeTransaksi: 'Pengeluaran',
        tipePembayaran: ''
      }
    })
}

export async function syncMoneyTrackTransaction(payload, account) {
  const config = getNenelConfig()
  const nomorWa = accountNumberForBot(account)
  return callMoneyTrack('botTambahTransaksiAman', [nomorWa, payload, config.botApiKey])
}

export async function syncReceiptDraftTransactions(draft, account) {
  const payloads = buildReceiptTransactionPayloads(draft, account)
  if (!payloads.length) throw new Error('Tidak ada item struk yang valid untuk disimpan.')
  const results = []
  for (const payload of payloads) {
    const res = await syncMoneyTrackTransaction(payload, account)
    results.push({ payload, res })
  }
  return results
}

export { ORDER_STATUSES, formatRupiah }
