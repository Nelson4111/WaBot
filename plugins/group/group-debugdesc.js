import { format } from 'util'

let handler = async (m, { conn }) => {
    try {
        await m.react('⏳')
        let metadata = await conn.groupMetadata(m.chat, true)
        let descId = metadata.descId || 'Tidak ada (Atau belum diset)'
        let desc = metadata.desc?.toString() || 'Tidak ada deskripsi'
        
        let report = `*DEBUG GROUP METADATA*\n\n`
        report += `*Subject:* ${metadata.subject}\n`
        report += `*DescId:* ${descId}\n`
        report += `*Desc Tipe:* ${typeof metadata.desc}\n`
        report += `*Desc (Teks Asli):*\n${desc}\n\n`
        report += `_Pesan ini untuk mengecek apakah server WhatsApp benar-benar mengembalikan deskripsi grup atau tidak._`
        
        await m.reply(report)
        await m.react('✅')
    } catch (e) {
        m.reply('Error: ' + format(e))
    }
}
handler.help = ['debugdesc']
handler.tags = ['group']
handler.command = /^(debugdesc)$/i
handler.group = true
handler.admin = true
export default handler
