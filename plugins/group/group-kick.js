import pkg from '@whiskeysockets/baileys'
const {  areJidsSameUser  } = pkg
import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, text, isAdmin, isOwner, usedPrefix, command }) => {
  if (!isAdmin && !isOwner) {
    return m.reply('❌ Perintah ini hanya dapat digunakan oleh Admin Grup!')
  }

  let targets = []

  // 1. Dari Reply (pesan baru maupun lama)
  if (m.quoted && m.quoted.sender) {
    targets.push(m.quoted.sender)
  }

  // 2. Dari Mention (@user)
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    targets.push(...m.mentionedJid)
  }

  // 3. Dari Teks (Nomor HP)
  if (text) {
    let numbers = text.split(/[\s,]+/)
      .map(v => v.replace(/[^0-9]/g, ''))
      .filter(v => v.length >= 7 && v.length <= 15)
      .map(v => v + '@s.whatsapp.net')
    targets.push(...numbers)
  }

  // Hilangkan duplikat dan hilangkan bot sendiri
  let botJid = conn.decodeJid(conn.user.id)
  targets = [...new Set(targets)].filter(u => !areJidsSameUser(u, botJid))

  if (!targets.length) {
    return m.reply(`⚠️ Reply pesan user (baru/lama), tag, atau masukkan nomor yang ingin di-kick!\n\n📌 Contoh:\n• *${usedPrefix + command}* @user\n• Reply pesan user lalu ketik *${usedPrefix + command}*\n• *${usedPrefix + command}* 628123456789`)
  }

  await m.react('⏳')

  const metadata = await conn.groupMetadata(m.chat)
  const memberJids = metadata.participants.map(p => conn.decodeJid(p.id || p.jid))

  let kicked = []
  for (let user of targets) {
    let cleanJid = conn.decodeJid(user)
    if (!memberJids.includes(cleanJid)) continue
    try {
      await conn.groupParticipantsUpdate(m.chat, [cleanJid], 'remove')
      kicked.push(cleanJid)
      await delay(500)
    } catch (err) {
      console.error(`Failed to kick ${cleanJid}:`, err)
    }
  }

  if (kicked.length > 0) {
    await m.react('✅')
    try {
      const res = await fetch('https://files.cloudkuimages.guru/images/530956c488bc.webp')
      const buffer = await res.buffer()
      const sticker = new Sticker(buffer, {
        pack: 'Group Admin',
        author: 'Bot',
        quality: 80
      })
      await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m })
    } catch {}
  } else {
    await m.react('❌')
    m.reply('❌ Gagal mengeluarkan anggota. Pastikan target ada di dalam grup dan bot adalah admin.')
  }
}

handler.help = ['kick @user/nomor']
handler.tags = ['group']
handler.command = /^(kick|dor)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
