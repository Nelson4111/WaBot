import { format } from 'util'

let handler = async (m, { conn }) => {
    try {
        await m.react('⏳')
        let metadata = await conn.groupMetadata(m.chat, true)
        
        let rawJson = JSON.stringify(metadata, null, 2)
        
        let report = `*RAW GROUP METADATA (DEBUG)*\n\n`
        report += `\`\`\`json\n${rawJson}\n\`\`\`\n\n`
        report += `_Pesan ini berisi data mentah dari WhatsApp Server. Silakan cek apakah teks deskripsi ada di dalam properti lain._`
        
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
