import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text }) => {
  const wdb = loadDB()
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
  
  if (!who) return m.reply('KESALAHAN: Tag atau balas pesan orang yang ingin diajak kolaborasi!')
  if (!wdb.users?.[m.sender]?.youtube || !wdb.users?.[who]?.youtube) return m.reply('KESALAHAN: Salah satu dari kalian belum punya channel!')
  if (who === m.sender) return m.reply('KESALAHAN: Tidak bisa kolaborasi dengan diri sendiri.')

  let ytA = wdb.users[m.sender].youtube
  let cooldown = 60000 
  if (Date.now() - (ytA.lastKolab || 0) < cooldown) {
    let sisa = (cooldown - (Date.now() - ytA.lastKolab)) / 1000
    return m.reply(`COOLDOWN: Harap tunggu ${sisa.toFixed(0)} detik.`)
  }

  let moneyGain = Math.floor(Math.random() * (200000 - 50000 + 1)) + 50000
  let viewers = Math.floor(Math.random() * 20000) + 2000
  let likesGain = Math.floor(viewers * (Math.random() * (0.5 - 0.2) + 0.2)) // Like kolab lebih besar 20-50%
  let subsGain = Math.floor(viewers / 8)
  let xpGain = Math.floor(moneyGain / 10)

  if (!wdb.money) wdb.money = {}
  
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
    if (nLvl > yt.level) yt.level = nLvl

    if (global.db.data.users[jid]) {
      global.db.data.users[jid].exp = (global.db.data.users[jid].exp || 0) + xpGain
    }
  })

  saveDB(wdb)

  let teks = `*「 COLLABORATION 」*\n\n`
  teks += `Partner: ${ytA.name} x ${wdb.users[who].youtube.name}\n\n`
  teks += `Hasil Kolaborasi:\n`
  teks += `┌ *Viewers*: ${viewers.toLocaleString()}\n`
  teks += `│ *Likes*: +${likesGain.toLocaleString()}\n`
  teks += `│ *Subs* Baru: +${subsGain.toLocaleString()}\n`
  teks += `│ *Gaji*: Rp ${moneyGain.toLocaleString()}\n`
  teks += `└ *Exp*: +${xpGain.toLocaleString()}\n\n`
  teks += `Status: Kolaborasi Berhasil`

  conn.reply(m.chat, teks, m, { mentions: [m.sender, who] })
}

handler.help = ['kolab <reply>']
handler.command = ['kolab', 'collab']
handler.tags = ['rpg']

export default handler
