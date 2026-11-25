import { sticker } from '../../lib/sticker.js'
import { Sticker } from 'wa-sticker-formatter'
import { toPTT, ffmpeg, mergeAudioVideo } from '../../lib/converter.js'
import { extractWaveform } from '../../lib/voice-noteData.js'
import { status } from '../../lib/style.js'

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
  const isVideo = /video|gif/.test(mime)
  const isImage = /image/.test(mime) && !/webp/.test(mime)
  const isAudio = /audio/.test(mime)

  // 2. Mode Pairing: Pengguna membalas Video atau Foto dengan argumen "pair" / "custom"
  const isPairMode = (args[0] === 'pair' || args[0] === 'custom' || args[0] === 'gabung')

  if ((isVideo && isPairMode) || (isImage && isPairMode)) {
    let mediaBuffer = await quoted.download()
    if (!mediaBuffer) return m.reply(status.error(`Gagal mengunduh ${isVideo ? 'video' : 'foto'}.`))

    if (conn.stickerSoundSession[m.sender]) {
      clearTimeout(conn.stickerSoundSession[m.sender].timeout)
    }

    conn.stickerSoundSession[m.sender] = {
      buffer: mediaBuffer,
      type: isVideo ? 'video' : 'image',
      timeout: setTimeout(() => {
        delete conn.stickerSoundSession[m.sender]
      }, 60000).unref()
    }

    const mediaLabel = isVideo ? 'ᴠ ɪ ᴅ ᴇ ᴏ' : 'ꜰ ᴏ ᴛ ᴏ'
    const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⧗ ${mediaLabel}  ᴛ ᴇ ʀ ꜱ ɪ ᴍ ᴘ ᴀ ɴ 〕*\n` +
      `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Sementara* 𝜚\n` +
      `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
      `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Audio / Voice Note*\n` +
      `*╰───────────────*\n\n` +
      `> Silakan balas file audio atau Voice Note dengan perintah *${usedPrefix + command}* untuk memasangkan suaranya ke ${isVideo ? 'video' : 'foto'} ini!\n` +
      `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

    return m.reply(caption)
  }

  // 3. Jika pengguna membalas Foto langsung tanpa keyword "pair"
  // Karena foto statis tidak punya audio asli, otomatis simpan ke antrean pairing
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
      `> Foto tidak memiliki audio asli, sehingga otomatis disimpan dalam antrean pairing.\n` +
      `> Sekarang, silakan balas audio atau Voice Note dengan *${usedPrefix + command}* untuk memasangkan suaranya ke stiker foto ini!\n` +
      `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

    return m.reply(caption)
  }

  // 4. Mode Pairing Step 2: Pengguna membalas audio saat ada video/foto di session
  if (isAudio) {
    const session = conn.stickerSoundSession[m.sender]
    if (!session) {
      return m.reply(
        `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
        `> Kamu belum memilih video atau foto untuk dipasangkan dengan suara ini.\n` +
        `> Silakan balas video atau foto terlebih dahulu dengan perintah:\n` +
        `> › *${usedPrefix + command} pair*\n` +
        `*╰───────────────*`
      )
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    let audioBuffer = await quoted.download()
    clearTimeout(session.timeout)
    delete conn.stickerSoundSession[m.sender]

    if (!audioBuffer) return m.reply(status.error('Gagal mengunduh audio.'))

    try {
      if (session.type === 'video') {
        // Gabungkan video dengan audio kustom
        let merged = await mergeAudioVideo(session.buffer, audioBuffer, 'mp4', 'mp3', 'mp4')
        await processAndSendSoundSticker(conn, m, merged.data, audioBuffer, args)
        merged.delete().catch(() => {})
      } else {
        // Foto dipasangkan dengan audio kustom
        await processAndSendSoundSticker(conn, m, session.buffer, audioBuffer, args)
      }
    } catch (err) {
      console.error('[Sticker Sound Merge Error]:', err)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      m.reply(status.error('Gagal memproses stiker bersuara. Pastikan format media didukung.'))
    }
    return
  }

  // 5. Mode Langsung: Pengguna membalas video bersuara (Instant Sticker + Audio Companion)
  if (isVideo) {
    let seconds = (quoted.msg || quoted).seconds || 0
    if (seconds > 15) {
      return m.reply(
        `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
        `> Durasi video maksimal adalah *𝟷𝟻 detik* untuk stiker bersuara.\n` +
        `*╰───────────────*`
      )
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})

    let videoBuffer = await quoted.download()
    if (!videoBuffer) return m.reply(status.error('Gagal mengunduh video.'))

    try {
      // Ekstrak audio dari video asli
      let audioResult = await ffmpeg(videoBuffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-ac', '1',
        '-ar', '48000'
      ], 'mp4', 'ogg')

      await processAndSendSoundSticker(conn, m, videoBuffer, audioResult.data, args)
      audioResult.delete().catch(() => {})
    } catch (err) {
      console.error('[Sticker Sound Error]:', err)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      m.reply(status.error('Gagal memproses stiker bersuara dari video.'))
    }
    return
  }

  // 6. Pesan panduan jika command dipanggil tanpa media
  const guideText = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ✦ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟷 : *Balas Video Bersuara*\n` +
    `*┆* › Ketik *${usedPrefix + command}*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟸 : *Pasang Suara ke Foto / Video*\n` +
    `*┆* › Balas foto atau video dengan *${usedPrefix + command} pair*\n` +
    `*┆* › Lalu balas audio/VN dengan *${usedPrefix + command}*\n` +
    `*╰───────────────*\n\n` +
    `> Stiker akan dikirimkan beserta pesan suara berdenyut resmi WhatsApp!`

  m.reply(guideText)
}

/**
 * Helper untuk konversi stiker dan pengiriman companion voice note
 */
async function processAndSendSoundSticker(conn, m, mediaBuffer, audioBuffer, args) {
  let [packname, ...authorArr] = (args || []).join(' ').split('|')
  packname = (packname && packname.trim()) || global.stickpack || 'Avelia Sound'
  let author = authorArr.join('|').trim() || global.stickauth || 'Avelia'

  // 1. Buat WebP Sticker (Gambar Statis atau Animasi)
  let stiker = false
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

  if (!stiker) throw new Error('Gagal mengonversi media ke stiker.')

  // 2. Siapkan Opus PTT & Waveform Dynamic (64 bar)
  let pttData = await toPTT(audioBuffer, 'mp3').catch(async () => {
    return ffmpeg(audioBuffer, [
      '-vn',
      '-c:a', 'libopus',
      '-b:a', '128k',
      '-vbr', 'on',
      '-ac', '1',
      '-ar', '48000'
    ], 'ogg', 'ogg')
  })

  let waveform = await extractWaveform(pttData.data).catch(() => null)

  // 3. Kirim stiker terlebih dahulu
  let sentSticker = await conn.sendMessage(m.chat, {
    sticker: stiker
  }, { quoted: m })

  // 4. Kirim companion Voice Note (PTT) yang me-quote stiker
  await conn.sendMessage(m.chat, {
    audio: pttData.data,
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true,
    waveform: waveform ? new Uint8Array(waveform) : undefined
  }, { quoted: sentSticker })

  if (pttData.delete) pttData.delete().catch(() => {})

  await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } }).catch(() => {})
}

handler.help = ['stikersuara', 'ssound [pair]']
handler.tags = ['sticker']
handler.command = /^(stikersuara|stikersound|ssound)$/i
handler.limit = true
handler.register = true

export default handler
