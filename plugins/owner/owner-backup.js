import fs from 'fs'
import archiver from 'archiver'

let handler = async (m, { conn }) => {
    m.reply('_Sedang mencadangkan script, file akan dikirim ke chat pribadi..._')

    const zipName = 'backup.zip'
    const output = fs.createWriteStream(zipName)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', async () => {
        let size = fs.statSync(zipName).size
        let caption = `*BACKUP SELESAI*\n`
        caption += `*Nama File:* ${zipName}\n`
        caption += `*Ukuran:* ${(size / 1024 / 1024).toFixed(2)} MB`
        await conn.sendMessage(m.sender, { 
            document: fs.readFileSync(zipName), 
            fileName: zipName, 
            mimetype: 'application/zip',
            caption: caption
        })

        // Menghapus file sementara di storage bot
        fs.unlinkSync(zipName)
    })

    archive.on('error', (err) => {
        m.reply('Gagal melakukan backup: ' + err.message)
    })

    archive.pipe(output)
    archive.glob('**/*', {
        ignore: [
            'node_modules/**', 
            '.npm/**', 
            'backup.zip', 
            '.git/**',
            'sessions/**',
            'package-lock.json/**',
            '.pm2/**',
            '.cache/**'
        ]
    })

    await archive.finalize()
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = ['backup', 'backupsc']
handler.owner = true

export default handler