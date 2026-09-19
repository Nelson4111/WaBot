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

  delete db.pendingPP[uid]
  saveDB(db)

  try {
    const userMsg = `*╭  〔 ❌ ᴘ ᴘ  ᴡ ᴀ ɪ ꜰ ᴜ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*
*┆* ⟡ ᴋᴀʀᴀᴋᴛᴇʀ : *${d.charName}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(uid)}*
*╰───────────────*
> Mohon maaf, permintaan foto profil waifu kamu ditolak oleh Owner. Pastikan gambar sopan dan berkualitas baik.`
    await conn.sendMessage(d.userJid, { text: userMsg })
  } catch {}

  status.info(m, `Permintaan foto profil untuk *${d.charName}* (#${toSmallNum(uid)}) telah ditolak.`)
}

handler.command = ['waifutolakpp', 'tolakpp']
handler.tags = ['waifu']
handler.help = ['waifutolakpp <uid>']
handler.owner = true

export default handler