/**
 * commands/volume.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Mengubah volume bot (1-200%).')
        .addIntegerOption(opt =>
            opt.setName('nilai')
                .setDescription('Volume yang diinginkan (1-200)')
                .setMinValue(1)
                .setMaxValue(200)
                .setRequired(true)
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying()) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        const vol = interaction.options.getInteger('nilai', true)
        queue.node.setVolume(vol)
        const emoji = vol === 0 ? '🔇' : vol < 50 ? '🔈' : vol < 150 ? '🔉' : '🔊'
        return interaction.reply({ embeds: [successEmbed(`Volume diubah ke **${vol}%** ${emoji}`)] })
    }
}
