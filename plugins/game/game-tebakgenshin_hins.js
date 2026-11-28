let handler = async (m, { conn }) => {
    conn.tebakgenshin = conn.tebakgenshin ? conn.tebakgenshin : {}
    let id = m.chat
    if (!(id in conn.tebakgenshin)) throw false
    let json = conn.tebakgenshin[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
    m.reply('```' + clue + '```')
}

handler.command = ['hgenshin']
handler.limit = true

handler.desc = 'Memberikan petunjuk atau bocoran huruf untuk kuis tebak tebakgenshin.'
handler.tutorial = [
  '.hgenshin',
  'Gunakan perintah ini saat kesulitan menjawab kuis tebakgenshin di grup'
]

export default handler
