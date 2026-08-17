const {
  WebhookClient,
  ComponentType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder
} = require("discord.js");
const { player_create } = require("../../config").Webhooks;

const createButtonRows = (client, paused, player) => {
  const currentLoop = player?.loop || 'none';
  const isLoopActive = currentLoop && currentLoop !== 'none';
  const isAutoplayActive = player?.data?.get("autoplay") || false;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("previous")
      .setEmoji(client.emoji.previous || "⏮️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(paused ? "resume" : "pause")
      .setEmoji(paused ? (client.emoji.play || "▶️") : (client.emoji.pause || "⏸️"))
      .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji(client.emoji.skip || "⏭️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("stop")
      .setEmoji(client.emoji.stop || "⏹️")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("loop")
      .setEmoji("🔁")
      .setStyle(isLoopActive ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voldown")
      .setEmoji("🔉")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("volup")
      .setEmoji("🔊")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("lyrics")
      .setEmoji("🎤")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("autoplay")
      .setEmoji("♾️")
      .setStyle(isAutoplayActive ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("like")
      .setEmoji(client.emoji.like || "❤️")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
};

function formatDuration(ms) {
  if (!ms || ms === 0) return 'Unknown';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function cleanAuthorName(author) {
  if (!author) return 'Unknown Artist';

  return author.replace(/\s*-\s*Topic\s*$/i, '').trim();
}

function truncateTitle(title, maxLength = 30) {
  if (!title) return 'Unknown Title';
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
}

function getCleanThumbnail(thumbnailUrl) {
  if (!thumbnailUrl) return null;

  if (thumbnailUrl.includes('i.ytimg.com') || thumbnailUrl.includes('img.youtube.com')) {
    const videoIdMatch = thumbnailUrl.match(/vi\/([^\/]+)\//);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
    }
  }

  return thumbnailUrl;
}

function buildNowPlayingContainer(client, track, paused, player) {
  const titleDisplay = new TextDisplayBuilder()
    .setContent(`### [${truncateTitle(track.title)}](${track.uri || track.url})`);

  const currentVol = player?.volume ?? 100;
  const infoDisplay = new TextDisplayBuilder()
    .setContent(
      `> - **Author:** [${cleanAuthorName(track.author)}](${track.uri || track.url})\n` +
      `> - **Duration:** \`${formatDuration(track.length || track.duration || 0)}\`\n` +
      `> - **Volume:** \`🔊 ${currentVol}%\`\n` +
      `> - **Requester:** [${track.requester?.username}](https://discord.com/users/${track.requester?.id})`
    );

  const section = new SectionBuilder()
    .addTextDisplayComponents(titleDisplay, infoDisplay);

  if (track.thumbnail || track.artworkUrl || track.image) {
    const cleanThumbnail = getCleanThumbnail(track.thumbnail || track.artworkUrl || track.image);
    if (cleanThumbnail) {
      section.setThumbnailAccessory((thumbnail) =>
        thumbnail.setURL(cleanThumbnail)
      );
    }
  }

  const container = new ContainerBuilder()
    .addSectionComponents(section);

  const buttonRows = createButtonRows(client, paused, player);
  buttonRows.forEach(row => container.addActionRowComponents(row));

  return container;
}

async function sendNowPlaying(client, player, track) {
  try {
    const channel = client.channels.cache.get(player.textId);
    if (!channel) {
      return null;
    }

    const container = buildNowPlayingContainer(client, track, player.paused || false, player);

    try {
      const message = await channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

      player.data?.set("currentTrack", track);
      return message;
    } catch (embedError) {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function updateNowPlayingButtons(client, player, paused) {
  try {
    const nowPlayingMsg = player.data?.get("message");
    if (!nowPlayingMsg) {
      return;
    }

    const track = player.data?.get("currentTrack") || player.queue?.current;
    if (!track) {
      return;
    }

    const container = buildNowPlayingContainer(client, track, paused, player);

    await nowPlayingMsg.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    }).catch((err) => {
    });

  } catch (error) {
  }
}

async function handleButtonInteraction(interaction, player, client) {
  try {
    switch (interaction.customId) {
      case "pause":
        if (player.paused) {
          return interaction.deferUpdate();
        }

        player.pause(true);
        await updateNowPlayingButtons(client, player, true);
        await interaction.deferUpdate();
        break;

      case "resume":
        if (!player.paused) {
          return interaction.deferUpdate();
        }
        player.pause(false);
        await updateNowPlayingButtons(client, player, false);
        await interaction.deferUpdate();
        break;

      case "skip":
        if (!player.queue?.current) {
          return interaction.deferUpdate();
        }
        player.skip();
        await interaction.deferUpdate();
        break;

      case "stop":
        try {
          player.queue?.clear();
          if (player.setLoop) {
            player.setLoop('none');
          } else {
            player.loop = 'none';
          }
          const { safeDestroyPlayer } = require("../../utils/playerUtils");
          await safeDestroyPlayer(player);
          await interaction.deferUpdate();
        } catch (error) {
          await interaction.deferUpdate();
        }
        break;

      case "previous":
        const history = player.data?.get("history") || [];

        if (history.length === 0) {
          const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.info} No previous track found in history.**`);
          const container = new ContainerBuilder()
            .addTextDisplayComponents(display);
          return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
          });
        }

        const lastHistoryTrack = history[history.length - 1];

        try {
          const result = await client.manager.search(lastHistoryTrack.uri, {
            requester: interaction.user
          });

          if (result && result.tracks && result.tracks.length > 0) {
            player.queue.unshift(result.tracks[0]);
            history.pop();
            player.data?.set("history", history);
            await player.skip();
          }
        } catch (error) {
          console.error("Error loading previous track:", error);
        }

        await interaction.deferUpdate();
        break;

      case "like":
        const currentLikeTrack = player.queue?.current;
        if (!currentLikeTrack) {
          return interaction.deferUpdate();
        }

        try {
          const songs = client.db.liked.get(interaction.user.id);
          const alreadyLiked = songs.some(song => song.url === (currentLikeTrack.uri || currentLikeTrack.url));

          if (alreadyLiked) {
            const display = new TextDisplayBuilder()
              .setContent(`**${client.emoji.info} \`${currentLikeTrack.title}\` is already in your favourite list.**`);
            const container = new ContainerBuilder()
              .addTextDisplayComponents(display);
            return interaction.reply({
              components: [container],
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
          } else {
            songs.push({
              title: currentLikeTrack.title,
              url: currentLikeTrack.uri || currentLikeTrack.url,
              duration: currentLikeTrack.length || currentLikeTrack.duration,
              thumbnail: currentLikeTrack.thumbnail || currentLikeTrack.artworkUrl || currentLikeTrack.image,
              author: currentLikeTrack.author,
              addedAt: new Date().toISOString()
            });

            client.db.liked.set(interaction.user.id, songs);

            const display = new TextDisplayBuilder()
              .setContent(`**${client.emoji.check} Added \`${currentLikeTrack.title}\` to your favourite list.**`);
            const container = new ContainerBuilder()
              .addTextDisplayComponents(display);
            return interaction.reply({
              components: [container],
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
          }
        } catch (dbError) {
          console.error('[Like Button] Error:', dbError);
          const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross} Failed to save song to favorites. Please try again.**`);
          const container = new ContainerBuilder()
            .addTextDisplayComponents(display);
          return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
          }).catch(() => { });
        }
        break;

      case "voldown":
        const curVolDown = player.volume || 100;
        const newVolDown = Math.max(10, curVolDown - 10);
        player.setVolume(newVolDown);
        await updateNowPlayingButtons(client, player, player.paused || false);
        return interaction.deferUpdate().catch(() => { });

      case "volup":
        const curVolUp = player.volume || 100;
        const newVolUp = Math.min(150, curVolUp + 10);
        player.setVolume(newVolUp);
        await updateNowPlayingButtons(client, player, player.paused || false);
        return interaction.deferUpdate().catch(() => { });

      case "loop":
        const currentLoop = player.loop || 'none';
        let nextLoop = 'none';
        let loopLabel = 'Mati (Off)';
        if (currentLoop === 'none') {
          nextLoop = 'track';
          loopLabel = 'Ulang 1 Lagu (Track)';
        } else if (currentLoop === 'track') {
          nextLoop = 'queue';
          loopLabel = 'Ulang Seluruh Antrean (Queue)';
        } else {
          nextLoop = 'none';
          loopLabel = 'Mati (Off)';
        }
        if (player.setLoop) player.setLoop(nextLoop);
        else player.loop = nextLoop;
        await updateNowPlayingButtons(client, player, player.paused || false);
        const displayLoop = new TextDisplayBuilder()
          .setContent(`🔁 Mode Loop: \`${loopLabel}\``);
        const containerLoop = new ContainerBuilder().addTextDisplayComponents(displayLoop);
        return interaction.reply({
          components: [containerLoop],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });

      case "autoplay":
        const currentAutoplay = player.data?.get("autoplay") || false;
        const newAutoplay = !currentAutoplay;
        player.data?.set("autoplay", newAutoplay);
        await updateNowPlayingButtons(client, player, player.paused || false);
        const displayAutoplay = new TextDisplayBuilder()
          .setContent(`♾️ Mode Autoplay: \`${newAutoplay ? "Aktif (Musik Nonstop)" : "Nonaktif"}\``);
        const containerAutoplay = new ContainerBuilder().addTextDisplayComponents(displayAutoplay);
        return interaction.reply({
          components: [containerAutoplay],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });

      case "lyrics":
        const currentTrack = player.queue?.current || player.data?.get("currentTrack");
        if (!currentTrack) {
          const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} Tidak ada lagu yang sedang diputar.**`);
          const container = new ContainerBuilder().addTextDisplayComponents(display);
          return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
          });
        }
        await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 });
        try {
          const lyricsCommand = require("../../commands/Music/lyrics");
          let lyricsResult = null;
          if (lyricsCommand.fetchSongLyrics) {
            lyricsResult = await lyricsCommand.fetchSongLyrics(currentTrack.title, currentTrack.author);
          }
          if (!lyricsResult || !lyricsResult.lyrics) {
            const display = new TextDisplayBuilder()
              .setContent(`**${client.emoji.info || "ℹ️"} Lirik tidak ditemukan untuk \`${currentTrack.title}\`.**`);
            const container = new ContainerBuilder().addTextDisplayComponents(display);
            return interaction.editReply({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });
          }

          const hasSynced = lyricsResult.synced && lyricsResult.synced.length > 0;
          const syncedLines = hasSynced && lyricsCommand.parseSyncedLyrics ? lyricsCommand.parseSyncedLyrics(lyricsResult.synced) : null;

          if (syncedLines && syncedLines.length > 0 && lyricsCommand.showLiveSyncLyrics) {
            const loadingDisplay = new TextDisplayBuilder()
              .setContent(`**${client.emoji.check || "✅"} Memuat Live Sync Lyrics...**`);
            const loadingContainer = new ContainerBuilder().addTextDisplayComponents(loadingDisplay);
            const sentMsg = await interaction.editReply({
              components: [loadingContainer],
              flags: MessageFlags.IsComponentsV2
            });
            return await lyricsCommand.showLiveSyncLyrics(client, sentMsg, currentTrack, syncedLines, player, lyricsResult.source, interaction.user.id, interaction.guild.id);
          } else if (lyricsCommand.showStaticLyrics) {
            const loadingDisplay = new TextDisplayBuilder()
              .setContent(`**${client.emoji.check || "✅"} Memuat Lirik...**`);
            const loadingContainer = new ContainerBuilder().addTextDisplayComponents(loadingDisplay);
            const sentMsg = await interaction.editReply({
              components: [loadingContainer],
              flags: MessageFlags.IsComponentsV2
            });
            return await lyricsCommand.showStaticLyrics(client, sentMsg, currentTrack, lyricsResult.lyrics, lyricsResult.source, interaction.user.id);
          } else {
            let lirikText = lyricsResult.lyrics;
            if (lirikText.length > 3800) {
              lirikText = lirikText.substring(0, 3800) + '\n\n_(Lirik terlalu panjang untuk ditampilkan semua)_';
            }
            const header = new TextDisplayBuilder()
              .setContent(`### 🎤 Lirik Lagu: [${truncateTitle(currentTrack.title, 40)}](${currentTrack.uri || currentTrack.url})\n> **Artis:** ${cleanAuthorName(currentTrack.author)} • **Sumber:** ${lyricsResult.source || "Lyrics"}`);
            const body = new TextDisplayBuilder().setContent(lirikText);
            const container = new ContainerBuilder()
              .addTextDisplayComponents(header)
              .addSeparatorComponents(new SeparatorBuilder())
              .addTextDisplayComponents(body);
            return interaction.editReply({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });
          }
        } catch (err) {
          const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} Gagal mencari lirik: ${err.message}**`);
          const container = new ContainerBuilder().addTextDisplayComponents(display);
          return interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

      default:
        const unknownDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.cross} Unknown button interaction.**`);

        const unknownContainer = new ContainerBuilder()
          .addTextDisplayComponents(unknownDisplay);

        await interaction.editReply({
          components: [unknownContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;
    }
  } catch (error) {
    const display = new TextDisplayBuilder()
      .setContent(`**${client.emoji.cross} An error occurred while processing your request.**`);
    const container = new ContainerBuilder()
      .addTextDisplayComponents(display);
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });
      } catch (replyError) {
      }
    } else {
      try {
        await interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      } catch (editError) {
      }
    }
  }
}

function setupMessageCollector(client, player, message) {
  try {
    const track = player.queue?.current;
    const collector = message.createMessageComponentCollector({
      time: Math.min(track?.length || track?.duration || 600000, 900000),
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (interaction) => {
      try {
        if (!interaction.member?.voice?.channelId || interaction.member.voice.channelId !== player.voiceId) {
          const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.warn} You must be in the same voice channel as the bot.**`);
          const container = new ContainerBuilder()
            .addTextDisplayComponents(display);
          return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
          });
        }

        await handleButtonInteraction(interaction, player, client);

      } catch (interactionError) {
        if (!interaction.replied && !interaction.deferred) {
          const display = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross} An error occurred while processing your request.**`);
          const container = new ContainerBuilder()
            .addTextDisplayComponents(display);
          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
          }).catch(() => { });
        }
      }
    });

    collector.on("end", (collected, reason) => {
    });

  } catch (error) {
  }
}

async function updateVoiceStatus(client, player, track) {
  try {
    if (!player.voiceId) {
      return;
    }

    if (player.state === 'DESTROYED' || player.state === 'DISCONNECTED') {
      return;
    }

    await client.rest
      .put(`/channels/${player.voiceId}/voice-status`, {
        body: { status: `${client.emoji.dance} Playing **${track.title}**` },
      })
      .catch((err) => {
        console.error('[VoiceStatus] Failed to update:', err.message || err);
      });
  } catch (error) {
    console.error('[VoiceStatus] Exception:', error.message || error);
  }
}

module.exports = {
  name: "playerStart",
  run: async (client, player, track) => {
    try {
      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) {
        return;
      }

      if (!player.data?.get("playerStarted")) {
        player.data?.set("playerStarted", true);

        if (player_create && typeof player_create === 'string' && player_create.startsWith('http')) {
          try {
            const webhook = new WebhookClient({ url: player_create });

            const embed = new EmbedBuilder()
              .setColor(client.color)
              .setAuthor({
                name: `Player Started`,
                iconURL: client.user.displayAvatarURL()
              })
              .setDescription(`**Server:** \`${guild.name}\`\n**ID:** \`${player.guildId}\``);

            webhook.send({ embeds: [embed] }).catch(() => { });
          } catch (_) {}
        }
      }

      const currentTrack = track || player.queue?.current;

      if (currentTrack) {
        await handleTrackStart(client, player, currentTrack);
      }

    } catch (error) {
    }
  },
};

async function handleTrackStart(client, player, track) {
  try {
    if (!track) {
      return;
    }

    player.data?.delete("playerEmptyProcessed");

    const oldMessage = player.data?.get("message");
    if (oldMessage) {
      oldMessage.delete().catch(() => { });
    }

    if (client.voiceHealthMonitor) {
      client.voiceHealthMonitor.updateActivity(player.guildId);
    }

    await updateVoiceStatus(client, player, track);

    const message = await sendNowPlaying(client, player, track);

    if (!message) {
      return;
    }

    player.data?.set("message", message);

    const resumePos = player.data?.get("resumePosition");
    if (resumePos && resumePos > 3000) {
      player.data?.delete("resumePosition");
      setTimeout(async () => {
        try {
          if (player && !player.destroyed && player.seek) {
            await player.seek(resumePos);
          }
        } catch (_) {}
      }, 1000);
    }

    setupMessageCollector(client, player, message);

  } catch (error) {
    console.error('[HandleTrackStart] Error:', error);
  }
}
module.exports.updateNowPlayingButtons = updateNowPlayingButtons;
