import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import dotenv from 'dotenv'
import SupabaseRelationalAdapter from '../lib/supabaseRelationalAdapter.js'
import { formatRpgMoney, normalizeRpgMoney } from '../lib/rpgMoney.js'
import { linkBankProperties } from '../lib/waifuHelper.js'

dotenv.config()

const RESTORE_TARGETS = [
  {
    jid: '6282228638623@s.whatsapp.net',
    name: 'Eza / Morningstar',
    targetBank: 43980000000000000000n, // 43,98Qi
    targetMoney: 0,
    targetProfit: 44870000000000000000n // 44,87Qi
  },
  {
    jid: '6287716300353@s.whatsapp.net',
    name: 'Mina / ratu iblis',
    targetBank: 23690000000000000000n, // 23,69Qi
    targetMoney: 0,
    targetProfit: 23690000000000000000n // 23,69Qi
  },
  {
    jid: '6281335750641@s.whatsapp.net',
    name: 'Nathan / nick',
    targetBank: 10520000000000000000n, // 10,52Qi
    targetMoney: 25050000, // 25,05M
    targetProfit: 10450000000000000000n // 10,45Qi
  },
  {
    jid: '6281370424543@s.whatsapp.net',
    name: 'Zahra / jara',
    targetBank: 275110000000000000n, // 275,11Qa
    targetMoney: null, // Pertahankan cash yang ada
    targetProfit: 2154697270805703000n // 2,15Qi (Profit New)
  },
  {
    jid: '628385848829@s.whatsapp.net',
    name: 'Sasha / shaa',
    targetBank: 2760000000000000000000n, // 2,76Sx (Money New)
    targetMoney: null, // Pertahankan cash yang ada
    targetProfit: 2764391466173033600000n // 2,76Sx (Profit New)
  },
  {
    jid: '6281936185786@s.whatsapp.net',
    name: 'Fazya / jijieww / anotherjiee',
    targetBank: 2000000000000, // 2T
    targetMoney: 932560000000, // 932,56B
    targetProfit: 2230000000000 // 2,23T
  },
  {
    jid: '6282332888898@s.whatsapp.net',
    name: 'Nyo / bonyo',
    targetBank: 494597370678626, // 494,6T
    targetMoney: null,
    targetProfit: 432258429163581 // 432,26T
  },
  {
    jid: '628979664214@s.whatsapp.net',
    name: 'Cayy / husbandnya saaasaaaa',
    targetBank: 2187051301639022, // 2,19Qa
    targetMoney: null,
    targetProfit: 2103212337627537 // 2,10Qa
  },
  {
    jid: '6281918910847@s.whatsapp.net',
    name: 'Aila',
    targetBank: 3818767505, // 3,82B
    targetMoney: 97734377, // 97,73M
    targetProfit: 915253515 // 915,25M
  },
  {
    jid: '6281234921845@s.whatsapp.net',
    name: 'Anez',
    targetBank: 3790743123, // 3,79B
    targetMoney: 6077128, // 6,08M
    targetProfit: null
  },
  {
    jid: '6288228611303@s.whatsapp.net',
    name: 'Vania',
    targetBank: null,
    targetMoney: null,
    targetProfit: 5721900 // 5,72M
  }
]

async function main() {
  const isApply = process.argv.includes('--apply')
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════════════════════╗'))
  console.log(chalk.bold.cyan('║        🛠️  AVELIA BOT: RPG ECONOMY RECOVERY TOOL             ║'))
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════════╝'))
  console.log(chalk.yellow(`Mode: ${isApply ? '🚀 APPLY (Menyimpan perubahan ke disk & Supabase)' : '🔍 DRY-RUN (Hanya simulasi, data tidak diubah)'}\n`))

  const dbPath = path.resolve('database.json')
  if (!fs.existsSync(dbPath)) {
    console.error(chalk.red(`❌ File database.json tidak ditemukan di ${dbPath}`))
    process.exit(1)
  }

  const rawContent = fs.readFileSync(dbPath, 'utf8')
  const db = JSON.parse(rawContent)
  if (!db.users || typeof db.users !== 'object') {
    console.error(chalk.red('❌ db.users tidak valid di database.json'))
    process.exit(1)
  }

  console.log(chalk.bold('📋 PERBANDINGAN NILAI PER PEMAIN:'))
  console.log('─'.repeat(80))

  const changes = []

  for (const item of RESTORE_TARGETS) {
    let user = db.users[item.jid]
    if (!user) {
      console.log(chalk.red(`⚠️ User ${item.jid} (${item.name}) tidak ditemukan di db.users!`))
      continue
    }

    user.rpg = user.rpg && typeof user.rpg === 'object' ? user.rpg : {}
    linkBankProperties(user)

    const oldCash = normalizeRpgMoney(user.money || 0)
    const oldBank = normalizeRpgMoney(user.bank ?? user.rpg?.bank ?? 0)
    const oldProfit = normalizeRpgMoney(user.rpg?.casinoStats?.profit ?? user.casinoStats?.profit ?? 0)

    const newCash = item.targetMoney !== null ? normalizeRpgMoney(item.targetMoney) : oldCash
    const newBank = item.targetBank !== null ? normalizeRpgMoney(item.targetBank) : oldBank
    const newProfit = item.targetProfit !== null ? normalizeRpgMoney(item.targetProfit) : oldProfit

    const hasCashChange = String(oldCash) !== String(newCash)
    const hasBankChange = String(oldBank) !== String(newBank)
    const hasProfitChange = String(oldProfit) !== String(newProfit)

    console.log(chalk.bold.white(`👤 ${item.name} (${item.jid})`))
    console.log(`  💵 Cash  : ${formatRpgMoney(oldCash)} ${hasCashChange ? chalk.green(`➔ ${formatRpgMoney(newCash)}`) : chalk.gray('(Tetap)')}`)
    console.log(`  🏦 Bank  : ${formatRpgMoney(oldBank)} ${hasBankChange ? chalk.green(`➔ ${formatRpgMoney(newBank)}`) : chalk.gray('(Tetap)')}`)
    console.log(`  🎰 Profit: ${formatRpgMoney(oldProfit)} ${hasProfitChange ? chalk.green(`➔ ${formatRpgMoney(newProfit)}`) : chalk.gray('(Tetap)')}`)
    console.log('─'.repeat(80))

    if (hasCashChange || hasBankChange || hasProfitChange) {
      changes.push({
        jid: item.jid,
        user,
        newCash,
        newBank,
        newProfit
      })
    }
  }

  console.log(chalk.cyan(`\nTotal akun yang perlu diperbarui: ${changes.length} dari ${RESTORE_TARGETS.length}`))

  if (!isApply) {
    console.log(chalk.yellow('\n👉 Ini adalah pratinjau DRY-RUN. Tidak ada data yang diubah.'))
    console.log(chalk.yellow('   Jalankan dengan flag --apply untuk menerapkan pemulihan:'))
    console.log(chalk.white('   node scripts/restore-rpg-records.js --apply\n'))
    return
  }

  // 1. Terapkan perubahan ke objek database lokal
  console.log(chalk.cyan('\n💾 Menerapkan perubahan ke database lokal...'))
  for (const c of changes) {
    c.user.money = c.newCash
    c.user.bank = c.newBank
    if (c.user.rpg) {
      c.user.rpg.bank = c.newBank
      c.user.rpg.casinoStats = c.user.rpg.casinoStats && typeof c.user.rpg.casinoStats === 'object' ? c.user.rpg.casinoStats : {}
      c.user.rpg.casinoStats.profit = c.newProfit
      c.user.casinoStats = c.user.rpg.casinoStats
    }
  }

  // 2. Simpan cadangan atomik ke database.json
  const replacer = (_key, val) => typeof val === 'bigint' ? val.toString() : val
  const updatedJson = JSON.stringify(db, replacer, 2)
  fs.writeFileSync(dbPath, updatedJson, 'utf8')
  console.log(chalk.green(`✅ Berhasil memperbarui file lokal: ${dbPath}`))

  // Backup folder database_backup
  const backupFolder = path.resolve('database_backup')
  if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder, { recursive: true })
  fs.writeFileSync(path.join(backupFolder, 'database.json'), updatedJson, 'utf8')
  console.log(chalk.green(`✅ Berhasil memperbarui file backup: ${path.join(backupFolder, 'database.json')}`))

  // 3. Sinkronisasi langsung ke Supabase Cloud jika terkonfigurasi
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (supabaseUrl && supabaseKey) {
    console.log(chalk.cyan('\n☁️ Menyinkronkan pemulihan langsung ke Supabase Cloud...'))
    try {
      const adapter = new SupabaseRelationalAdapter({
        url: supabaseUrl,
        key: supabaseKey,
        fallbackFile: dbPath
      })
      await adapter.write(db, true)
      console.log(chalk.bold.green('🎉 Sukses! Seluruh data pemain telah disinkronkan ke Supabase Cloud!'))
    } catch (err) {
      console.error(chalk.red('❌ Gagal menyinkronkan ke Supabase:'), err.message)
    }
  } else {
    console.log(chalk.yellow('⚠️ SUPABASE_URL / SUPABASE_KEY tidak ditemukan di .env. Sinkronisasi cloud dilewati.'))
  }

  console.log(chalk.bold.green('\n✨ Pemulihan data ekonomi RPG selesai!\n'))
}

main().catch(err => {
  console.error(chalk.red('FATAL ERROR:'), err)
  process.exit(1)
})
