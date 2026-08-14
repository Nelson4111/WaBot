/*
✨ YuriPuki
💫 Nama Fitur: Daftar
🤖 Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

import { createHash } from 'crypto'
import moment from 'moment-timezone'
import { createCanvas, loadImage } from 'canvas'

let Reg = /^(.+?)[,.]\s*(\d{1,3})$/i

let handler = async function (m, { text, usedPrefix, command, conn }) {
  let d = new Date(new Date() + 3600000)
  let locale = 'id'
  let week = d.toLocaleDateString(locale, { weekday: 'long' })
  let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let wktuwib = moment.tz('Asia/Jakarta').format('HH [H] mm [M] ss [S]')

  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (!text) {
    user.registered = true
    if (!user.name) user.name = m.name
    if (!user.regTime || user.regTime < 0) user.regTime = +new Date()
    return m.reply(
      `✅ Akun kamu sudah aktif otomatis.\n\nFitur daftar manual tidak wajib lagi.\nKalau mau update profil, pakai:\n${usedPrefix + command} namamu,umurmu\n\nSN: ${sn}`
    )
  }

  if (!Reg.test(text)) {
    return m.reply(
      `Ketik dengan format:\n\n${usedPrefix + command} namamu,umurmu\n\nContoh:\n${usedPrefix + command} nenel,16`
    )
  }

  let [, name, ageStr] = text.match(Reg)
  name = name.trim()
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('*Nama atau umur tidak valid!*')
  if (name.length > 100) return m.reply('Nama maksimal 100 karakter.')
  if (age < 5 || age > 100) return m.reply('Umur harus antara 5 - 100 tahun.')

  user.name = name.trim()
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let lidWarning = m.sender.endsWith('@lid') ? `\n\n⚠️ *Catatan:* Kamu mendaftar menggunakan WhatsApp Web (LID). Jika nanti di HP disuruh daftar lagi, tenang saja, sistem sedang mensinkronkan datamu secara otomatis.` : ''

  let caption = `
「 *PENDAFTARAN BERHASIL* 」
│ ✅ *Status:* Aktif
│ ✨ *Nama:* ${name}
│ 🎂 *Umur:* ${age} Tahun
│ 📱 *ID:* ${m.sender.split('@')[0]}
│ 🔐 *SN Key:* ${sn}
│
│ 📅 *Tanggal:* ${week}, ${date}
│ ⏰ *Waktu:* ${wktuwib}

Data profil kamu sudah tersimpan di database.${lidWarning}
`.trim()

  try {
    // Generate Canvas Registration Card
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
    let bgUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png' // Fallback bg just in case
    
    // Load images safely
    const bg = await loadImage(bgUrl).catch(_ => null)
    const avatar = await loadImage(pp).catch(_ => null)

    const canvas = createCanvas(800, 400)
    const ctx = canvas.getContext('2d')

    // Background
    if (bg) {
      ctx.drawImage(bg, 0, 0, 800, 400)
    } else {
      ctx.fillStyle = '#2c3e50'
      ctx.fillRect(0, 0, 800, 400)
    }

    // Dark overlay for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, 800, 400)

    // Avatar Circle
    if (avatar) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(150, 200, 100, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, 50, 100, 200, 200)
      ctx.restore()
    }

    // Avatar Border (Neon Green)
    ctx.beginPath()
    ctx.arc(150, 200, 100, 0, Math.PI * 2, true)
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 8
    ctx.stroke()

    // Texts
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 45px Arial'
    ctx.fillText('REGISTRATION SUCCESS', 300, 100)

    ctx.font = '30px Arial'
    ctx.fillStyle = '#AAAAAA'
    ctx.fillText(`Name:`, 300, 170)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(name, 420, 170)

    ctx.fillStyle = '#AAAAAA'
    ctx.fillText(`Age:`, 300, 220)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`${age} Years`, 420, 220)

    ctx.fillStyle = '#AAAAAA'
    ctx.fillText(`Number:`, 300, 270)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`+${m.sender.split('@')[0]}`, 440, 270)

    ctx.fillStyle = '#00FF00'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(`SN: ${sn.substring(0, 16)}...`, 300, 340)

    let buffer = canvas.toBuffer('image/png')
    
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: caption
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    // Fallback if canvas fails
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
  }
}

handler.help = ['daftar']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler
