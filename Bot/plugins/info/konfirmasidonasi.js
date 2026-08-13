let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime.startsWith('image/')) {
        return m.reply(`⚠️ Kirim atau reply foto bukti transfer dengan pesan:\n*${usedPrefix + command} nominal | namasamaran*\n\nContoh: *${usedPrefix + command} 50000 | Hamba Allah*`)
    }

    if (!text) {
        return m.reply(`⚠️ Masukkan nominal donasi!\nContoh: *${usedPrefix + command} 50000 | Hamba Allah*`)
    }

    let [nominalStr, ...aliasArr] = text.split('|')
    let nominal = parseInt(nominalStr.replace(/[^0-9]/g, ''))
    if (isNaN(nominal) || nominal <= 0) {
        return m.reply('❌ Nominal donasi tidak valid! Pastikan hanya berisi angka.')
    }

    let alias = aliasArr.join('|').trim()
    let ownNum = global.nomorown || '6281241100804'
    let ownerJid = ownNum + '@s.whatsapp.net'

    m.reply('⏳ Sedang memproses dan mengirim bukti donasimu ke Owner...')

    try {
        let media = await q.download()
        
        let caption = `🔔 *KONFIRMASI DONASI* 🔔\n`
        caption += `👤 Dari: @${m.sender.split('@')[0]}\n`
        if (alias) {
            caption += `📝 Tampil Sebagai: ${alias}\n`
        }
        caption += `💰 Nominal: Rp ${nominal.toLocaleString('id-ID')}\n\n`
        caption += `Balas pesan ini:\n`
        caption += `[ 1 ] = Terima & Verifikasi\n`
        caption += `[ 2 ] = Tolak`

        await conn.sendMessage(ownerJid, {
            image: media,
            caption: caption,
            mentions: [m.sender]
        })

        m.reply('✅ Bukti donasi berhasil dikirim ke Owner! Silakan tunggu proses verifikasi.')
    } catch (e) {
        console.error(e)
        m.reply('❌ Gagal memproses gambar. Coba lagi.')
    }
}

handler.help = ['konfirmasidonasi <nominal> | <nama>']
handler.tags = ['info']
handler.command = /^(konfirmasidonasi|buktidonasi|paydonasi)$/i

export default handler
