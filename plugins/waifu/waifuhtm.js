import sharp from 'sharp'
import { status } from '../../lib/style.js'

const FILTERS = ['Coklat', 'Hitam', 'Nerd', 'Piggy', 'Carbon', 'Botak']

/**
 * Menerapkan filter gambar waifu secara lokal dengan sharp
 * @param {Buffer} inputBuffer
 * @param {string} filter
 * @returns {Promise<Buffer>}
 */
async function applyWaifuFilter(inputBuffer, filter = 'Hitam') {
  const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase())
  if (!selected) {
    throw new Error(`FILTER_INVALID:${filter}`)
  }

  const s = sharp(inputBuffer)

  switch (selected.toLowerCase()) {
    case 'hitam':
      return await s.grayscale().jpeg({ quality: 90 }).toBuffer()

    case 'carbon':
      return await s.grayscale().linear(1.3, -40).jpeg({ quality: 90 }).toBuffer()

    case 'coklat':
      return await s.grayscale().tint({ r: 112, g: 66, b: 20 }).jpeg({ quality: 90 }).toBuffer()

    case 'piggy':
      return await s.grayscale().tint({ r: 255, g: 182, b: 193 }).jpeg({ quality: 90 }).toBuffer()

    case 'nerd':
      return await s.grayscale().tint({ r: 70, g: 130, b: 180 }).jpeg({ quality: 90 }).toBuffer()

    case 'botak':
      return await s.grayscale().modulate({ brightness: 1.3 }).jpeg({ quality: 90 }).toBuffer()

    default:
      return await s.grayscale().jpeg({ quality: 90 }).toBuffer()
  }
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (command === 'waifufilterlist') {
    const listText = `*──  ୨୧ ✧ DAFTAR FILTER WAIFU ✧ ୨୧  ──*

*╭  〔 🎨 ꜰ ɪ ʟ ᴛ ᴇ ʀ 〕*
${FILTERS.map(f => `*┆* ⟡ *${f}*`).join('\n')}
*╰───────────────*

> ｡˚ ⊹ *Balas gambar dan ketik ${usedPrefix}waifuhtm [filter] untuk mengaplikasikan* ⊹ ˚ ｡`.trim()

    return m.reply(listText)
  }

  if (!m.quoted) {
    return status.warning(m, 'Balas (reply) gambar waifu yang ingin diubah filternya!')
  }
  if (!/image/.test(m.quoted.mimetype || m.quoted.mtype || '')) {
    return status.warning(m, 'Pesan yang direply harus berupa media gambar!')
  }

  const filter = args[0] || 'Hitam'
  const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase())
  if (!selected) {
    return status.warning(m, `Filter *${filter}* tidak ditemukan.`, [
      `Ketik *${usedPrefix}waifufilterlist* untuk melihat daftar filter yang tersedia.`
    ])
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const media = await m.quoted.download()
    if (!media) throw new Error('Gagal mengunduh gambar.')

    const resultBuffer = await applyWaifuFilter(media, filter)

    const caption = `*──  ୨୧ ✧ FILTER WAIFU ✧ ୨୧  ──*

*╭  〔 ✨ ʜ ᴀ ꜱ ɪ ʟ 〕*
*┆* ⟡ ꜰɪʟᴛᴇʀ : *${selected}*
*╰───────────────*`

    await conn.sendFile(m.chat, resultBuffer, 'waifu.jpg', caption, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('[WAIFUHTM ERROR]', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return status.error(m, 'Gagal memproses filter gambar waifu.', [
      e.message || 'Terjadi kesalahan internal saat memproses gambar.'
    ])
  }
}

handler.help = ['waifuhtm [filter]', 'waifufilterlist']
handler.tags = ['waifu', 'tools']
handler.command = /^(waifuhtm|waifufilterlist)$/i
handler.limit = true
handler.register = true

export default handler