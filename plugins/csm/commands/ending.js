/**
 * CSM Ending Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { STORY_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header } from '../lib/utils.js'

export function resetStoryAfterEnding(csm) {
  csm.resetCount = (csm.resetCount || 0) + 1
  csm.weapon = { nama: 'Fist', dur: 999 }
  csm.inventory = [{ nama: 'Fist', dur: 999 }]
  csm.devilContract = null
  csm.contractType = null
  csm.contractExpire = 0
  csm.contractSide = null
  csm.contractPending = null
  csm.erasureProtection = null
  csm.erasurePending = null
  csm.dollContract = false
  csm.isTransform = false
  csm.blood = 0
  csm.hospital = []
  csm.story = 1
  csm.ending = null
  csm.pendingEnding = null
  csm.location = 'Markas Public Safety'
  csm.encounter = null
  csm.tempMission = null
  csm.pendingDuel = null
  csm.pendingBlood = 0
  csm.partnerGachaPending = null
  csm.lastRevengeHeal = 0
  csm.lastTerror = 0
  csm.terrorStory = []
  csm.lastStory = 0
  csm.lastRest = 0
  csm.lastExplore = 0
  csm.lastMission = 0
  csm.lastVisit = 0
  csm.lastJob = 0
  csm.lastRaid = ''
  csm.health = csm.maxHealth
}

export async function handleEnding(ctx) {
  const { m, csm, wdb, args } = ctx

  if (!Array.isArray(csm.endingReward)) csm.endingReward = []
  if (!Array.isArray(csm.endingHistory)) csm.endingHistory = []
  if (!csm.endingBuffs) csm.endingBuffs = {}

  if (csm.story <= STORY_LIST.length) {
    return m.reply(
      header('BELUM BISA') +
      ` Selesaikan semua story dulu.\n` +
      ` Progress: ${Math.min(csm.story, STORY_LIST.length)}/${STORY_LIST.length}\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (csm.ending) {
    return m.reply(
      header('ENDING SUDAH DIPILIH') +
      `Ending saat ini: *${csm.ending}*\n` +
      `Pilih ending lain untuk memperoleh reward berbeda. Setelah ending dipilih, perjalanan akan di-reset ke Arc 1 secara otomatis.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const pilih = args[1]?.toLowerCase()

  if (pilih === 'terima' || pilih === 'tolak') {
    if (!csm.pendingEnding) {
      return m.reply(
        header('TIDAK ADA PILIHAN') +
        ` Pilih ending terlebih dahulu.\n` +
        ` Contoh: *.csm ending 1*\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (pilih === 'tolak') {
      csm.pendingEnding = null
      saveDB(wdb)
      return m.reply(
        header('ENDING DIBATALKAN') +
        ` Kamu tidak memilih ending apa pun.\n` +
        ` Ketik *.csm ending <1-10>* untuk memilih lagi.\n` +
        `|━━━━━━━━━━━`
      )
    }

    const nomor = csm.pendingEnding.choice
    const endingData = csm.pendingEnding.data

    if (csm.ending) {
      csm.pendingEnding = null
      saveDB(wdb)
      return m.reply(header('ENDING SUDAH AKTIF') + ` Kamu sudah memiliki ending.\n|━━━━━━━━━━━`)
    }

    csm.ending = endingData.name

    if (!csm.endingReward.some(r => r.id === endingData.reward.id)) {
      csm.endingReward.push({
        id: endingData.reward.id,
        name: endingData.reward.name,
        blood: endingData.reward.blood,
        bonus: endingData.reward.bonus,
        effect: endingData.reward.effect,
        obtainedAt: Date.now()
      })
    }

    csm.endingHistory.push({
      ending: endingData.name,
      choice: nomor,
      reward: endingData.reward.name,
      obtainedAt: Date.now()
    })

    csm.endingBuffs[endingData.name] = {
      id: endingData.reward.id,
      name: endingData.reward.name,
      bonus: endingData.reward.bonus,
      effect: endingData.reward.effect,
      active: true
    }

    csm.lastEnding = endingData.name
    resetStoryAfterEnding(csm)
    csm.blood += endingData.reward.blood
    saveDB(wdb)

    return m.reply(
      header(`ENDING: ${endingData.name.toUpperCase()}`) +
      ` ${endingData.story}\n\n` +
      ` Saat pilihan itu menjadi nyata, dunia seolah menahan napas. Kamu tidak menghapus masa lalu; kamu memberinya nama, lalu melangkah melewati pintu baru dengan seluruh pengalaman yang telah dikumpulkan. Di belakangmu, perjalanan lama berubah menjadi legenda. Di depanmu, Arc 1 menunggu untuk ditulis ulang.\n\n` +
      `|━━━━━━━━━━━\n` +
      ` 🏆 Reward: *${endingData.reward.name}*\n` +
      ` 🩸 Blood: +${endingData.reward.blood.toLocaleString()}\n` +
      ` ✨ Bonus: ${endingData.reward.bonus}\n\n` +
      ` Title player tidak berubah.\n` +
      ` Reward ending tersimpan sebagai achievement/reward story.\n` +
      ` Story otomatis di-reset ke Arc 1; partner dan level tetap, sementara Fist menjadi senjata awalmu lagi.\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (!pilih) {
    let cap = header('GERBANG TAKDIR')
    cap += ` Kamu telah mencapai akhir perjalanan.\n Pilih satu takdir.\n\n`
    cap += ` *1.* 🔥 FREEDOM\n> Reward: Chainsaw Freedom\n> Bonus: DMG +30% saat HP <30%\n\n`
    cap += ` *2.* ⛓️ APOCALYPSE\n> Reward: Fear Sovereign\n> Bonus: Summon 1 Devil saat fight\n\n`
    cap += ` *3.* 🏛️ CONTROL\n> Reward: Control Authority\n> Bonus: Gaji +Rp 50k/hari\n\n`
    cap += ` *4.* 🩸 SACRIFICE\n> Reward: Guardian Core\n> Bonus: Revive 1x + Partner DMG +50%\n\n`
    cap += ` *5.* 💕 LOVE\n> Reward: Beloved Heart\n> Bonus: Heal harian +100% + peluang Gacha Partner +100%\n\n`
    cap += ` *6.* 🗡️ REVENGE\n> Reward: Vengeance Core\n> Bonus: DMG +50% permanen, heal hanya lewat Blood\n\n`
    cap += ` *7.* 🕊️ PEACE\n> Reward: Peace Core\n> Bonus: Regen 10 HP/menit, tidak bisa fight\n\n`
    cap += ` *8.* 🍽️ SCARCITY\n> Reward: Scarcity Core\n> Bonus: Blood gain meningkat saat resource rendah\n\n`
    cap += ` *9.* ❔ UNKNOWN\n> Reward: Unknown Core\n> Bonus: Bonus seimbang EXP, Blood, dan defense\n\n`
    cap += ` *10.* ✨ SECRET\n> Reward: Beyond Fate\n> Bonus: Terbuka setelah 9 ending lain selesai\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += ` 📌 Pilih: *.csm ending <1-10>*\n`
    cap += ` 📌 Setelah itu konfirmasi: *.csm ending terima*\n`
    cap += ` 📌 Batalkan: *.csm ending tolak*\n\n`
    cap += ` 📜 Saat ending dikonfirmasi, yang di-reset: Story ke Arc 1, kontrak dan transformasi, Blood, inventory serta senjata, HP partner di hospital, encounter, cooldown aktivitas, dan seluruh status sementara.\n`
    cap += ` ✅ Yang tetap tersimpan: level, EXP, title, partner dan love, achievement, reward/buff ending, ending history, serta jumlah reset.\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  const nomor = parseInt(pilih, 10)
  if (isNaN(nomor) || nomor < 1 || nomor > 10) {
    return m.reply(header('PILIHAN SALAH') + ` 📌 Pilih ending 1 sampai 10.\n 📌 Contoh: *.csm ending 1*\n|━━━━━━━━━━━`)
  }

  const ENDINGS = {
    1: {
      name: 'Freedom',
      story: `*POCHITA*: "Hehe... Denji pinter."\n\nRantai di dadamu patah. Tidak ada lagi perintah.\nTidak ada kontrak. Tidak ada yang mengendalikanmu.\nUntuk pertama kalinya... kau bebas.`,
      reward: { id: 'freedom', name: '🏆 Chainsaw Freedom', blood: 50000, bonus: 'DMG +30% saat HP <30%', effect: { lowHealthDmg: 1.3 } }
    },
    2: {
      name: 'Apocalypse',
      story: `*MAKIMA*: "Anjing yang baik..."\n\nKota terbakar. Para Devil berlutut.\nKau tidak lagi menjadi pemburu.\nKau menjadi sesuatu yang ditakuti.`,
      reward: { id: 'apocalypse', name: '🏆 Fear Sovereign', blood: 75000, bonus: 'Summon 1 Devil saat fight', effect: { summon: 1 } }
    },
    3: {
      name: 'Control',
      story: `*FAMI*: "Keputusan yang bijak..."\n\nDunia menjadi rapi.\nChaos menghilang.\nTetapi kebebasan juga ikut menghilang.`,
      reward: { id: 'control', name: '🏆 Control Authority', blood: 60000, bonus: 'Blood +50.000 per hari kerja', effect: { bloodFlat: 50000 } }
    },
    4: {
      name: 'Sacrifice',
      story: `*AKI*: "Denji jangan..."\n*POWER*: "BODOH! KABUR LAH!"\n\nKau maju sendirian.\nTubuhmu hancur, tetapi mereka tetap hidup.\nPengorbananmu menjadi tameng terakhir.`,
      reward: { id: 'sacrifice', name: '🏆 Guardian Core', blood: 80000, bonus: 'Revive 1x + Partner DMG +50%', effect: { revive: true, partnerDmgMultiplier: 1.5 } }
    },
    5: {
      name: 'Love',
      story: `*???*: "Denji... pulang yuk."\n\nKau meletakkan chainsaw.\nTidak ada lagi pertarungan.\nTidak ada lagi darah.\nHanya rumah kecil dan seseorang yang menunggu.`,
      reward: { id: 'love', name: '🏆 Beloved Heart', blood: 40000, bonus: 'Heal harian +100% + peluang Gacha Partner +100%', effect: { heal: 100, gachaBonus: 1 } }
    },
    6: {
      name: 'Revenge',
      story: `*POCHITA*: "Denji... matamu merah."\n\nRasa sakit menjadi bahan bakar.\nSemua nama yang menyakitimu kau ukir di rantai.\nDan satu per satu akan membayar.`,
      reward: { id: 'revenge', name: '🏆 Vengeance Core', blood: 100000, bonus: 'DMG +50% permanen, heal hanya lewat Blood', effect: { dmgMultiplier: 1.5, noHeal: true } }
    },
    7: {
      name: 'Peace',
      story: `*POCHITA*: "..."\n\nKau mengubur chainsaw di tanah.\nTidak ada lagi pertarungan.\nHanya ladang kecil, matahari, dan angin.\nAkhirnya... kau menemukan kedamaian.`,
      reward: { id: 'peace', name: '🏆 Peace Core', blood: 30000, bonus: 'Regen 10 HP/menit, tidak bisa fight', effect: { regen: 10, noFight: true } }
    },
    8: {
      name: 'Scarcity',
      story: `*FAMI*: "Kekurangan membuat manusia jujur."\n\nKamu memilih jalan yang selalu menghitung apa yang tersisa: setetes Blood, satu peluru, satu janji. Setiap pengorbanan membuatmu lebih kuat, tetapi kota perlahan belajar bahwa rasa cukup adalah kemewahan. Ketika pintu akhir terbuka, tidak ada meja yang penuh dan tidak ada tangan yang kenyang. Kamu menjadi penguasa kelangkaan, dan dunia memasuki masa ketika semua orang terus lapar.`,
      reward: { id: 'scarcity', name: '🏆 Scarcity Core', blood: 90000, bonus: 'Blood gain meningkat saat resource rendah', effect: { bloodMult: 1.5, lowHealthDmg: 1.2 } }
    },
    9: {
      name: 'Unknown',
      story: `*POCHITA*: "Kamu tidak memilih satu jalan pun."\n\nKamu membantu ketika hati memanggil, lalu menghancurkan ketika keadaan memaksa. Kamu menerima kekuatan tanpa pernah sepenuhnya menyerahkan diri pada harganya. Dunia mencari simbol dari perjalananmu, tetapi hanya menemukan jejak yang saling bertabrakan. Kamu tetap hidup, membawa kisah yang tidak punya satu nama untuk menjelaskannya.`,
      reward: { id: 'unknown', name: '🏆 Unknown Core', blood: 70000, bonus: 'Bonus seimbang untuk EXP, Blood, dan pertahanan', effect: { expMult: 1.25, bloodMult: 1.25, def: 25 } }
    },
    10: {
      name: 'Secret',
      story: `*SUARA DARI BALIK PINTU*: "Akhirnya kamu melihat semuanya."\n\nSetelah setiap kebebasan, perang, cinta, kematian, kelaparan, dan kedamaian, kamu menemukan celah di antara pilihan-pilihan itu. Tidak ada Devil yang menunggu untuk menguasaimu dan tidak ada manusia yang berhak menulis akhir untukmu. Kamu memotong benang yang menghubungkan semua takdir, lalu melangkah ke ruang kosong di balik cerita. Dunia tidak mendapatkan pahlawan baru. Dunia mendapatkan seseorang yang memahami kebenaran dan memilih untuk tetap menjadi dirinya sendiri.`,
      reward: { id: 'secret', name: '🏆 Beyond Fate', blood: 250000, bonus: 'All core stats +25 dan Terror bebas cooldown', effect: { dmg: 25, def: 25, expMult: 1.25, bloodMult: 1.25 } }
    }
  }

  const endingEpilogues = {
    Freedom: 'Kamu meninggalkan markas tanpa menoleh. Untuk pertama kalinya, langkahmu bukan perintah siapa pun; bahkan rasa takut pun harus mengejarmu sendiri.',
    Apocalypse: 'Di atas reruntuhan, para penyintas menyebut namamu dengan suara pelan. Kamu tidak lagi mencari tempat aman, karena kamulah alasan kota-kota menutup pintunya.',
    Control: 'Setiap jalan menjadi teratur, setiap suara mendapat tempat, dan setiap orang tersenyum dengan cara yang sama. Hanya kamu yang masih ingat harga dari ketenangan itu.',
    Sacrifice: 'Ketika debu turun, orang-orang yang kamu lindungi menemukan jalan pulang. Tidak ada patung untukmu, tetapi hidup mereka menjadi bukti bahwa pengorbananmu tidak sia-sia.',
    Love: 'Pagi datang tanpa sirene. Di meja kecil itu, seseorang menyisihkan kursi untukmu, dan untuk sesaat masa depan tidak terasa seperti ancaman.',
    Revenge: 'Nama-nama terakhir terbakar di ujung rantai. Saat amarah akhirnya sunyi, kamu sadar bahwa kemenangan terbesar adalah tetap mengetahui siapa dirimu.',
    Peace: 'Musim berganti di ladang kecil itu. Dunia masih berisik jauh di luar sana, tetapi kamu memilih mendengar angin dan membiarkan senjatamu berkarat.',
    Scarcity: 'Pasar menjadi altar baru. Semua orang menukar rasa lapar dengan harapan, dan kamu berdiri di tengahnya sebagai penjaga harga yang tidak pernah turun.',
    Unknown: 'Tidak ada lagu yang ditulis tentangmu. Anehnya, justru itu yang terasa paling jujur: kamu hidup tanpa harus menjadi jawaban bagi siapa pun.',
    Secret: 'Di balik pintu terakhir, kamu menemukan bahwa kebenaran tidak meminta disembah. Ia hanya menunggu seseorang cukup berani untuk melihatnya lalu memilih jalannya sendiri.'
  }
  Object.values(ENDINGS).forEach(ending => { ending.story += `\n\n${endingEpilogues[ending.name]}` })

  const endingData = ENDINGS[nomor]

  if (nomor === 10 && csm.endingReward.length < 9) {
    return m.reply(header('ENDING TERKUNCI') + `Secret Ending hanya terbuka setelah sembilan ending lainnya berhasil dikumpulkan. Progress ending: ${csm.endingReward.length}/9.\n━━━━━━━━━━━`)
  }

  const already = csm.endingReward.some(r => r.id === endingData.reward.id)
  if (already) {
    return m.reply(
      header('ENDING SUDAH DIDAPAT') +
      `|Kamu sudah pernah mendapatkan reward:\n` +
      `|🏆 ${endingData.reward.name}\n\n` +
      `|Pilih ending lain.\n` +
      `|━━━━━━━━━━━`
    )
  }

  csm.pendingEnding = {
    choice: nomor,
    data: endingData,
    createdAt: Date.now()
  }

  saveDB(wdb)

  return m.reply(
    header(`KONFIRMASI ENDING ${nomor}`) +
    ` Kamu memilih: *${endingData.name}*\n\n` +
    ` ${endingData.story}\n\n` +
    ` Di titik ini, perjalananmu tidak benar-benar berhenti. Kamu sedang memilih bagaimana dunia akan membaca semua luka dan keputusanmu setelah bab terakhir ditutup. Begitu pilihan diterima, kisah lama akan dilipat menjadi legenda dan kamu akan kembali ke awal dengan bekasnya masih melekat pada nama serta reward-mu.\n\n` +
    `|━━━━━━━━━━━\n` +
    ` 🏆 Reward: ${endingData.reward.name}\n` +
    ` 🩸 Blood: +${endingData.reward.blood.toLocaleString()}\n` +
    ` ✨ Bonus: ${endingData.reward.bonus}\n\n` +
    ` ⚠️ Pilihan ini akan menjadi ending perjalananmu.\n` +
    ` ⚠️ Reward akan diberikan setelah konfirmasi.\n\n` +
    ` 🔄 Yang di-reset setelah diterima: Story ke Arc 1, kontrak/transformasi, Blood, inventory dan senjata kembali ke Fist, hospital, encounter, serta cooldown aktivitas. Level, EXP, partner, love, achievement, reward/buff ending, dan history tetap tersimpan.\n\n` +
    ` ✅ *.csm ending terima* - Ambil ending ini\n` +
    ` ❌ *.csm ending tolak* - Batalkan pilihan\n` +
    `|━━━━━━━━━━━`
  )
}
