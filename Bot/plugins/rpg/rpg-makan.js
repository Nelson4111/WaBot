import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix }) => { // FIX: tambah usedPrefix
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.masakan) user.masakan = {}

  const resep = {
    'roti tawar': { emoji: '🍞', exp: 20 },'mie goreng': { emoji: '🍜', exp: 40 },'sate ikan': { emoji: '🍢', exp: 60 },
    'salad buah': { emoji: '🥗', exp: 80 },'sup ikan': { emoji: '🍲', exp: 70 },'taco ikan': { emoji: '🌮', exp: 65 },
    'udang goreng': { emoji: '🍤', exp: 90 },'jus durian': { emoji: '🥛', exp: 200 },'cumi goreng': { emoji: '🦑', exp: 100 },
    'wine': { emoji: '🍷', exp: 150 },'kepiting rebus': { emoji: '🦀', exp: 110 },'sushi': { emoji: '🍣', exp: 130 },
    'sashimi': { emoji: '🍣', exp: 140 },'lobster bakar': { emoji: '🦞', exp: 150 },'tuna panggang': { emoji: '🐟', exp: 180 },
    'salmon asap': { emoji: '🐟', exp: 185 },'steak hiu': { emoji: '🦈', exp: 200 },'pari bakar': { emoji: '🛸', exp: 210 },
    'penyu panggang': { emoji: '🐢', exp: 230 },'steak emas': { emoji: '🥩', exp: 500 },'diamond cake': { emoji: '🎂', exp: 1000 },
    'sop kraken': { emoji: '🦑', exp: 800 },'sate megalodon': { emoji: '🦈', exp: 900 },'sup leviathan': { emoji: '🐉', exp: 1000 },
    'sea dragon grill': { emoji: '🐲', exp: 1100 },'hydra stew': { emoji: '🐍', exp: 1300 },'kura titan soup': { emoji: '🐢', exp: 1500 },
    'paus putih steak': { emoji: '🐋', exp: 1600 },'naga laut bakar': { emoji: '🐉', exp: 1800 },'raja ubur jelly': { emoji: '🪼', exp: 1900 },
    'steak godzilla': { emoji: '🦖', exp: 15000 }
  }

  function cekLevelUp(u) { // FIX: fungsi level up biar ga rugi exp
    let levelup = ''
    while(u.exp >= u.level * 500) {
      u.exp -= u.level * 500
      u.level++
      levelup += `\n🎉 *LEVEL UP!* Lv.${u.level}`
    }
    return levelup
  }

  let args = text? text.toLowerCase().split(' ') : []
  let item = args[0]
  let target = m.mentionedJid[0] || m.quoted?.sender

  if(!item) {
    let cap = `*───「 MAKAN KAMU 」───*\n\n`
    let ada = false
    for(let nama in user.masakan) {
      if(user.masakan[nama] > 0) {
        cap += `${resep[nama]?.emoji || '🍽️'} ${nama} x${user.masakan[nama]}\n`
        ada = true
      }
    }
    if(!ada) cap += `_Kamu belum punya masakan_\n`
    cap += `\nCara makan sendiri: *${usedPrefix}makan sushi*\nCara traktir: *${usedPrefix}makan sushi @tag*`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  if(!resep[item]) return m.reply(`❌ Masakan ${item} tidak bisa dimakan`)
  if(!user.masakan[item] || user.masakan[item] <= 0) return m.reply(`❌ Kamu tidak punya masakan ${item}`)

  user.masakan[item] -= 1 // ambil 1
  if(user.masakan[item] <= 0) delete user.masakan[item] // FIX: hapus biar ga -1

  let expTotal = resep[item].exp
  let expPerOrang = target? Math.floor(expTotal / 2) : expTotal

  user.exp += expPerOrang
  let levelup1 = cekLevelUp(user)

  let cap = `🍽️ *NYAM NYAM BARENG!*\n\nKamu makan ${resep[item].emoji} ${item}\n✨ Exp kamu: +${expPerOrang}${levelup1}`

  if(target) {
    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(userTarget) {
      userTarget.exp += expPerOrang
      let levelup2 = cekLevelUp(userTarget)
      cap += `\n\n@${target.split('@')[0]} juga dapet: +${expPerOrang}${levelup2}`
    }
  }

  saveDB(wdb)
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q', [m.sender, target].filter(Boolean))
}

handler.help = ['makan <nama> [@tag]']
handler.tags = ['rpg']
handler.command = /^(makan)$/i
handler.group = true
export default handler