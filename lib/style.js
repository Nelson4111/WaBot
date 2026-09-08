import fs from 'fs'
import sharp from 'sharp'

let cachedThumb = { mtime: 0, buffer: null }

/**
 * Mengambil dan mengompres thumbnail menu agar ukurannya ringan (< 20 KB)
 * dan berformat JPEG valid untuk WhatsApp locationMessage/ButtonV2
 * @returns {Promise<Buffer|null>}
 */
export async function getMenuThumbnail() {
  const rawPath = fs.existsSync('./media/menu.jpg')
    ? './media/menu.jpg'
    : (fs.existsSync('./media/avelia.jpg')
      ? './media/avelia.jpg'
      : (fs.existsSync('./media/thumbnail.jpg') ? './media/thumbnail.jpg' : null))
  if (!rawPath) return null
  try {
    const mtime = fs.statSync(rawPath).mtimeMs
    if (cachedThumb.buffer && cachedThumb.mtime === mtime) {
      return cachedThumb.buffer
    }
    const buf = fs.readFileSync(rawPath)
    const compressed = await sharp(buf)
      .resize(250, 250, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer()
    cachedThumb = { mtime, buffer: compressed }
    return compressed
  } catch (e) {
    try {
      return fs.readFileSync(rawPath)
    } catch {
      return null
    }
  }
}

/**
 * Zen Shinto / Japanese Aesthetic Formatting Helper for Avelia
 * Author: Avelia Dev Team
 */

/**
 * Mendapatkan ucapan ala anime / Jepang yang bervariasi dan dinamis berdasarkan waktu & kaomoji
 * @param {string} [name='User'] - Nama pengguna
 * @param {number} [customHour] - Jam kustom untuk keperluan testing
 * @returns {string} Contoh: "_Konnichiwa, Nenel-san! (｡•̀ᴗ-)✧_"
 */
export function getGreeting(name = 'User', customHour = null) {
  const cleanName = (name || 'User').replace(/[*_~`]/g, '').replace(/[-_]?(san|kun|senpai|chan|sama)$/i, '').trim() || 'User'
  
  let hour
  if (customHour !== null && customHour !== undefined) {
    hour = customHour
  } else {
    try {
      const wibStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
      hour = new Date(wibStr).getHours()
    } catch {
      hour = new Date().getHours()
    }
  }

  const morningGreetings = [
    `_Ohayou gozaimasu, ${cleanName}-san! (◕‿◕✿)_`,
    `_Ohayou, ${cleanName}-senpai! Semangat untuk hari ini (｡•̀ᴗ-)✧_`,
    `_Pagi yang cerah, ${cleanName}-kun! ( ˘͈ ᵕ ˘͈ )_`,
    `_Ohayou! Jangan lupa sarapan ya, ${cleanName}-san! (๑˃̵ᴗ˂̵)و_`,
    `_Ohayou gozaimasu! Semoga harimu menyenangkan, ${cleanName}-senpai! (✿◠‿◠)_`
  ]

  const afternoonGreetings = [
    `_Konnichiwa, ${cleanName}-san! (｡•̀ᴗ-)✧_`,
    `_Konnichiwa, ${cleanName}-senpai! Tetap semangat ya (◕‿◕)_`,
    `_Selamat siang, ${cleanName}-san! Jangan lupa istirahat ya ( ˘▽˘)っ_`,
    `_Konnichiwa! Ada yang bisa kubantu hari ini, ${cleanName}-kun? (★ω★)_`,
    `_Konnichiwa, ${cleanName}-san! Jangan lupa makan siang ya (≧◡≦)_`
  ]

  const eveningGreetings = [
    `_Konnichiwa, ${cleanName}-san! Selamat sore ( ˘͈ ᵕ ˘͈ )_`,
    `_Otsukaresama deshita, ${cleanName}-senpai! (≧◡≦) ♡_`,
    `_Sore yang tenang, ${cleanName}-san~ Nikmati harimu ya (◕‿◕✿)_`,
    `_Otsukare, ${cleanName}-kun! Istirahat sejenak yuk (◡‿◡✿)_`,
    `_Otsukaresama! Kerja bagus hari ini, ${cleanName}-san! (｡•̀ᴗ-)✧_`
  ]

  const nightGreetings = [
    `_Konbanwa, ${cleanName}-san! (◡‿◡✿)_`,
    `_Konbanwa, ${cleanName}-senpai! Selamat beristirahat ( ˘͈ ᵕ ˘͈ )_`,
    `_Okaeri nasai, ${cleanName}-san! (｡•̀ᴗ-)✧_`,
    `_Malam yang indah, ${cleanName}-kun! (★ω★)_`,
    `_Konbanwa! Selamat malam dan mimpi indah, ${cleanName}-senpai~ ( ˘͈ ᵕ ˘͈ )_`,
    `_Oyasuminasai, ${cleanName}-san! Jangan lupa tidur cukup ya (◕‿◕✿)_`
  ]

  let pool
  if (hour >= 4 && hour < 11) {
    pool = morningGreetings
  } else if (hour >= 11 && hour < 15) {
    pool = afternoonGreetings
  } else if (hour >= 15 && hour < 18) {
    pool = eveningGreetings
  } else {
    pool = nightGreetings
  }

  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Konversi angka biasa menjadi karakter Unicode angka kecil
 * @param {string|number} str 
 * @returns {string}
 */
export const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

/**
 * Header Utama Bergaya Zen Shinto dengan WhatsApp Blockquote
 * @param {string} title 
 * @param {string} [greeting] 
 * @returns {string}
 */
export function shintoHeader(title, greeting = '') {
  const head = `*──  ୨୧ ✧ ${title.toUpperCase()} ✧ ୨୧  ──*`
  if (greeting) {
    return `${head}\n\n> ${greeting}`
  }
  return head
}

/**
 * Card / Bagian Informasi Berbasis Border Button 6 WhatsApp
 * @param {string} title 
 * @param {Record<string, string|number>} items 
 * @returns {string}
 */
export function shintoCard(title, items = {}) {
  const lines = Object.entries(items).map(([k, v]) => `*┆* ⟡ ${k} : *${v}*`)
  return `*╭  〔 ✦ ${title} 〕*\n${lines.join('\n')}\n*╰───────────────*`
}

/**
 * Section dengan isi kustom (misal daftar command / catatan)
 * @param {string} title 
 * @param {string} content 
 * @returns {string}
 */
export function shintoSection(title, content) {
  const formattedContent = String(content)
    .split('\n')
    .map(line => line.startsWith('*┆*') ? line : `*┆* ${line}`)
    .join('\n')
  return `*╭  〔 ✦ ${title} 〕*\n${formattedContent}\n*╰───────────────*`
}

/**
 * Garis Pemisah / Divider Shinto Celestial
 * @returns {string}
 */
export function shintoDivider() {
  return `· · ─ ─ ✦ ─ ─ · ·`
}

/**
 * Footer Shinto dengan WhatsApp Blockquote
 * @param {string} [note] 
 * @returns {string}
 */
export function shintoFooter(note = '') {
  const defaultNote = `_Ketik command di atas atau ketik *.help <cmd>* untuk info detail._`
  const targetNote = note || defaultNote
  return `${shintoDivider()}\n> ${targetNote}`
}

/**
 * Format Pesan Status / Notifikasi Minimalis (Sesuai STYLE_GUIDE.md)
 */
export const status = {
  wait: (msg = 'Sedang memproses permintaanmu...') => `*╭  〔 ⧗ ᴍ ᴏ ʜ ᴏ ɴ  ᴛ ᴜ ɴ ɢ ɢ ᴜ 〕*\n> ${msg}\n*╰───────────────*`,
  success: (msg = 'Operasi berhasil dilakukan!') => `*╭  〔 ✦ ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ 〕*\n> ${msg}\n*╰───────────────*`,
  error: (msg = 'Terjadi kesalahan sistem.') => `*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> ${msg}\n*╰───────────────*`,
  warning: (msg = 'Periksa kembali format input kamu.') => `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> ${msg}\n*╰───────────────*`
}

export default {
  getGreeting,
  toSmallNum,
  getMenuThumbnail,
  shintoHeader,
  shintoCard,
  shintoSection,
  shintoDivider,
  shintoFooter,
  status
}
