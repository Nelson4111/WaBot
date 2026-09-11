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
  if (bucin >= 1000) return { title: 'Soulmate Abadi ◆', buff: '+15% EXP & Bonus Loot' }
  if (bucin >= 750) return { title: 'Pasangan Sejati ◇', buff: '+13% EXP & Bonus Loot' }
  if (bucin >= 500) return { title: 'Pengantin Bahagia ⟡', buff: '+10% EXP Kencan' }
  if (bucin >= 350) return { title: 'Pasangan Romantis ⬥', buff: '+8% EXP Kencan' }
  if (bucin >= 200) return { title: 'Tunangan Romantis ◆', buff: '+5% EXP Kencan' }
  if (bucin >= 150) return { title: 'Kekasih Setia ◈', buff: '+4% EXP Kencan' }
  if (bucin >= 100) return { title: 'Pacaran Mesra ◇', buff: '+3% EXP Kencan' }
  if (bucin >= 75) return { title: 'Pasangan Dekat ⬙', buff: '+2% EXP Kencan' }
  if (bucin >= 50) return { title: 'Hubungan Harmonis ◆', buff: 'Hubungan Harmonis' }
  return { title: 'Awal Perjalanan ◇', buff: 'Masa Pendekatan' }
}

export function isPasanganHidden(user = {}) {
  return Boolean(user?.pasanganHidden)
}

export function getPasanganHiddenNotice(whoNum = '', isSelf = true) {
  const label = isSelf ? 'Pasangan' : `Pasangan @${whoNum}`
  const extra = isSelf ? '\n> Ketik *.pasangan unhide* untuk menampilkan kembali.' : ''
  return `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> ${label} : 🔒 DIKUNCI ${extra}\n*╰───────────────*`
}

export function normalizeRingName(ring = '') {
  if (!ring) return 'Silver Ring'

  const legacyMap = {
    'Cincin Perak': 'Silver Ring',
    'Cincin Emas': 'Gold Ring',
    'Cincin Berlian': 'Diamond Ring'
  }

  return legacyMap[ring] || ring
}

export function migrateLegacyRingData(users = {}) {
  if (!users || typeof users !== 'object') return users

  Object.values(users).forEach((user) => {
    if (!user || !Array.isArray(user.pasangan)) return

    user.pasangan = user.pasangan.map((partner) => {
      if (partner && partner.cincin) {
        const normalized = normalizeRingName(partner.cincin)
        if (normalized !== partner.cincin) {
          partner.cincin = normalized
        }
      }
      return partner
    })
  })

  return users
}

/**
 * Katalog Cincin Pernikahan
 */
export const CINCIN_SHOP = {
  silver: { name: 'Silver Ring', price: 100, bonus: 1.1, icon: '◈' },
  gold: { name: 'Gold Ring', price: 500, bonus: 1.3, icon: '❖' },
  topaz: { name: 'Topaz Ring', price: 5000, bonus: 1.6, icon: '◆' },
  amethyst: { name: 'Amethyst Ring', price: 15000, bonus: 1.9, icon: '✧' },
  ruby: { name: 'Ruby Ring', price: 30000, bonus: 2.2, icon: '⬥' },
  sapphire: { name: 'Sapphire Ring', price: 75000, bonus: 2.6, icon: '✦' },
  emerald: { name: 'Emerald Ring', price: 150000, bonus: 3.0, icon: '❈' },
  platinum: { name: 'Platinum Ring', price: 300000, bonus: 3.5, icon: '⬙' },
  diamond: { name: 'Diamond Ring', price: 750000, bonus: 4.2, icon: '◇' },
  jade: { name: 'Jade Ring', price: 2000000, bonus: 5.0, icon: '❋' }
}
