import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  if (!wdb.users?.[m.sender]?.youtube) return m.reply('KESALAHAN: Kamu belum punya channel! Buat dulu dengan .buatyt [nama]')
  if (!text) return m.reply('KESALAHAN: Kamu harus menyertakan judul untuk mulai live streaming!')

  let youtube = wdb.users[m.sender].youtube
  let cooldown = 60000 
  if (Date.now() - youtube.lastLive < cooldown) {
    let sisa = (cooldown - (Date.now() - youtube.lastLive)) / 1000
    return m.reply(`COOLDOWN: Istirahat dulu selama ${sisa.toFixed(0)} detik lagi.`)
  }

  let moneyGain = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
  let viewers = Math.floor(Math.random() * 10000) + 500
  let likesGain = Math.floor(viewers * (Math.random() * (0.4 - 0.1) + 0.1))
  let subsGain = Math.floor(viewers / 10)
  let xpGain = Math.floor(moneyGain / 10)

  youtube.subs += subsGain
  youtube.views += viewers
  youtube.likes = (youtube.likes || 0) + likesGain
  youtube.lastLive = Date.now()
  if (!wdb.money) wdb.money = {}
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + moneyGain

  let newLevel = Math.floor(youtube.subs / 10000) + 1
  if (newLevel > youtube.level) {
    youtube.level = newLevel
    m.reply(`*───「 LEVEL UP 」───*\nChannel kamu naik ke Level ${newLevel}`)
  }

  saveDB(wdb)

  let user = global.db.data.users[m.sender]
  if (user) user.exp = (user.exp || 0) + xpGain

  let caption = `*───「 LIVE STREAMING 」───*\n\n`
  caption += `Judul: "${text}"\n`
  caption += `Channel: ${youtube.name}\n\n`
  caption += `Statistik Live:\n`
  caption += `┌ *Viewers*: ${viewers.toLocaleString()}\n`
  caption += `│ *Likes*: +${likesGain.toLocaleString()}\n`
  caption += `│ *Subs* Baru: +${subsGain.toLocaleString()}\n`
  caption += `│ *Gaji*: Rp ${moneyGain.toLocaleString()}\n`
  caption += `└ *Exp*: +${xpGain.toLocaleString()}\n\n`
  caption += `Live selesai pada ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`

  return sendRpgMsg(conn, m, caption.trim(), 'https://c.termai.cc/i174/Uwc')
}

handler.help = ['liveyt <judul>']
handler.command = ['liveyt']
handler.tags = ['rpg']

export default handler