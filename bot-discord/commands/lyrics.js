/**
 * commands/lyrics.js
 * Menampilkan lirik lagu yang sedang diputar menggunakan Genius
 */
import { SlashCommandBuilder } from 'discord.js'
import { useQueue } from 'discord-player'
import Genius from 'genius-lyrics'
import { errorEmbed } from '../utils/embed.js'

const GeniusClient = new Genius.Client() // Tidak butuh API key untuk search dasar

export default {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Menampilkan lirik lagu yang sedang diputar.')
        .addStringOption(opt =>
            opt.setName('judul')
                .setDescription('Judul lagu (kosongkan untuk lagu yang sedang diputar)')
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const queue   = useQueue(interaction.guildId)
        const manual  = interaction.options.getString('judul')
        const current = queue?.currentTrack

        if (!manual && !current) {
            return interaction.editReply({ embeds: [errorEmbed('Tidak ada musik yang sedang diputar. Gunakan opsi `judul` untuk mencari lirik manual.')] })
        }

        const query = manual || `${current.title} ${current.author}`

        try {
            const searches = await GeniusClient.songs.search(query)
            if (!searches?.length) {
                return interaction.editReply({ embeds: [errorEmbed(`Lirik tidak ditemukan untuk: **${query}**`)] })
            }

            const song   = searches[0]
            const lyrics = await song.lyrics()

            if (!lyrics) {
                return interaction.editReply({ embeds: [errorEmbed('Lirik tersedia tapi tidak bisa diambil saat ini.')] })
            }

            // Potong jika terlalu panjang (Discord embed max 4096 char)
            const maxLen    = 3900
            const trimmed   = lyrics.length > maxLen ? lyrics.slice(0, maxLen) + '\n\n...' : lyrics
            const isTrimmed = lyrics.length > maxLen

            return interaction.editReply({
                embeds: [{
                    color: 0xFFFF64,
                    author: { name: '🎤 Lirik Lagu' },
                    title: song.title,
                    url:   song.url,
                    thumbnail: { url: song.thumbnail },
                    description: `\`\`\`\n${trimmed}\n\`\`\``,
                    footer: isTrimmed
                        ? { text: '⚠️ Lirik dipotong karena terlalu panjang. Lihat lengkap di Genius.' }
                        : { text: 'Sumber: Genius' }
                }]
            })
        } catch (err) {
            console.error('[BOT-DC] /lyrics error:', err.message)
            return interaction.editReply({ embeds: [errorEmbed(`Gagal mengambil lirik: \`${err.message}\``)] })
        }
    }
}
