import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import axios from 'axios'
import FormData from 'form-data'

function normalizeYoutube(data = {}) {
  return {
    name: data.name || '',
    level: Number(data.level || 1),
    roomLevel: Number(data.roomLevel || 0),
    content: data.content || 'streamer',
    gender: data.gender || 'none',
    subs: Number(data.subs || 0),
    views: Number(data.views || 0),
    likes: Number(data.likes || 0),
    income: Number(data.income || 0),
    lastLive: Number(data.lastLive || 0),
    lastCollab: Number(data.lastCollab || data.lastKolab || 0),
    lastKolab: Number(data.lastCollab || data.lastKolab || 0),
    createdAt: Number(data.createdAt || Date.now())
  }
}

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  const userYT = normalizeYoutube(wdb.users?.[m.sender]?.youtube || {})

  if (!userYT.name) return m.reply('KESALAHAN: Kamu belum memiliki channel YouTube.')

  let ppUrl = 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
  try {
    let ppBuffer = await (await conn.getFile(await conn.profilePictureUrl(m.sender, 'image'))).data
    const form = new FormData()
    form.append('files[]', ppBuffer, 'profile.jpg')
    const { data } = await axios.post('https://uguu.se/upload.php', form, {
      headers: form.getHeaders()
    })
    ppUrl = data.files[0].url
  } catch (e) {
    // Fallback URL
  }

let rank = 'Young Creator'

if (userYT.subs >= 10000000000) rank = 'Kryptonite Play Button'
else if (userYT.subs >= 5000000000) rank = 'Vibranium Play Button'
else if (userYT.subs >= 2500000000) rank = 'Adamantium Play Button'
else if (userYT.subs >= 1000000000) rank = 'Obsidian Play Button'
else if (userYT.subs >= 750000000) rank = 'Tanzanite Play Button'
else if (userYT.subs >= 500000000) rank = 'Sapphire Play Button'
else if (userYT.subs >= 400000000) rank = 'Alexandrite Play Button'
else if (userYT.subs >= 300000000) rank = 'Spinel Play Button'
else if (userYT.subs >= 250000000) rank = 'Amethyst Play Button'
else if (userYT.subs >= 200000000) rank = 'Aquamarine Play Button'
else if (userYT.subs >= 150000000) rank = 'Morganite Play Button'
else if (userYT.subs >= 100000000) rank = 'Red Diamond Play Button'
else if (userYT.subs >= 75000000) rank = 'Ruby Play Button'
else if (userYT.subs >= 50000000) rank = 'Jasper Play Button'
else if (userYT.subs >= 40000000) rank = 'Opal Play Button'
else if (userYT.subs >= 30000000) rank = 'Lapis Lazuli Play Button'
else if (userYT.subs >= 25000000) rank = 'Moonstone Play Button'
else if (userYT.subs >= 20000000) rank = 'Diamond Play Button'
else if (userYT.subs >= 15000000) rank = 'Peridot Play Button'
else if (userYT.subs >= 10000000) rank = 'Platinum Play Button'
else if (userYT.subs >= 7500000) rank = 'Tourmaline Play Button'
else if (userYT.subs >= 5000000) rank = 'Gold Play Button'
else if (userYT.subs >= 4000000) rank = 'Garnet Play Button'
else if (userYT.subs >= 3000000) rank = 'Kyanite Play Button'
else if (userYT.subs >= 2500000) rank = 'Zircon Play Button'
else if (userYT.subs >= 2000000) rank = 'Topaz Play Button'
else if (userYT.subs >= 1500000) rank = 'Emerald Play Button'
else if (userYT.subs >= 1000000) rank = 'Silver Play Button'
else if (userYT.subs >= 750000) rank = 'Jade Play Button'
else if (userYT.subs >= 500000) rank = 'Citrine Play Button'
else if (userYT.subs >= 400000) rank = 'Agate Play Button'
else if (userYT.subs >= 300000) rank = 'Onyx Play Button'
else if (userYT.subs >= 250000) rank = 'Malachite Play Button'
else if (userYT.subs >= 200000) rank = 'Turquoise Play Button'
else if (userYT.subs >= 150000) rank = 'Quartz Play Button'
else if (userYT.subs >= 100000) rank = 'Pearl Play Button'
else if (userYT.subs >= 75000) rank = 'Amber Play Button'
else if (userYT.subs >= 50000) rank = 'Fluorite Play Button'
else if (userYT.subs >= 25000) rank = 'Hematite Play Button'
else if (userYT.subs >= 10000) rank = 'Crystal Play Button'
else if (userYT.subs >= 5000) rank = 'Pyrite Play Button'
else if (userYT.subs >= 1000) rank = 'Selenite Play Button'

  let caption = `╭─❏「 📺 CHANNEL INFO 」❏\n`
caption += `│ 📺 *${userYT.name}*\n`
caption += `╰─━━━━━━━━━━━━━━─\n\n`

caption += `📋 *INFORMASI CHANNEL*\n`
caption += `> ↳ Rank : ${rank}\n`
caption += `> ↳ Level : Lv.${userYT.level}\n`
caption += `> ↳ Room Level : Lv.${userYT.roomLevel}\n`
caption += `> ↳ Content : ${userYT.content}\n`
caption += `> ↳ Gender : ${userYT.gender}\n\n`

caption += `📊 *STATISTIK*\n`
caption += `> ↳ 👁️ Views : ${userYT.views.toLocaleString()}\n`
caption += `> ↳ 👍 Likes : ${(userYT.likes || 0).toLocaleString()}\n`
caption += `> ↳ 👥 Subscribers : ${userYT.subs.toLocaleString()}\n\n`

caption += `─━━━━━━━━━━━━━━─`

  return sendRpgMsg(conn, m, caption.trim(), 'https://c.termai.cc/i189/AS4Mvv.webp')
}

handler.help = ['akunyt', 'channelyt']
handler.command = ['akunyt', 'channelyt']
handler.tags = ['rpg']

export default handler
