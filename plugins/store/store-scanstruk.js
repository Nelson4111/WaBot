import axios from 'axios'
import FormData from 'form-data'
import {
  ensureMoneyTrackAccount,
  getReceiptDraft,
  loadMoneyTrackMaster,
  normalizePhone,
  parseReceiptTextToDraft,
  persistDb,
  receiptDraftText,
  removeReceiptDraft,
  roleCanUseBusiness,
  roleCanUsePersonal,
  saveReceiptDraft,
  syncReceiptDraftTransactions
} from '../../lib/nenelcraft.js'

function help(usedPrefix = '.') {
  return [
    '*Scan Struk MoneyTrack*',
    '',
    `Kirim/reply gambar struk dengan caption: ${usedPrefix}scanstruk`,
    `Manual teks OCR: ${usedPrefix}scanstruk Total 25000\\nRoti 10000\\nAir 5000`,
    `Pilih akun: ${usedPrefix}scanstruk --akun Cash`,
    `Mode bisnis: ${usedPrefix}scanstruk --bisnis --akun BCA`,
    '',
    `Aksi draft: ${usedPrefix}simpanstruk STRUK-ID | ${usedPrefix}detailstruk STRUK-ID | ${usedPrefix}batalstruk STRUK-ID`
  ].join('\n')
}

function stripOptionQuotes(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '')
}

function parseScanOptions(text) {
  const options = {}
  let body = String(text || '').trim()
  body = body.replace(/--(akun|mode|jenis)\s+("[^"]+"|'[^']+'|[^\s]+)/gi, (_, key, value) => {
    options[key.toLowerCase()] = stripOptionQuotes(value)
    return ''
  })
  body = body.replace(/--(bisnis|pribadi)\b/gi, (_, key) => {
    options.mode = key.toLowerCase()
    return ''
  })
  return { body: body.trim(), options }
}

function financeTypeFromOptions(account, options) {
  const mode = String(options.mode || '').toLowerCase()
  if (mode === 'bisnis') return 'Bisnis'
  if (mode === 'pribadi') return 'Pribadi'
  return account.role === 'UserBisnis' ? 'Bisnis' : 'Pribadi'
}

function assertFinanceAccess(account, financeType) {
  if (financeType === 'Bisnis' && !roleCanUseBusiness(account)) {
    throw new Error('Akun MoneyTrack nomor ini belum punya akses Bisnis.')
  }
  if (financeType === 'Pribadi' && !roleCanUsePersonal(account)) {
    throw new Error('Akun MoneyTrack nomor ini belum punya akses Pribadi.')
  }
}

async function uploadByUguu(buffer, ext = 'jpg') {
  const form = new FormData()
  form.append('files[]', buffer, `struk.${ext || 'jpg'}`)
  const res = await axios.post('https://uguu.se/upload.php', form, {
    headers: form.getHeaders(),
    timeout: 30000
  })
  const url = res.data?.files?.[0]?.url
  if (!url) throw new Error('Upload gambar struk gagal.')
  return url
}

async function ocrImageBuffer(buffer, mime = 'image/jpeg') {
  const ext = String(mime || 'image/jpeg').split('/')[1] || 'jpg'
  const imageUrl = await uploadByUguu(buffer, ext)
  const { data } = await axios.get(`https://www.abella.icu/ocr?imageUrl=${encodeURIComponent(imageUrl)}`, {
    timeout: 45000
  })
  if (data?.status !== 'success') throw new Error('OCR gagal membaca gambar struk.')
  const text = data.data?.extractedText || ''
  if (!String(text).trim()) throw new Error('OCR tidak menemukan teks pada gambar struk.')
  return String(text).replace(/\r/g, '')
}

async function getReceiptTextFromMessage(m, body) {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  if (/^image\//.test(mime)) {
    const media = await q.download()
    return {
      text: await ocrImageBuffer(media, mime),
      fileName: `struk.${String(mime).split('/')[1] || 'jpg'}`
    }
  }
  if (body) return { text: body, fileName: 'teks-struk.txt' }
  throw new Error('Kirim/reply gambar struk, atau tulis teks struk setelah command.')
}

function draftAccessOk(draft, m, account) {
  if (!draft) return false
  if (draft.spreadsheetId && draft.spreadsheetId === account.spreadsheetId) return true
  if (draft.senderJid && draft.senderJid === m.sender) return true
  return false
}

async function sendDraftButtons(conn, m, text, draftId, usedPrefix) {
  const buttons = [
    ['Simpan Semua', `${usedPrefix}simpanstruk ${draftId}`],
    ['Detail Struk', `${usedPrefix}detailstruk ${draftId}`],
    ['Batal', `${usedPrefix}batalstruk ${draftId}`]
  ]

  if (typeof conn.sendButton === 'function') {
    try {
      await conn.sendButton(m.chat, text, 'MoneyTrack Struk', buttons, m)
      return
    } catch (err) {
      console.error('Gagal kirim tombol struk:', err.message)
    }
  }

  await conn.sendMessage(m.chat, {
    text: [
      text,
      '',
      `Aksi:`,
      `${usedPrefix}simpanstruk ${draftId}`,
      `${usedPrefix}detailstruk ${draftId}`,
      `${usedPrefix}batalstruk ${draftId}`
    ].join('\n')
  }, { quoted: m })
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text && !/scanstruk/i.test(command)) return m.reply(help(usedPrefix))

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    if (command === 'scanstruk') {
      const { body, options } = parseScanOptions(text)
      const account = await ensureMoneyTrackAccount(m)
      const financeType = financeTypeFromOptions(account, options)
      assertFinanceAccess(account, financeType)

      const source = await getReceiptTextFromMessage(m, body)
      const master = await loadMoneyTrackMaster(account)
      const draft = parseReceiptTextToDraft(source.text, master, account, {
        fileName: source.fileName,
        financeType,
        akun: options.akun
      })
      draft.senderJid = m.sender
      draft.senderNumber = normalizePhone(String(m.sender || '').split('@')[0])
      draft.ocrText = source.text
      saveReceiptDraft(draft)
      await persistDb()

      await sendDraftButtons(conn, m, receiptDraftText(draft), draft.draftId, usedPrefix)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
      return
    }

    const draftId = String(text || '').trim().split(/\s+/)[0]
    if (!draftId) return m.reply(help(usedPrefix))

    const account = await ensureMoneyTrackAccount(m)
    const draft = getReceiptDraft(draftId)
    if (!draft) throw new Error('Draft struk tidak ditemukan atau sudah dibatalkan.')
    if (!draftAccessOk(draft, m, account)) {
      throw new Error('Draft struk ini bukan milik akun MoneyTrack kamu.')
    }
    assertFinanceAccess(account, draft.financeType)

    if (command === 'detailstruk') {
      const raw = draft.rawText || draft.ocrText || ''
      const rawText = raw ? `\n\n*Teks OCR:*\n${raw.slice(0, 1200)}` : ''
      await sendDraftButtons(conn, m, receiptDraftText(draft, 30) + rawText, draft.draftId, usedPrefix)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
      return
    }

    if (command === 'batalstruk') {
      removeReceiptDraft(draft.draftId)
      await persistDb()
      await conn.sendMessage(m.chat, { text: `Draft ${draft.draftId} dibatalkan.` }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
      return
    }

    if (command === 'simpanstruk') {
      const results = await syncReceiptDraftTransactions(draft, account)
      removeReceiptDraft(draft.draftId)
      await persistDb()

      const ids = results.map((item, index) => {
        const id = item.res?.data?.id || item.res?.data?.ID || '-'
        return `${index + 1}. ${item.payload.keterangan} -> ${id}`
      }).join('\n')

      await conn.sendMessage(m.chat, {
        text: [
          '*Struk berhasil disimpan ke MoneyTrack*',
          '',
          `Draft: ${draft.draftId}`,
          `Database: ${account.nama || account.username || '-'} (@${account.username || '-'})`,
          `Item tersimpan: ${results.length}`,
          '',
          ids
        ].join('\n')
      }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    return m.reply(`${err.message}\n\n${help(usedPrefix)}`)
  }
}

handler.help = ['scanstruk <reply gambar>', 'simpanstruk <id>', 'detailstruk <id>', 'batalstruk <id>']
handler.tags = ['moneytrack']
handler.command = /^(scanstruk|simpanstruk|detailstruk|batalstruk)$/i

export default handler
