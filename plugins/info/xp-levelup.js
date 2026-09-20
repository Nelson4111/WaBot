import { toSmallNum } from '../../lib/style.js'
import {
  xpRange,
  findLevel,
  canLevelUp,
  getLevelRole,
  getLevelReward,
  createProgressBar,
  getLevelThumbnail
} from '../../lib/levelling.js'

let handler = async (m, { conn, command, args, usedPrefix }) => {
  command = String(command || '').toLowerCase()
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
  who = conn.decodeJid(who)
  let isMe = who === m.sender

  let user = global.db?.data?.users?.[who]
  if (!user) {
    global.db.data.users[who] = {
      exp: 0,
      limit: 100,
      money: 0,
      registered: true,
      name: conn.getName(who) || 'User',
      level: 0,
      role: 'Pendatang',
      autolevelup: false
    }
    user = global.db.data.users[who]
  }

  if (typeof user.exp !== 'number' || isNaN(user.exp)) user.exp = 0
  if (typeof user.level !== 'number' || isNaN(user.level)) user.level = 0
  if (typeof user.autolevelup !== 'boolean') user.autolevelup = false

  const multiplier = global.multiplier || 36
  const name = user.name || conn.getName(who) || 'User'
  const userRole = getLevelRole(user.level)

  // ═══════════════════════════════════════════════
  // 1. Perintah: .autolevelup [on/off]
  // ═══════════════════════════════════════════════
  if (command === 'autolevelup') {
    let type = (args[0] || '').toLowerCase()
    if (['on', 'enable', '1', 'true', 'aktif'].includes(type)) {
      user.autolevelup = true
      return m.reply(`*╭  〔 ⚙ ᴀ ᴜ ᴛ ᴏ  ʟ ᴇ ᴠ ᴇ ʟ ᴜ ᴘ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Aktif (ON) ✓*\n> Bot akan otomatis memberi tahu dan membagikan reward setiap kali kamu naik level.\n*╰───────────────*`)
    } else if (['off', 'disable', '0', 'false', 'mati'].includes(type)) {
      user.autolevelup = false
      return m.reply(`*╭  〔 ⚙ ᴀ ᴜ ᴛ ᴏ  ʟ ᴇ ᴠ ᴇ ʟ ᴜ ᴘ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Nonaktif (OFF) ✕*\n> Notifikasi otomatis dimatikan. Kamu bisa naik level secara manual kapan saja dengan mengetik *${usedPrefix}levelup*.\n*╰───────────────*`)
    } else {
      let status = user.autolevelup ? 'Aktif (ON) ✓' : 'Nonaktif (OFF) ✕'
      return m.reply(`*╭  〔 ⚙ ᴀ ᴜ ᴛ ᴏ  ʟ ᴇ ᴠ ᴇ ʟ ᴜ ᴘ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ ꜱᴀᴀᴛ ɪɴɪ : *${status}*\n*╰───────────────*\n\n> 💡 *Pengaturan:*\n> • *${usedPrefix}autolevelup on* (Nyalakan notifikasi auto level)\n> • *${usedPrefix}autolevelup off* (Matikan notifikasi auto level)`)
    }
  }

  // ═══════════════════════════════════════════════
  // 2. Perintah: .level (Cek Status Level & EXP)
  // ═══════════════════════════════════════════════
  if (command === 'level') {
    let { min, max, xp: reqXp } = xpRange(user.level, multiplier)
    let currentExpInLevel = Math.max(0, user.exp - min)
    let percent = Math.min(100, Math.max(0, Math.floor((currentExpInLevel / (reqXp || 1)) * 100)))
    let remainingExp = Math.max(0, max - user.exp)
    let bar = createProgressBar(percent, 10)
    let canUp = canLevelUp(user.level, user.exp, multiplier)
    let nextLvl = user.level + 1
    let nextReward = getLevelReward(user.level, nextLvl)

    let text = `*──  ୨୧ ✧ ʟ ᴇ ᴠ ᴇ ʟ  ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ ✧ ୨୧  ──*

*╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${name}*
*┆* ✧ ʟᴇᴠᴇʟ    : *${toSmallNum(user.level)} ㋡*
*┆* ◈ ɢᴇʟᴀʀ    : *${userRole}*
*┆* ⚙ ᴀᴜᴛᴏ ᴜᴘ  : *${user.autolevelup ? 'ON ✓' : 'OFF ✕'}*
*╰───────────────*

*╭  〔 ✮ ᴘ ʀ ᴏ ɢ ʀ ᴇ ꜱ  ᴇ x ᴘ 〕*
*┆* ⟡ ᴛᴏᴛᴀʟ ᴇxᴘ : *${toSmallNum(user.exp.toLocaleString('id-ID'))} XP*
*┆* ✧ ᴋᴇ ʟᴠ.${toSmallNum(nextLvl)}  : *${toSmallNum(remainingExp.toLocaleString('id-ID'))} XP lagi*
*┆* ◈ ʙᴀʀ       : *[${bar}] (${toSmallNum(percent)}%)*
*╰───────────────*

*╭  〔 🎁 ʜ ᴀ ᴅ ɪ ᴀ ʜ  ʟ ᴠ . ${toSmallNum(nextLvl)} 〕*
*┆* ⌬ ʟɪᴍɪᴛ     : *+${toSmallNum(nextReward.limit)} Ⓛ*
*┆* ❖ ꜱᴀʟᴅᴏ     : *+Rp ${toSmallNum(nextReward.money.toLocaleString('id-ID'))}*
*╰───────────────*

${canUp ? `> ✨ *EXP KAMU SUDAH CUKUP!*\n> Ketik *${usedPrefix}levelup* sekarang untuk mengklaim level dan hadiahmu!` : `> 💡 *Tips Memperoleh EXP:*\n> • Chatting aktif di dalam grup\n> • Mainkan game (*${usedPrefix}tebakgambar*, *${usedPrefix}caklontong*, dsb)\n> • Berpetualang di menu RPG (*${usedPrefix}adventure*, *${usedPrefix}mining*)`}`.trim()

    let levelThumb = await getLevelThumbnail(conn, who)
    const footer = `${global.namebot || 'Avelia'} • Leveling System`
    const buttons = canUp
      ? [['🆙 Level Up', `${usedPrefix}levelup`], ['👤 Profil', `${usedPrefix}profile`]]
      : [['👤 Profil', `${usedPrefix}profile`], ['📋 Menu', `${usedPrefix}allmenu`]]
    const thumbBuffer = levelThumb?.thumbnail || levelThumb?.thumbnailUrl

    if (typeof conn.sendButtonV2 === 'function') {
      try {
        return await conn.sendButtonV2(m.chat, {
          title: `✦ STATUS LEVEL: Lv.${user.level} ✦`,
          subtitle: `${userRole} • ${percent}% EXP`,
          text,
          footer,
          buffer: thumbBuffer,
          buttons,
          contextInfo: { mentions: [who] }
        }, m)
      } catch (e) {
        console.warn('[.level sendButtonV2 failed]:', e?.message)
      }
    }

    return await conn.sendMessage(m.chat, {
      text,
      mentions: [who]
    }, { quoted: m }).catch(() => conn.reply(m.chat, text, m, { mentions: [who] }))
  }

  // ═══════════════════════════════════════════════
  // 3. Perintah: .levelup / .lvlup (Klaim Naik Level)
  // ═══════════════════════════════════════════════
  if (['levelup', 'lvlup'].includes(command)) {
    if (!isMe) return m.reply(`⚠️ Kamu hanya bisa menaikkan level untuk akunmu sendiri.`)

    let before = user.level
    let canUp = canLevelUp(user.level, user.exp, multiplier)

    if (!canUp) {
      let { min, max, xp: reqXp } = xpRange(user.level, multiplier)
      let currentExpInLevel = Math.max(0, user.exp - min)
      let percent = Math.min(100, Math.max(0, Math.floor((currentExpInLevel / (reqXp || 1)) * 100)))
      let remainingExp = Math.max(0, max - user.exp)
      let bar = createProgressBar(percent, 10)

      let textFail = `*──  ୨୧ ✧ ʙ ᴇ ʟ ᴜ ᴍ  ᴄ ᴜ ᴋ ᴜ ᴘ ✧ ୨୧  ──*

*╭  〔 ✕ ʙ ᴇ ʟ ᴜ ᴍ  ʙ ɪ ꜱ ᴀ  ɴ ᴀ ɪ ᴋ 〕*
*┆* ⟡ ʟᴇᴠᴇʟ ꜱᴀᴀᴛ ɪɴɪ : *${toSmallNum(user.level)} (${userRole})*
*┆* ✧ ᴛᴏᴛᴀʟ ᴇxᴘ      : *${toSmallNum(user.exp.toLocaleString('id-ID'))} XP*
*┆* ✦ ʙᴜᴛᴜʜ ᴇxᴘ      : *${toSmallNum(remainingExp.toLocaleString('id-ID'))} XP lagi*
*┆* ◈ ᴘʀᴏɢʀᴇꜱ        : *[${bar}] (${toSmallNum(percent)}%)*
*╰───────────────*

> _Semangat! Terus gunakan bot dan mainkan game untuk mengumpulkan EXP!_`.trim()

      if (typeof conn.sendButtonV2 === 'function') {
        try {
          let levelThumb = await getLevelThumbnail(conn, m.sender)
          return await conn.sendButtonV2(m.chat, {
            title: '✦ EXP BELUM CUKUP ✦',
            subtitle: `Lv.${user.level} • Butuh ${remainingExp} XP lagi`,
            text: textFail,
            footer: `${global.namebot || 'Avelia'} • Leveling System`,
            buffer: levelThumb?.thumbnail || levelThumb?.thumbnailUrl,
            buttons: [
              ['⚔️ Petualangan', `${usedPrefix}adventure`],
              ['⛏️ Menambang', `${usedPrefix}mining`]
            ]
          }, m)
        } catch (e) {
          console.warn('[.levelup fail sendButtonV2 failed]:', e?.message)
        }
      }

      return conn.reply(m.chat, textFail, m)
    }

    let newLevel = findLevel(user.exp, multiplier)
    if (newLevel <= before) {
      return m.reply(`⚠️ EXP kamu belum mencukupi untuk naik level berikutnya.`)
    }

    user.level = newLevel
    const reward = getLevelReward(before, user.level)
    user.limit = (user.limit || 0) + reward.limit
    user.money = (user.money || 0) + reward.money
    user.role = getLevelRole(user.level)

    let levelThumb = await getLevelThumbnail(conn, m.sender)

    const senderJid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    let phoneJid = senderJid
    let userLid = null

    if (m.isGroup) {
      const groupMeta = (conn.chats?.[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(() => null)
      const found = (groupMeta?.participants || []).find(p => p.id === m.sender || p.lid === m.sender || p.jid === m.sender)
      if (found) {
        if (found.lid) userLid = found.lid
        if (found.jid && found.jid.endsWith('@s.whatsapp.net')) phoneJid = found.jid
        else if (found.id && found.id.endsWith('@s.whatsapp.net')) phoneJid = found.id
        else if (found.phoneNumber || found.phone || found.pn) {
          const clean = String(found.phoneNumber || found.phone || found.pn).replace(/\D/g, '')
          if (clean) phoneJid = `${clean}@s.whatsapp.net`
        }
      }
    }

    if (phoneJid.endsWith('@lid')) {
      if (global.lids?.[phoneJid]) phoneJid = global.lids[phoneJid]
      if (global.db?.data?.lids?.[phoneJid]) phoneJid = global.db.data.lids[phoneJid]
    }

    const userNumber = phoneJid.split('@')[0].split(':')[0].replace(/\D/g, '') || m.sender.split('@')[0].split(':')[0].replace(/\D/g, '')
    const mentionJids = Array.from(new Set([
      `${userNumber}@s.whatsapp.net`,
      phoneJid,
      userLid,
      m.sender
    ].filter(Boolean)))

    let caption = `*──  ୨୧ ✧ LEVEL UP ✧ ୨୧  ──*

*╭  〔 ✮ ꜱ ᴇ ʟ ᴀ ᴍ ᴀ ᴛ ! 〕*
*┆* ⟡ ᴘᴇɴɢɢᴜɴᴀ   : *@${userNumber}*
*┆* ✧ ʟᴇᴠᴇʟ ʟᴀᴍᴀ : *${toSmallNum(before)}*
*┆* ✦ ʟᴇᴠᴇʟ ʙᴀʀᴜ : *${toSmallNum(user.level)} ㋡*
*┆* ◈ ɢᴇʟᴀʀ ʙᴀʀᴜ : *${user.role}*
*╰───────────────*

*╭  〔 🎁 ʜ ᴀ ᴅ ɪ ᴀ ʜ 〕*
*┆* ⌬ ʟɪᴍɪᴛ      : *+${toSmallNum(reward.limit)} Ⓛ*
*┆* ❖ ꜱᴀʟᴅᴏ      : *+Rp ${toSmallNum(reward.money.toLocaleString('id-ID'))}*
*╰───────────────*

> _Selamat! Kamu berhasil naik ${user.level - before} tingkatan level!_
> _Tingkatkan terus keaktifanmu untuk meraih gelar Mythic Immortal!_`.trim()

    const footer = `${global.namebot || 'Avelia'} • Leveling System`
    const buttons = [
      ['👤 Profil', `${usedPrefix}profile`],
      ['📋 Menu', `${usedPrefix}allmenu`]
    ]
    const thumbBuffer = levelThumb?.thumbnail || levelThumb?.thumbnailUrl

    if (typeof conn.sendButtonV2 === 'function') {
      try {
        return await conn.sendButtonV2(m.chat, {
          title: '✦ LEVEL UP BERHASIL! ✦',
          subtitle: `Lv.${user.level} • ${user.role}`,
          text: caption,
          footer,
          buffer: thumbBuffer,
          buttons,
          contextInfo: {
            mentionedJid: mentionJids,
            mentions: mentionJids
          }
        }, m)
      } catch (e) {
        console.warn('[.levelup success sendButtonV2 failed]:', e?.message)
      }
    }

    await conn.sendMessage(m.chat, {
      text: caption,
      mentions: mentionJids,
      contextInfo: { mentionedJid: mentionJids }
    }, { quoted: m }).catch(() => conn.reply(m.chat, caption, m, { mentions: mentionJids }))
  }
}

handler.help = ['level', 'levelup', 'autolevelup [on/off]']
handler.tags = ['info', 'game']
handler.command = /^(level|levelup|lvlup|autolevelup)$/i
handler.register = true

export default handler
