import { sticker, directVideoToSticker } from '../../lib/sticker.js'
import { Sticker } from 'wa-sticker-formatter'
import { ffmpeg, mergeAudioVideo } from '../../lib/converter.js'
import { sendAudioSticker } from '../../lib/audioSticker.js'
import { status } from '../../lib/style.js'
import { extractTimeRange, getVideoDuration, trimVideoBuffer, formatTrimPrompt } from '../../lib/videoTrim.js'
import { getTikTok, downloadBuffer } from '../downloader/downloader-tiktok.js'

const TIKTOK_URL_REGEX = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?tiktok\.com\/[^\s]+/i

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

  // 3. DETEKSI LINK TIKTOK (Dari teks perintah maupun pesan yang di-quote)
  const rawText = text || ''
  const quotedText = m.quoted ? (m.quoted.text || '') : ''
  const combinedText = [rawText, quotedText].filter(Boolean).join(' ')
  const ttMatch = combinedText.match(TIKTOK_URL_REGEX)

  if (ttMatch) {
    let ttUrl = ttMatch[0].trim()
    if (!/^https?:\/\//i.test(ttUrl)) ttUrl = 'https://' + ttUrl

    // Cek apakah pengguna menginginkan HANYA audio TikTok (.ssound audio <link> / .ssound <link> audio)
    const isAudioOnly = args.some(arg => /^(audio|suara|sound|mp3|lagu)$/i.test(arg))

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    try {
      const res = await getTikTok(ttUrl)

      // ── Sub-kasus 3A: Mode Audio-Only TikTok ──────────────────────
      if (isAudioOnly) {
        let audioBuffer = null
        if (res.music) {
          try {
            audioBuffer = await downloadBuffer(res.music, res.referer || 'https://www.tiktok.com/')
          } catch (e) {
            console.warn('[TikTok Audio Direct Failed, will fallback to video audio]', e.message)
          }
        }

        if (!audioBuffer && res.play) {
          const vidBuf = await downloadBuffer(res.play, res.referer || 'https://www.tiktok.com/')
          const audioResult = await ffmpeg(vidBuf, [
            '-vn',
            '-c:a', 'libopus',
            '-b:a', '128k',
            '-vbr', 'on',
            '-ac', '1',
            '-ar', '48000',
            '-t', '90'
          ], 'mp4', 'ogg')
          audioBuffer = audioResult.data
        }

        if (!audioBuffer) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
          return m.reply(status.error('Gagal mengambil audio dari tautan TikTok tersebut.'))
        }

        // 3A.1 Jika pengguna membalas Stiker / Foto / Video secara bersamaan
        if (isSticker || isImage || isVideo) {
          let mediaBuffer = await quoted.download()
          if (!mediaBuffer) return m.reply(status.error('Gagal mengunduh media yang dibalas.'))

          if (isSticker) {
            const isAnimated = Boolean(quoted.msg?.isAnimated || mediaBuffer.includes('ANIM'))
            await processAndSendSoundSticker(conn, m, mediaBuffer, audioBuffer, args, isAnimated, true)
          } else if (isImage) {
            await processAndSendSoundSticker(conn, m, mediaBuffer, audioBuffer, args, false, false)
          } else if (isVideo) {
            const vidDur = (quoted.msg || quoted).seconds || await getVideoDuration(mediaBuffer)
            const { packname, author } = getStickerWatermark(args)
            const stikerWebp = await directVideoToSticker(mediaBuffer, { startSec: 0, durationSec: Math.min(vidDur || 10, 10), packname, author })
            await sendAudioSticker(conn, m.chat, { sticker: stikerWebp, audio: audioBuffer, packname, author, isAnimated: true }, m)
            await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
          }
          return
        }

        // 3A.2 Jika sudah ada sesi media visual aktif di antrean
        if (session && (session.type === 'sticker' || session.type === 'image' || session.type === 'video')) {
          clearTimeout(session.timeout)
          delete conn.stickerSoundSession[m.sender]

          if (session.type === 'sticker') {
            await processAndSendSoundSticker(conn, m, session.buffer, audioBuffer, args, session.isAnimated, true)
          } else if (session.type === 'video') {
            const vidDur = session.seconds || await getVideoDuration(session.buffer)
            const { packname, author } = getStickerWatermark(args)
            const stikerWebp = await directVideoToSticker(session.buffer, { startSec: 0, durationSec: Math.min(vidDur || 10, 10), packname, author })
            await sendAudioSticker(conn, m.chat, { sticker: stikerWebp, audio: audioBuffer, packname, author, isAnimated: true }, m)
            await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
          } else {
            await processAndSendSoundSticker(conn, m, session.buffer, audioBuffer, args, false, false)
          }
          return
        }

        // 3A.3 Belum ada media: Simpan audio TikTok ke antrean sesi
        if (conn.stickerSoundSession[m.sender]) {
          clearTimeout(conn.stickerSoundSession[m.sender].timeout)
        }

        conn.stickerSoundSession[m.sender] = {
          buffer: audioBuffer,
          type: 'audio',
          title: res.title,
          timeout: setTimeout(() => {
            delete conn.stickerSoundSession[m.sender]
          }, 60000).unref()
        }

        const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
          `*╭  〔 🎵 ᴀ ᴜ ᴅ ɪ ᴏ  ᴛ ɪ ᴋ ᴛ ᴏ ᴋ 〕*\n` +
          `*┆* ⟡ ᴊᴜᴅᴜʟ   : *${res.title || 'TikTok Audio'}*\n` +
          `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Otomatis* 𝜚\n` +
          `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
          `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Stiker / Foto / Video*\n` +
          `*╰───────────────*\n\n` +
          `> Audio TikTok berhasil diunduh dan disimpan dalam antrean!\n` +
          `> Sekarang, silakan balas stiker, foto, atau video dengan *${usedPrefix + command}* untuk memasangkan lagu ini menjadi Stiker Bersuara!\n` +
          `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

        return m.reply(caption)
      }

      // ── Sub-kasus 3B: Mode Langsung Video TikTok → Stiker Bersuara ──
      // Jika merupakan postingan Slide Foto TikTok
      if (Array.isArray(res.images) && res.images.length > 0 && !res.play) {
        const imgBuffer = await downloadBuffer(res.images[0], res.referer || 'https://www.tiktok.com/')
        let audioBuffer = null
        if (res.music) {
          try {
            audioBuffer = await downloadBuffer(res.music, res.referer || 'https://www.tiktok.com/')
          } catch (e) {
            console.warn('[TikTok Slide Music DL Error]', e.message)
          }
        }
        if (!audioBuffer) {
          throw new Error('Slide foto TikTok tidak memiliki audio yang dapat diproses.')
        }
        await processAndSendSoundSticker(conn, m, imgBuffer, audioBuffer, args, false, false)
        return
      }

      // Video TikTok biasa
      if (!res.play) {
        throw new Error('Tautan TikTok tidak memiliki media video atau foto yang dapat diunduh.')
      }

      const videoBuffer = await downloadBuffer(res.play, res.referer || 'https://www.tiktok.com/')
      if (!videoBuffer) throw new Error('Gagal mengunduh buffer video TikTok.')

      const vidDur = await getVideoDuration(videoBuffer)

      // Cek apakah ada argumen pemotongan kustom dari pengguna (misal: .ssound <url> 5 12 atau .ssound <url> 0 20)
      const cleanArgsText = args.filter(a => !TIKTOK_URL_REGEX.test(a) && !/^(audio|suara|sound|mp3|lagu)$/i.test(a)).join(' ')
      const customTimeRange = extractTimeRange(cleanArgsText, 30)

      let startSec = 0
      let maxVisualSec = Math.min(vidDur || 10, 10)
      if (customTimeRange) {
        startSec = customTimeRange.start
        maxVisualSec = Math.min(customTimeRange.duration, vidDur || 30)
      }

      const { packname, author } = getStickerWatermark(args)

      // OPTIMASI DIRECT 1-PASS (Paralel: Audio & WebP Stiker diproses simultan tanpa transcode MP4)
      const audioPromise = (async () => {
        let audioBuffer = null
        if (res.music) {
          try {
            audioBuffer = await downloadBuffer(res.music, res.referer || 'https://www.tiktok.com/')
          } catch (e) {
            console.warn('[TikTok Music Fetch Failed, fallback to video audio]', e.message)
          }
        }
        if (!audioBuffer) {
          const audioResult = await ffmpeg(videoBuffer, [
            '-vn',
            '-c:a', 'libopus',
            '-b:a', '128k',
            '-vbr', 'on',
            '-ac', '1',
            '-ar', '48000',
            '-t', '90'
          ], 'mp4', 'ogg')
          audioBuffer = audioResult.data
        }
        return audioBuffer
      })()

      const stickerPromise = directVideoToSticker(videoBuffer, {
        startSec,
        durationSec: maxVisualSec,
        packname,
        author
      })

      const [audioBuffer, stikerWebp] = await Promise.all([audioPromise, stickerPromise])

      await sendAudioSticker(conn, m.chat, {
        sticker: stikerWebp,
        audio: audioBuffer,
        packname,
        author,
        isAnimated: true
      }, m)

      await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
      return

    } catch (err) {
      console.error('[Sticker Sound TikTok Error]:', err)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      return m.reply(status.error(`Gagal memproses tautan TikTok:\n> ${err?.message || err}`))
    }
  }

  // 4. KASUS KHUSUS: Jika sesi aktif menyimpan AUDIO dan pengguna sekarang membalas Stiker, Foto, atau Video
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
          const vidDur = (quoted.msg || quoted).seconds || await getVideoDuration(mediaBuffer)
          const { packname, author } = getStickerWatermark(args)
          const stikerWebp = await directVideoToSticker(mediaBuffer, { startSec: 0, durationSec: Math.min(vidDur || 10, 10), packname, author })
          await sendAudioSticker(conn, m.chat, { sticker: stikerWebp, audio: session.buffer, packname, author, isAnimated: true }, m)
          await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
        }
      } catch (err) {
        console.error('[Sticker Sound Reverse Pairing Error]:', err)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
        m.reply(status.error('Gagal memproses stiker bersuara. Pastikan format media didukung.'))
      }
      return
    }
  }

  // 5. KASUS AUDIO: Jika pengguna membalas Audio / Voice Note
  if (isAudio) {
    // 5a. Jika ada sesi aktif yang menyimpan visual media (Stiker, Foto, atau Video)
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
          const vidDur = session.seconds || await getVideoDuration(session.buffer)
          const { packname, author } = getStickerWatermark(args)
          const stikerWebp = await directVideoToSticker(session.buffer, { startSec: 0, durationSec: Math.min(vidDur || 10, 10), packname, author })
          await sendAudioSticker(conn, m.chat, { sticker: stikerWebp, audio: audioBuffer, packname, author, isAnimated: true }, m)
          await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
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

    // 5b. Jika belum ada visual media, tetapi pengguna membalas Audio dengan "pair" -> simpan audio dulu
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

    // 5c. Jika membalas audio tanpa ada visual media dan tanpa keyword pair
    return m.reply(
      `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
      `> Kamu belum memilih stiker, foto, atau video untuk dipasangkan dengan audio ini.\n` +
      `> Silakan balas stiker, foto, atau video terlebih dahulu dengan perintah:\n` +
      `> › *${usedPrefix + command} pair* (atau balas stiker langsung)\n` +
      `*╰───────────────*`
    )
  }

  // 6. KASUS STIKER: Pengguna membalas Stiker (baik dengan "pair" maupun langsung .ssound)
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

  // 7. KASUS FOTO: Pengguna membalas Foto (baik dengan "pair" maupun langsung .ssound)
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

  // 8. KASUS VIDEO (Mode Pairing): Pengguna membalas Video dengan keyword "pair"
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

  // 9. KASUS VIDEO (Mode Langsung): Pengguna membalas video bersuara (Instant Video Sound Sticker)
  if (isVideo) {
    let seconds = (quoted.msg || quoted).seconds || 0
    const timeRange = extractTimeRange(args.join(' '), 30)

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    let videoBuffer = await quoted.download()
    if (!videoBuffer) return m.reply(status.error('Gagal mengunduh video.'))

    if (!seconds) {
      seconds = await getVideoDuration(videoBuffer)
    }

    // Jika video > 10 detik dan pengguna TIDAK menyertakan argumen rentang waktu
    if (seconds > 10 && !timeRange) {
      conn.videoTrimSession = conn.videoTrimSession || {}
      if (conn.videoTrimSession[m.sender]?.timeout) {
        clearTimeout(conn.videoTrimSession[m.sender].timeout)
      }
      conn.videoTrimSession[m.sender] = {
        buffer: videoBuffer,
        type: 'ssound',
        chat: m.chat,
        seconds,
        maxDuration: 20,
        args,
        timeout: setTimeout(() => {
          delete conn.videoTrimSession[m.sender]
        }, 120000).unref()
      }
      await conn.sendMessage(m.chat, { react: { text: '✂️', key: m.key } }).catch(() => {})
      return m.reply(formatTrimPrompt(seconds, 20, command, true))
    }

    try {
      let startSec = timeRange ? timeRange.start : 0
      let durationSec = timeRange ? timeRange.duration : Math.min(seconds || 10, 10)
      const { packname, author } = getStickerWatermark(args)

      // OPTIMASI DIRECT 1-PASS (Paralel: Audio & WebP Stiker diproses simultan tanpa transcode MP4)
      const [audioBuffer, stikerWebp] = await Promise.all([
        ffmpeg(videoBuffer, [
          '-vn',
          '-c:a', 'libopus',
          '-b:a', '128k',
          '-vbr', 'on',
          '-ac', '1',
          '-ar', '48000',
          '-t', '90'
        ], 'mp4', 'ogg').then(res => res.data),
        directVideoToSticker(videoBuffer, {
          startSec,
          durationSec,
          packname,
          author
        })
      ])

      await sendAudioSticker(conn, m.chat, {
        sticker: stikerWebp,
        audio: audioBuffer,
        packname,
        author,
        isAnimated: true
      }, m)

      await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
    } catch (err) {
      console.error('[Sticker Sound Error]:', err)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      m.reply(status.error('Gagal memproses stiker bersuara dari video.'))
    }
    return
  }

  // 10. Pesan panduan jika command dipanggil tanpa media atau tautan
  const guideText = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ✦ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟷 : *Tautan TikTok Langsung*\n` +
    `*┆* › Ketik *${usedPrefix + command} <link tiktok>*\n` +
    `*┆* › _Otomatis dipotong 0–10 detik dengan audio penuh!_\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟸 : *Audio TikTok Saja*\n` +
    `*┆* › Ketik *${usedPrefix + command} audio <link tiktok>*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟹 : *Balas Video Bersuara*\n` +
    `*┆* › Balas video dengan *${usedPrefix + command}*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟺 : *Pasang Suara ke Stiker / Foto*\n` +
    `*┆* › Balas stiker/foto dengan *${usedPrefix + command}*, lalu balas audio/VN\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟻 : *Audio Dahulu Baru Visual*\n` +
    `*┆* › Balas audio/VN dengan *${usedPrefix + command} pair*, lalu balas stiker/foto\n` +
    `*╰───────────────*\n\n` +
    `> Stiker dikirimkan sebagai *Stiker Bersuara Asli (Native WhatsApp Sound Sticker)*!\n` +
    `> _Suara otomatis tersemat di stiker dan dapat diputar saat stiker ditekan._`

  m.reply(guideText)
}

/**
 * Helper untuk parsing watermark stiker (packname & author) secara bersih tanpa menyertakan URL atau keyword
 */
export function getStickerWatermark(args = []) {
  const raw = Array.isArray(args) ? args.join(' ') : String(args || '')
  let clean = raw
    .replace(/(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?tiktok\.com\/[^\s]+/gi, '')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\b(audio|suara|sound|mp3|lagu|pair|custom|gabung)\b/gi, '')
    .trim()

  const tr = extractTimeRange(clean, 10)
  if (tr && tr.cleanText !== undefined) {
    clean = tr.cleanText.trim()
  } else if (/^\d{1,2}(?:\s+\d{1,2}|[-~–]\d{1,2})?$/.test(clean)) {
    clean = ''
  }

  let [packname, ...authorArr] = clean.split('|')
  packname = (packname && packname.trim()) || global.stickpack || 'Avelia Sound'
  let author = (authorArr.length && authorArr.join('|').trim()) || global.stickauth || 'Avelia'

  return { packname, author }
}

/**
 * Helper untuk konversi stiker dan pengiriman stiker bersuara asli
 */
export async function processAndSendSoundSticker(conn, m, mediaBuffer, audioBuffer, args, isVideo = true, isDirectSticker = false) {
  const { packname, author } = getStickerWatermark(args)

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

handler.help = ['stikersuara [link/time]', 'ssound [link/pair/time]', 'ssound audio <link>']
handler.tags = ['sticker']
handler.command = /^(stikersuara|stikersound|ssound|sssound)$/i
handler.limit = true
handler.register = true

export default handler
