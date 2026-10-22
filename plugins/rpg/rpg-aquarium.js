import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { ikanEmoji, normalizeFishKey } from '../../lib/rpg-fishCatalog.js'
import { formatRpgNumber } from '../../lib/rpgMoney.js'
import { ensureFishDetails, getAllFishRecords, isTrashFish, migrateAllFishDetails } from '../../lib/rpg-fishSizes.js'

const fishTiers = [
  { name: 'SECRET', icon: '🔮', fish: ['poseidon', 'flying_dutchman', 'aquaman', 'godzilla', 'zeus_laut', 'atlas_laut', 'kitsune_laut', 'leviathan_primordial', 'davy_jones', 'caylpso', 'ariel_little_mermaid', 'treasure_chest', 'ancient_relic', 'pirate_gold', 'mermaid_tear', 'ikan_aurora', 'ikan_kapal_hantu', 'ikan_pahlawan', 'ikan_kaiju', 'ikan_petir', 'ikan_puncak', 'ikan_rubah_laut', 'ikan_kapten_hitam', 'ikan_laut_biru', 'ikan_putri_laut', 'peti_harta', 'artefak_laut', 'emas_pirate', 'air_mata_putri'] },
  { name: 'MYTHIC', icon: '🌌', fish: ['kraken', 'megladon', 'leviathan', 'sea_dragon', 'phoenix_laut', 'hydra_laut', 'cerberus_laut', 'titan_kura', 'paus_putih', 'ikan_dewa', 'naga_laut', 'raja_ubur', 'penjaga_karang', 'putri_duyung', 'dewa_katak', 'kuda_kristal', 'peti_karun', 'koin_emas_kuno', 'mutiara_raja', 'mahkota_karang'] },
  { name: 'LEGENDARY', icon: '👑', fish: ['hiu_putih', 'hiu_harimau', 'hiu_martil', 'paus_orca', 'paus_biru', 'penyu_raksasa', 'ikan_pari_manta', 'ikan_napoleon', 'kerapu_raksasa', 'marlin', 'tuna_sirip_biru', 'pedang_laut', 'ikan_koi_emas', 'lobster_raja', 'kepiting_raksasa', 'gurita_raksasa', 'sotong_raksasa', 'lionfish', 'ikan_badut', 'ikan_kupu', 'ikan_malaikat', 'ikan_diskus', 'ikan_arwana', 'ikan_arapaima', 'piranha', 'belut_listrik', 'ikan_duyung', 'ubur_ubur_bulan', 'bintang_laut', 'anemon_laut', 'karang_indah', 'kerang_mutia', 'siput_laut', 'landak_laut', 'peti_besi', 'koin_emas', 'mutiara_hitam', 'trisula_patah'] },
  { name: 'EPIC', icon: '💎', fish: ['hiu_hitam', 'hiu_biru', 'lumba_lumba', 'paus_pembunuh', 'penyu_hijau', 'ikan_pari', 'kerapu', 'tuna', 'salmon', 'barakuda', 'ikan_todak', 'ikan_terbang', 'ubur_ubur', 'ubur_ubur_listrik', 'bintang_laut_ungu', 'karang_keras', 'kerang', 'peti_kayu', 'koin_perak', 'mutiara_biasa', 'karang_antik'] },
  { name: 'RARE', icon: '✨', fish: ['kakap', 'kerapu_kecil', 'sarden', 'makarel', 'kembung', 'tongkol', 'cumi', 'gurita_kecil', 'udang', 'kepiting', 'lobster', 'kerang_hijau', 'kerang_darah', 'siput', 'landak_laut_kecil', 'anemon', 'rumput_laut', 'karang', 'peti_karat', 'koin_tembaga', 'mutiara_retak', 'cangkir_pecah'] },
  { name: 'UNCOMMON', icon: '💙', fish: ['ikan_mas', 'ikan_nila', 'ikan_lele', 'ikan_patin', 'ikan_gurame', 'ikan_mujair', 'ikan_gabus', 'ikan_wader', 'ikan_seluang'] },
  { name: 'COMMON', icon: '🤍', fish: ['ikan_teri', 'ikan_pepetek', 'ikan_layang', 'ikan_kembung_kecil', 'ikan_selar', 'ikan_tembang', 'ikan_julung'] },
  { name: 'TRASH', icon: '🗑️', fish: [] }
]
const fishTierByName = new Map(fishTiers.flatMap(tier => tier.fish.map(name => [normalizeFishKey(name), tier.name])))

function formatNama(name) {
  return String(name || '')
    .replace(/^ikan[_\s]+/i, '')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getOrderedRecords(user) {
  const records = getAllFishRecords(user)
  const ordered = records.sort((a, b) => {
    const tierA = fishTiers.findIndex(tier => tier.name === (fishTierByName.get(a.name) || 'TRASH'))
    const tierB = fishTiers.findIndex(tier => tier.name === (fishTierByName.get(b.name) || 'TRASH'))
    return tierA - tierB || b.weight - a.weight || a.name.localeCompare(b.name)
  })
  return ordered
}

let handler = async (m, { conn, usedPrefix, text }) => {
  const wdb = loadDB()
  const user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik #adventure dulu.')

  let migrated = false
  if (!wdb.data.fishSizeMigrationV1) {
    migrated = migrateAllFishDetails(wdb)
    wdb.data.fishSizeMigrationV1 = Date.now()
    migrated = true
  } else {
    migrated = ensureFishDetails(user)
  }

  const records = getOrderedRecords(user)
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = String(args[0] || '').toLowerCase()
  if (['favorite', 'fav', 'unfavorite', 'unfav'].includes(action)) {
    const fishNumber = Number(args[1])
    if (!Number.isSafeInteger(fishNumber) || fishNumber < 1 || fishNumber > records.length) {
      if (migrated) await saveDB(wdb)
      return m.reply(`Nomor ikan tidak valid. Buka *${usedPrefix}aquarium* dan pilih nomor yang tampil.`)
    }
    const listedFish = records[fishNumber - 1]
    const fish = (user.fishDetails[listedFish.name] || []).find(record => record.id === listedFish.id)
    if (!fish) {
      if (migrated) await saveDB(wdb)
      return m.reply('Data ikan berubah. Buka aquarium lagi dan ulangi pilihan.')
    }
    const shouldFavorite = ['favorite', 'fav'].includes(action)
    fish.favorite = shouldFavorite
    await saveDB(wdb)
    return m.reply(
      `${shouldFavorite ? '⭐' : '✅'} *${formatNama(fish.name)}* ${shouldFavorite ? 'ditambahkan ke' : 'dikeluarkan dari'} favorit.\n` +
      `> ↳ Ukuran: ${fish.size} · ${fish.weight.toFixed(2)} Kg`
    )
  }
  if (migrated) await saveDB(wdb)

  const page = /^\d+$/.test(args[0] || '') ? Math.max(1, Number(args[0])) : 1
  const pageSize = 30
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  if (page > totalPages) return m.reply(`Halaman tidak tersedia. Aquarium memiliki ${totalPages} halaman.`)

  const trashCount = Object.entries(user.ikan || {})
    .filter(([name]) => isTrashFish(name))
    .reduce((total, [, quantity]) => total + (Number(quantity) || 0), 0)
  const totalFish = records.length + trashCount
  const visibleRecords = records.slice((page - 1) * pageSize, page * pageSize)
  let cap = `╭─❏「 🐠 AQUARIUM 」❏\n`
  cap += `│ 👤 Owner: ${conn.getName(m.sender)}\n`
  cap += `│ 📦 Total: ${formatRpgNumber(totalFish)} ikan\n`
  cap += `│ 🐟 Berukuran: ${formatRpgNumber(records.length)} · 🗑️ Sampah: ${formatRpgNumber(trashCount)}\n`
  cap += `│ 📄 Halaman: ${page}/${totalPages}\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`

  if (!totalFish) {
    cap += `Kamu belum punya koleksi ikan.\nKetik *${usedPrefix}mancing* untuk mulai.`
  } else {
    cap += `🐟 *KOLEKSI IKAN*\n`
    visibleRecords.forEach((fish, index) => {
      const number = (page - 1) * pageSize + index + 1
      const emoji = ikanEmoji[fish.name] || ikanEmoji[`ikan_${fish.name}`] || '🐟'
      const marker = fish.favorite ? ' ⭐ Favorit' : ''
      const size = fish.size.charAt(0).toUpperCase() + fish.size.slice(1)
      cap += `> *${number}. ${size} ${formatNama(fish.name)} (${fish.weight.toFixed(2)} Kg) ${emoji}${marker}*\n`
    })
    if (trashCount) {
      cap += `\n🗑️ *SAMPAH PANCING (TANPA UKURAN)*\n`
      for (const [name, amount] of Object.entries(user.ikan).filter(([name]) => isTrashFish(name))) {
        cap += `> ${formatNama(name)} x${formatRpgNumber(amount)}\n`
      }
    }
    cap += `\n⭐ Favorit: *${usedPrefix}aquarium favorite <nomor>*\n`
    cap += `↩️ Lepas favorit: *${usedPrefix}aquarium unfavorite <nomor>*\n`
    if (totalPages > 1) cap += `📄 Halaman lain: *${usedPrefix}aquarium <nomor halaman>*\n`
    cap += `💡 Ikan favorit tidak dapat dijual sebelum favorit dilepas.`
  }
  return m.reply(cap)
}

handler.help = ['aquarium', 'aq', 'aquarium <halaman>', 'aquarium favorite <nomor>', 'aquarium unfavorite <nomor>']
handler.tags = ['rpg']
handler.command = /^(aquarium|aq)$/i
handler.group = true
export default handler
