import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'

export const VOICE_NOTE_DIR = path.resolve(
  './media/voice-notes',
)

export const MIME_TYPES = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg; codecs=opus',
  '.opus': 'audio/ogg; codecs=opus',
  '.wav': 'audio/wav',
}

// In-memory cache for { opusBuffer, waveform } per file path
const vnCache = new Map()

export function clearVnCache() {
  vnCache.clear()
}

/**
 * Convert any audio file or buffer to standard WhatsApp OGG Opus format (Mono, 48kHz, seekable Ogg container)
 */
export async function convertToOpus(input) {
  const tmpDir = path.resolve('./tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const isBuffer = Buffer.isBuffer(input)
  const tmpIn = isBuffer ? path.join(tmpDir, `vnin_${Date.now()}_${Math.random().toString(36).slice(2)}.tmp`) : input
  const tmpOut = path.join(tmpDir, `vnout_${Date.now()}_${Math.random().toString(36).slice(2)}.ogg`)

  if (isBuffer) {
    fs.writeFileSync(tmpIn, input)
  }

  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y',
      '-i', tmpIn,
      '-vn',
      '-c:a', 'libopus',
      '-b:a', '64k',
      '-vbr', 'on',
      '-compression_level', '10',
      '-ar', '48000',
      '-ac', '1',
      '-map_metadata', '-1',
      '-avoid_negative_ts', 'make_zero',
      '-f', 'ogg',
      tmpOut
    ])

    ff.on('error', (err) => {
      if (isBuffer && fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn)
      if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut)
      reject(err)
    })

    ff.on('close', (code) => {
      try {
        if (isBuffer && fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn)
        if (code === 0 && fs.existsSync(tmpOut)) {
          const buffer = fs.readFileSync(tmpOut)
          fs.unlinkSync(tmpOut)
          resolve(buffer)
        } else {
          if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut)
          reject(new Error(`ffmpeg convert to opus failed with code ${code}`))
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

/**
 * Natural speech envelope fallback waveform generator
 */
export function generateNaturalWaveform(bars = 64) {
  const wf = new Uint8Array(bars)
  for (let i = 0; i < bars; i++) {
    const env = Math.sin((i / bars) * Math.PI)
    wf[i] = Math.min(100, Math.max(10, Math.floor((20 + Math.random() * 70) * env)))
  }
  return wf
}

/**
 * Extract 64-bar dynamic waveform (0-100) from audio buffer using FFmpeg PCM analysis
 */
export async function extractWaveform(audioBuffer, bars = 64) {
  return new Promise((resolve) => {
    const ff = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-ac', '1',
      '-ar', '16000',
      '-f', 's16le',
      'pipe:1'
    ])
    const chunks = []
    ff.stdout.on('data', c => chunks.push(c))
    ff.stderr.on('data', () => {})
    ff.on('error', () => resolve(generateNaturalWaveform(bars)))
    ff.on('close', code => {
      if (code !== 0 || chunks.length === 0) return resolve(generateNaturalWaveform(bars))
      const raw = Buffer.concat(chunks)
      const samples = raw.length / 2
      if (samples === 0) return resolve(generateNaturalWaveform(bars))

      const step = Math.max(1, Math.floor(samples / bars))
      const amps = []
      for (let i = 0; i < bars; i++) {
        let sum = 0
        let count = 0
        const start = i * step
        const end = Math.min(samples, (i + 1) * step)
        for (let j = start; j < end; j++) {
          sum += Math.abs(raw.readInt16LE(j * 2))
          count++
        }
        amps.push(count > 0 ? sum / count : 0)
      }
      const max = Math.max(...amps) || 1
      const wf = new Uint8Array(bars)
      for (let i = 0; i < bars; i++) {
        const norm = Math.round((amps[i] / max) * 90) + 10
        wf[i] = Math.min(100, Math.max(10, norm))
      }

      // Pastikan bukan garis lurus (jika semua bernilai sama)
      const isFlat = wf.every(v => v === wf[0])
      if (isFlat) return resolve(generateNaturalWaveform(bars))

      resolve(wf)
    })
    ff.stdin.write(audioBuffer)
    ff.stdin.end()
  })
}

/**
 * Prepares Voice Note: converts to compliant Mono 48kHz Opus, computes waveform & duration, caches result
 */
export async function prepareVoiceNote(filePath) {
  if (vnCache.has(filePath)) return vnCache.get(filePath)

  let opusBuffer
  try {
    opusBuffer = await convertToOpus(filePath)
  } catch (e) {
    console.warn('[voice-note] Failed to convert to opus, using raw file buffer:', e.message)
    opusBuffer = fs.readFileSync(filePath)
  }

  let duration = 1
  try {
    const mm = await import('music-metadata')
    const meta = await mm.parseBuffer(opusBuffer, undefined, { duration: true })
    if (meta?.format?.duration && meta.format.duration > 0) {
      duration = Math.max(1, Math.round(meta.format.duration))
    }
  } catch (_) {}

  let waveform
  try {
    waveform = await extractWaveform(opusBuffer)
  } catch (e) {
    waveform = generateNaturalWaveform(64)
  }

  const result = { opusBuffer, waveform, seconds: duration }
  vnCache.set(filePath, result)
  return result
}

export const VOICE_NOTE_GROUPS = [
  { files: ['onichan.mp3'], commands: ['onichan'] },
  { files: ['araara.m4a', 'araa.mp3', 'vn.mp3', 'moshi.opus', 'Uwu.mp3', 'Uwuii.mp3', 'Uwuuu.mp3'], commands: ['ara', 'ara ara', 'araa', 'araaa', 'moshi', 'araaaa', 'kimochi', 'yamete', 'uwu', 'uwuii', 'uwuuu', 'uwuu'] },
  { files: ['kiyomasa.opus'], commands: ['oyy', 'oy', 'kiyomasa', 'nande', 'baka', 'oi', 'oii'] },
  { files: ['night.opus'], commands: ['night', 'goodnight', 'good night', 'malam', 'malem', 'mlm'] },
  { files: ['k1.mp3'], commands: ['konser1'] },
  { files: ['k2.mp3'], commands: ['konser2'] },
  { files: ['definisihalal.m4a'], commands: ['halal'] },
  { files: ['yntkts.m4a'], commands: ['yntkts'] },
  { files: ['sound13.mp3'], commands: ['maaf', 'maap', 'sorry'] },
  { files: ['woahh.mp3'], commands: ['woah'] },
  { files: ['wibu.m4a'], commands: ['anime','wibupride'] },
  { files: ['sholawat.m4a'], commands: ['sholawat'] },
  { files: ['tobat.opus'], commands: ['astagfirullah', 'tobat'] },
  { files: ['jelek.mp3'], commands: ['jelek'] },
  { files: ['saveOwnerku.mp3'], commands: ['save', 'sv', 'sve', 'svb'] },
  { files: ['pembohong.mp3'], commands: ['pembohong', 'boong', 'bohong', 'ngapusi'] },
  { files: ['penampilan.mp3'], commands: ['penampilan', 'outfit'] },
  { files: ['sad1.mp3', 'segala.mp3', 'hanyasatu.mp3'], commands: ['sad'] },
  { files: ['Turu.mp3'], commands: ['turu', 'sleep', 'tidur'] },
  {
    files: ['apasih.mp3'],
    category: 'toxic',
    commands: [
      'kontol', 'koncol', 'woi ajg', 'memek', 'asu', 'ajim', 'jancok', 'cok',
      'goblog', 'goblok', 'tolol', 'gblg', 'kontl', 'gblog', 'gblok', 'kntl',
      'mmk', 'ajg', 'anj', 'anjj', 'titit', 'tytyd', 'titid', 'puki', 'babi',
      'anjg', 'tai', 'taek', 'bangsat', 'bangst', 'wtf', 'shit', 'fuck', 'bgst',
      'ajing', 'bacot', 'bot ajg', 'bot babi',
    ],
  },
  {
    files: ['adaapa.m4a'],
    commands: ['tes', 'test', 'woi', 'p', 'pp', 'woy', 'weh', 'min', 'admin', 'eh', 'pe', 'ada apa'],
  },
  { files: ['SayaRobot.opus'], commands: ['bot', 'bott', 'robot'] },
  { files: ['gaboleh.m4a'], commands: ['sc', 'script', 'code','ga boleh', 'gaboleh'] },
  { files: ['gmao.m4a'], commands: ['gmao'] },
  { files: [').m4a'], commands: ['shalawat','ngaji'] },
  { files: ['baka.m4a'], commands: ['baka'] },
  { files: ['Buat apa.mp3'], commands: ['buat','buatapa','buat apa'] },
  { files: ['dakwah1.m4a'], commands: ['dakwah'] },
  { files: ['Gaboleh gitu.mp3'], commands: ['gaboleh gitu','gaboleh'] },
  { files: ['gamau.mp3'], commands: ['gamau'] },
  { files: ['Gay.mp3'], commands: ['gay'] },
  { files: ['Hihi.mp3'], commands: ['hihi'] },
  { files: ['hirobot.m4a'], commands: ['hi robot'] },
  { files: ['I like you.mp3'], commands: ['ilikeyou','i like you','i like u','like'] },
  { files: ['Imut.mp3'], category: 'toxic', commands: ['sok imut'] },
  { files: ['ingat.m4a'], commands: ['orang baik','salah'] },
  { files: ['janganToxic.mp3'], commands: ['jangan toxic'] },
  { files: ['Karna lo wibu.mp3'], commands: ['karnalowibu','karena lo wibu','pertanyaan','wibu'] },
  { files: ['KarnaKamu.mp3'], commands: ['karnakamu','karena kamu','karena','karna'] },
  { files: ['Loli Toxic.mp3'], category: 'toxic', commands: ['loli','loli toxic'] },
  { files: ['mimpi.mp3'], commands: ['mimpi','menyeramkan'] },
  { files: ['Ngelag.mp3'], commands: ['ngelag','lag','lemot'] },
  { files: ['Ownerku.mp3'], commands: ['ownerku'] },
  { files: ['Pap.mp3'], commands: ['pap'] },
  { files: ['sad4.mp3'], commands: ['anak desa'] },
  { files: ['Sayang.mp3'], commands: ['say','syg','syng','sayng'] },
  { files: ['sound1.mp3'], commands: ['sound1'] },
  { files: ['sound12.mp3'], commands: ['sound12'] },
  { files: ['sound14.mp3'], commands: ['sound14'] },
  { files: ['sound15.mp3'], commands: ['gugur','sound15','nenek'] },
  { files: ['sound17.mp3'], commands: ['sound17'] },
  { files: ['sound25.mp3'], commands: ['sound25'] },
  { files: ['sound33.mp3'], commands: ['sound33'] },
  { files: ['sound4.mp3'], commands: ['sound4'] },
  { files: ['sound55.mp3'], commands: ['sound55'] },
  { files: ['sound58.mp3'], commands: ['sound58'] },
  { files: ['sound9.mp3'], commands: ['sound9'] },
  { files: ['tarhim.m4a'], commands: ['tarhim'] },
  { files: ['tersangka.m4a'], commands: ['tersangka'] },
  { files: ['avelia.mpeg'], commands: ['avelia', 'fungsi bot', 'ada bot', 'manfaat bot', 'janneta', 'jannet', 'promosi', 'promote'] },
  { files: ['gantung-pangeran.mp3'], commands: ['gantung pangeran', 'pangeran', 'gantung'] },
  { files: ['jokowi-dulu-saya-diam.mp3'], commands: ['dulu saya diam', 'diam', 'jokowi'] },
  { files: ['kerja-kerja-kerja.mp3'], commands: ['kerja kerja kerja', 'kerjaa'] },
  { files: ['makasih-cantik.mp3'], commands: ['makasih cantik', 'makasih', 'thx', 'thankyou', 'tq', 'ty', 'terimakasih', 'terima kasih', 'suwun'] },
  { files: ['obh-combi-sachet_LhmnAmM.mp3'], commands: ['obh combi sachet', 'obh', 'batuk', 'uhuk', 'ehem'] },
  { files: ['tamatlah-sudah.mp3'], commands: ['tamatlah sudah', 'tamat', 'dahlah'] },
  { files: ['ya-allah-cantik-banget.mp3'], commands: ['ya allah cantik banget', 'ya allah', 'cantik'] },
  { files: ['aww-sakit.mp3'], commands: ['aww sakit', 'sakit'] },
  { files: ['seneng-banget-liatnya-windah.mp3'], commands: ['seneng banget liatnya', 'seneng'] },
  { files: ['windah-absolute-cinema.mp3'], commands: ['absolute cinema', 'absolute'] },
  { files: ['reze-dance.mp3'], commands: ['reze dance', 'reze'] },
  { files: ['vestia-zeta-ihh-aku-ga-sabal.mp3'], commands: ['vestia zeta ihh aku ga sabal', 'sabar', 'sabal'] },
  { files: ['vestia-zeta-meowrghh.mp3'], commands: ['vestia zeta meowrghh', 'meowrghh', 'meow', 'miaw', 'meong'] },
  { files: ['vestia-zeta-muach.mp3'], commands: ['vestia zeta muach', 'muach', 'mwah'] },
  { files: ['vestia-zeta-so-bakso.mp3'], commands: ['vestia zeta so bakso', 'so bakso', 'bakso'] },
  { files: ['zeta-halo-guys.mp3'], commands: ['zeta halo guys', 'halo guys', 'halo', 'hi', 'hello', 'alo'] },
  { files: ['zeta-ndak-mau.mp3'], commands: ['zeta ndak mau', 'ndak mau'] },
  { files: ['zeta-onii-chan.mp3'], commands: ['zeta onii chan', 'chan', 'onichan', 'oni chan', 'onii chan'] },
  { files: ['zeta-oyasumi.mp3'], commands: ['zeta oyasumi', 'oyasumi'] },
  { files: ['aku-sudah-muak-zeta.mp3'], commands: ['aku sudah muak zeta', 'muak'] },
  { files: ['anying-kobo-kanaeru.mp3'], commands: ['anying kobo kanaeru', 'anying'] },
  { files: ['dadah-zeta.mp3'], commands: ['dadah zeta', 'dadah'] },
  { files: ['ehek-kobo-kanaeru.mp3'], commands: ['ehek kobo kanaeru', 'ehek'] },
  { files: ['guru-hentikan.mp3'], commands: ['guru hentikan', 'guru', 'hentikan', 'berhenti'] },
  { files: ['heavenly-music-gaming-sound-effect-hd-mp3cut.mp3'], commands: ['surga', 'hidayah'] },
  { files: ['kazura-gok.mp3'], commands: ['kazura gok', 'gok'] },
  { files: ['kobo-absen-bang.mp3'], commands: ['kobo absen bang', 'absen'] },
  { files: ['kobo-ga-bole-toxic.mp3'], commands: ['kobo ga bole toxic', 'toxic'] },
  { files: ['kobo-jawa.mp3'], commands: ['kobo jawa', 'jawa'] },
  { files: ['kobo-kanaeru-marah.mp3'], commands: ['kobo kanaeru marah', 'marah'] },
  { files: ['kobo-my-what.mp3'], commands: ['kobo my what', 'my what', 'my'] },
  { files: ['vestia-zeta-ahh-gapapa.mp3'], commands: ['vestia zeta ahh gapapa', 'gapapa'] },
  { files: ['vestia-zeta-ah-jangan-dong.mp3'], commands: ['vestia zeta ah jangan dong', 'jangan dong'] },
  { files: ['vestia-zeta-aku-juga-mau.mp3'], commands: ['vestia zeta aku juga mau', 'aku juga mau'] },
  { files: ['vestia-zeta-anjing.mp3'], commands: ['vestia zeta anjing', 'anjing'] },
  { files: ['vestia-zeta-apasih-kenapa-sih-kamu.mp3'], commands: ['vestia zeta apasih kenapa sih kamu', 'apasih', 'kenapa sih kamu'] },
  { files: ['vestia-zeta-halo-sayang.mp3'], commands: ['vestia zeta halo sayang', 'halo sayang'] },
]