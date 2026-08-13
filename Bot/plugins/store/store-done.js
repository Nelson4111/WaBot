import {
  ORDER_STATUSES,
  createManualConfirmation,
  ensureMoneyTrackAccount,
  generateInvoiceImage,
  getOrder,
  orderDetailText,
  persistDb,
  roleCanUseBusiness,
  saveOrder,
  syncOrderToMoneyTrack
} from '../../lib/nenelcraft.js'

function looksLikePaymentNote(text) {
  return /^(sudah\s+)?(bayar|lunas|paid|done|selesai|konfirmasi)\b/i.test(String(text || '').trim())
}

function ensurePaidItems(order) {
  const items = Array.isArray(order.items) ? order.items.filter(item => item && item.nama) : []
  if (items.length) return items

  const nama = order.catatan && !looksLikePaymentNote(order.catatan)
    ? order.catatan
    : 'Pesanan manual'
  return [{
    nama,
    qty: 1,
    hargaSatuan: Number(order.total || order.subtotal || 0),
    total: Number(order.total || order.subtotal || 0)
  }]
}

async function sendDoneToCustomer(conn, m, payload, receiptImage, usedPrefix = '.') {
  const target = payload.userJid || (payload.nomorWa ? `${payload.nomorWa}@s.whatsapp.net` : '')
  if (!target) return false

  const text = [
    '*Pembayaran Lunas*',
    '',
    orderDetailText(payload),
    '',
    'Nota pembayaran sudah diterbitkan.',
    `Jika perlu cek ulang: ${usedPrefix}detailorder ${payload.invoiceId}`
  ].join('\n')

  const buttons = [
    ['Lihat Detail', `${usedPrefix}detailorder ${payload.invoiceId}`],
    ['Komplain Pesanan', `${usedPrefix}komplain ${payload.invoiceId}`]
  ]

  if (receiptImage) {
    await conn.sendMessage(target, { image: receiptImage, caption: text }, { quoted: m }).catch(() => {})
    return true
  }

  if (typeof conn.sendButton === 'function') {
    try {
      await conn.sendButton(target, text, 'NenelCraft Store', buttons, m)
      return true
    } catch (err) {
      console.error('Gagal kirim done ke pelanggan:', err.message)
    }
  }

  await conn.sendMessage(target, { text }, { quoted: m }).catch(() => {})
  return true
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const prefix = usedPrefix || '.'
  const cmd = command || 'done'
  if (!text) {
    return m.reply([
      '*Input order selesai / pembayaran lunas*',
      '',
      `Format invoice: ${prefix + cmd} INV-xxxx | 62812xxxx | Nama | Nominal | Metode | Catatan`,
      `Format tanpa invoice: ${prefix + cmd} 62812xxxx | Nama | Nominal | Metode | Catatan`,
      `Contoh: ${prefix + cmd} 628123456789 | Nenel | 10000 | QRIS | Sudah bayar`,
      '',
      'Nomor pelanggan wajib kalau invoice belum pernah dibuat dari .order.'
    ].join('\n'))
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    const confirmation = createManualConfirmation(text, m)
    const existing = getOrder(confirmation.invoiceId)
    const account = await ensureMoneyTrackAccount(m)
    if (!roleCanUseBusiness(account)) {
      throw new Error('Akun MoneyTrack nomor ini belum punya akses Bisnis. Ubah role akun ke UserBisnis/UserBisnisPribadi/Admin.')
    }
    if (existing?.spreadsheetId && existing.spreadsheetId !== account.spreadsheetId) {
      throw new Error('Invoice ini terhubung ke akun MoneyTrack lain. Bot tidak akan menulis ke database akun lain.')
    }

    const payload = existing
      ? {
          ...existing,
          status: ORDER_STATUSES.paid,
          total: confirmation.total || existing.total,
          subtotal: confirmation.subtotal || existing.subtotal,
          metodePembayaran: confirmation.metodePembayaran || existing.metodePembayaran,
          catatan: confirmation.catatan || existing.catatan,
          nomorWa: confirmation.nomorWa || existing.nomorWa,
          userJid: confirmation.userJid || existing.userJid,
          dibuatOlehWa: account.noWa || confirmation.dibuatOlehWa || existing.dibuatOlehWa,
          confirmedAt: new Date().toISOString()
        }
      : confirmation
    payload.status = ORDER_STATUSES.paid
    if (!payload.nomorWa) {
      throw new Error(`Nomor pelanggan wajib ditulis.\nContoh: ${prefix + cmd} 628123456789 | Nama | 10000 | QRIS | catatan`)
    }
    payload.items = ensurePaidItems(payload)
    payload.subtotal = payload.subtotal || payload.items.reduce((sum, item) => sum + Number(item.total || 0), 0)
    payload.total = payload.total || payload.subtotal
    payload.spreadsheetId = account.spreadsheetId
    payload.moneytrackUsername = account.username
    payload.moneytrackRole = account.role

    saveOrder(payload)
    await persistDb()

    let syncNote = ''
    try {
      const sync = await syncOrderToMoneyTrack(payload, account)
      syncNote = sync.status === 'skipped' ? `\n\nCatatan sync: ${sync.pesan}` : ''
    } catch (err) {
      syncNote = `\n\nCatatan sync: gagal ke MoneyTrack (${err.message}). Data tetap tersimpan di bot.`
    }

    let receiptImage = null
    try {
      receiptImage = await generateInvoiceImage(payload)
    } catch (err) {
      syncNote += `\n\nCatatan nota: gagal membuat gambar (${err.message}).`
    }

    const adminText = [
      '*Order selesai dan lunas*',
      '',
      orderDetailText(payload),
      '',
      `Status: ${ORDER_STATUSES.paid}`,
      `Dikirim ke pelanggan: ${payload.nomorWa}.`,
      syncNote
    ].filter(Boolean).join('\n')

    if (receiptImage) {
      await conn.sendMessage(m.chat, { image: receiptImage, caption: adminText }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: adminText }, { quoted: m })
    }

    await sendDoneToCustomer(conn, m, payload, receiptImage, prefix)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    return m.reply(err.message)
  }
}

handler.help = ['done <nomor|nama|nominal|metode>']
handler.tags = ['moneytrack']
handler.command = /^done$/i

export default handler
