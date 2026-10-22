import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'
import {
  findRpgTotem,
  getActiveGroupTotems,
  RPG_TOTEMS,
  RPG_TOTEM_ACTIVITIES,
  RPG_TOTEM_DURATION
} from '../../lib/rpg-totemData.js'

const money = value => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`
const durationText = milliseconds => {
  const minutes = Math.max(0, Math.ceil(milliseconds / 60000))
  return `${Math.floor(minutes / 60)} jam ${minutes % 60} menit`
}

function getActivity(input) {
  const key = String(input || '').trim().toLocaleLowerCase('id-ID')
  const aliases = {
    mancing: 'fishing',
    fishing: 'fishing',
    tambang: 'mining',
    mining: 'mining',
    petualangan: 'adventure',
    adventure: 'adventure',
    explore: 'explore',
    farming: 'farming',
    panen: 'farming',
    livestock: 'livestock',
    ternak: 'livestock',
    casino: 'casino',
    all: 'all',
    semua: 'all'
  }
  return RPG_TOTEM_ACTIVITIES.find(activity => activity.id === aliases[key]) || null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const reply = text => conn.sendMessage(m.chat, { text }, { quoted: m })
  if (!m.isGroup && !m.chat?.endsWith('@g.us')) {
    return reply('Totem hanya dapat digunakan di dalam grup.')
  }
  const wdb = loadDB()
  const account = getUserRPG(wdb, m.sender)
  const user = account?.rpg
  if (!user) return reply('Ketik #adventure dulu untuk mendaftar RPG.')

  wdb.data.groupTotems ||= {}
  wdb.data.totemConfirmations ||= {}
  user.totems = Array.isArray(user.totems) ? user.totems : []
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = String(command || 'totem').toLowerCase() === 'mytotem'
    ? 'mytotem'
    : String(args[0] || '').toLowerCase()
  const confirmationKey = `${m.chat}:${m.sender}`
  const now = Date.now()

  if (['yes', 'ya', 'no', 'tidak'].includes(action)) {
    const pending = wdb.data.totemConfirmations[confirmationKey]
    if (!pending || now - Number(pending.createdAt) > RPG_CONFIRMATION_TTL) {
      delete wdb.data.totemConfirmations[confirmationKey]
      await saveDB(wdb)
      return reply('⌛ Konfirmasi totem tidak ditemukan atau sudah kedaluwarsa. Ulangi perintah.')
    }
    delete wdb.data.totemConfirmations[confirmationKey]
    if (['no', 'tidak'].includes(action)) {
      await saveDB(wdb)
      return reply('✅ Aksi totem dibatalkan. Saldo dan totem tidak berubah.')
    }

    const totem = findRpgTotem(pending.totemId)
    if (!totem) {
      await saveDB(wdb)
      return reply('❌ Totem tidak lagi tersedia. Tidak ada perubahan.')
    }
    if (pending.operation === 'buy') {
      if (user.totems.includes(totem.id)) {
        await saveDB(wdb)
        return reply('Kamu sudah memiliki totem ini.')
      }
      if ((Number(wdb.money[m.sender]) || 0) < totem.price) {
        await saveDB(wdb)
        return reply(`Saldo tidak cukup. Harga totem ini ${money(totem.price)}.`)
      }
      wdb.money[m.sender] -= totem.price
      user.totems.push(totem.id)
      await saveDB(wdb)
      return reply(`✅ Berhasil membeli *${totem.name}* seharga ${money(totem.price)}.`)
    }

    if (pending.operation === 'use') {
      if (!user.totems.includes(totem.id)) {
        await saveDB(wdb)
        return reply('❌ Totem ini sudah tidak ada di koleksimu.')
      }
      const active = getActiveGroupTotems(wdb.data, m.chat)
      const sameOwnerTotem = active.find(record => record.id === totem.id && record.owner === m.sender)
      const extendsDuration = Boolean(sameOwnerTotem)
      const validRecords = active.map(({ id, owner, activatedAt, expiresAt }) => ({
        id,
        owner,
        activatedAt,
        expiresAt
      }))
      const expiresAt = (extendsDuration ? sameOwnerTotem.expiresAt : now) + RPG_TOTEM_DURATION
      const nextRecord = {
        id: totem.id,
        owner: m.sender,
        activatedAt: extendsDuration ? sameOwnerTotem.activatedAt : now,
        expiresAt
      }
      const nextRecords = extendsDuration
        ? validRecords.map(record =>
          record.id === totem.id && record.owner === m.sender ? nextRecord : record
        )
        : [...validRecords, nextRecord]
      wdb.data.groupTotems[m.chat] = nextRecords
      await saveDB(wdb)
      return reply(
        `✅ *${totem.name}* aktif untuk grup ini.\n` +
        (extendsDuration
          ? '> ↳ Durasi totem yang sama ditambah 1 jam.'
          : '> ↳ Durasi aktif: 1 jam.')
      )
    }
  }

  if (action === 'guide' || action === 'command' || action === 'commands' || action === 'menu') {
    return reply(
      `╭─❏「 📖 PANDUAN TOTEM 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ *${usedPrefix}totem* - Penjelasan fitur\n` +
      `> ↳ *${usedPrefix}totem shop <activity/all>* - Lihat totem di toko\n` +
      `> ↳ *${usedPrefix}totem info <nama>* - Lihat detail totem\n` +
      `> ↳ *${usedPrefix}totem buy <nama>* - Beli dengan konfirmasi\n` +
      `> ↳ *${usedPrefix}mytotem* - Lihat koleksi totem\n` +
      `> ↳ *${usedPrefix}totem use <nomor>* - Aktifkan dari daftar milikmu\n` +
      `> ↳ *${usedPrefix}totem active* - Status totem grup\n` +
      `> ↳ *${usedPrefix}totem off* - Matikan totem grup\n` +
      `> ↳ *${usedPrefix}totem yes/no* - Konfirmasi atau batalkan\n\n` +
      `Activity: ${RPG_TOTEM_ACTIVITIES.map(activity => activity.name).join(', ')}.`
    )
  }

  if (action === 'shop' || action === 'list') {
    const selectedActivity = getActivity(args[1])
    if (!args[1]) {
      return reply(
        `╭─❏「 🔆 KATEGORI TOTEM 」❏\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        RPG_TOTEM_ACTIVITIES.map(activity =>
          `> ${activity.name}: *${usedPrefix}totem shop ${activity.id}*`
        ).join('\n') +
        `\n\nSemua totem: *${usedPrefix}totem shop all*`
      )
    }
    if (!selectedActivity) {
      return reply(`Kategori tidak valid. Pilih: ${RPG_TOTEM_ACTIVITIES.map(activity => activity.id).join(', ')}.`)
    }
    const totems = RPG_TOTEMS.filter(totem =>
      selectedActivity.id === 'all' || totem.activity === selectedActivity.id
    )
    if (selectedActivity.id === 'all') {
      return reply(
        `╭─❏「 🔆 SEMUA TOTEM 」❏\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        totems.map(totem => `> ${totem.name}`).join('\n') +
        `\n\nLihat detail: *${usedPrefix}totem info <nama>*`
      )
    }
    const heading = `TOTEM ${selectedActivity.name.toUpperCase()}`
    return reply(
      `╭─❏「 🔆 ${heading} 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      totems.map(totem => `> ${totem.name}`).join('\n') +
      `\n\nLihat detail: *${usedPrefix}totem info <nama>*`
    )
  }

  if (action === 'info') {
    const totem = findRpgTotem(args.slice(1).join(' '))
    if (!totem) return reply(`Totem tidak ditemukan. Lihat *${usedPrefix}totem shop all*.`)
    const owned = user.totems.includes(totem.id)
    return reply(
      `╭─❏「 ${totem.emoji} INFO TOTEM 」❏\n` +
      `│ *${totem.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Activity: ${totem.activity}\n` +
      `> ↳ Efek: ${totem.effect}\n` +
      `> ↳ Harga: ${money(totem.price)}\n` +
      `> ↳ Status: ${owned ? 'sudah dimiliki' : 'belum dimiliki'}\n\n` +
      (owned ? '' : `Beli dengan *${usedPrefix}totem buy ${totem.id}*.`)
    )
  }

  if (action === 'buy') {
    const totem = findRpgTotem(args.slice(1).join(' '))
    if (!totem) return reply(`Totem tidak ditemukan. Lihat *${usedPrefix}totem shop all*.`)
    if (user.totems.includes(totem.id)) return reply('Kamu sudah memiliki totem ini.')
    if ((Number(wdb.money[m.sender]) || 0) < totem.price) {
      return reply(`Saldo tidak cukup. Harga *${totem.name}* adalah ${money(totem.price)}.`)
    }
    wdb.data.totemConfirmations[confirmationKey] = {
      operation: 'buy',
      totemId: totem.id,
      createdAt: now
    }
    await saveDB(wdb)
    return reply(
      `🛒 Beli *${totem.name}* seharga ${money(totem.price)}?\n` +
      `Konfirmasi: *${usedPrefix}totem yes* | Batalkan: *${usedPrefix}totem no*\n` +
      `Lihat efek lengkap: *${usedPrefix}totem info ${totem.id}*`
    )
  }

  if (action === 'use') {
    const owned = user.totems
      .map(id => RPG_TOTEMS.find(totem => totem.id === id))
      .filter(Boolean)
    if (!owned.length) return reply(`Kamu belum punya totem. Lihat *${usedPrefix}totem shop all*.`)
    const selection = args[1]
    const numericIndex = /^\d+$/.test(selection || '') ? Number(selection) - 1 : -1
    const totem = owned[numericIndex]
    if (!totem) {
      return reply(`Pilih nomor totem dari *${usedPrefix}mytotem*.`)
    }
    const active = getActiveGroupTotems(wdb.data, m.chat)
    const extend = active.some(record => record.id === totem.id && record.owner === m.sender)
    wdb.data.totemConfirmations[confirmationKey] = {
      operation: 'use',
      totemId: totem.id,
      createdAt: now
    }
    await saveDB(wdb)
    return reply(
      `🔆 Aktifkan *${totem.name}* untuk grup ini?\n` +
      `${extend ? 'Totem yang sama milikmu sedang aktif; konfirmasi akan menambah durasi 1 jam.' : 'Totem ini akan aktif bersama totem grup lainnya selama 1 jam.'}\n` +
      `Konfirmasi: *${usedPrefix}totem yes* | Batalkan: *${usedPrefix}totem no*\n` +
      `Efek lengkap: *${usedPrefix}totem info ${totem.id}*`
    )
  }

  if (action === 'active') {
    const active = getActiveGroupTotems(wdb.data, m.chat)
    if (!active.length) return reply('Belum ada totem aktif di grup ini.')
    return reply(
      `╭─❏「 🔆 TOTEM AKTIF 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      active.map(record => {
        const owner = wdb.users[record.owner]
        const ownerName = owner?.name || conn.getName(record.owner) || 'Pemain'
        return `> *${record.totem.name}* by ${ownerName}\n` +
          `> ↳ Sisa durasi: ${durationText(record.expiresAt - now)}`
      }).join('\n\n') +
      `\n\nLihat efek: *${usedPrefix}totem info <nama>*`
    )
  }

  if (action === 'off' || action === 'matikan') {
    if (!getActiveGroupTotems(wdb.data, m.chat).length) return reply('Belum ada totem aktif di grup ini.')
    delete wdb.data.groupTotems[m.chat]
    await saveDB(wdb)
    return reply('✅ Totem aktif grup telah dimatikan.')
  }

  if (action === 'mytotem') {
    const owned = user.totems
      .map(id => RPG_TOTEMS.find(totem => totem.id === id))
      .filter(Boolean)
    if (!owned.length) {
      return reply(`Kamu belum memiliki totem.\nLihat toko: *${usedPrefix}totem shop all*`)
    }
    return reply(
      `╭─❏「 🔆 TOTEM MILIKMU 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      owned.map((totem, index) => `> *${index + 1}. ${totem.name}*`).join('\n') +
      `\n\nGunakan *${usedPrefix}totem use <nomor>* untuk mengaktifkan.`
    )
  }

  return reply(
    `Totem adalah buff grup untuk activity RPG. Durasi aktif 1 jam.\n` +
    `> ↳ Toko: *${usedPrefix}totem shop <activity/all>*\n` +
    `> ↳ Koleksi: *${usedPrefix}mytotem*\n` +
    `> ↳ Panduan: *${usedPrefix}totem guide*`
  )
}

handler.help = [
  'totem',
  'totem guide',
  'totem command',
  'totem shop <activity/all>',
  'totem info <nama>',
  'totem buy <nama>',
  'mytotem',
  'totem use <nomor>',
  'totem yes/no',
  'totem active',
  'totem off'
]
handler.tags = ['rpg']
handler.command = /^(totem|mytotem)$/i
handler.group = true
export default handler
