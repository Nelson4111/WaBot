let handler = async (m, { conn, text }) => {
    let [l, r] = text.split`|`
    if (!l) l = ''
    if (!r) r = ''
    conn.reply(m.chat, l + readMore + r, m)
}
handler.help = ['readmore'].map(v => v + ' <teks>|<teks>')
handler.tags = ['tools']
handler.command = /^(spoiler|hidetext|readmore|selengkapnya)$/i

handler.register = true

handler.desc = 'Alat utilitas praktis untuk memproses readmore.'
handler.tutorial = [
  '.spoiler <input>',
  'Ketik .spoiler diikuti input yang diperlukan atau balas pesan target'
]

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)