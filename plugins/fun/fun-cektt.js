import { formatFunCheck } from '../../lib/funCheck.js'

let handler = async (m, { conn, command, text }) => {
	
    if (!text) return conn.reply(m.chat, '• *Example :* .cektt elaina', m)
  let caption = formatFunCheck({
    title: `TT NYA ${text.trim()}`,
    user: text.trim(),
    userLabel: 'Nama',
    details: [
      { label: 'TT', value: pickRandom(['Putih', 'Hitam', 'Putih mulus', 'Hytam banget', 'Karatan ☠️']) },
      { label: 'Pentil', value: pickRandom(['Hytam', 'Pink', 'kecil', 'Perfect']) },
      { label: 'Ukuran', value: pickRandom(['Tepos', 'Spek Nasi KFC', 'Tobrut', '32', '34', '36']) }
    ]
  })
  await conn.reply(m.chat, caption, m)
}
handler.help = ['cektt *<name>*']
handler.tags = ['fun']
handler.command = /^cekpentil|cektt/i

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}