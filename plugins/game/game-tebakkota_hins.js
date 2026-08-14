let handler = async (m, { conn }) => {
    conn.tebakkota = conn.tebakkota ? conn.tebakkota : {}
    let id = m.chat
    if (!(id in conn.tebakkota)) throw false
    let json = conn.tebakkota[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
    m.reply('```' + clue + '```')
}

handler.command = ['hkota']
handler.limit = true

export default handler
