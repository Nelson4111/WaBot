/**
 * Kata-Kata Bucin Harian Plugin
 * Koleksi kutipan romantis harian
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

const kataBucin = [
  "Aku tidak pernah meminta banyak dalam doa, cukup namamu yang selalu membersamai setiap langkahku.",
  "Bukan karena tidak ada pilihan lain di dunia, melainkan karena hatiku hanya berlabuh padamu seorang.",
  "Mengenalmu adalah takdir terindah, mencintaimu adalah pilihan yang tidak pernah kusesali.",
  "Kehadiranmu ibarat embun pagi yang menyejukkan, selalu memberi ketenangan di tengah hiruk pikuk dunia.",
  "Di antara miliaran bintang di angkasa, binar matamu adalah lentera yang paling menuntunku pulang.",
  "Rasa ini sederhana: melihat senyummu sudah cukup untuk menyempurnakan seluruh hariku.",
  "Cinta bukan tentang mencari sosok yang sempurna, melainkan belajar melihat ketidaksempurnaan dengan penuh keindahan."
]

let handler = async (m) => {
  const kata = kataBucin[Math.floor(Math.random() * kataBucin.length)]

  const txt = `*──  ୨୧ ✧ KUTIPAN ROMANSA HARIAN ✧ ୨୧  ──*

> "${kata}"

*╭  〔 ᰔ ʀ ᴏ ᴍ ᴀ ɴ ꜱ ᴀ 〕*
*┆* ⟡ ꜱᴜᴍʙᴇʀ  : *Koleksi Mutiara Cinta Avelia*
*┆* ✧ ᴘᴇꜱᴀɴ   : *Ungkapkan perasaan tulusmu hari ini ♡*
*╰───────────────*`.trim()

  return m.reply(txt)
}

handler.help = ['bucin']
handler.tags = ['pasangan']
handler.command = /^(bucin)$/i

export default handler
