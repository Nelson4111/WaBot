let handler = async (m, { command, text }) => m.reply(`
*Pertanyaan:* ${command} ${text}
*Jawaban:* ${['Ya', 'Mungkin iya', 'Mungkin', 'Mungkin tidak', 'Tidak', 'Tidak mungkin'].getRandom()}
  `.trim(), null, m.mentionedJid ? {
  mentions: m.mentionedJid
} : {})

handler.help = ['apakah <teks>?']
handler.tags = ['fun']
handler.command = /^apakah$/i

handler.desc = 'Fitur hiburan dan keseruan santai untuk apakah.'
handler.tutorial = [
  '.apakah <teks/pertanyaan>',
  'Ketik .apakah diikuti nama atau pertanyaan'
]

export default handler