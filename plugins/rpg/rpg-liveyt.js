import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function normalizeYoutube(data = {}) {
  return {
    name: data.name || '',
    level: Number(data.level || 1),
    roomLevel: Number(data.roomLevel || 0),
    content: data.content || 'streamer',
    gender: data.gender || 'none',
    subs: Number(data.subs || 0),
    views: Number(data.views || 0),
    likes: Number(data.likes || 0),
    income: Number(data.income || 0),
    lastLive: Number(data.lastLive || 0),
    lastCollab: Number(data.lastCollab || data.lastKolab || 0),
    lastKolab: Number(data.lastCollab || data.lastKolab || 0),
    createdAt: Number(data.createdAt || Date.now())
  }
}

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}

  const youtube = normalizeYoutube(wdb.users[m.sender].youtube || {})
  wdb.users[m.sender].youtube = youtube

  if (!youtube.name) return m.reply(`╭─❏「 ❌ LIVE YOUTUBE 」❏
│ Kamu belum punya channel.
│ ↳ Buat dulu dengan *.buatyt [nama]* atau *.room create [nama]*
╰─━━━━━━━━━━━━━━─`)

  if (!text) return m.reply(`╭─❏「 ❌ LIVE YOUTUBE 」❏
│ Kamu harus menyertakan judul untuk mulai live streaming.
╰─━━━━━━━━━━━━━━─`)

  const cooldown = 60000
  if (Date.now() - youtube.lastLive < cooldown) {
    const sisa = Math.ceil((cooldown - (Date.now() - youtube.lastLive)) / 1000)
    return m.reply(`╭─❏「 ⏳ LIVE COOLDOWN 」❏
│ Harap tunggu *${sisa} detik* lagi.
╰─━━━━━━━━━━━━━━─`)
  }

  const roomBoost = 1 + (youtube.roomLevel || 0) * 0.12
  const contentBoost = {
    streamer: 1,
    gaming: 1.35,
    vlog: 1.2,
    entertainment: 1.3,
    music: 1.25,
    food: 1.25,
    tech: 1.3,
    education: 1.3,
    beauty: 1.25,
    fitness: 1.2,
    automotive: 1.25,
    travel: 1.2,
    fashion: 1.25,
    reaction: 1.15,
    podcast: 1.2,
    art: 1.2,
    diy: 1.2,
    experiment: 1.25,
    animal: 1.15,
    lifestyle: 1.2
  }[youtube.content] || 1

  const moneyGain = Math.floor((Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000) * roomBoost * contentBoost)
  const viewers = Math.floor((Math.floor(Math.random() * 10000) + 500) * roomBoost)
  const likesGain = Math.floor(viewers * (Math.random() * (0.4 - 0.1) + 0.1))
  const subsGain = Math.floor(viewers / 10)
  const xpGain = Math.floor(moneyGain / 10)

  youtube.subs += subsGain
  youtube.views += viewers
  youtube.likes = (youtube.likes || 0) + likesGain
  youtube.lastLive = Date.now()
  youtube.lastKolab = youtube.lastCollab

  if (!wdb.money) wdb.money = {}
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + moneyGain

  const newLevel = Math.floor(youtube.subs / 10000) + 1
  if (newLevel > youtube.level) {
    youtube.level = newLevel
    m.reply(`╭─❏「 📺 LEVEL UP 」❏
│ [ Channel Level ] Lv.${newLevel}
╰─━━━━━━━━━━━━━━─`)
  }

  saveDB(wdb)

let caption = `╭─❏「 📡 LIVE STREAMING 」❏\n`
caption += `│ 🎬 *${text}*\n`
caption += `│ 📺 *${youtube.name}*\n`
caption += `╰─━━━━━━━━━━━━━━─\n\n`

caption += `📊 *HASIL LIVE*\n`
caption += `> ↳ 👁️ Viewers : +${viewers.toLocaleString()}\n`
caption += `> ↳ 👍 Likes : +${likesGain.toLocaleString()}\n`
caption += `> ↳ 👥 Subscribers : +${subsGain.toLocaleString()}\n`
caption += `> ↳ 💰 Gaji : +Rp ${moneyGain.toLocaleString()}\n`
caption += `> ↳ ✨ Exp : +${xpGain.toLocaleString()}\n\n`

caption += `📌 *INFORMASI LIVE*\n`
caption += `> ↳ Room : *${youtube.content || 'streamer'}* / *Lv.${youtube.roomLevel || 0}*\n`
caption += `> ↳ ⏰ Live Selesai : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n`

caption += `─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, caption, 'https://c.termai.cc/i165/qxnHa.jpg')
}

handler.help = ['liveyt <judul>', 'livestreamyt <judul>']
handler.command = ['liveyt', 'livestreamyt']
handler.tags = ['rpg']

export default handler
