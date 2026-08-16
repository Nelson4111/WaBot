/**
 * commands/247.js
 * Bot tetap nongkrong di VC 24 jam nonstop
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import { errorEmbed, successEmbed, infoEmbed } from '../utils/embed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggle 24/7 mode — bot tetap di VC walau antrean kosong.'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId)
        if (!queue) {
            return interaction.reply({ embeds: [errorEmbed('Tidak ada sesi musik aktif. Gunakan **/play** dulu.')], ephemeral: true })
        }
        const current = queue.metadata?.stayIn247 ?? false
        queue.metadata = { ...queue.metadata, stayIn247: !current }

        if (!current) {
            return interaction.reply({ embeds: [successEmbed('Mode **24/7** aktif! Bot akan tetap di VC walau antrean kosong. 🔒')] })
        } else {
            return interaction.reply({ embeds: [infoEmbed('Mode **24/7** dimatikan. Bot akan keluar jika VC kosong.')] })
        }
    }
}
