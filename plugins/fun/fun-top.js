const TOP_COOLDOWN = 60 * 1000

let handler = async (m, { conn, groupMetadata, command, usedPrefix, text = '' }) => {
  global.db.data.chats = global.db.data.chats || {}
  const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  chat.topNoTag = Array.isArray(chat.topNoTag) ? chat.topNoTag : []
  const normalizeJid = jid => typeof conn.decodeJid === 'function' ? conn.decodeJid(jid) : jid
  const sender = normalizeJid(m.sender)
  const action = text.trim().toLowerCase()

  if (action === 'notag') {
    if (!chat.topNoTag.includes(sender)) chat.topNoTag.push(sender)
    if (typeof global.db.write === 'function') await global.db.write()
    return m.reply('✅ Kamu masuk daftar .top notag di grup ini. Perintah .top tidak akan men-tag kamu.')
  }

  if (action === 'tagme') {
    chat.topNoTag = chat.topNoTag.filter(jid => jid !== sender)
    if (typeof global.db.write === 'function') await global.db.write()
    return m.reply('✅ Preferensi .top diperbarui. Kamu bisa kembali di-tag di grup ini.')
  }

  if (action === 'list') {
    const excluded = chat.topNoTag
      .map(jid => jid.split('@')[0].split(':')[0])
      .filter(Boolean)
    return m.reply(
      `╭─❏「 🚫 TOP NOTAG 」❏\n` +
      `│ Daftar anggota yang menolak tag di grup ini:\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      (excluded.length ? excluded.map((number, index) => `${index + 1}. +${number}`).join('\n') : 'Belum ada anggota dalam daftar.') +
      `\n\n─━━━━━━━━━━━━━━─`
    )
  }

  const usage =
    `📌 *FORMAT PENGGUNAAN*\n` +
    `> ↳ *${usedPrefix + command} <jumlah 1-20> <judul>*\n` +
    `> ↳ Contoh : *${usedPrefix + command} 2 karbit*`

  if (!text?.trim()) {
    return m.reply(
      `╭─❏「 🏆 TOP RANDOM 」❏\n` +
      `│ ❌ *FORMAT TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${usage}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let args = text.trim().split(/\s+/)

  if (!/^\d+$/.test(args[0])) {
    return m.reply(
      `╭─❏「 🏆 TOP RANDOM 」❏\n` +
      `│ ❌ *JUMLAH TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Jumlah harus berupa angka.\n\n` +
      `${usage}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  let jumlah = Number(args[0])
  let judul = args.slice(1).join(' ')

  if (jumlah > 20) {
    return m.reply(
      `╭─❏「 🏆 TOP RANDOM 」❏\n` +
      `│ ❌ *JUMLAH TERLALU BANYAK*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Maksimal top 20 agar tidak spam.\n\n` +
      `${usage}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (jumlah < 1) {
    return m.reply(
      `╭─❏「 🏆 TOP RANDOM 」❏\n` +
      `│ ❌ *JUMLAH TIDAK VALID*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Jumlah minimal 1.\n\n` +
      `${usage}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (!judul) {
    return m.reply(
      `╭─❏「 🏆 TOP RANDOM 」❏\n` +
      `│ ❌ *JUDUL KOSONG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Judul top tidak boleh kosong.\n\n` +
      `${usage}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const now = Date.now()
  const remaining = TOP_COOLDOWN - (now - (Number(chat.topLastUsed) || 0))
  if (remaining > 0) {
    return m.reply(`⏳ Perintah .top sedang cooldown di grup ini. Coba lagi dalam ${Math.ceil(remaining / 1000)} detik.`)
  }

  const excluded = new Set(chat.topNoTag)
  const members = groupMetadata.participants.map(v => normalizeJid(v.id)).filter(jid => !excluded.has(jid))
  if (jumlah > members.length) {
    return m.reply(`❌ Hanya ada ${members.length} anggota yang bersedia di-tag di grup ini.`)
  }

  let picked = []
  let teks =
    `🏆 TOP ${jumlah} ${judul.toUpperCase()}\n` +
    `─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Ini fitur just for fun; tag dipilih secara acak dari member grup. Apabila merasa terganggu, bisa ketik .top notag\n\n`

  while (picked.length < jumlah) {
    let id = members.getRandom()
    if (picked.includes(id)) continue
    picked.push(id)

    teks += `🏆 *${picked.length}. @${id.split('@')[0]}*\n`
  }

  teks += `\n─━━━━━━━━━━━━━━─`

  chat.topLastUsed = now
  if (typeof global.db.write === 'function') await global.db.write()
  await conn.sendMessage(m.chat, {
    text: teks.trim(),
    mentions: picked
  }, { quoted: m })
}

handler.help = ['top <jumlah> <judul>', 'top notag', 'top tagme', 'top list']
handler.tags = ['fun']
handler.command = /^top$/i
handler.group = true

export default handler