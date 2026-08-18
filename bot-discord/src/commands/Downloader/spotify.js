const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'spotify',
    aliases: ['sp', 'spotdl'],
    description: 'Cari info atau putar lagu Spotify langsung di voice channel.',
    category: 'Downloader',
    slashOptions: [
        {
            name: 'query',
            description: 'Link lagu / judul lagu Spotify',
            type: 3,
            required: true
        }
    ],
    args: true,
    usage: '<judul_atau_link>',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const query = interaction.options.getString('query')?.trim();
        return handleSpotify(interaction, query, client, true);
    },

    async execute(message, args, client) {
        const query = args.join(' ').trim();
        if (!query) {
            return message.reply('❌ Masukkan judul lagu atau link Spotify!\nContoh: `.spotify silhouette kana boon`');
        }
        return handleSpotify(message, query, client, false);
    }
};

async function handleSpotify(context, query, client, isSlash) {
    const playCmd = client.commands.get('play');
    if (playCmd) {
        // Forward ke engine musik Lavalink jika user sedang di Voice Channel
        const member = context.member;
        if (member && member.voice && member.voice.channel) {
            if (isSlash) return playCmd.slashExecute(context, client);
            return playCmd.execute(context, [query], client, client.prefix);
        }
    }

    const embed = new EmbedBuilder()
        .setColor('#1DB954')
        .setTitle('🎵 Spotify Music Player & Search')
        .setDescription(`Hasil pencarian untuk: **${query}**\n\n_Untuk memutar lagu ini di Voice Channel, bergabunglah ke voice channel lalu ketik:\n\`/play song:${query}\` atau \`.play ${query}\`_`)
        .setFooter({ text: 'Spotify Integration • NelMusic Engine' })
        .setTimestamp();

    if (isSlash) return context.reply({ embeds: [embed] });
    return context.reply({ embeds: [embed] });
}
