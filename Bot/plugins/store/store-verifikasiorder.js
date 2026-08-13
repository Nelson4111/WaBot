import {
  ORDER_STATUSES,
  ensureMoneyTrackAccount,
  formatRupiah,
  getOrder,
  orderDetailText,
  persistDb,
  roleCanUseBusiness,
  syncStatusToMoneyTrack,
  updateLocalOrderStatus
} from '../../lib/nenelcraft.js'

const handler = async (m, { conn, text, command }) => {
  try {
    const [invoiceRaw, ...reasonParts] = String(text || '').trim().split(/\s+/)
    const invoiceId = (invoiceRaw || '').toUpperCase()

    if (!invoiceId) {
      return m.reply([
        'Format aksi bisnis:',
        '.veriforder INV-xxxx',
        '.lunasorder INV-xxxx',
        '.tolakorder INV-xxxx alasan',
        '.hubungiorder INV-xxxx'
      ].join('\n'))
    }

    const order = getOrder(invoiceId)
    const account = await ensureMoneyTrackAccount(m)
    if (!roleCanUseBusiness(account)) {
      return m.reply('Akun MoneyTrack nomor ini belum punya akses Bisnis. Command order/done/verifikasi hanya untuk akun bisnis.')
    }
    if (order?.spreadsheetId && order.spreadsheetId !== account.spreadsheetId) {
      return m.reply('Invoice ini terhubung ke akun MoneyTrack lain. Bot tidak akan mengubah database akun lain.')
    }

    if (command === 'hubungiorder') {
      if (!order) return m.reply('Invoice tidak ditemukan di database bot.')
      return m.reply(`Hubungi user:\nhttps://wa.me/${order.nomorWa || ''}`)
    }

    const isReject = command === 'tolakorder'
    const status = isReject ? ORDER_STATUSES.rejected : ORDER_STATUSES.paid
    const reason = reasonParts.join(' ').trim()

    if (isReject && !reason) {
      return m.reply('Tambahkan alasan penolakan.\nContoh: .tolakorder INV-xxxx nominal belum masuk')
    }

    const updated = order
      ? updateLocalOrderStatus(invoiceId, status, { rejectReason: reason })
      : null
    await persistDb()

    let syncNote = ''
    try {
      await syncStatusToMoneyTrack(invoiceId, status, reason, updated || order || account)
    } catch (err) {
      syncNote = `\n\nCatatan sync: gagal ke MoneyTrack (${err.message}).`
    }

    if (updated && updated.userJid) {
      const userText = isReject
        ? [
            `Pembayaran invoice ${invoiceId} ditolak.`,
            `Alasan: ${reason}`,
            'Silakan konfirmasi ulang jika sudah diperbaiki dengan .bayar ' + invoiceId
          ].join('\n')
        : [
            `Pembayaran invoice ${invoiceId} berhasil diverifikasi.`,
            `Status pesanan sudah *Lunas*.`,
            `Total: ${formatRupiah(updated.total || 0)}`
          ].join('\n')

      await conn.sendMessage(updated.userJid, { text: userText }).catch(() => {})
    }

    return m.reply([
      `Status ${invoiceId} berhasil diubah menjadi ${status}.`,
      updated ? orderDetailText(updated) : 'Invoice tidak ada di database lokal bot, tetapi sync status tetap dicoba ke MoneyTrack.',
      syncNote
    ].filter(Boolean).join('\n\n'))
  } catch (err) {
    return m.reply(err.message)
  }
}

handler.help = ['veriforder <invoice>', 'lunasorder <invoice>', 'tolakorder <invoice> <alasan>', 'hubungiorder <invoice>']
handler.tags = ['moneytrack']
handler.command = /^(veriforder|lunasorder|tolakorder|hubungiorder)$/i

export default handler
