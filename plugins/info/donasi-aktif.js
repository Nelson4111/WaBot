import { sendGroupActivityDonationNotice } from '../../lib/groupActivityDonations.js'

const handler = async (m, { conn, usedPrefix }) => {
  return sendGroupActivityDonationNotice(conn, m.chat, `${usedPrefix || '.'}donasi`)
}

handler.help = ['donasiaktif']
handler.tags = ['info']
handler.command = /^(donasiaktif|dukungavelia)$/i

handler.desc = 'Menampilkan informasi dan statistik sistem mengenai aktif.'
handler.tutorial = [
  '.donasiaktif'
]

export default handler
