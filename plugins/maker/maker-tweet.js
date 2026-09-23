import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan teks cuitan:
> › *${usedPrefix + command}* <pesan>
> › *${usedPrefix + command}* <nama>,<username>,<pesan>
>
> Contoh:
> › *${usedPrefix + command} Avelia bot sangat hebat*
> › *${usedPrefix + command} Nenel,nenel411,Aku suka kopi*
*╰───────────────*`)
  }

  let name = m.pushName || 'User'
  let username = (m.pushName || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'
  let tweet = text

  if (text.includes(',')) {
    const parts = text.split(',')
    if (parts.length >= 3) {
      name = parts[0].trim()
      username = parts[1].trim().replace(/^@/, '')
      tweet = parts.slice(2).join(',').trim()
    }
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  let ppUrl = 'https://i.pinimg.com/originals/03/28/21/03282165e143dc1aabc6335fe3ab8fbe.jpg'
  try {
    ppUrl = await conn.profilePictureUrl(m.sender, 'image')
  } catch (e) {}

  try {
    let buffer = null
    // 1. Primary: Ryzumi Fake Tweet API
    try {
      const ryzumiUrl = `https://api.ryzumi.net/api/image/faketweet?name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}&tweet=${encodeURIComponent(tweet)}&avatar=${encodeURIComponent(ppUrl)}&bg=dim&verified=true&retweets=1250&likes=8900&comment=340`
      const res = await axios.get(ryzumiUrl, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(res.data)
    } catch (e1) {
      // 2. Fallback: Fastrestapis Fake Tweet
      const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      const fallbackUrl = `https://fastrestapis.fasturl.cloud/maker/tweet?content=${encodeURIComponent(tweet)}&ppUrl=${encodeURIComponent(ppUrl)}&name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}&verified=true&time=${encodeURIComponent(time)}&date=${encodeURIComponent(date)}&retweets=1250&quotes=245&likes=8900&mode=dim`
      const resFallback = await axios.get(fallbackUrl, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      buffer = Buffer.from(resFallback.data)
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('Gagal menghasilkan gambar tweet.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ꜰᴀᴋᴇ ᴛᴡᴇᴇᴛ ✧ ୨୧  ──*

*╭  〔 𝜚 ᴘ ᴏ ꜱ ᴛ ɪ ɴ ɢ ᴀ ɴ  ᴛ ᴡ ɪ ᴛ ᴛ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${name}*
*┆* ✧ ᴜꜱᴇʀɴᴀᴍᴇ : *@${username}*
*┆* ❖ ʟɪᴋᴇꜱ    : *${toSmallNum('8.900')}*
*┆* ⏱ ʀᴇᴛᴡᴇᴇᴛ : *${toSmallNum('1.250')}*
*╰───────────────*

> _Simulasi cuitan Twitter/X dengan tampilan mode gelap dim._`.trim()

    return conn.sendMessage(m.chat, {
      image: buffer,
      caption
    }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal membuat tweet palsu: ${err.message}
*╰───────────────*`)
  }
}

handler.command = /^(tweet|faketweet)$/i
handler.tags = ['maker']
handler.help = ['tweet <teks>', 'faketweet <nama>,<username>,<teks>']
handler.limit = true

export default handler