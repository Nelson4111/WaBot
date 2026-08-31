/**
 * CSM Gift Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  CHARACTER_LIST, GIFT_REACTIONS_BLOOD, GIFT_REACTIONS_MONEY, SHORT_PARTNER_RESPONSES
} from '../../../lib/rpg-libmyCSM.js'
import { header, resolveJid, checkMakimaTrigger } from '../lib/utils.js'
import { recordPartnerDialog } from '../lib/combat.js'

export async function sendPartnerGiftResponse(ctx, char, jumlahLove, loveNow, tipe, biaya) {
  const { m, csm, wdb, usedPrefix } = ctx
  const reactionList = tipe === 'blood' ? GIFT_REACTIONS_BLOOD : GIFT_REACTIONS_MONEY
  const randomReaction = SHORT_PARTNER_RESPONSES[Math.floor(Math.random() * SHORT_PARTNER_RESPONSES.length)]
  let sudahPartner = csm.partners.find(p => p.name === char.nama)
  const previousLevel = Math.max(1, Math.floor((loveNow - jumlahLove) / Math.max(1, char.needLove)) + 1)
  const currentLevel = Math.max(1, Math.floor(loveNow / Math.max(1, char.needLove)) + 1)

  saveDB(wdb)

  let bayarTxt = tipe === 'blood' ? `${biaya.toLocaleString()} Blood` : `Rp ${biaya.toLocaleString()}`
  const giftResponseText = `${randomReaction}\n${reactionList[Math.floor(Math.random() * reactionList.length)](char, biaya)}`.trim()
  recordPartnerDialog(csm, char.nama, giftResponseText, 'gift', { source: 'gift' })

  let msg = header('GIFT TERKIRIM 💌') +
    ` Kamu memberikan ${bayarTxt} ke ${char.emoji} *${char.nama}*\n` +
    ` Untuk: +${jumlahLove} Poin Kenalan\n\n` +
    ` ${giftResponseText}\n\n` +
    ` 💌 Poin Kenalan: ${Number(loveNow) % Math.max(1, char.needLove)}/${char.needLove}` +
    (currentLevel > previousLevel ? `\n🎉 *${char.nama} LEVEL UP!* Lv.${previousLevel} → Lv.${currentLevel}\n✨ Pengaruh partner meningkat.` : '')

  if (!sudahPartner && loveNow >= char.needLove) {
    msg += `\n\n|🎉 *${char.nama} sekarang mau direkrut!*\n|${usedPrefix}partner recruit ${char.nama}`
  } else if (sudahPartner) {
    msg += `\n\n|*${char.nama} sudah jadi partnermu*`
  }

  await checkMakimaTrigger(m, csm, wdb)
  return m.reply(msg + `\n|━━━━━━━━━━━`)
}

export async function handleGift(ctx) {
  const { m, conn, csm, wdb, userRPG, args } = ctx
  const rawType = String(args[1] || '').toLowerCase()
  const type = rawType === 'bank' || rawType === 'money' ? 'money' : rawType === 'darah' || rawType === 'blood' ? 'darah' : rawType
  const subType = args[2]?.toLowerCase()
  const targetInput = args[3]
  const jumlahLove = parseInt(args[4], 10)

  if (!type) {
    return m.reply(
      header('PENGGUNAAN GIFT') +
      `Kirim hadiah ke Hunter lain atau Partner.\n\n` +
      `|━━━━━━━━━━━\n` +
      `🕵️ *GIFT HUNTER*\n` +
      `Transfer resource ke player lain.\n\n` +
      `> .csm gift money @tag 10000\n` +
      `> .csm gift darah @tag 100\n` +
      `> .csm gift hunter @tag 100\n\n` +
      `|━━━━━━━━━━━\n` +
      `💌 *GIFT PARTNER*\n` +
      `Naikkan Love agar Partner bisa direkrut.\n\n` +
      `> .csm gift partner blood <nomor/nama> <jumlahLove>\n` +
      `> .csm gift partner money <nomor/nama> <jumlahLove>\n\n` +
      `|━━━━━━━━━━━\n` +
      `📌 *CONTOH:*\n` +
      `> .csm gift partner blood 1 10\n` +
      `> .csm gift partner money Reze 10\n\n` +
      `⚖️ *RATE:*\n` +
      `> 1500 Blood = 1 Love\n` +
      `> 1500 Money = 1 Blood\n` +
      `> 2.250.000 Money = 1 Love\n\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (['yes', 'terima', 'no', 'tolak'].includes(type)) {
    if (!csm.pendingGift) return m.reply(header('TIDAK ADA GIFT') + `Tidak ada gift yang menunggu konfirmasi.\n━━━━━━━━━━━`)
    if (['no', 'tolak'].includes(type)) {
      csm.pendingGift = null
      saveDB(wdb)
      return m.reply(header('GIFT DIBATALKAN') + `Tidak ada saldo atau hubungan yang berubah.\n━━━━━━━━━━━`)
    }
    const pending = csm.pendingGift
    csm.pendingGift = null
    if (pending.kind === 'hunter') {
      const targetJid = resolveJid(pending.target, wdb)
      const targetRPG = wdb.users[targetJid]?.rpg || wdb.users[pending.target]?.rpg
      if (!targetRPG) return m.reply(header('TARGET BELUM MAIN') + `Data target sudah tidak tersedia.\n━━━━━━━━━━━`)
      targetRPG.bank = Number(targetRPG.bank) || 0
      targetRPG.csm = targetRPG.csm || { blood: 0 }
      if (pending.type === 'bank') {
        if (userRPG.bank < pending.amount) return m.reply(header('SALDO KURANG') + `Saldo tidak cukup.\n━━━━━━━━━━━`)
        userRPG.bank -= pending.amount
        targetRPG.bank += pending.amount
      } else {
        if (csm.blood < pending.amount) return m.reply(header('DARAH KURANG') + `Blood tidak cukup.\n━━━━━━━━━━━`)
        csm.blood -= pending.amount
        targetRPG.csm.blood = (targetRPG.csm.blood || 0) + pending.amount
      }
      saveDB(wdb)
      return m.reply(header('GIFT TERKIRIM') + `Kamu mengirim ${pending.amount.toLocaleString()} ${pending.type === 'bank' ? 'Money' : 'Blood'} ke ${conn.getName(pending.target)}.\n━━━━━━━━━━━`)
    }
    if (pending.kind === 'partner') {
      const cost = pending.love * 1500 * (pending.type === 'money' ? 1500 : 1)
      if (pending.type === 'blood') {
        if (csm.blood < cost) return m.reply(header('DARAH KURANG') + `Butuh ${cost.toLocaleString()} Blood.\n━━━━━━━━━━━`)
        csm.blood -= cost
      } else {
        if (userRPG.bank < cost) return m.reply(header('SALDO KURANG') + `Butuh Rp ${cost.toLocaleString()}.\n━━━━━━━━━━━`)
        userRPG.bank -= cost
      }
      csm.relations[pending.name] = (csm.relations[pending.name] || 0) + pending.love
      return await sendPartnerGiftResponse(ctx, pending.character, pending.love, csm.relations[pending.name], pending.type, cost)
    }
  }

  // === 1. GIFT KE HUNTER ===
  if (['money', 'darah', 'hunter'].includes(type)) {
    const target = m.mentionedJid?.[0]
    const giftAmount = Number(args[3])
    if (!target || !Number.isFinite(giftAmount) || giftAmount <= 0) {
      return m.reply(
        header('GIFT KE HUNTER') +
        `Kirim Blood atau Money ke Hunter lain.\n\n` +
        `|━━━━━━━━━━━\n` +
        `👤 *GIFT HUNTER*\n\n` +
        `> .csm gift money @tag 10000\n` +
        `> .csm gift darah @tag 100\n\n` +
        `|━━━━━━━━━━━`
      )
    }
    if (target === m.sender) return m.reply(header('TIDAK BISA') + `|Kamu tidak bisa mengirim gift ke diri sendiri.\n|━━━━━━━━━━━`)

    const targetJid = resolveJid(target, wdb)
    const targetRPG = wdb.users[targetJid]?.rpg || wdb.users[target]?.rpg
    if (!targetRPG) return m.reply(header('TARGET BELUM MAIN') + `|━━━━━━━━━━━`)
    if (!targetRPG.csm) targetRPG.csm = JSON.parse(JSON.stringify(csm))
    targetRPG.bank = Number.isFinite(Number(targetRPG.bank)) ? Number(targetRPG.bank) : 0

    if (type === 'money') {
      if (userRPG.bank < giftAmount) return m.reply(header('SALDO KURANG') + `|━━━━━━━━━━━`)
      userRPG.bank -= giftAmount
      targetRPG.bank += giftAmount
      saveDB(wdb)
      return m.reply(header('GIFT TERKIRIM 👤') +
        ` Kamu mengirim ${giftAmount.toLocaleString()} Money ke ${conn.getName(target)}\n` +
        `|━━━━━━━━━━━`)
    }

    if (csm.blood < giftAmount) return m.reply(header('DARAH KURANG') + `|━━━━━━━━━━━`)
    csm.pendingGift = { kind: 'hunter', type: 'darah', target, amount: giftAmount }
    saveDB(wdb)
    return m.reply(header('KONFIRMASI GIFT') + `Kirim ${giftAmount.toLocaleString()} Blood ke ${conn.getName(target)}?\nKetik *.csm gift yes* untuk konfirmasi atau *.csm gift no* untuk batal.\n━━━━━━━━━━━`)
  }

  // === 2. GIFT KE PARTNER ===
  if (type === 'partner') {
    if (!['blood', 'money'].includes(subType)) {
      return m.reply(header('PILIH TIPE') +
        ` 💌 *GIFT KE PARTNER*\n\n` +
        ` .csm gift partner blood <nomor/nama> <jumlahLove>\n` +
        ` .csm gift partner money <nomor/nama> <jumlahLove>\n` +
        `|━━━━━━━━━━━`)
    }

    function cariChar(input) {
      if (!input) return null
      if (isNaN(input)) return CHARACTER_LIST.find(c => c.nama.toLowerCase() === input.toLowerCase())
      const idx = parseInt(input, 10) - 1
      return CHARACTER_LIST[idx] || null
    }

    if (!targetInput) {
      return m.reply(
        header('PENGGUNAAN GIFT PARTNER') +
        `Kirim hadiah untuk meningkatkan hubungan Partner.\n\n` +
        `|━━━━━━━━━━━\n` +
        `💌 *GIFT PARTNER*\n\n` +
        `> .csm gift partner ${subType} <nomor/nama> <jumlahLove>\n\n` +
        `Contoh:\n` +
        `> .csm gift partner blood 1 10\n` +
        `> .csm gift partner money Reze 10\n\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (!jumlahLove || jumlahLove <= 0) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Jumlah Love harus lebih dari 0.\n\n` +
        `|━━━━━━━━━━━\n` +
        `> .csm gift partner ${subType} <nomor/nama> <jumlahLove>\n` +
        `|━━━━━━━━━━━`
      )
    }

    const char = cariChar(targetInput)
    if (!char) return m.reply(header('KARAKTER TIDAK ADA') + `|Cek .csm partner database\n|━━━━━━━━━━━`)

    if (!csm.relations) csm.relations = {}

    csm.pendingGift = {
      kind: 'partner', type: subType, name: char.nama, character: char, love: jumlahLove
    }
    saveDB(wdb)

    const bloodCost = jumlahLove * 1500
    const moneyCost = bloodCost * 1500

    return m.reply(
      header('KONFIRMASI GIFT PARTNER') +
      `${char.emoji} *${char.nama}*\n\n` +
      `💌 Tambah Love: +${jumlahLove}\n` +
      `⚖️ Rate: 1 Love = 1.500 Blood\n` +
      `💰 Setara: Rp 2.250.000 / Love\n\n` +
      `💳 Biaya:\n` +
      `> ${subType === 'blood' ? `${bloodCost.toLocaleString()} Blood` : `Rp ${moneyCost.toLocaleString()}`}\n\n` +
      `Ketik *.csm gift yes* untuk konfirmasi.\n` +
      `Ketik *.csm gift no* untuk batal.\n\n` +
      `|━━━━━━━━━━━`
    )
  }

  return m.reply(header('TIPE SALAH') + `|Tipe: bank, darah, hunter, partner\n|━━━━━━━━━━━`)
}
