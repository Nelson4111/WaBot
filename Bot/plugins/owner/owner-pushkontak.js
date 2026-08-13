let handler = async (m, { conn, usedPrefix, text, command }) => {
    if (!text && !m.quoted) return m.reply(`Format salah!\n\nContoh: ${usedPrefix + command} Halo kak`)

    const metadata = await conn.groupMetadata(m.chat)
    const participants = metadata.participants
    let target = participants.filter(v => v.id.endsWith('.net') && v.id !== conn.user.jid).map(v => v.id)
    
    let total = target.length
    if (total === 0) return m.reply("Tidak ada target ditemukan.")

    await m.reply(`*───「 SMART PUSH 」───*\n\n🎯 Target: ${total} nomor\n⏳ Delay: 6 detik/pesan\n🚀 Status: Sedang Berjalan...`)

    let sentCount = 0
    for (let i = 0; i < target.length; i++) {
        if (i > 0 && i % 20 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000))
        }

        try {
            if (m.quoted) {
                await conn.copyNForward(target[i], m.getQuotedObj(), false)
            } else {
                await conn.sendMessage(target[i], { text: text })
            }
            sentCount++
        } catch (e) {}

        await new Promise(resolve => setTimeout(resolve, 6000))
    }

    return m.reply(`*───「 PUSH SELESAI 」───*\n\n✅ Berhasil terkirim: ${sentCount}\n❌ Gagal: ${total - sentCount}`)
}

handler.help = ['pushkontak']
handler.tags = ['owner']
handler.command = /^(pushkontak)$/i
handler.owner = true
handler.group = true

export default handler