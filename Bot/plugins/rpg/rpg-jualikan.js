import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.ikan) user.ikan = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1

  const harga = {
    // SAMPAH
    'sampah plastik': { emoji: '🗑️♻️', harga: 5000 },'ban bekas': { emoji: '🛞🗑️', harga: 5000 },'botol kaca': { emoji: '🍾🗑️', harga: 5000 },
    'kaleng': { emoji: '🥫🗑️', harga: 5000 },'kayu hanyut': { emoji: '🪵🌊', harga: 5000 },'jaring rusak': { emoji: '🕸️💔', harga: 5000 },
    'sepatu': { emoji: '👟🗑️', harga: 5000 },'botol': { emoji: '🍶🗑️', harga: 5000 },'kantong plastik': { emoji: '🛍️🗑️', harga: 5000 },
    'duri': { emoji: '🌵🗑️', harga: 5000 },'batu': { emoji: '🪨🌊', harga: 5000 },'rumput': { emoji: '🌱🌊', harga: 5000 },
    'lumpur': { emoji: '🟤🌊', harga: 5000 },'daun': { emoji: '🍃🌊', harga: 5000 },'ranting': { emoji: '🌿🌊', harga: 5000 },
    'tali': { emoji: '🪢🗑️', harga: 5000 },'kawat': { emoji: '🔩🗑️', harga: 5000 },'pecahan kaca': { emoji: '💔🗑️', harga: 5000 },
    'kaos kaki': { emoji: '🧦', harga: 5000 },'mie instan': { emoji: '🍜', harga: 5000 },'pakaian dalam': { emoji: '🩲', harga: 5000 },
    // IKAN MURAH
    'ikan teri': { emoji: '🐟📏', harga: 8000 },'ikan pepetek': { emoji: '🐟👀', harga: 8000 },'ikan layang': { emoji: '🐟🪁', harga: 8000 },
    'ikan kembung kecil': { emoji: '🐟🥫', harga: 8000 },'ikan selar': { emoji: '🐟🏃', harga: 8000 },'ikan tembang': { emoji: '🐟🎵', harga: 8000 },
    'ikan julung': { emoji: '🐟🪡', harga: 8000 },
    // IKAN MENENGAH
    'ikan mas': { emoji: '🐟🧡', harga: 25000 },'ikan nila': { emoji: '🐟💙', harga: 25000 },'ikan lele': { emoji: '🐟🐈', harga: 25000 },
    'ikan patin': { emoji: '🐟🐷', harga: 25000 },'ikan gurame': { emoji: '🐟🍽️', harga: 25000 },'ikan mujair': { emoji: '🐟😂', harga: 25000 },
    'ikan gabus': { emoji: '🐟🔫', harga: 25000 },'ikan wader': { emoji: '🐟🌾', harga: 25000 },'ikan seluang': { emoji: '🐟⚡', harga: 25000 },
    // IKAN MAHAL
    'kakap': { emoji: '🐟🎣', harga: 60000 },'kerapu kecil': { emoji: '🐟🏡', harga: 60000 },'sarden': { emoji: '🐟🥫', harga: 60000 },
    'makarel': { emoji: '🐟', harga: 60000 },'kembung': { emoji: '🐟🥫', harga: 60000 },'tongkol': { emoji: '🐟🔨', harga: 60000 },
    'cumi': { emoji: '🦑🌊', harga: 60000 },'gurita kecil': { emoji: '🐙', harga: 60000 },'udang': { emoji: '🦐🍤', harga: 60000 },
    'kepiting': { emoji: '🦀🍴', harga: 60000 },'lobster': { emoji: '🦞🍽️', harga: 60000 },'kerang hijau': { emoji: '🦪💚', harga: 60000 },
    'kerang darah': { emoji: '🦪🩸', harga: 60000 },'siput': { emoji: '🐌🐚', harga: 60000 },'landak laut kecil': { emoji: '🦔🌊', harga: 60000 },
    'anemon': { emoji: '🌸🌊', harga: 60000 },'rumput laut': { emoji: '🌿🌊', harga: 60000 },'karang': { emoji: '🪸🪨', harga: 60000 },
    'peti karat': { emoji: '📦', harga: 60000 },'koin tembaga': { emoji: '🪙', harga: 60000 },'mutiara retak': { emoji: '🦪', harga: 60000 },
    'cangkir pecah': { emoji: '🏺', harga: 60000 },
    // IKAN LEGEND
    'hiu hitam': { emoji: '🦈⬛', harga: 125000 },'hiu biru': { emoji: '🦈💙', harga: 125000 },'lumba lumba': { emoji: '🐬🌊', harga: 125000 },
    'paus pembunuh': { emoji: '🐋🔪', harga: 125000 },'penyu hijau': { emoji: '🐢💚', harga: 125000 },'ikan pari': { emoji: '🛸🌊', harga: 125000 },
    'kerapu': { emoji: '🐟🏠', harga: 125000 },'tuna': { emoji: '🐟🥫', harga: 125000 },'salmon': { emoji: '🐟🍣', harga: 125000 },
    'barakuda': { emoji: '🐟🗡️', harga: 125000 },'ikan todak': { emoji: '🐟⚔️', harga: 125000 },'ikan terbang': { emoji: '🐟✈️', harga: 125000 },
    'ubur ubur': { emoji: '🪼🌊', harga: 125000 },'ubur ubur listrik': { emoji: '🪼⚡', harga: 125000 },'bintang laut ungu': { emoji: '⭐💜', harga: 125000 },
    'karang keras': { emoji: '🪸🪨', harga: 125000 },'kerang': { emoji: '🦪🐚', harga: 125000 },'peti kayu': { emoji: '🪵', harga: 125000 },
    'koin perak': { emoji: '🪙', harga: 125000 },'mutiara biasa': { emoji: '⚪', harga: 125000 },'karang antik': { emoji: '🪸', harga: 125000 },
    // IKAN MYTHIC
    'hiu putih': { emoji: '🦈⬜', harga: 250000 },'hiu harimau': { emoji: '🦈🐅', harga: 250000 },'hiu martil': { emoji: '🦈🔨', harga: 250000 },
    'paus orca': { emoji: '🐋🖤', harga: 250000 },'paus biru': { emoji: '🐋💙', harga: 250000 },'penyu raksasa': { emoji: '🐢🏞️', harga: 250000 },
    'ikan pari manta': { emoji: '🛸🌊', harga: 250000 },'ikan napoleon': { emoji: '🐟👨‍⚖️', harga: 250000 },'kerapu raksasa': { emoji: '🐟🏰', harga: 250000 },
    'marlin': { emoji: '🐟🏹', harga: 250000 },'tuna sirip biru': { emoji: '🐟💙', harga: 250000 },'pedang laut': { emoji: '⚔️🐟', harga: 250000 },
    'ikan koi emas': { emoji: '🐟👑', harga: 250000 },'lobster raja': { emoji: '🦞👑', harga: 250000 },'kepiting raksasa': { emoji: '🦀🏰', harga: 250000 },
    'gurita raksasa': { emoji: '🐙🏢', harga: 250000 },'sotong raksasa': { emoji: '🦑🏢', harga: 250000 },'lionfish': { emoji: '🐠🦁', harga: 250000 },
    'ikan badut': { emoji: '🐠🤡', harga: 250000 },'ikan kupu': { emoji: '🐠🦋', harga: 250000 },'ikan malaikat': { emoji: '🐠😇', harga: 250000 },
    'ikan diskus': { emoji: '🐠💿', harga: 250000 },'ikan arwana': { emoji: '🐟💎', harga: 250000 },'ikan arapaima': { emoji: '🐟🏞️', harga: 250000 },
    'piranha': { emoji: '🐟🩸', harga: 250000 },'belut listrik': { emoji: '🐍⚡', harga: 250000 },'ikan duyung': { emoji: '🧜‍♀️🐟', harga: 250000 },
    'ubur ubur bulan': { emoji: '🪼🌙', harga: 250000 },'bintang laut': { emoji: '⭐🌊', harga: 250000 },'anemon laut': { emoji: '🌸🌊', harga: 250000 },
    'karang indah': { emoji: '🪸✨', harga: 250000 },'kerang mutiara': { emoji: '🦪💎', harga: 250000 },'siput laut': { emoji: '🐌🌊', harga: 250000 },
    'landak laut': { emoji: '🦔🌊', harga: 250000 },'peti besi': { emoji: '📦', harga: 250000 },'koin emas': { emoji: '🪙', harga: 250000 },
    'mutiara hitam': { emoji: '⚫', harga: 250000 },'trisula patah': { emoji: '🔱', harga: 250000 },
    // IKAN BOS
    'kraken': { emoji: '🦑🌊', harga: 500000 },'megladon': { emoji: '🦈👑', harga: 500000 },'leviathan': { emoji: '🐉🌊', harga: 500000 },
    'sea dragon': { emoji: '🐲🌊', harga: 500000 },'phoenix laut': { emoji: '🔥🦅', harga: 500000 },'hydra laut': { emoji: '🐍🌊', harga: 500000 },
    'cerberus laut': { emoji: '🐺🌊', harga: 500000 },'titan kura': { emoji: '🐢🏔️', harga: 500000 },'paus putih': { emoji: '🐋⚪', harga: 500000 },
    'ikan dewa': { emoji: '🐟✨', harga: 500000 },'naga laut': { emoji: '🐉🌊', harga: 500000 },'raja ubur': { emoji: '🪼👑', harga: 500000 },
    'penjaga karang': { emoji: '🪸🛡️', harga: 500000 },'putri duyung': { emoji: '🧜‍♀️👑', harga: 500000 },'dewa katak': { emoji: '🐸⚡', harga: 500000 },
    'kuda laut kristal': { emoji: '🐴💎', harga: 500000 },'peti karun': { emoji: '💰', harga: 500000 },'koin emas kuno': { emoji: '🪙', harga: 500000 },
    'mutiara raja': { emoji: '👑⚪', harga: 500000 },'mahkota karang': { emoji: '👑🪸', harga: 500000 },
    // IKAN GOD
    'poseidon': { emoji: '🌊🔱', harga: 2500000 },'flying dutchman': { emoji: '👻⛵', harga: 2500000 },'aquaman': { emoji: '🦸‍♂️🌊', harga: 2500000 },
    'godzilla': { emoji: '🦖🌊', harga: 2500000 },'zeus laut': { emoji: '⚡🌊', harga: 2500000 },'atlas laut': { emoji: '🏔️🌊', harga: 2500000 },
    'kitsune laut': { emoji: '🦊🌊', harga: 2500000 },'leviathan primordial': { emoji: '🐉🌊', harga: 2500000 },'davy jones': { emoji: '🏴‍☠️🦑', harga: 2500000 },
    'caylpso': { emoji: '🧜‍♀️🌊', harga: 2500000 },'ariel little mermaid': { emoji: '🧜‍♀️❤️', harga: 2500000 },'treasure chest': { emoji: '💎📦', harga: 2500000 },
    'ancient relic': { emoji: '🏺✨', harga: 2500000 },'pirate gold': { emoji: '💰🏴‍☠️', harga: 2500000 },'mermaid tear': { emoji: '💧🧜‍♀️', harga: 2500000 }
  }

  if (!text) {
    let cap = `*╭───「 🎣 JUAL IKAN 」───╮*\n`
    cap += `│ ${isPrem? '👑 Bonus +10%' : '👤 User'}\n`
    cap += `*╰─────────────────╯*\n\n`
    cap += `*💰 CARA:* ${usedPrefix}jualikan [nama] [jumlah/all]\n\n`
    cap += `*🎣 DAFTAR HARGA*\n`
    Object.entries(harga).slice(0, 50).forEach(([k,v]) => {
      let h = Math.floor(v.harga * sellBonus)
      cap += `├ ${v.emoji} ${k.toUpperCase()} : Rp ${h.toLocaleString()}\n`
    })
    cap += `└...dan ${Object.keys(harga).length - 50} item lainnya`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ')
  let item = args[0]
  let amount = args[1] === 'all'? 'all' : (parseInt(args[1]) || 1)
  if (!harga[item]) return m.reply('❌ Ikan tidak ada.')
  let stok = user.ikan[item] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${item}`)
  let jual = amount === 'all'? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[item].harga * sellBonus) * jual
  user.ikan[item] -= jual
  if(user.ikan[item] <= 0) delete user.ikan[item]
  wdb.money[m.sender] += hasil
  saveDB(wdb)
  return m.reply(`✅ *BERHASIL JUAL!*\n\n${harga[item].emoji} ${item} x${jual}\n💰 +Rp ${hasil.toLocaleString()}`)
}

handler.help = ['jualikan <nama> <jumlah/all>']
handler.tags = ['rpg']
handler.command = /^(jualikan)$/i
handler.group = true
export default handler