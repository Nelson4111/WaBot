import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  
  let username = ''
  let caption = ''

  if (!text && !m.quoted?.text) {
    return m.reply(`✨ *Fake Story Generator*\n\nContoh Penggunaan:\n• *${usedPrefix + command}* Halo World! ✨\n• *${usedPrefix + command}* Nama Custom | Teks Story\n• Reply pesan seseorang: *${usedPrefix + command}* Halo!`)
  }

  let input = text || m.quoted?.text || ''

  if (input.includes('|')) {
    let [u, ...c] = input.split('|')
    username = u.trim()
    caption = c.join('|').trim()
  } else {
    username = (conn.getName ? conn.getName(who) : null) || m.name || m.pushName || who.split('@')[0]
    caption = input.trim()
  }

  if (!caption) {
    return m.reply(`⚠️ Masukkan teks/caption untuk story!`)
  }

  await m.react('🎨')

  try {
    let avatarUrl = await conn.profilePictureUrl(who, 'image').catch(() => 'https://i.pinimg.com/originals/03/28/21/03282165e143dc1aabc6335fe3ab8fbe.jpg')
    let apiUrl = `https://api.ryzumi.net/api/image/fake-story?username=${encodeURIComponent(username)}&caption=${encodeURIComponent(caption)}&avatar=${encodeURIComponent(avatarUrl)}`

    let { data } = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'Accept': 'image/png,image/*;q=0.9'
      }
    })

    let buffer = Buffer.from(data)

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `📸 *Fake Story*\n👤 *Username:* ${username}`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('Fake Story Error:', e)
    await m.react('❌')
    m.reply('❌ *Gagal membuat Fake Story:* ' + (e.message || e))
  }
}

handler.help = ['fakestory <teks>', 'fakestatus <teks>']
handler.tags = ['maker']
handler.command = /^(fakestory|fakestatus|fs)$/i
handler.limit = true

export default handler
