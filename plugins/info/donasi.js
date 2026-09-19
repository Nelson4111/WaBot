import fs from 'fs'
import path from 'path'
import { getGreeting } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, usedPrefix: _p, text = '', isOwner, isROwner }) => {
  if (/^(cek|check|status)[ -]?premium$/i.test(text.trim())) {
    if (!(isOwner || isROwner)) {
      return m.reply('❌ Fitur ini hanya dapat digunakan Owner bot.')
    }

    const users = (global.db && global.db.data && global.db.data.users) || {}
    const donors = Object.entries(users).filter(([_, user]) => user.totalDonasi > 0)
    const now = Date.now()
    let activePremium = 0
    let repairedPremium = 0
    const repairedUsers = []

    for (const [jid, user] of donors) {
      const hasPermanentPremium = user.premium === true && user.premiumTime >= 9999999999999
      if (hasPermanentPremium) {
        activePremium++
        continue
      }

      user.premium = true
      user.premiumTime = 9999999999999
      user.role = 'Premium user'
      repairedPremium++
      repairedUsers.push(jid)
    }

    const repairedList = repairedUsers.length > 0
      ? `\n\n✅ Premium diaktifkan untuk: ${repairedUsers.map(jid => `@${jid.split('@')[0]}`).join(', ')}`
      : ''
    return m.reply(`🔎 *STATUS PREMIUM DONATUR*\n\n> Total donatur: *${donors.length}*\n> Sudah premium permanen: *${activePremium}*\n> Diperbaiki menjadi premium: *${repairedPremium}*${repairedList}`, null, { mentions: repairedUsers })
  }

  const name = m.name || m.pushName || await conn.getName(m.sender) || 'Sobat'

  // 1. Ambil Gambar QRIS
  let imgPath = path.join(process.cwd(), 'media', 'QR_Desain.jpeg')
  let image = null
  if (fs.existsSync(imgPath)) {
    try {
      image = fs.readFileSync(imgPath)
    } catch {}
  }
  if (!image) {
    let fallbackPath = path.join(process.cwd(), 'media', 'menu.jpg')
    if (fs.existsSync(fallbackPath)) {
      try {
        image = fs.readFileSync(fallbackPath)
      } catch {}
    }
  }

  // 2. Data Pemilik Bot & Donasi Global
  let ownNum = global.nomorown || '79223679360'
  let ownJid = ownNum + '@s.whatsapp.net'

  const users = (global.db && global.db.data && global.db.data.users) || {}
  const donorList = Object.values(users).filter(u => u.totalDonasi && u.totalDonasi > 0)
  const totalDonatur = donorList.length
  const totalDana = donorList.reduce((acc, u) => acc + (u.totalDonasi || 0), 0)

  // 3. Salam Waktu & Kaomoji Dinamis
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const hour = d.getHours()
  let greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴍᴀʟᴀᴍ'
  if (hour >= 4 && hour < 11) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ'
  else if (hour >= 11 && hour < 15) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱɪᴀɴɢ'
  else if (hour >= 15 && hour < 18) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱᴏʀᴇ'

  const userGreeting = getGreeting(name, hour)

  // 4. Kartu Statistik Donasi
  let statsCard = ''
  if (totalDonatur > 0) {
    statsCard = `*╭  〔 ⌬ ꜱ ᴛ ᴀ ᴛ ɪ ꜱ ᴛ ɪ ᴋ  ᴅ ᴏ ɴ ᴀ ꜱ ɪ 〕*
*┆* ⟡ ᴛᴏᴛᴀʟ ᴅᴏɴᴀᴛᴜʀ  : *${toSmallNum(totalDonatur)} Orang*
*┆* ✧ ᴅᴀɴᴀ ᴛᴇʀᴋᴜᴍᴘᴜʟ : *Rp ${toSmallNum(totalDana.toLocaleString('id-ID'))}*
*┆* ✦ ᴘᴀᴘᴀɴ ᴅᴏɴᴀᴛᴜʀ  : *Ketik ${_p}thanksto*
*╰──────────────────────*`
  } else {
    statsCard = `*╭  〔 ⌬ ꜱ ᴛ ᴀ ᴛ ɪ ꜱ ᴛ ɪ ᴋ  ᴅ ᴏ ɴ ᴀ ꜱ ɪ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ ᴅᴏɴᴀꜱɪ  : *Jadilah donatur pertama!*
*┆* ✧ ᴘᴀᴘᴀɴ ᴅᴏɴᴀᴛᴜʀ  : *Ketik ${_p}thanksto*
*╰──────────────────────*`
  }

  // 5. Susun Pesan Berdasarkan STYLE_GUIDE.md (Zen Shinto Aesthetic)
  let caption = `*──  ୨୧ ✧ ᴅ ᴏ ɴ ᴀ ꜱ ɪ ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> ${greetingWaktu} *${name}* ♡
> ${userGreeting}

> _Dukungan sukarela dari Anda sangat berharga demi kelancaran operasional server, pemeliharaan sistem, dan pengembangan fitur ${global.namebot}._

*╭  〔 ❖ ᴍ ᴇ ᴛ ᴏ ᴅ ᴇ 〕*
> ⟡ ᴊᴀʟᴜʀ      : *QRIS (All Payment)*
> ◈ ᴄᴀʀᴀ ʙᴀʏᴀʀ : *Scan barcode QRIS pada gambar di atas*
*╰────────────────────*

*╭  〔 ᰔ ᴘ ᴀ ɴ ᴅ ᴜ ᴀ ɴ 〕*
> ⟡ ʟᴀɴɢᴋᴀʜ 𝟷 : *Simpan bukti transfer / struk pembayaran*
> ✧ ʟᴀɴɢᴋᴀʜ 𝟸 : *Kirim gambar bukti transfer di grup atau nomer .owner*
> ✦ ʟᴀɴɢᴋᴀʜ 𝟹 : *Beri caption teks berikut jika ingin mengganti nama samaran:*

> \`${_p}konfirmasidonasi nominal | nama\`
> _Contoh:_ \`${_p}konfirmasidonasi 50000 | Org baik\`

> ◈ ᴄᴀᴛᴀᴛᴀɴ   : *Nama samaran bersifat opsional*
*╰────────────────────*

*╭  〔 ✮ ʙ ᴇ ɴ ᴇ ꜰ ɪ ᴛ  ᴅ ᴏ ɴ ᴀ ᴛ ᴜ ʀ 〕*
> ⟡ ᴛᴏᴘ ᴅᴏɴᴀᴛᴜʀ  : *Tercatat di papan peringkat menu*
> ✧ ʟᴇɴᴄᴀɴᴀ ɪᴋᴏɴ : *Mendapat badge kehormatan di .thanksto*
> ✦ ᴜʙᴀʜ ɴᴀᴍᴀ    : *Bisa ganti nama via ${_p}setnamadonasi*
> ◈ ᴘʀᴇᴍɪᴜᴍ     : *Mendapatkan premium permanen untuk saat ini*
> ◈ ᴀᴘʀᴇꜱɪᴀꜱɪ    : *Dukungan penuh kelangsungan server*
*╰────────────────────*

${statsCard}

> ｡˚ ⊹ *ᴛᴇʀɪᴍᴀ ᴋᴀꜱɪʜ ᴀᴛᴀꜱ ᴋᴇʙᴀɪᴋᴀɴ & ᴅᴜᴋᴜɴɢᴀɴ ᴀɴᴅᴀ* ⊹ ˚ ｡`.trim()

  const mentions = [ownJid, m.sender]
  const footer = `${global.namebot} • Dukungan & Operasional Server`
  const buttons = [
    ['ᰔ Papan Donatur', `${_p}thanksto`],
    ['⟡ Menu Utama', `${_p}allmenu`]
  ]

  // 6. Coba kirim via ButtonV2 jika didukung
  let sent = false
  if (typeof conn.sendButtonV2 === 'function' && image) {
    try {
      await conn.sendButtonV2(m.chat, {
        text: caption,
        footer,
        image,
        buttons,
        mentions
      }, m)
      sent = true
    } catch (errBtn) {
      console.warn('[sendButtonV2 donasi error]:', errBtn?.message || errBtn)
      sent = false
    }
  }

  // 7. Fallback standar: Kirim gambar QRIS langsung dengan caption rapi
  if (!sent) {
    if (image) {
      await conn.sendMessage(m.chat, {
        image,
        caption,
        mentions
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: caption,
        mentions
      }, { quoted: m })
    }
  }
}

handler.help = ['donasi']
handler.tags = ['main', 'info']
handler.command = /^(donasi|donate)$/i

export default handler