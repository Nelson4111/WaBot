import { createCanvas, loadImage } from 'canvas'
import { formatDuration } from '../../lib/pasanganHelper.js'

/**
 * Kartu Nikah Digital Canvas Plugin
 * Menggenerasi piagam / kartu nikah digital beresolusi tinggi dengan avatar kedua mempelai
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const who = conn.decodeJid(m.mentionedJid?.[0] || m.quoted?.sender || sender)
  const pList = users[who]?.pasangan || []

  if (pList.length === 0) {
    return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu belum memiliki pasangan untuk mencetak Kartu Nikah Digital.\n*╰───────────────*')
  }

  const partnerJid = pList[0].jid
  const defaultPp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'

  let pp1 = defaultPp
  let pp2 = defaultPp

  try { pp1 = await conn.profilePictureUrl(who, 'image') } catch {}
  try { pp2 = await conn.profilePictureUrl(partnerJid, 'image') } catch {}

  try {
    const canvas = createCanvas(850, 520)
    const ctx = canvas.getContext('2d')

    // Background Deep Royal Navy Gradient
    const grad = ctx.createLinearGradient(0, 0, 850, 520)
    grad.addColorStop(0, '#0a192f')
    grad.addColorStop(0.5, '#1e3e62')
    grad.addColorStop(1, '#020c1b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 850, 520)

    // Gold Outer Border Frame
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 5
    ctx.strokeRect(20, 20, 810, 480)

    // Thin Inner Accent Border
    ctx.strokeStyle = '#ffffff22'
    ctx.lineWidth = 1
    ctx.strokeRect(28, 28, 794, 464)

    // Header Text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('KARTU NIKAH DIGITAL RESMI', 425, 65)

    ctx.fillStyle = '#38bdf8'
    ctx.font = '14px sans-serif'
    ctx.fillText('AVELIA CELESTIAL SANCTUARY • REGISTRY SYSTEM', 425, 90)

    // Line Separator
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(150, 105)
    ctx.lineTo(700, 105)
    ctx.stroke()

    const loadSafe = async (url) => {
      try {
        return await loadImage(url)
      } catch {
        try {
          return await loadImage(defaultPp)
        } catch {
          return null
        }
      }
    }

    // Avatar 1
    const img1 = await loadSafe(pp1)
    ctx.save()
    ctx.beginPath()
    ctx.arc(220, 220, 75, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    if (img1) {
      ctx.drawImage(img1, 145, 145, 150, 150)
    } else {
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(145, 145, 150, 150)
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 50px sans-serif'
      ctx.fillText('ᰔ', 220, 235)
    }
    ctx.restore()

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(220, 220, 75, 0, Math.PI * 2, true)
    ctx.stroke()

    // Avatar 2
    const img2 = await loadSafe(pp2)
    ctx.save()
    ctx.beginPath()
    ctx.arc(630, 220, 75, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    if (img2) {
      ctx.drawImage(img2, 555, 145, 150, 150)
    } else {
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(555, 145, 150, 150)
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 50px sans-serif'
      ctx.fillText('ᰔ', 630, 235)
    }
    ctx.restore()

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(630, 220, 75, 0, Math.PI * 2, true)
    ctx.stroke()

    // Center Emblem (Heart Symbol)
    ctx.fillStyle = '#f43f5e'
    ctx.font = 'bold 45px sans-serif'
    ctx.fillText('♡', 425, 230)

    // Names Below Avatars
    const name1 = await conn.getName(who)
    const name2 = await conn.getName(partnerJid)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(name1.length > 15 ? name1.substring(0, 15) + '...' : name1, 220, 345)
    ctx.fillText(name2.length > 15 ? name2.substring(0, 15) + '...' : name2, 630, 345)

    // Marriage Details
    const durStr = formatDuration(Date.now() - pList[0].nikahTime)
    const dateStr = new Date(pList[0].nikahTime).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })

    ctx.fillStyle = '#f8fafc'
    ctx.font = '16px sans-serif'
    ctx.fillText(`Tanggal Pernikahan : ${dateStr}`, 425, 395)
    ctx.fillText(`Durasi Pernikahan  : ${durStr}`, 425, 425)

    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText(`STATUS: OFFICIAL & SAH (${(pList[0].cincin || 'Cincin Perak').toUpperCase()})`, 425, 460)

    const buffer = canvas.toBuffer('image/png')
    const whoNum = who.split('@')[0].replace(/\D/g, '')
    const partnerNum = partnerJid.split('@')[0].replace(/\D/g, '')

    const caption = `*──  ୨୧ ✧ KARTU NIKAH DIGITAL ✧ ୨୧  ──*

*╭  〔 ᰔ ᴘ ɪ ᴀ ɢ ᴀ ᴍ  ʀ ᴇ ꜱ ᴍ ɪ 〕*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ : @${whoNum} ♡ @${partnerNum}
*┆* ✧ ꜱᴛᴀᴛᴜꜱ   : Resmi Tercatat di Database Bot
*┆* ✦ ᴄɪɴᴄɪɴ   : ${pList[0].cincin || 'Cincin Perak'}
*╰───────────────*

> ｡˚ ⊹ _Semoga ikatan cinta ini abadi dan senantiasa harmonis_ ⊹ ˚ ｡`.trim()

    return conn.sendFile(m.chat, buffer, 'kartu-nikah.png', caption, m, false, { mentions: [who, partnerJid] })
  } catch (e) {
    console.error('[KARTU NIKAH ERROR]:', e)
    return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Terjadi kendala saat mencetak Kartu Nikah Digital.\n*╰───────────────*')
  }
}

handler.help = ['kartunikah', 'bukunikah']
handler.tags = ['pasangan']
handler.command = /^(kartunikah|bukunikah)$/i

export default handler
