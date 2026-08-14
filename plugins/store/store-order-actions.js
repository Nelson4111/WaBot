import {
  ORDER_STATUSES,
  buildWaMeLink,
  getLatestUserOrder,
  getOrder,
  notifyOwnerOrder,
  orderDetailText,
  persistDb,
  saveOrder,
  syncConfirmationToMoneyTrack,
  updateLocalOrderStatus
} from '../../lib/nenelcraft.js'

function resolveOrder(text, m) {
  const invoiceId = String(text || '').trim().split(/\s+/)[0]
  if (invoiceId) return getOrder(invoiceId.toUpperCase())
  return getLatestUserOrder(m.sender)
}

function bolehAksesOrder(order, m, isOwner) {
  return isOwner || !order.userJid || order.userJid === m.sender
}

const handler = async (m, { conn, text, command, isOwner }) => {
  const order = resolveOrder(text, m)
  if (!order) {
    return m.reply('Invoice tidak ditemukan. Kirim invoice ID, contoh: .detailorder INV-xxxx')
  }
  if (!bolehAksesOrder(order, m, isOwner)) {
    return m.reply('Invoice ini bukan milik nomor kamu.')
  }

  if (command === 'detailorder') {
    return m.reply(orderDetailText(order))
  }

  if (command === 'komplain') {
    const link = buildWaMeLink('complaint', order)
    return conn.sendMessage(m.chat, {
      text: `Link komplain pesanan:\n${link}`
    }, { quoted: m })
  }

  if (command === 'bayar') {
    const updated = updateLocalOrderStatus(order.invoiceId, ORDER_STATUSES.waitingVerification, {
      confirmedAt: new Date().toISOString()
    })
    await persistDb()

    let syncNote = ''
    try {
      const sync = await syncConfirmationToMoneyTrack(updated)
      syncNote = sync.status === 'skipped' ? `\n\nCatatan sync: ${sync.pesan}` : ''
    } catch (err) {
      syncNote = `\n\nCatatan sync: gagal ke MoneyTrack (${err.message}). Data tetap tersimpan di bot.`
    }

    const link = buildWaMeLink('payment', updated)
    await conn.sendMessage(m.chat, {
      text: [
        `Status invoice ${updated.invoiceId} diubah menjadi *Menunggu Verifikasi*.`,
        'Kirim link ini ke admin; teks invoice sudah otomatis terisi, jadi tidak perlu kirim foto struk lagi.',
        link,
        syncNote
      ].filter(Boolean).join('\n\n')
    }, { quoted: m })

    await notifyOwnerOrder(conn, updated, 'confirmation')
  }
}

handler.help = ['bayar <invoice>', 'komplain <invoice>', 'detailorder <invoice>']
handler.tags = ['moneytrack']
handler.command = /^(bayar|komplain|detailorder)$/i

export default handler
