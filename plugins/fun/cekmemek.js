import { formatFunCheck } from '../../lib/funCheck.js'

let handler = async (m, { conn, command, text }) => {
	
    if (!text) return conn.reply(m.chat, '• *Example :* .cekmemek farida', m)
  let caption = formatFunCheck({
    title: `MEMEKNYA ${text.trim()}`,
    user: text.trim(),
    userLabel: 'Nama',
    details: [
      { label: 'Memek', value: pickRandom(['Putih mulus', 'Hitam', 'Pink', 'Pink Mulus', 'Hitam mulus']) },
      { label: 'Jembut', value: pickRandom(['Lebat', 'Tipis', 'Gada Jembut', 'Bersih']) },
      { label: 'Lobang', value: pickRandom(['Perawan', 'Ga Perawan', 'Besar', 'Sempit']) }
    ]
  })
  await conn.reply(m.chat, caption, m)
}
handler.help = ['cekmemek *<name>*']
handler.tags = ['fun']
handler.command = /^cekmemek|cekmmk/i

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}