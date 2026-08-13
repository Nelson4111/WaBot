import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {

  // ===============================
  // AMBIL TARGET (REPLY > TAG > SELF)
  // ===============================
  let who =
    m.quoted?.sender ||
    m.mentionedJid?.[0] ||
    m.sender

  let name = await conn.getName(who)

  // RANDOM PERSENTASE
  let hasil = cek1[Math.floor(Math.random() * cek1.length)]

  let teks = `
 _pertanyaan ${command.toUpperCase()}_

 Nama : @${who.split('@')[0]}
 Hasil : *${hasil}%*
`.trim()

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
handler.help = handler.command = [
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

handler.limit = true
export default handler

// ===============================
// DATA RANDOM 1–100
// ===============================
global.cek1 = Array.from({ length: 100 }, (_, i) => (i + 1).toString())