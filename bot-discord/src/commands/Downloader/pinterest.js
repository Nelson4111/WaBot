const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'pinterest',
    aliases: ['pin', 'pindl'],
    description: 'Cari gambar HD dari Pinterest sesuai kata kunci.',
    category: 'Downloader',
    slashOptions: [
        {
            name: 'query',
            description: 'Kata kunci gambar yang ingin dicari di Pinterest',
            type: 3,
            required: true
        }
    ],
    args: true,
    usage: '<kata_kunci>',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const query = interaction.options.getString('query')?.trim();
        return handlePinterest(interaction, query, client, true);
    },

    async execute(message, args, client) {
        const query = args.join(' ').trim();
        if (!query) {
            return message.reply('❌ Masukkan kata kunci pencarian Pinterest!\nContoh: `.pinterest anime wallpaper 4k`');
        }
        return handlePinterest(message, query, client, false);
    }
};

async function handlePinterest(context, query, client, isSlash) {
    if (isSlash) await context.deferReply();
    else if (typeof context.channel?.sendTyping === 'function') context.channel.sendTyping().catch(() => {});

    try {
        const apiUrl = `https://api.agatz.xyz/api/pinterest?message=${encodeURIComponent(query)}`;
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
        const json = await res.json();

        const results = json.data || json.result || [];
        if (!Array.isArray(results) || results.length === 0) {
            const err = `❌ Tidak ditemukan gambar untuk pencarian: **${query}**`;
            return isSlash ? context.editReply(err) : context.reply(err);
        }

        const randomImage = results[Math.floor(Math.random() * results.length)];
        const imageUrl = typeof randomImage === 'string' ? randomImage : (randomImage.images_url || randomImage.url);

        const embed = new EmbedBuilder()
            .setColor('#E60023')
            .setTitle(`📌 Pinterest: ${query.slice(0, 50)}`)
            .setImage(imageUrl)
            .setFooter({ text: `Ditemukan ${results.length} gambar • NelBot Search Engine` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Buka Gambar Asli').setStyle(ButtonStyle.Link).setURL(imageUrl)
        );

        if (isSlash) return await context.editReply({ embeds: [embed], components: [row] });
        return await context.reply({ embeds: [embed], components: [row] });
    } catch (err) {
        console.error('[Pinterest Error]', err);
        const errMsg = '❌ Gagal mengambil gambar dari Pinterest. Coba beberapa saat lagi.';
        if (isSlash) return await context.editReply(errMsg);
        return await context.reply(errMsg);
    }
}
