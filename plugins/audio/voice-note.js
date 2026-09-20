import fs from 'fs'
import path from 'path'
import { VOICE_NOTE_GROUPS, VOICE_NOTE_DIR, MIME_TYPES, prepareVoiceNote } from '../../lib/voice-noteData.js'

const isVoiceCategoryEnabled = (chatId, category) => {
  if (!category) return true
  const defaults = { toxic: false }
  const configured = getVoiceStore().groups?.[chatId]?.categories?.[category]
  return configured === undefined ? defaults[category] !== false : configured === true
}

const buildVoiceNotes = (chatId) => Object.fromEntries(
  VOICE_NOTE_GROUPS.filter(group => group.enabled !== false && isVoiceCategoryEnabled(chatId, group.category))
    .flatMap(({ files, commands }) => commands.map(command => [command, files.length === 1 ? files[0] : files]))
)

const findVoiceMatches = (text, chatId) => {
  const normalizedText = (text || '').trim().toLowerCase()
  const groups = VOICE_NOTE_GROUPS.filter(group => group.enabled !== false && isVoiceCategoryEnabled(chatId, group.category))
  const matches = []

  for (const group of groups) {
    for (const keyword of group.commands || []) {
      const normalizedKeyword = String(keyword).toLowerCase()
      const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const keywordPattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapedKeyword}(?:$|[^\\p{L}\\p{N}])`, 'u')
      if (keywordPattern.test(normalizedText)) {
        matches.push({ keyword: normalizedKeyword, files: group.files || [], category: group.category })
      }
    }
  }

  const longestKeywordLength = Math.max(0, ...matches.map(match => match.keyword.length))
  return matches.filter(match => match.keyword.length === longestKeywordLength)
}

const findVoiceCommand = (text, chatId) => {
  return findVoiceMatches(text, chatId)[0]?.keyword || null
}

function getVoiceStore() {
  const db = global.db?.data || global.db || {}
  db.voice = db.voice || {}
  db.voice.groups = db.voice.groups || {}
  db.voice.users = db.voice.users || {}
  db.voice.chats = db.voice.chats || {}
  db.voice.settings = db.voice.settings || {}
  if (db.voice.settings.group === undefined) db.voice.settings.group = true
  if (db.voice.settings.pc === undefined) db.voice.settings.pc = true
  return db.voice
}

function isVoiceDisabledForChat(chatId, isGroup = false) {
  const store = getVoiceStore()
  if (isGroup) {
    if (store.settings?.group === false) return true
    if (store.groups?.[chatId]?.disabled) return true
    if (global.db?.data?.chats?.[chatId]?.voice === false) return true
    return false
  } else {
    if (store.settings?.pc === false) return true
    if (store.chats?.[chatId]?.disabled) return true
    return false
  }
}

function isGroupDisabled(chatId) {
  return isVoiceDisabledForChat(chatId, true)
}

function isPcDisabled(chatId) {
  return isVoiceDisabledForChat(chatId, false)
}

function isUserMuted(jid) {
  const store = getVoiceStore()
  return !!store.users?.[jid]?.muted
}

function userHasAccess(m, isOwner = false) {
  if (isOwner) return true
  const sender = m.sender || m.from || ''
  const list = global.rpgPanelVoiceAccess || global.rpgPanelUsers || []
  if (Array.isArray(list)) return list.includes(sender)
  if (list && typeof list === 'object') return !!list[sender]
  return false
}

function resolveTarget(m, remaining = []) {
  let who = null
  let targetArgIndex = -1

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].startsWith('@') || remaining[i].includes('@s.whatsapp.net') || remaining[i].includes('@lid')) {
        targetArgIndex = i
        break
      }
    }
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender
  } else {
    for (let i = 0; i < remaining.length; i++) {
      let arg = remaining[i].trim()
      let clean = arg.replace(/^@/, '')
      if (clean.includes('@s.whatsapp.net') || clean.includes('@lid')) {
        who = clean
        targetArgIndex = i
        break
      }
      let digits = clean.replace(/[^0-9]/g, '')
      if (digits.length >= 8 && digits.length <= 16) {
        if (digits.startsWith('08')) digits = '628' + digits.slice(2)
        who = digits + '@s.whatsapp.net'
        targetArgIndex = i
        break
      }
    }
  }

  if (targetArgIndex !== -1) remaining.splice(targetArgIndex, 1)

  if (who) {
    try {
      if (global.conn && typeof global.conn.decodeJid === 'function') {
        who = global.conn.decodeJid(who)
      }
    } catch (_) {}

    if (who.endsWith('@lid')) {
      const resolvedLid = global.lids?.[who] || global.db?.data?.lids?.[who]
      if (resolvedLid) who = resolvedLid
      else if (global.db?.data?.users) {
        for (const [realJid, uData] of Object.entries(global.db.data.users)) {
          if (uData.lid === who || realJid.split('@')[0] === who.split('@')[0]) {
            who = realJid
            break
          }
        }
      }
    }

    if (!who.includes('@')) who = who + '@s.whatsapp.net'
    else if (!who.endsWith('@s.whatsapp.net') && !who.endsWith('@lid')) who = who.split('@')[0] + '@s.whatsapp.net'

    if (who === '@s.whatsapp.net' || who.startsWith('NaN') || who === 'undefined@s.whatsapp.net') who = null
  }

  return who
}

function writeDataFile(groups) {
  const targetPath = path.resolve('./lib/voice-noteData.js')
  const currentContent = fs.readFileSync(targetPath, 'utf8')
  const regex = /export const VOICE_NOTE_GROUPS = [\s\S]*$/
  const newContent = currentContent.replace(regex, `export const VOICE_NOTE_GROUPS = ${JSON.stringify(groups, null, 2)}\n`)
  fs.writeFileSync(targetPath, newContent, 'utf8')
}

function resolveVoiceAudioFile(keyword, chatId) {
  const data = buildVoiceNotes(chatId)
  const mapped = data[keyword]
  if (!mapped) return null
  if (Array.isArray(mapped)) return mapped[Math.floor(Math.random() * mapped.length)]
  return mapped
}

async function sendVoiceAudioFromKeyword(m, conn, keyword) {
  const fileName = resolveVoiceAudioFile(keyword, m.chat)
  if (!fileName) return false

  const filePath = path.resolve(VOICE_NOTE_DIR, fileName)
  if (!fs.existsSync(filePath)) return false

  const client = conn || m.conn || global.conn

  // Tampilkan animasi sedang merekam suara sebelum voice note dikirim
  if (client && typeof client.sendPresenceUpdate === 'function') {
    await client.sendPresenceUpdate('recording', m.chat).catch(() => {})
  }

  try {
    // Jeda agar animasi VN ("sedang merekam suara...") terlihat oleh penerima
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Siapkan voice note (konversi otomatis ke opus jika mp3/m4a, ekstrak gelombang dynamic non-flat, dan di-cache)
    const { opusBuffer, waveform, seconds } = await prepareVoiceNote(filePath)
    if (!opusBuffer || opusBuffer.length < 100) {
      console.warn('[voice-note] File audio tidak valid atau kosong:', filePath)
      return false
    }
    const wfArray = waveform ? new Uint8Array(waveform) : undefined

    if (client && typeof client.sendMessage === 'function') {
      await client.sendMessage(m.chat, {
        audio: opusBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        seconds: seconds || 1,
        waveform: wfArray
      }, { quoted: m })
      return true
    }

    if (client && typeof client.sendFile === 'function') {
      await client.sendFile(m.chat, opusBuffer, `${keyword}.opus`, '', m, true, {
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        seconds: seconds || 1,
        waveform: wfArray
      })
      return true
    }
  } catch (e) {
    console.error('[voice-note] Error sending voice note:', e)
  } finally {
    // Hentikan status recording
    if (client && typeof client.sendPresenceUpdate === 'function') {
      await client.sendPresenceUpdate('paused', m.chat).catch(() => {})
    }
  }

  return false
}

const handler = async (m, { conn, text = '', usedPrefix = '.', command = 'voice', isAdmin = false, isOwner = false }) => {
  const rawArgs = (text || '').trim().split(/\s+/).filter(Boolean)
  const sub = rawArgs[0]?.toLowerCase()
  const remaining = rawArgs.slice(1)

if (!sub) {
  return m.reply(
    `╭─❏「 🎙️ VOICE NOTE PANEL 」❏\n` +
    `│ 🎙️ *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *PENGATURAN CHAT SAAT INI*\n` +
    `> ↳ *${usedPrefix}voice enable / on*\n` +
    `> ↳ *${usedPrefix}voice disable / off*\n` +
    `> ↳ *${usedPrefix}voice status*\n\n` +

    `📌 *PENGATURAN GLOBAL (OWNER)*\n` +
    `> ↳ *${usedPrefix}voice gc enable / disable*\n` +
    `> ↳ *${usedPrefix}voice pc enable / disable*\n\n` +

    `📌 *PENGELOLAAN VN*\n` +
    `> ↳ *${usedPrefix}voice keyword*\n` +
    `> ↳ *${usedPrefix}voice add <reply> <namafilenya.ogg> <keyword|keyword|dst>*\n` +
    `> ↳ *${usedPrefix}voice edit <reply> <namafilenya.ogg> <keyword|keyword|dst>*\n` +
    `> ↳ *${usedPrefix}voice mute <tag/reply>*\n` +
    `> ↳ *${usedPrefix}voice unmute <tag/reply>*\n` +
    `> ↳ *${usedPrefix}voice toxic enable|disable*\n\n` +

    `⚠️ *enable/disable: Admin di grup, bebas di chat pribadi (PC).*\n` +
    `⚠️ *gc/pc enable/disable: Khusus Owner bot.*\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

  if (sub === 'status' || sub === 'info') {
    const store = getVoiceStore()
    const isGcGlobal = store.settings?.group !== false
    const isPcGlobal = store.settings?.pc !== false
    const isThisDisabled = isVoiceDisabledForChat(m.chat, m.isGroup)
    const isToxicOn = isVoiceCategoryEnabled(m.chat, 'toxic')

    const statusBadge = (val) => val ? '✓ Aktif' : '✕ Nonaktif'

    return m.reply(
      `╭─❏「 🎙️ STATUS VOICE NOTE 」❏\n` +
      `│ 🌐 *Global Grup (GC)* : ${statusBadge(isGcGlobal)}\n` +
      `│ 💬 *Global Private (PC)* : ${statusBadge(isPcGlobal)}\n` +
      `│ 📍 *Chat Saat Ini* : ${statusBadge(!isThisDisabled)}\n` +
      `│ ☣️ *Kategori Toxic* : ${statusBadge(isToxicOn)}\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (sub === 'gc' || sub === 'group' || sub === 'grup') {
    if (!isOwner) return m.reply('❌ Pengaturan global grup hanya untuk Owner.')
    const action = remaining[0]?.toLowerCase()
    if (!['enable', 'disable', 'on', 'off'].includes(action)) {
      return m.reply(`❌ Gunakan: *${usedPrefix}voice ${sub} enable/on* atau *${usedPrefix}voice ${sub} disable/off*`)
    }
    const store = getVoiceStore()
    const isEnable = action === 'enable' || action === 'on'
    store.settings.group = isEnable
    if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
    return m.reply(`✅ Voice note untuk *seluruh grup (GC)* berhasil ${isEnable ? 'diaktifkan' : 'dinonaktifkan'}.`)
  }

  if (sub === 'pc' || sub === 'private') {
    if (!isOwner) return m.reply('❌ Pengaturan global private chat (PC) hanya untuk Owner.')
    const action = remaining[0]?.toLowerCase()
    if (!['enable', 'disable', 'on', 'off'].includes(action)) {
      return m.reply(`❌ Gunakan: *${usedPrefix}voice ${sub} enable/on* atau *${usedPrefix}voice ${sub} disable/off*`)
    }
    const store = getVoiceStore()
    const isEnable = action === 'enable' || action === 'on'
    store.settings.pc = isEnable
    if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
    return m.reply(`✅ Voice note untuk *seluruh chat pribadi (PC)* berhasil ${isEnable ? 'diaktifkan' : 'dinonaktifkan'}.`)
  }

  if (['enable', 'disable', 'on', 'off'].includes(sub)) {
    const isEnable = sub === 'enable' || sub === 'on'
    const targetScope = remaining[0]?.toLowerCase()

    if (['gc', 'group', 'grup'].includes(targetScope)) {
      if (!isOwner) return m.reply('❌ Pengaturan global grup hanya untuk Owner.')
      const store = getVoiceStore()
      store.settings.group = isEnable
      if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
      return m.reply(`✅ Voice note untuk *seluruh grup (GC)* berhasil ${isEnable ? 'diaktifkan' : 'dinonaktifkan'}.`)
    }

    if (['pc', 'private'].includes(targetScope)) {
      if (!isOwner) return m.reply('❌ Pengaturan global private chat (PC) hanya untuk Owner.')
      const store = getVoiceStore()
      store.settings.pc = isEnable
      if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
      return m.reply(`✅ Voice note untuk *seluruh chat pribadi (PC)* berhasil ${isEnable ? 'diaktifkan' : 'dinonaktifkan'}.`)
    }

    const store = getVoiceStore()
    if (m.isGroup) {
      if (!isAdmin && !m.isAdmin && !isOwner) return m.reply('❌ Khusus admin grup atau owner.')
      store.groups[m.chat] = store.groups[m.chat] || {}
      store.groups[m.chat].disabled = !isEnable
      if (global.db?.data?.chats?.[m.chat]) {
        global.db.data.chats[m.chat].voice = isEnable
      }
      if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
      return m.reply(isEnable
        ? '✅ Voice note keyword di grup ini telah diaktifkan.'
        : '✅ Voice note keyword di grup ini telah dinonaktifkan.')
    } else {
      store.chats[m.chat] = store.chats[m.chat] || {}
      store.chats[m.chat].disabled = !isEnable
      if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
      return m.reply(isEnable
        ? '✅ Voice note keyword di chat pribadi ini telah diaktifkan.'
        : '✅ Voice note keyword di chat pribadi ini telah dinonaktifkan.')
    }
  }

  if (sub === 'mute' || sub === 'unmute') {
    const target = resolveTarget(m, [...remaining])
    if (!target) return m.reply('❌ Tag / reply / masukkan nomor target dulu untuk mute voice note!')

    const store = getVoiceStore()
    store.users[target] = store.users[target] || {}

    if (sub === 'mute') {
      store.users[target].muted = true
      return m.reply('✅ @' + target.split('@')[0] + ' dimute voice-note keyword.', null, { mentions: [target] })
    }

    if (store.users[target]?.muted) {
      store.users[target].muted = false
      return m.reply('✅ @' + target.split('@')[0] + ' diunmute.', null, { mentions: [target] })
    }

    return m.reply('ℹ️ @' + target.split('@')[0] + ' belum dimute.', null, { mentions: [target] })
  }

  if (sub === 'add' || sub === 'edit') {
    if (!userHasAccess(m, isOwner)) return m.reply('❌ Fitur ini khusus user dengan akses panel RPG.')

    if (!m.quoted || !m.quoted.message || !(m.quoted.message.audio || m.quoted.message.ptt || m.quoted.message.voice)) {
      return m.reply('❌ Reply voice note yang ada di grup dulu untuk menambah atau mengedit data voice note.')
    }

    const fileName = remaining[0]
    const keywordsRaw = remaining.slice(1).join(' ')

    if (!fileName || !/^.+\.(mp3|m4a|ogg|opus|wav)$/i.test(fileName)) {
      return m.reply('❌ Format: .voice add <reply> <namafilenya.ogg> <keyword|keyword|dst>')
    }

    const keywords = keywordsRaw.split('|').map(k => k.trim().toLowerCase()).filter(Boolean)
    if (keywords.length === 0) return m.reply('❌ Minimal satu keyword dipisahkan dengan |.')

    const fileOut = path.resolve(VOICE_NOTE_DIR, fileName)

    let buffer = null
    try {
      if (typeof conn.downloadMediaMessage === 'function') {
        buffer = await conn.downloadMediaMessage(m.quoted)
      } else if (m.quoted.download) {
        buffer = await m.quoted.download()
      }
    } catch (e) {
      console.error(e)
    }

    if (!buffer) return m.reply('❌ Gagal mengambil audio yang direply.')

    try {
      fs.writeFileSync(fileOut, buffer)
    } catch (e) {
      return m.reply('❌ Gagal menyimpan voice note baru ke folder media.')
    }

    const conflicts = []
    for (const existing of VOICE_NOTE_GROUPS) {
      if (existing.enabled === false) continue
      for (const kw of keywords) {
        if ((existing.commands || []).includes(kw)) {
          conflicts.push({ file: existing.files.join(', '), keyword: kw })
        }
      }
    }

    if (conflicts.length > 0) {
      const conflictText = conflicts
        .map(item => '- File: ' + item.file + ' | Keyword: ' + item.keyword)
        .join('\n')

      return m.reply('❌ Gagal ' + sub + ' voice note karena keyword bentrok:\n' + conflictText + '\n\nGunakan keyword lain agar semua VN tetap bisa dipicu.')
    }

    if (sub === 'add') {
      const newGroup = { files: [fileName], commands: keywords, enabled: true }
      VOICE_NOTE_GROUPS.push(newGroup)
      writeDataFile(VOICE_NOTE_GROUPS)
      return m.reply('✅ Ditambah voice note *' + fileName + '* dengan keyword: ' + keywords.map(k => '`' + k + '`').join(', '))
    }

    if (sub === 'edit') {
      const idx = VOICE_NOTE_GROUPS.findIndex(group => group.files.includes(fileName))
      if (idx < 0) return m.reply('❌ Voice note *' + fileName + '* tidak ada di database.')
      VOICE_NOTE_GROUPS[idx] = { files: [fileName], commands: keywords, enabled: true }
      writeDataFile(VOICE_NOTE_GROUPS)
      return m.reply('✅ Diedit voice note *' + fileName + '* dengan keyword: ' + keywords.map(k => '`' + k + '`').join(', '))
    }
  }

  return m.reply('❌ Command .voice tidak dikenal.')
}

handler.help = ['voice', 'autovnkeyword']
handler.tags = ['audio']
handler.command = ['voice', 'autovnkeyword']

handler.before = async function (m, { match, ...context }) {
  if (match?.[0]) return false
  if (!m.text) return false

  // 1. Cegah respon jika bot sendiri yang mengirim pesan teks
  const botJid = this.user?.jid || global.conn?.user?.jid
  const botNumber = (botJid || '').split('@')[0].split(':')[0]
  const senderNumber = (m.sender || '').split('@')[0].split(':')[0]
  if (m.fromMe || m.isBaileys || m.key?.fromMe || (botNumber && senderNumber === botNumber)) {
    return false
  }

  // 2. Cek apakah voice note dinonaktifkan di grup / chat pribadi (PC)
  if (isVoiceDisabledForChat(m.chat, m.isGroup)) return false

  // 3. Cek apakah user sedang dimute
  if (isUserMuted(m.sender)) return false

  const matches = findVoiceMatches(m.text, m.chat)
  if (matches.length > 1) {
    const conflictText = matches
      .map(match => `- Keyword: *${match.keyword}* | File: ${match.files.join(', ')}`)
      .join('\n')
    await m.reply(`❌ *Gagal mengirim voice note.*\nKeyword *${matches[0].keyword}* bentrok dengan beberapa VN:\n${conflictText}\n\nSilakan gunakan keyword yang lebih spesifik.`)
    return true
  }

  const matchedKeyword = findVoiceCommand(m.text, m.chat)
  if (!matchedKeyword) return false

  if (isVoiceDisabledForChat(m.chat, m.isGroup)) return false
  if (isUserMuted(m.sender)) return false

  const sent = await sendVoiceAudioFromKeyword(m, this, matchedKeyword)
  if (!sent) {
    const match = matches[0]
    await m.reply(`❌ *Gagal mengirim voice note.*\nKeyword: *${matchedKeyword}*\nFile: ${(match?.files || []).join(', ') || 'tidak ditemukan'}\n\nPeriksa apakah file VN masih ada di folder media/voice-notes.`)
    return true
  }
  return sent

}

export default handler