import { toSmallNum } from './style.js'

/**
 * Format durasi waktu pernikahan menjadi representasi teks yang rapi dan estetik
 * @param {number} ms 
 * @returns {string}
 */
export const formatDuration = (ms) => {
  let seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  let days = Math.floor(hours / 24)

  hours %= 24
  minutes %= 60

  let res = []
  if (days > 0) res.push(`${toSmallNum(days)} Hari`)
  if (hours > 0) res.push(`${toSmallNum(hours)} Jam`)
  if (minutes > 0 && days === 0) res.push(`${toSmallNum(minutes)} Menit`)
  if (res.length === 0) return 'Baru Saja'
  return res.join(' ')
}

/**
 * Mendapatkan gelar keintiman (intimacy rank) dan efek buff berdasarkan poin bucin
 * Format bebas dari emoji kartun, menggunakan simbol Shinto
 * @param {number} [bucin=0] 
 * @returns {{ title: string, buff: string }}
 */
export function getIntimacyRank(bucin = 0) {
  if (bucin >= 1000) return { title: 'Soulmate Abadi ✦', buff: '+15% EXP & Bonus Loot' }
  if (bucin >= 500) return { title: 'Pengantin Bahagia ✧', buff: '+10% EXP Kencan' }
  if (bucin >= 200) return { title: 'Tunangan Romantis ⟡', buff: '+5% EXP Kencan' }
  if (bucin >= 50) return { title: 'Pacaran Mesra ♡', buff: 'Hubungan Harmonis' }
  return { title: 'Awal Perjalanan ᰔ', buff: 'Masa Pendekatan' }
}

/**
 * Katalog Cincin Pernikahan
 */
export const CINCIN_SHOP = {
  perak: { name: 'Cincin Perak', price: 100, bonus: 1.1, icon: '◈' },
  emas: { name: 'Cincin Emas', price: 500, bonus: 1.3, icon: '❖' },
  diamond: { name: 'Cincin Berlian', price: 2000, bonus: 1.5, icon: '✦' }
}
