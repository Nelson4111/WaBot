let handler = async (m, { conn }) => {
    conn.caklontong = conn.caklontong ? conn.caklontong : {}
    let id = m.chat
    if (!(id in conn.caklontong)) throw false
    let json = conn.caklontong[id][1]
    let ans = String(json.jawaban || '')
    let clue = ans.replace(/[AIUEO]/gi, '_')
    m.reply('╭─〔 🆘 PETUNJUK CAK LONTONG 〕\n> 🔤 *' + clue + '*\n> ✧ Huruf vokal disembunyikan.\n> Balas pesan soal, bukan pesan petunjuk ini.\n╰───────────────')
}

handler.command = /^calo$/i
handler.limit = true

handler.desc = 'Memberikan petunjuk atau bocoran huruf untuk kuis tebak caklontong.'
handler.tutorial = [
  '.calo',
  'Gunakan perintah ini saat kesulitan menjawab kuis caklontong di grup'
]

export default handler