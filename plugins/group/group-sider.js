import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, text, groupMetadata }) => {
  const customNote = text ? text.trim() : 'Harap aktif di dalam grup demi menjaga kenyamanan bersama.'
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000

  const participants = groupMetadata?.participants || []
  const totalMembers = participants.length
  const users = global.db?.data?.users || {}
  const botJid = conn.decodeJid(conn.user.id || conn.user.jid)

  let siders = []

  for (const p of participants) {
    const rawJid = p.id || p.jid || p.phoneNumber
    if (!rawJid) continue
    const jid = conn.decodeJid(rawJid)

    // Abaikan bot dan admin grup
    if (jid === botJid) continue
    if (p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin || p.isSuperAdmin) continue

    const userData = users[jid]

    // Jika tidak ada data aktivitas, atau banned, atau lastseen > 7 hari lalu
    if (!userData || !userData.lastseen) {
      siders.push({ jid, status: 'Tidak Pernah Aktif' })
    } else if (userData.banned) {
      siders.push({ jid, status: 'Status Banned' })
    } else if (now - userData.lastseen > sevenDays) {
      const offDuration = formatOffTime(now - userData.lastseen)
      siders.push({ jid, status: `Off ${offDuration}` })
    }
  }

  if (siders.length === 0) {
    return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Seluruh anggota terpantau aktif dan berpartisipasi dengan baik!\n*╰───────────────*')
  }

  const siderLines = siders.slice(0, 50).map((s, idx) => {
    const num = s.jid.split('@')[0].replace(/\D/g, '')
    return `*┆*   ${toSmallNum(idx + 1)}. @${num} › _(${s.status})_`
  })

  const moreCount = siders.length > 50 ? `\n> _...dan ${toSmallNum(siders.length - 50)} anggota lainnya._` : ''

  const txt = `*──  ୨୧ ✧ REKAP ANGGOTA TIDAK AKTIF ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇᴍᴀɴᴛᴀᴜᴀɴ ꜱɪᴅᴇʀ)
> Ditemukan *${toSmallNum(siders.length)}* dari *${toSmallNum(totalMembers)}* anggota kurang aktif.

*╭  〔 ◈ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ꜱ ɪ ᴅ ᴇ ʀ 〕*
${siderLines.join('\n')}
*╰───────────────*${moreCount}

> _"${customNote}"_
> ｡˚ ⊹ _Mari saling menyapa dan meramaikan grup secara harmonis_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, {
    text: txt,
    mentions: siders.map(s => s.jid)
  }, { quoted: m })
}

handler.help = ['sider [pesan]']
handler.tags = ['group']
handler.command = /^(sider|gcsider|getsider)$/i
handler.group = true
handler.admin = true

export default handler

function formatOffTime(ms) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  if (days > 0) return `${days} Hari`
  if (hours > 0) return `${hours} Jam`
  return 'Baru Saja'
}
