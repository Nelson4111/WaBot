let handler = async (m, { text }) => {
  const nama = text || m.pushName || 'Kamu'

  const ramalan = [
    '💸 Akan jadi sultan dadakan dari giveaway yang gak sengaja diikutin.',
    '💔 Akan ditikung sahabat sendiri, tapi tetap ikhlas karena jodoh gak ke mana.',
    '🛌 Kamu akan tidur 14 jam dan bangun tetap capek.',
    '📱 HP kamu akan jatuh tapi nggak lecet. Cuma mental kamu yang retak.',
    '🎓 Kamu akan lulus... dari hubungan tanpa kejelasan.',
    '📉 Akan investasi kripto, tapi malah beli token tipu-tipu.',
    '🛍️ Kamu akan belanja banyak, tapi lupa bayar listrik.',
    '👽 Alien bakal culik kamu karena mengira kamu spesies langka.',
    '💘 Akan jatuh cinta sama orang yang ngira kamu bot.',
    '😂 Kamu akan ketawa hari ini gara-gara baca pesan ini.'
  ]

  const hasil = ramalan[Math.floor(Math.random() * ramalan.length)]
  m.reply(`🔮 *Ramalan Masa Depan*\n\n${nama}, ${hasil}`)
}

handler.help = ['ramal <nama opsional>']
handler.tags = ['fun']
handler.command = /^ramal$/i
handler.limit = false

handler.desc = 'Fitur hiburan dan keseruan santai untuk ramalan.'
handler.tutorial = [
  '.ramal <teks/pertanyaan>',
  'Ketik .ramal diikuti nama atau pertanyaan'
]

export default handler