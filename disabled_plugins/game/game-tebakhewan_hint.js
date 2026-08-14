let handler = async (m, { conn }) => {
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}
    let id = m.chat
    if (!(id in conn.tebakhewan)) throw false
    let json = conn.tebakhewan[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
    m.reply('```' + clue + '```')
}

handler.command = ['hhewan']
handler.limit = true

export default handler
