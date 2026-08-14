/*• Nama Fitur : Fakeml
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbB8WYS4CrfhJCelw33j
*/

import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!text) return m.reply(`Masukkan nama! Contoh: *${usedPrefix + command}* Allen`)
    if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah *${usedPrefix + command}*`)

    m.reply('_Sedang diproses..._')

    try {
        let img = await q.download()
        const formData = new FormData()
        formData.append('files[]', img, { filename: 'image.jpg', contentType: 'image/jpeg' })
        
        let res = await fetch('https://uguu.se/upload.php', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        })
        
        let json = await res.json()
        if (!json.success) throw 'Gagal upload ke Uguu.se'
        
        let url = json.files[0].url
        // Menggunakan API sesuai endpoint yang kamu kirim sebelumnya
        let apiEndpoint = `https://api.deline.web.id/maker/fakeml?text=${encodeURIComponent(text)}&avatar=${encodeURIComponent(url)}`
        
        await conn.sendFile(m.chat, apiEndpoint, 'fakeml.jpg', `🎮 *ꜰᴀᴋᴇ ᴍʟ ᴘʀᴏꜰɪʟᴇ*\n\n> Nama: *${text}*`, m)
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat memproses gambar.')
    }
}

handler.help = ['fakeml <nama>']
handler.tags = ['maker']
handler.command = /^(fakeml|mlfake|mlcard)$/i
handler.limit = true

export default handler