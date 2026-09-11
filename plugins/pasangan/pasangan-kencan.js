import { toSmallNum } from '../../lib/style.js'
import { formatDuration, getPasanganHiddenNotice, isPasanganHidden } from '../../lib/pasanganHelper.js'

/**
 * Kencan Harian Pasangan Plugin
 * Mengajak pasangan berkencan untuk meningkatkan EXP dan keharmonisan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const pList = users[sender]?.pasangan || []

  if (isPasanganHidden(users[sender] || {})) {
    return m.reply(getPasanganHiddenNotice(sender.split('@')[0].replace(/\D/g, ''), true))
  }

  if (pList.length === 0) {
    return m.reply(`*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu belum memiliki pasangan untuk diajak kencan.\n> Lamar seseorang terlebih dahulu dengan *${usedPrefix}lamar @user*!\n*╰───────────────*`)
  }

  const lastKencan = users[sender].lastKencan || 0
  const cooldown = 3600000 // 1 jam
  const now = Date.now()

  if (now - lastKencan < cooldown) {
    const remaining = formatDuration(cooldown - (now - lastKencan))
    return m.reply(`*╭  〔 ⧗ ᴊ ᴇ ᴅ ᴀ  ᴋ ᴇ ɴ ᴄ ᴀ ɴ 〕*\n> Kamu dan pasanganmu masih beristirahat setelah kencan sebelumnya.\n> Mohon menunggu *${remaining}* lagi untuk berkencan kembali ♡\n*╰───────────────*`)
  }

  users[sender].lastKencan = now
  const expBonus = Math.floor(Math.random() * 500) + 300
  const bucinBonus = Math.floor(Math.random() * 15) + 5

  // Tambahkan poin bucin ke kedua belah pihak
  pList.forEach(p => {
    p.poinBucin = (p.poinBucin || 0) + bucinBonus
    if (users[p.jid] && users[p.jid].pasangan) {
      const rec = users[p.jid].pasangan.find(x => x.jid === sender)
      if (rec) rec.poinBucin = (rec.poinBucin || 0) + bucinBonus
    }
  })

  users[sender].exp = (users[sender].exp || 0) + expBonus

  const places = [
    'Restoran Grand Pavilion',
    'Gedung Teater Bioskop',
    'Taman Sakura Mekar',
    'Pesisir Teluk Senja',
    'Kafe Klasik Vintage',
    'Puncak Bukit Bintang',
    'Kapal Pesiar Cakrawala'
  ]
  const place = places[Math.floor(Math.random() * places.length)]

  const resText = `*──  ୨୧ ✧ KENCAN ROMANTIS BERHASIL ✧ ୨୧  ──*

> Kamu dan pasanganmu baru saja menikmati waktu berkualitas di *${place}* ♡

*╭  〔 ᰔ ʜ ᴀ ꜱ ɪ ʟ  ᴋ ᴇ ɴ ᴄ ᴀ ɴ 〕*
*┆* ⟡ ʟᴏᴋᴀꜱɪ   : *${place}*
*┆* ✧ ʙᴏɴᴜꜱ ᴇxᴘ : *+${toSmallNum(expBonus)} EXP*
*┆* ✦ ᴋᴇᴍᴇꜱʀᴀᴀɴ : *+${toSmallNum(bucinBonus)} Poin Bucin*
*╰───────────────*

> ｡˚ ⊹ _Setiap kebersamaan menumbuhkan kehangatan dan keabadian cinta_ ⊹ ˚ ｡`.trim()

  return m.reply(resText)
}

handler.help = ['kencan']
handler.tags = ['pasangan']
handler.command = /^(kencan)$/i

export default handler
