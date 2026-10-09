import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
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
const CONFIRMATION_TTL = 60_000
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
    `│ *DETAIL ABILITY*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> Tipe : *${ability.type.toUpperCase()}*\n` +
    `> Tier : *${tier.name} ${tier.stars}*\n` +
    `> Harga : *${ability.price.toLocaleString('id-ID')} Stellar Credit* 💠\n` +
    `> Deskripsi : ${ability.description}\n\n` +
    `📌 ${getEvonexusAbilityEffectText(ability)}\n` +
    `Pasang dengan *${prefix}evx install ${ability.type} ${ability.name}*.\n\n` +
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
    `Evonexus mengelola progres interstellar dan augmentasi ability yang memberi bonus pasif pada sistem RPG.\n\n` +
    `📌 *MENU*\n` +
    `> *${prefix}evx info* - Data Evonexus dan Stellar Credit\n` +
    `> *${prefix}evx ability* - Penjelasan ability\n` +
    `> *${prefix}evx ability list* - Kategori tipe dan tier\n` +
    `> *${prefix}evx ability list <tipe/tier> [halaman]* - Daftar ability\n` +
    `> *${prefix}evx ability info <tipe/tier> <nomor/nama>* - Detail ability\n` +
    `> *${prefix}evx ability search <nama>* - Cari nama ability\n` +
    `> *${prefix}evx install <tipe/tier> <nomor/nama>* - Pasang dengan Stellar Credit\n` +
    `> *${prefix}evx uninstall <nama>* - Lepas dan hancurkan ability\n` +
    `> *${prefix}evx body* - Lihat ability yang terpasang\n` +
    `> *${prefix}evx guide/command* - Panduan command\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

let handler = async (m, { text = '', usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const args = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(args.shift() || '').toLowerCase()
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
      `> ↳ Ability terpasang : ${installedCount}\n\n` +
      `Ketik *${prefix}evx body* untuk melihat augmentasi.\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'guide' || mode === 'command' || mode === 'commands' || mode === 'cmd') {
    return m.reply(
      `╭─❏「 📖 EVONEXUS GUIDE 」❏\n` +
      `│ *PANDUAN EVONEXUS*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> Ability memberi bonus pasif kecil lintas RPG serta bonus tambahan sesuai tipe.\n` +
      `> Maksimal satu ability dapat dipasang untuk setiap tipe.\n` +
      `> Install akan membayar harga dengan Stellar Credit setelah konfirmasi.\n` +
      `> Uninstall menghancurkan ability secara permanen; Stellar Credit tidak dikembalikan.\n` +
      `> Tier ability mengikuti harga dan batas rarity Mall.\n\n` +
      `📌 *COMMAND*\n` +
      `> *${prefix}evx ability list* - Lihat tipe ability dan tier rarity\n` +
      `> *${prefix}evx ability list <tipe/tier> [halaman]* - List 20 nama dan harga per halaman\n` +
      `> *${prefix}evx ability info <tipe/tier> <nomor/nama>* - Lihat detail\n` +
      `> *${prefix}evx ability search <nama>* - Cari ability, termasuk nama yang hampir cocok\n` +
      `> *${prefix}evx install <tipe/tier> <nomor/nama>* - Pasang ability\n` +
      `> *${prefix}evx install ya/tidak* - Konfirmasi atau batalkan pemasangan\n` +
      `> *${prefix}evx uninstall <nama>* - Minta konfirmasi untuk menghancurkan ability\n` +
      `> *${prefix}evx uninstall ya/tidak* - Konfirmasi atau batalkan penghancuran\n` +
      `> *${prefix}evx body* - Lihat ability yang terpasang\n` +
      `> *${prefix}evx info* - Lihat statistik Evonexus\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'ability' || mode === 'abilities') {
    const action = String(args.shift() || '').toLowerCase()
    if (!action) {
      return m.reply(
        `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
        `│ *PENGEMBANGAN ABILITY*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `Ability memberi bonus pasif pada aktivitas RPG sesuai tipe ability yang dipasang.\n` +
        `Gunakan *${prefix}evx ability list* untuk melihat tipe dan tier, atau *${prefix}evx guide* untuk panduan.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'list' || action === 'daftar') {
  const filterInput = args[0]

  if (!filterInput) {
    const types = EVONEXUS_ABILITY_TYPES.map(type => type.toUpperCase()).join(' • ')
    const tiers = EVONEXUS_RARITIES.map(tier => `${tier.name} ${tier.stars}`).join('\n')

    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
      `│ 📋 *DAFTAR KATEGORI ABILITY*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🧬 *TIPE ABILITY*\n` +
      `> ↳ ${types}\n\n` +
      `🏷️ *TIER HARGA*\n` +
      `${tiers.split('\n').map(tier => `> ↳ ${tier}`).join('\n')}\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ ${prefix}evx ability list <tipe/tier> [halaman]\n` +
      `> ↳ Contoh: ${prefix}evx ability list attack 2\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const filter = resolveFilter(filterInput)

  if (!filter) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
      `│ ❌ *KATEGORI TIDAK DIKENAL*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tipe atau tier tidak dikenal.\n` +
      `> ↳ Gunakan ${prefix}evx ability list untuk melihat kategori.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!filter.abilities.length) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
      `│ ℹ️ *ABILITY BELUM TERSEDIA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Belum ada ability pada tier atau tipe *${filter.label}*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const pageText = args[1] || '1'

  if (!/^\d+$/.test(pageText) || Number(pageText) < 1) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
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
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
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
    `╭─❏「 ✨ ABILITY ${filter.label} 」❏\n` +
    `│ 📋 *DAFTAR ABILITY*\n` +
    `│ Halaman ${page}/${pageCount} · ${filter.abilities.length} ability\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${list}\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ Detail: ${prefix}evx ability info ${filterInput} <nomor/nama>\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'info' || action === 'detail') {
  const filter = resolveFilter(args[0])

  if (!filter || args.length < 2) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
      `│ 📌 *FORMAT PERINTAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${prefix}evx ability info <tipe/tier> <nomor/nama>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const ability = findAbility(filter.abilities, args.slice(1).join(' '))

  if (!ability) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
      `│ ❌ *ABILITY TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Ability tidak ditemukan dalam kategori ${filter.label}.\n` +
      `> ↳ Periksa daftar: ${prefix}evx ability list ${args[0]}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(formatDetail(ability, prefix))
}

if (action === 'search' || action === 'cari') {
  const query = args.join(' ').trim()

  if (!query) {
    return m.reply(
      `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
      `│ 🔎 *PENCARIAN ABILITY*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Format: ${prefix}evx ability search <nama>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const exact = findAbility(EVONEXUS_ABILITIES, query)
  if (exact) return m.reply(formatDetail(exact, prefix))

  const matches = searchEvonexusAbilities(query)

  if (!matches.length) {
    return m.reply(
      `╭─❏「 🔎 PENCARIAN ABILITY 」❏\n` +
      `│ ❌ *HASIL TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tidak ditemukan ability yang cocok dengan *${query}*.\n\n` +
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
    `╭─❏「 🔎 PENCARIAN ABILITY 」❏\n` +
    `│ 🔎 *HASIL PENCARIAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tidak ditemukan kecocokan persis untuk *${query}*.\n` +
    `> ↳ Berikut beberapa ability yang mungkin kamu cari:\n\n` +
    `${suggestions}\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ Detail: ${prefix}evx ability info <tipe/tier> <nama>\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

return m.reply(
  `╭─❏「 ✨ EVONEXUS ABILITY 」❏\n` +
  `│ ❌ *SUBCOMMAND TIDAK DIKENAL*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `📌 *PANDUAN*\n` +
  `> ↳ ${prefix}evx ability list\n` +
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
      `│ 🧬 *BELUM ADA ABILITY TERPASANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Tubuhmu belum memiliki ability terpasang.\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ Lihat daftar ability: ${prefix}evx ability list\n\n` +
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
    `│ 🧬 *ABILITY TERPASANG: ${installed.length}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${body}\n\n` +
    `⚠️ *PERHATIAN*\n` +
    `> ↳ Uninstall akan menghancurkan ability secara permanen tanpa refund.\n\n` +
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
      `> ↳ Pemasangan ability membutuhkan fasilitas Evonexus dari Eternal Card.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const evonexus = getEvonexus(rpg)
  const selection = args.join(' ').trim()
  const confirmation = selection.toLowerCase()
  const pending = evonexus.pendingConfirmation
  const pendingIsValid = pending && Date.now() - Number(pending.createdAt) <= CONFIRMATION_TTL

  if (CONFIRM_NO.has(confirmation) && pendingIsValid && pending.action === mode) {
    delete evonexus.pendingConfirmation
    await saveDB(db)

    return m.reply(
      `╭─❏「 🧬 EVONEXUS 」❏\n` +
      `│ ❎ *TRANSAKSI DIBATALKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${mode === 'install' ? 'Pemasangan' : 'Uninstall'} ability dibatalkan.\n\n` +
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
        `> ↳ Ulangi command ${mode} untuk membuat konfirmasi baru.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const ability = EVONEXUS_ABILITIES.find(item => item.id === pending.abilityId)

    if (!ability) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *DATA ABILITY TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Data ability untuk konfirmasi tidak ditemukan.\n\n` +
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
          `> ↳ Maksimal satu ability untuk setiap tipe.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      if (evonexus.destroyedAbilities.includes(ability.id)) {
        delete evonexus.pendingConfirmation
        await saveDB(db)

        return m.reply(
          `╭─❏「 🧬 EVONEXUS 」❏\n` +
          `│ ❌ *ABILITY TIDAK DAPAT DIGUNAKAN*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Ability ini sudah dihancurkan dan tidak dapat dipasang kembali.\n\n` +
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
          `│ ❌ *ABILITY TIDAK TERPASANG*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Ability tersebut sudah tidak terpasang.\n\n` +
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
        `│ ✅ *ABILITY BERHASIL DIPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `🧬 *INFORMASI ABILITY*\n` +
        `> ↳ Nama: ${ability.name}\n` +
        `> ↳ Slot: ${ability.type.toUpperCase()}\n` +
        `> ↳ Biaya: ${ability.price.toLocaleString('id-ID')} Stellar Credit 💠\n` +
        `> ↳ Sisa saldo: ${Number(rpg.stellarCredit).toLocaleString('id-ID')} 💠\n\n` +
        `─━━━━━━━━━━━━━━─`
      : `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ 🛠️ *ABILITY BERHASIL DILEPAS*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Ability: ${ability.name}\n` +
        `> ↳ Ability telah dilepas dan dihancurkan secara permanen.\n\n` +
        `⚠️ *PERHATIAN*\n` +
        `> ↳ Stellar Credit tidak dikembalikan.\n` +
        `> ↳ Ability ini tidak dapat dipasang kembali.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
  }

  if (pendingIsValid && pending.action === mode) {
    return m.reply(
      `╭─❏「 🧬 EVONEXUS 」❏\n` +
      `│ ⏳ *KONFIRMASI MASIH MENUNGGU*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Selesaikan konfirmasi sebelumnya terlebih dahulu.\n` +
      `> ↳ ${prefix}evx ${mode} ya\n` +
      `> ↳ ${prefix}evx ${mode} tidak\n\n` +
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
        `│ 📌 *FORMAT PEMASANGAN ABILITY*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${prefix}evx install <tipe/tier> <nomor/nama>\n` +
        `> ↳ Contoh: ${prefix}evx install attack 2\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    ability = findAbility(filter.abilities, args.slice(1).join(' '))

    if (!ability) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *ABILITY TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Ability tidak ditemukan dalam kategori ${filter.label}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (evonexus.destroyedAbilities.includes(ability.id)) {
      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *ABILITY SUDAH DIHANCURKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Ability ini sudah dihancurkan dan tidak dapat dipasang kembali.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (evonexus.installed[ability.type]) {
      const current = EVONEXUS_ABILITIES.find(item => item.id === evonexus.installed[ability.type])

      return m.reply(
        `╭─❏「 🧬 EVONEXUS 」❏\n` +
        `│ ❌ *SLOT ABILITY SUDAH TERISI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Slot ${ability.type.toUpperCase()} sudah digunakan${current ? ` oleh *${current.name}*` : ''}.\n\n` +
        `⚠️ *PERHATIAN*\n` +
        `> ↳ Uninstall ability lama terlebih dahulu jika ingin menggantinya.\n` +
        `> ↳ Ability lama akan dihancurkan tanpa refund.\n\n` +
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
        `│ ❌ *ABILITY TIDAK TERPASANG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Ability tersebut tidak terpasang di tubuhmu.\n` +
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
      `│ ⚠️ *PERIKSA DETAIL ABILITY*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🧬 *INFORMASI ABILITY*\n` +
      `> ↳ Nama: ${ability.name}\n` +
      `> ↳ Tipe: ${ability.type.toUpperCase()}\n` +
      `> ↳ Tier: ${getEvonexusAbilityTier(ability).name}\n\n` +
      `💠 *INFORMASI BIAYA*\n` +
      `> ↳ Harga: ${ability.price.toLocaleString('id-ID')} Stellar Credit\n` +
      `> ↳ Saldo setelah pemasangan: ${(Number(rpg.stellarCredit) - ability.price).toLocaleString('id-ID')} 💠\n\n` +
      `⚠️ *PERHATIAN*\n` +
      `> ↳ Slot tipe ${ability.type.toUpperCase()} akan terisi.\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ ${prefix}evx install ya\n` +
      `> ↳ ${prefix}evx install tidak\n\n` +
      `> Konfirmasi berlaku selama 1 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
    : `╭─❏「 🧬 KONFIRMASI UNINSTALL 」❏\n` +
      `│ ⚠️ *PERIKSA DETAIL ABILITY*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🧬 *INFORMASI ABILITY*\n` +
      `> ↳ Nama: ${ability.name}\n\n` +
      `⚠️ *PERHATIAN*\n` +
      `> ↳ Ability akan dilepas dan dihancurkan secara permanen.\n` +
      `> ↳ Tidak ada Stellar Credit yang dikembalikan.\n` +
      `> ↳ Ability tidak dapat digunakan kembali.\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ ${prefix}evx uninstall ya\n` +
      `> ↳ ${prefix}evx uninstall tidak\n\n` +
      `> Konfirmasi berlaku selama 1 menit.\n\n` +
      `─━━━━━━━━━━━━━━─`
  )
}

  return m.reply(formatMenu(prefix))
}

handler.help = [
  'evx', 'evx info', 'evx ability', 'evx ability list',
  'evx ability info <tipe/tier> <nomor/nama>', 'evx ability search <nama>',
  'evx install <tipe/tier> <nomor/nama>', 'evx uninstall <nama>',
  'evx body', 'evx guide', 'evx command'
]
handler.tags = ['rpg']
handler.command = /^(evx|evo|nexus|evonexus)$/i
handler.group = true

export default handler
