import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.ikan) user.ikan = {}

  const isPrem = global.db.data.users[m.sender]?.premium
  const sellBonus = isPrem? 1.1 : 1

  // HARGA PAKE _ SEMUA - SAMA PERSIS KAYAK MANCING.JS KAMU
  const harga = {
    // TRASH 5000
    'sampah_plastik': { emoji: '🗑️♻️', harga: 5000 },'ban_bekas': { emoji: '🛞🗑️', harga: 5000 },'botol_kaca': { emoji: '🍾🗑️', harga: 5000 },
    'kaleng': { emoji: '🥫🗑️', harga: 5000 },'kayu_hanyut': { emoji: '🪵🌊', harga: 5000 },'jaring_rusak': { emoji: '🕸️💔', harga: 5000 },
    'sepatu': { emoji: '👟🗑️', harga: 5000 },'botol': { emoji: '🍶🗑️', harga: 5000 },'kantong_plastik': { emoji: '🛍️🗑️', harga: 5000 },
    'duri': { emoji: '🌵🗑️', harga: 5000 },'batu': { emoji: '🪨🌊', harga: 5000 },'rumput': { emoji: '🌱🌊', harga: 5000 },
    'lumpur': { emoji: '🟤🌊', harga: 5000 },'daun': { emoji: '🍃🌊', harga: 5000 },'ranting': { emoji: '🌿🌊', harga: 5000 },
    'tali': { emoji: '🪢🗑️', harga: 5000 },'kawat': { emoji: '🔩🗑️', harga: 5000 },'pecahan_kaca': { emoji: '💔🗑️', harga: 5000 },
    'kaos_kaki': { emoji: '🧦', harga: 5000 },'mie_instan': { emoji: '🍜', harga: 5000 },'pakaian_dalam': { emoji: '🩲', harga: 5000 },

    // COMMON 8000
    'ikan_teri': { emoji: '🐟📏', harga: 8000 },'ikan_pepetek': { emoji: '🐟👀', harga: 8000 },'ikan_layang': { emoji: '🐟🪁', harga: 8000 },
    'ikan_kembung_kecil': { emoji: '🐟🥫', harga: 8000 },'ikan_selar': { emoji: '🐟🏃', harga: 8000 },'ikan_tembang': { emoji: '🐟🎵', harga: 8000 },
    'ikan_julung': { emoji: '🐟🪡', harga: 8000 },

    // UNCOMMON 25000
    'ikan_mas': { emoji: '🐟🧡', harga: 25000 },'ikan_nila': { emoji: '🐟💙', harga: 25000 },'ikan_lele': { emoji: '🐟🐈', harga: 25000 },
    'ikan_patin': { emoji: '🐟🐷', harga: 25000 },'ikan_gurame': { emoji: '🐟🍽️', harga: 25000 },'ikan_mujair': { emoji: '🐟😂', harga: 25000 },
    'ikan_gabus': { emoji: '🐟🔫', harga: 25000 },'ikan_wader': { emoji: '🐟🌾', harga: 25000 },'ikan_seluang': { emoji: '🐟⚡', harga: 25000 },

    // RARE 60000
    'kakap': { emoji: '🐟🎣', harga: 60000 },'kerapu_kecil': { emoji: '🐟🏡', harga: 60000 },'sarden': { emoji: '🐟🥫', harga: 60000 },
    'makarel': { emoji: '🐟', harga: 60000 },'kembung': { emoji: '🐟🥫', harga: 60000 },'tongkol': { emoji: '🐟🔨', harga: 60000 },
    'cumi': { emoji: '🦑🌊', harga: 60000 },'gurita_kecil': { emoji: '🐙', harga: 60000 },'udang': { emoji: '🦐🍤', harga: 60000 },
    'kepiting': { emoji: '🦀🍴', harga: 60000 },'lobster': { emoji: '🦞🍽️', harga: 60000 },'kerang_hijau': { emoji: '🦪💚', harga: 60000 },
    'kerang_darah': { emoji: '🦪🩸', harga: 60000 },'siput': { emoji: '🐌🐚', harga: 60000 },'landak_laut_kecil': { emoji: '🦔🌊', harga: 60000 },
    'anemon': { emoji: '🌸🌊', harga: 60000 },'rumput_laut': { emoji: '🌿🌊', harga: 60000 },'karang': { emoji: '🪸🪨', harga: 60000 },
    'peti_karat': { emoji: '📦', harga: 60000 },'koin_tembaga': { emoji: '🪙', harga: 60000 },'mutiara_retak': { emoji: '🦪', harga: 60000 },
    'cangkir_pecah': { emoji: '🏺', harga: 60000 },

    // EPIC 125000
    'hiu_hitam': { emoji: '🦈⬛', harga: 125000 },'hiu_biru': { emoji: '🦈💙', harga: 125000 },'lumba_lumba': { emoji: '🐬🌊', harga: 125000 },
    'paus_pembunuh': { emoji: '🐋🔪', harga: 125000 },'penyu_hijau': { emoji: '🐢💚', harga: 125000 },'ikan_pari': { emoji: '🛸🌊', harga: 125000 },
    'kerapu': { emoji: '🐟🏠', harga: 125000 },'tuna': { emoji: '🐟🥫', harga: 125000 },'salmon': { emoji: '🐟🍣', harga: 125000 },
    'barakuda': { emoji: '🐟🗡️', harga: 125000 },'ikan_todak': { emoji: '🐟⚔️', harga: 125000 },'ikan_terbang': { emoji: '🐟✈️', harga: 125000 },
    'ubur_ubur': { emoji: '🪼🌊', harga: 125000 },'ubur_ubur_listrik': { emoji: '🪼⚡', harga: 125000 },'bintang_laut_ungu': { emoji: '⭐💜', harga: 125000 },
    'karang_keras': { emoji: '🪸🪨', harga: 125000 },'kerang': { emoji: '🦪🐚', harga: 125000 },'peti_kayu': { emoji: '🪵', harga: 125000 },
    'koin_perak': { emoji: '🪙', harga: 125000 },'mutiara_biasa': { emoji: '⚪', harga: 125000 },'karang_antik': { emoji: '🪸', harga: 125000 },

    // LEGENDARY 250000
    'hiu_putih': { emoji: '🦈⬜', harga: 250000 },'hiu_harimau': { emoji: '🦈🐅', harga: 250000 },'hiu_martil': { emoji: '🦈🔨', harga: 250000 },
    'paus_orca': { emoji: '🐋🖤', harga: 250000 },'paus_biru': { emoji: '🐋💙', harga: 250000 },'penyu_raksasa': { emoji: '🐢🏞️', harga: 250000 },
    'ikan_pari_manta': { emoji: '🛸🌊', harga: 250000 },'ikan_napoleon': { emoji: '🐟👨‍⚖️', harga: 250000 },'kerapu_raksasa': { emoji: '🐟🏰', harga: 250000 },
    'marlin': { emoji: '🐟🏹', harga: 250000 },'tuna_sirip_biru': { emoji: '🐟💙', harga: 250000 },'pedang_laut': { emoji: '⚔️🐟', harga: 250000 },
    'ikan_koi_emas': { emoji: '🐟👑', harga: 250000 },'lobster_raja': { emoji: '🦞👑', harga: 250000 },'kepiting_raksasa': { emoji: '🦀🏰', harga: 250000 },
    'gurita_raksasa': { emoji: '🐙🏢', harga: 250000 },'sotong_raksasa': { emoji: '🦑🏢', harga: 250000 },'lionfish': { emoji: '🐠🦁', harga: 250000 },
    'ikan_badut': { emoji: '🐠🤡', harga: 250000 },'ikan_kupu': { emoji: '🐠🦋', harga: 250000 },'ikan_malaikat': { emoji: '🐠😇', harga: 250000 },
    'ikan_diskus': { emoji: '🐠💿', harga: 250000 },'ikan_arwana': { emoji: '🐟💎', harga: 250000 },'ikan_arapaima': { emoji: '🐟🏞️', harga: 250000 },
    'piranha': { emoji: '🐟🩸', harga: 250000 },'belut_listrik': { emoji: '🐍⚡', harga: 250000 },'ikan_duyung': { emoji: '🧜‍♀️🐟', harga: 250000 },
    'ubur_ubur_bulan': { emoji: '🪼🌙', harga: 250000 },'bintang_laut': { emoji: '⭐🌊', harga: 250000 },'anemon_laut': { emoji: '🌸🌊', harga: 250000 },
    'karang_indah': { emoji: '🪸✨', harga: 250000 },'kerang_mutia': { emoji: '🦪💎', harga: 250000 },'siput_laut': { emoji: '🐌🌊', harga: 250000 },
    'landak_laut': { emoji: '🦔🌊', harga: 250000 },'peti_besi': { emoji: '📦', harga: 250000 },'koin_emas': { emoji: '🪙', harga: 250000 },
    'mutiara_hitam': { emoji: '⚫', harga: 250000 },'trisula_patah': { emoji: '🔱', harga: 250000 },

    // MYTHIC 500000
    'kraken': { emoji: '🦑🌊', harga: 500000 },'megladon': { emoji: '🦈👑', harga: 500000 },'leviathan': { emoji: '🐉🌊', harga: 500000 },
    'sea_dragon': { emoji: '🐲🌊', harga: 500000 },'phoenix_laut': { emoji: '🔥🦅', harga: 500000 },'hydra_laut': { emoji: '🐍🌊', harga: 500000 },
    'cerberus_laut': { emoji: '🐺🌊', harga: 500000 },'titan_kura': { emoji: '🐢🏔️', harga: 500000 },'paus_putih': { emoji: '🐋⚪', harga: 500000 },
    'ikan_dewa': { emoji: '🐟✨', harga: 500000 },'naga_laut': { emoji: '🐉🌊', harga: 500000 },'raja_ubur': { emoji: '🪼👑', harga: 500000 },
    'penjaga_karang': { emoji: '🪸🛡️', harga: 500000 },'putri_duyung': { emoji: '🧜‍♀️👑', harga: 500000 },'dewa_katak': { emoji: '🐸⚡', harga: 500000 },
    'kuda_laut_kristal': { emoji: '🐴💎', harga: 500000 },'peti_karun': { emoji: '💰', harga: 500000 },'koin_emas_kuno': { emoji: '🪙', harga: 500000 },
    'mutiara_raja': { emoji: '👑⚪', harga: 500000 },'mahkota_karang': { emoji: '👑🪸', harga: 500000 },

    // SECRET 2500000
    'poseidon': { emoji: '🌊🔱', harga: 2500000 },'flying_dutchman': { emoji: '👻⛵', harga: 2500000 },'aquaman': { emoji: '🦸‍♂️🌊', harga: 2500000 },
    'godzilla': { emoji: '🦖🌊', harga: 2500000 },'zeus_laut': { emoji: '⚡🌊', harga: 2500000 },'atlas_laut': { emoji: '🏔️🌊', harga: 2500000 },
    'kitsune_laut': { emoji: '🦊🌊', harga: 2500000 },'leviathan_primordial': { emoji: '🐉🌊', harga: 2500000 },'davy_jones': { emoji: '🏴‍☠️🦑', harga: 2500000 },
    'caylpso': { emoji: '🧜‍♀️🌊', harga: 2500000 },'ariel_little_mermaid': { emoji: '🧜‍♀️❤️', harga: 2500000 },'treasure_chest': { emoji: '💎📦', harga: 2500000 },
    'ancient_relic': { emoji: '🏺✨', harga: 2500000 },'pirate_gold': { emoji: '💰🏴‍☠️', harga: 2500000 },'mermaid_tear': { emoji: '💧🧜‍♀️', harga: 2500000 }
  }

  const keys = Object.keys(harga).sort((a,b) => harga[a].harga - harga[b].harga)
  const nomorKeItem = {}
  keys.forEach((k, i) => nomorKeItem[i+1] = k)

  // BISA PAKE SPASI ATAU _
  function getItemByInput(input) {
    if(!isNaN(input)) return nomorKeItem[parseInt(input)]
    return input.replace(/ /g, '_')
  }

  // MENU
  if (!text) {
    let cap = `╭───「 🎣 TOKO IKAN ZETA 」───╮\n`
    cap += `│ 💰 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `│ ${isPrem? '👑 Premium Bonus +10%' : '👤 User Biasa'}\n`
    cap += `╰─────────────────────╯\n`
    cap += `📌 *MENU JUAL*\n`
    cap += `├ Jual: *${usedPrefix}tokoikan jual <no/nama> <jumlah/all>*\n`
    cap += `├ Contoh: *${usedPrefix}tokoikan jual 15 5*\n`
    cap += `└ Jual Semua: *${usedPrefix}tokoikan jual all*\n\n`
    cap += `📌 *MAU MANCING?*\n`
    cap += `└ Ketik: *${usedPrefix}mancing*\n\n`
    cap += `*🐟 DAFTAR HARGA JUAL*\n`

    keys.forEach((k,i) => {
      let h = Math.floor(harga[k].harga * sellBonus)
      cap += `├ [${i+1}] ${harga[k].emoji} ${formatNama(k).padEnd(20)} Rp ${h.toLocaleString()}\n`
    })
    cap += `━━━━━━━━━━━`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
  }

  let args = text.toLowerCase().split(' ').filter(v => v)
  let tipe = args[0]

  if(tipe!== 'jual') return m.reply(`❌ Pakai: *${usedPrefix}tokoikan jual <no/nama> <jumlah/all>*`)
  args = args.slice(1)

  // JUAL ALL
  if(args[0] === 'all'){
    let totalHasil = 0, listJual = []
    for(let item in user.ikan){
      if(harga[item]){
        let jumlah = user.ikan[item]
        let hasil = Math.floor(harga[item].harga * sellBonus) * jumlah
        totalHasil += hasil
        listJual.push(`${harga[item].emoji} ${formatNama(item)} x${jumlah}`)
        delete user.ikan[item]
      }
    }
    if(totalHasil === 0) return m.reply(`❌ Kamu tidak punya ikan yang bisa dijual.`)
    wdb.money[m.sender] += totalHasil
    saveDB(wdb)
    return m.reply(`╭──「 🎣 TOKO IKAN ZETA 」──╮\n\n✅ *BERHASIL JUAL SEMUA!*\n\n${listJual.join('\n')}\n\n💰 *Total:* +Rp ${totalHasil.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
  }

  // PARSER BISA SPASI/_/NOMOR
  let amount = 1, itemInput = ''
  if(!isNaN(parseInt(args[0]))){
    if(!isNaN(parseInt(args[1]))){ itemInput = getItemByInput(args[0]); amount = parseInt(args[1]) }
    else if(args[1] === 'all'){ itemInput = getItemByInput(args[0]); amount = 'all' }
    else { itemInput = getItemByInput(args[0]); amount = parseInt(args[1]) || 1 }
  }
  else if(!isNaN(parseInt(args[args.length-1]))){ amount = parseInt(args[args.length-1]); itemInput = getItemByInput(args.slice(0, -1).join(' ')) }
  else if(args[args.length-1] === 'all'){ amount = 'all'; itemInput = getItemByInput(args.slice(0, -1).join(' ')) }
  else { itemInput = getItemByInput(args.join(' ')) }

  if (!harga[itemInput]) return m.reply(`❌ Ikan "${formatNama(itemInput)}" tidak ada di list.\nLihat: *${usedPrefix}tokoikan*`)

  let stok = user.ikan[itemInput] || 0
  if (stok <= 0) return m.reply(`❌ Kamu tidak punya ${formatNama(itemInput)}`)
  let jual = amount === 'all'? stok : amount
  if (jual > stok) return m.reply(`❌ Stok tidak cukup! Kamu punya ${stok}`)

  let hasil = Math.floor(harga[itemInput].harga * sellBonus) * jual
  user.ikan[itemInput] -= jual
  if(user.ikan[itemInput] <= 0) delete user.ikan[itemInput]
  wdb.money[m.sender] += hasil
  saveDB(wdb)
  return m.reply(`╭──「 🎣 TOKO IKAN ZETA 」──╮\n\n✅ *BERHASIL JUAL!*\n${harga[itemInput].emoji} *${formatNama(itemInput)}* x${jual}\n💰 +Rp ${hasil.toLocaleString()}\n\n━━━━━━━━━━━━━━`)
}

handler.help = ['tokoikan', 'tokoikan jual <no/nama> <jumlah/all>', 'tokoikan jual all']
handler.tags = ['rpg']
handler.command = /^(tokoikan|jualikan)$/i
handler.group = true
export default handler