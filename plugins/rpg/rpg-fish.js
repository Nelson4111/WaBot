import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { getRpgMoneySuffixGuide } from '../../lib/rpgMoney.js'
import { findRpgFishBait, grantDailyNormalBait, RPG_FISH_BAITS, RPG_FISH_TIERS } from '../../lib/rpg-fishCatalog.js'

function formatFishName(name) {
  return String(name || '')
    .replace(/^ikan[_\s]+/i, '')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function findTier(input) {
  const key = String(input || '').trim().toUpperCase()
  return RPG_FISH_TIERS.find(tier => tier.name === key)
}

let handler = async (m, { text, usedPrefix }) => {
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = String(args[0] || '').toLowerCase()

  if (['bait', 'umpan'].includes(action)) {
    const wdb = loadDB()
    const user = wdb.users[m.sender]?.rpg
    if (!user) return m.reply('Ketik #adventure dulu.')
    user.fishBaits ||= {}
    const given = grantDailyNormalBait(user)
    const baitAction = String(args[1] || '').toLowerCase()
    if (['use', 'pakai'].includes(baitAction)) {
      const selection = args.slice(2).join(' ')
      const ownedBaits = RPG_FISH_BAITS.filter(bait => Number(user.fishBaits[bait.id]) > 0)
      const bait = /^\d+$/.test(selection)
        ? ownedBaits[Number(selection) - 1]
        : findRpgFishBait(selection)
      if (!bait) {
        if (given) await saveDB(wdb)
        return m.reply(`Pilih nomor umpan dari daftar *${usedPrefix}fish bait* atau masukkan namanya.`)
      }
      const count = Math.max(0, Math.floor(Number(user.fishBaits[bait.id]) || 0))
      if (!count) {
        if (given) await saveDB(wdb)
        return m.reply(`Stok *${bait.name}* kamu habis. Beli di *${usedPrefix}pasar bait*.`)
      }
      user.activeFishBait = bait.id
      await saveDB(wdb)
      return m.reply(`✅ *${bait.name}* dipilih. Umpan akan otomatis berganti jika stoknya habis.`)
    }

    await saveDB(wdb)
    const active = findRpgFishBait(user.activeFishBait)
    const lines = RPG_FISH_BAITS
      .filter(bait => Number(user.fishBaits[bait.id]) > 0)
      .map((bait, index) => `> *${index + 1}. ${bait.name}* ×${Math.floor(Number(user.fishBaits[bait.id]))}${bait.id === active?.id ? ' · aktif' : ''}`)
    return m.reply(
      `╭─❏「 🎣 STOK UMPAN 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      (lines.length ? lines.join('\n') : 'Stok umpan kosong.') +
      `${given ? '\n\n🎁 Kamu mendapat 25 Normal Bait harian.' : ''}\n\n` +
      `Pakai: *${usedPrefix}fish bait use <nomor/nama>*\n` +
      `Beli: *${usedPrefix}pasar bait*`
    )
  }

  if (action === 'command' || action === 'commands' || action === 'menu') {
    return m.reply(
      `╭─❏「 🎣 COMMAND FISH 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${usedPrefix}fish* - Penjelasan fitur\n` +
      `> ↳ *${usedPrefix}fish command* - Daftar command\n` +
      `> ↳ *${usedPrefix}fish guide* - Panduan ikan\n` +
      `> ↳ *${usedPrefix}fish list* - Daftar kategori tier\n` +
      `> ↳ *${usedPrefix}fish tier <kategori>* - Daftar ikan per tier\n` +
      `> ↳ *${usedPrefix}fish suffix* - Daftar singkatan nominal\n` +
      `> ↳ *${usedPrefix}fish bait* - Lihat stok umpan\n` +
      `> ↳ *${usedPrefix}fish bait use <nomor/nama>* - Pilih umpan\n` +
      `> ↳ *${usedPrefix}pasar bait* - Lihat dan beli umpan\n` +
      `> ↳ *${usedPrefix}mancing* - Memancing\n` +
      `> ↳ *${usedPrefix}aquarium* - Lihat koleksi, ukuran, dan favorit\n` +
      `> ↳ *${usedPrefix}pasar jual* - Jual ikan`
    )
  }

  if (action === 'guide' || action === 'panduan') {
    return m.reply(
      `╭─❏「 📖 PANDUAN FISHING 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Mancing: *${usedPrefix}mancing*.\n` +
      `> ↳ Lihat ikan, tier, berat, dan ukuran: *${usedPrefix}aquarium*.\n` +
      `> ↳ Filter koleksi berdasarkan tier: *${usedPrefix}aquarium tier <kategori> [halaman]*.\n` +
      `> ↳ Tandai ikan agar tidak terjual: *${usedPrefix}aquarium favorite <nomor>*.\n` +
      `> ↳ Lepas favorit: *${usedPrefix}aquarium unfavorite <nomor>*.\n` +
      `> ↳ Jual di Pasar: *${usedPrefix}pasar jual <nomor/nama> <jumlah/all>*.\n` +
      `> ↳ Jual seluruh ikan dari tier tertentu: *${usedPrefix}pasar jual tier <kategori> [jumlah/all]*.\n` +
      `> ↳ Jual semua ikan yang tidak difavoritkan: *${usedPrefix}pasar jual all*.\n` +
      `> ↳ Ikan juga dapat dipakai sebagai bahan masakan melalui *${usedPrefix}masak*.\n` +
      `> ↳ Umpan menambah jumlah tangkapan atau memberi efek khusus; stok terpakai setiap kali memancing.\n` +
      `> ↳ Normal Bait gratis 25 buah per hari jika stoknya kurang dari 25; umpan lain dibeli di Pasar.\n` +
      `> ↳ Ukuran memengaruhi harga jual; ikan favorit harus dilepas dari favorit sebelum dijual.\n\n` +
      `Lihat tier: *${usedPrefix}fish list* · Suffix: *${usedPrefix}fish suffix*`
    )
  }

  if (action === 'list') {
    return m.reply(
      `╭─❏「 🐟 KATEGORI TIER IKAN 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      RPG_FISH_TIERS.map(tier =>
        `> ${tier.icon} ${tier.name} — ${tier.fish.length} jenis`
      ).join('\n') +
      `\n\nLihat isi tier: *${usedPrefix}fish tier <kategori>*`
    )
  }

  if (action === 'tier') {
    const tier = findTier(args.slice(1).join(' '))
    if (!tier) {
      return m.reply(`Kategori tidak ditemukan. Lihat *${usedPrefix}fish list*.`)
    }
    if (!tier.fish.length) {
      return m.reply(`Tier ${tier.name} belum memiliki ikan di katalog.`)
    }
    return m.reply(
      `╭─❏「 ${tier.icon} IKAN ${tier.name} 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      tier.fish.map(name => `> ${formatFishName(name)}`).join('\n')
    )
  }

  if (action === 'suffix') {
    return m.reply(
      `╭─❏「 🔢 SUFFIX NOMINAL 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Suffix ini dipakai untuk memasukkan nominal uang di command RPG, bukan untuk ukuran ikan.\n\n` +
      `${getRpgMoneySuffixGuide()}`
    )
  }

  return m.reply(
    `🎣 *FISHING AVELIA*\n` +
    `Mancing untuk mengumpulkan ikan berbagai tier dan ukuran. Koleksi ikan bisa dilihat di aquarium, difavoritkan, dijual di Pasar, atau digunakan untuk memasak.\n\n` +
    `> ↳ Command: *${usedPrefix}fish command*\n` +
    `> ↳ Panduan: *${usedPrefix}fish guide*\n` +
    `> ↳ Mulai mancing: *${usedPrefix}mancing*`
  )
}

handler.help = ['fish', 'fish command', 'fish guide', 'fish list', 'fish tier <kategori>', 'fish suffix', 'fish bait', 'fish bait use <nomor/nama>']
handler.tags = ['rpg']
handler.command = /^fish$/i
handler.group = true
export default handler
