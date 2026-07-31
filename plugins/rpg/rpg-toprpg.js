import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  
  // Ambil semua ID user yang terdaftar
  let users = Object.keys(wdb.users)
  
  // Fungsi Helper untuk format Nama & Nomor
  const formatUser = (id) => {
    let name = conn.getName(id) || 'Petualang'
    let num = id.split('@')[0]
    // Sensor nomor tengah: 62812xxxx90
    let maskedNum = num.length > 7 ? `${num.substring(0, 5)}xxxx${num.slice(-2)}` : num
    return `${name} (@${maskedNum})`
  }

  // 1. Leaderboard Berdasarkan LEVEL
  let topLevel = users
    .filter(id => wdb.users[id].rpg)
    .sort((a, b) => (wdb.users[b].rpg.level || 0) - (wdb.users[a].rpg.level || 0))
    .slice(0, 10)

  // 2. Leaderboard Berdasarkan MONEY
  let topMoney = users
    .sort((a, b) => (wdb.money[b] || 0) - (wdb.money[a] || 0))
    .slice(0, 10)

  // 3. Leaderboard Berdasarkan DIAMOND
  let topDiamond = users
    .filter(id => wdb.users[id].rpg)
    .sort((a, b) => (wdb.users[b].rpg.diamond || 0) - (wdb.users[a].rpg.diamond || 0))
    .slice(0, 10)

  let text = `*───「 ZETA RPG LEADERBOARD 」───*\n\n`

  // Render Top Level
  text += `🆙 *TOP 10 LEVEL*\n`
  topLevel.forEach((id, i) => {
    text += `${i + 1}. ${formatUser(id)}\n   └─ *Level ${wdb.users[id].rpg.level}*\n`
  })

  text += `\n💰 *TOP 10 KEKAYAAN*\n`
  topMoney.forEach((id, i) => {
    text += `${i + 1}. ${formatUser(id)}\n   └─ *Rp ${(wdb.money[id] || 0).toLocaleString()}*\n`
  })

  text += `\n💎 *TOP 10 COLLECTOR*\n`
  topDiamond.forEach((id, i) => {
    text += `${i + 1}. ${formatUser(id)}\n   └─ *${wdb.users[id].rpg.diamond || 0} Diamond*\n`
  })

  text += `\n_Tingkatkan terus statusmu untuk menjadi nomor satu!_`

  let pp = 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg'
  
  conn.sendMessage(m.chat, {
    text: text,
    contextInfo: {
      externalAdReply: {
        title: "RPG HALL OF FAME",
        body: "Daftar Petualang Paling Berpengaruh",
        thumbnailUrl: 'https://files.cloudkuimages.guru/images/e0684787315c.jpeg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['toprpg']
handler.tags = ['rpg']
handler.command = ['toprpg']

export default handler