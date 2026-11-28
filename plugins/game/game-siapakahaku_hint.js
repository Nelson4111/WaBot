let handler = async (m, { conn }) => {
    conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {}
    let id = m.chat
    if (!(id in conn.siapakahaku)) throw false
    let json = conn.siapakahaku[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz]/ig, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^who$/i

handler.limit = true

handler.desc = 'Memberikan petunjuk atau bocoran huruf untuk kuis tebak siapakahaku.'
handler.tutorial = [
  '.who',
  'Gunakan perintah ini saat kesulitan menjawab kuis siapakahaku di grup'
]

export default handler