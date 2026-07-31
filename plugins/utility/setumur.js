let handler = async (m, { conn, text }) => {
  if (!text) throw '⚠️ Masukkan umur!\nContoh:\n.setumur 20'

  let umur = parseInt(text)
  if (isNaN(umur)) throw '⚠️ Umur harus berupa angka!'
  if (umur < 1 || umur > 30) throw '⚠️ Umur hanya bisa diisi antara 1 sampai 30 tahun!'

  global.db = global.db || {}
  global.db.data = global.db.data || {}
  global.db.data.users = global.db.data.users || {}

  let jid = m.sender
  let user = global.db.data.users[jid]

  if (!user || !user.registered) {
    return conn.reply(
      m.chat,
      '❌ Kamu belum terdaftar!\n\nSilakan daftar dulu dengan cara:\n.daftar nama.umur',
      m
    )
  }

  user.age = umur

  await conn.reply(
    m.chat,
    `✅ Umur berhasil diubah!\n\nUmur kamu sekarang: ${umur} tahun`,
    m
  )
}

handler.help = ['setumur <umur>']
handler.tags = ['main']
handler.command = /^setumur$/i
export default handler