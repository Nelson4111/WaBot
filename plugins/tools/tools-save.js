let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
        return m.reply(`Balas pesan media (gambar/video/audio) dengan perintah *${usedPrefix + command}* untuk mengubahnya menjadi file dokumen agar mudah di-save.`)
    }

    m.reply('Tunggu sebentar, media sedang diproses menjadi dokumen...')

    try {
        let media = await q.download()
        let ext = mime.split('/')[1] || 'bin'
        
        // Membersihkan ekstensi jika ada tambahan parameter seperti 'mp4; codecs=...'
        ext = ext.split(';')[0]
        
        // Cek ekstensi spesifik
        if (ext === 'jpeg') ext = 'jpg'
        if (ext === 'mpeg') ext = 'mp3'
        
        let filename = text ? `${text}.${ext}` : `Saved_Media_${Date.now()}.${ext}`

        await conn.sendMessage(m.chat, {
            document: media,
            mimetype: mime,
            fileName: filename,
            caption: `✅ Berhasil diubah menjadi file dokumen!\n\nSilakan klik tombol *Download / Simpan* pada file di atas agar tersimpan langsung di folder Download HP-mu.`
        }, { quoted: m })
        
    } catch (e) {
        console.error(e)
        m.reply('Gagal mengambil media. Pastikan kamu membalas pesan yang berisi media, bukan sekadar teks.')
    }
}

handler.help = ['save <nama_file>']
handler.tags = ['tools']
handler.command = /^(save)$/i

export default handler
