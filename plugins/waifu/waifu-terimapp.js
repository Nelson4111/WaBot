import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { args, conn }) => {
  const db = loadDB()

  if (!db.pendingPP) db.pendingPP = {}
  if (!db.profilePP) db.profilePP = {}

  // === AMBIL UID ===
  let uid = args[0]

  // Jika tidak ada argumen, coba dari reply
  if (!uid && m.quoted) {
    const q = m.quoted.text || ''
    const match = q.match(/UID(?:\s*MAL)?\s*[:\-#]\s*([0-9]+)/i)
    if (match) uid = match[1]
  }

  if (!uid) {
    return status.warning(m, 'Masukkan UID atau reply pesan permintaan foto profil waifu!', [
      'Contoh: *.waifuterimapp 118763*'
    ])
  }

  const data = db.pendingPP[uid]
  if (!data) {
    return status.error(m, 'Data antrean foto profil untuk UID tersebut tidak ditemukan.')
  }

  // === SET PP ===
  db.profilePP[uid] = data.url
  delete db.pendingPP[uid]
  saveDB(db)

  // === NOTIF USER ===
  try {
    const userMsg = `*╭  〔 🌸 ᴘ ᴘ  ᴡ ᴀ ɪ ꜰ ᴜ  ᴅ ɪ ꜱ ᴇ ᴛ ᴜ ᴊ ᴜ ɪ 〕*
*┆* ⟡ ᴋᴀʀᴀᴋᴛᴇʀ : *${data.charName}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(uid)}*
*╰───────────────*
> Foto profil waifu pilihanmu telah diverifikasi dan disetujui oleh Owner!`
    await conn.sendMessage(data.userJid, { text: userMsg })
  } catch {}

  const ownerMsg = `*╭  〔 ✅ ᴘ ᴘ  ᴡ ᴀ ɪ ꜰ ᴜ  ᴅ ɪ ᴛ ᴇ ʀ ɪ ᴍ ᴀ 〕*
*┆* ⟡ ᴋᴀʀᴀᴋᴛᴇʀ : *${data.charName}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(uid)}*
*┆* ⟡ ᴘᴇᴍᴏʜᴏɴ : *@${data.userJid.split('@')[0]}*
*╰───────────────*
> Foto profil waifu berhasil diperbarui ke dalam sistem.`

  m.reply(ownerMsg, null, { mentions: [data.userJid] })
}

handler.command = ['waifuterimapp', 'terimapp']
handler.tags = ['waifu']
handler.help = ['waifuterimapp <uid>']
handler.owner = true

export default handler