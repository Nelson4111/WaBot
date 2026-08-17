import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

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

  const resep = {
    'roti_tawar': { emoji: '🍞', exp: 20 },'mie_goreng': { emoji: '🍜', exp: 40 },'sate_ikan': { emoji: '🍢', exp: 60 },
    'salad_buah': { emoji: '🥗', exp: 80 },'sup_ikan': { emoji: '🍲', exp: 70 },'taco_ikan': { emoji: '🌮', exp: 65 },
    'udang_goreng': { emoji: '🍤', exp: 90 },'jus_durian': { emoji: '🥛', exp: 200 },'cumi_goreng': { emoji: '🦑', exp: 100 },
    'wine': { emoji: '🍷', exp: 150 },'kepiting_rebus': { emoji: '🦀', exp: 110 },'sushi': { emoji: '🍣', exp: 130 },
    'sashimi': { emoji: '🍣', exp: 140 },'lobster_bakar': { emoji: '🦞', exp: 150 },'tuna_panggang': { emoji: '🐟', exp: 180 },
    'salmon_asap': { emoji: '🐟', exp: 185 },'steak_hiu': { emoji: '🦈', exp: 200 },'pari_bakar': { emoji: '🛸', exp: 210 },
    'penyu_panggang': { emoji: '🐢', exp: 230 },'steak_emas': { emoji: '🥩', exp: 500 },'diamond_cake': { emoji: '🎂', exp: 1000 },
    'sop_kraken': { emoji: '🦑', exp: 800 },'sate_megalodon': { emoji: '🦈', exp: 900 },'sup_leviathan': { emoji: '🐉', exp: 1000 },
    'sea_dragon_grill': { emoji: '🐲', exp: 1100 },'hydra_stew': { emoji: '🐍', exp: 1300 },'kura_titan_soup': { emoji: '🐢', exp: 1500 },
    'paus_putih_steak': { emoji: '🐋', exp: 1600 },'naga_laut_bakar': { emoji: '🐉', exp: 1800 },'raja_ubur_jelly': { emoji: '🪼', exp: 1900 },
    'steak_godzilla': { emoji: '🦖', exp: 15000 }
  }

  function cekLevelUp(u) {
    let levelup = ''
    while(u.exp >= u.level * 500) {
      u.exp -= u.level * 500
      u.level++
      levelup += `\n│ ✨ *LEVEL UP!* → Sekarang Lv.${u.level}`
    }
    return levelup
  }

  let args = text? text.toLowerCase().split(' ') : []
  let item = args.join('_')
  let target = m.mentionedJid[0] || m.quoted?.sender

  if(!text) {
    let cap = `┌───❏「 🍽️ KULINER PRIBADI 」❏\n`
    let ada = false
    let list = []
    for(let nama in user.masakan) {
      if(user.masakan[nama] > 0) {
        list.push({nama, jml: user.masakan[nama]})
        ada = true
      }
    }
    if(!ada) cap += `│\n│ _Perut keroncongan... Masak dulu yuk!_\n│\n`
    else {
      list.sort((a,b) => b.jml - a.jml)
      list.forEach((v,i) => {
        cap += `│ ${i+1}. ${resep[v.nama]?.emoji || '🍽️'} ${formatNama(v.nama).padEnd(18)} x${v.jml}\n`
      })
    }
    cap += `└───────────────────\n\n`
    cap += `🍳 *Masak:* ${usedPrefix}masak [nama]\n`
    cap += `🧊 *Lihat Kulkas:* ${usedPrefix}kulkas\n`
    cap += `😋 *Makan:* ${usedPrefix}makan sushi\n`
    cap += `💞 *Traktir:* ${usedPrefix}makan sushi @tag`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  if(!resep[item]) return m.reply(`❌ Resep *${formatNama(item)}* tidak ada di buku masak`)
  if(!user.masakan[item] || user.masakan[item] <= 0) return m.reply(`❌ Stok *${formatNama(item)}* di kulkas habis`)

  user.masakan[item] -= 1
  if(user.masakan[item] <= 0) delete user.masakan[item]

  let expTotal = resep[item].exp
  let expPerOrang = target? Math.floor(expTotal / 2) : expTotal

  user.exp += expPerOrang
  let levelup1 = cekLevelUp(user)

  let namaTarget = target? await conn.getName(target) : null
  let quotes = [
    `Hmm.. enaknya ${formatNama(item)} ini 😋`,
    `*crunch* *nyam* Mantap jiwa!`,
    `Perut langsung anget setelah makan ini`,
    `Masakan terbaik hari ini!`
  ]
  let quote = quotes[Math.floor(Math.random() * quotes.length)]

  let cap = `┌───❏「 🍽️ WAKTU MAKAN 」❏\n`
  cap += `│ Menu Spesial : ${resep[item].emoji} ${formatNama(item)}\n`
  if(target) cap += `│ Bersama : ${m.pushName} & ${namaTarget}\n`
  else cap += `│ Penikmat : ${m.pushName}\n`
  cap += `└───────────────────\n\n`

  cap += `${quote}\n\n`
  cap += `🍀 *${m.pushName}* mendapat pengalaman +${expPerOrang}${levelup1}`

  if(target) {
    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(userTarget) {
      userTarget.exp += expPerOrang
      let levelup2 = cekLevelUp(userTarget)
      cap += `\n\n💞 *${namaTarget}* juga ikut menikmati dan dapat +${expPerOrang}${levelup2}`
      cap += `\n\n_“Makan bareng emang paling nikmat ya~”_`
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