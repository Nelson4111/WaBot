import { sticker } from '../../lib/sticker.js'
import { Sticker } from 'wa-sticker-formatter'
import { ffmpeg, mergeAudioVideo } from '../../lib/converter.js'
import { sendAudioSticker } from '../../lib/audioSticker.js'
import { status } from '../../lib/style.js'
import { extractTimeRange, getVideoDuration, trimVideoBuffer, formatTrimPrompt } from '../../lib/videoTrim.js'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  conn.stickerSoundSession = conn.stickerSoundSession || {}

  // 1. Opsi pembatalan session
  if (args[0] === 'cancel' || args[0] === 'batal') {
    if (conn.stickerSoundSession[m.sender]) {
      clearTimeout(conn.stickerSoundSession[m.sender].timeout)
      delete conn.stickerSoundSession[m.sender]
      return m.reply(status.success('Session stiker suara kustom berhasil dibatalkan.'))
    }
    return m.reply(status.info('Tidak ada session stiker suara yang sedang aktif.'))
  }

  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''
  const mtype = quoted.mtype || quoted.mediaType || ''
  const isVideo = /video|gif/.test(mime) || mtype === 'videoMessage'
  const isSticker = /webp/.test(mime) || mtype === 'stickerMessage'
  const isImage = (/image/.test(mime) && !isSticker) || mtype === 'imageMessage'
  const isAudio = /audio/.test(mime) || mtype === 'audioMessage'

  // 2. Mode Pairing: Pengguna membalas Media dengan argumen "pair" / "custom" / "gabung"
  const isPairMode = (args[0] === 'pair' || args[0] === 'custom' || args[0] === 'gabung')
  const session = conn.stickerSoundSession[m.sender]

  // 3. KASUS KHUSUS: Jika sesi aktif menyimpan AUDIO dan pengguna sekarang membalas Stiker, Foto, atau Video
  if (session && session.type === 'audio') {
    if (isSticker || isImage || isVideo) {
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})
      let mediaBuffer = await quoted.download()
      clearTimeout(session.timeout)
      delete conn.stickerSoundSession[m.sender]

      if (!mediaBuffer) return m.reply(status.error('Gagal mengunduh media.'))

      try {
        if (isSticker) {
          const isAnimated = Boolean(quoted.msg?.isAnimated || mediaBuffer.includes('ANIM'))
          await processAndSendSoundSticker(conn, m, mediaBuffer, session.buffer, args, isAnimated, true)
        } else if (isImage) {
          await processAndSendSoundSticker(conn, m, mediaBuffer, session.buffer, args, false, false)
        } else if (isVideo) {
          let vidBuffer = mediaBuffer
          const vidDur = (quoted.msg || quoted).seconds || await getVideoDuration(mediaBuffer)
          if (vidDur > 10) {
            vidBuffer = await trimVideoBuffer(mediaBuffer, 0, 10)
          }
          await processAndSendSoundSticker(conn, m, vidBuffer, session.buffer, args, true, false)
        }
      } catch (err) {
        console.error('[Sticker Sound Reverse Pairing Error]:', err)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
        m.reply(status.error('Gagal memproses stiker bersuara. Pastikan format media didukung.'))
      }
      return
    }
  }

  // 4. KASUS AUDIO: Jika pengguna membalas Audio / Voice Note
  if (isAudio) {
    // 4a. Jika ada sesi aktif yang menyimpan visual media (Stiker, Foto, atau Video)
    if (session && (session.type === 'sticker' || session.type === 'image' || session.type === 'video')) {
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

      let audioBuffer = await quoted.download()
      clearTimeout(session.timeout)
      delete conn.stickerSoundSession[m.sender]

      if (!audioBuffer) return m.reply(status.error('Gagal mengunduh audio.'))

      try {
        if (session.type === 'sticker') {
          // Stiker asli dipasangkan langsung dengan audio baru (tanpa re-encode)
          await processAndSendSoundSticker(conn, m, session.buffer, audioBuffer, args, session.isAnimated, true)
        } else if (session.type === 'video') {
          let vidBuffer = session.buffer
          const vidDur = session.seconds || await getVideoDuration(session.buffer)
          if (vidDur > 10) {
            vidBuffer = await trimVideoBuffer(session.buffer, 0, 10)
          }
          await processAndSendSoundSticker(conn, m, vidBuffer, audioBuffer, args, true, false)
        } else {
          // Foto dipasangkan dengan audio kustom
          await processAndSendSoundSticker(conn, m, session.buffer, audioBuffer, args, false, false)
        }
      } catch (err) {
        console.error('[Sticker Sound Merge Error]:', err)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
        m.reply(status.error('Gagal memproses stiker bersuara. Pastikan format media didukung.'))
      }
      return
    }

    // 4b. Jika belum ada visual media, tetapi pengguna membalas Audio dengan "pair" -> simpan audio dulu
    if (isPairMode) {
      let audioBuffer = await quoted.download()
      if (!audioBuffer) return m.reply(status.error('Gagal mengunduh audio.'))

      if (conn.stickerSoundSession[m.sender]) {
        clearTimeout(conn.stickerSoundSession[m.sender].timeout)
      }

      conn.stickerSoundSession[m.sender] = {
        buffer: audioBuffer,
        type: 'audio',
        timeout: setTimeout(() => {
          delete conn.stickerSoundSession[m.sender]
        }, 60000).unref()
      }

      const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
        `*╭  〔 ⧗ ᴀ ᴜ ᴅ ɪ ᴏ  ᴛ ᴇ ʀ ꜱ ɪ ᴍ ᴘ ᴀ ɴ 〕*\n` +
        `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Sementara* 𝜚\n` +
        `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
        `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Stiker / Foto / Video*\n` +
        `*╰───────────────*\n\n` +
        `> Audio berhasil disimpan dalam antrean!\n` +
        `> Sekarang, silakan balas stiker, foto, atau video dengan *${usedPrefix + command}* untuk memasangkan audio ini menjadi Stiker Bersuara!\n` +
        `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

      return m.reply(caption)
    }

    // 4c. Jika membalas audio tanpa ada visual media dan tanpa keyword pair
    return m.reply(
      `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
      `> Kamu belum memilih stiker, foto, atau video untuk dipasangkan dengan audio ini.\n` +
      `> Silakan balas stiker, foto, atau video terlebih dahulu dengan perintah:\n` +
      `> › *${usedPrefix + command} pair* (atau balas stiker langsung)\n` +
      `*╰───────────────*`
    )
  }

  // 5. KASUS STIKER: Pengguna membalas Stiker (baik dengan "pair" maupun langsung .ssound)
  // Karena stiker tidak memiliki suara bawaan, otomatis simpan ke antrean pairing
  if (isSticker) {
    let mediaBuffer = await quoted.download()
    if (!mediaBuffer) return m.reply(status.error('Gagal mengunduh stiker.'))

    const isAnimated = Boolean(quoted.msg?.isAnimated || mediaBuffer.includes('ANIM'))

    if (conn.stickerSoundSession[m.sender]) {
      clearTimeout(conn.stickerSoundSession[m.sender].timeout)
    }

    conn.stickerSoundSession[m.sender] = {
      buffer: mediaBuffer,
      type: 'sticker',
      isAnimated,
      timeout: setTimeout(() => {
        delete conn.stickerSoundSession[m.sender]
      }, 60000).unref()
    }

    const typeLabel = isAnimated ? 'Stiker Bergerak (Animasi)' : 'Stiker Statis'
    const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⧗ ꜱ ᴛ ɪ ᴋ ᴇ ʀ  ᴛ ᴇ ʀ ꜱ ɪ ᴍ ᴘ ᴀ ɴ 〕*\n` +
      `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Otomatis* 𝜚\n` +
      `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
      `*┆* ✦ ᴛɪᴘᴇ     : *${typeLabel}*\n` +
      `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Audio / Voice Note*\n` +
      `*╰───────────────*\n\n` +
      `> Stiker berhasil disimpan dalam antrean pairing!\n` +
      `> Sekarang, silakan balas file audio atau Voice Note dengan *${usedPrefix + command}* untuk memasangkan suaranya ke stiker ini!\n` +
      `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

    return m.reply(caption)
  }

  // 6. KASUS FOTO: Pengguna membalas Foto (baik dengan "pair" maupun langsung .ssound)
  if (isImage) {
    let mediaBuffer = await quoted.download()
    if (!mediaBuffer) return m.reply(status.error('Gagal mengunduh foto.'))

    if (conn.stickerSoundSession[m.sender]) {
      clearTimeout(conn.stickerSoundSession[m.sender].timeout)
    }

    conn.stickerSoundSession[m.sender] = {
      buffer: mediaBuffer,
      type: 'image',
      timeout: setTimeout(() => {
        delete conn.stickerSoundSession[m.sender]
      }, 60000).unref()
    }

    const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ℹ ꜰ ᴏ ᴛ ᴏ  ᴛ ᴇ ʀ ꜱ ɪ ᴍ ᴘ ᴀ ɴ 〕*\n` +
      `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Otomatis* 𝜚\n` +
      `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
      `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Audio / Voice Note*\n` +
      `*╰───────────────*\n\n` +
      `> Foto berhasil disimpan dalam antrean pairing!\n` +
      `> Sekarang, silakan balas audio atau Voice Note dengan *${usedPrefix + command}* untuk memasangkan suaranya ke stiker foto ini!\n` +
      `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

    return m.reply(caption)
  }

  // 7. KASUS VIDEO (Mode Pairing): Pengguna membalas Video dengan keyword "pair"
  if (isVideo && isPairMode) {
    let mediaBuffer = await quoted.download()
    if (!mediaBuffer) return m.reply(status.error('Gagal mengunduh video.'))

    if (conn.stickerSoundSession[m.sender]) {
      clearTimeout(conn.stickerSoundSession[m.sender].timeout)
    }

    conn.stickerSoundSession[m.sender] = {
      buffer: mediaBuffer,
      type: 'video',
      timeout: setTimeout(() => {
        delete conn.stickerSoundSession[m.sender]
      }, 60000).unref()
    }

    const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⧗ ᴠ ɪ ᴅ ᴇ ᴏ  ᴛ ᴇ ʀ ꜱ ɪ ᴍ ᴘ ᴀ ɴ 〕*\n` +
      `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Sementara* 𝜚\n` +
      `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
      `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Audio / Voice Note*\n` +
      `*╰───────────────*\n\n` +
      `> Video berhasil disimpan! Silakan balas file audio atau Voice Note dengan *${usedPrefix + command}* untuk mengganti/memasangkan suaranya!\n` +
      `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

    return m.reply(caption)
  }

  // 8. KASUS VIDEO (Mode Langsung): Pengguna membalas video bersuara (Instant Video Sound Sticker)
  if (isVideo) {
    let seconds = (quoted.msg || quoted).seconds || 0
    const timeRange = extractTimeRange(args.join(' '), 15)

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    let videoBuffer = await quoted.download()
    if (!videoBuffer) return m.reply(status.error('Gagal mengunduh video.'))

    if (!seconds) {
      seconds = await getVideoDuration(videoBuffer)
    }

    // Jika video > 15 detik dan pengguna TIDAK menyertakan argumen rentang waktu
    if (seconds > 15 && !timeRange) {
      conn.videoTrimSession = conn.videoTrimSession || {}
      if (conn.videoTrimSession[m.sender]?.timeout) {
        clearTimeout(conn.videoTrimSession[m.sender].timeout)
      }
      conn.videoTrimSession[m.sender] = {
        buffer: videoBuffer,
        type: 'ssound',
        chat: m.chat,
        seconds,
        maxDuration: 15,
        args,
        timeout: setTimeout(() => {
          delete conn.videoTrimSession[m.sender]
        }, 120000).unref()
      }
      await conn.sendMessage(m.chat, { react: { text: '✂️', key: m.key } }).catch(() => {})
      return m.reply(formatTrimPrompt(seconds, 15, command, true))
    }

    try {
      let finalVideo = videoBuffer
      if (timeRange) {
        finalVideo = await trimVideoBuffer(videoBuffer, timeRange.start, timeRange.duration)
      } else if (seconds > 10) {
        finalVideo = await trimVideoBuffer(videoBuffer, 0, 10)
      }

      // Ekstrak audio dari video asli PENUH (videoBuffer)
      // PENTING: Musik TIDAK dipotong dengan durasi video, musik tetap utuh sesuai lagu aslinya!
      let audioResult = await ffmpeg(videoBuffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-ac', '1',
        '-ar', '48000',
        '-t', '90'
      ], 'mp4', 'ogg')

      await processAndSendSoundSticker(conn, m, finalVideo, audioResult.data, args, true, false)
      audioResult.delete().catch(() => {})
    } catch (err) {
      console.error('[Sticker Sound Error]:', err)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      m.reply(status.error('Gagal memproses stiker bersuara dari video.'))
    }
    return
  }

  // 9. Pesan panduan jika command dipanggil tanpa media
  const guideText = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ✦ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟷 : *Balas Video Bersuara*\n` +
    `*┆* › Ketik *${usedPrefix + command}*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟸 : *Pasang Suara ke Stiker / Foto / Video*\n` +
    `*┆* › Balas stiker, foto, atau video dengan *${usedPrefix + command}*\n` +
    `*┆* › Lalu balas audio/VN dengan *${usedPrefix + command}*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟹 : *Audio Dahulu Baru Visual*\n` +
    `*┆* › Balas audio/VN dengan *${usedPrefix + command} pair*\n` +
    `*┆* › Lalu balas stiker/foto/video dengan *${usedPrefix + command}*\n` +
    `*╰───────────────*\n\n` +
    `> Stiker dikirimkan sebagai *Stiker Bersuara Asli (Native WhatsApp Sound Sticker)*!\n` +
    `> _Suara otomatis tersemat di stiker dan dapat diputar saat stiker ditekan._`

  m.reply(guideText)
}

/**
 * Helper untuk konversi stiker dan pengiriman stiker bersuara asli
 */
export async function processAndSendSoundSticker(conn, m, mediaBuffer, audioBuffer, args, isVideo = true, isDirectSticker = false) {
  let [packname, ...authorArr] = (args || []).join(' ').split('|')
  packname = (packname && packname.trim()) || global.stickpack || 'Avelia Sound'
  let author = authorArr.join('|').trim() || global.stickauth || 'Avelia'

  let stiker = mediaBuffer
  if (!isDirectSticker) {
    // 1. Buat WebP Sticker (Gambar Statis atau Animasi) dengan EXIF jika bukan stiker asli
    try {
      stiker = await sticker(mediaBuffer, false, packname, author)
    } catch (e) {
      // fallback jika gagal
    }

    if (!stiker) {
      try {
        stiker = await (new Sticker(mediaBuffer, {
          type: 'full',
          pack: packname,
          author: author,
          quality: 70
        })).toBuffer()
      } catch (e) {
        console.error('Sticker fallback error:', e)
      }
    }
  }

  if (!stiker) throw new Error('Gagal mengonversi media ke stiker.')

  // 2. Kirim Native Sound Sticker (Single Message Payload)
  await sendAudioSticker(conn, m.chat, {
    sticker: stiker,
    audio: audioBuffer,
    packname,
    author,
    isAnimated: Boolean(isVideo)
  }, m)

  await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
}

handler.help = ['stikersuara [start end]', 'ssound [pair|start end]']
handler.tags = ['sticker']
handler.command = /^(stikersuara|stikersound|ssound)$/i
handler.limit = true
handler.register = true

export default handler
