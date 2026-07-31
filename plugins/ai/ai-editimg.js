import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) return m.reply(`Kirim/reply gambar dengan caption *${usedPrefix + command}* <prompt>`)
    if (!text) return m.reply(`Contoh: *${usedPrefix + command}* pakai hijab`)

    try {
        let img = await q.download()
        let url = await uploadByUguu(img)
        
        let res = await axios.get(`https://api.zenzxz.my.id/ai/nanobanana?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(text)}`)
        if (!res.data.status) return m.reply('❌ Terjadi kesalahan pada API.')

        let result = res.data.result.image
        await conn.sendMessage(m.chat, { image: { url: result }, caption: `✅ Berhasil di-edit!` }, { quoted: m })

    } catch (e) {
        m.reply('❌ Gagal memproses gambar.')
    }
}

handler.help = ['editimg']
handler.tags = ['ai']
handler.command = ['editimg']

export default handler

async function uploadByUguu(buffer) {
    const { ext } = await fileTypeFromBuffer(buffer)
    let form = new FormData()
    form.append('files[]', buffer, 'tmp.' + ext)
    let res = await axios.post('https://uguu.se/upload.php', form, {
        headers: form.getHeaders()
    })
    return res.data.files[0].url
}