/**
 * CSM Blood Convert Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { header } from '../lib/utils.js'

export async function handleBlood(ctx) {
  const { m, csm, wdb, userRPG, args } = ctx

  if (typeof csm.pendingBlood !== 'number') {
    csm.pendingBlood = 0
  }

  const sub = args[1]?.toLowerCase()

  if (!sub) {
    return m.reply(
      header('BLOOD') +
      `🩸 Blood: ${csm.blood.toLocaleString()}\n` +
      `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
      `\n` +
      `Rate Konversi:\n` +
      `Rp 1.500 = 1 Blood\n` +
      `\n` +
      `📌.csm blood convert <jumlah>\n` +
      `📌.csm blood deal - Konfirmasi\n` +
      `📌.csm blood cancel - Batalkan\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'cancel') {
    if (!csm.pendingBlood || csm.pendingBlood <= 0) {
      return m.reply(
        header('TIDAK ADA KONVERSI') +
        `Tidak ada konversi Blood yang menunggu konfirmasi.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.pendingBlood = 0
    saveDB(wdb)

    return m.reply(
      header('KONVERSI DIBATALKAN') +
      `Permintaan konversi Blood telah dibatalkan.\n` +
      `Bank kamu tidak berubah.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'deal') {
    if (!csm.pendingBlood || csm.pendingBlood <= 0) {
      return m.reply(
        header('TIDAK ADA KONVERSI') +
        `Gunakan:\n` +
        `.csm blood convert <jumlah>\n` +
        `terlebih dahulu.\n` +
        `━━━━━━━━━━━`
      )
    }

    const dapat = csm.pendingBlood
    const harga = dapat * 1500

    if (userRPG.bank < harga) {
      return m.reply(
        header('SALDO KURANG') +
        `Butuh: Rp ${harga.toLocaleString()}\n` +
        `Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
        `Kurang: Rp ${(harga - userRPG.bank).toLocaleString()}\n` +
        `━━━━━━━━━━━`
      )
    }

    userRPG.bank -= harga
    csm.blood += dapat
    csm.pendingBlood = 0
    saveDB(wdb)

    return m.reply(
      header('KONVERSI BERHASIL') +
      `💰 Bank: -Rp ${harga.toLocaleString()}\n` +
      `🩸 Blood: +${dapat.toLocaleString()}\n` +
      `\n` +
      `🩸 Total Blood: ${csm.blood.toLocaleString()}\n` +
      `💰 Sisa Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'convert') {
    const input = args[2]

    if (!input) {
      return m.reply(
        header('PENGGUNAAN BLOOD') +
        `Tukar saldo Bank menjadi Blood untuk kebutuhan Devil Hunter.\n\n` +
        `🩸 *KONVERSI DARAH*\n` +
        `> .csm blood convert <jumlah>\n` +
        `> Contoh: .csm blood convert 15000\n\n` +
        `|━━━━━━━━━━━`
      )
    }

    const money = parseInt(input, 10)

    if (!Number.isFinite(money) || money <= 0) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Masukkan jumlah Rupiah yang valid.\n` +
        `Contoh: .csm blood convert 15000\n` +
        `━━━━━━━━━━━`
      )
    }

    if (money < 1500) {
      return m.reply(
        header('JUMLAH TERLALU KECIL') +
        `Minimal konversi Rp 1.500 = 1 Blood.\n` +
        `━━━━━━━━━━━`
      )
    }

    const dapat = Math.floor(money / 1500)
    const harga = dapat * 1500

    if (dapat <= 0) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Minimal Rp 1.500 = 1 Blood.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (userRPG.bank < harga) {
      return m.reply(
        header('SALDO KURANG') +
        `Butuh: Rp ${harga.toLocaleString()}\n` +
        `Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.pendingBlood = dapat
    saveDB(wdb)

    return m.reply(
      header('KONFIRMASI BLOOD') +
      `💰 Tukar: Rp ${harga.toLocaleString()}\n` +
      `🩸 Dapat: +${dapat.toLocaleString()} Blood\n` +
      `Rate: Rp 1.500 = 1 Blood\n\n` +
      `Bank kamu: Rp ${userRPG.bank.toLocaleString()}\n` +
      `Setelah deal: Rp ${(userRPG.bank - harga).toLocaleString()}\n\n` +
      `Ketik:\n` +
      `.csm blood deal - Konfirmasi\n` +
      `.csm blood cancel - Batalkan\n` +
      `━━━━━━━━━━━`
    )
  }

  return m.reply(
    header('PENGGUNAAN BLOOD') +
    `Kelola Blood dan pertukaran saldo Bank.\n\n` +
    `🩸 *CEK BLOOD*\n` +
    `> .csm blood\n` +
    `> Melihat jumlah Blood dan saldo Bank.\n\n` +
    `💱 *KONVERSI BLOOD*\n` +
    `> .csm blood convert <jumlah>\n` +
    `> Tukar saldo Bank menjadi Blood.\n\n` +
    `✅ *KONFIRMASI*\n` +
    `> .csm blood deal\n` +
    `> Konfirmasi pertukaran Blood.\n\n` +
    `❌ *BATALKAN*\n` +
    `> .csm blood cancel\n` +
    `> Membatalkan pertukaran.\n\n` +
    `|━━━━━━━━━━━`
  )
}
