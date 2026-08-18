const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'ttdl', 'tiktokdl', 'vt'],
    description: 'Download video atau audio dari TikTok tanpa watermark.',
    category: 'Downloader',
    slashOptions: [
        {
            name: 'url',
            description: 'Link video TikTok yang ingin diunduh',
            type: 3, // STRING
            required: true
        }
    ],
    args: true,
    usage: '<url_tiktok>',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const url = interaction.options.getString('url')?.trim();
        return handleTikTok(interaction, url, client, true);
    },

    async execute(message, args, client) {
        const url = args[0]?.trim();
        if (!url) {
            return message.reply('❌ Masukkan URL video TikTok!\nContoh: `.tiktok https://vt.tiktok.com/xxxx/`');
        }
        return handleTikTok(message, url, client, false);
    }
};

async function handleTikTok(context, url, client, isSlash) {
    if (!/tiktok\.com/i.test(url)) {
        const err = '❌ URL tidak valid. Pastikan link berasal dari domain `tiktok.com` atau `vt.tiktok.com`.';
        return isSlash ? context.reply({ content: err, ephemeral: true }) : context.reply(err);
    }

    if (isSlash) await context.deferReply();
    else if (typeof context.channel?.sendTyping === 'function') context.channel.sendTyping().catch(() => {});

    try {
        const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
        const json = await res.json();

        if (!json || (!json.video && !json.images)) {
            const msg = '❌ Gagal mengunduh video TikTok. Pastikan video tidak di-private atau link benar.';
            return isSlash ? context.editReply(msg) : context.reply(msg);
        }

        const authorName = json.author?.name || json.author?.unique_id || 'TikTok Creator';
        const title = json.title || 'No Title';
        const stats = `❤️ ${json.stats?.likeCount || 0} | 💬 ${json.stats?.commentCount || 0} | 🔁 ${json.stats?.shareCount || 0}`;

        const embed = new EmbedBuilder()
            .setColor('#00D4FF')
            .setAuthor({ name: `TikTok Downloader: ${authorName}`, iconURL: json.author?.avatar })
            .setTitle(title.slice(0, 250))
            .setURL(url)
            .addFields(
                { name: '📊 Statistik', value: stats, inline: true },
                { name: '🎵 Musik / Audio', value: json.music?.title ? `${json.music.title} (${json.music.author})` : 'Original Sound', inline: true }
            )
            .setFooter({ text: 'NelBot Downloader Engine' })
            .setTimestamp();

        const row = new ActionRowBuilder();
        if (json.video?.noWatermark) {
            row.addComponents(
                new ButtonBuilder().setLabel('Download Video HD').setStyle(ButtonStyle.Link).setURL(json.video.noWatermark)
            );
        }
        if (json.music?.play_url) {
            row.addComponents(
                new ButtonBuilder().setLabel('Download Audio/MP3').setStyle(ButtonStyle.Link).setURL(json.music.play_url)
            );
        }

        const payload = { embeds: [embed] };
        if (row.components.length > 0) payload.components = [row];

        if (isSlash) return await context.editReply(payload);
        return await context.reply(payload);
    } catch (err) {
        console.error('[TikTok DL Error]', err);
        const errMsg = '❌ Terjadi kesalahan saat memproses video TikTok. Coba beberapa saat lagi.';
        if (isSlash) return await context.editReply(errMsg);
        return await context.reply(errMsg);
    }
}
