/**
 * commands/nowplaying.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, createNowPlayingEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Melihat lagu yang sedang diputar beserta progress bar.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying() || !queue.currentTrack) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        const embed = createNowPlayingEmbed(queue.currentTrack, queue)
        return interaction.reply({ embeds: [embed] })
    }
}
