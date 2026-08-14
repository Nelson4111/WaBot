let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (m.mentionedJid && m.mentionedJid[0]) {
    return conn.sendMessage(m.chat, { text: `Silakan *Reply* pesan target atau masukkan *Nomor* secara manual.` }, { quoted: m })
  }

  let who
  let time

  if (m.quoted) {
    who = m.quoted.sender
    time = text ? text.trim() : null
  } else if (text) {
    let [inputNum, ...rest] = text.trim().split(/\s+/)
    if (inputNum && !isNaN(inputNum.replace(/[^0-9]/g, ''))) {
      who = inputNum.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      time = rest.join(' ')
    } else {
      who = m.quoted ? m.quoted.sender : null
      time = text.trim()
    }
  }

  if (!who) return conn.sendMessage(m.chat, { text: `⚠️ User tidak ditemukan!\n\nContoh:\n1. Reply: *${usedPrefix + command}* 30d\n2. Nomor: *${usedPrefix + command}* 628xxx 30d\n3. Permanen: *${usedPrefix + command}* 628xxx permanent` }, { quoted: m })
  
  // Cek apakah user ada di database
  if (!global.db.data.users[who]) {
    return conn.sendMessage(m.chat, { text: `❌ Gagal! User @${who.split('@')[0]} tidak terdaftar di database bot.` }, { quoted: m })
  }

  if (!time) return conn.sendMessage(m.chat, { text: `⚠️ Tentukan durasi!\nContoh:\n• 30 hari: *${usedPrefix + command}* 30d\n• Permanen/Unlimited: *${usedPrefix + command}* permanent` }, { quoted: m })

  let user = global.db.data.users[who]
  let isPermanent = /^(permanent|unlimited|selamanya|forever|perma)$/i.test(time.trim())

  let expiryDate = ''
  if (isPermanent) {
    user.premiumTime = 9999999999999 // ~Tahun 2286 (Permanen)
    expiryDate = 'Permanen (Selamanya) ♾️'
  } else {
    let duration = ms(time)
    if (!duration) return conn.sendMessage(m.chat, { text: '⚠️ Format waktu salah! Gunakan: d (hari), h (jam), m (menit), s (detik), atau *permanent*' }, { quoted: m })
    let now = Date.now()
    if (user.premiumTime > now && user.premiumTime < 9000000000000) {
      user.premiumTime += duration
    } else {
      user.premiumTime = now + duration
    }
    expiryDate = new Date(user.premiumTime).toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'short'
    })
  }
  
  user.premium = true
  user.role = 'Premium user'

  let txt = `✅ *PREMIUM ADDED*\n\n` +
            `👤 *User:* @${who.split('@')[0]}\n` +
            `⏱️ *Durasi:* ${isPermanent ? 'Permanen (Unlimited)' : time}\n` +
            `📅 *Berakhir:* ${expiryDate}`

  await conn.sendMessage(m.chat, { text: txt, mentions: [who] }, { quoted: m })
}

handler.help = ['addprem <user> <durasi/permanent>']
handler.tags = ['owner']
handler.command = /^addprem$/i
handler.owner = true

export default handler

function ms(str) {
  if (!str) return null
  let match = str.match(/^(\d+)(d|h|m|s)$/i)
  if (!match) return null
  let val = parseInt(match[1])
  let type = match[2].toLowerCase()
  switch (type) {
    case 'd': return val * 86400000
    case 'h': return val * 3600000
    case 'm': return val * 60000
    case 's': return val * 1000
    default: return null
  }
}