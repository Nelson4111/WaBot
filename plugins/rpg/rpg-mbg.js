import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  getMbgMenu,
  hargaBeli,
  makananIndonesia,
  masakanResep,
  minumanIndonesia,
  resepEmoji,
  formatMasakanNama
} from '../../lib/rpg-masakanData.js'
import { isPremiumUser } from './rpg-bank.js'

const formatItem = item => `${resepEmoji[item] || hargaBeli[item].emoji} ${formatMasakanNama(item)}`
const isValidMenu = menu =>
  Boolean(menu && makananIndonesia.includes(menu.food) && minumanIndonesia.includes(menu.drink) &&
    masakanResep[menu.food] && masakanResep[menu.drink] && hargaBeli[menu.food] && hargaBeli[menu.drink])
const menuKey = menu => `${menu.food}:${menu.drink}`
const menuDescription = menu =>
  `🍱 *Makanan :* ${formatItem(menu.food)}\n` +
  `> ↳ 🥤 *Minuman :* ${formatItem(menu.drink)}`

function getRandomMenu(excludedMenus = []) {
  const excluded = new Set(excludedMenus.map(menuKey))
  let menu
  do {
    menu = getMbgMenu()
  } while (excluded.has(menuKey(menu)))
  return { food: menu.food, drink: menu.drink }
}

function formatMenuOptions(options) {
  return options.map((menu, index) => `> ${index + 1}. ${menuDescription(menu)}`).join('\n\n')
}

function getClaimsForDate(user, dateKey) {
  if (user.mbgClaimsDate === dateKey) {
    if (!Array.isArray(user.mbgClaims) || !user.mbgClaims.every(isValidMenu)) return null
    return user.mbgClaims
  }
  if (user.mbgClaimDate === dateKey) {
    return isValidMenu(user.mbgMenu) ? [user.mbgMenu] : []
  }
  return []
}

function getResetDelay(dateKey, now = Date.now()) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const nextJakartaMidnight = Date.UTC(year, month - 1, day + 1) - 7 * 60 * 60 * 1000
  return Math.max(0, nextJakartaMidnight - now)
}

function formatDuration(milliseconds) {
  const minutes = Math.ceil(milliseconds / 60_000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours ? `${hours} jam ` : ''}${remainingMinutes} menit`
}

function getClaimSummary(claims, premium, dateKey) {
  const limit = premium ? 2 : 1

  if (claims.length >= limit) {
    return `> Status : ✅ *Jatah hari ini sudah diambil ${claims.length}/${limit} kali.*\n` +
      `> ↳ Jatah berikutnya tersedia dalam *${formatDuration(getResetDelay(dateKey))}*.`
  }

  if (claims.length) {
    return `> Status : ✅ *Sudah diambil ${claims.length}/${limit} kali.*\n` +
      `> ↳ Jatah lainnya *siap diambil sekarang*.`
  }

  return `> Status : 🟢 *Jatah MBG hari ini siap diambil.*\n` +
    `> ↳ Kesempatan : *${limit}x*`
}

let handler = async (m, { text, usedPrefix }) => {
  const args = typeof text === 'string' ? text.trim().toLowerCase().split(/\s+/).filter(Boolean) : []
  const action = args[0]
  const params = args.slice(1)
  const knownActions = ['list', 'guide', 'info', 'command', 'commands', 'cmd', 'premium', 'ambil', 'take', 'tukar', 'swap']
  if (action && !knownActions.includes(action)) {
    return m.reply(`❌ Gunakan *${usedPrefix}mbg command* untuk melihat daftar perintah.`)
  }

  if (action === 'list') {
    const foods = makananIndonesia.map((item, index) => `> ${index + 1}. ${formatItem(item)}`).join('\n')
    const drinks = minumanIndonesia.map((item, index) => `> ${index + 1}. ${formatItem(item)}`).join('\n')
    return m.reply(
      `╭─❏「 📋 DAFTAR MENU MBG 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🍱 *Makanan yang bisa didapat*\n${foods}\n\n` +
      `🥤 *Minuman yang bisa didapat*\n${drinks}\n\n` +
      `> ↳ Setiap jatah berisi 1 makanan + 1 minuman.\n` +
      `> ↳ Air mineral memiliki peluang lebih besar.\n` +
      `> ↳ Lihat panduan: *${usedPrefix}mbg guide*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'info') {
    return m.reply(
      `╭─❏「 ℹ️ INFO MBG 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `MBG (Makan Bergizi Gratis) adalah fitur jatah makanan dan minuman Indonesia acak setiap hari. Menu yang didapat masuk ke kulkas.\n\n` +
      `> ↳ Makan dengan *${usedPrefix}makan* dan minum dengan *${usedPrefix}minum*.\n` +
      `> ↳ Menu harian bisa ditukar satu kali sehari.\n` +
      `> ↳ Pengguna premium mendapat 2 kesempatan klaim dan 4 pilihan menu tambahan saat menukar.\n\n` +
      `Panduan: *${usedPrefix}mbg guide* | Daftar menu: *${usedPrefix}mbg list*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'guide') {
    return m.reply(
      `╭─❏「 📖 PANDUAN MBG 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${usedPrefix}mbg* — Cek menu dan status jatah hari ini.\n` +
      `> ↳ *${usedPrefix}mbg ambil* — Ambil menu yang sedang dipilih.\n` +
      `> ↳ *${usedPrefix}mbg tukar* — Tukar menu satu kali sehari.\n` +
      `> ↳ *${usedPrefix}mbg list* — Lihat semua makanan dan minuman.\n` +
      `> ↳ Makanan masuk kulkas dan dikonsumsi dengan *${usedPrefix}makan*.\n` +
      `> ↳ Minuman masuk kulkas dan dikonsumsi dengan *${usedPrefix}minum*.\n\n` +
      `Pengguna premium dapat memakai *${usedPrefix}mbg tukar* untuk melihat 5 pilihan, memilih dengan *${usedPrefix}mbg tukar 1–5*, lalu mengambil sampai 2 jatah dengan *${usedPrefix}mbg ambil 1 2*. Pilihan tukar tidak dapat dibatalkan.\n\n` +
      `Info: *${usedPrefix}mbg info* | Perintah: *${usedPrefix}mbg command*\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

 if (['command', 'commands', 'cmd'].includes(action)) {
  return m.reply(
    `╭─❏「 📋 COMMAND MBG 」❏\n` +
    `│ 📋 *DAFTAR COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🍱 *MAKAN BERGIZI GRATIS*\n` +
    `> ↳ *${usedPrefix}mbg* — Cek menu dan status jatah\n` +
    `> ↳ *${usedPrefix}mbg info* — Penjelasan fitur MBG\n` +
    `> ↳ *${usedPrefix}mbg list* — Daftar makanan dan minuman\n` +
    `> ↳ *${usedPrefix}mbg guide* — Panduan MBG\n` +
    `> ↳ *${usedPrefix}mbg premium* — Status dan menu premium\n` +
    `> ↳ *${usedPrefix}mbg tukar* — Tukar menu\n` +
    `> ↳ *${usedPrefix}mbg ambil* — Ambil jatah\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const wdb = loadDB()
const data = getUserRPG(wdb, m.sender)
const user = data.rpg
if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

const premium = isPremiumUser(m.sender, wdb)
const menu = getMbgMenu()

if (!isValidMenu(user.mbgMenu) || user.mbgMenuDate !== menu.dateKey) {
  user.mbgMenuDate = menu.dateKey
  user.mbgMenu = { food: menu.food, drink: menu.drink }
  saveDB(wdb)
}

const dateKey = menu.dateKey
let dailyMenu = user.mbgMenu
const claims = getClaimsForDate(user, dateKey)
if (!claims) {
  return m.reply(
    `╭─❏「 ❌ DATA MBG 」❏\n` +
    `│ ❌ *DATA KLAIM TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Data klaim MBG tidak valid.\n` +
    `> ↳ Silakan laporkan masalah ini ke admin.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const options = user.mbgSwapDate === dateKey ? user.mbgSwapOptions : null

if (options && (!Array.isArray(options) || options.length !== 5 || !options.every(isValidMenu))) {
  return m.reply(
    `╭─❏「 ❌ DATA MBG 」❏\n` +
    `│ ❌ *DATA PILIHAN TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Data pilihan tukar MBG tidak valid.\n` +
    `> ↳ Silakan laporkan masalah ini ke admin.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'premium') {
  if (!premium) {
    return m.reply(
      `╭─❏「 👑 MBG PREMIUM 」❏\n` +
      `│ ℹ️ *FASILITAS PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Perintah ini menampilkan fasilitas MBG khusus pengguna premium.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const swappedToday = user.mbgSwapDate === dateKey ? Number(user.mbgSwapCount) || 0 : 0
  const pending = user.mbgSwapPending === true && options
  const availableMenus = options || []

  return m.reply(
    `╭─❏「 👑 MBG PREMIUM 」❏\n` +
    `│ 👑 *FASILITAS MBG PREMIUM*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Status Premium : *Aktif*\n` +
    `> ↳ Klaim Hari Ini : *${claims.length}/2*\n` +
    `> ↳ Tukar Menu Hari Ini : *${swappedToday}/1*\n` +
    `> ↳ Bisa mengambil sampai 2 pasangan menu per hari.\n` +
    `> ↳ Tukar menampilkan menu awal + 4 menu baru.\n` +
    (user.mbgSwapDate === dateKey && user.mbgSwapPending !== true
      ? `\n🔄 *Menu Aktif Hasil Tukar*\n` +
        `> ↳ ${menuDescription(dailyMenu)}\n`
      : '') +
    (claims.length >= 2
      ? `\n✅ *JATAH HARI INI SUDAH HABIS*\n` +
        `> ↳ Tersedia lagi dalam *${formatDuration(getResetDelay(dateKey))}*.`
      : pending
      ? `\n⏳ *PILIH MENU TUKAR SEBELUM KLAIM*\n` +
        `${formatMenuOptions(availableMenus)}\n\n` +
        `> ↳ Pilih dengan *${usedPrefix}mbg tukar 1–5*.`
      : options
        ? `\n🍱 *MENU TERSEDIA UNTUK KLAIM*\n` +
          `${formatMenuOptions(availableMenus)}\n\n` +
          `> ↳ Ambil dengan *${usedPrefix}mbg ambil 1* atau pilih dua nomor untuk dua jatah.`
        : `\n🍱 *BARU ADA 1 MENU AKTIF*\n` +
          `> ↳ ${menuDescription(dailyMenu)}\n` +
          (swappedToday < 1
            ? `> ↳ Gunakan *${usedPrefix}mbg tukar* untuk melihat pilihan menu lainnya.`
            : `> ↳ Menu hari ini sudah ditukar; gunakan menu aktif untuk klaim berikutnya.`)) +
    `\n\n` +
    `> ↳ Pilihan tukar tidak dapat dibatalkan.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'tukar' || action === 'swap') {
  if (params.length > 1) {
    return m.reply(
      `╭─❏「 🔄 TUKAR MENU MBG 」❏\n` +
      `│ ❌ *FORMAT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Format: *${usedPrefix}mbg tukar*.\n` +
      `> ↳ Atau pilih nomor: *${usedPrefix}mbg tukar 1–5*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (params.length === 1) {
    if (!premium) {
      return m.reply(
        `╭─❏「 🔄 TUKAR MENU MBG 」❏\n` +
        `│ ❌ *KHUSUS PREMIUM*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pemilihan nomor menu tukar khusus pengguna premium.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (!/^[1-5]$/.test(params[0])) {
      return m.reply(
        `╭─❏「 🔄 TUKAR MENU MBG 」❏\n` +
        `│ ❌ *PILIHAN TIDAK VALID*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilih nomor *1–5* dari daftar *${usedPrefix}mbg tukar*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (user.mbgSwapDate !== dateKey || user.mbgSwapPending !== true || !options) {
      return m.reply(
        `╭─❏「 🔄 TUKAR MENU MBG 」❏\n` +
        `│ ❌ *TIDAK ADA PILIHAN MENUNGGU*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Tidak ada pilihan tukar yang menunggu.\n` +
        `> ↳ Gunakan *${usedPrefix}mbg tukar* untuk membuat pilihan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const selected = Number(params[0])
    dailyMenu = options[selected - 1]
    user.mbgMenu = dailyMenu
    user.mbgSwapPending = false
    user.mbgSwapSelection = selected
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🔄 MENU MBG DITETAPKAN 」❏\n` +
      `│ 🍱 *MENU PILIHAN ${selected}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${menuDescription(dailyMenu)}\n\n` +
      `> ↳ Pilihan tidak dapat dibatalkan.\n` +
      `> ↳ Klaim dengan *${usedPrefix}mbg ambil*.\n` +
      `> ↳ Atau pilih nomor menu untuk jatah dengan *${usedPrefix}mbg ambil 1 2*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (claims.length && (!premium || claims.length >= 2)) {
    return m.reply(
      `╭─❏「 🔄 TUKAR MENU MBG 」❏\n` +
      `│ ❌ *JATAH TIDAK TERSEDIA UNTUK DITUKAR*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pengguna biasa hanya bisa menukar sebelum klaim pertama.\n` +
      `> ↳ Premium hanya bisa menukar sebelum jatah kedua diambil.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (user.mbgSwapDate === dateKey) {
    if (premium && user.mbgSwapPending === true && options) {
      return m.reply(
        `╭─❏「 🔄 PILIH MENU MBG 」❏\n` +
        `│ ⏳ *PILIH SALAH SATU MENU*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${formatMenuOptions(options)}\n\n` +
        `> ↳ Pilih dengan *${usedPrefix}mbg tukar 1–5*.\n` +
        `> ↳ Pilihan ini tidak dapat dibatalkan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    return m.reply(
      `╭─❏「 🔄 TUKAR MENU MBG 」❏\n` +
      `│ ❌ *SUDAH DITUKAR HARI INI*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Menu MBG hanya bisa ditukar satu kali sehari.\n` +
      `> ↳ Menu Aktif :\n> ↳ ${menuDescription(dailyMenu)}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (premium) {
    const swapOptions = claims.length ? [] : [dailyMenu]

    const alternativeCount = claims.length ? 5 : 4
    for (let index = 0; index < alternativeCount; index++) {
      swapOptions.push(getRandomMenu(swapOptions))
    }

    user.mbgSwapDate = dateKey
    user.mbgSwapCount = 1
    user.mbgSwapOptions = swapOptions
    user.mbgSwapPending = true
    saveDB(wdb)

    return m.reply(
      `╭─❏「 🔄 PILIH MENU MBG 」❏\n` +
      `│ 👑 *MENU PREMIUM*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      (claims.length
        ? `> ↳ Jatah pertama sudah diambil; berikut 5 pilihan baru untuk jatah kedua:\n\n`
        : `> ↳ Menu awal dan 4 alternatif:\n\n`) +
      `${formatMenuOptions(swapOptions)}\n\n` +
      `> ↳ Pilih satu dengan *${usedPrefix}mbg tukar 1–5*.\n` +
      `> ↳ Pilihan tidak dapat dibatalkan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  dailyMenu = getRandomMenu([dailyMenu])
  user.mbgMenu = dailyMenu
  user.mbgSwapDate = dateKey
  user.mbgSwapCount = 1
  saveDB(wdb)

  return m.reply(
    `╭─❏「 🔄 MENU MBG DITUKAR 」❏\n` +
    `│ 🍱 *MENU BERHASIL DITUKAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${menuDescription(dailyMenu)}\n\n` +
    `> ↳ Tukar tidak dapat dibatalkan.\n` +
    `> ↳ Tukar hanya tersedia satu kali sehari.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  if (action === 'ambil' || action === 'take') {
    if (user.mbgSwapPending === true && user.mbgSwapDate === dateKey) {
      return m.reply(`❌ Pilih menu tukar terlebih dahulu dengan *${usedPrefix}mbg tukar 1–5*.`)
    }
    if (!premium && params.length) {
      return m.reply(`❌ Pilihan nomor menu untuk klaim khusus premium. Gunakan *${usedPrefix}mbg ambil*.`)
    }
    if (params.length > 2 || params.some(value => !/^\d+$/.test(value))) {
      return m.reply(`Format: *${usedPrefix}mbg ambil [nomor menu [nomor menu]]*.`)
    }

    const limit = premium ? 2 : 1
    if (claims.length >= limit) {
      return m.reply(`${getClaimSummary(claims, premium, dateKey)}\n\nMenu aktif:\n> ↳ ${menuDescription(dailyMenu)}`)
    }

    let selectedMenus
    if (premium && params.length) {
      if (options && options.length === 5 && user.mbgSwapDate === dateKey && user.mbgSwapPending !== true) {
        selectedMenus = params.map(value => options[Number(value) - 1])
      } else {
        selectedMenus = params.map(value => Number(value) === 1 ? dailyMenu : null)
      }
      if (selectedMenus.some((selected, index) =>
        !selected || (options && options.length === 5 && user.mbgSwapDate === dateKey
          ? Number(params[index]) < 1 || Number(params[index]) > 5
          : Number(params[index]) !== 1)
      )) {
        return m.reply(`❌ Nomor menu tidak tersedia. Lihat pilihan dengan *${usedPrefix}mbg premium*.`)
      }
    } else {
      selectedMenus = [dailyMenu]
    }
    if (claims.length + selectedMenus.length > limit) {
      return m.reply(`❌ Sisa kesempatan klaim hari ini: *${limit - claims.length}*. Masukkan nomor menu sebanyak kesempatan yang ingin dipakai.`)
    }
    if (selectedMenus.some(selected => !isValidMenu(selected))) {
      return m.reply('❌ Data menu MBG tidak valid. Silakan laporkan masalah ini ke admin.')
    }

    const itemIncrements = new Map()
    for (const selected of selectedMenus) {
      for (const item of [selected.food, selected.drink]) {
        itemIncrements.set(item, (itemIncrements.get(item) || 0) + 1)
      }
    }
    for (const [item, increment] of itemIncrements) {
      const quantity = Number(user.masakan?.[item] || 0)
      if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > Number.MAX_SAFE_INTEGER - increment) {
        return m.reply('❌ Data stok masakanmu tidak valid. Silakan laporkan masalah ini ke admin.')
      }
    }

    if (!user.masakan) user.masakan = {}
    for (const [item, increment] of itemIncrements) {
      user.masakan[item] = Number(user.masakan[item] || 0) + increment
    }
    user.mbgClaimsDate = dateKey
    user.mbgClaims = [...claims, ...selectedMenus]
    user.mbgClaimDate = dateKey
    saveDB(wdb)
    const claimDetails = selectedMenus.map((selected, index) =>
      `> ↳ ${index + 1}. ${menuDescription(selected)}`
    ).join('\n')
    return m.reply(
      `╭─❏「 ✅ JATAH MBG DIAMBIL 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n${claimDetails}\n\n` +
      `> ↳ ${selectedMenus.length} makanan + ${selectedMenus.length} minuman masuk ke kulkas.\n` +
      `> ↳ Jatah terpakai: *${user.mbgClaims.length}/${limit}*.\n` +
      `${user.mbgClaims.length < limit ? `> ↳ Kesempatan berikutnya siap diambil dengan *${usedPrefix}mbg ambil*.\n` : `> ↳ Jatah berikutnya tersedia besok.\n`}` +
      `─━━━━━━━━━━━━━━─`
    )
  }

return m.reply(
  `╭─❏「 🍱 MAKAN BERGIZI GRATIS 」❏\n` +
  `│ 🍱 *STATUS MBG KAMU*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `📅 *Tanggal :* ${dateKey}\n` +
  `${getClaimSummary(claims, premium, dateKey)}\n\n` +
  `> *Menu Aktif :*\n> ↳ ${menuDescription(dailyMenu)}\n\n` +
  `📌 *PANDUAN MBG*\n` +
  `> ↳ Tutorial : *${usedPrefix}mbg guide*\n` +
  `> ↳ Command : *${usedPrefix}mbg command*\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['mbg', 'mbg info', 'mbg list', 'mbg guide', 'mbg command', 'mbg premium', 'mbg tukar', 'mbg ambil']
handler.tags = ['rpg']
handler.command = /^(mbg)$/i
handler.group = true
export default handler
