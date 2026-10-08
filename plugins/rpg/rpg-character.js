import { loadDB, saveDB, getUserRPG, getEquipmentName } from '../../lib/waifuHelper.js'
import { MALL_CATEGORIES } from '../../lib/rpgMallData.js'
import {
  BLOODLINE_CHANGE_COST,
  BLOODLINE_CONFIRMATION_TIMEOUT,
  BLOODLINE_STORIES,
  BLOODLINES,
  CHARACTER_GENDERS,
  CHARACTER_DEFAULT_OUTFIT,
  getBloodline,
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
  if (!account?.rpg) return m.reply('Kamu belum memiliki data RPG. Mulailah dengan .adventure.')
  const rpg = account.rpg
  const registeredUser = db.users[m.sender] || {}
  syncUserLimit(registeredUser)
  if (!rpg.character || typeof rpg.character !== 'object') rpg.character = {}
  if (!rpg.bloodline) rpg.bloodline = 'human'

  const tokens = String(text).trim().split(/\s+/).filter(Boolean)
  const mode = String(tokens[0] || '').toLowerCase()
  const prefix = usedPrefix || '.'
  const root = String(command).toLowerCase()

  if (root === 'bl' || root === 'bloodline' || root === 'bloodlines') {
  const current = getBloodline(rpg)

  if (mode === 'list' || mode === 'daftar') {
    const sortedBloodlines = Object.entries(BLOODLINES).sort((a, b) =>
      a[1].name.localeCompare(b[1].name, 'id')
    )

    return m.reply(
      `╭─❏「 🧬 BLOODLINES 」❏\n` +
      `│ 🧬 *DAFTAR BLOODLINE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${sortedBloodlines.map(([id, bloodline], index) =>
        `> ↳ ${index + 1}. ${bloodline.emoji} *${bloodline.name}*${id === current.id ? ' ✅ *AKTIF*' : ''}`
      ).join('\n')}\n\n` +
      `📌 *PANDUAN*\n` +
      `> ↳ Detail: ${prefix}bloodlines info <nomor/nama>\n` +
      `> ↳ Gacha bloodline baru: ${prefix}bloodline ubah\n\n` +
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
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📝 *DESKRIPSI*\n> ${bloodline.description}\n\n` +
      `✨ *EFEK*\n` +
      `${describeBloodlineEffects({ bloodline: id })}\n\n` +
      `📌 *MENU*\n` +
      `> ↳ Daftar bloodline: ${prefix}bl list\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!['ubah', 'change'].includes(mode)) {
    return m.reply(
      `╭─❏「 🧬 BLOODLINE 」❏\n` +
      `│ 🧬 *BLOODLINE AKTIF*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🩸 *BLOODLINE KAMU*\n` +
      `> ↳ ${current.emoji} *${current.name}*\n` +
      `> ↳ ${describeBloodlineEffects(rpg)}\n\n` +
      `📌 *MENU*\n` +
      `> ↳ Lihat pilihan: ${prefix}bloodline list\n` +
      `> ↳ Gacha bloodline baru: ${prefix}bloodline ubah\n` +
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
        `> ↳ Limit gacha tetap terpakai.\n\n` +
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
      setUserLimit(registeredUser, limit - Number(pending.cost))
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
      `> ↳ ${previous.emoji} ${previous.name} ➜ ${next.emoji} *${next.name}*\n\n` +
      `${describeBloodlineEffects(rpg)}\n\n` +
      `💰 *BIAYA*\n` +
      `> ↳ Limit gacha sudah terpakai: ${BLOODLINE_CHANGE_COST}\n` +
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
        `> ↳ ${BLOODLINE_CHANGE_COST} limit tetap terpakai.\n\n` +
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
      `> ↳ ${BLOODLINE_CHANGE_COST} limit tetap terpakai.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (decision) {
    return m.reply(
      `╭─❏「 💬 KONFIRMASI BLOODLINE 」❏\n` +
      `│ 💬 *KONFIRMASI BLOODLINE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Setuju: ${prefix}bloodline ubah yes\n` +
      `> ↳ Batal: ${prefix}bloodline ubah no\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (pending && now - Number(pending.time) <= BLOODLINE_CONFIRMATION_TIMEOUT) {
    const next = BLOODLINES[pending.to]

    return m.reply(
      `╭─❏「 🧬 BLOODLINES 」❏\n` +
      `│ 🧬 *KONFIRMASI BLOODLINE*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ${current.emoji} ${current.name} ➜ ${next.emoji} ${next.name}\n\n` +
      `${describeBloodlineEffects({ bloodline: pending.to })}\n\n` +
      `💰 *BIAYA*\n` +
      `> ↳ Gacha ${BLOODLINE_CHANGE_COST} limit sudah terpakai.\n\n` +
      `📌 *KONFIRMASI*\n` +
      `> ↳ Setuju: ${prefix}bloodline ubah yes\n` +
      `> ↳ Batal: ${prefix}bloodline ubah no\n\n` +
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

  setUserLimit(registeredUser, limit - BLOODLINE_CHANGE_COST)
  rpg.pendingBloodlineChange = { from: current.id, to: target, time: now }
  await saveDB(db)

  const next = BLOODLINES[target]
  const story = BLOODLINE_STORIES[Math.floor(Math.random() * BLOODLINE_STORIES.length)]

  return m.reply(
    `╭─❏「 🎲 GACHA BLOODLINE 」❏\n` +
    `│ 🧬 *KONFIRMASI BLOODLINE*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📖 *CERITA AVELIA*\n> ${story}\n\n` +
    `> ↳ ${current.emoji} ${current.name} ➜ ${next.emoji} *${next.name}*\n\n` +
    `${describeBloodlineEffects({ bloodline: target })}\n\n` +
    `💰 *BIAYA*\n` +
    `> ↳ ${BLOODLINE_CHANGE_COST} limit sudah terpakai.\n` +
    `> ↳ Sisa limit: ${registeredUser.limit}\n\n` +
    `📌 *KONFIRMASI*\n` +
    `> ↳ Setuju: ${prefix}bloodline ubah yes\n` +
    `> ↳ Batal: ${prefix}bloodline ubah no\n` +
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
  `> ↳ ${prefix}bloodline list\n` +
  `> ↳ ${prefix}bloodline ubah\n\n` +
  `👗 *WARDROBE*\n` +
  `> ↳ ${prefix}wardrobe\n\n` +
  `─━━━━━━━━━━━━━━─`
)
}

handler.help = ['mychar', 'mycharacter', 'ava', 'persona', 'character', 'bl list|ubah', 'bloodline list|ubah', 'bloodlines info <nomor/nama>']
handler.tags = ['rpg']
handler.command = /^(mychar|mycharacter|ava|persona|character|bl|bloodline|bloodlines)$/i
handler.group = true

export default handler
