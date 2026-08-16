/**
 * commands/bassboost.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'
import { BASSBOOST_LEVELS } from '../utils/filters.js'

export default {
    data: new SlashCommandBuilder()
        .setName('bassboost')
        .setDescription('Menyalakan/mematikan efek Bassboost.')
        .addStringOption(opt =>
            opt.setName('level')
                .setDescription('Pilih level bassboost')
                .setRequired(true)
                .addChoices(
                    { name: '❌ Off',     value: 'off'    },
                    { name: '🔈 Low',     value: 'low'    },
                    { name: '🔉 Medium',  value: 'medium' },
                    { name: '🔊 Hard',    value: 'hard'   },
                )
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying()) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        const level   = interaction.options.getString('level', true)
        const filters = BASSBOOST_LEVELS[level]

        // Matikan semua bassboost filter dulu, lalu aktifkan yang dipilih
        const current = queue.filters.ffmpeg.filters
        const cleared = Object.fromEntries(
            Object.keys(current).map(k => [k, false])
        )
        await queue.filters.ffmpeg.setFilters({ ...cleared, ...Object.fromEntries(filters.map(f => [f, true])) })

        const labels = { off: '❌ Off', low: '🔈 Low', medium: '🔉 Medium', hard: '🔊 Hard' }
        return interaction.reply({ embeds: [successEmbed(`Bassboost diubah ke **${labels[level]}**!`)] })
    }
}
