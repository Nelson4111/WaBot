import { loadDB, saveDB } from './waifuHelper.js'
import { registerPrisoner } from './prisonHelper.js'
import { ensurePatrolReleaseProtection, getPatrolProtectionRemaining } from './crimeHelper.js'

const DEFAULT_DURATION = 60 * 60 * 1000
const pendingTimers = new Map()

function formatMoney(amount) {
  return Number(amount).toLocaleString('id-ID')
}

function resolveJid(jid) {
  if (!jid) return jid
  if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
  if (jid.endsWith('@s.whatsapp.net')) return jid
  if (/^\d+$/.test(jid)) return `${jid}@s.whatsapp.net`
  return jid
}

function clearPendingFitnahTimer(target) {
  const timer = pendingTimers.get(target)
  if (timer) clearTimeout(timer)
  pendingTimers.delete(target)
}

async function sendFitnahResult(conn, chat, text, mentions) {
  await conn.sendMessage(chat, { text, mentions })
}

export async function resolvePendingFitnah(conn, pending) {
  const target = resolveJid(pending.target)
  const current = global.db?.data?.fitnahPending?.[target]
  if (!current || current.id !== pending.id) return false
  if (Date.now() < Number(current.expiresAt)) {
    schedulePendingFitnah(conn, current)
    return false
  }

  clearPendingFitnahTimer(target)
  delete global.db.data.fitnahPending[target]

  const wdb = loadDB()
  const sender = resolveJid(current.sender)
  const senderRPG = global.db.data.users?.[sender]?.rpg
  const targetRPG = global.db.data.users?.[target]?.rpg
  if (!senderRPG || !targetRPG) {
    wdb.money[sender] = (Number(wdb.money[sender]) || 0) + Number(current.wager)
    await saveDB(wdb)
    await sendFitnahResult(
      conn,
      current.chat,
      `🤥 Fitnah @${target.split('@')[0]} dibatalkan karena data RPG tidak lagi tersedia. Uang fitnah dikembalikan.`,
      [sender, target]
    )
    return true
  }

  ensurePatrolReleaseProtection(senderRPG)
  ensurePatrolReleaseProtection(targetRPG)

  const targetInPrison = Number(targetRPG.penjara) > 0 &&
    Date.now() - Number(targetRPG.penjara) < Number(targetRPG.lamaPenjara)
  if (targetInPrison) {
    wdb.money[sender] = (Number(wdb.money[sender]) || 0) + Number(current.wager)
    await saveDB(wdb)
    await sendFitnahResult(
      conn,
      current.chat,
      `🤥 Fitnah @${target.split('@')[0]} dibatalkan karena target sudah masuk penjara. Uang fitnah dikembalikan.`,
      [sender, target]
    )
    return true
  }

  if (getPatrolProtectionRemaining(targetRPG, 'prison') > 0) {
    wdb.money[sender] = (Number(wdb.money[sender]) || 0) + Number(current.wager)
    await saveDB(wdb)
    await sendFitnahResult(
      conn,
      current.chat,
      `🤥 Fitnah @${target.split('@')[0]} dibatalkan karena perlindungan mantan napi mencegah target masuk penjara. Uang fitnah dikembalikan.`,
      [sender, target]
    )
    return true
  }

  const berhasil = Math.random() < Number(current.successChance)
  if (berhasil) {
    targetRPG.penjara = Date.now()
    targetRPG.lamaPenjara = Number(current.duration)
    targetRPG.tebusan = Number(current.bail)
    targetRPG.kasus = '🤥 Fitnah'
    targetRPG.sel = registerPrisoner(wdb, target)
    targetRPG.gagalCopet = 0
    await saveDB(wdb)

    await sendFitnahResult(
      conn,
      current.chat,
      `╭─❏「 🤥 FITNAH BERHASIL 」❏\n\n${current.successStory}\n\n─━━━━━━━━━━━━━━─\n\n🚔 *HASIL*\n> 👤 Pelaku: @${sender.split('@')[0]}\n> 🎯 Korban: @${target.split('@')[0]}\n> 🔒 Sel: ${targetRPG.sel}\n> ⏰ Durasi: ${Number(current.duration) / 3600000} jam\n> 💸 Pengeluaran: Rp ${formatMoney(current.wager)}\n> 💰 Tebusan: Rp ${formatMoney(current.bail)}\n\n> ⚠️ *Status:* Masuk penjara!\n\n╰─━━━━━━━━━━━━━━─`,
      [sender, target]
    )
    return true
  }

  const fine = Math.floor(Number(current.wager) / 2)
  const currentMoney = Number(wdb.money[sender]) || 0
  const gagalBayar = currentMoney < fine
  if (fine > 0) {
    if (gagalBayar) {
      wdb.money[sender] = 0
      global.db.data.fitnahHukuman = global.db.data.fitnahHukuman || {}
      global.db.data.fitnahHukuman[sender] = Date.now()
    } else {
      wdb.money[sender] = currentMoney - fine
    }
  }

  const masukPenjara = Math.random() < 0.5
  let prisonText = ''
  if (masukPenjara) {
    senderRPG.penjara = Date.now()
    senderRPG.lamaPenjara = DEFAULT_DURATION
    senderRPG.tebusan = fine
    senderRPG.kasus = '🤥 Fitnah Gagal'
    senderRPG.sel = registerPrisoner(wdb, sender)
    senderRPG.gagalCopet = 0
    prisonText = senderRPG.sel
      ? `\n> 🚔 Hukuman: Masuk penjara SEL ${senderRPG.sel} selama 1 jam`
      : '\n> 🛡️ Perlindungan mantan napi mencegah hukuman penjara.'
  } else {
    prisonText = '\n> 🚔 Hukuman penjara: Tidak dikenakan'
  }

  await saveDB(wdb)
  await sendFitnahResult(
    conn,
    current.chat,
    `╭─❏「 🤥 FITNAH GAGAL 」❏\n\n${current.failureStory}\n\n─━━━━━━━━━━━━━━─\n\n💥 *GAGAL*\n> 🎯 Target: @${target.split('@')[0]}\n> 💸 Pengeluaran fitnah: Rp ${formatMoney(current.wager)}\n> 💰 Denda: Rp ${formatMoney(fine)}${gagalBayar ? ' - GAGAL BAYAR; saldo dihabiskan dan cooldown hukuman 30 menit' : ' - LUNAS'}${prisonText}\n\n╰─━━━━━━━━━━━━━━─`,
    [sender, target]
  )
  return true
}

export function schedulePendingFitnah(conn, pending) {
  const target = resolveJid(pending.target)
  const current = global.db?.data?.fitnahPending?.[target]
  if (!current || current.id !== pending.id || pendingTimers.has(target)) return

  const delay = Math.max(0, Number(current.expiresAt) - Date.now())
  const timer = setTimeout(() => {
    pendingTimers.delete(target)
    resolvePendingFitnah(conn, current).catch(error => {
      console.error('[FITNAH PENDING RESOLUTION FAILED]', error)
    })
  }, delay)
  pendingTimers.set(target, timer)
}

export function restorePendingFitnahTimers(conn) {
  const pendingFitnah = global.db?.data?.fitnahPending || {}
  for (const pending of Object.values(pendingFitnah)) {
    if (pending?.target && pending?.id && Number.isFinite(Number(pending.expiresAt))) {
      schedulePendingFitnah(conn, pending)
    }
  }
}

export function cancelPendingFitnahTimer(target) {
  clearPendingFitnahTimer(resolveJid(target))
}
