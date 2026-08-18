import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { generateFishingCard } from '../../lib/cardGenerator.js'

function formatNama(ikan) {
  return ikan.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')
  if (!user.ikan) user.ikan = {}

  // MIGRASI DATA LAMA spasi -> _
  for(let ikanLama in user.ikan){
    if(ikanLama.includes(' ')){
      let ikanBaru = ikanLama.replace(/ /g, '_')
      user.ikan[ikanBaru] = (user.ikan[ikanBaru] || 0) + user.ikan[ikanLama]
      delete user.ikan[ikanLama]
    }
  }

  let cooldown = 60000
  if (Date.now() - (user.lastMancing || 0) < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - user.lastMancing)) / 1000)
    return m.reply(`Sabar, ikan belum makan umpan. Tunggu ${sisa} detik lagi`)
  }

  let rodLvl = user.fishingrod || 0
  let bonus = Math.min(rodLvl * 2, 40)

  // Probabilitas realistis terdistribusi sesuai level pancingan
  let pSecret = rodLvl >= 15 ? Math.min(0.2 + (rodLvl - 15) * 0.15, 2.5) : 0
  let pMythic = rodLvl >= 8 ? Math.min(0.8 + (rodLvl - 8) * 0.35, 6.0) : (rodLvl >= 3 ? 0.3 : 0)
  let pLegend = Math.min(2.0 + (rodLvl * 0.8), 15.0)
  let pEpic = Math.min(6.0 + (rodLvl * 1.2), 22.0)
  let pRare = Math.min(15.0 + (rodLvl * 1.2), 30.0)
  let pUncommon = Math.max(15.0, 30.0 - (rodLvl * 0.5))
  let pCommon = Math.max(15.0, 30.0 - (rodLvl * 0.8))

  let roll = Math.random() * 100
  let cum = 0
  let ikan = ''
  let exp = 0
  let tier = ''

  cum += pSecret
  if (roll <= cum && pSecret > 0) {
    ikan = secret[Math.floor(Math.random() * secret.length)]
    exp = 5000; tier = 'SECRET'
  } else {
    cum += pMythic
    if (roll <= cum && pMythic > 0) {
      ikan = mythic[Math.floor(Math.random() * mythic.length)]
      exp = 1000; tier = 'MYTHIC'
    } else {
      cum += pLegend
      if (roll <= cum) {
        ikan = legendary[Math.floor(Math.random() * legendary.length)]
        exp = 500; tier = 'LEGENDARY'
      } else {
        cum += pEpic
        if (roll <= cum) {
          ikan = epic[Math.floor(Math.random() * epic.length)]
          exp = 250; tier = 'EPIC'
        } else {
          cum += pRare
          if (roll <= cum) {
            ikan = rare[Math.floor(Math.random() * rare.length)]
            exp = 120; tier = 'RARE'
          } else {
            cum += pUncommon
            if (roll <= cum) {
              ikan = uncommon[Math.floor(Math.random() * uncommon.length)]
              exp = 50; tier = 'UNCOMMON'
            } else {
              cum += pCommon
              if (roll <= cum) {
                ikan = common[Math.floor(Math.random() * common.length)]
                exp = 15; tier = 'COMMON'
              } else {
                ikan = trash[Math.floor(Math.random() * trash.length)]
                exp = 5; tier = 'TRASH'
              }
            }
          }
        }
      }
    }
  }

  user.ikan[ikan] = (user.ikan[ikan] || 0) + 1
  user.exp += exp
  user.lastMancing = Date.now()
  if (user.exp >= user.level * 500) { user.level++; user.exp = 0 }
  saveDB(wdb)

  let pp = 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg'
  try { pp = await conn.profilePictureUrl(m.sender, 'image') } catch {}

  let tierData = {
    SECRET:    {stars: '★★★★★★★', emoji: '🔮'},
    MYTHIC:    {stars: '★★★★★★☆', emoji: '🌌'},
    LEGENDARY: {stars: '★★★★★☆☆', emoji: '👑'},
    EPIC:      {stars: '★★★★☆☆☆', emoji: '💎'},
    RARE:      {stars: '★★★☆☆☆☆', emoji: '✨'},
    UNCOMMON:  {stars: '★★☆☆☆☆☆', emoji: '💙'},
    COMMON:    {stars: '★☆☆☆☆☆☆', emoji: '🤍'},
    TRASH:     {stars: '☆☆☆☆☆☆☆', emoji: '🗑️'}
  }

  let caption = `*───「 🎣 FISHING RESULT 」───*\n\n`
  caption += `*Tier* : ${tierData[tier].stars} ${tier} ${tierData[tier].emoji}\n\n`
  caption += `🏆 *Hasil Tangkapan*\n`
  caption += `🪝 ${ikanEmoji[ikan] || '🐟'} ${formatNama(ikan)}\n\n`
  caption += `✨ *XP Didapat* : +${exp}\n`
  caption += `🎣 *Level Pancingan* : ${rodLvl}\n`
  if(bonus > 0) caption += `🍀 *Bonus Rod* : +${bonus.toFixed(1)}%\n`
  caption += `\n────────────────`

  let username = conn.getName(m.sender) || m.pushName || 'Player'
  try {
    let cardBuf = await generateFishingCard({ avatarUrl: pp, username, ikan: `${ikanEmoji[ikan] || '🐟'} ${formatNama(ikan)}`, exp, rodLevel: rodLvl, tier })
    if (cardBuf) return conn.sendMessage(m.chat, { image: cardBuf, caption, mentions: [m.sender] }, { quoted: m })
  } catch (e) { console.error('[FishingCard] Error:', e.message) }

  return sendRpgMsg(conn, m, caption, pp)
}

handler.help = ['mancing', 'fishing', 'pancing']
handler.tags = ['rpg']
handler.command = /^(mancing|fishing|pancing)$/i
export default handler
