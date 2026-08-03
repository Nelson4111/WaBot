import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    let imgPath = path.join(process.cwd(), 'media', 'QR_Desain.jpeg')
    let image = fs.readFileSync(imgPath)

    let caption = `
✨ *DONASI BOT* ✨

Halo Kak! Terima kasih banyak telah mendukung server & pengembangan bot ini. 🙏
Donasi dari kamu sangat membantu untuk biaya operasional & pemeliharaan bot.

💳 *METODE PEMBAYARAN:*
• *QRIS (All Payment / E-Wallet & Bank)*
  Silakan scan gambar QRIS di atas melalui aplikasi e-wallet (Dana, Ovo, GoPay, ShopeePay, LinkAja) atau Mobile Banking kamu.

_Berapapun nominal donasi yang diberikan sangat berarti bagi kami. Terima kasih atas dukungan & kebaikanmu!_ 💖
`.trim()

    await conn.sendMessage(m.chat, {
        image: image,
        caption: caption
    }, { quoted: m })
}

handler.help = ['donasi']
handler.tags = ['main', 'info']
handler.command = /^(donasi|donate)$/i

export default handler