/**
 * CSM About, Command List, and Interactive Tutorial Handlers
 */

import {
  MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, MAIN_JOB_LIST, SIDE_JOB_LIST,
  TITLE_LIST, BUFF_LIST, COMMAND_SECTIONS, STORY_LIST, QUEST_LIST,
  PARTNER_REACTIONS, CSM_CONTENT_TOTALS, TERROR_SUCCESS_STORIES, TERROR_DEATH_STORIES,
  EVENT_LIST, CHARACTER_LIST, DEVIL_LIST, WEAPON_LIST, ITEM_LIST, BOSS_LIST, ACHIEVEMENT_LIST,
  CSM_PICTURES
} from '../../../lib/rpg-libmyCSM.js'
import { header, getCommandCount, sendCsmReply } from '../lib/utils.js'

export async function handleAbout(ctx) {
  const { m, conn, wdb } = ctx
  const totalLocations = MAIN_LOCATION_LIST.length + SIDE_LOCATION_LIST.length
  const totalJobs = MAIN_JOB_LIST.length + SIDE_JOB_LIST.length
  const totalTitles = TITLE_LIST.length + 1
  const totalBuffs = BUFF_LIST.length
  const totalFeatures = COMMAND_SECTIONS.length

  const aboutSettings = wdb.csmAbout && typeof wdb.csmAbout === 'object' ? wdb.csmAbout : {}
  const developerValue = String(aboutSettings.developer || 'Eza').replace(/^@/, '')
  const developerNumber = developerValue === '6282228638623' ? 'Eza' : developerValue
  const supportedBy = aboutSettings.supported || 'Nelson'
  let cap = header('📜 TENTANG CSM RPG') + '\n\n'

  cap += `Chainsaw Man RPG adalah game teks RPG berbasis WhatsApp dengan tema Chainsaw Man karya Tatsuki Fujimoto.\n`
  cap += `Kamu berperan sebagai Devil Hunter untuk berburu iblis, membuat kontrak, mengumpulkan partner, dan bertahan hidup di dunia penuh kekacauan.\n`

  cap += `|━━━━━━━━━━━\n\n`

  cap += `⚡ FITUR UTAMA\n`
  cap += `> 🗺️ Eksplorasi lokasi untuk mencari darah, item, dan encounter random\n`
  cap += `> 📋 Mission & Rescue untuk farming EXP dan Darah\n`
  cap += `> 👥 Rekrut karakter canon seperti Denji, Aki, Power, Makima, Reze, dll\n`
  cap += `> 🛡️ Maksimal 5 partner aktif dengan berbagai buff\n`
  cap += `> 🎁 Gift untuk meningkatkan hubungan partner\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `⛓️ SISTEM KONTRAK\n`
  cap += `> 🎰 Gacha Host, Fiend, Hybrid, dan Devil\n`
  cap += `> ⏰ Trial 2 hari atau Deal permanen\n`
  cap += `> 🔒 Erasure Protection untuk perlindungan kontrak\n`
  cap += `> 🩸 Darah sebagai mata uang utama\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `📖 STORY & PROGRESS\n`
  cap += `> 📚 ${STORY_LIST.length} Arc story dengan alur terinspirasi manga\n`
  cap += `> 🏁 10 Ending: Freedom, Apocalypse, Control, Sacrifice, Love, Revenge, Peace, Scarcity, Unknown, Secret\n`
  cap += `> 🔐 Secret Ending terbuka setelah 9 ending terkumpul\n`
  cap += `> ✨ Ending memberikan buff permanen\n`
  cap += `> 💼 Sistem kerja untuk gaji dan level job\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `🎮 KONTEN LAIN\n`
  cap += `> ⚔️ Weapon dengan durability & repair\n`
  cap += `> 👹 Raid Boss bersama player lain\n`
  cap += `> ⚔️ Duel 1v1 dengan taruhan darah\n`
  cap += `> 📞 Event MakimaCall random\n`
  cap += `> 🏥 Hospital untuk revive partner\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `📊 STATISTIK GAME\n`
  cap += `> 💻 Jumlah Command: ${getCommandCount()}\n`
  cap += `> 📜 Total Quest: ${QUEST_LIST.length}\n`
  cap += `> 💬 Total Reaksi Partner: ${Object.values(PARTNER_REACTIONS).reduce((total, list) => total + list.length, 0)}\n`
  cap += `> 📜 Contract Scene: ${CSM_CONTENT_TOTALS.contractScenes}\n`
  cap += `> 🔎 Explore Story: ${CSM_CONTENT_TOTALS.exploreStories}\n`
  cap += `> 🎯 Mission Story: ${CSM_CONTENT_TOTALS.missionStories}\n`
  cap += `> 🚑 Rescue Story: ${CSM_CONTENT_TOTALS.rescueStories}\n`
  cap += `> ✅ Rescue Result: ${CSM_CONTENT_TOTALS.rescueResults}\n`
  cap += `> 😈 Terror Story: ${TERROR_SUCCESS_STORIES.length + TERROR_DEATH_STORIES.length}\n`
  cap += `> 🎉 Jumlah Event: ${EVENT_LIST.length}\n`
  cap += `> 👤 Jumlah Karakter: ${CHARACTER_LIST.length}\n`
  cap += `> 😈 Jumlah Devil: ${DEVIL_LIST.length}\n`
  cap += `> 🗺️ Jumlah Lokasi: ${totalLocations}\n`
  cap += `> 🪚 Jumlah Weapon: ${WEAPON_LIST.length}\n`
  cap += `> 💼 Jumlah Job: ${totalJobs}\n`
  cap += `> 🎒 Jumlah Item: ${ITEM_LIST.length}\n`
  cap += `> 👑 Jumlah Boss Raid: ${BOSS_LIST.length}\n`
  cap += `> 🏆 Jumlah Achievement: ${ACHIEVEMENT_LIST.length}\n`
  cap += `> 🌠 Jumlah Title: ${totalTitles}\n`
  cap += `> ✨ Jumlah Buff: ${totalBuffs}\n`
  cap += `> ⚙️ Jumlah Fitur: ${totalFeatures}\n`
  cap += `> 📖 Jumlah Arc: ${STORY_LIST.length}\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `⚠️ CATATAN\n`
  cap += `> Statistik dapat bertambah seiring update game.\n`
  cap += `> Terus berkembang ya Devil Hunter! 👊😈\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `Versi: 9.0 Beta Test\n`
  cap += `Developer: @${developerNumber}\n`
  cap += `Supported by: @${String(supportedBy).replace(/^@/, '')}\n`
  cap += `Fan-made project terinspirasi dari Chainsaw Man karya Tatsuki Fujimoto.\n`

  cap += `━━━━━━━━━━━`

  return sendCsmReply(conn, m, wdb, cap, CSM_PICTURES.about)
}

export async function handleCommand(ctx) {
  const { m, args } = ctx
  let cap = header('DAFTAR COMMAND CSM RPG')

  cap += `📋 Total command aktif: ${getCommandCount()}\n`
  cap += `🎮 Mulai: *.csm start*\n`
  cap += `|━━━━━━━━━━━\n\n`

  const requestedCommand = args.slice(1).join(' ').trim().toLowerCase()

  if (requestedCommand) {
    const commandEntry = COMMAND_SECTIONS
      .flatMap(section => section.commands)
      .find(([entry]) => entry.toLowerCase().split(' <')[0] === requestedCommand)

    if (!commandEntry) {
      return m.reply(
        header('COMMAND TIDAK DITEMUKAN') +
        `❌ Command tidak tersedia.\n\n` +
        `📋 Lihat daftar: *.csm command*\n` +
        `|━━━━━━━━━━━`
      )
    }

    const [usage, description] = commandEntry

    return m.reply(
      header(`DETAIL COMMAND: ${usage}`) +
      `📌 ${description || 'Gunakan command ini sesuai kondisi.'}\n\n` +
      `📚 Tutorial: *.csm tutorial*\n` +
      `|━━━━━━━━━━━`
    )
  }

  COMMAND_SECTIONS.forEach((section, sectionIndex) => {
    cap += `*${sectionIndex + 1}. ${section.title}*\n`
    section.commands.forEach(([command]) => {
      cap += `> .csm ${command}\n`
    })
    cap += `|━━━━━━━━━━━\n\n`
  })

  return m.reply(cap)
}

export async function handleTutorial(ctx) {
  const { m, args } = ctx
  const sub = args[1]?.toLowerCase()

  if (!sub) {
    let cap = header('PANDUAN CSM RPG')
    cap += `Gunakan *.csm tutorial <kategori>* untuk melihat detail.\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `📚 KATEGORI TUTORIAL\n`
    cap += `> 1. *.csm tutorial pemula*\n`
    cap += `> 2. *.csm tutorial dasar*\n`
    cap += `> 3. *.csm tutorial eksplorasi*\n`
    cap += `> 4. *.csm tutorial partner*\n`
    cap += `> 5. *.csm tutorial kontrak*\n`
    cap += `> 6. *.csm tutorial toko*\n`
    cap += `> 7. *.csm tutorial story*\n`
    cap += `> 8. *.csm tutorial kerja*\n`
    cap += `> 9. *.csm tutorial raid*\n`
    cap += `> 10. *.csm tutorial pvp*\n`
    cap += `> 11. *.csm tutorial full*\n`
    cap += `\n|━━━━━━━━━━━\n\n`
    cap += `💡 *.csm command* untuk daftar command\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'pemula') {
    let cap = header('PANDUAN PEMULA CSM')
    cap += `Selamat datang di Chainsaw Man RPG!\n`
    cap += `Gunakan *.csm command* untuk daftar command.\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `⚡ MULAI PERMAINAN\n`
    cap += `> *.csm start* - Buat karakter\n`
    cap += `> *.csm profile* - Lihat status\n`
    cap += `> *.csm explore* - Cari darah\n`
    cap += `> *.csm rest* - Pulihkan HP\n\n`
    cap += `📈 PROGRESS DASAR\n`
    cap += `> *.csm mission* - Mulai misi\n`
    cap += `> *.csm mission fight* - Lawan target\n`
    cap += `> *.csm mission run* - Kabur\n`
    cap += `> *.csm partner recruit <nama>* - Rekrut partner\n`
    cap += `> *.csm partner team add <nomor>* - Aktifkan tim\n\n`
    cap += `⛓️ KONTRAK IBLIS\n`
    cap += `> *.csm contract* - Lihat kontrak\n`
    cap += `> *.csm contract deal <angka>* - Ambil kontrak\n`
    cap += `> *.csm contract yes* - Konfirmasi\n\n`
    cap += `⚔️ EQUIPMENT\n`
    cap += `> *.csm shop weapon* - Buka toko\n`
    cap += `> *.csm shop weapon buy 1* - Beli senjata\n`
    cap += `> *.csm equip 1* - Pakai senjata\n`
    cap += `> *.csm equip unequip* - Lepas senjata\n`
    cap += `> *.csm inv* - Lihat item\n\n`
    cap += `📖 STORY & KERJA\n`
    cap += `> *.csm story* - Lanjut story\n`
    cap += `> *.csm job list* - Pilih kerja\n`
    cap += `> *.csm work* - Kerja & dapat reward\n\n`
    cap += `👹 RAID\n`
    cap += `> *.csm raid create* - Buat lobby\n`
    cap += `> *.csm raid join* - Gabung raid\n`
    cap += `> *.csm raid start* - Mulai raid\n\n`
    cap += `💡 *.csm command* - Daftar command\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'dasar') {
    let cap = header('TUTORIAL: DASAR')
    cap += `📋 COMMAND DASAR\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm start* - Buat karakter\n`
    cap += `> *.csm profile* - Lihat status\n`
    cap += `> *.csm stats* - Lihat buff\n`
    cap += `> *.csm stats guide* - Panduan buff\n`
    cap += `> *.csm nickname <nama>* - Ganti nama\n`
    cap += `> *.csm gender <pria/wanita>* - Set gender\n`
    cap += `> *.csm rest* - Heal HP [CD 5 menit]\n`
    cap += `> *.csm blood <jumlah>* - Tukar Rp\n`
    cap += `> *.csm blood deal* - Konfirmasi tukar\n`
    cap += `> *.csm blood cancel* - Batalkan tukar\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `Gunakan darah untuk kontrak, senjata, dan kebutuhan lainnya.`
    return m.reply(cap)
  }

  if (sub === 'eksplorasi') {
    let cap = header('TUTORIAL: EKSPLORASI')
    cap += `🗺️ COMMAND EKSPLORASI\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm location* - Daftar lokasi\n`
    cap += `> *.csm visit <nama>* - Pindah lokasi [CD 1 jam]\n`
    cap += `> *.csm explore* - Cari loot & encounter [CD 10m]\n`
    cap += `> *.csm mission* - Ambil misi\n`
    cap += `> *.csm mission fight* - Lawan devil\n`
    cap += `> *.csm mission run* - Kabur\n`
    cap += `> *.csm rescue* - Selamatkan warga [CD 20m]\n`
    cap += `> *.csm terror* - Catatan terror\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `💡 Explore untuk farming darah, item, dan encounter.`
    return m.reply(cap)
  }

  if (sub === 'partner') {
    let cap = header('TUTORIAL: PARTNER & SOSIAL')
    cap += `👥 COMMAND PARTNER\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm partner database* - Semua karakter\n`
    cap += `> *.csm partner list* - Koleksi partner\n`
    cap += `> *.csm partner recruit <nama>* - Rekrut partner\n`
    cap += `> *.csm partner team* - Tim aktif [5]\n`
    cap += `> *.csm partner team add <nomor>* - Tambah tim\n`
    cap += `> *.csm partner team remove <nomor>* - Hapus tim\n`
    cap += `> *.csm char <nama>* - Detail karakter\n`
    cap += `> *.csm gift partner blood/money <nama> <love>* - Naikkan love\n`
    cap += `> *.csm gift money/darah @tag <jumlah>* - Gift player\n`
    cap += `> *.csm hospital* - Partner sekarat\n`
    cap += `> *.csm revive <nomor>* - Hidupkan partner\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `💡 1500 Darah = 1 Love`
    return m.reply(cap)
  }

  if (sub === 'kontrak') {
    let cap = header('TUTORIAL: KONTRAK & ERASURE')
    cap += `⛓️ COMMAND KONTRAK\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm contract* - Info kontrak\n`
    cap += `> *.csm contract host* - Gacha Host\n`
    cap += `> *.csm contract fiend* - Gacha Fiend\n`
    cap += `> *.csm contract hybrid* - Gacha Hybrid\n`
    cap += `> *.csm contract devil* - Gacha Devil\n`
    cap += `> *.csm contract trial <angka>* - Trial\n`
    cap += `> *.csm contract deal <angka>* - Permanen\n`
    cap += `> *.csm contract list* - Daftar devil\n`
    cap += `> *.csm contract list info <angka>* - Detail\n`
    cap += `> *.csm contract trial yes/no* - Konfirmasi\n`
    cap += `> *.csm contract deal yes/no* - Konfirmasi\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `Trial sementara\n`
    cap += `Deal permanen.`
    return m.reply(cap)
  }

  if (sub === 'toko') {
    let cap = header('TUTORIAL: TOKO & INVENTORY')
    cap += `*COMMAND TOKO:*\n`
    cap += `> 1. *.csm shop* - Buka toko\n`
    cap += `> 2. *.csm shop weapon* - Lihat daftar senjata\n`
    cap += `> 3. *.csm shop weapon info <nomor/nama>* - Lihat info senjata\n`
    cap += `> 4. *.csm shop weapon buy <nomor/nama>* - Beli senjata\n`
    cap += `> 5. *.csm shop item* - Lihat daftar item\n\n`
    cap += `*COMMAND INVENTORY:*\n`
    cap += `> 6. *.csm inv* - Lihat inventory\n`
    cap += `> 7. *.csm equip <nomor/nama>* - Pasang senjata\n`
    cap += `> 8. *.csm equip unequip* - Lepas senjata, kembali ke Fist\n`
    cap += `> 9. *.csm repair <nomor/nama>* - Perbaiki durability senjata\n`
    cap += `> 10. *.csm sell <nomor>* - Jual item dari inventory\n\n`
    cap += `*COMMAND BLOOD:*\n`
    cap += `> 11. *.csm blood* - Lihat Blood & saldo Bank\n`
    cap += `> 12. *.csm blood convert <jumlah>* - Buat konversi Bank → Blood\n`
    cap += `> 13. *.csm blood deal* - Konfirmasi konversi\n`
    cap += `> 14. *.csm blood cancel* - Batalkan konversi\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `*Tips*: Nomor sell/equip/repair mengikuti nomor inventory gabungan Weapon + Item.\n`
    cap += `Weapon dapat kehilangan durability saat fight & raid.\n`
    cap += `Weapon dijual 50% harga beli, sedangkan Item memakai harga jual tetap.`
    return m.reply(cap)
  }

  if (sub === 'story') {
    let cap = header('TUTORIAL: STORY & ENDING')
    cap += `📖 COMMAND STORY\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm story* - Lanjut arc [Butuh Darah]\n`
    cap += `> *.csm story replay <angka>* - Ulang arc [CD 1 jam]\n`
    cap += `> *.csm storylist* - Daftar arc & cost\n\n`
    cap += `🏁 COMMAND ENDING\n`
    cap += `> *.csm ending <1-10>* - Pilih ending\n`
    cap += `> *.csm ending terima/tolak* - Konfirmasi\n\n`
    cap += `🎭 COMMAND EVENT\n`
    cap += `> *.csm event makimacall* - Info event\n`
    cap += `> *.csm event makimacall terima* - Terima duel\n`
    cap += `> *.csm event makimacall tolak* - Tolak event\n`
    cap += `> *.csm event erasure* - Pilihan proteksi\n`
    cap += `> *.csm event erasure horsemen <1-5>* - Pilih Horsemen\n`
    cap += `> *.csm event erasure fiend/hybrid* - Pilih tipe\n`
    cap += `> *.csm event erasure confirm* - Kunci pilihan\n`
    cap += `> *.csm event erasure yes* - Reset story & kontrak\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `⚠️ Erasure mengunci tipe kontrak.`
    return m.reply(cap)
  }

  if (sub === 'kerja') {
    let cap = header('TUTORIAL: KERJA')
    cap += `💼 COMMAND KERJA\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm job list* - Daftar job\n`
    cap += `> *.csm job* - Riwayat & level\n`
    cap += `> *.csm job info* - Info job aktif\n`
    cap += `> *.csm job join <nomor>* - Ambil job\n`
    cap += `> *.csm job leave* - Resign [CD 1 jam]\n`
    cap += `> *.csm work* - Kerja [CD 10 menit]\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `💡 Level job meningkatkan gaji.`
    return m.reply(cap)
  }

  if (sub === 'raid') {
    let cap = header('TUTORIAL: RAID')
    cap += `👑 COMMAND RAID\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm raid* - Boss hari ini\n`
    cap += `> *.csm raid create* - Buat lobby [10 orang]\n`
    cap += `> *.csm raid join* - Gabung lobby\n`
    cap += `> *.csm raid leave* - Keluar lobby\n`
    cap += `> *.csm raid team* - Anggota lobby\n`
    cap += `> *.csm raid start* - Mulai raid [Leader]\n`
    cap += `> *.csm raid list* - Daftar boss\n`
    cap += `> *.csm raid history* - Riwayat raid\n`
    cap += `> *.csm raid delete* - Hapus lobby [Leader]\n\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `💡 Reward: Blood & EXP besar.`
    return m.reply(cap)
  }

  if (sub === 'pvp') {
    let cap = header('TUTORIAL: PVP & EVENT')
    cap += `⚔️ COMMAND PVP\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *.csm duel @tag <taruhan>* - Duel 1v1\n`
    cap += `> Pemenang mendapat taruhan Blood\n\n`
    cap += `📚 COMMAND VIEW\n`
    cap += `> *.csm view backstory* - Backstory\n`
    cap += `> *.csm view character* - Database karakter\n`
    cap += `> *.csm view database* - Database devil\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'full') {
    let cap = header('TUTORIAL LENGKAP V9')
    cap += `Semua command Chainsaw Man RPG.\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `📋 DASAR\n`
    cap += `> start, profile, stats, nickname, gender, rest\n`
    cap += `> blood, blood deal, blood cancel, tutorial\n\n`
    cap += `🗺️ EKSPLORASI\n`
    cap += `> location, visit, explore, mission, fight, run\n`
    cap += `> rescue, terror\n\n`
    cap += `👥 PARTNER\n`
    cap += `> partner database, list, recruit, team\n`
    cap += `> team add/remove, char, gift, hospital, revive\n\n`
    cap += `⛓️ KONTRAK\n`
    cap += `> contract, host, fiend, hybrid, devil\n`
    cap += `> trial, deal, list, info, history\n`
    cap += `> event erasure, horsemen, confirm, yes/no\n\n`
    cap += `🛒 TOKO\n`
    cap += `> shop, weapon, buy, info, item\n`
    cap += `> inv, equip, repair, sell\n\n`
    cap += `📖 STORY\n`
    cap += `> story, story replay, storylist\n`
    cap += `> ending, reset\n\n`
    cap += `💼 KERJA\n`
    cap += `> job list, job, job info\n`
    cap += `> job join, job leave, work\n\n`
    cap += `👑 RAID\n`
    cap += `> raid, create, join, leave, team\n`
    cap += `> start, list, delete, history\n\n`
    cap += `⚔️ PVP & EVENT\n`
    cap += `> duel, makimacall, terima, tolak, view\n\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  return m.reply(
    header('KATEGORI TIDAK ADA') +
    `Ketik *.csm tutorial* untuk melihat kategori.\n` +
    `━━━━━━━━━━━`
  )
}
