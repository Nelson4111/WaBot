const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const commandsPath = path.join(__dirname, "../commands");
  let totalCommands = 0;

  fs.readdirSync(commandsPath).forEach((dir) => {
    const commandFiles = fs
      .readdirSync(path.join(commandsPath, dir))
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, dir, file));

      client.commands.set(command.name, command);
      if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach((alias) => client.aliases.set(alias, command.name));
      } else if (command.aliases) {
        client.aliases.set(command.aliases, command.name);
      }

      // Daftarkan sebagai Slash Command untuk command umum/musik/fitur (maks 100 sesuai limit Discord)
      if (!command.owner && command.category !== "Owner" && client.slashCommands.size < 100) {
        const slashData = {
          ...command,
          name: command.name,
          description: command.description || `${command.name} command`,
          options: command.slashOptions || [],
          category: command.category,
          execute: command.execute,
          slashExecute: command.slashExecute,
          autocomplete: command.autocomplete,
          run: command.run,
          player: command.player,
          inVoiceChannel: command.inVoiceChannel,
          sameVoiceChannel: command.sameVoiceChannel,
          botPerms: command.botPerms,
          userPerms: command.userPerms,
          owner: false,
        };

        client.slashCommands.set(command.name, slashData);
      }

      totalCommands++;
    }
  });

  client.logger.log(`Prefix Commands Loaded: ${totalCommands}`, "cmd");
  client.logger.log(`Slash Commands Loaded: ${client.slashCommands.size}`, "cmd");
};
