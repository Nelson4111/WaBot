import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { args, conn }) => {
  const db = loadDB()
  const uid = args[0]
  if (!uid) {
    return status.warning(m, 'Masukkan UID foto profil waifu yang ingin ditolak!', [
      'Contoh: *.waifutolakpp 118763*'
    ])
  }

  const d = db.pendingPP?.[uid]
  if (!d) {
    return status.error(m, 'Data antrean foto profil untuk UID tersebut tidak ditemukan.')
  }

  const label = d.isHusbu ? 'Husbu' : 'Waifu'
  const partnerLabel = d.isHusbu ? 'husbu' : 'waifu'

  delete db.pendingPP[uid]
  saveDB(db)

  try {
    const userMsg = `*╭  〔 ❌ ᴘ ᴘ  ${label.toUpperCase()}  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*
*┆* ⟡ ᴋᴀʀᴀᴋᴛᴇʀ : *${d.charName}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(uid)}*
*╰───────────────*
> Mohon maaf, permintaan foto profil ${partnerLabel} kamu ditolak oleh Owner. Pastikan gambar sopan dan berkualitas baik.`
    await conn.sendMessage(d.userJid, { text: userMsg })
  } catch {}

  status.info(m, `Permintaan foto profil untuk *${d.charName}* (#${toSmallNum(uid)}) telah ditolak.`)
}

handler.command = ['waifutolakpp', 'tolakpp', 'husbutolakpp']
handler.tags = ['waifu', 'husbu']
handler.help = ['waifutolakpp <uid>', 'husbutolakpp <uid>']
handler.owner = true

export default handler