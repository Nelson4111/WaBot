/**
 * commands/play.js
 * Memutar lagu dari YouTube, Spotify, atau SoundCloud
 */

import { SlashCommandBuilder } from 'discord.js'
import { useMainPlayer, QueryType } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'
import { resolveAndDownloadAudio } from '../utils/musicDownloader.js'

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Memutar lagu dari YouTube, Spotify, atau SoundCloud.')
        .addStringOption(opt =>
            opt.setName('query')
                .setDescription('Judul lagu atau link (YouTube / Spotify / SoundCloud)')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const player  = useMainPlayer()
        const query   = interaction.options.getString('query', true)
        const channel = interaction.member?.voice?.channel

        if (!channel) {
            return interaction.editReply({ embeds: [errorEmbed('Kamu harus masuk **Voice Channel** dulu!')] })
        }

        const botVc = interaction.guild.members.me?.voice?.channel
        if (botVc && botVc.id !== channel.id) {
            return interaction.editReply({ embeds: [errorEmbed(`Bot sedang di VC lain: **${botVc.name}**. Masuk ke sana dulu!`)] })
        }

        // Bersihkan queue lama jika koneksi voice sebelumnya mati/terputus
        const existingQueue = player.nodes.get(interaction.guildId)
        if (existingQueue && !existingQueue.connection) {
            existingQueue.delete()
        }

        try {
            // 1. Download atau ambil audio dari cache lokal via API tunnel
            const audioData = await resolveAndDownloadAudio(query)

            // 2. Putar file lokal di Voice Channel via discord-player
            const { track } = await player.play(channel, audioData.filePath, {
                searchEngine: QueryType.FILE,
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        stayIn247: false,
                    },
                    selfDeaf: true,
                    volume: 80,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 60_000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 60_000,
                    connectionTimeout: 60_000,
                    bufferingTimeout: 10_000,
                },
                requestedBy: interaction.user,
            })

            // 3. Pasang metadata lengkap lagu asli ke track object
            track.title = audioData.title
            track.author = audioData.artist
            track.duration = audioData.duration
            track.thumbnail = audioData.thumbnail
            track.url = audioData.url

            return interaction.editReply({
                embeds: [{
                    color: 0x5865F2,
                    description: `🎵 **[${track.title}](${track.url})** ditambahkan ke antrean!`,
                    thumbnail: { url: track.thumbnail },
                    fields: [
                        { name: '👤 Artis', value: track.author || 'Unknown', inline: true },
                        { name: '⏱️ Durasi', value: track.duration || 'Live', inline: true },
                        { name: '⚡ Mode', value: audioData.fromCache ? '💾 Instant (Cache)' : '📥 Pre-Downloaded (HD)', inline: true },
                    ]
                }]
            })
        } catch (err) {
            console.error('[BOT-DC] /play error:', err.message)
            return interaction.editReply({ embeds: [errorEmbed(`Tidak bisa memutar: **${query}**\n\`${err.message}\``)] })
        }
    }
}
