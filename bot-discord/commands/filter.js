/**
 * commands/filter.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'
import { AUDIO_FILTERS, FILTER_CHOICES } from '../utils/filters.js'

export default {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Mengaktifkan efek audio: Nightcore, 8D, Vaporwave, Lo-Fi, dll.')
        .addStringOption(opt =>
            opt.setName('efek')
                .setDescription('Pilih efek yang ingin diaktifkan')
                .setRequired(true)
                .addChoices(...FILTER_CHOICES)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying()) {
            return interaction.editReply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')] })
        }
        const key    = interaction.options.getString('efek', true)
        const cfg    = AUDIO_FILTERS[key]
        const filterMap = Object.fromEntries(cfg.filters.map(f => [f, true]))

        // Matikan semua filter dulu, lalu aktifkan yang dipilih
        await queue.filters.ffmpeg.setFilters(filterMap)

        if (key === 'off') {
            return interaction.editReply({ embeds: [successEmbed('Semua filter audio dimatikan. 🎵')] })
        }
        return interaction.editReply({
            embeds: [successEmbed(`Filter **${cfg.label}** diaktifkan!\n_${cfg.description}_`)]
        })
    }
}
