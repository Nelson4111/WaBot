/**
 * CSM Location Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { MAIN_LOCATION_LIST, SIDE_LOCATION_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header, getRateColor } from '../lib/utils.js'

export async function handleLocation(ctx) {
  const { m, args, wdb } = ctx
  let sub = args[1]

  if (sub === 'info') {
    let target = args.slice(2).join(' ').toLowerCase()
    if (!target) return m.reply(header('INFO LOKASI') + `|Gunakan:.csm location info <nama/nomor>\n|━━━━━━━━━━━`)

    let num = parseInt(target) - 1
    let allLoc = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST]
    let loc = !isNaN(num) ? allLoc[num] : allLoc.find(l => l.nama.toLowerCase() === target)

    if (!loc) return m.reply(header('TIDAK DITEMUKAN') + `|Lokasi "${args.slice(2).join(' ')}" tidak ada.\n|━━━━━━━━━━━`)

    let rate = Math.floor((loc.rateDevil || 0) * 100)
    let color = getRateColor(loc.rateDevil || 0)

    let cap = header(`INFO: ${loc.nama.toUpperCase()}`)
    cap += ` Nama Lokasi : ${loc.nama}\n`
    cap += ` ${loc.desc || 'Tidak ada deskripsi'}\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `> Devil Rate: ${color} ${rate}%\n`
    cap += `> Level Minimal: ${loc.level || 1}\n`
    cap += `> Drop: ${(loc.drop || []).join(', ') || '-'}\n`
    cap += `> Karakter: ${(loc.characters || []).join(', ') || '-'}\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `|Kunjungi:.csm visit ${loc.nama}`
    return m.reply(cap)
  }

  let cap = header('DAFTAR LOKASI')

  cap += `|*MAIN LOCATIONS*\n`
  cap += `|━━━━━━━━━━━\n`
  MAIN_LOCATION_LIST.forEach((l, i) => {
    let rate = Math.floor((l.rateDevil || 0) * 100)
    let color = getRateColor(l.rateDevil || 0)
    cap += ` *${i + 1}.* *${l.nama}*\n`
    cap += `> ${l.desc}\n`
    cap += `> Devil Rate: ${color} ${rate}%\n\n`
  })

  cap += `|━━━━━━━━━━━\n`
  cap += `|*SIDE LOCATIONS*\n`
  cap += `|━━━━━━━━━━━\n`
  SIDE_LOCATION_LIST.forEach((l, i) => {
    let nomor = i + 1 + MAIN_LOCATION_LIST.length
    let rate = Math.floor((l.rateDevil || 0) * 100)
    let color = getRateColor(l.rateDevil || 0)
    cap += ` *${nomor}.* *${l.nama}*\n`
    cap += `> ${l.desc}\n`
    cap += `> Devil Rate: ${color} ${rate}%\n\n`
  })

  cap += `|━━━━━━━━━━━\n\n`
  cap += `📌.csm visit <nama/nomor> [Cooldown 5 Menit]\n`
  cap += `📌.csm location info <nama/nomor>\n`
  cap += `|━━━━━━━━━━━`

  saveDB(wdb)
  return m.reply(cap)
}
