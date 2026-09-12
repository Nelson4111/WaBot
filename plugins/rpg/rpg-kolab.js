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

let handler = async (m, { conn }) => {
  const wdb = loadDB()

  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
      ? m.quoted.sender
      : null

  if (!who) {
    return m.reply(
      `╭─❏「 ❌ COLLABORATION 」❏\n` +
      `│ Tag atau balas pesan orang yang ingin diajak kolaborasi.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (!wdb.users?.[m.sender]?.youtube || !wdb.users?.[who]?.youtube) {
    return m.reply(
      `╭─❏「 ❌ COLLABORATION 」❏\n` +
      `│ Salah satu dari kalian belum memiliki channel YouTube.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (who === m.sender) {
    return m.reply(
      `╭─❏「 ❌ COLLABORATION 」❏\n` +
      `│ Tidak bisa melakukan kolaborasi dengan diri sendiri.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const ytA = normalizeYoutube(wdb.users[m.sender].youtube)
  const ytB = normalizeYoutube(wdb.users[who].youtube)

  wdb.users[m.sender].youtube = ytA
  wdb.users[who].youtube = ytB

  const cooldown = 60000
  const elapsed = Date.now() - (ytA.lastCollab || 0)

  if (elapsed < cooldown) {
    const sisa = Math.ceil((cooldown - elapsed) / 1000)

    return m.reply(
      `╭─❏「 ⏳ COLLAB COOLDOWN 」❏\n` +
      `│ Harap tunggu *${sisa} detik* lagi.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  const moneyGain = Math.floor(Math.random() * (200000 - 50000 + 1)) + 50000
  const viewers = Math.floor(Math.random() * 20000) + 2000
  const likesGain = Math.floor(viewers * (Math.random() * (0.5 - 0.2) + 0.2))
  const subsGain = Math.floor(viewers / 8)
  const xpGain = Math.floor(moneyGain / 10)

  if (!wdb.money) {
    wdb.money = {}
  }

  const participants = [m.sender, who]

  participants.forEach(jid => {
    const yt = normalizeYoutube(wdb.users[jid].youtube)

    yt.subs += subsGain
    yt.views += viewers
    yt.likes = (yt.likes || 0) + likesGain
    yt.lastCollab = Date.now()
    yt.lastKolab = yt.lastCollab
    yt.lastLive = Date.now()

    wdb.users[jid].youtube = yt
    wdb.money[jid] = (wdb.money[jid] || 0) + moneyGain

    const nLvl = Math.floor(yt.subs / 10000) + 1

    if (nLvl > yt.level) {
      yt.level = nLvl
    }

    if (global.db.data.users[jid]) {
      global.db.data.users[jid].exp =
        (global.db.data.users[jid].exp || 0) + xpGain
    }
  })

  saveDB(wdb)

  let teks = `╭─❏「 🤝 COLLABORATION 」❏\n`
  teks += `│ 🤝 Partner: *${ytA.name} x ${ytB.name}*\n`
  teks += `╰─━━━━━━━━━━━━━━─\n\n`

  teks += `📊 *HASIL KOLABORASI*\n`
  teks += `> 👁️ Viewers: +${viewers.toLocaleString()}\n`
  teks += `> 👍 Likes: +${likesGain.toLocaleString()}\n`
  teks += `> 👥 Subscribers: +${subsGain.toLocaleString()}\n`
  teks += `> 💰 Gaji: +Rp ${moneyGain.toLocaleString()}\n`
  teks += `> ✨ Exp: +${xpGain.toLocaleString()}\n`

  teks += `\n─━━━━━━━━━━━━━━─\n`
  teks += `✅ *Status:* Kolaborasi berhasil!`

  return sendRpgMsg(
    conn,
    m,
    teks,
    'https://c.termai.cc/i165/qxnHa.jpg',
    { mentions: [m.sender, who] }
  )
}

handler.help = ['kolab <reply>', 'collab <reply>']
handler.command = ['kolab', 'collab']
handler.tags = ['rpg']

export default handler
