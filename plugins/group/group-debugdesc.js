import { format } from 'util'

let handler = async (m, { conn }) => {
    try {
        await m.react('⏳')
        let metadata = await conn.groupMetadata(m.chat, true)
        
        let rawJson = JSON.stringify(metadata, null, 2)
        
        // Coba query deskripsi secara manual (Raw XML Node)
        let customDesc = 'Gagal Fetch Manual'
        try {
            const result = await conn.query({
                tag: 'iq',
                attrs: {
                    type: 'get',
                    xmlns: 'w:g2',
                    to: m.chat,
                },
                content: [
                    { tag: 'query', attrs: { request: 'interactive' } }
                ]
            })
            // Parse manual
            const groupNode = result.content?.find(c => c.tag === 'group')
            const descNode = groupNode?.content?.find(c => c.tag === 'description')
            if (descNode && descNode.content) {
                const bodyNode = descNode.content.find(c => c.tag === 'body')
                if (bodyNode && bodyNode.content) {
                    customDesc = String(bodyNode.content)
                } else if (typeof descNode.content === 'string') {
                    customDesc = descNode.content
                } else if (Array.isArray(descNode.content)) {
                    customDesc = String(descNode.content[0])
                }
            } else {
                customDesc = 'Node <description> tetap tidak ada di respons server'
            }
        } catch (err) {
            customDesc = 'Error query: ' + err.message
        }
        
        let report = `*RAW GROUP METADATA (DEBUG)*\n\n`
        report += `*Hasil Fetch Manual (Raw XML):*\n${customDesc}\n\n`
        report += `\`\`\`json\n${rawJson}\n\`\`\`\n\n`
        report += `_Jika "Hasil Fetch Manual" menampilkan deskripsi, berarti Baileys nge-bug. Jika sama-sama kosong, berarti WA memang menyembunyikannya._`
        
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
