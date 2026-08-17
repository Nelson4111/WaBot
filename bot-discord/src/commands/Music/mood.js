const {
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags,
    PermissionsBitField
} = require("discord.js");
const LastFM = require("../../utils/lastfm");

async function startMoodRadio(message, tag, label, client, statusMsg, searchKeyword = "", regionValue = "indonesia") {
    const author = message.author || message.user;
    const member = message.member;
    const channel = member?.voice?.channel;

    const updateStatus = async (content, isError = false) => {
        const display = new TextDisplayBuilder()
            .setContent(isError ? `**${client.emoji.cross || "❌"} ${content}**` : `**${client.emoji.info || "ℹ️"} ${content}**`);
        const container = new ContainerBuilder().addTextDisplayComponents(display);
        await statusMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    };

    if (!channel) {
        return await updateStatus("Kamu harus berada di Voice Channel terlebih dahulu!", true);
    }

    try {
        await updateStatus(`Mencari lagu untuk playlist **${label}**...`);

        let tracks = [];
        try {
            const lastfm = new LastFM(client);
            tracks = await lastfm.getTopTracksByTag(tag, 20);
        } catch (err) {
            console.error("[Mood] LastFM fetch error:", err.message);
        }

        let player = client.manager.players.get(message.guild.id);
        if (!player) {
            player = await client.manager.createPlayer({
                guildId: message.guild.id,
                voiceId: channel.id,
                textId: message.channel.id,
                volume: 80,
                deaf: true,
            });
        }

        let searchEngine = client.config.node_source || 'spsearch';
        try {
            const userPref = client.db.userpreferences.get(author.id);
            if (userPref?.musicSource) {
                searchEngine = userPref.musicSource;
            }
        } catch (error) {
            console.error("Error fetching user preference:", error);
        }

        let originalQueued = 0;

        if (tracks && tracks.length > 0) {
            for (let i = tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }

            await updateStatus(`Memuat lagu untuk **${label}** radio...`);

            for (const t of tracks.slice(0, 6)) {
                const query = `${t.author} ${t.title}`.trim();
                let result = await client.manager.search(query, { requester: author, engine: searchEngine });
                if (!result || !result.tracks || !result.tracks.length) {
                    result = await client.manager.search(query, { requester: author, engine: 'spsearch' });
                }
                if (!result || !result.tracks || !result.tracks.length) {
                    result = await client.manager.search(query, { requester: author, engine: 'scsearch' });
                }

                if (result && result.tracks && result.tracks.length > 0) {
                    player.queue.add(result.tracks[0]);
                    originalQueued++;
                }
            }
        }

        // Fallback jika LastFM kosong atau tidak menemukan lagu
        if (originalQueued === 0) {
            await updateStatus(`Mencari rekomendasi kurasi playlist **${label}**...`);
            const fallbackMap = {
                indonesia: ["lagu pop indonesia hits", "lagu galau indonesia", "indie pop indonesia", "lagu santai indonesia"],
                dangdut: ["dangdut koplo terbaru", "lagu ambyar koplo", "dangdut akustik", "campursari koplo hits"],
                "j-pop": ["top anime songs", "j-pop hits", "japanese lofi chill", "j-pop popular"],
                global: ["today's top hits", "viral pop hits", "chill lofi beats", "party dance hits"],
                english: ["english pop hits", "chill acoustic pop", "sad pop songs", "love songs english"]
            };

            const queries = fallbackMap[regionValue] || [`${label} playlist songs`];
            const chosenQuery = queries[Math.floor(Math.random() * queries.length)];
            const searchRes = await client.manager.search(chosenQuery, { requester: author, engine: searchEngine });

            if (searchRes && searchRes.tracks && searchRes.tracks.length > 0) {
                for (const tr of searchRes.tracks.slice(0, 8)) {
                    player.queue.add(tr);
                    originalQueued++;
                }
            }
        }

        if (originalQueued === 0) {
            return await updateStatus(`Tidak dapat menemukan lagu yang cocok untuk: **${label}**.`, true);
        }

        player.data?.set("autoplay", true);

        if (!player.playing && !player.paused) {
            await player.play();
        }

        const successDisplay = new TextDisplayBuilder()
            .setContent(`### ${client.emoji.check || "✅"} **${label} Radio** Berhasil Dimulai!\n> Menambahkan **${originalQueued}** lagu ke antrean. Mode Autoplay aktif!`);

        const container = new ContainerBuilder().addTextDisplayComponents(successDisplay);
        await statusMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });

    } catch (err) {
        console.error(err);
        await updateStatus(`Terjadi kesalahan: ${err.message}`, true);
    }
}

module.exports = {
    name: "mood",
    category: "Music",
    aliases: ["genre", "vibe"],
    description: "Putar playlist musik berdasarkan suasana hati dan negara",
    inVoiceChannel: true,
    sameVoiceChannel: true,
    botPerms: ["EmbedLinks", "Connect", "Speak"],
    slashOptions: [],

    async slashExecute(interaction, client) {
        const interactionWrapper = {
            guild: interaction.guild,
            channel: interaction.channel,
            author: interaction.user,
            member: interaction.member,
            createdTimestamp: interaction.createdTimestamp,
            reply: async (options) => {
                if (interaction.deferred) {
                    return await interaction.editReply(options);
                } else if (interaction.replied) {
                    return await interaction.followUp(options);
                } else {
                    return await interaction.reply(options);
                }
            },
        };
        return this.execute(interactionWrapper, [], client, '/');
    },

    async execute(message, args, client, prefix) {
        const regions = [
            { label: "🇮🇩 Indonesia", value: "indonesia", description: "Lagu Pop & Hits Indonesia" },
            { label: "💃 Dangdut Koplo", value: "dangdut", description: "Dangdut, Koplo & Campursari" },
            { label: "🌐 Global", value: "global", description: "International chart-toppers" },
            { label: "🇺🇸 English", value: "english", description: "Popular English vibes" },
            { label: "🌸 J-Pop / Anime", value: "j-pop", description: "Japanese Pop & Anime hits" },
            { label: "🇰🇷 K-Pop", value: "k-pop", description: "Best of Korean pop" },
            { label: "🇮🇳 Bollywood", value: "bollywood", description: "Iconic Indian cinema tracks" },
            { label: "🇮🇳 Hindi", value: "hindi", description: "Pure Hindi music" },
            { label: "🇮🇳 Punjabi", value: "punjabi", description: "Bhangra and Punjabi beats" },
            { label: "🇪🇸 Spanish", value: "spanish", description: "Top Spanish language hits" },
            { label: "🌴 Latin", value: "latin", description: "Rhythms from Latin America" }
        ];

        const regionMenu = new StringSelectMenuBuilder()
            .setCustomId("region_select")
            .setPlaceholder("Pilih kategori bahasa / wilayah musik...")
            .addOptions(regions);

        const row = new ActionRowBuilder().addComponents(regionMenu);
        const display = new TextDisplayBuilder()
            .setContent(`### ${client.emoji.dance || "🎶"} **Music Mood & Vibe Station**\nPilih wilayah / bahasa untuk mulai mendengarkan playlist suasana hati:`);

        const container = new ContainerBuilder().addTextDisplayComponents(display);

        const msg = await message.reply({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === (message.author?.id || message.user?.id),
            time: 60000
        });

        let selectedRegion = null;

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "region_select") {
                selectedRegion = regions.find(r => r.value === interaction.values[0]);
                await interaction.deferUpdate();

                const moodOptions = [
                    { label: "☕ Chill / Santai", value: "chill", description: "Lofi & musik santai rileks" },
                    { label: "🎉 Party / Semangat", value: "party", description: "Energi booster & upbeat" },
                    { label: "💔 Sad / Galau", value: "sad", description: "Lagu galau & emosional" },
                    { label: "💖 Romantis / Cinta", value: "romance", description: "Lagu cinta & manis" }
                ];

                const moodMenu = new StringSelectMenuBuilder()
                    .setCustomId("mood_select")
                    .setPlaceholder(`Pilih suasana hati untuk ${selectedRegion.label}...`)
                    .addOptions(moodOptions);

                const moodRow = new ActionRowBuilder().addComponents(moodMenu);
                const moodDisplay = new TextDisplayBuilder()
                    .setContent(`**${selectedRegion.label} Music Station**\nBagaimana suasana hati kamu sekarang?`);

                const moodContainer = new ContainerBuilder().addTextDisplayComponents(moodDisplay);
                await msg.edit({ components: [moodContainer, moodRow] });

            } else if (interaction.customId === "mood_select") {
                const moodValue = interaction.values[0];
                await interaction.deferUpdate();

                const tagMap = {
                    indonesia: { chill: "indonesian indie", party: "indonesia pop", sad: "galau", romance: "indonesian pop", keyword: "Indonesia" },
                    dangdut: { chill: "dangdut akustik", party: "koplo", sad: "dangdut", romance: "dangdut", keyword: "Dangdut" },
                    "j-pop": { chill: "japanese lofi", party: "j-pop", sad: "j-pop sad", romance: "j-pop", keyword: "Japanese" },
                    global: { chill: "lofi", party: "party", sad: "sad", romance: "romance", keyword: "" },
                    english: { chill: "chill house", party: "pop", sad: "sad pop", romance: "lovesong", keyword: "English" },
                    hindi: { chill: "hindi", party: "hindi", sad: "hindi sad", romance: "hindi", keyword: "Hindi" },
                    bollywood: { chill: "bollywood chill", party: "bollywood dance", sad: "hindi sad", romance: "bollywood romance", keyword: "Bollywood" },
                    punjabi: { chill: "punjabi", party: "bhangra", sad: "punjabi sad", romance: "punjabi", keyword: "Punjabi" },
                    haryanvi: { chill: "haryanvi", party: "haryanvi", sad: "haryanvi", romance: "haryanvi", keyword: "Haryanvi" },
                    "k-pop": { chill: "k-pop chill", party: "k-pop", sad: "k-pop ballad", romance: "k-pop", keyword: "K-Pop" },
                    spanish: { chill: "spanish chill", party: "spanish party", sad: "spanish sad", romance: "spanish romance", keyword: "Spanish" },
                    latin: { chill: "latin chill", party: "reggaeton", sad: "latin ballad", romance: "latin romance", keyword: "Latin" }
                };

                const regionData = tagMap[selectedRegion?.value || "indonesia"];
                const finalTag = regionData[moodValue];
                const searchKeyword = regionData.keyword;
                const moodOption = interaction.component?.options?.find(o => o.value === moodValue);
                const moodLabel = moodOption ? moodOption.label : moodValue;

                await startMoodRadio(message, finalTag, `${selectedRegion.label} ${moodLabel}`, client, msg, searchKeyword, selectedRegion.value);
                collector.stop();
            }
        });
    },

    startMoodRadio
};
