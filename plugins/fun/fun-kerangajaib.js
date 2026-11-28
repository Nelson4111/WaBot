let handler = async (m, { text, command, usedPrefix }) => {
    if (!text) throw `Use example ${usedPrefix}${command} i'm alien?`
    m.reply(`"${[
        'Mungkin suatu hari',
        'Tidak juga',
        'Tidak keduanya',
        'Kurasa tidak',
        'Ya',
        'Coba tanya lagi',
        'Tidak ada'
    ].getRandom()}."`)
}
handler.help = ['kerang', 'kerangajaib'].map(v => v + ' <teks>')
handler.tags = ['fun']

handler.command = /^(kulit)?kerang(ajaib)?$/i

handler.desc = 'Fitur hiburan dan keseruan santai untuk kerangajaib.'
handler.tutorial = [
  '.kulitkerangajaib <teks/pertanyaan>',
  'Ketik .kulitkerangajaib diikuti nama atau pertanyaan'
]

export default handler
