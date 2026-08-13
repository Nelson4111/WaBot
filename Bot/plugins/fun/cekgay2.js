let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let name = await conn.getName(who)
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
    
    let randomGay = Math.floor(Math.random() * 100) + 1
    
    m.reply('_Sedang mengecek..._')
    
    try {
        let apiEndpoint = `https://kayzzidgf.my.id/api/canvas/gay?name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&num=${randomGay}%25`
        
        await conn.sendFile(m.chat, apiEndpoint, 'gay.jpg', `*Cek Gay Result*\n\nNama: ${name}\nPersentase: ${randomGay}%`, m)
    } catch (e) {
        console.error(e)
        m.reply('Gagal memproses gambar.')
    }
}

handler.help = ['cekgay2']
handler.tags = ['fun']
handler.command = /^(cekgay2)$/i

export default handler