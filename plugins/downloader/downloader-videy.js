import { status, toSmallNum } from '../../lib/style.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(status.warning(`Masukkan tautan Videy yang valid!\n> Contoh: *${usedPrefix + command} https://videy.co/v?id=4F2uO7k21*`))
  }

  try {
    const parsed = new URL(text)
    const id = parsed.searchParams.get('id')

    if (!id) {
      return m.reply(status.warning('URL tidak valid! Harus menyertakan parameter id.\n> Contoh: *https://videy.co/v?id=abc123*'))
    }

    const videoUrl = `https://cdn.videy.co/${id}.mp4`
    const filename = `videy_${id}.mp4`

    const caption = `*──  ୨୧ ✧ VIDEY DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ɪᴅ    : *${id}*
*┆* ◈ ᴛɪᴘᴇ  : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    await conn.sendFile(m.chat, videoUrl, filename, caption, m)
  } catch (e) {
    m.reply(status.error(`Gagal mengunduh media Videy.\n> ${e?.message || e}`))
  }
}

handler.help = ['videy <url>', 'videydl <url>']
handler.tags = ['downloader']
handler.command = ['videy', 'videydl']
handler.limit = true

export default handler