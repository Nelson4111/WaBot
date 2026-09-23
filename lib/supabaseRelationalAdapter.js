import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

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
            ])
        } catch {
            return Math.random().toString()
        }
    }

    _hashChatRow(r) {
        try {
            return JSON.stringify([
                r.name, r.welcome, r.leave, r.antilink, r.antispam, r.antitoxic, r.is_banned, r.raw_data
            ])
        } catch {
            return Math.random().toString()
        }
    }

    _hashMetaRow(data) {
        try {
            return JSON.stringify(data ?? {})
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
    async _fetchAll(table) {
        let allRows = []
        let offset = 0
        const limit = 1000

        while (true) {
            const res = await this._fetch(`${table}?select=*&limit=${limit}&offset=${offset}`, {
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
            const str = JSON.stringify(data, null, 2)
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
                this._fetchAll('users'),
                this._fetchAll('chats'),
                this._fetchAll('bot_metadata')
            ])

            this.isConnected = true
            console.log(chalk.green(`✅ [Supabase] Berhasil memuat: ${usersRows.length} users, ${chatsRows.length} chats, ${metaRows.length} metadata`))

            // 2. Rakit kembali tabel users ke format global.db.data.users
            const users = {}
            for (const row of usersRows) {
                const raw = row.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {}
                const rpgData = row.rpg && typeof row.rpg === 'object' ? row.rpg : (raw.rpg || {})
                const bankVal = Math.floor(Number(typeof row.bank === 'number' ? row.bank : (rpgData.bank || raw.bank || 0)))
                if (rpgData && (rpgData.bank === undefined || rpgData.bank === 0)) {
                    rpgData.bank = bankVal
                }
                users[row.jid] = {
                    ...raw,
                    name: row.name || raw.name || 'User',
                    level: Math.floor(Number(row.level) || raw.level || 0),
                    role: row.role || raw.role || 'Free user',
                    exp: Math.floor(Number(row.exp) || raw.exp || 0),
                    balance: Math.floor(Number(row.balance) || raw.balance || 0),
                    money: Math.floor(Number(row.money) || raw.money || 0),
                    bank: bankVal,
                    limit: Math.floor(Number(row.limit_val) || raw.limit || 100),
                    registered: typeof row.registered === 'boolean' ? row.registered : true,
                    premium: typeof row.premium === 'boolean' ? row.premium : false,
                    banned: typeof row.banned === 'boolean' ? row.banned : false,
                    rpg: rpgData,
                    pasangan: Array.isArray(row.pasangan) ? row.pasangan : (Array.isArray(raw.pasangan) ? raw.pasangan : [])
                }
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
                body: JSON.stringify(chunk)
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
                    const {
                        name, level, role, exp, balance, money, bank, limit, registered, premium, banned,
                        rpg, pasangan, ...rawRemaining
                    } = u

                    const rpgObj = rpg && typeof rpg === 'object' ? rpg : {}
                    const resolvedBank = Math.floor(Number(bank || rpgObj.bank || 0))
                    if (rpgObj) rpgObj.bank = resolvedBank

                    const phone = jid.split('@')[0].replace(/\D/g, '')
                    const userRow = {
                        jid,
                        phone,
                        name: String(name || 'User').slice(0, 150),
                        level: Math.floor(Number(level) || 0),
                        role: String(role || 'Free user').slice(0, 80),
                        exp: Math.floor(Number(exp) || 0),
                        limit_val: Math.floor(Number(limit) || 0),
                        balance: Math.floor(Number(balance) || 0),
                        bank: resolvedBank,
                        money: Math.floor(Number(money) || 0),
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
