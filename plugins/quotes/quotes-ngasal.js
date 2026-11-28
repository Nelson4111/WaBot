/*
Kata kata Ngasal
Plugins ESM 
API : https://api.sxtream.xyz
*/
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.sxtream.xyz/randomtext/ngasal')
    if (!res.ok) throw await res.text()
    let json = await res.json()

    if (!json.success) throw 'Gagal mengambil quote.'

    await conn.reply(m.chat, `🌸 *Ngasal* 🌸\n\n"${json.data}"`, m)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠️ Gagal mengambil quotes .', m)
  }
}

handler.help = ['ngasal']
handler.tags = ['quotes']
handler.command = /^ngasal$/i
handler.limit = true

handler.desc = 'Menampilkan kutipan kata-kata mutiara dan inspirasi bertema ngasal.'
handler.tutorial = [
  '.ngasal'
]

export default handler