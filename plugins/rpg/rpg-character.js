import { loadDB, saveDB, getUserRPG, getEquipmentName } from '../../lib/waifuHelper.js'
import { MALL_CATEGORIES } from '../../lib/rpgMallData.js'
import {
  BLOODLINE_CHANGE_COST,
  BLOODLINE_ASCEND_COSTS,
  BLOODLINE_CONFIRMATION_TIMEOUT,
  BLOODLINE_STORIES,
  BLOODLINES,
  BLOODLINE_RARITY_TIERS,
  CHARACTER_GENDERS,
  CHARACTER_DEFAULT_OUTFIT,
  getBloodline,
  getBloodlineRarity,
  describeBloodlineRarity,
  getBloodlineDescription,
  getDefaultArmorOutfit,
  describeBloodlineEffects,
  normalizeBloodlineKey
} from '../../lib/rpgCharacterData.js'
import { setUserLimit, syncUserLimit } from '../../lib/userLimit.js'

const FASHION_ITEMS = MALL_CATEGORIES.fashion.items
const formatFashionItem = item => item ? `${item.emoji} ${item.name}` : '-'

let handler = async (m, { text = '', usedPrefix = '.', command = '' }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const root = String(command).toLowerCase()
  if (['bl', 'bloodline', 'bloodlines'].includes(root) && ['stats', 'statistik'].includes(mode)) {
    const counts = new Map()
    for (const user of Object.values(db.users || {})) {
      if (!user?.rpg) continue
      const bloodline = getBloodline(user.rpg)
      counts.set(bloodline.id, (counts.get(bloodline.id) || 0) + 1)
    }
    const rows = [...counts.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([id, count]) => `> ↳ ${BLOODLINES[id].emoji} *${BLOODLINES[id].name}*: ${count} pengguna`)
    return m.reply(
      `╭─❏「 📊 STATISTIK BLOODLINE 」❏\n` +
      `│ 📊 *STATISTIK BLOODLINE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${rows.length ? rows.join('\n') : '> Belum ada pengguna RPG dengan bloodline.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  if (!account?.rpg) return m.reply('Kamu belum memiliki data RPG. Mulailah dengan .adventure.')
  const rpg = account.rpg
  const registeredUser = db.users[m.sender] || {}
  syncUserLimit(registeredUser)
  if (!rpg.character || typeof rpg.character !== 'object') rpg.character = {}
  if (!rpg.bloodline) rpg.bloodline = 'human'

  const prefix = usedPrefix || '.'

  if (root === 'bl' || root === 'bloodline' || root === 'bloodlines') {
  const current = getBloodline(rpg)

  if (mode === 'list' || mode === 'daftar') {
    const allBloodlines = Object.entries(BLOODLINES).sort((a, b) =>
      a[1].name.localeCompare(b[1].name, 'id')
    )
    const tierNames = Object.keys(BLOODLINE_RARITY_TIERS).reverse()
    const requestedTier = String(tokens[1] || '').toUpperCase()
    const tier = tierNames.includes(requestedTier) ? requestedTier : null
    if (tokens[1] && requestedTier !== 'ALL' && !tier) {
      return m.reply(
        `Tier tidak dikenal. Pilihan: *all, ${tierNames.join(', ')}*.\n` +
        `Contoh: *${prefix}bl list RARE*`
      )
    }
    const sortedBloodlines = requestedTier === 'ALL' || tier
      ? allBloodlines.filter(([id]) => {
          const rarity = getBloodlineRarity({ bloodline: id })
          return requestedTier === 'ALL' || rarity === tier
        })
      : null
    if (!sortedBloodlines) {
      return m.reply(
        `🧬 *DAFTAR TIER BLOODLINE*\n` +
        `> ↳ all (${allBloodlines.length} bloodline)\n` +
        `${tierNames.map(name =>
          `> ↳ ${name} (${allBloodlines.filter(([id]) => getBloodlineRarity({ bloodline: id }) === name).length})`
        ).join('\n')}\n\n` +
        `Lihat semua: *${prefix}bl list all*\n` +
        `Lihat tier: *${prefix}bl list <tier>*`
      )
    }

    return m.reply(
      `╭─❏「 🧬 BLOODLINES 」❏\n` +
      `│ 🧬 *DAFTAR BLOODLINE ${requestedTier === 'ALL' ? 'ALL' : tier} (${sortedBloodlines.length})*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${sortedBloodlines.map(([id, bloodline]) =>
        `> ↳ ${allBloodlines.findIndex(([bloodlineId]) => bloodlineId === id) + 1}. ${bloodline.emoji} *${bloodline.name}*${id === current.id ? ' ❮❮❮❮❮' : ''}`
      ).join('\n')}\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ Filter tier: ${prefix}bl list <tier>\n` +
      `> ↳ Detail: ${prefix}bloodlines info <nomor/nama>\n` +
      `> ↳ Gacha acak: ${prefix}bl roll\n` +
      `> ↳ Pilih langsung: ${prefix}bl ascend <nama>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (mode === 'info' || mode === 'detail') {
    const sortedBloodlines = Object.entries(BLOODLINES).sort((a, b) =>
      a[1].name.localeCompare(b[1].name, 'id')
    )

    const query = tokens.slice(1).join(' ').trim()
    if (!query) {
      return m.reply(
        `╭─❏「 🔎 INFO BLOODLINE 」❏\n` +
        `│ 🔎 *INFO BLOODLINE*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Contoh: ${prefix}bloodlines info 1\n` +
        `> ↳ Contoh: ${prefix}bloodlines info Human\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const selected = /^\d+$/.test(query)
      ? sortedBloodlines[Number(query) - 1]
      : sortedBloodlines.find(([id, bloodline]) =>
          normalizeBloodlineKey(id) === normalizeBloodlineKey(query) ||
          normalizeBloodlineKey(bloodline.name) === normalizeBloodlineKey(query)
        )

    if (!selected) {
      return m.reply(
        `╭─❏「 ❌ BLOODLINE TIDAK DITEMUKAN 」❏\n` +
        `│ ❌ *BLOODLINE TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Lihat urutan dengan ${prefix}bloodline list.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const [id, bloodline] = selected

    return m.reply(
      `╭─❏「 🧬 INFO BLOODLINE 」❏\n` +
      `│ ${bloodline.emoji} *${bloodline.name}*${id === current.id ? ' ✅ *AKTIF*' : ''}\n` +
      `${describeBloodlineRarity({ bloodline: id })}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📝 *DESKRIPSI BLOODLINE*\n` +
      `> ${bloodline.description}\n\n` +
      `⚔️ *EFEK*\n` +
      `${getBloodlineDescription({ bloodline: id })}\n\n` +
      `📌 *MENU*\n` +
      `> ↳ Daftar bloodline: ${prefix}bl list\n` +
      `> ↳ Gacha bloodline: ${prefix}bl roll\n` +
      `> ↳ Pilih langsung: ${prefix}bl ascend <nama>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const rollAliases = ['roll', 'ubah', 'change', 'gacha', 'reroll', 'evolve', 'rebirth']
  const isAscend = ['ascend', 'awaken'].includes(mode)
  if (!rollAliases.includes(mode) && !isAscend) {
    return m.reply(
      `╭─❏「 🧬 BLOODLINE 」❏\n` +
      `│ 🧬 *BLOODLINE AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🩸 *BLOODLINE KAMU*\n` +
      `> ↳ ${current.emoji} *${current.name}*\n` +
      `${describeBloodlineRarity(rpg)}\n` +
      `${describeBloodlineEffects(rpg)}\n\n` +
      `📌 *MENU*\n` +
      `> ↳ Lihat pilihan: ${prefix}bl list\n` +
      `> ↳ Gacha acak: ${prefix}bl roll\n` +
      `> ↳ Pilih langsung: ${prefix}bl ascend <nama>\n` +
      `> ↳ Statistik pengguna: ${prefix}bl stats\n` +
      `> ↳ Biaya: ${BLOODLINE_CHANGE_COST} limit\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const decision = String(tokens[1] || '').toLowerCase()
  const pending = rpg.pendingBloodlineChange
  const now = Date.now()

  if (['yes', 'ya'].includes(decision)) {
    if (!pending || now - Number(pending.time) > BLOODLINE_CONFIRMATION_TIMEOUT) {
      delete rpg.pendingBloodlineChange
      await saveDB(db)
      return m.reply(
        `╭─❏「 ⏰ KONFIRMASI KEDALUWARSA 」❏\n` +
        `│ ⏰ *KONFIRMASI TIDAK TERSEDIA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Konfirmasi tidak ada atau sudah kedaluwarsa.\n` +
        `> ↳ Bloodline tetap ${current.name}.\n` +
        `> ↳ ${pending?.action === 'ascend' ? 'Limit ascend belum dipotong.' : 'Limit gacha tetap terpakai.'}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (getBloodline(rpg).id !== pending.from) {
      delete rpg.pendingBloodlineChange
      await saveDB(db)
      return m.reply(
        `╭─❏「 ⚠️ BLOODLINE BERUBAH 」❏\n` +
        `│ ⚠️ *BLOODLINE SUDAH BERUBAH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Bloodline kamu sudah berubah.\n` +
        `> ↳ Silakan mulai gacha kembali.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (Number(pending.cost) > 0) {
      const limit = syncUserLimit(registeredUser)
      if (limit < Number(pending.cost)) {
        delete rpg.pendingBloodlineChange
        await saveDB(db)
        return m.reply(
          `╭─❏「 ❌ LIMIT TIDAK CUKUP 」❏\n` +
          `│ ❌ *LIMIT TIDAK CUKUP*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Dibutuhkan: ${pending.cost} limit\n` +
          `> ↳ Limit kamu: ${limit}\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }
      setUserLimit(registeredUser, limit - Number(pending.cost), pending.action === 'ascend' ? 'Ascend bloodline' : 'Ganti bloodline')
    }

    const previous = getBloodline(rpg)
    rpg.bloodline = pending.to
    delete rpg.pendingBloodlineChange
    await saveDB(db)

    const next = getBloodline(rpg)
    const story = BLOODLINE_STORIES[Math.floor(Math.random() * BLOODLINE_STORIES.length)]

    return m.reply(
      `╭─❏「 🧬 BLOODLINE BERUBAH 」❏\n` +
      `│ 🧬 *BLOODLINE BERUBAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📖 *CERITA AVELIA*\n> ${story}\n\n` +
      `> ↳ ${previous.emoji} ${previous.name} ➜ ${next.emoji} *${next.name}*\n` +
      `📝 *DESKRIPSI BLOODLINE*\n> ${next.description}\n\n` +
      `${describeBloodlineRarity(rpg)}\n\n` +
      `${describeBloodlineEffects(rpg)}\n\n` +
      `💰 *BIAYA*\n` +
      `> ↳ Limit terpakai: ${pending.action === 'ascend' ? pending.cost : BLOODLINE_CHANGE_COST}\n` +
      `> ↳ Sisa limit: ${registeredUser.limit}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (['no', 'tidak', 'batal', 'cancel'].includes(decision)) {
    if (!pending) {
      return m.reply(
        `╭─❏「 ⚠️ KONFIRMASI 」❏\n` +
        `│ ⚠️ *TIDAK ADA KONFIRMASI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Tidak ada hasil gacha yang menunggu konfirmasi.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (now - Number(pending.time) > BLOODLINE_CONFIRMATION_TIMEOUT) {
      delete rpg.pendingBloodlineChange
      await saveDB(db)
      return m.reply(
        `╭─❏「 ⏰ HASIL GACHA KEDALUWARSA 」❏\n` +
        `│ ⏰ *HASIL GACHA SUDAH KEDALUWARSA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Bloodline tetap ${current.name}.\n` +
        `> ↳ ${pending.action === 'ascend' ? 'Limit ascend tidak dipotong.' : `${BLOODLINE_CHANGE_COST} limit tetap terpakai.`}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    delete rpg.pendingBloodlineChange
    await saveDB(db)

    return m.reply(
      `╭─❏「 ❌ GACHA DITOLAK 」❏\n` +
      `│ ❌ *HASIL GACHA DITOLAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Bloodline tetap ${current.name}.\n` +
      `> ↳ ${pending.action === 'ascend' ? 'Limit ascend tidak dipotong.' : `${BLOODLINE_CHANGE_COST} limit tetap terpakai.`}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (isAscend && pending && now - Number(pending.time) <= BLOODLINE_CONFIRMATION_TIMEOUT) {
    return m.reply(
      `Konfirmasi bloodline masih menunggu.\n` +
      `> ↳ Setuju: ${prefix}bl ${pending.action || 'roll'} yes\n` +
      `> ↳ Batal: ${prefix}bl ${pending.action || 'roll'} no`
    )
  }

  if (isAscend) {
    const query = tokens.slice(1).join(' ').trim()
    if (!query) return m.reply(`Gunakan *${prefix}bl ascend <nama bloodline>* untuk memilih bloodline secara langsung.`)
    const selected = Object.entries(BLOODLINES).find(([id, bloodline]) =>
      normalizeBloodlineKey(id) === normalizeBloodlineKey(query) ||
      normalizeBloodlineKey(bloodline.name) === normalizeBloodlineKey(query)
    )
    if (!selected) return m.reply(`Bloodline *${query}* tidak ditemukan. Lihat daftar dengan *${prefix}bl list all*.`)
    const [target, bloodline] = selected
    if (target === current.id) return m.reply(`Bloodline *${current.name}* sudah aktif.`)
    const cost = BLOODLINE_ASCEND_COSTS[getBloodlineRarity({ bloodline: target })]
    const limit = syncUserLimit(registeredUser)
    if (limit < cost) {
      return m.reply(
        `╭─❏「 ❌ LIMIT TIDAK CUKUP 」❏\n` +
        `│ ❌ *LIMIT TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Tier ${getBloodlineRarity({ bloodline: target })}: ${cost} limit\n` +
        `> ↳ Limit kamu: ${limit}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    rpg.pendingBloodlineChange = { from: current.id, to: target, time: now, action: 'ascend', cost }
    await saveDB(db)
    return m.reply(
      `╭─❏「 🌟 ASCEND BLOODLINE 」❏\n` +
      `│ 🌟 *KONFIRMASI ASCEND*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${current.emoji} ${current.name} ➜ ${bloodline.emoji} *${bloodline.name}*\n` +
      `📝 *DESKRIPSI BLOODLINE*\n> ${bloodline.description}\n\n` +
      `${describeBloodlineRarity({ bloodline: target })}\n\n` +
      `${describeBloodlineEffects({ bloodline: target })}\n\n` +
      `💰 *BIAYA*\n> ↳ ${cost} limit (dipotong setelah disetujui)\n\n` +
      `📌 *KONFIRMASI*\n> ↳ Setuju: ${prefix}bl ascend yes\n> ↳ Batal: ${prefix}bl ascend no\n` +
      `> ↳ Berlaku: ${Math.floor(BLOODLINE_CONFIRMATION_TIMEOUT / 1000)} detik\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (decision) {
    return m.reply(
      `╭─❏「 💬 KONFIRMASI BLOODLINE 」❏\n` +
      `│ 💬 *KONFIRMASI BLOODLINE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Setuju: ${prefix}bl ${pending.action || 'roll'} yes\n` +
      `> ↳ Batal: ${prefix}bl ${pending.action || 'roll'} no\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (pending && now - Number(pending.time) <= BLOODLINE_CONFIRMATION_TIMEOUT) {
    const next = BLOODLINES[pending.to]

    return m.reply(
      `╭─❏「 🧬 BLOODLINES 」❏\n` +
      `│ 🧬 *KONFIRMASI BLOODLINE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${current.emoji} ${current.name} ➜ ${next.emoji} ${next.name}\n` +
      `📝 *DESKRIPSI BLOODLINE*\n> ${next.description}\n\n` +
      `${describeBloodlineRarity({ bloodline: pending.to })}\n\n` +
      `${describeBloodlineEffects({ bloodline: pending.to })}\n\n` +
      `💰 *BIAYA*\n` +
      `> ↳ ${pending.action === 'ascend' ? `Biaya ascend ${pending.cost} limit dipotong setelah disetujui.` : `Gacha ${BLOODLINE_CHANGE_COST} limit sudah terpakai.`}\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ Setuju: ${prefix}bl ${pending.action || 'roll'} yes\n` +
      `> ↳ Batal: ${prefix}bl ${pending.action || 'roll'} no\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const limit = syncUserLimit(registeredUser)
  if (limit < BLOODLINE_CHANGE_COST) {
    return m.reply(
      `╭─❏「 ❌ LIMIT TIDAK CUKUP 」❏\n` +
      `│ ❌ *LIMIT TIDAK CUKUP*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kebutuhan gacha: ${BLOODLINE_CHANGE_COST} limit\n` +
      `> ↳ Limit kamu: ${limit}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const choices = Object.keys(BLOODLINES).filter(id => id !== current.id)
  const target = choices[Math.floor(Math.random() * choices.length)]

  setUserLimit(registeredUser, limit - BLOODLINE_CHANGE_COST, 'Ganti bloodline')
  rpg.pendingBloodlineChange = { from: current.id, to: target, time: now, action: 'roll', cost: 0 }
  await saveDB(db)

  const next = BLOODLINES[target]
  const story = BLOODLINE_STORIES[Math.floor(Math.random() * BLOODLINE_STORIES.length)]

  return m.reply(
    `╭─❏「 🎲 GACHA BLOODLINE 」❏\n` +
    `│ 🧬 *KONFIRMASI BLOODLINE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📖 *CERITA AVELIA*\n> ${story}\n\n` +
    `> ↳ ${current.emoji} ${current.name} ➜ ${next.emoji} *${next.name}*\n` +
    `📝 *DESKRIPSI BLOODLINE*\n> ${next.description}\n\n` +
    `${describeBloodlineRarity({ bloodline: target })}\n\n` +
    `${describeBloodlineEffects({ bloodline: target })}\n\n` +
    `💰 *BIAYA*\n` +
    `> ↳ ${BLOODLINE_CHANGE_COST} limit sudah terpakai.\n` +
    `> ↳ Sisa limit: ${registeredUser.limit}\n\n` +
    `📌 *KONFIRMASI*\n` +
    `> ↳ Setuju: ${prefix}bl roll yes\n` +
    `> ↳ Batal: ${prefix}bl roll no\n` +
    `> ↳ Berlaku: ${Math.floor(BLOODLINE_CONFIRMATION_TIMEOUT / 1000)} detik\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'nama' || mode === 'name') {
  const value = tokens.slice(1).join(' ').trim()
  if (!value) return m.reply(`Contoh: ${prefix}${root} nama Nama Karakter`)
  if (value.length > 32 || /[\r\n]/.test(value)) return m.reply('Nama karakter maksimal 32 karakter dan harus satu baris.')
  rpg.character.name = value
  await saveDB(db)
  return m.reply(
    `╭─❏「 📝 NAMA KARAKTER 」❏\n` +
    `│ 📝 *NAMA KARAKTER DIUBAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Nama baru: *${value}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'gender' || mode === 'kelamin') {
  const value = tokens.slice(1).join(' ').trim().toLowerCase()
  if (!CHARACTER_GENDERS[value]) {
    return m.reply(
      `╭─❏「 ⚧️ GENDER KARAKTER 」❏\n` +
      `│ ⚧️ *PILIH GENDER*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pilih gender: pria, wanita, atau lainnya.\n` +
      `> ↳ Contoh: ${prefix}${root} gender wanita\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }
  rpg.character.gender = CHARACTER_GENDERS[value]
  await saveDB(db)
  return m.reply(
    `╭─❏「 ⚧️ GENDER KARAKTER 」❏\n` +
    `│ ⚧️ *GENDER DIUBAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Gender baru: *${rpg.character.gender}*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (mode === 'umur' || mode === 'age') {
  const value = String(tokens[1] || '').toLowerCase()

  if (['reset', 'hapus'].includes(value)) {
    delete rpg.character.age
    await saveDB(db)
    return m.reply(
      `╭─❏「 🎂 UMUR KARAKTER 」❏\n` +
      `│ 🎂 *UMUR KHUSUS DIHAPUS*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Umur khusus karakter dihapus.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const age = Number(value)
  if (!Number.isInteger(age) || age < 1 || age > 150) {
    return m.reply(
      `╭─❏「 🎂 UMUR KARAKTER 」❏\n` +
      `│ 🎂 *UMUR TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Umur harus 1-150 tahun.\n` +
      `> ↳ Contoh: ${prefix}${root} umur 20\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  rpg.character.age = age
  await saveDB(db)

  return m.reply(
    `╭─❏「 🎂 UMUR KARAKTER 」❏\n` +
    `│ 🎂 *UMUR KARAKTER DIUBAH*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Umur baru: *${age} tahun*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const bloodline = getBloodline(rpg)
const armorLevel = Number(rpg.armor) || 0
const defaultOutfit = getDefaultArmorOutfit(armorLevel, getEquipmentName('armor', armorLevel))
const outfit = { ...defaultOutfit, ...(rpg.character.outfit || {}) }
const fashionById = new Map(FASHION_ITEMS.map(item => [item.id, item]))
const outfitLine = slot => {
  const item = fashionById.get(outfit[slot])
  return item ? formatFashionItem(item) : outfit[slot] || CHARACTER_DEFAULT_OUTFIT[slot]
}
const accessories = Array.isArray(outfit.accessories) ? outfit.accessories : []
const name = rpg.character.name || registeredUser.name || m.pushName || 'Petualang'
const gender = rpg.character.gender || registeredUser.gender || 'Belum diatur'
const age = rpg.character.age ?? registeredUser.age
const nickname = String(rpg.nickname || '').trim()
const prisonRemaining = rpg.penjara
  ? Math.max(0, Number(rpg.lamaPenjara || 0) - (Date.now() - Number(rpg.penjara)))
  : 0
const prisonStatus = prisonRemaining >= 60_000
  ? `Sedang di penjara • SEL ${rpg.sel || '-'} • Sisa ${Math.floor(prisonRemaining / 3_600_000)}j ${Math.floor((prisonRemaining % 3_600_000) / 60_000)}m`
  : 'Bebas'

const equipment = [
  `> 🗡️ Weapon: ${rpg.sword ? getEquipmentName('sword', rpg.sword) : 'None'}`,
  `> 🛡️ Armor: ${armorLevel ? getEquipmentName('armor', armorLevel) : 'None'}`,
  `> ⛏️ Pickaxe: ${rpg.pickaxe ? getEquipmentName('pickaxe', rpg.pickaxe) : 'None'}`,
  `> 🎣 Fishing Rod: ${rpg.fishingrod ? getEquipmentName('fishingrod', rpg.fishingrod) : 'None'}`
].join('\n')

const outfitText = [
  `> 🧢 Kepala: ${outfitLine('head')}`,
  `> 👕 Atasan: ${outfitLine('top')}`,
  `> 👖 Bawahan: ${outfitLine('bottom')}`,
  `> 👟 Kaki: ${outfitLine('feet')}`,
  `> ✨ Aksesori: ${accessories.length ? accessories.map(id => formatFashionItem(fashionById.get(id))).join(', ') : '-'}`
].join('\n')

return m.reply(
  `╭─❏「 🧑‍🚀 KARAKTER RPG 」❏\n` +
  `│ 🧑‍🚀 *KARAKTER RPG*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `👤 *IDENTITAS*\n` +
  `> ↳ Nama: *${name}*\n` +
  `> ↳ Julukan: *${nickname || 'Belum diatur'}*\n` +
  `> ↳ Status: ${prisonStatus}\n` +
  `> ↳ Bloodline: ${bloodline.emoji} *${bloodline.name}*\n` +
  `> ↳ Gender: ${gender}\n` +
  `> ↳ Umur: ${age ? `${age} tahun` : 'Belum diatur'}\n` +
  `> ↳ Level RPG: *${Number(rpg.level) || 1}*\n` +
  `> ↳ EXP: ${Number(rpg.exp) || 0}\n\n` +
  `👗 *OUTFIT*\n` +
  `${outfitText}\n\n` +
  `🛡️ *EQUIPMENT*\n` +
  `${equipment}\n\n` +
  `📌 *EDIT KARAKTER*\n` +
  `> ↳ ${prefix}${root} nama <nama>\n` +
  `> ↳ ${prefix}${root} gender <gender>\n` +
  `> ↳ ${prefix}${root} umur <umur>\n\n` +
  `🧬 *BLOODLINE*\n` +
  `> ↳ ${getBloodline(rpg).emoji} *${getBloodline(rpg).name}*\n` +
  `${describeBloodlineRarity(rpg)}\n` +
  `> ↳ ${prefix}bl list\n` +
  `> ↳ ${prefix}bl roll\n` +
  `> ↳ ${prefix}bl ascend <nama>\n` +
  `> ↳ ${prefix}bl stats\n\n` +
  `👗 *WARDROBE*\n` +
  `> ↳ ${prefix}wardrobe\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = [
  'mychar', 'mycharacter', 'ava', 'persona', 'character',
  'bl list|info|stats|roll|ubah|change|gacha|reroll|evolve|rebirth|ascend|awaken <nama>',
  'bloodline list|info|stats|roll|ascend <nama>'
]
handler.tags = ['rpg']
handler.command = /^(mychar|mycharacter|ava|persona|character|bl|bloodline|bloodlines)$/i
handler.group = true

export default handler
