/**
 * commands/skip.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Melewati lagu yang sedang diputar.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying()) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        const current = queue.currentTrack
        queue.node.skip()
        return interaction.reply({ embeds: [successEmbed(`Melewati **${current?.title || 'lagu saat ini'}**! ⏭️`)] })
    }
}
