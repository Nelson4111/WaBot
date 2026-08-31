/**
 * CSM Daily Raid Boss Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  DEVIL_LIST, WEAPON_LIST, CHARACTER_LIST, RAID_PARTNER_DIALOGS, calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import {
  header, pickRaidDevil, checkMakimaTrigger
} from '../lib/utils.js'
import { recordPartnerDialog, addPartnerExp, partnerReaction } from '../lib/combat.js'

export async function handleRaid(ctx) {
  const { m, conn, csm, wdb, args, usedPrefix, today } = ctx
  const sub = (args[1] || '').toLowerCase()

  if (!wdb.raid || typeof wdb.raid !== 'object') {
    wdb.raid = {
      boss: null,
      players: [],
      date: '',
      history: [],
      currentHP: 0,
      lastAttack: 0
    }
  }

  const raid = wdb.raid
  if (!Array.isArray(raid.players)) raid.players = []
  if (!Array.isArray(raid.history)) raid.history = []
  if (typeof raid.currentHP !== 'number') raid.currentHP = 0

  const now = Date.now()

  if (
    raid.date !== today ||
    !raid.boss ||
    typeof raid.boss !== 'object' ||
    now - raid.lastAttack > 7200000
  ) {
    const selected = pickRaidDevil()
    raid.boss = {
      ...selected,
      story: [
        `${selected.nama} muncul dari balik kabut kota.`,
        `Tekanan dari Devil rank ${selected.rank} membuat tanah bergetar.`,
        `Para Hunter bersiap menghadapi ancaman ini.`
      ]
    }
    raid.currentHP = raid.boss.hp
    raid.date = today
    raid.players = []
    raid.lastAttack = now
    saveDB(wdb)
  }

  if (!csm) {
    return m.reply(
      header('BELUM DAFTAR') +
      `> Daftar terlebih dahulu.\n` +
      `> Gunakan: ${usedPrefix}csm start\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (!csm.nickname) {
    return m.reply(
      header('WAJIB SET NICKNAME') +
      `> Gunakan:\n` +
      `> ${usedPrefix}csm nickname <nama>\n\n` +
      `> Contoh:\n` +
      `> ${usedPrefix}csm nickname Aze Hunter\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (csm.raidCooldown && now < csm.raidCooldown) {
    let sisa = Math.ceil((csm.raidCooldown - now) / 60000)
    return m.reply(
      header('COOLDOWN RAID') +
      `> Kamu masih terluka parah.\n` +
      `> Tunggu ${sisa} menit lagi.\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (csm.lastRaid === today && !['list', 'history'].includes(sub)) {
    return m.reply(
      header('SUDAH RAID') +
      `> Kamu sudah ikut raid hari ini.\n` +
      `> Tunggu reset besok jam 00.00.\n\n` +
      `${raid.boss.emoji} *${raid.boss.nama}*\n` +
      `> ❤️ HP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (!sub) {
    let cap = header(`RAID HARIAN: ${raid.boss.nama}`)
    cap += `${raid.boss.emoji} *${raid.boss.nama}*\n`
    cap += `> ❤️ HP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n`
    cap += `> 👥 Hunter: ${raid.players.length}/10\n`
    cap += `\n|━━━━━━━━━━━\n`
    cap += `📋 *COMMAND RAID*\n`
    cap += `> .csm raid create\n`
    cap += `> .csm raid join\n`
    cap += `> .csm raid leave\n`
    cap += `> .csm raid team\n`
    cap += `> .csm raid start\n`
    cap += `> .csm raid list\n`
    cap += `> .csm raid delete\n`
    cap += `> .csm raid history\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'list') {
    const raidDevils = DEVIL_LIST.filter(devil => devil.tipe === 'Devil')
    let cap = header(`${raidDevils.length} DEVIL RAID`)
    raidDevils.forEach((d, i) => {
      cap += `*${i + 1}.* ${d.emoji} *${d.nama}*\n`
      cap += `> ❤️ HP: ${Number(d.hp).toLocaleString()}\n`
      cap += `> ⭐ Rank: ${d.rank}\n\n`
    })
    cap += `━━━━━━━━━━━\n`
    cap += `Boss dipilih secara acak setiap hari.\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'history') {
    let cap = header('RAID HISTORY 30 HARI')
    if (raid.history.length === 0) {
      cap += `Belum ada riwayat raid.\n`
    }
    raid.history.slice(-10).reverse().forEach((h, i) => {
      cap += `\n*${i + 1}. ${h.date}*\n`
      cap += `> 👹 Boss: ${h.boss}\n`
      cap += `> ${h.result === 'WIN' ? '✅ MENANG' : '❌ KALAH'}\n`
      if (h.players && h.players.length > 0) {
        let names = h.players
          .map(pid => wdb.users[pid]?.rpg?.csm?.nickname || conn.getName(pid))
          .join(', ')
        cap += `> 👥 Hunter: ${names}\n`
      }
    })
    cap += `\n|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'team') {
    let cap = header(`LOBBY RAID: ${raid.boss.nama}`)
    if (raid.players.length === 0) {
      cap += `Belum ada Hunter di lobby.\n`
    } else {
      raid.players.forEach((pid, i) => {
        let nick = wdb.users[pid]?.rpg?.csm?.nickname || conn.getName(pid)
        cap += `*${i + 1}.* ${nick}\n`
        cap += `> ${i === 0 ? '👑 Leader' : '⚔️ Hunter'}\n`
      })
    }
    cap += `\n|━━━━━━━━━━━\n`
    cap += `> 👥 Total: ${raid.players.length}/10 Hunter\n\n`
    cap += `📌 ${usedPrefix}csm raid start\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'create') {
    if (raid.players.length > 0 && raid.players[0] !== m.sender) {
      let nick = wdb.users[raid.players[0]]?.rpg?.csm?.nickname || conn.getName(raid.players[0])
      return m.reply(
        header('ADA LOBBY') +
        `> Leader saat ini:\n` +
        `> 👑 ${nick}\n` +
        `|━━━━━━━━━━━`
      )
    }

    raid.players = [m.sender]
    saveDB(wdb)

    return m.reply(
      header('LOBBY DIBUAT') +
      `${raid.boss.emoji} *${raid.boss.nama}*\n\n` +
      `> ❤️ HP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n` +
      `> 👥 Hunter: 1/10\n\n` +
      `|━━━━━━━━━━━\n` +
      `📌 ${usedPrefix}csm raid join\n` +
      `📌 ${usedPrefix}csm raid team\n` +
      `📌 ${usedPrefix}csm raid start\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (sub === 'join') {
    if (raid.players.length === 0) {
      return m.reply(header('BELUM ADA LOBBY') + `${usedPrefix}csm raid create\n|━━━━━━━━━━━`)
    }

    if (raid.players.includes(m.sender)) {
      return m.reply(header('SUDAH JOIN') + `Kamu sudah berada di lobby.\n|━━━━━━━━━━━`)
    }

    if (raid.players.length >= 10) {
      return m.reply(header('LOBBY PENUH') + `Maksimal 10 Hunter.\n|━━━━━━━━━━━`)
    }

    let msg = header('BERGABUNG')
    if (csm.raidLoseText) {
      const texts = [
        '⚔️ Aku tidak akan menyerah!',
        '🩸 Bangkit lagi!',
        '🔥 Kali ini pasti menang!',
        '⛓️ Darahku masih mendidih!',
        '🗡️ Untuk pembalasan!',
        '🚨 Aku masih bisa bertarung!',
        '💀 Kematian belum memanggilku.',
        '👁️ Aku sudah melihat pola serangannya.',
        '💥 Satu serangan lagi dan dia tumbang.',
        '🏥 Pulih sebentar, lalu kembali ke medan.'
      ]
      msg += `${texts[Math.floor(Math.random() * texts.length)]}\n\n`
      csm.raidLoseText = false
    }

    raid.players.push(m.sender)
    saveDB(wdb)

    msg += `Berhasil bergabung melawan:\n\n`
    msg += `${raid.boss.emoji} *${raid.boss.nama}*\n`
    msg += `❤️ HP: ${Number(raid.currentHP).toLocaleString()} | ⚔️ DMG: ${Number(raid.boss.dmg || 0).toLocaleString()}\n`
    msg += `👥 Hunter: ${raid.players.length}/10\n`
    msg += `|━━━━━━━━━━━`

    return m.reply(msg)
  }

  if (sub === 'leave') {
    const idx = raid.players.indexOf(m.sender)
    if (idx === -1) {
      return m.reply(header('BELUM JOIN') + `Kamu belum berada di lobby.\n|━━━━━━━━━━━`)
    }

    raid.players.splice(idx, 1)
    saveDB(wdb)

    if (raid.players.length === 0) {
      return m.reply(
        header('KELUAR RAID') +
        `Kamu keluar dari raid.\n\n` +
        `👥 Lobby sekarang kosong.\n` +
        `|━━━━━━━━━━━`
      )
    }

    let nick = wdb.users[raid.players[0]]?.rpg?.csm?.nickname || conn.getName(raid.players[0])
    return m.reply(
      header('KELUAR RAID') +
      `Kamu mundur dari perburuan.\n\n` +
      `👑 Leader baru: ${nick}\n` +
      `👥 Hunter tersisa: ${raid.players.length}/10\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (sub === 'delete') {
    if (raid.players.length === 0) {
      return m.reply(header('LOBBY KOSONG') + `Tidak ada lobby yang perlu dihapus.\n|━━━━━━━━━━━`)
    }

    if (raid.players[0] !== m.sender) {
      return m.reply(header('BUKAN LEADER') + `Hanya leader yang bisa membubarkan lobby.\n|━━━━━━━━━━━`)
    }

    raid.players = []
    saveDB(wdb)

    return m.reply(
      header('LOBBY DIBUBARKAN') +
      `Perburuan raid telah dibatalkan.\n\n` +
      `👥 Semua Hunter keluar dari lobby.\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (sub === 'start') {
    if (raid.players.length === 0) {
      return m.reply(header('BELUM ADA LOBBY') + `${usedPrefix}csm raid create\n|━━━━━━━━━━━`)
    }

    if (raid.players[0] !== m.sender) {
      return m.reply(header('BUKAN LEADER') + `Hanya leader yang bisa memulai raid.\n|━━━━━━━━━━━`)
    }

    raid.players = raid.players.filter(pid => wdb.users[pid]?.rpg?.csm)
    if (raid.players.length === 0) {
      saveDB(wdb)
      return m.reply(header('PLAYER TIDAK VALID') + `Tidak ada Hunter aktif di lobby.\n|━━━━━━━━━━━`)
    }

    const boss = raid.boss
    const playerCount = raid.players.length
    let baseWinRate = playerCount === 1 ? 0.40 : playerCount <= 3 ? 0.70 : 0.90

    let msg = header(`PERTEMPURAN: ${boss.nama}`)
    msg += `${boss.emoji} *${boss.nama}*\n`
    msg += `> ❤️ HP: ${Number(raid.currentHP).toLocaleString()} | ⭐ Rank: ${boss.rank}\n`
    msg += `> 👹 Tipe: ${boss.tipe || 'Devil'}\n`
    msg += `> 👥 Hunter: ${playerCount}/10\n\n`

    msg += `📖 *KISAH PERTEMPURAN*\n`
    if (Array.isArray(boss.story)) {
      boss.story.forEach(line => {
        msg += `> ${line}\n`
      })
    }

    msg += `\n> 🩸 Darah berceceran di mana-mana.\n`
    msg += `> ⚔️ Rantai chainsaw meraung.\n`
    msg += `> 💥 Jeritan bercampur ledakan.\n\n`

    const leaderData = csm
    if (leaderData && Array.isArray(leaderData.partners) && leaderData.partners.length > 0) {
      msg += `🤝 *PARTNER TURUN TANGAN*\n`
      leaderData.partners.forEach(p => {
        if (!p || !p.name) return
        const ch = CHARACTER_LIST.find(c => c.nama === p.name)
        const dialog = RAID_PARTNER_DIALOGS[Math.floor(Math.random() * RAID_PARTNER_DIALOGS.length)]
        recordPartnerDialog(csm, p.name, dialog, 'raid', { source: 'raid' })
        msg += `> ${ch?.emoji || '👤'} ${p.name}: "${dialog}"\n`
      })
      msg += `\n`
    }

    let totalDmg = 0, totalDef = 0, totalLuck = 0, totalExp = 0, totalBlood = 0
    let totalCrit = 0, totalCritDmg = 0, totalRegen = 0, totalEva = 0
    let teamRevive = false

    raid.players.forEach(pid => {
      const p = wdb.users[pid]?.rpg?.csm
      if (!p) return
      let b = calcBonus(p)
      totalDmg += b.dmg
      totalDef += b.def
      totalLuck += b.luck
      totalExp += b.expMult - 1
      totalBlood += b.bloodMult - 1
      totalCrit += b.critChance
      totalCritDmg += b.critDmg
      totalRegen += b.regen
      totalEva += b.evasion
      if (b.revive) teamRevive = true
    })

    let winRate = Math.min(0.99, baseWinRate + totalLuck)
    let damage = Math.floor(boss.hp * 0.1 * playerCount) + Math.floor(totalDmg * 200) + Math.floor(Math.random() * 5000)
    if (totalCrit > 30) damage = Math.floor(damage * (1 + totalCritDmg))
    let damageReduction = Math.floor(totalDef * 2)
    const win = Math.random() < winRate

    if (win) {
      raid.currentHP = 0
      msg += `*─── DARAH MUNCRAT DI MANA-MANA ───*\nGIGITAN. IRISAN. LEDAKAN.\n${boss.nama} ROBEK MENJADI POTONGAN.\n\n`
      raid.players.forEach(pid => {
        const pData = wdb.users[pid]?.rpg?.csm
        if (!pData) return
        if (typeof pData.health !== 'number') pData.health = pData.maxHealth || 100
        if (typeof pData.maxHealth !== 'number') pData.maxHealth = 100
        if (!Array.isArray(pData.inventory)) pData.inventory = [{ nama: 'Fist', dur: 999 }]
        if (typeof pData.level !== 'number') pData.level = 1
        if (typeof pData.exp !== 'number') pData.exp = 0
        if (typeof pData.blood !== 'number') pData.blood = 0
        if (typeof pData.devilsKilled !== 'number') pData.devilsKilled = 0

        let hpLoss = Math.max(4, 55 - damageReduction - Math.floor(totalRegen))
        pData.health = Math.max(1, pData.health - hpLoss)
        if (pData.health <= 1 && teamRevive) pData.health = Math.floor(pData.maxHealth * 0.3)

        const activeWeapon = pData.inventory[0]
        if (activeWeapon && activeWeapon.nama !== 'Fist') {
          if (typeof activeWeapon.dur !== 'number') {
            const weaponData = WEAPON_LIST.find(w => w.nama === activeWeapon.nama)
            activeWeapon.dur = weaponData?.dur || 0
          }
          activeWeapon.dur -= Math.max(3, 8 - Math.floor(totalEva / 20))
          if (activeWeapon.dur <= 0) pData.inventory.shift()
        }
        if (pData.inventory.length === 0) pData.inventory.push({ nama: 'Fist', dur: 999 })

        const rewardBlood = (Number(boss.blood || 0) + Math.floor(Number(boss.blood || 0) / 5)) * (1 + totalBlood)
        pData.blood += Math.floor(rewardBlood)
        const expGain = Number(boss.exp || 0) * (1 + totalExp)
        pData.exp += Math.floor(expGain)

        while (pData.exp >= pData.level * 300) {
          pData.exp -= pData.level * 300
          pData.level++
          pData.maxHealth += 10
          pData.health = Math.min(pData.maxHealth, pData.health + 10)
        }
        pData.lastRaid = today
        pData.lastRaidTime = now
        pData.devilsKilled++
        pData.raidCooldown = 0
        addPartnerExp(pData, Math.floor(Math.random() * 3) + 1)
      })
      msg += `🩸 +${Number(boss.blood).toLocaleString()} Darah /Hunter\n📈 +${Number(boss.exp).toLocaleString()} EXP /Hunter\n⚠️ -${Math.max(1, 40 - damageReduction)} HP /Hunter`
      msg += partnerReaction(csm, 'win', false)
      if (totalDmg > 0 || totalDef > 0) msg += `\n✨ Bonus Team: DMG +${totalDmg} | DEF +${totalDef}`
      raid.history.push({ date: today, boss: boss.nama, result: 'WIN', players: [...raid.players] })
      raid.players = []
    } else {
      raid.currentHP = Math.max(0, raid.currentHP - damage)
      raid.lastAttack = now
      msg += `*─── KAMI DIHANCURKAN ───*\n${boss.nama} TERLALU KUAT.\nTUBUH HUNTER BERTERABARAN.\n\n`
      raid.players.forEach(pid => {
        const pData = wdb.users[pid]?.rpg?.csm
        if (!pData) return
        if (typeof pData.health !== 'number') pData.health = pData.maxHealth || 100
        if (!Array.isArray(pData.inventory)) pData.inventory = [{ nama: 'Fist', dur: 999 }]
        let hpLoss = Math.max(6, 78 - damageReduction - Math.floor(totalRegen))
        pData.health = Math.max(1, pData.health - hpLoss)
        if (pData.health <= 1 && teamRevive) pData.health = Math.floor(pData.maxHealth * 0.3)
        let destroyed = 0
        if (Math.random() < 0.5) {
          while (destroyed < 1 && pData.inventory.length > 0) {
            const item = pData.inventory[0]
            if (!item || item.nama === 'Fist') break
            pData.inventory.shift()
            destroyed++
          }
          if (pData.inventory.length === 0) pData.inventory.push({ nama: 'Fist', dur: 999 })
        }
        pData.lastRaid = today
        pData.lastRaidTime = now
        pData.raidCooldown = now + 1200000
        pData.raidLoseText = true
        addPartnerExp(pData, Math.floor(Math.random() * 3) + 1)
      })
      msg += `❤️ -${Math.max(1, 60 - damageReduction)} HP /Hunter\n⚠️ Maksimal 1 Weapon Non-Fist Hancur /Hunter\n🩸 Kita berhasil mengurangi ${damage.toLocaleString()} HP!\n🩸 Boss sisa: ${Number(raid.currentHP).toLocaleString()} HP`
      msg += partnerReaction(csm, 'lose', false)
      if (totalDmg > 0 || totalDef > 0) msg += `\n✨ Bonus Team: DMG +${totalDmg} | DEF +${totalDef}`
      raid.history.push({ date: today, boss: boss.nama, result: 'LOSE', players: [...raid.players] })
      raid.players = []
    }

    if (raid.currentHP <= 0) raid.currentHP = boss.hp
    if (raid.history.length > 30) raid.history = raid.history.slice(-30)
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  return m.reply(
    header('COMMAND RAID TIDAK DIKENAL') +
    `${usedPrefix}csm raid \n` +
    `${usedPrefix}csm raid  create\n` +
    `${usedPrefix}csm raid  join\n` +
    `${usedPrefix}csm raid  team\n` +
    `${usedPrefix}csm raid  leave\n` +
    `${usedPrefix}csm raid  start\n` +
    `${usedPrefix}csm raid  list\n` +
    `${usedPrefix}csm raid  delete\n` +
    `${usedPrefix}csm raid  history\n` +
    `━━━━━━━━━━━`
  )
}
