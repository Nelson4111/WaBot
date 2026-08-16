/**
 * commands/queue.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, createQueueEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Melihat daftar antrean lagu.')
        .addIntegerOption(opt =>
            opt.setName('halaman')
                .setDescription('Nomor halaman yang ingin dilihat')
                .setMinValue(1)
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue || (!queue.currentTrack && queue.tracks.size === 0)) {
            return interaction.reply({ embeds: [errorEmbed('Antrean kosong.')], ephemeral: true })
        }
        const page  = interaction.options.getInteger('halaman') ?? 1
        const embed = createQueueEmbed(queue, page)
        return interaction.reply({ embeds: [embed] })
    }
}
