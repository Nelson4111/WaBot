/**
 * CSM Character Detail Command Handler
 */

import { CHARACTER_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header } from '../lib/utils.js'

export async function handleChar(ctx) {
  const { m, csm, args } = ctx

  if (!csm.relations || typeof csm.relations !== 'object') csm.relations = {}

  const namaChar = args.slice(1).join(' ').trim()

  if (!namaChar) {
    return m.reply(
      header('PENGGUNAAN KARAKTER') +
      `Lihat detail karakter.\n\n` +
      `|━━━━━━━━━━━\n` +
      `👤 *DETAIL KARAKTER*\n` +
      `> .csm char <nama karakter>\n\n` +
      `Contoh:\n` +
      `> .csm char Reze\n` +
      `|━━━━━━━━━━━`
    )
  }

  const char = CHARACTER_LIST.find(c => c.nama.toLowerCase() === namaChar.toLowerCase())

  if (!char) {
    return m.reply(
      header('KARAKTER TIDAK ADA') +
      `Karakter tidak ditemukan.\n\n` +
      `Contoh:\n` +
      `> .csm char Reze\n` +
      `|━━━━━━━━━━━`
    )
  }

  const love = Number(csm.relations[char.nama] || 0)
  const level = Math.max(1, Math.floor(love / Math.max(1, char.needLove)) + 1)

  return m.reply(
    header(char.nama) +
    `${char.emoji} *${char.role}*\n\n` +
    `|━━━━━━━━━━━\n` +
    `🏴 *FAKSI*\n` +
    `> ${char.faction}\n\n` +
    `🧬 *STATUS*\n` +
    `> ${char.status}\n\n` +
    `📍 *LOKASI*\n` +
    `> ${char.lokasi.join(', ')}\n\n` +
    `💌 *HUBUNGAN*\n` +
    `> ${love % Math.max(1, char.needLove)}/${char.needLove} | Lv.${level}\n\n` +
    `🎁 *BONUS*\n` +
    `> ${char.bonus}\n` +
    `|━━━━━━━━━━━`
  )
}
