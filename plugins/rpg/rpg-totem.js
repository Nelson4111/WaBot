import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { RPG_CONFIRMATION_TTL } from '../../lib/rpgConfirmation.js'
import { sendRpgButtons, sendRpgConfirmButtons } from '../../lib/rpgActionButtons.js'
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
    semua: 'all',
    global: 'global',
    universal: 'global'
  }
  return RPG_TOTEM_ACTIVITIES.find(activity => activity.id === aliases[key]) ||
    (aliases[key] === 'global' ? { id: 'global', name: 'Global' } : null)
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
  const activityRows = [
    ...RPG_TOTEM_ACTIVITIES
      .filter(activity => activity.id !== 'all')
      .map(activity => ({
        title: activity.name,
        description: `Lihat totem untuk aktivitas ${activity.name}`,
        id: `${usedPrefix}totem shop ${activity.id}`
      })),
    {
      title: '🌐 Global',
      description: 'Lihat totem yang memengaruhi semua aktivitas',
      id: `${usedPrefix}totem shop global`
    }
  ]
  const sendList = (text, title, buttonText, rows) => sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    text,
    title,
    footer: 'AVELIA • RPG TOTEM',
    buttonText,
    sections: [{ title, rows }],
    noThumbnail: true,
    sendInteractive: typeof conn.sendInteractive === 'function'
      ? interactiveMessage => conn.sendInteractive(m.chat, interactiveMessage, { quoted: m })
      : undefined
  })

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
      const ownedIndex = user.totems.indexOf(totem.id)
      if (ownedIndex < 0) {
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
      user.totems.splice(ownedIndex, 1)
      await saveDB(wdb)
      return reply(
        `✅ *${totem.name}* terpakai dan aktif untuk grup ini.\n` +
        (extendsDuration
          ? '> ↳ Durasi totem yang sama ditambah 1 jam.'
          : '> ↳ Durasi aktif: 1 jam.')
      )
    }
  }

  if (action === 'guide' || action === 'command' || action === 'commands' || action === 'menu') {
    return sendList(
      `🔆 *PUSAT TOTEM RPG*\nPilih kategori aktivitas untuk membuka koleksi totem yang bisa dibeli.\n\n` +
      `Koleksi dan status aktif dapat dibuka melalui daftar pilihan.`,
      '🔆 MENU TOTEM RPG',
      '🔆 BUKA MENU TOTEM',
      [
        { title: '🛒 Toko Totem', description: 'Pilih kategori dan lihat efek serta harga', id: `${usedPrefix}totem shop` },
        { title: '📚 Semua Totem', description: 'Jelajahi seluruh totem yang tersedia', id: `${usedPrefix}totem shop all` },
        { title: '🎒 Koleksi Saya', description: 'Lihat dan aktifkan totem milikmu', id: `${usedPrefix}mytotem` },
        { title: '⏱️ Totem Aktif', description: 'Cek buff yang sedang aktif di grup', id: `${usedPrefix}totem active` }
      ]
    )
  }

  if (action === 'shop' || action === 'list') {
    const selectedActivity = getActivity(args[1])
    if (!args[1]) {
      return sendList(
        'Pilih aktivitas untuk melihat totem, efek, dan harga yang sesuai.',
        '🔆 KATEGORI TOTEM',
        '📋 PILIH KATEGORI',
        activityRows
      )
    }
    if (!selectedActivity) {
      return sendList(
        `Kategori tidak valid: *${args[1]}*.\nPilih salah satu kategori di bawah ini.`,
        '🔆 KATEGORI TOTEM',
        '📋 PILIH KATEGORI',
        activityRows
      )
    }
    if (selectedActivity.id === 'all') {
      return sendList(
        'Pilih kategori di bawah untuk menjelajahi semua totem. Setiap daftar menampilkan harga, efek, dan aksi yang sesuai.',
        '🔆 SEMUA KATEGORI TOTEM',
        '📋 PILIH KATEGORI',
        activityRows
      )
    }
    const totems = RPG_TOTEMS.filter(totem =>
      totem.activity === (selectedActivity.id === 'global' ? 'all' : selectedActivity.id)
    )
    const rows = totems.map(totem => {
      const owned = user.totems.includes(totem.id)
      return {
        title: `${totem.emoji} ${totem.name}`,
        description: `${money(totem.price)} • ${owned ? 'Sudah dimiliki — lihat detail' : 'Pilih untuk konfirmasi pembelian'}`,
        id: owned
          ? `${usedPrefix}totem info ${totem.id}`
          : `${usedPrefix}totem buy ${totem.id}`
      }
    })
    return sendList(
      `🔆 *${selectedActivity.id === 'all' ? 'SEMUA TOTEM' : `TOTEM ${selectedActivity.name.toUpperCase()}`}*\n` +
      `Pilih totem untuk melihat detail atau memulai konfirmasi pembelian.`,
      '🔆 PILIH TOTEM',
      '📋 JELAJAHI TOTEM',
      rows
    )
  }

  if (action === 'info') {
    const totem = findRpgTotem(args.slice(1).join(' '))
    if (!totem) return reply(`Totem tidak ditemukan. Lihat *${usedPrefix}totem shop all*.`)
    const owned = user.totems.includes(totem.id)
    const infoText =
      `╭─❏「 ${totem.emoji} INFO TOTEM 」❏\n` +
      `│ *${totem.name}*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Activity: ${totem.activity}\n` +
      `> ↳ Efek: ${totem.effect}\n` +
      `> ↳ Harga: ${money(totem.price)}\n` +
      `> ↳ Status: ${owned ? 'sudah dimiliki' : 'belum dimiliki'}\n\n` +
      (owned ? '' : `Pilih tombol konfirmasi untuk membeli totem ini.`)
    if (owned) return reply(infoText)
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      text: infoText,
      title: `🔆 ${totem.name}`,
      footer: 'AVELIA • RPG TOTEM',
      noThumbnail: true,
      buttons: [[`🛒 Beli ${totem.name}`, `${usedPrefix}totem buy ${totem.id}`]]
    })
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
    return sendRpgConfirmButtons(conn, m, {
      text:
        `╭─❏「 🛒 KONFIRMASI TOTEM 」❏\n` +
        `│ ${totem.emoji} *${totem.name}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> 💰 Harga: ${money(totem.price)}\n` +
        `> ✨ Efek: ${totem.effect}\n\n` +
        `Pembelian hanya diproses setelah kamu memilih konfirmasi.`,
      title: '🛒 BELI TOTEM',
      acceptText: '✅ Konfirmasi pembelian',
      acceptCommand: `${usedPrefix}totem yes`,
      cancelText: '↩️ Batalkan pembelian',
      cancelCommand: `${usedPrefix}totem no`,
      buttonText: '🛒 PILIH TINDAKAN',
      footer: 'AVELIA • RPG TOTEM',
      noThumbnail: true
    })
  }

  if (action === 'use') {
    const owned = user.totems
      .map(id => RPG_TOTEMS.find(totem => totem.id === id))
      .filter(Boolean)
    if (!owned.length) {
      return sendList(
        `Kamu belum memiliki totem.\nPilih kategori untuk menjelajahi toko.`,
        '🔆 KATEGORI TOTEM',
        '📋 PILIH KATEGORI',
        activityRows
      )
    }
    const selection = args[1]
    const numericIndex = /^\d+$/.test(selection || '') ? Number(selection) - 1 : -1
    const totem = owned[numericIndex]
    if (!totem) {
      const rows = owned.map((ownedTotem, index) => ({
        title: `${ownedTotem.emoji} ${ownedTotem.name}`,
        description: `Pilih untuk mengaktifkan • ${ownedTotem.effect}`,
        id: `${usedPrefix}totem use ${index + 1}`
      }))
      return sendList(
        'Pilih totem yang ingin diaktifkan untuk grup ini.',
        '🔆 AKTIFKAN TOTEM',
        '📋 PILIH TOTEM',
        rows
      )
    }
    const active = getActiveGroupTotems(wdb.data, m.chat)
    const extend = active.some(record => record.id === totem.id && record.owner === m.sender)
    wdb.data.totemConfirmations[confirmationKey] = {
      operation: 'use',
      totemId: totem.id,
      createdAt: now
    }
    await saveDB(wdb)
    return sendRpgConfirmButtons(conn, m, {
      text:
        `╭─❏「 🔆 KONFIRMASI AKTIVASI 」❏\n` +
        `│ ${totem.emoji} *${totem.name}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ✨ Efek: ${totem.effect}\n` +
        `> ⏱️ Durasi: 1 jam\n\n` +
        (extend
          ? 'Totem yang sama milikmu sedang aktif; konfirmasi akan menambah durasi 1 jam.'
          : 'Totem ini akan aktif bersama totem grup lainnya selama 1 jam.'),
      title: '🔆 AKTIFKAN TOTEM',
      acceptText: '✅ Aktifkan totem',
      acceptCommand: `${usedPrefix}totem yes`,
      cancelText: '↩️ Batalkan aktivasi',
      cancelCommand: `${usedPrefix}totem no`,
      buttonText: '🔆 PILIH TINDAKAN',
      footer: 'AVELIA • RPG TOTEM',
      noThumbnail: true
    })
  }

  if (action === 'active') {
    const active = getActiveGroupTotems(wdb.data, m.chat)
    if (!active.length) return reply('Belum ada totem aktif di grup ini.')
    const activeText =
      `╭─❏「 🔆 TOTEM AKTIF 」❏\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      active.map(record => {
        const owner = wdb.users[record.owner]
        const ownerName = owner?.name || conn.getName(record.owner) || 'Pemain'
        return `> *${record.totem.name}* by ${ownerName}\n` +
          `> ↳ Sisa durasi: ${durationText(record.expiresAt - now)}`
      }).join('\n\n') +
      `\n\nLihat efek: *${usedPrefix}totem info <nama>*`
    return sendRpgButtons(conn, {
      chat: m.chat,
      message: m,
      quoted: m,
      text: activeText,
      title: '🔆 STATUS TOTEM GRUP',
      footer: 'AVELIA • RPG TOTEM',
      noThumbnail: true,
      buttons: [['⏹️ Matikan semua totem aktif', `${usedPrefix}totem off`]]
    })
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
    return sendList(
      `🎒 *TOTEM MILIKMU*\nPilih satu totem untuk mengaktifkannya di grup.\n`,
      '🔆 AKTIFKAN TOTEM',
      '📋 PILIH TOTEM',
      owned.map((totem, index) => ({
        title: `${index + 1}. ${totem.emoji} ${totem.name}`,
        description: totem.effect,
        id: `${usedPrefix}totem use ${index + 1}`
      }))
    )
  }

  return sendList(
    `Totem memberi buff aktivitas RPG untuk seluruh grup selama 1 jam.\nPilih salah satu menu untuk mulai.`,
    '🔆 MENU TOTEM RPG',
    '🔆 BUKA MENU TOTEM',
    [
      { title: '🛒 Toko Totem', description: 'Pilih kategori dan lihat harga', id: `${usedPrefix}totem shop` },
      { title: '📚 Semua Totem', description: 'Jelajahi semua pilihan totem', id: `${usedPrefix}totem shop all` },
      { title: '🎒 Koleksi Saya', description: 'Lihat dan aktifkan koleksi milikmu', id: `${usedPrefix}mytotem` },
      { title: '⏱️ Totem Aktif', description: 'Lihat buff grup yang aktif', id: `${usedPrefix}totem active` }
    ]
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
