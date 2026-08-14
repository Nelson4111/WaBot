import fetch from "node-fetch"
import {
  generateWAMessage,
  generateWAMessageFromContent,
  jidNormalizedUser
} from "@whiskeysockets/baileys"
import { randomBytes } from "crypto"

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Example: .${command} elaina`)

  await conn.sendMessage(m.chat, { react: { text: "🕓", key: m.key } })

  let urls = []
  try {
    const url =
      "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" +
      encodeURIComponent(
        JSON.stringify({
          options: { query: encodeURIComponent(text) }
        })
      )

    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "screen-dpr": "4",
        "x-pinterest-pws-handler": "www/search/[scope].js"
      }
    })

    if (!res.ok) throw new Error(`Error ${res.status}`)

    const linkHeader = res.headers.get("Link")
    if (!linkHeader) throw new Error(`Hasil kosong untuk "${text}"`)

    urls = shuffle(
      [...linkHeader.matchAll(/<(.*?)>/gm)].map(a => a[1])
    )

  } catch (e) {
    return m.reply(String(e.message))
  }

  const mediaList = []

  for (let url of shuffle(urls)) {
    if (mediaList.length >= 5) break
    try {
      const r = await fetch(url, { redirect: "follow" })
      const type = r.headers.get("content-type") || ""
      if (!type.startsWith("image/")) continue

      const arr = await r.arrayBuffer()
      const buffer = Buffer.from(arr)

      mediaList.push({
        image: buffer,
        caption: `📌 Pinterest Result\n🔎 Query: ${text}`
      })
    } catch {}
  }

  if (!mediaList.length) return m.reply("❌ Tidak ada gambar valid.")

  const opener = generateWAMessageFromContent(
    m.chat,
    {
      messageContextInfo: { messageSecret: randomBytes(32) },
      albumMessage: {
        expectedImageCount: mediaList.length,
        expectedVideoCount: 0
      }
    },
    {
      userJid: jidNormalizedUser(conn.user.id),
      quoted: m,
      upload: conn.waUploadToServer
    }
  )

  await conn.relayMessage(opener.key.remoteJid, opener.message, {
    messageId: opener.key.id
  })

  for (let content of mediaList) {
    const msg = await generateWAMessage(opener.key.remoteJid, content, {
      upload: conn.waUploadToServer
    })

    msg.message.messageContextInfo = {
      messageSecret: randomBytes(32),
      messageAssociation: {
        associationType: 1,
        parentMessageKey: opener.key
      }
    }

    await conn.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id
    })
  }

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.help = ["pin <query>"]
handler.tags = ["internet"]
handler.command = /^pin$/i

export default handler