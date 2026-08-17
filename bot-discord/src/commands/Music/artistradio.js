const {
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags,
    PermissionsBitField
} = require("discord.js");
const LastFM = require("../../utils/lastfm");

async function processRadio(message, artistName, client) {
    const isInteraction = !!message.applicationId;
    const author = isInteraction ? message.user : message.author;
    const channel = message.member?.voice?.channel;

    if (!channel) {
        const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.warn || "⚠️"} Kamu harus berada di Voice Channel terlebih dahulu.**`);
        const container = new ContainerBuilder().addTextDisplayComponents(display);
        const payload = { components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral };
        if (isInteraction) return await message.editReply(payload);
        else return await message.reply(payload);
    }

    let statusMsg = null;
    const reply = async (content, isError = false) => {
        const display = new TextDisplayBuilder()
            .setContent(isError ? `**${client.emoji.cross || "❌"} ${content}**` : `**${client.emoji.info || "ℹ️"} ${content}**`);
        const container = new ContainerBuilder().addTextDisplayComponents(display);
        const payload = { components: [container], flags: MessageFlags.IsComponentsV2 };

        if (isInteraction) {
            return await message.editReply(payload);
        } else {
            if (statusMsg) {
                return await statusMsg.edit(payload);
            } else {
                statusMsg = await message.reply(payload);
                return statusMsg;
            }
        }
    };

    try {
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

        let searchEngine = client.config.node_source || 'scsearch';
        try {
            const userPref = client.db.userpreferences.get(author.id);
            if (userPref?.musicSource) {
                searchEngine = userPref.musicSource;
            }
        } catch (error) {
            console.error("Error fetching user preference:", error);
        }

        await reply(`Mencari stasiun radio untuk **${artistName}**...`);

        let correctedName = artistName;
        let similarArtists = [];
        let radioTracks = [];

        try {
            const lastfm = new LastFM(client);
            const searchResult = await lastfm.searchArtist(artistName);
            if (searchResult && searchResult.name) {
                correctedName = searchResult.name;
                similarArtists = await lastfm.getSimilarArtists(correctedName, 8);
                const originalTracks = await lastfm.getTopTracks(correctedName, 4);
                if (originalTracks && originalTracks.length > 0) {
                    radioTracks.push(...originalTracks);
                }

                if (similarArtists && similarArtists.length > 0) {
                    for (const simArtist of similarArtists.slice(0, 4)) {
                        const simTracks = await lastfm.getTopTracks(simArtist, 2);
                        if (simTracks && simTracks.length > 0) {
                            radioTracks.push(...simTracks);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("[ArtistRadio] LastFM error:", err.message);
        }

        let queuedCount = 0;

        // 1. Jika LastFM menemukan track list
        if (radioTracks.length > 0) {
            for (let i = radioTracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [radioTracks[i], radioTracks[j]] = [radioTracks[j], radioTracks[i]];
            }

            await reply(`Memuat lagu untuk **${correctedName} Radio**...`);

            for (const t of radioTracks.slice(0, 6)) {
                const query = `${t.author} ${t.title}`.trim();
                let result = await client.manager.search(query, { requester: author, engine: searchEngine });
                if (!result || !result.tracks || !result.tracks.length) {
                    result = await client.manager.search(query, { requester: author, engine: 'scsearch' });
                }
                if (!result || !result.tracks || !result.tracks.length) {
                    result = await client.manager.search(query, { requester: author, engine: 'ytmsearch' });
                }

                if (result && result.tracks && result.tracks.length > 0) {
                    player.queue.add(result.tracks[0]);
                    queuedCount++;
                }
            }
        }

        // 2. Fallback jika nama artis/channel berupa channel YouTube / kreator non-LastFM
        if (queuedCount === 0) {
            await reply(`Mencari daftar lagu populer untuk **${artistName}**...`);
            const queries = [
                `${artistName} top songs`,
                `${artistName} popular tracks`,
                `${artistName} songs`,
                `${artistName}`
            ];

            for (const q of queries) {
                let searchRes = await client.manager.search(q, { requester: author, engine: searchEngine });
                if (!searchRes || !searchRes.tracks || !searchRes.tracks.length) {
                    searchRes = await client.manager.search(q, { requester: author, engine: 'scsearch' });
                }
                if (!searchRes || !searchRes.tracks || !searchRes.tracks.length) {
                    searchRes = await client.manager.search(q, { requester: author, engine: 'ytmsearch' });
                }

                if (searchRes && searchRes.tracks && searchRes.tracks.length > 0) {
                    for (const tr of searchRes.tracks.slice(0, 5)) {
                        player.queue.add(tr);
                        queuedCount++;
                    }
                    break;
                }
            }
        }

        if (queuedCount === 0) {
            return await reply(`Tidak dapat menemukan lagu yang cocok untuk artis / kreator: **${artistName}**.`, true);
        }

        player.data?.set("autoplay", true);

        if (!player.playing && !player.paused) {
            await player.play().catch((err) => {
                console.error("[ArtistRadio] player.play error:", err.message);
            });
        }

        const similarText = similarArtists.length > 0
            ? ` dan musisi serupa (${similarArtists.slice(0, 2).join(", ")})`
            : '';

        const successDisplay = new TextDisplayBuilder()
            .setContent(`### ${client.emoji.check || "✅"} **${correctedName} Radio** Berhasil Dimulai!\n> Menambahkan **${queuedCount}** lagu dari **${correctedName}**${similarText}. Mode Autoplay aktif!`);

        const container = new ContainerBuilder().addTextDisplayComponents(successDisplay);
        if (isInteraction) await message.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        else if (statusMsg) await statusMsg.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
        else await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    } catch (err) {
        console.error(err);
        await reply(`Terjadi kesalahan: ${err.message}`, true);
    }
}

module.exports = {
    name: "artistradio",
    category: "Music",
    aliases: ["ar", "radio", "artisaudio"],
    description: "Putar radio berdasarkan artis, musisi, atau kreator",
    inVoiceChannel: true,
    sameVoiceChannel: true,
    botPerms: ["EmbedLinks", "Connect", "Speak"],

    slashOptions: [
        {
            name: "artist",
            description: "Nama artis atau kreator musik untuk memulai radio",
            type: 3,
            required: true
        }
    ],

    async slashExecute(interaction, client) {
        const artistName = interaction.options.getString("artist");
        await interaction.deferReply();
        await processRadio(interaction, artistName, client);
    },

    async execute(message, args, client, prefix) {
        const artistName = args.join(" ");
        if (!artistName) {
            const display = new TextDisplayBuilder()
                .setContent(`**${client.emoji.warn || "⚠️"} Harap masukkan nama artis atau kreator.**\nContoh: \`${prefix}artistradio NOAH\` atau \`${prefix}artistradio Nana\``);
            const container = new ContainerBuilder().addTextDisplayComponents(display);
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
        await processRadio(message, artistName, client);
    },
};
