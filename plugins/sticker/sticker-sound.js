import { sticker } from '../../lib/sticker.js'
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
  const isAudio = /audio/.test(mime)

  // 2. Mode Pairing: Pengguna membalas video dengan argumen "pair" / "custom"
  const isPairMode = (args[0] === 'pair' || args[0] === 'custom' || args[0] === 'gabung')

  if (isVideo && isPairMode) {
    let videoBuffer = await quoted.download()
    if (!videoBuffer) return m.reply(status.error('Gagal mengunduh video.'))

    if (conn.stickerSoundSession[m.sender]) {
      clearTimeout(conn.stickerSoundSession[m.sender].timeout)
    }

    conn.stickerSoundSession[m.sender] = {
      video: videoBuffer,
      timeout: setTimeout(() => {
        delete conn.stickerSoundSession[m.sender]
      }, 60000)
    }

    const caption = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⧗ ᴠ ɪ ᴅ ᴇ ᴏ  ᴛ ᴇ ʀ ꜱ ɪ ᴍ ᴘ ᴀ ɴ 〕*\n` +
      `*┆* ⟡ ꜱᴛᴀᴛᴜꜱ   : *Tersimpan Sementara* 𝜚\n` +
      `*┆* ⏱ ᴅᴜʀᴀꜱɪ   : *𝟼𝟶 Detik*\n` +
      `*┆* ✦ ᴘᴇᴛᴜɴᴊᴜᴋ : *Balas Audio / Voice Note*\n` +
      `*╰───────────────*\n\n` +
      `> Silakan balas file audio atau Voice Note dengan perintah *${usedPrefix + command}* untuk memasangkan suaranya ke video ini!\n` +
      `> _Ketik *${usedPrefix + command} batal* jika ingin membatalkan._`

    return m.reply(caption)
  }

  // 3. Mode Pairing Step 2: Pengguna membalas audio saat ada video di session
  if (isAudio) {
    const session = conn.stickerSoundSession[m.sender]
    if (!session) {
      return m.reply(
        `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
        `> Kamu belum memilih video untuk dipasangkan dengan suara ini.\n` +
        `> Silakan balas video terlebih dahulu dengan perintah:\n` +
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
      // Gabungkan video sesi dengan audio yang dibalas
      let merged = await mergeAudioVideo(session.video, audioBuffer, 'mp4', 'mp3', 'mp4')
      await processAndSendSoundSticker(conn, m, merged.data, audioBuffer, args)
      merged.delete().catch(() => {})
    } catch (err) {
      console.error('[Sticker Sound Merge Error]:', err)
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      m.reply(status.error('Gagal menggabungkan audio dengan video. Pastikan format didukung.'))
    }
    return
  }

  // 4. Mode Langsung: Pengguna membalas video bersuara (Instant Sticker + Audio Companion)
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

  // 5. Pesan panduan jika command dipanggil tanpa media
  const guideText = `*──  ୨୧ ✧ STIKER BERSUARA ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ✦ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟷 : *Balas Video Bersuara*\n` +
    `*┆* › Ketik *${usedPrefix + command}*\n` +
    `*┆* ⟡ ᴍᴏᴅᴇ 𝟸 : *Pasang Audio Kustom*\n` +
    `*┆* › Balas video dengan *${usedPrefix + command} pair*\n` +
    `*┆* › Lalu balas audio/VN dengan *${usedPrefix + command}*\n` +
    `*╰───────────────*\n\n` +
    `> Stiker animasi akan dikirimkan beserta pesan suara berdenyut resmi WhatsApp!`

  m.reply(guideText)
}

/**
 * Helper untuk konversi stiker dan pengiriman companion voice note
 */
async function processAndSendSoundSticker(conn, m, videoBuffer, audioBuffer, args) {
  let [packname, ...authorArr] = (args || []).join(' ').split('|')
  packname = (packname && packname.trim()) || global.stickpack || 'Avelia Sound'
  let author = authorArr.join('|').trim() || global.stickauth || 'Avelia'

  // 1. Buat WebP Animated Sticker
  let stiker = await sticker(videoBuffer, false, packname, author)
  if (!stiker) throw new Error('Gagal mengonversi video ke stiker.')

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
