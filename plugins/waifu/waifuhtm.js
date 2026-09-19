/* 
hitamin waifu bisa pilih filter
type plugins esm
sumber : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
sumber scarape : https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3637
*/
import axios from 'axios'
import { status } from '../../lib/style.js'

const FILTERS = ['Coklat', 'Hitam', 'Nerd', 'Piggy', 'Carbon', 'Botak']

async function Hytamkan(imageUrl, filter = 'Hitam') {
  const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase())
  if (!selected) {
    throw new Error(`FILTER_INVALID:${filter}`)
  }

  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  const base64Input = Buffer.from(imgRes.data).toString('base64')

  const res = await axios.post('https://wpw.my.id/api/process-image', {
    imageData: base64Input,
    filter: selected.toLowerCase()
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://wpw.my.id',
      'Referer': 'https://wpw.my.id/',
    },
    timeout: 20000
  })

  const dataUrl = res.data?.processedImageUrl
  if (!dataUrl?.startsWith('data:image/')) throw new Error('RESPONSE_INVALID')

  return dataUrl
}

let handler = async (m, { conn, args, command }) => {
  try {
    if (command === 'waifufilterlist') {
      const listText = `*╭  〔 🎨 ꜰ ɪ ʟ ᴛ ᴇ ʀ  ᴡ ᴀ ɪ ꜰ ᴜ 〕*
${FILTERS.map(f => `*┆* ⟡ *${f}*`).join('\n')}
*╰───────────────*
> Reply gambar waifu dan ketik *.waifuhtm [filter]* untuk mengaplikasikan filter.`

      return m.reply(listText)
    }

    if (!m.quoted) {
      return status.warning(m, 'Balas (reply) gambar waifu yang ingin diubah filternya!')
    }
    if (!/image/.test(m.quoted.mimetype || m.quoted.mtype)) {
      return status.warning(m, 'Pesan yang direply harus berupa media gambar!')
    }

    const filter = args[0] || 'Hitam'
    const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase())
    if (!selected) {
      return status.warning(m, `Filter *${filter}* tidak ditemukan.`, [
        'Ketik *.waifufilterlist* untuk melihat daftar filter yang tersedia.'
      ])
    }

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const media = await m.quoted.download()
    const url = `data:${m.quoted.mimetype || 'image/jpeg'};base64,${media.toString('base64')}`

    const result = await Hytamkan(url, filter)
    await conn.sendFile(m.chat, result, 'waifu.png', `*╭  〔 ✨ ꜰ ɪ ʟ ᴛ ᴇ ʀ  ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ 〕*\n*┆* ⟡ ꜰɪʟᴛᴇʀ : *${selected}*\n*╰───────────────*`, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('[WAIFUHTM ERROR]', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return status.error(m, 'Gagal memproses filter gambar waifu.', [
      'Layanan API pemrosesan eksternal (wpw.my.id) saat ini tidak dapat dijangkau atau sedang offline.'
    ])
  }
}

handler.help = ['waifuhtm [filter]', 'waifufilterlist']
handler.tags = ['tools']
handler.command = /^(waifuhtm|waifufilterlist)$/i
handler.limit = true

export default handler