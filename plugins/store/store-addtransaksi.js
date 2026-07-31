import {
  buildPersonalTransactionPayload,
  canAccessPersonalTransaction,
  deletePersonalTransaction,
  ensureMoneyTrackAccount,
  formatRupiah,
  getPersonalTransaction,
  loadMoneyTrackMaster,
  normalizePhone,
  parsePersonalTransactionText,
  persistDb,
  removePersonalTransaction,
  roleCanUsePersonal,
  savePersonalTransaction,
  syncPersonalTransaction,
  updatePersonalTransaction
} from '../../lib/nenelcraft.js'

function commandHelp(usedPrefix = '.') {
  return [
    '*Transaksi Pribadi MoneyTrack*',
    '',
    `Tambah: ${usedPrefix}addtransaksi keluar | makan | 25000 | Cash | beli nasi`,
    `Tambah: ${usedPrefix}addtransaksi masuk | gaji | 1500000 | BCA | gaji bulan ini`,
    `Edit: ${usedPrefix}edittransaksi TRX_ID keluar | makan | 20000 | Cash | revisi`,
    `Hapus: ${usedPrefix}hapustransaksi TRX_ID`,
    '',
    'Kategori dan akun akan dicocokkan dengan master MoneyTrack. Kalau nomor WA belum terdaftar, isi dulu Nomor WA di profil akun web.'
  ].join('\n')
}

function splitIdAndBody(text) {
  const raw = String(text || '').trim()
  const [id, ...rest] = raw.split(/\s+/)
  return { id: id || '', body: rest.join(' ').trim() }
}

function ensureSameMoneyTrackAccount(record, account) {
  if (record?.spreadsheetId && record.spreadsheetId !== account.spreadsheetId) {
    throw new Error('Transaksi ini terhubung ke akun MoneyTrack lain. Bot tidak akan mengubah database akun lain.')
  }
}

function formatMatchedLine(label, input, output, score) {
  if (!input || !output) return `${label}: ${output || '-'}`
  if (String(input).trim().toLowerCase() === String(output).trim().toLowerCase()) {
    return `${label}: ${output}`
  }
  const percent = Math.round((Number(score) || 0) * 100)
  return `${label}: ${output} (dibaca dari "${input}", ${percent}%)`
}

function transactionSummary(title, transaksiId, payload, matched, account) {
  const akun = payload.tipeTransaksi === 'Pemasukan' ? payload.akunTujuan : payload.akunAsal
  return [
    `*${title}*`,
    '',
    `ID: ${transaksiId}`,
    `Database: ${account.nama || account.username || '-'} (@${account.username || '-'})`,
    `Tanggal: ${payload.tanggal}`,
    `Jenis: ${payload.tipeTransaksi}`,
    formatMatchedLine('Kategori', matched?.kategoriInput, payload.kategori, matched?.kategoriScore),
    formatMatchedLine('Akun', matched?.akunInput, akun, matched?.akunScore),
    `Nominal: ${formatRupiah(payload.nominal)}`,
    payload.keterangan ? `Catatan: ${payload.keterangan}` : ''
  ].filter(Boolean).join('\n')
}

async function sendTransactionButtons(conn, m, text, transaksiId, usedPrefix) {
  const buttons = [
    ['Edit Transaksi', `${usedPrefix}edittransaksi ${transaksiId}`],
    ['Hapus Transaksi', `${usedPrefix}hapustransaksi ${transaksiId}`]
  ]

  if (typeof conn.sendButton === 'function') {
    try {
      await conn.sendButton(m.chat, text, 'MoneyTrack Bot', buttons, m)
      return
    } catch (err) {
      console.error('Gagal kirim tombol transaksi:', err.message)
    }
  }

  await conn.sendMessage(m.chat, {
    text: [
      text,
      '',
      `Aksi:`,
      `${usedPrefix}edittransaksi ${transaksiId} keluar | kategori | nominal | akun | catatan`,
      `${usedPrefix}hapustransaksi ${transaksiId}`
    ].join('\n')
  }, { quoted: m })
}

async function resolvePersonalPayload(text, account) {
  const input = parsePersonalTransactionText(text)
  const master = await loadMoneyTrackMaster(account)
  return buildPersonalTransactionPayload(input, master, account)
}

async function getWritablePersonalAccount(m) {
  const account = await ensureMoneyTrackAccount(m)
  if (!roleCanUsePersonal(account)) {
    throw new Error('Akun MoneyTrack nomor ini belum punya akses Pribadi. Ubah role akun ke UserPribadi/UserBisnisPribadi/Admin.')
  }
  return account
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text && command !== 'hapustransaksi') return m.reply(commandHelp(usedPrefix))

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    if (command === 'addtransaksi') {
      const account = await getWritablePersonalAccount(m)
      const built = await resolvePersonalPayload(text, account)
      const res = await syncPersonalTransaction(built.payload, account)
      if (res.status === 'skipped') throw new Error(res.pesan || 'Transaksi belum terkirim ke MoneyTrack.')

      const transaksiId = res.data?.id || res.data?.ID || ''
      if (!transaksiId) throw new Error('MoneyTrack berhasil merespons, tetapi ID transaksi tidak dikirim.')

      savePersonalTransaction({
        transaksiId,
        senderJid: m.sender,
        senderNumber: normalizePhone(String(m.sender || '').split('@')[0]),
        spreadsheetId: account.spreadsheetId,
        accountUsername: account.username,
        accountName: account.nama,
        role: account.role,
        payload: built.payload,
        matched: built.matched,
        createdAt: new Date().toISOString()
      })
      await persistDb()

      const summary = transactionSummary('Transaksi pribadi berhasil ditambahkan', transaksiId, built.payload, built.matched, account)
      await sendTransactionButtons(conn, m, summary, transaksiId, usedPrefix)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
      return
    }

    if (command === 'edittransaksi') {
      const { id, body } = splitIdAndBody(text)
      if (!id || !body) {
        return m.reply([
          'Kirim data baru setelah ID transaksi.',
          `Contoh: ${usedPrefix}edittransaksi ${id || 'TRX_ID'} keluar | makan | 20000 | Cash | revisi`
        ].join('\n'))
      }

      const record = getPersonalTransaction(id)
      if (record && !canAccessPersonalTransaction(record, m, false)) {
        throw new Error('Transaksi ini bukan milik nomor kamu.')
      }

      const account = await getWritablePersonalAccount(m)
      ensureSameMoneyTrackAccount(record, account)
      const built = await resolvePersonalPayload(body, account)
      const res = await updatePersonalTransaction(id, built.payload, account)
      if (res.status === 'skipped') throw new Error(res.pesan || 'Perubahan belum terkirim ke MoneyTrack.')

      savePersonalTransaction({
        transaksiId: id,
        senderJid: m.sender,
        senderNumber: normalizePhone(String(m.sender || '').split('@')[0]),
        spreadsheetId: account.spreadsheetId,
        accountUsername: account.username,
        accountName: account.nama,
        role: account.role,
        payload: built.payload,
        matched: built.matched,
        updatedAt: new Date().toISOString()
      })
      await persistDb()

      const summary = transactionSummary('Transaksi pribadi berhasil diedit', id, built.payload, built.matched, account)
      await sendTransactionButtons(conn, m, summary, id, usedPrefix)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
      return
    }

    if (command === 'hapustransaksi') {
      const { id } = splitIdAndBody(text)
      if (!id) return m.reply(`Kirim ID transaksi.\nContoh: ${usedPrefix}hapustransaksi TRX_ID`)

      const record = getPersonalTransaction(id)
      if (record && !canAccessPersonalTransaction(record, m, false)) {
        throw new Error('Transaksi ini bukan milik nomor kamu.')
      }

      const account = await getWritablePersonalAccount(m)
      ensureSameMoneyTrackAccount(record, account)
      const res = await deletePersonalTransaction(id, account)
      if (res.status === 'skipped') throw new Error(res.pesan || 'Penghapusan belum terkirim ke MoneyTrack.')

      removePersonalTransaction(id)
      await persistDb()

      await conn.sendMessage(m.chat, {
        text: [
          '*Transaksi pribadi berhasil dihapus*',
          '',
          `ID: ${id}`,
          `Database: ${account.nama || account.username || '-'} (@${account.username || '-'})`
        ].join('\n')
      }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    return m.reply(`${err.message}\n\n${commandHelp(usedPrefix)}`)
  }
}

handler.help = ['addtransaksi <tipe|kategori|nominal|akun>', 'edittransaksi <id> <data>', 'hapustransaksi <id>']
handler.tags = ['moneytrack']
handler.command = /^(addtransaksi|edittransaksi|hapustransaksi)$/i

export default handler
