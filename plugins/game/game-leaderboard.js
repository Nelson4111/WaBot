import PhoneNumber from 'awesome-phonenumber'
import { loadDB } from '../../lib/waifuHelper.js'
import { getLevelRole } from '../../lib/levelling.js'

const rupiah = n => 'Rp ' + n.toLocaleString('id-ID')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
`Pilih leaderboard:

${usedPrefix + command} level
${usedPrefix + command} xp
${usedPrefix + command} uang
${usedPrefix + command} limit`
    )

  const usersDB = global.db.data.users || {}
  const wdb = loadDB()

  let users = Object.keys(usersDB).map(jid => {
    const u = usersDB[jid]
    const name = u.registered
      ? u.name || conn.getName(jid)
      : conn.getName(jid)

    const level = u.level || 0
    return {
      jid,
      name,
      money: wdb.money?.[jid] || 0,
      limit: u.limit || 0,
      xp: u.exp || 0,
      level,
      role: getLevelRole(level)
    }
  })

  if (!users.length) return m.reply('Belum ada data user')

  let key = ''
  let bodyAd = ''
  let format = v => v

  switch (text.toLowerCase()) {
    case 'level':
    case 'lvl':
      key = 'level'
      bodyAd = 'Top LB Level Global'
      format = v => `Lv. ${v}`
      break

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
      format = v => `${v.toLocaleString('id-ID')} XP`
      break

    default:
      return m.reply('Gunakan: level | xp | uang | limit')
  }

  users.sort((a, b) => b[key] - a[key])
  const top = users.slice(0, 10)

  let textRes = 
`━━━━━ LEADERBOARD ━━━━
Total Pemain : ${users.length}
Kategori     : ${key === 'money' ? 'Uang' : key === 'level' ? 'Level' : key.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
`

top.forEach((u, i) => {
  const nomor = PhoneNumber('+' + u.jid.split('@')[0]).getNumber('international')
  const isPrem = usersDB[u.jid]?.premiumTime > 0 ? ' [PREMIUM]' : ''
  const roleTitle = key === 'level' || key === 'xp' ? ` (${u.role})` : ''

  textRes +=
`${i + 1}. ${u.name}${isPrem}${roleTitle}
   Nomor : ${nomor}
   ${key === 'money' ? 'Uang' : key === 'level' ? 'Level' : key.toUpperCase()} : ${format(u[key])}

`
})

const pos = users.findIndex(u => u.jid === m.sender)
if (pos !== -1) {
  const me = users[pos]
  const isPremMe = usersDB[m.sender]?.premiumTime > 0 ? ' [PREMIUM]' : ''
  const myRole = key === 'level' || key === 'xp' ? ` (${me.role})` : ''

  textRes +=
`━━━━━ POSISI KAMU ━━━━━
${pos + 1}. ${me.name}${isPremMe}${myRole}
   ${key === 'money' ? 'Uang' : key === 'level' ? 'Level' : key.toUpperCase()} : ${format(me[key])}
`
}

textRes += `━━━━━━━━━━━━━━━━━━━━`
textRes = '```' + textRes + '```'

  const footer = `${global.namebot || 'Avelia'} • Leaderboard System`
  const buttons = [
    ['👤 Profil Saya', '.profile'],
    ['📊 Cek Level', '.level']
  ]
  const bannerUrl = 'https://files.cloudkuimages.guru/images/4c70abcb66ee.jpeg'

  if (typeof conn.sendButtonV2 === 'function') {
    try {
      return await conn.sendButtonV2(m.chat, {
        title: '🏆 TOP LEADERBOARD 🏆',
        subtitle: bodyAd,
        text: textRes,
        footer,
        buffer: bannerUrl,
        buttons,
        contextInfo: { mentions: top.map(u => u.jid) }
      }, m)
    } catch (e) {
      console.warn('[Leaderboard sendButtonV2 failed]:', e?.message)
    }
  }

  await conn.sendMessage(
    m.chat,
    {
      text: textRes,
      mentions: top.map(u => u.jid)
    },
    { quoted: m }
  )
}

handler.help = ['leaderboard', 'lb']
handler.tags = ['game', 'info']
handler.command = ['leaderboard', 'lb']
handler.register = true

export default handler
