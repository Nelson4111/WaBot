import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.sxtream.xyz/games/tebakkimia')
    let json = await res.json()

    if (!json || !json.pertanyaan) throw 'Data tidak ditemukan.'

    // Simpan jawaban ke sesi sementara (gunakan global)
    conn.tebakkimia = conn.tebakkimia || {}
    conn.tebakkimia[m.chat] = {
      jawaban: json.jawaban.toLowerCase(),
      timeout: setTimeout(() => {
        if (conn.tebakkimia[m.chat]) {
          m.reply(`⏰ Waktu habis!\nJawaban yang benar adalah *${json.jawaban}*`)
          delete conn.tebakkimia[m.chat]
        }
      }, 60_000) // 1 menit
    }

    m.reply(`🧪 *Tebak Simbol Kimia!*\n\n${json.pertanyaan}\n\n⏳ Jawab dalam 60 detik dengan mengirim simbol unsur.`)

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil soal tebak kimia.')
  }
}

handler.help = ['tebakkimia']
handler.tags = ['game']
handler.command = /^tebakkimia$/i
handler.limit = true

handler.desc = 'Memulai permainan kuis interaktif tebakkimia di dalam grup WhatsApp.'
handler.tutorial = [
  '.tebakkimia',
  'Ketik jawaban langsung di obrolan setelah soal dikirimkan oleh bot'
]

export default handler