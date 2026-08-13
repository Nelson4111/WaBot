import { loadDB, saveDB } from '../../lib/waifuHelper.js'

function formatNama(ikan) {
  return ikan.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const ikanEmoji = {
  // SECRET
  'poseidon': '🌊🔱', 'flying_dutchman': '👻⛵', 'aquaman': '🦸‍♂️🌊', 'godzilla': '🦖🌊',
  'zeus_laut': '⚡🌊', 'atlas_laut': '🏔️🌊', 'kitsune_laut': '🦊🌊', 'leviathan_primordial': '🐉🌊',
  'davy_jones': '🏴‍☠️🦑', 'caylpso': '🧜‍♀️🌊', 'ariel_little_mermaid': '🧜‍♀️❤️',
  'treasure_chest': '💎📦', 'ancient_relic': '🏺✨', 'pirate_gold': '💰🏴‍☠️', 'mermaid_tear': '💧🧜‍♀️',
  // MYTHIC
  'kraken': '🦑🌊', 'megladon': '🦈👑', 'leviathan': '🐉🌊', 'sea_dragon': '🐲🌊',
  'phoenix_laut': '🔥🦅', 'hydra_laut': '🐍🌊', 'cerberus_laut': '🐺🌊', 'titan_kura': '🐢🏔️',
  'paus_putih': '🐋⚪', 'ikan_dewa': '🐟✨', 'naga_laut': '🐉🌊', 'raja_ubur': '🪼👑',
  'penjaga_karang': '🪸🛡️', 'putri_duyung': '🧜‍♀️👑', 'dewa_katak': '🐸⚡', 'kuda_laut_kristal': '🐴💎',
  'peti_karun': '💰', 'koin_emas_kuno': '🪙', 'mutiara_raja': '👑⚪', 'mahkota_karang': '👑🪸',
  // LEGENDARY
  'hiu_putih': '🦈⬜', 'hiu_harimau': '🦈🐅', 'hiu_martil': '🦈🔨', 'paus_orca': '🐋🖤',
  'paus_biru': '🐋💙', 'penyu_raksasa': '🐢🏞️', 'ikan_pari_manta': '🛸🌊', 'ikan_napoleon': '🐟👨‍⚖️',
  'kerapu_raksasa': '🐟🏰', 'marlin': '🐟🏹', 'tuna_sirip_biru': '🐟💙', 'pedang_laut': '⚔️🐟',
  'ikan_koi_emas': '🐟👑', 'lobster_raja': '🦞👑', 'kepiting_raksasa': '🦀🏰', 'gurita_raksasa': '🐙🏢',
  'sotong_raksasa': '🦑🏢', 'lionfish': '🐠🦁', 'ikan_badut': '🐠🤡', 'ikan_kupu': '🐠🦋',
  'ikan_malaikat': '🐠😇', 'ikan_diskus': '🐠💿', 'ikan_arwana': '🐟💎', 'ikan_arapaima': '🐟🏞️',
  'piranha': '🐟🩸', 'belut_listrik': '🐍⚡', 'ikan_duyung': '🧜‍♀️🐟', 'ubur_ubur_bulan': '🪼🌙',
  'bintang_laut': '⭐🌊', 'anemon_laut': '🌸🌊', 'karang_indah': '🪸✨', 'kerang_mutia': '🦪💎',
  'siput_laut': '🐌🌊', 'landak_laut': '🦔🌊',
  'peti_besi': '📦', 'koin_emas': '🪙', 'mutiara_hitam': '⚫', 'trisula_patah': '🔱',
  // EPIC
  'hiu_hitam': '🦈⬛', 'hiu_biru': '🦈💙', 'lumba_lumba': '🐬🌊', 'paus_pembunuh': '🐋🔪',
  'penyu_hijau': '🐢💚', 'ikan_pari': '🛸🌊', 'kerapu': '🐟🏠', 'tuna': '🐟🥫', 'salmon': '🐟🍣',
  'barakuda': '🐟🗡️', 'ikan_todak': '🐟⚔️', 'ikan_terbang': '🐟✈️', 'ubur_ubur': '🪼🌊',
  'ubur_ubur_listrik': '🪼⚡', 'bintang_laut_ungu': '⭐💜', 'karang_keras': '🪸🪨', 'kerang': '🦪🐚',
  'peti_kayu': '🪵', 'koin_perak': '🪙', 'mutiara_biasa': '⚪', 'karang_antik': '🪸',
  // RARE
  'kakap': '🐟🎣', 'kerapu_kecil': '🐟🏡', 'sarden': '🐟🥫', 'makarel': '🐟', 'kembung': '🐟🥫',
  'tongkol': '🐟🔨', 'cumi': '🦑🌊', 'gurita_kecil': '🐙', 'udang': '🦐🍤', 'kepiting': '🦀🍴',
  'lobster': '🦞🍽️', 'kerang_hijau': '🦪💚', 'kerang_darah': '🦪🩸', 'siput': '🐌🐚',
  'landak_laut_kecil': '🦔🌊', 'anemon': '🌸🌊', 'rumput_laut': '🌿🌊', 'karang': '🪸🪨',
  'peti_karat': '📦', 'koin_tembaga': '🪙', 'mutiara_retak': '🦪', 'cangkir_pecah': '🏺',
  // UNCOMMON
  'ikan_mas': '🐟🧡', 'ikan_nila': '🐟💙', 'ikan_lele': '🐟🐈', 'ikan_patin': '🐟🐷',
  'ikan_gurame': '🐟🍽️', 'ikan_mujair': '🐟😂', 'ikan_gabus': '🐟🔫', 'ikan_wader': '🐟🌾',
  'ikan_seluang': '🐟⚡',
  // COMMON
  'ikan_teri': '🐟📏', 'ikan_pepetek': '🐟👀', 'ikan_layang': '🐟🪁', 'ikan_kembung_kecil': '🐟🥫',
  'ikan_selar': '🐟🏃', 'ikan_tembang': '🐟🎵', 'ikan_julung': '🐟🪡',
  // TRASH
  'sampah_plastik': '🗑️♻️', 'ban_bekas': '🛞🗑️', 'botol_kaca': '🍾🗑️', 'kaleng': '🥫🗑️',
  'kayu_hanyut': '🪵🌊', 'jaring_rusak': '🕸️💔', 'sepatu': '👟🗑️', 'botol': '🍶🗑️',
  'kantong_plastik': '🛍️🗑️', 'duri': '🌵🗑️', 'batu': '🪨🌊', 'rumput': '🌱🌊', 'lumpur': '🟤🌊',
  'daun': '🍃🌊', 'ranting': '🌿🌊', 'tali': '🪢🗑️', 'kawat': '🔩🗑️', 'pecahan_kaca': '💔🗑️',
  'kaos_kaki': '🧦', 'mie_instan': '🍜', 'pakaian_dalam': '🩲'
}

let secret = ['poseidon', 'flying_dutchman', 'aquaman', 'godzilla', 'zeus_laut', 'atlas_laut', 'kitsune_laut', 'leviathan_primordial', 'davy_jones', 'caylpso', 'ariel_little_mermaid', 'treasure_chest', 'ancient_relic', 'pirate_gold', 'mermaid_tear'];
let mythic = ['kraken', 'megladon', 'leviathan', 'sea_dragon', 'phoenix_laut', 'hydra_laut', 'cerberus_laut', 'titan_kura', 'paus_putih', 'ikan_dewa', 'naga_laut', 'raja_ubur', 'penjaga_karang', 'putri_duyung', 'dewa_katak', 'kuda_laut_kristal', 'peti_karun', 'koin_emas_kuno', 'mutiara_raja', 'mahkota_karang'];
let legendary = ['hiu_putih', 'hiu_harimau', 'hiu_martil', 'paus_orca', 'paus_biru', 'penyu_raksasa', 'ikan_pari_manta', 'ikan_napoleon', 'kerapu_raksasa', 'marlin', 'tuna_sirip_biru', 'pedang_laut', 'ikan_koi_emas', 'lobster_raja', 'kepiting_raksasa', 'gurita_raksasa', 'sotong_raksasa', 'lionfish', 'ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'piranha', 'belut_listrik', 'ikan_duyung', 'ubur_ubur_bulan', 'bintang_laut', 'anemon_laut', 'karang_indah', 'kerang_mutia', 'siput_laut', 'landak_laut', 'peti_besi', 'koin_emas', 'mutiara_hitam', 'trisula_patah'];
let epic = ['hiu_hitam', 'hiu_biru', 'lumba_lumba', 'paus_pembunuh', 'penyu_hijau', 'ikan_pari', 'kerapu', 'tuna', 'salmon', 'barakuda', 'ikan_todak', 'ikan_terbang', 'ubur_ubur', 'ubur_ubur_listrik', 'bintang_laut_ungu', 'karang_keras', 'kerang', 'peti_kayu', 'koin_perak', 'mutiara_biasa', 'karang_antik'];
let rare = ['kakap', 'kerapu_kecil', 'sarden', 'makarel', 'kembung', 'tongkol', 'cumi', 'gurita_kecil', 'udang', 'kepiting', 'lobster', 'kerang_hijau', 'kerang_darah', 'siput', 'landak_laut_kecil', 'anemon', 'rumput_laut', 'karang', 'peti_karat', 'koin_tembaga', 'mutiara_retak', 'cangkir_pecah'];
let uncommon = ['ikan_mas', 'ikan_nila', 'ikan_lele', 'ikan_patin', 'ikan_gurame', 'ikan_mujair', 'ikan_gabus', 'ikan_wader', 'ikan_seluang'];
let common = ['ikan_teri', 'ikan_pepetek', 'ikan_layang', 'ikan_kembung_kecil', 'ikan_selar', 'ikan_tembang', 'ikan_julung'];
let trash = ['sampah_plastik', 'ban_bekas', 'botol_kaca', 'kaleng', 'kayu_hanyut', 'jaring_rusak', 'sepatu', 'botol', 'kantong_plastik', 'duri', 'batu', 'rumput', 'lumpur', 'daun', 'ranting', 'tali', 'kawat', 'pecahan_kaca', 'kaos_kaki', 'mie_instan', 'pakaian_dalam'];

function getTier(nama){
  if(secret.includes(nama)) return {name:'SECRET', icon:'🔮'}
  if(mythic.includes(nama)) return {name:'MYTHIC', icon:'🌌'}
  if(legendary.includes(nama)) return {name:'LEGENDARY', icon:'👑'}
  if(epic.includes(nama)) return {name:'EPIC', icon:'💎'}
  if(rare.includes(nama)) return {name:'RARE', icon:'✨'}
  if(uncommon.includes(nama)) return {name:'UNCOMMON', icon:'💙'}
  if(common.includes(nama)) return {name:'COMMON', icon:'🤍'}
  return {name:'TRASH', icon:'🗑️'}
}

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')
  if(!user.ikan) user.ikan = {}

  // MIGRASI DATA LAMA spasi -> _
  let adaMigrasi = false
  for(let ikanLama in user.ikan){
    if(ikanLama.includes(' ')){
      let ikanBaru = ikanLama.replace(/ /g, '_')
      user.ikan[ikanBaru] = (user.ikan[ikanBaru] || 0) + user.ikan[ikanLama]
      delete user.ikan[ikanLama]
      adaMigrasi = true
    }
  }
  if(adaMigrasi) saveDB(wdb) // penting biar ke save

  if(Object.keys(user.ikan).length === 0)
    return m.reply('┌───❏「 🐠 AQUARIUM KOSONG 」❏\n│\n│ Kamu belum punya koleksi ikan.\n│ Ketik #mancing untuk mulai\n└───────────────────')

  let inventory = user.ikan
  let grouped = {}
  let totalIkan = 0

  for(let nama in inventory){
    let tier = getTier(nama)
    if(!grouped[tier.name]) grouped[tier.name] = {icon: tier.icon, list: []}
    let emoji = ikanEmoji[nama] || '🐟'
    grouped[tier.name].list.push(`│ ${emoji} ${formatNama(nama)} x${inventory[nama]}`)
    totalIkan += inventory[nama]
  }

  let urutan = ['SECRET','MYTHIC','LEGENDARY','EPIC','RARE','UNCOMMON','COMMON','TRASH']
  let cap = `┌───❏「 🐠 AQUARIUM 」❏\n`
  cap += `│ 👤 Owner : ${conn.getName(m.sender)}\n`
  cap += `│ 📦 Total : ${totalIkan} Ikan\n`
  cap += `│ 🧬 Jenis : ${Object.keys(inventory).length}\n`
  cap += `└───────────────────\n\n`

  for(let t of urutan){
    if(grouped[t]){
      cap += `┌───❏「 ${grouped[t].icon} ${t} 」❏\n`
      cap += grouped[t].list.join('\n') + '\n'
      cap += `└───────────────────\n\n`
    }
  }
  cap += `💡 Ketik #shop > #jual [ikan] [jml] untuk menjual`

  m.reply(cap)
}

handler.help = ['aquarium', 'aq']
handler.tags = ['rpg']
handler.command = /^(aquarium|aq)$/i
handler.group = true
export default handler