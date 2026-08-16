/**
 * utils/embed.js
 * Template embed Discord yang cantik untuk semua pesan bot musik
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createProgressBar, msToTime } from './progressBar.js'

const COLOR_MAIN    = 0x5865F2  // Blurple Discord
const COLOR_SUCCESS = 0x57F287  // Hijau
const COLOR_ERROR   = 0xED4245  // Merah
const COLOR_WARNING = 0xFEE75C  // Kuning

/**
 * Embed untuk lagu yang sedang diputar (Now Playing)
 */
export function createNowPlayingEmbed(track, queue) {
    const timestamp = queue?.node?.getTimestamp()
    const currentMs = timestamp?.current?.value ?? 0
    const totalMs   = track.durationMS ?? 0
    const bar = createProgressBar(currentMs, totalMs)

    return new EmbedBuilder()
        .setColor(COLOR_MAIN)
        .setAuthor({ name: '▶️ Sedang Diputar' })
        .setTitle(track.title.length > 60 ? track.title.slice(0, 57) + '...' : track.title)
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: '👤 Artis', value: track.author || 'Unknown', inline: true },
            { name: '⏱️ Durasi', value: track.duration || 'Live', inline: true },
            { name: '🔊 Volume', value: `${queue?.node?.volume ?? 80}%`, inline: true },
            { name: '📊 Progress', value: `\`${bar}\`\n\`${msToTime(currentMs)} / ${track.duration || '∞'}\`` },
        )
        .setFooter({ text: `Diminta oleh ${track.requestedBy?.username || 'Unknown'} • Antrean: ${queue?.tracks?.size ?? 0} lagu` })
        .setTimestamp()
}

/**
 * Kontrol tombol interaktif (di-send saat lagu mulai)
 */
export function createControlButtons(loopEnabled = false, is247 = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_pause')
            .setLabel('⏯️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setLabel('⏭️ Skip')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('music_stop')
            .setLabel('⏹️ Stop')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('music_loop')
            .setLabel(loopEnabled ? '🔁 Loop ON' : '🔁 Loop')
            .setStyle(loopEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_queue')
            .setLabel('📋 Queue')
            .setStyle(ButtonStyle.Secondary),
    )
}

/**
 * Embed antrean lagu
 */
export function createQueueEmbed(queue, page = 1) {
    const tracks    = queue.tracks.toArray()
    const perPage   = 10
    const totalPages = Math.max(Math.ceil(tracks.length / perPage), 1)
    page = Math.max(1, Math.min(page, totalPages))
    const start     = (page - 1) * perPage
    const pageTracks = tracks.slice(start, start + perPage)
    const current   = queue.currentTrack

    const desc = [
        current ? `**▶️ Sekarang:** [${current.title}](${current.url}) — \`${current.duration}\`` : null,
        pageTracks.length > 0
            ? '\n' + pageTracks.map((t, i) =>
                `**${start + i + 1}.** [${t.title}](${t.url}) — \`${t.duration}\``
              ).join('\n')
            : '\n_Antrean kosong._'
    ].filter(Boolean).join('\n')

    return new EmbedBuilder()
        .setColor(COLOR_MAIN)
        .setTitle('📋 Daftar Antrean')
        .setDescription(desc)
        .setFooter({ text: `Halaman ${page}/${totalPages} • Total: ${tracks.length} lagu` })
}

/**
 * Embed pesan error
 */
export function errorEmbed(message) {
    return new EmbedBuilder().setColor(COLOR_ERROR).setDescription(`❌ ${message}`)
}

/**
 * Embed pesan sukses
 */
export function successEmbed(message) {
    return new EmbedBuilder().setColor(COLOR_SUCCESS).setDescription(`✅ ${message}`)
}

/**
 * Embed pesan info/warning
 */
export function infoEmbed(message) {
    return new EmbedBuilder().setColor(COLOR_WARNING).setDescription(`ℹ️ ${message}`)
}
