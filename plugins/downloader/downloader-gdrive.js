import { GDriveDl } from '../../lib/scrape.js'
import { status, toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!(args[0] || '').match(/([\w-]){33}|([\w-]){19}/)) {
    return m.reply(status.warning(`Masukkan tautan Google Drive yang valid!\n> Contoh: *${usedPrefix + command} https://drive.google.com/file/d/.../view*`))
  }

  await m.reply(status.wait('Sedang memproses tautan Google Drive...'))

  const someincludes = (data, id) => {
    let res = data.find(el => id.includes(el))
    return res ? true : false
  }

  try {
    let res = await GDriveDl(args[0])
    if (!res || res.error) throw new Error('File tidak dapat diakses atau dibatasi.')

    if (res.fileSize.slice(-2) === "GB") {
      return m.reply(status.warning(`Ukuran file terlalu besar (*${res.fileSize}*). Maksimal batas kirim WhatsApp adalah 500 MB.`))
    }

    if (!someincludes(['kB', 'KB'], res.fileSize.slice(-2)) && parseInt(res.fileSize) > 500) {
      return m.reply(status.warning(`Ukuran file (*${res.fileSize}*) melebihi batas maksimal bot (500 MB).`))
    }

    const caption = `*──  ୨୧ ✧ GOOGLE DRIVE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ꜰ ɪ ʟ ᴇ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${res.fileName}*
*┆* ◈ ᴜᴋᴜʀᴀɴ : *${toSmallNum(res.fileSize)}*
*┆* ✧ ᴛɪᴘᴇ   : *${res.mimetype || 'Unknown'}*
*╰───────────────*

> _Mengirimkan dokumen ke ruang obrolan..._`.trim()

    if (!res.downloadUrl) throw new Error('Link download langsung tidak ditemukan.')

    await conn.sendFile(m.chat, res.downloadUrl, res.fileName, caption, m)
  } catch (e) {
    console.error('[GDrive Error]:', e)
    m.reply(status.error(`Gagal mengunduh Google Drive.\n> Pastikan file dibagikan secara publik (Akses Siapa Saja yang Memiliki Tautan).`))
  }
}

handler.help = ['gdrive <url>']
handler.tags = ['downloader']
handler.command = /^(gdrive)$/i
handler.limit = true
handler.register = true

export default handler
