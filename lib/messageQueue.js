import chalk from 'chalk'

/**
 * lib/messageQueue.js
 * 
 * Sistem Antrean Cerdas (Tiered Smart Message Queue):
 * 1. Per-Chat Serializer: Memastikan pesan dalam 1 grup/chat dieksekusi berurutan (mencegah race condition RPG/Werewolf).
 * 2. Global Concurrency Limiter: Membatasi beban CPU dengan menjalankan maksimal N proses serentak secara global (default 6).
 * 3. Smart Stale Guard: Memberikan toleransi waktu lebih lama untuk perintah (command) daripada obrolan santai biasa.
 * 4. Memory Leak Prevention: Membersihkan entri antrean chat dari Map begitu antrean selesai/idle.
 * 5. Telemetry: Statistik pemantauan beban antrean realtime.
 */

class MessageQueue {
    constructor(options = {}) {
        this.maxConcurrent = options.maxConcurrent || 6
        this.activeConcurrent = 0
        this.chatQueues = new Map() // Map<jid, Array<{ id, message, taskFn, resolve, reject, meta }>>
        this.waitingChats = []      // FIFO antrean JID yang menunggu slot global
        
        // Statistik pemantauan
        this.stats = {
            totalEnqueued: 0,
            totalProcessed: 0,
            totalTimedOut: 0,
            totalErrors: 0,
            totalStaleDropped: 0
        }
    }

    /**
     * Masukkan tugas pemrosesan pesan ke antrean grup/chat terkait.
     * @param {string} jid JID pengirim/grup
     * @param {object} message Objek raw message Baileys
     * @param {function} taskFn Fungsi asinkron yang memproses pesan
     * @param {object} meta Metadata pendukung (msgId, timestamp, dll)
     */
    enqueue(jid, message, taskFn, meta = {}) {
        const targetJid = jid || '__global__'
        this.stats.totalEnqueued++

        return new Promise((resolve, reject) => {
            const taskItem = {
                id: meta.msgId || message?.key?.id || Math.random().toString(36).slice(2),
                jid: targetJid,
                message,
                taskFn,
                meta,
                resolve,
                reject,
                enqueuedAt: Date.now()
            }

            let queue = this.chatQueues.get(targetJid)
            if (!queue) {
                queue = []
                this.chatQueues.set(targetJid, queue)
                queue.push(taskItem)
                
                // Daftarkan grup ini ke antrean global
                this.waitingChats.push(targetJid)
                this._dispatchNext()
            } else {
                // Antrean di grup ini sedang berjalan, tambahkan ke antrean grup
                queue.push(taskItem)
            }
        })
    }

    /**
     * Jadwalkan tugas berikutnya jika slot konkurensi global masih tersedia.
     */
    _dispatchNext() {
        while (this.activeConcurrent < this.maxConcurrent && this.waitingChats.length > 0) {
            const jid = this.waitingChats.shift()
            const queue = this.chatQueues.get(jid)

            if (!queue || queue.length === 0) {
                this.chatQueues.delete(jid)
                continue
            }

            const currentTask = queue[0]
            this.activeConcurrent++

            this._runTask(jid, currentTask).finally(() => {
                this.activeConcurrent--

                // Hapus tugas yang baru saja selesai dari antrean grup
                const currentQueue = this.chatQueues.get(jid)
                if (currentQueue) {
                    currentQueue.shift()
                    if (currentQueue.length > 0) {
                        // Masih ada pesan lain di grup ini, masukkan kembali ke antrean global
                        this.waitingChats.push(jid)
                    } else {
                        // Antrean di grup ini sudah habis, hapus dari Map untuk cegah memory leak
                        this.chatQueues.delete(jid)
                    }
                }

                // Terus jalankan tugas berikutnya jika ada slot
                this._dispatchNext()
            })
        }
    }

    /**
     * Jalankan 1 tugas pesan dengan batas timeout aman.
     */
    async _runTask(jid, task) {
        const timeoutMs = task.meta.timeoutMs || 25000 // 25 detik per pesan
        const startTime = Date.now()

        let timer
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => {
                this.stats.totalTimedOut++
                reject(new Error(`TIMEOUT setelah ${timeoutMs}ms untuk pesan id=${task.id} dari=${jid}`))
            }, timeoutMs)
        })

        try {
            const result = await Promise.race([
                task.taskFn(),
                timeoutPromise
            ])
            clearTimeout(timer)
            this.stats.totalProcessed++
            task.resolve(result)
        } catch (err) {
            clearTimeout(timer)
            this.stats.totalErrors++
            task.reject(err)
        }
    }

    /**
     * Dapatkan ringkasan status antrean saat ini.
     */
    getStats() {
        let queuedMessagesCount = 0
        for (const [_, queue] of this.chatQueues) {
            queuedMessagesCount += queue.length
        }

        return {
            activeWorkers: this.activeConcurrent,
            maxWorkers: this.maxConcurrent,
            waitingChats: this.waitingChats.length,
            queuedMessages: queuedMessagesCount,
            activeChatsCount: this.chatQueues.size,
            ...this.stats
        }
    }
}

// Instance singleton global
export const globalMessageQueue = new MessageQueue({ maxConcurrent: 6 })

/**
 * Cek apakah pesan kadaluarsa secara cerdas (Smart Stale Guard).
 * - Pesan Command / Tombol: Diberi toleransi hingga 180 detik (3 menit) saat bot sibuk.
 * - Pesan Obrolan Biasa: Dibatasi maksimal 60 detik agar tidak terjadi spam replay.
 * 
 * @param {object} m Objek pesan smsg
 * @param {object} options Opsi batas waktu kustom
 * @returns {boolean} true jika pesan sudah kadaluarsa dan harus di-drop
 */
export function isMessageStale(m, options = {}) {
    if (!m) return false

    const rawTimestamp = m.messageTimestamp ? (typeof m.messageTimestamp === 'object' ? (m.messageTimestamp.low || m.messageTimestamp) : m.messageTimestamp) : null
    if (!rawTimestamp) return false

    const msgAgeSec = Math.floor((Date.now() - (rawTimestamp * 1000)) / 1000)
    
    // Abaikan jika timestamp di masa depan atau anomali
    if (msgAgeSec < 0) return false

    // Deteksi apakah pesan merupakan interaksi perintah
    const text = String(m.text || '').trim()
    const isInteractive = m.mtype && [
        'buttonsResponseMessage',
        'templateButtonReplyMessage',
        'listResponseMessage',
        'interactiveResponseMessage'
    ].includes(m.mtype)

    const hasCommandPrefix = /^[.#!/\\]/.test(text)
    const isCommand = isInteractive || hasCommandPrefix || Boolean(m.isCommand)

    // Toleransi: 180 detik untuk command saat bot padat, 60 detik untuk chat biasa
    const maxAgeSec = options.maxAgeSec || (isCommand ? 180 : 60)

    if (msgAgeSec > maxAgeSec) {
        globalMessageQueue.stats.totalStaleDropped++
        console.log(chalk.yellow(`⏱️ [SMART STALE DROP] Pesan ${isCommand ? 'COMMAND' : 'CHAT'} kadaluarsa (${msgAgeSec}s > ${maxAgeSec}s), id=${m.key?.id} chat=${m.chat}`))
        return true
    }

    return false
}
