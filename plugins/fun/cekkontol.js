import { formatFunCheck } from '../../lib/funCheck.js'

let handler = async (m, { conn, command, text }) => {
	
    if (!text) return conn.reply(m.chat, '• *Example :* .cekkontol Bapak Komintod', m)
  let caption = formatFunCheck({
    title: `KONTOLNYA ${text.trim()}`,
    user: text.trim(),
    userLabel: 'Nama',
    details: [
      { label: 'Kontol', value: pickRandom(['Putih mulus', 'Putih', 'Hitam']) },
      { label: 'Jembut', value: pickRandom(['Lebat', 'Tipis', 'Gada Jembut', 'Bersih']) },
      { label: 'Status', value: pickRandom(['perjaka', 'Ga perjaka', 'Besar', 'Panjang', 'Disunat', 'Blom Disunat']) }
    ]
  })
  await conn.reply(m.chat, caption, m)
}
handler.help = ['cekkontol *<name>*']
handler.tags = ['fun']
handler.command = /^cekkontol/i

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}