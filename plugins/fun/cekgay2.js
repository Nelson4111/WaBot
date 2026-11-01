import { formatFunCheck } from '../../lib/funCheck.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let name = await conn.getName(who)
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
    let randomGay = Math.floor(Math.random() * 100) + 1
    let status = randomGay >= 75
      ? 'Gay banget! 🌈'
      : randomGay >= 50
        ? 'Ada sedikit aura pelangi 🌈'
        : randomGay >= 25
          ? 'Masih di tengah-tengah 😄'
          : 'Tidak terdeteksi aura pelangi 😎'
    let caption = formatFunCheck({
      title: 'CEK GAY RESULT',
      user: name,
      score: randomGay,
      scoreLabel: 'Persentase',
      verdict: status
    })

    m.reply('_Sedang mengecek..._')
    
    try {
        let apiEndpoint = `https://kayzzidgf.my.id/api/canvas/gay?name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&num=${randomGay}%25`
        await conn.sendFile(m.chat, apiEndpoint, 'gay.jpg', caption, m)
    } catch (e) {
        console.error(e)
        m.reply('Gagal memproses gambar.')
    }
}

handler.help = ['cekgay2']
handler.tags = ['fun']
handler.command = /^(cekgay2)$/i

export default handler