/**
 * commands/resume.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed, infoEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Melanjutkan lagu yang dijeda.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        if (!queue.node.isPaused()) {
            return interaction.reply({ embeds: [infoEmbed('Musik tidak sedang dijeda.')] })
        }
        queue.node.resume()
        return interaction.reply({ embeds: [successEmbed('Musik dilanjutkan. ▶️')] })
    }
}
