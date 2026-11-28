import fs from 'fs'
let handler = async (m, { conn, text }) => {
    m.reply('Tunggu Sebentar, Sedang mengambil file sesi mu')
    let sesi = await fs.readFileSync('./sessions/creds.json')
    return await conn.sendMessage(m.chat, { document: sesi, mimetype: 'application/json', fileName: 'creds.json' }, { quoted: m })
}
handler.help = ['getsession']
handler.tags = ['owner']
handler.command = /^(g(et)?ses?si(on)?(data.json)?)$/i

handler.rowner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur sesi.'
handler.tutorial = [
  '.getsessiondatajson',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler
