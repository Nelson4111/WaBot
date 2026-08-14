/**
  *» Nama :* — [ TIKTOK PTV SEARCH ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://tikwm.com
  *» Command :* .ptv query
  *» Command :* .ptv query.idch (khusus owner)
  *» Contoh :* .ptv bahlil stecu.123456890@newslatter
  *» Creator :* Kyzo Yamada々
**/

import axios from "axios"

async function tiktokSearchVideo(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios("https://tikwm.com/api/feed/search", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: "current_language=en",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/116 Mobile Safari/537.36",
        },
        data: {
          keywords: query,
          count: 12,
          cursor: 0,
          web: 1,
          hd: 1,
        },
      })

      resolve(res.data.data)
    } catch (e) {
      reject(e)
    }
  })
}

async function handler(m, { conn, text, command, isOwner, usedPrefix }) {
  if (!text) {
    return m.reply(
      `⚠️ Contoh:\n` +
      `• ${usedPrefix + command} anime edit\n` +
      `• ${usedPrefix + command} anime edit|120363317168111012@g.us (owner)`
    )
  }

  let query, targetId, useQuoted

  if (text.includes("|")) {
    const parts = text.split("|")
    query = parts[0].trim()
    targetId = parts[1].trim()
    useQuoted = false

    if (!isOwner) {
      return m.reply("⛔ Fitur kirim ke ID hanya untuk OWNER!")
    }
  } else {
    query = text
    targetId = m.chat
    useQuoted = true
  }

  await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } })

  try {
    const search = await tiktokSearchVideo(query)
    if (!search || !search.videos || search.videos.length === 0) {
      return m.reply("❌ Video tidak ditemukan")
    }

    const randomIndex = Math.floor(Math.random() * search.videos.length)
    const randomVideo = search.videos[randomIndex]
    const videoUrl = `https://tikwm.com${randomVideo.play}`

    await conn.sendMessage(
      targetId,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        ptv: true,
        viewOnce: true,
        caption: `🎥 TikTok PTV Result: *${query}*`
      },
      useQuoted ? { quoted: m } : {}
    )

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error(err)
    m.reply("❌ Error mengambil video TikTok")
  }
}

handler.help = ["ptv"]
handler.tags = ["search"]
handler.command = /^(ptv)$/i

export default handler