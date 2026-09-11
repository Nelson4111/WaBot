import { toSmallNum } from '../../lib/style.js'
import { getPasanganHiddenNotice, isPasanganHidden } from '../../lib/pasanganHelper.js'

/**
 * Hadiah Pasangan Plugin
 * Mengirimkan saldo atau aset kepada pasangan tanpa biaya potongan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, args }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const pList = users[sender]?.pasangan || []

  if (isPasanganHidden(users[sender] || {})) {
    return m.reply(getPasanganHiddenNotice(sender.split('@')[0].replace(/\D/g, ''), true))
  }

  if (pList.length === 0) {
    return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu tidak memiliki pasangan untuk diberi hadiah.\n*╰───────────────*')
  }

  let target = m.mentionedJid?.[0] || pList[0]?.jid
  let type = (args[0] || '').toLowerCase()
  let count = parseInt(args[1] || args[0])

  if (m.mentionedJid?.[0]) {
    type = (args[1] || '').toLowerCase()
    count = parseInt(args[2])
  }

  const validTypes = ['limit', 'exp', 'money', 'atm', 'berlian']
  if (!validTypes.includes(type) || isNaN(count) || count <= 0) {
    const guideTxt = `*──  ୨୧ ✧ FORMAT HADIAH PASANGAN ✧ ୨୧  ──*

*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*
*┆* › *${usedPrefix}hadiah limit <jumlah>*
*┆* › *${usedPrefix}hadiah exp <jumlah>*
*┆* › *${usedPrefix}hadiah money <jumlah>*
*┆* › *${usedPrefix}hadiah atm <jumlah>*
*┆* › *${usedPrefix}hadiah berlian <jumlah>*
*╰───────────────*

> _Bisa dihadiahkan secara penuh ke pasangan tanpa potongan biaya transfer!_`.trim()

    return m.reply(guideTxt)
  }

  if (type === 'money') {
    const moneySrc = global.db?.data?.money?.[sender] || 0
    if (moneySrc < count) {
      return m.reply(`*╭  〔 ◈ ꜱ ᴀ ʟ ᴅ ᴏ  ᴋ ᴜ ʀ ᴀ ɴ ɢ 〕*\n> Saldo Uangmu tidak mencukupi!\n> Kamu memiliki: *Rp ${toSmallNum(moneySrc.toLocaleString('id-ID'))}*.\n*╰───────────────*`)
    }
    global.db.data.money[sender] -= count
    global.db.data.money[target] = (global.db.data.money[target] || 0) + count
  } else if (type === 'atm') {
    const bankSrc = global.db?.data?.bank?.[sender] || 0
    if (bankSrc < count) {
      return m.reply(`*╭  〔 ◈ ꜱ ᴀ ʟ ᴅ ᴏ  ᴋ ᴜ ʀ ᴀ ɴ ɢ 〕*\n> Saldo Bank ATM kamu tidak mencukupi!\n> Kamu memiliki: *Rp ${toSmallNum(bankSrc.toLocaleString('id-ID'))}*.\n*╰───────────────*`)
    }
    global.db.data.bank[sender] -= count
    global.db.data.bank[target] = (global.db.data.bank[target] || 0) + count
  } else if (type === 'berlian') {
    if (!users[sender].inventory) users[sender].inventory = {}
    const berSrc = users[sender].inventory.berlian || 0
    if (berSrc < count) {
      return m.reply(`*╭  〔 ◈ ꜱ ᴀ ʟ ᴅ ᴏ  ᴋ ᴜ ʀ ᴀ ɴ ɢ 〕*\n> Berlian kamu tidak mencukupi!\n> Kamu memiliki: *${toSmallNum(berSrc)} Berlian*.\n*╰───────────────*`)
    }
    users[sender].inventory.berlian -= count
    if (!users[target].inventory) users[target].inventory = {}
    users[target].inventory.berlian = (users[target].inventory.berlian || 0) + count
  } else {
    const userVal = users[sender][type] || 0
    if (userVal < count) {
      return m.reply(`*╭  〔 ◈ ꜱ ᴀ ʟ ᴅ ᴏ  ᴋ ᴜ ʀ ᴀ ɴ ɢ 〕*\n> Saldo ${type.toUpperCase()} kamu tidak mencukupi!\n> Kamu memiliki: *${toSmallNum(userVal)} ${type}*.\n*╰───────────────*`)
    }
    users[sender][type] -= count
    if (!users[target]) users[target] = {}
    users[target][type] = (users[target][type] || 0) + count
  }

  const senderNum = sender.split('@')[0].replace(/\D/g, '')
  const targetNum = target.split('@')[0].replace(/\D/g, '')

  const successText = `*──  ୨୧ ✧ HADIAH CINTA TERKIRIM ✧ ୨୧  ──*

*╭  〔 ᰔ ᴛ ʀ ᴀ ɴ ꜱ ꜰ ᴇ ʀ  ʜ ᴀ ᴅ ɪ ᴀ ʜ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ  : @${senderNum}
*┆* ✧ ᴘᴇɴᴇʀɪᴍᴀ  : @${targetNum}
*┆* ✦ ᴊᴜᴍʟᴀʜ    : *${toSmallNum(count.toLocaleString('id-ID'))} ${type.toUpperCase()}*
*┆* ◈ ʙɪᴀʏᴀ     : *Gratis (Bebas Potongan)*
*╰───────────────*

> Berbagi rezeki bersama pasangan mempererat tali kasih dan keharmonisan ♡`.trim()

  return conn.sendMessage(m.chat, {
    text: successText,
    mentions: [sender, target]
  }, { quoted: m })
}

handler.help = ['hadiah <tipe> <jumlah>']
handler.tags = ['pasangan']
handler.command = /^(hadiah)$/i

export default handler
