import { toSmallNum } from '../../lib/style.js'
import { formatDuration, getPasanganHiddenNotice, isPasanganHidden } from '../../lib/pasanganHelper.js'

/**
 * Kencan Harian Pasangan Plugin
 * Mengajak pasangan berkencan untuk meningkatkan EXP dan keharmonisan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, text = '' }) => {
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
  const requested = text.trim().toLowerCase()
  const selectedIndexes = requested === 'all' || !requested
    ? pList.map((_, index) => index)
    : [Number(requested) - 1]
  if (selectedIndexes.some(index => !Number.isInteger(index) || !pList[index])) {
    return m.reply(`❌ Nomor pasangan tidak valid. Gunakan *${usedPrefix}kencan*, *${usedPrefix}kencan all*, atau nomor dari daftar pasangan.`)
  }
  const selected = selectedIndexes
    .map(index => ({ partner: pList[index], index }))
    .filter(({ partner }) => now - (partner.lastKencan || 0) >= cooldown)
  if (!selected.length) {
    const remaining = Math.min(...selectedIndexes.map(index => cooldown - (now - (pList[index].lastKencan || 0))))
    return m.reply(`*╭  〔 ⧗ ᴊ ᴇ ᴅ ᴀ  ᴋ ᴇ ɴ ᴄ ᴀ ɴ 〕*\n> Semua pasangan yang dipilih masih beristirahat.\n> Mohon menunggu *${formatDuration(remaining)}* lagi ♡\n*╰───────────────*`)
  }

  const expBonus = Math.floor(Math.random() * 500) + 300
  const bucinBonus = Math.floor(Math.random() * 15) + 5

  // Tambahkan poin bucin ke kedua belah pihak
  selected.forEach(({ partner: p }) => {
    p.lastKencan = now
    p.poinBucin = (p.poinBucin || 0) + bucinBonus
    if (users[p.jid] && users[p.jid].pasangan) {
      const rec = users[p.jid].pasangan.find(x => x.jid === sender)
      if (rec) rec.poinBucin = (rec.poinBucin || 0) + bucinBonus
    }
  })

  users[sender].exp = (users[sender].exp || 0) + expBonus * selected.length

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
*┆* ✧ ᴘᴀsᴀɴɢᴀɴ   : *${selected.map(({ partner }) => partner.name).join(', ')}*
*╰───────────────*

> ｡˚ ⊹ _Setiap kebersamaan menumbuhkan kehangatan dan keabadian cinta_ ⊹ ˚ ｡`.trim()

  return m.reply(resText)
}

handler.help = ['kencan']
handler.tags = ['pasangan']
handler.command = /^(kencan)$/i

export default handler
