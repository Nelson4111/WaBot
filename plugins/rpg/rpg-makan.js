import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import { masakanResep, normalizeMasakanKey, formatMasakanNama } from '../../lib/rpg-masakanData.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}

  let isChanged = false
  // MIGRASI DATA LAMA
  let masakanBaru = {}
  for(let nama in user.masakan){
    let keyBaru = nama.replace(/ /g, '_')
    if(user.masakan[nama] > 0){
      masakanBaru[keyBaru] = (masakanBaru[keyBaru] || 0) + user.masakan[nama]
      if(keyBaru!== nama) isChanged = true
    }
  }
  if(isChanged){
    user.masakan = masakanBaru
    saveDB(wdb)
  }

  function cekLevelUp(u) {
    let levelup = ''
    while(u.exp >= u.level * 500) {
      u.exp -= u.level * 500
      u.level++
      levelup += `\n> ↳ ✨ *LEVEL UP!* Sekarang Lv.${u.level}`
    }
    return levelup
  }

  let args = text ? text.toLowerCase().split(/\s+/).filter(Boolean) : []
  let inputItem = args.filter(arg => !arg.startsWith('@')).join(' ')
  let item = normalizeMasakanKey(inputItem)
  let target = m.mentionedJid[0] || m.quoted?.sender

  const kulkasKeys = Object.keys(user.masakan).filter(key => user.masakan[key] > 0)
  if (args.length === 1 && /^\d+$/.test(args[0])) item = kulkasKeys[Number(args[0]) - 1]

  if(!text) {
    let cap = `╭─❏「 🍽️ RPG KULINER CENTER 」❏\n`
    cap += `│ 🍽️ *KULINER PRIBADI*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    let ada = false
    let list = []

    for(let nama in user.masakan) {
      if(user.masakan[nama] > 0) {
        list.push({nama, jml: user.masakan[nama]})
        ada = true
      }
    }

    if(!ada) {
      cap += `🍽️ *KULKAS KOSONG*\n`
      cap += `> ↳ Masak dulu yuk!\n`
    } else {
      list.sort((a,b) => b.jml - a.jml)

      cap += `🍽️ *MASAKAN TERSEDIA*\n`
      list.forEach((v,i) => {
        const recipe = masakanResep[v.nama] || {}
        cap += `> ${i + 1}. ${recipe.emoji || '🍽️'} *${formatMasakanNama(v.nama)}* ×${v.jml}\n`
      })
    }

    cap += `\n─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *CARA MENGGUNAKAN*\n`
    cap += `> ↳ *${usedPrefix}masak [nama]*\n`
    cap += `> ↳ Masak makanan\n\n`
    cap += `> ↳ *${usedPrefix}kulkas*\n`
    cap += `> ↳ Lihat isi kulkas\n\n`
    cap += `> ↳ *${usedPrefix}makan sushi*\n`
    cap += `> ↳ Makan masakan\n\n`
    cap += `> ↳ *${usedPrefix}makan sushi @tag*\n`
    cap += `> ↳ Traktir seseorang\n`

    cap += `\n─━━━━━━━━━━━━━━─`

    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  if(!user.masakan[item] || user.masakan[item] <= 0) return m.reply(`❌ Stok *${formatMasakanNama(item)}* di kulkas habis`)

  user.masakan[item] -= 1
  if(user.masakan[item] <= 0) delete user.masakan[item]

  const recipe = masakanResep[item] || { emoji: '🍽️', exp: 0 }
  let expTotal = recipe.exp || 0
  let expPerOrang = target ? Math.floor(expTotal / 2) : expTotal

  user.exp += expPerOrang
  let levelup1 = cekLevelUp(user)

  let namaTarget = target? await conn.getName(target) : null

  let quotes = [
  `Hmm.. enaknya ${formatMasakanNama(item)} ini 😋`,
  `*crunch* *nyam* ${formatMasakanNama(item)}-nya mantap jiwa!`,
  `Perut langsung anget setelah makan ${formatMasakanNama(item)} ini 🔥`,
  `${formatMasakanNama(item)} ini sih masakan terbaik hari ini!`,
  `Wah, ${formatMasakanNama(item)} ini nagih banget 🤤`,
  `Sekali suap ${formatMasakanNama(item)}, langsung pengen nambah!`,
  `${formatMasakanNama(item)}-nya enak banget, nggak bisa berhenti makan 😋`,
  `Aduh, nikmatnya ${formatMasakanNama(item)} ini nggak main-main 🤤`,
  `${formatMasakanNama(item)} ini lembut, gurih, dan pas banget!`,
  `Perut kenyang setelah makan ${formatMasakanNama(item)} ini ❤️`,
  `Ini baru ${formatMasakanNama(item)} yang mantap!`,
  `*hap* *hap* ${formatMasakanNama(item)} habis dalam sekejap!`,
  `Rasanya bikin susah berhenti makan ${formatMasakanNama(item)} 😋`,
  `Wah, ${formatMasakanNama(item)} ini kok enak banget sih?!`,
  `Satu porsi ${formatMasakanNama(item)} kayaknya nggak cukup deh.`,
  `Cita rasa ${formatMasakanNama(item)} ini juara! 🏆`,
  `${formatMasakanNama(item)} berhasil bikin mood naik!`,
  `Nikmatnya ${formatMasakanNama(item)} sampai suapan terakhir 🤤`,
  `Perut bilang cukup, tapi mulut masih minta ${formatMasakanNama(item)} lagi!`,
  `Fix, ${formatMasakanNama(item)} ini masuk daftar favorit!`
]

  let quote = quotes[Math.floor(Math.random() * quotes.length)]

  let cap = `╭─❏「 🍽️ RPG KULINER CENTER 」❏\n`
  cap += `│ 🍽️ *WAKTU MAKAN*\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  cap += `🍽️ *MENU SPESIAL*\n`
  cap += `> ↳ ${recipe.emoji} *${formatMasakanNama(item)}*\n\n`

  if(target) {
    cap += `💞 *MAKAN BERSAMA*\n`
    cap += `> ↳ ${m.pushName} & ${namaTarget}\n`
  } else {
    cap += `👤 *PENIKMAT*\n`
    cap += `> ↳ ${m.pushName}\n`
  }

  cap += `\n─━━━━━━━━━━━━━━─\n\n`

  cap += `✨ *PENGALAMAN DIDAPAT*\n`
  cap += `> ↳ 🍀 ${m.pushName}: +${expPerOrang} XP${levelup1}\n`

  if(target) {
    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg

    if(userTarget) {
      userTarget.exp += expPerOrang
      let levelup2 = cekLevelUp(userTarget)
      cap += `> ↳ 💞 ${namaTarget}: +${expPerOrang} XP${levelup2}\n`
    }
  }

  cap += `\n─━━━━━━━━━━━━━━─\n\n`
  cap += `💬 *PESAN*\n`
  cap += `> ↳ ${quote}\n`
  cap += `\n─━━━━━━━━━━━━━━─`

  saveDB(wdb)
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender, target].filter(Boolean))
}

handler.help = ['makan <nama> [@tag]']
handler.tags = ['rpg']
handler.command = /^(makan)$/i
handler.group = true

export default handler