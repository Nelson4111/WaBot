import { loadDB } from '../../lib/waifuHelper.js'

const rupiah = n => 'Rp ' + (n || 0).toLocaleString('id-ID')

const formatWIB = (ms) => {
  return new Date(ms).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).replace(/\./g, ':') + ' WIB'
}

let handler = async (m) => {
  const db = loadDB()
  const now = Date.now()

  if (!db.redeem || Object.keys(db.redeem).length === 0) {
    return m.reply('❌ *Belum ada kode redeem yang tersedia.*')
  }

  const aktif = Object.entries(db.redeem)
    .filter(([_, r]) => {
      const sisaKuota = (r.quota - r.used) > 0
      const belumExpired = r.expired ? now < r.expired : true
      return sisaKuota && belumExpired
    })

  if (aktif.length === 0) {
    return m.reply('❌ *Semua kode redeem telah habis atau expired.*')
  }

  let teks = `*R E D E E M  -  L I S T*\n`

  aktif.forEach(([code, r], index) => {
    const sisa = r.quota - r.used
    const expDate = r.expired ? formatWIB(r.expired) : 'PERMANEN'
    
    teks += `┌〔 *${index + 1}* 〕───\n`
    teks += `│ ◦ *Kode:* \`${code}\`\n`
    teks += `│ ◦ *Uang:* ${rupiah(r.uang)}\n`
    teks += `│ ◦ *Exp:* ${r.xp.toLocaleString()} XP\n`
    teks += `│ ◦ *Limit:* +${r.limit}\n`
    teks += `│ ◦ *Sisa:* ${sisa} kuota\n`
    teks += `│ ◦ *Waktu:* ${expDate}\n`
    teks += `└──────────────\n\n`
  })

  teks += `*Note:* Gunakan \`.redeem [kode]\` untuk klaim.`

  m.reply(teks.trim())
}

handler.command = /^(listredeem)$/i
handler.tags = ['info']
handler.help = ['listredeem']
handler.register = true

export default handler