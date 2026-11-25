import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { toPTT, ffmpeg } from './converter.js'
import { extractWaveform } from './voice-noteData.js'
import { sticker as createSticker } from './sticker.js'
import { Sticker } from 'wa-sticker-formatter'

/**
 * Memastikan proto Baileys memiliki runtime fallback untuk field audioMessage di StickerMessage
 * dan audioStickerMessage di Message (safety net jika node_modules belum dipatch).
 */
export function ensureAudioStickerProto(p = proto) {
  if (p?.Message?.StickerMessage && !p.Message.StickerMessage.prototype.audioMessage) {
    p.Message.StickerMessage.prototype.audioMessage = null
    p.Message.StickerMessage.prototype.emojis = null

    const origStickerEncode = p.Message.StickerMessage.encode
    p.Message.StickerMessage.encode = function encode(message, writer) {
      writer = origStickerEncode(message, writer)
      if (message.emojis != null && Object.hasOwnProperty.call(message, 'emojis')) {
        writer.uint32(202).string(message.emojis)
      }
      if (message.audioMessage != null && Object.hasOwnProperty.call(message, 'audioMessage')) {
        p.Message.AudioMessage.encode(message.audioMessage, writer.uint32(210).fork()).ldelim()
      }
      return writer
    }
  }

  if (p?.Message && !p.Message.prototype.audioStickerMessage) {
    p.Message.prototype.audioStickerMessage = null

    const origMsgEncode = p.Message.encode
    p.Message.encode = function encode(message, writer) {
      writer = origMsgEncode(message, writer)
      if (message.audioStickerMessage != null && Object.hasOwnProperty.call(message, 'audioStickerMessage')) {
        p.Message.FutureProofMessage.encode(message.audioStickerMessage, writer.uint32(1074).fork()).ldelim()
      }
      return writer
    }
  }
}

// Inisialisasi pengecekan proto saat modul dimuat
ensureAudioStickerProto(proto)

/**
 * Menghitung durasi audio dalam detik menggunakan ffmpeg/ffprobe jika tidak disediakan
 * @param {Buffer} buffer
 * @returns {Promise<number>}
 */
async function getAudioDuration(buffer) {
  return new Promise((resolve) => {
    try {
      import('fluent-ffmpeg').then(({ default: fluent_ffmpeg }) => {
        import('stream').then(({ Readable }) => {
          const stream = Readable.from(buffer)
          fluent_ffmpeg(stream).ffprobe((err, data) => {
            if (err || !data?.format?.duration) {
              return resolve(5) // default fallback 5 detik
            }
            resolve(Math.round(data.format.duration) || 1)
          })
        }).catch(() => resolve(5))
      }).catch(() => resolve(5))
    } catch {
      resolve(5)
    }
  })
}

/**
 * Mengirim Stiker Bersuara Asli (Native WhatsApp Sound Sticker).
 * Menggabungkan media sticker (WebP) dan audio (Opus) ke dalam satu stanza payload terenkripsi
 * tanpa mengirim voice note terpisah.
 *
 * @param {Object} conn - Socket koneksi Baileys
 * @param {String} jid - Remote JID tujuan pengiriman chat
 * @param {Object} params - Parameter media stiker & audio
 * @param {Buffer} params.sticker - Buffer WebP atau Buffer media asli (foto/video)
 * @param {Buffer} params.audio - Buffer audio (mp3/ogg/wav/m4a)
 * @param {Boolean} [params.isAnimated] - Apakah stiker beranimasi
 * @param {String} [params.emojis] - Emoji pendamping stiker (opsional)
 * @param {String} [params.packname] - Nama pack stiker jika konversi otomatis
 * @param {String} [params.author] - Nama author stiker jika konversi otomatis
 * @param {Object} [quoted] - Pesan yang di-quote
 * @returns {Promise<Object>} WhatsApp Message object yang telah terkirim
 */
export async function sendAudioSticker(conn, jid, {
  sticker,
  audio,
  isAnimated = true,
  emojis = '',
  packname = 'Avelia Sound',
  author = 'Avelia'
}, quoted = null) {
  if (!conn || !jid) throw new Error('Parameter conn dan jid wajib disertakan.')
  if (!sticker || !Buffer.isBuffer(sticker)) throw new Error('Sticker buffer valid wajib disertakan.')
  if (!audio || !Buffer.isBuffer(audio)) throw new Error('Audio buffer valid wajib disertakan.')

  // 1. Validasi & Siapkan Buffer WebP Sticker
  let stickerWebp = sticker
  const isWebP = sticker.length > 12 &&
    sticker.toString('ascii', 0, 4) === 'RIFF' &&
    sticker.toString('ascii', 8, 12) === 'WEBP'

  if (!isWebP) {
    try {
      stickerWebp = await createSticker(sticker, false, packname, author)
    } catch {
      stickerWebp = null
    }

    if (!stickerWebp) {
      try {
        stickerWebp = await (new Sticker(sticker, {
          type: 'full',
          pack: packname,
          author: author,
          quality: 70
        })).toBuffer()
      } catch (e) {
        throw new Error(`Gagal mengonversi media menjadi format stiker WebP: ${e.message}`)
      }
    }
  }

  // 2. Siapkan Audio Opus 48000Hz Mono & Waveform
  let pttData
  try {
    pttData = await toPTT(audio, 'mp3')
  } catch {
    pttData = await ffmpeg(audio, [
      '-vn',
      '-c:a', 'libopus',
      '-b:a', '128k',
      '-vbr', 'on',
      '-ac', '1',
      '-ar', '48000'
    ], 'ogg', 'ogg')
  }

  const opusBuffer = pttData?.data || audio
  const seconds = await getAudioDuration(opusBuffer)
  let waveform = null
  try {
    waveform = await extractWaveform(opusBuffer)
  } catch {
    waveform = null
  }

  // 3. Upload Media Sticker ke Server WhatsApp
  const isAnim = Boolean(isAnimated || (Buffer.isBuffer(stickerWebp) && stickerWebp.includes('ANIM')))
  const uploadedSticker = await prepareWAMessageMedia(
    { sticker: stickerWebp, isAnimated: isAnim },
    { upload: conn.waUploadToServer }
  )

  // 4. Upload Media Audio ke Server WhatsApp
  const uploadedAudio = await prepareWAMessageMedia(
    {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      seconds: seconds || 4,
      waveform: waveform ? new Uint8Array(waveform) : undefined
    },
    { upload: conn.waUploadToServer }
  )

  // Bersihkan file sementara hasil konversi audio jika ada
  if (pttData?.delete) {
    pttData.delete().catch(() => {})
  }

  // 5. Rakit Struktur Pesan Tunggal Native Stiker Bersuara
  const audioMsgPayload = {
    ...uploadedAudio.audioMessage,
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true,
    seconds: seconds || 4,
    waveform: waveform ? new Uint8Array(waveform) : undefined
  }

  const stickerMsgPayload = {
    ...uploadedSticker.stickerMessage,
    isAnimated: isAnim,
    emojis: emojis || '',
    audioMessage: audioMsgPayload
  }

  // Bungkus ke dalam root stickerMessage
  const baseMessageContent = {
    stickerMessage: stickerMsgPayload
  }

  // 6. Generate WAMessage dengan handling quoted & contextInfo
  const waMessage = generateWAMessageFromContent(jid, baseMessageContent, {
    userJid: conn.user?.id,
    quoted: quoted || undefined
  })

  // Pastikan audioMessage dipertahankan di dalam stickerMessage
  if (waMessage.message?.stickerMessage) {
    waMessage.message.stickerMessage.audioMessage = audioMsgPayload
    waMessage.message.stickerMessage.emojis = emojis || ''
  }

  // 7. Gandakan ke audioStickerMessage (field 134) untuk kompatibilitas penuh semua versi WhatsApp client
  waMessage.message.audioStickerMessage = {
    message: {
      stickerMessage: waMessage.message.stickerMessage
    }
  }

  // 8. Kirim via relayMessage sebagai satu pesan tunggal utuh
  await conn.relayMessage(jid, waMessage.message, {
    messageId: waMessage.key.id
  })

  return waMessage
}

export default {
  sendAudioSticker,
  ensureAudioStickerProto
}
