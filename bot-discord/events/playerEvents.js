/**
 * events/playerEvents.js
 * Semua event dari discord-player (lagu mulai, antrean habis, dll)
 */

import { createNowPlayingEmbed, createControlButtons } from '../utils/embed.js'

export default function setupPlayerEvents(player) {

    // Saat lagu mulai diputar
    player.events.on('playerStart', (queue, track) => {
        const channel = queue.metadata?.channel
        if (!channel) return

        const embed = createNowPlayingEmbed(track, queue)
        const buttons = createControlButtons(
            queue.repeatMode !== 0,
            queue.metadata?.stayIn247 ?? false
        )

        channel.send({ embeds: [embed], components: [buttons] }).catch(console.error)
    })

    // Saat antrean habis
    player.events.on('emptyQueue', (queue) => {
        const channel = queue.metadata?.channel
        if (!channel) return
        channel.send({
            embeds: [{ color: 0x57F287, description: '✅ Antrean habis! Makasih udah dengerin bareng 🎵' }]
        }).catch(console.error)
    })

    // Saat VC kosong (semua user keluar)
    player.events.on('emptyChannel', (queue) => {
        if (queue.metadata?.stayIn247) return // Jangan keluar jika 24/7 aktif
        const channel = queue.metadata?.channel
        if (!channel) return
        channel.send({
            embeds: [{ color: 0xFEE75C, description: '👋 VC kosong, bot ikut keluar. Panggil lagi kalau butuh!' }]
        }).catch(console.error)
    })

    // Error pada level Voice Connection
    player.events.on('error', (queue, err) => {
        console.error(`[BOT-DC][Voice Error] di guild ${queue.guild?.name || 'Unknown'}:`, err.message)
        
        // Bersihkan queue jika koneksi voice dibatalkan atau terputus
        if (err.message?.includes('aborted') || err.message?.includes('destroyed')) {
            try {
                if (queue && !queue.deleted) queue.delete()
            } catch (_) {}
        }

        const channel = queue.metadata?.channel
        if (channel) {
            channel.send({
                embeds: [{ color: 0xED4245, description: `⚠️ Masalah koneksi audio: \`${err.message}\`` }]
            }).catch(() => {})
        }
    })

    // Error pada level Streaming / Audio Decoder
    player.events.on('playerError', (queue, err) => {
        console.error(`[BOT-DC][Stream Error] di guild ${queue.guild?.name || 'Unknown'}:`, err.message)
        const channel = queue.metadata?.channel
        if (channel) {
            channel.send({
                embeds: [{ color: 0xED4245, description: `⚠️ Gagal memutar track: \`${err.message}\`. Melewati ke lagu berikutnya...` }]
            }).catch(() => {})
        }
    })

    // Debug (bisa dimatikan di production)
    player.events.on('debug', (queue, msg) => {
        // console.debug(`[PLAYER DEBUG] ${msg}`)
    })
}
