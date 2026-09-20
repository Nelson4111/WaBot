import EventEmitter from 'events'
import chalk from 'chalk'

/**
 * BotArbitrator: Mengatur arbitrase dan failover antara Bot Utama (global.conn)
 * dan JadiBot (global.jadibots) ketika berada di dalam satu grup yang sama.
 *
 * Prinsip:
 * 1. Di PC/DM: Bot Utama & JadiBot selalu merespon langsung tanpa jeda.
 * 2. Di Grup tanpa Bot Utama: JadiBot merespon langsung tanpa jeda.
 * 3. Di Grup dengan Bot Utama aktif: Hanya Bot Utama yang merespon, JadiBot bersiaga (yield).
 * 4. Jika Bot Utama offline / error / Bad MAC: JadiBot otomatis mengambil alih (failover).
 * 5. Multi-JadiBot: Hanya satu JadiBot yang mengambil alih untuk mencegah respon ganda.
 */
class BotArbitrator extends EventEmitter {
    constructor() {
        super()
        this.claims = new Map()
        this.FAILOVER_TIMEOUT_MS = 1500 // 1.5 detik jeda failover
        this.CLEANUP_INTERVAL_MS = 60000 // Bersihkan klaim kedaluwarsa setiap 60 detik
        this.CLAIM_TTL_MS = 120000 // TTL klaim 2 menit

        const timer = setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL_MS)
        if (timer.unref) timer.unref()
    }

    /**
     * Memeriksa apakah socket saat ini adalah Bot Utama
     * @param {object} sock 
     * @returns {boolean}
     */
    isMainBot(sock) {
        if (!sock) return false
        if (sock.isJadiBot || sock.isJadibot || sock.isSubBot) return false
        if (sock === global.conn) return true
        if (global.conn?.user?.id && sock.user?.id) {
            const decode = (id) => (sock?.decodeJid ? sock.decodeJid(id) : id) || ''
            const mainJid = decode(global.conn.user.id).split(':')[0]
            const sockJid = decode(sock.user.id).split(':')[0]
            if (mainJid && sockJid && mainJid === sockJid) return true
        }
        return false
    }

    /**
     * Memeriksa apakah Bot Utama sedang online dan sehat
     * @returns {boolean}
     */
    isMainBotHealthy() {
        const main = global.conn
        if (!main) return false
        if (!main.user || !main.user.id) return false
        if (main.ws) {
            if (main.ws.isOpen === false) return false
            if (typeof main.ws.readyState === 'number' && main.ws.readyState !== 1) return false
        }
        return true
    }

    /**
     * Memeriksa apakah Bot Utama terdaftar sebagai peserta di grup ini
     * @param {object} groupMetadata 
     * @param {object} sock 
     * @returns {boolean}
     */
    isMainBotInGroup(groupMetadata, sock) {
        if (!global.conn?.user?.id) return false
        if (!groupMetadata || !Array.isArray(groupMetadata.participants) || groupMetadata.participants.length === 0) {
            return false
        }

        const decode = (id) => (sock?.decodeJid ? sock.decodeJid(id) : id) || ''
        const mainRawId = global.conn.user.id || global.conn.user.jid || ''
        const mainJid = decode(mainRawId).split(':')[0] + '@s.whatsapp.net'
        const mainNum = mainJid.replace(/[^0-9]/g, '')
        const mainLid = global.conn.user?.lid ? decode(global.conn.user.lid).split(':')[0] + '@lid' : null

        return groupMetadata.participants.some(p => {
            const pId = decode(p.id || p.jid || '')
            const pNum = pId.replace(/[^0-9]/g, '')
            const pLid = p.lid ? decode(p.lid).split(':')[0] + '@lid' : null

            if (mainNum && pNum && pNum === mainNum) return true
            if (mainLid && pLid && mainLid === pLid) return true
            if (mainJid && pId && mainJid === pId) return true
            return false
        })
    }

    /**
     * Klaim failover untuk JadiBot saat Bot Utama tidak merespon
     * @param {string} msgId 
     * @param {object} sock 
     * @returns {boolean}
     */
    claimFailover(msgId, sock) {
        const sockJid = (sock?.decodeJid ? sock.decodeJid(sock.user?.id || '') : sock?.user?.id || 'jadibot').split(':')[0]
        let claim = this.claims.get(msgId)
        if (!claim) {
            claim = {
                claimant: sockJid,
                failoverClaimant: sockJid,
                state: 'claimed',
                timestamp: Date.now()
            }
            this.claims.set(msgId, claim)
            return true
        }

        // Jika pesan sudah diselesaikan bot lain
        if (claim.state === 'resolved') return false

        // Jika JadiBot lain sudah mengambil klaim failover
        if (claim.failoverClaimant && claim.failoverClaimant !== sockJid) return false

        claim.failoverClaimant = sockJid
        claim.claimant = sockJid
        claim.state = 'claimed'
        return true
    }

    /**
     * Metode koordinasi utama yang dipanggil oleh handler.js
     * @param {object} sock 
     * @param {object} m 
     * @param {object} groupMetadata 
     * @returns {Promise<boolean>} true jika bot boleh lanjut memproses, false jika harus yield/batal
     */
    async coordinate(sock, m, groupMetadata) {
        // Chat pribadi (PC / DM) langsung diproses tanpa arbitrase / jeda
        if (!m?.isGroup) return true

        const msgId = m?.key?.id
        if (!msgId) return true

        // 1. Jika socket yang memproses adalah Bot Utama
        if (this.isMainBot(sock)) {
            let claim = this.claims.get(msgId)
            if (!claim) {
                claim = {
                    claimant: 'main',
                    state: 'claimed',
                    timestamp: Date.now()
                }
                this.claims.set(msgId, claim)
            } else {
                claim.claimant = 'main'
                claim.state = 'claimed'
            }
            // Notifikasi JadiBot yang sedang menunggu bahwa Bot Utama menangani pesan ini
            this.emit(`claim:${msgId}`, 'main')
            return true
        }

        // 2. Jika socket yang memproses adalah JadiBot / Sub-Bot
        // Jika Bot Utama offline, crash, atau tidak sehat -> langsung ambil alih tanpa jeda
        if (!this.isMainBotHealthy()) {
            return this.claimFailover(msgId, sock)
        }

        // Jika Bot Utama tidak ada di dalam grup ini -> langsung proses normal
        if (!this.isMainBotInGroup(groupMetadata, sock)) {
            return this.claimFailover(msgId, sock)
        }

        // 3. Bot Utama sehat & ada di dalam grup ini
        // Cek apakah Bot Utama sudah mengklaim atau menyelesaikan pesan ini
        let claim = this.claims.get(msgId)
        if (claim?.claimant === 'main') {
            return false // Bot Utama sudah klaim, JadiBot yield
        }

        // Tunggu klaim / respon Bot Utama selama failover window
        const result = await this.waitForMainBot(msgId, this.FAILOVER_TIMEOUT_MS)
        if (result === 'claimed_by_main' || result === 'resolved') {
            return false // Bot Utama berhasil membalas / klaim, JadiBot yield
        }

        // Bot Utama tidak merespon (misal karena Bad MAC, session error, atau freeze)
        // JadiBot otomatis ambil alih (Failover)
        const tookOver = this.claimFailover(msgId, sock)
        if (tookOver) {
            const sockJid = (sock?.decodeJid ? sock.decodeJid(sock.user?.id || '') : sock?.user?.id || 'jadibot').split('@')[0]
            console.log(chalk.yellowBright(`⚡ [FAILOVER] Bot Utama tidak merespon di grup (Bad MAC / timeout). JadiBot (${sockJid}) mengambil alih respon untuk pesan ${msgId}.`))
        }
        return tookOver
    }

    /**
     * Menunggu Bot Utama mengklaim atau menyelesaikan pesan dengan batas waktu
     * @param {string} msgId 
     * @param {number} timeoutMs 
     * @returns {Promise<string>}
     */
    waitForMainBot(msgId, timeoutMs) {
        return new Promise((resolve) => {
            const current = this.claims.get(msgId)
            if (current?.state === 'resolved') return resolve('resolved')
            if (current?.claimant === 'main') return resolve('claimed_by_main')

            let timer = null
            const onClaim = (claimant) => {
                if (claimant === 'main') {
                    cleanup()
                    resolve('claimed_by_main')
                }
            }
            const onResolve = () => {
                cleanup()
                resolve('resolved')
            }

            const cleanup = () => {
                if (timer) clearTimeout(timer)
                this.removeListener(`claim:${msgId}`, onClaim)
                this.removeListener(`resolve:${msgId}`, onResolve)
            }

            timer = setTimeout(() => {
                cleanup()
                const latest = this.claims.get(msgId)
                if (latest?.state === 'resolved') return resolve('resolved')
                if (latest?.claimant === 'main') return resolve('claimed_by_main')
                resolve('timeout')
            }, timeoutMs)

            this.once(`claim:${msgId}`, onClaim)
            this.once(`resolve:${msgId}`, onResolve)
        })
    }

    /**
     * Tandai pesan telah selesai diproses oleh bot
     * @param {string} msgId 
     * @param {object} sock 
     */
    resolve(msgId, sock) {
        if (!msgId) return
        const sockJid = (sock?.decodeJid ? sock.decodeJid(sock.user?.id || '') : sock?.user?.id || 'unknown').split(':')[0]
        let claim = this.claims.get(msgId)
        if (!claim) {
            claim = {
                claimant: this.isMainBot(sock) ? 'main' : sockJid,
                state: 'resolved',
                timestamp: Date.now()
            }
            this.claims.set(msgId, claim)
        } else {
            claim.state = 'resolved'
            claim.resolvedBy = this.isMainBot(sock) ? 'main' : sockJid
        }
        this.emit(`resolve:${msgId}`, claim.resolvedBy)
    }

    /**
     * Bersihkan memori dari klaim yang sudah kedaluwarsa
     */
    cleanup() {
        const now = Date.now()
        for (const [msgId, claim] of this.claims.entries()) {
            if (now - claim.timestamp > this.CLAIM_TTL_MS) {
                this.claims.delete(msgId)
            }
        }
    }
}

export const botArbitrator = new BotArbitrator()
export default botArbitrator
