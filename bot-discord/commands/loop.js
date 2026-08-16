/**
 * commands/loop.js
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue, QueueRepeatMode } from 'discord-player'
import { errorEmbed, successEmbed } from '../utils/embed.js'

const MODES = {
    off:   { mode: QueueRepeatMode.OFF,   label: '❌ Loop Off',      desc: 'Loop dimatikan.' },
    track: { mode: QueueRepeatMode.TRACK, label: '🔂 Loop Lagu',    desc: 'Mengulang lagu yang sedang diputar.' },
    queue: { mode: QueueRepeatMode.QUEUE, label: '🔁 Loop Antrean', desc: 'Mengulang seluruh antrean.' },
}

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Mengulang satu lagu atau seluruh antrean.')
        .addStringOption(opt =>
            opt.setName('mode')
                .setDescription('Pilih mode loop')
                .setRequired(true)
                .addChoices(
                    { name: '❌ Off — Matikan loop',               value: 'off'   },
                    { name: '🔂 Track — Ulang satu lagu',          value: 'track' },
                    { name: '🔁 Queue — Ulang seluruh antrean',    value: 'queue' },
                )
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue?.isPlaying()) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar.')], ephemeral: true })
        }
        const key  = interaction.options.getString('mode', true)
        const cfg  = MODES[key]
        queue.setRepeatMode(cfg.mode)
        return interaction.reply({ embeds: [successEmbed(`**${cfg.label}** — ${cfg.desc}`)] })
    }
}
