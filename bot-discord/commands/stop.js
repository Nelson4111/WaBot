/**
 * commands/stop.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Menghentikan musik, mengosongkan antrean, dan bot keluar dari VC.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        queue.delete()
        return interaction.reply({ embeds: [successEmbed('Musik dihentikan dan bot keluar dari VC. ⏹️')] })
    }
}
