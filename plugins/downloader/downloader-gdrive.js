import axios from 'axios'
import { GDriveDl } from '../../lib/scrape.js'
import { status, toSmallNum } from '../../lib/style.js'

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

async function getGDriveViaRyzumi(url) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/downloader/gdrive?url=${encodeURIComponent(url)}`,
    {
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.downloadUrl) throw new Error('Download URL tidak ditemukan di Ryzumi')
  return {
    fileName: data.fileName || 'gdrive_file',
    fileSize: typeof data.fileSize === 'number' ? formatBytes(data.fileSize) : (data.fileSize || '-'),
    mimetype: data.mimetype || 'application/octet-stream',
    downloadUrl: data.downloadUrl
  }
}

async function getGDrive(url) {
  try {
    return await getGDriveViaRyzumi(url)
  } catch (e) {
    console.warn('[GDrive Ryzumi failed]:', e.message)
    const res = await GDriveDl(url)
    if (!res || res.error) throw new Error('File tidak dapat diakses atau dibatasi.')
    return {
      fileName: res.fileName,
      fileSize: res.fileSize,
      mimetype: res.mimetype || 'application/octet-stream',
      downloadUrl: res.downloadUrl
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!(args[0] || '').match(/([\w-]){33}|([\w-]){19}/)) {
    return m.reply(
      status.warning(
        `Masukkan tautan Google Drive yang valid!\n` +
        `> Contoh: *${usedPrefix + command} https://drive.google.com/file/d/.../view*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await getGDrive(args[0])

    if (res.fileSize.includes('GB')) {
      await m.react('⚠️')
      return m.reply(status.warning(`Ukuran file terlalu besar (*${res.fileSize}*). Maksimal batas kirim WhatsApp adalah 500 MB.`))
    }

    const caption = `*──  ୨୧ ✧ GOOGLE DRIVE DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ꜰ ɪ ʟ ᴇ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${res.fileName}*
*┆* ◈ ᴜᴋᴜʀᴀɴ : *${toSmallNum(res.fileSize)}*
*┆* ✧ ᴛɪᴘᴇ   : *${res.mimetype}*
*╰───────────────*

> _Mengirimkan dokumen ke ruang obrolan..._`.trim()

    await conn.sendFile(m.chat, res.downloadUrl, res.fileName, caption, m)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
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
