import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { text }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  
  let userYT = wdb.users[m.sender]

  if (userYT.youtube) return m.reply(`KESALAHAN: Kamu sudah memiliki channel: ${userYT.youtube.name}`)
  if (!text) return m.reply(`*───「 BUAT CHANNEL 」───*\n\nSilakan masukkan nama channel kamu!\nContoh: .buatyt Windah KW`)

  userYT.youtube = {
    name: text,
    subs: 0,
    views: 0,
    likes: 0, 
    level: 1,
    lastLive: 0,
    lastKolab: 0
  }

  saveDB(wdb)
  
  let teks = `*「 CHANNEL CREATED 」*\n\n`
  teks += `Selamat! Channel ${text} resmi dibuka.\n`
  teks += `Gunakan command *.liveyt judul* untuk mulai.`
  
  m.reply(teks)
}

handler.help = ['buatyt <nama>']
handler.command = ['buatyt']
handler.tags = ['rpg']

export default handler
