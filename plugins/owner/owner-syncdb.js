import chalk from 'chalk'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db) return m.reply('❌ Sistem database tidak aktif.')

    const action = (text || 'pull').toLowerCase().trim()
    const startTime = Date.now()

    if (action === 'push') {
        m.reply('⏳ *[SUPABASE SYNC]* Mendorong seluruh data memori ke Supabase Cloud...')
        try {
            await global.db.write()
            const duration = ((Date.now() - startTime) / 1000).toFixed(2)
            const userCount = Object.keys(global.db.data?.users || {}).length
            const chatCount = Object.keys(global.db.data?.chats || {}).length

            m.reply(`✅ *[SYNC BERHASIL]*\n\n` +
                `• Arah: *RAM ➔ Supabase Cloud (Push)*\n` +
                `• Pengguna: *${userCount}*\n` +
                `• Obrolan: *${chatCount}*\n` +
                `• Waktu proses: *${duration}s*\n\n` +
                `_Seluruh perubahan lokal berhasil disimpan di database cloud._`)
        } catch (err) {
            console.error('[SYNC PUSH ERROR]', err)
            m.reply(`❌ *Gagal melakukan push ke Supabase:*\n${err?.message || err}`)
        }
    } else {
        m.reply('⏳ *[SUPABASE SYNC]* Mengambil data terbaru dari Supabase Cloud...')
        try {
            if (typeof global.db.adapter?.read === 'function') {
                const refreshedData = await global.db.adapter.read()
                if (refreshedData && typeof refreshedData === 'object') {
                    global.db.data = refreshedData
                    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
                    const userCount = Object.keys(global.db.data?.users || {}).length
                    const chatCount = Object.keys(global.db.data?.chats || {}).length

                    m.reply(`✅ *[SYNC BERHASIL]*\n\n` +
                        `• Arah: *Supabase Cloud ➔ RAM (Pull)*\n` +
                        `• Pengguna: *${userCount}*\n` +
                        `• Obrolan: *${chatCount}*\n` +
                        `• Waktu proses: *${duration}s*\n\n` +
                        `_Data memori bot kini sinkron dengan perubahan terbaru di dashboard Supabase._`)
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
    }
}

handler.help = ['syncdb [pull/push]']
handler.tags = ['owner']
handler.command = /^(syncdb|syncsupabase)$/i
handler.owner = true

export default handler
