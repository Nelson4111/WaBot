import { toSmallNum } from '../../lib/style.js'
import { formatDuration } from '../../lib/pasanganHelper.js'

/**
 * Tunjangan Berkah Nikah Harian Plugin
 * Mengklaim tunjangan uang, exp, dan kemesraan harian bersama pasangan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const pList = users[sender]?.pasangan || []

  if (pList.length === 0) {
    return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu belum memiliki pasangan untuk mengklaim Berkah Nikah.\n*╰───────────────*')
  }

  const lastClaim = users[sender].lastLoveClaim || 0
  const cooldown = 86400000 // 24 jam
  const now = Date.now()

  if (now - lastClaim < cooldown) {
    const remaining = formatDuration(cooldown - (now - lastClaim))
    return m.reply(`*╭  〔 ⧗ ᴊ ᴇ ᴅ ᴀ  ᴋ ʟ ᴀ ɪ ᴍ 〕*\n> Kamu telah mengklaim Berkah Nikah hari ini.\n> Tunggu *${remaining}* lagi untuk klaim berikutnya ♡\n*╰───────────────*`)
  }

  users[sender].lastLoveClaim = now
  const moneyBonus = 50000
  const bucinBonus = 10
  const expBonus = 200

  users[sender].exp = (users[sender].exp || 0) + expBonus
  if (global.db?.data?.money) {
    global.db.data.money[sender] = (global.db.data.money[sender] || 0) + moneyBonus
  }

  pList.forEach(p => {
    p.poinBucin = (p.poinBucin || 0) + bucinBonus
    if (users[p.jid] && users[p.jid].pasangan) {
      const rec = users[p.jid].pasangan.find(x => x.jid === sender)
      if (rec) rec.poinBucin = (rec.poinBucin || 0) + bucinBonus
      if (global.db?.data?.money) {
        global.db.data.money[p.jid] = (global.db.data.money[p.jid] || 0) + moneyBonus
      }
    }
  })

  const txt = `*──  ୨୧ ✧ BERKAH NIKAH HARIAN ✧ ୨୧  ──*

> Selamat! Kamu dan pasanganmu menerima tunjangan kebahagiaan harian ♡

*╭  〔 ᰔ ᴛ ᴜ ɴ ᴊ ᴀ ɴ ɢ ᴀ ɴ  ʜ ᴀ ʀ ɪ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴀʟᴅᴏ ᴜᴀɴɢ : *+Rp ${toSmallNum(moneyBonus.toLocaleString('id-ID'))} (Masing-masing)*
*┆* ✧ ʙᴏɴᴜꜱ ᴇxᴘ  : *+${toSmallNum(expBonus)} EXP*
*┆* ✦ ᴘᴏɪɴ ʙᴜᴄɪɴ : *+${toSmallNum(bucinBonus)} Poin*
*╰───────────────*

> ｡˚ ⊹ _Semoga ikatan pernikahan kalian senantiasa diberkahi kebahagiaan_ ⊹ ˚ ｡`.trim()

  return m.reply(txt)
}

handler.help = ['loveclaim', 'berkahnikah', 'hadiahpasangan']
handler.tags = ['pasangan']
handler.command = /^(loveclaim|berkahnikah|hadiahpasangan)$/i

export default handler
