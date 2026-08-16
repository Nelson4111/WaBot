/**
 * commands/pause.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed, infoEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Menjeda lagu yang sedang diputar.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying()) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        if (queue.node.isPaused()) {
            return interaction.reply({ embeds: [infoEmbed('Musik sudah dijeda. Gunakan **/resume** untuk melanjutkan.')] })
        }
        queue.node.pause()
        return interaction.reply({ embeds: [successEmbed('Musik dijeda. ⏸️ Gunakan **/resume** untuk melanjutkan.')] })
    }
}
