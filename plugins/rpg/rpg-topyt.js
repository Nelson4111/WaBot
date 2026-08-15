import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  if (!wdb.users) return m.reply('KESALAHAN: Data tidak ditemukan.')

  let topYoutuber = Object.entries(wdb.users)
    .filter(([_, u]) => u.youtube)
    .map(([jid, u]) => ({ 
      name: u.youtube.name, 
      subs: u.youtube.subs,
      likes: u.youtube.likes || 0 
    }))
    .sort((a, b) => b.subs - a.subs)

  if (topYoutuber.length === 0) return m.reply('KESALAHAN: Belum ada YouTuber terdaftar.')

  let caption = `*───「 TOP YOUTUBER 」───*\n\n`
  topYoutuber.slice(0, 10).forEach((u, i) => {
    caption += `${i + 1}. ${u.name}\n`
    caption += `   *Subscribers*: ${u.subs.toLocaleString()}\n`
    caption += `   *Likes*: ${u.likes.toLocaleString()}\n\n`
  })

  return sendRpgMsg(conn, m, caption.trim(), 'https://c.termai.cc/i174/Uwc')
}

handler.help = ['topyt']
handler.command = ['topyt']
handler.tags = ['rpg']

export default handler
