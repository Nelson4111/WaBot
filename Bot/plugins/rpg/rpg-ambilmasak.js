import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.dapur) return m.reply('❌ Kamu belum punya dapur.')

  let sekarang = Date.now()
  let selesai = user.dapur.antrian.filter(item => item.selesai <= sekarang)
  if(selesai.length === 0) return m.reply('❌ Belum ada masakan yang selesai.')

  if(!user.masakan) user.masakan = {}
  let expTotal = 0
  let apresiasiTotal = 0
  let list = []
  let listGosong = []

  selesai.forEach(item => {
    let telat = sekarang - item.selesai
    if(telat > 18000000){
      let duit = Math.floor(item.harga / 2)
      apresiasiTotal += duit
      listGosong.push(`${item.emoji} ${item.nama} - Rp ${duit.toLocaleString()}`)
    } else {
      user.masakan[item.nama] = (user.masakan[item.nama] || 0) + 1
      expTotal += item.exp
      list.push(`${item.emoji} ${item.nama}`)
    }
  })

  if(apresiasiTotal > 0) wdb.money[m.sender] = (wdb.money[m.sender] || 0) + apresiasiTotal
  user.dapur.antrian = user.dapur.antrian.filter(item => item.selesai > sekarang)

  user.exp += expTotal
  let levelup = ''
  while(user.exp >= user.level * 500) { // FIX
    user.exp -= user.level * 500
    user.level++
    levelup += `\n🎉 *LEVEL UP!* Lv.${user.level}`
  }

  saveDB(wdb)
  let cap = ``
  if(list.length > 0) cap += `✅ *MASAKAN BERHASIL DIAMBIL*\n\n${list.join('\n')}\n\n✨ Exp: +${expTotal}${levelup}\n\n`
  if(listGosong.length > 0) cap += `🔥 *ADUH MASAKANNYA GOSONG*\n\n${listGosong.join('\n')}\n\n`
  cap += `💸 *Apresiasi Chef Zeta*\nTotal: Rp ${apresiasiTotal.toLocaleString()}\n\n`
  cap += `📝 *Pesan Chef Zeta*: "Terima kasih sudah berusaha memasak. Karena kelupaan diambil, aku beri apresiasi ini sebagai ganti. Lain kali diambil ya dalam 5 jam setelah matang biar nggak gosong lagi. Semangat terus!"`
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}
handler.help = ['ambilmasak']
handler.tags = ['rpg']
handler.command = /^(ambilmasak)$/i
handler.group = true
export default handler
