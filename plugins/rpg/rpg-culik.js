import { loadDB, getUserRPG, saveDB } from '../../lib/waifuHelper.js'
import {
  KIDNAP_ESCAPE_STORIES,
  KIDNAP_INACTIVITY_LABEL,
  KIDNAP_INACTIVITY_STORIES,
  KIDNAP_INACTIVITY_TIMEOUT,
  RPG_CRIME_ACTIONS
} from '../../lib/rpgCrimeData.js'
import { runRpgCrimeAction } from '../../lib/rpgCrimeAction.js'

const formatMoney = value => `Rp ${Number(value).toLocaleString('id-ID')}`
const pickStory = stories => stories[Math.floor(Math.random() * stories.length)]
const pickInactivityStory = () => pickStory(KIDNAP_INACTIVITY_STORIES)
  .replace(/\{duration\}/g, KIDNAP_INACTIVITY_LABEL)

async function releaseInactiveKidnappedUsers() {
  const db = loadDB()
  const now = Date.now()
  const released = []
  for (const [jid, account] of Object.entries(db.users || {})) {
    const rpg = account?.rpg
    if (!rpg?.kidnappedBy) continue
    const escapeAttempt = rpg.kidnapEscapeAttempt
    if (escapeAttempt && now >= Number(escapeAttempt.expiresAt)) {
      const story = pickStory(KIDNAP_ESCAPE_STORIES)
      released.push({ jid, chat: escapeAttempt.chat || rpg.kidnapChat, story })
      delete rpg.kidnappedBy
      delete rpg.kidnappedAt
      delete rpg.kidnappedUntil
      delete rpg.kidnapRansom
      delete rpg.kidnapLastActivityAt
      delete rpg.kidnapChat
      delete rpg.kidnapEscapeAttempt
      delete rpg.kidnapEscapeCooldownAt
      rpg.riwayat = Array.isArray(rpg.riwayat) ? rpg.riwayat : []
      rpg.riwayat.unshift(story)
      continue
    }
    const lastActivity = Number(rpg.kidnapLastActivityAt || rpg.kidnappedAt) || 0
    if (now - lastActivity < KIDNAP_INACTIVITY_TIMEOUT) continue
    const story = pickInactivityStory()
    released.push({ jid, chat: rpg.kidnapChat, story })
    delete rpg.kidnappedBy
    delete rpg.kidnappedAt
    delete rpg.kidnappedUntil
    delete rpg.kidnapRansom
    delete rpg.kidnapLastActivityAt
    delete rpg.kidnapChat
    delete rpg.kidnapEscapeAttempt
    delete rpg.kidnapEscapeCooldownAt
    rpg.riwayat = Array.isArray(rpg.riwayat) ? rpg.riwayat : []
    rpg.riwayat.unshift(story)
  }
  if (!released.length) return
  await saveDB(db)
  const conn = global.conn
  if (!conn?.reply) return
  for (const { jid, chat, story } of released) {
    if (!chat) continue
    await conn.reply(
      chat,
      `${story}\n@${jid.split('@')[0]} sudah bebas dari penculikan.`,
      null,
      { mentions: [jid] }
    )
  }
}

const kidnapCleanupTimer = setInterval(() => {
  releaseInactiveKidnappedUsers().catch(error =>
    console.error('[RPG kidnap cleanup] Failed to release inactive kidnapped users:', error)
  )
}, 60 * 1000)
kidnapCleanupTimer.unref?.()

let handler = async (m, { conn, args = [], command }) => {
  const db = loadDB()
  if (command === 'tebus') {
    const targetJid = m.mentionedJid?.[0] || m.quoted?.sender
    if (!targetJid) {
      return m.reply(
        '❌ Tag atau reply korban penculikan yang ingin ditebus.\n' +
        'Untuk tahanan penjara, gunakan *.penjara tebus <tag/sel>*.'
      )
    }
    const victim = getUserRPG(db, targetJid)?.rpg
    const kidnapperJid = victim?.kidnappedBy
    if (!kidnapperJid || Date.now() >= Number(victim.kidnappedUntil || 0)) {
      return m.reply('❌ Target tidak sedang ditahan penculik. Untuk tebus tahanan penjara, gunakan *.penjara tebus <tag/sel>*.')
    }
    const ransom = Number(victim.kidnapRansom)
    if (!Number.isSafeInteger(ransom) || ransom <= 0) return m.reply('❌ Data tebusan penculikan tidak valid; hubungi Owner.')
    const payer = String(m.sender)
    const money = db.money || (db.money = {})
    const payerBalance = Number(money[payer]) || 0
    if (payerBalance < ransom) {
      return m.reply(`❌ Uang tidak cukup. Dibutuhkan *${formatMoney(ransom)}*, saldo kamu *${formatMoney(payerBalance)}*.`)
    }
    const normalizedKidnapper = kidnapperJid.endsWith('@lid')
      ? global.lids?.[kidnapperJid] || global.db?.data?.lids?.[kidnapperJid] || kidnapperJid
      : kidnapperJid
    money[payer] = payerBalance - ransom
    money[normalizedKidnapper] = (Number(money[normalizedKidnapper]) || 0) + ransom
    const victimRPG = victim
    const kidnapper = getUserRPG(db, normalizedKidnapper)?.rpg
    delete victimRPG.kidnappedBy
    delete victimRPG.kidnappedAt
    delete victimRPG.kidnappedUntil
    delete victimRPG.kidnapRansom
    delete victimRPG.kidnapLastActivityAt
    delete victimRPG.kidnapChat
    delete victimRPG.kidnapEscapeAttempt
    delete victimRPG.kidnapEscapeCooldownAt
    victimRPG.riwayat = Array.isArray(victimRPG.riwayat) ? victimRPG.riwayat : []
    victimRPG.riwayat.unshift(`✅ Ditebus oleh @${payer.split('@')[0]} sebesar ${formatMoney(ransom)}`)
    if (kidnapper) {
      kidnapper.riwayat = Array.isArray(kidnapper.riwayat) ? kidnapper.riwayat : []
      kidnapper.riwayat.unshift(`💰 Menerima tebusan ${formatMoney(ransom)} dari penculikan @${targetJid.split('@')[0]}`)
    }
    await saveDB(db)
    return conn.reply(
      m.chat,
      `✅ @${targetJid.split('@')[0]} berhasil dibebaskan dari penculikan!\n` +
      `> ↳ Penebus: @${payer.split('@')[0]}\n` +
      `> ↳ Tebusan *${formatMoney(ransom)}* telah diterima penculik @${normalizedKidnapper.split('@')[0]}.`,
      m,
      { mentions: [targetJid, payer, normalizedKidnapper] }
    )
  }

  const user = getUserRPG(db, m.sender)
  if (!user?.rpg) return m.reply('❌ Kamu belum punya data RPG. Mulai dengan *.adventure*')
  const ransomText = args.filter(argument => !String(argument).startsWith('@')).at(-1)
  const ransom = Number(String(ransomText || '').replace(/[,.]/g, ''))
  if (!Number.isSafeInteger(ransom) || ransom <= 0) {
    return m.reply('Format: *.culik <tag/reply> <nominal>*\nContoh: *.culik @user 1000000*')
  }

  return runRpgCrimeAction({
    m,
    conn,
    db,
    userRPG: user.rpg,
    targetJid: m.mentionedJid?.[0] || m.quoted?.sender,
    action: 'culik',
    config: RPG_CRIME_ACTIONS.culik,
    ransomAmount: ransom
  })
}

handler.help = ['culik <tag/reply> <nominal>', 'tebus <tag/reply korban penculikan>']
handler.tags = ['rpg']
handler.command = /^(culik|tebus)$/i
handler.alias = ['culik']
handler.group = true

export default handler
