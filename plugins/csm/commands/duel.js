/**
 * CSM Duel Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { WEAPON_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header, resolveJid } from '../lib/utils.js'
import { addExp } from '../lib/combat.js'

export async function handleDuel(ctx) {
  const { m, csm, wdb, args } = ctx

  const target = m.mentionedJid?.[0]
  if (!target) return m.reply(header('TAG ORANGNYA') + ` Contoh:\n .csm duel @tag 5000\n|━━━━━━━━━━━`)
  if (target === m.sender) return m.reply(header('TIDAK BISA') + ` Kamu tidak bisa duel melawan diri sendiri.\n|━━━━━━━━━━━`)

  const targetJid = resolveJid(target, wdb)
  const targetRPG = wdb.users[targetJid]?.rpg || wdb.users[target]?.rpg
  const tUser = targetRPG?.csm
  if (!tUser) return m.reply(header('TARGET BELUM MAIN') + `|━━━━━━━━━━━`)

  if (!Array.isArray(tUser.inventory) || !tUser.inventory.length) tUser.inventory = [{ nama: 'Fist', dur: 999 }]
  if (!tUser.weapon || !tUser.weapon.nama) tUser.weapon = { nama: 'Fist', dur: 999 }

  const taruhan = Math.max(0, parseInt(args[2], 10) || 0)
  if (taruhan > 0) {
    if (csm.blood < taruhan || tUser.blood < taruhan) {
      return m.reply(header('DARAH KURANG') + ` Kedua pemain harus punya blood yang cukup.\n|━━━━━━━━━━━`)
    }
  }

  const myWeapon = WEAPON_LIST.find(w => w.nama === csm.weapon.nama) || { dmg: 0, nama: csm.weapon.nama || 'Fist' }
  const enemyWeapon = WEAPON_LIST.find(w => w.nama === tUser.weapon.nama) || { dmg: 0, nama: tUser.weapon.nama || 'Fist' }

  const dmg1 = csm.level * 10 + myWeapon.dmg
  const dmg2 = tUser.level * 10 + enemyWeapon.dmg
  const win = dmg1 === dmg2 ? Math.random() < 0.5 : dmg1 > dmg2

  if (taruhan > 0) {
    if (win) {
      csm.blood += taruhan
      tUser.blood -= taruhan
    } else {
      csm.blood -= taruhan
      tUser.blood += taruhan
    }
  }

  let makimaReward = ''
  if (csm.makimaCallActive) {
    csm.makimaCallActive = false
    csm.pendingDuel = null
    csm.pendingDuelTime = null
    if (win) {
      csm.blood += 15000
      const makimaLevelUp = addExp(csm, 100, m)
      makimaReward = `\n⛓️ Reward MakimaCall: +15.000 Blood, +100 EXP`
      if (makimaLevelUp) makimaReward += `\n🎉 LEVEL UP! Lv.${csm.level}`
    } else {
      csm.blood = Math.max(0, csm.blood - 10000)
      makimaReward = `\n⛓️ Penalti MakimaCall: -10.000 Blood`
    }
  }

  saveDB(wdb)

  return m.reply(
    header('HASIL DUEL') +
    ` ${win ? '🏆 KAMU MENANG' : '💀 KAMU KALAH'}\n\n` +
    ` ⚔️ DMG Kamu: ${dmg1}\n` +
    ` ⚔️ DMG Lawan: ${dmg2}\n` +
    (taruhan > 0 ? `|🩸 Taruhan: ${taruhan.toLocaleString()} Blood\n` : ``) +
    `${makimaReward}\n|━━━━━━━━━━━`
  )
}
