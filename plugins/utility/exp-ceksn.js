import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix }) {
  let sn = createHash('md5').update(m.sender).digest('hex')

m.reply(`*📮 SN:* ${sn}`)
}

handler.help = ['ceksn']
handler.tags = ['info']
handler.command = /^(ceksn)$/i
handler.register = true
handler.desc = 'Menjalankan perintah ceksn untuk layanan ceksn.'
handler.tutorial = [
  '.ceksn'
]

export default handler