import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

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

  let ytA = wdb.users[m.sender].youtube
  let ytB = wdb.users[who].youtube

  let cooldown = 60000
  let elapsed = Date.now() - (ytA.lastKolab || 0)

  if (elapsed < cooldown) {
    let sisa = Math.ceil((cooldown - elapsed) / 1000)

    return m.reply(
      `╭─❏「 ⏳ COLLAB COOLDOWN 」❏\n` +
      `│ Harap tunggu *${sisa} detik* lagi.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  let moneyGain = Math.floor(
    Math.random() * (200000 - 50000 + 1)
  ) + 50000

  let viewers = Math.floor(Math.random() * 20000) + 2000

  let likesGain = Math.floor(
    viewers * (Math.random() * (0.5 - 0.2) + 0.2)
  )

  let subsGain = Math.floor(viewers / 8)
  let xpGain = Math.floor(moneyGain / 10)

  if (!wdb.money) {
    wdb.money = {}
  }

  const participants = [m.sender, who]

  participants.forEach(jid => {
    let yt = wdb.users[jid].youtube

    yt.subs += subsGain
    yt.views += viewers
    yt.likes = (yt.likes || 0) + likesGain
    yt.lastKolab = Date.now()
    yt.lastLive = Date.now()

    wdb.money[jid] = (wdb.money[jid] || 0) + moneyGain

    let nLvl = Math.floor(yt.subs / 10000) + 1

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

handler.help = ['kolab <reply>']
handler.command = ['kolab', 'collab']
handler.tags = ['rpg']

export default handler