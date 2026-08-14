/* 
`[Twitterstalk]`
Type : plugins esm 
API : https://zenzxz.dpdns.org/
*/
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text) throw `⚠️ Masukkan username Twitter!\n\nContoh:\n${command} elonmusk`

    let res = await fetch(`https://zenzxz.dpdns.org/stalker/twitter?username=${encodeURIComponent(text)}`)
    if (!res.ok) throw '🚫 Gagal menghubungi API.'
    
    let json = await res.json()
    if (!json.status) throw '🚫 Data tidak ditemukan.'

    let data = json.data
    let hasil = `
*👤 Name:* ${data.name}
*🔰 Username:* @${data.username}
*📄 Bio:* ${data.description || 'Tidak ada.'}
*📝 Tweets:* ${data.tweet_count.toLocaleString()}
*👥 Followers:* ${data.followers_count.toLocaleString()}
*👤 Following:* ${data.following_count.toLocaleString()}
*📆 Akun Dibuat:* ${data.created_at}
`.trim()

    await conn.sendFile(m.chat, data.profile_image_url, 'profile.jpg', hasil, m)

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, e?.message || e || '🚫 Terjadi kesalahan.', m)
  }
}

handler.help = ['twitterstalk <username>']
handler.tags = ['stalk']
handler.command = /^twitterstalk$/i
handler.limit = true

export default handler