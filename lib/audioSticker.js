import crypto from 'crypto'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import pb from 'protobufjs/minimal.js'
import { toPTT } from './converter.js'
import { extractWaveform, convertToOpus } from './voice-noteData.js'
import { sticker as createSticker } from './sticker.js'
import { Sticker } from 'wa-sticker-formatter'

if (!global.audioStickerCache) {
  global.audioStickerCache = new Map()
}

export function rememberAudioSticker(keys = [], data = {}) {
  if (!global.audioStickerCache) global.audioStickerCache = new Map()
  for (const k of keys) {
    if (!k || typeof k !== 'string') continue
    global.audioStickerCache.set(k, {
      ...data,
      savedAt: Date.now()
    })
  }
  if (global.audioStickerCache.size > 300) {
    const oldestKey = global.audioStickerCache.keys().next().value
    if (oldestKey) global.audioStickerCache.delete(oldestKey)
  }
}

/**
 * Memastikan proto Baileys & Elaina memiliki runtime support lengkap (encode, decode, fromObject, toObject)
 * untuk field audioMessage (field 26 / tag 210) di StickerMessage dan audioStickerMessage (field 134 / tag 1074) di Message.
 */
export function ensureAudioStickerProto(p = proto) {
  if (p?.Message?.StickerMessage && !p.Message.StickerMessage.__audioStickerFullPatched) {
    const SM = p.Message.StickerMessage
    SM.prototype.audioMessage = null
    SM.prototype.emojis = null

    if (!SM.__audioStickerEncodePatched) {
      const origStickerEncode = SM.encode
      SM.encode = function encode(message, writer) {
        writer = origStickerEncode.call(this, message, writer)
        if (message.audioMessage != null && Object.hasOwnProperty.call(message, 'audioMessage')) {
          p.Message.AudioMessage.encode(message.audioMessage, writer.uint32(210).fork()).ldelim()
        }
        return writer
      }
      SM.__audioStickerEncodePatched = true
    }

    const origStickerDecode = SM.decode
    SM.decode = function decode(r, l, e, n) {
      if (!(r instanceof pb.Reader)) {
        r = pb.Reader.create(r)
      }
      const startPos = r.pos
      const endPos = l === undefined ? r.len : Math.min(r.len, r.pos + l)
      const subBytes = r.buf ? r.buf.subarray(startPos, endPos) : null

      const m = origStickerDecode.call(this, r, l, e, n)

      if (!m.audioMessage && subBytes && subBytes.length > 0) {
        try {
          const subR = pb.Reader.create(subBytes)
          while (subR.pos < subR.len) {
            const tag = subR.uint32()
            const fieldNo = tag >>> 3
            const wireType = tag & 7
            if (fieldNo === 26 && wireType === 2) {
              m.audioMessage = p.Message.AudioMessage.decode(subR, subR.uint32())
            } else if (fieldNo === 25 && wireType === 2 && !m.emojis) {
              m.emojis = subR.string()
            } else {
              subR.skipType(wireType)
            }
          }
        } catch {}
      }
      return m
    }

    const origStickerFromObject = SM.fromObject
    SM.fromObject = function fromObject(d, n) {
      const m = origStickerFromObject.call(this, d, n)
      if (d && d.audioMessage != null && typeof d.audioMessage === 'object') {
        m.audioMessage = p.Message.AudioMessage.fromObject(d.audioMessage)
      }
      if (d && d.emojis != null) {
        m.emojis = String(d.emojis)
      }
      return m
    }

    const origStickerToObject = SM.toObject
    SM.toObject = function toObject(m, o) {
      const d = origStickerToObject.call(this, m, o)
      if (m && m.audioMessage != null && (Object.hasOwnProperty.call(m, 'audioMessage') || m.audioMessage)) {
        d.audioMessage = p.Message.AudioMessage.toObject(m.audioMessage, o)
        if (o && o.oneofs) d._audioMessage = 'audioMessage'
      }
      if (m && m.emojis != null && (Object.hasOwnProperty.call(m, 'emojis') || m.emojis)) {
        d.emojis = m.emojis
        if (o && o.oneofs) d._emojis = 'emojis'
      }
      return d
    }

    SM.__audioStickerFullPatched = true
  }

  if (p?.Message && !p.Message.__audioStickerMsgFullPatched) {
    const M = p.Message
    M.prototype.audioStickerMessage = null

    if (!M.__audioStickerMsgEncodePatched) {
      const origMsgEncode = M.encode
      M.encode = function encode(message, writer) {
        writer = origMsgEncode.call(this, message, writer)
        if (message.audioStickerMessage != null && Object.hasOwnProperty.call(message, 'audioStickerMessage')) {
          p.Message.FutureProofMessage.encode(message.audioStickerMessage, writer.uint32(1074).fork()).ldelim()
        }
        return writer
      }
      M.__audioStickerMsgEncodePatched = true
    }

    const origMsgDecode = M.decode
    M.decode = function decode(r, l, e, n) {
      if (!(r instanceof pb.Reader)) {
        r = pb.Reader.create(r)
      }
      const startPos = r.pos
      const endPos = l === undefined ? r.len : Math.min(r.len, r.pos + l)
      const subBytes = r.buf ? r.buf.subarray(startPos, endPos) : null

      const m = origMsgDecode.call(this, r, l, e, n)

      if (!m.audioStickerMessage && subBytes && subBytes.length > 0) {
        try {
          const subR = pb.Reader.create(subBytes)
          while (subR.pos < subR.len) {
            const tag = subR.uint32()
            const fieldNo = tag >>> 3
            const wireType = tag & 7
            if (fieldNo === 134 && wireType === 2) {
              m.audioStickerMessage = p.Message.FutureProofMessage.decode(subR, subR.uint32())
            } else {
              subR.skipType(wireType)
            }
          }
        } catch {}
      }
      return m
    }

    const origMsgFromObject = M.fromObject
    M.fromObject = function fromObject(d, n) {
      const m = origMsgFromObject.call(this, d, n)
      if (d && d.audioStickerMessage != null && typeof d.audioStickerMessage === 'object') {
        m.audioStickerMessage = p.Message.FutureProofMessage.fromObject(d.audioStickerMessage)
      }
      return m
    }

    const origMsgToObject = M.toObject
    M.toObject = function toObject(m, o) {
      const d = origMsgToObject.call(this, m, o)
      if (m && m.audioStickerMessage != null && (Object.hasOwnProperty.call(m, 'audioStickerMessage') || m.audioStickerMessage)) {
        d.audioStickerMessage = p.Message.FutureProofMessage.toObject(m.audioStickerMessage, o)
        if (o && o.oneofs) d._audioStickerMessage = 'audioStickerMessage'
      }
      return d
    }

    M.__audioStickerMsgFullPatched = true
  }
}

// Inisialisasi pengecekan proto saat modul dimuat
ensureAudioStickerProto(proto)

/**
 * Menghitung durasi audio dalam detik secara presisi menggunakan music-metadata
 * @param {Buffer} buffer
 * @returns {Promise<number>}
 */
export async function getAudioDuration(buffer) {
  try {
    const mm = await import('music-metadata')
    const meta = await mm.parseBuffer(buffer, undefined, { duration: true })
    if (meta?.format?.duration && meta.format.duration > 0 && !isNaN(meta.format.duration)) {
      return Math.max(1, Math.round(meta.format.duration))
    }
  } catch (_) {}
  return 5
}

/**
 * Mengonversi buffer audio mentah menjadi OGG Opus Mono 48000Hz + durasi + waveform
 * @param {Buffer} audio
 */
export async function prepareOpusAudioPayload(audio) {
  const isAlreadyOggOpus = Buffer.isBuffer(audio) &&
    audio.length > 36 &&
    audio.toString('ascii', 0, 4) === 'OggS' &&
    audio.subarray(0, 64).includes('OpusHead')

  let opusBuffer = audio
  if (!isAlreadyOggOpus) {
    try {
      opusBuffer = await convertToOpus(audio)
    } catch (errConv) {
      console.warn('[AudioSticker] convertToOpus failed, fallback to toPTT:', errConv?.message)
      try {
        const pttData = await toPTT(audio, 'mp3')
        opusBuffer = pttData?.data || audio
        if (pttData?.delete) pttData.delete().catch(() => {})
      } catch {
        opusBuffer = audio
      }
    }
  }

  const [seconds, waveform] = await Promise.all([
    getAudioDuration(opusBuffer),
    extractWaveform(opusBuffer).catch(() => null)
  ])

  return {
    opusBuffer,
    seconds: seconds || 4,
    waveform: waveform ? new Uint8Array(waveform) : undefined
  }
}

/**
 * Mengirim Stiker Bersuara Asli (Native WhatsApp Sound Sticker).
 * Menggabungkan media sticker (WebP) dan audio (Opus) ke dalam satu stanza payload terenkripsi
 * tanpa mengirim voice note terpisah.
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

  // 2. Siapkan Audio WhatsApp Compliant (OGG Opus Mono 48000Hz) & Waveform
  const { opusBuffer, seconds, waveform } = await prepareOpusAudioPayload(audio)

  // 3. Upload Media Sticker & Audio ke Server WhatsApp secara PARALEL
  const isAnim = Boolean(isAnimated || (Buffer.isBuffer(stickerWebp) && stickerWebp.includes('ANIM')))
  const [uploadedSticker, uploadedAudio] = await Promise.all([
    prepareWAMessageMedia(
      { sticker: stickerWebp, isAnimated: isAnim },
      { upload: conn.waUploadToServer }
    ),
    prepareWAMessageMedia(
      {
        audio: opusBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        seconds,
        waveform
      },
      { upload: conn.waUploadToServer }
    )
  ])

  // 5. Rakit Struktur Pesan Tunggal Native Stiker Bersuara
  const audioMsgPayload = {
    ...uploadedAudio.audioMessage,
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true,
    seconds,
    waveform
  }

  const stickerMsgPayload = {
    ...uploadedSticker.stickerMessage,
    isAnimated: isAnim,
    emojis: emojis || '',
    audioMessage: audioMsgPayload
  }

  const baseMessageContent = {
    stickerMessage: stickerMsgPayload
  }

  // 6. Generate WAMessage dengan handling quoted & contextInfo
  const waMessage = generateWAMessageFromContent(jid, baseMessageContent, {
    userJid: conn.user?.id,
    quoted: quoted || undefined
  })

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

  // Simpan ke global.audioStickerCache & global.db.data.msgs agar jika stiker ini di-reply (.setsreact / .sreact),
  // suaranya tidak pernah hilang!
  const webpHash = crypto.createHash('sha256').update(stickerWebp).digest('base64')
  const fileShaB64 = uploadedSticker.stickerMessage?.fileSha256
    ? Buffer.from(uploadedSticker.stickerMessage.fileSha256).toString('base64')
    : ''
  rememberAudioSticker([waMessage.key?.id, webpHash, fileShaB64], {
    opusBuffer,
    audioMessage: audioMsgPayload,
    emojis: emojis || '',
    seconds,
    waveform
  })

  if (waMessage.key?.id && global.db?.data?.msgs) {
    global.db.data.msgs[waMessage.key.id] = {
      message: waMessage.message,
      time: Date.now()
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
  ensureAudioStickerProto,
  prepareOpusAudioPayload,
  rememberAudioSticker
}
