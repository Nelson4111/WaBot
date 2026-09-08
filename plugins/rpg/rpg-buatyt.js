import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { text }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  
  let userYT = wdb.users[m.sender]

  if (userYT.youtube) return m.reply(`KESALAHAN: Kamu sudah memiliki channel: ${userYT.youtube.name}`)
  if (!text) return m.reply(`╭─❏「 📺 BUAT CHANNEL 」❏\n├ Masukkan nama channel kamu.\n├ Contoh : .buatyt Windah KW\n╰─━━━━━━━━━━━━━━─`)

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
  
  let teks = `╭─❏「 📺 CHANNEL CREATED 」❏\n`
  teks += `├[ Channel ] ${text}\n`
  teks += `├ Gunakan *.liveyt judul* untuk mulai.\n`
  teks += `╰─━━━━━━━━━━━━━━─`
  
  m.reply(teks)
}

handler.help = ['buatyt <nama>']
handler.command = ['buatyt']
handler.tags = ['rpg']

export default handler
