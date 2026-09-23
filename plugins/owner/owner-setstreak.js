import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let who, amount
  let args = text.trim().split(/\s+/)

  if (m.quoted) {
    who = m.quoted.sender
    amount = args[0]
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
    amount = args[1] || args[0]
  } else {
    if (args.length < 2) {
      return m.reply(
        `*──「 OWNER EDIT STREAK 」──*\n\n` +
        `Gunakan perintah ini untuk memulihkan atau mengubah daily streak user.\n\n` +
        `📌 *Contoh Penggunaan:*\n` +
        `> ↳ *${usedPrefix}${command} @tag 30*\n` +
        `> ↳ *${usedPrefix}${command} 628123456789 30*\n` +
        `> ↳ Reply pesan user: *${usedPrefix}${command} 30*`
      )
    }
    who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    amount = args[1]
  }

  // Standardisasi JID target jika berbentuk LID
  if (who.endsWith('@lid')) {
    const cleanLid = who.split(':')[0].replace(/@.+/, '') + '@lid'
    who = (global.lids?.[who] || global.lids?.[cleanLid] || global.db?.data?.lids?.[who] || global.db?.data?.lids?.[cleanLid] || who)
  }
  if (who.includes('@s.whatsapp.net')) {
    who = who.split('@')[0].split(':')[0] + '@s.whatsapp.net'
  }

  amount = parseInt(String(amount || '').replace(/[^0-9-]/g, ''))
  if (isNaN(amount) || amount < 0) {
    return m.reply('❌ Masukkan angka streak yang valid (minimal 0).')
  }

  if (!wdb.users[who]) wdb.users[who] = {}
  const account = wdb.users[who]
  if (!account.rpg) account.rpg = {}
  const rpg = account.rpg

  const oldStreak = Number(account.dailyStreak) || Number(rpg.dailyStreak) || 0
  let newStreak = amount

  if (command === 'addstreak') {
    newStreak = oldStreak + amount
  }

  account.dailyStreak = newStreak
  rpg.dailyStreak = newStreak

  await saveDB(wdb)

  let name = conn.getName(who) || who.split('@')[0]
  let cap = `*──「 STREAK DIUBAH 」──*\n\n`
  cap += `👤 *User*: ${name} (@${who.split('@')[0]})\n`
  cap += `🔥 *Streak Lama*: ${oldStreak} hari\n`
  cap += `✨ *Streak Baru*: ${newStreak} hari\n`
  cap += `🛠️ *Aksi*: ${command === 'addstreak' ? `Ditambah +${amount}` : `Disetel ke ${amount}`}\n\n`
  cap += `✅ Data berhasil disimpan ke database.`

  return m.reply(cap, null, { mentions: [who] })
}

handler.help = ['setstreak <@tag/nomor> <jumlah>', 'addstreak <@tag/nomor> <jumlah>']
handler.tags = ['owner', 'rpg']
handler.command = ['setstreak', 'editstreak', 'addstreak']
handler.owner = true

export default handler
