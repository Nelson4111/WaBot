import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'
import { sendRpgButtons, sendRpgConfirmButtons } from '../../lib/rpgActionButtons.js'
import {
  findRpgTotem,
  getActiveGroupTotem,
  getActiveGroupTotemExpiry,
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
  if (!m.isGroup && !m.chat?.endsWith('@g.us')) {
    return m.reply('Totem hanya dapat digunakan di dalam grup.')
  }
  const wdb = loadDB()
  const account = getUserRPG(wdb, m.sender)
  const user = account?.rpg
  if (!user) return m.reply('Ketik #adventure dulu untuk mendaftar RPG.')

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
      return m.reply('⌛ Konfirmasi totem tidak ditemukan atau sudah kedaluwarsa. Ulangi perintah.')
    }
    delete wdb.data.totemConfirmations[confirmationKey]
    if (['no', 'tidak'].includes(action)) {
      await saveDB(wdb)
      return m.reply('✅ Aksi totem dibatalkan. Saldo dan totem tidak berubah.')
    }

    const totem = findRpgTotem(pending.totemId)
    if (!totem) {
      await saveDB(wdb)
      return m.reply('❌ Totem tidak lagi tersedia. Tidak ada perubahan.')
    }
    if (pending.operation === 'buy') {
      if (user.totems.includes(totem.id)) {
        await saveDB(wdb)
        return m.reply('Kamu sudah memiliki totem ini.')
      }
      if ((Number(wdb.money[m.sender]) || 0) < totem.price) {
        await saveDB(wdb)
        return m.reply(`Saldo tidak cukup. Harga totem ini ${money(totem.price)}.`)
      }
      wdb.money[m.sender] -= totem.price
      user.totems.push(totem.id)
      await saveDB(wdb)
      return m.reply(`✅ Berhasil membeli *${totem.name}* seharga ${money(totem.price)}.`)
    }

    if (pending.operation === 'use') {
      if (!user.totems.includes(totem.id)) {
        await saveDB(wdb)
        return m.reply('❌ Totem ini sudah tidak ada di koleksimu.')
      }
      const current = getActiveGroupTotem(wdb.data, m.chat)
      const currentExpiry = getActiveGroupTotemExpiry(wdb.data, m.chat)
      const extendsDuration = current?.id === totem.id
      wdb.data.groupTotems[m.chat] = {
        id: totem.id,
        owner: m.sender,
        activatedAt: extendsDuration
          ? Number(wdb.data.groupTotems[m.chat].activatedAt) || now
          : now,
        expiresAt: (extendsDuration ? currentExpiry : now) + RPG_TOTEM_DURATION
      }
      await saveDB(wdb)
      const expiry = wdb.data.groupTotems[m.chat].expiresAt
      return m.reply(
        `✅ *${totem.name}* aktif untuk grup ini sampai ${new Date(expiry).toLocaleString('id-ID')}.\n` +
        (extendsDuration ? '> ↳ Totem sama sudah aktif, durasinya ditambah 1 jam.' : '> ↳ Durasi aktif: 1 jam.')
      )
    }
  }

  if (action === 'guide' || action === 'command' || action === 'commands' || action === 'menu') {
    return m.reply(
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
      const rows = RPG_TOTEM_ACTIVITIES.map(activity => ({
        title: activity.name,
        description: 'Lihat nama totem',
        id: `${usedPrefix}totem shop ${activity.id}`
      }))
      return sendRpgButtons(conn, {
        chat: m.chat,
        message: m,
        quoted: m,
        title: '🔆 KATEGORI TOTEM',
        subtitle: 'Pilih activity',
        text: 'Pilih kategori toko totem.',
        buttonText: 'PILIH ACTIVITY',
        sections: [{ title: 'Activity', rows }],
        fallbackText: `Kategori: ${RPG_TOTEM_ACTIVITIES.map(activity => activity.name).join(', ')}\nGunakan *${usedPrefix}totem shop <activity/all>*.`,
        reply: fallback => m.reply(fallback)
      })
    }
    if (!selectedActivity) {
      return m.reply(`Kategori tidak valid. Pilih: ${RPG_TOTEM_ACTIVITIES.map(activity => activity.id).join(', ')}.`)
    }
    const totems = RPG_TOTEMS.filter(totem =>
      selectedActivity.id === 'all' || totem.activity === selectedActivity.id
    )
    if (selectedActivity.id === 'all') {
      return m.reply(
        `╭─❏「 🔆 SEMUA TOTEM 」❏\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        totems.map(totem => `> ${totem.name}`).join('\n') +
        `\n\nLihat detail: *${usedPrefix}totem info <nama>*`
      )
    }
    const rows = totems.map(totem => ({
      title: totem.name.slice(0, 24),
      description: 'Lihat detail totem',
      id: `${usedPrefix}totem info ${totem.id}`
    }))
    const heading = selectedActivity.id === 'all'
      ? 'SEMUA TOTEM'
      : `TOTEM ${selectedActivity.name.toUpperCase()}`
    const fallbackText = `╭─❏「 ${heading} 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      totems.map(totem => `> ${totem.name}`).join('\n') +
      `\n\nLihat detail: *${usedPrefix}totem info <nama>*`
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      title: `🔆 ${heading}`,
      subtitle: 'Pilih nama untuk melihat detail',
      text: `Totem kategori ${selectedActivity.name}.`,
      buttonText: 'PILIH TOTEM',
      sections: [{ title: selectedActivity.name, rows }],
      fallbackText,
      reply: fallback => m.reply(fallback)
    })
  }

  if (action === 'info') {
    const totem = findRpgTotem(args.slice(1).join(' '))
    if (!totem) return m.reply(`Totem tidak ditemukan. Lihat *${usedPrefix}totem shop all*.`)
    const owned = user.totems.includes(totem.id)
    return m.reply(
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
    if (!totem) return m.reply(`Totem tidak ditemukan. Lihat *${usedPrefix}totem shop all*.`)
    if (user.totems.includes(totem.id)) return m.reply('Kamu sudah memiliki totem ini.')
    if ((Number(wdb.money[m.sender]) || 0) < totem.price) {
      return m.reply(`Saldo tidak cukup. Harga *${totem.name}* adalah ${money(totem.price)}.`)
    }
    wdb.data.totemConfirmations[confirmationKey] = {
      operation: 'buy',
      totemId: totem.id,
      createdAt: now
    }
    await saveDB(wdb)
    return sendRpgConfirmButtons(conn, m, {
      text:
        `🛒 Beli *${totem.name}* seharga ${money(totem.price)}?\n` +
        `Konfirmasi dengan *${usedPrefix}totem yes* atau batalkan dengan *${usedPrefix}totem no*.\n` +
        `Lihat efek lengkap: *${usedPrefix}totem info ${totem.id}*`,
      title: 'KONFIRMASI BELI TOTEM',
      subtitle: 'Pembelian memerlukan konfirmasi',
      acceptText: '✅ Beli',
      acceptCommand: `${usedPrefix}totem yes`,
      cancelText: '↩️ Batalkan',
      cancelCommand: `${usedPrefix}totem no`
    })
  }

  if (action === 'use') {
    const owned = user.totems
      .map(id => RPG_TOTEMS.find(totem => totem.id === id))
      .filter(Boolean)
    if (!owned.length) return m.reply(`Kamu belum punya totem. Lihat *${usedPrefix}totem shop all*.`)
    const selection = args[1]
    const numericIndex = /^\d+$/.test(selection || '') ? Number(selection) - 1 : -1
    const totem = owned[numericIndex]
    if (!totem) {
      return m.reply(`Pilih nomor totem dari *${usedPrefix}mytotem*.`)
    }
    const active = getActiveGroupTotem(wdb.data, m.chat)
    const extend = active?.id === totem.id
    wdb.data.totemConfirmations[confirmationKey] = {
      operation: 'use',
      totemId: totem.id,
      createdAt: now
    }
    await saveDB(wdb)
    return sendRpgConfirmButtons(conn, m, {
      text:
        `🔆 Aktifkan *${totem.name}* untuk grup ini?\n` +
        `${extend ? 'Totem yang sama sedang aktif; konfirmasi akan menambah durasi 1 jam.' : 'Totem lain yang aktif akan digantikan. Durasi: 1 jam.'}\n` +
        `Efek lengkap: *${usedPrefix}totem info ${totem.id}*`,
      title: 'KONFIRMASI AKTIFKAN TOTEM',
      subtitle: 'Buff berlaku untuk semua anggota grup',
      acceptText: '🔆 Aktifkan',
      acceptCommand: `${usedPrefix}totem yes`,
      cancelText: '↩️ Batalkan',
      cancelCommand: `${usedPrefix}totem no`
    })
  }

  if (action === 'active') {
    const active = getActiveGroupTotem(wdb.data, m.chat)
    if (!active) return m.reply('Belum ada totem aktif di grup ini.')
    const state = wdb.data.groupTotems[m.chat]
    const owner = wdb.users[state.owner]
    const remaining = getActiveGroupTotemExpiry(wdb.data, m.chat) - now
    return m.reply(
      `╭─❏「 🔆 TOTEM AKTIF 」❏\n` +
      `│ *${active.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Efek: ${active.effect}\n` +
      `> ↳ Diaktifkan oleh: ${owner?.name || conn.getName(state.owner) || 'Pemain'}\n` +
      `> ↳ Sisa durasi: ${durationText(remaining)}\n` +
      `> ↳ Berakhir: ${new Date(getActiveGroupTotemExpiry(wdb.data, m.chat)).toLocaleString('id-ID')}\n\n` +
      `Detail: *${usedPrefix}totem info ${active.id}*`
    )
  }

  if (action === 'off' || action === 'matikan') {
    if (!getActiveGroupTotem(wdb.data, m.chat)) return m.reply('Belum ada totem aktif di grup ini.')
    delete wdb.data.groupTotems[m.chat]
    await saveDB(wdb)
    return m.reply('✅ Totem aktif grup telah dimatikan.')
  }

  if (action === 'mytotem') {
    const owned = user.totems
      .map(id => RPG_TOTEMS.find(totem => totem.id === id))
      .filter(Boolean)
    if (!owned.length) {
      return m.reply(`Kamu belum memiliki totem.\nLihat toko: *${usedPrefix}totem shop all*`)
    }
    return m.reply(
      `╭─❏「 🔆 TOTEM MILIKMU 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      owned.map((totem, index) => `> *${index + 1}. ${totem.name}*`).join('\n') +
      `\n\nGunakan *${usedPrefix}totem use <nomor>* untuk mengaktifkan.`
    )
  }

  return m.reply(
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
