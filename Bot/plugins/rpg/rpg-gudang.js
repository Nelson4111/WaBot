import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if(!user) return m.reply('❌ Kamu belum punya data RPG')
  if(!user.inventory) user.inventory = {}

  let items = Object.entries(user.inventory).filter(([name, count]) => count > 0)

  if(items.length === 0) return m.reply(`🏚️ *ISI GUDANG KOSONG*\n\nTanam, tambang, mancing, atau beli dulu biar gudang terisi`)

  let total = items.reduce((a, [,count]) => a + count, 0)

  let cap = `*───「 ISI GUDANG KAMU 」───*\n`
  cap += `Total Barang: ${total.toLocaleString()} unit\n\n`

  items.sort((a,b) => b[1] - a[1]) // urut dari paling banyak
  .forEach(([name, count]) => {
    cap += `- ${formatNama(name)} x${count.toLocaleString()}\n`
  })

  cap += `\n*PANDUAN:*\n`
  cap += `• Jual Barang: *${usedPrefix}shop*\n`
  cap += `• Jual Semua: *${usedPrefix}jual all*`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['gudang', 'gudangku']
handler.tags = ['rpg']
handler.command = /^(gudang|gudangku)$/i
handler.group = true
export default handler