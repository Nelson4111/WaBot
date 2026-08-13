import crypto from "crypto"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"
import axios from "axios"

let handler = async (m, { conn, text, command }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""
    
    if (!text) {
        let example = `*Format Salah!*\n\n` +
                      `Kirim/Reply gambar dengan caption:\n` +
                      `.${command} provinsi|kota|nik|nama|ttl|jk|goldar|alamat|rt/rw|desa|kec|agama|status|kerja|negara|berlaku|tglbuat\n\n` +
                      `*Note:* Gunakan pemisah | (garis tegak)`
        return m.reply(example)
    }

    if (!/image/.test(mime)) return m.reply("❌ Silakan kirim atau reply gambar untuk dijadikan pas foto!")

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        // Download media dan upload ke Uguu
        const media = await q.download()
        const ft = await fileTypeFromBuffer(media)
        const fotoUrl = await uploadUguu(media, ft.ext)

        let [prov, kota, nik, nama, ttl, jk, goldar, alamat, rtrw, desa, kec, agama, status, kerja, negara, berlaku, buat] = text.split('|')

        let apiUrl = `https://api.apocalypse.web.id/canvas/ektp?provinsi=${encodeURIComponent(prov || '')}&kota=${encodeURIComponent(kota || '')}&nik=${encodeURIComponent(nik || '')}&nama=${encodeURIComponent(nama || '')}&ttl=${encodeURIComponent(ttl || '')}&jenis_kelamin=${encodeURIComponent(jk || '')}&golongan_darah=${encodeURIComponent(goldar || '')}&alamat=${encodeURIComponent(alamat || '')}&rt/rw=${encodeURIComponent(rtrw || '')}&kel/desa=${encodeURIComponent(desa || '')}&kecamatan=${encodeURIComponent(kec || '')}&agama=${encodeURIComponent(agama || '')}&status=${encodeURIComponent(status || '')}&pekerjaan=${encodeURIComponent(kerja || '')}&kewarganegaraan=${encodeURIComponent(negara || '')}&masa_berlaku=${encodeURIComponent(berlaku || '')}&terbuat=${encodeURIComponent(buat || '')}&pas_photo=${encodeURIComponent(fotoUrl)}`

        await conn.sendFile(m.chat, apiUrl, 'ktp.jpg', `✅ *Fake E-KTP Berhasil Dibuat*`, m)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply('❌ Gagal membuat Fake KTP. Terjadi kesalahan pada server/uploader.')
    }
}

handler.help = ['fakektp']
handler.tags = ['tools']
handler.command = /^(fakektp|ektp)$/i

export default handler

async function uploadUguu(buffer, ext) {
    const fd = new FormData()
    fd.append("files[]", buffer, { filename: `${crypto.randomBytes(5).toString("hex")}.${ext}` })
    const res = await axios.post("https://uguu.se/upload.php", fd, { 
        headers: fd.getHeaders() 
    })
    return res.data?.files?.[0]?.url
}