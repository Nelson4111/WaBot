/**
 * commands/shuffle.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Mengacak urutan antrean lagu.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue || queue.tracks.size < 2) {
            return interaction.reply({ embeds: [errorEmbed('Antrean harus berisi minimal 2 lagu untuk diacak.')], ephemeral: true })
        }
        queue.tracks.shuffle()
        return interaction.reply({ embeds: [successEmbed(`Antrean dengan **${queue.tracks.size}** lagu berhasil diacak! 🔀`)] })
    }
}
