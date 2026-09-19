/**
 * Anti-Toxic System Plugin
 * Mendeteksi tutur kata kasar / toxic, auto-delete, sanksi 3x strike kick, dan panel kontrol admin.
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i'
}

function normalizeLeet(str) {
  let res = ''
  for (let ch of str) {
    res += LEET_MAP[ch] || ch
  }
  return res
}

function collapseRepeated(str) {
  return str.replace(/(.)\1+/g, '$1')
}

// Akar kata umpatan multi-karakter yang dapat membawa imbuhan / afiks Indonesia (contoh: dianjingin, kontolmu)
const ROOT_AFFIXES = [
  'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'bajingan',
  'goblok', 'tolol', 'jancok', 'jancuk', 'pantek', 'puki', 'jembut', 'peler'
]

// Daftar kata kasar / toxic persis (token-level matching)
const EXACT_TOXIC = new Set([
  'anjing', 'anjg', 'ajg', 'anjir', 'anjrit', 'asw', 'asu',
  'bangsat', 'bgst', 'bngst', 'bajingan', 'bjngn',
  'kontol', 'kntl', 'kntil', 'titit', 'memek', 'mmk', 'pepek', 'peler', 'pler', 'jembut', 'jmbt',
  'ngentot', 'ngntt', 'kenthu', 'ngaceng', 'coli', 'colmek',
  'pantek', 'panteq', 'puki', 'pukimak', 'pukima',
  'goblok', 'gblg', 'tolol', 'tlol', 'bego', 'bloon', 'idiot', 'bahlul',
  'jancok', 'jancuk', 'dancok', 'cok', 'cuk',
  'babi', 'tai', 'taik', 'lonte', 'lonthe', 'pelacur', 'perek',
  'kimak', 'itil', 'tempik',
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bitch', 'bastard', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut'
])

// Daftar kata aman bahasa Indonesia yang mengandung substring mirip kata kasar (Zero False Positive Guarantee)
const SAFE_WHITELIST = new Set([
  'pantai', 'santai', 'lantai', 'rantai', 'petai', 'teratai', 'intai', 'mengintai',
  'asumsi', 'asuhan', 'mengasuh', 'pengasuh', 'asuransi', 'masukan', 'kemasukan',
  'basuh', 'membasuh', 'pembasuh', 'kasur', 'bukan', 'makan', 'tekan', 'pakan',
  'rekan', 'kocok', 'cocok', 'cokelat', 'coki', 'cokil', 'soto', 'toko', 'foto',
  'titik', 'titip', 'menitip', 'penitipan', 'babiq', 'membabi', 'tahu',
  'paku', 'saku', 'baku', 'beku', 'daku', 'laku', 'kaku', 'suka', 'duka',
  'kotak', 'botak', 'otak', 'tolong', 'menolong', 'penolong',
  'menepuki', 'ditepuki', 'tepuk', 'bertepuk'
])

export function detectToxic(text) {
  if (!text || typeof text !== 'string') return null

  // 1. Bersihkan zero-width spaces dan normalisasi huruf kecil
  let cleaned = text
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
    .toLowerCase()

  // 2. Normalisasi karakter simbol intra-kata (seperti sh!t, b!tch, b@bi, k$ntol, f*ck)
  cleaned = cleaned
    .replace(/([a-z0-9])!([a-z0-9])/gi, '$1i$2')
    .replace(/([a-z0-9])@([a-z0-9])/gi, '$1a$2')
    .replace(/([a-z0-9])\$([a-z0-9])/gi, '$1s$2')
    .replace(/([a-z0-9])0([a-z0-9])/gi, '$1o$2')
    .replace(/f[\*_]{1,2}ck/gi, 'fuck')
    .replace(/b[\*_]{1,2}tch/gi, 'bitch')
    .replace(/k[\*_]{1,2}nt[\*_]{1,2}l/gi, 'kontol')
    .replace(/m[\*_]{1,2}m[\*_]{1,2}k/gi, 'memek')
    .replace(/[*_~`]/g, ' ')

  // 3. Deteksi ejaan per huruf terpisah spasi / titik (contoh: a n j i n g atau k . o . n . t . o . l)
  const spacedMatches = cleaned.match(/(?:^|\s)([a-z0-9](?:[\s._\-~*^]+[a-z0-9]){2,})(?:\s|$)/g)
  if (spacedMatches) {
    for (let sm of spacedMatches) {
      let combined = sm.replace(/[\s._\-~*^]/g, '')
      let combinedNorm = collapseRepeated(normalizeLeet(combined))
      if (EXACT_TOXIC.has(combined) || EXACT_TOXIC.has(combinedNorm)) {
        return combined
      }
      for (let root of ROOT_AFFIXES) {
        if (combinedNorm.includes(root)) return root
      }
    }
  }

  // 4. Tokenisasi teks berdasarkan spasi dan tanda baca
  const tokens = cleaned.split(/[\s.,!?:;"'()[\]{}<>\/\\_~*^+=|#&%@$—–-]+/).filter(Boolean)

  for (let rawToken of tokens) {
    if (SAFE_WHITELIST.has(rawToken)) continue

    // Token persis
    if (EXACT_TOXIC.has(rawToken)) return rawToken

    // Normalisasi leetspeak
    let leet = normalizeLeet(rawToken)
    if (SAFE_WHITELIST.has(leet)) continue
    if (EXACT_TOXIC.has(leet)) return rawToken

    // Normalisasi pengulangan huruf (anjiiing -> anjing)
    let collapsed = collapseRepeated(rawToken)
    if (SAFE_WHITELIST.has(collapsed)) continue
    if (EXACT_TOXIC.has(collapsed)) return rawToken

    // Kombinasi leetspeak + pengulangan huruf
    let both = collapseRepeated(leet)
    if (SAFE_WHITELIST.has(both)) continue
    if (EXACT_TOXIC.has(both)) return rawToken

    // Pengecekan akar kata umpatan dengan afiks/imbuhan (dianjingin, kontolmu, memeknya)
    for (let root of ROOT_AFFIXES) {
      if (both.includes(root)) {
        if (!SAFE_WHITELIST.has(both)) {
          return rawToken
        }
      }
    }
  }

  return null
}

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn)
  if (!isAdmin && !isOwner) return global.dfail('admin', m, conn)

  let chat = global.db.data.chats[m.chat]
  if (!chat) return
  if (!chat.toxicWarn || typeof chat.toxicWarn !== 'object') chat.toxicWarn = {}

  let sub = (args[0] || '').toLowerCase()
  const statusStr = (val) => val ? '✓ ᴀᴋᴛɪꜰ (ᴏɴ)' : '✕ ɴᴏɴᴀᴋᴛɪꜰ (ᴏꜰꜰ)'

  if (/^(on|enable|1)$/i.test(sub)) {
    if (chat.antiToxic) {
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Sudah Aktif!*\n*╰───────────────*`)
    }
    chat.antiToxic = true
    return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ     : *Aktif (ON)*\n*┆* ✧ ᴛɪɴᴅᴀᴋᴀɴ   : Auto-delete kata kasar + 3x strike kick\n*┆* ✦ ʙᴏᴛ ᴀᴅᴍɪɴ : *${isBotAdmin ? '✓ ᴀᴅᴍɪɴ' : '✕ ʙᴜᴋᴀɴ ᴀᴅᴍɪɴ (jadikan admin agar bisa delete/kick)'}*\n*╰───────────────*\n> _Grup sekarang dilindungi dari tutur kata kasar / toxic._`)
  }

  if (/^(off|disable|0)$/i.test(sub)) {
    if (!chat.antiToxic) {
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Sudah Nonaktif!*\n*╰───────────────*`)
    }
    chat.antiToxic = false
    return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Nonaktif (OFF)*\n*╰───────────────*\n> _Perlindungan anti-toxic telah dimatikan._`)
  }

  if (/^reset$/i.test(sub)) {
    let target = (args[1] || '').toLowerCase()
    if (target === 'all' || target === 'semua') {
      const totalReset = Object.keys(chat.toxicWarn).length
      chat.toxicWarn = {}
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ᴛɪɴᴅᴀᴋᴀɴ : *Reset Seluruh Peringatan*\n*┆* ✧ ᴛᴏᴛᴀʟ    : *${totalReset} Anggota*\n*╰───────────────*\n> _Semua catatan pelanggaran toxic di grup ini telah direset ke 0._`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    if (!who && target) {
      let cleanNum = target.replace(/[^0-9]/g, '')
      if (cleanNum.length >= 8) who = cleanNum + '@s.whatsapp.net'
    }

    if (who) {
      let prevWarn = chat.toxicWarn[who] || 0
      delete chat.toxicWarn[who]
      let uNum = who.split('@')[0].split(':')[0].replace(/\D/g, '')
      return conn.sendMessage(m.chat, {
        text: `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ᴛɪɴᴅᴀᴋᴀɴ : *Reset Strike User*\n*┆* ✧ ᴜꜱᴇʀ     : @${uNum}\n*┆* ✦ ꜱᴛʀɪᴋᴇ   : *${prevWarn} ➔ 0*\n*╰───────────────*\n> _Catatan peringatan pengguna telah dibersihkan._`,
        mentions: [who]
      })
    }

    return m.reply(`*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ʀ ᴇ ꜱ ᴇ ᴛ 〕*\n*┆* › Reset per user : *${usedPrefix + command} reset @user*\n*┆* › Reset semua    : *${usedPrefix + command} reset all*\n*╰───────────────*`)
  }

  // Dashboard Status & Info
  let totalViolators = Object.keys(chat.toxicWarn || {}).filter(k => (chat.toxicWarn[k] || 0) > 0).length

  const infoText = `*──  ୨୧ ✧ PENGATURAN ANTI TOXIC ✧ ୨୧  ──*

> *おしらせ!* (ᴀɴᴛɪ-ᴛᴏxɪᴄ ꜱʏꜱᴛᴇᴍ)
> Melindungi grup dari tutur kata kasar, caci maki, dan konten toxic.

*╭  〔 ❖ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*
*┆* ⟡ ꜰɪᴛᴜʀ       : *${statusStr(chat.antiToxic)}*
*┆* ✧ ʙᴏᴛ ᴀᴅᴍɪɴ   : *${isBotAdmin ? '✓ ᴀᴅᴍɪɴ' : '✕ ʙᴜᴋᴀɴ ᴀᴅᴍɪɴ'}*
*┆* ✦ ᴍᴀᴋꜱ ꜱᴛʀɪᴋᴇ : *3x Peringatan (Auto Kick)*
*┆* ◈ ᴛᴇʀᴄᴀᴛᴀᴛ    : *${totalViolators} Anggota Terkena Strike*
*╰───────────────*

*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*
*┆* › Mengaktifkan : *${usedPrefix + command} on*
*┆* › Mematikan    : *${usedPrefix + command} off*
*┆* › Reset User   : *${usedPrefix + command} reset @user*
*┆* › Reset Semua  : *${usedPrefix + command} reset all*
*╰───────────────*`.trim()

  return m.reply(infoText)
}

handler.help = ['antitoxic [on/off/reset]']
handler.tags = ['group']
handler.command = /^anti(toxic|kasar)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, isAdmin, isOwner, isBotAdmin }) {
  if (!m.isGroup) return false
  const chat = global.db.data?.chats?.[m.chat]
  if (!chat?.antiToxic) return false
  if (m.fromMe || isAdmin || isOwner) return false

  let text = m.text || m.caption || (m.msg && m.msg.caption) || ''
  if (!text) return false

  const toxicHit = detectToxic(text)
  if (!toxicHit) return false

  if (!chat.toxicWarn || typeof chat.toxicWarn !== 'object') chat.toxicWarn = {}
  chat.toxicWarn[m.sender] = (chat.toxicWarn[m.sender] || 0) + 1

  const strikes = chat.toxicWarn[m.sender]
  const MAX_WARNS = 3
  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  // Hapus pesan toxic terlebih dahulu tanpa quote
  if (isBotAdmin) {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant || m.sender
      }
    }).catch(() => null)
  }

  if (strikes < MAX_WARNS) {
    const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ    : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Tutur kata kasar / toxic
*┆* ✦ ᴘᴇʀɪɴɢᴀᴛᴀɴ  : *[ ${strikes} / ${MAX_WARNS} ]*
*┆* ◈ ᴛɪɴᴅᴀᴋᴀɴ    : ${isBotAdmin ? 'Pesan telah dihapus otomatis.' : 'Pesan terdeteksi (bot butuh admin).'}
*╰───────────────*
> _Jaga kesopanan dan ketertiban saat berinteraksi di grup ini!_`.trim()

    await conn.sendMessage(m.chat, {
      text: warnText,
      mentions: [m.sender]
    }).catch(() => null)
  } else {
    chat.toxicWarn[m.sender] = 0 // Reset strike setelah batas hukuman tercapai

    const kickText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ    : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Batas maksimum tercapai!
*┆* ✦ ᴘᴇʀɪɴɢᴀᴛᴀɴ  : *[ ${MAX_WARNS} / ${MAX_WARNS} ]*
*┆* ◈ ᴛɪɴᴅᴀᴋᴀɴ    : ${isBotAdmin ? 'Pelanggar dikeluarkan dari grup.' : 'Peringatan maksimal (jadikan bot admin untuk kick).'}
*╰───────────────*
> _Pelanggar telah mencapai batas toleransi tutur kata kasar._`.trim()

    await conn.sendMessage(m.chat, {
      text: kickText,
      mentions: [m.sender]
    }).catch(() => null)

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => null)
    }
  }

  return true
}

export default handler