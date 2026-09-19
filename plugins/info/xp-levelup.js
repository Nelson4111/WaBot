import { toSmallNum } from '../../lib/style.js'
import {
  xpRange,
  findLevel,
  canLevelUp,
  getLevelRole,
  getLevelReward,
  createProgressBar
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
      role: 'Wanderer',
      autolevelup: true
    }
    user = global.db.data.users[who]
  }

  if (typeof user.exp !== 'number' || isNaN(user.exp)) user.exp = 0
  if (typeof user.level !== 'number' || isNaN(user.level)) user.level = 0
  if (typeof user.autolevelup !== 'boolean') user.autolevelup = true

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

    let randomThumb = 'https://i.pinimg.com/originals/a0/34/8a/a0348ae908d8ac4ced76df289eb41e1a.jpg'
    if (Array.isArray(global.thumblvlup) && global.thumblvlup.length > 0) {
      randomThumb = global.thumblvlup[Math.floor(Math.random() * global.thumblvlup.length)]
    }

    return await conn.sendMessage(m.chat, {
      text,
      mentions: [who],
      contextInfo: {
        externalAdReply: {
          title: `✦ STATUS LEVEL: Lv.${user.level} [${userRole}] ✦`,
          body: `Progres: [${bar}] ${percent}%`,
          thumbnailUrl: randomThumb,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
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

    let randomThumb = 'https://i.pinimg.com/originals/a0/34/8a/a0348ae908d8ac4ced76df289eb41e1a.jpg'
    if (Array.isArray(global.thumblvlup) && global.thumblvlup.length > 0) {
      randomThumb = global.thumblvlup[Math.floor(Math.random() * global.thumblvlup.length)]
    }

    let caption = `*──  ୨୧ ✧ LEVEL UP ✧ ୨୧  ──*

*╭  〔 ✮ ꜱ ᴇ ʟ ᴀ ᴍ ᴀ ᴛ ! 〕*
*┆* ⟡ ᴘᴇɴɢɢᴜɴᴀ   : *@${m.sender.split('@')[0]}*
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

    await conn.sendMessage(m.chat, {
      text: caption,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: `✦ LEVEL UP! [Lv.${user.level} • ${user.role}] ✦`,
          body: `Selamat @${m.name || 'User'} naik level ke ${user.level}!`,
          thumbnailUrl: randomThumb,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m }).catch(() => conn.reply(m.chat, caption, m, { mentions: [m.sender] }))
  }
}

handler.help = ['level', 'levelup', 'autolevelup [on/off]']
handler.tags = ['info', 'game']
handler.command = /^(level|levelup|lvlup|autolevelup)$/i
handler.register = true

export default handler
