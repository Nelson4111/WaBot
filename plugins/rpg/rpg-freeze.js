import { randomBytes } from 'node:crypto'
import { formatRpgFreezeDuration, getRpgFreezeRecord, pauseRpgTimers } from '../../lib/rpgFreeze.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import { sendRpgConfirmButtons } from '../../lib/rpgActionButtons.js'
import { getBillAmounts } from '../../lib/rpgTax.js'
import { getRpgWibWeekKey } from '../../lib/rpgTime.js'

const FREEZE_CONFIRMATION_TTL = 2 * 60 * 1000

const getTargetJid = (m, conn) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  return target ? (conn.decodeJid ? conn.decodeJid(target) : target) : null
}

const formatFreezeEntry = (jid, account, now) => {
  const freeze = getRpgFreezeRecord(account)
  return `> ${account.name || account.pushName || jid.split('@')[0]}\n` +
    `> ↳ ${formatRpgFreezeDuration(now - Number(freeze.startedAt))} · sejak ${new Date(freeze.startedAt).toLocaleString('id-ID')}`
}

let handler = async (m, { conn, text = '', usedPrefix, isOwner }) => {
  const args = String(text).trim().split(/\s+/).filter(Boolean)
  const action = String(args[0] || '').toLowerCase()
  const targetJid = getTargetJid(m, conn)
  const users = global.db.data.users || {}
  const selfJid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
  const target = targetJid || selfJid
  const account = users[target] || (target === selfJid ? users[m.sender] : null)

  if (action === 'confirm' || action === 'cancel') {
    const token = args[1]
    if (args.length !== 2 || !token) {
      return m.reply(`Format: *${usedPrefix}rpgfreeze ${action} <kode-konfirmasi>*`)
    }

    const confirmations = global.db.data.rpgFreezeConfirmations ||
      (global.db.data.rpgFreezeConfirmations = {})
    const pending = confirmations[token]
    if (!pending || pending.requestedBy !== selfJid) {
      return m.reply('❌ Konfirmasi tidak ditemukan atau bukan milik akunmu.')
    }
    if (Date.now() - Number(pending.createdAt) > FREEZE_CONFIRMATION_TTL) {
      delete confirmations[token]
      await global.db.write()
      return m.reply('⌛ Konfirmasi freeze sudah kedaluwarsa. Jalankan perintah freeze lagi jika masih ingin melanjutkan.')
    }
    if (action === 'cancel') {
      delete confirmations[token]
      await global.db.write()
      return m.reply('↩️ Permintaan freeze dibatalkan. Status akun tidak berubah.')
    }
    if (!pending.selfRequest && !isOwner) {
      return m.reply('❌ Hanya Owner/Co-owner yang dapat mengonfirmasi freeze akun lain.')
    }

    const pendingTarget = pending.target
    const pendingAccount = users[pending.targetKey] || users[pendingTarget]
    if (!pendingAccount) {
      delete confirmations[token]
      await global.db.write()
      return m.reply('❌ Akun target sudah tidak tersedia. Konfirmasi dibatalkan.')
    }
    const now = Date.now()
    if (getRpgFreezeRecord(pendingAccount)) {
      delete confirmations[token]
      await global.db.write()
      return m.reply(`ℹ️ RPG @${pendingTarget.split('@')[0]} sudah dibekukan.`, null, { mentions: [pendingTarget] })
    }
    if (pending.selfRequest) {
      if (!isPremiumAccount(pendingAccount, now)) {
        delete confirmations[token]
        await global.db.write()
        return m.reply('❌ Freeze mandiri hanya tersedia untuk pengguna Premium. Konfirmasi dibatalkan.')
      }
      const currentWeek = getRpgWibWeekKey(now)
      if (pendingAccount.rpgFreezeSelfUseWeek === currentWeek) {
        delete confirmations[token]
        await global.db.write()
        return m.reply('⏳ Jatah freeze mandiri minggu ini sudah dipakai. Reset setiap Senin pukul 00:00 WIB.')
      }
      pendingAccount.rpgFreezeSelfUseWeek = currentWeek
    }

    pendingAccount.rpgFreeze = { startedAt: now, frozenBy: selfJid }
    delete confirmations[token]
    await global.db.write()
    return m.reply(
      `🧊 Akses RPG @${pendingTarget.split('@')[0]} dibekukan. Progress dan timer RPG dijeda sampai akun dibuka kembali.`,
      null,
      { mentions: [pendingTarget] }
    )
  }

  if (action === 'list' || action === 'daftar') {
    if (!isOwner) return m.reply('❌ Daftar RPG Freeze hanya dapat dilihat Owner/Co-owner.')
    if (args.length !== 1) return m.reply(`Format: *${usedPrefix}rpgfreeze list*`)
    const now = Date.now()
    const frozenAccounts = Object.entries(users)
      .filter(([, user]) => getRpgFreezeRecord(user))
      .map(([jid, user]) => formatFreezeEntry(jid, user, now))
    return m.reply(
      `╭─❏「 🧊 RPG FREEZE 」❏\n` +
      `│ AKUN YANG DIBEKUKAN (${frozenAccounts.length})\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${frozenAccounts.length ? frozenAccounts.join('\n\n') : 'Tidak ada akun RPG yang sedang dibekukan.'}`
    )
  }

  if (!['on', 'off', 'freeze', 'unfreeze'].includes(action)) {
    const freeze = getRpgFreezeRecord(account)
    return m.reply(
      `╭─❏「 🧊 RPG FREEZE 」❏\n` +
      `> Status akunmu: *${freeze ? `DIBEKUKAN · ${formatRpgFreezeDuration(Date.now() - Number(freeze.startedAt))}` : 'AKTIF'}*\n\n` +
      `> ${usedPrefix}rpgfreeze on — freeze mandiri (Premium, 1x/minggu; reset Senin 00:00 WIB)\n` +
      `> ${usedPrefix}rpgfreeze off — buka freeze mandiri yang kamu buat\n` +
      `> ${usedPrefix}rpgfreeze on/off @tag atau reply — Owner/Co-owner mengatur akun lain\n` +
      `> Konfirmasi tombol atau gunakan \`${usedPrefix}rpgfreeze confirm/cancel <kode>\`\n` +
      `> ${usedPrefix}rpgfreeze list — daftar akun beku (Owner/Co-owner)`
    )
  }

  if (targetJid && !isOwner) {
    return m.reply('❌ Hanya Owner/Co-owner yang dapat membekukan atau membuka akun orang lain.')
  }
  if ((args.length > 1 && !targetJid) || (targetJid && args.length > 2)) {
    return m.reply(`❌ Target harus berupa tag atau reply. Contoh: *${usedPrefix}rpgfreeze ${action} @tag*`)
  }
  if (!account) return m.reply('❌ Akun target belum terdaftar di database bot.')

  const now = Date.now()
  const existingFreeze = getRpgFreezeRecord(account)
  const shouldFreeze = action === 'on' || action === 'freeze'
  if (shouldFreeze) {
    if (existingFreeze) {
      return m.reply(
        `ℹ️ RPG @${target.split('@')[0]} sudah dibekukan selama *${formatRpgFreezeDuration(now - Number(existingFreeze.startedAt))}*.`,
        null,
        { mentions: [target] }
      )
    }
    const selfRequest = !targetJid
    if (selfRequest) {
      if (!isPremiumAccount(account, now)) {
        return m.reply('❌ Freeze mandiri khusus pengguna Premium. Akun non-Premium hanya dapat dibekukan oleh Owner/Co-owner.')
      }
      const currentWeek = getRpgWibWeekKey(now)
      if (account.rpgFreezeSelfUseWeek === currentWeek) {
        return m.reply('⏳ Jatah freeze mandiri minggu ini sudah dipakai. Kamu bisa freeze lagi setelah Senin pukul 00:00 WIB.')
      }
    }

    const confirmations = global.db.data.rpgFreezeConfirmations ||
      (global.db.data.rpgFreezeConfirmations = {})
    for (const [token, pending] of Object.entries(confirmations)) {
      if (now - Number(pending.createdAt) > FREEZE_CONFIRMATION_TTL) delete confirmations[token]
    }
    let token
    do {
      token = randomBytes(6).toString('hex')
    } while (confirmations[token])
    confirmations[token] = {
      requestedBy: selfJid,
      target,
      targetKey: users[target] ? target : target === selfJid ? m.sender : target,
      selfRequest,
      createdAt: now
    }
    await global.db.write()
    const confirmationText =
      `╭─❏「 🧊 KONFIRMASI RPG FREEZE 」❏\n` +
      `│ Akun: @${target.split('@')[0]}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `Jika dikonfirmasi:\n` +
      `> ↳ Akun tidak dapat menjalankan command atau interaksi RPG.\n` +
      `> ↳ Uang, EXP, item, dan progres RPG tidak bertambah atau berkurang selama freeze.\n` +
      `> ↳ Cooldown, timer, dan proses RPG terkait dijeda selama freeze.\n` +
      `> ↳ Setelah unfreeze, waktu selama freeze tidak dihitung ke timer RPG.\n` +
      `> ↳ Owner/Co-owner tetap dapat memakai RPG Panel.\n\n` +
      `${selfRequest ? '> Freeze mandiri Premium: 1 kali per minggu, reset Senin 00:00 WIB.\n' : ''}` +
      `> Konfirmasi berlaku 2 menit; kuota terpakai hanya jika kamu mengonfirmasi.\n\n` +
      `Pilih konfirmasi untuk membekukan akun atau batalkan agar statusnya tetap sama.`
    return sendRpgConfirmButtons(conn, m, {
      text: confirmationText,
      fallbackText:
        `${confirmationText}\n\n` +
        `> Konfirmasi: *${usedPrefix}rpgfreeze confirm ${token}*\n` +
        `> Batal: *${usedPrefix}rpgfreeze cancel ${token}*`,
      title: '🧊 KONFIRMASI RPG FREEZE',
      acceptText: '🧊 Bekukan akun',
      acceptCommand: `${usedPrefix}rpgfreeze confirm ${token}`,
      cancelText: '↩️ Batalkan',
      cancelCommand: `${usedPrefix}rpgfreeze cancel ${token}`,
      mentions: [target]
    })
  }

  if (!existingFreeze) {
    return m.reply(`ℹ️ RPG @${target.split('@')[0]} tidak sedang dibekukan.`, null, { mentions: [target] })
  }
  const frozenBy = existingFreeze.frozenBy && conn.decodeJid
    ? conn.decodeJid(existingFreeze.frozenBy)
    : existingFreeze.frozenBy
  if (target === selfJid && !isOwner && frozenBy && frozenBy !== selfJid) {
    return m.reply('❌ Akun ini dibekukan Owner/Co-owner. Hanya Owner/Co-owner yang dapat membuka aksesnya.')
  }

  const elapsed = now - Number(existingFreeze.startedAt)
  pauseRpgTimers(account, Number(existingFreeze.startedAt), now)
  const taxSystem = global.db.data.taxSystem
  const taxpayer = taxSystem?.taxpayers?.[target]
  for (const bill of taxpayer?.bills || []) {
    const dueAt = Number(bill.dueAt)
    const outstanding = getBillAmounts(bill, now, taxSystem.config?.penaltyTiers).total
    const issuedAt = Number(bill.issuedAt) || Number(existingFreeze.startedAt)
    const billElapsed = Math.max(0, now - Math.max(Number(existingFreeze.startedAt), issuedAt))
    if (!bill.waived && BigInt(outstanding) > 0n && Number.isFinite(dueAt) && dueAt > 0) {
      bill.dueAt = dueAt + billElapsed
    }
  }
  for (const room of Object.values(global.db.data.casinoRooms || {})) {
    if (!Object.prototype.hasOwnProperty.call(room.contributions || {}, target)) continue
    if (Number(room.rpgFreezePausedAt) > 0) continue
    const activityKey = Number(room.lastActivityAt) > 0 ? 'lastActivityAt' : 'createdAt'
    const activityAt = Number(room[activityKey])
    if (Number.isFinite(activityAt) && activityAt > 0) {
      room[activityKey] = activityAt + Math.max(0, now - Math.max(activityAt, Number(existingFreeze.startedAt)))
    }
  }
  delete account.rpgFreeze
  await global.db.write()
  return m.reply(
    `✅ Akses RPG @${target.split('@')[0]} sudah aktif kembali.\n` +
    `> ↳ Lama dibekukan: *${formatRpgFreezeDuration(elapsed)}*.`,
    null,
    { mentions: [target] }
  )
}

handler.help = [
  'rpgfreeze on/off [@tag/reply] (freeze mandiri khusus Premium, 1x/minggu)',
  'rpgfreeze confirm/cancel <kode>',
  'rpgfreeze list'
]
handler.tags = ['rpg']
handler.command = /^(rpgfreeze|freezerpg)$/i
export default handler
