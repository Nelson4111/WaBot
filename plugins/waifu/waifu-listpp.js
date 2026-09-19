import { loadDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m) => {
  const db = loadDB()
  const pending = db.pendingPP || {}

  const entries = Object.values(pending)
  if (!entries.length) {
    return status.info(m, 'Tidak ada antrean foto profil waifu yang menunggu verifikasi.')
  }

  let text = `*╭  〔 📋 ᴀ ɴ ᴛ ʀ ᴇ ᴀ ɴ  ᴘ ᴘ  ᴡ ᴀ ɪ ꜰ ᴜ 〕*\n`
  entries.forEach((v, i) => {
    const num = v.userJid.split('@')[0]
    text += `*┆* ⟡ ${toSmallNum(i + 1)}. *${v.charName}* (#${toSmallNum(v.charId)})\n`
    text += `*┆*   ╰ ᴘᴇᴍᴏʜᴏɴ : @${num}\n`
  })
  text += `*╰───────────────*\n`
  text += `> Ketik *.waifuterimapp <uid>* untuk menerima atau *.waifutolakpp <uid>* untuk menolak.`

  m.reply(text, null, { mentions: entries.map(e => e.userJid) })
}

handler.command = ['waifulistpp', 'listpp']
handler.tags = ['waifu']
handler.help = ['waifulistpp']
handler.owner = true

export default handler