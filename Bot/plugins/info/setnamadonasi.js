let handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = {}

  // Cek apakah user sudah pernah berdonasi / terdaftar di top donasi
  if (!user.totalDonasi || user.totalDonasi <= 0) {
    return m.reply(`⚠️ *Akses Ditolak!*\n\nFitur ini khusus untuk donatur yang sudah terdaftar di papan peringkat *.topdonasi*.\n\nKetik *${usedPrefix}donasi* untuk melakukan donasi dan mendukung bot. 💖`)
  }

  let currentName = user.namaDonasi ? `*${user.namaDonasi}* (Nama Samaran / Anonim)` : `*Nomor WhatsApp* (@${m.sender.split('@')[0]})`

  if (!text) {
    let helpMsg = `📝 *PENGATURAN NAMA DONASI*\n\n`
    helpMsg += `Status Tampilan Kamu Saat Ini: ${currentName}\n\n`
    helpMsg += `Cara Mengatur:\n`
    helpMsg += `• *Tampil Nomor (Default)*: *${usedPrefix + command} nomor*\n`
    helpMsg += `• *Tampil Nama Samaran/Anonim*: *${usedPrefix + command} <Nama Samaran>*\n\n`
    helpMsg += `Contoh:\n`
    helpMsg += `• *${usedPrefix + command} nomor*\n`
    helpMsg += `• *${usedPrefix + command} Orang Baik Hati*`
    return m.reply(helpMsg, null, { mentions: [m.sender] })
  }

  let param = text.trim()

  if (param.toLowerCase() === 'nomor' || param.toLowerCase() === 'number' || param.toLowerCase() === 'reset' || param.toLowerCase() === 'off') {
    user.namaDonasi = null
    return m.reply(`✅ *Berhasil!* Nama donasi kamu diubah ke *Nomor WhatsApp*. Nomormu akan di-tag pada papan peringkat .topdonasi`, null, { mentions: [m.sender] })
  } else {
    user.namaDonasi = param
    return m.reply(`✅ *Berhasil!* Nama donasi kamu diubah menjadi *${param}*. Privasi nomor kamu akan terjaga pada papan peringkat .topdonasi!`)
  }
}

handler.help = ['setnamadonasi <nama/nomor>']
handler.tags = ['info']
handler.command = /^(setnamadonasi|setdonasiname|namadonasi)$/i

export default handler
