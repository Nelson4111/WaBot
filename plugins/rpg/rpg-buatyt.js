import { loadDB, saveDB } from '../../lib/waifuHelper.js'

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

let handler = async (m, { text }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}

  const userYT = wdb.users[m.sender]
  const existing = normalizeYoutube(userYT.youtube || {})

  if (existing.name) {
    userYT.youtube = existing
    saveDB(wdb)
    return m.reply(`KESALAHAN: Kamu sudah memiliki channel: *${existing.name}*\n> Gunakan *.akunyt*, *.liveyt*, *.kolab*, atau *.room* untuk lanjut.`)
  }

  if (!text) return m.reply(`╭─❏「 📺 BUAT CHANNEL 」❏\n├ Masukkan nama channel kamu.\n├ Contoh : .buatyt Windah KW\n╰─━━━━━━━━━━━━━━─`)

  userYT.youtube = normalizeYoutube({
    ...existing,
    name: text,
    subs: 0,
    views: 0,
    likes: 0,
    level: 1,
    roomLevel: 0,
    content: 'streamer',
    gender: 'none',
    income: 0,
    lastLive: 0,
    lastCollab: 0,
    lastKolab: 0,
    createdAt: Date.now()
  })

  saveDB(wdb)

 let teks = `╭─❏「 📺 CHANNEL CREATED 」❏\n`
teks += `│ 📺 *${text}*\n`
teks += `╰─━━━━━━━━━━━━━━─\n\n`

teks += `📌 *LANGKAH BERIKUTNYA*\n`
teks += `> ↳ *.room content list* untuk memilih konten.\n`
teks += `> ↳ *.liveyt judul* untuk mulai live.\n\n`

teks += `─━━━━━━━━━━━━━━─`

  m.reply(teks)
}

handler.help = ['buatyt <nama>', 'createyt <nama>']
handler.command = ['buatyt', 'createyt']
handler.tags = ['rpg']

export default handler
