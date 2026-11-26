import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { spawn, exec } from 'child_process'
import { toSmallNum } from './style.js'

/**
 * Parsing string waktu (misal "00:05", "1:15", "5") menjadi detik desimal
 * @param {string|number} str
 * @returns {number|null}
 */
export function parseTime(str) {
  if (typeof str === 'number') return str
  if (!str) return null
  const clean = String(str).trim()
  if (/^\d+(\.\d+)?$/.test(clean)) return parseFloat(clean)
  const parts = clean.split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return null
}

/**
 * Ekstraksi rentang waktu dari teks argumen
 * Format didukung:
 * - "5 12" -> { start: 5, end: 12, duration: 7 }
 * - "5-12" -> { start: 5, end: 12, duration: 7 }
 * - "00:05 00:12" -> { start: 5, end: 12, duration: 7 }
 * - "5" -> { start: 5, end: 5 + maxDuration, duration: maxDuration }
 * @param {string} text
 * @param {number} [maxDuration=60]
 * @returns {{ start: number, end: number, duration: number, cleanText: string } | null}
 */
export function extractTimeRange(text, maxDuration = 60) {
  if (!text) return null
  const rawParts = text.split('|')
  const raw = rawParts[0].trim()
  const cleanText = rawParts.slice(1).join('|').trim()

  // Format "00:05-00:12", "5-12", "00:05 - 00:12"
  const dashMatch = raw.match(/^(\d{1,2}(?::\d{1,2}){0,2})\s*[-~–]\s*(\d{1,2}(?::\d{1,2}){0,2})$/)
  if (dashMatch) {
    const start = parseTime(dashMatch[1])
    const end = parseTime(dashMatch[2])
    if (start !== null && end !== null && end > start) {
      const dur = Math.min(end - start, maxDuration)
      return { start, end: start + dur, duration: dur, cleanText }
    }
  }

  // Format "00:05 00:12" atau "5 12"
  const spaceMatch = raw.match(/^(\d{1,2}(?::\d{1,2}){0,2})\s+(\d{1,2}(?::\d{1,2}){0,2})$/)
  if (spaceMatch) {
    const start = parseTime(spaceMatch[1])
    const end = parseTime(spaceMatch[2])
    if (start !== null && end !== null && end > start) {
      const dur = Math.min(end - start, maxDuration)
      return { start, end: start + dur, duration: dur, cleanText }
    }
  }

  // Format "5" (hanya detik mulai)
  const singleMatch = raw.match(/^(\d{1,2}(?::\d{1,2}){0,2})$/)
  if (singleMatch) {
    const start = parseTime(singleMatch[1])
    if (start !== null) {
      const singleDur = Math.min(maxDuration, 10)
      return { start, end: start + singleDur, duration: singleDur, cleanText }
    }
  }

  return null
}

/**
 * Mendapatkan durasi video menggunakan ffprobe jika metadata WhatsApp kosong
 * @param {Buffer} buffer
 * @returns {Promise<number>}
 */
export async function getVideoDuration(buffer) {
  if (!buffer) return 0
  const tmpFile = join(tmpdir(), `dur_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`)
  try {
    await fs.writeFile(tmpFile, buffer)
    return await new Promise((resolve) => {
      exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tmpFile}"`, (err, stdout) => {
        fs.unlink(tmpFile).catch(() => {})
        if (err || !stdout) return resolve(0)
        const dur = parseFloat(stdout.trim())
        resolve(isNaN(dur) ? 0 : Math.round(dur))
      })
    })
  } catch {
    fs.unlink(tmpFile).catch(() => {})
    return 0
  }
}

/**
 * Memotong video secara cepat & akurat menggunakan FFmpeg
 * @param {Buffer} buffer
 * @param {number} startSec
 * @param {number} durationSec
 * @returns {Promise<Buffer>}
 */
export async function trimVideoBuffer(buffer, startSec = 0, durationSec = 10) {
  const tmpIn = join(tmpdir(), `trim_in_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`)
  const tmpOut = join(tmpdir(), `trim_out_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`)
  await fs.writeFile(tmpIn, buffer)

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-y',
      '-ss', String(startSec),
      '-i', tmpIn,
      '-t', String(durationSec),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-movflags', '+faststart',
      tmpOut
    ])

    proc.on('close', async (code) => {
      try {
        await fs.unlink(tmpIn).catch(() => {})
        if (code === 0 && await fs.access(tmpOut).then(() => true).catch(() => false)) {
          const trimmed = await fs.readFile(tmpOut)
          await fs.unlink(tmpOut).catch(() => {})
          resolve(trimmed)
        } else {
          await fs.unlink(tmpOut).catch(() => {})
          reject(new Error(`FFmpeg trim exited with code ${code}`))
        }
      } catch (err) {
        reject(err)
      }
    })

    proc.on('error', async (err) => {
      await fs.unlink(tmpIn).catch(() => {})
      await fs.unlink(tmpOut).catch(() => {})
      reject(err)
    })
  })
}

/**
 * Render visual template konfirmasi pemotongan durasi video sesuai STYLE_GUIDE.md
 * @param {number} duration
 * @param {number} maxDuration
 * @param {string} commandName
 * @param {boolean} [isSound=false]
 * @returns {string}
 */
export function formatTrimPrompt(duration, maxDuration = 6, commandName = 'stiker', isSound = false) {
  const durStr = toSmallNum(duration || '?')
  const maxDurStr = toSmallNum(maxDuration)

  const lines = [
    `*──  ୨୧ ✧ POTONG DURASI VIDEO ✧ ୨୧  ──*`,
    ``,
    `> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)`,
    `> ⏳ Video kamu berdurasi *${durStr} Detik* (Maksimal stiker: *${maxDurStr} Detik*).`,
    `> ✂️ Kamu tidak perlu repot memotong video di galeri HP!`
  ]

  if (isSound) {
    lines.push(`> 🎵 _Catatan: Pemotongan detik ini hanya untuk visual stiker. Musik/audio akan tetap berputar penuh sesuai audio aslinya tanpa terpotong!_`)
  }

  lines.push(
    ``,
    `*╭  〔 ✂️ ᴛ ᴇ ɴ ᴛ ᴜ ᴋ ᴀ ɴ  ᴅ ᴜ ʀ ᴀ ꜱ ɪ 〕*`,
    `*┆* ⏱ ᴅᴜʀᴀꜱɪ ᴠɪᴅᴇᴏ : *${durStr} Detik*`,
    `*┆* ✦ ᴍᴀᴋꜱ ᴘᴏᴛᴏɴɢ  : *${maxDurStr} Detik* 𝜚`,
    `*┆* ✎ ᴄᴏɴᴛᴏʜ ꜰᴏʀᴍᴀᴛ: *0 7* atau *00:05 00:12*`,
    `*╰───────────────*`,
    ``,
    `> Silakan balas pesan ini dengan detik yang ingin kamu potong!`,
    `> _Contoh: balas *5 12* (detik 5 sampai 12) atau *0 8*._`,
    `> _Ketik *batal* untuk membatalkan antrean._`
  )

  return lines.join('\n')
}
