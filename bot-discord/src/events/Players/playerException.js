const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags
} = require("discord.js");
const { convertTime } = require("../../utils/convert.js");
const { resolveWithFallback } = require("../../utils/resolveTrack.js");

// Circuit Breaker: Jika suatu sumber gagal >= 5 kali dalam 10 menit, deprioritaskan / cooldown selama 30 menit
const sourceFailures = new Map();

function shouldSkipSource(source) {
  const entry = sourceFailures.get(source);
  if (!entry) return false;
  const cooldownActive = Date.now() - entry.windowStart < 30 * 60 * 1000;
  return entry.count >= 5 && cooldownActive;
}

function recordFailure(source) {
  const now = Date.now();
  const entry = sourceFailures.get(source);
  if (!entry || (now - entry.windowStart > 10 * 60 * 1000)) {
    sourceFailures.set(source, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
    sourceFailures.set(source, entry);
  }
}

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
        cause.includes("403") ||
        cause.includes("404") ||
        cause.includes("not success status code") ||
        cause.includes("scriptextractionexception") ||
        cause.includes("allclientsfailedexception") ||
        msg.includes("requires login") ||
        msg.includes("all clients failed") ||
        msg.includes("sign in to confirm") ||
        msg.includes("age-restricted") ||
        msg.includes("unavailable") ||
        msg.includes("something went wrong") ||
        msg.includes("something broke");

      // Catat kegagalan ke Circuit Breaker
      if (currentTrack?.uri?.includes("soundcloud") || cause.includes("soundcloud")) {
        recordFailure("soundcloud");
      } else if (currentTrack?.uri?.includes("youtube") || cause.includes("youtube") || isRestricted) {
        recordFailure("youtube");
      }

      const trackPosition = reason.track?.info?.position || currentTrack?.position || 0;

      if (isRestricted || currentTrack) {
        if (currentTrack) {
          // Bersihkan judul lagu dari noise
          let cleanTitle = currentTrack.title
            .replace(/[\(\[\{].*?(official|video|audio|lirik|lyrics|remix|clip|mv|hd|4k|music|feat|ft).*?[\)\]\}]/gi, '')
            .replace(/\|\s*.*$/gi, '')
            .replace(/-\s*topic$/gi, '')
            .trim();

          let cleanAuthor = (currentTrack.author || '')
            .replace(/-\s*topic$/gi, '')
            .replace(/vevo$/gi, '')
            .trim();

          const searchQuery = `${cleanTitle} ${cleanAuthor}`.trim() || currentTrack.title;

          // Fallback via resolveWithFallback
          const isSoundCloudError = currentTrack.uri?.includes('soundcloud') || cause.includes('soundcloud') || msg.includes('soundcloud');
          let preferredEngine = isSoundCloudError ? 'ytmsearch' : 'scsearch';
          if (shouldSkipSource('soundcloud') && preferredEngine === 'scsearch') {
            preferredEngine = 'ytmsearch';
          }

          const searchResult = await resolveWithFallback(
            client.manager,
            searchQuery,
            currentTrack.requester,
            preferredEngine
          );

          // Filter agar tidak memilih kembali track yang baru saja gagal/error
          const validTrack = searchResult?.tracks?.find(
            t => t.identifier !== currentTrack.identifier && t.uri !== currentTrack.uri
          ) || (searchResult?.tracks?.[0]?.identifier !== currentTrack.identifier ? searchResult?.tracks?.[0] : null);

          if (validTrack) {
            if (trackPosition > 3000) {
              player.data?.set("resumePosition", trackPosition);
            }

            if (channel) {
              const sourceLabel = validTrack.uri?.includes('soundcloud')
                ? 'SoundCloud'
                : validTrack.uri?.includes('spotify')
                ? 'Spotify'
                : 'YouTube Music';
              const posText = trackPosition > 3000 ? ` dan melanjutkan dari menit **${convertTime(trackPosition)}**` : '';
              const fallbackDisplay = new TextDisplayBuilder()
                .setContent(`**${client.emoji.warn || "⚠️"} Stream gagal/dibatasi → dialihkan otomatis ke ${sourceLabel}${posText}!**`);

              const container = new ContainerBuilder()
                .addTextDisplayComponents(fallbackDisplay);

              channel
                .send({
                  components: [container],
                  flags: MessageFlags.IsComponentsV2
                })
                .catch(() => null);
            }

            player.queue.unshift(validTrack);
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
