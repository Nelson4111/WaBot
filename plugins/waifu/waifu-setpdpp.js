import fs from 'fs'
import {
  loadDB,
  saveDB,
  uploadCatbox,
  sendToOwner
} from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

let handler = async (m, { conn }) => {
  const db = loadDB()
  const c = db.couples[m.sender]
  if (!c) return status.warning(m, 'Kamu belum memiliki pasangan waifu.')

  if (!m.quoted) return status.warning(m, 'Balas (reply) gambar yang ingin dijadikan foto profil waifu!')
  if (!/image/.test(m.quoted.mtype)) {
    return status.warning(m, 'Pesan yang direply harus berupa media gambar!')
  }

  const img = await m.quoted.download()
  if (!img) return status.error(m, 'Gagal mengunduh file gambar.')

  const tmp = `./tmp_pp_${Date.now()}.jpg`
  fs.writeFileSync(tmp, img)

  const url = await uploadCatbox(tmp)
  fs.unlinkSync(tmp)

  if (!url) return status.error(m, 'Gagal mengunggah foto ke server penyimpanan.')

  if (!db.pendingPP) db.pendingPP = {}

  db.pendingPP[c.charId] = {
    charId: c.charId,
    charName: c.charName,
    userJid: m.sender,
    url
  }
  saveDB(db)

  const ownerCaption = `*╭  〔 🖼️ ʀ ᴇ Q ᴜ ᴇ ꜱ ᴛ  ɢ ᴀ ɴ ᴛ ɪ  ᴘ ᴘ 〕*
*┆* ⟡ ᴜꜱᴇʀ : *@${m.sender.split('@')[0]}*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ : *${c.charName}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(c.charId)}*
*╰───────────────*
> Pengguna mengajukan foto profil khusus untuk karakter waifu mereka.

*╭  〔 ⚙️ ᴛ ɪ ɴ ᴅ ᴀ ᴋ ᴀ ɴ  ᴏ ᴡ ɴ ᴇ ʀ 〕*
*┆* ⟡ *Terima* : *.waifuterimapp ${c.charId}*
*┆* ⟡ *Tolak*  : *.waifutolakpp ${c.charId}*
*╰───────────────*`

  await sendToOwner(conn, {
    image: { url },
    caption: ownerCaption,
    mentions: [m.sender]
  })

  status.success(m, 'Foto profil waifu berhasil dikirim ke Owner untuk diverifikasi.', [
    'Mohon tunggu persetujuan dari Owner sebelum foto profil aktif.'
  ])
}

handler.command = /^(waifusetpp|setpdpp)$/i
handler.tags = ['waifu']
handler.help = ['waifusetpp (reply gambar)']
handler.register = true

export default handler