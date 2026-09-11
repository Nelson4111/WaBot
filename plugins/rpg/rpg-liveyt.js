import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  if (!wdb.users?.[m.sender]?.youtube) return m.reply(`╭─❏「 ❌ LIVE YOUTUBE 」❏
│ Kamu belum punya channel.
│ ↳ Buat dulu dengan *.buatyt [nama]*
╰─━━━━━━━━━━━━━━─`)

  if (!text) return m.reply(`╭─❏「 ❌ LIVE YOUTUBE 」❏
│ Kamu harus menyertakan judul untuk mulai live streaming.
╰─━━━━━━━━━━━━━━─`)

  let youtube = wdb.users[m.sender].youtube
  let cooldown = 60000
  if (Date.now() - youtube.lastLive < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - youtube.lastLive)) / 1000)
    return m.reply(`╭─❏「 ⏳ LIVE COOLDOWN 」❏
│ Harap tunggu *${sisa} detik* lagi.
╰─━━━━━━━━━━━━━━─`)
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
   m.reply(`╭─❏「 📺 LEVEL UP 」❏
│ [ Channel Level ] Lv.${newLevel}
╰─━━━━━━━━━━━━━━─`)
  }

  saveDB(wdb)

  let caption = `╭─❏「 📡 LIVE STREAMING 」❏
│ 🎬 Judul: *${text}*
│ 📺 Channel: *${youtube.name}*
╰─━━━━━━━━━━━━━━─

📊 *HASIL LIVE*
> 👁️ Viewers: +${viewers.toLocaleString()}
> 👍 Likes: +${likesGain.toLocaleString()}
> 👥 Subscribers: +${subsGain.toLocaleString()}
> 💰 Gaji: +Rp ${moneyGain.toLocaleString()}
> ✨ Exp: +${xpGain.toLocaleString()}

─━━━━━━━━━━━━━━─
⏰ *Live Selesai:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`

  return sendRpgMsg(conn, m, caption, 'https://c.termai.cc/i165/qxnHa.jpg')
}

handler.help = ['liveyt <judul>']
handler.command = ['liveyt']
handler.tags = ['rpg']

export default handler
