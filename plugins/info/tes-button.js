let handler = async (m, { conn }) => {
    let text = `
[ 🛡️ ]───[ *_ANTI-BAN SECURITY_* ]───✦
╭ 𖥔  *Status:* Mode Chat Biasa (Aman 100%)
│ 𖥔  *Keterangan:* Tombol interaktif (Button/List/Template)
│    telah dinonaktifkan secara permanen untuk melindungi
│    nomor WhatsApp dari pemblokiran/banned resmi.
╰ 𖥔  Gunakan perintah teks biasa (misal: *.menu*, *.help*)
`.trim()

    await m.reply(text)
}

handler.help = ['tesbutton']
handler.tags = ['info']
handler.command = /^(tesbutton|testbutton|tesbtn)$/i

export default handler
