import fs from 'fs'
import path from 'path'
import { VOICE_NOTE_GROUPS, VOICE_NOTE_DIR, MIME_TYPES, prepareVoiceNote } from '../../lib/voice-noteData.js'

const buildVoiceNotes = () => Object.fromEntries(
  VOICE_NOTE_GROUPS.filter(group => group.enabled !== false)
    .flatMap(({ files, commands }) => commands.map(command => [command, files.length === 1 ? files[0] : files]))
)

const findVoiceCommand = (text) => {
  const normalizedText = (text || '').trim().toLowerCase()
  const voiceNotes = buildVoiceNotes()
  return Object.keys(voiceNotes)
    .sort((first, second) => second.length - first.length)
    .find(keyword => {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const keywordPattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapedKeyword}(?:$|[^\\p{L}\\p{N}])`, 'u')
      return keywordPattern.test(normalizedText)
    })
}

function getVoiceStore() {
  const db = global.db?.data || global.db || {}
  db.voice = db.voice || {}
  db.voice.groups = db.voice.groups || {}
  db.voice.users = db.voice.users || {}
  return db.voice
}

function isGroupDisabled(chatId) {
  const store = getVoiceStore()
  return !!store.groups?.[chatId]?.disabled
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

function resolveVoiceAudioFile(keyword) {
  const data = buildVoiceNotes()
  const mapped = data[keyword]
  if (!mapped) return null
  if (Array.isArray(mapped)) return mapped[0]
  return mapped
}

async function sendVoiceAudioFromKeyword(m, conn, keyword) {
  const fileName = resolveVoiceAudioFile(keyword)
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

const handler = async (m, { conn, text = '', usedPrefix = '.', command = 'voice', isOwner = false }) => {
  const rawArgs = (text || '').trim().split(/\s+/).filter(Boolean)
  const sub = rawArgs[0]?.toLowerCase()
  const remaining = rawArgs.slice(1)

if (!sub) {
  return m.reply(
    `╭─❏「 🎙️ VOICE NOTE PANEL 」❏\n` +
    `│ 🎙️ *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📌 *COMMAND*\n` +
    `> ↳ *${usedPrefix}voice keyword*\n` +
    `> ↳ *${usedPrefix}voice add <reply> <namafilenya.ogg> <keyword|keyword|dst>*\n` +
    `> ↳ *${usedPrefix}voice edit <reply> <namafilenya.ogg> <keyword|keyword|dst>*\n` +
    `> ↳ *${usedPrefix}voice mute <tag/reply>*\n` +
    `> ↳ *${usedPrefix}voice unmute <tag/reply>*\n` +
    `> ↳ *${usedPrefix}voice enable*\n` +
    `> ↳ *${usedPrefix}voice disable*\n\n` +

    `⚠️ *Hanya owner yang bisa mute/add/edit.*\n` +
    `⚠️ *disable/enable untuk admin grup.*\n\n` +

    `─━━━━━━━━━━━━━━─`
  )
}

  if (sub === 'keyword') {
    const list = VOICE_NOTE_GROUPS.filter(group => group.enabled !== false)
    let msg = '╭─❏「 🎙️ AUTO VN KEYWORD 」❏\n'
    msg += '│ 🎧 *Total VN* : ' + list.length + '\n'
    msg += '│ 🔑 *Total Keyword* : ' + Object.keys(buildVoiceNotes()).length + '\n'
    msg += '╰─━━━━━━━━━━━━━━─\n\n'

    for (const [index, { files, commands }] of list.entries()) {
      msg += '🎧 *VN ' + (index + 1) + '*\n'
      msg += '> ↳ File : ' + files.join(', ') + '\n'
      msg += '> ↳ Keyword : ' + commands.map(keyword => '`' + keyword + '`').join(', ') + '\n\n'
    }

    msg += '─━━━━━━━━━━━━━━─'
    return m.reply(msg)
  }

  if (sub === 'disable' || sub === 'enable') {
    if (!m.isGroup) return m.reply('❌ Fitur ini hanya untuk grup.')
    if (!m.isAdmin && !m.isOwner && !isOwner) return m.reply('❌ Khusus admin grup.')

    const store = getVoiceStore()
    store.groups[m.chat] = store.groups[m.chat] || {}

    if (sub === 'disable') {
      store.groups[m.chat].disabled = true
      return m.reply('✅ Semua keyword .voice note ditolak di grup ini.')
    }

    if (sub === 'enable') {
      store.groups[m.chat].disabled = false
      return m.reply('✅ Voice note keyword di grup ini diaktifkan lagi.')
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
      for (const existing of VOICE_NOTE_GROUPS) {
        if (existing.enabled !== false && (existing.commands || []).some(cmd => keywords.includes(cmd))) {
          existing.enabled = false
        }
      }

      const conflictText = conflicts
        .map(item => '- File: ' + item.file + ' | Keyword: ' + item.keyword)
        .join('\n')

      return m.reply('⚠️ Keyword bentrok, maka kedua voice note dinonaktifkan:\n' + conflictText)
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

  if (m.isGroup && isGroupDisabled(m.chat)) return true
  if (m.isGroup && isUserMuted(m.sender)) return true

  const matchedKeyword = findVoiceCommand(m.text)
  if (!matchedKeyword) return false

  if (m.isGroup && isGroupDisabled(m.chat)) return true
  if (m.isGroup && isUserMuted(m.sender)) return true

  const sent = await sendVoiceAudioFromKeyword(m, this, matchedKeyword)
  return sent

}

export default handler