/**
 * CSM Events, Erasure & MakimaCall Command Handlers
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  EVENT_LIST, DEVIL_LIST, ERASURE_BACKSTORIES, getContractMeta
} from '../../../lib/rpg-libmyCSM.js'
import { header, resolveJid } from '../lib/utils.js'
import { addExp } from '../lib/combat.js'

export async function handleEvent(ctx) {
  const { m, args } = ctx
  const sub = args[1]?.toLowerCase()

  if (sub && typeof eventHandlers[sub] === 'function') {
    return eventHandlers[sub](ctx)
  }

  let cap = header('EVENT CSM RPG')
  cap += ` Daftar event yang tersedia:\n\n`
  EVENT_LIST.forEach((event, index) => {
    cap += `>  *${index + 1}.* 🎲 *${event.name}*\n`
    cap += `>  Command: ${event.command}\n`
    cap += `>  ${event.description}\n\n`
  })
  cap += `>  Gunakan command pada masing-masing event untuk membaca pilihan dan menjalankan mekaniknya.\n`
  cap += `>  Event aktif: ${EVENT_LIST.length}\n`
  cap += `| ━━━━━━━━━━━`
  return m.reply(cap)
}

export async function handleDevilsBargain(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) {
    return m.reply(
      header("THE DEVIL'S BARGAIN") +
      `Devil misterius menawarkan kekuatan besar selama 30 menit. Terima untuk mendapat Blood dan Damage lebih tinggi, tetapi kontrak akan menagih 10 HP saat berakhir.\n\n` +
      `Gunakan *.csm event devilsbargain terima* atau *.csm event devilsbargain tolak*.\n━━━━━━━━━━━`
    )
  }
  if (sub === 'tolak') {
    const leveled = addExp(csm, 50, m)
    return m.reply(header('KONTRAK DITOLAK') + `Kamu menolak tawaran Devil dan tetap memegang kendali.\n📈 +50 EXP${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  if (sub === 'terima') {
    if (csm.devilBargain?.expiresAt > Date.now()) return m.reply(header('KONTRAK AKTIF') + `Devil masih memberimu kekuatan.\n━━━━━━━━━━━`)
    csm.blood += 10000
    csm.devilBargain = { expiresAt: Date.now() + 1800000, damageMultiplier: 1.25 }
    saveDB(wdb)
    return m.reply(header('KONTRAK DITERIMA') + `🩸 +10.000 Blood\n⚔️ Damage +25% selama 30 menit. Setelah itu, HP akan ditagih oleh kontrak.\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event devilsbargain terima* atau *.csm event devilsbargain tolak*.\n━━━━━━━━━━━`)
}

export async function handleEyesOfControl(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('EYES OF CONTROL') + `Makima sedang mengawasi perkembanganmu. Loyalitas memberi perlindungan dan hadiah, penolakan membuatnya lebih curiga.\n\nGunakan *.csm event eyesofcontrol loyal* atau *.csm event eyesofcontrol tolak*.\n━━━━━━━━━━━`)
  if (sub === 'loyal') {
    csm.makimaAttention = Math.min(100, (csm.makimaAttention || 0) + 15)
    csm.blood += 5000
    const leveled = addExp(csm, 75, m)
    saveDB(wdb)
    return m.reply(header('LOYALITAS DITERIMA') + `Makima memberimu perlindungan sementara.\n🩸 +5.000 Blood\n📈 +75 EXP\n👁️ Perhatian Makima: ${csm.makimaAttention}%${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  if (sub === 'tolak') {
    csm.makimaAttention = Math.min(100, (csm.makimaAttention || 0) + 25)
    const leveled = addExp(csm, 100, m)
    saveDB(wdb)
    return m.reply(header('PENGAWASAN DITOLAK') + `Kamu menolak kendali Makima dan memilih bergerak bebas.\n📈 +100 EXP\n👁️ Kecurigaan Makima: ${csm.makimaAttention}%${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event eyesofcontrol loyal* atau *.csm event eyesofcontrol tolak*.\n━━━━━━━━━━━`)
}

export async function handleBloodFrenzy(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('BLOOD FRENZY') + `Naluri Devil memberimu Blood Gain x2 dan Terror tanpa cooldown selama 30 menit, dengan risiko HP terkuras.\n\nGunakan *.csm event bloodfrenzy ikut* atau *.csm event bloodfrenzy tahan*.\n━━━━━━━━━━━`)
  if (sub === 'tahan') {
    const leveled = addExp(csm, 50, m)
    return m.reply(header('NALURI DITAHAN') + `Kamu menahan haus darah sebelum kehilangan kendali.\n📈 +50 EXP${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  if (sub === 'ikut') {
    csm.bloodFrenzy = { expiresAt: Date.now() + 1800000 }
    saveDB(wdb)
    return m.reply(header('BLOOD FRENZY AKTIF') + `🩸 Blood dari Terror menjadi x2.\n⏱️ Terror tidak memiliki cooldown selama 30 menit.\n⚠️ Setiap Terror memiliki peluang mengurangi 5 HP.\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event bloodfrenzy ikut* atau *.csm event bloodfrenzy tahan*.\n━━━━━━━━━━━`)
}

export async function handleHungerFeast(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header("HUNGER'S FEAST") + `Rasa lapar Fami menggandakan Blood dari Terror dan menghapus cooldown Terror selama 30 menit. Setiap Terror menjaga efek ini tetap hidup.\n\nGunakan *.csm event hungerfeast ikut* atau *.csm event hungerfeast tolak*.\n━━━━━━━━━━━`)
  if (sub === 'tolak') return m.reply(header('HUNGER DITOLAK') + `Kamu menahan rasa lapar dan mempertahankan kendali atas keputusanmu.\n━━━━━━━━━━━`)
  if (sub === 'ikut') {
    csm.hungerFeast = { expiresAt: Date.now() + 1800000 }
    csm.bloodFrenzy = null
    saveDB(wdb)
    return m.reply(header("HUNGER'S FEAST AKTIF") + `🩸 Blood Terror menjadi x2.\n⏱️ Cooldown Terror dihapus selama 30 menit.\n⚠️ Lakukan Terror sebelum efek berakhir agar rasa lapar tidak berbalik menjadi debuff.\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event hungerfeast ikut* atau *.csm event hungerfeast tolak*.\n━━━━━━━━━━━`)
}

export async function handleDeathSentence(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('DEATH SENTENCE') + `Vonis telah dibacakan. Terima untuk damage dan Blood lebih besar tanpa cooldown Terror sementara, atau tolak untuk perlindungan tanpa kekuatan tambahan.\n\nGunakan *.csm event deathsentence accept* atau *.csm event deathsentence reject*.\n━━━━━━━━━━━`)
  if (sub === 'accept') {
    csm.deathSentence = { expiresAt: Date.now() + 1800000, damageMultiplier: 1.35 }
    csm.bloodFrenzy = { expiresAt: Date.now() + 1800000 }
    saveDB(wdb)
    return m.reply(header('VONIS DITERIMA') + `Kamu menerima takdir tanpa menundukkan kepala. Damage meningkat 35%, reward Blood bertambah, dan Terror bebas cooldown selama 30 menit. Setelah vonis berakhir, HP kamu dikurangi 25 sebagai harga kekuatan.\n━━━━━━━━━━━`)
  }
  if (sub === 'reject') return m.reply(header('VONIS DITOLAK') + `Kamu merobek surat vonis itu. Perlindungan sementara menyelimuti tubuhmu, tetapi tidak ada hadiah kekuatan dari Death Devil.\n━━━━━━━━━━━`)
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event deathsentence accept* atau *.csm event deathsentence reject*.\n━━━━━━━━━━━`)
}

export async function handleChildWish(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('A CHILD WISH') + `Seorang anak meminta bantuan kecil di tengah kota yang ketakutan. Bantu untuk mendapat Heal, Blood, dan relationship; tolak berarti kamu menyelamatkan resource-mu sendiri tetapi meninggalkan konsekuensi emosional.\n\nGunakan *.csm event childwish help* atau *.csm event childwish reject*.\n━━━━━━━━━━━`)
  if (sub === 'help') {
    csm.health = Math.min(csm.maxHealth, csm.health + 25)
    csm.blood += 2500
    saveDB(wdb)
    return m.reply(header('PERMINTAAN DIPENUHI') + `Kamu menuntun anak itu melewati gang sampai menemukan keluarganya. Senyumnya kecil, tetapi cukup untuk mengingatkanmu bahwa tidak semua kemenangan harus dibayar dengan darah.\n❤️ +25 HP\n🩸 +2.500 Blood\n━━━━━━━━━━━`)
  }
  if (sub === 'reject') return m.reply(header('PERMINTAAN DITOLAK') + `Kamu terus berjalan dan membiarkan suara kecil itu tertinggal di belakang. Tidak ada reward, hanya langkah yang terasa sedikit lebih berat dari sebelumnya.\n━━━━━━━━━━━`)
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event childwish help* atau *.csm event childwish reject*.\n━━━━━━━━━━━`)
}

export async function handleWeaponization(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('WEAPONIZATION') + `Yoru menawarkan senjata dari pengorbananmu. Ketik *.csm event weaponization sacrifice* untuk menukar 5.000 Blood dengan weapon khusus, atau *.csm event weaponization reject* untuk mundur.\n━━━━━━━━━━━`)
  if (sub === 'reject') return m.reply(header('PENGORBANAN DITOLAK') + `Kamu memilih menyimpan resource dan menolak kekuatan yang meminta harga terlalu besar.\n━━━━━━━━━━━`)
  if (sub === 'sacrifice') {
    if (csm.blood < 5000) return m.reply(header('BLOOD KURANG') + `Butuh 5.000 Blood untuk Weaponization.\n━━━━━━━━━━━`)
    csm.blood -= 5000
    csm.inventory.push({ nama: 'Sacrifice Blade', dur: 120 })
    saveDB(wdb)
    return m.reply(header('WEAPON TERBENTUK') + `Blood yang kamu serahkan memadat menjadi Sacrifice Blade. Kekuatan itu tajam karena sebagian perjalananmu ikut tertanam di dalamnya.\n⚔️ Damage: 80\n🩸 -5.000 Blood\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event weaponization sacrifice* atau *.csm event weaponization reject*.\n━━━━━━━━━━━`)
}

export async function handleDollContract(ctx) {
  const { m, csm, wdb, args } = ctx
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('DOLL CONTRACT') + `Benang Doll Devil menawarkan kontrak paksa. Terima untuk masuk ke jalur Terror dan kehilangan akses aktivitas biasa, atau tolak sebelum benang mengikat tubuhmu.\n\nGunakan *.csm event dollcontract accept* atau *.csm event dollcontract reject*.\n━━━━━━━━━━━`)
  if (sub === 'reject') return m.reply(header('DOLL CONTRACT DITOLAK') + `Kamu memutus benang sebelum menyentuh jantungmu. Untuk sementara, tubuhmu masih bebas.\n━━━━━━━━━━━`)
  if (sub === 'accept') {
    csm.dollContract = true
    csm.contractType = 'doll'
    csm.devilContract = 'Doll Devil'
    csm.isTransform = false
    saveDB(wdb)
    return m.reply(header('DOLL CONTRACT AKTIF') + `Benang asing menembus tubuhmu dan mengubahmu menjadi boneka yang masih sadar. Jalan keluar belum tertutup, tetapi untuk sekarang Terror adalah satu-satunya cara agar kehendakmu tidak hilang.\nGunakan *.csm terror* untuk bertahan.\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event dollcontract accept* atau *.csm event dollcontract reject*.\n━━━━━━━━━━━`)
}

export async function handleErasure(ctx) {
  const { m, csm, wdb, args, usedPrefix } = ctx
  const sub = args[1]?.toLowerCase()

  if (!csm.erasurePending && !['no', 'yes', 'horsemen', 'fiend', 'hybrid', 'confirm', 'cancel'].includes(sub)) {
    return m.reply(
      header('TENTANG ERASURE EFFECT') +
      `🕳️ *Erasure Effect*\n` +
      `> Pochita dapat menghapus bagian tertentu dari eksistensi dan kontrakmu. Event ini muncul secara random saat perjalananmu memasuki kondisi berbahaya.\n\n` +
      `> *Status:*\n` +
      `> Saat ini kamu tidak sedang terkena Erasure Effect.\n` +
      `> Tidak ada data yang akan dihapus.\n\n` +
      `> *Jika terkena Erasure Effect:*\n` +
      `> Jika diterima, Story kembali ke awal, kontrak dan Blood hilang, lalu inventory direset ke Fist. Level, EXP, partner, dan riwayat ending tetap aman.\n\n` +
      `> *Pilihan:*\n` +
      `> ${usedPrefix}csm event erasure yes - Terima Erasure Effect\n` +
      `> ${usedPrefix}csm event erasure no - Pilih perlindungan\n\n` +
      `> *Perlindungan yang tersedia:*\n` +
      `> ${usedPrefix}csm event erasure horsemen 1 - Makima\n` +
      `> ${usedPrefix}csm event erasure horsemen 2 - Yoru\n` +
      `> ${usedPrefix}csm event erasure horsemen 3 - Fami\n` +
      `> ${usedPrefix}csm event erasure horsemen 4 - Nayuta\n` +
      `> ${usedPrefix}csm event erasure horsemen 5 - Death Devil\n` +
      `> ${usedPrefix}csm event erasure fiend\n` +
      `> ${usedPrefix}csm event erasure hybrid\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'no') {
    csm.erasurePending = null
    return m.reply(
      header('PILIH PERLINDUNGAN') +
      ` Pilih salah satu cara menghindari Erasure Effect:\n\n` +
      `> ${usedPrefix}csm event erasure horsemen 1 - Makima\n` +
      `> ${usedPrefix}csm event erasure horsemen 2 - Yoru\n` +
      `> ${usedPrefix}csm event erasure horsemen 3 - Fami\n` +
      `> ${usedPrefix}csm event erasure horsemen 4 - Nayuta\n` +
      `> ${usedPrefix}csm event erasure horsemen 5 - Death Devil\n` +
      `> ${usedPrefix}csm event erasure fiend\n` +
      `> ${usedPrefix}csm event erasure hybrid\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'yes') {
    if (!csm.erasurePending) {
      return m.reply(header('TIDAK ADA ERASURE') + ` Tidak ada Erasure Effect yang sedang menunggu.\n Tidak ada data yang dihapus.\n━━━━━━━━━━━`)
    }

    csm.erasurePending = null
    csm.story = 1
    csm.devilContract = null
    csm.contractType = null
    csm.contractExpire = 0
    csm.isTransform = false
    csm.dollContract = false
    csm.lastStory = 0
    csm.blood = 0
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
    csm.weapon = { nama: 'Fist', dur: 999 }
    saveDB(wdb)

    return m.reply(
      header('ERASURE EFFECT') +
      ` Pochita selesai memakan bagian dirinya sendiri. Story, kontrak, darah, dan inventory kamu terhapus.\n` +
      ` Level, EXP, partner, dan riwayat ending tetap tersimpan.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'horsemen' || sub === 'fiend' || sub === 'hybrid') {
    const horsemenList = ['makima', 'yoru', 'fami', 'nayuta', 'death']
    const horsemenNames = {
      makima: 'Makima',
      yoru: 'Yoru',
      fami: 'Fami',
      nayuta: 'Nayuta',
      death: 'Death Devil'
    }

    const rawChoice = ['fiend', 'hybrid'].includes(sub) ? sub : (args[2] || '').toLowerCase()
    const normalizedChoice = Number.isInteger(Number(rawChoice)) && Number(rawChoice) >= 1 && Number(rawChoice) <= horsemenList.length
      ? horsemenList[Number(rawChoice) - 1]
      : rawChoice
    const choice = normalizedChoice

    if (sub === 'horsemen' && !horsemenList.includes(choice)) {
      return m.reply(
        header('PILIH HORSEMEN') +
        ` Pilih salah satu opsi berikut:\n` +
        ` 1. Makima\n` +
        ` 2. Yoru\n` +
        ` 3. Fami\n` +
        ` 4. Nayuta\n` +
        ` 5. Death Devil\n\n` +
        `Contoh: ${usedPrefix}csm event erasure horsemen 3\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.erasurePending = {
      type: 'protection',
      protection: sub,
      choice,
      time: Date.now()
    }

    return m.reply(
      header('KONFIRMASI PERLINDUNGAN') +
      `Pilihan ini membebaskanmu dari Erasure Effect, tetapi hanya admin yang dapat melepasnya melalui panel.\n\n` +
      `Pilihan aktif: ${horsemenNames[choice] || choice}\n` +
      `📖 ${ERASURE_BACKSTORIES[choice] || '🕳️ Kekuatan ini mengubah caramu bertahan dari Erasure Effect.'}\n\n` +
      `Ketik ${usedPrefix}csm event erasure confirm untuk mengunci pilihan.\n` +
      `Ketik ${usedPrefix}csm event erasure cancel untuk memilih ulang.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'confirm') {
    const pending = csm.erasurePending
    if (!pending || pending.type !== 'protection') {
      return m.reply(header('TIDAK ADA PILIHAN') + `Pilih perlindungan dulu.\n━━━━━━━━━━━`)
    }

    csm.erasureProtection = ['fiend', 'hybrid'].includes(pending.protection)
      ? pending.protection
      : `horsemen:${pending.choice}`
    csm.erasurePending = null

    const horsemenTitle = {
      makima: "Makima's Pawns",
      yoru: 'Property of Yoru',
      fami: "Fami's Livestock",
      nayuta: 'Playmates of Nayuta',
      death: 'Death Devil: Lost Souls'
    }

    if (['fiend', 'hybrid'].includes(csm.erasureProtection)) {
      const pool = DEVIL_LIST.filter(entity =>
        getContractMeta(entity).types.includes(csm.erasureProtection)
      )
      const replacement = pool[Math.floor(Math.random() * pool.length)]
      csm.devilContract = replacement?.nama || null
      csm.contractType = csm.erasureProtection
    } else {
      csm.devilContract = horsemenTitle[pending.choice] || horsemenTitle.makima
      csm.contractType = 'horsemen'
      csm.horsemenName = pending.choice
    }

    csm.dollContract = false
    saveDB(wdb)

    return m.reply(
      header('PERLINDUNGAN TERKUNCI') +
      `Kamu sekarang terlindungi dari Erasure Effect.\n` +
      `⛓️ Mulai sekarang kamu dipanggil: *${csm.devilContract}*.\n` +
      `📖 ${ERASURE_BACKSTORIES[pending.choice] || '🕳️ Kekuatan perlindunganmu telah terikat.'}\n` +
      `Gunakan ${usedPrefix}csm contract untuk kontrak yang sesuai dengan pilihanmu.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'cancel') {
    csm.erasurePending = null
    return m.reply(
      header('PILIH ULANG') +
      `Gunakan ${usedPrefix}csm event erasure horsemen <1-5>, ${usedPrefix}csm event erasure fiend, atau ${usedPrefix}csm event erasure hybrid.\n` +
      `━━━━━━━━━━━`
    )
  }

  return m.reply(header('ERASURE EFFECT') + `Gunakan ${usedPrefix}csm event erasure yes/no atau pilih perlindungan yang tersedia.\n━━━━━━━━━━━`)
}

export async function handleMakimaCall(ctx) {
  const { m, csm, wdb, args, usedPrefix } = ctx
  const sub = args[1]?.toLowerCase()

  if (!sub) {
    return m.reply(
      header('TENTANG MAKIMA CALL') +
      `⛓️ *Sistem perintah acak dari Makima*\n` +
      `> *Cara Kerja:*\n` +
      `> 1. Bisa terpicu sangat jarang ketika kamu melakukan Work, Mission, Explore, Terror, atau Rescue.\n` +
      `> 2. Syarat: Blood kamu minimal 10.000 dan kamu punya waktu 1 jam.\n` +
      `> 3. Makima memanggilmu untuk mengeksekusi target; menerima memberi hadiah jika berhasil, gagal atau menolak mengurangi Blood.\n\n` +
      `> *Command:*\n` +
      `> .csm event makimacall terima - Terima & lanjut ke duel\n` +
      `> .csm event makimacall tolak - Tolak perintah\n\n` +
      `> *Reward jika Berhasil:*\n` +
      `> 🩸 +15.000 Blood\n` +
      `> 📈 +100 EXP\n` +
      `> *Hukuman jika Gagal/Tolak:*\n` +
      `>🩸 -10.000 Blood\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (sub === 'terima') {
    if (csm.pendingDuel !== 'makima_order') {
      return m.reply(header('TIDAK ADA PERINTAH') + `|Tidak ada perintah Makima.\n|━━━━━━━━━━━`)
    }

    const cd = 60 * 60 * 1000 - (Date.now() - csm.pendingDuelTime)
    if (cd <= 0) {
      csm.pendingDuel = null
      csm.pendingDuelTime = null
      csm.blood = Math.max(0, csm.blood - 10000)
      saveDB(wdb)
      return m.reply(header('WAKTU HABIS') + ` Perintah Makima kadaluarsa.\n 🩸 -10.000 Blood sebagai hukuman.\n|━━━━━━━━━━━`)
    }

    const target = m.mentionedJid?.[0]
    if (!target) {
      csm.makimaCallActive = true
      saveDB(wdb)
      return m.reply(
        header('PERINTAH DITERIMA') +
        ` ⛓️ "Baik. Lanjutkan sendiri sesuai perintahku."\n\n` +
        ` Sekarang kamu harus menuntaskan tugas dengan duel ke target lain.\n` +
        ` Gunakan: ${usedPrefix}csm duel @tag\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (target === m.sender) return m.reply(header('TIDAK BISA') + `|Tidak bisa bunuh diri sendiri.\n|━━━━━━━━━━━`)

    const targetJid = resolveJid(target, wdb)
    const targetRPG = wdb.users[targetJid]?.rpg || wdb.users[target]?.rpg
    const tUser = targetRPG?.csm
    if (!tUser) return m.reply(header('TARGET BELUM MAIN') + `|━━━━━━━━━━━`)

    const chance = csm.level >= tUser.level ? 0.7 : 0.3
    const win = Math.random() < chance
    csm.pendingDuel = null
    csm.pendingDuelTime = null

    if (win) {
      csm.blood += 15000
      const leveled = addExp(csm, 100, m)
      saveDB(wdb)
      return m.reply(
        header('MISI BERHASIL') +
        ` ⛓️ "Bagus... anjing yang patuh."\n\n` +
        ` Target telah dieliminasi.\n\n` +
        ` 🩸 +15.000 Blood\n` +
        ` 📈 +100 EXP` +
        (leveled ? `\n|🎉 LEVEL UP! Lv.${csm.level}` : ``) +
        `\n|━━━━━━━━━━━`
      )
    } else {
      csm.blood = Math.max(0, csm.blood - 10000)
      saveDB(wdb)
      return m.reply(
        header('MISI GAGAL') +
        ` ⛓️ "Mengecewakan..."\n\n` +
        ` Kamu gagal membunuh target.\n\n` +
        ` 🩸 -10.000 Blood\n` +
        `|━━━━━━━━━━━`
      )
    }
  }

  if (sub === 'tolak') {
    if (csm.pendingDuel !== 'makima_order') {
      return m.reply(header('TIDAK ADA PERINTAH') + ` Tidak ada perintah Makima yang sedang aktif.\n|━━━━━━━━━━━`)
    }
    if (csm.blood < 10000) {
      return m.reply(header('DARAH KURANG') + ` Butuh 10.000 Blood untuk menolak perintah.\n|━━━━━━━━━━━`)
    }
    csm.blood -= 10000
    csm.pendingDuel = null
    csm.pendingDuelTime = null
    saveDB(wdb)
    return m.reply(header('PERINTAH DITOLAK') + ` ⛓️ "Kecewa aku..."\n\n 🩸 -10.000 Blood\n|━━━━━━━━━━━`)
  }

  return m.reply(
    header('PENGGUNAAN MAKIMACALL') +
    `Event spesial yang muncul secara acak.\n\n` +
    `📞 *CEK EVENT*\n> .csm event makimacall\n\n` +
    `✅ *TERIMA*\n> .csm event makimacall terima\n\n` +
    `❌ *TOLAK*\n> .csm event makimacall tolak\n\n` +
    `|━━━━━━━━━━━`
  )
}

const eventHandlers = {
  devilsbargain: handleDevilsBargain,
  eyesofcontrol: handleEyesOfControl,
  bloodfrenzy: handleBloodFrenzy,
  hungerfeast: handleHungerFeast,
  deathsentence: handleDeathSentence,
  childwish: handleChildWish,
  weaponization: handleWeaponization,
  dollcontract: handleDollContract,
  erasure: handleErasure,
  makimacall: handleMakimaCall
}
