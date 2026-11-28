// • Feature : Redirect Detective
// • Type    : Plugins ESM
// • Source  : https://api.nekolabs.my.id
// • Author  : Hilman
import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `🍢 Kirim link yang mau dicek, contoh:\n${usedPrefix + command} https://ungu.in/qlYHA6`

  try {
    const apiUrl = `https://api.nekolabs.my.id/tools/redirect-detective?url=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw '🍬 Gagal menghubungi server.'
    const json = await res.json()
    if (!json.status) throw '🍬 Gagal memproses link.'

    const { originalUrl, redirectTo } = json.result
    let msg = `🍡 *Redirect Detective*\n\n`
    msg += `🍭 Original URL:\n${originalUrl}\n\n`
    msg += redirectTo ? `🍰 Redirect To:\n${redirectTo}` : '🍰 Redirect To:\nTidak ada (langsung ke original URL)'
    await m.reply(msg)
  } catch (e) {
    console.error(e)
    m.reply('🍬 Terjadi kesalahan saat mengecek link.')
  }
}

handler.help = ['redirect']
handler.tags = ['tools']
handler.command = /^redirect$/i
handler.limit = false

handler.desc = 'Alat utilitas praktis untuk memproses redirect.'
handler.tutorial = [
  '.redirect <input>',
  'Ketik .redirect diikuti input yang diperlukan atau balas pesan target'
]

export default handler