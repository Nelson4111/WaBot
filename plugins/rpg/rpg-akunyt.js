import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let userYT = wdb.users?.[m.sender]?.youtube

  if (!userYT) return m.reply('KESALAHAN: Kamu belum memiliki channel YouTube.')

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

  let rank = "Bronze Creator"
  if (userYT.subs >= 1000000) rank = "Diamond Play Button"
  else if (userYT.subs >= 500000) rank = "Gold Play Button"
  else if (userYT.subs >= 100000) rank = "Silver Play Button"

  let caption = `*───「 CHANNEL INFO 」───*\n\n`
  caption += `Nama: ${userYT.name}\n`
  caption += `Rank: ${rank}\n`
  caption += `Level: ${userYT.level}\n\n`
  caption += `Statistik Seluruh Waktu:\n`
  caption += `┌ Total *Views*: ${userYT.views.toLocaleString()}\n`
  caption += `│ Total *Likes*: ${(userYT.likes || 0).toLocaleString()}\n`
  caption += `└ *Subscribers*: ${userYT.subs.toLocaleString()}\n`

  return sendRpgMsg(conn, m, caption.trim(), ppUrl)
}

handler.help = ['akunyt']
handler.command = ['akunyt']
handler.tags = ['rpg']

export default handler
