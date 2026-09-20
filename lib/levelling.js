import { toSmallNum, getMenuThumbnail } from './style.js'

export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * .75

export function xpRange(level, multiplier = global.multiplier || 36) {
  if (level < 0) throw new TypeError('level tidak boleh negatif')
  level = Math.floor(level)
  let min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  let max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max, xp: max - min }
}

export function findLevel(xp, multiplier = global.multiplier || 36) {
  if (xp === Infinity) return Infinity
  if (isNaN(xp)) return NaN
  if (xp <= 0) return 0
  let level = 0
  while (xpRange(level + 1, multiplier).min <= xp) {
    level++
  }
  return level
}

export function canLevelUp(level, xp, multiplier = global.multiplier || 36) {
  if (level < 0) return false
  if (xp === Infinity) return true
  if (isNaN(xp) || xp <= 0) return false
  return level < findLevel(xp, multiplier)
}

export const ROLES = [
  { level: 0, title: 'Pendatang' },
  { level: 5, title: 'Penyimak' },
  { level: 10, title: 'Pengamat' },
  { level: 15, title: 'Penonton' },
  { level: 20, title: 'Mulai Nimbrung' },
  { level: 25, title: 'Ikut Ramai' },
  { level: 30, title: 'Ikut Ngobrol' },
  { level: 35, title: 'Mulai Muncul' },
  { level: 40, title: 'Sering Muncul' },
  { level: 45, title: 'Member Baru' },
  { level: 50, title: 'Member Aktif' },
  { level: 55, title: 'Rajin Nimbrung' },
  { level: 60, title: 'Rajin Ngobrol' },
  { level: 65, title: 'Ikut Nongkrong' },
  { level: 70, title: 'Makin Aktif' },
  { level: 75, title: 'Sering Nimbrung' },
  { level: 80, title: 'Sering Nongkrong' },
  { level: 85, title: 'Teman Ngobrol' },
  { level: 90, title: 'Member Lama' },
  { level: 95, title: 'Member Ramai' },
  { level: 100, title: 'Anak Grup' },
  { level: 110, title: 'Anak Nongkrong' },
  { level: 120, title: 'Teman Grup' },
  { level: 130, title: 'Langganan Nongkrong' },
  { level: 140, title: 'Langganan Ngobrol' },
  { level: 150, title: 'Member Tetap' },
  { level: 160, title: 'Member Senior' },
  { level: 170, title: 'Penghuni Grup' },
  { level: 180, title: 'Penghuni Tetap' },
  { level: 190, title: 'Orang Lama' },
  { level: 200, title: 'Sesepuh Grup' },
  { level: 210, title: 'Tetua Grup' },
  { level: 220, title: 'Tokoh Grup' },
  { level: 230, title: 'Panutan Grup' },
  { level: 240, title: 'Andalan Grup' },
  { level: 250, title: 'Pemain Lama' },
  { level: 260, title: 'Penggerak Grup' },
  { level: 270, title: 'Peramai Grup' },
  { level: 280, title: 'Pengisi Grup' },
  { level: 290, title: 'Penghidup Grup' },
  { level: 300, title: 'Jagoan Grup' },
  { level: 310, title: 'Member Inti' },
  { level: 320, title: 'Member Setia' },
  { level: 330, title: 'Member Tetap' },
  { level: 340, title: 'Member Lama' },
  { level: 350, title: 'Member Senior' },
  { level: 360, title: 'Member Veteran' },
  { level: 370, title: 'Penghuni Lama' },
  { level: 380, title: 'Penghuni Setia' },
  { level: 390, title: 'Penghuni Aktif' },
  { level: 400, title: 'Sesepuh Aktif' },
  { level: 410, title: 'Tetua Aktif' },
  { level: 420, title: 'Tokoh Lama' },
  { level: 430, title: 'Tokoh Aktif' },
  { level: 440, title: 'Panutan Grup' },
  { level: 450, title: 'Andalan Grup' },
  { level: 460, title: 'Penggerak Grup' },
  { level: 470, title: 'Peramai Grup' },
  { level: 480, title: 'Penghidup Grup' },
  { level: 490, title: 'Ikon Grup' },
  { level: 500, title: 'Legenda Grup' },
  { level: 525, title: 'Langganan Aktif' },
  { level: 550, title: 'Nimbrung Terus' },
  { level: 575, title: 'Rajin Nongkrong' },
  { level: 600, title: 'Rajin Nimbrung' },
  { level: 625, title: 'Rajin Ngobrol' },
  { level: 650, title: 'Selalu Muncul' },
  { level: 675, title: 'Selalu Aktif' },
  { level: 700, title: 'Aktif Terus' },
  { level: 725, title: 'Paling Ramai' },
  { level: 750, title: 'Paling Aktif' },
  { level: 775, title: 'Paling Nongkrong' },
  { level: 800, title: 'Nimbrung Banget' },
  { level: 825, title: 'Langganan Grup' },
  { level: 850, title: 'Penghuni Setia' },
  { level: 875, title: 'Anak Tetap' },
  { level: 900, title: 'Orang Dalam' },
  { level: 910, title: 'Orang Dekat' },
  { level: 920, title: 'Teman Lama' },
  { level: 930, title: 'Teman Setia' },
  { level: 940, title: 'Kawan Lama' },
  { level: 950, title: 'Kawan Setia' },
  { level: 960, title: 'Bagian Grup' },
  { level: 970, title: 'Bagian Tetap' },
  { level: 980, title: 'Warga Grup' },
  { level: 990, title: 'Warga Tetap' },
  { level: 1000, title: 'Sesepuh' }
]

export function getLevelRole(level) {
  level = Math.max(0, parseInt(level) || 0)
  let currentRole = ROLES[0].title
  for (const r of ROLES) {
    if (level >= r.level) currentRole = r.title
    else break
  }
  return currentRole
}

export function getLevelReward(oldLevel, newLevel) {
  oldLevel = Math.max(0, parseInt(oldLevel) || 0)
  newLevel = Math.max(oldLevel, parseInt(newLevel) || 0)
  const diff = newLevel - oldLevel
  if (diff <= 0) return { limit: 0, money: 0, diff: 0 }

  let totalLimit = 0
  let totalMoney = 0
  for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
    totalLimit += 5
    totalMoney += lvl * 1500
  }
  return {
    diff,
    limit: totalLimit,
    money: totalMoney
  }
}

export function createProgressBar(percent, length = 10) {
  const filled = Math.min(length, Math.max(0, Math.round((percent / 100) * length)))
  const empty = length - filled
  return '■'.repeat(filled) + '□'.repeat(empty)
}

/**
 * Mendapatkan thumbnail level up: mengutamakan foto profil user (ppuser),
 * jika tidak tersedia / privat, fallback ke gambar menu (imgmenu)
 * @param {object} conn - Baileys socket
 * @param {string} jid - User JID
 * @returns {Promise<{ thumbnail?: Buffer, thumbnailUrl?: string }>}
 */
export async function getLevelThumbnail(conn, jid) {
  let pp = null
  if (conn && typeof conn.profilePictureUrl === 'function' && jid) {
    try {
      pp = await conn.profilePictureUrl(jid, 'image')
    } catch {}
  }

  // 1. Prioritaskan Foto Profil Pengguna (ppuser)
  if (pp) {
    try {
      const res = await fetch(pp)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        return { thumbnail: buf, thumbnailUrl: pp }
      }
    } catch {}
    return { thumbnailUrl: pp }
  }

  // 2. Fallback: Gunakan Gambar Menu (imgmenu)
  try {
    const menuThumb = await getMenuThumbnail()
    if (menuThumb) {
      return { 
        thumbnail: menuThumb,
        thumbnailUrl: global.thumb || 'https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg'
      }
    }
  } catch {}

  // 3. Fallback default
  return {
    thumbnailUrl: global.thumb || 'https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg'
  }
}

export async function checkLevelUp(m, conn) {
  let user = global.db?.data?.users?.[m.sender]
  if (!user || !user.autolevelup) return false
  if (typeof user.exp !== 'number' || isNaN(user.exp)) user.exp = 0
  if (typeof user.level !== 'number' || isNaN(user.level)) user.level = 0

  const multiplier = global.multiplier || 36
  if (canLevelUp(user.level, user.exp, multiplier)) {
    let before = user.level
    let newLevel = findLevel(user.exp, multiplier)
    if (newLevel <= before) return false

    user.level = newLevel
    const reward = getLevelReward(before, user.level)

    user.limit = (user.limit || 0) + reward.limit
    user.money = (user.money || 0) + reward.money
    user.role = getLevelRole(user.level)

    const levelThumb = await getLevelThumbnail(conn, m.sender)

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

*╭  〔 ✮ ɴ ᴀ ɪ ᴋ  ʟ ᴇ ᴠ ᴇ ʟ 〕*
*┆* ⟡ ᴘᴇɴɢɢᴜɴᴀ   : *@${userNumber}*
*┆* ✧ ʟᴇᴠᴇʟ ʟᴀᴍᴀ : *${toSmallNum(before)}*
*┆* ✦ ʟᴇᴠᴇʟ ʙᴀʀᴜ : *${toSmallNum(user.level)} ㋡*
*┆* ◈ ɢᴇʟᴀʀ ʙᴀʀᴜ : *${user.role}*
*╰───────────────*

*╭  〔 🎁 ʜ ᴀ ᴅ ɪ ᴀ ʜ 〕*
*┆* ⌬ ʟɪᴍɪᴛ      : *+${toSmallNum(reward.limit)} Ⓛ*
*┆* ❖ ꜱᴀʟᴅᴏ      : *+Rp ${toSmallNum(reward.money.toLocaleString('id-ID'))}*
*╰───────────────*

> _Selamat! Terus tingkatkan aktivitasmu untuk mencapai rank tertinggi!_
> _Ketik *.autolevelup off* jika ingin mematikan notifikasi otomatis._`.trim()

    const footer = `${global.namebot || 'Avelia'} • Leveling System`
    const buttons = [
      ['👤 Profil', '.profile'],
      ['📋 Menu', '.menu']
    ]
    const thumbBuffer = levelThumb?.thumbnail || levelThumb?.thumbnailUrl

    if (typeof conn.sendButtonV2 === 'function') {
      try {
        await conn.sendButtonV2(m.chat, {
          title: '✦ LEVEL UP! ✦',
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
        return true
      } catch (e) {
        console.warn('[checkLevelUp sendButtonV2 failed]:', e?.message)
      }
    }

    await conn.sendMessage(m.chat, {
      text: caption,
      mentions: mentionJids,
      contextInfo: { mentionedJid: mentionJids }
    }, { quoted: m }).catch(() => {
      return conn.reply(m.chat, caption, m, { mentions: mentionJids })
    })
    return true
  }
  return false
}

export async function addExpAndCheckLevel(m, conn, exp = 17) {
  let user = global.db?.data?.users?.[m.sender]
  if (!user) return false
  if (typeof user.exp !== 'number' || isNaN(user.exp)) user.exp = 0
  user.exp += exp
  return await checkLevelUp(m, conn)
}