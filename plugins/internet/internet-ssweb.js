import axios from 'axios'

async function ssweb(url = '', full = false, type = 'desktop') {
  type = type.toLowerCase()
  if (!['desktop', 'tablet', 'phone'].includes(type)) type = 'desktop'

  const form = new URLSearchParams()
  form.append('url', url)
  form.append('device', type)
  if (full) form.append('full', 'on')
  form.append('cacheLimit', 0)

  const res = await axios({
    url: 'https://www.screenshotmachine.com/capture.php',
    method: 'post',
    data: form
  })

  const cookies = res.headers['set-cookie']
  const buffer = await axios({
    url: 'https://www.screenshotmachine.com/' + res.data.link,
    headers: {
      'cookie': cookies.join('')
    },
    responseType: 'arraybuffer'
  })

  return Buffer.from(buffer.data)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0]
  let typeInput = args[1] ? args[1].toLowerCase() : 'desktop'

  if (!url || !/^https?:\/\//.test(url)) {
    return m.reply(`Contoh: ${usedPrefix + command} https://google.com phone-full\n\nTipe: desktop, tablet, phone (tambah -full untuk fullpage)`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  let full = false
  if (typeInput.endsWith('-full')) {
    full = true
    typeInput = typeInput.replace('-full', '')
  }

  const device = ['desktop', 'tablet', 'phone'].includes(typeInput) ? typeInput : 'desktop'

  try {
    const img = await ssweb(url, full, device)
    const caption = `✅ *URL:* ${url}\n💻 *Mode:* ${device.toUpperCase()}\n📄 *Tampilan:* ${full ? 'Full Page' : 'Visible Area'}`

    await conn.sendMessage(m.chat, { image: img, caption }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply('❌ Gagal mengambil screenshot.')
  }
}

handler.help = ['ssweb <url> <type>']
handler.tags = ['internet']
handler.command = /^ss(web)?$/i
handler.limit = true

export default handler