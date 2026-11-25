import { ffmpeg } from '../../lib/converter.js'
import { extractTimeRange, trimVideoBuffer } from '../../lib/videoTrim.js'
import { processAndSendSoundSticker } from './sticker-sound.js'
import { createStickerFromMedia } from './sticker-sticker.js'
import { status, toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  conn.videoTrimSession = conn.videoTrimSession || {}
  const session = conn.videoTrimSession[m.sender]

  if (args[0] === 'batal' || args[0] === 'cancel') {
    if (session) {
      clearTimeout(session.timeout)
      delete conn.videoTrimSession[m.sender]
      return m.reply(status.success('Antrean pemotongan video stiker berhasil dibatalkan.'))
    }
    return m.reply(status.info('Tidak ada antrean pemotongan video yang sedang aktif.'))
  }

  if (session) {
    const durStr = toSmallNum(session.seconds || '?')
    const maxDurStr = toSmallNum(session.maxDuration || 10)
    return m.reply(
      `*╭  〔 ✂️ ᴀ ɴ ᴛ ʀ ᴇ ᴀ ɴ  ᴘ ᴏ ᴛ ᴏ ɴ ɢ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*\n` +
      `*┆* ⏱ ᴅᴜʀᴀꜱɪ ᴠɪᴅᴇᴏ : *${durStr} Detik*\n` +
      `*┆* ✦ ᴍᴀᴋꜱ ᴘᴏᴛᴏɴɢ  : *${maxDurStr} Detik*\n` +
      `*┆* ✎ ᴄᴀʀᴀ ᴘᴀᴋᴀɪ   : Balas dengan format detik (contoh: *5 12* atau *0 8*)\n` +
      `*┆* ✕ ʙᴀᴛᴀʟᴋᴀɴ     : Ketik *${usedPrefix + command} batal*\n` +
      `*╰───────────────*`
    )
  }

  return m.reply(
    `*╭  〔 ✂️ ᴘ ᴏ ᴛ ᴏ ɴ ɢ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*\n` +
    `> Fitur ini aktif otomatis saat kamu mengirim video lebih dari 10 detik dengan *.s* atau *.ssound*.\n` +
    `> Kamu juga bisa langsung menentukan detik saat membalas video:\n` +
    `> › *${usedPrefix}s 5 12* (memotong detik 5 sampai 12)\n` +
    `> › *${usedPrefix}ssound 00:03 00:09* (stiker suara detik 3 sampai 9)\n` +
    `*╰───────────────*`
  )
}

handler.before = async function (m, { conn }) {
  if (!m.text) return false
  const targetConn = conn || this || global.conn
  if (!targetConn) return false

  targetConn.videoTrimSession = targetConn.videoTrimSession || {}
  const session = targetConn.videoTrimSession[m.sender]
  if (!session) return false

  // Abaikan pesan dari bot sendiri
  const botJid = targetConn.user?.jid
  const botNumber = (botJid || '').split('@')[0].split(':')[0]
  const senderNumber = (m.sender || '').split('@')[0].split(':')[0]
  if (m.fromMe || m.isBaileys || m.key?.fromMe || (botNumber && senderNumber === botNumber)) {
    return false
  }

  const rawText = m.text.trim().toLowerCase()

  // 1. Opsi Pembatalan
  if (rawText === 'batal' || rawText === 'cancel') {
    clearTimeout(session.timeout)
    delete targetConn.videoTrimSession[m.sender]
    await m.reply(status.success('Antrean pemotongan video stiker berhasil dibatalkan.'))
    return true
  }

  // 2. Jika user mengetik command lain (diawali prefix '.', '/', '#'), abaikan agar command lain bisa jalan
  if (/^[./#!]/.test(rawText)) return false

  // 3. Cek apakah pesan merupakan input rentang waktu
  const range = extractTimeRange(m.text, session.maxDuration || 10)
  if (!range) {
    // Jika user me-reply pesan prompt tetapi formatnya salah
    if (m.quoted && m.quoted.sender === botJid) {
      await m.reply(
        `*╭  〔 ⚠ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴠ ᴀ ʟ ɪ ᴅ 〕*\n` +
        `> Format detik tidak dikenali.\n` +
        `> Silakan kirim detik mulai & detik selesai.\n` +
        `> _Contoh: ketik *5 12* atau *00:05 00:12* atau ketik *batal*._\n` +
        `*╰───────────────*`
      )
      return true
    }
    return false
  }

  // 4. Validasi detik mulai dengan durasi video
  if (session.seconds && range.start >= session.seconds) {
    await m.reply(
      `*╭  〔 ⚠ ᴡ ᴀ ᴋ ᴛ ᴜ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴠ ᴀ ʟ ɪ ᴅ 〕*\n` +
      `> Detik mulai (*${range.start}s*) melebihi durasi video (*${session.seconds}s*).\n` +
      `> _Silakan masukkan rentang detik yang ada di dalam video atau ketik *batal*._\n` +
      `*╰───────────────*`
    )
    return true
  }

  // Bersihkan sesi antrean
  clearTimeout(session.timeout)
  delete targetConn.videoTrimSession[m.sender]

  await targetConn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

  try {
    const trimmed = await trimVideoBuffer(session.buffer, range.start, range.duration)

    if (session.type === 'ssound') {
      // Ekstrak audio PENUH dari video asli (session.buffer)
      // Hanya video yang dipotong menjadi stiker animasi, musik tetap utuh sesuai lagu aslinya!
      let audioResult = await ffmpeg(session.buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-ac', '1',
        '-ar', '48000',
        '-t', '90'
      ], 'mp4', 'ogg')

      await processAndSendSoundSticker(targetConn, m, trimmed, audioResult.data, session.args || [], true, false)
      audioResult.delete().catch(() => {})
      await targetConn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
    } else {
      // Konversi video hasil potongan menjadi stiker biasa
      const stiker = await createStickerFromMedia(trimmed, 'video/mp4', session.packname, session.author)
      if (stiker) {
        await targetConn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        await targetConn.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => {})
      } else {
        await m.reply(status.error('Gagal mengonversi video hasil potongan menjadi stiker.'))
      }
    }
  } catch (errTrimProcess) {
    console.error('[Video Trim Process Error]:', errTrimProcess)
    await targetConn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    await m.reply(status.error('Terjadi kesalahan saat memotong dan memproses video.'))
  }

  return true
}

handler.help = ['potongstiker [batal]']
handler.tags = ['sticker']
handler.command = /^(potongstiker|trimstiker|potongvid)$/i

export default handler
