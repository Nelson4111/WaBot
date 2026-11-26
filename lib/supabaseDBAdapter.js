import chalk from 'chalk'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'

class SupabaseDBAdapter {
    /**
     * Create Supabase LowDB Adapter
     * @param {Object} options
     * @param {string} options.url - Supabase Project URL (e.g. https://xyz.supabase.co)
     * @param {string} options.key - Supabase Service Role / Secret Key
     * @param {string} [options.table='bot_database'] - Table name
     * @param {string} [options.id='main'] - Row identifier
     * @param {string} [options.fallbackFile='database.json'] - Local fallback file
     */
    constructor({
        url,
        key,
        table = 'bot_database',
        id = 'main',
        fallbackFile = 'database.json'
    } = {}) {
        if (!url || !key) {
            throw new Error('[SupabaseDBAdapter] URL and Key are required!')
        }
        this.url = url.replace(/\/+$/, '')
        this.key = key
        this.table = table
        this.id = id
        this.fallbackFile = fallbackFile ? path.resolve(fallbackFile) : null
        this._isWriting = false
        this._pendingData = null
        this._writePromise = null
        this._writeTimeout = null
    }

    /**
     * Read database from Supabase
     * @returns {Promise<Object>}
     */
    async read() {
        try {
            const endpoint = `${this.url}/rest/v1/${this.table}?id=eq.${this.id}&select=data`
            const res = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(15000)
            })

            if (!res.ok) {
                const errText = await res.text().catch(() => '')
                throw new Error(`HTTP ${res.status}: ${errText}`)
            }

            const rows = await res.json()
            if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
                console.log(chalk.green(`☁️ [SupabaseDBAdapter] Sukses memuat database dari Supabase cloud (${this.table}:${this.id})`))
                // Perbarui cache file lokal
                if (this.fallbackFile) {
                    try {
                        writeFileSync(this.fallbackFile, JSON.stringify(rows[0].data, null, 2))
                    } catch {}
                }
                return rows[0].data
            }

            console.warn(chalk.yellow(`⚠️ [SupabaseDBAdapter] Data di cloud kosong. Mencoba fallback ke file lokal...`))
            return this._readFallback()
        } catch (err) {
            console.error(chalk.red(`❌ [SupabaseDBAdapter READ ERROR]:`), err?.message || err)
            console.warn(chalk.yellow(`⚠️ Mengalihkan ke cache file lokal (${this.fallbackFile})...`))
            return this._readFallback()
        }
    }

    /**
     * Write database to Supabase (Upsert via PostgREST) dengan antrean penulisan terjamin
     * @param {Object} data
     * @returns {Promise<any>}
     */
    async write(data) {
        if (!data || typeof data !== 'object') return

        // Simpan salinan lokal secara asinkron (non-blocking) agar tidak mengunci respon grup lain
        if (this.fallbackFile) {
            this._pendingLocalData = data
            if (!this._localBackupTimer) {
                this._localBackupTimer = setTimeout(async () => {
                    this._localBackupTimer = null
                    const snapshot = this._pendingLocalData
                    this._pendingLocalData = null
                    if (!snapshot) return
                    try {
                        const fsPromises = (await import('fs')).promises
                        const dir = path.dirname(this.fallbackFile)
                        await fsPromises.mkdir(dir, { recursive: true })
                        const tmpFile = `${this.fallbackFile}.tmp`
                        await fsPromises.writeFile(tmpFile, JSON.stringify(snapshot, null, 2), 'utf8')
                        try {
                            await fsPromises.rename(tmpFile, this.fallbackFile)
                        } catch {
                            await fsPromises.writeFile(this.fallbackFile, JSON.stringify(snapshot, null, 2), 'utf8')
                        }
                    } catch (errLocal) {
                        console.error('[SupabaseDBAdapter Local Backup Error]:', errLocal?.message)
                    }
                }, 3500)
                if (this._localBackupTimer.unref) this._localBackupTimer.unref()
            }
        }

        this._pendingData = data
        if (this._isWriting) {
            return this._writePromise
        }

        this._isWriting = true
        this._writePromise = (async () => {
            try {
                while (this._pendingData) {
                    const currentData = this._pendingData
                    this._pendingData = null
                    await this._performWrite(currentData)
                }
            } finally {
                this._isWriting = false
                this._writePromise = null
            }
        })()

        return this._writePromise
    }

    async _performWrite(currentData) {
        try {
            const payload = {
                id: this.id,
                data: currentData,
                updated_at: new Date().toISOString()
            }

            const endpoint = `${this.url}/rest/v1/${this.table}`
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(20000)
            })

            if (!res.ok) {
                const errText = await res.text().catch(() => '')
                throw new Error(`HTTP ${res.status}: ${errText}`)
            }
        } catch (err) {
            console.error(chalk.red(`❌ [SupabaseDBAdapter WRITE ERROR]:`), err?.message || err)
            throw err
        }
    }

    _readFallback() {
        if (this.fallbackFile && existsSync(this.fallbackFile)) {
            try {
                const content = readFileSync(this.fallbackFile, 'utf-8')
                return content ? JSON.parse(content) : {}
            } catch (e) {
                console.error('Gagal membaca fallback file:', e)
                return {}
            }
        }
        return {}
    }
}

export default SupabaseDBAdapter
