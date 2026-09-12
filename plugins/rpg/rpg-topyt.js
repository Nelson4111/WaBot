import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'

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
  if (!wdb.users) return m.reply('KESALAHAN: Data tidak ditemukan.')

  const topYoutuber = Object.entries(wdb.users)
    .filter(([_, u]) => u.youtube && u.youtube.name)
    .map(([_, u]) => normalizeYoutube(u.youtube))
    .sort((a, b) => b.subs - a.subs)

  if (topYoutuber.length === 0) return m.reply('KESALAHAN: Belum ada YouTuber terdaftar.')

  let caption = `╭─❏「 🏆 TOP YOUTUBER 」❏\n`
  caption += `│ 🏆 *RANKING CHANNEL*\n`
  caption += `╰─━━━━━━━━━━━━━━─\n\n`

  topYoutuber.slice(0, 10).forEach((u, i) => {
    caption += `🏆 *${i + 1}. ${u.name}*\n`
    caption += `> ↳ Channel Level : Lv.${u.level}\n`
    caption += `> ↳ Room Level : Lv.${u.roomLevel || 0}\n`
    caption += `> ↳ Subscribers : ${u.subs.toLocaleString()}\n`
    caption += `> ↳ Likes : ${u.likes.toLocaleString()}\n`
    caption += `> ↳ Content : ${u.content}\n\n`
  })

  caption += `\n─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, caption.trim(), 'https://c.termai.cc/i174/Uwc')
}

handler.help = ['topyt', 'rankyt']
handler.command = ['topyt', 'rankyt']
handler.tags = ['rpg']

export default handler
