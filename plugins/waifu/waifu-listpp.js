import { loadDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m) => {
  const db = loadDB()
  const pending = db.pendingPP || {}

  const entries = Object.values(pending)
  if (!entries.length) {
    return status.info(m, 'Tidak ada antrean foto profil waifu yang menunggu verifikasi.')
  }

  let text = `*╭  〔 📋 ᴀ ɴ ᴛ ʀ ᴇ ᴀ ɴ  ᴘ ᴘ  ᴡ ᴀ ɪ ꜰ ᴜ / ʜ ᴜ ꜱ ʙ ᴜ 〕*\n`
  entries.forEach((v, i) => {
    const num = v.userJid.split('@')[0]
    const tipe = v.isHusbu ? 'Husbu' : 'Waifu'
    text += `*┆* ⟡ ${toSmallNum(i + 1)}. *${v.charName}* [${tipe}] (#${toSmallNum(v.charId)})\n`
    text += `*┆*   ╰ ᴘᴇᴍᴏʜᴏɴ : @${num}\n`
  })
  text += `*╰───────────────*\n`
  text += `> Ketik *.waifuterimapp <uid>* atau *.husbuterimapp <uid>* untuk menerima, atau tolak dengan *.waifutolakpp <uid>*.`

  m.reply(text, null, { mentions: entries.map(e => e.userJid) })
}

handler.command = ['waifulistpp', 'listpp', 'husbulistpp']
handler.tags = ['waifu', 'husbu']
handler.help = ['waifulistpp', 'husbulistpp']
handler.owner = true

export default handler