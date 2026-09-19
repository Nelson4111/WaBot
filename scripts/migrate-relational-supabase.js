import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '')
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(chalk.red('❌ SUPABASE_URL dan SUPABASE_KEY wajib disetel di file .env!'))
    process.exit(1)
}

async function checkTable(table) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Accept': 'application/json'
            }
        })
        if (!res.ok) {
            const errText = await res.text()
            return { ok: false, status: res.status, error: errText }
        }
        return { ok: true }
    } catch (e) {
        return { ok: false, error: e.message }
    }
}

async function batchUpsert(table, rows, chunkSize = 150) {
    if (!rows.length) return
    const total = rows.length
    for (let i = 0; i < total; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize)
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify(chunk)
        })

        if (!res.ok) {
            const errText = await res.text()
            throw new Error(`[Batch ${table}] Gagal mengunggah baris ${i + 1}-${Math.min(i + chunkSize, total)}: ${errText}`)
        }
        process.stdout.write(chalk.green(`  ↳ Mengunggah ${table}: ${Math.min(i + chunkSize, total)} / ${total} baris...\r`))
    }
    console.log(chalk.green(`\n  ✅ Selesai mengunggah ${total} baris ke tabel '${table}'`))
}

async function startRelationalMigration() {
    console.log(chalk.blueBright('══════════════════════════════════════════════════════════════'))
    console.log(chalk.bold.cyan('   🚀 AVELIA BOT: SUPABASE RELATIONAL MIGRATION (OPSI B)      '))
    console.log(chalk.blueBright('══════════════════════════════════════════════════════════════\n'))

    console.log(chalk.cyan(`🔄 Memeriksa tabel-tabel di Supabase: ${SUPABASE_URL}...`))
    const [uCheck, cCheck, mCheck] = await Promise.all([
        checkTable('users'),
        checkTable('chats'),
        checkTable('bot_metadata')
    ])

    const missingTables = []
    if (!uCheck.ok) missingTables.push({ name: 'users', ...uCheck })
    if (!cCheck.ok) missingTables.push({ name: 'chats', ...cCheck })
    if (!mCheck.ok) missingTables.push({ name: 'bot_metadata', ...mCheck })

    if (missingTables.length > 0) {
        console.log(chalk.red(`\n❌ Tabel relasional belum siap di Supabase:`))
        for (const t of missingTables) {
            console.log(chalk.yellow(`  • Tabel '${t.name}': ${t.error || 'Tidak ditemukan'}`))
        }
        console.log(chalk.magenta('\n👉 Silakan copy dan jalankan script SQL berikut di SQL Editor Supabase:'))
        console.log(chalk.white(`
-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS public.users (
  jid text PRIMARY KEY,
  phone text,
  name text DEFAULT 'User',
  level integer DEFAULT 0,
  role text DEFAULT 'Free user',
  exp bigint DEFAULT 0,
  limit_val integer DEFAULT 100,
  balance bigint DEFAULT 0,
  bank bigint DEFAULT 0,
  money bigint DEFAULT 0,
  registered boolean DEFAULT true,
  premium boolean DEFAULT false,
  banned boolean DEFAULT false,
  rpg jsonb DEFAULT '{}'::jsonb,
  pasangan jsonb DEFAULT '[]'::jsonb,
  raw_data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level DESC);
CREATE INDEX IF NOT EXISTS idx_users_money ON public.users(money DESC);
CREATE INDEX IF NOT EXISTS idx_users_balance ON public.users(balance DESC);

-- 2. Tabel Chats (Grup & Chat Settings)
CREATE TABLE IF NOT EXISTS public.chats (
  jid text PRIMARY KEY,
  name text,
  welcome boolean DEFAULT true,
  leave boolean DEFAULT true,
  antilink boolean DEFAULT false,
  antispam boolean DEFAULT false,
  antitoxic boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  raw_data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Bot Metadata (Stats, Global Settings, Nenelcraft, Cooldowns, dll)
CREATE TABLE IF NOT EXISTS public.bot_metadata (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Izin Akses & Keamanan
GRANT ALL ON TABLE public.users TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.chats TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.bot_metadata TO service_role, postgres, anon, authenticated;

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_metadata DISABLE ROW LEVEL SECURITY;
`))
        return false
    }

    console.log(chalk.green('✅ Semua tabel relasional (users, chats, bot_metadata) terdeteksi!\n'))

    // 1. Baca database.json lokal (atau dari database_backup/)
    let dbPath = path.resolve('database.json')
    if (!existsSync(dbPath)) {
        dbPath = path.resolve('database_backup/database.json')
    }
    if (!existsSync(dbPath)) {
        console.error(chalk.red(`❌ File database.json tidak ditemukan di root maupun di database_backup/`))
        return false
    }

    console.log(chalk.cyan(`📂 Membaca database.json lokal...`))
    const rawContent = readFileSync(dbPath, 'utf-8')
    const mainDB = JSON.parse(rawContent)
    const nowIso = new Date().toISOString()

    // 2. Siapkan baris tabel users
    const usersRows = []
    for (const [jid, u] of Object.entries(mainDB.users || {})) {
        if (!jid || typeof u !== 'object') continue
        const {
            name, level, role, exp, balance, money, bank, limit, registered, premium, banned,
            rpg, pasangan, ...rawRemaining
        } = u

        const phone = jid.split('@')[0].replace(/\D/g, '')
        usersRows.push({
            jid,
            phone,
            name: String(name || 'User').slice(0, 150),
            level: Number(level) || 0,
            role: String(role || 'Free user').slice(0, 80),
            exp: Number(exp) || 0,
            limit_val: Number(limit) || 0,
            balance: Number(balance) || 0,
            bank: Number(bank) || 0,
            money: Number(money) || 0,
            registered: registered === true,
            premium: premium === true,
            banned: banned === true,
            rpg: rpg && typeof rpg === 'object' ? rpg : {},
            pasangan: Array.isArray(pasangan) ? pasangan : [],
            raw_data: rawRemaining,
            updated_at: nowIso
        })
    }

    // 3. Siapkan baris tabel chats
    const chatsRows = []
    for (const [jid, c] of Object.entries(mainDB.chats || {})) {
        if (!jid || typeof c !== 'object') continue
        const {
            welcome, leave, antiLink, antispam, antiToxic, isBanned, name,
            ...rawRemaining
        } = c

        chatsRows.push({
            jid,
            name: name ? String(name).slice(0, 200) : null,
            welcome: welcome !== false,
            leave: leave !== false,
            antilink: antiLink === true,
            antispam: antispam === true,
            antitoxic: antiToxic === true,
            is_banned: isBanned === true,
            raw_data: rawRemaining,
            updated_at: nowIso
        })
    }

    // 4. Siapkan baris bot_metadata untuk seluruh root keys lainnya
    const metaRows = []
    for (const [key, val] of Object.entries(mainDB)) {
        if (key === 'users' || key === 'chats') continue
        metaRows.push({
            key,
            data: val ?? {},
            updated_at: nowIso
        })
    }

    // 5. Muat juga auxiliary files jika ada di lib/database/
    const auxDir = path.resolve('lib/database')
    if (existsSync(auxDir)) {
        const auxFiles = readdirSync(auxDir).filter(f => f.endsWith('.json'))
        for (const f of auxFiles) {
            try {
                const fPath = path.join(auxDir, f)
                const fContent = readFileSync(fPath, 'utf-8')
                if (!fContent.trim()) continue
                const parsed = JSON.parse(fContent)
                metaRows.push({
                    key: `aux_${f.replace('.json', '')}`,
                    data: parsed,
                    updated_at: nowIso
                })
            } catch (err) {
                console.warn(chalk.yellow(`⚠️ Gagal memuat auxiliary file ${f}: ${err.message}`))
            }
        }
    }

    console.log(chalk.yellow(`📊 Data yang akan dimigrasikan ke Supabase Relational:`))
    console.log(`  • Users       : ${usersRows.length} baris -> tabel public.users`)
    console.log(`  • Chats       : ${chatsRows.length} baris -> tabel public.chats`)
    console.log(`  • Bot Metadata: ${metaRows.length} baris -> tabel public.bot_metadata\n`)

    console.log(chalk.cyan(`📤 Mengunggah ke tabel public.users...`))
    await batchUpsert('users', usersRows, 150)

    console.log(chalk.cyan(`📤 Mengunggah ke tabel public.chats...`))
    await batchUpsert('chats', chatsRows, 150)

    console.log(chalk.cyan(`📤 Mengunggah ke tabel public.bot_metadata...`))
    await batchUpsert('bot_metadata', metaRows, 50)

    console.log(chalk.blueBright('\n══════════════════════════════════════════════════════════════'))
    console.log(chalk.bold.green('  🎉 MIGRASI RELASIONAL SUKSES! DATA RAPI TERSTRUKTUR DI SUPABASE'))
    console.log(chalk.blueBright('══════════════════════════════════════════════════════════════\n'))
    return true
}

startRelationalMigration().catch(err => {
    console.error(chalk.red('\n❌ Migrasi Terhenti:'), err.message)
    process.exit(1)
})
