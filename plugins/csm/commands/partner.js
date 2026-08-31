/**
 * CSM Partner Command Handler (database, recruit, list, team, achievement, gacha)
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  CHARACTER_LIST, ACHIEVEMENT_LIST, PARTNER_PICTURES,
  checkAchievements, calcBonus, calcSetBonus
} from '../../../lib/rpg-libmyCSM.js'
import {
  header, pickNamedPicture, sendCsmReply, checkMakimaTrigger
} from '../lib/utils.js'
import { getPartnerLevel, addExp } from '../lib/combat.js'

export async function handlePartner(ctx) {
  const { m, conn, csm, wdb, args, usedPrefix } = ctx
  const partnerSub = (args[1] || '').toLowerCase()

  if (!partnerSub) {
    const cap = header('CSM PARTNER') +
      `Partner dapat ditemui, didekati, direkrut, dan digunakan dalam tim.\n` +
      `Mereka memberi buff serta membantu saat Story, Explore, Mission, Rescue, dan encounter tertentu.\n\n` +
      `|━━━━━━━━━━━\n\n` +
      `📖 TUTORIAL\n` +
      `> 1. Temui karakter di lokasi.\n` +
      `> 2. Naikkan hubungan sampai syarat terpenuhi.\n` +
      `> 3. *.csm partner recruit <nomor/nama>* untuk merekrut.\n` +
      `> 4. *.csm partner team add <nomor>* untuk aktifkan.\n` +
      `> 5. Maksimal 5 partner aktif.\n\n` +
      `|━━━━━━━━━━━\n\n` +
      `📋 COMMAND\n` +
      `> *.csm partner database*\n` +
      `> *.csm partner list*\n` +
      `> *.csm partner team*\n\n` +
      `|━━━━━━━━━━━`

    const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
    return sendCsmReply(conn, m, wdb, `${cap}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
  }

  if (csm.erasureProtection?.startsWith('horsemen:') && ['recruit', 'team'].includes(partnerSub)) {
    return m.reply(
      header('PARTNER TERKUNCI') +
      `Kamu tidak bisa merekrut atau mengatur tim Partner saat menjadi bagian dari Four Horsemen.\n\n` +
      `|━━━━━━━━━━━\n` +
      `🔒 *FITUR TERBATAS*\n` +
      `> Recruit Partner ❌\n` +
      `> Edit Team Partner ❌\n\n` +
      `Kamu masih bisa berinteraksi dengan karakter menggunakan:\n` +
      `> ${usedPrefix}csm char <nama>\n` +
      `|━━━━━━━━━━━`
    )
  }

  // === GACHA PARTNER ===
  if (partnerSub === 'gacha') {
    const bonus = calcBonus(csm)
    if (bonus.gachaBonus <= 0) {
      return m.reply(
        header('GACHA PARTNER TERKUNCI') +
        `Fitur ini terbuka dari reward ending Love.\n` +
        `|━━━━━━━━━━━`
      )
    }

    const gachaAction = args[2]?.toLowerCase()
    const gachaCost = 15000
    const gachaCooldown = 60 * 60 * 1000

    if (gachaAction === 'no' || gachaAction === 'cancel') {
      csm.partnerGachaPending = null
      saveDB(wdb)
      return m.reply(header('GACHA PARTNER DIBATALKAN') + `Tidak ada Blood yang dipotong.\n|━━━━━━━━━━━`)
    }

    if (gachaAction === 'yes' || gachaAction === 'terima') {
      const pending = csm.partnerGachaPending
      if (!pending) {
        return m.reply(header('TIDAK ADA GACHA') + `Gunakan *.csm partner gacha* terlebih dahulu.\n|━━━━━━━━━━━`)
      }

      if (Date.now() - pending.createdAt > 60000) {
        csm.partnerGachaPending = null
        saveDB(wdb)
        return m.reply(header('GACHA KEDALUWARSA') + `Permintaan gacha sudah habis waktu.\n|━━━━━━━━━━━`)
      }

      if (csm.blood < pending.cost) {
        return m.reply(header('DARAH KURANG') + `Butuh ${pending.cost.toLocaleString()} Blood.\n|━━━━━━━━━━━`)
      }

      const character = CHARACTER_LIST.find(item => item.nama === pending.name)
      if (!character || csm.partners.some(partner => partner.name === character.nama)) {
        csm.partnerGachaPending = null
        saveDB(wdb)
        return m.reply(header('GACHA GAGAL') + `Karakter sudah tidak tersedia.\n|━━━━━━━━━━━`)
      }

      csm.blood -= pending.cost
      csm.partners.push({
        name: character.nama,
        hp: 100,
        status: 'reserve',
        level: 1
      })

      csm.relations[character.nama] = Math.max(
        Number(csm.relations[character.nama] || 0),
        character.needLove
      )

      csm.lastPartnerGacha = Date.now()
      csm.partnerGachaPending = null

      const newAchievements = checkAchievements(csm)
      newAchievements.forEach(achievement => {
        csm.blood += achievement.reward.blood || 0
        addExp(csm, achievement.reward.exp || 0, m)
      })

      saveDB(wdb)

      return m.reply(
        header('GACHA PARTNER BERHASIL') +
        `${character.emoji} *${character.nama}* bergabung!\n\n` +
        `|━━━━━━━━━━━\n` +
        `🩸 Biaya: -${pending.cost.toLocaleString()} Blood\n` +
        `💌 Hubungan: ${character.needLove}/${character.needLove}\n` +
        `👥 Status: CADANGAN\n\n` +
        `💬 *${character.nama}*:\n"Siap."\n|━━━━━━━━━━━`
      )
    }

    if (csm.partnerGachaPending) {
      return m.reply(header('MENUNGGU KONFIRMASI') + `Ketik:\n> *.csm partner gacha yes*\n> *.csm partner gacha no*\n|━━━━━━━━━━━`)
    }

    if (Date.now() - csm.lastPartnerGacha < gachaCooldown) {
      return m.reply(header('COOLDOWN GACHA PARTNER') + `Tunggu ${Math.ceil((gachaCooldown - (Date.now() - csm.lastPartnerGacha)) / 60000)} menit lagi.\n|━━━━━━━━━━━`)
    }

    if (csm.blood < gachaCost) {
      return m.reply(header('DARAH KURANG') + `Butuh ${gachaCost.toLocaleString()} Blood.\n|━━━━━━━━━━━`)
    }

    const available = CHARACTER_LIST.filter(character =>
      !csm.partners.some(partner => partner.name === character.nama)
    )

    if (!available.length) {
      return m.reply(header('SEMUA PARTNER DIMILIKI') + `Tidak ada karakter yang bisa digacha.\n|━━━━━━━━━━━`)
    }

    const character = available[Math.floor(Math.random() * available.length)]
    csm.partnerGachaPending = {
      name: character.nama,
      cost: gachaCost,
      createdAt: Date.now()
    }
    saveDB(wdb)

    return m.reply(
      header('KONFIRMASI GACHA PARTNER') +
      `${character.emoji} Kandidat: *${character.nama}*\n\n` +
      `|━━━━━━━━━━━\n` +
      `🩸 Biaya: ${gachaCost.toLocaleString()} Blood\n` +
      `💌 Hubungan Awal: ${character.needLove}/${character.needLove}\n` +
      `|━━━━━━━━━━━\n\n` +
      `Ketik:\n` +
      `> *.csm partner gacha yes* untuk rekrut\n` +
      `> *.csm partner gacha no* untuk batal\n` +
      `|━━━━━━━━━━━`
    )
  }

  // === PARTNER DATABASE ===
  if (partnerSub === 'database') {
    let cap = header('DATABASE KARAKTER')
    cap += `Daftar karakter yang dapat ditemui, direkrut, atau dijadikan partner.\n\n`

    CHARACTER_LIST.forEach((c, i) => {
      let owned = csm.partners.find(p => p.name === c.nama) ? '✅' : '❌'
      const love = Number(csm.relations?.[c.nama] || 0)
      const level = Math.max(1, Math.floor(love / Math.max(1, c.needLove)) + 1)

      cap += `*${i + 1}.* ${c.emoji} *${c.nama}* ${owned}\n`
      cap += `> 🏴 Faksi: ${c.faction}\n`
      cap += `> 💌 Love: ${love}/${c.needLove} | Lv.${level}\n\n`
    })

    cap += `|━━━━━━━━━━━\n`
    cap += `📌 .csm partner recruit <nomor/nama>\n`
    cap += `📌 .csm partner achievement\n`
    cap += `|━━━━━━━━━━━`

    return m.reply(cap)
  }

  // === PARTNER RECRUIT ===
  if (partnerSub === 'recruit') {
    let input = args.slice(2).join(' ')
    let char = isNaN(input)
      ? CHARACTER_LIST.find(c => c.nama.toLowerCase() === input.toLowerCase())
      : CHARACTER_LIST[parseInt(input) - 1]

    if (!char) {
      return m.reply(header('KARAKTER TIDAK ADA') + `Karakter tidak ditemukan.\n|━━━━━━━━━━━`)
    }

    if (csm.partners.find(p => p.name === char.nama)) {
      return m.reply(header('SUDAH REKRUT') + `${char.nama} sudah ada di daftar partner.\n|━━━━━━━━━━━`)
    }

    let love = csm.relations[char.nama] || 0
    if (love < char.needLove) {
      return m.reply(
        header('DITOLAK') +
        `${char.emoji} *${char.nama}*\n\n` +
        `"Aku belum mengenalmu cukup dekat."\n` +
        `> 💌 Love: ${love}/${char.needLove}\n` +
        `|━━━━━━━━━━━`
      )
    }

    csm.partners.push({
      name: char.nama,
      hp: 100,
      status: 'reserve'
    })

    let newAch = checkAchievements(csm)
    if (newAch.length > 0) {
      newAch.forEach(a => {
        csm.blood += a.reward.blood || 0
        addExp(csm, a.reward.exp || 0, m)
      })
    }

    saveDB(wdb)

    let msg = header('PARTNER BARU') +
      `${char.emoji} *${char.nama}* bergabung!\n\n` +
      `|━━━━━━━━━━━\n` +
      `> ❤️ HP: 100/100\n` +
      `> 👥 Status: CADANGAN\n` +
      `> 🎁 Bonus: ${char.bonus}\n` +
      `|━━━━━━━━━━━`

    if (newAch.length > 0) {
      msg += `\n\n🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => {
        msg += `\n${a.emoji} *${a.nama}*\n`
        msg += `> ${a.desc}\n`
        msg += `> 🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n`
      })
      msg += `|━━━━━━━━━━━`
    }

    await checkMakimaTrigger(m, csm, wdb)
    return m.reply(msg + `\n|━━━━━━━━━━━`)
  }

  // === PARTNER BY NAME ===
  if (!['database', 'recruit', 'list', 'team', 'achievement'].includes(partnerSub)) {
    let nama = args.slice(1).join(' ')
    let char = CHARACTER_LIST.find(c => c.nama.toLowerCase() === nama.toLowerCase())

    if (!char) {
      return m.reply(header('NAMA SALAH') + `Contoh:\n> .csm partner Reze\n|━━━━━━━━━━━`)
    }

    if (csm.partners.find(p => p.name === char.nama)) {
      return m.reply(header('SUDAH PARTNER') + `${char.nama} sudah ada di tim.\n|━━━━━━━━━━━`)
    }

    let love = csm.relations[char.nama] || 0
    if (love < char.needLove) {
      return m.reply(
        header('DITOLAK') +
        `${char.emoji} *${char.nama}*\n\n` +
        `"Aku belum mengenalmu cukup dekat."\n` +
        `> 💌 Love: ${love}/${char.needLove}\n` +
        `|━━━━━━━━━━━`
      )
    }

    csm.partners.push({
      name: char.nama,
      hp: 100,
      status: 'reserve'
    })

    let newAch = checkAchievements(csm)
    if (newAch.length > 0) {
      newAch.forEach(a => {
        csm.blood += a.reward.blood || 0
        addExp(csm, a.reward.exp || 0, m)
      })
    }

    saveDB(wdb)

    let msg = header('PARTNER BARU') +
      `${char.emoji} *${char.nama}*\n\n` +
      `|━━━━━━━━━━━\n` +
      `> 🎭 Role: ${char.role}\n` +
      `> 👥 Status: CADANGAN\n` +
      `> 🎁 Bonus: ${char.bonus}\n` +
      `|━━━━━━━━━━━`

    if (newAch.length > 0) {
      msg += `\n\n🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => {
        msg += `\n${a.emoji} *${a.nama}*\n`
        msg += `> ${a.desc}\n`
        msg += `> 🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n`
      })
      msg += `|━━━━━━━━━━━`
    }

    return m.reply(msg + `\n|━━━━━━━━━━━`)
  }

  // === PARTNER LIST ===
  if (partnerSub === 'list') {
    let cap = header('PARTNER KAMU')
    if (csm.partners.length === 0) {
      cap += `Belum ada partner.\n`
    }

    csm.partners.forEach((p, i) => {
      let ch = CHARACTER_LIST.find(c => c.nama === p.name)
      if (!ch) return
      cap += `*${i + 1}.* ${ch.emoji} *${p.name}*\n`
      cap += `> 📊 Level: ${getPartnerLevel(csm, p)}\n`
      cap += `> ❤️ HP: ${p.hp}/100\n`
      cap += `> 👥 Status: ${p.status === 'active' ? 'IKUT WAR' : 'CADANGAN'}\n\n`
    })

    cap += `|━━━━━━━━━━━\n`
    cap += `> 👥 Slot Koleksi: ${csm.partners.length} Karakter\n\n`
    cap += `📌 .csm partner team add <nomor>\n`
    cap += `📌 .csm partner team remove <nomor>\n`
    cap += `|━━━━━━━━━━━`

    const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
    return sendCsmReply(conn, m, wdb, `${cap}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
  }

  // === PARTNER TEAM ===
  if (partnerSub === 'team') {
    let sub2 = args[2]
    let nomor = parseInt(args[3]) - 1

    if (!sub2) {
      let b = calcBonus(csm)
      let setBonus = calcSetBonus(csm)
      let active = csm.partners.filter(p => p.status === 'active')
      let reserve = csm.partners.filter(p => p.status === 'reserve')

      let msg = header('TIM PARTNER')
      if (active.length === 0) msg += `Partner Aktif: -\n\n`
      else {
        msg += `Partner Aktif [${active.length}/5]:\n`
        active.forEach((p, i) => {
          let ch = CHARACTER_LIST.find(c => c.nama === p.name)
          msg += `> ${i + 1}. ${ch.emoji} *${p.name}* [Lv.${getPartnerLevel(csm, p)}]\n`
          msg += `> Buff: ${ch.bonus}\n`
        })
        msg += `\n`
      }

      if (reserve.length > 0) {
        msg += `Cadangan [${reserve.length}]:\n`
        reserve.forEach((p, i) => {
          let ch = CHARACTER_LIST.find(c => c.nama === p.name)
          msg += `> ${active.length + i + 1}. ${ch.emoji} ${p.name} [Lv.${getPartnerLevel(csm, p)}]\n`
        })
        msg += `\n`
      }

      msg += `|━━━━━━━━━━━\n`
      msg += `*TOTAL BUFF AKTIF:*\n`
      msg += `> ⚔️ DMG: +${b.dmg}\n`
      msg += `> 🛡️ DEF: +${b.def}\n`
      msg += `> 💥 Crit: ${b.critChance}% / +${(b.critDmg * 100).toFixed(0)}%\n`
      msg += `> 💨 Evasion: ${b.evasion}%\n`
      msg += `> 🩹 Regen: +${b.regen} HP\n`
      msg += `> 📈 EXP: x${b.expMult.toFixed(2)}\n`
      msg += `> 🩸 Blood: x${b.bloodMult.toFixed(2)} +${b.stealBlood}\n`

      if (Object.keys(setBonus).length > 0) {
        msg += `\n🔥 *SET BONUS PERMANEN:*\n`
        for (let key in setBonus) {
          msg += `> ${key}: +${setBonus[key]}\n`
        }
      }

      msg += `|━━━━━━━━━━━\n`
      msg += `Gunakan:\n`
      msg += `> .csm partner team add <nomor>\n`
      msg += `> .csm partner team remove <nomor>\n`
      msg += `|━━━━━━━━━━━`

      const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
      return sendCsmReply(conn, m, wdb, `${msg}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
    }

    if (!csm.partners[nomor]) {
      return m.reply(header('NOMOR SALAH') + `Nomor ${args[3]} tidak ada di list.\n|━━━━━━━━━━━`)
    }

    let activeCount = csm.partners.filter(p => p.status === 'active').length

    if (sub2 === 'add') {
      if (csm.partners[nomor].status === 'active') {
        return m.reply(header('UDAH AKTIF') + `${csm.partners[nomor].name} udah di tim.\n|━━━━━━━━━━━`)
      }
      if (activeCount >= 5) {
        return m.reply(header('TIM PENUH') + `Maksimal 5 partner aktif.\n|━━━━━━━━━━━`)
      }
      csm.partners[nomor].status = 'active'
    } else if (sub2 === 'remove') {
      if (csm.partners[nomor].status === 'reserve') {
        return m.reply(header('UDAH CADANGAN') + `${csm.partners[nomor].name} udah di cadangan.\n|━━━━━━━━━━━`)
      }
      csm.partners[nomor].status = 'reserve'
    } else {
      return m.reply(header('PERINTAH SALAH') + `> .csm partner team add <nomor>\n> .csm partner team remove <nomor>\n|━━━━━━━━━━━`)
    }

    let newAch = checkAchievements(csm)
    if (newAch.length > 0) {
      newAch.forEach(a => {
        csm.blood += a.reward.blood || 0
        addExp(csm, a.reward.exp || 0, m)
      })
    }

    saveDB(wdb)

    let ch = CHARACTER_LIST.find(c => c.nama === csm.partners[nomor].name)
    let msg = header('TIM DIUPDATE') +
      `${ch.emoji} *${csm.partners[nomor].name}*\n\n` +
      `> Status: ${csm.partners[nomor].status === 'active' ? 'IKUT WAR' : 'CADANGAN'}\n` +
      `> Bonus: ${ch.bonus}`

    if (newAch.length > 0) {
      msg += `\n\n|━━━━━━━━━━━\n`
      msg += `🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => {
        msg += `\n${a.emoji} *${a.nama}*\n`
        msg += `> ${a.desc}\n`
        msg += `> 🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n`
      })
    }

    return m.reply(msg + `\n|━━━━━━━━━━━`)
  }

  // === PARTNER ACHIEVEMENTS ===
  if (partnerSub === 'achievement') {
    if (!csm.achievements) csm.achievements = []
    let msg = header('ACHIEVEMENT PARTNER')
    let unlocked = ACHIEVEMENT_LIST.filter(a => csm.achievements.includes(a.id))
    let locked = ACHIEVEMENT_LIST.filter(a => !csm.achievements.includes(a.id))

    if (unlocked.length > 0) {
      msg += `🏆 *TERBUKA [${unlocked.length}/${ACHIEVEMENT_LIST.length}]*\n`
      unlocked.forEach(a => {
        msg += `${a.emoji} *${a.nama}*\n> ${a.desc}\n`
      })
      msg += `\n`
    }

    if (locked.length > 0) {
      msg += `🔒 *TERKUNCI*\n`
      locked.forEach(a => {
        msg += `❌ *${a.nama}*\n> ${a.desc}\n`
      })
    }

    return m.reply(msg + `|━━━━━━━━━━━`)
  }
}
