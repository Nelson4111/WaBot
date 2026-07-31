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
    let [inputNum, inputTime] = text.trim().split(/\s+/)
    if (inputNum && !isNaN(inputNum.replace(/[^0-9]/g, ''))) {
        who = inputNum.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        time = inputTime
    }
  }

  if (!who) return conn.sendMessage(m.chat, { text: `⚠️ User tidak ditemukan!\n\nContoh:\n1. Reply: *${usedPrefix + command}* 30d\n2. Nomor: *${usedPrefix + command}* 628xxx 30d` }, { quoted: m })
  
  // Cek apakah user ada di database
  if (!global.db.data.users[who]) {
    return conn.sendMessage(m.chat, { text: `❌ Gagal! User @${who.split('@')[0]} tidak terdaftar di database bot.` }, { quoted: m })
  }

  if (!time) return conn.sendMessage(m.chat, { text: `⚠️ Tentukan durasi!\nContoh: *${usedPrefix + command}* 30d` }, { quoted: m })

  let duration = ms(time)
  if (!duration) return conn.sendMessage(m.chat, { text: '⚠️ Format waktu salah! (d/h/m/s)' }, { quoted: m })
  
  let user = global.db.data.users[who]
  let now = Date.now()

  if (user.premiumTime > now) {
    user.premiumTime += duration
  } else {
    user.premiumTime = now + duration
  }
  
  user.premium = true
  user.role = 'Premium user'

  let expiryDate = new Date(user.premiumTime).toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    dateStyle: 'full',
    timeStyle: 'short'
  })

  let txt = `✅ *PREMIUM ADDED*\n\n` +
            `👤 *User:* ${who.split('@')[0]}\n` +
            `*Tambahan:* ${time}\n` +
            `*Berakhir:* ${expiryDate}`

  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.help = ['addprem']
handler.tags = ['owner']
handler.command = /^addprem$/i
handler.rowner = true

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