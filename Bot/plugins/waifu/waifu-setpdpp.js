import fs from 'fs'
import {
  loadDB,
  saveDB,
  uploadCatbox,
  sendToOwner
} from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const db = loadDB()
  const c = db.couples[m.sender]
  if (!c) return m.reply('❌ Kamu belum punya pasangan')

  if (!m.quoted) return m.reply('❌ Reply gambar yang ingin dijadikan PP')
  if (!/image/.test(m.quoted.mtype))
    return m.reply('❌ Yang direply harus gambar')

  const img = await m.quoted.download()
  if (!img) return m.reply('❌ Gagal mengambil gambar')

  const tmp = `./tmp_pp_${Date.now()}.jpg`
  fs.writeFileSync(tmp, img)

  const url = await uploadCatbox(tmp)
  fs.unlinkSync(tmp)

  if (!url) return m.reply('❌ Upload gagal')

  if (!db.pendingPP) db.pendingPP = {}

  db.pendingPP[c.charId] = {
    charId: c.charId,
    charName: c.charName,
    userJid: m.sender,
    url
  }
  saveDB(db)

  await sendToOwner(conn, {
    image: { url },
    caption:
      `🖼️ *REQUEST GANTI PP*\n\n` +
      `👤 User : @${m.sender.split('@')[0]}\n` +
      `💖 Pasangan : ${c.charName}\n` +
      `🆔 UID MAL : ${c.charId}\n\n` +
      `✅ Terima : .terimapp ${c.charId}\n` +
      `❌ Tolak  : .tolakpp ${c.charId}`,
    mentions: [m.sender]
  })

  m.reply('✅ PP berhasil dikirim ke owner untuk dikonfirmasi')
}

handler.command = ['setpdpp']
handler.tags = ['waifu']
handler.help = ['setpdpp (reply gambar)']
handler.register = true

export default handler