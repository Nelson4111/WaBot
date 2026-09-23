import axios from 'axios'
import FormData from 'form-data'
import crypto from 'crypto'
import {
  loadDB,
  saveDB,
  sendToOwner
} from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

const TERMAI_KEY = 'AIzaBj7z2z3xBjsk'

async function uploadTermai(buffer, mime) {
  const form = new FormData()
  form.append('file', buffer, {
    filename: `pp_${Date.now()}.jpg`,
    contentType: mime || 'image/jpeg'
  })

  const res = await axios.post(
    `https://c.termai.cc/api/upload?key=${TERMAI_KEY}`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Accept: 'application/json, text/plain, */*'
      },
      timeout: 15000
    }
  )
  return res.data?.status ? res.data.path : null
}

async function uploadDeline(buffer, ext = 'jpg', mime = 'image/jpeg') {
  const fd = new FormData()
  const name = `${crypto.randomBytes(5).toString('hex')}.${ext}`
  fd.append('file', buffer, { filename: name, contentType: mime })
  const res = await axios.post('https://api.deline.web.id/uploader', fd, {
    headers: fd.getHeaders(),
    timeout: 15000
  })
  return res.data?.result?.link || res.data?.url || null
}

async function uploadQuax(buffer, ext = 'jpg') {
  const fd = new FormData()
  fd.append('files[]', buffer, {
    filename: `${crypto.randomBytes(5).toString('hex')}.${ext}`
  })
  const res = await axios.post('https://qu.ax/upload.php', fd, {
    headers: fd.getHeaders(),
    timeout: 15000
  })
  return res.data?.files?.[0]?.url || null
}

async function uploadImage(buffer, mime = 'image/jpeg') {
  // 1. Coba c.termai terlebih dahulu (paling cepat dan stabil)
  try {
    const url = await uploadTermai(buffer, mime)
    if (url && typeof url === 'string' && url.startsWith('http')) return url
  } catch (e) {
    console.error('[UPLOAD TERMAI FAILED]', e?.message || e)
  }

  // 2. Fallback ke Deline
  try {
    const url = await uploadDeline(buffer, 'jpg', mime)
    if (url && typeof url === 'string' && url.startsWith('http')) return url
  } catch (e) {
    console.error('[UPLOAD DELINE FAILED]', e?.message || e)
  }

  // 3. Fallback ke Quax
  try {
    const url = await uploadQuax(buffer, 'jpg')
    if (url && typeof url === 'string' && url.startsWith('http')) return url
  } catch (e) {
    console.error('[UPLOAD QUAX FAILED]', e?.message || e)
  }

  return null
}

let handler = async (m, { conn, command }) => {
  const db = loadDB()
  const isHusbu = /husbu/i.test(command)
  const label = isHusbu ? 'Husbu' : 'Waifu'
  const partnerLabel = isHusbu ? 'husbu' : 'waifu'

  const c = db.couples?.[m.sender]
  if (!c) return status.warning(m, `Kamu belum memiliki pasangan ${partnerLabel}.`)

  if (!m.quoted) return status.warning(m, `Balas (reply) gambar yang ingin dijadikan foto profil ${partnerLabel}!`)
  if (!/image/.test(m.quoted.mtype || m.quoted.mimetype || '')) {
    return status.warning(m, 'Pesan yang direply harus berupa media gambar!')
  }

  const mime = m.quoted.mimetype || 'image/jpeg'
  const img = await m.quoted.download()
  if (!img) return status.error(m, 'Gagal mengunduh file gambar.')

  const url = await uploadImage(img, mime)
  if (!url) return status.error(m, 'Gagal mengunggah foto ke server penyimpanan (Termai/Deline/Quax).')

  if (!db.pendingPP) db.pendingPP = {}

  db.pendingPP[c.charId] = {
    charId: c.charId,
    charName: c.charName,
    userJid: m.sender,
    url,
    isHusbu
  }
  saveDB(db)

  const ownerCaption = `*╭  〔 🖼️ ʀ ᴇ Q ᴜ ᴇ ꜱ ᴛ  ɢ ᴀ ɴ ᴛ ɪ  ᴘ ᴘ  ${label.toUpperCase()} 〕*
*┆* ⟡ ᴜꜱᴇʀ : *@${m.sender.split('@')[0]}*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ : *${c.charName}*
*┆* ⟡ ᴜɪᴅ ᴍᴀʟ : *#${toSmallNum(c.charId)}*
*┆* ⟡ ᴛɪᴘᴇ : *${label}*
*╰───────────────*
> Pengguna mengajukan foto profil khusus untuk karakter ${partnerLabel} mereka.

*╭  〔 ⚙️ ᴛ ɪ ɴ ᴅ ᴀ ᴋ ᴀ ɴ  ᴏ ᴡ ɴ ᴇ ʀ 〕*
*┆* ⟡ *Terima* : *.waifuterimapp ${c.charId}* atau *.husbuterimapp ${c.charId}*
*┆* ⟡ *Tolak*  : *.waifutolakpp ${c.charId}* atau *.husbutolakpp ${c.charId}*
*╰───────────────*`

  await sendToOwner(conn, {
    image: { url },
    caption: ownerCaption,
    mentions: [m.sender]
  })

  status.success(m, `Foto profil ${partnerLabel} berhasil dikirim ke Owner untuk diverifikasi.`, [
    'Mohon tunggu persetujuan dari Owner sebelum foto profil aktif.'
  ])
}

handler.command = /^(waifusetpp|setpdpp|husbusetpp|setpphusbu|setppwaifu|setwaifupp|sethusbupp)$/i
handler.tags = ['waifu', 'husbu']
handler.help = ['waifusetpp (reply gambar)', 'husbusetpp (reply gambar)']
handler.register = true

export default handler