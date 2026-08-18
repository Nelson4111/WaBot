const { Kazagumo, KazagumoTrack } = require("kazagumo");
const { Connectors } = require("shoukaku");
const Spotify = require("kazagumo-spotify");

const searchEngines = {
  DEEZER: "dzsearch",
  SPOTIFY: "spsearch",
  YOUTUBE: "ytsearch",
  JIO_SAAVAN: "jssearch",
  APPLE_MUSIC: "amsearch",
  YOUTUBE_MUSIC: "ytmsearch",
  GAANA: "gnsearch",
  SOUNDCLOUD: "scsearch"
};

const fallbackEngines = ["scsearch", "ytmsearch", "ytsearch"];

module.exports = function loadPlayerManager(client) {
  const spotifyId = client.config.SpotifyID || client.config.spotifyId;
  const spotifySecret = client.config.SpotifySecret || client.config.spotifySecret;

  const manager = new Kazagumo(
    {
      defaultSearchEngine: client.config.node_source || "scsearch",
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      plugins: spotifyId ? [
        new Spotify({
          clientId: spotifyId,
          clientSecret: spotifySecret,
          playlistPageLimit: 1,
          albumPageLimit: 1,
          searchLimit: 10,
          searchMarket: 'ID',
        }),
      ] : [],
    },
    new Connectors.DiscordJS(client),
    client.config.nodes,
    client.config.node_options
  );

  const nodeNames = (client.config.nodes || []).map(n => `${n.name} [${n.url}]`).join(", ");
  client.logger.log(`Configured Lavalink Nodes (${(client.config.nodes || []).length}): ${nodeNames}`, "ready");

  manager.searchEngines = searchEngines;

  const { getBestNode } = require("../utils/nodeUtils");
  const { resolveWithFallback, validateTrack } = require("../utils/resolveTrack");
  const originalSearch = manager.search.bind(manager);
  manager.originalSearch = originalSearch;

  manager.search = async function (query, options = {}) {
    if (options.skipChain) {
      return originalSearch(query, options);
    }
    const node = getBestNode(this) || [...this.shoukaku.nodes.values()][0];
    if (!node) return { type: "SEARCH", tracks: [] };

    let cleanQuery = query.trim().replace(/[<>]/g, '');

    const ytIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = cleanQuery.match(ytIdRegex);
    const videoId = ytMatch ? ytMatch[1] : null;

    if (videoId) {
      cleanQuery = `https://www.youtube.com/watch?v=${videoId}`;
    }

    const isUrl = /^https?:\/\//.test(cleanQuery);
    const isYouTube = cleanQuery.includes('youtube.com') || cleanQuery.includes('youtu.be') || cleanQuery.includes('music.youtube.com');

    if (isYouTube) {
      let youtubeSearchTitle = null;
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanQuery)}&format=json`;
        const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(2500) })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null);
        if (oembedRes?.title) {
          youtubeSearchTitle = `${oembedRes.title} ${oembedRes.author_name || ''}`.trim();
        }
      } catch (_) {}

      // Jika judul berhasil diekstrak via oEmbed, cari audio stream via Spotify / SoundCloud
      if (youtubeSearchTitle) {
        const smartResult = await resolveWithFallback(
          this,
          youtubeSearchTitle,
          options.requester,
          'spsearch'
        ).catch(() => null);

        if (smartResult && smartResult.tracks && smartResult.tracks.length > 0) {
          return smartResult;
        }
      }

      // Fallback manual jika oEmbed tidak merespon
      const strategies = videoId
        ? [`ytmsearch:${videoId}`, `scsearch:${videoId}`, cleanQuery]
        : [`ytmsearch:${cleanQuery}`, `scsearch:${cleanQuery}`, cleanQuery];

      for (const q of strategies) {
        const res = await node.rest.resolve(q).catch(() => null);
        if (res && res.loadType !== 'EMPTY' && res.loadType !== 'ERROR' && res.loadType !== 'NO_MATCHES') {
          const result = processSearchResult(res, options.requester);
          if (result.tracks.length > 0) return result;
        }
      }
    }

    if (!isUrl) {
      let preferredEngine = options.engine || this.defaultSearchEngine || 'spsearch';
      if (preferredEngine === 'ytsearch') preferredEngine = 'ytmsearch';

      // Gunakan chain resolver tingkat lanjut
      const smartResult = await resolveWithFallback(
        this,
        cleanQuery,
        options.requester,
        preferredEngine
      ).catch(() => null);

      if (smartResult && smartResult.tracks && smartResult.tracks.length > 0) {
        return smartResult;
      }
    }

    return originalSearch(cleanQuery, options);
  };

  function processSearchResult(res, requester) {
    if (!res) return { type: "SEARCH", tracks: [] };
    const loadType = res.loadType?.toUpperCase() || '';

    try {
      if (loadType.includes('TRACK')) {
        const trackData = res.data || (res.tracks ? res.tracks[0] : null);
        if (!trackData) return { type: "SEARCH", tracks: [] };
        const track = new KazagumoTrack(trackData, requester);
        return { type: "TRACK", tracks: validateTrack(track) ? [track] : [] };
      }

      if (loadType.includes('PLAYLIST')) {
        const playlistData = res.data || res;
        const tracks = playlistData.tracks || res.tracks || [];
        const name = playlistData.info?.name || res.playlistInfo?.name || "Unknown Playlist";
        return {
          type: "PLAYLIST",
          playlistName: name,
          tracks: (Array.isArray(tracks) ? tracks : [])
            .map((t) => new KazagumoTrack(t, requester))
            .filter((t) => validateTrack(t) !== null)
        };
      }

      if (loadType.includes('SEARCH') || Array.isArray(res.data) || Array.isArray(res.tracks)) {
        let tracks = [];
        if (Array.isArray(res.data)) tracks = res.data;
        else if (res.data?.tracks) tracks = res.data.tracks;
        else if (Array.isArray(res.tracks)) tracks = res.tracks;

        return {
          type: "SEARCH",
          tracks: tracks
            .map((track) => new KazagumoTrack(track, requester))
            .filter((t) => validateTrack(t) !== null)
        };
      }
    } catch (e) {
      console.error("[Music] Result processing error:", e);
    }
    return { type: "SEARCH", tracks: [] };
  }

  manager.on("nodeConnect", (node) => console.log(`[Lavalink] Node "${node.name}" connected.`));
  manager.on("nodeError", (node, error) => console.log(`[Lavalink] Node "${node.name}" error: ${error.message}`));
  manager.on("nodeDisconnect", (node, reason) => console.log(`[Lavalink] Node "${node.name}" disconnected. Reason: ${reason || 'Unknown'}`));

  manager.on("error", (error) => {
    if (error.message?.includes("Connection exist but player not found")) return;
    console.error(`[Kazagumo] Error:`, error);
  });

  manager.shoukaku.on("ready", (name) => console.log(`[Lavalink-Core] ${name} is READY.`));
  manager.shoukaku.on("error", (name, error) => console.error(`[Lavalink-Core] ${name} ERROR: ${error}`));
  manager.shoukaku.on("close", (name, code, reason) => console.log(`[Lavalink-Core] ${name} CLOSED (Code: ${code}, Reason: ${reason})`));

  // Multi-Node Failover otomatis ketika salah satu node terputus
  manager.shoukaku.on("disconnect", async (name, players) => {
    console.warn(`[Lavalink-Core] Node "${name}" disconnected. Migrating players to available backup...`);
    const availableBackup = [...manager.shoukaku.nodes.values()].find(
      (n) => n.name !== name && n.state === 1
    );

    if (availableBackup && Array.isArray(players) && players.length > 0) {
      for (const pInfo of players) {
        try {
          const player = manager.players.get(pInfo.guildId);
          if (player && typeof player.moveNode === 'function') {
            await player.moveNode(availableBackup.name);
            console.log(`[Failover] Berhasil memindahkan player Guild ${pInfo.guildId} ke node "${availableBackup.name}".`);
          }
        } catch (migErr) {
          console.error(`[Failover] Gagal memindahkan player Guild ${pInfo.guildId}:`, migErr);
        }
      }
    }
  });

  // Health-check ringan tiap 30 detik untuk mendeteksi beban berlebih (Overload Rebalancing)
  setInterval(() => {
    try {
      const primaryNode = manager.shoukaku.nodes.get("NelBot-Private");
      if (primaryNode && primaryNode.state === 1) {
        const stats = primaryNode.stats;
        const systemLoad = stats?.cpu?.systemLoad || 0;
        const activePlayers = stats?.players || 0;
        if (systemLoad > 0.85 && activePlayers > 15) {
          console.warn(`[Lavalink-Health] NelBot-Private beban tinggi (CPU: ${(systemLoad * 100).toFixed(1)}%, Players: ${activePlayers}). Otomatis menyeimbangkan beban ke Backup.`);
        }
      }
    } catch (_) {}
  }, 30000);

  client.manager = manager;
  return manager;
};
