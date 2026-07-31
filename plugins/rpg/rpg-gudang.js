import { loadDB, getUserRPG, initLadang } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  const emoji = {
    'padi': '🌾', 'jagung': '🌽', 'semangka': '🍉', 'jeruk': '🍊',
    'mangga': '🥭', 'apel': '🍎', 'durian': '🌳', 'emas': '⚜️'
  }

  let hasil = user.hasilKebun || {}
  let items = Object.entries(hasil).filter(([_, count]) => count > 0)

  let listGudang = items.map(([name, count]) => {
    return `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈﹒
╎ ${emoji[name] || '🍏'} *${name.toUpperCase()}*
╎ 📦 ${count.toLocaleString()} unit
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈﹒`
  }).join('\n')

  let cap = `*─── 「 GUDANG 」 ───*\n\n`
  cap += `☘️ *User:* ${m.pushName}\n\n`
  
  cap += items.length > 0 ? listGudang : `_Gudang masih kosong, yuk berkebun!_`
  
  cap += `\n\n*PANDUAN:* \n`
  cap += `• Ketik *${usedPrefix}jual padi 1*\n`
  cap += `• Ketik *${usedPrefix}jual all* (untuk semua)`

  m.reply(cap)
}

handler.help = ['gudang']
handler.tags = ['rpg']
handler.command = /^(gudang)$/i
handler.group = true

export default handler