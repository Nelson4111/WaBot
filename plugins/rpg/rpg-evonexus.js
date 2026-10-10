import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'
import {
  EVONEXUS_ABILITIES,
  EVONEXUS_ABILITY_TYPES,
  EVONEXUS_RARITIES,
  getEvonexusAbilityEffectText,
  getEvonexusAbilityPool,
  getEvonexusAbilityTier,
  normalizeEvonexusValue,
  searchEvonexusAbilities
} from '../../lib/rpg-evonexusData.js'

const PAGE_SIZE = 20
const CONFIRM_YES = new Set(['ya', 'yes', 'ok', 'confirm', 'konfirmasi'])
const CONFIRM_NO = new Set(['tidak', 'no', 'batal', 'cancel', 'tolak'])

function resolveFilter(value) {
  const key = normalizeEvonexusValue(value)
  if (EVONEXUS_ABILITY_TYPES.includes(key)) return { label: key.toUpperCase(), abilities: getEvonexusAbilityPool(key) }
  const rarity = EVONEXUS_RARITIES.find(item => normalizeEvonexusValue(item.name) === key)
  if (rarity) return { label: rarity.name, abilities: getEvonexusAbilityPool(rarity.name) }
  return null
}

function findAbility(abilities, selection) {
  const key = normalizeEvonexusValue(selection)
  if (!key) return null
  if (/^\d+$/.test(key)) return abilities[Number(key) - 1] || null
  return abilities.find(ability =>
    normalizeEvonexusValue(ability.id) === key ||
    normalizeEvonexusValue(ability.name) === key
  ) || null
}

function formatDetail(ability, prefix) {
  const tier = getEvonexusAbilityTier(ability)
  return (
    `╭─❏「 ✨ ${ability.name.toUpperCase()} 」❏\n` +
    `│ *DETAIL SC CORE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> Tipe : *${ability.type.toUpperCase()}*\n` +
    `> Tier : *${tier.name} ${tier.stars}*\n` +
    `> Harga : *${ability.price.toLocaleString('id-ID')} Stellar Credit* 💠\n` +
    `> Deskripsi : ${ability.description}\n\n` +
    `📌 ${getEvonexusAbilityEffectText(ability)}\n` +
    `Pasang dengan *${prefix}evx core install ${ability.type} ${ability.name}*.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

function getEvonexus(rpg) {
  if (!rpg.evonexus || typeof rpg.evonexus !== 'object') rpg.evonexus = {}
  if (!rpg.evonexus.installed || typeof rpg.evonexus.installed !== 'object') rpg.evonexus.installed = {}
  if (!Array.isArray(rpg.evonexus.destroyedAbilities)) rpg.evonexus.destroyedAbilities = []
  return rpg.evonexus
}

function hasEvonexusAccess(rpg) {
  const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
  return tier.fasilitas.includes('Evonexus')
}

function getInstalledAbility(rpg, selection) {
  const evonexus = getEvonexus(rpg)
  const installed = Object.entries(evonexus.installed)
    .map(([type, id]) => EVONEXUS_ABILITIES.find(ability => ability.id === id && ability.type === type))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'id'))
  return findAbility(installed, selection)
}

function formatMenu(prefix) {
  return (
    `╭─❏「 🌌 EVONEXUS 」❏\n` +
    `│ *PUSAT PENGEMBANGAN ANTARBINTANG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Evonexus mengelola progres interstellar dan SC Core yang memberi bonus pasif pada sistem RPG.\n\n` +
    `📌 *MENU*\n` +
    `> *${prefix}evx info* - Data Evonexus dan Stellar Credit\n` +
    `> *${prefix}evx core* - Penjelasan SC Core\n` +
    `> *${prefix}evx core list* - Kategori tipe dan tier\n` +
    `> *${prefix}evx core list <tipe/tier> [halaman]* - Daftar SC Core\n` +
    `> *${prefix}evx core info <tipe/tier> <nomor/nama>* - Detail SC Core\n` +
    `> *${prefix}evx core search <nama>* - Cari SC Core\n` +
    `> *${prefix}evx core install <tipe/tier> <nomor/nama>* - Pasang dengan Stellar Credit\n` +
    `> *${prefix}evx core uninstall <nama>* - Lepas dan hancurkan SC Core\n` +
    `> *${prefix}evx body* - Lihat SC Core yang terpasang\n` +
    `> *${prefix}evx guide/command* - Panduan command\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

let handler = async (m, { text = '', usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const args = String(text).trim().split(/\s+/).filter(Boolean)
  let mode = String(args.shift() || '').toLowerCase()
  if (mode === 'core' && ['install', 'uninstall'].includes(args[0]?.toLowerCase())) {
    mode = args.shift().toLowerCase()
  }
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  const rpg = account?.rpg

  if (mode === 'info') {
    if (!rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')
    if (!hasEvonexusAccess(rpg)) return m.reply('❌ Evonexus terbuka setelah mencapai Eternal Card dan memperoleh fasilitas Evonexus.')
    const interstellarItems = Object.entries(rpg.inventory || {})
      .filter(([itemId, quantity]) => itemId !== 'stellar_credit' && Number(quantity) > 0)
      .reduce((total, [, quantity]) => total + Number(quantity), 0)
    const stats = rpg.evonexus || {}
    const installedCount = Object.keys(getEvonexus(rpg).installed).length
    return m.reply(
      `╭─❏「 🌌 EVONEXUS 」❏\n` +
      `│ 🌌 *STATISTIK INTERSTELLAR*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📊 *DATA PENJELAJAH*\n` +
      `> ↳ Rank Evonexus : ${stats.rank || 'Awak Baru'}\n` +
      `> ↳ Level interstellar : ${Number(stats.level) || 1}\n` +
      `> ↳ Eksplorasi : ${Number(rpg.interstellarExplores) || 0}\n` +
      `> ↳ Stellar Credit : ${Number(rpg.stellarCredit) || 0} 💠\n` +
      `> ↳ Relik antarbintang : ${interstellarItems}\n` +
      `> ↳ Resonansi : ${Number(stats.resonance) || 0}\n` +
      `> ↳ Peringkat statistik : ${Number(stats.statPoints) || 0} poin\n` +
      `> ↳ SC Core terpasang : ${installedCount}\n\n` +
      `Ketik *${prefix}evx body* untuk melihat SC Core terpasang.\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'guide' || mode === 'command' || mode === 'commands' || mode === 'cmd') {
    return m.reply(
      `╭─❏「 📖 EVONEXUS GUIDE 」❏\n` +
      `│ *PANDUAN EVONEXUS*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> SC Core memberi bonus pasif kecil lintas RPG serta bonus tambahan sesuai tipe.\n` +
      `> Maksimal satu SC Core dapat dipasang untuk setiap tipe.\n` +
      `> Install akan membayar harga dengan Stellar Credit setelah konfirmasi.\n` +
      `> Uninstall menghancurkan SC Core secara permanen; Stellar Credit tidak dikembalikan.\n` +
      `> Tier SC Core mengikuti harga dan batas rarity Mall.\n\n` +
      `📌 *COMMAND*\n` +
      `> *${prefix}evx core list* - Lihat tipe SC Core dan tier rarity\n` +
      `> *${prefix}evx core list <tipe/tier> [halaman]* - List 20 nama dan harga per halaman\n` +
      `> *${prefix}evx core info <tipe/tier> <nomor/nama>* - Lihat detail\n` +
      `> *${prefix}evx core search <nama>* - Cari SC Core, termasuk nama yang hampir cocok\n` +
      `> *${prefix}evx core install <tipe/tier> <nomor/nama>* - Pasang SC Core\n` +
      `> *${prefix}evx core install ya/tidak* - Konfirmasi atau batalkan pemasangan\n` +
      `> *${prefix}evx core uninstall <nama>* - Minta konfirmasi untuk menghancurkan SC Core\n` +
      `> *${prefix}evx core uninstall ya/tidak* - Konfirmasi atau batalkan penghancuran\n` +
      `> *${prefix}evx body* - Lihat SC Core yang terpasang\n` +
      `> *${prefix}evx info* - Lihat statistik Evonexus\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'core' || mode === 'ability' || mode === 'abilities') {
    const action = String(args.shift() || '').toLowerCase()
    if (!action) {
      return m.reply(
        `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
        `│ *PENGEMBANGAN SC CORE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `SC Core memberi bonus pasif pada aktivitas RPG sesuai tipe yang dipasang.\n` +
        `Gunakan *${prefix}evx core list* untuk melihat tipe dan tier, atau *${prefix}evx guide* untuk panduan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'list' || action === 'daftar') {
  const filterInput = args[0]

  if (!filterInput) {
    const types = EVONEXUS_ABILITY_TYPES.map(type => type.toUpperCase()).join(' • ')
    const tiers = EVONEXUS_RARITIES.map(tier => `${tier.name} ${tier.stars}`).join('\n')

    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ 📋 *DAFTAR KATEGORI SC CORE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🧬 *TIPE SC CORE*\n` +
      `> ↳ ${types}\n\n` +
      `🏷️ *TIER HARGA*\n` +
      `${tiers.split('\n').map(tier => `> ↳ ${tier}`).join('\n')}\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ ${prefix}evx core list <tipe/tier> [halaman]\n` +
      `> ↳ Contoh: ${prefix}evx core list attack 2\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const filter = resolveFilter(filterInput)

  if (!filter) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ ❌ *KATEGORI TIDAK DIKENAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tipe atau tier tidak dikenal.\n` +
      `> ↳ Gunakan ${prefix}evx core list untuk melihat kategori.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!filter.abilities.length) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ ℹ️ *SC CORE BELUM TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Belum ada SC Core pada tier atau tipe *${filter.label}*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const pageText = args[1] || '1'

  if (!/^\d+$/.test(pageText) || Number(pageText) < 1) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ ❌ *HALAMAN TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Nomor halaman harus berupa bilangan bulat positif.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const page = Number(pageText)
  const pageCount = Math.max(1, Math.ceil(filter.abilities.length / PAGE_SIZE))

  if (page > pageCount) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ ❌ *HALAMAN MELEBIHI BATAS*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Halaman maksimal untuk ${filter.label} adalah ${pageCount}.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const entries = filter.abilities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const list = entries.map((ability, index) =>
    `> *${(page - 1) * PAGE_SIZE + index + 1}. ${ability.name}*\n` +
    `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} Stellar Credit 💠`
  ).join('\n\n')

  return m.reply(
    `╭─❏「 ✨ SC CORE ${filter.label} 」❏\n` +
    `│ 📋 *DAFTAR SC CORE*\n` +
    `│ Halaman ${page}/${pageCount} · ${filter.abilities.length} SC Core\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${list}\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ Detail: ${prefix}evx core info ${filterInput} <nomor/nama>\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'info' || action === 'detail') {
  const filter = resolveFilter(args[0])

  if (!filter || args.length < 2) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ 📌 *FORMAT PERINTAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${prefix}evx core info <tipe/tier> <nomor/nama>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const ability = findAbility(filter.abilities, args.slice(1).join(' '))

  if (!ability) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ ❌ *SC CORE TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ SC Core tidak ditemukan dalam kategori ${filter.label}.\n` +
      `> ↳ Periksa daftar: ${prefix}evx core list ${args[0]}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(formatDetail(ability, prefix))
}

if (action === 'search' || action === 'cari') {
  const query = args.join(' ').trim()

  if (!query) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
      `│ 🔎 *PENCARIAN SC CORE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Format: ${prefix}evx core search <nama>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const exact = findAbility(EVONEXUS_ABILITIES, query)
  if (exact) return m.reply(formatDetail(exact, prefix))

  const matches = searchEvonexusAbilities(query)

  if (!matches.length) {
    return m.reply(
      `╭─❏「 🔎 PENCARIAN SC CORE 」❏\n` +
      `│ ❌ *HASIL TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ditemukan SC Core yang cocok dengan *${query}*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const suggestions = matches.map(ability => {
    const tier = getEvonexusAbilityTier(ability)

    return `> *${ability.name}*\n` +
      `> ↳ Tipe: ${ability.type.toUpperCase()} / ${tier.name}\n` +
      `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} Stellar Credit 💠`
  }).join('\n\n')

  return m.reply(
    `╭─❏「 🔎 PENCARIAN SC CORE 」❏\n` +
    `│ 🔎 *HASIL PENCARIAN SC CORE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tidak ditemukan kecocokan persis untuk *${query}*.\n` +
    `> ↳ Berikut beberapa SC Core yang mungkin kamu cari:\n\n` +
    `${suggestions}\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ Detail: ${prefix}evx core info <tipe/tier> <nama>\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

return m.reply(
  `╭─❏「 ✨ EVONEXUS SC CORE 」❏\n` +
  `│ ❌ *SUBCOMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `📌 *PANDUAN*\n` +
  `> ↳ ${prefix}evx core list\n` +
  `> ↳ ${prefix}evx guide\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

if (mode === 'body') {
  if (!rpg) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS BODY 」❏\n` +
      `│ ❌ *DATA RPG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu belum memiliki data RPG.\n` +
      `> ↳ Mulai petualangan dengan *.adventure*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!hasEvonexusAccess(rpg)) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS BODY 」❏\n` +
      `│ 🔒 *AKSES BELUM TERBUKA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Evonexus terbuka setelah mencapai Eternal Card dan memperoleh fasilitas Evonexus.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const installed = Object.entries(getEvonexus(rpg).installed)
    .map(([type, id]) => EVONEXUS_ABILITIES.find(ability => ability.id === id && ability.type === type))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'id'))

  if (!installed.length) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS BODY 」❏\n` +
      `│ 🧬 *BELUM ADA SC CORE TERPASANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tubuhmu belum memiliki SC Core terpasang.\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ Lihat daftar SC Core: ${prefix}evx core list\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const body = installed.map(ability => {
    const tier = getEvonexusAbilityTier(ability)

    return `> *${ability.name}*\n` +
      `> ↳ Tipe: ${ability.type.toUpperCase()}\n` +
      `> ↳ Tier: ${tier.name} ${tier.stars}\n` +
      `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} Stellar Credit`
  }).join('\n\n')

  return m.reply(
    `╭─❏「 🧬 EVONEXUS BODY 」❏\n` +
    `│ 🧬 *SC CORE TERPASANG: ${installed.length}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${body}\n\n` +
    `⚠️ *PERHATIAN*\n` +
    `> ↳ Uninstall akan menghancurkan SC Core secara permanen tanpa refund.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'install' || mode === 'uninstall') {
  if (!rpg) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS 」❏\n` +
      `│ ❌ *DATA RPG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu belum memiliki data RPG.\n` +
      `> ↳ Mulai petualangan dengan *.adventure*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!hasEvonexusAccess(rpg)) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS 」❏\n` +
      `│ 🔒 *AKSES BELUM TERBUKA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pemasangan SC Core membutuhkan fasilitas Evonexus dari Eternal Card.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const evonexus = getEvonexus(rpg)
  const selection = args.join(' ').trim()
  const confirmation = selection.toLowerCase()
  const pending = evonexus.pendingConfirmation
  const pendingIsValid = pending && Date.now() - Number(pending.createdAt) <= RPG_CONFIRMATION_TTL

  if (CONFIRM_NO.has(confirmation) && pendingIsValid && pending.action === mode) {
    delete evonexus.pendingConfirmation
    await saveDB(db)

    return m.reply(
      `╭─❏「 🧬 EVONEXUS 」❏\n` +
      `│ ❎ *TRANSAKSI DIBATALKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${mode === 'install' ? 'Pemasangan' : 'Uninstall'} SC Core dibatalkan.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (CONFIRM_YES.has(confirmation)) {
    if (!pendingIsValid || pending.action !== mode) {
      delete evonexus.pendingConfirmation
      await saveDB(db)

      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *KONFIRMASI KEDALUWARSA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Tidak ada konfirmasi ${mode} yang masih berlaku.\n` +
        `> ↳ Ulangi command core ${mode} untuk membuat konfirmasi baru.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const ability = EVONEXUS_ABILITIES.find(item => item.id === pending.abilityId)

    if (!ability) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *DATA SC CORE TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Data SC Core untuk konfirmasi tidak ditemukan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (mode === 'install') {
      if (evonexus.installed[ability.type]) {
        delete evonexus.pendingConfirmation
        await saveDB(db)

        return m.reply(
          `╭─❏「 🧬 EVONEXUS 」❏\n` +
          `│ ❌ *SLOT SUDAH TERISI*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Slot tipe ${ability.type.toUpperCase()} sudah terpasang.\n` +
          `> ↳ Maksimal satu SC Core untuk setiap tipe.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      if (evonexus.destroyedAbilities.includes(ability.id)) {
        delete evonexus.pendingConfirmation
        await saveDB(db)

        return m.reply(
          `╭─❏「 🧬 EVONEXUS 」❏\n` +
          `│ ❌ *SC CORE TIDAK DAPAT DIGUNAKAN*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ SC Core ini sudah dihancurkan dan tidak dapat dipasang kembali.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      const credits = Number(rpg.stellarCredit) || 0

      if (credits < ability.price) {
        delete evonexus.pendingConfirmation
        await saveDB(db)

        return m.reply(
          `╭─❏「 🧬 EVONEXUS 」❏\n` +
          `│ ❌ *STELLAR CREDIT TIDAK CUKUP*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `💠 *INFORMASI SALDO*\n` +
          `> ↳ Saldo: ${credits.toLocaleString('id-ID')} Stellar Credit\n` +
          `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} Stellar Credit\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      rpg.stellarCredit = credits - ability.price
      evonexus.installed[ability.type] = ability.id
    } else {
      if (evonexus.installed[ability.type] !== ability.id) {
        delete evonexus.pendingConfirmation
        await saveDB(db)

        return m.reply(
          `╭─❏「 🧬 EVONEXUS 」❏\n` +
          `│ ❌ *SC CORE TIDAK TERPASANG*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ SC Core tersebut sudah tidak terpasang.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      delete evonexus.installed[ability.type]

      if (!evonexus.destroyedAbilities.includes(ability.id)) {
        evonexus.destroyedAbilities.push(ability.id)
      }
    }

    delete evonexus.pendingConfirmation
    await saveDB(db)

    return m.reply(mode === 'install'
      ? `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ✅ *SC CORE BERHASIL DIPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `🧬 *INFORMASI SC CORE*\n` +
        `> ↳ Nama: ${ability.name}\n` +
        `> ↳ Slot: ${ability.type.toUpperCase()}\n` +
        `> ↳ Biaya: ${ability.price.toLocaleString('id-ID')} Stellar Credit 💠\n` +
        `> ↳ Sisa saldo: ${Number(rpg.stellarCredit).toLocaleString('id-ID')} 💠\n\n` +
        `─━━━━━━━━━━━━━━─`
      : `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ 🛠️ *SC CORE BERHASIL DILEPAS*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ SC Core: ${ability.name}\n` +
        `> ↳ SC Core telah dilepas dan dihancurkan secara permanen.\n\n` +
        `⚠️ *PERHATIAN*\n` +
        `> ↳ Stellar Credit tidak dikembalikan.\n` +
        `> ↳ SC Core ini tidak dapat dipasang kembali.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
  }

  if (pendingIsValid && pending.action === mode) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS 」❏\n` +
      `│ ⏳ *KONFIRMASI MASIH MENUNGGU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Selesaikan konfirmasi sebelumnya terlebih dahulu.\n` +
      `> ↳ ${prefix}evx core ${mode} ya\n` +
      `> ↳ ${prefix}evx core ${mode} tidak\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  delete evonexus.pendingConfirmation

  let ability

  if (mode === 'install') {
    const filter = resolveFilter(args[0])

    if (!filter || args.length < 2) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ 📌 *FORMAT PEMASANGAN SC CORE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${prefix}evx core install <tipe/tier> <nomor/nama>\n` +
        `> ↳ Contoh: ${prefix}evx core install attack 2\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    ability = findAbility(filter.abilities, args.slice(1).join(' '))

    if (!ability) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *SC CORE TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ SC Core tidak ditemukan dalam kategori ${filter.label}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (evonexus.destroyedAbilities.includes(ability.id)) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *SC CORE SUDAH DIHANCURKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ SC Core ini sudah dihancurkan dan tidak dapat dipasang kembali.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (evonexus.installed[ability.type]) {
      const current = EVONEXUS_ABILITIES.find(item => item.id === evonexus.installed[ability.type])

      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *SLOT SC CORE SUDAH TERISI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Slot ${ability.type.toUpperCase()} sudah digunakan${current ? ` oleh *${current.name}*` : ''}.\n\n` +
        `⚠️ *PERHATIAN*\n` +
        `> ↳ Uninstall SC Core lama terlebih dahulu jika ingin menggantinya.\n` +
        `> ↳ SC Core lama akan dihancurkan tanpa refund.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const credits = Number(rpg.stellarCredit) || 0

    if (credits < ability.price) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *STELLAR CREDIT TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `💠 *INFORMASI SALDO*\n` +
        `> ↳ Saldo: ${credits.toLocaleString('id-ID')} 💠\n` +
        `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} 💠\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
  } else {
    ability = getInstalledAbility(rpg, selection)

    if (!ability) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *SC CORE TIDAK TERPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ SC Core tersebut tidak terpasang di tubuhmu.\n` +
        `> ↳ Periksa kondisi tubuh dengan ${prefix}evx body.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
  }

  evonexus.pendingConfirmation = {
    action: mode,
    abilityId: ability.id,
    createdAt: Date.now()
  }

  await saveDB(db)

  return m.reply(mode === 'install'
    ? `╭─❏「 🧬 KONFIRMASI PEMASANGAN 」❏\n` +
      `│ ⚠️ *PERIKSA DETAIL SC CORE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🧬 *INFORMASI SC CORE*\n` +
      `> ↳ Nama: ${ability.name}\n` +
      `> ↳ Tipe: ${ability.type.toUpperCase()}\n` +
      `> ↳ Tier: ${getEvonexusAbilityTier(ability).name}\n\n` +
      `💠 *INFORMASI BIAYA*\n` +
      `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} Stellar Credit\n` +
      `> ↳ Saldo setelah pemasangan: ${(Number(rpg.stellarCredit) - ability.price).toLocaleString('id-ID')} 💠\n\n` +
      `⚠️ *PERHATIAN*\n` +
      `> ↳ Slot tipe ${ability.type.toUpperCase()} akan terisi.\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ ${prefix}evx core install ya\n` +
      `> ↳ ${prefix}evx core install tidak\n\n` +
      `> Konfirmasi berlaku selama 5 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
    : `╭─❏「 🧬 KONFIRMASI UNINSTALL 」❏\n` +
      `│ ⚠️ *PERIKSA DETAIL SC CORE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🧬 *INFORMASI SC CORE*\n` +
      `> ↳ Nama: ${ability.name}\n\n` +
      `⚠️ *PERHATIAN*\n` +
      `> ↳ SC Core akan dilepas dan dihancurkan secara permanen.\n` +
      `> ↳ Tidak ada Stellar Credit yang dikembalikan.\n` +
      `> ↳ SC Core tidak dapat digunakan kembali.\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ ${prefix}evx core uninstall ya\n` +
      `> ↳ ${prefix}evx core uninstall tidak\n\n` +
      `> Konfirmasi berlaku selama 5 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
  )
}

  return m.reply(formatMenu(prefix))
}

handler.help = [
  'evx', 'evx info', 'evx core', 'evx core list',
  'evx core info <tipe/tier> <nomor/nama>', 'evx core search <nama>',
  'evx core install <tipe/tier> <nomor/nama>', 'evx core uninstall <nama>',
  'evx body', 'evx guide', 'evx command'
]
handler.tags = ['rpg']
handler.command = /^(evx|evo|nexus|evonexus)$/i
handler.group = true

export default handler
