const {
  WebhookClient,
  EmbedBuilder
} = require("discord.js");
const {
  Webhooks: { player_delete },
} = require("../../config.js");

module.exports = {
  name: "playerDestroy",
  run: async (client, player) => {
    try {
      player.destroyed = true;

      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;

      const name = guild.name;
      if (player.voiceId) {
        try {
          await client.rest.put(`/channels/${player.voiceId}/voice-status`, { body: { status: `` } });
        } catch (err) {
        }
      }

      if (player_delete && typeof player_delete === 'string' && player_delete.startsWith('http')) {
        try {
          const web1 = new WebhookClient({ url: player_delete });
          const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
              name: `Player Destroyed`,
              iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(`**Id:** \`${guild.id}\`\n**Name:** \`${name ? name : 'Unknown'}\``);
          await web1.send({ embeds: [embed] }).catch(() => null);
          if (typeof web1.destroy === 'function') web1.destroy();
        } catch (_) {}
      }

      client.logger.log(`Player Destroy in ${name ? name : 'Unknown'} [ ${player.guildId} ]`, "log");

      if (player.data.get("message") && player.data.get("message").deletable) {
        await player.data.get("message").delete().catch(() => null);
      }

      if (player.queue && player.queue.previous) {
        player.queue.previous = [];
      }

      if (client.voiceHealthMonitor) {
        client.voiceHealthMonitor.stopMonitoring(player.guildId);
      }

      player.data.clear();
    } catch (err) {
      client.logger.log(`Error in player destroy: ${err.message}`, "error");
    }
  },
};
