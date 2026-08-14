import crypto from "crypto"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"
import axios from "axios"

let handler = async (m, { conn, command }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""
    
    if (!/image/.test(mime)) return m.reply(`❌ Kirim atau reply gambar dengan caption .${command}`)

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        const media = await q.download()
        const ft = await fileTypeFromBuffer(media)
        const fotoUrl = await uploadUguu(media, ft.ext)

        let apiUrl = `https://api-faa.my.id/faa/tokacamata?url=${encodeURIComponent(fotoUrl)}`

        await conn.sendFile(m.chat, apiUrl, 'kacamata.jpg', `✅ *To Kacamata Berhasil*`, m)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply('❌ Gagal memproses gambar.')
    }
}

handler.help = ['tokacamata']
handler.tags = ['maker']
handler.command = /^(tokacamata)$/i
handler.limit = true

export default handler

async function uploadUguu(buffer, ext) {
    const fd = new FormData()
    fd.append("files[]", buffer, { filename: `${crypto.randomBytes(5).toString("hex")}.${ext}` })
    const res = await axios.post("https://uguu.se/upload.php", fd, { 
        headers: fd.getHeaders() 
    })
    return res.data?.files?.[0]?.url
}