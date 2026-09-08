import fs from 'fs'
import path from 'path'
import { toSmallNum } from '../../lib/style.js'

const databasePath = path.join(process.cwd(), 'lib/database/absen.json')

const readDB = () => {
  if (!fs.existsSync(databasePath)) return {}
  try {
    return JSON.parse(fs.readFileSync(databasePath, 'utf-8'))
  } catch {
    return {}
  }
}

const writeDB = (data) => {
  const dir = path.dirname(databasePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2))
}

const getTodayWIB = () => {
  return new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: '2-digit', month: 'long', year: 'numeric' })
}

const getTimeWIB = () => {
  return new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: '2-digit', minute: '2-digit' }).replace('.', ':')
}

const STATUS_MAP = {
  '1': 'HADIR',
  '2': 'SAKIT',
  '3': 'IZIN',
  '4': 'ALPHA',
  'HADIR': 'HADIR',
  'SAKIT': 'SAKIT',
  'IZIN': 'IZIN',
  'ALPHA': 'ALPHA'
}

const STATUS_ICONS = {
  'HADIR': '⟡ ʜᴀᴅɪʀ',
  'SAKIT': '◈ ꜱᴀᴋɪᴛ',
  'IZIN': '✧ ɪᴢɪɴ',
  'ALPHA': '❖ ᴀʟᴘʜᴀ'
}

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isOwner }) => {
  let db = readDB()
  let id = m.chat
  let today = getTodayWIB()

  if (db[id] && db[id].date !== today) {
    delete db[id]
    writeDB(db)
  }

  let inputCmd = command.toLowerCase()
  let cleanText = (text || '').trim().toUpperCase()

  // 1. Menghapus Data Absen Hari Ini
  if (inputCmd === 'hapusabsen') {
    if (!isAdmin && !isOwner) {
      return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
    }
    if (!db[id]) {
      return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada data sesi absen aktif untuk dihapus.\n*╰───────────────*')
    }
    delete db[id]
    writeDB(db)
    return m.reply('*╭  〔 ❖ ᴀ ʙ ꜱ ᴇ ɴ  ᴅ ɪ ʜ ᴀ ᴘ ᴜ ꜱ 〕*\n> Data absen hari ini telah berhasil dibersihkan ✦\n*╰───────────────*')
  }

  // 2. Mengecek Rekapitulasi Absen Hari Ini
  if (inputCmd === 'cekabsen' || inputCmd === 'rekapabsen') {
    if (!db[id]) {
      return m.reply(`*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Belum ada sesi absen hari ini.\n> Admin dapat memulai sesi dengan *${usedPrefix}mulaiabsen <judul>*\n*╰───────────────*`)
    }

    let pesertaList = db[id].peserta || []
    let listC = pesertaList.map((v, i) => {
      let num = toSmallNum(i + 1)
      let icon = STATUS_ICONS[v.status] || `[${v.status}]`
      let userNum = v.id.split('@')[0].replace(/\D/g, '')
      return `*┆*   ${num}. @${userNum} › *${icon}* _(Jam ${v.waktu})_`
    }).join('\n')

    let res = `*──  ୨୧ ✧ REKAPITULASI KEHADIRAN ✧ ୨୧  ──*

> *おしらせ!* (ᴅᴀꜰᴛᴀʀ ʜᴀᴅɪʀ)
> ${db[id].keterangan}

*╭  〔 ❖ ɪ ɴ ꜰ ᴏ  ꜱ ᴇ ꜱ ɪ 〕*
*┆* ⟡ ᴛᴀɴɢɢᴀʟ : *${db[id].date}*
*┆* ✧ ᴛᴏᴛᴀʟ   : *${toSmallNum(pesertaList.length)} Anggota*
*╰───────────────*

*╭  〔 ⟡ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴘ ᴇ ꜱ ᴇ ʀ ᴛ ᴀ 〕*
${listC || '*┆* _(Belum ada peserta yang mengisi absen)_'}
*╰───────────────*

> ｡˚ ⊹ _Isi kehadiran dengan mengetik .hadir / .izin / .sakit / .alpha_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: res,
      mentions: pesertaList.map(p => p.id)
    }, { quoted: m })
  }

  // 3. Memulai Sesi Absen Baru (Khusus Admin)
  let isCreatingNewSession = false
  if (inputCmd === 'mulaiabsen') {
    isCreatingNewSession = true
  } else if (inputCmd === 'absen' && (isAdmin || isOwner)) {
    if (cleanText && !['1', '2', '3', '4', 'HADIR', 'SAKIT', 'IZIN', 'ALPHA'].includes(cleanText)) {
      isCreatingNewSession = true
    }
  }

  if (isCreatingNewSession) {
    if (!isAdmin && !isOwner) {
      return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
    }

    let keterangan = text ? text.trim() : 'Absen Kehadiran Anggota Grup'
    const senderNum = m.sender.split('@')[0].replace(/\D/g, '')

    let annText = `*──  ୨୧ ✧ SESI ABSEN DIBUKA ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ ᴀʙꜱᴇɴ)
> Sesi kehadiran resmi dibuka oleh Admin @${senderNum} ✦

*╭  〔 ❖ ʀ ɪ ɴ ᴄ ɪ ᴀ ɴ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${keterangan}*
*┆* ✧ ᴛᴀɴɢɢᴀʟ : *${today}*
*╰───────────────*

*╭  〔 ⟡ ᴘ ɪ ʟ ɪ ʜ ᴀ ɴ  ᴋ ᴇ ʜ ᴀ ᴅ ɪ ʀ ᴀ ɴ 〕*
*┆* 𝟷. ⟡ *HADIR* (Balas angka *1* atau ketik *.hadir*)
*┆* 𝟸. ◈ *SAKIT* (Balas angka *2* atau ketik *.sakit*)
*┆* 𝟹. ✧ *IZIN*  (Balas angka *3* atau ketik *.izin*)
*┆* 𝟺. ❖ *ALPHA* (Balas angka *4* atau ketik *.alpha*)
*╰───────────────*

> _Ketik *${usedPrefix}cekabsen* untuk melihat rekapitulasi kehadiran._`.trim()

    let msg = await conn.sendMessage(m.chat, {
      text: annText,
      mentions: [m.sender]
    }, { quoted: m })

    db[id] = {
      date: today,
      keterangan: keterangan,
      annMsgId: msg?.key?.id || '',
      peserta: []
    }
    writeDB(db)
    return
  }

  // 4. Mengisi Absen via Perintah Teks
  if (!db[id]) {
    return m.reply(`*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Sesi absen hari ini belum dibuka.\n> Admin dapat membuka sesi dengan *${usedPrefix}mulaiabsen <judul>*\n*╰───────────────*`)
  }

  let selectedStatus = STATUS_MAP[inputCmd.toUpperCase()] || STATUS_MAP[cleanText] || 'HADIR'
  let voterJidClean = conn.decodeJid(m.sender)

  if (!db[id].peserta) db[id].peserta = []
  let existingIndex = db[id].peserta.findIndex(p => p.id === voterJidClean)
  if (existingIndex > -1) {
    db[id].peserta[existingIndex].status = selectedStatus
    db[id].peserta[existingIndex].waktu = getTimeWIB()
  } else {
    db[id].peserta.push({
      id: voterJidClean,
      waktu: getTimeWIB(),
      status: selectedStatus
    })
  }
  writeDB(db)

  let icon = STATUS_ICONS[selectedStatus] || selectedStatus
  let userNum = voterJidClean.split('@')[0].replace(/\D/g, '')

  return conn.sendMessage(m.chat, {
    text: `*╭  〔 ⟡ ᴀ ʙ ꜱ ᴇ ɴ  ᴛ ᴇ ʀ ᴄ ᴀ ᴛ ᴀ ᴛ 〕*\n*┆* ⟡ ɴᴀᴍᴀ   : @${userNum}\n*┆* ✧ ᴡᴀᴋᴛᴜ  : *${getTimeWIB()} WIB*\n*┆* ✦ ꜱᴛᴀᴛᴜꜱ : *${icon}*\n*╰───────────────*\n\n> _Ketik *${usedPrefix}cekabsen* untuk melihat rekapitulasi._`,
    mentions: [voterJidClean]
  }, { quoted: m })
}

handler.all = async function (m) {
  if (!m.isGroup || !m.text || m.isBaileys) return

  let db = readDB()
  let id = m.chat
  if (!db[id]) return

  let conn = this
  let textClean = m.text.trim().toLowerCase()
  let selectedStatus = null

  // Hanya respon jika user me-reply pesan pengumuman absen secara spesifik
  if (m.quoted && db[id].annMsgId && m.quoted.id === db[id].annMsgId) {
    if (['1', 'hadir'].includes(textClean)) selectedStatus = 'HADIR'
    else if (['2', 'sakit'].includes(textClean)) selectedStatus = 'SAKIT'
    else if (['3', 'izin'].includes(textClean)) selectedStatus = 'IZIN'
    else if (['4', 'alpha'].includes(textClean)) selectedStatus = 'ALPHA'
  }

  if (selectedStatus) {
    let voterJidClean = conn.decodeJid(m.sender)
    if (!db[id].peserta) db[id].peserta = []
    
    let existingIndex = db[id].peserta.findIndex(p => p.id === voterJidClean)
    if (existingIndex > -1) {
      db[id].peserta[existingIndex].status = selectedStatus
      db[id].peserta[existingIndex].waktu = getTimeWIB()
    } else {
      db[id].peserta.push({
        id: voterJidClean,
        waktu: getTimeWIB(),
        status: selectedStatus
      })
    }
    writeDB(db)

    let icon = STATUS_ICONS[selectedStatus] || selectedStatus
    let userNum = voterJidClean.split('@')[0].replace(/\D/g, '')

    await conn.sendMessage(m.chat, {
      text: `*╭  〔 ⟡ ᴀ ʙ ꜱ ᴇ ɴ  ᴛ ᴇ ʀ ᴄ ᴀ ᴛ ᴀ ᴛ 〕*\n*┆* ⟡ ɴᴀᴍᴀ   : @${userNum}\n*┆* ✧ ᴡᴀᴋᴛᴜ  : *${getTimeWIB()} WIB*\n*┆* ✦ ꜱᴛᴀᴛᴜꜱ : *${icon}*\n*╰───────────────*\n\n> _Ketik .cekabsen untuk melihat rekapitulasi._`,
      mentions: [voterJidClean]
    }, { quoted: m }).catch(() => {})
  }
}

handler.help = ['mulaiabsen <judul>', 'absen <status>', 'cekabsen', 'hapusabsen', 'hadir', 'sakit', 'izin', 'alpha']
handler.tags = ['group']
handler.command = /^(absen|mulaiabsen|cekabsen|rekapabsen|hapusabsen|hadir|sakit|izin|alpha)$/i
handler.group = true

export default handler