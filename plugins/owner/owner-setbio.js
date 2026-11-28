let handler = async (m, { conn, text }) => {
  if (!text) throw `Masukan Text Untuk Bio Baru Bot`
    try {
   await conn.updateProfileStatus(text).catch(_ => _)
   conn.reply(m.chat, 'Sukses Mengganti Bio Bot', m)
} catch {
      throw 'Yah Error.. :D'
    }
}
handler.help = ['setbio']
handler.tags = ['owner']
handler.command = /^(setbio)$/i
handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur setbio.'
handler.tutorial = [
  '.setbio',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler