const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "playerException",
  run: async (client, player, reason) => {
    try {
      client.logger.log(
        `Player Exception: ${JSON.stringify(reason)}`,
        "error"
      );

      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;
      const channel = client.channels.cache.get(player.textId);
      const currentTrack = player.queue.current;

      const cause = (reason.exception?.cause || "").toLowerCase();
      const msg = (reason.exception?.message || "").toLowerCase();
      const isRestricted =
        cause.includes("scriptextractionexception") ||
        cause.includes("allclientsfailedexception") ||
        msg.includes("requires login") ||
        msg.includes("all clients failed") ||
        msg.includes("sign in to confirm") ||
        msg.includes("age-restricted") ||
        msg.includes("unavailable") ||
        msg.includes("something went wrong");

      if (isRestricted || currentTrack) {
        if (currentTrack) {
          // Bersihkan judul lagu dari noise YouTube agar pencarian alternatif akurat
          let cleanTitle = currentTrack.title
            .replace(/[\(\[\{].*?(official|video|audio|lirik|lyrics|remix|clip|mv|hd|4k|music|feat|ft).*?[\)\]\}]/gi, '')
            .replace(/\|\s*.*$/gi, '')
            .replace(/-\s*topic$/gi, '')
            .trim();

          let cleanAuthor = (currentTrack.author || '')
            .replace(/-\s*topic$/gi, '')
            .replace(/vevo$/gi, '')
            .trim();

          const searchQuery = `${cleanTitle} ${cleanAuthor}`.trim();

          let searchResult = await client.manager.search(searchQuery, {
            engine: "ytmsearch",
            requester: currentTrack.requester,
          });

          if (!searchResult?.tracks?.length) {
            searchResult = await client.manager.search(searchQuery, {
              engine: "spsearch",
              requester: currentTrack.requester,
            });
          }

          if (!searchResult?.tracks?.length) {
            searchResult = await client.manager.search(searchQuery, {
              engine: "scsearch",
              requester: currentTrack.requester,
            });
          }

          if (searchResult?.tracks?.length > 0) {
            if (channel) {
              const fallbackDisplay = new TextDisplayBuilder()
                .setContent(`**${client.emoji.warn || "⚠️"} YouTube restricted → dialihkan ke sumber alternatif (Audio Jernih)!**`);

              const container = new ContainerBuilder()
                .addTextDisplayComponents(fallbackDisplay);

              channel
                .send({
                  components: [container],
                  flags: MessageFlags.IsComponentsV2
                })
                .catch(() => null);
            }

            player.queue.unshift(searchResult.tracks[0]);
            player.skip();
            return;
          }
        }

        if (channel) {
          const blockedDisplay = new TextDisplayBuilder()
            .setContent(
              `**${client.emoji.error || "❌"} Tidak dapat memutar lagu ini [Restriksi YouTube Login].**\n` +
              `**${client.emoji.info || "ℹ️"} Melewati ke lagu berikutnya...**`
            );

          const container = new ContainerBuilder()
            .addTextDisplayComponents(blockedDisplay);

          channel
            .send({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            })
            .catch(() => null);
        }

        if (player.queue.length > 0) {
          player.skip();
        }
        return;
      }

      if (player && !player.destroyed) {
        if (channel) {
          const errorDisplay = new TextDisplayBuilder()
            .setContent(
              `**${client.emoji.warn} Playback error occurred.**\n` +
              `**${client.emoji.info} Skipping track...**`
            );

          const container = new ContainerBuilder()
            .addTextDisplayComponents(errorDisplay);

          channel
            .send({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            })
            .catch(() => null);
        }

        if (player.queue.length > 0) {
          player.skip();
        } else {
          try {
            await player.destroy();
          } catch (e) {
            if (client.manager.players.has(player.guildId)) {
              client.manager.players.delete(player.guildId);
            }
            if (client.manager.shoukaku) {
              client.manager.shoukaku.leaveVoiceChannel(player.guildId).catch(() => null);
            }
          }
        }
      }
    } catch (err) {
      client.logger.log(
        `Error handling player exception: ${err.message}`,
        "error"
      );
    }
  },
};
