const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const jsonConfig = path.join(__dirname, 'config.json');

let config;
try {
  config = require(jsonConfig);
} catch (err) {
  console.error("❌ config.json not found or is invalid!", err.message);
  process.exit(1);
}

// Override / fallback dengan environment variables dari .env
if (process.env.DISCORD_TOKEN && (!config.token || config.token === "YOUR_BOT_TOKEN")) {
  config.token = process.env.DISCORD_TOKEN;
}
if (process.env.DISCORD_CLIENT_ID && (!config.clientId || config.clientId === "YOUR_CLIENT_ID")) {
  config.clientId = process.env.DISCORD_CLIENT_ID;
}
if (process.env.DISCORD_PREFIX) {
  config.prefix = process.env.DISCORD_PREFIX;
}
if (process.env.SPOTIFY_CLIENT_ID && (!config.SpotifyID || config.SpotifyID === "YOUR_SPOTIFY_ID")) {
  config.SpotifyID = process.env.SPOTIFY_CLIENT_ID;
}
if (process.env.SPOTIFY_CLIENT_SECRET && (!config.SpotifySecret || config.SpotifySecret === "YOUR_SPOTIFY_SECRET")) {
  config.SpotifySecret = process.env.SPOTIFY_CLIENT_SECRET;
}

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
  }
  switch (value) {
    case true:
    case "true":
      return true;
    default:
      return false;
  }
}

config.parseBoolean = parseBoolean;

module.exports = config;
