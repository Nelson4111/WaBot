/**
 * events/interactionCreate.js
 * Menangani semua interaksi: slash commands + tombol interaktif
 */

import { useQueue } from 'discord-player'
import { QueueRepeatMode } from 'discord-player'
import { errorEmbed, createQueueEmbed } from '../utils/embed.js'

export default {
    name: 'interactionCreate',
    execute: async (interaction, client) => {

        // ── Slash Commands ──────────────────────────────────────────────
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return

            try {
                await command.execute(interaction, client)
            } catch (err) {
                console.error(`[BOT-DC] ❌ Error /${interaction.commandName}:`, err.message)
                const reply = { embeds: [errorEmbed('Terjadi error saat menjalankan perintah ini.')], ephemeral: true }
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply).catch(() => {})
                } else {
                    await interaction.reply(reply).catch(() => {})
                }
            }
            return
        }

        // ── Tombol Interaktif ───────────────────────────────────────────
        if (interaction.isButton()) {
            const queue = useQueue(interaction.guildId)
            if (!queue || !queue.isPlaying()) {
                return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
            }

            await interaction.deferUpdate().catch(() => {})

            switch (interaction.customId) {
                case 'music_pause':
                    if (queue.node.isPaused()) {
                        queue.node.resume()
                    } else {
                        queue.node.pause()
                    }
                    break

                case 'music_skip':
                    queue.node.skip()
                    break

                case 'music_stop':
                    queue.delete()
                    await interaction.channel.send({ embeds: [{ color: 0xED4245, description: '⏹️ Musik dihentikan.' }] }).catch(() => {})
                    break

                case 'music_loop': {
                    const nextMode = queue.repeatMode === QueueRepeatMode.OFF
                        ? QueueRepeatMode.TRACK
                        : QueueRepeatMode.OFF
                    queue.setRepeatMode(nextMode)
                    break
                }

                case 'music_queue': {
                    const embed = createQueueEmbed(queue, 1)
                    await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {})
                    break
                }
            }
        }
    }
}
