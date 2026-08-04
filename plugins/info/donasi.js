import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    let imgPath = path.join(process.cwd(), 'media', 'QR_Desain.jpeg')
    let image = fs.readFileSync(imgPath)

    let ownNum = global.nomorown || '6281241100804'
    let ownJid = ownNum + '@s.whatsapp.net'

    let caption = `
✨ *DONASI BOT* ✨

Halo Kak! Terima kasih banyak telah mendukung server & pengembangan bot ini. 🙏
Donasi dari kamu sangat membantu untuk biaya operasional & pemeliharaan bot.

💳 *METODE PEMBAYARAN:*
• *QRIS (All Payment / E-Wallet & Bank)*
  Silakan scan gambar QRIS di atas melalui aplikasi e-wallet (Dana, Ovo, GoPay, ShopeePay, LinkAja) atau Mobile Banking kamu.

🏆 *INGIN MASUK TOP DONATUR?*
📸 Jika ingin nama/nomor kamu tercatat di *Papan Peringkat Top Donatur* (.topdonasi & .menu), silakan kirimkan *Bukti Screenshot Transfer* langsung ke Owner:
👤 *Owner:* @${ownNum}
🔗 *Chat Owner:* https://wa.me/${ownNum}

_Berapapun nominal donasi yang diberikan sangat berarti bagi kami. Terima kasih atas dukungan & kebaikanmu!_ 💖
`.trim()

    await conn.sendMessage(m.chat, {
        image: image,
        caption: caption,
        mentions: [ownJid]
    }, { quoted: m })
}

handler.help = ['donasi']
handler.tags = ['main', 'info']
handler.command = /^(donasi|donate)$/i

export default handler