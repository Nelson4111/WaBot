import {
  createOrderFromText,
  ensureMoneyTrackAccount,
  fallbackActionText,
  generateInvoiceImage,
  notifyOwnerOrder,
  persistDb,
  roleCanUseBusiness,
  saveOrder,
  sendInvoiceWithActions,
  syncOrderToMoneyTrack
} from '../../lib/nenelcraft.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const contoh = [
      '*Order NenelCraft Store*',
      '',
      `Contoh format:`,
      `${usedPrefix + command} 62812xxxx | Diamond Rank|1|10000; Joki FF|1|20000 --metode QRIS --diskon 0 --nama Budi`,
      '',
      'Nomor pembeli wajib di depan atau pakai --nomor 62812xxxx.',
      'Format item: Nama Item|Qty|Harga Satuan',
      'Pisahkan banyak item dengan titik koma (;).',
      '',
      'Setelah invoice terkirim, pilih tombol atau pakai:',
      `${usedPrefix}bayar INV-xxxx`,
      `${usedPrefix}komplain INV-xxxx`,
      `${usedPrefix}detailorder INV-xxxx`
    ].join('\n')

    return conn.sendMessage(m.chat, { text: contoh }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    const account = await ensureMoneyTrackAccount(m)
    if (!roleCanUseBusiness(account)) {
      throw new Error('Akun MoneyTrack nomor ini belum punya akses Bisnis. Ubah role akun ke UserBisnis/UserBisnisPribadi/Admin.')
    }

    const order = createOrderFromText(text, { m })
    if (!order.nomorPembeliExplicit) {
      throw new Error(`Nomor pembeli wajib ditulis.\nContoh: ${usedPrefix + command} 62812xxxx | Diamond Rank|1|10000 --metode QRIS --nama Budi`)
    }
    order.spreadsheetId = account.spreadsheetId
    order.moneytrackUsername = account.username
    order.moneytrackRole = account.role
    saveOrder(order)
    await persistDb()

    let syncInfo = ''
    try {
      const sync = await syncOrderToMoneyTrack(order, account)
      syncInfo = sync.status === 'skipped' ? `\n\nCatatan sync: ${sync.pesan}` : ''
    } catch (err) {
      syncInfo = `\n\nCatatan sync: gagal ke MoneyTrack (${err.message}). Data tetap tersimpan di bot.`
    }

    const invoiceImage = await generateInvoiceImage(order)
    await sendInvoiceWithActions(conn, m, order, invoiceImage, usedPrefix, order.buyerJid)
    await conn.sendMessage(m.chat, {
      text: `Invoice ${order.invoiceId} sudah dikirim ke ${order.nomorWa}.\nDatabase tujuan: ${account.nama} (@${account.username}).${syncInfo}`
    }, { quoted: m })

    await notifyOwnerOrder(conn, order, 'order')
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    const help = fallbackActionText({ invoiceId: 'INV-xxxx' }, usedPrefix)
    return m.reply(`${err.message}\n\n${help}`)
  }
}

handler.help = ['order <nomor pembeli | item|qty|harga>']
handler.tags = ['moneytrack']
handler.command = /^(order)$/i

export default handler
