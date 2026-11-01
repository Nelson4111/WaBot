import { formatFunCheck } from '../../lib/funCheck.js'

let handler = async (m, { conn, command, text }) => {
  let who = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  let score = Number(cek1[Math.floor(Math.random() * cek1.length)])
  let subject = text?.trim()
  let isRate = command.toLowerCase() === 'rate'
  let teks = formatFunCheck({
    title: `PERTANYAAN ${command.toUpperCase()}`,
    user: `@${who.split('@')[0]}`,
    userLabel: 'Nama',
    score,
    subject: isRate ? subject : undefined,
    details: [{ label: 'Hasil', value: `${score}%` }],
    verdict: isRate && subject ? `Kata "${subject}" mendapat nilai ${score}%.` : undefined
  })

  await conn.sendMessage(
    m.chat,
    {
      text: teks,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.tags = ['fun']
handler.command = [
  'goblokcek','jelekcek','gaycek','rate','lesbicek',
  'cantikcek','begocek','suhucek','pintercek','jagocek','nolepcek',
  'babicek','bebancek','baikcek','jahatcek','anjingcek','haramcek',
  'pakboycek','pakgirlcek','sangecek','bapercek','fakboycek','alimcek',
  'fakgirlcek','kerencek','wibucek','pasarkascek','kulcek',

  'cekgoblok','cekjelek','cekgay','ceklesbi','cekcantik',
  'cekbego','ceksuhu','cekpinter','cekjago','ceknolep','cekbabi',
  'cekbeban','cekbaik','cekjahat','cekanjing','cekharam','cekpakboy',
  'cekpakgirl','ceksange','cekbaper','cekfakboy','cekalim',
  'cekfakgirl','cekkeren','cekwibu','cekpasarkas','cekkul'
]
handler.help = [...handler.command, 'rate <kata>']

handler.limit = true
export default handler

// ===============================
// DATA RANDOM 1–100
// ===============================
global.cek1 = Array.from({ length: 100 }, (_, i) => (i + 1).toString())