import chalk from 'chalk'
import { syncTwilyFromDb } from '../../lib/twilyGenData.js'
import { mergeUserData } from '../../lib/simple.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db) return m.reply('❌ Sistem database tidak aktif.')

    const action = (text || 'push').toLowerCase().trim()
    const startTime = Date.now()

    if (action === 'push') {
        m.reply('⏳ *[SUPABASE SYNC]* Mendorong seluruh data memori ke Supabase Cloud & backup lokal...')
        try {
            if (global.db.data) global.db.data._forceFullSync = true
            await global.db.write()
            const duration = ((Date.now() - startTime) / 1000).toFixed(2)
            const userCount = Object.keys(global.db.data?.users || {}).length
            const chatCount = Object.keys(global.db.data?.chats || {}).length

            m.reply(`✅ *[SYNC BERHASIL]*\n\n` +
                `• Arah: *RAM ➔ Supabase Cloud & Backup Lokal (Push)*\n` +
                `• Pengguna: *${userCount}*\n` +
                `• Obrolan: *${chatCount}*\n` +
                `• Waktu proses: *${duration}s*\n\n` +
                `_Seluruh perubahan lokal dan data RPG berhasil disimpan aman._`)
        } catch (err) {
            console.error('[SYNC PUSH ERROR]', err)
            m.reply(`❌ *Gagal melakukan push ke Supabase:*\n${err?.message || err}`)
        }
    } else if (action === 'pull') {
        m.reply('⏳ *[SUPABASE SYNC]* Mengambil data dari Supabase Cloud & menggabungkan dengan memori...')
        try {
            if (typeof global.db.adapter?.read === 'function') {
                const refreshedData = await global.db.adapter.read()
                if (refreshedData && typeof refreshedData === 'object') {
                    // Safe merge: jangan langsung timpa RAM agar progres yang belum ter-push tidak hilang
                    if (refreshedData.users && global.db.data?.users) {
                        for (const [jid, remoteUser] of Object.entries(refreshedData.users)) {
                            if (global.db.data.users[jid]) {
                                mergeUserData(global.db.data.users[jid], remoteUser)
                            } else {
                                global.db.data.users[jid] = remoteUser
                            }
                        }
                    }
                    if (refreshedData.chats && global.db.data?.chats) {
                        Object.assign(global.db.data.chats, refreshedData.chats)
                    }
                    if (refreshedData.settings && global.db.data?.settings) {
                        Object.assign(global.db.data.settings, refreshedData.settings)
                    }
                    syncTwilyFromDb(true)
                    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
                    const userCount = Object.keys(global.db.data?.users || {}).length
                    const chatCount = Object.keys(global.db.data?.chats || {}).length

                    m.reply(`✅ *[SYNC PULL BERHASIL]*\n\n` +
                        `• Arah: *Supabase Cloud ➔ RAM (Safe Merge)*\n` +
                        `• Pengguna: *${userCount}*\n` +
                        `• Obrolan: *${chatCount}*\n` +
                        `• Waktu proses: *${duration}s*\n\n` +
                        `_Data cloud berhasil disinkronkan ke RAM tanpa menghilangkan progres game user._`)
                } else {
                    throw new Error('Data yang dikembalikan kosong')
                }
            } else {
                await global.loadDatabase()
                m.reply(`✅ *[RELOAD BERHASIL]* Database berhasil dimuat ulang.`)
            }
        } catch (err) {
            console.error('[SYNC PULL ERROR]', err)
            m.reply(`❌ *Gagal menarik data dari Supabase:*\n${err?.message || err}`)
        }
    } else {
        m.reply(`ℹ️ *Format Perintah:*\n• *${usedPrefix + command} push* (Simpan RAM ke Supabase & Backup)\n• *${usedPrefix + command} pull* (Tarik data Supabase ke RAM secara aman)`)
    }
}

handler.help = ['syncdb [pull/push]']
handler.tags = ['owner']
handler.command = /^(syncdb|syncsupabase)$/i
handler.owner = true

export default handler
