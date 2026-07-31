import PhoneNumber from 'awesome-phonenumber'
import { loadDB } from '../../lib/waifuHelper.js'

const rupiah = n => 'Rp ' + n.toLocaleString('id-ID')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
`Pilih leaderboard:

${usedPrefix + command} uang
${usedPrefix + command} limit
${usedPrefix + command} xp`
    )

  const usersDB = global.db.data.users || {}
  const wdb = loadDB()

  let users = Object.keys(usersDB).map(jid => {
    const u = usersDB[jid]
    const name = u.registered
      ? u.name || conn.getName(jid)
      : conn.getName(jid)

    return {
      jid,
      name,
      money: wdb.money?.[jid] || 0,
      limit: u.limit || 0,
      xp: u.exp || 0
    }
  })

  if (!users.length) return m.reply('Belum ada data user')

  let key = ''
  let bodyAd = ''
  let format = v => v

  switch (text.toLowerCase()) {
    case 'uang':
      key = 'money'
      bodyAd = 'Top LB Uang'
      format = rupiah
      break

    case 'limit':
      key = 'limit'
      bodyAd = 'Top LB Limit'
      break

    case 'xp':
      key = 'xp'
      bodyAd = 'Top LB XP'
      break

    default:
      return m.reply('Gunakan: uang | limit | xp')
  }

  users.sort((a, b) => b[key] - a[key])
  const top = users.slice(0, 10)

  let textRes = 
`━━━━━ LEADERBOARD ━━━━
Total Pemain : ${users.length}
━━━━━━━━━━━━━━━━━━━━
`

top.forEach((u, i) => {
  const nomor = PhoneNumber('+' + u.jid.split('@')[0]).getNumber('international')
  const isPrem = usersDB[u.jid]?.premiumTime > 0 ? ' [PREMIUM]' : ''

  textRes +=
`${i + 1}. ${u.name}${isPrem}
   Nomor : ${nomor}
   ${key === 'money' ? 'Uang' : key.toUpperCase()} : ${format(u[key])}

`
})

const pos = users.findIndex(u => u.jid === m.sender)
if (pos !== -1) {
  const me = users[pos]
  const isPremMe = usersDB[m.sender]?.premiumTime > 0 ? ' [PREMIUM]' : ''

  textRes +=
`━━━━━ POSISI KAMU ━━━━━
${pos + 1}. ${me.name}${isPremMe}
   ${key === 'money' ? 'Uang' : key.toUpperCase()} : ${format(me[key])}
`
}

textRes += `━━━━━━━━━━━━━━━━━━━━`

textRes = '```' + textRes + '```'

  await conn.sendMessage(
    m.chat,
    {
      text: textRes,
      mentions: top.map(u => u.jid),
      contextInfo: {
        externalAdReply: {
          title: 'NelBot-MD',
          body: bodyAd,
          thumbnailUrl: 'https://files.cloudkuimages.guru/images/4c70abcb66ee.jpeg',
          mediaType: 1,
          previewType: 'PHOTO',
          renderLargerThumbnail: true,
          sourceUrl: ''
        }
      }
    },
    { quoted: m }
  )
}

handler.help = ['leaderboard']
handler.tags = ['game', 'info']
handler.command = ['leaderboard', 'lb']
handler.register = true

export default handler
