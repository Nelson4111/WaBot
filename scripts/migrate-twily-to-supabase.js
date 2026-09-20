import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

console.log(chalk.bold.cyan('══════════════════════════════════════════════════════════════'))
console.log(chalk.bold.cyan('     🚀 MIGRASI TWILY DATA KE SUPABASE CLOUD (bot_metadata)    '))
console.log(chalk.bold.cyan('══════════════════════════════════════════════════════════════\n'))

// 1. Baca konfigurasi .env
const envPath = path.resolve('.env')
if (!fs.existsSync(envPath)) {
  console.error(chalk.red('❌ File .env tidak ditemukan!'))
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx !== -1) {
    const k = trimmed.slice(0, idx).trim()
    const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    env[k] = v
  }
}

const url = (env.SUPABASE_URL || '').replace(/\/+$/, '')
const key = env.SUPABASE_KEY

if (!url || !key) {
  console.error(chalk.red('❌ SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env!'))
  process.exit(1)
}

// 2. Baca file json/twilyData.json
const twilyFile = path.resolve('json', 'twilyData.json')
if (!fs.existsSync(twilyFile)) {
  console.error(chalk.red(`❌ File ${twilyFile} tidak ditemukan!`))
  process.exit(1)
}

let twilyData = {}
try {
  twilyData = JSON.parse(fs.readFileSync(twilyFile, 'utf-8'))
} catch (e) {
  console.error(chalk.red('❌ Gagal membaca json/twilyData.json:'), e.message)
  process.exit(1)
}

console.log(chalk.cyan(`📂 Membaca json/twilyData.json:`))
console.log(chalk.white(`  • Konsep: ${twilyData.concept || '-'}`))
console.log(chalk.white(`  • Generasi: ${Object.keys(twilyData.generations || {}).length} gen`))
const totalMembers = Object.values(twilyData.generations || {}).reduce((acc, m) => acc + m.length, 0)
console.log(chalk.white(`  • Total Member: ${totalMembers} orang`))
console.log(chalk.white(`  • Admin: ${(twilyData.admins || []).length} orang`))
console.log(chalk.white(`  • Partner: ${(twilyData.partners || []).length} orang`))
console.log(chalk.white(`  • Profil: ${Object.keys(twilyData.profiles || {}).length} profil\n`))

// 3. Upload ke Supabase bot_metadata (upsert key = 'twily')
const nowIso = new Date().toISOString()
const payload = {
  key: 'twily',
  data: twilyData,
  updated_at: nowIso
}

console.log(chalk.cyan(`📤 Mengunggah ke Supabase Cloud (tabel: bot_metadata, key: 'twily')...`))

try {
  const endpoint = `${url}/rest/v1/bot_metadata`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${errText}`)
  }

  const result = await res.json()
  console.log(chalk.bold.green('\n🎉 MIGRASI SUKSES!'))
  console.log(chalk.green(`✅ Data TWILY telah berhasil disimpan di Supabase Cloud (bot_metadata)!`))
  console.log(chalk.white(`   Key: twily`))
  console.log(chalk.white(`   Updated at: ${nowIso}`))
} catch (err) {
  console.error(chalk.red('\n❌ Gagal mengunggah data TWILY ke Supabase:'), err.message)
  process.exit(1)
}
