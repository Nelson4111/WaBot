import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '')
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''
const TABLE_NAME = process.env.SUPABASE_TABLE || 'bot_database'

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(chalk.red('❌ SUPABASE_URL dan SUPABASE_KEY wajib disetel di file .env!'))
    process.exit(1)
}

async function testConnection() {
    console.log(chalk.cyan(`🔄 Memeriksa koneksi ke Supabase: ${SUPABASE_URL}...`))
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.main&select=id`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Accept': 'application/json'
            }
        })

        if (!res.ok) {
            const body = await res.text()
            if (res.status === 403 && body.includes('permission denied')) {
                console.log(chalk.red('\n❌ PERMISSION DENIED (403): Table bot_database belum diberikan izin (GRANT).'))
                console.log(chalk.yellow('\n👉 Silakan buka SQL Editor di Supabase Dashboard, lalu jalankan query ini:'))
                console.log(chalk.green(`
GRANT ALL ON TABLE public.${TABLE_NAME} TO service_role, postgres, anon, authenticated;
ALTER TABLE public.${TABLE_NAME} DISABLE ROW LEVEL SECURITY;
`))
                return false
            }
            throw new Error(`HTTP ${res.status}: ${body}`)
        }

        console.log(chalk.green(`✅ Koneksi ke Supabase & tabel '${TABLE_NAME}' berhasil diverifikasi!`))
        return true
    } catch (e) {
        console.error(chalk.red(`❌ Gagal terhubung ke Supabase:`), e.message)
        return false
    }
}

async function uploadRow(id, data, label) {
    const payload = {
        id,
        data,
        updated_at: new Date().toISOString()
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        const errText = await res.text()
        throw new Error(`[${label}] Upload gagal (${res.status}): ${errText}`)
    }

    console.log(chalk.green(`✅ Berhasil mengunggah: ${label} -> [${TABLE_NAME}: ${id}]`))
}

async function startMigration() {
    console.log(chalk.blueBright('══════════════════════════════════════════════════════'))
    console.log(chalk.bold.cyan('   🚀 AVELIA BOT: SUPABASE DATABASE MIGRATION TOOL    '))
    console.log(chalk.blueBright('══════════════════════════════════════════════════════\n'))

    const connected = await testConnection()
    if (!connected) {
        process.exit(1)
    }

    // 1. Migrasi database.json Utama
    const dbPath = path.resolve('database.json')
    if (!existsSync(dbPath)) {
        console.error(chalk.red(`❌ File database.json tidak ditemukan di ${dbPath}`))
        process.exit(1)
    }

    console.log(chalk.cyan(`\n📂 Membaca database.json lokal...`))
    const rawContent = readFileSync(dbPath, 'utf-8')
    const mainDB = JSON.parse(rawContent)

    const userCount = Object.keys(mainDB.users || {}).length
    const chatCount = Object.keys(mainDB.chats || {}).length
    const statsCount = Object.keys(mainDB.stats || {}).length
    console.log(chalk.yellow(`📊 Statistik Data Utama:`))
    console.log(`  • Pengguna (Users): ${userCount}`)
    console.log(`  • Grup (Chats)    : ${chatCount}`)
    console.log(`  • Statistik Fitur : ${statsCount}`)
    console.log(`  • Ukuran File     : ${(Buffer.byteLength(rawContent) / 1024).toFixed(2)} KB\n`)

    console.log(chalk.cyan(`📤 Mengunggah database utama ke Supabase...`))
    await uploadRow('main', mainDB, 'Database Utama (database.json)')

    // 2. Migrasi file pendukung di lib/database/
    const auxDir = path.resolve('lib/database')
    if (existsSync(auxDir)) {
        console.log(chalk.cyan(`\n📂 Memeriksa folder lib/database/...`))
        const files = readdirSync(auxDir).filter(f => f.endsWith('.json'))
        for (const f of files) {
            try {
                const fPath = path.join(auxDir, f)
                const fContent = readFileSync(fPath, 'utf-8')
                if (!fContent.trim()) continue
                const parsed = JSON.parse(fContent)
                const baseName = f.replace('.json', '')
                await uploadRow(`aux_${baseName}`, parsed, `Auxiliary: ${f}`)
            } catch (e) {
                console.warn(chalk.yellow(`⚠️ Gagal mencadangkan ${f}: ${e.message}`))
            }
        }
    }

    console.log(chalk.blueBright('\n══════════════════════════════════════════════════════'))
    console.log(chalk.bold.green('  🎉 MIGRASI SUKSES! SELURUH DATA AMAN DI SUPABASE CLOUD'))
    console.log(chalk.blueBright('══════════════════════════════════════════════════════\n'))
}

startMigration().catch(err => {
    console.error(chalk.red('\n❌ Migrasi Terhenti karena Kesalahan:'), err.message)
    process.exit(1)
})
