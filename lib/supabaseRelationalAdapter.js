import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { linkBankProperties } from './waifuHelper.js'
import { parseRpgMoneyAmount } from './rpgMoney.js'

const NUMERIC_OVERFLOW_KEY = '__supabaseNumericOverflow'

function toNumericText(value, column) {
    if (value === null || value === undefined || value === '') return '0'
    if (typeof value === 'bigint') return value.toString()
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.startsWith('__RPG_BIGINT__:')) {
            const raw = trimmed.slice(16)
            if (/^-?\d+$/.test(raw)) return raw
        }
        if (/^-?\d+$/.test(trimmed)) return trimmed
        const parsed = parseRpgMoneyAmount(trimmed)
        if (parsed !== null && parsed !== undefined) {
            return typeof parsed === 'bigint' ? parsed.toString() : String(Math.floor(parsed))
        }
        throw new TypeError(`Nilai users.${column} harus berupa bilangan bulat.`)
    }
    const numeric = Number(value) || 0
    if (!Number.isFinite(numeric)) {
        throw new TypeError(`Nilai users.${column} harus berupa bilangan bulat finite.`)
    }
    if (Number.isSafeInteger(numeric)) {
        return String(Math.trunc(numeric))
    }
    try {
        return BigInt(Math.trunc(numeric)).toString()
    } catch {
        return String(Math.trunc(numeric))
    }
}

function fromNumericText(value) {
    if (value === null || value === undefined || value === '') return 0
    let text = String(value).trim()
    if (text.startsWith('__RPG_BIGINT__:')) {
        text = text.slice(16)
    }
    if (!/^-?\d+$/.test(text)) {
        const parsed = parseRpgMoneyAmount(text)
        if (parsed !== null && parsed !== undefined) return parsed
        throw new TypeError(`Nilai Supabase numeric tidak valid: ${text}`)
    }
    const integer = BigInt(text)
    return integer <= BigInt(Number.MAX_SAFE_INTEGER) && integer >= BigInt(Number.MIN_SAFE_INTEGER)
        ? Number(integer)
        : integer
}

function jsonSafeReplacer(_key, value) {
    return typeof value === 'bigint' ? value.toString() : value
}

function parseJsonPreservingLargeIntegers(text) {
    let json = ''
    let index = 0
    while (index < text.length) {
        if (text[index] === '"') {
            const start = index++
            while (index < text.length) {
                if (text[index] === '\\') {
                    index += 2
                    continue
                }
                if (text[index++] === '"') break
            }
            json += text.slice(start, index)
            continue
        }

        if (text[index] === '-' || /\d/.test(text[index])) {
            const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
            if (match) {
                const token = match[0]
                const isLargeInteger = /^-?\d+$/.test(token) &&
                    (BigInt(token) > BigInt(Number.MAX_SAFE_INTEGER) ||
                        BigInt(token) < BigInt(Number.MIN_SAFE_INTEGER))
                if (isLargeInteger) {
                    json += JSON.stringify(token)
                } else {
                    json += token
                }
                index += token.length
                continue
            }
        }

        json += text[index++]
    }
    return JSON.parse(json)
}

class SupabaseRelationalAdapter {
    /**
     * Create Supabase Relational LowDB Adapter
     * @param {Object} options
     * @param {string} options.url - Supabase Project URL
     * @param {string} options.key - Supabase Service Role / Secret Key
     * @param {string} [options.fallbackFile='database.json'] - Local fallback file path
     */
    constructor({ url, key, fallbackFile = 'database.json' } = {}) {
        if (!url || !key) {
            throw new Error('[SupabaseRelationalAdapter] URL dan Key wajib diisi!')
        }
        this.url = url.replace(/\/+$/, '')
        this.key = key
        this.fallbackFile = fallbackFile ? path.resolve(fallbackFile) : path.resolve('database.json')
        this.backupDir = path.resolve('database_backup')
        this._isWriting = false
        this._pendingData = null
        this._pendingForce = false
        this._writePromise = null
        this.isConnected = true
        this._knownUserJids = new Set()
        this._knownChatJids = new Set()
        this._userFingerprints = new Map()
        this._chatFingerprints = new Map()
        this._metaFingerprints = new Map()
    }

    _hashUserRow(r) {
        try {
            return JSON.stringify([
                r.name, r.level, r.role, r.exp, r.limit_val, r.balance, r.bank, r.money,
                r.registered, r.premium, r.banned, r.rpg, r.pasangan, r.raw_data
            ], jsonSafeReplacer)
        } catch {
            return Math.random().toString()
        }
    }

    _hashChatRow(r) {
        try {
            return JSON.stringify([
                r.name, r.welcome, r.leave, r.antilink, r.antispam, r.antitoxic, r.is_banned, r.raw_data
            ], jsonSafeReplacer)
        } catch {
            return Math.random().toString()
        }
    }

    _hashMetaRow(data) {
        try {
            return JSON.stringify(data ?? {}, jsonSafeReplacer)
        } catch {
            return Math.random().toString()
        }
    }

    /**
     * Helper fetch dengan otentikasi Supabase
     */
    async _fetch(endpoint, options = {}, retries = 3) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.url}/rest/v1/${endpoint}`
        let lastError = null

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const res = await fetch(url, {
                    ...options,
                    headers: {
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.key}`,
                        'Accept': 'application/json',
                        ...(options.headers || {})
                    },
                    signal: AbortSignal.timeout(30000)
                })

                if (res.ok) return res

                const errText = await res.text().catch(() => '')
                // Transient error: retry on 401 (JWT clock skew), 429 (rate limit), or 5xx server errors
                if ((res.status === 401 && errText.includes('JWT')) || res.status === 429 || res.status >= 500) {
                    if (attempt < retries) {
                        await new Promise(r => setTimeout(r, 600 * attempt))
                        continue
                    }
                }

                throw new Error(`Supabase HTTP ${res.status}: ${errText}`)
            } catch (err) {
                lastError = err
                if (attempt < retries && !err.message.startsWith('Supabase HTTP 404')) {
                    await new Promise(r => setTimeout(r, 600 * attempt))
                    continue
                }
                throw err
            }
        }
        throw lastError
    }

    /**
     * Membaca seluruh baris dari tabel dengan paginasi otomatis
     */
    async _fetchAll(table, select = '*') {
        let allRows = []
        let offset = 0
        const limit = 1000

        while (true) {
            const res = await this._fetch(`${table}?select=${encodeURIComponent(select)}&limit=${limit}&offset=${offset}`, {
                method: 'GET'
            })
            const rows = await res.json()
            if (!Array.isArray(rows) || rows.length === 0) break
            allRows.push(...rows)
            if (rows.length < limit) break
            offset += limit
        }
        return allRows
    }

    /**
     * Membaca cadangan lokal jika Supabase cloud tidak dapat dihubungi
     */
    _readFallback() {
        try {
            if (this.fallbackFile && fs.existsSync(this.fallbackFile)) {
                console.log(chalk.cyan(`📂 [Supabase Local Fallback] Memuat data dari cache lokal: ${this.fallbackFile}`))
                const content = fs.readFileSync(this.fallbackFile, 'utf-8')
                return JSON.parse(content)
            }
            const backupFile = path.join(this.backupDir, 'database.json')
            if (fs.existsSync(backupFile)) {
                console.log(chalk.cyan(`📂 [Supabase Local Fallback] Memuat data dari cadangan backup: ${backupFile}`))
                const content = fs.readFileSync(backupFile, 'utf-8')
                return JSON.parse(content)
            }
        } catch (e) {
            console.error(chalk.red('[Supabase Local Fallback Read Error]:'), e.message)
        }
        return null
    }

    /**
     * Menyimpan cadangan lokal secara aman & atomik agar data RAM tidak hilang saat restart
     */
    _saveLocalBackup(data) {
        try {
            if (!data || typeof data !== 'object') return
            // Sanitasi otomatis jika ada data plugin yang menyimpan referensi objek melingkar
            if (data.users && typeof data.users === 'object') {
                for (const u of Object.values(data.users)) {
                    if (u?.rpg?.csm && typeof u.rpg.csm.questDate !== 'string') {
                        u.rpg.csm.questDate = ''
                    }
                }
            }
            const str = JSON.stringify(data, jsonSafeReplacer, 2)
            if (this.fallbackFile) {
                const dir = path.dirname(this.fallbackFile)
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
                const tmpFile = `${this.fallbackFile}.tmp`
                fs.writeFileSync(tmpFile, str)
                try {
                    fs.renameSync(tmpFile, this.fallbackFile)
                } catch {
                    fs.writeFileSync(this.fallbackFile, str)
                }
            }
            if (this.backupDir) {
                if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true })
                const backupFile = path.join(this.backupDir, 'database.json')
                const tmpBackup = `${backupFile}.tmp`
                fs.writeFileSync(tmpBackup, str)
                try {
                    fs.renameSync(tmpBackup, backupFile)
                } catch {
                    fs.writeFileSync(backupFile, str)
                }
            }
        } catch (errLocal) {
            console.error(chalk.yellow('[Supabase Local Backup Error]:'), errLocal?.message || errLocal)
        }
    }

    /**
     * Membaca database relasional dari Supabase dan merakit kembali ke format global.db.data
     * Dilengkapi cadangan lokal otomatis jika koneksi cloud gagal
     */
    async read() {
        console.log(chalk.cyan('☁️ [Supabase] Mengambil data relasional (users, chats, bot_metadata)...'))

        try {
            // 1. Ambil seluruh tabel secara paralel
            const [usersRows, chatsRows, metaRows] = await Promise.all([
                this._fetchAll('users', '*,level_text:level::text,exp_text:exp::text,limit_text:limit_val::text,balance_text:balance::text,bank_text:bank::text,money_text:money::text,rpg_text:rpg::text,raw_data_text:raw_data::text'),
                this._fetchAll('chats'),
                this._fetchAll('bot_metadata')
            ])

            this.isConnected = true
            console.log(chalk.green(`✅ [Supabase] Berhasil memuat: ${usersRows.length} users, ${chatsRows.length} chats, ${metaRows.length} metadata`))

            // 2. Rakit kembali tabel users ke format global.db.data.users
            const users = {}
            for (const row of usersRows) {
                const rawValue = typeof row.raw_data_text === 'string'
                    ? parseJsonPreservingLargeIntegers(row.raw_data_text)
                    : row.raw_data
                const raw = rawValue && typeof rawValue === 'object' ? rawValue : {}
                const rawUserData = { ...raw }
                delete rawUserData[NUMERIC_OVERFLOW_KEY]
                const rpgValue = typeof row.rpg_text === 'string'
                    ? parseJsonPreservingLargeIntegers(row.rpg_text)
                    : row.rpg
                const rpgData = rpgValue && typeof rpgValue === 'object' ? rpgValue : (raw.rpg || {})
                const bankVal = fromNumericText(row.bank_text ?? row.bank ?? rpgData.bank ?? raw.bank ?? 0)
                const storedLimit = row.limit_text ?? row.limit_val ?? raw.limit ?? 100
                if (rpgData) {
                    rpgData.bank = bankVal
                }
                const userObj = {
                    ...rawUserData,
                    name: row.name || raw.name || 'User',
                    level: Math.floor(Number(row.level_text ?? row.level) || raw.level || 0),
                    role: row.role || raw.role || 'Free user',
                    exp: fromNumericText(row.exp_text ?? row.exp ?? raw.exp ?? 0),
                    balance: fromNumericText(row.balance_text ?? row.balance ?? raw.balance ?? 0),
                    money: fromNumericText(row.money_text ?? row.money ?? raw.money ?? 0),
                    bank: bankVal,
                    limit: fromNumericText(storedLimit),
                    registered: typeof row.registered === 'boolean' ? row.registered : true,
                    premium: typeof row.premium === 'boolean' ? row.premium : false,
                    banned: typeof row.banned === 'boolean' ? row.banned : false,
                    rpg: rpgData,
                    pasangan: Array.isArray(row.pasangan) ? row.pasangan : (Array.isArray(raw.pasangan) ? raw.pasangan : [])
                }
                linkBankProperties(userObj)
                users[row.jid] = userObj
                this._userFingerprints.set(row.jid, this._hashUserRow(row))
            }
            this._knownUserJids = new Set(Object.keys(users))

            // 3. Rakit kembali tabel chats ke format global.db.data.chats
            const chats = {}
            for (const row of chatsRows) {
                const raw = row.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {}
                chats[row.jid] = {
                    ...raw,
                    name: row.name || raw.name || '',
                    welcome: typeof row.welcome === 'boolean' ? row.welcome : true,
                    leave: typeof row.leave === 'boolean' ? row.leave : true,
                    antiLink: typeof row.antilink === 'boolean' ? row.antilink : false,
                    antispam: typeof row.antispam === 'boolean' ? row.antispam : false,
                    antiToxic: typeof row.antitoxic === 'boolean' ? row.antitoxic : false,
                    isBanned: typeof row.is_banned === 'boolean' ? row.is_banned : false
                }
                this._chatFingerprints.set(row.jid, this._hashChatRow(row))
            }
            this._knownChatJids = new Set(Object.keys(chats))

            // 4. Rakit kembali seluruh metadata ke root object
            const result = {
                users,
                chats,
                stats: {},
                msgs: {},
                sticker: {},
                settings: {}
            }

            for (const row of metaRows) {
                result[row.key] = row.data
                this._metaFingerprints.set(row.key, this._hashMetaRow(row.data))
            }

            // Perbarui cadangan lokal agar disk selalu sinkron dengan cloud
            this._saveLocalBackup(result)

            return result
        } catch (err) {
            this.isConnected = false
            console.error(chalk.red('❌ [Supabase READ ERROR]: Koneksi gagal atau tabel belum siap.'), err.message)
            const fallback = this._readFallback()
            if (fallback && typeof fallback === 'object') {
                console.log(chalk.yellow('⚠️ [Supabase Fallback] Menggunakan data cadangan lokal agar bot tetap beroperasi normal.'))
                return fallback
            }
            throw err
        }
    }

    /**
     * Batch upsert ke Supabase dengan ukuran chunk 50 baris agar aman dari HTTP 413 & timeout
     */
    async _batchUpsert(table, rows, chunkSize = 50) {
        if (!rows.length) return
        for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize)
            await this._fetch(table, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify(chunk, jsonSafeReplacer)
            })
        }
    }

    /**
     * Menyimpan seluruh perubahan data ke tabel-tabel relasional di Supabase
     * Dilengkapi antrean non-blocking, sinkronisasi diferensial (dirty-tracking),
     * dan penyimpanan cadangan lokal otomatis.
     * @param {Object} data
     * @param {boolean} [force=false] - Paksa sinkronisasi seluruh baris
     * @returns {Promise<void>}
     */
    async write(data, force = false) {
        if (!data || typeof data !== 'object') return

        // 1. Simpan salinan lokal terlebih dahulu agar data dijamin aman di disk
        this._saveLocalBackup(data)

        this._pendingData = data
        if (force || data._forceFullSync) {
            this._pendingForce = true
            try { delete data._forceFullSync } catch {}
        }

        if (this._isWriting) {
            return this._writePromise
        }

        this._isWriting = true
        this._writePromise = (async () => {
            try {
                while (this._pendingData) {
                    const currentData = this._pendingData
                    const currentForce = this._pendingForce || false
                    this._pendingData = null
                    this._pendingForce = false
                    await this._performWrite(currentData, currentForce)
                }
            } finally {
                this._isWriting = false
                this._writePromise = null
            }
        })()

        return this._writePromise
    }

    /**
     * Eksekusi penyimpanan ke Supabase dengan pelacakan baris yang berubah
     */
    async _performWrite(currentData, force = false) {
        try {
            const nowIso = new Date().toISOString()

            // 1. Format baris tabel users (hanya baris baru atau yang berubah)
            const usersPayload = []
            const pendingUserFps = new Map()
            if (currentData.users && typeof currentData.users === 'object') {
                for (const [jid, u] of Object.entries(currentData.users)) {
                    if (!jid || typeof u !== 'object') continue
                    if (u.rpg?.csm && typeof u.rpg.csm.questDate !== 'string') {
                        u.rpg.csm.questDate = ''
                    }
                    const {
                        name, level, role, exp, balance, money, bank, limit, registered, premium, banned,
                        rpg, pasangan, [NUMERIC_OVERFLOW_KEY]: storedOverflow, ...rawRemaining
                    } = u

                    const rpgObj = rpg && typeof rpg === 'object' ? rpg : {}
                    if (rpgObj.csm && typeof rpgObj.csm.questDate !== 'string') {
                        rpgObj.csm.questDate = ''
                    }
                    const relationalBank = toNumericText(bank ?? rpgObj.bank ?? 0, 'bank')

                    const phone = jid.split('@')[0].replace(/\D/g, '')
                    const userRow = {
                        jid,
                        phone,
                        name: String(name || 'User').slice(0, 150),
                        level: toNumericText(level, 'level'),
                        role: String(role || 'Free user').slice(0, 80),
                        exp: toNumericText(exp, 'exp'),
                        limit_val: toNumericText(limit, 'limit_val'),
                        balance: toNumericText(balance, 'balance'),
                        bank: relationalBank,
                        money: toNumericText(money, 'money'),
                        registered: registered === true,
                        premium: premium === true,
                        banned: banned === true,
                        rpg: rpgObj,
                        pasangan: Array.isArray(pasangan) ? pasangan : [],
                        raw_data: rawRemaining,
                        updated_at: nowIso
                    }

                    const fp = this._hashUserRow(userRow)
                    if (force || this._userFingerprints.get(jid) !== fp) {
                        usersPayload.push(userRow)
                        pendingUserFps.set(jid, fp)
                    }
                }
            }

            // 2. Format baris tabel chats (hanya grup baru atau yang berubah setelannya)
            const chatsPayload = []
            const pendingChatFps = new Map()
            if (currentData.chats && typeof currentData.chats === 'object') {
                for (const [jid, c] of Object.entries(currentData.chats)) {
                    if (!jid || typeof c !== 'object') continue
                    const {
                        welcome, leave, antiLink, antispam, antiToxic, isBanned, name,
                        ...rawRemaining
                    } = c

                    const chatRow = {
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
                    }

                    const fp = this._hashChatRow(chatRow)
                    if (force || this._chatFingerprints.get(jid) !== fp) {
                        chatsPayload.push(chatRow)
                        pendingChatFps.set(jid, fp)
                    }
                }
            }

            // 3. Format seluruh root keys lainnya ke bot_metadata (hanya yang berubah)
            const metaPayload = []
            const pendingMetaFps = new Map()
            for (const [key, val] of Object.entries(currentData)) {
                if (key === 'users' || key === 'chats') continue
                const fp = this._hashMetaRow(val)
                if (force || this._metaFingerprints.get(key) !== fp) {
                    metaPayload.push({
                        key,
                        data: val ?? {},
                        updated_at: nowIso
                    })
                    pendingMetaFps.set(key, fp)
                }
            }

            // 4. Eksekusi batch upsert hanya jika ada baris yang berubah
            const upsertTasks = []
            if (usersPayload.length > 0) upsertTasks.push(this._batchUpsert('users', usersPayload))
            if (chatsPayload.length > 0) upsertTasks.push(this._batchUpsert('chats', chatsPayload))
            if (metaPayload.length > 0) upsertTasks.push(this._batchUpsert('bot_metadata', metaPayload))

            if (upsertTasks.length > 0) {
                await Promise.all(upsertTasks)
                for (const [jid, fp] of pendingUserFps) this._userFingerprints.set(jid, fp)
                for (const [jid, fp] of pendingChatFps) this._chatFingerprints.set(jid, fp)
                for (const [key, fp] of pendingMetaFps) this._metaFingerprints.set(key, fp)
            }

            // 5. Sinkronisasi penghapusan baris (hanya akun @lid yang ter-merge untuk keamanan data pengguna)
            if (this._knownUserJids && this._knownUserJids.size > 0 && currentData.users) {
                const currentUserJids = new Set(Object.keys(currentData.users))
                const deletedUsers = []
                for (const jid of this._knownUserJids) {
                    if (!currentUserJids.has(jid)) {
                        deletedUsers.push(jid)
                    }
                }
                if (deletedUsers.length > 0) {
                    for (const delJid of deletedUsers) {
                        // Lindungi: Hanya hapus jika akun @lid yang telah di-merge ke nomor HP
                        if (delJid.endsWith('@lid')) {
                            await this._fetch(`users?jid=eq.${encodeURIComponent(delJid)}`, {
                                method: 'DELETE'
                            }).catch(() => {})
                            this._userFingerprints.delete(delJid)
                        }
                    }
                }
                this._knownUserJids = currentUserJids
            } else if (currentData.users) {
                this._knownUserJids = new Set(Object.keys(currentData.users))
            }

            this.isConnected = true
        } catch (err) {
            this.isConnected = false
            console.error(chalk.red('[Supabase Relational WRITE ERROR]:'), err?.message || err)
            throw err
        }
    }
}

export default SupabaseRelationalAdapter
