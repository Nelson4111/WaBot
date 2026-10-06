let handler = async (m, { conn, groupMetadata, command, usedPrefix, text }) => {
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

  let members = groupMetadata.participants.map(v => v.id)

  if (jumlah > members.length)
    throw `Member grup cuma ${members.length}`

  let picked = []
  let teks =
    `🏆 TOP ${jumlah} ${judul.toUpperCase()}\n` +
    `─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Ini fitur just for fun; tag dipilih secara acak dari member grup.\n\n`

  while (picked.length < jumlah) {
    let id = members.getRandom()
    if (picked.includes(id)) continue
    picked.push(id)

    teks += `🏆 *${picked.length}. @${id.split('@')[0]}*\n`
  }

  teks += `\n─━━━━━━━━━━━━━━─`

  conn.sendMessage(m.chat, {
    text: teks.trim(),
    mentions: picked
  }, { quoted: m })
}

handler.help = ['top <jumlah> <judul>']
handler.tags = ['fun']
handler.command = /^top$/i
handler.group = true

export default handler