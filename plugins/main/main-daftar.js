/*
✨ YuriPuki
💫 Nama Fitur: Daftar
🤖 Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

import { createHash } from 'crypto'
import moment from 'moment-timezone'

let Reg = /^(.+?)[,.](\d{1,3})$/i

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
      `Ketik dengan format:\n\n${usedPrefix + command} namamu,umurmu\n\nContoh:\n${usedPrefix + command} allen,16`
    )
  }

  let [, name, ageStr] = text.match(Reg)
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('*Nama atau umur tidak valid!*')
  if (name.length > 100) return m.reply('Nama maksimal 100 karakter.')
  if (age < 5 || age > 100) return m.reply('Umur harus antara 5 - 100 tahun.')

  user.name = name.trim()
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let caption = `
「 *PENDAFTARAN BERHASIL* 」
│ ✅ *Status:* Aktif
│ ✨ *Nama:* ${name}
│ 🎂 *Umur:* ${age} Tahun
│ 🔐 *SN Key:* ${sn}
│
│ 📅 *Tanggal:* ${week}, ${date}
│ ⏰ *Waktu:* ${wktuwib}

Data profil kamu sudah tersimpan di database.
`.trim()

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      footer: 'Pilih tombol di bawah untuk lanjut:',
      buttons: [
        {
          buttonId: '.allmenu',
          buttonText: { displayText: '📂 Menu Utama' },
          type: 1
        }
      ],
      contextInfo: {
        externalAdReply: {
          title: 'VESTIA ZETA MULTI DEVICE',
          body: '',
          thumbnailUrl: 'https://files.cloudkuimages.guru/images/3d592f58d437.jpeg',
          mediaType: 1,
          previewType: 'PHOTO',
          renderLargerThumbnail: true,
          sourceUrl: ''
        }
      }
    },
    { quoted: m }
  )
}

handler.help = ['daftar']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler
