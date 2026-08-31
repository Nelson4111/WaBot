/**
 * CSM Visit Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, CHARACTER_LIST, DEVIL_LIST, WEAPON_LIST,
  MAKIMA_WIN_DIALOGS, MAKIMA_LOSE_DIALOGS, MAKIMA_HELL_DIALOGS,
  VISIT_PARTNER_DIALOGS, CSM_PICTURES, calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import {
  header, cekCD, ALL_LOCATION_LIST, SAFE_BLOOD_LOCATIONS,
  getLocationPicture, getDropByName, addInventoryDrop,
  sendCsmReply, checkMakimaTrigger
} from '../lib/utils.js'
import {
  getPartnerDamage, getLoveProgress, addExp, damageWeapon,
  injurePartners, partnerReaction, recordPartnerDialog
} from '../lib/combat.js'

export async function handleVisit(ctx) {
  let { m, conn, csm, wdb, userRPG, args, usedPrefix } = ctx
  let action = 'visit'

  if (ctx.action === 'explore' && ['interact', 'fight', 'run', 'ignore'].includes(args[1]) && csm.encounter?.source === 'explore') {
    args = ['visit', args[1], ...args.slice(2)]
  }

  let sub = args[1]
  const requestedLocation = args.slice(1).join(' ').trim()
  const requestedLocationData = /^\d+$/.test(requestedLocation)
    ? ALL_LOCATION_LIST[Number(requestedLocation) - 1]
    : ALL_LOCATION_LIST.find(location => location.nama.toLowerCase() === requestedLocation.toLowerCase())
  const requestedLocationExists = Boolean(requestedLocationData)
  const encounterSource = csm.encounter?.source === 'explore' ? 'explore' : 'visit'
  const knownLocation = ALL_LOCATION_LIST.find(location => location.nama === csm.location)
  if (!knownLocation || (csm.encounter && !['char', 'devil', 'makima_neraka'].includes(csm.encounter.type))) {
    csm.location = knownLocation?.nama || 'Markas Public Safety'
    csm.encounter = null
    saveDB(wdb)
  }
  if (requestedLocationExists && requestedLocationData.nama !== csm.location) {
    if (csm.encounter && encounterSource === 'visit') csm.encounter = null
    csm.lastVisit = 0
    saveDB(wdb)
  }
  const hasVisitEncounter = csm.encounter && encounterSource === 'visit'
  const hasCharacterEncounter = hasVisitEncounter && csm.encounter?.type === 'char' &&
    Array.isArray(csm.encounter.all) && csm.encounter.all.length > 0

  if (hasVisitEncounter && sub === 'stay') {
    return m.reply(header('TETAP DI LOKASI') + `Kamu tetap berada di ${csm.location}. Selesaikan interaksi yang tersedia terlebih dahulu.\n━━━━━━━━━━━`)
  }

  if (sub === 'leave') {
    if (hasVisitEncounter) csm.encounter = null
    csm.location = 'Markas Public Safety'
    csm.lastVisit = 0
    saveDB(wdb)
    return m.reply(header('MENINGGALKAN LOKASI') + `Kamu meninggalkan lokasi dan kembali ke Markas Public Safety. Sekarang kamu bisa mengunjungi lokasi lain.\n━━━━━━━━━━━`)
  }

  if (!requestedLocation) {
    return m.reply(header('PANDUAN VISIT') +
      `Gunakan salah satu format berikut:\n` +
      `📍 *.csm visit <nomor/nama>* - Pindah lokasi\n` +
      `ℹ️ *.csm visit info* - Lihat kondisi lokasi saat ini\n` +
      `🚪 *.csm visit leave* - Bersihkan interaksi dan keluar dari lokasi\n\n` +
      `Lihat nomor lokasi dengan *.csm location*.\n━━━━━━━━━━━`)
  }

  if (sub === 'info') {
    const characters = hasVisitEncounter
      ? (Array.isArray(csm.encounter?.all) ? csm.encounter.all : csm.encounter?.data ? [csm.encounter.data] : [])
      : []
    const characterList = characters.map((character, index) => `${index + 1}. ${character.nama}`).join('\n')
    return m.reply(header('KONDISI LOKASI') +
      `Location :\n📍 ${csm.location}\n\n` +
      `${characters.length ? `Karakter belum diinteraksi:\n${characterList}` : 'Tidak ada interaksi yang tertunda.'}\n` +
      `Gunakan *.csm visit interact <nomor/nama>* atau *.csm visit leave*.\n━━━━━━━━━━━`)
  }

  // .csm visit interact <nama/nomor>
  if (sub === 'interact' && csm.encounter && csm.encounter.type === 'char') {
    const interactCooldown = cekCD(csm, 'lastInteract', 2 * 60 * 1000)
    if (interactCooldown > 0) return m.reply(header('COOLDOWN INTERACT') + `Tunggu ${Math.ceil(interactCooldown / 60000)} menit lagi.\n━━━━━━━━━━━`)

    let targetInput = args.slice(2).join(' ')
    if (!targetInput) return m.reply(header('GAGAL') + `|Gunakan:.csm ${encounterSource} interact <nomor/nama>\n|━━━━━━━━━━━`)

    let charList = csm.encounter.all || [csm.encounter.data]
    let num = parseInt(targetInput) - 1
    let char = !isNaN(num) ? charList[num] : charList.find(c => c.nama.toLowerCase() === targetInput.toLowerCase())

    if (!char) return m.reply(header('GAGAL') + `|Karakter "${targetInput}" tidak ada di sini.\n|━━━━━━━━━━━`)

    if (!csm.relations[char.nama]) csm.relations[char.nama] = 0
    const previousLevel = Math.max(1, Math.floor(Number(csm.relations[char.nama] || 0) / Math.max(1, char.needLove)) + 1)
    csm.relations[char.nama] += Math.floor(Math.random() * 8) + 5
    const updatedLevel = Math.max(1, Math.floor(csm.relations[char.nama] / Math.max(1, char.needLove)) + 1)
    const levelUpMessage = updatedLevel > previousLevel ? `\n🎉 *${char.nama} LEVEL UP!* Lv.${previousLevel} → Lv.${updatedLevel}\n✨ Pengaruh partner meningkat.` : ''
    const interactionStory = `${char.nama} tidak langsung menjawab. Suasana di sekitar kalian melunak ketika ia memperhatikan caramu bertahan sampai sejauh ini. Percakapan itu berlanjut dari hal kecil menuju alasan sebenarnya mengapa ia masih memilih untuk tetap berjalan.`
    csm.lastInteract = Date.now()

    let msg = header(`INTERAKSI DENGAN ${char.nama}`) +
      ` ${interactionStory}\n\n${char.emoji} *${char.nama}* (Lv.${updatedLevel}): "${char.dialog[Math.floor(Math.random() * char.dialog.length)]}"\n` +
      `|━━━━━━━━━━━\n\n` +
      ` 💌 Hubungan: ${getLoveProgress(csm.relations[char.nama], char.needLove)}/${char.needLove} | Lv.${updatedLevel}\n` +
      levelUpMessage +
      `|━━━━━━━━━━━`

    const remainingCharacters = charList.filter(character => character.nama !== char.nama)
    csm.encounter = remainingCharacters.length > 0
      ? { type: 'char', data: remainingCharacters[0], all: remainingCharacters, source: encounterSource }
      : null
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
    if (remainingCharacters.length > 0) {
      msg += `\nMasih ada karakter lain yang bisa diajak interaksi.\n` +
        `Gunakan *.csm ${encounterSource} interact <nomor/nama>* atau *.csm visit stay*.\n` +
        `Untuk pergi: *.csm visit leave*\n`
    }
    msg += `\n━━━━━━━━━━━\n${partnerReaction(csm, 'neutral')}\n━━━━━━━━━━━`
    return sendCsmReply(conn, m, wdb, msg, getLocationPicture({ nama: csm.location }, [char, ...remainingCharacters]))
  }

  // .csm visit ignore
  if (sub === 'ignore' && csm.encounter) {
    let expGain = Math.floor(Math.random() * 15) + 10
    addExp(csm, expGain, m)
    let msg = header('MENGABAIKAN') +
      ` Kamu memilih mengabaikan mereka dan pergi.\n` +
      `|━━━━━━━━━━━\n\n` +
      ` 📈 +${expGain} EXP\n` +
      `|━━━━━━━━━━━`

    csm.encounter = null
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
    return m.reply(msg)
  }

  // .csm visit makima fight
  if (sub === 'makima' && args[2] === 'fight' && csm.encounter?.type === 'makima_neraka') {
    csm.encounter = null
    let b = calcBonus(csm)
    let menang = Math.random() < 0.5 + (b.luck / 2)

    const dialogMenang = MAKIMA_WIN_DIALOGS
    const dialogKalah = MAKIMA_LOSE_DIALOGS

    if (menang) {
      let bonus = Math.floor(csm.blood * 0.5 * b.bloodMult) + 100000 + b.stealBlood
      csm.blood += bonus
      let msg = header('KEMENANGAN MELAWAN MAKIMA') +
        ` ⛓️ *Makima*: "${dialogMenang[Math.floor(Math.random() * dialogMenang.length)]}"\n` +
        `|━━━━━━━━━━━\n\n` +
        ` 🩸 +${bonus.toLocaleString()} Darah [50% + 100.000 JACKPOT]\n` +
        `|━━━━━━━━━━━`
      saveDB(wdb)
      return sendCsmReply(conn, m, wdb, msg, CSM_PICTURES.makimaHell)
    } else {
      let potongan = Math.floor(csm.blood * 0.5)
      csm.blood = Math.max(0, csm.blood - potongan)
      let msg = header('KEKALAHAN MELAWAN MAKIMA') +
        ` ⛓️ *Makima*: "${dialogKalah[Math.floor(Math.random() * dialogKalah.length)]}"\n` +
        `|━━━━━━━━━━━\n\n` +
        ` 🩸 -${potongan.toLocaleString()} Darah [50% HILANG]\n` +
        `|━━━━━━━━━━━`
      saveDB(wdb)
      return m.reply(msg)
    }
  }

  // .csm visit fight
  if (sub === 'fight' && csm.encounter?.type === 'devil') {
    let devil = csm.encounter.data
    let helpers = csm.encounter.helpers || []

    if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) csm.inventory = [{ nama: 'Fist', dur: 999 }]
    let weapon = csm.inventory[0]
    let weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama) || WEAPON_LIST[0] || { dmg: 1 }
    let b = calcBonus(csm)
    let activePartners = csm.partners.filter(p => p.status === 'active')
    let battleEffects = []
    if (b.summon > 0) battleEffects.push(`👹 Devil tambahan berhasil disummon (+${b.summon * 10} DMG).`)
    if (b.army > 0) battleEffects.push(`🎖️ Bantuan Army Buff memperkuat serangan (+${b.army} DMG).`)

    let baseDmg = Math.max(1, Math.floor(Math.random() * 15) + csm.level * 4 + Math.max(1, Number(weaponData.dmg) || 1) + b.dmg)
    let dmg = baseDmg
    if (csm.devilContract === 'Chainsaw Devil' || b.autoTransform) dmg *= 2.5
    dmg += activePartners.reduce((total, partner) => total + getPartnerDamage(csm, partner), 0)
    dmg = Math.max(1, Math.floor(dmg * b.dmgMultiplier))
    dmg += helpers.length * 15
    if (Math.random() * 100 < b.critChance) dmg = Math.floor(dmg * (1.5 + b.critDmg))
    if (Math.random() * 100 < b.instantKill) dmg = devil.hp + 999
    if (b.cc > 0 && Math.random() * 100 < Math.min(75, b.cc)) {
      dmg += Math.floor(devil.hp * 0.2)
      battleEffects.push('⛓️ CC berhasil: lawan tidak bisa bergerak sesaat.')
    }
    if (b.selfDestruct > 0 && Math.random() < Math.min(0.5, b.selfDestruct / 1000)) {
      dmg += devil.hp * 2
      csm.health = 1
      battleEffects.push('💥 Self Destruct aktif: tubuhmu dikorbankan untuk ledakan damage besar.')
    }

    let dmgTaken = Math.floor(devil.hp / 12)
    dmgTaken = Math.max(1, dmgTaken - b.def - b.teamHp)
    if (Math.random() * 100 < b.evasion) dmgTaken = 0
    if (b.ccResist > 0) dmgTaken = Math.max(0, dmgTaken - Math.floor(b.ccResist / 10))
    if (b.teleportChance > 0 && Math.random() * 100 < b.teleportChance) {
      dmgTaken = 0
      const safeLocation = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST].find(location => location.rateDevil < 0.2)
      if (safeLocation) csm.location = safeLocation.nama
      battleEffects.push(`🌀 Teleport aktif: kamu berpindah ke ${csm.location} dan menghindari serangan.`)
    }
    csm.health = Math.max(1, csm.health - dmgTaken)
    const injuredPartners = injurePartners(csm, dmgTaken, devil.hp <= dmg ? 'hurt' : 'lose')
    if (!b.noHeal && (b.regen > 0 || b.heal > 0)) csm.health = Math.min(csm.maxHealth, csm.health + b.regen + b.heal)

    if (devil.hp <= dmg) {
      let rusak = damageWeapon(csm, 1, 0.5)
      if (b.weaponDur > 0) weapon.dur += b.weaponDur
      csm.devilsKilled++
      let bloodGain = Math.floor((devil.blood * 0.7 + 50) * b.bloodMult) + b.stealBlood
      let expGain = Math.floor(devil.exp * 0.7 * b.expMult)
      csm.blood += bloodGain
      let leveled = addExp(csm, expGain, m)
      csm.encounter = null
      saveDB(wdb)
      let msg = header('KEMENANGAN VISIT') +
        ` ${devil.emoji} *${devil.nama}* dikalahkan!\n` +
        `|━━━━━━━━━━━\n` +
        ` 🩸 +${bloodGain.toLocaleString()} Darah\n` +
        ` 📈 +${expGain} EXP`
      if (leveled) msg += `\n|🎉 LEVEL UP! Lv.${csm.level}`
      if (rusak) msg += `\n|⚠️ *${rusak}* PATAH!`
      if (battleEffects.length) msg += `\n${battleEffects.join('\n')}`
      msg += injuredPartners + partnerReaction(csm, 'win')
      await checkMakimaTrigger(m, csm, wdb)
      return m.reply(msg + `\n|━━━━━━━━━━━`)
    }
    csm.encounter = null
    saveDB(wdb)
    return m.reply(header('KEKALAHAN VISIT') + `|Kamu kalah...\n|❤️ -${dmgTaken} HP\n${injuredPartners}${partnerReaction(csm, 'lose')}\n|━━━━━━━━━━━`)
  }

  // .csm visit run
  if (sub === 'run' && csm.encounter) {
    let b = calcBonus(csm)
    let msg = header('MELARIKAN DIRI VISIT') + `|❤️ -5 HP\n`
    if (csm.encounter.type === 'devil') {
      let devil = csm.encounter.data
      if (devil?.runBlood > 0) {
        let runBlood = Math.floor(devil.runBlood * 0.5 * b.bloodMult) + b.stealBlood
        csm.blood += runBlood
        msg += `|Kamu berhasil mencuri ${runBlood.toLocaleString()} Darah dari ${devil.nama}!\n`
      }
    }
    if (b.findItem > 0 && Math.random() < b.findItem) msg += `|🎁 Kamu nemu item pas kabur!\n`
    csm.health = Math.max(1, csm.health - 5)
    csm.encounter = null
    msg += partnerReaction(csm, 'run')
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
    return m.reply(msg + `|━━━━━━━━━━━`)
  }

  // CEK SELESAI ENCOUNTER
  if (hasCharacterEncounter && !['interact', 'ignore', 'fight', 'run', 'makima', 'leave', 'stay'].includes(sub)) {
    return m.reply(header('MASIH ADA KARAKTER') + `|Masih ada karakter yang bisa kamu ajak interaksi di ${csm.location}.\n|Gunakan: *.csm ${encounterSource} interact <nomor/nama>*\n|Tetap di sini: *.csm visit stay*\n|Tinggalkan lokasi: *.csm visit leave*\n|━━━━━━━━━━━`)
  }
  if (cekCD(csm, 'lastVisit', 300000) > 0) {
    return m.reply(header('COOLDOWN') + `Tunggu ${Math.ceil(cekCD(csm, 'lastVisit', 300000) / 60000)} menit\n━━━━━━━━━━━`)
  }

  let input = requestedLocation
  let locIndex = isNaN(input) ? -1 : parseInt(input) - 1
  let loc = isNaN(input)
    ? ALL_LOCATION_LIST.find(l => l.nama.toLowerCase() === input.toLowerCase())
    : ALL_LOCATION_LIST[locIndex]

  if (!loc) return m.reply(header('LOKASI SALAH') + `|Lihat: ${usedPrefix}csm location\n|━━━━━━━━━━━`)
  const requiredLevel = Number(loc.level || 1)
  if (csm.level < requiredLevel) {
    return m.reply(header('LEVEL BELUM CUKUP') + `|Lokasi ini membutuhkan minimal Lv.${requiredLevel}.\n|Level kamu: Lv.${csm.level}\n|━━━━━━━━━━━`)
  }

  csm.location = loc.nama
  csm.lastVisit = Date.now()

  let msg = header(`PERGI KE: ${loc.nama}`) +
    ` ${loc.desc}\n` +
    `|━━━━━━━━━━━\n`
  let expGain = Math.floor(Math.random() * 20) + 10
  let levelUp = addExp(csm, expGain, m)
  if (levelUp) msg += `|🎉 LEVEL UP! Sekarang Lv.${csm.level}\n`

  let rand = Math.random()
  let isSide = SIDE_LOCATION_LIST.some(s => s.nama === loc.nama)
  let spawned = []

  if (rand < 0.10 && loc.drop?.length) {
    const dropName = loc.drop[Math.floor(Math.random() * loc.drop.length)]
    const drop = getDropByName(dropName)
    if (addInventoryDrop(csm, drop)) {
      msg += `🎁 Kamu menemukan *${drop.emoji} ${drop.nama}*!\n`
    }
  } else if (rand < 0.15) {
    const weaponPool = WEAPON_LIST.filter(weapon => ['E', 'D', 'C'].includes(weapon.tier) && weapon.nama !== 'Fist')
    let weap = weaponPool[Math.floor(Math.random() * weaponPool.length)]
    addInventoryDrop(csm, weap)
    msg += `📦 Kamu nemu *${weap.emoji} ${weap.nama}* di tanah!\n`
  } else if (rand < 0.35 && !SAFE_BLOOD_LOCATIONS.has(loc.nama)) {
    let darah, extraMsg = ''
    if (isSide) {
      let tier = Math.random()
      if (tier < 0.2) darah = (Math.floor(Math.random() * 20) + 5) * 100
      else if (tier < 0.8) darah = (Math.floor(Math.random() * 150) + 50) * 100
      else darah = (Math.floor(Math.random() * 800) + 200) * 100
      if (darah >= 20000) {
        let pembantaian = ['🩸 Bau darah masih menyengat.', '🩸 Noda darah ada di mana-mana.', '🩸 Lantai terasa lengket.', '🩸 Sisa-sisa pertempuran tercerai-berai.', '🩸 Aura kematian masih terasa.', '🩸 Dindingnya penuh bekas seretan.', '🩸 Tidak ada yang mau membersihkan tempat ini.', '🩸 Bau besi menempel di udara.', '🩸 Jejak kaki berhenti di tengah ruangan.', '🩸 Bahkan Devil lain tidak berani mendekat.']
        extraMsg = `\n|${pembantaian[Math.floor(Math.random() * pembantaian.length)]}`
      }
    } else {
      darah = (Math.floor(Math.random() * 150) + 50) * 100
    }
    csm.blood += darah
    msg += `🩸 Kamu nemu ${darah.toLocaleString()} Darah tercecer!${extraMsg}\n`
  } else if (rand < 0.75) {
    const horsemenDanger = csm.erasureProtection?.startsWith('horsemen:') ? 0.25 : 0
    const isHellLocation = loc.nama.includes('Neraka') || loc.nama.includes('Hell')
    let devilSpawn = isHellLocation || Math.random() < Math.min(0.98, loc.rateDevil + horsemenDanger)
    let lastSeen = csm.lastSeenChars || {}
    let charList = CHARACTER_LIST.filter(c => c.lokasi?.includes(loc.nama))
    const CORE_CHARS = ['Denji', 'Aki Hayakawa', 'Power', 'Asa Mitaka', 'Nayuta', 'Fami', 'Makima', 'Yoru', 'Kishibe', 'Himeno', 'Kobeni Higashiyama', 'Hirofumi Yoshida', 'Beam', 'Galgali', 'Reze', 'Quanxi', 'Angel Devil', 'Pochita', 'Meowy']

    charList = charList.map(c => {
      let weight = 1
      if (CORE_CHARS.includes(c.nama)) {
        if (loc.nama.includes('Markas') && ['Makima', 'Himeno', 'Kishibe', 'Aki Hayakawa', 'Galgali', 'Kobeni Higashiyama', 'Beam'].includes(c.nama)) weight = 5
        if (loc.nama.includes('Kafe') && c.nama === 'Reze') weight = 6
        if (loc.nama.includes('Kafe') && c.nama === 'Denji') weight = 4
        if (loc.nama.includes('Apartemen Hayakawa') && ['Aki Hayakawa', 'Power', 'Denji', 'Meowy'].includes(c.nama)) weight = 6
        if (loc.nama.includes('SMA') && ['Asa Mitaka', 'Yoshida', 'Denji', 'Yoru'].includes(c.nama)) weight = 5
        if (loc.nama.includes('Gudang') && c.nama === 'Reze') weight = 5
        if ((loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && c.nama === 'Pochita') weight = 10
        if ((loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && c.nama === 'Makima') weight = 7
        if (loc.nama.includes('Kamar Kos Baru Denji') && ['Denji', 'Nayuta'].includes(c.nama)) weight = 7
        if (loc.nama.includes('Gereja Chainsaw Man') && c.nama === 'Fami') weight = 6
        if ((loc.nama.includes('Hotel Quanxi') || loc.nama.includes('Park')) && c.nama === 'Quanxi') weight = 5
        if (loc.nama.includes('Park') && c.nama === 'Angel Devil') weight = 4
        if (loc.nama.includes('Apartemen') && c.nama === 'Meowy') weight = 5
      }
      if (lastSeen[c.nama] && Date.now() - lastSeen[c.nama] < 3600000) weight = 0.1
      return { ...c, weight }
    }).filter(c => c.weight > 0)

    let hasWeight = CORE_CHARS.some(n => charList.some(c => c.nama === n))
    if (hasWeight && charList.length === 0) {
      charList = CHARACTER_LIST.filter(c => c.lokasi?.includes(loc.nama))
      if (charList.length === 0) charList = [CHARACTER_LIST[Math.floor(Math.random() * CHARACTER_LIST.length)]]
    }

    if (charList.length > 0) {
      let spawnCount = devilSpawn ? Math.min(Math.floor(Math.random() * 5) + 1, 5) : Math.min(Math.floor(Math.random() * 10) + 1, 10)
      if (hasWeight && spawnCount < 1) spawnCount = 1
      for (let i = 0; i < spawnCount; i++) {
        let totalWeight = charList.reduce((a, b) => a + b.weight, 0)
        if (totalWeight <= 0) break
        let r = Math.random() * totalWeight
        let pick = charList.find(c => (r -= c.weight) <= 0)
        if (pick) {
          spawned.push(pick)
          charList = charList.filter(c => c.nama !== pick.nama)
        }
      }
      spawned.forEach(c => csm.lastSeenChars[c.nama] = Date.now())
    }

    if (spawned.length > 0 || devilSpawn) {
      msg += `|⚠️ ${devilSpawn ? 'Iblis' : 'Karakter'} muncul:\n`
      spawned.forEach(s => msg += `|- ${s.nama}\n`)
      const makimaEvent = (loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && spawned.some(c => c.nama === 'Makima')
      if (makimaEvent) {
        const dialogMakima = MAKIMA_HELL_DIALOGS
        csm.encounter = { type: 'makima_neraka', source: 'visit' }
        msg += `|━━━━━━━━━━━\n`
        msg += ` ⛓️ *Makima* muncul di hadapanmu...\n`
        msg += ` ⛓️ *Makima*: "${dialogMakima[Math.floor(Math.random() * dialogMakima.length)]}"\n\n`
        msg += `|━━━━━━━━━━━\n`
        msg += ` .csm visit makima fight - Lawan\n`
        saveDB(wdb)
        return sendCsmReply(conn, m, wdb, msg + `|━━━━━━━━━━━`, CSM_PICTURES.makimaHell)
      }
      if (devilSpawn) {
        const devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
        csm.lastSeenDevils[devil.nama] = Date.now()
        csm.encounter = { type: 'devil', data: devil, helpers: spawned, source: 'visit' }
        msg += `|━━━━━━━━━━━\n`
        msg += ` 👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n`
        if (spawned.length > 0) {
          const dialogBantu = VISIT_PARTNER_DIALOGS
          const helper = spawned[Math.floor(Math.random() * spawned.length)]
          const helperDialog = dialogBantu[Math.floor(Math.random() * dialogBantu.length)]
          recordPartnerDialog(csm, helper.nama, helperDialog, 'visit', { source: 'visit' })
          msg += ` ${helper.emoji} *${helper.nama}*: "${helperDialog}"\n`
          msg += ` 👥 ${spawned.length} karakter ikut membantu:\n`
          spawned.forEach((character, index) => {
            msg += ` *${index + 1}.* ${character.emoji} *${character.nama}*\n`
          })
        }
        msg += `|━━━━━━━━━━━\n\n`
        msg += `⚔️ *.csm visit fight*\n`
        msg += `🏃 *.csm visit run*`
      } else {
        csm.encounter = { type: 'char', data: spawned[0], all: spawned, source: 'visit' }
        msg += `|━━━━━━━━━━━\n`
        msg += ` 👥 Ada ${spawned.length} orang di sini:\n`
        spawned.forEach((character, index) => {
          const love = csm.relations[character.nama] || 0
          const level = Math.max(1, Math.floor(love / Math.max(1, character.needLove)) + 1)
          msg += ` *${index + 1}.* ${character.emoji} *${character.nama}* - ${character.role} | Lv.${level}\n`
          msg += `  "${character.dialog[Math.floor(Math.random() * character.dialog.length)]}"\n`
          msg += `  💌 ${getLoveProgress(love, character.needLove)}/${character.needLove} | Level ${level}\n\n`
        })
        msg += `|━━━━━━━━━━━\n\n`
        msg += `💬 *.csm visit interact <nomor/nama>*\n`
        msg += `🚶 *.csm visit ignore*`
      }
    } else {
      msg += `|Sepertinya tidak ada apa-apa disini...\n`
    }
  } else {
    msg += `|Tempat ini tenang. Tidak ada yg terjadi.\n`
  }

  msg += `|━━━━━━━━━━━\n\n` +
    `📈 +${expGain} EXP\n` +
    `|━━━━━━━━━━━\n`

  saveDB(wdb)
  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(conn, m, wdb, msg, getLocationPicture(loc, spawned))
}
