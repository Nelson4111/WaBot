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

const formatItem = item => `${resepEmoji[item] || hargaBeli[item].emoji} ${formatMasakanNama(item)}`

let handler = async (m, { text, usedPrefix }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

  const args = typeof text === 'string' ? text.trim().toLowerCase().split(/\s+/).filter(Boolean) : []
  const action = args[0]
  if (action && !['ambil', 'take'].includes(action)) {
    return m.reply(`❌ Gunakan *${usedPrefix}mbg* untuk melihat menu atau *${usedPrefix}mbg ambil* untuk mengambil jatah.`)
  }

  const menu = getMbgMenu()
  let dailyMenu = user.mbgMenuDate === menu.dateKey ? user.mbgMenu : null
  if (
    !dailyMenu ||
    !makananIndonesia.includes(dailyMenu.food) ||
    !minumanIndonesia.includes(dailyMenu.drink) ||
    !masakanResep[dailyMenu.food] ||
    !masakanResep[dailyMenu.drink] ||
    !hargaBeli[dailyMenu.food] ||
    !hargaBeli[dailyMenu.drink]
  ) {
    dailyMenu = { food: menu.food, drink: menu.drink }
    user.mbgMenuDate = menu.dateKey
    user.mbgMenu = dailyMenu
    saveDB(wdb)
  }
  menu.food = dailyMenu.food
  menu.drink = dailyMenu.drink
  const menuItems = [menu.food, menu.drink]
  if (
    !makananIndonesia.includes(menu.food) ||
    !masakanResep[menu.food] ||
    !hargaBeli[menu.food] ||
    !minumanIndonesia.includes(menu.drink) ||
    !masakanResep[menu.drink] ||
    !hargaBeli[menu.drink]
  ) {
    return m.reply('❌ Data menu MBG hari ini belum lengkap. Silakan laporkan masalah ini ke admin.')
  }

  const details = `📅 Tanggal: ${menu.dateKey}\n\n🍱 *Menu hari ini*\n> Makanan: ${formatItem(menu.food)} x1\n> Minuman: ${formatItem(menu.drink)} x1`
  if (!action) {
    return m.reply(
      `╭─❏「 🍱 MAKAN BERGIZI GRATIS 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n${details}\n\n` +
      `> ↳ Ambil jatah hari ini: *${usedPrefix}mbg ambil*\n` +
      `> ↳ Jatah dapat diambil satu kali per hari.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (user.mbgClaimDate === menu.dateKey) {
    return m.reply(`✅ Jatah MBG hari ini sudah kamu ambil.\n\n${details}`)
  }

  if (menuItems.some(item => {
    const quantity = Number(user.masakan?.[item] || 0)
    return !Number.isSafeInteger(quantity) || quantity < 0 || quantity >= Number.MAX_SAFE_INTEGER
  })) {
    return m.reply('❌ Data stok masakanmu tidak valid. Silakan laporkan masalah ini ke admin.')
  }

  if (!user.masakan) user.masakan = {}
  user.masakan[menu.food] = Number(user.masakan[menu.food] || 0) + 1
  user.masakan[menu.drink] = Number(user.masakan[menu.drink] || 0) + 1
  user.mbgClaimDate = menu.dateKey
  saveDB(wdb)

  return m.reply(
    `╭─❏「 ✅ JATAH MBG DIAMBIL 」❏\n` +
    `╰─━━━━━━━━━━━━━━─\n\n${details}\n\n` +
    `> ↳ 1 makanan + 1 minuman Indonesia masuk ke kulkasmu.\n` +
    `> ↳ Makan: *${usedPrefix}makan ${menu.food}*\n` +
    `> ↳ Minum: *${usedPrefix}minum ${menu.drink}*\n` +
    `> ↳ Jatah berikutnya tersedia besok.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['mbg', 'mbg ambil']
handler.tags = ['rpg']
handler.command = /^(mbg)$/i
handler.group = true
export default handler
