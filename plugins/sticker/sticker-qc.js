import { sticker } from '../../lib/sticker.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, user, command }) => {
  try {
    if (!args[0]) return m.reply(`*Example :* .${command} Hello World`)
    
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    
    const text = args.join(" ")
    const first_name = m.pushName || "User"
    
    let photoUrl
    try {
        photoUrl = await conn.profilePictureUrl(m.sender, "image")
    } catch {
        photoUrl = "https://telegra.ph/file/24fa902ead26340f3df2c.png"
    }

    const res = await fetch("https://brat.siputzx.my.id/quoted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
            from: {
              id: 1,
              first_name: first_name,
              last_name: "",
              name: first_name,
              photo: { url: photoUrl }
            },
            text: text,
            entities: [],
            avatar: true,
            replyMessage: {}
        }],
        backgroundColor: "#FFFFFF",
        width: 512,
        height: 512,
        scale: 2,
        type: "quote",
        format: "png"
      })
    })

    if (!res.ok) throw 'Error'
    
    const buffer = Buffer.from(await res.arrayBuffer())
    let stiker = await sticker(buffer, false, global.stickpack, global.stickauth)
    
    if (stiker) {
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return await conn.sendFile(m.chat, stiker, 'qc.webp', '', m)
    }

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.help = ["qc <text>"]
handler.command = ["qc"]
handler.tags = ["sticker"]
handler.limit = true 
handler.register = true

export default handler