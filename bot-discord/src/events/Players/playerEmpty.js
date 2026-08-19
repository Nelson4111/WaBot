const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "playerEmpty",
  run: async (client, player) => {
    const guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;

    const guildPrefix = client.db.prefixes.get(player.guildId);
    const prefix = guildPrefix?.prefix || client.prefix;

    try {
      await client.rest
        .put(`/channels/${player.voiceId}/voice-status`, {
          body: { status: `use **${prefix}play** to add songs` },
        })
        .catch(() => { });
    } catch (error) {
    }

    if (player.data.get("playerEmptyProcessed")) {
      return;
    }
    player.data.set("playerEmptyProcessed", true);

    player.data
      .get("message")
      ?.delete()
      .catch(() => null);

    if (player.queue && player.queue.previous) {
      player.queue.previous = [];
    }

    // Informasikan bahwa antrean telah selesai dan bot tetap standby di voice channel
    const textChannel = client.channels.cache.get(player.textId);
    if (textChannel) {
      const headerDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.info || "ℹ️"} Queue Ended**\n${client.emoji.blank || ""} ${client.emoji.wickarrow || "➜"} Gunakan \`${prefix}play\` untuk memutar lagu berikutnya.`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(headerDisplay);

      textChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).then((msg) => setTimeout(() => msg.delete().catch(() => null), 10000)).catch(() => null);
    }
  },
};
